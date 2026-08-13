---
id: FE-034
title: Installable PWA and mobile application shell
status: in_progress
related: [FE-005, FE-013, FE-021, FE-026, FE-030, FE-035, FE-036, FE_BASE, DEP-020, DEP-023, DEP-025]
owners: [product, frontend, design]
last_updated: 2026-08-11
change_level: L2
---

# FE-034 - Installable PWA and mobile application shell

## Problem and outcome

MirtPage is responsive but still presents desktop website chrome on phones and
cannot be installed as a complete Progressive Web App. Visitors and workspace
users need a coherent phone application shell, safe standalone behavior, and a
useful offline failure state without caching private or mutable business data.

## Scope

### In scope

- Standards-based manifest, complete application icon set, standalone metadata,
  service-worker registration, safe-area handling, and an offline route.
- Network-first public navigation with same-origin static-asset reuse and a
  controlled offline fallback.
- A shared four-target public phone bar for Market, Featured, About, and More.
  More exposes signup, workspace access, contact, privacy, and
  terms in a bounded sheet.
- Removal of desktop-style public headers and full public footers at phone
  widths while retaining MirtPage identity inside primary page content.
- A role-derived authenticated phone tab bar whose **More** action opens the
  existing complete authorized workspace menu.
- Removal of the authenticated mobile top header once equivalent bottom
  navigation is available.
- Removal of composed showroom footers on phones. The compact MirtPage host bar
  and business identity remain because they provide Back, hosting provenance,
  live status, and tenant identity rather than duplicate platform navigation.

### Non-goals

- Offline inquiry submission, offline authentication, background sync, push
  notifications, app-store packaging, or caching protected workspace content.
- Changing desktop navigation, server authorization, tenant presentation,
  discovery authority, or showroom publication data.

## Contracts

- The manifest uses `/` scope and start URL, `standalone` display, MirtPage
  colors, and 192px, 512px, maskable, and Apple-compatible raster icons.
- Registration occurs only in a service-worker-capable production browser.
  Development unregisters stale MirtPage workers and caches so local debugging
  cannot silently use old application code. A build-time public operations flag
  can disable registration and remove controlled workers during rollback.
- `GET` navigation to public pages is network-first and may fall back to a
  previously visited public response or `/offline`. API requests, protected
  workspace routes, preview routes, authentication, mutations, and cross-origin
  requests are never stored in the PWA cache.
- Service-worker cache names are versioned; activation deletes only prior
  MirtPage-managed caches and claims open clients.
- At phone widths, public pages expose no desktop header, hamburger menu, or
  full footer. The fixed bottom bar respects the device safe area, contains four
  labeled icon targets of at least 44 CSS pixels, exposes active-page semantics,
  and does not cover page actions or dialogs.
- The root Market retains compact MirtPage identity and context without adding
  a replacement mobile top navigation bar.
- Authenticated phone navigation is derived only from links already admitted by
  role and business context. Up to four primary tasks appear in the bottom bar;
  **More** opens every remaining authorized destination with the existing focus
  trap, Escape behavior, and sign-out action.
- Desktop headers, sidebars, footers, and tenant-designed showroom surfaces are
  unchanged.

## Scenarios

```gherkin
Scenario: Visitor installs MirtPage
  GIVEN a supported production browser opens MirtPage over HTTPS
  WHEN the browser evaluates installability
  THEN a valid manifest, service worker, application name, colors, and complete icon set are available
  AND standalone launch begins at the marketplace

Scenario: Phone visitor uses the marketplace as an application
  GIVEN the public homepage is open at 320 or 390 CSS pixels
  WHEN the visitor moves among Market, Featured, About, and More
  THEN no desktop public header, hamburger menu, or full footer consumes the viewport
  AND one safe-area-aware bottom navigation bar remains reachable
  AND the current destination is identified without color alone

Scenario: Authenticated actor uses the phone workspace
  GIVEN an authorized client, team member, or administrator opens a workspace at phone width
  WHEN the workspace renders
  THEN no mobile top header is shown
  AND the bottom bar contains only authorized primary tasks
  AND More opens every remaining authorized destination and account action

Scenario: Public network navigation fails
  GIVEN the service worker controls the application
  WHEN a public navigation request fails
  THEN a previously visited public response or the branded offline route is shown
  AND no protected response or API payload is served from cache

Scenario: Visitor opens a hosted showroom on a phone
  GIVEN an active composed showroom
  WHEN it renders at phone width
  THEN its full footer is omitted
  AND its compact tenant identity and MirtPage Back/provenance controls remain available
```

## Quality impact

- Security and privacy: protected pages, previews, APIs, non-GET requests, and
  cross-origin responses are excluded from storage. Existing authorization
  remains authoritative.
- Accessibility: semantic navigation, icon-plus-text labels, active-page state,
  visible focus, 44px targets, drawer focus handling, and safe-area clearance.
- Performance: no PWA framework dependency; a small first-party worker and
  bounded versioned caches only.
- Failure recovery: network-first behavior avoids stale public data during
  normal operation and exposes an explicit offline state when no safe response
  exists.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Manifest, icons, metadata, and service-worker policy | focused/contract | `scripts/test-pwa-shell.mjs` |
| Public and workspace mobile shell semantics | focused/browser | `scripts/capture-pwa-shell.mjs`, `tests/acceptance/app.spec.ts` |
| Protected/API cache exclusion and offline fallback | focused/browser | `scripts/test-pwa-shell.mjs`, production browser probe |
| Desktop navigation remains unchanged | browser/manual | focused 1440px capture |
| Phone safe-area and overflow behavior | browser | 390px and 320px captures |

## Rollout and rollback

DEP-025 governs worker cache versioning, production headers, controlled
activation, and rollback cleanup. No database or tenant-content migration is
required.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Public/private cache boundary explicit
- [x] Mobile navigation authority explicit
- [x] Accessibility and safe-area behavior explicit
- [x] Tests, rollout, and rollback planned
