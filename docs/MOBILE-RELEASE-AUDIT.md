# Mobile release audit — S50

FE-053 / BE-044 / DEP-042. In progress, updated 2026-10-05. No claim of release readiness.
User approved verification and installable test-build preparation after S49 review.

| Flow | Connection/evidence | Findings / action |
| --- | --- | --- |
| Market/search/map | Canonical discovery PostgreSQL query → public DTO → native map/drawer | Browser scopes/paging passed; native MapLibre build/install/first render/drawer pass; physical-phone gestures remain |
| Featured | Canonical schedule/reveal/sponsor data → native day/grid | Review live state and current-day behavior before release |
| Showroom/products | Published catalog/page DTO → native gallery/contact/inquiry | Inline YouTube device playback remains unverified |
| Single/group inquiry | Canonical validated/idempotent inquiry write → owner list | Options/contact actions corrected; isolated PostgreSQL regression passes |
| Email/signup | Supabase OTP → verified bearer → canonical workspace creation | Auth/storage failure recovery implemented; real local OTP workflow passes |
| Owner home/navigation | Scoped home/catalog → native tasks | Reserved route parameter fixed; real owner forms, refetch and draft link checks pass |
| Business/location | Canonical versioned location/name/category update | City choice seeds coordinates; zero preserved; UI location/save/publication passes |
| Page/media/publication | Canonical page save/publication/media storage + video review tickets | Rich private preview and first publication pass through UI; scoped logo regressions pass |
| Offerings | Multipart media → canonical transactional/versioned upkeep | Real browser photo create/update/hide/public visibility passes; ignored native listing state fixed |
| Owner support | Scoped persisted thread/reply/close/reopen | Scoped attachment API/UI implemented; retry/read/cross-tenant denial tests pass; native picker still needs device coverage |
| Buying assistance | Opaque token, persisted message/status, closed history | Confirm staff reply visibility and end/recovery through API regression |
| Security/settings | Current role/tenant per request; handle cooldown and account phone | Session expiry/logout and contact actions require focused regression |
| Distribution | Expo SDK tooling installed locally | EAS project and preview signing ready; production native API rollout remains unverified/unfinished |

Release blockers: backend rollout after gates; actual installable APK and device
checks; native map/device verification; Play account setup before store submission. No private
customer records or credentials belong in this report. Store account deletion/data
safety/privacy requirements must be reviewed before public store submission.

S50 checkpoint: verified the owner's Expo login and created/independently checked
`@falmatad/suqpage` (see MOBILE-DISTRIBUTION.md). Mobile typecheck, seven localization
tests and build configuration checks pass. Real PostgreSQL mobile API tests pass,
including support attachment retry/read/cross-tenant denial, logo update/removal,
version conflict and the existing inquiry/buying workflows. Photo selection now
uses the system picker without broad media access. Full release/device gates remain
open. The dependency audit found decoder/UUID advisories; the subsequent clean install
and targeted decoder/UUID fix passed: production npm audit reports zero advisories;
Unicode query round trips, bounded malformed input and Xcode UUID compatibility
pass. Full npm run check passed before MapLibre replacement. EAS preview signing
is configured; the public signing SHA-1 is recorded in MOBILE-DISTRIBUTION.md. No build/upload to a store.

MapLibre continuation (2026-09-29): both native architectures compile, final
packaged permissions pass, development APK installs and renders OSM tiles/public
pins/controls in the API 35 emulator. Drawer layering and attribution are visible.
Nine fixture-tile browser alignment groups and 13 local browser workflow groups
pass. Native captures/checksum/limitations: MOBILE-MAP-RESEARCH.md. This does not
complete the standalone tester release or the remaining workflow audit.


2026-10-05 verification and correction:
- The older 13-flow navigation capture only opened owner screens. Inspection found
  those screenshots showed Page not found, so that evidence did not prove owner
  forms worked. Renamed Expo's reserved `screen` route parameter to `section`
  without changing public URLs. The capture now asserts each form/control exists.
- `capture-mobile-owner.mjs` creates a unique disposable local owner and verifies
  unsaved private preview/media/gallery/contact details, retained edits, cover save,
  photo-backed service create/update/hide, price persistence, location selection,
  first publication and exact public offering visibility. It returns its audit
  workspace to draft afterward; existing demos and hosted data are untouched.
- Fixed a shared read/write rate counter that caused normal screen/photo reads to
  exhaust saves. Also opted the native adapter into explicit availability/visibility
  changes while retaining locked advanced metadata. Existing simplified web-save
  preservation tests still pass. Private browser photos wait for authenticated blobs
  rather than making an unauthenticated image request first.
- Marker parity: same storefront glyph/name labels, numbered clusters, nearby lists,
  selected color and server-projected live/featured badges. Supercluster viewport
  queries reuse the web radius/thresholds. Focus never zooms out. MapLibre Android
  renders and native marker tap opens the correct business preview; captures in
  `.local/mobile-owner-review/native-markers.png` and `native-marker-preview.png`.
  Fixture-tile browser checks cover cluster expansion, nearby list/preview and clean
  remount; nine alignment groups and the strengthened 13-flow browser check pass.
- Local PostgreSQL mobile API/security tests, web product-upkeep/gallery regressions,
  mobile typecheck, marker model, YouTube boundary tests and spec validation pass.
  Physical-phone video/fullscreen/offline/picker and final release gates remain open.

Dependency recheck on 2026-10-05 supersedes the earlier clean audit snapshot:
Next is patched locally to 16.3.6 for GHSA-vcvr-r3jv-pc5j (no app next/og imports
found). The remaining 20 high audit entries derive from Expo tooling paths to
braces (GHSA-vfj7-8cjw-p6xm) and node-forge (GHSA-86w9-cpqp-85rv), with no published
fixed version listed. Release audit is not clean; do not downgrade SDKs or suppress
that gate. Review actual build/runtime exposure and an upstream fix before rollout.

Advisory references: [Next.js patch](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j),
[braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm),
[node-forge](https://github.com/advisories/GHSA-86w9-cpqp-85rv).
Expo reserves the route parameter `screen`; see
[Expo URL parameters](https://docs.expo.dev/router/reference/url-parameters/).
The installed Next patch has type/runtime checks; production build/release checks
are still required. No hosted change or scoped commit has occurred.

S59 release attempt (2026-10-05): source-map-js was updated from 1.2.1 to
1.2.2 after the new GHSA-68fv-2mgg-jv7q advisory. A clean locked install and
`test-source-map-security.cjs` pass malformed/nested-offset rejection and normal
map behavior; the production build and trace privacy checks pass. Audit remains
blocked by 20 dependency-graph findings rooted in braces and node-forge, with no
patched upstream release available. No audit suppression or SDK downgrade was
applied. The release command passed its preceding gates and exited at the audit.

The expected Netlify/Expo targets are verified. Three public API/Auth variables
are configured and read back in the Suqpage project's preview/production EAS
environments. Existing variables and hosted Auth remain untouched. Native APIs
still require the gated web rollout; no managed Android build or store submission
has been started. Play Console account confirmation remains pending.

## S61 fresh Android export — 2026-10-06

Production-configured Android export succeeds with 1,561 mapped sources and no
braces, node-forge, certificate-signing helper, pg or Next sources. Expo's standard
Metro loader is included as expected. Export SHA-256:
`916065316dce94e3a6fcdf72f1874c1e73788760b0ffb110ad1e5f0e07d9b578`.
This is export evidence only. Full native audit still fails on the same two tool
roots; a narrow internal-APK exception awaits owner decision. No signed APK,
native-device pass or Play readiness is claimed. Web's isolated build is clean and
verified independently; see `SUQPAGE-RELEASE-2026-10-06.md`.

S61 live API evidence: deployed with web `6ac519154e7f2c72e452f5be`; market,
products-only results, typo search, multi-place queries, featured, showroom,
empty transport session and unauthenticated owner/session denial pass. This
does not replace standalone map/video/auth/device checks.
