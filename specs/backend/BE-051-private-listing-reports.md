---
id: BE-051
title: Private listing reports and discovery exclusions
status: in_progress
related: [FE-063, DEP-044, BE-044]
owners: [backend, security, operations]
last_updated: 2026-10-09
change_level: L2
---

# BE-051 — Private listing reports and discovery exclusions

## Problem and contracts

Reporting public content must reach actual staff without exposing a reporter to
the reported business. Blocking must not create gaps or incorrect search counts.
Use explicit pure command contracts and a server-only PostgreSQL adapter.

Reports store only canonical public target IDs/name/handle, bounded reason/details,
random receipt, salted request/payload/IP hashes, status/version/assignment and
timestamps. No user-supplied tenant authority or raw IP. Migration 63 adds private
content_reports with RLS and no anon/authenticated grants; server runtime roles
receive only required access. Business/product FKs prevent orphaned authority.

Public web/native POST accepts businessId, optional productId, reason, details and
idempotencyKey. JSON is bounded; unsupported fields/invalid IDs/nonpublic targets
are rejected. Per-IP rate limit applies after duplicate verification. Concurrent
same-key retry returns the same receipt; changed payload is a conflict. Public
responses contain only receipt/duplicate, never report body or staff assignment.

Support agents and existing operations/admin can read reports; only support/all
queue staff are eligible assignees. Claim/assignment and decisions use row locks,
fresh server actor authority and expectedVersion. Clients/transport agents are
denied. Resolve requires reported content actually removed/unpublished/suspended;
Dismiss records a no-violation decision. Existing admin listing controls perform
removal; reporting never grants general business-edit rights to support staff.

Discovery accepts at most 100 distinct positive safe integer excluded business
IDs. Apply the same parameterized exclusion to map, literal product results,
suggestions and fuzzy candidate selection before LIMIT/count/pagination. This is
a visitor preference, not access control or SQL text. Empty exclusions preserve
the prior wire/query behavior. Cached public web projections must vary by exclusion
set; private owner data is never included. Direct public visibility is enforced by
client preferences; preferences do not make public data confidential.

## Scenarios

GIVEN concurrent identical valid reports WHEN saved THEN one record/receipt exists.
GIVEN another tenant's product or unpublished target WHEN reported THEN reject
without disclosing private content. GIVEN changed replay payload THEN reject 409.
GIVEN business owner or transport agent WHEN reading/updating reports THEN deny
without exposing report details. GIVEN stale status/assignment version THEN reject
without clobbering staff work. GIVEN visible content WHEN marking removed THEN
reject until actual catalog visibility changes.
GIVEN excluded businesses with exact/fuzzy matches WHEN search runs THEN exclusion
is applied before bounded candidate probes and page/count calculations.
GIVEN empty exclusions or unrelated tenants WHEN operations run THEN previous
discovery and tenant content are preserved.

## Quality and observability

No raw report details/IP/contact data in general logs. Expected errors are safe
typed errors. Store receipts and aggregate queue counts only in diagnostics.
Anonymous report delivery is not chat/email success. Preference lists have bounded
storage/query size; no provider, SDK or managed search dependency is introduced.
No account is deleted or business automatically suspended by this feature.

## Test plan

scripts/test-catalog-safety.ts: parsers, real isolated PostgreSQL, replay/concurrency,
target privacy, role/assignment/stale transitions, migration idempotency/private
grants and real search/fuzzy/count/page traversal. Existing discovery/mobile/staff
permission suites remain required. HTTP/UI acceptance capture proves persisted
receipt, blocked direct/navigation/discovery and actual staff handling.

## Rollout and readiness

Definition of Ready met: fields/roles/errors/layer contracts and regression evidence
are explicit. Additive migration 63; compatible web/API precedes native release.
Production apply requires exact reviewed target, recoverable backup/rehearsal and
record-preservation checks. Rollback keeps reports private and the migration/data;
do not drop tables or silently re-open general guest support. DEP-044 remains draft
for separate signing/reviewer/provider/testing prerequisites.

## Focused evidence — local only

2026-10-09: npm run test:catalog-safety passes on real isolated PostgreSQL,
including concurrent receipt replay, changed-payload conflict, nonpublic/foreign
target denial, per-IP rate limits, fresh/forged/stale actor authority, restricted
assignment, stale transitions and actual-removal resolution. The test covers real
web/native report HTTP adapters, origin/unknown-input denial, private preference
cookies, blocked map/count/page/fuzzy/sponsor/Featured projections and migration
idempotency/RLS/table/sequence grants. Existing discovery-pagination, mobile API
and staff-boundaries suites pass. HTTP/browser workflows map to FE-063.

Migration 63 is applied only to the selected local database after a protected
custom-format backup; original business/product/user counts are unchanged and
anon/authenticated table/sequence privileges are denied. Production remains schema
62. Protected backup/receipts are under .local/play-s99/local-before63/. Full check, clean isolated web release, 11 browser acceptance workflows, operations
and mobile build contracts pass. Commit and hosted rollout remain pending.

## Complete local gate evidence

2026-10-09: full repository check, isolated clean-install web release, all 11 browser
acceptance workflows, operations and mobile build contracts pass. Protected
receipts: .local/play-s99/gates/. Final privacy-only copy passes five-language
390/320 captures and localization/narrative/geography checks. No production
provisioning, actual customer erasure or Play-delivered install is inferred.
