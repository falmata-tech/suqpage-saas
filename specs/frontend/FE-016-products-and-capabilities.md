---
id: FE-016
title: Unified products and capabilities experience
status: done
related: [FE-001, FE-007, FE-008, FE-014, BE-014, DEP-011, DEP-012]
owners: [product, frontend]
last_updated: 2026-07-29
change_level: L3
---

# FE-016 — Unified products and capabilities experience

## Problem and outcome

Manufacturers, growers, producers, and artisans do not always offer a fixed
item with a known available quantity. Many need to present made-to-order work,
production capacity, or a repeatable manufacturing capability without
pretending that one unit is in stock.

The outcome is one clear **Products & Capabilities** experience. A showroom can
mix standard products, made-to-order products, manufacturing capabilities, and
production supply. Every offering can enter the same inquiry bag, while desired
quantity is always optional free-form buyer context.

## Scope

### In scope

- Offering-kind, optional desired quantity, capacity, minimum-order, and lead-time
  controls in basic client/staff upkeep and staff recipe/revision workflows.
- Product cards and details that distinguish product and capability facts.
- Optional desired quantity for capability-style inquiry lines.
- Intake wording that asks what the business makes, grows, supplies, or can
  manufacture and captures useful capacity/MOQ/lead-time context.
- Public and workspace terminology that uses **Products & Capabilities** or
  **offerings** without exposing compatibility implementation names.
- Platform hero copy welcoming independent through established producers.

### Non-goals

- Prices, checkout, stock reservation, logistics, purchase orders, RFQ
  negotiation, unit conversion, or production scheduling.
- Verifying a merchant's capacity, certification, MOQ, or lead-time claims.
- Removing the compatible `products` database table or current recipe key.
- Replacing category navigation with a separate capability taxonomy.

## Domain language and invariants

- **Offering** is the umbrella term for a standard product, made-to-order
  product, manufacturing capability, or production supply.
- **Products & Capabilities** is the public section label.
- **Desired quantity** is optional buyer intent, not inventory. A visitor may
  enter a concise value with units or packaging such as `1 g`, `1 ton`, `500
  units`, or `two pallets`, or leave it open for discussion.
- Capacity, minimum order, and lead time are bounded merchant-authored text,
  not calculated or verified platform promises.
- Existing availability values remain canonical but receive context-appropriate
  public labels such as **Accepting inquiries** for capabilities.

## Contracts

- The offering editor exposes kind, capacity, minimum order, and lead time with
  examples and no stock-count or required-quantity control.
- Current authoring writes optional quantity behavior for every offering.
  Retained `required` values remain readable compatibility input but are
  normalized to optional behavior rather than blocking a visitor.
- Cards preserve a stable media frame, bounded facts, and one **Add to inquiry**
  action. Missing media keeps the approved intentional fallback.
- The inquiry drawer keeps optional quantity blank by default, accepts one
  bounded single-line text value up to 80 characters, and never inserts a fake
  quantity or unit into the customer summary.
- Public labels and statuses remain readable at 320 pixels and do not rely on
  color alone.
- Intake allows attached references but does not require final photography or a
  predetermined number of products/capabilities.

## Scenarios

```gherkin
Scenario: Manufacturer presents a capability
  GIVEN a manufacturer can fabricate custom stainless enclosures
  WHEN the offering is configured as a manufacturing capability with optional quantity
  THEN its card presents capability, capacity, MOQ, and lead-time facts
  AND a visitor can add it to an inquiry without inventing a unit count

Scenario: Buyer provides desired quantity
  GIVEN an optional-quantity capability is in the inquiry bag
  WHEN the buyer enters "1 ton" or another bounded quantity description
  THEN the inquiry summary and submitted line retain the exact normalized text

Scenario: Standard product keeps quantity optional
  GIVEN a standard product is available for inquiry
  WHEN a visitor adds it to the inquiry bag
  THEN it starts with no desired quantity
  AND the visitor may add a bounded quantity or leave it open for discussion

Scenario: Offering editor rejects unsupported data
  GIVEN a client can maintain one offering
  WHEN they submit an unknown kind, quantity policy, or overlong production fact
  THEN the update is rejected without changing the live showroom
```

## Quality impact

- Security and tenant isolation: existing tenant-scoped upkeep, recipe, media,
  and inquiry authorization remains authoritative.
- Privacy and data retention: offering facts and inquiry quantities use current
  retention; no complete payload enters logs.
- Accessibility and responsive behavior: labels, status text, optional fields,
  drawer controls, and 320-pixel layout receive browser evidence.
- Localization and merchant-entered values: merchant text remains exact;
  interface labels can localize separately.
- Performance and limits: no new unbounded collections; fact text and inquiry
  quantities are bounded.
- Failure recovery and idempotency: existing retained publication and inquiry
  idempotency apply to the expanded contract.

## Observability

Record offering kind, optional-quantity presence, command kind, business/product
IDs, result, and conflict without logging descriptions, capacity claims,
customer notes, or full inquiry payloads.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Mixed offering cards and inquiry behavior | production browser | `tests/acceptance/app.spec.ts` |
| Mobile editor and drawer behavior | production browser | `tests/acceptance/app.spec.ts` |
| Basic upkeep allowlist and validation | integration/security | `scripts/test-product-upkeep.ts` |
| Recipe and revision authoring | contract/integration | `scripts/test-showroom-recipe.ts`, `scripts/test-revisions.ts` |
| Visual quality across seeded showrooms | visual browser | `scripts/test-showroom-visual-benchmarks.ts` |

## Rollout and rollback

DEP-012 adds compatible defaults and quantity-intent storage before current UI
writes expanded fields. Rollback may retain additive offering and
`quantity_intent` columns because the legacy numeric field remains available.
Published snapshots remain recoverable.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Evidence

Evidence: verified locally on 2026-07-29.

- `components/ProductForm.tsx`, `components/ProductUpkeepList.tsx`,
  `components/RevisionEditor.tsx`, `components/ClientRequestForm.tsx`, and
  `components/showroom/**` implement current offering authoring, factual
  production fields, mixed cards/details, text-first no-media detail, contextual
  availability, and optional desired quantity.
- `tests/acceptance/app.spec.ts` passed all 10 production-browser workflows,
  including blank-by-default and unit-bearing mobile quantity, exact
  copied-message inclusion, client/staff offering upkeep, intake, and no
  horizontal overflow.
- `npm run test:visual-benchmarks` produced 56 desktop/mobile captures with zero
  automated visual failures. Focused Chromium review covered the homepage,
  Addis Metalworks catalog, capability detail, and inquiry drawer.
- `npm run check` and `npm run release` passed; the release dependency audit
  reported zero vulnerabilities.
