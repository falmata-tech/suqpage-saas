---
id: FE-067
title: Product-only showrooms and made-to-order discovery
status: in_progress
related: [BE-056, DEP-046, FE-044, FE-047, FE-049, FE-052, FE-053, FE-056, FE-065, FE-066]
owners: [product, frontend]
last_updated: 2026-10-17
change_level: L2
---

# FE-067 — Product-only showrooms

## Problem and scope

S112 replaces product/service catalogs with products on web, phone web and native.
Retailers, farms, workshops and manufacturers remain eligible: their catalog
lists tangible products, including products made after an order. Transport chat
and owner support are services provided by Suqpage and remain unchanged.
No checkout, inventory quantities, shipping guarantee or production scheduler is
introduced. Existing social handoffs and selected-product copy remain intact.

## Ready contract and scenarios

- GIVEN a new or edited product WHEN the owner chooses how it is supplied THEN
  offer Ready to ship (`standard_product`) and Made to order (`made_to_order`),
  never Product/Service. Saving/reloading preserves the choice on both clients.
- GIVEN an unavailable/coming-soon product THEN its status must not claim Ready
  to ship. Availability and order type remain independent; ready-to-ship labels
  are merchant declarations, never a verified stock or carrier promise.
- GIVEN retained manufacturing/production-supply records THEN use neutral product
  presentation until an explicit owner choice; do not infer immediate stock.
- GIVEN a retained service WHEN its owner edits it THEN require an explicit
  product supply choice before conversion, preserve the record ID and show a clear
  error retaining input if no choice is supplied. Public visitors cannot see or
  select retired services. Do not automatically rewrite real-tenant descriptions.
- GIVEN the Products panel WHEN Made to order is toggled on THEN show only
  `made_to_order` products; toggling off restores all eligible products. Its
  query/category/country/city filters combine normally and never alter map inputs.
  There is no product/service filter or Services tab. The toggle has a text label,
  selected state, keyboard/touch access and a clear/reset path.
- GIVEN public/owner/admin UI, About and prepared listing/campaign text THEN use
  product-only catalog wording in all five languages, explaining custom products
  in everyday contextual wording. Do not remove references to support/transport
  services, legal service terms or merchant-authored real-tenant text.
- GIVEN product cards/details THEN show useful product supply context without
  implying an unavailable item is ready, preserving source-business links,
  descriptions, media, options and external localized inquiry preparation.

## Test plan and rollout

Focused component/domain/API/PostgreSQL tests cover choice persistence, invalid
legacy service saves, public exclusion, combined filters and reset. Capture
desktop/320/390 web and Expo screens in five languages, owner create/edit/save,
product search/custom toggle and representative showrooms. Native device limits
remain explicit. AGENTS.md visual approval precedes expensive full/release gates.
BE-056 owns data compatibility; DEP-046 owns demo correction and rollout.
Definition of Ready is met. Master sections 2–4,7–8,10–11,13,18,20–22,25 and
prepared launch narrative are affected. No new provider or dependency is needed.

Mapped tests: `scripts/test-product-only-web.ts`, `scripts/test-product-only-native-ui.ts`,
`scripts/test-product-only-catalog.ts`, `scripts/test-simple-demo-seed.ts`,
`scripts/test-business-starters.ts` and `scripts/test-localization.ts`.


### S112 final compact filter layout

GIVEN the product toolbar at320/390px in any supported language WHEN custom
filtering is available THEN all four category/country/city/made-to-order controls
remain wholly inside the viewport, with wrapping words and48px targets instead
of clipped text or horizontal scrolling. Place global Clear in the search row
while keeping query-only clear separate. Retain one compact balanced-width filter row, keyboard
state, individual filter clearing and independent map/product criteria. Verify
actual full cell/label bounds in web and Expo before layout approval.
