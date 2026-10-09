---
id: BE-038
title: Canonical place anchors for owner locations
status: done
related: [FE-059, BE-047, BE-041, FE-045, DEP-035, BE-034]
owners: [product, backend, operations]
last_updated: 2026-09-21
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

## Evidence: verified rollout — 2026-09-21

Source `be134a247c8ea54b18b882f9e2368058f7fbc0ee` is published as Netlify `6ab0d349f099639821fa0f9a` at https://suqpage.com.
Full check, release, operations, all nine isolated provider browser scenarios,
artifact privacy and production dependency audit pass. Production schema 47,
64 updated demo pages/256 offerings, all 64 public routes, live search at
1440/390/320, email-only entry, private-route denial, health and www redirects
are independently verified. Mapped focused tests and earlier desktop/phone
reviews remain applicable; the owner approved this release.

Earlier dated pending-approval/local-only notes are superseded by this rollout.
No real external email was sent and no authenticated hosted account was used
for testing; those admission checks remain separate from local provider evidence.
Demo contact destinations are examples, not verified delivery channels.
See docs/SUQPAGE-RELEASE-2026-09-21.md for backup, rollback and limitations.
