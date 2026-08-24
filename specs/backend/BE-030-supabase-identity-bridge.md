---
id: BE-030
title: Supabase identity bridge and session authority
status: in_progress
related: [BE-002, BE-018, BE-026, BE-027, DEP-015, DEP-023, DEP-026, DEP-027, ADR-0013, ADR-0014, ADR-0015]
owners: [backend, security, operations]
last_updated: 2026-08-16
change_level: L3
---

# BE-030 - Supabase identity bridge and session authority

## Problem and outcome

MirtPage needs managed password and Google authentication without moving tenant
authorization out of its canonical database or invalidating retained users in
an uncontrolled cutover.

## Contracts and invariants

- `local` and `supabase` are explicit, mutually exclusive auth drivers.
- A Supabase session grants no application access until its immutable provider
  UUID maps to one active MirtPage user.
- Roles, business IDs, capabilities, and staff assignments come only from
  MirtPage tables. Provider user metadata is never authorization authority.
- Existing compatible bcrypt hashes are copied by an operator-only migration;
  credentials, hashes, tokens, UUIDs, and contact values are never printed.
- Account creation writes a provider identity first, then the application user
  and link in one database transaction. A failed database transaction triggers
  bounded provider cleanup and records only a safe failure category.
- Password change/reset updates managed identity before committing the local
  rollback hash. Failure leaves both authorities on the previous credential.
- Google sign-in admits only an already-linked account during the first rollout.
- Logout revokes the active provider session. Missing, expired, unlinked, or
  suspended identities fail closed.

## Scenarios

```gherkin
Scenario: Provider identity is not linked
  GIVEN a valid Supabase or Google session with no MirtPage identity link
  WHEN a protected route resolves the current user
  THEN access is denied
  AND no role or tenant is inferred from provider metadata

Scenario: Existing password user migrates
  GIVEN a retained MirtPage user with a compatible bcrypt hash
  WHEN the operator runs the idempotent identity migration
  THEN one Supabase identity and one immutable link exist
  AND the migration output contains aggregate counts only

Scenario: Provider fails during new account creation
  GIVEN Supabase Auth is the selected authority
  WHEN identity creation or compensating cleanup fails
  THEN no partially linked account can authenticate
  AND the public response exposes no provider detail
```

## Quality and observability

All provider calls have deadlines and typed safe failures. Audit only operation,
driver, result class, and duration bucket. Security tests cover session forgery,
unlinked identities, cross-tenant access, logout, password update ordering, and
provider failure. Cookie tests cover `httpOnly`, `secure`, `sameSite`, scope, and
refresh behavior.

## Test plan

| Criterion | Level | Test path |
|---|---|---|
| Driver selection and configuration | unit/security | `scripts/test-auth-runtime.ts` |
| Linked and unlinked session resolution | integration/security | `scripts/test-auth-runtime.ts`, `scripts/test-security.ts` |
| Password and Google flows | browser/acceptance | `tests/acceptance/app.spec.ts` |
| Idempotent retained-user migration | operations | `scripts/migrate-supabase-auth.ts`, dry-run reconciliation |

## Current evidence

On 2026-08-17 the selectable server client, immutable identity-link migration,
password/Google callback paths, provider-first account creation with bounded
cleanup, aggregate-only retained-user migration, and local-session rollback
mode pass focused Auth, signup, and adapter boundaries. The provider-backed
local migration created and linked all 47 retained identities with zero
conflicts, and browser evidence proves password login plus client and admin
authorization into business, project-history, and revision-preview routes.
Hosted reset, logout, unlinked-user, suspension, Google, and cross-tenant browser
evidence remains required before rollout.

## Rollout and rollback

Install the additive link table, dry-run and reconcile identities, prove every
retained operator account, then switch the driver in one host candidate. Keep
the previous host and local auth mode available through the monitored rollback
window. No destructive credential cleanup is part of this spec.

## Readiness checklist

- [x] Problem, users, scope, and non-goals are explicit
- [x] Positive, negative, and provider-failure scenarios are written
- [x] Tenant, privacy, data-integrity, and security effects are evaluated
- [x] Dependencies are linked
- [x] Contracts and invariants are unambiguous
- [x] Tests, observability, rollout, and rollback are planned
- [x] No unresolved decision changes the initial implementation
