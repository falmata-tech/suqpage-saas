---
id: FE-037
title: Current marketplace and Daily Featured language
status: done
related: [FE-021, FE-030, FE-033, FE-036, BE-017, BE-029, DEP-023, DEP-025]
owners: [product, frontend, operations]
last_updated: 2026-08-13
change_level: L2
---

# FE-037 - Current marketplace and Daily Featured language

## Problem and outcome

Retired Bazaar and Expo concepts remain in active route names, query keys,
referral links, component identifiers, and operator-facing language even though
the current product is a geographic Marketplace with a separate Daily Featured
Showrooms program. The result is confusing language and avoidable maintenance
risk immediately before launch.

MirtPage uses **Marketplace**, **City Showroom**, **Daily Featured**, and
**showroom** consistently in every current visitor, client, staff, URL-state,
and application contract. Historical database and immutable media identifiers
may remain inert when renaming them would weaken rollback or data integrity.

## Scope

- `featuredDay` is the current selected-day query key.
- `ref=featured` is the current Daily Featured showroom attribution link.
- Active TypeScript types, functions, component hooks, accessible names, and
  test contracts use Marketplace or Daily Featured language.
- Retired `/bazaar` and `/expo` addresses own no pages, redirects, data loading,
  navigation, or visible copy.
- A regression check rejects retired visitor-visible language and generated
  retired URLs.

## Non-goals

- Destructively renaming or dropping historical migration tables, foreign-key
  columns, stored analytics values, or immutable media object keys immediately
  before launch.
- Rewriting deprecated specifications or Git history.
- Changing discovery eligibility, schedules, sponsorship, analytics totals,
  tenant isolation, or showroom publication behavior.

## Contracts

- Current navigation and generated links never use Bazaar, Expo, `/bazaar`,
  `/expo`, `expoDay`, or `ref=expo`.
- Public and authenticated copy never presents Bazaar, Expo, or SuqPage as a
  current MirtPage concept.
- Retired public and administrator addresses receive the ordinary not-found
  response and are absent from generated links.
- Daily Featured attribution remains counted in the existing historical
  analytics bucket until a separately approved backup-backed data migration
  replaces its stored schema. The UI labels that bucket **Daily Featured**.
- Historical schema and storage identifiers are server-only, receive no new
  product behavior, and are documented as compatibility debt rather than
  current domain language.

## Scenarios

```gherkin
Scenario: Visitor follows a current Daily Featured booth
  GIVEN today's Daily Featured floor reveals a showroom
  WHEN the visitor opens its inspector
  THEN the showroom link contains ref=featured
  AND no current URL or visible label contains Expo or Bazaar

Scenario: Visitor follows a retired public bookmark
  GIVEN an old bookmark points to a removed event route
  WHEN MirtPage receives the request
  THEN the ordinary not-found response renders
  AND no retired page, redirect, or heading exists

Scenario: Operator reviews showroom insights
  GIVEN historical featured-program visits exist in retained storage
  WHEN the insights view renders
  THEN the count is labeled Daily Featured
  AND the historical storage value is not exposed to the operator
```

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Current query/referral vocabulary | integration/browser | `scripts/test-discovery.ts`, `tests/acceptance/app.spec.ts` |
| No retired visitor/operator language | contract | `scripts/test-platform-narrative.mjs` |
| Retired routes are absent | browser | `tests/acceptance/app.spec.ts` |
| Historical analytics label remains accurate | integration | `scripts/test-account-health.ts` |

## Rollout and rollback

Deploy as an application-only rename. Rollback restores the prior application;
retained schema rows and immutable media objects are unchanged. A later
destructive identifier cleanup requires its own L4 specification, backup,
restore proof, and explicit approval.

## Readiness checklist

- [x] Current and historical language boundaries are explicit
- [x] Security, data integrity, and rollback effects are explicit
- [x] URL compatibility is bounded and testable
- [x] Test paths cover current links, copy, redirects, and analytics labels

## Evidence

Evidence:

On 2026-08-13, focused narrative, homepage, discovery, featured-schedule,
account-health, scalable-query, type, specification, and PWA contract tests
passed. The final production HTTP smoke proves `/bazaar` and `/expo` return an
immediate 404 before the showroom catch-all or database runs. The complete
release gate and 10/10 production-browser acceptance workflows also passed.
Historical SQL values and immutable media keys remain server-only compatibility
data under the non-goals above.
