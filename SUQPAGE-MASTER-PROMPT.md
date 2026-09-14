# Suqpage Project Master Prompt

> **Read this file before changing any Suqpage code, design, data model, copy, integration, or deployment configuration.**
>
> This document is the permanent product and engineering brief for human contributors, AI coding agents, designers, and reviewers. It describes the intended product, the principles behind it, the current MVP boundary, and the rules that must not be broken.

---


Transition in progress (FE-042/BE-033, ADR-0019): the owner has retired custom-page
requests and their design/revision workflow. Standard owner pages, direct business
staff assignments and admin first-page review replace those live features. Category
results gain five-row backend pagination. Implementation and verification are tracked
in S2i/S2j; historical managed-workflow descriptions below are superseded, not approval
to expose or extend those features. Historical data remains preserved.

## 1. Your role

You are working on **Suqpage**, a multi-tenant platform for discovering shops and
products and contacting sellers directly. It serves consumer-facing retailers,
home sellers, growers, workshops and other product businesses. Sellers may make,
grow or resell their inventory. The initial market is Ethiopia.

Act as a senior product architect, full-stack engineer, security-conscious SaaS developer, UX designer, and quality reviewer. Preserve the product vision while making the application more reliable, usable, secure, and commercially credible.

Do not treat Suqpage as a generic website builder or a conventional ecommerce platform.

The central principle is:

> **Suqpage provides one consistent business profile and discovery experience.
> Each seller owns its content, products and identity; private staff assistance
> requires revocable consent. Inquiries are not checkout or paid orders.**

When a user gives an explicit instruction that conflicts with an older preference in this file, follow the newest explicit instruction, but preserve security, tenant isolation, and data integrity.

---

## 2. Product identity

### Current local candidate (FE-040–FE-042, BE-032/BE-033, DEP-030)

One shared business profile uses each business's canonical catalog or current
published owner profile. It serves product sellers, retailers, growers and workshops
with a hero/video poster, one About, linked products and a separate contact section.
Public and private account contacts remain separate. The current editor is enabled
by default and supports saved drafts, private image uploads, consented staff help,
first-page admin review and subsequent owner publish/restore. The interactive preview
cannot send inquiries or persist a visitor cart.

Category/search results use five-row database pages alongside a persistent map.
Custom request/design/revision features are retired under ADR-0019. Historical
records/assets and compatible catalog readers remain preserved. Historical asset
briefs and visual evidence remain under showroom-projects/WORKFLOW.md; those files
do not enable a custom-request application feature.

Suqpage is deployed at the existing generated Netlify origin
`https://africmade.netlify.app`. The 2026-09-14 release uses PostgreSQL schema 43
and the approved email-only sign-in configuration. Core, release, operations,
PostgreSQL, container, seven isolated production-browser scenarios and 72
accessibility states pass. Live desktop/phone checks verify contact placement,
linked products, retained-map pagination, email-only entry and private-route denial.
`docs/SUQPAGE-DEPLOYMENT-2026-09-14.md` records the source commit, deployment,
backup/recovery evidence and limits. Real hosted email delivery and authenticated
owner/admin delivery smoke remain distinct from passing local workflows.

The official product name is:

```text
Suqpage
```

Do not write `SuuqPage`, `Showroom Page`, or another variation unless quoting historical material.

Launch origin:

```text
configured HTTPS Netlify origin
```

No custom Suqpage domain is owned yet. Never publish or configure an assumed
domain before the product owner purchases it.

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
  adapter;
- one shared business profile with each seller's own identity, introduction,
  images, products and optional About video;
- a permanent public discovery surface where visitors choose an industry,
  explore exact reviewed business locations or a daily country-wide virtual
  Daily Featured program, and enter each participant's permanent
  `/@handle` Suqpage page;
- a controlled SaaS pilot whose existing fictional Ethiopian catalog includes
  artisans, farms, workshops and small manufacturers. Product retailers and
  home sellers are eligible; additional retailer examples remain checklist S6.
  Repair-only services are not product sellers. Ten are curated benchmark identities and all fixtures have durable fictional briefs,
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

### 5.1 One profile, each seller's content

Every public page and ordinary preview uses BusinessProfile (FE-040/FE-041).
The structure is image/video poster, name/logo, one About description, Products
navigation with either a catalog or shareable inline product detail, then a separate
public contact section. The hero image is the video poster; one intentional play
control loads the privacy-enhanced player. Only configured public links appear.
Saved selections expose inquiry access; an empty selection offers Explore products.
There is no separate Introduction field or custom layout selector. Account contacts
are edited separately from the public contact values. Owners and consented staff
use the same standard page editor; admin first-review uses the submitted page.

### 5.2 Suqpage must have its own platform identity

The Suqpage public root must not look like any client page. It is a polished,
mobile-first marketplace application designed to remain understandable inside
TikTok and other in-app browsers. `FE-021`, `FE-024`, `FE-027`, `FE-028`,
`FE-029`, `FE-030`, and `FE-036` define the current composition, narrative,
venue art direction, and platform visual system. `/` opens directly into the
geographic Market; there is no intermediate landing lobby or duplicate search.
A concise heading identifies shops and products near the visitor. One short
sentence explains finding a shop, exploring its products and contacting the
seller directly. Visitors can search by product, category or location. Individual
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
branding. The combined marketplace map loads immediately, while a centered
first-use chooser requires an explicit orientation choice before the visitor
continues: one of seven production industries or **All industries** as the
eighth and final option. After that choice, live search, the current industry control, the available
region/city selector, the privacy-preserving **Near me** map framing action,
zoom, and the exact-location Ethiopia map remain within the same bounded
surface. Desktop search results occupy the panel beside the still-mounted map.
Filters and map actions float on the map; on phones a Filters button opens
category/place choices in a bottom sheet. Search, a bounded map, and results
below it share the remaining workspace. Map attribution stays clear. Market and an
opened nearby-page viewer consume the remaining application viewport above fixed
phone navigation.
Opening a permanent Suqpage page navigates in the same tab to its canonical tenant
route and unmounts the map or Daily Featured runtime. Desktop and tablet retain
the Suqpage application rail around the tenant-owned page. Phones use an
immersive page surface instead: the platform bottom navigation is removed,
one compact platform-owned Back/Powered by Suqpage bar remains, and the
tenant's single section/inquiry navigation may stay fixed at the bottom. The
Back action restores the exact recorded map, filter, nearby-group, or Featured
state before consulting older browser history. A direct Suqpage page URL renders
the same responsive shell without requiring prior Market history.
Desktop retains the complete side command panel. Its opened industry
menu matches the trigger width and wraps long labels instead of spanning across
the map. The menu and phone Filters sheet use one restrained accent for each of
the seven industries and a neutral combined treatment for **All industries**.
Industry accents may identify nearby-page cards, but individual geographic markers and numbered clusters use one
consistent Suqpage orange action treatment. The isolated marker uses a compact storefront pin smaller than a cluster core,
with no visible halo and an independent touch-sized transparent target;
white and cool-gray remain the dominant content surfaces, and visible industry text or iconography means
color is never the only identifier. After two typed characters, search exposes no more than six
server-authoritative eligible page, published offering, and reviewed-place
suggestions. The combobox supports pointer, touch and keyboard interaction.
Selecting a category already opens the bounded result panel; a meaningful query
refines it. The panel stays beside the map on desktop and below its bounded canvas
on phones. All, Products and Businesses show accurate scoped totals. Five results
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
Daily Featured capacity windows are 08:00–13:00 and 17:00–22:00 Ethiopia time,
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
links are never invented.
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
Each screen has one communication job. Market helps visitors find locally made
and grown products. About explains the local, regional, national, and wider
African market story. Login explains passwordless account access. Setup
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
bounded to the committed viewport. Each eligible business appears at its
reviewed WGS84 coordinates.
Nearby markers form numbered zoom-dependent clusters. At neighborhood zoom,
same-city businesses within 800 meters form deterministic balanced nearby groups
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
Activating one below
local-detail zoom centers and enlarges the map first; activating it at local
detail opens the richer business preview. The map marker does not load booth
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

The merchant CTA links to passwordless account entry. Google or a six-digit
email code verifies identity before any business details are requested. An
authenticated unlinked identity then submits bounded owner name, business name,
phone or WhatsApp, and a short description of what the business makes or
supplies. The server derives identity from the Supabase session, generates a
safe unique handle, and atomically creates the private draft business, owner,
client access profile, identity link, and business onboarding record. It accepts no
public file upload and creates no public marker, Daily Featured card, catalog,
or showroom.
Standalone administrator-created account invitations remain supported. The legacy
custom-page lead endpoint is retired. The homepage and request flow
use professional copy with no development-stage disclaimers. The public
composition is verified without horizontal document overflow at 320 and 390
CSS pixels.

The public account-entry and authenticated business-setup routes use the same
Suqpage header, orange, charcoal, white, and cool-neutral platform language
as Market and About. Each is a focused task surface with one concise context
panel and one white form panel on wider screens, stacked in semantic order on
phones. Account entry asks only for an email code or configured Google identity;
business setup follows only after provider verification. Password entry,
password reset, public role selection, handle selection, and initial catalog
collection are outside the launch flow.

### 5.3 Public copy must look finished

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
made-to-order product, manufacturing capability, or production supply. Public
showrooms label this catalog **Products & Capabilities**. The compatible
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
10. Every current offering declares one kind: `standard_product`,
    `made_to_order`, `manufacturing_capability`, or `production_supply`.
11. Capacity, minimum-order, and lead-time summaries are optional bounded
    merchant facts. The platform and AI must not calculate, verify, or invent
    them. The shared public product view omits these production facts.
12. An offering may display one optional non-negative ETB price, one normalized
    merchant-defined offered-by unit, and up to six concise highlights. These
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
and provides Back to products. Unknown, foreign or unpublished product references
show a safe unavailable state. Cards have no Video badge; details show the photo,
an intentional Watch video action when available, name, description, optional
price, canonical selling unit and feature chips. Capacity, minimum order, lead time
and internal offering-kind labels stay out of this public view. Single-value option
groups need no selector; their canonical defaults remain part of the inquiry.

Expected customer flow:

1. Open a product, review photo/video/features, and choose any available options.
2. Choose **Inquire about this product** for that selection alone, or **Add to
   inquiry** to save it while continuing to browse. A direct inquiry never merges
   with, clears or submits the visitor’s saved group.
3. A single selection uses a compact product summary. Multiple selections show an
   editable inquiry list; zero selections show no persistent cart button. Saved
   references are revalidated against current tenant products/options and capped
   at 20, matching server limits. Desired quantity remains optional bounded text.
4. Choose configured WhatsApp, Telegram or SMS, **Copy inquiry**, or **Send on
   Suqpage**. Only validated effective public contacts supply handoff destinations;
   SMS uses public phone and never implies WhatsApp availability.
5. App actions prepare a message for the visitor to review and send. Copy retains
   visible/selectable text, including a clipboard-failure fallback. None of these
   actions creates an inbox inquiry or claims external delivery.
6. Only choosing **Send on Suqpage** reveals the reply-phone field and explicit
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

## 10. Market discovery behavior

Suqpage’s directory must scale without dumping every tenant onto the page by default.

Default behavior:

- load the combined geographic map behind a required first-use orientation
  chooser with seven industries plus **All industries** as the final option;
- selecting a category, including All categories, opens its paginated results;
  list ranking remains independent of sponsorship;
- de-duplicate businesses with more than one industry membership and keep the
  Daily Featured weekday industry independent from that map filter;
- provide live search plus simple Industry controls;
- show five-row category- or query-driven Products/Businesses result pages beside the persistent
  map on desktop, or below its bounded canvas on phones. Product results link
  directly to the selected product; query/type changes retain map center/zoom;
- after two characters, provide at most six de-duplicated, public-eligible
  Suqpage page, published-offering, and reviewed-place suggestions scoped to the
  active industry and place. Hide duplicate autocomplete once full results appear;
- provide one category control and location filter on the map; do not duplicate
  these controls inside the result list;
- do not let result panels cover filter controls;
- support business name, handle, product, industry, and relevant description search;
- keep reviewed production-scale metadata
  available to authorized administrators without exposing it as a public filter;
- keep live search, available-location filtering, and zoom/center
  controls within one discovery workbench; progressively disclose industry and
  place in a phone bottom sheet and place phone map navigation on the map;
- ignore legacy public `scale` query state so no invisible filter narrows results;
- ensure mobile usability and keyboard accessibility.

---

## 11. Passwordless account entry and business onboarding

Suqpage uses one identity-first entry surface for sign-in and account creation.
The visitor enters an email and six-digit one-time code or continues with Google
when that provider is configured. Passwords are not requested in the launch
flow. Existing linked users continue to their permitted dashboard; verified but
unlinked identities continue to protected business setup.

The owner approved an email-only production launch on 2026-09-14. Email-code
entry is required; Google remains hidden until separately restored and verified.
No local OAuth or SMTP credentials are copied to Production for this release.

The Suqpage namespace preserves existing account emails and Auth links. Legacy
local session cookies remain readable through the same authorization checks; new
cookies use Suqpage names and logout revokes both local token names (BE-036).

Business setup collects only owner name, verified-email display, phone or
WhatsApp, organization name, one bounded private production category,
processing consent, and an idempotency token. A safe Google display name is
prefilled when available and remains editable. The public-page handle is
generated server-side and may be changed later by an authorized operator. There
are no public file, image, design-brief, password, or free-form offer inputs.

Requirements controlled by `FE-038`, `BE-031`, and `DEP-028`:

- use bounded JSON, exact-origin checks, privacy-preserving IP/email rate limits,
  generic OTP responses, and managed Supabase identity;
- derive provider UUID and email only from the verified server-side session;
- commit the draft tenant, owner, access profile, immutable identity link, and
  private onboarding profile in one transaction or roll back all of them;
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

Administrators manage business accounts, individual staff access, standard page
first-review decisions, marketplace geography/category approval, sponsorship,
Daily Featured schedules, customer operations, support and renewals. They can create
a private business invitation independently of any service request. The dashboard
shows a paginated Page reviews queue and per-business review/publication status.
Direct staff assignments belong to the business and can be revoked. First approval
publishes the owner's exact submitted saved page and catalog versions and activates
its private business atomically. Stale, already-decided and non-draft submissions
cannot publish. Requested changes include feedback visible to the owner.

An administrator can suspend or restore an established page's visibility. They
cannot use assistance to impersonate owner publication or bypass consent. Reviewing
an exact pending submission grants read-only access to its preview/cover; editing
its private draft still requires the owner's assistance permission.

### Owner (client)

Owners create a private workspace through verified signup or accept an invitation.
They can add/update products, maintain categories, save and preview their standard
page, manage public contacts separately from private account contacts, and submit
its first saved version for review. Product creation no longer requires a prior
custom-page publication. Categories and product updates advance the catalog version
so a pending review cannot silently approve changed content.

After first approval, owners can publish saved page edits or restore the prior
page publication. They can enable/revoke staff page assistance, read buyer inquiries,
use tenant-scoped support, see renewal status and view aggregate visit statistics.
They do not assign staff, approve their own first listing, edit other tenants,
change inquiry status, or operate payment/delivery. Existing canonical product
option structures and retained catalog snapshots remain compatible.

### Operations managers and team members

Operations managers can open business workspaces, create business invitations,
maintain products with a service note, assist with pages when consented, operate
inquiries, manage support capacity/assignments and record manual renewals. First
page approval and business staff assignment are administrator actions.

Team members see only actively assigned businesses and their permitted product
workspace. Page editing also requires current owner assistance consent. Revocation
removes that access. Existing support-agent permissions govern support conversations
independently. No role uses service-request assignments, custom design studios or
revision-approval projects in the live application.

### Public customer

Visitors browse category/search results in five-row backend pages beside the map,
open shareable products, choose relevant options and inquire about one product or
an independently saved group. Configured app handoffs and copy need no reply-phone
form; Send on Suqpage reveals that field and confirms canonical inbox persistence.
Only active businesses, published products and approved discovery geography enter
public projections. Account phone/email never supply public contacts implicitly.

---

Owner business setup at `/dashboard/business` saves the canonical name/logo and a
private general-area or storefront location proposal. Public contact fields remain
in the page editor; private account contacts remain in account settings. Location
changes immediately withdraw the old map approval. Admins find pending locations
through the dashboard count and business-directory filter and approve the exact
proposal version. General-area approval uses coarse coordinates; storefront mode
requires the owner's explicit choice and valid coordinates (FE-043/BE-034).

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
explicit canonical settings, including empty or disabled values, win. New public
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
  the required account phone privately and leaves public phone/email/WhatsApp
  empty until explicitly provided. Account phone is not a sign-in factor and is
  excluded from session-user and public catalog data (FE-040/BE-032, migration 41).
- Do not use a hard-coded fallback session secret.
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

DEP-029 governs production Auth configuration maintenance. The repository's
guarded command pins the production project and HTTPS origin, rejects local and
unknown settings or credential changes, and creates a read-only review plan with
a private provider-returned backup. Apply requires the owner's reviewed digest,
a fresh unchanged remote state, and one narrow write followed by readback.
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
bootstrap. Unsupported database settings fail closed.

Native schema 45 installs directly into empty PostgreSQL schemas, including taxonomy,
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
DEP-023, DEP-026 and DEP-030. The current generated-origin deployment and private
Storage are verified. Its additive migration preserved original table values,
retained identities and least-privilege runtime access. Deploy Previews and
Production must never share database, Auth, Storage or service-role credentials.
Real hosted email delivery remains an admission check before broad public launch;
no custom-domain or DNS change is implied by the generated-origin deployment.

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

Target public languages include:

```text
English
Amharic
Afaan Oromo
Arabic
Somali
Afar
```

Rules:

- translate interface labels, buttons, help text, status labels, and platform copy;
- do not translate product names;
- do not translate brand names;
- do not translate color names entered by the merchant;
- do not translate sizes, model numbers, storage values, specifications, or option values entered by the merchant;
- support Arabic right-to-left layout;
- allow for long Afaan Oromo strings without layout breakage;
- do not claim a language is complete until all public UI states are translated and tested;
- keep the dashboard English-first for the controlled MVP unless multilingual dashboard support is explicitly implemented.

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
- descriptive image alt text;
- readable availability states;
- clear loading, success, empty, and failure states;
- no silent network failures;
- no unhandled native-share cancellation errors;
- cart persistence where appropriate;
- correct favicon and metadata for every showroom;
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
2. The owner adds product categories/products, uploads images and saves the page's
   About, cover/video and available public contact links in the standard editor.
3. New product uploads are authorized before writing and stored in the private
   media namespace. Their stable media route requires scoped access while the
   business is private; a currently listed product or published cover becomes
   anonymously readable only for an active business.
4. The owner submits the exact saved draft and catalog versions. An administrator
   reviews that candidate, requests explanatory changes or approves first publication.
   Concurrent/stale edits require resubmission. Decisions and actor attribution are
   retained, and approval/publication/business activation are one transaction.
5. Marketplace placement separately requires administrator-reviewed category and
   geography, listed products and a non-excluded active business. First publication
   does not invent a location or bypass discovery approval.
6. Established owners publish/restore saved page content themselves. Optional staff
   help uses current business assignment and revocable owner editing consent.
7. Buyer inquiries, support, account access, renewals and visit statistics remain
   connected to the same business workspace. Full release checks and deployment
   remain distinct from local implementation and visual review.

---

## 22. Testing and definition of done

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
- saved standard-page edits, stale-version denial, first review, owner publication
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
