---
id: FE-042
title: Paginated category results and standard page workspaces
status: in_progress
related: [FE-030, FE-032, FE-040, FE-041, BE-033, DEP-030, FE-008, FE-043]
owners: [product, frontend, operations]
last_updated: 2026-09-14
change_level: L2
---

# FE-042 — Category results and the standard page workflow

## Current release evidence — 2026-09-14

The owner approved the visual design and deployment. Source `41e2fed` is published
as Netlify `6aa7fe5a106ca381ba08bba3`; hosted schema 43 and the public desktop/phone
workflows are verified. Full core/release, seven isolated authenticated/public
acceptance scenarios, 72 accessibility states, operations, PostgreSQL and container
gates pass. Earlier approval/full-gate-pending notes below describe intermediate
local milestones, not a new approval requirement. Remaining hosted email delivery
and authenticated production smoke are tracked in DEP-030 and
`docs/SUQPAGE-DEPLOYMENT-2026-09-14.md`; this evidence does not claim those passes.

## Problem and scope

The owner requests category results in the result panel, backend pagination,
complete retirement of custom-page requests, and an audit/fix of standard page
connections to owner, staff and admin dashboards. The newest instruction supersedes
managed request/design workflow availability. Historical records and media are
preserved; no destructive data purge, hosted write or deployment is authorized.
Existing scoped catalog, page draft, account, support, discovery and staff-assignment
contracts are reused. This is ready under BE-033; no new external provider is needed.

## Acceptance criteria

- D1: Selecting any category, including All categories, shows products/businesses
  in the result panel without requiring search text. The map stays mounted. Query,
  category and region/city compose; changing a filter or result type resets page.
- D2: Five results per page are selected by database COUNT/LIMIT/OFFSET with stable
  ordering, accurate total counts and bounded/normalized page numbers. All combines
  products then businesses into one paginated sequence; type tabs have scoped total
  counts. Previous/Next and page position sit above the result rows and are visible
  on desktop/phone entry without scrolling through products; no append/infinite scroll
  or client slicing as pagination authority. URLs support reload/back. Map geography
  remains independent of the selected result page.
- W1: Navigation, dashboard attention, account rows and owner/staff actions point
  to Products, Your page, Page reviews, Marketplace, Support and Account as permitted.
  No custom request, revision studio, design library/SDK or intake feature remains
  reachable. Old request APIs fail closed and old pages cannot perform mutations.
  Public account creation remains available and does not create service requests.
  Privacy and terms copy describes private account contacts, owner-controlled drafts,
  optional staff assistance and first-page review; it does not describe the retired
  design-import or custom-project service as available.
- W2: A new owner can maintain products/categories, save/preview their page and submit
  its exact saved version for first review. Admin has a paginated review queue,
  scoped preview, approve/request-changes actions and feedback. Approval checks
  current draft/catalog versions and activates/publishes the owner-submitted page.
  Public discovery still requires separately approved geography and listed products.
  Established owners retain direct publish/restore; assistance remains revocable.
- W3: Admin can inspect page status for every business, manage staff assignment and
  reach the same page editor only with owner consent. Team members see assigned
  businesses; no request assignment or custom design is needed for access. Tenant,
  owner publication, assignment and contact privacy boundaries remain enforced.
- A1: Desktop/390/320 responsive results and dashboard states; keyboard-labelled
  pagination/review controls; loading, empty, stale-version and denied-access states.

## Scenarios

```gherkin
Scenario: Browse category without typing
  GIVEN an eligible marketplace category
  WHEN the visitor selects it
  THEN the results panel displays its first database page and total counts
  AND Next changes the result rows while keeping the map visible
Scenario: Review the owner's exact first page
  GIVEN an owner saved a draft and products for a private business
  WHEN they submit it and an administrator approves the unchanged versions
  THEN that page becomes public and the decision is attributable
  BUT a later draft/catalog change requires a fresh submission
Scenario: Retired custom workflow cannot bypass the new page controls
  GIVEN an old request API or revision action address
  WHEN any actor attempts to read or mutate it
  THEN the retired feature is unavailable and no record is created or published
```

## Test plan and rollout

Ordered S2i/S2j steps in the transition checklist govern implementation. Focused
SQLite/PostgreSQL/domain tests cover pagination and BE-033 negative paths; browser
captures cover public category/results and owner/admin workflows using local fixture
accounts. No external notifications are sent. Explicit visual approval precedes
expensive full gates. Additive review storage is rollback-compatible; dormant legacy
records remain untouched. Audit evidence belongs in docs/SUQPAGE-APP-WIRING-AUDIT.md.
