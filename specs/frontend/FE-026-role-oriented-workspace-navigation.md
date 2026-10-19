---
id: FE-026
title: Role-oriented workspace navigation
status: in_progress
related: [FE-065, BE-032, BE-033, FE-013, FE-017, FE-019, FE-025, FE-029, FE-031, FE-032, FE-033, FE-034, FE-035, FE-053, BE-018, BE-026, BE-028, BE-044, DEP-021, DEP-022, ADR-0013, FE-062, FE-056, FE-047, BE-054, FE-072, BE-060]
owners: [product, frontend, operations, design]
last_updated: 2026-10-17
change_level: L2
---

# FE-026 - Role-oriented workspace navigation

## S146 local candidate — one staff business authority

FE-072/BE-060 remove the administrator's per-business Staff assistance task
from Access and place one per-person Manage businesses grant in Staff. Granted
Support and Transport team members gain a bounded Businesses directory and the
usual business task workspace without changing their chat queue access. A revoke
removes that directory and denies old direct links. The local schema77 preview
uses this grant; the deployed Access/assignment workflow remains described below
until separately reviewed hosted rollout.

GIVEN an owner opens a nested Account settings task such as Change sign-in email
WHEN the pointer remains over a different workspace link such as Support
THEN only Account settings has the current-page state, and hover remains visibly
distinct from the selected destination in the desktop sidebar. The owner phone
layout retains its single Account tab as current; pointer position never changes
the current destination.

The owner separately approved the focused Account navigation-hover and FE-073
wrapped-email layouts after installed-Chrome desktop/phone captures; evidence is
`.local/s146-browser-review/nav-hover-1440.png`,
`owner-email-change-idle-390.png` and `receipt-email-only.json`. The hover browser
aggregate stopped on a test-harness phone-drawer expectation; its desktop
hover/current assertion passed, while phone evidence is a capture rather than a
new complete journey. Full gates and hosted rollout remain pending.

## S122 — finish verified workspace workflow gaps (implemented locally; review pending)

The wider dashboard audit remains separate from S121 chat recovery. Actual local
Chrome audits found missing product Cancel, lost filtered-list return, owner
Overview labels that lead to Account, Staff assistance returning to Overview
instead of Access, and an admin geography editor using legacy region/zone fields
with its form below an unchanged summary on phones. Preserve the working compact
owner hub, real statistics, business context, task sections and explicit page
editors; do not redesign them merely to make another visual change.

GIVEN a filtered Products list WHEN Add/Edit opens THEN carry only bounded search
and page origin. Save/Cancel and Products links return to that same authorized
business list, with readable success feedback. Owner breadcrumbs say Account;
staff breadcrumbs retain the selected business Overview. Navigation hints never
grant business authority and arbitrary return URLs are not admitted. Explicit
Cancel offers Keep editing/Discard for changed input and causes no write.
Expected validation/conflict/network errors stay with entered fields; unknown
server errors are redacted. Pending saves block duplicate commands.

GIVEN Staff assistance is opened from Access THEN return to Access for the same
business. GIVEN Location & visibility Edit THEN put the focused editor first,
with clear Save/Cancel and canonical Country/City controls under BE-054; do not
force invented region/zone values or hide the form below an unchanged summary.
Preserve private/tenant/role/version/consent boundaries and existing pin precision.

Ready: existing routes and authority, exact actual-browser defects, bounded
returns and failure/data invariants are known. FE-056/FE-053/FE-047 cover owner
parity and dirty exits; BE-032/BE-054 govern data. Master §§13/15/18/19/22 affected.
Use current components and primary Carbon/GOV.UK task/list/back guidance; no new
framework/provider/schema. Focused component/action/security and real Chrome
desktop/phone/Expo journeys precede visual approval and full/release gates.

S122 local verification: scripts/test-product-workspace-navigation.ts, scripts/test-admin-geography-ui.ts, scripts/test-business-team-ui.ts and actual Chrome web/Expo parent/return journeys pass. Current source, protected
readback and scoped harness failures are recorded in TRACEABILITY.md and
`.local/workspace-audit-s122/`. Both typechecks, localization and spec validation
pass. Visual approval, full/release/acceptance gates, commit and rollout remain
pending; this is not physical Android or complete-application certification.

## S121 — automatic queue operation (ready)

BE-018/FE-019 S121 supersede the S119 manual bulk recovery dependency. Staff
Waiting remains a distinct view but needs no recovery button or inbox visit to
route work. Remove the bulk action and implicit case-hold explanation. Keep
Workload & availability and deliberate per-case reassignment/claim, with bounded
origin/navigation intact. Current assignment and joining remain separate facts.

S121 local verification: actual Chrome desktop/phone admin and assigned staff
queues show the same automatically assigned older request in Active without a
bulk action. Queue→detail navigation preserves reference/origin; the scoped
agent sees their own matching queue. Six focused staff UI/action tests pass.
Evidence: `.local/queue-recovery-s121/native-agent/reconnect/review-receipt.json`
and `scripts/test-support-staff-ui.ts`. Review is
`.local/queue-recovery-s121/review.html`; explicit visual/full/release approval
remains pending, and prior S119 conversation-first layout evidence is preserved.

## S119 — deliberate staff queue tasks (ready)

Historical bulk recovery below is superseded by S121 automatic pickup; retain
its shallow task navigation, lifecycle and safe return requirements.

GIVEN support/transport staff navigate queue → conversation → history/return THEN
retain the canonical queue, status and bounded search origin. Transport has a
visible Waiting destination alongside Active, Chat history and Resolved. Show
assignment/join/end lifecycle from canonical data, not a generic waiting label on
closed records. Operations staff can explicitly Assign waiting chats from a
queue; ordinary staff and owners receive no management action. It is a POST task
with routed/remaining feedback, not a hidden side effect of viewing a screen.
BE-018 and FE-019 own security and detailed states; focused role/SSR/action tests
precede local phone/desktop review and release gates. Preserve the S118 record
workspace refinements and all pending earlier approvals.

## S118 — conventional record workspaces (ready)

The owner accepts S115's overall direction and asks for a more familiar staff
workspace. This is a bounded L1 refinement, not a new admin architecture. Research
the actual official Carbon UI-shell/table and Ant navigation examples; apply
their stable entity labels, list toolbar/rows, shallow context and task links in
Suqpage's current styling without introducing another UI framework. Master
§§5,13,19,22 are affected. BE-032/BE-033 authorization/version contracts unchanged.

Primary visual/pattern references: [Carbon UI shell](https://carbondesignsystem.com/components/UI-shell-left-panel/usage/),
[Carbon table anatomy and actions](https://carbondesignsystem.com/components/data-table/usage/)
and [Ant navigation](https://ant.design/docs/spec/navigation/). Their actual shell/
table examples inform shallow navigation, visible record actions and consistent
task context; Suqpage retains its own color, components and typography.

- GIVEN Businesses list, record and its local sections THEN entity/task labels
  are consistent (Businesses/Business and Location & visibility), list-scoped
  search/actions belong by the records, and each record leads to its workspace.
  Do not label the same business entity Accounts in one list and Businesses in
  another; private account actions retain their separate meaning.
- GIVEN a narrow-screen business section/direct link THEN the selected local
  destination is visible, semantically current, and reachable without guessing
  a clipped tab; reveal it within its own nav without page jump/focus theft.
- GIVEN overview product/location/access facts THEN relevant contextual task
  links open their existing permission-allowed destination, retaining the same
  business and bounded list origin. Avoid another generic menu/card dump.
- GIVEN staff Accounts/Workload THEN shallow consistent secondary navigation
  communicates the current task; a record's action opens the actual focused
  workload editor directly, not a second search list requiring rediscovery.
  Save/Cancel returns to its permitted originating list; queue staff cannot gain
  admin/staff-management authority through these presentation links.
- GIVEN a task screen THEN page title, active section, breadcrumb/return and
  primary action describe the same task, with saved records/read-first editing.
  No new management accordion, default editable record, duplicate hierarchy or
  invented metrics/features. Preserve support/transport and all earlier tasks.

Ready: known role/task routes, exact deficiencies and non-goals; no API/schema/
provider changes needed. Focused SSR/component/role/bounded-return tests and
actual desktop/phone local navigation/screens precede explicit visual approval,
full/release gates and any commit/rollout. Translate every changed user label
with native-language intent in all five catalogs; never claim native review from
catalog key checks alone.

### S118 focused local verification — approval pending

The 16 focused cases in `test-business-record-ui.ts`,
`test-business-settings-ui.ts`, `test-business-workspace-ui.ts`,
`test-support-workload-ui.ts` and `test-staff-navigation.ts` pass. They exercise
actual SSR/components/actions with controlled I/O: consistent record labels,
permission-filtered task links, local-nav reveal/resize cleanup, direct staff
editing and bounded Save/Cancel origins, including forged-role/origin denial.

`.local/admin-workspace-s118/verified/outcome.json` records 12 actual local
desktop/phone states and three journeys in English/Amharic. Contextual business
links, visible selected Access, filtered business return and Staff record →
focused editor → Cancel pass with zero runtime/console/read errors or application
writes; protected catalog/user/role/settings fingerprints are unchanged. The
first selector-only failure remains in the separate `actual/outcome.json`;
final source hashes and screenshots accompany the verified receipt. Carbon/Ant
references above informed these refinements; no new framework was introduced.
Browser evidence does not prove persistence writes, installed Android or native
linguistic review. Explicit visual approval, full/release gates, scoped commit
and deployment remain pending; this spec stays `in_progress`.

## S115 — finish business-centered task structure (ready)

Design references: [GOV.UK summary lists](https://design-system.service.gov.uk/components/summary-list/)
and [check answers](https://design-system.service.gov.uk/patterns/check-answers/)
support saved information with explicit change actions; [accordion guidance](https://design-system.service.gov.uk/components/accordion/)
warns that hidden content can be hard to discover. Applied here as task-specific
destinations in one business context, rather than another collapsible form stack.

The latest owner review rejects the remaining scattered business management and
accordion/omnibus editing. S109's menu work alone did not satisfy this outcome.
Master §§5,13,15,18–19,21–22 are affected. FE-056/FE-053 govern owner equivalents;
BE-032 governs preserving canonical fields during focused settings saves.

GIVEN an authorized staff/admin opens a business THEN retain one identity/context
and permission-filtered main destinations: Overview, Your page, Products, Business details,
Location & visibility, Access. Overview contains concise saved status/activity;
it does not repeat a second full task menu or display an editable status form.
Your page remains consent-gated. Staff/admin Products provides Categories as a contextual subtask. Access provides owner sign-in
and staff-assistance destinations. Sponsor work retains the selected business.
Active navigation and bounded filtered-list return remain correct on direct links.

GIVEN Business details THEN show one selected saved task (identity, live presentation
or sharing information). Its Edit opens only that task with Save/Cancel; owner
sign-in is a separate Access destination. Do not send three Edit links to the same
all-fields form. Legacy links remain bounded and current permissions unchanged.
GIVEN Product categories THEN show readable records, with explicit Add/Edit;
only the selected category/create task has a form. Preserve canonical tenant IDs,
category relationships, validation, failed input and existing delete restrictions.

GIVEN a management screen THEN no required business/account/public-contact work
is hidden in details/summary accordions. Read and Edit states are deliberate,
with section-specific headings and return paths. This does not remove public
filter popovers or legitimate visitor controls. Retain all features and social
links, support/transport, permission/consent/version checks and private data.

Definition of Ready: users/scope/non-goals and permission/data/localization effects
are explicit; use existing routes/contracts/styles with no provider/schema/dependency.
Focused SSR/component/action and isolated settings preservation tests, actual
desktop/320/390/five-language local navigation captures precede visual approval
and full/release gates. Primary design guidance: GOV.UK accordion/summary-list/
check-answers and Carbon navigation/forms; use real task destinations.

Local focused evidence: `test-business-record-ui.ts`, `test-business-workspace-ui.ts`,
`test-business-settings-ui.ts`, `test-admin-editor-actions.ts`,
`test-focused-edit-form.ts` and `test-staff-navigation.ts` exercise actual SSR,
components/actions and bounded navigation through controlled I/O ports. The
isolated `test-business-settings.ts` and `test-standard-page-postgres.ts --category-security`
prove canonical field preservation/current authority. Actual local UI receipts
and final approval status are recorded under S115 in TRACEABILITY; browser
read/Edit/Cancel evidence does not claim a persistence write or installed Android.

## S109 — business-centered workspaces and deliberate editing (ready)

The owner requests consistent task navigation across admin, staff and owners.
Group a business's details, showroom, products, marketplace location and access
under its existing authorized workspace. The global menu names platform-wide
work; it does not duplicate the same Businesses destination as Marketplace or
append a second full menu while viewing one business. Provide a stable business
identity/context and clear local sections; preserve scoped direct links and Back.

GIVEN a list or overview THEN records are readable summaries with one clear
Open/Manage/Edit action; existing data is not rendered as a wall of active forms.
WHEN Edit is explicitly selected THEN open the focused editor/pane with Save,
Cancel/Back, retained invalid input and clear saved/conflict/failure states.
Do not substitute a page full of accordions for focused navigation. Create staff
account opens a dedicated creation screen from a clear list-page button.
Creation/edit routes and chat reply composers are already deliberate tasks and
may show their forms. Saved values return to a readable overview without losing
the selected business, list search/page or role context. No hidden deletion or
privilege change is permitted by navigation alone.

GIVEN any role WHEN moving between permitted destinations THEN active navigation,
context title and return destinations agree; unauthorized/foreign IDs remain
unavailable. Admin business detail editing remains explicitly privileged; staff
page editing still needs owner consent; owner publication remains owner-only.
Mobile owner Profile remains the hub with deliberate focused edit destinations.
Owner web Business details and Account settings open saved summaries by default;
Edit from those summaries opens one editor with Cancel. Existing explicit profile
Edit links remain direct editor entries, with Save returning to Profile. Bounded
account return origins are account/profile only; failed saves retain entered
values and temporary-password recovery remains reachable.
FE-065/FE-053 S109 separately cover compact public exploration.

Ready L1 UI plus BE-032 S109 L2 version-fenced settings save: no new data collection/schema or UI
framework. Inventory read/default/edit routes before implementation, test actual
read/edit/save/cancel and isolation outcomes, then phone/desktop/five-language
visual review. Preserve unfinished S100–S108 and their approval/release gates.

## S108 — staff availability without chat limits

BE-018/FE-019 S108 supersede prior capacity-three and editable limit requirements.
New scoped agents receive matching chats without a numerical ceiling. Workload
navigation filters only receiving/paused staff and preserves bounded pagination.
Role and tenant permissions are unchanged; no cross-queue privilege follows from
availability. Use actual open counts rather than used/maximum indicators.

## S107 missing-context navigation defect

GIVEN a staff/admin account opens a product, catalog, settings, insights or retained
inquiry-history route without an authorized business context THEN return to its
fixed role workspace instead of rendering an empty document. Support/transport
agents return to their own queue; an administrator returns to administration.
Do not infer a default tenant, query an arbitrary business, grant capabilities or
accept a caller-controlled return URL. Existing foreign-tenant denial remains.
The general /dashboard business chooser still accepts an absent context. Verify
actual route rendering and the real context adapter with mocked redirect/DB ports
in `scripts/test-workspace-context.ts`, plus existing staff boundary regressions.

## S88 — main admin and two web-only agent functions

Ready L2. The owner's designated identity is platform_admin with no business-owner
association; preserve its Auth identity and existing business content. This account
change targets local and hosted environments independently with a protected
permission-field backup, drift checks and verified role/identity linkage.

GIVEN an authorized platform admin WHEN creating staff THEN offer only Support
agent and Transport agent, with email-code sign-in. Persist these functions using
the existing team_member profile plus support/transport queue scope, enabled with
the existing default capacity of three. No new role enum, migration or provider.
The admin may change the function/capacity/availability through the role controls;
incompatible open cases must be reassigned first. Keep legacy operator/general
staff records rather than deleting unrelated identities.

GIVEN a scoped queue agent THEN its main workspace is its permitted support queue;
it cannot inherit product/design/business-management authority through the legacy
team_member profile. Principal scope comes from current server-side records.
GIVEN an unauthorized caller or forged operator/all-scope creation THEN reject
before provider/account writes. Role choices and labels work at desktop/phone
widths and in all five languages. Browser evidence precedes visual/release gates.

New agent roles are fully readable in phone controls. Legacy operator/general
settings are labelled Queue, preserving their actual broader profile rather than
pretending a queue change downgrades their role. New scoped rows use Role. After
staff creation, the result is filtered to the created identity so it is visible
immediately; capacity/queue invariants remain server-enforced.

Tests: actor/role validation, atomic account/settings creation, provider failure,
duplicate identity, pagination/function display/filter, queue isolation and actual
admin-created staff sign-in. BE-018/BE-044/FE-053 cover chat and mobile exclusion.

## Problem and outcome

Administrator and staff work is currently spread across a long text-only menu,
an overloaded administration screen, and support-agent controls hidden inside
the support queue. Clients have a cleaner workspace, but repeated summary cards
and permanently visible actions make the next task less clear than it should be.
Each role needs a compact, responsive workspace whose navigation describes real
work, exposes attention counts, and provides a predictable way back.

## Scope

### In scope

- A role-oriented desktop sidebar and focus-contained mobile drawer with icons,
  active states, concise groups, and one consistent account/public-site area.
- Dedicated administrator destinations for overview, businesses, staff access,
  and support-agent capacity instead of query-string tabs inside one overloaded
  page. FE-032 supersedes the separate Clients directory with business-scoped
  Access and the Discovery directory with business-scoped Marketplace. FE-033
  adds the Daily Featured schedule as a distinct platform work area.
- A support-agent management screen with bounded staff rows, capacity and
  availability controls, workload summaries, and links into assigned work.
- Contextual dashboard actions and attention summaries that appear only when
  the actor can take the named action.
- Shared page headings, breadcrumbs, deterministic Back actions, empty states,
  pagination, and compact narrow-screen collection layouts.
- Client navigation and overview cleanup without expanding client authority.

### Non-goals

- New staff roles, bulk user import, live WebSocket support, arbitrary dashboard
  customization, or changes to publication, billing, inquiry, or tenant rules.

## Domain language and invariants

- A **workspace destination** is a stable role-authorized route, not a visual
  tab or an authorization boundary by itself.
- A **support agent** is an enabled staff member with an explicit concurrent
  assignment limit. Availability and capacity never grant broader data access.
- Attention counts are server-derived summaries and link to the same bounded,
  authorized queues that produced them.
- Navigation never exposes a route the current profile cannot open, and route
  authorization remains server-side even when a link is hidden.

## Contracts

- Administrator collections use stable routes under `/dashboard/admin/*` and
  retain linkable `q`, `status`, `page`, and other supported filter state.
- Existing administration query-string links redirect to their equivalent
  stable route without losing a supported search or page value.
- The desktop navigation fits one viewport at 768 CSS pixels or provides its own
  bounded scroll region. At 320 and 390 pixels, the drawer traps focus, closes
  on Escape or navigation, and leaves the page without horizontal overflow.
- Icons come from the admitted application icon library and every unfamiliar
  icon-only action has an accessible name and tooltip.
- Primary collections return no more than ten records per server request.
  Mobile rows emphasize identity, state, one next action, and an overflow menu
  or detail destination instead of reproducing a wide desktop table.
- Support-agent changes validate capacity bounds, preserve workload history,
  deny unauthorized actors, and do not abandon open conversations. An agent
  cannot be made unavailable in a way that silently deletes assignments.
- Client overview actions are state-aware. Preview appears only for a revision
  actually sent for review; offering upkeep appears only after publication.
- The client overview presents one primary action for the current showroom
  project. Supporting status rows may link to the same project but must not
  repeat a second promotional callout for the identical action.
- Staff business workspaces keep client destinations together. Global queues,
  support administration, design-library exploration, and platform overview do
  not compete with the active client workflow and are separated as leaving the
  current business context.
- Request, Design, Edit, and Preview expose one request-scoped workflow control
  under FE-031 rather than repeated unrelated action buttons.

## Scenarios

```gherkin
Scenario: Administrator follows an attention item
  GIVEN new client accounts need review
  WHEN an administrator activates the account attention item
  THEN the bounded Clients destination opens with the relevant state selected
  AND the administrator can return to Overview predictably

Scenario: Administrator manages support capacity
  GIVEN an enabled support agent has assigned and waiting workload
  WHEN an administrator changes the agent's availability or capacity
  THEN the validated setting is saved without changing the agent's staff role
  AND workload and assignment state remain visible

Scenario: Client opens the workspace on a narrow phone
  GIVEN a business-bound client session
  WHEN the dashboard renders at 320 CSS pixels
  THEN the primary task and relevant attention are visible without horizontal overflow
  AND the drawer exposes only client-authorized destinations

Scenario: Unauthorized route is entered directly
  GIVEN a team member without platform-administration authority
  WHEN the member requests a staff-access route directly
  THEN the server denies or redirects the request
  AND no staff account data is rendered
```

## Quality impact

- Security and tenant isolation: links follow, but never replace, existing role
  and tenant authorization.
- Privacy and data retention: summary rows expose only the minimum role-scoped
  identity and state needed for the task.
- Accessibility and responsive behavior: semantic landmarks, 44px touch
  targets, visible focus, drawer focus containment, labels, and no overflow.
- Localization and merchant-entered values: bounded user values wrap safely and
  navigation labels remain concise.
- Performance and limits: server pagination remains authoritative; overview
  aggregates avoid per-row follow-up queries.
- Failure recovery and idempotency: filter URLs are replayable and mutations
  return to the same focused record or page.

## Observability

Record route family, actor role, result status, collection size, and bounded
duration. Never record names, contact details, support messages, passwords, or
private showroom content in navigation telemetry.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Stable admin routes and legacy redirect | integration | `scripts/test-workspace-navigation.ts` |
| Role isolation and agent mutations | security/integration | `scripts/test-security.ts`, `scripts/test-support.ts` |
| Pagination and attention links | integration | `scripts/test-scalable-queries.ts`, `scripts/test-dashboard-attention.ts` |
| Desktop/mobile navigation and no overflow | browser | `tests/acceptance/app.spec.ts`, workspace capture script |
| One selected owner Account task and distinct hover preview | browser | `.local/s146-browser-review/nav-hover.mjs`, `receipt-nav-hover.json`, and `nav-hover-1440.png`; phone evidence in `owner-email-change-idle-390.png` |

## Rollout and rollback

The new routes are additive. Legacy administration query parameters redirect to
the equivalent destination during rollback compatibility. Rolling back the UI
does not revert staff, support, customer, or showroom data.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Evidence:

Implemented stable administrator routes for overview, businesses, clients,
staff, Daily Featured scheduling, and support-agent capacity; role-grouped icon
navigation; state-aware client actions; bounded administrator pages; five-row support-agent pages; and
compact mobile table rows. Legacy administration query routes retain supported
filters while redirecting to the stable destination.

On 2026-08-03, `npm run check`, `npm run release`, and the ordered production
browser suite passed. The browser suite completed 10/10 workflows, including
server-paginated staff/client search, direct authorization denial, client review,
publication, and 320/390-pixel drawer behavior. Reviewed captures at 1440, 390,
and 320 CSS pixels showed no horizontal overflow and a focus-contained mobile
drawer.

S88 focused local evidence: scripts/test-staff-boundaries.ts, managed wiring test,
scalable-query tests and real admin-created staff capture pass; role/queue controls
and three staff OTP rejections captured at phone widths in all five languages.
Root role/link conversion is verified locally and hosted, without deleting business
content or replacing the provider identity. New UI/API/APK deployment and full gates
remain pending. Private evidence is retained outside Git under main-admin-review
and chat-workflow-review; no secrets or customer messages are copied here.

## S94 — predictable admin and queue staff navigation

Ready L2, FE-019/FE-062/BE-018. Scope: web staff/admin sidebar, phone menu,
inbox/thread and staff/settings wayfinding. Preserve owner/native navigation,
current role/queue/tenant permissions and all pending release work; no schema.

GIVEN a manager WHEN navigating chats THEN Business support and Transport are
separate stable menu destinations; the matching item remains active on its
conversations. Management pages remain reachable without changing the whole menu
when a business workspace opens. Support/Transport agents see only their queue,
account security and existing permitted utilities; navigation grants no access.
GIVEN the staff screen WHEN opening workload/availability THEN show Staff as its
parent and keep Staff active, rather than returning to an unrelated inbox.
GIVEN an inbox with queue/status/search/page WHEN opening a conversation and
posting/claiming/assigning/closing/reopening/saving a handoff THEN retain the safe
origin fields; mutation redirects replace the current conversation entry instead
of adding another history step; Back and breadcrumb return to that exact permitted list. Direct
links/alerts use the actual case queue as fallback. Invalid/foreign case links
return safely to the permitted inbox. Never accept arbitrary return URLs.
Queue canonicalization is computed from the current principal before loading
the list; a browser replacement changes the address without exposing another
queue. Missing/foreign cases render only a generic unavailable state with an
inbox fallback link, then replace the address with that permitted inbox. This
avoids the reproducible Next development RSC redirect/profiler error while
retaining server-side case/queue authorization and safe no-JavaScript fallback.
GIVEN desktop/phone/all locales THEN menu labels are clear, active state singular,
icons match support/transport, no fixed five-column gaps or clipped labels, and
breadcrumbs/back controls have 44px targets with no horizontal overflow.

Tests: scripts/test-staff-navigation.ts (URL/query selection, safe state and
role cases); scripts/capture-staff-navigation.mjs (real admin/support/transport
lists/actions/return, alert/direct case context, desktop/phone and locale review).
Existing support/tenant/staff tests prove no new access. Visual approval precedes
full/release gates. Master §§13/19/22 reflect the verified local candidate.
Focused URL/type/catalog/spec, isolated PostgreSQL staff/support and actual local
browser checks pass (2026-10-08). The real adapters cover page-two origin through
claim, successful/failed reply, assignment, close/reopen and transport handoff;
staff settings/selected-business stability, actual-case/foreign-link scope and
71 desktop/phone/all-locale captures pass with zero browser exceptions after
replacing the unsafe development RSC redirect path. Evidence is protected under
.local/staff-navigation-review/actual/verified.json. Visual approval/full gates,
scoped commit and rollout remain pending; status remains in_progress.


## S104 standard workspace styling and owner navigation — in progress

FE-056 defines the owner destinations. Use grouped, rounded sidebar navigation
with clear selected state and consistent spacing/typography across owner/staff/
admin shells. Preserve role filtering, queue context, exact breadcrumbs and
assignment/return authority. Owner Dashboard is the overview entry; public
Login/Dashboard labels resolve through existing authentication. Phone owner
uses one shared bottom navigation, staff retains its focused work navigation.
Focused tests/captures precede visual approval; no permission or billing changes.
