---
id: DEP-043
title: Verified notification delivery rollout
status: in_progress
related: [DEP-048, BE-050, FE-062, ADR-0026, DEP-042, DEP-044, BE-018, FE-019, FE-036, FE-053, DEP-047, ADR-0031]
owners: [operations, security]
last_updated: 2026-10-20
change_level: L3
---

# DEP-043 — Verified notification delivery rollout

## S148 — scheduled worker startup boundary (verified)

The published minute worker failed at module loading because a shared hashing
utility also imported Next.js request headers. The background worker has no
request context. Keep the hashing/text rules identical while making its import
graph independent of `next/headers`, `next/server`, and other request-only
entry points. This is a packaging defect fix; notification routing, chat timers,
email contents, and tenant permissions do not change.

GIVEN the scheduled worker is bundled for the production Node runtime, WHEN its
startup imports are inspected and it is loaded without Next.js request modules,
THEN it loads and exposes the existing minute schedule and handler. GIVEN a
request handler uses the same hash/text utilities, WHEN they process the same
inputs, THEN their results are unchanged. A release requires the packaged
Netlify function to pass `scripts/test-attention-worker-runtime-boundary.mjs`,
a private draft invocation or equivalent safe runtime proof, and monitored
production logs after a separately approved
rollout; a healthy public page alone does not prove worker recovery.

Evidence: source commit `c176167`, GitHub quality run `39404830157`
successful on its one controlled rerun, Linux server SHA-256
`6b96c439261d4b9d9c178c9773f4efe0c88594ec583bb51301d214f3998fc1dc`,
worker SHA-256
`81b1cbd6beb8e96db9871fa2f0807f8c648c27e41f8d3f4eb3a6b5b53381d62e`,
and owner-approved production deploy `6ad73e5a9df2756523e8ac95`.
Six public routes passed after publication. Live scheduled invocations
completed routing, inactivity, reply escalation, and email checks; a
subsequent invocation routed zero remaining chats with zero pending/failed
emails. SMTP provider acceptance does not prove inbox receipt.

## Gmail SMTP manager-email source option (ready; ADR-0031)

The owner selects the existing Gmail account instead of opening Resend for
initial low-volume transactional mail. Code may add an explicit `gmail-smtp`
mode to the existing private overdue-alert outbox. Netlify alone holds the
production-context SMTP username/app password; Supabase Auth SMTP stays unchanged.
The From address must equal the Gmail username. No silent fallback to Resend or
Gmail from a local preview. Require real TLS and bounded provider timeout,
generic errors, a stable Message-ID and no secret output. If the mode is selected
without valid settings, leave jobs pending and report only configuration state.
Hosted readiness requires separately reviewed secret entry, redeployment and a
labelled real Gmail-to-inbox acceptance check; local Mailpit is insufficient.

## Ready: compatible browser wire and canonical display

The finite BE-059/FE-070/DEP-049 local split is Ready. Preserve Suqpage as the
browser wire token so installed old workers still receive alerts; the new exact
dual-title workers display only MirtPage, and validated Expo payloads use
MirtPage. Preserve channel/tag/subscription/source/delivery IDs, recipient and
queue authority, quiet behavior and internal tap validation. Prove old-worker
wire compatibility plus both new displayed-title branches in executed fixtures;
do not claim fleet update, permission, provider delivery or device evidence from
source tests. No provider/credential/SMTP/origin or app-mail retry change occurs.

Focused source evidence now passes11 actual-worker VM cases, including the exact
published old worker, plus isolated PostgreSQL web/Expo dispatch with retained
shared-token isolation/revocation/privacy/retry assertions. New workers display
MirtPage; old installations may retain their previous title. Channel/ID and safe
tap/quiet checks remain intact. This is not permission, OS/device, provider or
hosted-worker activation evidence.

## Ready: MirtPage Android client selection

DEP-049's local default-identity phase now selects only the real new MirtPage
Firebase app through MIRTPAGE_GOOGLE_SERVICES_FILE, without falling back to the
old file variable. Pin project/number/package/appID and exact downloaded bytes;
both legitimate clients in that file remain intact. Missing/wrong/private client
material stops the worker even if notifications are disabled. The approved M
supplies a white-alpha96px notification icon and canonical orange tint. Channel
IDs, token registrations, sounds, web delivery and private FCM keys are unchanged.
Actual new-package EAS/FCM binding and device delivery remain unverified until
their separate guarded operations. Earlier one-app statements describe releases
made before this owner-selected new package.

## S126 — fair assignment deadlines and admin escalation emails (ready)

Newest owner steering adds operational email alongside the existing in-app alert;
this is not account email editing. Keep S125 explicit Join and inactivity proof.
GIVEN assigned work has an unanswered participant cycle WHEN ten minutes pass
after the later of the oldest unanswered message or current assignment time THEN
show Overdue and alert current authorized assignee/managers. Join/read/note events
do not count as replies. Reassignment grants the next staff member their own
response window without rewriting the original customer wait or history.
Unassigned queue work retains a ten-minute queue-overdue alert, without an email
blaming an unassigned staff member. No public timing promise or numerical cap.

GIVEN an assigned cycle first becomes overdue for the current assignment THEN
atomically persist one per-admin/operations-manager email job alongside the
internal attention event. Deduplicate by conversation/message/current assignment/
recipient; retries preserve provider idempotency. Staff alerts remain in-app;
admin emails contain only queue/reference, assigned staff identity and an
app-authorized dashboard link, never customer name/contact/message/route details.
Recipients and target are canonical, freshly role-checked at dispatch. Old cycles
receive no catch-up email flood. New assignment cycles can escalate independently.

GIVEN the customer is answered, chat ends/resolves, assignment changes or recipient
loses authority before delivery THEN ignore stale jobs. Bounded leases, attempts,
24-hour job expiry, generic failure categories and recoverable missing config
preserve safe behavior. Use a typed email port and the existing Resend provider
with a stable idempotency key; never write provider credentials/configuration.
Actual local preview uses the already installed, verified loopback Mailpit only;
no external test emails. Local inbox capture proves dev delivery, not Resend inbox
arrival. Provider acceptance is not a human-read claim.

Additive migration69 records assignment-scoped escalation markers and a private
email outbox tied to existing attention events. Preserve all rows/history and
suppress previously notified/legacy cycles; rehearse rollback/no-op and protect
local before-images. No hosted mutation is authorized. Email dispatch is bounded
and independently failed within existing local/hosted minute workers; no new
schedule/dependency. Keep notification/maintenance budgets and sanitized logs.

Tests cover assignment/next-reply boundaries, one-per-cycle/assignment races,
recipient/tenant/privacy/role changes, answer/end/reassign suppression, provider
idempotency/retry/expiry/config failures, migration preservation and worker bounds.
Actual Chrome staff/admin + real local Mailpit readback supplements S125 paired
web/Expo journeys. Focused checks precede explicit visual approval/full gates;
unchanged native Join/receipt behavior remains under S125 evidence.

Focused verification maps to `scripts/test-support-assignment-response-migration.ts`
(schema69/backfill/no-op), `scripts/test-support-assignment-response.ts` (assignment
fairness, atomic manager jobs, old-writer recovery and bounded candidates),
`scripts/test-support-escalation-email.ts` (localized private content, provider
bounds, effective-target rejection), `scripts/test-support-escalation-email-delivery.ts`
(fresh authority, leases, deduplication, retries and stale suppression), and the
local/scheduled worker tests (isolation, order and execution budget). The named
`npm run test:support-escalation` chain is included in `test:support`; full gates
remain subject to the current visual-approval requirement.


## S125 — bounded response escalation and explicit acceptance rollout (ready)

Additive schema67 stores unanswered-cycle anchors and explicit assignment Join
identity without modifying historical message bodies, read cursors or events.
Backfill only certain participant cycles and suppress historical alert replay.
Protect local before-images, apply sequentially, verify preservation and no-op
replay before enabling runtime that uses the new fields. No hosted apply is
approved by local implementation.

Existing local and hosted minute workers run bounded reply-overdue maintenance
with independent failure handling after existing dispatch/receipt/routing/idle
work and within the existing maintenance-start budget. Use support-work try-lock,
short transaction limits, bounded batches and sanitized counts. No per-chat timer,
new provider or extra schedule. Delivery rechecks stale-cycle authorization.
Local actual QA uses process-only push suppression, restores ordinary launchers
and proves saved settings unchanged. Explicit Join changes require coordinated
schema/API/web/native rollout; older clients cannot implicitly join by reading.
Tests cover limits, contention, failure isolation, schema guards and unchanged
provider configuration. BE-018/050 and FE-019/053/062 govern the feature.

### S125 additive schema68 checkpoint (ready)

Isolated runtime verification exposed the retained transport-only resolution
CHECK before any technical-support resolution write. Keep already applied67
immutable. Add68 with a closed-only all-queue resolution invariant, idle_ended
event enum member and partial latest-evidence index under BE-018. Protect local
before-images, rehearse rollback, apply sequentially and verify history/no-op.
Runtime audit evidence is written only in the existing due-ending transaction;
no new timer/provider or historical evidence backfill. Hosted schema67/68 remains
separately reviewed, backed up and coordinated with API/web/native release.

## S121 — recurring automatic waiting assignment (ready)

GIVEN local supervised startup or the existing minute hosted worker WHEN an
invocation has maintenance budget THEN call BE-018's bounded internal automatic
waiting assignment as well as inactivity maintenance. Local startup runs its
first tick immediately; subsequent ticks retain60second cadence. New arrivals
remain immediately assigned in their normal command. Hosted scheduling does not
require a visitor browser to stay open. No new provider or hosted configuration.

GIVEN routing or inactivity fails THEN report its sanitized category and still
attempt the other task when budget permits. Preserve notification dispatch/
receipt failure isolation and the existing20second hosted maintenance-start
budget; recheck before starting the second maintenance command. Busy/remaining
work stays durable for later ticks. Logs contain counts, not bodies/contacts.
Keep local target/schema and import/owned-process guards. Existing saved provider
settings and minute schedule remain unchanged. Tests cover both tasks, either
failure, busy/budget skips and ordinary supervisor behavior. Verify the actual
local worker assigns pre-existing eligible waiting cases without clicking a UI
command, with exact before/readback records. This is not hosted deployment.

S121 local verification:12 focused worker/controller/supervisor cases pass,
covering immediate/60second sequential local ticks, either/both command failures,
sanitized counts, busy-lock handling, import/target guards and hosted20second
split-task start budgets. `.local/automatic-routing-s121/worker-results.json`
retains exact source hashes. The actual supervised local startup reports
routed5/ended0; later ticks report routed0/ended0. Protected independent before/
readback proves exact-once fair assignments without staff action and unchanged
messages, prior history, other conversations and saved provider settings:
`.local/queue-recovery-s121/root/verified.json`. Test-only external-push overrides
are process-scoped; ordinary supervised settings are restored after browsers
close. No new schema, credential, hosted setting, schedule or deployment.

## S119 — explicit supervised local startup (ready)

GIVEN local web testing needs recurring chat maintenance WHEN an operator selects
`npm run dev:with-worker -- --port 3102` THEN supervise the existing local Next
launcher and guarded local chat worker together, forwarding web arguments only
to the existing launcher. Reuse their target/schema checks; no new dependency,
provider setup, hosted target, migration or notification dispatch is introduced.
Importing the supervisor or worker must not start either child, including when
an unrelated importing command uses `--run` or `--once`; only the exact worker
entry file admits those existing direct flags. Ordinary `dev`, `dev:local`
and the separate worker command retain their existing behavior for protected
captures. The supervised command does not start Expo; use its existing command.

GIVEN either owned child fails to spawn or exits unexpectedly, including exit0,
THEN report a sanitized named-child failure, stop its owned sibling gracefully,
wait for owned children to close and finish nonzero. Do not silently leave a
working web server without maintenance or claim healthy startup before the
worker's existing target/schema checks. On SIGINT/SIGTERM forward graceful
shutdown once to owned running children, wait for closure, remove controller
listeners and finish successfully unless a prior failure occurred. Never
discover, signal, replace or restart an independently started process; the
existing support-work lock still protects concurrent worker transitions.

Focused tests use controlled child-process/signal ports and actual event
lifecycles to prove import safety, arguments, both-child startup, unexpected
exit0/nonzero/spawn failure, sibling shutdown, signal deduplication and listener
cleanup. No real development process, database or maintenance sweep is launched
by these controller regressions. `scripts/test-local-worker-supervisor.mjs`
records this focused infrastructure evidence; shared UI approval/release gates
remain separate.

S119 focused local evidence (2026-10-17): supervisor and direct-worker lifecycle
tests pass10/10, with separate isolated inactivity and scheduled-worker checks
passing. Evidence is `.local/inactivity-s119/supervisor-verified.json` and
`.local/inactivity-s119/isolated-results.json`. A subsequent actual operator
startup of `npm run dev:with-worker -- --port 3102` also passed: the guarded worker
reported started and `ended:0, skippedBusy:false`, and Next reported ready on3102.
The web/worker remain supervised together; Expo remains separately on8082. This
actual startup supplements the earlier controller-only receipt and does not
establish external notification or installed Android delivery.

The real running maintenance worker closed labelled Chrome QA case317 at its
explicitly accelerated guest deadline, retained history/last-assignee identity,
released the active assignment and left the request unresolved. See
`.local/chat-reliability-s119/worker-actual-verified.json`; do not report this as a
naturally elapsed30-minute test. The policy remains guest30 minutes and owner
Support/Transport24 hours after a public staff reply; unanswered customer work
does not auto-end. S121 supersedes the earlier manual waiting-work recovery with
its separate automatic routing command in the same minute worker. Neither
GET/polling nor the inactivity sweep itself assigns work.

Local migration66 for BE-050 nullable sender-side receipt metadata was backed up,
rollback-rehearsed, applied and replay-verified with history/protected data intact
and no backfill: `.local/chat-reliability-s119/migration66/`. The supervisor does
not run migrations. No hosted migration, provider/configuration change or web/
native publication occurred. Status remains in_progress; current visual review,
full/release/acceptance gates, installed-device proof and independently reviewed
hosted migration/API/web/native rollout remain pending.

## S111 — bounded chat maintenance in the existing worker (ready)

Reuse the existing minute-scheduled Netlify attention worker, without a new
provider/credential, public maintenance HTTP endpoint or per-session job.
BE-018 S111 maintenance uses a nonblocking support-work lock, index-filtered due
clocks, at most25 transitions and bounded database time. Failure is sanitized and
independent of attention dispatch/receipt work; notification work still runs.
Tests exercise success/failure/skip paths and query/index usage.
Maintenance uses transaction-local statement and five-second idle-in-transaction
limits, so an interrupted function cannot retain an idle support-work lock
indefinitely. These settings must reset after commit/rollback and must not alter
the pooled connection's ordinary application defaults. The three-second work-start
budget is distinct from a hard transaction deadline; never claim strict completion
within that budget. Focused PostgreSQL evidence verifies LOCAL scope and reset.

Apply the additive nullable-field/partial-index migration to an isolated local
fixture first, verify backwards-compatible old cases and tests, then local preview.
No old case is auto-ended merely because of the migration. Hosted rollout requires
its exact migration/backup/rollback plan and all existing approval/release gates.
Disable/revert the maintenance worker/client feature on rollback while retaining
additive fields/events/history; do not erase state or broadly restore a database.
Netlify schedules run on published deploys, not ordinary Next dev. A separately
started local worker command is recurring development tooling: require explicit
--run/--once, PostgreSQL driver, loopback54322 PostgreSQL and loopback54321 local
Auth, non-production environment and verified public schema containing migration65 before
any sweep. It runs one sweep at a time each minute, handles signals gracefully
and logs only counts/safe categories. It does not migrate, configure providers,
load notification secrets or run automatically when imported. Test target/version
rejection before writes. Local paired captures still restrict maintenance to their
own due fixtures under the support lock; never close unrelated waiting cases.


Mapped focused regressions: `scripts/test-scheduled-attention-worker.ts`, `scripts/test-local-chat-worker.ts` and `scripts/test-support-inactivity.ts`. They verify failure isolation, late deferral, import/target/schema guards, pool cleanup, count-only logs, try-lock/index/batch/timeout behavior and transactional rollback. Protected local apply/once evidence is `.local/workflow-audit-s111/migration/`; no hosted rollout is implied.

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


S98 production rollout evidence, 2026-10-08: source a81c93f is published in
Netlify production deploy 6ac839e949737af3112e0764 on schema 62. Backed/rehearsed
migrations preserve existing records' original-column hashes and private-table
permissions. The owner separately approves Free default scopes for the exact five
production-only fields; additive creation and exact readback pass without upgrade.
Explicit scope-list requests were denied with no mutation. Existing runtime/DB
fields remain production-only: the draft static association passes, while draft
dynamic smoke fails for missing driver configuration and is not counted as passing.
Full local runtime/workflow gates and selected production runtime preflight precede
identical-archive production upload. Live web/native catalogs, health, protected-route
denial, www redirect and canonical association pass; actual scheduled empty-queue
execution succeeds. No customer chat or provider notification is created by smoke.
The canonical APK is complete with artifact/installed evidence below. Actual
browser/physical-phone permission, display,
tap/mute/logout/expiry and confirmed Read remain separate; keep in_progress.
Evidence: docs/SUQPAGE-S98-RELEASE-2026-10-08.md and protected operation receipts.


S98 Android artifact/installed evidence: build 565b9614-428d-47b4-8780-2b0f9c96d68b
finishes on Free (6/30, zero cost), source a81c93f. Actual nondebug package
com.suqpage.app/version 2 and pinned existing signer pass SDK inspection. APK
SHA-256 a7acae61994fbd6ed5440dd46fa3cdf8fecb50681e91db210fb5a523a158bea7.
Actual Firebase client resources, notification permission and canonical HTTPS intents
match; artifact/export/archive exclude private data/credentials and admitted tooling.
The APK installs/launches on isolated API 35. Android verifies suqpage.com. Twelve
public/locale states, real map tiles, cluster expansion, labelled shop selection and
preview-to-store navigation pass, with no app crash/keyboard-metrics/text-node error.
No account sign-in or customer inquiry/chat is created by native smoke. Emulator is
closed. Physical-phone/browser OS alert and authenticated hosted workflow evidence
remain outstanding; DEP-042/DEP-043/FE-062 stay in_progress. See the S98 release record.
