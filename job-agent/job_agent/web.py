from __future__ import annotations

import csv
import json
from dataclasses import asdict
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from .db import connect, export_candidates, export_jobs, init_db, list_jobs
from .scanner import run_scan

PROJECT_ROOT = Path(__file__).resolve().parents[1]
STATIC_ROOT = PROJECT_ROOT / "web"
DEFAULT_CONFIG = PROJECT_ROOT / "config.example.json"


def load_config(path: Path = DEFAULT_CONFIG) -> dict:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def database_path(config: dict) -> str:
    path = Path(config.get("database", "jobs.sqlite3"))
    if path.is_absolute():
        return str(path)
    return str(PROJECT_ROOT / path)


def rows_to_dicts(rows) -> list[dict]:
    return [dict(row) for row in rows]


def write_csv(path: Path, rows: list[dict], columns: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            writer.writerow({column: row.get(column) for column in columns})


class JobAgentHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC_ROOT), **kwargs)

    def log_message(self, format: str, *args) -> None:
        return

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/jobs":
            params = parse_qs(parsed.query)
            limit = int(params.get("limit", ["100"])[0])
            self.send_json(self.get_jobs(limit))
            return
        if parsed.path == "/api/candidates":
            self.send_json(self.get_candidates())
            return
        if parsed.path == "/api/config":
            config = load_config()
            enabled = [item["name"] for item in config.get("providers", []) if item.get("enabled")]
            self.send_json(
                {
                    "database": config.get("database"),
                    "enabled_providers": enabled,
                    "queries": config.get("queries", []),
                    "locations": config.get("locations", []),
                }
            )
            return
        if parsed.path == "/exports/jobs.csv":
            self.export_accepted()
            return
        if parsed.path == "/exports/job-candidates.csv":
            self.export_candidates()
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.path == "/api/scan":
            config = load_config()
            con = connect(database_path(config))
            init_db(con)
            summaries = run_scan(config, con)
            self.send_json({"summaries": [asdict(summary) for summary in summaries]})
            return
        self.send_error(HTTPStatus.NOT_FOUND)

    def get_jobs(self, limit: int) -> dict:
        config = load_config()
        con = connect(database_path(config))
        init_db(con)
        rows = rows_to_dicts(list_jobs(con, limit))
        return {"jobs": rows}

    def get_candidates(self) -> dict:
        config = load_config()
        con = connect(database_path(config))
        init_db(con)
        rows = rows_to_dicts(export_candidates(con))
        return {"candidates": rows}

    def export_accepted(self) -> None:
        config = load_config()
        con = connect(database_path(config))
        init_db(con)
        rows = rows_to_dicts(export_jobs(con))
        columns = [
            "title",
            "company",
            "location",
            "remote",
            "source",
            "role_family",
            "entry_level_score",
            "posted_at",
            "salary",
            "url",
            "last_seen_at",
        ]
        path = PROJECT_ROOT / "exports" / "jobs.csv"
        write_csv(path, rows, columns)
        self.path = "/exports/jobs.csv"
        return super().do_GET()

    def export_candidates(self) -> None:
        config = load_config()
        con = connect(database_path(config))
        init_db(con)
        rows = rows_to_dicts(export_candidates(con))
        columns = [
            "title",
            "company",
            "location",
            "remote",
            "source",
            "role_family",
            "entry_level_score",
            "accepted",
            "rejection_reason",
            "query",
            "search_location",
            "url",
            "seen_at",
        ]
        path = PROJECT_ROOT / "exports" / "job-candidates.csv"
        write_csv(path, rows, columns)
        self.path = "/exports/job-candidates.csv"
        return super().do_GET()

    def send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


def main() -> None:
    server = ThreadingHTTPServer(("127.0.0.1", 8765), JobAgentHandler)
    print("Job Agent is running at http://127.0.0.1:8765")
    print("Press Ctrl+C to stop.")
    server.serve_forever()


if __name__ == "__main__":
    main()

