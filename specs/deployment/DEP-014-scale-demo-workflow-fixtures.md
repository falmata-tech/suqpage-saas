---
id: DEP-014
title: Scale demo workflow fixtures
status: deprecated
related: [FE-017, BE-015, DEP-013, DEP-016]
owners: [operations, product, qa]
last_updated: 2026-08-01
change_level: L2
---

# DEP-014 - Scale demo workflow fixtures

Deprecated in part by DEP-016. Authenticated workflow density remains useful,
but its 350 public Expo showrooms and weekday occurrence targets are removed.

## Problem and outcome

The reset account proves one dense Thursday Expo but leaves other weekdays and
authenticated workflows sparse. It cannot reveal pagination, queue, assignment,
or lifecycle usability problems.

The outcome is a deterministic disposable reset with at least 15 eligible Expo
participants per weekday and enough fictional clients, staff, assignments,
requests, inquiries, support conversations, and account attention to exercise
every paginated workspace.

## Scope

### In scope

- Additional simple fictional showrooms distributed across all seven Expo
  industry themes and Ethiopian host cities.
- At least 15 eligible businesses for each weekday without increasing the
  curated featured pool beyond ten.
- Fictional operations managers, team members, clients, active assignments, and
  requests across every supported lifecycle state.
- Bounded fictional inquiry and delivery history for representative businesses.
- Deterministic setup assertions and browser evidence for dense list workflows.

### Non-goals

- Production seed migration, real customer information, one login per stress
  showroom, or finished bespoke showroom design for every fixture.
- Changing Expo hall capacity, city assignment, workflow transitions, or
  authorization.

## Domain language and invariants

- Scale fixtures are local, fictional, deterministic, and reset-only.
- Exactly ten businesses remain featured.
- Every Expo participant has an active public showroom, approved booth path,
  industry, city/zone/region, and valid coordinates.
- Lifecycle fixtures obey existing foreign keys, role profiles, tenant
  ownership, assignment scope, request statuses, and retained publication rules.

## Contracts

- `npm run reset` remains the only writer and prints no credential values.
- Every weekday's deterministic occurrence has at least 15 booths; each hall
  remains bounded by the existing 12-booth visual limit.
- Four operations managers and eight team members exist with generated
  temporary passwords that remain outside tracked source and public output.
- Requests cover submitted, under review, needs information, approved for work,
  in progress, client review, client approved, published, completed, rejected,
  and cancelled states.
- Fixture media is project-owned and contains no real person, customer, address,
  claim, token, or credential.

## Scenarios

```gherkin
Scenario: Every Expo day feels occupied
  GIVEN the disposable reset fixtures
  WHEN each weekday occurrence is generated
  THEN every day contains at least 15 eligible booths
  AND exactly ten businesses are featured across the complete account

Scenario: Operations queue contains realistic work
  GIVEN reset-created staff, clients, businesses, and requests
  WHEN an administrator or operations manager opens the workspace
  THEN paginated lists contain multiple pages and lifecycle states
  AND team assignments resolve only to valid team members

Scenario: Reset is reproducible
  GIVEN any disposable local fixture state
  WHEN the approved reset command runs
  THEN the same row counts, references, assignments, and Expo counts are restored
  AND no generated credential is printed
```

## Quality impact

- Security and tenant isolation: fictional rows still satisfy real role, tenant,
  assignment, and foreign-key constraints.
- Privacy and retention: no real data or credentials are included.
- Accessibility and responsive behavior: dense pages are verified at desktop,
  390px, and 320px.
- Localization and merchant-entered values: fixtures include varied lengths and
  Ethiopian locations without pretending to be real businesses.
- Performance and limits: fixture counts are large enough to force pages while
  remaining suitable for local setup and acceptance time.
- Failure recovery and idempotency: delete/reset restores exact state.

## Observability

Setup tests report aggregate counts only. They never print password values,
contacts, request text, or private media paths.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| 15+ booths on all weekdays and ten featured | integration | `scripts/test-scale-fixtures.ts` |
| Staff, client, assignment, and lifecycle coverage | integration | `scripts/test-scale-fixtures.ts` |
| Paginated admin/workspace usability | acceptance | `tests/acceptance/app.spec.ts` |
| Reproducible credential-safe reset | operations | `scripts/test-operations.mjs` |

## Rollout and rollback

Local reset only. Rollback reverts the fixture definitions and reruns reset.
There is no production migration and no preservation requirement for existing
local fixture rows.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Evidence

Evidence: implemented and verified on 2026-07-30:

- `npm run reset` created 120 active fictional showrooms, 403 offerings, 52
  client accounts, four operations managers, eight team members, 66 service
  requests, 40 inquiries, and 30 support conversations with no foreign-key errors.
- Requests cover all 11 supported lifecycle states. The reset includes
  assignments, retained review/approval/publication revisions, a 25-offering
  product stress tenant, and 36 inquiries for one tenant.
- `scripts/test-scale-fixtures.ts` proved exactly ten featured showrooms and
  Sunday-through-Saturday booth counts of 16, 16, 16, 16, 24, 16, and 16. Every
  generated hall remains bounded to 12 booths.
- `npm run check`, `npm run test:acceptance` (10/10), and `npm run release`
  passed. The release setup suppressed credential values and the production
  dependency audit reported zero vulnerabilities.
