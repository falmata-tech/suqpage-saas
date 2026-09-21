---
id: DEP-035
title: Canonical place selection rollout
status: done
related: [FE-045, BE-038, DEP-034]
owners: [product, backend, operations]
last_updated: 2026-09-21
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
