---
id: FE-002
title: Programmatic form labels and modal focus safety
status: done
related: []
owners: [frontend, product]
last_updated: 2026-07-20
change_level: L1
---

# FE-002 — Programmatic form labels and modal focus safety

## Problem and outcome

Visible labels must be exposed to assistive technology, and showroom modals must
keep keyboard focus within the active interaction and restore it on close.

## Scope and non-goals

Includes public contact, login, dashboard forms, product dialog, and inquiry
drawer semantics/focus. It does not redesign layouts, copy, or tenant renderers.

## Scenarios

```gherkin
Scenario: Form control has an accessible name
  GIVEN a visible input, select, or textarea
  WHEN a browser exposes its accessibility relationship
  THEN it has a programmatic label or accessible name

Scenario: Customer opens and closes a modal workflow
  GIVEN keyboard focus on the control that opens a product or inquiry dialog
  WHEN the dialog opens and the customer presses Tab
  THEN focus remains within the active dialog
  WHEN the customer closes the dialog
  THEN focus returns to the control that opened it

Scenario: Inquiry drawer is closed
  GIVEN the inquiry drawer is not visible
  WHEN the customer navigates by keyboard
  THEN controls inside the drawer cannot receive focus
```

## Quality impact

- No customer or tenant data changes.
- Semantic changes must preserve desktop/mobile layout and custom styling.
- Escape, backdrop close, and existing cart behavior remain supported.

## Test plan and evidence

- Browser accessibility-name audit across public/admin/owner forms.
- Browser keyboard focus containment and restoration checks.
- Existing responsive/cart acceptance scenarios remain green.
- Evidence: `npm run test:acceptance` on 2026-07-20; all five browser
  scenarios passed against a production build and isolated database.

## Rollout and rollback

Ships with the frontend build. Roll back to the previous component version if a
renderer interaction regresses; no data migration is involved.
