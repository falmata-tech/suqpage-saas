---
id: BE-037
title: Service offerings in the canonical catalog
status: done
related: [FE-044, DEP-034, BE-014, BE-034]
owners: [backend, security]
last_updated: 2026-09-21
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
