---
id: BE-057
title: Editable ordered transport plans with read-only sharing
status: ready
related: [BE-058, BE-018, BE-044, BE-050, FE-068, DEP-047]
owners: [backend, security, operations]
last_updated: 2026-10-18
change_level: L3
---

# BE-057 — Ordered transport plans

## Problem and scope

S137 lets authorized transport staff arrange several providers into one journey
for an existing visitor or business-owner transport request. The saved plan is
visible to its requester and through a separate read-only share link. It is a
planned sequence, not booking, delivery confirmation or tracking.

Include provider name, transport method and origin/destination for every ordered
leg. Staff may edit after chat ending/resolution without reopening it. Preserve
legacy private company handoff/contact events; never backfill public plans from
them. No dates, ETA, prices, scan endpoint, current-custodian field, carrier
catalog, external integration or notification/email send is introduced. Future
scans require a separate accepted contract; plan order is never evidence of the
current physical location or provider.

## Contracts and invariants

- A plan belongs to exactly one `shipment_observation` conversation, visitor or
  client initiated. One private aggregate per conversation, with its own positive
  version, actor and update timestamp. New plan expects version0.
- Save replaces the complete ordered array atomically with expectedVersion and
  matching publicRef. Accept1–12 legs; providerName/origin/destination are literal
  Unicode text, trimmed/collapsed whitespace,1–120 characters, no controls/HTML
  interpretation. Method is exactly `air|truck|van|car|motorcycle`. Unknown keys,
  duplicate/foreign existing leg IDs, invalid types and excessive sizes fail.
- Stable plan-scoped UUID leg identities survive rename, route/method edits and
  reorder. New input has id:null and receives a server-generated ID. These are
  plan identities, not an invented external provider registry or scan integration.
- Repeated provider names are valid. The public summary counts transport legs;
  it must not claim a distinct-company total from mutable display names.
- Fresh database authority on every write: platform admin/operations manager or
  the current assigned, transport-scoped team member, with current role/access.
  Reassignment/demotion wins over an old session or an open editor. Closed or
  resolved chat alone does not remove that authority. Lock the case and plan;
  conflict preserves saved state and the caller's draft can be retried deliberately.
- Plan save/audit changes no chat status, Join, assignment, read receipts,
  last-message timestamps, inactivity/deadline clocks, messages or alert events.
- Saving explicitly publishes these safe plan fields to the requester and creates
  its separate share capability. UI states that visibility before Save. Same
  semantic retry with the old expected version may return the identical saved
  result; it must not duplicate events or silently overwrite a different plan.
- Replace share link is an explicit, version-fenced, confirmed staff command.
  It revokes the old link while preserving plan/leg identity and order. Re-copy
  returns the existing link; ordinary reads never create or rotate capabilities.

Public portable DTO: `{version,legs:[{id,providerName,origin,destination,method}]}`.
Optional `transportPlan` and `transportPlanLink` additions to existing visitor/
owner transport responses remain backward compatible. No requester/staff name,
phone/email, goods/intake, conversation/business ID, transcript, contact, private
note/handoff, editing authority, ETA or scan status enters the shared projection.
Leg locations are explicitly authored public fields, never copied automatically
from private intake. Participant projection is read only after existing guest or
tenant authorization, never by accepting a client conversation ID as authority.

The share capability is purpose-separated from chat/session tokens and public
references. Store a private random nonce and lookup hash; derive a re-copyable
opaque bearer using the existing domain-separated server HMAC, without a new
secret/configuration change. Rotation changes nonce/hash atomically. Do not log
bearers, share URLs, customer content or full request headers. Audited snapshots
retain actor/version/ordered public fields but never raw capability or private
handoff content. Runtime-only grants/RLS protect the new table and audit data.

## HTTP/read ports

Use a server application module and a pure domain/contract module, with no
Next/SQL/vendor imports in the pure rules. Authenticated staff adapters recheck
same-origin, body/field bounds, fresh role/case authority and optimistic version.
Expose safe typed invalid/forbidden/not_found/conflict errors, not SQL or secrets.

- Shared web page `/transport-plan#<capability>` receives no token in its HTTP
  path/query. Dedicated web GET `/api/transport-plan` and mobile GET
  `/api/mobile/v1/transport-plan` accept only the separate capability in an
  Authorization bearer header; no cookie/JWT/chat token grants this scope.
- Validate capability and revocation before conditional `If-None-Match` handling.
  A header/version read returns304 without legs for an unchanged valid token;
  changed plan returns200 with the allowlisted DTO and ETag. Invalid/revoked/
  absent links return the same404. Never return304 for a revoked link.
- Private/no-store, no-referrer, noindex/noarchive/nofollow, no third-party
  analytics on the share surface. HEAD has the same authorization/status/headers
  without a body. No public mutation methods. Exact existing mobile CORS origin
  rules remain; permit conditional headers and expose ETag only as needed.
- Bound abuse through existing private IP-derived limits, without raw IP/token
  storage or a write-heavy per-message loop. No hosted realtime/socket service.
  Public plan polling is single-flight every5s only while visible/active,10s
  request timeout, error backoff capped30s, immediate focus/online refresh and
  cancellation/stale-response fencing. ETag/body remain only in memory.

## Scenarios

DEP-047 documents the installed development server's generic-HTML cache-header
override. The production share-page private/no-store requirement remains a later
build/header gate; local API private/no-store is required without exception.

GIVEN a current transport assignee WHEN saving three valid legs THEN all are
persisted in order in one versioned transaction with safe audit and no chat change.
GIVEN an ended/resolved request WHEN that assignee edits name/order/method/route
THEN the plan changes and the chat remains ended/resolved with unchanged clocks.
GIVEN concurrent editors or reassignment/demotion WHEN the stale writer saves
THEN reject safely and preserve the winning plan and all private history.
GIVEN a requester/other tenant/support-only/unassigned account WHEN editing or
rotating THEN deny even if it forges IDs, version or an old staff session.
GIVEN a saved plan WHEN an authorized requester or link holder reads THEN return
only the public projection in current order, never private conversation fields.
GIVEN a valid unchanged ETag THEN304; GIVEN rotated token with the same ETag THEN404.
GIVEN ordinary read/re-copy/retry THEN no capability churn, extra event or chat write.
GIVEN malformed/oversized legs, foreign IDs or unknown method THEN no partial save.

## Test plan and observability

Tenant/privacy, stale/concurrent permission, denial and atomicity tests require
real isolated PostgreSQL. Planned tests: `scripts/test-transport-plan.ts`,
`scripts/test-transport-plan-migration.ts`, `scripts/test-transport-plan-http.ts`
and `scripts/test-transport-plan-mobile.ts` (actual mobile adapter/CORS/conditional
read boundary).
Map every invariant, no-op/retry/audit, old-client DTO omission, isolation and
token rotation/304 ordering. Existing support/owner/receipt tests remain required;
update exact schema expectations only to the new genuine latest migration.
Safe metrics contain outcome/code/version counts, never routes/labels/tokens.

## Readiness and rollout

Ready: product intent, bounded fields/count semantics, sharing/privacy, lifecycle
independence, permissions, tests and compatibility are resolved. FE-068 controls
UI/locale/browser evidence; DEP-047 controls additive migration70, protected local
backup/apply/readback and later coordinated deployment. Master §§5/12/13/18/19/22
are affected. No production or provider mutation is authorized by implementation.

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
