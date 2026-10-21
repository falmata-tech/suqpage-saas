---
id: BE-061
title: Verified owner email and application identity reconciliation
status: ready
related: [FE-073, DEP-050, FE-072, BE-060, BE-030, BE-031, BE-044, FE-038]
owners: [backend, security]
last_updated: 2026-10-18
change_level: L3
---

# BE-061 — Verified owner email and application identity reconciliation

## Problem and outcome

Supabase Auth holds the sign-in email while MirtPage also stores the current
account email in `users.email`. The stable provider UUID is linked to the local
user. A provider-only email change would leave the account display, owner
communications and deletion workflow inconsistent. A database-only change would
not change sign-in and could enable takeover. The outcome is an owner-verified,
recoverable transition of one existing identity, without giving business staff
account-credential authority.

## Scope and non-goals

- Bind each pending change to the signed-in owner, its immutable Supabase
  provider UUID, current verified email and proposed normalized email. Admit at
  most one active proposal per owner and expire unconfirmed proofs.
- Require an owner-controlled code to the current address and a separate code
  to the proposed address before completion. Use the provider's secure email
  change path with its old/new confirmations; do not use provider admin email
  mutation to bypass those proofs. [Supabase documents two OTPs with Secure Email
  Change](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook) and
  says its [admin update applies immediately without confirmation](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid).
- After provider confirmation, re-read the authoritative provider user and
  reconcile `users.email` in an idempotent, audited database transaction only if
  UUID, both expected addresses and the pending intent still match. Preserve
  `auth_identity_links.email_at_link` as the historical link-time snapshot.
- Reject and recover safely from a duplicate proposed address, expired or
  replayed code, altered actor/tenant, revoked role, provider outage, uncertain
  provider outcome, or database conflict after provider success.
- Revocation is an authorization boundary: a staff member assigned to edit a
  business, an operations manager or a platform administrator does not acquire
  the owner's Auth session or permission to change its sign-in email. A stolen
  page-edit request cannot supply or capture the owner's codes.

No ownership transfer, account merge, password reset, public-contact change,
Google identity change or general Auth administration is added here.

## Identity and data invariants

- The verified provider UUID remains the account key. A client-supplied email,
  user ID, business ID, code-verification flag or staff role is not authority.
- `users.email` reflects the currently verified provider email only after both
  confirmations. The local historical `email_at_link` does not become a mutable
  credential field. Normal account reads cannot silently accept mismatched
  provider/local emails as a successful change. If a misconfigured provider
  changes the email immediately, the absent old/new code proofs prevent app
  reconciliation and the owner task fails closed.
- A provider-complete/local-write-failed transition retains a narrowly scoped
  pending reconciliation record. The next verified owner sign-in retries only
  that same UUID and proposed email; any drift fails closed and is reported for
  protected recovery. An ambiguous provider timeout is read back, not retried
  as a new change or auto-rolled back.
- Existing refresh sessions are revoked on completion and fresh sign-in is
  required. Because Supabase access JWTs can remain valid until expiration,
  application authorization also rejects pre-change owner sessions on protected
  requests after reconciliation. Neither UI nor operations may claim immediate
  JWT revocation by [provider logout alone](https://supabase.com/docs/guides/auth/signout).
- Owner account-erasure plans must verify the current provider UUID and current
  verified provider/application email, without requiring the historical
  `email_at_link` to equal a later email. A special reviewer account whose
  fixed email binding changes stays denied rather than silently repointed.

## Scenarios

```gherkin
Scenario: Both mailbox proofs complete
  GIVEN an active owner has a linked provider UUID and a pending proposed email
  WHEN the current and proposed mailbox codes are verified and the provider
    reports the new confirmed email on the same UUID
  THEN exactly that owner's users.email is updated once
  AND the historical link email, business owner ID, roles and public contacts
    remain unchanged
  AND older owner sessions require fresh sign-in

Scenario: Staff or manager attempts to bypass owner proof
  GIVEN an administrator granted staff full management of a business
  WHEN staff, manager or an unrelated owner submits any email-change step for it
  THEN the request is denied before a provider mutation or email dispatch
  AND no provider or application identity field changes

Scenario: Only one mailbox is confirmed
  GIVEN the provider is still waiting for the other mailbox confirmation
  WHEN the app checks the pending change
  THEN users.email remains the old verified address
  AND no success notice or credential handoff is issued

Scenario: Provider succeeds but application write fails
  GIVEN both codes were verified and the provider changed the email
  WHEN an application uniqueness conflict or temporary database error prevents
    the local update
  THEN a bounded pending state is retained without accepting unrelated emails
  AND the next verified owner access retries the same authoritative UUID/email
  OR fails closed for protected recovery if reconciliation cannot be proven

Scenario: Owner requests erasure after changing email
  GIVEN the provider UUID is unchanged and the new verified email is current
  WHEN a protected erasure plan is prepared
  THEN it binds the current provider/application email and exact UUID
  AND it does not mistake email_at_link for the current credential
```

## Quality impact and observability

- Use single-use, expiring, rate-limited email proof with generic responses that
  do not expose another account's existence. Never log code, email, hash,
  provider UUID, session or callback URL. Audit safe actor/result categories.
- Keep provider calls bounded and outside application database locks. Fence
  concurrent requests, stale owner role and current-pending state at commit.
- The Auth adapter and application transaction are separate failure domains.
  Never claim an atomic cross-provider write or restore a provider email by
  an unverified admin call.
- English, Amharic and Afaan Oromo messages are selected at the UI boundary;
  this backend returns stable safe outcome codes and no provider diagnostics.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Owner-only initiation and two proofs | security/integration | `scripts/test-owner-email-change.ts`, `scripts/test-owner-email-change-local.ts`, local Supabase/Mailpit |
| UUID binding, duplicate, replay, rate limit, stale role | security/persistence | `scripts/test-owner-email-change.ts`, `scripts/test-owner-email-change-local.ts`, `scripts/test-owner-email-change-migration.ts` |
| Provider completed/local failed reconciliation | adapter/integration | `scripts/test-owner-email-change.ts`, isolated PostgreSQL failure injection |
| Old JWT/session and cross-tenant denial | security/browser/native | `scripts/test-auth-runtime.ts`, `scripts/test-mobile-auth-fetch.ts`, actual Chrome/Expo |
| Post-change account erasure and fixed reviewer denial | operations/security | `scripts/test-account-erasure.ts`, `scripts/test-reviewer-access.ts` |

## Rollout and rollback

Add only a bounded pending-state schema and compatible read path before exposing
the owner task. Back up and rehearse the migration; no existing identity or
business row is rewritten by installation. If the UI is rolled back, verified
provider completions still reconcile through the compatible read path. Recovery
for a provider-complete/app-incomplete change uses the protected UUID-bound
pending record, never an unreviewed admin email overwrite. DEP-050 controls
provider settings and staged rollout.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps acceptance criteria
- [x] Rollout/rollback decided

## Completion evidence

The local provider/application workflow, old-session fence and historical-link
regression pass in `scripts/test-owner-email-change-local.ts`. The isolated
migration and account-erasure regressions also pass. Local migration77 is now
installed with empty pending-request and session-fence tables, preserving the
existing owner rows; see `.local/mirtpage-rebrand-s145/local75-to77/attempt-20261019T024300Z/verified.json`.
Hosted Auth verification, local app UI review and release gates remain pending;
no hosted Auth or database change is authorized by this spec alone.
