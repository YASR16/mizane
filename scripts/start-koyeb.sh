#!/bin/sh
set -e
if [ -n "$DATABASE_URL" ]; then
  prisma migrate deploy
else
  echo "DATABASE_URL is not set; skipping migrate"
fi
exec node server.js
