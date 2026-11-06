#!/usr/bin/env python3
"""Stream a bounded dump to the private Worker backup route; no Cloudflare account token on the VPS.

Config: {uploadUrl: 'https://mail.example.com/backup', token: '...', maxBytes: 100663296}
Only seven weekday object slots are writable. Restore uses the authenticated Cloudflare R2 API separately.
"""
import http.client
import json
import pathlib
import re
import sys
import urllib.parse

MAX_BYTES = 96 * 1024 * 1024
DAYS = {day: index for index, day in enumerate(("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"))}

def backup(config_path, dump_path, *, expected_host=None):
    config = json.loads(pathlib.Path(config_path).read_text())
    endpoint = urllib.parse.urlsplit(config["uploadUrl"])
    if (endpoint.scheme != "https" or not endpoint.hostname or endpoint.username or endpoint.password
            or endpoint.port not in (None, 443) or endpoint.path.rstrip("/") != "/backup" or endpoint.query or endpoint.fragment
            or (expected_host is not None and endpoint.netloc != expected_host)):
        raise ValueError("Invalid backup endpoint")
    token = config["token"]
    if not isinstance(token, str) or len(token) < 24 or re.search(r"[\r\n]", token):
        raise ValueError("Invalid backup token")
    dump = pathlib.Path(dump_path)
    name = re.fullmatch(r"shelfspring-(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\.dump", dump.name)
    size = dump.stat().st_size
    if not name or size <= 0 or size > min(int(config.get("maxBytes", MAX_BYTES)), MAX_BYTES):
        raise ValueError("Backup exceeds the seven-day size policy")
    connection = http.client.HTTPSConnection(endpoint.hostname, timeout=120)
    try:
        connection.putrequest("POST", f"/backup/{DAYS[name.group(1)]}")
        connection.putheader("Authorization", "Bearer " + token)
        connection.putheader("User-Agent", "ShelfSpring-Operations/1.0")
        connection.putheader("Content-Type", "application/octet-stream")
        connection.putheader("Content-Length", str(size))
        connection.endheaders()
        with dump.open("rb") as handle:
            while chunk := handle.read(1024 * 1024):
                connection.send(chunk)
        response = connection.getresponse()
        result = json.loads(response.read(16_384))
        if response.status != 200 or result.get("size") != size or not result.get("etag"):
            raise ValueError("Backup upload was not acknowledged")
    finally:
        connection.close()
    print(f"Verified off-host backup ({size} bytes; seven-day rotation)")

if __name__ == "__main__":
    try:
        backup(*sys.argv[1:3])
    except Exception:
        print("R2 backup failed; local dumps retained. Check the dedicated backup token and endpoint.", file=sys.stderr)
        sys.exit(1)
