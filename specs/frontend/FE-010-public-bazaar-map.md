---
id: FE-010
title: Public daily Expo geographic map
status: deprecated
related: [FE-001, FE-011, FE-012, FE-015, BE-011, BE-016, DEP-010, DEP-011, DEP-013, DEP-015]
owners: [product, frontend]
last_updated: 2026-08-01
change_level: L2
---

# FE-010 — Public daily Expo geographic map

Deprecated by FE-020. Retained as historical evidence for the date-driven Expo
experience; it is not current behavior after the City Showroom cutover.

## Problem and outcome

Visitors need an engaging public discovery surface that makes today's themed
Bazaar feel active while still sending every customer into the business's
permanent `/@handle` showroom. The first outcome is a mobile-first `/bazaar`
experience with a movable visual floor, booth previews, and an accessible list
fallback backed by server-owned Bazaar data.

## Accepted geographic Expo revision

This section supersedes the mall-floor presentation retained below as evidence
of the previous implementation.

- `/expo` is canonical and `/bazaar` redirects for bookmark compatibility.
- The primary visual is a lightweight SVG map of Ethiopia rendered from locally
  stored, attributed, simplified geographic assets. It shows the country
  border, restrained region and zone borders, useful city/town labels, and a
  small major-road reference layer. It uses no remote tiles, satellite imagery,
  decorative terrain, WebGL, or static Expo-floor image.
- Proven geographic projection and zoom utilities handle GeoJSON, drag, wheel,
  keyboard, and pinch input with bounded movement.
- Country view is a navigation layer. It shows every city-hosted Expo active
  today with participant counts; it never places individual booths at
  geographic coordinates. A labeled host-city selector provides direct
  navigation.
- Each Expo is hosted in a reviewed major city serving a zone or nearby
  catchment. Selecting a host keeps the geographic layer mounted, animates the
  map toward that city, and reveals one dynamic top-view Expo venue containing
  every assigned showroom in numbered halls and booths. Restrained surrounding
  boundaries, roads, and place context remain visible around the venue so the
  transition reads as a geographic zoom rather than a separate screen.
  **Center today's Expos** frames all active host cities. A familiar close
  control in the venue header removes the venue and reverses the map to the
  country extent; **View Ethiopia** remains a country-map reset rather than a
  venue-dismissal command.
- The venue is a virtual Expo anchored to its serving city. The presentation
  must not imply a physical building, parcel, street address, or exact real-world
  footprint. Only the selected host venue renders; other active Expos remain
  lightweight map markers when the country extent is restored.
- Venue geometry grows from participant count, admits at most 12 booths per
  hall, and provides restrained architectural wayfinding: entrance, reception,
  center aisle, hall label, and exits. It does not resemble a road map, graph
  paper, shopping-mall facade row, or static image.
- Booths use approved booth imagery as signage within the venue. A selected
  booth opens a bounded mobile sheet with reference, business, Industry, true
  origin city/zone/region, assigned host city, and showroom action.
- References use `H{hub-number}.{hall-number}-B{booth-number}` consistently in
  the map, selected-booth sheet, and Expo List.
- Map View and List View expose the same participant set. List View is complete
  and remains the low-motion/accessibility fallback.
- Public labels say Expo, Map View, List View, and city-hosted Expo.

```gherkin
Scenario: Visitor sees all active city-hosted Expos
  GIVEN today's occurrence has multiple city hosts
  WHEN a visitor opens /expo or activates View Ethiopia
  THEN the whole Ethiopia boundary and every active hub are visible
  AND zone borders, useful towns, and restrained major roads provide orientation
  AND the visitor can choose a host city from the labeled selector

Scenario: Visitor explores one city Expo on mobile
  GIVEN a 320 or 390 CSS-pixel viewport
  WHEN the visitor selects a host city
  THEN the map remains mounted and focused on the selected host city
  AND a responsive venue plan contains every assigned showroom
  AND restrained geographic context remains visible around the venue
  AND booth selection opens a bounded sheet without horizontal page overflow
  AND the visitor can return to all active Expos with one control

Scenario: Visitor returns from a city Expo to the country overview
  GIVEN one host-city venue is open over its geographic context
  WHEN the visitor activates the venue close control
  THEN the selected venue is removed
  AND the same map reverses to the complete Ethiopia extent
  AND every active host marker is available again
```

## Scope

### In scope

- Public `/bazaar` route showing the server-determined active Bazaar.
- Mobile-first Bazaar floor that can be panned, zoomed with controls, reset, and
  explored without WebGL, 3D engines, or game engines.
- A code-rendered floor whose width, storefront rows, corridors, and height grow
  deterministically with the number of participating businesses.
- Automatic storefronts form a centered, near-square grid: complete square
  counts use equal rows and columns, incomplete final rows remain centered, and
  the visual floor fits itself to the available viewport before the visitor
  pans or zooms.
- Grounded storefront facades aligned to corridor edges; booth cards must not
  float over a static marketplace photograph.
- The current presentation is a restrained contemporary mall directory: a
  lightly tiled neutral floor, thin perimeter, simple row corridors, and no
  lounge or decorative furniture. Surface treatment must not compete with
  storefront names, controls, or wayfinding.
- Every visual-floor booth has a stable occurrence reference in `R{row}-{number}`
  form, ordered left-to-right within its computed row. The same reference is
  visible on the storefront, preview, directory, and List View.
- A maximum of 48 storefronts on the interactive floor, with every additional
  eligible participant retained in Bazaar List.
- Booth tiles derived from active public showrooms and stable server positions.
- Booth preview overlay or bottom sheet with business name, handle, industry,
  hero image or fallback treatment, short description, and **Enter showroom**.
- Bazaar List view containing every active booth in today's Bazaar.
- Keyboard-operable booth selection and map controls.
- Empty, rollover-failure, weak-device, no-media, and reduced-motion states.
- Homepage may link to the Bazaar, but the map route is the first MVP surface.

### Non-goals

- Checkout, payments, orders, auctions, sponsorship bidding, or marketplace cart.
- Separate booth detail pages or duplicated showroom content.
- Complex floor archives, live chat, live video, or real-time presence.
- A full public homepage redesign before the Bazaar route is usable.
- Requiring customers to use the visual map when the list is more accessible.

## Domain language and invariants

- **Bazaar:** a MirtPage discovery surface for a themed daily group of businesses.
- **Bazaar floor:** the visual map for one active occurrence.
- **Booth:** a positioned preview entry that links to one permanent showroom.
- **Bazaar List:** the semantic directory equivalent of the map for the same
  occurrence.
- A booth preview is never a second showroom. It must link to `/@handle`.
- The active Bazaar is determined by the server, not the visitor device clock.
- Public copy must make ordinary Bazaar participation feel included with a
  showroom account; featured placement is a separate visibility boost.

## Contracts

- `/bazaar` renders initial active Bazaar data server-side.
- The map client component receives a bounded view model:
  - occurrence ID, theme name, live/empty/error status, timezone note;
  - floor dimensions, row/column counts, total participant count, visible
    floor count, and floor cap;
  - booths with ID, coordinates, dimensions, featured flag, handle, display
    fields, category/industry label, storefront image URL or fallback token,
    floor row, and whether the booth belongs on the floor.
- The component must not query SQLite or infer eligibility in the browser.
- Controls expose accessible names: zoom in, zoom out, reset Bazaar view, open
  Bazaar List, close booth preview, and enter showroom.
- Public mode labels are **Map View** and **List View**.
- Selected view may persist for the browser session, but server data remains
  authoritative after refresh.

## Scenarios

```gherkin
Scenario: Visitor explores today's Bazaar on mobile
  GIVEN the server has an active Bazaar occurrence with eligible booths
  WHEN a visitor opens /bazaar on a 390-pixel-wide device
  THEN the page shows today's Bazaar name and live status
  AND the visitor can pan the floor, zoom with controls, select a booth, and
  open the permanent showroom from the preview
  AND the page has no horizontal document overflow

Scenario: Visitor uses the accessible Bazaar List
  GIVEN today's Bazaar has eligible booths
  WHEN a visitor opens the Bazaar List view
  THEN every active booth appears as a semantic link or card
  AND featured booths are clearly labeled without hiding ordinary participants

Scenario: Bazaar map has no usable media
  GIVEN an eligible showroom has no approved booth or hero image
  WHEN its booth is rendered
  THEN the booth uses an intentional fallback treatment
  AND the visitor can still identify the business and enter its showroom

Scenario: Map interaction is not usable
  GIVEN the visual floor cannot initialize or the visitor prefers simpler navigation
  WHEN the visitor switches to list mode
  THEN all current Bazaar participants remain discoverable
  AND showroom links remain available

Scenario: Participation changes the floor without unbounded rendering
  GIVEN today's Bazaar has a varying number of eligible businesses
  WHEN the server builds the current floor
  THEN floor dimensions and corridor rows grow deterministically with the
  visible booth count
  AND each visible storefront is attached to a corridor edge
  AND no more than 48 storefronts render on the floor
  AND Bazaar List still contains every eligible participant

Scenario: Automatic layout remains compact across participant counts
  GIVEN today's visual floor has four, five, nine, or sixteen storefronts
  WHEN automatic geometry is generated
  THEN square counts use 2x2, 3x3, or 4x4 arrangements
  AND incomplete final rows are horizontally centered
  AND the browser initially fits the balanced floor to its available width

Scenario: A visitor refers to a booth consistently
  GIVEN an active storefront appears in row 2 as the first storefront from the left
  WHEN the visitor checks Map View, the directory, the preview, or List View
  THEN the booth reference is `R2-01` in every surface
  AND references remain unique within the occurrence
```

## Quality impact

- Security and tenant isolation: public data comes from active showrooms only;
  draft and suspended businesses are excluded.
- Privacy and data retention: no private request text, customer contact data,
  internal notes, or raw media-storage keys appear in public map data.
- Accessibility and responsive behavior: map controls are keyboard operable;
  list fallback is complete; 320px and 390px layouts must avoid overflow.
- Localization and merchant-entered values: long business names, handles, and
  category names wrap without obscuring controls.
- Performance and limits: images are lazy-loaded and dimensioned; only one
  selected venue renders over the persistent map; no large animation/WebGL
  dependency is allowed.
- Failure recovery and idempotency: failed map rendering falls back to list;
  refresh after rollover shows server-current data.

## Observability

Track safe aggregate signals for Bazaar view load, list-view use, booth
selection, enter-showroom clicks, empty occurrence, and map initialization
fallback. Do not log customer contact values, private request details, or full
raw media paths.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Mobile map pan/zoom/select at 390px and 320px without overflow | acceptance | `tests/acceptance/app.spec.ts` Bazaar scenario |
| Country map has local zones, roads, towns, and no geographic booth scatter | focused/browser | `scripts/test-expo.ts`, `scripts/capture-expo-visuals.mjs` |
| Host selection preserves the map, focuses the city, and opens one complete dynamic venue | focused/browser | `scripts/capture-expo-visuals.mjs`, `tests/acceptance/app.spec.ts` |
| Venue close removes the venue and reverses the persistent map to all active hosts | acceptance | `tests/acceptance/app.spec.ts` |
| Bazaar List contains all active booths and keyboard links | acceptance | `tests/acceptance/app.spec.ts` Bazaar scenario |
| No-media grounded storefront fallback remains usable | integration/browser | `scripts/test-bazaar.ts`, `tests/acceptance/app.spec.ts` |
| Dynamic dimensions, grounded corridor rows, and 48-booth floor cap | integration/browser | `scripts/test-bazaar.ts`, `tests/acceptance/app.spec.ts` |
| Balanced square counts, centered incomplete rows, and responsive initial fit | integration/browser | `scripts/test-bazaar.ts`, `tests/acceptance/app.spec.ts` |
| Stable row/booth references across map, preview, directory, and list | integration/browser | `scripts/test-bazaar.ts`, `tests/acceptance/app.spec.ts` |
| Draft/suspended businesses excluded | integration/security | `scripts/test-bazaar.ts`, `scripts/test-security.ts` |

## Rollout and rollback

Ship behind the public `/bazaar` route first. The homepage should link to it only
after the route passes mobile and accessibility evidence. Rollback removes the
route link and deploys the previous app version; persisted Bazaar tables remain
additive and inert unless used by the deployed code.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Prior floor evidence (superseded)

Implemented on 2026-07-26 with `/bazaar`, the homepage live Bazaar section,
weekly schedule, hero Bazaar callout, `components/BazaarMap.tsx`, mobile map
controls, booth preview, Bazaar List fallback, homepage Bazaar navigation, and
deterministic acceptance clock support. The floor now grows from server-owned
participant data as grounded storefront rows and corridors, displays at most 48
storefronts, and keeps every participant available in Bazaar List.

The automatic floor was refined the same day to use near-square column counts,
center incomplete final rows, and fit its initial scale to the measured viewport.
Its current visual treatment is a restrained mall directory with neutral CSS
tiles, thin edges, simple row corridors, no lounge/furniture props, and derived
`R{row}-{number}` references. Previews open only after selection so they cannot
obstruct mobile booths.

Evidence:

- `npm run validate:specs`
- `npm run typecheck`
- `npm run test:bazaar` passed dynamic small-count and seven-row geometry, corridor
  grounding, centered 2x2 and 3+2 layouts, manual-placement persistence, and a
  55-participant case with a 7x7 visual footprint, 48 storefronts on the floor,
  and seven list-only participants.
- `npm run test:acceptance` passed 9/9, including the mobile Bazaar map/list
  scenario at 390px and 320px and browser geometry proving each storefront
  meets its corridor. Browser evidence also proves Map View/List View labels and
  reference consistency from storefront to preview and list.
- `npm run check`

Known limitation: the public visual floor is intentionally capped at 48
storefronts for bounded browser work. Additional participating businesses remain
fully available in Bazaar List rather than receiving a floor storefront.

## Completion evidence

The canonical `/expo` experience and `/bazaar` compatibility redirect were
implemented and verified on 2026-07-29. The public map uses locally attributed
Admin-1/Admin-2 boundaries, selected OSM place labels and major-road corridors,
D3 projection/zoom, all-host framing, a labeled host selector, and complete
Map/List parity. Selecting a host keeps that map mounted, focuses the serving
city, and reveals its complete dynamic top-view venue and image-backed numbered
booths within the same stage. Restrained geographic context remains visible
around the virtual venue, and its close control reverses the same map to the
country extent.

Evidence: `npm run test:expo-visual` passed at 1440px, 390px, and 320px with 14
regions, 101 zones, local road/place context, active host cities, and no browser
errors, broken images, text/page overflow, or undersized mobile controls.
The visual probe additionally requires the map and venue to share one stage,
visible city context, and nonzero map opacity. Incomplete venue rows balance
around the central aisle and venue depth grows with its hall population.
`npm run test:acceptance` passed 10/10, including persistent-map host selection,
venue close and country return, booth origin/reference, list parity, mobile
overflow, and redirect behavior. Repository-wide gate evidence is recorded in
`specs/TRACEABILITY.md`.
