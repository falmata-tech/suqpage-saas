---
id: FE-043
title: Complete seller and operations launch workflows
status: in_progress
related: [FE-045, FE-042, FE-040, FE-008, BE-034, DEP-030]
owners: [product, frontend, operations]
last_updated: 2026-09-21
change_level: L2
---

# FE-043 — Launch workflow wiring

## Current release evidence — 2026-09-14

The owner approved the visual design and deployment. Source `41e2fed` is published
as Netlify `6aa7fe5a106ca381ba08bba3`; hosted schema 43 and the public desktop/phone
workflows are verified. Full core/release, seven isolated authenticated/public
acceptance scenarios, 72 accessibility states, operations, PostgreSQL and container
gates pass. Earlier approval/full-gate-pending notes below describe intermediate
local milestones, not a new approval requirement. Remaining hosted email delivery
and authenticated production smoke are tracked in DEP-030 and
`docs/SUQPAGE-DEPLOYMENT-2026-09-14.md`; this evidence does not claim those passes.

## Problem and scope

The owner requests an audit and implementation of active frontend/backend gaps
before launch. Current audit finds inaccessible product options/visibility,
owner identity/location setup, private-media reconciliation and stale launch
verification. Keep one standard profile, existing providers and tenant boundaries.
No checkout, external messaging, new provider, destructive purge or hosted change.
Readiness is satisfied by BE-034 and the existing first-review/owner contracts.

## Acceptance criteria

- P1: Sellers and authorized product staff manage up to four named option groups
  and their values in the product form. Save/reload/public product/inquiry all use
  the same canonical data. Existing options survive ordinary edits. Invalid,
  duplicate, excessive or foreign-tenant options fail safely.
- P2: Product editing exposes listed/hidden visibility. Hidden products disappear
  from public pages, search and inquiry eligibility without destroying history.
  Product input emphasizes price, unit, description, highlights, photo/video and
  choices; retired capacity/minimum-order/lead-time inputs are omitted without
  destroying previously saved legacy values during unrelated edits.
- B1: An owner can update their own business name/logo through a reachable business
  details form. Staff/admin powers are not silently granted to owners. Canonical
  version checks prevent stale overwrites and invalidate first-page review.
- B2: Owners can submit city/region and choose a general public area or expressly
  provide storefront coordinates. General-area mode does not store private exact
  coordinates. The admin Marketplace editor shows the submitted location/category
  and can approve the same saved proposal using existing geographic validation.
  A paginated pending-location filter and admin overview count make proposals
  discoverable without knowing a business ID.
  A changed proposal removes old public location eligibility until reapproval;
  owners cannot self-approve, sponsor or bypass exclusion. Missing listing setup
  is visible in the owner workspace and review screen.
- N1: Every active admin/owner/staff destination has a visible permitted entrypoint;
  backend-only operations that are intentionally CLI/provider tasks are documented.
- A1: Desktop/390/320 forms, saved/error/pending states, keyboard labels, no overflow;
  a submitted page changed afterward visibly requires resubmission rather than
  continuing to claim the current version was submitted;
  no external inquiry or email delivery during browser tests.

## Scenarios

GIVEN an owner edits Color values WHEN they save and a buyer opens the product
THEN the same choices appear and server inquiry validation accepts only those values.
GIVEN a hidden product WHEN a visitor searches or submits an inquiry THEN it is
not discoverable or inquiry-ready. GIVEN a home seller switches from storefront
to general area WHEN they save THEN old exact placement is unavailable pending
admin approval and no exact coordinates remain in the owner's proposal.

## Test plan and rollout

S2k in the transition checklist orders the audit, contracts, implementation,
focused domain/SQLite/PostgreSQL/browser evidence and final visual approval.
Full release/acceptance follow approval. Audit findings and retained limitations
are recorded in docs/SUQPAGE-LAUNCH-WIRING-AUDIT.md. No deployment is claimed.

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
