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

- Public expression-of-interest intake with contact details and one short
  unstructured message. It has no upload or self-sign-up capability.
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

- Public intake requires name, a usable email/phone/WhatsApp contact, an interest
  message of 10–2,000 characters, consent, and a stable idempotency key.
- Public intake accepts no files. Detailed instructions and up to ten JPEG, PNG,
  or WebP reference images become available only after SuqPage accepts the lead,
  creates an account, and the invited client authenticates.
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
- Platform administrators provision individual operations-manager and team-member
  accounts with temporary passwords. Staff cannot self-register, and every new
  staff account must change its password before entering a workspace.
- Operations managers see the full request queue and may submit an onboarding
  request for a prospect or an onboarding/change request for an existing client.
  A manager-created request visibly identifies SuqPage as the submitter.
- Assignment selects one team member and, when the request has a business,
  grants that member request/business view scope. Reassignment removes obsolete
  business scope when the member has no other active request for that business.
- Team-member navigation exposes assigned requests and read-only business/live
  preview context only. It does not expose current catalog/settings/design
  forms, because those mutate live state; staff content editing begins only in
  the versioned revision workspace.
- Operations navigation is hierarchical: queue rows open a request detail;
  request detail links back to the queue; invitation/client/request detail
  screens provide a visible breadcrumb and a back action with a deterministic
  parent fallback when browser history is unavailable.
- The invitation acceptance screen explains the business being joined, expiry,
  and account setup without exposing internal request/contact data.

## Scenarios

```gherkin
Scenario: Prospect expresses interest without an account
  GIVEN a prospect without an account or business
  WHEN they submit valid contact, a short interest message, and consent
  THEN SuqPage stores one private onboarding lead with no attachments
  AND shows a reference without creating an account or exposing the internal queue

Scenario: Prospect attempts a public upload
  GIVEN a prospect without an invited account
  WHEN they send a file to the public interest endpoint
  THEN the request is rejected before file decoding or storage
  AND no attachment row or media object is created

Scenario: Client requests a catalog change
  GIVEN an authenticated client
  WHEN they submit instructions and images
  THEN the request is linked to only their business
  AND it appears in their request history

Scenario: Operator follows and reverses a deep link
  GIVEN an operator opens a request or invitation screen from a copied URL
  WHEN the screen renders without prior browser history
  THEN a visible breadcrumb identifies its parent workspace
  AND Back returns to that deterministic parent rather than stranding the user

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

Scenario: Staff account is provisioned explicitly
  GIVEN a platform administrator
  WHEN they create an operations-manager or team-member account
  THEN a temporary-password account with that exact capability profile exists
  AND the staff member must change the password before workspace access

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
| Public interest UX and upload denial | acceptance/security | `tests/acceptance/app.spec.ts`, `scripts/http-smoke.mjs`, `scripts/test-requests.ts` |
| Client tenant isolation and request history | acceptance/security | `tests/acceptance/app.spec.ts`, `scripts/test-requests.ts` |
| Staff/manager control visibility and denial | acceptance/security | `tests/acceptance/app.spec.ts`, `scripts/test-requests.ts` |
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

- Public expression-of-interest form and bounded JSON API are active with no
  file input, upload handling, or self-sign-up path.
- Administrators can review the original interest message and move it only
  through pre-preview review statuses.
- Operators can create a displayed-once 72-hour invitation; accepted clients
  receive a restricted workspace with request history, read-only inquiry and
  delivery activity, preview, and account security.
- Clients can submit bounded unstructured onboarding/change requests with up to
  ten private sanitized images. Nested request, invitation, and request-create
  screens include breadcrumbs and deterministic Back behavior.
- Platform administrators can provision individual operations-manager and team-
  member accounts that require a first-login password change. Operations
  managers can record private requests for existing clients or prospects and
  assign them; team members see only their assigned queue and read-only business
  context.
- `tests/acceptance/app.spec.ts` proves operator invitation, account redemption,
  manager on-behalf intake, assignment, the restricted role navigation, private
  images, and direct management/API denial in a production build. Versioned
  preview decisions and approved publication remain.
