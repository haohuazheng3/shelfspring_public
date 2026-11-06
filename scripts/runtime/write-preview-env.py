#!/usr/bin/env python3
"""Construct a fresh preview-feed environment; never copy production env/notification credentials."""
import json
import os
import pathlib
import re
import sys
from urllib.parse import urlparse, urlunparse


def write_preview_env(output_path, commit, secrets_dir="/root/pg-secrets"):
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise ValueError("A full commit SHA is required")
    secrets = pathlib.Path(secrets_dir)
    target_url = (secrets / "shelfspring_preview-local.url").read_text().strip()
    target = urlparse(target_url)
    if (target.scheme not in ("postgres", "postgresql") or target.hostname != "127.0.0.1"
            or target.port != 5432 or target.username != "shelfspring_preview"
            or target.path != "/shelfspring_preview" or not target.password or target.query or target.fragment):
        raise ValueError("Unexpected preview database")
    password = (secrets / "shelfspring_inventory_reader.pw").read_text().strip()
    if not re.fullmatch(r"[A-Za-z0-9]{40}", password):
        raise ValueError("Invalid inventory reader password")
    values = {
        "NODE_ENV": "production", "PREVIEW_INVENTORY_MODE": "1", "INVENTORY_FEED_MODE": "source",
        "DATABASE_URL": target_url, "DATABASE_POOL_MAX": "1",
        "INVENTORY_SOURCE_DATABASE_URL": urlunparse(("postgres", f"shelfspring_inventory_reader:{password}@127.0.0.1:5432", "/shelfspring", "", "", "")),
        "INVENTORY_SOURCE_KEY": "shelfspring-production", "INVENTORY_SYNC_INTERVAL_MS": "10000",
        "INVENTORY_STATUS_INTERVAL_MS": "10000", "INVENTORY_REPORT_INTERVAL_MS": "900000",
        "INVENTORY_SYNC_BATCH_SIZE": "500", "INVENTORY_SYNC_MAX_BATCHES": "2",
        "HOST_LABEL": "shelfspring-preview-feed", "POLLER_COMMIT": commit,
        "NEXT_PUBLIC_INDEXABLE": "0",
    }
    destination = pathlib.Path(output_path)
    temporary = destination.with_suffix(".tmp")
    fd = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    os.fchmod(fd, 0o600)
    with os.fdopen(fd, "w") as handle:
        handle.write("".join(f"{key}={json.dumps(value)}\n" for key, value in sorted(values.items())))
    os.replace(temporary, destination)
    os.chmod(destination, 0o600)


if __name__ == "__main__":
    try:
        write_preview_env(*sys.argv[1:3])
    except Exception:
        print("Could not prepare isolated preview inventory environment", file=sys.stderr)
        sys.exit(1)
