---
id: FE-006
title: Deterministic composed showroom rendering
status: in_progress
related: [BE-007, DEP-004, DEP-005, DEP-006, FE-001, FE-003, FE-005, FE-007, FE-009, BE-004, BE-005, BE-006, ADR-0005, ADR-0007]
owners: [product, frontend, design]
last_updated: 2026-08-12
change_level: L3
---

# FE-006 — Deterministic composed showroom rendering

## Problem and outcome

The reviewed component bank is visible only in a synthetic staff laboratory,
while live and private showrooms still use four monolithic renderers. All four
example clients must move to distinct, mobile-first compositions without
losing catalog discovery, product detail, inquiry, private review, approval,
publication, or rollback behavior.

The outcome is one deterministic composition renderer driven by a validated
design manifest. Components control visual presentation; the platform continues
to own canonical content and smart-showroom actions.

## Scope

### In scope

- Render schema-v2 private previews, public showrooms, and retained versions
  from exact bank release, token pack, sections, properties, and bindings.
- Four intentionally distinct initial manifests for Al Haya Brand, USAshopET,
  NovaTech, and HomeVibe.
- Preserve dynamic client names, images, collections, categories, products,
  availability, product detail, search/filter, inquiry selection, and cart.
- Make the composition root phone-first at 320–390 CSS pixels, touch operable,
  reduced-motion safe, and visually coherent on desktop.
- Show staff the immutable composition identity in the current revision editor;
  routine editing cannot select an old renderer key.
- Fail closed with a clear unavailable state when an active manifest is invalid.

### Non-goals

- Manual AI proposal import, provider integration, arbitrary tenant code,
  arbitrary CSS/markup, a full composition studio, or exact visual parity with
  the four replaced example designs.
- Changing client approval or manager publication authority.

## Domain language and invariants

- A **composed showroom** is a validated manifest interpreted only through the
  static bank registry.
- **Visual refresh** permits a new layout and visual identity while retaining
  canonical client content and platform workflows.
- A component cannot own persistence, authorization, product facts, inquiry
  submission, or publication.
- Mobile completeness and inquiry completion take priority over ornament.

## Contracts

- The renderer resolves component IDs only from the exact static bank registry;
  it performs no dynamic import and executes no proposal-controlled code.
- Sections render in manifest order with their declared token system, bounded
  motion intensity, decorative depth, properties, and canonical bindings.
- Platform callbacks remain the only way to open product detail, add or remove
  inquiry items, open the inquiry drawer, search, or filter.
- Canonical content is displayed without being rewritten by the manifest.
- Every composed showroom exposes one stable section-navigation model owned by
  the renderer: Home, Story, Offerings, and Contact target the rendered hero,
  combined story-and-process chapter, catalog, and inquiry call-to-action.
  Desktop headers carry those links beside tenant identity instead of repeating
  a promotional descriptor. Phone showrooms expose the same destinations in a
  fixed bottom application bar with Inquiry as a named action and item count.
- The platform-owned **Powered by MirtPage** and **Back** host bar remains above
  tenant-controlled presentation. Tenant manifests may vary header anatomy and
  colors but cannot remove, rename, or intercept platform navigation or the
  Inquiry action.
- Fixed phone navigation respects safe-area insets, does not cover showroom
  content, remains usable at 320 CSS pixels, and is omitted from embedded staff
  previews where it would obscure editing controls. The existing desktop
  floating Inquiry action remains available outside phone widths.
- The four seeded clients use different valid manifests and all expose the
  mandatory product-detail, add-to-inquiry, and inquiry-cart capabilities.
- Private-preview controls remain outside the showroom canvas and preserve
  back-navigation to the request/revision workspace.

## Scenarios

```gherkin
Scenario: Visitor uses a migrated composed showroom
  GIVEN an active example client with a valid schema-v2 publication
  WHEN a visitor opens the handle route on a phone
  THEN the exact manifest is rendered from the static bank
  AND the visitor can search or filter, inspect a product, add it to an inquiry,
  and submit through the existing inquiry workflow

Scenario: Visitor navigates one showroom as an application
  GIVEN a public composed showroom is open
  WHEN the visitor chooses Home, Story, Offerings, or Contact in the desktop
  header or phone bottom navigation
  THEN focus moves to the corresponding canonical rendered section
  AND the tenant header does not repeat the business tagline as navigation copy
  AND choosing Inquiry opens the existing tenant-scoped inquiry drawer
  AND the MirtPage host bar remains the topmost navigation context

Scenario: Client reviews the exact composed revision
  GIVEN the latest submitted schema-v2 revision for the client's business
  WHEN the client opens its private preview
  THEN the same manifest and canonical snapshot content are rendered
  AND approval or rejection applies to that exact immutable revision

Scenario: Invalid composition fails closed
  GIVEN a publication whose manifest does not pass the authoritative parser
  WHEN its showroom is requested
  THEN no legacy design is silently substituted
  AND no proposal-controlled code, markup, style, or external locator executes

Scenario: Reduced motion and phone layout remain authoritative
  GIVEN an expressive composition at 320 CSS pixels
  WHEN the visitor requests reduced motion
  THEN nonessential animation is removed
  AND named touch controls, product content, and inquiry actions remain usable
  without horizontal page overflow
```

## Quality impact

- Security and tenant isolation: renderer input is an already tenant-scoped
  snapshot; static registry lookup adds no data or mutation authority.
- Privacy and data retention: public rendering receives only published catalog
  data; private request attachments remain inside authorized revision previews.
- Accessibility and responsive behavior: semantic buttons, focus visibility,
  reduced motion, 44-pixel touch targets, and 320/390-pixel containment.
- Localization and merchant-entered values: layouts wrap canonical supplied
  values and never infer product claims.
- Performance and limits: maximum 24 sections, local CSS/assets, no renderer
  network calls or animation runtime.
- Failure recovery and idempotency: exact manifest replay is deterministic;
  invalid data fails closed and retained versions remain recoverable.

## Observability

Tests may record schema version, bank release, component IDs, token pack, route,
and safe error category. They must not log request text, private media,
credentials, contacts, or complete snapshot JSON.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Static deterministic renderer and platform callbacks | unit/browser | `scripts/test-showroom-renderer.ts`, `tests/acceptance/app.spec.ts` |
| Stable desktop and phone section navigation plus Inquiry | browser/accessibility | `tests/acceptance/app.spec.ts`, focused 1440px/390px/320px showroom captures |
| Four distinct client manifests | contract/browser | `scripts/test-showroom-migration.ts`, `tests/acceptance/app.spec.ts` |
| Private preview and exact approval/publication | integration/browser | `scripts/test-revisions.ts`, `tests/acceptance/app.spec.ts` |
| Invalid manifest fails closed | unit/security | `scripts/test-showroom-renderer.ts`, `scripts/test-security.ts` |
| Phone containment, touch, reduced motion | browser | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

Release with BE-007 and DEP-006. Migrate the four example clients only after a
backup and validation. Rollback republishes a retained schema-v2 snapshot or
restores the pre-migration database backup; it never changes approval history
in place. A schema-v1 reader is a temporary recovery bridge, not a user-selectable
renderer or a writer path.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Evidence: verified locally on 2026-07-24.

- The static composition interpreter renders exact validated bank sections,
  token variables, and bounded experience settings while mapping all smart
  actions back to the shared `ShowroomApp` product, cart, and inquiry callbacks.
- Al Haya Brand, USAshopET, NovaTech, and HomeVibe render distinct eight-section
  compositions using linen-luxury, beauty-editorial, technology-mono, and
  furniture-walnut token systems respectively.
- The structured recovery editor displays the immutable composition identity;
  current invitation and seed flows select reviewed composition styles and do
  not write former renderer keys.
- Production Playwright acceptance passed 7/7 scenarios. It exercised all four
  public showrooms, desktop and 320/390-pixel containment, search, product
  dialog focus, persistent cart/quantity, inquiry persistence, private draft
  preview, every product role, exact client approval, and manager publication.
- `npm run check`, `npm run release`, and `npm run test:acceptance` passed.
  Reduced-motion and all 42 bank-component phone checks remain enabled.
