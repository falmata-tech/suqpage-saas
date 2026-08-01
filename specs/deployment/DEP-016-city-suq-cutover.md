---
id: DEP-016
title: Permanent City Suq pre-production cutover
status: done
related: [FE-020, BE-019, DEP-011, DEP-014, DEP-015]
owners: [deployment, operations, product, qa]
last_updated: 2026-08-01
change_level: L3
---

# DEP-016 - Permanent City Suq pre-production cutover

## Problem and outcome

The disposable demo account and public application are organized around daily
Expo occurrences and enterprise-heavy scale fixtures. Before launch they need a
clean cutover to permanent small-business discovery without preserving obsolete
demo occurrence data or carrying misleading public terminology.

## Scope and contracts

- Replace public/admin Expo and Bazaar routes, labels, tests, and navigation.
- Seed a curated cohort of small manufacturers, workshops, growers, processors,
  artisans, furniture makers, clothing makers, beauty makers, and home-based
  product brands across six industries and multiple Ethiopian catchments.
- Remove enterprise-scale, export-showcase, industrial-input, feed-supplier,
  and synthetic 350-showroom public discovery fixtures.
- Retain enough workflow-only records to exercise pagination, roles, support,
  inquiries, requests, subscriptions, and analytics without publishing hundreds
  of repetitive Suqs.
- Generate or retain one approved booth image for every discoverable business.
- Reset is destructive only for disposable local/test databases and suppresses
  credential output.
- Exactly ten businesses remain featured. Featured status never gates ordinary
  discovery.
- Each active industry has enough eligible businesses to exercise at least one
  qualifying three-business City Suq; the complete cohort spans multiple cities
  and regions.
- Public source, metadata, navigation, and rendered copy contain no active Expo,
  Bazaar, weekday-theme, or live-today product language.
- `/expo` and `/bazaar` issue compatibility redirects to `/discover`.

## Scenarios

```gherkin
Scenario: Disposable reset completes the cutover
  GIVEN any local demo database state
  WHEN the approved reset command runs
  THEN permanent industries and business memberships are deterministic
  AND discoverable fixtures represent only the approved small-business cohort
  AND every discoverable business has location, entitlement, and booth media

Scenario: Legacy bookmark is opened
  GIVEN a visitor has an old Expo or Bazaar URL
  WHEN the route is requested
  THEN it redirects to permanent discovery
  AND no daily-event claim appears
```

## Test plan

- `npm run reset`
- `npm run test:discovery`
- `npm run test:acceptance`
- `npm run test:discovery-visual`
- `npm run test:operations`
- `npm run check`
- `npm run release`

## Rollout and rollback

No production rollout is included. Rollback deploys the preceding application
and reruns its matching disposable fixture reset. Future production conversion
must preserve real data and requires a new L4 plan, backup, reconciliation,
rollback proof, and explicit approval.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Evidence

Evidence: implemented and verified on 2026-08-01:

- `env SUQPAGE_SUPPRESS_CREDENTIAL_OUTPUT=1 npm run reset` created 58 active
  small-business Suqs, 48 lightweight discovery fixtures, six industries, one
  discovery profile per business, and exactly ten featured profiles.
- `npm run check`, `npm run test:acceptance` (10/10),
  `npm run test:discovery-visual`, and `npm run test:operations` passed.
- `npm run release` passed the production build, output-trace privacy check,
  HTTP smoke tests, TypeScript, migrations, security, managed requests,
  revisions, backup/restore coverage, and production dependency audit with zero
  vulnerabilities.
- No production or data-preserving rollout was attempted.
