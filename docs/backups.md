# Backups

The VPS must not be the only place this data exists. A hosting provider losing
a server, a bad migration, or a mistaken delete in the admin panel are all
ordinary events; without an off-site copy any of them is the end of the site.

Two things need backing up:

1. **PostgreSQL** — all content, all enquiries, all accounts.
2. **The media volume** — every property photograph. These are not in git and
   cannot be recreated.

## What the script does

`scripts/backup.sh` dumps the database, archives the media volume, verifies
both archives are readable, copies them off the server if a destination is
configured, and prunes old ones.

Sunday's run is kept as the weekly backup. The default retention is seven daily
and five weekly copies, so roughly five weeks of history.

## Setting it up

### 1. Choose an off-site destination

Anything rclone supports works. Backblaze B2 is the usual choice for this size
of site because it costs a few pence a month.

```bash
rclone config
```

Follow the prompts to create a remote called, for example, `b2`. Then create a
bucket and check it:

```bash
rclone mkdir b2:smartmove-backups
rclone lsd b2:
```

### 2. Point the script at it

Add to `/opt/smartmove/.env`:

```bash
BACKUP_REMOTE=b2:smartmove-backups
BACKUP_DIR=/var/backups/smartmove
KEEP_DAILY=7
KEEP_WEEKLY=5
```

If `BACKUP_REMOTE` is left unset the script still runs and still keeps local
copies, and says clearly that the backup exists only on that server. That is
better than nothing but is not a backup.

### 3. Test it by hand first

```bash
cd /opt/smartmove
sudo mkdir -p /var/backups/smartmove
sudo chown $USER /var/backups/smartmove
./scripts/backup.sh
```

Expect output like:

```
[2026-09-06T02:00:01Z] Starting daily backup
  database: 240K
  media:    182M
  copying to b2:smartmove-backups
[2026-09-06T02:01:14Z] Backup complete
```

### 4. Schedule it

```bash
crontab -e
```

```cron
0 2 * * * cd /opt/smartmove && ./scripts/backup.sh >> /var/log/smartmove-backup.log 2>&1
```

2am UK time is a quiet period for a letting agency site.

### 5. Check it is still running

Once a month:

```bash
tail -20 /var/log/smartmove-backup.log
rclone ls b2:smartmove-backups/daily | tail -5
```

A backup job that silently stopped three months ago is the classic way to
discover you have no backups.

## Restoring

```bash
cd /opt/smartmove
./scripts/restore.sh /var/backups/smartmove/daily/db-20260906T020001Z.sql.gz \
                     /var/backups/smartmove/daily/media-20260906T020001Z.tar.gz
```

The script stops the application so nothing writes mid-restore, replaces the
database, replaces the media, starts the application again and waits for the
health check. It asks for confirmation first, because it overwrites the live
site.

The media archive is optional; leave it off to restore the database only.

To restore from off-site storage, fetch the files first:

```bash
rclone copy b2:smartmove-backups/daily/db-20260906T020001Z.sql.gz /tmp/
rclone copy b2:smartmove-backups/daily/media-20260906T020001Z.tar.gz /tmp/
```

## Practise the restore

This procedure has been tested end to end during development: the database and
media were deleted from a running stack and recovered from a backup, and the
site came back with all content and photographs intact.

Do the same on the real server at least once, ideally onto a spare VPS rather
than the live one, before you need it. A backup nobody has restored is a hope,
not a plan.

## Restoring a single deleted item

You do not need a full restore to recover one property. Load the dump into a
scratch database and copy the row out:

```bash
createdb smartmove_scratch
gunzip -c db-20260906T020001Z.sql.gz | psql smartmove_scratch
psql smartmove_scratch -c "select * from properties where title like '%Ashby%';"
```

Then re-enter it in the admin panel. For a site of this size that is quicker
and far safer than surgery on the live database.

## What is not backed up

- `.env`. It holds secrets and is not in git. Keep a copy in a password manager.
- The Docker images. They are rebuilt from the repository.
- Nginx logs.
