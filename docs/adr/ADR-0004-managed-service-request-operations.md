---
id: ADR-0004
title: Managed-service requests and versioned publication
status: accepted
date: 2026-07-22
deciders: [SuqPage]
related: [FE-003, BE-003, DEP-003, ADR-0001, ADR-0002]
---

# ADR-0004 — Managed-service requests and versioned publication

## Context

The current controlled pilot gives business owners direct catalog, settings,
inquiry, and delivery controls. SuqPage is moving to a managed-service model in
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
- The four-client SQLite pilot must gain the workflow additively without a risky
  all-at-once role cutover.

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

- A public prospect can submit an onboarding request without an account. After
  acceptance, the client receives a normal invited account for the first
  release; passwordless access remains future work.
- Clients can submit and track requests, answer clarifications, use their
  inquiry/delivery workspace, preview proposed revisions, and approve or reject
  them. They do not directly manage business settings, catalog structure,
  products, options, design, or publication after the permission cutover.
- Team members work only on assigned tenants/requests and cannot onboard or
  submit on behalf of clients, manage roles, approve as the client, or publish.
- Operations managers can view the operations queue, submit onboarding/change
  requests on behalf of clients, accept prospects, invite clients, assign staff,
  and publish a client-approved revision.
- Platform administrators retain explicit system-wide authority.
- The original request is immutable business input. Only server-validated staff
  work becomes a proposed content revision; unstructured text or AI output never
  writes directly to canonical catalog data.
- Each proposed revision is based on a recorded live content version. Preview
  reads the revision while the public showroom reads the current published
  version. Any change after approval invalidates approval. A manager or
  administrator publishes the latest approved revision atomically and retains
  the previous version for rollback.
- Rollout is additive: intake and operations review ship before existing owner
  mutation authority is removed. Permission cutover occurs only after the
  replacement client workspace and publication workflow pass their gates.

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
