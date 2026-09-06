# Product requirements — Smart Move website

Derived from the project brief and the [existing site audit](existing-site-audit.md).
Every requirement carries an ID so tests and the handoff report can reference it.

## Goal

Replace smartmove4u.co.uk with a modern, responsive letting-agency website that generates
leads and that the owner, who is not technical, can maintain without a developer.

## Success criteria

1. A prospective tenant can find, filter and enquire about a property on a phone in under a
   minute.
2. The owner can add a complete property listing with photos in under two minutes.
3. Every piece of business-specific wording is editable in the CMS.
4. The site passes typecheck, lint, the automated test suite and a production build.
5. The whole stack runs from `docker compose up` with persistent database and media.

## Out of scope for the MVP

Rightmove/Zoopla feeds, automatic property-to-applicant matching emails, a landlord or
tenant portal, online viewing booking, and online payments. The property data layer is
designed so a CRM integration can be added later without rewriting the front end.

---

## Functional requirements

### Public website

| ID     | Requirement                             | Acceptance criteria                                                                                                                                                                                       |
| ------ | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PUB-1  | Home page                               | Hero with CTAs, intro, featured properties, landlord section, tenant section, why-choose-us, contact CTA. All copy from the CMS.                                                                          |
| PUB-2  | Property listing                        | Responsive cards showing image, rent, location, bedrooms, bathrooms, type and status; links to detail.                                                                                                    |
| PUB-3  | Property filtering                      | Filter by minimum bedrooms, maximum monthly rent, property type and status. Filters are URL state so results are shareable and server-rendered.                                                           |
| PUB-4  | Empty state                             | When no property matches, show a clear message plus a link to register requirements.                                                                                                                      |
| PUB-5  | Property detail at `/properties/[slug]` | Gallery, title, location, rent, deposit, bedrooms, bathrooms, type, available-from, furnished status, EPC, council tax band, key features, description, status, enquiry form, other available properties. |
| PUB-6  | Landlords page                          | Service explanation, management inclusions, why-choose-us, valuation request CTA. CMS-driven.                                                                                                             |
| PUB-7  | Tenants page                            | How renting works, viewings, application process, deposits, maintenance, permitted-payments link. CMS-driven.                                                                                             |
| PUB-8  | Services page                           | Lists CMS-managed service entries; each service has its own detail page.                                                                                                                                  |
| PUB-9  | About page                              | CMS-driven; no invented history.                                                                                                                                                                          |
| PUB-10 | Contact page                            | Phone, email, address, opening hours, map link, contact form, landlord and tenant CTAs, all from the Business Details global.                                                                             |
| PUB-11 | Legal pages                             | Privacy Policy, Cookie Policy, Terms, Tenant Fees, all CMS pages with clearly marked placeholder copy pending client and legal review.                                                                    |
| PUB-12 | Header                                  | Desktop: logo, primary nav, phone CTA. Mobile: hamburger with call and browse actions.                                                                                                                    |
| PUB-13 | Footer                                  | Contact details, nav columns, legal links, copyright, all CMS-driven.                                                                                                                                     |
| PUB-14 | 404 and error pages                     | Custom, branded, with useful onward links. Never expose stack traces in production.                                                                                                                       |

### Enquiries

| ID    | Requirement           | Acceptance criteria                                                                                                               |
| ----- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| ENQ-1 | General enquiry       | Name, email, telephone, enquiry type, message, consent.                                                                           |
| ENQ-2 | Property enquiry      | Property reference captured automatically, name, email, telephone, message, preferred viewing time, consent.                      |
| ENQ-3 | Landlord enquiry      | Name, email, telephone, property postcode, service of interest, message, consent.                                                 |
| ENQ-4 | Register requirements | Name, email, phone, preferred area, minimum bedrooms, maximum rent, property type, move date, notes, consent.                     |
| ENQ-5 | Storage               | Every submission is stored in Postgres and visible in the CMS.                                                                    |
| ENQ-6 | Notification          | Every submission triggers an email to the business through a provider-agnostic adapter. A failed email must not lose the enquiry. |
| ENQ-7 | Validation            | Shared schema validates on the server; errors are announced accessibly and tied to their fields.                                  |
| ENQ-8 | Spam protection       | Honeypot field, submission-timing check, and per-IP rate limiting.                                                                |
| ENQ-9 | Feedback              | Clear pending, success and failure states; the form does not silently fail.                                                       |

### CMS

| ID    | Requirement               | Acceptance criteria                                                                                                                               |
| ----- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| CMS-1 | Small navigation          | Properties, Website Pages, Services, Enquiries, Business Details, Media, Users. No technical collections exposed.                                 |
| CMS-2 | Plain-English labels      | No internal enum values or developer terminology surfaced to the owner.                                                                           |
| CMS-3 | Property form             | Grouped into tabs so no more than roughly a dozen fields are visible at once; the required fields to publish a property are all in the first tab. |
| CMS-4 | Image handling            | Drag-and-drop upload, reorderable gallery, required alt text, automatic responsive sizes.                                                         |
| CMS-5 | Status workflow           | Available, Let Agreed, Let, Draft, with friendly labels; only Available and Let Agreed appear publicly.                                           |
| CMS-6 | Roles                     | Admin manages everything. Editor manages properties, pages, services, media and enquiries but not users or roles.                                 |
| CMS-7 | Enquiries are read-mostly | Staff can read, mark handled, add notes and delete for GDPR erasure, but cannot fabricate submissions.                                            |
| CMS-8 | Business Details global   | Single place for company name, phones, emails, address, hours, socials, registration and compliance details.                                      |
| CMS-9 | Auto slug                 | Slug generated from the title, editable, unique, hidden behind an admin-only field position.                                                      |

### Non-functional

| ID    | Requirement     | Acceptance criteria                                                                                                                                                     |
| ----- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-1 | Responsive      | Verified at 320, 375, 390, 768, 1024, 1440 and 1920 px. Mobile layouts designed, not shrunk.                                                                            |
| NFR-2 | Accessibility   | WCAG 2.1 AA target: semantic landmarks, labelled inputs, keyboard operability, visible focus, AA contrast, alt text, heading order, reduced-motion support.             |
| NFR-3 | SEO             | Per-page metadata, canonicals, Open Graph, Twitter cards, `sitemap.xml`, `robots.txt`, RealEstateAgent and BreadcrumbList structured data.                              |
| NFR-4 | Performance     | Server components by default, `next/image` everywhere, no heavy client libraries, fonts self-hosted via `next/font`.                                                    |
| NFR-5 | Security        | Secrets only in env vars, hashed passwords, secure cookies, Payload access control on every collection, rate limiting, security headers, Postgres not publicly exposed. |
| NFR-6 | Privacy         | Explicit consent checkbox with a privacy-policy link on every form, minimal fields, deletable enquiries, no personal data in logs.                                      |
| NFR-7 | Data durability | Named Docker volumes for Postgres and media; documented, scripted, off-site backups with a tested restore.                                                              |
| NFR-8 | Portability     | Media storage abstracted so a move to S3-compatible storage is a config change. Property reads go through a service layer so a CRM can replace the source.              |
| NFR-9 | Quality gates   | `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` all pass, enforced in CI.                                                                                      |

---

## Content model summary

**Collections:** Users, Media, Properties, Services, Pages, Enquiries.
**Globals:** Business Details, Site Settings (includes navigation and footer).

Full field detail lives in [content-model.md](content-model.md).

## Known content gaps

Anything the audit could not confirm is tracked in
[client-content-required.md](client-content-required.md) and marked in the seed data with
`TODO: CLIENT CONTENT REQUIRED`. No facts about the business are invented.
