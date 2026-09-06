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
