---
id: FE-022
title: Rich offering and live showroom presentation
status: done
related: [FE-023, BE-021, DEP-018]
owners: [product, frontend]
last_updated: 2026-08-01
change_level: L3
---

# FE-022 - Rich offering and live showroom presentation

## Problem and outcome

Showrooms can explain products and production capabilities, but their product
detail dialog is one hard-coded white layout and their authoring tools cannot
present an optional ETB price, a merchant-defined quantity unit, concise
highlights, a product video, a general process video, or a current live session.

The outcome is a richer inquiry-first showroom. Merchants may add those optional
details, visitors see them in a design-system-native detail presentation, and AI
recipes choose one reviewed detail pattern without supplying executable code.

## Scope

### In scope

- Optional informational ETB price, merchant-defined quantity-unit guidance,
  up to six concise highlights, and one controlled YouTube video per offering.
- One controlled YouTube process video per showroom.
- A merchant-controlled live toggle, supported platform label, and HTTPS link.
- Reviewed product-detail patterns selected by the design recipe and rendered
  from the active showroom token roles.
- Business-specific briefs and published disposable fixtures for all ten
  curated visual benchmark showrooms; FE-023 extends the same complete workflow
  contract to the other 48 scale fixtures.

### Non-goals

- Checkout, payment collection, tax, discounts, inventory, price negotiation,
  unit conversion, livestream hosting, presence detection, or video uploads.
- Treating a displayed price, capacity, highlight, or live state as verified by
  MirtPage.
- Arbitrary iframe markup, arbitrary remote video providers, tenant CSS, or
  tenant-authored components.

## Contracts

- Price is nullable, non-negative, stored in minor ETB units, and displayed as
  informational context only. An offering without a price has no price label.
- Quantity-unit guidance is optional bounded merchant text. Buyer desired
  quantity remains the existing optional free-form inquiry value.
- Highlights are an ordered deduplicated list of zero to six plain-text values,
  each no longer than 80 characters.
- Product and process videos accept only normalized managed YouTube references
  and render through the privacy-enhanced provider adapter with lazy loading.
- A live state requires a supported platform and a valid HTTPS destination. The
  public header shows `Live on: <platform>` only while the toggle is active.
- Product detail patterns are named, machine-readable choices with documented
  anatomy and visual character. Every pattern uses semantic token roles,
  preserves focus trapping and Escape/close behavior, supports no-media and
  video states, and remains usable at 320 CSS pixels.
- The recipe schema describes each pattern by layout, density, media behavior,
  and best-fit content shape rather than by industry.

## Scenarios

```gherkin
Scenario: Visitor reviews a priced capability with video
  GIVEN a published offering has an ETB price, unit guidance, highlights, and video
  WHEN a visitor opens its detail presentation
  THEN the selected reviewed pattern presents those facts without implying checkout
  AND the video uses the controlled privacy-enhanced provider
  AND the offering can still be added to the normal inquiry

Scenario: Business announces a live session
  GIVEN a business enabled a supported live platform and HTTPS destination
  WHEN its showroom is opened
  THEN a compact `Live on` action appears in the designed header
  AND activating it opens the merchant destination in a new browsing context

Scenario: Optional rich data is absent
  GIVEN an offering has no price, unit, highlights, or video
  WHEN its detail presentation opens
  THEN no empty labels or broken media frames appear
  AND the approved no-media treatment and inquiry action remain complete

Scenario: Unsafe provider input is rejected
  GIVEN a merchant submits arbitrary embed markup or an unsupported live URL
  WHEN the update is validated
  THEN the write is rejected without changing the published showroom
```

## Quality impact

- Tenant-scoped product upkeep and publication remain authoritative.
- External links use safe target/rel behavior; embedded video retains current
  CSP and provider restrictions.
- Lists and strings are bounded; video is lazy and no provider SDK is loaded.
- Every modal pattern receives keyboard, focus, overflow, and mobile evidence.
- Fixture facts are clearly disposable demonstration data.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Rich product authoring and tenant scope | integration/security | `scripts/test-product-upkeep.ts` |
| Recipe parsing and detail-pattern metadata | contract | `scripts/test-showroom-recipe.ts`, `scripts/test-showroom-experience.ts` |
| Live and video validation | unit/security | `scripts/test-youtube-provider.ts`, `scripts/test-live-showroom.ts` |
| Detail patterns, focus, CSP, and mobile | production browser | `tests/acceptance/app.spec.ts` |
| Ten brief-driven fixtures and 48 scale fixtures | visual browser | `scripts/capture-showroom-benchmarks.mjs`, `scripts/test-showroom-benchmarks.ts` |

## Rollout and rollback

DEP-018 adds nullable columns and compatible defaults before current forms write
the fields. Rollback may leave additive columns in place while readers ignore
them. Existing published snapshots and offerings remain valid.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related layers identified
- [x] Security and provider boundaries explicit
- [x] Positive and negative scenarios present
- [x] Mobile and no-media states included
- [x] Rollout and rollback defined

## Evidence

Evidence: completed locally on 2026-08-01. The ten authored benchmark showrooms and 48
scale fixtures passed deterministic admission. Twenty desktop/mobile benchmark
pages and their product-detail dialogs passed with zero browser, overflow,
broken-media, focus-boundary, or token-pattern failures; all four detail
patterns exercised controlled Photo/Video switching. Homepage discovery, City
Showroom, Expo, List, 390px, and 320px visual captures also passed. `npm run check`,
all ten production acceptance workflows, and `npm run release` passed. No
production publication or rollout is included.
