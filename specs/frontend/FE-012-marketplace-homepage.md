---
id: FE-012
title: Visual marketplace homepage
status: done
related: [FE-001, FE-010, BE-011, DEP-010]
owners: [product, frontend]
last_updated: 2026-07-26
change_level: L1
---

# FE-012 - Visual marketplace homepage

## Problem and outcome

The public homepage currently exposes the right Bazaar and showroom concepts but
does not communicate them with the visual density, hierarchy, or browsing
affordances of the approved homepage mockup. Visitors need a polished,
mobile-first marketplace landing experience that presents the permanent
showroom as the primary product and the daily Bazaar as an active discovery
benefit.

## Scope

### In scope

- A compact public header with desktop navigation and an accessible mobile menu.
- A photographic maker hero with showroom-first copy, two actions, four compact
  benefits, and a secondary live-Bazaar card.
- A seven-day schedule rail directly below the hero with the server-selected day
  clearly highlighted.
- A visually prominent All Showrooms section above the Bazaar with search,
  category, industry, sort, and permanent-showroom links.
- A rich Bazaar floor presentation backed by the existing server-owned current
  Bazaar view, including map/list controls, booth selection, and showroom links.
- A separate featured-business rail, compact five-step process band, merchant
  conversion panel, and complete public footer.
- Approved, project-owned maker and Bazaar imagery that carries the visual
  hierarchy shown in the reference mockup without duplicating tenant content.

### Non-goals

- Pixel-for-pixel copying of generated placeholder brands or unsupported counts
  shown in the visual reference.
- New Bazaar eligibility, promotion, tenant, media-storage, or persistence rules.
- Replacing existing `/@handle` showrooms or creating separate booth pages.
- Inventing businesses to make the page appear more populated.

## Domain language and invariants

- The permanent `/@handle` showroom remains SuqPage's primary product.
- The daily Bazaar is included discovery; it is not checkout and normal
  participation is not presented as paid placement.
- Featured businesses are visually and semantically separate from ordinary
  Bazaar participation.
- Every business card and booth preview links to its authoritative `/@handle`.
- Public business and Bazaar data comes from existing active server records.

## Contracts

- The homepage server component supplies active businesses and the current
  Bazaar view; client components may filter or change display mode but do not
  determine eligibility.
- The desktop composition follows the approved order: header, hero, weekly
  schedule, All Showrooms, today's Bazaar, featured businesses, process, final
  CTA, footer.
- Desktop content uses the available viewport deliberately and presents showroom
  cards as a compact horizontal marketplace rail rather than full-page previews.
- At 320px and 390px, controls wrap or scroll intentionally, key copy remains
  readable, interactive targets remain usable, and the document has no
  horizontal overflow.
- Generated decorative marketplace media contains no factual product claims;
  tenant-specific cards and booth links continue to use tenant-owned media.

## Scenarios

```gherkin
Scenario: Visitor understands the product hierarchy
  GIVEN active public showrooms and a configured daily Bazaar
  WHEN a visitor opens the homepage
  THEN the first viewport presents the permanent showroom value proposition
  AND today's Bazaar appears as a secondary live discovery card
  AND the weekly schedule and All Showrooms appear before the Bazaar floor

Scenario: Visitor browses the complete marketplace composition
  GIVEN the homepage has active public businesses
  WHEN the visitor moves through the page
  THEN showroom cards use compact visual previews and permanent showroom links
  AND the Bazaar provides map and list views backed by the same current booths
  AND featured placement is presented separately below the Bazaar
  AND the process and merchant conversion sections remain concise

Scenario: Visitor uses the homepage on a narrow mobile device
  GIVEN a viewport between 320 and 390 CSS pixels wide
  WHEN the visitor opens and interacts with the homepage
  THEN navigation remains available through a compact menu
  AND schedule, showroom, and featured rails remain usable
  AND map controls and booth previews remain reachable
  AND the document has no horizontal overflow

Scenario: Tenant media is unavailable
  GIVEN a public business has no usable preview image
  WHEN its homepage card or Bazaar booth renders
  THEN an intentional branded fallback remains identifiable and clickable
  AND no empty image source is sent to the browser
```

## Quality impact

- Security and tenant isolation: no new mutations or browser-owned eligibility;
  only active public server view models are rendered.
- Privacy and data retention: generated platform artwork contains no customer or
  tenant-private information; no new tracking or storage is introduced.
- Accessibility and responsive behavior: semantic landmarks, labeled controls,
  keyboard links, visible focus, reduced motion, and 320/390px checks are
  required.
- Localization and merchant-entered values: long names, handles, industries,
  and taglines wrap or truncate without resizing fixed controls.
- Performance and limits: project assets are optimized, tenant images are
  lazy-loaded below the hero, and no WebGL or animation dependency is added.
- Failure recovery and idempotency: no data mutation occurs; existing Bazaar
  empty/list fallbacks remain authoritative.

## Observability

Existing public route and Bazaar aggregate signals remain sufficient. Do not log
visitor contact values, tenant-private content, or raw media-storage paths.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Product hierarchy and complete section order | acceptance | `tests/acceptance/app.spec.ts` homepage scenario |
| Desktop marketplace density and reference alignment | manual/browser | Playwright screenshot at 1440px |
| Mobile menu, rails, map access, and no overflow | acceptance/manual | `tests/acceptance/app.spec.ts` at 390px and 320px |
| No empty media sources or browser errors | acceptance | `tests/acceptance/app.spec.ts` console monitor |

## Rollout and rollback

This is a frontend-only replacement of the homepage composition and project
artwork. Rollback deploys the prior homepage commit; Bazaar and showroom data are
unchanged.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Implemented and verified on 2026-07-26.

Evidence:

- The public homepage now follows the approved marketplace composition with a
  photographic maker hero, server-owned daily Bazaar callout and schedule,
  searchable compact showroom rail, image-backed Bazaar floor and directory,
  separate featured-placement state, five-step process, CTA, and public footer.
- Project-owned generated artwork is stored at
  `public/landing/maker-workshop-hero.jpg` and
  `public/landing/bazaar-floor.jpg`; tenant cards continue to use tenant media.
- Manual Playwright screenshots were reviewed at 1440x1000 and 390x844 against
  the approved reference. Browser geometry checks proved document width equals
  viewport width at both 390px and 320px.
- `npm run test:acceptance` passed 9/9 against a clean production build and
  temporary database, including homepage hierarchy, mobile menu, media/console,
  and overflow assertions.
- `npm run check` passed the complete local quality, domain, security, adapter,
  revision, recipe, provider-video, and Bazaar gate.

Known limitation: the featured rail correctly remains an explicit placement
callout when no business has been administratively marked featured; it does not
invent promoted businesses to imitate the reference image.
