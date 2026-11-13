---
id: BE-065
title: Fixed trigger search paths and server-only database grants
status: in_progress
related: [DEP-054, BE-001, BE-002, BE-035, DEP-052]
owners: [backend, security, operations]
last_updated: 2026-11-12
change_level: L3
---

# BE-065 — PostgreSQL security housekeeping

## Problem and outcome

The 2026-11-12 read-only review finds nine existing invoker trigger functions
without fixed search paths and TRUNCATE/TRIGGER/REFERENCES/MAINTAIN grants to anon and
authenticated on 51 legacy tables (408 grants, including PostgreSQL 17 MAINTAIN).
Effective direct CRUD is denied, and there is no evidence from this metadata review that customer data was exposed.
The application intentionally authorizes through server-only SQL adapters.
Remove unnecessary API-role privileges and make trigger resolution independent
of caller search paths without changing data, ownership, logic or runtime grants.

## Scope and contracts

- Add ordered, idempotent application migration 81 after 80.
- Set an empty search path on the exact nine existing zero-argument trigger
  functions: deny_public_request_attachment, deny_attached_request_becoming_public,
  enforce_category_collection_business, enforce_product_collection_business,
  enforce_product_category_business, enforce_inquiry_item_business,
  enforce_delivery_inquiry_business, enforce_submitted_revision_immutable and
  enforce_support_visitor_contact. Their existing relation references are
  schema-qualified. Preserve source bodies, function OIDs, invoker mode and owners.
- Revoke table/sequence privileges in the admitted application schema from PUBLIC
  and existing anon/authenticated roles. Never revoke the dedicated server
  runtime role, change its credentials or widen a role.
- Do not enable blanket RLS policies, delete objects/data, add broad indexes,
  re-enable password/Google sign-in or change paid Auth settings to clear a warning.
  Existing private-table RLS and application tenant/capability checks remain.
- Admit only complete ordered schema 80 or 81 histories (with the existing
  all-or-none retired 27–30 group); reject holes, future markers and partial groups.
  Keep web compatibility with schema 80 during this additive rollout; applying
  this security correction is a separate database operation, never a Git build.
- Before hosted application, retain exact protected function definitions/settings,
  ownership and table/sequence ACL before-images, validate target/schema 80 and
  the finite statement list, and use one transaction. No customer rows are read
  into the plan or changed. Verify retained bodies/runtime grants and privilege
  denial afterwards; an ambiguous result stops further writes.

## Scenarios

```gherkin
Scenario: A retained installation receives security housekeeping
  GIVEN schema 80 has the observed mutable paths and legacy API-role grants
  WHEN migration 81 applies to its exact admitted schema
  THEN each targeted trigger uses an empty search path
  AND public API roles have no table or sequence privileges
  AND trigger bodies, runtime grants and customer records are unchanged

Scenario: The migration is repeated
  GIVEN migration 81 is recorded
  WHEN normal migration runs again
  THEN no statement or data correction is replayed

Scenario: The API-role grant is unexpected
  GIVEN a reviewed before-image no longer matches hosted metadata
  WHEN the operator prepares to apply
  THEN stop before writing and obtain a fresh target-bound plan
```

## Test plan

Real isolated PostgreSQL regressions must simulate legacy grants/search paths,
apply 81, inspect function identity/body/settings and effective table/sequence
privileges, compare non-target ACLs and seeded business/product fingerprints,
and prove repeat application is inert. `scripts/test-postgres-security-hygiene.ts`
proves these outcomes; `scripts/test-release-preflight.ts` covers exact 80/81
ledger admission and rejection, and `scripts/test-native-postgres.ts` covers
fresh installation. Existing cross-tenant trigger/security,
native installation and migration tests remain applicable. Typecheck/build and
spec/workflow validation supplement these database outcomes.
The required PostgreSQL CI job must run the security regression through
`scripts/test-postgres-readiness.mjs`; wiring only the local npm suite is
insufficient. The existing workflow contract checks this connection.

## Rollout and rollback

Prepare and test source first. A guarded metadata-only precursor may correct the
schema 80 hosted functions/ACLs without appending 81 until the compatible source is
integrated; migration 81 later reasserts those settings and records its marker.
Hosted metadata-only correction requires the
protected exact before-image and target review above. Verify application health
and actual advisor readback after commit. Do not weaken restored security or
replay a broad schema restore automatically; rollback is the exact reviewed
function-settings/ACL before-image, not a customer-data restore. Historical
migrations and retained customer data remain untouched.

Primary reference:
https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
