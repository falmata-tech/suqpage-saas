---
id: FE-059
title: Choose the business city during initial setup
status: in_progress
related: [BE-047, FE-051, FE-053, BE-031, BE-038, BE-041, DEP-042, FE-065, BE-054]
owners: [product, frontend, backend]
last_updated: 2026-10-07
change_level: L2
---

# FE-059 — Choose the business city during initial setup

## Problem and scope

The signup starter currently assumes Addis Ababa. A real owner must choose their
business city alongside name, handle, category and private phone in the initial
setup screen on web and mobile. Native first email verification opens the essential
setup form directly, avoiding an extra Create page detour. Reuse bounded known-place search, show city and
region as optional suggestion context, require one selected city, and clear selection whenever
the search text changes. No map/GPS field or technical coordinates during signup.
Keep the immediate rich private sample preview and subsequent Profile flow.
On native, Business city appears immediately after Business name, ahead of category choices,
with a Search city or town prompt. Both native entry routes (Account and
/owner/setup) render the same field, suggestions and required-selection gate.
FE-065 / BE-054 locally extends this flow to required Country then City, retaining
the 781 Ethiopian OSM IDs and adding the server-only ADR-0027 world catalog.
Changing country clears the chosen city; reselecting the same country preserves
it. Legacy known place IDs derive country server-side. Existing GPS stays intact.
New flows and local demo corrections remain pending full gates/rollout.

## Scenarios

- GIVEN an unlinked signed-in owner WHEN choosing a suggested business city and
  completing setup THEN the private sample's business/location uses that city,
  region and server-known area coordinates immediately, without staff approval.
- GIVEN no valid city selection or changed search text WHEN completing setup THEN
  block submission and show an actionable error; preserve other entered fields.
- GIVEN multiple shops in one city WHEN shown on the map after publication THEN
  deterministic small visual offsets keep them distinct, consistent across web
  and native; exact coordinates selected later are not offset.
- GIVEN slow/offline/empty place search THEN visible loading/no-results/retry
  preserves the form and no arbitrary/default city is silently saved.

## Quality and contracts

Submit only canonical placeId; BE-047 derives coordinates and tenant atomically.
No private phone as public contact, no automatic publishing and no store coordinate
chosen from unvalidated browser data. Existing known-place suggestion keyboard
and phone touch behavior; all labels/errors authored in four UI languages.
Bound search and debounce like existing owner location search; no new provider.

## Test plan

`tests/acceptance/app.spec.ts` verifies Finish setup stays disabled before a
canonical city is selected, selecting its actual combobox result carries a place
ID, and completed setup enters the private preview before Profile navigation.

`scripts/test-signup.ts` and `scripts/test-mobile-api.ts` cover canonical selection,
missing/forged city, rollback and projection/privacy. `scripts/test-mobile-map.ts`
and `scripts/test-self-service-publication.ts` cover same-city offsets/exact pins.
`scripts/capture-signup-city.mjs` captures real web/Expo setup and saved preview,
selection invalidation, validation, loading and desktop/phone layouts. Include
both native setup routes and assert city precedes categories, the search prompt
is visible and invalid city selection cannot enable submission.

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
