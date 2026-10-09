---
id: BE-017
title: Showroom visit analytics and retired subscription records
status: in_progress
related: [FE-018, FE-032, FE-037, BE-001, BE-011, BE-015, BE-019, BE-020, DEP-015, ADR-0010, ADR-0011]
owners: [backend, security, operations]
last_updated: 2026-10-07
change_level: L3
---

# BE-017 — showroom analytics; business subscriptions retired

## Problem and scope

Transport arrangement is Suqpage's only revenue service. Business subscriptions,
plans, monthly renewal and payment recording are retired. Preserve useful visit
insights, product prices, publication authority and historical private records.
No gateway, checkout, billing fee or financial-history deletion is introduced.

## Contracts and scenarios

GIVEN a new business after migration 60 WHEN it is created THEN no subscription
record is generated. The forward migration drops only the business subscription
creation trigger/function; historical ledger and payment rows remain intact.
GIVEN an old payment submission THEN there is no current server action/domain
payment port capable of renewing or recording it. GIVEN an old renewal URL THEN
return to the authorized workspace; no financial UI is rendered.

GIVEN an active published business with expired historical ledger dates THEN it
remains discoverable; only explicit publication/business visibility governs it.
GIVEN a suspended business THEN its public showroom remains unavailable.

GIVEN the first daily showroom visit WHEN a bounded handle/source is submitted
THEN record a privacy-salted daily visitor hash, business/source/time and deduplicate
retries. Raw IP and visitor contact values are never stored. Daily Featured links
retain attribution. GIVEN owner A WHEN requesting tenant B's aggregates THEN deny;
staff queue roles also cannot read business analytics. Managers/admins retain
platform-authorized access. Retained SQL source `expo` is adapter-local history.

## Quality and readiness

No new external provider or native data boundary. Tenant analytics remain scoped;
aggregates and indexes bound work, while detailed visits retain their existing
retention policy. The newest owner instruction resolves commercial scope. Ready
before code under checklist S89; local migration and verification are separate from
backed hosted rollout, visual approval, full gates and the task-scoped commit.

## Test plan and evidence

`scripts/test-account-health.ts` passes migration idempotence, a real pre-upgrade
trigger rehearsal, historical ledger/payment preservation, new-shop plan absence,
publication/suspension, visit deduplication/attribution and tenant analytics denial.
`scripts/test-platform-naming.ts` verifies historical naming compatibility without
resuming the retired trigger. Fresh seed/runtime fixtures receive no ledger.
The scoped UI scan finds no active billing/renewal controls; browser admin/owner
verification and full release gates remain pending. No hosted migration claimed.

## Rollout and rollback

Local public schema is 60 after a protected affected-ledger/trigger backup and
readback, including a rolled-back new-shop rehearsal. Hosted schema remains 59
until DEP-015 rollout. Never delete historical financial rows. Returning the
retired trigger requires an independently reviewed rollback; a code rollback must
not silently resume subscriptions. Prior behavior is preserved in Git history.
