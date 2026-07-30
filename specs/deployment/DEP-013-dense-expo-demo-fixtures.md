---
id: DEP-013
title: Dense Expo demo fixtures
status: done
related: [FE-009, FE-010, FE-012, FE-015, BE-010, BE-011, DEP-009, DEP-010, DEP-011, DEP-012]
owners: [operations, product, design, qa]
last_updated: 2026-07-30
change_level: L2
---

# DEP-013 - Dense Expo demo fixtures

## Problem and outcome

The 28-showroom visual benchmark proves variety but spreads four businesses
across each weekday industry. It does not demonstrate how one live Expo venue
behaves with more than one full hall. The disposable local account needs a
separate high-density cohort that makes the marketplace feel occupied and
provides repeatable desktop and mobile stress evidence.

The outcome is 20 additional fictional manufacturers, production-input
suppliers, growers' suppliers, material producers, and workshop suppliers. They
use simple reviewed compositions so staff can replace their designs with AI
recipes later. Together with the retained 28 deep fixtures, reset creates 48
active public showrooms.

## Scope

### In scope

- Twenty fictional reset-only businesses with distinct identities and public
  handles.
- Three useful offerings per business spanning standard inputs, made-to-order
  production, manufacturing capabilities, and recurring production supply.
- Simple deterministic showroom compositions selected from reviewed bank 1.2
  components and foundations.
- Approved business-owned booth imagery and valid Addis Ababa Expo coordinates.
- A fixed Thursday stress occurrence with at least 24 eligible businesses, at
  least 22 in the Addis Ababa venue, and deterministic overflow from Hall 1 to
  Hall 2 under the existing 12-booth hall limit.
- Desktop, 390px, and 320px verification of hall switching, booth selection,
  complete list parity, touch controls, and absence of horizontal overflow.

### Non-goals

- Production migration, preserving local disposable rows, or creating real
  customers.
- Adding unreviewed components, custom per-business code, arbitrary media URLs,
  or changing Expo assignment and hall-capacity rules.
- Replacing the 28 authored/deep visual benchmarks or claiming the 20 stress
  fixtures are finished client designs.
- Creating login credentials for every stress business when a public showroom
  and Expo booth are sufficient for the density test.

## Contracts

- `npm run reset` is the only writer for this cohort. Existing databases are not
  silently expanded on application startup.
- Every dense-demo handle has one matching location profile, one existing booth
  asset, at least two categories, exactly three published offerings, a valid v4
  snapshot, and a retained baseline.
- The 28 DEP-011 businesses and their authored/deep benchmark assertions remain
  unchanged. Dense fixtures are counted and tested separately.
- Dense fixtures use the `machinery-tools` Expo key because the Thursday theme
  covers manufacturing, tools, and production inputs. Public copy describes
  each actual role rather than pretending every participant manufactures
  machinery.
- Expo generation remains deterministic and tenant-safe. The stress cohort
  exercises existing city-host and 12-booth hall behavior without a special
  rendering path.
- Booth assets are project-owned illustrative demo media. They contain no real
  client marks, people, addresses, claims, or credentials.
- Public media paths resolve locally and no remote fetch is introduced.

## Scenarios

```gherkin
Scenario: Reset creates a dense but bounded demo account
  GIVEN the disposable local database is empty
  WHEN the approved reset command runs
  THEN 48 active fictional showrooms are created
  AND the 20 dense-demo showrooms each have three published offerings
  AND every active business has a valid Expo profile and booth asset

Scenario: Thursday Expo fills two Addis halls
  GIVEN the reset fixtures and Thursday 2026-07-30 in Africa/Addis_Ababa
  WHEN the current Expo is generated
  THEN at least 24 businesses participate
  AND Addis Ababa hosts at least 22 booths
  AND its first hall has 12 booths
  AND its second hall contains the deterministic overflow

Scenario: Visitor switches halls on a phone
  GIVEN the Addis Ababa Expo has more than one hall
  WHEN a visitor opens the venue at 390 or 320 CSS pixels
  THEN Hall 1 and Hall 2 are touch-operable
  AND each selected hall keeps balanced booth rows and a usable aisle
  AND the page has no horizontal overflow

Scenario: List view remains complete
  GIVEN a Thursday occurrence with more booths than one hall can display
  WHEN the visitor selects List View
  THEN every active occurrence booth appears once with its stable reference
  AND every entry links to its permanent showroom
```

## Quality impact

- Security and tenant isolation: fixtures contain public fictional data only;
  no cross-tenant query or publication authority changes.
- Privacy and retention: no real people, client material, provider input, or
  credentials are stored in public assets.
- Accessibility and responsive behavior: hall tabs, booth buttons, list links,
  320px/390px overflow, and reduced motion receive browser evidence.
- Performance and limits: each hall still renders at most 12 booth nodes; list
  view represents the complete occurrence.
- Failure recovery: deleting the disposable database and rerunning reset
  restores the exact deterministic cohort.

## Test plan

| Criterion | Level | Evidence |
|---|---|---|
| 48 total and 20 separate dense fixtures | integration | `scripts/test-showroom-benchmarks.ts` |
| Catalog, offering-kind, snapshot, and media validity | integration | `scripts/test-showroom-benchmarks.ts`, `npm run check` |
| Thursday 24+/Addis 22+/two-hall density | domain/integration | `scripts/test-expo.ts` |
| Hall switch, balanced layout, list parity, and mobile overflow | browser/visual | `scripts/capture-expo-visuals.mjs`, `tests/acceptance/app.spec.ts` |
| Build, privacy, and dependency boundaries | release | `npm run release` |

## Rollout and rollback

- Rollout is local reset only. No migration or startup backfill is added.
- Existing local fixture data is disposable by explicit product-owner decision.
- Rollback reverts the fixture commit and reruns reset; no real data conversion
  is attempted.

## Evidence

Evidence: verified locally on 2026-07-30:

- `npm run reset` created 48 active fictional businesses and 165 offerings.
- `npm run test:benchmarks` proved all 20 dense fixtures, their managed heroes,
  booth assets, three-offering catalogs, valid v4 snapshots, and the Thursday
  24-booth occurrence.
- `npm run test:expo` proved deterministic 12-and-10 hall assignment for the 22
  Addis Ababa participants.
- `npm run test:expo-visual` passed nine desktop, 390px, and 320px scenarios
  with no browser, image, text, touch-target, or horizontal-overflow failures;
  it opened both halls and proved 24-entry List View parity.
- `npm run check`, `npm run test:acceptance` (10/10), and `npm run release`
  passed. The release gate included production build, HTTP smoke, output-path
  privacy, security/adapters, revision integrity, and a zero-vulnerability
  production dependency audit. No production rollout is included.
