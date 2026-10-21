---
id: DEP-045
title: Independent discovery rollout and safe demo contacts
status: in_progress
related: [FE-065, FE-066, BE-055, BE-054, DEP-042, DEP-030, DEP-041, BE-022, ADR-0027, DEP-046]
owners: [operations, security]
last_updated: 2026-10-20
change_level: L4
---

# DEP-045 — Discovery and demo safety

## S151 — live demo contact rollout gap (inventory; apply not approved)

The batch audit independently verified the MirtPage site/project and schema 77.
None of its 65 marked demos has all three canonical message destinations set to
the owner's approved phone, and the production operator setting is absent. Actual
Chrome and public DTOs show disabled channels. This is an incomplete rollout of
S118, not permission to weaken the fail-closed policy or hardcode contacts.

Prepare one exact, protected, drift-bound marked-demo correction covering current
canonical contacts and effective draft/public snapshots, alongside DEP-046's
separately identified content deltas. Preserve private sign-in aliases, real
businesses, unpublished state, unrelated content/media/location and immutable
history. Retain all before-images, append required versions, verify no-op replay,
and prove web/native projections agree. Setting the operator phone alone is
insufficient. Any hosted data or environment write still requires its exact
target/backup/review approval; this inventory authorizes no such mutation.

The S151 contact-only plan now has66 focused planner/negative-operation cases and
a successful five-table local SQL rollback rehearsal. It updates65 canonical and
draft contacts, appends65 draft events plus64 public/catalog versions, preserves
all earlier versions and leaves the private reviewer unpublished. The first
rehearsal exposed integer/bigint representation differences in the prepared model;
strict typed corrections pass a read-only schema preflight and one controlled
retry. Exact after-state, rejected replay, real foreign-key and version-drift
rollbacks, final schema removal and unchanged preview fingerprints pass.
Evidence is protected under `s151-batch-audit/demo-repair-preparation/` in the
release directory. This is local preparation evidence, not a hosted apply or an
environment-setting approval. DEP-046's content/category/media correction remains
separate and incomplete.

The separate one-key Netlify environment candidate now passes81 pure
transport/negative cases and independent source review. It binds the existing
protected absence backup and exact site/account/project/primary/deploy, admits
only the nonsecret production destination and existing Free scopes, and checks
untouched field fingerprints before/after. Approval is revalidated after
credential resolution and immediately before POST; the initial expiry-during-
preflight defect and its failing reproduction are retained. HTTP200/201 are
normal success; any ambiguity consumes the attempt and stops without retry or
restore. This is mock-provider qualification, not hosted concurrency/CAS or a
provider rollback rehearsal. A fresh B04 `verify-before` read-only check still
matches the complete protected data plan. Neither data nor setting is applied;
the exact owner approval questions remain pending in the combined review.

## Server country-city artifact admission (Ready)

ADR-0027's committed public gazetteer is read by the server place adapter from
`lib/world-place-catalog.json`. Production tracing explicitly includes this
runtime data file; treating every `lib/` reference as private incorrectly rejects
the required artifact. This independent test/operations correction changes no
application, source dataset, tenant data or provider configuration.

- GIVEN server output traces WHEN inspected THEN admit only that exact normalized
  project-relative file as a noncompiled `lib/` runtime asset, and require its
  presence. Keep every other existing source/private/generated-path rejection.
- GIVEN this admission WHEN validated THEN verify its regular-file/realpath
  identity, reviewed SHA-256
  `6f1e53448f713084dbabb9b49a7e471e09be680add56d0cec212aaa082d0cee9`,
  declared public provenance and bounded geography-only structure. A changed,
  malformed, symlinked or substituted file fails; updating the reviewed snapshot
  requires an explicit data-policy/test change, not a broader path exception.
- GIVEN similarly named files, other `lib/` source/data, private directories or
  path aliases WHEN classified THEN the exact asset allowance cannot admit them.
  The full world-city snapshot remains absent from browser/Expo bundles.

Extend the executable trace privacy regression with positive and negative cases,
then run it against the actual failed build before the complete release gate.
Retain the original rejection; no privacy check is disabled or replaced by a mock.
The current failure contains 110 references to this one public file and no other
rejected path. Full-check application evidence remains source-bound; release and
acceptance are incomplete until their corrected gates pass.

## S118 — explicitly owned demo message destinations (ready)

The corrected owner instruction authorizes +19528552202 as public phone, WhatsApp
and explicit Telegram phone for every marked demo. This supersedes fake-value
rules only for these three owned destinations. Preserve real businesses, private
Auth/login aliases, ownership, other public fields, catalog, GPS and chat history.
Local correction uses exact is_demo targets, protected before-images, transaction
and preservation/readback evidence. Hosted data remains a separate exact-target,
backup/review operation; prepare rather than silently mutate hosted environments.

Nonsecret `SUQPAGE_DEMO_INQUIRY_PHONE` is read only by server projection to expose
typed per-method permission for matching effective public contacts. No source
hardcoded phone/catalog fallback, credential or provider change. Missing/invalid
setting leaves demo inbox destinations fail-closed. Local startup and later release configuration
identify the exact target/value. Verify admitted current/draft/public projections
agree, preserve unrelated fields/versions and prove private/real data unchanged.
Replay is idempotent. Keep historical publications/revisions immutable; append
through existing version/publication contracts when current snapshots need change.
No actual messages, remote mutation or third-party account/privacy pass is claimed.
Full gates and hosted rollout retain their existing approval dependencies.

The owner's subsequent S118 instruction additionally authorizes four demo-only
public examples: TikTok username `tiktok`, Instagram username `instagram`, Facebook
username `facebookapp` and website `https://example.com/`. A second exact reviewed
local plan/backup/rehearsal must start from the verified phone correction; retain
both receipts. Patch only existing draft/current publication contact projections
and the canonical TikTok field, preserving the three owned message destinations,
email, private identity, real businesses and immutable history. Append required
versions; never create a first publication for an unpublished demo. Server
projection permits these exact known examples, without enabling arbitrary demo
profiles or putting them back among inbox choices. Provider login restrictions
and remote account availability are outside local UI proof.

## S118 locally verified operations — October 17, 2026

Both one-time local operations completed their separate backed-up plan, rolled-back
rehearsal, transaction and read-only verification. The phone correction and the
subsequent four-profile/site correction each admit all 67 marked demos: 67
canonical businesses and 67 drafts, with 66 current publication/catalog versions.
Existing historical publications/revisions remain immutable; no first publication
was created for the private reviewer, which remains draft. Protected real/private
records are unchanged and each verification is an idempotent no-op. Receipts:
`.local/contact-workspace-s118/demo-contact-{rehearsed,applied,verified}.json` and
`demo-profile-examples/demo-profile-{rehearsed,applied,verified}.json`.

The first operation sets the explicitly owned SMS/WhatsApp/Telegram number; the
second preserves it and supplies TikTok `tiktok`, Instagram `instagram`, Facebook
`facebookapp` and `https://example.com/`. Public email remains fake/inert. Fresh
server projection permits each owned phone method only on an exact validated
operator-setting match, and each profile/site only on its exact approved example.
Missing phone configuration denies inbox launches; the known public examples do
not require that setting and never become inquiry providers. Local nonsecret
startup-setting changes preserve other configuration; no provider credential is
changed. The final focused checks pass 92 combined tests, 17 localization tests
and both typechecks. These are local operations and controlled tests, with no
external messages, hosted data/configuration, web release or Android rollout.
Actual visual approval, full/release/acceptance gates, scoped commit and any
separately reviewed hosted operation/build remain pending.

## Problem, scope and readiness

S102 implements/reviews web and native locally first. The current instruction
authorizes the feature, demo-location/contact correction and a private test-access
directory; it does not authorize publishing a new binary or hosted configuration.
Existing S100/S101 approvals remain pending. Do not touch Loadgistic.

Demo data correction is a one-time operation, not a permanent synchronization
system. Inventory marked demos, canonical locations and public contact fields;
back up exact before-images privately. Apply only to admitted is_demo businesses,
their public profile/contact snapshots and missing known country/city metadata.
Do not relocate existing points or edit real businesses, account ownership,
provider UUIDs, passwords, private login aliases, inquiries or chat history.

Public demo phone/email/WhatsApp/website and social targets must not send visitors
to unrelated real people. Use reserved example destinations and prevent external
contact launches for marked demos. S106 FE-066/BE-055 retire new Suqpage
business-inbox submissions; keep native/web selected-product message preparation,
automatic social-handoff copying and optional manual copy usable without opening
fake destinations. Preserve authorized private inquiry history, transport chat and
owner support. S112 FE-067/BE-056 supersede active service listings with products
and a Made to order toggle; DEP-046 governs that separate demo correction.
The owner confirmed retaining private approved Gmail sign-in aliases; fake
public email is separate from Auth. Where existing local fixtures lack dedicated
queues, two labeled local-only support/transport agents may be provisioned through
the existing administrator service without changing existing roles or hosted Auth.
One unlinked local setup-review identity supports actual signup-screen evidence.

## Scenarios

- GIVEN an admitted demo with missing location metadata WHEN corrected THEN use
  its already-recorded canonical city/country without shifting stored GPS. Unknown
  or ambiguous locations stop that record for review, not a guessed default.
- GIVEN any marked demo WHEN an external contact is shown THEN it contains a
  reserved example destination or is absent; it cannot launch communication to a
  stranger. Real-business contact behavior remains unchanged.
- GIVEN admin/support/transport/owner test roles WHEN the access guide is prepared
  THEN provide exact target URLs, admitted email identities, login-code location
  and permitted workflows privately. Never publish passwords/tokens or include
  the private account directory in builds/Git. Staff remain web-only.
- GIVEN local migration/correction THEN retain a protected before-image, exact
  admitted IDs and invariant checks, prove replay/idempotence and verify real
  account/history preservation. Hosted rollout remains a distinct reviewed step.

## Test plan

Definition of Ready: local vs hosted boundaries, existing demo markers, private
access documentation and backup/rollback rules are known. Test on disposable
PostgreSQL fixtures, then guarded local preview data after a protected backup.
Capture all affected platforms/locales; obtain actual layout approval before full
gates/commit. Any later hosted migration/data operation needs fresh exact-target,
backup and preservation evidence; any Expo build follows DEP-042/DEP-044. No
production configuration change, secret copying, account deletion or reset.

## Rollout

Local focused evidence and explicit visual approval precede full/release gates.
DEP-045 controls backup, preservation, scoped commit and any later hosted rollout;
DEP-042 controls rebuilt Android delivery. No automatic publication or reset.

## S116 backlog reconciliation — October 17, 2026

Local focused receipts cover 67 marked demos' public contact/known country-city
correction under S102. The separate S86 correction disperses 21 Addis area demos;
S112's reviewed product-only correction is recorded under DEP-046. These local
operations do not establish any corresponding hosted update. A hosted correction
remains pending its own exact admitted rows, current before-images, preservation
checks and reviewed monitored application; do not rerun a seed or reset accounts.

Current prepared Play/social copy follows the product-only showroom candidate.
Regeneration/review of matching screenshots, posters and videos remains pending
under DEP-044; existing generated media and provider receipts describe the earlier
released version. Neither local text changes nor this reconciliation publish new
artwork, a web release or an Android binary.


## S103 revised candidate admission

The October 16 request restores bounded initial browsing, infinite product
scrolling and paired panels under FE-065/BE-054. No additional migration, provider,
secret or data correction is needed. Focused SQL/security, legacy compatibility,
web/native type and five-language browser checks precede approval of the revised
visuals. Existing S102 full-gate/commit/hosted rollout gates remain pending;
S102 screenshots no longer approve S103. Rollback retains schema 64 and all data.
If DEP-043 S111 migration65 has since been applied, preserve those additive chat
fields/index/history as well; an older feature rollback never drops later data.
