---
id: DEP-034
title: Additive service offering rollout
status: in_progress
related: [DEP-035, FE-044, BE-037, DEP-012, DEP-030]
owners: [operations, security]
last_updated: 2026-09-17
change_level: L3
---

# DEP-034 — Service offering rollout

## Problem and scope

Admit services without rebuilding tenant catalogs or changing published IDs.
Migration 46 expands the catalog/inquiry offering-kind constraints; fresh native
installation and upgrade must agree. Current demo businesses remain intact.
Any demo service reclassification uses explicit reviewed fixture IDs/names and
never rewrites real merchant content or old inquiry snapshots.

## Scenarios

- GIVEN a protected backup WHEN upgrading a version-45 schema THEN existing row
  data is preserved and a new service can be saved and inquired about.
- GIVEN a fresh schema WHEN installed THEN it admits the same offering kinds.
- GIVEN failed validation or migration WHEN deploying THEN no partial schema or
  public-data correction is reported as successful.

## Test plan

Focused PostgreSQL compatibility/security tests and desktop/phone evidence first.
After visual approval, full check, release, real provider browser acceptance,
artifact privacy and monitored deployment. Keep hosted Auth configuration intact.

## Rollout and rollback

Back up and rehearse before hosted migration. Retain the expanded constraint on
code rollback; do not delete service records or shrink constraints around live
services. Older application readers may normalize unknown kinds, so rollback must
be reviewed against any services created after release. Prior source/data recovery
points and exact targets are recorded before a hosted write.

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
