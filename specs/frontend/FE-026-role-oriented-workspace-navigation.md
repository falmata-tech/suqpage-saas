---
id: FE-026
title: Role-oriented workspace navigation
status: in_progress
related: [BE-032, FE-013, FE-017, FE-019, FE-025, FE-029, FE-031, FE-032, FE-033, FE-034, FE-035, FE-053, BE-018, BE-026, BE-028, BE-044, DEP-021, DEP-022, ADR-0013, FE-062]
owners: [product, frontend, operations, design]
last_updated: 2026-10-08
change_level: L2
---

# FE-026 - Role-oriented workspace navigation

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
