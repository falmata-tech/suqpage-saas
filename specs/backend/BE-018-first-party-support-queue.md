---
id: BE-018
title: First-party customer support queue
status: done
related: [FE-019, FE-026, BE-002, BE-015, BE-023, BE-026, DEP-015, ADR-0009]
owners: [backend, security, customer-support]
last_updated: 2026-07-30
change_level: L2
---

# BE-018 - First-party customer support queue

## Problem and outcome

Clients need free in-app support and MirtPage team members need a shared queue
without adopting a costly per-agent SaaS or operating a second large support
platform.

## Scope

### In scope

- Tenant-safe conversations and messages between authenticated clients and
  authorized MirtPage staff.
- Waiting, open, and closed states; claim, assignment, close, and reopen.
- Configurable per-agent open-conversation limits, transactional least-loaded
  assignment, and a visible waiting queue when every enabled agent is full.
- Paginated inboxes, bounded message history, unread state, and lightweight
  polling.
- Optional Telegram queue notifications containing no message body.

### Non-goals

- Anonymous website live chat, bots, voice/video, attachments, SLA automation,
  or unofficial WhatsApp Web automation.
- Making Telegram or WhatsApp the source of truth for support history.

## Domain language and invariants

- A conversation belongs to exactly one business and opening client.
- Clients may read and write only conversations for their own business.
- Team members may read waiting conversations and conversations assigned to
  themselves; operations managers may read and reassign all.
- No support agent exceeds their configured open-conversation limit.
- Every message has one authenticated sender and bounded plain text.

## Contracts

- Migration 22 adds `support_conversations`, `support_messages`,
  `support_agent_settings`, `support_assignments`, and `support_events`, with
  indexes for queue status, assignment, tenant, and incremental message reads.
- Message text is 1–4000 characters; subjects are 1–120 characters.
- Queue pages contain at most twenty conversations. Message reads contain at
  most one hundred recent messages and may request rows after a trusted integer
  ID for polling.
- New conversations use one transaction to choose the enabled agent with the
  lowest workload below their configured limit. If none is available, the
  conversation remains waiting.
- Claim and reassignment are transactional and reject an unavailable or
  capacity-full agent. Assignment release and close/reopen events are retained.
- Telegram notification is an optional adapter enabled only when both bot token
  and destination chat ID are configured. It sends conversation reference,
  business name, and dashboard link, never private message content.

## Scenarios

```gherkin
Scenario: Excess support work waits
  GIVEN a team member has reached their configured open-conversation limit
  AND another client opens a support conversation
  WHEN the team member attempts to claim it
  THEN the claim is rejected
  AND the conversation remains waiting for another team member

Scenario: Cross-tenant support read is denied
  GIVEN a client for tenant A and a conversation for tenant B
  WHEN tenant A requests the conversation or posts a message
  THEN the operation is denied
  AND no tenant B subject or message is returned

Scenario: Telegram is unavailable
  GIVEN Telegram notification settings are absent or the request fails
  WHEN a new support conversation enters the queue
  THEN the in-app conversation remains saved and usable
  AND the adapter failure does not expose message text
```

## Quality impact

- Security and tenant isolation: authorization is enforced in the application
  service for every read and mutation.
- Privacy and data retention: support text remains private application data;
  notification adapters receive metadata only.
- Accessibility and responsive behavior: owned by FE-019.
- Performance and limits: indexed paginated inbox, bounded history, and
  incremental polling; no unbounded websocket state in the SQLite pilot.
- Failure recovery and idempotency: message post supports an idempotency key;
  notification failure cannot roll back the saved conversation.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Tenant and role authorization | security/integration | `scripts/test-support.ts` |
| Least-loaded assignment, configured capacity, and claim transaction | integration | `scripts/test-support.ts` |
| Message bounds, polling, close/reopen | integration | `scripts/test-support.ts` |
| Client and staff mobile workflow | browser | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

Migration 22 is additive. The first-party queue works without external
configuration. Telegram alerts are disabled by default. Application rollback
can leave the tables unused without deleting support history.

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

Migration 22, `lib/support.ts`, server actions, and the optional metadata-only
Telegram adapter are implemented. `scripts/test-support.ts` proves tenant
denial, message idempotency, least-loaded assignment, per-agent limits, waiting
capacity, claim, close/release, reopen, and reassignment with Telegram absent.
Reset fixtures provide 30 conversations, ten waiting, twelve open, eight
closed, and four enabled agents at three open conversations each. Ordered
browser acceptance proves the client mobile waiting flow and operations queue
and workload controls. `npm run check` and `npm run release` passed on
2026-07-30.
