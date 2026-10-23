---
id: FE-068
title: Ordered transport plan editor and live requester view
status: ready
related: [FE-069, BE-057, BE-044, FE-019, FE-049, FE-053, FE-062, DEP-047, FE-076]
owners: [product, frontend, mobile, security]
last_updated: 2026-10-17
change_level: L2
---

# FE-068 — Transport plan workspaces

## Problem, outcome and scope

S137 adds a clear ordered journey to existing transport requests on staff web,
requester web/phone and Expo native preview. It preserves the existing visual
theme and task-oriented dashboard. No admin/staff editor is added to mobile.
BE-057 owns authority, schema, safe DTO and capability semantics.

## Scenarios and observable workflows

GIVEN a saved transport plan WHEN authorized staff save a reordered sequence
THEN the requester and open shared page display that saved order automatically.
GIVEN an unsaved editor WHEN Cancel is selected THEN saved content/link/version
remain unchanged. GIVEN another assignee WHEN Save is attempted THEN reject and
retain the editor's draft without overwriting the authorized plan.

1. GIVEN a transport case THEN contextual Conversation / Transport plan links
   retain queue/status/search/page return context. Plan opens a read-first page;
   explicit Edit opens a focused full-width editor, not an accordion or an always
   editable database row. Empty state explains that no plan has been added.
2. GIVEN authorized Edit THEN numbered leg cards provide Provider, Method, From
   and To, Add leg, labelled48px Move up/down/Remove and Save/Cancel. Origin and
   destination use a balanced responsive pair; labels remain visible. No map,
   geocoder, dates or public contact inputs are required. All five transport
   methods are selectable by readable localized words. Boundary move actions
   disable correctly; deletion restores sensible focus. Long names wrap.
3. GIVEN a draft THEN Save publishes the complete validated sequence; Cancel
   leaves exact version/link/content unchanged. Pending Save disables duplicate
   submission. Validation/network/stale errors preserve the draft and explain
   recovery. Navigation uses the existing unsaved-change pattern. Save/Cancel
   returns to the same case/context. Ended cases permit authorized plan editing
   without asking to reopen, join or send a reply.
4. The saved view provides Copy plan link and explicit confirmed Replace link.
   Copy uses the canonical/local trusted origin plus fragment capability; no
   automatic external email/message is sent. Save visibility help is concise:
   these route fields are visible to the requester and people with the link.
   Private legacy handoff contacts remain separately private and unchanged.
5. Existing visitor and owner transport responses gain optional safe plan data.
   Show a compact Transport plan summary/action near the conversation header.
   View plan opens a dedicated read view in the existing screen/dialog, with Back;
   do not crush the transcript beneath twelve expanded cards or nest dialogs.
   On native, this read view hides the chat label and owner account/history
   shortcuts; Back to conversation is its single contextual return action.
   Plan view shows every numbered provider/method/From/To with natural page scroll.
   Existing participant polling refreshes saved data, including while viewing the
   plan after chat ending; viewing the plan never acknowledges unseen chat text.
6. Shared `/transport-plan#capability` opens directly to the same ordered read
   model without login or chat access. Native canonical app links map only this
   exact safe route/capability to the native plan screen. Expo web can read the
   fragment; native internal route parameters never grant session privileges.
   Unknown/credentialed/foreign/malformed URLs fail through existing safe routing.
   No token-bearing telemetry, public search indexing or provider pixels.
7. A visible/active shared page checks conditional updates every5s using BE-057
   bounds; new saved revision updates in place and announces the update politely.
   No overlap, hidden/background polling or delayed old-token overwrites.304 keeps
   the in-memory body without parsing empty JSON. Temporary errors retain last
   good data with honest retry; revoked404 clears it. Focus/online resumes promptly.
8. Public summary counts transport legs, not guessed unique companies. Numbered
   rows are planned stages only: no completion ticks, active/current-provider
   highlight, progress percentage, dates, ETA or scan status. Provider names and
   places stay literal. Interface vocabulary is authored for en/am/om from the
   idea; retain inactive catalogs without enabling them or claiming human review.
9. The privacy notice explains that people receiving a transport-plan link can
   read its route and providers, while the link does not include chat messages
   or account contact details. Keep this factual and localized; no capability
   implementation notes belong in the customer-facing notice.

## Test plan and evidence

`scripts/test-transport-plan-ui.ts`: actual-source staff editor/read view, draft
preservation, keyboard/focus, move boundaries, responsive pairs, methods and states.
`scripts/test-transport-plan-live.ts`: conditional reader/lifecycle races,200/304/
404, timeout/backoff/abort, token-switch denial, pause/resume and single-flight.
`scripts/test-native-transport-plan.ts`: native render/route/read-only/copy and
existing visitor/owner transport response compatibility, private-field absence.
`scripts/test-participant-transport-plan.ts` exercises actual web/native React
read-view/draft/receipt behavior; `scripts/test-transport-plan-localization.ts`
checks active-language actions/methods/stage interpolation. Existing incoming-link,
public launcher and chat/receipt tests remain intact.
Actual installed Chrome later exercises staff/admin Save/Cancel/rename/reorder,
ended-case editing and authoritative DB readback; visitor/owner/share-page paired
updates on1440/390/320 and Expo8082; all three active language layouts and errors.
No uncontrolled customer chats or external sends; labelled local fixtures only.

## Readiness and rollout

Ready: outcome, explicit editor/read separation, theme/accessibility, public-field
privacy,5s conditional updates, literal data, method/count language, role scope
and tests are resolved. Record source, focused tests and local browser evidence,
then explicit AGENTS step8 visual approval before full/release gates. Installed
Android App Links and binary delivery remain a later reviewed build; Expo is not
OS association/push proof. No deployment or existing workflow cancellation.

S138 supersession: BE-058/FE-069/DEP-048 replace chat-bound anonymous plan publication with email-verified independent shipments. Preserve the S137 local implementation/data and evidence; no deployment or visual approval is inferred.
