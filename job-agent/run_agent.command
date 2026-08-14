#!/bin/zsh
cd "$(dirname "$0")"
python3 -m job_agent scan --config config.example.json
python3 -m job_agent export-csv --output exports/jobs.csv
python3 -m job_agent export-candidates-csv --output exports/job-candidates.csv
echo
echo "Done. Open these files in Excel or Numbers:"
echo "$(pwd)/exports/jobs.csv"
echo "$(pwd)/exports/job-candidates.csv"
echo
read "?Press Return to close this window."
