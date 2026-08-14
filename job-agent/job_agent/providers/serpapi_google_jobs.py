from __future__ import annotations

import os
from typing import Iterable

from ..models import JobPosting
from .base import Provider
from .http import get_json


class SerpApiGoogleJobsProvider(Provider):
    name = "serpapi_google_jobs"

    def search(self, query: str, location: str) -> Iterable[JobPosting]:
        api_key = os.environ.get(self.config.get("api_key_env", "SERPAPI_KEY"))
        if not api_key:
            raise RuntimeError("Missing SerpAPI key environment variable")

        payload = get_json(
            "https://serpapi.com/search.json",
            {
                "engine": "google_jobs",
                "q": query,
                "location": location,
                "api_key": api_key,
            },
        )
        for item in payload.get("jobs_results", []):
            related_links = item.get("related_links") or []
            first_link = related_links[0].get("link") if related_links else ""
            yield JobPosting(
                source=self.name,
                source_job_id=str(item.get("job_id") or first_link or item.get("title")),
                title=item.get("title") or "",
                company=item.get("company_name") or "",
                location=item.get("location") or location,
                remote="remote" in (item.get("location") or "").lower(),
                url=first_link,
                description=item.get("description") or "",
                salary="",
                posted_at=(item.get("detected_extensions") or {}).get("posted_at", ""),
                raw=item,
            )

