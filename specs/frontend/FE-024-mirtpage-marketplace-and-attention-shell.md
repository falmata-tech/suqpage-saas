---
id: FE-024
title: MirtPage marketplace and attention shell
status: in_progress
related: [FE-013, FE-017, FE-019, FE-021, FE-023, FE-025, FE-027, FE-028, FE-029, FE-030, FE-033, FE-036, BE-023, DEP-017, DEP-019, DEP-020, DEP-021]
owners: [product, frontend, design, operations]
last_updated: 2026-08-09
change_level: L3
---

# FE-024 - MirtPage marketplace and attention shell

## Problem and outcome

The public product still presents retired platform and marketplace-destination
language, its discovery controls compete visually, business previews blend into the map or floor, and
operations users must visit several queues to discover new work. MirtPage needs
one coherent Made-in-Ethiopia identity, an app-like mobile-first marketplace,
and an immediately actionable dashboard summary.

## Scope

### In scope

- MirtPage identity on every active platform-owned public and dashboard surface.
- **Showroom** as the public destination term; existing `/@handle` routes remain.
- Inclusive copy for makers, growers, workshops, processors, and growing
  factories serving consumer and B2B buyers.
- Reviewed production-scale metadata retained for administration and internal
  projection, without exposing a public scale filter or hidden scale URL state.
- Clear hierarchy between one icon-led industry selection, the map command area,
  map summary, map/list mode, integrated sponsored showrooms, and the seven-day
  weekly Daily Featured.
- A non-modal, focus-safe floating showroom inspector with a visually dominant
  **Open showroom** action on maps and floors while the active map or venue
  remains visible.
- Role-scoped dashboard attention cards for actionable requests, accounts,
  inquiries, and support messages.
- A clearly disclosed **Sponsored showrooms** section whose paid placements are
  visually prominent, ordered by reviewed priority, and independent from Daily Featured
  eligibility or editorial endorsement.
- Seven stable industry groups, one assigned to each Daily Featured weekday, with
  Agriculture & Primary Produce on Sunday.
- Administrator controls for paid sponsorship without changing showroom
  publication authority. Retained Sunday-selection records are legacy data and
  no longer affect the public marketplace.
- Eight additional authored growing-factory demonstrations, each with a brief,
  identity, booth, hero, four offerings, and desktop/mobile review evidence.

### Non-goals

- Renaming stable `/@handle` routes, database tables, compatibility types, or
  historical Git records merely to remove an internal legacy identifier.
- Importers, general resellers, giant enterprises that do not need managed
  discovery, checkout, automatic company-size inference, or financial claims.
- Browser polling, push notifications, or a new external analytics provider.

## Domain language and invariants

- **MirtPage** is the platform; a **showroom** is one business's permanent public
  `/@handle` destination and is not conflated with the shared marketplace.
- **Production scale** is reviewed administrative metadata: `workshop` or
  `growing_factory`. It does not represent revenue, staffing, legal form, or
  eligibility for credit, and it is not a public marketplace filter.
- Industry and live search preserve map/list, pagination, and Daily Featured-date state.
  Public homepage and discovery routes ignore a supplied scale query so results
  cannot be narrowed by an invisible control.
- A platform attention count includes only records that currently require the
  signed-in actor's role to act; it is not a cumulative metric.
- Sponsorship is paid placement and must be labeled as sponsored. It does not
  imply endorsement, certification, or Sunday selection.
- Sponsorship does not alter Daily Featured eligibility or booth order.

## Scenarios

```gherkin
Scenario: Visitor explores Made-in-Ethiopia showrooms
  GIVEN active published workshops and growing factories
  WHEN a visitor chooses an industry and searches by product, business, or place
  THEN featured, map, city, and paginated list results use the same public query
  AND every destination is labeled as a showroom

Scenario: Marketplace opens with one compact command hierarchy
  GIVEN a visitor opens the public marketplace
  WHEN the industry cards and map render
  THEN no production-scale filter or separate gray search strip is shown
  AND live search, location jump, map/list mode, and map controls occupy one teal map header
  AND phone layouts do not repeat the marketplace task heading above the industry rail
  AND the map begins within the first mobile and desktop viewport

Scenario: Visitor opens a business from a dense visual floor
  GIVEN a map, city floor, or Daily Featured booth is visible
  WHEN the visitor activates one business
  THEN a distinct floating inspector identifies the business and location without obscuring the whole screen
  AND the map or venue remains visible and is not dimmed or made inert
  AND Open showroom is the visually dominant action
  AND close, Escape, focus, and mobile layout remain usable

Scenario: Administrator opens the dashboard
  GIVEN new accounts, actionable showroom requests, unread support, or new inquiries
  WHEN an authorized administrator opens the platform workspace
  THEN each non-zero attention count links to its focused queue
  AND no tenant-private detail is exposed in the aggregate card

Scenario: Client opens the dashboard
  GIVEN unread support or new customer inquiries for that client's business
  WHEN the client opens the workspace
  THEN only that tenant's attention counts appear
  AND platform-wide account and request counts remain hidden

Scenario: Visitor sees paid placement
  GIVEN five eligible businesses have been manually selected as global sponsors
  WHEN the marketplace loads
  THEN the Daily Featured workspace contains a clearly labeled Sponsors rail independent of the selected industry, date, search, and place
  AND its cards expose useful identity and location cues with a clear showroom action
  AND no horizontal scrolling is required to reach a paid placement
  AND the responsive card grid remains usable beside or above the Daily Featured floor

Scenario: Administrator manages marketplace programs
  GIVEN an authorized platform administrator opens a discovery profile
  WHEN sponsorship is changed
  THEN paid placement persists independently from industry assignment and Daily Featured eligibility
  AND unauthorized staff cannot change it
```

## Quality impact

- Security and tenant isolation: aggregate queries use trusted session scope and
  return counts only.
- Privacy and data retention: no new personal data or event retention.
- Accessibility and responsive behavior: 44px controls, semantic dialogs,
  visible focus, no 320/390px overflow, and reduced-motion compatibility.
- Localization and merchant-entered values: business text remains bounded and
  escaped; the identity is English-first for this release.
- Performance and limits: counts use aggregate SQL; discovery remains bounded
  and list pagination stays at five rows.
- Failure recovery and idempotency: filters are read-only URL state; additive
  profile metadata defaults existing records safely.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Identity, controls, floating preview inspector, and mobile hierarchy | browser | `tests/acceptance/app.spec.ts`, `scripts/capture-discovery-visuals.mjs` |
| Internal production-scale projection and public-filter omission | integration/browser | `scripts/test-discovery.ts`, `scripts/test-scalable-queries.ts`, `tests/acceptance/app.spec.ts` |
| Role-scoped attention cards | integration/security | `scripts/test-support.ts`, `scripts/test-security.ts` |
| Active-copy legacy-name denial | contract | `scripts/test-platform-identity.mjs` |
| Sponsorship controls and Daily Featured projection | integration/security | `scripts/test-discovery.ts`, `tests/acceptance/app.spec.ts` |
| Daily Featured, city floor, floating inspector, and sponsored visual hierarchy | browser | `scripts/capture-discovery-visuals.mjs` |

## Rollout and rollback

DEP-020 applies one additive profile migration and rebuilds disposable fixture
data. Rollback may leave the defaulted scale column and index in place, restore
the prior UI, and continue serving existing `/@handle` routes.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Verification evidence

Prior evidence: the MirtPage identity baseline completed locally on 2026-08-02. `npm run check`, the ordered 10/10 browser
acceptance suite, and `npm run release` passed. Browser captures in
`/tmp/mirtpage-discovery-visuals`, `/tmp/mirtpage-dashboard-attention`, and
`/tmp/mirtpage-factory-final` cover the marketplace, centered preview, Sunday
floor, role-scoped dashboard summary, and all eight added factories at desktop
and phone widths with no recorded overflow or console failures.

The sponsored-placement and rotating Sunday-program extension completed locally
on 2026-08-02. Migration 26, independent admin persistence, six-week rotation
and seventh-week loop, future-lineup redaction, and at least five sponsored plus
five Sunday fixtures per industry passed `scripts/test-discovery.ts` and
`scripts/test-scale-fixtures.ts`. The ordered 10/10 production-browser suite,
`npm run check`, and `npm run release` passed. Replacement desktop, 390px, and
320px captures in `/tmp/mirtpage-sponsored-sunday` cover the paid rail, full
industry schedule, weekday and Sunday floors, city marketplace, and centered
preview with no recorded overflow or browser errors.
