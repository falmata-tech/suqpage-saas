---
id: BE-015
title: Server-paginated collection queries
status: done
related: [FE-017, FE-018, BE-003, BE-009, BE-012, BE-014, BE-017, BE-018, BE-019, BE-020, BE-023, DEP-014]
owners: [backend, security, operations]
last_updated: 2026-07-30
change_level: L2
---

# BE-015 - Server-paginated collection queries

## Problem and outcome

Collection adapters currently expose unbounded arrays, arbitrary truncation, and
per-row follow-up queries. The application needs one typed paging contract and
scoped SQL queries that remain predictable with hundreds or thousands of rows.

## Scope

### In scope

- A framework-independent page request/result contract.
- Parameterized count and row queries for public showrooms, businesses, clients,
  staff, requests, offerings, inquiries, support conversations, and Expo profiles.
- Additive indexes for stable scoped ordering and common filters.
- Aggregate and `EXISTS` queries that replace homepage and inquiry N+1 reads.

### Non-goals

- External search services, full-text ranking infrastructure, cursor APIs, or
  distributed database changes.
- New mutation authority or changes to request, publication, inquiry, product,
  and Expo invariants.

## Domain language and invariants

- `PageRequest` has a positive page, bounded page size, bounded normalized
  search, and optional allowlisted filter/sort values.
- `PageResult<T>` contains rows, total items, current page, page size, and total
  pages. Rows and count always share identical authorization/filter predicates.
- Stable ordering ends with a unique identifier so records cannot move
  unpredictably between pages when sort values tie.

## Contracts

- Workspace page size is at most 20; public showroom page size is exactly five.
- Search is parameterized and escaped for SQL `LIKE`; browser input never
  supplies SQL fragments, column names, or sort expressions.
- Client, assigned-team, manager, and public scopes are explicit query inputs
  resolved from trusted session context.
- Public showroom search reads only active businesses and matches bounded
  business, industry, category, and published-offering text without loading
  complete catalogs.
- Inquiry rows include their item snapshots through one page query/aggregate,
  not per-inquiry database reads.
- Schema migration 20 adds only indexes and is repeatable. It does not rewrite
  tenant content or request state.

## Scenarios

```gherkin
Scenario: Count and rows share tenant scope
  GIVEN a client for tenant A and records for tenants A and B
  WHEN the client requests page two
  THEN the total and rows include tenant A only
  AND no tenant B value is returned

Scenario: Malformed paging input is bounded
  GIVEN negative, non-numeric, or extremely large page input
  WHEN a collection query is executed
  THEN the request normalizes to a valid bounded page
  AND the database receives a bounded limit and offset

Scenario: Homepage search avoids catalog fan-out
  GIVEN 120 active businesses with published offerings
  WHEN the public showroom page is queried
  THEN one count and one row query return the requested page
  AND no per-business catalog query executes
```

## Quality impact

- Security and tenant isolation: every private query and count is tenant/role
  scoped; parameterized search is injection-safe.
- Privacy and data retention: result projections include only fields required by
  their views.
- Accessibility and responsive behavior: owned by FE-017.
- Localization and merchant-entered values: matching uses SQLite case-insensitive
  behavior available to the current runtime; exact stored copy is returned.
- Performance and limits: bounded limit/offset, deterministic indexes, two-query
  pages, and no known list N+1 reads.
- Failure recovery and idempotency: read adapters do not mutate; index migration
  is additive and safe to rerun.

## Observability

Tests inspect query plans and bounded result sizes. Runtime diagnostics may
record route, page size, result count, and duration, but not search values,
contacts, request text, or tenant-private content.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Paging normalization and URL values | unit | `scripts/test-pagination.ts` |
| Query counts, filters, stable order, totals | integration | `scripts/test-scalable-queries.ts` |
| Tenant and assignment negative paths | security | `scripts/test-scalable-queries.ts`, `scripts/test-security.ts` |
| Additive index migration | migration | `scripts/test-scalable-queries.ts` |

## Rollout and rollback

Migration 20 creates indexes only. Application rollback can leave them in place;
database rollback may drop those named indexes after a backup if operationally
required. No row data is converted.

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

- `scripts/test-pagination.ts` passed malformed-page normalization, final-page
  clamping, bounded search, escaped `LIKE` values, and preserved URL state.
- `scripts/test-scalable-queries.ts` passed public five-row pages, workspace
  20-row pages, matching counts, stable ordering, client and assignment scope,
  aggregate inquiry items, and migration-20 index-plan evidence.
- The homepage no longer loads every catalog per business, and inquiry pages no
  longer issue one item query per inquiry.
- `npm run check`, the 10/10 production-browser acceptance suite, and
  `npm run release` passed, including production build, HTTP smoke, security,
  migration integrity, and zero production dependency vulnerabilities.
