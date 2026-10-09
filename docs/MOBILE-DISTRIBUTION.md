# Android tester distribution

The current tester app is **Suqpage / com.suqpage.app**. Open
[the completed Expo build](https://expo.dev/accounts/falmatad/projects/suqpage/builds/565b9614-428d-47b4-8780-2b0f9c96d68b)
on Android to download and install it. It uses live Suqpage accounts/API and needs
neither Metro nor Expo Go. This first canonical installation needs sign-in; earlier
Preview APKs use a different historical package. Staff/admin remain web-only.

Source a81c93f, version code 2, nondebug and the exact existing signer pass actual
APK inspection. Firebase resources, notification permission, archive/bundle privacy,
Android canonical-domain verification and installed public navigation/map/five-locale
checks pass. Web/API is deployed on schema 62. Physical-phone alerts and authenticated
hosted workflows remain separate. See
[the S98 release record](SUQPAGE-S98-RELEASE-2026-10-08.md) for exact gates, checksum,
limits and tester steps. The old
[Preview build](https://expo.dev/accounts/falmatad/projects/suqpage/builds/9bcabbdb-14eb-420d-a2cf-8d84e0ec8c75)
is retained as historical evidence; sections below retain earlier preparation details.

The owner selected the Expo account **falmatad**. The linked project is
[Suqpage on Expo](https://expo.dev/accounts/falmatad/projects/suqpage), ID
`bfc289fb-238e-44a3-9e0f-fec6a7c857d1`. Verify it with
`npx eas-cli@latest project:info` from `apps/mobile`.

## Maps and signing

The native map uses MapLibre with OpenStreetMap raster tiles; browser preview uses
Leaflet. Expo Go cannot run the native SDK; use a rebuilt development client or APK.
No Google Cloud project, billing setup or Google Maps key is required. The earlier
Google setup instructions are withdrawn.

The historical EAS-managed preview signing certificate belongs to `com.suqpage.app.preview`.
Its public SHA-1 is `D2:5C:49:53:9C:98:E8:33:F8:B9:4C:E1:E3:66:6F:A3:9C:16:62:C4`.
Under the owner's exact S98 authorization, the existing signing source was backed
up privately and reused for `com.suqpage.app`. Independent provider readback verifies
identical key bytes/certificate and preserves the legacy binding, FCM and other
settings. The verified public pin is recorded in `apps/mobile/release-policy.json`;
no private material enters Git or builds. The CLI stopped before its confirmation,
and the owner explicitly accepted the independently verified result under
AGENTS.md's timeout gate. No retry, rollback or further signing change. The new
actual APK and installed-device
checks remain pending; the old preview certificate alone is never artifact proof.

## Release prerequisites

- Pass the workflow, security, web release and native bundle checks in S50.
- Deploy and verify `/api/mobile/v1` on the configured API origin. The live site
  is deployed and verified in S61.
- Configure public API origin, Supabase URL/publishable key for the preview environment. No service-role or management key.
- Verify the signing identity, installed map, email login, photo picker, embedded
  video, inquiry, owner edits and transport/support conversations on an Android device.

## Build types

| Profile | Package | Artifact | Use |
| --- | --- | --- | --- |
| preview | com.suqpage.app | APK | Install directly on invited testers' Android phones |
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
The owner reports that the Play Console account is ready; independently verify
its app/signing/permissions before proceeding. Review
privacy disclosures and account-deletion requirements before store submission.

References: [Expo internal distribution](https://docs.expo.dev/build/internal-distribution/),
[Google Play testing tracks](https://support.google.com/googleplay/android-developer/answer/9845334).

## Single-app release workflow — S97

Both hosted profiles explicitly select the verified production API/Auth target.
The internal profile does not create a separate test database. Use local previews
for routine QA and labelled demo/test records for production-connected checks.
Hosted workers reject unreviewed targets, API/Auth or Expo-project mismatches,
conflicting profile names and privileged public keys. The notification build
requires a client file for Firebase `suqpage` / `588262779708` / `com.suqpage.app`;
private FCM credentials stay in EAS Credentials and out of upload archives/runtime.

1. Review source and visuals, run the applicable check/release/acceptance and
   native gates, and commit only that reviewed task. EAS requires committed source.
   Independently verify the Expo owner/project, selected environment and API
   compatibility; retain protected before-state evidence for any configuration write.
2. Establish the canonical signing binding using a separately authorized,
   recoverable source. Verify its public certificate independently and record the
   reviewed pin in the release policy. Preserve prior keys and legacy associations.
   Do not generate, replace or borrow a signer as an incidental build fix.
3. Build an internal APK with the `preview` profile. Both profiles share the same
   remote version counter and auto-increment; no second Firebase app or later rename
   is needed. The old Preview package requires one new canonical installation.
4. Inspect the downloaded artifact before sharing. For the first canonical APK:

   ```sh
   npm run mobile:verify-apk -- --apk /path/to/suqpage.apk --first-canonical-release
   ```

   For updates, select the actual latest admitted canonical APK:

   ```sh
   npm run mobile:verify-apk -- --apk /path/to/new.apk --previous-apk /path/to/previous.apk
   ```

   The verifier checks the actual signature/package/version/debug flag, rejects
   extra/wrong signers and non-increasing versions, and retains a protected checksum
   receipt. `--inspect` only reads metadata and never admits a release. Missing SDK
   tools or an unconfigured certificate stop admission. Unit SDK fixtures are mocks;
   inspection of an actual APK supplies separate signature evidence.
5. Test the APK on a phone: map/filters, sign-in, private starter preview, media,
   owner edits/publication, inquiries, transport chat, read receipts and notification
   permission, foreground/background/closed-app delivery, tap destinations and logout.
   SDK/browser checks alone cannot establish these results. Share only with approved
   recipients after the artifact/device evidence passes; review build-link access.
6. When Play testing is requested, complete the listing/privacy/deletion workflow
   and verified credentials, then submit the AAB to **internal draft**. Verify an
   APK distributed by Play against the same signing policy and prior APK; upload-key
   AAB inspection does not prove Play's installed signer. Public rollout is a separate
   approved, monitored step. No OTA update channel is configured.

Build checks and this workflow constrain normal release paths; they do not sandbox
provider administrators or arbitrary shell commands. An older-version reinstall is
not a guaranteed rollback: prefer a reviewed higher-version corrective build.
Changing signer or uninstalling may prevent updates or remove local session data.
Keep the server compatible with installed app versions during coordinated rollout.

References: [Android update requirements](https://developer.android.com/google/play/app-updates),
[apksigner](https://developer.android.com/tools/apksigner),
[APK Analyzer](https://developer.android.com/tools/apkanalyzer).

## Android notification setup — S95

The owner's Android client file is verified for Firebase `suqpage` (number
`588262779708`) and package `com.suqpage.app`. Its protected source is outside Git.
On 2026-10-08, the verified Expo project `@falmatad/suqpage` received three additive
project-scoped build settings for **preview and production**:

| Setting | Value/source | Visibility |
| --- | --- | --- |
| SUQPAGE_GOOGLE_SERVICES_FILE | Verified Android client file | Secret file |
| SUQPAGE_FIREBASE_PROJECT_ID | suqpage | Public |
| SUQPAGE_MOBILE_NOTIFICATIONS_ENABLED | 1 (require client file at build time) | Public |

The public API/Auth targets were independently checked first. Selected project
and account-wide notification variables were absent; protected before-state,
source hash, exact plan and creation/readback evidence are retained under
`.local/notification-review/firebase/`. Both string values and file metadata
are verified. EAS does not expose secret file content for readback; the exact
uploaded source is retained and the worker validates its project/package before
building. No existing environment variable, signing key, private sending key,
runtime server capability, Google Play record or app binary changed.

The Android client file is not a sending credential. Provider setup sequence:

1. Open [Firebase service accounts for suqpage](https://console.firebase.google.com/project/suqpage/settings/serviceaccounts/adminsdk).
   Generate a new private key through the owner-controlled dashboard and retain
   the downloaded JSON in a protected local location. Do not paste its contents
   in chat or commit it. Credential creation is a separate deliberate owner action.
2. Verify its project and exact key identity, then review a protected additive
   credential plan for `@falmatad/suqpage` / `com.suqpage.app`. Upload through
   **EAS Credentials → Android → com.suqpage.app → Service credentials → FCM V1**.
   The owner granted a narrow exception to use Expo's official interactive
   credentials CLI for this exact upload/binding; it has completed and the exact
   selected association is independently verified. This is a push credential,
   not a Play submission or Android signing key.
   Stop on any existing/masked key that lacks a recoverable backup or unexpected
   provider response; do not replace credentials or retry writes blindly.
3. Verify only selected project/key metadata, then complete compatible server
   rollout, signer/release gates, Android rebuild and real phone delivery checks
   before enabling/claiming notifications. Preserve server enablement controls.

Current state: build-client setup is complete. The owner supplied the FCM sending
key; selected project/type/token endpoint and RSA structure pass, and a protected
recoverable copy is retained. Official CLI upload/assignment completed under the
owner's exact method exception; independent metadata readback matches project,
key ID and client association for com.suqpage.app. Protected before/plan/approval/
after evidence is retained. The canonical signing slot is empty; Play, legacy
FCM and enhanced-security settings are unchanged. Canonical signing, coordinated
web/API rollout, admitted rebuild and actual OS notification delivery remain pending.
See [Expo's FCM V1 guide](https://docs.expo.dev/push-notifications/fcm-credentials/).

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

S61 web prerequisite is complete: production mobile market/featured/showroom
endpoints and unauthenticated owner/session denial are verified on suqpage.com.
The internal APK audit decision and signed-device gates remain open.

## S62 — owner-approved Expo testing build

The owner approved the narrow two-advisory, one-APK exception on 2026-10-06.
The full audit still fails and remains visible; no new advisory is included.
Build/signature/device checks still apply. Use the existing preview identity and
Expo project with the now-verified production API. No Play or paid build.


S62 build submitted: [Expo Android build](https://expo.dev/accounts/falmatad/projects/suqpage/builds/2018cc70-edef-472c-8aca-06db2699fe84),
source `4550be8`, app `com.suqpage.app.preview`, version 0.1.0 (1).
The provider has accepted it for the existing free-plan project; it is not yet a
verified download. Use this build's completed Install link only after artifact
and native-device checks. No invitations were sent. Local development codes still
appear in the local inbox; this production-connected APK sends sign-in codes to
the user's actual email.


## Historical S67 APK — superseded by S69/S70

[Expo build 4d6df1a5](https://expo.dev/accounts/falmatad/projects/suqpage/builds/4d6df1a5-795a-4f80-999d-feaa0b679f22)
is finished from c1872d5a2c328eb56164bd610ca889af5c68c9cd, using the existing free
preview profile/signing and production API. APK SHA-256:
02ecc8582202ca7009480a6b592541b15f75681c654c327dae9cf7b322224e37 (152,461,065 bytes).
Certificate and manifest/runtime/archive inspection pass. Android independently
reports suqpage.com verified; cold filtered Market and warm product/store/Featured
HTTPS intents open the actual app without a forced package or verification override.
Five native locale switches preserve the wordmark and merchant name/price. Gallery
navigation, stored demo accent, Custom Tab opening/closing and available honey
video playback inside the app pass. Local signup/owner workflows retain their
separate real PostgreSQL/browser and 11 acceptance-workflow evidence.

Installed-device review exposed blank owned SVG logos/illustrations: the original
Photo adapter used React Native Image for SVGs. S69 fixes this with the already
installed SVG renderer; the corrected development-client logo is visible. Do not
present S67 as the final corrected artifact. The owner approved its correction
and a replacement APK, now finished as build 9bcabbdb. Both single-artifact
exceptions have been consumed. No paid build, Play/iOS publication or invitation
was sent.

Aloe's existing example youtube:wJV9EDe_sFc has a 404 thumbnail and its embed
fails gracefully; available honey demo video plays. No media was replaced under
the separately approved color-only correction. Independent native-speaker review,
physical-phone/real inbox delivery and installed WhatsApp/Telegram handoffs remain
manual checks. The full native toolchain audit still has the same braces/node-forge
roots (20 high, zero critical), outside the verified JS runtime. It is not a clean
audit or a Google Play readiness claim. Protected evidence: .local/rebuild-s67/.
