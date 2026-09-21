# Self-service and map review — 2026-09-20

FE-048 / BE-041 / DEP-038 are implemented locally, with focused verification.
Visual approval, full/release/acceptance gates, a scoped commit and hosted rollout
remain pending. Hosted configuration and data were not changed.

## Review locally

- Market: http://127.0.0.1:3102/?industry=all
- Owner setup: http://127.0.0.1:3102/dashboard
- Page editor: http://127.0.0.1:3102/dashboard/page-editor
- Business/location: http://127.0.0.1:3102/dashboard/business
- Offering form: http://127.0.0.1:3102/dashboard/products/new
- Admin: http://127.0.0.1:3102/dashboard/admin

Authenticated routes require the appropriate account. Owner/admin browser tests
used isolated local test sessions, not hosted email delivery.

Owner first Publish requires a listed offering, but no staff review. Subsequent
owner Save publishes atomically; staff assistance remains private and consented.
Location Save applies a selected city or explicitly public GPS immediately, while
preserving admin exclusions and suspension. Unknown manual places save text but
have no map marker until a known place is selected.

City/area shop markers use stable display offsets within 1.5 km of their public
anchor. Saved coordinates are untouched by this display calculation. Exact GPS
and legacy locations are unchanged. Filtering/pagination do not move individual
markers; approximate labels distinguish city placement from an address. Cluster
clicks zoom forward and individual selection centers and opens the shop. Floating
controls now share the map preview's stacking context so Close works on phones.

## Focused evidence

- `test-self-service-publication.ts`: first Publish, listed-offering requirement,
  tenant/stale/suspended denial, atomic live Save with forced-failure rollback,
  staff draft privacy, private media denial before storage access, immediate
  GPS/area privacy, exclusions, published About search, and 1,000 distinct stable
  bounded city positions with exact coordinates unchanged.
- Existing owner-page, place selection, starter, product-upkeep and
  discovery-pagination focused suites pass. Explicit Product/Service selection
  persists while omitted legacy metadata remains under tenant/version guards.
- `test-simple-demo-seed.ts`: a fresh disposable PostgreSQL schema produces 264
  simplified offerings and 66 area locations; images/video/descriptions are
  populated and obsolete demo options/production summaries are absent.
- `capture-business-starters.ts`: 29 captures in `.local/business-starter-review/`,
  covering owner setup/editor/offerings and admin at desktop, 390 and 320 pixels,
  first Publish and live Save, scoped denial and accessibility scans.
- `capture-simple-market.mjs`: six captures in `.local/simple-market-review/`;
  desktop/390/320 cluster zoom, shop selection/Close, backend page navigation
  preserving map position, word search, phone filter dialog, no horizontal
  overflow, no page exceptions and no scoped WCAG A/AA violations. Screenshots
  contain blank basemap tiles where external tile delivery was unavailable;
  marker/UI checks passed, but this is not evidence of tile-provider availability.
- `test-search-performance.ts`: 500 businesses/10,000 products; three queries
  returned the correct 9,500 eligible product count and at most five result rows.
  Local timings improved from 1,657/1,306/939 ms to 494/518/423 ms by evaluating
  the PostgreSQL term array once and avoiding unnecessary count sorting/hydration.
  This is a local fixture comparison, not a production latency guarantee.

Typecheck, validation of 151 specs/ADRs and traceability links, and Git whitespace
checks pass. No complete release gate or commit is claimed.

## One-time demo correction

An exact handle allowlist admitted 66 existing local demos and 264 offerings,
including 39 services. Two non-demo businesses were outside the mutation scope.
A protected native PostgreSQL archive was fully parsed before the transaction.
Protected before-state and completion evidence are under
`.local/demo-simplification/`; they are ignored and must not be committed.

The transaction preserved business/product IDs, handles, media and prices; verified
account, inquiry and non-demo fingerprints stayed unchanged; retained page/catalog
history; and converted useful old options/highlights into readable descriptions.
It gave admitted demo city locations area semantics without replacing any exact
storefront choice. Never rerun this one-time correction or treat it as a customer
backfill. Fresh demo setup is covered separately by the isolated seed test.

Rollback requires the protected exact before-state or a separately reviewed native
restore. No destructive migration or hosted configuration operation was performed.

## Remaining gate

AGENTS.md workflow step 8 requires explicit visual approval before full-suite,
release, container or remote CI gates. After approval, run the applicable gates,
inspect/stage only task-owned files, commit, and execute any separately verified
rollout. The unrelated pre-existing `deno.lock` remains untouched.

## Verified rollout — 2026-09-21

Source `be134a247c8ea54b18b882f9e2368058f7fbc0ee` is published as Netlify `6ab0d349f099639821fa0f9a` at https://suqpage.com.
Full check, release, operations, all nine isolated provider browser scenarios,
artifact privacy and production dependency audit pass. Production schema 47,
64 updated demo pages/256 offerings, all 64 public routes, live search at
1440/390/320, email-only entry, private-route denial, health and www redirects
are independently verified. Mapped focused tests and earlier desktop/phone
reviews remain applicable; the owner approved this release.

Earlier dated pending-approval/local-only notes are superseded by this rollout.
No real external email was sent and no authenticated hosted account was used
for testing; those admission checks remain separate from local provider evidence.
Demo contact destinations are examples, not verified delivery channels.
See docs/SUQPAGE-RELEASE-2026-09-21.md for backup, rollback and limitations.
