---
id: ADR-0027
title: Offline country-city catalog with canonical map anchors
status: accepted
related: [FE-065, BE-054, DEP-045, BE-038, BE-047]
date: 2026-10-15
deciders: [product, architecture]
---

# ADR-0027 — Offline country/city authority

## Context and decision

The existing OSM-derived catalog covers Ethiopia. Country/city signup and map
discovery must support other countries without guessing coordinates or adding a
paid geocoder, a per-user external request, credentials or a new mobile SDK.

Retain current Ethiopian IDs/anchors and add a bounded, committed server-only
snapshot of GeoNames countries and cities5000 (cities above 5,000 population and
administrative seats), with source date, hashes and attribution. Search through
the existing place adapter by selected country; return bounded canonical results.
The lightweight country list may reach clients; the full city dataset must not
enter Expo/visitor bundles. No auto-sync/download at application startup.

Sources: https://download.geonames.org/export/dump/readme.txt and
https://www.geonames.org/about.html (consulted 2026-10-15). GeoNames distributes
its extract under CC BY 4.0 and gives WGS84 coordinates without a completeness or
accuracy warranty. Retain license/source attribution in the data and UI credits.
Existing OSM attribution remains. Country/proper-place names are not merchant
content translations; use supported locale display names with a safe name fallback.

## Consequences

Signup gets a known city-area point, never a verified storefront. Existing visual
offsets remain display-only. Keep exact coordinates owner-controlled and bounded
worldwide. Smaller/unlisted towns may not appear; never invent their coordinates.
The dataset is updated only through a reviewed data change. Discovery filters
come from eligible published businesses, not the entire gazetteer. GeoNames is a
data-source adapter, not a runtime availability or privacy dependency.

## Verification and reversal

Validate IDs, country membership, coordinate bounds, size, duplicate handling,
source provenance and bounded search. Test Ethiopia ID preservation, multiple
countries/same-name cities, Unicode aliases and signup mismatch/rollback. Check
mobile dependency boundaries. Reversal stops offering new locations but preserves
stored chosen locations and additive data; it must not move existing shops.
