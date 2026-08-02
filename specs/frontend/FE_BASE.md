---
id: FE_BASE
title: Frontend base architecture
status: done
related: [BE_BASE, DEP_BASE]
owners: [product, frontend]
last_updated: 2026-07-20
---

# Frontend base architecture

## Purpose

Define the stable UI contract for the MirtPage platform, four custom showrooms,
and authenticated operations dashboard.

## Architecture

- Next.js App Router server components load authorized application data.
- Client components own interaction state, including inquiry carts and dialogs.
- Each showroom retains a separate renderer; shared behavior flows through the
  typed `DesignProps`/catalog contract.
- Server actions and HTTP APIs are adapters. UI code never queries SQLite.
- Merchant-entered product names and option values remain verbatim.

## Routing and access

- `/` is the MirtPage platform landing page and intentional directory.
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

- Component/type validation for shared renderer contracts.
- Production browser acceptance for visitor, admin, and owner roles.
- Desktop/mobile overflow and browser console monitoring.
- Negative permission and failure-path tests for protected UI workflows.
