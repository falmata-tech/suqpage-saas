# Store declarations and remaining readiness work

This is an engineering worksheet for DEP-044, not a completed Google declaration.
Evaluate the actual submitted version and provider behavior before clicking Save
or Submit. No form answer is inferred from a screenshot or a missing ad SDK.

## Existing behavior and policy gaps

| Area | Existing evidence | Remaining work |
| --- | --- | --- |
| App identity | Google API verifies developer 5256539403314542898, com.suqpage.app and app-only Admin; Expo falmatad/project/current signer and exact EAS Submit key verified. Owner-supplied Console app 4972244998230912603 and marketvision.tech@gmail.com login/public support | Title SuqPage/en-US, English/Amharic text/contact/images and exact version-3 internal draft are saved/read back; existing Google signer and official native test splits verified. Finish Console setup, protected-phone testing and closed/public rollout |
| SDK compatibility | Actual version-3 AAB and Google universal APK target API 36; bundle config, all 50 ELF libraries and APK ZIP pass 16-KB checks | Protected Play-installed physical-phone workflows and notification proof |
| App access | Normal users retain codes; restricted reviewer password login passes real local web/native workflows | Hosted provisioning/binding and actual web/native API sessions pass; version-3 internal draft and native guest entry verified; finish Console App access fields and authenticated protected-phone workflows |
| Account deletion | Existing request entry; BE-053 local rehearsal proves exact owner app/Auth/storage/device erasure, orphan/shared-media handling and rollback guards | Per-request verified mailbox/identity, backup/approval and real fulfilment remain manual; final disclosure/rollout |
| Public merchant content | Owners publish names/descriptions/photos/video links; Terms accepted during setup. FE-063/BE-051 locally implement real report/block controls and a private support/admin Reports queue | Delegated visual acceptance and full local gates pass; production schema/API/web now passes; native binary/Play checks remain, with objectionable-content terms evaluated against actual moderation rules |
| Live chat | Public transport chat; business-owner support; assigned staff, messages, receipts and history | Actual hosted phone end-to-end and permission/background/closed-app/tap/logout evidence |
| Privacy | Updated local five-language notice covers account/catalog/inquiry, push, controlled embeds, native tile cache and deletion/backups | Verified notice is deployed on web/API and included in inspected native version 3; accurate Console data-safety declarations/protected-phone SDK review remain |
| Ads | Sponsor cards are rendered by native SponsorCarousel and web SponsorCarousel | Declare sponsored promotional content accurately; absence of a network ad SDK is not enough to choose No |
| Payments | No app checkout, digital subscriptions or business payment plans | Do not claim payment collection or in-app purchases; transport is arranged by agents outside platform checkout |
| Content rating/target ages | Public merchant catalog and live team conversations | Owner completes truthful questionnaire and intended age groups; do not fabricate a rating or claim child-directed design |

Policy application: public merchant catalogs appear to meet Google's UGC
definition. This is an inference from the app and policy, not a Google review
decision. General public live support stays closed. Quiet report submission and
a private support-staff moderation queue can meet the operational need without
opening a new live support channel. The local workflow now has actual report,
blocking/reload/unblock and staff claim/admin removal/support resolution evidence;
the web/schema/API is deployed and live validation passes; new native delivery
and Play policy approval remain separate. Reporters/contact details must never become
readable by the business being reported. Tenant suspension is an operator action,
not an automatic consequence of any submitted report.

Reviewer access: the owner delegates the restricted reusable password exception
for a dedicated ordinary marked demo-business owner. FE-064/BE-052 now pass real
local Supabase/PostgreSQL password/JWT, fresh identity/role/tenant/security checks,
actual web/native-browser login and ordinary OTP preservation, plus five-language
screen captures. No credential is compiled into the app. Hosted provisioning/
binding and real web/native API sessions pass. Version-3 internal draft and native
public test splits are verified; protected-phone access and Play App access fields
remain pending. General password/staff mobile access is
not enabled. BE-053's actual local erasure rehearsal verifies app/Auth/media,
orphans and shared-upload preservation; real deletions still require a separately
verified request, backup and reviewed exact plan.

## Current protected APK and test-device distinction

Version 3 is saved in internal draft, not publicly released. Google's protected
universal APK requires Play Store; the API 35 Google-APIs emulator lacks it.
Production protection stays unchanged. Four official Google-signed test splits
pass isolated update/data retention, 12 public states/five languages and HTTPS
links. Physical protected Play install, authenticated owner flows and actual OS
notifications still require real-device evidence. The test emulator is closed.

Inspect the actual APK/SDK behavior when completing declarations. The inspected
AAB contains POST_NOTIFICATIONS and SDK legacy storage, overlay, biometric and
launcher-badge declarations, while fine/coarse GPS, microphone and broad modern
READ_MEDIA permissions are blocked. Manifest capability alone does not prove data
collection or that a permission is requested; do not invent a flow from its name.
Include Google's protection layer in the final SDK review rather than treating
local compiled-source inspection as the entire Play-delivered app.

Target audience remains an owner question (adults only or also teenage shoppers),
not a saved declaration. App content and account/device verification still need
Console completion. Private reviewer instructions and a six-address tester import
CSV are ready outside Git; no invitation or closed-test opt-in is claimed.

## Data-safety inventory to validate

Data safety includes application SDKs and controlled embeds, not just Suqpage's
PostgreSQL tables. Account email and phone are private; separate owner-chosen
public contacts are displayed only when published. Guest browsing needs no
account. Submitted messages are not end-to-end encrypted: authorized business
owners/staff can read them.

| Data / candidate Play category | Application flow | Purpose / optionality to verify |
| --- | --- | --- |
| Name, email, phone, user IDs | Supabase Auth, setup/account, inquiry reply details, transport/support intake | Account management, communication and app functionality; guest browsing is available, requested flows have required fields |
| Approximate location/address | Owner-selected city/region; pickup/destination area | Show/store location and arrange transport; user-entered, not a requirement for anonymous browsing |
| Precise location | Optional owner-chosen exact shop coordinates | Public storefront location; native release blocks fine/coarse GPS permission, but manually supplied coordinates can still be data |
| Photos | Owner logo/cover/product uploads; support attachments | Catalog/support functionality; publication is an owner action; system picker does not grant unrestricted photo-library access |
| Video references / other user content | Stored public YouTube/TikTok/Facebook/Instagram URLs, descriptions, bios and social links | Catalog presentation; video bytes hosted/processed by third parties, not a Suqpage native video upload |
| In-app messages | Customer inquiries, owner support and transport conversation history | App functionality and customer follow-up; conversations/read receipts retained server-side |
| Files/documents | Support attachment contract, if reachable in the submitted app | Verify accepted actual types and whether documents are uploaded; disclose rather than assuming photos cover every attachment |
| Device or other IDs | Expo push token, installation ID and recipient subscription association | Optional notifications, delivery/revocation; token is bound to current account/visitor session, never public |
| App interactions | Page-visit counts, chat read/join watermarks and alert state | App functionality/analytics; review salted visit implementation and operational logs for actual retention |
| Search/network/diagnostics | API requests, host logs, map tiles and controlled video embeds | Review whether retained or ephemeral, provider SDK collection and any location inference; do not blanket-declare no search/diagnostic data |

Relevant processors/services: Supabase Auth/PostgreSQL/private Storage; Netlify
hosting/functions; Expo Push and Google FCM; OSM map tiles; embedded public video
providers selected by merchants. Open websites use the in-app browser/OS handler.
Review Google's service-provider and user-initiated-sharing exceptions per flow;
they do not justify a blanket claim that no third party receives data. Controlled
WebView video embeds require SDK/provider review, while open-web browsing is a
different case. No developer management/signing/FCM private key belongs in builds.

Verify HTTPS paths, notification opt-in and token revocation. Provider acceptance
is not actual notification display. Do not claim an independent security review,
Families-policy certification, automatic deletion, fixed retention duration or
offline operation that has not been established.

Before reviewed closed distribution, update the public privacy policy to match
verified application and SDK flows in all UI languages. Establish real deletion
handling with the owner; an email link alone is not a deletion implementation.
Keep this inventory marked draft until the final Console answers are reviewed.

## Test checklist for actual phones

- Guest map/search/category/multiple-city filters and result pagination; store,
  media gallery, contact actions and transport intake/chat return/end states.
- Owner email sign-in, mandatory city/handle setup, private populated preview,
  edit/save/reload, logo/cover/photo selection, publish and inquiry management.
- Web support/transport staff assignment, reply, private notes, read receipt,
  ended history, resolve/reopen and notifications. Staff native login denied.
- Android notification consent, denial, foreground/background/closed app, tap
  destination, read suppression, mute, sign-out and account-switch isolation.
- Play-delivered APK signer/version and current sideload-update compatibility;
  canonical public store/product links cold/warm, no server credentials in APK.
- Reporting/blocking, reviewer access and deletion against their eventual real
  implementation; offline/errors/retry, small screens and all five UI languages.

Current local workflow evidence is recorded in the S98 release. It does not
substitute for missing hosted-authenticated phone or physical notification evidence.
Record test versions/results and actual issues, never synthetic feedback.

## Sources checked October 9, 2026

- [Reusable review access](https://support.google.com/googleplay/android-developer/answer/15748846)
- [User-generated content](https://support.google.com/googleplay/android-developer/answer/9876937)
- [User data/privacy](https://support.google.com/googleplay/android-developer/answer/10144311)
- [Data safety definitions](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Account deletion](https://support.google.com/googleplay/android-developer/answer/13327111)
- [New personal-account testing](https://support.google.com/googleplay/android-developer/answer/14151465)
