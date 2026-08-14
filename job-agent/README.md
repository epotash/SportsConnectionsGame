# Entry-Level Job Agent

A small Python agent that searches configured job providers for entry-level data and software roles, scores each posting, and stores matching jobs in SQLite.

The agent is designed around provider APIs and exported feeds instead of brittle scraping. Indeed, LinkedIn, and ZipRecruiter have restricted or partner-oriented APIs, so use approved access, a licensed third-party job-search API, or exported search results for those sources.

## What It Finds

Included query presets focus on:

- Entry-level software engineer, developer, QA, and IT roles
- Entry-level data analyst, BI analyst, analytics engineer, and data engineer roles
- Intern, new grad, junior, associate, apprenticeship, and 0-2 years language

The filter excludes common seniority terms like `senior`, `staff`, `principal`, `lead`, `manager`, and high years-of-experience requirements.

## Quick Start

```bash
cd job-agent
python3 -m pip install -r requirements.txt
python3 -m job_agent init-db
python3 -m job_agent scan --config config.example.json
python3 -m job_agent list --limit 25
```

The default database path is `jobs.sqlite3`.

## Browser Dashboard

Double-click `open_dashboard.command`, or run the local website manually:

```bash
python3 -m job_agent web
```

Then open:

```text
http://127.0.0.1:8765
```

## Open Results In Excel Or Numbers

Export saved jobs to CSV:

```bash
python3 -m job_agent export-csv --output exports/jobs.csv
```

Then open `exports/jobs.csv` in Excel, Numbers, or Google Sheets.

Export every fetched posting, including rejected candidates and rejection reasons:

```bash
python3 -m job_agent export-candidates-csv --output exports/job-candidates.csv
```

On macOS, you can also double-click `run_agent.command`. It scans, exports `exports/jobs.csv` and `exports/job-candidates.csv`, and prints the file paths.

## Providers

This scaffold includes:

- `remotive`: public remote-job API, useful for testing the pipeline
- `jsearch`: RapidAPI JSearch-style provider for broad job search results
- `serpapi_google_jobs`: SerpAPI Google Jobs provider
- `csv`: import exported search results from a CSV file

For Indeed, LinkedIn, or ZipRecruiter specifically, configure an approved API/feed/export path and map it through one of these provider shapes or add a new adapter under `job_agent/providers`.

## Configuration

Copy `config.example.json` and edit:

```json
{
  "database": "jobs.sqlite3",
  "queries": [
    "entry level software engineer",
    "junior data analyst"
  ],
  "locations": ["Remote", "New York, NY"],
  "providers": [
    { "name": "remotive", "enabled": true },
    {
      "name": "jsearch",
      "enabled": false,
      "api_key_env": "RAPIDAPI_KEY"
    }
  ]
}
```

## Scheduling

Run this every few hours with cron, launchd, or a small background service:

```bash
python3 -m job_agent scan --config /absolute/path/to/config.json
```

## Troubleshooting

If live scans fail with `CERTIFICATE_VERIFY_FAILED` on macOS, run Python's certificate installer:

```bash
open "/Applications/Python 3.12/Install Certificates.command"
```

If that file is not present, install the bundled certificate package:

```bash
python3 -m pip install -r requirements.txt
```

## Database

Jobs are deduplicated by `(source, source_job_id)` and URL where possible. Useful columns include:

- `title`, `company`, `location`, `remote`, `url`
- `role_family`: `software`, `data`, or `mixed`
- `entry_level_score`
- `entry_level_reasons`
- `posted_at`, `discovered_at`, `last_seen_at`
