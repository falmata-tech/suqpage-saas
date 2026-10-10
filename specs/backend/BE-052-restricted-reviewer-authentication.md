---
id: BE-052
title: Server-bound reviewer authentication
status: in_progress
related: [FE-064, DEP-044, BE-044]
owners: [backend, security, operations]
last_updated: 2026-10-09
change_level: L2
---

# BE-052 — Server-bound reviewer authentication

## Problem

An email label or provider password alone cannot authorize a reusable review login.
Bind the exact managed identity to current ordinary demo-owner authority and keep
this exception out of normal user/passwordless flows.

## Contracts

Server-only configuration binds one normalized email and immutable Supabase UUID.
Missing binding leaves ordinary code login unchanged. Malformed or ineligible
configured binding fails closed. Current application tables must resolve the UUID
to that exact email, client role, linked business, is_demo=1 and non-suspended
status. Never trust provider/client role or tenant metadata. Verify eligibility
before and after provider authentication; a role/tenant change cannot grant access.

A pure policy/application contract selects mode and authenticates through typed
account/identity ports. The PostgreSQL and bounded Supabase clients are adapters.
Mode inputs contain only email; password inputs only email/password. Body size,
formats, exact origin for web, rate limits and safe generic failures apply. A
password session comes from Supabase, with matching verified email/provider UUID,
never from a local session fabrication or fixed access token. Invalid post-login
authority revokes the new session. Native tokens appear only in a successful,
private no-store HTTPS login response and use existing SecureStore/role validation.
Web creates managed cookies only after validated authentication.

Provider provisioning creates a new dedicated demo owner with a recoverable strong
password; no existing account is reset, reassigned or deleted. Ordinary server signup
initializes the private starter, then the reviewed operational fixture is marked
demo. Provider UUID and server binding are independently verified per environment.
No global hosted Auth configuration, provider enablement, SMTP, signing or secret
copy into a client build is authorized by this feature.

## Scenarios and test plan

GIVEN unset binding/ordinary email WHEN mode is requested THEN mode is OTP and
password flow cannot grant access. GIVEN forged UUID/email, staff, unlinked/non-demo/suspended business WHEN signing in THEN
reject before provider password authentication. GIVEN authority changes during
authentication THEN revoke/refuse the new session. GIVEN wrong password/provider
timeout THEN fail with bounded safe errors. GIVEN extra/oversized/malformed HTTP
fields or bad origin THEN reject. GIVEN repeated bad attempts THEN throttle.
GIVEN valid current reviewer THEN return only ordinary client session; existing
tenant/role API checks still deny cross-tenant and native staff operations.

Definition of Ready is met under the owner's delegated safe/convenient release
decisions. Tests must prove these contracts using pure/provider-negative fixtures,
real isolated PostgreSQL and actual local Supabase/HTTP. Protected source/target/
before-state, focused validation and exact readback precede hosted provisioning.
Rollback disables the server binding and retains recovery evidence; no automatic
restore or account deletion after an ambiguous operation. Track S99.2.

## Rollout

Deploy the compatible web/native API before the app binary. Configure only the
verified environment-specific reviewer UUID/email after protected provisioning;
keep the password in Auth and private reviewer instructions, not runtime/build
configuration. Disabling the binding removes this exception. Normal customer
sessions and content remain unchanged; preserve evidence on provider failure.

## Complete local gate evidence

2026-10-09: full repository check, isolated clean-install web release, all 11 browser
acceptance workflows, operations and mobile build contracts pass. Protected
receipts: .local/play-s99/gates/. Final privacy-only copy passes five-language
390/320 captures and localization/narrative/geography checks. No production
provisioning, actual customer erasure or Play-delivered install is inferred.
