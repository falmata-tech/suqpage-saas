---
id: BE-027
title: PostgreSQL runtime adapters and persistence parity
status: in_progress
related: [DEP-023, ADR-0013]
owners: [backend, security, operations]
last_updated: 2026-08-04
change_level: L4
---

# BE-027 - PostgreSQL runtime adapters and persistence parity

## Problem and outcome

MirtPage's application behavior is bound to synchronous SQLite calls, which
cannot provide durable writes from Vercel Functions. The runtime needs explicit
asynchronous persistence ports and PostgreSQL adapters that preserve tenant,
authorization, transaction, idempotency, and workflow behavior without coupling
the domain to Supabase or changing MirtPage-owned authentication.

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
  and authorization behavior remain MirtPage-owned.
- Bounded pooled connections suitable for serverless production and deterministic
  adapter injection for tests.

### Non-goals

- Supabase Auth, realtime subscriptions, payment processing, multi-region writes,
  or changing public product behavior.

## Invariants and contracts

- PostgreSQL is accessed through application-facing ports; UI and domain modules
  never receive a `pg` client, SQL string, or Supabase SDK.
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

Adapters ship dark while SQLite remains authoritative. DEP-023 owns the one-time
copy, reconciliation, authority switch, monitoring, and rollback deadline. No
dual-write mode is permitted.

## Readiness checklist

- [x] Runtime behavior and affected users are explicit
- [x] Tenant, security, privacy, and data invariants are explicit
- [x] Positive, negative, retry, and failure scenarios are present
- [x] Test, observability, rollout, and rollback ownership are defined
- [x] Identity migration is explicitly excluded
