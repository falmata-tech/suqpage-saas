---
id: BE-050
title: Scoped notification events and confirmed chat reads
status: in_progress
related: [FE-062, DEP-043, ADR-0026, BE-001, BE-018, BE-044]
owners: [backend, security]
last_updated: 2026-10-07
change_level: L3
---

# BE-050 — Scoped notification events and confirmed chat reads

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
expired tokens and forged high cursors. Receipt/first-join writes are idempotent.
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
one waiting alert; assignment alerts the new agent and participant, with a separate
join event only after an explicit visible-thread acknowledgement.
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
