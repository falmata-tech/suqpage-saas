---
id: BE-059
title: Data-preserving MirtPage branding and compatibility
status: in_progress
related: [FE-070, DEP-029, DEP-049, ADR-0029]
owners: [backend, security, operations]
last_updated: 2026-10-20
change_level: L3
---

# BE-059 — MirtPage data and protocol compatibility

## Ready: finite push wire and display split

DEP-043/DEP-049 and FE-070 make this local follow-on Ready: validated browser
subscriptions retain the exact Suqpage wire title needed by old workers, while
validated Expo subscriptions receive MirtPage. Both new browser workers still
accept only the exact Suqpage/MirtPage wire titles and display literal MirtPage.
GIVEN either admitted wire title WHEN the new worker displays it THEN show
MirtPage with unchanged privacy, silent options, tag/ID and safe internal tap
destination. GIVEN an unrelated/spoofed/malformed title THEN show nothing.
GIVEN an old browser worker WHEN it receives the retained web payload THEN its
existing notification still works; do not require a fleet update or pretend
installed old workers have already changed display. No payload-selected name,
environment title override, channel/subscription/key rename or mail-context
change is introduced. Execute actual workers and real isolated dispatch-port
tests for both subscription kinds before claiming the source verified.

Local implementation and focused verification now pass:11 executed worker cases
include the immutable published3cfa577 worker; real isolated PostgreSQL dispatch
asserts both wire titles while retaining the original shared Expo-token owner/
visitor binding and all privacy/revocation/retry checks. No OS/provider delivery
or deployed worker update is implied.

## Ready: independent local Auth mail presentation

The narrow active native map User-Agent follow-on in FE-053 is also Ready: use
the canonical MirtPage public identifier/origin while retaining registration ID,
exact tile host and no-auth-header privacy boundary. The on-behalf service
request adapter has only a compatibility-test caller; it is outside the active
rebrand and remains unchanged with its retired request history.

The Auth-only source tranche is Ready under DEP-029/DEP-049 and FE-070. Change
the repository-owned sender display, thirteen subjects and thirteen HTML-content
fields to MirtPage, preserving the twelve unique templates and the existing
sign-in, invitation and recovery placeholders.
This is exactly twenty-seven fields; SMTP addresses/credentials, providers,
origin policies, OTP settings and seven disabled security notices do not change.
Auth remains English-only because the existing request has no locale input.
Local source is implemented with65 guard cases, canonical artwork/placeholder
checks and24 actual Chrome static states. The fixed SiteURL image adds no
external authority; existing sign-in code, invitation-link and recovery
placeholders retain their semantics. FE-073/BE-061/DEP-050 later intentionally
replace the email-change confirmation link with two separate mailbox codes;
that change is gated by their provider and rollout checks. Local Auth reload,
real code redemption and hosted apply remain separate.

GIVEN an exact new manifest WHEN the guarded patch is prepared THEN only its
twenty-seven reviewed presentation fields are admitted. GIVEN an old-brand,
arbitrary or mixed secret/provider/origin patch WHEN validated THEN reject it
before provider access, retaining all existing private-plan and apply fences.
GIVEN repository templates WHEN inspected THEN sign-in code, invitation-link and
recovery-to-email-code semantics remain identical; FE-073 owns the separate
email-change code flow. No hosted apply, local
Supabase restart, application-mail renderer change or mail send is included.

Tracking/escalation renderers remain separate: their local public-schema queues
and every producer/dispatcher/in-flight entrance must be assessed before hot
source edits. Current hosted empty-bootstrap eligibility does not establish
local retry safety. Do not change stable keys or manufacture empty queues.

## S150 — email logo contrast source boundary (Ready)

FE-070's email-only contrast correction changes the twelve repository HTML
image URLs to a new deterministic opaque-white versioned PNG and adds explicit
white backing on the image. The exact thirteen subjects, twenty-seven-field
branding allowlist, sender addresses/credentials, OTP/code/link placeholders,
providers, origins and disabled security notices retain their existing meaning.
The former PNG is retained for cache/history compatibility. GIVEN the already-applied sender/subjects WHEN a guarded
contrast plan is prepared THEN only the thirteen exact changed HTML-content
fields are included and reviewed under DEP-029; a PNG generation or static preview grants no hosted write or mail
send. Test all template URLs/backing plus the unchanged token/link semantics.

## Ready: local application-mail display boundary

The exact next local tranche is Ready only after the authorized ordinary web+
worker supervisor has stopped, its five owned processes and3102 listener are
gone, Expo8082 is preserved, and two stopped-state count snapshots show zero
pending/sending rows and non-null leases in both app-mail outboxes. Do not infer
quiescence from the earlier live zero snapshot. Preserve the runtime settings.
GIVEN that boundary WHEN authored Tracking/escalation subjects and From display
change THEN use MirtPage and active-language meaning, preserving sender address,
origin, serialized shape, provider key, Message-ID namespace, snapshots and every
authorization/lease/TTL/backoff guard. Optional Telegram's fixed platform prefix
may change without a bot, credential or target change. No old record is rewritten.
GIVEN a nonzero queue, PID reuse, shutdown timeout or target drift WHEN the gate
runs THEN stop before editing; do not delete/reset/terminalize jobs to pass it.
Restore the same supervised web/worker command promptly after syntax validation;
lengthy focused tests use isolated schemas after ordinary previews return.

The exact boundary is verified: both stopped-state snapshots are zero, previous
processes/listener gone, unchanged Expo preserved, identical supervisor restarted
once and both previews HTTP200. Tracking/escalation/Telegram display and native
Tracking subjects are implemented. Renderer/provider/target guards and both
durable delivery regressions pass without external sends.18 actual Chrome phone/
desktop states show exact substitute-adapter plain text;24 Auth states remain
separate. Neither static output nor provider acceptance means delivery/read.
The owner explicitly approves the combined email visuals and full checks on
2026-10-18; full current-source gates remain separate from focused evidence.

## Ready: new Android defaults without replacing business identity

DEP-049's local default-identity tranche is Ready. Future source profiles use
MirtPage/com.mirtpage.app and its exact new Firebase registration/file, rather
than keeping Suqpage as a future build option. This does not delete customer
records, provider registrations or keys. Initial hosted targets remain empty;
new-app signing/file/FCM/submission bindings are separate verified operations.
Safe old/new public-link parsing grants navigation only. Preserve every current
Tracking locator, session, capability, tenant, channel and idempotency boundary.

## Problem and outcome

Rebrand platform-owned presentation/default records without resetting the business
system or corrupting retained identities, permissions, uploads and delivery work.
The local push compatibility split is implemented and focused-test verified:
both workers accept only exact legacy/new wire titles and display MirtPage;
the server retains the old browser wire title and uses MirtPage for Expo.
Channel IDs, subscriptions, delivery keys and hosted settings stay unchanged.
Remaining hosted data/default, sender and origin migrations remain draft until their exact
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


## S145 local support defaults and complete-ledger preflight

This finite L3 tranche is implemented and focused-test verified locally. It changes
only the future support requester
label to `MirtPage client`: additive migration73 changes the column default and
the current general-support writer supplies that same label. Every existing
conversation, message, assignment, tenant, Auth identity, shipment, delivery job
and audit row remains byte-for-byte unchanged. Historical migrations remain
immutable. The inactive `Suqpage monthly` subscription default and historical
billing rows stay untouched because transport is the only current revenue;
renaming that default would falsely revive a retired product. No subscription
trigger/function, billing capability, mail sender or mail delivery changes.

GIVEN a schema through72 WHEN migration73 runs THEN only the support label
default and migration ledger change; new default inserts use MirtPage while old
labels and custom business names remain unchanged. GIVEN a rolled-back migration
WHEN inspected THEN its old default and absent73 marker are retained. GIVEN a
replay WHEN run again THEN no migration or existing data changes. GIVEN an
allowed owner creates general support WHEN persisted THEN its new label is
MirtPage; duplicate commands retain idempotency and foreign/stale client access
is still denied.

GIVEN unexpected requester-label metadata or a custom column default WHEN73 is
not yet applied THEN refuse the migration transaction without overwriting it.
Only a non-null text column with the reviewed Suqpage or MirtPage default is
eligible; retaining an already-MirtPage default is an idempotent compatible case.
The immutable baseline47 has a non-null text requester label with no default.
That exact absent-default case is allowed only while installing a genuinely
empty, unversioned schema in the same invocation. A pre-existing versioned
schema with an absent/default-custom value still stops for review.

DEP-049 requires one of exactly two complete current migration histories before
release preflight:1..74, or1..26 plus31..74. The observed copied PostgreSQL lineage
legitimately omits the whole retired data-only27–30 group; all partial groups,
other holes, duplicate/noninteger and unknown/future IDs fail closed. This local
correction is implemented and focused-test verified under the reviewed
BE-035/DEP-031/ADR-0020 historical evidence. Tests must
prove the observed legacy63 representation upgrades through actual64–74 DDL
without synthesizing old markers; stale63 and missing64 despite74 still fail.
No database query is added to the Netlify build. Regression evidence
must cover the actual writer, rollback/replay, untouched billing/history and
existing tenant/security assertions. Use only random isolated local test schemas;
no ordinary local or hosted migration is included. Full release/rollout remains
separate from these focused checks. A rollback restores the previous application
and reviewed default/ledger under a separate operation; it never rewrites rows.


Focused local evidence for this tranche: `scripts/test-mirtpage-support-defaults.ts`,
`scripts/test-release-preflight.ts` and `scripts/test-taxonomy-reference-migration.ts`
pass with actual isolated PostgreSQL,
including leased-job/all-table fingerprints and custom/default fail-closed
checks. Fifteen inherited runtime/security/migration/presentation scripts also
pass, including fresh native install and historical44/45/60 replay. Scoped
strict types pass; the existing PostgreSQL readiness pipeline now includes the
three new regressions. Native/current release gates remain separate. Private
support-default-preflight receipts retain the initial sandbox refusals, the
metadata-guard fixture failure and both stale positive runtime-fixture failures;
none is silently reclassified as a pass. Independent source-bound peer review
passes. See TRACEABILITY for exact scope and rollout limits.


The corrected two-history contract passes actual isolated PostgreSQL tests,
including the exact59-marker legacy63→74 upgrade without backfilling27–30,
all14 partial-group negatives, hole64, unknown/fractional IDs and retained
Auth/admin/configuration guards. The support-default73 integrity regression and
scoped strict types also pass. Full gates remain held; see the detailed current
TRACEABILITY evidence and the separate production backup/rehearsal requirement.


## S145 verified local canonical business-category references

Migration74 is implemented, focused-test verified and independently reviewed
under the spec-first BE-059/DEP-049 reference-data plan.
The copied six-key target genuinely lacks agriculture-growers; this is distinct
from valid missing historical27–30 markers. Freeze seven key/label/icon/position
insertion tuples in74: electronics0, beauty-wellness1, agriculture-growers2,
food-farming3, machinery-tools4, home-living5 and fashion-textiles6. Insert only
missing keys with the reviewed display defaults/active1; preserve existing
labels/icons/active, all unknown rows and every tenant/product/industry/sponsor
assignment. Update only those seven known positions where different. An existing
canonical key inactive0 stops for review; never silently reactivate it.

Before any reference write, verify the exact known five-column text/text/text/
bigint/bigint NOTNULL table shape, key primary key and validated active0/1 check.
Unknown metadata refuses the transaction. Verify all seven known active rows in
canonical order before recording74. The existing advisory-locked transaction
provides atomic rollback; historical migrations/baseline stay immutable. A fresh
seven-key target changes no data; replay changes nothing. Endpoint74 admits only
full1..74 or1..26+31..74, retaining all prior ledger/security denials.

GIVEN the six-key legacy63 lineage WHEN real64–74 migrations run THEN all required
references exist in canonical order, old27–30 markers remain absent and existing
account/business/product/assignment facts are preserved according to each prior
migration's existing contract. GIVEN a current-schema six-key fixture WHEN farm
signup/owner category selection runs before74 THEN the missing-reference FK
rejects and rolls back; after74 real farm signup/owner edits succeed while
foreign-tenant edits remain denied. GIVEN fresh data, rollback, replay, inactive
known key or unexpected schema WHEN migration74 is exercised THEN prove exact
no-op/rollback/fail-closed outcomes with fingerprints and no partial marker.

All18 applicable focused scripts and scoped strict types pass. The dedicated
taxonomy test proves the real signup FK failure before74, successful signup and
owner edits after74, tenant denial, row/ACL preservation and each rollback,
replay/inactive/metadata refusal above. A reconstructed six-key legacy63 fixture
also upgrades through actual64–74 without inventing27–30 markers. This is not an
actual production-backup rehearsal. Independent peer review passes; mail readiness
and fresh source approval still precede the held combined gates.
Hosted64–74 still requires a protected
backup/restore rehearsal, exact reviewed target/delta and separate approval.
Code rollback may retain this forward-compatible row/order; deleting a referenced
category or reversing data needs a separate reviewed beforeimage/operation.
