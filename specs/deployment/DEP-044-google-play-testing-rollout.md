---
id: DEP-044
title: Google Play testing and store rollout
status: draft
related: [DEP-042, DEP-043, FE-055, FE-063, BE-051, FE-064, BE-052, BE-053]
owners: [product, operations, security]
last_updated: 2026-10-09
change_level: L4
---

# DEP-044 — Google Play testing and store rollout

## Problem and outcome

The owner has a verified-by-owner personal Play developer account created after
2023-11-13 and has provided a newly created Suqpage app dashboard. The selected
developer/canonical-package Admin grant is now independently verified; Console
setup and actual Play signing remain pending. Prepare a truthful store listing and a
verified Android App Bundle, then use internal testing followed by the required
closed test before applying for public access. Existing Expo APK distribution is
not a Google Play release and does not start the closed-test clock.

## Scope and invariants

- Keep Suqpage / com.suqpage.app, @falmatad/suqpage and the existing live API/Auth
  target. The production build profile produces an AAB; submission defaults to
  internal draft. A profile named production does not authorize public rollout.
- No new paid build, app name/package change, key generation, provider secret,
  invitation or Google declaration is inferred from preparing local materials.
- First upload may be manual without a submission service account. Optional EAS
Submit needs an independently authorized, app-scoped Play credential; existing
  Firebase sending credentials are not reused for submission.
- Before enrolling Play App Signing, resolve whether the existing signer is
  retained or Google generates another one. An AAB upload signature is not proof
  of the signer on Play-delivered APKs. Check installed-update compatibility,
  domain association and the admitted public certificate before distribution.
- The consumed S98 exception does not admit another artifact. A fresh audit and
  remediation, or an exact new owner-approved bounded exception, is required.
- Store descriptions and screenshots describe implemented capabilities; no
  platform checkout, universal video availability, fake customer reviews, native
  notification success or completed policy compliance is claimed.
- Customer/owner screens stay native; staff/admin remain web-only. Existing
  tenant authorization and normal email-code login remain unchanged. FE-064/BE-052
  add only the explicitly bound ordinary demo-owner reviewer exception.

## Scenarios

GIVEN the existing signed APK WHEN preparing a Play upload THEN build and inspect
an AAB rather than uploading the APK as a new Play app.

GIVEN a personal account created after 2023-11-13 WHEN applying for production
access THEN verify at least 12 testers opted into closed testing continuously for
the preceding 14 days and record actual engagement/feedback; internal testing and
sideloads do not substitute for this requirement.

GIVEN a reviewer without access to the owner's inbox WHEN testing owner workflows
THEN a reusable restricted login must reach normal demo-owner functionality;
never introduce a universal OTP, privileged role or unvalidated tenant authority.
FE-064/BE-052 implement this through server-selected, restricted password login.

GIVEN merchant content visible to visitors WHEN preparing reviewed distribution
THEN evaluate public UGC reporting/blocking and moderation requirements, privacy
and deletion fulfilment against actual behavior before declaring compliance.

GIVEN provider timeout, wrong target, unapproved signer, unexpected advisory or
missing artifact evidence WHEN a write/distribution is attempted THEN stop it,
retain safe evidence and do not retry with broader privileges.

## Quality impact

Security/privacy: all reviewer/submission/signing credentials remain outside Git,
public builds and general logs. A review account can access only its own disposable
demo business. Listing reports must not disclose reporters to the reported owner.
General guest live support stays closed; transport chat remains its separate flow.
Accessibility/localization: use the existing brand and actual Android screenshots;
native UI has five languages. Optional store translations need Console language
availability and language review. Never translate merchant content automatically.
Performance: reuse verified code and focused checks; do not repeat full gates for
documentation-only preparation. Future behavior changes require mapped regression
tests and visual approval before release gates.
Recovery: retain the existing APK, recoverable signer and compatible web release;
halt test rollout on failure and issue a verified higher-version fix when needed.

## Test plan

| Criterion | Evidence / check |
| --- | --- |
| App/package/profile contract | Existing mobile build/release safety tests; Console app identity readback |
| Listing size and asset integrity | Character limits, actual screenshot provenance and official dimensions |
| Fresh admission | Locked audit, exact exception if necessary, archive/runtime private-key scans |
| Actual AAB compatibility | Package/version/API/upload signature, bundle configuration and native 16-KB alignment |
| Play-delivered application | Actual APK signer/version, verified HTTPS links and installed update |
| Owner/visitor/staff workflows | Existing local acceptance evidence plus actual hosted phone login/media/inquiry/chat/push checks |
| Review access and UGC controls | FE-063/BE-051 and FE-064/BE-052 real local persistence/provider, negative and browser evidence; hosted and installed checks remain separate |
| Closed-test requirement | Console track, opt-ins, real tester feedback and production-access decision |

## Rollout and rollback

Current phase: committed/tested content safety, reviewer access and deletion
operations, approved Expo upload-key connection, and verified hosted schema-63
web/API/reviewer rollout. Google reads the actual SuqPage title/en-US and empty
tracks/binary lists; store English/Amharic text, support contact and seven image
hashes are saved/read back using standard metadata review. No new signed AAB,
Play binary upload or store publication. Store packet/runbook:
docs/GOOGLE-PLAY-RELEASE.md, docs/GOOGLE-PLAY-CONNECTION.md and docs/play-store/. Verified historical runtime
baseline: docs/SUQPAGE-S98-RELEASE-2026-10-08.md.

Resolve admission, review access, signing and app entry before their dependent
operations. Use internal draft for first upload; verify a Play-delivered install.
Complete policy/setup requirements before the closed test, retain its opt-in and
feedback evidence, then request production access. Public publication requires
the owner-approved target/artifact and completed required checks. Rollback halts
the affected track; do not assume a downgrade or uninstall preserves sessions.

## Readiness

Preparation and the hosted web/API phase are verified. The complete Play rollout
remains draft: actual Play signing, final Console declarations, new artifact admission and
installed-device evidence remain unresolved. Hosted reviewer/content-safety web/API
rollout is now verified, with production original-record preservation. Local
implementation, delegated visual acceptance and full gates pass. Master §§15/16/17/22
would be affected by completed rollout or authentication changes. Do not mark this
spec done until those contracts and all mapped evidence exist.

## Verified preparation evidence — October 9, 2026

- Google API verifies developer 5256539403314542898 and complete app-only Admin
  for com.suqpage.app. No global Admin or other app grant. Owner provides Console
  app 4972244998230912603 and selects marketvision.tech@gmail.com for login and
  public listing support. Google reads title SuqPage/en-US, saved English/Amharic
  text, support contact and all seven image hashes; four tracks and APK/bundle
  lists remain empty. Signing/Console-only setup remain; Google approval is not claimed.
- Expo verifies falmatad / @falmatad/suqpage, project
  bfc289fb-238e-44a3-9e0f-fec6a7c857d1. The exact owner-provided EAS Submit key is
  connected by the approved official CLI operation, digest
  353fdd27c1dc4020a5748c8f2add7f400db3d470cef16d86c59fa53522295ca2.
  Independent readback preserves FCM, canonical/legacy signers and defaults.
- FE-063/BE-051 reporting/blocking and FE-064/BE-052 reviewer login pass real local
  PostgreSQL/HTTP/Supabase tests, current-role/tenant/private-grant/stale/rate/body
  negatives and actual web/native-browser workflows. Reviewer page/product edits,
  publication and public catalog readback pass through ordinary owner APIs.
  Five-language desktop/390/320 captures pass; design decisions are delegated.
- BE-053 rehearses actual local managed Auth, application and storage erasure,
  including old-session denial, exact binding, shared media, orphan uploads,
  other-tenant preservation, plan/backup approval and atomic FK rollback. No real
  customer deletion is authorized or performed.
- Full npm run check, isolated clean-install release:web, all 11 browser acceptance
  tests, operations and mobile build contracts pass. Final privacy-only additions
  pass localization/narrative/geography and all five languages at 390/320 without
  overflow or browser errors; refreshed production artifacts remain separately
  inspected. Evidence is protected under .local/play-s99/gates/ and UI directories.
- Local schema 63 follows a protected backup and old-record preservation checks.
  Read-only hosted target checks verify suqpage.com / Netlify
  26c795eb-5560-4a88-b38d-3cc922c2a5e6 / Supabase sjeiiqxgscuqajpgddcc, schema 62,
  unused proposed reviewer email and absent server reviewer binding. No production
  DB/provider credential is persisted by these read-only checks.
- Android production JS inspection proves canonical public runtime bindings,
  absence of private reviewer/provider credentials and no braces/node-forge
  modules among 1651 compiled sources. This is not a signed AAB or phone proof.
  Official archive-only inspection verifies all 1,621 files match source ea1b452,
  with no untracked/private runtime or credential bytes and no cloud build.
  Fresh locked audit still has 20 high / zero critical findings rooted in the
  two unpatched tooling advisories. S98's single-APK exception is consumed; a
  fresh exact AAB admission remains required. Web-only audit is clean.
- Existing released APK targets API 36; all 50 native ELF libraries and ZIP pass
  static 16-KB alignment checks. Future AAB and Play-delivered device checks are
  required independently. Free Expo quota is read without starting a build.
- Six owner-supplied tester addresses are stored privately. No invitations or
  verified opt-ins; the 12-testers/14-day clock has not started. The owner will
  recruit more testers while preparation continues.

The compatible hosted API/web rollout and new reviewer provisioning/binding pass:
source ea1b452, schema 63 and production deploy 6ac98a227b9a61a7dad27116. Protected
backup/rehearsal and one owner-approved bounded retry preserve old-table hashes and
private report grants; 21 live checks include real ordinary reviewer web/native API
sessions and private starter, without customer chats, emails or notifications.
See docs/GOOGLE-PLAY-RELEASE.md for the incident/readback and exact release evidence.
Exact AAB admission/build, existing-key Play enrollment/upload, Console policy forms
and the actual closed track remain pending. The existing APK remains S98;
local/native archive checks do not replace it. The hosted API has been updated as
recorded above. Never mark DEP-044 done merely because the local feature specs pass.
