# Connecting property data to a CRM later

For the MVP, Payload is the source of truth for properties. The business may
already use property management software, and may list on Rightmove, Zoopla or
OnTheMarket. No integration has been built, because that needs API credentials,
a member number and a data-format specification that we do not have.

What has been done is to make sure adding one later does not mean rewriting the
website.

## How the boundary works

```
src/app, src/components          ← never import from @/payload-types
        │
        ▼
src/lib/properties               ← the boundary
   types.ts       PropertySummary, PropertyDetail, PropertyFilters
   mappers.ts     Payload document → domain type
   index.ts       findProperties, findPropertyBySlug, findFeaturedProperties,
                  findRelatedProperties, findAllPropertySlugs
   filters.ts     URL query string ↔ PropertyFilters
   labels.ts      Enum value → human wording
        │
        ▼
Payload / PostgreSQL
```

Every component renders `PropertySummary` or `PropertyDetail`. None of them
knows Payload exists. Swapping the source of property data means writing a new
mapper and new query functions behind the same five exports.

This is checked by the type system rather than by convention: the components
take domain types as props, so importing a Payload document into one of them
would not compile.

## Adding a read-only feed

If the CRM can export properties, the smallest change is:

1. Write `src/lib/properties/crm.ts` exporting the same five functions, backed
   by the CRM's API.
2. Add a `PROPERTY_SOURCE` environment variable and pick the implementation in
   `src/lib/properties/index.ts`.
3. Hide the Properties collection from the admin panel (`admin.hidden`) so
   nobody edits data that will be overwritten.

Nothing in `src/app` or `src/components` changes.

Watch for:

- **Slugs.** `/properties/[slug]` is what Google has indexed. Derive slugs from
  the CRM's reference plus the title and keep them stable, or set up redirects.
- **Images.** Most feeds give absolute URLs on the CRM's domain. Either add
  those hosts to `images.remotePatterns` in `next.config.ts`, or mirror them
  into Media on import so they are served from your own domain and survive the
  CRM contract ending.
- **Latency.** The domain functions are wrapped in React's `cache`, which dedupes
  within a request but not across them. An HTTP-backed source would need real
  caching, which is also when Next's ISR becomes worth adding.

## Synchronising instead

If the CRM should feed Payload rather than replace it:

1. Add a scheduled task using Payload's jobs queue that pulls the feed and
   upserts into `properties`, matching on an external reference.
2. Add an `externalRef` field, unique and indexed, and make CRM-managed fields
   read-only in the admin panel.
3. Mark properties missing from a feed as `let` rather than deleting them, so a
   feed outage does not empty the website.

This keeps everything on this site's own database, so the website stays up if
the CRM does not.

## Rightmove, Zoopla and OnTheMarket

These are **outbound** feeds: they take data from an agent, they do not give it
out. They use BLM files or a member API and require an agent branch ID.

If the agency wants its Payload properties to appear on the portals, the work
is a scheduled export that writes a BLM file or posts to the portal API. That
is a self-contained job reading from the same domain layer, and it does not
touch the website.

**Do not build any of this without the credentials and the portal's current
specification.** The formats change and each portal has its own validation
rules.

## What was deliberately not built

- **Automatic matching** of registered requirements to new properties. The
  requirements are captured in a structured form (area, minimum bedrooms,
  maximum rent, property type, move date) so the query is straightforward when
  it is wanted, but automatic emails need a decision about frequency,
  unsubscribe handling and marketing consent that only the business can make.
- **A `listingType` split** for sales. The old site's sales section was empty
  and it is not confirmed whether sales are still offered. Adding a select field
  with a migration is a small change if the answer is yes; shipping a
  half-supported sales path would have been worse.
