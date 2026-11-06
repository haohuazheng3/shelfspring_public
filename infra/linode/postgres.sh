#!/usr/bin/env bash
# Standalone destination PostgreSQL 17 on the new ShelfSpring 1 GB host.
# Keeps the copied mature TLS, memory, OOM and reserved-connection settings. Idempotent reruns
# preserve passwords, certificates and data. Only bootstrap-infra.yml invokes this script.
# Leaves root-only URLs in /root/pg-secrets and CA in /root/pg-ca. No source/peer/replica writes.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
# This fork provisions ONLY the newly authorized standalone host. The source cluster is never a target.
[ "$(id -u)" = 0 ] || { echo "Run as root on the ShelfSpring host" >&2; exit 1; }
ip -4 -o addr show scope global | awk '{print $4}' | cut -d/ -f1 | grep -Fxq "$(cat /etc/shelfspring-host-ip)" || { echo "Refusing an unapproved database host" >&2; exit 1; }
[ -z "${PEER_IP:-}" ] && [ "${ROLE:-primary}" = primary ] || { echo "ShelfSpring uses a standalone database" >&2; exit 1; }
# Write stdin to $1 only if it differs; succeeds (0) when the file changed.
put() { local t; t=$(mktemp); cat > "$t"; if cmp -s "$t" "$1"; then rm -f "$t"; return 1; fi; install -m 644 "$t" "$1"; rm -f "$t"; }
PGV=17
DBS=(shelfspring shelfspring_preview)
SECRETS=/root/pg-secrets
CA=/root/pg-ca
CONF=/etc/postgresql/$PGV/main
IP4=$(ip -4 -o addr show scope global | awk '{print $4}' | cut -d/ -f1 | head -1)
HOST_LABEL=shelfspring-db

# Postgres 17 from the PGDG repository: Ubuntu 24.04 ships 16, and pg_dump must be at least the server
# version of any inventory database whose history is copied into this host.
if [ ! -x /usr/lib/postgresql/$PGV/bin/postgres ]; then
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql-common ca-certificates curl >/dev/null
  /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y >/dev/null
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql-$PGV >/dev/null
fi

# The poller (~180 MB) and Postgres share 1 GB of RAM: a second, larger swap file as a cushion.
if [ ! -f /swapfile ]; then
  fallocate -l 1G /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# TLS from our own CA (10 years). The server certificate names this host's IPv4, which is what the site dials.
install -d -m 700 "$CA"
if [ ! -f "$CA/ca.crt" ]; then
  openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -nodes -days 3650 \
    -subj "/CN=ShelfSpring database CA" -keyout "$CA/ca.key" -out "$CA/ca.crt" 2>/dev/null
fi
if ! openssl x509 -in "$CONF/server.crt" -noout -ext subjectAltName 2>/dev/null | grep -q "IP Address:$IP4"; then
  openssl req -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -nodes -subj "/CN=$IP4" \
    -keyout "$CONF/server.key" -out /tmp/pg-server.csr 2>/dev/null
  printf 'subjectAltName=IP:%s,IP:127.0.0.1,DNS:localhost\nbasicConstraints=CA:FALSE\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth\n' "$IP4" > /tmp/pg-server.ext
  openssl x509 -req -in /tmp/pg-server.csr -CA "$CA/ca.crt" -CAkey "$CA/ca.key" -CAcreateserial -days 3650 \
    -extfile /tmp/pg-server.ext -out "$CONF/server.crt" 2>/dev/null
  rm -f /tmp/pg-server.csr /tmp/pg-server.ext
  chown postgres:postgres "$CONF/server.key" "$CONF/server.crt"; chmod 600 "$CONF/server.key"
fi

# Sized for a 1 GB machine. Connections: the site keeps up to 3 per Vercel instance, the poller 8. A burst of
# instances once took all 50 slots for a minute (2026-11-01 01:48, 417 refused) and the poller's writes failed
# with them, so slots are now reserved for the poller's own role (reserved_connections, Postgres 16+): the site
# can never starve inventory sync and alerts. Store timestamps in UTC.
restart=0; reload=0
put "$CONF/conf.d/shelfspring.conf" <<CONF && restart=1
listen_addresses = '*'
port = 5432
max_connections = 100
reserved_connections = 10
shelfspring.host = '$HOST_LABEL'
wal_level = replica
max_wal_senders = 5
# A standby that is down for long must not fill this disk: past this, its slot is dropped (it then re-syncs).
max_slot_wal_keep_size = 4GB
hot_standby = on
hot_standby_feedback = on
shared_buffers = 96MB
effective_cache_size = 384MB
work_mem = 4MB
maintenance_work_mem = 32MB
wal_buffers = 4MB
min_wal_size = 64MB
max_wal_size = 512MB
checkpoint_completion_target = 0.9
random_page_cost = 1.1
effective_io_concurrency = 100
ssl = on
ssl_cert_file = '$CONF/server.crt'
ssl_key_file = '$CONF/server.key'
ssl_min_protocol_version = 'TLSv1.2'
password_encryption = scram-sha-256
idle_session_timeout = '10min'
idle_in_transaction_session_timeout = '60s'
tcp_keepalives_idle = 60
tcp_keepalives_interval = 15
tcp_keepalives_count = 4
timezone = 'UTC'
log_timezone = 'UTC'
log_min_duration_statement = 2000
CONF

# Peer auth for local admin, passwords on loopback, and from anywhere else only TLS plus a password, and only
# each app role to its own database.
put "$CONF/pg_hba.conf" <<HBA && reload=1
local   all                    postgres                              peer
local   all                    shelfspring_inventory_reader          reject
local   all                    all                                   peer
host    shelfspring            shelfspring_inventory_reader 127.0.0.1/32 scram-sha-256
host    shelfspring            shelfspring_inventory_reader ::1/128      scram-sha-256
host    all                    shelfspring_inventory_reader 0.0.0.0/0    reject
host    all                    shelfspring_inventory_reader ::/0         reject
host    all                    all                    127.0.0.1/32   scram-sha-256
host    all                    all                    ::1/128        scram-sha-256
hostssl shelfspring          shelfspring          0.0.0.0/0      scram-sha-256
hostssl shelfspring          shelfspring          ::/0           scram-sha-256
hostssl shelfspring_preview  shelfspring_preview  0.0.0.0/0      scram-sha-256
hostssl shelfspring_preview  shelfspring_preview  ::/0           scram-sha-256
HBA
chown postgres:postgres "$CONF/conf.d/shelfspring.conf" "$CONF/pg_hba.conf"

# Under memory pressure the kernel should kill the poller (systemd restarts it), never the database: the
# postmaster is shielded and its backends reset to neutral (PostgreSQL's documented setup), and the poller is
# capped well above its ~190 MB so a leak restarts it instead of starving everything else.
install -d /etc/systemd/system/postgresql@$PGV-main.service.d /etc/systemd/system/shelfspring-poller.service.d
put /etc/systemd/system/postgresql@$PGV-main.service.d/oom.conf <<'UNIT' && restart=1
[Service]
OOMScoreAdjust=-900
Environment=PG_OOM_ADJUST_FILE=/proc/self/oom_score_adj PG_OOM_ADJUST_VALUE=0
UNIT
poller_unit=0
put /etc/systemd/system/shelfspring-poller.service.d/memory.conf <<'UNIT' && poller_unit=1
[Service]
OOMScoreAdjust=500
MemoryHigh=400M
MemoryMax=500M
UNIT
systemctl daemon-reload
systemctl enable -q postgresql
if [ "$restart" = 1 ] || ! systemctl is-active -q postgresql@$PGV-main; then systemctl restart postgresql@$PGV-main; elif [ "$reload" = 1 ]; then systemctl reload postgresql@$PGV-main; fi
for _ in $(seq 1 30); do sudo -u postgres pg_isready -q && break; sleep 1; done
[ "$poller_unit" = 1 ] && systemctl is-active -q shelfspring-poller && systemctl restart shelfspring-poller

install -d -m 700 "$SECRETS"
# One role and one database per environment; passwords made once, never printed.
for db in "${DBS[@]}"; do
  pw="$SECRETS/$db.pw"
  [ -s "$pw" ] || (umask 077; openssl rand -base64 64 | tr -dc 'A-Za-z0-9' | head -c 40 > "$pw")
  sudo -u postgres psql -qtAc "SELECT 1 FROM pg_roles WHERE rolname = '$db'" | grep -q 1 || sudo -u postgres psql -qc "CREATE ROLE $db LOGIN"
  printf "ALTER ROLE %s WITH LOGIN PASSWORD :'pw';\n" "$db" | sudo -u postgres psql -q -v pw="$(cat "$pw")" >/dev/null
  sudo -u postgres psql -q -c "ALTER ROLE $db SET idle_session_timeout = '30s'; ALTER ROLE $db SET statement_timeout = '15s';" >/dev/null
  sudo -u postgres psql -qtAc "SELECT 1 FROM pg_database WHERE datname = '$db'" | grep -q 1 || sudo -u postgres createdb -O "$db" "$db"
  (umask 077
   printf 'postgres://%s:%s@%s:5432/%s' "$db" "$(cat "$pw")" "$IP4" "$db" > "$SECRETS/$db.url"
   printf 'postgres://%s:%s@127.0.0.1:5432/%s' "$db" "$(cat "$pw")" "$db" > "$SECRETS/$db-local.url")
done

# The poller's own login (loopback only): a member of shelfspring, so it has exactly that role's rights, plus
# the reserved connection slots. poller.env's DATABASE_URL takes /root/pg-secrets/poller-local.url.
pw="$SECRETS/poller.pw"
[ -s "$pw" ] || (umask 077; openssl rand -base64 64 | tr -dc 'A-Za-z0-9' | head -c 40 > "$pw")
sudo -u postgres psql -qtAc "SELECT 1 FROM pg_roles WHERE rolname = 'poller'" | grep -q 1 || sudo -u postgres psql -qc "CREATE ROLE poller LOGIN"
printf "ALTER ROLE poller WITH LOGIN PASSWORD :'pw';\nGRANT shelfspring TO poller;\nGRANT pg_use_reserved_connections TO poller;\n" | sudo -u postgres psql -q -v pw="$(cat "$pw")" >/dev/null
sudo -u postgres psql -q -c "ALTER ROLE poller SET idle_session_timeout = '30s'; ALTER ROLE poller SET statement_timeout = '30s';" >/dev/null
(umask 077; printf 'postgres://poller:%s@127.0.0.1:5432/shelfspring' "$(cat "$pw")" > "$SECRETS/poller-local.url"
 printf 'postgres://poller:%s@%s:5432/shelfspring' "$(cat "$pw")" "$IP4" > "$SECRETS/poller-remote.url")
# No replication role, promotion privilege, peer, slot or original-cluster state on this standalone host.

ufw allow 5432/tcp >/dev/null

# Nightly dump of production, one per weekday (seven kept), at a quiet hour for US stores.
install -d -o postgres -g postgres -m 700 /var/backups/shelfspring
cat > /etc/systemd/system/shelfspring-pgdump.service <<'UNIT'
[Unit]
Description=Dump the ShelfSpring database
[Service]
Type=oneshot
User=postgres
ExecStart=/bin/sh -c 'set -e; f=/var/backups/shelfspring/shelfspring-$(date +%%a).dump; pg_dump -Fc shelfspring > "$f.tmp"; pg_restore --list "$f.tmp" >/dev/null; mv "$f.tmp" "$f"'
UNIT
cat > /etc/systemd/system/shelfspring-pgdump.timer <<'UNIT'
[Unit]
Description=Nightly ShelfSpring database dump
[Timer]
OnCalendar=*-*-* 09:30:00 UTC
Persistent=true
[Install]
WantedBy=timers.target
UNIT

# Daily maintenance: trim request logs and optionally copy a bounded dump to the new R2 bucket.
if [ -f "$HERE/db-maintenance.sh" ]; then
  install -d -m 755 /opt/shelfspring
  install -m 755 "$HERE/db-maintenance.sh" /opt/shelfspring/db-maintenance.sh
  cat > /etc/systemd/system/shelfspring-db-maintenance.service <<'UNIT'
[Unit]
Description=Trim ShelfSpring request logs and copy the database off the host
After=postgresql.service network-online.target
[Service]
Type=oneshot
Environment=HOME=/root
ExecStart=/opt/shelfspring/db-maintenance.sh
UNIT
  cat > /etc/systemd/system/shelfspring-db-maintenance.timer <<'UNIT'
[Unit]
Description=Daily ShelfSpring database maintenance
[Timer]
OnCalendar=*-*-* 10:00:00 UTC
Persistent=true
[Install]
WantedBy=timers.target
UNIT
fi
systemctl daemon-reload
systemctl enable -q --now shelfspring-pgdump.timer
[ -f /etc/systemd/system/shelfspring-db-maintenance.timer ] && systemctl enable -q --now shelfspring-db-maintenance.timer

echo "postgres $(sudo -u postgres psql -qtAc 'SHOW server_version') on $IP4:5432 · databases: ${DBS[*]}"
