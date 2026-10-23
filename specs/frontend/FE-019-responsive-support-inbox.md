---
id: FE-019
title: Responsive client and staff support inbox
status: in_progress
related: [FE-060, BE-048, FE-049, FE-053, FE-056, ADR-0023, FE-024, FE-026, FE-036, BE-018, BE-024, DEP-015, DEP-026, ADR-0009, ADR-0012, BE-032, BE-040, BE-042, DEP-039, FE-057, FE-062, DEP-043, BE-050, FE-068]
owners: [frontend, customer-support]
last_updated: 2026-10-23
change_level: L3
---

# FE-019 - Responsive client and staff support inbox

## S168 — stable live-chat phase after a timely reply

Web and Expo use the server's first public staff-reply timestamp to decide
whether Transport became a live conversation before the 3:30 handoff. A later
staff reply or a long transcript must not hide the initial timely reply and
replace the live composer with a callback form. A solely late reply does not
reopen the live portal. The authorized participant receipt contains only this
timestamp, not private staff notes or assignment history. Cover guest and
business-owner conversations in the affected UI state checks.

## S162 — timed transport wait and offline follow-up (implemented locally; full release review pending)

For visitor and owner Transport requests, the initial copy names the selected
provider and says its live agents will join to arrange the shipment. Until
provider-owned staff accounts exist, MirtPage staff operate the provider's
internal queue on its behalf; provider-owned routing remains future work. Do not
call the agent a coordinator. At two minutes without Join or a staff reply, say
that the provider's team is helping other customers and show elapsed wait. At
three minutes thirty seconds, stop the live session and replace the transcript,
composer and chat utilities with a short callback form. Say: “The team is helping
other customers right now. Leave your contact details and they’ll get in touch
as soon as possible.” Keep this un-timed; do not expose assignments, staff
identity or an ETA.

The initial intake already captures name and phone. Prefill and show those
details in the callback form; let the visitor correct the phone and optionally
add an email. At least one valid contact method is required. Do not ask for
information already present. Submitting creates one idempotent offline
follow-up in the existing Transport staff case and stores the selected contact
details on that record. Staff retain the open case for phone/email follow-up; it
is not resolved, blamed on staff or treated as a new shipment. After success,
show a static receipt naming the contact channel(s). Remove the live transcript,
reply box and chat controls from the visitor view. Stop conversation and
unread-alert polling after the 3:30 transition; make no background requests
while the callback form or receipt is displayed. One submit and bounded retry
are allowed, fenced by an idempotency key. Retain the reference for the receipt
and staff case; never keep a live-message portal mounted after timeout.
The callback form also offers a quiet Cancel request action, which closes the
same case and reveals Send another request. After a callback has been submitted,
the static receipt offers Send another request directly; this leaves the prior
follow-up available to staff. Web and Expo use the same distinction.

Explicit Join or a public staff reply before 3:30 ends the wait and retains the
active live conversation. The selected-provider routing language is consistent
for visitor and owner entry. Reconnect, resume or switching pages recomputes
from the original server-created timestamp; reassignment cannot reset it. The
offline transition is enforced by the server as well as the UI so a stale client
cannot continue sending live replies after the deadline. Other owner/visitor
idle rules remain unchanged.

GIVEN a new visitor or owner Transport request is waiting THEN show the selected
provider's live-agent message and elapsed time. GIVEN two minutes pass without
Join/reply THEN show the localized busy message and elapsed time. GIVEN three
minutes thirty seconds pass without Join/reply THEN stop live polling and show
the callback form with the existing phone prefilled and email optional. GIVEN
the visitor submits at least one valid contact method THEN save one follow-up
request to the same staff case, retain staff access, and show a static receipt;
the visitor receives no live transcript, reply composer or polling afterward.
GIVEN an authorized agent joins before the deadline THEN retain the live
conversation. Sleep, reconnect or stale responses cannot return a visitor from
offline follow-up to a live session.
GIVEN the callback form is open WHEN the participant cancels THEN show the ended
state with a new-request action and do not submit callback details. GIVEN a
callback receipt is shown WHEN the participant starts another request THEN open
a fresh intake while the earlier case and follow-up remain intact. A stale
pre-timeout End chat action must settle to the authoritative ended state.
GIVEN a business owner starts a request from a fresh intake and then ends it
WHEN they select Send another request THEN display a fresh intake in the same
account, without reopening, replacing or deleting the ended case. The address
bar and client router must agree on the selected case versus new-intake route;
changing only browser history must not leave the old chat mounted under the new
URL. Reopening Chat history still finds the ended case by its original reference.
On the Expo owner intake, keep Account, Chat history and Shipment records in a
compact accessible utility row that wraps only when the localized labels need
more room. Do not stack three full-width actions above the first route field;
the main intake and Start chat remain the visual priority at phone widths.

The user suggested a later phone-assisted live return. Treat it as a separate
future capability, not part of S162: staff may invite a caller to re-enter one
specific case with a short-lived, single-use code. Any implementation must bind
the code to that case, expire it, limit attempts, avoid exposing other records,
and activate polling only for the redeemed live session. Never use a
static/reusable shared code or keep polling open while idle.

Test exact 119,999/120,000ms and 209,999/210,000ms boundaries, Join/reply stop
paths, late events, invalid/future timestamps, reassignment, offset clock,
remount/reconnect, repeated submit/lost response, phone correction, optional
email, invalid/missing contact, owner and guest scopes, same-case staff
follow-up, server rejection of post-deadline live replies and proof that both
public pollers stop at timeout. Actual Chrome desktop/phone and Expo must
exercise the complete workflow before visual approval/full gates.

S162 local evidence before this correction (2026-10-22) verified an earlier
same-thread composer at 2:00/3:30 in isolated Chrome and local PostgreSQL. That
direction is superseded and does not qualify the new callback flow. The old run
also exposed an Expo post-send clock race; retain its fixture only if it still
proves monotonic phase changes. A fifth shared-preview start was rate-limited
before creating a row; no limit was bypassed. Three cancelled GETs remain
unclassified. No new shared-preview starts are authorized by this spec. Callback
behavior, poll-stop assertions, owner/staff follow-up, visual approval and full
gates remain pending. Prior evidence is retained at `.local/s162-transport-review/`.

## S153 N12 — compact native transport conversation (focused checks pass; phone review pending)

The physical development-client audit confirms excessive utilities/status height
before the first message and an End chat control clipped by persistent navigation.
GIVEN an active guest or owner transport conversation WHEN opened at 320/390px,
landscape or with enlarged en/am/om labels THEN present tracking/alerts and concise
reply/join state/reference in a compact, wrapping utility area. The transcript
and composer are the primary task; Send and End remain reachable above navigation
and keyboard, with at least48dp touch targets. Keep intake unchanged and retain
all owner return/history, tracking, alerts, end/resume/start-another and idle/error
controls. Do not hide controls or truncate meaningful status to meet a height goal.

Reuse the existing presentation and actions; keep transcript identity/read
sentinels, actual visibility, draft, request fences, Join/assignment/idle clocks,
credentials and API authority unchanged. Test waiting/joined/reconnecting/idle/
closed states, draft/send failure/retry and every retained action in the existing
native transport and chat-state suites. Verify actual Expo phone/landscape and
physical Android keyboard/safe-area geometry before the existing visual gate.
Master §§13/19 already control this task-first contract. Root authorized layout
work after the N15 focused polling correction. Keep its exact polling body intact.
Use one wrapping utility row, a normal-size response status/reference, and the
single existing End action near that status rather than below the transcript.
Keep one Screen scroll container and its existing read-sentinel boundaries.
When the available viewport is too short to fit status, transcript and composer
(including phone landscape), the screen scrolls vertically while retaining a
visible transcript area; End remains above the first message and no content
overlaps. Normal portrait keeps the bounded transcript scroll.
Do not change shared response wording or add a new localized state in this batch.
The joined/awaiting-first-reply English ambiguity remains an open copy finding.

Focused evidence: the installed-RNWeb check uses actual Buying, UI primitives
and Alerts trigger across18 language/role/viewport states plus enlarged-text/long
identity stress. The single End action precedes the first message, utility targets
remain48px, labels wrap, and Send scrolls above navigation with only one scroll
container. The prior source fails the End-placement assertion. Five chat/state/
owner/storage suites qualify38 tests in composite:34 passed initially, and all4
race tests pass after their raw-div native port is corrected to flatten legitimate
style arrays; the failed attempt is retained. N15 function body and intake bytes
are unchanged; mobile/scoped test types and219 specs pass. These controlled ports
are not ordinary API delivery, physical keyboard or final visual approval.


## S153 N07 — useful owner history empty states (focused checks pass; review pending)

GIVEN owner Support finishes a successful empty history load THEN keep its new
chat form and show the existing localized “No support conversations yet.”
GIVEN owner Support or Transport history has zero or one result page THEN omit
Previous/Next; show them only for multiple pages with the existing bounds and
authorized page requests. Never show an empty explanation during loading or an
error, hide retained records/drafts on refresh, or change conversation authority.
Keep Support and Transport separate. Existing FE-053/FE-056 owner tasks and
master §§13/19 already require clear private tasks and honest empty/error states;
no navigation, backend or language behavior changes are introduced.

Verify actual source with `scripts/test-mobile-owner-transport.ts` and actual
React DOM with `scripts/test-client-chat-state-ui.ts`: empty/single/multiple
pages, paging bounds, refresh/error retention and unchanged Support fields.
Actual Expo and the corrected Android client remain separate review evidence.
Both suites pass 24 tests, including retained composer/history and paging bounds;
mobile/scoped test types and specification validation pass. No chat or email was
created by these controlled component checks.

## S153 phone composer clearance (in progress)

The local actual-user audit found that the transcript's 220px minimum plus the
reply form pushed Send beneath persistent phone navigation. This corrects layout
only; FE-026 workspace destinations, FE-035 labels/touch targets and all existing
Join, audience, assignment, receipt and persistence authority remain unchanged.
Master §19's transcript/reply-first statement is affected only by this refinement.

GIVEN assigned staff has joined an open conversation WHEN it is viewed at 390×844,
320×568 or 844×390 THEN the full reply audience, message field and Send action are
reachable above persistent navigation without horizontal overflow; controls keep
48px targets. The transcript has its own bounded scroll area. Long authored labels
remain readable. Desktop management and phone Details/Back retain their existing
behavior, draft and selected Reply/Internal note audience.

Ordered verification:
- [x] Preserve original actual 390px failure and reproduce with real page markup,
      actual global/module CSS and persistent dashboard phone shell.
- [x] Make the smallest staff-only responsive layout correction.
- [x] Verify computed action/navigation geometry, short/landscape, long labels,
      draft/audience retention and desktop regression in the focused test.
- [ ] Exercise actual Chrome on the isolated local preview using existing case 69
      and exact local staff/admin fixtures; retain API/DB outcomes for any action.
- [ ] Present combined visual review; full gates, commit and rollout remain pending.

Test: `scripts/test-support-compact-ui.ts`; local review evidence remains protected
under `.local/mirtpage-user-journey-audit-s153/staff-composer/`.

## S142 compact staff conversation and retired company handoff (ready)

Latest owner correction: chat is the primary task, not a tall dashboard report.
Use one compact staff header with an inbox return, queue/reference once, subject/
route and concise current reply/assignment state. Remove repeated Back/reference
rows, oversized title margins, redundant raw open-status and obsolete plan tabs.
At normal1440×900, the transcript should start within160px below the dashboard
content origin and provide at least300px before its own scroll, with reachable
composer. At390×844 default Conversation keeps management panels out of the chat
stack; a48px Details action opens an explicit bounded details view, not accordions.
Retain the mounted composer/draft across Details/Back. Desktop shows existing
management/request context alongside the transcript, not above it.

GIVEN hidden Details mode THEN chat read observers are inactive; unseen replies
cannot be acknowledged. GIVEN Join/reply/assign/resolve/note/history actions THEN
fresh authority, receipt/assignment epochs, SLA/idle clocks and inbox-return
context remain unchanged. Details mode is explicitly allowlisted and stripped on
return to inbox. Actions returning to Details preserve that mode. No arbitrary
return URL or credential in navigation. Support as well as transport uses the
same compact shell. Long labels, errors, success notices and reply drafts fit
phone/desktop at48px controls; success notice must not dominate the viewport.

Remove the old Transport company add/edit form and queue summary. Stale handoff
actions authenticate and deny without appending events. Tracking stages are the
only current provider-entry workflow. Retire obsolete case-plan screens/actions;
historical-data cleanup is the separately scoped S144 operation, not UI mutation.

Ready: existing support/receipt/transport authority contracts retained; no new
schema or business rule. Focused navigation/React/read-visibility/retired-action
regressions and actual Chrome admin/transport/support desktop+phone tasks verify
typing, Details→Back, reply→counterpart/read, Join/assignment/resolve and real
local API/DB outcomes on labelled fixtures. en/am/om labels reuse authored keys.
Master §§13/18/19/22 need verified reconciliation. Visual/full/rollout gates stay.

## S125 — actionable response states and explicit Join (ready)

GIVEN staff views active work THEN show Needs staff reply, Overdue or Waiting for
customer from the authoritative BE-018 response state, with a compact labeled
Reply status filter and preserved queue/search/page/return context. Assignment is
secondary internal information. Closed unresolved work shows Chat ended and
Needs follow-up; Resolved is distinct. Authorized staff uses Mark resolved for
both Support and Transport; participant ending never resolves a request.

GIVEN a current internally assigned staff member opens a conversation THEN offer
Join chat before the public-reply composer. Opening/reading/Claim never joins.
Join must be a deliberate server-validated action for the current assignment;
wrong assignees/roles and stale forms cannot join. Public reply requires joining;
private notes preserve existing access. Customers see Waiting for our team before
explicit Join, never Assigned to/name/internal workload or overdue deadlines.
After Join they may see the joining agent, and after a public reply Waiting for
your reply. Preserve visible reads, draft recovery, history, resume and idle
warnings. Owner/client views never expose staff filters or internal due dates.

Cover staff/admin and owner/visitor on desktop/phone web and affected Expo8082,
including actual Join, public reply, read acknowledgment and terminal recovery.
Focused tests precede visual review; explicit visual approval precedes full gates.
Related BE-018/050, FE-053/062 and DEP-043 govern matching layers.

### S125 staff-visible no-customer-reply evidence (ready)

GIVEN a staff conversation has a persisted idle_ended event WHEN authorized staff
opens it THEN show a compact Ended after no customer reply explanation with last
team reply time, ending time and Confirmed read / Not marked read at ending.
This is a factual system record, not a claim of delivery or customer fault.
Retain it after later reopening/resolution. Customers receive the existing clear
inactivity reason; internal evidence is not exposed in customer DTOs or views.
Historical endings without this event do not receive reconstructed proof.
Tests cover presentation/localization plus authoritative paired worker readback.

## S121 — waiting is an automatic queue (ready)

BE-018 S121 supersedes the S119 bulk-manual-recovery and implicit hold text.
GIVEN eligible staff WHEN a case waits THEN the server maintenance route assigns
it automatically by workload without clicking Assign waiting chats or visiting
the inbox. New cases keep immediate assignment. Remove the bulk manual button
and hidden-hold explanation; keep per-case claim/reassignment and availability
management. Unassigning a case puts it back into the automatic queue. Visitor,
staff and admin show the same saved reference/assignee while distinguishing
assignment from joining. Cases with no eligible staff continue to show Waiting.

Focused UI/action and real local Chrome/affected Expo flows must observe the
same waiting case change to Assigned through the running worker, with no staff
assignment action. Preserve drafts, history, receipts and native polling bounds.

S121 local evidence: six focused actual staff route/action/mounted-editor tests
pass in `scripts/test-support-staff-ui.ts`. Owner lifecycle parity is exercised
by `scripts/test-mobile-owner-transport.ts`. Actual Chrome admin and assigned
transport staff see the automatically assigned older case in Active, with the
same reference and agent. Expo owner support shows its original reference and
Assigned before Joined, using real focused reads. The same-case reconnect receipt
is `.local/queue-recovery-s121/native-agent/reconnect/review-receipt.json`.
One deliberately aborted read then recovers automatically in10.708s without
Retry/navigation/commands; recovery/review-receipt.json records the controlled
failure and real retry. Original coordination/cold-restart strict failures remain
failed and retained. This is local Chrome/Expo evidence, not physical Android or
seamless restart proof. Current visual/full/release gates remain pending.

## S119 — verify the actual chat workflow (ready)

The historical bulk-manual-recovery/implicit-hold acceptance below is superseded
by S121. Its lifecycle, conversation-first and explicit editor requirements stay.

Staff-task acceptance (ready before implementation):
- GIVEN a queue row or staff detail WHEN a request is waiting, assigned but not
  joined, joined, manually ended, automatically ended or resolved THEN show the
  saved lifecycle accurately. A closed unassigned case never says it is waiting
  for an agent; a joined case names that saved agent. Assignment is not joining.
- GIVEN Transport THEN expose Active, Waiting, Chat history and Resolved as
  shallow contextual destinations; preserve bounded search/page origins and
  role-pinned queue access. Do not show an empty carrier-selection placeholder
  as if every live/ended request has incomplete business work.
- GIVEN an operations-authorized queue view WHEN explicitly choosing Assign
  waiting chats THEN POST a bounded recovery command for that queue, retain the
  list context and report authoritative routed/remaining counts. Hide this action
  from clients and queue agents. It never runs during GET/polling and does not
  override a manager's deliberate waiting hold. BE-018 governs routing/security.
- Focused actual SSR/action tests cover these states, role-filtered actions,
  current assignment, safe origin/feedback and no hidden editor/GET mutation.
  Local phone/desktop review remains separate from full/release approval.

Conversation-workspace acceptance (S119, ready before implementation):
- GIVEN an authorized staff conversation WHEN opening its detail THEN the
  transcript and reply composer are the primary task. Request/contact details,
  assignment actions/history and private transport-company work occupy a
  secondary desktop column and follow the conversation on phones. These tasks
  do not push the transcript below an always-open company editor or a duplicate
  request-summary textarea. Preserve existing reply/claim/reopen/resolve rules.
- GIVEN transport-company work is authorized WHEN viewing the conversation
  THEN show saved company/contact details read-first, or a deliberate Add action
  when none exists. Only Edit/Add opens the bounded company fields; Cancel
  returns to the read view without submitting, and keyboard focus enters/leaves
  that pane predictably. Closed conversations keep their existing read-only
  company state. No accordion, new route authority or private-data exposure.
- GIVEN a company edit is saved THEN retain the existing conversation ID,
  previous-company version fence and allowlisted inbox origin. Copy request
  remains a secondary action using the same request text, with a selectable
  fallback only when clipboard access fails. Focused actual route/component
  tests cover task order, authorization, closed/read/edit/cancel states, fields
  and hidden fences; parent-owned phone/desktop captures precede visual review.

Focused S119 workspace evidence: `scripts/test-support-staff-ui.ts` passes six
cases, including actual route SSR with the real company component and an actual
mounted React company pane. The added cases verify transcript/composer-before-
context order, role-filtered company reads, assigned read epoch/queue origin,
closed internal-note preservation, deliberate Add/Edit, focus/Cancel with zero
writes, pending duplicate fencing, network-failure field retention/private-error
redaction, previous-company/navigation fields and clipboard fallback. The
browser test uses controlled action/clipboard ports, not a database or provider;
actual local desktop/phone capture, owner visual approval and full/release gates
remain separate and pending. Test-harness-only sandbox launch and missing
browser `__name` bootstrap failures were classified before the final passing run.

GIVEN the same canonical request on visitor, staff and admin screens WHEN staff
assignment exists but joining has not happened THEN clearly distinguish assigned
from joined, using consistent primary status on web and mobile. Never label an
assigned request as an unassigned waiting request. A legitimately waiting old
request remains waiting until a routing command changes its saved assignment.

BE-050 S119 governs visible footers, asynchronous focus loss, assignment/join
epochs and participant-side colleague receipts. BE-018 S111 owns the actual
inactivity deadline: only a public staff reply starts waiting-for-participant;
unanswered customer requests must not silently expire. Verify a labelled actual
local case through Chrome and the running maintenance worker, with any accelerated
test clock explicitly identified. Preserve history, resumability and resolution.
Admin task improvements must follow observed task/navigation problems rather
than another broad visual rewrite. Record desktop/phone evidence, retain failures
and request visual review before full release gates.

## S115 staff history is a deliberate destination (ready)

GIVEN an authorized staff member in a conversation WHEN opening Assignment history
THEN show its existing read-only history on a separate contextual screen, with
one clear Back action to that conversation and its bounded inbox origin. Do not
bury history in a transcript accordion. Owners and unrelated staff cannot access
assignment history; retain the existing conversation permissions and no new write.
Focused route tests cover contextual links, current access denial, safe origins
and absence of editors on the history screen.

## S111 — clear inactivity and recovery (ready)

BE-018 S111 owns persisted inactivity eligibility and timing. Public transport and
owner support render the server deadline: a concise warning after25 minutes
(guest) or23 hours(owner), explaining that a message keeps the chat active.
Clients never decide/write closure. Polling pauses while hidden/inactive, has one
in-flight request, bounded deadlines/backoff, and slows ended histories to30s.

GIVEN an automatic ending THEN show a clear localized reason and Resume chat
with history/draft retained; distinguish it from manually ended and resolved.
Resume is the themed primary48px action; starting another request is secondary
while Resume is available. Both web/native actions use Suqpage controls rather
than browser-default buttons. Manual endings retain a single primary new-request
action.
Staff see the inactivity reason in the existing history/detail view, and can
follow up or resolve. Closing a live session is not proof the job is complete.
GIVEN Resume succeeds THEN observe authoritative assignment/waiting/join state
under the same reference; show pending/error/retry and block duplicate commands.
Security/privacy and hidden/read-receipt behavior remain unchanged.
Focused tests use actual web/native components for deadlines, explicit resume,
failure-retained drafts, stale response fences, polling cadence/visibility and
no client-side close writes; actual local paired flows verify server wiring.


Mapped focused regressions: `scripts/test-chat-inactivity-ui.ts` and `scripts/test-support-thread-refresh.ts` execute real React/native-adapter renderers and React transitions. Actual local paired evidence is `.local/workflow-audit-s111/paired/verified.json`; settled web visual readiness uses `.local/workflow-audit-s111/web-ready/workflow-outcome.json`. These do not establish physical Android or production-mode release readiness.

## S108 — clear unlimited workload and authoritative assignment

GIVEN the staff workload screen THEN show open-chat counts and receives-new-chats
availability, with no cap input, cap progress or at-capacity filter. Explain that
new work goes to the eligible agent with the fewest open chats; equal loads rotate.
Pausing reception retains existing work. Matching queue and permissions stay.

GIVEN a saved assignee changes during thread refresh THEN the assignment selector
reflects the current saved assignee, including a paused current agent. Its saved
value remains a successful form control (never a disabled selected option that
submits no assignee); saving unchanged does not silently unassign it. Ordinary
refresh preserves an intentional
unsaved choice. Assignment and transcript header use one public reference.
GIVEN visitor recovery/refresh runs THEN show that reference and fence stale
requests so old assignment state cannot masquerade as a different case. Assignment,
agent joining, waiting and closed remain distinct on web and mobile.

Cross-layer BE-018 S108 controls routing/security. Focused component and real local
phone/desktop captures prove picker synchronization, delayed recovery, reference
agreement, >100 counts and no cap controls. New text is native-readable in all
five locales. Preserve pending S107 review; no hosted changes or release here.

## S48 — staff-reviewed showroom and product videos (in progress)

Owner requested this before the approved S43 publication. Normal page/product
saves may keep existing videos or the platform example, but cannot introduce an
unreviewed video. New offerings and new page headers use the current starter
example. Existing customer/demo videos are preserved, not bulk replaced.
GIVEN an owner requests a header/product video THEN accept an HTTPS source link
and optional note, bind a support ticket to the canonical business/target, and
keep current/example media public until review. The platform does not download or
upload videos; a supported YouTube video from any channel may be approved.
GIVEN the assigned support agent or manager reviews the ticket THEN approve a
normalized YouTube link by entering its URL and choosing Approve video, or
decline with a reply. Channel ownership and configuration are not prerequisites. Approval changes only that target's video, records
the reviewer and audit, and informs the owner in the existing support thread.
Product galleries keep photos/order and approved additional videos (maximum four);
the starter example is replaced on first approval. Header approval changes only
video fields in draft and current publication, preserving other saved/unpublished
content and respecting business suspension. Duplicate approval is harmless;
changed target videos, deleted targets, foreign owners, unrelated staff, wrong
targets and forged normal-save video refs fail closed. Staff make the approval decision; the platform does not claim automated
channel ownership verification.

L3 FE-019/BE-018/BE-032/BE-040/DEP-039. Add a server-only RLS-protected support
video request table at migration 58; private source URLs and reviewer details are
never public. Approval is manual, not an automated YouTube integration. URL input is validated and never fetched by the server. Reuse owner
support assignment/reply workflow and transaction boundaries. Master public media,
owner publishing, support workflow and schema statements are affected.

Ready: no new external provider, direct upload or arbitrary-video bypass; current
example stays the default. No official channel or channel configuration is
required: valid YouTube links from any channel are eligible for staff approval. Test forged writes, tenant/agent isolation,
replay/stale target, exact-field preservation and default media; then phone/desktop
workflow review and refreshed S43 release/migration/backup rehearsal gates. Retain
additive request data on rollback; never restore unrestricted owner video entry.

## S47 — buying history and staff resolution (in progress)

GIVEN a visitor ends buying chat THEN retain name, phone, original request, full
stored transcript, internal notes and assignment history. Closed unresolved cases
appear in Chat history; this does not mean the request was resolved. Assigned
staff and managers can call the retained number and save private follow-up notes
without reopening public messaging. Existing queue/tenant permissions apply.
GIVEN an assigned staff member or manager marks a request resolved THEN close any
active chat, release capacity once, record an audited resolution and show it in
Resolved. Repeated resolution is idempotent. Reopen clears resolution and uses
existing assignment/capacity checks. Unauthorized staff/owners cannot resolve or
read another request. Historical closed cases remain unresolved unless staff
explicitly resolve them; do not guess past outcomes.

GIVEN Buying assistance inbox THEN offer Active, Chat history and Resolved with
server pagination/search. Show the original intake excerpt before entering a case;
inside, show name, phone and original request even when recent-message history is
bounded. Ended chats remain read-only publicly. Staff can still add a private note
to closed cases, but cannot send a reply until reopening. Owner support unchanged.

Ready L2: no new provider, no additional intake fields or payments. Add nullable
resolved_at (migration 57) with closed-buying-only constraint; default null preserves
legacy records. Existing BE-018/FE-019 permissions, event audit and message visibility
are reused. Master sections 3/public shell/staff workflow are affected. Test PG
installation/idempotency, retention, grouping/pagination, private notes, duplicate
resolution, unauthorized access and reopen; capture staff phone/desktop before
visual approval and S43 release. Rollback retains additive column; new code
requires migration 57 before serving. No hosted migration in this UI iteration.

Focused evidence passes: support/security tests, native PG install/preservation,
local migration (68 businesses retained), authenticated staff actions and
phone/desktop screenshots, public phone conversation, typecheck/localization/spec
validation. See TRACEABILITY S47. Visual approval and full release gates pending.

## S46 — live entry label and waiting guidance (in progress)

GIVEN the expanded public launcher THEN Buying assistance remains its primary
name and Live chat appears immediately below it. The compact map-drawer control
retains both labels for assistive technology without covering search results.
GIVEN intake succeeds THEN show the saved conversation and a highlighted Waiting
for our team state until a public staff reply is present, even if auto-assigned.
Explain that replies appear automatically and the visitor can return in this
browser. Do not imply staff presence or promise a response time. A staff reply
replaces initial waiting guidance with the existing assignment state; Closed and
connection failures remain distinct. End chat remains reachable on small phones.

L1 UI change, no API/schema or session-lifetime changes. Ready: scope, wording,
privacy and existing FE-019/BE-018 contracts are resolved. Verify launcher label
order, intake-to-waiting-to-reply, five-language entry and desktop/phone layouts
using the existing capture scripts; typecheck/localization/spec checks precede
visual review. Master sections 3 and public shell need matching current wording.
S43 deployment depends on this review; rollback uses the previous UI.

## S45 — visitor End chat and stable service name (in progress)

GIVEN an active buying conversation THEN End chat is available separately from
the dialog dismiss X. WHEN used with that visitor's valid cookie and matching
public reference THEN close the case, release its assignment once, retain all
messages/private notes and record one visitor-ended event. Retry is idempotent.
GIVEN missing, foreign, expired or wrong-channel authority or a mismatched reference
THEN no case changes. Closed chats reject new messages and offer another request;
staff retain the existing audited reopen workflow. Failures preserve the visible
conversation and allow retry. Dismissing the dialog does not end the chat.

Keep Buying assistance as the primary launcher/dialog name; Live chat remains a
secondary mode label. No schema change. Reuse S42 same-origin/body/privacy guards
and the existing transactional close command. Test API isolation, duplicate end,
assignment release/history, browser end/reopen/new-chat and responsive controls.
Focused evidence: all five support suites and 320/390/1440 browser end/reopen,
lost-response and new-request checks pass. See TRACEABILITY S45–S46. Visual
approval and release gates remain prerequisites to authorized S43 deployment.

## S44 — clear, inviting buying chat (in progress)

GIVEN a visitor sees the buying entry THEN a chat icon and Buying assistance
label identify the conversation (S45 retains the service name; S46 adds Live chat beneath it); retain an accessible compact icon when the map
search drawer is open. The dialog says Live chat and Buying assistance.
GIVEN a new conversation THEN ask What can we help you with? above message-first
intake, with one sentence about buying, seller checks and quality. Name and phone
remain required; Start chat saves all three fields atomically through S42.
GIVEN a saved message THEN show Sent, never Read or a typing simulation. Chat connected
indicates recent successful API communication, not agent availability; failures
show the existing retry warning. Waiting/Assigned/Closed remain server-authoritative.
The request reference no longer dominates the chat header. Drafts, status,
permissions and retry behavior remain unchanged. No additional backend/schema or
service choice. Five languages, 320/390/1440 layouts, keyboard and outage/retry
checks precede the next visual/release gate. Master public-shell wording changes.

S44 entry evidence: `capture-buying-chat-entry.mjs` passes ten locale/width
states (five languages at 320/1440), English scoped accessibility, message-first
ordering, reachable controls and focus restoration. Screenshots:
`.local/buying-chat-entry-review/`. Existing real-handler conversation checks pass
at 320/390/1440 with Start chat/Sent; final translated-chat checks are tracked in
the active checklist. Typecheck, narrative and 1,125-message localization pass.
No backend/schema change. Deployment remains S43 after this visual prerequisite.


## S42 — live Buying assistance (in progress)

Supersedes callback-only S39 for buying_assistance only. General guest Help and
Transport remain retired. GIVEN a visitor submits name, phone and details THEN
persist the request and show a text conversation with Waiting, Assigned or Closed
status. Refresh visible open dialogs every five seconds, suspend hidden/closed
UI polling, retry with bounded backoff, and refresh on return. Assignment is not
online presence; never promise an immediate reply. Display failures, preserve
unsent drafts, and retry the same message idempotently. Closed requests are
read-only; staff reopening becomes visible on refresh. Same-browser HttpOnly
session recovery remains; cross-device recovery/push are outside this increment.

GIVEN staff open a buying case THEN offer explicit Reply or Internal note.
Historical staff messages and newly created notes remain private. Only explicit
text replies reach that visitor. Migration 56 adds a default-private visibility
flag; no historical message is reclassified. Attachments remain private and are
rejected for visitor-facing replies. Staff queue scope, capacity, assignment,
claim/reassign/close/reopen, owner support and audit remain authoritative.

GIVEN a forged, expired or wrong-channel session THEN no transcript or message
mutation is allowed. History stays bounded to the latest 100 visible messages.
Same-origin writes, spam limits and retry protection apply to replies. All
responses are private/no-store. Test privacy, legacy notes, cross-session/channel,
closed/reopened cases, idempotency, assignment, route guards and phone/desktop UI.

Ready: owner selected messages plus status. ADR-0023 records bounded polling and
Expo preparation; no hosted Realtime configuration or mobile rewrite here.
Rollout requires schema 56 before serving new code; retain additive column on
rollback. Focused security/PG/type tests and screenshots precede visual approval
and full/build/release gates. Master sections 3,4, public-shell and staff workflow
are affected; local verification is recorded below; hosted rollout remains pending.

S42 evidence: all five focused support suites pass; additional buying API checks
cover stale-tab reference binding, bounded/malformed bodies and private cache
headers. PostgreSQL install/idempotent preservation passes with schema 56. Local
migration preserved 68 businesses. Typecheck and 1,117-message localization checks
pass. Real-handler browser checks at 320/390/1440 prove visible replies, private
notes, hidden-dialog suspension, close/reopen, session recovery and another
request; final phone retry verifies a lost reply response does not duplicate it.
Screenshots: `.local/live-buying-review/`. Native preparation is documented, not
implemented. Full/build/release gates, visual approval, commit and deploy pending.

## Problem and outcome

Clients and public visitors need a simple place to ask Suqpage for help, and
team members need one clear queue that remains usable on phones and with many
conversations.

## S39 — owner-only live support (implemented and focused-tested locally)

GIVEN a public visitor on any public page THEN only Get buying help opens a
three-field callback form. Remove Ask for help, chat transcript, attachments,
reply/close-chat controls and polling from the public component. Buying receipts
and retries remain functional.

GIVEN a direct public API call WHEN the channel is Help, Transport, missing or
unknown THEN return a retired-entry response without preparing a session, reading
a transcript or creating work. Only the explicit buying channel may submit a
buying_assistance start, read its receipt or reset its token. Public message/close
commands and all public attachment reads are denied. A buying channel cannot
create a general-help case, even with forged category/cookies or an owner session.

GIVEN an authenticated business owner in Dashboard → Support THEN existing live
support, attachments, tenant isolation, staff assignment and replies continue.
Historical visitor conversations remain available to authorized staff; new staff
messages on those records are labeled private notes. No data deletion, automatic
closure or new migration is needed. No new guest chats can consume staff capacity.
Existing internal legacy domain helpers are not public API entry points.

Ready: bounded removal of public chat, existing buying and owner contracts retained.
Verify retired API bypasses, no writes, private files, buying receipt/retry and
owner/staff replies/attachments/isolation. Capture public desktop/phone and owner
support. Master sections 3/4 and support operations must reflect owner-only chat.
Full gates and deployment remain pending visual review.

S39 evidence: all five `npm run test:support` suites pass. Retired endpoints
return 410 without cookies/writes, forged buying categories cannot create Help,
public chat commands are denied, files return 404 and old records are preserved.
Owner tenant isolation, staff replies and authenticated private attachments pass
in `test-support.ts`. Typecheck, localization and specs pass. Browser checks prove
one public launcher on Market/Featured/About/showroom; owner support/attachment
controls at 390/1440; buying receipt/recovery at 320/390/1440; fifteen localized
forms without overflow. Evidence `.local/owner-only-support-review/` and
`.local/buying-assistance-review/`. Full/release gates, visual approval, commit and
deployment pending. Old capture commands delegate to the current buying workflow.

## S38 — one Buying assistance request (implemented and focused-tested locally)

The owner's simplification supersedes S37's required service choices. GIVEN a
visitor opens Buying assistance THEN show only Name, Phone and Request details;
no service radios, selector or claim that these are separate services. The short
existing description can describe the help available. Submission, receipt,
retry recovery and staff assignment/private notes remain unchanged.

GIVEN a request omits service WHEN submitted THEN persist one general Buying
assistance case with no service classification. Additive migration 55 permits
null buying_service on buying cases and preserves old classified records. Older
clients may retain valid optional service values for replay compatibility; invalid
values remain rejected. Staff use the Buying assistance subject for new requests.
Test generic intake, unchanged retry, modified-details rejection, staff workflow,
legacy compatibility and no-choice mobile form. Master section 3 and the support
procedure must describe the three-field form. No hosted writes or new integration.
Visual approval and release gates remain pending.

S38 evidence: `test-buying-assistance.ts` passes generic intake, optional legacy
values, validation, replay, privacy and staff workflow checks. Typecheck,
localization and spec validation pass. `capture-buying-assistance.ts` verifies
no service controls, persisted requests, receipt recovery and another request at
320/390/1440. Schema 55 applied locally while preserving 68 businesses. Screenshot
evidence: `.local/buying-assistance-review/intake-390.png`. Full gates, visual
approval, commit and deployment remain pending.

## S37 — Buying assistance (implemented and focused-tested locally)

Supersedes public transport intake. GIVEN a visitor chooses Get buying help THEN
open Buying assistance with one required choice: Buy for me, Check a business,
or Check product quality; require name, phone and a short description. No email,
route, checkout or live chat is required. Submit shows Request received and phone
follow-up. Send another request preserves previous staff cases and Help sessions.

GIVEN any of the three choices WHEN submitted THEN persist its validated kind and
bounded description atomically, route into Buying assistance, and preserve existing
assignment, workload, claim, reassignment, notes, close/reopen and audit behavior.
Retries cannot duplicate requests or silently change the service kind. Help-only
staff cannot claim buying cases. Visitor responses never expose internal notes,
attachments or assigned-person names; public reply/close attempts are denied.

Additive migration 54 adds buying_assistance and a constrained service kind.
Historical transport rows, handoffs and tokens remain readable; old queue scope
transport is an internal compatibility identifier for the Buying assistance team.
New public requests use an independent buying channel/cookie. Staff still see old
transport cases correctly labeled; never reclassify their routes as buying data.
Legacy API transport intake remains compatible, without a public transport button.
No automated purchase, payment, inspection certification or seller endorsement is
claimed. The team handles follow-up manually. Five-language labels and phone/
desktop layouts apply. Master sections 3/4 and support/assistance statements are
affected. Focused PG/API permission, replay, privacy and UI tests precede owner
visual approval and release gates. Rollback retains additive data and deploys a
compatible prior UI; do not drop requests or narrow category constraints.

S37 evidence: all five `npm run test:support` suites pass, including the new
`test-buying-assistance.ts` coverage for every service choice, database constraints,
changed-kind replay denial, independent channels, private notes, callback-only
reads and scoped assignment/capacity/claim/close/reopen/reassignment. Native
PostgreSQL fresh install and idempotent preservation pass at schema 54. Local
migration preserved 68 existing businesses. `capture-buying-assistance.ts` passes
real-handler intake/receipt/lost-response/no-poll/another-request checks at
320/390/1440 in disposable schemas. Real authenticated staff actions pass; temporary
accounts/cases were removed. Fifteen five-language/viewport states have reachable
submission controls and no overflow/browser errors. Typecheck, localization and
spec validation pass. Screenshots/receipts: `.local/buying-assistance-review/`.
Terms copy now describes manual buying assistance without implying a completed
purchase or seller certification. Owner visual approval, full gates, commit and
production rollout remain pending.

## S35 — transport callback request (focused local verification complete)

The owner's correction supersedes S34's transport chat behavior; Help remains chat.
GIVEN a visitor submits From, To, Name and Phone WHEN the request is persisted
THEN show Request received, phone follow-up and Request another route. Do not show
a transcript, agent presence, reply/attachment controls, End chat or live polling.
Closing/reopening/reloading recovers the receipt, including after a lost response.
Request another route clears only that transport session and route fields; the
previous request remains assigned/open for staff and Help is untouched.

GIVEN transport staff manage a request THEN existing assignment, capacity,
close/reopen, reassignment and private company handoff continue. Staff messages
are internal request notes, not replies delivered to the visitor. The visitor API
returns only receipt metadata for transport; notes/attachments/assigned-person
names stay private. Public transport reply and close attempts are rejected even
through the legacy endpoint; duplicate intake retries remain idempotent. No new
schema or notification provider is needed; historical transport rows are retained.

Ready: four-field contract, callback copy and reuse of existing staff queue are
explicit. Verify API isolation/privacy and no public mutations, real persisted
intake/retry/another-route, five-language mobile receipt and unchanged Help chat.
Master sections 3/4, public shell and staff workflows must reflect the correction.
Focused evidence precedes owner visual approval and release gates.

## S34 — separate visitor channels and staff queues (S35 supersedes transport chat)

GIVEN a visitor WHEN choosing Ask for help or Request transport outside the dialog
THEN only that channel opens; there is no in-chat type switch. Each channel retains
its own opaque HttpOnly session and draft, including when the other has an open or
closed conversation. Refresh, attachments, replies, close and start-another affect
only the selected channel. Legacy sessions remain recoverable in their matching
channel; wrong-channel tokens/categories are rejected, never shown or mutated.

GIVEN enabled staff assigned Support, Transport or Both queues WHEN requests arrive
THEN automatic assignment respects that scope and the existing workload limit.
Concurrent assignment/claim/reassign/reopen cannot exceed capacity or assign one
request twice. Unassigned requests remain in their queue until claimed or assigned.
Managers can manage both queues and staff settings; team members see eligible
waiting work and their own assigned history, not other staff's private cases.
Assigned transport staff can record private company handoffs; unassigned staff and
clients cannot. Replies, close, reopen, reassignment and assignment history work for
both queues; closed cases must be reopened before changing their assignment.

No provider accounts, booking integration, email sending, recovery-code feature or
unverified online-staff badge is added. References guide the layout, not new claims.
Transport intake remains From, To, Name and Phone; help retains email, phone and
message. All five interface languages, mobile controls and keyboard access apply.
At 320px, staff assignment selectors and action buttons remain inside the viewport,
including long agent names; reassignment requires no horizontal scrolling.

Ready: existing support ports/roles reused; additive migration 53 adds queue scope
(default Both preserves existing staff). Tests cover separate API cookies/replay/
attachments and staff permissions, capacity concurrency, handoff privacy and UI
intake/queues. Focused local verification precedes visual approval and release.
Roll back UI independently; retain additive scope data and all conversations.

## S32 — transport requests (retained; S34 extends staff access and entry controls)

GIVEN a visitor selects Transport arrangements WHEN they enter Name, Phone,
From and To THEN Request transport saves one token-scoped conversation without
requiring email, a message or an attachment. The first message summarizes the
route; the visitor receives a callback receipt, while staff record private notes. Whitespace-only or overlong
name/place values and invalid phones fail before persistence. Unchanged retries
reuse the prepared cookie and key; changed contact/name/route cannot replay.

GIVEN an administrator or operations manager opens Support WHEN they select
Transport requests THEN existing and new shipment_observation conversations
appear in a dedicated server-paginated list with search and status filters.
Clients cannot select that cross-tenant queue. Staff retain existing scoped
conversation permissions; S34 permits managers and the assigned transport team
member to record company handoffs.

GIVEN an authorized manager or assigned transport team member opens a transport conversation WHEN they record
a company and contact THEN a private, actor-stamped handoff event is stored.
They can copy the request to contact a logistics, transport or parcel company
manually; saving is not a claim that a booking or delivery occurred. Concurrent
changes are rejected, identical retries are safe, closed requests must be
reopened, and general support conversations cannot receive a transport handoff.
Private company/contact events never appear in the visitor transcript.

Migration 51 retains all support rows, permits email-free transport contacts,
adds nullable origin/destination for legacy compatibility and extends the
support event constraint for manual handoffs. General support still requires
email and phone. No new provider or credential. Rollback leaves additive data
in place; legacy app must not be used to edit email-free transport rows.

Tests: scripts/test-transport-support.ts (PostgreSQL validation, persistence,
pagination, tenant and role denial, replay/concurrency/privacy); focused browser
capture of public intake and admin routing on desktop/phone. New UI labels use
the existing localization dictionaries; user-entered names/places remain verbatim.

## Scope

### Retry completion — 2026-09-23

GIVEN a support response is lost after persistence WHEN the visitor retries the
unchanged draft THEN the same submission key is reused and only one message/chat
exists. Editing the draft creates a new attempt; confirmed success clears it.
Opening support prepares the anonymous HttpOnly session before Send is enabled;
failed session loading offers Retry. An existing conversation is recovered before
a new reply is sent. No automatic user-message retry or new UI explanation.

Focused browser failure injection plus real PostgreSQL replay/isolation tests
must cover opening and replying. First-message retries use the prepared opaque
cookie, never contact data or an idempotency key as access authority.

### In scope

- Client conversation list, new-conversation form, message thread, and reopen.
- Staff waiting/open/closed tabs, paginated search, claim/reassign, reply, close,
  and reopen controls.
- Operations workload summary with per-agent enablement and assignment limits.
- Clear assignment, unread, queue, and capacity states.
- Responsive single-column thread on phones and compact queue/thread workspace
  on wider screens.
- A public live-chat launcher that creates a privacy-preserving anonymous visitor
  session without creating a Suqpage account.
- Required email and phone fields on the first general-help message so authorized
  support staff can continue the conversation if the browser session disconnects.
- A visitor-visible **End chat** action that closes the authoritative support
  conversation, releases any active assignment, stops polling, and preserves
  the closed transcript without confusing it with the drawer's hide control.
- A closed transcript remains readable until the visitor chooses **Start another
  chat**. That action removes only the browser's opaque conversation token; it
  does not reopen, delete, or rewrite the retained staff conversation.
- External **Ask for help** and **Request transport** buttons, each opening its
  fixed channel. Historical conversations retain their original categories.
- Clear copy that buying, negotiation, payment, and product questions stay
  between buyer and listed operation. Suqpage may help connect the buyer with
  a transport option but does not book, operate, or guarantee delivery.
- One optional private attachment per message for visitors, clients, and staff:
  sanitized JPEG, PNG, or WebP images, or a verified PDF document up to 5 MB.
  Image messages show a bounded preview; PDFs show a filename, type, and size
  with an authorized download action.

### Non-goals

- Multiple attachments in one message, SVG/Office/archive/executable uploads,
  typing indicators, bot-generated advice, provider-hosted chat, or claims that
  Suqpage has completed an inspection before staff record it.

## Scenarios

```gherkin
Scenario: Client starts support from a phone
  GIVEN an authenticated client
  WHEN they enter a subject and message
  THEN the new conversation appears with waiting status
  AND its thread remains readable without horizontal scrolling

Scenario: Staff claims and closes a conversation
  GIVEN a waiting conversation and available staff capacity
  WHEN a team member claims, replies, and closes it
  THEN the client sees the reply and closed state
  AND the team member regains one assignment slot

Scenario: Anonymous visitor asks Suqpage for assistance
  GIVEN a public visitor has not signed in
  WHEN they open chat, provide a valid email and phone number, choose an assistance category, and send a bounded message
  THEN the conversation enters the same staff waiting or assignment queue
  AND a secure anonymous browser session can poll and reply only to that conversation
  AND the authorized staff thread exposes the saved contact values for follow-up
  AND no Suqpage account or public business record is created

Scenario: Anonymous visitor omits reconnect details
  GIVEN a public visitor starts a new support conversation
  WHEN email or phone is missing or invalid
  THEN the form and server reject creation with a field-relevant error
  AND no support conversation or message is created

Scenario: Visitor continues browsing independently
  GIVEN the public chat explains optional Suqpage assistance and has an active conversation
  WHEN the visitor chooses End chat and confirms the action
  THEN the token-owned conversation closes idempotently
  AND its active staff assignment is released
  AND the closed transcript remains readable while replies and polling stop
  AND marketplace browsing and direct page inquiry remain available
  AND no inspection, sourcing, negotiation, certification, or delivery guarantee is implied

Scenario: Visitor reports a listing
  GIVEN a visitor sees a concern on an Suqpage page
  WHEN they choose Ask for help and send the details
  THEN the report enters the support queue with reconnect contact details
  AND the interface does not claim the report has already been verified or resolved

Scenario: Visitor starts a separate conversation after closing one
  GIVEN a visitor has ended a support conversation and can still read its transcript
  WHEN the visitor chooses Start another chat
  THEN the browser token for the closed conversation is removed
  AND the new-conversation contact form is shown
  AND the retained staff conversation and transcript are not deleted or reopened

Scenario: Participant shares an image or document
  GIVEN a visitor, client, or authorized staff participant can reply to an open conversation
  WHEN they send bounded message text with one valid image or PDF attachment
  THEN the message and attachment appear together in the thread
  AND images use a bounded responsive preview
  AND PDFs expose an authorized download without embedding private bytes in public markup

Scenario: Attachment cannot be admitted
  GIVEN a participant selects an unsupported, deceptive, or oversized file
  WHEN they send the message
  THEN no message or attachment row is committed
  AND any staged private object is removed
  AND the composer retains a clear retryable error
```

## Quality impact

- Security and tenant isolation: UI projections contain only authorized data.
- Privacy and data retention: contact values, support bodies, and attachments
  remain private support data and never appear in browser notifications or
  unauthenticated public markup.
- Accessibility and responsive behavior: labeled forms, status text, 44px mobile
  controls, focus-safe errors, and bounded message regions. On phones the
  launcher contains visible **Ask for help** and **Request transport** labels with
  matching icons, each opening its own dialog. It
  remains persistent in the Market and Featured workspaces; on the scrolling
  About narrative it is anchored in the opening visual and scrolls away instead
  of covering headings or body copy.
- Performance and limits: paginated lists and incremental five-second polling
  only while a thread is open and the browser document is visible; anonymous
  creation and replies are rate limited.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Client create/read/reply | browser | `tests/acceptance/app.spec.ts` |
| Staff queue/claim/reply/close | integration/browser | `scripts/test-support.ts`, `tests/acceptance/app.spec.ts` |
| Anonymous start with contact validation, poll/reply/end, and truthful assistance copy | security/browser | `scripts/test-support.ts`, focused public-shell browser evidence |
| Image/PDF admission, cleanup, participant-scoped reads, and responsive rendering | security/integration/browser | `scripts/test-support.ts`, `scripts/test-media-storage.ts`, focused support browser evidence |
| Phone fit and labels | browser | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

The authenticated inbox remains role-aware. The public drawer loads only when
opened, polls only while its active thread is visible, and can be hidden during
rollback without deleting conversations. Neither workflow depends on Telegram
configuration.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Evidence: verified locally on 2026-07-30.

The client inbox/thread, staff queue/thread, five-second open-thread refresh,
operations workload controls, role-aware navigation, and responsive styles are
implemented. `scripts/test-support.ts` proves claim, reply, close, reopen,
reassign, queue, and capacity behavior. Ordered browser acceptance proves a
client can create a waiting conversation at 390px without page overflow and an
operations manager can inspect the waiting queue and workload controls.
`npm run check` and `npm run release` passed on 2026-07-30.

Focused local evidence and remaining gates: [2026-09-23 workflow audit](../../docs/SUQPAGE-DEMO-WORKFLOW-AUDIT-2026-09-23.md), mapped in TRACEABILITY.md.

S32 local evidence: `npm run test:support`, typecheck, spec validation and
localization tests pass. `scripts/capture-transport-support.ts` verifies actual
UI/API/persistence at 1440/390/320; existing browser retry checks pass. Local
admin browser checks verify queue filtering, company-save server action,
idempotent repeat saves, copy feedback and phone overflow. Captures and admin
check are protected in `.local/transport-support-review/`; temporary fixture
removed. Migration 51 applied locally. Visual approval, build/full gates, commit
and production rollout remain pending. No messages sent to outside contacts.

## S34 evidence — 2026-09-24

`npm run test:support` passes all four suites, including the new
`scripts/test-support-channels.ts`: separate cookies, legacy recovery, retries,
wrong-channel and private-attachment denial, queue scope, staff replies, private
handoffs, assignment history, close/reopen, reassignment and concurrent capacity.
Local additive migration 53 applied successfully. Existing retry and transport
browser suites pass; `scripts/capture-support-channels.ts` passes seven states
(English desktop/phone plus all five locales at 320px) against real API handlers
and isolated PostgreSQL. UI API interception bridges to those handlers; it does
not substitute canned successful responses.

Real local admin/team browser actions pass enable/scope/limit settings, both
queues' claim/reply flows, company-save, close/reopen and reassignment; captures
cover 1440/390/320px, including the corrected mobile Assign control. Temporary
accounts/cases were removed, with no email sent. Protected receipts/screenshots:
`.local/support-channels-review/`. Typecheck, seven localization tests, narrative
checks and 161-spec validation pass. Owner visual approval, full/release/acceptance
gates, commit and production rollout remain pending; no production-ready claim.
Staff procedure: `docs/operations/SUPPORT-AND-TRANSPORT.md`.

## S35 focused evidence — 2026-09-24

All four focused support suites pass after separating Help chat fixtures from
transport requests. Transport tests prove receipt-only projection, private staff
notes/attachment denial, blocked visitor reply/close, retry safety, assignment,
manual handoff and preservation of earlier requests when starting another route.
A test attachment initially violated the existing storage-key length constraint;
its fixture was corrected to a valid key without changing the production constraint.

`scripts/capture-transport-support.ts` passes at 1440/390/320: four fields,
receipt without composer/transcript/End chat, no polling, lost-response recovery,
another route and refresh. `scripts/capture-support-channels.ts` passes seven
viewport/language cases including all five languages at 320px and separate Help
history. `scripts/capture-support-retries.ts` still passes Help load/reply/retry,
close and new-chat flows. These use real API handlers with isolated PostgreSQL;
transport notes never appear in the visitor response. Desktop/phone receipt
captures were inspected locally. Typecheck, seven localization tests, narrative,
161-spec validation and whitespace checks pass. No new migration is required.
Visual approval, full/release gates, commit and deployment remain pending.

Real local admin/team browser verification also passes queue settings, claim,
Help reply, private transport note, company handoff, assignment history,
close/reopen and reassignment at desktop/phone widths. The browser harness now
waits for the settings-save redirect before advancing, eliminating a navigation
race. Temporary accounts and requests were removed; no email was sent. Receipt:
`.local/support-channels-review/staff-verified.json`.

S42 staff browser evidence: `scripts/capture-live-buying-staff.ts` used a temporary
local Supabase Auth staff identity and case. Actual server-action Reply/Internal
note submissions pass with visitor privacy checks and 390/1440 screenshots;
fixtures were removed. `.local/live-buying-review/staff-*.png`.

S48 local evidence: `scripts/test-video-requests.ts`,
`scripts/test-business-starters.ts`, `scripts/test-owner-page-postgres.ts`,
`scripts/capture-video-requests.ts` pass; see S48 in TRACEABILITY.md. Real forms
cover submission, invalid-link recovery, assignment, approval without channel configuration,
decline/reply and preserved default at phone/desktop widths. Schema 58 is local
only. Visual approval and refreshed release/acceptance/operations gates are pending.

## S57 transport and delivery assistance — in progress, 2026-10-05

Master §3/§4/§5/§19 support and mobile statements affected. This supersedes the
receipt-only transport entry and public buying-assistance entry. Suqpage retains
its own visual design. GIVEN a visitor WHEN providing pickup, destination, name
and phone THEN create a transport conversation and show live messages/status.
Optional goods details aid dispatch. Staff arrange carriers externally; there is
no driver/provider account, booking guarantee, payment or commission ledger.
GIVEN the transport queue WHEN staffed THEN existing least-loaded capacity and
scope rules assign only eligible agents; managers can assign/reassign and staff
can claim, explicitly reply, save private carrier contact and add internal notes.
GIVEN historical notes or handoffs THEN never expose them to visitors; only
visitor messages and explicitly visitor-visible staff replies are public.
GIVEN ended chats THEN preserve contact/history for phone follow-up; distinguish
ended from staff-resolved, retain reopen and private notes. Token/category scope,
expiry, rate limits, idempotency, text bounds and attachment denial remain enforced.
Old buying conversations and their API remain compatible, with no new public
buying entry. Reuse shipment_observation records/transport queue and existing
origin/destination/resolution/visibility columns. Migration 59 extends the existing
closed-only resolution constraint to transport as well as buying, without touching
history. Apply before rolling out this code; rollback retains the additive schema.
English, Amharic, Afaan Oromo, Somali and Tigrinya copy is authored for the actual
UI purpose; user content remains unchanged. Focused support/transport/channel
security tests, mobile API tests and phone/desktop UI review are required.

S57 focused evidence (local): search suites and test-multiple-locations.ts pass
multi-region/city union, overlap deduplication, exact/fuzzy pagination, category/
query intersections, legacy and repeated URL parameters. Support suites plus
test-live-transport.ts pass both APIs, token/queue/tenant isolation, assignment
capacity, retry, private notes/carrier data, chat ending/resolution/reopen, and
bounds. Migration 59 is applied locally only. capture-multiple-locations.mjs
records seven web and six native-browser states; capture-live-transport.ts,
capture-transport-dispatch-staff.ts and capture-mobile-transport.ts exercise real
handlers and staff server actions at desktop/phone sizes. Temporary staff fixtures
are removed; controlled map tiles and isolated API fixtures are documented in
scripts. Evidence: .local/multiple-location-review/ and .local/live-transport-review/.
Both typechecks and localization checks pass. Owner visual/native-speaker review,
physical device tests, build/full release gates and deployment remain pending.

## S58 paired transport intake — locally verified and visually approved; rollout pending, 2026-10-05

Owner correction to S57: the intake must not become a tall single-column list.
GIVEN desktop or phone (including 320px) WHEN opening transport intake THEN pickup
and destination share a highlighted route card with two columns; name and phone
share the next row. Optional goods details follow the required fields. Suqpage
orange/white, existing buttons, live-chat name and API contract remain unchanged.
Every field retains a programmatic label, 44px minimum input height and logical
keyboard order. Long localized labels wrap; input values scroll instead of forcing
horizontal overflow. Short/keyboard viewports remain scrollable to Start chat.
Master §3 support intake description and §19 responsive behavior are affected.
Verify desktop/phone geometry and actual submission; capture five locales before
owner visual approval. No persistence, dispatcher or permission changes.

S58 local evidence: both typechecks and eight localization tests pass.
`capture-transport-intake-layout.mjs` verifies 13 web/Expo-browser states across
five languages at 1440/390/320px, including paired input geometry, 44px targets,
required-field clearing/enabling, translated headings/placeholders, overflow and
reachable submission. `--short` adds two 390x480 viewport checks.
`capture-live-transport.ts --phone-only` and `capture-mobile-transport.ts` pass
real-handler chat submission/reply/end scenarios with isolated PostgreSQL data.
Screenshots: `.local/transport-intake-layout/`; lifecycle: `.local/live-transport-review/`.
Wrapped native labels align to the input baseline; the web launcher waits for its
portal to mount. Owner visual review, physical-device keyboard checks, human
language approval and full/release gates remain pending. No deployment or commit.

S59 release narrative regression uses the S57 Transport & delivery label and
rejects the retired Buying assistance visitor label. It retains Live chat/Start
chat assertions and does not change historical staff records or APIs.

S59: owner approved the S58 layout and authorized coordinated web/mobile release
on 2026-10-05. Release checks are now authorized; deployment/device evidence
remains separate from that approval.
The existing staff browser regression (historical script name
`capture-live-buying-staff.ts`) now enters the public transport route/name/phone
form and uses its transport cookie. The same real staff reply/private-note, End
chat, retained contact/history, resolved and reopen checks remain required.


## S71 — purchased-goods transport invitation

Ready, L1 display-only change. Visitors need to recognize that the existing
service helps arrange transport after finding a product or agreeing with a
seller, through live messages. No booking promise, pricing, service/backend
rename, account requirement or staff-workflow change. Master §§3/5/11/15 affected.

GIVEN the public web/native launcher WHEN displayed THEN it names help
transporting purchases and shows a separate Live Chat sublabel. In non-English
locales show natural local chat wording with literal (Live Chat). Compact map
mode preserves the same accessible service/chat label without blocking results.
GIVEN a visitor opens the intake THEN a concise heading acknowledges finding
a desired product and needing delivery; supporting copy invites chatting with
our team to find transport and arrange details. Route/contact pairs, validation,
restored conversation, End chat and staff assignment/history remain unchanged.
GIVEN a narrow viewport or long localized text THEN the launcher wraps within
the screen, the intake scrolls and Start chat remains reachable. No other app
colors or transport status/availability claims change.

Tests: shared catalog/localization and narrative regressions; existing paired
transport intake capture updated for the new copy; focused launcher/accessibility
and 320/390/1440 screenshots in all five locales, plus Expo phone and short-height
states. Real existing handlers stay wired; this copy-only change sends no
production requests. Owner visual approval precedes full/release gates.

S71 focused local evidence: both typechecks, nine locale regressions, narrative
and paired-intake desktop/phone/five-language/short-height captures pass. Shared
Live Chat labels and purchased-goods invitation are present in actual web/Expo
screens. No request/OTP sent; staff/backend unchanged. New entry/toggle capture:
scripts/capture-purchase-chat-and-products.mjs. Evidence in TRACEABILITY S71/S72;
owner visual/full/release/commit/rollout remain pending.

S71 owner review correction (2026-10-07): replace the long primary launcher copy
with short Delivery help and a compact descriptive sublabel, Live Chat · For your
purchases. Native wording can order those ideas naturally; retain local live-chat
wording plus (Live Chat). The two lines must remain inside narrow screens and
compact map mode keeps the complete accessible label. Only the launcher changes;
intake and conversation behavior are preserved. Focused entry captures/types/
locale tests precede renewed visual review; no new release is implied.

## S84 — transport for purchases from Suqpage businesses

Ready, L1 customer-facing copy refinement. The owner's newest service narrative
is: buy from a business on Suqpage and let our team arrange getting the purchase
to you. Use transport in the button/chat rather than delivery (which suggests
last-mile service); do not discuss distances or a route/mode breakdown. Sell that
outcome in the launcher/intake, not commissions, brokerage,
transport modes or internal coordination. Supersedes S71's current launcher copy.

GIVEN the web/native entry WHEN displayed THEN a short transport action title and
separate Live Chat sublabel explain the service. GIVEN the chat intake WHEN opened
THEN the headline and supporting copy connect a purchase from a Suqpage business
to arranging transport to the customer. Natural authored wording in English,
Amharic, Afaan Oromo, Somali and Tigrinya; preserve (Live Chat) where helpful.
Do not imply platform checkout, confirmed booking, coverage/time guarantees or
online staff presence. Existing colors, paired intake, endpoints, roles,
assignment, waiting/End chat/history and validation stay unchanged.

Tests: shared-copy/locale/narrative checks, both typechecks and existing focused
entry/paired-intake phone/desktop/five-locale/short-height captures. Compact map
mode retains the full accessible label; controls wrap and Start chat is reachable.
No request is submitted by visual checks. Visual approval before full/release
gates; preserve prior task and rollout boundaries. Master §§3/5/19/22 affected.

## S90 — clear transport invitation

Ready, L1. The owner corrected the requested primary label to Need help with
transport? Follow it, in smaller print, with Let us handle it. Chat with our
transport agents live. The intake introduction also invites the customer to chat
with the transport team about getting their purchase to them. This supersedes
the earlier three-line proposal and refines S84's purchase-focused copy; every
intake field and BE-018 conversation/permission contract remains unchanged.

GIVEN the expanded web or native launcher WHEN displayed THEN show the question,
reassurance and invitation to live transport-agent chat in that order, with a
primary heading and a smaller supporting sentence that wraps naturally.
All five languages use contextual local wording; non-English chat
labels retain (Live Chat). GIVEN narrow screens or an open Market drawer THEN
the entry stays inside the viewport, preserves a 44px tap target and an accessible
name containing the complete copy; the compact icon does not cover result controls.
WHEN pressed THEN open the existing transport intake, without creating a request
until the visitor submits it. No online-presence or immediate-reply promise.
GIVEN the intake introduction THEN identify purchases from businesses on Suqpage,
invite conversation with the transport team and explain help getting the goods
to the customer. Local wording must communicate this intent plainly, with natural
sentence structure and readable wrapping rather than literal English word order.

Use shared transport copy and existing components/styles; no dependency, backend,
schema, palette or staff-role change. Verify both typechecks, catalog/narrative
checks and read-only web/Expo captures at 1440/390/320px in all five languages.
Capture launcher and updated intake copy, including a short phone viewport; no chat
is submitted. Rollback is the previous launcher copy/styles. Master §§3/18/19/22
and FE-030/FE-049/FE-053 are affected. Renewed explicit visual approval precedes
the pending full/release/commit/web-and-Android rollout gates.

S90 final focused evidence: both typechecks, nine localization tests, narrative/
homepage and 180-spec validation pass. capture-purchase-chat-and-products.mjs
passes 13 web/Expo states (all five languages, 1440/390/320px) with loaded actual
maps, prominent heading/smaller supporting copy, complete compact labels and the
new team-chat introduction. Start chat remains reachable in every locale;
intake routing, query/filter scope and form contracts remain unchanged.
capture-transport-intake-layout.mjs --short passes both clients at 390×480.
No request submitted; current screenshots/verification are protected under
.local/transport-invitation-review/final/. Owner visual/full gates/rollout pending.

S94 / FE-026: queue navigation uses separate Business support/Transport entries
and actual-case context, with safe browser replacement for canonical/denied links. Canonicalize the query
from the current principal before listing data; denied cases render no private
content and include a permitted inbox fallback link before browser replacement.
Inbox-origin queue/status/q/page is canonical, bounded
and carried through every case form/action; breadcrumb/back preserve that list.
A direct case/alert chooses its actual queue and sensible status fallback. Scoped
agents are pinned to their permitted queue; URLs are navigation state, never
permission authority. No support domain/assignment/history semantics change.


## S104 live workflow verification and closed-thread updates

GIVEN authenticated owner support or guest transport WHEN intake succeeds THEN
existing live messages/status, correct scoped queue, assignment/claim, explicit
public replies, private notes, truthful join/read events, end/history/resolution
and reopen remain functional without manual refresh. General guest support stays
closed. Staff management remains web-only. GIVEN a closed owner support thread
WHEN staff reopens it THEN its visible owner browser receives that state
automatically; use a slower bounded refresh for closed threads, suspend hidden
tabs and reconcile on return. Do not fabricate current agent availability.
Actual local visitor/owner/agent exchanges, privacy and negative permission
checks supplement isolated tests. Label test records and remove only those
records; no customer chats, external notifications or hosted tests are authorized.
BE-018/BE-050/FE-062 govern server authority and read receipts.

S104 focused local evidence passes in TRACEABILITY: actual role/navigation and
combined support/transport HTTP workflows plus desktop/phone/five-language
captures. Visual approval, full gates, scoped commit and rollout remain pending.


## S114 owner transport — locally verified, visual/full gates pending

GIVEN a linked business owner WHEN opening Account → Transport chat THEN open the
same paired From/To and Name/Phone transport intake and live conversation as the
visitor flow, within the owner workspace and with Back to account. Keep technical
Support separate. Prefill editable contact name and saved business phone only
inside this authenticated destination; leave route empty and never overwrite typed
drafts or recovered conversations. Owner-specific introduction explains transport
for customers/business stock naturally in all five languages; UI styling stays
Suqpage's current design. No guest conversation is silently adopted.

GIVEN an active account-owned transport case THEN recover it across sessions/devices
through owner authorization; provide a clear Chat history destination and explicit
new-request action, without an extra menu before the first intake. Selecting a
history case opens its exact reference. Maintain waiting/assignment/join, message,
read, loading/error/retry, end, automatic-end/resume and resolution distinctions.
Owner history and staff transport queue refer to the same canonical case. No
private staff notes/carrier details are visible to owners. Transport remains
text-only; technical support retains its attachment behavior.

All controls fit desktop/320/390/short and five languages, with 48px touch actions,
keyboard/focus, bounded polling, hidden-screen pause and failure-retained drafts.
API/persistence/security follow BE-018 S114; FE-053/FE-056 share account placement.
Focused component and actual local paired owner/staff tests precede visual
approval/full gates. Visitor transport behavior and owner technical support remain.

GIVEN the visitor dialog is dismissed and immediately reopened WHEN its earlier
native close event arrives THEN preserve the new open intent and fresh-session
loading state; never close the newly opened chat or display stale assignment.
Ordinary Close/Cancel still dismiss the dialog and retain unsent intake fields.

S114 focused mappings: `scripts/test-owner-transport-workspace.ts` (actual React
intake/retry/key/unmount and server authorization/history/legacy redirect/staff
summary), `scripts/test-chat-assignment-state.ts` (shared stale recovery and rapid
reopen), and `scripts/test-mobile-owner-transport.ts` (native authority/lifecycle).


S142 actual-review correction: a bounded transcript viewport must not stretch a
short message bubble to fill its height. Message bubbles fit their own contents;
remaining room belongs to the transcript background. GIVEN one short message
WHEN desktop or phone staff chat loads THEN the bubble retains natural text
height AND the transcript keeps its bounded useful viewing area. Cover real CSS
with a focused geometry regression and recapture retained labelled app cases;
no duplicate test conversation or chat-state change is needed for this correction.
