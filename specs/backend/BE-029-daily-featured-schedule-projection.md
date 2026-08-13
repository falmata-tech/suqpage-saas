---
id: BE-029
title: Daily Featured schedule policy and override projection
status: in_progress
related: [BE-020, BE-023, BE-027, FE-021, FE-033, FE-037, DEP-020, DEP-023, DEP-024]
owners: [backend, security, operations]
last_updated: 2026-08-10
change_level: L3
---

# BE-029 - Daily Featured schedule policy and override projection

## Problem and outcome

Daily Featured timing is hard-coded and cannot represent sessions, breaks, or
authorized scheduling decisions. The backend needs a portable policy record,
deterministic agenda generation, and sparse per-date overrides with identical
SQLite and PostgreSQL behavior.

## Scope

### In scope

- Additive migration 32 for singleton policy, per-date mode, and ordered lineup.
- Pure validated agenda generation in Ethiopia time.
- Runtime adapters for reading/updating policy and per-date mode/participants.
- Schedule policy and override rules depend on a driver-neutral data port; the
  application/domain service does not import SQLite or own a database handle.
- Public discovery integration and current-booth calculation.

### Non-goals

- A job queue, cron scheduler, livestream provider integration, or calendar API.
- Arbitrary SQL/order input, arbitrary timezone input, or browser-authoritative
  schedule state.

## Domain language and invariants

- Default minute values are 480, 780, 1020, and 1320: 08:00–13:00 and
  17:00–22:00 EAT as maximum capacity windows.
- A non-empty session targets 30 presentation minutes per booth plus retained
  boundaries, has a 60-minute minimum duration, and is anchored to the capacity
  window's end. It expands to the complete window when the target no longer fits.
- Default changeover is five minutes. Every third inter-booth boundary is a
  ten-minute sponsor break instead of a normal changeover.
- Session boundaries, interval values, labels, participant IDs, and positions
  are validated server-side. User input never becomes SQL structure.
- Agenda generation is deterministic for policy, ISO date, ordered business
  IDs, and booth count.
- Manual rows are authoritative only while the business remains active,
  published, approved, non-excluded, media-complete, and assigned to the date's
  industry. If no manual row remains eligible, projection falls back to the
  Automatic lineup.
- Public non-today projection contains only booth count, references, generated
  times, and program metadata; identity remains redacted.

## Contracts

- `FeaturedProgramPolicy` validates ordered same-day minute values, at least a
  30-minute intermission, positive session durations, bounded labels, a 2–20
  minute changeover, sponsor frequency 2–8, and sponsor break 5–30 minutes.
- `buildFeaturedProgramAgenda(dateIso, boothCount, policy, now)` returns booth,
  changeover, sponsor-break, and intermission entries with epoch bounds, EAT
  labels, session identity, and one-or-zero current entry.
- Booths are split proportionally by session duration, with both sessions used
  when at least two booths exist. Remaining presentation minutes are distributed
  deterministically so each session ends exactly at its configured boundary.
  `resolveFeaturedProgramSessions(boothCount, policy)` supplies the effective
  participant-responsive starts used by agenda generation, phase calculation,
  public labels, and admin preview.
- `featured_program_policy` contains exactly row `id=1`.
- `featured_program_days` is keyed by `date_iso` and stores Automatic or Manual.
- `featured_program_lineup` is keyed by date and business, with unique date
  position and cascading cleanup.
- Global policy and one date's mode/lineup are replaced transactionally and
  audited by the server action.

## Scenarios

```gherkin
Scenario: Automatic projection tracks current eligibility
  GIVEN a date has no manual override
  WHEN eligible showrooms are added or removed
  THEN its next projection uses the updated deterministic eligible order
  AND no schedule materialization job is required

Scenario: Manual lineup rejects another industry's business
  GIVEN a date is assigned to one industry
  WHEN an administrator submits a business outside that eligible set
  THEN the mutation is rejected atomically
  AND the prior mode and lineup remain unchanged

Scenario: Break time has no active booth
  GIVEN an agenda contains a changeover, sponsor break, or intermission
  WHEN current-feature projection runs during that entry
  THEN featuredNowBusinessId is null
  AND the current public program entry identifies the break safely

Scenario: Session contraction remains deterministic
  GIVEN a policy and a small ordered lineup
  WHEN its agenda is generated repeatedly
  THEN each effective session is anchored at its configured end
  AND its start reflects its participant count, target airtime, and boundaries
  AND every generated presentation and break remains non-overlapping
```

## Quality impact

- Security and tenant isolation: platform capability checks plus eligibility
  intersection protect mutations and public projection.
- Privacy and data retention: only policy, date, IDs, order, actor, and timestamp.
- Accessibility and responsive behavior: backend supplies complete labels and
  state; no browser time arithmetic is authoritative.
- Localization and merchant-entered values: fixed Africa/Addis_Ababa semantics.
- Performance and limits: indexed singleton/date lookups and bounded lineup;
  no unbounded admin dropdown or N+1 query.
- Failure recovery and idempotency: transactional replacement and automatic
  fallback for stale empty overrides.

## Observability

Audit actor, operation, ISO date, mode, participant count, and policy minute
values. Never log credentials or business contact content.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Agenda arithmetic and edge states | unit | `scripts/test-featured-schedule.ts` |
| SQLite migration and transactional overrides | integration | `scripts/test-featured-schedule.ts`, migration tests |
| PostgreSQL DDL/runtime parity | integration | `scripts/test-postgres-runtime.ts`, readiness checks |
| Permission and tamper denial | security | `scripts/test-security.ts`, action acceptance |

## Rollout and rollback

Apply migration 32 to SQLite and PostgreSQL before the new code. Rollback leaves
the additive tables dormant. No showroom, product, media, sponsorship, or
request record is rewritten.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Implementation and focused evidence are in progress.
