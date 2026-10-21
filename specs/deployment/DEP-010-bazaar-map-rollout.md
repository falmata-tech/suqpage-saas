---
id: DEP-010
title: Expo geographic map rollout and operations
status: deprecated
related: [FE-010, FE-011, FE-012, FE-015, BE-011, BE-012, BE-013, BE-016, DEP-002, DEP-011, DEP-013, DEP-015]
owners: [operations, security]
last_updated: 2026-08-01
change_level: L2
---

# DEP-010 — Expo geographic map rollout and operations

Deprecated by DEP-016. No production Expo rollout occurred.

## Problem and outcome

The Bazaar map adds a public discovery route, new tables, daily time behavior,
and mobile performance risk. It must roll out without disrupting existing
showrooms, inquiries, managed requests, or the controlled single-instance pilot.

## Accepted geographic Expo rollout revision

- Apply an additive migration for city, zone, region, latitude, longitude, and
  city-host assignment while retaining legacy `bazaar_*` tables.
- Setup/reset creates at least 25 active showroom accounts. Every seeded account
  has valid Expo location data and an approved, business-specific booth image.
- Seeded businesses span seven daily Industry themes and multiple Ethiopian
  regions/cities so every deterministic day has participants and sparse groups
  exercise nearest-hub behavior.
- Store simplified, attributed Ethiopia region/zone boundaries, major roads,
  and city/town points in the application. Derive the road and place layers from
  a pinned OpenStreetMap/Geofabrik extract, record attribution and provenance,
  and never commit the source PBF. Runtime operation must not require map tiles,
  geocoding, or a third-party map API.
- Evidence covers projection, country framing, active-host framing, selector
  navigation, persistent-map city focus, surrounding geographic context,
  reversible venue reveal, dynamic venue completeness, booth selection, origin
  labels, Map/List parity, reduced motion, and no overflow at desktop, 390px,
  and 320px.
- `/expo` is canonical; `/bazaar` redirect behavior is included in smoke tests.
- Rollback deploys the prior code. Additive location columns and public assets
  may remain inert.

## Scope

### In scope

- Additive schema migration for Bazaar themes, occurrences, booth profiles, and
  booths.
- Local/reset seed data for the weekly Bazaar schedule and current booth
  generation.
- Manual generation path for the current single-instance pilot.
- Public `/bazaar` smoke and mobile browser evidence before homepage promotion.
- Cache and stale-state invalidation policy for daily rollover.
- Bounded dynamic floor verification at small, medium, and maximum visual booth
  counts, with no more than 48 storefront nodes rendered on the floor.
- Responsive-fit verification and CSS-rendered neutral tiling that changes
  surface treatment without encoding booth count or placement.
- Visual verification that neutral mall tiles, thin edges, and simple corridors
  remain legible at desktop and mobile sizes without lounge/furniture props.
- Browser verification that booth references match across Map View, preview,
  directory, and List View.
- Complete Bazaar List verification when eligible participation exceeds the
  visual floor cap.
- Rollback boundary for code and additive data.

### Non-goals

- Production launch of paid featured placements.
- Multi-instance cron coordination or queue infrastructure.
- External analytics provider integration.
- Production data-destructive migration.
- Replacing the existing homepage before the Bazaar route passes evidence.

## Domain language and invariants

- **Rollover:** the operation that resolves the platform day, creates or updates
  the active occurrence, generates booths, and publishes that occurrence.
- **Platform timezone:** the configured timezone used for daily Bazaar
  boundaries; browser clocks are advisory only.
- Rollover is safe to run manually more than once.
- A failed rollover must not mark stale data as newly live.

## Contracts

- Local and test environments may create current Bazaar data lazily on read.
- Production should run a manual or scheduled `ensureCurrentBazaar` operation at
  or shortly after the configured 4:00 AM boundary before the homepage promotes
  Bazaar content.
- `/api/health` remains independent from Bazaar availability; Bazaar-specific
  failures are surfaced in public empty/unavailable states and safe logs.
- Deployment gates include `npm run validate:specs`, `npm run typecheck`,
  `scripts/test-bazaar.ts`, and a Playwright mobile scenario.

## Scenarios

```gherkin
Scenario: Bazaar migration deploys additively
  GIVEN an existing controlled-pilot database
  WHEN the Bazaar migration runs
  THEN existing businesses, products, inquiries, requests, and revisions remain
  readable
  AND Bazaar tables can be created without destructive data movement

Scenario: Manual rollover is retried
  GIVEN today's Bazaar generation partially or previously succeeded
  WHEN an operator reruns the generation command
  THEN duplicate occurrences and booths are not created
  AND the active public route remains consistent

Scenario: Public homepage is not promoted too early
  GIVEN /bazaar lacks mobile browser evidence
  WHEN the release is prepared
  THEN the homepage may keep a simple link or omit Bazaar promotion
  AND existing showroom discovery remains available
```

## Quality impact

- Security and tenant isolation: migration and generator never expose private
  tenant data or credentials in logs.
- Privacy and data retention: Bazaar data references public showroom records and
  public media paths only.
- Accessibility and responsive behavior: release evidence includes 320px and
  390px browser checks.
- Localization and merchant-entered values: rollout does not require changing
  existing merchant-entered content.
- Performance and limits: production promotion requires bundle/build evidence
  and no WebGL/large animation dependency. The interactive floor renders at most
  48 storefronts while the semantic list remains complete.
- Failure recovery and idempotency: generation and migrations are rerunnable;
  rollback leaves existing features unaffected.

## Observability

Safe release evidence records migration version, generation status, occurrence
ID, theme slug, booth count, empty/unavailable status, and browser viewport
checks. Do not store screenshots containing private dashboard data as public
evidence.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Additive migration and rollback boundary | operations | `scripts/test-operations.mjs`, `scripts/test-bazaar.ts` |
| Manual/lazy rollover idempotency | integration | `scripts/test-bazaar.ts` |
| Public mobile route evidence | acceptance | `tests/acceptance/app.spec.ts` |
| Dynamic geometry and visual floor cap | integration/acceptance | `scripts/test-bazaar.ts`, `tests/acceptance/app.spec.ts` |
| Existing check gate remains green | release | `npm run check` |
| Local geographic assets are bounded, attributed, and provider-free at runtime | operations/browser | `public/geo/ATTRIBUTION.md`, `scripts/capture-expo-visuals.mjs` |
| City selection preserves geographic context and opens one complete responsive venue | browser/acceptance | `scripts/capture-expo-visuals.mjs`, `tests/acceptance/app.spec.ts` |
| Venue close reverses the reveal without remounting a separate map surface | acceptance | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

Run a normal backup before applying migrations in any data-important
environment. Deploy `/bazaar` as the first public surface, validate mobile
browser evidence, then add stronger homepage promotion in a follow-up. Rollback
is code rollback to the previous version; additive Bazaar tables may remain
unused until a later verified rollout.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Prior floor evidence (superseded)

Implemented locally on 2026-07-26 as an additive pilot rollout slice. Migration
15 creates Bazaar tables without destructive data movement. Reset/setup seeds
the default weekly schedule and booth profiles. Acceptance uses
`SUQPAGE_BAZAAR_NOW` to keep the mobile Sunday Bazaar browser evidence
deterministic.

Evidence:

- `npm run validate:specs`
- `npm run typecheck`
- `npm run test:bazaar` passed small and maximum visual-floor geometry, the
  48-storefront cap, seven list-only overflow participants, and grounded
  automatic/manual placement. Small-count evidence includes centered 2x2 and
  3+2 arrangements; maximum evidence uses seven balanced rows.
- `npm run test:acceptance` passed 9/9, including mobile corridor-grounding and
  document-overflow checks at 390px and 320px, responsive initial floor fitting,
  unobstructed booth selection, Map View/List View labels, matching booth
  references, and bounded filtered showroom-card width.
- `npm run check`

Known limitation: no remote checks, production backup/restore run, or scheduled
4:00 AM production job evidence has been collected. The route is locally ready
for testing; production promotion still requires the normal operator rollout.

## Completion evidence

The local Expo rollout slice was implemented and verified on 2026-07-29.
Migration 17 is additive; setup/reset creates 48 showroom profiles with valid
booth media and city, zone, region, and WGS84 locations across seven daily
Industries. Twenty of those are reset-only dense-demo fixtures governed by
`DEP-013`. Attributed Admin-1/Admin-2 boundaries, selected OSM place labels,
and restrained OSM-derived major-road corridors are stored locally, so runtime
requires no map provider, map tiles, geocoder, or map server.

Evidence: `npm run test:expo`, `npm run test:expo-visual`,
`npm run test:acceptance` (10/10), `npm run check`, and `npm run release`
passed. The release gate included production build, HTTP smoke, output-path
privacy, security/adapters, migration-history integrity, and a zero-vulnerability
production dependency audit. No production deployment, remote checks, or
data-preserving rollout was requested or performed.
