# Project handoff

A complete replacement for smartmove4u.co.uk: a modern, responsive letting
agency website with a CMS the business owner can run without a developer.

Everything is built and verified. What remains is content the client has to
supply, listed in [client-content-required.md](client-content-required.md) and
summarised at the end of this document.

---

## What was built

### The public website

| Page                           | Notes                                                                                                                                                                                                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Home**                       | Hero with two calls to action, three highlights, introduction, featured properties, landlord and tenant sections, why-choose-us, closing call to action. Every word is editable.                                                                     |
| **Properties**                 | Responsive cards with photo, rent, area, bedrooms, bathrooms, type and status. Filters for minimum bedrooms, maximum rent and property type, plus four sort orders. Filters live in the URL so results are shareable and server-rendered. Paginated. |
| **Property detail**            | Gallery with keyboard support, full facts panel, key features, description, map link, a sticky enquiry form on desktop, and other available properties.                                                                                              |
| **Landlords**                  | Services, what is included, how letting works, fees, and a valuation request form.                                                                                                                                                                   |
| **Tenants**                    | How renting works, the four-step process, deposits, referencing, permitted payments.                                                                                                                                                                 |
| **Services**                   | CMS-managed entries, each with its own page. Four are seeded: property management, tenant finding, rent collection, EPCs.                                                                                                                            |
| **About**                      | Editable, with placeholder copy clearly marked for client review.                                                                                                                                                                                    |
| **Contact**                    | Phone, email, address, opening hours and map link, all from Business Details, plus a general enquiry form.                                                                                                                                           |
| **Register your requirements** | Captures what an applicant is looking for when nothing suitable is available.                                                                                                                                                                        |
| **Legal**                      | Privacy policy, cookie policy, terms of use and tenant fees, all CMS pages with clearly-marked placeholders.                                                                                                                                         |
| **404 and error pages**        | Branded, with useful onward links. No stack traces in production.                                                                                                                                                                                    |

### The CMS

The admin panel at `/admin` was customised specifically for a non-technical
owner:

- **Four sidebar groups**: Properties, Website content, Enquiries, Settings.
  None of Payload's internal collections are exposed.
- **Plain-English labels throughout.** "Availability", not "status". "Business
  Details", not "GlobalSettingsConfiguration". Select options read as
  sentences: "Let — hide from the website".
- **The property form is split into four tabs**, with everything needed to
  publish on the first one, in the order an agent reads it off a property
  sheet. Adding a complete property takes well under two minutes.
- **The slug and publish date fill themselves in.** The owner never sees a URL
  field they have to think about.
- **Photos are drag-and-drop and reorderable.** The first photo is the main
  photo, and the tab says so.
- **One publish control.** Properties use a single Availability field rather
  than a status field plus a draft toggle, which would have been two competing
  answers to "is it live?".
- **The rich-text toolbar is restricted** to paragraphs, headings, bold,
  italic, lists and links, so nothing an editor writes can break the design.
- **Nine curated page sections** rather than a free-form page builder.
- **Live preview** at three breakpoints.
- Pages and services keep version history, so an editor can undo.

### Enquiries

Four forms: general, property-specific, landlord, and register-your-requirements.
Each one validates on the server, is stored in Postgres, appears in the CMS,
and triggers an email to the office.

The property enquiry carries the property with it, so the notification names
the listing the person was looking at.

Spam is handled in four layers: a honeypot field, a check that the form was on
screen for at least two seconds, a rate limit of five submissions per form type
per client per ten minutes, and Cloudflare Turnstile when keys are configured.

Email delivery sits behind an adapter. Resend is implemented; swapping to
Postmark or Brevo is one new file. The enquiry is saved **before** the email is
attempted, so a provider outage never loses a lead.

### SEO

Per-page titles, descriptions and canonical URLs; Open Graph and Twitter cards;
a `sitemap.xml` built from live content; `robots.txt`; and Schema.org
structured data for `RealEstateAgent`, `BreadcrumbList` and each property as a
`RealEstateListing`. No ratings or reviews are emitted, because inventing them
is both dishonest and against Google's guidelines.

Local SEO is handled by consistent name, address and phone data coming from one
place, and by natural language about Scunthorpe and North Lincolnshire rather
than keyword stuffing.

### Accessibility

Verified across every page: one `h1`, unbroken heading order, semantic
landmarks, every form control labelled, no image without alt text, keyboard
operation throughout including the mobile menu and the gallery, one visible
focus style, and `prefers-reduced-motion` respected.

Two real contrast failures were found and fixed: the brand green with white
text on the primary call to action, and the form placeholder colour.

---

## Architecture

```
Internet → Cloudflare/DNS → Nginx → Next.js + Payload → PostgreSQL
                                              ↓
                                     Docker volume (media)
```

One Next.js 16 application with Payload 3 inside it. Not two services, not two
repositories: one process, one deployment, one set of types.

The layer that matters most for the future is `src/lib/properties`. Every
component renders a `PropertySummary` or `PropertyDetail` defined there, never
a Payload document. Connecting a CRM or a portal feed later means writing a new
mapper behind the same five functions; nothing in `src/app` or `src/components`
changes.

Full detail: [architecture.md](architecture.md).

**Every page renders per request.** This was a deliberate trade-off: the Docker
build has no database, and a non-technical owner who saves an edit must see it
immediately. The cost is a handful of indexed queries against Postgres on the
same host. The route to caching, if traffic ever justifies it, is documented.

---

## Running locally

```bash
pnpm install
cp .env.example .env          # fill in DATABASE_URL, PAYLOAD_SECRET, SEED_ADMIN_PASSWORD
docker compose up -d          # Postgres, or use your own
pnpm migrate
SEED_DEMO_PROPERTIES=true pnpm seed
pnpm dev
```

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin

## Running the tests

```bash
pnpm test        # everything
pnpm test:int    # Vitest
pnpm test:e2e    # Playwright
```

Both need a migrated and seeded database. See [testing.md](testing.md) for the
two behaviours that will otherwise look like bugs (the form timing check and
the rate limiter).

## Production deployment

Full step-by-step instructions, from a bare Ubuntu server to a live HTTPS site:
[deployment.md](deployment.md).

```bash
git clone <repo> /opt/smartmove && cd /opt/smartmove
cp .env.example .env && nano .env
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml run --rm --entrypoint sh migrate -c "pnpm seed"
```

Migrations run automatically before the app container starts.

## The CMS

The admin panel is at `/admin` on the live domain. The business owner's guide
is [cms-guide.md](cms-guide.md), written without technical language: how to
sign in, add a property, change the rent, add and reorder photos, mark a
property let agreed, edit page text, update contact details and read enquiries.

## Environment variables

Full reference: [environment-variables.md](environment-variables.md).

Required: `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`.
For email: `EMAIL_PROVIDER`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`.
For Compose: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.
Optional: Turnstile keys, analytics provider and ID.

---

## What was verified

| Check                                          | Result                                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| `pnpm typecheck`                               | Passes, strict mode                                                            |
| `pnpm lint`                                    | Passes, no suppressions                                                        |
| `pnpm format:check`                            | Passes                                                                         |
| `pnpm test:int`                                | 56 tests pass                                                                  |
| `pnpm test:e2e`                                | 21 tests pass across desktop and mobile                                        |
| `pnpm build`                                   | Passes                                                                         |
| Docker image builds                            | Yes, multi-stage, non-root, ~184 KB of compressed JS on the home page          |
| `docker compose -f docker-compose.prod.yml up` | Full stack starts, migrations apply, health check green                        |
| Database persists a redeploy                   | Verified: `down` then `up`, all content intact                                 |
| Media persists a redeploy                      | Verified: 120 files intact and still served                                    |
| Backup script                                  | Verified: dumps database and media, checks both archives are readable          |
| Restore script                                 | Verified: database and media deleted from a running stack and fully recovered  |
| Nginx configuration                            | Validated with `nginx -t` against a real certificate                           |
| Migration from scratch                         | Verified: reproduces the identical 82-table schema on an empty database        |
| Responsive                                     | No horizontal overflow at 320, 375, 390, 768, 1024, 1440 or 1920 px            |
| Accessibility                                  | One `h1` per page, no heading skips, no unlabelled inputs, no missing alt text |
| Console                                        | No application errors                                                          |

---

## Client information still needed

Full list with context: [client-content-required.md](client-content-required.md).

**Blocking launch, because they are legal requirements for a letting agent in
England:**

1. Redress scheme and membership number
2. Client Money Protection scheme and membership number
3. Deposit protection scheme
4. The full permitted-payments schedule for the tenant fees page
5. Privacy policy review by the client and their solicitor
6. Terms of use review

**Blocking launch, because the old site contradicted itself:**

7. Is the management fee 8% or 10%? Both appeared on the old site.
8. What is in the Silver, Gold and Platinum packages?
9. Is the EPC price still £69.99?
10. Are mortgages still offered, and under whose FCA authorisation?
11. Are residential sales still offered?

**Needed for the site to look finished:**

12. Logo files, favicon, and confirmation of the brand colours
13. Real photographs for the home page hero, about, landlords and tenants pages
14. Real property photographs and listings, replacing the eight demo properties
15. The about page in the company's own words
16. Confirmation of the phone number, email, address and opening hours
17. Social media links, if any
18. A transactional email account and verified sending domain

---

## Known limitations

**Every page is server-rendered.** Deliberate, and explained above, but it does
mean the site depends on Postgres being responsive. The health check covers
this.

**Rate limiting is in memory.** Correct for the single container this ships
with. Running two instances would multiply the effective limit. Moving the
counters to Redis or Postgres is a contained change.

**Media is on a local Docker volume.** It persists redeploys and is backed up,
but two app instances would need shared storage. The upload layer is already
abstracted, so this is a storage-adapter plugin, not a rewrite.

**No Content-Security-Policy header.** The other security headers are set in
both the app and Nginx. A CSP needs a nonce strategy for Next's inline scripts,
which was not worth doing blind.

**Accessibility is verified by construction and by hand, not by an automated
audit.** Adding `@axe-core/playwright` to the e2e run would be a sensible next
step.

**Property versions are not kept.** Pages and services have version history;
properties do not, because drafts were switched off to keep a single publish
control. A mis-typed rent has to be re-typed.

**The seeded demo properties must be deleted before launch.** They are labelled
`[DEMO]` in the admin list and their photographs say "DEMO PHOTO", so they are
hard to miss, but nothing stops them going live.

**Lettings only.** No `listingType` split for sales, pending confirmation that
sales are still offered. Adding one is a select field and a migration.

---

## Recommended future enhancements

None of these block the MVP.

**Worth doing soon**

- A Content-Security-Policy header
- `@axe-core/playwright` in the end-to-end run
- A Google Business Profile, which will do more for local search than anything
  on the site itself
- Testimonials, once there is written permission from clients to quote them

**Worth doing if the business asks**

- Automated property alerts matching new stock to registered requirements. The
  requirements are already captured in a structured form, so the query is
  straightforward; what is needed is a decision on frequency, unsubscribe
  handling and marketing consent.
- Rightmove, Zoopla or OnTheMarket feeds. These are outbound exports and need
  the agency's branch ID and each portal's current specification. See
  [property-integration-future.md](property-integration-future.md).
- CRM integration, if the business already uses property management software.
  The domain layer was built for this.
- Object-storage-backed media, if the photo library grows large.
- ISR caching, if traffic grows enough to justify it.

**Probably not worth it**

- A landlord dashboard or tenant portal. Both are substantial products, and a
  small agency is usually better served by the phone.
- Online viewing booking. Worth revisiting only if the office finds itself
  spending significant time on scheduling.
