---
id: FE-062
title: Inquiry and chat alerts with truthful read receipts
status: in_progress
related: [BE-050, DEP-043, ADR-0026, FE-019, FE-026, FE-049, FE-053]
owners: [frontend, customer-support]
last_updated: 2026-10-07
change_level: L3
---

# FE-062 — Inquiry and chat alerts with truthful read receipts

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
fetches do not. Show assigned agent separately from an actual first join; never
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
