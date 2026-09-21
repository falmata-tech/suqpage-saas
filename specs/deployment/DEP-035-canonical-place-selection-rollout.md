---
id: DEP-035
title: Canonical place selection rollout
status: in_progress
related: [FE-045, BE-038, DEP-034]
owners: [product, backend, operations]
last_updated: 2026-09-17
change_level: L3
---

# DEP-035 — Canonical place selection rollout

## Problem and scope

Add nullable canonical place anchors after migration 46 without rewriting any
business or location. Derive the compact index from committed OSM city/town points
and admitted region polygons; retain source attribution. Search sends no location
or customer data to an external geocoder. No new provider configuration is needed.

## Scenarios

- GIVEN migration 46 data WHEN migration 47 runs THEN prior proposals stay intact
  and selected public place anchors can be stored independently of storefront pins.
- GIVEN a repeat migration WHEN applied THEN no rows or identities are changed.

## Test plan

Fresh/upgrade PostgreSQL compatibility, focused owner/admin browser verification,
then visual approval, release gates, protected backup/rehearsal and monitored rollout.

## Rollout and rollback

Keep the new nullable fields on code rollback. Prior code ignores place anchors
and keeps manual approval behavior; no destructive reverse migration or Auth writes.

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

## Persistent local update — verified 2026-09-17

Owner-authorized local migrations 46/47 completed after a protected archive and
full restore/fingerprint rehearsal. All 3,401 retained application rows remain
unchanged; repeat migration is a no-op. Rollback-only writes on the upgraded
database verify starter signup, page save, service edit/inquiry and canonical
place persistence. Port 3102 is healthy. See docs/SUQPAGE-LOCAL-SCHEMA-47.md.
Prior pending-local-migration notes are superseded; hosted rollout, full release
gates, scoped commit and visual approval remain pending.
