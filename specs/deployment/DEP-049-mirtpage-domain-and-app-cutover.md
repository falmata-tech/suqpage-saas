---
id: DEP-049
title: MirtPage domain, managed services and app release cutover
status: draft
related: [FE-021, FE-070, FE-071, BE-059, DEP-029, DEP-051, ADR-0029, FE-072, BE-060, DEP-050, DEP-044, FE-075, BE-062]
owners: [operations, security, mobile]
last_updated: 2026-10-26
change_level: L4
---

# DEP-049 — MirtPage cutover

## Current web publication and separate native admission

PR #48 is merged as main `75092ef`; its tree matches the qualified task source.
All five required PR and main CI jobs pass. The exact reviewed map-first website,
simpler Featured/footer and white-field installation icons are published as
Netlify deploy `6adfa7a046c301c50af9b164`. `africmade.com` serves this artifact
directly; its canonical metadata still uses the admitted `mirtpage.com` address.
Independent route, asset, image, manifest, worker-file and App Links readback
passes. Provider target and all 41 environment records remain unchanged; deploy
`6ade42137f331c939a820177` remains ready for recovery.
[Traceability](../TRACEABILITY.md#current-s181s184-delivery) owns
exact source, CI, artifact, Linux import, publication and browser evidence.

Website publication does not qualify an installed Android app, service-worker
execution, scheduled-worker delivery, sender credential, device push or Play
testing. DEP-044 owns the separately approved, built and statically admitted
local version2 successor, its canonical version1 predecessor and the saved
MarketVision Play draft. Physical Android, FCM and Play qualification remain
separate gates.

## S179 — selected successor Android package

DEP-044 S180 owns the verified standalone AfricMade Firebase registration and
the next build's pinned public client identity. The already-created app under
`suqpage` remains preserved. The unused S179 native plan is superseded. Local
source check stages, the new-client Expo/export qualification and required remote
CI/integration pass. The exact owner-approved local compilation succeeded once;
independent static binary inspection passes. Device/Play qualification remains
pending; DEP-044 owns actual permission and sender-verification limits.
New-project FCM/EAS credential binding and actual push delivery need
their separate qualification under DEP-043/DEP-044.

The owner selected `com.africmade.app` for a separate AfricMade Play app on
2026-10-25. This supersedes `com.mirtpage.app` as the next submission target,
but does not change the signed MirtPage-package v6 artifact, its Firebase/Play
registrations, the live website, or existing installed apps. DEP-044 owns
the new package, authenticated Firebase registration and client download, exact
app-link association, new native artifact and fresh Play testing. Keep prior app
records and associations intact; no provider write or new bundle is inferred
from this decision alone. The later explicit request to retire only the old
SuqPage Play app follows DEP-044's scoped retirement contract; it does not
authorize deleting Firebase or other applications. The approved standalone
registration is independently verified; DEP-044 S180 owns its exact identity,
client hash and remaining
build/Play boundaries.

## S170 — launch-parity web publication and local Android candidate

The reviewed source tree is merged into `main` by PR #37. All five required CI
jobs passed on the merged commit. The exact Netlify artifact is published on
`mirtpage.com`; fresh public route checks pass. One version 3 Android AAB and a
universal APK derived from it are locally signed and independently inspected for
`com.mirtpage.app`. These are separate web and native delivery outcomes. The
original Netlify operator stops and the Android build wrapper timeout remain
recorded; independent readback and artifact checks support the current outcomes
without rewriting those executions. [Traceability E9](../TRACEABILITY.md#current-release-evidence)
owns the exact commit, deploy, CI, artifact hashes and remaining boundaries.
Installed-device behavior, Play submission and actual closed-test enrollment are
not yet qualified. The approved one-build dependency-advisory exception applies
only to this artifact and does not authorize another compilation.

## S151 — published web recovery; browser classification and device checks pending

Source `d78dcf5`, frozen digest 5129758d…6c1f5, passes the complete check
(including 415 workflow-UI cases and zero skips), web release with zero vulnerabilities,
and 20/20 acceptance. GitHub run 39485239127 attempt 2 has all five jobs successful;
its first failed attempt and local stops remain preserved. B04's separately
approved data/setting operations and B05's finite demo cleanup are applied and
independently verified. The new deployment is published; separate setting
activation and complete hosted workflow verification must not be inferred from
the initial public health checks.

The complete local assembly manifest is SHA c82b49af…e126c. All eight actual
compiled-wrapper synthetic routes pass in Deno 2.2.4 (receipt SHA 4185f343…52b0).
The first actual Linux Node 24 import check loads locked Sharp 0.35.5/libvips
8.18.7, produces a one-pixel PNG and imports the real server/bootstrap without
invoking a handler (receipt SHA f72153db…5ea67). Version 2 AAB and derived APK
are built and pass independent static binary inspection (receipt SHA
026d843a…a294b). Physical workflows, OS push and Play closed testing remain open;
Expo Doctor 19/21 and static-versus-device limits remain documented.

The earlier owner-approved deployment `6ad7d7978faaa5baa6eee605` passed its
initial public/API checks but failed optimized images; its diagnosis and mixed
browser receipt remain retained. B09’s separately approved replacement
`6ad7f59795812d9f56be42a2` is now independently verified ready/published. Release
source is `7e24014`, digest c6ddc736…a3d185; the artifact changes one static file
and reuses runtime compiled from `d78dcf5`. The operator stopped at
`same_deploy_manifest_update`; separate
read-only provider/GET/Chrome evidence establishes the scopes below without
rewriting that stop as PASS or asserting its cause. Previous deploys/before-images
remain retained; no automatic retry/restore follows. Image/worker checks pass,
while browser cancellations and device/Play evidence remain open. The separately
approved thirteen-field opaque-logo Auth HTML update is applied/read back;
traceability E4 retains its actual inbox-delivery limit.

### Generated middleware compatibility boundary

The original unmodified adapter pipeline failed during generated middleware
import. A reviewed 83-byte conditional `globalThis.global` alias was added only
to a copied `___netlify-edge-handler-node-middleware/server/node-middleware.js`.
The installed official edge bundling step completed that copy (receipt
SHA 590d8e8c…16ac). Application source, dependency versions and global tools are
unchanged; this is an artifact compatibility correction, not an application
polyfill or a tooling upgrade. The original failed pipeline and exact before/after
hashes remain retained. The current artifact is qualified by the compiled-route
and Linux checks above. A future unmodified adapter pipeline remains unresolved;
this evidence does not establish a generic adapter or CI pipeline pass.

## S151 — single-compilation Android candidate (static inspection passed)

Prepare one local release AAB for `com.mirtpage.app`, then derive a universal
test APK from that exact AAB with the verified existing signing key and official
bundletool1.18.3. This replaces the earlier operation-specific APK-before-AAB
compilation sequence; it does not waive source, dependency, privacy, signing,
physical-device or Play-release checks. Both artifacts share their version and
compiled application. A tester may need to reinstall from Play later to establish
Play-delivered evidence; a same-version sideload is not an automatic Play update.

The native input closure and lockfile must exactly match the fresh typecheck,
Hermes export and dependency/runtime-exclusion evidence. DEP-044 still requires
explicit owner acceptance of the current unpatched tooling advisories for this
bounded AAB and derived APK. No previous exception carries over. Final source
commit and required gates must be bound before execution; no paid build, new
signer, submission, invitation or closed-test activation is included. Phone
testing remains on hold at the owner's request. The authorized operation now
produces version 2 AAB SHA 2a116c63…125fa and its derived universal APK
SHA 78e8d2fe…145c6 from one compilation. Its terminal receipt,
`native-admission-20261020/one-build/result.json` (SHA 42696aa4…76a0), initially
leaves the artifacts unadmitted. Independent final static inspection now passes
identity, resources, signatures, manifests, privacy and static 16 KB checks:
`native-admission-20261020/post-build-inspection-v2/final-inspection-receipt.json`
(SHA 026d843a…a294b). This does not establish physical-device/16 KB runtime, OS
push, native screenshots, Play delivery or the twelve-person testing clock.

## S151 B09 — published image routing recovery; browser cancellations open

The owner reports missing example pictures. Read-only production diagnosis
confirms five original product/showroom assets return200 and exist in Git. The
Featured hero's exact `/_next/image` variants return400 at640 and3840px; its
original bytes match the repository, and the existing `/.netlify/images`
endpoint returns a valid resized WebP. This is image delivery, not missing data
or permission to remove media. B05's separately owner-approved finite demo-media
reference cleanup is now applied and independently verified; saved files remain.

The first S151 deploy retained a manually added simple `/_next/image` rewrite.
Netlify evaluates the physical `_redirects` file before the generated TOML
rules; that simple rule shadows the installed adapter's query-aware rule and
loses the source parameter. The initial focused source checks did not prove
hosted behavior. Preserve that failed attempt and the two-GET diagnosis in
`s151-image-routing-readonly-diagnosis.json` (SHA ef09c3ab…412a), alongside
`s151-postpublish-receipt.json` (SHA efe75f8d…7148).

Scope: restore the installed official adapter's generated routing contract.
Physical `public/_redirects` contains only the seventeen unchanged exact legacy
asset aliases, with no manual image rule. The generated `/_next/image` rule has
exact query bindings `{ url: ':url', w: ':width', q: ':quality' }` and destination
`/.netlify/images?url=:url&w=:width&q=:quality`; it precedes the queryless
`/_next/image` fallback. Preserve the installed adapter's existing query-aware
`/_ipx/*` compatibility rule between them, rather than adding or broadening any
wildcard. The server function retains the exact `/_next/image` exclusion so
dispatch reaches those official rules. No new provider, custom image loader,
optimizer disablement, remote-image allowlist, secret, hosted setting, media
upload or native change.
Private authenticated media remains on its existing unoptimized authorized
route; never forward browser credentials to the public image CDN. A product
image selected as a cover can retain `/media/product-private-*` through the
supported editor/publication path. Both active Market/Featured image renderers
must bypass optimization for that prefix as well as `/api/page-media/` before
the public optimizer repair is admitted. Assert the actual renderer's original
source/unoptimized contract for both private paths and optimized public assets.
Retain the existing direct-route publication/revocation tests.

This caller guard does not establish CDN-wide revocation: the provider's direct
image endpoint already exists, and its internal cache is not controlled by a
source `no-store` header. No unpublished anonymous leak is established by this
audit. Do not report a UI bypass as proof that an already publicly readable
image can be recalled from every CDN cache; this remains an explicit provider
boundary requiring separate qualification.

```gherkin
Scenario: A valid published picture has a responsive web variant
  GIVEN a published product or showroom picture is available at its public URL
  WHEN Next's existing responsive image URL is requested from Netlify
  THEN the exact image route reaches the existing Netlify Image CDN with its source, width and quality
  AND the browser receives a decodable image at a successful status
  AND the source file, native direct URL and card layout remain unchanged

Scenario: The image repair cannot become a broad asset or private-media rewrite
  GIVEN the release routing artifact is inspected
  WHEN its image route is admitted
  THEN public/_redirects contains only the seventeen unchanged exact legacy asset aliases
  AND the generated query-aware /_next/image rule preserves its exact url, w and q bindings
  AND that rule precedes the official queryless fallback with existing IPX compatibility retained
  AND the server function excludes exactly /_next/image from its catch-all dispatch
  AND no manual image rule shadows the generated rules or adds an external destination
  AND no account, API, private-media or other application route is redirected
```

Definition of Ready: the exact failed/successful URLs, byte identities and
response types are recorded in protected B09 receipts. The installed official
adapter and provider rule precedence determine the repair; no new sync utility
or handcrafted substitute for its query-aware rules is needed.
Primary provider guidance documents
[relative image sources and rewrites](https://docs.netlify.com/build/image-cdn/overview/)
and [routing rule order](https://docs.netlify.com/manage/routing/redirects/overview/).
The installed Next image guide was inspected. Privacy/localization effects are
none: no user text, private access or source membership changes.

Focused regressions must reject the previous shadowing rule, missing/wrong query
bindings, incorrect ordering and missing server exclusion; preserve the original
seventeen-alias checks and private-media renderer/access regressions. Run fresh
source-bound check, web release, acceptance and required CI before assembling a
new exact artifact. Inspect its physical aliases, official generated image rules
and server dispatch together; local Next success alone cannot prove Netlify
routing. Obtain a new exact hosted recovery review and owner approval, preserving
the previous healthy deploy and all failed receipts. Do not infer permission for
a new artifact from the consumed first-deploy approval.

Monitored recovery must GET/decode original and optimized product/showroom
images at 384, 640 and 3840 px, repeat public/private-media checks, exercise actual
Chrome card→preview→showroom→Back on desktop/phone, and verify the scheduled
worker still runs without request-context errors. The approved UI is unchanged;
this is nonvisual routing recovery, with no new visual-approval gate. No automatic
provider recovery or database restore is permitted. Master §§15/19/22 and FE-021
track the same delivery boundary. The exact approved operation has now been
attempted and independently qualified below; this contract does not authorize a
retry, another artifact or an unrelated hosted change.

### Current post-publication evidence and limits

The approved replacement is independently ready/published after the preserved
operator stop; no successful apply receipt or stop cause is inferred.
Public images and the automatic worker are verified. Chrome’s visible tasks
complete, but its overall verdict remains false for unclassified cancellations.
Unique-case path metadata and HTML-fallback/private-fixture limits remain.
[Traceability E5](../TRACEABILITY.md#current-release-evidence) owns exact
source/runtime lineage, receipts, counts and remaining browser qualification.
Physical-device/OS/Play evidence remains separate.

## S150 — Auth email contrast follow-on (hosted readback verified)

The original twenty-seven-field MirtPage presentation repair completed with
independent27-field/214-untouched readback, and one owner-authorized Gmail
message confirmed the new identity and loaded original PNG. The owner then
reported the ink lettering disappearing on a dark email background. FE-070 and
BE-059 provide a versioned opaque-white email PNG at unchanged geometry;
all mobile/SVG/legacy assets stay unchanged. After public asset readback and
exact owner approval, the guarded DEP-029 patch changed only the thirteen
HTML-content fields and passed readback. Subjects/sender and the consumed
one-email authorization remain unchanged; this operation sent no email. Actual
inbox rendering, complete cutover and any other hosted change remain separate.

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
