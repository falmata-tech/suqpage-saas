---
id: BE-002
title: Authentication and external adapter failure boundaries
status: done
related: [BE-018]
owners: [backend, security]
last_updated: 2026-07-22
change_level: L2
---

# BE-002 — Authentication and external adapter failure boundaries

## Problem and outcome

Successful authentication must not consume the failed-attempt budget. Authenticated
JSON APIs and optional notification providers need bounded input/failure behavior
without leaking internal error details or delaying committed inquiries indefinitely.

## Contracts and invariants

- A successful login clears the rate-limit record for that identity/email key.
- A valid authenticated user who visits `/login` is redirected to the dashboard
  (or required password-change page) instead of being shown another login form.
- Protected routes remain fail-closed for missing, expired, or revoked sessions;
  interface links never grant authority.
- Failed attempts remain persistently limited and return the existing generic
  credential error.
- Delivery API request bodies are bounded before JSON parsing.
- Unexpected delivery failures return a generic error and server-side safe log.
- Inquiry email notification has a finite timeout and reports non-2xx responses
  as provider failure without rolling back the committed inquiry.

## Scenarios

```gherkin
Scenario: Repeated legitimate sign-in
  GIVEN a valid account below the failure threshold
  WHEN the account signs in successfully multiple times
  THEN successful sign-ins do not accumulate toward a lockout

Scenario: Signed-in user reaches the login route
  GIVEN a valid authenticated session
  WHEN the browser navigates directly to the login route
  THEN the user returns to the authenticated dashboard
  AND no second sign-in form is shown

Scenario: Oversized authenticated delivery request
  GIVEN an authenticated owner
  WHEN the owner sends a body above the documented API limit
  THEN the API returns 413 before parsing or writing delivery data

Scenario: Notification provider fails
  GIVEN a committed inquiry and configured email provider
  WHEN the provider times out or returns a non-success status
  THEN the inquiry response completes after a bounded wait
  AND no provider response body or customer contact is exposed
```

## Observability

Record safe event category/status only. Do not log passwords, tokens, raw provider
bodies, customer contact, or inquiry notes.

## Test plan and evidence

- Security integration test for reset-on-success rate-limit behavior.
- Authenticated browser/API regression for oversized delivery body.
- Notification adapter test for non-2xx and timeout-safe failure.
- Existing HTTP, security, acceptance, and release gates.
- Evidence: on 2026-07-20, `npm run check`, `npm run test:acceptance`,
  `npm run test:operations`, and `npm run release`.

## Rollout and rollback

No schema migration. Deploy normally after L2 gates; rollback is code-only and
does not affect committed inquiries or sessions.
