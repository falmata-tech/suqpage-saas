---
id: FE-003
title: Managed client request and review workspace
status: done
related: [BE-003, BE-007, DEP-003, FE-006, FE-007, FE-008, FE-013, FE-017, FE-021, ADR-0004, ADR-0006]
owners: [product, frontend]
last_updated: 2026-07-26
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
- Manager/admin creation of a draft client workspace and single-use invitation
  without requiring a public interest or an existing service request.
- Attributable client/staff clarification messages on each request.
- Operations-manager inquiry status and delivery initiation tools, while client
  inquiry and delivery views remain read-only.
- Clear attribution when SuqPage submits a request for a client.
- Separate private draft and public/live showroom states.
- Complete removal of legacy-owner navigation and direct live-content editing.

### Non-goals

- Client catalog, settings, product, option, design, or publication controls.
- Passwordless login, automated WhatsApp delivery, payment, checkout, or a
  generic visual page builder.
- Automatic conversion of client text or images into published catalog data.
- Direct live catalog/settings/design editing by any client or routine staff
  role; all content changes use a request revision and client approval.

These non-goals describe the verified managed-service cutover. `FE-008`,
`BE-009`, `DEP-008`, and `ADR-0006` define a ready but unimplemented narrow
exception for versioned basic product upkeep after first publication. They do
not restore broad catalog, structure, option, settings, design, or full-
publication authority.

## Domain language and invariants

- **Request:** an onboarding or change instruction submitted by a prospect,
  client, or authorized manager.
- **Clarification:** an attributable message that does not rewrite the original
  request.
- **Proposed revision:** server-validated staff work available only in preview.
- **Published revision:** the version served by the public showroom.
- **New showroom request:** a request for a draft business that has never had a
  published showroom.
- **Showroom change request:** a request for a business with established
  published/live history.
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
- Authorized operations staff can create a draft client workspace without a
  prior lead. The client still establishes their own password through the same
  displayed-once invitation contract and may submit the first detailed request
  only after authentication.
- Request type is explanatory, not client-selectable: the UI shows New showroom
  for a never-published draft and Showroom change after publication/live
  history; the server derives the same value independently.
- Staff-created requests visibly state that SuqPage submitted them for the
  client; internal staff identity is not exposed beyond what operations policy
  permits.
- Preview identifies the exact revision and request. Approve/reject actions are
  unavailable for a stale or superseded revision.
- The staff revision editor uses labeled structured sections for business
  presentation/contact fields, collections, categories, products, availability,
  stock, and up to four option groups. It is not a raw JSON or generic page-
  builder interface.
- Staff may reuse an existing tenant image or select one of the request's
  private reference images for revision image fields. A private reference does
  not become public merely because it appears in a preview.
- Saving changes affects only a mutable draft. Sending for review freezes that
  numbered revision; further work creates a new numbered revision.
- Client rejection requires a comment. Approval and rejection identify the
  exact revision, remain visible in request history, and cannot be repeated.
- Only manager/admin interfaces expose prospect acceptance, on-behalf intake,
  assignment, invitation, or publication controls.
- Platform administrators provision individual operations-manager and team-member
  accounts with temporary passwords. Staff cannot self-register, and every new
  staff account must change its password before entering a workspace.
- Operations managers see the full request queue and may submit an onboarding
  request for a prospect or an onboarding/change request for an existing client.
  A manager-created request visibly identifies SuqPage as the submitter.
- Operations managers process customer-inquiry status and initiate delivery
  work for a selected business. Clients see the same activity read-only.
- Every request detail provides a bounded clarification composer and an
  attributable thread. Clients see their own messages and a generic SuqPage
  team identity; internal staff retain named attribution for audit/workflow.
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
- Inside an authenticated workspace, the SuqPage brand returns to that actor's
  dashboard context rather than silently exiting to the public site. A separate
  clearly labeled Public site link opens the public experience.
- Role-appropriate destinations remain reachable through a grouped desktop
  navigation and an operable mobile menu. The mobile shell does not rely on a
  clipped or horizontally scrolling copy of the desktop navigation.
- A client sees a preview action only after the exact revision has been sent for
  review. Draft revisions remain visible as work in preparation but never link
  a client to a route they cannot open.
- Client request history presents customer-safe event labels and descriptions.
  It never renders internal user IDs, storage identifiers, raw transition
  syntax, or staff-only workflow details; authorized staff retain the complete
  operational history.
- The invitation acceptance screen explains the business being joined, expiry,
  and account setup without exposing internal request/contact data.
- Platform administration creates staff, resets client temporary passwords,
  suspends/restores public availability, and links into client provisioning. It
  has no legacy-owner creation or direct live catalog/settings/design controls.

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

Scenario: Authenticated user follows workspace navigation
  GIVEN a valid authenticated session in a dashboard
  WHEN the user activates the SuqPage brand or another permitted workspace menu
  THEN the destination remains authenticated and role-appropriate
  AND public-site navigation is exposed separately and explicitly

Scenario: Authenticated user opens the workspace on mobile
  GIVEN a valid authenticated session at a narrow viewport
  WHEN the user opens the workspace menu
  THEN every role-permitted destination is reachable without horizontal overflow
  AND closing or following the menu restores the page interaction context

Scenario: Client follows private revision progress
  GIVEN a client request has a staff-only draft revision
  WHEN the client opens the request detail
  THEN the draft is described as work in preparation without a preview action
  AND request history contains no internal identifier or raw workflow syntax

Scenario: Manager submits on behalf of a client
  GIVEN an operations manager and a selected client
  WHEN the manager records the client's change request
  THEN the client sees it as submitted for them by SuqPage
  AND a normal team member never sees the on-behalf control

Scenario: Manager creates a client workspace without a lead
  GIVEN an operations manager has a referred client with no public submission
  WHEN the manager creates a draft business invitation
  THEN no service request is fabricated
  AND the invited client can authenticate and submit a new-showroom request

Scenario: Request type follows publication state
  GIVEN one client has a never-published draft and another has a live showroom
  WHEN each submits a request
  THEN the first request is labeled onboarding/new showroom
  AND the second is labeled change/showroom change
  AND neither client can override the classification

Scenario: Client and staff clarify a request
  GIVEN an accessible request needs more information
  WHEN staff asks a bounded question and the client responds
  THEN both messages append without changing the original instruction
  AND each actor sees the permitted attribution and updated request state

Scenario: Operations handles customer activity
  GIVEN an operations manager selects a client business
  WHEN they update an inquiry or initiate a delivery request
  THEN the operation is available and audited
  AND the client sees the resulting activity without mutation controls

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

Scenario: Staff edits a submitted revision
  GIVEN a numbered revision already sent for client review
  WHEN assigned staff need to change its structured content
  THEN the submitted revision remains immutable
  AND staff create a newer draft revision with its own preview and decision

Scenario: Manager publishes the exact approved preview
  GIVEN a client-approved revision with no newer revision or live-version drift
  WHEN an operations manager publishes it
  THEN the public showroom renders the approved structured content
  AND the request identifies the published revision and content version
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
| Preview approval/rejection without live drift | acceptance | `tests/acceptance/app.spec.ts`, `scripts/test-revisions.ts` |
| Accessibility and mobile safety | browser | `tests/acceptance/app.spec.ts` |
| Client-safe draft and event presentation | focused/acceptance | `scripts/test-requests.ts`, `tests/acceptance/app.spec.ts` |

## Rollout and rollback

Ship the replacement workflows before applying the permission migration in the
same release candidate. The cutover preserves all four example showrooms,
converts their accounts to clients, and removes legacy live-edit navigation and
authority after backup/session-revocation gates pass. Rollback uses the explicit
checkpoint under `DEP-003`; request and revision data are never deleted.

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

Evidence: existing managed-service behavior was verified locally on 2026-07-22. The
workspace-navigation and client-safe presentation corrections were verified on
2026-07-26 by `npm run test:requests`, `npm run check`, and the ten-scenario
`npm run test:acceptance` production-browser suite.

### Verified managed-service implementation

- Public expression-of-interest form and bounded JSON API are active with no
  file input, upload handling, or self-sign-up path.
- Administrators can review the original interest message and move it only
  through pre-preview review statuses.
- Operators can create a displayed-once 72-hour invitation; accepted clients
  receive a restricted workspace with request history, read-only inquiry and
  delivery activity, preview, and account security.
- Operators can also create a draft client workspace and displayed-once
  invitation without a prior lead or fabricated service request.
- Clients can submit bounded unstructured requests with up to ten private
  sanitized images. The server derives first-showroom versus change type from
  publication state. Nested request, invitation, and request-create screens
  include breadcrumbs and deterministic Back behavior.
- Platform administrators can provision individual operations-manager and team-
  member accounts that require a first-login password change. Operations
  managers can record private requests for existing clients or prospects and
  assign them; team members see only their assigned queue and read-only business
  context.
- `tests/acceptance/app.spec.ts` proves operator invitation, account redemption,
  manager on-behalf intake, assignment, the restricted role navigation, private
  images, and direct management/API denial in a production build.
- Assigned staff use a labeled structured revision editor. Clients review and
  approve an exact numbered private showroom preview; operations managers then
  publish that approved snapshot. Preview cart/inquiry actions are disabled and
  breadcrumbs return to the request hierarchy.
- `tests/acceptance/app.spec.ts` proves staff draft/save/submit, exact client
  approval, manager publication, and the changed public showroom in a production
  build.
- Clients and authorized staff exchange attributable clarifications without
  rewriting the original request; client views protect internal staff identity.
- Client request detail no longer offers an inaccessible preview action for a
  staff-only draft. Client history converts assignment IDs, status-transition
  syntax, revision metadata, and unknown internal events into bounded customer-
  safe descriptions while staff retain the complete operational detail.
- Role-appropriate navigation is grouped on desktop and available through a
  focus-contained mobile drawer with Escape, focus restoration, 44-pixel
  targets, and 320/390-pixel overflow evidence under `FE-013`.
- Migration 7 converts every former compatibility owner, including all four
  examples, to the same restricted client workspace. Direct live settings,
  catalog, design, inquiry-status, and delivery-create client controls are gone.
- The seven-scenario production browser suite passed on 2026-07-22 and covers
  every role, direct and lead-based invitations, clarification, authorization,
  client approval, publication, customer operations, public UX, and API headers.
