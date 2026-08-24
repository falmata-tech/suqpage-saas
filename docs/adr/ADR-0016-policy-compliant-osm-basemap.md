---
id: ADR-0016
title: Policy-compliant browser OpenStreetMap basemap
status: accepted
date: 2026-08-24
deciders: [MirtPage]
related: [FE-021, BE-023, DEP-026, ADR-0014]
---

# ADR-0016 - Policy-compliant browser OpenStreetMap basemap

## Context

MirtPage's first-party simplified Ethiopia geography kept the marketplace
independent from a runtime map provider, but it did not provide the road, town,
and neighborhood detail visitors expect from an interactive map. Hosting a tile
stack on Netlify's free plan would consume deployment and bandwidth credits,
while proxying or bulk-downloading OpenStreetMap's public tiles would add an
operational service and conflict with the public tile usage policy.

## Decision

Use Leaflet to request only the tiles visible in the visitor's current viewport
directly from the OpenStreetMap Standard endpoint:
`https://tile.openstreetmap.org/{z}/{x}/{y}.png`.

One provider registry owns the provider ID, exact URL template, attribution,
zoom limits, and conservative tile-loading options. MirtPage does not proxy,
prefetch, scrape, package, or service-worker-cache map tiles. Browser requests
retain the normal referrer and provider cache semantics, and visible
OpenStreetMap attribution links remain inside the map at every supported
viewport. The Privacy notice discloses that the visitor's browser contacts the
tile provider.

Supabase remains authoritative for showroom coordinates, industries, search,
place filters, nearby groups, and eligibility. OpenStreetMap is a visual
basemap only: no geocoding, routing, catalog search, account data, or private
location is sent through it. Supercluster continues to bound visible showroom
markers. PostGIS remains a later additive option for indexed viewport queries
when measured point volume makes sending the eligible point set inefficient.

## Consequences

- The map gains familiar road and place detail without a MirtPage tile server.
- A visitor's browser discloses ordinary tile-request metadata to the provider.
- Public OSM tiles are best-effort and may be unavailable or rate limited; the
  showroom controls and markers retain a bounded degraded state.
- The provider registry permits a later reviewed move to hosted vector tiles or
  PMTiles without moving search or tenant authorization out of Supabase.
- The inactive first-party geography may remain during the rollback window but
  is no longer fetched by the current marketplace.

## Rollback

Deploy the prior first-party map renderer. No database or business-coordinate
rollback is required because the basemap decision changes no canonical data.
