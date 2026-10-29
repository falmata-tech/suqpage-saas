---
id: FE-065
title: Independent business-map and product-card discovery
status: in_progress
related: [FE-074, FE-026, BE-054, DEP-045, FE-030, FE-042, FE-049, FE-053, FE-059, BE-047, ADR-0027, FE-067, BE-044, FE-021, FE-052, FE-070]
owners: [product, frontend]
last_updated: 2026-10-26
change_level: L2
---

# FE-065 — Independent business and product discovery

## S181 — map-first discovery and visitor workflow review (ready)

L1 interface/interaction refinement on desktop web, phone web and Expo/native.
The map is the primary home task. This section supersedes S128/S109's requirement
to expose every filter button on compact screens; wide layouts retain direct
filters. API membership, search semantics, publication, contacts and chat routing
are unchanged. FE-021 S181 owns earlier, safe group activation; FE-053 and FE-049
retain native accessibility and meaning-led localization requirements. Affected
master sections are §§5, 10, 18 and 19.

1. GIVEN phone web or the native Market WHEN the page opens THEN show the owner's
   approved heading **Discover African farmers, manufacturers, and artisans in one place.**
   in English, with the existing natural Amharic/Afaan Oromo wording, without
   the full supporting paragraph. Keep that paragraph directly below the same
   heading on desktop web and on About. Do not translate merchant
   data or change the platform's African-made, bulk-and-small-order audience.
2. GIVEN a compact viewport WHEN no filter dialog is open THEN search and a
   labelled **Filters** action share one row, with at least 44px targets and a
   visible active-filter count. Keep search clearing distinct from **Clear all**.
   Phone web inputs use at least 16px text.
3. GIVEN Filters WHEN opened THEN use one existing dialog/sheet with an overview
   and existing Category/Country/City option views, plus Made to order only for
   products. Back returns to the overview; Done, Close, Escape and supported
   dismissal restore the trigger. No nested modal or hidden-only icon is required.
   Selections apply with the existing semantics; Country still precedes City,
   changing countries clears incompatible cities, and Clear all clears only the
   active scope. Search readiness, loading/error feedback and multi-select counts
   remain truthful. Wide layouts retain their direct filter access.
4. GIVEN ordinary text at 390×844 or 320×568 WHEN Market is settled THEN the
   visible map occupies at least 60% or 50% respectively of that viewport.
   Remove avoidable outer gutters and reserved marketing/footer height rather
   than shrinking touch targets or meaningful labels. The map fills its available
   phone width; counterpart handles may float over it without a blank side strip.
   At enlarged text or longer translations, readable wrapping and reachable
   controls take priority over these ordinary-font ratios. When those controls
   leave too little usable height on a short screen, allow the workspace to
   scroll to a usable map rather than compressing its canvas behind fixed
   navigation or the transport action. Preserve visible headings, language
   selection, at least 44px targets and the existing map-camera return behavior.
5. GIVEN the map WHEN attribution and transport controls render THEN the full
   OpenStreetMap contributors link floats inside its lower edge, remains legible
   and clickable, and clears the transport action, navigation and safe areas.
   Do not allocate a separate native white attribution footer or hide attribution.
   The compact legal link need not become another full-width 44px toolbar.
6. GIVEN independent business/product criteria, a group or a business preview
   WHEN switching panels, opening a Page/product, returning, changing language,
   clearing filters or recovering an empty/error result THEN retain the existing
   scoped query, camera, exclusion and stale-response fences. Product filters
   never silently change business-map criteria. Hidden panel controls stay inert.
7. GIVEN public Market navigation on desktop web, phone web or Expo/native WHEN
   its icon is shown THEN use the same recognizable storefront symbol with the
   existing localized Market label. Market includes both Business locations and
   Product listings; only the Business locations view retains its map symbol.
   Preserve navigation destinations, selected state and accessible names.

FE-021 S181's short/enlarged two-business picker fallback is the sole exception
to all-fit group cards: keep one bounded scroll body, current membership and a
reachable close route, and reveal the selected card before restoring its focus.
It does not turn a city aggregate into an unbounded scrolling catalogue.

Definition of Ready: scope, compact filter tradeoff, thresholds, localization,
accessibility, failure/return behavior and unchanged data/security boundaries are
explicit. Verify actual 1440px desktop, 390px/320px phone web and localhost:8082
Expo with synthetic map tiles and the intended local API/source. Exercise search,
country/city/category, active counts, clear/back, map groups, Page/product return
and transport intake/recovery; use disposable local fixtures and authoritative
readback for actual writes. Apply FE-076/BE-063 before any transport-copy or
routing edit. Record the agent's source-bound visual decision before full gates.
No native artifact, hosted data/configuration or deployment is admitted by preview.

Tests: `test-web-market-short-layout.ts`, `test-market-workspace-ui.ts`,
`test-mobile-market-layout.ts`, existing map/group/lifecycle and transport
launcher regressions, localization checks and actual Chrome/API journeys. Record
unexercised physical Android, keyboard, provider and language-review limits.

## S180 — first editable search after restoration (locally verified; delivery pending)

[FE-042 S25](FE-042-category-results-and-standard-page-workspaces.md#s22s24-approved-release-evidence)
still controls initial search readiness. The independent web workspace must
preserve that contract while restoring its URL/session state.

GIVEN server-rendered Market controls WHEN hydration and initial workspace
restoration have not committed THEN search, clear and filter controls remain
disabled. GIVEN those controls first become editable WHEN a visitor immediately
types a query THEN retain the exact text, update the canonical query and results,
and preserve the selected scope and filters. Restoration must not overwrite that
first accepted input. Normal later updates retain the existing focus, typing,
snapshot and stale-response behavior.
Readiness does not waive the existing country prerequisite for choosing a city.

The readiness correction preserves labels, native screens, API/data contracts
and the existing independent-feed behavior. Actual phone review also found that
the selected Category label broke inside its word. GIVEN Product listings at
320/390px in English, Amharic or Afaan Oromo WHEN filter counts are visible THEN
labels wrap only at natural word boundaries, counts stay separate and within
their buttons, and the filter row fits the viewport. Preserve the current font,
all labels and at least 44px touch height; give the Category track enough
intrinsic width rather than hiding or shrinking its text.

## S158 — city-area pins and separate product discovery (in progress)

The Business locations map includes businesses with an owner-selected exact
public pin and businesses with a validated canonical city anchor. Co-located
city businesses appear in numbered groups; visitor-facing labels and previews
show business names and actual cities without location-mode terminology or an
implied storefront or street address. Co-located city businesses are grouped
using the map's numbered-circle policy. A legacy area without a validated
canonical anchor stays off the map. Product listings continue to include
eligible offerings and their source showroom.

GIVEN a city-only business with listed products WHEN a visitor searches Product
listings by country/city, product or business name THEN its products and source
business remain available. GIVEN the same business WHEN a visitor searches
Business locations THEN it appears at its canonical city anchor in a numbered
group when there are multiple businesses, or as a named shop pin when alone.
The preview names the business and city. Exact storefront records remain
eligible and keep the existing grouped-preview and return behavior.

## S157 — recover from an empty business map (local implementation pending review)

GIVEN the current Business locations criteria match no businesses with an
eligible exact pin or canonical city anchor WHEN the map is empty and Product listings are available THEN show a
short, truthful empty state and one direct action that opens Product listings.
The action must use the existing mode switch, keep each scope's independent
search/filter state, and avoid implying that filtered-out businesses have map pins.
The empty state remains useful when the product count is zero and must fit a
phone viewport without blocking map controls.

## S153 discovery preview context (implemented locally; visual review pending)

## S153 discovery preview context (implemented locally; visual review pending)

GIVEN a public product search result with merchant-authored grouping and business
location WHEN a visitor browses Products at desktop or phone width THEN the card
visibly presents its existing category label and literal city/location before
opening details, alongside the bounded description, supply and separate business
link. `categoryName` is the optional business-owned product grouping, not its
industry; retain the existing API fallback for ungrouped products. Wrap long
category/location text rather than hiding it or expanding the viewport width.

GIVEN repeated city, zone or region display labels WHEN a product, map-business
or Featured preview composes its current location fields THEN trim empty labels
and omit case-insensitive Unicode-equivalent repetitions, retaining the first
literal spelling and the existing field priority. Distinct locations remain
distinct; a missing city retains the existing legacy region fallback. Do not
derive a country, change stored geography or translate merchant location labels.

Ordered plan: (1) preserve the deployed audit findings and reproduce hidden
category/city using actual Workspace markup with production CSS at 1440/390;
(2) add pure location equivalence/distinct/empty controls and actual map/Featured
preview regressions; (3) expose the existing card context and reuse one small
pure formatter in the existing discovery contract; (4) run focused checks and
actual local Chrome search/filter/detail/Back at both widths, with synthetic map
tiles declared; (5) obtain visual approval before full gates and rollout. Master
§§7,8,10,19 already require these previews; this repairs their presentation without
changing catalog, API, permissions, localization, native UI or hosted data.
Focused component fixtures do not establish real local workflow or deployment.

Focused evidence: the three affected workspace, Featured/sponsor and map-group
suites pass 31 cases, including real-CSS category/city visibility and long-label
geometry at 1440/390, literal/legacy location controls, actual preview deduplication
and preserved navigation/exclusion fences. The preceding Chrome regressions
reproduce hidden group labels at both widths and duplicate city/region text.
TypeScript and all 219 spec/ADR validations pass. Real local journeys, combined
visual approval, full gates and deployment remain pending with the parent batch.

## S154 — city-level small-group discovery (implemented locally; physical/visual review pending)

FE-021's city-scale terminal policy controls the owner's request to reveal
small numbered groups without zooming into street detail. WHEN its finite bounds
are qualified THEN web, phone web, Expo and native must share exact terminal
membership, display-only separation and normalized camera limits. Clicking an
already exposed final circle opens its all-fit preview without camera movement;
zoom-out still merges into ordinary count-weighted aggregates. Keep independent
searches/exclusions, saved view/filter context, current-group/capacity authority,
product drawer/inert controls, attribution and the corrected native SDK dispatch.
No saved location, shop address, API scope or dataset changes. Master §§10/19 and
FE-058 must reflect the reviewed limits before production edits; current source
still uses the previous policy. Reuse the existing map hierarchy/preview/return
regressions and synthetic-map Chrome/physical workflows, not public tile traffic.

## S151 B07 — retain displayed results during scoped updates (implemented locally)

FE-074 governs contextual loading. A search/filter edit may keep the preceding
public product cards or business map visible while its latest request runs, but
displayed membership must retain its actual snapshot key separately from the
requested criteria. A quiet region-level updating state makes that distinction
visible; pending criteria must not briefly replace usable results with zero rows.

GIVEN a safely retained public collection WHEN criteria change or a read fails
THEN retain its displayed rows/map and current scroll/preview until replacement
data settles, with scoped pending/error feedback. New-result scroll reset happens
on an admitted snapshot, not each keystroke. Canonical product/business links may
open their displayed entity by its own identity. Pagination, membership validation,
map-group actions and saved current-criteria navigation must not use a mismatched
snapshot as authority; an old cursor/response cannot join a new search.

GIVEN API environment, identity/collection scope or business exclusions change
WHEN prior content would cross that boundary THEN clear it immediately. Shared
feed retention is opt-in through an explicit stable scope; default callers keep
the conservative request-key boundary. Blocked membership disappears immediately.
Retry/focus/reversal preserve generation/abort fences, real errors and bounded
requests. No private cache, API/SQL or route-authorization change is included.

### S151 release review — web exclusion identity (locally verified correction)

GIVEN the web visitor changes their saved business exclusions without changing
search criteria WHEN the current preference hook publishes the canonical IDs
THEN both public feed scopes change immediately, preceding product/map membership
and cursors lose authority, and the same criteria are fetched under the new
cookie preference. Canonical exclusion ordering alone must not trigger a reload.
An old query/page response or queued map/group callback cannot restore excluded
membership. Unblocking re-fetches the same criteria rather than reusing an older
excluded projection.

GIVEN server initial data or a cached route payload WHEN the web component
mounts THEN admit it only when its explicit server-read exclusion identity
matches the current canonical client exclusions. A missing or mismatched source
identity is unproven data, not a current snapshot. Matching ordinary server data
must retain its existing no-redundant-GET behavior. Reuse the existing server
exclusion read, client preference hook and shared feed fences; do not change the
preference UI, generic feed, API/SQL, provider or schema. The focused actual
component/hook regression in `scripts/test-market-workspace-ui.ts` must first
reproduce the same-query defect, then prove block/unblock, initial-source
admission and stale query/page/map denial in isolated Google Chrome with
controlled HTTP data. This correction changes no layout or copy.

Focused S151 evidence: `scripts/test-market-workspace-ui.ts` passes all 16
actual Google Chrome component cases, including three new block/unblock,
initial-source identity and stale query/page/map cases. The same-query regression
first fails against the prior web wiring. The existing map-group renderer passes
all seven cases with an explicit empty preference port; homepage, narrative and
the discovery source/pure map assertions pass. Root TypeScript checks pass.
The existing PostgreSQL discovery assertions are preserved and await the parent
release gate; these focused checks make no database or provider calls. Evidence
and before/after source hashes are retained in the ignored S151
`exclusion-boundary` receipt. The full integrated gates and rollout remain separate.

Plan: extend `lib/use-market-feed.ts` with requested/displayed keys and safe scope
admission; adapt web and separately owned native consumers; retain the business
projection without admitting stale group/navigation actions; add race/scope/error/
pagination regressions, then actual Chrome desktop/390px delayed local reads.
`scripts/test-market-feed-retention.ts` and existing discovery/workspace regressions
cover the shared contract. The existing RSC navigation retention remains unchanged.
Master §10 and FE-036 describe the matching initial skeletons. Combined visual
approval and full/release gates follow focused evidence; nothing is deployed here.

Focused evidence: six actual-hook cases in
`scripts/test-market-feed-retention.ts` cover retained/current keys, superseded
search/page responses, API/identity/exclusion clearing, failures/retry, reversals
and mismatched initial data. Thirteen actual-component cases in
`scripts/test-market-workspace-ui.ts` preserve independent queries/return memory,
fence stale and queued prior-render map actions/cursors, retain product scroll through filter changes and
React Activity effect reconnect, and show one compact status rather than moving
the heading with a refresh bar. The outer web search row stays 50px before/after
48px Clear controls appear. Map feedback occupies a noninteractive canvas corner.
Neither this local UI state nor a retained canonical link grants new authority.

Actual local Chrome with real delayed discovery GETs confirms desktop and
en/am/om phone retention, query/result identity, detail/Back and return context;
the final geometry review is recorded separately from logic evidence. Synthetic
map tiles and prevented automatic visit-analytics requests are explicitly test
controls, not live tile/analytics proof. Preserve the discovered Activity replay,
successful 5.6s cold-route compile exceeding the original 5s assertion, and blocked
analytics-accounting failures; no router or backend change was made for them.
Visual/full/release/deployment qualification remains pending with FE-074.

## S143 compact mode switch and no information overlay (ready)

The Businesses/Products switch uses only its needed width and a compact centered
row, with48px targets and no extra empty framing/padding; normal-scale row target
is at most52px, with natural wrapping/enlarged-text growth instead of clipping.
Remove the Market information icon, balancing spacer and intro dialog/sheet from
web, phone web and native. Keep the approved visible web landing headline/copy
and SEO; trim only presentation padding where measured. Native narrative remains
available through About, not a redundant overlay. Preserve labeled search/filters,
independent results, panel dragging/return state, grouping, basemap and camera.

GIVEN a Market viewport WHEN toggling Businesses/Products THEN map/results gain
the removed chrome space while all labels and controls remain usable. GIVEN an
About navigation THEN its customer/business audience tabs (FE-052) provide the
explanation and return via normal navigation without changing Market state.
Focused actual React/RNWeb layout/accessibility tests measure row/48px targets,
no information control/modal, no overflow, filters and return; actual Chrome web
1440/390/320/short landscape+Expo en/am/om confirms canvas gain and real API scope.
Ready: no data/API/provider/schema change; reuse existing audience labels/copy.
Master §§5/10/18/19/22 need verified reconciliation; visual/full/rollout gates stay.

Focused S143 coverage: `scripts/test-about-audiences.ts` measures actual RNWeb
mode targets/centering/no information overlay; `scripts/test-mobile-market-layout.ts`
preserves native controller behavior. `scripts/test-web-market-short-layout.ts`
measures production CSS and `scripts/test-market-workspace-ui.ts` proves ordinary
About return with both independent queries. Actual local Chrome functional
evidence and the retained strict network failure are separate in
`.local/market-about-s143/verified.json`.

## S132 — web landing explanation without decorative clutter (ready)

FE-052 records the owner's later instruction to restore visible web landing
headline/supporting copy and use a plain light background. This supersedes S128's
web-only no-introduction rule and absolute web top-edge budget: measure S128's
compact control stack after subtracting the actual introduction height. Native
S128 viewport budgets remain unchanged. Keep exactly one visible page h1 and a
programmatic Market section heading, centered scopes and individually labelled
filters. At short web heights the introduction can scroll away while at least
120px of actual map canvas and all controls remain reachable; do not crop the
map into an inaccessible fixed-height area or hide the supporting text. Verify
320/390/wide landscape, active en/am/om, enlarged text and plain-background
readability in focused geometry and actual Chrome. FE-021's later compact phone
layout uses 44px-or-larger mode/filter targets to leave more room for the map;
wide layouts retain 48px-or-larger targets. No filter/state/API changes.

## S130 — useful mobile previews before opening a full page (ready)

L2 additive public projection and native presentation refinement. FE-053/FE-021
control native parity and S127 all-fit map groups; BE-044 preserves scoped public
data. Master §§10/18/19 are affected. Web is the reference, not a redesign target.

1. GIVEN a current product result THEN retain name, two description lines,
   supply state and independently clickable From business; also show the existing
   public business city (legacy region only as a fallback). Do not join results
   against the independently capped map feed or issue per-card requests. Missing
   location has no invented placeholder/fact. Preserve product and business routes.
2. GIVEN a final map group opens THEN include business name, a short description
   and city/location within its existing row budget. Keep S127 capacity, maximum
   zoom, grouping and all-at-once/no-scroll/no-pagination rules unchanged. Normal
   rows may use two name lines; compact rows use one. Compute readable text space
   at current font scale; if three lines cannot fit, omit the visual description
   first while retaining name/location and full accessible detail. Do not shrink
   text or add a scroll container to force it in.
3. GIVEN a business row or solitary marker is selected THEN the existing preview
   retains image, full description, city and country, using current UI locale for
   country names. A preview tap still opens the canonical business, with Back
   returning to the preserved group/filter/camera. Missing values produce no
   dangling separator. Descriptions and business names remain merchant text.
4. Verify real local product API location projection and rendered actual-source
   cards/group rows at390/320/844, short heights and enlarged text; regress the
   existing capacity/return rules. Actual Chrome compares web reference and Expo
   preview, all five language labels, product/source-business navigation and
   final group→business preview→showroom→Back. Retain unavailable/error behavior.

Ready: existing public city/region and map description are known; add optional
SearchItem city/region fields only. No country query expansion, private location,
schema, dependency or provider change. Plan: additive canonical DTO → bounded
native card/row/locale changes → focused regressions → combined S129/S131 Chrome
review → explicit visual approval before full gates/commit/rollout. Rollback is
presentation-only and old API clients continue to ignore additive fields.

## Current contract and superseded decisions

S103 supersedes S102's zero-result start with bounded initial browsing. S112
FE-067/BE-056 supersedes product/service selection with physical products and an
optional Made to order filter. S106 FE-066/BE-055 removes only new Suqpage business-
inbox inquiries; configured external contacts, localized product-message copying,
private authorized inquiry history, transport chat and owner support remain.
These later decisions control the current local candidate; earlier capture and
test receipts remain historical evidence, not approval or deployment of it.

## S128 — reclaim the Market viewport (locally implemented; review pending)

The owner’s new screenshot shows a separate Market title, mode, search and filter
stack pushing the map down. This L1 layout refinement removes that duplication
on web, phone web and native/Expo. It preserves S109’s centered, permanently
visible Businesses / Products choices; do not replace them with a scope menu.

1. GIVEN Market opens WHEN the toolbar renders THEN retain one global app header,
   one centered mode/info row and the active search controls. Remove the separate
   visual Market title/marketing row. Keep one localized programmatic Market
   heading without allocating another row. The existing About/info action keeps
   the accepted narrative available in its bounded dialog. No new copy is needed.
2. GIVEN sufficient measured content width (web at least35rem/about560px; native
   at least760px) and ordinary font scale WHEN controls render THEN search and
   all labeled filters share one row.
   The search retains useful input width (target220px); filters may wrap their
   text. In the narrow web inline band only decorative filter icons may hide;
   labels and selection counts remain visible. Products still exposes Made to order. At844×390 the controls must use
   this wide row; viewport width alone must not ignore a narrower web sidebar.
3. GIVEN phone/narrow content or enlarged native text WHEN controls render THEN
   search and filters use separate rows, below the centered mode/info row. Keep
   Category/Country/City words, selected counts and Made to order visible; no
   icon-only substitutes or omnibus Filters button. At enlarged text allow an
   honest wrapping layout rather than clipping labels or shrinking tap areas.
   On the smallest phones decorative mode icons may disappear; words remain.
4. GIVEN default ordinary text after data settles THEN map/list starts no lower
   than240px at390×844 and320×480,200px on web1440×1000, and180px in Expo wide
  1440×1000/844×390. Compare actual BEFORE/AFTER map/list intersections and top
   stack; normal phone/desktop improve and short layouts cannot regress. These
   are content-space budgets, not fixed heights which clip larger text. They
   measure the shared discovery canvas edge below the toolbar; the ordinary
   product-list title can remain inside that canvas.
5. GIVEN controls/clear/info/mode are used THEN48px targets, focus, native labels,
   selection counts, search-as-you-type, independent per-scope filters/clears,
   Country-before-City and Made to order remain correct. Preserve mounted panels,
   drag direction, return memory, product feed position and current map camera.
   S127’s hierarchy, maximum-only all-fit modal and solitary-only glyph policy
   are unchanged. A normal map gesture patch remains unobstructed. Idle native
   status guards render no text child or spacer; loading/error/retry remain
   present when required, without an Unexpected text node LogBox warning.
6. Verify current component behavior and actual installed Chrome against real
   local APIs at1440×1000,390×844,320×480 and844×390. Cover both scopes, all five
   languages for layouts/labels, populated criteria and enlarged-text samples.
   On each platform exercise English and Amharic filters, typing, clear, switching
   and reload; repeat the full cluster→modal→shop-preview→showroom→Back journey
   in English. Keep this coverage distinction explicit in the evidence. No app writes, customer messages or provider changes are needed.
   Expo browser evidence remains separate from installed Android/MapLibre.

7. GIVEN a preserved/cached Market return whose current business criteria differ
   from the server's initial projection WHEN that scope is pending or restarted
   THEN pair data with its actual canonical search key, fetch the required scope,
   and preserve saved map/group/selection until current-scope data settles. Do
   not validate saved membership against transient empty rows or persist that
   transient state. Returning to an already resolved key clears obsolete loading
   and error state. WHEN the eligible current response settles THEN reopen the
   saved preview/group with its camera only while its membership remains valid
   in the current authoritative results; no permanent loading or extra user search.
   A settled response alone does not authorize initial SDK view callbacks to write:
   wait until that projection's restored group/selection/camera has committed.
   Regress a child SDK initial-view callback between result settlement and parent
   restoration; it cannot replace a valid saved preview with null/worldzoom5.
   Loading-row appearance/removal and other container resizes preserve the real
   SDK camera within its existing half-pixel precision; no viewport-height drift
   is written into the saved center. Hidden zero-size maps do not resize. Share
   the existing pure Leaflet correction rather than adding a provider/dependency.
   Regress cached initial Addis→cleared URL→shop→Back and aborted-request reversal
   in the actual source, then repeat that real browser/API journey. No API or
   database changes; unrelated workspace/chat gates remain open.

   S136 fractional-camera refinement (Ready before correction): the actual
   Expo group→showroom→Back journey reproduces a settled0.936px vertical shift;
   installed Leaflet1.9.4 methods reproduce compounded odd/even resize rounding
   across remounts. Keep the existing half-pixel contract; do not widen it. Retain
   the intended center across successive size-only changes of one SDK instance
   while its zoom and last observed corrected center are unchanged. A deliberate
   pan/zoom starts a new intent. State is weakly owned by that map instance, never
   persisted as merchant/account data. Hidden zero-size maps change neither SDK
   nor intent. Persist the unchanged geographical intent after size-only renders,
   while independently retaining the actual SDK center for rendering/precision
   checks; otherwise a remount loses the original fractional target. Genuine
   pan/zoom publishes the actual new view and replaces the old intent. Use
   documented public correction methods, without private SDK
   fields, tile-layer reset, dependency or marker/group changes. Prove the original
   fractional parity sequence, repeated remounts and deliberate pan/zoom, then
   repeat the affected real local group→shop→Back journey without loosening the
   original tolerance. Failed receipts remain failed.

Ready: users, responsive row policy, measurable viewport outcomes, accessibility,
localization, data/state invariants, bounded verification and presentation-only
rollback are explicit. Controlling links: FE-053 and FE-021 S127; backend behavior
remains BE-054. Master §§5/10/18/19 are affected. Full gates, commit and rollout
remain after actual visual approval; pending S122/S125/S126/S127 work is retained.

## S109 — content-first compact exploration (ready)

The owner requests a spacious, intentional mobile exploration surface, extending
S102 without merging its independent searches or altering map/marker authority.
Primary research: Material app bars/canonical list-detail layouts, Android 48dp
minimum touch targets and system-gesture insets, Ant navigation consistency.
These principles inform Suqpage's own styling; do not add a UI framework.

- GIVEN phone Market on web or native WHEN it opens THEN one compact app identity
  and a centered Businesses / Products switch lead to active search and
  a compact row of labeled Category/Country/City filter controls. Products also
  has Made to order; labels wrap within balanced cells as required by FE-067.
  Long marketing heading/body are available deliberately through About/intro
  disclosure rather than consuming the map/list viewport permanently. Preserve
  the accepted narrative unchanged in that disclosure and desktop presentation.
- GIVEN 390x844 phone viewport THEN the actual map/list occupies the majority of
  the remaining app viewport; it does not lose a second permanent 70px spacer or
  40px blank side column. Retain a subtle alternate-panel edge (target 16px) and
  one visible, reachable 48x48 toggle with a descriptive accessible label. Avoid
  vertical rotated words and a 172px decorative handle. Test also 320px, 360px,
  text scaling and all five languages; chips may scroll horizontally without
  clipping hit areas or growing into multiple toolbars.
- GIVEN initial Businesses map THEN Products waits on the right with its handle
  on the right; drag left to pull Products over the map. WHEN Products is open
  THEN the map edge/handle is on the left; drag right to restore Businesses. The
  switch order remains Businesses then Products. This owner correction supersedes
  all earlier left-origin product drawer orientation.
- GIVEN dragging the dedicated handle THEN panels follow the finger/pointer and
  settle to a stable selected view on release/cancel, respecting reduced motion.
  Never capture map pan/pinch, product vertical scroll or OS edge-back gestures.
  The labeled switch, click/keyboard toggle and Android Back remain equivalent
  alternatives; inactive-pane controls are not focusable/read by accessibility.
- GIVEN switching, filtering or opening details THEN preserve each scope's query,
  data, position, location selections, loaded pages and existing URL/history rules.
  Loading/error/retry, attribution, zoom, geolocation, transport launcher and
  product-source links remain reachable without overlapping search/handle targets.

Ready L1 presentation/interaction: no API/schema/provider changes; reuse current
components and all existing permission/data contracts. Test actual component
interaction plus local web/Expo metrics/screens at 320/390/1440, five locales and
reduced motion. Native gesture/device verification is reported separately; an
Expo browser screenshot is not proof of MapLibre/touch behavior on Android.
Focused visual review precedes full gates. FE-053 and FE-026 share S109 scope.

## Problem, readiness and scope

S102 supersedes the shared search/filter toolbar in FE-030. Visitors choose
Businesses (map) or Products (cards). Each owns its query, category,
country and city selections; products additionally offer the Made to order toggle.
Keep independent selections when switching, returning from a showroom, reloading
or navigating history. Retain clearable multi-category/multi-location behavior.
No checkout, subscriptions, provider/driver portal, redesign of client showrooms,
marker/cluster redesign or transport workflow change.

Definition of Ready: audiences, bounded initial browsing, two scopes, country/city model,
existing API/database adapters, local fixtures, English/four-language catalogs,
test levels and rollback are known. Country/city signup uses server-known places
under BE-054/ADR-0027; discovery menus use eligible published-page locations.
The existing uncommitted S100/S101 task is preserved and extended only where
shared copy/specification files must change. Its visual approval remains pending.
Master §§3/5/7/10/11/15/18/19/22 and current product summary are affected.

## Scenarios and acceptance

1. GIVEN no query/category/country/city/custom filter WHEN a scope opens or clears THEN
   show its bounded default browse results: at most 200 business markers and the
   first 12 product cards. Keep accurate totals and public eligibility.
   No entire product catalog is fetched; no repeated polling is introduced.
2. GIVEN typing WHEN it pauses briefly THEN show results automatically without
   Enter or a search-button press. Cancel obsolete requests and never let an
   older response replace newer results. Retain focus, text and keyboard during
   updates; show loading, errors and retry without a click-only activation step.
3. GIVEN business search WHEN it changes THEN only business markers change;
   product text alone must not match a business. GIVEN product search WHEN it
   changes THEN only product cards/feed change. Preserve the other scope/map
   center; never reuse one scope's filtered data as the other's authority.
4. GIVEN a product card THEN show its photo/name, a bounded description excerpt
   and a clearly identified, separately clickable source business. Product opens
   item details; source business opens the business page. Descriptions are literal
   merchant text, line-clamped rather than translated or silently omitted.
5. GIVEN either scope WHEN opening filters THEN Category, Country and City have
   visible text labels; Products also has a labeled Made to order toggle. Country is
   chosen before City; menus contain only locations from eligible published
   pages, preserve empty matches and support independent clears. No region menu.
6. GIVEN switching scopes THEN a horizontal sliding/overlapping composition leaves
   a visible edge and draggable, labeled handle for the other view on both sides.
   The selected panel slides over the other; the mounted map retains its position.
   The product panel covers/hides map search controls; a centered, persistent
   Businesses / Products switch makes both destinations clear. Retain map visibility and touch access on
   desktop, mobile web and native; dialogs fit the viewport with bounded scrolling.
7. GIVEN new-owner setup THEN Country and City are required, searchable and shown
   together with other initial details. Changing country invalidates city. The
   saved private sample/owner profile shows the chosen location; native and web
   retain preview-before-edit/publication and exact-vs-approximate map behavior.
8. GIVEN UI changes THEN English, Amharic, Afaan Oromo, Somali and Tigrinya explain
   the actual task in context, preserving brand and merchant text. Existing
   account, retained private inquiry history, external social contact,
   support/transport and publication permissions follow their controlling specs.
   New business-inbox submission remains retired under FE-066/BE-055.
   S112 touch refinement supersedes S107's 44-unit floor: compact
   category/country/city/custom/clear and search-clear controls retain at least
   48 CSS/native layout units in each touch dimension.
   Keep compact labels and wrapping; no large extra control panel is introduced.
   Measure actual phone web/Expo control bounds and native Android targets.

9. GIVEN product browsing WHEN the visitor approaches the list end THEN append
   the next bounded server page automatically, once at a time, deduplicated by ID.
   Hidden panels do not prefetch additional pages. Changing criteria cancels stale
   page requests and resets the feed; closing/reopening retains loaded cards and
   position. Failure retains loaded cards and offers retry without looping. A
   labeled Load more fallback works with keyboard/assistive technology. Native
   uses a virtualized list; web uses an intersection sentinel in its own scroll root.
   The end of results is announced. Reduced motion disables panel animation.

## Test plan

Pure scope/URL activation, canonical parsing, country/city, debounce/stale-response
and locale contracts; isolated real PostgreSQL business/product independence,
privacy, category/location unions, custom-product filtering and bounded
ranking/paging under BE-054/BE-056.
The stale-page/exclusion browser regression keeps the live intersection observer
and waits for its held page-two request before changing exclusions, preserving
all stale-response, queued-callback and exact page/exclusion-history assertions.
S180 renders the actual web workspace on the server, verifies its controls are
disabled before hydration, hydrates that same markup with real React, and types
as soon as the field becomes editable. Assert retained text, canonical query,
selected filters and the matching controlled HTTP request without sleeps or a
test-only readiness delay. Component-port evidence remains separate from the
focused actual-Chrome journey against the real local API at desktop/phone sizes.
The phone filter regression uses the live controls, production CSS and retained
en/am/om catalogs at 320/390px. Assert whole-word label geometry, visible selected
counts, non-overlapping text/count bounds, touch height and viewport fit. Recheck
those actual local-API filter states after the CSS correction; retain the
source-matched first-typing journey evidence for unchanged readiness code.
Actual local browser tests for typing without Enter, switching/clear/history,
description/source links, empty states, signup and dialogs at 320/390/1440 plus
all five locales. Native browser evidence is labeled separately from a device.
Focused checks/captures precede explicit visual approval, full/release gates and
scoped commit. DEP-045 governs data correction and any separately approved rollout.
Revert UI/code without reversing chosen locations or resetting existing accounts.

S128 acceptance mapping:

| Criteria | Focused evidence |
| --- | --- |
| 1–5: compact rows, centered choices, measured width, words/counts and targets | `scripts/test-web-market-short-layout.ts`, `scripts/test-market-workspace-ui.ts`, `scripts/test-mobile-market-layout.ts` |
| 5: retained groups, current membership and return | `scripts/test-map-group-picker-web.ts`, `scripts/test-mobile-map-groups.ts` |
| 5: no idle RNWeb primitive child; loading/error retained | `scripts/test-mobile-market-layout.ts` actual-source children rendered through installed RNWeb View |
| 7: keyed response, cached reversal, error/retry and committed restoration | `scripts/test-market-workspace-ui.ts` actual React controller and storage/router/SDK ports |
| 7: real SDK resize, zero-size and teardown | `scripts/test-web-map-lifecycle.ts`, `scripts/test-leaflet-resize-center.ts`; existing pure correction shared by web and native compatibility export |
| 6: real layouts, API controls and full showroom return | Actual installed Chrome receipts under `.local/market-toolbar-s128/`; aggregate and limits recorded in `specs/TRACEABILITY.md` |

The Expo web preview's existing in-memory runtime resets its language on hard
reload. Native uses SecureStore. Browser reload verification therefore checks
preserved URL/filter state, observes English and selects the requested language
again through the real picker before continuing; it does not claim native device
persistence. No new persistence, provider, locale copy or backend is introduced.
Original failed receipts remain failed. Actual visual approval and full/release/
acceptance gates remain prerequisites for completion, commit and rollout.

## S117 — remember the selected Market panel (locally verified, 2026-10-17)

L1 navigation defect; dependencies FE-053/BE-054/DEP-045 remain unchanged.
Ready: scope is public UI navigation state only, with no account, catalog,
database, provider or new dependency change. Existing explicit search URLs and
independent filters remain authoritative. Master §§5,10,19,22 and the compact
exploration statement are affected; update their current-behavior wording only
after focused verification. No new copy or layout is required.

- GIVEN Products or Businesses is selected WHEN the visitor opens a product,
  showroom or another page and returns using Back or Market THEN the previously
  selected panel is shown on desktop web, phone web and the mobile app.
- GIVEN a remembered Market state WHEN a link explicitly selects a view or
  supplies search/filter criteria THEN that link wins; a later ordinary Market
  return remembers the resulting state. Browser history restores its own entry.
  Both scopes' independent search/filter values survive an ordinary return.
  Deliberate Explore the map and Clear filters actions carry explicit map/reset
  intent instead of accidentally resuming Products or restoring cleared filters.
- GIVEN a new session without a remembered selection WHEN Market opens without
  explicit search intent THEN Businesses/map is selected. Invalid/expired or
  unavailable browser storage fails safely without a loop or navigation error.
  Store only bounded public search/view state in the browser session or native
  app session, never catalog payloads, credentials or private business data.
- GIVEN Featured is visited after Market WHEN a showroom returns to its source
  THEN Featured still works; the global Market destination restores Market,
  never Featured. Keep the existing source-return key separate.
- GIVEN a native product/showroom is above Market WHEN Android Back is pressed
  THEN Market's background handler does not consume it or change its panel.
  Back on focused Market retains its existing panel-close behavior. URL updates
  preserve framework history metadata; restoration precedes default persistence.
- GIVEN a map resize, initial-size timer or move event is pending WHEN navigation
  leaves Market THEN owned timers/listeners are canceled and queued callbacks
  cannot read or update a destroyed map or a replacement instance. Mounted map
  pan, resize, selection and camera persistence continue to work; leaving and
  returning through showroom details must produce no map lifecycle exception.

Verification: focused pure-state and actual web/native component regressions,
plus local anonymous desktop/phone/Expo navigation for both panels and explicit
link precedence. Existing paging, map camera, drag/reduced-motion and scoped
filters must not regress. Expo browser evidence is separate from installed
Android. Capture the unchanged layout with restored state; prior visual/full
release gates remain pending. Revert code to roll back; no data operation needed.

Local evidence: `test-market-workspace.ts`, `test-market-workspace-ui.ts`,
`test-mobile-market-layout.ts`, `test-mobile-app-links.ts`,
`test-web-map-lifecycle.ts` and `test-mobile-map-lifecycle.ts`: 27 focused tests
pass together; both client typechecks pass. The browser navigation script is
`scripts/capture-market-return.mjs`; S117 TRACEABILITY separates original failed
captures, retained web navigation assertions, clean SDK departure checks and
current Expo journeys. No copy/layout change, account/DB/provider operation or
Android build was required. New regressions join the existing workflow gate;
full gates/commit/deployment remain pending alongside earlier work.

## S107 administrator coordinate review

GIVEN a business outside Ethiopia WHEN an authorized administrator edits
Marketplace coordinates THEN the form's latitude/longitude constraints match
BE-054 worldwide ranges, instead of blocking a valid location in the browser.
S115 FE-026 presents saved location/visibility details first and opens the
explicit Edit discovery profile screen only when requested. Coordinates are
ordinary labeled fields in that editor, not a required collapsed accordion.
Keep existing permission boundaries;
invalid-coordinate feedback reuses the existing localized storefront-coordinate
message. Capture the actual local form with valid non-Ethiopia values before
requesting visual approval.

## Rollout

Local focused evidence and explicit visual approval precede full/release gates.
DEP-045 controls backup, preservation, scoped commit and any later hosted rollout;
DEP-042 controls rebuilt Android delivery. No automatic publication or reset.
