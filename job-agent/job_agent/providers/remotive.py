from __future__ import annotations

from typing import Iterable

from ..models import JobPosting
from .base import Provider
from .http import get_json


class RemotiveProvider(Provider):
    name = "remotive"

    def search(self, query: str, location: str) -> Iterable[JobPosting]:
        payload = get_json("https://remotive.com/api/remote-jobs", {"search": query})
        for item in payload.get("jobs", []):
            yield JobPosting(
                source=self.name,
                source_job_id=str(item.get("id") or item.get("url")),
                title=item.get("title") or "",
                company=item.get("company_name") or "",
                location=item.get("candidate_required_location") or location,
                remote=True,
                url=item.get("url") or "",
                description=item.get("description") or "",
                salary=item.get("salary") or "",
                posted_at=item.get("publication_date") or "",
                raw=item,
            )

