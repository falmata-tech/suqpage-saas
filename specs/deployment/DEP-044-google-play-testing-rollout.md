---
id: DEP-044
title: Google Play testing and store rollout
status: draft
related: [DEP-042, DEP-043, FE-055]
owners: [product, operations, security]
last_updated: 2026-10-09
change_level: L4
---

# DEP-044 — Google Play testing and store rollout

## Problem and outcome

The owner has a verified-by-owner personal Play developer account created after
2023-11-13, but no Suqpage app entry. Prepare a truthful store listing and a
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
  tenant authorization and email-code login remain unchanged during preparation.

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
The exact authentication mechanism remains a readiness decision, not implemented.

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
| Review access and UGC controls | Future ready FE/BE specs and isolation/negative/acceptance evidence before implementation |
| Closed-test requirement | Console track, opt-ins, real tester feedback and production-access decision |

## Rollout and rollback

Current phase: one-time preparation only. Store packet/runbook:
docs/GOOGLE-PLAY-RELEASE.md and docs/play-store/. Verified historical runtime
baseline: docs/SUQPAGE-S98-RELEASE-2026-10-08.md.

Resolve admission, review access, signing and app entry before their dependent
operations. Use internal draft for first upload; verify a Play-delivered install.
Complete policy/setup requirements before the closed test, retain its opt-in and
feedback evidence, then request production access. Public publication requires
the owner-approved target/artifact and completed required checks. Rollback halts
the affected track; do not assume a downgrade or uninstall preserves sessions.

## Readiness

Preparation is authorized. The complete rollout remains draft: Console app entry,
exact Play signing choice, reviewer access, reporting/blocking behavior, privacy/
deletion operations and new artifact admission are unresolved. Master §§15/16/17/22
would be affected by completed rollout or authentication changes. Do not mark this
spec done until those contracts and all mapped evidence exist.

## Preparation evidence

2026-10-09: owner confirms personal account after 2023-11-13, no app entry.
Current released APK targets API 36. Its 50 arm64/x86_64 ELF libraries have PT_LOAD
alignment at least 16 KB; SDK zipalign -c -P16 4 succeeds. These checks do not prove
the future AAB's alignment or operation on a 16-KB device. Fresh locked audit still
reports 20 high / 0 critical findings rooted in braces and node-forge, with no
patched release listed in the primary advisories. Protected preparation evidence:
.local/play-s99/. Spec validation (185 specs), listing character limits, seven asset
formats/dimensions/checksums, focused mobile build/media/release safety and app-link
checks pass. The selected Expo project is independently verified; Free quota is
read back without a build. Public health/privacy/deletion URLs return 200 on the
canonical origin. The owner has been asked to choose restricted reviewer access
and Play signing; dependent writes remain pending. Store kit includes five actual
native screen compositions and existing branding, with source checksums. No build,
Console mutation, submission or invitation has occurred.
