---
id: FE-021
title: Geographic Showroom map and Daily Featured Showrooms
status: in_progress
related: [FE-074, FE-053, FE-058, FE-001, FE-003, FE-013, FE-017, FE-018, FE-020, FE-022, FE-024, FE-027, FE-028, FE-030, FE-033, FE-034, FE-036, FE-037, FE-048, BE-019, BE-020, BE-021, BE-023, BE-029, BE-041, DEP-016, DEP-017, DEP-024, DEP-026, DEP-049, ADR-0011, ADR-0016, FE-065]
owners: [product, frontend, design]
last_updated: 2026-10-22
change_level: L3
---

# FE-021 - Geographic Showroom map and Daily Featured Showrooms

## S159 — truthful Daily Featured broadcast header (in progress)

The current system has an authoritative EAT program schedule and optional
public TikTok/YouTube destinations, but no provider integration or operator
signal that verifies whether an external stream has actually started. The web
and Expo headers must make the scheduled state easy to understand without
presenting schedule time as proof of broadcasting.

GIVEN today's program has businesses WHEN its scheduled window has not begun
THEN the header names TikTok Live and says when its scheduled window begins in
EAT, whether or not a destination is configured. GIVEN the scheduled window is
underway THEN the header identifies the scheduled window and offers
**Check TikTok Live** only when a validated TikTok destination exists; it does
not assert that the external stream is live. The phone status spans the content
width so the state and start time are readable. GIVEN the selected program
day has ended THEN the header says the scheduled program has ended and offers
YouTube recordings only when that destination is configured. GIVEN no businesses
are scheduled or a destination is absent/invalid THEN show the schedule state
without a dead link or an invented broadcast claim.

Web desktop, phone web and Expo use the same phase, EAT range and localized
meaning. A selected future weekday shows its scheduled date/time without
revealing future business identities. A verified **Now broadcasting** status is
out of scope until an authorized operator status or provider signal exists.

Definition of Ready: the no-integration boundary is explicit in BE-029 and the
owner asked for the program state in the header. Test schedule transitions,
empty and missing/invalid channel cases, localization in Amharic/Afaan Oromo,
and actual Chrome 1440/390 plus Expo. Visual approval precedes full gates. No
database change, provider integration or external write is required.

Focused evidence: `scripts/test-featured-broadcast-header.ts` passes all five
scheduled, in-window, ended, empty, link-validation and future/past date cases
in English, Amharic and Afaan Oromo, including a missing-link scheduled state.
Actual Chrome review covers 1440px web in the upcoming state, 390px web in the
scheduled-window state, and 390px Expo in the scheduled-window state. The
source-bound capture receipt and screenshots are in
`.local/featured-header-s159/receipt.json`; visual approval and applicable full
gates remain pending.

## S158 — optional exact public map pins (superseded by S160)

Country and city are required for a business listing; a public map pin is
optional. **City only** remains eligible for country/city and product discovery
but is not rendered as a business marker. **Show on map** requires the owner to
place an exact public point after selecting its canonical city. Unknown legacy
coordinates and city-centroid/area projections do not qualify as exact pins and
must not create public map markers. Search scope, counts and location filters for
Business locations describe businesses that can actually be opened on its map;
Product listings continue to include eligible goods from city-only pages.

GIVEN a map response containing both exact storefront pins and city-only
businesses WHEN web or Expo renders its map THEN every marker/group member comes
from an exact-public storefront pin, with no hidden city-only member in a cluster.
GIVEN a city-only business with listed products WHEN a visitor searches Product
listings by its country/city or product name THEN its product cards and source
business remain discoverable.

Definition of Ready: the owner chose the exact-public meaning for every
owner-created pin and approved setup without a pin. FE-059/FE-056 define the
visual choice; BE-041 owns saved projection and server validation. Regress map
eligibility, result counts, exact pin grouping/preview, and city-only product
discovery. Cluster geometry may use isolated synthetic locations but may not
pretend unpinned businesses have map coordinates. Capture Chrome and Expo after
implementation; obtain visual approval before full/release checks. No migration
or change to canonical country/city is expected.

## S160 — city-area map pins and counted groups (in progress)

The owner explicitly changed the empty-map decision: businesses with only a
canonical city location should still appear on the map. Use that validated city
anchor as a **city-area pin**, distinct from an exact storefront pin. Preserve
`locationMode: area` internally through web and Expo; visitor-facing markers,
group cards, previews and accessible names show the business name and actual city,
without the internal location-mode label or an implied street address. A final
marker representing exactly one business uses the shop glyph and opens that
business preview at every zoom, including when it would otherwise appear as a
one-business outer aggregate; never render a numbered circle containing **1**.
Numbered count circles represent two or more businesses. When a singleton city
anchor overlaps another marker at a broad scale, include it in a zoomable count
of the overlapping businesses until the markers separate. Once alone, and after
a city filter that leaves one result, show its shop glyph at the canonical city
anchor. Preserve bounded display spacing without changing a city's canonical
anchor. Do not apply per-business
geographic jitter, reuse stale exact coordinates, or infer sub-city positions.
At terminal zoom the existing counted-group/modal-capacity policy remains
authoritative; every eligible business remains reachable. Business search counts
and city filters include exact pins and city-only pages with validated canonical
city anchors. Product search retains its existing city-only eligibility. Legacy
locations without a validated canonical city anchor remain absent from the map.

GIVEN an eligible published city-only business with a canonical city anchor WHEN
it is the only business represented by a final marker THEN show its shop glyph and
business name at the city anchor, with the actual city in its accessible name,
and open that business preview directly; do not
replace the business name with the location detail, show a numbered **1** circle,
or imply an exact address. The same hierarchy applies on web and Expo.
GIVEN several businesses in one city WHEN the visitor zooms to city scale THEN
groups of two or more resolve through the existing numbered circles; a singleton
left by a bounded screen partition uses the shop glyph without a count. The map never
displays fabricated business positions or an oversized/unreachable preview.
GIVEN the city cluster preview opens THEN each card names the business and city;
no internal location-mode label, exact coordinate or address is presented.
GIVEN one city-only business has a valid canonical anchor WHEN the map reaches
its terminal level THEN it remains a shop glyph at its city anchor, without a
count circle, and opens its preview directly.
GIVEN an exact-pin business WHEN it is included in the same map scope THEN its
owner-selected coordinate and existing grouping/isolated-pin behavior are kept.
GIVEN a legacy or invalid city anchor WHEN map data is queried THEN it contributes
neither a marker nor a business map count.

Definition of Ready: the owner chose to include city-only businesses as map pins,
with exact storefront pins still opt-in. FE-058 controls map grouping; BE-041
owns the validated canonical anchor; FE-065 keeps business and product scopes
independent. Regression coverage proves country/city counts, city filters and
business search include valid area anchors; invalid legacy points remain
excluded; multi-business area groups use numbered circles, singleton area groups
use a shop glyph and accessible business/city name, and previews omit internal
location-mode labels; product search is unchanged. Exercise web desktop, phone web and Expo from the
same source/API revision; actual visual approval precedes full/release gates.
This is a query/UI change without a database migration or hosted-data write.

Local evidence (visual approval and full gates pending):
`test-independent-discovery.ts` proves valid canonical city anchors remain
eligible when the legacy proposal country is blank, while invalid/legacy anchors
remain excluded. `test-map-group-picker-web.ts` and
`test-mobile-map-groups.ts` verify city-area preview labels/accessibility;
focused discovery, clustering, typecheck and localization checks pass. Actual
Chrome desktop, phone web and Expo preview all return the same 57 city-only
businesses across eight cities. The final-marker rule prevents a one-business
group from rendering a numbered **1**. The browser journey filters to Bishoftu,
confirms **Green Terrace Farm** is a single shop marker at its canonical city
anchor, opens its direct preview, and verifies the same result
on all three client surfaces. At regional overview, the same business is
included in a real overlapping multi-business count while it would otherwise
occlude nearby markers. Source-matched captures and receipt are in
`.local/s160-city-area-map-review/singleton-review.html` and
`singleton-receipt.json`. Visual approval and full gates remain pending. The
walkthrough does not tap every overlapping regional marker. Synthetic grid
tiles were used, so this does not verify public basemap availability or hosted
data.

## S155 — regional overview clusters and explicit discovery modes (in progress)

The bounded local map API historically returned 66 public demo businesses across
multiple Ethiopian cities. At web opening zoom 5, the old 96px outer hierarchy
turned all 66 into one badge; one click only then separated it into regions. The
seed path also replaced each demo's distinct approximate map point with its
city-center point, so dense cities such as Addis started from one shared anchor.
S160 supersedes the exact-pin-only map scope: keep this 66-point geometry case as
a synthetic clustering regression, and show only owner-selected exact pins or
validated canonical city-area pins. Never replace a real owner's selected
location with demo coordinates.

GIVEN multiple geographic concentrations are present in the current public map
scope WHEN the Market opens at its default regional overview THEN nearby final
groups may form counted regional clusters, but one country-spanning aggregate
must not hide those distinct concentrations. As visitors zoom in, each aggregate
continues to split into its geographic children; at the existing city/terminal
level, exact nearby-group membership, fit limits and preview behavior stay as
specified below. Zooming out may merge nearby regional groups normally. Keep
every eligible business represented exactly once at every zoom and leave its
public coordinate unchanged.

The primary discovery tabs are labelled **Business locations** and **Product
listings** in web, phone web and Expo. Their native-language labels must name
the search scope clearly without adding explanatory copy that takes map height.
The current tab remains selected and independently controls the existing map or
product results.

On a 320–390px phone, the two tabs span the available Market width and use a
compact but at least 44px-high tap target. Keep the search and filter controls
at least 44px high, legible in all active languages, and preserve the complete
homepage message while reducing surrounding chrome so more of the map is
visible without scrolling. The selected tab, search, filter, map and product
navigation remain usable after the layout change on phone web and Expo.

Definition of Ready: the historical 66-point reproduction identifies the shared
city anchors, source radius and initial zoom. A synthetic 66-point regression
requires at least ten opening city markers, then more groups at zoom 9 and 10,
conserving every ID. S160 supersedes the prior actual-map eligibility rule:
eligible city-only businesses enter only as canonical city-count groups, while
legacy/unanchored locations remain excluded. Test the cluster hierarchy,
localized tab names and independent tab selection. Capture Chrome desktop/phone
and Expo before the existing visual-approval gate. Do not run full release gates
or deploy before approval.

## S154 — city-scale terminal circles (implemented locally; physical/visual review pending)

The latest owner permits display-only spacing for counted circle targets so a
dense city need not remain one large circle until street-detail zoom. Current local
public data has 21 Addis businesses at one canonical city anchor. S160 keeps these
records at that anchor; terminal groups may fan out as count circles for reachable
tap targets, but the businesses themselves get no synthetic sub-city coordinates.
Preserve this distinction from exact storefront pins and the already-qualified
native SDK touch correction.

Acceptance, with finite bounds reviewed before implementation:

- GIVEN normal zoom-out THEN weighted outer circles merge nearby groups and count
  businesses; clicking one advances toward its actual expansion, never opens an
  oversized modal. GIVEN city-level normalized 12/native 11 THEN the current small
  terminal groups are exposed, even when their saved city anchors coincide.
- GIVEN exposed terminal groups THEN clicking opens exactly their screen-admitted
  previews in place, with no additional zoom. Retain up to 3 phone/up to 6 large
  screen cards, reduced for height/text scale, no inner paging/scroll, and only
  truly isolated shops use individual glyphs. Membership remains independent of
  display displacement and cannot be inferred from saved/foreign subsets.
- Use deterministic, bounded circle-only screen separation over the complete
  public scope before viewport filtering. Keep true/public anchors and stored
  coordinates intact; do not apply per-business area jitter or use displayed
  circle centers as a business address. No lines, extra dots, database change or
  forced shop movement.
  Try minimal-shift-first spacing within 5km of each public group centroid;
  only when no collision-free position fits there, permit a finite 10km fallback.
  That fallback shares one stable full-scope lattice phase: near-coincident
  anchors cannot waste packing space through separately shifted56px grids.
  At normalized 12/native 11 expose terminals only when the full-scope layout fits.
  A denser overflow retains the ordinary aggregate and advances one level to 13,
  where bounded 200-point/capacity-1 coincident fixtures must fit without overlap.
  No store is dropped or hidden behind an unreachable target. The interaction
  ceiling is normalized 13/native 12; optional district detail is not street zoom.
- Preserve 56px pitch/48px targets, input-order/pan determinism, dateline/polar
  validity, count/ID conservation and current scope/capacity validation. Keep
  normal global pan, initial/reset Ethiopia, one native normalized zoom offset,
  source capability 19, SDK dispatch/accessibility and current camera/Back state.

This supersedes the prior late 18/17 reveal and800m-only spacing. FE-058 records
its matching camera change before production edits. Aggregate activation must
stop at 12 when that layout fits, even if the underlying hierarchy's expansion is 13.
Current-group admission must consult the actual displayed layout: a saved terminal
hidden in a retained dense aggregate cannot open a modal. Master §§10/19 are also
affected; root owns their planned/current reconciliation and the ordered checklist.
There is no provider, API, database, marker hit-frame or dependency
change. Reuse installed Supercluster 8.0.1 over weighted final groups. Its pixel
radius, source maxZoom and expansion zoom are clustering controls, not proof of
MirtPage's modal policy. Sources: [Supercluster options](https://github.com/mapbox/supercluster#options)
and [MapLibre clustering example](https://maplibre.org/maplibre-gl-js/docs/examples/create-and-style-clusters/).

Verification plan: preserve the actual 21-city-coordinate old-policy failure;
shared pure tests for 2..200/dense/coincident/capacity 1/3/6 and retained IDs;
current-group authority plus native/Leaflet aggregate→terminal/camera tests;
installed-SDK 48dp regressions; actual synthetic-map web/Expo and parent-owned
physical tap/pan/zoom/preview/Back review before the existing visual/full gates.
Implemented in the existing shared model. The captured 66-point public snapshot
now conserves every ID and exposes Addis as seven phone/four desktop groups at
city zoom, both alone and in the complete scope. Focused pure tests cover the
coincident and near-coincident 200-target overflow, equator/dateline/polar bounds,
retained coordinates, cache-copy safety and current displayed-group authority.
Native controller/SDK-host tests retain 48dp dispatch and matched zoom bounds.
Actual Chrome tests use installed web/Expo Leaflet at 390/1440, with external
requests blocked; all 21 area businesses open exactly once without camera moves.
These are synthetic UI/model and captured-public-snapshot checks, not a physical
MapLibre, live data mutation, deployment or visual-approval claim. Parent-owned
physical tap/preview/Back and visual review remain pending.

## S153 local native map fixture (in progress)

The owner requests physical Android development-client audits. Automated native
map gestures must not contact public tile servers. This JS-only L1 addition uses
a synthetic background-only MapLibre style, without a tile server or dependency.

GIVEN a development runtime explicitly sets EXPO_PUBLIC_NATIVE_MAP_FIXTURE=1
WHEN native MapLibre mounts THEN render the declared synthetic background with
empty sources and no tile, sprite or glyph URLs while retaining real local
business data, markers, camera, gestures and previews. GIVEN release runtime or
an invalid fixture flag WHEN fixture mode is requested THEN stop before mounting
a map; never fall back to public tiles. An unset flag preserves the existing
ordinary map. Expo/Leaflet behavior remains unchanged. The fixture establishes
native UI/gesture behavior only, not real basemap/provider availability.

Ordered steps: spec/RED wiring regression → small pure style selector/native
binding → focused fail-closed/type checks → reviewed delta transfer after the
combined source checkpoint → physical device evidence under the separately
admitted development client. No Android build, key use, install, provider change
or full release gate is part of this source change. Master §§5/10/19/22 retain
ordinary map behavior; this explicit synthetic test mode is not production UX.

Test: `scripts/test-mobile-map-groups.ts`; real-device proof remains pending.

## S153 installed native marker dispatch (in progress)

The installed MapLibre 11.4 Android SDK consumes a marker hit through the SDK
Marker onPress and computes its rectangle from the full measured child, regardless
of descendant pointerEvents. Counted markers omitted that SDK callback and used a
96px layout frame, so a real Android tap could be swallowed while child-callback
tests passed. This is an L1 native adapter correction, not a clustering change.

GIVEN an exposed final circle WHEN the installed native SDK dispatches its marker
press THEN open its current admitted preview once without camera movement. GIVEN
an outer aggregate THEN one SDK press advances the existing expansion camera
once; an isolated shop still selects its own preview. A counted native host is
48×48dp, centered on the unchanged circle position, with no invisible 96px SDK
hit rectangle. Its decorative badge and retained legacy nearby artwork do not
expand the host. Android keeps its map-level SDK hit dispatch; iOS keeps its annotation host
targetable for the installed native tap recognizer. One accessible child action
remains available without a second
physical Pressable hit route. Expo/Leaflet retains its 96px transparent layout and
48px child target; marker geography, glyph/badge pixels, grouping and labels stay.

Ordered verification:
- [x] Read installed Android/iOS SDK dispatch and measured-hit contracts; preserve
      an SDK-boundary RED regression before production edits.
- [x] Correct native SDK dispatch and bounded group host with unchanged web path.
- [x] Run focused adapter/marker regressions and web/mobile typechecks; retain
      terminal/aggregate/single, pixel-offset and single-action evidence.
- [ ] Transfer only reviewed source to the combined batch. Installed Android touch
      and accessibility proof remain pending a separately authorized device test;
      Expo or direct callback tests cannot establish native rendering behavior.

Test: `scripts/test-mobile-map-groups.ts`. Master §§5/10/19/22 existing map behavior
is affected only by restoring its stated activation contract. No API, database,
provider, dependency, Android build or full release gate is included here.

## S151 B10 — readable category choices in Featured (implemented locally)

The weekday ribbon currently prioritizes dates and hides category names on the
public phone layout; Expo omits those names entirely. The owner's category-icon
report supersedes the earlier seven-weekdays-at-once presentation requirement.
Keep the existing seven scheduled choices, day-to-category mapping and routes.
This is an L1 presentation correction, not an unrestricted category search.

GIVEN the Featured choices WHEN viewed on web, phone web or Expo THEN each
choice shows its localized category name as the primary readable label beside
the existing illustration, with weekday/date as secondary text. Do not hide,
ellipsis or shrink category names to fit all seven choices. Narrow containers
may scroll the single row horizontally; they must not widen the document.
The current choice must be visible on first load and after selection/return.
Selected/current-day states, keyboard focus and at least48px targets remain
clear. Category artwork stays decorative; accessible names include the category
and schedule context. Existing en/am/om labels supply the text without new copy.
FE-074's Featured initial skeleton must follow the same readable tile width,
illustration/name/schedule slots and horizontal clipping, rather than retaining
the superseded tiny weekday-strip geometry. It remains decorative and inert.

Definition of Ready: source and screenshot inspection identify the exact hidden
label and date-first hierarchy. No data/API/provider/dependency change is needed.
Plan: category-first web/native markup and measured responsive styling; focused
actual-component visibility/geometry/accessibility/selection checks with long
localized labels; actual Chrome desktop/phone and Expo selection, business and
Back tasks using real local read outcomes. Freeze source before captures and
add current screenshots to the combined review. Master §§5/10/19/22 and FE-053
are affected. Visual approval/full release/deployment/new APK stay separate.

Focused evidence: `scripts/test-featured-categories.ts` passes active en/am/om
catalogs at1440/1024/390/320px and200% base text, with all seven complete names,
category-first accessible labels,32px decorative art, current-choice visibility
and keyboard focus. Three sponsor geometry cases and the private-image renderer
case still pass. Native category/grid/skeleton cases pass14, and the three web
loading variants pass including updated category silhouettes. Root/mobile strict
types pass. The first Oromo overflow exposed an obsolete48px parent row; natural
row height fixes the defect without shrinking text. Expo's legacy selected-state
prop was absent in the actual DOM; explicit web-only `aria-pressed` now supplies
valid toggle-button semantics while native selected state remains unchanged.

Actual local Chrome passes five web locale/width states, five category selection/
Back journeys and one business preview→showroom→Back. Labels match the real API
schedule. Two raw aborted analytics requests remain after intentional204
suppression; functional assertions pass but a clean network run is not claimed.
Actual Expo passes six en/am/om width states and three category→real-response→
business→Back journeys with no page errors, failed API requests or writes.
The selected category remains in view. One held real initial Expo GET captures
the matching skeleton then completes200; web skeleton captures remain clearly
labelled actual-component evidence, not server-streaming proof. Receipts/screens:
`.local/mirtpage-final-release-20261019/s151-batch-audit/b10-*`.
The stopped-preview and first cold5s navigation failures are retained separately.
No hosted data/configuration or physical Android action occurred.

## S151 B08 — Featured cards remain inside their gallery (ready)

The public Chrome audit reproduced business cards overlapping the independent
sponsor surface at 1100, 1024 and 768px even though the document itself did not
overflow. This is a responsive presentation defect; program eligibility, the
six-slot order, sponsor disclosure and the FE-033/FE-036 rotation contract remain
unchanged. FE-024 owns the paired sponsor separation criterion.

```gherkin
Scenario: Featured shares its real available width with sponsors
  GIVEN zero, one or multiple eligible sponsor placements and up to six revealed businesses
  WHEN the gallery is narrowed by the workspace navigation or sponsor column
  THEN every business card stays inside the gallery's content bounds
  AND business and sponsor targets do not intersect or cover one another
  AND the gallery selects no more than three columns using its own available width
  AND phone layouts retain the compact two-column business cards below the sponsor strip
  AND long business names cannot expand a track beyond its allocated width

Scenario: Sponsor controls preserve independent business navigation
  GIVEN a Featured gallery and multiple sponsor placements are visible
  WHEN a visitor uses the sponsor Next control and opens a revealed business
  THEN the sponsor changes without changing the business slot order
  AND the business opens its own preview and authoritative showroom destination
  AND the same controls remain reachable at desktop and phone widths
```

Definition of Ready: the actual failing rectangles and source boundary are
recorded in the S151 audit; this L1 correction uses existing CSS and components,
without data, API, copy, permission or dependency changes. Implement the bounded
container-sized gallery first, then test actual compiled cards/carousel with real
CSS at 320–1440px, sponsor pools of zero/one/five and long labels. Check rectangle
intersection and hit targets rather than document overflow alone. Actual local
Chrome must also exercise Featured preview, showroom and Back; wait for each
image's load/error result and report media failures separately. Synthetic map
tiles remain mandatory. Full gates and deployment follow the combined visual
approval. Rollback restores only the previous gallery CSS. Relevant master
sections are §§5/10/19/22; this is a local candidate until its evidence is recorded.

Focused regression: `scripts/test-featured-sponsor-layout.ts` passes all27
width/sponsor geometry states, independent order/Next/hit targets and preview
Escape. The real-local bounded retry passes nine width geometry assertions and
Next→preview→showroom→Back at1024/390, with decoded public images/HTTP200.
Its raw receipt remains mixed because four explicitly suppressed analytics
requests report ERR_ABORTED without exact per-request correlation; no clean
telemetry claim is inferred. The first local database connection timeout is
retained; read-only schema77/Auth health passes before the one bounded retry.
No restart, live write or third complete journey rerun occurred. Receipts and
screens are under the protected `s151-batch-audit/` release directory. Combined
visual/full/deployment gates remain pending.

### S151 B09 — public image delivery (deployment candidate)

GIVEN a published public showroom image is selected for a Featured card WHEN
the hosted web renderer requests its responsive image variant THEN the existing
Netlify image-delivery adapter serves that variant rather than replacing a valid
source image with an error fallback. DEP-049 controls the narrow hosted-route
correction and its tests. Private media/API routes, native source-image URLs,
catalog authorization and card geometry remain unchanged. Local image success
does not establish hosted optimizer success; retain the separate production
source/variant response evidence and qualify the deployed result after release.

## S140 — preview separated final groups without more zoom (ready; latest correction)

Supersedes earlier maximum18-only preview guards; it does not change the zoom
ceiling, grouping membership or outer hierarchy. GIVEN an outer aggregate WHEN
clicked THEN zoom toward its normal expansion until groups separate. GIVEN a
terminal group already represented at the current camera WHEN clicked THEN open
all its admitted cards immediately without moving or zooming the camera. This
applies to web, Expo and native. No street-detail jump is required merely to
unlock a preview. GIVEN a saved terminal key enclosed inside a current aggregate
WHEN restoring or opening it THEN reject that hidden subgroup until its terminal
representation is current. Preserve exact public scope/member/capacity validation,
isolated singles, no-scroll previews and focus/Back behavior.

Ready: all UI guards and shared policy identified; pure diagnosis at normalized13
shows separate three-member groups wrongly forced to18. Test shared terminal/
aggregate distinction, current-group validation and platform preview/camera
behavior. Pair actual review with S139 synthetic tiles; no public automation,
data write or native build. Rollback is UI/policy only. Master §§5/10/19/22 need
verified reconciliation; visual/full/rollout gates remain open.

## S139 — blocked basemap correction (ready; local candidate)

Defect: a public provider can return a decodable403 image, which Leaflet's image
load event alone cannot distinguish from a valid tile. Private Tracking metadata
can also leave an inherited no-referrer policy on SPA return to Market. The
specific provider enforcement reason in the user's screenshot is not proven.
Scope is the browser basemap adapter, including Expo web; no new provider,
native SDK change, clustering rewrite, account or database write.

GIVEN public Market opens directly or after private Tracking WHEN visible tiles
load THEN each makes one direct request to the configured exact URL using normal
HTTP caching, the browser's own identity and an origin-only cross-origin referrer.
Private Tracking retains its own no-referrer policy. Never include path/query,
tracking locators, account details or search text in a tile referrer or URL.

GIVEN a visible tile fails HTTP status, CORS or image decoding WHEN loading it
THEN do not display its body as a successful basemap; remove only the owned
raster layer, cancel owned pending requests and release object URLs. Keep camera,
markers, previews and controls available on the neutral surface, with a concise
localized status and Retry map. Panning while failed does not restart raster
requests. A deliberate retry recreates only raster using the same URL/default
cache; another failure stays degraded. Unmounted/obsolete loaders cannot update
the current map. No proxy, cache-busting, identity rotation or automatic fallback.

GIVEN normal zooming or preview→showroom→Back while tiles are pending WHEN the
SDK replaces obsolete tiles THEN cancellation does not become a basemap failure.
Use the public asynchronous GridLayer extension and immutable tile coordinates;
do not combine a fetch loader with TileLayer's image-only abort routine, which
can overwrite decoding callbacks. Verify rapid zoom with held/released responses
and return navigation past the decode timeout, preserving camera and controls.
Internal diagnostics distinguish HTTP status, network/CORS, decode and timeout
without retaining request URLs, response bodies, identity or search text. The
visitor sees the same concise status; diagnostics are not additional UI copy.

Ready: privacy, lifecycle, accessibility and en/am/om copy evaluated; existing
FE-058/DEP-026/ADR-0016 cross-links apply. Focused browser/loader regressions use
local cross-origin fixtures for200/403-PNG/CORS/abort/cache and actual local
Market→Tracking→Market plus Expo workflows. Automated pan/zoom must intercept
public tiles before sending; actual provider playback requires a separate normal
human browser check. Rollback reverts only this adapter/UI; no data rollback.
Master §§5/10/15/19/22 require verified reconciliation; full/visual/rollout gates
remain open. Planned test: `scripts/test-map-tile-loader.ts` and focused actual
review under `.local/map-tiles-s139/` (provider traffic is not automated).

Local evidence: `scripts/test-map-tile-loader.ts`15 cases and
`scripts/test-map-tile-ui.ts`2 real-adapter cases pass; fixture guard5 and public/
private metadata probe pass. `actual/outcome.json` plus phone-return supplement
prove35 real-app checks/51 captured states across desktop/phone web and Expo,
with controlled tiles and source hashes. Pending zoom and showroom-return stay
healthy beyond10seconds. Owner separately confirms the normal browser map works
after Retry/preview return; this is not a provider-unblock acknowledgement.
S140 evidence: shared20, UI17, installed-SDK2 plus the same real-app preview
journeys; terminal cameras stay unchanged. Root/native types,206specs and1725
catalog messages pass. Visual/full/commit/deployment gates remain open.

## S130 — richer native group previews (ready)

FE-065 S130 adds useful literal description/city within current S127 row and font
budgets, preserving the same capacity, normalized maximum zoom and all-at-once
non-scrolling modal. Full current public business detail remains in the existing
preview, with locale-aware country names. Regress short/enlarged rows and actual
Chrome selection→showroom→Back; no clustering or location-data rewrite is included.

## S127 — screen-sized nearby groups (ready; latest owner direction)

The newest owner instructions supersede the global three-shop cap, connecting
lines and paged pickers. A final circle at maximum opens ALL its shops together, with no inner
scroll, Previous or Next. Larger screens can hold more; phones hold fewer.
Zoom-out aggregates normally merge nearby final groups; final group membership never splits. L1 frontend refinement; no API, database,
saved-coordinate, provider or chat change. Retain failed/superseded evidence.

GIVEN the available modal rectangle and current font scale WHEN sizing the map
and picker THEN derive one shared capacity: at most six cards in two columns on
large screens (available width at least600), at most three in one column on
phones, reduced further when height/font size requires. Use readable108px normal
rows or84px compact rows with shared header/padding allowances. Extremely short
or enlarged layouts may require one card. Every admitted member must fit at once;
never page or scroll the shop list. The index and picker must use the same capacity.
All new actions/counts have authored native-language labels in all five languages.

GIVEN the current eligible public map projection WHEN data/filter scope or screen
capacity changes THEN form deterministic3-kilometer connected neighborhoods from
existing public display coordinates and stable nearest-spatial/ID order. Partition
into chunks2..capacity, using only isolated singles except when capacity1, or an
odd neighborhood at capacity2, makes a one-card group unavoidable. Such a member
of a non-isolated neighborhood remains a counted circle, not an isolated-shop icon.
For compactness first find the smallest possible largest within-group Haversine
diameter, then allow the greater of that value and3kilometers as a comfort budget;
among valid partitions prefer fewer groups, then smaller total diameter and stable
larger-first ties. This lets genuinely close shops use a desktop's larger capacity
while extra small groups avoid remote branch-jump remainders. It is a connected
neighborhood contract, not a universal pairwise3-kilometer guarantee. Do not mutate
coordinates or reapply area offsets. Existing public scope stays bounded to200.
The nearby-area threshold is3kilometers: an individual shop icon is permitted
ONLY if no other eligible current-scope shop is within that distance. If a peer
exists, the shop must belong to a numbered final group, including forced one-card
accessibility partitions. The previous800m threshold incorrectly treated many
ordinary city neighbors as isolated; the separate display-offset bound stays800m.

GIVEN screen-admitted final groups WHEN zooming out THEN normal hierarchical
clustering merges nearby final groups and isolated shops into larger outer
circles. Their number is the total businesses, not the number of subgroups.
Clicking an outer aggregate zooms toward its expansion level; it NEVER opens a
large shop modal. As zoom increases, outer circles separate into their children.
Only at the maximum supported zoom (normalized18, native raw17) do final
nearby groups stop splitting and clicking opens every admitted member together.
If a final group is already visible below that level, its click zooms to18
instead of opening the modal. Any numbered circle below maximum is a zoom action. Final group IDs never subdivide with zoom.
Use the existing Supercluster dependency over final groups as weighted points,
not raw shops; source maxZoom17 yields final leaves by normalized18. No new
provider/dependency. Every zoom represents each eligible ID exactly once.

Screen-capacity or actual eligible-data/filter changes may recompute final groups;
saved state must match an exact current final group. Outer aggregate IDs/keys never
authorize a modal; restored final-group state below maximum cannot open one. Leaflet maximum18 and MapLibre raw17 retain matched scale;
source capability19 stays separate. Current public scope remains200 and legacy
server nearbyGroups remains older-client compatibility only. Counted-circle labels below maximum
state Zoom in; final circles at maximum state View businesses in all five languages.

GIVEN coincident circles WHEN rendered THEN use bounded deterministic circle
spacing for the full current scope before viewport filtering, capped at800meters
from each true public centroid. At broad zoom, ordinary outer clustering handles the nearby groups; never
visually move circles to another town or country. Only final leaf circles need
small bounded spacing, without changing final membership. Skip impossible spacing
searches and retain true anchors at wrapped/polar edges. Show plain numbered
circles ONLY: no connecting lines, centroid dots or extra geometry. Preserve the
orange/white design and48px targets. At broad zoom aggregate circles replace overlapping nearby leaves; final
all-fit groups remain the terminal level rather than splitting into shop icons.

GIVEN a final circle at maximum zoom WHEN clicked THEN open only its current
members, all at once; below maximum its click zooms instead.
GIVEN SDK zoom completion updates parent state after rendering marker roots WHEN
the final circle is activated THEN use the latest current callback and current
maximum-level authority, never an earlier render’s pre-maximum callback. Test
ordinary zoom then terminal activation without an intervening language/filter
change; no extra click or map pan should be required.
Selecting a card opens the existing business detail preview; Back returns to that
same still-valid group and Close returns to the unchanged map. Opening the full
shop and returning preserves valid group/selection/focus/camera. A capacity change
revalidates or clears the group; no hidden/off-route modal or stale membership.

GIVEN short Market stages WHEN controls render THEN full48px zoom/reset, transport
and panel-handle targets stay unobstructed. Below viewport height600 omit only the
duplicate Market title/info strip; brand/About remain. Actual Chrome must click
all affected controls at320×480 and844×390 without force or writes. Web short-height layouts must reclaim the duplicate Market
strip, use a horizontal map control row and a compact transport dock clear of the
panel handle; narrow the inactive content peek if necessary while retaining the
reachable switch. Keep normal-height desktop/390×844 layout unchanged. Actual
320×480 exposed a132px stage crowded by tools/dock/peek. The scoped correction
now verifies a180px visible/actual map, horizontal controls and compact dock,
with normal-height layout unchanged; final current-source journeys remain gated.

Ready: screen capacity, compactness/group invariants, no-scroll/no-pager admission,
plain-circle UI, current membership/privacy, zoom/resize distinction, localization,
short-stage geometry, tests and local-only rollback are explicit before edits.
Focused tests cover capacities1..6, compact partitions/branching worlds, exactly-once
IDs, isolated/forced single distinction, stable terminal order, normal outer merge/expansion/counts, current scope,
wrapped bounds, bounded spacing and all-fit layouts. Actual installed Chrome web
and Expo must verify desktop>3 when available, phone-fitting groups, no lines,
no paging/scroll, detail/return and real API filter/clear. Labelled dense fixtures
supplement current local catalog; installed native/OS behavior remains separate.
Visual/full/acceptance/release/commit/hosted/new-Android gates remain pending.

Shared policy: `lib/map/map-clustering.ts`. Primary spacing precedent:
[Overlapping Marker Spiderfier](https://github.com/jawj/OverlappingMarkerSpiderfier-Leaflet).
Only bounded spacing is reused, without connecting legs or a new dependency.

GIVEN Expo Leaflet initializes before its flex container reaches its actual size
WHEN the container becomes visible or changes size without a window resize or
height-prop change THEN invalidate only the owned SDK viewport using the existing
center-preserving resize contract and redraw current markers. Observe actual
container dimensions; coalesce work, ignore zero-size/hidden layouts, disconnect
and cancel on unmount. An initial valid layout must not require the user to
resize the browser. Prove0→visible layout without a window event, current markers,
camera bounds and cleanup with real React/Leaflet; actual844×390 must start and
complete the ordinary group journey. No grouping/copy/style/data change.

GIVEN compact map controls switch from a right-aligned column to a left-aligned
row WHEN React Native Web resolves the styles THEN explicitly clear the inherited
right inset with auto; undefined must not leave a full-width invisible toolbar.
Only the visible control row occupies the hit area; the remaining map accepts
normal cluster activation and panning. Verify installed RNWeb style resolution
and actual844×390 toolbar geometry/background hits, preserving48px buttons and
normal portrait layout. No color, cluster style or backend change.

## Problem and outcome

City venues hide the real location of an otherwise isolated business and make
geographic discovery feel artificial. Visitors also need a second, explicitly
curated way to browse the same businesses without confusing a scheduled
showroom presentation with the physical map.

The outcome is an application-first marketplace where only geographically
isolated businesses use individual shop icons. Normal outer circles merge nearby
final groups when zoomed out and click to zoom in. An already-separated final circle
opens its screen-admitted members together over the unchanged map. Its terminal
members never subdivide; every card fits without scrolling or a pager. A separate weekly
country-wide program presents one industry as Daily Featured Showrooms on every
day of the week in a calm, bounded media-card gallery.

## Scope

### In scope

- Individual business markers at reviewed WGS84 coordinates.
- Screen-sized final groups, with click/tap at maximum opening all members.
- Normal outer aggregation of screen-admitted final groups; only isolated
  businesses retain shop icons; forced one-card groups remain numbered circles.
- One modal business picker with readable image cards, no pagination
  or internal list scrolling and no route navigation. Selecting a card replaces
  its list with the existing detail; Back restores the selected card in that final group.
- A policy-compliant OpenStreetMap Standard basemap requested directly by the
  visitor's browser for the visible viewport through one provider registry.
- A combined eligible map that loads immediately behind a required initial
  orientation chooser. The visitor explicitly chooses one of seven industries
  or **All industries** as the eighth and final option before continuing.
- One compact teal map command area containing result context, live search,
  region/city filter, Near me action, and map controls directly above the map.
- A fixed Monday-through-Sunday date selector for the Ethiopia-local calendar
  week with one stable assigned industry on each of all seven days.
- One dynamically sized Daily Featured gallery with up to forty responsive
  image-led showroom cards, stable numbered references, and ordinary vertical
  page scrolling without a simulated venue, hall, pagination, or zoom controls.
- Full business identity, the published business-page hero image, preview, and page links
  only for today's selected Daily Featured; every other date exposes anonymous booth
  outlines and schedule information without business identity or media.
- One Daily Featured program from 08:00 to 22:00 Ethiopia time, split into
  08:00–13:00 and 17:00–22:00 sessions around a four-hour intermission. The
  status identifies booth, transition, sponsor-break, intermission, and ended
  states without inventing provider accounts.
- A compact storefront badge that zooms before opening a richer preview and permanent
  **Visit Showroom** destination.
- Truthful merchant-controlled live status on map aggregates, exact showroom
  markers, nearby-group cards, and today's Daily Featured cards, with the active
  Suqpage Daily Featured walkthrough taking presentation precedence for its current booth.
- Mobile-first touch, close-proximity geographic zoom, map reset, and ordinary
  vertical scrolling.
- Viewport-bounded map rendering that remains usable on low-end phones as the
  eligible marketplace grows into thousands of businesses.

### Non-goals

- Claiming a physical map venue, Daily Featured building, street navigation, routing,
  turn-by-turn directions, or authoritative boundaries.
- Placing virtual Daily Featured floors over the geographic map.
- Treating display groups as authoritative physical neighborhoods, exact
  business distances or city boundaries.
- Geocoding, routing, tile proxying, prefetching, bulk downloads, offline tile
  packages, or service-worker caching of third-party map tiles.
- Hiding a published active showroom because a manual renewal date elapsed.
- A ranked or paginated public List mode separate from the geographic map.

## Domain language and invariants

- **Daily Featured Showrooms:** the only visitor-facing name for the scheduled
  seven-day industry program. Retired `expo` identifiers may remain only in
  immutable historical records where renaming would weaken data integrity;
  active public, application, URL, analytics, style, and persistence contracts
  use Daily Featured language.

- **Geographic Showroom marker:** one eligible business at its public display coordinates.
  It uses a compact fixed-size map-pin silhouette containing a familiar upright
  storefront and a short merchant name. Its visible silhouette remains smaller
  than the numbered cluster core and has no decorative halo, while a transparent
  44px interaction target preserves phone usability. Appearance follows the
  accepted S85 shop-marker refinements below; S127 preserves existing
  counted-marker and status styling. It distinguishes one showroom
  from an aggregate and does not load booth photography into the map renderer.
- **Cluster / map group:** a fixed screen-capacity partition of one connected
  3-kilometer neighborhood in the current eligible projection. Sorted public IDs
  identify it; its final members never subdivide; outer aggregates merge these groups on zoom-out. Only isolated
  one-business neighborhoods use an individual storefront marker.
- **Weekly industry Daily Featured:** a virtual, country-wide presentation of one stable
  industry assigned to each day of the week. All seven days use the same Daily Featured
  floor, eligibility, preview, and booth-reference rules.
- Map, Featured, and Daily Featured share the same server-authoritative eligibility
  rules, but not the same selection state. Map industry/search controls do not
  alter the date-selected Daily Featured.
- Merchant live state is displayed only when the stored platform and HTTPS link
  pass the existing provider allowlist. The current Daily Featured walkthrough business is
  labeled **Featured now** across any visible map or card representation. That
  presentation temporarily replaces its merchant **Live** badge without changing
  the tenant's saved live setting; all other valid live businesses remain labeled.
- Saved business coordinates remain authoritative; existing city-area display
  offsets remain visual-only. Fixed groups follow S127 connected neighborhoods and
  screen-sized compact partitions through every supported zoom. Legacy server nearbyGroups remain a compatible
  response and no longer decide current visual membership.
- Activating a counted circle below maximum zooms toward its expansion level.
  Only maximum18 final circles open every current member together without
  pagination. Final membership stays intact while outer clusters merge on zoom-out;
  only isolated businesses retain individual shop icons.
- A location option represents businesses near that named place, not a claim
  that every result lies inside an authoritative city boundary.
- Every Daily Featured business occupies one stable card position in one
  continuous gallery. At most forty eligible businesses participate on a
  selected date. Image-led cards preserve a readable name, location, reference,
  schedule, and status while responsive columns grow downward without pagination.
- Daily Featured booth references are `{industry-code}-B{booth}` and deterministic for an
  unchanged selected result set.
- The published business-page hero image is the single image authority for map
  detail inspectors, nearby-result cards, and today's Daily Featured cards.
  Discovery does not maintain or prefer a separate booth illustration. A named
  fallback handles file failure without creating eligibility. Non-today
  previews receive neither identity nor media.

## Contracts

- Industry, bounded search, place, and selected Daily Featured weekday
  remain URL-addressable and server-authoritative where they affect data.
- Bounded search suggestions use only eligible public showroom names,
  published offering names, and reviewed city/region labels from the active
  map scope. Suggestions never alter Daily Featured Showrooms eligibility.
- Omitted or invalid industry state projects the de-duplicated combined result
  set behind the centered required industry chooser. Choosing one of the seven
  canonical industries loads only that eligible result set; choosing the final
  **All industries** option keeps the combined result and closes the chooser.
  Cross-listed businesses appear once, and the scheduled Daily
  Featured Showrooms industry remains controlled only by its selected weekday.
- Every projected showroom has one deterministic primary visual industry: its
  earliest membership in the canonical seven-industry order. This presentation
  identity coordinates the industry menu and nearby-card accent without changing any cross-list membership or selected-industry
  eligibility. Geographic clusters and individual markers remain uniform teal.
- Region/city filtering is URL-addressable and server-authoritative for the Map.
  Available options derive only from eligible reviewed business
  profiles and never imply an authoritative administrative boundary. A fresh
  place-scoped view starts around its filtered reviewed coordinates; a valid
  same-tab saved transform still wins when the visitor is returning.
- **Near me** requests browser geolocation only after an explicit visitor
  action. A granted coordinate is used in memory to center the local map and is
  not persisted, logged, added to the URL, or sent to the application server.
  Denial or browser failure leaves all region/city and national controls usable.
- Public filters and selected program date are durable URL state. Opening
  a permanent showroom records the current public workspace as its same-tab
  return destination. The last non-geolocation map transform, open nearby
  group, and selected business preview may be retained in same-tab session
  storage for two hours so the Suqpage Back to Market control restores the
  exact viewer that launched the page; they do not alter eligibility.
  A **Near me** coordinate or transform derived from it is never persisted.
- The stable weekly assignment is Monday Electronics, Tuesday Beauty & Care,
  Wednesday Food & Beverage Production, Thursday Machinery & Industrial,
  Friday Home & Building, Saturday Fashion & Textiles, and Sunday Agriculture
  & Primary Produce.
- The seven-date selector remains in fixed Monday-through-Sunday order and
  labels the current Ethiopia-local calendar week. Weekday controls never
  reorder as the week advances; the persistent **Today** indicator moves to the
  applicable fixed weekday. Within today's gallery only, cards rotate around
  the current or most recently completed presentation according to FE-033 while
  retaining stable references and times.
- Today uses the same strong teal treatment as the active industry card without
  saffron or warning color. A different selected date uses a separate temporary soft treatment and
  returns to today after six seconds; choosing another non-today date restarts
  that timer while preserving map industry, search, and place state.
- Every selected date uses the policy and optional date-specific lineup governed
  by FE-033 and BE-029. The default sessions are 08:00–13:00 and 17:00–22:00
  Ethiopia time, separated by a 13:00–17:00 intermission. Provider actions
  render as links only when validated public HTTPS TikTok and YouTube URLs are
  configured.
- Booth order is divided into deterministic non-overlapping walkthrough slots
  after reserving changeovers and sponsor breaks. Every booth shows its EAT
  range. Exactly one current booth may receive the active treatment during a
  presentation; transitions, breaks, and intermission identify no current
  business. Future previews may show slot times but never business identity.
- Map controls use familiar zoom/reset icons with accessible names. Shared
  Location floors use ordinary vertical scrolling and no zoom controls. Daily
  Featured uses ordinary responsive cards. Industry selection uses a labeled
  menu after the required centered first choice; there is no public
  Map/List mode switch.
- At 320px and 390px, all primary controls are at least 44px, horizontal rails
  are bounded without horizontal day-selector scrolling, the document has no
  horizontal overflow, and the map remains
  pannable without trapping page scrolling outside its stage.
- The map command area avoids duplicate filter rows and keeps the map within the
  first painted mobile and desktop viewport.
- Every numbered group opens one image-led picker above the live map. All
  screen-admitted cards appear together without list scrolling or pager controls.
  Individual detail may scroll. Back preserves the selected card; Close preserves
  the map. Resize revalidates the group against the new all-fit capacity.
- Final membership is fixed geographically within the current screen capacity;
  ordinary outer clusters merge final groups as the visitor zooms out. Larger neighborhoods partition into screen-sized circles; bounded
  badge spacing separates coincident circles without lines or changing GPS data.
- Daily Featured uses width-responsive CSS-grid columns, dimensioned lazy media,
  and no simulated architecture, transform loop, or React rerender for scroll frames.
- Group cards stay in a bounded modal picker with no ornamental
  venue, floor, hall, or platform. The panel fits the available viewport safe
  area while the unchanged map remains visible behind its backdrop, and
  uses mutually exclusive **business list** and **showroom detail** states. The
  detail state provides **Back to businesses** and an action to open the page; Close
  and Escape dismiss either state without losing map position. Daily Featured
  references advance left-to-right and then top-to-bottom through its responsive
  card grid without changing schedule, sponsor placement, or walkthrough behavior.
- Exactly five staff-selected paid sponsor placements compose into a right-side Daily Featured information
  rail on desktop. A placement may link to an eligible Suqpage showroom or be
  a validated external ad with its own uploaded image, name, short details, and
  HTTPS website or normalized telephone action. External ads do not create
  showroom, business, product, or discovery records. The
  pool is global and does not change with map industry, search, place, or Daily Featured
  day. The rail and gallery share one bounded workspace. Desktop shows all five. On phones
  the five-item pool becomes one locked two-card slot above the gallery; exactly
  two distinct clickable sponsors are visible, and a different random pair
  replaces them automatically without scrolling, dragging, pausing, or controls.
  A current sponsor-break assignment overrides random rotation: its placement
  leads with a visible **Sponsor spotlight** state until that segment ends.
- At phone widths the fixed seven-day selector becomes one compact touch-sized
  row inside the program header. It remains inside the Daily Featured section, keeps
  Today and selected-date states distinct, and does not overlap cards or gallery
  controls. The long selected-day description is visually omitted while its
  title and livestream status remain available.
- Leaflet requests the exact policy-approved OpenStreetMap Standard URL only
  for the active viewport. It uses provider/browser caching, zero retained tile
  buffer, idle updates, no zoom-animation tile refresh, and no retina duplicate
  requests. Suqpage never proxies or preloads those tiles.
- Geographic zoom commits cluster and individual-marker
  reconciliation only after movement settles. The shared hierarchy uses
  committed zoom for normal outer merging/expansion and bounds for visibility; off-screen businesses
  remain searchable but do not create marker DOM nodes.
- At its current camera, a separated final counted marker opens every admitted card
  together without pagination or further zoom. Leaflet's basemap
  supplies road and place labels; Suqpage does not mount duplicate local labels.
- Selecting an individual map page opens a compact accessible modal preview.
  Selecting a business within a group replaces the list inside the same modal,
  with no second popup. The unchanged map remains visible behind a restrained
  backdrop while focus stays within the active preview. Daily Featured may
  use its own preview. Close, scrim click, and Escape return
  focus without losing the visitor's map, filter, or program state.
- The desktop industry menu is no wider than its trigger. Labels wrap within
  that width, and the menu remains inside the map command surface at narrower
  desktop/tablet widths. Phone industry selection continues through the bounded
  Filters sheet rather than spanning across the map.
- Visible OpenStreetMap attribution remains inside the map and links to the
  copyright and licence source on phone and desktop.

## Scenarios

```gherkin
Scenario: An outer circle zooms in until a final group can preview
  GIVEN nearby final groups are merged into an outer circle below maximum zoom
  WHEN the visitor activates it
  THEN the map zooms toward its expansion level without opening a shop modal
  AND every public business remains represented exactly once
  AND at maximum18 a final group's activation opens all its screen-admitted cards
  AND the final modal activation leaves map center/zoom unchanged
  AND dense final groups never split into individual shop icons
  AND saved business coordinates remain unchanged

Scenario: Large marketplace map remains viewport bounded
  GIVEN thousands of eligible showrooms exist and the map projection contains at most 200 scoped businesses
  WHEN a visitor pans or zooms on a constrained phone
  THEN Leaflet moves its existing tile and overlay panes during the gesture
  AND cluster and marker reconciliation occurs after the gesture ends
  AND only the bounded visible viewport contributes showroom marker nodes
  AND map labels come from visible provider tiles rather than duplicate local DOM nodes

Scenario: Browser loads the detailed basemap within provider policy
  GIVEN the marketplace map is visible
  WHEN the visitor pans or zooms
  THEN the browser requests only visible tiles from https://tile.openstreetmap.org/{z}/{x}/{y}.png
  AND visible OpenStreetMap attribution remains available
  AND Suqpage does not proxy, prefetch, bulk-download, or service-worker-cache those tiles
  AND showroom search and place filtering continue to use the Supabase catalog

Scenario: Visitor opens a final counted group at maximum zoom
  GIVEN a screen-admitted final group is visible at normalized18
  WHEN the visitor activates its counted marker
  THEN a modal picker opens over the unchanged map without route navigation
  AND every current member renders together without paging or inner list scroll
  AND no Previous/Next/range controls or connecting lines exist
  AND closing returns focus without losing map state
  AND the same numbered circle below maximum would zoom instead of opening

Scenario: Visitor inspects one showroom from a counted group
  GIVEN the picker shows all members of a current final group
  WHEN the visitor selects one showroom
  THEN that showroom's detail replaces the list inside the same inspector
  AND no second popup, scrim, or obscured nearby panel remains on screen
  AND Back to businesses restores the selected business's card and focus
  AND the support launcher does not overlap the active inspector

Scenario: Isolated business remains independently discoverable
  GIVEN one eligible business is not near another at the active zoom
  WHEN the map renders
  THEN the business has its own compact storefront badge at its reviewed coordinates
  AND its first activation below local-detail zoom centers and enlarges the map
  AND activation at local-detail zoom opens the richer preview with a Visit Showroom action

Scenario: Visitor changes map industry
  GIVEN the map and the selected date's Daily Featured are visible
  WHEN the visitor chooses another industry
  THEN map clusters and markers use the newly selected eligible result set
  AND the date-selected Daily Featured remains unchanged

Scenario: Visitor opens a fresh place-scoped map
  GIVEN the visitor selects a reviewed region or city without a saved transform for that scope
  WHEN the filtered map opens
  THEN its initial view is centered around the filtered reviewed coordinates
  AND nearby results remain reachable through ordinary zoom controls
  AND a valid saved transform is preserved on a later same-tab return

Scenario: Visitor receives an industry orientation choice over the loaded map
  GIVEN eligible published showrooms exist across multiple industries
  WHEN geographic discovery opens without an industry query
  THEN the de-duplicated combined map is projected behind a centered required chooser
  AND the chooser lists seven specific industries followed by All industries
  WHEN the visitor chooses one canonical industry
  THEN the chooser closes and that industry's eligible businesses appear on the Map
  AND the selected day's Daily Featured Showrooms industry remains unchanged

Scenario: Visitor keeps the combined marketplace
  GIVEN the initial industry orientation chooser is open
  WHEN the visitor chooses All industries
  THEN the chooser closes without filtering the de-duplicated combined map
  AND cross-listed businesses still appear only once

Scenario: Selected-industry map opens a counted group directly
  GIVEN one fixed nearby group contains eligible businesses in the selected industry
  WHEN the visitor opens its marker
  THEN every member is visible together in the final-group picker without another industry choice
  AND closing preserves the selected industry and map transform
  AND the viewer exposes no scheduled row or booth numbers

Scenario: Industry menu remains attached to its trigger
  GIVEN the desktop or tablet map command surface is visible
  WHEN the visitor opens the industry selector
  THEN the menu is no wider than the selector trigger
  AND long industry labels wrap without crossing the map or viewport edge

Scenario: Visitor filters the Map by place
  GIVEN eligible showrooms exist in more than one reviewed region or city
  WHEN the visitor chooses an available region or city
  THEN the server returns only matching eligible Map records

Scenario: Visitor chooses Near me
  GIVEN the browser supports geolocation
  WHEN the visitor explicitly activates Near me and grants permission
  THEN the map fits around the visitor's general area
  AND the exact visitor coordinate is not stored, logged, placed in the URL, or sent to the server
  AND denial leaves the national marketplace usable

Scenario: Visitor returns from a showroom
  GIVEN the visitor chose filters, a map transform, or a nearby-group marker
  before opening a permanent showroom
  WHEN the visitor activates the persistent Back to Market control in the same tab
  THEN the explicit public workspace that launched the showroom is restored before any older browser-history destination
  AND its authoritative URL filters are restored
  AND the prior non-geolocation map transform, nearby-group viewer, and selected business preview are restored when still valid
  AND the group page containing the selected business is restored from current eligible public references
  AND no visitor coordinate is read from storage

Scenario: Today's featured program preserves a readable bounded floor
  GIVEN today's assigned industry has more than forty eligible businesses
  WHEN today's Daily Featured renders
  THEN exactly the first forty eligible businesses in authoritative order have booths
  AND every card retains the business-page hero or fallback mark, business name, reference, schedule, and status
  AND large and phone screens use readable columns and ordinary vertical floor scrolling when needed
  AND no hall, page selector, or hidden overflow record exists

Scenario: A dense area uses several small fixed groups
  GIVEN sixteen nearby eligible businesses belong to one connected neighborhood
  WHEN any supported map zoom renders
  THEN deterministic groups each respect current capacity and every ID occurs once
  AND zooming out can aggregate groups while final member IDs stay unchanged
  AND only a final circle at maximum opens its admitted members together
  AND collision display offsets never rewrite coordinates or combine those groups

Scenario: Visitor previews another program date
  GIVEN the visitor selects a date that is not today
  WHEN that Daily Featured preview renders
  THEN its expected booth slots appear as anonymous outlines
  AND no business name, image, handle, preview, or showroom link is exposed
  AND the schedule clearly identifies today's live Daily Featured
  AND after six seconds the selected Daily Featured returns to today

Scenario: Weekly schedule keeps stable positions
  GIVEN the Ethiopia-local day advances during the week
  WHEN the Daily Featured schedule renders
  THEN its cards remain ordered Monday through Sunday
  AND only the selected-teal Today indicator moves to the current weekday
  AND no saffron highlight is used for the current date

Scenario: Sunday presents the seventh industry Daily Featured
  GIVEN Sunday is selected
  WHEN the weekly program renders
  THEN Agriculture, livestock & primary produce is the stable assigned industry
  AND the same Daily Featured floor, preview redaction, and booth rules used on other days apply

Scenario: Daily Daily Featured broadcast changes state truthfully
  GIVEN the selected date uses two active sessions around a four-hour intermission
  WHEN the program has not started, its scheduled window is underway, is on a
  program break, or has ended
  THEN the UI shows the EAT start time, scheduled-window status, active program
  detail, or ended status, respectively
  AND scheduled time alone never claims that TikTok confirms an external stream
  AND the ended state directs visitors to configured YouTube recordings
  AND an unconfigured provider destination never renders as an invented link

Scenario: Live walkthrough identifies the current booth
  GIVEN today's Daily Featured has eligible booths and the TikTok walkthrough is active
  WHEN the current Ethiopia time enters a booth's consecutive schedule slot
  THEN that booth is the only booth marked Live now
  AND the broadcast status names its booth reference and revealed business
  AND every booth retains a visible scheduled EAT time range

Scenario: Merchant live status yields to the active Daily Featured spotlight
  GIVEN a business enabled a valid merchant live session
  AND that business is the current Suqpage Daily Featured walkthrough booth
  WHEN its map marker, nearby-group card, Daily Featured card, or preview is rendered
  THEN it is labeled Featured now instead of merchant Live
  AND other valid merchant live businesses remain labeled Live
  AND the saved merchant live setting is not changed

Scenario: Invalid retained live data reaches discovery
  GIVEN a retained row is marked live with an invalid provider destination
  WHEN public discovery is projected
  THEN no live badge or unsafe destination is serialized for that business

Scenario: Basemap tiles fail
  GIVEN the configured tile provider cannot load visible map tiles
  WHEN the visitor opens discovery
  THEN a clear bounded status explains that map detail is temporarily unavailable
  AND available showroom markers and controls remain usable over the neutral map surface
  AND Daily Featured and directly addressed permanent Showrooms remain available
```

## Quality impact

- Security and tenant isolation: only the public projection is serialized; no
  private contacts, request text, or media storage keys enter map or Daily Featured data.
- Privacy and data retention: reviewed business coordinates are intentionally
  public discovery data; visitor location is requested only after a clear user
  action, remains in browser memory for map fitting, and is never retained.
  Direct basemap requests disclose ordinary request metadata to OpenStreetMap as
  stated in the public Privacy notice; no search, account, or showroom record is
  included in a tile URL.
- Accessibility and responsive behavior: keyboard markers/clusters/gateways,
  labeled modal previews with focus containment, close and Escape behavior, accessible controls, reduced motion, touch
  targets, and bounded previews.
- Localization and merchant-entered values: long place/business names truncate
  or wrap without changing marker/control geometry.
- Performance and limits: bounded 200-business public projection, shared
  normal hierarchy ending in screen-capacity final groups at normalized18, move-end rendering,
  visible browser tiles, all screen-admitted cards without internal list scroll, and one
  vertically scrolling Daily Featured layer with lazy dimensioned media.
- Failure recovery and idempotency: basemap tiles fail independently; Daily
  Featured and directly addressed permanent Showrooms do not depend on tile availability.

## Observability

Browser tests record asset failures and console errors without capturing search
text or visitor identifiers. Existing privacy-preserving visit analytics may
attribute `directory` and `expo` showroom entries.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Eligibility, legacy nearbyGroups compatibility, weekly schedule, Daily Featured redaction, and card references | integration | `scripts/test-discovery.ts` |
| Shared screen distance, terminal grouping, bounded membership and adaptive capacity | focused | `scripts/test-map-clustering.ts` |
| Current final membership, all-fit list, preview/back and focus restoration | focused | `scripts/test-map-group-picker-web.ts` |
| Native SDK bounds, picker/Market lifecycle and current public references | focused | `scripts/test-mobile-map-groups.ts`, `scripts/test-mobile-market-layout.ts` |
| Real Leaflet marker focus after reprojection | browser | `scripts/test-web-map-lifecycle.ts` |
| Fresh marker callbacks, flex0→visible recovery, camera and owned cleanup | focused/browser | `scripts/test-mobile-map-lifecycle.ts` |
| Compact row bounds and real RNWeb inherited-inset resolution | focused | `scripts/test-mobile-market-layout.ts`, `scripts/test-web-market-short-layout.ts` |
| S128 keyed scope settlement, committed restoration and obsolete response fencing | focused | `scripts/test-market-workspace-ui.ts`; current data must settle and the restored group/selection/camera commit before SDK callbacks persist view |
| S128/S136 size-only changes preserve the raw SDK camera within half a projected pixel and retain geographical intent without compounded quantization | focused/browser | `scripts/test-web-map-lifecycle.ts`, `scripts/test-mobile-map-lifecycle.ts`, `scripts/test-leaflet-resize-center.ts`; shared weak map-instance intent, independent raw SDK/persisted-view assertions, fractional parity/remount, pan/zoom takeover, zero-size and disposal guards; FE-065 S136 controls Ready and actual-return proof |
| S128 combined search/filter/reload/clear → final group → full showroom → Back | browser | `.local/market-toolbar-s128/workflows-verified/outcome.json`; actual local API outcomes and full-precision SDK camera readback; visual/full gates pending |
| Group activation, all-fit list, preview and full-page return | browser | Actual installed Chrome/Expo29checks/59states; `.local/map-groups-s127/actual/final-platform-verified.json`; visual approval pending |
| Desktop/390px/320px map, nearby viewer, and Daily Featured layout | visual/browser | `scripts/capture-discovery-visuals.mjs`; S159 requires actual Chrome and Expo review |
| Exact tile provider, attribution, CSP, no proxy/prefetch/cache | contract | `scripts/test-discovery-geography.mjs` |
| Basemap failure and Daily Featured recovery | browser | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

The browser basemap changes no canonical data. Current disposable fixtures may
be reset. Rollback deploys the prior first-party geography renderer and leaves
reviewed discovery profiles intact. Inactive local assets remain available only
through the monitored rollback window.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Evidence

Evidence: completed locally on 2026-08-01. Focused discovery tests prove the
fixed Ethiopia-local Monday-through-Sunday schedule and sequential references,
business-owned presentation media, media-gated Daily Featured eligibility, and identity/media
redaction for every non-today date. Browser acceptance passed all 10 workflows,
including the six-second return to persistently highlighted today and the reduced
nearby-group transition. Desktop, 390px, and
320px visual captures passed with no overflow, no halls, anonymous preview
slots, complete today booths, and 44px-or-larger controls. `npm run check` and
`npm run release` passed. Production rollout and TikTok configuration remain
excluded.

Reopened on 2026-08-09 for the global five-business sponsor pool, retained
established map symbols with live/featured indicators, and non-modal floating
showroom inspector.
Focused data, migration, type, homepage, narrative, and spec gates pass. Fresh
Chromium evidence proves the industry menu remains exactly within its 276px
trigger, the desktop inspector is centered over a 14% scrim without making the
map inert, the phone sheet clears navigation by 72px with zero overflow, and
the established showroom/city-market markers expose live and featured presence.
User visual approval remains pending before the complete release suite.

Reopened on 2026-09-01 so map detail inspectors, nearby-result cards, and
Daily Featured cards use the published business-page hero instead of separate
booth artwork. `scripts/test-discovery.ts`, `scripts/test-featured-schedule.ts`,
and typecheck pass. Focused Chromium captures at 1440px, 390px, and 320px prove
decoded hero pixels and exact hero-path identity in the centered map inspector,
revealed Featured cards, and their preview. User visual approval remains pending
before the complete release suite.

The 2026-08-09 terminology follow-up retains internal `expo` compatibility
identifiers while focused browser evidence proves every visitor-visible and
accessible program label uses Daily Featured Showrooms and renders no legacy
Daily Featured wording.

The 2026-08-24 marketplace follow-up preserves an explicit **All industries**
choice while keeping discovery map-only. Integration evidence proves the
omitted and explicit `all` states include every eligible industry, de-duplicate
a cross-listed business, group nearby markers into bounded map viewers, and
leave the weekday-selected Daily Featured projection unchanged. Full release
evidence is recorded in TRACEABILITY after the final gate.

The 2026-08-10 search follow-up adds the bounded public autocomplete defined by
FE-030 and BE-023. Focused integration and Chromium evidence prove suggestion
eligibility, keyboard/touch selection, URL-backed map updates, and no
effect on Daily Featured Showrooms selection.

## S85 — orange shop markers and readable business names

Ready, L1 appearance refinement on desktop/phone web and native/Expo maps.
GIVEN a shop marker on the normal light/cream basemap THEN its body is solid
Suqpage orange with a thin continuous white outline around the shop and roof,
following the owner's latest visual trial. White shop details remain inside.
Business names use a solid high-contrast nameplate and readable text,
with bounded wrapping and the full accessible name retained. Selected markers
remain distinct. Latest owner correction: use a warm orange shop treatment and
cream/orange nameplate, without black/charcoal or near-black outlines. Keep
counted clusters, nearby-group markers and status badges to their prior styling;
they were not requested for redesign. Preserve counts and authoritative presence.

GIVEN normal/selected labels THEN text/background contrast is at least 4.5:1;
the orange shop fill contrasts at least 3:1 against a representative cream tile.
The white rim itself has lower contrast on cream; keep it thin and retain the
existing compact glyph and web shadow rather than introducing a second outline.
Reuse the established native shop/roof SVG contours on web for a continuous
white edge; retain its compact 25px layout slot and existing marker anchors.
Retain the established Suqpage orange palette, glyph geometry, map anchors,
clustering, saved/display coordinates, viewport limits, selection/preview and
keyboard/touch behavior. No new basemap/provider/data/role or geographic change.

Focused tests: existing native map/group/offset cases, both types and browser
computed-color/label/click/zoom checks. Capture before/after desktop/phone states
on web/Expo using a clearly recorded light tile fixture and real public catalog,
then review on actual OSM tiles. Native device/new APK and full/release/commit/
rollout gates stay distinct and follow visual approval. Master §§4/10/19/22 affected.

Local evidence (2026-10-07): both types, homepage composition and spec validation
pass. capture-map-marker-contrast.mjs covers thin white shop/roof contours,
orange-fill and normal/selected label contrast, real selection/preview/no zoom-out
and the then-current cluster keyboard expansion. Current white-edge 1440/390/320 web/Expo and
actual OSM desktop/phone views are in .local/map-marker-white-edge-review/.
Normal/selected name contrast is 4.83/5.24:1 and orange-fill-to-cream is 3.09:1;
the white outline is not claimed to contrast 3:1 against cream. Original cluster/
nearby/badge styling and native behavior were separately verified in the warm
iteration and remain unchanged; group rims are also asserted by the current capture.
Visual approval, full gates, task commit and rollout remain pending; no new APK
or physical-native claim. No coordinate/catalog/provider/dependency change.

The earlier charcoal/dark-border capture is rejected and the orange-edge trial
is superseded. The thin-white-edge trial is the current focused-tested candidate;
owner visual approval remains pending. Earlier capture folders retain trial evidence.

## S86 — dispersed Addis demo map

BE-020's one-time local demo correction updates the shared authoritative public
profile coordinates. GIVEN the Addis city filter on desktop/phone web or native
browser THEN the same eligible demos appear across the city, with existing
approximate-area labels, original cluster styling, normal zoom grouping and
selection/page previews. Exact-coordinate or unmarked shops are not relocated.
Counts, filters, pagination and other-city placements are preserved. Capture
actual local public map before/after; record counts and matching web/mobile DTO
coordinates. This is demo data correction, not a new map/global-offset behavior.

The city capture exposed an independent native/Expo shop-hitbox defect: the
96px transparent wrapper can intercept another visible shop. GIVEN adjacent
shops THEN empty wrapper space passes through while each shop retains a 44px
glyph hit area, clickable visible name and full keyboard/accessibility label.
Preserve visual glyph/name positions, marker anchors, colors and all counted-group
styling/behavior. Test real icon pointer selection in the dispersed-city capture.
