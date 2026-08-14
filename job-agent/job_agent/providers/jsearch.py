from __future__ import annotations

import os
from typing import Iterable

from ..models import JobPosting
from .base import Provider
from .http import get_json


class JSearchProvider(Provider):
    name = "jsearch"

    def search(self, query: str, location: str) -> Iterable[JobPosting]:
        api_key = os.environ.get(self.config.get("api_key_env", "RAPIDAPI_KEY"))
        if not api_key:
            raise RuntimeError("Missing RapidAPI key environment variable")

        params = {
            "query": f"{query} in {location}",
            "page": "1",
            "num_pages": str(self.config.get("num_pages", 1)),
            "country": self.config.get("country", "us"),
            "date_posted": self.config.get("date_posted", "week"),
        }
        payload = get_json(
            "https://jsearch.p.rapidapi.com/search",
            params,
            {
                "X-RapidAPI-Key": api_key,
                "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
                "User-Agent": "entry-level-job-agent/0.1",
            },
        )
        for item in payload.get("data", []):
            yield JobPosting(
                source=self.name,
                source_job_id=str(item.get("job_id") or item.get("job_apply_link")),
                title=item.get("job_title") or "",
                company=item.get("employer_name") or "",
                location=item.get("job_city") or item.get("job_location") or location,
                remote=item.get("job_is_remote"),
                url=item.get("job_apply_link") or item.get("job_google_link") or "",
                description=item.get("job_description") or "",
                salary=_salary(item),
                posted_at=item.get("job_posted_at_datetime_utc") or "",
                raw=item,
            )


def _salary(item: dict) -> str:
    minimum = item.get("job_min_salary")
    maximum = item.get("job_max_salary")
    if minimum and maximum:
        return f"{minimum}-{maximum}"
    if minimum:
        return str(minimum)
    return ""

