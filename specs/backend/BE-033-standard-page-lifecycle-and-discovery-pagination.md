---
id: BE-033
title: Standard page lifecycle and server-paginated discovery
status: in_progress
related: [BE-041, FE-042, FE-026, BE-001, BE-003, BE-032, DEP-030, ADR-0019, BE-009, BE-034]
owners: [backend, security, operations]
last_updated: 2026-10-17
change_level: L3
---

# BE-033 — Standard page lifecycle and discovery pagination

## S115 — category mutations recheck the saved staff function (ready)

L2 security correction accompanying FE-026's focused category screens. Master
§§13,18–19 retain their existing rule that scoped chat agents have no catalog
authority; no schema, provider, privilege expansion or hosted mutation is needed.

GIVEN a current Support or Transport agent with a retained business assignment
WHEN category create/update/delete executes, including with an earlier generic
team-member snapshot THEN reject before changing categories, product relations,
business content version or audit records. Read the current role, tenant and
queue function inside the mutation transaction; coordinate with existing staff
scope/assignment changes rather than trusting a caller's missing or old scope.

GIVEN an owner of the selected tenant or a current generic team member with an
active assignment THEN retain permitted category maintenance. GIVEN a foreign
owner, unassigned/revoked team member or revoked role THEN deny without changes.
Category deletion still preserves products and clears only the selected tenant's
category relationship. A failed audit rolls back the mutation and version.

Definition of Ready is met: the invariant and affected fields are explicit;
`scripts/test-standard-page-postgres.ts --category-security` uses a disposable
local PostgreSQL schema and its own accounts to verify all three commands,
stale scoped principals, ordinary assigned staff, foreign/revoked denial and
audit rollback. The retained lifecycle mode and permission/publication tests
remain unchanged. Full gates and deployment stay behind the current visual gate.

Local verification 2026-10-17: the isolated `--category-security` mode passes
current/scoped/stale/forged staff, all three denied commands without row/version/
audit changes, all three allowed generic-staff commands, owner/foreign/revoked
boundaries, rollback after failed audit and product preservation on deletion.
The disposable schema is removed on completion. No shared/hosted data, provider,
full/release gate or deployment was touched by this focused verification.

## Current release evidence — 2026-09-14

The owner approved the visual design and deployment. Source `41e2fed` is published
as Netlify `6aa7fe5a106ca381ba08bba3`; hosted schema 43 and the public desktop/phone
workflows are verified. Full core/release, seven isolated authenticated/public
acceptance scenarios, 72 accessibility states, operations, PostgreSQL and container
gates pass. Earlier approval/full-gate-pending notes below describe intermediate
local milestones, not a new approval requirement. Remaining hosted email delivery
and authenticated production smoke are tracked in DEP-030 and
`docs/SUQPAGE-DEPLOYMENT-2026-09-14.md`; this evidence does not claim those passes.

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

Current candidate FE-048/BE-041/DEP-038 supersedes staff approval requirements and
adds a simple Product/Service input. Historical evidence above remains scoped to
its release; the new candidate awaits focused verification and visual approval.

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
