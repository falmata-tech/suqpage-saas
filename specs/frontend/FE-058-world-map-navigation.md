---
id: FE-058
title: Free exploration of the world map
status: in_progress
related: [FE-021, BE-041, FE-030, FE-053, DEP-042, ADR-0016, ADR-0023]
owners: [product, frontend]
last_updated: 2026-10-07
change_level: L1
---

# FE-058 — Free exploration of the world map

## Problem and scope

The web map's Ethiopia bounds prevent exploration of other countries. Remove
national pan limits on web, mobile web, native MapLibre and Expo browser maps.
Keep Ethiopia as the initial/reset view, existing filters, catalogs, map markers,
inquiry flows and tile policy. The zoom range becomes 1–19 on all adapters.
This is viewport navigation, not a new country/address dataset, international
merchant onboarding expansion or change to database access/filter contracts.

## Scenarios

- GIVEN the default map WHEN loaded/reset THEN it opens over Ethiopia as before.
- GIVEN a visitor WHEN panning to Africa, the Middle East or another continent
  THEN no Ethiopia boundary pulls the map back and the viewport remains usable.
- GIVEN a visitor WHEN zooming out THEN global exploration is allowed to zoom 1;
  zoom-in remains limited to the tile provider's supported zoom 19.
- GIVEN active filters, product results and selection WHEN exploring another
  country and returning THEN filter state and authoritative results are retained.
- GIVEN map initialization/data waits THEN existing themed loading feedback appears
  without hiding interactive filter controls, and disappears on readiness/error.

## Quality and architecture

Area-mode visual offsets use world projection bounds instead of national clamps,
so a city anchor outside Ethiopia remains near its city; saved coordinates never
change. No API/DB/schema or tenant permission changes: existing coordinates stay as saved.
Reuse OSM/MapLibre with attribution, public-only tile requests and no bulk/offline
downloads. World-copy handling prevents lost markers after crossing 180 degrees.
Keep bounded cluster queries; normalize viewport longitude for wrapped worlds.
Localization remains unchanged because initial country filters are unchanged.
Existing S71–S77 work and approval gates remain active.

## Test plan

`scripts/test-mobile-map.ts` verifies zoom/coordinate/adapter parity and provider
policy; `scripts/capture-world-map.mjs` verifies distant viewport, reset and
retained filters on desktop/phone and Expo with real rendered map states.
`scripts/test-discovery.ts` also verifies bounded terminal markers use the shared
wrap-aware projection, including world copies and off-screen exclusion.
Types plus focused tests/captures precede visual approval. No full/release gate
before approval. Master §§7/15/18/19 map behavior affected.

## Rollout

Web and native JavaScript update only. No migration/provider change. Keep start
and reset centered on current catalog; do not claim new country data coverage.
Rollback restores viewport limits without deleting any catalog/location data.
Native APK publication remains a separate DEP-042 rollout.
