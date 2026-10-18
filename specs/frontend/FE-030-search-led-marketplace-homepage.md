---
id: FE-030
title: Search-led marketplace homepage
status: in_progress
related: [FE-058, FE-052, FE-041, FE-021, FE-022, FE-024, FE-027, FE-028, FE-029, FE-031, FE-033, FE-034, FE-036, FE-037, BE-021, BE-023, FE-042, FE-065]
owners: [product, frontend, design]
last_updated: 2026-10-07
change_level: L2
---

# FE-030 - Search-led marketplace homepage

## S41 — visible, clearable multi-category filters (2026-09-26)

Supersedes S40's category/place disclosure. Ready: L2; FE-042 pagination and
BE-023 public eligibility remain controlling. No new provider or schema change.

- GIVEN an open drawer THEN Category and Region or city are visible side by side
  above one result list, without a Filters disclosure. Both controls fit 320px
  phones and long translations; menus scroll without pushing results down.
- GIVEN no category selection THEN all categories are searched, but “All
  categories” is only an empty-state label, never a selectable category.
- GIVEN multiple selected categories THEN map, exact/approximate results,
  suggestions and counts match ANY selected category AND the selected location
  and search query. Cross-listed businesses/products occur once.
- WHEN selecting/unselecting categories or clearing either filter THEN reset
  pagination and preserve other selections/query/result types. Removing the last
  category returns the unrestricted category scope. All filters are clearable.
- GIVEN a selected eligible place with no matches under new categories THEN
  retain that place and show zero results. Never silently widen its scope.
- GIVEN reload/history/legacy single-category links or repeated industry params
  THEN the same canonical selections are restored. Malformed/unknown category
  values cannot become SQL; valid values survive mixed input.

Verify real isolated PostgreSQL union, de-duplication, privacy, typo and paging
cases; browser phone/desktop clear/multi-select/reload/history/focus/overflow;
localized copy/type/spec gates. Visual approval precedes full/build/release gates.
Rollback reverts application selection behavior; no stored data changes.

## Current refinement — S40, 2026-09-25

This section supersedes older category-gating, map replacement and result-tab
clauses below. FE-052 defines the accompanying showroom value proposition.
Definition of Ready: L1 UI refinement; reuse existing BE-023/FE-042 URL and
server pagination contracts. No schema, visibility, ranking, provider or tenant
changes. No new dependency. Existing pending work and unrelated files remain.

1. GIVEN the open search drawer WHEN choosing result types THEN Businesses and
   Products & services are independently selectable filters above one result
   list, without result tabs. Both selected means `type=all`; one selected uses
   the existing `businesses` or `products` value. At least one remains selected.
2. GIVEN a query/category/place and a later result page WHEN changing type THEN
   the other filters remain, pagination resets and the backend returns only the
   chosen types. Paging retains the type. Browser history restores URL state.
3. GIVEN a phone, desktop or short landscape viewport WHEN opening filters or
   categories THEN labels, choices and controls do not overlap, long localized
   labels wrap, all choices are reachable and results remain scrollable. The buying
   help launcher must not cover result pagination; use its accessible compact
   icon beside an open drawer on narrow screens.
4. GIVEN any supported locale WHEN arriving at Market THEN its compact intro
   explains organized business showrooms and direct inquiries, including mobile.
   About explains the owner benefit: story, media, offerings and contacts in one
   shareable showroom alongside existing social channels. No checkout claims.

Verification: focused type/localization/narrative checks plus live local browser
filter, pagination, back-navigation and layout checks in five locales. Capture
phone/desktop evidence before owner visual approval and full/release gates.
Rollback is a UI revert; URLs/data and existing search contracts stay compatible.

## Problem and outcome

The homepage exposes the right marketplace capabilities, but its stacked dark
banner, command strip, map, sponsored rail, and scheduled featured program read like one long
operational panel. New visitors receive little visual context for the range of
production behind the listings, and section transitions do not make the discovery journey
easy to scan. The homepage should feel like a polished marketplace application.
Visitors can browse geographically on the map or make an intentional product or
business search without being forced through one undifferentiated ranked directory.

## Scope

### In scope

- A compact product-led marketplace hero with truthful buyer and producer
  benefits that leads directly into the map command surface.
- A coordinated, local Suqpage image set for the homepage, About story, and
  signup/login context, with production-centered compositions tailored to each
  responsive surface.
- A desktop and mobile hierarchy inspired by the supplied marketplace mockup
  without copying unsupported counts, ratings, verification, checkout, pricing,
  newsletter, or partner claims.
- A restrained secondary accent set for industrial and editorial emphasis so
  teal remains the action color without dominating every public surface.
- A clearer geographic-discovery composition that pairs one command surface
  with the local Ethiopia map and a required centered eight-option orientation
  choice, including **All industries** last.
- A query-driven Search workspace that replaces the map canvas only after a
  visitor submits or types a meaningful query. It keeps the same category and
  place scope, separates matching products from matching businesses, and
  provides an explicit return to the preserved map.
- A Daily Featured companion panel with legible paid-placement cards and stable
  access to the complete manually selected five-business pool.
- The two-session TikTok program is presented as a card-gallery agenda: every showroom
  receives a non-overlapping EAT time range around reserved changeovers,
  sponsor moments, and the four-hour intermission. An active booth is named and
  highlighted without requiring a configured outbound profile link.
- At phone widths, the selected-day heading and compact broadcast strip precede
  the featured-showroom gallery, while all seven fixed weekday controls remain a
  compact touch-sized row inside its header. Long descriptive copy and category
  labels do not push the gallery down the page.
- Image-led featured-showroom cards distributed through deterministic responsive
  rows with no simulated venue shell.
- Grounded Shared Location storefronts with proportional architectural clearance so
  cards do not touch venue walls, plants, entrances, or other shell props as the
  floor grows.
- Responsive visual and contract evidence at desktop, 390px, and 320px.

### Non-goals

- Changing showroom eligibility, clustering, exact Shared Location behavior,
  sponsored ordering, weekly industry/date assignment,
  future-booth redaction, signup, inquiry, or publication behavior.
- Claiming certification, platform endorsement, verified quality, buyer volume,
  business totals, category totals, ratings, sales, savings, or coverage that
  authoritative data does not establish.
- Adding checkout, buyer accounts, newsletter collection, runtime image
  providers, autoplay media, decorative animation, an unfiltered public list,
  paid ranking, or infinite result scrolling.
- Changing tenant showroom presentation or identity.

## Domain language and invariants

- The homepage is the Suqpage marketplace application, not a marketing landing
  page and not a tenant showroom.
- A **reviewed location** is the location Suqpage uses for discovery. It does
  not imply business certification, quality verification, or precise distance.
- Sponsored showrooms remain explicitly labeled **Sponsors** and never imply
  endorsement.
- The sponsor pool contains five eligible businesses manually selected by
  platform staff. It is global and remains unchanged by industry, date, search,
  and place state.
- Platform photography is illustrative art direction. It does not identify a
  listed producer, product, certification, transaction, or customer outcome.
- Search, industry, map, Shared Location, sponsored placement, and Daily Featured use
  the existing server-authoritative discovery projection.

## Contracts

Current Market introduction (FE-052 scenario 8): Suqpage Market / Discover
products and services. Supporting copy introduces online showrooms from local
businesses and direct contact. This supersedes the historical hero wording below;
existing functional labels and the compact mobile header remain unchanged.

Current map previews (FE-052 scenario 9) supersede the historical non-modal
inspector: single/nearby previews use the browser modal layer above the drawer,
bounded scrolling, keyboard containment and restored focus. Search state and the
open panel survive dismissal. Short landscape drawers scroll as one surface to
keep business results reachable. Featured previews are unchanged by this fix.

- Desktop opens with a restrained public header, one literal marketplace
  headline, short supporting copy, and a product-led production visual with no
  unsupported factual badge or duplicate search form.
- Hero benefits name only implemented capabilities: searchable showrooms,
  discovery by reviewed place, useful production context, and direct inquiry
  for personal purchases, bulk sourcing, or products a retailer or distributor
  may bring to its own market.
- The hero leads with the outcome **Find what you need, directly from those who
  make it.** Its eyebrow identifies the product as online showrooms for
  Ethiopian production. Supporting copy explains discovery nearby and across
  Ethiopia, visibility into what a business makes and can customize or supply,
  and direct contact without turning the internal three-offer model into the
  headline.
- White and cool-gray remain the dominant page fields. Navy, teal, cobalt, and
  berry accents have explicit jobs and are not splashed across whole sections:
  teal for actions and map state, navy for structural contrast, cobalt for
  industrial emphasis, and berry for limited sponsored/editorial emphasis.
- Homepage, About, signup, and login use coordinated product-led imagery with
  crisp daylight, white or cool off-white fields, and restrained navy/teal
  integration. Products use layered depth and soft page-edge blending rather
  than a framed image block. The images contain no people, text, logos, badges,
  UI, branded goods, crowds, or implied certification and remain secondary to
  readable page content.
- On phones the homepage panorama occupies a shallow full-width hero row rather
  than a narrow side column. A controlled right-anchored crop keeps the product
  group legible at 320px and 390px, while white fades on every exposed edge
  merge it into the hero field without a visible rectangular boundary.
- The homepage product panorama prioritizes goods used by Ethiopian households,
  farms, workshops, and small businesses: furniture, lighting, cooking
  equipment, farm machinery, finished power and weighing controls, pumps,
  clothing, shelter goods, footwear, doors, gates,
  packaged food, and beauty or household-care products. It does not default to
  an export-catalog composition.
- The homepage omits the former non-interactive industry rail. One icon-led
  industry menu inside the map command surface exposes all seven groups and is
  the only homepage industry control.
- Geographic discovery initially projects the combined de-duplicated marketplace
  behind a required eight-option chooser inside the map workspace. Choosing one
  industry filters its map, place options, and total; choosing **All industries**
  keeps the combined projection and closes the chooser. The chosen map industry does not change the
  fixed weekday industry used by Daily Featured Showrooms.
- The seven industries use one restrained, accessible accent system across the
  desktop industry menu, phone Filters sheet, and Shared Location booth borders
  and fascia. Numbered clusters and individual map markers remain one accessible
  Suqpage orange. White and cool-gray remain the dominant
  booth content surfaces; color is a clearly visible identifier rather than a full-card wash, and an
  industry name or icon always accompanies it so meaning never depends on color
  alone.
- At local-detail zoom, an isolated showroom marker names the actual business
  beneath its storefront symbol. The renderer wraps that name into a compact,
  bounded multi-line label so long names remain legible without crossing the
  map horizontally. The marker and label retain the uniform teal treatment and never
  falls back to a generic **Showroom** caption.
- Opening an exact-coordinate Shared Location under the required selected
  industry renders that industry's matching businesses directly. Fixed-readable
  storefronts use responsive columns and vertically growing rows inside
  the bounded workspace. The controlled
  accent softly themes the hall field, floor edge, and city sign without
  recoloring photography, reducing text contrast, or obscuring venue architecture.
- The routed public shell under FE-036 makes `/` the complete geographic
  workbench. `/discover` is a query-preserving compatibility redirect.
- Map mode is a bounded remaining-viewport workspace on desktop and phone. Its
  concise route heading, command row, unobstructed map or Shared Location canvas,
  and fixed application navigation fit without a document-length empty tail.
- Map mode presents one cohesive command-and-map composition. Its styled
  industry dropdown and live search are the sole homepage entry controls;
  location jump, zoom, and reset keep their existing behavior and accessible
  names. Search does not create a second route or duplicate global header.
- A trimmed query of at least two characters opens Search in the map canvas.
  Suggestions remain a short completion aid above the controls; substantive
  results render in a separate scrollable workspace below a compact search
  heading. The workspace never places result cards inside the suggestion menu.
- Search offers **All**, **Products**, and **Businesses** as one segmented
  result control. Product matches identify the product, source business,
  category, and reviewed place. Business matches identify the business,
  category, reviewed place, and concise description. Activating either kind
  opens the existing page inspector before route navigation.
- Search results are bounded and deterministic. Products and businesses are
  ordered by textual relevance followed by stable names and IDs; sponsorship
  does not affect search order. A no-results state keeps the query and filters
  editable and offers a return to the map.
- Returning to Map preserves the active query, category, place, and remembered
  map viewport. Clearing the query returns to geographic browsing. Search mode
  and its result type are represented in URL state so Back/Forward navigation
  restores the same workspace.
- After two non-whitespace characters, live search presents at most six
  server-authoritative suggestions drawn from eligible showroom names,
  published offerings, and reviewed places within the active industry and
  place scope. Selecting a suggestion immediately applies its search value;
  ordinary typing retains the existing debounced result update.
- The suggestion surface is an accessible combobox/listbox: keyboard visitors
  can move with Up/Down, apply with Enter, dismiss with Escape, and continue
  typing without focus loss. It overlays the workbench without resizing or
  pushing the map or phone command row.
- At desktop and tablet widths, the opened industry menu matches the trigger's
  inline width and wraps long labels. It never expands across the map. At phone
  widths, industry choices remain in the existing Filters bottom sheet.
- At phone widths, the command area progressively discloses secondary controls:
  one flexible live search and Filters action occupy one command row; industry
  and available-place selection move
  into a native modal bottom sheet; and locate, zoom, and reset become
  touch-sized controls over the map. Desktop retains the complete side command
  panel.
- The scheduled public program is labeled **Daily Featured Showrooms** in every
  visitor-visible and assistive-technology string. Current application
  identifiers, generated links, and URL state use Daily Featured language under
  FE-037; only inert migration and immutable-storage compatibility identifiers
  may retain historical names.
- Activating a revealed Daily Featured card opens the same non-blocking
  showroom inspector used by discovery before any route change. Navigation to
  the tenant showroom occurs only when the visitor chooses **Open showroom**
  from that inspector; dragging or panning from a booth does not navigate.
- Compact navigation uses the shorter **Daily featured** label. **Sponsors** is
  disclosed beside the Daily Featured gallery rather than as a primary route.
- The map enters the first desktop viewport and remains visibly hinted within
  the first 844px phone viewport. Phone content must not hide the hero image,
  search, selected industry, or map entry.
- Sponsored cards expose only the Sponsors label, approved image or fallback,
  business name, place, and showroom action. Desktop shows the complete bounded
  paid pool beside the gallery; phones show two cards at a time and rotate through
  the pool without horizontal scrolling, pause, or movable carousel controls.
- Showroom selection opens a non-modal floating inspector. The underlying map,
  Shared Location, or Daily Featured remains visible through a restrained low-opacity scrim.
  The inspector is centered on larger screens so selection is unmistakable. On phones the
  inspector becomes a bounded bottom sheet above app navigation rather than a
  full-screen takeover.
- Valid merchant live state is visible on map aggregates, individual showroom
  pins, Shared Location booths, and today's Daily Featured gallery. The current Suqpage Daily Featured
  walkthrough uses **Featured now** and overrides only that business's merchant
  live presentation for the duration of its slot.
- Daily Featured retains the fixed weekly selector, truthful selected-day description,
  dynamic continuous gallery, controls, and identity redaction for non-today
  dates. Visual framing may change without changing those contracts.
- Map zoom controls remain available in the geographic workspace. Shared
  Locations use ordinary vertical scrolling and fixed-readable storefronts
  without zoom or sideways panning.
- The Daily Featured heading and fixed weekday selector form one attached gallery
  header. On phones the compact segmented selector remains inside that header and
  never overlaps cards.
- Daily Featured cards use unique deterministic row-major positions in a native
  responsive grid. Cards expose dimensioned approved media, reference, business
  name, location, schedule, and current status. Additional participants add rows;
  they never create a venue, hall, page selector, or transform surface.
- The gallery uses one column at narrow phone widths, two where card readability
  permits, and more columns as available width grows. It never scales text or
  media below the defined readable card dimensions merely to fit forty entries.
- The closing invitation is producer-focused and secondary to marketplace use.
  Footer links include only routes or contact methods that exist.
- Every interactive control remains at least 44 CSS pixels on phones, focus is
  visible, text is not clipped, and the document has no horizontal overflow at
  320px, 390px, or desktop widths.

## Scenarios

```gherkin
Scenario: Visitor begins with a product, business, or industry search
  GIVEN the public homepage is open
  WHEN the visitor chooses an industry or enters a product, capability, business, or place in the map command surface
  THEN the existing discovery query receives the bounded search term
  AND a meaningful query opens Search in place of the map canvas
  AND the map remains available without losing the query or filters

Scenario: Visitor filters intentional search results
  GIVEN a meaningful query has matching published products and eligible businesses
  WHEN the visitor chooses All, Products, or Businesses
  THEN the Search workspace displays only the requested result kinds
  AND each result identifies its source and reviewed place
  AND activating a result opens the existing page inspector before navigation
  AND sponsorship does not change result order

Scenario: Visitor chooses a search suggestion
  GIVEN the visitor has entered at least two characters
  WHEN eligible showroom, offering, or reviewed-place suggestions match
  THEN at most six labeled suggestions appear without moving the map
  AND pointer, touch, and keyboard visitors can select one
  AND the selected value immediately becomes the authoritative search query
  AND full results appear outside the suggestion list

Scenario: Visitor opens geographic discovery without an industry filter
  GIVEN eligible published showrooms exist in multiple industries
  WHEN the homepage or standalone discovery route opens without an industry query
  THEN the de-duplicated combined showroom map is loaded behind a centered eight-option chooser
  AND All industries is the final choice rather than an automatic hidden default
  AND choosing one industry filters the result set
  AND choosing All industries keeps the combined result and closes the chooser
  AND Daily Featured Showrooms still uses the selected weekday's assigned industry

Scenario: Visitor changes the selected marketplace industry
  GIVEN one canonical industry is selected
  WHEN the visitor opens the industry menu, scans individual map markers, or enters a Shared Location
  THEN the menu and Shared Location storefronts identify the selected industry
  AND the industry remains named or icon-labeled without relying on color alone
  AND individual markers and numbered clusters retain the same Suqpage orange
  AND additional Shared Location storefronts append vertically in stable bounded batches
  AND the separate Daily Featured Showrooms gallery is unchanged

Scenario: Visitor identifies and previews a single showroom
  GIVEN an isolated showroom is visible at local-detail zoom or on today's
  Daily Featured gallery
  WHEN the visitor scans the marker or activates the featured card
  THEN the map marker displays the business name in a bounded multi-line label
  AND the featured card opens a showroom inspector without changing the route
  AND only the inspector's Open showroom action enters the tenant showroom

Scenario: Visitor scans the marketplace on a phone
  GIVEN a 390px or 320px viewport
  WHEN the homepage renders
  THEN the hero remains concise and visually identifies local production
  AND its product panorama fits the hero width and blends into the white field
  without a framed edge or horizontal overflow
  AND Search and Filters share one compact command row
  AND one Filters action opens touch-sized industry and location controls in a bottom sheet
  AND locate and zoom controls remain available on the map without another toolbar row
  AND the geographic marketplace is visibly introduced without horizontal overflow
  AND Search replaces the map canvas within the same remaining viewport
  AND its result filters and cards remain touch-sized and vertically scrollable

Scenario: Phone visitor reaches the Daily Featured gallery without control stacking
  GIVEN the homepage is open at a phone width
  WHEN the Daily Featured enters the viewport
  THEN its description is compact and its broadcast status remains clear
  AND exactly two of the five sponsors occupy one shallow automatically replacing slot
  AND all seven fixed weekday controls fit in one row attached to the gallery
  AND the gallery appears without a multi-row calendar or sponsor wall above it

Scenario: Forty featured showrooms remain readable
  GIVEN the selected date has the maximum forty participating showrooms
  WHEN Daily Featured renders on a large screen or phone
  THEN every revealed business occupies one image-led card in a native responsive grid
  AND the gallery grows through ordinary page rows without scaling, pagination, or map controls
  AND a narrow phone uses one column until two columns meet the defined readable card width

Scenario: Marketplace data does not support a promotional claim
  GIVEN the visual reference contains ratings, verification, transaction, or scale claims
  WHEN Suqpage renders its version of that composition
  THEN those claims are omitted
  AND only implemented platform benefits and authoritative discovery totals are shown

Scenario: Existing discovery behavior survives the redesign
  GIVEN a visitor changes industry, date, cluster, or Shared Location gateway
  WHEN the redesigned homepage handles the interaction
  THEN FE-021 and FE-024 behavior remains unchanged
  AND no duplicate directory or hidden result set appears

Scenario: Daily Featured grows beyond one booth row
  GIVEN the selected Daily Featured contains more cards than one grid row supports
  WHEN the responsive gallery is laid out
  THEN every business receives one unique row-major card position
  AND additional rows retain readable media and text dimensions
  AND the visitor reaches those rows through ordinary vertical page scrolling
  AND no zoom or pagination control is required

Scenario: A Shared Location fits around its architecture
  GIVEN a Shared Location contains a small or large business cohort
  WHEN its floor is presented in the map workspace
  THEN every storefront remains visibly grounded with safe architectural clearance
  AND text remains readable without visitor zoom
```

## Quality impact

- Security and tenant isolation: presentation and existing public query only;
  no private tenant field or new mutation is introduced.
- Privacy and data retention: no new form field, visitor location request,
  cookie, analytics payload, or external asset request.
- Accessibility and responsive behavior: semantic search, headings, links,
  focus, contrast, reduced motion, 44px targets, and exact-width overflow checks.
- Localization and merchant-entered values: short translation-friendly platform
  copy; existing bounded and escaped merchant strings remain unchanged.
- Performance and limits: a small optimized local public-image set, existing
  bounded discovery payload, and no new dependency or remote runtime media.
- Failure recovery and idempotency: image failure leaves readable hero and card
  content; geography failure presents a retry state without inventing results.

## Observability

Existing first-party page, showroom-source, and inquiry analytics remain
unchanged. Search text, private contact details, and merchant content are not
added to logs by this presentation change.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Truthful homepage claims and required marketplace hierarchy | contract | `scripts/test-platform-narrative.mjs`, `scripts/test-homepage-composition.mjs` |
| Search and existing discovery behavior | integration/browser | `scripts/test-discovery.ts`, `tests/acceptance/app.spec.ts` |
| Desktop and phone hierarchy, touch targets, overflow, map/Daily Featured continuity | browser/visual | `scripts/capture-discovery-visuals.mjs` |
| Responsive Daily Featured gallery and Shared Location wall clearance | unit/browser | `scripts/test-discovery.ts`, `scripts/capture-discovery-visuals.mjs` |
| Platform identity and tenant independence | contract/integration | `scripts/test-platform-identity.mjs`, `scripts/test-showroom-renderer.ts` |
| Public image set is local, optimized, and used without factual attribution | contract/browser | `scripts/test-homepage-composition.mjs`, public visual captures |

## Rollout and rollback

This is a presentation-only release. Rollback restores the prior homepage,
discovery markup, and CSS; no database, media, route, or tenant data rollback is
required.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Completed locally on 2026-08-09:

- `npm run check` passed the complete specification, runtime, identity,
  narrative, design-bank, discovery, pagination, security, media, signup, and
  revision suite, including the FE-030 precheck.

Focused narrative revision on 2026-08-09: `npm run test:narrative`,
`npm run test:homepage`, `npm run typecheck`, and `npm run validate:specs` pass.
Chromium captures at 390 and 320 CSS pixels prove the online-showroom
explanation wraps in full without clipping or horizontal overflow. Full release
gates remain pending renewed visual approval.
- `npm run release` passed the production build, 57 output-trace privacy checks,
  production HTTP smoke, 66-showroom scale fixtures, integration suites, and a
  production audit with zero vulnerabilities.
- `npm run test:discovery-visual` passed thirteen desktop/390px/320px homepage,
  map, City Showroom, List, Daily Featured, and preview-dialog states with no browser
  errors, document overflow, extra halls, hidden today booths, or exposed future
  booth identities. Evidence is under `/tmp/suqpage-home-redesign`.
- Layered Daily Featured geometry passed deterministic uniqueness, no-overlap, safe-wall,
  and empty-center checks from 1 through 64 booths. Final browser evidence shows
  floor-contact shadows and one continuous venue.
- The three local product-led WebP assets are 130 KB, 105 KB, and 70 KB and are
  used by the homepage, About page, signup, and login without external runtime
  image requests.

Reopened on 2026-08-09 for the public Daily Featured Showrooms terminology and
the unified phone command row. Focused 390px and 320px Chromium evidence proves
Search, Filters, Map, and List share one row at 48px high, Map/List state changes
remain URL-backed, both widths have zero horizontal overflow, the scheduled
program heading is Daily Featured Showrooms, and rendered public text contains
no occurrence of the legacy Daily Featured name. User visual approval and complete release
gates remain pending.

The navigation follow-up passes focused desktop and phone browser evidence: the
header and mobile menu expose only Explore Showrooms, Daily featured, About,
Login, and Get a showroom; the footer marketplace group exposes only Explore
showrooms and Daily featured; no Sponsored shortcut remains; and desktop links
do not wrap or overflow.

The 2026-08-10 default-filter follow-up passes `npm run typecheck`, `npm run
test:discovery`, `npm run test:homepage`, and `npm run validate:specs`. The
integration fixture proves omitted and explicit `all` filters return the same
de-duplicated cross-industry projection while keeping five-row List pagination
and the weekday program independent. Focused desktop and 390px captures are at
`/tmp/suqpage-all-industries-desktop.png` and
`/tmp/suqpage-all-industries-phone.png`; complete release gates remain pending
visual approval.

The 2026-08-10 autocomplete follow-up passes focused type, discovery,
homepage-contract, and specification checks. Integration fixtures prove the
two-character threshold, six-item bound, de-duplication, industry scope, and
exclusion of unpublished and excluded records. Focused Chromium interaction
proves desktop and 390px pointer/touch rendering, zero phone overflow,
keyboard Arrow/Enter selection, URL-backed application, and a phone list that
stays above fixed navigation. Evidence is at
`/tmp/suqpage-search-suggestions-desktop.png` and
`/tmp/suqpage-search-suggestions-phone.png`; full release gates remain pending
visual approval.

The 2026-09-12 Search workspace revision passes `npm run check`, `npm run
release`, and all 10 ordered production-browser acceptance workflows.
Integration coverage proves bounded product projection, eligibility and scope
rules, deterministic ordering, URL-backed result-type controls, and preserved
map state. Chromium evidence at 1440, 390, and 320 CSS pixels proves that Search
replaces only the map canvas, All/Products/Businesses filters work, result cards
open the existing inspector before navigation, and no viewport has horizontal
overflow. Evidence is under `/tmp/suqpage-search-review`; the user approved
the focused visual result on 2026-09-09.

## S2h public experience revision

FE-041 now governs the shared profile's linked inline product view, simplified
public features/unit presentation, single/group inquiry choice, progressive phone
form and search panel beside the persistent map. It supersedes earlier public
modal, production-fact, persistent empty-cart and map-replacement statements here.
Retained data, canonical server security and legacy recovery contracts remain.
Implementation/evidence tracked in docs/SUQPAGE-TRANSITION-CHECKLIST.md S2h.

## S40 local evidence

See `specs/TRACEABILITY.md` S40 for type, localization, 15 filter-flow combinations,
landscape and three category/pagination/accessibility checks. Screenshots:
`.local/market-filters-review/`. `scripts/capture-market-filters.mjs` maps current
acceptance criteria; source composition/narrative checks guard the copy and tab
removal. Current implementation is local, awaiting visual approval and release
checks. One external tile-ready capture timeout and its passing isolated retry
are distinguished from the passing filter-workflow evidence.

## S41 local evidence

See TRACEABILITY S41 for real PostgreSQL filtering/privacy/pagination tests and
15 phone/desktop locale checks plus landscape and keyboard clearing. Evidence:
`.local/multicategory-review/`; run `scripts/capture-multicategory-filters.mjs`.
Type/localization/spec checks pass. Broader discovery assertions pass, but its
fixture-cleanup timeout remains an unresolved test-infrastructure gate. Current
changes await visual approval, full/build/release checks, commit and deployment.

## S54 — offering-only public results (local verified, 2026-10-05)

Supersedes mixed result lists and result-type controls. Definition of Ready:
web/native public entry points reuse the existing products projection and SQL
pagination; no migration, provider, ranking or eligibility change. Master sections
5.2, 10 and 15 are affected. FE-030/FE-042 govern map/filter/pagination behavior;
FE-053 and BE-044 cover the native public adapter.

- GIVEN Market WHEN opening results THEN one visible Products & services heading
  identifies the list; no Businesses checkbox/tab/card or redundant type toggle.
- GIVEN a business search/category/location WHEN applied THEN eligible businesses
  remain on the map with existing marker/nearby previews; listings contain only
  matching products/services and retain direct product links.
- GIVEN old type=businesses/all URLs or API calls THEN public boundaries normalize
  to product/service results BEFORE counting/paginating, with full pages and no
  business-only trailing pages. Internal reusable discovery projections may
  retain legacy type support; no public client depends on it.
- GIVEN Next/Previous or clearing filters THEN query/category/place remain scoped;
  map membership is independent of result page. Empty lists keep the map intact.

Focused evidence: public API and desktop/390/320 browser capture, typechecks,
existing discovery pagination/multicategory tests. Existing localized Products &
services label is reused. Visual approval precedes full/release gates.

S54 focused evidence passes: both typechecks; test:discovery-pagination (including
public legacy-type normalization and map/count regression); five actual web/native
browser captures in .local/offering-results/ with capture-offering-results.mjs.
Desktop/390/320 screenshots reviewed. Tile imagery is a controlled fixture;
marker data/handlers are real. Physical native-device evidence, owner visual
approval, full/release gates, commit and deployment are not claimed.

## S55 — shared floating search and filters (local verified, 2026-10-05)

Applies to desktop/mobile web and native. Reuse existing search/filter state and
backend projection. No new package/schema/auth contract. Master §5.2, §10, §19
affected. Definition of Ready: clear panel state independent from filter values.

- GIVEN closed results WHEN typing/submitting search or selecting/clearing category
  or region/city THEN controls remain visible on the map and only map results are
  visible; panel stays closed. No duplicate focusable controls.
- GIVEN open results THEN the same labeled/styled controls appear in the panel;
  both map and product/service results reflect the same inputs.
- WHEN opening/hiding results THEN values remain, map stays mounted, and controls
  move with recognizable shapes/styles. An explicit results action opens the list.
- GIVEN a closed-view web URL with filters WHEN reloaded THEN keep results closed;
  Back and product-return retain query, location/categories and view choice.
- GIVEN desktop/390/320 layouts THEN controls fit beside map tools without overlap;
  menus and map previews remain usable above the controls, with existing keyboard/
  reduced-motion behavior and localized labels.

Focused browser checks/captures plus both typechecks precede visual approval.
Native browser evidence does not replace physical-device testing.

S55 evidence: both typechecks and homepage composition contract pass. Ten stable
web/native-browser screenshots plus flow checks are recorded by
scripts/capture-floating-discovery-controls.mjs in .local/floating-discovery-controls/.
Closed search/filtering, reopening, clear actions, one active control set, map DOM
persistence and immediate reload pass. Panel-only changes use native history
integration without fetching data; this fixes the observed close/reload race.
Controlled tile imagery; physical native-device tests remain separate. Visual
approval and full/release/commit/deployment gates remain pending.

## S56 — compact toolbar correction (in progress, 2026-10-05)

Supersedes S55's stacked floating controls: one compact horizontal toolbar remains
at the top in both modes, serving as the open drawer's shared header. Results toggle
at far left, search, then category/location icon buttons. No inline filter labels
or full selects consuming map height. Existing labels/titles expose purpose and
selection; active indicators and menu clear actions preserve usability. At least
44px touch areas; all fit at 320px, map zoom controls start below the toolbar.
Category multiselect and location selection open existing pickers/popovers.
Search/filter/view persistence and offering-only results remain as S54/S55.
No backend/schema/provider change. Master §5.2/§10/§19 affected.
Focused typechecks and desktop/phone/native-browser checks of layout, filtering,
clearing and both panel states precede visual approval/full gates.

S56 evidence: both typechecks and homepage composition pass. The focused
scripts/capture-compact-discovery-toolbar.mjs checks pass in separate --web and
--native runs: six desktop/phone web and four native-browser captures, horizontal
alignment, far-left toggle, one search input, panel states, search, category/place
selection and clearing; web closed-view reload retained. Reports and screenshots
are in .local/compact-discovery-toolbar/. Tile images are controlled; catalog and
markers are real local data. Native drawer captures wait for its final transform.
Native-device testing, owner visual approval and full/release gates remain pending.
Nothing committed or deployed by S56.

## S57 multiple locations — in progress, 2026-10-05

Master §5.2/§5.5/§10/§19 affected. GIVEN selected cities and/or regions WHEN
searching THEN the map and paginated offerings match any selected location, AND
the category/query scope. Overlapping region/city selections never duplicate
results. Empty selection means all locations. Existing single-place URLs remain
valid; repeated or pipe-separated place values normalize to a stable bounded
set (at most 16). SQL values stay parameterized and spelling matches use the
same union before ranking/pagination. Cache identity includes the normalized set.
GIVEN either client WHEN opening the compact location button THEN regions/cities
are checkable, selected values remain available during filtering, and individual
unselect and clear-all work without opening results. Changing scope resets page.
No database schema change is required. Test discovery pagination/spelling plus
web/native filter flows at desktop/phone; retain existing S56 visual style.

S57 focused evidence (local): search suites and test-multiple-locations.ts pass
multi-region/city union, overlap deduplication, exact/fuzzy pagination, category/
query intersections, legacy and repeated URL parameters. Support suites plus
test-live-transport.ts pass both APIs, token/queue/tenant isolation, assignment
capacity, retry, private notes/carrier data, chat ending/resolution/reopen, and
bounds. Migration 59 is applied locally only. capture-multiple-locations.mjs
records seven web and six native-browser states; capture-live-transport.ts,
capture-transport-dispatch-staff.ts and capture-mobile-transport.ts exercise real
handlers and staff server actions at desktop/phone sizes. Temporary staff fixtures
are removed; controlled map tiles and isolated API fixtures are documented in
scripts. Evidence: .local/multiple-location-review/ and .local/live-transport-review/.
Both typechecks and localization checks pass. Owner visual/native-speaker review,
physical device tests, build/full release gates and deployment remain pending.

S59 release regression correction: the narrative test must assert the S54
Products & services heading and absence of Businesses tabs, rather than requiring
the superseded tabs. Existing result/map API and browser tests remain required.
The legacy discovery source assertion also now requires the S56 compact chooser;
it continues checking its category binding, accessible label and real SQL results.

S59 browser regression alignment: category/search capture scripts explicitly open
`view=search`, matching S55's map-only default. They retain real pagination, map
DOM identity, typing races, detail/back and empty-result checks, reject the removed
business result selector, and verify legacy type=businesses URLs still render
offerings. No product behavior is changed to satisfy a retired test contract.

## S64 — selection counts and product business links (2026-10-06)

Ready, L1. Uses existing FE-042/BE-023 discovery data and FE-053 navigation;
no API, schema, ranking, eligibility or tenant change. Master §5.2 is affected.
- GIVEN zero, one or multiple selected locations WHEN viewing the closed or open
  toolbar THEN the pin shows no badge, 1, or the selected count respectively.
  Clearing, deselecting and restoring URL state update the count. Category and
  location badges use the same treatment on web and native mobile.
- GIVEN a product result THEN its business is identified by a localized
  “From {business}” link, preserving the business name verbatim. WHEN following
  that link THEN open that business's main showroom; WHEN opening the product
  THEN open its product details. Links must not nest or trigger each other.
- GIVEN a narrow phone, long business name or translated interface THEN controls
  remain usable, names wrap, focus is visible, and the toolbar stays one row.

Verify web/mobile typechecks, localization, spec validation and focused browser
checks at desktop/390/320px: zero/one/two/clear/reload badge states, independent
product/store navigation, and return-to-market state. Capture both clients.
Native browser evidence is not device evidence. Visual approval precedes full
release gates; rollout reverts these UI files with no data migration.

S64 local evidence: web/mobile typechecks, eight localization tests (1,256
messages per non-English catalog) and validation of 167 specs/ADRs pass.
`capture-multiple-locations.mjs` passes 16 captures, including 0/1/2/clear,
reload and open/closed-panel count checks. `capture-result-business-links.mjs`
with --web, --native and --locales passes 15 captures: independent destinations,
web keyboard order, 44px store targets, long-name wrapping and all five locales
at desktop/390/320px. Web browser Back and the mobile app Back preserve search.
Private evidence: `.local/multiple-location-review/` and
`.local/result-business-links/`; basemap tiles are controlled fixtures, local
catalog reads are real, long-name captures use a DOM-only display fixture.
The initial duplicate-business locator was scoped to one card; Metro was
restarted to refresh shared catalogs. Expo browser history navigation can reset
Market state; the mobile app Back was verified instead. No physical-device or
native-speaker signoff is claimed. Visual approval and full release gates remain
pending; this change is not deployed or included in the existing S62 APK build.


## S72 — visible product-results action

Ready, L1. The existing panel icon is too ambiguous. Choose View products over
Product view (ambiguous noun) or Results (missing subject); show Hide products
when open. Keep the panel/arrow icon and a compact readable label on web/native.
This changes no search/filter/pagination/backend behavior or list composition.

GIVEN closed Market results WHEN viewing the toolbar THEN View products is visible
and opens the offering-only Products & services panel without issuing a search
or resetting filters/map. WHEN open THEN Hide products closes it while keeping
search/category/location controls and state. Expanded/controls semantics, Escape
and focus return remain. GIVEN 320/390/desktop screens in any of five locales THEN
all toolbar controls stay aligned, labels are readable and no page overflows.

Verify updated compact discovery browser capture plus focused localized label/
toggle checks, types/catalogs and before/after screenshots; owner review precedes
full/release gates. FE-049/FE-053 share authored labels. Master §§5/7/11/15 affected.

Focused S72 review found React Native Web did not project expanded from the
existing accessibilityState. Set its explicit web aria-expanded while retaining
native accessibilityState; the UI capture must prove true/false rather than
weakening that assertion. No search/panel behavior changes.

S72 focused local evidence: types/locale/homepage tests and actual compact
entry/toggle captures pass in web/Expo at desktop/phone widths across five
languages. Visible actions retain input, query/filter scope, compact chat and
expanded state; web focus returns on close. Test:
scripts/capture-purchase-chat-and-products.mjs. TRACEABILITY S71/S72 records
resolved cache/harness failures and pending owner visual/full/release rollout.

S90 follows FE-019's heading and supporting transport-chat invitation on the same map launcher.
The compact open-drawer control keeps the complete accessible question,
reassurance and Live Chat label; expanded entries must not overlap the toolbar,
attribution or product results. Search/filter/pagination behavior is unchanged.
Verify using scripts/capture-purchase-chat-and-products.mjs before visual review.


## S103 bounded browse and paired panels — local candidate

FE-065 supersedes empty S102 starts and older drawer placement. Both scopes open
with bounded results; a centered labeled switch and opposing edge handles select
sliding map/product panels. Product scrolling appends server pages; previous/next
buttons are retired for the independent UI. Independent filters, descriptions,
brand links, marker/cluster styling and transport behavior remain unchanged.
Focused browser evidence precedes explicit visual approval and full gates.
