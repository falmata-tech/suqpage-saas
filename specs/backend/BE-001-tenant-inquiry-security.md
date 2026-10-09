---
id: BE-001
title: Tenant-scoped canonical inquiry workflow
status: done
related: [FE-052, FE-041, FE-001, DEP-001, BE-009, BE-011, BE-014, BE-017, BE-033, BE-050]
owners: [backend, security]
last_updated: 2026-08-01
change_level: L2
---

# BE-001 — Tenant-scoped canonical inquiry workflow

## Problem and outcome

Public input is untrusted. Suqpage must retain useful inquiries without allowing
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
- Canonical public inbox submissions use `contact_method='phone'` and contain
  a normalized phone with 7–15 digits. Copy and external handoff preparation do
  not call this persistence boundary.

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

Scenario: Contactless platform submission
  GIVEN a valid tenant and inquiry-eligible offering
  WHEN a public caller omits the phone or supplies a non-phone contact method
  THEN the request is rejected
  AND no inquiry or inquiry item is committed
```

## Observability and privacy

Audit/rate data may include salted identity hashes, status, tenant, and safe error
categories. Full contact values and notes must not be general log fields.

## Test plan and evidence

- `scripts/test-security.ts`: canonical validation, tenant, options, quantities,
  idempotency, media, and inquiry isolation.
- `scripts/http-smoke.mjs`: HTTP forged/valid/duplicate/rate-limit behavior.
- `tests/acceptance/app.spec.ts`: browser persistence and owner visibility.
- Prior evidence: security, HTTP, all-role browser, type, build,
  migration/restore, and audit gates passed 2026-07-24.
- Current revision evidence: security integration, production HTTP smoke, and
  10/10 browser acceptance passed 2026-08-01, including normalized phones,
  rejection of non-phone and malformed contact without committed rows,
  idempotent submission, and visibility in the correct tenant inbox.

## Rollout and rollback

Migrations are idempotent within the pilot. Any table rebuild requires a stopped
single instance, a matching integrity-checked backup no older than 24 hours,
explicit one-command approval, and adequate disk. Rollback requires schema
compatibility or verified database/media restore.

`BE-009` and `DEP-008` now define the implemented eligibility rule:
availability is canonical, requested quantity is optional bounded text intent
under BE-014, and no active inventory count is stored or consulted.

## S2h public experience revision

FE-041 now governs the shared profile's linked inline product view, simplified
public features/unit presentation, single/group inquiry choice, progressive phone
form and search panel beside the persistent map. It supersedes earlier public
modal, production-fact, persistent empty-cart and map-replacement statements here.
Retained data, canonical server security and legacy recovery contracts remain.
Implementation/evidence tracked in docs/SUQPAGE-TRANSITION-CHECKLIST.md S2h.

## S33 local extension — FE-052

An authenticated client may update status only for their own business's inquiry.
Operations authorization is retained; another owner or a team member is denied.
Canonical status values are validated server-side and the update/audit commit
atomically. UI translation never changes submitted values. Phone contact offers
Call and SMS; email remains available for retained email inquiries. Opening a
contact link does not imply message delivery. Local regression evidence is in
`scripts/test-launch-clarity.ts` and `scripts/test-workflow-wiring-audit.ts`;
publication remains pending FE-052 visual/release gates.
