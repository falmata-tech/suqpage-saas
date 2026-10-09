# Suqpage on Google Play

Controlling spec: [DEP-044](../specs/deployment/DEP-044-google-play-testing-rollout.md).
Current stage: preparation, not a submitted or publicly released app. Owner
confirmed a personal account created after November 13, 2023, and no app entry on
October 9, 2026. The existing Expo APK remains available separately.

## Create the app

In [Play Console](https://play.google.com/console/), choose **Home → Create app**:

| Field | Value |
| --- | --- |
| App name | Suqpage |
| Default language | English (United States), en-US |
| App or game | App |
| Free or paid download | Free |
| Support email | falmata.dawano@gmail.com |
| Permanent Android package | com.suqpage.app, set by the uploaded bundle |

The account owner completes Google's policy/export/signing declarations and any
developer/device verification requested by Console. Retain the app dashboard URL
and public developer/app identifiers for target verification; never share login,
passwords or verification codes. Creating an entry does not publish the app.

Source: [create and set up an app](https://support.google.com/googleplay/android-developer/answer/9859152).

## Store materials

Use [the listing file](play-store/listing.json) for copy/paste text, and
[the readiness worksheet](play-store/READINESS.md) for app-content declarations.
Suggested category: Shopping. Website: https://suqpage.com. Existing public
privacy and deletion resources: https://suqpage.com/privacy and
https://suqpage.com/account-deletion. Their presence is not a claim that the policy
and deletion operations are complete; the worksheet identifies remaining work.

Generated local upload assets are in `.local/play-s99/store-assets/`. The asset
manifest records actual source APK/screenshots, checksums, dimensions and labels.
Screenshots depict the actual released native app and public example content,
not hypothetical screens or real customer conversations. Review assets before
uploading. A later application change requires checking their continued accuracy.

Google currently lists English and Amharic among supported listing languages;
its published list does not list Afaan Oromo, Somali or Tigrinya. The native app
still supports all five. Do not mislabel another Play locale to force a listing
translation. Keep English as fallback and recheck Console's available languages.
No Google automatic app-string translation is enabled; Suqpage owns its UI copy.

Sources: [store assets](https://support.google.com/googleplay/android-developer/answer/9866151),
[listing languages](https://support.google.com/googleplay/android-developer/answer/9844778).

## Build and signing

The existing Expo project is `@falmatad/suqpage`, ID
`bfc289fb-238e-44a3-9e0f-fec6a7c857d1`. Both hosted profiles use the same name,
package, Firebase registration and production API/Auth; there is no separate
Preview application to rename.

After source, artifact admission and target checks pass, the existing
`apps/mobile/eas.json` production profile builds an **AAB**. The previous S98
single-APK tooling exception is consumed; it does not authorize this new build.
Do not run auto-submit or change signing as an incidental build fix.

The current APK's public signing SHA-256 is:
`0630C56F88DF874FD27296D1AA0848A68FC8345F702FE6802EDD8255B7211183`.
Before enrolling Play App Signing, resolve and verify either:

- **Existing app signing key:** authorized protected upload to Google, preserving
  update compatibility for current APK users. Keep the recoverable source and
  verify Play's app-signing certificate, not merely its upload certificate.
- **New Google app signing key:** separate explicit choice. Current sideload APKs
  cannot update across an unrelated signer without reinstalling. Verify the public
  Play app-signing certificate and authorize its addition to the release policy
  and HTTPS association before distribution; retain the existing signer too.

For the new AAB, inspect package, increasing version code, target API, upload
signature, archive/privacy and native alignment. Use bundletool to verify
PAGE_ALIGNMENT_16K in the actual bundle configuration. The released APK already
targets API 36 and passes static 16-KB ELF/ZIP checks; this is not future AAB or
16-KB device proof.

Sources: [EAS Android submission](https://docs.expo.dev/submit/android/),
[Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756),
[16-KB page sizes](https://developer.android.com/guide/practices/page-sizes).

## First upload

A first manual upload is available through **Test and release → Testing → Internal
testing → Create new release** after resolving signing and artifact admission.
Upload only the inspected AAB, add truthful release notes and save as draft.
This route needs no Google submission service-account key.

EAS Submit is an alternative, including for the first upload. It needs a dedicated
authorized Play credential and independently verified app/account. Do not reuse
the Firebase FCM administrator key or expand its permissions. The existing submit
profile is **internal / draft**. Never substitute the production track or
auto-submit without the exact rollout being reviewed.

Inspect Play processing/errors and an actual Play-delivered install before tester
distribution: app-signing certificate, update compatibility, domain association,
map, email sign-in, owner setup/private preview/publish/photo save, inquiry, chat,
read receipts and actual foreground/background notifications. Server/provider
acceptance or browser screenshots do not prove phone delivery. Staff/admin are
web-only and must remain denied by native login.

## Required closed test

Internal testing is useful for the first install but does not satisfy this
account's public-release requirement. Complete the store/app-content setup, then
create a closed-testing track and use the admitted build. Add a private tester
email list or Google Group and obtain the opt-in link from that track. Authorize
actual recipients before sending any invitations.

At least **12 testers must stay opted in continuously for 14 days**, including
when applying for production access. Recruit real customers/business owners and
keep a small buffer of testers. They should actually use the app and provide
feedback. The clock is based on Console opt-ins, not app-entry creation, an Expo
download or a local timer. Do not fabricate testing dates or feedback.

Suggested invitation text, sent only after the track is ready:

> You're invited to test Suqpage on Android. Join using the Google account we
> added to the tester list, then install from Google Play: [closed-test opt-in
> link]. Please stay enrolled for at least 14 days. Try browsing stores, searching
> products and contacting a business. If you run a business, also try setting up
> and editing your page. Send feedback through Google Play's testing feedback or
> falmata.dawano@gmail.com. This version connects to the live site; use test
> details and do not place a real transport request just to test it.

Retain actual bug reports, fixes and tester feedback outside Git when they contain
personal data. A release/test report may retain aggregate counts and issue IDs.
Apply for production access through Dashboard after Console shows eligibility;
answer its testing and readiness questions using evidence. Approval is not
automatic after 14 days. Public rollout follows approval and final signoff.

Source: [new personal-account testing](https://support.google.com/googleplay/android-developer/answer/14151465).

## Current external and product dependencies

- Owner creates and verifies the Console app and completes requested account/device
  verification; no authenticated Play connection has been configured here.
- Secure reusable owner-demo reviewer access is undecided. Google reviewers cannot
  fetch codes from the owner's personal inbox; no universal OTP or admin access.
- Merchant content is inferred to be public user-generated content. In-app
  reporting/blocking and an actual private moderation workflow need verification/
  implementation before a policy-compliance declaration. This does not reopen
  general visitor live support.
- Native notification/SDK data disclosures and deletion fulfilment/retention need
  operational review. Existing request links do not delete data by themselves.
- New artifact audit admission, selected Play signing, AAB/Play APK inspection and
  authenticated physical-phone/OS notification checks remain pending.

These dependencies do not prevent creating an app entry or preparing materials.
They do prevent claiming that a public store release is ready or completed.
