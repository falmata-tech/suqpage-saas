---
id: BE-064
title: Shipment-scoped shipper and receiver access
status: draft
related: [FE-077, BE-058, FE-069, BE-063, FE-076, DEP-048, ADR-0028]
owners: [backend, security, operations]
last_updated: 2026-10-21
change_level: L3
---

# BE-064 — Shipment party identity and access grants

This draft records the future data/security work requested for shipment records.
It does not authorize a migration or change current behavior. Current shipments
retain BE-058's single verified recipient; current chats remain in MirtPage's
internal queue and are not owned by a provider tenant.

## Problem and outcome

BE-058 currently authorizes a shipment record through one verified recipient
email. Future larger orders need both the shipper and receiver to view the same
record without exposing other shipments, private account emails or chat history.
The desired outcome is an auditable, data-preserving grant for each selected
party email, created only after that person verifies it.

## Required future contract

- A shipment can snapshot one shipper and one receiver. Each party is either a
  published MirtPage business ID with a bounded display-name snapshot, or a
  custom bounded name/email. The selected contact email is separately snapshotted.
- Business contact defaults may read only the business's published public email.
  A custom email can be selected explicitly. Never derive a party email from
  `users.email`, `businesses.contact_email`, private notification data, phone,
  chat history or an unverified client snapshot.
- Keep business identity, display name and chosen email as distinct values.
  Validate business ownership/eligibility in the same transaction as submission.
  A public email edit after submission cannot rewrite a record snapshot.
- An authorized staff-created record does not wait for either party to verify.
  Each party then obtains an independent shipment-scoped read grant only after
  verifying its exact chosen email through the existing bounded code-delivery
  mechanism. Reuse of the same normalized address creates one grant with both
  party roles. Verification must not expose other shipments unless they are
  independently granted to the same address under a separately defined policy.
- Editing a party email is an audited authorization change: revoke that party's
  prior shipment grant and issue a new verification invitation atomically. Do
  not transfer old sessions, silently alter another shipment, or let party
  identity/contact fields change shipment ownership.
- Preserve current transport-manager capability checks, optimistic versions,
  idempotency and exact audit. Support-only actors, owners and guests cannot
  create/edit staff records. Client-supplied roles/business IDs never authorize.
- Shipment party email, private data, grants and provider tracking URLs/codes
  stay out of list summaries, public logs, analytics and unrelated mail. Record
  access is read-only; chats and business accounts remain separate.
- The official current arranger identity may be displayed on the record, while
  each leg's carrier stays independently labelled. A displayed logo/name does
  not create a provider tenant, staff access or routing authority.
- No discount is computed by MirtPage. A future provider quote/discount needs a
  separate commercial contract covering amount/currency, offeror, terms,
  visibility, edits and audit before persistence is designed.

## Required qualification before implementation

Define additive schema and migration rollback, per-record grant/session indexing,
concurrent verification/revocation serialization, email delivery snapshots and
bounded retries, business public-contact reads, retention/deletion behavior, RLS,
and a data-preserving migration from existing one-recipient shipments. Test that
all preexisting rows, recipient sessions, chat/account identities and non-target
businesses remain unchanged. No production migration, bulk email, account-email
backfill or destructive cleanup follows from this draft.

Provider-owned chat/record operations require a separate multi-company tenant
specification, approval workflow, staff scoping and provider-specific routing.
Until then, the current MirtPage transport team operates the internal queue.

## Scenarios

```gherkin
Scenario: Shipper and receiver get independent record-scoped grants
  GIVEN a staff-created shipment record has two distinct selected party emails
  WHEN the shipper and receiver each verify their own email
  THEN each receives read access only to that shipment record
  AND neither can access the other's ungranted shipments or private chats

Scenario: A party email is changed safely
  GIVEN a shipment record has an active verified party grant
  WHEN authorized staff change that party's email
  THEN the prior grant and sessions are revoked
  AND the new email receives no access until it verifies
  AND unrelated shipment records remain unchanged
```

## Test plan

| Criterion | Level | Planned evidence |
|---|---|---|
| Separate verification and same-email role handling | integration | New BE-064 code/session/transaction tests after ready |
| Email replacement revokes only the correct record grant | security | Concurrency, audit and tenant-isolation regression tests |
| Existing shipments and recipient sessions remain valid | migration | Isolated migration rehearsal with row/access fingerprints and rollback |
| Private email and verification codes stay out of logs | security | Data-boundary tests and safe-output inspection |

## Rollout and rollback

No migration or rollout is approved by this draft. Before ready, specify an
additive schema and a reversible migration, exercise it on a protected clone,
prove old recipient sessions remain valid, and define the safe rollback boundary.
Do not mutate production, reset data, backfill from Auth/private account fields
or grant access to additional emails until separately qualified and approved.
