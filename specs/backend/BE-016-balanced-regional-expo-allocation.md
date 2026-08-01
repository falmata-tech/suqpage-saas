---
id: BE-016
title: Balanced regional Expo allocation
status: deprecated
related: [FE-010, FE-015, BE-011, DEP-010, DEP-015]
owners: [backend, expo]
last_updated: 2026-08-01
change_level: L2
---

# BE-016 - Balanced regional Expo allocation

Deprecated by BE-019. Artificially balanced host counts are replaced by nearest
qualifying City Suq assignment.

## Problem and outcome

Nearest-city assignment can create one crowded venue and several tiny venues.
Dense Daily Expo occurrences need four or five geographically useful city
venues with ten to twenty booths each, while sparse real occurrences still need
a deterministic nearest-host fallback.

## Scope

### In scope

- Capacity-aware city-host selection and booth assignment.
- Five balanced venues when at least fifty eligible businesses participate.
- Four balanced venues when forty to forty-nine businesses participate.
- Deterministic hall and booth references with at most twelve booths per hall.
- Reset-only fixtures that exercise at least fifty eligible businesses on every
  Expo day across multiple Ethiopian regions and zones.

### Non-goals

- Routing visitors to physical events, live GPS, or commercial map tiles.
- Claiming that fictional reset fixtures are real businesses.

## Domain language and invariants

- An Expo venue is one city-hosted virtual floor for one daily occurrence.
- A dense occurrence has at least forty eligible businesses.
- Dense venue counts differ by at most one booth after allocation and each venue
  contains ten to twenty booths.
- Host choice favors geographic coverage and candidate proximity but capacity
  wins over a lopsided nearest-host result.
- Assignment is deterministic for an unchanged occurrence and candidate set.

## Contracts

- Fifty or more candidates select five hosts; forty to forty-nine select four.
- Selected hosts begin with the strongest local catchments, then maximize
  distance from already selected hosts while retaining candidate support.
- Each candidate is assigned by distance plus a load-balancing penalty to a
  selected host whose target capacity is not full.
- Sparse occurrences retain one or more nearest reviewed hosts and do not invent
  empty venues.
- Persisted assignments are regenerated when the eligible business set changes.

## Scenarios

```gherkin
Scenario: Dense day creates five useful venues
  GIVEN at least fifty eligible businesses distributed across Ethiopia
  WHEN the daily Expo allocation is generated
  THEN exactly five city venues are available
  AND every venue has between ten and twenty booths
  AND venue booth counts differ by at most one

Scenario: Sparse day remains usable
  GIVEN fewer than forty eligible businesses
  WHEN the daily Expo allocation is generated
  THEN businesses use deterministic nearest reviewed city hosts
  AND no empty venue is published
```

## Quality impact

- Security and tenant isolation: only active, approved, media-complete profiles
  can be allocated; entitlement is evaluated server-side.
- Privacy and data retention: public coordinates are business profile data, not
  visitor locations.
- Accessibility and responsive behavior: FE-010 continues to render one bounded
  venue floor at a time.
- Performance and limits: allocation is bounded to one occurrence and persisted;
  browsers receive the selected day's public projection only.
- Failure recovery and idempotency: regeneration is deterministic and
  transactional.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Dense four/five-host balance | unit/integration | `scripts/test-expo.ts` |
| Fifty-plus daily reset fixtures | integration | `scripts/test-scale-fixtures.ts` |
| Mobile venue navigation and floor bounds | browser | `tests/acceptance/app.spec.ts`, `scripts/capture-expo-visuals.mjs` |

## Rollout and rollback

The allocator and disposable seed data can be rolled back without a production
data migration. Existing persisted assignments remain readable; regeneration
replaces only assignments for the selected occurrence.

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

Migration-free allocator and disposable fixtures are implemented in
`lib/expo.ts`, `lib/scale-demo-seed.ts`, and `scripts/setup.ts`.
`scripts/test-expo.ts`, `scripts/test-scale-fixtures.ts`, and
`scripts/test-showroom-benchmarks.ts` prove five balanced venues, ten-to-twenty
booths per venue, a twelve-booth hall ceiling, stable assignment, and daily
counts of 54/54/54/51/74/53/54. `scripts/capture-expo-visuals.mjs` passed all
nine desktop/mobile visual probes, the focused inactive-showroom browser
scenario passed, 10/10 ordered browser acceptance passed, `npm run check`
passed, and `npm run release` passed on 2026-07-30.
