#!/usr/bin/env bash
set -euo pipefail

# Restore onto a THROWAY Postgres, never blindly onto production.
# Usage: DATABASE_URL=postgresql://... ./scripts/restore-postgres.sh backup.dump

DUMP="${1:-}"
if [[ -z "${DATABASE_URL:-}" || -z "$DUMP" ]]; then
  echo "Usage: DATABASE_URL=... $0 backup.dump" >&2
  exit 1
fi

if [[ "${CONFIRM_RESTORE:-}" != "yes" ]]; then
  echo "Refusing to restore. Set CONFIRM_RESTORE=yes after pointing DATABASE_URL at a throwaway database." >&2
  exit 1
fi

pg_restore --clean --if-exists --no-owner --no-acl --dbname="$DATABASE_URL" "$DUMP"
echo "Restore completed against $DATABASE_URL"
