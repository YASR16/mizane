#!/usr/bin/env bash
set -euo pipefail

# Usage: DATABASE_URL=postgresql://... ./scripts/backup-postgres.sh [output.dump]
# On Fly: fly postgres connect / fly ssh, or run from a machine that can reach Postgres.

OUT="${1:-backup-$(date +%Y%m%d-%H%M%S).dump}"
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

pg_dump --format=custom --no-owner --no-acl --dbname="$DATABASE_URL" --file="$OUT"
echo "Wrote $OUT"
echo "Keep this file private. It can contain emails and payment metadata (not public CV URLs)."
