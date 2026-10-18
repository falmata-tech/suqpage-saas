---
id: BE-059
title: Data-preserving MirtPage branding and compatibility
status: in_progress
related: [FE-070, DEP-029, DEP-049, ADR-0029]
owners: [backend, security, operations]
last_updated: 2026-10-18
change_level: L3
---

# BE-059 — MirtPage data and protocol compatibility

## Problem and outcome

Rebrand platform-owned presentation/default records without resetting the business
system or corrupting retained identities, permissions, uploads and delivery work.
The independent local push-worker compatibility phase is Ready: both web workers
may accept the exact legacy Suqpage and new MirtPage notification titles while
retaining all payload and internal-navigation validation. Sender titles, channel
IDs, subscriptions, delivery keys and hosted settings remain unchanged in this
phase. Data/default, sender and origin migrations remain draft until their exact
inventories, recovery and deployment plans satisfy DEP-049.

## Independent local Auth-guard readiness

The origin-only operations guard tranche is Ready for local implementation and
injected-port tests. It admits exactly three policies: `legacy` (Suqpage primary
and callback), `dual-old-primary` (Suqpage primary and both exact callbacks), and
`dual-new-primary` (MirtPage primary and both exact callbacks). Callback order is
Suqpage then MirtPage; each callback is its HTTPS apex plus `/auth/callback`.
Only legacy→dual-old-primary→dual-new-primary and a separately reviewed reverse
primary transition are permitted. No old callback removal, wildcard, www, query,
port, unrelated host or email/provider field is part of an origin transition.

New plans bind operation kind, source/target policy, full beforeimage and exact
patch into the approval digest. Expiring old version-2 plans are explicitly
refused before provider reads rather than silently reinterpreted. Existing
legacy OTP/template planning remains separately guarded. Retain exact project,
credential binding, owned private files, expiry, drift, one-attempt, bounded
no-redirect adapter and full readback checks. No provider/credential/runtime
change follows from implementing this local guard support.

GIVEN an unsupported tuple, illegal phase transition, mixed mail/provider fields,
old plan version or tampered phase WHEN planning/apply validates it THEN reject
before a hosted write (and before provider reads for invalid saved plans).
GIVEN a valid finite transition WHEN tested against an injected provider port
THEN its exact two origin fields alone may change AND unrelated fields and every
existing backup/credential/drift/readback fence remain enforced. Actual hosted
plan/apply still requires DEP-049/DEP-029 evidence and exact owner approval.

Local implementation evidence: the two operations/test files implement the finite
version-3 contract. The injected Auth-port/credential suite passes62 tests and
scoped strict types pass. Existing adapter/private-file/expiry/drift/attempt/full-
readback fences remain unchanged. Independent peer review is closed and these
tests pass in the completed76-group current application check. Release and
browser acceptance remain separate. No hosted Auth plan, credential read or
provider/DB action was performed by this guard tranche.

## Contracts and invariants

- Preserve tenant/user/Auth UUIDs, handles, products, roles, consent, media object
  keys, chats/messages, Tracking recipients/shipments and audit facts. No global
  SQL replace across customer-authored text, email addresses, social URLs or logs.
- Inventory platform-owned labels/defaults separately from historical records.
  Do not revive retired plans/subscriptions while renaming legacy defaults.
- Stable environment aliases, Auth metadata, cookies, storage keys, headers,
  HMAC/privacy salts, notification channel IDs, idempotency namespaces and database
  roles are compatibility identities, not display copy. Change only through an
  explicit versioned migration with dual-read/write behavior where needed.
- An unrelated domain/new app installation does not inherit browser/device state.
  Backend accounts and history remain; fresh sign-in/OTP/push enrollment may be
  required. Do not promise transfer of anonymous capabilities or unsent local lists.
- Existing delivery retries retain immutable payload/idempotency semantics. Drain
  or version pending jobs before changing their brand/origin; never resend blindly.
- New-domain API/actions/CORS/callbacks allow only exact reviewed origins. Keep
  old-origin API and active guest chat access during transition, not blanket301.

## Scenarios

GIVEN existing tenants and platform-owned defaults WHEN a reviewed brand migration
runs THEN only allowlisted defaults/labels change AND protected data fingerprints,
authorization and media resolution remain unchanged.

GIVEN an old app/session/job WHEN the new brand is introduced THEN its compatible
protocol remains usable or has a documented recovery path AND no duplicate mail,
cross-tenant access or fabricated identity adoption occurs.

GIVEN either web push worker WHEN a valid notification uses the exact Suqpage or
MirtPage title THEN it can display and open only the existing safe internal
destination AND unrelated titles, invalid fields and unsafe destinations remain
rejected. This local dual-read change does not claim old installed workers have
updated or authorize a shared sender-title cutover.

GIVEN changed inventory, missing recovery evidence or unexpected hosted outcome
WHEN apply is considered THEN stop before further writes; restore is separate.

## Test plan

Explicit brand-row/default inventory; isolated migration/replay/rollback tests;
before/after protected fingerprints; existing/new environment precedence;
Auth/session/tenant/channel/token/idempotency compatibility; old/new host API and
role tests. No customer rows or secrets in public evidence.
Worker regression tests execute both scripts with legacy/new/foreign titles and
invalid or hostile payloads, preserving audible/quiet behavior and safe tap
navigation. Do not weaken existing validators to admit arbitrary branding.
`scripts/test-attention-worker-brand-compat.cjs` passes ten executable worker
tests, with the inherited `scripts/test-attention-platform.cjs` also passing.
This is local VM/port evidence; it does not establish a deployed worker update or
OS/provider delivery. Pending data/default, sender and domain phases are not done.

## Rollout and rollback

Use the retained Supabase/Storage identities by default. Each change gets an exact
target, protected backup, digest, rehearsal and readback under DEP-049/DEP-029.
No destructive project recreation or bulk customer rewrite is authorized by this
scoped local phase. Preserve historical migration bodies and release evidence.
