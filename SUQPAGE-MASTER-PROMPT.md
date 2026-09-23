# Suqpage Project Master Prompt

> **Read this file before changing any Suqpage code, design, data model, copy, integration, or deployment configuration.**
>
> This document is the permanent product and engineering brief for human contributors, AI coding agents, designers, and reviewers. It describes the intended product, the principles behind it, the current MVP boundary, and the rules that must not be broken.

---


Current released product (FE-044–FE-048, BE-037–BE-041, DEP-034–DEP-038):
Suqpage runs at https://suqpage.com on PostgreSQL schema 47. Standard owner pages,
complete private starters, Product/Service posting, owner first Publish and live
Save, immediate public location saves and five-row search results are deployed.
Custom-page request/design/revision features are retired; historical data remains.
The map separates approximate city markers while preserving explicit storefronts.
Email-only sign-in and Suqpage email branding use the canonical domain; the owner's
Gmail sender and credentials are preserved. www redirects to the apex.

Production has 64 existing admitted demo pages and 256 simplified offerings,
including 42 services. Local fixtures have 66 pages/264 offerings; local-only
businesses are not copied to production. Demo contacts use the supplied example
username alhayabrand, fictional phone/email and example.com; delivery is not implied.
Existing accounts, inquiries and non-demo records are preserved. New private starter
content is separate from the one-time correction of existing demos. Demos retain
optional-price, scheduled Featured and sponsor examples rather than marking every
business featured or claiming prerecorded video is live.

The current release and its verified gates, backup, deployment and remaining
real-email/hosted-session admission limits are recorded in
`docs/SUQPAGE-RELEASE-2026-09-21.md`.

## 1. Your role

You are working on **Suqpage**, a multi-tenant platform giving African businesses
an accessible digital presence and a direct inquiry channel. People discover
businesses, products, services and custom work through geography, search results
and featured visibility. Growers, makers, traders, retailers, home businesses and
service providers retain their own identity. The current catalog begins in Ethiopia.

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
Source `be134a247c8ea54b18b882f9e2368058f7fbc0ee` and deployment `6ab0d349f099639821fa0f9a` use schema 47. Full check, release,
operations, nine isolated provider browser scenarios and private-artifact checks
pass. Live desktop/phone search, all 64 demo routes, linked offerings, email-only
entry, private-route denial, HTTPS redirects and health are verified.
Real hosted email delivery and authenticated hosted owner/admin sessions remain
separate from passing local workflows. See `docs/SUQPAGE-RELEASE-2026-09-21.md`.

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

Suqpage helps buyers discover shops and products beyond the streets and social
accounts they already know. Shops need a clear presence for their products;
buyers need to find what is available and reach the seller. The initial market
is Ethiopia, with wider African discovery as a future direction.

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
work, repeat orders, or larger trade inquiries. Suqpage public support may
help with using the platform, transport arrangements, or reporting a concern
about a listing. Suqpage does not inspect, certify, endorse, negotiate for,
deliver for, or guarantee a listed participant.

---

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
- an anonymous, token-scoped public support drawer that enters the same staff
  queue for platform help or listing reports and transport-arrangement help,
  requiring private reconnect email and phone values on the first message
  without creating a buyer account or implying certification, endorsement,
  delivery operation, or a guaranteed outcome; visitors may
  end an active chat, retain its readable transcript, and clear only their
  browser token to begin a separate conversation; visitors, clients, and
  authorized staff may attach one private sanitized image or verified PDF up to
  5 MB to a message, with conversation-scoped reads through the configured media
  adapter. The verified local BE-018/FE-019 retry refinement prepares the
  HttpOnly visitor token before sending and retains a submission key through
  lost responses and reopening, so retries recover the same chat/message;
  publication of this refinement remains pending;
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
A concise heading identifies nearby businesses. One short sentence explains
finding products, services and custom work through the map or search results and
inquiring directly. Visitors can search by product, category or location. Individual
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
and no orientation chooser. Search & filters opens a left drawer over the full
map. The same drawer contains search, optional category/place selectors, result
type tabs and five-row result pages on desktop and phones. It starts closed on a
fresh visit and opens for query/category/place deep links. Hiding and reopening
retains the query, filters, result page, map center and zoom. Map controls remain
on the right; attribution and fixed phone navigation stay visible. Selecting a
result business hides the drawer to expose its map preview. The map stays mounted.
The verified local FE-042 candidate uses a Filters disclosure for category/place
controls, removes repeated headings and places paging below independently
scrollable result rows. Desktop and phone checks pass; this layout awaits owner
visual approval and deployment. Production still uses the previous expanded controls.
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
Category and place selection refine the drawer and map together. All, Products
and Businesses show accurate scoped totals. Five results
are selected by SQL COUNT/LIMIT/OFFSET with deterministic unpaid ordering and
Previous/Next controls. All traverses products then businesses; category, query,
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
Desktop shows all five beside the gallery. Phones show two at a time in a compact
automatically rotating strip without scroll, pause, or carousel controls. Every
day has one stable assigned industry, including Agriculture on Sunday. The
Daily Featured capacity windows are 8:00 AM–1:00 PM and 5:00 PM–10:00 PM Ethiopia time,
with five-minute booth changeovers and a ten-minute sponsor break after every
third presentation in each session. Non-empty sessions target 30 presentation
minutes per booth and remain at least one hour long. A smaller morning lineup
contracts toward its 13:00 end and a smaller evening lineup contracts toward
its 22:00 end; larger lineups expand toward the complete capacity windows. The
midday interval is never shorter than 13:00–17:00. Automatic mode
uses the first forty rows in the current deterministic eligible set; a platform
administrator may retain an ordered eligible subset of at most forty for one
date. Airtime is recalculated from the authoritative
policy and lineup. Today's public header includes one compact schedule
disclosure derived from that same agenda. Its closed state names the actual
participant-responsive morning and evening windows; its open state lists each
participating showroom and EAT range, sponsor breaks, and the complete
intermission. It remains collapsed by default on desktop and phone and does not
expose future-day business identity. Every revealed card shows its EAT range; exactly one card may be
visibly current during a presentation, while transitions, sponsor breaks, and
intermission identify no business. The status names the active booth or current
break and provides the configured recordings destination after 22:00. Provider
links are never invented. The verified local FE-033 refinement labels an
unconfigured broadcast as a schedule, without claiming TikTok is live or offering
a watch action. Public and dashboard time labels use 12-hour AM/PM; admin time
controls retain 24-hour machine values and unchanged EAT scheduling boundaries.
These display refinements await candidate approval and publication.
Today's gallery rotates as a circular schedule queue: the current presentation
leads; during breaks the most recently completed presentation remains first;
and the next card leads only when its presentation starts. References, airtime,
and stored lineup order remain stable. Non-today previews do not rotate.
Sponsor breaks receive sequential placements from the active five-placement
pool. Internal schedule previews name each assigned sponsor and exact time;
during the live segment, public status names the paid sponsor and its rail card
moves first with a **Sponsor spotlight** treatment.
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
collects private account details. Support offers platform help, transport help,
and a way to report a listing.
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
one compact **Back to Market** bar with no redundant platform credit.
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

Nearby-group viewers use no architectural shell, venue, floor, hall, or
decorative environment. Daily Featured likewise presents up to forty image-led cards in responsive columns with
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
or hero photography. That preview is a non-modal floating inspector centered over a
restrained low-opacity dismissible scrim: the map remains visible, and on
phones it becomes a bounded bottom sheet above app navigation. A counted nearby-group
group marker uses the same accessible action-orange cluster language and exact count so
it cannot be mistaken for one business marker.
Activating a revealed Daily Featured booth opens this same inspector before any
tenant route change; only its explicit **Open showroom** action navigates.
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
authenticated unlinked identity then submits bounded owner name, business name,
phone or WhatsApp, and a short description of what the business makes or
supplies. The server derives identity from the Supabase session, generates a
safe unique handle, and atomically creates the private draft business, owner,
client access profile, identity link, and business onboarding record.
FE-046/BE-039 also creates a private saved profile, example location and
three editable example offerings with names, descriptions, media and prices;
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
password reset, public role selection, handle selection, and initial catalog
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

Suqpage stores business content in the database. Client renderers must consume dynamic data rather than hard-coding products.

Core hierarchy:

```text
Business
└── Product category
    └── Product
        ├── Images
        ├── Controlled video
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
13. Each offering and each showroom may carry one controlled YouTube reference.
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

## 8. Product and inquiry workflow

Product cards open a shareable `/@handle?product=<id>` view inside the business’s
product section (FE-041). The route reloads directly, supports browser back/forward,
and provides a return link to the page’s product/service catalog. Unknown, foreign or unpublished product references
show a safe unavailable state. Cards have no Video badge; details show the photo,
an intentional Watch video action when available, name, description, optional
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

The owner editor asks for Product or Service, image, name,
optional YouTube URL, optional ETB price and one description (FE-048/BE-041).
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
- show five-row category- or query-driven Products/Businesses result pages in the optional
  left drawer over the persistent map on desktop and phones. Product results link
  directly to the selected product; query/type changes retain map center/zoom;
- after two characters, provide at most six de-duplicated, public-eligible
  Suqpage page, published-offering, and reviewed-place suggestions scoped to the
  active industry and place. Hide duplicate autocomplete once full results appear;
- keep search, category and location controls together in the result drawer;
  the verified local compact-results candidate keeps category/location behind
  Filters, displays active selections in a short summary and fixes page controls
  below the scrollable rows. Visual approval and publication remain pending;
- hide the drawer without clearing filters; its hidden controls are inert, Escape
  returns focus to the opener, and reduced-motion preferences disable sliding;
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
- the verified local BE-040 ranking correction prefers the original meaningful
  words anywhere in an offering title over description-only or plural-alternative
  matches, after exact-title/whole-title-prefix matches. Thus `gras` puts Farm
  Grass with Dirt ahead of grain matches. Counts, eligibility and five-row SQL
  pagination remain unchanged. This correction is not yet deployed;
- keep reviewed production-scale metadata
  available to authorized administrators without exposing it as a public filter;
- keep live search, available-location filtering, and zoom/center
  controls within one discovery workbench; progressively disclose industry and
  place in the same optional drawer on phones and keep map navigation on the map;
- ignore legacy public `scale` query state so no invisible filter narrows results;
- ensure mobile usability and keyboard accessibility.

---

## 11. Passwordless account entry and business onboarding

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

The Suqpage namespace preserves existing account emails and Auth links. Legacy
local session cookies remain readable through the same authorization checks; new
cookies use Suqpage names and logout revokes both local token names (BE-036).

Business setup collects only owner name, verified-email display, phone or
WhatsApp, organization name, one bounded private production category,
processing consent, and an idempotency token. A safe retained provider display name is
prefilled when available and remains editable. The public-page handle is
generated server-side and may be changed later by an authorized operator. There
are no public file, image, design-brief, password, or free-form offer inputs.

Requirements controlled by `FE-038`, `BE-031`, and `DEP-028`:

- use bounded JSON, exact-origin checks, privacy-preserving IP/email rate limits,
  generic OTP responses, and managed Supabase identity;
- derive provider UUID and email only from the verified server-side session;
- commit the draft tenant, owner, access profile, immutable identity link, and
  private onboarding profile in one transaction or roll back all of them;
  FE-046/BE-039 includes complete private starter content in that same
  transaction for signup and standalone invitations;
- reject browser-supplied identity, role, tenant, publication, location,
  industry, featured, media, password, or handle authority;
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

The access-profile layer distinguishes platform administrator, operations manager,
team member and client. Session identity and tenant scope remain server-authoritative.

### Administrator

Administrators manage business moderation, staff assignments, marketplace
visibility, sponsorship, Daily Featured schedules, support and renewals. They can
invite a private business and suspend or restore established visibility. Page and
location approval queues/actions are retired; historical records remain. Private
page editing and draft media access still require current owner assistance consent.
Business details edits operational identity,
notification, live and sharing settings; public contacts link to the consented page
editor. Legacy social values are preserved. Staff tables omit retired page-review
counts, and status guidance distinguishes staff drafts from owner live Save.

### Owner (client)

Verified signup or an invitation creates a complete private sample workspace.
Owners replace examples, save business details/location, edit their page and
products/services, then Publish directly when at least one offering is listed.
Subsequent page Save updates the live publication atomically; stale/foreign writes
and self-reactivation of suspended businesses are rejected. Private account
contacts remain separate from public page contacts. Owners can restore a retained
publication, revoke assistance, read inquiries, use support, manage account security
and view aggregate visits. Categories and renewal operations remain available to
staff without cluttering owner navigation. Existing catalog IDs, options, inquiry
snapshots and tenant boundaries remain compatible.

### Operations managers and team members

Operations managers can open business workspaces, create invitations, maintain
products with a service note, assist with consented page drafts, operate inquiries,
manage support assignments and record manual renewals. Business staff assignment
remains an administrator action. Team members only see actively assigned businesses;
page editing also requires current owner consent. Staff Save never publishes on
behalf of the owner. Support-agent permissions govern support conversations.
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

## 16. Security requirements

Security requirements are product requirements, not optional cleanup.

### Authentication and sessions

- Never expose seeded credentials in public UI.
- Never expose, collect, or transmit a password in the launch account-entry or
  business-onboarding flow.
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

## 17. Data, migrations, and deployment boundary

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

Native schema 47 installs directly into empty PostgreSQL schemas, including taxonomy,
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

FE-049 provides shared public and dashboard interface localization for English,
Amharic, Afaan Oromo, Somali and Tigrinya. A validated one-year cookie remembers
the selection while preserving URLs, merchant content and unsaved form/inquiry
state. Only the selected language catalog is loaded; server-only text is excluded
from client messages. Technical terms, legacy/custom-design copy and unknown
provider errors may retain English. Translations have not had native-speaker
review. Arabic/RTL and Afar remain future work. Publication evidence is recorded
in the S25 release document; implemented behavior alone is not a rollout claim.

Rules:

- Use short, everyday English throughout public pages and dashboards. Name the
  actual action: add to an inquiry list, view it, or send an inquiry. Use products,
  services and businesses rather than platform jargon. Do not add filler,
  repeated button explanations, internal notes or implementation terminology.
  Preserve meaningful privacy/security guidance and merchant-authored content.
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

All public pages and dashboards must work on mobile and desktop.

Minimum expectations:

- no horizontal overflow;
- no overlapping menus, filters, or result panels;
- adequate tap targets;
- visible focus states;
- keyboard-accessible dialogs and drawers;
- focus trapping and restoration where appropriate;
- semantic buttons and labels;
- recognizable category pictures alongside text; decorative artwork is hidden
  from assistive technology, with accessible category names retained;
- descriptive image alt text;
- readable availability states;
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

## 22. Testing and definition of done

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
