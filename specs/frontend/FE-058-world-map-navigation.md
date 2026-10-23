---
id: FE-058
title: Free exploration of the world map
status: in_progress
related: [FE-021, BE-041, FE-030, FE-053, DEP-042, ADR-0016, ADR-0023, BE-023]
owners: [product, frontend]
last_updated: 2026-10-22
change_level: L1
---

# FE-058 — Free exploration of the world map

## S160 — canonical city-area pins and count groups (in progress)

FE-021 S160 owns city-only map eligibility and count-circle behavior. A final
marker representing one city-only business uses the shop glyph at its selected
canonical city, never a numbered **1** circle or a one-member zoom-only
aggregate. If that point would overlap another marker at a broad scale, combine
it into a real multi-business count until the map separates them. Count circles
represent two or more businesses; a singleton left by a bounded screen
partition uses the shop glyph without a count. Never
displace an area business to an invented sub-city coordinate; keep
`locationMode: area` through the shared web/native projection as internal state;
marker names and group previews show the business and city, without internal
location-mode terminology. Existing world bounds,
screen-sized final groups, zoom policy and exact storefront positions remain.
Regress area/exact scope parity and business reachability on web and Expo.

Focused S160 evidence: the shared map model and actual Chrome desktop, phone web,
and Expo preview show a sole filtered city-area business as a shop glyph at the
canonical city anchor and open its business preview directly. No single-business
marker renders a count of 1. At a broad scale where
the pin would overlap another marker, it participates in a count for two or more
businesses until the map separates them. See FE-021 and
`.local/s160-city-area-map-review/singleton-review.html`. Visual approval and
full checks remain pending.

## S154 — city and district camera bounds (implemented locally; physical/visual review pending)

The newest owner explicitly permits bounded display-only group spacing. FE-021's
city-scale policy supersedes the18/17 interaction limit below: expose fitting
terminal groups at normalized12/native11, retain a dense overflow aggregate for
one additional district step, and stop all interaction/restored/programmatic
cameras at normalized13/native12. Global zoom-out remains1, initial/reset Ethiopia
and provider tile capability19 stay unchanged. A final circle opens its current
admitted previews without moving the camera. Aggregate expansion stops at city12
when its terminal layout fits instead of obeying a needlessly higher raw source
expansion. Count-circle glyphs may use reviewed5km/exceptional10km display-spacing
bounds; these are visual hit-target positions only. A city-only business remains
anchored to its canonical city and does not receive an invented sub-city point.
Individual exact pins, saved/public coordinates and detail/directions authority
never move. This is a UI/model-only correction, not a provider or data migration.
The shared model, native controller and actual installed web/Expo Leaflet camera
tests qualify the new bounds locally; FE-021 records their mapped contracts.
Physical MapLibre and user visual review remain pending.

S140 latest owner correction: FE-021 S140 supersedes the maximum-only preview
guard below. Already-separated terminal groups open all admitted previews at
their current camera. Only true outer aggregates click to zoom further. Saved
keys must still be represented as terminal groups in the current hierarchy;
membership, screen capacity and the maximum zoom remain unchanged.

## S127 — screen-sized fixed groups (ready; latest owner direction)

FE-021 S127 controls the shared modal capacity (up to6 desktop/3 phone, reduced
for height/font scale), compact nearby partitions and current-member validation.
Every separated final circle opens all members at once: no list scrolling, Next/Previous or
connecting lines. Normal outer clusters merge on zoom-out and click to zoom in;
already-exposed final all-fit groups open without any additional camera move.
Restored state cannot expose a subgroup hidden inside a current aggregate. Screen-capacity or eligible
data/filter changes may repartition final groups. Preserve existing coordinates/provider/API cap, current-row authority,
short-stage48px controls, focus/camera return and native-authored labels. Native
and Expo use the same capacity policy with their actual safe-area dimensions.
Do not use legacy server nearbyGroups as current visual membership authority.
Current implementation/testing is in progress; earlier global-three/leader/paging
evidence is superseded, not approval. Full/visual/release/rollout gates stay open.

## Problem and scope

The web map's Ethiopia bounds prevent exploration of other countries. Remove
national pan limits on web, mobile web, native MapLibre and Expo browser maps.
Keep Ethiopia as the initial/reset view, existing filters, catalogs, map markers,
inquiry flows and tile policy. Interaction zoom is 1–18 on Leaflet and raw 1–17
on native MapLibre. MapLibre clustering normalizes raw zoom plus one, giving the
same final 256-pixel-world scale. Provider source capability remains 19.
This is viewport navigation, not a new country/address dataset, international
merchant onboarding expansion or change to database access/filter contracts.

## Scenarios

- GIVEN the default map WHEN loaded/reset THEN it opens over Ethiopia as before.
- GIVEN a visitor WHEN panning to Africa, the Middle East or another continent
  THEN no Ethiopia boundary pulls the map back and the viewport remains usable.
- GIVEN a visitor WHEN zooming out THEN global exploration is allowed to zoom 1;
  zoom-in stops at Leaflet 18 or native MapLibre 17, including gesture, restored
  view and programmatic controls, independently of provider capability 19.
- GIVEN dense or coincident businesses WHEN maximum zoom is reached THEN they
  remain a numbered group and its picker opens without further zoom or moving
  the map; all screen-admitted cards keep all current represented businesses reachable.
- GIVEN active filters, product results and selection WHEN exploring another
  country and returning THEN filter state and authoritative results are retained.
- GIVEN map initialization/data waits THEN existing themed loading feedback appears
  without hiding interactive filter controls, and disappears on readiness/error.

## Quality and architecture

City-only locations use their selected canonical city anchor, and group glyph
spacing uses world projection bounds instead of national clamps, so a city anchor
outside Ethiopia remains near its city. No saved coordinates change. No
database/schema or tenant permission change is expected.
Reuse OSM/MapLibre with attribution, public-only tile requests and no bulk/offline
downloads. World-copy handling prevents lost markers after crossing 180 degrees.
Keep bounded cluster queries; normalize viewport longitude for wrapped worlds.
Initial country filters remain unchanged; new picker labels follow FE-021 S127
localization without translating merchant names.
Existing S71–S77 work and approval gates remain active.

## Test plan

`scripts/test-mobile-map.ts` verifies zoom/coordinate/adapter parity and provider
policy; `scripts/capture-world-map.mjs` verifies distant viewport, reset and
retained filters on desktop/phone and Expo with real rendered map states.
`scripts/test-map-clustering.ts` covers normalized scale, terminal grouping,
wrapped/dateline visibility, exact membership and adaptive capacity.
`scripts/test-map-group-picker-web.ts`, `scripts/test-mobile-map-groups.ts` and
`scripts/test-mobile-market-layout.ts` cover current picker/adapter interactions;
`scripts/test-web-map-lifecycle.ts` exercises real Leaflet reprojection/focus.
`scripts/test-discovery.ts` retains legacy backend grouping/eligibility coverage.
Types plus focused tests/captures precede visual approval. No full/release gate
before approval. Master §§7/15/18/19 map behavior affected.

## Rollout

Web and native JavaScript update only. No migration/provider change. Keep start
and reset centered on current catalog; do not claim new country data coverage.
Rollback restores viewport limits without deleting any catalog/location data.
Native APK publication remains a separate DEP-042 rollout.
