---
id: FE-064
title: Restricted reusable store-review access
status: in_progress
related: [BE-052, DEP-044, FE-053]
owners: [product, frontend, security]
last_updated: 2026-10-20
change_level: L2
---

# FE-064 — Restricted store-review access

FE-053 S153 clarifies the ordinary owner destination: after explicit reviewer
sign-in and successful current application-session validation, Account remains
the destination across the actor-keyed navigator reset. This does not redirect
background/cold restoration or token refresh, bypass role checks, preserve
another actor's private navigation or widen the reviewer exception. Failed or
cancelled entry never becomes navigation authority.
The mapped actual-root regression is `scripts/test-native-resource-loading.ts`
under FE-053 S153. Its reviewer and ordinary OTP fixtures use controlled
credentials/Auth ports; no new live reviewer repair or native-build proof is claimed.

## Problem

Reviewers cannot retrieve owner email codes. Reusable access must reach normal
demo-owner features without opening password sign-in for every user or giving
reviewers staff/customer privileges.

## Scope and readiness

The owner delegates the remaining launch decisions. Select the prepared reusable
password login for one ordinary, marked demo owner so Google reviewers can test
real owner workflows without access to the owner's inbox. Normal customers and
staff retain their existing email-code flows; staff remain web-only.

After entering email, the configured eligible reviewer sees Password and Sign in.
Other emails retain the email-code steps. The review account is not identified by
a fixed public-client constant. The server selects its immutable provider UUID
and current eligible tenant. Native receives only a real provider session after
successful authentication and uses the existing secure session/owner lifecycle.
Web uses the existing managed cookie lifecycle. Change email clears secrets and
returns to the initial step. Failures never display success or log passwords.

The account owns only a disposable demo business and can exercise ordinary setup,
private preview/edit/publish/media/inquiry/support/account features. No review-only
catalog, fake integration, universal code or elevated management role is added.
Existing simple form styling, loading/error states and five UI languages apply.
Master §§11/15/16/17/22 are affected; only this bounded exception permits a password
field. Definition of Ready is met: identity/role/failure/persistence contracts are
specified in BE-052 and the owner selects safe/convenient implementation decisions.

## Scenarios

GIVEN ordinary email WHEN continuing THEN normal email-code sign-in is retained.
GIVEN the eligible configured reviewer WHEN continuing THEN a password field
appears; no code to the owner's inbox is required.
GIVEN wrong password, disabled binding or ineligible account WHEN signing in THEN
reject safely and do not grant a session or another tenant's data.
GIVEN valid reviewer login WHEN editing/publishing its demo THEN ordinary owner
workflows work; other businesses and native staff management remain denied.
GIVEN Change email or sign-out WHEN selected THEN clear password and private state.

## Test plan and rollout

Focused policy/real PostgreSQL negative tests, real local Supabase password login,
web/native HTTP and browser workflow captures, type/localization/render checks,
then the delegated design review and required full release gates. Browser-preview
evidence remains distinct from an installed Play binary. Deploy compatible web/API
before native. Disable server binding to remove the exception; no customer passwords
or accounts are changed. All secrets remain in protected provider/Play storage.

## Complete local gate evidence

2026-10-09: full repository check, isolated clean-install web release, all 11 browser
acceptance workflows, operations and mobile build contracts pass. Protected
receipts: .local/play-s99/gates/. Final privacy-only copy passes five-language
390/320 captures and localization/narrative/geography checks. This local evidence
does not infer actual customer erasure or a Play-delivered install; verified
hosted evidence is recorded separately below.

The real isolated reviewer regression additionally edits its page and every sample
product, publishes using normal owner APIs and verifies the public shops projection.
Publication prerequisites are fulfilled with the fixture's own contacts; no bypass.

## Verified hosted web/API phase — October 9, 2026

Source ea1b452 / Netlify 6ac98a227b9a61a7dad27116 deploys web reviewer entry and
the compatible native API. Exact ordinary-demo provisioning/server binding and
real web cookie/dashboard plus native JWT/private-starter sessions pass. Normal
email-code mode and wrong-password denial remain verified; no email is sent.
No account reset, elevated role or password in runtime/build/Git is introduced.
See docs/GOOGLE-PLAY-RELEASE.md and protected .local/play-s99/production/reviewer/.
The Android reviewer screen still requires the new admitted binary and Play/device
verification; the older APK is not represented as having the new entry flow.
