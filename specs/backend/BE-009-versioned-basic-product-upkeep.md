---
id: BE-009
title: Tenant-scoped versioned product upkeep
status: done
related: [BE-001, BE-003, BE-007, BE-008, FE-007, FE-008, DEP-008, ADR-0006]
owners: [product, backend, security]
last_updated: 2026-07-28
change_level: L3
---

# BE-009 — Tenant-scoped versioned product upkeep

## Problem and outcome

The current managed-service cutover denies every role direct catalog mutation,
and the catalog couples inquiry eligibility to numeric stock. SuqPage now needs
a narrowly authorized product-upkeep use case without restoring the former broad
owner editor or bypassing content-version conflict and rollback guarantees.

The outcome is one application boundary that creates or updates a single
product's allowed fields, publishes a retained content version atomically, and
uses availability—not inventory count—as canonical inquiry eligibility.

## Scope

### In scope

- A framework-independent basic product-upkeep command and authorization policy.
- Client self-service for their own established tenant.
- Equivalent authority for an actively assigned team member, operations
  manager, or administrator within explicit business scope.
- New product creation and existing product update for name, description,
  primary managed image, availability, and existing category association.
- Stable version conflict, idempotency, safe media staging, retained snapshot,
  atomic canonical publication, audit, and cache/event effects.
- Availability-only product and inquiry contracts with no active numeric stock.
- Read/upgrade compatibility for retained v1/v2 snapshots containing historical
  stock fields; all new canonical/snapshot/recipe writes omit them.

### Non-goals

- Category creation, rename, deletion, or ordering.
- Option-group mutation, product ordering, client-chosen slug, hard deletion,
  arbitrary unpublish, business/settings/design changes, or bulk updates.
- Client recipe/studio/recovery-editor access or complete showroom publication.
- Numeric product/variant inventory, inventory reservation, or fulfillment.
- Trusting form-supplied tenant, product, category, media, actor,
  publication, or version authority.

## Domain language and invariants

- `BasicProductCommand` is `create` or `update` with exactly the permitted
  fields, expected content version, idempotency key, and optional staff-service
  attribution. Unknown fields have no domain effect.
- `Availability` is `available`, `limited`, `unavailable`, or `coming_soon`.
  `available` and `limited` are inquiry-eligible; the other states are not.
- Customer `RequestedQuantity` remains an integer from 1–20 for bounded inquiry
  intent. It is not inventory and is never compared with product quantity.
- A client is authorized only for their own business. A team member needs active
  business assignment. Managers/administrators use explicit capability scope.
- A new product receives server-generated stable identity, unique slug, append
  order, and current structure references. An update preserves every field
  outside the command allowlist.
- A product publication is a new monotonic business content version. It never
  mutates an older retained snapshot or approval.
- Historical stock values may remain inside immutable pre-cutover snapshots only
  as ignored recovery input. They never re-enter canonical rows or new writes.

## Contracts

- Add a narrow `basic-product:maintain` capability/policy evaluated with the
  authoritative actor, business, established-publication state, and assignment.
  It is not equivalent to `operations:manage`, full catalog management, or
  revision publication.
- The application port accepts no database IDs as relationship authority.
  Persistence reloads the target product and structure under the authorized
  business and rejects cross-tenant or missing values.
- For category assignment, a selected category must belong to the same tenant.
  The active command does not accept collection identity and never silently
  reparents a category or product.
- Create accepts bounded exact name/description, allowed availability, optional
  verified primary-image intent, and one compatible existing category key. Update
  reloads the product and applies only supplied allowlisted changes.
- Product image replacement uses staged verified/re-encoded managed media.
  Commit promotes the canonical reference; failure removes staged files.
  Removal never deletes a file still referenced by a retained/current version.
- Publication requires `expectedContentVersion` to equal the current business
  version at transaction time. A mismatch returns a typed conflict before
  canonical mutation or media promotion.
- The transaction first retains the current full catalog snapshot if absent,
  applies the one-product command to a validated complete stockless snapshot,
  replaces canonical state, increments `content_version`, stores the exact new
  snapshot with `change_kind=product_upkeep`, and appends audit/history.
- Client actions require no second client-approval event because the bound
  client is the author. Staff actions require active scope and bounded
  customer-service attribution; they cannot impersonate a client decision.
- Existing draft/awaiting/approved revisions remain immutable. Their older base
  version causes normal stale rejection until staff explicitly rebases.
- The active `Product`, option-value, revision-v3 content, portable content
  schema, seed, UI, API, and inquiry contracts contain no `stock`,
  `stockCount`, or `stock_count` field.
- The controlled migration physically removes product and option-value stock
  columns. Compatibility readers accept v1/v2 historical fields only at the
  recovery edge and discard them while upgrading to the stockless current
  snapshot.
- Public inquiry validation canonically reloads business/product/options and
  accepts only published `available`/`limited` products. Requested quantity is
  bounded 1–20 but no inventory comparison or availability decrement occurs.
- Commands are idempotent per business and command key. A successful retry
  returns the original result; conflicting reuse fails safely.
- The use case depends on narrow actor-scope, catalog-version repository, media,
  transaction, and audit ports rather than Next.js, cookies, SQLite, or
  filesystem types.

## Scenarios

```gherkin
Scenario: Client creates one product safely
  GIVEN a client for an established tenant and an optional existing category
  WHEN they submit a valid create command at the current content version
  THEN one product and one retained next content version commit atomically
  AND no protected structure, design, option, or inventory field changes

Scenario: Assigned staff performs customer-service upkeep
  GIVEN a team member actively assigned to tenant A
  WHEN they update an allowed product field for tenant A with service attribution
  THEN the versioned update succeeds and identifies the staff actor
  AND the same actor cannot update tenant B

Scenario: Client forges structure or hidden fields
  GIVEN a client for tenant A
  WHEN the command references tenant B structure or includes options, ordering, slug, design, stock, or publication fields
  THEN the unauthorized relationship or command is rejected
  AND no canonical or retained version is partially written

Scenario: Product upkeep loses a version race
  GIVEN a command expects content version 8
  WHEN another product update or approved revision has already published version 9
  THEN the command returns a typed stale conflict
  AND version 9 remains unchanged

Scenario: Inquiry requests more than an unknown stock amount
  GIVEN a published available product with no inventory-count field
  WHEN a visitor requests a bounded quantity from 1 through 20
  THEN canonical availability permits the inquiry
  AND SuqPage stores requested intent without claiming or decrementing stock

Scenario: Historical stock snapshot is recovered
  GIVEN a retained v2 snapshot contains product and option stock counts
  WHEN the recovery reader upgrades it after the stockless cutover
  THEN product content and availability are preserved
  AND numeric stock is discarded and never written into current canonical state
```

## Quality impact

- Security and tenant isolation: actor/business/assignment checks wrap all
  reads, structure resolution, media, transaction, and history.
- Privacy and data retention: product descriptions and image data stay out of
  general logs; retained media remains reference-safe.
- Accessibility and responsive behavior: owned by FE-008.
- Localization and merchant-entered values: name/description remain exact; slug
  and system labels are server/system concerns.
- Performance and limits: one command changes one product within bounded catalog
  and media sizes; the transaction remains single-instance SQLite safe.
- Failure recovery and idempotency: conflict, command idempotency, staged-media
  cleanup, retained snapshots, monotonic rollback, and backup restore apply.

## Observability

Audit safe actor/business/product IDs, command/idempotency hash, changed-field
names, staff-service attribution presence, base/new version, conflict category,
media outcome, and result. Never log descriptions, image paths/bytes, complete
snapshots, client contacts, or credentials.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Pure allowlist, availability, and relationship rules | domain | `scripts/test-product-upkeep.ts` |
| Client/team/manager/admin scope and cross-tenant denial | security/integration | `scripts/test-product-upkeep.ts`, `scripts/test-security.ts` |
| Atomic version, idempotency, stale conflict, and history | integration | `scripts/test-product-upkeep.ts`, `scripts/test-revisions.ts` |
| Image staging/replacement/removal and retained references | media/security | `scripts/test-product-upkeep.ts`, `scripts/test-security.ts` |
| Stockless active contracts and legacy snapshot upgrade | contract/migration | `scripts/test-stockless-catalog.ts`, `scripts/test-operations.mjs` |
| Availability-only inquiry eligibility | API/security | `scripts/test-stockless-catalog.ts`, `scripts/http-smoke.mjs`, `scripts/test-security.ts` |
| Complete role workflow | production browser | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

DEP-008 owns the destructive schema cutover. Land pure stockless/current and
legacy-reader contracts first, then migrate isolated fixtures, then enable the
versioned command for administrator/manager, assigned-team, and client cohorts.
Rollback disables the command and restores the compatible application/database/
media checkpoint. Published post-cutover versions require reconciliation before
restore and are never silently overwritten.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Evidence

Evidence: verified locally on 2026-07-28.

- `lib/product-upkeep-domain.ts`, `lib/product-upkeep.ts`,
  `lib/product-upkeep-sqlite.ts`, `lib/capabilities.ts`, `lib/media.ts`,
  `app/actions.ts`, and schema migration 10 implement the pure use-case port,
  strict category-only command allowlist, role/assignment scope, compatible structure reload,
  managed image staging, idempotency, optimistic version conflict, exact
  one-product mutation, retained publication, audit, and emergency disable
  control.
- `scripts/test-product-upkeep.ts` passed client/team/manager/admin scope,
  cross-tenant category and submitted-collection denial, null collection writes,
  protected-field preservation, stale/idempotency behavior, image
  cleanup/retention, migration-10 rebuild, and disable-control evidence on
  2026-07-28.
- `scripts/test-security.ts`, `scripts/test-revisions.ts`, all 10 Playwright
  journeys, `npm run check`, and `npm run release` passed on 2026-07-28.
