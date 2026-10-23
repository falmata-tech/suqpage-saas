---
id: FE-062
title: Inquiry and chat alerts with truthful read receipts
status: in_progress
related: [FE-069, FE-066, BE-050, DEP-043, ADR-0026, FE-019, FE-026, FE-049, FE-053, FE-068, FE-075, BE-062]
owners: [frontend, customer-support]
last_updated: 2026-10-22
change_level: L3
---

# FE-062 — Inquiry and chat alerts with truthful read receipts

## S162 — transport wait notice and asynchronous handoff (implementation under Expo clock regression repair; full review pending)

Transport customers see an elapsed wait, not the internal Overdue state or staff
assignment. At two minutes without explicit Join or public reply, show a concise
busy message. At three minutes thirty seconds, end the live wait and change the
same conversation composer into a message for later in the existing Transport
inbox. A sent message is stored once, keeps normal public read receipts, and can
receive a later staff reply. No new inquiry, conversation or end/resolution event
is created. Recompute from the server-created conversation timestamp on resume;
Join/reply before the threshold stops the live timer. Admin escalation continues
at the two-minute assigned response deadline under BE-018/050, with its bounded
worker cadence and privacy safeguards.

Local visitor workflow evidence is recorded under FE-019 S162 and
`.local/s162-transport-review/review.html`. The first shared-preview run
verified same-thread message persistence and the open/unresolved state, but
reviewing its screenshots exposed an Expo post-send render that can briefly
return to the live-reply composer. An isolated Chrome/API-fixture run reproduced
the client-clock mismatch; repair and immediate regression retest remain
pending. Owner and staff follow-up, due-worker/admin email delivery, observed
read receipts, visual approval and full gates are not established.

S142 FE-019 compact staff workspace adds an explicit phone Details view. Its chat
DOM/draft may remain mounted but hidden; read observers must be inactive in that
mode. Merely switching Details→Conversation cannot acknowledge off-screen or
unread messages without existing focus/visibility/footer checks. Assignment,
join, notifications, read epochs and deadline/idle semantics do not change.

## S125 — customer Join alerts and private overdue attention (ready)

Assignment/reassignment alerts remain internal staff attention. Customer web and
native feeds never announce an agent until the assigned staff member explicitly
clicks Join chat; viewing/reading/Claim is insufficient. Old queued assignment
alerts are suppressed for customers. Joined alerts remain idempotent per current
assignment and obey existing privacy/permission/mute/subscription behavior.

Staff receives localized generic reply_overdue attention once per unanswered
cycle under BE-018/050, without customer details in OS copy. Render localized
Needs staff reply, Overdue, Waiting for customer and Join chat on staff screens;
customer wording is Waiting for our team / Waiting for your reply / joined /
Chat ended / Resolved. All five supported languages use understandable phrasing.
Focused catalog/component/security tests and real Chrome/Expo tasks precede
visual approval; OS push and hosted rollout are not implied by browser evidence.

## S119 — visible footers and authoritative receipt epochs (ready)

BE-050 S119 controls sender-side authority and negative receipt permissions.
GIVEN a focused transcript with several incoming replies WHEN an older footer is
visible and the newest is offscreen THEN acknowledge the highest visible footer,
not the newest fetched message. Respect the offset visual viewport, clipped
scroll ancestors, modal coverage and fixed navigation. A hidden or unfocused
window never acknowledges a message. Reassignment/reopen resets the staff
observer using the saved assignment epoch, preserving visible-read accuracy.
Reading no longer establishes a join; explicit acceptance follows S125.

Focused regressions exercise actual observation code with controlled geometry,
focus, async completion and assignment epochs; server regressions reject foreign,
self, private-note and stale-assignee acknowledgements. Actual local browser
verification remains distinct from these controlled ports and Android device
proof. Master §§13,15,19,22 are affected; no full release or hosted write is part
of this defect correction.

Focused implementation evidence: `scripts/test-visible-chat-reads.ts` executes
actual React observers with controlled viewport/lifecycle/measurement ports;
`test-chat-read-receipts.ts` and `test-owner-transport.ts` exercise isolated real
PostgreSQL authority, privacy, durable sender-side projection and additive66
history preservation. The shared focused component set passes20/20 and both
isolated persistence scripts pass. Web/native typechecks and the existing pure
keyboard/viewport regression pass. S119's actual local Chrome evidence is
recorded separately by the parent audit; no device or deployment claim follows.

## Problem and outcome

Owners, Support/Transport staff and live-chat visitors need visible unread work
and timely alerts without fabricated reads/presence or distracting repeat sounds.

## Scope and contracts

A compact bell/unread count and bounded alert list for authenticated web owners/
staff and native owners; transport visitors get unread chat indication and an
opt-in alert control after intake. New inquiry, waiting team chat, assignment,
reassignment, first join, public message and ended/reopened alerts deep-link into
the existing permitted inbox/chat. Admin management remains web-only.

Default in-app alerts; sound/browser/device permission is explicit and optional.
Show notification availability/denial and retry without blocking inquiry/chat.
Do not request permissions before user intent or send repeated prompts. Alerts
and preferences remain available through Account/Profile or staff workspace.
The alert list includes Mark all read for older unread events; this never changes
message receipts. Notification opt-in/off state is returned by the server rather
than assumed from a previous button press.
Suppress repeated sound across polling/tabs and on messages currently being read;
background push stays distinct from observed in-app delivery. On return reconcile
from server and preserve drafts. End chat releases capacity; hide preserves it.

Sent/Read on outgoing messages uses confirmed BE-050 receipts only. Active, focused
visible transcript content acknowledges its last seen message; hidden/background
fetches do not. Keep assignment internal and announce only explicit Join; never
claim current online presence or a guaranteed response time. No typing animation.

## Scenarios

GIVEN an owner on web/native WHEN an inquiry is submitted THEN show a new alert
and unread count with a link to that tenant's inquiries, without changing status.
Notification links focus the exact permitted inquiry rather than an unrelated
page of the inbox. Unowned-business inquiry alerts go to managers, retaining
the existing authorized business context; native remains owner-only.
GIVEN staff WHEN matching waiting work/assignment/reply changes THEN show the scoped
alert and permitted destination; other queue/client content stays invisible.
GIVEN a visitor after intake WHEN assignment/actual join/public reply changes THEN
show the event and unread message indication; an opened, visible message produces
Read for its sender, whereas a hidden chat preserves unread state.
GIVEN a granted alert preference WHEN new unseen work arrives THEN use a restrained
sound/notification; polling/reconnect/retries/other tabs do not repeat the same event.
GIVEN denied permissions or a provider outage THEN chat/inquiry and unread list still
work and retries do not lose drafts or invent delivered/read status.
GIVEN a React Native Web chat whose keyboard adapter has no metrics method WHEN
an agent reply is rendered or the viewport/keyboard changes THEN no unsupported
keyboard method is called and reads remain limited to uncovered visible footers.
Native keyboard show/hide events and web visual-viewport bounds preserve this
contract without a metrics API dependency.
GIVEN 320px/desktop and all five locales THEN controls/messages wrap, remain 44px,
keyboard/focus/screen-reader accessible and do not cover search/results or navigation.

## Quality impact and observability

FE-049 contextual interface text, literal user content and Suqpage palette persist.
Respect browser/device mute and reduced motion; avoid intrusive looping sounds.
Secure deep links revalidate authentication. No private payload in OS notifications.
Client logs exclude tokens/bodies/contacts. Bounded refresh/backoff and visibility
suspension preserve performance. Browser captures are not native push proof.

## Test plan

| Criterion | Level | Test path |
|---|---|---|
| All participant workflows, visibility, failures, sound/dedup, viewport | browser | scripts/capture-notification-workflows.mjs |
| Locale/read-state coverage and keyboard/viewport fallback | unit | scripts/test-localization.ts; scripts/test-chat-read-viewport.ts |
| Native contracts/permissions/sign-out | integration/device | scripts/test-attention-notifications.ts; scripts/test-attention-platform.cjs; DEP-043 device gate |

## Rollout and rollback

DEP-043: local screenshots/focused tests first; explicit visual approval before full
release gates. Web/API schema precede native build. Disable push independently on
rollback; keep unread server events. External permission/device delivery are separate
verified gates, not implied by a checkbox or compiled UI.

## Readiness checklist

- [x] Explicit audience/scope/non-goals and observable failure scenarios
- [x] Related contracts, privacy, locale/accessibility and bounded refresh evaluated
- [x] Focused/manual device verification and safe rollout/rollback identified

## Completion evidence

Local implementation and focused types/locale/PostgreSQL/HTTP/browser tests pass;
TRACEABILITY records actual owner/visitor web/Expo and browser sound evidence.
Visual/full release/commit/rollout and configured device push remain pending.

S93 regression: remove Keyboard.metrics entirely, rather than relying on a platform
branch surviving development refresh. scripts/test-chat-read-viewport.ts and fresh
capture-notification-workflows.mjs prove reply rendering/read bounds in web preview;
mobile typecheck passes. Physical Android keyboard/OS push remains its device gate.


## S105 social-contact revision

FE-066 / BE-055 supersede new customer messages to business inboxes. Only
configured social accounts receive visitor handoffs; chosen products and the
simple message follow the active UI language. Retained private history stays
scoped. Public transport chat and authenticated owner support remain unchanged.
Local implementation and review evidence are tracked in checklist S105.
