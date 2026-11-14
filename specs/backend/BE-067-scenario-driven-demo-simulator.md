---
id: BE-067
title: Scenario-driven demo marketplace simulation
status: in_progress
related: [BE-049, FE-061, BE-009, FE-079, DEP-054, ADR-0034, BE-055, BE-054, BE-035]
owners: [backend, security, operations]
last_updated: 2026-11-14
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
update advances. Each stage also publishes its predefined progress summary before
the original product description, so listing cards visibly change every tick.
Enrollment reserves space within the ordinary text limits; no original story or
description is truncated. No independent random fields, fabricated customer transactions,
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
approved media, ownership, Auth, customers and notifications. Ordinary upkeep may
materialize a legacy image/video fallback into its gallery JSON; effective media
references and ordering must remain identical. Never rewrite or
delete earlier catalog/publication/inquiry history.

A fixed per-minute slot plus PostgreSQL locking prevents overlapping/replayed
ticks. Stage failure rolls back every related ordinary write before recording a
generic failed/paused result. A bad enrollment does not grant authority over
another tenant. No unbounded retries, catch-up loops or external credential use.

## Full public-demo catalog coverage (S196)

The owner requires every public demo business and every current product, not a
permanent canary. The reviewed inventory contains 64 public demos/256 products.
An explicit full-catalog enrollment binds the exact sorted current product IDs,
names, kinds, units, categories and owner/provider identity. Draft/reviewer/real
accounts remain excluded. New products or human edits pause the affected demo;
they never silently rewrite the enrolled baseline.

One business stage advances every enrolled product through its compatible
predefined timeline. Deliberate phase offsets keep at least one product usable;
ready-made replenishment, seasonal harvest, general made-to-order production,
short-window food preparation and fresh-food batches
remain distinct. Preserve each original story, price baseline, media and unit.
An explicitly reviewed empty unit is initialized by the first ordinary stage.

BE-009's bounded batch command validates each ordinary product command under one
tenant/version lock, retains per-product idempotency/audit evidence and publishes
one final catalog version. Product facts, business publication and progress are
atomic. A late member failure rolls back the whole stage. No intermediate public
versions or extra notification activity are created.

Private additive schema83 retains the previous three single-product enrollments
until explicitly upgraded. Full-catalog membership is bounded to 64 businesses
and eight products per business, covering the reviewed current inventory. A
minute tick advances at most two businesses; the oldest due business runs first,
so every business participates and work remains bounded independently of breadth.
Keep the existing 2,880-stage/day and 256MiB limits, retention and execution
deadlines. With 64 businesses, a business normally participates approximately
once per 32 successful minute ticks; its entire current catalog moves together.
Do not promise every product changes every minute or raise provider billing.

GIVEN all current public demos WHEN exact full-catalog enrollment completes THEN
the recorded manifest covers every one of their current products. GIVEN a stage
WHEN ordinary batch upkeep succeeds THEN every member matches its coherent plan,
one catalog/page version advances and public/read/UI facts agree. GIVEN replay,
drift, a foreign member or late failure THEN no partial/public/private data leaks
or real-account mutation occurs. Prove fairness and all-product coverage on the
full-size disposable inventory, then verify hosted scheduled coverage/readback.

## Limits and controls

S197's planned explicit media maintenance is defined in BE-049. It may reuse a
private disabled-only request to execute the exact reviewed ordinary correction
and atomically acknowledge only that change. It must preserve enrollment progress
and all scenario baselines except the approved page video URL. Routine stage work
continues to preserve media and fail closed on any unreviewed content drift.

One scheduled tick per minute; at most two due business stages, each updating
its complete enrolled catalog under S196. Legacy single-product canaries remain
compatible until explicitly upgraded. Keep at least one usable published product
in a full catalog, and an additional companion for legacy single-product plans.
Use an execution deadline with room inside
Netlify's 30-second limit. A server-only control starts disabled, supports pause,
and enforces explicit per-day mutation and database-size budgets. Budget pressure
pauses demo work; it never deletes immutable history or blocks real users.

Operator enrollment requests are private database records, never an HTTP/admin
endpoint. The disabled worker admits at most eight explicit requests per tick,
starting no new admission after its12-second work budget, using
the ordinary enrollment checks, reviewed content/draft/publication versions and
exact demo owner/product bindings. It records accepted/rejected outcomes and never
enables itself. When explicitly requested, an empty product unit is initialized
through ordinary upkeep before legacy enrollment or in the first full-catalog
stage; an existing unit is preserved.
A refused request rolls back all preparation. Active simulation does not consume
requests. Migration creates no request or enrollment.

The control, requests, enrollment and seven-day bounded operational run records are private
PostgreSQL tables with RLS and no anon/authenticated/service-role access. Only the
existing server runtime roles receive the required privileges. Do not expose
owner UUIDs, baseline/private state or service controls in public DTOs/logs.

Public catalog revision reads are independently visibility-filtered and no-store:
an opaque/string fingerprint includes business content version and latest public
page revision. Draft edits, private messages and Auth activity do not advance it.
Public showroom/API snapshots read catalog and page in one read-only, repeatable
database snapshot, so a concurrent stage cannot mix old products with new copy.
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

GIVEN an explicit private enrollment request WHEN the disabled worker processes
it THEN current versions/identity and the ordinary enrollment contract govern it,
partial preparation rolls back on refusal, and simulation stays disabled.

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
disabled deployment, canary and recurring readback. Master §§15–17/20/22 describe
the qualified service.

## Evidence:

[Traceability S194](../TRACEABILITY.md#s194-scenario-driven-demo-activity--qualified-and-deployed)
records source-bound domain/PostgreSQL/browser/native checks, the protected
functional merge and the monitored three-demo production rollout. The operating
inventory retains the current cohort, budgets and pause/recovery contract.
