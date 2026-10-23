---
id: BE-027
title: PostgreSQL runtime adapters and persistence parity
status: in_progress
related: [BE-035, BE-028, BE-029, BE-030, FE-033, DEP-023, DEP-024, DEP-026, DEP-027, ADR-0013, ADR-0014, ADR-0015]
owners: [backend, security, operations]
last_updated: 2026-10-20
change_level: L4
---

# BE-027 - PostgreSQL runtime adapters and persistence parity


Current persistence contract: BE-035/DEP-031 and ADR-0020 supersede every retained
SQLite fixture, fallback and copy-tool exception in this specification. Only native
PostgreSQL setup/tests/archives are executable. Earlier migration-parity evidence
below is historical; current acceptance uses PostgreSQL-only fixtures.

## S153 — contain idle pool disconnects (focused checks pass; rollout pending)

GIVEN an idle PostgreSQL client loses its backend connection WHEN the installed
driver emits its pool error event THEN the runtime factory handles that event
without an uncaught process error and records only a fixed sanitized diagnostic.
Never log the Error, client, connection URL, credentials, SQL, row or authored data.
The driver owns closing/removing the failed client; a later operation may acquire
a fresh client. Register one handler per pool, with no global exception handler,
pool shutdown, automatic write retry or fabricated successful query.

GIVEN an active query or transaction fails THEN its original rejection and
rollback/release behavior remain intact. Verify the actual factory and installed
pg-pool lifecycle with a controlled non-network Client port: idle-event containment,
safe diagnostic, failed-client eviction/fresh query, and active failures. The
existing controlled old-source RED is retained. It does not prove why the earlier
local web/worker process disappeared, because that process log is unavailable.
Master §§16/17 already require private failure handling and bounded adapters;
no database, tenant, schema or product contract changes are introduced.

Focused regression: `scripts/test-postgres-pool-errors.ts`, included in the
existing native-PostgreSQL check and disposable PostgreSQL CI sequence. Real
database outage qualification and the batch's full gates remain separate.
All three focused cases and scoped types pass. The same regression with the
frozen old adapter fails at actual idle-event dispatch; its two active-failure
cases still pass. The [driver's Pool documentation](https://node-postgres.com/apis/pool#error)
confirms this lifecycle; no application retry or global error suppression is used.

## Problem and outcome

Suqpage's application behavior is bound to synchronous SQLite calls, which
cannot provide durable writes from Vercel Functions. The runtime needs explicit
asynchronous persistence ports and PostgreSQL adapters that preserve tenant,
authorization, transaction, idempotency, and workflow behavior without coupling
the domain to Supabase or changing Suqpage-owned authentication.

## Scope

### In scope

- Ports and PostgreSQL adapters for every authoritative business, user, session,
  request, revision, offering, inquiry, discovery, analytics, subscription,
  support, rate-limit, and media-manifest workflow.
- PostgreSQL-compatible queries, transactions, generated identifiers, JSON,
  case-insensitive matching, aggregations, constraints, indexes, and triggers.
- Runtime selection through validated configuration; PostgreSQL mode fails
  closed when its connection is absent or invalid.
- Existing bcrypt password hashes, opaque sessions, role checks, tenant binding,
  and authorization behavior remain Suqpage-owned.
- Bounded pooled connections suitable for serverless production and deterministic
  adapter injection for tests.

### Non-goals

- Supabase Auth, realtime subscriptions, payment processing, multi-region writes,
  or changing public product behavior.

## Invariants and contracts

- PostgreSQL is accessed through application-facing ports; UI and domain modules
  never receive a `pg` client, SQL string, or Supabase SDK.
- Application and component modules never import the synchronous SQLite adapter;
  shared server components await driver-selectable runtime ports.
- Every tenant-owned read and mutation carries and enforces its business scope.
- Multi-write operations use one PostgreSQL transaction and preserve existing
  all-or-nothing behavior. Retried public writes preserve idempotency.
- Password hashes and session tokens are never logged or returned by persistence
  adapters. Database errors are mapped to bounded application failures.
- The PostgreSQL schema and adapter pass the same authorization, tenant-isolation,
  workflow, pagination, and reconciliation tests as SQLite before runtime mode is
  enabled.

## Scenarios

```gherkin
Scenario: A tenant-scoped workflow runs on PostgreSQL
  GIVEN PostgreSQL is configured as the authoritative runtime
  AND an authenticated owner belongs to tenant A
  WHEN the owner reads or changes tenant A data
  THEN the PostgreSQL adapter completes the same workflow as SQLite
  AND no database implementation detail reaches the UI or domain

Scenario: A user attempts a cross-tenant mutation
  GIVEN an authenticated user belongs to tenant A
  WHEN the user submits an identifier owned by tenant B
  THEN the PostgreSQL transaction rejects the mutation
  AND tenant B data remains unchanged

Scenario: PostgreSQL configuration or a transaction fails
  GIVEN PostgreSQL mode is selected
  WHEN its connection is missing, invalid, exhausted, or interrupted
  THEN startup or the affected operation fails closed with a bounded error
  AND credentials and row data are absent from logs

Scenario: A public write is retried
  GIVEN an inquiry or signup was committed with an idempotency key
  WHEN the same request is retried against PostgreSQL
  THEN one canonical record exists
  AND the response resolves to the original result
```

## Test plan

| Gate | Evidence |
|---|---|
| Query and transaction parity | PostgreSQL integration tests for every port |
| Tenant and role security | Existing and new negative security suites on PostgreSQL |
| Workflow parity | Acceptance workflows against a PostgreSQL-backed production build |
| Scale and pooling | Paginated scale fixtures plus bounded connection/failure tests |
| Migration integrity | Counts, fingerprints, constraints, sequences, and sampled relationships reconcile |

## Rollout and rollback

Adapters are driver-selectable, while DEP-023 owns the one-time real Supabase
copy, reconciliation, authority switch, monitoring, and rollback deadline. No
dual-write mode is permitted.

## Readiness checklist

- [x] Runtime behavior and affected users are explicit
- [x] Tenant, security, privacy, and data invariants are explicit
- [x] Positive, negative, retry, and failure scenarios are present
- [x] Test, observability, rollout, and rollback ownership are defined
- [x] Identity migration is explicitly excluded

## Current implementation evidence

All authoritative application workflows now select asynchronous PostgreSQL
adapters when `SUQPAGE_DATABASE_DRIVER=postgres`; the preview guard has been
removed. The disposable PostgreSQL 17 gate runs catalog, identity/session,
request, revision, recipe persistence, publication, inquiry, signup, product,
discovery, subscription, analytics, staff, invitation, support, audit, rate
limit, transaction, and production-preflight workflows. The same gate verifies
the guarded production-copy path against an empty `public` schema and reconciles
44 tables, 2,849 fixture rows, 83 checks, 79 foreign keys, 78 indexes, 14 triggers, 307
not-null columns, sequences, fingerprints, and four negative invariant probes.

On 2026-08-05 the guarded live copy reconciled the then-current 44 tables and
3,030 rows into Supabase `public`. A dedicated least-privilege runtime login was
provisioned and verified through the transaction pooler, and production preflight
passed against that login and private Supabase Storage.
Production authenticated smoke testing found and removed one retained direct
SQLite call in the shared dashboard shell. The database-boundary gate now scans
`components/` as well as `app/` and `lib/` to prevent recurrence.

BE-027 remains `in_progress` until DEP-023 records PostgreSQL-backed production
acceptance/security evidence and the monitored authority switch. SQLite adapters
remain explicit local-development and rollback implementations; they are not
dual-written.

ADR-0015 and DEP-027 make local Supabase PostgreSQL the normal development
runtime. SQLite adapters remain only for isolated compatibility tests,
read-only migration evidence, and the bounded rollback window.
