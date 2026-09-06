#!/usr/bin/env bash
#
# Smart Move backup.
#
# Dumps the database and archives the uploaded media, keeps a local rotation,
# and optionally copies everything off the server. Run it from the directory
# holding docker-compose.prod.yml, usually from cron:
#
#   0 2 * * * cd /opt/smartmove && ./scripts/backup.sh >> /var/log/smartmove-backup.log 2>&1
#
# Configuration comes from .env plus the variables below. The off-site step is
# skipped entirely when BACKUP_REMOTE is unset, so the script is useful before
# any storage provider has been chosen.

set -euo pipefail

cd "$(dirname "$0")/.."

# --- Configuration ---------------------------------------------------------
BACKUP_DIR="${BACKUP_DIR:-/var/backups/smartmove}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
KEEP_DAILY="${KEEP_DAILY:-7}"
KEEP_WEEKLY="${KEEP_WEEKLY:-5}"
# An rclone remote such as "b2:smartmove-backups" or "s3:my-bucket/smartmove".
# Leave unset to keep backups on this server only, which is not enough on its own.
BACKUP_REMOTE="${BACKUP_REMOTE:-}"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

POSTGRES_USER="${POSTGRES_USER:-smartmove}"
POSTGRES_DB="${POSTGRES_DB:-smartmove}"

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
day_of_week="$(date -u +%u)"
# Sunday's backup is the weekly one and is kept for longer.
if [ "$day_of_week" = "7" ]; then
  tier="weekly"
else
  tier="daily"
fi

target="${BACKUP_DIR}/${tier}"
mkdir -p "$target"

db_file="${target}/db-${timestamp}.sql.gz"
media_file="${target}/media-${timestamp}.tar.gz"

echo "[$(date -u +%FT%TZ)] Starting ${tier} backup"

# --- Database --------------------------------------------------------------
# --clean --if-exists makes the dump safe to restore over an existing database.
docker compose -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --clean --if-exists \
  | gzip -9 > "$db_file"

if [ ! -s "$db_file" ]; then
  echo "ERROR: database dump is empty" >&2
  rm -f "$db_file"
  exit 1
fi

# A dump that cannot be read back is not a backup.
gzip -t "$db_file"
echo "  database: $(du -h "$db_file" | cut -f1)"

# --- Media -----------------------------------------------------------------
docker compose -f "$COMPOSE_FILE" exec -T app tar -cf - -C /app media \
  | gzip -9 > "$media_file"

gzip -t "$media_file"
echo "  media:    $(du -h "$media_file" | cut -f1)"

# --- Off-site --------------------------------------------------------------
if [ -n "$BACKUP_REMOTE" ]; then
  if command -v rclone >/dev/null 2>&1; then
    echo "  copying to ${BACKUP_REMOTE}"
    rclone copy "$db_file" "${BACKUP_REMOTE}/${tier}/"
    rclone copy "$media_file" "${BACKUP_REMOTE}/${tier}/"
  else
    echo "WARNING: BACKUP_REMOTE is set but rclone is not installed" >&2
  fi
else
  echo "  BACKUP_REMOTE is not set: this backup exists only on this server"
fi

# --- Rotation --------------------------------------------------------------
prune() {
  local dir="$1" keep="$2"
  # Two files per run, so keep twice as many files as runs.
  find "$dir" -maxdepth 1 -type f -name 'db-*.sql.gz' -printf '%T@ %p\n' 2>/dev/null \
    | sort -rn | tail -n "+$((keep + 1))" | cut -d' ' -f2- | xargs -r rm -f
  find "$dir" -maxdepth 1 -type f -name 'media-*.tar.gz' -printf '%T@ %p\n' 2>/dev/null \
    | sort -rn | tail -n "+$((keep + 1))" | cut -d' ' -f2- | xargs -r rm -f
}

prune "${BACKUP_DIR}/daily" "$KEEP_DAILY"
prune "${BACKUP_DIR}/weekly" "$KEEP_WEEKLY"

if [ -n "$BACKUP_REMOTE" ] && command -v rclone >/dev/null 2>&1; then
  rclone delete --min-age "$((KEEP_DAILY * 24))h" "${BACKUP_REMOTE}/daily/" || true
  rclone delete --min-age "$((KEEP_WEEKLY * 7 * 24))h" "${BACKUP_REMOTE}/weekly/" || true
fi

echo "[$(date -u +%FT%TZ)] Backup complete"
