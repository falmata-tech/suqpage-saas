---
id: FE-053
title: Native visitor and business-owner app
status: in_progress
related: [FE-074, FE-066, FE-026, FE-021, FE-061, FE-060, FE-059, FE-058, FE-056, FE-051, FE-055, FE-054, BE-044, DEP-042, FE_BASE, FE-019, FE-049, ADR-0023, FE-036, FE-052, FE-057, FE-062, FE-063, FE-064, FE-065, DEP-043, BE-018, FE-067, FE-041, FE-047, BE-050, BE-023, FE-068, FE-069, BE-058, DEP-048, FE-072, BE-060, FE-073, FE-076, FE-075]
owners: [product, frontend, backend, security]
last_updated: 2026-10-23
change_level: L3
---

# FE-053 — Native visitor and business-owner app

## S173 — compact transport entry beside product facts (ready)

GIVEN a buyer opens a native product page WHEN merchant facts and order-size
badges are visible THEN the floating transport entry uses its short title and
truck icon without a second line covering those facts. Its full accessible
label, route and touch size remain. The product content can scroll clear of the
floating entry and bottom navigation.

## S166 — compact localized owner transport entry and header (in progress)

GIVEN an owner opens a fresh transport intake at 320 or 390px WHEN the Account,
Chat history and Shipment records actions render THEN they form a compact,
accessible utility row instead of three stacked full-width buttons. Long active
language labels may wrap to a second row; the route fields and Start chat remain
the primary content. Existing back/history/record destinations, disabled states
and 44px minimum touch height remain.

GIVEN Afaan Oromo is selected at 320px WHEN the shared app header renders THEN
its language control shrinks within the viewport without covering the wordmark
or losing its accessible label/touch size. Verify the actual Expo browser screen
at 320/390 in English, Amharic and Afaan Oromo, and retain installed Android
qualification as a separate release gate.

## S153 N15 — polling survives cancelled reads after a mutation (focused checks pass; physical pending)

GIVEN a focused current guest or owner transport conversation WHEN Send/End/Resume
invalidates an in-flight read and its write settles THEN the current polling loop
continues at its admitted cadence without leaving the route. A cancelled older
request must not retain ownership of later reads even if its adapter settles late;
its success, failure or cleanup cannot publish stale messages, read state, errors
or clear a newer request. Keep one admitted read per current generation, existing
open/closed backoff, foreground gates and no hidden/background request growth.

GIVEN blur/unmount, a different owner/token/reference or a closed transition THEN
old work cannot publish or restart the departed scope. Re-entry performs ordinary
recovery. Preserve message idempotency, draft/failure retry, visible-only reads,
join/idle/end authority and production/development storage isolation. No backend
mutation, timer relaxation or global error suppression is part of this correction.

First extend the actual Buying React/lifecycle fixture with signal-aware settling
and nonsettling cancelled reads and deterministic virtual time. Classify old-source
results for post-Send refresh, renewed poll, focus return and closed cadence, then
seek root GO for the smallest diagnosed correction. Source remains frozen during
paired chat. Existing race/idle/owner/storage suites and physical same-case Send→
staff reply/read updates must qualify the fix separately. Master §§13/19 already
require live reply/read correctness and current-scope authority.

The diagnosed correction binds the in-flight lease and cleanup/reschedule to its
generation, checks activity before starting, and wakes the existing open/closed
cadence after settled mutations. Both actual React paused-clock abort cases pass,
including stale completion while a newer read is pending. The four existing race,
idle, owner and storage suites pass26 tests with no skips; mobile/scoped types and
219 spec links pass. The old source fails only the held-abort refresh after the
initial fixture clock issue is classified. This qualifies cancellation ownership,
not the actual native fetch cause or release-build reproduction; DEV Fast Refresh
and same-case physical continuous-update verification remain separately recorded.

## S153 N13 — isolate inactive Market panes (focused and Chrome checks pass; visual pending)

GIVEN Businesses or Products is selected WHEN the inactive pane remains mounted
for map/search return state THEN its controls are hidden from accessibility and
sequential keyboard focus. Preserve native hidden-descendant flags and pointer
gating; explicitly expose matching `aria-hidden` and web-only `inert` through the
installed React Native Web adapter. The active pane must lose inert immediately
on selection. Keep the mode switch and drag handle outside both hidden regions;
no route, copy, data, animation, map or native accessibility behavior changes.

Reuse `scripts/test-mobile-market-layout.ts` to verify actual-source toggles,
Android Back/retained state, native flags and installed RNWeb markup. Require
actual Chrome Tab/Shift+Tab plus mode/handle return before visual/full gates;
SSR forwarding alone does not prove real keyboard traversal. Android verbose
UIAutomator nodes alone do not establish a TalkBack defect; verify separately.
FE-065 and master §19 already require inert hidden controls, so their product
statements remain unchanged. N12 native conversation density is planned in FE-019;
no conversation implementation is authorized while its paired audit is active.

The existing Market component suite passes23 cases, including actual-source
Android/iOS/Web selection and installed RNWeb markup; the new regression fails
on the prior source. Mobile/scoped test types and219 spec links pass. Native
flags and mounted state remain unchanged. This proves forwarding and source
selection. Separately, actual Expo Chrome390/1440 passes272 sequential Tab and
Shift+Tab steps, true accessibility-tree exclusion and keyboard mode/edge/return
journeys with restored Products and camera/zoom. Prior map-remount harness stops
remain preserved. Physical screen-reader behavior and the combined visual/full
gates remain separate pending qualifications.


## S153 — expose the selected main navigation tab (focused checks pass; actual review pending)

GIVEN an existing Market, Featured, About or Account destination is active WHEN
its tab renders in Expo web THEN the actual DOM exposes `aria-selected=true`
only on that tab and false on its siblings. Preserve native accessibility selected
state, current route matching, visitor Login/owner Account labels, touch bounds,
layout and guarded navigation. The installed React Native Web mapping requires
the explicit selected attribute; visual color alone is insufficient.
Reuse `scripts/test-mobile-account-hub.ts` for native state and installed RNWeb
markup across current routes/locales, then actual ordinary-code Account/task
navigation. Master §§13/19 already require current-location and accessible state.
No navigation, copy, backend or native dependency change is introduced.
The existing Account-hub suite passes nine cases, including 14 native-state and
42 installed-web route/locale/session combinations. Both new selected-state
regressions fail on the old source; mobile and scoped test types pass. The ordinary
local-code owner journey supplies separate actual navigation evidence.

## S153 P1 — DEV credentials belong to their API/Auth origins (focused security checks pass; release pending)

GIVEN the development client shares the production Android package WHEN it uses
a different API or Auth origin THEN owner restoration, SDK storage/suffixes,
logout, guest transport and its unread badge use only development keys scoped
to those canonical origins. Owner keys include both API and Auth; guest keys
include API. Encode HTTP(S) origins losslessly using SecureStore-valid ASCII;
reject invalid or opaque origins without reading storage. URL user information,
paths and query strings never enter a key. Missing Auth configuration keeps
public browsing available without selecting a legacy owner key.

GIVEN legacy production owner/guest credentials and SDK suffix bytes already
exist WHEN the DEV client restores, starts/ends chat, polls attention or logs out
THEN none of those legacy values is read, replayed, overwritten or deleted; no
legacy fallback/migration is allowed. GIVEN the production client THEN its exact
existing owner/guest keys, SDK suffix behavior and restoration remain unchanged.
Tracking retains its independently origin-scoped key. Verify actual Runtime and
Buying/unread storage ports plus the installed Auth SDK with synthetic values;
pure-key tests alone do not qualify device installation. No identity, role, API
or hosted Auth change. Master §§11/13/17 and BE-044 control the shared boundary.

Plan: specify → red actual-port regressions → one pure key selector and narrow
call-site wiring → focused security/affected-port/types/spec checks. Actual
DEV-client installation remains blocked until these security regressions pass;
no production credential access or new native build is part of this correction.

Focused evidence: `scripts/test-mobile-logout-ui.ts` and
`scripts/test-transport-storage-ui.ts` pass16 actual Runtime/Buying/unread, pure
key and installed-SDK cases after their legacy-key negative controls fail. The
seven affected resource/chat/plan fixture suites pass41 cases; mobile and scoped
test types and219 spec links pass. These use synthetic credential/HTTP ports,
not real provider, email or device credentials. Installation, ordinary local
email delivery and the later combined release gates remain separate.

## S153 N09 — floating public actions without an opaque viewport strip (ready)

Actual Expo and the installed version 2 Featured screen expose a full-width blank
strip behind the floating transport action. Keep measured floating actions and
48dp targets, but reserve their variable height inside scrollable content, not
the Stack viewport. GIVEN Featured, About, a showroom, Product or inquiry WHEN
public actions render THEN content remains visible/scrollable to the bottom
navigation and no opaque fixed band extends beyond the actual controls. GIVEN
long labels or a business inquiry count WHEN the measured dock height changes
THEN the final content can scroll fully above it. Private Account/editor and
Market placement keep their existing layouts; no copy, role or API change.

Plan: retain the existing measured root height in a presentation-only inset
context; clear Stack viewport padding; append the measured inset to the existing
default/custom public scroll content; extend dock/root regressions and actual
320/390/landscape Chrome geometry before the combined visual gate. FE-041 owns
inquiry isolation. Master §19 remains the current accessibility/layout authority.


## S153 — interactive owner entry and focused product tasks (focused and Expo checks pass; visual approval pending)

The physical audit confirms successful reviewer login resets the actor-keyed
navigator to Market. Preserve that private-navigation reset, but retain explicit
interactive Account sign-in intent above it. GIVEN successful reviewer-password
or ordinary email-code entry WHEN the current owner session is validated and
navigation is ready THEN replace with Account and its normal setup/hub. Failed,
cancelled, stale or denied entry must not navigate. Cold session restoration on
Market and same-owner token refresh must not force Account. Clear transient
entry intent on cancellation/logout; never persist credentials or route payloads.

FE-056 owns the paired product-management presentation: compact private rows and
one persistent Save/Cancel bar outside a product-specific scrolling body. Keep
global navigation, tenant/version/idempotency, dirty exits and public cards intact.
Test the actual actor-keyed root boundary, not Account alone, plus existing
runtime/owner guard negatives. Focused tests/types precede actual Expo/Chrome
review and the existing visual gate; no new native artifact or device pass is
implied. Master §§11/13/19 and FE-064 are affected. No provider/API change.

Focused local evidence: `scripts/test-native-resource-loading.ts` passes eight
actual React/Chrome cases. The production root Layout, RuntimeProvider and Account
run across an actor-keyed controlled navigator reset: password and OTP success,
server-validation/navigation readiness, cold restore, token refresh, cancelled or
denied entry, different/reappearing actors and logout/late responses. The unchanged
Layout control fails both interactive destination cases. Existing logout UI/SDK
regressions pass five cases; mobile and scoped test types pass. These controlled
router/Auth ports establish neither actual Expo routing nor installed Android
behavior. Actual source-bound Google Chrome Expo review now passes five bounded journeys:
visitor Account→Market→transport→Tracking, local SDK fixture owner entry→Account,
compact Products→Edit/Keep/Discard, en/am/om phone/landscape action geometry and
failed Save→retry→exact UI restore with authoritative local API checks. Ordinary
interactive email entry remains blocked by local Auth 429; fixture entry does not
prove this destination in real Expo, which retains the actual-root controlled
regression and needs the next binary's physical login check. The active checklist
retains visual/full/build/device steps.

## S151 B10 — category-first Featured choices (implemented locally)

FE-021 B10 controls the shared presentation correction. Expo/native must show
the actual localized category name with its existing decorative illustration;
weekday/date are secondary context, never the only visible label. Use a readable
horizontal row with wrapping names and48px minimum targets rather than seven
tiny choices. Keep the selected choice visible on load/selection/return and
include category plus schedule in its accessible name. Preserve day selection,
request fencing, sponsor visibility, slot identity and business/Back navigation.
Focused actual-source checks and actual Expo Chrome precede the combined visual
gate. Fourteen category/grid/skeleton cases and strict mobile types pass. Actual
Expo Chrome passes six English/Amharic/Afaan Oromo phone states and three real-API
selection→business→Back journeys. Full localized names wrap without clipping;
the actual web toggle state is explicit `aria-pressed`, while native retains its
selected accessibility state. Initial skeleton tiles match the new geometry.
Protected S151 `b10-*` receipts separate the initial missing-web-state failure,
controlled ports, actual browser evidence and pending visual/full/release gates.
No physical phone control or rebuilt Android proof is included.

## S151 — physical showroom and compact Featured grid correction (local correction; review pending)

FE-041 S151 controls the minimal native/Expo grid correction. Use the actual
measured width only to choose one/two columns; let Yoga allocate card width so
pixel-rounded measurements cannot wrap every half-width card into its own row.
Keep enlarged-text/narrow fallbacks, merchant identity, canonical products,
description, Add/options, categories and return state unchanged. No copy,
permission, dependency, API or provider change is needed. Verify actual-source
interaction tests, installed Yoga geometry and focused actual Chrome Expo tasks;
visual approval/full checks and a rebuilt physical-phone APK remain distinct
pending gates. Old-source APK geometry and AAB review cannot qualify this fix.

The same batch includes Featured's independently reproduced narrow-screen
geometry: two48% cards plus12dp gap exceed its284dp content width at a320dp
viewport. GIVEN Featured's measured grid WHEN two150dp cards plus12dp gap fit
and font scale is at most1.3 THEN show two flexible columns. GIVEN a narrower or
unmeasured grid or enlarged text THEN use full-width rows. A final odd card may
fill its row. Preserve slot order, scheduled-day selection, sponsor visibility,
canonical business identity and business navigation. The shared native sizing
contract changes no web showroom layout. Test actual-source measurement/resize,
font scale, odd count and navigation plus installed Yoga old-failure/new-pass
fixtures before the consolidated Chrome/owner review. This is a batch correction,
not permission to build or release the superseded source.

The shared framework-independent geometry helper now delegates actual row
allocation to Yoga. FE-041 records11 actual-component and864 installed-engine
regressions plus17 actual Chrome Expo checks across English, Amharic and Afaan
Oromo. The ordinary public Add/details/Back and Featured/business/Back journeys
pass against local schema77 with no backend mutation; local screenshots are
supporting browser evidence. Root/mobile types and spec links pass. Preserve the
separate visual/full/rebuilt-APK/physical-device gates; no new phone pass or app
release is inferred from Expo or the isolated engine fixture.

## Planned S146 — simpler owner tasks

FE-072/BE-060 retire Team editing from native owner Profile/Your page and the
native assistance command, keeping ordinary owner tasks and their Save/Cancel
behavior. Staff still cannot sign in to the native app. The future owner-only
sign-in-email flow in FE-073/BE-061 is separate from business editing. This is
planned until actual Expo review and security tests pass.

## S145 local source: native Shipment tracking provider references

FE-069/BE-058/DEP-048 define the independent Tracking-only leg extension.
Use visible Shipment tracking terminology, preserving routes, credentials and
all session/focus/refresh/expiry/revocation behavior. GIVEN an authorized detail
with optional provider URL/code THEN show literal code with honest explicit Copy
and an optional external provider action. Revalidate the pure shared HTTPS/DNS
policy on press before the existing native browser helper; no fetch/embed,
code-templating or automatic status claim. Missing/legacy fields stay hidden.
Copy/open errors remain usable, reset when detail values change and do not
pretend delivery/read/status.48px controls and wrapping work at320/390px, in
en/am/om. Root accepted the Ready contract before implementation. Local source
and the focused native/UI cases now pass, including explicit failed copy/open,
legacy blanks, late response/session fencing and long-code controls. Strict
mobile types pass. Actual Chrome Expo8082 role journeys, new visual approval and
full gates remain pending; no installed-device or deployment claim is made.

## Ready: native public map client identification

The finite BE-059/DEP-049 source follow-on is Ready: native OSM requests identify
the app as MirtPage/0.1 (+https://mirtpage.com). Preserve the existing transform
registration ID and exact HTTPS tile.openstreetmap.org match. GIVEN the native
map module loads WHEN the SDK header registers THEN only the fixed public
User-Agent is added AND no token, cookie or header reaches another host. An
executed adapter-port regression checks registration and hostile-host exclusion;
this does not claim a rebuilt native app or provider-side tile acceptance.

The single User-Agent source value is implemented. All11 mobile-map tests pass,
including executed registration, exact HTTPS host/privacy and hostile URL
exclusions; mobile strict types pass. Registration ID stays suqpage-osm-client.

## Ready: MirtPage default Android identity

DEP-049's independently Ready local tranche supersedes the old Suqpage future
build identity: all three normal source profiles become MirtPage/com.mirtpage.app.
No new iOS application or binary is admitted. Existing EAS infrastructure IDs,
account/data identities and notification channels are not visible brand labels.
GIVEN safe MirtPage or legacy public links WHEN opened cold or warm THEN reach
the same authorized public screens; no URL supplies identity or Tracking access.
GIVEN new Android OS claims THEN only the exact new apex may be claimed, after
the registered association qualifies; never inherit the old top-level scheme.
Verify canonical notification geometry, actual SDK configuration and every
existing hostile-link negative. Installed-device/artifact proof remains separate.

Local focused evidence: actual Expo config and Android scheme plugin verify all
three profiles as MirtPage/com.mirtpage.app with only mirtpage scheme. Native
strict types and16 cold/warm link, handoff and artifact cases pass. The additive
new public association is prepared, while the empty qualified-target set keeps
new OS HTTPS claims off. No new binary or real OS-link/device result is claimed.

## S130/S131 — richer previews and optional showroom categories (ready)

FE-065 S130 controls public product-city projection, richer bounded map rows and
locale-aware selected-business details. FE-041 S131 controls styled optional
category chips, literal product affiliation and native/web filtering parity.
BE-044 governs the additive optional DTO fields. Keep S129 card Add/options,
S118 saved lists, S127 modal capacity and S128 compact Market controls unchanged.
No signup/category requirement or new owner editing permission is introduced.
Actual-source focus tests and real Chrome Expo/web workflows precede inherited
explicit visual approval/full/commit/rollout gates; no Android claim is implied.

## S129 — direct inquiry-list actions on showroom cards (local implementation)

FE-041 S129 controls native/Expo card parity: a two-line merchant description,
separate details and48px Add/Added actions, canonical required-options Sheet,
stock/preview/loading guards and unchanged per-business saved-list/dock authority.
No navigation to details is needed to add; full detail remains available. Reuse
existing five-language actions and current shop accents. No new persistence,
backend, catalog, public contact or transport changes. Focused actual-source and
installed-Chrome web/Expo evidence precede the existing visual/full/release gates.

S129 focused verification: six actual-source card cases plus24inherited
canonical basket/contact/dock/product-only cases pass (30total). Mobile and
strict-script typechecks pass. Options defaults are only canonical sole values;
Cancel and maximum-list feedback stay inside the current picker. The same
existing per-business store and floating dock are used. Actual Chrome evidence,
source hashes and limitations are consolidated in FE-041 and traceability before
the still-pending visual/full/commit/rollout gates.

## S128 — compact Market toolbar (locally implemented; review pending)

FE-065 S128 governs the new top-area layout: no duplicate visual Market title
row, retained non-layout localized heading, centered48px Businesses/Products and
About/info actions. Search plus all labeled filters share one row at sufficient
content width, including844px landscape; phones/enlarged text use clear wrapping
rows. Search, counts, clears, scope memory, map/panels and S127 group behavior
remain authoritative. Verify actual viewport gain, all languages, keyboard and
real local API journeys before visual approval; no global header/nav redesign.

S128 focused evidence: `test-mobile-market-layout.ts` (18 cases, including
actual RNWeb idle/loading/error rendering), `test-mobile-map-groups.ts` (9) and
`test-product-only-native-ui.ts` (7) pass, with mobile/strict script typechecks.
The existing pure Leaflet resize helper moves unchanged to `lib/map/leaflet-resize.ts`;
the native import path re-exports it. Installed SDK arithmetic and web lifecycle
regressions cover parity, zero-size and loading-row resize. Actual Chrome layout
and real API journey evidence is consolidated in FE-065 and traceability; this is
Expo-preview evidence, separate from installed Android/MapLibre. Browser hard
reload returns to English under the existing in-memory web adapter; test URL/filter
restoration, then select the target language again through the actual UI. No
native storage or global navigation change. Visual/full/commit/rollout gates stay open.

## S127 — screen-sized fixed groups (ready; latest owner direction)

FE-021 S127 controls the shared modal capacity (up to6 desktop/3 phone, reduced
for height/font scale), compact nearby partitions and current-member validation.
Every final circle at maximum opens all members at once: no list scrolling, Next/Previous or
connecting lines. Normal outer clusters merge on zoom-out and click to zoom in; only final
all-fit groups stop splitting and open the modal ONLY at maximum normalized18
(native raw17). Any counted circle below maximum zooms instead; restored state
below maximum cannot expose the modal. Screen-capacity or eligible
data/filter changes may repartition final groups. Preserve existing coordinates/provider/API cap, current-row authority,
short-stage48px controls, focus/camera return and native-authored labels. Native
and Expo use the same capacity policy with their actual safe-area dimensions.
Do not use legacy server nearbyGroups as current visual membership authority.
GIVEN a Leaflet marker root rendered before its SDK zoom callback commits parent
state WHEN that final marker is activated at maximum zoom THEN dispatch through
the latest current onGroup/onSelect callback, not the captured pre-maximum
callback. Ordinary zoom→final click opens on the first activation without a
language/filter rerender. Keep current member/maximum guards and no extra render
loop. Regression must replace the callback after marker construction and prove
only the fresh callback runs.
Current implementation/testing is in progress; earlier global-three/leader/paging
evidence is superseded, not approval. Full/visual/release/rollout gates stay open.

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

## S125 — customer waiting and explicit staff acceptance (ready)

The newest owner instruction supersedes assigned-before-joined presentation.
GIVEN a visitor or owner request has only internal assignment WHEN the native
transport/support or history view renders THEN show Waiting for our team and no
assigned agent announcement. Only BE-018 explicit Join permits the joined name.
Needs-reply/Overdue are internal; customers receive no deadline promise. A public
staff reply uses Waiting for your reply. Ended and Resolved remain distinct;
preserve reference, drafts, visible-message reads, idle warning/resume and history.
Cover web owner projections and Expo8082 actual paired journeys with BE-018/050,
FE-019/062 and DEP-043; native-device/OS delivery remains separate evidence.

## S122 — native owner workspace safe navigation (implemented locally; review pending)

Actual Expo/Chrome audit confirms global header Back loses a typed About draft,
despite the local Cancel dialog; Product Edit has no Cancel and its parent goes
to Account while Save goes to Products. Product titles lack accessible headings.
GIVEN a dirty focused owner editor WHEN header/stack/back/app navigation would
leave it THEN retain the editor until Keep editing/Discard is chosen. Use the
installed Expo Router navigation lifecycle for removal and app-owned persistent
navigation for retained screens; do not replace browser history handling. Cancel
and successful Save return to their coherent task parent. Pending saves cannot
start another command or silently discard input. Unchanged exits need no prompt.
Product edit/add return to Products; owner hub/page/contact/support/transport
remain distinct. Existing title text becomes a semantic heading, not a new visual
heading stack. No new dependency, data store, route authority or capability.

FE-056/FE-026 govern shared task behavior. Focused actual native controllers and
real Expo390/320 navigation/re-entry/Keep/Discard checks must prove these cases;
installed Android/OS termination behavior remains separate. Do not claim the OS
cannot terminate a process or that closing a browser tab preserves local drafts.

S122 local verification: scripts/test-mobile-owner-edit-navigation.ts (14 cases), inherited native controller regressions and actual Expo header/footer/Save/re-entry journeys pass. Current source, protected
readback and scoped harness failures are recorded in TRACEABILITY.md and
`.local/workspace-audit-s122/`. Both typechecks, localization and spec validation
pass. Visual approval, full/release/acceptance gates, commit and rollout remain
pending; this is not physical Android or complete-application certification.

## S121 — observe automatic queue pickup (ready)

BE-018/FE-019 S121 automatically routes eligible waiting cases without a client
write. Existing visitor and authenticated owner chat polling must observe the
same reference changing from Waiting to Assigned to the saved agent, without
claiming the agent has joined. Technical owner support uses the same existing
localized assigned-before-joined wording as visitor/owner transport. Preserve
drafts, receipts, role denial and the actual focused/hidden polling boundaries.
Prove the affected flow in actual Chrome at localhost8082 against real APIs;
browser evidence does not establish installed Android behavior.

S121 local evidence: the existing registered owner-transport test file now also
mounts the actual technical OwnerChat controller through explicit lifecycle
ports. Waiting/assigned/joined/ended snapshots preserve the same reference and
emit no commands. Native typecheck passes. Actual Chrome at8082 signs in an
existing owner, navigates Account→Support→its existing case and verifies the
saved assignment/ref through real focused GETs. A single deliberate network abort
recovers without Retry in10.708s. See
`.local/queue-recovery-s121/native-agent/reconnect/review-receipt.json` and
`recovery/review-receipt.json`. Original restart-observer failures are retained;
these separate passing flows are not a retroactive pass for them. Native source
hashes are frozen; no installed-device or OS delivery proof is claimed.

## S119 — batched native visible-read confirmation (ready)

BE-050/FE-062 S119 applies to visitor transport, authenticated owner transport and
technical support. Each transcript observes every incoming footer through one
focused measurement batch and timer, coalescing a batch to its highest actually
visible ID. A newer offscreen reply must not prevent reading an older visible
reply. Own messages and fetched-but-unseen replies never advance peer receipts.

GIVEN an asynchronous native measurement WHEN app/router/browser focus, overlay
generation or conversation/account identity changes before completion THEN drop
that batch, including a background→foreground round trip. Failed acknowledgements
retry while visible; successful ones remain deduplicated within their identity.
Preserve keyboard events, safe-area/navigation bounds and viewport offsets.
Assigned-before-joined transport status follows FE-019 without claiming presence.
Controlled native-adapter regressions do not prove installed Android behavior.

Mapped focused evidence: `scripts/test-visible-chat-reads.ts` and
`test-mobile-owner-transport.ts`, with inherited assignment, inactivity and
storage regressions, pass20/20 under actual React or explicit native lifecycle
ports. `test-chat-read-viewport.ts` and native/web typechecks pass. All incoming
footers in both transport and technical-support renderers share one transcript
observer. Actual browser and installed Android verification remain distinct.

## S118 — per-business inquiry selection parity (ready)

FE-041 S118 supersedes native's one-business-only app-memory basket. Each business
has an independently persisted bounded reference list, rehydrated from its fresh
public catalog. Float its count only on its showroom/product pages; no global
Market/Featured list action or cross-business clearing. Ordinary account security
and logout do not become catalog authority. Direct one-product inquiries stay
independent. FE-066 S118 enables only server-approved owner phone destinations
for demo SMS/WhatsApp/Telegram and exact approved public profile/site examples.
Residual fake destinations remain inert; real social handoffs remain unchanged.
Ready and failure/test/privacy bounds are specified in FE-041/FE-066. Expo browser
and installed-device verification remain distinct; no backend/schema/provider.

### S118 local verification — visual approval pending

Native/Expo now lazily loads each business's independent inquiry list from
existing document-file/browser storage, namespaced by canonical API origin and
business ID. The dock is limited to the current showroom/product route. Saved
references are rehydrated from that business's fresh public catalog; direct
one-product inquiries do not alter stored lists. A one-shot bridge preserves
matching legacy in-session selections. No account credential storage, backend,
schema, provider or dependency was added.

`scripts/test-business-inquiry-baskets.ts` covers bounded references, API-origin
isolation, malformed/foreign selections, initial-read and write races, read/write
failure recovery and temporary-file adapter behavior. Actual-source hook, dock,
product, inquiry and root regressions are in `test-mobile-public-action-dock.ts`,
`test-product-only-native-ui.ts` and `test-public-transport-launcher.ts`. The shared
S118 focused set passed 92 cases; the post-pointer-events focused rerun passed 26
relevant cases, without counting those repeated cases as new unique tests. Final
web and native typechecks passed. The narrow compatibility correction preserves
the existing overlay and active-pane interaction behavior.

`.local/business-inquiry-s118/actual/attempt-2/outcome.json` records three passing
anonymous local surfaces and six screenshots: web 1440/390 and Expo 390, including
Amharic. Two-business counts, quantity changes, return/reload, direct-single
isolation, absent Market/Featured inquiry chrome and retained transport passed
with stable source hashes and no runtime, console or API error or application
mutation. Clipboard/openers were controlled and SMS was not launched. The
`expected-network-verified.json` companion classifies all 31 raw failed-request
records as navigation-cancelled, intercepted analytics POSTs; none reached the
application, no public GET failed and no unexpected request failed. The original
strict-failure receipt is retained.

These checks do not prove installed Android storage, native MapLibre or OS
protocol behavior. Visual approval, full/acceptance/release gates, a rebuilt
Android binary and deployment remain separate pending steps.

## S117 — selected Market panel on return (locally verified)

FE-065 S117 applies to native and Expo browser. Ordinary Market navigation and
detail Back retain the last selected panel and independent criteria within the
app session; explicit incoming view/search links override memory. Market's Android
Back handler runs only while that screen is focused, and browser URL updates
preserve navigation metadata. New sessions default to Businesses. No private
data, catalog payload, device storage dependency or backend change is introduced.
Expo's router owns browser Back/Forward; its intermediate navigation events do
not independently restore stale state. Repeated explicit map actions carry a new
navigation intent, while detail Back preserves a later manual panel choice.
The Expo browser Leaflet adapter also safely ends its owned active animation on
departure; native Android MapLibre is unchanged. Eight actual-source Market/
About controller tests, six app-link/security tests and two installed-SDK browser
map tests pass within the shared 27-case focused set. Local current Expo journeys
and captures are mapped in S117 TRACEABILITY. Existing approval/full gates and
installed Android proof remain separate.

## S115 — native focused owner workspaces (ready)

FE-056 S115's grouped Your page tasks and focused About/video/contacts/color/team
editing apply natively. Preserve Account's six tasks, one scroll root, private
settings, separate transport/support, preview/publication and saved API/version
contracts. Each task has a bounded route/view, prefilled relevant fields and
Save/Cancel/Back to its originating section. No accordion/omnibus editor substitutes
for task navigation. All social contacts survive unrelated saves; phone/desktop
preview and natural five-language labels remain distinct from Android device proof.

Mapped local evidence: `scripts/test-owner-focused-tasks.ts`,
`test-mobile-account-hub.ts`, `test-owner-editor-failures.ts` and
`test-mobile-api.ts`, with actual Expo read/Edit/Cancel/Keep/Discard navigation
and five-language screenshots indexed in S115 TRACEABILITY. Optional native
Field label visibility and action label wrapping preserve accessible names;
supported pointer-events styling leaves preview overlays non-interactive without
the React Native Web deprecation warning. Full gates/device/rollout remain pending.

## S111 — native transport reachability and inactivity (ready)

FE-036 S111 defines one public transport launcher across native visitor routes
with account/owner/chat exclusions. Preserve the Market's already verified
handle/zoom-safe placement; other public routes use the shared native root overlay
above the bottom navigation/safe area. Do not duplicate the Market launcher.
FE-019/BE-018 govern server deadlines, warning/reason/explicit resume, retained
drafts and slower closed polling. Keep AppState, focus, request deadline and
stale-case protections. Account → Support remains its own private destination.
Actual Expo layout/HTTP checks supplement component regressions; physical
Android/MapLibre/OS notification verification remains separately outstanding.


Mapped focused regressions: `scripts/test-public-transport-launcher.ts`, `scripts/test-chat-inactivity-ui.ts` and `scripts/test-mobile-market-layout.ts`. Actual Expo public placement and paired chat receipts are `.local/workflow-audit-s111/native-agent/final-evidence.json` and `.local/workflow-audit-s111/paired/verified.json`. Installed Android/MapLibre/OS behavior is a separate outstanding gate.

## S109 — spacious native Market (ready)

FE-065 S109 governs compact native exploration: active search/filter controls,
48px switch/toggle targets, a restrained alternate-pane edge, finger-following
handle-only gestures, reduced motion and preserved map/list state. The accepted
marketing narrative stays available in an intentional About/intro disclosure.
Use React Native layout/PanResponder/Animated and existing sheets; do not embed
web dashboard UI or add a gesture provider merely to restyle this page. Staff and
admin still cannot log into native. Local browser evidence and actual Android
verification remain distinct. No auth/API/database behavior changes.

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

FE-052 demo notice: a marked demo's showroom hides the business-example banner
when its visible handle contains `demo` (case-insensitive), otherwise retains it.
Unmarked businesses show no banner regardless of handle. Apply the same rule as
web without changing authoritative demo flags or inquiry/publication contracts.
Focused evidence maps to `scripts/capture-demo-notice.mjs`.

FE-019 S84: the transport launcher and intake use shared customer-facing copy for
arranging transport for a purchase from a Suqpage business. Keep the Live Chat mode
visible/accessible and the same native transport form/session/queue contracts.
Five authored locales and compact-map/phone/short-height checks precede release.

FE-019 S90 supersedes only the launcher wording with Need help with transport?
and smaller Let us handle it. Chat with our transport agents live text. Use the shared copy
and local catalogs in that order; compact mode retains the complete copy in its accessible
name. Align the intake introduction with the live transport-team invitation;
preserve its fields, native routing and existing chat/session contracts. Verify
read-only Expo phone/local-language captures and mobile typecheck; installed
Android verification remains a separate build/device gate.

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
numbered groups and current public identity. Featured/live badges use only
server-projected public state. FE-021 S127 supersedes the original thresholds:
at maximum18 counted final groups open every admitted card without paging;
below maximum their click zooms instead. their cards use
current eligible businesses. Member selection opens the existing preview while
preserving the map. Filtering removes stale selections; full-page navigation
releases Market modals and valid return restores the selected group/card.
Render visible markers from the shared fixed screen-capacity index. Bounds and
normalized zoom drive normal outer aggregation; terminal members never subdivide.
Preserve public offsets once and keep true centroid anchors for displaced badges.
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

S66 domain rollout verified: deploy 6ac576417f18a89035f75274, isolated web source
70fb961d9f11dba9465b5f6bacfe6c57b8bf7735 (current live source plus association metadata).
The exact JSON is served at https://suqpage.com/.well-known/assetlinks.json with
HTTP 200 with application/json and no redirect. Seven live association, site, health and
mobile-API checks pass. Linux handler/image and packaged production health/login
checks pass; full selected web release has zero audit findings. Code rollback is
6ac52555a812ad5c89621401; schema/Auth unchanged. Mobile source 87fa05e and its
clean 1,493-file archive are ready; the original one-artifact exception expired
with finished build 2018cc70. Owner renewal for the next exact source is pending
in .local/app-links/android-rebuild-review.md. No new APK, Android OS-link/device
verification or iOS association is claimed. Private receipts: .local/app-links/.

## S67 — latest internal rebuild and starter preview

Owner approves the renewed one-APK exception and latest changes, including a
contextual five-language copy pass and native first-setup private-preview parity
under FE-049/FE-051. Rebind approval to the final reviewed source after these edits.
No dependencies/advisories may expand the two reviewed tooling roots. Build,
archive, signing, live API and native device gates remain required. No Play/iOS
submission or invitation sending. Coverage is engineering evidence, not independent
native-speaker signoff. Keep store/offer content verbatim in every locale.

S67 focus regression: GIVEN a language sheet is closed after switching languages
WHEN an owner focuses and edits a field THEN hidden dialog content cannot capture
focus or discard edits. Hidden native/browser sheets must unmount their focus
boundary; retain open-sheet semantics. Verify actual deletion, saved empty contacts,
editor re-entry and first publication after switching all five languages.

S67 verified local gates: focused five-language setup/preview and persisted
editing/publication regression passes; full check, production build/trace, provider
smoke and 11 acceptance workflows pass. Release audit remains failed solely on
the approved two-root internal-APK exception; final native artifact checks pending.
See S67 in TRACEABILITY for evidence boundaries and protected capture paths.


## S69 — trusted static SVG media defect

GIVEN an existing owned /uploads/seed/...svg illustration or logo WHEN native
Photo renders it THEN the installed SVG renderer displays the actual approved
asset within the same slot. Only the strict owned seed path gets this branch;
remote/encoded/traversal/private SVG inputs never enter it and no Auth header is
sent to it. Web, raster and authenticated private-image paths keep their existing
adapter. GIVEN a missing/unreadable seed SVG THEN a shop-icon fallback occupies
the slot, never a blank failed image or an unbounded retry.

Reuse installed react-native-svg; no new dependency/schema/media change. Focused
path-safety and actual component-branch regressions plus installed native
store/Featured captures are required. The first S67 finished APK exposed this
issue; a second managed artifact requires renewed bounded tooling admission.

S69 focused evidence: test-mobile-static-svg.ts bundles the actual Photo component
with controlled React/native ports and verifies Android/iOS owned-SVG rendering,
contained size, stable error callback/fallback, no Auth on the public SVG request,
web/raster behavior and authenticated private-image paths. Strict path tests deny
The private-image renderer test exercises the current-session authenticated fetch,
then verifies a local file/blob URI with no bearer headers on the Image component
and resource cleanup. SDK/loading ports are controlled in this renderer test;
the actual bundle and device checks remain separate gates.
remote, private, query, fragment, encoded and literal traversal inputs. Both
focused tests, native typecheck and existing build/dependency/link/video checks
pass. Installed development-client honey logo and Featured imagery display in
the unchanged slots; screenshots .local/rebuild-s67/native-corrected-*.png.
Owner explicitly approves this rendering and one replacement free internal APK.
No new library, API, schema, media, credential or hosted configuration change.
Full behavioral/security gates and final artifact evidence pass as recorded in
docs/SUQPAGE-S69-S70-RELEASE-2026-10-06.md. DEP-042's renewed exception is consumed
by finished replacement build 9bcabbdb, not available for a future artifact.


S70 native setup/owner flow follows FE-051: Page handle selected with essential
identity fields, debounced available/taken/invalid/failure feedback, atomic signup,
and rich private preview before Edit. Reuse existing handles/signup/owner-handle
ports. Move address editing into Page, preserving monthly/version/alias authority.
Account security retains phone/session/delete controls; no staff screens added.

S69/S70 rollout: source 6c27025 is live as Netlify deploy 6ac5c9940ee5deb5294319ef
and finished internal APK 9bcabbdb-14eb-420d-a2cf-8d84e0ec8c75. The signed APK
installs, renders the corrected owned SVG logo, verifies Android OS App Links,
and passes five native locale switches, public Market/About/email-entry and
gallery navigation. Real local signup/owner flows and API isolation have separate
passing evidence. Full native audit remains failed under the explicitly consumed
two-advisory artifact exception. Physical-phone/email/social-app, independent
native-speaker and iOS/store verification remain open; this broad spec stays
in_progress. Earlier pending-stage notes are historical to the named stages.


S71 follows FE-019's clarified purchased-goods transport launcher/intake copy in
the native app and browser preview. Share the same contextual locale catalog;
keep literal Live Chat next to non-English native wording. Bound the expanded
launcher to the phone width and preserve compact accessible label, paired intake
and existing conversation authority. No native dependency or API change. This
revision requires local visual approval and remains absent from the current
finished APK until a separately admitted rebuild.

S72 follows FE-030's View products/Hide products label on the existing results
panel toggle; shared contextual labels, compact layout and current map/search/
filters remain. Browser/phone captures precede owner approval; no backend change.

FE-021 S85 applies the warm orange shop with a thin white outline and cream/orange nameplate
refinement to the shared native/Expo MapMarker renderer as well as desktop/phone
web. Keep exact geometry/coordinates/counts, accessible names, selection, bounded
labels and existing camera/group/preview callbacks. Cluster, nearby and badge
styles are restored to their prior appearance. Focused browser/native-map
checks and physical-device/release evidence remain separate.

S85 local shared-renderer evidence: white shop/roof rims, orange-fill and normal/
selected label contrast pass at 1440/390/320 in Expo browser, with real public shop selection/preview;
fixture two-shop original grouped/badge styles, nearby preview and remount pass. Both
types and native map behavior pass; actual OSM phone/desktop views were reviewed.
Physical native/new APK, visual approval/full gates/commit/rollout remain pending.

The owner rejects the earlier charcoal plates/dark outlines and unrequested
cluster changes. Current thin-white-edge evidence is in
.local/map-marker-white-edge-review/. Group/nearby/badge styling remains original;
visual approval, physical native/full gates/commit/rollout remain pending.

S86 applies FE-021's isolated-shop hitbox correction: transparent parts of the
96px label layout frame cannot intercept other shop glyphs. Keep a real 44px
glyph touch frame, visible-name interaction and unchanged glyph/name/anchor
positions. Counted markers are untouched. Capture actual local city icon taps,
normal/selected states and browser pointer errors; native-device evidence separate.


## S104 navigation and standard owner dashboard — in progress

FE-036/FE-056 apply to native presentation: About is a main destination, account
entry is Login while signed out and Dashboard after owner sign-in. Inquiries
remain authenticated-only. One bottom navigation persists around owner workflows;
Dashboard exposes real overview metrics and grouped business/page/product/support/
account actions. Existing focused editors, save/return, private initial preview,
transport chat, embedded media and web-only staff management remain unchanged.
Focused Expo-browser/type checks do not claim physical-device evidence.


## S105 social-contact revision

FE-066 / BE-055 supersede new customer messages to business inboxes. Only
configured social accounts receive visitor handoffs; chosen products and the
simple message follow the active UI language. Retained private history stays
scoped. Public transport chat and authenticated owner support remain unchanged.
Local implementation and review evidence are tracked in checklist S105.

## S107 transport recovery-storage failure

GIVEN the transport screen cannot read its device recovery storage WHEN that
read fails THEN stop the loading indicator and show the localized connection
error with an explicit Try again action. Keep the intake and new-chat action
hidden until a successful read establishes whether a saved conversation exists.
Never delete unknown recovery data or silently start a replacement conversation.
WHEN Retry succeeds THEN restore the saved token and existing conversation, or
show the intake if storage confirms no saved token. A result arriving after the
screen unmounts or an obsolete attempt must not change the current screen.

Reuse existing connection-error and retry translations; transport API, token
scope, expiry and idempotency remain unchanged. Focused actual-component tests in
`scripts/test-transport-storage-ui.ts` cover failure, pending retry, empty/saved
recovery, no unexpected mutation and stale completion. Actual Expo-browser error
and recovery captures are separate from the native emulator limit; full gates
and visual approval remain pending under the S107 checklist.

S107 Auth loading correction: the existing provider's client HTTP requests have
a 20-second deadline covering response-body decoding, as defined in BE-044.
A stalled Auth connection must reach the existing localized error and release
the pending action without losing the entered email/code. Preserve normal SDK
session/refresh semantics; no implicit OTP resend or permission change is added.
Focused installed-SDK port tests are `scripts/test-mobile-auth-fetch.ts`; actual
browser/native workflow evidence is reported separately.

S107 logout recovery: while local sign-out is pending or failed, Account shows
its sign-out state and a localized Retry after failure, with no new email/code
form. Private UI clears immediately; a Settings sign-out returns to Account so
the provider-scoped failure remains visible. An SDK error result and failed
device deletion both reach this state rather than an unhandled rejection or
silent success. Retry confirms cleanup before restoring normal login. Reuse
existing Sign out/Retry/connection-error language; see BE-044 and
`scripts/test-mobile-logout-ui.ts` for the negative-path acceptance tests.


## S112 focused native map lifecycle correction

GIVEN the Expo browser map has a delayed resize/move callback WHEN navigation
unmounts that map THEN the callback cannot read/render its destroyed instance.
Detach listeners before teardown and reject stale instance work; do not suppress
exceptions globally. Mounted resize/pan/current-marker behavior remains usable.
The actual installed Leaflet resize→unmount stack reproduced during S112 product
review; the narrow lifecycle correction remains in this authorized local audit.
Focused actual-React/installed-Leaflet regression and browser navigation captures
are required; this does not claim installed Android MapLibre verification.

S112 mapped regression: `scripts/test-mobile-map-lifecycle.ts`.


## S113 native floating public actions — local candidate

S118 supersedes the global saved-basket launcher and one-business/session-only
lifetime below. Only the matching showroom/product displays its independent
persisted list; other public/private screens do not. Direct-product and transport
isolation, labels/targets and canonical rehydration requirements remain.

FE-041's saved inquiry action and count share a compact stack with a visibly labeled
Transport chat action on public native routes. Reuse the root public placement and
Market's handle-safe placement rather than duplicate launchers. One transport tap
opens /buying intake or the saved conversation. List access opens /inquiry for the
saved basket's shop; direct-product inquiry does not alter that basket. Hide the
list action on the saved-group composer, keep it distinct on direct-item screens.
Reserve measured stack height and safe-area/navigation clearance; short Market
stages center a single bounded row with list icon/count and labeled transport to
clear side handles and preserve map space. The list retains its full accessible
name; other screens keep both visible labels. No native restart-storage
claim, account/private action, new API or OS notification behavior is introduced.
Verify actual component/Expo-browser behavior; installed Android remains separate.

S113 focused evidence: `scripts/test-mobile-public-action-dock.ts`,
`test-mobile-market-layout.ts` and `test-public-transport-launcher.ts`; final native
row/type receipt `.local/public-actions-s113/native-agent/short-market-refinement.json`.
Actual five-language Expo-browser states are indexed separately by
`.local/floating-actions-s113/combined-verified.json`; no installed-device claim.


## S114 private owner transport — locally verified, visual/full gates pending

Account adds Transport chat beside technical Support. The guarded owner transport
screen reuses the visitor transport presentation/controller with a separate
authenticated owner adapter, private contact defaults, account history and Back to
account. It never reads/writes the guest suqpage-transport secure-storage key or
uses a guest token, including after logout/account change. Unauthorized/no-business
accounts use existing Account/setup flow. Owner account identity fences pending
requests so a previous user's completions cannot populate the next account.

Keep one Screen/scroll root and the existing paired route/contact layout; no global
public floating dock appears inside owner screens. Native owner attention opens
the canonical owner transport view; old generic owner-chat destinations classify
the authorized conversation before routing. BE-018/FE-019 S114 governs lifecycle
and private-note filtering. Five-language actual Expo captures remain separate
from installed Android evidence; no new binary or provider change is implied.

## S146 empty public product gallery — local UI correction

GIVEN a published product with no photos or videos WHEN a visitor opens its
native product details THEN the media area shows a bounded, themed “No photo
yet” state with a recognizable product icon, rather than an empty horizontal
gallery. It does not offer gallery arrows or thumbnails. Product name,
description, availability, contact and inquiry actions remain reachable.

GIVEN one or more valid photos or videos WHEN the same details screen opens
THEN the existing horizontal gallery and its playback/navigation behavior are
unchanged. This is presentation only: no upload, storage, authorization,
catalog, publication, or media-retention behavior changes. Reuse the existing
localized “No photo yet” message in active languages. Verify the actual
`Gallery.tsx` component in `scripts/test-mobile-video.ts`, then inspect the
Expo localhost:8082 phone preview with an explicitly labelled response-only
zero-media fixture; actual Android device behavior is a separate release check.

## S151 B07 scoped native loading — local implementation under FE-074

GIVEN a resolved native resource WHEN the same dependency/API/actor scope
refreshes on focus or retry THEN keep its current content and local input state
mounted and expose one compact loading status. Initial Featured, showroom,
product, Account and focused owner resources use static, decorative skeletons
matching their actual media, rows and responsive column geometry. Action loading
remains local to the action; it does not replace the resource.

GIVEN dependency, API, actor or sign-out scope changes WHEN rendering before
effects finish THEN the old data and errors are unavailable immediately. Admit
only the latest live request, ignore superseded/unmounted responses and clear
retained resources on authorization/permission/not-found failures. A same-scope
network failure may retain readable data with inline retry. Inquiry content may
remain visible while refreshing, but external handoff and canonical product
selection actions wait for current catalog authority. Navigation to a canonical
product or inquiry page still requalifies that page's own resource.

The local implementation scopes the shared loader by API, validated actor,
logout state and caller dependencies. A different incoming Auth actor clears
the validated session while it is checked; same-user token validation keeps
the Account workspace mounted. An acknowledged manual `setData` result also
invalidates earlier read generations. Product choices/notices are scoped to
handle plus product ID, and current option membership gates inquiry actions;
an old route callback cannot act on the newly selected product.

Focused evidence: `scripts/test-native-resource-loading.ts` exercises actual
React, the resource hook, RuntimeProvider and Account with controlled Auth/read
and owner-presentation ports; it proves first-render identity clearing, same-user
field continuity, stale/unmounted responses, terminal authorization clearing and
Save-versus-read ordering. `test-native-loading-skeletons.ts` covers static,
decorative destination shapes and shared responsive card sizing. Existing
showroom, product, contact, Account and Market component tests cover retained
content, canonical-action guards, navigation and committed-snapshot scroll.

Actual installed Chrome evidence is source-bound in
`.local/contextual-loading-s151/native-result.json` and `native-review.html`.
Featured retains six cards during focus refresh; Market retains nine mounted
product rows during query loading and four during a custom-order filter update.
The corrected outer search minimum preserves 48-unit children without a 2px
layout jump. First failures and their classifications are retained. Public
Featured/showroom/product initial silhouettes are captured separately from
authenticated flows; ordinary local owner Auth and installed Android remain
unverified here. FE-074 owns combined visual approval, full gates and rollout.
No full-suite pass, new APK, hosted operation or release is implied.

### S151 B03 owner icon registry

The native Support and preview commands now resolve `headphones` and `eye` to
their own 24-unit outline icons, preserving the current color, stroke and target
sizes. `scripts/test-native-owner-icons.ts` compiles the actual Icon component
and proves both paths differ from its unknown-name arrow fallback. This is
component evidence, not an authenticated owner-workflow claim.
