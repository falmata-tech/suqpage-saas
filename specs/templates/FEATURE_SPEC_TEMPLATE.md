---
id: XX-NNN
title: Concise outcome title
status: draft
related: []
owners: []
last_updated: YYYY-MM-DD
change_level: L1
---

# XX-NNN — Concise outcome title

## Problem and outcome

Who has which problem, why it matters, and the measurable outcome.

## Scope

### In scope

- Observable capability.

### Non-goals

- Explicitly excluded behavior.

## Domain language and invariants

- Define entities/value concepts and rules using MirtPage terminology.

## Contracts

Document props, API request/response/status, application ports, events, schema,
limits, authorization, and compatibility only where this layer owns them.

## Scenarios

```gherkin
Scenario: Primary success
  GIVEN a defined starting state
  WHEN an actor performs one action
  THEN an observable result occurs

Scenario: Safe failure
  GIVEN an invalid or unauthorized starting state
  WHEN the action is attempted
  THEN it is rejected safely
  AND protected state remains unchanged
```

## Quality impact

- Security and tenant isolation:
- Privacy and data retention:
- Accessibility and responsive behavior:
- Localization and merchant-entered values:
- Performance and limits:
- Failure recovery and idempotency:

## Observability

Signals, safe log fields, metrics/alerts, and prohibited sensitive fields.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Primary success | acceptance | `tests/...` |
| Invariant/failure | integration | `scripts/...` |

## Rollout and rollback

Feature/data migration, compatibility sequence, operator verification, and exact
rollback boundary. Write `Not applicable` only with a reason.

## Readiness checklist

- [ ] Scope and non-goals agreed
- [ ] Related specs linked reciprocally
- [ ] Contracts and invariants explicit
- [ ] Positive and negative scenarios present
- [ ] Quality impacts evaluated
- [ ] Test plan maps every acceptance criterion
- [ ] Rollout/rollback decided

## Completion evidence

Filled only when `status: done`: commands, test results, screenshots/manual checks,
release/version, and known limitations.
