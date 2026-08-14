from __future__ import annotations

import json
import ssl
from urllib.parse import urlencode
from urllib.request import Request, urlopen


def _ssl_context() -> ssl.SSLContext | None:
    try:
        import certifi
    except ImportError:
        return None
    return ssl.create_default_context(cafile=certifi.where())


def get_json(url: str, params: dict | None = None, headers: dict | None = None) -> dict:
    full_url = f"{url}?{urlencode(params or {})}" if params else url
    request = Request(full_url, headers=headers or {"User-Agent": "entry-level-job-agent/0.1"})
    with urlopen(request, timeout=30, context=_ssl_context()) as response:
        return json.loads(response.read().decode("utf-8"))
