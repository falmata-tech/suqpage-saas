---
id: FE-028
title: Producer story and scalable venue art direction
status: done
related: [FE-021, FE-024, FE-025, FE-027]
owners: [product, frontend, design]
last_updated: 2026-08-04
change_level: L1
---

# FE-028 - Producer story and scalable venue art direction

## Problem and outcome

The public story is earnest but generic, and the virtual City Showroom and Expo
floors still resemble white diagrams inside gray frames. MirtPage needs concise,
adult language with a clear point of view, plus inviting top-down venues that
feel designed without becoming busy or tying booth placement to a static image.

## Scope

### In scope

- Rewrite homepage, discovery, About, signup, login support, footer, and metadata
  with a sharper producer-and-buyer narrative.
- One optimized architectural floor texture used as a decorative material, not
  as business or location data.
- Distinct Expo and City Showroom art direction with landscaped entry plazas,
  restrained flower planters, clear circulation, dimensional edges, and quiet
  neutral surfaces.
- A cohesive architectural hall shell with real walls, glass entrance,
  integrated planting, lighting, and reception architecture around a quiet
  open floor.
- Automatic rectangular booth/shop circulation around the four sides of the
  hall, preserving an empty central court as the perimeter expands.
- Dynamic floor dimensions and computed booth/shop placement for every result.
- Desktop, 390px, and 320px browser review of both venues.

### Non-goals

- Fixed booth positions embedded in artwork, people, photorealistic business
  claims, physical-venue claims, halls, pagination, or new runtime dependencies.
- Dense props, decorative animation, parallax, or effects that reduce text,
  booth, map, or control legibility.
- Changing eligibility, clustering, Expo scheduling, redaction, inquiry, or
  publication behavior.

## Domain language and invariants

- Venue artwork is decorative presentation. Computed layout remains the sole
  authority for floor dimensions and business placement.
- Every business remains reachable on one continuous floor as the count grows.
- Expo and City Showroom are virtual discovery spaces, not physical locations.
- Producer-facing copy may be confident and emotional, but it must still avoid
  unverified claims and guaranteed outcomes.

## Contracts

- The home story states a memorable reason to use MirtPage in no more than one
  headline and one short supporting paragraph before discovery.
- About connects the risk and discipline of local production to the practical
  visibility problem, then names MirtPage's showroom, map, and inquiry value.
- Signup tells producers what MirtPage will create and who it helps them reach.
- The floor texture contains no people, booths, logos, text, or fixed
  circulation plan and can repeat or scale without exposing false information.
- Expo and City floors use different surface accents while sharing the same
  quiet architectural material and navigation behavior.
- Landscaped decoration stays behind interactive cards, remains outside their
  placement cells, ignores pointer events, and does not expand the DOM with the
  business count.
- Venue artwork contains no seating, people, businesses, booths, claims, or
  interaction. Its architecture and props form one visual system rather than
  disconnected CSS ornaments.
- Every booth/shop position is computed on the rectangular perimeter. The
  central court remains empty at every supported business count, and adding
  businesses never changes the architectural image or assigns two businesses
  to one position.
- Floor stage and venue edges read as intentional architectural context rather
  than a thick frame or empty gray area.
- At 320px and 390px, controls remain at least 44px, venue cards remain legible,
  panning remains smooth, and the document has no horizontal overflow.
- Reduced-motion preference continues to disable animated floor transitions.

## Scenarios

```gherkin
Scenario: Visitor understands the MirtPage point of view
  GIVEN the public homepage or About page is open
  WHEN the visitor reads the primary story
  THEN local production is presented as a serious investment in Ethiopia
  AND MirtPage's practical discovery value is clear without generic slogans

Scenario: Expo grows without losing its setting
  GIVEN any positive number of eligible Expo booths
  WHEN the floor layout is calculated
  THEN every booth receives one computed position on the continuous floor
  AND the floor material, entry plaza, planters, and circulation scale without
  encoding a fixed booth count

Scenario: City cluster opens on a phone
  GIVEN a city gateway represents multiple businesses
  WHEN a visitor opens it at 320 or 390 CSS pixels
  THEN the virtual City Showroom reads as an inviting landscaped market court
  AND all shops, controls, close behavior, pan, and zoom remain usable
```

## Quality impact

- Security and tenant isolation: no data or authorization changes.
- Privacy and data retention: generated texture contains no people or business
  information and introduces no tracking.
- Accessibility and responsive behavior: decoration is hidden from assistive
  technology and pointer interaction; existing control names and sizes remain.
- Localization and merchant-entered values: shorter platform copy only; client
  content remains unchanged.
- Performance and limits: one optimized local image, CSS-only decoration, and a
  constant number of decorative nodes; no external runtime request.
- Failure recovery and idempotency: a missing texture falls back to CSS surface
  colors without affecting venue data or interaction.

## Observability

No new events. Existing browser error, overflow, booth-count, and control-size
evidence remains authoritative.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Producer narrative and overclaim boundaries | contract | `scripts/test-platform-narrative.mjs` |
| Dynamic layout and venue decoration invariants | contract | `scripts/test-discovery.ts` |
| Expo and City desktop/mobile appearance and interaction | browser/manual | `scripts/capture-discovery-visuals.mjs` |
| Complete public and tenant regressions | browser | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

No migration. Rollback restores the previous copy, component markup, CSS, and
decorative texture; discovery data and floor positions remain compatible.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Evidence: completed locally on 2026-08-04:

- `npm run check` passed the complete specification, runtime, security,
  persistence, media, discovery, showroom, recipe, and regression gate.
- `npm run test:acceptance` passed all 10 ordered production-browser workflows,
  including responsive discovery, continuous Expo behavior, City Showroom
  interaction, CSP, and provider video.
- `npm run test:discovery-visual` passed at 1440px, 390px, and 320px with no
  document overflow, complete booth/shop counts, usable 44px-or-larger mobile
  controls, and working showroom previews.
- The final architectural-shell implementation passed `npm run check` and a
  fresh `npm run test:discovery-visual` on 2026-08-04. Focused geometry tests
  cover 1, 5, 10, 11, 20, and 37 businesses with one unique non-overlapping
  perimeter position per business and an untouched central court.
- Reviewed final captures show the complete enclosed hall at desktop, 390px,
  and 320px. The responsive overview preserves the entrance, reception,
  integrated perimeter planting, four-sided business circulation, zoom/pan,
  and empty center.
- Reviewed captures in `/tmp/mirtpage-discovery-visuals/` confirm the Expo and
  City Showroom use a quiet architectural floor, restrained planted focal
  points, readable dynamic cards, and pannable mobile layouts without encoding
  businesses or booth positions in the decorative image.
