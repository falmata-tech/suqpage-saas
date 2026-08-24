---
id: FE-021
title: Geographic Showroom map and Daily Featured Showrooms
status: in_progress
related: [FE-001, FE-003, FE-013, FE-017, FE-018, FE-020, FE-022, FE-024, FE-027, FE-028, FE-030, FE-033, FE-034, FE-036, FE-037, BE-019, BE-020, BE-021, BE-023, BE-029, DEP-016, DEP-017, DEP-024, DEP-026, ADR-0011, ADR-0016]
owners: [product, frontend, design]
last_updated: 2026-08-24
change_level: L3
---

# FE-021 - Geographic Showroom map and Daily Featured Showrooms

## Problem and outcome

City venues hide the real location of an otherwise isolated business and make
geographic discovery feel artificial. Visitors also need a second, explicitly
curated way to browse the same businesses without confusing a scheduled
showroom presentation with the physical map.

The outcome is an application-first marketplace where the map clusters nearby
businesses until neighborhood zoom resolves isolated businesses into individual
storefront badges and bounded nearby groups into counted markers. Activating a
nearby group opens at most six image-led cards over the unchanged map, with no
simulated venue, pagination, or route change. A separate weekly
country-wide program presents one industry as Daily Featured Showrooms on every
day of the week in a calm, bounded media-card gallery.

## Scope

### In scope

- Individual business markers at reviewed WGS84 coordinates.
- Numbered, zoom-dependent clusters and click/tap-to-expand behavior.
- Counted neighborhood-zoom groups for same-city businesses within 800 meters,
  balanced into groups of no more than six while preserving source coordinates.
- One floating nearby-showroom inspector with fixed-readable image cards over
  the active map and no venue, pagination, internal scrolling, or route
  navigation. Selecting a card replaces the list inside that same inspector;
  it never stacks a second popup over the nearby list.
- A policy-compliant OpenStreetMap Standard basemap requested directly by the
  visitor's browser for the visible viewport through one provider registry.
- A combined eligible map that loads immediately behind a required initial
  orientation chooser. The visitor explicitly chooses one of seven industries
  or **All industries** as the eighth and final option before continuing.
- One compact teal map command area containing result context, live search,
  region/city filter, Near me action, and map controls directly above the map.
- A fixed Monday-through-Sunday date selector for the Ethiopia-local calendar
  week with one stable assigned industry on each of all seven days.
- One dynamically sized Daily Featured gallery with up to forty responsive
  image-led showroom cards, stable numbered references, and ordinary vertical
  page scrolling without a simulated venue, hall, pagination, or zoom controls.
- Full business identity, approved booth imagery, preview, and showroom links
  only for today's selected Daily Featured; every other date exposes anonymous booth
  outlines and schedule information without business identity or media.
- One Daily Featured program from 08:00 to 22:00 Ethiopia time, split into
  08:00–13:00 and 17:00–22:00 sessions around a four-hour intermission. The
  status identifies booth, transition, sponsor-break, intermission, and ended
  states without inventing provider accounts.
- A compact storefront badge that zooms before opening a richer preview and permanent
  **Visit Showroom** destination.
- Truthful merchant-controlled live status on map aggregates, exact showroom
  markers, nearby-group cards, and today's Daily Featured cards, with the active
  MirtPage Daily Featured walkthrough taking presentation precedence for its current booth.
- Mobile-first touch, close-proximity geographic zoom, map reset, and ordinary
  vertical scrolling.
- Viewport-bounded map rendering that remains usable on low-end phones as the
  eligible marketplace grows into thousands of businesses.

### Non-goals

- Claiming a physical map venue, Daily Featured building, street navigation, routing,
  turn-by-turn directions, or authoritative boundaries.
- Placing virtual Daily Featured floors over the geographic map.
- Grouping businesses across different reviewed cities or beyond the bounded
  proximity radius.
- Geocoding, routing, tile proxying, prefetching, bulk downloads, offline tile
  packages, or service-worker caching of third-party map tiles.
- Hiding a published active showroom because a manual renewal date elapsed.
- A ranked or paginated public List mode separate from the geographic map.

## Domain language and invariants

- **Daily Featured Showrooms:** the only visitor-facing name for the scheduled
  seven-day industry program. Retired `expo` identifiers may remain only in
  immutable historical records where renaming would weaken data integrity;
  active public, application, URL, analytics, style, and persistence contracts
  use Daily Featured language.

- **Geographic Showroom marker:** one eligible business at its reviewed coordinates.
  It uses a compact fixed-size map-pin silhouette containing a familiar upright
  storefront and a short Showroom label. Its visible silhouette remains smaller
  than the numbered cluster core and has no decorative halo, while a transparent
  44px interaction target preserves phone usability. Every individual marker and
  numbered cluster uses the same accessible MirtPage teal family; industry never
  recolors geographic markers. It distinguishes one showroom
  from an aggregate and does not load booth photography into the map renderer.
- **Cluster:** a zoom-dependent aggregate of two or more nearby markers. Its
  number is the exact number of represented businesses.
- **Nearby group:** a terminal same-city proximity aggregate containing two to
  six eligible businesses. Its count is exact, its marker represents the group
  without rewriting member coordinates, and its floating viewer keeps every
  represented showroom immediately reachable.
- **Weekly industry Daily Featured:** a virtual, country-wide presentation of one stable
  industry assigned to each day of the week. All seven days use the same Daily Featured
  floor, eligibility, preview, and booth-reference rules.
- Map, Featured, and Daily Featured share the same server-authoritative eligibility
  rules, but not the same selection state. Map industry/search controls do not
  alter the date-selected Daily Featured.
- Merchant live state is displayed only when the stored platform and HTTPS link
  pass the existing provider allowlist. The current Daily Featured walkthrough business is
  labeled **Featured now** across any visible map or card representation. That
  presentation temporarily replaces its merchant **Live** badge without changing
  the tenant's saved live setting; all other valid live businesses remain labeled.
- Every business remains at its reviewed latitude and longitude. Same-city
  businesses within 800 meters may resolve into deterministic balanced groups
  of at most six at neighborhood zoom.
- Activating a cluster zooms to the level where its children separate. At the
  maximum supported zoom, individual markers remain reachable.
- A location option represents businesses near that named place, not a claim
  that every result lies inside an authoritative city boundary.
- Every Daily Featured business occupies one stable card position in one
  continuous gallery. At most forty eligible businesses participate on a
  selected date. Image-led cards preserve a readable name, location, reference,
  schedule, and status while responsive columns grow downward without pagination.
- Daily Featured booth references are `{industry-code}-B{booth}` and deterministic for an
  unchanged selected result set.
- An approved booth image belongs to the business discovery profile and is the
  only factual Daily Featured-booth visual. A named fallback handles file failure without
  creating eligibility. Non-today previews receive neither identity nor media.

## Contracts

- Industry, bounded search, place, and selected Daily Featured weekday
  remain URL-addressable and server-authoritative where they affect data.
- Bounded search suggestions use only eligible public showroom names,
  published offering names, and reviewed city/region labels from the active
  map scope. Suggestions never alter Daily Featured Showrooms eligibility.
- Omitted or invalid industry state projects the de-duplicated combined result
  set behind the centered required industry chooser. Choosing one of the seven
  canonical industries loads only that eligible result set; choosing the final
  **All industries** option keeps the combined result and closes the chooser.
  Cross-listed businesses appear once, and the scheduled Daily
  Featured Showrooms industry remains controlled only by its selected weekday.
- Every projected showroom has one deterministic primary visual industry: its
  earliest membership in the canonical seven-industry order. This presentation
  identity coordinates the industry menu and nearby-card accent without changing any cross-list membership or selected-industry
  eligibility. Geographic clusters and individual markers remain uniform teal.
- Region/city filtering is URL-addressable and server-authoritative for the Map.
  Available options derive only from eligible reviewed business
  profiles and never imply an authoritative administrative boundary.
- **Near me** requests browser geolocation only after an explicit visitor
  action. A granted coordinate is used in memory to center the local map and is
  not persisted, logged, added to the URL, or sent to the application server.
  Denial or browser failure leaves all region/city and national controls usable.
- Public filters and selected program date are durable URL state. Opening
  a permanent showroom records the current public workspace as its same-tab
  return destination. The last non-geolocation map transform and open nearby
  group may be retained in same-tab session storage for two hours so the
  MirtPage Back control restores the viewer that launched the showroom; they do
  not alter eligibility.
  A **Near me** coordinate or transform derived from it is never persisted.
- The stable weekly assignment is Monday Electronics, Tuesday Beauty & Care,
  Wednesday Food & Beverage Production, Thursday Machinery & Industrial,
  Friday Home & Building, Saturday Fashion & Textiles, and Sunday Agriculture
  & Primary Produce.
- The seven-date selector remains in fixed Monday-through-Sunday order and
  labels the current Ethiopia-local calendar week. Weekday controls never
  reorder as the week advances; the persistent **Today** indicator moves to the
  applicable fixed weekday. Within today's gallery only, cards rotate around
  the current or most recently completed presentation according to FE-033 while
  retaining stable references and times.
- Today uses the same strong teal treatment as the active industry card without
  saffron or warning color. A different selected date uses a separate temporary soft treatment and
  returns to today after six seconds; choosing another non-today date restarts
  that timer while preserving map industry, search, and place state.
- Every selected date uses the policy and optional date-specific lineup governed
  by FE-033 and BE-029. The default sessions are 08:00–13:00 and 17:00–22:00
  Ethiopia time, separated by a 13:00–17:00 intermission. Provider actions
  render as links only when validated public HTTPS TikTok and YouTube URLs are
  configured.
- Booth order is divided into deterministic non-overlapping walkthrough slots
  after reserving changeovers and sponsor breaks. Every booth shows its EAT
  range. Exactly one current booth may receive the active treatment during a
  presentation; transitions, breaks, and intermission identify no current
  business. Future previews may show slot times but never business identity.
- Map controls use familiar zoom/reset icons with accessible names. Shared
  Location floors use ordinary vertical scrolling and no zoom controls. Daily
  Featured uses ordinary responsive cards. Industry selection uses a labeled
  menu after the required centered first choice; there is no public
  Map/List mode switch.
- At 320px and 390px, all primary controls are at least 44px, horizontal rails
  are bounded without horizontal day-selector scrolling, the document has no
  horizontal overflow, and the map remains
  pannable without trapping page scrolling outside its stage.
- The map command area avoids duplicate filter rows and keeps the map within the
  first painted mobile and desktop viewport.
- A terminal nearby cluster opens a lightweight viewer over the live map rather
  than replacing it with simulated architecture. The viewer contains at most six
  fixed-readable, image-led showroom cards, uses three columns where space permits
  and two on phones, and requires no pagination, zoom, or internal scroll.
- Nearby grouping is restricted to the same reviewed city and an 800-meter
  radius. Larger cohorts split into balanced groups of at most six with separate
  map markers. Map grouping never rewrites a showroom's reviewed coordinates.
- Daily Featured uses width-responsive CSS-grid columns, dimensioned lazy media,
  and no simulated architecture, transform loop, or React rerender for scroll frames.
- Nearby showroom cards stay in a bounded floating map panel with no ornamental
  venue, floor, hall, or platform. The panel is centered within the map's safe
  area, remains clear of map attribution and persistent support controls, and
  uses mutually exclusive **nearby list** and **showroom detail** states. The
  detail state provides **Back to nearby** and **Open showroom** actions; Close
  and Escape dismiss either state without losing map position. Daily Featured
  references advance left-to-right and then top-to-bottom through its responsive
  card grid without changing schedule, sponsor placement, or walkthrough behavior.
- Exactly five staff-selected paid sponsor placements compose into a right-side Daily Featured information
  rail on desktop. A placement may link to an eligible MirtPage showroom or be
  a validated external ad with its own uploaded image, name, short details, and
  HTTPS website or normalized telephone action. External ads do not create
  showroom, business, product, or discovery records. The
  pool is global and does not change with map industry, search, place, or Daily Featured
  day. The rail and gallery share one bounded workspace. Desktop shows all five. On phones
  the five-item pool becomes one locked two-card slot above the gallery; exactly
  two distinct clickable sponsors are visible, and a different random pair
  replaces them automatically without scrolling, dragging, pausing, or controls.
  A current sponsor-break assignment overrides random rotation: its placement
  leads with a visible **Sponsor spotlight** state until that segment ends.
- At phone widths the fixed seven-day selector becomes one compact touch-sized
  row inside the program header. It remains inside the Daily Featured section, keeps
  Today and selected-date states distinct, and does not overlap cards or gallery
  controls. The long selected-day description is visually omitted while its
  title and livestream status remain available.
- Leaflet requests the exact policy-approved OpenStreetMap Standard URL only
  for the active viewport. It uses provider/browser caching, zero retained tile
  buffer, idle updates, no zoom-animation tile refresh, and no retina duplicate
  requests. MirtPage never proxies or preloads those tiles.
- Geographic zoom commits cluster, nearby-group, and individual-marker
  reconciliation only after movement settles. Supercluster receives the
  committed Leaflet bounds and a small viewport buffer; off-screen businesses
  remain searchable but do not create marker DOM nodes.
- At terminal neighborhood zoom, a bounded nearby-group marker opens its
  six-card viewer instead of demanding building-level zoom. Leaflet's basemap
  supplies road and place labels; MirtPage does not mount duplicate local labels.
- Selecting an individual showroom or booth opens a non-modal floating inspector
  above the existing map or venue. It never dims, blurs, or makes the background
  inert. Desktop centers it over a restrained low-opacity dismissible scrim so
  selection is unmistakable while the marketplace remains visible; phones use a
  compact bottom sheet above persistent app navigation. Close, scrim click, and Escape return
  focus without losing the visitor's map, filter, or venue state.
- The desktop industry menu is no wider than its trigger. Labels wrap within
  that width, and the menu remains inside the map command surface at narrower
  desktop/tablet widths. Phone industry selection continues through the bounded
  Filters sheet rather than spanning across the map.
- Visible OpenStreetMap attribution remains inside the map and links to the
  copyright and licence source on phone and desktop.

## Scenarios

```gherkin
Scenario: Nearby businesses separate as the map zooms
  GIVEN several eligible businesses are close at the country zoom
  WHEN the visitor activates their numbered cluster
  THEN the map zooms to the cluster expansion level
  AND smaller clusters, a bounded nearby-group marker, or individual businesses replace it
  AND no business is moved to a city-host coordinate

Scenario: Large marketplace map remains viewport bounded
  GIVEN the eligible cluster index contains thousands of reviewed showrooms
  WHEN a visitor pans or zooms on a constrained phone
  THEN Leaflet moves its existing tile and overlay panes during the gesture
  AND cluster, marker, and nearby-group reconciliation occurs after the gesture ends
  AND only the bounded visible viewport contributes showroom marker nodes
  AND map labels come from visible provider tiles rather than duplicate local DOM nodes

Scenario: Browser loads the detailed basemap within provider policy
  GIVEN the marketplace map is visible
  WHEN the visitor pans or zooms
  THEN the browser requests only visible tiles from https://tile.openstreetmap.org/{z}/{x}/{y}.png
  AND visible OpenStreetMap attribution remains available
  AND MirtPage does not proxy, prefetch, bulk-download, or service-worker-cache those tiles
  AND showroom search and place filtering continue to use the Supabase catalog

Scenario: Visitor opens a nearby showroom group
  GIVEN two or more eligible businesses in one city are grouped within the bounded proximity radius
  AND the visitor has expanded their geographic cluster to neighborhood zoom
  WHEN the visitor activates the nearby-group marker
  THEN a floating viewer opens over the unchanged map without route navigation
  AND no more than six image-led showroom cards render in readable columns
  AND no venue, internal scroll, page selector, or deeper map zoom is required
  AND closing the viewer returns focus without losing map state

Scenario: Visitor inspects one showroom from a nearby group
  GIVEN the nearby showroom inspector lists two to six businesses
  WHEN the visitor selects one showroom
  THEN that showroom's detail replaces the list inside the same inspector
  AND no second popup, scrim, or obscured nearby panel remains on screen
  AND Back to nearby restores the same group list
  AND the support launcher does not overlap the active inspector

Scenario: Isolated business remains independently discoverable
  GIVEN one eligible business is not near another at the active zoom
  WHEN the map renders
  THEN the business has its own compact storefront badge at its reviewed coordinates
  AND its first activation below local-detail zoom centers and enlarges the map
  AND activation at local-detail zoom opens the richer preview with a Visit Showroom action

Scenario: Visitor changes map industry
  GIVEN the map and the selected date's Daily Featured are visible
  WHEN the visitor chooses another industry
  THEN map clusters and markers use the newly selected eligible result set
  AND the date-selected Daily Featured remains unchanged

Scenario: Visitor receives an industry orientation choice over the loaded map
  GIVEN eligible published showrooms exist across multiple industries
  WHEN geographic discovery opens without an industry query
  THEN the de-duplicated combined map is projected behind a centered required chooser
  AND the chooser lists seven specific industries followed by All industries
  WHEN the visitor chooses one canonical industry
  THEN the chooser closes and that industry's eligible businesses appear on the Map
  AND the selected day's Daily Featured Showrooms industry remains unchanged

Scenario: Visitor keeps the combined marketplace
  GIVEN the initial industry orientation chooser is open
  WHEN the visitor chooses All industries
  THEN the chooser closes without filtering the de-duplicated combined map
  AND cross-listed businesses still appear only once

Scenario: Selected-industry map opens a nearby group directly
  GIVEN one nearby group contains eligible businesses in the selected industry
  WHEN the visitor opens its marker
  THEN every grouped showroom card renders without a second industry choice
  AND closing preserves the selected industry and map transform
  AND the viewer exposes no scheduled row or booth numbers

Scenario: Industry menu remains attached to its trigger
  GIVEN the desktop or tablet map command surface is visible
  WHEN the visitor opens the industry selector
  THEN the menu is no wider than the selector trigger
  AND long industry labels wrap without crossing the map or viewport edge

Scenario: Visitor filters the Map by place
  GIVEN eligible showrooms exist in more than one reviewed region or city
  WHEN the visitor chooses an available region or city
  THEN the server returns only matching eligible Map records

Scenario: Visitor chooses Near me
  GIVEN the browser supports geolocation
  WHEN the visitor explicitly activates Near me and grants permission
  THEN the map fits around the visitor's general area
  AND the exact visitor coordinate is not stored, logged, placed in the URL, or sent to the server
  AND denial leaves the national marketplace usable

Scenario: Visitor returns from a showroom
  GIVEN the visitor chose filters, a map transform, or a nearby-group marker
  before opening a permanent showroom
  WHEN the visitor activates the MirtPage Back control in the same tab
  THEN the explicit public workspace that launched the showroom is restored before any older browser-history destination
  AND its authoritative URL filters are restored
  AND the prior non-geolocation map transform and nearby-group viewer are restored when still valid
  AND no visitor coordinate is read from storage

Scenario: Today's featured program preserves a readable bounded floor
  GIVEN today's assigned industry has more than forty eligible businesses
  WHEN today's Daily Featured renders
  THEN exactly the first forty eligible businesses in authoritative order have booths
  AND every booth retains a readable logo or fallback mark, business name, reference, schedule, and status
  AND large and phone screens use readable columns and ordinary vertical floor scrolling when needed
  AND no hall, page selector, or hidden overflow record exists

Scenario: A dense area splits into readable nearby groups
  GIVEN one city area contains more than six eligible businesses within the proximity radius
  WHEN the terminal map markers render on desktop or phone
  THEN the cohort splits into deterministic balanced groups of at most six
  AND each marker opens one fixed-readable card viewer without pagination or internal scrolling
  AND the visitor never needs to zoom or pan sideways to read a storefront

Scenario: Visitor previews another program date
  GIVEN the visitor selects a date that is not today
  WHEN that Daily Featured preview renders
  THEN its expected booth slots appear as anonymous outlines
  AND no business name, image, handle, preview, or showroom link is exposed
  AND the schedule clearly identifies today's live Daily Featured
  AND after six seconds the selected Daily Featured returns to today

Scenario: Weekly schedule keeps stable positions
  GIVEN the Ethiopia-local day advances during the week
  WHEN the Daily Featured schedule renders
  THEN its cards remain ordered Monday through Sunday
  AND only the selected-teal Today indicator moves to the current weekday
  AND no saffron highlight is used for the current date

Scenario: Sunday presents the seventh industry Daily Featured
  GIVEN Sunday is selected
  WHEN the weekly program renders
  THEN Agriculture, livestock & primary produce is the stable assigned industry
  AND the same Daily Featured floor, preview redaction, and booth rules used on other days apply

Scenario: Daily Daily Featured broadcast changes state truthfully
  GIVEN the selected date uses two active sessions around a four-hour intermission
  WHEN the program has not started, is active, is on break, or has ended
  THEN the UI respectively shows the schedule, live booth or break, intermission, or Livestream ended
  AND the ended state directs visitors to configured YouTube recordings
  AND an unconfigured provider destination never renders as an invented link

Scenario: Live walkthrough identifies the current booth
  GIVEN today's Daily Featured has eligible booths and the TikTok walkthrough is active
  WHEN the current Ethiopia time enters a booth's consecutive schedule slot
  THEN that booth is the only booth marked Live now
  AND the broadcast status names its booth reference and revealed business
  AND every booth retains a visible scheduled EAT time range

Scenario: Merchant live status yields to the active Daily Featured spotlight
  GIVEN a business enabled a valid merchant live session
  AND that business is the current MirtPage Daily Featured walkthrough booth
  WHEN its map marker, nearby-group card, Daily Featured card, or preview is rendered
  THEN it is labeled Featured now instead of merchant Live
  AND other valid merchant live businesses remain labeled Live
  AND the saved merchant live setting is not changed

Scenario: Invalid retained live data reaches discovery
  GIVEN a retained row is marked live with an invalid provider destination
  WHEN public discovery is projected
  THEN no live badge or unsafe destination is serialized for that business

Scenario: Basemap tiles fail
  GIVEN the configured tile provider cannot load visible map tiles
  WHEN the visitor opens discovery
  THEN a clear bounded status explains that map detail is temporarily unavailable
  AND available showroom markers and controls remain usable over the neutral map surface
  AND Daily Featured and directly addressed permanent Showrooms remain available
```

## Quality impact

- Security and tenant isolation: only the public projection is serialized; no
  private contacts, request text, or media storage keys enter map or Daily Featured data.
- Privacy and data retention: reviewed business coordinates are intentionally
  public discovery data; visitor location is requested only after a clear user
  action, remains in browser memory for map fitting, and is never retained.
  Direct basemap requests disclose ordinary request metadata to OpenStreetMap as
  stated in the public Privacy notice; no search, account, or showroom record is
  included in a tile URL.
- Accessibility and responsive behavior: keyboard markers/clusters/gateways,
  labeled non-modal preview regions with close and Escape behavior, accessible controls, reduced motion, touch
  targets, and bounded previews.
- Localization and merchant-entered values: long place/business names truncate
  or wrap without changing marker/control geometry.
- Performance and limits: indexed marker projection, deterministic 800-meter
  same-city grouping, move-end Supercluster rendering, visible browser tiles,
  at most six nearby cards with no pagination or internal scroll, and one
  vertically scrolling Daily Featured layer with lazy dimensioned media.
- Failure recovery and idempotency: basemap tiles fail independently; Daily
  Featured and directly addressed permanent Showrooms do not depend on tile availability.

## Observability

Browser tests record asset failures and console errors without capturing search
text or visitor identifiers. Existing privacy-preserving visit analytics may
attribute `directory` and `expo` showroom entries.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Eligibility, bounded nearby groups, weekly schedule, Daily Featured redaction, and card references | integration | `scripts/test-discovery.ts` |
| Cluster expansion, nearby viewer, close restoration, marker preview | browser | `tests/acceptance/app.spec.ts` |
| Desktop/390px/320px map, nearby viewer, and Daily Featured layout | visual/browser | `scripts/capture-discovery-visuals.mjs` |
| Exact tile provider, attribution, CSP, no proxy/prefetch/cache | contract | `scripts/test-discovery-geography.mjs` |
| Basemap failure and Daily Featured recovery | browser | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

The browser basemap changes no canonical data. Current disposable fixtures may
be reset. Rollback deploys the prior first-party geography renderer and leaves
reviewed discovery profiles intact. Inactive local assets remain available only
through the monitored rollback window.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Evidence

Evidence: completed locally on 2026-08-01. Focused discovery tests prove the
fixed Ethiopia-local Monday-through-Sunday schedule and sequential references,
business-owned booth media, media-gated Daily Featured eligibility, and identity/media
redaction for every non-today date. Browser acceptance passed all 10 workflows,
including the six-second return to persistently highlighted today and the reduced
nearby-group transition. Desktop, 390px, and
320px visual captures passed with no overflow, no halls, anonymous preview
slots, complete today booths, and 44px-or-larger controls. `npm run check` and
`npm run release` passed. Production rollout and TikTok configuration remain
excluded.

Reopened on 2026-08-09 for the global five-business sponsor pool, retained
established map symbols with live/featured indicators, and non-modal floating
showroom inspector.
Focused data, migration, type, homepage, narrative, and spec gates pass. Fresh
Chromium evidence proves the industry menu remains exactly within its 276px
trigger, the desktop inspector is centered over a 14% scrim without making the
map inert, the phone sheet clears navigation by 72px with zero overflow, and
the established showroom/city-market markers expose live and featured presence.
User visual approval remains pending before the complete release suite.

The 2026-08-09 terminology follow-up retains internal `expo` compatibility
identifiers while focused browser evidence proves every visitor-visible and
accessible program label uses Daily Featured Showrooms and renders no legacy
Daily Featured wording.

The 2026-08-24 marketplace follow-up preserves an explicit **All industries**
choice while keeping discovery map-only. Integration evidence proves the
omitted and explicit `all` states include every eligible industry, de-duplicate
a cross-listed business, group nearby markers into bounded map viewers, and
leave the weekday-selected Daily Featured projection unchanged. Full release
evidence is recorded in TRACEABILITY after the final gate.

The 2026-08-10 search follow-up adds the bounded public autocomplete defined by
FE-030 and BE-023. Focused integration and Chromium evidence prove suggestion
eligibility, keyboard/touch selection, URL-backed map updates, and no
effect on Daily Featured Showrooms selection.
