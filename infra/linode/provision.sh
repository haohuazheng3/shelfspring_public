#!/usr/bin/env bash
# Run only through bootstrap-infra.yml on the EXISTING new ShelfSpring host.
# Does not create/delete/rebuild Linodes, allocate IPv6, clone the old repo or start Apple polling.
# Usage: provision.sh ARCHIVE INPUT_JSON COMMIT_SHA START_FEED START_PREVIEW_FEED REPAIR_HISTORY
set -euo pipefail
umask 077
[ "$(id -u)" = 0 ] || { echo "Run as root" >&2; exit 1; }
ip -4 -o addr show scope global | awk '{print $4}' | cut -d/ -f1 | grep -Fxq "$(cat /etc/shelfspring-host-ip)" || { echo "Refusing an unapproved bootstrap host" >&2; exit 1; }
[ -z "${PEER_IP:-}" ] || { echo "No peer is permitted for this standalone database" >&2; exit 1; }
archive=${1:?archive required}; inputs=${2:?input JSON required}; commit=${3:?commit required}; start_feed=${4:-false}; start_preview_feed=${5:-false}
repair_history=${6:-false}
[[ "$commit" =~ ^[0-9a-f]{40}$ ]] || { echo "A full GitHub commit SHA is required" >&2; exit 1; }
[ "$start_feed" = true ] || [ "$start_feed" = false ] || exit 1
[ "$start_preview_feed" = true ] || [ "$start_preview_feed" = false ] || exit 1
[ "$start_preview_feed" = false ] || [ "$start_feed" = true ] || { echo "Preview feed requires the production feed" >&2; exit 1; }
[ "$repair_history" = true ] || [ "$repair_history" = false ] || exit 1
[ "$repair_history" = false ] || [ "$start_feed" = true ] || { echo "History repair requires the production feed" >&2; exit 1; }
root=/opt/shelfspring
release="$root/releases/$commit"
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ca-certificates curl xz-utils ufw fail2ban unattended-upgrades python3 >/dev/null
hostnamectl set-hostname shelfspring-db
install -d -m 755 "$root" "$root/releases"
id poller >/dev/null 2>&1 || useradd --system --home-dir "$root" --shell /usr/sbin/nologin poller
if [ ! -x /usr/local/bin/node ] || ! /usr/local/bin/node -e 'if(Number(process.versions.node.split(".")[0])!==24)process.exit(1)'; then
  # Pin the runtime used by CI; verify its published SHA256 before extracting it.
  node_version=v24.21.0
  arch=$(dpkg --print-architecture)
  case "$arch" in amd64) node_arch=x64;; arm64) node_arch=arm64;; *) echo "Unsupported architecture" >&2; exit 1;; esac
  work=$(mktemp -d)
  curl -fsS "https://nodejs.org/dist/$node_version/SHASUMS256.txt" -o "$work/SHASUMS256.txt"
  curl -fsS "https://nodejs.org/dist/$node_version/node-$node_version-linux-$node_arch.tar.xz" -o "$work/node-$node_version-linux-$node_arch.tar.xz"
  (cd "$work"; grep " node-$node_version-linux-$node_arch.tar.xz$" SHASUMS256.txt | sha256sum -c - >/dev/null)
  tar -xJf "$work/node-$node_version-linux-$node_arch.tar.xz" --strip-components=1 -C /usr/local
  rm -rf "$work"
fi
install -d -m 755 "$release"
tar -xzf "$archive" -C "$release" --no-same-owner
[ -f "$release/poller/source-sync.ts" ] && [ -f "$release/drizzle/0015_inventory_source.sql" ] || { echo "Archive is missing the source feed implementation" >&2; exit 1; }
chmod 755 "$release" "$release/infra" "$release/infra/linode" "$release/scripts" "$release/scripts/runtime"
# Do not disturb an existing feed until the new release has installed successfully.
(cd "$release"; /usr/local/bin/npm ci --no-audit --no-fund --ignore-scripts >/dev/null)
systemctl stop shelfspring-poller 2>/dev/null || true
systemctl disable --now shelfspring-preview-feed 2>/dev/null || true
bash "$release/infra/linode/postgres.sh"
python3 "$release/scripts/runtime/write-source-env.py" "$inputs" "$root/poller.env" "$commit"
chmod 600 "$root/poller.env"
rm -f "$inputs"
export NODE_OPTIONS=--max-old-space-size=384
(cd "$release"; DATABASE_URL="$(cat /root/pg-secrets/shelfspring-local.url)" /usr/local/bin/node --env-file="$root/poller.env" scripts/migrate.mjs)
(cd "$release"; /usr/local/bin/node --env-file="$root/poller.env" --import tsx scripts/seed.ts)
if [ "$start_feed" = true ]; then
  (cd "$release"; /usr/local/bin/node --env-file="$root/poller.env" --import tsx scripts/import-inventory-history.ts)
  if [ "$repair_history" = true ]; then
    (cd "$release"; INVENTORY_HISTORY_REPAIR_ALLOWED=1 /usr/local/bin/node --env-file="$root/poller.env" --import tsx scripts/import-inventory-history.ts --repair)
  fi
fi

cat > /etc/systemd/system/shelfspring-poller.service <<'UNIT'
[Unit]
Description=ShelfSpring read-only inventory feed
After=network-online.target postgresql.service
Wants=network-online.target
StartLimitIntervalSec=0
[Service]
Type=simple
User=poller
WorkingDirectory=/opt/shelfspring/app
EnvironmentFile=/opt/shelfspring/poller.env
Environment=NODE_OPTIONS=--max-old-space-size=320
ExecStart=/usr/local/bin/node --import tsx poller/source-sync.ts
Restart=always
RestartSec=5
TimeoutStopSec=45
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
LimitNOFILE=8192
[Install]
WantedBy=multi-user.target
UNIT
# No anyip or original poller entry may start on the dedicated destination host.
systemctl disable --now shelfspring-anyip.service shelfspring-autoupdate.timer 2>/dev/null || true
chown -R root:root "$release"
chmod -R a+rX "$release"
ln -sfn "$release" "$root/app.next"
mv -Tf "$root/app.next" "$root/app"
systemctl daemon-reload
cat > /etc/systemd/system/shelfspring-probe.service <<'UNIT'
[Unit]
Description=Full ShelfSpring health probe through the owner mail worker
After=network-online.target
[Service]
Type=oneshot
ExecStart=/usr/bin/python3 /opt/shelfspring/app/scripts/runtime/probe-mail-worker.py
UNIT
cat > /etc/systemd/system/shelfspring-probe.timer <<'UNIT'
[Unit]
Description=Probe full ShelfSpring health every five minutes
[Timer]
OnBootSec=3min
OnUnitActiveSec=5min
RandomizedDelaySec=10
[Install]
WantedBy=timers.target
UNIT
systemctl daemon-reload
if [ "$start_feed" = true ]; then
  systemctl enable -q shelfspring-poller
  systemctl restart shelfspring-poller
  (cd "$release"; /usr/local/bin/node --env-file="$root/poller.env" --import tsx scripts/runtime/source-sync-gate.ts)
  if [ "$start_preview_feed" = true ]; then bash "$release/infra/linode/preview-feed.sh" "$release" "$commit" "$repair_history"; fi
  systemctl enable -q --now shelfspring-probe.timer
else
  systemctl disable --now shelfspring-poller 2>/dev/null || true
  systemctl disable --now shelfspring-probe.timer 2>/dev/null || true
  echo "Database and catalog ready; inventory feed remains stopped"
fi
ufw allow OpenSSH >/dev/null
ufw allow 5432/tcp >/dev/null
ufw --force enable >/dev/null
install -d -m 755 /etc/ssh/sshd_config.d
printf 'PasswordAuthentication no\nKbdInteractiveAuthentication no\nPermitRootLogin prohibit-password\n' > /etc/ssh/sshd_config.d/10-shelfspring.conf
sshd -t
systemctl reload ssh
printf 'ShelfSpring standalone infrastructure ready at commit %s (feed=%s)\n' "$commit" "$start_feed"
