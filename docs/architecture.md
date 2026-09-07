# Architecture

## Overview

One Next.js application. Payload CMS runs inside it rather than as a separate
service, so there is a single process, a single deployment and a single set of
types shared between the CMS and the website.

```
Internet
   │
   ▼
Cloudflare / DNS
   │
   ▼
Nginx  ──────────── TLS, gzip, caching, rate limiting, security headers
   │
   ▼
Next.js + Payload  ── website (/) and admin panel (/admin) in one process
   │
   ▼
PostgreSQL          ── content and enquiries
   │
   ▼
Docker volume       ── uploaded property photographs
```

## Route layout

```
src/app/
  (frontend)/          the public website
    layout.tsx         header, footer, fonts, analytics, structured data
    page.tsx           home page
    properties/        listing and /properties/[slug]
    services/          overview and /services/[slug]
    [slug]/            every CMS page: landlords, tenants, about, contact, legal
    not-found.tsx      custom 404
    error.tsx          error boundary
  (payload)/           the admin panel and the Payload REST API, generated
  robots.ts            /robots.txt
  sitemap.ts           /sitemap.xml
  healthz/             health check for Docker and Nginx
  brand-icon/          compact mark from Website Settings (tabs and admin nav)
```

Route groups carry no URL segment, so `/[slug]` and `/robots.txt` sit at the
same level. Static routes win over the dynamic one, which is why `robots.ts`
and `sitemap.ts` live directly under `src/app` rather than inside
`(frontend)` — inside the group, `/[slug]` matched `/robots.txt` first.

## Layers

| Layer         | Location                                       | Responsibility                                              |
| ------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| Content model | `src/collections`, `src/globals`, `src/blocks` | Payload collections, globals and page sections              |
| Domain        | `src/lib/properties`                           | Property types, queries and mapping, independent of Payload |
| Data access   | `src/lib/site.ts`, `src/lib/pages.ts`          | Globals, pages and services, deduped per request            |
| Forms         | `src/lib/forms`                                | Zod schemas, spam checks, server actions                    |
| Email         | `src/lib/email`                                | Provider-agnostic notification adapter                      |
| Presentation  | `src/components`                               | UI primitives, layout, property and form components         |

## The property domain layer

Front-end components import from `@/lib/properties`, never from
`@/payload-types`. `src/lib/properties/types.ts` defines the shape the website
renders and `mappers.ts` converts Payload documents into it.

Replacing Payload with a CRM feed later therefore means writing a new mapper
and swapping the query functions. Nothing in `src/components` or `src/app`
changes. See [property-integration-future.md](property-integration-future.md).

## Rendering

Every page is server-rendered per request (`export const dynamic =
'force-dynamic'` on the frontend layout). Two reasons:

1. **The Docker build has no database.** Prerendering CMS pages would mean the
   image could only be built where Postgres is reachable, which is awkward on a
   fresh server and in CI.
2. **The owner sees edits immediately.** A non-technical user who saves a rent
   change and does not see it on the site will assume the CMS is broken.

The cost is a handful of indexed queries against a Postgres instance on the
same host, which is nothing at this site's traffic. Static assets and uploaded
media are cached hard by Nginx, which is where the real bandwidth is.

If traffic ever justifies caching HTML, the path is Next's ISR plus
`revalidatePath` calls in Payload `afterChange` and `afterDelete` hooks, keyed
on the affected slugs. That change is contained to the route files and the
collection configs.

## Client and server components

Server components by default. The only client components are the ones that
genuinely need browser state:

- `MobileNav` and `NavLinks` — the open panel and the current path
- `PropertyFilters` — writes filter state into the URL
- `PropertyGallery` — the selected photo
- The four enquiry forms and `FormShell` — `useActionState`
- `CookieConsent` and `Analytics` — the stored consent choice

## Forms

Enquiries are submitted through React server actions rather than route
handlers. Next verifies its own action token on every call, which gives CSRF
protection without a bespoke implementation, and the markup still renders
before JavaScript loads.

The flow is: honeypot and timing check → per-client rate limit → Zod validation
→ optional Turnstile → write to Postgres → send the notification. The enquiry
is saved before the email is attempted, so a mail provider outage never looks
like a failed submission to the person filling in the form.

## Media

Uploads go to the directory named by `MEDIA_DIR`, which is a named Docker
volume in production. Payload generates four sizes (thumbnail, card, wide,
hero) and converts everything to WebP.

Nothing in the application reads from disk directly; every URL comes from the
Payload document. Moving to S3-compatible storage is therefore adding a storage
adapter plugin in `payload.config.ts` and nothing else.

## Access control

| Collection      | Public read                       | Staff                |
| --------------- | --------------------------------- | -------------------- |
| Properties      | Only `available` and `let-agreed` | Full                 |
| Pages, Services | Published only                    | Full                 |
| Media           | Yes                               | Full                 |
| Enquiries       | No                                | Read, update, delete |
| Users           | No                                | Admins only          |

Enquiries have `create: () => false`. The only way one is created is the server
actions in `src/lib/forms/actions.ts`, which pass `overrideAccess: true`.

## Dependencies

Deliberately short. No UI library, no icon package, no date library, no
`clsx`/`tailwind-merge`, no email SDK. The icon set is 23 hand-written paths,
dates and currency use `Intl`, and Resend is called over its REST API with
`fetch`. Fewer packages means fewer security advisories to chase on a site that
nobody is paid to babysit.
