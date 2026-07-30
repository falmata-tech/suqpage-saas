---
id: BE-014
title: Tenant-scoped unified offering contract
status: done
related: [BE-001, BE-007, BE-008, BE-009, BE-013, BE-015, FE-016, DEP-012]
owners: [product, backend, security]
last_updated: 2026-07-29
change_level: L3
---

# BE-014 — Tenant-scoped unified offering contract

## Problem and outcome

The canonical catalog assumes every inquiry line is a product with a mandatory
quantity from 1–20. That contract cannot accurately represent custom
manufacturing or production capability inquiries.

The outcome is an additive `Offering` contract over the established Product
entity. It preserves tenant isolation, publication history, and the compatible
`products` transport while making type and desired-quantity behavior explicit.

## Accepted optional-quantity correction

This correction supersedes required public quantity behavior without requiring
another database rebuild.

- Desired quantity is optional buyer intent for every offering kind.
- Current desired quantity is a normalized single-line text intent of at most
  80 characters so units and packaging remain explicit.
- Current upkeep, revision, and recipe output writes `quantityMode: optional`.
- Retained rows and snapshots containing `required` remain readable
  compatibility input and normalize to optional current behavior.
- Public inquiry validation accepts an absent quantity for every offering and
  rejects non-scalar input or supplied text beyond the bounded contract.
- Historical inquiry-line snapshots are not rewritten.

## Scope

### In scope

- `OfferingKind`: `standard_product`, `made_to_order`,
  `manufacturing_capability`, or `production_supply`.
- `QuantityMode`: `required` or `optional`.
- Bounded `capacitySummary`, `minimumOrderSummary`, and `leadTimeSummary`.
- Additive canonical columns, snapshot/recipe fields, upkeep fields, and
  inquiry-line snapshots.
- Nullable inquiry quantity for every current offering.
- Context-aware status labels derived from kind and existing availability.

### Non-goals

- A second capability table, polymorphic database hierarchy, inventory,
  capacity arithmetic, price/quote logic, or supplier verification.
- Trusting recipe/form-supplied tenant, product, inquiry, or publication IDs.
- Renaming legacy physical storage or accepting simultaneous `products` and
  `offerings` recipe arrays.

## Domain language and invariants

- Product remains the persisted entity name for compatibility; `Offering` is
  its current domain role.
- Existing rows and legacy snapshots default to `standard_product`,
  `required`, and empty production facts.
- Current quantity intent is either absent or normalized text of at most 80
  characters. Legacy numeric quantity remains readable compatibility data.
- An inquiry line snapshots offering kind and quantity mode so historical
  meaning survives later catalog edits.
- `available` and `limited` remain the only inquiry-eligible availability
  values for every offering kind.

## Contracts

- Canonical rows constrain offering and quantity enum values and bound facts in
  application parsers.
- Basic upkeep accepts exactly the expanded allowlist and applies it inside the
  existing version-conflict, idempotency, media, and tenant transaction.
- Current snapshots and recipe content include all offering fields. Legacy
  snapshots are upgraded with defaults before validation/publication.
- The exported AI schema retains the `products` property with an explicit
  compatibility description and requires offering fields for current output.
- Public inquiry validation reloads the selected offering under the requested
  business. It accepts absent quantity, and rejects invalid supplied quantity,
  unavailable offerings, bad options, and cross-tenant IDs before insertion.
- Persisted inquiry lines use nullable quantity and snapshot kind/policy. No
  downstream view assumes quantity is always present. Migration 19 adds
  `quantity_intent` without rebuilding the table and backfills retained numeric
  values as text while preserving the legacy numeric column.

## Scenarios

```gherkin
Scenario: Optional capability inquiry is persisted truthfully
  GIVEN a published manufacturing capability with optional quantity
  WHEN a visitor submits a valid inquiry without quantity
  THEN the inquiry line stores a null quantity and capability snapshots
  AND no synthetic unit count is introduced

Scenario: Quantity units survive canonical persistence
  GIVEN a valid contact-bearing inquiry for an available offering
  WHEN desired quantity is "1 ton"
  THEN the inquiry line stores "1 ton" as quantity intent
  AND no unitless numeric quantity is invented

Scenario: Retained required policy no longer blocks a visitor
  GIVEN a published standard product retaining required quantity metadata
  WHEN an inquiry omits quantity
  THEN the request is accepted with null quantity
  AND its current quantity behavior is snapshotted as optional

Scenario: Cross-tenant capability is rejected
  GIVEN a capability belongs to tenant B
  WHEN an inquiry for tenant A references it
  THEN the request is rejected
  AND neither tenant's catalog or inquiry state changes

Scenario: Historical catalog receives compatible defaults
  GIVEN a retained snapshot predating offering fields
  WHEN it is loaded through the supported upgrade path
  THEN every product becomes a required standard product with empty facts
  AND the historical merchant text remains unchanged
```

## Quality impact

- Security and tenant isolation: server reload and same-business database
  trigger remain mandatory.
- Privacy and data retention: production facts are catalog content; customer
  quantities remain inquiry data and are excluded from general logs.
- Accessibility and responsive behavior: owned by FE-016.
- Localization and merchant-entered values: exact text is preserved.
- Performance and limits: existing 20-line inquiry bound remains; desired
  quantity text is bounded to 80 characters.
- Failure recovery and idempotency: migration checkpoint, atomic publication,
  and inquiry idempotency remain active.

## Observability

Audit changed offering-field names and safe enum values. Record inquiry outcome
and whether quantity was supplied, never its customer note or complete payload.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Parser, upkeep, tenant, and publication rules | integration/security | `scripts/test-product-upkeep.ts`, `scripts/test-security.ts` |
| Optional inquiry quantity and retained compatibility | integration/security | `scripts/test-security.ts` |
| Snapshot and recipe compatibility | contract/integration | `scripts/test-revisions.ts`, `scripts/test-showroom-recipe.ts` |
| Schema migration and database constraints | migration | `scripts/test-offering-migration.ts` |

## Rollout and rollback

DEP-012 owns migration 18 checkpoint requirements, additive migration 19,
reset fixtures, and operator verification. Additive product and
`quantity_intent` columns may remain after application rollback; the legacy
numeric column remains available to the older application artifact.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Evidence

Evidence: verified locally on 2026-07-29.

- `lib/offerings.ts`, `lib/types.ts`, `lib/inquiries.ts`,
  `lib/product-upkeep-domain.ts`, `lib/product-upkeep-sqlite.ts`,
  `lib/revision-domain.ts`, `lib/revision-service.ts`, and the current showroom
  recipe/content contracts implement the additive offering model, current
  optional quantity output, and retained required-value normalization.
- `scripts/test-security.ts` proves retained required metadata accepts optional
  text intent, preserves `1 ton`, rejects overlong input, snapshots current
  optional behavior, and preserves option, availability, and tenant denial.
- `scripts/test-offering-migration.ts` proves migration 19 additively backfills
  retained numeric values as text, keeps the numeric column, and is idempotent.
- `scripts/test-product-upkeep.ts`, `scripts/test-showroom-recipe.ts`, and
  `scripts/test-revisions.ts` prove enum/fact validation, retained publication,
  current AI schema/provenance, compatibility defaults, publication, and
  rollback.
- `npm run check`, 10/10 browser acceptance, and `npm run release` passed on
  2026-07-29.
