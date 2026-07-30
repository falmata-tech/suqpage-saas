---
id: FE-019
title: Responsive client and staff support inbox
status: done
related: [BE-018, DEP-015, ADR-0009]
owners: [frontend, customer-support]
last_updated: 2026-07-30
change_level: L2
---

# FE-019 - Responsive client and staff support inbox

## Problem and outcome

Clients need a simple place to ask SuqPage for help, and team members need a
stupid-proof queue that remains usable on phones and with many conversations.

## Scope

### In scope

- Client conversation list, new-conversation form, message thread, and reopen.
- Staff waiting/open/closed tabs, paginated search, claim/reassign, reply, close,
  and reopen controls.
- Operations workload summary with per-agent enablement and assignment limits.
- Clear assignment, unread, queue, and capacity states.
- Responsive single-column thread on phones and compact queue/thread workspace
  on wider screens.

### Non-goals

- Public anonymous widget, attachments, typing indicators, presence, or chatbot
  UI.

## Scenarios

```gherkin
Scenario: Client starts support from a phone
  GIVEN an authenticated client
  WHEN they enter a subject and message
  THEN the new conversation appears with waiting status
  AND its thread remains readable without horizontal scrolling

Scenario: Staff claims and closes a conversation
  GIVEN a waiting conversation and available staff capacity
  WHEN a team member claims, replies, and closes it
  THEN the client sees the reply and closed state
  AND the team member regains one assignment slot
```

## Quality impact

- Security and tenant isolation: UI projections contain only authorized data.
- Privacy and data retention: no support body appears in browser notifications
  or public markup.
- Accessibility and responsive behavior: labeled forms, status text, 44px mobile
  controls, focus-safe errors, and bounded message regions.
- Performance and limits: paginated lists and incremental five-second polling
  only while a thread is open.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Client create/read/reply | browser | `tests/acceptance/app.spec.ts` |
| Staff queue/claim/reply/close | integration/browser | `scripts/test-support.ts`, `tests/acceptance/app.spec.ts` |
| Phone fit and labels | browser | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

Navigation appears only for authenticated supported roles. The inbox does not
depend on Telegram configuration and can be disabled without losing messages.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Evidence: verified locally on 2026-07-30.

The client inbox/thread, staff queue/thread, five-second open-thread refresh,
operations workload controls, role-aware navigation, and responsive styles are
implemented. `scripts/test-support.ts` proves claim, reply, close, reopen,
reassign, queue, and capacity behavior. Ordered browser acceptance proves a
client can create a waiting conversation at 390px without page overflow and an
operations manager can inspect the waiting queue and workload controls.
`npm run check` and `npm run release` passed on 2026-07-30.
