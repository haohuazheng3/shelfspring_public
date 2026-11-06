#!/usr/bin/env python3
"""Root-only destination env assembly. Inputs and passwords are never printed or shell-evaluated."""
import json
import os
import pathlib
import sys
import re
from urllib.parse import urlsplit

BASE_ALLOWED = {
    "INVENTORY_SOURCE_DATABASE_URL", "INVENTORY_SOURCE_DATABASE_CA", "INVENTORY_SOURCE_KEY",
    "INVENTORY_SYNC_INTERVAL_MS", "INVENTORY_STATUS_INTERVAL_MS", "INVENTORY_ALERT_MAX_AGE_MS",
    "VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT", "RESEND_API_KEY", "ALERTS_FROM", "MAIL_FROM",
    "MAIL_WORKER_URL", "MAIL_WORKER_TOKEN", "OWNER_EMAIL", "POLLER_TOKEN", "R2_BACKUP_CONFIG_JSON",
}

ALLOWED = BASE_ALLOWED | {"SITE_URL", "HOST_LABEL"}

def write_env(inputs_path, output_path, commit, secrets_dir="/root/pg-secrets", *, site_url=None, host_label=None, default_source_key="inventory-source", allowed_keys=None):
    inputs = json.loads(pathlib.Path(inputs_path).read_text())
    if not isinstance(inputs, dict) or any(key not in (ALLOWED if allowed_keys is None else allowed_keys) or not isinstance(value, str) for key, value in inputs.items()):
        raise ValueError("Invalid bootstrap input keys")
    site_url = site_url or inputs.get("SITE_URL")
    host_label = host_label or inputs.get("HOST_LABEL")
    if not isinstance(site_url, str) or not isinstance(host_label, str):
        raise ValueError("SITE_URL and HOST_LABEL must be configured")
    origin = urlsplit(site_url)
    if (origin.scheme != "https" or not origin.hostname or origin.username or origin.password
            or origin.path not in ("", "/") or origin.query or origin.fragment
            or not re.fullmatch(r"[A-Za-z0-9._-]{1,64}", host_label)):
        raise ValueError("Invalid site origin or host label")
    site_url = site_url.rstrip("/")
    r2_config = inputs.pop("R2_BACKUP_CONFIG_JSON", "")
    if r2_config:
        config = json.loads(r2_config)
        if not isinstance(config, dict) or any(not isinstance(config.get(key), str) or not config[key] for key in ("uploadUrl", "token")):
            raise ValueError("Invalid backup configuration")
        backup_path = pathlib.Path(secrets_dir) / "r2-backup.json"
        backup_tmp = backup_path.with_suffix(".tmp")
        backup_fd = os.open(backup_tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(backup_fd, "w") as handle:
            handle.write(json.dumps(config))
        os.replace(backup_tmp, backup_path)
        os.chmod(backup_path, 0o600)
    destination = pathlib.Path(output_path)
    values = {}
    if destination.exists():
        for line in destination.read_text().splitlines():
            if "=" not in line or line.startswith("#"):
                continue
            key, value = line.split("=", 1)
            if key in ALLOWED and key != "R2_BACKUP_CONFIG_JSON":
                values[key] = json.loads(value) if value.startswith('"') else value
    values.update({key: value for key, value in inputs.items() if value})
    values.update({
        "NODE_ENV": "production", "DATABASE_URL": (pathlib.Path(secrets_dir) / "poller-local.url").read_text().strip(),
        "DATABASE_POOL_MAX": "3", "INVENTORY_FEED_MODE": "source", "INVENTORY_SOURCE_KEY": values.get("INVENTORY_SOURCE_KEY", default_source_key),
        "INVENTORY_SYNC_INTERVAL_MS": values.get("INVENTORY_SYNC_INTERVAL_MS", "5000"),
        "INVENTORY_STATUS_INTERVAL_MS": values.get("INVENTORY_STATUS_INTERVAL_MS", "30000"),
        "HOST_LABEL": host_label, "SITE_URL": site_url, "NEXT_PUBLIC_SITE_URL": site_url,
        "VAPID_SUBJECT": values.get("VAPID_SUBJECT", "mailto:alerts@" + origin.hostname), "POLLER_COMMIT": commit,
    })
    # JSON quoting is accepted by EnvironmentFile; source CA normalizes escaped newlines itself.
    serialized = "".join(f"{key}={json.dumps(value, ensure_ascii=False)}\n" for key, value in sorted(values.items()))
    temporary = destination.with_suffix(".tmp")
    fd = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as handle:
        handle.write(serialized)
    os.replace(temporary, destination)
    os.chmod(destination, 0o600)

if __name__ == "__main__":
    try:
        write_env(*sys.argv[1:4])
    except Exception:
        print("Could not prepare destination feed environment", file=sys.stderr)
        sys.exit(1)
