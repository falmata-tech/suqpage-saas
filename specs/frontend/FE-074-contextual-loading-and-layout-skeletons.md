---
id: FE-074
title: Contextual loading and layout-matched skeletons
status: in_progress
related: [FE_BASE, FE-021, FE-035, FE-036, FE-041, FE-053, FE-056, FE-065, FE-069]
owners: [frontend, design, accessibility, security]
last_updated: 2026-10-20
change_level: L2
---

# FE-074 — Contextual loading without blanking usable screens

FE-021/FE-053 S151 B10 replaces the tiny Featured weekday choices with readable
category-first tiles. Their initial web/native silhouettes must use the updated
176px tile width, illustration and name-line slots plus secondary schedule line,
with inert horizontal clipping and no document overflow. Preserve the existing
single loading announcement and resource-retention behavior. Focused skeleton
regressions and source-component captures qualify this presentation follow-up;
they do not prove server-streaming or installed Android behavior.

## Problem and scope

S151 B07 records the owner's request for web, phone web and the native app: retain
already loaded content while the affected region updates, and use skeleton
silhouettes closely matching the incoming UI on first load. The current native
`useLoad` clears data on every dependency/focus/retry reload. Broad route fallbacks
and generic loading indicators need an evidence-led audit, not a global visual
replacement. Earlier S76's loading-bar-for-every-operation convention is superseded
by this contract as each affected boundary is qualified. Local implementation is
in progress; complete visual/full/device qualification and deployment are pending.

The initial audit covers discovery map/products, showroom/product, Featured,
Account/focused owner editors, staff workspaces/chat and shipment tracking.
Preserve current public/private boundaries, page identity, locale and navigation.
No backend cache/provider, new dependency, artificial delay or architecture
rewrite is required. Existing repair/email/Play tasks remain open.

## Observable scenarios

1. GIVEN a region has usable data for the current authorized resource WHEN its
   same-resource refresh, retry, focus return or filter update starts THEN keep
   its content and scroll/selection/input state visible. Show a quiet, accessible
   updating indicator beside/above that region. Do not replace the whole screen,
   move its header/navigation, cover unrelated controls, or claim old results
   already match a newly requested filter. Disallow stale actions only where a
   command requires the newly requested data's authority.
2. GIVEN an initial load or genuinely different resource with no safe cached
   content WHEN data is pending THEN show a skeleton within the destination's
   content area. Match real card/image aspect ratios, rows, text lines, major
   spacing and responsive column counts; retain known headings, navigation and
   controls. Product cards, showroom/product detail, tables/lists, chat thread and
   tracking stages need their own geometry rather than one generic page block.
   A dialog's content may load locally; its surrounding shell does not become a
   skeleton. Never show fake data, editable placeholder controls or fake results.
3. GIVEN a local action such as Save, Send, sign-in or media upload WHEN pending
   THEN show feedback on that action or its affected area. Use a progress bar
   only where it communicates an actual operation appropriately; show measured
   progress only when the operation supplies it. Do not fabricate percentages,
   add a minimum loading delay, or run multiple competing global indicators.
4. GIVEN loading completes, fails, is cancelled or superseded WHEN the result is
   handled THEN stop feedback, admit only the newest correct-resource response,
   and expose the real content/error/retry state. Preserve safe same-resource
   content with an inline error where applicable. A public route's 404/disabled
   state must not become an endless skeleton or an empty-success response.
5. GIVEN the account, tenant, permission, resource identity or API environment
   changes WHEN cached/retained content would cross its authority boundary THEN
   clear or requalify that content immediately. Never retain private data across
   sign-out/account switches or attach old business/product actions to a new
   identity. Existing server authorization and canonical-write checks remain
   authoritative; retaining a screen never grants access.
6. GIVEN a screen reader, enlarged text or reduced-motion preference WHEN a
   loading state appears THEN announce one meaningful busy/status message for
   the affected region, hide decorative placeholders from accessibility, preserve
   focus and useful navigation, and use a static or reduced-motion treatment.
   Slow/failed/offline states must provide an honest recovery path. Initial
   Market/showroom announcements reuse the translated `Loading…` message;
   their screen-reader-only labels must not fall back to untranslated English.

## Research and implementation plan

Primary guidance reviewed on 2026-10-20:

- [React Suspense](https://react.dev/reference/react/Suspense#showing-stale-content-while-fresh-content-is-loading)
  describes retaining displayed content during fresh-data updates and choosing
  boundaries according to the desired reveal sequence.
- [Next.js loading](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
  keeps shared layouts interactive while route segments load. The installed
  `node_modules/next/dist/docs/.../loading.md` must control implementation details.
- [IBM Carbon loading pattern](https://www.carbondesignsystem.com/building-blocks/core/patterns/loading)
  separates initial content skeletons, inline operation feedback and progressive
  loading; placeholders should reflect actual container/data structures.

Order: inventory and capture current loading boundaries → define safe resource
keys/retention rules → implement small shared web/native primitives and the
affected screen-specific skeletons → focused race/privacy/error/accessibility
regressions → actual Chrome desktop/phone/Expo slow-response interaction review
and physical-phone evidence → one combined visual approval → full gates and
source-matched release/build review. Keep existing batch repairs qualified
separately; never claim their earlier checks cover this additional behavior.

## Test plan and rollout

Readiness is met for the first batch: native same-resource refresh, public
Featured/showroom/product and Account/owner initial skeletons, shared Market
displayed/requested snapshot separation, and screen-matched web fallbacks. The
actual delayed-read Chrome audit reproduces native six cards → zero → six and
web twelve cards → zero → four, while existing RSC navigation retains its four
cards/shell correctly. Preserve that working shell. Identity/privacy/race
boundaries and phased ownership are explicit; no provider/schema change is
needed. Subsequent additional screens require their own geometry/evidence. Test with bounded delayed/failed application reads,
real local APIs and known role fixtures. Delay controls are labelled, and map
tiles remain local synthetic fixtures. Verify content stays mounted during
same-resource refresh, correct-target skeleton geometry, no stale response or
cross-account/tenant leak, preserved return state, inline validation and reduced
motion. New tests must fail on the old clearing/replacement behavior.

## S151 focused implementation evidence (local; approval pending)

`apps/mobile/src/use-resource-load.ts` scopes retained data by API, actor and
resource, invalidates stale reads after acknowledged local writes, and projects
an empty state immediately across authority changes. The shared public Market
feed separates requested and displayed snapshots, refuses stale paging/actions,
and retains safe content on a failed refresh. Native skeletons match actual
Featured/showroom/product/Account/editor/row layouts; web public fallbacks match
Market, Featured and showroom geometry. Existing working route shells remain.

Mapped focused tests: `scripts/test-native-resource-loading.ts`,
`scripts/test-native-loading-skeletons.ts`, `scripts/test-native-owner-icons.ts`,
`scripts/test-market-feed-retention.ts`, `scripts/test-market-workspace-ui.ts`,
and `scripts/test-public-workspace-loading.ts`, with affected existing native
card/Account/contact/dock regressions. The native combined result records65
distinct cases and passing root/mobile types. Web cases cover latest response,
scope clearing, retained error/retry, Activity return, queued stale map callbacks
and six responsive skeleton widths. Controlled SDK/actor/owner ports remain
component evidence, not ordinary authenticated owner workflows.

Actual Chrome on Expo8082 retains Featured cards during focus refresh and Market
rows during query/filter updates; the qualified control geometry delta is0px.
Actual web en1440/am390/om390 retains12 product cards during search with one
scoped status, unchanged50px search form and0px product/map movement. Visible
product images decode with HTTP200. Earlier real filter/detail/Back journeys
preserve the query and scroll until the matching batch is admitted. Final
source-frozen receipt: `.local/contextual-loading-s151/web-quiet-geometry-receipt.json`;
native result: `.local/contextual-loading-s151/native-result.json`. Automated
maps use synthetic tiles; there are no hosted writes or escaped public tiles.
Initial web skeleton captures use actual compiled components/production CSS
with controlled loading ports and are supplementary geometry evidence.

Retain initial product-scroll and2px native-control defects, corrected fixture
assumptions and cold-preview/hydration interruptions separately. The final quiet
web review passes; it does not retroactively turn earlier mixed receipts into
passes. Physical Android and authenticated local staff/owner coverage remain
limited as recorded in the combined review. Visual approval, full check/release,
source-bound artifacts, deployment, new APK and Play release remain pending.
