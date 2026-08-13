---
id: DEP-017
title: Local geography and public onboarding rollout
status: done
related: [FE-021, FE-024, BE-020, BE-023, DEP-003, DEP-015, DEP-016, DEP-020, ADR-0011]
owners: [deployment, operations, security, qa]
last_updated: 2026-08-01
change_level: L3
---

# DEP-017 - Local geography and public onboarding rollout

## Problem and outcome

Richer geographic context must not create a runtime dependency on a free public
tile server, and public account creation needs an observable rollback boundary.
The outcome is a reproducible, attributed local map-data build plus a guarded
self-service onboarding release.

## Scope

### In scope

- A documented offline build from a dated Ethiopia OpenStreetMap extract.
- Property-reduced and simplified local roads/places suited to country and
  bounded regional zooms on mobile.
- Source date, transformation command, ODbL attribution, and asset-size checks.
- No raw national PBF, personal contributor metadata, or build scratch files in
  the application image or Git history.
- Signup endpoint rate-limit, audit, backup/restore, browser, and release gates.
- Compatibility for existing admin invitation onboarding and `/request` links.
- Browser and release gates for weekly Daily Featured selection, deep exact-coordinate
  cluster expansion, and server-bounded List pagination.
- Desktop/390px/320px gates for counted city gateways and one continuous,
  map-backed, touch-pannable virtual City Showroom floor.
- Desktop/390px/320px gates for one continuous Daily Featured floor, non-today anonymous
  booth outlines, the timed return to distinctly highlighted today, and
  zoom-end geographic rendering without device stalls.

### Non-goals

- Hosting a public general-purpose tile, routing, Overpass, or geocoding service.
- Automatic OSM replication updates or map data claiming navigational accuracy.
- Production launch, destructive customer migration, payment integration, or
  automatic publication.

## Domain language and invariants

- Geography is refreshed intentionally from a dated source and committed only
  after visual, size, attribution, and mobile checks.
- Visitor browsers fetch only same-origin static map assets.
- Raw extracts and temporary exports live outside the repository.
- Public signup can be disabled independently without breaking login,
  invitations, existing client workspaces, public discovery, or showrooms.

## Contracts

- The geography build records source URL/date and emits deterministic GeoJSON
  containing only required geometry and public map labels/classification.
- CI/release rejects missing geography, invalid GeoJSON, missing attribution,
  oversized public assets, or unauthenticated signup regressions.
- Deployment remains one Node application instance with persistent SQLite/media
  until the separate managed PostgreSQL program is complete.

## Scenarios

```gherkin
Scenario: Visitor uses the richer map without a map provider
  GIVEN the application is deployed with local geography assets
  WHEN a visitor pans and zooms the marketplace
  THEN every geography request is same-origin
  AND no browser request is sent to OpenStreetMap, Overpass, OSRM, or a tile host

Scenario: Public signup is rolled back
  GIVEN signup causes an operational issue
  WHEN the signup route is disabled or the prior build is restored
  THEN existing login, invitations, requests, discovery, and showrooms continue
  AND already-created draft businesses remain private for staff review
```

## Quality impact

- Security and tenant isolation: L2 security tests plus public abuse controls.
- Privacy and data retention: metadata-stripped source extract; no raw request
  payloads or credentials in logs/build output.
- Accessibility and responsive behavior: browser and visual gates at desktop,
  390px, and 320px.
- Localization and merchant-entered values: UTF-8 OSM labels preserved only
  where display-safe and bounded.
- Performance and limits: explicit static asset budgets and zoom-tiered layers.
- Failure recovery and idempotency: additive data, disable/rollback path, and
  existing backup/restore evidence.

## Observability

Monitor safe signup result codes, rate-limit events, map-asset failures, public
request latency, and client-side errors. Exclude credentials, contacts, request
text, session tokens, IP addresses, and raw geographic source metadata.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Deterministic local geography and asset budget | operations | `scripts/test-discovery-geography.mjs` |
| No remote map runtime requests | browser | `tests/acceptance/app.spec.ts` |
| Weekly selector, Daily Featured floor/redaction, city gateway/floor, exact pins, bounded List pages | integration/browser | `scripts/test-discovery.ts`, `tests/acceptance/app.spec.ts` |
| Signup backup/restore and security | operations/security | `scripts/test-operations.mjs`, `scripts/test-signup.ts` |
| Production build and HTTP surface | release | `npm run release` |

## Rollout and rollback

Run local reset, focused integration/security tests, visual captures, complete
check, acceptance, and release. No production rollout is included. Rollback uses
the preceding app build; local map assets and private draft signup records are
additive and harmless when unused.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Evidence

Evidence: completed locally on 2026-08-01. Desktop, 390px, and 320px captures
prove one bounded transformed Daily Featured floor, anonymous future outlines, complete
today booths, persistent Today emphasis, touch-sized controls, enriched City
Showroom/Daily Featured environments, and no document overflow. Browser acceptance passed all
10 workflows, including the timed return and lower city zoom. `npm run check`
and `npm run release` passed with production build, HTTP smoke, scale, security,
trace privacy, and zero vulnerabilities. No production rollout or data migration
is included.
