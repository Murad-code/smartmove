# Existing site audit — smartmove4u.co.uk

Audited 6 September 2026 against the live site at https://smartmove4u.co.uk/.

## 1. Technical profile

| Item          | Observed                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Server        | Apache, `X-Powered-By: PHP/8.5.10`                                                                     |
| Caching       | Varnish (`x-varnish`, `via: 1.1 webcache2`)                                                            |
| Front end     | Hand-written CSS (`reset.css`, `layout.css`, `responsive.css`, `forms.css`), jQuery, Fancybox lightbox |
| Session       | `SIDSMARTMOVE` PHP session cookie set on every page, including anonymous browsing                      |
| Cache policy  | `Cache-Control: no-store, no-cache, must-revalidate` on HTML, plus `Expires: Thu, 19 Nov 1981`         |
| Property data | Rendered server-side from a database; a sort control exists but returns no results                     |

The stack is a bespoke PHP application rather than a recognised CMS. There is no visible
admin route, so content changes almost certainly require a developer or an FTP edit.

## 2. Sitemap

| Path                   | Title               | Notes                                             |
| ---------------------- | ------------------- | ------------------------------------------------- |
| `/`                    | Home                | Marketing page, service teasers                   |
| `/index`               | Home (duplicate)    | Same content as `/`, duplicate-content risk       |
| `/about`               | About Us            | Company positioning                               |
| `/properties`          | Properties to Let   | Listing page, currently empty                     |
| `/properties-for-sale` | Properties for Sale | Listing page, currently empty                     |
| `/property-management` | Property Management | Landlord services                                 |
| `/mortgages`           | Mortgages           | Mortgage brokerage                                |
| `/epcs`                | EPCs                | Energy Performance Certificates                   |
| `/contact`             | Contact             | Address, hours, enquiry form                      |
| `/terms`               | Terms & Conditions  | Website terms                                     |
| `/cookie-policy`       | Cookie Policy       |                                                   |
| `/sitemap`             | Sitemap             | HTML sitemap                                      |
| `/tenant-fee-guide`    | **404**             | Linked from the main nav and footer of every page |

## 3. Business information found on the site

These are the only hard facts the site states. They are carried into the new build as
seed values and must be confirmed by the client before launch.

- Trading name: Smart Move (footer uses "Smart Move Scunthorpe")
- Address: 96 Frodingham Road, Scunthorpe, North Lincolnshire, DN15 7JW, UK
- Telephone: 01724 856260
- Email: sales@smartmove4u.co.uk
- Opening hours: Monday to Friday 9:30am – 5:30pm; Saturday by appointment only; Sunday closed
- EPC price: £69.99 including VAT (advertised as "£69" in several call-to-action strips)
- Property management: "from 8%" on some pages, "from 10%" on others
- Management packages: Silver, Gold and Platinum
- Stated partnership with Pepperells solicitors for housing matters
- Stated branch partnerships in Grimsby, Bedford, Central London and North London

## 4. Services described

**Property management** — free market rental appraisals, applicant referencing and credit
checks, standing-order payment processing, repair and refurbishment coordination, granting
and renewing agreements, inspection coordination, deposit administration, inventories, rent
collection, monthly accounting, 24-hour landlord support, and flexible Silver/Gold/Platinum
packages.

**Lettings** — marketing through local newspapers, websites and the premises.

**Residential sales** — a "Properties for Sale" section exists but holds no stock.

**Mortgages** — an independent broker offering, including buy-to-let and adverse-credit cases.

**EPCs** — an explainer page plus an ordering offer at £69.99.

## 5. Problems found

### Critical

1. **`/tenant-fee-guide` returns 404** while being linked from the primary navigation and
   footer of every page. Letting agents in England must publish their permitted payments
   under the Tenant Fees Act 2019, so this is both a broken link and a compliance gap.
2. **No privacy policy.** The footer offers a cookie policy only. The site collects names,
   emails and phone numbers through the contact form, which needs a privacy notice and a
   lawful basis under UK GDPR.
3. **Contradictory pricing.** Property management is advertised "from 8%" on the EPC and
   properties pages and "from 10%" on the about and mortgages pages.
4. **No property stock is live.** Both listing pages show "No properties found matching your
   search criteria". The site's primary commercial purpose is not being served.

### Content

5. **Unfilled template placeholder** in the terms page: "without [business name]'s prior
   written consent".
6. **Dated positioning.** The about page calls Smart Move "Scunthorpe's newest independent,
   young and dynamic Residential Lettings Agents". The business is long established, so this
   copy now undersells it.
7. **Duplicate home page** at both `/` and `/index`.
8. **Legal disclaimer about sales particulars** is repeated verbatim on the lettings listing
   page, where it refers to "our sales" rather than lettings.

### Technical and UX

9. `no-store` on every HTML response defeats the Varnish layer in front of it and hurts
   repeat-visit performance.
10. A PHP session cookie is set for anonymous visitors before any consent interaction.
11. Property browsing has a sort control but no filtering by bedrooms, rent or property type.
12. There is no structured data, so property and business listings cannot produce rich
    results in search.
13. Navigation carries nine top-level items with overlapping meaning ("To Let", "For Sale",
    "Management", "EPCs", "Mortgages"), which reads as a service list rather than a
    task-oriented menu.
14. No obvious content management route for the owner.

## 6. Content migration mapping

### Can migrate largely as-is

| Content                                | Destination                       |
| -------------------------------------- | --------------------------------- |
| Address, phone, email, opening hours   | Business Details global           |
| EPC explainer page body                | Services entry / page             |
| Property management service list       | Landlords page and Services entry |
| Mortgages "reasons to choose" points   | Why-choose-us content             |
| Silver / Gold / Platinum package names | Landlord services                 |

### Should be rewritten

| Content                     | Reason                                                                   |
| --------------------------- | ------------------------------------------------------------------------ |
| About page copy             | "Newest… young and dynamic" no longer reflects an established agency     |
| Terms & Conditions          | Contains an unfilled placeholder; needs review by the client's solicitor |
| Cookie policy               | Must match the cookies the new site actually sets                        |
| Lettings listing disclaimer | Currently written for sales, not lettings                                |
| Home page marketing copy    | Thin and repetitive across the strip CTAs                                |

### Requires client confirmation

- Which management percentage is correct (8% or 10%)
- Whether mortgage brokerage is still offered, and under whose FCA authorisation
- Whether residential sales are still offered
- Whether the Grimsby / Bedford / London branch partnerships still stand
- Whether the Pepperells solicitors partnership still stands
- Current EPC price
- Company registration number and registered office, if a limited company
- Client Money Protection scheme and redress scheme membership (both are legally required
  disclosures for letting agents in England)
- Deposit protection scheme used
- The full permitted-payments schedule for the tenant fees page
- Confirmation of opening hours

### Should probably be removed

- The duplicate `/index` route
- The empty "Properties for Sale" section, unless sales are actively offered
- Fancybox and jQuery, replaced by native browser behaviour
- The "past properties" archive link, which sends users to dead stock

## 7. Opportunities the current site misses

- Filterable property search with bedrooms, rent ceiling and property type
- Mobile-first property galleries; the current lightbox is desktop-era
- A "register your requirements" capture for applicants when nothing matches
- Structured data for the agency and its listings
- A landlord valuation request as a distinct, prominent conversion path
- Self-service content editing for the owner
- Enquiries stored and reviewable rather than email-only
