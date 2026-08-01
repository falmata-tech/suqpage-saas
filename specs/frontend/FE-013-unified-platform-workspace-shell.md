---
id: FE-013
title: Unified platform identity and workspace shell
status: done
related: [FE-003, FE-012, FE-015, FE-017, FE-020, FE-021, FE_BASE]
owners: [product, frontend]
last_updated: 2026-08-01
change_level: L1
---

# FE-013 - Unified platform identity and workspace shell

## Problem and outcome

Public pages and authenticated workspaces currently use different marks,
colors, and navigation structures. Staff and clients need one recognizable
SuqPage identity and a calm role-aware shell that keeps complex operations
findable on desktop and mobile.

## Scope

### In scope

- One project-owned SuqPage mark and wordmark component for platform-owned
  public and authenticated surfaces.
- A neutral platform palette shared by the public marketplace and workspace
  shell while preserving tenant showroom identity inside showroom renderers.
- Purposeful public task surfaces for login and expression-of-interest intake
  using the homepage/About solid purple, white, charcoal, and cool-neutral
  language without promotional gradients or oversized rounded cards.
- Grouped, role-aware workspace navigation with one primary destination for
  each workflow and an accessible mobile drawer.
- Clear account, current-business, public-site, and sign-out context.

### Non-goals

- Changing authorization, tenant scope, routes, or business data.
- Restyling tenant-owned showroom brands or component-bank previews.
- Changing intake fields, login behavior, request detail, recipe studio,
  discovery controls, or other workflow behavior beyond presentation.

## Domain language and invariants

- **Platform identity:** the SuqPage mark, wordmark, colors, and navigation
  presentation on surfaces owned by SuqPage.
- **Workspace context:** the authenticated actor role and optional selected
  business shown independently from platform identity.
- Navigation visibility is a convenience layer only. Existing server-side
  authorization remains authoritative for every route and action.
- Tenant showroom logos and visual systems are never replaced by the platform
  mark inside the tenant's public showroom.

## Contracts

- The same accessible brand component appears on the homepage, Bazaar, public
  intake, login, legal pages, and authenticated workspace shell.
- Every public navigation link to `/request` is labeled **Sign up** on desktop,
  mobile, and footer navigation. Promotional calls to action may retain their
  purposeful **Build your Suq** or **Start your Suq** wording.
- Login and public intake use the same platform header, compact geometry,
  semantic palette, form controls, and focus treatment as the current homepage
  and About page. Their distinct tasks remain immediately clear.
- On desktop, each public task may pair one solid-purple context panel with one
  white form panel. On phones the panels stack in semantic reading order, all
  inputs remain visible, and no fixed navigation covers form controls.
- Activating the workspace brand returns to the actor's role-appropriate
  dashboard; public surfaces return home.
- Desktop navigation groups destinations by workspace, customer work, design
  tools, administration, and account utility as applicable to the actor.
- Duplicate destinations with competing names are removed. Selecting a tenant
  may expose a clear business-switch action without duplicating the dashboard
  overview.
- At viewports below 900 CSS pixels, a labeled menu button opens a modal
  navigation drawer with all role-permitted destinations, a visible close
  control, Escape handling, focus containment, focus restoration, and page
  scroll locking.
- The shell has no document-level horizontal overflow at 320 or 390 CSS pixels,
  supports long names, and provides at least 44 by 44 CSS pixel mobile targets.
- A route change closes the mobile drawer. Desktop navigation remains visible
  without requiring the menu button.

## Scenarios

```gherkin
Scenario: Visitor recognizes SuqPage across platform surfaces
  GIVEN a visitor moves between the homepage, Bazaar, intake, login, and legal pages
  WHEN each platform header or identity area renders
  THEN the same SuqPage mark and wordmark identify the service
  AND no tenant showroom identity is overwritten

Scenario: Visitor finds business signup consistently
  GIVEN a visitor opens the homepage, About page, or login page
  WHEN desktop, mobile, or footer public navigation is available
  THEN every `/request` navigation destination is labeled Sign up
  AND no navigation destination uses the ambiguous For businesses label

Scenario: Visitor uses a public platform task on a phone
  GIVEN a visitor opens login or the expression-of-interest form at 320 or 390 CSS pixels
  WHEN the page and form controls render
  THEN the SuqPage header and solid platform palette match the homepage and About page
  AND the task heading, fields, primary action, and recovery copy remain clear
  AND controls are at least 44 CSS pixels high with no horizontal overflow

Scenario: Authenticated actor navigates role-appropriate work
  GIVEN an authenticated client, assigned team member, operations manager, or administrator
  WHEN the workspace shell renders
  THEN only that role's intended navigation groups and destinations are shown
  AND existing server authorization still denies any unauthorized direct route

Scenario: Authenticated actor uses mobile navigation
  GIVEN an authenticated workspace at 320 or 390 CSS pixels
  WHEN the actor opens, traverses, and closes the menu
  THEN every permitted destination remains keyboard and touch reachable
  AND focus, scrolling, and document width remain controlled
```

## Quality impact

- Security and tenant isolation: no capability or route authorization changes;
  visibility continues to derive from the authenticated access profile.
- Privacy and data retention: only existing user name, role context, and selected
  business name render; no new persistence or telemetry is introduced.
- Accessibility and responsive behavior: landmarks, active-page indication,
  drawer semantics, Escape, focus containment/restoration, 44px targets, and
  320/390px overflow checks are required.
- Localization and merchant-entered values: long actor and business names wrap
  without resizing fixed controls; the controlled workspace remains
  English-first.
- Performance and limits: the vector mark and client navigation component add
  no external dependency or network request.
- Failure recovery and idempotency: closing the drawer or navigating leaves no
  persisted UI state and never changes application data.

## Observability

Existing authenticated route and browser-console evidence is sufficient. Do not
log names, tenant data, or navigation interactions for this change.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Shared platform mark on public and authenticated surfaces | acceptance | `tests/acceptance/app.spec.ts` |
| Login/intake desktop and phone composition, controls, focus, and overflow | visual/acceptance | `scripts/capture-platform-form-visuals.mjs`, `tests/acceptance/app.spec.ts` |
| Role-aware grouped navigation | focused/acceptance | `scripts/test-requests.ts`, `tests/acceptance/app.spec.ts` |
| Mobile drawer semantics, focus, targets, and overflow | acceptance/browser | `tests/acceptance/app.spec.ts` |
| Existing route authorization remains enforced | security/acceptance | `scripts/test-security.ts`, `tests/acceptance/app.spec.ts` |

## Rollout and rollback

This is a frontend-only replacement of platform identity and workspace-shell
presentation. It has no schema or data migration. Rollback restores the prior
component, CSS, and platform mark references in one deployment.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Evidence: verified on 2026-08-01. Homepage desktop/mobile/footer, About
desktop/mobile, and Login desktop/mobile navigation all label `/request` as
**Sign up**; no public navigation retains **For businesses**. The focused
production-browser identity test passed across all public surfaces, and
`npm run check` plus `npm run release` passed with production build, HTTP smoke,
scale, security, trace privacy, and zero-vulnerability gates. No route, signup
behavior, schema, or tenant data changed.

- `public/brand/suqpage-mark.svg` and `components/SuqPageBrand.tsx` provide one
  project-owned platform identity on the homepage, Bazaar, intake, login, legal,
  favicon, and authenticated workspace surfaces. Tenant showroom marks remain
  unchanged.
- `DashboardShell` derives grouped destinations from the authenticated role and
  optional business context. `WorkspaceNavigation` renders a quiet neutral
  desktop sidebar and a modal mobile drawer with active-route indication,
  Escape, focus containment/restoration, backdrop close, scroll locking, and
  route-change close behavior.
- `/login` and `/request` now use the current public header and one bounded
  solid-purple context/white-form composition. Their phone layouts stack in
  semantic order without changing login actions, intake fields, consent,
  no-upload behavior, or success handling.
- `scripts/capture-platform-form-visuals.mjs` passed five 1440px, 390px, and
  320px captures with exact document widths, solid `rgb(79, 49, 143)` context
  panels, no background gradients, 44-134px visible controls, and no browser
  errors.
- The production-browser suite proved the shared identity across six public
  surfaces, public-task 44-pixel targets and focus treatment, client mobile
  access to every expected destination, no horizontal overflow, and existing
  direct-route authorization. The suite passed 10/10.
- `npm run test:platform-forms-visual`, `npm run check`, `npm run
  test:acceptance`, and `npm run release` passed, including the production
  build, HTTP smoke, security/request tests, scale fixtures, and zero production
  dependency vulnerabilities. No schema, tenant data, or migration changed.
