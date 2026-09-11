#!/usr/bin/env bash
#
# Pull a published image and restart. Lives next to the compose file on the VPS.
#
#   ./update.sh          # pull whatever APP_IMAGE already points at
#   ./update.sh 1.3.1    # pin APP_IMAGE to that Docker Hub tag, then pull
#   ./update.sh v1.3.1   # same; a leading v is ignored

set -euo pipefail

cd "$(dirname "$0")"

if [[ -f docker-compose.prod.yml ]]; then
  COMPOSE_FILE=docker-compose.prod.yml
elif [[ -f docker-compose.yml ]]; then
  COMPOSE_FILE=docker-compose.yml
else
  echo "No docker-compose.prod.yml or docker-compose.yml in $(pwd)." >&2
  echo "Copy this script into the same directory as the compose file." >&2
  exit 1
fi

COMPOSE=(docker compose -f "$COMPOSE_FILE" --env-file .env.production)

if [[ -n "${1:-}" ]]; then
  pin="${1#v}"
  if [[ ! -f .env.production ]]; then
    echo "Missing .env.production in $(pwd)." >&2
    exit 1
  fi
  if ! grep -q '^APP_IMAGE=' .env.production; then
    echo "APP_IMAGE is not set in .env.production." >&2
    exit 1
  fi
  sed -i -E "s|^APP_IMAGE=(.*):.*$|APP_IMAGE=\1:$pin|" .env.production
  echo "Pinned to $pin"
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
