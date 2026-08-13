---
id: FE-021
title: Geographic Showroom map and Daily Featured Showrooms
status: in_progress
related: [FE-001, FE-003, FE-013, FE-017, FE-018, FE-020, FE-022, FE-024, FE-027, FE-028, FE-030, FE-033, FE-034, FE-036, FE-037, BE-019, BE-020, BE-021, BE-023, BE-029, DEP-016, DEP-017, DEP-024, ADR-0011]
owners: [product, frontend, design]
last_updated: 2026-08-10
change_level: L3
---

# FE-021 - Geographic Showroom map and Daily Featured Showrooms

## Problem and outcome

City venues hide the real location of an otherwise isolated business and make
geographic discovery feel artificial. Visitors also need a second, explicitly
curated way to browse the same businesses without confusing a scheduled
showroom presentation with the physical map.

The outcome is an application-first marketplace where the map clusters nearby
businesses until a visitor reaches an isolated exact-location storefront badge or a counted
multi-business city gateway. A gateway replaces the map inside its existing frame
with one continuous virtual City Showroom, where every matching city business is reachable by pan and zoom and
no hall or page changes. Below it, a separate weekly
country-wide program presents one industry as Daily Featured Showrooms on every
day of the week on a calm, bounded presentation surface.

## Scope

### In scope

- Individual business markers at reviewed WGS84 coordinates.
- Numbered, zoom-dependent clusters and click/tap-to-expand behavior.
- Counted close-zoom city gateways for two or more businesses sharing a reviewed
  city and region, while isolated businesses remain exact-coordinate storefront badges.
- One map-frame virtual City Showroom panel containing every grouped business on a
  dynamically sized, pannable and zoomable floor without halls or pagination.
- Local region, zone, city/town, and road context with no runtime map service.
- Search, industry, region/city, map, and List controls over one eligible result set.
- One compact teal map command area containing result context, Map/List mode,
  live search, region/city filter, Near me action, and map controls directly above the map.
- Server-paginated List results with at most five businesses per response page.
- A fixed Monday-through-Sunday date selector for the Ethiopia-local calendar
  week with one stable assigned industry on each of all seven days.
- One dynamically sized, pannable and zoomable Daily Featured floor with every booth on
  the same surface, stable numbered references, and no halls or pagination.
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
  markers, City Showroom booths, and today's Daily Featured booths, with the active
  MirtPage Daily Featured walkthrough taking presentation precedence for its current booth.
- Mobile-first touch, pan, bounded zoom, fit/reset, map reset, List fallback,
  and continuous Daily Featured-floor controls.

### Non-goals

- Claiming a physical map venue, Daily Featured building, street navigation, routing,
  turn-by-turn directions, or authoritative boundaries.
- Placing virtual Daily Featured floors over the geographic map.
- Claiming that a virtual City Showroom is a physical mall, venue, or shared address.
- Remote tile, geocoding, or map-rendering requests from a visitor's browser.
- Hiding a published active showroom because a manual renewal date elapsed.
- A separate duplicated all-business directory.

## Domain language and invariants

- **Daily Featured Showrooms:** the only visitor-facing name for the scheduled
  seven-day industry program. The legacy `expo` name remains solely in internal
  types, query keys, analytics values, routes, styles, and persistence contracts
  to preserve compatibility. The word "Daily Featured" must not appear in rendered public
  navigation, headings, explanatory copy, status copy, controls, or accessible
  names.

- **Geographic Showroom marker:** one eligible business at its reviewed coordinates.
  It uses a compact fixed-size map-pin silhouette containing a familiar upright
  storefront and a short Showroom label. It distinguishes one showroom from an
  aggregate and does not load booth photography into the map renderer.
- **Cluster:** a zoom-dependent aggregate of two or more nearby markers. Its
  number is the exact number of represented businesses.
- **City gateway:** a close-zoom aggregate for two or more eligible businesses
  with the same reviewed city and region. Its count is exact; its centroid is a
  discovery affordance rather than a replacement address. It uses the
  established outlined market-building symbol, aggregate halo, exact count
  badge, and city label so it cannot be confused with one showroom.
  The building uses a high-contrast dark outline and lightly tinted fill so it
  remains distinguishable over every supported map region.
- **Virtual City Showroom:** one continuous non-map floor opened from a city gateway.
  Every represented business remains on the same floor and links to its
  permanent showroom; there are no halls, pages, or hidden overflow records.
- **Weekly industry Daily Featured:** a virtual, country-wide presentation of one stable
  industry assigned to each day of the week. All seven days use the same Daily Featured
  floor, eligibility, preview, and booth-reference rules.
- Map, List, Featured, and Daily Featured share the same server-authoritative eligibility
  rules, but not the same selection state. Map industry/search controls do not
  alter the date-selected Daily Featured.
- Merchant live state is displayed only when the stored platform and HTTPS link
  pass the existing provider allowlist. The current Daily Featured walkthrough business is
  labeled **Featured now** across any visible map or venue representation. That
  presentation temporarily replaces its merchant **Live** badge without changing
  the tenant's saved live setting; all other valid live businesses remain labeled.
- A single business does not move to a host city. At sufficient zoom it is
  shown at its own reviewed latitude and longitude. Multi-business city members
  retain exact coordinates in authority while their final discovery affordance
  is one counted city gateway.
- Activating a cluster zooms to the level where its children separate. At the
  maximum supported zoom, individual markers remain reachable.
- A location option represents businesses near that named place, not a claim
  that every result lies inside an authoritative city boundary.
- Every Daily Featured business occupies one stable slot on one continuous floor. The
  floor expands with the eligible count and never moves overflow into a hall or
  page.
- Daily Featured booth references are `{industry-code}-B{booth}` and deterministic for an
  unchanged selected result set.
- An approved booth image belongs to the business discovery profile and is the
  only factual Daily Featured-booth visual. A named fallback handles file failure without
  creating eligibility. Non-today previews receive neither identity nor media.

## Contracts

- Industry, bounded search, List page, map/list mode, and selected Daily Featured weekday
  remain URL-addressable and server-authoritative where they affect data.
- Bounded search suggestions use only eligible public showroom names,
  published offering names, and reviewed city/region labels from the active
  map/List scope. Suggestions never alter Daily Featured Showrooms eligibility.
- Omitted or explicit `all` industry state selects **All industries** for the
  initial geographic Map and List projection. Cross-listed businesses appear
  once, and the scheduled Daily Featured Showrooms industry remains controlled
  only by its selected weekday.
- Every projected showroom has one deterministic primary visual industry: its
  earliest membership in the canonical seven-industry order. This presentation
  identity coordinates the industry menu swatch, individual showroom marker,
  paginated List card, and City Showroom booth border and fascia without changing any cross-list membership or
  selected-industry eligibility. Industry text or iconography remains visible
  wherever the accent communicates meaning.
- Region/city filtering is URL-addressable and server-authoritative for both Map
  and List. Available options derive only from eligible reviewed business
  profiles and never imply an authoritative administrative boundary.
- **Near me** requests browser geolocation only after an explicit visitor
  action. A granted coordinate is used in memory to center the local map and is
  not persisted, logged, added to the URL, or sent to the application server.
  Denial or browser failure leaves all region/city and national controls usable.
- Public filters, mode, List page, and selected program date are durable URL state. The last
  non-geolocation map transform and open city gateway may be retained in
  same-tab session storage for two hours so browser Back restores context; they
  do not alter eligibility. A **Near me** coordinate or transform derived from
  it is never persisted.
- The stable weekly assignment is Monday Electronics, Tuesday Beauty & Care,
  Wednesday Food & Beverage Production, Thursday Machinery & Industrial,
  Friday Home & Building, Saturday Fashion & Textiles, and Sunday Agriculture
  & Primary Produce.
- The seven-date selector remains in fixed Monday-through-Sunday order and
  labels the current Ethiopia-local calendar week. The cards never reorder as
  the week advances; the persistent **Today** indicator moves to the applicable
  fixed weekday.
- Today uses the same strong teal treatment as the active industry card without
  saffron or warning color. A different selected date uses a separate temporary soft treatment and
  returns to today after six seconds; choosing another non-today date restarts
  that timer while preserving map industry, search, and view state.
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
- Map and floor controls use familiar zoom/reset icons with accessible names.
  Industry and view modes use labeled segmented or tab controls.
- At 320px and 390px, all primary controls are at least 44px, horizontal rails
  are bounded without horizontal day-selector scrolling, the document has no
  horizontal overflow, and the map remains
  pannable without trapping page scrolling outside its stage.
- The map command area avoids duplicate filter rows and keeps the map within the
  first painted mobile and desktop viewport.
- The City Showroom replaces the map inside the same bounded frame while open,
  suspending the geographic renderer instead of layering two interactive surfaces.
  It uses one transformed floor layer, lazy dimensioned media, bounded zoom,
  reduced-motion behavior, a clear **Back to map** action, and fit-to-view
  initialization. Drag/zoom is useful only when floor overflow
  exists; a small floor remains centered and stable.
- In **All industries**, the City Market gives every canonical primary visual
  industry exactly one contiguous district. District area grows from the number
  of participating showrooms, including useful arrangements for one, two, or
  many showrooms, while every showroom keeps the same readable booth footprint.
- Districts use deterministic near-square internal placement and bounded
  rectangular packing. A soft industry floor field, restrained boundary, and
  one text label identify the complete group without relying on color alone.
  Shared walkways separate districts, and neither districts nor booths overlap
  venue walls, architectural props, or another district.
- The City Market hall expands in logical width or depth when its districts no
  longer fit a balanced floor. It remains centered and fully visible at initial
  fit on desktop and phone, preserves stable geometry for the same participant
  set, and does not shrink booth cards to absorb additional businesses.
- A selected-industry City Market retains its ordinary single-scope arrangement
  because every result already shares the selected industry.
- An all-industry floor retains neutral architecture around its multi-industry
  booth groups. A selected-industry floor inherits that selected industry's
  allowlisted soft and strong accents across the hall field, architectural
  edge, and city sign while keeping the venue image legible and booth content
  surfaces white.
- The Daily Featured uses the same one-layer performance contract, with restrained
  architectural context, direct transforms, fit-to-view initialization, and no
  React rerender for every pan or zoom frame.
- City Market showrooms render as unnumbered physical storefronts mounted to
  shallow floor platforms because their membership may change. Daily Featured
  Showrooms remains a separate scheduled venue whose numbered booth references
  advance left-to-right and then top-to-bottom through deterministic exhibition
  rows. Both remain readable at fitted scale and clear venue walls and props;
  City Market districts do not change Daily Featured Showrooms geometry,
  numbering, schedule, sponsor placement, or walkthrough behavior.
- Exactly five staff-selected paid sponsored showrooms compose into a right-side Daily Featured information
  rail on desktop, balancing the map workbench's left-side command panel. The
  pool is global and does not change with map industry, search, place, or Daily Featured
  day. The rail and venue share one bounded workspace. Desktop shows all five. On phones
  the five-item pool becomes one locked two-card slot above the floor; exactly
  two distinct clickable sponsors are visible, and a different random pair
  replaces them automatically without scrolling, dragging, pausing, or controls.
- At phone widths the fixed seven-day selector becomes one compact touch-sized
  row floating over the venue frame. It remains inside the Daily Featured section, keeps
  Today and selected-date states distinct, and does not overlap booths or floor
  controls. The long selected-day description is visually omitted while its
  title and livestream status remain available.
- Geographic zoom commits rendered labels and marker detail only after the zoom
  gesture or animation ends, and city gateways appear before unnecessary
  street-level magnification.
- A city gateway uses the established outlined market-building symbol, aggregate
  halo, count badge, and city name so it is visually distinct from both numbered
  clusters and one-business showroom markers.
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
- Local geographic attribution remains visible and links to the source licence.

## Scenarios

```gherkin
Scenario: Nearby businesses separate as the map zooms
  GIVEN several eligible businesses are close at the country zoom
  WHEN the visitor activates their numbered cluster
  THEN the map zooms to the cluster expansion level
  AND smaller clusters, a counted city gateway, or individual businesses replace it
  AND no business is moved to a city-host coordinate

Scenario: Visitor enters a multi-business City Showroom
  GIVEN two or more eligible businesses share a reviewed city and region
  AND the visitor has expanded the geographic cluster to close city zoom
  WHEN the visitor activates the counted city gateway
  THEN the virtual City Showroom replaces the map inside the same frame without route navigation
  AND every represented business is reachable on one continuous floor
  AND no hall, page selector, or duplicate individual city pin is shown
  AND Back to map returns to the same map state

Scenario: Isolated business remains independently discoverable
  GIVEN one eligible business is not near another at the active zoom
  WHEN the map renders
  THEN the business has its own compact storefront badge at its reviewed coordinates
  AND its first activation below local-detail zoom centers and enlarges the map
  AND activation at local-detail zoom opens the richer preview with a Visit Showroom action

Scenario: Visitor changes map industry
  GIVEN the map and the selected date's Daily Featured are visible
  WHEN the visitor chooses another industry
  THEN map clusters and list rows use the newly selected eligible result set
  AND the date-selected Daily Featured remains unchanged

Scenario: Visitor begins with every industry visible
  GIVEN eligible published showrooms exist across multiple industries
  WHEN geographic discovery opens without an industry query
  THEN All industries is selected
  AND each eligible business appears at most once across Map and List results
  AND the selected day's Daily Featured Showrooms industry remains unchanged

Scenario: All-industry City Showroom groups related businesses
  GIVEN a city contains eligible businesses from several industries
  WHEN the visitor opens its City Showroom under All industries
  THEN every primary visual industry occupies exactly one contiguous district
  AND districts follow the canonical seven-industry order
  AND district area grows with its showroom count while booth footprints remain equal
  AND every district and booth retains a readable industry label and restrained matching border
  AND the City Market exposes no scheduled row or booth numbers

Scenario: Visitor switches from Map to List
  GIVEN eligible showrooms from one or several industries are projected
  WHEN the visitor opens the server-paginated List
  THEN each card retains its primary visual industry's labeled accent
  AND an all-industry List remains neutral around the cards
  AND a selected-industry List uses a restrained matching field without changing pagination or eligibility

Scenario: Industry menu remains attached to its trigger
  GIVEN the desktop or tablet map command surface is visible
  WHEN the visitor opens the industry selector
  THEN the menu is no wider than the selector trigger
  AND long industry labels wrap without crossing the map or viewport edge

Scenario: Visitor filters Map and List by place
  GIVEN eligible showrooms exist in more than one reviewed region or city
  WHEN the visitor chooses an available region or city
  THEN the server returns only matching eligible Map and List records
  AND List pagination counts the same filtered result set

Scenario: Visitor chooses Near me
  GIVEN the browser supports geolocation
  WHEN the visitor explicitly activates Near me and grants permission
  THEN the map fits around the visitor's general area
  AND the exact visitor coordinate is not stored, logged, placed in the URL, or sent to the server
  AND denial leaves the national marketplace usable

Scenario: Visitor returns from a showroom
  GIVEN the visitor chose filters, map mode, a map transform, or a city gateway
  before opening a permanent showroom
  WHEN the visitor activates the MirtPage Back control in the same tab
  THEN the authoritative URL filters and mode are restored
  AND the prior non-geolocation map transform and city floor are restored when still valid
  AND no visitor coordinate is read from storage

Scenario: Today's featured program grows on one floor
  GIVEN today's assigned industry has more than twelve eligible businesses
  WHEN today's Daily Featured renders
  THEN every eligible business has one booth on one continuous floor
  AND pan, zoom, and fit controls keep every booth reachable
  AND no hall, page selector, or hidden overflow record exists

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
  WHEN its map marker, city booth, Daily Featured booth, or preview is rendered
  THEN it is labeled Featured now instead of merchant Live
  AND other valid merchant live businesses remain labeled Live
  AND the saved merchant live setting is not changed

Scenario: Invalid retained live data reaches discovery
  GIVEN a retained row is marked live with an invalid provider destination
  WHEN public discovery is projected
  THEN no live badge or unsafe destination is serialized for that business

Scenario: List results exceed one response page
  GIVEN more than five businesses match the map filters
  WHEN the visitor opens List and moves to the next page
  THEN the server returns no more than five rows for that page
  AND the map remains in its stable stage instead of being pushed by results

Scenario: Local map assets fail
  GIVEN a local geographic asset cannot load
  WHEN the visitor opens discovery
  THEN a clear fallback offers List View
  AND the Daily Featured and every matching permanent Showroom remain reachable
```

## Quality impact

- Security and tenant isolation: only the public projection is serialized; no
  private contacts, request text, or media storage keys enter map or Daily Featured data.
- Privacy and data retention: reviewed business coordinates are intentionally
  public discovery data; visitor location is requested only after a clear user
  action, remains in browser memory for map fitting, and is never retained.
- Accessibility and responsive behavior: keyboard markers/clusters/gateways,
  labeled non-modal preview regions with close and Escape behavior, accessible controls, reduced motion, touch
  targets, bounded previews, and list parity.
- Localization and merchant-entered values: long place/business names truncate
  or wrap without changing marker/control geometry.
- Performance and limits: indexed marker projection, deterministic in-memory
  city grouping, zoom-end map rendering, one hardware-transformed layer per
  open floor, lazy dimensioned media, SQL count/limit/offset list pages, and
  zoom-tiered geography.
- Failure recovery and idempotency: local assets fail independently; list and
  Daily Featured do not depend on map initialization.

## Observability

Browser tests record asset failures and console errors without capturing search
text or visitor identifiers. Existing privacy-preserving visit analytics may
attribute `directory` and `expo` showroom entries.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Eligibility, server list pages, weekly schedule, Daily Featured redaction, floor slots/references | integration | `scripts/test-discovery.ts` |
| Cluster expansion, city gateway/floor, close restoration, marker preview | browser | `tests/acceptance/app.spec.ts` |
| Desktop/390px/320px map, City Showroom, and Daily Featured layout | visual/browser | `scripts/capture-discovery-visuals.mjs` |
| Local geography failure and list/Daily Featured recovery | browser | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

The public projection and geography assets are additive. Current disposable
fixtures may be reset. Rollback deploys the prior City Showroom workspace and leaves
reviewed discovery profiles intact. Production data conversion remains outside
this pre-launch change.

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
fixed Ethiopia-local Monday-through-Sunday schedule, sequential one-floor references,
business-owned booth media, media-gated Daily Featured eligibility, and identity/media
redaction for every non-today date. Browser acceptance passed all 10 workflows,
including the six-second return to persistently highlighted today, continuous
floor pan/zoom/fit, and the reduced city-gateway transition. Desktop, 390px, and
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

The 2026-08-10 default-filter follow-up passes focused type, discovery,
homepage, and specification checks. Integration evidence proves the omitted and
explicit `all` states include every eligible industry, de-duplicate a
cross-listed business, preserve five-row List pagination, and leave the
weekday-selected Daily Featured Showrooms projection unchanged. Focused desktop
and 390px captures show the combined 66-showroom result and the desktop **All
industries** selection. Full release gates remain pending visual approval.

The 2026-08-10 search follow-up adds the bounded public autocomplete defined by
FE-030 and BE-023. Focused integration and Chromium evidence prove suggestion
eligibility, keyboard/touch selection, URL-backed map/List updates, and no
effect on Daily Featured Showrooms selection.
