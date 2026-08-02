---
id: FE-014
title: Recipe blueprint media studio
status: done
related: [FE-007, FE-009, FE-016, FE-023, BE-008, BE-010, BE-013, DEP-009, DEP-011, ADR-0005, ADR-0007]
owners: [product, frontend, design]
last_updated: 2026-07-28
change_level: L3
---

# FE-014 - Recipe blueprint media studio

## Problem and outcome

The recipe studio requires staff to admit media before the AI has chosen a
composition, while the recovery editor exposes one long form that can only
select existing assets. Staff need the AI to propose dynamic catalog content
and a bounded media plan first, then fulfill clearly labeled section and product
slots before client review.

## Scope

### In scope

- A staged `Brief -> Blueprint -> Media -> Preview -> Review` staff workflow.
- Blueprint imports that may contain bounded unresolved image slots.
- Grouped media-slot cards with purpose, aspect guidance, required state,
  thumbnail, alt text, and upload/replace/remove/select-existing actions.
- Intentional private-preview treatments for unresolved slots.
- Section-oriented focused editing with the full recovery form retained under an
  explicitly secondary Advanced recovery disclosure.
- A visible readiness summary that distinguishes blueprint validity, preview
  readiness, and client-review readiness.
- Industry-neutral component and template guidance that gives staff and AI a
  concrete mental model of layout anatomy, media behavior, visual character,
  content tolerance, responsive transformation, and unsuitable conditions.

### Non-goals

- Client studio access, automatic provider transfer, arbitrary remote images,
  generated code/CSS, publication with unresolved required media, or removal of
  retained recovery and approval controls.

## Contracts

- AI chooses dynamic collection, category, product, section, and media-slot
  counts within BE-013 limits. No UI assumes a fixed catalog or image count.
- The exported brief supplies a machine-readable list of currently valid media
  destinations, including the exact owner type, opaque owner key, and slot key.
  Its complete example must not imply that empty product image references
  require an empty media plan.
- An unresolved planned image uses a stable opaque slot reference and contains
  only safe presentation guidance. It is not an admitted asset or factual claim.
- Private blueprint preview renders a labeled slot treatment instead of an empty
  image request, broken image, or unexplained initial.
- Uploading to a slot reuses the request-scoped verified-image adapter and
  atomically replaces only that slot reference after tenant authorization.
- Required unresolved slots block client submission and publication. Optional
  unresolved slots use the component's reviewed no-media fallback and do not
  block review.
- Product and section slots are grouped by page order. Staff can identify the
  exact destination without reading JSON or database keys.
- Illustrative/generated artwork is visibly labeled in staff review until
  replaced or explicitly accepted; public presentation never claims it is a
  factual product photograph.
- Advanced recovery remains permission-gated and never becomes the default
  route after import.
- The complete workflow is keyboard usable and has no horizontal page overflow
  at 320 and 390 CSS pixels.
- Component names and legacy IDs are identifiers, not suitability signals.
  Selection guidance never recommends components, templates, or design systems
  by industry. It uses the actual content need, catalog shape, commerce mode,
  available media, visual tone, density, and responsive behavior.
- The design-bank laboratory presents the same machine-readable selection
  factors exported to AI, so staff can review why a choice fits without relying
  on private implementation knowledge or an after-the-fact screenshot.

## Scenarios

```gherkin
Scenario: Staff imports a blueprint before all photography exists
  GIVEN an assigned staff member has a client request with incomplete media
  WHEN a valid AI recipe declares bounded product and section media slots
  THEN SuqPage stores a private blueprint candidate
  AND the Media step shows each unresolved slot with its purpose and guidance
  AND client review remains unavailable while required slots are unresolved

Scenario: Staff fulfills a product image slot
  GIVEN a private blueprint contains a required planned product image
  WHEN assigned staff upload and admit an authorized compatible image to that slot
  THEN only the selected product reference changes
  AND its exact preview updates
  AND the readiness summary records the slot as complete

Scenario: AI plans photography for a portable product key
  GIVEN an exported brief contains a product with an empty image reference
  WHEN the AI returns that brief's exact product destination using product_image
  THEN import resolves the opaque owner key to the same normalized product
  AND the Media step presents the labeled upload destination

Scenario: An optional section image is omitted
  GIVEN a compatible component supports a reviewed no-media fallback
  WHEN staff leave its optional image slot unresolved
  THEN the private and public-ready preview use that intentional fallback
  AND no broken image, initials-only card, or false photography claim appears

Scenario: Client attempts to use the media studio
  GIVEN an authenticated client
  WHEN the client requests a blueprint, slot upload, or focused-edit route
  THEN access is denied before recipe or asset details are disclosed

Scenario: AI chooses without industry stereotypes
  GIVEN the component bank contains legacy names associated with particular products
  WHEN the AI receives composition guidance
  THEN every component has an objective layout and visual-behavior description
  AND suitability is expressed through content, catalog, media, commerce, and responsive conditions
  AND no industry or business-archetype recommendation is exported
```

## Quality impact

- Security and privacy: request/tenant authorization owns every slot operation;
  private bytes and raw paths never enter recipe JSON or logs.
- Accessibility: slot purpose, status, accepted media, and controls have
  programmatic labels and visible focus.
- Performance: previews use bounded slot counts, verified image dimensions, and
  existing optimized media delivery.
- Recovery: slot replacement is atomic and retained revision/publication
  rollback remains unchanged.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Blueprint and readiness states | domain/integration | `scripts/test-showroom-blueprint.ts` |
| Portable destination guidance and opaque-key normalization | contract/integration | `scripts/test-showroom-recipe.ts` |
| Slot upload and tenant denial | security/integration | `scripts/test-showroom-blueprint.ts`, `scripts/test-security.ts` |
| Studio stages and advanced recovery | browser | `tests/acceptance/app.spec.ts` |
| 320/390 labels, focus, and overflow | browser | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

Enable for editable local v4 drafts after BE-013 and DEP-011 gates pass.
Rollback hides blueprint-slot actions and preserves the existing recipe import
and recovery editor. No submitted or published revision is rewritten.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related contracts linked
- [x] Authorization and readiness states explicit
- [x] Mobile/accessibility behavior explicit
- [x] Tests and rollback planned

## Completion evidence

Evidence: implemented and verified on 2026-07-27.

- The staged studio, labeled media board, exact request-scoped slot
  fulfillment, readiness gate, composition-fitness summary, preview gate, and
  secondary recovery editor are implemented.
- Blueprint, fitness, revision, security, full-check, and 10/10
  production-browser acceptance evidence passed.
- Recipe briefs now enumerate exact portable media destinations and demonstrate
  optional product photography plans for empty image references. Recipe
  integration tests prove opaque media owner keys normalize with product keys.
- Component and template selection is now industry-neutral. The design-bank
  laboratory exposes objective layout, media, responsive, content-need, and
  visual-tone guidance; all 67 admitted components have an explicit reviewed
  profile and browser acceptance passes 10/10.
