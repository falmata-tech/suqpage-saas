# Android tester distribution

DEP-042 / FE-053 / S50. Standalone tester setup remains in progress. A local development APK now builds
and runs in the emulator; it requires Metro and is not the tester release. See
MOBILE-MAP-RESEARCH.md for its path/checksum and verified scope.

The owner selected the Expo account **falmatad**. The linked project is
[Suqpage on Expo](https://expo.dev/accounts/falmatad/projects/suqpage), ID
`bfc289fb-238e-44a3-9e0f-fec6a7c857d1`. Verify it with
`npx eas-cli@latest project:info` from `apps/mobile`.

## Maps and signing

The native map uses MapLibre with OpenStreetMap raster tiles; browser preview uses
Leaflet. Expo Go cannot run the native SDK; use a rebuilt development client or APK.
No Google Cloud project, billing setup or Google Maps key is required. The earlier
Google setup instructions are withdrawn.

The EAS-managed preview signing certificate belongs to `com.suqpage.app.preview`.
Its public SHA-1 is `D2:5C:49:53:9C:98:E8:33:F8:B9:4C:E1:E3:66:6F:A3:9C:16:62:C4`.
Private signing material remains in EAS and has not been downloaded.

## Release prerequisites

- Pass the workflow, security, web release and native bundle checks in S50.
- Deploy and verify `/api/mobile/v1` on the configured API origin. The live site
  returned 404 during this audit; a build must not be distributed against it yet.
- Configure public API origin, Supabase URL/publishable key for the preview environment. No service-role or management key.
- Verify the signing identity, installed map, email login, photo picker, embedded
  video, inquiry, owner edits and buying/support conversations on an Android device.

## Build types

| Profile | Package | Artifact | Use |
| --- | --- | --- | --- |
| preview | com.suqpage.app.preview | APK | Install directly on invited testers' Android phones |
| production | com.suqpage.app | AAB | Upload to Google Play internal testing after account setup |

From `apps/mobile`, once prerequisites pass:

```sh
npx eas-cli@latest build --platform android --profile preview
```

EAS supplies a build/download page when the APK succeeds. Review its access
settings before sharing: internal build links can be accessible to anyone with the
link. Send invitations only when the owner authorizes the recipients. Testers do
not need Metro or Expo Go for this APK. Keep its checksum/version and device-test
evidence with the release record.

The `production` profile creates an AAB, which cannot be installed directly.
The submission profile targets Google Play's **internal** track with **draft**
release status. No Play developer membership, service-account credential,
tester list, store listing or submission is configured or claimed complete.
Confirm the owner's existing Play Console account before proceeding. Review
privacy disclosures and account-deletion requirements before store submission.

References: [Expo internal distribution](https://docs.expo.dev/build/internal-distribution/),
[Google Play testing tracks](https://support.google.com/googleplay/android-developer/answer/9845334).

## S59 release preparation — 2026-10-05

Owner approved coordinated web/mobile release. Read-only checks confirm
`@falmatad/suqpage`, project `bfc289fb-238e-44a3-9e0f-fec6a7c857d1`, and no
managed Android builds yet. The verified Netlify site remains
`26c795eb-5560-4a88-b38d-3cc922c2a5e6` at `https://suqpage.com`.

Three public runtime settings were created and read back in the project-scoped
**preview and production** EAS environments: EXPO_PUBLIC_API_ORIGIN,
EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. They use the
canonical production API and its existing Supabase project; no privileged key or
local runtime value was copied. Existing variables remain untouched. Private
before/readback evidence is under `.local/release-s59/`. Rollback of these new
settings is removal of those three project variables after reviewing any newer
builds; do not change account-wide variables or Supabase Auth.

Live health returned 200; `/api/mobile/v1/market` still returned 404 before
rollout. Do not distribute a mobile artifact until compatible APIs are deployed
and the unresolved release gates pass. Play Console account confirmation is
pending; no submission, paid build or invitation has occurred.

Public-store readiness still needs a dedicated account-deletion entry in the app
and a clearly identified web request path. Current native account screens have no
delete-account entry; the web privacy notice only supplies a contact email. This
has not been verified as a complete store-compliant deletion workflow. Do not
claim public-store readiness from an internal APK or the existing support flow.
See [Google Play account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en).

Managed Play submission additionally requires the developer account, app record,
a scoped Google service-account credential in EAS, and completed listing/setup
tasks. EAS can create a first internal draft when those prerequisites exist; do
not claim automatic public rollout. See [Expo Android submission](https://docs.expo.dev/submit/android/).

## S60 account-deletion entry (local candidate)

FE-055 now provides Delete account in native Account (including incomplete setup)
and Account security, plus web settings/privacy links to `/account-deletion`.
The request goes through the existing privacy-contact email. Five-language browser
checks pass; review `.local/account-deletion-review/`. This closes discoverability
in the local candidate only. Mailbox coverage, verified removal/retention procedure,
physical-device email handoff and production publication remain prerequisites.
See [request handling](operations/ACCOUNT-DELETION-REQUESTS.md).

## S61 target — Expo internal APK; Google Play deferred

The owner selected managed Expo testing distribution. Keep preview/internal APK
and deploy its production web/API first; defer AAB, Play account/listing and store
submission. Web is now independently tested with an isolated root/shared install
and clean full selected audit. Android still has two unpatched build-tool advisory
roots; an explicit limited exception is pending. The fresh Android export excludes
the affected packages, but signing, final APK inspection and native device tests
remain required. No managed build/download link exists yet. See
`SUQPAGE-RELEASE-2026-10-06.md`.
