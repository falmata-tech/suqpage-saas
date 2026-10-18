---
id: DEP-047
title: Additive transport plan migration and coordinated rollout
status: ready
related: [DEP-048, BE-057, FE-068, DEP-031, DEP-042, DEP-043]
owners: [operations, backend, security]
last_updated: 2026-10-18
change_level: L4
---

# DEP-047 — Transport plan rollout

## Problem, scope and safety

S137 uses additive migration70 after current69. New private transport-plan rows
and safe audit events only; no migration of legacy handoff contacts/history into
public fields. No provider secret, hosted Auth/configuration write, integration,
paid service, push notification or scan-event source is added. Master §§12/22 and
BE-057/FE-068 define the local candidate and later release boundary.

## Rollout and ordered local procedure

1. Record dirty-tree baseline and exact local target. Test migration in an
   isolated PostgreSQL schema first:69→70, idempotent replay, constraints/RLS/
   runtime-only grants, private history fingerprint preservation and transaction
   rollback on invalid writes. Protect all real customer/tenant data.
2. Before applying locally, independently verify canonical loopback54322/project/
   schema and current version69, retain a protected native backup and restore
   procedure. No production URL fallback, linked CLI sync or bulk seed/reset.
3. Apply only the additive local migration, with bounded timeouts and sequential
   DB commands. Verify version70, exact new tables/grants and unchanged protected
   business/user/catalog/chat/receipt/assignment/history fingerprints. No backfill.
4. Only then enable the existing chat projection calls that read new plan data;
   adding code must not break active local transport polls before the table exists.
   Older clients omit optional fields; code rollback ignores the additive table.
5. Run bounded labelled staff/requester/shared-page workflows with before/after
   readback. They may create dedicated local test cases/plan rows only; no real
   chat, provider contact, production write or external message send.
6. Capture actual desktop/phone/Expo screens, obtain explicit visual approval,
   then full check/acceptance/release gates and task-scoped commit review. Existing
   S129–S136 and workspace/chat review gates remain separate and unfinished.
7. Hosted migration/web release, new Android bundle/App Links and distribution
   require their proper existing reviewed rollout process, backup and monitored
   verification. This local implementation does not perform them.

### Local development header distinction

The actual Chrome preflight found the installed Next development server forces
HTML `Cache-Control: no-cache, must-revalidate` in `base-server.js:1107`, after
configured headers. The generic share-page HTML contains no capability or plan
data; those are read only through the strictly private/no-store API. Preserve the
initial strict development preflight failure and record this exact framework
exception when continuing local journeys. Do not patch Next or inject an HMR
header to imitate production. Page/API no-referrer and noindex remain required
in local tests. Both APIs must retain private/no-store on every local response.

Production HTML must still return the configured private/no-store header. This
requires a real production-build/header check after visual approval; development
Chrome and source inspection do not establish it. Installed `send-payload.js:60`
preserves an explicitly configured Cache-Control header outside the dev override.
This distinction changes test-environment expectations, not production policy.

## Recovery and observability

Unexpected/ambiguous hosted operations follow DEP-029; no such write belongs to
this task. Local failure stops before application reads are enabled. Do not drop
the new table after saved plans exist; revert code independently or use an exact
protected recovery plan. Backups are private, excluded from builds and Git.
Record migration versions, safe outcome codes and case/plan counts, not raw tokens,
URLs, route labels, customer details or request headers. Shared pages/API are
non-indexed/private-no-store/no-referrer and excluded from analytics/third parties.

## Scenarios

GIVEN isolated schema69 WHEN additive migration70 is applied and replayed THEN
plans/grants exist once and protected chat/tenant history remains unchanged.
GIVEN a target that is not the independently verified loopback project WHEN a
local apply is requested THEN refuse before backup or mutation. GIVEN a failed
isolated rehearsal WHEN local activation is considered THEN do not apply/enable
the new table reads or touch a hosted target.

## Test plan and evidence

BE-057 isolated migration/security/concurrency/API tests; FE-068 actual-source,
polling/native and real browser tasks. Record exact current source hashes, local
backup/apply/readback receipts and failure classification before marking tested.
`status: done` also requires the applicable full gates and scoped commit; no
production completion claim follows from local migration or screenshots alone.

S138 supersession: BE-058/FE-069/DEP-048 replace chat-bound anonymous plan publication with email-verified independent shipments. Preserve the S137 local implementation/data and evidence; no deployment or visual approval is inferred.


### S142/S144 — retire the obsolete conversation transport feature

The current candidate uses independent BE-058 Tracking. Staff case-plan screens
and the old Transport company form are removed; authenticated stale actions fail
without writing. Historical APIs cannot re-enable anonymous plan access.

The owner explicitly authorizes one-time removal in both local and live of only
`support_transport_plans` rows and `support_events` of the exact types
`transport_handoff`, `transport_plan_updated`, `transport_plan_link_replaced`.
There is no separate plan-events table. Never delete conversations, messages,
assignments, accounts, other event types or independent `tracking_*` records.
This supersedes earlier preservation of those obsolete plan/handoff rows only;
all other privacy, authorization, transcript and data-integrity rules remain.

Before each environment's deletion, independently pin its project/host/schema,
inventory matching rows, dependencies and runtime authority, retain a protected
recoverable native or exact typed archive, and rehearse scoped restoration in an
isolated target. Lock and recheck exact row identities/content in one bounded
transaction, delete only those rows, and verify protected-row fingerprints.
Missing tables or zero matches are reported as no-ops, never invented changes.
A stale inventory, inaccessible backup or target mismatch stops before deletion.
An ambiguous hosted outcome stops all further writes pending exact recovery
direction; no broad sync, reset, cascade, Auth change or auto-restore is allowed.

GIVEN a verified target and rehearsed protected backup WHEN the authorized cleanup
runs THEN only the allowlisted obsolete rows disappear AND independent Tracking,
accounts, active/ended chats, messages and every other event remain unchanged.
GIVEN a wrong target, changed inventory or failed recovery rehearsal WHEN cleanup
is requested THEN it refuses before any data change. UI retirement is a separate
code rollout; data cleanup does not claim a new live app was published.
