#!/bin/sh
set -e

echo "Applying database migrations..."
npx prisma migrate deploy

if [ "$SEED_ON_START" = "true" ]; then
  echo "Seeding database..."
  node prisma/seed.js || echo "Seeding failed or skipped."
fi

echo "Starting API server..."
exec node src/server.js
