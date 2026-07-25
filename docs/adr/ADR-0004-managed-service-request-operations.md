---
id: ADR-0004
title: Managed-service requests and versioned publication
status: accepted
date: 2026-07-22
deciders: [SuqPage]
related: [FE-003, BE-003, DEP-003, ADR-0001, ADR-0002, ADR-0006]
---

# ADR-0004 — Managed-service requests and versioned publication

## Context

Before this decision, the controlled pilot gave business owners direct catalog,
settings, inquiry, and delivery controls. SuqPage moved to a managed-service model in
which clients describe onboarding or changes in their own words and authorized
staff translate those requests into canonical business data and custom designs.

Directly editing an active tenant cannot support mandatory client approval: it
can expose unfinished changes before the client reviews them. Giving every team
member administrator access would also violate least privilege and weaken audit
ownership.

## Decision drivers

- Clients should not need to understand collections, categories, option groups,
  design keys, stock rules, or publication controls.
- Original client instructions and attachments must remain attributable and
  distinct from the structured data staff creates.
- An existing live showroom must remain unchanged until the client approves the
  exact proposed revision.
- Staff access must be individual, tenant-scoped, capability-enforced, and
  auditable.
- The four-client SQLite pilot must preserve showroom data while converging on
  one managed-service permission model.

## Considered options

1. Keep owner self-service and add a support form. This does not deliver the
   simplified managed-service outcome and preserves conflicting edit authority.
2. Let all staff use the administrator role and edit live data. This is simple
   but violates least privilege and cannot provide a truthful private preview.
3. Add managed requests, assigned staff roles, and request-scoped content
   revisions that publish atomically after approval. This adds workflow and
   versioning complexity but satisfies the product and security requirements.

## Decision

Adopt option 3.

- A public prospect can submit an attachment-free expression of interest without
  an account. After acceptance, the client receives an invited account;
  authorized staff may also create a client workspace directly for a referral.
  Passwordless access remains future work.
- Clients can submit and track requests, answer clarifications, use their
  inquiry/delivery workspace, preview proposed revisions, and approve or reject
  them. They do not directly manage business settings, catalog structure,
  products, options, design, or publication.
- Team members work only on assigned tenants/requests and cannot onboard or
  submit on behalf of clients, manage roles, approve as the client, or publish.
- Operations managers can view the operations queue, submit requests on behalf
  of clients, create client workspaces, accept prospects, invite clients, assign
  staff, manage inquiry/delivery activity, and publish a client-approved
  revision. The server derives request type for existing clients.
- Platform administrators retain explicit system-wide authority.
- The original request is immutable business input. Only server-validated staff
  work becomes a proposed content revision; unstructured text or AI output never
  writes directly to canonical catalog data.
- Each proposed revision is based on a recorded live content version. Preview
  reads the revision while the public showroom reads the current published
  version. Any change after approval invalidates approval. A manager or
  administrator publishes the latest approved revision atomically and retains
  the previous version for rollback.
- Migration 7 converts all example and compatibility-owner profiles to clients,
  revokes their sessions, and removes legacy live mutation rather than retaining
  a second product model.

## Cutover amendment — 2026-07-22

The four current tenants are example clients, not external compatibility
customers. SuqPage therefore completes the planned cutover now: authorized
staff can create a client workspace without a lead, request type is derived from
publication state, operations managers replace owner inquiry/delivery actions,
and no account retains direct live catalog/settings/design authority. This
amendment narrows compatibility debt without changing the versioned-publication
architecture selected above.

## Consequences

### Positive

- Clients receive a substantially simpler experience without losing inquiry and
  delivery visibility.
- Live showrooms remain stable while work is prepared and reviewed.
- Staff responsibility, client approval, and publication are attributable.
- The domain keeps unstructured requests separate from canonical catalog truth.

### Negative / debt

- Content revision editing, preview, conflict detection, publication, and
  rollback add a new application boundary.
- The controlled pilot needs more roles, assignments, migration coverage, and
  operational storage before broad onboarding.
- A brand-new custom renderer still requires a reviewed code/deployment change;
  the request workflow does not become a generic page builder.
- Passwordless access and automated WhatsApp delivery are deferred until a
  reliable provider contract is accepted.

## Verification

`FE-003`, `BE-003`, and `DEP-003` scenarios; role and tenant denial tests;
request/attachment security tests; revision approval/concurrency/rollback tests;
production browser workflows; migration/backup/restore; `npm run release`; and
container verification.

`ADR-0006` accepts a narrower future exception for versioned basic product
upkeep after first publication. Until `FE-008`, `BE-009`, and `DEP-008` reach
done with mapped evidence, this ADR's verified no-direct-product-edit runtime
behavior remains current. The exception does not supersede managed requests,
client approval, or manager publication for structural and visual work.
