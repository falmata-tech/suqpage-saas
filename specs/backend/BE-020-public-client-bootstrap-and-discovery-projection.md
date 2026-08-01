---
id: BE-020
title: Public client bootstrap and unified discovery projection
status: done
related: [BE-002, BE-003, BE-015, BE-017, BE-019, FE-021, DEP-017, ADR-0011]
owners: [backend, security, operations]
last_updated: 2026-08-01
change_level: L3
---

# BE-020 - Public client bootstrap and unified discovery projection

## Problem and outcome

Invitation-only account creation adds avoidable onboarding delay, while the
current City Suq projection rewrites business locations and mixes geographic and
virtual-venue concerns. The system needs a secure self-service bootstrap and one
public business projection that independently powers geographic discovery and
the daily industry Expo.

## Scope

### In scope

- Atomic public creation of one draft business, one client user/access profile,
  and one first-showroom service request.
- Exact-origin, bounded JSON, strong-password, rate-limit, unique email/handle,
  audit, and safe conflict contracts.
- Immediate authenticated access to the private client workspace.
- Existing admin invitation onboarding as a supported parallel path.
- Indexed eligible business projection including reviewed coordinates.
- Deterministic Expo hall/booth assignment from the selected projection.
- Publication plus active business status as public visibility authority.
- Manual subscription records retained for operations but not used as automatic
  public visibility or discovery gates.

### Non-goals

- Public media upload during account bootstrap.
- Automatic design generation, approval, publication, payment, or staff access.
- Public staff registration, email verification claims, passwordless login, or
  an external identity provider.
- Browser-authoritative coordinates, industry membership, booth media, featured
  status, publication state, or tenant identifiers.

## Domain language and invariants

- **Client bootstrap:** one transaction that creates a private draft tenant,
  client identity, explicit client access profile, and onboarding request.
- The new account can authenticate immediately. The draft showroom is not public
  and contributes to no discovery or Expo result until an authorized manager
  publishes an approved revision.
- Publication activates the business. An administrator can later suspend or
  restore that established business.
- Subscription dates and manual payment entries are advisory operations records;
  they never automatically unpublish, redirect, or remove an active published
  showroom.
- An eligible public business is active, has retained publication, at least one
  published offering, approved discovery media/profile, valid reviewed WGS84
  coordinates, selected indexed industry membership, and no discovery exclusion.
- Every eligible row appears exactly once in map/list/Expo projection. No nearest
  host assignment changes its coordinates.
- Expo ordering is featured first, then normalized business name and ID. Each
  hall has 12 entries and stable references for an unchanged projection.

## Contracts

- `POST /api/signup` accepts JSON only with name, email, phone/WhatsApp, business
  name, requested handle, password, design request, consent, and a bounded
  idempotency token. Request bodies are size-bounded before JSON decoding.
- Name is 2-100 characters; normalized email is at most 160; phone/contact is
  5-40; business name is 2-120; normalized handle is 3-80; design request is
  20-4,000; password follows the existing strong-password policy.
- The endpoint enforces exact origin and privacy-preserving IP/email rate limits.
- Success sets the normal HTTP-only session cookie and returns the private
  request destination. It never returns password hashes, database IDs, contact
  values, storage paths, or staff details.
- Duplicate email or handle returns a safe `409`; malformed or weak input returns
  `400`; throttling returns `429`; unexpected failures return a generic `500`.
- The transaction writes a draft `businesses` row, owner-role `users` row,
  `client` access profile, tenant-bound onboarding `service_requests` row, and
  submitted request event. Failure rolls back every row.
- Existing invite redemption remains single-use and unchanged.

## Scenarios

```gherkin
Scenario: Prospect creates a private client workspace
  GIVEN a new email, available handle, strong password, and valid design request
  WHEN the prospect submits public signup
  THEN one draft business, client account, access profile, and onboarding request
    commit atomically
  AND the prospect receives an authenticated private workspace
  AND no public showroom, marker, list row, featured card, or Expo booth exists

Scenario: Duplicate or partial signup is rejected
  GIVEN an existing email or handle, invalid input, or a failed transaction
  WHEN public signup is attempted
  THEN a safe bounded error is returned
  AND no partial tenant, account, request, or session remains

Scenario: Published active business becomes discoverable
  GIVEN a self-created draft has an approved discovery profile and revision
  WHEN an authorized manager publishes the exact approved revision
  THEN the business becomes active and appears once in map, list, and Expo
  AND no payment or subscription date is consulted

Scenario: Administrator suspends a published showroom
  GIVEN an active published business
  WHEN an administrator marks it suspended
  THEN its public showroom and every discovery projection become unavailable
  AND restoring active status returns it without a payment mutation

Scenario: Browser forges discovery authority
  GIVEN a public or client browser supplies coordinates, featured status, or
    publication state
  WHEN signup or discovery is processed
  THEN those values are ignored or rejected
  AND only reviewed staff-managed profile data is public authority
```

## Quality impact

- Security and tenant isolation: atomic ownership binding, exact origin, strong
  password hashing, explicit client role, rate limits, and no cross-tenant IDs.
- Privacy and data retention: contact/design request remain private; public
  projection contains only approved business presentation/location fields.
- Accessibility and responsive behavior: owned by FE-021.
- Localization and merchant-entered values: bounded Unicode display values;
  normalized ASCII handle and lower-case email authority.
- Performance and limits: indexed one-industry query, no occurrence fan-out,
  bounded payload, and 12-row Expo hall projection.
- Failure recovery and idempotency: transaction rollback, safe duplicate
  response, revocable session, and additive migration only if required.

## Observability

Audit signup success with user/business/request IDs and signup failure by safe
reason code plus privacy hash. Never log password, contact, design request,
session token, or request body.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Atomic bootstrap, conflicts, rate limit, tenant binding | security/integration | `scripts/test-signup.ts`, `scripts/test-security.ts` |
| Public eligibility without subscription gating | integration | `scripts/test-discovery.ts`, `scripts/test-account-health.ts` |
| Unified coordinates and stable Expo halls | integration | `scripts/test-discovery.ts` |
| Exact-origin/body/session behavior | HTTP/browser | `scripts/http-smoke.mjs`, `tests/acceptance/app.spec.ts` |

## Rollout and rollback

This is pre-launch and local fixture data is disposable. Any schema change is
additive. Rollback disables the signup route and restores invitation-only intake;
created draft tenants remain private and may be handled by operations. A future
production rollout requires abuse monitoring, backup, and reconciled migration.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Evidence: verified locally on 2026-08-01. `lib/signup.ts` and `POST /api/signup` provide
atomic draft-tenant/client/request bootstrap, strong-password hashing,
same-origin and bounded-JSON enforcement, privacy-preserving rate limits, safe
conflicts, audit events, and an authenticated private destination. Focused and
HTTP tests prove tenant binding, rollback, no public projection, file rejection,
forged-origin denial, session creation, and unpublished handle denial.
`lib/discovery.ts` supplies one indexed exact-coordinate projection to map,
list, featured, and deterministic 12-booth Expo halls without subscription-date
gating. Explicit suspension and active restoration remain enforced.
`npm run check`, 10/10 ordered acceptance scenarios, and `npm run release`
passed; the production audit reported zero vulnerabilities.
