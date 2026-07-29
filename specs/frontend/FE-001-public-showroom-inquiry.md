---
id: FE-001
title: Public showroom discovery and inquiry experience
status: done
related: [BE-001, DEP-001, FE-006, FE-008, FE-010, FE-012]
owners: [product, frontend]
last_updated: 2026-07-29
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

The inquiry cart is presented as a scoped floating task surface rather than an
edge-to-edge generic sidebar. Desktop keeps visible breathing room around a
bounded panel. Phone layouts use a near-full-height bottom sheet with safe-area
spacing, an anchored header, and one internally scrolling content region.
Every public showroom also exposes one persistent floating inquiry trigger with
the current selected-item count. It remains available while the visitor scrolls,
without depending on the chosen header anatomy or obscuring primary mobile
content.

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

Scenario: Customer reviews an inquiry on desktop
  GIVEN one or more products are in the inquiry cart
  WHEN the customer opens the inquiry at desktop width
  THEN a bounded floating panel appears above a dimmed showroom with visible outer margins
  AND products, quantity controls, contact fields, and handoff actions remain inside the panel

Scenario: Customer reviews an inquiry on a phone
  GIVEN one or more products are in the inquiry cart
  WHEN the customer opens the inquiry at 320 or 390 CSS pixels
  THEN a bottom-anchored sheet respects safe areas and remains within the viewport
  AND its header stays available while the task content scrolls
  AND every quantity, close, remove, clear, and handoff target has at least a 44-pixel touch block

Scenario: Customer returns to a growing inquiry while browsing
  GIVEN a customer has added products and scrolled away from the showroom header
  WHEN the customer continues through story, process, products, or footer content
  THEN a persistent inquiry trigger remains visible with the current item count
  AND activating it opens the same inquiry without changing scroll position or cart contents
```

## Quality impact

- Merchant values remain exact and products come from dynamic catalog data.
- Mobile has no horizontal overflow and controls remain keyboard accessible.
- Opening the inquiry prevents background-page scrolling without losing the
  cart, and closing it restores page scrolling and opener focus.
- Customer contact is sent only to the inquiry API and not local storage.
- Repeated social actions use a stable idempotency key for the current cart.

## Test plan and evidence

- Browser: `tests/acceptance/app.spec.ts` public, floating inquiry, focus, and
  320/390px mobile-sheet and persistent-trigger scenarios.
- HTTP/security: `scripts/http-smoke.mjs`, `scripts/test-security.ts`.
- Design contract: `scripts/validate-designs.ts`.
- Evidence: `npm run test:acceptance` 10/10 passed on 2026-07-28, including
  bounded desktop geometry, 390px safe-area geometry, scroll lock/restoration,
  focus containment/restoration, 44px mobile controls, persisted inquiry, and
  social/manual handoff. Desktop and mobile open-panel captures are recorded by
  `scripts/capture-showroom-benchmarks.mjs`; `npm run check` passed.

## Rollout and rollback

Renderer/application changes ship together after browser and release gates.
Rollback deploys the previous compatible build; inquiry schema changes require a
verified backup and BE/DEP change plan.
