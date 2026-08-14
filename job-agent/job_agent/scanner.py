from __future__ import annotations

from dataclasses import dataclass

from .db import finish_scan, start_scan, upsert_candidate, upsert_job
from .filters import classify_role_family, enrich_and_filter, score_entry_level
from .providers import build_provider


@dataclass(slots=True)
class ScanSummary:
    provider: str
    query: str
    location: str
    fetched: int
    matched: int
    new_unique: int
    error: str | None


def run_scan(config: dict, con) -> list[ScanSummary]:
    minimum_score = int(config.get("minimum_entry_level_score", 2))
    providers = [build_provider(item) for item in config.get("providers", []) if item.get("enabled")]
    queries = config.get("queries", [])
    locations = config.get("locations", ["Remote"])
    summaries: list[ScanSummary] = []

    for provider in providers:
        for query in queries:
            for location in locations:
                scan_id = start_scan(con, provider.name, query, location)
                fetched = 0
                matched = 0
                inserted = 0
                error = None
                try:
                    for job in provider.search(query, location):
                        fetched += 1
                        job.role_family = classify_role_family(job)
                        job.entry_level_score, job.entry_level_reasons = score_entry_level(job)
                        enriched = enrich_and_filter(job, minimum_score)
                        if enriched:
                            upsert_candidate(con, job, query, location, True)
                            result = upsert_job(con, enriched)
                            matched += 1
                            if result == "inserted":
                                inserted += 1
                        else:
                            reason = "below entry-level threshold"
                            if job.role_family == "other":
                                reason = "not clearly data/software"
                            upsert_candidate(con, job, query, location, False, reason)
                except Exception as exc:  # Keep scheduled/browser-triggered runs from dying silently.
                    error = str(exc)
                finally:
                    finish_scan(con, scan_id, fetched, matched, error)

                summaries.append(
                    ScanSummary(
                        provider=provider.name,
                        query=query,
                        location=location,
                        fetched=fetched,
                        matched=matched,
                        new_unique=inserted,
                        error=error,
                    )
                )

    return summaries

