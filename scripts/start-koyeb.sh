#!/bin/sh
set -e
if [ -n "$DATABASE_URL" ]; then
  # Neon pooled hostnames (-pooler.) can break DDL; prefer the direct endpoint for migrate.
  MIGRATE_URL=$(printf '%s' "$DATABASE_URL" | sed 's/-pooler\././g')
  echo "Running prisma migrate deploy"
  if ! DATABASE_URL="$MIGRATE_URL" prisma migrate deploy; then
    echo "migrate deploy failed — clearing rolled-back init if present, then retry"
    DATABASE_URL="$MIGRATE_URL" prisma migrate resolve --rolled-back 20260817170000_init || true
    DATABASE_URL="$MIGRATE_URL" prisma migrate deploy
  fi
else
  echo "DATABASE_URL is not set; skipping migrate"
fi
exec node server.js
