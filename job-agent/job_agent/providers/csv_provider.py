from __future__ import annotations

import csv
from pathlib import Path
from typing import Iterable

from ..models import JobPosting
from .base import Provider


class CsvProvider(Provider):
    name = "csv"

    def search(self, query: str, location: str) -> Iterable[JobPosting]:
        path = Path(self.config["path"])
        source = self.config.get("source", "csv")
        with path.open(newline="", encoding="utf-8") as handle:
            for row in csv.DictReader(handle):
                yield JobPosting(
                    source=row.get("source") or source,
                    source_job_id=row.get("source_job_id") or row.get("url") or row.get("title", ""),
                    title=row.get("title") or "",
                    company=row.get("company") or "",
                    location=row.get("location") or location,
                    remote=_parse_bool(row.get("remote")),
                    url=row.get("url") or "",
                    description=row.get("description") or "",
                    salary=row.get("salary") or "",
                    posted_at=row.get("posted_at") or "",
                    raw=row,
                )


def _parse_bool(value: str | None) -> bool | None:
    if value is None or value == "":
        return None
    return value.strip().lower() in {"1", "true", "yes", "y", "remote"}

