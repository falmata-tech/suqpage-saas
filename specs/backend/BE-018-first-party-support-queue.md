---
id: BE-018
title: First-party customer support queue
status: in_progress
related: [BE-046, BE-044, ADR-0023, FE-019, FE-026, BE-002, BE-015, BE-023, BE-024, BE-026, BE-030, DEP-015, DEP-026, ADR-0009, ADR-0012, ADR-0014, BE-032, BE-040, BE-042, DEP-039, BE-050]
owners: [backend, security, customer-support]
last_updated: 2026-10-07
change_level: L3
---

# BE-018 - First-party customer support queue

## S87/S88 — real workflow audit and scoped agent creation

The owner requests actual local HTTP/browser conversations on web and mobile,
not mocked/route-fulfilled replies. Use labelled disposable owner/guest/staff
records; do not modify customer cases or send external notifications. Cover both
owner support and guest transport: intake, queue, assignment/claim/reassignment,
capacity, both-way replies, visibility, retries, close/reopen, history/resolution,
retained contacts/intake, private notes/handoff and permission negatives. Existing
isolated PostgreSQL/domain suites supplement but do not replace real UI evidence.

GIVEN reassignment removes an agent's case access WHEN its open case refreshes
THEN return to its authorized inbox with a generic unavailable notice; do not
render a server error or disclose case data. The same response covers absent and
unauthorized case IDs. Capacity rejection keeps the waiting case unassigned.

FE-026 S88 creates only Support/Transport agent functions using existing scoped
team-member settings and fresh principal projection. Successful assignment changes
display confirmation after server completion; rejected capacity/queue changes
preserve the saved assignment. New agents start enabled
with capacity three and exactly their selected queue. Operator/all-scope forgery
is rejected at creation. Scope changes cannot strand incompatible active cases
or silently grant business/product access. Existing assignments and history stay
authoritative. Main admin/account setup applies to both local and hosted; the
owner limits the real chat audit itself to local previews. Provider/Auth config
and hosted conversation testing are outside this audit.

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

Clients need free in-app support and Suqpage team members need a shared queue
without adopting a costly per-agent SaaS or operating a second large support
platform.

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

The public GET adapter prepares a random HttpOnly session cookie when none is
present. Starting a chat may reuse that opaque token; its existing unique hash
identifies one conversation. Serialize concurrent starts by token in a PostgreSQL
transaction. A same-key/same-body retry recovers the original chat and cookie
without duplicate message, notification, assignment or quota consumption. A
changed opening payload/key under an already-used token fails without mutation.
Keep expiry checks and token isolation. Duplicate staged attachments are discarded.
Clients without a prepared token retain random-token creation compatibility.
No new schema/provider; rollback restores adapters/application code.

DOR met: bounded data-integrity correction under existing support contracts.
Verify serial/concurrent retry, altered-payload denial, distinct-token isolation,
reply idempotency, browser response loss and the existing support suite.

### In scope

- Tenant-safe conversations and messages between authenticated clients and
  authorized Suqpage staff, plus token-scoped public visitor conversations in
  the same staff queue.
- Waiting, open, and closed states; claim, assignment, close, and reopen.
- Configurable per-agent open-conversation limits, transactional least-loaded
  assignment, and a visible waiting queue when every enabled agent is full.
- Paginated inboxes, bounded message history, unread state, and lightweight
  polling.
- Optional Telegram queue notifications containing no message body.
- Two active anonymous visitor categories: using or reporting something on
  Suqpage, and help arranging transport. Older assistance values remain
  readable only for retained historical conversations.
- Validated visitor email and phone contact values for reconnecting outside the
  browser session when needed.
- One optional provider-neutral private image or PDF attachment on a support
  message, with participant-scoped reads and retained metadata.

### Non-goals

- Bots, voice/video, multiple attachments per message, SVG/Office/archive or
  executable uploads, SLA automation, unofficial WhatsApp Web automation, or
  automated verification decisions.
- Making Telegram or WhatsApp the source of truth for support history.

## Domain language and invariants

- A conversation belongs to exactly one authenticated business/client pair or
  one anonymous visitor session, never both.
- Clients may read and write only conversations for their own business.
- Team members may read eligible waiting conversations within their enabled queue
  scope and conversations assigned to
  themselves; operations managers may read and reassign all.
- No support agent exceeds their configured open-conversation limit.
- Every message has one authenticated staff/client sender or the matching
  anonymous visitor session and bounded plain text.
- An attachment belongs to exactly one support message. Its opaque storage key
  and private object are not authority for access; the parent conversation and
  current participant/token authorization are always checked first.
- Anonymous browser tokens are random, stored only as hashes server-side,
  delivered through secure HttpOnly same-site cookies, expire, and cannot read
  or write another visitor's conversation.
- Every new anonymous conversation has one normalized email and phone value.
  They are private support data visible only through the existing authorized
  staff conversation projection and are never sent in Telegram notifications.
- An assistance category records requested work only. It never records that
  verification, inspection, negotiation, or monitoring was completed.
- Public support does not promise sourcing, inspection, production checks,
  certification, negotiation, shipment monitoring, or delivery operation.

## Contracts

- Migration 22 adds the original authenticated `support_conversations`, `support_messages`,
  `support_agent_settings`, `support_assignments`, and `support_events`, with
  indexes for queue status, assignment, tenant, and incremental message reads.
- Additive migration 33 gives conversations an enforced client-or-visitor
  participant mode, adds hashed expiring visitor ownership and assistance
  category fields, and gives messages an enforced authenticated-user-or-visitor
  sender identity with sender-scoped idempotency. Existing client support rows
  are retained as client conversations.
- Additive migration 34 adds nullable visitor email and phone columns for legacy
  compatibility while database triggers or constraints require both on every
  new visitor conversation. Application validation normalizes email to lower
  case and accepts a phone value containing 7–15 digits with an optional leading
  plus after common display separators are removed.
- Message text is 1–4000 characters; subjects are 1–120 characters.
- Anonymous creation and replies use IP-hash rate limits, idempotency, honeypot
  rejection, bounded bodies, and no account enumeration.
- A valid unexpired visitor token may close only its own conversation. Public
  close is idempotent, releases an active assignment, records a visitor-close
  event without an actor user ID, and never grants reopen or staff controls.
- Starting another public chat clears only the browser session cookie. The
  closed conversation and messages remain authoritative staff records, and the
  next submitted request creates a new isolated conversation and token.
- Additive migration 36 creates `support_attachments` with one attachment per
  message, an immutable opaque storage key, safe original name, exact admitted
  MIME type, byte size, and creation time. It retains all earlier support rows.
- Attachment admission accepts only decoded/sanitized JPEG, PNG, and WebP or a
  PDF with matching signature and terminator, all at most 5 MB. Storage succeeds
  before the message transaction; transaction failure removes the staged object.
  A duplicate idempotency key never creates or retains another object.
- Public attachment reads require the same valid unexpired HttpOnly token as the
  conversation. Authenticated reads require the existing tenant/staff
  `requireConversation` authorization. Missing and unauthorized reads return the
  same private no-store 404 before object storage is accessed.
- Queue pages contain at most twenty conversations. Message reads contain at
  most one hundred recent messages and may request rows after a trusted integer
  ID for polling.
- New conversations use one transaction to choose the enabled agent with the
  lowest workload below their configured limit. If none is available, the
  conversation remains waiting.
- Claim and reassignment are transactional and reject an unavailable or
  capacity-full agent. Assignment release and close/reopen events are retained.
- Telegram notification is an optional adapter enabled only when both bot token
  and destination chat ID are configured. It sends conversation reference,
  business name, and dashboard link, never private message content.

## Scenarios

```gherkin
Scenario: Excess support work waits
  GIVEN a team member has reached their configured open-conversation limit
  AND another client opens a support conversation
  WHEN the team member attempts to claim it
  THEN the claim is rejected
  AND the conversation remains waiting for another team member

Scenario: Cross-tenant support read is denied
  GIVEN a client for tenant A and a conversation for tenant B
  WHEN tenant A requests the conversation or posts a message
  THEN the operation is denied
  AND no tenant B subject or message is returned

Scenario: Telegram is unavailable
  GIVEN Telegram notification settings are absent or the request fails
  WHEN a new support conversation enters the queue
  THEN the in-app conversation remains saved and usable
  AND the adapter failure does not expose message text

Scenario: Anonymous visitor token is tampered with
  GIVEN an anonymous visitor conversation exists
  WHEN a different or malformed token requests its messages or posts a reply
  THEN the operation returns a generic not-found response
  AND no subject, message, contact value, assignment, or existence signal leaks

Scenario: Anonymous visitor contact is invalid
  GIVEN a general-help request omits email or phone or supplies an invalid value
  WHEN conversation creation is attempted
  THEN validation rejects the request before persistence
  AND no queue notification or support row is created

Scenario: Anonymous visitor ends a chat
  GIVEN a visitor owns an active token-scoped conversation with an assignment
  WHEN that visitor ends the chat
  THEN the conversation becomes closed
  AND the assignment is released
  AND another visitor token cannot close it

Scenario: Anonymous visitor starts a separate chat
  GIVEN the browser holds the token for a closed public conversation
  WHEN the visitor clears that support session and submits another valid request
  THEN the closed conversation remains unchanged
  AND a new isolated conversation and opaque token are created

Scenario: Cross-conversation attachment read is denied
  GIVEN a private support attachment belongs to one tenant or visitor conversation
  WHEN another tenant, another visitor token, or an unauthorized team member requests it
  THEN authorization fails before private object storage is read
  AND no filename, MIME type, object key, or existence signal is disclosed

Scenario: Attachment transaction fails
  GIVEN a valid file has been staged in private storage
  WHEN message or attachment persistence fails
  THEN the staged object is removed
  AND no partial support message or attachment row remains

Scenario: Anonymous chat is abused
  GIVEN one network source exceeds the bounded creation or reply rate
  WHEN another request is submitted
  THEN it is rejected without creating a message or conversation
  AND existing staff/client queue behavior remains available
```

## Quality impact

- Security and tenant isolation: authorization is enforced in the application
  service for every read and mutation.
- Privacy and data retention: support text, visitor contact values, and
  attachments remain private application data; notification adapters receive
  metadata only.
- Accessibility and responsive behavior: owned by FE-019.
- Performance and limits: indexed paginated inbox, bounded history, and
  incremental polling; no unbounded websocket state in the PostgreSQL runtime.
- Failure recovery and idempotency: message post supports an idempotency key;
  notification failure cannot roll back the saved conversation.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Tenant and role authorization | security/integration | `scripts/test-support.ts` |
| Least-loaded assignment, configured capacity, and claim transaction | integration | `scripts/test-support.ts` |
| Message bounds, polling, close/reopen | integration | `scripts/test-support.ts` |
| Anonymous contact validation, token isolation, expiry, idempotency, and staff reply visibility | security/integration | `scripts/test-support.ts` |
| Private attachment admission, rollback cleanup, idempotency, and scoped reads | security/integration | `scripts/test-support.ts`, `scripts/test-media-storage.ts` |
| Client and staff mobile workflow | browser | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

Migrations 22, 33, 34, and 36 are additive with respect to retained support history. The first-party queue works without external
configuration. Telegram alerts are disabled by default. Application rollback
can leave the tables unused without deleting support history.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

S98 browser transport intake asserts the persisted initial state: an automatically
assigned case shows its named agent, otherwise it shows the waiting state. Neither
state claims the agent joined before explicit acknowledgement. The disposable
fixture may contain available transport staff; do not force production behavior
back to waiting solely to satisfy an outdated browser assertion.

Evidence: verified locally on 2026-07-30.

Migration 22, `lib/support.ts`, server actions, and the optional metadata-only
Telegram adapter are implemented. `scripts/test-support.ts` proves tenant
denial, message idempotency, least-loaded assignment, per-agent limits, waiting
capacity, claim, close/release, reopen, and reassignment with Telegram absent.
Reset fixtures provide 30 conversations, ten waiting, twelve open, eight
closed, and four enabled agents at three open conversations each. Ordered
browser acceptance proves the client mobile waiting flow and operations queue
and workload controls. `npm run check` and `npm run release` passed on
2026-07-30.

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
