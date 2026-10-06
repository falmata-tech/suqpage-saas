---
id: DEP-042
title: Expo workspace rollout
status: in_progress
related: [DEP-026, FE-055, DEP-027, FE-053, BE-044, DEP_BASE, ADR-0023]
owners: [product, frontend, backend, security]
last_updated: 2026-09-27
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
