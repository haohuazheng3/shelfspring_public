#!/usr/bin/env bash
# Destination only. Seven atomic daily dumps stay local; optional off-host R2 uses a separate new bucket.
# Never restores to, connects to, or modifies the original database or any former Neon project.
set -euo pipefail
ip -4 -o addr show scope global | awk '{print $4}' | cut -d/ -f1 | grep -Fxq "$(cat /etc/shelfspring-host-ip)" || { echo "Refusing an unapproved maintenance host" >&2; exit 1; }
P=(sudo -u postgres psql -v ON_ERROR_STOP=1 -qX -d shelfspring)
[ "$("${P[@]}" -tAc 'select pg_is_in_recovery()')" = f ] || exit 0
"${P[@]}" >/dev/null <<'SQL'
DELETE FROM poll_log WHERE at < now() - interval '14 days';
DELETE FROM sweeps WHERE started_at < now() - interval '14 days';
DELETE FROM ops_log WHERE (level = 'debug' AND at < now() - interval '3 days') OR at < now() - interval '60 days';
DELETE FROM rate_limits WHERE reset_at < now() - interval '1 day';
INSERT INTO ops_log (source, level, message) VALUES ('host', 'info', 'Destination database maintenance completed');
SQL
backup="/var/backups/shelfspring/shelfspring-$(date +%a).dump"
if [ -s /root/pg-secrets/r2-backup.json ]; then
  [ -s "$backup" ] || { echo "Daily local backup missing; off-host upload skipped" >&2; exit 1; }
  python3 /opt/shelfspring/app/scripts/runtime/r2-backup.py /root/pg-secrets/r2-backup.json "$backup"
else
  echo "Local backups retained; R2 off-host backup is not configured"
fi
