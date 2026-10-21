---
id: FE-036
title: Routed public marketplace application
status: in_progress
related: [FE-074, FE-041, FE-019, FE-021, FE-024, FE-025, FE-027, FE-030, FE-034, FE-035, FE-037, FE-038, FE-039, BE-023, DEP-025, FE-033, FE-052, FE-053, FE-056, DEP-043, BE-018]
owners: [product, frontend, design]
last_updated: 2026-10-20
change_level: L2
---

# FE-036 - Routed public marketplace application

## S151 B07 — matched initial public workspaces (implemented locally)

FE-074 separates first-load skeletons from same-workspace updates. Existing local
Chrome RSC navigation retains four loaded cards and the surrounding shell while
the destination resolves; preserve that behavior and `NavigationPendingMain`.
FE-065 owns the reproduced product-query clearing defect and snapshot boundaries.

GIVEN an initial Market, Featured or showroom page has no admitted content WHEN
its existing route/data fallback is shown THEN render decorative placeholders
matching that workspace's mode/search/filter row, map canvas, responsive image
cards or showroom header/catalog geometry. Retain known shell and headings;
placeholders have no fake data, actionable controls or extra main landmark.
GIVEN usable content is already mounted WHEN its data refreshes THEN keep it and
show one scoped updating indicator rather than substituting the initial skeleton.

Use current layout/CSS breakpoints, accessible busy/status semantics and a static
reduced-motion treatment. Existing action progress bars remain appropriate to
their operations. This first web scope changes `PublicWorkspaceLoading` at its
existing public boundaries; unreviewed private task layouts do not receive a
generic invented skeleton. Focused geometry/accessibility and actual Chrome
1440/390px delayed local reads precede the combined visual review and full gates.
No shared-shell rewrite, artificial minimum delay, provider, cache or schema
change is required. Master §§10/19 must distinguish verified local source from
subsequent deployment.

`scripts/test-public-workspace-loading.ts` exercises the actual fallback
components/CSS with controlled translation only. It checks one busy/status region,
hidden decorative blocks with positive geometry, no fake actions/main landmark,
reduced motion and containment at 1440/1100/1024/768/390/320px, reserving the actual
desktop sidebar space. Featured follows its available gallery content width:
one/two/three columns at 372/564px, with the current sponsor slots and two-column
phone exception; it does not assume viewport width equals gallery width.
Actual compiled-component captures are supplemental initial-layout evidence,
not proof that the server Suspense fallback was observable on a fast local read.
Actual local Chrome discovery GET/filter/navigation evidence belongs to FE-065;
the working shell/navigation-pending implementation is unchanged. Combined
visual/full/release checks and deployment remain pending under FE-074.

## S111 — public transport help reachability (ready)

Show the existing transport live-chat launcher on public Market, Featured, About,
showrooms/product views, legal/information and supported public recovery screens.
Exclude Login, signup/account setup, account deletion/private account and all
owner/staff/admin management screens; those are account workflows. Never overlay
a second launcher on the transport conversation itself. Owner Account → Support
remains a prominent private task with current alerts and real conversation APIs.
One launcher per public surface, consistent Suqpage theme/copy and48px minimum
target; compact presentation on constrained screens must not cover navigation,
map/product handles or primary actions. Web shell and native route adapter
implement platform placement independently; route tests and phone captures
cover guest/authenticated public use and exclusions. General guest support and
direct business-inquiry inbox stay closed/retired respectively.


Mapped focused regression: `scripts/test-public-transport-launcher.ts` tests route exclusions and actual web/native shell components. Actual local layout/modal/action evidence is `.local/workflow-audit-s111/native-agent/final-evidence.json`, with preserved classified failed attempts and separate completed segments. Full visual/release gates remain pending.

## Problem and outcome

The public homepage currently mounts several marketplace experiences in one
long document. The geographic Market is the product's primary public job and
must open immediately, while Daily Featured needs its own viewport, URL,
navigation state, and performance boundary with Sponsors visibly attached to
that program. Suqpage should feel
like a public marketplace application before sign-in while retaining the
existing role-specific workspace after sign-in.

The outcome is an adaptive public application shell that opens directly to the
Market at `/`, with a separate Daily featured destination and its paid sponsor
companion. Desktop
uses a stable top identity bar and leading navigation rail. Phones use a fixed
bottom navigation bar and a bounded More sheet. Route transitions remain
client-side and preserve URL-backed market state.

## Scope

- `/` as the complete geographic map marketplace and primary public entry.
- A query-preserving `/discover` compatibility redirect to `/` for existing
  links, history entries, and service-worker navigation.
- `/featured` as the complete Daily Featured schedule and image-led gallery.
- `/@handle` as a tenant-owned Suqpage page rendered inside the same public
  application shell, replacing the selected primary workspace without retaining
  a hidden map or opening a separate browser context.
- `featuredDay` as the only current selected-day query key and
  `ref=featured` as the only current Daily Featured referral value.
- The complete disclosed five-business paid-placement pool beside the Daily
  Featured gallery on desktop and as a compact two-card rotating strip on phones.
- One desktop application shell shared by Market, Daily Featured, About, and
  published pages, plus one phone application navigation for platform
  experiences. Navigation is grouped into Explore, Account, and
  Information. The Account group exposes Sign in only to anonymous visitors
  and Dashboard only to authenticated users; account creation remains available
  from the sign-in route. Contact, privacy, and terms remain in bounded
  supporting navigation.
- Route-local loading feedback and focused desktop, 390px, and 320px evidence.
- A lazy public support launcher shared by Market, Daily Featured, and About;
  FE-019 owns its drawer and conversation behavior.

## Non-goals

- Buyer accounts, saved pages, buyer-to-business messaging, notifications, fake event
  counts, checkout, ratings, verification, or any destination not already
  implemented.
- Changing discovery eligibility, sponsorship authority, featured scheduling,
  tenant-owned composition/content authority, authentication, or the signed-in dashboard shell.
- Copying the supplied mockup's branding, beige palette, people, unsupported
  statistics, or exhibition terminology.
- Destructively rewriting historical database or immutable media identifiers;
  FE-037 governs the compatibility boundary.

## Contracts

- The public shell uses Suqpage's orange, charcoal, white, and cool-neutral
  roles. It remains visibly Suqpage and does not replace or recolor the tenant
  showroom rendered inside its workspace.
- Desktop exposes one top identity bar and one leading experience rail.
  Experience destinations do not repeat in both surfaces. Short labeled groups
  distinguish Explore, Account, and Information without placing More alone at
  the bottom of the rail. Anonymous visitors see Sign in but not Dashboard;
  authenticated visitors see Dashboard but not Sign in or signup. More sits
  with the Information group and contains contact and legal destinations. The
  scheduled program is the concise **Featured** destination in desktop and phone
  navigation, represented by a familiar featured-star icon rather than a
  calendar; its page heading may retain **Daily Featured**.
- Phones expose four primary touch targets: Market, Featured, About, and More.
  More opens an accessible bottom sheet with Account and Information sections,
  the same session-aware Sign in or Dashboard choice, and a reachable close
  path. The current route is identified without color alone.
- Market is the public root experience. One concise heading and the complete
  workbench sit on a shared architectural canvas; there is no intermediate Home
  lobby or duplicate search surface. Long mission copy remains on `/about`.
- Market uses the remaining public application viewport rather than a fixed
  map height followed by empty document space. Its route heading contracts on
  phones, and both the Ethiopia map and an opened nearby-page viewer expand to the
  measured workspace while retaining the fixed app navigation.
- Market retains search, industry, place, geolocation, cluster, nearby-area
  nearby-group viewer, preview, URL-state, and return-history
  behavior. It does not render Sponsors or Daily Featured below the map.
- Daily featured retains the fixed weekday selector, authoritative schedule,
  broadcast state, future-day redaction, responsive image-led cards, and
  page inspector. Its disclosed sponsor panel sits beside the gallery on
  desktop; all screen sizes show one sponsor at a time with equal six-second
  automatic turns, Previous/Next and Pause/Resume controls. Sponsorship does not imply
  verification or editorial endorsement.
- Daily featured is a bounded application workspace, not a document assembled
  from stacked promotional sections. One compact program header owns the H1,
  current broadcast state, and collapsed schedule summary; it does not repeat a
  second route-level introduction above the gallery. The weekday ribbon remains
  visible and the cards use ordinary vertical page scrolling.
- Expanding today’s schedule uses a bounded disclosure. On phones, the compact
  single-sponsor strip, weekday ribbon, and first image-led cards remain reachable
  without a long promotional introduction.
- The weekday selector is a compact segmented ribbon with icon, weekday, and
  date only; its accessible name retains the complete industry and today state.
  Geographic Map retains zoom and pan. Daily Featured uses fixed-readable
  responsive columns and ordinary vertical scrolling. The nearby viewer uses at
  most six fixed-readable cards over the map with no internal scroll, venue
  zoom, pagination, or sideways panning.
- Route navigation uses Next.js links and shareable URLs. Browser back/forward
  restores route and URL-backed market state. No section anchor is the primary
  navigation authority.
- Public route transitions retain the shared Suqpage header, desktop rail,
  phone navigation, and support launcher. Loading feedback replaces only the
  selected workspace inside the main content region; it never blanks the full
  application shell.
- Query-driven Market updates keep the current map and controls mounted while a
  compact status marks the Market workspace busy. Fast prefetched transitions
  may complete without showing a delayed indicator, while slower transitions
  expose readable status without shifting the workspace geometry.
- Authenticated workspace navigation retains the current authorized shell and
  identifies the selected pending destination inline. Mutation buttons retain
  their existing local disabled and progress labels; no global loading screen
  replaces unrelated navigation or context.
- Opening an Suqpage page from Market or Daily Featured navigates client-side to its
  canonical `/@handle` route inside the retained Suqpage shell. The map or
  Featured workspace is unmounted rather than visually hidden. Browser Back
  restores the exact prior route and URL-backed state; a direct page link
  renders the same shell without requiring a prior Market visit.
- A page opened from Market exposes a persistent, explicit **Back to Market**
  action. It restores the recorded Market URL plus the same-tab map transform,
  nearby-result group, and selected business preview when that state remains
  valid. Without valid history it returns safely to the Market root.
- An Suqpage page route has one main landmark owned by the Suqpage shell. The
  tenant renderer uses a nested neutral container, retains its own approved
  header, section navigation, palette, content, product details, and inquiry
  workflow, and does not render duplicate Suqpage application menus. Desktop
  and tablet retain the Suqpage rail plus one compact sticky Back to Market
  strip above the tenant workspace. On phones, the page becomes an immersive
  full-width surface: Suqpage's fixed bottom navigation is absent, the same
  compact platform-owned Back to Market bar remains above the tenant surface,
  and the tenant may retain its single fixed section/inquiry
  navigation. Two fixed bottom navigations never render together.
- Private revision/editor previews remain inside their authorized workspace
  context and do not become public routes or inherit public discovery controls.
- Route separation must prevent Featured and Sponsors client work and data
  projections from loading on the Market route. Featured receives only its
  schedule/gallery projection and bounded paid pool. The split must not merely
  hide combined content with CSS.
- Route separation also applies to client code: Daily Featured must not download
  or evaluate D3, Supercluster, geographic assets, or map interaction code. Map
  and Featured may share small presentation helpers, but each owns a distinct
  client entry module and route chunk.
- The installed public application treats `/featured` as a current bounded
  public navigation destination. A successful response may be used as the
  route's network-first offline fallback, while API and authenticated routes
  remain network-authoritative.
- Every route has one main landmark and clear H1, no horizontal overflow, 44px
  phone targets, visible focus, reduced-motion compliance, and no content hidden
  behind fixed navigation.

## Scenarios

```gherkin
Scenario: Visitor enters the public application
  GIVEN the visitor opens Suqpage without authentication
  WHEN the root route renders
  THEN the geographic Market is immediately usable
  AND Daily featured remains a distinct route action with disclosed Sponsors
  AND neither of those secondary experiences is mounted below the Market

Scenario: Visitor changes public experiences
  GIVEN the public application shell is visible
  WHEN the visitor chooses Market, Featured, or About
  THEN the URL changes through client-side navigation
  AND the shared shell remains stable
  AND only the selected primary experience renders

Scenario: Public data takes time to load
  GIVEN the Suqpage public application shell is visible
  WHEN a Market or Daily Featured workspace is still resolving
  THEN the platform header and navigation remain available
  AND loading feedback appears only inside the selected workspace
  AND the fallback reserves the final workspace geometry without a blank page

Scenario: A workspace destination is resolving
  GIVEN an authenticated actor is inside an authorized workspace
  WHEN the actor follows a workspace navigation link
  THEN the existing workspace shell remains visible
  AND the selected link communicates its pending state
  AND unrelated navigation and account context do not disappear

Scenario: Visitor opens a tenant page without leaving Suqpage
  GIVEN a page preview is open from Market or Daily Featured
  WHEN the visitor chooses Open page
  THEN the canonical page route replaces the selected public workspace
  AND the Suqpage desktop rail remains available on wider screens
  AND a phone renders one Suqpage Back to Market bar and one tenant bottom navigation
  AND no hidden map or Featured client runtime remains mounted
  AND browser Back restores the prior public route and URL state

Scenario: Visitor follows a direct Suqpage page link
  GIVEN the visitor has no prior Suqpage navigation history
  WHEN the visitor opens a published /@handle URL
  THEN the page renders inside the Suqpage public shell
  AND the tenant's approved identity and section navigation remain distinct
  AND phone presentation does not render two fixed navigation bars
  AND Market remains one reachable application action

Scenario: Phone visitor opens supporting navigation
  GIVEN the viewport is 320 or 390 CSS pixels
  WHEN the visitor activates More
  THEN an accessible bottom sheet exposes grouped Account and Information destinations
  AND it shows Sign in for an anonymous visitor or Dashboard for an authenticated visitor, never both
  AND closing it restores a reachable navigation target

Scenario: Account owner signs in
  GIVEN the public application shell is visible
  WHEN the owner signs in successfully
  THEN the existing role-authorized workspace shell opens
  AND public navigation does not replace or duplicate workspace navigation
  AND returning to a public route exposes Dashboard instead of sign-in or signup actions

Scenario: Visitor explores Daily Featured in one workspace
  GIVEN Daily Featured is open on desktop or phone
  WHEN the route finishes rendering
  THEN one compact program heading and the weekday ribbon are visible
  AND Sponsors remain attached to the featured gallery
  AND image-led page cards remain readable without venue zoom

Scenario: Visitor expands today's schedule
  GIVEN today's Daily Featured program is selected
  WHEN the visitor expands the schedule summary
  THEN the agenda becomes scrollable within the Daily Featured workspace
  AND the featured gallery remains visible and interactive below it
  AND the public application navigation remains reachable

Scenario: Visitor opens a responsive marketplace experience
  GIVEN Market, a nearby-page viewer, or Daily Featured is open
  WHEN the available viewport changes between portrait, balanced, and wide
  THEN the interactive canvas consumes the remaining workspace
  AND nearby or Featured card geometry reflows for the measured aspect
  AND Featured uses ordinary vertical scrolling when its complete program exceeds the viewport
  AND phone Featured galleries keep readable cards without horizontal overflow
```

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Route ownership and absence of hidden secondary UI on Market | contract/browser | `scripts/test-homepage-composition.mjs`, focused Playwright audit |
| Desktop rail and phone Market/Featured/About/More navigation | browser/accessibility | `scripts/capture-pwa-shell.mjs`, `scripts/test-accessibility-audit.mjs` |
| Market, featured, and sponsor behavior plus route-specific projections retained | integration/browser | `scripts/test-discovery.ts`, `tests/acceptance/app.spec.ts` |
| Route-level loading, overflow, and target sizing | browser | focused 1440px, 390px, and 320px captures |
| Daily Featured gallery, compact header, schedule expansion, and adjacent Sponsors | browser | `scripts/capture-public-app-shell.mjs` desktop and phone assertions |
| Lazy public support launcher does not obscure route navigation | browser/accessibility | FE-019 focused desktop and phone assertions |

## Rollout and rollback

This is a route and presentation change with no database migration. Rollback
restores the prior combined homepage and phone navigation. The `/discover`
compatibility redirect, tenant showrooms, authenticated workspaces, and
authoritative data remain intact. DEP-025 continues to govern PWA cache
versioning.

## Evidence

Evidence:

On 2026-08-14, the final desktop, 390px, and 320px routed-application suite,
88-state accessibility audit, 10/10 acceptance workflows, type/build checks,
and complete release passed. All five required remote jobs passed for the final
code release in GitHub Actions run `31750355870`, and the production deployment
`dpl_EPpUwucKvJE18WCckB7RqMq3EFVT` is ready. Production smoke proves Market,
Daily Featured, About, and a representative tenant showroom return 200 while
the retired public routes return 404. The custom-domain DNS blocker remains an
operations item under DEP-023 and does not change routed application behavior
at the production Vercel origin.

## Readiness checklist

- [x] Public and authenticated shell authority is explicit
- [x] Route ownership and data authority are explicit
- [x] Mobile navigation and accessibility behavior are explicit
- [x] Unsupported mockup features are excluded
- [x] Performance outcome and rollback are testable
- [x] Production routes and exact remote release are verified

## S2h public experience revision

FE-041 now governs the shared profile's linked inline product view, simplified
public features/unit presentation, single/group inquiry choice, progressive phone
form and search panel beside the persistent map. It supersedes earlier public
modal, production-fact, persistent empty-cart and map-replacement statements here.
Retained data, canonical server security and legacy recovery contracts remain.
Implementation/evidence tracked in docs/SUQPAGE-TRANSITION-CHECKLIST.md S2h.

## S51 — equal sponsor rotation (ready, L1)

- GIVEN at least two eligible sponsors WHEN Featured is visible and active THEN
  one complete card is shown and advances every six seconds, visits each sponsor
  once per cycle in server order and wraps without weighting a broadcast spotlight.
  The broadcast agenda/status still names the sponsor assigned to that segment.
- WHEN a visitor navigates manually THEN the chosen sponsor gets a fresh interval;
  Pause/Resume and Previous/Next remain labeled, keyboard reachable and touch-sized.
  Hidden cards cannot receive focus. Browser hover/focus pauses updates; reduced
  motion starts paused and removes animation, with explicit resume available.
- WHEN the browser is hidden, native app backgrounds, Featured loses focus or
  the carousel leaves the viewport THEN timers stop. Returning starts a fresh
  interval without skipping unseen sponsors. Changing the sponsor pool resets
  safely; zero/single sponsor shows no useless rotation controls or timer.
- GIVEN any supported locale or 320px screen WHEN rendered THEN sponsor names
  remain verbatim, paid placement is clear and controls cannot cover the card.

Readiness: existing FE-033 schedule and sponsor API authority retained; no BE or
DEP contract changes. FE-053 uses the same timing and behavior in native.
Focused verification: scripts/capture-sponsor-rotation.mjs, mobile/web typechecks,
localization, narrative and homepage tests. Screenshots/visual approval precede
full gates. Rollback is a UI revert with no persisted-data mutation.

S51 local evidence: web/mobile typechecks, narrative/homepage, eight localization
checks (1,228 messages), sponsor rotation browser fixtures and 69 final viewport/
language captures pass. Evidence in specs/TRACEABILITY.md and checklist S51.
Native-device checks, owner visual approval, full release gates, commit and
rollout remain pending. Earlier copy drafts are superseded.


## S104 consistent platform navigation — in progress

The owner requests a cleaner grouped sidebar in Suqpage's own visual identity.
GIVEN Market, Featured, About, Privacy, Terms, account deletion, Login, initial
setup or contact receipt WHEN navigating THEN retain one public app shell, one
brand/language header and one main landmark. Preserve existing URLs and server
auth/setup redirects. No competing page-specific top navigation or duplicate
phone tabs. Client showroom identity/immersive phone behavior remain unchanged.
GIVEN desktop THEN expose Explore (Market/Featured), Account (Login when anonymous,
Dashboard when authenticated, plus authorized inquiries) and Information
(About/Privacy/Terms) in a bordered rounded navigation surface. Current route,
focus/hover/pending feedback and long translated labels remain clear.
GIVEN phone THEN expose Market, Featured, About, authenticated Inquiries and
Login/Dashboard in one adaptive bottom bar. Privacy/Terms/deletion are reachable
from About and their shared shell, never a second navigation model.
Dashboard links resolve the existing role-specific owner/admin/scoped-agent home; labels never grant
authentication or change permissions. No new guest general-support service.
Ready: FE-026/FE-056/FE-053/FE-049/FE-019 and existing auth/runtime ports apply.
Focused routing/auth/landmark/keyboard/overflow tests and all-five-language
1440/390/320 captures precede explicit visual approval and full gates. No migration;
rollback restores previous UI/routes without data writes.

S104 focused local evidence passes in TRACEABILITY: actual role/navigation and
combined support/transport HTTP workflows plus desktop/phone/five-language
captures. Visual approval, full gates, scoped commit and rollout remain pending.


## S113 coordinated public actions — local candidate

S118 FE-041/FE-053 restricts saved-list access in this shared stack to the current
business's showroom/product screens only. Market/Featured/About have transport
without a last-business cart fallback. Independent lists persist per business;
transport's mounted session/intake and all private exclusions remain unchanged.

GIVEN an eligible public route WHEN transport help is visible THEN show a compact
Transport chat label, including on phone/short screens. One activation opens the
existing paired origin/destination intake directly, or the recoverable existing
conversation; no new menu or confirmation precedes it. No request/message is sent
until the visitor explicitly starts/sends. Use one shared floating stack with
FE-041 saved inquiry access above transport. Keep a single mounted web chat
instance so arranging actions does not discard unsent intake drafts. Hide/inert
background actions during modal composition. Existing account/setup/private
exclusions, owner support and server-authoritative recovery remain unchanged.
Focused component and actual browser captures are required; no hosted change.


S113 recovery loading correction: GIVEN the shell already prefetched its guest
session WHEN the visitor opens Transport chat THEN show the themed loading state
while the fresh authoritative session GET is pending, without an error or Retry
claim. Success reveals the paired intake/recovered chat. Only a completed failed
GET shows the connection error and explicit Retry; retry returns to loading and
preserves unsent intake fields. Closing/obsolete responses remain guarded.
Focused actual-component deferred-fetch regression is required.

S113 mapped evidence: `scripts/test-public-transport-launcher.ts`,
`scripts/test-floating-inquiry-web.ts` (including held GET/failure/retry),
`.local/workflow-audit-s113/focused-web-results.json` and actual local captures
indexed by `.local/floating-actions-s113/combined-verified.json`. Owner visual
approval, full gates and rollout remain pending.
