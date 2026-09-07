#!/usr/bin/env bash
#
# Pull the newest published image and restart. Run on the VPS from $APP_DIR.
#
#   ./update.sh          # move to whatever :latest points at
#   ./update.sh v1.2.0   # move to a specific tag

set -euo pipefail

cd "$(dirname "$0")"
COMPOSE=(docker compose -f docker-compose.prod.yml --env-file .env.production)

if [[ -n "${1:-}" ]]; then
  # Record the tag so a later plain `./update.sh` stays on it.
  sed -i -E "s|^APP_IMAGE=(.*):.*$|APP_IMAGE=\1:$1|" .env.production
  echo "Pinned to $1"
fi

echo "Current image:"
"${COMPOSE[@]}" images app || true

"${COMPOSE[@]}" pull app
# Migrations run automatically when the new container connects.
"${COMPOSE[@]}" up -d

echo "Waiting for the health check..."
for _ in $(seq 1 30); do
  if [[ "$("${COMPOSE[@]}" ps -q app | xargs docker inspect -f '{{.State.Health.Status}}' 2>/dev/null)" == "healthy" ]]; then
    echo "Healthy."
    exit 0
  fi
  sleep 3
done

echo "Did not become healthy in 90s. Recent logs:" >&2
"${COMPOSE[@]}" logs --tail=50 app >&2
exit 1
