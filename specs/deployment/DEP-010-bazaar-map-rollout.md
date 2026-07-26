---
id: DEP-010
title: Bazaar map rollout and operations
status: done
related: [FE-010, FE-011, FE-012, BE-011, BE-012, DEP-002]
owners: [operations, security]
last_updated: 2026-07-26
change_level: L2
---

# DEP-010 — Bazaar map rollout and operations

## Problem and outcome

The Bazaar map adds a public discovery route, new tables, daily time behavior,
and mobile performance risk. It must roll out without disrupting existing
showrooms, inquiries, managed requests, or the controlled single-instance pilot.

## Scope

### In scope

- Additive schema migration for Bazaar themes, occurrences, booth profiles, and
  booths.
- Local/reset seed data for the weekly Bazaar schedule and current booth
  generation.
- Manual generation path for the current single-instance pilot.
- Public `/bazaar` smoke and mobile browser evidence before homepage promotion.
- Cache and stale-state invalidation policy for daily rollover.
- Rollback boundary for code and additive data.

### Non-goals

- Production launch of paid featured placements.
- Multi-instance cron coordination or queue infrastructure.
- External analytics provider integration.
- Production data-destructive migration.
- Replacing the existing homepage before the Bazaar route passes evidence.

## Domain language and invariants

- **Rollover:** the operation that resolves the platform day, creates or updates
  the active occurrence, generates booths, and publishes that occurrence.
- **Platform timezone:** the configured timezone used for daily Bazaar
  boundaries; browser clocks are advisory only.
- Rollover is safe to run manually more than once.
- A failed rollover must not mark stale data as newly live.

## Contracts

- Local and test environments may create current Bazaar data lazily on read.
- Production should run a manual or scheduled `ensureCurrentBazaar` operation at
  or shortly after the configured 4:00 AM boundary before the homepage promotes
  Bazaar content.
- `/api/health` remains independent from Bazaar availability; Bazaar-specific
  failures are surfaced in public empty/unavailable states and safe logs.
- Deployment gates include `npm run validate:specs`, `npm run typecheck`,
  `scripts/test-bazaar.ts`, and a Playwright mobile scenario.

## Scenarios

```gherkin
Scenario: Bazaar migration deploys additively
  GIVEN an existing controlled-pilot database
  WHEN the Bazaar migration runs
  THEN existing businesses, products, inquiries, requests, and revisions remain
  readable
  AND Bazaar tables can be created without destructive data movement

Scenario: Manual rollover is retried
  GIVEN today's Bazaar generation partially or previously succeeded
  WHEN an operator reruns the generation command
  THEN duplicate occurrences and booths are not created
  AND the active public route remains consistent

Scenario: Public homepage is not promoted too early
  GIVEN /bazaar lacks mobile browser evidence
  WHEN the release is prepared
  THEN the homepage may keep a simple link or omit Bazaar promotion
  AND existing showroom discovery remains available
```

## Quality impact

- Security and tenant isolation: migration and generator never expose private
  tenant data or credentials in logs.
- Privacy and data retention: Bazaar data references public showroom records and
  public media paths only.
- Accessibility and responsive behavior: release evidence includes 320px and
  390px browser checks.
- Localization and merchant-entered values: rollout does not require changing
  existing merchant-entered content.
- Performance and limits: production promotion requires bundle/build evidence
  and no WebGL/large animation dependency.
- Failure recovery and idempotency: generation and migrations are rerunnable;
  rollback leaves existing features unaffected.

## Observability

Safe release evidence records migration version, generation status, occurrence
ID, theme slug, booth count, empty/unavailable status, and browser viewport
checks. Do not store screenshots containing private dashboard data as public
evidence.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Additive migration and rollback boundary | operations | `scripts/test-operations.mjs`, `scripts/test-bazaar.ts` |
| Manual/lazy rollover idempotency | integration | `scripts/test-bazaar.ts` |
| Public mobile route evidence | acceptance | `tests/acceptance/app.spec.ts` |
| Existing check gate remains green | release | `npm run check` |

## Rollout and rollback

Run a normal backup before applying migrations in any data-important
environment. Deploy `/bazaar` as the first public surface, validate mobile
browser evidence, then add stronger homepage promotion in a follow-up. Rollback
is code rollback to the previous version; additive Bazaar tables may remain
unused until a later verified rollout.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Implemented locally on 2026-07-26 as an additive pilot rollout slice. Migration
15 creates Bazaar tables without destructive data movement. Reset/setup seeds
the default weekly schedule and booth profiles. Acceptance uses
`SUQPAGE_BAZAAR_NOW` to keep the mobile Sunday Bazaar browser evidence
deterministic.

Evidence:

- `npm run validate:specs`
- `npm run typecheck`
- `npm run test:bazaar`
- `npm run test:acceptance` passed 9/9.
- `npm run check`

Known limitation: no remote checks, production backup/restore run, or scheduled
4:00 AM production job evidence has been collected. The route is locally ready
for testing; production promotion still requires the normal operator rollout.
