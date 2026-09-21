---
id: BE-034
title: Launch catalog and owner setup integration
status: in_progress
related: [BE-039, BE-038, BE-037, BE-035, FE-043, BE-033, BE-032, BE-009, DEP-030]
owners: [backend, security, operations]
last_updated: 2026-09-14
change_level: L3
---

# BE-034 — Launch data and workflow integration

## Current release evidence — 2026-09-14

The owner approved the visual design and deployment. Source `41e2fed` is published
as Netlify `6aa7fe5a106ca381ba08bba3`; hosted schema 43 and the public desktop/phone
workflows are verified. Full core/release, seven isolated authenticated/public
acceptance scenarios, 72 accessibility states, operations, PostgreSQL and container
gates pass. Earlier approval/full-gate-pending notes below describe intermediate
local milestones, not a new approval requirement. Remaining hosted email delivery
and authenticated production smoke are tracked in DEP-030 and
`docs/SUQPAGE-DEPLOYMENT-2026-09-14.md`; this evidence does not claim those passes.

## Problem and contracts

FE-043 defines the requested launch scope. Reuse catalog commands, existing media
storage, server actions and marketplace validation; add only the owner location
proposal persistence needed to connect owner input to administrator review.

1. Product option and visibility changes share the authorized, idempotent catalog
   transaction, content version, retained snapshot and audit event. Omitted fields
   preserve existing data. Validate at most four unique names, 1–50 unique nonempty
   values per group, bounded text and unsupported keys. Server canonical inquiry
   validation remains authoritative; no inventory or variant quantities are added.
2. Owner identity commands check current database ownership/role and expected
   catalog version. Images are sanitized and private until the tenant is active.
   Publication/current identity references and retained history drive media reads.
3. Owner location proposals are private, versioned and audited. An additive schema
   denies direct public SQL access. Only the owning client can submit; only admin
   can approve through existing marketplace settings. General-area mode clears exact
   coordinates. New proposals invalidate previous discovery approval immediately.
   Admin approval rejects changed proposals rather than approving stale input.
4. Media manifests include owner drafts/publications and new private product/identity
   images in the pages namespace, including historical references. Runtime PostgreSQL
   reconciliation reports references without exposing keys/credentials. Reconciliation
   is read-only; no garbage collection or historical asset deletion is introduced.
5. Mutation errors are bounded and preserve tenant data. Negative tests cover foreign
   owners, unassigned staff, stale versions, invalid options, hidden inquiries, review
   invalidation and privacy changes. Provider setup/deployment needs separate evidence.

## Scenarios

GIVEN tenant A WHEN its actor submits tenant B's product or owner setup THEN deny
without mutation. GIVEN a changed location proposal WHEN admin saves an older
form THEN reject without partially publishing geographic data. GIVEN a private
page cover or retained publication WHEN reconciliation runs THEN it is retained
under its actual storage namespace rather than reported as a public-file orphan.

## Test plan and rollout

Focused domain and both catalog adapter tests; rollback-only local PostgreSQL
setup/permission checks; owner/admin/public browser workflows and media manifest
fixtures. Additive migration 43 follows protected local backup; rollback preserves
schema/history. Full gates follow explicit visual approval. No hosted write,
external notification, destructive reverse migration or production claim.
