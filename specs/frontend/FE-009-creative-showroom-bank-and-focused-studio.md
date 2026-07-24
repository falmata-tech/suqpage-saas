---
id: FE-009
title: Creative showroom bank and focused v4 studio
status: in_progress
related: [FE-004, FE-005, FE-006, FE-007, BE-005, BE-006, BE-007, BE-008, BE-010, DEP-004, DEP-005, DEP-006, DEP-007, DEP-009, ADR-0005, ADR-0007]
owners: [product, frontend, design]
last_updated: 2026-07-24
change_level: L3
---

# FE-009 — Creative showroom bank and focused v4 studio

## Problem and outcome

The current bank provides broad combinations but its sections mostly consume
one business story shape. Staff also must re-import JSON for small corrections.
SuqPage needs richer, industry-flexible art direction and a focused correction
surface without turning showrooms into arbitrary themes or exposing code.
Research-derived patterns and exclusions are recorded in
`docs/SHOWROOM-DESIGN-RESEARCH.md`.

## Scope

### In scope

- Visual rendering for typed hero, story/editorial, highlight, information/trust,
  CTA, and controlled-video blocks from FE-007/BE-008.
- Focused private-draft controls to replace a compatible section, change token
  pack, bounded motion/decorative properties, edit typed copy, and assign an
  admitted compatible asset.
- `showroom-bank@1.2.0` with at least 66 reviewed components across all eight
  slots and at least 18 token systems.
- New art directions for textiles/fashion, beauty/wellness, technology,
  furniture/interiors, ingredients/food, artisan, producer, industrial, and
  wholesale showrooms.
- Mobile-first component laboratory review at 320 and 390 CSS pixels, long-copy
  and no-media states, keyboard/touch behavior, and reduced motion.

### Non-goals

- Checkout, pricing, stock, arbitrary code/CSS/HTML, tenant-installed components,
  unreviewed animation libraries, autoplay, parallax, cursor followers, or
  changing inquiry/publication authority.
- Copying another brand's trade dress, layout, imagery, text, or source code.

## Contracts

- Add at least 24 materially distinct variants over bank 1.1, targeting: two
  headers, five heroes, two navigation sections, four content sections, four
  catalogs, three trust sections, two CTAs, and two footers.
- Planned creative families include floating/technical headers; beauty-orbit,
  textile-swatch, technology-cinematic, room-scene, and ingredient-monograph
  heroes; visual chapter/material navigation; lookbook, exploded-feature,
  ritual, and swatch stories; beauty-swatch, technology-spec, textile-stack,
  and room-set catalogs; material-passport, ingredient-ledger, and specification
  trust panels; and magazine/technical closings.
- Add five scoped token directions: silk atelier, cosmetic laboratory, chrome
  future, paper gallery, and mineral spa. Tokens preserve contrast and never
  encode tenant facts.
- New variants may expose only bounded `reveal_style` and
  `interaction_style` enums. Effects use transform/opacity/clip/mask where
  supported, have static fallbacks, never hide essential content, and stop under
  reduced motion. Continuous or scroll-jacking animation is prohibited.
- Mobile retains native vertical scrolling, 44px touch targets, readable text,
  stable layout, horizontally scrollable rails with affordance, and no hover-only
  information. Product detail and inquiry actions remain unchanged.
- Focused controls show only server-computed compatible choices. Saving a
  correction updates only a private draft, produces a visible change summary,
  and never submits or publishes.
- The recorded administrator studio deep-link 404 must be reproduced and fixed
  with browser regression evidence before this route receives focused controls.

## Scenarios

```gherkin
Scenario: AI composes a textile showroom
  GIVEN typed swatch/story content and admitted textile images
  WHEN a valid bank-1.2 recipe selects compatible textile variants
  THEN the private preview uses tactile editorial pacing and functional catalog actions
  AND the phone layout remains readable without hover or horizontal page overflow

Scenario: Staff makes a focused correction
  GIVEN a valid mutable v4 private draft
  WHEN assigned staff replace one hero with a compatible reviewed variant
  THEN the server revalidates the complete recipe and shows the exact preview
  AND the action does not approve, publish, or expose unrestricted values

Scenario: Visitor requests reduced motion
  GIVEN an expressive bank-1.2 showroom
  WHEN the browser reports prefers-reduced-motion
  THEN non-essential reveals and interactions become static
  AND all content and actions remain available

Scenario: Incompatible creative choice is submitted directly
  GIVEN a typed block and component with incompatible contracts
  WHEN a caller bypasses the UI and submits the command
  THEN the server rejects it without changing the draft
```

## Quality impact

- Accessibility: semantic regions/headings, keyboard access, contrast, focus,
  reduced motion, captions/titles, no hover-only content.
- Performance: no new runtime animation dependency; bounded CSS; image sizes and
  layout stability are measured in browser fixtures.

## Observability

Report safe release/component/block/command categories, counts, mobile gate,
reduced-motion gate, and outcome. Never log tenant copy, private asset keys,
provider input, or screenshots containing client data.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Bank coverage, registry parity, real variant contracts | contract/static | `scripts/test-showroom-bank.ts` |
| Typed rendering and focused commands | integration/security | `scripts/test-showroom-recipe.ts`, planned focused-command test |
| 320/390 mobile, keyboard, reduced motion, exact preview | browser | `tests/acceptance/app.spec.ts` |
| Cross-industry visual quality | manual admission | authenticated synthetic design laboratory review |

## Rollout and rollback

DEP-009 enables bank 1.2 only for v4 private drafts after old-release parity and
mobile gates pass. Rollback disables v4 creation/focused controls and keeps bank
1.1 plus retained v1-v3 revisions readable.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related layers and ADR linked
- [x] Creative target and bounded effects explicit
- [x] Mobile/accessibility/performance rules explicit
- [x] Positive and negative scenarios present
- [x] Rollout and rollback decided

## Completion evidence

Checkpoint: the permissioned synthetic laboratory now exposes a non-default
bank-1.2 candidate with 67 static registry-backed components, 18 scoped token
systems, 98,280 required-slot combinations, and bounded reveal/interaction
properties. New variants cover every planned industry direction plus a
controlled-film placeholder contract. Static bank/experience checks, the
complete release, all seven production-browser scenarios (including 390-pixel
overflow, touch targets, and reduced motion), and the container privacy/build
gate pass. Typed v4 rendering, focused controls, controlled provider rendering,
320-pixel/pairwise visual admission, operations restore, and remote rollout
gates remain; the candidate is intentionally absent from the runtime resolver.
