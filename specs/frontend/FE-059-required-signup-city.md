---
id: FE-059
title: Choose the business city during initial setup
status: in_progress
related: [BE-047, FE-051, FE-053, FE-056, BE-031, BE-038, BE-041, DEP-042, FE-065, BE-054]
owners: [product, frontend, backend]
last_updated: 2026-10-21
change_level: L2
---

# FE-059 — Choose the business city during initial setup

## Problem and scope

The signup starter currently assumes Addis Ababa. A real owner must choose their
business city alongside name, handle, category and private phone in the initial
setup screen on web and mobile. Native first email verification opens the essential
setup form directly, avoiding an extra Create page detour. Reuse bounded known-place search, show city and
region as optional suggestion context, require one selected city, and clear selection whenever
the search text changes. After a canonical city is selected, offer an optional map
picker centered and zoomed to that city. Default to **Show my city**: a numbered
city-area pin uses the canonical city anchor, and the business stays discoverable
by country/city. A concise disclosure makes clear that the exact address is not
shown. The owner may choose **Show on map** to add an exact public pin. Every
owner-placed map pin is public and exact; no approximate storefront marker is
implied. The choice is optional and never blocks setup. Changing country/city
clears an unconfirmed pin.
Keep the immediate rich private sample preview and subsequent Profile flow.
On native, Business city appears immediately after Business name, ahead of category choices,
with a Search city or town prompt. Both native entry routes (Account and
/owner/setup) render the same field, suggestions and required-selection gate.
FE-065 / BE-054 locally extends this flow to required Country then City, retaining
the 781 Ethiopian OSM IDs and adding the server-only ADR-0027 world catalog.
Changing country clears the chosen city; reselecting the same country preserves
it. Legacy known place IDs derive country server-side. A selected exact public
pin is placed on the city-centered map; typed coordinates and GPS placement are
not offered in this flow.
New flows and local demo corrections remain pending full gates/rollout.

## Scenarios

- GIVEN an unlinked signed-in owner WHEN choosing a suggested business city and
  completing setup THEN the private sample's business/location uses that city,
  region and server-known area coordinates immediately, without staff approval.
- GIVEN a canonical country/city WHEN the owner leaves **Show my city** selected
  THEN setup succeeds and the business remains available in city-based lists,
  search and the map as a numbered city-area pin at the canonical city anchor.
- GIVEN a canonical city WHEN its owner opts into **Show on map** and taps a
  point in the centered picker THEN save that point as the exact public
  storefront location and include it in the private owner preview. Show the
  choice through a clear selected state and concise disclosure; do not add
  instructional paragraphs to explain ordinary map tapping.
- GIVEN a chosen map point WHEN the owner changes country/city or clears the
  canonical selection THEN discard the previous point and require a new tap for
  another exact pin.
- GIVEN a map point without a canonical city or an incomplete/out-of-world
  coordinate pair WHEN signup is submitted THEN reject atomically and preserve
  the city/other form state.
- GIVEN no valid city selection or changed search text WHEN completing setup THEN
  block submission and show an actionable error; preserve other entered fields.
- GIVEN multiple city-only shops in one city WHEN shown on the map after
  publication THEN they share the canonical city anchor and use numbered groups
  on web and native; do not invent sub-city coordinates. Exact coordinates
  selected later are preserved.
- GIVEN slow/offline/empty place search THEN visible loading/no-results/retry
  preserves the form and no arbitrary/default city is silently saved.

## Quality and contracts

Submit canonical placeId plus an optional paired map-selected coordinate. Resolve
city/country from the server catalog; validate coordinate finiteness and world
bounds server-side. No private phone as public contact, no automatic publishing,
and no typed coordinate field. The UI distinguishes a city-area pin from an
exact-public storefront pin; selecting the map choice
reveals the map in place, with the exact-location notice beside that choice.
City-only businesses remain discoverable by country/city and appear as city-area
markers when their canonical anchor is valid. Existing known-place keyboard/touch
behavior; all labels/errors authored
in active UI languages.
Bound search and debounce like existing owner location search; no new provider.

## Test plan

`tests/acceptance/app.spec.ts` verifies Finish setup stays disabled before a
canonical city is selected, selecting its actual combobox result carries a place
ID, and completed setup enters the private preview before Profile navigation.

`scripts/test-signup.ts`, `scripts/test-mobile-api.ts` and
`scripts/test-self-service-publication.ts` cover canonical selection, missing/
forged city, malformed map points, exact-pin persistence, area privacy, rollback
and projection. `scripts/test-mobile-map.ts`
and `scripts/test-self-service-publication.ts` cover same-city offsets/exact pins.
`scripts/capture-signup-city.mjs` captures real web/Expo setup and saved preview,
city-centered pin placement, selection invalidation, validation, loading and
desktop/phone layouts. Include
both native setup routes and assert city precedes categories, the search prompt
is visible and invalid city selection cannot enable submission. Verify the
default city-area choice, map discoverability, exact-pin opt-in, public disclosure
and city-change invalidation.

## Rollout

No schema or existing-account mutation. City-required web/native setup and API
must ship together; old APK setup requests lacking placeId fail with a clear city
requirement rather than silently placing the store in Addis. Existing owners
continue to sign in normally. DEP-042 governs rebuilt Android release separately.
Full/release gates follow visual approval. Master §§5/11/15/18/19 affected.

Runtime render regression: blank search/error states must render no text child
under React Native View. Capture browser console/page errors through initial
setup, search, selected city, submit and private preview; empty status strings
render null, while real errors remain readable with retry.

Focused regression evidence: the shared city field is visible on /account and
/owner/setup, before handle/categories, with the existing localized city/town
search prompt. Selection invalidation, search failure/retry, canonical saved
anchor, private preview and post-signup Inquiries pass with no runtime render
errors. Evidence: .local/signup-city-review/verified.json and focused screenshots.
Full gates/visual approval/deployment remain pending.
