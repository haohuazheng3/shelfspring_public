#!/usr/bin/env bash
# Called after the production feed startup gate, only on the existing NEW host.
# Usage: preview-feed.sh RELEASE_PATH COMMIT_SHA REPAIR_HISTORY; no production env is accepted.
set -euo pipefail
umask 077
[ "$(id -u)" = 0 ] || { echo "Run as root" >&2; exit 1; }
ip -4 -o addr show scope global | awk '{print $4}' | cut -d/ -f1 | grep -Fxq "$(cat /etc/shelfspring-host-ip)" || { echo "Refusing an unapproved preview host" >&2; exit 1; }
release=${1:?release required}; commit=${2:?commit required}
repair_history=${3:-false}
[ "$repair_history" = true ] || [ "$repair_history" = false ] || exit 1
[[ "$commit" =~ ^[0-9a-f]{40}$ ]] && [ "$release" = "/opt/shelfspring/releases/$commit" ] && [ "$(readlink -f "$release")" = "$release" ] || { echo "Unexpected preview release" >&2; exit 1; }
root=/opt/shelfspring
secrets=/root/pg-secrets
systemctl stop shelfspring-preview-feed 2>/dev/null || true
# Confirm the new local production feed is running; never connect to the original source.
[ "$(sudo -u postgres psql -d shelfspring -qtAc "SELECT count(*) FROM poller_state WHERE key = 'inventory-source' AND value->>'mode' = 'source-sync' AND (value->>'error') IS NULL AND (value->>'at')::timestamptz > now() - interval '150 seconds'")" = 1 ] || { echo "The local production inventory feed is not ready" >&2; exit 1; }
sudo -u postgres psql -X -v ON_ERROR_STOP=1 -d shelfspring -f "$release/infra/linode/preview-inventory-reader.sql" >/dev/null
password_file="$secrets/shelfspring_inventory_reader.pw"
if [ ! -s "$password_file" ]; then
  # Avoid pipefail/SIGPIPE truncation of an openssl random stream.
  python3 - "$password_file" <<'PY'
import os, secrets, string, sys
fd = os.open(sys.argv[1], os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
with os.fdopen(fd, 'w') as handle:
    handle.write(''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(40)))
PY
fi
chmod 600 "$password_file"
printf "ALTER ROLE shelfspring_inventory_reader PASSWORD :'pw';\n" | sudo -u postgres psql -X -v ON_ERROR_STOP=1 -q -v pw="$(cat "$password_file")" >/dev/null
python3 "$release/scripts/runtime/write-preview-env.py" "$root/preview-feed.env" "$commit"
id preview-feed >/dev/null 2>&1 || useradd --system --home-dir "$root" --shell /usr/sbin/nologin preview-feed
# These commands have no inherited production app/notification variables. The target owner is preview only.
run_preview() { (cd "$release"; env -i PATH=/usr/local/bin:/usr/bin:/bin NODE_OPTIONS=--max-old-space-size=256 /usr/local/bin/node --env-file="$root/preview-feed.env" "$@"); }
run_preview scripts/migrate.mjs
run_preview --import tsx scripts/seed.ts
run_preview --import tsx scripts/import-inventory-history.ts
if [ "$repair_history" = true ]; then
  (cd "$release"; env -i PATH=/usr/local/bin:/usr/bin:/bin NODE_OPTIONS=--max-old-space-size=256 INVENTORY_HISTORY_REPAIR_ALLOWED=1 \
    /usr/local/bin/node --env-file="$root/preview-feed.env" --import tsx scripts/import-inventory-history.ts --repair)
fi
cat > /etc/systemd/system/shelfspring-preview-feed.service <<'UNIT'
[Unit]
Description=ShelfSpring preview public inventory copy (notifications disabled)
After=postgresql.service shelfspring-poller.service
StartLimitIntervalSec=0
[Service]
Type=simple
User=preview-feed
WorkingDirectory=/opt/shelfspring/app
EnvironmentFile=/opt/shelfspring/preview-feed.env
Environment=NODE_OPTIONS=--max-old-space-size=192
ExecStart=/usr/local/bin/node --import tsx poller/source-sync.ts
Restart=always
RestartSec=30
TimeoutStopSec=45
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
OOMScoreAdjust=700
MemoryHigh=192M
MemoryMax=256M
CPUWeight=10
LimitNOFILE=1024
[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable -q shelfspring-preview-feed
systemctl restart shelfspring-preview-feed
if ! run_preview --import tsx scripts/runtime/source-sync-gate.ts; then
  systemctl disable --now shelfspring-preview-feed
  echo "Preview inventory startup gate failed; feed stopped" >&2
  exit 1
fi
printf 'Preview inventory ready at commit %s; local public stock only; notifications disabled\n' "$commit"
