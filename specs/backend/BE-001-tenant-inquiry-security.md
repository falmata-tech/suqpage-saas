---
id: BE-001
title: Tenant-scoped canonical inquiry workflow
status: done
related: [FE-001, DEP-001]
owners: [backend, security]
last_updated: 2026-07-20
change_level: L2
---

# BE-001 — Tenant-scoped canonical inquiry workflow

## Problem and outcome

Public input is untrusted. SuqPage must retain useful inquiries without allowing
forged products/options, cross-tenant references, excessive quantities, duplicate
records, or uncontrolled spam.

## Contracts and invariants

- Target business exists and is active.
- Items belong to that business, are published, available/limited, and in stock.
- Every submitted option name/value exists for its canonical product.
- Item counts, quantities, field lengths, and request bodies are bounded.
- `(business_id, idempotency_key)` deduplicates retries.
- Persistent rate limits use privacy-preserving request identity.
- Client product names and availability snapshots have no authority.

## Scenarios

```gherkin
Scenario: Valid canonical inquiry
  GIVEN an active tenant and inquiry-eligible product
  WHEN valid contact, quantity, and option identifiers are submitted
  THEN one inquiry and its canonical item snapshots are committed atomically

Scenario: Cross-tenant product forgery
  GIVEN a product owned by tenant B
  WHEN a visitor submits it to tenant A's inquiry
  THEN the request is rejected
  AND neither tenant receives a new inquiry

Scenario: Idempotent retry
  GIVEN a previously committed business and idempotency key
  WHEN the same action is retried
  THEN the original inquiry identifier is returned
  AND no duplicate row is created
```

## Observability and privacy

Audit/rate data may include salted identity hashes, status, tenant, and safe error
categories. Full contact values and notes must not be general log fields.

## Test plan and evidence

- `scripts/test-security.ts`: canonical validation, tenant, options, quantities,
  idempotency, media, delivery isolation.
- `scripts/http-smoke.mjs`: HTTP forged/valid/duplicate/rate-limit behavior.
- `tests/acceptance/app.spec.ts`: browser persistence and owner visibility.
- Evidence: security, HTTP, browser, type, build, and audit gates passed
  2026-07-20.

## Rollout and rollback

Additive/idempotent migration only within the pilot. Back up before schema
changes; rollback requires schema compatibility or verified database restore.
