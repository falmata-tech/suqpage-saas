---
id: FE-045
title: Searchable city and town selection
status: done
related: [BE-038, DEP-035, FE-043]
owners: [product, backend, operations]
last_updated: 2026-09-21
change_level: L3
---

# FE-045 — Searchable city and town selection

## Problem and scope

Owners should select a known city/town rather than manually looking up coordinates.
Reuse the existing admitted Ethiopian OSM place data and its local names. Search
returns at most eight candidates, distinguishes duplicate names with region and
place type, and does not download map geometry to the editor. Selection fills
city/region and shows an explicit general-area marker description. Exact storefront
coordinates remain separately entered with explicit public-storefront selection.

## Scenarios

- GIVEN an owner WHEN they search a city/town name in Latin or local script THEN
  bounded selectable results appear with loading, empty and failure states.
- GIVEN a selected place WHEN they save/reload THEN city, region and selected area
  persist; keyboard arrows/Enter/Escape and phone layout work without overflow.
- GIVEN an unknown place WHEN no result fits THEN manual city/region entry remains
  available; selecting a city never silently creates an exact storefront claim.
- GIVEN an admin WHEN opening a pending selected-area proposal THEN known centroid
  coordinates prefill the map fields and existing coarse-area approval remains.

## Test plan

Domain/lookup, persistence/privacy tests and focused desktop/390/320 browser
selection/save/reload/admin captures. Visual approval precedes full release gates.

## Rollout

DEP-035 owns the additive place-anchor storage and preservation evidence.

## Local evidence: 2026-09-17

`test:service-offerings`, `test:place-selection`, existing product-upkeep and
launch-wiring regressions, homepage/narrative/inquiry checks and typecheck pass.
`scripts/capture-service-place.ts` verifies owner-created services, linked service
inquiry, mixed catalogs, service search results, keyboard place selection,
save/reload, area privacy and admin anchor prefilling. Twenty-eight desktop/phone
captures and six owner/About accessibility scans pass in an isolated local schema
with test-issued local sessions. Visual approval, full release gates, scoped commit
and protected persistent/hosted migration remain pending. See
`docs/SUQPAGE-SERVICES-AND-PLACES-REVIEW.md`; no production rollout is claimed.

## Evidence: verified rollout — 2026-09-21

Source `be134a247c8ea54b18b882f9e2368058f7fbc0ee` is published as Netlify `6ab0d349f099639821fa0f9a` at https://suqpage.com.
Full check, release, operations, all nine isolated provider browser scenarios,
artifact privacy and production dependency audit pass. Production schema 47,
64 updated demo pages/256 offerings, all 64 public routes, live search at
1440/390/320, email-only entry, private-route denial, health and www redirects
are independently verified. Mapped focused tests and earlier desktop/phone
reviews remain applicable; the owner approved this release.

Earlier dated pending-approval/local-only notes are superseded by this rollout.
No real external email was sent and no authenticated hosted account was used
for testing; those admission checks remain separate from local provider evidence.
Demo contact destinations are examples, not verified delivery channels.
See docs/SUQPAGE-RELEASE-2026-09-21.md for backup, rollback and limitations.
