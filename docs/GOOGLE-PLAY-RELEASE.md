# Suqpage on Google Play

Controlling spec: [DEP-044](../specs/deployment/DEP-044-google-play-testing-rollout.md).
Current stage: version 3 is active and independently verified on internal testing;
no reviewed closed/public release or protected-phone signoff. Owner
confirmed a personal account created after November 13, 2023, and has now provided
the new app dashboard on October 9, 2026. Developer **5256539403314542898**, app
**4972244998230912603**, reported Play Console login and approved public store
support email **marketvision.tech@gmail.com**.
The dashboard link is owner-provided. Google API readback now verifies the developer,
canonical package and complete app-only Admin grant, and Expo project/current
signer match. The exact EAS Submit key is connected and independently verified.
Google API verifies title SuqPage/en-US, selected support email/website and the
admitted version-3 AAB. Normal Console reload now verifies revised English/Amharic
descriptions, eleven phone screenshots, two feature graphics and the unchanged
icon. The exact AAB is active internally; Alpha has a saved inactive draft and
country selection. The existing Google signer is verified from its actual APK.
The one-free-AAB exception is consumed. All required
setup forms are saved and verified. IARC is marked Completed after the reviewed
25-answer questionnaire and regional ratings are saved/reloaded. North America
is Teen, most regions are 12+, and PEGI shows parental guidance. Google review is
not yet submitted: Publishing overview requires the remaining closed-track steps.
Protected Play-installed phone/notification checks and closed/public rollout remain.
The existing Expo APK remains available separately.

The owner requests remote Expo uploads. Follow
[the beginner connection steps](GOOGLE-PLAY-CONNECTION.md) for app creation,
app-scoped submission credentials and exact internal upload. Signing/submission
are complete; do not repeat them. Most declarations are completed through the
owner-authorized, identity-bound browser. The latest owner delegation also covers
the completed rating. The prohibited-content policy is live in all five languages
at https://suqpage.com/terms. Phone evidence, closed activation and any
Google-requested account verification remain separate from technical completion.

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
Saved category: Shopping. Website: https://suqpage.com. Existing public
privacy and deletion resources: https://suqpage.com/privacy and
https://suqpage.com/account-deletion. Their presence is not a claim that the policy
and deletion operations are complete; the worksheet identifies remaining work.

Current saved upload assets are in
`.local/play-s99/store-presentation/collection-v2/assets/`; the original
`.local/play-s99/store-assets/` remains preserved. The manifest records actual
source APK/screenshots, checksums, dimensions and labels. Screenshots depict
authentic native screens and public example content, not hypothetical UI or
customer conversations. A later application change requires checking their
continued accuracy. The revised app introduction is still a local candidate;
these native crops do not present it as already installed.

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

- Google verifies the selected developer/package/app-only Admin, Expo target,
  retained signer and exact version-3 internal release. Ten of eleven setup tasks,
  store text/contact/images and the separate internal list are saved/read back.
  Final rating pending catalog policy and any Google-requested account/device
  verification remain. The EAS Submit association is complete; no
  credential/signing repeat is needed.
- FE-064/BE-052 reusable owner-demo reviewer access is verified locally and on the
  deployed web/API; exact production provisioning/binding and real web/native
  sessions pass. Version 3 and saved restricted Sign in details are verified;
  protected-phone workflows remain. Google reviewers cannot
  fetch codes from the owner's personal inbox; no universal OTP or admin access.
- Merchant content is inferred to be public user-generated content. FE-063/BE-051
  implement and verify reporting/blocking and private moderation. Delegated visual
  acceptance, complete local gates and production schema/API/web rollout pass;
  version 3 is active internally; authenticated protected-phone checks remain.
  General visitor live support stays closed.
- BE-053 deletion fulfilment is rehearsed against real local Auth/PostgreSQL/media,
  including exact-target/shared-tenant/drift/FK rollback and other-tenant preservation.
  Updated native notification/map/embed/deletion privacy text passes five-language
  phone captures; the verified web/API notice is deployed and Data safety is saved
  with official UI readback. Separate partial-data deletion is not claimed.
  Real deletion retention/fulfilment follows the verified-request runbook.
  Existing request links do not delete data by themselves.
- This exact artifact's admission, Play signing and AAB/Google APK inspection pass.
  The consumed exception admits no additional build. Authenticated physical-phone
  and actual OS-notification checks remain pending.

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
verification are now complete, as recorded below; published domain associations
remain unchanged.

## Verified version-3 internal draft — October 10, 2026

The owner approves one free AAB under exact digest
`b97dc5dc89b4aa1c8a97ec04dc01d7dbb5f018e69be5269363c1f16f667d7a38`.
Fresh locked audit still fails with the same 20 high/two unpatched tooling roots,
absent from the compiled application. All existing gates and exact source/archive
checks pass. This exception is now consumed; it does not admit another build.

- Source: `ea1b4526598cff4fb6058265b8e21a68efab1148`.
- [Finished Expo build](https://expo.dev/accounts/falmatad/projects/suqpage/builds/641cb96a-3296-409b-b7ae-eabb28bc11fa): production AAB, version 3, credentials frozen,
  no automatic submission. Free use moves from 11/30 to 12/30; total cost zero.
- AAB SHA-256: `7192acc4b921a1b972a1a18608a376039694b5d27456a75a2174e7bfb524be91`.
  Actual API 36/nondebug/pinned signature, bundletool validity, 16-KB bundle config,
  all 50 native ELF libraries and private-byte/runtime binding checks pass.
- [Finished EAS submission](https://expo.dev/accounts/falmatad/projects/suqpage/submissions/1c29e427-ef90-4119-bca1-1756607fc9a2): exact build ID, internal draft only.
  Protected Google before-state and independent new-read-edit proof confirm the
  exact version/hash in draft, other tracks empty and listing/contact unchanged.
- Google's generated universal APK SHA-256:
  `4e3e78d9614a62a4152660b5ae6e2c5eba9da4624e5ea90015d9d62f85d65c2b`.
  Actual apksigner/package/version/debug checks match the pinned existing key and
  permit updating the previous canonical version 2; ZIP integrity/16-KB alignment pass.
  Google-generated metadata independently confirms only the existing signing key.

The protected universal APK requires an enabled Play Store and cannot launch in
our API 35 Google-APIs emulator, which lacks it. Production protection stays
unchanged. Four official Google-signed test splits are selected for API 29+, x86_64,
420-DPI and English; every signature/hash is verified. An isolated update retains
its Somali preference and passes 12 public states, five UI languages, canonical
HTTPS app links and no app crash/keyboard-metrics/unexpected-text error. No account,
chat, inquiry or notification is submitted. Only temporary emulator 5576 closes;
5580/original AVD data remain untouched. This is actual native test-split evidence,
not a protected Play-installed physical-phone or notification signoff.

The local CLI-result parser's `project` field assumption is corrected to the
actual SDK `app` field after exit 0; independent accepted-job readback proves
exact target/source with no second build. Automatic permission review times out
before one Google read command starts; absence of process/output is verified,
and its explicitly permitted one same-command retry succeeds. These are not
ambiguous remote writes or a restore. The APK download uses Google's discovery-
specified media service; previous read failures/receipts remain preserved.

Protected receipts: .local/play-s99/aab-inspection.json, aab-exception-consumed.json,
play-upload-verification/, google-test-splits/, native-public-verified.json and
android-device/. Credentials/runtime data, raw logs and screenshots stay outside Git.

## Next owner actions

1. On an Android phone, sign into Google Play with one of the ten supplied tester
   accounts and open [the verified internal-test join link](https://play.google.com/apps/internaltest/4701297357173307496).
   Join the test, then install from Google Play. Initial availability can take
   several hours. Google temporarily displays **com.suqpage.app (unreviewed)** until
   app setup/review completes; the permanent app/package has not been renamed.
2. Test this Play-installed version on the real Android phone, including
   sign-in/owner media/save/publish/inquiries, report/block controls, transport return/
   read receipts and real OS notifications. The native public test splits do not
   replace these checks.
   Use an ordinary business-owner email for app login. The Google Play tester
   account and Suqpage login are separate; admin/staff accounts intentionally
   cannot log into Android. Keep any new sample page private during the check.
3. Alpha closed-test access already selects the ten-address SuqPage list, with
   **marketvision.tech@gmail.com** saved for feedback. Rating/setup is complete.
   All 177 offered countries/regions plus Rest of World and an inactive version-3
   draft are now saved and reloaded. Alpha is explicitly unsynced from production;
   English/Amharic release notes are saved. Final independent API verification
   awaits the owner's direction under the protected readback plan, then actual
   phone checks gate confirmation/review and closed rollout. Add further genuine
   testers privately. Each internal tester must leave the
   internal test before joining the closed test. Capture that
   separate link and actual joins; no email invitation has been sent by the agent.

Internal version 3 is available, not public publication or policy approval. The
ten supplied addresses are saved/selected and individually verified; no actual
enrollment or phone result is invented. The **12 real testers / 14 continuous days**
closed-test clock has not started. Review genuine feedback before production access;
internal testing, aliases and sideloads do not meet that requirement.

## Autonomous Alpha preparation — October 10, 2026

S99.5 is one-time operational preparation using the existing admitted build.
The exact SuqPage developer/app/account and current metadata/artifact are checked;
protected UI/API before-state is retained. Normal Alpha controls save all 178
offered rows (177 named countries/regions plus Rest of World). Reload verifies
each exact row is Targeted. Publishing overview records these changes only under
**Closed testing - Alpha**, including **Unsync from production**; no public
availability or app rollout is inferred. Google's targeting is based on the
tester's registered Play country, so this avoids excluding approved testers who
live or registered their accounts abroad. See [Google's country-targeting guide](https://support.google.com/googleplay/android-developer/answer/7550024?hl=en).

The library's sole existing version **3 / 0.1.0 / target SDK 36** is attached to
one draft, named **0.1.0 - closed test**, with concise English/Amharic notes.
Save as draft succeeds, and a fresh track reload says **Inactive / Draft** and
**3 of 4 complete**. The preview shows no blocking errors and one nonblocking
warning about the already-known absent crash-deobfuscation file. The preview's
final Save/confirmation and Send app for review are not performed. Internal
testing remains Active/Available; only the ten-address SuqPage list is selected.
Other-app lists are inspected only for nonselection, never changed. Production
remains access-locked. Publishing overview still says changes are not submitted
and disables Send app for review until required steps are complete.

The original API metadata reads/comparisons and temporary-edit cleanup succeed,
but a local receipt formatter dereferences the legitimate empty production-country
response. Failure evidence is preserved. A separate read-only Google GET confirms
**This Edit has been deleted**; the formatter correction changes no provider data.
Automatic approval review nevertheless blocks the proposed fresh final API read
because a prior operation was recorded as stopped, requiring explicit recovery
direction. Both rejected calls do not execute; no workaround, write retry or
restore is attempted. The owner is offered the exact protected readback review.
Final independent API comparison remains pending and is not represented as passed.

Evidence: .local/play-s99/closed-preparation/ and
.local/play-s99/console-setup/s995-*.json. No new build, upload, signing, credentials,
invitation, opt-in, real phone result or review submission. The real Android phone
workflow/notification gate and Google's closed review remain; no 12/14-day clock
has started. Further tester addresses can be added to the private list when supplied.

## Catalog policy and completed rating — October 10, 2026

The owner prohibits violent/sexual content and age-restricted goods, including
alcohol and tobacco, removed when found. Source **de68832** / Netlify
**6aca91cb2f49de22d3839199** publishes the five-language Terms. Staff guidance uses
the existing private Reports queue and authorized removal; resolution is denied
while the reported content remains visible. No automatic image/video screening
or universal chat moderation is claimed.

Full check, clean isolated web release, all 11 browser acceptance workflows,
actual packaged Linux handler/Sharp/worker, 15 local multilingual Terms states
and five live phone-width Terms states pass. Twelve live read-only compatibility
checks pass; customer listings, chats, email and notification sends stay untouched.
The earlier local timeout/build-folder/fixture/CLI/receipt failures are preserved
with diagnosed corrections; no checks or timeouts are weakened. Existing schema,
Android version 3, signer, provider settings and old rollback archives are preserved.

The exact identity-bound Google form saves 25 reviewed answers. It discloses user
content, online catalog content, report/block controls and possible minor/moderate
seller language. It does not invent dedicated chat moderation, friends-only access,
digital checkout/rewards, a general browser, news/education or broadcasts of current
user location. Optional saved business coordinates remain separately disclosed.
Automatic approval review rejected an unsupported language No and a location Yes
before execution; safer accurate choices replace them, without a bypass.

Google's reloaded rating overview says **IARC Completed / Submitted October 10**;
the certificate ID is still a dash, so no certificate issuance is claimed. The
saved summary gives ESRB Teen, generic/USK/Brazil/Russia/South Korea 12+, and PEGI
parental guidance. Dashboard no longer shows incomplete app setup and unlocks
closed-track countries/release creation. Publishing overview retains the saved
listing/declarations and Alpha access, but **Send app for review is disabled**
until remaining track steps are complete. No Google approval, review submission,
closed/public release, actual phone or enrollment is invented.

Protected evidence: .local/play-s99/catalog-policy/ and
.local/play-s99/console-setup/s994-*.json. All credentials, raw logs, tester lists
and screenshots remain outside Git. Continue with the real-phone check and
closed countries/release, not another build/signing or a repeated questionnaire.

## Saved setup and internal activation — October 10, 2026

This and the following dated sections record earlier checkpoints. The current
policy/rating result and next owner actions above supersede their pending-rating
instructions; do not repeat completed signing, uploads or declarations.

The identity-bound owner-authorized Chrome workflow verifies SuqPage only. Actual
Google reloads prove separate reviewer credentials/443-character notes; Ads Yes;
government No; no financial/health features; Shopping with existing contacts and
marketing preference preserved; and ages 13–15, 16–17, 18+, with no under-13 group.

Data safety is saved using Google's current export and verified in its expanded
saved UI for all 15 types, purposes, sharing and optionality. Account creation is
email/other authentication; HTTPS and the full-account deletion URL are retained.
No separate partial-data deletion, automatic 90-day deletion or unavailable badge
is claimed. The source/SDK inventory and limitation are in
[READINESS.md](play-store/READINESS.md). Raw CSV readback is not claimed.

Dashboard verifies **10/11** tasks; only IARC remains manual under
[its terms](https://web.iarcservices.com/terms). The original questionnaire tab is
preserved; no agreement, rating or automated answers are submitted.

The separate **SuqPage initial testers** list is created and selected only for this
app's internal track. Provider reload/dialog comparison proves the six exact
addresses; the pre-existing other-app list is untouched and unselected. This
screen offers no separate feedback field; the approved store contact is preserved.
The internal preview's single nonblocking warning is missing crash-deobfuscation
metadata. One confirmed rollout shows **Active / Available to internal testers**.
Independent Google API readback confirms internal status **completed**, exact
version-3 hash, unchanged listings/contact and other empty tracks; owned read edits
are deleted. No new build, signer, protection, closed or public track change.

Protected evidence: `.local/play-s99/console-setup/` per-form verified receipts,
`data-safety-verified.json`, `internal-testers-membership-verified.json`,
`internal-api-after/verified.json`, `internal-distribution-link.json` and
`console-setup-final-verified.json`. Private snapshots, CSVs and credentials stay
outside Git. Future rollback can pause only the internal track after exact review;
it does not downgrade installed phones or automatically restore provider settings.

## Ten-address access and rating preparation — October 10, 2026

Four more owner-supplied addresses extend the existing SuqPage list to ten. Protected
before-state and six-member source backups remain; every saved union member is
verified after provider reload. Only this app's Alpha list selection and approved
feedback email are also prepared. Alpha remains inactive, releases absent, countries
unselected and links unavailable; this has not begun closed testing or its clock.

The owner's later delegation replaces the earlier manual-only repository workflow.
Normal authorized Console controls prepare and save the incomplete IARC draft.
Eight factual feature answers survive Google reload. Dedicated chat moderation
is not invented. Policy-sensitive answers remain provisional: automatic approval
review rejects online-violence No because sample listings do not establish what
the platform permits. That command never executes and no workaround is used.
The rejected question remains unanswered, Next disabled, no rating submitted and
Dashboard still 10/11. Resolve the pending actual catalog-policy question before
continuing dependent answers; owner authorization does not replace factual evidence.

Private tester instructions and the closed-test handoff are in
`.local/play-s99/testers-oct10/`. Proof:
`.local/play-s99/console-setup/tester-expansion-membership-verified.json`,
`closed-alpha-access-verified.json`, `rating-incomplete-draft-verified.json` and
`ten-testers-final-verified.json`. No raw questionnaire, addresses or credentials
are committed. Protected-phone proof, closed countries/release, genuine 12/14 test
and production-access review remain separate.

## Collection narrative and launch materials — October 11, 2026

The local FE-052/FE-049 candidate leads with **“See the collection. Skip the
scrolling.”** Market, separate customer/business About sections and account entry
explain browsing organized products, models, colors, styles and services, then
inquiring directly. Both clients use shared copy; four locale catalogs are
authored contextually. Map behavior, merchant text, accounts and data are unchanged.
Focused narrative/launch-material, localization (1,401 messages), homepage, web/
mobile type and mobile-contract checks pass. All 69 local browser states pass
layout/action checks. Explicit app visual approval precedes full checks, commit,
web deployment and fresh Android admission. The installed version 3 is unchanged.

The English/Amharic listing descriptions and graphics are saved through normal
identity-bound Console controls. Fresh independent reload verifies exact copy
and image names; thirteen visible CDN images match the retained originals after
Google's resizing/transcoding. Six English and five Amharic phone screenshots use
1080×1920 opaque PNGs, two banners use 1024×500, and the icon stays unchanged.
Native v3 sources and one unchanged visible v2 showroom fold are recorded; no new
physical-device capture is claimed. Caption area is 15.625%. All thirteen new
compositions have accurate AI-content declarations. Authored descriptive alt text
is retained in presentation.json; no supported Console alt-entry control was
exposed. The final Publishing overview read verifies SuqPage and a disabled Send
app for review button. No review action or policy approval is claimed.

The portable review gallery is `.local/play-s99/launch-kit-v3/index.html`; the
owner download is `.local/play-s99/suqpage-launch-kit-final.zip` (54 files, CRC
verified). It includes store graphics, two Google preview videos, twenty social
posters, five portrait social videos, profile icon and five-language captions,
bios and a relative posting plan. All seven H.264 videos pass full decode;
social videos are 14.3 seconds at 1080×1920/30 fps. They are silent: use original
voice or commercially cleared audio. Portrait text avoids conservative platform
overlay areas. Some localized posters retain authentic English app UI. The pack
contains no reviewer credentials, tester addresses, private records or raw logs.

The owner still needs to:

1. Review the local web/mobile copy candidate before its release checks.
2. Complete the protected Play-installed phone login, media, inquiry, chat and
   actual system-notification checks using the existing internal-test link.
3. Supply the remaining genuine testers; twelve people must actually opt into
   the closed test for fourteen continuous days. A saved email list is not proof.
4. Create the official TikTok/Instagram accounts. Open the gallery, select a
   language and follow START-HERE.txt and the supplied posting plan. Use the
   own-brand promotional and appropriate AI-content disclosures separately.

An eligible YouTube URL is optional for Google's preview video; no official
channel exists and no URL has been invented. Campaigns remain prepared, not
published or scheduled. Closed review/activation and public production access
remain separate. S99.5's blocked final API verification retains its exact pending
owner direction; no helper retry, configuration restore or alternate API was used.

Protected evidence: console-setup/s998-final-two-locale-console-read.json,
s998-final-publishing-state.json, store-presentation/collection-v2/provider-readback/,
narrative/screens/ and launch-kit-v3/video-verification.json under .local/play-s99/.
Durable source and claim checks: docs/play-store/presentation.json,
docs/marketing/{coming-soon-copy,campaign-plan}.json and
scripts/test-launch-materials.mjs.

## First-glance copy correction — October 11, 2026

S99.9 supersedes the local S99.8 app slogan after owner feedback that business
context was unclear. The new Market heading is "Browse products from businesses
on social media." Its paragraph explains organized online stores, product/service
details and direct business contact without searching old posts. About headings
identify browsing those businesses and providing a store for their customers.
All five app languages use contextual wording. Focused narrative/homepage,
localization (1,406 messages), both typechecks and 69 browser states pass; no new
phone proof, artifact, commit or deployment is claimed. Visual acceptance/full
gates remain. Preserve the prior saved Play drafts and launch ZIP as earlier
materials; align them after accepting this correction, with new image/video and
provider verification rather than reusing their old receipts.

## Accepted nearby-business narrative — October 12, 2026

S99.10 supersedes the earlier slogans throughout Market, About, account entry,
shared web/native copy and five contextual locale catalogs. The accepted first
sentence is the heading and the remaining sentence supports it. Merchant content,
map prominence, search, account and data contracts are unchanged; no distance
calculation, social import, stock guarantee or checkout is added. The owner
approves actual phone layouts. All 69 local browser states and 1,414-message
localization coverage pass, followed by full check, isolated release:web, all
eleven acceptance workflows, operations, mobile contracts and Hermes export.
Packaged Linux handler/image processing and scheduled worker pass independently.

English/Amharic Play drafts are saved and independently reloaded; only the two
banners and first two screenshots in each language are replaced. Six public CDN
transforms match source; ordered remaining images/icon/video and accurate AI
labels are preserved. Publishing overview verifies unsubmitted changes with
Send app for review disabled. This does not publish a closed test.

Use the new owner pack: `.local/play-s99/suqpage-launch-kit-proximity.zip`, or open
`.local/play-s99/launch-kit-proximity-v1/index.html`. Its 54 files pass CRC; fourteen
store images, twenty social posters, profile icon, five portrait social videos,
two optional Play videos and contextual copy are verified. All seven videos pass
full decode. Earlier packs are preserved but use superseded copy. Official social
accounts and eligible YouTube URL are still absent; nothing is posted or scheduled.

Web upload follows source commit, exact artifact/privacy/rollback verification
and production backup. The compiled Android runtime contains neither admitted
tooling root, but the native tooling audit still fails with 20 high findings and
zero critical. The previous one-free-AAB waiver is consumed: a fresh build needs
a new exact review. Version 3 remains the current Play-installed build. Protected
Play phone login/media/inquiries/chat/OS alerts, S99.5 final API direction, the two
remaining genuine testers and reviewed closed/public gates stay outstanding.
