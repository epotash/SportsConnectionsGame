from __future__ import annotations

from .base import Provider
from .csv_provider import CsvProvider
from .jsearch import JSearchProvider
from .remotive import RemotiveProvider
from .serpapi_google_jobs import SerpApiGoogleJobsProvider


PROVIDERS = {
    "csv": CsvProvider,
    "jsearch": JSearchProvider,
    "remotive": RemotiveProvider,
    "serpapi_google_jobs": SerpApiGoogleJobsProvider,
}


def build_provider(config: dict) -> Provider:
    name = config["name"]
    try:
        provider_cls = PROVIDERS[name]
    except KeyError as exc:
        known = ", ".join(sorted(PROVIDERS))
        raise ValueError(f"Unknown provider {name!r}. Known providers: {known}") from exc
    return provider_cls(config)

