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

The outcome is an application-first marketplace where the map places every
eligible Suq at its reviewed coordinates, clusters only nearby points until the
visitor zooms in, and opens individual Suq previews. Below it, a separate weekly
country-wide program presents Monday through Saturday industry Expos and a
Sunday TikTok livestream showcase on calm, bounded presentation surfaces.

## Scope

### In scope

- Individual business markers at reviewed WGS84 coordinates.
- Numbered, zoom-dependent clusters and click/tap-to-expand behavior.
- Local region, zone, city/town, and road context with no runtime map service.
- Search, industry, featured, map, and list controls over one eligible result set.
- Server-paginated List results with at most five businesses per response page.
- A date-labeled weekly Expo selector: Monday through Saturday each have one
  stable assigned industry, while Sunday is a TikTok livestream showcase of
  selected featured businesses.
- Twelve booths per Expo hall, deterministic hall navigation, numbered booth
  references, approved booth imagery, and named visual fallback on file failure.
- A compact marker preview and permanent **Visit Suq** destination.
- Mobile-first touch, pan, zoom, map reset, list fallback, and Expo hall controls.

### Non-goals

- Claiming a physical map venue, Expo building, street navigation, routing,
  turn-by-turn directions, or authoritative boundaries.
- Placing virtual Expo floors over the geographic map.
- Rendering a mall, hall, venue, or host-city aggregate on the geographic map.
- Remote tile, geocoding, or map-rendering requests from a visitor's browser.
- Hiding a published active showroom because a manual renewal date elapsed.
- A separate duplicated all-business directory.

## Domain language and invariants

- **Geographic Suq marker:** one eligible business at its reviewed coordinates.
- **Cluster:** a zoom-dependent aggregate of two or more nearby markers. Its
  number is the exact number of represented businesses.
- **Weekly industry Expo:** a virtual, country-wide presentation of one stable
  industry assigned to each Monday-through-Saturday date. Sunday is a TikTok
  livestream showcase of selected featured businesses.
- Map, List, Featured, and Expo share the same server-authoritative eligibility
  rules, but not the same selection state. Map industry/search controls do not
  alter the date-selected Expo.
- A single business does not move to a host city. At a sufficient zoom it is
  always shown at its own reviewed latitude and longitude.
- Activating a cluster zooms to the level where its children separate. At the
  maximum supported zoom, individual markers remain reachable.
- A location option represents businesses near that named place, not a claim
  that every result lies inside an authoritative city boundary.
- An Expo hall contains at most 12 booths. Additional businesses create Hall 2,
  Hall 3, and so on without enlarging one rendered floor.
- Expo booth references are `{industry-code}-H{hall}-B{booth}` and deterministic
  for an unchanged selected result set.
- An approved booth image is the preferred Expo visual. A named fallback is
  only a failed-file rendering fallback and does not create eligibility.

## Contracts

- Industry, bounded search, List page, map/list mode, and selected Expo weekday
  remain URL-addressable and server-authoritative where they affect data.
- Map zoom and selected cluster/marker are transient browser state and do not
  alter eligibility.
- The stable weekly assignment is Monday Electronics, Tuesday Beauty & Care,
  Wednesday Food & Farming, Thursday Machinery & Tools, Friday Home & Living,
  Saturday Fashion & Textiles, and Sunday TikTok livestream.
- Map controls use familiar zoom/reset icons with accessible names. Industry,
  view, and hall modes use labeled segmented or tab controls.
- At 320px and 390px, all primary controls are at least 44px, horizontal rails
  are bounded, the document has no horizontal overflow, and the map remains
  pannable without trapping page scrolling outside its stage.
- Local geographic attribution remains visible and links to the source licence.

## Scenarios

```gherkin
Scenario: Nearby businesses separate as the map zooms
  GIVEN several eligible businesses are close at the country zoom
  WHEN the visitor activates their numbered cluster
  THEN the map zooms to the cluster expansion level
  AND smaller clusters or individual businesses replace it
  AND no business is moved to a city-host coordinate

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

Scenario: Expo exceeds one hall
  GIVEN the selected industry has more than twelve eligible businesses
  WHEN that industry's assigned weekday Expo renders
  THEN Hall 1 contains at most twelve usable booths
    AND every remaining business is reachable in deterministic later halls

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
- Accessibility and responsive behavior: keyboard markers/clusters, accessible
  control names, reduced motion, touch targets, bounded previews, and list parity.
- Localization and merchant-entered values: long place/business names truncate
  or wrap without changing marker/control geometry.
- Performance and limits: indexed marker projection, SQL count/limit/offset list
  pages, zoom-tiered local geography, one rendered Expo hall, and dimensioned images.
- Failure recovery and idempotency: local assets fail independently; list and
  Expo do not depend on map initialization.

## Observability

Browser tests record asset failures and console errors without capturing search
text or visitor identifiers. Existing privacy-preserving visit analytics may
attribute `directory` and `expo` showroom entries.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Eligibility, server list pages, weekly schedule, Expo hall bounds/references | integration | `scripts/test-discovery.ts` |
| Cluster expansion and marker preview | browser | `tests/acceptance/app.spec.ts` |
| Desktop/390px/320px map and Expo layout | visual/browser | `scripts/capture-discovery-visuals.mjs` |
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

## Completion evidence

Evidence: verified locally on 2026-08-01. The seven-date selector assigns one
stable industry to Monday through Saturday and a selected-business TikTok live
presentation to Sunday. Map search and industry state remain independent from
that schedule. Repeated visible-cluster activation reaches exact-coordinate
pins without a map mall, venue, or Expo overlay. List responses use database
count/limit/offset paging at five rows. Visual evidence passed at 1440px, 390px,
and 320px with no overflow, seven touch-sized date controls, a compact phone
map, bounded twelve-booth floors, and a separate Sunday live layout. Focused
integration and all 10 ordered browser scenarios passed. `npm run check` and
`npm run release` passed, including production build, HTTP smoke, scale,
security, trace privacy, and zero-vulnerability evidence. Production rollout
and TikTok account configuration remain outside this evidence.
