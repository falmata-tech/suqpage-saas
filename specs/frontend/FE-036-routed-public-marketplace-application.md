---
id: FE-036
title: Routed public marketplace application
status: in_progress
related: [FE-019, FE-021, FE-024, FE-025, FE-027, FE-030, FE-034, FE-035, FE-037, BE-023, DEP-025]
owners: [product, frontend, design]
last_updated: 2026-08-15
change_level: L2
---

# FE-036 - Routed public marketplace application

## Problem and outcome

The public homepage currently mounts several marketplace experiences in one
long document. The geographic Market is the product's primary public job and
must open immediately, while Daily Featured needs its own viewport, URL,
navigation state, and performance boundary with Sponsors visibly attached to
that program. MirtPage should feel
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
- `/featured` as the complete Daily Featured Showrooms schedule and image-led gallery.
- `featuredDay` as the only current selected-day query key and
  `ref=featured` as the only current Daily Featured referral value.
- The complete disclosed five-business paid-placement pool beside the Daily
  Featured gallery on desktop and as a compact two-card rotating strip on phones.
- One desktop application shell and one phone application navigation shared by
  those routes and About. Navigation is grouped into Explore, Account, and
  Information. The Account group exposes Sign in only to anonymous visitors
  and Dashboard only to authenticated users; showroom signup remains available
  from the sign-in route. Contact, privacy, and terms remain in bounded
  supporting navigation.
- Route-local loading feedback and focused desktop, 390px, and 320px evidence.
- A lazy public support launcher shared by Market, Daily Featured, and About;
  FE-019 owns its drawer and conversation behavior.

## Non-goals

- Buyer accounts, saved showrooms, buyer-to-business messaging, notifications, fake event
  counts, checkout, ratings, verification, or any destination not already
  implemented.
- Changing discovery eligibility, sponsorship authority, featured scheduling,
  tenant showroom rendering, authentication, or the signed-in dashboard shell.
- Copying the supplied mockup's branding, beige palette, people, unsupported
  statistics, or exhibition terminology.
- Destructively rewriting historical database or immutable media identifiers;
  FE-037 governs the compatibility boundary.

## Contracts

- The public shell uses MirtPage's white, cool-gray, navy, teal, cobalt, and
  restrained berry roles. It may borrow an adaptive app scaffold from the
  reference, but it remains visibly MirtPage and does not imitate a tenant site.
- Desktop exposes one top identity bar and one leading experience rail.
  Experience destinations do not repeat in both surfaces. Short labeled groups
  distinguish Explore, Account, and Information without placing More alone at
  the bottom of the rail. Anonymous visitors see Sign in but not Dashboard;
  authenticated visitors see Dashboard but not Sign in or signup. More sits
  with the Information group and contains contact and legal destinations.
- Phones expose four primary touch targets: Market, Featured, About, and More.
  More opens an accessible bottom sheet with Account and Information sections,
  the same session-aware Sign in or Dashboard choice, and a reachable close
  path. The current route is identified without color alone.
- Market is the public root experience. One concise heading and the complete
  workbench sit on a shared architectural canvas; there is no intermediate Home
  lobby or duplicate search surface. Long mission copy remains on `/about`.
- Market uses the remaining public application viewport rather than a fixed
  map height followed by empty document space. Its route heading contracts on
  phones, and both the Ethiopia map and an opened nearby-showroom viewer expand to the
  measured workspace while retaining the fixed app navigation.
- Market retains search, industry, place, geolocation, cluster, nearby-area
  nearby-group viewer, preview, URL-state, and return-history
  behavior. It does not render Sponsors or Daily Featured below the map.
- Daily featured retains the fixed weekday selector, authoritative schedule,
  broadcast state, future-day redaction, responsive image-led cards, and
  showroom inspector. Its disclosed sponsor panel sits beside the gallery on
  desktop; phones show two cards at a time and rotate through the complete pool
  without scroll, pause, or manual carousel controls. Sponsorship does not imply
  verification or editorial endorsement.
- Daily featured is a bounded application workspace, not a document assembled
  from stacked promotional sections. One compact program header owns the H1,
  current broadcast state, and collapsed schedule summary; it does not repeat a
  second route-level introduction above the gallery. The weekday ribbon remains
  visible and the cards use ordinary vertical page scrolling.
- Expanding today’s schedule uses a bounded disclosure. On phones, the compact
  two-sponsor strip, weekday ribbon, and first image-led cards remain reachable
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
  GIVEN the visitor opens MirtPage without authentication
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
  AND image-led showroom cards remain readable without venue zoom

Scenario: Visitor expands today's schedule
  GIVEN today's Daily Featured program is selected
  WHEN the visitor expands the schedule summary
  THEN the agenda becomes scrollable within the Daily Featured workspace
  AND the featured gallery remains visible and interactive below it
  AND the public application navigation remains reachable

Scenario: Visitor opens a responsive marketplace experience
  GIVEN Market, a nearby-showroom viewer, or Daily Featured is open
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
