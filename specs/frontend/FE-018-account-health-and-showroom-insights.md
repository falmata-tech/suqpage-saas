---
id: FE-018
title: Account health and showroom insights
status: done
related: [BE-017, BE-015, DEP-015, ADR-0010]
owners: [frontend, operations]
last_updated: 2026-07-30
change_level: L2
---

# FE-018 - Account health and showroom insights

## Problem and outcome

Clients need a clear monthly account state and useful evidence that their
showroom and Expo participation are being visited. Operations needs a compact,
searchable way to record renewals and see accounts approaching inactivity.

## Scope

### In scope

- Client account-health page with active period, grace warning, renewal history,
  and total/Expo/directory visit summary.
- Operations business context with the same health state and a manual ETB
  payment-recording control.
- Platform account-health list with search, status filter, and pagination.
- Neutral homepage notice after an inactive showroom redirect.

### Non-goals

- Revenue dashboards, downloadable invoices, exact visitor identities, or
  production gateway checkout.

## Scenarios

```gherkin
Scenario: Client sees an actionable grace warning
  GIVEN the client's monthly period has ended but the four-day grace period remains
  WHEN the client opens account health
  THEN the exact grace deadline is shown
  AND the showroom is described as temporarily still online

Scenario: Operations handles many accounts
  GIVEN hundreds of subscriptions
  WHEN an operations manager opens account health
  THEN at most twenty searchable rows render
  AND a status filter narrows the server query
```

## Quality impact

- Security and tenant isolation: no business selector can expand a client beyond
  its session tenant.
- Privacy and data retention: only aggregate visit counts are displayed.
- Accessibility and responsive behavior: semantic status text, labeled controls,
  responsive compact rows, and no horizontal page overflow.
- Performance and limits: server pagination and aggregate queries.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Client health and aggregate insight | browser | `tests/acceptance/app.spec.ts` |
| Operations search/filter/page | integration/browser | `scripts/test-account-health.ts`, `tests/acceptance/app.spec.ts` |
| Inactive redirect notice | browser | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

The page is additive. Enforcement rollback is controlled by BE-017; UI can be
removed without changing ledger history.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Evidence: verified locally on 2026-07-30.

`app/dashboard/account-health/page.tsx`, manual renewal actions, dashboard
navigation, aggregate metrics, and the inactive homepage notice are
implemented. Ordered browser acceptance proves the client active state and
metrics, operations 20-row account page and filter, and role restrictions; the
focused browser run proves inactive showroom redirect. Account integration,
full check, operations, and release gates passed on 2026-07-30.
