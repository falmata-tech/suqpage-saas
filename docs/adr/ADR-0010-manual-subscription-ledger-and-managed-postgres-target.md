---
id: ADR-0010
title: Manual subscription ledger and managed PostgreSQL target
status: superseded
date: 2026-07-30
deciders: [MirtPage]
related: [FE-018, BE-017, DEP-015, ADR-0001, ADR-0002, ADR-0011]
---

# ADR-0010 - Manual subscription ledger and managed PostgreSQL target

## Context

Monthly showroom access must be enforceable before MirtPage sets pricing or
chooses any payment process. The current application uses synchronous
`node:sqlite` adapters throughout. Claiming an immediate Supabase switch would
hide a substantial data, auth, media, job, and operations migration.

## Decision drivers

- Subscription state needs a simple manual renewal path.
- Price is intentionally unset and optional in renewal records.
- Future production growth needs managed PostgreSQL and object storage.
- Payment integration is outside the current decision.

## Considered options

1. Encode account dates directly on businesses: simple but loses immutable
   renewal evidence and mixes content state with account access.
2. Add checkout now: premature because price and payment operations are not
   decided.
3. Add a manual subscription and renewal ledger now; decide pricing and payment
   separately later.

## Decision

Persist subscriptions and manual renewal records. The pilot lets authorized
operations staff confirm that a client renewed and computes a four-day grace
period from trusted dates. Amount is nullable in storage and is not collected
by the current UI; it does not define a public or contractual price. No checkout
or payment provider is selected or implemented.

Managed PostgreSQL, with Supabase as a candidate, is the production scale target.
It requires new SQL adapters, migration/reconciliation, connection strategy,
object storage, job scheduling, realtime policy, backup/restore, and rollback
evidence. Until that work is complete, Docker remains one application instance
with persistent SQLite and media volumes.

## Consequences

### Positive

- Access rules are testable before pricing is decided.
- Manual local operations need no payment integration.
- Future Postgres work has an explicit boundary rather than a configuration
  illusion.

### Negative / debt

- Operations must record pilot payments.
- SQLite adapters must later be replaced behind domain contracts before
  horizontal scaling.

## Verification

BE-017 tests entitlement boundaries, immutable idempotent renewal records, and
privacy analytics. DEP-015 documents the managed-database migration boundary.

## Superseded decision

`ADR-0011` supersedes only the access-enforcement part of this decision.
Renewal records remain useful advisory operations data, but their dates no
longer hide a published showroom or remove it from discovery. Publication and
explicit administrator suspension are the public-visibility authority. The
manual ledger, no-checkout decision, and managed PostgreSQL target remain in
force.
