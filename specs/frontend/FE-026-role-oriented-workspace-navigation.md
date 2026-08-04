---
id: FE-026
title: Role-oriented workspace navigation
status: done
related: [FE-013, FE-017, FE-019, FE-025, FE-029, BE-018, BE-026, DEP-021, DEP-022, ADR-0013]
owners: [product, frontend, operations, design]
last_updated: 2026-08-03
change_level: L2
---

# FE-026 - Role-oriented workspace navigation

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
- Dedicated administrator destinations for overview, businesses, clients,
  staff access, and support-agent capacity instead of query-string tabs inside
  one overloaded page.
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
staff, and support-agent capacity; role-grouped icon navigation; state-aware
client actions; six-row administrator pages; five-row support-agent pages; and
compact mobile table rows. Legacy administration query routes retain supported
filters while redirecting to the stable destination.

On 2026-08-03, `npm run check`, `npm run release`, and the ordered production
browser suite passed. The browser suite completed 10/10 workflows, including
server-paginated staff/client search, direct authorization denial, client review,
publication, and 320/390-pixel drawer behavior. Reviewed captures at 1440, 390,
and 320 CSS pixels showed no horizontal overflow and a focus-contained mobile
drawer.
