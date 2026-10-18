---
id: DEP-048
title: Safe verified-recipient tracking migration and delivery rollout
status: in_progress
related: [BE-058, FE-069, DEP-047, DEP-029, DEP-043]
owners: [operations, security, backend]
last_updated: 2026-10-18
change_level: L3
---

# DEP-048 — Verified tracking rollout

## S141 additive72 and creation/access separation (ready)

BE-058/FE-069 S141 permit staff creation for valid emails before verification.
Migration72 drops only tracking_recipients.verified_at NOT NULL, retaining its
nonnegative CHECK and all IDs/FKs/ACLs/data. NULL means not verified, never a fake
timestamp. Rehearse71→72 on isolated PostgreSQL with grants/invariants/data
preservation and concurrent staff Submit/recipient OTP tests before any shared
local mutation. Independently verify canonical loopback54322/project/schema71,
retain protected native archive/inventory/digest, quiet only the owned worker,
apply sequentially once and verify72 plus unchanged prior-table fingerprints.
Only then activate/rerun local writes. No hosted migration/config/credential change.

Initial plan email no longer waits for verification; portal data still requires
the recipient's successful OTP session. Use local Mailpit and existing bounded
outbox only; no external recipients, bulk sending or fabricated delivery claims.
Legacy case plans remain private/read-only; do not restore anonymous publication.
Rollback disables new creation or reverts compatible application code while
retaining nullable state/data; never fabricate verification or reapply NOT NULL
over legitimate pending recipients. A restore needs separate exact direction.
Full gates/commit/rollout remain distinct after visual approval.

## Problem, scope and rollout procedure

S138 requires additive migration71 after local70. New recipient/challenge/session,
shipment/audit and durable email outbox tables use RLS/runtime-only permissions.
Do not alter/delete schema70 plans, user-owned local case327, chats, accounts or
private handoffs. Do not infer recipients or auto-publish/backfill plans.

1. Freeze dirty baseline, record Ready and test isolated migrations/constraints/
   grants/replay/rollback and existing-data preservation before application reads.
2. Independently verify exact canonical loopback54322/project/schema70 and retain
   protected native backup/inventory/digest. Run sequential bounded local additive
   migration only, verify71/ACLs and unchanged prior-data content fingerprints.
3. Only then activate new endpoints; retire anonymous legacy reads and participant
   projections coherently. Legacy data remains staff-private. Fail closed before
   table readiness; no production fallback, bulk reset or restore.
4. Use existing Mailpit with strict local target guards for all local OTP/details
   tests; no external mail/push. Sender lease/backoff/idempotency and fresh job
   eligibility must be verified. Retain safe outcome metrics, not codes, emails,
   sessions, capability URLs, request headers or raw customer records.
5. Run real labelled web/Expo/staff tasks with protected before/after evidence;
   do not modify user327 or globally expire chats. Record browser limits honestly.
6. Explicit visual approval precedes expensive full gates and production build.
   Then applicable check/acceptance/release/operations plus scoped commit review.
   No hosted migration, credential change, new Android build or release here.

## Test plan and rollback checks

Rollback must not restore anonymous access to new recipient shipments. Disable
the tracking surface safely rather than broadly reverting to legacy publication.
Keep additive tables/data; any restore needs exact reviewed recovery direction.
No hosted Auth/provider configuration changes or new secret is required. Existing
Resend target/credentials remain governed separately; an absent provider defers
email honestly and never claims a successful send. Later hosted rollout requires
backup, coordinated schema/code/worker activation and monitored verification.
Both pages/API no-referrer/noindex; API private/no-store. DEP-047's installed dev
generic-HTML no-cache override is retained as an explicit local-only distinction;
real production private/no-store remains a later build/header gate.

## Scenarios

GIVEN isolated schema70 with existing private plans WHEN applying71 THEN new tables
are runtime-only and all previous content stays unchanged. GIVEN email provider
failure WHEN retrying an eligible leased job THEN preserve bounded retry state
and never claim delivery. GIVEN no visual approval THEN no full/release gate.

Focused worker evidence is mapped to `scripts/test-local-chat-worker.ts` and
`test-scheduled-attention-worker.ts`; pre71 readiness, failure isolation, bounded
work and logs are covered. Protected local apply evidence is retained under
`.local/tracking-s138/local-migration/`, never in Git as a raw database archive.


S142/S144 clarification (2026-10-18): there is no retained legacy plan UI. The
separate authorized cleanup removed4local obsolete plans and9allowlisted events
with rehearsed recovery and70protected-table fingerprints unchanged. Live schema63
had no plan table and zero matching events, a verified no-op. This is neither a
Tracking rollout nor permission to remove other chat/account/shipment history.
