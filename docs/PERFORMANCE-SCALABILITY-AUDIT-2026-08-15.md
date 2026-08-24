# Performance and scalability audit - 2026-08-15

## Scope

This audit covers the public Market and Daily Featured routes, tenant showroom
catalog reads, support refresh behavior, public caching, PostgreSQL runtime
limits, media delivery, PWA caching, and the test workflow. It is controlled by
FE-019, FE-021, FE-036, BE-015, BE-023, DEP-020, and DEP-025.

The target is a responsive first release on low-end phones and a credible path
to thousands of users. It is not a claim that one browser should receive tens
of thousands of map records or that an unmeasured free database tier has
unlimited capacity.

## Findings corrected

### Map interaction

- D3 now changes only the map group transform while a gesture is active. React
  viewport state commits when the gesture ends instead of on every zoom event.
- Supercluster receives geographic viewport bounds instead of projecting every
  marker into the DOM. Visible marker lookup uses an ID map rather than repeated
  array scans, and visible place labels are capped at 180.
- Roads, zones, and labels are hidden during active navigation to reduce paint
  work without hiding markers or controls.
- Geography is split into useful tiers. Country geometry appears immediately;
  administrative detail, cities, and major roads arrive during idle time;
  primary and secondary roads, towns, and villages appear only at useful zooms.
- Each geography tier is projected once in memoized static layers. Adding a
  later tier or committing a marker viewport does not rebuild unchanged paths.
- Progressive geography fetches are batched, city/place population ordering is
  precomputed, and viewport React state commits run as a transition after the
  direct D3 gesture transform.
- Nearby grouping changed from a full pairwise scan to normalized city/region
  buckets and neighboring geographic grid cells, while retaining the exact
  800-meter distance decision.
- Nearby groups carry showroom IDs only. The complete showroom record exists
  once in the canonical public array rather than again in every nearby group.

### Public route and cache cost

- Daily Featured now has a separate client component and does not import D3,
  Supercluster, geography, or Market interaction code.
- Anonymous non-search Market, Daily Featured, and Sponsor projections use a
  20-second server cache. Free-form search bypasses this cache so arbitrary text
  cannot create an unbounded cache-key set.
- The PWA worker is versioned to v2 and includes `/featured` in its bounded
  network-first public navigation cache. API, dashboard, preview, login,
  request, and mutation traffic remains network-authoritative.

### Database and support cost

- SQLite and PostgreSQL showroom catalogs fetch all option groups in one query
  and all option values in one query, then attach them in memory. The previous
  per-product and per-group query fan-out is removed.
- The normal active showroom route resolves the business with the catalog. A
  second status query happens only when the catalog is absent and the route must
  distinguish suspended from unknown.
- Existing operations collections remain server-paginated with bounded page
  sizes, stable ordering, scoped counts, and supporting indexes.
- Public and staff support refreshes run only while a conversation is open and
  the browser document is visible. Message reads remain bounded.
- PostgreSQL uses a bounded pool (default 4, configurable 1-10), a 5-second
  connection timeout, and an 8-second statement/query timeout. Production uses
  the managed transaction pooler rather than one unbounded pool per function.

## Measured evidence

Focused Chromium evidence used a 390 by 844 phone viewport at 6x CPU slowdown
and desktop at 4x slowdown. The script performs repeated real cluster zooms and
a pan, checks browser errors, overflow, DOM bounds, and long tasks, and records
screenshots and metrics under `/tmp/mirtpage-market-performance`.

| Probe | Result |
| --- | --- |
| 10,000-row nearby grouping | 140.6 ms in the latest focused run |
| Phone interaction sequence | 11,089 ms; maximum long task 1,028 ms at 6x CPU slowdown |
| Desktop interaction sequence | 8,057 ms; maximum long task 909 ms at 4x CPU slowdown |
| Mounted markers after final phone view | 5 |
| Geography tier integrity | Full source reconstructed exactly; city tier 8.9 KB |
| Browser errors / horizontal overflow | None |

These are development-server measurements, useful for regression detection but
not final production performance numbers. A production build and route-chunk
inspection remain required after visual approval.

## Current scale protections

- PostgreSQL and private object storage are implemented production modes.
- Tenant, request, inquiry, support, product, and staff collections use scoped
  server pagination instead of complete-table UI payloads.
- Support messages, sponsor placements, search suggestions, Featured rows, and
  PWA caches have explicit upper bounds.
- Public media is immutable-addressed and cacheable; private attachments require
  authorization before storage reads and are returned `no-store`.
- The PWA caches at most 20 public pages and 80 public assets and never handles
  non-GET requests.
- Database schema includes indexes for publication, location, status, tenant,
  queue, message, request, inquiry, visit, and Featured ordering paths.
- Map geography is first-party static data, so phone interaction has no runtime
  tile, geocoding, or routing dependency.

## Capacity boundaries and next triggers

1. **Complete public point payload:** the Market still sends the canonical set
   of eligible showroom point/detail records to the browser. This is acceptable
   for the current dataset and low thousands, but before approaching tens of
   thousands of simultaneous map records, add a viewport/tile endpoint that
   returns minimal points and fetch detail on selection.
2. **Search:** current parameterized substring matching is bounded and safe but
   not a search engine. When measured PostgreSQL search latency becomes material
   at sustained high-thousands of offerings, introduce reviewed `pg_trgm` or
   full-text indexes behind the existing search contract.
3. **Images:** static demo media totals roughly 37 MB but is demand-loaded rather
   than downloaded as one bundle. At material traffic, use object-storage image
   transformations or an image CDN and retain responsive `sizes` at public card
   call sites.
4. **Server cache:** the 20-second in-process/Next cache reduces repeated public
   projection work but is not a substitute for database indexes or a shared
   invalidation strategy at large multi-region scale.
5. **Database connections:** keep the per-instance pool small while using the
   Supabase transaction pooler. Raising the application pool without measuring
   provider limits can reduce capacity rather than improve it.
6. **Observability:** before broad traffic, alert on p95 route latency, database
   timeouts/pool waits, server errors, media failures, client Web Vitals, and map
   interaction long tasks. Current focused scripts are release evidence, not
   production monitoring.
7. **Local build cache:** `.next/dev/cache` can grow to multiple gigabytes during
   long development sessions. It is not deployed. Clean it only with the dev
   server stopped; it is a workstation concern, not a user payload.

## Test workflow decision

No broad security, tenant, migration, or release test was removed. Those suites
protect different failure boundaries even when they share setup cost. Fast
iteration now uses focused discovery, geography, scalable-query, support, PWA,
adapter, and CPU-throttled Market probes. The complete `npm run check`,
production build/chunk inspection, acceptance workflows, release gate,
container checks, and remote CI run once after the user approves the focused
visual state.

## Remaining release evidence

- User approval of the phone and desktop Market states.
- Production build route manifest proving the Featured chunk excludes map code.
- Complete check, acceptance, release, container, and PostgreSQL rehearsal gates.
- Production Web Vitals and database/pool telemetry after deployment.
