#!/usr/bin/env python3
"""Dedicated host probe. Reads only the two needed root-only env keys and never logs tokens."""
import json
import pathlib
import sys
import urllib.request
import urllib.parse

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        raise ValueError("Health probe redirects are refused")

def main(*, expected_host=None):
    values = {}
    for line in pathlib.Path("/opt/shelfspring/poller.env").read_text().splitlines():
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key in ("MAIL_WORKER_URL", "MAIL_WORKER_TOKEN"):
            values[key] = json.loads(value) if value.startswith('"') else value
    if not values.get("MAIL_WORKER_URL") or not values.get("MAIL_WORKER_TOKEN"):
        print("Mail worker probe is not configured")
        return
    endpoint = urllib.parse.urlsplit(values["MAIL_WORKER_URL"])
    if (endpoint.scheme != "https" or not endpoint.hostname or endpoint.username or endpoint.password
            or endpoint.port not in (None, 443) or endpoint.path not in ("", "/") or endpoint.query or endpoint.fragment
            or (expected_host is not None and values["MAIL_WORKER_URL"].rstrip("/") != "https://" + expected_host)):
        raise ValueError("Unexpected mail worker endpoint")
    req = urllib.request.Request(values["MAIL_WORKER_URL"].rstrip("/") + "/probe", method="POST",
        headers={"Authorization": "Bearer " + values["MAIL_WORKER_TOKEN"], "User-Agent": "ShelfSpring-Operations/1.0"}, data=b"")
    with urllib.request.build_opener(NoRedirect()).open(req, timeout=40) as response:
        result = json.loads(response.read(16_384))
        if response.status != 200 or result.get("ok") is not True:
            raise ValueError("Full health probe failed")
    print("Full external health probe passed")

if __name__ == "__main__":
    try:
        main()
    except Exception:
        print("Full external health probe failed; inspect site and mail worker health", file=sys.stderr)
        sys.exit(1)
