# Suqpage on Google Play

Controlling spec: [DEP-044](../specs/deployment/DEP-044-google-play-testing-rollout.md).
Current stage: preparation, not a submitted or publicly released app. Owner
confirmed a personal account created after November 13, 2023, and has now provided
the new app dashboard on October 9, 2026. Developer **5256539403314542898**, app
**4972244998230912603**, reported Play Console login and approved public store
support email **marketvision.tech@gmail.com**.
The dashboard link is owner-provided. Google API readback now verifies the developer,
canonical package and complete app-only Admin grant, and Expo project/current
signer match. The exact EAS Submit key is connected and independently verified.
Google API verifies title SuqPage/en-US, saved English/Amharic text, selected
support email/website and all seven uploaded images; every track/binary list is
empty. Console-only setup, actual Play signer and new AAB admission remain pending.
The existing Expo APK remains available separately.

The owner requests remote Expo uploads. Follow
[the beginner connection steps](GOOGLE-PLAY-CONNECTION.md) for app creation,
app-scoped submission credentials and exact internal-draft upload. Console-only signing/declarations still require the owner's Google account screens;
the submission credential connection is already independently verified.

## Create the app

In [Play Console](https://play.google.com/console/), choose **Home → Create app**:

| Field | Value |
| --- | --- |
| App name | SuqPage, independently read from the created Console listing |
| Default language | English (United States), en-US |
| App or game | App |
| Free or paid download | Free |
| Public Play Store support email | marketvision.tech@gmail.com |
| Package name, when requested during creation | com.suqpage.app, exactly matching the existing app and future bundle |

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

The delegated choice is to retain the existing key. Follow step 5 of the
connection guide for Google's current signing navigation and the public PEPK
instructions. Do not accept a generated replacement as an upload workaround.

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
> marketvision.tech@gmail.com. This version connects to the live site; use test
> details and do not place a real transport request just to test it.

Retain actual bug reports, fixes and tester feedback outside Git when they contain
personal data. A release/test report may retain aggregate counts and issue IDs.
Apply for production access through Dashboard after Console shows eligibility;
answer its testing and readiness questions using evidence. Approval is not
automatic after 14 days. Public rollout follows approval and final signoff.

Source: [new personal-account testing](https://support.google.com/googleplay/android-developer/answer/14151465).

## Current external and product dependencies

- Owner supplied the created Console app dashboard; Google's selected developer/
  package/app-only Admin grant and Expo target/current signer are verified. Console
  title SuqPage, saved store text/contact/images and empty tracks/binary lists are
  independently read back. Play signing, Console-only setup and account/device
  verification remain. The EAS Submit credential association now matches the exact owner-provided key after approved
  CLI setup and unchanged notification/signing readback.
- FE-064/BE-052 reusable owner-demo reviewer access is verified locally and on the
  deployed web/API; exact production provisioning/binding and real web/native
  sessions pass. Private instructions are prepared; the new Android binary and
  Console App access fields remain. Google reviewers cannot
  fetch codes from the owner's personal inbox; no universal OTP or admin access.
- Merchant content is inferred to be public user-generated content. FE-063/BE-051
  implement and verify reporting/blocking and private moderation. Delegated visual
  acceptance, complete local gates and production schema/API/web rollout pass;
  the new native binary and actual Play/device checks remain before store claims.
  General visitor live support stays closed.
- BE-053 deletion fulfilment is rehearsed against real local Auth/PostgreSQL/media,
  including exact-target/shared-tenant/drift/FK rollback and other-tenant preservation.
  Updated native notification/map/embed/deletion privacy text passes five-language
  phone captures; the verified web/API notice is deployed and final store disclosures
  remain. Real deletion retention/fulfilment follows the verified-request runbook.
  Existing request links do not delete data by themselves.
- New artifact audit admission, selected Play signing, AAB/Play APK inspection and
  authenticated physical-phone/OS notification checks remain pending.

These dependencies do not prevent connecting the reported app or preparing materials.
They do prevent claiming that a public store release is ready or completed.

## Verified local release candidate

Full repository check, clean isolated web release, all 11 browser acceptance tests,
operations and mobile build contracts pass. Reviewer access also proves normal
page/product edits, publication and public catalog readback. Final privacy copy
passes all five languages at 390/320 without overflow/errors. Protected evidence
is under .local/play-s99/; no private tester list or credentials belongs in Git.

These results admit the source workflow, not a future AAB, Play approval or physical
notification delivery. Hosted schema/API/reviewer rollout is verified; renewed
artifact admission, existing-key Play enrollment and actual installed verification
remain pending.

The selected production public-schema backup is verified and its actual restore
passes migration 62→63, old-table fingerprints, idempotency and private report
table/sequence grants in a disposable local database. Backup/rehearsal and exact
migration plan are protected under .local/play-s99/production/database/.
The approved production migration and monitored web rollout now pass as recorded below.

## Verified production web/API release — October 9, 2026

- Source: `ea1b4526598cff4fb6058265b8e21a68efab1148`; Netlify production
  `6ac98a227b9a61a7dad27116`, ready on https://suqpage.com. Exact draft
  `6ac989c691cc77be1a2bce03` used the identical tested function archives.
- Schema 63, protected production archive and actual restore/migration rehearsal
  are verified. Migration preserves every original table fingerprint and denies
  anonymous/authenticated report table/sequence access. The first command failed
  before schema code began; writes stopped and independent checks proved schema
  62/no report objects/same app. The owner approved one bounded retry, digest
  `da2afa38b0ee6bc0f6a8c3203fead342ea1313314048d9064851f875e0fd3c3e`.
  That retry and independent runtime readback passed. No restore or second retry.
- One new ordinary, marked demo reviewer has a private populated starter.
  Only its exact production-only email/immutable UUID server fields were added;
  its password stays in protected reviewer instructions/Auth, outside runtime,
  Git and artifacts. Existing accounts were not reset or published. Global Auth,
  SMTP, notification and signing configuration were not changed by this rollout.
- 21 live checks verify public pages/privacy/deletion, health, native catalog and
  Featured, transport return state, anonymous private-route denial, exact Android
  association bytes, blocked map/product/count results, invalid report/origin
  rejection and normal email-code mode. Actual reviewer wrong-password denial,
  native session/private starter and web cookie/dashboard sessions also pass.
  No customer chat, email or notification was created/sent. The initial live test
  incorrectly supplied a browser Origin to the native-only production API;
  focused diagnostics proved rejection, then the harness was corrected to native
  request shape without changing the origin guard or republishing the app.
- Public demo aggregate readback remains 64 active demo stores, 256 published demo
  offerings and 42 services. Existing content is preserved; the new reviewer stays
  private and is not added to discovery.
- The draft context is deploy-preview; existing runtime settings are production-only.
  Its static association passes, but dynamic preview pages are unavailable.
  Complete local runtime/workflow gates and exact production runtime preflight
  preceded publication, followed by the live checks above; no preview pass is invented.
- Actual Linux handler/Sharp cold import and packaged scheduled worker pass.
  Handler SHA-256: `d9dbf74ddb129a4c725642b58908ee1116eb89bee1b02ed75e76a5d66b5b33c6`.
  Previous deploy `6ac839e949737af3112e0764` is retained. Recovery remains an exact
  separately reviewed operation; do not drop private reports or replay a timeout.

Protected receipts are under .local/play-s99/production/, artifact.json,
production-live-verified.json and the gate/UI directories. Durable docs contain
no passwords, provider UUID binding values, tester lists, databases or raw logs.

The official EAS archive-only inspection also passes: 1,621 files match source
ea1b452 exactly, with zero untracked/private credential/runtime files. Archive
manifest SHA-256: `cfb76cafe578ea0046d9288b43852974ef4abd0ac6003b3d15fa54d7fe4349a6`.
Protected receipt: .local/play-s99/eas-archive-inspection.json. This preparation
starts no cloud build and does not admit a future signed bundle. Immutable source
ea1b452 remains the build candidate even when this operations handoff is committed.

## Verified Google store metadata — October 9, 2026

App-scoped Google API independently saves and reads back title SuqPage/en-US,
English and Amharic descriptions, marketvision.tech@gmail.com, https://suqpage.com,
the 512px icon, 1024×500 feature graphic and five actual native screenshots.
All seven uploaded image hashes and exact text/contact fields match the prepared
source. Empty before-state and exact plan/readback are protected under
.local/play-s99/store-metadata/. Read-only verification used a new uncommitted
edit and deleted only that edit after success.

Google validated the complete metadata edit, then definitively rejected the
changesNotSentForReview parameter because this app uses automatic review. The
original attempt remains recorded. Exact uncommitted readback and revalidation
preceded one supported metadata-only save, with ERROR_IF_IN_REVIEW to prevent
cancelling another review. No wider permission or signing change was used.
Standard metadata-review behavior is recorded; Google's approval status is not
inferred. Every release track and APK/bundle list remains empty. No binary,
policy declaration, tester invitation or public app publication was performed.

## Verified local signing export — October 10, 2026

The owner selected **Export and upload a key from Java keystore** and supplied
Google's encryption public key. Its RSA-3072 public-key format and digest are
verified. Google's official HTTPS PEPK executable/source archives pass bounded
download and ZIP integrity checks; source inspection confirms direct in-memory
RSA/AES wrapping and the public-certificate export. PEPK exits 0 with a bounded
private terminal; password echo is disabled and passwords never enter argv/logs.

The protected file `.local/play-s99/signing/suqpage-play-signing.zip` contains only
`encryptedPrivateKey` and `certificate.pem`; ZIP integrity, permissions and the
included certificate pass. Certificate SHA-256 is the existing pinned
`0630C56F88DF874FD27296D1AA0848A68FC8345F702FE6802EDD8255B7211183`.
ZIP SHA-256 is `82d3ff08974ceced09e55a965c650bcd5232a5b4f3d3bc1160ffaaaf4d2b4dfb`.
The recoverable original keystore remains unchanged. No plaintext private-key
file, new app/upload key, provider write, AAB or enrollment is created/claimed.
Private receipts and the one-time helper remain outside Git/app archives under
.local/play-s99/signing/. Owner Console upload and independent Google certificate
readback remain required; preserve the currently published domain associations.

## Next owner actions

1. Finish the already requested existing-key Play signing step in
   [connection step 5](GOOGLE-PLAY-CONNECTION.md#5-select-play-signing-before-first-submission).
   Upload the already verified **suqpage-play-signing.zip** using the Mac file-picker
   instructions there, then confirm Google's resulting certificate. The command,
   public key and local encryption are complete. Do not select a different key
   or share passwords.
2. Decide the pending one-free-AAB tooling exception in the protected exact review
   .local/play-s99/aab-tooling-review.md, digest
   `b97dc5dc89b4aa1c8a97ec04dc01d7dbb5f018e69be5269363c1f16f667d7a38`.
   S98's earlier APK approval is consumed; DEP-044 requires fresh admission.
   The prepared source/archive and public runtime are distinct from a signed AAB.
3. Complete the Console-only policy/setup screens using
   [the readiness worksheet](play-store/READINESS.md). The private dedicated
   App access instructions are prepared outside Git; ordinary users still use codes.
   Do not declare policy completion or invite testers before the admitted version,
   signing and actual phone evidence are verified.

No S99 Expo build, Play binary upload or tester invitation has run. Six tester
addresses are stored privately, with no verified opt-ins. The 12-testers/14-day
closed-test clock has not started. EAS Submit can upload the exact admitted bundle
remotely to internal draft after the remaining gates; that does not enroll testers
or complete Google's manual declarations.
