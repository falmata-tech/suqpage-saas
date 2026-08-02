---
id: ADR-0006
title: Scoped product upkeep within the managed-service model
status: accepted
date: 2026-07-24
deciders: [MirtPage]
related: [FE-008, BE-009, DEP-008, FE-003, BE-003, ADR-0001, ADR-0004, ADR-0005]
---

# ADR-0006 — Scoped product upkeep within the managed-service model

## Context

ADR-0004 removed broad owner/live-catalog editing so clients could request an
outcome without learning catalog structure or design controls. That remains the
right default for first-showroom assembly, structural changes, and visual work.
After publication, however, routine product names, descriptions, images, and
availability change frequently. Sending every small correction through the
full request, staff revision, client approval, and manager publication cycle
adds cost without protecting a structural or visual decision.

The prior product model stored numeric stock and used it to constrain inquiries.
MirtPage is an inquiry showroom, not an inventory system; keeping a count implied
operational accuracy the platform does not maintain.

## Decision drivers

- Keep the client workspace simple while giving clients useful control over
  everyday product truth.
- Let assigned MirtPage team members provide the same upkeep as customer service
  without granting cross-tenant or manager authority.
- Preserve curated collection/category structure, options, page content, and
  design as managed work.
- Preserve monotonic content versions, conflict detection, audit, and rollback.
- Avoid false inventory precision and repetitive stock-count entry.
- Align the planned AI recipe content schema before it becomes implemented.

## Considered options

1. Keep every product change request-led. This preserves one publication path
   but makes small factual updates unnecessarily slow and expensive.
2. Restore the former broad owner catalog editor. This is easy to expose but
   reintroduces structure, options, ordering, and live-write authority that the
   managed-service cutover intentionally removed.
3. Add a narrowly allowlisted, versioned basic product-upkeep use case and
   remove numeric stock from the active model. This adds one publication path
   but keeps its authority small, testable, attributable, and recoverable.

## Decision

Adopt option 3.

- After a first showroom is published, a client may list, create, and edit
  products for their own business through a simple product workspace.
- Permitted fields are product name, description, one primary managed image,
  descriptive availability, and assignment to compatible collections/categories
  that already exist in the same tenant.
- Clients cannot create or restructure collections/categories, mutate options
  or ordering, choose slugs/components, delete/unpublish structurally, change
  business/page settings, access the recipe studio, or publish a complete
  showroom revision.
- An assigned team member receives the same narrow authority for assigned
  businesses and records customer-service attribution. Operations managers and
  administrators may do the same within their broader explicit scope. Full
  structural/design work continues through assigned drafts, exact client review,
  and manager publication.
- A basic product command publishes a retained new content version atomically.
  The acting bound client needs no second approval of their own command. Staff
  never impersonate the client; their actor identity and service attribution
  remain auditable.
- A stale command fails. A full showroom revision based on an older live version
  must be rebased, so later manager publication cannot silently overwrite
  routine client/staff upkeep.
- Numeric product and option inventory is removed from active domain, UI,
  portable schema, snapshot writes, persistence, fixtures, and inquiry
  decisions. Availability is the only product-status authority.
- `available` and `limited` products accept bounded requested quantities;
  `unavailable` and `coming_soon` do not accept normal inquiries. Requested
  quantity records customer intent and is not inventory.
- V1/v2 historical stock fields may be read only at the recovery boundary and
  are discarded on upgrade. Immutable historical records follow retention
  policy rather than being destructively rewritten merely to remove an obsolete
  field.
- `FE-008`, `BE-009`, and `DEP-008` now carry the mapped implementation
  evidence. ADR-0004 remains controlling for everything outside this narrow
  exception.

## Consequences

### Positive

- Clients can keep routine product truth fresh without learning showroom
  architecture or waiting for service fulfillment.
- Team members can provide extra customer service through the same safe path.
- MirtPage retains high-value managed design/structure work and exact approval.
- Product publications remain versioned, conflict-safe, attributable, and
  recoverable.
- The active product model stops making unsupported inventory claims.

### Negative / debt

- Two intentional publication paths must share one content-version and retained-
  history contract.
- Any in-flight full revision may require rebase after a product upkeep
  publication.
- Physically removing SQLite columns requires an L4 backup/restore migration and
  legacy snapshot reader.
- The first upkeep release supports one primary image, not a complete media
  gallery or provider-video editor.

## Verification

`FE-008`, `BE-009`, and `DEP-008` record UI, authorization/domain, migration,
security, inquiry, media, browser, release, backup, and rollback evidence.
`FE-003`/`BE-003` continue to prove managed requests and full publication;
`BE-007` continues to prove exact versioning and stale conflict. The planned
recipe schemas under `FE-007`/`BE-008` must contain no active stock fields and
must share the same revision-v3 contract admitted by DEP-007/DEP-008.
