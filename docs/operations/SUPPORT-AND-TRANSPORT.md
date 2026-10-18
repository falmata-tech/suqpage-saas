# Business support and transport dispatch

This guide describes the **local candidate** through S126. Focused checks cover
response states, explicit Join, retained inactivity evidence and the private
admin email outbox. Current Chrome/Mailpit workflow verification, visual approval, full checks and
coordinated rollout remain pending. Local screenshots and Expo browser tests do
not establish installed Android or live-site behavior. Release receipts remain in
[TRACEABILITY](../../specs/TRACEABILITY.md),
[the S98 release record](../SUQPAGE-S98-RELEASE-2026-10-08.md) and
[the Google Play runbook](../GOOGLE-PLAY-RELEASE.md).

Only customer messages directly into a business's Suqpage inbox are retired in
S105/S106. Visitors contact a business through its configured social accounts;
tapping an account copies the selected products and a simple message in the
visitor's UI language. Manual copy remains an extra option. Existing public
contacts and retained private inquiry history are preserved; both new-inquiry
creation APIs return 410 in this local candidate. Public transport chat and
private owner Support remain available. Do not restore the business inbox when
handling a transport or support issue.

## Catalog policy and reports

The owner prohibits violent imagery, nudity/sexually explicit content and
age-restricted goods, including alcohol, tobacco/nicotine/vaping, weapons,
recreational drugs, gambling and adult products. The public rule is at
https://suqpage.com/terms. Ordinary cooking/industrial tools are not weapons solely
because they are sharp; review their actual intended use and listing.

Use Dashboard → Listing reports (/dashboard/reports). A support agent can claim a
report; managers can assign it. Review the actual product/page and media, not just
a keyword or an unrelated business name. Prohibited goods and Abusive content are
the existing reasons. Keep reporter details private.

An administrator can unpublish a confirmed violating product or suspend its
business. Support agents do not gain general business-edit rights. Verify that
reported public content is gone before marking its report Resolved; the backend
rejects resolution while that content remains visible. Dismiss only after review
finds no violation. Do not promise automatic checking of every upload or linked
video, or treat publication as approval. Transport-only agents and business owners
cannot access the private Reports queue. Catalog reporting is not universal chat
moderation.

## Find the right workspace

Owners enter **Account**, which contains six destinations: Your page, Products,
Business details, Account settings, Support and Transport chat. Support handles
private business questions; Transport chat arranges movement of goods for a
customer or the business. These are separate conversations and histories.

**Your page** groups Preview, About, Cover photo, Business video, Page color,
Public contact details, Page address and Team editing. Each editing task opens
its own controls with Save/Cancel. Preview contains publication and restore
controls; team editing requires the owner's consent. **Business details** manages
business/category/location information; **Page address** manages the handle.
Private account details and Notifications have their own settings tasks. Initial
setup opens the private sample preview; editing and publishing are explicit.

Administrators use **Businesses → Open workspace**. The contextual sections are
Overview, Your page, Products, Business details, Location & visibility and Access,
subject to permission. Products contains Categories; Business details separates
identity, live presentation and sharing information. Access contains owner
sign-in, staff assistance and public page status. Sponsor editing retains the
selected business under Location & visibility. Switch business restores the
bounded list origin; it does not grant access.

Staff/admin management stays on web. Scoped agents enter their own Business
support or Transport inbox; they cannot manage business pages/products or sign
into mobile. The public navigation says Login when signed out and Account after
sign-in; Account opens the role-authorized workspace.

## Prepare the team

The protected [local test guide](../../.local/workflow-audit-s110/TEST-GUIDE.html)
lists verified role emails, code retrieval and ordered scenarios. Use separate
browser profiles for participants and labelled disposable requests. Demo contact
buttons must not contact a real person. The guide gives testing procedures;
recorded coverage and native/OS limitations remain separate evidence.

Administrators use **Dashboard → Staff → Create staff account** to create a
Support agent or Transport agent. Each receives only its selected queue;
retained operator accounts may cover both. Managers can change assignment and
receiving availability. Hand off incompatible active cases before changing a
queue function. Owners control page-editing assistance separately; a retained
business association does not grant a scoped chat agent catalog/page authority.

In the S108 local candidate, the receiving agent with the fewest open chats wins.
Ties favor the oldest previous assignment, with never-assigned staff first, then
user ID. Selection, assignment, history and alert enqueueing are atomic. There is
**no per-agent chat maximum**, including claim, reassignment and reopening; closed
cases do not count. The legacy database maximum is retained but ignored.

**Receives new chats** is an explicit choice, not online presence. Pause it to
stop new assignments while keeping existing ownership, replies and history.
Enabling reception routes up to 100 oldest eligible waiting cases per save and
reports routed/remaining counts. That batch size is not an agent limit. Reads do
not reshuffle existing assignments. If no matching agent receives chats, new work
waits. Automatic assignment does not mean the agent has joined or replied.

S121 local correction: the running server worker also picks up older waiting
work automatically on startup and each minute. No staff button or inbox visit is
needed. Each tick considers at most100 eligible oldest cases and starts at most25
assignments within its bounded work budget; subsequent ticks retain the backlog.
These worker bounds are not per-agent limits. A manually unassigned case returns
to this automatic queue. To stop new work reaching an agent, pause that agent's
**Receives new chats** setting; there is no implicit hold attached to Waiting.
This local correction is not yet a hosted deployment.

## Handle transport requests

1. A visitor chooses **Transport chat**, enters pickup/destination and name/phone,
   and optionally describes the goods. No account or email is needed. A business
   owner instead opens **Account → Transport chat** with the same paired intake.
   Owner contact defaults are editable, routes start blank and the request belongs
   to the business account. It recovers through sign-in and its own Chat history;
   no guest conversation is adopted.
2. Open the **Transport** queue, verify the reference, route, goods and callback
   number. Eligible receiving staff get waiting work automatically. Assignment
   stays internal until the current assignee deliberately chooses **Join chat**;
   opening, reading or claiming the request does not join it. Then send a reply.
   Per-case claim/reassignment remains available for a deliberate handoff.
   A staff conversation offers **Assignment history** on a separate read-only
   screen with Back to that conversation and its bounded inbox origin.
3. **Reply** is public to the participant; **Internal note** stays staff-only.
   Public replies require the current assignment's explicit Join. A manager
   inspecting someone else's case can manage assignment and permitted notes but
   cannot join or send its public reply. Reassign to yourself before joining if
   you will handle the conversation. Private notes do not count as a team reply.
   Find a carrier externally, agree arrangements with the customer and save
   **Transport company** and its contact. Do not paste private carrier details or
   notes into a public reply. There is no built-in commission accounting, payment,
   booking integration or automatic carrier notification.
4. **All active**, **Unassigned**, **Chat history** and **Resolved** separate
   queued/live sessions, ended chats and completed follow-up. The compact
   **Reply status** filter distinguishes **Needs staff reply**, **Overdue** and
   **Waiting for customer** within active work. Search by name, phone, route or reference.
   **End chat**, by a visitor or owner, preserves contact details/transcript and
   removes the case from open workload; it does not resolve the transport work.
   Staff can call and add permitted private notes without reopening. An ended
   unresolved request shows **Chat ended** and **Needs follow-up**. Authorized
   staff use **Mark resolved** in either Support or Transport only when no further
   work remains. Owner/visitor ending and inactivity never resolve a request.
5. An authorized staff Reopen resumes the existing assignment workflow. An
   automatically ended participant chat may offer **Resume chat** under its
   existing access rules. Starting another request preserves earlier history.
   X dismisses the visitor window without ending its session.

Owner Support retains private attachments; transport remains text-only. General
visitor support stays closed. Historical buying requests retain original labels,
messages and private notes in the transport-scoped queue. Owners/visitors receive
only explicitly public replies, including through retained older mobile adapters.
No booking or immediate response is promised by an assignment or notification.

Customers see **Waiting for our team** while work is queued, assigned internally
or awaiting a team reply. Only an explicit Join announces the agent's identity;
after a public team reply they see **Waiting for your reply**. Internal assignment,
reply deadlines and escalation labels are not customer-facing response promises.

## Staff reply priority

A participant's first unanswered message starts one response cycle. Staff see
**Needs staff reply**, then **Overdue** ten minutes after the later of that oldest
unanswered message or the current active assignment. Reassignment gives the next
agent their own response window while preserving the customer's original wait
and assignment history. Additional customer messages, Join, reads and private
notes do not reset the customer anchor. A public reply clears the cycle. Reopen
alone starts no new cycle; the next participant message does. Unassigned work
keeps its ten-minute queue target, without attributing delay to an absent agent.

This ten-minute target is internal workflow guidance, not a public SLA or an
expiry rule. Unanswered work remains queued/active and unresolved; it does not
end just because a team reply is overdue. An ended request still needs follow-up
until authorized staff explicitly mark it resolved.

Visible active conversations refresh about every five seconds; failed refreshes
back off to thirty seconds and show a warning. Visible closed web threads check
for reopening every thirty seconds. Hidden clients pause polling and reconcile
when visible again. These intervals are not response-time guarantees. Browser
transport recovery lasts under the existing seven-day token rules; clearing or
expiring it loses that browser's access, while staff retain the callback record.
Account-owned transport instead recovers through authorized sign-in.

## Alerts and read receipts

Web Push/VAPID and Expo Android FCM setup were completed and verified in S98,
including the approved production notification fields, canonical Firebase client
and EAS credential association. Do not repeat project, key or signing setup merely
because real-device verification is pending. Provider configuration/acceptance is
not proof that a browser or phone displayed a notification.

In the web workspace, open **Alerts → Turn on notifications** and accept the real
browser permission prompt. **Play a sound for new alerts** is separate. If browser
permission was denied, use the browser's site-permission controls before retrying.
Record unavailable capability or subscription errors instead of replacing server
credentials. Android notifications use the installed admitted app and its system
permission; Expo browser previews do not prove Android OS delivery.

Staff receive scoped alerts for waiting team work, assignment/reassignment,
participant replies and relevant lifecycle changes. A newly overdue unanswered
cycle produces one durable escalation for its current authorized assignee and
managers, once per message cycle/current assignment. Unassigned overdue work
still reaches managers in-app. Repeated worker ticks do not replay the same
assignment's escalation, and answered/ended/stale or unauthorized alerts are
suppressed at feed/delivery. Historical certain cycles preserve their original
start but are marked already notified, avoiding catch-up pushes on rollout.
Visitors receive explicit confirmed-Join and unread public-reply alerts for their
valid transport session, not internal-assignment alerts.
Owners receive their Support and account-owned Transport alerts. Retired new
business inquiries do not create new inbox alerts. Notification text is generic;
private notes, carrier contacts and message bodies must not appear on the lock
screen.

An alert acknowledgement is separate from a transcript read. Opening Alerts or
Mark all read does not confirm that any chat message was seen. The transcript
marks messages Read only after the authorized participant actually views them;
hidden/covered messages remain unread. Assignment is also separate from confirmed
agent Join: read acknowledgment never accepts an assignment or announces an
agent. A confirmed read watermark is evidence of the authorized visible-read
workflow, not proof from push acceptance or notification delivery. For notification
expiry/revocation behavior, follow
[DEP-043](../../specs/deployment/DEP-043-notification-delivery-rollout.md).

### Administrator escalation email

When assigned work first exceeds its current response window, an email job is
saved atomically with each administrator/operations-manager overdue alert.
Scoped support/transport agents retain their in-app alerts; unassigned work does
not generate an email attributing delay to a staff member. This operational email
does not depend on browser notification permission. It does not edit account
emails, and acknowledging an alert is not a public team reply.

Each email uses the recipient's current canonical email and saved interface
language. It contains only the queue, public reference, assigned staff name and
an authenticated dashboard link. Customer identity, contact details, route,
messages, private notes and carrier data are excluded. Dispatch rechecks current
admin/operations access, active assignment, unanswered message cycle and due
time. Answered, ended/resolved, reassigned or unauthorized jobs are ignored.

The private outbox stores notification identities and delivery state, not email
addresses or message bodies. Dispatch sends at most two emails per invocation,
uses a 30-second lease with fenced completion, allows at most six attempts and
expires jobs after 24 hours. Missing configuration keeps jobs pending without
spending an attempt. Failures use generic categories, and late attempts cannot
overwrite a newer lease's outcome. Hosted retries reuse a stable Resend
[idempotency key](https://resend.com/docs/dashboard/emails/idempotency-keys);
provider acceptance is not inbox arrival or a human read.

Hosted delivery reuses `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL` and the
existing canonical app URL. Do not replace provider credentials to make a test
pass. Configuration readiness is only a safe boolean shape/target check, not a
provider probe. Default Resend refuses any loopback DB or Auth hostname,
independent of port, including local CI services.

Actual local preview instead explicitly selects the installed Mailpit
[HTTP send API](https://mailpit.axllent.org/docs/usage/sending-messages/) at
127.0.0.1:54324. This mode requires non-production, exact loopback PostgreSQL54322
and Auth54321 and never falls through to Resend. Verify the existing Mailpit has
no external relay/forwarding configuration before a real local email test; the
S126 protected preflight records that check without changing configuration.
Local messages carry a stable Message-ID for tracing. A local inbox capture
proves development delivery only; no external test email or hosted email rollout
is authorized by this guide.

## Inactive sessions and efficient maintenance

Local maintenance never ends an unanswered customer request just because it
has been waiting. A new public staff reply starts a persisted waiting clock.
**Guest transport** warns after 25 minutes and ends after 30 minutes without a
visitor reply. **Owner Support and account-owned Transport** warn after 23 hours
and end after 24 hours without an owner reply. A participant message clears the
clock; assignment, join, reads and private notes do not start or extend it.
Reassignment/reopen clears it pending another public reply. Existing records have
no retroactive clock backfill.

Auto-end records an unresolved ending, releases active assignment workload and
keeps contact/transcript/history. Valid guest tokens and exact references can
resume the same automatically ended unresolved case; expired, resolved and
manually ended cases retain their distinct rules. Clients show server deadlines
and retain drafts; browser timers never authorize closure.

For new verifiable automatic endings, the same transaction also saves an
immutable **Ended after no customer reply** record. Authorized staff see the last
public team reply time, ending time and **Read status at ending**. **Confirmed
read** means the last public reply had a confirmed read watermark when the chat
ended. **Not marked read** means no such confirmation was recorded; it does not
prove that the customer did not see it. The record remains after a later reopen
or resolution. Historical endings, or old due clocks with no verifiable original
reply, receive no invented evidence. Customers do not receive this internal
record. The ordinary closed event and unresolved status remain distinct.

The existing minute-scheduled worker handles automatic waiting assignment,
customer inactivity and staff-reply escalation as three separate bounded jobs.
Each has a busy-lock skip; routing/inactivity transition bounds and escalation
batches retain remaining work for later ticks. Failures are isolated from each
other and notification work. Email dispatch follows escalation with its own
failure boundary and lease limits. Hosted execution checks its existing
20-second start budget before every maintenance job and email dispatch.
Email HTTP requests have a four-second deadline; no DB transaction is held
while waiting on a provider. It adds no visitor heartbeat writes,
per-chat job, new realtime provider or application database. Each three-second
guard limits starting further transitions;
per-statement timeout and transaction-local five-second idle protection bound DB
work. A backlog/interruption may delay an eligible ending; this is not a hard
three-second completion promise.

For local upkeep, `npm run local:chat-worker` is separate recurring development
tooling. It checks loopback PostgreSQL/Auth, public schema69 and non-production
before sweeping; it never migrates or dispatches external push. Hosted execution
belongs to the existing scheduled Netlify worker on a published deployment.
The local schema67/68/69 changes were backed up, rehearsed, applied sequentially and
preservation/replay verified. Migration67 adds response-cycle and explicit-Join
state without rewriting historical messages/reads/events;68 permits closed-only
resolution in both queues and adds immutable ending evidence. Migration69 adds
assignment-scoped escalation markers and the private email outbox without
historical email jobs. This is local verification, not a hosted migration or
runtime rollout. The worker never applies migrations itself.

For an interactive local preview with chat maintenance supervised alongside the
web server, use `npm run dev:with-worker -- --port 3102`. The command checks the
existing local worker target and prepares local PostgreSQL/Auth before starting
the existing web launcher and worker. Its first maintenance tick starts
immediately, followed by the existing minute cadence. Keep this terminal open;
each worker tick prints only routing/ending/escalation/email/skipped counts and
safe configuration readiness. A worker
startup message proves its initial
target/schema check, not that any particular conversation is eligible to end.
If either child exits unexpectedly, the command reports which child stopped,
gracefully stops its owned sibling and exits nonzero. Ctrl+C stops both owned
children. It does not discover, stop or restart independent processes. If the
same web port or a standalone worker is already running, use that process's own
terminal to stop it before deliberately switching to supervised startup; do not
start duplicate supervisors or kill unrelated processes.

For a separately managed local session, record the actual owned web/worker/Expo
processes and their readiness in the protected run receipt; this guide does not
provide fixed PIDs or authorize stopping independently started processes.

Expo remains a separate terminal: `npm run mobile:web`. Ordinary
`npm run dev -- --port 3102` and `npm run dev:local -- --port 3102` retain their
web-only behavior, which is useful for protected fixture captures. With those
commands, start `npm run local:chat-worker` separately when recurring maintenance
is wanted. The supervisor reuses the same guarded worker and does not change the
25/30-minute guest or23/24-hour owner policy, send external push/email, migrate
the schema or configure any provider. Its controlled process-port regression is
`node --import tsx --test scripts/test-local-worker-supervisor.mjs`; running that
test does not launch development services or sweep the shared database.

## Owner videos: direct self-service links

Owners directly save **TikTok, YouTube, public Facebook videos or Instagram
Reels** in their Business video/cover or product editor. They do not submit a
support request or wait for approval. Supported links normalize to admitted
provider references; arbitrary embeds, private/unsupported URLs, Instagram photo
posts/profiles/stories and provider-lookalikes are not accepted. Save follows the
existing tenant/version/publication rules and preserves unrelated content/media.

Playback uses an official inline player inside the page/app. A portrait video is
centered with a softly blurred static cover/photo fill at the sides; it does not
extract video frames or run duplicate players/audio. Actual playback still
depends on the provider's public/embed permissions and network. An iframe load is
not playback proof. Retain the entered link and use the unavailable/retry state
for genuine provider failures; staff must not promise every linked video will play.

No Suqpage YouTube channel, provider OAuth or automatic upload is required. Old
review tickets and previously approved media remain private/compatible historical
records. They do not impose an approval gate on new owner video saves. Contracts:
[FE-060](../../specs/frontend/FE-060-self-service-cover-and-product-video.md) and
[BE-048](../../specs/backend/BE-048-self-service-video-links.md).

S126 target validation also rejects PostgreSQL DSN query `host`, `port` and
`connectionString` overrides rather than trusting a misleading URL authority;
ordinary SSL/application options remain supported. Actual local Chrome/worker
proof accepted six manager emails in three two-send runs and sent no duplicates
on the next run. The original short test-budget failure remains retained; a
same-case bounded continuation passed. This is Mailpit acceptance only.

## Pending device and release dependencies

These remain open; this guide grants no new release, credential or test-send
permission:

- Obtain explicit visual approval of the current candidate, including S125/S126, before
  expensive full/release/acceptance checks. Keep the current test-account guide and
  protected evidence separate from production readiness.
- Run the applicable approved gates, then prepare the exact migration/backup/
  rehearsal/rollback plan for the selected hosted schema. Local schema69 is not
  evidence that the live database has migrations64–69. Do not reapply historical
  migration59 or replace existing push/signing configuration blindly.
- Publish matching web/API before distributing a newly admitted Android binary.
  S114 owner transport adds no schema or provider of its own. Preserve privacy,
  unresolved-ending guards and case data during any code rollback. S125 requires
  coordinated schema67/68/69, API, web and native admission: older clients must not
  regain implicit Join through reads, and no historical alert/evidence replay is
  authorized by applying the additive schema.
- Use current-source installed Android evidence for signup, owner editing/media,
  MapLibre and both chat workflows. Expo browser layouts and old public APK smoke
  do not cover those native flows. The S107 emulator system-ANR limitation remains
  unresolved; do not label it an application pass or invent a new device session.
- On the real browser/Android device, record actual permission/denial, foreground,
  background/closed state, notification display/tap, mute, sign-out and expiry
  results, plus visible versus hidden-message reads. Use labelled cases in an
  explicitly authorized environment; do not create customer/hosted test chats or
  send external push merely to fill an evidence gap.
- Play version5 was last verified Available to selected closed testers. Twelve
  eligible addresses do not prove enrollment or fourteen continuous days. Genuine
  opt-ins, feedback, real-phone checks and production-access/public rollout remain
  external gates in the [Play runbook](../GOOGLE-PLAY-RELEASE.md). Existing artifact
  exceptions are consumed; they do not authorize another build.

## Historical releases and compatibility

The earlier S48 workflow required staff video approval and preserved private
review tickets under migration58. It is historical: S80/FE-060/BE-048 supersede
that admission requirement with direct owner saves. Retain its tickets/media and
older-review conflict/privacy behavior. Evidence remains in
`.local/video-request-review/` and the retained video-request tests.

S57 introduced migration59's closed-only resolution rule for transport; S125's
local additive68 extends the invariant to both queues while retaining closed-only
resolution. Its old “hosted migration pending” note is superseded by S98's
backed/rehearsed migration
60–62 rollout from schema59, followed by the recorded schema63 release. Earlier
September27 schema58 release evidence is not the current deployment target.
Retain buying/transport rows, tokens, assignments, private notes and audit history;
never relabel old records, backfill ambiguous notes as public or broadly restore a
DB as a routine UI rollback. S98 configured push but did not establish physical
OS delivery. The older no-background-push wording no longer describes the adapters.

S87/S104/S107/S108/S111/S114/S115 local audits use labelled disposable records,
real handlers and enabled rate/permission checks. Mutating staff/availability
capture scripts require a dedicated local fixture server/schema: normal staff
creation or enabling reception can route waiting cases. Do not run those scripts
against the shared preview. Preserve failed runs and independently reconciled
cleanup evidence; screenshots, provider fixtures and browser layout tests remain
distinct from current installed-device and production workflow evidence.
