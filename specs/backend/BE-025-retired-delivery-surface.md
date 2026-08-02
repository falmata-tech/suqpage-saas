---
id: BE-025
title: Retired demonstration Delivery surface
status: done
related: [FE-003, FE-017, FE-025, BE-002, BE-003, DEP-002, DEP-021, ADR-0004]
owners: [product, backend, security, operations]
last_updated: 2026-08-02
change_level: L3
---

# BE-025 - Retired demonstration Delivery surface

## Problem and outcome

MirtPage no longer offers the demonstration Delivery capability or plans a
Malikt integration. Keeping its dashboard page, API, permissions, mock company
data, and tests would confuse operators and preserve an unused private-data
surface. The active capability must be removed before launch while the populated
demo database remains intact.

## Scope

### In scope

- Remove Delivery navigation, dashboards, actions, domain adapters, mock-company
  APIs, setup seeds, smoke coverage, and active product documentation.
- Keep customer inquiries and their copy, WhatsApp, Telegram, and direct
  MirtPage-inbox workflows unchanged.
- Preserve existing delivery tables and rows as dormant legacy data during this
  data-preserving rollout.
- Return the framework's normal not-found response for retired pages and APIs.

### Non-goals

- Migrating, exporting, anonymizing, or dropping historical delivery data.
- Replacing Delivery with another logistics provider, checkout, ordering, or
  payment workflow.
- Preventing businesses and customers from arranging fulfillment outside
  MirtPage after an inquiry.

## Domain language and invariants

- **Inquiry** remains the final MirtPage-owned customer-to-business workflow.
- Delivery is not an active product capability, application port, API, role
  permission, dashboard destination, or external integration.
- Dormant legacy tables provide rollback compatibility only. No active route or
  service reads or writes them after this change.

## Contracts

- `/dashboard/deliveries`, `/api/malikt/companies`, and
  `/api/malikt/requests` are absent and return a normal not-found response.
- No role sees Delivery navigation, metrics, forms, links, or status language.
- Inquiry lists retain status operations and direct customer inquiry data, but
  expose no delivery handoff action.
- Fresh setup does not create mock delivery companies.
- Active scalable-query and security contracts contain no delivery query or
  mutation. Historical schema migrations remain unchanged and no destructive
  migration is introduced.
- Current product, launch, and operator documentation contains no claim of a
  MirtPage Delivery or Malikt capability.

## Scenarios

```gherkin
Scenario: Operator follows an old Delivery link
  GIVEN the Delivery capability has been retired
  WHEN an authenticated operator requests the former dashboard or API route
  THEN the application returns its normal not-found response
  AND no historical delivery data is read or exposed

Scenario: Operator manages a customer inquiry
  GIVEN a customer inquiry belongs to an authorized business
  WHEN an operations manager opens the inquiry workspace
  THEN inquiry status and contact workflow remain available
  AND no delivery creation action or company selector appears

Scenario: Existing demo data is migrated for launch
  GIVEN historical delivery tables or rows exist
  WHEN the non-destructive launch migration runs
  THEN those tables and rows are not dropped or rewritten
  AND no active code path depends on them
```

## Quality impact

- Security and tenant isolation: removing unused private endpoints reduces the
  authenticated attack surface; inquiry authorization remains unchanged.
- Privacy and data retention: historical rows stay private and dormant until a
  separately approved retention migration exists.
- Accessibility and responsive behavior: fewer navigation items and actions
  reduce mobile workspace complexity.
- Performance and limits: delivery counts and list queries leave dashboard
  rendering and fresh setup.
- Failure recovery and idempotency: rollback may restore prior code because the
  compatibility tables remain unchanged.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Retired pages/APIs return not found | browser/HTTP | `tests/acceptance/app.spec.ts`, `scripts/http-smoke.mjs` |
| No navigation, metric, or inquiry handoff | browser/contract | `tests/acceptance/app.spec.ts`, `scripts/test-platform-identity.mjs` |
| No active delivery queries, mutations, or fresh seed | contract/security | `scripts/test-security.ts`, `scripts/test-scalable-queries.ts` |
| Existing schema remains non-destructive | migration/operations | `npm run migrate`, `npm run test:operations` |

## Rollout and rollback

DEP-021 removes active code without deleting schema objects or historical rows.
Rollback restores the prior application version against the unchanged database.
A later data-retention proposal may remove dormant tables only with a separate
backup, migration, and approval.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related layers and superseded behavior identified
- [x] Security and data-preservation invariants explicit
- [x] Positive and negative scenarios present
- [x] Test and rollback plan defined

## Completion evidence

Evidence: completed locally on 2026-08-02. Delivery navigation, pages, actions, adapters,
fresh setup data, active queries, and APIs are absent. `scripts/http-smoke.mjs`
and 10/10 ordered browser acceptance prove the retired dashboard and Malikt API
paths return 404 and no role exposes a logistics action. Security, scalable
query, non-destructive migration, backup/restore, release, and container gates
passed while dormant compatibility tables remained untouched.
