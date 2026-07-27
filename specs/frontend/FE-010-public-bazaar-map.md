---
id: FE-010
title: Public daily Bazaar mobile map
status: done
related: [FE-001, FE-011, FE-012, FE-015, BE-011, DEP-010, DEP-011]
owners: [product, frontend]
last_updated: 2026-07-26
change_level: L2
---

# FE-010 — Public daily Bazaar mobile map

## Problem and outcome

Visitors need an engaging public discovery surface that makes today's themed
Bazaar feel active while still sending every customer into the business's
permanent `/@handle` showroom. The first outcome is a mobile-first `/bazaar`
experience with a movable visual floor, booth previews, and an accessible list
fallback backed by server-owned Bazaar data.

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

- **Bazaar:** a SuqPage discovery surface for a themed daily group of businesses.
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
- Performance and limits: images are lazy-loaded and dimensioned; offscreen
  booths may be simplified; no large animation/WebGL dependency is allowed.
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

## Completion evidence

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
