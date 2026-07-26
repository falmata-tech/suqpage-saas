---
id: FE-010
title: Public daily Bazaar mobile map
status: done
related: [FE-001, FE-011, FE-012, BE-011, DEP-010]
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
  - floor dimensions;
  - booths with ID, coordinates, dimensions, featured flag, handle, display
    fields, category/industry label, image URL or fallback token.
- The component must not query SQLite or infer eligibility in the browser.
- Controls expose accessible names: zoom in, zoom out, reset Bazaar view, open
  Bazaar List, close booth preview, and enter showroom.
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
| No-media booth fallback remains usable | integration/browser | `scripts/test-bazaar.ts`, `tests/acceptance/app.spec.ts` |
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
deterministic acceptance clock support.

Evidence:

- `npm run validate:specs`
- `npm run typecheck`
- `npm run test:bazaar`
- `npm run test:acceptance` passed 9/9, including the mobile Bazaar map/list
  scenario at 390px and 320px.
- `npm run check`

Known limitation: this slice uses seeded/default Bazaar configuration and data
fields for exclusion/featured placement. A dedicated dashboard UI for
administrator theme mapping, manual booth movement, and promotion scheduling is
a follow-up feature.
