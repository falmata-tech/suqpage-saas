---
id: BE-058
title: Email-verified recipients and independent shipment plans
status: in_progress
related: [BE-057, BE-044, FE-049, FE-053, FE-069, DEP-048, ADR-0031]
owners: [backend, security, operations]
last_updated: 2026-10-18
change_level: L3
---

# BE-058 — Verified recipient shipments

## Transactional Gmail option (ready; ADR-0031)

The independent code and initial-details jobs retain their saved locale/snapshot,
purpose, expiry, fresh eligibility checks and bounded leases/retries. Hosted
dispatch may explicitly select TLS Gmail SMTP using a server-only app password;
local previews remain isolated in Mailpit and the existing Resend route remains
available. A missing/invalid hosted Gmail setting defers the job without sending
through Resend. A verified SMTP acceptance is not inbox delivery or proof of
verification. A stable Message-ID does not prevent every duplicate after an
ambiguous timeout, so no exactly-once claim is made. Test no local fallback,
invalid recipients/headers/configuration, permanent versus temporary SMTP errors,
stable identity and unchanged recipient authorization. DEP-048 owns hosted rollout.

## S145 follow-on — provider tracking details (backend locally verified; UI/rollout pending)

The latest owner direction names the active feature **Shipment tracking**.
FE-069 owns visible terminology and web/native tasks; DEP-048 owns additive75
and rollout. These are optional authored carrier details, not an integration.
Root reviewed and accepted this controlling contract before implementation.

Each active Tracking leg may have an independent `trackingUrl` and `trackingCode`.
Use Tracking-only leg/input types; do not widen the retired BE-057
`TransportPlanLeg` or parser. Missing/null/empty legacy values normalize to empty
strings on read/command parsing without rewriting existing JSON, events or mail
jobs. New semantic equality includes both fields. Before later shipment edits,
retrying an old accepted Submit with identical values and its original caller key
returns the same shipment and enqueues no new event/email. Equality compares the
current shipment: after staff edit it, replay of the original values may conflict.
That conflict must change no row/event/job and must never create a second shipment
or email. Supplying different nonempty values with the key likewise conflicts
rather than silently replacing the existing shipment.

`trackingUrl` is trimmed, optional, HTTPS and at most2048 characters. Admit public
DNS-host syntax without a carrier allowlist or DNS lookup. Reject credentials,
every explicit port (including443), raw/encoded controls or backslash, single-label
or local/private-suffix hosts (`localhost`, `localdomain`, `local`, `internal`,
`lan`, `home`, `corp`, and `home.arpa`), all IPv4/IPv6 literals and unsafe schemes. The pure
parser returns the canonical URL or empty string and is reused/rechecked at
web/native explicit-open boundaries. This is neither carrier verification nor a
promise about DNS resolution. Never fetch, preview, embed, scrape or expand it;
never append the code, recipient identity, OTP or MirtPage credentials.
`trackingCode` is optional plain Unicode text, trimmed, at most120 characters,
with no controls/unpaired surrogates; preserve case and internal punctuation/
spacing. It is a provider code, never the recipient email-verification code.
Either field can exist without the other. Unknown keys and all prior leg/type/
stable-ID/method/order rules still reject. A normalized command's serialized legs
are bounded to60000 UTF-8 bytes; FE-069 retains a useful draft on invalid input.

Fresh transport/manager authority, immutable recipient ownership, OTP/session
isolation, optimistic versioning, no-op edits, audit and idempotency are unchanged.
Only staff and the freshly verified shipment recipient receive the new values;
list summaries remain small and do not expose leg URLs/codes. Ordinary edits do
not send email or affect chats. Initial emails continue to omit these optional
fields; their separate visible terminology correction follows the mail-boundary
contract below. No scans, computed status, ETA, current carrier/custody or delivery
claim is inferred from a link/code, provider order or clicks.

GIVEN a legacy row/event without new keys WHEN read or replayed before later
shipment edits THEN empty optional values are projected, identical accepted Submit
returns the same shipment, and every stored row/event/job/key stays unchanged.
GIVEN staff have changed that shipment WHEN the original caller key and original
values are retried THEN a conflict may be returned, with every Tracking-table
fingerprint unchanged and no second shipment or email. GIVEN a new or edited ordered1–12-leg shipment
WHEN one/many providers have either/both fields THEN authorized detail preserves
the exact code and validated URL per stable leg through rename/reorder/reload.
GIVEN a changed code/link with the old caller key THEN conflict with no mutation;
GIVEN stale version, foreign email, revoked session/role/shipment or support-only
staff THEN deny before detail/304/write exactly as before. GIVEN unsafe/oversized
input THEN no partial shipment/event/outbox write or network side effect.

Mapped implemented tests: `scripts/test-tracking.ts` covers actual legacy JSON/
idempotent replay, new fields/order/version/no-op, authorization/304 and no extra
email; `scripts/test-tracking-provider-fields.ts` covers pure URL/code/byte-bound
negatives, and `scripts/test-tracking-provider-migration.ts` covers isolated75
rollback/replay/data/ACL outcomes. Both are registered in the existing PostgreSQL
readiness pipeline.
Retain BE-057 parser/legacy tests and every existing recipient/lease/retry negative.
Old queued and leased code/initial snapshots must parse safely without rewrites;
new optional portal fields must not enter initial-email serialized content.

Local backend evidence (2026-10-18): all21 bounded isolated PostgreSQL/pure
scripts pass in `.local/mirtpage-rebrand-s145/shipment-provider-details/focused75/focused-tests.json`,
including actual OTP/roles/304, old stored JSON/caller-key replay, queued snapshot
preservation and serialized initial-email exclusion. The new five-case pure
suite passes after the final URL/error-message precision changes; scoped strict
types pass. The initial test-launch/fixture diagnostics remain in
`shipment-provider-details/precision-initial-failures.json`; neither changes the
21-script result or weakens prior assertions. Source-bound independent peer,
ordinary-local migration, real UI/Chrome/Expo/visual review and fresh full gates
remain separate dependencies; these fixtures are not hosted-backup rehearsal.
The peer-identified replay wording ambiguity is resolved above without changing
production behavior. A focused real PostgreSQL post-edit original-key conflict
regression proves exact Tracking-table fingerprints remain unchanged; that full
Tracking script, the five-case parser suite and scoped strict types pass again.

### Shipment-tracking email terminology boundary

The active initial-email subject/body changes from shipment-plan wording to
shipment-tracking wording in enabled en/am/om, with inactive fallback consistency.
This is a separate rendering-context change: before editing a hot local renderer,
repeat the reviewed exact web/worker stop and two stopped-state zero pending/
sending/all-lease snapshots, preserve Expo and restore the same supervisor once.
A live zero snapshot is insufficient. Preserve addresses/origin/provider keys,
Message-ID namespace, initial snapshot and all delivery guards; do not include
new provider links/codes or reset/delete jobs. Nonzero/in-flight work stops this
copy change for an exact drain/immutable-envelope review. Hosted empty-bootstrap,
Auth templates and production activation remain separate DEP-049 operations.

## S141 correction — create before verification (ready; latest owner direction)

Verification protects recipient READ access; it is not a precondition for staff
creation. Staff initiate independent plans only through their Tracking workspace,
entering an exact validated email. No chat ID, assignment, active conversation or
previously verified identity is required. One email can own many plans submitted
through the same, different, ended or no chat. No chat field is shipment authority.

Additive72 permits NULL verified_at for a staff-created tracking recipient. Do not
fake a verification timestamp. Preserve existing IDs, verified timestamps, locales,
FKs, grants and all prior data. Authorized Submit atomically creates/reuses the
normalized email recipient and saves shipment/audit/initial email job. New email
recipients default to English until their own verification chooses a portal locale;
preserve existing locale on staff submission. No account/session/code is created
by Submit. Initial details email can be sent before verification; its locator is
not an access credential. Fresh session reads also require verified_at IS NOT NULL.

GIVEN a never-verified email WHEN authorized staff submit two independent plans
THEN both save and each queues one initial-details email, without touching chat.
GIVEN that email/reference and no valid verified recipient session THEN every
list/detail/conditional read is denied, without leaking recipient or plan details.
GIVEN later successful recipient OTP THEN update the same recipient ID and expose
both plans, independently of any conversation. Wrong/expired code, another email,
account JWT or chat credential still grants none. Invalid email, revoked/support-
only actor and failed transaction create no recipient, shipment or outbox record.
Concurrent Submit/verification preserve identity, locale, audit and idempotency.

Historical case plans remain private/read-only reference; retire their current
creation/edit actions and chat navigation, not the saved records. No automatic
email guessing, import, recipient transfer, deletion or external provider change.

Ready: scope/permissions/identity/nullable migration and initial email semantics
resolved; isolated schema71→72 rehearsal/ACL/data/concurrency regressions precede
protected sequential local backup/apply. FE-069 covers one Tracking entry and
standalone staff workflow; DEP-048 owns activation/rollback. Master §§5/12/13/16/
17/18/19/22 need verified reconciliation. No hosted mutation is included.

## Problem, outcome and boundaries

S138 supersedes S137's chat-bound publication and anonymous capability model.
Visitors and business owners verify an email in a separate tracking portal and
see multiple independent shipment plans. Chat is a communication medium, never
shipment ownership or access authority. Existing accounts, business Auth, support,
transport intake and chat lifecycles remain independent. Master §§5/12/13/16/17/
18/19/22 and ADR-0028 are affected. No provider/secret, booking, dates/ETA, scans,
physical custody claims, payments or outbound social messages are introduced.

## Identity and verification contract

- A recipient is a tracking-only identity, not a users/business/Supabase account.
  Normalize validated emails by trimming/lowercasing only, maximum254 characters;
  retain dots and +aliases. Never adopt owner/staff JWTs or visitor chat cookies.
- Recipient enters email, receives a six-digit code, and verifies it themselves.
  Staff never request or enter that code. Challenge lifetime10minutes, resend
  cooldown60seconds, maximum5 failed attempts, one use. Verification, failed
  attempts, consumption, recipient verification and session creation serialize
  atomically. New challenges supersede previous codes for that email.
- Use a random256bit nonce and distinct HMAC purposes for derivation, stored
  proof, lookup and session hashes. No plaintext code storage, new secret or code
  in URL/logs/telemetry. Durable queued sends recheck expiry/consumption/attempts/
  supersession and recomputed proof immediately before send, including rotation.
- Uniform request response and bounded private email/IP limits avoid existence
  disclosure and distributed brute force. Session is random opaque, hash stored,
  absolute7day expiry; logout revokes it. Web cookie HttpOnly/SameSiteLax/Secure
  in production, path /api/tracking; native separate SecureStore key and bearer
  adapter. Neither may overwrite account/chat credentials. Fresh session and
  recipient authorization on every list/detail, before any304/cache handling.

## Shipment aggregate and staff workflow

- Each shipment has independent opaque reference, recipient, version and safe
  audit, with1–12 ordered stable-UUID legs. Reuse BE-057 literal bounded fields
  and air/truck/van/car/motorcycle methods. No chat FK is required. Optional
  human label is bounded120characters. Recipient is immutable after submission.
- Fresh transport/all-scoped team members and platform/operations managers may
  manage team shipments. Support-only, owners and guests cannot write. Fresh
  role/settings and exact normalized recipient email are rechecked inside save transaction.
  Never trust a client verified flag, session role snapshot or arbitrary user ID.
- Initial Submit atomically saves shipment, audit and unique initial-details
  email job, keyed by caller idempotency ID. Retrying cannot duplicate shipment
  or email. Editing uses optimistic version/full replacement and stable leg IDs;
  stale writes fail with draft retained. No chat/message/assignment/read-clock
  mutation. Ordinary edits do not send new emails automatically.
- Initial email gives reference, ordered plan details and a locator link requiring
  the recipient session. Leased bounded retries use the existing guarded local
  Mailpit/production Resend adapter; no HTTP in SQL transactions. Saved, queued,
  provider-accepted and failed/deferred are distinct; acceptance is not delivery.
- Manager may revoke one shipment; lists/details immediately deny it and queued
  email is cancelled. Other recipient shipments remain visible. No implicit
  recipient reassignment, guessed email, or automatic public legacy import.
- List page is bounded24 with keyset continuation, recipient-scoped. Detail
  projection contains only reference/label/version/ordered public plan fields.
  Private emails, chat data, staff notes and internal IDs are absent.
- Visible detail refresh uses conditional5s reads,10s timeout, single flight,
  capped30s error backoff, focus/online refresh and cancellation/generation fences.
  Authorization precedes304; revoked/expired access clears previously shown data.

## Compatibility and security scenarios

GIVEN recipient A has two shipments WHEN verifying email A THEN both appear,
even with ended/no chat; email B, owner JWT or a guessed reference grants none.
GIVEN simultaneous correct verification attempts THEN only one consumes the code
and creates its session; exhausted/expired/superseded codes create none.
GIVEN a staff draft and valid unverified email WHEN Submit THEN save its independent
shipment and initial email job without granting recipient access. GIVEN a revoked
staff role THEN stale page submission is denied.
GIVEN duplicate Submit or email delivery retry THEN one shipment and one logical
initial message exist. GIVEN a later edit THEN no unsolicited duplicate email.
GIVEN valid ETag but expired session/revoked shipment THEN never304 or stale body.
GIVEN legacy schema70 plans THEN no automatic import or recipient publication occurs.
S144 separately authorizes only scoped obsolete-plan/handoff removal with protected
backup and restore rehearsal; accounts, chats and independent Tracking are preserved.
Old anonymous plan APIs return uniform404; old share pages redirect to /tracking
without their fragment. Remove participant plan/link projections, not chats.
No legacy import is automatic or prefilled. The obsolete case-plan screen and
company form are retired under S142; eligible old routes redirect to Tracking
after authentication and obsolete actions cannot write. New shipments start
independently from Tracking with a valid email.

## Test plan, readiness and rollout

Ready: identity/session boundaries, bounded security/transport fields, recipient
verification, multi-shipment ownership, roles, email semantics and legacy handling
are resolved. Isolated PostgreSQL tests prove migration71, atomic OTP/attempts,
session isolation, role revocation, cross-recipient denial, optimistic/idempotent
saves, outbox leases/retries and unchanged schema70/chat data. Pure/HTTP tests
cover bounds, cookie/bearer separation, CSRF, privacy headers,304 and lifecycle.
FE-069 owns actual role/Chrome/Expo tasks; DEP-048 owns backup/rollout gates.

Mapped focused evidence: `scripts/test-tracking-migration.ts` (rollback/replay/ACLs/
zero backfill), `scripts/test-tracking.ts` (OTP/session/roles/multiple/atomicity/
revocation), `scripts/test-tracking-email.ts` and `test-tracking-email-delivery.ts`
(provider/lease/retry/idempotency), `scripts/test-tracking-http.ts` (cookie/bearer/
origin/bounds/authorization-before304). Legacy support/owner/receipts/native PG
regressions remain required and preserve their original assertions.


S142/S144 clarification (2026-10-18): there is no retained legacy plan UI. The
separate authorized cleanup removed4local obsolete plans and9allowlisted events
with rehearsed recovery and70protected-table fingerprints unchanged. Live schema63
had no plan table and zero matching events, a verified no-op. This is neither a
Tracking rollout nor permission to remove other chat/account/shipment history.
