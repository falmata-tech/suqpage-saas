---
id: BE-037
title: Service offerings in the canonical catalog
status: in_progress
related: [FE-044, DEP-034, BE-014, BE-034]
owners: [backend, security]
last_updated: 2026-09-17
change_level: L3
---

# BE-037 — Service offering compatibility

## Problem and contract

Add `service` to the existing offering-kind contract and PostgreSQL constraints.
Keep the `products` transport/table, tenant IDs, item IDs, URLs, optional quantity,
canonical inquiry snapshots and existing four kinds unchanged. Service duration,
scope or package options use the existing bounded merchant-defined fields.
No booking calendar, checkout, payment or order lifecycle is introduced here.

## Scenarios

- GIVEN an authorized tenant editor WHEN saving a service THEN its kind survives
  persistence, catalog loading and inquiry snapshotting; foreign tenant edits fail.
- GIVEN old products and snapshots WHEN upgraded THEN their kinds, merchant facts,
  options and historical inquiries remain unchanged.
- GIVEN an unknown kind WHEN saving THEN validation rejects it; `service` is valid.
- GIVEN an unavailable or hidden service WHEN inquired about THEN the same
  canonical availability, tenant and publication rules deny the request.
- GIVEN a migration rerun WHEN the service constraint is already installed THEN
  it is idempotent and no existing data is rewritten.

## Test plan

Focused parser/presentation/upkeep/inquiry regression tests plus isolated native
PostgreSQL fresh-install and version-45 upgrade tests. Verify constraints accept
services and reject invalid kinds while preserving existing row identities.

## Rollout

DEP-034 controls migration 46 and rollback compatibility. Runtime data remains
server-only. Customer contact values never enter logs or public projections.

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
