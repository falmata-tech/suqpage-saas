# Test the Suqpage mobile app

Local development uses PostgreSQL/Supabase and real API workflows. The latest
released standalone [Android APK, version 2](https://expo.dev/accounts/falmatad/projects/suqpage/builds/565b9614-428d-47b4-8780-2b0f9c96d68b)
uses the live Suqpage API and production accounts. See
[the S98 release record](SUQPAGE-S98-RELEASE-2026-10-08.md) for its evidence.

[Version 3](https://expo.dev/accounts/falmatad/projects/suqpage/builds/641cb96a-3296-409b-b7ae-eabb28bc11fa)
is now built, inspected and independently verified in Google Play **internal draft**.
Its protected Google APK requires Play Store; it is not a promised sideload preview
for devices/emulators without it. Google's official signed test splits pass an
isolated update, retained language preference, 12 public states/five languages and
HTTPS links, with production protection unchanged. The temporary test emulator is
closed. Actual protected Play-installed phone/authenticated/notification checks,
Console forms and closed/public distribution remain. Follow
[the Play release steps](GOOGLE-PLAY-RELEASE.md#next-owner-actions); no closed-test
clock or invitation is claimed. Earlier preview notes below are historical.

## Browser

From `/Users/falmata/Desktop/Dev/suqpage-saas`, open two terminals:

```sh
npm run dev -- --hostname 127.0.0.1 --port 3102
```

```sh
npm run mobile:web
```

Open <http://localhost:8082>. This is the mobile app's browser preview; the existing
web app is at <http://127.0.0.1:3102>. Use browser responsive mode for phone/tablet
sizes. Only one Expo server can use port 8082 at a time; stop it with Ctrl+C before
switching between browser, Android and phone commands.

## Native Android / iPhone

The native map now uses MapLibre. **Expo Go is no longer supported.** Browser
preview still works with Leaflet. Install a rebuilt Suqpage development client or
standalone APK; the earlier Expo Go QR code does not run the new native map.

For a local Android development build (JDK/SDK installed):

```sh
cd apps/mobile
npx expo run:android
```

This generates/compiles native dependencies and installs on a connected Android
phone or emulator. After the development client is installed, use root commands
`npm run dev:mobile` and `npm run mobile:phone` on the same trusted Wi-Fi. Open
the QR/development URL with the Suqpage development client. For an emulator,
`npm run mobile:android` forwards local API/Auth/Metro ports. Do not expose these
ports on a public router. A standalone preview APK will not need Metro.

`npm run mobile:emulator` starts the existing Intel API 35 device. Android System
UI/launcher ANRs have interrupted initial checks; scoped process recovery and
subsequent signed-app screen checks pass. Physical phones remain unverified.
Installed tools:
Android Studio, SDK/platform-tools, API 35/36 build tools, Temurin Java 17,
Gradle 9.3.1 and NDK 27.1.12297006. First native build downloads remaining dependencies. Full Xcode is unavailable on
this Mac; an iPhone needs a separately signed development/internal build, not Expo Go.

Google Maps keys or Google Cloud billing are not required. MapLibre's internal
tile cache is permitted; Suqpage application records remain in PostgreSQL.
See MOBILE-DISTRIBUTION.md and MOBILE-MAP-RESEARCH.md for signing and constraints.

## Sign-in and test paths

Use an existing **local demo owner** or a new test email. Local login codes are in
[the local inbox](http://127.0.0.1:54324), not your real mailbox. Never paste an OTP
or Auth token into source files. Staff accounts are denied native owner access;
use the web dashboard for administration.

Try Market search/filter/map markers, Featured, a showroom's image/video gallery,
a direct inquiry and a grouped inquiry. Then sign in, edit a draft page/location,
create an offering, submit a video request, view inquiries, open owner support,
and sign out. Transport assistance has its own guest chat session and End chat;
it does not grant owner access. Local messages require a staff member in the local
web dashboard to answer them.

## Evidence and release limits

Focused tests cover bearer verification, staff/cross-tenant denial, body limits,
public-data projection, signup, version conflicts, offerings/idempotency, inquiries,
support/video requests, buying-session isolation and retained closed history.
Browser checks exercise local OTP verification and visitor/owner navigation.
Replacement layout screenshots are in `.local/mobile-alignment/`; owner workflow captures are in `.local/mobile-review/`. Both directories stay outside Git. See `docs/MOBILE-WEB-ALIGNMENT.md`.
Android and iOS JavaScript exports are not signed installable store applications.
MapLibre Android compilation and emulator installation/first render/search-drawer
composition pass. Native captures and development APK checksum are recorded in
MOBILE-MAP-RESEARCH.md. Physical-phone gestures, preview interaction, YouTube
playback/fullscreen and offline recovery remain explicit checks. Support attachments now have scoped API regression evidence; browser/device
interaction verification remains part of the release audit.

Current release status: web/API source 6c27025 is deployed with a clean isolated
web audit; replacement internal APK 9bcabbdb is finished, signed and installed.
The full native-toolchain audit retains two upstream advisory roots under the
owner-approved single replacement-artifact exception, now consumed. Native
map/logo/gallery/locale/link checks and local owner/API tests have separate
evidence; physical-phone inbox/social-app checks remain. No store submission is
claimed. Local browser codes are in the local inbox; the standalone APK sends
codes through production email delivery.

Setup references: [Expo device testing](https://docs.expo.dev/get-started/start-developing/),
[Android acceleration](https://developer.android.com/studio/run/emulator-acceleration),
[Xcode requirements](https://developer.apple.com/xcode/system-requirements/).

### S51 local UI review (2026-10-05)

Expo browser preview: http://localhost:8082; web/API: http://127.0.0.1:3102.
The emulator is closed at the owner's request to save CPU/memory. Use browser
preview for the shared storefront copy, customer/business About sections and
six-second sponsor rotation. Scripts/capture-storefront-copy.mjs records 69
web/browser-mobile locale/layout states; capture-sponsor-rotation.mjs covers
cycles and controls. This is browser evidence, not Android/iOS AppState or
screen-reader/gesture proof. Existing S50 native and release gates remain open.

## External links — S65

Run `npm run test:mobile:links` and `node scripts/capture-mobile-links.mjs` with
local web/API 3102 and Expo web 8082 running. Browser fixtures do not update shops.
Android JS export proves bundling only. Before releasing a rebuilt app, verify:
- Website opens in the native browser sheet; Close/Back returns to the same
  product/inquiry without losing its selections or message.
- WhatsApp/Telegram installed: correct recipient and draft, no automatic send.
- App absent: original HTTPS fallback; unavailable browser/handler: visible error.
- SMS/email/phone remain system actions; no app tokens reach third-party pages.
- Description links preserve text; invalid schemes remain inert.

S66 adds the Android App Links candidate alongside `suqpage://`. Domain
publication, a rebuilt APK and OS verification are required before claiming
outside `suqpage.com` links work. iOS Universal Links await Apple identity.

## Verified public links — S66

`npm run test:mobile:app-links` checks route/security and registered signing scope;
`node scripts/capture-mobile-app-links.mjs` checks local association JSON and
Market cold/warm/repeated link inputs using real catalog reads. These do not prove
Android OS verification. The current build configuration uses Suqpage / com.suqpage.app for both internal
APK and store builds. After independently verifying its signing certificate,
publishing the canonical association and installing that rebuilt APK, use
`adb shell pm verify-app-links --re-verify com.suqpage.app` and
`adb shell pm get-app-links com.suqpage.app`; suqpage.com must verify. The retained
legacy com.suqpage.app.preview association belongs only to older released APKs;
it is not proof of canonical App Links.
Launch public HTTPS showroom/product/Market/Featured links without forcing a
package, then check cold and warm navigation. Unsupported admin/Auth links remain
web-only. Existing APK build 2018cc70 lacks the new link manifest; do not reuse it
as evidence of App Links. Production Play and iOS identities are not registered.
