---
id: BE-066
title: Reject visitor transport chat and attention
status: in_progress
related: [FE-078, BE-063, BE-018, BE-058]
owners: [backend, security]
last_updated: 2026-11-13
change_level: L2
---

# BE-066 — Business transport authorization

## Problem and contracts

The visitor transport capability is retired. All web public-support channels and guest-attention endpoints, including the
legacy buying alias, and native public transport/buying/attention return410
`public_chat_retired` without reading tokens, parsing chat bodies or writing data.
The public domain start rejects shipment_observation; legacy buying-domain
utilities remain internal history/test compatibility, with no live public adapter. Retained shipment-category guest tokens also fail
the shared domain access guard, including attempts through another channel. Guest transport delivery is suppressed, including retained buying-route
deliveries. Shipment guest attention is denied at enqueue/feed boundaries too.
Authenticated owner-transport APIs keep existing auth, fresh-role and tenant
checks, and do not adopt guest cases. This supersedes visitor transport criteria
in BE-018/BE-063 while retaining their business/staff and provider contracts.

## Scenarios

1. GIVEN no session, a business session or an old visitor token WHEN any public
   transport start/read/message/receipt/callback/close/resume/reset or attention
   request is made THEN return410 and no cookie or persistent side effect.
2. GIVEN a retained visitor transport record WHEN its token is used through a
   buying/legacy public domain path or notification subscription THEN access is
   denied, queued transport push is suppressed and authorized staff history remains.
3. GIVEN current business A WHEN it creates/reads/replies to its own dashboard
   transport THEN existing behavior succeeds; guest, staff-as-client, stale-role
   and business B access are denied without modifying the case.
4. GIVEN unrelated public inquiries, provider interest or verified recipient
   tracking WHEN used THEN their independent authority remains unchanged.

## Test plan

`scripts/test-transport-support.ts` covers retained visitor records, public domain
and web/native negative paths, unchanged history and attention suppression.
`scripts/test-owner-transport.ts` retains owner start/read/reply/receipt/history,
foreign-business and current-role rejection. Callback tests retain business
same-case behavior. Existing generic visitor response/idle tests use the separate
buying category. CI browser acceptance tests real dashboard chat and public410.

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
