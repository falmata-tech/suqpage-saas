---
id: BE-003
title: Managed request, permission, and publication security
status: in_progress
related: [FE-003, DEP-003, ADR-0004]
owners: [backend, security]
last_updated: 2026-07-22
change_level: L3
---

# BE-003 — Managed request, permission, and publication security

## Problem and outcome

Unstructured onboarding/change requests, pre-account contacts, attachments,
staff assignments, and draft publication introduce private data and new
privileged actions. The backend must preserve the original request, enforce
least privilege, keep proposed content separate from live catalog authority, and
publish only the exact client-approved revision.

## Scope

### In scope

- Request, Attachment, Request Event, Staff Assignment, Invitation, Content
  Revision, Approval, and Publication application contracts.
- Public onboarding, authenticated client requests, and manager on-behalf
  requests.
- Client, team-member, operations-manager, and administrator authorization.
- Canonical revision validation, optimistic base-version conflict detection,
  atomic publication, audit, and rollback metadata.
- Additive migration from current admin/owner roles before later client cutover.

### Non-goals

- Automatically trusting or applying unstructured/AI-derived values.
- Editing current live catalog rows while work is pending approval.
- Passwordless authentication or external workflow engines.
- Broad staff access without tenant/request assignment.

## Domain language and invariants

- `Request` has type `onboarding` or `change` and status `submitted`,
  `under_review`, `needs_information`, `approved_for_work`, `in_progress`,
  `client_review`, `client_approved`, `published`, `completed`, `rejected`, or
  `cancelled`.
- Onboarding may begin without `business_id`; a change request always resolves
  to one business before staff work begins.
- The original instruction, original submitter, represented client/prospect,
  creation time, and attachment associations are immutable.
- Clarifications and status transitions append attributable events.
- Public submission uses idempotency and privacy-preserving rate limits.
- A team member needs an active assignment for every private read/write.
- A manager may create on behalf, accept/invite, and assign. Only a manager or
  administrator may publish, and only after the represented client approves the
  exact latest revision.
- A client may approve only a revision for their own business. Staff cannot
  approve as the client; managers submitting on behalf still require final
  client approval.
- Editing or replacing an approved revision clears approval.
- Revision preview is private. Canonical public queries read only the published
  business/catalog version.
- Publication validates all business/catalog/option/media invariants and commits
  the approved revision plus version/audit state atomically.

## Contracts

- Application ports remain independent of Next.js/HTTP/SQLite: request
  persistence, attachment storage, notification, invitation delivery, revision
  persistence, and publication transaction.
- Server input is schema-validated and bounded before persistence or image
  decoding. Attachment storage receives only verified/sanitized bytes and
  server-generated keys.
- Public response contains a random non-sequential reference, never a database
  identifier, contact, token, or attachment path.
- Invitation tokens are random, single-use, stored hashed, expire, and are
  revoked after acceptance or account/security changes.
- Role checks use explicit capabilities. Interface hiding has no authority.
- Assignment, request transition, clarification, approval, rejection,
  publication, rollback, and privileged reads write audit events with safe
  identifiers.
- Publication rejects a stale `base_content_version`; staff must rebase and
  obtain new client approval.

## Scenarios

```gherkin
Scenario: Public onboarding is committed safely
  GIVEN bounded valid input and verified images
  WHEN an unauthenticated prospect submits with a new idempotency key
  THEN one request and its attachments are committed
  AND notification failure cannot roll back or duplicate the request

Scenario: Cross-tenant client access is denied
  GIVEN a client for tenant A and a request for tenant B
  WHEN the client reads, comments, previews, approves, or attaches to that request
  THEN the operation is denied
  AND tenant B state is unchanged

Scenario: Unassigned staff access is denied
  GIVEN a normal team member without an assignment
  WHEN they attempt to read or modify a private request
  THEN the operation is denied even if they know its identifier

Scenario: Normal team member submits on behalf
  GIVEN an authenticated normal team member
  WHEN they call an on-behalf onboarding or change operation directly
  THEN authorization is denied
  AND no request or prospect is created

Scenario: Approved revision publishes atomically
  GIVEN the client approved the latest revision based on the current live version
  WHEN a manager publishes it
  THEN all canonical changes and the new content version commit together
  AND the previous published revision is retained for rollback

Scenario: Approved revision becomes stale
  GIVEN an approved revision whose base live version has changed
  WHEN publication is attempted
  THEN publication is rejected without partial catalog changes
  AND a new preview and client approval are required
```

## Quality impact

- Security and tenant isolation: capability plus assignment checks protect every
  request, attachment, preview, inquiry, delivery, and publication operation.
- Privacy and data retention: contact/request contents are private fields with
  explicit retention/deletion and attachment cleanup behavior.
- Accessibility and responsive behavior: owned by `FE-003`.
- Localization and merchant-entered values: canonical structuring preserves
  exact values; automated translation has no authority.
- Performance and limits: indexed queue/status/assignment lookups, pagination,
  bounded events/attachments, and one-instance publication transaction.
- Failure recovery and idempotency: request submit and publication are retry
  safe; revisions and prior published state support recovery.

## Observability

Audit actor, capability, safe request/business/revision identifiers, transition,
assignment, approval, publication version, conflict, and safe error category.
Never log raw contact, instructions, clarification text, attachment names or
contents, invitation tokens, or customer data.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Request lifecycle and immutable original | domain/integration | `scripts/test-requests.ts` |
| Public idempotency, limits, and rate behavior | HTTP/security | `scripts/http-smoke.mjs`, `scripts/test-requests.ts` |
| Client tenant and staff assignment isolation | security | `scripts/test-requests.ts` |
| Manager-only on-behalf/invite/assign/publish | security/acceptance | `scripts/test-requests.ts`, `tests/acceptance/app.spec.ts` |
| Exact approval, stale conflict, atomic publish, rollback | integration | `scripts/test-revisions.ts` |
| Existing inquiry/delivery isolation remains | regression | `scripts/test-security.ts`, `tests/acceptance/app.spec.ts` |

## Rollout and rollback

Use additive tables/columns and dual-capability compatibility first. Back up and
test restore before role cutover. Existing owner sessions are revoked when an
account becomes a client. Rollback before cutover disables request routes while
retaining data. Rollback after cutover restores the previous permission mapping
only from an approved migration checkpoint; published content rollback uses the
retained prior revision.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Filled only when `status: done` after every mapped gate passes.

### Verified additive increment

- Request, attachment, event, and assignment tables plus application/storage
  ports are active.
- Public creation is idempotent, privacy-rate-limited, bounded, image-sanitized,
  and returns only a random reference.
- Private attachment reads are administrator-only and return 404 to anonymous or
  unauthorized callers. Later role capabilities and revision publication remain.
