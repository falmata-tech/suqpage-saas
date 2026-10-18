---
id: ADR-0028
title: Tracking-only verified recipients and independent shipments
status: accepted
date: 2026-10-17
deciders: [product, architecture, security]
related: [BE-058, FE-069, DEP-048, BE-057]
---

# ADR-0028 — Separate tracking identity from chats and accounts

## Context and decision

One visitor or business may arrange many shipments across ended or unrelated
chats. Account Auth creates business/user identities and must not be used to
silently adopt a recipient or replace staff/owner sessions. S137 anonymous plan
capabilities no longer satisfy the owner's requirement to verify each recipient.

Use a narrow email-code recipient/session subsystem and independent shipment
aggregate. Verification uses purpose-separated existing HMAC and random nonces,
bounded atomic attempts and tracking-only opaque sessions. This adds no provider,
secret or hosted Auth configuration. Staff use fresh transport authority and a
validated exact email, never the recipient's code. Shipment locators
are not access credentials. New plans belong to recipients, not conversations.

Submit creates an outbox job atomically; a guarded existing Mailpit/Resend adapter
sends outside transactions using leases, retries and idempotency. Provider
acceptance does not establish delivery. Email includes the recipient-verification
link and safe plan details. Anonymous legacy APIs retire; legacy rows remain
private without inferred recipient or automatic migration.

S141 (2026-10-18) clarifies that verification gates recipient reads, not staff creation.
Authorized staff can create an independent plan before that email has visited
Tracking. Additive72 permits an explicit NULL verified_at on a pending recipient;
it does not create an account or session. Staff submission preserves existing
verified identity/locale. Recipient OTP later verifies the same recipient ID and
unlocks all its shipments across any number of chats. Session reads require
verification as well as a fresh scoped session. Initial plan email is queued at
Submit; an emailed locator alone grants no access. Current staff creation starts
only in the standalone Tracking workspace; historical chat-bound plans stay
private/read-only, with their data retained.

## Alternatives and consequences

Reusing account OTP/JWT would mix identities and permissions; retaining bearer
links would violate recipient verification; tying shipment IDs to chat would
prevent independent history. Separate bounded identity adds session/outbox upkeep
and must retain dedicated negative authorization tests. Future carrier scans and
recipient transfer require new explicit contracts; neither is implied here.

## Verification

BE-058 tests concurrent attempts, cross-recipient and owner/staff isolation,
session expiry/revocation, staff-role freshness and atomic submission/outbox.
FE-069 verifies real multi-shipment portal and independent staff tasks. DEP-048
protects local and later hosted migration/rollback boundaries.
