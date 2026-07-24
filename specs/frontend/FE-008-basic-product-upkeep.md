---
id: FE-008
title: Simple client and staff product upkeep
status: ready
related: [FE-001, FE-003, FE-007, BE-009, DEP-008, ADR-0006]
owners: [product, frontend]
last_updated: 2026-07-24
change_level: L3
---

# FE-008 — Simple client and staff product upkeep

## Problem and outcome

After SuqPage publishes a client's first showroom, routine product facts change
more often than its structure or design. Requiring a service request for every
new product, image replacement, description correction, or availability change
creates avoidable work for both the client and team.

The outcome is a mobile-first **My products** workflow that lets a client, or
authorized SuqPage staff serving that client, create and maintain basic product
information without exposing catalog architecture or showroom design.

## Scope

### In scope

- List and search products for one established client showroom.
- Create a product with name, description, one primary managed image,
  availability, and an optional assignment to existing collection/category
  choices.
- Edit those same basic fields on an existing product.
- Replace or remove the primary image through the verified media boundary.
- Compact product-card preview, explicit live-update confirmation, success,
  conflict, validation, and retry states.
- Client self-service for their own business; equivalent customer-service
  upkeep for an assigned team member, operations manager, or administrator
  within their authorized tenant scope.
- Availability-only behavior with no inventory-count field or implication.
- Visible breadcrumbs and deterministic Back destinations for list, create, and
  edit deep links.

### Non-goals

- Creating, renaming, reordering, or deleting collections or categories.
- Editing option groups/values, sort order, slug, product-card component,
  showroom design, page content, contacts, business settings, or other products
  in bulk.
- Hard deletion, structural removal, or arbitrary unpublish controls. A client
  can mark an item unavailable; structural removal remains request/studio work.
- Client access to recipe import, focused studio, recovery editor, raw JSON, or
  complete showroom publication.
- Inventory counts, variant stock, pricing, checkout, or fulfillment.
- Product galleries or external product-video links in the initial upkeep
  surface; those require the authoritative product-media contract to expand.
- Product upkeep before the first showroom has been published.

## Domain language and invariants

- **Basic product upkeep** is a narrow, versioned publication of one new or
  existing product's permitted fields. It is not a full showroom revision.
- **Established showroom** has retained publication history. A draft tenant
  without a first publication continues through request-led onboarding.
- **Existing structure choice** is a collection/category already owned by the
  same business. Selecting it does not grant authority to alter that structure.
- **Availability** is `available`, `limited`, `unavailable`, or `coming_soon`.
  It is descriptive catalog truth and has no numeric inventory behind it.
- The acting client is authority for their own basic update. Staff acting for a
  client are visibly attributed and remain tenant/assignment scoped.

## Contracts

- Client navigation adds **My products** only for an established showroom.
  Assigned team members see the same upkeep entry inside authorized business
  context; managers/administrators can select a managed client.
- The product list uses touch-sized cards/rows with image, exact product name,
  collection/category context, availability, and one clear Edit action. It
  contains no stock column.
- Create/edit shows only product name, description, primary image, availability,
  existing collection, and a category filtered to a compatible collection.
  Unsupported hidden fields cannot be submitted into authority.
- Product names are required and bounded; descriptions are bounded. Merchant
  text remains exact and is never automatically translated.
- The server generates a stable unique slug and append position for a new
  product. Renaming an existing product does not expose or silently rewrite its
  slug, structure, options, or presentation component.
- A category/collection choice is optional only when the current tenant
  structure permits an unassigned product. A selected category and collection
  must be a compatible same-tenant pair; stale choices show a conflict rather
  than being silently changed.
- Image input accepts one JPEG, PNG, or WebP through the existing signature,
  decode, pixel/size, re-encoding, metadata-removal, generated-filename, and
  controlled-serving boundary. Replacement and removal are explicit.
- **Save and publish** shows a compact summary/card preview and warns that the
  product will update the live showroom. It never suggests that the client is
  publishing structural or visual changes.
- A successful command creates the next retained content version atomically.
  A stale base version shows that the showroom changed and requires reload; it
  never overwrites a newer client/staff/revision publication.
- When staff perform upkeep for a client, the UI labels the represented
  business and captures a short customer-service reason or request reference.
  The resulting history identifies SuqPage as the actor.
- Any pending full showroom revision based on the previous live version becomes
  visibly stale and must be rebased before approval/publication.
- At 320 pixels, fields remain single-column, actions remain reachable, media
  preview does not overflow, and no hover behavior is required.

## Scenarios

```gherkin
Scenario: Client adds a product to existing structure
  GIVEN an authenticated client with an established showroom and existing collection/category choices
  WHEN they enter valid basic fields, choose a compatible category, preview, and confirm
  THEN the product appears in the next live content version
  AND no category, collection, option, design, or inventory field was exposed

Scenario: Client updates routine product facts
  GIVEN a product belonging to the client's own business
  WHEN the client changes its name, description, primary image, or availability
  THEN only the permitted fields change in a retained new content version
  AND the prior version remains recoverable

Scenario: Assigned team member helps a client
  GIVEN a team member with active scope for one client business
  WHEN they create or update a product and record the customer-service reason
  THEN the same narrow product workflow succeeds for that business
  AND the audit/history attributes the staff actor rather than impersonating the client

Scenario: Client attempts structural mutation
  GIVEN the client can access My products
  WHEN they submit a new category, option, sort position, design value, another tenant identifier, or hidden unsupported field
  THEN the operation is rejected or the unsupported value is ignored before authority
  AND no protected catalog structure or other tenant changes

Scenario: Basic update races with showroom work
  GIVEN a staff revision and product form were both based on live content version 8
  WHEN one publishes version 9 before the other confirms
  THEN the second operation reports a stale conflict without partial changes
  AND the staff revision cannot later overwrite the product update silently

Scenario: Draft client opens product upkeep
  GIVEN an invited client whose first showroom has not been published
  WHEN they open a My products deep link
  THEN the upkeep surface is unavailable
  AND the client is directed to their first-showroom request workflow
```

## Quality impact

- Security and tenant isolation: every read, media operation, structure choice,
  and publication is server-authorized against actor and business scope.
- Privacy and data retention: managed images follow the existing private/public
  lifecycle; no image bytes or descriptions enter general logs.
- Accessibility and responsive behavior: labels, errors, confirmation,
  destructive image removal, focus, 320-pixel layout, and Back behavior receive
  browser evidence.
- Localization and merchant-entered values: names/descriptions remain exact;
  interface text may localize independently.
- Performance and limits: product lists are bounded/paginated and images use
  current media limits; one command changes one product.
- Failure recovery and idempotency: base-version conflict, idempotency,
  retained-version rollback, and orphan-media cleanup prevent partial updates.

## Observability

Record safe actor, represented business, product, content version, command kind,
changed-field names, staff-on-behalf reason presence, conflict, and outcome.
Never log product descriptions, image filenames/bytes, client contacts, or
complete command payloads.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Client list/create/edit and live result | production browser | `tests/acceptance/product-upkeep.spec.ts` |
| Mobile, labels, focus, preview, and Back behavior | production browser | `tests/acceptance/product-upkeep.spec.ts` |
| Client/team/manager scope and structural denial | security/browser | `scripts/test-product-upkeep.ts`, `scripts/test-security.ts`, `tests/acceptance/product-upkeep.spec.ts` |
| Media replacement/removal and failure cleanup | media/security | `scripts/test-product-upkeep.ts`, `scripts/test-security.ts` |
| Stale-version conflict and retained history | integration/browser | `scripts/test-product-upkeep.ts`, `scripts/test-revisions.ts`, `tests/acceptance/product-upkeep.spec.ts` |
| No inventory-count UI or behavior | contract/browser | `scripts/test-stockless-catalog.ts`, `tests/acceptance/product-upkeep.spec.ts` |

## Rollout and rollback

Ship only after BE-009 and DEP-008 complete the stockless, versioned mutation
boundary. Enable administrator/manager test accounts, then assigned team members,
then each of the four example clients. Rollback hides/disables basic-upkeep
routes and restores the compatible application/database checkpoint; retained
published versions are reconciled rather than overwritten.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Filled only after implementation and every mapped gate pass. This ready spec
does not claim that clients or staff can currently perform basic product upkeep.
