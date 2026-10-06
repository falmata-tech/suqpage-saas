---
id: FE-053
title: Native visitor and business-owner app
status: in_progress
related: [FE-055, FE-054, BE-044, DEP-042, FE_BASE, FE-019, FE-049, ADR-0023, FE-036, FE-052]
owners: [product, frontend, backend, security]
last_updated: 2026-10-05
change_level: L3
---

# FE-053 — Native visitor and business-owner app

## Problem

Visitors and business owners need native access to Suqpage without exposing staff management.

## Scope and contracts

Visitors use Market with map/search/multiple categories/location/pagination, Featured,
business and product galleries, single/group inquiries, About and buying chat.
Owners use email-code sign-in, private starter setup, business/location/handle,
page editing/preview/publication, product media and video requests, customer
inquiries, owner support and account/sign-out. Administrative and staff management
are web-only: native owner APIs reject those roles, not just hide their controls.

Use native Expo/React Native navigation, accessible labeled controls, platform
back handling, five interface languages and verbatim merchant content. The public
web showroom remains the authoritative custom presentation; native catalog views
preserve the business identity and link to its web showroom. No WebView dashboard.
Native maps use MapLibre React Native with OpenStreetMap raster tiles and the same
approximate/exact coordinates as web. Browser preview keeps Leaflet. No Google map
key is required. Native testing requires a rebuilt app, not Expo Go.
Video playback follows S49.2 below. Public social links open only allowed schemes; cancelled sharing is not
reported as delivery. Guest inquiry lists are per business. No offline writes or
background/push-message claims. Foreground chat polls the existing persisted data.

## Scenarios

GIVEN public filters WHEN a user changes any scope THEN API results and map share
that scope, paging resets, and stale responses cannot overwrite a newer request.
GIVEN an owner WHEN they save an offering/page/location THEN the existing domain
rules persist it, with conflict and failure feedback; no silent optimistic success.
GIVEN staff credentials WHEN native owner access is attempted THEN no management
UI or protected data is returned; web management remains available separately.
GIVEN an offline/expired session WHEN an action fails THEN input is retained and
retry/sign-in is explicit. Sign-out removes private screen/query state and tokens.

## Test plan

 `scripts/test-mobile-contracts.ts`, `scripts/test-mobile-api.ts`,
mobile typecheck/export, focused Expo web-preview screenshots, and actual Android/iOS
build/device checks before calling a native release ready.

## Readiness

The owner authorized visitor pages and business-owner dashboard, excluding admin
management. Scope, permission/failure contracts, verification and rollout boundaries
are explicit. Implementation may proceed; visual approval and native-device evidence
are required before release claims. Track ordered evidence in checklist S49.

## Rollout

Review focused phone and tablet captures first. Keep this feature in progress until native device checks, required gates and a separate API rollout are verified. No store submission is authorized.

## S49.1 — match the approved phone web structure

The owner rejected the initial stacked-card native preview. This refinement is
ready, L1: preserve API/tenant/auth authority and native navigation; use the phone
web app as the visual/interaction reference, not a new information architecture.
No WebView replacement, new provider, schema change or production rollout.

- GIVEN Market opens THEN the compact brand/locale header and introduction sit
  above a full-height map, with Market/Featured/About/More bottom navigation.
  Search & results opens a left drawer over the mounted map. Search, side-by-side
  category/location controls, independent result-type choices and one paginated
  list remain inside it. No separate scrolling feed beneath a miniature map.
- WHEN hiding/reopening the drawer or visiting/returning from a product THEN query,
  filter/page and map viewport remain. Changes reset paging, not unrelated scopes.
  No selected category means all; selected category/location can clear separately.
- GIVEN map/result selection THEN a business preview is above the drawer, with a
  clear dismissal; search controls, pagination and buying chat never cover each other.
- GIVEN Featured THEN show the compact heading/schedule, sponsor strip, horizontal
  day selector and two-column business grid, with one column only if accessibility
  text sizing needs it. Preserve current live/reveal eligibility and server data.
- GIVEN a showroom THEN show an immersive cover with a single video affordance,
  business identity/story, a searchable product grid, then a distinct contact area.
  Keep gallery and inquiry flows. Native layout does not replace custom web designs.
- GIVEN More THEN language, account/dashboard and legal destinations are available.
  Owners see their business identity/publication context and grouped task navigation;
  staff/admin management remains web-only. Use the web's task names and hierarchy.
- GIVEN 320/390/tablet, long translations, keyboard or reduced motion THEN controls
  remain readable/reachable, search results scroll within available space, back
  dismisses overlays first and native safe areas protect persistent navigation.

Verification: focused native typecheck and browser interaction/screenshot checks
in `scripts/capture-mobile-alignment.mjs`, existing mobile workflow regression,
localization and spec checks. Actual native device checks remain open due to the
recorded emulator instability. Obtain visual approval of this replacement before
full release gates; rejection of the prior preview is not approval of this one.

## S49.2 — embedded YouTube playback

Owner additionally requests in-app playback, explicitly excluding external browser
handoff. Ready L2 client-provider refinement; FE-053/DEP-042/ADR-0023 govern the
adapter. Master sections 15 and 22 are affected. Existing staff video approval,
allowed provider URLs and API projections remain unchanged.

- GIVEN an approved product or business cover video WHEN tapped THEN an inline
  YouTube player replaces its poster inside the app, with provider controls and
  fullscreen support. Do not launch a browser or the YouTube app.
- WHEN changing gallery media, leaving the screen or backgrounding the app THEN
  stop/unmount the player; offscreen videos never autoplay. No media extraction.
- GIVEN invalid references, offline/load timeout or embed-disabled/private/deleted
  video THEN show a concise unavailable state and retry. No external fallback or
  arbitrary URL navigation; no application credentials shared with the player.
- Use isolated native WebView/browser iframe adapters, official privacy-enhanced
  YouTube embeds, app identity/referrer and strict provider-reference validation.
  Messages accept only bounded ready/error events from the expected frame, never
  application actions/private data. Block native top-level outbound navigation.

Tests: pure provider/HTML/navigation validation; browser poster → iframe → inactive
cleanup; load/error retry; cover and gallery integration. Actual iOS/Android
playback/fullscreen/back behavior remains a required device check before release.

## Current focused evidence

S49.1 has nine grouped responsive/browser checks plus the existing 13-flow browser
regression; mobile type/localization/spec checks pass. S49.2 has three provider
boundary tests and a passing mocked-provider lifecycle/error browser check. A real
YouTube embed rendered; automated media-start checks were inconclusive, and actual
phone playback/fullscreen remains open. See TRACEABILITY and
`docs/MOBILE-WEB-ALIGNMENT.md`. Replacement visuals await owner approval.

## S50 — workflow audit before installable test build

Owner approved proceeding with verification/build/distribution preparation. Preserve
S49 structure; repair defects rather than redesigning. Native visitor/owner screen
actions must reach canonical server workflows and show current persisted outcomes.

- GIVEN return from a successful owner edit THEN the dashboard/list reloads current
  persisted state. Session-storage/network failure must not hang sign-in indefinitely.
- GIVEN an inquiry contact method THEN its action uses the matching phone/email/
  Telegram destination; selections/quantities remain visible to the owner.
- GIVEN staff sends an attachment THEN the authorized owner can view it in the
  conversation; another tenant cannot read or upload attachments to that thread.
- GIVEN chosen place coordinates THEN selection seeds the corresponding coordinates;
  exact locations and valid zero values are not dropped by truthy defaults.
- GIVEN installable tester build THEN no Metro server is required, no privileged
  keys enter the bundle and its declared API/Auth/maps configuration is validated.

Audit the remaining screens/actions against BE-044 and their existing domain
contracts, record concrete defects in docs/MOBILE-RELEASE-AUDIT.md, and add focused
regressions before declaring an installable build suitable for invitations.

S50 owner verification continuation (2026-10-05):
- GIVEN unsaved page edits WHEN Preview is selected THEN the native showroom
  displays the edited cover, story and contacts plus published offerings and
  their galleries. Private draft media remains authenticated. Preview does not
  publish, create inquiries or navigate to a nonexistent public draft page.
  Returning to Edit preserves input. Custom web design remains authoritative.
- GIVEN an owner chooses photos, creates an offering, edits it or hides it THEN
  browser workflow evidence proves persisted values and public visibility, not
  merely that the relevant screen opens.
- GIVEN Featured is revisited WHEN the tab gains focus THEN reload the current
  server schedule and reveal state, retaining the selected day.

Verify in `scripts/capture-mobile-owner.mjs`, existing mobile API/security tests,
mobile typecheck and focused phone captures before further release gates.

S50 map marker parity (owner request, 2026-10-05): native and mobile browser maps
must match the web map's storefront glyphs with business names, selected color,
numbered zoom clusters and nearby-business groups. Featured/live badges use only
server-projected public state. Cluster taps zoom to expansion; nearby groups list
their current businesses; business taps focus without zooming out and open the
existing preview above the result drawer. Filtering removes stale selections.
Render only markers in the current viewport, reuse the existing Supercluster
dependency/radius/zoom thresholds, and preserve canonical coordinate offsets.
Use fixture tiles for automated gestures and capture phone states. No Google SDK,
new provider, application data cache or change to the web map's behavior.

S50 also completes business logo upload/removal through the existing versioned
business service and private tenant media staging. Draft businesses cannot follow
a misleading public-page button before publication. Cancelled photo selection
must not claim an upload succeeded. Existing public/storefront location rules stay.
Photo selection uses the operating system picker without requiring broad library
permission. Selecting individual photos remains available when that permission is
denied; cancelling selection leaves the current image and success notice unchanged.
Malformed inquiry-option deep links must not crash the screen or become trusted
selection data. After a successful video request, a new request gets a new
idempotency key while retries of an unfinished request retain the existing key.

S50 map correction (owner-approved SDK cache exception):
- GIVEN public shops WHEN native map renders THEN project only validated public IDs
  and display coordinates into GeoJSON; private application data never enters SDK storage.
- WHEN filters change THEN update pins without resetting the viewport. Zoom/reset,
  focus and selecting a current shop retain the existing map contract and preview.
- GIVEN map loading failure THEN offer retry without blocking search/results.
- GIVEN overlays THEN pins/preview remain usable and OSM attribution remains visible.
- Browsing shop pins does not request device-location access; remove the SDK’s
  unused Android coarse/fine location permissions from the merged app manifest.
- Tile requests identify Suqpage, respect HTTP caching and do not bulk download or
  expose offline packs. SDK-internal SQLite tile cache is explicitly allowed;
  all application persistence remains server-side PostgreSQL.

Verify pure coordinate/projection/selection boundaries, native typecheck/export,
Expo prebuild and native compilation. Real installed-phone gestures, overlay
composition and offline recovery require device evidence before release. Automated
map interaction uses fixture tiles rather than driving public OSM tile traffic.

## S51 — sponsor and narrative parity

Follow FE-036 S51 for equal six-second, single-sponsor rotation and accessible
manual controls; suspend on screen blur/app background/offscreen and reduced
motion. Follow FE-052 S51 for visitor and owner copy in all five languages,
retaining merchant content and API contracts. Focused browser/native captures and
visual approval precede the still-pending S50 release/distribution gates.

## FE-054 accent parity (local)

Native setup starts at Default without color controls. Page editing offers
presets and visual color/strength/brightness controls over the live storefront
preview. Done closes the picker; Save persists the selection. Optional
profile/shop DTO color controls cover posters (not playing video), restrained
storefront details and inquiry actions; platform chrome/photos remain unchanged.
Omitted legacy payloads preserve stored values, explicit empty resets. Web/native
browser saves are verified against PostgreSQL; physical-device and release
evidence remain separate. See scripts/test-storefront-accent.ts and FE-054.

## S54 — offering-only public results (local verified, 2026-10-05)

Supersedes mixed result lists and result-type controls. Definition of Ready:
web/native public entry points reuse the existing products projection and SQL
pagination; no migration, provider, ranking or eligibility change. Master sections
5.2, 10 and 15 are affected. FE-030/FE-042 govern map/filter/pagination behavior;
FE-053 and BE-044 cover the native public adapter.

- GIVEN Market WHEN opening results THEN one visible Products & services heading
  identifies the list; no Businesses checkbox/tab/card or redundant type toggle.
- GIVEN a business search/category/location WHEN applied THEN eligible businesses
  remain on the map with existing marker/nearby previews; listings contain only
  matching products/services and retain direct product links.
- GIVEN old type=businesses/all URLs or API calls THEN public boundaries normalize
  to product/service results BEFORE counting/paginating, with full pages and no
  business-only trailing pages. Internal reusable discovery projections may
  retain legacy type support; no public client depends on it.
- GIVEN Next/Previous or clearing filters THEN query/category/place remain scoped;
  map membership is independent of result page. Empty lists keep the map intact.

Focused evidence: public API and desktop/390/320 browser capture, typechecks,
existing discovery pagination/multicategory tests. Existing localized Products &
services label is reused. Visual approval precedes full/release gates.

S54 focused evidence passes: both typechecks; test:discovery-pagination (including
public legacy-type normalization and map/count regression); five actual web/native
browser captures in .local/offering-results/ with capture-offering-results.mjs.
Desktop/390/320 screenshots reviewed. Tile imagery is a controlled fixture;
marker data/handlers are real. Physical native-device evidence, owner visual
approval, full/release gates, commit and deployment are not claimed.

## S55 — shared floating search and filters (local verified, 2026-10-05)

Applies to desktop/mobile web and native. Reuse existing search/filter state and
backend projection. No new package/schema/auth contract. Master §5.2, §10, §19
affected. Definition of Ready: clear panel state independent from filter values.

- GIVEN closed results WHEN typing/submitting search or selecting/clearing category
  or region/city THEN controls remain visible on the map and only map results are
  visible; panel stays closed. No duplicate focusable controls.
- GIVEN open results THEN the same labeled/styled controls appear in the panel;
  both map and product/service results reflect the same inputs.
- WHEN opening/hiding results THEN values remain, map stays mounted, and controls
  move with recognizable shapes/styles. An explicit results action opens the list.
- GIVEN a closed-view web URL with filters WHEN reloaded THEN keep results closed;
  Back and product-return retain query, location/categories and view choice.
- GIVEN desktop/390/320 layouts THEN controls fit beside map tools without overlap;
  menus and map previews remain usable above the controls, with existing keyboard/
  reduced-motion behavior and localized labels.

Focused browser checks/captures plus both typechecks precede visual approval.
Native browser evidence does not replace physical-device testing.

S55 evidence: both typechecks and homepage composition contract pass. Ten stable
web/native-browser screenshots plus flow checks are recorded by
scripts/capture-floating-discovery-controls.mjs in .local/floating-discovery-controls/.
Closed search/filtering, reopening, clear actions, one active control set, map DOM
persistence and immediate reload pass. Panel-only changes use native history
integration without fetching data; this fixes the observed close/reload race.
Controlled tile imagery; physical native-device tests remain separate. Visual
approval and full/release/commit/deployment gates remain pending.

## S56 — compact toolbar correction (in progress, 2026-10-05)

Supersedes S55's stacked floating controls: one compact horizontal toolbar remains
at the top in both modes, serving as the open drawer's shared header. Results toggle
at far left, search, then category/location icon buttons. No inline filter labels
or full selects consuming map height. Existing labels/titles expose purpose and
selection; active indicators and menu clear actions preserve usability. At least
44px touch areas; all fit at 320px, map zoom controls start below the toolbar.
Category multiselect and location selection open existing pickers/popovers.
Search/filter/view persistence and offering-only results remain as S54/S55.
No backend/schema/provider change. Master §5.2/§10/§19 affected.
Focused typechecks and desktop/phone/native-browser checks of layout, filtering,
clearing and both panel states precede visual approval/full gates.

S56 evidence: both typechecks and homepage composition pass. The focused
scripts/capture-compact-discovery-toolbar.mjs checks pass in separate --web and
--native runs: six desktop/phone web and four native-browser captures, horizontal
alignment, far-left toggle, one search input, panel states, search, category/place
selection and clearing; web closed-view reload retained. Reports and screenshots
are in .local/compact-discovery-toolbar/. Tile images are controlled; catalog and
markers are real local data. Native drawer captures wait for its final transform.
Native-device testing, owner visual approval and full/release gates remain pending.
Nothing committed or deployed by S56.

## S57 multiple locations — in progress, 2026-10-05

Master §5.2/§5.5/§10/§19 affected. GIVEN selected cities and/or regions WHEN
searching THEN the map and paginated offerings match any selected location, AND
the category/query scope. Overlapping region/city selections never duplicate
results. Empty selection means all locations. Existing single-place URLs remain
valid; repeated or pipe-separated place values normalize to a stable bounded
set (at most 16). SQL values stay parameterized and spelling matches use the
same union before ranking/pagination. Cache identity includes the normalized set.
GIVEN either client WHEN opening the compact location button THEN regions/cities
are checkable, selected values remain available during filtering, and individual
unselect and clear-all work without opening results. Changing scope resets page.
No database schema change is required. Test discovery pagination/spelling plus
web/native filter flows at desktop/phone; retain existing S56 visual style.

S57 focused evidence (local): search suites and test-multiple-locations.ts pass
multi-region/city union, overlap deduplication, exact/fuzzy pagination, category/
query intersections, legacy and repeated URL parameters. Support suites plus
test-live-transport.ts pass both APIs, token/queue/tenant isolation, assignment
capacity, retry, private notes/carrier data, chat ending/resolution/reopen, and
bounds. Migration 59 is applied locally only. capture-multiple-locations.mjs
records seven web and six native-browser states; capture-live-transport.ts,
capture-transport-dispatch-staff.ts and capture-mobile-transport.ts exercise real
handlers and staff server actions at desktop/phone sizes. Temporary staff fixtures
are removed; controlled map tiles and isolated API fixtures are documented in
scripts. Evidence: .local/multiple-location-review/ and .local/live-transport-review/.
Both typechecks and localization checks pass. Owner visual/native-speaker review,
physical device tests, build/full release gates and deployment remain pending.

## S58 paired transport intake — locally verified and visually approved; rollout pending, 2026-10-05

Owner correction to S57: the intake must not become a tall single-column list.
GIVEN desktop or phone (including 320px) WHEN opening transport intake THEN pickup
and destination share a highlighted route card with two columns; name and phone
share the next row. Optional goods details follow the required fields. Suqpage
orange/white, existing buttons, live-chat name and API contract remain unchanged.
Every field retains a programmatic label, 44px minimum input height and logical
keyboard order. Long localized labels wrap; input values scroll instead of forcing
horizontal overflow. Short/keyboard viewports remain scrollable to Start chat.
Master §3 support intake description and §19 responsive behavior are affected.
Verify desktop/phone geometry and actual submission; capture five locales before
owner visual approval. No persistence, dispatcher or permission changes.

S58 local evidence: both typechecks and eight localization tests pass.
`capture-transport-intake-layout.mjs` verifies 13 web/Expo-browser states across
five languages at 1440/390/320px, including paired input geometry, 44px targets,
required-field clearing/enabling, translated headings/placeholders, overflow and
reachable submission. `--short` adds two 390x480 viewport checks.
`capture-live-transport.ts --phone-only` and `capture-mobile-transport.ts` pass
real-handler chat submission/reply/end scenarios with isolated PostgreSQL data.
Screenshots: `.local/transport-intake-layout/`; lifecycle: `.local/live-transport-review/`.
Wrapped native labels align to the input baseline; the web launcher waits for its
portal to mount. Owner visual review, physical-device keyboard checks, human
language approval and full/release gates remain pending. No deployment or commit.

S59: owner approved the S58 layout and authorized coordinated web/mobile release
on 2026-10-05. Release checks are now authorized; deployment/device evidence
remains separate from that approval.

## S64 — selection counts and product business links (2026-10-06)

Ready, L1. Uses existing FE-042/BE-023 discovery data and FE-053 navigation;
no API, schema, ranking, eligibility or tenant change. Master §5.2 is affected.
- GIVEN zero, one or multiple selected locations WHEN viewing the closed or open
  toolbar THEN the pin shows no badge, 1, or the selected count respectively.
  Clearing, deselecting and restoring URL state update the count. Category and
  location badges use the same treatment on web and native mobile.
- GIVEN a product result THEN its business is identified by a localized
  “From {business}” link, preserving the business name verbatim. WHEN following
  that link THEN open that business's main showroom; WHEN opening the product
  THEN open its product details. Links must not nest or trigger each other.
- GIVEN a narrow phone, long business name or translated interface THEN controls
  remain usable, names wrap, focus is visible, and the toolbar stays one row.

Verify web/mobile typechecks, localization, spec validation and focused browser
checks at desktop/390/320px: zero/one/two/clear/reload badge states, independent
product/store navigation, and return-to-market state. Capture both clients.
Native browser evidence is not device evidence. Visual approval precedes full
release gates; rollout reverts these UI files with no data migration.

S64 local evidence: web/mobile typechecks, eight localization tests (1,256
messages per non-English catalog) and validation of 167 specs/ADRs pass.
`capture-multiple-locations.mjs` passes 16 captures, including 0/1/2/clear,
reload and open/closed-panel count checks. `capture-result-business-links.mjs`
with --web, --native and --locales passes 15 captures: independent destinations,
web keyboard order, 44px store targets, long-name wrapping and all five locales
at desktop/390/320px. Web browser Back and the mobile app Back preserve search.
Private evidence: `.local/multiple-location-review/` and
`.local/result-business-links/`; basemap tiles are controlled fixtures, local
catalog reads are real, long-name captures use a DOM-only display fixture.
The initial duplicate-business locator was scoped to one card; Metro was
restarted to refresh shared catalogs. Expo browser history navigation can reset
Market state; the mobile app Back was verified instead. No physical-device or
native-speaker signoff is claimed. Visual approval and full release gates remain
pending; this change is not deployed or included in the existing S62 APK build.

## S65 — in-app websites and social handoffs (2026-10-06)

Ready, L2 client adapter. Existing expo-web-browser is installed; no package,
backend, authentication or checkout change. Master §9 handoffs and §15 native-client behavior
and ADR-0023 are affected. No production or store rollout in this increment.

- GIVEN an HTTPS website/contact/policy/sponsor link WHEN opened on native THEN
  use the system in-app browser (Android Custom Tabs / iOS Safari sheet) with
  visible browser identity and a close/back control. Keep the Suqpage screen and
  inquiry state; do not forward app tokens, inject scripts or intercept payments.
- GIVEN a recognized WhatsApp phone or Telegram username HTTPS link WHEN tapped
  THEN try its corresponding app with the existing message text. If unavailable,
  use the original HTTPS URL in the in-app browser. Other HTTPS links use that
  browser directly. Calls, SMS and email use their installed handlers.
- GIVEN user descriptions containing explicit HTTPS or www URLs THEN make those
  spans accessible links using the same opener while preserving all visible text.
  Unsupported schemes, malformed URLs, credentials and control characters must
  not execute. Merchant text is never HTML or executable script.
- GIVEN a failed browser/app launch THEN show a localized failure, allow retry,
  and retain the inquiry. Closing a browser is not proof of message delivery,
  purchase or payment. The OS controls return from another installed app; no
  automatic third-party callback is promised.
- GIVEN Expo web preview THEN open external HTTPS links in a separate browser
  window/tab preserving Suqpage. Browser preview cannot demonstrate native sheets.
  Existing in-app YouTube playback remains unchanged.

Verification: pure URL/classification/port tests for allowed schemes, malicious
lookalike domains, text/parameter preservation, app success/fallback, browser
failure/cancel and no duplicate fallback. Type/localization checks plus Android
JavaScript export and focused description/contact browser evidence. Native device
verification and visual review remain release prerequisites. Rollback only
reverts the client adapter; no data migration or provider configuration change.

S65 local verification (2026-10-06): six `test:mobile:links` cases pass, including
actual adapter bundling with controlled React Native/Expo ports, malicious URLs,
Unicode inquiry text, installed/missing social apps and sanitized failures.
Both typechecks, eight localization tests (1,257 messages) and spec validation
pass. Android JavaScript/Hermes export passes at `.local/mobile-links/android-export`;
this is not an APK or device test. `capture-mobile-links.mjs` passes four 390/320px
captures plus description/story/Website navigation, isolated popup, retained screen
and simulated launch-error checks. Real catalog reads use response-only description
fixtures; example.org is intercepted, with no merchant data writes or real contact
messages. Screenshot evidence is `.local/mobile-links/`. The dialog test initially
waited for a click before dismissing its alert; the corrected concurrent handler
passes. No new dependency, database migration, hosted mutation or deployment.
Native browser sheet, installed social apps, iOS and release checks remain open.

## S66 — verified Suqpage links (2026-10-06)

Ready, L3, under DEP-042 and ADR-0023. Owner requested implementation. Canonical
host is suqpage.com. Current delivery targets the existing Expo internal Android
preview package and its verified signing certificate; production/iOS association
must not be invented without their signing identities. Master §15 is affected.

- GIVEN a verified installed Android preview WHEN opening an HTTPS suqpage.com
  /@handle link THEN open its native showroom. A valid product query opens that
  handle's product details; catalog authority still rejects unrelated/hidden items.
- GIVEN Market, Featured, About or account/sign-in links THEN open the matching
  native route. Market restores canonical query/category/place/page/view inputs
  for cold and warm opens, including opening the same link after manual edits;
  ordinary interactive edits remain intact until another incoming link.
- GIVEN malformed, credential-bearing, lookalike-domain, executable or unsupported
  incoming paths THEN do not execute them or grant authority; safely open Market.
  Admin/API/Auth callbacks remain web routes and are not claimed by Android.
- GIVEN no installed verified app THEN existing website routing remains available.
  Only exact canonical HTTPS routes are claimed; no wildcard subdomain takeover.
- GIVEN a signing/association mismatch THEN verification must fail, not install a
  fabricated certificate. Website association exposes only public package and
  SHA-256 certificate data. No private signing keys or app secrets enter Git.

Verify pure inbound-route security/routing, native-intent adapter and config,
Market parameter restoration, local HTTP association content, Android export,
selected web release gates and native cold/warm/device domain verification.
No new UI, database, checkout, permission bypass or app-store submission. Website
rollout adds the association to the live release; native installation needs a new
APK. iOS Universal Links await Apple Team/app identity and device evidence.

S66 focused evidence: five app-link routing/config/security tests and six outbound
link tests pass. Existing mobile contract/PostgreSQL API/build/dependency/map/video
gates pass; mobile typecheck and spec validation pass. Expo introspection verifies
actual generated Android autoVerify manifest filters. Android JS/Hermes export
passes. Six browser checks verify public local association JSON, cold/warm Market
scope restoration, repeated-link restoration, retained interactive edits and a
real product destination.
Private evidence: .local/app-links/. Browser/port tests are not Android OS-domain
verification. Native audit still fails on exactly braces/node-forge (20 high, zero
critical), requiring review before the next artifact. Domain/native rollout pending.
