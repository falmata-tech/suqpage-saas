---
id: BE-045
title: Private account name and phone
status: in_progress
related: [FE-056, FE-040, BE-031, BE-032, BE-044]
owners: [backend, security]
last_updated: 2026-10-07
change_level: L2
---

# BE-045 — Private account name and phone

## Problem and scope

Owners can update their private display name and account phone from a focused
Profile editor. Name is trimmed, nonempty, at most 80 characters and rejects
control characters. Phone uses existing normalization/validation. Email/provider
UUID, access role, tenant, public business name/contacts and handle are unchanged.
No Supabase metadata/SMTP/Auth configuration write and no schema migration.

Extend the account port with an atomic name/phone save, deriving user ID solely
from the authenticated actor. Native owner/account accepts optional name alongside
phone; legacy phone-only callers retain behavior. Reject unsupported keys and
invalid values before changing either field. Return only confirmed saved state.
Web actions use fixed success/error destinations; never arbitrary client URLs.

## Scenarios

GIVEN an authenticated actor WHEN valid name/phone are saved THEN update only
their existing user row atomically. WHEN input is invalid/unauthenticated or
forged fields include another user/tenant THEN reject and preserve all rows.
GIVEN a legacy phone-only call THEN retain current account name. GIVEN public
catalogs or contact projection THEN do not expose account email/phone/name.
GIVEN a user row without a current access profile THEN the authenticated session
projection is unavailable; private-account fixtures must supply explicit role
authority before asserting returned session fields.

## Test plan

Tests map parsing boundaries, self scope, identity/public preservation, invalid
atomic rollback, missing account and backward-compatible native API behavior in
scripts/test-account-contacts.ts and scripts/test-mobile-api.ts. FE-056 adds
actual editor save/re-entry checks. Fixed existing adapters and bounded queries
are reused; no DI layer/class/provider is added. Safe logs contain no account
values.

## Rollout and readiness

Definition of Ready met; local tests precede code rollout, and rollback
retains already-saved fields while reverting only UI/API support.
