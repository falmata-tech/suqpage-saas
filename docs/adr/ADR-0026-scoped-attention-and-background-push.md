---
id: ADR-0026
title: Scoped attention events and bounded background push
status: accepted
date: 2026-10-07
deciders: [product, engineering]
related: [FE-062, BE-050, BE-018, DEP-043, ADR-0023]
---

# ADR-0026 — Scoped attention events and bounded background push

## Context and decision drivers

The owner requests inquiry, staff and visitor alerts plus truthful read receipts.
Staff is web-only; native owners/guests use Expo. Existing chat polling avoids
hosted Realtime configuration but cannot notify a suspended/closed app. Fetching
messages currently marks them read, which cannot support honest read receipts.

## Considered options

1. Foreground count polling only: simple, but cannot establish closed-app alerts.
2. Supabase Realtime only: improves open connections, not OS/background delivery.
3. PostgreSQL attention/outbox plus Expo Push and Web Push: preserves existing
   authority/transactions, supports each client without changing chat transport.

## Decision

Use option 3, with explicit visible-message read acknowledgements separate from
alert-read state and assignment separate from confirmed agent joining. Background
coverage is the stated default pending the owner's optional scope response.
Use typed narrow delivery ports, bounded retries, source/recipient deduplication,
fresh role/session validation and generic payloads. Existing email/Telegram adapters
remain compatible. Core works independently of provider configuration. Local
implementation does not authorize credential writes or claim native delivery.

## Consequences

The event survives provider outage and supports web/native unread UI consistently.
Push needs permission and provider credentials; OS delivery is not guaranteed.
FCM setup and rebuilt-device tests are separate from Google Play account readiness.
Browser subscriptions are sensitive capability URLs: validate destinations, protect
storage and never log them. Private message content does not enter push payloads.
Additive migrations preserve history and safe rollback; scheduled retries remain
bounded. Do not add a generic notification platform or new chat provider.

## Verification

BE-050 tests transactional events, receipts/joins, isolation, retry and revocation.
FE-062 captures real conversations/visibility and five-language phone UI. DEP-043
requires actual OS delivery and signed-device evidence before readiness claims.
Primary provider guidance checked 2026-10-07:
https://docs.expo.dev/push-notifications/push-notifications-setup/
https://docs.expo.dev/push-notifications/fcm-credentials/
https://developer.mozilla.org/en-US/docs/Web/API/Push_API

The runtime must not contain the owner's saved EAS/Expo account-management token.
For MVP, admit Expo's documented standard private-device-token transport only
with an explicitly selected `SUQPAGE_NATIVE_PUSH_MODE=standard`, after verifying
FCM/project configuration and that enhanced access-token enforcement is not enabled.
If the project already enforces enhanced security, stop that admission; do not
silently disable it or reuse a CLI account token. A project-isolated credential
architecture needs separate review. Device tokens remain private server-held
capabilities, with authenticated/token-bound subscription and generic payloads.
Primary contract: https://docs.expo.dev/push-notifications/sending-notifications/
(Additional security). No hosted security setting changed during implementation.


## Assigned-chat escalation email extension (S126)

Reuse the existing Resend email provider through a narrow typed port. Add a
private PostgreSQL email outbox attached to the existing overdue attention event;
this does not introduce another notification platform, provider or schedule.
The ten-minute deadline starts at the later of the oldest unanswered customer
message or current assignment. Join, reads and notes are not public replies.
Original customer wait and assignment history remain authoritative.

Create one job per current assignment/message/admin or operations manager,
atomically with the event. Resolve the canonical recipient, current role,
assignment and unanswered cycle again before dispatch. Include only reference,
queue, assigned staff name and an authenticated dashboard link. Do not email
customer content, contact details or routes. A repeated cycle is deduplicated by
the notification identity and stable provider idempotency key. Acceptance is not
a claim of inbox delivery or reading. Bound dispatch to two sends per invocation,
four-second HTTP calls, six attempts, thirty-second leases and a twenty-four-hour
expiry. Do not hold database locks across provider calls.

Local workers explicitly use the installed loopback Mailpit capture, with exact
database/Auth target guards and relay/forwarding checked before actual tests.
Default external delivery refuses a loopback database or Auth endpoint at any
port. Hosted delivery requires existing verified sender/configuration and a
separately reviewed rollout; local inbox evidence is not hosted email evidence.
See BE-018, BE-050 and DEP-043 for contracts and mapped verification.
