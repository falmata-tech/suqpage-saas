---
id: BE-038
title: Canonical place anchors for owner locations
status: in_progress
related: [BE-041, FE-045, DEP-035, BE-034]
owners: [product, backend, operations]
last_updated: 2026-09-17
change_level: L3
---

# BE-038 — Canonical place anchors for owner locations

## Problem and contract

Use a bounded static-place search adapter over existing admitted city/town data.
A selected stable place ID is resolved server-side to name, region and coordinates;
browser-provided anchor coordinates are never authority. Add nullable place ID and
anchor latitude/longitude to owner_location_proposals, separate from private-mode
storefront coordinates. Existing area mode retains null storefront latitude/longitude.
Unselected manual locations retain the existing behavior and bounds.

## Scenarios

- GIVEN a valid place ID WHEN the owner saves THEN its canonical anchor is stored
  atomically with versioned tenant-owned location data and reviewed_version resets.
- GIVEN a forged/missing place ID WHEN saving THEN reject without partial edits.
- GIVEN an area-mode selection WHEN saving THEN supplied exact coordinates are
  ignored; only canonical public place coordinates become the saved anchor.
- GIVEN a stale or foreign-owner mutation WHEN saving THEN deny without changes.
- GIVEN an existing proposal WHEN upgrading THEN its values and privacy remain.

## Test plan

Lookup bounds/local-name/duplicate matching, forged-ID, stale/foreign ownership,
SQL save/reload and coarse-map approval regressions. No external network provider.

## Rollout

DEP-035 owns migration 47; historical proposals and published coordinates survive.

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

Current candidate FE-048/BE-041/DEP-038 supersedes staff approval requirements and
adds a simple Product/Service input. Historical evidence above remains scoped to
its release; the new candidate awaits focused verification and visual approval.
