---
id: BE-020
title: Public client bootstrap and unified discovery projection
status: done
related: [BE-002, BE-003, BE-015, BE-017, BE-019, BE-023, FE-021, DEP-017, ADR-0011]
owners: [backend, security, operations]
last_updated: 2026-08-01
change_level: L3
---

# BE-020 - Public client bootstrap and unified discovery projection

## Problem and outcome

Invitation-only account creation adds avoidable onboarding delay, while the
current City Showroom projection rewrites business locations and mixes geographic and
virtual-venue concerns. The system needs a secure self-service bootstrap and one
public business projection that independently powers geographic discovery and
the weekly industry Expo program.

## Scope

### In scope

- Atomic public creation of one draft business, one client user/access profile,
  and one first-showroom service request.
- Exact-origin, bounded JSON, strong-password, rate-limit, unique email/handle,
  audit, and safe conflict contracts.
- Immediate authenticated access to the private client workspace.
- Existing admin invitation onboarding as a supported parallel path.
- Indexed eligible business projection including reviewed coordinates.
- SQL-counted, limit/offset List pages capped at five rows.
- Deterministic weekday-industry Expo floor-slot assignment and a Sunday
  selected-featured-business livestream projection.
- Detailed booth projection only when the selected schedule date is today;
  non-today selections return count-preserving anonymous slots without client
  identity, media paths, handles, or showroom destinations.
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
- Every eligible row appears exactly once in its applicable projection. No
  nearest-host assignment changes its coordinates.
- City grouping uses normalized reviewed city plus region only after eligibility
  and search filtering. A group contains each eligible business exactly once,
  exposes an exact count and centroid, and retains every member's authoritative
  coordinates for direct discovery data.
- Map filters and search do not narrow the independently date-selected Expo.
- Today's Expo ordering is featured first, then normalized business name and ID.
  Every entry has one sequential stable floor reference for an unchanged
  projection; there is no hall partition.
- Approved `booth_image_path` remains business-owned profile configuration and
  is projected only with that business's revealed booth on today's Expo.
- Schedule dates are calculated in `Africa/Addis_Ababa` for the current
  Monday-through-Sunday calendar week. Entries remain in fixed weekday order
  and exactly one entry is identified as today.

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

Scenario: Public List is requested at scale
  GIVEN more than five eligible businesses match the selected filters
  WHEN a public List page is requested
  THEN SQL count and limit/offset queries return at most five rows
  AND an out-of-range page is clamped to the final available page

Scenario: Weekly Expo is projected
  GIVEN an Ethiopia-local Monday-through-Saturday date is selected
  WHEN discovery is projected
  THEN every eligible business in today's stable industry is assigned once on
    one deterministic continuous floor
  AND map filters do not alter the assignment
  AND Sunday instead returns selected featured businesses for TikTok live

Scenario: Weekly Expo positions remain stable
  GIVEN discovery is projected on any Ethiopia-local weekday
  WHEN the weekly schedule is returned
  THEN its entries remain ordered Monday through Sunday
  AND the current weekday alone is identified as today

Scenario: Non-today Expo identity is redacted
  GIVEN the visitor selects a schedule date that is not today
  WHEN the public Expo projection is built
  THEN it returns the eligible booth count and stable anonymous slot references
  AND it returns no business identity, media path, handle, or destination

Scenario: Matching city businesses form one gateway
  GIVEN at least two eligible map results share a reviewed city and region
  WHEN the public discovery projection is built
  THEN one deterministic city group contains each matching business exactly once
  AND its count and centroid derive only from those reviewed coordinates
  AND an isolated result remains outside every multi-business city group
```

## Quality impact

- Security and tenant isolation: atomic ownership binding, exact origin, strong
  password hashing, explicit client role, rate limits, and no cross-tenant IDs.
- Privacy and data retention: contact/design request remain private; public
  projection contains only approved business presentation/location fields.
- Accessibility and responsive behavior: owned by FE-021.
- Localization and merchant-entered values: bounded Unicode display values;
  normalized ASCII handle and lower-case email authority.
- Performance and limits: indexed industry/search predicates, one linear city-
  grouping pass, bounded five-row List pages, count-only non-today Expo queries,
  and no occurrence or hall fan-out.
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
| Exact coordinates, deterministic city groups, bounded List pages, weekly schedule, Expo slots/redaction | integration | `scripts/test-discovery.ts` |
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

## Evidence

Evidence: completed on 2026-08-01. `scripts/test-discovery.ts` proves one stable
sequential floor-slot projection, approved booth-image ownership, missing-media
exclusion from Expo without geographic exclusion, rolling schedule dates, and
count-preserving non-today slots containing no business, handle, destination,
or media projection. Scale fixtures prove complete unique slot sequences across
all six industries. All 10 browser workflows, `npm run check`, and
`npm run release` passed, including security, HTTP, scale, and production-build
gates. No production rollout occurred.
