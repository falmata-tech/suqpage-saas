---
id: FE-001
title: Public showroom discovery and inquiry experience
status: done
related: [BE-001, DEP-001, FE-006, FE-008]
owners: [product, frontend]
last_updated: 2026-07-24
change_level: L2
---

# FE-001 — Public showroom discovery and inquiry experience

## Problem and outcome

Customers need to discover a seller, select exact catalog options, preserve a
shortlist, and send one structured inquiry without checkout or dependence on a
social app successfully opening.

## Scope and non-goals

Includes intentional directory discovery, four distinct composed showrooms, product search,
option selection, cart persistence, minimal contact capture, saved inquiry, and
social/native/manual fallback. Excludes payment, checkout, pricing guarantees,
variant-combination inventory, and automatic fulfillment.

## Scenarios

```gherkin
Scenario: Customer saves an inquiry before social handoff
  GIVEN an active showroom with an available published product
  WHEN the customer selects required options and submits valid contact details
  THEN SuqPage persists the canonical inquiry
  AND offers the selected social or share continuation

Scenario: External sharing is unavailable
  GIVEN a valid saved inquiry
  WHEN clipboard, native share, or a business contact is unavailable
  THEN the complete message remains visible and selectable
  AND the cart is not lost

Scenario: Draft showroom is requested publicly
  GIVEN a business whose status is draft or suspended
  WHEN a visitor requests its public handle
  THEN no showroom catalog is disclosed
```

## Quality impact

- Merchant values remain exact and products come from dynamic catalog data.
- Mobile has no horizontal overflow and controls remain keyboard accessible.
- Customer contact is sent only to the inquiry API and not local storage.
- Repeated social actions use a stable idempotency key for the current cart.

## Test plan and evidence

- Browser: `tests/acceptance/app.spec.ts` public and mobile scenarios.
- HTTP/security: `scripts/http-smoke.mjs`, `scripts/test-security.ts`.
- Design contract: `scripts/validate-designs.ts`.
- Evidence: `npm run test:acceptance` 5 passed; `npm run release` passed on
  2026-07-20.

## Rollout and rollback

Renderer/application changes ship together after browser and release gates.
Rollback deploys the previous compatible build; inquiry schema changes require a
verified backup and BE/DEP change plan.
