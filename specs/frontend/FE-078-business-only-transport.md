---
id: FE-078
title: Business dashboard transport entry only
status: in_progress
related: [BE-066, FE-076, FE-036, FE-049, FE-053]
owners: [frontend, mobile]
last_updated: 2026-11-13
change_level: L2
---

# FE-078 — Business dashboard transport entry only

## Problem and outcome

The owner restricts transport chat to businesses using their dashboard. This
supersedes earlier visitor-launcher requirements in FE-076/FE-036/FE-053.
Affected master sections: 2, 3, 12, 14, 16 and 19.

## Scenarios

1. GIVEN a visitor or signed-in person browses public web/phone/Expo pages WHEN
   Market, About, Featured, showroom, product or tracking renders THEN no public
   transport launcher or “Need Transport?” action appears; `?chat=transport`
   cannot open a transport chat.
2. GIVEN an existing `/buying` native deep link WHEN opened THEN it returns to
   Account without mounting a guest composer or reading a guest transport token.
3. GIVEN a current business client WHEN Transport opens from its dashboard THEN
   the existing provider selection, intake, replies, receipts and callback flow
   remains available within its business; owner return links stay in that task.
4. GIVEN saved product selections WHEN a showroom/product is opened THEN its
   inquiry-list action remains available; public tracking returns to Market
   without resurrecting transport chat.

## Test plan

Component tests cover public shells/docks/About/deep links and retained inquiry
lists. Owner workspace tests cover dashboard access. BE-066 covers authorization.
Actual Chrome desktop1440/phone390 and Expo8082 review covers absence, navigation,
showroom selections and owner regression before full gates. CI acceptance retains
real business dashboard chat and tests retired public HTTP paths.

## Scope and invariants

Only a current authenticated business client may start/read/reply/read-receipt,
close/resume or request a callback for its own transport case through its
business dashboard. Staff retain their existing scoped queue and explicit Join.
SharedTrucks Logistics remains the sole provider; no provider-owned routing,
identity, credentials, schema migration or customer data deletion is introduced.
Public product inquiries, saved inquiry lists, provider-interest forms and the
independently verified shipment-recipient portal retain their existing contracts.
Historical visitor cases remain private staff history; old visitor cookies,
mobile tokens and queued attention deliveries grant no transport access.

## Quality impact

Fresh business/role checks and tenant fences remain authoritative. Denied guest
requests produce no cases, messages, receipts, subscriptions or delivery intent.
Errors contain no case/contact data. Preserve keyboard targets, active-language
labels and showroom inquiry actions on desktop, phone and Expo. Remove obsolete
visitor transport links without replacing them with a public transport composer.

## Rollout and rollback

Deploy code through the protected GitHub/Netlify pipeline. No database or Auth
configuration change is required. Older clients receive a bounded retired error;
retained history is never erased. A source revert can restore the former entry
only after an explicit product decision to restore visitor transport.

## Readiness

Scope, owner instruction, positive/negative scenarios, reciprocal dependencies,
quality effects and test/rollout boundaries are explicit. Implementation may begin.
