---
id: FE-020
title: Permanent industry and City Suq discovery
status: done
related: [FE-001, FE-013, FE-017, BE-019, DEP-016]
owners: [product, frontend, design]
last_updated: 2026-08-01
change_level: L2
---

# FE-020 - Permanent industry and City Suq discovery

## Problem and outcome

Visitors need a permanent way to discover Ethiopia's small manufacturers,
workshops, growers, processors, artisans, and home-based brands. A date-driven
Expo suggests temporary participation and hides businesses on the wrong day.
The outcome is one mobile-first discovery workspace where a visitor chooses an
industry, searches the same result set, explores matching City Suqs on the
Ethiopia map, and enters each business's permanent Suq.

## Scope

### In scope

- A compact purple industry picker with clear icons and touch-sized controls.
- One unified search, featured treatment, Map View, and List View result set.
- A persistent local Ethiopia map with matching City Suq markers and counts.
- Direct city buttons and a country reset; selecting a city keeps the map
  mounted and reveals its virtual City Suq over restrained geographic context.
- A simple top-view City Suq with a circular central lobby/planter, clear ring
  or radial corridors, numbered booths, and at most twelve visible booths per
  hall.
- Hall controls for larger City Suqs, complete list parity, and permanent
  `/@handle` links labeled **Visit Suq**.
- Homepage copy distilled from the approved pitch for small product businesses
  and their customers.
- An application-first homepage where a compact merchant invitation leads
  directly into the working discovery controls; long product education belongs
  on `/about`, `/request`, and the restrained closing area rather than above the
  marketplace.
- A compact featured-Suq rail and touch-friendly City Suq buttons derived from
  the same active industry/search projection as Map View and List View.
- A bounded City Suq overlay that leaves recognizable Ethiopia map context
  visible and uses a calm landscaped center with seating, planting, and a small
  water feature but no people or decorative clutter.
- Canonical `/discover`; legacy `/expo` and `/bazaar` redirect without retaining
  Expo terminology in public UI.

### Non-goals

- Scheduled events, live status, weekday calendars, video-conference hosting,
  checkout, paid placement, fake physical addresses, or separate booth pages.
- Large enterprise, industrial-park, export-corporation, or generic input-
  supplier positioning.
- A second showroom directory or separate featured-business catalog.

## Domain language and contracts

- **Suq:** one business's permanent `/@handle` public page.
- **City Suq:** a virtual discovery venue for one selected industry and serving
  city; it is not a physical mall or exact parcel.
- **Industry picker:** the only top-level business-type filter. It is not a
  calendar and does not change from the visitor's clock.
- Public copy may explain a Suq as a professional digital showroom, but actions
  say **Find a Suq**, **Visit Suq**, and **Get your SuqPage**.
- Industry, search, city, hall, and view state have labeled controls. Industry
  and search state are URL-addressable and server-authoritative.
- Featured status affects ordering and a compact badge only. Every matching
  eligible business remains discoverable. A featured rail may repeat the small
  featured subset as a shortcut, but it must use the same current projection
  and never become a separate directory or authority.
- The country map renders hub summaries, not business points. Booths appear
  only inside the selected City Suq.
- Only one hall with at most twelve booths renders at once. List View exposes
  all matching businesses without requiring map interaction.
- At 320 and 390 CSS pixels controls are at least 44px, horizontal picker
  overflow is intentional and contained, sheets are bounded, and the document
  has no horizontal overflow.

## Scenarios

```gherkin
Scenario: Visitor changes industry
  GIVEN the discovery workspace is showing one industry
  WHEN the visitor activates another icon-labeled industry button
  THEN the selected state, City Suq counts, featured emphasis, map, and list all
    represent that industry
  AND no date, weekday, live, or Expo state is shown

Scenario: Visitor arrives on the homepage
  GIVEN a visitor opens the public homepage
  WHEN the first viewport renders
  THEN the active industry controls and marketplace map are the primary content
  AND any merchant invitation above them is compact
  AND long about or signup explanation does not delay discovery

Scenario: Visitor uses marketplace shortcuts
  GIVEN the active result set contains featured businesses and multiple hosts
  WHEN the visitor uses a featured card or City Suq button
  THEN the shortcut represents the same industry and search projection
  AND it opens the permanent Suq or selected City Suq without duplicate filters

Scenario: Visitor searches one result set
  GIVEN an active industry and matching businesses
  WHEN the visitor searches by business, product, capability, or location
  THEN Map View and List View use the same filtered set
  AND no separate directory repeats those businesses below the map

Scenario: Visitor opens a City Suq on a phone
  GIVEN a serving city contains more than twelve matching businesses
  WHEN the visitor opens the city and changes halls
  THEN the geographic map remains mounted behind the virtual venue
  AND each hall shows at most twelve usable numbered booths around a clear center
  AND the center contains restrained architectural landscaping without people
  AND recognizable map context remains visible around or below the venue
  AND every matching business remains available through hall controls and List View

Scenario: Map assets fail
  GIVEN local geographic assets cannot load
  WHEN the visitor uses the workspace
  THEN a clear fallback opens List View
  AND every matching permanent Suq remains reachable
```

## Quality impact

- Security/privacy: public projections include active entitled businesses and
  approved discovery media only; no private contacts, request text, or storage
  keys are exposed.
- Accessibility: semantic tabs, labeled search, icon text, keyboard map hubs,
  visible focus, reduced motion, and complete list fallback.
- Performance: one selected-industry payload, one rendered hall, dimensioned
  lazy images, local SVG geography, no WebGL, remote tiles, or static mall image.
- Localization: long industry, city, region, and business names wrap without
  changing control dimensions or covering the map.

## Test plan

| Criterion | Level | Evidence |
|---|---|---|
| Industry/search/map/list parity | integration/browser | `scripts/test-discovery.ts`, `tests/acceptance/app.spec.ts` |
| Nearest City Suq, hall paging, stable references | integration | `scripts/test-discovery.ts` |
| Desktop, 390px, and 320px visual/touch/overflow | visual/browser | `scripts/capture-discovery-visuals.mjs`, `tests/acceptance/app.spec.ts` |
| First-viewport discovery, featured rail, city buttons, map context, and landscaped venue | visual/browser | `scripts/capture-discovery-visuals.mjs`, `tests/acceptance/app.spec.ts` |
| No public Expo/date language | integration/browser | `scripts/test-discovery.ts`, `tests/acceptance/app.spec.ts` |
| Legacy redirects and map failure fallback | HTTP/browser | `scripts/http-smoke.mjs`, `tests/acceptance/app.spec.ts` |

## Evidence

Evidence: implemented and verified on 2026-08-01:

- The homepage and `/discover` render one permanent industry/search/map/list
  workspace; `/expo` and `/bazaar` redirect to `/discover`.
- `scripts/capture-discovery-visuals.mjs` passed five desktop, 390px, and 320px
  probes with exact document widths, 58/61px industry controls, 44/46px city
  controls, and no browser errors or horizontal overflow. The map begins at
  701px in a 1000px desktop viewport and 738px in an 844px phone viewport.
- Desktop and phone City Suqs rendered five balanced booths, four planters, two
  benches, and one water feature. Their 700x510px and 362x422px venues remain
  bounded inside 612px map stages with visible geographic context.
- `tests/acceptance/app.spec.ts` passed 10/10 production-browser scenarios,
  including first-viewport discovery, featured and city shortcuts, City Suq
  opening/closing, stable references, List View parity, legacy redirects, and
  injected map-asset failure recovery.
- `npm run check` and `npm run release` passed.

## Rollout and rollback

Ship homepage and `/discover` together after fixture reset and browser evidence.
Legacy routes redirect to `/discover`. Rollback deploys the prior app and keeps
the additive discovery tables; no real customer data conversion is included.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided
