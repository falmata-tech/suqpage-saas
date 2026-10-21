---
id: ADR-0016
title: Policy-compliant browser OpenStreetMap basemap
status: accepted
date: 2026-08-24
deciders: [Suqpage]
related: [FE-058, FE-021, BE-023, DEP-026, ADR-0014]
---

# ADR-0016 - Policy-compliant browser OpenStreetMap basemap

## Context

Suqpage's first-party simplified Ethiopia geography kept the marketplace
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
zoom limits, and conservative tile-loading options. Suqpage does not proxy,
prefetch, scrape, package, or service-worker-cache map tiles. Browser requests
retain the normal referrer and provider cache semantics, and visible
OpenStreetMap attribution links remain inside the map at every supported
viewport. The Privacy notice discloses that the visitor's browser contacts the
tile provider.

The S139 browser correction checks HTTP status before assigning tile pixels.
Leaflet's ordinary image loader can display a decodable403 policy notice as a
normal tile. A shared browser adapter now makes one direct CORS request per
visible tile with default HTTP caching, omitted credentials and
`strict-origin-when-cross-origin`, then uses a short-lived object URL only for a
successful response. It does not use a proxy, separate status probe, custom
identity, cache-buster or automatic retry. Exact-host CSP permits this request;
decode/fetch timeouts, unload and map disposal release owned work and URLs.
On failure only raster is removed; the existing camera, business markers and
previews remain available with an explicit retry. Native MapLibre is unchanged.

Public root metadata explicitly reinstates the public referrer policy when
returning from private Tracking in the same document. Tracking retains its own
no-referrer metadata/headers. An origin-only map request never discloses a
tracking locator, account value, page path or search query.

Automated map reviews must intercept public tiles with declared local synthetic
fixtures before any provider request. They do not prove live provider playback.
Do not run headless pan/zoom loops against the community servers or continue
real requests through browser routing that disables HTTP caching. A normal
human browser smoke check is separate. See the
[browser workflow](../operations/BROWSER-WORKFLOW-REVIEW.md) and the primary
[OSM tile policy](https://operations.osmfoundation.org/policies/tiles/).
The [HTML metadata processing rule](https://html.spec.whatwg.org/multipage/semantics.html#meta-referrer)
explains why removing private referrer metadata does not restore public policy.

Supabase remains authoritative for showroom coordinates, industries, search,
place filters, nearby groups, and eligibility. OpenStreetMap is a visual
basemap only: no geocoding, routing, catalog search, account data, or private
location is sent through it. Supercluster continues to bound visible showroom
markers. PostGIS remains a later additive option for indexed viewport queries
when measured point volume makes sending the eligible point set inefficient.

## Consequences

- The map gains familiar road and place detail without a Suqpage tile server.
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
