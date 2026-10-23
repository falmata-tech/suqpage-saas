---
id: FE-075
title: Business inquiry channels and a focused owner Inbox
status: in_progress
related: [BE-062, FE-066, FE-041, FE-049, FE-053, FE-056, FE-062, BE-001, BE-044, BE-050, BE-055, DEP-044, DEP-049]
owners: [product, frontend, security]
last_updated: 2026-10-21
change_level: L2
---

# FE-075 — Business inquiry channels and a focused owner Inbox

## Problem, outcome and authority

S154 restores asynchronous visitor-to-business inquiries alongside equally prominent WhatsApp/Telegram contact
choices on phones. This explicitly supersedes FE-066/BE-055's retirement decision when the
coordinated implementation is released. Those contracts still describe the
currently deployed retirement; this ready spec is not deployment evidence.
Transport live chat, owner Support, shipment tracking and all S153 audit fixes
remain separate and unchanged. Root owns the ordered S154 checklist and master
updates in §§4,8,9,13,16,18,19,21,22.

A business inquiry is a submitted message and canonical product selections for
an owner's private Inbox. It is not visitor live chat: no guest reply portal,
onsite owner reply composer, presence, typing, response-time promise or visitor
read receipt is introduced. The owner follows up using the supplied phone.

## Scenarios — visitor acceptance

1. GIVEN a public business WHEN Contact is opened THEN prepare one automatic
   product inquiry message and show equal adjacent/wrapping choices: Send on
   WhatsApp, Send on Telegram (when configured), and Send to MirtPage Inbox.
   Do not show an editable custom-message field before a channel is selected.
   WhatsApp and Telegram receive the prepared draft; visitors can edit it in
   the destination app. Selecting MirtPage Inbox reveals an editable message
   prefilled with the same draft, plus Your name, Phone number and Send inquiry;
   these Inbox fields are not required for an external handoff. A general
   question may contain zero selected products. Product-only inquiry defaults to
   that product alone; saved lists remain unique to each business, capped at20.
   Direct inquiry never merges with or clears the saved group.
2. GIVEN selected products/options/quantity intent WHEN the form opens THEN retain
   a clear selection summary and a natural-language draft based on the current
   interface language. Merchant names/options remain literal. Submission uses
   canonical server authority under BE-062, not the draft's product claims.
3. GIVEN invalid input, unavailable selections, offline or a failed request WHEN
   Send is attempted THEN retain the form and selections, show specific errors,
   focus the error and permit a safe retry. Never silently truncate the message
   or silently remove invalid selections from a submitted inquiry. Pending work
   prevents duplicate Send and changes to the submitted selection.
4. GIVEN successful durable acceptance WHEN showing confirmation THEN explain
   that the inquiry reached the business Inbox and the business may contact the
   visitor using the provided phone. Do not claim it was read, emailed or answered.
   Clear name/phone from the completed form; never persist them in browser/device
   storage. Clear only a successfully submitted saved group; direct submission
   leaves all saved groups intact. Failure or external handoff clears nothing.
5. GIVEN configured, policy-approved WhatsApp or Telegram contacts WHEN Contact
   opens on desktop, phone web or native THEN show each contact's actual public
   number/username and a clear action beside Send to MirtPage Inbox. On a
   recognized phone/native surface the action opens the supported destination
   with the prepared draft; the number/username stays visible. On desktop the
   contact and a Copy contact action remain visible, but external app launch and
   automatic message copy stay disabled; the separate Copy message and MirtPage
   Inbox actions remain available. Matching controls wrap at a readable width
   with48px minimum targets; no narrow squeezed three-button row.
   Do not reveal private contacts or bypass explicit demo-contact approval.
   They prepare a draft; the user sends externally. SMS and manual Copy remain
   secondary utilities.
   After desktop Copy contact, show the success or fallback beside that action
   inside the modal; feedback must not disappear behind the modal backdrop.
   Copy uses the prepared message. Retain selectable text and honest
   opener/clipboard failure feedback; message customization happens in the
   destination app or, for the first-party Inbox, after selecting that channel.
   Desktop/unknown web surfaces offer copy of the prepared message or Send to
   MirtPage Inbox, plus visible approved WhatsApp/Telegram contact identities that
   can be copied separately. They do not launch external app/tel/SMS links from
   the composer. Do not infer installed apps or promise recipient availability.
6. GIVEN the showroom footer THEN do not duplicate messaging contact channels.
   Website and ordinary TikTok/Instagram/Facebook profile browsing remain distinct
   from inquiry delivery. A general Contact entry remains reachable without first
   selecting a product. Existing validated demo-contact permissions still apply.

## Owner Inbox acceptance

Current persisted business authority controls Inbox access: the current owner,
platform administrator, or staff with a currently enabled business-management
grant. Mere queue membership is insufficient. Revoked grants deny list/detail,
read and status; mutations lock the current profile/grant for the transaction so
an administrator's revoke cannot race admission. Native owner APIs stay owner-only.


7. GIVEN an authorized owner WHEN opening Inbox THEN show a compact searchable
   collection with customer, time, product/context excerpt, unread indication and
   workflow status. A selection opens its actual details: desktop list/detail
   panes; phone separate detail with one clear Back that preserves filters/page.
   Hide list filters/search while phone detail is open so customer content starts
   near the top instead of beneath repeated list controls.
   Avoid full editable records stacked together or accordions hiding each task.
8. GIVEN a focused, visible inquiry detail WHEN its content has rendered THEN
   acknowledge its first genuine opening under BE-062. List loading, prefetch,
   hidden panes and background refresh never mark it read. Read state is distinct
   from New/Contacted/Confirmed/Closed/Cancelled workflow status and alert-read
   state. No visitor-visible Read claim is added.
9. GIVEN detail WHEN following up THEN show the original visitor message, phone,
   canonical selection snapshots and clear workflow-status actions. Owner cannot
   edit the visitor message. Internal owner notes and onsite replies are deferred.
   Validate every read/status action and retain unrelated tenant isolation.
10. GIVEN a committed inquiry WHEN owner attention refreshes THEN receive exactly
    one scoped in-app event/unread indication with an exact-detail deep link.
    Existing optional browser/native push remains permission/config dependent;
    email is deferred, and no email-delivery claim or dormant Resend sender is
    enabled. A failed optional notification provider never loses the inquiry.

## Quality and platform boundaries

Use one Unicode name field with name autofill; phone keyboard/tel autofill and
format-tolerant validation; show the labelled, visibly bounded editable message
only inside the selected first-party Inbox form.
BE-062 owns exact bounds and error codes. Preserve48px native/44px web targets,
keyboard/AX focus, phone safe-area/keyboard clearance, non-obstructing floating
inquiry/transport controls, plain backgrounds and route-shaped loading states.
Keep en/am/om interface meaning consistent; names, contacts and visitor content
remain literal. Secondary device policy must also exclude links from desktop
keyboard/assistive activation. No dependency or new messaging provider is needed.

## Test plan and rollout

- Pure/adapter: existing product/basket/contact tests plus focused restored-inquiry
  UI regressions for general/product/group paths, channel-specific message editing,
  failure/retry, platform contact
  policy, footer deduplication, real detail/read/status and notification routing.
- Isolated persistence/API: BE-062 security, migration, idempotency and rate tests.
- Actual Chrome: desktop1440/phone390 plus Expo8082 visitor form→correct owner's
  Inbox→detail/read/status→Back, other-tenant denial and pending/error preservation.
  Install synthetic tile guard before public navigation. No real external message
  or email is sent by tests. Physical Android is separate evidence.
- Capture changed states and obtain explicit visual approval before full gates.
  Then check/release/acceptance, coordinated web/API before native rollout, and
  scoped Git/release evidence follow AGENTS/DEP-044/DEP-049.
- Additive migration78 preserves existing inquiry history. Do not apply it to the
  shared local database or hosted database without the reviewed backed-up plan.
  Compatible rollback may disable new submissions without deleting accepted data.

## Ready checklist and evidence

Scope,0–20-item general/product behavior, no-chat boundary, read/status semantics,
privacy, bounds, dependencies, tests and additive rollout are agreed. Root's S154
checklist/master plan precedes implementation. Related reciprocal notes are being
coordinated with their current owners. No implementation, visual approval, full
checks, migration apply, build or deployment is claimed by this ready spec.

Research: [GOV.UK phone fields](https://design-system.service.gov.uk/patterns/phone-numbers/),
[names](https://design-system.service.gov.uk/patterns/names/),
[confirmation](https://design-system.service.gov.uk/patterns/confirmation-pages/),
[Android list/detail](https://developer.android.com/develop/ui/compose/layouts/adaptive/list-detail),
[WhatsApp drafts](https://faq.whatsapp.com/5913398998672934),
[Telegram links](https://core.telegram.org/api/links). These support the interaction
patterns and supported draft links; the owner explicitly chooses desktop text
instead of provider-supported desktop launch.

## Focused implementation verification

The restored cases in test-contact-handoff-native-ui.ts and
test-floating-inquiry-web.ts exercise the actual form components through
controlled network/clipboard ports: explicit send, failed-request retention,
equivalent retry, tenant-basket isolation, desktop text/Copy policy and visible
private-detail read acknowledgement. These are focused component regressions,
not actual deployed-app workflow or visual approval evidence. The accepted local
visitor→owner workflow still requires Chrome/Expo and authoritative records after
the separately reviewed local schema update.
