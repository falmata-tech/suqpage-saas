---
id: FE-076
title: Transport help and provider listing interest
status: in_progress
related: [BE-063, FE-068, FE-069, FE-049, FE-053, FE-077, BE-064]
owners: [product, frontend, mobile]
last_updated: 2026-10-21
change_level: L2
---

# FE-076 — Clear transport help with a live agent

## Problem, outcome and boundary

The current phase offers one independent logistics service provider. Its
official display brand is **SharedTrucks Logistics** and its type is
**Freight brokerage**. The user supplied its official wordmark and navy/blue
palette, used consistently across web, Expo and shipment identity and kept
visually distinct from MirtPage's orange brand.
Other future service types include parcel express delivery and hub-and-spoke
logistics; these are types, not selectable companies in the current phase. The
provider's actual name remains visible in the specific provider choice and shipment record;
general site copy does not promote or name that company. The transport chat
names the selected provider so the person knows which shipment service they are
contacting. The intake opens with no company selected. An accessible provider
choice expands to the one currently available company with its service-type
badge, concise shared-truck brokerage description and official wordmark. After the person
selects it, the compact choice displays its identity, type and description;
starting a new conversation requires that explicit selection. The interface must not suggest that
other providers are available. Transport chats currently go to MirtPage's
internal transport queue; MirtPage staff operate it today. Chat copy says a live
transport agent will help arrange the shipment with SharedTrucks Logistics; it
does not claim the agent is a SharedTrucks employee. Business Support continues
to represent MirtPage separately. If no agent joins or replies, the live wait
ends after three minutes thirty seconds and the same chat becomes a message for
later in the existing Transport staff inbox.

Independent approved transport-company accounts, company staff management and
company-based authorization/routing are future work, not enabled by this phase.
Transport companies can ask about being listed through the dedicated provider
interest page, linked from About and account entry rather than the transport chat.
Submitting an interest form grants no access or operating status. Existing
business account sign-in/onboarding remains available.
Master sections 4,12,13,15,16,18,19 and22 will change after qualification.

## Observable scenarios

1. GIVEN a public web/phone/native page supports transport help WHEN its launcher
   appears THEN a truck icon and short localized transport/live-chat wording are
   readable without a narrow multi-line paragraph, its target is at least48px,
   and inquiry/unread actions remain separate and reachable.
2. GIVEN the visitor or owner opens a new transport intake WHEN it first renders
   THEN no company is selected, and the choice says to choose a logistics service
   provider without showing a company identity as though it had been chosen.
   Opening the choice reveals the one current option, SharedTrucks Logistics,
   badged **Freight brokerage**, with a concise description that explains its
   arranging role rather than implying it carries goods itself. Selecting the
   option closes the choice and shows the identity, badge and description in the
   selected state. Starting a chat without selection is prevented on web and
   native; the request sends the selected canonical ID. Pickup/drop-off inputs
   remain one step away. Existing validation, joining, replies, receipts and
   inactivity behavior remain intact.
3. GIVEN customers may be arranging a personal purchase, incoming stock, or a
   larger business order WHEN transport intake renders THEN its localized heading
   and explanation address all of those cases without implying a delivery date,
   guaranteed service or fixed transport method.
4. GIVEN the current company is rendered WHEN its identity appears THEN it uses
   the supplied SharedTrucks Logistics wordmark and navy/blue brand treatment on
   web, native and shipment records; the freight-brokerage badge remains readable
   and visually separate from MirtPage's orange brand. The image has accessible
   text and the company name is not redundantly repeated as a second wordmark.
5. GIVEN an authenticated tracking recipient views their shipments WHEN an item
   appears THEN its arranging company is identified as SharedTrucks Logistics
   with its brokerage type, distinct from individual leg carriers.
   Individual leg carriers, order, modes, external links and codes remain distinct;
   the company mark makes no custody, scan-event or delivery-date claim.
6. GIVEN a logistics company chooses the logistics-service-provider listing option WHEN
   it opens THEN it gets a concise interest form rather than an operating account,
   and copy presents MirtPage's provider-listing opportunity without suggesting
   that the chat itself is a provider-enrollment channel.
   The form requests company/contact name, email, optional phone and a message;
   success means the request was stored, not that a company was approved or email
   was delivered. Error/retry preserves entered values and cannot duplicate it.
7. GIVEN the same workflow in English, Amharic or Afaan Oromo WHEN it renders
   THEN the service-provider choice and freight-brokerage badge explain the
   distinction naturally, company names remain literal,
   labels wrap without shrinking essential type and keyboard/focus remain usable.
8. GIVEN a visitor or business owner starts a transport chat WHEN intake or
   waiting state appears THEN they are asked for the route and told that a live
   transport agent can help arrange the shipment with SharedTrucks Logistics.
   Avoid “coordinator,” unsupported employment claims, internal staff routing
   and an exact response promise. Waiting copy never implies an agent has joined.
   FE-019 S174 supersedes the earlier public wait wording: show remaining time
   from the first waiting state, and use the provider-named busy/contact message
   only after the three-minute-thirty-second deadline. The two-minute staff
   overdue alert remains internal. The same staff case is retained.
   Once a request is waiting or active, its SharedTrucks identity is an
   accessible link to `https://sharedtrucks.com/` that opens outside the chat
   without ending or resetting the conversation. This link is present on web
   and native, with a clear label in each active language. A failed external
   open leaves the chat usable.
9. GIVEN a phone user opens the transport chat WHEN the form or conversation is
   active THEN the chat uses the available viewport without scrolling the page
   behind it; the reply controls remain visible, the transcript is the primary
   scroll area for a long conversation, and a short viewport/keyboard can resize
   the chat. The entry form may scroll internally only when it cannot fit.
10. GIVEN the same native transport flow WHEN a conversation is active THEN the
    bottom navigation and duplicate transport launcher are out of the way, the
    transcript can scroll independently, and the reply composer remains usable
    as the keyboard opens and closes. The initial form scrolls only when required
    by the available screen height.

## Test plan

Focused component/geometry tests cover48px targets, long labels, one-option
disclosure open/close, initially empty selection, explicit choice before submit,
freight-brokerage badge, official wordmark and description, responsive form/chat
geometry, truthful MirtPage-to-provider coordination copy, transcript-only scrolling, reply composer
visibility and unchanged conversation behavior.
Focused paths: `scripts/test-transport-chat-layout.ts` for explicit human-reply
copy and responsive scroll-region contracts; `scripts/test-transport-coordinator.ts` for portable
identity/legacy/foreign-ID rejection; `scripts/test-transport-coordinator-ui.ts`
for launcher/intake/tracking composition and long-label geometry; S162's pure
wait-state test covers2:00/3:30 boundaries, clock offset, Join/public-reply stop,
and same-thread async composer copy;
`scripts/test-transport-partner-interest-ui.ts` for form, retry and entry paths.
Actual Chrome1440/390 and Expo8082 must exercise visitor and owner entry,
waiting/conversation layout and tracking entry; staff/admin routing stays
web-only. Physical Android remains separate device evidence.

## Rollout and rollback

Visual review precedes full gates. No new native dependency, signing change,
provider setting or third-party mail service is introduced. Domain/API/security
and interest delivery belong to BE-063. Future multi-company operation needs a
separate ready specification, migration and authorization review.

## Readiness

Owner scope, current/future split, BE-063 bounds and mapped focused-test paths
are explicit. The supplied screenshot's wordmark is the approved company asset
for web and Expo; no text-drawn or MirtPage-colored substitute is used.

Ongoing phone conversations use the compact wordmark and brokerage badge in the
existing metadata row (accessible full name “SharedTrucks Logistics”). Intake
and shipment records show the full brand. Company branding must not add another
stacked row above the transcript or regress the existing compact-chat geometry
criterion.
