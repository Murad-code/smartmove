# Smart Move

Website and CMS for [Smart Move](https://smartmove4u.co.uk/), an independent
letting agent in Scunthorpe.

One Next.js application with Payload CMS running inside it, backed by
PostgreSQL, deployed with Docker Compose behind Nginx on a Linux VPS.

- **Website** — `/`
- **Admin panel** — `/admin`

## Getting started

Requires Node 22+, pnpm 10, and PostgreSQL 14 or later (or Docker).

```bash
pnpm install
cp .env.example .env
```

Fill in `.env`. At a minimum you need `DATABASE_URL`, a `PAYLOAD_SECRET`
(`openssl rand -hex 32`), and a `SEED_ADMIN_PASSWORD`.

Start Postgres. The quickest way is the development Compose file, which
creates the `smartmove` database for you:

```bash
docker compose up -d
```

Its connection string is `postgres://postgres:postgres@127.0.0.1:5432/smartmove`.

If you already run Postgres on port 5432, the container's port mapping will be
shadowed by it. Either stop your local Postgres, or skip Compose entirely: run
`createdb smartmove` and point `DATABASE_URL` at your own instance.

Then set up the database and start the app:

```bash
pnpm migrate
SEED_DEMO_PROPERTIES=true pnpm seed
pnpm dev
```

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin, signing in with `SEED_ADMIN_EMAIL`

The seed writes the starter pages, services and business details. With
`SEED_DEMO_PROPERTIES=true` it also adds six demo properties from the fixtures
in `src/scripts/`. It is safe to re-run.

> The demo photographs and particulars were taken from another agency's live
> listings so the site demonstrates well. They are development scaffolding and
> must be deleted before launch. See
> [client-content-required.md](docs/client-content-required.md).

## Commands

| Command                      | What it does                              |
| ---------------------------- | ----------------------------------------- |
| `pnpm dev`                   | Development server                        |
| `pnpm build`                 | Production build                          |
| `pnpm start`                 | Run the production build                  |
| `pnpm typecheck`             | TypeScript, strict mode                   |
| `pnpm lint`                  | ESLint                                    |
| `pnpm format`                | Prettier                                  |
| `pnpm test`                  | Integration and end-to-end tests          |
| `pnpm test:int`              | Vitest only                               |
| `pnpm test:e2e`              | Playwright only                           |
| `pnpm seed`                  | Create the admin user and starter content |
| `pnpm migrate`               | Apply database migrations                 |
| `pnpm migrate:create <name>` | Create a migration from model changes     |
| `pnpm generate:types`        | Regenerate `src/payload-types.ts`         |

Run `pnpm typecheck && pnpm lint && pnpm test && pnpm build` before considering
any change finished.

## Project layout

```
src/
  app/
    (frontend)/     the public website
    (payload)/      the admin panel and Payload's REST API
    robots.ts       /robots.txt
    sitemap.ts      /sitemap.xml
    healthz/        health check
  collections/      Properties, Pages, Services, Enquiries, Media, Users
  globals/          Business Details, Website Settings, Home Page
  blocks/           the nine CMS page sections
  components/       ui, layout, property, forms, blocks, seo
  lib/
    properties/     the property domain layer
    forms/          validation, spam checks, server actions
    email/          provider-agnostic notification adapter
  scripts/          the seed, the demo fixtures and the scraper that builds them
  migrations/       generated database migrations
docker/             Dockerfile support, Nginx configuration
scripts/            backup.sh, restore.sh
docs/               everything below
tests/              int (Vitest), e2e (Playwright)
```

## Documentation

| Document                                                              | For                                             |
| --------------------------------------------------------------------- | ----------------------------------------------- |
| [architecture.md](docs/architecture.md)                               | How the application fits together and why       |
| [content-model.md](docs/content-model.md)                             | Every collection, global and block              |
| [cms-guide.md](docs/cms-guide.md)                                     | **The business owner.** Written without jargon. |
| [deployment.md](docs/deployment.md)                                   | Setting up a VPS from scratch                   |
| [backups.md](docs/backups.md)                                         | Backups, retention and restoring                |
| [operations.md](docs/operations.md)                                   | Logs, health, routine maintenance               |
| [environment-variables.md](docs/environment-variables.md)             | Every variable                                  |
| [testing.md](docs/testing.md)                                         | What is tested and how to run it                |
| [property-integration-future.md](docs/property-integration-future.md) | Connecting a CRM or portal feed later           |
| [client-content-required.md](docs/client-content-required.md)         | What we still need from the client              |
| [existing-site-audit.md](docs/existing-site-audit.md)                 | What the old site had, and its problems         |
| [product-requirements.md](docs/product-requirements.md)               | Requirements with acceptance criteria           |
| [project-handoff.md](docs/project-handoff.md)                         | Summary of what was built                       |
| [SECURITY.md](SECURITY.md)                                            | Security posture and the pre-launch checklist   |

[CLAUDE.md](CLAUDE.md) holds the conventions a coding agent needs.

## Deploying

See [deployment.md](docs/deployment.md). In outline:

```bash
git clone <repo> /opt/smartmove && cd /opt/smartmove
cp .env.example .env && nano .env
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml run --rm --entrypoint sh migrate -c "pnpm seed"
```

Migrations run automatically before the app container starts.
