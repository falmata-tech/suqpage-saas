---
id: BE-031
title: Passwordless identity and authenticated business onboarding
status: in_progress
related: [BE-039, DEP-033, BE-032, FE-040, BE-002, BE-020, BE-030, FE-038, FE-039, DEP-026, DEP-027, DEP-028, ADR-0014, ADR-0017]
owners: [backend, security, operations]
last_updated: 2026-09-21
change_level: L3
---

# BE-031 - Passwordless identity and authenticated business onboarding

## Problem and outcome

S17 (2026-09-20) supersedes optional Google initiation: app policy disables new Google
authorization even with retained enabled environment flags. Existing identity links,
sessions and callback compatibility remain; email OTP verification is unchanged.
FE-038 defines all Auth/security-email branding and local/hosted boundaries.

The existing public bootstrap combines identity creation, password selection,
contact details, handle choice, and showroom briefing in one unauthenticated
transaction. Suqpage needs a lower-friction identity-first model without
allowing an unlinked Supabase account to invent a role or tenant.

Supabase verifies email OTP first. PostgreSQL then atomically creates
the private business, application user, client access profile, immutable
identity link, and private onboarding profile from a separately authenticated
command. Creating a public business-page project is a later deliberate action.

## Scope

### In scope

- Bounded email-OTP request and verification adapters using Supabase Auth.
- Retained OAuth callback compatibility; new Google initiation is disabled.
- Read access to the current provider identity without granting application
  authorization.
- Authenticated, idempotent business bootstrap for an unlinked identity.
- Compatibility for retained linked users and dormant password rollback data.

### Non-goals

- Trusting provider metadata for roles, tenant IDs, staff capabilities, or
  publication state.
- Deleting password hashes, local session tables, or retained users during the
  monitored rollout.
- Public anonymous business creation, auto-publication, or file upload during
  onboarding.

## Domain language and invariants

- A **provider identity** is a verified Supabase user UUID and email. It is not
  an Suqpage user until one immutable `auth_identity_links` record exists.
- An **unlinked session** may access only account entry, callback, logout, and
  business onboarding.
- Application role, access profile, business ownership, suspension, and
  publication authority remain PostgreSQL-owned.
- A declared onboarding category is private intake context. It never writes or
  implies a reviewed `business_industries` classification.
- One provider UUID and one normalized email may bootstrap at most one
  application user. Races fail safely or return the already-created result.

## Contracts

- OTP request accepts a normalized email of at most 160 characters, applies
  exact-origin and privacy-preserving IP/email rate limits, and calls
  `signInWithOtp` with managed user creation enabled. Its public response is
  generic for accepted provider outcomes.
- Hosted and local Auth configure both the new-identity confirmation template
  and existing-identity magic-link template as the same six-digit Suqpage OTP
  message. Both render `{{ .Token }}` and neither renders a confirmation URL.
- OTP verification accepts the same email and exactly six decimal digits, calls
  `verifyOtp` with type `email`, and returns only `dashboard` or `onboarding`
  destination state.
- OAuth code exchange retains an authenticated unlinked session and returns
  onboarding rather than signing the provider identity out.
- Authenticated onboarding derives provider UUID and email from the server-side
  session. Browser-supplied identity, role, user ID, business ID, publication,
  location, featured, or media fields are ignored or rejected.
- Onboarding atomically creates the draft business, owner user, `client` access
  profile, immutable Supabase identity link, and tenant-bound private onboarding
  profile. It uses a generated collision-safe handle and an unusable
  managed-identity password sentinel; no human password is collected or
  recoverable.
- The onboarding command does not create a service request, design revision,
  public category, map point, featured placement or publication. The local BE-039
  candidate adds a saved private profile and three complete sample offerings,
  contacts and a private example location in the same transaction.
- If the database transaction fails, the provider identity remains unlinked so
  the authenticated user can retry. No compensating deletion is attempted.
- Linked suspended or inactive users fail closed according to the existing
  application authorization path.

## Scenarios

```gherkin
Scenario: Unlinked email identity creates a private workspace
  GIVEN Supabase has verified the email and no immutable application link exists
  WHEN the user submits valid business setup once
  THEN one draft business, owner user, client profile, identity link, and
    private onboarding profile commit atomically
  AND the user can enter only that private workspace
  AND no business-page request or public discovery record becomes eligible

Scenario: Browser forges provider or tenant authority
  GIVEN an authenticated unlinked provider session
  WHEN onboarding includes a provider UUID, role, business ID, or publication state
  THEN the forged authority is rejected or ignored
  AND server-side session identity remains the only identity input

Scenario: Bootstrap transaction fails
  GIVEN a valid unlinked provider session
  WHEN any canonical PostgreSQL write fails
  THEN no partial Suqpage tenant or identity link remains
  AND the provider session may retry onboarding safely
```

## Quality impact

- Security and tenant isolation: immutable link plus server-derived identity;
  rate limits, exact origin, generic failures, and negative race tests.
- Privacy and data retention: safe hashes only in rate-limit keys; no auth or
  contact values in audit detail.
- Accessibility and responsive behavior: owned by FE-038.
- Localization and merchant-entered values: bounded Unicode names and summary;
  normalized ASCII generated handle.
- Performance and limits: bounded provider calls and one canonical transaction.
- Failure recovery and idempotency: retryable unlinked session, idempotency key,
  unique constraints, and no provider deletion after verified sign-in.

## Observability

Audit operation, result code, linked/unlinked state, and duration bucket. Never
record raw email, OTP, OAuth code, provider UUID, cookie, phone, or request text.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| OTP start/verify and generic failures | unit/security | `scripts/test-auth-runtime.ts`, focused route tests |
| Server-derived identity and atomic bootstrap | integration/security | `scripts/test-signup.ts`, `scripts/test-security.ts` |
| OAuth linked/new routing | browser | `tests/acceptance/app.spec.ts` |
| PostgreSQL parity and race safety | integration | `scripts/test-postgres-runtime.ts` |

## Rollout and rollback

Keep retained password identities and the prior deployed application during the
monitoring window. Enable public OTP only after custom SMTP and a real-address
delivery smoke; enable Google only after redirect and callback smoke. Rollback
restores the prior application and disables new provider entry without deleting
provider users, links, or private draft businesses.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

On 2026-09-12 `npm run check`, `npm run release`, and all 10 ordered
production-browser acceptance workflows passed against isolated Supabase
PostgreSQL, Auth, Storage, and Mailpit. Evidence covers real email-code
verification, server-derived identity, atomic and retryable onboarding, private
category storage, tenant denial, and dashboard routing. Hosted Google
consent/code exchange and production delivery smoke remain rollout gates under
DEP-028, so this spec remains in progress.

S2g contact separation (BE-032/FE-040): signup phone is private users.account_phone;
verified account email is retained. FE-046/BE-039 supersede the empty public
contact default for NEW private workspaces in the local candidate with explicitly
fictional editable contact examples, independent of real account identity. Existing
records and cleared fields remain unchanged; hosted rollout is pending.

## Evidence: verified rollout — 2026-09-21

Source `be134a247c8ea54b18b882f9e2368058f7fbc0ee` is published as Netlify `6ab0d349f099639821fa0f9a` at https://suqpage.com.
Full check, release, operations, all nine isolated provider browser scenarios,
artifact privacy and production dependency audit pass. Production schema 47,
64 updated demo pages/256 offerings, all 64 public routes, live search at
1440/390/320, email-only entry, private-route denial, health and www redirects
are independently verified. Mapped focused tests and earlier desktop/phone
reviews remain applicable; the owner approved this release.

Earlier dated pending-approval/local-only notes are superseded by this rollout.
No real external email was sent and no authenticated hosted account was used
for testing; those admission checks remain separate from local provider evidence.
Demo contact destinations are examples, not verified delivery channels.
See docs/SUQPAGE-RELEASE-2026-09-21.md for backup, rollback and limitations.

## S23 audit correction — dormant password operations

GIVEN Supabase managed authentication WHEN legacy password login/change/admin-reset
is invoked THEN reject before password verification, provider calls, database
writes or session revocation. Keep the local rollback implementation available
only in local Auth mode. FE-038 hides the unavailable recovery form. Tests cover
both modes and action guard placement; the browser checks actual admin markup.

GIVEN managed Auth WHEN an authorized administrator creates staff or a valid
invitation is redeemed THEN provision an email-only provider identity with an
unusable local password sentinel and no temporary-password requirement. Invitation
redemption links the same intended tenant but creates no authenticated browser
session; the recipient verifies their email through normal code entry. Provider
failure, duplicate email, expired/replayed tokens and transaction failure retain
existing safeguards. No email is sent as part of provisioning. Retained local Auth
still requires a strong password. Tests exercise real local provider provisioning,
email identity links and invitation replay, plus isolated local rollback tests.

## S22–S24 approved release evidence

The owner approved the combined visuals and deployment on 2026-09-21. Full check,
release, operations, nine isolated provider browser scenarios and Netlify artifact
privacy checks pass. Earlier S22–S24 pending-review notes are superseded.
Deployment evidence and remaining hosted-email limits:
`docs/SUQPAGE-S22-S24-RELEASE-2026-09-21.md`.
