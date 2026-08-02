---
id: BE-023
title: Discovery scale and attention projection
status: done
related: [BE-015, BE-018, BE-020, BE-022, FE-024, DEP-017, DEP-019, DEP-020]
owners: [backend, security, operations]
last_updated: 2026-08-02
change_level: L3
---

# BE-023 - Discovery scale and attention projection

## Problem and outcome

Discovery cannot distinguish workshops from growing factories, and dashboards
do not expose a bounded projection of work requiring attention. The backend
needs reviewed production-scale metadata and role-scoped aggregate queries that
preserve tenant isolation and predictable query cost.

## Domain invariants

- `production_scale` is exactly `workshop` or `growing_factory`; existing rows
  default to `workshop` and authorized discovery managers may edit it.
- Public filtering accepts only an allowlisted production-scale value. Unknown
  values behave as no scale filter and never become SQL fragments.
- Public rows, total counts, city groups, featured rows, and map points share the
  same industry/search/scale eligibility predicate.
- Platform attention includes: draft businesses with client accounts, submitted
  or needs-information requests, waiting or staff-unread support conversations,
  and received customer inquiries.
- Client attention is tenant-scoped; team-member attention is assignment-scoped;
  manager/admin attention may be platform-scoped according to capability.
- Sponsored placement and Sunday editorial selection are separate persisted
  concepts. Neither one silently grants the other.
- Sunday selections are keyed by controlled industry and business, and only
  active, published, discoverable businesses can be projected publicly.

## Contracts

- Additive schema migration 25 adds the checked profile field and an index for
  public scale filtering; no existing business, route, or publication is removed.
- `getDiscoveryView` accepts `scale`, returns the selected allowlisted value, and
  projects scale with every public business.
- `getDashboardAttention(user, businessId?)` returns only non-sensitive integer
  aggregates and role-appropriate destinations.
- Aggregate queries are parameterized, bounded to one row, and do not load
  messages, contacts, request text, or inquiry item snapshots.
- Additive migration 26 creates bounded sponsorship and Sunday-selection
  records with indexed ordering and foreign-key cleanup.
- Sunday rotation uses the Ethiopia calendar week's deterministic index across
  the controlled industry order; it does not require a background job.

## Scenarios

```gherkin
Scenario: Scale filter is composed with discovery
  GIVEN eligible workshops and growing factories in one industry
  WHEN growing_factory is selected with a search term
  THEN public totals and rows include only matching growing factories
  AND pagination and city groups use the identical predicate

Scenario: Invalid scale reaches the adapter
  GIVEN an arbitrary scale query value
  WHEN discovery is built
  THEN the value is ignored safely
  AND the SQL remains parameterized

Scenario: Attention projection enforces scope
  GIVEN activity exists for tenants A and B
  WHEN tenant A's client requests dashboard attention
  THEN only tenant A counts are returned
  AND platform-only account and unassigned-request counts are absent

Scenario: Sponsored and Sunday programs remain independent
  GIVEN a business has a paid sponsorship but no Sunday selection
  WHEN public discovery and the Sunday program are projected
  THEN it appears in the sponsored section for its assigned industry
  AND it does not appear on the Sunday floor

Scenario: Sunday industry rotates without a scheduler
  GIVEN two Ethiopia calendar weeks
  WHEN the Sunday program is projected for each week
  THEN the selected industry advances by one controlled position
  AND the seventh week returns to the first industry
```

## Quality impact

- Tenant/security boundaries are enforced before SQL construction.
- Queries return counts only and log no customer content.
- Additive migration and default preserve retained data.
- Public query plans use the existing eligibility indexes plus the new scale
  index; list results remain at five.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Migration default/check/index | migration | `scripts/test-migrations.ts`, `scripts/test-discovery.ts` |
| Filter scope and paging | integration | `scripts/test-discovery.ts`, `scripts/test-scalable-queries.ts` |
| Attention tenant/role scope | security/integration | `scripts/test-support.ts`, `scripts/test-security.ts` |
| Sponsorship and Sunday persistence, ordering, and separation | integration | `scripts/test-discovery.ts` |

## Rollout and rollback

DEP-020 applies migrations 25 and 26 before the new filters and programs are
served. Application rollback ignores the retained additive column and tables.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Verification evidence

Prior evidence: completed locally on 2026-08-02. Migration 25, allowlisted scale composition,
query plans, pagination, fixture counts, and role/tenant-scoped attention
aggregates passed `scripts/test-discovery.ts`, `scripts/test-scalable-queries.ts`,
`scripts/test-scale-fixtures.ts`, `scripts/test-support.ts`, `npm run check`, the
10/10 acceptance suite, and `npm run release`.

Migration 26 and the sponsored/Sunday projection extension completed locally on
2026-08-02. `scripts/test-discovery.ts` proves independent persistence,
allowlisted Sunday assignments, paid ordering, six-week rotation and loop,
future redaction, and today-only curated reveal. `scripts/test-scale-fixtures.ts`
proves five sponsored and five Sunday fixtures in every industry. `npm run
check`, the ordered 10/10 production-browser suite, and `npm run release` passed.
