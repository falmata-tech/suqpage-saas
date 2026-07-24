---
id: FE-005
title: Mobile-first showroom experience system
status: done
related: [BE-006, DEP-004, DEP-005, FE-004, BE-005, ADR-0005]
owners: [product, frontend, design]
last_updated: 2026-07-24
change_level: L2
---

# FE-005 — Mobile-first showroom experience system

## Problem and outcome

The reviewed component bank is responsive but does not yet expose a consistent,
bounded way to create polished motion, decorative depth, and touch-first
behavior. Staff need to judge whether every component feels intentional on a
phone before the bank becomes a composition renderer.

The outcome is a mobile-first experience layer shared by the complete bank. It
adds controlled visual depth and interaction without turning showrooms into
noisy animation demonstrations or weakening inquiry completion.

## Scope

### In scope

- Three motion intensities: `quiet`, `balanced`, and `expressive`.
- Three decorative depths: `clean`, `subtle`, and `signature`.
- Purposeful section entry, image, card, and interaction treatments using
  scoped CSS and existing component markup.
- An explicit 390-pixel laboratory preview mode plus responsive mode.
- Touch-first controls, horizontal swipe affordances where appropriate,
  phone-safe stacking, long-label resilience, and no hover dependency.
- Reduced-motion behavior that removes nonessential movement.
- Component metadata that communicates the bounded experience choices to a
  later declarative proposal.

### Non-goals

- Runtime composition, tenant revision persistence, public renderer migration,
  arbitrary CSS/JavaScript, animation libraries, scroll observers, external
  assets, or AI-generated executable code.
- Making every section move, using motion to convey required information, or
  claiming that a laboratory preview is a client showroom.
- Replacing the four current public renderers.

## Domain language and invariants

- **Motion intensity:** a bounded presentation preference. `quiet` is almost
  still, `balanced` is the default, and `expressive` increases emphasis without
  changing content or interaction authority.
- **Decorative depth:** a bounded choice controlling local atmospheric layers.
  Decorative layers are non-interactive, content-independent, and clipped to
  the component root.
- **Mobile-first:** a component remains complete and operable at 320–390 CSS
  pixels, uses touch-sized controls, does not require hover, and prioritizes the
  inquiry path over desktop ornament.
- Every component feels finished, but a valid composition may intentionally use
  quiet motion or clean decoration.

## Contracts

- The laboratory provides labeled native controls for motion intensity,
  decorative depth, and preview width.
- The default preview is `balanced` motion with `subtle` decoration.
- Every rendered bank root receives the selected bounded settings through typed
  presentation props and stable data attributes.
- Mobile preview frames are visibly identified and constrain their inner canvas
  to 390 CSS pixels without scaling text into an unreadable thumbnail.
- Interactive controls have at least a 44 CSS-pixel touch block size on phone
  layouts. Horizontal rails use native scrolling and snapping.
- At phone widths, layouts stack or become deliberate swipe rails; important
  controls, product names, availability, and inquiry actions remain present.
- `prefers-reduced-motion: reduce` removes entry, ambient, and hover movement
  regardless of selected motion intensity.
- Focus-visible treatment is not replaced by hover-only styling.

## Scenarios

```gherkin
Scenario: Staff reviews the bank as a phone experience
  GIVEN an authorized staff member in the component laboratory
  WHEN they select the 390-pixel preview
  THEN all 42 component canvases remain within their preview frames
  AND headings, controls, product content, and inquiry actions remain usable
  AND the dashboard has no horizontal overflow

Scenario: Staff compares bounded visual energy
  GIVEN the component laboratory
  WHEN staff switch motion intensity or decorative depth
  THEN every component receives the selected bounded setting
  AND no setting changes catalog content or invokes persistence

Scenario: A visitor requests reduced motion
  GIVEN a component preview configured as expressive
  WHEN the user agent reports reduced-motion preference
  THEN nonessential animations and motion transitions are disabled
  AND every interaction and piece of information remains available

Scenario: Mobile interaction does not depend on hover
  GIVEN a phone-sized component preview
  WHEN a user navigates with touch or keyboard
  THEN catalog discovery, product detail, add-to-inquiry, and cart-trigger
  controls remain visible and operable
```

## Quality impact

- Security and tenant isolation: typed presentation preferences only; no tenant,
  database, request, media, or network authority.
- Privacy and data retention: local synthetic laboratory data only.
- Accessibility and responsive behavior: reduced motion, focus visibility,
  semantic controls, 44-pixel touch sizing, 320/390-pixel containment.
- Localization and merchant-entered values: layouts wrap supplied values and do
  not rewrite or truncate canonical data as an authority.
- Performance and limits: CSS-only effects, no dependency, observer, timer,
  network image, or global event handler.
- Failure recovery and idempotency: settings are local preview state and reset
  safely on reload.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Labeled experience and device controls | component/browser | `scripts/test-showroom-experience.ts`, `tests/acceptance/app.spec.ts` |
| All roots receive bounded settings | contract/browser | `scripts/test-showroom-experience.ts`, `tests/acceptance/app.spec.ts` |
| 320/390 containment and visible inquiry controls | browser | `tests/acceptance/app.spec.ts` |
| Reduced motion and no hover dependency | static/browser | `scripts/test-showroom-experience.ts`, `tests/acceptance/app.spec.ts` |
| Touch target and horizontal rail contract | static/browser | `scripts/test-showroom-experience.ts`, `tests/acceptance/app.spec.ts` |

## Rollout and rollback

This is an additive staff-laboratory and repository-bank enhancement. It changes
no tenant, revision, database, or public renderer. Rollback removes the
experience props, scoped styles, controls, and gate while retaining the prior
bank release and four public showrooms.

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

- The laboratory exposes labeled token, motion, decorative-depth, and preview-
  width controls. Defaults are balanced motion and subtle decoration.
- All 42 registered component roots receive the typed bounded settings. A
  container-based mobile mode constrains each preview to a 390-pixel device
  frame and activates actual component phone layout at desktop viewport widths.
- Scoped CSS supplies purposeful entry, ambient, stagger, hover-capable, focus,
  decoration, touch-active, safe-area, and native swipe-rail behavior without a
  runtime library, timer, observer, network request, or global selector.
- Production-browser acceptance checks all 42 mobile canvases for overflow,
  every visible preview input/button for at least 44-pixel height, expressive
  and signature data propagation, and computed reduced-motion suppression. The
  four existing public showrooms also remain contained at 320 pixels.
- Temporary 390-pixel and desktop laboratory screenshots were visually reviewed
  for hierarchy, readable type, interaction prominence, clipping, and restrained
  decoration. They contain synthetic fixture data and were not committed.
