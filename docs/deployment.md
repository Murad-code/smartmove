# Deploying to a VPS

The VPS never builds and never needs a source checkout. GitHub Actions builds
the image and publishes it to GitHub Container Registry; the server pulls it.

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

Once per release, from your machine.

```bash
git tag v1.0.0 && git push origin v1.0.0
```

That runs [`.github/workflows/release.yml`](../.github/workflows/release.yml),
which builds `linux/amd64` and pushes these tags to
`ghcr.io/murad-code/smartmove`:

| Tag             | Meaning                                           |
| --------------- | ------------------------------------------------- |
| `v1.0.0`, `1.0` | The exact release. Use this in production.        |
| `latest`        | Whatever was published most recently.             |
| `sha-abc1234`   | The commit, for tracing a mystery back to source. |

You can also publish without tagging from the Actions tab → Release → Run
workflow.

> Two different variables, same hostname:
>
> - **`NEXT_PUBLIC_SITE_URL`** is inlined into the JavaScript bundle at **image
>   build** time. Set it as a build-arg (`docker build --build-arg
NEXT_PUBLIC_SITE_URL=https://…`) or in `.github/workflows/release.yml`.
>   Changing it only on the server does not fix canonicals or Open Graph URLs.
> - **`SITE_URL`** is read at **runtime** for enquiry notification links and
>   password-reset / invite emails. `docker-compose.prod.yml` copies it from
>   `NEXT_PUBLIC_SITE_URL` in `.env.production`. If email links point at
>   localhost, the container is missing `SITE_URL`.
>
> If the public domain ever changes, update both the build-arg / workflow and
> `.env.production`, then publish a new image.

### The registry package is private

The image contains the demo photographs, which are not ours to republish, so
keep the GHCR package private and give the VPS a read-only token.

1. GitHub → Settings → Developer settings → Personal access tokens → **Tokens
   (classic)** → Generate new token, scope **`read:packages`** only.
2. On the VPS:

```bash
echo 'YOUR_TOKEN' | docker login ghcr.io -u Murad-code --password-stdin
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
scp docker-compose.prod.yml you@vps:/opt/smartmove/
scp deploy/update.sh you@vps:/opt/smartmove/
cp .env.production.example .env.production   # fill it in locally
scp .env.production you@vps:/opt/smartmove/
```

Generate the two machine secrets rather than inventing them:

```bash
openssl rand -hex 24   # POSTGRES_PASSWORD
openssl rand -hex 32   # PAYLOAD_SECRET
```

Then on the VPS:

```bash
cd /opt/smartmove
chmod 600 .env.production
docker compose -f docker-compose.prod.yml --env-file .env.production pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

Watch the first boot. On an empty database you should see the migration run and
then the seed:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f app
```

```
Migrating: 20260906_111931_initial
Migrated:  20260906_111931_initial (630ms)
Created admin user you@example.com
Seeded 4 services
Seeded 9 pages
Seed complete.
```

`RUN_SEED_ON_BOOT=true` only seeds a database with no users in it, so it is
safe to leave set: every later restart logs `Seed skipped: this site is already
set up` and changes nothing.

On the demonstration box, set `SEED_DEMO=true` and leave `RUN_SEED_ON_BOOT`
unset. That one flag loads the demo listings, the home page photography, the
figures and the reviews, and re-applies them on every boot, so a restart always
brings the demo back to a known state. Any edit made in the admin panel while
demonstrating is lost on the next restart, which is the trade for not having to
think about it.

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
- `/admin` signs in with `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.
- Submitting an enquiry stores it under Enquiries and sends the email.

**Change the admin password after the first sign-in**, and remove
`SEED_ADMIN_PASSWORD` from `.env.production` once you have.

---

## Routine operations

### Deploy a new version

```bash
git tag v1.0.1 && git push origin v1.0.1     # from your machine
ssh you@vps 'cd /opt/smartmove && ./update.sh v1.0.1'
```

`update.sh` pins the tag in `.env.production`, pulls, restarts and waits for the
health check, printing the last 50 log lines if it does not come up. Migrations
apply themselves as the new container connects.

### Roll back

```bash
./update.sh v1.0.0
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

### Re-apply the seed content

Only while a demo is being iterated on, and never once the client has started
editing, because it overwrites their changes:

```bash
# set RUN_SEED_ON_BOOT=force in .env.production
$C up -d && $C logs -f app
# then set it back to true
```

A box running `SEED_DEMO=true` already behaves this way and needs none of the
above.

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
| `denied` on `docker compose pull`                    | The VPS is not logged in to GHCR, or the token lacks `read:packages`. Repeat the `docker login` in Part 1.                                                                |
| Site loads but every link points at `localhost:3000` | The image was built with the wrong `NEXT_PUBLIC_SITE_URL`. It is baked in at build time: fix the build-arg / `SITE_URL` in the release workflow and publish again.        |
| Enquiry email "View in admin" points at localhost    | The container is missing runtime `SITE_URL`. `docker-compose.prod.yml` should set `SITE_URL: ${NEXT_PUBLIC_SITE_URL}`. Restart the stack; no rebuild needed for this one. |
| `exec format error`                                  | An arm64 image on an x86-64 host. The workflow builds `linux/amd64`; do not `docker load` an image built on an Apple Silicon Mac.                                         |
| Migration says it is waiting for a batch             | A development-mode command ran against this database and wrote a `batch = -1` row. See [operations.md](operations.md).                                                    |
| Enquiries stored but no email                        | `EMAIL_PROVIDER` is still `console`, or Resend is rejecting the sender. Resend only accepts a `from` on a domain verified with it, or its sandbox address.                |
| Uploads vanish after a deploy                        | The `media` volume is not mounted. `docker volume ls` should show `smartmove_media`.                                                                                      |

---

## What has to be backed up

Two things, and the database alone is not enough:

- the `postgres_data` volume — all content and enquiries
- the `media` volume — every uploaded photograph

See [backups.md](backups.md).
