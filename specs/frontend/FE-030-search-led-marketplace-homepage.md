---
id: FE-030
title: Search-led marketplace homepage
status: done
related: [FE-021, FE-022, FE-024, FE-027, FE-028, FE-029, FE-031, FE-033, FE-034, FE-036, FE-037, BE-021, BE-023]
owners: [product, frontend, design]
last_updated: 2026-09-12
change_level: L2
---

# FE-030 - Search-led marketplace homepage

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
- A coordinated, local AfricMade image set for the homepage, About story, and
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

- The homepage is the AfricMade marketplace application, not a marketing landing
  page and not a tenant showroom.
- A **reviewed location** is the location AfricMade uses for discovery. It does
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
  AfricMade orange. White and cool-gray remain the dominant
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
  pins, Shared Location booths, and today's Daily Featured gallery. The current AfricMade Daily Featured
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
  AND individual markers and numbered clusters retain the same AfricMade orange
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
  WHEN AfricMade renders its version of that composition
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
  booth identities. Evidence is under `/tmp/mirtpage-home-redesign`.
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
`/tmp/mirtpage-all-industries-desktop.png` and
`/tmp/mirtpage-all-industries-phone.png`; complete release gates remain pending
visual approval.

The 2026-08-10 autocomplete follow-up passes focused type, discovery,
homepage-contract, and specification checks. Integration fixtures prove the
two-character threshold, six-item bound, de-duplication, industry scope, and
exclusion of unpublished and excluded records. Focused Chromium interaction
proves desktop and 390px pointer/touch rendering, zero phone overflow,
keyboard Arrow/Enter selection, URL-backed application, and a phone list that
stays above fixed navigation. Evidence is at
`/tmp/mirtpage-search-suggestions-desktop.png` and
`/tmp/mirtpage-search-suggestions-phone.png`; full release gates remain pending
visual approval.

The 2026-09-12 Search workspace revision passes `npm run check`, `npm run
release`, and all 10 ordered production-browser acceptance workflows.
Integration coverage proves bounded product projection, eligibility and scope
rules, deterministic ordering, URL-backed result-type controls, and preserved
map state. Chromium evidence at 1440, 390, and 320 CSS pixels proves that Search
replaces only the map canvas, All/Products/Businesses filters work, result cards
open the existing inspector before navigation, and no viewport has horizontal
overflow. Evidence is under `/tmp/africmade-search-review`; the user approved
the focused visual result on 2026-09-09.
