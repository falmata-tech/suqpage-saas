---
id: FE-029
title: MirtPage platform visual system refresh
status: done
related: [FE-009, FE-013, FE-024, FE-026, FE-028]
owners: [product, frontend, design]
last_updated: 2026-08-04
change_level: L1
---

# FE-029 - MirtPage platform visual system refresh

## Problem and outcome

MirtPage-owned surfaces still mix the retired purple identity with several
unrelated neutral, green, and slate systems. The marketplace, virtual venues,
public forms, and authenticated workspaces should feel like one deliberate
product. The supplied MirtPage identity establishes midnight navy, two teals,
saffron, and cool gray as the platform palette and a rounded navy M mark with a
teal point as the universal platform identity.

## Scope

### In scope

- One semantic token system for platform-owned public and authenticated UI.
- The supplied mark and two-color wordmark treatment across public headers,
  footers, forms, workspace navigation, metadata, and favicon.
- Coordinated marketplace, map, City Showroom, Expo, login, signup, admin,
  staff, support, and client-workspace colors and interaction states.
- A compact platform-owned host band above every public showroom and private
  preview, with a direct return to the MirtPage marketplace.
- An Expo and City architectural shell recolored to the same visual system
  without changing dynamic perimeter placement or the empty central court.
- Accessible focus, hover, selected, status, warning, error, and inverse states.

### Non-goals

- Recoloring tenant-owned showroom brands, generated client logos, or custom
  showroom palettes.
- Changing routes, authorization, persistence, discovery eligibility, venue
  geometry, copy, or workflow behavior.
- Adding ornamental gradients, decorative animation, or external runtime
  assets.

## Domain language and invariants

- **Platform palette:** midnight `#0B1D3A`, deep teal `#0D6B6E`, bright teal
  `#27A5A1`, saffron `#F2B01E`, and cool gray `#F3F5F7`, plus derived neutral
  and contrast-safe interaction states.
- MirtPage platform identity must remain visually distinct from every tenant
  showroom identity.
- The host band is platform chrome outside the tenant renderer. Its semantic
  surface, border, text, and focus colors may derive from the showroom's
  approved palette so the band blends with that site, while its MirtPage mark,
  host wording, and marketplace action remain platform-controlled. It must not
  replace or imply ownership of the tenant's logo, header, navigation, or content.
- Saffron communicates bounded attention or warning; it is not a general
  surface fill, body-text color, or Expo current-day treatment.
- Sponsored placement uses bright-teal accents and an explicit paid-placement
  label over a restrained midnight patterned field, not warning-colored
  saffron.
- Expo today state uses the same selected teal field as the active industry
  card while its weekday cards remain in a fixed Monday-through-Sunday order.
- Color never serves as the only indication of state.

## Contracts

- Platform-owned components consume semantic tokens rather than page-specific
  purple constants.
- The mark remains legible at 32 CSS pixels and the wordmark distinguishes
  **Mirt** in midnight from **Page** in deep teal without relying on an image of
  text. Its white M preserves the original mark's compact, balanced vertical
  proportions instead of reading as a tall condensed letter.
- Primary actions use deep teal with white text; operational selection may use
  midnight; high-attention states use bounded saffron with dark text.
- Public and workspace surfaces use cool gray canvas, white working surfaces,
  clear borders, restrained shadows, and radii no larger than eight pixels for
  operational cards and panels.
- Expo and City venue architecture uses navy, teal, saffron, cool-gray, and
  natural neutral materials while business cards remain readable and the
  decorative image contains no business data or fixed positions.
- Focus indicators reach visible contrast on light and dark surfaces, controls
  remain at least 44 CSS pixels on phones, and no 320px or 390px view gains
  horizontal overflow.
- Client showroom renderers continue to resolve their own approved or custom
  palette exactly as before.
- Every showroom entry presents one compact, responsive MirtPage host band with
  a concise visible **Back** action whose accessible name identifies the
  MirtPage marketplace destination, plus a **Powered by MirtPage** label.
  The band remains in normal document flow so it does not cover tenant
  navigation, showroom content, dialogs, or the floating inquiry control, and
  it adapts to the approved tenant palette without losing the MirtPage identity.

## Scenarios

```gherkin
Scenario: Visitor moves through the public platform
  GIVEN the homepage, discovery workspace, Expo, login, signup, and About page
  WHEN MirtPage-owned surfaces render
  THEN the same mark and semantic navy, teal, saffron, and cool-gray system is used
  AND no retired purple platform treatment remains

Scenario: Staff works across the authenticated application
  GIVEN an administrator, team member, or client opens a permitted workspace
  WHEN navigation, tables, forms, status, support, and focused actions render
  THEN the hierarchy and interaction states use the shared platform tokens
  AND the page remains usable at desktop, 390px, and 320px widths

Scenario: Visitor opens a tenant showroom
  GIVEN a published showroom has an approved custom visual identity
  WHEN the showroom renders after the platform refresh
  THEN its tenant palette and logo are unchanged
  AND a compact MirtPage host band provides a direct return to the marketplace
  AND platform-owned chrome remains visibly separate from the tenant identity
```

## Quality impact

- Security and tenant isolation: presentation only; no authorization or query
  changes.
- Privacy and data retention: no new data, logging, or external request.
- Accessibility and responsive behavior: contrast, focus, 44px targets,
  reduced-motion compatibility, and exact-width overflow checks are required.
- Performance and limits: local SVG and one optimized venue bitmap; no new
  dependency or runtime image service.
- Failure recovery and idempotency: missing venue art falls back to semantic
  floor colors without affecting data or interaction.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Platform palette and mark contract | focused | `scripts/test-platform-identity.mjs` |
| Public marketplace and venue hierarchy | browser/visual | `scripts/capture-discovery-visuals.mjs` |
| Login and signup desktop/mobile composition | browser/visual | `scripts/capture-platform-form-visuals.mjs` |
| Admin and client workspace hierarchy | browser/visual | `scripts/capture-workspace-navigation.mjs` |
| Tenant showroom palette remains independent | integration/acceptance | `scripts/test-showroom-renderer.ts`, `tests/acceptance/app.spec.ts` |
| Showroom host identity, marketplace return, and fixed inquiry overlay | browser/visual | `scripts/capture-showroom-host-visuals.mjs`, `scripts/test-platform-identity.mjs`, `tests/acceptance/app.spec.ts` |

## Rollout and rollback

This is a frontend-only asset and token replacement. Rollback restores the
previous CSS and mark assets; no data or schema rollback is required.

## Completion evidence

Evidence:

- `npm run check` passed on Node 24.18.1.
- `npm run test:acceptance` passed all 10 production-build workflows, including
  the adaptive showroom host band and fixed inquiry overlay regression.
- `/tmp/mirtpage-final-discovery-v6` records passing desktop, 390px, and 320px
  marketplace, inline City Showroom, Expo, preview, and List captures with no
  horizontal overflow.
- `/tmp/mirtpage-final-showroom-v3` records the adaptive **Back** / **Powered by
  MirtPage** band and fixed inquiry drawer at desktop and phone widths.
- `scripts/test-platform-identity.mjs` and `scripts/test-showroom-renderer.ts`
  passed the platform/tenant identity boundary.
- `npm run release` passed the production build, HTTP smoke tests, scale
  fixtures, security suites, and zero-vulnerability production audit after the
  bounded PostCSS override update recorded in DEP-002.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided
