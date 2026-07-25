---
id: BE-006
title: Bounded showroom experience contract
status: done
related: [FE-005, FE-006, FE-009, BE-007, BE-010, DEP-005, DEP-009, BE-004, BE-005, ADR-0005, ADR-0007]
owners: [product, backend, frontend, security]
last_updated: 2026-07-24
change_level: L1
---

# BE-006 — Bounded showroom experience contract

## Problem and outcome

Motion and decoration cannot become arbitrary code-shaped escape hatches inside
otherwise declarative showroom proposals. The component bank needs explicit,
validated properties and typed renderer inputs for visual energy and decorative
depth.

## Scope

### In scope

- Shared immutable enums for motion intensity, decorative depth, and laboratory
  preview device.
- Required `motion_intensity` and `decorative_depth` enum property definitions
  on every admitted bank component.
- Typed presentation settings passed to statically registered renderers.
- Token variables for timing, easing, atmospheric color, and decorative shape.

### Non-goals

- Changing proposal schema version, persisting a design manifest, introducing a
  composition renderer, executing proposal-controlled code, or permitting
  arbitrary duration, transform, color, class, CSS, markup, or asset values.

## Contracts and invariants

- Motion intensity is exactly `quiet`, `balanced`, or `expressive`.
- Decorative depth is exactly `clean`, `subtle`, or `signature`.
- Preview device is exactly `responsive` or `mobile`.
- Every component declares the complete bounded motion and decoration sets as
  required enum properties, so a later proposal cannot invent another value.
- Every token system provides the complete experience-variable contract.
- Presentation settings are values only. They cannot read persistence, perform
  I/O, change canonical content, or alter platform callbacks.
- Reduced-motion authority belongs to the user agent and overrides visual
  intensity in CSS.

## Scenarios

```gherkin
Scenario: Complete experience metadata is admitted
  GIVEN the immutable showroom bank
  WHEN the admission gate checks every component and token
  THEN each component exposes only the bounded motion and decorative values
  AND each token exposes every required experience variable

Scenario: Unbounded visual input is rejected
  GIVEN a showroom proposal
  WHEN it supplies an undeclared motion, decoration, duration, transform, CSS,
  class, markup, or asset value
  THEN the existing strict proposal parser rejects it
  AND no value is executed or dynamically imported
```

## Quality impact

- Security and tenant isolation: pure enums and renderer props; no authority.
- Privacy and data retention: no customer data.
- Accessibility: reduced-motion is an external mandatory override.
- Performance: bounded CSS variables and no runtime animation dependency.
- Failure recovery: immutable metadata and deterministic parsing.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Exact property contract on all components | unit/contract | `scripts/test-showroom-experience.ts` |
| Exact experience variables on all tokens | unit/contract | `scripts/test-showroom-experience.ts` |
| Unknown visual properties still fail closed | unit/security | `scripts/test-showroom-composition.ts`, `scripts/test-showroom-experience.ts` |

## Rollout and rollback

The bank release advances additively while proposal schema version 1 remains
strict. No stored proposal or revision currently references the bank. Rollback
restores the prior release and property list without data migration.

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

- Immutable shared enums define exactly three motion intensities, three
  decorative depths, two laboratory devices, and the balanced/subtle default.
- Every one of the 42 parsed component definitions requires both bounded enum
  properties. All 13 token systems receive the complete timing, easing,
  distance, and decorative-size variable contract.
- The focused test creates a valid proposal against `showroom-bank@1.1.0` and
  proves an undeclared animation-duration property still fails through the
  authoritative strict parser without execution or import.
