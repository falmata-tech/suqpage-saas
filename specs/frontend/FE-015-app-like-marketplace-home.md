---
id: FE-015
title: App-like marketplace home and Expo
status: deprecated
related: [FE-010, FE-012, FE-013, BE-011, BE-013, BE-016, DEP-010, DEP-011, DEP-013]
owners: [product, frontend, design]
last_updated: 2026-08-01
change_level: L2
---

# FE-015 - App-like marketplace home and Expo

Deprecated by FE-020. Its useful mobile map behavior is retained under the new
industry-selected permanent discovery contract.

## Problem and outcome

The current homepage repeats the same businesses across directory, Bazaar, and
featured sections. On mobile it becomes a long stack of rails followed by a
small map. Visitors need one coherent marketplace discovery experience and a
dynamic Bazaar that feels like a restrained contemporary mall rather than graph
paper.

## Accepted geographic Expo revision

- The mobile app surface uses a local Ethiopia vector map, active city-hosted
  Expos, a direct host selector, Map/List modes, dynamic venue plans, and a
  bounded booth sheet.
- Country view and **View Ethiopia** show all active hosts. **Center today's
  Expos** frames the active host-city set. Selecting a host focuses the
  persistent geographic map and reveals its virtual Expo venue within the same
  stage rather than scattering assigned booths or opening a separate screen.
- Mobile controls remain reachable without trapping ordinary vertical page
  scrolling; pinch and button zoom are bounded and reduced motion is honored.
- The homepage contains one showroom discovery feed. Featured status influences
  ordering and visual emphasis without creating another repeated rail.
- Stable section dimensions prevent map controls, long region names, selected
  booth content, or sparse search results from shifting the page unexpectedly.

## Scope

### In scope

- A code-rendered design mockup reviewed at desktop, 390px, and 320px before the
  production homepage composition is replaced.
- A showroom-first photographic hero with compact platform benefits.
- One persistent discovery surface for search, Industry filtering, featured
  state, and five-result pagination.
- Today's Bazaar as the principal live module with Map/List modes.
- A compact weekly calendar integrated directly above the primary Expo map.
- A dynamic mall floor with restrained offset tiles, clear corridors and
  entrances, grounded storefronts, booth references, and bounded participant
  capacity.
- Mobile app behavior: compact sticky platform header, stable discovery state,
  useful map viewport, selected-booth sheet, safe-area spacing, and familiar
  primary navigation.
- A distinct final merchant action and complete public footer.

### Non-goals

- Checkout, paid placement, static tenant geometry, category filters, duplicate
  featured inventory sections, a process/How-it-works section, or changes to
  Bazaar eligibility and scheduling authority.

## Contracts

- The permanent showroom remains the primary product and every business result,
  booth, or selected-booth action links to its authoritative `/@handle`.
- Discovery uses one Industry vocabulary. Featured is a presentation attribute,
  not a second catalog.
- At most five results render per page. Search or Industry changes reset the
  result page without stretching sparse cards.
- The server owns active showroom, Bazaar occurrence, and participant data.
  Client state may filter, paginate, select, pan, zoom, or change display mode.
- Floor geometry remains derived from participant count, uses balanced rows,
  preserves the configured cap, and never depends on a static mall image.
- Mall decoration remains low contrast and cannot obscure tenant imagery,
  booth references, controls, or corridor boundaries.
- Mobile Map mode reserves a stable useful viewport and presents the selected
  business in a bounded bottom sheet rather than shrinking the map for a desktop
  directory rail.
- The document has no horizontal overflow at 320, 390, or desktop widths.
- Automatic featured emphasis pauses for reduced motion, focus, hidden
  documents, and deliberate pointer interaction.

## Scenarios

```gherkin
Scenario: Visitor discovers one marketplace rather than repeated inventories
  GIVEN active public showrooms and a current Bazaar
  WHEN a visitor opens the homepage
  THEN one discovery feed exposes search, Industry, featured emphasis, and pagination
  AND today's Bazaar appears as the primary live experience
  AND no second featured-business catalog repeats the same businesses

Scenario: Visitor opens an Expo booth on mobile
  GIVEN a city Expo with multiple dynamic venue rows at a 390-pixel viewport
  WHEN the visitor selects the host and then a visible booth
  THEN the map remains usable
  AND a compact selected-booth sheet exposes its reference, business, Industry, and showroom action

Scenario: Participant count changes
  GIVEN a Bazaar with a different number of participating businesses
  WHEN the public map renders
  THEN balanced storefront rows and corridors are recalculated
  AND no booth hangs outside the floor or overlaps another booth
```

## Quality impact

- Accessibility: semantic landmarks, labeled Map/List controls, keyboard booth
  selection, visible focus, and reduced motion.
- Performance: CSS floor treatment, bounded DOM booth count, optimized tenant
  media, and no new animation or 3D dependency.
- Localization: long names, handles, industries, and booth references fit stable
  controls and cards.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Unified discovery and pagination | focused/browser | `scripts/test-marketplace-home.ts`, `tests/acceptance/app.spec.ts` |
| Balanced dynamic map and references | focused/browser | `scripts/test-bazaar.ts`, `tests/acceptance/app.spec.ts` |
| Mobile selected-booth sheet and no overflow | browser | `tests/acceptance/app.spec.ts` |
| Mockup and visual hierarchy | manual/browser | Playwright 1440/390/320 screenshots |

## Rollout and rollback

Replace only the platform homepage and Bazaar presentation after synthetic
browser evidence. Rollback restores the prior FE-012 composition; server-owned
showrooms and Bazaar records remain unchanged.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Existing authority and eligibility preserved
- [x] Desktop/mobile behavior explicit
- [x] Tests and rollback planned

## Prior floor evidence (superseded)

Evidence: implemented and verified on 2026-07-27.

- One paginated Industry discovery feed, a primary dynamic Map/List Bazaar,
  compact weekly schedule, app-like mobile navigation, and a distinct closing
  merchant action are implemented.
- Playwright screenshots were reviewed at 1440, 390, and 320 CSS pixels. The
  settled 320px probe measured a 278px floor inside a 298px map viewport with no
  document overflow.
- Marketplace, Bazaar, full-check, and 10/10 production-browser acceptance
  evidence passed.

## Completion evidence

The geographic Expo and revised mobile public app were implemented and verified
on 2026-07-29. Mobile provides persistent Home/Expo/Showrooms/Join navigation,
normal document scrolling, bounded map interaction, country/hub framing,
Map/List modes, a booth sheet above safe-area navigation, and one horizontally
scrollable showroom result rail. Country view exposes zone boundaries, major
road context, towns/cities, and city hosts; selecting a host opens a complete
dynamic Expo venue inside the same mounted map stage. Restrained geographic
context stays visible around that virtual venue, its balanced rows grow with
the participating showrooms, and an in-venue close control returns to the
country extent. The compact weekly Industry calendar sits immediately above
the map inside that one Expo workspace.

`npm run test:expo-visual` passed desktop, 390px, and 320px probes with no
overflow or undersized controls and proves the shared map stage, visible city
context, nonzero map opacity, and calendar placement. `npm run test:acceptance`
passed 10/10; `npm run check` and `npm run release` passed.
