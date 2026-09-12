# Deploying to a VPS

The VPS never builds and never needs a source checkout. You build
`linux/amd64` on your machine and push it to Docker Hub; the server pulls it.

The container migrates its own database on first connect and, on a fresh
database, seeds the starter content. A deployment is therefore two commands.

**Topology.** nginx is already installed on the VPS and serves other sites on
ports 80 and 443, so this stack publishes nothing publicly: the app listens on
`127.0.0.1:3001` and the host's nginx proxies a subdomain to it. Postgres is not
published at all and is reachable only from the app container.

```
Internet
  → host nginx (TLS, rate limits, caching)     :80 / :443
    → app container                            127.0.0.1:3001
      → postgres container                     internal network only
```

---

## Part 1 — Publish the image

Once per release, from your machine (Docker Hub login required):

```bash
./deploy/release.sh patch    # bugfix: 1.3.0 -> 1.3.1
./deploy/release.sh minor    # feature: 1.3.0 -> 1.4.0
./deploy/release.sh          # asks which
```

That bumps `package.json`, builds `linux/amd64`, and pushes these tags to
`muradkamali/smartmove`:

| Tag      | Meaning                                    |
| -------- | ------------------------------------------ |
| `1.3.1`  | The exact release. Use this in production. |
| `latest` | Whatever was published most recently.      |

Do not skip `--platform linux/amd64`: a Mac build is arm64 and the VPS is not.

> Two different variables, same hostname:
>
> - **`NEXT_PUBLIC_SITE_URL`** is inlined into the JavaScript bundle at **image
>   build** time. `./deploy/release.sh` passes it as a build-arg. Changing it
>   only on the server does not fix canonicals or Open Graph URLs.
> - **`SITE_URL`** is read at **runtime** for enquiry notification links and
>   password-reset / invite emails. `docker-compose.prod.yml` copies it from
>   `NEXT_PUBLIC_SITE_URL` in `.env.production`. If email links point at
>   localhost, the container is missing `SITE_URL`.
>
> If the public domain ever changes, update both the build-arg / workflow and
> `.env.production`, then publish a new image.

### Docker Hub login

On your machine, once:

```bash
docker login
```

On the VPS, only if the Hub repository is private:

```bash
docker login
```

---

## Part 2 — Prepare the server

Once per server.

```bash
scp deploy/vps-setup.sh you@vps:/tmp/
ssh you@vps 'sudo bash /tmp/vps-setup.sh'
```

It prints what currently owns ports 80 and 443, installs Docker if missing,
installs `certbot`'s nginx plugin and `htpasswd`, and creates `/opt/smartmove`.
It does not touch nginx's global configuration or the firewall.

---

## Part 3 — DNS

Add an `A` record for the subdomain pointing at the VPS, then confirm it has
propagated before asking certbot for a certificate:

```bash
dig +short smartmove4u.muradsprojects.co.uk
```

If that returns Cloudflare addresses rather than your VPS IP, the record is
proxied. Either set it to DNS-only while you issue the certificate, or use a
Cloudflare origin certificate instead of certbot.

---

## Part 4 — nginx

```bash
scp deploy/nginx/smartmove-zones.conf you@vps:/tmp/
scp deploy/nginx/smartmove4u.muradsprojects.co.uk.conf you@vps:/tmp/
```

On the VPS:

```bash
sudo mv /tmp/smartmove-zones.conf /etc/nginx/conf.d/
sudo mv /tmp/smartmove4u.muradsprojects.co.uk.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/smartmove4u.muradsprojects.co.uk.conf \
            /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

`smartmove-zones.conf` holds the rate-limit zones, which have to live in
nginx's `http` block. Every name in it is prefixed `smartmove_` so it cannot
clash with the other sites on the server.

Then issue the certificate. certbot rewrites the site file to add the TLS
server block and the HTTP redirect:

```bash
sudo certbot --nginx -d smartmove4u.muradsprojects.co.uk
```

`nginx -t` will fail at this point with "connection refused" only when nginx is
reloaded _and_ the app is not running yet. That is harmless; carry on.

---

## Part 5 — Configure and start

```bash
scp docker-compose.prod.yml you@vps:~/smartmove/
cp .env.production.example .env.production   # fill it in locally
scp .env.production you@vps:~/smartmove/
```

Generate the two machine secrets rather than inventing them:

```bash
openssl rand -hex 24   # POSTGRES_PASSWORD
openssl rand -hex 32   # PAYLOAD_SECRET
```

Then on the VPS:

```bash
cd ~/smartmove
chmod 600 .env.production
```

Create `update.sh` in that folder (paste the whole block):

```bash
cat > ~/smartmove/update.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [[ -f docker-compose.prod.yml ]]; then
  COMPOSE_FILE=docker-compose.prod.yml
elif [[ -f docker-compose.yml ]]; then
  COMPOSE_FILE=docker-compose.yml
else
  echo "No compose file in $(pwd)." >&2
  exit 1
fi

COMPOSE=(docker compose -f "$COMPOSE_FILE" --env-file .env.production)

if [[ -n "${1:-}" ]]; then
  pin="${1#v}"
  sed -i -E "s|^APP_IMAGE=(.*):.*$|APP_IMAGE=\1:$pin|" .env.production
  echo "Pinned to $pin"
fi

echo "Current image:"
"${COMPOSE[@]}" images app || true
"${COMPOSE[@]}" pull app
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
EOF
chmod +x ~/smartmove/update.sh
```

Then:

```bash
cd ~/smartmove
docker compose -f docker-compose.prod.yml --env-file .env.production pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

`update.sh` is not on `PATH`. Run it from this folder as `./update.sh`. If the
compose file is named `docker-compose.yml`, the script still finds it.

Watch the first boot. On an empty database you should see the migration run,
then the root account and starter pages:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f app
```

```
Migrating: 20260906_111931_initial
Migrated:  20260906_111931_initial (630ms)
Created root user you@example.com
Seeded 4 services
Seeded 9 pages
Seed complete.
```

Every later restart only checks that the root account still exists. It does
not overwrite pages the client has edited.

For a demonstration box, set `SEED_DEMO=true` as well. That adds the demo
listings and photography on first boot. Keep `SITE_NOINDEX=true` beside it.

---

## Part 6 — Protect the preview

While the site carries the demo properties, keep it off the open web. Their
photographs and written particulars belong to another agency (see
[client-content-required.md](client-content-required.md)).

`SITE_NOINDEX=true` in `.env.production` already blocks crawlers and sends
`noindex` on every page. Add a password as well:

```bash
sudo htpasswd -c /etc/nginx/.htpasswd-smartmove smartmove
sudo sed -i 's/# auth_basic/auth_basic/' \
  /etc/nginx/sites-available/smartmove4u.muradsprojects.co.uk.conf
sudo nginx -t && sudo systemctl reload nginx
```

Remove both when the site carries only Smart Move's own content, and set
`SITE_NOINDEX=false` at the same time.

---

## Part 7 — Check it

```bash
curl -sI https://smartmove4u.muradsprojects.co.uk/healthz    # 200
curl -s  https://smartmove4u.muradsprojects.co.uk/robots.txt # Disallow: / while noindex
```

Then in a browser:

- The home page renders with the Smart Move logo.
- `/properties` lists the properties and the filters work.
- A property page opens and its gallery works on a phone.
- `/admin` signs in with `ROOT_ADMIN_EMAIL` and `ROOT_ADMIN_PASSWORD`.
- Submitting an enquiry stores it under Enquiries and sends the email.

Keep `ROOT_ADMIN_EMAIL` in `.env.production` so the owner row stays hidden
from other admins. `ROOT_ADMIN_PASSWORD` is only used when that account is
created.

---

## Routine operations

### Deploy a new version

`update.sh` is a file in the project folder, not a package. Create it once on
the VPS (same block as in Part 5). Then:

```bash
cd ~/smartmove
./update.sh 1.3.1
```

After that, each release is:

```bash
./deploy/release.sh patch                    # laptop: build and push Docker Hub
ssh you@vps 'cd ~/smartmove && ./update.sh 1.3.1'
```

The script pins `APP_IMAGE` in `.env.production`, pulls, restarts, and waits
for the health check. Migrations apply when the new container connects.

### New project on the same VPS

Once per site, on the VPS:

```bash
APP=~/other-project
mkdir -p "$APP"
# create update.sh with the Part 5 heredoc, but write to $APP/update.sh
chmod +x "$APP/update.sh"
chmod 600 "$APP/.env.production"
cd "$APP" && ./update.sh 1.0.0
```

Point `APP_IMAGE` in that folder's `.env.production` at that project's Hub
image (`muradkamali/other-project:1.0.0`).

### Roll back

```bash
./update.sh 1.3.0
```

Rolling back the image does not roll back the database. A release that adds a
migration is not reversible by this route; restore from a backup instead
([backups.md](backups.md)).

### Logs

```bash
cd /opt/smartmove
C="docker compose -f docker-compose.prod.yml --env-file .env.production"
$C logs -f app                 # live
$C logs --tail=200 app         # recent
$C logs app | grep '"level":"error"'
sudo tail -f /var/log/nginx/smartmove.error.log
```

### Restart, stop

```bash
$C restart app
$C down          # keeps the volumes
```

Never `docker compose down -v` on the server: `-v` deletes the database and
every uploaded photograph.

### Re-apply the starter or demo content

Only while iterating, and never once the client has started editing, because
it overwrites their changes. From a machine that can run `pnpm seed` against
that database, or use **Load demo properties** on the dashboard if you only
need the listings.

### Update Postgres and the base image

```bash
$C pull && $C up -d
```

Take a backup first. Postgres major versions do not upgrade in place; pin
`postgres:17-alpine` and plan a `pg_dump`/restore when you move off it.

---

## Troubleshooting

| Symptom                                              | Cause and fix                                                                                                                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `502 Bad Gateway`                                    | The app container is not up, or `APP_PORT` and the nginx `upstream` disagree. Check `$C ps` and `ss -tlnp                                                                 | grep 3001`. |
| `denied` on `docker compose pull`                    | Not logged in to Docker Hub, or the Hub repo is private. Run `docker login` on the VPS.                                                                                   |
| Site loads but every link points at `localhost:3000` | The image was built with the wrong `NEXT_PUBLIC_SITE_URL`. It is baked in at build time: rebuild with `./deploy/release.sh` so the build-arg is the public URL.           |
| Enquiry email "View in admin" points at localhost    | The container is missing runtime `SITE_URL`. `docker-compose.prod.yml` should set `SITE_URL: ${NEXT_PUBLIC_SITE_URL}`. Restart the stack; no rebuild needed for this one. |
| `exec format error`                                  | An arm64 image on an x86-64 host. Always build with `--platform linux/amd64` (the release script does). Do not push a default Apple Silicon build.                        |
| Migration says it is waiting for a batch             | A development-mode command ran against this database and wrote a `batch = -1` row. See [operations.md](operations.md).                                                    |
| Enquiries stored but no email                        | `EMAIL_PROVIDER` is still `console`, or Resend is rejecting the sender. Resend only accepts a `from` on a domain verified with it, or its sandbox address.                |
| Uploads vanish after a deploy                        | The `media` volume is not mounted. `docker volume ls` should show `smartmove_media`.                                                                                      |

---

## What has to be backed up

Two things, and the database alone is not enough:

- the `postgres_data` volume — all content and enquiries
- the `media` volume — every uploaded photograph

See [backups.md](backups.md).
