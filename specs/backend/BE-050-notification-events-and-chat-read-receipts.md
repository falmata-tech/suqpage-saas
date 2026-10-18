---
id: BE-050
title: Scoped notification events and confirmed chat reads
status: in_progress
related: [BE-055, FE-062, DEP-043, ADR-0026, BE-001, BE-018, BE-044, FE-019, FE-053, BE-057]
owners: [backend, security]
last_updated: 2026-10-17
change_level: L3
---

# BE-050 — Scoped notification events and confirmed chat reads

## S126 — fair assignment deadlines and admin escalation emails (ready)

Newest owner steering adds operational email alongside the existing in-app alert;
this is not account email editing. Keep S125 explicit Join and inactivity proof.
GIVEN assigned work has an unanswered participant cycle WHEN ten minutes pass
after the later of the oldest unanswered message or current assignment time THEN
show Overdue and alert current authorized assignee/managers. Join/read/note events
do not count as replies. Reassignment grants the next staff member their own
response window without rewriting the original customer wait or history.
Unassigned queue work retains a ten-minute queue-overdue alert, without an email
blaming an unassigned staff member. No public timing promise or numerical cap.

GIVEN an assigned cycle first becomes overdue for the current assignment THEN
atomically persist one per-admin/operations-manager email job alongside the
internal attention event. Deduplicate by conversation/message/current assignment/
recipient; retries preserve provider idempotency. Staff alerts remain in-app;
admin emails contain only queue/reference, assigned staff identity and an
app-authorized dashboard link, never customer name/contact/message/route details.
Recipients and target are canonical, freshly role-checked at dispatch. Old cycles
receive no catch-up email flood. New assignment cycles can escalate independently.

GIVEN the customer is answered, chat ends/resolves, assignment changes or recipient
loses authority before delivery THEN ignore stale jobs. Bounded leases, attempts,
24-hour job expiry, generic failure categories and recoverable missing config
preserve safe behavior. Use a typed email port and the existing Resend provider
with a stable idempotency key; never write provider credentials/configuration.
Actual local preview uses the already installed, verified loopback Mailpit only;
no external test emails. Local inbox capture proves dev delivery, not Resend inbox
arrival. Provider acceptance is not a human-read claim.

Additive migration69 records assignment-scoped escalation markers and a private
email outbox tied to existing attention events. Preserve all rows/history and
suppress previously notified/legacy cycles; rehearse rollback/no-op and protect
local before-images. No hosted mutation is authorized. Email dispatch is bounded
and independently failed within existing local/hosted minute workers; no new
schedule/dependency. Keep notification/maintenance budgets and sanitized logs.

Tests cover assignment/next-reply boundaries, one-per-cycle/assignment races,
recipient/tenant/privacy/role changes, answer/end/reassign suppression, provider
idempotency/retry/expiry/config failures, migration preservation and worker bounds.
Actual Chrome staff/admin + real local Mailpit readback supplements S125 paired
web/Expo journeys. Focused checks precede explicit visual approval/full gates;
unchanged native Join/receipt behavior remains under S125 evidence.

Focused verification maps to `scripts/test-support-assignment-response-migration.ts`
(schema69/backfill/no-op), `scripts/test-support-assignment-response.ts` (assignment
fairness, atomic manager jobs, old-writer recovery and bounded candidates),
`scripts/test-support-escalation-email.ts` (localized private content, provider
bounds, effective-target rejection), `scripts/test-support-escalation-email-delivery.ts`
(fresh authority, leases, deduplication, retries and stale suppression), and the
local/scheduled worker tests (isolation, order and execution budget). The named
`npm run test:support-escalation` chain is included in `test:support`; full gates
remain subject to the current visual-approval requirement.


## S125 — explicit acceptance and overdue attention (ready)

This contract supersedes every earlier first-visible-read/first-join coupling.
Reads confirm only the actually visible opposite-side messages. They never join
an agent. Automatic assignment/reassignment is staff-only attention; customer
feeds and deliveries must not announce internal assignment, including previously
queued assignment alerts. Only the assigned staff member's explicit Join chat
command creates customer joined attention, exactly once per current assignment.
Legacy implicit joins do not satisfy explicit acceptance. Preserve read cursors,
transcript/event history, tenant/queue isolation and stale-assignment fences.

GIVEN an unanswered cycle exceeds the BE-018 ten-minute internal target THEN a
new reply_overdue kind alerts the current authorized assignee and managers once
per cycle, with generic private notification copy and no contact/transcript data.
GIVEN the cycle is answered, ended, replaced or authorization changes before feed
or dispatch THEN suppress obsolete attention. No customer overdue alert, no
historical push flood, no extra provider or polling-triggered writes.
Tests: isolated response/join/attention and visible-read regressions, worker
failure/budget tests and real local Chrome/Expo paired journeys. See BE-018,
FE-019, FE-053, FE-062 and DEP-043; all existing rollout gates remain.

## S119 — reliable visible-read boundaries (ready)

The reported local workflow requires actual browser/API verification; older
passing receipts do not establish current behavior. Preserve the existing
monotonic, current-assignee, tenant/token and public-audience rules.

- GIVEN an incoming message footer is visible while a newer reply is below the
  viewport WHEN the focused participant reads it THEN acknowledge the highest
  actually visible incoming ID, without waiting for the newest reply or marking
  an unseen message read. Native observation must batch work per transcript.
- GIVEN asynchronous visibility measurement WHEN focus, app state, overlay or
  conversation identity changes before it completes THEN discard that measurement;
  no hidden/background/covered message is acknowledged. Web viewport offsets and
  clipped scroll containers must be respected in the same coordinate system.
- GIVEN the same assigned agent rejoins after reassignment/reopen WHEN an earlier
  admitted message is still visible THEN the new authoritative join epoch permits
  one idempotent acknowledgement even if that message ID was read previously.
  A manager inspecting another agent's chat must never join or read for them.
- GIVEN an authorized business colleague posts to an account-owned conversation
  WHEN the assigned agent reads that participant-side message THEN confirm it as
  incoming and project its receipt consistently. New messages must preserve the
  sender side at send time; changing a user's role later cannot reinterpret old
  transcript authority. Do not infer ambiguous historical roles or expose notes.

BE-018/FE-019/FE-062/FE-053 supply routing/lifecycle/client contracts. Focused
tests must reproduce the visibility/focus/epoch/colleague failures, plus actual
local Chrome back-and-forth. Master §§13,15,19,22 are affected. No production or
new Android artifact is included in this local defect audit.

## Problem and outcome

Owners can miss inquiries; staff and visitors can miss chat changes. Existing
chat GETs advance read watermarks without evidence that messages were visible.
Persist retry-safe attention events and explicit participant read acknowledgements.

## Scope

Owner inquiry alerts; owner-support and guest-transport assignment, joining,
public replies, waiting queues, reassignment, end/reopen. Durable per-recipient
unread alerts, preferences/subscriptions and bounded push-delivery outbox.
No general guest support, buyer accounts, typing simulation, read claims from
fetches, public internal notes, new payments or hosted Realtime dependency.

## Domain language and invariants

A notification is an attention event, not a message-read receipt. Alert read and
transcript read are separate. Assignment is not joining or online presence.
Confirmed reads are monotonic, tied to an admitted visible message in one chat.
Only the current assigned agent can join/acknowledge the staff side; managers
may inspect without pretending the assigned agent read it. A sender's own post,
poll, server render or background fetch cannot confirm the other side's read.
Internal notes, attachments and carrier details never enter public receipts/push.
Existing historical watermarks are retained but cannot establish confirmed reads.

## Contracts

GETs are no-store and read-only. Explicit bounded POST read commands carry the
last visible message ID, current conversation reference and existing cookie or
verified principal. Deny stale assignees, foreign messages, wrong channel/tenant,
expired tokens and forged high cursors. Read receipt and explicit Join writes are independently idempotent.
Persist notification events with the source inquiry/message/assignment/lifecycle
transaction; unique source/recipient keys suppress replay. Recipients are current
owners, current assignees and enabled matching queue staff/managers for waiting
work; native staff remains denied. Recheck permission/session before projection
or delivery. Closed chats do not allow public messages; private follow-up stays
private. Unassigned/reassigned/ended/reopened work remains discoverable.

Private PostgreSQL tables/indexes and additive migration preserve histories.
Bound feeds and deliveries; cursors are server IDs, not client authority. Device
subscriptions require opt-in and tenant/token binding; connected sign-out revokes
bindings. Offline native sign-out still clears the session immediately; revocation
cannot reach the server until connectivity returns. Generic OS text and permission
rechecks limit exposure, and subscriptions expire. This limitation must not be
represented as guaranteed immediate offline revocation.
Push payloads contain generic localized event text and safe internal destinations,
never contacts, goods details or transcript. Validate provider endpoints/tokens;
external dispatch cannot accept arbitrary URLs. Provider failures retain committed
events; bounded retries and expired-subscription cleanup never replay messages.
Mark all read acknowledges only authorized alerts through a returned server cursor;
it does not acknowledge any transcript or future event. Show stored notification
opt-in independently from sound, and allow turning notifications off.

## Scenarios

GIVEN a new canonical inquiry WHEN commit succeeds THEN its owner gets one alert;
idempotent submission yields no second alert and another tenant sees none.
GIVEN an inquiry for an existing business without a client owner THEN alert
platform/operations managers rather than dropping attention silently; support/
transport agents do not gain business-inquiry authority. Its destination resolves
the exact inquiry and business server-side, even after a role association changes.
GIVEN enabled scoped staff WHEN matching work is unassigned THEN the team receives
one waiting alert; assignment alerts staff internally. The participant receives a
join event only after the current assignee explicitly clicks Join chat.
GIVEN a public reply WHEN saved THEN alert the opposite participant; private notes
produce no public event or receipt and retry causes no second event.
GIVEN a chat GET or hidden view THEN confirmed reads do not advance. GIVEN a focused
visible message and valid acknowledgement THEN advance only that side monotonically
and expose Sent/Read truthfully to the sender. Foreign/stale acknowledgements fail.
GIVEN an ended/reopened/reassigned case THEN preserve history, release/retain capacity
according to BE-018 and alert appropriate participants without exposing lost access.
GIVEN permission denial/offline/provider outage THEN retain unread events and input,
retry safely and never claim delivery/read or roll back an inquiry/chat.

## Quality impact and observability

Tenant/queue/session privacy applies to reads, feeds, subscriptions and dispatch.
Indexed bounded queries; no full transcript polling for global alerts. Safe logs:
event IDs, attempt counts and provider error categories only. No token/endpoint,
credential, contact or body logs. Localized payloads preserve literal merchant data.

## Test plan

| Criterion | Level | Test path |
|---|---|---|
| Reads, joins, privacy, negative cursors and migration retention | PostgreSQL/security | scripts/test-chat-read-receipts.ts |
| Event scope, deduplication, preferences and provider failures | integration | scripts/test-attention-notifications.ts; scripts/test-attention-platform.cjs |
| Owner/staff/visitor real back-and-forth and visibility | browser | scripts/capture-notification-workflows.mjs |
| Native role/tenant/token commands | API | scripts/test-mobile-api.ts |

## Rollout and rollback

DEP-043 controls additive backup/migration/API/web/native order. Retain events and
receipt columns on code rollback; disable external delivery independently. No hosted
configuration/credential write is authorized by local implementation. Background
coverage is the stated default pending the owner's optional scope reply.

## Readiness checklist

- [x] Explicit scope/non-goals, contracts and positive/negative scenarios
- [x] Reciprocal FE/BE/DEP/ADR links and scoped ports
- [x] Privacy, performance, test and rollback contracts
- [x] Local core implementation independent of provider credential admission

## Completion evidence

Local 61/62 backup/hash retention and focused event/receipt/privacy/provider/HTTP/API
tests pass. Actual web/Expo visibility/join/inquiry/receipt flows pass.
Visual/full gates/commit/rollout and real OS delivery remain pending.


## S105 social-contact revision

FE-066 / BE-055 supersede new customer messages to business inboxes. Only
configured social accounts receive visitor handoffs; chosen products and the
simple message follow the active UI language. Retained private history stays
scoped. Public transport chat and authenticated owner support remain unchanged.
Local implementation and review evidence are tracked in checklist S105.

## S119 local verified evidence — review and rollout pending

`scripts/test-visible-chat-reads.ts` executes actual React web/native controllers;
the related focused component set passes20/20. Isolated PostgreSQL receipt tests
prove schema65→66 message/state preservation, nullable legacy sides/no backfill,
new colleague participant reads, role-change history, stale-actor send denial,
foreign/self/private cursor rejection and safe rejoin. The owner-transport adapter
suite also passes. Both final typechecks and localization17/17(1577keys) pass.
Migration66 is backed up, rollback-rehearsed, applied and replayed only on the
verified local database; protected history and unrelated data remain unchanged.

Actual Chrome transport back-and-forth and worker ending are independently
reconciled in `.local/chat-reliability-s119/worker-actual-verified.json`. Actual
Expo390 APIs/UI prove assigned/joined, reading the older visible reply while the
newer footer remains off-screen, both-direction Sent/Read and ending in
`.local/read-receipts-s119/native-live/attempt-4-runtime/workflow-reconciliation.json`.
The original strict receipts remain failed for documented harness findings;
reconciliation records functional proof without relabelling those gates. No
application runtime exception or API failure occurred in the final workflows.
Focus/route controls are explicit; no installed Android or OS delivery claim is
made. Visual/full/release/commit/hosted/new-binary gates remain pending.

Actual owner Account→Support creation and the same-case continuation also pass
in installed Chrome, with both saved read cursors, reply and ordinary Close.
Evidence: `.local/read-receipts-s119/owner-live/continuation-321/verified.json`;
six continuation screenshots, zero runtime/API/unexpected-write errors. The
original hidden-link harness failure remains retained; no new fixture was made
for continuation. Guest, owner and staff UI evidence is local, not device/hosted.
