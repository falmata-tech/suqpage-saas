---
id: FE-018
title: Account health and showroom insights
status: done
related: [FE-021, FE-032, BE-017, BE-015, DEP-015, ADR-0010, ADR-0011]
owners: [frontend, operations]
last_updated: 2026-08-01
change_level: L2
---

# FE-018 - Account health and showroom insights

## Problem and outcome

Clients need a clear monthly account record and useful evidence that their
showroom and Daily Featured participation are being visited. Operations needs a compact,
searchable way to record manual renewals without making an undecided commercial
schedule an automatic public-availability switch.

## Scope

### In scope

- Client account-health page with period status, renewal history,
  and total/Daily Featured/directory visit summary.
- Operations business context with the same health state and a manual ETB
  payment-recording control.
- Platform account-health list with search, status filter, and pagination.
- Neutral homepage notice after an explicitly suspended showroom redirect.

### Non-goals

- Revenue dashboards, downloadable invoices, exact visitor identities, or
  production gateway checkout.

## Scenarios

```gherkin
Scenario: Client sees an advisory renewal status
  GIVEN the client's monthly period has ended but the four-day grace period remains
  WHEN the client opens account health
  THEN the exact period and grace dates are shown as account records
  AND the active published showroom remains online until explicitly suspended

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
| Explicit suspension redirect notice | browser | `tests/acceptance/app.spec.ts` |

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

Evidence: verified locally on 2026-08-01.

`app/dashboard/account-health/page.tsx`, advisory manual renewal actions,
dashboard navigation, aggregate metrics, and the explicit-suspension homepage
notice are implemented. Ordered browser acceptance proves the client renewal
state and metrics, operations 20-row account page and filter, and role
restrictions. `scripts/test-account-health.ts` proves elapsed renewal dates do
not hide an active published showroom while explicit suspension still does.
`npm run check`, 10/10 browser acceptance, and `npm run release` passed on
2026-08-01.
