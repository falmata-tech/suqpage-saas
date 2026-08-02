---
id: BE-019
title: Indexed industry and nearest City Showroom discovery
status: deprecated
related: [FE-020, FE-021, BE-015, BE-017, BE-020, DEP-015, DEP-016]
owners: [backend, security, operations]
last_updated: 2026-08-01
change_level: L2
---

# BE-019 - Indexed industry and nearest City Showroom discovery

Deprecated by `FE-021`, `BE-020`, and `DEP-017`. This file retains the verified
historical nearest-host contract; it is not current public behavior.

## Problem and outcome

Date occurrences and JSON industry arrays are the wrong authority for permanent
discovery and become inefficient at scale. The domain needs indexed industry
membership, approved public profiles, and deterministic nearest-city grouping
without artificial cross-country balancing.

## Domain language and invariants

- An active discovery industry has a stable key, public label, icon, position,
  and active flag.
- A business may belong to multiple industries through indexed join rows.
- An eligible business is active, entitled, not excluded, assigned to an active
  industry, and has approved booth media plus valid city/zone/region/WGS84 data.
- Each eligible business first belongs to its geographically nearest reviewed
  host city.
- A host qualifies when its local group contains at least three matching
  businesses. Sparse groups move to the nearest qualifying host. If no host has
  three, the largest nearest-host group becomes the sole City Showroom so results do
  not disappear.
- Assignment is deterministic and never balances counts by moving businesses
  to a farther host when their nearest qualifying host has capacity.
- Booth order is featured first, then business name and ID. Hall size is twelve;
  references are `{city-code}-{hall}-B{booth}` and unique within the selected
  industry view.

## Contracts

- Additive migration creates `discovery_industries`, `business_industries`, and
  `business_discovery_profiles` with foreign keys and indexes for active
  industry, featured state, and business scope.
- Legacy Bazaar/Expo tables remain inert for rollback but are not read or
  written by current public/admin discovery code.
- The public projection accepts allowlisted industry, bounded search, and
  active/entitled scope. Search is parameterized and may match business name,
  handle, public description, origin location, and published offering text.
- Country summaries and booth projections are built server-side. Browser input
  cannot supply coordinates, featured authority, entitlement, or business IDs
  outside the returned projection.
- Empty and invalid industry input resolves to the first active industry.

## Scenarios

```gherkin
Scenario: Sparse businesses join the nearest qualifying city
  GIVEN one host has two local businesses and a nearby host has three
  WHEN the industry discovery view is built
  THEN the two-business group joins the nearest qualifying host
  AND each business retains its true origin city, zone, and region

Scenario: No city reaches the minimum
  GIVEN an industry has only two eligible businesses in different catchments
  WHEN discovery is built
  THEN both businesses appear in one deterministic City Showroom
  AND List View still exposes their true origins

Scenario: Ineligible business is requested
  GIVEN a draft, expired, excluded, media-incomplete, or unlocated business
  WHEN public discovery is queried
  THEN it contributes to no count, City Showroom, booth, or list row
```

## Quality impact

- Security and privacy: parameterized public-only projection; tenant-private
  and contact fields are absent.
- Data integrity: indexed many-to-many membership replaces JSON filtering;
  foreign keys prevent orphan industry rows.
- Performance: bounded server search, indexed predicates, deterministic sort,
  hub summaries, and at most twelve rendered booths per hall.
- Failure recovery: migration is repeatable; application rollback can leave new
  tables unused and re-enable the prior code during this pre-production phase.

## Test plan

| Criterion | Level | Evidence |
|---|---|---|
| Eligibility and negative states | security/integration | `scripts/test-discovery.ts`, `scripts/test-security.ts` |
| Indexed industry/search queries | integration/query-plan | `scripts/test-discovery.ts` |
| Nearest qualifying host and no balancing | unit/integration | `scripts/test-discovery.ts` |
| Hall bounds and stable references | integration | `scripts/test-discovery.ts` |
| Migration/backfill/reset reproducibility | migration/operations | `scripts/test-discovery.ts`, `scripts/test-operations.mjs` |

## Rollout and rollback

Migration is additive. This repository's local data is disposable and reset is
the admission path. Any future production backfill requires backup, dry run,
count reconciliation, and explicit approval under a separate rollout.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Evidence

Evidence: implemented and verified on 2026-08-01:

- Schema migration 23 creates indexed industries, memberships, and approved
  discovery profiles without rewriting retained business content.
- `scripts/test-discovery.ts` passed eligible and ineligible projections,
  parameterized offering search, query-plan index use, sparse nearest-host
  assignment, sole-host fallback, 12-booth halls, stable references, and the
  transactional admin profile/membership upsert regression.
- `scripts/test-scale-fixtures.ts` passed 58 seeded Showrooms, six industries, 54
  currently entitled discovery participants, four payment-lifecycle exclusions,
  exactly ten featured profiles, and bounded City Showroom halls.
- Security integration, `npm run check`, and `npm run release` passed.
