---
id: DEP-003
title: Managed request storage and safe permission rollout
status: done
related: [FE-003, BE-003, DEP-006, DEP-007, DEP-008, DEP-017, ADR-0002, ADR-0004]
owners: [operations, security]
last_updated: 2026-07-24
change_level: L3
---

# DEP-003 — Managed request storage and safe permission rollout

## Problem and outcome

Request attachments, pre-account contact data, invitations, content revisions,
and the completed role cutover must survive deployment, backup, restore, and rollback
without entering application images, logs, public paths, or another tenant's
workspace.

## Scope

### In scope

- Additive/idempotent schema migration and indexes for managed requests.
- Private persistent attachment storage outside the Next.js build/public tree.
- JPEG/PNG/WebP verification, decoding, sanitization, and server-generated keys.
- Backup, restore, integrity, retention/deletion, orphan cleanup, and capacity
  behavior for request data and attachments.
- Bounded notification/invitation adapter failures without losing requests.
- Versioned full role cutover with backup, session revocation, verification, and
  rollback, including request-free invitations and explicit profiles.
- Single-instance SQLite pilot deployment and container volume compatibility.

### Non-goals

- Object storage, multiple app instances, antivirus claims, passwordless
  delivery, automated WhatsApp, or broad self-service onboarding.
- Including mutable request attachments or tokens in images/artifacts.
- Deleting businesses, catalogs, inquiries, deliveries, request history, or
  account identities during permission cutover.

## Domain language and invariants

- **Private attachment root:** persistent storage served only through an
  authorized application adapter, never a guessable public path.
- **Cutover checkpoint:** verified backup plus recorded account/role/session
  counts immediately before client permission migration.
- A committed request remains available when notification fails.
- Database rows and attachment files have deterministic reconciliation and
  deletion behavior; backups capture a consistent pair.
- Only one application instance writes SQLite/local attachment state.

## Contracts

- The public interest endpoint accepts bounded JSON only and never initializes
  attachment writes; multipart/file input is rejected before decoding or storage.
- Authenticated request intake rejects generic files. After design import, each
  labeled image slot accepts one image of at most 5 MB and 20 megapixels; only
  decoded JPEG/PNG/WebP is stored after metadata-removing re-encoding.
- Authenticated multipart/request limits reject oversized input before
  unbounded buffering.
- Storage keys are random and original filenames are private metadata, never URL
  authority.
- Authorized attachment reads set exact content type, `nosniff`, private cache
  policy, and denial indistinguishable from absence for unauthorized actors.
- Backups include database, catalog media, and private request attachments with
  integrity manifest; restore validates all three.
- Invitation/notification delivery uses an adapter with safe failure category,
  bounded retry, no secret/contact logging, and an operator-visible resend path.
- Pilot invitation delivery is manual: the raw 72-hour token is returned only
  once to the authorized operator and is never stored, logged, backed up, or
  shown again. Only its hash and lifecycle metadata persist.
- Pre-cutover checks count accounts by target role, assignments, open requests,
  and active sessions. Cutover revokes affected sessions and runs permission
  acceptance tests before public continuation.
- Migration 7 preserves all business/catalog/customer data, converts every
  owner effective profile to `client`, inserts any missing explicit profiles,
  permits invitation rows without a request, and revokes converted sessions.
  Its schema no longer permits a new `legacy_owner` profile.
- Staff accounts are provisioned individually with temporary passwords and
  explicit access profiles. Seed/setup scripts do not create shared staff
  credentials, and credentials never enter logs, artifacts, or backups.
- Staff/profile/assignment scope remains explicit after cutover; disabling a
  staff profile or assignment never grants fallback business authority.
- Revision migration is additive: it adds a monotonic business content version,
  immutable decision/publication metadata, and retained published snapshots.
  Existing canonical rows remain version 1 until the first managed publication.
- Revision JSON is stored in SQLite and therefore covered by the database
  backup. Private image references remain covered by request-attachment backup;
  published copies remain covered by catalog-media backup.

## Scenarios

```gherkin
Scenario: Design-slot image stays private
  GIVEN an imported private design with an accepted sanitized slot image
  WHEN an unauthenticated or unauthorized actor requests its identifier
  THEN no attachment content or private metadata is disclosed

Scenario: Notification provider fails after intake
  GIVEN a valid onboarding request
  WHEN request persistence succeeds and notification delivery fails
  THEN the request remains committed exactly once
  AND operations can see a safe resend-required state

Scenario: Backup and restore preserves managed requests
  GIVEN request rows, events, revisions, and private attachments
  WHEN an operator backs up and restores the pilot
  THEN database integrity is ok
  AND every referenced attachment and revision is recoverable

Scenario: Client permission cutover is controlled
  GIVEN a verified backup and proven replacement client workspace
  WHEN owners are migrated to the client permission set
  THEN their existing sessions are revoked
  AND catalog/settings/design mutations are denied
  AND request, inquiry, support, preview, and account workflows remain available

Scenario: Existing example showrooms survive cutover
  GIVEN four active example businesses with owner accounts and live catalog data
  WHEN migration 7 converts those accounts
  THEN all four public showrooms and catalog/customer rows remain unchanged
  AND each account receives the restricted client workspace after reauthentication

Scenario: Request-free invitation survives backup and restore
  GIVEN a draft client workspace invitation with no service request
  WHEN database backup and restore complete
  THEN the hashed invitation lifecycle remains valid
  AND no placeholder request or public attachment is introduced

Scenario: Revision publication recovery survives restore
  GIVEN a published managed revision and its retained prior version
  WHEN the database, catalog media, and private attachment backup is restored
  THEN both version snapshots and referenced media pass integrity checks
  AND an authorized operator can identify the current and rollback versions
```

## Quality impact

- Security and tenant isolation: private storage and session cutover are
  fail-closed and authorization-tested.
- Privacy and data retention: retention periods, client deletion/correction, and
  orphan cleanup apply to requests and attachments.
- Accessibility and responsive behavior: owned by `FE-003`.
- Localization and merchant-entered values: attachments/text are not translated
  or modified except image sanitation.
- Performance and limits: bounded upload/body/queue sizes, disk capacity signal,
  indexed queries, and single-writer topology.
- Failure recovery and idempotency: migration, intake, backup, restore,
  notification retry, publication, and cutover are retry-safe or checkpointed.

## Observability

Monitor request counts/status age, failed notifications, attachment bytes,
orphan count, disk capacity, invitation expiry, publication conflicts, and
cutover/session counts. Prohibit contacts, instructions, filenames, tokens,
images, customer data, and revision payloads from logs/artifacts.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Additive migration and integrity | operations | `scripts/test-operations.mjs` |
| Private upload/read limits and authorization | security/HTTP | `scripts/test-requests.ts`, `scripts/http-smoke.mjs` |
| Notification bounded failure/idempotency | adapter | `scripts/test-adapters.ts`, `scripts/test-requests.ts` |
| Request attachment backup/restore | operations | `scripts/test-operations.mjs` |
| Permission cutover/session revocation/rollback | security/acceptance | `scripts/test-requests.ts`, `tests/acceptance/app.spec.ts` |
| Container persistent-path compatibility | deployment | `scripts/test-container.mjs` |

## Rollout and rollback

1. Deploy additive request schema/storage with the feature unavailable publicly.
2. Verify migration, private storage, backup/restore, and staff accounts.
3. Enable public intake, client requests, and operations review for pilot users.
4. Enable revision preview/approval/publication and prove live-version isolation.
5. Create the cutover checkpoint, migrate all owner accounts to clients,
   generalize invitations, revoke sessions, and remove legacy authority.
6. Run all four-client browser/security/operations gates; roll back the complete
   release from the checkpoint if any replacement workflow fails.
7. Roll back permissions from the checkpoint if any client workflow fails;
   disable new intake without deleting committed request data when necessary.

No horizontal scaling occurs while SQLite and local attachments remain.

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

Evidence: verified locally on 2026-07-22 by the mapped migration,
backup/restore, release, container, and production-browser gates below.

### Verified managed-service rollout

- Schema migration 2 is additive and idempotent.
- Schema migration 3 adds a database invariant forbidding attachments on public
  interest records.
- Schema migration 4 additively stores effective access profiles and only hashed
  invitation tokens with lifecycle/expiry metadata; raw tokens are never
  persisted or included in backups.
- Schema migration 5 adds a partial uniqueness constraint for manager-submitted
  request idempotency without rewriting existing request or account rows.
- Schema migration 6 additively stores monotonic business content versions,
  bounded revision snapshots, immutable decision/publication metadata, and
  retained published versions.
- Sanitized design-slot images use random keys below the persistent private
  media root, outside the public/build tree.
- `scripts/test-operations.mjs` proves request rows, events, metadata, and private
  attachment files plus revision/version rows survive backup and restore. New
  invited clients and individually provisioned staff use explicit restrictive
  profiles.
- Migration 7 rebuilds the access-profile constraint, converts former
  compatibility owners to clients, makes invitation request linkage optional,
  and revokes affected sessions without changing businesses, catalog rows, or
  publication data.
- `scripts/test-operations.mjs` reconstructs a version-6 compatibility database,
  runs the cutover, proves the four example tenants and products remain intact,
  verifies session revocation and the removed role constraint, then proves
  request, attachment, revision, and publication backup/restore integrity.
- `npm run release`, `npm run test:operations`, the production browser suite,
  and the production container gate are the completion gates for this rollout;
  local results are recorded in traceability after they pass.
