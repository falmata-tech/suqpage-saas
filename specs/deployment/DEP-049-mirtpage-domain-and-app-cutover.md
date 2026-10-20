---
id: DEP-049
title: MirtPage domain, managed services and app release cutover
status: draft
related: [FE-070, FE-071, BE-059, DEP-029, ADR-0029, FE-072, BE-060, DEP-050]
owners: [operations, security, mobile]
last_updated: 2026-10-19
change_level: L4
---

# DEP-049 — MirtPage cutover

## S146 native public-origin source boundary (ready)

FE-070 aligns all active native API, legal-link and social-video public origins
to one validated runtime value. Missing development configuration defaults to
`https://mirtpage.com`; explicitly configured local/staging origins remain
usable, while hosted builds continue to require their separately qualified
exact data target. This source correction does not enable an unqualified hosted
target, change provider settings or publish a new binary. Confirm the default,
override and hostile-origin cases with focused tests and Expo preview; inspect
the eventual Android artifact separately before release.
The independent native YouTube frame retains its package-scoped synthetic
origin; only its missing-package fallback becomes `com.mirtpage.app`. Installed
packages and Expo Go still use their actual configured IDs.

The local source and focused/browser review now pass, as mapped in FE-070 and
`.local/s146-mobile-origin-review/receipt.json`. This verifies URL construction,
not an installed Android referrer or external provider's playback decision.
The compiled YouTube WebView adapter additionally passes fallback, configured
package, Expo Go and restricted-navigation cases through the direct Node/tsx
runner; its historical installed-package origin remains compatible.
Hosted target qualification and remote rollout remain pending.

## Planned S146 — staff authority rollout is separate

FE-072/BE-060 plan a later additive staff-grant migration and business
management cutover. It is not included in MirtPage's current domain, signing,
Auth-template or Play-app changes. Keep existing owner consent/assignment gates
until the grant backfill, security tests and separately approved rollout pass.

## Ready: independent Auth template source

BE-059/DEP-029 and FE-070 make the local Auth presentation source independently
Ready. Retain a protected exact beforeimage and change only sender display,
manifest subjects/content and local corresponding display/subject settings.
Generate one email PNG from the approved outlined wordmark; preserve every
existing derivative byte. Its public path must be served/read back by the future
web artifact before hosted templates reference it through SiteURL. Focused
twenty-seven-field/placeholder/disabled-notice/old-plan/security tests and static
twelve-template previews precede actual Chrome/owner email review. No service
restart, hosted configuration change, real mail or full gate is part of source
preparation; a fresh guarded hosted plan and exact owner approval remain required.

The current old deployment's two provider function digests now match the exact
protected tested ZIP hashes, including its push-only minute worker. Together
with the fresh schema63 inventory this qualifies eligibility for empty bootstrap
of post63 app-mail outboxes, not activation. Complete reviewed ledger upgrade,
backup/restore and fresh empty/current-producer boundary checks remain required.

The owner-authorized local app-mail boundary is independent of hosted rollout:
use exact supervisor49851 with verified birth/arguments/source and scoped
SIGTERM propagation, preserving Expo8082 and unchanged settings. Require all
five owned processes/3102 gone and two stable all-pending/sending/lease-zero
snapshots before MirtPage Tracking/escalation/Telegram display edits. A bounded
failure stops editing without broad kill/reset. Restart the identical reviewed
supervisor command once immediately after quick syntax checks, then run focused
isolated tests. No hosted process, provider, schema or mail credential changes.

This source boundary is now verified, including two stable stopped-state zero
counts, all five old processes gone, unchanged Expo and exactly one ordinary
supervisor restart. Web health and localhost8082 return200. Preserve the initial
health verifier's wrong127.0.0.1:8082 failure as a harness-address error; no second
restart or product outage is inferred. Focused renderer/durable-delivery/privacy
tests pass; the owner approves the actual Chrome static42 email states and full
checks on2026-10-18. These do not replace the held combined-current-source gates.
Source SMTP technical values, sender addresses, origins and idempotency keys are
unchanged. Auth source was not reloaded; no hosted template/sender write or real
mail follows. The canonical PNG must still be served before its hosted plan.

## Ready: local default Android identity

The newest owner instruction retires Suqpage as a future build default. This
independent local tranche is Ready: development, preview and production resolve
MirtPage/com.mirtpage.app, selecting only MIRTPAGE_GOOGLE_SERVICES_FILE and the
actual registered Firebase app1:588262779708:android:9a9f3944058b1fcc248c39. Its
downloaded two-client file is pinned by SHA256
a52bddd06936d2b22b755c3a3d927512a304af424480e05368f385afed1bb1c7.
The owner-accepted independently verified Play metadata pins expected signer
0630C56F88DF874FD27296D1AA0848A68FC8345F702FE6802EDD8255B7211183;
this is not measurement of a new compiled artifact or EAS credential binding.

GIVEN normal source configuration WHEN any known profile resolves THEN the
visible/default Android identity is MirtPage, without a legacy build fallback.
GIVEN an unqualified hosted runtime target, wrong/missing new Firebase file,
private public key, unknown/conflicting profile or iOS worker WHEN build
validation runs THEN stop before compilation. Initial approved dataTargets is
empty until candidate runtime qualification. Preserve the existing EAS UUID and
current infrastructure slug, remote version policy and APK/AAB distinction.
GIVEN existing submission defaults WHEN a new-package upload is requested THEN
reject until its exact new-app submission binding is independently qualified;
an old app-scoped credential is never silently reused.

New Android HTTPS claims contain only exact mirtpage.com public routes and remain
unadmitted without both its registered association and the exact qualified
mirtpage-production target. Add the owner-accepted public MirtPage certificate
association locally now, preserving both old entries; a later web deployment
can serve it before Android qualification without a second web deployment.
This source preparation does not claim hosted readback or OS verification.
Safe old/new public-link
navigation remains navigation only; private/capability/Tracking boundaries stay
unchanged. The canonical M supplies a96px transparent white notification glyph;
no new dependency, native splash claim, build, prebuild, credential write or
store release is included. FE-053/FE-070/BE-059 and DEP-042/DEP-043 describe this
local successor to historical one-app rules. Focused actual-source tests,
strict mobile types and sanitized installed-SDK config introspection precede
evidence reconciliation and later full/managed-service/artifact gates.

Local implementation evidence: all three normal profiles resolve MirtPage and
the new Android package; actual installed Expo config and Android scheme plugin
show only mirtpage, with no root/old-file fallback. Build/Firebase harnesses and
16 link/artifact/security cases pass; three canonical artwork cases, strict mobile
types and scoped strict script types pass. The actual protected provider file
passes exact raw-hash/client validation without alteration or key output.
The additive association is source preparation only; empty approved targets keep
both hosted compilation and new autoVerify claims blocked. The submission source
is a distinct absent protected path. No provider/EAS/Chrome/prebuild/build/upload
ran, and combined full gates remain pending with the parallel local tranche.

## S149 — admit the hosted MirtPage Android runtime (in progress)

The MirtPage Android package was withheld from installable hosted builds
until the live website, mobile catalog API, account-deletion page, exact
`com.mirtpage.app` App Links association, production schema 77, and Supabase
Auth primary/callback configuration were independently read back. Those
checks now pass; the admitted target is only `mirtpage-production` with
`https://mirtpage.com` API and
`https://sjeiiqxgscuqajpgddcc.supabase.co` Auth origin. Keep the same package,
Firebase client hash, EAS project UUID,
signing certificate, and existing preview/production profiles.

GIVEN the reviewed target and matching HTTPS origins WHEN hosted build
validation runs THEN it accepts the MirtPage package and registered Firebase
client. GIVEN a wrong origin, wrong Firebase file, missing publishable key,
unknown target, or iOS build WHEN validation runs THEN it stops before native
compilation. GIVEN the canonical App Links file WHEN inspected THEN it contains
the approved MirtPage package and certificate without dropping the previous
association. Passing configuration tests does not qualify an APK or Play
release: the actual artifact, security audit, signer, and device workflows
need their separate DEP-042/DEP-044 evidence.

The exact approved Supabase Auth primary-origin operation was applied and read
back on 2026-10-20. A separate read-only management API call confirmed the
healthy project, `https://mirtpage.com` primary URL, both allowed callback URLs,
and unchanged disabled Google login. Live MirtPage web, v1 mobile catalog,
account-deletion and canonical App Links routes returned 200; the production
schema-77 commit/readback receipt is retained privately. The sole admitted
Android data target is now the reviewed MirtPage production API/Auth pair.
`scripts/test-mobile-build-config.cjs` and `scripts/test-mobile-app-links.ts`
cover admitted/denied targets and certificate-scoped links. Focused tests pass;
the full source gates are recorded below. Actual sign-in, Android artifact and
device workflows remain distinct evidence. The Play listing remains unuploaded.

The owner separately approved the exact guarded Netlify primary-domain plan;
its one-use apply and readback passed on 2026-10-20. The correct site/account
now has `mirtpage.com` primary, with `suqpage.com` and both www names retained
as aliases. Forced HTTPS and published deploy `6ad73e5a9df2756523e8ac95`
were unchanged. MirtPage root/health and old-domain privacy returned 200.
The owner approved using the full-square, exact Android launcher image as the
Play listing icon. Google Play applies its own corner mask; the exported icon
retains the approved M and orange shade without pre-rounded transparent edges.
`npm run check` now passes on the admitted target after updating the stale
notification fixture to test rejection of unreviewed Firebase bytes. A clean
root/contracts web-only install passed the complete `npm run release:web` gate,
including provider-backed HTTP smoke, PostgreSQL scale/tenant tests and a
zero-finding web audit. A source-matched Android Hermes export and source map
enumerated 1,693 runtime modules without the two affected build-tool packages;
the full workspace audit still reports 20 high transitive tooling findings.
These are source/readiness checks, not approval for an installable Android
artifact; DEP-044's exact one-build exception remains mandatory.

## Problem and outcome

Move the platform's visible identity and canonical domain to MirtPage/mirtpage.com
while preserving the business system. The owner confirms new com.mirtpage.app with a separate Play app and
confirms mirtpage.com purchased and ready in GoDaddy on 2026-10-18.
GoDaddy ownership/delegation and all seven current zone records are independently
verified and protected, together with the exact Netlify site/account/domain
beforeimage. Later runtime/env, hosted data/Auth phases and remaining providers
still need their own phase-specific verification. The owner approves the exact independent domain
and app-record operations on2026-10-18. Both new Netlify aliases and the reviewed
GoDaddy A/www records are saved/read back; both authoritative nameservers agree
and all unrelated zone records, old primary and published deployment are retained.
Managed HTTPS/host verification and additive app records are now complete under
the exact approved operations. All four reviewed hosts pass normal TLS/root/
health checks and retain the published deploy6acd6e4203a2e50c6b9286dd and its20
public assets. Firebase registered com.mirtpage.app as
1:588262779708:android:9a9f3944058b1fcc248c39; Play app4975632567188114692 is a
separate Free MirtPage Draft. Original applications and keys are preserved.
Protected receipts are provider-domain-apply/verified.json and
provider-registration/verified.json under the private S145 review. No candidate
code/canonical/runtime/mail/data cutover is inferred. Hosted Auth staging now
adds only the exact new callback to uri_allow_list: site_url remains the old
origin, Google login disabled, and an independent243-field readback exactly
matches the approved patch with241 non-target fields preserved. New-primary
Auth is still unapplied; its short-lived read-only plan is not approval.
Existing production schema63 and local
candidate schema77 are different release states, not interchangeable baselines.

The final public brand is MirtPage everywhere. Retained old provider IDs,
protocols and historical evidence support a bounded transition, not permanent
public co-branding. Retire them only where safe and explicitly reviewed; do not
delete business records or rotate keys merely to remove an internal old name.

## Production recovery qualification (in progress)

A protected read-only archive of the independently verified hosted schema-63
database was captured on 2026-10-19. Its private receipt records 98 table
fingerprints and all 59 existing migration markers. This is database content
and metadata evidence, not a complete recoverable production backup. The first
isolated restore rehearsal stopped at a role/extension assertion before
`pg_restore`; it imported no customer rows, left the ordinary local database
unchanged and cleaned up its disposable target. Preserve that failed receipt.
An independently reviewed corrected partial-rehearsal plan is prepared but
awaits exact owner authorization and has not run. Even a successful partial
database restore would not qualify full recovery while private Storage object
bytes and managed role settings remain unrecovered. A guarded first Storage
download stopped before accessing the object; a later read-only binding check
verified the canonical MirtPage bucket/key settings on the exact site, but did
not capture the bytes or prove Storage access. Require those recoverable
sources, a successful isolated restore and compatibility checks before any
hosted schema migration or candidate deployment. The archive, rehearsal and
review remain outside Git under the protected `production-cutover-readiness/`
area; none performed a hosted write.

## Independent provisioning readiness

The hosting-alias and additive app-record phases were independently Ready and
have now completed under exact owner approvals. Their independence remains:
neither deploys the candidate nor changes the current primary domain, application
runtime, Auth, mail, schema, explicit signing selection, build or release. The
existing published Netlify deploy and old applications remain the authorities.
This separates provisioning from code rollout; it does not waive, skip or mark
the failed acceptance cases passed.

For hosting staging, require fresh exact GoDaddy/Netlify target and field checks,
the protected recoverable beforeimages, and owner approval of only the new apex/
www aliases, reviewed A/www records and managed HTTPS coverage. Verify the
unchanged published deploy and old primary/TLS/health, authoritative DNS, exact
reviewed host boundaries, bounded redirects with no loop, and new-host HTTPS.
For app records, require fresh complete inventories and duplicate checks, retained
old-client configuration, reviewed package/name/language/App/Free and owner
acknowledgement of the actual Play declarations. Read back actual new identities
and any provider-provisioned defaults while preserving old apps and keys. These
are additive persistent records, not a cross-provider transaction.

Candidate code publication, primary/canonical/Auth/mail/data cutover, native
identity/build/upload and store release still require their full applicable
checks and exact recovery/approval gates. Local application check76, full web
release and all20 browser journeys now pass on source-bound isolated snapshots;
browser digest9e8e8e04774ca23af878169c64e6704e60cca35a17df3e9c50d560abdb953f00
preserves the passing release's application/dependency inputs. Earlier17/20,
16/20 and interrupted partial attempts remain raw evidence. Thirteen stream-
closure errors are retained with unproven timing/cause. None of this publishes
the candidate or new native app. Ambiguous hosted outcomes still stop further writes; no automatic
retry, deletion or restore follows from independent readiness.

## Ordered contracts

1. Independently verify registrar ownership/delegation, current Netlify account/
   site/deploy, Supabase project/schema, Expo/EAS, Firebase and Play app. Public
   Earlier NXDOMAIN is historical; recheck authoritative delegation and records
   after the owner's purchase confirmation rather than relying on resolver caches.
2. Capture protected configuration, DNS/mail, database/Auth/Storage and artifact
   recovery evidence. Do not reset projects or rotate secrets to improve names.
3. Finish local FE-070/BE-059, review actual visuals, then full/release/acceptance
   and artifact/security gates before publishing candidate code or changing its
   runtime. Independent provisioning above does not publish it. Preserve
   unfinished S141–S144 evidence and scope.
4. Attach new apex/www to the existing site; prove HTTPS and domain control before
   changing canonical origin. Prepare reviewed exact dual-origin actions/CORS/
   Auth callback policy, OAuth consent/display and App Links. Google login stays
   disabled unless separately requested; no paid custom Auth domain is required.
5. Verify the new email-sending domain and DNS records without overwriting mail.
   Choose reviewed sender addresses, preserve recoverable credentials and handle
   in-flight jobs before changing templates/senders. Test controlled delivery.
6. Apply provider-specific changes only under their exact backup/approval guards.
   DEP-029 plan/apply must support the reviewed domain transition before hosted
   Auth changes; no config push, broad REST write or raw-command fallback.
7. If a new Android package is selected, create a separate Play app and Firebase
   Android registration, verify generated configuration/signing and app-scoped
   submission permissions, build and inspect a new binary. Never fabricate a
   Firebase registration by editing old JSON or assume the Play signer certificate.
8. Recreate listing metadata, disclosures, reviewer access, icon/feature graphic
   and real screenshots in en/am/om. New-package closed testing has fresh opt-in
   and qualifying duration; old app/test history is not transferred or discarded.
9. Cut over with monitored old/new host, Auth, media, public/owner/staff/admin,
   support/transport, Tracking, email, push and installed-device checks. Keep old
   API/active anonymous traffic working and redirect safe public GET links with
   handles/query intact. Avoid broad redirects of POSTs and private sessions.
10. Retire old paths/services only after verified adoption and a separate reviewed
    retirement plan. Do not delete the old Play app, credentials or service data.

## Scenarios

GIVEN unresolved domain delegation or package choice WHEN a remote cutover is
requested THEN keep current traffic/signing intact AND continue independent local
design and planning.

GIVEN a proven new HTTPS domain and reviewed origin/Auth/email plans WHEN the
cutover runs THEN MirtPage public pages and workflows work AND old-client API,
account/tenant data, media and active chat access have verified compatibility.

GIVEN new com.mirtpage.app is chosen WHEN it is submitted THEN it is treated as
a separate app with measured signing, new registration/tokens and fresh testing;
the previous package is never claimed to update in place.

## Test plan

Exact target/DNS/HTTPS/redirect checks, protected backups and isolated restore;
dual-domain Auth/action/CORS/App Link tests; current/legacy client and push-channel
compatibility; real email/Mailpit distinction; full local/release/acceptance gates;
artifact package/certificate/config privacy inspection; controlled real-device
login/media/social handoff/notification tests; provider readbacks and monitoring.

## Rollout and rollback

Use staged provider plans with exact fields/digests and recoverable backups.
Rollback code/domain configuration without dropping new data. Unexpected remote
mutations/timeouts stop further writes pending exact recovery direction. No
credentials, private artifacts or customer data enter Git, logs or screenshots.


## S145 local support defaults and complete-ledger preflight

This independent local L3 tranche is implemented and focused-test verified under
BE-059. The historical-ledger correction is implemented and focused-test verified;
its reference-data74 correction and independent peer review also pass. Full
gates remain held for mail-bootstrap readiness and fresh source approval.
Release preflight must
read a bounded ascending version list and admit exactly two complete histories
through74:1..74, or1..26 plus31..74 with27–30 entirely absent. Historical research
under BE-035/DEP-031/ADR-0020 proves27–30 are retired data-only patches; the native
PostgreSQL migrator starts31 and preserves copied ledgers. They are neither
missing structural requirements nor permission to replay old data mutations.
Reject every partial27–30 group, other missing version (including64), duplicate,
noninteger, zero/negative or unknown/future version. A max marker or filtered
count is insufficient. Existing rows/markers are never inserted, removed or
rewritten to satisfy readiness. The endpoint remains shared with fixtures.
Preserve configuration, Auth37/38, identity reconciliation, administrator and
temporary-password checks. Errors report only the reviewed endpoint, never
DSNs, tokens or arbitrary ledger/query values.

GIVEN either valid history stops at63 WHEN release preflight runs THEN fail
before account checks. GIVEN the observed legacy1..26+31..63 history is upgraded
by the real64–74 migrations WHEN preflight runs THEN accept its complete legacy
representation without inventing27–30 markers. GIVEN74 is present but64 is
missing, only part of27–30 exists, or an unknown/noninteger version occurs WHEN
preflight runs THEN fail before account reads. GIVEN either complete reviewed
history WHEN preflight runs THEN existing account/configuration failures remain
effective. The actual runtime reader and
injected failure-order regressions must both prove this contract. Netlify's
normal build remains database-free; runtime health remains a liveness signal,
not proof of schema readiness.

Migration73 changes only future support-label defaults and the current writer,
not old rows or the inactive billing default. Rehearse rollback, replay, data
fingerprints and normal default inserts in an owned local fixture. The ordinary
local runtime has since advanced to schema77 under a separate approved migration;
hosted schema63 remains a separate release state pending its reviewed migration.
No Docker/full-suite/build/provider operation is part of this focused phase;
complete production recovery qualification, exact target, migration/preflight,
monitored rollout and separately approved recovery remain required.


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
Hosted64–74 still requires complete protected recovery qualification, an isolated
restore rehearsal, exact reviewed target/delta and separate approval. The captured
database archive alone does not meet that gate.
Code rollback may retain this forward-compatible row/order; deleting a referenced
category or reversing data needs a separate reviewed beforeimage/operation.
