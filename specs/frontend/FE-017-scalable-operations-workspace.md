---
id: FE-017
title: Scalable operations workspace
status: done
related: [FE-003, FE-008, FE-011, FE-012, FE-013, FE-020, BE-015, DEP-014]
owners: [product, frontend, operations]
last_updated: 2026-07-30
change_level: L2
---

# FE-017 - Scalable operations workspace

## Problem and outcome

Public discovery and the authenticated workspace currently load whole datasets
into browser filters, arbitrary 100-row queues, oversized cards, full edit forms,
or entity selects. Those patterns become slow and difficult to use as the demo
account grows.

The outcome is a predictable SaaS workspace where high-volume collections are
searched, filtered, counted, and paginated by the server. List pages show compact
rows with one clear next action; full forms edit one selected record.

## Scope

### In scope

- Server-paginated showroom discovery, business selection, requests, products,
  inquiries, deliveries, client accounts, staff accounts, and Expo profiles.
- Compact tables or rows with search, relevant status filters, result counts,
  empty states, and accessible previous/next navigation.
- Focused client-password and Expo-profile editing without bulk dropdowns or a
  complete edit form in every list row.
- Clear administration views for businesses, clients, staff, and Expo controls.
- Query-string state that is linkable, reload-safe, and resets invalid pages.

### Non-goals

- Bulk editing, spreadsheet import, arbitrary page-size controls, or client-side
  virtual scrolling.
- New staff permissions, publication authority, Expo eligibility rules, or
  product fields.
- Replacing private request detail, revision studio, or product edit forms.

## Domain language and invariants

- A **page** is one authorized, ordered subset plus total count and page count.
- A **focused editor** mutates one selected entity and never derives authority
  from list position or browser-supplied tenant identity.
- Public search includes active showrooms only. Authenticated pages preserve all
  existing tenant and role boundaries.
- Filtering or changing search returns to page one. An out-of-range page resolves
  to the final valid page without rendering an empty false state.

## Contracts

- Public showroom pages contain at most five result cards. Workspace pages
  contain at most 20 primary records.
- Search inputs are GET forms with bounded values and useful labels. Pagination
  links preserve applicable search, filter, sort, business, and anchor state.
- Business and staff selectors never render every database row. Selecting an
  entity happens through a paginated result row or a bounded server search.
- The administration landing page uses explicit Businesses, Clients, and Staff
  views. It does not query or render all three datasets for every request.
- Expo administration lists compact eligibility and assignment summaries.
  Editing the complete Expo profile occurs on a business-specific page.
- Product upkeep is a compact paginated list with stable media dimensions.
  Search runs on the server and keeps the current business context.
- Inquiry list queries include item summaries without one query per row.
  Delivery creation uses a bounded recent-inquiry choice and delivery history is
  paginated.
- Phone layouts keep filters, rows, pagination, and primary actions operable at
  320 and 390 CSS pixels with no horizontal document overflow.

## Scenarios

```gherkin
Scenario: Operator navigates a large request queue
  GIVEN more requests exist than one workspace page
  WHEN an operations manager searches or filters the queue
  THEN the server returns at most 20 authorized rows and an accurate total
  AND pagination preserves the active query
  AND opening a row shows the existing focused request workflow

Scenario: Administrator edits one Expo profile
  GIVEN more than 100 businesses have Expo profiles
  WHEN an administrator searches for a business and selects Edit profile
  THEN the list contains compact summary rows only
  AND the focused page contains one complete authorized profile form

Scenario: Visitor searches all showrooms
  GIVEN more than 100 active showrooms
  WHEN the visitor searches for a product or business
  THEN the database performs the filtering and returns at most five cards
  AND no complete catalog collection is serialized to the browser

Scenario: Tenant boundary survives pagination input
  GIVEN a client for tenant A
  WHEN the client supplies page, search, or business identifiers for tenant B
  THEN only tenant A records are returned
  AND tenant B data is not counted or disclosed
```

## Quality impact

- Security and tenant isolation: pagination predicates are applied with existing
  role and tenant predicates; counts use the same scope as rows.
- Privacy and data retention: queries and URLs exclude private message bodies,
  contacts, credentials, and media paths unless already required by the view.
- Accessibility and responsive behavior: semantic tables/lists, labeled GET
  forms, current-page text, focus visibility, touch targets, and narrow-screen
  overflow checks are required.
- Localization and merchant-entered values: long names and search values wrap or
  truncate without changing control dimensions.
- Performance and limits: pages are bounded, ordered deterministically, and
  backed by indexes; homepage and inquiry list N+1 queries are removed.
- Failure recovery and idempotency: pagination is read-only; existing mutation
  conflict and idempotency rules remain unchanged.

## Observability

Automated tests record row limits, totals, page boundaries, query plans, and
tenant-negative cases. Production logs must not record raw search values,
contacts, request copy, credentials, or media paths.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Page parsing, URL preservation, and bounds | unit | `scripts/test-pagination.ts` |
| Server pages, counts, N+1 removal, tenant scope | integration/security | `scripts/test-scalable-queries.ts` |
| Admin, requests, products, and Expo focused workflows | acceptance | `tests/acceptance/app.spec.ts` |
| Homepage search and five-card page | acceptance | `tests/acceptance/app.spec.ts` |
| 320/390 responsive controls and overflow | browser | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

The query and UI replacement is additive application code plus additive indexes.
Rollback deploys the prior application; the indexes may remain safely. No
business content or workflow state is rewritten.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Evidence

Evidence: implemented and verified on 2026-07-30:

- `lib/scalable-queries.ts`, `lib/request-sqlite.ts`, `lib/pagination.ts`, and
  schema migration 20 provide bounded, indexed pages with shared authorization
  predicates and deterministic ordering.
- Public discovery renders five database-filtered showrooms. Workspace business,
  client, staff, request, product, inquiry, delivery, and Expo collections
  render at most 20 records with URL-preserved search/filter state.
- Administration uses separate Businesses, Clients, and Staff views; client
  recovery and Expo editing load one focused record. Mobile product records
  replace the wide desktop table at 720px and below.
- `npm run check`, `npm run test:acceptance` (10/10), and `npm run release`
  passed. Acceptance covered 390px document overflow, focused Expo editing,
  paginated client selection, request assignment, offering search, inquiry
  search/status continuity, and delivery handoff.
