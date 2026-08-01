---
id: FE-021
title: Geographic Suq map and weekly industry Expo
status: done
related: [FE-001, FE-003, FE-013, FE-017, FE-018, FE-020, BE-019, BE-020, DEP-016, DEP-017, ADR-0011]
owners: [product, frontend, design]
last_updated: 2026-08-01
change_level: L3
---

# FE-021 - Geographic Suq map and weekly industry Expo

## Problem and outcome

City venues hide the real location of an otherwise isolated business and make
geographic discovery feel artificial. Visitors also need a second, explicitly
curated way to browse the same businesses without confusing a virtual Expo with
the physical map.

The outcome is an application-first marketplace where the map clusters nearby
businesses until a visitor reaches an isolated exact-location pin or a counted
multi-business city gateway. A gateway opens one continuous virtual City Suq
over the map, with every matching city business reachable by pan and zoom and
no hall or page changes. Below it, a separate weekly
country-wide program presents Monday through Saturday industry Expos and a
Sunday TikTok livestream showcase on calm, bounded presentation surfaces.

## Scope

### In scope

- Individual business markers at reviewed WGS84 coordinates.
- Numbered, zoom-dependent clusters and click/tap-to-expand behavior.
- Counted close-zoom city gateways for two or more businesses sharing a reviewed
  city and region, while isolated businesses remain exact-coordinate pins.
- One map-backed virtual City Suq dialog containing every grouped business on a
  dynamically sized, pannable and zoomable floor without halls or pagination.
- Local region, zone, city/town, and road context with no runtime map service.
- Search, industry, featured, map, and list controls over one eligible result set.
- Server-paginated List results with at most five businesses per response page.
- A rolling date-labeled selector beginning today and exposing the next six
  dates: Monday through Saturday each have one stable assigned industry, while
  Sunday is a TikTok livestream showcase of selected featured businesses.
- One dynamically sized, pannable and zoomable Expo floor with every booth on
  the same surface, stable numbered references, and no halls or pagination.
- Full business identity, approved booth imagery, preview, and showroom links
  only for today's selected Expo; every other date exposes anonymous booth
  outlines and schedule information without business identity or media.
- A compact marker preview and permanent **Visit Suq** destination.
- Mobile-first touch, pan, bounded zoom, fit/reset, map reset, List fallback,
  and continuous Expo-floor controls.

### Non-goals

- Claiming a physical map venue, Expo building, street navigation, routing,
  turn-by-turn directions, or authoritative boundaries.
- Placing virtual Expo floors over the geographic map.
- Claiming that a virtual City Suq is a physical mall, venue, or shared address.
- Remote tile, geocoding, or map-rendering requests from a visitor's browser.
- Hiding a published active showroom because a manual renewal date elapsed.
- A separate duplicated all-business directory.

## Domain language and invariants

- **Geographic Suq marker:** one eligible business at its reviewed coordinates.
- **Cluster:** a zoom-dependent aggregate of two or more nearby markers. Its
  number is the exact number of represented businesses.
- **City gateway:** a close-zoom aggregate for two or more eligible businesses
  with the same reviewed city and region. Its count is exact; its centroid is a
  discovery affordance rather than a replacement address.
- **Virtual City Suq:** one continuous non-map floor opened from a city gateway.
  Every represented business remains on the same floor and links to its
  permanent showroom; there are no halls, pages, or hidden overflow records.
- **Weekly industry Expo:** a virtual, country-wide presentation of one stable
  industry assigned to each Monday-through-Saturday date. Sunday is a TikTok
  livestream showcase of selected featured businesses.
- Map, List, Featured, and Expo share the same server-authoritative eligibility
  rules, but not the same selection state. Map industry/search controls do not
  alter the date-selected Expo.
- A single business does not move to a host city. At sufficient zoom it is
  shown at its own reviewed latitude and longitude. Multi-business city members
  retain exact coordinates in authority while their final discovery affordance
  is one counted city gateway.
- Activating a cluster zooms to the level where its children separate. At the
  maximum supported zoom, individual markers remain reachable.
- A location option represents businesses near that named place, not a claim
  that every result lies inside an authoritative city boundary.
- Every Expo business occupies one stable slot on one continuous floor. The
  floor expands with the eligible count and never moves overflow into a hall or
  page.
- Expo booth references are `{industry-code}-B{booth}` and deterministic for an
  unchanged selected result set.
- An approved booth image belongs to the business discovery profile and is the
  only factual Expo-booth visual. A named fallback handles file failure without
  creating eligibility. Non-today previews receive neither identity nor media.

## Contracts

- Industry, bounded search, List page, map/list mode, and selected Expo weekday
  remain URL-addressable and server-authoritative where they affect data.
- Map zoom, selected cluster/marker, open city gateway, and City Suq transform
  are transient browser state and do not alter eligibility.
- The stable weekly assignment is Monday Electronics, Tuesday Beauty & Care,
  Wednesday Food & Farming, Thursday Machinery & Tools, Friday Home & Living,
  Saturday Fashion & Textiles, and Sunday TikTok livestream.
- The seven-date selector begins with Ethiopia-local today and moves forward six
  dates; it never presents a past date as an upcoming preview.
- Today's date retains the strongest persistent visual emphasis even while a
  different date has temporary selected styling. A non-today preview returns to
  today after six seconds; choosing another non-today date restarts that timer
  while preserving map industry, search, and view state.
- Map and floor controls use familiar zoom/reset icons with accessible names.
  Industry and view modes use labeled segmented or tab controls.
- At 320px and 390px, all primary controls are at least 44px, horizontal rails
  are bounded, the document has no horizontal overflow, and the map remains
  pannable without trapping page scrolling outside its stage.
- The City Suq uses one transformed floor layer, lazy dimensioned media, bounded
  zoom, reduced-motion behavior, native modal focus containment, Escape/Close,
  and fit-to-view initialization. Drag/zoom is useful only when floor overflow
  exists; a small floor remains centered and stable.
- The Expo uses the same one-layer performance contract, with restrained
  architectural context, direct transforms, fit-to-view initialization, and no
  React rerender for every pan or zoom frame.
- Geographic zoom commits rendered labels and marker detail only after the zoom
  gesture or animation ends, and city gateways appear before unnecessary
  street-level magnification.
- Local geographic attribution remains visible and links to the source licence.

## Scenarios

```gherkin
Scenario: Nearby businesses separate as the map zooms
  GIVEN several eligible businesses are close at the country zoom
  WHEN the visitor activates their numbered cluster
  THEN the map zooms to the cluster expansion level
  AND smaller clusters, a counted city gateway, or individual businesses replace it
  AND no business is moved to a city-host coordinate

Scenario: Visitor enters a multi-business City Suq
  GIVEN two or more eligible businesses share a reviewed city and region
  AND the visitor has expanded the geographic cluster to close city zoom
  WHEN the visitor activates the counted city gateway
  THEN one map-backed virtual City Suq opens without route navigation
  AND every represented business is reachable on one continuous floor
  AND no hall, page selector, or duplicate individual city pin is shown
  AND Close or Escape returns to the same map state

Scenario: Isolated business remains independently discoverable
  GIVEN one eligible business is not near another at the active zoom
  WHEN the map renders
  THEN the business has its own marker at its reviewed coordinates
  AND activating it opens a compact preview with a Visit Suq action

Scenario: Visitor changes map industry
  GIVEN the map and the selected date's Expo are visible
  WHEN the visitor chooses another industry
  THEN map clusters and list rows use the newly selected eligible result set
  AND the date-selected Expo remains unchanged

Scenario: Today's Expo grows on one floor
  GIVEN today's assigned industry has more than twelve eligible businesses
  WHEN today's Expo renders
  THEN every eligible business has one booth on one continuous floor
  AND pan, zoom, and fit controls keep every booth reachable
  AND no hall, page selector, or hidden overflow record exists

Scenario: Visitor previews another Expo date
  GIVEN the visitor selects a date that is not today
  WHEN that Expo preview renders
  THEN its expected booth slots appear as anonymous outlines
  AND no business name, image, handle, preview, or showroom link is exposed
  AND the schedule clearly identifies today's live Expo
  AND after six seconds the selected Expo returns to today

Scenario: Sunday presents selected businesses live
  GIVEN Sunday is selected
  WHEN the weekly program renders
  THEN it identifies the SuqPage TikTok livestream
  AND selected featured businesses have permanent Visit Suq destinations
  AND no Expo floor or geographic-map venue is rendered

Scenario: List results exceed one response page
  GIVEN more than five businesses match the map filters
  WHEN the visitor opens List and moves to the next page
  THEN the server returns no more than five rows for that page
  AND the map remains in its stable stage instead of being pushed by results

Scenario: Local map assets fail
  GIVEN a local geographic asset cannot load
  WHEN the visitor opens discovery
  THEN a clear fallback offers List View
  AND the Expo and every matching permanent Suq remain reachable
```

## Quality impact

- Security and tenant isolation: only the public projection is serialized; no
  private contacts, request text, or media storage keys enter map or Expo data.
- Privacy and data retention: reviewed business coordinates are intentionally
  public discovery data; no visitor location is requested.
- Accessibility and responsive behavior: keyboard markers/clusters/gateways,
  native modal focus containment, accessible controls, reduced motion, touch
  targets, bounded previews, and list parity.
- Localization and merchant-entered values: long place/business names truncate
  or wrap without changing marker/control geometry.
- Performance and limits: indexed marker projection, deterministic in-memory
  city grouping, zoom-end map rendering, one hardware-transformed layer per
  open floor, lazy dimensioned media, SQL count/limit/offset list pages, and
  zoom-tiered geography.
- Failure recovery and idempotency: local assets fail independently; list and
  Expo do not depend on map initialization.

## Observability

Browser tests record asset failures and console errors without capturing search
text or visitor identifiers. Existing privacy-preserving visit analytics may
attribute `directory` and `expo` showroom entries.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Eligibility, server list pages, weekly schedule, Expo redaction, floor slots/references | integration | `scripts/test-discovery.ts` |
| Cluster expansion, city gateway/floor, close restoration, marker preview | browser | `tests/acceptance/app.spec.ts` |
| Desktop/390px/320px map, City Suq, and Expo layout | visual/browser | `scripts/capture-discovery-visuals.mjs` |
| Local geography failure and list/Expo recovery | browser | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

The public projection and geography assets are additive. Current disposable
fixtures may be reset. Rollback deploys the prior City Suq workspace and leaves
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
rolling Ethiopia-local seven-date schedule, sequential one-floor references,
business-owned booth media, media-gated Expo eligibility, and identity/media
redaction for every non-today date. Browser acceptance passed all 10 workflows,
including the six-second return to persistently highlighted today, continuous
floor pan/zoom/fit, and the reduced city-gateway transition. Desktop, 390px, and
320px visual captures passed with no overflow, no halls, anonymous preview
slots, complete today booths, and 44px-or-larger controls. `npm run check` and
`npm run release` passed. Production rollout and TikTok configuration remain
excluded.
