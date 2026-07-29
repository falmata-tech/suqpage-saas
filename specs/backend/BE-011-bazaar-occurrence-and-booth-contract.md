---
id: BE-011
title: Expo occurrence, regional hub, and booth contract
status: done
related: [FE-010, FE-012, FE-015, BE-012, BE-013, DEP-010, DEP-011, BE-001]
owners: [backend, security]
last_updated: 2026-07-29
change_level: L2
---

# BE-011 — Expo occurrence, regional hub, and booth contract

## Problem and outcome

The Bazaar map cannot be a trustworthy product surface if the browser invents
which businesses appear or where booths belong. The backend must own active
Bazaar resolution, eligibility, deterministic booth placement, public preview
data, and safe failure behavior while preserving each business's permanent
showroom as the authoritative destination.

## Accepted geographic Expo revision

This section supersedes the floor/corridor placement rules retained below as
evidence of the previous implementation.

- Public product language is **Expo**. Legacy `bazaar_*` SQLite identifiers may
  remain internal during this additive migration.
- Participation requires an active showroom, a matching Industry key, an
  approved non-empty booth image path, a city, a region, valid WGS84 latitude
  and longitude, and no administrative exclusion. Hero and logo media do not
  satisfy the booth-image requirement.
- Today's eligible businesses are grouped by their true region. During the
  pilot, a region with at least two eligible businesses creates an Expo hub.
  The threshold is an explicit domain constant that may increase with scale.
- A region with one eligible business joins the geographically nearest
  active hub using great-circle distance. If no region reaches two, the
  largest group becomes the first hub; ties use normalized region name.
- Assignment moves the occurrence booth, not the represented business:
  previews and lists always display the business's real city and region and
  identify the regional hub serving it.
- Hub assignments are computed server-side and remain stable for the occurrence.
  A hall contains at most 12 booths; overflow creates another hall at the same
  hub rather than hiding participants.
- Booth references use `H{hub-number}.{hall-number}-B{booth-number}` and remain
  unique and consistent in map, preview, and list surfaces.
- A generic named booth may render only as resilience when an approved file
  becomes unavailable. It does not make an incomplete profile eligible.

```gherkin
Scenario: Sparse region joins its nearest active Expo hub
  GIVEN one represented region has fewer than two eligible businesses
  AND at least one other represented region has two eligible businesses
  WHEN today's occurrence is generated
  THEN the sparse group joins the nearest active regional hub
  AND every booth retains its true origin city and region
  AND regenerating the same occurrence preserves the assignment

Scenario: Missing booth media or location prevents participation
  GIVEN an active showroom has matching Industry data
  WHEN its booth image, city, region, latitude, or longitude is missing or invalid
  THEN it receives no active Expo booth
  AND it remains available through its permanent showroom
```

## Scope

### In scope

- Configurable Bazaar themes with weekday, timezone-aware start time, active
  flag, icon, and mapped industry/category keys.
- Server-owned active Bazaar occurrence for the configured platform timezone.
- Idempotent generation or retrieval of today's occurrence and booths.
- Eligible showroom selection from active public businesses only.
- Deterministic booth placement persisted or resolved consistently per
  occurrence.
- Dynamic floor geometry derived from the bounded visual booth count, with
  grounded storefront rows, an attached corridor for every row, and a 48-booth
  visual cap.
- Automatic column count is the ceiling of the square root of the visible booth
  count, bounded by the visual maximum. Each incomplete row is centered inside
  the same computed floor width.
- Each floor booth receives a derived occurrence reference in `R{row}-{number}`
  format. Numbers are assigned left-to-right per row, remain unique in the
  returned occurrence view, and are not tenant identity or persisted showroom
  data.
- Complete list participation even when eligible businesses exceed the visual
  floor cap.
- Booth preview data derived from business, catalog/category, hero, logo, and
  approved booth profile fields.
- Basic featured priority and exclusion fields sufficient for the first map.
- Read-only public application functions for current Bazaar, booths, and list.

### Non-goals

- Paid billing, sponsorship auctions, external ad platforms, or campaign billing.
- Multi-instance scheduler coordination beyond the current single-instance
  controlled pilot.
- Merchant self-service booth approval workflow in the first map slice.
- Full-text external search service.
- Removing or weakening existing public showroom, inquiry, or revision rules.

## Domain language and invariants

- **BazaarTheme:** a configured weekday theme that maps one or more public
  category/industry keys to a daily Bazaar.
- **BazaarOccurrence:** one calendar occurrence of a theme in the platform
  timezone, with start/end boundaries and status.
- **BazaarBoothProfile:** optional showroom-level booth image/fallback metadata.
- **BazaarBooth:** occurrence-specific booth with one showroom, status, featured
  flag, and stable floor coordinates.
- One occurrence per theme/date is canonical.
- Rerunning generation for the same occurrence must not duplicate booths.
- Active booth data must never include draft or suspended businesses.
- A booth may be excluded without changing the underlying showroom status.
- Automatic coordinates are bounded positive numbers inside the computed floor.
- Automatic placements may reflow when participation changes; a booth moved by
  an administrator is explicitly marked manual, remains attached to a corridor
  edge, and is not silently reflowed.
- At most 48 booths are marked for the visual floor; all remaining active booths
  remain present in the authoritative Bazaar List view.

## Contracts

Application functions:

```ts
getCurrentBazaar(clock?: Clock): CurrentBazaarView
ensureCurrentBazaar(clock?: Clock): BazaarGenerationResult
listCurrentBazaarBooths(occurrenceId: string): BazaarBoothView[]
```

Public view data:

```ts
type CurrentBazaarView = {
  occurrenceId: string;
  themeName: string;
  themeSlug: string;
  status: "live" | "empty" | "unavailable";
  startsAt: string;
  endsAt: string;
  timezone: string;
  floor: {
    width: number;
    height: number;
    columns: number;
    rows: number;
    visibleBoothCount: number;
    totalBoothCount: number;
    maxBooths: 48;
  };
  booths: BazaarBoothView[];
};

type BazaarBoothView = {
  floorRow: number | null;
  boothReference: string | null;
  onFloor: boolean;
};
```

Database changes are additive and idempotent. Names may adapt to existing SQLite
style, but must preserve the domain invariants above.

## Scenarios

```gherkin
Scenario: Current Bazaar generation is idempotent
  GIVEN an active weekday Bazaar theme and eligible active businesses
  WHEN the current Bazaar generator runs twice for the same platform day
  THEN exactly one current occurrence exists
  AND each eligible showroom has at most one active booth in that occurrence
  AND stable booth coordinates do not change between runs

Scenario: Suspended showroom is excluded from public booth data
  GIVEN a suspended business mapped to today's Bazaar theme
  WHEN public Bazaar data is requested
  THEN no booth or preview for that business is returned

Scenario: Showroom has no booth image
  GIVEN an eligible active showroom without an approved booth image
  WHEN its booth view is built
  THEN the view includes a deterministic fallback token
  AND no private or missing media path is exposed

Scenario: No theme is configured for today
  GIVEN no active theme matches the current platform weekday
  WHEN current Bazaar data is requested
  THEN the response is unavailable or empty with a safe public message
  AND no stale occurrence is presented as live

Scenario: Eligible count exceeds the visual floor cap
  GIVEN more than 48 active businesses are eligible for today's Bazaar
  WHEN current Bazaar data is requested
  THEN exactly 48 booths are marked for floor rendering
  AND every eligible business remains in the Bazaar List payload
  AND computed floor dimensions remain within the configured maximum geometry

Scenario: Square participant counts produce square automatic layouts
  GIVEN the visual floor contains four, nine, or sixteen booths
  WHEN floor geometry is computed
  THEN the floor uses 2, 3, or 4 columns respectively
  AND every incomplete final row is centered within the floor

Scenario: Booth references follow computed placement
  GIVEN active floor booths have deterministic row and x coordinates
  WHEN the current Bazaar view is created
  THEN each floor booth receives a unique row/booth reference ordered by x
  AND list-only participants receive no misleading floor reference
```

## Quality impact

- Security and tenant isolation: public selectors filter `businesses.status =
  'active'`; admin mutation later requires platform capability.
- Privacy and data retention: public previews expose only visible showroom
  fields and public media URLs.
- Accessibility and responsive behavior: backend returns stable dimensions and
  fallback labels so the frontend can reserve layout space.
- Localization and merchant-entered values: names, categories, and descriptions
  remain merchant-entered text and are escaped by React renderers.
- Performance and limits: queries are indexed by occurrence, theme, status, and
  business; list functions support bounded public payloads.
- Failure recovery and idempotency: generation uses uniqueness constraints and
  transactions to avoid duplicate current state.

## Observability

Record safe audit or metric fields for generator result, occurrence ID, theme
slug, eligible count, created booth count, excluded count, and failure category.
Never log private request content, contact details, or raw uploaded file bytes.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Idempotent occurrence and booth generation | integration | `scripts/test-bazaar.ts` |
| Active-only public data and exclusion handling | security/integration | `scripts/test-bazaar.ts`, `scripts/test-security.ts` |
| Deterministic dynamic placement bounds and no-media fallback | unit/integration | `scripts/test-bazaar.ts` |
| Visual cap preserves complete list participation | integration | `scripts/test-bazaar.ts` |
| Near-square columns and centered incomplete rows | integration | `scripts/test-bazaar.ts` |
| Unique derived row/booth references | integration | `scripts/test-bazaar.ts` |
| Current Bazaar unavailable state | integration | `scripts/test-bazaar.ts` |

## Rollout and rollback

Apply additive SQLite migrations after a normal backup. The first release may
seed default weekly themes from setup/reset data. Rollback deploys the previous
application version; Bazaar tables are not authoritative for existing showroom,
inquiry, or revision workflows and may remain unused.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Prior floor evidence (superseded)

Implemented on 2026-07-26 with additive schema migration 15, `lib/bazaar.ts`,
default theme/profile seeding, active occurrence resolution, idempotent booth
generation, participant-count-derived floor geometry, corridor-grounded
coordinates, active-only public booth data, no-media fallback tokens, exclusion
refresh, featured priority, and a 48-storefront visual cap.

Automatic geometry uses the bounded ceiling square root for its column count,
centers incomplete rows, and remains deterministic across occurrence refreshes.
The returned floor view derives unique left-to-right `R{row}-{number}` references
without changing persisted showroom identity or assigning references to
list-only overflow participants.

Evidence:

- `npm run validate:specs`
- `npm run typecheck`
- `npm run test:bazaar` passed automatic reflow, grounded manual placement,
  invalid floating placement rejection, centered 2x2 and 3+2 arrangements, and
  the 55-participant cap scenario with 48 unique floor references and seven
  reference-free list-only participants.
- `npm run test:acceptance` passed 9/9.
- `npm run check`

Known limitation: public data is backed by SQLite/default config only. External
media approval and paid-placement providers remain outside this local contract.

## Completion evidence

The geographic Expo revision was implemented and verified on 2026-07-29.
Migration 16 adds profile location fields and stable occurrence hub assignments.
`lib/expo.ts` owns eligibility, Haversine nearest-hub assignment, two-business
pilot hubs, 12-booth halls, and unique `H{hub}.{hall}-B{booth}` references.

Evidence: `npm run test:expo`, `npm run test:bazaar`, `npm run check`,
`npm run test:acceptance` (10/10), and `npm run release` all passed. Missing
booth media/location exclusion, nearest-hub assignment, hall overflow,
occurrence stability, active-only data, and existing request/revision integrity
are covered.
