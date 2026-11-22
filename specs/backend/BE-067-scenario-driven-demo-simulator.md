---
id: BE-067
title: Scenario-driven demo marketplace simulation
status: in_progress
related: [BE-049, FE-061, BE-009, FE-079, DEP-054, ADR-0034, BE-055, BE-054, BE-035]
owners: [backend, security, operations]
last_updated: 2026-11-18
change_level: L3
---

# BE-067 — Scenario-driven demo marketplace simulation

## Problem, outcome and scope

Operate a dedicated service that advances realistic, predefined demo situations
through coordinated changes over time. Early visitors should see marketplace
activity at three scheduled daytime moments in Ethiopia. Ordinary business/
product application writes and public reads must carry those changes; no
simulated API success or UI-only values.
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
Stage copy states the current product, capacity and timing directly. The page's
single “Example business” badge identifies the fictional tenant, so simulator
updates and lead-time summaries must not add “example”, “fictional” or similar
disclaimers. Changing the wording leaves stage keys, durations, eligibility,
availability, quantities and prices intact; prior published versions remain in
immutable history. A finite guarded correction of already published copy is
separate from deploying the recurring template fix.
The one-time S200 copy operator accepts only the reviewed 64 public demo IDs
that still have stale wording (the two already clean pages are excluded).
It requires an explicit operator pause, exact business handle and current
content/draft/publication versions; enrolled businesses also require their
acknowledged state hash and stage/cycle/due time. An exact version-one
old-to-new stage map and the business-name story pattern permit no free-form
replacement. For enrolled pages, the operator updates only the already
published simulator-managed draft mirror, appends a page publication, publishes
changed product descriptions/lead times through ordinary upkeep, updates the
public business summary and enrollment baseline, then acknowledges the new
state hash without changing progress. The two ownerless portfolio demos use
the existing exact admin authority path and do not gain enrollments. Current
contacts, media, categories, selling facts, real tenants, private unpublished
work and immutable prior publications remain unchanged.
Each business is atomic, idempotent and audited with selected public before
text for an exact guarded inverse. Any drift or late failure rolls back its
whole transaction; the worker records a sanitized rejection and stops that
business. The request is assembled inside the database while paused, so
private simulator bindings and page/contact rows are not exported.

### Reviewed showroom About stories

Given a reviewed public demo identity, its four catalog products, the original
About text and the expected draft and publication versions, when an operator
publishes its authored story while the simulator is explicitly paused, the
ordinary page writer creates one revision. Only the About field and the enrolled
demo's About baseline and expected hash change. The operator verifies the public
result before continuing. A changed page, catalog, enrollment or simulator state
refuses the write. A duplicate preserves the revision. Retained page history
and the prior simulator baseline support a version-fenced reversal.

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

A fixed minute slot plus PostgreSQL locking prevents overlapping/replayed
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
scheduled tick admits at most four due businesses; the oldest due business runs
first, and each business advances at most one stage in that tick. Start no new
stage after 12 seconds of invocation work, or when the previous full stage's
duration (at least an eight-second reserve) plus three seconds for final work
would reach PostgreSQL's 23-second transaction deadline. Netlify also limits
the function to 30 seconds. The runtime allows at most 12 successful stages per
UTC day and also respects any tighter private control-row limit and the existing
256MiB database limit. The historic
installed control row may still report 2,880; that value does not override the
runtime cap. With 64 businesses, one rotation needs at least 16 successful ticks:
roughly six days at four per tick or 22 days at one per tick, with three ticks
daily. Each stage moves its entire current catalog together. Do not promise a
daily rotation or raise provider billing.

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

An operator may correct the six current public growers through one
private, disabled-only `category_correction_batch` request. The finite cohort
binds business IDs 5, 6, 27, 29, 31 and 33 to their exact handles,
owner/provider identities, four sorted product IDs per business, current
simulator hash and progress, and content/draft/publication versions. All six
must have reviewed version-one
`agriculture-growers` owner proposals whose update matches approved discovery.
The two food mills (28 `demo-laga-grain-mill`, 32 `demo-wabi-flour-mill`)
retain only their existing `food-farming` membership and are outside this
correction: adding agriculture would make it their primary visual category
under BE-023. All six must remain active demos with complete enrolled catalogs
and exactly the `food-farming` public membership. The three seed handles absent from production
and all real or draft businesses are excluded. The operation requires no
existing agriculture membership and adds it while retaining food membership.

The reproducible local demo seed must reflect the already corrected public
category outcome: the same six reviewed growers have both Agriculture and Food
& drink memberships, with Agriculture as their reviewed primary; the two
excluded food mills remain Food-primary. This seed parity is not authority to
re-run a hosted category correction or resume the simulator.

GIVEN a fresh local seed WHEN the six reviewed growers and two excluded mills
are queried THEN the growers each have both category memberships, the mills
have Food & drink only, and no other demo category is inferred from a name.
It acknowledges the new sorted category set in each primary and catalog
scenario binding and recomputes the enrollment hash. One transaction covers all
six or none. A single operation key and audit receipt make replay inert.
Stage, cycle, due time, reviewed primary proposal, page, products, media,
geography and all other tenants remain unchanged. An overlong transaction fails
closed under the worker deadline. This finite operator path does not infer
future category changes or enable the simulator.

GIVEN a drifted member, changed review, foreign product, or late insert failure
WHEN the batch runs THEN no membership or enrollment is partly corrected. GIVEN
a valid reviewed batch WHEN it commits THEN all six remain active and their next
scheduled stages advance without a `content_changed` pause. GIVEN replay before
or after later stages THEN no second mutation or audit receipt is created.

The dedicated Netlify schedule runs at 09:00, 13:00 and 17:00 Ethiopia time
(06:00, 10:00 and 14:00 UTC). The adapter admits a run only within 15 minutes
of a scheduled time; an hourly slot prevents another stage from a manual retry
in that window. At most four due business stages may advance per tick, each
updating its complete enrolled catalog under S196. Legacy single-product
canaries remain compatible until explicitly upgraded. Keep at least one usable
published product in a full catalog, and an additional companion for legacy
single-product plans.
Use an execution deadline with room inside
Netlify's 30-second limit. A server-only control starts disabled, supports pause,
and enforces explicit per-day mutation and database-size budgets. Budget pressure
pauses demo work; it never deletes immutable history or blocks real users.

Operator enrollment requests are private database records, never an HTTP/admin
endpoint. The disabled ordinary worker admits at most eight explicit requests
per tick, starting no new admission after its 12-second work budget, using
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
| Coherent full timelines, predefined values and direct visitor copy | `scripts/test-demo-scenarios.ts` |
| Mixed tenants/new signup/drift/replay/concurrency/rollback | `scripts/test-demo-simulator-postgres.ts` |
| Exact reviewed category batch request shape | `scripts/test-demo-scenarios.ts` synthetic parser case |
| Six-grower atomic category correction, excluded-mill refusal, late failure, drift, replay and later stage | Private disposable PostgreSQL fixture retained outside public source; publication qualification pending |
| Local seed keeps the food mills outside Agriculture and Food-primary | `scripts/test-scale-fixtures.ts` |
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
