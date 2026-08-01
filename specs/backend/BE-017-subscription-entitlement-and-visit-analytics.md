---
id: BE-017
title: Manual subscription records and visit analytics
status: done
related: [FE-018, BE-001, BE-011, BE-015, BE-019, BE-020, DEP-015, ADR-0010, ADR-0011]
owners: [backend, security, operations]
last_updated: 2026-08-01
change_level: L2
---

# BE-017 - Manual subscription records and visit analytics

## Problem and outcome

SuqPage needs a monthly account lifecycle and useful showroom traffic evidence
before pricing is decided, while collecting useful traffic evidence without
invasive visitor data.

## Scope

### In scope

- One monthly subscription ledger per business with start, period end,
  four-day grace deadline, and manually confirmed renewal records. Amount is
  nullable in storage and is not collected by the current UI.
- Active, grace, and inactive account-record evaluation for client and
  operations visibility without automatic public enforcement.
- Operations payment recording and period renewal.
- Privacy-conscious showroom visit recording and Expo attribution.
- Tenant-scoped and platform aggregate traffic summaries.

### Non-goals

- Card storage, accounting, taxes, pricing policy, checkout, gateways, or
  automatic recurring debit.
- Exact person identification, cross-site tracking, ad attribution, or billing
  based on analytics.

## Domain language and invariants

- A subscription is active through `current_period_end`, in grace for the next
  four days, and inactive after `grace_ends_at` until renewed.
- Entitlement is computed from trusted server time; stale stored labels do not
  override dates.
- A renewal record is immutable evidence. A manually accepted renewal advances
  the period from the later of now or the previous period end.
- Subscription state is advisory. Active published showrooms remain public
  until an administrator explicitly suspends them.
- A visit contains an opaque daily visitor hash, business, source, optional Expo
  occurrence/hub, and timestamp. Raw IP addresses are never persisted.

## Contracts

- Migration 21 adds `business_subscriptions`, `subscription_payments`, and
  `showroom_visits` with tenant/time/source indexes.
- Public `/api/analytics/visit` accepts a bounded business handle and an
  allowlisted source (`direct`, `expo`, `directory`) and deduplicates one visitor
  per business/source/day.
- Expo showroom links carry `ref=expo`, occurrence, and hub identifiers.
- Only authorized operations staff can record that a renewal was received.
- Renewal amount is nullable and not collected by the current UI. The account
  lifecycle works without a configured price and the client is directed to
  contact SuqPage.

## Scenarios

```gherkin
Scenario: Grace expiry remains advisory
  GIVEN a business whose monthly period ended more than four days ago
  AND no confirmed renewal
  WHEN a visitor opens its active published showroom
  THEN the showroom remains public and discoverable
  AND an explicit administrator suspension is still enforced

Scenario: Expo visit is attributed without personal data
  GIVEN a visitor follows a booth link
  WHEN the showroom records its first visit for that day
  THEN the business receives one Expo-attributed unique visit
  AND no raw IP address or contact value is stored

Scenario: Client cannot read another tenant's analytics
  GIVEN clients for tenants A and B
  WHEN tenant A requests traffic information
  THEN only tenant A aggregates are returned
```

## Quality impact

- Security and tenant isolation: subscription mutation is operations-only;
  analytics reads derive tenant scope from the session.
- Privacy and data retention: opaque salted hashes and aggregate UI only;
  detailed events have a bounded retention target of ninety days.
- Accessibility and responsive behavior: owned by FE-018.
- Performance and limits: deduplicating unique index, bounded aggregates, and no
  event list in public responses.
- Failure recovery and idempotency: repeated visits or repeated manual renewal
  submissions do not duplicate records or advance a subscription twice.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Active/grace/inactive boundaries | unit/integration | `scripts/test-account-health.ts` |
| Payment renewal idempotency | integration | `scripts/test-account-health.ts` |
| Visit deduplication and Expo attribution | security/integration | `scripts/test-account-health.ts` |
| Tenant analytics denial | security | `scripts/test-security.ts`, `scripts/test-account-health.ts` |

## Rollout and rollback

Migration 21 is additive. Reset fixtures receive active subscriptions. Existing
databases are backfilled with an active pilot period for account reporting.
Application rollback may leave additive tables unused. Payment
checkout is not part of this feature.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Evidence: verified locally on 2026-08-01.

Migration 21, `lib/account-health.ts`, the same-origin visit endpoint, advisory
renewal records, and explicit active/suspended publication controls are implemented.
`scripts/test-account-health.ts` proves active/grace/inactive boundaries,
amount-free idempotent renewal, tenant denial, daily visit deduplication, and
Expo attribution without raw IP storage. `scripts/test-scale-fixtures.ts`
proves 398 subscription rows and 3,184 aggregate demo visits. Ordered browser
acceptance proves client insights, operations pagination, and explicit suspended
public redirect. Renewal-date public filters were removed from canonical
showroom and discovery queries. `npm run check`, 10/10 ordered browser
acceptance, and `npm run release` passed on 2026-08-01.
