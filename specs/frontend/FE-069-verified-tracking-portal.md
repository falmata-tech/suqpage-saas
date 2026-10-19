---
id: FE-069
title: Independent tracking portal and staff tracking workspace
status: in_progress
related: [BE-058, FE-068, FE-049, FE-053, FE-062, DEP-048]
owners: [product, frontend, mobile, security]
last_updated: 2026-10-18
change_level: L2
---

# FE-069 — Tracking for visitors, owners and transport staff

## S146 presentation correction — quiet Shipment tracking canvas (ready)

The shared public-shell photograph sits behind the Shipment tracking heading and
can obscure its text. The recipient task needs a plain, MirtPage-themed canvas
on phone and desktop. This is presentation only: email verification, recipient
scope, shipment data, provider links and staff editing remain unchanged. FE-070
owns the shared-shell treatment; no migration or hosted configuration is needed.

1. GIVEN a visitor or business owner opens Shipment tracking on desktop or phone
   WHEN email entry, code entry, shipment list or detail renders THEN the page
   heading, instructions, forms and shipment records appear on a uniform theme
   background without a decorative image behind them.
2. GIVEN the same task opens in the Expo app WHEN it renders THEN its plain
   theme background and readable tracking cards remain consistent with web.

Plan: capture the current desktop/phone and Expo states, update the shared
public-shell canvas and the existing composition contract, run focused tests,
exercise the actual Chrome/Expo tasks and review screenshots before full gates.
Roll back by restoring the previous CSS if the new canvas harms readability;
there is no data or API migration. This local correction needs separate visual
approval; earlier Shipment tracking visual approval does not cover it.

Local focused composition/identity, portal UI (7 cases), and native tracking UI
(5 cases) pass. Installed Chrome155 confirms no shared background image at1440/390
on Tracking, About, Privacy, Featured and Market. Its final local retry clicked
Market → transport chat → Shipment tracking, typed and cleared the email at both
1440/390, and captured settled Tracking forms. Expo8082 captured the plain
Tracking card/background. Review images and bounded receipts are in
`.local/shipment-tracking-canvas-s146/actual/`. The combined browser script
stopped on an overly specific phone RGB assertion after those Tracking actions;
About/Featured screenshots from that run show transitional loading, so settled
cross-page interaction remains open. This is not visual approval or a full gate.

## S145 follow-on — Shipment tracking and provider references (local implementation)

The newest owner direction names this active feature **Shipment tracking**.
It remains an organizer for the arranged route and ordered providers, until a
separate integration is specified. BE-058 owns the Tracking-only leg contract;
DEP-048 owns additive75, preserved snapshots and rollout. Master sections13,
15,17,18,19 and22 are affected. Root accepted this Ready proposal before feature
code; earlier MirtPage mail visual approval and focused evidence stay
bound to their source, not silently transferred to new layouts.

1. GIVEN eligible transport staff/admin WHEN creating or explicitly editing a
   shipment THEN each leg has two independently optional labelled fields:
   Provider tracking link and Provider tracking code. Blank fields remain valid.
   Reorder/add/remove, failed-save retry, Cancel, refresh and expected-version
   conflict preserve the correct leg values and draft/idempotency semantics.
   Retain list→read detail→Edit→Save/Cancel,48px controls and balanced responsive
   fields. The retired shared editor defaults/serialization are unchanged; only
   the explicit independent ShipmentEditor enables these Tracking-only fields.
2. GIVEN a verified authorized recipient WHEN a leg has a valid provider link
   THEN show Open provider tracking with an external-site cue, opening only on
   deliberate activation. Render HTTPS URLs accepted by the shared pure BE-058
   validator; reject credentials, ports, IP/local/single-label hosts, controls
   and backslashes. Use no-opener/no-referrer web navigation and the existing
   native browser helper after validation again on press. Do not fetch, embed,
   preview, template or concatenate a code into a provider URL.
3. GIVEN a tracking code WHEN details render THEN show its literal case and
   punctuation, selectable with an explicit Copy code action. Copy failure
   remains honest and offers selection/manual copy; it never opens a link or
   says Copied after a false/denied result. Reset transient feedback when the
   leg/code/link changes. Missing links/codes produce no empty controls. Either
   field may appear by itself, and long codes wrap on320px/phone views.
4. GIVEN old/missing/null provider fields WHEN parsed THEN display no provider
   action. Legacy rows and old queued/leased snapshots are not rewritten, and
   the retired shared TransportPlanLeg/parser remain unchanged. Recipient email
   verification, separate credentials, list/detail authorization, version/ETag
   refresh, expiry/revocation clearing and chat/account independence still hold.
   A code/reference/link grants no shipment authority.
5. GIVEN active navigation/headings/help/loading/metadata and relevant existing
   prose WHEN localized THEN use Shipment tracking consistently, including
   visible former Transport plan/Shipment plan references. Preserve technical
   routes/types/IDs/protocol/storage/history. New en/am/om text explains the
   user's task in ordinary wording; provider/place names, URLs and codes remain
   literal. Inactive so/ti remain inactive with deliberate fallback. Do not add
   unrelated showroom marketing claims or expose internal integration notes.
6. GIVEN this organizer WHEN a route is shown THEN ordinal stages describe
   arranged provider order only. No automatic status/current carrier/ETA/scan/
   completion claim, provider polling, paid SDK or booking is introduced. The
   provider's external site is separate, not an endorsed/verified status source.
7. GIVEN active Tracking email presentation WHEN its separate fresh local
   zero-queue/in-flight boundary is verified under DEP-048 THEN change only
   authored Shipment tracking terminology in subject/body and active-language
   catalog values. Do not add provider URLs/codes to mail, rewrite old delivery
   snapshots or change sender/address/origin/provider/Message-ID keys. The
   earlier stopped M6 snapshot does not authorize a later hot renderer change.

Plan: root accepts UI/backend Ready → exact beforeimages/path scope → optional
staff fields and recipient actions/terminology → focused component/native/domain
security/types/localization → root-coordinated actual Chrome staff/admin and
visitor/owner web/Expo tasks with real local API/DB/email outcomes → representative
en/am/om screenshots → new explicit visual approval → one fresh combined full
gate and separately reviewed hosted/native rollout. No ordinary75 migration or
mail/server/provider change follows from this Ready proposal.

Focused tests extend test-tracking-staff-ui, test-tracking-portal-ui,
test-native-tracking-ui, test-native-transport-plan, test-transport-plan-ui and
test-transport-plan-localization. Preserve existing role, shared-key, recipient,
draft/version/Cancel/retry/session/privacy negatives. Add exact safe href/copy,
hostile-link inertness/no automatic fetch, independent optional fields, legacy
empty fields, native open-failure handling and narrow-screen accessibility.

Local source now implements optional staff fields, provider read/copy actions,
active feature terminology and native-authored en/am/om rows. Focused real-
component/port cases pass for URL/code independence, reorder/draft/Cancel/retry,
new byte limits/hostile action denial, literal code/safe external href, copy/open
failure, live feedback reset and inherited role/recipient/session checks.
Retired editor defaults and historical localization assertions remain intact.
The final sequential UI/native batch passes58 cases without failures/skips;
scoped strict web UI and mobile types pass. Actual real-API Chrome/Expo journeys remain held until
root's guarded local72→75 operation and mail-copy boundary; new visual approval
and full gates are still pending. Private source/beforeimages/iteration evidence:
.local/mirtpage-rebrand-s145/shipment-provider-tracking-ui-source/.

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
