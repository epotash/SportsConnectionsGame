from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

from .db import (
    connect,
    export_candidates,
    export_jobs,
    init_db,
    list_jobs,
)
from .scanner import run_scan


def load_config(path: str) -> dict:
    with Path(path).open(encoding="utf-8") as handle:
        return json.load(handle)


def cmd_init_db(args: argparse.Namespace) -> None:
    config = load_config(args.config) if args.config else {}
    database = args.database or config.get("database", "jobs.sqlite3")
    con = connect(database)
    init_db(con)
    print(f"Initialized {database}")


def cmd_scan(args: argparse.Namespace) -> None:
    config = load_config(args.config)
    database = args.database or config.get("database", "jobs.sqlite3")
    con = connect(database)
    init_db(con)

    summaries = run_scan(config, con)
    total_fetched = sum(summary.fetched for summary in summaries)
    total_saved = sum(summary.matched for summary in summaries)
    total_inserted = sum(summary.new_unique for summary in summaries)
    for summary in summaries:
        status = "ok" if summary.error is None else f"error: {summary.error}"
        print(
            f"{summary.provider} | {summary.query} | {summary.location}: "
            f"fetched={summary.fetched} matched={summary.matched} "
            f"new_unique={summary.new_unique} {status}"
        )

    print(f"Done. fetched={total_fetched} matched={total_saved} new_unique={total_inserted}")


def cmd_list(args: argparse.Namespace) -> None:
    config = load_config(args.config) if args.config else {}
    database = args.database or config.get("database", "jobs.sqlite3")
    con = connect(database)
    init_db(con)
    rows = list_jobs(con, args.limit)
    for row in rows:
        remote = "remote" if row["remote"] else row["location"]
        print(
            f"[{row['entry_level_score']}] {row['title']} — {row['company']} "
            f"({remote}, {row['source']}, {row['role_family']})\n{row['url']}\n"
        )


def cmd_export(args: argparse.Namespace) -> None:
    config = load_config(args.config) if args.config else {}
    database = args.database or config.get("database", "jobs.sqlite3")
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    con = connect(database)
    init_db(con)
    rows = export_jobs(con)
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
    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            writer.writerow({column: row[column] for column in columns})
    print(f"Exported {len(rows)} jobs to {output}")


def cmd_export_candidates(args: argparse.Namespace) -> None:
    config = load_config(args.config) if args.config else {}
    database = args.database or config.get("database", "jobs.sqlite3")
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    con = connect(database)
    init_db(con)
    rows = export_candidates(con)
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
    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            writer.writerow({column: row[column] for column in columns})
    print(f"Exported {len(rows)} fetched candidates to {output}")


def cmd_web(_args: argparse.Namespace) -> None:
    from .web import main as web_main

    web_main()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Scan job providers for entry-level data/software roles.")
    parser.add_argument("--database", help="SQLite database path")
    subparsers = parser.add_subparsers(required=True)

    init_parser = subparsers.add_parser("init-db", help="Create the SQLite schema")
    init_parser.add_argument("--config", help="Config JSON path")
    init_parser.add_argument("--database", help="SQLite database path")
    init_parser.set_defaults(func=cmd_init_db)

    scan_parser = subparsers.add_parser("scan", help="Run configured provider searches")
    scan_parser.add_argument("--config", default="config.example.json", help="Config JSON path")
    scan_parser.add_argument("--database", help="SQLite database path")
    scan_parser.set_defaults(func=cmd_scan)

    list_parser = subparsers.add_parser("list", help="List saved jobs")
    list_parser.add_argument("--config", help="Config JSON path")
    list_parser.add_argument("--database", help="SQLite database path")
    list_parser.add_argument("--limit", type=int, default=25)
    list_parser.set_defaults(func=cmd_list)

    export_parser = subparsers.add_parser("export-csv", help="Export saved jobs to a CSV file")
    export_parser.add_argument("--config", help="Config JSON path")
    export_parser.add_argument("--database", help="SQLite database path")
    export_parser.add_argument("--output", default="exports/jobs.csv", help="CSV output path")
    export_parser.set_defaults(func=cmd_export)

    candidates_parser = subparsers.add_parser(
        "export-candidates-csv",
        help="Export all fetched postings, including rejected candidates",
    )
    candidates_parser.add_argument("--config", help="Config JSON path")
    candidates_parser.add_argument("--database", help="SQLite database path")
    candidates_parser.add_argument("--output", default="exports/job-candidates.csv", help="CSV output path")
    candidates_parser.set_defaults(func=cmd_export_candidates)

    web_parser = subparsers.add_parser("web", help="Run the local browser dashboard")
    web_parser.set_defaults(func=cmd_web)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
