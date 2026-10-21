---
id: FE_BASE
title: Frontend base architecture
status: done
related: [FE-053, BE_BASE, DEP_BASE]
owners: [product, frontend]
last_updated: 2026-10-17
---

# Frontend base architecture

## Purpose

Define the stable UI contract for the Suqpage platform, four custom showrooms,
and authenticated operations dashboard.

## Architecture

- Next.js App Router server components load authorized application data.
- Client components own interaction state, including inquiry carts and dialogs.
- Each showroom retains a separate renderer; shared behavior flows through the
  typed `DesignProps`/catalog contract.
- Server actions and HTTP APIs are adapters. UI code never accesses database drivers.
- Merchant-entered product names and option values remain verbatim.

## Routing and access

- `/` is the Suqpage platform landing page and intentional directory.
- `/@handle` resolves active public showrooms only.
- `/preview/@handle` requires authentication and authorization.
- `/dashboard/**` requires a session; temporary-password accounts are restricted
  to account security until their password changes.
- Owners are tenant-scoped. Administrators use explicit privileged paths.

## Required UI states

Every networked workflow defines loading, success, empty, validation, network
failure, permission denial, and retry-safe states. External social handoff must
retain a visible/selectable message fallback.

## Accessibility and responsive contract

- Mobile and desktop must have no horizontal overflow.
- S107: Market, Featured and visitor Login in the native client expose their
  existing primary title as a screen-reader heading in every interface language.
  Preserve the visible words, styling and size; prices, status cards and other
  large body text do not become headings automatically. FE-065 S128 supersedes
  only Market’s dedicated visible title row: retain its localized programmatic
  heading without allocating layout height, and keep the narrative deliberately
  available through About/info beside the centered mode switch. Other primary
  headings are unchanged. Verify the actual
  rendered React Native Web accessibility tree with
  `scripts/capture-mobile-primary-headings.mjs`; this focused check does not
  replace native Android/TalkBack verification.
- S107: the native client's horizontal offering gallery is keyboard-focusable
  in React Native Web, so keyboard users can scroll its media without requiring
  touch. Preserve native touch paging, media ordering, active-video behavior and
  Previous/Next controls. Verify focus, actual keyboard scrolling when media
  overflow exists, and the `scrollable-region-focusable` axe rule against the
  real local product screen in `scripts/capture-mobile-gallery-keyboard.mjs`.
- Inputs have programmatic labels and errors are understandable without color.
- Dialogs/drawers use semantic roles, Escape handling, focus entry, focus trap,
  and focus restoration.
- Buttons and links use accessible names and visible focus states.
- Arabic-ready directionality and long-label resilience must not be prevented by
  component structure, even while the controlled dashboard is English-first.

## Network and data policy

- Treat server data as authoritative; optimistic state must reconcile failures.
- Persist carts per showroom without persisting customer contact data.
- Do not log full inquiry contact values in the browser.
- Never infer success when an external provider or clipboard action fails.

## Test baseline

S120: affected interface work requires actual Chrome user journeys under
[the browser workflow review procedure](../../docs/operations/BROWSER-WORKFLOW-REVIEW.md),
including affected admin/staff/owner/visitor roles, desktop and phone web, and
the Expo mobile localhost app when shared/native UI changes. Real local API and
saved-state checks supplement focused component/security tests. Screenshots or
compilation alone cannot establish working interactions. Expo browser results
do not establish installed Android/MapLibre/OS behavior. AGENTS.md retains the
focused browser evidence → visual review → full-gate order. S119 traceability
provides current actual Chrome/admin and localhost8082 examples with explicit
focus/harness limitations; no release approval follows from this workflow rule.

S135 workflow clarification: distinguish planned test cleanup from an unexpected
page/context close, crash or browser disconnect. Record lifecycle events and the
active journey stage against explicit teardown/deadline state. Early closure
fails the journey even when no application error was captured. Preserve the
original result and classify a bounded retry; isolated installed-Chrome headless
evidence must be labelled and cannot establish that a visible-browser failure
was repaired. Keep unrelated user tabs and local servers running.

S107 defect audit: GIVEN a route or root-layout render fails (including a database
outage) THEN display an accessible, localized Suqpage recovery surface with Retry
and a fixed Market link. Root recovery retains a document title and language;
do not render/log the raw error, SQL, account information or digest in this UI.
Retry re-runs the segment through the installed Next.js retry contract. Verify
the actual error components, retry callback, all five locales and phone layout
with `scripts/test-route-recovery.ts` and focused browser captures. This is a
local candidate; production recovery/rollout is not implied by component tests.

- Component/type validation for shared renderer contracts.
- Production browser acceptance for visitor, admin, and owner roles.
- Desktop/mobile overflow and browser console monitoring.
- Negative permission and failure-path tests for protected UI workflows.
