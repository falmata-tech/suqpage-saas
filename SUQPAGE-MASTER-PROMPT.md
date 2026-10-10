# Suqpage Project Master Prompt

> **Read this file before changing any Suqpage code, design, data model, copy, integration, or deployment configuration.**
>
> This document is the permanent product and engineering brief for human contributors, AI coding agents, designers, and reviewers. It describes the intended product, the principles behind it, the current MVP boundary, and the rules that must not be broken.

---


Current released product (FE-044–FE-051, BE-037–BE-043, DEP-034–DEP-040;
web/API additions FE-063–FE-064 / BE-051–BE-053, with DEP-044 Play rollout pending):
Suqpage runs at https://suqpage.com on PostgreSQL schema 63. Standard owner pages,
complete private starters, Product/Service posting, owner first Publish and live
Save, immediate public location saves and five-row search results are deployed.
Custom-page request/design/revision features are retired; historical data remains.
The map separates approximate city markers while preserving explicit storefronts.
Email-only sign-in and Suqpage email branding use the canonical domain; the owner's
Gmail sender and credentials are preserved. www redirects to the apex.
Ordered photo/video galleries, automatic populated private signup previews,
monthly handle changes with retained old links, and the stable five-language
wordmark are deployed. Existing merchant content and demo sign-in aliases remain.

Production has 64 existing admitted demo pages and 256 simplified offerings,
including 42 services. Local fixtures have 66 pages/264 offerings; local-only
businesses are not copied to production. Demo contacts use the supplied example
username alhayabrand, fictional phone/email and example.com; delivery is not implied.
Demo sign-in accounts use unique aliases of the owner's approved inbox (DEP-041),
with linked provider identities and a private account directory. Public demo contacts
remain examples; account inbox aliases never become public contacts implicitly.
Existing accounts, inquiries and non-demo records are preserved. New private starter
content is separate from the one-time correction of existing demos. Demos retain
optional-price, scheduled Featured and sponsor examples rather than marking every
business featured or claiming prerecorded video is live.

The preceding release is recorded in
`docs/SUQPAGE-S69-S70-RELEASE-2026-10-06.md`. Current release gates, backup,
artifacts and remaining real-email/hosted-session/OS limits follow below.
The current web/API release uses source ea1b452 and production deploy
6ac98a227b9a61a7dad27116. Protected backup/restore rehearsal, the owner-approved
controlled retry of migration 63, original-record fingerprints and private report
permissions are verified. Reporting/blocking, updated privacy and one server-bound
ordinary demo reviewer are deployed. Live public routes and real reviewer web/native
API sessions pass; no customer chat, email or notification was sent by these checks.
Production notification configuration and the scheduled worker remain verified;
real OS display/read evidence is separate. See docs/GOOGLE-PLAY-RELEASE.md.
The current Android APK remains the S98 a81c93f release: built, signature/config/
privacy inspected and checked on an
isolated emulator; physical-phone alerts and authenticated hosted flows remain
separate under DEP-042/DEP-043. Current evidence is in
`docs/SUQPAGE-S98-RELEASE-2026-10-08.md`.

## 1. Your role

You are working on **Suqpage**, a multi-tenant platform giving African businesses
an accessible digital presence and a direct inquiry channel. People discover
businesses, products, services and custom work through geography, search results
and featured visibility. Growers, makers, traders, retailers, home businesses and
service providers retain their own identity. Suqpage is an online showroom for
makers and manufacturers who have no physical retail store or showroom, an
online extension of existing shops, and a shopfront for people selling from home.
Customers discover offerings and contact the business directly; this promise does
not imply platform checkout or require a public home address. The current catalog
begins in Ethiopia.

Act as a senior product architect, full-stack engineer, security-conscious SaaS developer, UX designer, and quality reviewer. Preserve the product vision while making the application more reliable, usable, secure, and commercially credible.

Do not treat Suqpage as a generic website builder or a conventional ecommerce platform.

The central principle is:

> **Suqpage provides one consistent business profile and discovery experience.
> Each business owns its content, offerings and identity; private staff assistance
> requires revocable consent. Inquiries are not checkout or paid orders.**

When a user gives an explicit instruction that conflicts with an older preference in this file, follow the newest explicit instruction, but preserve security, tenant isolation, and data integrity.

---

## 2. Product identity

### Current experience (FE-040–FE-042, BE-032/BE-033, DEP-030)

One shared business profile uses each business's canonical catalog or current
published owner profile. The shared profile serves product sellers and service providers
with a hero/video poster, one About, linked offerings and a separate contact section.
Public and private account contacts remain separate. The current editor is enabled
by default and supports saved drafts, private image uploads, consented staff help,
owner first Publish, subsequent live Save and retained restore. The interactive preview
cannot send inquiries or persist a visitor cart. New workspaces under
FE-046/BE-039 start with sample text, illustrations, video and public
contacts, a general-area example and product/service offerings.
Owners replace the examples; original account identity and existing pages stay intact.

Category/search results use five-row database pages alongside a persistent map.
Custom request/design/revision features are retired under ADR-0019. Historical
records/assets and compatible catalog readers remain preserved. Historical asset
briefs and visual evidence remain under showroom-projects/WORKFLOW.md; those files
do not enable a custom-request application feature.

Suqpage is deployed at `https://suqpage.com`, with www redirected to the apex.
The generated Netlify origin remains an infrastructure compatibility address.
Released web source `ea1b4526598cff4fb6058265b8e21a68efab1148` and Netlify deployment
`6ac98a227b9a61a7dad27116` use schema 63. Complete check, web release, operations,
eleven local production-mode workflows, packaged Linux handler/image/worker and
artifact privacy gates pass. Live public routes, native catalog, protected-route
denial, www redirect and canonical plus historical Android association bytes are
verified in `docs/GOOGLE-PLAY-RELEASE.md`, with the S98 Android baseline retained
in `docs/SUQPAGE-S98-RELEASE-2026-10-08.md`. Real hosted reviewer web/native API
sessions also pass. Regular hosted email and authenticated physical-phone checks
remain separate from the local workflows and restricted reviewer verification.

The official product name is:

```text
Suqpage
```

Do not write `SuuqPage`, `Showroom Page`, or another variation unless quoting historical material.

Launch origin:

```text
configured HTTPS Netlify origin
```

The owner owns `suqpage.com` and manages DNS at GoDaddy. The approved primary is
`https://suqpage.com`, with `www` redirecting to it. DNS, hosting registration, HTTPS and the www redirect are verified. Hosted Auth
uses the apex and /auth/callback after guarded apply/readback. The
application canonical-origin cutover remains tracked under S18/DEP-026/DEP-029.

Primary support contact:

```text
falmata.dawano@gmail.com
```

Suqpage gives each participating artisan, farm, workshop, or small manufacturer a polished public page at a handle-based route such as:

```text
/@selam-weave
/@afia-botanics
/@addis-metalworks
/@green-terrace-farm
```

The Suqpage page is designed to turn passive browsing into a structured product inquiry. It is not a checkout page.

---

## 3. The problem Suqpage solves

Suqpage helps customers see where the social-media sellers they follow are and
browse their products and services in organized, professional online stores.
Customers can explore nearby businesses or open a store they already follow,
see the offering details without searching through scattered posts, and inquire
directly to discuss an order. No automatic social-account matching or distance
calculation is promised. Owners bring their catalog, photos, videos, story and contacts together,
share their Suqpage link through social channels, and show their shop or area on
the map. Map, category and search retain their existing prominence and behavior.
Physical shops, makers, growers, service businesses and home sellers remain
included; a social account or physical shop is not a prerequisite. The initial
market is Ethiopia, with wider African discovery as a future direction.
S63 applies this clearer positioning to desktop web, mobile web and the mobile
app in all five languages (FE-052/FE-053). Its local viewport checks pass and the
owner approved inclusion in the next Android testing build. Updated web copy
rollout remains separate; the older S62 APK does not include it.

Many of these businesses have products and production capabilities spread
across posts, stories, image galleries, chats, and status updates. Consumer and
wholesale buyers struggle to understand:

- what the business sells;
- which items are currently available;
- what colors, sizes, specifications, or variations exist;
- which products they want to ask about;
- how to send a complete inquiry without repeatedly taking screenshots or typing product names;
- how the business can retain the inquiry if a social-app handoff fails.

Suqpage gives each shop a consistent public page. It organizes each
participant's story, process, products, capabilities, reviewed location, and
contact options; supports map, region, category, product, and capability search;
and lets buyers contact the participant directly for small purchases, custom
work, repeat orders, or larger trade inquiries. Business owners can contact Suqpage support from their authenticated dashboard.
The local S57 transport service connects customers to staff who arrange
carriers or logistics providers outside Suqpage. Intake collects pickup,
destination, name and phone, with optional goods details. The local S58 intake
pairs pickup/destination in a highlighted route card and name/phone in a second
row, including phones; a compact optional-details box follows. It is a conversation,
not a confirmed booking, payment or delivery guarantee.

S71/S72/S84/S90 UI revisions are visually approved and released on web
after full gates (FE-019/FE-030/FE-049/FE-053); the canonical APK is built and its
public flows checked. The transport entry says Need help with
transport?, followed in smaller print by Let us handle it. Chat with our transport
agents live. Its intake invites customers who bought from a business on Suqpage
to chat with the transport team for help getting the purchase to them.
Customer copy avoids last-mile delivery wording, distances,
brokerage and mode details. Shared wording explicitly names purchased goods and includes
native live-chat wording plus (Live Chat), allowing more words when clarity
requires it. They invite
visitors who found a product to chat with the transport team. The results opener
says View products/Hide products alongside its panel icon, keeping map/search/
filters unchanged. All five languages use authored contextual wording. The live
web and finished Android APK remain on source 6c27025 until separate rollout;
these local labels do not rename the service/API or promise confirmed delivery.

---

S57 (FE-019/BE-018/BE-044, deployed web/API and internal Android) replaces the public Buying
assistance entry with Transport & delivery, retaining the Live chat sublabel and
Suqpage design. Start chat opens a token-scoped transport conversation. Customers
see Waiting for our transport team until an explicit staff reply; assignment is
not a claim of online presence. Visible dialogs refresh every five seconds with
bounded backoff and same-browser recovery. General guest Help stays retired;
old buying APIs/history remain compatible without a new public buying entry.
Only visitor messages and explicit staff replies are public. Historical notes,
carrier contacts, commission discussions and attachments remain private. End chat
releases live capacity and preserves contacts and history; X only hides the chat.
Staff can call and add private notes to ended cases, mark them resolved separately,
or reopen them. The dedicated transport queue retains capacity, claim, assignment,
reassignment, Active/Chat history/Resolved filters and private carrier handoff.
Business-owner dashboard support remains separate. Local migration 59 extends
closed-only resolution to transport; deployed schema remains 58 until rollout.

Existing records were preserved during the verified 2026-09-27 rollout.
No hosted Realtime configuration or native app has been deployed.

## 4. What Suqpage is—and is not

### Suqpage is

- a multi-tenant market-discovery and public-page SaaS;
- a dynamic catalog and availability manager;
- an inquiry-cart system;
- a lightweight customer lead-capture system;
- a single-product or grouped inquiry builder with configured WhatsApp, Telegram
  and SMS handoffs, copy, and phone-required submission into the business’s inbox;
- an inquiry management dashboard;
- a first-party customer support workspace;
- anonymous, token-scoped transport/delivery conversations (local S57) with live text replies,
  status, private staff notes and retry-safe persistence. Pickup, destination, name and phone
  are required; goods details are optional. No email field or attachments. Closed cases can start another
  request without deleting staff history;
- authenticated owner-dashboard support with live replies, tenant isolation and
  private sanitized image/PDF attachments up to 5 MB. Support staff assignment,
  capacity, claim, close/reopen and history remain available;
- one shared business profile with each seller's own identity, introduction,
  images, products and optional About video;
- a permanent public discovery surface where visitors choose an industry,
  explore exact reviewed business locations or a daily country-wide virtual
  Daily Featured program, and enter each participant's permanent
  `/@handle` Suqpage page;
- a controlled SaaS pilot whose existing fictional Ethiopian catalog includes
  artisans, farms, workshops and small manufacturers. Product retailers and
  home sellers are eligible; additional retailer examples remain checklist S6.
  The offering contract also admits repair and other service offerings. Ten are curated benchmark identities and all fixtures have durable fictional briefs,
  advised palettes, independent logos and heroes, coordinated booths, and four
  imaged offerings while exercising discovery and high-volume operations.

The local FE-021/FE-053 map refinement uses bright orange shops with thin white
outlines around the shop and roof and white interior details. Business names sit on cream plates with
orange borders/text; selected names use white text on orange. Counted clusters,
nearby-group markers and status badges keep their original styling. Web, phone
web and the shared native/Expo renderer retain their existing interactions. This
appearance is focused-tested locally and awaits visual approval and rollout.

### Suqpage is not

- a generic theme marketplace;
- a payment processor;
- a full shopping cart and checkout system;
- an accounting system;
- an ERP;
- a tax engine;
- an automatic order-fulfillment system;
- a checkout marketplace or shared storefront that replaces each business's
  permanent Suqpage page identity;
- an excuse to make every client page look like the Suqpage landing page;
- an AI product merely because AI may help generate custom designs.

Use the terms **inquiry**, **inquiry cart**, and **customer inquiry**. Do not casually rename inquiries as paid orders.

---

## 5. Non-negotiable design philosophy

### 5.1 One profile, each business's content

FE-054 adds locally verified optional tenant accents: an 8% cover-poster tint,
small edges, logo surround, catalog selection and inquiry/contact accents. Platform
branding, product images and playing video retain their original appearance.

Every public page and ordinary preview uses BusinessProfile (FE-040/FE-041).
The structure is image/video poster, name/logo, one About description, product/service
navigation with either a catalog or shareable inline offering detail, then a separate
public contact section. The hero image is the video poster; one intentional play
control loads the privacy-enhanced player. Only configured public links appear.
Saved selections expose inquiry access; an empty selection offers Explore products.
Category controls use recognizable, shared object illustrations
in category controls, Featured, business setup/admin and About. Market categories
expand on request with keyboard selection and an All categories option; setup forms
retain native selects.
There is no separate Introduction field or custom layout selector. Account contacts
are edited separately from the public contact values. Owners and consented staff
use the same standard page editor; owner consent governs staff assistance.

### 5.2 Suqpage must have its own platform identity

The Suqpage public root must not look like any client page. It is a polished,
mobile-first marketplace application designed to remain understandable inside
TikTok and other in-app browsers. `FE-021`, `FE-024`, `FE-027`, `FE-028`,
`FE-029`, `FE-030`, and `FE-036` define the current composition, narrative,
venue art direction, and platform visual system. `/` opens directly into the
geographic Market; there is no intermediate landing lobby or duplicate search.
The compact introduction presents the showroom benefit: everything a business
offers in one place. Supporting copy invites visitors to discover nearby
businesses, their story, offerings, capabilities and location, then make direct
contact. It remains visible on phones. About pairs this with the owner promise:
one shareable link to what they offer, alongside their existing social channels. Functional
navigation and action labels stay task-specific. Visitors can search by product,
category or location. Individual
and household buyers are the primary public audience; traders and retailers can
also find repeat supply when a participant actually offers it. This audience
strategy guides content but is not repeated as promotional taxonomy in every
screen. The launch
catalog begins in Ethiopia; nearby, national, East African, and wider African
trade context belongs on About rather than in a slogan fragment. Long platform
education remains on `/about`. The
Market controls and map sit on one quiet, production-led architectural canvas
instead of looking like unrelated sections or decorative cards. The canvas has
no people, factual business attribution, unsupported statistics, or tenant
branding. The combined marketplace map loads immediately with **All categories**
and no orientation chooser. The local S56 candidate uses one compact horizontal
map toolbar: results toggle at far left, search, category and location icon buttons.
Category and location icons show the number of active selections, with no badge
when cleared. Filter menus open on demand and show active selections; the toolbar is the shared
header for map-only and open-results views. The product list and zoom tools start
below it, preserving map space at 320px. Only one active control set is mounted.
Closed-view searches/filters update the map without opening results; open-view
changes update both map and list. The drawer contains
one five-row paginated list labeled Products & services. Each result identifies its
business with a localized “From {business}” link to the main showroom, separate
from the product-details target; merchant names remain verbatim on web and mobile.
The local S54 candidate
removes business cards and result-type controls; businesses remain on the filtered
map with their existing previews. Public web/mobile boundaries normalize old
type parameters before SQL counts/pagination. There are no result tabs. It starts closed on a
fresh visit and opens for query/category/place deep links. Hiding and reopening
retains the query, filters, result page, map center and zoom. Explicit web view=map
URLs stay closed on reload even with filters; query changes preserve view choice.
Map controls remain
on the right; attribution and fixed phone navigation stay visible. Selecting a
map business opens its preview above the drawer. The map stays mounted.
The local FE-030/FE-042 implementation places Category and Region or city side
by side above the product/service results; there is no Filters disclosure. No selected category
means all categories, shown only as the control's empty-state label, not a menu
option. Visitors may select several categories and remove individual selections
or clear them together. Category sets match any selected membership; location
and query further narrow that set. Each scope has its own clear action, changes
reset paging and preserve the other scope, and selected valid locations remain
even when its new category scope returns no matches. Parameterized PostgreSQL
exact/fuzzy queries, map rows, counts and pagination use the same canonical
category set and location union; overlapping city/region selections return records once.
Locations accept up to 16 selections, with OR within locations and AND with search
and categories; single-location URLs remain valid. S57 is deployed on the web and native API in S61. No search schema change is needed.
Transport/delivery help uses a compact accessible icon alongside an open drawer on narrow
screens so it cannot cover pagination. S56/S57 controls are deployed on web and included in the finished internal Android APK.
Opening a permanent Suqpage page navigates in the same tab to its canonical tenant
route and unmounts the map or Daily Featured runtime. Desktop and tablet retain
the Suqpage application rail around the tenant-owned page. Phones use an
immersive page surface instead: the platform bottom navigation is removed,
one compact platform-owned Back/Powered by Suqpage bar remains, and the
tenant's single section/inquiry navigation may stay fixed at the bottom. The
Back action restores the exact recorded map, filter, nearby-group, or Featured
state before consulting older browser history. A direct Suqpage page URL renders
the same responsive shell without requiring prior Market history.
Category selection is optional in the drawer, with **All categories** selected by
default. Native selects work with touch and keyboards at narrow phone widths.
Industry accents may identify nearby-page cards, but individual geographic markers and numbered clusters use one
consistent Suqpage orange action treatment. The isolated marker uses a compact storefront pin smaller than a cluster core,
with no visible halo and an independent touch-sized transparent target;
white and cool-gray remain the dominant content surfaces, and visible industry text or iconography means
color is never the only identifier. After two typed characters, search exposes no more than six
server-authoritative eligible page, published offering, and reviewed-place
suggestions. The combobox supports pointer, touch and keyboard interaction.
Category and place selection refine the drawer and map together. The product/service result list shows accurate scoped totals; businesses remain on the map. Five results
are selected by SQL COUNT/LIMIT/OFFSET with deterministic unpaid ordering and
Previous/Next controls. Public lists contain products/services; category, query,
place or type changes reset the result page. Direct product links and business
inspectors remain distinct actions. The map stays mounted across result pages and
query/type changes, preserving its center and zoom. The public program name is always **Daily Featured** across
visible copy and accessible names. Existing `expo` types, query keys, analytics
values, styles, routes, and persistence fields remain internal compatibility
identifiers and must never render as visitor language. A disclosed five-placement
global paid-sponsorship pool is attached to Daily Featured. A placement may be
an eligible Suqpage showroom or a validated external ad with approved local
media and an HTTPS website or telephone action; external ads never become fake
showrooms or map records. Staff selection and
ordering do not change with industry, search, place, or selected program day.
The S51 carousel shows one sponsor at a time on desktop and phones,
advancing every six seconds through the ordered pool with equal turns. Previous,
Next and Pause/Resume controls remain available. It pauses offscreen, during
interaction and in the background; reduced motion starts paused. Broadcast
spotlights do not interrupt the cycle. The web carousel is deployed in S61; native artifact gates remain open
under FE-036/FE-053. Every
day has one stable assigned industry, including Agriculture on Sunday. The
The verified local S36 Daily Featured window is 8:30 PM–12:00 AM Ethiopia time
(EAT, UTC+3). Six businesses receive 30 minutes each, four sponsor mentions receive
five minutes each, and two five-minute changeovers fill the remaining ten minutes.
The final sponsor mention ends at midnight on the following date. Fewer than six
eligible businesses produce a shorter evening from the same 8:30 PM start; no
business is invented or given artificially long airtime. An empty lineup has no
agenda. There are no morning or intermission sessions.
Automatic mode rotates up to six businesses from the current alphabetically
ordered eligible category pool each week. No daily setup or cron is needed.
Platform administrators can select/order up to six for a date or return it to
Automatic. Public and admin use matching eligibility/order and selection rules.
Manual saves invalidate public projections; an indexed weekly override-version
read also forms part of the public cache key so retained changes appear on the
next request even if tag invalidation is delayed. The old global timing-policy
form/action is retired; its historical DB row is retained but does not control
the official evening schedule. Existing oversized overrides are read at the new
six-business limit without deleting their stored history.
Today's compact schedule disclosure names actual EAT times and lists business
presentations and sponsor mentions. It remains collapsed by default on phones
and desktop and does not reveal future-day identities. Every revealed card shows
its range. The browser updates the current card from the same agenda and refreshes
at the EAT date boundary; breaks and the midnight cutoff identify no business.
All times use 12-hour AM/PM, including 12:00 AM at the end. This is a Suqpage
rundown, not an integration that starts or schedules TikTok broadcasts. Provider
links are never invented. The evening schedule is deployed under DEP-024.
Today's gallery rotates as a circular schedule queue: the current presentation
leads; during breaks the most recently completed presentation remains first;
and the next card leads only when its presentation starts. References, airtime,
and stored lineup order remain stable. Non-today previews do not rotate.
Sponsor breaks receive sequential placements from the active five-placement
pool. Internal schedule previews name each assigned sponsor and exact time;
during the live segment, public status names the paid sponsor as **Sponsor
spotlight**. The S51 carousel keeps rotating independently of that segment.
On phones, Daily Featured avoids a vertical wall of controls: its long
description is omitted, broadcast status is compact, and all seven fixed weekdays
fit in one compact segmented row above the gallery. Daily Featured uses an
ordinary responsive image-card grid that grows downward without venue scaling,
map-style zoom, or pagination. Nearby groups use at most six fixed-readable
image cards over the unchanged map. Long platform education lives on `/about` and
signup lives on `/request`. There is no duplicated
all-business directory or browser-side full-catalog List fan-out. The public
Daily Featured route is a bounded application workspace rather than a scrolling
promotional document. Its gallery owns the available workspace below one compact H1,
broadcast status, collapsed schedule summary, attached sponsor surface, and fixed
weekday ribbon. Expanding the schedule scrolls its agenda internally without
hiding application navigation.
The public application shell exposes Market, Daily featured, About, and More on
phones. Desktop and More navigation separate Explore, Account, and
Information. Anonymous visitors see Sign in only; authenticated visitors see
Dashboard only; account creation remains available from the sign-in route. More
contains direct contact, privacy, and terms rather than repeating the same
destinations in two navigation surfaces.
Each screen has one communication job. Market helps visitors find businesses, products and services. About explains
an accessible digital presence for African businesses, the Ethiopia-first catalog,
and discovery through location, search, result lists and Daily Featured. Login explains passwordless account access. Setup
collects private account details. Business owners use Dashboard → Support for
platform questions. There is no public Ask for help entry. Transport & delivery, with a Live chat sublabel, opens route/name/phone intake and
then live text chat. Staff arrange carriers outside Suqpage. General visitor
support stays closed; business owners use their authenticated support dashboard.
Transport intake, staff queue and native API are deployed; the same service is
included in the finished internal Android APK. Staff management remains web-only.
No eyebrow, heading, paragraph, or button piles up audience synonyms or repeats
the complete platform narrative. **Custom work**, **ready products**, and
**wholesale supply** remain optional capability labels, not a slogan or a
mandatory signup questionnaire. Platform-owned copy does not use **maker**,
**producer**, or **businesses that make** as its primary catch-all audience.
Visitors search by product, capability, or place, inspect a professional
Suqpage page, and begin a direct inquiry. Copy avoids motivational clichés,
generic SaaS claims, and childish slogans. The fuller story of helping shops be
discovered and connecting nearby buyers and sellers, beginning in Ethiopia,
belongs on `/about`;
merchant education and conversion remain secondary content below the public
discovery experience. Platform copy must not claim verified tax, employment,
certification, import-substitution, sales, or other outcomes for every listed
participant, and Suqpage mission copy must not be injected into client-owned
pages. A public Suqpage page on desktop or tablet is framed by the Suqpage
application shell without a duplicate host band. Its mobile presentation uses
one compact row containing a **Back to Market** arrow, the Suqpage mark/wordmark
and language selection, with no redundant platform credit.
Private previews retain their authorized workspace framing. Platform chrome
sits outside the tenant renderer and must not replace, obscure, recolor, or
visually compete with the tenant's logo, header, navigation, or content.

Suqpage-owned surfaces use one semantic identity system derived from safety
orange `#FF4B00`, accessible action orange `#C93600`, charcoal `#202428`, middle
gray, soft gray `#F4F4F2`, and white. White and soft gray carry most public page
area; charcoal carries identity and structural contrast; orange carries brand,
selection, and bounded emphasis. White text uses the darker action-orange state
needed for accessible contrast. Sponsored placement uses an explicit paid label
and restrained charcoal or soft-neutral structure rather than warning color.
Public pages, task forms, discovery, and authenticated workspaces share the
same shop/map vector mark and split-color lower-case `suqpage` wordmark.
Business logos and media remain independent. The shared business-profile layout
uses the platform's restrained palette rather than legacy custom design tokens.
On phones, public pages, account entry and private workspaces retain a compact
Suqpage mark/wordmark and language header. Primary app navigation stays in the
bottom bar; the Market viewport reserves space for both (FE-038 / FE-034).
The deployed brand uses a 4px icon/text gap and consistent
32px/24px standard, 28px/22px phone and 24px/18px compact-shop icon/wordmark
sizes. It preserves the icon ratio and Latin typeface; deployment and multilingual phone/desktop checks pass under FE-038.

Nearby-group viewers use no architectural shell, venue, floor, hall, or
decorative environment. Daily Featured likewise presents up to six image-led cards in responsive columns with
ordinary vertical scrolling and no simulated hall, map-style zoom, pagination,
or hidden overflow.

The discovery map uses Leaflet with the centralized `osm-standard` provider.
The visitor's browser requests only visible basemap tiles from the exact
OpenStreetMap Standard HTTPS endpoint and retains visible attribution plus the
provider's normal cache behavior. Suqpage does not proxy, prefetch, scrape,
bulk-download, package, or service-worker-cache those tiles, and it sends no
search, account, showroom, or private-location data in tile URLs. OpenStreetMap
supplies visual road and place context only; Supabase remains authoritative for
reviewed coordinates, eligibility, industries, search, and place filters.
Cluster and marker reconciliation occurs after Leaflet movement settles and is
bounded to the committed viewport. Exact storefront/legacy businesses keep their saved WGS84 coordinates. City/area
shops use stable business-ID-based offsets within 1.5 km of the public anchor,
without changing saved coordinates or shifting when filters/pagination change.
Nearby markers form numbered zoom-dependent clusters. At neighborhood zoom,
exact/legacy same-city businesses within 800 meters form deterministic balanced nearby groups
of at most six. Larger cohorts split into separate markers. Activating one opens
a lightweight two-column phone or three-column desktop card viewer over the
unchanged map, with no pagination, internal scroll, simulated architecture, or
deeper zoom requirement. Selecting a nearby card replaces that list inside the
same bounded map inspector and provides **Back to nearby**; it never opens a
second popup or scrim over the retained list, and persistent support controls do
not overlap the inspector. Isolated businesses use a compact accessible action-orange
map-pin containing a familiar upright storefront and the
actual business name in a bounded multi-line label. A generic Showroom caption
and horizontally unbounded names are prohibited.
Perspective platforms or device-like silhouettes are prohibited.
Activating an individual marker centers at local-detail zoom and opens the richer
business preview in one click. Cluster clicks always zoom forward. City/area shops
remain separately selectable at detailed zoom rather than joining Nearby groups. The map marker does not load booth
or hero photography. Map previews and nearby groups use a native modal above
the search drawer and map, bounded to the viewport with scrollable content.
Close, Escape or backdrop dismissal preserves search and drawer state and returns
focus to the trigger or a visible drawer control after marker redraw. Selecting
a business result also preserves the open drawer. Short landscape windows let
the drawer scroll rather than squeezing its results to zero height. A counted nearby-group
group marker uses the same accessible action-orange cluster language and exact count so
it cannot be mistaken for one business marker.
Activating a revealed Daily Featured booth opens its existing preview before any
tenant route change; only the explicit **Open page** action navigates.
Valid tenant-controlled live state appears on clusters, showroom markers,
nearby-group cards, and today's featured cards. The business in Suqpage's current
Daily Featured walkthrough slot is labeled **Featured now** everywhere it is visible; this
temporarily overrides only its merchant-live presentation and never changes the
tenant's saved live setting.
Location controls show only places with
matching businesses, and the center control restores the country view.
Identical anonymous non-search Market, Daily Featured, and Sponsor projections
use a bounded twenty-second server cache. Search remains uncached so arbitrary
visitor text cannot create unbounded cache keys. The public projection still
ships the canonical eligible showroom point set to the browser; a measured
viewport or tile endpoint is required before that payload approaches tens of
thousands of simultaneous map records.

Daily Featured is a seven-day virtual presentation, not a physical location
claim. It uses one responsive image-led card gallery with no physical hall,
pan/zoom controls, pages, ranking, or hidden overflow records.
The seven-date selector remains in fixed Monday-through-Sunday order for the
current Ethiopia-local calendar week. Its charcoal-and-orange **Today** indicator
moves to the current weekday without reordering the cards or using warning color.
Selecting another date opens a six-second anonymous preview and then returns to
today; selecting a different preview restarts that timer without changing map
filters. The selected calendar date, not map filters, chooses its industry.
Monday is Electronics & Appliances, Tuesday Beauty, Hygiene & Household Care,
Wednesday Food & Beverage Production, Thursday Machinery, Metalwork & Industrial
Inputs, Friday Furniture, Home Goods & Building Materials, Saturday Textiles,
Garments, Leather & Paper, and Sunday Agriculture, Livestock & Primary Produce.
Today's program reveals each business's
identity, published business-page hero image, preview, and permanent page
link. Selecting any other date returns only count-preserving anonymous booth
outlines; business identity, handle, media, and destination are not serialized.
Sunday follows the same eligibility, privacy, gallery, and interaction rules as
the other six industry days. Every booth exposes a stable
`{industry-code}-B{booth-number}` reference. A business must have an
active published showroom, one published offering, a matching reviewed industry,
valid reviewed location, an approved discovery profile and media, and no
discovery exclusion. Subscription or payment dates do not determine public
eligibility. Marketplace, Sponsored, and Daily Featured use the same server-authoritative
eligibility rules, while map search/industry selection and the date-selected
Daily Featured remain independent projections.

Sponsored treatment is paid placement, not a separate or duplicated catalog,
and is always disclosed as **Sponsors**. Platform staff manually order one
global pool of five eligible showroom placements and/or validated external ads;
it does not change with map industry, search, place, or selected
program day. Sponsorship does not imply endorsement
or Daily Featured eligibility. All other eligible showrooms remain discoverable. Map previews and
Daily Featured cards link to the authoritative permanent page. The published
business-page hero is the single image used by map detail inspectors,
nearby-result cards, and revealed Daily Featured cards; retained booth artwork
does not override it. A named fallback is only a failed-file display state and
cannot make an incomplete profile eligible. The useful
product explanation lives on `/about` and in the compact merchant invitation,
and a visually distinct merchant CTA closes the page. Public controls have at least
44-pixel touch targets and the complete composition is verified without
horizontal overflow at 320 and 390 CSS pixels.

The merchant CTA links to passwordless account entry. A six-digit
email code verifies identity before any business details are requested. An
authenticated unlinked identity completes one account/business setup screen.
Web and native setup collect a chosen available handle alongside owner name,
verified email display, private phone, business name/category and consent. Both
create the complete private sample preview. Handle changes belong in Page editing. The server derives identity from the Supabase session and atomically creates the private draft business, owner,
client access profile, identity link, and business onboarding record.
FE-046/BE-039 also creates a private saved profile, example location and
three editable example offerings with names, descriptions, media and prices.
Each new offering demonstrates two photos and the platform example video; admitted
fictional ceramics demo imagery and concise sample descriptions show the layout.
These are editable examples, not claims about the new business;
all editable public-contact fields are filled. It accepts no public file upload and creates no public marker,
Daily Featured card or public showroom.
Standalone administrator-created account invitations remain supported. The legacy
custom-page lead endpoint is retired. The homepage and request flow
use professional copy with no development-stage disclaimers. The public
composition is verified without horizontal document overflow at 320 and 390
CSS pixels.

The public account-entry and authenticated business-setup routes use the same
Suqpage header, orange, charcoal, white, and cool-neutral platform language
as Market and About. Each is a focused task surface with one concise context
panel and one white form panel on wider screens, stacked in semantic order on
phones. Account entry asks only for an email code;
business setup follows only after provider verification. Password entry,
password reset, public role selection, and initial catalog
collection are outside the launch flow.

### 5.3 Public copy must look finished

Standing UI standard: use clear, specific labels and icons that match the action.
A message icon opens an inquiry, list-plus adds a selection, clipboard-list reviews
selections, and send confirms sending. Let those controls explain themselves.
Do not add filler paragraphs, repeated instructions, implementation details,
internal notes, release status or backend terminology to public or workspace UI.
Keep concise errors, outcomes, required input constraints and privacy/consent text
only where they help someone make a decision. Sample-content warnings remain when
needed to avoid publishing an unedited starter as genuine business information.
Apply this standard to all future Suqpage work, not just the current cleanup.

The local FE-052/FE-053 showroom candidate omits the business-example notice when
a marked demo's visible handle contains `demo` (case-insensitive). It retains the
notice on marked demos without that handle text. Inquiry screens omit demo-inquiry
disclaimer sentences. These display choices do not assign or change demo flags,
owner/publication authority, contacts or normal inquiry behavior.


Do not place public-facing words such as these on production pages:

```text
fake
temporary
temp
placeholder
fictional
demo
example site
sample user
under construction
coming later
real user
live user
```

Internal documentation, tests, and seed code may use accurate technical terms such as `test`, `mock`, or `seed`, but public visitors should see normal business language.

Do not label a client card “industry showroom” when the category, brand name, image, and description already communicate the concept.

---

## 6. Current local benchmark tenants and visual direction

The disposable local environment contains ten fictional benchmark businesses.
They exercise real product shapes and workflows without representing real
clients or authoritative customer data:

- Selam Weave Studio: textile atelier and made-to-order woven goods;
- Afia Botanics: small-batch natural beauty production;
- Warka Furniture Works: furniture workshop and hospitality projects;
- Addis Metalworks: fabrication catalog and specification-led RFQ;
- Green Terrace Farm: seasonal farm and recurring produce supply;
- Blue Nile Apiary: honey, comb, beeswax, gifts, and wholesale inquiry;
- Rift Valley Mill: household and bakery grain products;
- Entoto Ceramics: studio tableware and hospitality production;
- Koba Leather Workshop: bags, small goods, and practical tool carry;
- Nova Assembly Lab: electronics assembly, diagnostics, repair, and power work.

Their product counts, category counts, media coverage, token systems, page
components, catalog modes, and mobile behaviors intentionally vary. Generated
benchmark images are internally illustrative and are never evidence of a real
merchant product. Public presentation uses normal finished business copy.

The wider disposable seed contains additional small-scale authored operations
distributed across seven industries and reviewed Ethiopian locations. Reset
creates a dense demonstration catalog with imaged
offerings, exactly five globally selected sponsored placements, exactly ten
retained legacy benchmark flags,
approved discovery media, reviewed
production-scale metadata, exact map coordinates, and
complete dynamically sized Daily Featured floors. Each has a durable fictional client
brief, palette advice, a component rationale, independent identity/media paths,
and desktop/mobile review evidence. These remain illustrative workflow and
demonstration fixtures, not evidence of real businesses or verified products.

These seeds may be replaced by `npm run reset` only because the product owner
confirmed the local data is disposable. Any production or data-important
environment requires an explicit preserve-or-reset decision, backup, rollback,
and migration plan before a comparable change.

Merchant-entered product, category, option, contact, availability,
specification, and certification facts remain authoritative. AI may organize
and present them but must not invent or silently translate them.

---

## 7. Dynamic catalog model

FE-058 is locally implemented: web/native maps pan worldwide at zoom 1–19,
while initial/reset views remain Ethiopia and filters remain selected. Approximate
city offsets wrap worldwide coordinates; exact GPS is unchanged. This does not
expand the current Ethiopia city catalog or relocate existing businesses.

Suqpage stores business content in the database. Client renderers must consume dynamic data rather than hard-coding products. FE-054 stores the optional accentColor in existing versioned PostgreSQL page draft/publication JSON, with no migration or backfill.

Core hierarchy:

```text
Business
└── Product category
    └── Product
        ├── Ordered photos and reviewed YouTube videos (FE-050 / FE-019)
        ├── Availability
        ├── Optional ETB display price, offered-by unit, and highlights
        └── Up to four option groups
            └── Option values
```

Product category is the only active browsing taxonomy. Retained collection
tables and revision fields are compatibility-only recovery input: current seed,
recipe, admin, product-upkeep, and public-renderer workflows do not create,
select, display, or derive editorial content from them.

Examples of merchant-defined option groups:

```text
Color
Size
Storage
Condition
Material
Finish
Specification
Set type
Region
Count
```

Suqpage uses **Offering** as the internal umbrella for a standard product,
service, made-to-order work, manufacturing capability, or production supply. Public
pages use **Products**, **Services**, or **Products & services** according to their
listed content. The compatible
`products` table and recipe array remain the current transport; they do not
limit an offering to stocked retail merchandise.

Rules:

1. A product can have zero to four option groups.
2. Option-group names are merchant-defined.
3. Option values are merchant-entered data.
4. Product names, brands, colors, sizes, model numbers, specifications, and option values must not be automatically translated.
5. Interface labels may be translated.
6. Do not claim, store, or imply exact product or variant inventory.
7. Descriptive availability is the only current product-status authority.
8. Unavailable or coming-soon products are not inquiry-ready unless a future
   waitlist-style workflow explicitly supports them.
9. Customer-requested quantity is optional free-form inquiry intent of at most
   80 characters. It may include units, packages, ranges, or phrases such as
   `1 g`, `1 ton`, or `two pallets`; it may remain absent for every offering and
   is never compared with, reserved from, or deducted from inventory. Retained
   numeric quantity and `quantity_mode=required` values are compatibility input
   and normalize to current text/optional behavior.
10. Every stored offering has one kind: `standard_product`, `service`,
    `made_to_order`, `manufacturing_capability`, or `production_supply`.
11. Capacity, minimum-order, and lead-time summaries are optional bounded
    merchant facts. The platform and AI must not calculate, verify, or invent
    them. The shared public product view omits these production facts.
12. An offering may display one optional non-negative ETB price, one normalized
    merchant-defined offered-by unit (including hours, sessions and projects), and up to six concise highlights. These
    fields support inquiry context only and never create checkout, payment, tax,
    inventory, or price-verification behavior.
13. The deployed gallery accepts four reviewed YouTube videos and one header video.
    The FE-060/BE-048 local candidate accepts direct owner TikTok, YouTube, public
    Facebook video and Instagram Reel links for both, without staff approval.
    The FE-061/BE-049 local candidate gives new private headers/sample offerings
    and newly added items a category-specific admitted example until replaced.
    Example footage is not presented as the owner's own work. Legacy reviews
    remain private history; owner saves keep tenant/version and visibility rules.
    Public rendering derives a privacy-enhanced embed or normal watch link from
    the canonical provider ID; recipes and users cannot supply iframe markup.
    The showroom-level process video appears inside the canonical combined
    story-and-process chapter and is loaded only after the visitor activates its play control. It
    must not appear as a duplicate header action or standalone video section.

Supported availability states:

```text
available
limited
unavailable
coming_soon
```

This availability-only model is current verified behavior. No active product,
option, UI, snapshot writer, database table, or inquiry decision carries an
inventory count. Historical v1/v2 stock fields are accepted only as ignored
recovery input and are discarded when upgraded to revision schema v3.

---

S98 media-save protection (FE-050) disables the product form before
client readiness and while its save is pending, using the existing loading bar.
Actual browser coverage verifies new photo bytes and gallery retention; web
publication is verified. No additional product fields or approval step is introduced.

## 8. Product and inquiry workflow

The S91 implementation records one owner alert with each canonical in-app inquiry
transaction. Its link opens that exact permitted inquiry; reading an alert does
not change inquiry status. External social handoffs create no platform alert.
Inquiries without a client owner alert platform/operations managers (FE-062/BE-050).


Product cards open a shareable `/@handle?product=<id>` view inside the business’s
product section (FE-041). The route reloads directly, supports browser back/forward,
and provides a return link to the page’s product/service catalog. Unknown, foreign or unpublished product references
show a safe unavailable state. Cards have no Video badge; details use an ordered photo/video gallery (FE-050/BE-042), name, description, optional
price, canonical selling unit and feature chips. Capacity, minimum order, lead time
and internal offering-kind labels stay out of this public view. Single-value option
groups need no selector; their canonical defaults remain part of the inquiry.

Expected customer flow:

1. Open a product, review photo/video/features, and choose any available options.
2. Choose **Inquire about this product only** (or **service only**) for that selection
   alone, or **Add to inquiry list** to save it while continuing to browse.
   Cards use the same label, then **Added to inquiry list**; the selected-item
   control says **View inquiry list** with a count. A direct inquiry never merges
   with, clears or submits the visitor’s saved group.
3. A single selection uses a compact product summary. Multiple selections show an
   editable inquiry list; zero selections show no persistent cart button. Saved
   references are revalidated against current tenant products/options and capped
   at 20, matching server limits. Desired quantity remains optional bounded text.
4. Choose configured WhatsApp, Telegram or SMS, **Copy inquiry**, or **Send inquiry on
   Suqpage**. Only validated effective public contacts supply handoff destinations;
   SMS uses public phone and never implies WhatsApp availability.
5. App actions prepare a message for the visitor to review and send. Copy retains
   visible/selectable text, including a clipboard-failure fallback. None of these
   actions creates an inbox inquiry or claims external delivery.
6. Only choosing **Send inquiry on Suqpage** reveals the reply-phone field and explicit
   **Send inquiry** confirmation. Back to sending options hides the phone again.
   Sending disables edits; bounded failure, retry-safe idempotency and explicit
   success remain. An obsolete response cannot mark a different selection sent.
7. Platform delivery retains canonical tenant validation and requires a normalized
   phone with 7–15 digits. Phone is never stored in the browser’s saved cart.

The inquiry composer is a bounded floating panel with outer margins on desktop
and a safe-area-aware bottom sheet on phones. It has an anchored header, one
scroll region, keyboard focus containment, Escape/close and opener restoration.
All actions have at least a 44px touch target. It is rendered outside clipping
ancestors; the product detail itself is an ordinary navigable section, not a modal.

A canonical inquiry record created by the public **Send inquiry** action
contains:

- business;
- a neutral visitor label;
- the visitor's required phone number;
- phone as the contact method;
- optional note;
- selected products and capabilities;
- selected options;
- optional free-form desired quantity intent;
- source;
- status;
- timestamps.

Supported inquiry statuses:

```text
new
contacted
confirmed
closed
cancelled
```

The system must prevent:

- forged product names;
- products from another tenant;
- unpublished products;
- invalid option names;
- invalid option values;
- unreasonable quantities;
- duplicate submissions caused by repeated social-button taps;
- oversized payloads;
- uncontrolled spam.

Use idempotency, rate limiting, canonical database validation, and tenant checks.

---

## 9. Social messaging and clipboard behavior

The native app opens ordinary HTTPS links in a system in-app browser with a
Close/Back control. Recognized WhatsApp phone and Telegram username links try the
installed app first and fall back to their original HTTPS destination. Phone,
SMS and email use system handlers. Closing or returning from these destinations
never confirms message delivery, payment or an order. Other apps control their
own return behavior. Merchant HTTPS/www links in native descriptions and business
stories are tappable plain text, not embedded HTML.

Do not make the workflow depend entirely on `navigator.clipboard.writeText()`.

Android Chrome, Google Search in-app browsing, TikTok in-app browsers, and other embedded browsers may block clipboard access, show permission prompts, lose the user gesture, or open blank tabs.

Required behavior:

### WhatsApp

- Use the exact business number.
- Store the number in international digits-only format.
- Do not include `+`, spaces, dashes, or a local leading zero.
- Embed the structured inquiry directly into the WhatsApp link when possible.

Example stored value:

```text
251911234567
```

### Telegram

- Store a username or supported Telegram profile value.
- Recommended stored format is the username without `@`.
- Use Telegram’s supported draft-text link behavior when available.

Example stored value:

```text
AlHayaModest
```

### General fallback

When automatic copy is blocked, the customer must still see:

- the complete inquiry message;
- a copy button;
- selectable text;
- configured WhatsApp and Telegram actions only.

Never pre-open `about:blank` and wait for asynchronous clipboard permission.

---

The owner editor asks for Product or Service, name, optional ETB price and one
description (FE-048/BE-041). The FE-060/BE-048 local candidate extends the existing
eight-photo/four-video gallery to direct TikTok, YouTube, public Facebook videos
and Instagram Reels. Owners enter links in the cover/product editor and Save;
there is no approval ticket or wait. HTTPS exact-host validation and bounded
TikTok share resolution run before the existing atomic owner save. Private,
deleted or embedding-disabled videos cannot be guaranteed to play. Instagram
photos/stories/profiles and Facebook share-token URLs are not admitted.
Historical staff video requests and their restricted review workflows remain
available; there is no integrated provider upload or ownership API.
The public gallery has thumbnails, arrows, keyboard navigation
and horizontal touch scrolling. Video playback requires an explicit play action
and stops when the selected media changes. The first photo stays the cover for
search/cards; legacy single-photo/video products need no backfill. Extra photos
follow existing tenant/public access and snapshot-retention rules. This gallery
was deployed on schema 50. Historical support reviews were deployed on schema 58.
The direct-video implementation has passing persistence/security and inline
web/Expo captures, plus actual Android TikTok/Facebook/Instagram player checks.
Approved web publication and full gates pass. The canonical APK and physical-phone
checks remain separate.
Omitted category, availability, units, highlights, options, visibility and legacy
collection association are preserved under the tenant/version lock. An explicit
type choice is saved; new items default to Product. Staff retain detailed controls.
Fresh demo and starter offerings use the simple fields; useful old demo facts are
included in descriptions. No automatic service inference or translation occurs.
The owner approved this experience; release evidence is recorded in docs/SUQPAGE-RELEASE-2026-09-21.md.

## 10. Market discovery behavior

Under BE-040/FE-042/DEP-037, query results form one backend-paginated list:
normal matches first, then spelling matches ranked by PostgreSQL similarity.
There is no separate match section or badge. English and Amharic typo fixtures
are verified; this is spelling tolerance, not translation or semantic search.
Exact results remain complete. Indexed probes and per-business offering expansion
are bounded, with at most 100 approximate products and 100 approximate businesses.
Filters and public visibility apply before admission. Current text is indexed
directly, so edits require no synchronization service. Schema 48 adds pg_trgm,
fuzzystrmatch and four expression indexes; backups retain extension dependencies.
Operational and quality evidence is in docs/SUQPAGE-RELEASE-2026-09-21.md (S21).

Suqpage’s directory must scale without dumping every tenant onto the page by default.

Default behavior:

- load the combined geographic map with All categories selected; no chooser is required;
- selecting a category, including All categories, opens its paginated results;
  list ranking remains independent of sponsorship;
- de-duplicate businesses with more than one industry membership and keep the
  Daily Featured weekday industry independent from that map filter;
- provide live search plus simple Industry controls;
- show five-row category- or query-driven product/service result pages in the optional
  left drawer over the persistent map on desktop and phones. Product results link
  directly to the selected product; query changes retain map center/zoom;
- after two characters, provide at most six de-duplicated, public-eligible
  Suqpage page, published-offering, and reviewed-place suggestions scoped to the
  active industry and place. Hide duplicate autocomplete once full results appear;
- keep search and compact category/location icon buttons in one shared top row,
  with the results toggle at far left, on web and native. Filter menus support
  multiple clearable categories and multiple clearable cities/regions. The results panel places
  a Products & services heading above one offering-only list, and fixes page controls
  below the scrollable rows. Offering-only results are deployed on web and included in the internal Android APK;
- hide product results without clearing filters; search/filter controls stay
  available over the map, hidden list content is inert, Escape returns focus to
  the results opener, and reduced-motion preferences disable sliding;
- support business name, handle, product, industry, and relevant description search;
- search matches all meaningful query terms, in any order,
  across one offering and its business name/handle/published About/public location.
  Case-insensitive matching handles Unicode, Latin accents, separator punctuation
  and simple English singular/plural alternatives. Common request words are ignored
  when substantive terms remain. Literal wildcard escaping, exact/prefix title
  ranking, eligibility and five-row backend pagination remain (BE-040/BE-041).
  Query-only links open All categories results. Valid place filters survive zero
  matches without broadening geography. One-character queries can be submitted; punctuation-only input never expands to
  all listings. Delayed responses preserve newer typing and Back restores the query.
  PostgreSQL evaluates bounded term groups and count queries omit sorting; it does
  not translate queries or analyze images/videos;
- the deployed BE-040 ranking correction prefers the original meaningful
  words anywhere in an offering title over description-only or plural-alternative
  matches, after exact-title/whole-title-prefix matches. Thus `gras` puts Farm
  Grass with Dirt ahead of grain matches. Counts, eligibility and five-row SQL
  pagination remain unchanged;
- keep reviewed production-scale metadata
  available to authorized administrators without exposing it as a public filter;
- keep live search, available-location filtering, and zoom/center
  controls within one discovery workbench; progressively disclose industry and
  place in the same optional drawer on phones and keep map navigation on the map;
- ignore legacy public `scale` query state so no invisible filter narrows results;
- ensure mobile usability and keyboard accessibility.

Local FE-021/FE-053 shop markers have orange bodies, thin continuous white rims and 11px bold
orange business names on cream plates. Selection changes the nameplate to orange
with white text. Cluster/nearby/badge styling remains unchanged. Counts and
live/featured authority, coordinate anchors, clustering,
selection/zoom and page previews remain unchanged. Full business names stay in
accessible labels while visible names wrap within the compact marker width.

---

## 11. Passwordless account entry and business onboarding

FE-064/BE-052 deploys an owner-authorized, server-bound password
exception for one ordinary marked demo owner used by store reviewers. Normal users
retain email codes. Exact immutable UUID/email, current client/demo/tenant authority
and real provider authentication are checked before returning a session. Role or
identity changes during authentication revoke/refuse it. Local Supabase/PostgreSQL,
web-cookie/native-browser and five-language focused checks pass. Production
provisioning, exact server-only binding and real web/native API sessions pass;
the new Android binary and Play-delivered verification remain pending.

The FE-063/BE-051 deployed web/API lets guests report or block a public business
without signing in. Its browser/installation preference does not change account
authority or private owner previews. Normal email-code onboarding is unchanged;
the restricted Google Play reviewer exception is deployed on the web/API. Native UI
changes require the next admitted binary; older APKs do not gain them automatically.

The FE-059/BE-047 local candidate requires a canonical Business city on the same
initial account/business/handle screen. Native places the city/town search beside
Business name before category choices on both setup routes. Missing/forged cities fail before writes;
chosen-city area anchors and classification are prepared atomically, but the rich
sample page remains private until Publish. Web/native selection invalidates when
the search text changes. Existing businesses and invitation defaults are preserved.

FE-061/BE-049 locally chooses a complete editable example pack from each of the
eight setup categories in the same transaction: category photos/copy and one
admitted example video for cover and offerings, using the chosen city in sample
copy. Existing edited pages are never generally backfilled. Other products &
services keeps its declared category/city without a nonexistent public-industry
tag; after publication it participates in All-category map and text search with
neutral category presentation, rather than being relabeled Electronics.

Suqpage uses one identity-first entry surface for sign-in and account creation.
The visitor enters an email and six-digit one-time code. Passwords are not requested in the launch
flow. Existing linked users continue to their permitted dashboard; verified but
unlinked identities continue to protected business setup. Login and setup resolve
identity at request time, including when production is built without Auth settings;
reopening either route cannot freeze an anonymous redirect (DEP-033).

The owner approved an email-only production launch on 2026-09-14. Email-code
entry is required. The email-only policy also blocks Google initiation regardless
of retained environment flags, and local provisioning leaves Google disabled.
Existing account identities and sessions are preserved. All six Auth email types
and seven security notification templates have repository-owned Suqpage branding;
notification enablement and verified sender addresses remain unchanged. Hosted
template/sender-display application requires the exact DEP-029 reviewed plan.
Password recovery email points back to email-code entry without a password-reset UI.
Email-only access also applies to administrator-created staff and invitation
acceptance. Neither collects a password; invitation acceptance
continues to code sign-in and grants no session itself. Managed password actions
are unavailable.
No local OAuth or SMTP credentials are copied to Production for this release.

FE-055 provides a deployed web Delete account entry and a native entry in the internal APK
account settings and a public `/account-deletion` page. It exposes the existing email
request channel with identity-verification instructions; opening the composer
does not submit a request or delete data. Native Account includes it before
business setup. BE-053 supplies a locally rehearsed operator recipe and runbook for verified
ordinary owners. Each real deletion requires a separate verified request, exact
UUID/email/tenant plan, recoverable backup and approval. Auth is removed and
verified before its application binding, preventing an old token from restarting
setup; app data, alert devices and associated uploads are then erased and verified.
Shared uploads/other tenants are preserved. Staff/shared tenants/unexpected
references and provider failures require separate review. This is manual
fulfilment, not automatic deletion or completed store-policy approval.

The Suqpage namespace preserves existing account emails and Auth links. DEP-041's
explicitly authorized demo-email correction is separate: only admitted fictional
accounts change email, existing provider UUIDs stay intact, and previously unlinked
demo accounts gain one identity link. Real account emails remain unchanged. Legacy
local session cookies remain readable through the same authorization checks; new
cookies use Suqpage names and logout revokes both local token names (BE-036).

The deployed web and internal Android setup combines owner name, verified-email display,
private phone, business name, chosen handle, category and consent on one screen.
Availability is debounced/bounded with stale-response and failure protection;
server signup atomically claims the address and creates the complete private
starter. Legacy callers without a handle retain bounded automatic generation.
New pages start at Default; color selection belongs in Page with its full preview.
Signup opens `/dashboard/page-editor?view=preview` or `/owner/page?view=preview`.
Unpublished owner pages show the rich sample first, with Edit available; no media
upload or separate initializer is needed. Actual first publication remains guarded.
Web source 6c27025 and replacement internal Android build 9bcabbdb are published
and verified within the limits recorded in DEP-042 and the S69/S70 release record.

Owners edit their handle in Page editing (3–60 English letters, digits and
internal hyphens). Authenticated bounded availability checks expose no account
details. The first change is immediate, then changes are limited to one every
30 days under a database row lock. Unchanged saves consume no allowance. A
support link is shown during the interval; platform administrators can override
with an audited reason. Current and retired addresses stay reserved to the same
business; old public links redirect to the current address with product/query
parameters preserved and privacy enforced. Existing addresses are unchanged.
This handle lifecycle is deployed; subsequent schema-58 rollout preserves existing handles and accounts.


Requirements controlled by `FE-038`, `BE-031`, and `DEP-028`:

- use bounded JSON, exact-origin checks, privacy-preserving IP/email rate limits,
  generic OTP responses, and managed Supabase identity;
- derive provider UUID and email only from the verified server-side session;
- commit the draft tenant, owner, access profile, immutable identity link, and
  private onboarding profile in one transaction or roll back all of them;
  FE-046/BE-039 includes complete private starter content in that same
  transaction for signup and standalone invitations;
- reject browser-supplied identity, role, tenant, publication, location,
  industry, featured, media, or password authority;
- do not create a page project automatically during account setup;
- keep the draft absent from public page, map, featured, and Daily Featured
  surfaces until exact authorized publication;
- retain old password records and invitation infrastructure only as bounded
  rollback compatibility, never as the public launch entry experience.

---

## 12. Fulfillment boundary

Suqpage does not book, quote, dispatch, or track delivery. Businesses and
customers confirm payment, collection, shipping, returns, and fulfillment
directly after an inquiry. No workspace may expose a logistics provider,
delivery request, delivery status, or simulated fulfillment capability.

The former demonstration routes remain retired and return the normal not-found
response. Dormant legacy tables may remain through the data-preserving rollback
window, but application code must not read or mutate them.

---

## 13. User roles and standard page workspaces

The deployed FE-063/BE-051 Reports queue is web-only for support-scoped staff and
administrators/operations. Staff can claim work, managers can assign it, and
version checks prevent overwriting another decision. Mark resolved requires the
reported content to be removed/unpublished/suspended using existing authorized
catalog controls; Dismiss records a no-violation decision. Transport staff and
business owners cannot read this queue. It does not open a guest support chat.

Local S91 attention covers owner inquiries/support replies, matching staff waiting
work, assignment/reassignment, public replies and ended/reopened cases. Visitors
receive assignment and a separate first-join event, then unread public replies.
Opening/refreshing a chat never establishes Read: only explicit acknowledgement of
an incoming visible message does. Managers inspecting an agent's case do not
establish that agent's read/join. Private transport notes remain private.


The access-profile layer distinguishes platform administrator, operations manager,
team member and client. Session identity and tenant scope remain server-authoritative.

### Administrator

The local FE-026 staff workspace keeps Business support, Transport and Staff as
stable destinations. The admin menu remains available when a business workspace
is selected, and its logo returns to Overview. Scoped agents see their own queue
and account utilities. Staff owns workload/availability settings; the current
queue or Staff area stays highlighted on its detail screens. Inbox search, status
and pagination survive conversation actions and back links. Navigation hints
never grant queue or tenant access.

Administrators manage business moderation, staff assignments, marketplace
visibility, sponsorship, Daily Featured schedules and support. They can
invite a private business and suspend or restore established visibility. Page and
location approval queues/actions are retired; historical records remain. Private
page editing and draft media access still require current owner assistance consent.
Business details edits operational identity,
notification, live and sharing settings; public contacts link to the consented page
editor. Legacy social values are preserved. Staff tables omit retired page-review
counts, and status guidance distinguishes staff drafts from owner live Save.

### Owner (client)

Verified signup or an invitation creates a complete private sample workspace.
New signup opens the filled page preview automatically. Both web and native first setup
collect account/business details and the chosen handle together, then expose
address edits in Page on the deployed version. The FE-056 local candidate groups
page/account/business/handle editors under Profile, with separate edit/save/return
screens and authoritative visits/inquiry/offering counts. Its first address change is immediate and later
changes have a 30-day interval (support exceptions require an audited administrator).
Owners replace examples, save business details/location, edit their page and
products/services, then Publish directly when at least one offering is listed.
FE-056 locally exposes Publish beside Edit above the private preview's cover.
It opens current server readiness with links to missing details and blocks
confirmation until ready. A changed draft is refreshed for another review;
publication conflicts/errors preserve the preview and confirmation for recovery.
Subsequent page Save updates the live publication atomically; stale/foreign writes
and self-reactivation of suspended businesses are rejected. Private account
contacts remain separate from public page contacts. Owners can restore a retained
publication, revoke assistance, read inquiries, use support, manage account security
and view aggregate visits. Categories remain available to authorized staff without cluttering owner navigation. Existing catalog IDs, options, inquiry
snapshots and tenant boundaries remain compatible. The S27 local editor adds
ordered photos/video links and resets uploaded-file state to saved references
after a successful save; later description edits reuse those saved images.

The designated main-admin identity is verified and linked in local and production,
with no business-owner association; existing business content and Auth identity
are preserved. Local S88 staff creation offers Support agent and Transport agent,
stored as team_member plus the corresponding queue scope. New agents are enabled
with capacity three; incompatible open cases block role changes. Scoped agents
have their queue as the workspace and no business/product/design authority.
Legacy generic staff/operator identities are retained with Queue controls matching
their actual access profile. New role controls show full names on phones and
creation filters immediately to the created identity. Queue agents cannot inherit
private-page/media authority from old business assignments; page writes fence the
current profile and scope even after an earlier principal was read. Missing access
profiles fail closed instead of falling back to legacy admin authority. These UI changes are local
until coordinated rollout (FE-026/BE-018).

Business plans, subscriptions, renewals and payment recording are retired in the
local S89 candidate (FE-018/BE-017). Transport arrangement is Suqpage's only revenue
service. Product prices and aggregate visit statistics remain. Old renewal URLs
redirect to the authorized workspace; historical private financial rows are kept.
Hosted retirement still requires the web and migration rollout.

### Operations managers and team members

Operations managers can open business workspaces, create invitations, maintain
products with a service note, assist with consented page drafts, operate inquiries,
manage support assignments. Business staff assignment
remains an administrator action. Team members only see actively assigned businesses;
page editing also requires current owner consent. Staff Save never publishes on
behalf of the owner. Support-agent settings enable Business support, Transport dispatch or All requests
and set a shared open-case limit. Team members see eligible waiting requests and
their own assigned history; managers see both queues. Assignment and capacity checks
are transactional across concurrent workers. Staff can claim, reply, close and
reopen authorized cases; managers can reassign open cases and inspect assignment
history. Assigned transport dispatchers and managers choose Reply for a
visitor-facing message or Internal note for private work. Existing staff messages
remain private; only explicit new replies are shared. The transport queue has Active,
Chat history (ended but unresolved), and Resolved lists with server pagination and
search by requester/name, phone or reference. Intake summaries appear in the list
and full original intake/contact in the case. Ended and resolved transport and historical buying cases
accept private follow-up notes, but public replies require reopening. Mark resolved
closes any active chat, releases capacity, and records the staff decision; visitor
End chat never marks a request resolved. Historical transport cases
retain private notes and audited company handoffs. Unassigned
staff cannot reply, add notes, close or route a waiting request before
claiming it. Visitor messages contribute to the staff unread count.
No live role uses custom service-request assignments, revision projects or page
approval queues.

### Public customer

Visitors browse category/search results in five-row backend pages in the optional map drawer,
open shareable products, choose relevant options and inquire about one product or
an independently saved group. Configured app handoffs and copy need no reply-phone
form; Send on Suqpage reveals that field and confirms canonical inbox persistence.
Only active businesses, published products and approved discovery geography enter
public projections. Account phone/email never supply public contacts implicitly.

---

Publication also applies pending saved location/category setup atomically, so a
populated starter does not need an extra unchanged Business details Save before
search can find it. Already-applied admin placements/exclusions are preserved.

Owner business setup at `/dashboard/business` saves the name/logo, category and
public location immediately without staff approval. City/town search resolves one
of 781 admitted place records server-side. Area mode stores the public place
anchor separately, removes exact storefront coordinates and uses a coarse public
centroid. Exact storefront coordinates require explicit owner choice; the GPS
button fills the form and Save applies it. Unknown manually typed places save text
but cannot place a pin until a known place is selected. Saving cannot remove an
administrator exclusion or suspension. City markers receive stable display-only
offsets within 1.5 km of the public anchor and are labelled approximate; exact GPS
and unclassified legacy points stay unchanged (FE-048/BE-041). No external geocoder
is used. Public contacts remain in the page editor and account contacts in settings.

## 14. Retired custom-page workflow and compatibility

FE-042/BE-033 and ADR-0019 retire custom-page request intake, clarification,
request assignment, revision import/edit/review/publish, recipe/blueprint studios,
and dashboard design-library/SDK features. Their pages, APIs and server actions
are removed; retired route prefixes return 404 for reads and mutations. Navigation,
attention counts and workspace actions use the standard page lifecycle.

Historical service requests, revisions, events, media and catalog versions remain
preserved. Compatible catalog snapshot validators/readers are retained where current
product audit/recovery needs them. They do not expose a live custom-design workflow.
Account signup and standalone invitations remain supported and create no service
request. Redeeming an older valid account invitation does not mutate its historical
request record. A destructive historical-data purge is outside this transition.

The shared BusinessProfile renderer consumes canonical products and an optional
published owner profile. Customer industry never chooses a custom page layout.
The editor is enabled by default; an explicit SUQPAGE_OWNER_EDITOR_ENABLED=0 is an
operational disable switch, not a route back to the retired workflow.

---

## 15. Current technical architecture

The local native build configuration uses one permanent application name Suqpage
and Android package com.suqpage.app for development, internal APK and store builds.
Preview is a distribution/environment profile, not a separately named application.
The canonical Firebase Android registration is shared by hosted profiles; account
and chat data remain PostgreSQL/Supabase-owned.
Hosted workers require an explicit reviewed data target and pin its API/Auth
origins plus the Expo project. Both current hosted profiles target production;
an internal distribution profile does not isolate live customer data. Canonical
Firebase client validation pins the project ID/number/package and rejects private
credential material. Private sending credentials remain provider-managed.

S91 adds typed notification/read contracts, transactional private PostgreSQL events,
indexed unread counts, bounded feeds and leased provider delivery. Existing live
chat still polls; it does not require a hosted Supabase Realtime change. Optional
Web Push and Expo Push/FCM adapters have bounded failures; a minute Netlify worker
handles retries and provider handoff receipts. Those receipts never mean human
Read. Production Web Push/Expo capability configuration and scheduled execution
are verified; actual browser/phone permission and OS delivery still need evidence.


S54 public Market adapters select the existing product/service projection before
counting and paging; legacy result-type URLs are accepted but no longer control
public result kinds. Internal discovery type support remains compatible. Business
map data and filters remain independent of the product page number. No schema change.

The repository now has npm workspaces for `apps/mobile` (Expo/React Native) and
`packages/contracts`, while Next.js remains at the root with unchanged deployment
paths. FE-053 / BE-044 / DEP-042 govern the native candidate under ADR-0023.
The versioned web API is deployed and verified in S61. Native
visitor pages and business-owner screens use versioned `/api/mobile/v1` adapters;
private calls verify Supabase bearer identity and reload tenant/role authority.
Admin/staff management stays on the web. Device sessions use SecureStore; the
browser preview keeps sessions in memory. Native first signup opens the saved
private starter preview using the existing owner-home projection; no second
initializer or client-side signup authority exists. PostgreSQL remains server-only.
FE-061/BE-049 use a pure category example catalog and a server-only persisted
category lookup for new-offering defaults. OwnerHome carries the admitted default
to the native editor; both editors and persistence use existing media contracts.
No provider request occurs in account creation, and no schema is added.

FE-056 locally fixes Android image uploads using
SDK File multipart, and private-image display using current authenticated fetch
and ephemeral cache files removed on view/account change; bearer tokens never
enter image URLs or the native Image loader. FE-054
shares a pure validated accent/palette between clients and server; optional native
profile/shop DTO fields carry the business choice through existing save contracts.

The native app follows the phone web hierarchy: compact brand/locale
header, a full map with a sliding filter/result drawer, Featured and showroom
grids. The FE-056 local candidate uses Market/Featured/Account for guests and adds
Inquiries only for signed-in linked owners, with one bottom bar and a Profile hub.
FE-060 embeds four public video providers inside isolated native WebView/browser
iframe adapters, with bounded failure/retry and no external video handoff. Owners
save these links directly; historical reviews remain separate. The owner has authorized the workflow audit and tester-build gates;
available honey-demo playback has installed native evidence; unavailable external
videos retain bounded retry and physical-phone/fullscreen checks remain explicit.

The S51 preview shares a small React sponsor-timing hook between web/native;
visibility, motion preferences and rendering remain client adapters. The preview
also shares typed DTOs and pure rules/catalogs, with separate native and
web map/rendering adapters. Custom web showrooms remain authoritative and linked
from native catalog views. Focused API, browser and JavaScript export evidence is
recorded in S49 and `docs/MOBILE-TESTING.md`. The compatible API and internal Android APK are now published. Local owner
workflows and signed-emulator checks have evidence; physical-phone signoff and
iOS/Google Play remain separate. The native-toolchain audit still fails under
the owner-approved, consumed single-artifact exception. Moving Next.js to apps/web remains a separate migration.

Planned Google Play distribution is tracked in draft DEP-044 / checklist S99.
The owner reports a personal account created after 2023-11-13 and has supplied
the created app's Console dashboard. Google now independently verifies selected
developer/package and app-only Admin access; Expo project/current signer match.
The owner-approved official CLI connects the exact supplied EAS Submit key and
independent readback confirms preserved FCM and canonical/legacy signing. Console
setup/actual Play signing and release readiness remain pending; see
docs/GOOGLE-PLAY-CONNECTION.md. Credential connection does not publish/build an app.
Current production AAB/internal-draft profiles are preparation, not a store release.
Google's API verifies the Console title SuqPage/en-US, saved English/Amharic
store text, selected public support contact and seven uploaded images. Every
release track and APK/bundle list remains empty; metadata review is not app
publication or Google approval. Existing-key Play signing,
new AAB admission/build and actual Play/phone checks precede reviewed distribution.
The required 12-testers/14-day closed test and production-access application remain
external rollout steps. Regular product authentication remains email-code based.
FE-063/BE-051 implement deployed web/API reporting/blocking through pure commands,
a private PostgreSQL report port and web/native adapters; the new native binary
is still pending. Discovery exclusions run before counts, fuzzy candidate
limits and pagination and vary the public cache. Native preferences use bounded
per-business device storage; no new SDK or managed provider is added. Local
focused evidence, delegated visual acceptance and complete gates pass; committed
web/schema/API rollout is verified. New Android/Play rollout remains pending.

S50 adds scoped owner support attachments, business-logo upload/removal, inquiry
option snapshots and corrected phone/email contact actions to the local candidate.
Those API paths have real isolated PostgreSQL regression evidence. Expo project
`@falmatad/suqpage` and preview signing are configured. The versioned live API
rollout and the latest web source 6c27025 are verified. Replacement internal APK
9bcabbdb from that source is finished, signed and installed; it supersedes S67
and fixes its blank owned SVG media. See docs/SUQPAGE-S69-S70-RELEASE-2026-10-06.md.
The FE-053/DEP-042 Android app uses native MapLibre with OSM raster tiles;
focused type/projection/export checks, Android native compilation and emulator
first-render/drawer checks pass. Release behavior/security checks pass; physical
phone checks remain open and the native audit exception is recorded explicitly.
The released S69 Photo correction uses the installed SVG renderer only for strict
repository-owned static seed SVG paths, with a shop-icon failure fallback. Public
SVG fetches carry no Auth header; web/raster/private-image adapters stay unchanged.
The corrected development-client logo was owner-approved; the final signed APK
also renders it. Source/archive/signature/runtime/OS-domain checks are verified.
DEP-042 records the consumed exception and remaining manual device/store limits.
The internal Android app uses storefront/name markers, numbered clusters, nearby
lists and public live/featured badges matching the web map. Native marker selection
opens the existing preview; scope changes clear stale selection. The authenticated
page preview includes the edited cover/story/contacts and offering galleries.
The Android app maps canonical suqpage.com public store/product,
Market, Featured, About and account links into Expo Router. Market URL scopes
restore on initial and subsequent opens; admin/API/Auth callbacks are not claimed.
Only the verified Expo preview signing identity has Android HTTPS autoVerify
filters. Public /.well-known/assetlinks.json metadata is published and verified
on suqpage.com. The latest APK independently verifies Android OS App Links;
cold Market and warm product/store/Featured HTTPS navigation pass. Older APKs
do not gain new manifest filters from a website update. iOS association
awaits verified Apple Team identity.
External browsing uses the installed Expo WebBrowser adapter (Custom Tabs on
Android, Safari sheet on iOS); it sends no Suqpage bearer tokens and injects no
JavaScript into third-party sites. The validated URL policy rejects executable
schemes, credential-bearing URLs and control characters. Only the configured
local development API origin may use HTTP; merchant links require HTTPS.
Expo browser preview opens separate isolated windows/tabs. Android Custom Tab opening/return has installed emulator evidence. Physical
phone and installed-social-app handoff checks remain required; iOS is unverified.
Owner route navigation, photo-backed offering save/hide, location confirmation and
first publication have local browser persistence evidence. Read and write rate
budgets are separate, and explicit native listing state saves preserve advanced
metadata. Browser preview retains Leaflet. No Google Maps key or Google Cloud setup is
required. The owner permits SDK-internal tile caching (including SQLite); all
application persistence stays in PostgreSQL. Native testing needs a rebuilt app. Preview and
production builds share com.suqpage.app and require explicit hosted public
configuration. See `docs/MOBILE-RELEASE-AUDIT.md` and `docs/MOBILE-DISTRIBUTION.md`.

Canonical configuration keys use `SUQPAGE_*` and `NEXT_PUBLIC_SUQPAGE_*`. The
platform environment adapter accepts the earlier namespace only as a read fallback;
explicit canonical settings, including empty or disabled values, win. The Auth
proxy uses this same boundary, and server-side provider URL/key values are read
at runtime so empty build-time settings cannot override them (DEP-033). New public
assets and persisted browser state use Suqpage names. Exact asset rewrites (with
matching Netlify CDN rules at the static publish root) and
tenant-scoped cart/navigation migration preserve existing links and saved inquiries.

Current controlled-launch stack:

```text
Next.js 16
React 19
TypeScript
Node.js 24.18.1 LTS
Supabase PostgreSQL 17
Supabase Auth with application-owned authorization
Private Supabase Storage through the provider-neutral media port
Sharp for verified image processing
Server-rendered routes and server actions
```

Netlify publication readiness includes a Linux/x64/glibc image transform using
the exact generated function archive (DEP-026), in addition to application gates
and privacy scans. A build on another OS does not prove native-library readiness.

Important directories:

```text
app/                  Next.js routes, pages, APIs, and dashboard
components/           Shared UI and showroom application logic
components/showroom/bank/  Reviewed component bank, registry, tokens, and laboratory
lib/                  Authentication, database, security, media, inquiries, support
showroom-sdk/         retained catalog/design compatibility tools; no live request UI
scripts/              Setup, migration, backup, restore, preflight, release tests
data/                 Ignored local media; no application database files
```

Important commands:

```bash
npm ci
npm run local:supabase:start
npm run local:supabase:bootstrap
npm run dev:local
npm run typecheck
npm run validate:designs
npm run test:bank
npm run test:experience
npm run test
npm run build
npm run test:http
npm run release
npm run migrate
npm run backup
npm run restore -- --from=/absolute/backup/path
npm start
```

The authoritative release gate is:

```bash
npm run release
```

Do not claim launch readiness when that command or equivalent individual checks have not passed.

---

S88 mobile session admission verifies current server role before admitting
owner screens, outside the provider Auth callback. All authenticated native
boundaries reject staff from fresh authority; staff denial clears mobile owner
session/private UI only, leaving separate web sign-in intact. Validation outages
allow retry without a second OTP and do not admit an unverified session. The
updated API and canonical APK are released; installed public checks pass and
physical/authenticated phone checks remain (BE-044/FE-053).

## 16. Security requirements

Deployed BE-051 reports accept only canonical public targets and bounded details.
Concurrent/retried submission is idempotent, changed replay conflicts, and salted
IP hashes enforce a rate limit without storing raw IPs. Responses expose only a
receipt/duplicate flag. Fresh server role/assignment/version checks protect staff
decisions, and anon/authenticated roles cannot read the table or use its sequence.
Blocking is a browsing preference and does not make public content confidential.

S91 feeds, subscription changes, deliveries and confirmed-message reads recheck
current tenant/queue/visitor-token authority. Native staff stays denied. Safe OS
payloads carry generic localized event text and internal destinations, never
contacts, transcript or carrier details. Connected sign-out revokes recipient
subscriptions; offline native logout clears local access immediately but cannot
synchronously revoke server push. Turning notifications off currently affects all
bindings for that recipient. No immediate offline revocation is promised.


Security requirements are product requirements, not optional cleanup.

Native release admission uses actual SDK signature/manifest inspection with
bounded argument-array commands. Unknown certificate pins, wrong identity,
debuggable APKs, extra signers and non-increasing versions fail closed. Credential
sources are excluded from app archives; no private FCM, account or signing key
belongs in client/runtime configuration. Provider administrators and arbitrary
shell commands remain outside repository enforcement.

### Authentication and sessions

- Never expose seeded credentials in public UI.
- Never expose, collect, or transmit a password in normal launch account-entry or
  business onboarding. The owner-authorized FE-064/BE-052 deployed server exception binds
  one store-review demo identity; its password/session never belongs in public
  builds, static UI constants or logs, and it never grants staff/other-tenant access.
- Supabase Auth owns managed email-OTP/OAuth session validity in normal local,
  browser-acceptance, Preview, and Production runtimes; application-owned opaque
  sessions remain compatibility and bounded rollback infrastructure only.
- A provider session grants no access until its immutable UUID maps to one
  Suqpage user. Roles, tenant bindings, capabilities, and suspension always
  come from Suqpage tables, never provider metadata.
- The account page shows the existing verified sign-in email and a separate private,
  unverified account phone. All roles can update or clear only their own phone;
  posted user IDs/email cannot change identity or another account. Signup records
  the required account phone privately. Under FE-046/BE-039, new
  private pages receive explicitly fictional public phone/email/WhatsApp examples
  independent of that identity, plus all other editable presentation defaults.
  Existing real accounts and intentionally cleared fields are not backfilled. Account phone is not a sign-in factor and is
  excluded from session-user and public catalog data (FE-040/BE-032, migration 41).
- Do not use a hard-coded fallback session secret.
- Inquiry-status mutations require a matching inquiry/business pair and commit
  the success audit with the change. Missing/foreign records produce an error,
  never a saved notice; operations permissions remain unchanged.
- Revoke provider sessions after suspected compromise, suspension, or explicit
  administrative recovery.
- Rate-limit OTP request, OTP verification, OAuth callback, and onboarding
  attempts without storing raw identity values in rate-limit keys or logs.

### Tenant isolation

- Every page, review and customer-operation read or mutation must be scoped
  by the actor’s explicit role and authorized business relationship. Retained
  historical request/revision readers preserve their original tenant boundary.
- Validate every referenced collection, category, product, inquiry, request, and support record belongs to the same tenant.
- Keep database constraints or triggers as defense in depth.
- Add tests for cross-tenant reads and writes.
- Administrators must use explicit privileged paths rather than accidental tenant bypasses.

### Public inquiries

- Validate products from the database.
- Require the product to belong to the target business.
- Require the product to be published and inquiry-eligible.
- Validate options against the product’s current option groups and values.
- Bound quantity-intent length, item count, field lengths, and body size.
- Use idempotency and duplicate suppression.
- Rate-limit abuse.
- Do not trust client-provided product names or snapshots as authority.

### Retired logistics routes

- Former Delivery and Malikt pages and APIs return 404.
- Do not restore a logistics adapter, provider selector, or delivery mutation
  without a new accepted feature spec and ADR.
- Dormant legacy rows are not application authority and are never exposed.

### Media uploads

- Accept only verified JPEG, PNG, and WebP content.
- Verify file signatures and decoded content.
- Enforce file-size and pixel-dimension limits.
- Re-encode with Sharp.
- Remove metadata where possible.
- Generate server-controlled filenames.
- Store mutable uploads outside the Next.js build-time public directory through
  the configured asynchronous media-storage port.
- Isolated local development and browser-acceptance stacks plus separate remote
  Preview and Production projects use private Supabase Storage buckets through
  the provider-neutral media port. Filesystem storage is retained only for
  compatibility fixtures and bounded rollback. Service credentials are
  server-only and all public/private reads remain behind Suqpage routes.
- Remote object-storage operations use a bounded configurable deadline and
  bounded response reads. A database-derived manifest reconciles every retained
  public and private reference without printing object keys or provider data.
- Preserve stable `/media/<opaque-key>` references across providers. Historical
  request attachments remain retained for recovery; their retired download APIs
  are unavailable. Object-storage migration is copy-only,
  hash-verified, repeatable, and never deletes local sources or rewrites the
  database.
- Set `nosniff` and safe content types.
- Never trust file extensions or browser `accept` attributes.

### Public status

- Only active businesses may render publicly.
- Drafts require authenticated preview.
- Suspended businesses must not render publicly.

### Privacy and operations

- Business-profile contact fields are explicitly public, owner-published values.
  Never infer them from notification email, account identity or private onboarding
  phone/email. Canonical public email/phone and existing public
  WhatsApp/Telegram/TikTok handles supply fallback only when no published contact
  object exists; an explicitly empty published object stays empty. Profile contact editing
  does not rewrite notification or structured-inquiry destinations. Public catalog
  serialization blanks the private notification email; inquiry delivery resolves
  its destination on the server.

- Next.js Server Actions and custom browser mutation APIs derive trusted origins
  from one exact-origin policy. Development admits only the request/canonical
  origins, explicitly configured origins, localhost, and the current
  Codespaces HTTPS forwarding hosts; production admits only request/canonical
  and explicitly configured origins. Never expand trust from a forwarded-host
  header, hostname lookalike, or wildcard.
- Do not log full customer contact information unnecessarily.
- Keep `.env`, database files, credential files, uploads, and backups out of Git and distributable ZIPs.
- Maintain privacy and terms pages when customer data is collected.
- Use HTTPS in production.
- Include security headers.
- Run dependency audits.
- Maintain backups and test restores.

Read `SECURITY.md` before handling a suspected vulnerability.

---

The S86 local one-time map correction separates 21 marked Addis area demos across
real city neighborhoods, with minimum display spacing 2.23km after the existing
offset projection. Exact/unmarked/other-city data and content are unchanged. Both
web and Expo actual maps retain 21 shops/84 offerings and selectable previews.
Individual 44px shop hitboxes do not intercept neighboring shops; counted marker
styles and behavior stay original. Production demo coordinates remain unchanged.

## 17. Data, migrations, and deployment boundary

Local and hosted migration 63 add the private listing-report table after protected
backups and an actual isolated restore rehearsal. The original production-table
fingerprints and private table/sequence permissions are verified. Uncertain hosted outcomes require a pause, independent
readback and exact owner-approved recovery; the migration's verified recovery is
recorded in docs/GOOGLE-PLAY-RELEASE.md. The compatible source ea1b452
web/API is published before the new native build containing report actions.
Rollback preserves reports and privacy rather than dropping records. Exact
production reviewer provisioning/binding and live web/native API sessions pass;
S99 Android admission, Play signing/distribution and phone checks remain pending.

Internal APK and store AAB profiles use the same permanent native identity and
remote version counter, incrementing version codes for both. Existing released
Preview APKs retain their historical package/signature; the next admitted APK
requires one canonical installation. Before building/publishing it, verify the
canonical signing binding and certificate/domain association independently. Do
not relabel the verified legacy certificate or silently create/replace credentials.
One Firebase Android app is sufficient; no later rename/second registration is
planned. The canonical and preserved legacy association are published. The new
canonical internal APK is built and independently signature/package/version/debug/
privacy inspected; installed public navigation and five-language checks pass.
The S98 existing-key reuse is independently verified for the canonical package,
with legacy signing, FCM and other settings preserved; the owner accepts the
readback after the CLI confirmation timeout. Its verified public certificate is
pinned and published in the verified hosted association. The actual APK matches
that signer, package and version policy; actual Android verifies the canonical
domain. Physical-phone notifications/authenticated workflows remain separate.
`mobile:verify-apk` admits only a
nondebug signed canonical artifact, newer than the selected latest admitted APK,
or an explicitly selected first canonical release. It stores a protected checksum
receipt; inspection-only mode never grants admission. EAS requires committed
source and preserves internal APK versus store AAB; store submission remains
internal draft. A Play-distributed APK requires independent signing/device checks.
Older-version reinstall is not a promised rollback; use a reviewed higher-version
correction and preserve compatibility with installed clients.

Local S91 migrations 61/62 add confirmed read/join columns and private attention,
preferences, subscriptions and delivery tables. Protected local backups and
content-hash readback preserve existing accounts, inquiries, chats and ledgers.
Hosted schema is 62 after protected backup/rehearsal, original-column hash
preservation, private-table permission and runtime-access verification. Reviewed
Web Push/Expo settings are production-only; provider credentials remain protected
and the actual canonical APK is inspected and public emulator flows pass.
Physical-device/authenticated notification checks remain separate (DEP-043).
The owner-supplied canonical Firebase client file is verified and stored in the
selected Expo project's preview/production build environments with the matching
project ID and client-file requirement flag. Protected before-state/source and
metadata/string readback are retained. This build setup does not install the
private FCM sending key or enable server push. The separately supplied sending
key is now uploaded and bound only to the canonical Android FCM slot using the
owner-authorized official CLI method exception; independent public metadata
readback matches exact project/key/client identity. Server capability and web/API
rollout and actual APK admission are verified; real Android notification delivery
remains pending.
The owner has supplied the sending-key source; selected structural checks and
protected recoverable backup pass. Its Expo association is verified without
printing private bytes; its IAM permissions or actual delivery are not claimed
independently verified. Signing, Play, legacy FCM and enhanced-security state
remain unchanged by this credential operation.


S42/schema 56 adds `support_messages.visitor_visible` with a false default.
No historical note is exposed. Apply this additive migration before deploying
live buying replies and retain the column on rollback. S47/schema 57 adds nullable
`support_conversations.resolved_at`, constrained to closed buying requests in deployed schema 58. Local S57 migration 59 extends the same invariant to transport requests. Existing
closed records remain unresolved; staff resolution is explicit and audited. Preflight
requires schema 58 after S48: `support_video_requests` stores private target/source
and review records with server-only access and RLS. Retain these additive columns
and records on rollback; do not restore unrestricted owner video entry.
Production schema 58 and isolated install/preservation tests pass. The protected
backup, restore rehearsal, original-column fingerprints, runtime access and release
gates are recorded in `docs/SUQPAGE-RELEASE-2026-09-27.md`.

DEP-039 adds `products.media_json` at schema 49 for the deployed product gallery.
DEP-040/schema 50 adds a server-only, RLS-enabled reserved-handle registry and
last-change timestamp. Registry uniqueness covers every business insert/handle
update, including invitations. Retained addresses stay reserved across renames.
The first photo/video remain in legacy columns; old records need no backfill.
Retained publication/revision snapshots and reconciliation include every gallery
photo. Hosted schema and publication are verified. Rollback retains additive data
and must preserve private notes, buying cases and staff video review.

Migration 60 retires automatic business subscription creation by removing
its trigger/function. Historical ledger/payment data is preserved and verified;
fresh shops and demo fixtures receive no plans. Hosted migration is verified;
restoring the retired trigger is a separately reviewed mutation.

Schema 48 adds pg_trgm/fuzzystrmatch in the reviewed `extensions` namespace and
four expression GiST indexes. Existing extensions are never relocated implicitly.
Archive backups include both extension definitions; restoration creates their
namespace in the approved empty target. Prior application code remains compatible.

DEP-029 governs production Auth configuration maintenance. The repository's
guarded command pins the production project and HTTPS origin, rejects local and
unknown settings or credential changes, and creates a read-only review plan with
a private provider-returned backup. Apply requires the owner's reviewed digest,
a fresh unchanged remote state, and one narrow write followed by readback.
Readback predicts only existing customization flags for approved nonempty email
subjects/templates; all other metadata and provider fields must stay unchanged.
Credential selection defaults to explicit `SUPABASE_ACCESS_TOKEN`; an opt-in
`--credential-source cli` reads only the default Supabase CLI macOS Keychain
entry, with bounded private subprocess output. No credential fallback occurs.
Version-2 plans bind the selected source and token fingerprint; changed logins
and old unbound plans are rejected. Management tokens never enter plan files.
Hosted configuration pushes and raw-command workarounds are prohibited, including
during incident recovery. Google/SMTP credential changes are separate authorized
owner operations; masked provider secrets are not claimed recoverable from a
configuration snapshot. These controls govern the repository workflow, not an
administrator's full-access shell; management credentials remain outside app
runtimes, builds, and routine CI. No hosted change or cutover is implied by
passing the guard's offline tests.

The controlled MVP uses separate Supabase projects for every executable lane:
an isolated local project for normal development, a disposable local project on
dedicated ports for production-mode browser acceptance, and a managed project for
Production. A hosted Preview requires its own isolated managed project and
credentials before it may be enabled. Every lane applies the same
reviewed PostgreSQL schema and application-owned authorization model and selects
Supabase PostgreSQL, Auth, and private Storage. PostgreSQL is the only executable
database engine in application code, local development, fixtures, CI and deployments
(BE-035, DEP-031, ADR-0020). There is no file-database fallback or copy-through-fixture
bootstrap. Unsupported database settings fail closed. Both `npm run dev` and
`npm run dev:local` load the guarded local runtime file and validate PostgreSQL
and local Auth/Storage before starting. Explicit loopback hostname/port options
set the matching application origin. The local launcher opens Docker
Desktop on macOS when needed, resumes this project's local Supabase services and
waits for PostgreSQL/Auth readiness with bounded timeouts (DEP-027). Existing local
settings are still required. Startup never migrates, seeds, resets or changes
hosted settings. Stopped engines on other operating systems require manual start.

The native schema installs directly into empty PostgreSQL schemas, including taxonomy,
schedule defaults, constraints, sequences and tenant triggers. Existing versioned
schemas use additive/idempotent migrations. Unversioned populated schemas are refused.
Each persistence fixture uses a disposable local PostgreSQL schema; trigger definitions
must remain inside that schema. Demo setup seeds an empty local database and preserves
populated targets. Existing data and protected historical backups are not deleted.

Migration 44 changes the platform support-label default. Migration 45 changes the
subscription creation trigger/default and exact standard plan labels to Suqpage.
Custom plan names, prices, periods, tenant records and account identities remain
intact. Provisioned provider identifiers and immutable backup members are retained
for continuity; `docs/SUQPAGE-NAMING-COMPATIBILITY.md` enumerates every exception
and the guarded hostname/resource changes required to retire them (BE-036/DEP-032).

`docs/POSTGRES-ONLY-RUNBOOK.md` controls current setup and recovery. Database backup
uses protected PostgreSQL custom archives with hashes; restore requires a reviewed
target digest and an empty recovery database. Auth and private Storage have separate
provider backup requirements. Neither a local test nor a digest grants hosted approval.

Hosted Supabase PostgreSQL and Netlify operations are controlled by BE-027,
DEP-023, DEP-026 and DEP-030. The current canonical-domain deployment and private
Storage are verified. Its additive migration preserved original table values,
retained identities and least-privilege runtime access. Deploy Previews and
Production must never share database, Auth, Storage or service-role credentials.
Real hosted email delivery remains an admission check before broad public launch;
canonical-domain DNS, HTTPS, Auth URLs and application origins are verified.

Before broad external rollout or multi-instance production scale, complete:

- production email and notification infrastructure;
- full observability and alerting;
- managed Auth recovery and staff security evidence;
- spatial viewport queries when measured point volume requires them;

PostgreSQL production requires the managed connection URL and private Supabase
Storage. All production
environments require HTTPS. Follow `.env.example`, `README.md`, Docker
configuration, and preflight checks.

---

## 18. Language and localization rules

S91 alert events, sound/notification controls, first-join and Sent/Read labels use
all five supported interface catalogs. Business names and message bodies remain
literal. Notification payload text uses the saved interface preference and never
contains a translated/rephrased customer message.


The Suqpage wordmark remains Latin with a fixed font, weight and spacing in all
five languages. Surrounding interface typography may follow the selected script.
FE-054 picker labels, validation and preview text use these same catalogs; owner
hex values remain literal and business content is not translated.

FE-049 provides shared public and dashboard interface localization for English,
Amharic, Afaan Oromo, Somali and Tigrinya. A validated one-year cookie remembers
the selection while preserving URLs, merchant content and unsaved form/inquiry
state. Only the selected language catalog is loaded; server-only text is excluded
from client messages. Technical terms, legacy/custom-design copy and unknown
provider errors may retain English. Translations have not had native-speaker
review. Arabic/RTL and Afar remain future work. Publication evidence is recorded
in the S25 release document; implemented behavior alone is not a rollout claim.

The local S90 transport launcher and intake use contextual wording in all five
languages, inviting customers to chat with the team for help transporting their
purchase. Non-English chat labels include (Live Chat). Merchant content, intake
fields and conversation behavior remain unchanged;
catalog/layout evidence does not substitute for native-speaker review.

Rules:

- Use short, everyday English throughout public pages and dashboards. Name the
  actual action: add to an inquiry list, view it, or send an inquiry. Use products,
  services and businesses rather than platform jargon. Do not add filler,
  repeated button explanations, internal notes or implementation terminology.
  S63 storefront copy uses local phrasing in each language rather than English
  sentence structure; brands and appropriate technical terms retain English.
  The S67 copy pass clarifies inquiry-list actions, transport labels, video loading
  and retry wording in context. Preserve meaningful privacy/security guidance and merchant-authored content.
- translate interface labels, buttons, help text, status labels, and platform copy;
- do not translate product names;
- do not translate brand names;
- do not translate color names entered by the merchant;
- do not translate sizes, model numbers, storage values, specifications, or option values entered by the merchant;
- preserve a path to future Arabic right-to-left layout;
- allow for long Afaan Oromo strings without layout breakage;
- do not claim a language is complete until all public UI states are translated and tested;
- apply FE-049 to dashboard and public interface text alike; retain English as the default and fallback for unclear terms;
- search preserves Unicode content and matches written terms;
  cross-language semantic matching is not implemented. No managed AI is configured.

---

## 19. UX and accessibility requirements

The local staff workspace uses short queue labels, matching support/transport
icons, wrapping phone tabs and 44px breadcrumb/back targets. Conversation actions
replace the current browser history entry; Back returns to the originating list.
Canonical/denied support links use safe browser replacement with authorized
server-rendered data or a generic unavailable state and inbox fallback, avoiding
the development RSC redirect/profiler failure. No foreign transcript renders
before navigation.

Local S91 uses compact bell counts and a bounded alert list, plus unread activity
on the transport launcher. Mark all read clears authorized alerts through the
returned cursor; it does not read transcripts or future events. Sound/OS permission
is explicit and optional. Closing the nested alert list preserves the chat. Polls
back off and suspend while hidden; in-app attention remains independent of push.


Local FE-056 loading feedback uses compact orange horizontal loops at real
data/auth/map/route/save waits, with static reduced-motion treatment. Native
optional notices/errors/contacts render no raw empty-string children under View;
setup and private-preview captures check actual runtime errors. Owner-menu
authority refreshes on each route change, including initial setup→private preview. FE-060
portrait TikTok/Instagram playback centers one official player over a softly
blurred static cover photo; live video frames are not copied or duplicated.
The local YouTube wrapper sets its sandbox before iframe navigation and accepts
document/playback readiness rather than relying on the control API alone. Loading
timeouts cannot remove a loaded player, while terminal provider errors retain
unavailable/retry behavior. TikTok autoplay-denied is not treated as an unavailable
video. Actual playback is checked separately from deterministic frame fixtures.

Local S58 transport intake keeps route and contact field pairs side by side at
320px and above, with wrapping labels, touch-sized inputs and scroll access to
Start chat in short viewports. Suqpage styling is retained. The owner approved
the S58 layout for release; physical-keyboard/device verification remains separate.
Payload and chat lifecycle remain the S57 contract.

The local S90 launcher uses a prominent question and smaller supporting sentence
that wraps naturally beneath it. The open phone Market drawer retains a compact chat icon with
the complete accessible name; the expanded entry fits 320px screens without
covering search/result controls. Existing palette and focus behavior are retained.

All public pages and dashboards must work on mobile and desktop. FE-054 derives
readable foreground/border roles from custom accents (including white, black and
neon), uses 44px picker controls and preserves platform focus/status semantics.

Minimum expectations:

- no horizontal overflow;
- no overlapping menus, filters, or result panels;
- adequate tap targets;
- visible focus states;
- keyboard-accessible dialogs and drawers; hidden native/browser sheets unmount
  their focus boundary so closing the language picker cannot block field editing;
- product galleries support thumbnails, arrows and touch scrolling, respect
  reduced motion and load video frames only after intentional playback;
- focus trapping and restoration where appropriate;
- semantic buttons and labels;
- recognizable category pictures alongside text; decorative artwork is hidden
  from assistive technology, with accessible category names retained;
- descriptive image alt text;
- readable availability states;
- high-contrast map names and orange shop bodies: normal/selected text meets
  4.5:1 and the fill meets 3:1 against a representative light map background.
  Individual shops use the owner's thin-white-outline trial; groups keep their original style;
- clear loading, success, empty, and failure states;
- no silent network failures;
- no unhandled native-share cancellation errors;
- cart persistence where appropriate;
- the main Suqpage favicon on every route, with business-specific title/sharing metadata;
- business-specific page title, description, canonical URL, and social preview;
- no blank-tab navigation.

Component-bank phone admission additionally requires:

- complete operation at 320–390 CSS pixels;
- controls with at least a 44 CSS-pixel touch block size;
- container-responsive layouts so embedded phone previews exercise real phone
  behavior;
- native scrolling and snapping for deliberate horizontal rails;
- no information or action that depends on hover;
- `prefers-reduced-motion` authority over all nonessential animation;
- scoped decorative layers that cannot cover or capture interaction.

Release admission runs one cross-role browser matrix over public, hosted
showroom, administrator, operations, team-member, and client routes at desktop
and phone widths. It fails on admitted WCAG violations, route or browser
errors, missing primary structure, duplicate IDs, or horizontal page overflow,
and it includes open navigation, filter, preview, product, inquiry, and
workspace-menu states. Automated admission is evidence, not a claim of full
WCAG conformance or a replacement for assistive-technology user testing.

For client sites, visual polish must not come at the expense of inquiry completion.

---

## 20. Product-data accuracy

When adding or updating recognizable branded products, especially current technology:

- verify current product names and major specifications using official manufacturer sources;
- do not rely on memory for current flagship models;
- do not invent features, availability, prices, or model names;
- avoid presenting unverified product claims as facts;
- preserve merchant-provided names exactly when importing their catalog;
- keep product imagery legally and operationally appropriate for the business.

Prices are optional ETB display context and are not required for every Suqpage
catalog. They are merchant- or reviewer-controlled presentation data, not a
charge, quote guarantee, or checkout amount. The platform’s main goal is
structured inquiry, not online checkout.

---

## 21. Standard page operating workflow

1. A verified owner creates a private business account or accepts an individual
   invitation. No custom-page request, public upload or fabricated project is created.
2. The owner replaces starter examples, saves business details and location, then
   edits About, cover/video, public contacts and simple product/service listings.
3. Uploads require scoped authorization. Private media stays private until its
   associated business is active and the offering/cover is public.
4. First Publish validates current draft/revision and at least one listed offering,
   activates the draft business, applies any pending saved location/category and
   retains publication history atomically. No
   staff approval is required; suspension and tenant/version guards remain.
5. Owner location/category Save applies a known public area or explicit storefront
   directly. Discovery still requires an active non-excluded business and listed
   offerings. Unknown areas have no pin. City offsets are display-only.
6. Live owner Save applies page changes atomically and retains history. Staff
   assistance remains draft-only, assigned where required, and revocably consented.
7. Inquiries, support, security and visits remain connected to the same workspace.
   Visual approval, full gates and hosted rollout are distinct from local evidence.

---

The S87 local actual workflow audit passes administrator-created staff and real
HTTP/Supabase/PostgreSQL web/native-preview chats: both-way replies, attachments,
reassignment, capacity, tenant/privacy denial, ended history/contact/follow-up,
resolution, reopening and lost-ack idempotent retry. Case access removed by
reassignment returns to the authorized inbox with a localized generic notice.

All success replies are real; fixtures are removed and production chats untouched.
Physical Android/rebuilt APK and hosted rollout remain separate gates.

## 22. Testing and definition of done

FE-064/BE-052 focused tests prove real local provider password/JWT login, fresh
PostgreSQL owner/demo/role/UUID boundaries, revocation on authority races, bounded
HTTP/origin/rate/no-store behavior, actual web cookies/native-preview sessions,
ordinary email-code entry and five-language 1440/390/320 states. BE-053 rehearses
real local app/Auth/storage erasure, identity-before-binding order, shared media,
other-tenant preservation, plan drift/backup/approval and foreign-key rollback.
Full repository check, clean isolated web release, all 11 browser acceptance
workflows, operations and mobile build contracts pass. Reviewer tests also prove
ordinary page/product editing, publication and public catalog readback. Production
reviewer provisioning/binding and real web/native API sessions now pass. Actual
deletion requests and an installed Play binary remain separate.

FE-063/BE-051 focused tests cover real PostgreSQL/HTTP replay, rate/target/role/
assignment/stale/removal boundaries, discovery/map/count/page/fuzzy/Featured/
sponsor exclusions and private migration grants. Actual local web/native-preview
report/block/reload/unblock/inquiry and staff-removal workflows pass. Desktop and
390/320 captures cover five languages without browser errors or document overflow.
The owner delegates visual acceptance, and the complete local/release gates pass.
Source ea1b452 and production web/schema/API rollout are verified with protected
backup/readback evidence and 21 live checks. Installed Android checks remain
separate; browser previews and an inspected upload archive do not admit an APK.

DEP-042/DEP-043 identity checks cover all build profiles, APK/AAB version settings,
actual Expo public-config resolution and canonical Firebase acceptance with
legacy/foreign/missing-config rejection. The verified canonical association is
published alongside the preserved legacy HTTPS association. These focused checks do not admit
a new binary, credential write or OS notification claim.
Focused single-app safety tests additionally cover pinned target/profile/realm,
nested Firebase-secret rejection, archive exclusions, signature/version/debug
failure cases and bounded SDK parsing. Real inspection of the historical APK
confirms its legacy package/signature separately from mocked SDK tests; canonical
canonical admission rejects that historical artifact because its package is the
legacy preview identity; the new canonical artifact requires actual inspection.

FE-026/FE-019 staff navigation has passing focused type, catalog/spec, safe URL,
isolated PostgreSQL staff/tenant and real local HTTP/browser evidence. The browser
suite covers both agents and admin, page-two search retention through successful
and failed replies, claim/assignment/close/reopen/handoff, direct/denied links,
staff settings, stable business context, drawer focus and all five languages at
1440/390/320. The corrected safe redirect flow has zero browser exceptions;
fixtures are removed afterward. Visual approval, full gates, scoped commit and
web rollout are verified in S98; authenticated hosted-session checks remain separate.

S91 focused gates include `npm run test:attention` (real isolated PostgreSQL
receipt/event/privacy/retry tests and mocked provider/worker contracts) and local
HTTP/browser workflow evidence. `test:attention:visual` requires a selected local
admin and uses disposable labelled accounts. Expo browser evidence is distinct
from installed Android and real foreground/background/closed OS delivery. Specs
remain in progress until visual approval, full gates and coordinated rollout.


S90's focused type/catalog/narrative checks and 13 read-only web/Expo states
pass, including five languages, desktop/phone widths, actual loaded map tiles,
ordered typography, the new transport-team introduction, unchanged intake routing
and compact result-panel mode.
Two short phone intake checks retain paired fields and reachable Start chat.
No request is submitted by those captures. S98 visual approval, full gates and
web/canonical APK rollout are verified; real-phone notification checks remain.

FE-056–FE-061 and BE-045–BE-049 are approved and published on web after
complete gates. Actual canonical APK artifact and public emulator checks pass.
Focused browser fixtures establish
persistence/lifecycle, not provider availability. Actual Android selected-cover
save/re-entry/render, public Facebook/Instagram advancing playback and TikTok
player/media progress have separate private evidence. Physical-phone/fullscreen
checks remain physical-phone steps; web/API and inspected canonical APK
publication are verified in S98.

S81/S82 focused local evidence covers category-specific starter/new-offering
persistence, all eight actual example playbacks, preserved selected-demo media,
and visible private-preview Publish with readiness, stale/denied/failed recovery
and actual local publication. Demo/provider fixtures are distinguished from live
playback. The named Al Haya correction replaces only unchanged developer example
video refs; other edited content stays intact. Review precedes full gates and
coordinated web/API/native rollout; no hosted example correction is implied.

S85 focused evidence covers white-rimmed orange shops, warm labels and normal/selected contrast at
desktop, 390px and 320px on web/Expo, real map selection/preview with no zoom-out,
counted cluster keyboard expansion and restored original group/badge styles.
Cluster/nearby/badge declarations match the original web/native styles. Actual OSM desktop/
phone views were captured separately from controlled cream tiles. Map behavior
and both type checks pass. S98 approved full gates, source commit, web/actual APK
rollout and native map/cluster/shop-preview checks are verified. Physical-phone
checks remain separate; local demo-coordinate corrections are not applied live.

S63 copy uses shared web/native constants and all five locale catalogs. Focused
narrative, localization/content-boundary and type checks precede viewport review;
`capture-storefront-copy.mjs --copy-only` checks customer/owner copy, account entry
and localized metadata. Browser-mobile evidence does not prove a new native APK.
Full release gates and publication follow visual approval.

Web releases use a clean root/shared-contract installation guarded against Expo
and native tooling; the selected full audit includes build dependencies at the
existing severity. Normal monorepo/mobile installs retain the guarded compatibility
adapter and unchanged full native audit. S61 verifies the web check chain, all 11
isolated acceptance workflows, release stages, private backup/migration rehearsal
and exact Linux artifact. The owner approved S62's one-artifact Expo internal-testing exception for the two
documented tooling advisories, then renewed one additional internal APK for the
latest approved source in S67. The audit remains failed/reportable. Signing, APK
inspection and native-device gates remain required; Google Play is deferred. Rollout evidence and
current publication state: `docs/SUQPAGE-RELEASE-2026-10-06.md`.

FE-054 adds `test:storefront-accent` to the full check: validation, 4,096 palette
samples, PostgreSQL signup/save/publication, native projection and tenant/stale/
staff/rollback/legacy/reset regressions. `capture-storefront-accent.mjs` covers
actual web/native-browser mutations; the passwordless acceptance scenario covers
Page-only color selection, save/reload/reset and untinted playing video. The S53
focused capture covers the corrected UI; its revised production acceptance test
is included in the authorized S59 release checks. `test-visual-color.ts` checks 4,096 HSV round trips and
signup-control absence. Native-browser evidence
is not physical-device evidence.

The S49 native preview uses `test:mobile`, `mobile:typecheck`, the web TypeScript
check, `capture-mobile.mjs` and `capture-mobile-alignment.mjs` with local Supabase/PostgreSQL only. `test:mobile:video` and the explicitly provider-mocked `capture-mobile-video.mjs` cover player validation, navigation limits, failure/retry and lifecycle; they do not substitute for actual native playback. Tests cover
bearer verification, tenant/role denial, private-data projection, conflict/retry
handling and visitor/owner workflows. Browser screenshots and JavaScript exports
do not replace actual Android/iPhone checks, visual approval, full gates or an API
rollout. Current evidence and remaining limits are in `docs/MOBILE-TESTING.md`.
`capture-mobile-owner.mjs` proves local owner mutations/publication; the older
navigation capture now asserts actual forms instead of screenshots alone.
`capture-mobile-markers.mjs` uses fixture tiles to verify clusters/nearby selection.
The 2026-10-05 dependency audit is not clean: Next is patched to 16.3.6, while
unpatched Expo tooling advisories remain tracked in DEP-042 and the release audit.
S59 also patches source-map-js to 1.2.2; invalid/nested source-map offset and normal
mapping regressions pass. The owner approved coordinated web/mobile release and
Expo preview/production public runtime settings are verified. Web/API rollout
completed in S61 with 28 live checks and three responsive browser checks; Expo
artifact distribution proceeds under the S62 one-artifact tooling exception;
signing, artifact and native-device verification remain required.

The deployed S26/S27/S28 workflows use `test:signup` (including handle lifecycle/concurrency), `capture-handle-setup.mjs`,
`test:business-starters`,
`test:product-upkeep` (including gallery security/retention cases),
`test:revision-v4`, `test:media-reconciliation`, `test:native-postgres` and
`capture-launch-wiring.mjs`. Disposable local identities do not prove hosted OTP
or external YouTube availability. Visual approval and rollout remain separate.

S22 uses `capture-search-drawer.mjs` for full-map defaults, sliding overlays,
filter/page retention, map identity/zoom, keyboard focus/Escape, previews,
reduced motion and 1440/390/320 overflow. Default-all projections are compared
with explicit All categories in `test-discovery-pagination.ts`.

Spelling search is covered by `test:discovery-pagination` (including English and
Amharic, ranking, privacy and write consistency), `test:search-performance` (10,000
offerings and index-plan evidence), and desktop/390/320 captures from
`capture-spelling-search.mjs`. Approximate matching is bounded and best-effort.

Service/place verification uses `test:service-offerings`, `test:place-selection`
and `scripts/capture-service-place.ts` for additive migration, tenant/privacy,
service inquiry and keyboard/mobile selection evidence. Its capture uses disposable
PostgreSQL data and test-issued local sessions, not hosted provider delivery.

Persistence tests execute against isolated PostgreSQL schemas installed from the
native baseline. Current browser acceptance installs PostgreSQL directly in its
separate local Supabase project. Source-boundary checks reject retired database
imports, file-based configuration and client-to-database coupling. Native archive
operations and hosted readiness remain separate release gates (BE-035/DEP-031).


`npm run test:platform-naming` checks canonical source naming, legacy configuration
precedence, cookies, tenant-scoped saved state, asset targets and label-only database
migrations. Browser acceptance verifies a real saved-cart upgrade and bookmarked
asset requests. Backup rehearsal compares preserved rows and expected standard-label
changes before any hosted migration (BE-036/DEP-032).

`npm run test:auth-entry-proxy` verifies legacy/canonical Auth-driver precedence
and fail-closed cookie handling. Browser acceptance builds without Auth settings,
asserts login/setup are dynamic, then supplies local provider settings only at
runtime and exercises anonymous, unlinked, linked and logout transitions (DEP-033).

A feature is not complete merely because the page renders.

Before packaging or deploying changes, run tests appropriate to the change, including:

```bash
npm run typecheck
npm run validate:designs
npm run test:bank
npm run test
npm run build
npm run test:http
npm audit --omit=dev
```

Prefer the complete gate:

```bash
npm run release
```

Required verification areas:

- clean dependency installation;
- migrations and seed/reset;
- authentication;
- email-code and Google linked/unlinked identity routing;
- session revocation;
- administrator, client, operations-manager, and assigned-team permissions;
- cross-tenant denial;
- active/draft/suspended visibility;
- saved standard-page edits, stale-version denial, first Publish, atomic live Save
  and restoration; retired request/design endpoints must reject reads and writes;
- versioned basic offering upkeep for every authorized role;
- compatibility-collection and active product-category integrity;
- option validation;
- offering kind, optional desired quantity, availability-only inquiry
  behavior, and absence of active inventory counts;
- image upload validation and serving;
- public inquiry submission;
- idempotency;
- rate limiting;
- dashboard inquiry visibility;
- retired Delivery/Malikt routes returning 404;
- backup and restore;
- all ten benchmark showrooms;
- mobile responsive layout;
- every bank component in the 390-pixel laboratory preview, including bounded
  motion, decorative depth, touch targets, and reduced-motion behavior;
- metadata and favicons;
- no broken local assets;
- no JavaScript or server errors;
- no known production dependency vulnerabilities.

When fixing a security or data-integrity defect, add a regression test that reproduces the old failure and proves the correction.

Do not write a success report that is not backed by executed tests.

---

## 23. Packaging rules

When preparing a ZIP for review or deployment:

Include:

- source code;
- lockfile;
- migrations and setup scripts;
- `.env.example`;
- README;
- security policy;
- this `MASTER-PROMPT.md`;
- showroom SDK;
- release and test scripts;
- required static seed assets.

Exclude:

- `node_modules`;
- `.next` build cache unless explicitly requested;
- `.env`;
- database files containing real or seed credentials;
- `.local/seed-credentials.txt`;
- customer uploads;
- backup archives;
- logs containing customer data;
- private keys or provider secrets.

Always test ZIP integrity after packaging.

---

## 24. How to approach future work

When given a new Suqpage task:

1. Read this file.
2. Read `README.md`, `SECURITY.md`, and the relevant code.
3. Determine whether the change affects public design, dynamic data, security, tenant isolation, or deployment.
4. Preserve each client’s visual identity.
5. Preserve the shared smart-feature contract.
6. Do not invent account handles, phone numbers, product facts, or live integrations.
7. Make reasonable implementation decisions when the intent is clear.
8. Ask a question only when an unresolved choice materially affects the product, data model, security, or business workflow.
9. Implement the full workflow, not only the visible UI.
10. Add or update tests.
11. Run the release checks.
12. State clearly what is complete, what is mocked, and what remains outside the MVP boundary.

### 24.1 Keep this product contract synchronized

This file is a living statement of Suqpage's current product reality. Every
completed feature or change to roles, capabilities, workflow, terminology,
security, data, or deployment boundaries must update all affected sections in
the same task that records passing evidence.

Do not use this file as a chronological changelog. Git history records what
changed, immutable feature specs record accepted behavior and evidence, and ADRs
record consequential decisions and their rationale. Remove obsolete current-
behavior statements instead of retaining them for history.

When an approved direction is not implemented yet, label it explicitly as a
target or planned behavior and link it to its draft spec or roadmap outcome. Do
not describe planned behavior as available, and do not rewrite implemented
behavior out of this file until its replacement has passed the required tests
and rollout gates.

---

## 25. Product north star

Every Suqpage change should move the product toward this experience:

> A seller has a clear page for their shop and products without learning a site
> builder. The owner can save private changes, preview them, and publish them
> safely; optional scoped staff help requires their consent. A customer can
> quickly discover shops and products, select exact
> options, create one complete inquiry, and reach the seller through the
> customer’s preferred messaging app. Suqpage operations retains the inquiry,
> follows up, while payment and fulfillment remain a direct agreement between
> customer and business without forcing either party into ecommerce checkout.

Protect that experience.

Local archive maintenance under DEP-031 now fully parses custom archives without
executing their SQL and restores only into approved empty targets. Empty namespace
preparation never uses CASCADE; populated data is never replaced by this tool.
Local and hosted schema 47 restore/preservation evidence is recorded in
`docs/SUQPAGE-LOCAL-SCHEMA-47.md` and `docs/SUQPAGE-RELEASE-2026-09-21.md`.

## Launch clarity — FE-052

S33 adds owner-managed inquiries, a labeled search/results drawer opener, clear examples,
a first-publication review and contextual locale copy. Public copy does not
mention pricing. Focused database/browser and full release gates pass; the approved
experience is deployed. Evidence: `docs/SUQPAGE-LAUNCH-CLARITY-REVIEW.md` and
`docs/SUQPAGE-RELEASE-2026-09-27.md`.
Production schema 63 preserves demo identity, scoped support queues and historical
buying requests. The current public service is transport live chat with
route intake, staff assignment, retained history and resolution. Staff arrange
carriers outside Suqpage; carrier accounts, checkout and booking integrations
remain out of scope.

## Sponsor visibility and storefront positioning — S51

FE-036/FE-052/FE-053 S51 implement equal six-second sponsor rotation on web/native,
independent of broadcast spotlights, with pause/navigation and accessibility
safeguards. Visitor/owner copy positions Suqpage as a professional digital
storefront alongside social-media selling, including shop or area map location.
Focused carousel tests and 69 final web/mobile-browser language/viewport states
pass. About separates customer browsing from the business-owner offer. The deployed copy revision addresses nearby social-media businesses and their
organized offerings, while keeping existing map/search features unchanged.
Agent-authored translations have not received independent native-speaker approval.
Five-locale signed Android switches and public web layout checks pass. Web and
internal Android are released; see the S69/S70 record for exact gates, artifacts
and physical-phone limits. The Suqpage emulator is closed after verification to
save resources; web/API previews remain available.

## Storefront accents — FE-054

Owners choose an optional accent in the Page editor while viewing their actual
storefront, on web and native. Signup has no color controls. Presets and a visual
custom picker update the full preview immediately; no color-code entry or Apply
step is required. Web uses the browser color picker; native uses visual color,
strength and brightness controls in a compact sheet. Save persists the selection.
The stored six-digit value feeds one contrast-safe palette; Default resets it.
A chosen accent applies an 8% cover-poster wash, cover edge, logo surround,
catalog selection/detail rules, contact surface and business inquiry actions.
Product photos, playing videos, body copy, platform navigation/logo/map markers
and semantic status colors remain unchanged. There is no extra tint/layout field.

The value belongs to the business profile in existing PostgreSQL draft/publication
JSON, not the user account's platform theme. Signup is transactional; owner live
Save updates publication atomically, consented staff only edit the draft. Existing
versions/tenant checks apply. Legacy clients omitting the additive field preserve
the stored value; explicit empty resets it. Native private/public DTOs carry the
same saved value. No schema migration is needed. The owner-approved S68 one-time
correction saves logo-led accents for all 66 local and 64 existing live marked
demos. New starters retain Default; real businesses and account/content/media
fields stay unchanged. Two local-only handles were not recreated in production.
See docs/DEMO-ACCENT-ROLLOUT-2026-10-06.md.

Owner approved the prototype on 2026-10-05. Focused actual signup, reload, web/native
save and publication checks plus desktop/phone captures pass. Web deployment
and the internal Android APK are published; full gates and limits are recorded in
the S69/S70 release record. These
additions qualify sections 5, 7, 11, 15, 18, 19 and 22 without changing other flows.

## Local attention and read receipts — S91

FE-062/BE-050/DEP-043/ADR-0026 are implemented locally with focused database,
privacy, provider-failure and HTTP checks. Actual browser/Expo owner and visitor workflows, five-language layouts and browser
sound/mute checks also pass. This candidate is uncommitted and not deployed. Visual approval/full
release gates, reviewed Firebase/Web Push configuration, rebuilt Android and
actual OS delivery remain separate outstanding checks.
