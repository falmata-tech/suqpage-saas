# Connect Suqpage for remote Google Play uploads

The owner completes Google's account screens. After the verified connection and
release checks, Codex can run EAS Submit to upload the exact admitted AAB into an
internal draft. Uploading a binary does not complete Google's declarations, enroll
testers or make the app publicly available. Keep the existing name/package.

## 1. Create the app entry

**Owner completed this step and provided the dashboard on October 9, 2026.**

- Play Console login and owner-approved public store support email:
  **marketvision.tech@gmail.com**.
- Developer ID: **5256539403314542898**.
- App ID: **4972244998230912603**.
- [Owner-provided app dashboard](https://play.google.com/console/u/2/developers/5256539403314542898/app/4972244998230912603/app-dashboard).

The signed-in dashboard has not been read here. Google's API now independently
verifies the selected developer and **com.suqpage.app** grant. Console display
title, actual Play signing and release/setup state still need readback before
upload. The `/u/2/` part selects a browser Google-account slot; check the account
avatar rather than treating that number as proof of identity. The reported Google
login does not select a new Suqpage administrator. The owner separately confirms
the same email for the public Play listing; its actual Console setting still needs
readback. Existing website privacy/deletion contacts are separate. Continue with
step 2, not app creation.

Creation reference, if needed:

Open https://play.google.com/console/ and choose Create app. Enter **Suqpage**
(or **SuqPage** if the owner chooses that display capitalization), package name
**com.suqpage.app**, **English (United States)**, **App**, and **Free**. If a support
contact field is shown, use **marketvision.tech@gmail.com**; otherwise set it later in
Store settings. Read/accept the owner declarations
and click Create app. Complete account/device verification if Console requests it.
Send only the new app dashboard URL or confirm that it was created. An APK/AAB
upload is not needed to complete this step.

The owner confirms that the current creation form asks for a package name. Keep
that identifier exactly lowercase as above: it matches the existing Android app.
The store display title can change independently. The installed app currently
shows Suqpage; changing its launcher label requires a checked new build, without
changing the package, signer, Firebase registration or app links.

## 2. Enable the upload API

**Owner reports this enabled on October 9, 2026** in the existing Firebase/Cloud
project under **falmata.dawano@gmail.com**. Continue to step 3. Independent API/key/
permission readback now passes against Google: OAuth accepted the provided key
and Android Publisher returned HTTP 200 for the selected developer's permission
lookup. No new Cloud project is used.

Open [Google Play Android Developer API for project suqpage](https://console.cloud.google.com/apis/library/androidpublisher.googleapis.com?project=suqpage).
Check that the selected project is **suqpage** (number **588262779708**).
Click **Enable**. If it is already enabled, leave it enabled. This uses the existing
project; no new Firebase app, notification credential or Maps service is needed.
Google Cloud must be signed into an account that already has access to this
project. It may be different from marketvision.tech@gmail.com, which is the Play
Console login. If the project is missing, switch to the existing Firebase project's
authorized Google account; do not create a replacement project to get past it.

## 3. Create the upload account and JSON key

**Owner supplied this file; local validation and a protected backup pass.**
The exact account is **suqpage-play-submit@suqpage.iam.gserviceaccount.com** in
project **suqpage**. Its JSON structure and RSA signature check pass; the selected
copy is owner-only, under ignored .local/play-s99/credentials/. No private key
contents appear in these documents or the store kit. This proves local key
material, not Google Play permissions or an Expo association. Continue to step 4.

1. Signed into Google Cloud as **falmata.dawano@gmail.com**, open
   [Service Accounts in project suqpage](https://console.cloud.google.com/iam-admin/serviceaccounts?project=suqpage).
2. Click **Create service account**. Name it **suqpage-play-submit**.
3. Create it; skip optional Google Cloud project roles/user access. Do not grant
   project Owner/Editor or use the Firebase Admin SDK account. Play permissions
   are granted separately in the next step.
4. Open the created service account and copy its **email address**. This is a robot
   account, not a new Gmail inbox or a Suqpage business/staff login.
5. Open **Keys → Add key → Create new key → JSON → Create**. A JSON file downloads.
6. Keep that file private. Give Codex its local file path when ready; don't paste
   its contents into chat or put it in Git. Keep a recoverable protected copy.

## 4. Give it access to SuqPage

**Completed and independently verified October 9, 2026.** Google reports
**ACCESS_GRANTED**, **Admin for com.suqpage.app**, **no account-wide Admin**,
**no other-app grants**, and a complete (not partial) permission response.
The Console's Invite sent label requires no manual inbox acceptance for this
verified service-account connection. Do not resend the invitation. Protected
read-only evidence: .local/play-s99/play-access-readback.json.

In Play Console, signed in as **marketvision.tech@gmail.com** under developer
**5256539403314542898**, open **Users and permissions → Invite new users**. Paste
the service-account email from step 3. Under **App permissions**, add only the
new **Suqpage/SuqPage** entry whose app dashboard ID is **4972244998230912603**.
The email to invite is **suqpage-play-submit@suqpage.iam.gserviceaccount.com**,
not either personal Gmail address. If already listed, inspect this exact user's
app permissions rather than creating a duplicate.

The owner now requests full SuqPage management and asks about stronger/reversible
permissions. The recommended management grant is **Admin (all permissions)**
under **App permissions → SuqPage only**. Keep account-wide Admin on the separate
Account permissions tab unselected. This exact grant is now verified. Google documents that app-scoped administrators have
all permissions for their selected apps, including release/unpublish/signing and
app user management; granting access does not waive the release/signing gates.

To change it later, open **Users and permissions**, select this exact service
account, edit its **App permissions**, remove Admin and select the desired specific
permissions, then save. Removing the user revokes its Play access. The JSON file
does not need to be recreated just because Play permissions are edited.

For testing-upload-only access, these narrower app-scoped permissions remain an
alternative:

- **View app information (read-only)**
- **Edit and delete draft apps**
- **Release apps to testing tracks**
- **Manage testing tracks and edit tester lists**

Save/invite the selected grant. The service account does not need a person to
receive an email or sign in to Gmail. Testing-only access excludes financial and
production/signing permissions; app-only Admin includes that app's broader rights.
Account ownership, account/device verification and Google Cloud/Firebase authority
remain separate from Play app permissions.

Google documents that testing-release permission can upload draft apps and cannot
publish production releases. Expo's general setup guide also lists broader rights
for managing the entire publication process. Even with app-only Admin, the first
admitted upload still targets internal draft. If EAS/API returns a permission/
first-signing error, stop and identify the exact missing operation; do not grant
global Admin or change a signer automatically.

EAS Submit uploads binaries. Google Play's API can also manage supported listing
text/images, tracks and reviews, but greater permission does not make every Console
screen automatable. EAS Metadata currently supports Apple App Store metadata;
Google Play metadata is not supported by that tool. Owner-only verification and
Console-only declarations still need guided manual completion. Preserve truthful
policy answers, real testing evidence and the existing signing choice gate.

## 5. Select Play signing before first submission

The selected decision is to retain our existing app signing key. The current
Suqpage APK certificate is pinned in apps/mobile/release-policy.json. A new
Google-generated signer is a separate change and cannot silently replace it.

1. Open the SuqPage app in Play Console.
2. Open **Protected with Play → Play Store distribution → Go to Play app signing**.
   Some Console layouts still place this under **Test and release → Setup**.
3. If shown, choose **Change the app signing key → Provide a copy of your app
   signing key**. Google may first require a bundle draft before showing this.
4. Copy the **PEPK command or public encryption key** shown in Google's instructions
   and give that public text to Codex. Do not paste keystore passwords or private keys.
5. Codex prepares a protected encrypted file from the already-backed-up existing
   key. Upload that file only to this exact app's signing page when instructed.
6. Independently verify Google's app-signing SHA-256 before testing distribution.

If the page is unavailable until the first upload, report that message rather than
accepting a different signer. Google's current instructions allow changing the
default for a new app before open testing or production rollout; an upload and
actual signing enrollment remain separate verified operations. App-link certificates
and installed update compatibility must match the signer Google actually uses.

Source: [Google Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756),
checked October 9, 2026.

## 6. Bind the submission credential and upload

The existing official Expo CLI login/project readback confirms **falmatad** and
**@falmatad/suqpage**, ID **bfc289fb-238e-44a3-9e0f-fec6a7c857d1**. The canonical
**com.suqpage.app** EAS Submit slot now holds the exact owner-provided
**suqpage-play-submit@suqpage.iam.gserviceaccount.com** key. The owner approved the
one-operation official-CLI exception; CLI 24.10.0 exits 0. Independent readback
matches its key identifier/project/email and confirms unchanged FCM and canonical/
legacy signing metadata. Protected source and before-state remain recoverable.
Review/digest and completion receipt are under .local/play-s99/. No build or app
submission ran. The credential setup below is a reference, not a step to repeat.

Once the selected account/app/key/signing target is verified and the owner has
authorized the exact credential association, use the Expo dashboard:

**falmatad → Suqpage → Credentials → Android → com.suqpage.app → Google service
account key for EAS Submit → Add key**.

Select the new JSON file and assign it to **com.suqpage.app**. Leave the separate
**FCM V1** key and signing credentials unchanged. An owner-authorized official CLI
credential workflow may be used instead; it must retain the same backup/target/
exact-field/readback checks. A credential command is not a successful submission.

After the candidate passes required gates and its AAB is actually inspected, the
upload command from apps/mobile will be:

```sh
eas submit --platform android --profile production --id VERIFIED_AAB_BUILD_ID
```

`VERIFIED_AAB_BUILD_ID` is replaced with the actual admitted bundle build ID. Never
use `--latest`: the latest build may be the sideload APK or another candidate.
The production submission profile is already **internal / draft**, not the public
production track. Do not run this placeholder command before connection/signing/
artifact admission. No automatic submit-on-push or paid build is configured.

Read back the terminal EAS submission and Play release/artifact state. On ambiguous
timeouts stop further writes under AGENTS.md. Preserve the actual version/signing
evidence; then test a Play-delivered installation. Google's owner declarations,
review access, privacy/deletion/content controls, closed-test opt-ins and production
access remain separate from EAS binary upload.

Sources checked October 9, 2026:
[Expo EAS Submit](https://docs.expo.dev/submit/android/),
[Expo credential setup](https://github.com/expo/fyi/blob/main/creating-google-service-account.md),
[Google API setup](https://developers.google.com/android-publisher/getting_started),
[Google app-scoped permissions](https://support.google.com/googleplay/android-developer/answer/9844686).

Permission verification uses Google's documented users.list **pageSize=-1**. A
first bounded paginated/field-mask request returned 400 INVALID_ARGUMENT without
a mutation; one corrected documented request returned 200 and proved the selected
scope. Never misclassify a request-format error as missing access or expand roles
to fix it. Only the selected service account's metadata is retained; tokens remain
in memory and other users are not logged. See
[Google permission resource](https://developers.google.com/android-publisher/api-ref/rest/v3/users/list).
