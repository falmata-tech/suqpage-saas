---
id: ADR-0017
title: Auth-first passwordless onboarding
status: accepted
date: 2026-08-25
deciders: [AfricMade]
related: [FE-038, BE-020, BE-030, BE-031, DEP-028, ADR-0014]
---

# ADR-0017 - Auth-first passwordless onboarding

## Context

The previous public signup attempted to create identity, credentials, a tenant,
and a complete showroom request from one long anonymous form. That increases
friction and couples external identity failure to canonical business creation.
AfricMade is adopting Supabase Auth and needs email-code and Google entry without
moving tenant authorization into provider metadata.

## Decision drivers

- A visitor should prove control of an email or Google account before entering
  business details.
- An unlinked provider user must have no application role or tenant authority.
- Existing linked accounts and private draft businesses must remain intact.
- Identity and business creation cross provider/database boundaries and cannot
  share one transaction.

## Considered options

1. Keep the long password signup. It preserves the current transaction but
   retains avoidable friction and password lifecycle work.
2. Create a tenant automatically during OTP/OAuth callback. It is short but
   creates empty businesses and trusts incomplete provider data.
3. Verify identity by email code or Google first, then atomically bootstrap business state from a
   protected onboarding command.

## Decision

Choose option 3. Supabase owns email OTP, Google OAuth, and session validity.
AfricMade exposes an unlinked provider session only to onboarding and logout.
PostgreSQL atomically creates the draft business, application user, access
profile, immutable provider link, and onboarding request after the user submits
bounded business details. Provider metadata never supplies role or tenant
authority.

Retained password hashes and private `MIRTPAGE_*` identifiers remain during the
rollback window. New passwordless accounts receive no usable local password.

## Consequences

### Positive

- Entry asks for one email or Google action before business details.
- Failed onboarding is retryable without deleting a verified identity.
- Existing and new users share one managed session authority.
- Tenant creation remains one canonical PostgreSQL transaction.

### Negative / debt

- Public OTP requires production SMTP and Google requires external OAuth
  credentials; neither may be claimed ready from code alone.
- The application must distinguish authenticated-unlinked from authorized-linked
  sessions on every relevant route.
- Internal MirtPage compatibility identifiers remain until a later, separately
  reversible cleanup.

## Verification

BE-031 security and PostgreSQL tests prove immutable linking, server-derived
identity, retry/race behavior, and tenant denial. FE-038 browser tests prove
email-code, Google, onboarding, responsive, and accessible states. DEP-028 blocks
production claims until real provider delivery and exact-deploy smoke pass.
