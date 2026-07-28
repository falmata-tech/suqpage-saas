---
id: BE-013
title: Showroom blueprint media plan and composition fitness
status: done
related: [FE-007, FE-009, FE-014, FE-015, BE-008, BE-010, BE-011, DEP-009, DEP-010, DEP-011, ADR-0005, ADR-0007]
owners: [product, backend, security]
last_updated: 2026-07-28
change_level: L3
---

# BE-013 - Showroom blueprint media plan and composition fitness

## Problem and outcome

The current recipe contract accepts only already-admitted media and the bank
describes mostly generic optional image slots. The application needs a bounded
blueprint state that can describe unresolved media work and evaluate whether a
composition fits its business, catalog, content, and mobile constraints before
client review.

## Scope and invariants

- Stable planned-media references for section and product image destinations.
- Strict media-plan entries containing purpose, owner key, required state,
  accepted kind, bounded count, aspect guidance, descriptive prompt, and
  illustrative/factual classification.
- Bank metadata for visual anatomy, media policy, no-media fallbacks,
  recommended catalog counts, commerce modes, content needs, visual tones,
  long-title/RTL support, responsive behavior, ideal/avoid conditions, and
  fallback component.
- A static reviewed showroom-template registry that selects page sequence before
  individual component variants.
- A deterministic composition-fitness report with hard failures and warnings.
- Separate `blueprint_valid`, `preview_ready`, and `review_ready` results.

## Contracts

- Planned references are accepted only in editable private v4 blueprint
  validation. Submitted/publication parsers reject every unresolved required
  planned reference.
- Planned references contain no tenant storage path, external URL, database ID,
  provider input, or executable value.
- Recipe briefs enumerate exact currently valid portable destinations. Product
  destinations use `ownerType: product`, the exported opaque product key, and
  `slotKey: product_image`; import normalizes the media-plan owner key together
  with the corresponding content relationship key.
- Slot fulfillment authorizes the actor/request, admits the image through the
  existing media port, validates kind and dimensions, and replaces the exact
  reference atomically.
- Hard fitness failures include incompatible content/component binding, missing
  required media at review time, unsupported media kind, duplicate category
  navigation, a standalone category navigator combined with catalog filters,
  more than two signature sections, and incompatible catalog count.
- Warnings include unnecessary search/filter controls, repeated factual image
  use, consecutive identical surface/geometry, repeated business description,
  long-copy risk, and weak optional-media coverage.
- Templates encode reviewed slot order, content needs, catalog shape, commerce
  modes, media condition, visual tone, preferred component families, and
  fallback behavior. They contain no tenant facts, industry/archetype
  recommendations, or arbitrary markup.
- Every component receives an explicitly assigned selection profile. Profiles
  are never inferred from industry words in component IDs or names. Legacy IDs
  remain stable for compatibility but are not machine-readable suitability
  evidence.
- Design systems describe objective palette, type, shape, density, rhythm, and
  media behavior. Their guidance contains visual tones only and no industry or
  business-archetype metadata.
- Fitness scoring is deterministic and advisory except for explicit hard
  failures. The AI cannot waive security, media, provenance, or publication
  requirements.

## Scenarios

```gherkin
Scenario: Valid blueprint contains planned media
  GIVEN a private v4 recipe with bounded unresolved image destinations
  WHEN the recipe is parsed in blueprint mode
  THEN the content, design, media plan, and fitness report are returned
  AND no planned reference is treated as an admitted tenant asset

Scenario: Required media remains unresolved at review
  GIVEN a valid private blueprint with a required planned hero image
  WHEN staff request client submission
  THEN review readiness fails at the exact slot path
  AND the current public showroom remains unchanged

Scenario: AI chooses an oversized catalog component
  GIVEN a sparse three-product manufacturer catalog
  WHEN the recipe selects a component whose reviewed range starts at eight products
  THEN composition fitness reports an incompatible catalog-count failure
  AND identifies the reviewed fallback component

Scenario: AI duplicates category browsing
  GIVEN a composition with a standalone category-navigation section
  WHEN its catalog section also enables category filters
  THEN composition fitness reports a duplicate-navigation hard failure
  AND the recipe must choose one control owner before review

Scenario: Component guidance is explicit and industry-neutral
  GIVEN the current component-bank release is exported in a recipe brief
  WHEN selection guidance is generated
  THEN every admitted component has an explicit visual-anatomy profile
  AND no profile is inferred by matching words in its identifier
  AND component, template, and design-system guidance contains no industry archetype field

Scenario: Portable product media destination is imported
  GIVEN a brief maps a product relationship to an opaque key
  WHEN a recipe uses that exact key in both content and mediaPlan
  THEN both references normalize to the same tenant-scoped product key
  AND blueprint validation does not report a missing destination
```

## Quality impact

- Security and tenant isolation: pure blueprint parsing has no persistence;
  fulfillment uses the existing actor/request-scoped adapter.
- Data integrity: immutable submitted revisions and live publication authority
  remain unchanged.
- Performance: limits remain at 24 blocks and existing catalog maxima; media-plan
  and fitness issue counts are bounded.
- Compatibility: retained v1-v4 snapshots and banks 1.1/1.2 remain readable.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Planned media parser and strict modes | domain/security | `scripts/test-showroom-blueprint.ts` |
| Bank/template metadata parity | contract/static | `scripts/test-showroom-bank.ts` |
| Fitness hard failures and warnings | domain | `scripts/test-showroom-fitness.ts` |
| Slot authorization and atomic fulfillment | integration/security | `scripts/test-showroom-blueprint.ts`, `scripts/test-security.ts` |
| Portable destination normalization | integration/regression | `scripts/test-showroom-recipe.ts` |

## Rollout and rollback

Add the contract to private v4 drafts without rewriting retained snapshots.
Disable blueprint creation/fulfillment to roll back while preserving exact
recipe import, focused controls, and recovery editing.

## Readiness checklist

- [x] Strict private/public modes defined
- [x] Metadata and fitness rules bounded
- [x] Authorization and compatibility explicit
- [x] Tests and rollback planned

## Completion evidence

Evidence: implemented and verified on 2026-07-27.

- Strict media-plan parsing, exact destination assignment, request/tenant
  authorization, required-slot review gating, eight templates,
  machine-readable component guidance, and deterministic fitness are active.
- Dense/technical catalog incompatibility remains blocking; ordinary sparse
  retained catalogs receive a fallback warning to preserve compatibility.
- Blueprint, fitness, recipe, security, revision, full-check, and 10/10
  production-browser acceptance evidence passed.
- Composition guidance now gives every hero a machine-readable media-integration
  behavior and rejects a standalone category navigator combined with catalog
  filters before review.
- Portable recipe briefs now expose exact media owner/slot triples, the schema
  constrains business and product slot names, and recipe regression evidence
  proves product media owner keys survive opaque-key normalization.
- Design-system contract `@2` removes archetype guidance. Eight templates use
  content needs, catalog shape, commerce mode, media condition, and visual
  tones; every bank component maps to an explicit non-regex selection profile.
  Bank tests prohibit industry steering in exported descriptions, and
  `npm run check`, `npm run release`, and 10/10 browser acceptance pass.
