# Testing

```bash
pnpm test        # everything
pnpm test:int    # Vitest
pnpm test:e2e    # Playwright
```

Both suites need a database. Run `pnpm migrate` and `pnpm seed` first, with
`SEED_DEMO=true` so there is stock to browse and filter. The demo
stock comes from committed fixtures, so the tests never need network access.

## What is covered

### Integration (`tests/int`, Vitest)

| File                        | Covers                                                                                                                                                                                                                      |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schemas.int.spec.ts`       | Enquiry validation: required fields, email format, UK telephone formats, consent, trimming, message length, honeypot                                                                                                        |
| `spam.int.spec.ts`          | Honeypot detection, the submission-timing check, rate limiting per client and per form                                                                                                                                      |
| `filters.int.spec.ts`       | Parsing filters out of the URL and building them back, including that a visitor cannot ask for hidden statuses                                                                                                              |
| `format.int.spec.ts`        | Currency, dates, availability wording, pluralising, slug generation                                                                                                                                                         |
| `content-model.int.spec.ts` | Runs against Postgres: slug generation, automatic publish date, that `let` and `draft` properties are invisible to visitors, that enquiries cannot be created or read publicly, that business details are publicly readable |
| `live-preview.int.spec.ts`  | That live preview is enabled for the content that has a page and nothing else, the URLs the admin panel builds, and that the preview flag grants nothing without a signed-in member of staff                                |

### End to end (`tests/e2e`, Playwright)

Two projects: `desktop` (Chrome) and `mobile` (Pixel 7).

| File                       | Covers                                                                                                                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `browse.e2e.spec.ts`       | Home page, navigating to the listings, opening a property, filtering and that filters survive a reload, the empty state, the legal and contact pages, the custom 404                      |
| `enquiries.e2e.spec.ts`    | Successful general enquiry (console email only — never the sending API), and that validation errors appear against the right fields with `aria-invalid` set                               |
| `mobile.e2e.spec.ts`       | Opening the menu and navigating, closing with Escape, the call link, that cards stack in one column, and that nothing scrolls sideways at 320px                                           |
| `admin.e2e.spec.ts`        | The sidebar wording, the tabbed property form, and the whole owner workflow: add a property, see it live, mark it let, see it disappear, delete it, and filing photographs into folders   |
| `live-preview.e2e.spec.ts` | The preview pane on a page, a service, a hidden property and the home page, that an autosaved edit reaches the pane, and that the same edit is absent from what a signed-out visitor gets |

The admin file runs in serial mode because the lifecycle test depends on the
property it creates.

## Things worth knowing

**The forms reject submissions made within two seconds of the page rendering.**
That is the anti-bot timing check. E2E tests wait 2.5 seconds before pressing
submit. A new form test that submits immediately will fail with "We could not
send your message" and it is not a bug.

**Enquiry emails in e2e never call the sending API.** Playwright sends a
development-only header so even a reused `pnpm dev` with `EMAIL_PROVIDER=resend`
writes the notification to the console. Production ignores that header.

**Enquiry rate limiting keys off `x-forwarded-for`.** The Playwright config
sends a random address per run, so repeated local runs inside the ten-minute
window do not trip the five-per-form limit.

**Toasts are not asserted on.** Payload's success messages disappear on a
timer. The admin tests assert on the URL and on field values instead, which is
what made them stop being flaky.

**The e2e tests write to the development database.** They clean up the property
they create. Enquiries are left behind; delete them from the admin panel if
they get in the way.

## What is not tested

Framework internals, Payload's own admin UI beyond the parts this project
customised, and visual appearance. The brief asks for business-critical
behaviour, not coverage for its own sake.

Accessibility is handled by construction — semantic elements, labelled inputs,
one focus style, checked contrast ratios — and spot-checked by hand rather than
by an automated audit. Adding `@axe-core/playwright` to the e2e run would be a
sensible next step.

## CI

`.github/workflows/ci.yml` runs three jobs on every push and pull request:

1. **Static analysis** — format check, typecheck, lint, production build
2. **Tests** — migrations, seed, integration tests, Playwright, with a Postgres
   service container. The Playwright report is uploaded on failure.
3. **Docker** — builds the production image with layer caching

No secrets are used. The placeholder `PAYLOAD_SECRET` never touches anything
outside the job.
