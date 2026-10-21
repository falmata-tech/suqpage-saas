---
id: BE-056
title: Product-only catalog authority and custom-order filters
status: in_progress
related: [FE-067, DEP-046, BE-009, BE-014, BE-022, BE-037, BE-039, BE-040, BE-041, BE-044, BE-054]
owners: [backend, security]
last_updated: 2026-10-17
change_level: L2
---

# BE-056 — Product-only catalog authority

## Problem, scope and compatibility

S112 supersedes active service admission in BE-037. Keep historical database enum
values, rows, URLs, revisions and inquiry snapshots readable; do not shrink checks
or delete service data. New active product writes accept `standard_product` and
`made_to_order`. New omitted type defaults to standard_product. Existing legacy
manufacturing/production kinds remain readable and neutral until explicitly
converted. An omitted edit preserves a valid retained product kind, but a retained
service needs an explicit accepted product kind before it can be saved as goods.
No new database column or schema migration is required.

## Observable scenarios and invariants

- GIVEN an authorized product save WHEN a supply choice is valid THEN it persists
  through create/update/publication/web/native reads under the existing tenant,
  version, idempotency, media and metadata guards. Reject service/unknown active
  writes before mutations; stale/foreign edits remain denied.
- GIVEN public catalogs/discovery/detail/social selections THEN exclude service
  rows consistently from rows, totals, eligibility, location/category metadata,
  normal/fuzzy candidates and by-ID reads. Owners/admin can inspect retained
  records privately. No service record becomes a physical product automatically.
- GIVEN `madeToOrder=true` in product scope THEN apply `offering_kind='made_to_order'`
  before paging/counting/approximate admission; false/absent means all eligible
  non-service products. Validate bounded boolean syntax. The business map keeps
  independent criteria; no per-agent/chat/transport behavior changes.
- GIVEN legacy `offeringType=products` THEN retain all-products compatibility;
  `offeringType=services` must explicitly fail or return zero, never silently
  broaden to all products. Cache identities must distinguish the new predicate
  from previous default results, including both web and native adapters.
- GIVEN result DTOs THEN provide bounded typed kind/availability information for
  honest labels; no private account/contact or stock authority is added.
- GIVEN retained historical inquiry/revision reads THEN keep old kinds/IDs and
  snapshots unchanged. Public publication paths cannot introduce new services.

## Test plan and readiness

Add focused product-only domain and isolated PostgreSQL tests for both active
choices, history preservation, legacy edit rejection/conversion, all public
projections/metadata/count/fuzzy filters, old URL behavior and API validation.
Retain existing negative tenant/version/idempotency/media tests. Ready: outcomes,
legacy policy, privacy, test fixtures and rollback are explicit; no open product
decision affects implementation. Existing master current behavior is superseded
only after mapped local evidence; deployed readers remain unchanged until rollout.

Mapped tests: `scripts/test-product-only-catalog.ts`,
`scripts/test-service-offerings.ts`, `scripts/test-independent-discovery.ts` and
`scripts/test-mobile-api.ts`; retain upkeep/media/tenant regressions.

## Rollout and rollback

DEP-046 controls local demo correction and future publication. Code rollback
retains all database kinds/history, with no destructive migration. Actual visual
approval and full gates remain required before a separately authorized release.
