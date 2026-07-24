---
id: BE-003
title: Managed request, permission, and publication security
status: done
related: [FE-003, BE-007, DEP-002, DEP-003, ADR-0004]
owners: [backend, security]
last_updated: 2026-07-24
change_level: L3
---

# BE-003 — Managed request, permission, and publication security

## Problem and outcome

Unstructured onboarding/change requests, pre-account contacts, authenticated attachments,
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
- Client provisioning without a lead, clarification events, operational
  inquiry/delivery authority, and complete owner-to-client permission cutover.

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
- Request type is derived from durable business publication state; browser input
  never decides whether work is onboarding or a change.
- Public submission uses idempotency and privacy-preserving rate limits.
- A team member needs an active assignment for every private read/write.
- A manager may create on behalf, accept/invite, and assign. Only a manager or
  administrator may publish, and only after the represented client approves the
  exact latest revision.
- A client may approve only a revision for their own business. Staff cannot
  approve as the client; managers submitting on behalf still require final
  client approval.
- Editing or replacing an approved revision clears approval.
- Draft revisions may be replaced before review; a revision becomes immutable
  when submitted for client review. Later edits create a new monotonically
  numbered revision and supersede any older actionable preview.
- Revision preview is private. Canonical public queries read only the published
  business/catalog version.
- Publication validates all business/catalog/option/media invariants and commits
  the approved revision plus version/audit state atomically.

## Contracts

- Application ports remain independent of Next.js/HTTP/SQLite: request
  persistence, attachment storage, notification, invitation delivery, revision
  persistence, and publication transaction.
- Server input is schema-validated and bounded before persistence. The public
  interest adapter accepts JSON only and has no attachment-storage dependency.
  Authenticated attachment storage receives only verified/sanitized bytes and
  server-generated keys.
- Authenticated browser mutation adapters accept an `Origin` only when its
  normalized origin exactly matches the request URL, canonical application URL,
  an explicitly configured trusted origin, or an exact development origin
  derived for the current local/Codespaces runtime. Forwarded host headers do
  not expand that trust, and wildcards or hostname lookalikes are never accepted.
- Public response contains a random non-sequential reference, never a database
  identifier, contact, token, or attachment path.
- Invitation tokens are random, single-use, stored hashed, expire, and are
  revoked after acceptance or account/security changes.
- An invitation may reference an accepted public/on-behalf onboarding request or
  no request at all. A request-free invitation creates no placeholder request;
  redemption binds only the client and draft business until detailed intake.
- For the controlled pilot, an administrator or operations manager accepts the
  prospect, creates/links a draft business, and generates a 72-hour invitation
  URL displayed once for manual secure delivery. Regeneration revokes every
  earlier unaccepted invitation for that request. No email/WhatsApp send is
  claimed.
- Redemption atomically marks the invitation accepted, creates one client
  account bound to the invitation business/request, and cannot be replayed.
- Role checks use explicit capabilities. Interface hiding has no authority.
- Staff provisioning is platform-administrator-only. The structural value in
  `users.role` grants no authority; every user has an explicit effective access
  profile and `legacy_owner` is not a valid post-cutover profile.
- Operations managers can read all requests, create on-behalf requests, accept
  prospects, invite clients, and assign team members. They cannot use legacy
  live catalog/settings mutations or approve as a client.
- A team member can read and transition only an assigned request. Assignment and
  reassignment update request ownership and business-view scope atomically;
  obsolete business scope is removed only when no other active assignment needs
  it. Team members cannot invite, assign, submit on behalf, or mutate live
  catalog/settings/design data.
- Manager on-behalf intake accepts the same bounded private image contract as an
  authenticated client. Existing-client requests bind to the selected client
  and business; prospect onboarding captures bounded contact/business data and
  creates no account by itself.
- Client and existing-client manager intake ignore any submitted request type
  and derive onboarding only for a never-published draft business; active,
  suspended, previously published, or versioned businesses derive change.
- Clarifications are 1–2,000 characters, stored as immutable request events,
  tenant/assignment authorized, and safely attributed. Staff questions move
  active work to `needs_information`; a client response returns it to
  `under_review` without rewriting the original request.
- `operations:manage` authorizes tenant-selected inquiry status and delivery
  initiation through dedicated operational checks. It does not authorize live
  business/catalog/design mutation.
- Assignment, request transition, clarification, approval, rejection,
  publication, rollback, and privileged reads write audit events with safe
  identifiers.
- Publication rejects a stale `base_content_version`; staff must rebase and
  obtain new client approval.
- Revision snapshot schema version 1 contains only bounded business presentation
  and contact fields, one supported design key, collections, categories,
  products, availability/stock, and up to four option groups. Opaque snapshot
  keys express internal relationships; database IDs supplied by a browser have
  no authority.
- A snapshot contains at most 100 collections, 200 categories, 500 products,
  four option groups and 50 values per product group, and 1 MiB serialized JSON.
  Slugs, relationships, stock, supported design keys, and image references are
  validated before draft persistence and again before publication.
- Revision image references may use current same-tenant catalog media or an
  attachment belonging to the same request. Preview resolves private references
  through the authorized attachment adapter. Publication sanitizes/stages new
  public media before the database transaction and removes staged files on a
  rejected transaction; unreferenced crash remnants are safe orphans eligible
  for reconciliation.
- `businesses.content_version` is monotonic. Publication atomically replaces the
  canonical business/catalog rows, increments that version, stores the exact
  published snapshot, marks the revision/request published, and appends events.
  Existing inquiry item snapshots remain intact when old product IDs are retired.
- Operational rollback never decrements the content version. An authorized
  manager republishes a retained prior snapshot as a new content version and the
  rollback is audited; it is recovery authority, not client approval for new work.
- Platform administrators may suspend an active showroom and restore that same
  showroom operationally, but cannot activate a never-published draft or change
  its renderer outside an approved revision.

## Scenarios

```gherkin
Scenario: Public interest is committed safely
  GIVEN bounded valid contact details and an interest message
  WHEN an unauthenticated prospect submits with a new idempotency key
  THEN one attachment-free onboarding lead is committed
  AND notification failure cannot roll back or duplicate the request

Scenario: Public attachment is denied at every boundary
  GIVEN an unauthenticated prospect
  WHEN they submit multipart content or an attachment for a public lead
  THEN the HTTP adapter rejects it
  AND the database invariant rejects any attempted public attachment row

Scenario: Cross-tenant client access is denied
  GIVEN a client for tenant A and a request for tenant B
  WHEN the client reads, comments, previews, approves, or attaches to that request
  THEN the operation is denied
  AND tenant B state is unchanged

Scenario: Invitation is redeemed once
  GIVEN a current unexpired invitation for an accepted prospect
  WHEN the intended client establishes a valid password
  THEN one client account is bound to the invitation business and request
  AND replay, expiry, or a superseded token creates no account

Scenario: Request-free client invitation is redeemed once
  GIVEN an authorized manager created a draft workspace without a lead
  WHEN the client redeems its invitation
  THEN one client account is bound to the draft business
  AND no service request exists until the client or manager submits instructions

Scenario: Client cannot forge request classification
  GIVEN a client business with no published showroom
  WHEN the client submits a browser field claiming the request is a change
  THEN the stored request type is onboarding
  AND a live business submitted as onboarding is stored as change

Scenario: Legacy live mutation is denied after cutover
  GIVEN any migrated client, team member, operations manager, or administrator
  WHEN they call a former live catalog/settings/design mutation directly
  THEN authorization is denied
  AND canonical showroom state changes only through approved publication

Scenario: Unassigned staff access is denied
  GIVEN a normal team member without an assignment
  WHEN they attempt to read or modify a private request
  THEN the operation is denied even if they know its identifier

Scenario: Normal team member submits on behalf
  GIVEN an authenticated normal team member
  WHEN they call an on-behalf onboarding or change operation directly
  THEN authorization is denied
  AND no request or prospect is created

Scenario: Codespaces manager submits on behalf
  GIVEN an operations manager uses the exact HTTPS forwarding origin for the current Codespace
  WHEN they submit an authenticated on-behalf request
  THEN the mutation origin check accepts the request
  AND sibling ports, hostname lookalikes, and attacker-controlled forwarded headers remain denied

Scenario: Reassignment updates least-privilege scope
  GIVEN a request for tenant A assigned to team member one
  WHEN a manager reassigns it to team member two
  THEN member two can read the request and tenant context
  AND member one loses tenant A scope unless another active assignment requires it

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

Scenario: Submitted revision is immutable
  GIVEN revision 2 is awaiting client review
  WHEN assigned staff attempt to replace revision 2 content
  THEN the write is denied
  AND revision 2 content and decision state remain unchanged

Scenario: Client rejects exact revision
  GIVEN an awaiting-review revision for the client's own business
  WHEN the represented client rejects it with a bounded comment
  THEN the immutable decision and comment are recorded once
  AND no canonical business or catalog row changes

Scenario: Previous published content is rolled back safely
  GIVEN an authorized manager and a retained earlier published snapshot
  WHEN the manager performs operational rollback
  THEN that snapshot is validated and published as a new content version
  AND the intervening version remains retained for audit and recovery
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
| Exact custom-mutation origins including current Codespaces | security/contract | `scripts/test-security.ts`, `scripts/test-container.mjs` |
| Exact approval, stale conflict, atomic publish, rollback | integration | `scripts/test-revisions.ts` |
| Operations inquiry/delivery authority and client read-only isolation | regression | `scripts/test-security.ts`, `tests/acceptance/app.spec.ts` |
| Request-free invitations and inferred request type | integration/acceptance | `scripts/test-requests.ts`, `tests/acceptance/app.spec.ts` |
| Clarification authorization and immutability | integration/acceptance | `scripts/test-requests.ts`, `tests/acceptance/app.spec.ts` |

## Rollout and rollback

Back up and test restore before the version-7 role cutover. The migration assigns
explicit profiles to every account, converts every owner profile to client,
generalizes invitations without fabricating requests, and revokes converted
sessions. Legacy creation and live-mutation authority are removed in the same
release. Rollback restores the checkpoint as a unit; published content rollback
continues to use retained versions.

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

Evidence: verified locally on 2026-07-22 by the mapped security, request,
revision, migration, and production-browser tests below.

### Verified managed-service implementation

- Request, attachment, event, and assignment tables plus application/storage
  ports are active.
- Public creation is idempotent, privacy-rate-limited, bounded JSON, returns only
  a random reference, and cannot create attachment rows or files.
- Private attachment reads are operations-authorized and return 404 to anonymous
  or unauthorized callers; invited clients can read only attachments on their
  own represented requests.
- Migration 4 adds access profiles and hashed invitation lifecycle records.
  Regeneration revokes unused predecessors, redemption is atomic/non-replayable,
  and the client profile cannot mutate catalog, settings, inquiries, or delivery
  requests.
- Migration 5 adds manager-request idempotency. Individual staff provisioning,
  manager on-behalf intake, and request/business assignment scope are active;
  reassignment removes obsolete scope when no other open assignment needs it.
- Authenticated client and manager on-behalf requests are tenant-bound and
  idempotent with bounded, sanitized private images. Team members can read and
  transition only assigned requests and cannot mutate live business state.
- Migration 6 adds content versions, immutable numbered revisions, and retained
  published snapshots. Revision payloads are bounded and validated against
  request/tenant image ownership before save and publication.
- `scripts/test-revisions.ts` proves submitted immutability, rejection without
  live drift, cross-role denial, stale-base conflict, exact approved publication,
  private-image promotion, canonical replacement, retained versions, and
  monotonic rollback.
- Request creation derives onboarding versus change from authoritative business
  and retained-publication state; forged browser fields have no effect.
- Request-free invitations bind a new draft tenant to a restricted client when
  redeemed without creating fictional intake data.
- Clarification events retain internal actor attribution, enforce request scope,
  preserve the original instruction, and apply needs-information/resume-review
  transitions.
- Customer inquiry and delivery mutations require customer-operations authority.
  Clients and team members are denied; platform and operations managers are
  covered through browser/API tests.
- Migration 7 removes `legacy_owner` from the allowed profile contract, maps
  existing profiles to client, and revokes their sessions. Direct live-content
  authorization returns false for every role; revision publication remains the
  only content authority.
- `npm run check`, `npm run test:operations`, and all seven production browser
  acceptance scenarios passed locally on 2026-07-22.

### Codespaces origin regression evidence

Verified locally on 2026-07-24:

- `scripts/test-security.ts` accepted only the exact current Codespace HTTPS
  origins for supported development ports and rejected an unsupported port,
  suffix-lookalike hostname, wildcard entry, forged forwarded-host header, and
  every Codespace origin under the production policy.
- `npm run check` passed the complete specification, type, design, security,
  request, revision, composition, and migration contract.
- `npm run release` passed the clean production build, bounded 41-trace privacy
  check, HTTP/API smoke tests, and zero-vulnerability production audit.
- All seven production browser scenarios passed, including operations-manager
  on-behalf intake and assigned-team-member isolation.
- `npm run test:operations` and `npm run test:container` passed database
  recovery, exact build-time origin, non-root runtime, health, and cleanup
  checks.
