---
id: FE-019
title: Responsive client and staff support inbox
status: in_progress
related: [FE-024, FE-026, FE-036, BE-018, BE-024, DEP-015, DEP-026, ADR-0009, ADR-0012]
owners: [frontend, customer-support]
last_updated: 2026-08-15
change_level: L3
---

# FE-019 - Responsive client and staff support inbox

## Problem and outcome

Clients and public visitors need a simple place to ask MirtPage for help, and
team members need one clear queue that remains usable on phones and with many
conversations.

## Scope

### In scope

- Client conversation list, new-conversation form, message thread, and reopen.
- Staff waiting/open/closed tabs, paginated search, claim/reassign, reply, close,
  and reopen controls.
- Operations workload summary with per-agent enablement and assignment limits.
- Clear assignment, unread, queue, and capacity states.
- Responsive single-column thread on phones and compact queue/thread workspace
  on wider screens.
- A public live-chat launcher that creates a privacy-preserving anonymous visitor
  session without creating a MirtPage account.
- Required email and phone fields on the first anonymous message so authorized
  support staff can continue the conversation if the browser session disconnects.
- A visitor-visible **End chat** action that closes the authoritative support
  conversation, releases any active assignment, stops polling, and preserves
  the closed transcript without confusing it with the drawer's hide control.
- A closed transcript remains readable until the visitor chooses **Start another
  chat**. That action removes only the browser's opaque conversation token; it
  does not reopen, delete, or rewrite the retained staff conversation.
- A bounded visitor choice between general help, sourcing assistance, business
  document review, facility or quality visit coordination, and shipment/loading
  observation.
- Clear copy that direct showroom contact remains available and that optional
  MirtPage assistance is a separately requested service, not certification or a
  guarantee of a business, product, shipment, price, or outcome.
- One optional private attachment per message for visitors, clients, and staff:
  sanitized JPEG, PNG, or WebP images, or a verified PDF document up to 5 MB.
  Image messages show a bounded preview; PDFs show a filename, type, and size
  with an authorized download action.

### Non-goals

- Multiple attachments in one message, SVG/Office/archive/executable uploads,
  typing indicators, bot-generated advice, provider-hosted chat, or claims that
  MirtPage has completed an inspection before staff record it.

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

Scenario: Anonymous visitor asks MirtPage for assistance
  GIVEN a public visitor has not signed in
  WHEN they open chat, provide a valid email and phone number, choose an assistance category, and send a bounded message
  THEN the conversation enters the same staff waiting or assignment queue
  AND a secure anonymous browser session can poll and reply only to that conversation
  AND the authorized staff thread exposes the saved contact values for follow-up
  AND no MirtPage account or public business record is created

Scenario: Anonymous visitor omits reconnect details
  GIVEN a public visitor starts a new support conversation
  WHEN email or phone is missing or invalid
  THEN the form and server reject creation with a field-relevant error
  AND no support conversation or message is created

Scenario: Visitor continues browsing independently
  GIVEN the public chat explains optional MirtPage assistance and has an active conversation
  WHEN the visitor chooses End chat and confirms the action
  THEN the token-owned conversation closes idempotently
  AND its active staff assignment is released
  AND the closed transcript remains readable while replies and polling stop
  AND marketplace browsing and direct showroom inquiry remain available
  AND no inspection, trust, negotiation, or certification claim is implied

Scenario: Visitor starts a separate conversation after closing one
  GIVEN a visitor has ended a support conversation and can still read its transcript
  WHEN the visitor chooses Start another chat
  THEN the browser token for the closed conversation is removed
  AND the new-conversation contact form is shown
  AND the retained staff conversation and transcript are not deleted or reopened

Scenario: Participant shares an image or document
  GIVEN a visitor, client, or authorized staff participant can reply to an open conversation
  WHEN they send bounded message text with one valid image or PDF attachment
  THEN the message and attachment appear together in the thread
  AND images use a bounded responsive preview
  AND PDFs expose an authorized download without embedding private bytes in public markup

Scenario: Attachment cannot be admitted
  GIVEN a participant selects an unsupported, deceptive, or oversized file
  WHEN they send the message
  THEN no message or attachment row is committed
  AND any staged private object is removed
  AND the composer retains a clear retryable error
```

## Quality impact

- Security and tenant isolation: UI projections contain only authorized data.
- Privacy and data retention: contact values, support bodies, and attachments
  remain private support data and never appear in browser notifications or
  unauthenticated public markup.
- Accessibility and responsive behavior: labeled forms, status text, 44px mobile
  controls, focus-safe errors, and bounded message regions.
- Performance and limits: paginated lists and incremental five-second polling
  only while a thread is open and the browser document is visible; anonymous
  creation and replies are rate limited.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Client create/read/reply | browser | `tests/acceptance/app.spec.ts` |
| Staff queue/claim/reply/close | integration/browser | `scripts/test-support.ts`, `tests/acceptance/app.spec.ts` |
| Anonymous start with contact validation, poll/reply/end, and truthful assistance copy | security/browser | `scripts/test-support.ts`, focused public-shell browser evidence |
| Image/PDF admission, cleanup, participant-scoped reads, and responsive rendering | security/integration/browser | `scripts/test-support.ts`, `scripts/test-media-storage.ts`, focused support browser evidence |
| Phone fit and labels | browser | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

The authenticated inbox remains role-aware. The public drawer loads only when
opened, polls only while its active thread is visible, and can be hidden during
rollback without deleting conversations. Neither workflow depends on Telegram
configuration.

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
