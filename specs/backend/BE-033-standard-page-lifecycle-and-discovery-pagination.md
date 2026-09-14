---
id: BE-033
title: Standard page lifecycle and server-paginated discovery
status: in_progress
related: [FE-042, BE-001, BE-003, BE-032, DEP-030, ADR-0019, BE-009, BE-034]
owners: [backend, security, operations]
last_updated: 2026-09-14
change_level: L3
---

# BE-033 — Standard page lifecycle and discovery pagination

## Problem and contract

FE-042 is the owner's explicit retirement and integration direction. Reuse current
server-only SQL and domain ports; no broad architecture rewrite or hosted mutation.
Historical custom-request/revision tables remain inert for data integrity and recovery.
Live request/intake/revision/design mutation entrypoints are removed, including
server actions, APIs, page navigation and related notifications. Signup uses the
existing business_onboarding_profiles record, never a service request.

## Acceptance criteria

1. Public result COUNT and bounded LIMIT/OFFSET queries share tenant status,
   approved/excluded geography, category, publication and escaped query predicates.
   Page size is five; All is a deterministic product-then-business sequence.
   Product results use only published canonical products; drafts and private fields
   never enter result projections. Map rows are not paginated with list results.
2. Owners can maintain their draft tenant's canonical products before publication.
   Existing tenant ownership, staff scope, image sanitation, idempotency and retained
   catalog audit versions remain. Draft tenant products/media must remain nonpublic.
3. Owner-only first-review submission records the saved draft version, catalog
   content version and submitting actor. Canonical business-details edits, product edits
   and category edits advance that version and invalidate an outstanding review. Admin-only approve/request-changes checks
   the pending submission and locks/rechecks current versions; stale or conflicting
   actions fail without partial publication. Approval publishes submitted content,
   activates the business and records its reviewer atomically. Suspension is not
   bypassed by resubmission. Existing active-page owner publish/restore remains.
4. Review and business-assignment reads/mutations are authorized server-side;
   team scope uses active staff_business_assignments. Assistance consent still
   controls staff page edits; assignment never grants owner publishing authority.
5. Review storage uses an additive versioned migration with direct public database
   access denied. No historical request, account, inquiry, product or asset is purged.
   Local migration follows protected backup and focused rollback-compatible tests.

## Scenarios and failures

GIVEN a foreign owner, unassigned/revoked staff member, anonymous visitor or stale
review version WHEN they access/change a page, product or review THEN the operation
is denied without cross-tenant disclosure or mutation. GIVEN an old custom-request
entrypoint WHEN invoked THEN it is unavailable and cannot send notifications.

Test SQL pagination with multiple pages/ties/empty/filter changes; test real local
PostgreSQL rollback transactions for first publication and consent/scope denial;
HTTP/browser tests verify retired endpoints and owner/admin journeys. Test-created
records/media are cleaned up, with no email or external app delivery. Gate and audit
evidence are tracked in S2i/S2j and TRACEABILITY. Rollback uses prior code with additive
schema retained; never destructive reverse migration.

## Test plan

See the criterion-mapped domain, SQL and browser checks in FE-042 and S2j.
The active gate replaces retired request-intake/revision-publication workflow
checks with owner-page, page-review and standard-invitation regressions plus the
new browser lifecycle/retired-endpoint checks. Retained catalog snapshot, schema,
media, security and product-upkeep checks continue. Historical test files are
preserved in the dirty worktree; they do not define the current app contract.

## Rollout

Apply additive migration 42 after a protected local backup; keep review tables on
rollback. Hosted migration and deployment are separate authorization gates.
