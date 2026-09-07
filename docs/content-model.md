# Content model

Definitions live in `src/collections`, `src/globals` and `src/blocks`. After
changing any of them run `pnpm generate:types` and then
`pnpm migrate:create <name>`.

## Collections

### Properties (`properties`)

Lettings only. The previous site had an empty "for sale" section and we have
not confirmed whether sales are still offered, so no `listingType` split was
built. See [property-integration-future.md](property-integration-future.md).

Fields are grouped into tabs so no more than about a dozen are visible at once,
and everything required to publish is on the first tab.

**Property details**

| Field              | Type     | Required | Notes                                          |
| ------------------ | -------- | -------- | ---------------------------------------------- |
| `title`            | text     | ✓        | The heading on the website                     |
| `status`           | select   | ✓        | `available`, `let-agreed`, `let`, `draft`      |
| `monthlyRent`      | number   | ✓        | Indexed, used by the rent filter               |
| `deposit`          | number   |          | Hidden if blank                                |
| `bedrooms`         | number   | ✓        | Indexed, used by the bedroom filter            |
| `bathrooms`        | number   |          |                                                |
| `propertyType`     | select   | ✓        | Indexed. Seven types, friendly labels          |
| `displayLocation`  | text     | ✓        | The area shown publicly                        |
| `furnishedStatus`  | select   |          |                                                |
| `availableFrom`    | date     |          | Blank means available now                      |
| `shortDescription` | textarea | ✓        | Max 220 characters. Cards and meta description |
| `keyFeatures`      | text[]   |          | Up to 12 bullet points                         |
| `description`      | richText |          |                                                |

**Photos**: `images`, a multi-value upload. Order is meaningful and the first
image is the main photo.

**Address**: `addressLine1`, `addressLine2`, `townCity`, `county`, `postcode`.
Only the postcode is shown publicly, next to `displayLocation`.

**More details**: `epcRating`, `councilTaxBand`, `petsConsidered`,
`gardenIncluded`, `parking`.

**Sidebar**: `featured` (indexed), `slug` (unique, indexed, auto-filled),
`publishedAt` (indexed, defaults to now).

Drafts are deliberately **off**. `status` is the only publish control; two
competing "is it live?" switches would confuse a non-technical owner.

Public reads are constrained to `available` and `let-agreed` by the collection's
`read` access, so a hidden property cannot leak through any route.

### Pages (`pages`)

Every page other than the home page, the property listings and the services
list: Landlords, Tenants, About, Contact, Register interest, and the four legal
pages. Resolved by slug through `/[slug]`.

| Field    | Type   | Notes                            |
| -------- | ------ | -------------------------------- |
| `title`  | text   |                                  |
| `hero`   | group  | `heading`, `subheading`, `image` |
| `layout` | blocks | The page sections                |
| `slug`   | text   | Unique, indexed, auto-filled     |

Drafts with autosave are on, so an editor can work on a page without it going
live, and versions give them an undo.

### Services (`services`)

| Field      | Type     | Notes                                   |
| ---------- | -------- | --------------------------------------- |
| `title`    | text     |                                         |
| `summary`  | textarea | Max 220 characters                      |
| `icon`     | select   | One of eight from the built-in icon set |
| `audience` | select   | `landlords`, `tenants`, `everyone`      |
| `layout`   | blocks   | Same block set as pages                 |
| `order`    | number   | Lower comes first                       |
| `slug`     | text     | Unique, indexed                         |

### Enquiries (`enquiries`)

`create` is closed to everyone. The only path in is the server actions in
`src/lib/forms/actions.ts`, which pass `overrideAccess: true`.

| Field                                           | Applies to   | Notes                                             |
| ----------------------------------------------- | ------------ | ------------------------------------------------- |
| `kind`                                          | all          | `general`, `property`, `landlord`, `requirements` |
| `name`, `email`                                 | all          | Required                                          |
| `telephone`                                     | all          | Required for property and landlord enquiries      |
| `message`                                       | all          |                                                   |
| `enquiryTopic`                                  | general      |                                                   |
| `property`, `preferredViewing`                  | property     |                                                   |
| `landlord.postcode`, `landlord.serviceInterest` | landlord     |                                                   |
| `requirements.*`                                | requirements | Area, bedrooms, rent, type, move date             |
| `consentGivenAt`                                | all          | Set by the server as proof of consent             |
| `sourcePage`                                    | all          | Which page it came from                           |
| `handled`, `internalNotes`                      | all          | Staff triage, in the sidebar                      |

Everything except `handled` and `internalNotes` is read-only in the admin
panel: these are records of what someone submitted, not documents to edit.

No IP address or user agent is stored. Conditional fields mean a member of
staff only sees the fields relevant to the enquiry they are reading.

### Media (`media`)

Uploads to `MEDIA_DIR`. Accepts JPEG, PNG, WebP, AVIF and PDF, up to 15 MB.

Four generated sizes, all converted to WebP: `thumbnail` (400×300),
`card` (768×512), `wide` (1280), `hero` (1920). Focal point selection is on.

`alt` is required. `caption` is optional.

### Users (`users`)

| Field  | Notes                                                                                          |
| ------ | ---------------------------------------------------------------------------------------------- |
| `name` |                                                                                                |
| `role` | `admin` or `editor`. Field-level access is admin-only, so an editor cannot promote themselves. |

Sessions last eight hours, with `SameSite=Lax` cookies that are `Secure` in
production.

## Globals

### Business Details (`business-details`)

The single source of truth for anything otherwise repeated in templates.
Publicly readable, because the header and footer need it.

Tabs: Contact (name, strapline, two phone numbers, two emails, address, map
link), Opening hours (repeatable day/hours rows), Social media, and Company and
compliance (registered name, company number, VAT, redress scheme, Client Money
Protection, deposit scheme, footer note).

The compliance fields exist because letting agents in England must display
their redress and Client Money Protection membership.

### Website Settings (`site-settings`)

Tabs: Branding (logo, footer logo, favicon), Main menu (items plus the header
button), Footer (three link columns plus the small-print row), Search engines
(title suffix, default description, default sharing image).

### Home Page (`home-page`)

A global rather than a page document because the home page has a bespoke
layout. Its fields map one to one onto the sections the design defines: hero,
highlights, introduction, featured properties, landlord section, tenant
section, why-us reasons, and the closing call to action.

## Blocks

Nine, deliberately. A general-purpose page builder would let the owner produce
layouts that do not match the design.

| Block                 | Purpose                                      |
| --------------------- | -------------------------------------------- |
| Text section          | Heading plus rich text                       |
| List of features      | 2–4 column grid of titled points             |
| Numbered steps        | A "how it works" sequence                    |
| Photo with text       | Image beside rich text, image on either side |
| Call to action        | Navy band with heading and up to two buttons |
| Available properties  | Pulls in current stock                       |
| Questions and answers | Native `<details>` accordion                 |
| Our contact details   | Reads from Business Details                  |
| Enquiry form          | General, landlord or requirements form       |

Adding a block means defining it in `src/blocks/index.ts`, adding it to
`pageBlocks`, and adding a case to `RenderBlocks`. The switch is typed against
the generated union, so a block without a renderer fails the build.

## Admin navigation

Four groups, matching how the owner thinks about the site:

```
Properties        Properties
Website content   Website pages, Services, Media, Home Page
Enquiries         Enquiries
Settings          People, Business Details, Website Settings
```

Payload's internal collections are not exposed. The rich-text toolbar is
restricted to paragraphs, h2–h4, bold, italic, lists and links, so nothing an
editor writes can break the page design.

The panel carries no CMS vendor branding: `admin.components.graphics` supplies
the sign-in logo (the Website Settings logo, or a wordmark) and the navigation
mark (`/brand-icon`, which follows the uploaded favicon). `admin.meta` points
the tab icon at the same route, and an `i18n` override replaces the one
interface string that named the CMS. The sidebar opens with a Dashboard link
back to the admin homepage, and the header has a Log out button beside the
profile icon.
