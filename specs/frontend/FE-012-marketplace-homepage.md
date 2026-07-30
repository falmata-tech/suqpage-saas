---
id: FE-012
title: Visual marketplace homepage
status: done
related: [FE-001, FE-010, FE-013, FE-015, BE-011, DEP-010, DEP-011, DEP-013]
owners: [product, frontend]
last_updated: 2026-07-29
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

## Accepted Expo-led landing revision

This revision replaces the previous mall-floor composition.

- The page serves growers, producers, and small, medium, or large manufacturers
  with one clear promise: a permanent virtual showroom plus participation in a
  rotating daily Industry Expo that creates direct inquiry opportunities.
- The order is compact header, showroom-and-Expo hero, concise benefit strip,
  full-width Live Expo workspace with its weekly Industry calendar directly
  above the map, one searchable showroom directory, strong merchant closing
  action, and footer.
- The Expo workspace is visually native to the page: the same restrained
  purple/ink/white palette, shared controls, aligned containers, and no detached
  promotional card around the map.
- The seven-day calendar is a compact dark-purple rail within the Expo
  workspace, not a second full-height chapter. It keeps the current day clearly
  highlighted, scrolls horizontally on narrow screens, and uses one concise
  supporting sentence instead of another large section title.
- The showroom directory owns search, Industry pills, featured emphasis, and
  five-result pagination. Featured is a badge and ranking signal, not a second
  repeated business catalog.
- Desktop and mobile expose direct regional-hub navigation. Mobile uses compact
  app navigation for Expo, Showrooms, and Join while preserving normal document
  scrolling and landing-page context.
- Copy explains that Expo themes change daily and regional hubs appear wherever
  eligible businesses are represented. It must not imply checkout, guaranteed
  buyers, or physical relocation of participating businesses.
- Section surfaces use crisp white, ink, soft neutral, and bounded purple roles
  with clear contrast. Busy textures, floating cards, and repeated identical
  section geometry are excluded.

```gherkin
Scenario: Landing page feels like one public product
  GIVEN active showrooms and multiple regional Expo hubs
  WHEN a visitor moves from the hero into the Live Expo and showroom search
  THEN shared navigation, palette, spacing, and terminology connect the sections
  AND no duplicate featured inventory or detached map promotion appears
  AND the final action clearly invites a producer to request a showroom
```

## Scope

### In scope

- A compact public header with desktop navigation and an accessible mobile menu.
- A photographic maker hero with showroom-first copy, one merchant action, four
  compact product benefits, and a secondary live-Bazaar card.
- A seven-day calendar rail directly above today's Expo map with the
  server-selected day clearly highlighted.
- A visually prominent All Showrooms section above the Bazaar with search,
  industry pills, restrained sorting, five-result pagination, and permanent
  showroom links.
- A rich, code-rendered Bazaar floor backed by the existing server-owned current
  Bazaar view, including balanced centered storefront rows, responsive floor
  fitting, restrained mall tiles, simple corridors, map/list controls, booth
  references, booth selection, and showroom links.
- A separate auto-advancing featured-business rail and a visually distinct,
  full-width merchant closing panel followed by a complete public footer.
- Approved, project-owned maker and storefront imagery that carries the visual
  hierarchy shown in the reference mockup without turning the floor into a
  fixed marketplace photograph or duplicating tenant content.

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
  Bazaar participation. Until administrative curation is needed, every active
  public showroom belongs to the featured pool, which is capped at 20 entries.
- Every business card and booth preview links to its authoritative `/@handle`.
- Public business and Bazaar data comes from existing active server records.

## Contracts

- The homepage server component supplies active businesses and the current
  Bazaar view; client components may filter or change display mode but do not
  determine eligibility.
- The desktop composition follows the approved order: header, hero, concise
  benefits, one Expo workspace containing calendar then map, All Showrooms,
  final CTA, footer. There is no separate schedule chapter, process section, or
  How it works action.
- Desktop content uses the available viewport deliberately and presents showroom
  cards as a compact horizontal marketplace rail rather than full-page previews.
- At 320px and 390px, controls wrap or scroll intentionally, key copy remains
  readable, interactive targets remain usable, and the document has no
  horizontal overflow.
- The directory exposes one filtering vocabulary: horizontally scrollable
  Industry pills headed by **All industries**. It does not expose category
  filters, a duplicate reset/navigation row, or a category selector.
- Directory search includes business, handle, product, and industry terms. Each
  page renders at most five cards; changing search or Industry resets to page
  one, and pagination appears only when the matching count exceeds five.
- Desktop showroom results use stable auto-filled tracks so filtering to one or
  two businesses never stretches a card across the available section width.
- The color system uses one platform accent plus semantic status colors; schedule
  marks, filters, callouts, and map furniture must not create a busy rainbow.
- The hero's compact benefit row carries the useful product explanation without
  duplicating it in a separate process band, especially on mobile.
- The featured pool contains at most 20 active public showrooms. Up to five are
  visible at once, the rail advances left on a bounded interval and loops, and
  automatic movement pauses for hover, keyboard focus, document visibility,
  and reduced-motion preference.
- The final merchant CTA is a larger, visually distinct closing band rather than
  a repeat of the featured section.
- Generated storefront media is assigned only to its seeded showroom profile and
  contains no factual text claims; future showrooms use their approved booth
  media or an intentional grounded storefront fallback.

## Scenarios

```gherkin
Scenario: Visitor understands the product hierarchy
  GIVEN active public showrooms and a configured daily Bazaar
  WHEN a visitor opens the homepage
  THEN the first viewport presents the permanent showroom value proposition
  AND today's Bazaar appears as a secondary live discovery card
  AND the weekly calendar appears immediately before the map inside one Expo workspace

Scenario: Visitor browses the complete marketplace composition
  GIVEN the homepage has active public businesses
  WHEN the visitor moves through the page
  THEN showroom cards use compact visual previews and permanent showroom links
  AND the Bazaar provides map and list views backed by the same current booths
  AND up to five directory results appear per page beneath one Industry pill row
  AND featured businesses rotate separately below the Bazaar
  AND a distinct merchant conversion band provides the final page action

Scenario: Visitor refines a large showroom directory
  GIVEN more than five active public showrooms
  WHEN the visitor searches, chooses an Industry, or changes pages
  THEN no more than five matching showroom cards render at once
  AND search or Industry changes return the visitor to the first result page
  AND category controls and duplicate all-business navigation are absent

Scenario: Visitor uses the homepage on a narrow mobile device
  GIVEN a viewport between 320 and 390 CSS pixels wide
  WHEN the visitor opens and interacts with the homepage
  THEN navigation remains available through a compact menu
  AND the horizontally scrollable calendar and showroom pagination remain usable
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
| Product hierarchy and simplified section order | acceptance | `tests/acceptance/app.spec.ts` homepage scenario |
| Industry-only filtering and five-result pagination | focused/acceptance | homepage domain and acceptance scenarios |
| Featured pool cap, loop policy, and reduced motion | focused/acceptance | homepage domain and acceptance scenarios |
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

## Prior floor evidence (superseded)

Implemented and verified on 2026-07-26.

Evidence:

- The public homepage now combines a photographic showroom-first hero,
  server-owned daily Bazaar callout and schedule, Industry-only showroom
  discovery, the dynamic Bazaar map/list, a rotating featured rail, a distinct
  merchant closing band, and the public footer. The superseded process section,
  How it works links, category controls, and duplicate directory actions are
  absent.
- Project-owned generated artwork is stored at
  `public/landing/maker-workshop-hero.jpg` and the four seeded facade files in
  `public/landing/booths/`. The mall floor is CSS-rendered and contains no booth
  geometry or tenant claims. Future tenants without approved media receive a
  structural storefront fallback rather than an invented product photograph.
- `lib/marketplace-home.ts` enforces a five-result directory page and a 20-entry
  featured pool. Search and Industry changes return to page one; pagination is
  conditional. The featured rail advances every 4.5 seconds, loops through a
  duplicate visual track, remains touch-scrollable, and pauses for hover, focus,
  hidden documents, and reduced-motion preference.
- Desktop showroom cards retain a 280px maximum, so sparse filtered results stay
  compact. The closing band uses a separate dark surface and larger message,
  while the hero's four compact benefits retain the useful product explanation.
- Manual Playwright screenshots were reviewed at 1440px and 390px against the
  approved reference. Browser geometry checks proved document width equals the
  viewport width at both 390px and 320px and storefront thresholds meet their
  generated corridor.
- `npm run test:marketplace-home` passed pagination boundaries and featured-pool
  limits. `npm run test:acceptance` passed 9/9 against a clean production build
  and temporary database, including Industry-only controls, the five-card
  boundary, timed featured movement, simplified hierarchy, mobile overflow,
  mall-map references, and all existing stateful workflows.
- `npm run check` passed the complete local quality, domain, security, adapter,
  revision, recipe, provider-video, Bazaar, and homepage gate.

## Completion evidence

The Expo-led landing revision was implemented and verified on 2026-07-29. The
current order is producer-first photographic hero, concise benefits, integrated
regional Expo workspace with its compact weekly Industry calendar directly
above the map, one searchable five-result showroom directory, a distinct
merchant CTA, and footer. There is no detached schedule chapter. Forty-eight
seeded showrooms provide real page density without duplicate featured inventory;
20 are intentionally simple dense-demo fixtures for high-volume Expo and
directory testing.

The repeatable `npm run test:expo-visual` audit passed at 1440px, 390px, and
320px with no browser, image, text, touch-target, or page-overflow failures.
It also proves calendar-before-map order inside one Expo section and the
persistent map-to-venue transition. `npm run test:marketplace-home`,
`npm run test:acceptance` (10/10), `npm run check`, and `npm run release`
passed.
