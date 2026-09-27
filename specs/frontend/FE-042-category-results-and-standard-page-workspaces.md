---
id: FE-042
title: Paginated category results and standard page workspaces
status: in_progress
related: [FE-048, FE-030, FE-032, FE-040, FE-041, BE-033, DEP-030, FE-008, FE-043]
owners: [product, frontend, operations]
last_updated: 2026-09-23
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

FE-030 S41 supersedes singular category and result-tab language below: category
sets use OR, location/query use AND, and visible controls are individually
clearable. Existing bounded server pagination and public visibility remain.


- D1: Selecting any category, including All categories, shows products/businesses
  in the result panel without requiring search text. The map stays mounted. Query,
  category and region/city compose; changing a filter or result type resets page.
- D2: Five results per page are selected by database COUNT/LIMIT/OFFSET with stable
  ordering, accurate total counts and bounded/normalized page numbers. All combines
  products then businesses into one paginated sequence; type tabs have scoped total
  counts. Previous/Next and page position sit below the result rows and are visible
  on desktop/phone entry without scrolling through products; no append/infinite scroll
  or client slicing as pagination authority. URLs support reload/back. Map geography
  remains independent of the selected result page.
- D3: GIVEN a delayed search response WHEN the visitor types a newer query THEN
  the older response cannot replace the newer input; the final results match the
  latest query. Explicit one-character submission works, punctuation-only queries
  show no matches, and browser Back restores the prior query and results.
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

Current candidate FE-048/BE-041/DEP-038 supersedes staff approval requirements and
adds a simple Product/Service input. Historical evidence above remains scoped to
its release; the new candidate awaits focused verification and visual approval.

S20b: a query-only link opens All categories results. A valid selected city remains
selected when its result count becomes zero; changing text cannot broaden geography.

## Evidence: verified rollout — 2026-09-21

Source `be134a247c8ea54b18b882f9e2368058f7fbc0ee` is published as Netlify `6ab0d349f099639821fa0f9a` at https://suqpage.com.
Full check, release, operations, all nine isolated provider browser scenarios,
artifact privacy and production dependency audit pass. Production schema 47,
64 updated demo pages/256 offerings, all 64 public routes, live search at
1440/390/320, email-only entry, private-route denial, health and www redirects
are independently verified. Mapped focused tests and earlier desktop/phone
reviews remain applicable; the owner approved this release.

Earlier dated pending-approval/local-only notes are superseded by this rollout.
No real external email was sent and no authenticated hosted account was used
for testing; those admission checks remain separate from local provider evidence.
Demo contact destinations are examples, not verified delivery channels.
See docs/SUQPAGE-RELEASE-2026-09-21.md for backup, rollback and limitations.

## S21 ranked search refinement (BE-040 / DEP-037)

A nonempty query uses one result sequence: normal matches first, then admitted
approximate matches ordered by quality. Product and business cards retain their
existing actions and appearance; All results follows the server order across kinds.
There is no separate Possible matches section, label or new filter. Empty category
browsing retains its existing product/business grouping. Five-row pagination, type
counts, URL/Back and stable map remain. Owner explicitly requested completion and
publication of this refinement; no repeat approval pause for this exact scope.

## S22 — optional search drawer and All categories default

### Compact results refinement — 2026-09-23, local candidate

The phone screenshot shows controls crowding out the actual results. This L1
refinement keeps the S22 drawer, ranking and pagination contracts and supersedes
the previous control placement. Definition of Ready is satisfied: no data,
provider, eligibility or tenant behavior changes; accessible disclosure and
long translated labels are included in the focused browser checks.

- GIVEN an open drawer WHEN results load THEN search and a Filters toggle precede
  compact result-type tabs; category/place controls start collapsed. Repeated
  category titles, result counts and product section headings consume no space.
- GIVEN Filters WHEN opened by touch or keyboard THEN the existing category and
  place controls are available with an accurate expanded state. Collapsing them
  preserves their values; applied filters remain visible in a compact summary.
- GIVEN backend result pages WHEN Next/Previous is used THEN controls below the
  independently scrollable rows update the URL and reset row scroll. The controls
  remain reachable without scrolling through all rows; map state is retained.
- GIVEN 390×844 or 320×740 English phone viewports WHEN the drawer opens with
  filters collapsed THEN the first result begins within 230px of the drawer top
  and at least two complete result cards are visible without scrolling. At all
  five supported locales, controls and rows fit horizontally without clipping.
- GIVEN the drawer WHEN hidden, reopened or dismissed with Escape THEN existing
  focus restoration, inert hidden controls and mounted-map behavior remain.

Evidence: typecheck and `scripts/capture-search-drawer.mjs`, including desktop,
phone, pagination, disclosure, overflow and selected-language captures. Visual
approval precedes full release gates. Rollback is the prior drawer source; no
migration is needed. Master prompt §§5 and 10 cover the affected current layout.

Focused evidence (2026-09-23): typecheck, 153-spec validation and the updated
drawer browser checks pass at 1440×1000, 390×844 and 320×740. All five locale
layouts show at least two complete cards with the first card within 230px of the
drawer top; tabs/cards/paging fit inside the panel. English captures show four
complete cards at 390px and three at 320px. Category/Featured/About keyboard,
selection/reset and Axe checks pass at all three widths. A disabled pagination
label found by Axe was corrected to expose a disabled link role.

Captures: `.local/search-drawer-review/` (`results-390.png`, `results-320.png`,
`filters-320.png`, and locale-prefixed states). English 390/320 and Somali 320
images were visually inspected. Owner visual approval, full release gates,
scoped commit and deployment are pending; these are local-only checks.

This visual refinement supersedes the initial category chooser, fixed side column,
and phone filter sheet. L2 under BE-040/DEP-037; no database migration or provider.
Definition of Ready: scope and accessibility outcomes are specified below; public
eligibility, ranking, five-row paging, and tenant privacy remain unchanged.

- GIVEN a fresh Market visit WHEN it loads THEN all eligible categories appear on
  the full workspace map without a category prompt; the search drawer is closed.
- GIVEN the map WHEN Search & filters is opened THEN one panel slides in from the
  left over the unchanged map, containing search, optional category/place filters,
  result type tabs and backend-paginated results on desktop and phones.
- GIVEN an open drawer WHEN hidden or Escape is pressed THEN it slides out and
  returns focus to its opener; reopening retains query, filters, page and map view.
  Hidden controls are inert and cannot receive keyboard focus. Reduced motion
  disables sliding. No extra explanatory UI is introduced.
- GIVEN a query/category/place deep link WHEN loaded THEN its drawer opens with
  those results. Filter changes reset pagination and apply to map and results.
- GIVEN a result business WHEN selected THEN the drawer closes so its map preview
  is visible. The map remains mounted when opening, hiding, filtering or paging.

Focused evidence: default-all PostgreSQL assertions, typecheck, and desktop/390/320
browser captures for opening/hiding, state retention, filtering, pagination, map
identity, focus/Escape, reduced motion, and overflow. Explicit visual approval of
these local states precedes full/release/deployment gates per AGENTS.md step 8.

## S22–S24 approved release evidence

The owner approved the combined visuals and deployment on 2026-09-21. Full check,
release, operations, nine isolated provider browser scenarios and Netlify artifact
privacy checks pass. Earlier S22–S24 pending-review notes are superseded.
Deployment evidence and remaining hosted-email limits:
`docs/SUQPAGE-S22-S24-RELEASE-2026-09-21.md`.

S25 readiness: GIVEN a newly loaded market WHEN the search input becomes editable
THEN its input handlers are ready and the first typed query updates results.
The search field and submit/clear actions remain disabled until hydration;
capture-human-search.mjs types immediately without an arbitrary readiness delay.
