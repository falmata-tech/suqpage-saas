---
id: FE-073
title: Owner-verified sign-in email change
status: ready
related: [BE-061, DEP-050, FE-072, BE-060, FE-038, FE-053, FE-056, BE-044, BE-031]
owners: [product, frontend, security]
last_updated: 2026-10-18
change_level: L3
---

# FE-073 — Owner-verified sign-in email change

## Problem and outcome

An account's sign-in email is presently read-only. Business staff need broad
showroom-management access under FE-072/BE-060, but a staff member must not be
able to replace the owner's sign-in identity. The owner needs a clear, separate
way to change that private email, with proof from the existing mailbox before
the new mailbox becomes the sign-in address. This is a security task inside
Account settings, not a business-page or public-contact edit.

This follows [OWASP's email-change guidance](https://cheatsheetseries.owasp.org/cheatsheets/Email_Validation_and_Verification_Cheat_Sheet.html):
verify the existing account holder, confirm the proposed mailbox, and notify
the previous address. The two mailbox proofs below are the chosen passwordless
step-up for MirtPage; no staff override is inferred from business access.

## Scope

- Give a signed-in business owner a focused Change sign-in email task in web,
  phone web and the Expo owner app. Keep the current address visible in private
  Account settings and clearly distinguish it from public contact email.
- Show a pending process with separate six-digit codes sent to the current and
  proposed addresses. The current-address code proves the owner requested the
  change; the new-address code proves the replacement can receive sign-in mail.
- Show concise expiry, already-used-address, temporary provider
  failure, completion and fresh-sign-in states without losing the proposed
  address on a recoverable error. Leaving the task does not cancel a provider
  request; the saved account email changes only after both proofs and backend
  reconciliation under BE-061.

## Non-goals

- No staff- or admin-entered direct change to an owner's Supabase Auth email,
  no staff access to an owner's codes, and no transfer of business ownership.
- No change to the public business contact email, social accounts, products or
  staff's ordinary business-management scope under FE-072/BE-060.
- No in-app bypass when the owner no longer controls the old mailbox. Account
  recovery in that situation requires a separately reviewed identity process.
- No Google-identity migration, automatic account merge, new paid Auth feature
  or hosted provider change as part of rendering this task.

## Domain language and invariants

- **Sign-in email** is the private owner account credential. **Public contact
  email** belongs to a showroom and remains a separate editable field.
- A signed-in session alone cannot finalize an email change. The current
  mailbox's code is the owner step-up proof; the new mailbox has its own code.
  Both must succeed before the app describes the change as complete.
- All email codes and pending states belong to the authenticated owner identity,
  never to the selected business, staff assignment or a form-supplied user ID.

## Contracts and scenarios

- Account settings has one deliberate Change sign-in email destination. It
  displays the saved current email until BE-061 confirms and reconciles the
  provider change. On completion it requires a fresh owner sign-in.
- The interface explains why two mailboxes receive codes. It does not claim an
  email was changed after merely sending a request or confirming one mailbox.
- If a code is no longer valid, the task gives an account-help path; it does
  not offer resend until the provider's old/new delivery behavior is verified.
  Leaving the task is not a provider cancellation.
- Codes are entered in labeled six-digit fields, with
  visible progress/errors, keyboard support, 44px touch targets and no horizontal
  overflow at 320/390px. English, Amharic and Afaan Oromo explain the idea
  naturally; hidden locales receive no new public selector entry.
- A submission made before client hydration uses an authenticated Server Action
  POST with the same owner checks. Neither the proposed address nor a code may
  appear in a GET URL; the page resumes from authoritative pending status.

```gherkin
Scenario: Owner changes the private sign-in email
  GIVEN a linked owner has access to the current and proposed mailboxes
  WHEN they open Change sign-in email and complete the current-email and
    new-email code checks
  THEN Account settings shows the newly verified address
  AND the owner must sign in again with that address
  AND the public business contact details are unchanged

Scenario: One code is missing, wrong, expired or replayed
  GIVEN an email change is pending
  WHEN either mailbox proof fails or is not supplied
  THEN the saved account email and sign-in identity remain unchanged
  AND the interface directs the owner to account help without exposing a code

Scenario: Staff opens a business-management workspace
  GIVEN an administrator has allowed a team member to manage a business
  WHEN the team member opens its settings or submits an email-change request
  THEN they may edit only their authorized business fields
  AND they cannot see or change the owner's private sign-in email

Scenario: Owner cannot use the old mailbox
  GIVEN the owner cannot receive the current-email code
  WHEN they open Change sign-in email
  THEN the app does not offer a staff/admin override
  AND it directs them to the separately verified account-recovery route

Scenario: Owner submits before the page hydrates
  GIVEN a linked owner is on the sign-in email task
  WHEN the owner submits a proposed address or verification code before client JavaScript is ready
  THEN the browser sends an authenticated POST instead of a GET with private fields
  AND the task resumes from the saved provider and application state
```

## Quality impact

- Security and tenant isolation: only the current verified owner identity can
  request and complete its own change. Staff business authority is irrelevant.
- Privacy and data retention: do not put codes or full private addresses in
  public pages, URLs, browser analytics or notification previews.
- Accessibility and responsive behavior: labeled code fields, status/live
  region, logical focus after send/verify and usable phone/web controls.
- Localization and merchant-entered values: authored en/am/om task copy;
  email addresses are displayed exactly as verified, not translated.
- Performance and limits: bounded provider calls and resends; no background
  polling that continually requests codes.
- Failure recovery and idempotency: Leaving the screen or app-side expiry
  cannot activate a new email. A delayed provider confirmation still requires
  exact UUID- and address-bound reconciliation, even if the screen expired.
  Provider completion followed by app-write failure is recoverable under BE-061
  without asking staff to force an Auth update.

## Observability and test plan

Record safe request/old-confirm/new-confirm/reconciled/failure categories and
latency only. Do not log emails, codes, token hashes, provider UUIDs or sessions.

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Owner task, pending/error/completion and localization | browser/native | `scripts/test-owner-email-change-local.ts`, Chrome desktop/phone and Expo 8082 |
| Staff cannot enter or submit the private task | security/browser | `scripts/test-owner-email-change-local.ts`, `scripts/test-owner-email-change.ts` |
| Saved/public email separation and fresh sign-in | acceptance | `tests/acceptance/app.spec.ts`, actual local provider/Mailpit workflow |
| Responsive and accessible code entry | browser/accessibility | `scripts/test-accessibility-audit.mjs`, focused captures |
| Pre-hydration safe POST and no private GET fields | browser/security | focused Chrome method and URL review |

## Rollout and rollback

The focused task stays unavailable unless the backend and exact provider
configuration pass DEP-050. On rollback, hide initiation while retaining
pending/confirmed provider state for reconciliation. Never revert a verified
email by changing it directly in the provider dashboard. The account and public
contact fields remain separate throughout.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps acceptance criteria
- [x] Rollout/rollback decided

## Completion evidence

Local provider and application two-code proof passes in
`scripts/test-owner-email-change-local.ts`. The approved local migration77
installed empty pending-request and session-fence tables without changing owner
records; see `.local/mirtpage-rebrand-s145/local75-to77/attempt-20261019T024300Z/verified.json`.
The focused desktop/phone wrapped-email layout and Account navigation-hover
visuals were separately approved by the owner after installed-Chrome review;
`.local/s146-browser-review/receipt-email-only.json` and
`nav-hover-1440.png` retain the local evidence. That review did not request
email codes or prove the complete owner workflow. Full check/release/acceptance,
hosted Auth verification and deployment remain pending under DEP-050; the owner
entry point stays disabled.
