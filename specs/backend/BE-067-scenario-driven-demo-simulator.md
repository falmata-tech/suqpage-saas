---
id: BE-067
title: Scenario-driven demo marketplace simulation
status: in_progress
related: [FE-079, DEP-054, ADR-0034, BE-055, BE-054, BE-035]
owners: [backend, security, operations]
last_updated: 2026-11-13
change_level: L3
---

# BE-067 — Scenario-driven demo marketplace simulation

## Problem, outcome and scope

Operate a dedicated service that advances realistic, predefined demo situations
through coordinated changes over time. Early visitors should see marketplace
activity about every minute. Ordinary business/product application writes and
public reads must carry those changes; no simulated API success or UI-only values.
The field inventory is [DEMO-SIMULATOR](../../docs/operations/DEMO-SIMULATOR.md).

Start with seasonal harvest, workshop production and wholesale replenishment
scenarios. Each versioned definition owns ordered named stages, minimum durations,
compatible product/business types, unit-aware selling facts, price rules, profile
copy and completion/cooldown. Stages may retain product facts while the business
update advances. No independent random fields, fabricated customer transactions,
stock counts, certifications, transport activity or external media/message calls.

## Identity and authority

- Only explicitly enrolled, currently marked `is_demo=1`, active published
  businesses qualify. Bind enrollment to business ID/handle, existing demo owner,
  immutable provider identity, selected product IDs and reviewed baseline data.
- A demo-looking name/handle, a fresh signup or the flag alone grants no enrollment.
  Signup keeps the database default `is_demo=0`, including forged demo inputs.
- Recheck and lock current owner/profile/link, business flag/status/handle,
  selected product tenancy and acknowledged content/draft/publication versions
  inside the stage transaction. Use the existing persisted business authority.
- Pause an enrollment on human-edit, identity, flag or ownership drift. Never
  overwrite a concurrent human edit or auto-enroll another account. Private or
  suspended examples and the store reviewer are excluded.
- Internal automation delegates only to the verified enrolled demo owner for
  ordinary application commands. Record explicit simulator/scenario/stage/run
  attribution; create no interactive Auth session or login event.

## Timeline and transaction contract

Persist scenario ID/version, stage index/start/due time, baseline facts and exact
acknowledged versions. A restart resumes them. A late worker advances at most one
due stage per business in a tick and schedules from the actual successful time;
it does not fast-forward a day's work or replay every missed event.

Use the existing product parser/upkeep port and owner-page save/publication path.
Keep related product facts and profile publication in one outer transaction,
including ordinary version/history/idempotency/audit records and timeline progress.
Skip unchanged commands to avoid redundant snapshots. Preserve product identity,
merchant name, contacts (including owned demo WhatsApp/Telegram), geography,
approved media, ownership, Auth, customers and notifications. Never rewrite or
delete earlier catalog/publication/inquiry history.

A fixed per-minute slot plus PostgreSQL locking prevents overlapping/replayed
ticks. Stage failure rolls back every related ordinary write before recording a
generic failed/paused result. A bad enrollment does not grant authority over
another tenant. No unbounded retries, catch-up loops or external credential use.

## Limits and controls

One scheduled tick per minute; initially at most two due stages and one selected
product per stage in a small reviewed active cohort. Keep one additional usable
published product per showroom. Use an execution deadline with room inside
Netlify's 30-second limit. A server-only control starts disabled, supports pause,
and enforces explicit per-day mutation and database-size budgets. Budget pressure
pauses demo work; it never deletes immutable history or blocks real users.

The control, enrollment and seven-day bounded operational run records are private
PostgreSQL tables with RLS and no anon/authenticated/service-role access. Only the
existing server runtime roles receive the required privileges. Do not expose
owner UUIDs, baseline/private state or service controls in public DTOs/logs.

Public catalog revision reads are independently visibility-filtered and no-store:
an opaque/string fingerprint includes business content version and latest public
page revision. Draft edits, private messages and Auth activity do not advance it.
FE-079 owns foreground refresh, including the independent page-revision case.

## Scenarios

GIVEN an enrolled demo and a due stage WHEN the tick succeeds THEN its coordinated
facts satisfy the selected scenario, ordinary versions/history advance, fresh
public reads agree and progress moves exactly once.

GIVEN a retry, overlapping tick, stopped worker or delayed execution WHEN work
resumes THEN there is no duplicate transition, partial publication or catch-up burst.

GIVEN a real account, new signup, demo-looking name, flag/owner/link/product drift
or manual edit WHEN eligibility is checked THEN no business/product mutation
occurs and excluded real/private data remains byte-for-byte unchanged.

GIVEN an intermediate command/database failure WHEN a stage ends THEN all its
related writes and notifications roll back, progress does not advance and a
bounded generic failure is observable. GIVEN a pause/budget limit THEN writes stop.

## Test plan

| Acceptance | Evidence |
|---|---|
| Coherent full timelines and predefined values | `scripts/test-demo-scenarios.ts` |
| Mixed tenants/new signup/drift/replay/concurrency/rollback | `scripts/test-demo-simulator-postgres.ts` |
| Migration, private privileges and bounded controls | existing PostgreSQL/security/preflight gates plus simulator integration |
| Actual write → public revision/API → UI | FE-079 browser/native journeys |

## Rollout and readiness

Contracts, failure/identity boundaries, limits, tests and ordered rollout are
explicit. DEP-054 owns exact hosted verification, backups, migration/enrollment,
disabled deployment, canary and recurring readback. No hosted write is performed
by this specification. Master §§15–17/20/22 describe the planned service until
implementation and mapped evidence qualify current behavior.
