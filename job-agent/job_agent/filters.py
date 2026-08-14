from __future__ import annotations

import re

from .models import JobPosting


ENTRY_LEVEL_PATTERNS = [
    r"\bentry[- ]level\b",
    r"\bjunior\b",
    r"\bjr\.?\b",
    r"\bnew grad\b",
    r"\bgraduate\b",
    r"\bassociate\b",
    r"\bapprentice(ship)?\b",
    r"\bintern(ship)?\b",
    r"\b0\s*[-–]\s*2 years?\b",
    r"\b0\s*[-–]\s*1 years?\b",
    r"\bno experience\b",
]

EXCLUSION_PATTERNS = [
    r"\bsenior\b",
    r"\bsr\.?\b",
    r"\bstaff\b",
    r"\bprincipal\b",
    r"\blead\b",
    r"\bmanager\b",
    r"\bdirector\b",
    r"\barchitect\b",
    r"\bhead of\b",
    r"\b[5-9]\+?\s+years?\b",
    r"\b1[0-9]\+?\s+years?\b",
]

SOFTWARE_PATTERNS = [
    r"\bsoftware\b",
    r"\bdeveloper\b",
    r"\bfrontend\b",
    r"\bfront end\b",
    r"\bbackend\b",
    r"\bback end\b",
    r"\bfull stack\b",
    r"\bqa\b",
    r"\btest engineer\b",
    r"\bdevops\b",
]

DATA_PATTERNS = [
    r"\bdata\b",
    r"\banalyst\b",
    r"\banalytics\b",
    r"\bbi\b",
    r"\bbusiness intelligence\b",
    r"\betl\b",
    r"\bsql\b",
    r"\bmachine learning\b",
]


def _matches(patterns: list[str], text: str) -> list[str]:
    return [pattern for pattern in patterns if re.search(pattern, text, re.IGNORECASE)]


def classify_role_family(job: JobPosting) -> str:
    haystack = f"{job.title}\n{job.description}"
    software = bool(_matches(SOFTWARE_PATTERNS, haystack))
    data = bool(_matches(DATA_PATTERNS, haystack))
    if software and data:
        return "mixed"
    if software:
        return "software"
    if data:
        return "data"
    return "other"


def score_entry_level(job: JobPosting) -> tuple[int, list[str]]:
    haystack = f"{job.title}\n{job.description}".lower()
    reasons: list[str] = []
    score = 0

    for pattern in ENTRY_LEVEL_PATTERNS:
        if re.search(pattern, haystack, re.IGNORECASE):
            score += 2
            reasons.append(f"matches {pattern}")

    if re.search(r"\b[0-2]\+?\s+years?\b", haystack, re.IGNORECASE):
        score += 1
        reasons.append("requires 0-2 years")

    for pattern in EXCLUSION_PATTERNS:
        if re.search(pattern, haystack, re.IGNORECASE):
            score -= 3
            reasons.append(f"excludes {pattern}")

    family = classify_role_family(job)
    if family in {"software", "data", "mixed"}:
        score += 1
        reasons.append(f"role family: {family}")
    else:
        score -= 2
        reasons.append("not clearly data/software")

    return score, reasons


def enrich_and_filter(job: JobPosting, minimum_score: int) -> JobPosting | None:
    job.role_family = classify_role_family(job)
    job.entry_level_score, job.entry_level_reasons = score_entry_level(job)
    if job.role_family == "other":
        return None
    if job.entry_level_score < minimum_score:
        return None
    return job

