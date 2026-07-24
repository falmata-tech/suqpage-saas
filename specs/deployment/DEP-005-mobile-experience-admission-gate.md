---
id: DEP-005
title: Mobile showroom experience admission gate
status: done
related: [FE-005, BE-006, DEP-004, BE-005]
owners: [operations, frontend, accessibility]
last_updated: 2026-07-24
change_level: L2
---

# DEP-005 — Mobile showroom experience admission gate

## Problem and outcome

Responsive claims can drift as bank variants and visual effects evolve. The
delivery gate must reject missing bounded metadata, unsafe motion, global
effects, or component previews that overflow a phone.

## Scope

### In scope

- A deterministic experience-contract command in `npm run check`.
- Static checks for scoped effects, reduced-motion override, touch sizing,
  focus visibility, native scrolling, and prohibited runtime mechanisms.
- Production-browser evidence across all component previews at 390 pixels and
  representative public-showroom containment at 320 and 390 pixels.

### Non-goals

- Screenshot-baseline infrastructure, device farms, native application claims,
  public composition rollout, or exhaustive visual proof of every theoretical
  future composition.

## Contracts

- `npm run test:experience` runs from `npm run check`.
- The gate runs without network, database, secrets, private media, or generated
  committed screenshots.
- Static admission rejects global selectors, fixed overlays, animation
  libraries, timers, observers, proposal-controlled style objects, and missing
  reduced-motion rules.
- Browser acceptance checks every laboratory component canvas for horizontal
  overflow in mobile-preview mode and verifies that interactive targets remain
  named and visible.
- Existing four-renderer validation and public mobile workflows continue to
  pass.

## Scenarios

```gherkin
Scenario: Mobile experience release passes
  GIVEN the complete bank and staff laboratory
  WHEN repository and production-browser gates run
  THEN bounded experience metadata, reduced motion, touch interaction, and
  phone containment pass
  AND all existing renderer, security, and publication gates remain enabled

Scenario: Unsafe effect blocks delivery
  GIVEN a bank effect that adds a global selector, fixed overlay, runtime
  observer, timer, external dependency, or missing reduced-motion override
  WHEN the experience admission command runs
  THEN it exits non-zero with a safe category
```

## Quality impact

- Security and privacy: source-only and synthetic-browser evidence.
- Accessibility: reduced-motion, focus, labels, and touch targets are required.
- Performance: no animation runtime or network dependency is admitted.
- Rollback: additive gate and presentation changes only.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Standard check includes experience admission | workflow | `scripts/test-workflow.mjs`, `package.json` |
| Source and metadata invariants | static/contract | `scripts/test-showroom-experience.ts` |
| Every component mobile containment/reduced motion | browser | `tests/acceptance/app.spec.ts` |
| Existing public showrooms and roles remain healthy | regression | `npm run test:acceptance`, `npm run release` |

## Rollout and rollback

No schema migration or public route changes. Revert the bank/laboratory release
and its gate together if the staff preview regresses.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Evidence: verified locally on 2026-07-24.

- `npm run test:experience` is enforced by `npm run check` and verifies exact
  enums, component property coverage, token variables, proposal fail-closed
  behavior, container queries, reduced motion, touch sizing, safe-area use,
  focus/hover boundaries, native swipe behavior, and prohibited runtime
  mechanisms.
- `npm run check` passes the new admission command alongside spec/workflow,
  type, four-renderer, composition, bank, security, adapter, request, and
  revision tests.
- The canonical release audit discovered newly reported findings against the
  prior pinned framework/CSS patch levels. The release now pins Next.js 16.2.11
  and PostCSS 8.5.12, and `npm audit --omit=dev` reports zero vulnerabilities.
- The isolated production build and all seven production-browser scenarios pass.
  Browser coverage includes all bank components and all four current public
  showrooms at phone widths. The pre-existing request-media Turbopack trace
  warning remains and was not weakened by this work.
- No database, migration, tenant, revision, public composition renderer,
  provider, media, or publication boundary changed.
