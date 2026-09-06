You are acting as the senior software engineer, product engineer, UX engineer, technical architect, QA engineer, and DevOps engineer responsible for building a production-ready website for a small UK property letting agency.

Your job is to autonomously design, implement, document, test, and prepare the entire application for production deployment.

Do not stop after scaffolding the project.

Continue through the implementation in logical phases until the agreed MVP is fully implemented, tested, documented, and ready for deployment.

Use good engineering judgement whenever implementation details are not explicitly specified.

Do not ask me questions unless you encounter a genuinely blocking requirement that cannot reasonably be inferred.

When there are several valid implementation options, choose the simplest production-quality solution appropriate for a small business website.

---

# 1. PROJECT OVERVIEW

The client is a small independent UK property letting agency called:

Smart Move

Existing website:

https://smartmove4u.co.uk/

The current website is old, visually dated, difficult for the business owner to maintain, and appears to be running ageing infrastructure.

The purpose of this project is to completely replace the existing website with a modern, professional, responsive website that significantly improves the company's online presence.

The website should primarily act as:

1. A professional online presence for the letting agency
2. A property listing website
3. A lead-generation website
4. A simple content-managed website
5. A way for prospective tenants and landlords to contact the business

A major requirement is that the business owner is NOT particularly technical.

The CMS therefore needs to be intentionally simple.

Do not expose unnecessary technical concepts or configuration.

The owner should be able to log in and immediately understand how to:

- add a property
- edit a property
- mark a property as let
- upload property images
- change property details
- edit common website content
- update business contact information
- view enquiries

The admin experience is an important product feature, not merely an implementation detail.

---

# 2. PRIMARY PRODUCT GOAL

Build a clean, trustworthy, modern property letting website appropriate for a small established UK letting agency.

The website should make Smart Move appear:

- professional
- trustworthy
- established
- local
- approachable
- competent
- modern

The visual language should be comparable with modern independent estate agency / letting agency websites.

Avoid:

- flashy startup aesthetics
- excessive animation
- highly experimental layouts
- unnecessary complexity
- dashboard-style public pages
- generic SaaS-looking interfaces

The website should feel like a high-quality local property business.

---

# 3. TARGET USERS

There are three primary user groups.

## Prospective tenants

They want to:

- browse available properties
- understand rental costs
- see photos
- understand property features
- enquire about properties
- contact the agency
- register their interest

## Landlords

They want to:

- understand Smart Move's property management services
- understand why they should use the agency
- request more information
- enquire about letting or managing their property
- book/request a valuation or callback

## Smart Move staff / owner

They want to:

- manage properties
- upload images
- change rental prices
- change property availability
- update website text
- view enquiries
- update company information

They should NOT need development knowledge to perform any of those tasks.

---

# 4. TECH STACK

Use the following stack unless there is a significant technical reason not to.

Frontend / application:

- Next.js
- React
- TypeScript

CMS:

- Payload CMS

Database:

- PostgreSQL

Deployment:

- Docker
- Docker Compose

Reverse proxy:

- Nginx

Production environment:

- Linux VPS

Package manager:

Prefer pnpm.

Code should be production quality and strongly typed.

Use the latest stable, mutually compatible versions of Next.js, Payload CMS, React, PostgreSQL libraries, etc.

Before selecting versions, verify compatibility between Payload and Next.js.

Do not unnecessarily split this into separate frontend and backend repositories.

Prefer a single application / monorepo-style project where Payload and Next.js are integrated cleanly.

---

# 5. HIGH-LEVEL ARCHITECTURE

Production architecture should roughly be:

Internet
    |
    v
Cloudflare / DNS
    |
    v
Nginx
    |
    v
Next.js + Payload application
    |
    v
PostgreSQL

The application should run inside Docker.

PostgreSQL should run as a separate Docker service.

Persistent storage must be configured appropriately.

Uploaded media must survive container redeployments.

Environment-specific secrets must NOT be committed to Git.

Provide:

- .env.example
- Dockerfile
- docker-compose.yml or separate development / production compose configuration where appropriate
- Nginx production configuration
- health checks where appropriate

---

# 6. APPLICATION STRUCTURE

Organise the application cleanly.

Use clear separation between:

- CMS collections
- CMS globals
- application components
- page components
- forms
- server-side data fetching
- utilities
- types
- configuration
- styling
- tests

Avoid giant files.

Prefer reusable domain-focused components.

Keep abstractions pragmatic rather than over-engineered.

---

# 7. PUBLIC WEBSITE INFORMATION ARCHITECTURE

Create approximately the following sitemap.

## Home

Primary marketing page.

Should include:

- hero
- short company introduction
- prominent property search / browse CTA
- featured available properties
- landlord services section
- tenant section
- why choose Smart Move
- local / independent agency positioning
- strong enquiry CTA
- contact information
- footer

Potential hero CTA examples:

- View available properties
- Book a valuation
- Speak to our team

---

## Properties

Property listing page.

Features:

- responsive property cards
- property thumbnail
- rental price
- location
- bedrooms
- bathrooms where available
- property type
- status
- brief description
- link to details

Support simple filters such as:

- minimum bedrooms
- maximum monthly rent
- property type
- availability/status

Do not build an unnecessarily advanced property search engine.

Simple intuitive filtering is sufficient.

Support an empty state when no properties match.

---

## Property Detail

Dynamic route such as:

/properties/[slug]

Include:

- image gallery
- property title
- address / location
- monthly rent
- deposit if provided
- bedrooms
- bathrooms
- property type
- availability date
- furnished status
- EPC rating
- council tax band where available
- key features
- full description
- property status
- enquiry CTA
- related / other available properties if easy to support

The page should work particularly well on mobile.

Property enquiry buttons should clearly identify the property when the form is submitted.

---

## Landlords

Marketing page explaining services available to landlords.

Include sections such as:

- letting service
- property management
- tenant finding
- inspections
- rent collection
- maintenance coordination
- why use Smart Move
- landlord enquiry CTA
- valuation/callback CTA

All business-specific wording should be editable through Payload wherever sensible.

---

## Tenants

Include:

- how renting through Smart Move works
- viewing properties
- application process
- deposits
- maintenance / support information
- fees / permitted payments information where appropriate
- property search CTA
- contact CTA

Avoid making legal claims without editable CMS content.

---

## Services

Create a services overview with editable service entries.

Potential services based on the existing business:

- property management
- lettings
- tenant finding
- EPC-related information
- landlord support
- mortgages only if the business still offers this service

Do not hard-code assumptions that cannot later be changed.

Services should be manageable from the CMS.

---

## About

Include editable:

- company introduction
- local positioning
- history
- values
- team information if provided later

Do not invent company history or claims.

Use sensible placeholder content where real copy does not yet exist and clearly identify that it requires client review.

---

## Contact

Include:

- telephone
- email
- address
- opening hours
- contact form
- map/location option
- landlord enquiry CTA
- tenant enquiry CTA

Contact details should come from a global CMS configuration rather than being duplicated throughout the code.

---

## Legal pages

Prepare CMS-managed pages / templates for:

- Privacy Policy
- Cookie Policy
- Terms / relevant website terms
- Tenant Fees / permitted payment information

Do not invent legal content and present it as final.

Use clearly marked placeholder copy requiring professional/client review where necessary.

---

# 8. PROPERTY DATA MODEL

Create a Payload collection named something like:

Properties

Suggested fields:

- title
- slug
- status
- listingType if useful
- propertyType
- addressLine1
- addressLine2
- townCity
- county
- postcode
- displayLocation
- monthlyRent
- deposit
- bedrooms
- bathrooms
- furnishedStatus
- availableFrom
- councilTaxBand
- epcRating
- shortDescription
- description
- keyFeatures
- images
- featuredImage
- featured
- publishedAt
- SEO metadata
- createdAt
- updatedAt

Property statuses should include something like:

- Available
- Let Agreed
- Let
- Draft

Use CMS-friendly labels.

Avoid exposing internal enums directly where user-friendly labels would be better.

Property image upload should be easy.

Support reordering property images.

Use appropriate image optimisation.

---

# 9. CMS DESIGN

This requirement is extremely important.

Payload's admin panel must be customised to make it friendly for a non-technical business owner.

The admin navigation should be intentionally small.

Ideally the main navigation consists of roughly:

Properties

Website Content

Enquiries

Business Details

Media

Potentially:

Users

but only where needed.

Avoid exposing configuration collections unnecessarily.

Hide technical settings from normal users.

Use meaningful labels.

For example:

Do not display:

GlobalSettingsConfiguration

Instead display:

Business Details

Do not display:

PagesCollection

If a clearer label such as:

Website Pages

would make more sense.

Use field descriptions sparingly and only where they help.

Avoid overwhelming the owner with 40 fields at once.

Use:

- tabs
- groups
- conditional fields
- sensible defaults
- validation
- friendly help text

where useful.

---

# 10. CMS ROLES AND AUTHENTICATION

Implement CMS authentication.

At minimum support:

Admin

Optionally support:

Editor

Admin can manage everything.

Editor should be able to manage:

- properties
- pages/content
- enquiries where appropriate
- media

but should not manage system-level users/configuration unless needed.

The public website must never expose the Payload admin area unintentionally.

Use secure authentication configuration and environment variables.

---

# 11. WEBSITE CONTENT MANAGEMENT

Avoid making every sentence a separate database field.

Use a sensible balance.

Implement either Pages collections or structured Globals depending on the content type.

Suggested model:

Globals:

Site Settings
Contact / Business Details
Navigation
Footer

Collections:

Properties
Pages
Services
Enquiries
Media
Users

Potentially:

Testimonials

Only include Testimonials if they can easily be managed and are useful.

Avoid unnecessary CMS collections.

---

# 12. BUSINESS DETAILS GLOBAL

Create a global configuration for commonly reused information.

Fields could include:

- company name
- telephone
- secondary telephone
- email
- enquiries email
- address
- postcode
- opening hours
- social media links
- company registration details if required
- footer text
- map URL / map coordinates if needed

Website components should consume these values dynamically.

Do not duplicate contact information throughout templates.

---

# 13. ENQUIRY SYSTEM

Create contact/enquiry forms.

At minimum support:

## General enquiry

Fields:

- name
- email
- telephone
- enquiry type
- message
- consent checkbox

## Property enquiry

Fields:

- property
- name
- email
- telephone
- message
- preferred viewing details if useful
- consent checkbox

## Landlord enquiry

Fields:

- name
- email
- telephone
- property postcode
- service interested in
- message

All form submissions should:

1. validate input
2. be protected against spam
3. be stored in the database
4. send an email notification to the business

Use a proper transactional email provider rather than hosting an SMTP server on the VPS.

Structure email delivery behind a simple adapter/configuration so providers can be changed later.

Potential providers might include:

- Resend
- Postmark
- Brevo
- similar provider

Use environment variables for credentials.

Never commit credentials.

---

# 14. PROPERTY ALERT / REGISTER INTEREST

Implement a simple "Register your property requirements" feature.

Suggested fields:

- name
- email
- phone
- preferred area
- minimum bedrooms
- maximum monthly rent
- property type
- desired move date
- additional notes

Store submissions in Payload.

Do NOT initially build complex automatic email matching between properties and applicants unless it is trivial.

The MVP requirement is simply to capture the lead in a structured way.

---

# 15. FORM SECURITY

Implement:

- server-side validation
- sanitisation where appropriate
- bot/spam protection
- rate limiting where practical
- CSRF protections provided by framework where applicable
- honeypot and/or Turnstile-style protection

Do not expose secrets to the browser.

Return accessible validation errors.

---

# 16. DESIGN SYSTEM

Create a lightweight reusable design system.

Define reusable:

- typography
- spacing
- container widths
- buttons
- input fields
- cards
- badges
- section layouts
- headings
- alert/status components

Use CSS architecture appropriate to the project.

Tailwind CSS is acceptable and likely preferred if used consistently.

Avoid having dozens of arbitrary one-off values.

---

# 17. VISUAL DESIGN DIRECTION

The website should feel:

- clean
- premium but approachable
- modern
- trustworthy
- spacious
- professional

Use strong photography where relevant.

Property imagery should carry much of the visual weight.

Avoid clutter.

Use a restrained colour palette.

Do not copy the existing website design.

Preserve any useful brand colours where appropriate, but modernise the visual identity.

Create a polished responsive header.

Desktop:

logo | Properties | Landlords | Tenants | Services | About | Contact | CTA

Mobile:

clean hamburger navigation with obvious contact/property actions.

---

# 18. RESPONSIVE DESIGN

The entire website must be properly responsive.

Explicitly test:

- 320px
- 375px
- 390px
- tablet
- laptop
- desktop
- large desktop

Property cards and image galleries should be especially carefully handled.

Do not merely make desktop layouts shrink.

Design the mobile experience intentionally.

---

# 19. ACCESSIBILITY

Target WCAG 2.1 AA quality where practical.

Ensure:

- semantic HTML
- form labels
- keyboard navigation
- visible focus states
- sufficient contrast
- alt text support
- accessible navigation
- meaningful link/button labels
- appropriate heading hierarchy
- reduced-motion friendliness

Property images should support alt text from Payload.

---

# 20. SEO

Implement strong technical SEO.

Include:

- metadata
- page titles
- descriptions
- canonical URLs
- Open Graph
- Twitter/social metadata
- sitemap.xml
- robots.txt
- structured data where appropriate
- semantic headings
- performant HTML
- crawlable property pages

Use relevant Schema.org structured data where appropriate, such as:

- LocalBusiness / RealEstateAgent
- BreadcrumbList
- property-related structured data where valid

Do not fabricate ratings/reviews.

Support editable SEO fields in Payload without making SEO management overwhelming.

Prefer sensible defaults with optional overrides.

---

# 21. LOCAL SEO

Smart Move appears to serve the Scunthorpe area.

Optimise appropriately for local search without keyword stuffing.

Examples of concepts that may naturally appear:

- letting agents in Scunthorpe
- property management in Scunthorpe
- houses to rent in Scunthorpe
- landlords in Scunthorpe

Do not write spammy SEO copy.

Company address and contact information should be consistent throughout the website.

---

# 22. PERFORMANCE

Target strong Lighthouse scores.

Optimise:

- Next.js images
- fonts
- JavaScript bundle size
- caching
- database queries
- image sizes
- lazy loading
- server rendering

Avoid unnecessary client components.

Use server components where appropriate.

Do not ship large client-side libraries where browser-native functionality will suffice.

---

# 23. MEDIA MANAGEMENT

Configure Payload media uploads.

Support:

- JPG
- PNG
- WebP where appropriate
- modern formats where supported

Generate responsive image sizes where useful.

Allow:

- alt text
- filename
- optional caption

Uploaded files must persist between Docker deployments.

Document the production media storage strategy.

For initial VPS hosting, a persistent Docker volume is acceptable.

Design the implementation so that migration to object storage such as S3-compatible storage later would not require rewriting the entire application.

---

# 24. DATABASE

Use PostgreSQL.

Include:

- development configuration
- production environment configuration
- migrations
- seed data
- backups documentation

Do not rely on automatically mutating production schemas without proper migration handling.

Create database indexes where useful for:

- slug
- status
- featured
- common property filtering fields

Avoid premature optimisation.

---

# 25. SEED DATA

Create a development seed command.

Seed:

- admin user
- business settings
- example services
- example pages
- several realistic fake properties

Fake property content should clearly be development/demo content.

Do not copy copyrighted property descriptions from other websites.

---

# 26. EXISTING WEBSITE CONTENT

Review the existing website:

https://smartmove4u.co.uk/

Identify:

- existing pages
- existing services
- useful business information
- contact information
- current property-related workflows

Create a migration/content mapping document.

Do not blindly copy outdated content.

Categorise content into:

1. can migrate
2. should be rewritten
3. requires client confirmation
4. should probably be removed

Do not invent facts about Smart Move.

---

# 27. IMPORTANT PROPERTY MANAGEMENT DISCOVERY CONSIDERATION

The existing business may already use external property management software.

Potentially properties are also listed through:

- Rightmove
- Zoopla
- OnTheMarket
- another property CRM

Do not architect the application in a way that makes future integration unnecessarily difficult.

For the MVP, Payload may remain the source of property data.

However:

Create a clean property domain/service layer so that a future external CRM/API integration could replace or sync the data source without rewriting all frontend components.

Document this clearly.

Do NOT build Rightmove/Zoopla integrations unless API credentials and requirements are available.

---

# 28. ANALYTICS

Add support for privacy-conscious analytics.

Prefer:

- Google Analytics 4 if required
or
- Plausible / similar lightweight analytics

Keep analytics configuration behind environment variables.

Do not hard-code tracking IDs.

Respect cookie/consent requirements where applicable.

---

# 29. COOKIE CONSENT

If analytics or non-essential cookies require consent, implement a simple unobtrusive cookie consent mechanism.

Avoid giant cookie popups.

Provide:

- Accept
- Reject non-essential
- preferences if necessary

Do not block basic website operation.

---

# 30. ERROR HANDLING

Implement:

- custom 404 page
- graceful 500/error state
- property not found state
- form failure messages
- CMS error logging where appropriate

Do not expose stack traces or sensitive information in production.

---

# 31. LOGGING

Implement sensible application logging.

Avoid excessive logging.

Log meaningful operational errors such as:

- database failures
- email failures
- unexpected server errors

Do not log:

- passwords
- tokens
- personal form content unnecessarily

---

# 32. TESTING

Create an appropriate automated test suite.

At minimum include:

Unit/integration tests for important business logic.

End-to-end tests for major user flows.

Use Playwright for E2E unless there is a strong reason not to.

Important E2E flows:

1. Homepage loads
2. User navigates to properties
3. User opens property details
4. User filters properties
5. User submits property enquiry
6. User submits general enquiry
7. User opens mobile navigation
8. Important legal/contact pages load

CMS tests should validate key content models where practical.

Do not spend excessive time testing framework internals.

Focus on business-critical behaviour.

---

# 33. STATIC ANALYSIS

Configure:

- TypeScript strict mode
- ESLint
- formatting
- appropriate pre-commit or CI checks

The final project must pass:

- type checking
- linting
- tests
- production build

Fix errors rather than suppressing them.

Avoid broad eslint-disable comments.

---

# 34. CI

Create a basic GitHub Actions workflow.

On pull request / push:

- install dependencies
- typecheck
- lint
- test
- build

Optionally run Playwright where practical.

Keep secrets out of CI configuration.

---

# 35. DOCKER

Create production-quality container configuration.

Application Dockerfile should use:

- multi-stage build
- production dependencies only where possible
- non-root user where practical
- efficient caching

Provide a Docker Compose setup containing:

- application
- postgres

Potentially:

- nginx

depending on deployment architecture.

Use named persistent volumes.

Add restart policies suitable for production.

---

# 36. NGINX

Create a production Nginx configuration.

Requirements:

- reverse proxy to application
- HTTPS-ready
- forwarded headers
- appropriate upload/body limits for property photos
- static asset caching
- gzip/brotli if appropriate
- security headers where sensible

Assume TLS may be handled either by:

- Nginx + Certbot
or
- Cloudflare in front of the VPS

Document both options but choose one recommended deployment path.

---

# 37. VPS PRODUCTION DEPLOYMENT

Create comprehensive deployment documentation.

Assume:

Ubuntu Linux VPS.

Document:

1. server preparation
2. Docker installation
3. firewall
4. SSH security basics
5. repository deployment
6. environment variables
7. PostgreSQL setup
8. Docker Compose
9. Nginx
10. DNS
11. HTTPS
12. admin account creation
13. database migrations
14. initial seed/configuration
15. restarting
16. upgrading
17. rollback
18. logs
19. troubleshooting

Make commands copy/paste friendly.

---

# 38. BACKUPS

This is mandatory.

The VPS must not be the only place where data exists.

Design and document:

- automated PostgreSQL backups
- backup retention
- off-server backup strategy
- media backups
- restore procedure

Provide scripts where useful.

For example:

daily PostgreSQL dump

with retention such as:

- daily backups for 7 days
- weekly backups for several weeks

The exact implementation may use:

- S3-compatible object storage
- Backblaze B2
- another inexpensive off-site destination

Do not require a specific provider if credentials are unavailable.

Provide a configurable script.

Also document and test, where possible, how a backup is restored.

---

# 39. SECURITY

Use production-appropriate security practices.

Include:

- secure environment variable handling
- hashed passwords
- secure cookies
- HTTPS
- Payload access controls
- rate limiting
- input validation
- security headers
- no secrets in source
- safe database credentials
- minimal exposed ports
- PostgreSQL not publicly exposed
- backups
- dependency hygiene

Create:

SECURITY.md

with relevant operational guidance.

---

# 40. PRIVACY / UK GDPR CONSIDERATIONS

The application collects personal data through enquiry forms.

Design with UK GDPR principles in mind.

Include:

- explicit consent where appropriate
- clear privacy links
- minimal data collection
- appropriate retention consideration
- ability for enquiries to be removed from CMS
- no unnecessary personal information in logs

Do not present yourself as providing legal advice.

Clearly identify any policy text that requires business/legal review.

---

# 41. CONTENT PLACEHOLDERS

Where information is unknown, do NOT fabricate details.

Use markers such as:

TODO: CLIENT CONTENT REQUIRED

or structured placeholder content.

Create a document:

docs/client-content-required.md

List all information we need from the client, such as:

- logo files
- final brand colours
- telephone number confirmation
- email confirmation
- opening hours
- company address
- landlord service wording
- tenant information
- privacy policy
- cookie policy
- photographs
- testimonials
- property information
- company background
- social media links

---

# 42. DOCUMENTATION

Create a `/docs` directory.

At minimum produce:

docs/
    architecture.md
    cms-guide.md
    deployment.md
    backups.md
    environment-variables.md
    content-model.md
    client-content-required.md
    property-integration-future.md
    testing.md
    operations.md

README.md should provide the high-level developer onboarding.

---

# 43. CMS GUIDE FOR THE BUSINESS OWNER

Create a very simple guide aimed at a non-technical person.

Do NOT write it like developer documentation.

Explain tasks such as:

How to log in

How to add a property

How to change rent

How to add photos

How to reorder property photos

How to mark a property as Let Agreed

How to remove/unpublish a property

How to change website text

How to update contact information

How to view enquiries

Use simple language.

Avoid technical terminology.

---

# 44. CLAUDE.md

Create a useful CLAUDE.md in the repository root.

It should explain:

- architecture
- important commands
- project conventions
- testing requirements
- project structure
- coding expectations
- CMS conventions
- database conventions
- how to add new features
- what must be run before considering work complete

Future coding agents should be able to understand the repository quickly from CLAUDE.md.

---

# 45. ENGINEERING PRINCIPLES

Follow these principles throughout implementation.

Prefer:

simple solutions
clear code
strong typing
small components
clear naming
good UX
secure defaults
documented architecture
maintainability

Avoid:

unnecessary microservices
premature abstractions
huge dependency lists
clever code
duplicated business logic
giant components
magic values
unnecessary client-side state
unnecessary global state
complex CMS screens

Comments should generally explain WHY rather than simply restating WHAT the code does.

Code should be readable without excessive comments.

---

# 46. GIT WORKFLOW

Make small logical commits as implementation progresses.

Examples:

chore: initialise payload nextjs application

feat: add property content model

feat: build property listing pages

feat: add enquiry workflow

feat: customise payload admin experience

feat: add responsive marketing pages

test: add critical playwright journeys

chore: add production docker deployment

docs: add deployment and cms guides

Do not create one giant final commit.

---

# 47. IMPLEMENTATION PHASES

Work in phases.

Before each phase:

- understand the requirements
- inspect existing implementation
- identify dependencies

After each phase:

- run relevant tests
- typecheck
- lint where relevant
- update documentation
- commit logically

Do not repeatedly ask me whether to continue.

Continue autonomously.

---

# PHASE 0 — RESEARCH AND AUDIT

Before coding:

1. Inspect the existing Smart Move website.
2. Record its sitemap.
3. Record current features.
4. Identify content worth preserving.
5. Identify usability problems.
6. Identify obvious technical issues.
7. Identify missing opportunities.
8. Create:

docs/existing-site-audit.md

Then create:

docs/product-requirements.md

Translate this prompt into concrete requirements and acceptance criteria.

---

# PHASE 1 — PROJECT FOUNDATION

Set up:

- Next.js
- Payload CMS
- TypeScript
- PostgreSQL
- pnpm
- linting
- formatting
- environment configuration
- base application structure

Set up local development.

Make sure:

pnpm dev

successfully starts the application and CMS.

Create `.env.example`.

---

# PHASE 2 — CONTENT MODEL

Implement:

Users

Properties

Media

Services

Pages

Enquiries

Globals:

Site Settings
Navigation
Footer / shared content as appropriate

Create migrations.

Create seed data.

Verify collections through Payload admin.

---

# PHASE 3 — ADMIN EXPERIENCE

Customise Payload admin specifically for Smart Move staff.

Reduce navigation complexity.

Create human-friendly labels.

Implement conditional fields.

Organise property fields logically.

Make the property workflow intuitive.

Test manually by simulating:

"business owner wants to add a new 3-bedroom property in under two minutes."

Improve UX if the flow feels cumbersome.

---

# PHASE 4 — DESIGN SYSTEM

Build:

- typography
- colours
- containers
- buttons
- cards
- forms
- navigation
- footer
- reusable content blocks

Ensure mobile responsiveness.

---

# PHASE 5 — PUBLIC WEBSITE

Implement:

Home

Properties

Property Details

Landlords

Tenants

Services

About

Contact

Legal page templates

Integrate everything with Payload rather than hard-coding editable business content.

---

# PHASE 6 — ENQUIRIES

Implement:

General enquiry

Property enquiry

Landlord enquiry

Property requirements registration

Database storage

Email notifications

Validation

Spam protection

User feedback states

---

# PHASE 7 — SEO / ACCESSIBILITY / PERFORMANCE

Implement and audit:

metadata

sitemap

robots

structured data

Open Graph

accessibility

image optimisation

performance

mobile behaviour

---

# PHASE 8 — AUTOMATED TESTING

Implement:

unit/integration tests

Playwright E2E tests

Test critical user flows.

Run the full suite.

Fix failures.

---

# PHASE 9 — PRODUCTION INFRASTRUCTURE

Implement:

Docker

Docker Compose

Nginx

environment handling

persistent media storage

PostgreSQL production setup

health checks

backup scripts

deployment documentation

---

# PHASE 10 — FINAL QA

Before declaring the project complete, verify:

- homepage loads
- CMS login works
- properties can be created
- properties can be edited
- properties can be published
- images work
- property filtering works
- property pages work
- enquiry forms work
- email system is configurable
- CMS is usable
- mobile navigation works
- accessibility basics pass
- no obvious console errors
- TypeScript passes
- lint passes
- tests pass
- production build succeeds
- Docker image builds
- Docker Compose starts
- database persists
- uploads persist

Perform a final codebase review.

Remove:

- dead code
- debug logs
- unused dependencies
- temporary files
- placeholder implementation hacks

Document remaining client-dependent tasks.

---

# 48. DEFINITION OF DONE

Do not consider the project finished because:

"The main pages exist."

The project is complete only when:

The website is production-ready.

The CMS is usable by a non-technical customer.

The property workflow works end-to-end.

Forms work.

The database is persistent.

The website is responsive.

The application is tested.

The application builds.

Docker deployment works.

Documentation exists.

The VPS deployment process is documented.

Backups are addressed.

Client content requirements are documented.

Future property CRM integration is considered.

No obvious unfinished engineering work remains.

---

# 49. FINAL HANDOFF REPORT

At the end of the implementation create:

docs/project-handoff.md

Include:

## What was built

Summarise all implemented functionality.

## Architecture

Explain the final architecture.

## Running locally

Provide commands.

## Running tests

Provide commands.

## Production deployment

Point to deployment instructions.

## CMS

Explain where the admin panel is and how it works.

## Environment variables

List required configuration.

## Client information still needed

List unresolved content.

## Known limitations

Be transparent.

## Recommended future enhancements

Potential future items could include:

- Rightmove/Zoopla/CRM integration
- automated property alerts
- landlord dashboard
- tenant portal
- viewing booking system
- advanced analytics
- object-storage-backed media
- property import feeds

These should NOT block the MVP.

---

# 50. AUTONOMOUS WORKING INSTRUCTIONS

You have permission to:

- create files
- modify files
- install appropriate dependencies
- run development commands
- run migrations
- run tests
- run builds
- refactor code
- update documentation
- create Docker configuration
- create scripts
- make implementation decisions
- fix issues encountered during development

Do not stop and ask me for approval for routine engineering decisions.

If a dependency or approach proves unsuitable, change it.

If tests uncover bugs, fix them.

If architecture becomes unnecessarily complicated, simplify it.

If documentation becomes outdated during implementation, update it.

Keep the codebase in a working state throughout development.

---

# 51. IMPORTANT CONSTRAINT

This website is for a small real business.

Do not accidentally build enterprise software.

The correct solution is:

small
polished
reliable
secure
maintainable
easy to operate

not:

large
abstract
over-engineered
feature-heavy

The CMS experience and website polish are more important than architectural sophistication.

---

Begin by:

1. inspecting the current repository
2. inspecting the existing Smart Move website
3. creating the existing-site audit
4. creating product requirements
5. creating an implementation plan
6. creating/updating CLAUDE.md
7. beginning Phase 1

Then continue autonomously through the phases.

Do not stop after presenting the plan.

Execute the plan.