---
id: ADR-0013
title: Staged PostgreSQL and identity migration
status: accepted
date: 2026-08-03
deciders: [MirtPage]
related: [FE-026, BE-002, BE-024, BE-026, BE-027, DEP-021, DEP-022, DEP-023, ADR-0012]
---

# ADR-0013 - Staged PostgreSQL and identity migration

## Context

MirtPage currently owns authenticated identities, password hashes, opaque
sessions, roles, business bindings, and tenant authorization in SQLite. Many
application modules use the synchronous `node:sqlite` API directly. Supabase
Storage is already optional behind a port, but moving the database and replacing
identity authority at the same time would combine two high-risk migrations and
make rollback or authorization regressions harder to isolate.

## Decision drivers

- Preserve every retained demo/customer row, password hash, role, session
  revocation rule, media reference, and tenant boundary.
- Reach managed PostgreSQL without falsely treating SQLite SQL as portable.
- Keep local development and test fixtures deterministic and inexpensive.
- Permit a later Supabase Auth decision without coupling it to data cutover.
- Make each migration phase independently testable and reversible.

## Considered options

1. Replace SQLite, media, and authentication with Supabase in one release. This
   minimizes transitions but maximizes blast radius and rollback ambiguity.
2. Point existing synchronous SQL at a PostgreSQL connection string. This is
   not technically valid because driver semantics, SQL dialect, transactions,
   generated identifiers, JSON, collation, and concurrency differ.
3. Stage the move: harden provider-neutral media; inventory and port database
   repositories; rehearse schema/data reconciliation; cut over PostgreSQL while
   retaining MirtPage-owned auth; then evaluate Supabase Auth separately.

## Decision

Choose option 3. SQLite remains the current single write authority until all
authoritative workflows depend on explicit asynchronous repository ports and
the PostgreSQL adapters pass the same security, tenant, workflow, browser, and
reconciliation gates. Supabase may host PostgreSQL and private Storage, but the
provider is infrastructure rather than application authority.

The first database cutover migrates MirtPage identity tables and preserves
existing bcrypt hashes and opaque session semantics. Supabase Auth is neither
required nor enabled. Adopting it later requires a separate ADR and migration
for account linking, sessions, recovery, MFA, role claims, tenant bindings, and
rollback.

## Consequences

### Positive

- Database, object storage, and identity failures can be isolated and rolled
  back independently.
- Existing users and sessions do not require an avoidable password reset solely
  because the database host changes.
- Port inventory and dual-adapter tests expose SQLite-specific assumptions
  before production data moves.
- Supabase remains an option without making domain code depend on its SDK.

### Negative / debt

- MirtPage temporarily maintains SQLite and PostgreSQL adapters during the
  transition.
- Direct synchronous database calls must be converted in bounded vertical
  slices before multi-instance operation is possible.
- Stronger account recovery, MFA, and a possible managed identity provider stay
  as separately planned security work.

## Verification

BE-026 enforces auth/media boundaries and the SQLite dependency inventory.
DEP-022 rehearses schema/data portability and blocks premature runtime claims.
Every cutover slice must run existing tenant-security and workflow tests against
both adapters until SQLite retirement receives its own accepted rollout spec.

The first executable rehearsal passed on 2026-08-03 for 44 tables and 2,849
rows, including translated constraints, indexes, triggers, sequences, stable
fingerprints, invariant probes, and byte preservation of the SQLite source.
On 2026-08-05, all authoritative runtime workflows passed the disposable
PostgreSQL adapter suite and the guarded empty-target production-copy rehearsal.
`MIRTPAGE_DATABASE_DRIVER=postgres` is now an accepted fail-closed runtime mode;
SQLite remains the current local authority until DEP-023 completes the real
Supabase copy and monitored switch. MirtPage authentication remains unchanged.
