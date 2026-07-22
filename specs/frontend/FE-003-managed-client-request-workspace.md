---
id: FE-003
title: Managed client request and review workspace
status: in_progress
related: [BE-003, DEP-003, ADR-0004]
owners: [product, frontend]
last_updated: 2026-07-22
change_level: L3
---

# FE-003 — Managed client request and review workspace

## Problem and outcome

Clients should be able to describe onboarding or showroom changes without
learning SuqPage's catalog and design model. Staff need a clear operations queue,
and clients need a minimal private workspace for requests, inquiries, deliveries,
previews, and approval.

The outcome is a request-led client experience in which unfinished work stays
private and no showroom change becomes public without client approval.

## Scope

### In scope

- Public first-time onboarding intake with contact details, one unstructured
  request field, and up to ten verified image attachments.
- Authenticated client change requests and request history.
- Client clarification responses, status, private preview, approve, and reject
  with comments.
- Existing client inquiry, delivery, and account-security access.
- Assigned team-member work queues and manager-wide operations queue.
- Manager-only onboarding/change submission on behalf of a prospect or client.
- Clear attribution when SuqPage submits a request for a client.
- Separate private draft and public/live showroom states.

### Non-goals

- Client catalog, settings, product, option, design, or publication controls.
- Passwordless login, automated WhatsApp delivery, payment, checkout, or a
  generic visual page builder.
- Automatic conversion of client text or images into published catalog data.
- Removing current owner controls before the complete replacement workflow is
  verified and migrated.

## Domain language and invariants

- **Request:** an onboarding or change instruction submitted by a prospect,
  client, or authorized manager.
- **Clarification:** an attributable message that does not rewrite the original
  request.
- **Proposed revision:** server-validated staff work available only in preview.
- **Published revision:** the version served by the public showroom.
- Clients see only their business and pre-account requests proven through their
  accepted invitation.
- Team members see only assigned work. Manager and administrator capabilities
  are explicit, not inferred from hidden controls.
- Merchant-entered names and values remain verbatim after staff structures them.

## Contracts

- Public intake requires name, a usable email/phone/WhatsApp contact, request
  text of 20–10,000 characters, consent, and a stable idempotency key.
- It accepts zero to ten JPEG, PNG, or WebP files, each no larger than 5 MB.
- The success state returns a non-secret public reference and explains that
  submission is not acceptance or publication.
- A client account exposes Requests, Customer inquiries, Delivery activity,
  Preview/review, and Account security only.
- Staff-created requests visibly state that SuqPage submitted them for the
  client; internal staff identity is not exposed beyond what operations policy
  permits.
- Preview identifies the exact revision and request. Approve/reject actions are
  unavailable for a stale or superseded revision.
- Only manager/admin interfaces expose prospect acceptance, on-behalf intake,
  assignment, invitation, or publication controls.

## Scenarios

```gherkin
Scenario: Prospect submits an initial showroom request
  GIVEN a prospect without an account or business
  WHEN they submit valid contact, instructions, consent, and verified images
  THEN SuqPage stores one private onboarding request
  AND shows a reference without exposing the attachments or internal queue

Scenario: Client requests a catalog change
  GIVEN an authenticated client
  WHEN they submit instructions and images
  THEN the request is linked to only their business
  AND it appears in their request history

Scenario: Manager submits on behalf of a client
  GIVEN an operations manager and a selected client
  WHEN the manager records the client's change request
  THEN the client sees it as submitted for them by SuqPage
  AND a normal team member never sees the on-behalf control

Scenario: Assigned team member prepares work
  GIVEN a team member assigned to one request
  WHEN they open the operations workspace
  THEN they can review and prepare only assigned work
  AND cannot publish, onboard, invite, or create an on-behalf request

Scenario: Client approves a private preview
  GIVEN a live showroom and a proposed revision for one request
  WHEN the client reviews and approves that exact revision
  THEN the current public showroom remains unchanged
  AND an authorized manager can publish the approved revision

Scenario: Client rejects a private preview
  GIVEN a proposed revision awaiting review
  WHEN the client rejects it with comments
  THEN nothing is published
  AND the request returns to staff with the rejection history preserved
```

## Quality impact

- Security and tenant isolation: all private routes, attachments, requests, and
  previews are actor- and tenant-authorized on the server.
- Privacy and data retention: intake explains retention/processing and never
  exposes contact or attachments through public references.
- Accessibility and responsive behavior: forms, attachment errors, queues,
  messages, and preview decisions are labeled, keyboard usable, and mobile safe.
- Localization and merchant-entered values: interface copy may localize;
  submitted and structured merchant values remain exact.
- Performance and limits: bounded text, attachment count/size/pixels, queue
  pagination, and request history pagination.
- Failure recovery and idempotency: repeat submits do not duplicate a request;
  notification failure never loses a committed request.

## Observability

Record safe request reference, actor ID/type, tenant/prospect ID, status,
assignment, revision ID, and outcome. Never log request text, contact values,
attachment contents, access tokens, or customer inquiry details.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Public onboarding and bounded attachment UX | acceptance | `tests/acceptance/app.spec.ts` |
| Client tenant isolation and request history | acceptance/security | `tests/acceptance/requests.spec.ts`, `scripts/test-requests.ts` |
| Staff/manager control visibility and denial | acceptance/security | `tests/acceptance/requests.spec.ts`, `scripts/test-requests.ts` |
| Preview approval/rejection without live drift | acceptance | `tests/acceptance/requests.spec.ts` |
| Accessibility and mobile safety | browser | `tests/acceptance/requests.spec.ts` |

## Rollout and rollback

Ship public/client intake and staff review additively. Keep current owner controls
until preview/publication and account migration pass. Roll back additive UI/API
without deleting request data; permission cutover has a separate backup,
session-revocation, and rollback checkpoint under `DEP-003`.

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

- Public onboarding form and bounded multipart API are active.
- Administrators can review original instructions and authorized private images,
  and can move requests only through pre-preview review statuses.
- Browser evidence is in `tests/acceptance/app.spec.ts`; client history,
  assigned-team queues, manager on-behalf intake, and preview decisions remain.
