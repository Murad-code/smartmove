# Backups and restore: what exists, what is missing, and how to finish it

Status: proposal. Nothing in phases 2 to 6 is built yet.

---

## 1. What exists today

There is a working disaster-recovery backup, and it is entirely developer-facing.

| Piece                | What it does                                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/backup.sh`  | `pg_dump` of the whole database, `tar` of the media volume, gzip both, verify both with `gzip -t`, copy off-site with rclone, prune old copies |
| `scripts/restore.sh` | Stops the app, replaces the database, replaces the media volume, restarts, waits for `/healthz`. Asks for a typed `RESTORE` confirmation       |
| `docs/backups.md`    | Setup guide: rclone remote, `.env` variables, the cron line, a monthly check, and how to pull one row out of a dump                            |

Retention is seven daily copies plus five Sunday copies, so roughly five weeks.

That covers the "server catches fire" case reasonably well. It does not cover
most of what the question was actually about.

## 2. What is missing

### 2.1 Two real bugs in the scripts as written

**The scripts read the wrong environment file.** `backup.sh` and `restore.sh`
both do `if [ -f .env ]`, and `docs/backups.md` tells you to put `BACKUP_REMOTE`
into `/opt/smartmove/.env`. But the documented deployment
(`docs/deployment.md:141-158`, `deploy/update.sh`) puts everything in
`.env.production` and passes `--env-file .env.production` to every Compose
command. On a server built by following the deployment guide there is no `.env`,
so:

- `BACKUP_REMOTE` is never read, and every backup silently stays on the server.
- The `docker compose -f docker-compose.prod.yml exec` calls run without
  `--env-file`, and `docker-compose.prod.yml` declares
  `POSTGRES_USER: ${POSTGRES_USER:?set POSTGRES_USER in .env.production}`.
  Compose aborts before it reaches the container.

So `backup.sh` fails on the deployment the rest of the documentation describes.
This is the single most important thing on this page.

**The media backup needs the app to be running.** `docker compose exec -T app
tar ...` cannot run against a stopped container, and `set -e` means the whole
script fails. A night when the app is down is a night with no database backup
either, even though the database dump had already succeeded.

### 2.2 Nothing is automatic

`deploy/vps-setup.sh` installs Docker, certbot and htpasswd. It does not install
rclone, does not create `/var/backups/smartmove`, and does not install the cron
entry. Backups exist only if a human remembers to work through `docs/backups.md`
by hand after the deploy. `BACKUP_DIR`, `BACKUP_REMOTE`, `KEEP_DAILY` and
`KEEP_WEEKLY` do not appear in `.env.production.example` either, so nothing
prompts for them.

### 2.3 Nothing tells you when backups stop

The mitigation on offer is `tail -20 /var/log/smartmove-backup.log` once a
month, which `docs/backups.md` itself names as the classic way to discover you
have no backups. There is no heartbeat, no email, no failure alert.

### 2.4 No restore has ever been proved by machine

`docs/backups.md` records that a restore was rehearsed by hand during
development. Nothing re-checks it. A schema change, a Postgres major version
bump or a `pg_dump` flag change could break restores months before anyone finds
out.

### 2.5 The owner cannot use any of it

The client is not technical and the admin panel is treated as a product feature.
Every part of the current system needs SSH, Docker and psql. In practice this
means the realistic recovery path for "I deleted the wrong property" is a phone
call to the developer.

### 2.6 The format is not logical, and it is all-or-nothing

`pg_dump` output is a SQL dump of Payload's internal schema, including the
relationship join tables, the `_rels` tables and the version tables. Restoring
one property means loading the dump into a scratch database, finding the row and
retyping it in the admin panel, which is what `docs/backups.md` currently tells
you to do. There is no format in which "the six properties as they were last
Tuesday" is a thing you can look at or restore on its own.

### 2.7 Five weeks of history, and no long tail

Seven daily plus five weekly copies. Corruption noticed after six weeks, which is
exactly how slow corruption gets noticed, is unrecoverable. There is no monthly
tier.

---

## 3. The shape of the fix

Two tiers, doing two different jobs. Trying to make one mechanism do both is why
this is awkward today.

### Tier 1: disaster recovery, at the host

`pg_dump` plus the media volume, byte-exact, run by the host, restored by a
script. Answers "the server is gone" and "the database is corrupt". Stays
developer-only, and that is correct: it is a full-stack operation that stops the
app.

Mostly exists. Needs the bugs fixed, needs to install itself, needs to shout
when it fails.

### Tier 2: content snapshots, in the app

A logical export of every collection and global as JSON, written through
Payload's Local API, listed and restored from the admin panel. Answers "someone
deleted the wrong thing", "the wrong text went live", and "what did the home page
say last month". Owner-facing.

**This is the tier that has to be logical rather than a database dump, and the
container forces the point.** The runtime image is `node:22-alpine` with
`libc6-compat` and `curl` and nothing else (`Dockerfile`, runner stage). There is
no `pg_dump` and no `psql` in it, and adding the Postgres client to the app image
to let the app dump its own database would be the wrong trade. Going through the
Local API instead means restores run through Payload's validation, hooks and
access control, which is what makes a partial restore safe enough to expose to a
non-technical person.

### The snapshot format

One gzipped tar per snapshot:

```
snapshot-20260908T020000Z.tar.gz
  manifest.json          schema version, app version, created at, counts, checksums
  globals/home-page.json
  globals/business-details.json
  globals/site-settings.json
  collections/properties.json
  collections/pages.json
  collections/services.json
  collections/enquiries.json
  collections/media.json          metadata rows, not the files
  media/manifest.json             filename, size, sha256 for each upload
  media/files/…                   only when "include photographs" was chosen
```

Readable, diffable, greppable, and portable to something that is not Payload,
which matters for the same reason `src/lib/properties` exists.

`manifest.json` carries a `schemaVersion`. Restore refuses a snapshot from a
newer schema than the running app, and warns on an older one.

**Media binaries are excluded by default.** Tier 1 already archives the whole
media volume nightly. Including roughly 180 MB of photographs in every content
snapshot would multiply the storage for no recovery benefit. The manifest still
records every file, so a restore can say "this property's photographs are not in
this snapshot" instead of silently producing broken images. A checkbox produces a
full snapshot when someone wants one to take away.

---

## 4. Phases

Ordered so each one ships on its own and the cheap reliability wins land first.
Phases 0 and 1 are most of the actual risk reduction.

### Phase 0: fix the scripts (half a day)

- `backup.sh` and `restore.sh` read `.env.production`, falling back to `.env`.
- Both build the Compose command as
  `docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE"`, matching
  `deploy/update.sh`.
- Back up media with `docker compose run --rm --entrypoint sh -v` against the
  volume rather than `exec` into the running app, so a stopped app does not lose
  the night's database backup.
- `flock` on the backup directory so two runs cannot overlap.
- Add `BACKUP_DIR`, `BACKUP_REMOTE`, `KEEP_DAILY`, `KEEP_WEEKLY`, `KEEP_MONTHLY`
  to `.env.production.example` and to `docs/environment-variables.md`.
- Add a monthly tier: first Sunday of the month, `KEEP_MONTHLY=12`.
- Correct `docs/backups.md`, which currently names the wrong file.

Files: `scripts/backup.sh`, `scripts/restore.sh`, `.env.production.example`,
`docs/backups.md`, `docs/environment-variables.md`.

### Phase 1: make it automatic and make it complain (one day)

- `deploy/vps-setup.sh` installs rclone, creates `BACKUP_DIR`, and installs a
  systemd timer rather than a crontab. A timer is preferred because
  `systemctl list-timers` and `systemctl status smartmove-backup` answer "is this
  still running" without reading a log file, and `OnFailure=` gives a hook.
- New `deploy/smartmove-backup.service` and `deploy/smartmove-backup.timer`,
  `OnCalendar=*-*-* 02:00:00`, `RandomizedDelaySec=15m`, `Persistent=true`.
- On failure, and on a run that produces a suspiciously small dump, POST to a new
  admin-only endpoint so the failure reaches the same email path enquiries use.
  Alternative if that feels circular: a dead-man's-switch ping to a free
  healthchecks.io check, which also catches "the whole VPS is off".
- `backup.sh` writes `${BACKUP_DIR}/last-success.json` with the timestamp and
  sizes.
- `/healthz` gains a `backups` section reading that file, so a stale backup is
  visible from outside the box. Keep it out of the public response body if the
  endpoint is unauthenticated.

### Phase 2: the snapshot engine (two days)

New `src/lib/backups/`:

- `types.ts`: `SnapshotManifest`, `SnapshotSummary`, `RestorePlan`,
  `RestoreResult`. Exported for the app to use, following the same rule as
  `src/lib/properties`.
- `export.ts`: `createSnapshot(payload, options)`. Paginates every collection
  with `overrideAccess: true` and `depth: 0` so relationships stay as IDs, reads
  every global, hashes each media file, streams a tar through gzip to
  `BACKUP_SNAPSHOT_DIR`, then verifies the archive is readable before recording
  it. Same principle as `gzip -t` in `backup.sh`: an archive nobody has read back
  is not a backup.
- `import.ts`: `planRestore()` and `applyRestore()`, described in phase 5.
- `storage.ts`: list, stat, delete, open a read stream, prune to a retention
  count. Nothing else touches the directory.

`depth: 0` matters. A snapshot must store relationship IDs, not embedded copies,
or restoring a property would duplicate its media rows.

Docker: a new `backups` volume mounted at `/app/backups`, created and chowned in
the Dockerfile before `USER nextjs` exactly as `/app/media` is. It must not live
under `/app/media`, because `Media` grants `read: anyone` and the snapshots
contain enquiries, that is, real people's names, emails and phone numbers.

Add `pnpm snapshot` for local use, in the same shape as `src/scripts/seed.ts`.

Tests: `tests/int/backups.int.spec.ts` round-trips a snapshot in a scratch
database and asserts the counts and a sample document match.

### Phase 3: making backups visible in the admin panel (one to two days)

- New `Backups` collection, `admin.group: 'Settings'`, `access` admin-only for
  read, create and delete, and `create: () => false` on the API so rows only ever
  come from the snapshot code. Fields: `createdAt`, `kind` (scheduled or manual),
  `sizeBytes`, `includesMedia`, `documentCounts`, `status`, `error`,
  `storageKey`, `offsite`. This gets the whole list view, sorting, filtering and
  paging from Payload for free, which is far better than a bespoke table.
- Row labels written for the owner: "Automatic snapshot, Monday 8 September,
  2:00am, 412 items, 1.2 MB".
- `src/endpoints/backups/download.ts`: streams the archive, admin only, checked
  the same way `src/endpoints/seed-demo.ts` checks. Never a public URL, never a
  guessable path, and log the download with the user ID.
- `src/endpoints/backups/create.ts`: "Back up now", admin only, rate limited to
  one in flight.
- A `BackupPanel` dashboard card next to `DashboardTools`, showing when the last
  backup ran, whether it went off-site, and a "Back up now" button. Reuse the
  `dashboard-tools` classes in `src/app/(payload)/custom.scss`.

### Phase 4: the owner sets the frequency (one day)

- New `BackupSettings` global, admin-only, in plain English:
  - "How often should the website back itself up?" Never, Every day, Every week.
  - "What time?" a select of quiet hours, defaulting to 2:00am.
  - "How many to keep?" defaulting to 14.
  - "Include photographs in each backup?" defaulting to no, with a description
    explaining that photographs are already backed up nightly on the server.
- Scheduling uses Payload's jobs queue, which 3.88 supports:
  `jobs.tasks` with a `snapshot` task, and `jobs.autoRun` with a **fixed hourly**
  cron. The task reads `BackupSettings` and decides whether one is due.

  The fixed cron is deliberate. `autoRun` is resolved when the process starts, so
  deriving the cron expression from the global would mean the owner's change to
  the schedule did nothing until the next deploy. An hourly tick that asks "is one
  due" changes immediately, which is the behaviour a non-technical user expects
  from a setting they just saved.

- `jobs.access.run` locked to admin, and `deleteJobOnComplete: false` so the job
  rows are the audit trail.
- Adding the jobs queue creates Payload's `payload-jobs` collection, so this
  phase needs `pnpm generate:types` and a migration, both committed.
- Hide `payload-jobs` from the navigation. The owner has no use for it.

Note the trade: the snapshot runs inside the Next server process. For this site
that is fine. If it ever is not, the same task moves to a `docker compose run`
invocation from the systemd timer with no change to the format.

### Phase 5: restore from the admin panel (two days)

The part that needs the most care, because it is the part that can destroy data.

**Dry run first, always.** Opening a backup and choosing Restore produces a plan
before anything changes:

> Restoring this backup would:
>
> - add 2 properties that no longer exist
> - change 5 properties, 1 page and the home page
> - leave 3 properties alone
> - do nothing to your 214 enquiries
>
> 4 photographs used by these properties are not in this backup and would show
> as missing.

**Selective by default.** Checkboxes per collection. Restoring properties without
touching enquiries is the common case and the whole reason for tier 2.

**Enquiries are opt-in and separate**, behind an extra confirmation. They are
personal data and they only ever arrive, so overwriting them with an older set is
almost always a mistake.

**Never a blind delete.** Restore adds and updates by ID. Documents created since
the snapshot are listed and left alone unless "remove items created since this
backup" is ticked.

**Take a snapshot before restoring**, automatically, labelled "before restore",
and pinned so retention cannot prune it. Undo for the undo.

**One transaction.** Use `payload.db.beginTransaction()` and pass `req` through
every call so a failure halfway leaves nothing behind. See
`.claude/skills/payload/reference/ADVANCED.md`.

**Users are never restored.** Restoring an old `users` table could lock the owner
out or resurrect a removed account. The snapshot records them for reference and
the restore skips them.

Written to `Backups` on completion: who ran it, when, what changed.

### Phase 6: prove the restore works (one day, then it runs itself)

- `scripts/verify-restore.sh`: spin up a throwaway Postgres container, load the
  newest dump into it, assert the migration table is complete and that the row
  counts for properties, pages, services and users are non-zero, then tear it
  down. Run it weekly from its own systemd timer. This is the check that
  distinguishes a backup from a hope.
- A CI job that creates a snapshot from the seeded test database, wipes it,
  restores it and asserts equality. Cheap, runs on every PR, and catches the
  case where a schema change breaks last month's snapshots.

---

## 5. Effort and order

| Phase                   | Effort   | What it buys                                             |
| ----------------------- | -------- | -------------------------------------------------------- |
| 0 Fix the scripts       | 0.5 day  | Backups actually run on the real server. Do this first   |
| 1 Automatic, monitored  | 1 day    | They keep running, and you find out when they stop       |
| 2 Snapshot engine       | 2 days   | A content format that can be read and partially restored |
| 3 Admin visibility      | 1-2 days | The owner can see and download backups                   |
| 4 Scheduling in the CMS | 1 day    | The owner sets the frequency without a developer         |
| 5 Restore from admin    | 2 days   | The owner can undo a mistake                             |
| 6 Verified restores     | 1 day    | Proof, repeated, that any of this works                  |

Roughly nine days for all of it. Phases 0 and 1 are one and a half of those and
are most of the risk reduction, because a correct backup nobody can restore from
the admin panel is worth much more than a beautiful admin panel over a backup
that never ran.

Phases 2 to 5 are the answer to the actual question, and they are worth doing,
but they are an improvement on a working floor rather than the floor itself.

## 6. Things to decide before starting phase 2

1. **Do snapshots go off-site?** They should, through the same rclone remote, or
   the app's own backups die with the server. That means the app either shells
   out to rclone, which is not in its image, or writes to
   `BACKUP_SNAPSHOT_DIR` on a bind mount that `backup.sh` then sweeps. The second
   is simpler and keeps one off-site path. Recommended.
2. **How long do snapshots containing enquiries live?** They are personal data.
   `docs/operations.md` already says a retention period needs deciding for
   enquiries. A deletion request has to reach the backups too, or the answer to
   "have you deleted my data" is no. Simplest defensible position: a short,
   documented snapshot retention, 30 days, stated in the privacy policy.
3. **Does the owner get restore at all, or only download and a phone call?**
   Phase 5 is the largest and riskiest phase. Phases 3 and 4 without 5 still let
   the owner see that backups are happening and hand a file to a developer, which
   may be enough.
4. **Encryption at rest off-site.** Backblaze plus a bucket key is probably
   proportionate here. `rclone crypt` is the alternative, and it adds a key that
   must never be lost, which is its own failure mode.

## 7. Documentation this changes

- `docs/backups.md`: correct the env file, add the monthly tier, add the systemd
  timer, add the snapshot tier.
- `docs/cms-guide.md`: a section for the owner, in their language, on what backs
  itself up and what to do when something goes wrong.
- `docs/operations.md`: replace "check the log monthly" with the alerting, and
  add the restore rehearsal.
- `docs/environment-variables.md`: the `BACKUP_*` variables.
- `SECURITY.md`: snapshots contain personal data, admin-only, not under `media/`.
- `CLAUDE.md`: a short note that `src/lib/backups` owns the format, in the same
  spirit as the property domain layer.
