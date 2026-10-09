---
id: DEP-042
title: Expo workspace rollout
status: in_progress
related: [FE-061, BE-049, ADR-0025, FE-060, BE-048, FE-059, BE-047, FE-058, FE-056, DEP-026, FE-055, DEP-027, FE-053, BE-044, DEP_BASE, ADR-0023, FE-057, BE-046, ADR-0024, DEP-043, DEP-044]
owners: [product, frontend, backend, security]
last_updated: 2026-10-09
change_level: L3
---

# DEP-042 — Expo workspace rollout

S50 dependency recheck (2026-10-05): audit reports GHSA-vcvr-r3jv-pc5j against
Next 16.3.4; raise only Next to its patched 16.3.6 release and verify runtime,
type/build and audit evidence before rollout. App source currently has no next/og
ImageResponse imports. GHSA-vfj7-8cjw-p6xm (braces) and GHSA-86w9-cpqp-85rv
(node-forge) affect the Expo development/signing tool dependency graph with no
patched release listed. Do not downgrade Expo/RN or suppress the release audit to
claim success. Record exposure and upstream/remediation requirements explicitly.

## Problem

Visitors and business owners need native access to Suqpage without exposing staff management.

## Scope and contracts

Add npm workspaces for `apps/mobile` and real shared contracts. Keep the existing
web app at the root in this first migration step to preserve commands, environment
loading and Netlify paths. Moving web to apps/web is a separate validated step.
Shared packages cannot import Next, pg, Node filesystem, privileged config or an app.
Web typecheck excludes native source; native typecheck explicitly covers its own
source and pure packages. Pin a compatible Expo/React/RN set from the SDK template.

No hosted configuration mutation, app-store submission, paid build, Android map
provider billing setup or automatic web deployment occurs in this implementation.
Native API deployment is a subsequent reviewed web rollout. The mobile app uses
an explicit API origin and public Supabase configuration; there is no hidden demo
fallback. Export/package scans reject server imports and secrets.

## Scenarios

GIVEN root npm run dev WHEN launched THEN the existing web flow is preserved.
GIVEN native exports WHEN built THEN no server/database runtime enters the bundles.
GIVEN unavailable API/config WHEN app starts THEN a clear retry/setup error replaces
mock success. GIVEN prior production web WHEN native work is incomplete THEN the
published deployment remains unchanged.

## Test plan

 locked install, workspace boundary tests, web/mobile typechecks, native
bundles, Expo doctor, focused UI review, then release/acceptance gates. Native device
and signing/provider-key checks remain explicit before beta/store claims. Rollback
removes the mobile client/API adapter release while retaining existing web data.

## Readiness

The owner authorized visitor pages and business-owner dashboard, excluding admin
management. Scope, permission/failure contracts, verification and rollout boundaries
are explicit. Implementation may proceed; visual approval and native-device evidence
are required before release claims. Track ordered evidence in checklist S49.

## Rollout

Review focused phone and tablet captures first. Keep this feature in progress until native device checks, required gates and a separate API rollout are verified. No store submission is authorized.

## Local testing environment

The owner additionally authorized installing missing Mac tools for browser, emulator
and physical-phone testing. Inspect CPU/OS/disk and installed SDKs first; reuse
existing tools. Install compatible Android SDK/JDK/emulator tooling, verify a native
launch when supported, and document exact commands. Do not purchase developer
memberships or publish builds. Apple account prompts and unsupported OS/Xcode
requirements remain explicit external steps. Local phone testing uses a LAN API
origin; development credentials stay local and only public Auth configuration is
passed to the mobile client.

S49.2 adds the Expo-compatible react-native-webview for isolated YouTube embeds.
Verify locked SDK compatibility and phone playback/fullscreen before beta; browser
iframe checks alone are insufficient. No backend rollout.

## S50 — internal Android distribution preparation

The newest owner instruction supersedes the preview-only build boundary above:
audit/fix workflows, run gates, build an installable Android APK and prepare managed
invitation/store workflows. Owner approval permits proceeding past the S49 visual
review gate. No store fee, paid build, account creation or invitation sending is
inferred. Choose Expo EAS internal APK distribution where the owner's account is
available; retain a reproducible local Android build path. Production AAB is a
separate Google Play internal-testing/store artifact, never label an AAB sideloadable.

- An internal APK contains a release JS bundle and cannot depend on Metro.
- Build profiles validate public API/Auth configuration and
  application/signing identity. No local-development defaults silently enter a
  hosted test release. Missing provider/account data is an explicit blocker.
  Metadata-only configuration can resolve before keys exist for signing setup;
  EAS workers and the build post-install hook must validate hosted prerequisites
  before compilation. A successful credentials command is not build verification.
- Preserve signing material in protected ignored storage/provider credential store;
  never include private keys, service roles, backups or local env files in uploads.
- Record artifact checksum, version, target, gates, installation/device evidence
  and remaining limits. Never claim native behavior from browser screenshots alone.
- Publish compatible mobile APIs only after existing release/acceptance, protected
  backup, target and rollback checks. Public store submission remains a distinct
  owner-controlled step after internal testing, privacy and account requirements.

The native map uses MapLibre React Native 11.4.0, its Expo plugin and OSM raster
 tiles; browser preview remains Leaflet. No Google Cloud, Maps billing or map key
is required. Preserve Expo project/signing setup. The owner explicitly permits
SDK-internal SQLite tile caching; it is not an application database. Expo Go
cannot run this native module: use a rebuilt development client or standalone APK.
Compatibility research and source links: docs/MOBILE-MAP-RESEARCH.md.

S50 dependency remediation keeps Expo's SDK versions while using the patched
decode-uri-component 0.5.0 and xcode's compatible UUID v4 export from 11.1.1.
The former changes from CommonJS to ESM: a version-checked install adapter updates
query-string 7.1.3's single import to its default export, failing closed on source
drift. Test query round trips (including Ethiopic and malformed input), native
bundling and Xcode UUID generation; retain the moderate-severity audit gate.

## S59 — approved coordinated release, 2026-10-05

The owner approved the paired intake and requested web and mobile production
rollout, superseding the earlier implementation-only deployment boundary. Follow
DEP_BASE gates and backup/rollback checks. Publish the compatible API before
distributing a production-connected client. Build a signed standalone Android APK
for direct testing and an AAB for the managed Play workflow; no successful store
publication is claimed without account/listing/privacy/testing prerequisites and
provider confirmation. Do not purchase memberships or paid builds implicitly.
Keep any release failing the dependency audit or required workflow gates blocked
while resolving its concrete cause. Current checklist: S59.

S59 security remediation: update the transitive source-map-js 1.2.1 lock entry to
the upstream 1.2.2 patch for GHSA-68fv-2mgg-jv7q. Preserve PostCSS/Next/Expo APIs
and audit severity. Verify locked installation, source-map mapping behavior,
production build and registry audit; do not infer that this resolves the separate
braces/node-forge advisories.

S59 evidence: clean locked install, source-map security regression, production
build, 65 output-file privacy checks, provider-backed API/auth/health smoke and
the remaining release-script checks before audit pass. The release command exits
at its unchanged moderate-severity audit gate: 20 findings rooted in the two
unpatched Expo dependencies above. Public Expo settings are verified for preview
and production; native API deployment and artifact distribution have not occurred.
See docs/MOBILE-DISTRIBUTION.md and the S59 checklist for rollout state.

S59 final browser evidence: nine isolated production workflows pass; corrected
category/search captures pass at 1440/390/320 against the production build and
existing local providers after a temporary Storage startup failure prevented the
focused isolated retry. This does not claim one all-green isolated run. Native
API/publication, fresh backup/migration rehearsal, signed-device and store gates
remain open. Complete status: docs/SUQPAGE-S59-RELEASE-READINESS.md.

## S61 — web and Expo internal APK release, 2026-10-06

The owner approved proceeding after the deletion-screen review and selected Expo
Android distribution; Google Play publication and production AAB work are deferred.
Use the existing preview/internal APK profile with the verified production API.
No Play setup or membership is required for this delivery target.

Separate web installation from native build tools using npm's selected shared
contracts workspace plus the root application. Do not move the web app or change
application dependencies. An explicit web-install mode may skip only the mobile
query-string compatibility adapter after proving the Expo toolchain is absent.
Normal installs retain the guarded adapter. The web release must reject a full
workspace install, audit all selected web/build dependencies at the existing
severity, build and validate the actual Netlify artifact, and preserve every
application/API/security/browser/backup/migration check. Netlify's install/build
configuration must enforce this same boundary. Full workspace/mobile audits stay
unchanged; this is not an exception for Android advisories.

GIVEN the web release target WHEN Expo or the affected native build dependencies
are resolvable THEN stop before building. GIVEN an isolated web install WHEN the
normal lifecycle and root/shared audit pass THEN run existing release checks and
scan the generated function archive for accidental native tooling. GIVEN an Expo
internal APK WHEN required mobile/security checks fail THEN do not publish it
merely because Google Play has been deferred.

Readiness: scope is limited to install/release boundaries and target selection.
Test normal versus explicit-web postinstall, rejected contaminated installs,
clean locked root/shared install, audit, build/trace, API/browser acceptance and
exact Linux archive. Rollback restores prior Netlify install/build configuration
and previous compatible artifact while preserving schema/data. Master section 22
and the S61 checklist describe verified results when complete.

S61 verified candidate: normal isolated lifecycle install, full selected web audit
with zero findings, clean check command, all 11 isolated browser acceptance tests,
release stages (documented local-test-URL continuation), operations restore,
production migration 59 rehearsal and exact Netlify Linux artifact checks pass.
Android audit remains failed; no exception or publication is implied. Operational
evidence: docs/SUQPAGE-RELEASE-2026-10-06.md.

S61 staging contract: the mobile `.env.example` is a public local template, not
runtime configuration. Permit only that exact nested path after checking its
staged values are the two documented localhost origins and an empty public key;
keep other nested environment paths and populated keys blocked. Verify in an
isolated Git fixture, including an injected secret, real .env.local and undeclared
files. The existing root-template policy is unchanged.

S61 web/API is deployed and independently verified at https://suqpage.com, deploy
`6ac519154e7f2c72e452f5be`. Production schema59, protected routes, transport
sessions and native market/featured/shop endpoints pass live checks. Expo APK
publication still awaits its explicit risk decision/remediation and device gates.

## S62 — approved one-artifact Expo testing exception

On 2026-10-06 the owner explicitly accepted the reviewed exception for one
preview/internal Android APK in `@falmatad/suqpage`, using the deployed production
API. Limit it to braces 3.0.3 / GHSA-vfj7-8cjw-p6xm and node-forge 1.4.0 /
GHSA-86w9-cpqp-85rv in the existing reviewed tool graph. Continue to report the full
audit as failed. Recheck the advisory set and lockfile; any new advisory or
dependency change needs reassessment. All other gates remain required: mobile
type/contracts/API/map/video/build checks, trusted clean source, public settings,
existing signing identity, APK inspection and native-device verification.

Use Expo internal distribution only; no Play submission, paid build, invitations,
provider-secret change or application-data migration. The exception expires with
this delivery and is not a general audit bypass. Readiness is met for operations;
S61 web/API gates and schema59 remain verified. Master section22 and the S62
checklist record the approved scope and actual artifact state.

S62 fresh-audit reassessment: the registry now reports sharp <0.35.5 and
shell-quote >=1.8.4 <1.11.0 in addition to the approved advisories. These new
findings are NOT accepted. Pin sharp 0.35.5 (including Next's override) and
shell-quote 1.12.0 (above the 1.11.0 fix floor), preserving SDK/application APIs and other lock versions.
Use `scripts/test-release-dependency-security.cjs` to verify blocked comment/newline injection, ordinary Unicode quoting, installed
librsvg >=2.63.2, PNG/JPEG transformations, locked install and audit reduction to
only the two approved roots. Re-export mobile and run native build gates; rebuild
and verify the affected web runtime before declaring the patch deployed. No
provider, database, feature or UI change is part of this remediation.

S62 archive privacy correction: EAS checks the literal `.git` path when stripping
its temporary shallow clone. A directory-only `.git/` rule does not satisfy that
check. Exclude both the literal path and its descendants; verify with the same
ignore semantics and a fresh `eas build:inspect --stage archive`. No Git objects,
local configuration, backups or signing files may enter the uploaded archive.

## S66 — public domain association and rebuilt Android client

Owner authorizes verified suqpage.com link implementation. Associate only the
existing verified com.suqpage.app.preview public SHA-256 certificate; do not infer
production/Google Play signing or Apple Team identifiers. Register exact canonical
HTTPS public route filters with autoVerify and validate incoming paths in Expo
Router. Serve /.well-known/assetlinks.json as public application/json over HTTPS,
without an Auth redirect or private config. Deploy against a verified live-site
identity with rollback evidence; this is additive static metadata, no DB/Auth write.

Required evidence: signed APK certificate verification, config/route security tests,
association HTTP checks, web release/build/privacy gates, exact deployed readback,
rebuilt signed native artifact and cold/warm link verification on Android. Use the
existing owner Expo account/free internal distribution; no paid build, store
submission, credential replacement or invitations. Review the current audit and
its exact artifact-scoped exception before admitting a new managed build. iOS
configuration/public association remains pending verified Apple identifiers.

S66 focused evidence: five app-link routing/config/security tests and six outbound
link tests pass. Existing mobile contract/PostgreSQL API/build/dependency/map/video
gates pass; mobile typecheck and spec validation pass. Expo introspection verifies
actual generated Android autoVerify manifest filters. Android JS/Hermes export
passes. Six browser checks verify public local association JSON, cold/warm Market
scope restoration, repeated-link restoration, retained interactive edits and a
real product destination.
Private evidence: .local/app-links/. Browser/port tests are not Android OS-domain
verification. Native audit still fails on exactly braces/node-forge (20 high, zero
critical), requiring review before the next artifact. Domain/native rollout pending.

S66 domain rollout verified: deploy 6ac576417f18a89035f75274, isolated web source
70fb961d9f11dba9465b5f6bacfe6c57b8bf7735 (current live source plus association metadata).
The exact JSON is served at https://suqpage.com/.well-known/assetlinks.json with
HTTP 200 with application/json and no redirect. Seven live association, site, health and
mobile-API checks pass. Linux handler/image and packaged production health/login
checks pass; full selected web release has zero audit findings. Code rollback is
6ac52555a812ad5c89621401; schema/Auth unchanged. Mobile source 87fa05e and its
clean 1,493-file archive are ready; the original one-artifact exception expired
with finished build 2018cc70. Owner renewal for the next exact source is pending
in .local/app-links/android-rebuild-review.md. No new APK, Android OS-link/device
verification or iOS association is claimed. Private receipts: .local/app-links/.

## S67 — renewed internal APK scope

The owner's latest instruction approves one additional internal Android APK with
all latest changes plus the contextual locale review and preview-first setup.
Rebind that approval to the exact tested final commit before submission. The fresh
audit remains failed: 20 high graph findings, zero critical, exactly the existing
braces/node-forge roots. No new advisory or dependency is accepted. Preserve the
free queue, existing signing identity, production public configuration and all
other source/archive/runtime/signature/device gates. Play and iOS remain deferred;
no invitations or credentials/configuration mutations are authorized by this build.


S67 artifact finished from c1872d5 as build 4d6df1a5-795a-4f80-999d-feaa0b679f22.
Source/archive/signature/runtime/device App Links checks pass. Native inspection
found blank trusted static SVG media in the original Photo adapter, requiring
S69 correction. The one-artifact exception is consumed; a second managed APK
needs renewed exact-scope admission. See MOBILE-DISTRIBUTION.md and TRACEABILITY.

S69 owner approval: the owner explicitly approved the corrected native logo preview
and one replacement free Expo Android APK under the same two-advisory tooling
exception. The reviewed four-file source digest is
0518cf608fd26f2410a4eaa065ce3bac86ae296c89b59d8a707111761e3c317e.
Bind that reviewed correction to the final tested commit; retain clean archive,
public config, existing signing, certificate/runtime and installed-device checks.
No additional artifact/advisory, dependency, paid build, Play/iOS rollout or
invitation is admitted. Private review: .local/rebuild-s69/.

S69/S70 rollout completed: exact source 6c27025 is published in web deploy
6ac5c9940ee5deb5294319ef and finished Expo internal Android build
9bcabbdb-14eb-420d-a2cf-8d84e0ec8c75. The prior web deploy 6ac576417f18a89035f75274
is the code rollback. Protected target/artifact/source/archive/runtime/signature
and live readbacks pass; schema/Auth/SMTP/DNS are unchanged. Signed emulator
installation, OS-domain verification, corrected SVG logo, five locales and public
navigation/gallery pass. One Android System UI/launcher ANR interrupted the first
screen checks; restarting that process allows the bounded retry to pass. It is
recorded as infrastructure failure, not a clean initial device run.
The full native-toolchain audit remains failed (20 high, zero critical, exactly
the admitted braces/node-forge roots). The single-artifact exception is consumed.
No additional build, paid plan, Play/iOS release or invitation is authorized by it.
This spec remains in_progress for explicit physical-phone/real-email/social-app
and store limits. Exact downloads, hashes, gates and limits are in
docs/SUQPAGE-S69-S70-RELEASE-2026-10-06.md; private evidence .local/rebuild-s69/
and .local/web-s70/.

## S96 — one permanent Suqpage application identity

Ready L3, DEP-043/FE-053. The owner rejects a separately named/registered test app.
GIVEN development, internal APK or production store builds WHEN configuration
resolves THEN display Suqpage and use com.suqpage.app on Android (and the same
existing iOS identifier), independent of build profile. Preview remains an
internal distribution profile only; it never changes name/package. One canonical
Firebase Android registration/client source can serve both hosted profiles.
GIVEN successive internal/store builds THEN use the same remote version source
and automatic version-code increments, preserving APK versus AAB distribution.
GIVEN legacy installed preview APK/certificate metadata THEN retain its association
and private signing source; never relabel its certificate as canonical without
signed-artifact verification. The old package cannot be updated in-place into the
new one; the next admitted canonical APK is installed once. Future builds use the
same identity and reviewed signing continuity. No credential generation/replacement,
store submission, paid build or association publication occurs in this source change.
GIVEN Firebase selection THEN register only com.suqpage.app in the selected project
suqpage (588262779708). Do not ask the owner to register two apps or rename later.
GIVEN build admission THEN preserve all target/public-key/provider, upload/privacy,
signing, app-link association and device gates; new package requires its exact
credential binding and verified certificate before claiming HTTPS App Links.

Tests: scripts/test-mobile-build-config.cjs (all profiles, stable identity and
version/distribution); scripts/test-attention-platform.cjs (both profiles accept
canonical Firebase config and reject legacy/foreign packages);
scripts/test-mobile-app-links.ts (legacy association preserved, no fabricated
canonical certificate); actual Expo public-config identity resolution.
Master §§15/17/22 reflect the local candidate. All-profile build/Firebase tests,
five route/association security tests and actual Expo public-config resolution
pass. Both hosted profiles resolve Suqpage / com.suqpage.app with one remote
version source and automatic increments. Protected identity evidence:
.local/notification-review/firebase/canonical-app-identity.json. No remote
credential, signing, certificate association or binary change has run. Full
release/signing/device gates and the canonical Firebase source remain pending.

## S97 — guardrails for one-app testing and distribution

Ready L3/security operations, DEP-043/BE-044/FE-053. Owner confirms one permanent
app and requests safeguards/workflows. Recurring release checks justify a small
SDK artifact verifier; no generic release platform, new provider, UI or data mutation.
GIVEN hosted APK/AAB configuration THEN require an explicit approved data target;
pin API/Auth/Expo project and reject unknown targets, private/local/unreviewed
origins, public secret keys or conflicting EAS/requested profiles before building.
The currently approved production target is the existing verified Suqpage API/Auth
realm. Preview is internal distribution against that explicitly selected target,
not an isolated staging backend; test only labelled demo accounts/records there.
Local QA remains on local previews. Staging cannot be selected until independently
verified and added through review.
GIVEN either profile THEN preserve internal APK versus store AAB and remote
auto-increment settings, require a reviewed committed source and keep store
submission on internal draft. EAS build workers validate profile/environment
configuration in the post-install hook. Repository checks detect profile-policy
drift; direct privileged provider commands are outside these controls.
GIVEN notification client JSON THEN pin Firebase ID/number/canonical package, reject
private credential material at any depth, and exclude FCM service-account files
from archive uploads. No private FCM/Expo account/signing key enters app/runtime.
GIVEN a malformed client file WHEN validation fails THEN return a generic JSON
error without quoting source bytes, including accidental credential fragments.
GIVEN a downloaded APK THEN inspect its actual signed certificate, package,
version and debug flag using bounded SDK commands with argument arrays. Reject
unconfigured/mismatched certificate pins, extra signers, wrong package, debug
builds, malformed metadata and version codes not newer than the selected prior
canonical APK. A first canonical release requires explicit operator selection.
Generate a checksum and metadata receipt only after admission, outside Git; do
not edit/install the APK or change signing credentials. No claimed signer/version
snapshot substitutes for inspecting an actual artifact. Missing tools fail clearly.
GIVEN signing initialization THEN leave the canonical certificate unconfigured
until independently verified/reviewed; never borrow the legacy preview certificate.
GIVEN Google Play rollout THEN test Play-distributed APK signing against the same
policy and prior APK before public release; an upload-key AAB is not such proof.

Tests: build target/profile/key failures in test-mobile-build-config.cjs; Firebase
client/secret rejection in test-attention-platform.cjs; typed artifact/SDK parsing,
wrong certificate/debug/package/rollback and real legacy-APK negative inspection
in test-android-release-safety.ts. SDK mocks are labelled; actual signature
inspection is separate. Master §§15/16/17/22 and MOBILE-DISTRIBUTION workflow
are affected. No remote configuration, build or publication is authorized by a
passing local guard. Existing backup/visual/full-release/device gates persist.

S97 local evidence, 2026-10-08: web/native typechecks, build/Firebase guards and
three typed release/SDK tests pass. Actual bounded SDK inspection of the historical
APK reports com.suqpage.app.preview, version 1, nondebug and its verified legacy
certificate; canonical admission rejects the unconfigured signing pin. This is
separate from mocked SDK tests. MOBILE-DISTRIBUTION and master §§15/16/17/22 now
describe the constrained workflow and limits. No signing key, binary, device
installation or public association has changed. Full release/visual/commit and
canonical signer/device gates remain open; the specification stays in progress.
The focused malformed-JSON regression additionally confirms failure output does
not include source excerpts or accidental credential fragments.

S98 exact rollout review is explicitly approved by the owner: securely back up
only the reviewed existing EAS signing source and reuse it for com.suqpage.app,
preserving legacy credentials; one free internal APK may proceed under the same
braces/node-forge tooling findings if every other gate passes and fresh archive/
export/APK/device evidence is verified. The exception expires after that artifact,
admits no new advisory/dependency and does not claim a clean full audit or authorize
Play submission. Existing certificate, source, backup and actual-signature checks
remain mandatory; no new signing key is generated as a convenient fallback.

S98 signing acceptance: GIVEN the owner-approved existing source WHEN official CLI
binding and independent readback confirm the same key bytes/certificate and
canonical default THEN pin that verified public certificate for com.suqpage.app
and retain the historical preview association unchanged. Until that readback, the
canonical pin stays empty. GIVEN either admitted identity WHEN creating intents
THEN only the exact public HTTPS Suqpage routes are claimed; unknown packages,
untrusted/private URLs and malformed fingerprints remain denied.
Test: scripts/test-mobile-app-links.ts plus protected independent binding and
actual APK inspection; a configuration match is not installed-device evidence.


S98 canonical build started, 2026-10-08: exact committed source a81c93f,
clean archive/export privacy, unchanged one-artifact tooling exception, independently
verified existing signer, Free quota and successful production web/API checks admit
one internal build 565b9614-428d-47b4-8780-2b0f9c96d68b. Permanent package
com.suqpage.app and remote version code 2; no new signer, paid build or Play submission.
Actual artifact/signature/installed checks pass below. Production now serves
the exact canonical plus preserved legacy association. See the S98 release record.


S98 Android artifact/installed evidence: build 565b9614-428d-47b4-8780-2b0f9c96d68b
finishes on Free (6/30, zero cost), source a81c93f. Actual nondebug package
com.suqpage.app/version 2 and pinned existing signer pass SDK inspection. APK
SHA-256 a7acae61994fbd6ed5440dd46fa3cdf8fecb50681e91db210fb5a523a158bea7.
Actual Firebase client resources, notification permission and canonical HTTPS intents
match; artifact/export/archive exclude private data/credentials and admitted tooling.
The APK installs/launches on isolated API 35. Android verifies suqpage.com. Twelve
public/locale states, real map tiles, cluster expansion, labelled shop selection and
preview-to-store navigation pass, with no app crash/keyboard-metrics/text-node error.
No account sign-in or customer inquiry/chat is created by native smoke. Emulator is
closed. Physical-phone/browser OS alert and authenticated hosted workflow evidence
remain outstanding; DEP-042/DEP-043/FE-062 stay in_progress. See the S98 release record.
