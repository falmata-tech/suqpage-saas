---
id: BE-018
title: First-party customer support queue
status: in_progress
related: [FE-019, FE-026, BE-002, BE-015, BE-023, BE-024, BE-026, BE-030, DEP-015, DEP-026, ADR-0009, ADR-0012, ADR-0014]
owners: [backend, security, customer-support]
last_updated: 2026-08-15
change_level: L3
---

# BE-018 - First-party customer support queue

## Problem and outcome

Clients need free in-app support and MirtPage team members need a shared queue
without adopting a costly per-agent SaaS or operating a second large support
platform.

## Scope

### In scope

- Tenant-safe conversations and messages between authenticated clients and
  authorized MirtPage staff, plus token-scoped public visitor conversations in
  the same staff queue.
- Waiting, open, and closed states; claim, assignment, close, and reopen.
- Configurable per-agent open-conversation limits, transactional least-loaded
  assignment, and a visible waiting queue when every enabled agent is full.
- Paginated inboxes, bounded message history, unread state, and lightweight
  polling.
- Optional Telegram queue notifications containing no message body.
- Anonymous visitor categories for general help, sourcing assistance, business
  document review, facility/quality visit coordination, and shipment/loading
  observation.
- Validated visitor email and phone contact values for reconnecting outside the
  browser session when needed.
- One optional provider-neutral private image or PDF attachment on a support
  message, with participant-scoped reads and retained metadata.

### Non-goals

- Bots, voice/video, multiple attachments per message, SVG/Office/archive or
  executable uploads, SLA automation, unofficial WhatsApp Web automation, or
  automated verification decisions.
- Making Telegram or WhatsApp the source of truth for support history.

## Domain language and invariants

- A conversation belongs to exactly one authenticated business/client pair or
  one anonymous visitor session, never both.
- Clients may read and write only conversations for their own business.
- Team members may read waiting conversations and conversations assigned to
  themselves; operations managers may read and reassign all.
- No support agent exceeds their configured open-conversation limit.
- Every message has one authenticated staff/client sender or the matching
  anonymous visitor session and bounded plain text.
- An attachment belongs to exactly one support message. Its opaque storage key
  and private object are not authority for access; the parent conversation and
  current participant/token authorization are always checked first.
- Anonymous browser tokens are random, stored only as hashes server-side,
  delivered through secure HttpOnly same-site cookies, expire, and cannot read
  or write another visitor's conversation.
- Every new anonymous conversation has one normalized email and phone value.
  They are private support data visible only through the existing authorized
  staff conversation projection and are never sent in Telegram notifications.
- An assistance category records requested work only. It never records that
  verification, inspection, negotiation, or monitoring was completed.

## Contracts

- Migration 22 adds the original authenticated `support_conversations`, `support_messages`,
  `support_agent_settings`, `support_assignments`, and `support_events`, with
  indexes for queue status, assignment, tenant, and incremental message reads.
- Additive migration 33 gives conversations an enforced client-or-visitor
  participant mode, adds hashed expiring visitor ownership and assistance
  category fields, and gives messages an enforced authenticated-user-or-visitor
  sender identity with sender-scoped idempotency. Existing client support rows
  are retained as client conversations.
- Additive migration 34 adds nullable visitor email and phone columns for legacy
  compatibility while database triggers or constraints require both on every
  new visitor conversation. Application validation normalizes email to lower
  case and accepts a phone value containing 7–15 digits with an optional leading
  plus after common display separators are removed.
- Message text is 1–4000 characters; subjects are 1–120 characters.
- Anonymous creation and replies use IP-hash rate limits, idempotency, honeypot
  rejection, bounded bodies, and no account enumeration.
- A valid unexpired visitor token may close only its own conversation. Public
  close is idempotent, releases an active assignment, records a visitor-close
  event without an actor user ID, and never grants reopen or staff controls.
- Starting another public chat clears only the browser session cookie. The
  closed conversation and messages remain authoritative staff records, and the
  next submitted request creates a new isolated conversation and token.
- Additive migration 36 creates `support_attachments` with one attachment per
  message, an immutable opaque storage key, safe original name, exact admitted
  MIME type, byte size, and creation time. It retains all earlier support rows.
- Attachment admission accepts only decoded/sanitized JPEG, PNG, and WebP or a
  PDF with matching signature and terminator, all at most 5 MB. Storage succeeds
  before the message transaction; transaction failure removes the staged object.
  A duplicate idempotency key never creates or retains another object.
- Public attachment reads require the same valid unexpired HttpOnly token as the
  conversation. Authenticated reads require the existing tenant/staff
  `requireConversation` authorization. Missing and unauthorized reads return the
  same private no-store 404 before object storage is accessed.
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

Scenario: Anonymous visitor token is tampered with
  GIVEN an anonymous visitor conversation exists
  WHEN a different or malformed token requests its messages or posts a reply
  THEN the operation returns a generic not-found response
  AND no subject, message, contact value, assignment, or existence signal leaks

Scenario: Anonymous visitor contact is invalid
  GIVEN a public request omits email or phone or supplies an invalid value
  WHEN conversation creation is attempted
  THEN validation rejects the request before persistence
  AND no queue notification or support row is created

Scenario: Anonymous visitor ends a chat
  GIVEN a visitor owns an active token-scoped conversation with an assignment
  WHEN that visitor ends the chat
  THEN the conversation becomes closed
  AND the assignment is released
  AND another visitor token cannot close it

Scenario: Anonymous visitor starts a separate chat
  GIVEN the browser holds the token for a closed public conversation
  WHEN the visitor clears that support session and submits another valid request
  THEN the closed conversation remains unchanged
  AND a new isolated conversation and opaque token are created

Scenario: Cross-conversation attachment read is denied
  GIVEN a private support attachment belongs to one tenant or visitor conversation
  WHEN another tenant, another visitor token, or an unauthorized team member requests it
  THEN authorization fails before private object storage is read
  AND no filename, MIME type, object key, or existence signal is disclosed

Scenario: Attachment transaction fails
  GIVEN a valid file has been staged in private storage
  WHEN message or attachment persistence fails
  THEN the staged object is removed
  AND no partial support message or attachment row remains

Scenario: Anonymous chat is abused
  GIVEN one network source exceeds the bounded creation or reply rate
  WHEN another request is submitted
  THEN it is rejected without creating a message or conversation
  AND existing staff/client queue behavior remains available
```

## Quality impact

- Security and tenant isolation: authorization is enforced in the application
  service for every read and mutation.
- Privacy and data retention: support text, visitor contact values, and
  attachments remain private application data; notification adapters receive
  metadata only.
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
| Anonymous contact validation, token isolation, expiry, idempotency, and staff reply visibility | security/integration | `scripts/test-support.ts` |
| Private attachment admission, rollback cleanup, idempotency, and scoped reads | security/integration | `scripts/test-support.ts`, `scripts/test-media-storage.ts` |
| Client and staff mobile workflow | browser | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

Migrations 22, 33, 34, and 36 are additive with respect to retained support history. The first-party queue works without external
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
