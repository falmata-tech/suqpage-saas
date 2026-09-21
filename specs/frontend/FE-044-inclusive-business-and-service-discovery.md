---
id: FE-044
title: Inclusive business and service discovery
status: in_progress
related: [BE-037, DEP-034, FE-039, FE-040, FE-041]
owners: [product, frontend]
last_updated: 2026-09-17
change_level: L3
---

# FE-044 — Businesses, products and services

## Problem and scope

The owner wants an accessible digital presence for African businesses, including
growers, makers, traders and service providers. Product-only copy and rigid selling
units exclude service offerings even though the catalog already supports custom
work. Preserve the current map, paginated results, Featured placement, permanent
business identity and direct inquiry experience. This change adds services to the
existing catalog; it does not add checkout or change page publication permissions.
Starter content and simplified Save are separately recorded in checklist S8 while
their disclosure and visibility choices are resolved.

## Scenarios

- GIVEN a product-only business WHEN its page opens THEN it retains a Products
  catalog; a service-only business shows Services and a mixed business shows
  Products & services, with the same linked detail and inquiry interactions.
- GIVEN a service WHEN displayed or edited THEN name, description, media,
  availability, optional price/unit, highlights and options remain usable without
  inventing inventory, a physical selling unit or production requirements.
- GIVEN a visitor WHEN searching or choosing a category THEN services appear in
  the same backend-paginated offering results while the map remains visible.
- GIVEN a visitor WHEN reading Market/About/Featured THEN copy explains finding
  businesses, products and services through maps, search and featured discovery;
  About describes the African mission and current Ethiopia-first catalog without
  claiming complete geographic coverage or guaranteed business outcomes.
- GIVEN existing product links and inquiry selections WHEN service support is
  enabled THEN their IDs, URLs, saved options and canonical authorization remain.

## Test plan

Focused offering presentation and inquiry tests, source-copy checks, typecheck,
then desktop/390/320 captures of product/service/mixed pages and Market/About.
Local visual approval precedes full check/release/browser gates per AGENTS.md.
Existing eight browser workflows are retained with updated copy expectations.

## Rollout

DEP-034 owns additive data compatibility and rollout. No real tenant text or
contact data is overwritten. Public mission text belongs to platform pages.

## Local evidence: 2026-09-17

`test:service-offerings`, `test:place-selection`, existing product-upkeep and
launch-wiring regressions, homepage/narrative/inquiry checks and typecheck pass.
`scripts/capture-service-place.ts` verifies owner-created services, linked service
inquiry, mixed catalogs, service search results, keyboard place selection,
save/reload, area privacy and admin anchor prefilling. Twenty-eight desktop/phone
captures and six owner/About accessibility scans pass in an isolated local schema
with test-issued local sessions. Visual approval, full release gates, scoped commit
and protected persistent/hosted migration remain pending. See
`docs/SUQPAGE-SERVICES-AND-PLACES-REVIEW.md`; no production rollout is claimed.
