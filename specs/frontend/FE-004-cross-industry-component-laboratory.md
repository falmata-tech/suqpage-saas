---
id: FE-004
title: Cross-industry showroom component laboratory
status: done
related: [BE-005, DEP-004, ADR-0005]
owners: [product, frontend, design]
last_updated: 2026-07-24
change_level: L2
---

# FE-004 — Cross-industry showroom component laboratory

## Problem and outcome

SuqPage staff need to understand and compare a broad reusable showroom bank
without experimenting on a client revision or live renderer. The outcome is an
authenticated visual laboratory that proves the bank can present products for
fashion, agriculture, food, coffee, honey, furniture, manufacturing, importing,
wholesale, artisan, beauty, technology, and other product businesses without
collapsing every showroom into one visual identity.

## Scope

### In scope

- A staff-only dashboard destination listing the current immutable bank release,
  coverage counts, token systems, and every component variant.
- Slot filters and compact component cards that render dynamic fixture content
  through the same reviewed section implementations registered by the bank.
- Responsive, scoped, keyboard-usable previews for headers, heroes, navigation,
  content, catalogs, trust, calls to action, and footers.
- Role-appropriate dashboard navigation for assigned team members, operations
  managers, and platform administrators.

### Non-goals

- Public use, client access, proposal import, client-content editing, screenshot
  generation, revision persistence, or composing/publishing a showroom.
- Claiming that laboratory fixture text, product shapes, or visual treatments
  are client facts or production catalog content.
- A generic drag-and-drop page builder.

## Domain language and invariants

- **Visual laboratory:** an internal contact sheet for reviewed bank components,
  not a tenant preview or publication surface.
- **Laboratory fixture:** clearly identified synthetic presentation data that
  exercises long names, availability, collections, imagery fallbacks, and
  inquiry controls without referencing a tenant.
- Staff see component IDs, versions, slots, descriptions, and token systems.
- Clients and anonymous visitors cannot render the laboratory.

## Contracts

- `/dashboard/design-bank` requires a non-temporary authenticated account with
  the explicit `design-bank:view` capability.
- The capability belongs to platform administrators, operations managers, and
  team members; clients are redirected to their dashboard and receive no bank
  metadata through this route.
- The visual laboratory does not request a tenant or call a database/content
  mutation. It renders one bounded local fixture.
- Every preview has a visible name, stable component ID, slot, and description.
- Slot filters use links or native controls with programmatic names and preserve
  a useful all-components state.
- Component roots and preview frames contain styling locally; they cannot alter
  dashboard, sibling preview, or global document styles.

## Scenarios

```gherkin
Scenario: Staff reviews the complete bank
  GIVEN an authenticated team member, operations manager, or administrator
  WHEN they open the design-bank laboratory
  THEN current release and coverage information is visible
  AND every registered component has one labeled preview

Scenario: Staff filters component families
  GIVEN the complete laboratory
  WHEN staff select a supported slot such as hero or catalog
  THEN only that component family is shown
  AND a visible control returns to the complete bank

Scenario: Client is denied the internal laboratory
  GIVEN an authenticated client
  WHEN they navigate directly to the design-bank route
  THEN they return to the role-appropriate dashboard
  AND no bank metadata or fixture is rendered

Scenario: Preview components remain isolated
  GIVEN several components rendered beside one another
  WHEN their visual variants use different spacing, color, and layout treatments
  THEN each remains inside its labeled preview frame
  AND dashboard navigation and sibling previews remain usable
```

## Quality impact

- Security and tenant isolation: explicit capability denial; no tenant or
  customer data is loaded.
- Privacy and data retention: the fixture contains no contact, request,
  attachment, customer, or credential data.
- Accessibility and responsive behavior: semantic headings/regions, labeled
  controls, visible focus, wrapping grids, and no horizontal page overflow.
- Localization and merchant-entered values: fixture values are never
  translated or persisted; section contracts do not mutate supplied values.
- Performance and limits: one bounded fixture and at most the 128-component
  domain limit; no network images are required.
- Failure recovery and idempotency: read-only deterministic rendering.

## Observability

No customer analytics or raw fixture logs are required. Build and browser
failures may identify the route, bank release, component ID, and safe error
category.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Staff/client capability boundary | security | `scripts/test-security.ts`, `scripts/test-showroom-bank.ts` |
| Every registry component receives a labeled preview | contract/render | `scripts/test-showroom-bank.ts` |
| Slot filtering and staff navigation are present | contract | `scripts/test-showroom-bank.ts` |
| Scoped styles and responsive component roots | static/build | `scripts/test-showroom-bank.ts`, `npm run build` |

## Rollout and rollback

The laboratory is an additive authenticated route and navigation item. It has no
schema or data migration and does not register a public renderer. Rollback
removes the route, navigation link, component assets, and bank release without
changing any tenant, revision, or live showroom.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Evidence: verified locally on 2026-07-24.

- `/dashboard/design-bank` renders the immutable bank release, coverage metrics,
  slot filters, token selector, safe interaction status, and one labeled preview
  for each of 42 registered components.
- Platform administrator, operations-manager, and team-member browser workflows
  open the laboratory. A client direct navigation is redirected to the client
  dashboard without bank metadata.
- Production browser acceptance filters to exactly eight hero variants, changes
  the preview token system, verifies accessible input names, and proves no
  document overflow at a 390-pixel viewport.
- Temporary local screenshots at 1280 and 390 pixels were visually reviewed for
  component containment, navigation, card hierarchy, typography, token
  application, and responsive layout. They contain synthetic fixture content
  only and were not committed as build artifacts.
- All seven existing production-browser scenarios pass, including public
  showrooms, inquiry, onboarding, every staff/client role, revision approval,
  publication, customer operations, and API security.
