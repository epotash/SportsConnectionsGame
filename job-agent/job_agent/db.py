from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from .models import JobPosting, utc_now_iso


SCHEMA = """
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  source_job_id TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  remote INTEGER,
  url TEXT,
  description TEXT,
  salary TEXT,
  posted_at TEXT,
  discovered_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  role_family TEXT NOT NULL,
  entry_level_score INTEGER NOT NULL,
  entry_level_reasons TEXT NOT NULL,
  raw_json TEXT NOT NULL,
  UNIQUE(source, source_job_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS jobs_source_url_idx
ON jobs(source, url)
WHERE url IS NOT NULL AND url != '';

CREATE TABLE IF NOT EXISTS scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  provider TEXT NOT NULL,
  query TEXT NOT NULL,
  location TEXT NOT NULL,
  fetched_count INTEGER NOT NULL DEFAULT 0,
  saved_count INTEGER NOT NULL DEFAULT 0,
  error TEXT
);

CREATE TABLE IF NOT EXISTS job_candidates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  source_job_id TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  remote INTEGER,
  url TEXT,
  role_family TEXT NOT NULL,
  entry_level_score INTEGER NOT NULL,
  entry_level_reasons TEXT NOT NULL,
  accepted INTEGER NOT NULL,
  rejection_reason TEXT,
  query TEXT NOT NULL,
  search_location TEXT NOT NULL,
  seen_at TEXT NOT NULL,
  raw_json TEXT NOT NULL,
  UNIQUE(source, source_job_id, query, search_location)
);
"""


def connect(path: str) -> sqlite3.Connection:
    db_path = Path(path)
    if db_path.parent != Path("."):
        db_path.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    return con


def init_db(con: sqlite3.Connection) -> None:
    con.executescript(SCHEMA)
    con.commit()


def upsert_job(con: sqlite3.Connection, job: JobPosting) -> str:
    now = utc_now_iso()
    existing = con.execute(
        "SELECT id FROM jobs WHERE source = ? AND source_job_id = ?",
        (job.source, job.source_job_id),
    ).fetchone()
    con.execute(
        """
        INSERT INTO jobs (
          source, source_job_id, title, company, location, remote, url,
          description, salary, posted_at, discovered_at, last_seen_at,
          role_family, entry_level_score, entry_level_reasons, raw_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(source, source_job_id) DO UPDATE SET
          title = excluded.title,
          company = excluded.company,
          location = excluded.location,
          remote = excluded.remote,
          url = excluded.url,
          description = excluded.description,
          salary = excluded.salary,
          posted_at = excluded.posted_at,
          last_seen_at = excluded.last_seen_at,
          role_family = excluded.role_family,
          entry_level_score = excluded.entry_level_score,
          entry_level_reasons = excluded.entry_level_reasons,
          raw_json = excluded.raw_json
        """,
        (
            job.source,
            job.source_job_id,
            job.title,
            job.company,
            job.location,
            None if job.remote is None else int(job.remote),
            job.url,
            job.description,
            job.salary,
            job.posted_at,
            now,
            now,
            job.role_family,
            job.entry_level_score,
            json.dumps(job.entry_level_reasons),
            json.dumps(job.raw),
        ),
    )
    con.commit()
    return "updated" if existing else "inserted"


def upsert_candidate(
    con: sqlite3.Connection,
    job: JobPosting,
    query: str,
    search_location: str,
    accepted: bool,
    rejection_reason: str = "",
) -> None:
    now = utc_now_iso()
    con.execute(
        """
        INSERT INTO job_candidates (
          source, source_job_id, title, company, location, remote, url,
          role_family, entry_level_score, entry_level_reasons, accepted,
          rejection_reason, query, search_location, seen_at, raw_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(source, source_job_id, query, search_location) DO UPDATE SET
          title = excluded.title,
          company = excluded.company,
          location = excluded.location,
          remote = excluded.remote,
          url = excluded.url,
          role_family = excluded.role_family,
          entry_level_score = excluded.entry_level_score,
          entry_level_reasons = excluded.entry_level_reasons,
          accepted = excluded.accepted,
          rejection_reason = excluded.rejection_reason,
          seen_at = excluded.seen_at,
          raw_json = excluded.raw_json
        """,
        (
            job.source,
            job.source_job_id,
            job.title,
            job.company,
            job.location,
            None if job.remote is None else int(job.remote),
            job.url,
            job.role_family,
            job.entry_level_score,
            json.dumps(job.entry_level_reasons),
            int(accepted),
            rejection_reason,
            query,
            search_location,
            now,
            json.dumps(job.raw),
        ),
    )
    con.commit()


def start_scan(con: sqlite3.Connection, provider: str, query: str, location: str) -> int:
    cursor = con.execute(
        "INSERT INTO scans (started_at, provider, query, location) VALUES (?, ?, ?, ?)",
        (utc_now_iso(), provider, query, location),
    )
    con.commit()
    return int(cursor.lastrowid)


def finish_scan(
    con: sqlite3.Connection,
    scan_id: int,
    fetched_count: int,
    saved_count: int,
    error: str | None = None,
) -> None:
    con.execute(
        """
        UPDATE scans
        SET finished_at = ?, fetched_count = ?, saved_count = ?, error = ?
        WHERE id = ?
        """,
        (utc_now_iso(), fetched_count, saved_count, error, scan_id),
    )
    con.commit()


def list_jobs(con: sqlite3.Connection, limit: int) -> list[sqlite3.Row]:
    return list(
        con.execute(
            """
            SELECT title, company, location, remote, source, role_family,
                   entry_level_score, posted_at, url
            FROM jobs
            ORDER BY COALESCE(posted_at, last_seen_at) DESC, entry_level_score DESC
            LIMIT ?
            """,
            (limit,),
        )
    )


def export_jobs(con: sqlite3.Connection) -> list[sqlite3.Row]:
    return list(
        con.execute(
            """
            SELECT title, company, location, remote, source, role_family,
                   entry_level_score, posted_at, url, salary, last_seen_at
            FROM jobs
            ORDER BY entry_level_score DESC, COALESCE(posted_at, last_seen_at) DESC
            """
        )
    )


def export_candidates(con: sqlite3.Connection) -> list[sqlite3.Row]:
    return list(
        con.execute(
            """
            SELECT title, company, location, remote, source, role_family,
                   entry_level_score, accepted, rejection_reason, query,
                   search_location, url, seen_at
            FROM job_candidates
            ORDER BY seen_at DESC, entry_level_score DESC
            """
        )
    )
