---
id: BE-026
title: Production portability hardening
status: done
related: [BE-002, BE-018, BE-024, FE-026, DEP-021, DEP-022, ADR-0012, ADR-0013]
owners: [backend, security, operations]
last_updated: 2026-08-03
change_level: L3
---

# BE-026 - Production portability hardening

## Problem and outcome

MirtPage has secure application-owned sessions and a provider-neutral media
port, but password hashing still uses synchronous work in request paths,
object-storage calls have no explicit deadline, and migration tooling does not
reconcile every database-referenced object. Direct SQLite use is also broad
enough that new coupling could make a future PostgreSQL move harder. Production
boundaries need bounded failures, complete reconciliation evidence, and an
enforced portability inventory without weakening current behavior.

## Scope

### In scope

- Non-blocking password hash/verify operations in signup, login, invitation,
  reset, and password-change workflows.
- Typed session-row handling and hardened secure-cookie attributes while
  retaining opaque revocable server-side sessions.
- Explicit timeouts and bounded provider errors for Supabase Storage reads,
  writes, and deletes.
- A database-derived media manifest and reconciliation command covering public
  and private references, missing local sources, target parity, and hashes.
- A maintained inventory and guard that prevents unreviewed direct SQLite use
  from spreading beyond declared adapters during the PostgreSQL transition.
- Tests proving no credentials, provider response bodies, object keys, password
  material, or tenant content reach logs or user-visible errors.

### Non-goals

- Switching to Supabase Auth, social login, MFA, account recovery, deleting
  source media, or declaring PostgreSQL the current runtime.

## Domain language and invariants

- **Application-owned identity** means MirtPage owns password credentials,
  opaque session tokens, revocation, and role/business bindings in its
  authoritative database.
- **Media manifest** is an operator-only set of normalized namespace/key
  references derived from authoritative rows and retained snapshots; it does
  not contain bytes, credentials, or public provider URLs.
- **Portability inventory** names every approved direct SQLite boundary. Its
  purpose is to reduce coupling monotonically, never to legitimize new domain
  dependencies on a database API.
- A remote-provider timeout never commits a database reference to an object
  whose write is unverified.

## Contracts

- Password hashing and comparison use the existing bcrypt cost and validation
  rules through asynchronous APIs. Session creation and revocation semantics do
  not change.
- Production session cookies are `httpOnly`, `secure`, `sameSite=lax`,
  root-scoped, and high priority; only a token digest persists.
- Supabase Storage operations terminate after a configurable bounded deadline,
  convert network/provider failures to typed safe failures, and never echo the
  provider body or service credential.
- Reconciliation reports aggregate totals for referenced, present, missing,
  copied, mismatched, and unreferenced objects. It exits non-zero for missing or
  mismatched authoritative references and never deletes or rewrites data.
- The SQLite-boundary check compares source use to a reviewed manifest and
  fails when a new direct dependency appears. Removing an approved dependency
  is always allowed.

## Scenarios

```gherkin
Scenario: Storage provider stops responding
  GIVEN Supabase media mode is configured
  WHEN a provider request exceeds the configured deadline
  THEN the operation fails with a bounded retryable application error
  AND no credential, provider body, or unverified database reference is exposed

Scenario: Media cutover contains a missing retained image
  GIVEN an authoritative retained snapshot references a media key absent from source and target
  WHEN the operator runs reconciliation
  THEN the command exits unsuccessfully with aggregate missing counts
  AND no source, target, or database record is changed

Scenario: New code bypasses the database boundary
  GIVEN the reviewed SQLite portability inventory
  WHEN a new module imports or calls the SQLite runtime directly
  THEN the repository gate fails and names the source path
```

## Quality impact

- Security and tenant isolation: all existing route and row authorization stays
  before private media reads and database mutation.
- Privacy and data retention: reconciliation output is aggregate and copy-only.
- Accessibility and responsive behavior: no direct impact.
- Localization and merchant-entered values: no direct impact.
- Performance and limits: asynchronous bcrypt avoids blocking the Node event
  loop; provider deadlines prevent indefinitely occupied requests.
- Failure recovery and idempotency: object keys remain immutable and migration
  plus reconciliation are repeatable.

## Observability

Record operation kind, adapter name, status class, duration bucket, and aggregate
reconciliation counts. Prohibit token values/digests, passwords, object keys,
provider URLs, response bodies, customer text, and contact data.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Async auth behavior and revocation | security/integration | `scripts/test-security.ts`, `scripts/test-auth-runtime.ts` |
| Media timeout and safe errors | unit/integration | `scripts/test-media-storage.ts` |
| Database-derived media reconciliation | operations | `scripts/test-media-reconciliation.ts` |
| SQLite portability inventory | static | `scripts/check-database-boundaries.mjs` |

## Rollout and rollback

Auth and timeout changes preserve existing hashes, tokens, media keys, and
database rows. Reconciliation is read-only/copy-only. Rollback restores prior
application code without data conversion.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Evidence:

Implemented asynchronous bcrypt work in every request path, typed session-row
handling, high-priority secure cookies, bounded Supabase Storage requests and
stream reads, an aggregate database-derived media manifest/reconciler, and an
enforced direct-SQLite inventory.

On 2026-08-03, `npm run check` proved async auth/session behavior, storage
header/body timeouts, streamed five-MiB enforcement, safe provider errors,
media reconciliation, and 42 approved direct SQLite modules with zero new
boundaries. `npm run release` passed security, adapter, request, publication,
build, and production HTTP tests with zero production dependency
vulnerabilities. `npm run test:operations` passed migration, integrity, backup,
and verified restore checks.
