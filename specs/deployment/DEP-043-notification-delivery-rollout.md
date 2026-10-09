---
id: DEP-043
title: Verified notification delivery rollout
status: in_progress
related: [BE-050, FE-062, ADR-0026, DEP-042]
owners: [operations, security]
last_updated: 2026-10-08
change_level: L3
---

# DEP-043 — Verified notification delivery rollout

## Problem and scope

Local alert/receipt behavior does not establish background browser/Android delivery.
Keep evidence, credential setup, provider configuration and rollout separate.
Expo Push/FCM for Android and standards-based browser Web Push are the default
background targets; iOS remains outside current store rollout. Existing PostgreSQL,
HTTPS web/API and poll-based live chat remain. No Supabase Realtime configuration.

## Contracts and scenarios

GIVEN a backed-up target WHEN additive receipt/event migration runs THEN preserve
all conversations/inquiries/financial history and admit the new API before UI.
GIVEN absent push credentials/configuration THEN do not claim push readiness;
in-app alerts/reads remain testable and committed work is retained.
GIVEN owner-approved credentials WHEN configuring THEN independently verify project,
package, environment and exact fields, retain protected recoverable sources and
keep service/VAPID private keys out of builds/Git/logs. Provider-dashboard credential
writes require separate explicit authorization. Google Play submission credentials
are not assumed to configure Android FCM. No paid service/build or invitations.
GIVEN delivery retry/invalid subscription THEN bounded dispatch/lease/dedup, safe
failure categories and cleanup preserve source events and tenant authority.
GIVEN sign-out/expired visitor token/role reassignment THEN revoke or deny delivery
before private information is exposed. OS text is generic even while permitted.
Offline native sign-out cannot immediately revoke the server push binding; never
delay clearing the local session or imply guaranteed offline revocation. Connected
sign-out revokes and every dispatch rechecks current role/token validity.
GIVEN local focused UI THEN review screenshots before full gates; GIVEN installed
Android/browser push THEN record actual foreground/background/closed behavior,
notification-tap navigation, permissions/mute and logout/expiry negatives.

## Quality impact and observability

Private indexed PostgreSQL outbox; explicit typed provider adapters and bounded
network failures. No provider secrets in application client/runtime apart from the
server-only VAPID key. Account-management tokens never enter the runtime. Safe event/attempt/error metadata only.
Remote configuration does not use broad Supabase Auth pushes.

## Test plan

| Criterion | Level | Evidence |
|---|---|---|
| Receipt/events preservation/idempotency/tenant isolation | operations/security | scripts/test-chat-read-receipts.ts; scripts/test-attention-notifications.ts; scripts/test-attention-platform.cjs |
| Provider bounds/retry/revocation with labelled fixtures | adapter | scripts/test-attention-notifications.ts; scripts/test-attention-platform.cjs |
| Actual participant web/native-preview workflows | acceptance | scripts/capture-notification-workflows.mjs |
| Real OS delivery and tap/signout/expiry | device/manual | protected DEP-043 release evidence, never browser-only proof |

## Rollout and rollback

1. Ready specs/checklist, core data/ports, focused tests.
2. Local web/native alert/read UI, five-language/phone captures and visual approval.
3. Full check/release/acceptance; protected target backup and additive migration.
4. Independently verified web/API deployment and native signed rebuild/device check.
5. Separately approved Web Push/FCM setup, bounded worker schedule and delivery tests.
6. Monitor unread backlog/failures; retain events and disable delivery on provider outage.
Code rollback preserves additive data; no automatic credential/config restore.

## Readiness checklist

- [x] Scope, limits, external prerequisites and safe failure are explicit
- [x] FE/BE/ADR linked; tests and separate real-delivery gates identified
- [x] Backed additive migration, rollback and owner-controlled credentials planned

## Completion evidence

Local backed migration, focused ports/security and actual web/Expo workflow proof
pass. The canonical Android FCM credential is configured and independently verified
in S95 below. Hosted migration, Web Push setup, rebuilt APK and actual OS delivery
remain unverified.
Full gates follow visual approval; DEP-043 remains in progress.

## Configuration and pending owner setup

Android uses the existing owner-controlled Expo project. The owner selected
Firebase project `suqpage` (number `588262779708`). DEP-042 S96 uses one permanent
application name Suqpage and package `com.suqpage.app` for internal APK and store
builds: register only that canonical Android app and reuse its matching client
configuration across hosted profiles. Legacy installed preview APKs retain their
old identity until replaced by the next admitted canonical APK; no second Firebase
registration or later app rename is required.
The build takes its matching Android client configuration via the EAS file
variable `SUQPAGE_GOOGLE_SERVICES_FILE`, with the explicitly verified
`SUQPAGE_FIREBASE_PROJECT_ID`; `SUQPAGE_MOBILE_NOTIFICATIONS_ENABLED=1` requires
that source. Private FCM V1 credentials are uploaded directly to EAS Credentials,
never chat, repository or app. Verify Expo enhanced-security status independently.
The MVP uses standard private-device-token transport with an explicit
`SUQPAGE_NATIVE_PUSH_MODE=standard` admission; never reuse the saved EAS account
token. If enhanced security is already enabled, stop and review a project-isolated
credential architecture; do not disable that setting or broaden runtime access.
Web uses a recoverable VAPID pair plus verified contact (`SUQPAGE_WEB_PUSH_*`).

Native/web notifications remain unavailable until their server capability is
configured. The minute-scheduled Netlify worker dispatches bounded batches and
checks Expo handoff receipts. Local/Deploy Preview does not run that production
schedule. Accepted handoff is not OS delivery and never human Read. After an
ambiguous provider response, generic notifications can be retried; database event
and message creation remain exactly once. Do not promise exactly-once OS alerts.
Turning notifications off currently revokes all bindings for that recipient,
not just one phone. Connected sign-out does the same. Offline logout clears local
access immediately but cannot synchronously revoke a server binding; generic
alerts may continue until revocation or expiry. Account expiry, staff role changes
and visitor token expiry are checked again before dispatch.

Current primary setup instructions:
https://docs.expo.dev/push-notifications/push-notifications-setup/ and
https://docs.expo.dev/push-notifications/fcm-credentials/.
The owner supplied the canonical Android client file on 2026-10-08. Its project
ID/number/package pass the build validator; a protected source copy and hash are
retained outside Git. Expo account/project and the three selected build-variable
names are independently checked; project/account conflicts are absent. This
client file is not an FCM sending key. The separately supplied FCM key is now
bound and verified below; hosted server capability, rebuild and actual Android
OS delivery are still pending.

S95 additive operation verified, 2026-10-08: the independently verified Expo owner
falmatad / project bfc289fb-238e-44a3-9e0f-fec6a7c857d1 has the client secret-file
variable, public selected Firebase ID and build requirement flag in preview and
production. Existing selected variables were absent at project and account scope;
public API/Auth targets matched the approved policy. Protected source/backup/plan/
creation/readback evidence is retained outside Git. String readback and file
metadata pass; secret content is checked against the retained create payload and
by the build worker, not claimed readable through the provider. No sending key,
signing mutation, server capability, binary or OS delivery occurred.

S95 sending-key source prepared, 2026-10-08: owner supplied the dashboard-generated
service-account JSON for the selected Firebase project. Its project/type/token
endpoint and RSA structure checks pass, with owner-only recoverable source and
public metadata retained outside Git. Independent Expo readback confirms the
canonical Android FCM credential slot is absent and enhanced security is disabled.
Exact protected before-state and additive canonical FCM-only plan are ready.
AGENTS.md's provider-dashboard requirement applied until the owner approved the
one-operation official-CLI exception below. Structural key checks alone do not
prove IAM permissions or delivery readiness.

The owner explicitly authorizes a one-operation method exception: Expo's official
credentials CLI may upload the supplied verified key and associate it only with
@falmatad/suqpage / com.suqpage.app. Target/source/before-state checks remain;
no raw credential mutation fallback, key/signing replacement, Play submission or
server capability change is included. Verify selected metadata after success.

S95 credential operation complete, 2026-10-08: official interactive EAS CLI uploads
the protected source and confirms FCM V1 assignment to com.suqpage.app. Independent
selected metadata readback matches exact project/key identity/client association;
canonical signing slot remains empty and Play/legacy FCM/enhanced-security settings
are unchanged. Before-state, recoverable source, exact plan, owner authorization
and after-state are protected outside Git. No raw credential mutation fallback,
private bytes in logs, server capability, binary or real phone notification is
inferred. This completes provider credential setup only; spec remains in_progress
until coordinated rollout and real OS/device workflow evidence exist.

S98 rollout preparation: focused notification/read security suite and actual
scheduled-worker cold entrypoint/invocation pass against disposable local PostgreSQL,
with no external dispatch. Main-admin browser subscription count is zero. Exact
release review is prepared; new visual/signing/audit and production configuration
approval gates remain. Automatic review stopped a credential-to-file step (removed),
then stopped reading the legacy-named production DB source without current binding
authorization. No such source was accessed or remote DB/config/deploy changed.
The missing canonical field/public Auth match are classified as operation-target
setup, not a product failure. Never broaden lookup or use more powerful credentials
to bypass that stop; finish target verification only after exact authorization.

S98 owner explicitly approves the exact rollout review on 2026-10-08, including
current visuals, expected-project legacy source verification in memory, protected
backup/rehearsal/migrations and five exact production notification fields using
the reviewed scoped provider method. All source/backup/drift/no-broad-write and
actual-delivery gates remain; no setting is assumed applied by this approval.

S97 / DEP-042: hosted client configuration additionally pins selected Firebase
project suqpage and number 588262779708 with package com.suqpage.app, rejects
private credential material even when nested in a purported client JSON, and
uses an explicitly approved API/Auth target. Private FCM credentials remain
provider-managed only. Same application identity does not isolate customer data;
review target and use labelled test records for production-connected QA. Signing,
version and actual OS delivery remain independent admission evidence.
