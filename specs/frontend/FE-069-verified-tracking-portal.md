---
id: FE-069
title: Independent tracking portal and staff tracking workspace
status: in_progress
related: [BE-058, FE-068, FE-049, FE-062, DEP-048]
owners: [product, frontend, mobile, security]
last_updated: 2026-10-18
change_level: L2
---

# FE-069 — Tracking for visitors, owners and transport staff

## S141 standalone creation and single entry (ready; latest correction)

Staff use their existing top-level Tracking menu → New shipment, never a chat
tab, conversation ID or verification lookup. Required recipient email plus the
existing organized route editor are sufficient to Submit. Remove Check email
verification, verified badges/creation gates and instructions to wait for a code.
Verification remains ONLY on the recipient Tracking page before reading plans.

Visitor and owner transport shells each show exactly one quiet, reachable48px
Tracking entry across intake/resumed/ended states; the child conversation has no
duplicate Tracking block. Native preserves its already-single entry and separate
credentials. A conversation return hint is navigation only, never a shipment FK
or recipient authority; owner return must use the CURRENT chat after first Start.
Transport/support intake, assignment, replies, drafts and read receipts stay intact.

Historical case-bound plan UI is private read-only reference. Remove its tab from
current conversations and its New/Edit/rotate actions; stale action submissions
cannot create/update plans. Keep saved data and safe direct historical reads.
No new bottom nav, accordion, nested dialog or permanently editable record.

GIVEN brand-new email WHEN staff create two plans without a chat or verification
THEN both Submit and queue initial details; staff list/detail/Edit/Save/Cancel/Copy
are independent of any conversation. GIVEN recipient opens Tracking later THEN
email → code → list shows both, and a new chat does not change that list. One
new plan for the same email is visible after refresh. Another email cannot read it.
No plain email/reference grants access. Localized en/am/om empty/help/list/email
copy explains verification on access rather than as a prerequisite for creation.

Ready: BE-058/DEP-048/ADR-0028 updated before code; isolated auth/persistence tests,
actual Chrome visitor/owner/staff/admin desktop/phone and Expo journeys, exact
local Mailpit/API/DB readback and protected fixtures planned. Earlier visual/full
gates remain open; new layouts need review before expensive gates or rollout.

## Problem, outcome and scope

S138 separates tracking from chat. Preserve Suqpage styling, clear task pages,
ordered plans and transport/support chats. Staff management remains web-only.
No new bottom navigation, nested dialogs, ever-editable records or accordions.
BE-058 owns authority; ADR-0028 explains why account Auth cannot substitute.

## Acceptance scenarios

1. GIVEN transport window intake, resumed or ended chat WHEN Tracking is clicked
   THEN open /tracking independently of chat status, retaining the chat/draft
   return context. Owner and visitor use the same portal; no email requirement
   is added to ordinary chat. Tracking has its own full page, not a nested modal.
2. GIVEN no tracking session THEN show Email → Send code → Code → Verify.
   Explain simply that this opens their shipment plans. Resend countdown, wrong/
   expired code, loading and connection recovery preserve useful input. Never
   expose whether an email already has shipments, or ask staff for a code.
3. GIVEN verified session THEN Your shipments lists all authorized plans in
   bounded pages, with route/reference/label/stage count and Open action. Empty
   state says the agent can add a plan. Sign out clears sensitive state and only
   the tracking session. Opening a direct locator link uses the same verification;
   it never reveals/prepopulates its recipient email or bypasses permissions.
4. GIVEN detail THEN show numbered providers/methods/From/To in the established
   read view, updated while active, with Back to shipments. No ETA, active step,
   completed ticks or current-provider claim. Expiry/revocation clears old data.
5. GIVEN transport staff/admin navigation THEN Tracking opens dedicated searchable
   list → read-first detail → explicit Edit → Save/Cancel. New shipment asks for
   the recipient email and an organized route editor, with no prior verification.
   Never solicit the recipient's code; verification protects their portal access.
   Submit clearly saves and queues initial email; success never claims delivery.
   Copy link remains available for sharing in chat. Editing stays independent of
   ended/no chat and displays safe queued/accepted/deferred delivery status.
6. GIVEN an obsolete case-plan route THEN authenticate and redirect eligible
   staff to Tracking without reading the old plan. No old plan tab, company form
   or editing action remains. Staff initiate new plans from
   Tracking; automatic/prefilled conversion is outside this change. No recipient
   guess or legacy anonymous link. Chat retains normal functionality.
7. Native /tracking uses separate tracking credential storage, safe canonical
   incoming links and its own email/code/list/detail states. Browser Expo8082
   uses its native adapter correctly; no owner Auth token reuse. Preserve native
   theme and small-screen touch targets, balanced route fields and visible labels.
8. Meaning-first en/am/om copy describes a route arrangement, code and multiple
   shipments simply. Literal provider/place names remain untranslated. Inactive
   languages remain disabled. Privacy page reflects email-verified access.

## Test plan and rollout gates

Focused actual-component/HTTP/native lifecycle/route tests plus typechecks and
catalog validation precede actual installed Chrome1440/390/320 and Expo8082.
Exercise visitor email/code/empty/multiple/detail/return/logout, owner account
coexistence, transport staff Create/Edit/Cancel/Copy and support-role denial.
Use real local Mailpit/API/PostgreSQL, labelled fixtures, protected before/after
readback and isolated cross-recipient negative tests. No mocked success as proof.
Capture representative active-language screens and request explicit visual
approval before expensive full/check/release/acceptance/build/remote gates.
Installed Android, push, production email and hosted rollout remain unverified
until separately performed. Earlier S129–S137 review obligations remain recorded.

Focused test mapping: `scripts/test-tracking-staff-ui.ts`,
`scripts/test-tracking-portal-ui.ts`, `scripts/test-native-tracking.ts`,
`scripts/test-native-tracking-ui.ts`, `scripts/test-participant-transport-plan.ts`,
`test-public-transport-launcher.ts` and `test-owner-transport-workspace.ts`. These
controlled-port tests supplement, never replace, the real local application tasks.


S142/S144 clarification (2026-10-18): there is no retained legacy plan UI. The
separate authorized cleanup removed4local obsolete plans and9allowlisted events
with rehearsed recovery and70protected-table fingerprints unchanged. Live schema63
had no plan table and zero matching events, a verified no-op. This is neither a
Tracking rollout nor permission to remove other chat/account/shipment history.
