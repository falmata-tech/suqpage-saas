---
id: DEP-004
title: Showroom bank admission and release gate
status: done
related: [FE-004, BE-005, ADR-0005]
owners: [operations, frontend, security]
last_updated: 2026-07-24
change_level: L2
---

# DEP-004 — Showroom bank admission and release gate

## Problem and outcome

A large component bank can drift when metadata, code, token systems, and
registry entries change independently. The delivery pipeline must reject an
incomplete or unsafe bank before it can be used by staff or a later composition
renderer.

## Scope

### In scope

- A deterministic bank-admission command in the standard repository check.
- Static verification of semantic parsing, coverage minimums, combination floor,
  code-reference existence, registry/token parity, scoped CSS, and prohibited
  source dependencies.
- Production type and build verification for the staff laboratory.

### Non-goals

- Database/object-storage migration, generated screenshot artifacts, external AI
  calls, deployment of a public composition renderer, or visual-regression
  infrastructure claims.

## Domain language and invariants

- A bank is available only when the complete immutable release passes admission.
- CI never publishes a partial bank or repairs missing registry entries
  dynamically.
- Generated previews, runtime databases, credentials, private media, and
  provider responses are not committed as admission evidence.

## Contracts

- `npm run test:bank` is included in `npm run check`.
- Admission fails non-zero and identifies only a safe release/component/category
  when an invariant fails.
- The gate runs without network access, a database, environment secrets, or
  mutable media.
- `npm run build` proves the authenticated laboratory and component CSS compile
  with the supported Next.js/React version.
- Existing design validation continues to prove all four current public
  renderers remain registered.

## Scenarios

```gherkin
Scenario: Complete bank passes delivery checks
  GIVEN the immutable bank, registry, token definitions, and component modules
  WHEN the standard repository check runs
  THEN bank admission passes before release
  AND the four existing showroom renderer checks still pass

Scenario: Missing component implementation blocks release
  GIVEN a bank definition whose code reference or registry renderer is absent
  WHEN bank admission runs
  THEN the command exits non-zero
  AND no runtime fallback silently substitutes another component

Scenario: Unsafe style or dependency blocks release
  GIVEN a bank component introduces global CSS, database access, network fetch,
  dynamic import, or document mutation
  WHEN the static admission checks run
  THEN the command exits non-zero with a safe category
```

## Quality impact

- Security and tenant isolation: source/dependency gate preserves a
  presentation-only boundary.
- Privacy and data retention: gate uses synthetic local fixtures only.
- Accessibility and responsive behavior: type/build and component contract
  checks complement later browser visual regression.
- Localization and merchant-entered values: fixture includes long and
  non-English-safe text shapes without rewriting values.
- Performance and limits: bounded source bank; no network or generated binary
  artifact.
- Failure recovery and idempotency: deterministic check; rollback removes
  additive files.

## Observability

CI retains command status and safe counts/categories. Do not upload databases,
private images, raw customer content, credentials, or external AI responses.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Standard check invokes bank admission | workflow | `scripts/test-workflow.mjs`, `package.json` |
| Complete release counts/parity/isolation | contract/static | `scripts/test-showroom-bank.ts` |
| Existing renderers and production route compile | build/regression | `npm run validate:designs`, `npm run build` |

## Rollout and rollback

The check and authenticated route ship additively with no persistent state.
Rollback removes them together. A later public renderer requires separate FE,
BE, and DEP specs and cannot infer readiness from this admission gate alone.

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

- `npm run test:bank` admits the exact release and reports 42 components, 13
  token systems, and 12,480 base combinations without a database, network,
  environment secret, or mutable media.
- `npm run check` includes the bank gate and passes spec/workflow validation,
  type checking, all four existing renderer registrations, composition safety,
  security, adapters, requests, and revision publication/rollback.
- `npm run build` compiles the authenticated `/dashboard/design-bank` route.
  The existing request-media Turbopack trace warning remains and is not caused
  by or weakened for this task.
- `npm run test:acceptance` builds an isolated production server and all seven
  browser scenarios pass, including bank access for all staff profiles, client
  denial, filtering, token switching, and mobile overflow.
- No database, migration, public renderer, revision schema, tenant record,
  private media, or external-provider boundary changed.
