from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


@dataclass(slots=True)
class JobPosting:
    source: str
    source_job_id: str
    title: str
    company: str
    location: str = ""
    remote: bool | None = None
    url: str = ""
    description: str = ""
    salary: str = ""
    posted_at: str = ""
    role_family: str = ""
    entry_level_score: int = 0
    entry_level_reasons: list[str] = field(default_factory=list)
    raw: dict[str, Any] = field(default_factory=dict)

