# Environment variables

Copy `.env.example` to `.env` and fill it in. `.env` is never committed.

Variables beginning `NEXT_PUBLIC_` are compiled into the browser bundle and are
therefore public. Never put a secret in one.

## Required

| Variable               | Example                                          | Notes                                                                                                                                               |
| ---------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`         | `postgres://smartmove:…@postgres:5432/smartmove` | Use `postgres` as the host inside Docker, `127.0.0.1` locally.                                                                                      |
| `PAYLOAD_SECRET`       | 64 hex characters                                | Signs admin sessions. Generate with `openssl rand -hex 32`. Changing it signs everyone out.                                                         |
| `NEXT_PUBLIC_SITE_URL` | `https://smartmove4u.co.uk`                      | No trailing slash. Used for canonical URLs, `sitemap.xml`, Open Graph tags and the link in notification emails. Wrong value means wrong canonicals. |

## Email notifications

| Variable         | Default   | Notes                                                                                                                              |
| ---------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `EMAIL_PROVIDER` | `console` | `console` logs that a message would have been sent, without its contents. `resend` sends it.                                       |
| `RESEND_API_KEY` | —         | Required when the provider is `resend`.                                                                                            |
| `EMAIL_FROM`     | —         | Must be an address on a domain verified with the provider, e.g. `Smart Move Website <website@smartmove4u.co.uk>`.                  |
| `EMAIL_TO`       | —         | Where enquiry notifications go. Comma-separate for several. Falls back to the enquiries address in Business Details if left blank. |

Enquiries are stored before the email is attempted, so nothing is lost if
delivery fails. Failures are logged and the enquiry is still in the CMS.

## Optional

| Variable                         | Notes                                                                      |
| -------------------------------- | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile. Both keys must be set for the widget to appear.      |
| `TURNSTILE_SECRET_KEY`           | The secret half. Never exposed to the browser.                             |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER` | `plausible` or `ga4`. Blank means no analytics and no cookie banner.       |
| `NEXT_PUBLIC_ANALYTICS_ID`       | The Plausible domain or the GA4 measurement ID.                            |
| `NEXT_PUBLIC_PLAUSIBLE_HOST`     | Only for self-hosted Plausible.                                            |
| `MEDIA_DIR`                      | Where uploads are written. `/app/media` in the container, `media` locally. |

## Docker Compose only

`docker-compose.prod.yml` reads these to build `DATABASE_URL` and to configure
Postgres. Compose refuses to start if the first two are missing.

| Variable            | Notes                    |
| ------------------- | ------------------------ |
| `POSTGRES_USER`     | Database user.           |
| `POSTGRES_PASSWORD` | Use a long random value. |
| `POSTGRES_DB`       | Defaults to `smartmove`. |

## Seeding

| Variable               | Notes                                                                            |
| ---------------------- | -------------------------------------------------------------------------------- |
| `SEED_ADMIN_EMAIL`     | The first admin account.                                                         |
| `SEED_ADMIN_PASSWORD`  | Required. The seed refuses to run without it. Change it after the first sign-in. |
| `SEED_DEMO_PROPERTIES` | `true` adds eight obviously fake properties. Development only.                   |

## Backup script

| Variable        | Default                  | Notes                                                                                                                  |
| --------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `BACKUP_DIR`    | `/var/backups/smartmove` | Local backup location.                                                                                                 |
| `BACKUP_REMOTE` | —                        | An rclone remote such as `b2:smartmove-backups`. Leave blank and backups stay on the server only, which is not enough. |
| `KEEP_DAILY`    | `7`                      | Daily backups retained.                                                                                                |
| `KEEP_WEEKLY`   | `5`                      | Sunday backups retained.                                                                                               |

## Where each one is read

Everything goes through `src/lib/env.ts` rather than `process.env` scattered
through the codebase. Required variables are asserted at import time on a
production server, and skipped during builds and tests where no database
exists.

## Deployment-only variables

These are set in `.env.production` on the server and have no effect in
development.

| Variable                                            | Purpose                                                                                                                                                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `APP_IMAGE`                                         | Which published image to run, e.g. `ghcr.io/murad-code/smartmove:v1.0.0`. Pin a version tag in production so a rollback has somewhere to go.                                                            |
| `APP_PORT`                                          | The port on `127.0.0.1` that the host's nginx proxies to. Default `3001`. Nothing is published publicly.                                                                                                |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Credentials for the Postgres container. The app's `DATABASE_URL` is assembled from these by Compose.                                                                                                    |
| `SITE_NOINDEX`                                      | `true` blocks every crawler in `robots.txt` and sends `noindex` on every page. Leave `true` on a preview or staging deployment.                                                                         |
| `RUN_SEED_ON_BOOT`                                  | `true` seeds the starter content only if the database has no users, so it is safe to leave set. `force` re-applies the seed on every restart and overwrites the client's edits. Unset means never seed. |
| `SEED_DEMO_PROPERTIES_THIRD_PARTY_ACKNOWLEDGED`     | Must also be `true` before a production build will create the demo properties, because their photographs belong to another agency.                                                                      |
| `SEED_ASSET_DIR`                                    | Where the seed looks for brand marks and demo photographs. The production image sets this to `/app/seed-assets`; you should not need to.                                                                |

`NEXT_PUBLIC_SITE_URL` is the exception: Next inlines it into the browser
bundle at build time, so it is set in the release workflow as well as at
runtime. Changing it on the server alone is not enough.
