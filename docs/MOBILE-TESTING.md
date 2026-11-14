# Test the AfricMade mobile app

FE-053 owns native visitor/business-owner behavior. DEP-053 / ADR-0033 own the
isolated Android development tests; DEP-044 owns signed release admission and
Play/physical-device qualification. Current work and release blockers belong in
[the active checklist](AFRICMADE-TRANSITION-CHECKLIST.md), not old APK links.

## Managed Android tests

[Native Android QA](https://github.com/falmata-tech/suqpage-saas/actions/workflows/native-android.yml)
builds the actual React Native development client on a standard Ubuntu runner
and starts an accelerated API 35 x86_64 emulator. It runs on relevant pull requests
and main changes, with manual dispatch available after integration. The first
native English smoke is qualified in run43529393814: native navigation, keyboard,
Back, inquiry submission and independent PostgreSQL verification pass. See
traceability for the exact source/artifact and inspected visual decision.

The disposable app is **AfricMade QA**, package `com.africmade.qa`. It uses the
runner-local API at `http://10.0.2.2:3000`, a fresh local PostgreSQL fixture schema
and a synthetic MapLibre background. Metro serves the actual app code locally.
It never restores production accounts or uses hosted Auth, Firebase, release
signing or production data. Production `com.africmade.app` admission is unchanged.
No EAS/Play upload or new paid device subscription is part of this workflow.

The `native-android-review` artifact retains synthetic screenshots, native
accessibility hierarchies, APK/source/device identity, scenario results and saved
inquiry verification for seven days. Inspect the screenshots yourself and record
a source-bound visual decision. A green automated assertion does not establish
readability or layout quality. Raw server/Metro/device logs and disposable
credentials are excluded from public artifacts. Do not attach customer data.

| Workflow | Initial native automation | Additional qualification |
|---|---|---|
| Market | Map/list switch, actual product search, keyboard | Filter combinations, map groups, pagination, locales and large text |
| Product | Real API-backed detail and native Back preserving search | Gallery/video, options, unavailable states, external app handoff |
| Inquiry | Add/list/form/keyboard, local Inbox submit, exact saved tenant/product | Cross-business basket return, validation/retry and offline recovery |
| Navigation | About and Login entry | Wider screen/rotation/accessibility audit |
| Owner | Not exercised without isolated managed Auth | Sign-in/out, edits, publish, inbox/support and transport |
| Delivery | Debug install and crash signal | Firebase push, physical devices and signed Play installation |

The smoke's POST goes through the ordinary application/domain/database path.
It sends no WhatsApp/Telegram, email or push message. `scripts/native-qa-ui.py`
drives observed native nodes through ADB; `scripts/native-qa-verify.ts` independently
checks the saved inquiry and unchanged other-business inquiry count.

Use focused component/API/type checks during iteration, then review native
artifacts on a coherent source. Preserve initial failures and classify setup,
harness and product failures before retrying. Fix actual defects without removing
assertions or treating a web preview as native evidence. Keep the five required
quality jobs separate from this new native check until qualification is complete.

## Local web and native development

From the repository root, start the isolated local web/API and Expo browser
preview using the current development commands/environment:

```sh
npm run dev -- --hostname 127.0.0.1 --port 3102
npm run mobile:web
```

These commands run in separate terminals. The web app is at
<http://127.0.0.1:3102>; Expo browser preview is at <http://localhost:8082>.
Use phone/tablet sizes for focused web work; this does not run Android native
layout, OS Back or the native map. See the browser review guide for actual
visitor/owner/staff/admin journeys and authoritative API outcomes.

MapLibre needs a custom development build; **Expo Go is unsupported**. On a
host with a qualified JDK, Android SDK and a connected test device/emulator:

```sh
cd apps/mobile
npx expo run:android
```

The normal local development client is distinct from DEP-053's CI-only QA data
workflow. Its origin-scoped storage must never fall back to production keys.
`npm run mobile:emulator` starts the previously configured local Intel API 35 AVD;
it does not install an SDK, create a cloud VM or work on a host without that AVD.
`npm run mobile:android` forwards the local API/Auth/Metro ports. After installing
a compatible development client, `npm run dev:mobile` and `npm run mobile:phone`
support a trusted local network. Do not expose development ports publicly.
Full Xcode/signing and iOS-device qualification remain separate.

Use a local demo owner or a new isolated test email. Local codes belong in the
[local inbox](http://127.0.0.1:54324); never paste OTPs or tokens into source/logs.
Staff/admin management stays on web. Visitors can inquire about products;
transport chat is available only to authenticated businesses from their dashboard.
Public transport launchers and guest transport creation are retired (FE-078).

## Release and external links

The canonical app is AfricMade / `com.africmade.app`; current API/public links use
`https://africmade.com`. Existing legacy installations and release records remain
separate compatibility history. Use DEP-044's current exact signer, Firebase,
predecessor and audit admission before compiling or publishing a release.
A QA APK, JavaScript export, historical Suqpage APK or Expo preview does not admit
that artifact or establish a new Play testing clock.

For a qualified rebuilt app, separately verify cold/warm canonical HTTPS links,
return from native browser sheets, and WhatsApp/Telegram installed/absent handling.
Inspect the correct owned demo recipient and draft without sending a message.
Denied handlers must show recovery and preserve the inquiry. No app token may
reach third-party URLs. Physical keyboard, TalkBack, push and Play enrollment
require actual evidence beyond the emulator smoke.

References: [Expo development workflows](https://docs.expo.dev/develop/development-builds/development-workflows/),
[GitHub runner capabilities](https://docs.github.com/en/actions/reference/runners/github-hosted-runners),
[Android ADB](https://developer.android.com/tools/adb).
