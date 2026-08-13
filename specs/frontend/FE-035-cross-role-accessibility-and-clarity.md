---
id: FE-035
title: Cross-role accessibility and interface clarity
status: done
related: [FE-005, FE-013, FE-017, FE-025, FE-026, FE-031, FE-032, FE-034, FE-036, FE_BASE, DEP-002]
owners: [product, frontend, design, operations]
last_updated: 2026-08-11
change_level: L2
---

# FE-035 - Cross-role accessibility and interface clarity

## Problem and outcome

Individual MirtPage workflows have responsive and keyboard checks, but the
release candidate needs one cross-role admission that treats accessibility,
language, navigation clarity, and visual hierarchy as functional quality. A
screen is not launch-ready merely because its route loads and its mutation
succeeds.

The outcome is a repeatable browser audit over public, showroom,
administrator, operations, and client routes at desktop and phone widths, plus
manual review of task hierarchy and language that automated WCAG rules cannot
judge.

## Scope

- WCAG 2 A/AA, 2.1 A/AA, and 2.2 AA automated browser checks over representative
  routes for every role and the public application.
- Desktop and phone reflow, landmarks, headings, names, labels, contrast,
  document language and title, focus semantics, reduced motion, and overflow.
- Interactive states including mobile navigation, discovery filters and
  showroom previews, workspace drawers, product details, and inquiry controls.
- Human review for duplicate destinations, backend-shaped labels, unclear
  calls to action, exposed fixture language, misleading demo facts, and visual
  hierarchy that obscures the primary task.
- An audit record that identifies fixes, evidence, remaining external limits,
  and exact local evidence locations.

## Non-goals

- Claiming conformance from automation alone, replacing assistive-technology
  testing, redesigning tenant-authored showroom identities into one platform
  theme, or changing authorization and business rules solely for visual
  uniformity.

## Contracts

- Every audited page has a useful title, one primary content landmark, a clear
  top-level heading, no duplicate element IDs, and no horizontal page overflow
  at 390 or 1440 CSS pixels.
- Controls expose programmatic names and states. Form fields have persistent
  labels or equivalent accessible names; errors are understandable without
  relying on color alone.
- Text and meaningful interface graphics meet admitted AA contrast. Keyboard
  focus remains visible, dialogs and drawers retain a reachable close path, and
  reduced-motion preference suppresses nonessential motion.
- Phone navigation and primary commands remain reachable without obscuring
  page content. Repeated or legacy destinations may remain as compatibility
  redirects but do not appear as competing visible navigation choices.
- Public fixture content may be fictional internally, but customer-facing
  screens do not expose seed, provisional-copy, or test-workflow language and
  do not invent verification, capacity, certification, or transaction claims.
- Automated results are written as structured evidence with route, role,
  viewport, rule, impact, selector, and help URL. A release gate fails on any
  detected WCAG violation, route error, browser error, missing primary page
  structure, or horizontal overflow.

## Scenarios

```gherkin
Scenario: Keyboard and screen-reader user opens a public workflow
  GIVEN a public page or hosted showroom is available
  WHEN the page is inspected at desktop and phone width
  THEN its landmarks, heading, controls, states, and error guidance are exposed
  AND the primary task remains identifiable without relying on color or motion

Scenario: Authenticated user changes role-specific work
  GIVEN an administrator, team member, or client opens an authorized workspace
  WHEN they move through navigation, lists, forms, drawers, and detail pages
  THEN visible destinations match their task vocabulary
  AND the interface does not expose duplicate or backend-shaped navigation
  AND keyboard focus can enter and leave every temporary surface

Scenario: Automated scan finds a violation
  GIVEN an audited route renders successfully
  WHEN the WCAG browser gate detects a violation or structural failure
  THEN evidence identifies the route, viewport, rule, and affected selector
  AND the release gate remains failed until the defect or accepted exception is documented

Scenario: Visitor opens a fictional demonstration showroom
  GIVEN its internal project record identifies it as demonstration data
  WHEN public content is rendered
  THEN the showroom reads as a coherent neutral presentation
  AND internal fixture or provisional-development language is not shown
```

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Cross-role WCAG and structural browser scan | browser/accessibility | `scripts/test-accessibility-audit.mjs` |
| Keyboard, drawer, dialog, mobile shell, and reduced motion | browser | PWA, discovery, workspace, focused release, and acceptance captures |
| Public fixture-language regression | fixture/integration | `scripts/test-demo-client-portfolio.ts` |
| Human hierarchy, copy, and navigation review | reviewed visual evidence | launch audit document and focused screenshots |

## Rollout and rollback

Accessibility corrections follow their owning feature and deployment specs.
The audit script and evidence have no runtime authority. Any visual correction
can be reverted independently; security, tenant isolation, and stored customer
content remain unchanged.

## Readiness checklist

- [x] Roles, routes, viewports, and standards are explicit
- [x] Automated and human-review boundaries are explicit
- [x] Failure evidence and release behavior are explicit
- [x] Fixture and unsupported-claim boundaries are explicit
- [x] Existing security and tenant authority remain unchanged

## Evidence

Evidence: implemented and verified locally on 2026-08-11.

On 2026-08-11, `npm run test:accessibility` passed 88 desktop and
390-pixel phone states across public, hosted-showroom, administrator,
operations-manager, team-member, and client routes. The matrix includes open
mobile navigation, discovery filters, showroom preview, product detail,
inquiry, and workspace-menu states. Structured results are written to
`/tmp/mirtpage-accessibility-audit.json`.

The ordered browser acceptance suite passed 10/10 workflows, including public
signup and discovery, mobile map/list parity, hosted showroom inquiry,
role-specific workspaces, revisions, support, renewal, API authorization, CSP,
and controlled provider video. Focused reviewed visuals are retained in
`/tmp/mirtpage-audit-discovery-final`,
`/tmp/mirtpage-audit-workspaces-final-2`, and
`/tmp/mirtpage-audit-focused-final-3`. Automation and repository review do not
replace testing with people who use assistive technology; that remains a
production research responsibility rather than a release claim.
