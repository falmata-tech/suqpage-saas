---
id: FE-001
title: Public showroom discovery and inquiry experience
status: done
related: [BE-001, DEP-001, FE-006, FE-008, FE-010, FE-012, FE-016]
owners: [product, frontend]
last_updated: 2026-08-01
change_level: L2
---

# FE-001 — Public showroom discovery and inquiry experience

## Problem and outcome

Customers need to discover a seller, select exact catalog options, preserve a
shortlist, and either prepare one clear inquiry message without identity fields
or send the structured inquiry into the business's SuqPage inbox with a usable
phone number for a reply.

## Scope and non-goals

Includes intentional directory discovery, distinct composed showrooms, product
search, option selection, cart persistence, optional free-form desired quantity,
copy-first message preparation, configured WhatsApp/Telegram handoff, and a
phone-required `Send inquiry` action that saves to the tenant's SuqPage inbox.
Excludes payment, checkout, pricing guarantees, variant-combination inventory,
automatic fulfillment, native share menus, TikTok handoff, and mandatory
identity/contact/note capture for copy or social-app handoff.

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
Scenario: Customer copies an inquiry without personal details
  GIVEN an active showroom with an available published product
  WHEN the customer selects required product options and activates Copy inquiry
  THEN the exact inquiry message is copied without requesting name, contact, or a note
  AND the copied text remains visibly available as a reference
  AND no dashboard inquiry is fabricated without a customer reply path

Scenario: Customer describes quantity in useful units
  GIVEN an offering is in the inquiry
  WHEN the customer enters "1 ton", "500 g", or another bounded quantity description
  THEN the exact text appears in the prepared inquiry
  AND the field does not force a unitless integer

Scenario: Clipboard access is unavailable
  GIVEN a prepared inquiry
  WHEN modern clipboard access is unavailable or denied
  THEN the complete message remains visible and selectable
  AND the cart is not lost

Scenario: Configured direct handoff
  GIVEN the showroom has a configured WhatsApp number or Telegram username
  WHEN the customer reviews the prepared inquiry
  THEN only the configured WhatsApp and Telegram handoff actions are shown
  AND Copy inquiry remains available without requiring personal details

Scenario: Customer sends through SuqPage
  GIVEN one or more inquiry-eligible offerings are selected
  WHEN the customer enters a usable phone number and activates Send inquiry
  THEN the structured inquiry is saved to that business's Customer inquiries inbox
  AND the customer sees a clear sent state
  AND no unrelated tenant receives the inquiry

Scenario: Platform delivery requires a phone
  GIVEN one or more inquiry-eligible offerings are selected
  WHEN the customer omits or enters an invalid phone number
  THEN Send inquiry does not create a dashboard row
  AND copy, WhatsApp, and Telegram preparation remain available without personal details

Scenario: Draft showroom is requested publicly
  GIVEN a business whose status is draft or suspended
  WHEN a visitor requests its public handle
  THEN no showroom catalog is disclosed

Scenario: Customer reviews an inquiry on desktop
  GIVEN one or more products are in the inquiry cart
  WHEN the customer opens the inquiry at desktop width
  THEN a bounded floating panel appears above a dimmed showroom with visible outer margins
  AND products, optional quantity inputs, copy, and configured handoff actions remain inside the panel

Scenario: Customer reviews an inquiry on a phone
  GIVEN one or more products are in the inquiry cart
  WHEN the customer opens the inquiry at 320 or 390 CSS pixels
  THEN a bottom-anchored sheet respects safe areas and remains within the viewport
  AND its header stays available while the task content scrolls
  AND every quantity, close, remove, clear, copy, and handoff target has at least a 44-pixel touch block

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
- Desired quantity is an optional single-line text value of at most 80
  characters so visitors may include units, packs, pallets, ranges, or another
  concise production quantity description.
- Copy and social-app message preparation store no customer identity or contact
  data. Direct SuqPage delivery stores the submitted phone only in the
  canonical tenant-scoped inquiry.
- Copy/share preparation is not represented as delivery and does not create a
  canonical dashboard inquiry without an explicit customer reply path.
- Modern clipboard access has a legacy-copy and visible selectable-text fallback.

## Test plan and evidence

- Browser: `tests/acceptance/app.spec.ts` public, floating inquiry, direct
  SuqPage delivery, owner inbox, focus, and 320/390px mobile-sheet and
  persistent-trigger scenarios.
- HTTP/security: `scripts/http-smoke.mjs`, `scripts/test-security.ts`.
- Design contract: `scripts/validate-designs.ts`.
- Evidence: `npm run test:acceptance` passed 10/10 on 2026-07-29, including
  contact-free copy preparation, primary copy, visible copied reference, no
  fabricated dashboard row from copy, configured WhatsApp/Telegram filtering, optional
  free-form quantities including `1 ton` and `250 kg`, bounded desktop
  geometry, 390px safe-area geometry, scroll/focus
  restoration, and 44px mobile controls. `npm run test:visual-benchmarks`
  recorded desktop/mobile copied-message panels among 56 zero-failure captures.
  `npm run check` and `npm run release` passed with zero production
  vulnerabilities.

The phone-required direct-delivery revision passed on 2026-08-01. Typecheck,
production build, security integration, production HTTP smoke, and 10/10
browser acceptance passed. Browser evidence covers malformed-phone rejection
without a row, normalized phone persistence, the sent state, mobile controls,
and visibility in the correct client inquiry inbox.

## Rollout and rollback

Renderer/application changes ship together after browser and release gates.
Rollback deploys the previous compatible build. Additive migration 19 may
remain in place because it preserves the legacy numeric quantity column.
