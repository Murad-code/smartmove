#!/usr/bin/env bash
#
# Smart Move restore.
#
#   ./scripts/restore.sh /var/backups/smartmove/daily/db-20260906T020000Z.sql.gz \
#                        /var/backups/smartmove/daily/media-20260906T020000Z.tar.gz
#
# The media archive is optional. Practise this on a spare server before you
# ever need it: a backup nobody has restored is only a hope.

set -euo pipefail

cd "$(dirname "$0")/.."

DB_ARCHIVE="${1:-}"
MEDIA_ARCHIVE="${2:-}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

if [ -z "$DB_ARCHIVE" ]; then
  echo "Usage: $0 <db-backup.sql.gz> [media-backup.tar.gz]" >&2
  exit 1
fi

if [ ! -f "$DB_ARCHIVE" ]; then
  echo "ERROR: $DB_ARCHIVE does not exist" >&2
  exit 1
fi

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

POSTGRES_USER="${POSTGRES_USER:-smartmove}"
POSTGRES_DB="${POSTGRES_DB:-smartmove}"

cat <<WARNING
About to overwrite the live site with:

  database: $DB_ARCHIVE
  media:    ${MEDIA_ARCHIVE:-(not restoring media)}

Everything currently in the database will be replaced.
WARNING

read -r -p "Type RESTORE to continue: " confirmation
if [ "$confirmation" != "RESTORE" ]; then
  echo "Cancelled."
  exit 1
fi

echo "Stopping the application so nothing writes during the restore..."
docker compose -f "$COMPOSE_FILE" stop app

echo "Restoring the database..."
gunzip -c "$DB_ARCHIVE" \
  | docker compose -f "$COMPOSE_FILE" exec -T postgres \
      psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --set ON_ERROR_STOP=on

if [ -n "$MEDIA_ARCHIVE" ]; then
  if [ ! -f "$MEDIA_ARCHIVE" ]; then
    echo "ERROR: $MEDIA_ARCHIVE does not exist" >&2
    exit 1
  fi
  echo "Restoring media..."
  docker compose -f "$COMPOSE_FILE" run --rm -T --entrypoint sh app \
    -c 'rm -rf /app/media/* && tar -xzf - -C /app' < "$MEDIA_ARCHIVE"
fi

echo "Starting the application..."
docker compose -f "$COMPOSE_FILE" up -d app

echo "Waiting for the health check..."
for _ in $(seq 1 30); do
  if docker compose -f "$COMPOSE_FILE" exec -T app curl -fsS http://127.0.0.1:3000/healthz >/dev/null 2>&1; then
    echo "Restore complete and the site is responding."
    exit 0
  fi
  sleep 2
done

echo "WARNING: the site did not become healthy. Check: docker compose -f $COMPOSE_FILE logs app" >&2
exit 1
