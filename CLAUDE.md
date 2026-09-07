# CLAUDE.md

Conventions and context for coding agents working on this repository.

Read [docs/architecture.md](docs/architecture.md) for the reasoning behind the
structure, and [docs/content-model.md](docs/content-model.md) before touching
any collection.

This project uses the Payload CMS skill at `.claude/skills/payload/`. Start
with `.claude/skills/payload/SKILL.md`, then `reference/` for detail.

---

## What this is

The website and CMS for Smart Move, a small independent letting agent in
Scunthorpe. One Next.js 16 application with Payload 3 inside it, PostgreSQL,
deployed with Docker Compose behind Nginx on a VPS.

The client is not technical. **The admin experience is a product feature, not
an implementation detail.** When a change would make the CMS harder for a
non-technical person to use, that is a reason not to make it.

The other constant is scale: this is a small business site. Prefer the simplest
solution that is production quality. Do not add microservices, abstraction
layers, state management, or dependencies the site does not need.

---

## Commands

```bash
pnpm dev                    # development server
pnpm build                  # production build
pnpm typecheck              # tsc --noEmit
pnpm lint                   # eslint
pnpm format                 # prettier --write
pnpm test                   # int + e2e
pnpm test:int               # vitest
pnpm test:e2e               # playwright
pnpm seed                   # admin user + starter content
pnpm migrate                # apply migrations
pnpm migrate:create <name>  # create a migration from model changes
pnpm generate:types         # regenerate src/payload-types.ts
```

## Before considering work complete

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

All four must pass. **Fix errors; do not suppress them.** No broad
`eslint-disable`, no `@ts-expect-error` without a specific, explained reason.
`no-explicit-any` and `ban-ts-comment` are errors, not warnings, on purpose.

If you changed a collection, global or block, also run:

```bash
pnpm generate:types
pnpm migrate:create <descriptive-name>
```

Both the generated types and the migration must be committed.

---

## Project structure

```
src/
  app/
    (frontend)/       the public website. force-dynamic; see below.
    (payload)/        generated. Do not hand-edit importMap.js.
    robots.ts         must stay outside (frontend): /[slug] would match it
    sitemap.ts        same
    healthz/          health check for Docker and Nginx
  collections/        Properties, Pages, Services, Enquiries, Media, Users
  globals/            BusinessDetails, SiteSettings, HomePage
  blocks/             the nine CMS page sections
  access/             shared access-control functions
  fields/             shared field helpers (slugField)
  components/
    ui/               Button, Container, Section, Field, Badge, Icon, ...
    layout/           Header, Footer, MobileNav, CookieConsent, Analytics
    property/         PropertyCard, PropertyFilters, PropertyGallery, PropertyFacts
    forms/            the four enquiry forms and FormShell
    blocks/           RenderBlocks
    admin/            components rendered inside the Payload admin panel
  lib/
    properties/       the property domain layer. See below.
    forms/            zod schemas, spam checks, server actions
    email/            provider-agnostic adapter
    env.ts            the only place process.env is read
    logger.ts, seo.ts, structured-data.ts, site.ts, pages.ts, format.ts, cn.ts
  scripts/            seed.ts and seed-content.ts
  migrations/         generated. Never edit by hand.
```

---

## Conventions

### General

- TypeScript strict. No `any`.
- British spelling in all user-facing text, comments and documentation.
- Comments explain **why**, not what. If the code needs a comment to say what it
  does, rename something instead.
- Small files. If a component is over ~250 lines it is probably two components.
- No magic values. Labels, statuses and options live in one place and are
  imported.

### Components

Server components by default. Add `'use client'` only when the component needs
browser state, an event handler or a browser API. The current client components
are: `MobileNav`, `NavLinks`, `PropertyFilters`, `PropertyGallery`, the four
enquiry forms, `FormShell`, `CookieConsent` and `Analytics`. Adding to that list
should be a deliberate decision.

### Styling

Tailwind v4, configured through `@theme` in `src/styles/globals.css`. Use the
scales defined there (`navy-*`, `accent-*`, `ink-*`) rather than arbitrary
values.

**Do not pass a class to a component that conflicts with one it sets itself.**
There is no `tailwind-merge`; utilities in the same CSS layer resolve by
Tailwind's own sort order, not by the order in the string. Passing
`className="hidden"` to `ButtonLink`, which sets `inline-flex`, silently did
nothing and broke the mobile header. Wrap the component in a `<div>` instead.

The brand green (`accent-400`, `#8cc63e`) fails AA against white. Use it with
`text-navy-950`, or use `accent-700` or darker when it must carry white text.

### The property domain layer

`src/app` and `src/components` must **never** import from `@/payload-types` for
property data. They import `PropertySummary` and `PropertyDetail` from
`@/lib/properties`, and `mappers.ts` converts Payload documents into those.

This is what makes a future CRM integration a new mapper rather than a rewrite.
See [docs/property-integration-future.md](docs/property-integration-future.md).

Reading a global or a page is different: those use the generated Payload types
directly through `src/lib/site.ts` and `src/lib/pages.ts`, because there is no
prospect of them coming from anywhere else.

### Data access

Every website query passes `overrideAccess: false`, so access control applies to
the site exactly as it would to an anonymous API request. The only exceptions
are the enquiry server actions and the seed, which are explicit about it.

Wrap per-request reads in React's `cache` so the header, footer and page body
share one query.

### Rendering

The frontend layout sets `export const dynamic = 'force-dynamic'`. This is
deliberate: the Docker build has no database, and a non-technical owner who
saves an edit must see it immediately. Do not add `generateStaticParams` back
without also solving the build-time database problem.

### Forms

Enquiries go through server actions in `src/lib/forms/actions.ts`. Adding a form
means: a Zod schema in `schemas.ts`, an action built on `handleSubmission`, a
client component using `useActionState` and `FormShell`, and fields on the
`Enquiries` collection.

`handleSubmission` already does the honeypot, timing, rate limit, validation,
Turnstile, storage and notification. Do not reimplement any of that.

The enquiry is stored **before** the email is attempted. A mail failure must
never look like a failed submission to the visitor.

### Admin branding

The admin panel is presented as Smart Move's own software. `admin.components.graphics`
overrides the sign-in logo and the navigation mark, `admin.meta` covers the tab
icon and page metadata, and one `i18n` override replaces the single interface
string that named the CMS.

If a Payload upgrade introduces new vendor-branded copy, the end-to-end test
`the admin panel carries no CMS vendor branding` will fail. Fix it with a
config override, not by editing anything in `node_modules`.

### CMS fields

- Labels are written for the owner, not the developer: "Availability", not
  "status"; "Business Details", not "GlobalSettingsConfiguration".
- Select options use plain English: "Let — hide from the website", not "let".
- Group fields into tabs so no more than about a dozen are visible at once, and
  put everything required to publish on the first tab.
- Use `admin.description` where it genuinely helps and nowhere else.
- Use `admin.condition` to hide fields that do not apply.
- Prefer sensible defaults over asking the owner a question.

### Production start-up

Two things happen automatically in the container, and both are load-bearing:

- `prodMigrations` in `payload.config.ts` applies migrations on the first
  database connection when `NODE_ENV=production`. This is why the VPS needs no
  source checkout and no migration step. Keep `src/migrations/index.ts` in the
  config's import graph.
- `src/instrumentation.ts` runs the seed on boot when `RUN_SEED_ON_BOOT` is
  set. Seeding cannot be a standalone script in production: the Next standalone
  build inlines the Payload config into its own server chunks, so `payload` is
  not resolvable from outside the server process. `src/scripts/seed-run.ts`
  holds the work; `src/scripts/seed.ts` is only the `pnpm seed` entry point.

`robots.ts` is `force-dynamic` on purpose. One image is built and deployed to
environments that disagree about whether they may be indexed, so `SITE_NOINDEX`
has to be read per request rather than baked in.

### Database

- Never edit a generated migration.
- `push` is on in development and off in production. **Never run a
  development-mode command against a production database** — it writes a
  `batch = -1` row that makes `payload migrate` stop and ask a question.
- Index anything used for filtering or lookup: `slug`, `status`, `featured`,
  `monthlyRent`, `bedrooms`, `propertyType`, `publishedAt`.
- Collection field names must not collide with Payload's internals. A `status`
  field on a collection with drafts enabled collides with the `_status` enum,
  which is one reason Properties has drafts off.

### Accessibility

Not optional, and cheaper to keep than to retrofit. Semantic elements, every
input labelled through the `Field` components, one focus style defined once in
`globals.css`, AA contrast, alt text required on uploads, correct heading order,
and `prefers-reduced-motion` respected.

Check contrast before introducing a colour. Two real bugs were caught this way:
the green CTA and the input placeholders.

### Logging

Use `logger` from `@/lib/logger`, never bare `console`. Log operational
failures only. **Never log passwords, tokens, or the contents of an enquiry.**
Pass identifiers instead.

---

## How to add things

**A page section (block)** — define it in `src/blocks/index.ts`, add it to
`pageBlocks`, add a case to `RenderBlocks`. The switch is typed against the
generated union, so a missing renderer fails the build. Then
`pnpm generate:types && pnpm migrate:create add-<name>-block`.

**A property field** — add it to the right tab in
`src/collections/Properties.ts`, add it to `PropertyDetail` in
`src/lib/properties/types.ts`, map it in `mappers.ts`, then render it. Then
regenerate types and create a migration.

**An enquiry type** — schema, action, form component, collection fields, and a
test in `tests/int/schemas.int.spec.ts`.

**A public page** — prefer a CMS page document over a hard-coded route. Only
add a route file when the page needs bespoke layout or query logic, as
`/properties` and `/services` do.

---

## Testing

Tests need a database: `pnpm migrate && SEED_DEMO_PROPERTIES=true pnpm seed`.

Two gotchas that will otherwise look like bugs:

- **Forms reject submissions made within two seconds of rendering.** That is the
  anti-bot timing check. E2E tests wait 2.5 seconds before submitting.
- **Enquiry rate limiting keys off `x-forwarded-for`.** The Playwright config
  sends a random address per run so repeated local runs do not trip the limit.

Do not assert on Payload's toast messages; they disappear on a timer. Assert on
the URL or on field values.

See [docs/testing.md](docs/testing.md).

---

## Content rules

**Do not invent facts about the business.** Every business fact in the seed came
from auditing the old website. Where something could not be confirmed, the
content carries `TODO: CLIENT CONTENT REQUIRED` and the item is listed in
[docs/client-content-required.md](docs/client-content-required.md).

This applies especially to legal and compliance text — fees, redress schemes,
deposit protection, privacy policies. Write a clearly-marked placeholder that
describes what is needed; never present invented legal wording as final.

**The demo properties are third-party content.** The six fixtures in
`src/scripts/demo-properties.json` and `src/scripts/demo-assets/` were scraped
from another Scunthorpe agency's live listings so the site demonstrates with
real photographs rather than placeholders. That content is not Smart Move's to
publish. Do not weaken any of the guards: the `SEED_DEMO_PROPERTIES` flag, the
`NODE_ENV === 'production'` refusal in the seed, or the warning it prints.

`pnpm scrape:demo` rebuilds the fixtures. It records what the source says;
`src/scripts/demo-properties.ts` decides how that is presented, including the
illustrative rents for the four source listings that were sale rather than
lettings. Keep those two concerns separate so re-scraping never overwrites a
judgement call.

---

## Git

- Small, logical commits. One coherent change each.
- Subject line only, imperative, under about 70 characters. No body.
- No AI attribution: no `Co-Authored-By` trailer, no "Generated with" footer.
- No em dashes in commit messages or PR descriptions.
- Never commit `.env`, secrets, or `node_modules`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
