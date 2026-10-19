---
id: FE-072
title: Admin-controlled staff business management
status: ready
related: [BE-060, BE-032, BE-033, FE-026, FE-056, FE-053, FE-042, BE-044, FE-038, BE-031, FE-073, BE-061, DEP-050, DEP-049, ADR-0030]
owners: [product, frontend, backend, security]
last_updated: 2026-10-18
change_level: L3
---

# FE-072 — Admin-controlled staff business management

## Problem and outcome

An owner currently sees an unexplained Team editing switch while an administrator
must assign staff separately to each business. Even after both steps, staff can
edit only some business fields. The owner wants one clear rule: authorized staff
can manage every business by default, and the platform administrator can revoke
that authority for an individual staff member. Business owners no longer decide
which platform staff may edit their showroom.

## Scope

### In scope

- Remove Team editing and owner consent controls from web, phone web and the Expo
  owner app. Keep every other focused page task, preview and Save/Cancel behavior.
- Replace the administrator's per-business Staff assistance assignment task with
  a read-first, per-person **Manage businesses** control in Staff. Show its saved
  state and a focused revoke/restore action. New and existing eligible staff start
  enabled; changing chat availability or Support/Transport function does not
  silently change this permission.
- Staff with current permission can find and open every business workspace and
  manage its business identity, logo, location, public visibility, handle, live
  presentation, sharing metadata, showroom page, public contacts, categories,
  products and product media. They can publish and restore a page through the
  same readiness and version checks as its owner. Business-specific staff actions
  remain attributed and auditable. Support and Transport chats retain their
  separate queue access and assignment rules.
- A revoked staff member loses business reads and edits immediately, including
  an already open editor. Navigation, direct URLs and APIs must agree.

### Non-goals

- Staff accounts do not become business owners or gain private account contacts,
  sign-in identities, account-email changes, password recovery, staff provisioning,
  platform moderation, security settings or administrator access. The business's
  notification email is a business field, not an account sign-in email.
- This change does not admit staff sign-in to the native app. The native change is
  removal of the owner switch only; staff management remains on the web.
- Existing chat assignments and historical business-assignment rows are not
  deleted or repurposed as business-edit authority.
- No hosted Auth setting or email provider is changed. FE-073/BE-061/DEP-050
  separately require owner-only sign-in-email change: a code to the current
  owner email and confirmation at the new email. Staff and administrators cannot
  bypass provider verification or use a business editor for this change.

## Domain language and invariants

- **Manage businesses** is an administrator-controlled, global permission for a
  current staff identity. It is distinct from a Support or Transport queue role,
  a conversation assignment, a historical business assignment and an owner.
- A business context in a URL is a requested record, never proof of authority.
- Revocation affects private reads, staged media, all writes and publication,
  including requests from a stale page or session. Owners retain only their own
  business access. Administrators retain their platform authority.
- Publication still requires a valid page, product and location and must not
  reactivate a suspended business merely because staff saved content.

## Contracts

- Staff navigation presents a bounded Businesses directory alongside the member's
  existing chat workspace. One selected business retains its contextual task
  navigation, clear return path and saved state. Revoked staff see no business
  records or business-edit controls, but keep their authorized chat tasks.
- The Staff account detail shows **Manage businesses** separately from chat
  function/availability. Only an administrator can save the permission; the
  control explains its all-business reach and names the affected staff member.
- The focused grant form remains safe before client JavaScript hydrates: an early
  Save submits the authorized server action with POST, never exposes form fields
  in a URL, and reports a bounded error or the persisted result.
- Old owner `task=team` links return to Your page or another valid focused task
  without displaying a switch or submitting a permission write. Retired web and
  native `assistance` commands fail safely and cannot recreate owner control.
- Each visible action has an accessible name, 44–48px touch target, confirmation
  for revocation, explicit Save/Cancel, a translated status and a clear success or
  error message. English, Amharic and Afaan Oromo communicate the intent
  naturally; inactive locales retain valid fallback text.
- Keep account email read-only in the ordinary business and staff editors. The
  owner-only dual-verification identity change is a separate security workflow.

## Scenarios

```gherkin
Scenario: New staff member manages a business
  GIVEN an administrator creates a Support or Transport staff account
  WHEN that member opens Businesses on the web
  THEN they can find any business and complete an authorized showroom task
  AND their chat function remains unchanged

Scenario: Administrator revokes one member
  GIVEN two staff members can manage businesses
  WHEN the administrator revokes Manage businesses for one member
  THEN that member's open editor cannot save and private business records close
  AND the other member and the revoked member's chat queue remain usable

Scenario: Administrator saves before the editor hydrates
  GIVEN the focused grant editor is visible but client JavaScript is still loading
  WHEN the administrator confirms and saves the permission
  THEN the save uses the authenticated server action rather than a GET query
  AND the authoritative permission changes at most once with visible feedback

Scenario: Business owner sees a simple page workspace
  GIVEN an owner opens Your page on web or Expo
  WHEN they review the focused tasks
  THEN no Team editing or staff-assignment control appears
  AND Preview, public contacts, products and publication remain available

Scenario: Staff attempts an account-security action
  GIVEN a staff member may manage businesses
  WHEN they request an owner's sign-in email, private account record or password
  THEN the server denies the action without changing the identity
```

## Quality impact

- Security and tenant isolation: server-side current grant checks on each read
  and write; admin-only grant changes; owner tenant limits and account-security
  boundaries remain. BE-060 owns atomic revocation behavior.
- Privacy and data retention: historical assignments/consent stay private but
  inert; broad business visibility is limited to administrator-authorized staff.
- Accessibility and responsive behavior: read-first controls and usable business
  directory at desktop, 390px and 320px; native owner screens remain focused.
- Localization and merchant-entered values: localized intent, no raw role codes;
  existing safe wrapping of business names and descriptions is retained.
- Performance and limits: server pagination/search for all-business directory;
  no full tenant preload or per-row grant query.
- Failure recovery and idempotency: stale edits fail without partial mutation;
  grant Save is versioned, retry-safe and shows the authoritative state.

## Observability

Audit grant creation/revoke/restore and business content mutations with actor,
target staff/business IDs and result codes. Do not log private account contacts,
OTP values, passwords or uploaded media bytes.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Staff directory, business tasks and chat separation | browser/acceptance | `scripts/test-business-team-ui.ts`, `scripts/test-staff-handle-action.ts`, `scripts/test-staff-discovery-route-boundary.ts`, actual Chrome staff/admin journeys |
| Early grant Save before hydration and Cancel | actual Chrome/HTTP | local S146 Chrome admin grant journey with request method and DB readback |
| Owner switch removal and old-link recovery | web/native UI | `scripts/test-owner-focused-tasks.ts`, `scripts/test-mobile-api.ts`, actual Chrome Expo owner journey |
| Revoke while editor is open and direct API denial | security/integration | `scripts/test-business-assistance.ts`, `scripts/test-product-upkeep.ts`, `scripts/test-business-settings.ts`, `scripts/test-business-handles.ts` |
| Account-security and cross-role denial | security | `scripts/test-staff-boundaries.ts`, `scripts/test-account-contacts-postgres.ts` |

## Rollout and rollback

BE-060 defines the additive grant migration and exact old/new deployment order.
Deploy new server checks and navigation only after local protected backup and
permission backfill are verified. Hosted migration, source publication and any
Auth/email change have separate guarded approvals. Rollback keeps the additive
grant history and restores the earlier server/UI contract; it does not delete
businesses, assignments, drafts or audit records. An older server must not
reactivate a revoked member through historical assignment/consent rows; staff
business editing stays fenced until compatible authority is verified.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Local migration76 has an approved protected 75→77 apply and readback with 14
enabled eligible staff and preserved existing data:
`.local/mirtpage-rebrand-s145/local75-to77/attempt-20261019T024300Z/verified.json`.
Focused staff navigation, staff-boundary and business-team UI tests pass. Partial
actual Chrome desktop/phone journeys in `.local/s146-browser-review/` exercised
admin revoke/restore, persisted grant versions, staff directory/chat separation,
owner Your page/Cancel and an early authenticated POST Save. A focused staff
layout run passed desktop status/action non-overlap and 390px no overflow. The
Expo Tracking view passed through the real preview. An earlier genuine local
OTP login established one owner page state only. The later `receipt-expo.json`
passed owner Account→Your page→Page address→Cancel UI assertions with no Team
editing, but route-fulfilled a successful OTP-send response after the local
email quota was exhausted. Real local Supabase verified the token; the browser
workflow remains partial until the same navigation passes with genuine OTP
dispatch and no successful application-response mock. Remaining
migration/security matrix, owner visual approval, full gates, commit and separate
hosted deployment evidence are pending; `status: ready` remains intentional.
