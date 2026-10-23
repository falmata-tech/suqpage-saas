---
id: FE-077
title: Shipment records with identified shipper and receiver
status: draft
related: [BE-064, FE-069, BE-058, FE-076, BE-063, DEP-048]
owners: [product, frontend, mobile, security]
last_updated: 2026-10-21
change_level: L2
---

# FE-077 — Shipment record parties and access

This is a planned extension, not current behavior. Do not implement provider-owned
operations or change current chat routing under this draft. Current chats continue
to MirtPage's internal staff; the sole selectable arranging provider remains
SharedTrucks Logistics. FE-069/BE-058 own the current independently verified
recipient portal and existing ordered shipment legs.

## Problem and outcome

The current verified shipment portal grants access to one recipient email. A
larger order may involve a distinct shipper and receiver who both need the same
record. The future workflow must clearly identify both parties and allow each
person to independently verify the selected email before they can read only that
shipment record.

## Scope

### In scope

- Identify a shipper and receiver as a published business or a custom contact.
- Snapshot each selected name/email and issue independent, shipment-scoped
  read access after verification.
- Show the arranging logistics company and its brand, while keeping each leg's
  carrier distinct.

### Non-goals

- Changing current recipient-only access before BE-064 and release gates are met.
- Provider-owned accounts, chat routing, price calculation, status scans, ETA,
  bookings, payments or delivery confirmation.
- Automatically granting a business's private account or notification email.

## Product direction

Use **Shipment records** for the visitor-facing list and **Shipment record** for
one journey. A record organizes the arranging logistics company, shipper, receiver
and ordered transport legs, including external carrier links/codes. It is not proof
of payment, booking, pickup, delivery, live status or an ETA. The selected
arranging company's official name and identity appear on the record; each leg's
provider remains separately identified.

For a future shipment, staff may identify shipper and receiver independently as
either a published MirtPage business or a custom party. A custom party needs a
name and email. For a selected business, default to its published public contact
email when present and allow staff to choose a different contact email. Never
expose or infer the owner's private sign-in email, private notification email or
phone. Snapshot the displayed name and selected contact when the record is
submitted; later showroom edits do not silently change shipment identity.

Each selected party email can gain read access only to that shipment after that
person independently verifies that exact email. Verification for the shipper
does not verify the receiver. If both roles use the same normalized email, verify
once and show both roles without duplicate access. Replacing a party email is an
explicit audited revoke-and-invite operation; it must not silently transfer an
existing verified session. Staff can prepare a record without either party
verifying first.

Any repeat-customer discount is an explicit offer made by the logistics provider,
not a MirtPage-computed entitlement. Amount, currency, basis, visibility and quote
terms require a separately approved commercial specification; this draft adds
no automatic price or discount calculation.

## Scenarios

1. GIVEN staff select a published business for either party WHEN its current
   published contact email exists THEN the record proposes that address and lets
   staff choose another address; it never reads private account email.
2. GIVEN staff enter a custom party WHEN name/email validation fails THEN the
   record is not submitted and neither party receives a partial access grant.
3. GIVEN a record names a shipper and receiver WHEN each verifies their own
   selected email THEN each can read only that record and its public journey;
   neither can read the other's other shipments or private chats.
4. GIVEN an email is changed after submission WHEN staff confirm the change THEN
   the old party grant is revoked, the new address must verify independently,
   and an audit event identifies the authorized actor without logging a code.
5. GIVEN two parties share one normalized email WHEN it is verified THEN it gets
   one shipment-scoped grant and both named roles remain visible.
6. GIVEN staff create/edit records WHEN the current provider arrangement is used
   THEN MirtPage's internal transport staff still handle the chat. No logistics
   provider tenant, staff access, routing, price, status, delivery or ETA is
   implied by the displayed provider identity.

## Readiness and dependencies

The party-scoped access contract is approved: both selected party emails can
access the record after separate email verification. Before status can move to
ready, BE-064 must define additive access-grant storage, email-change/revocation
transactions, canonical published-contact lookup, staff permissions, audit,
retention, mail and tenant isolation. Provider-owned operations remain explicitly
out of scope until a separate owner-approved multi-company service milestone.
FE-069's current recipient-only portal remains authoritative until those gates
and an additive migration pass. No reset, backfill from account emails, or
historical recipient transfer is allowed.

Visual work must review staff record creation/edit, visitor/owner list and detail,
and en/am/om desktop web, phone web and Expo states before full gates.

## Scenarios

```gherkin
Scenario: Both selected parties can read one record after separate verification
  GIVEN staff have submitted a shipment record with a shipper and receiver email
  WHEN each person verifies their own selected email
  THEN each can read that shipment record and its public route
  AND neither gains access to another person's records or private chat

Scenario: A business party uses a public contact, not private account data
  GIVEN staff select a published MirtPage business for a shipment party
  WHEN the record proposes a contact email
  THEN it uses only the business's published contact email
  AND it never reveals a sign-in or private notification email
```

## Test plan

| Criterion | Level | Planned evidence |
|---|---|---|
| Party selection, snapshots and independent verification | integration | New FE-077/BE-064 acceptance tests after the contract reaches ready |
| One record cannot expose another record or private chat | security | Tenant/access regression and recipient/party browser workflows |
| Staff save, cancel, locale and phone layout | browser | Desktop/phone Chrome and Expo review after implementation |

## Rollout and rollback

No rollout is authorized by this draft. Before status can move to ready, define
an additive migration, existing-recipient compatibility, rollback boundaries and
email/access-grant sequencing in BE-064/DEP-048. Preserve all existing recipient
grants; do not backfill an account email or remove shipment data. Current source
and database remain single-recipient until the new contract and gates are approved.
