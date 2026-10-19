---
id: BE-060
title: Revocable global staff business-management authority
status: ready
related: [FE-072, FE-026, FE-042, FE-053, FE-056, BE-032, BE-033, BE-044, BE-009, BE-031, FE-038, FE-073, BE-061, DEP-050, DEP-049, ADR-0030]
owners: [backend, security, operations]
last_updated: 2026-10-18
change_level: L3
---

# BE-060 — Revocable global staff business-management authority

## Problem and outcome

Current page permission requires owner consent and a separate per-business
assignment; products, business settings, handle, location and publication use
different role rules. Replace these fragmented gates with one auditable
administrator-controlled business-management grant for each staff identity.
Eligible existing and newly provisioned staff receive the grant by default;
administrators can revoke or restore it without changing chat function.

## Scope

### In scope

- Persist one explicit, versioned business-management grant per eligible staff
  identity, with administrator actor and change timestamps. Backfill existing
  current staff to enabled during an additive migration, without reading their
  old business assignments or owner consent. New staff creation inserts the
  enabled grant in the same transaction as the account/profile.
- Authorize current-grant staff to read any business workspace and use its
  identity, location, handle, page draft/media, page publication/restore, public
  contacts, live/sharing, category, product and product-media commands. Reuse
  existing validation, expected-version, idempotency, publication-readiness,
  upload and audit contracts. The resulting saved business remains tenant-bound.
- Admin-only grant change with expected version, explicit target ID, audit and
  atomic failure. A revoked staff member is denied at transaction commit even
  with a stale authenticated principal or previously loaded editor.
- Retire owner assistance writes from web and native entrypoints; old requests
  fail closed. Retain legacy `assistance_enabled` and
  `staff_business_assignments` rows/columns as historical data. Neither is an
  authorization source for this new permission.

### Non-goals

- No staff authority to view or edit another user's private account contacts,
  sign-in email, Supabase identity, password, security factors, staff accounts,
  platform moderation or provider settings. Business notification email remains
  separate from account sign-in email.
- No staff native-app login, broad database role, direct client-side database
  access, new chat queue assignment rule, deletion of historical records, or
  transfer of business ownership.
- No Auth email change is implemented here. BE-031/FE-038 retain readonly account
  email until FE-073/BE-061/DEP-050's owner-only current-address code and new-
  address confirmation have provider-safe evidence. Staff and administrators
  cannot bypass provider verification.

## Domain language and invariants

- A **staff business-management grant** belongs to a current platform staff
  identity, not a business. It is initially enabled by an administrator's staff
  creation policy or the reviewed backfill, and an administrator alone can
  change it. Missing, malformed or revoked grants deny staff business access.
- Support and Transport queue scope determines chats only; business authority
  comes exclusively from this separate grant. A change to one cannot imply a
  change to the other.
- An owner can only manage their own linked business. The platform administrator
  remains authorized under the existing current-profile check. No user-provided
  role, tenant ID, old assignment or owner toggle creates authority.
- Permission is checked against the current persisted role and grant on every
  private read and inside every mutation transaction. Grant changes and writes
  serialize on the same staff-grant row or equivalent explicit lock, so a revoke
  cannot race a late business write into success. No stale session claim suffices.
- Business-specific operations retain their own invariants. Staff publication
  cannot bypass readiness or reactivate suspended pages. Staff changes to public
  handles retain uniqueness, expected version, cooldown/override policy and
  actor-attributed audit. Account email never passes through that handle flow.

## Contracts

- Migration after current schema 75 creates a constrained, FK-bound private
  staff-grant table with one row per staff ID, enabled flag, monotonic version,
  actor and update time. Backfill every current `team_member` and
  `operations_manager` as enabled; never infer future missing rows as enabled.
  Restrict direct public roles and preserve all existing tenant and request data.
- Staff creation and grant change are transactional. A duplicate/retry cannot
  create conflicting rows. An admin revoke/restore rechecks the admin's current
  profile and staff target under lock, compares the submitted version, updates
  once and appends one audit event. The grant form submits through an
  authenticated POST Server Action even before client hydration; a GET query
  never changes authority or exposes form fields. Stale, foreign-role,
  self-escalation and malformed requests change nothing.
- Business read and mutation application ports resolve a current canonical
  `BusinessManager` decision from persisted actor role, grant and target; UI
  navigation is only a hint. Any queued request using a revoked actor fails
  before commit. Staff cannot turn grant access into account or platform access.
- Page draft/content/media operations no longer consult
  `assistance_enabled` or `staff_business_assignments` for current staff.
  Public writes still use draft version and media ownership; first publication,
  later live Save and restore remain serialized with publication history.
- Product/category/media, business settings, location and handle operations
  use the same current grant and target before saving. Staff service notes and
  explicit actor attribution remain where existing commands require them.
- Legacy owner `assistance` action returns a bounded retired-action error; it
  cannot toggle the persisted historical field or advance the page version.

## Scenarios

```gherkin
Scenario: Backfilled staff manages an unrelated business
  GIVEN a current Support agent with an enabled backfilled grant
  WHEN they request and save an authorized business task for any business
  THEN the current grant and target are checked
  AND the business-specific version, validation and audit rules apply
  AND their chat queue function does not change

Scenario: Administrator revokes active editor
  GIVEN a staff member loaded a private business editor while enabled
  WHEN the administrator revokes their grant before that member saves
  THEN the save fails before commit with no business, media or publication change
  AND a fresh private read is also denied

Scenario: Missing or forged grant
  GIVEN a team member with no persisted grant or a client asserting staff fields
  WHEN they request another business by ID or submit a forged grant action
  THEN authorization denies without disclosing private data or mutating state

Scenario: Owner security remains separate
  GIVEN a staff member with an enabled grant
  WHEN they try to change the owner's account email or read private contacts
  THEN the request is denied and the linked identity remains unchanged
```

## Quality impact

- Security and tenant isolation: intentional all-business staff reach only via
  explicit current grant; admin/owner boundaries and privilege revocation are
  tested at each adapter and persistence port.
- Privacy and data retention: no historical assignment/consent deletion;
  account identifiers and OTPs excluded from staff views and audits.
- Accessibility and responsive behavior: FE-072 owns visible controls; bounded
  API errors let forms retain values on conflicts.
- Localization and merchant-entered values: permission labels localize; stored
  business text stays separately validated and safely rendered.
- Performance and limits: one indexed grant lookup or locked read per action;
  paginated staff/business lists and no eager all-business hydrate.
- Failure recovery and idempotency: versioned grant writes, transaction rollback
  on audit/media failure, replay-safe existing business commands, additive data.

## Observability

Audit administrator grant transitions and staff business writes with actor ID,
target ID, action, outcome and version. Redact account email values, phone,
passwords, OTPs, provider tokens and media bytes.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Additive backfill, constraints, ACL and rollback/replay | PostgreSQL/operations | `scripts/test-business-assistance.ts` |
| New staff default and admin revoke/restore/version/audit | integration/security | `scripts/test-business-assistance.ts`, `scripts/test-staff-boundaries.ts` |
| Fresh read/write permission across page, publication, settings, handle, location, product/category/media | integration/security | `scripts/test-owner-page.ts`, `scripts/test-standard-page-postgres.ts`, `scripts/test-product-upkeep.ts`, `scripts/test-business-settings.ts`, `scripts/test-business-handles.ts`, `scripts/test-admin-geography.ts` |
| Stale editor versus revoke, missing/forged grant and account isolation | concurrency/security | `scripts/test-business-assistance.ts`, `scripts/test-staff-boundaries.ts` |
| Retired web/native assistance action | route/security | `scripts/test-owner-page.ts`, `scripts/test-mobile-api.ts` |

## Rollout and rollback

Append only a guarded migration after schema 75. Its local and hosted application
requires protected backup, exact database identity/ledger verification, dry-run
integrity tests and separate rollout authorization. Publish the new server
authorization and UI after the grant table/backfill exists; old code can still
read retained consent/assignment history during rollback. Do not start a mixed
version window where old and new frontends grant broader authority than the
matching server. A revoked staff member must not regain business access if an
older server is restored: fence staff business editing until the old
assignment/consent gate is safely reconciled, or restore a compatible server
that still honors the revocation. Rollback retains the additive grant table and
audit trail; never delete customer or staff history. No Auth/provider mutation
is coupled to this migration.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

The guarded local 75→77 apply installed migration76, backfilled all 14 eligible
staff as enabled and independently checked ledger, preservation and private
table privileges; receipt:
`.local/mirtpage-rebrand-s145/local75-to77/attempt-20261019T024300Z/verified.json`.
Focused staff-boundary and navigation tests pass. An actual Chrome administrator
revoke/restore changed the persisted version 1→2→3, immediately gated staff
business access and left Support reachable. The initial browser pass exposed a
pre-hydration GET Save; the corrected action was retested as authenticated POST
without URL form fields. Isolated migration replay/rollback, the remaining
security matrix, visual approval, full gates, commit and separate hosted rollout
remain pending. Focused installed Chrome staff layout and the Expo owner
Account→Your page→Page address→Cancel UI assertions ran; Expo used real local
Supabase OTP verification but route-fulfilled a successful OTP-send response
after the local email quota was exhausted. An earlier genuine OTP login reached
one owner page state. Neither provides a complete no-mock Expo owner workflow;
that browser criterion remains pending.
`status: ready` remains.
