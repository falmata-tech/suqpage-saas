---
id: FE-009
title: Creative showroom bank and focused v4 studio
status: in_progress
related: [FE-004, FE-005, FE-006, FE-007, FE-014, BE-005, BE-006, BE-007, BE-008, BE-010, BE-013, DEP-004, DEP-005, DEP-006, DEP-007, DEP-009, DEP-011, ADR-0005, ADR-0007]
owners: [product, frontend, design]
last_updated: 2026-07-28
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
- Every token direction declares primary, secondary, on-secondary, alternate
  section, and strong-section roles. The secondary family must be intentionally
  distinct from the dominant family, and components distribute these semantic
  roles across the page instead of tinting every surface with one hue.
- New variants may expose only bounded `reveal_style` and
  `interaction_style` enums. Effects use transform/opacity/clip/mask where
  supported, have static fallbacks, never hide essential content, and stop under
  reduced motion. Continuous or scroll-jacking animation is prohibited.
- Mobile retains native vertical scrolling, 44px touch targets, readable text,
  stable layout, horizontally scrollable rails with affordance, and no hover-only
  information. Product detail and inquiry actions remain unchanged.
- Public compositions expose at most one category-browsing control surface.
  Header actions remain limited to the catalog destination and inquiry cart;
  hero media is not covered by product-link tiles. A standalone navigation
  section and catalog filters cannot be enabled together.
- Selected navigation and filter controls use an explicit high-contrast
  foreground that does not depend on the token pack's surface color.
- Catalog-owned category filters use a restrained tab/segment treatment with
  stable 44-pixel touch height, modest corners, bounded labels, and horizontal
  scrolling on narrow screens. They do not render as oversized bubbles, resize
  with the result count, or imply that selecting another catalog component
  changes the shared filter control.
- Decorative geometry cannot shape a copy container into an arch, doorway,
  half-circle, or oversized asymmetric capsule. Text-bearing cards and sections
  use restrained corners, allow content-driven height, and never clip or hide
  copy at 320px, 390px, or desktop widths.
- Every media-bearing hero or story section uses an explicit machine-readable
  `mediaIntegration` behavior (`ambient_overlay`, `edge_fade`, `split_bleed`,
  `editorial_overlap`, `product_stage`, or `hidden`) instead of a universal
  bordered image frame. The AI may choose a compatible behavior independently
  of the component name; retained design-v2 sections without the field receive
  a deterministic integrated default.
- Factual section imagery is borderless and visually connected to its semantic
  section through edge fades, surface overlays, overlap, or cutout staging.
  Copy remains readable without burning gradients into the source asset.
  Product media stays bounded by declared aspect ratios and grid tracks for
  catalog usability, but is flush with its card surface; filtering or a small
  product count cannot stretch cards or images to fill arbitrary page width.
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

Scenario: AI proposes competing category navigation
  GIVEN a catalog section already exposes category filters
  WHEN a recipe also includes a standalone category-navigation section
  THEN composition fitness rejects the recipe
  AND the preview cannot present duplicate category controls

Scenario: Catalog owns category browsing
  GIVEN a valid composition enables catalog filters without standalone navigation
  WHEN categories render on desktop and at 320 or 390 CSS pixels
  THEN the shared control appears as restrained stable tabs rather than oversized pills
  AND long labels remain reachable without page overflow

Scenario: Token and long copy meet a shaped component
  GIVEN any admitted token system and bounded long component copy
  WHEN a selected control and text-bearing section render at supported widths
  THEN the selected state remains readable against its background
  AND restrained geometry does not clip, overflow, or disguise the copy

Scenario: A showroom receives a complete token direction
  GIVEN an admitted business-appropriate dominant color
  WHEN the token pack and responsive components render a full showroom
  THEN a distinct secondary family separates section roles and controls
  AND hero and product media retain bounded professional proportions

Scenario: AI selects integrated section media
  GIVEN an admitted hero or story image and a design-v2 section
  WHEN the AI selects a compatible mediaIntegration treatment
  THEN the renderer connects the image to the section surface without a bordered picture frame
  AND desktop and phone layouts preserve readable copy and stable image proportions

Scenario: A retained design omits media integration
  GIVEN a valid retained design-v2 section created before mediaIntegration existed
  WHEN the section renders through the current bank
  THEN a deterministic integrated treatment is derived from its slot and component
  AND the retained revision remains readable without schema rewriting

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
| First-class media integration parsing, defaults, and unsafe-value denial | contract/unit | `scripts/test-showroom-composition-v2.ts`, `scripts/test-showroom-recipe.ts` |
| 320/390 mobile, keyboard, reduced motion, exact preview | browser | `tests/acceptance/app.spec.ts` |
| Cross-industry visual quality | manual admission | authenticated synthetic design laboratory review |

## Rollout and rollback

DEP-009 enables bank 1.2 only for v4 private drafts after old-release parity and
mobile gates pass. Rollback disables v4 creation/focused controls and keeps bank
1.1 plus retained v1-v3 revisions readable.

For the current disposable seed dataset, the product owner approved a reset-only
development cutover. In that mode, reset-created showrooms and drafts may use
bank 1.2 by default after local gates pass. This does not authorize a
data-preserving production migration or future shortcut without first confirming
whether existing data must be retained.

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
complete release, all eight production-browser scenarios (including 390-pixel
overflow, touch targets, reduced motion, focused publication, and controlled
provider-video CSP), and the container privacy/build gate pass. Typed v4
rendering, local reset-default bank 1.2 writes, focused private-draft controls,
and controlled provider rendering are implemented. The AI brief now exports 18
machine-readable semantic foundation systems, eight page templates,
component-level compatibility and hero-media behavior, and deterministic
fitness. Ten-showroom desktop/mobile evidence passes with one category-control
owner, restrained copy geometry, immediate selected-state contrast, four
distinct hero integration modes, bounded product media, and no page overflow.
Full pairwise visual admission, operations restore evidence, remote checks, and
production rollout gates remain.

Catalog-owned category filters now render as compact touch-sized tabs with
bounded labels and narrow-screen horizontal scrolling instead of oversized
pill shapes. Desktop and 390-pixel Addis Metalworks captures verify the shared
control independently of catalog component choice.

The existing private recipe studio also has a controlled-video admission form
only when the separate provider-admission capability is enabled. It accepts no
iframe or arbitrary provider input; approved YouTube IDs render through the
privacy-enhanced nocookie iframe path with a narrow CSP frame allowlist.
