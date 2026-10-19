---
id: FE-071
title: Search discovery for public MirtPage showrooms and products
status: in_progress
related: [FE-070, BE-054, DEP-049]
owners: [product, frontend, search]
last_updated: 2026-10-18
change_level: L2
---

# FE-071 — Public showroom search discovery

## Problem and outcome

MirtPage behaves like an app, but its public Market, About, showroom and product
pages must still be understandable and discoverable from a normal web crawl.
Today the app lacks a sitemap, robots file and explicit per-page canonical URLs.
The outcome is a truthful, crawlable path from MirtPage's public introduction to
each eligible business and its published products, without changing the approved
visual design or promising search placement.

## Scope

- Give Market, About, Featured, active real-business showrooms and published
  product detail URLs concise, accurate titles, descriptions, social metadata
  and canonical URLs from the *currently configured* production origin.
- Honor an owner's saved Page title and Search and sharing description on the
  business showroom's metadata. Keep product detail metadata specific to its
  published product and business.
- Publish a bounded, paged XML sitemap of eligible canonical URLs and a robots
  file that identifies those sitemap pages while avoiding private workflows.
- Emit minimal page-representative structured data. MirtPage is a showroom and
  direct-contact platform; price, stock, reviews, checkout, delivery dates,
  physical shop addresses and merchant-listing eligibility are not inferred.
- Preserve crawlable `<a href>` product links and server-visible product content
  while keeping the interactive card behavior.
- Give visitors a simple server-rendered `/showrooms` directory linked from
  About. It provides a real internal path to eligible businesses that may not
  appear in the Market's initial map/product batch, without taking map space.

## Non-goals

- No purchase flow, Merchant Center feed, paid placement, automated Search
  Console submission or ranking claim.
- No locale-specific `hreflang` until each active language has a distinct,
  stable public URL. The current language cookie does not create alternate URLs.
- This tranche does not add Amharic/Afaan Oromo search-entry URLs. Cookie-only
  language selection may leave Google indexing mainly the default English copy.
  A later public-locale routing spec must give authored Market/About content
  stable URLs, update links and canonical/hreflang together, and keep merchant
  descriptions in their authored language rather than generating thin copies.
- No publication of draft, suspended, private, demo or support/tracking data.
- No switch of the active canonical origin ahead of the reviewed domain cutover
  in DEP-049.

## Contracts and invariants

- A public business URL is `/@{current-handle}`. A product URL is
  `/@{current-handle}?product={published-product-id}`. `ref`, search, filter and
  view parameters do not create more canonical pages.
- Only active, non-demo businesses and their published, non-service products
  enter the sitemap when the business has an approved, non-excluded public
  discovery profile and at least one published physical product. The directory
  uses the same eligibility; no draft, hidden or empty showroom is listed.
  An active demo remains visitable as an example but is
  explicitly `noindex`. A directly shared hidden/empty showroom also stays
  viewable but `noindex`; a missing, draft or suspended showroom remains absent.
- Product metadata and structured data exist only for a product in the same
  active showroom's public catalog. A stale or foreign product ID is `noindex`.
  No customer-private fields, account aliases, internal URLs or precise private
  locations enter metadata or sitemap output.
- Nonblank saved showroom `site_title` and `site_description` take precedence
  over the business-name and published-profile fallbacks in showroom title,
  description and social metadata. They do not replace the visible merchant
  identity or a product detail's product-specific title and description.
- Public tracking HTML entry pages keep their existing `noindex` and
  email-verification boundary, but robots permits their HTML to be crawled so
  a crawler can see that directive. Tracking APIs and private account paths
  remain disallowed; robots is never treated as access control.
- Sitemap pages contain at most 10,000 entries each. Database reads are bounded
  and return only handles and product IDs; a database failure does not produce a
  seemingly complete but stale index. Robots points to the actual pages.
- JSON-LD uses the visible business/product names and descriptions only. It is
  safely serialized so merchant-written text cannot inject HTML/script. Missing
  merchant data stays missing; no synthetic ratings, offers or stock claims.
- The existing product links retain real hrefs for crawlers, keyboard, new-tab
  and browser navigation. Client enhancement may handle an ordinary click.
- The directory shows only public business identity, its listed city and
  category when known, and a short merchant-authored introduction. It has one
  bounded keyset page at a time, an ordinary Next link, and distinct canonical
  URLs for subsequent pages. Invalid/exhausted cursors render Next's not-found
  segment with `noindex`; a streamed shared shell can retain HTTP 200 even
  though that segment renders a 404. There are no generated city or keyword
  doorways.
- A missing or draft showroom handle fails in the pre-render request boundary
  before the showroom loading shell streams. Its initial document responds
  HTTP 404 and `noindex` without
  exposing draft content. The page shows the existing MirtPage identity and
  active-language return action. Suspended showroom handling retains its
  existing inactive redirect. An active directly shared showroom remains
  viewable even when it is intentionally absent from directory and sitemap
  discovery. The guard runs only on direct showroom documents, selects status
  by indexed handle without caching, and fails closed on database errors;
  client navigation still uses the page's existing public-catalog checks.

## Scenarios

```gherkin
Scenario: A visitor and crawler reach a public product
  GIVEN an active real business with a published physical product
  WHEN the visitor or crawler follows About to the showroom directory and
    opens its showroom
  THEN the product card contains a resolvable link to the product detail URL
  AND the detail URL returns the product's server-visible name and description
  AND the showroom and product have distinct canonical URLs

Scenario: Tracking parameters do not duplicate pages
  GIVEN a public product URL with a discovery ref parameter
  WHEN its metadata is rendered
  THEN its canonical URL contains only the handle and product ID
  AND its social title and description identify the product and business

Scenario: Owner-edited search and sharing copy is used on the showroom
  GIVEN an owner has saved a nonblank Page title and Search and sharing description
  WHEN the business showroom metadata is rendered
  THEN its title, description and social metadata use those saved fields
  AND a published product detail retains its own product-specific metadata

Scenario: A crawler can read the tracking noindex directive
  GIVEN a public shipment-tracking entry URL requiring recipient verification
  WHEN a crawler reads robots and opens the HTML entry page
  THEN robots permits crawling that HTML URL and the response says noindex
  AND tracking APIs and authenticated account paths remain disallowed
  AND the crawler cannot view a recipient's shipment without verification

Scenario: Private and misleading entries stay out of search discovery
  GIVEN demo, draft, suspended, service-only or unpublished catalog data
  WHEN sitemap pages and page metadata are generated
  THEN no private or retired product URL enters the sitemap
  AND demo and invalid-product views do not request indexing

Scenario: Merchant-written text is inert in structured data
  GIVEN a visible product description containing HTML or script-like text
  WHEN its public HTML is rendered
  THEN structured data contains the text as escaped JSON
  AND it cannot create a second script or change the document

Scenario: Large public catalogs remain discoverable
  GIVEN more than one page of eligible public URLs
  WHEN a crawler reads robots and the sitemap pages
  THEN every eligible URL appears in exactly one bounded sitemap page
  AND no sitemap page exceeds 10,000 entries

Scenario: The directory exposes only actual public showrooms
  GIVEN approved real showrooms alongside demo, hidden and empty pages
  WHEN a visitor opens the directory and follows its Next link
  THEN only the approved real showrooms are linked
  AND each page contains at most 24 businesses with real city/category context
  AND page cursors cannot create duplicate or unbounded database reads

Scenario: A missing or draft showroom does not become a soft 404
  GIVEN a handle with no business, or a business still in draft state
  WHEN a crawler requests its initial showroom document
  THEN the HTTP status is 404 and the response says noindex
  AND no private showroom content is included
```

## Quality impact

- Security and tenant isolation: public catalog scope only; no private preview,
  session, tracking, staff or owner data in search output.
- Privacy and data retention: no personal contacts, account data or precise
  private coordinates added to structured data; no new stored data.
- Accessibility and responsive behavior: the new directory uses ordinary
  keyboard-focusable card/pagination links and a responsive grid. Existing
  Market and product-card layouts remain unchanged.
- Localization and merchant-entered values: existing native Market/About text
  is reused; merchant prose remains exact. No false locale alternates.
- Performance and limits: bounded sitemap pages and scalar count query; no
  per-product catalog hydration for sitemap generation.
- Failure recovery: previous deploy restores previous SEO output; app behavior,
  database schema and public URL identity remain unchanged.

## Observability

The operator can inspect `/robots.txt`, sitemap pages, a public showroom and a
product page by HTTP, then inspect the actual canonical and rendered text. Do not
log customer data, raw merchant text or credentials for SEO verification.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Canonical, saved showroom metadata and noindex scope | focused and HTTP | `scripts/test-public-seo.ts`, `scripts/test-public-seo-http.ts` |
| Tracking HTML crawl/noindex and private API exclusion | focused and HTTP | `scripts/test-public-seo-http.ts` |
| Paged sitemap/public-only projection | focused and PostgreSQL | `scripts/test-public-seo.ts` |
| JSON-LD escaping and no invented offers | focused | `scripts/test-public-seo.ts` |
| Product href and server-visible content | Chrome desktop/phone + HTTP | FE-071 local review receipt |
| Directory link/eligibility/keyset pagination | focused + Chrome desktop/phone | `scripts/test-public-seo.ts`, `scripts/test-public-seo-http.ts` |
| Missing/draft showroom HTTP status and noindex | local HTTP | `scripts/test-public-seo-http.ts` |
| Hosted origin and publication | release and operator review | DEP-049 guarded cutover; separate evidence |

## Rollout and rollback

This is an application-source change with no schema migration. The new canonical
host follows the reviewed active `NEXT_PUBLIC_APP_URL` cutover; the current hosted
origin must not be changed just to claim SEO readiness. Verify a published real
showroom, a product, robots and sitemap after the candidate web deploy. Roll back
to the previous deploy if output is wrong; never rewrite merchant records to fix
an index. Search Console property verification/submission is a separate owner
operation after the correct host is live.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs identified; reciprocal links coordinated with the S145 owner
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

The pure, read-only local PostgreSQL and real HTTP checks in
`.local/seo-fe071/review.md` pass. The local catalog currently has two eligible
canonical URLs; Market→About→directory→showroom→product initial HTML is
crawlable, and demo pages and cross-business/stale product IDs are excluded or
`noindex` as applicable. Installed Chrome task review at desktop and phone
passed with Amharic selector interaction and no uncontrolled public map tiles;
the local catalog had no 25th listing to show the Next control in a live browser.
The focused peer follow-up proved saved Page title/Search and sharing description
reach real showroom HTML while product titles stay product-specific. Public
tracking HTML is crawlable so its existing `noindex` is visible, while the
tracking APIs remain blocked and recipient access still requires verification.
The missing/draft soft-404 correction is locally implemented and verified by
`scripts/test-public-seo-http.ts`: unknown and encoded handles and a local draft
return true 404 with `noindex`, while the real showroom remains 200 and the
accepted stale/foreign product query behavior remains 200+`noindex`. Installed
Chrome at 1440/390 proved directory→showroom→Back, a branded missing-page 404,
and its return action with no uncontrolled map tiles; see
`.local/showroom-404-s146/review.md`. This new 404 visual still awaits owner
review. Shared full release gates and hosted publication remain pending. Structured
data can help understanding but does not guarantee a Google rich result or
ranking.
