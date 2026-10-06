# S59 release readiness — 2026-10-05

Status: **not published**. The owner approved the intake and coordinated web/mobile
release. Application rollout remains blocked by the unchanged dependency gate.
No application deployment, database migration, APK/AAB build, store submission,
Git commit or push has occurred in S59.

## Verified

- Clean locked install; source-map-js 1.2.2 patch with malformed/nested-offset and
  valid-mapping regression tests. Next remains at the patched 16.3.6 version.
- Complete application check chain and mobile API, type, build-configuration,
  dependency-compatibility, map and embedded-video checks pass across the recorded
  continuations. Corrected legacy test expectations for removed business tabs,
  compact controls, cache version and the transport entry. One demo-seed fixture
  timed out under concurrent build load and passed an isolated retry unchanged.
- Release build, 65 output-file privacy checks, provider-backed production HTTP
  smoke, PostgreSQL/scale, authorization/security and remaining pre-audit release
  steps pass. Root web-only dependency audit is clean; diagnostic server traces
  contain no Expo/native toolchain files. This does not replace the full gate.
- Full production browser acceptance: nine workflows passed against isolated
  providers. The two corrected search/category workflows pass at 1440/390/320
  using the same production build and existing local providers. Their first
  isolated retry stopped before the app at a temporary Storage startup check;
  this remains recorded as infrastructure failure, not a passing isolated run.
- Netlify target `26c795eb-5560-4a88-b38d-3cc922c2a5e6` serves suqpage.com;
  live health is 200. The actual native `/api/mobile/v1/market` route is still 404.
- Expo target `@falmatad/suqpage`, project `bfc289fb-238e-44a3-9e0f-fec6a7c857d1`,
  is verified. The three public API/Auth variables were added and read back in
  project-scoped preview/production environments. Existing variables are unchanged.
  Protected configuration before/readback evidence: `.local/release-s59/`.

## Release blockers and remaining order

The full workspace audit reports 20 high findings rooted in two packages:
[braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) and
[node-forge](https://github.com/advisories/GHSA-86w9-cpqp-85rv).
Both advisories list no patched release at verification time. No audit suppression,
SDK downgrade or silent web-only exception was applied. DEP-042 explicitly requires
this gate to remain effective; a changed release policy requires its own reviewed
contract/evidence rather than treating the failed command as success.

After resolution: retain a fresh protected production backup,
rehearse migration 59 and rollback, review/commit the exact task scope, validate
and publish the Netlify artifact, and smoke-test native API compatibility. Then
produce signed standalone Android APK/AAB artifacts and verify them on a device.

Public Google Play release also needs confirmed developer access, app/credential
setup, listing/data-safety information and a complete discoverable account-deletion
request path. Current native account screens lack a dedicated deletion entry.
See [mobile distribution](MOBILE-DISTRIBUTION.md). No store-ready or physical-device
claim follows from browser/API tests. The unrelated `deno.lock` stays untouched;
pre-existing and current work remains uncommitted while release gates are open.

## S60 continuation — 2026-10-06

The full dependency audit is unchanged (20 high findings). The newly available
Expo 57.0.26 still depends on the same CLI range; registry latest braces remains
3.0.3 and node-forge 1.4.0. No unrelated SDK upgrade or audit bypass was applied.

A separate diagnostic `npm ci --workspaces=false --ignore-scripts` using the
unchanged manifest/lock installed no Expo, React Native, braces or node-forge.
Auditing that web scope including development dependencies reports zero findings.
This is not a deployable artifact: lifecycle scripts were disabled for the probe,
the current mobile postinstall adapter assumes query-string is installed, and
the Netlify build/packaging boundary has not yet been verified in isolation.
Owner decision is pending on splitting web and mobile releases. A legitimate
split must keep both audit gates effective, explicitly validate the web install
lifecycle and packaged dependency set, retain API/security/browser checks, and
leave Android blocked. No release-policy change or web deployment has occurred.
Private diagnostic files: `.local/release-s60/`; audit output under `/tmp`.

FE-055 now adds dedicated deletion-request instructions and links in the local
web/native candidates. Both typechecks, localization/spec checks and thirteen
web/native-browser layouts pass, including Account before business setup. The
temporary local Auth fixture was removed. Visual review is pending at
`http://127.0.0.1:3102/account-deletion` and
`http://localhost:8082/account-deletion`; screenshots and verification are in
`.local/account-deletion-review/`. The native preview was restarted to load the
new catalogs; it remains available on 8082.

This provides a discoverable request path to the existing contact email, not a
tested automated purge. Actual request handling, retention, physical email
handoff and public-store requirements remain open; see
`docs/operations/ACCOUNT-DELETION-REQUESTS.md`. No customer deletion, live request
email, production mutation, release commit, push or APK publication occurred.

## S61 continuation — 2026-10-06

The newest request selects web plus Expo internal Android distribution and defers
Google Play. The new deletion entry is approved for inclusion. S61 establishes a
clean isolated web dependency boundary without waiving the Android audit. Full
web checks, all 11 isolated browser scenarios, release stages, protected backup/
restore/migration rehearsal and exact Netlify Linux artifact tests now pass.
Source commit, production migration and publication follow these gates. Android
remains blocked pending an explicit narrow tooling-risk decision or upstream fix.
See `SUQPAGE-RELEASE-2026-10-06.md`; the original S59 failure record above is retained.
