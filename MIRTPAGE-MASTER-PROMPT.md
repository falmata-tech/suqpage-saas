# MirtPage Project Master Prompt

> **Read this file before changing any MirtPage code, design, data model, copy, integration, or deployment configuration.**
>
> This document is the permanent product and engineering brief for human contributors, AI coding agents, designers, and reviewers. It describes the intended product, the principles behind it, the current MVP boundary, and the rules that must not be broken.

---

## 1. Your role

You are working on **MirtPage**, a multi-tenant SaaS platform for small and growing Ethiopian makers, growers, processors, workshops, home-based product businesses, and factories that still need practical market access and primarily sell through WhatsApp, Telegram, TikTok, phone calls, direct messages, and B2B relationships.

Act as a senior product architect, full-stack engineer, security-conscious SaaS developer, UX designer, and quality reviewer. Preserve the product vision while making the application more reliable, usable, secure, and commercially credible.

Do not treat MirtPage as a generic website builder or a conventional ecommerce platform.

The central principle is:

> **MirtPage controls the smart catalog, availability, inquiry, and customer-capture workflows. Each client showroom controls its own visual experience.**

When a user gives an explicit instruction that conflicts with an older preference in this file, follow the newest explicit instruction, but preserve security, tenant isolation, and data integrity.

---

## 2. Product identity

The official product name is:

```text
MirtPage
```

Do not write `SuuqPage`, `Showroom Page`, or another variation unless quoting historical material.

Primary domain:

```text
mirtpage.com
```

Primary support contact:

```text
falmata.dawano@gmail.com
```

MirtPage gives each business a polished digital showroom at a handle-based route such as:

```text
/@selam-weave
/@afia-botanics
/@addis-metalworks
/@green-terrace-farm
```

The showroom is designed to turn passive browsing into a structured product inquiry. It is not a checkout page.

---

## 3. The problem MirtPage solves

MirtPage begins from a simple belief: **production is a bet on Ethiopia**.
Workshops, growers, processors, and growing factories commit equipment,
materials, land, training, wages, and daily discipline long before the first
sale. That work develops skills, supports livelihoods, strengthens local supply,
and gives buyers another Ethiopian-made option, yet it is often difficult to
discover or evaluate beyond scattered social posts and word of mouth.

Many of these businesses have products and production capabilities spread
across posts, stories, image galleries, chats, and status updates. Consumer and
wholesale buyers struggle to understand:

- what the business sells;
- which items are currently available;
- what colors, sizes, specifications, or variations exist;
- which products they want to ask about;
- how to send a complete inquiry without repeatedly taking screenshots or typing product names;
- how the business can retain the inquiry if a social-app handoff fails.

MirtPage gives that real production a professional public presence. It organizes
the business's products, capabilities, process, reviewed location, and story
inside a permanent branded showroom; helps consumer and wholesale buyers
discover it by product or place; and adds a structured direct inquiry workflow
without forcing the business into full ecommerce operations. The producer keeps
its identity, customer relationship, and control of the conversation.

---

## 4. What MirtPage is—and is not

### MirtPage is

- a multi-tenant showroom SaaS;
- a dynamic catalog and availability manager;
- an inquiry-cart system;
- a lightweight customer lead-capture system;
- a copy-first inquiry-message builder with configured WhatsApp and Telegram
  handoff, plus phone-required submission into the business's MirtPage inbox;
- an inquiry management dashboard;
- a first-party customer support workspace;
- a platform that supports manually designed, highly distinct client pages;
- a permanent public discovery surface where visitors choose an industry,
  explore exact reviewed business locations or a daily country-wide virtual
  Expo, and enter each business's permanent `/@handle` digital showroom;
- a controlled SaaS pilot with 66 fictional local showrooms spanning makers,
  growers, processors, workshops, natural-care producers, home brands, and
  growing factories; ten are curated benchmark identities and all 66 have durable fictional briefs,
  advised palettes, independent logos and heroes, coordinated booths, and four
  imaged offerings while exercising discovery and high-volume operations.

### MirtPage is not

- a generic theme marketplace;
- a payment processor;
- a full shopping cart and checkout system;
- an accounting system;
- an ERP;
- a tax engine;
- an automatic order-fulfillment system;
- a checkout marketplace or shared storefront that replaces each business's
  permanent showroom identity;
- an excuse to make every client page look like the MirtPage landing page;
- an AI product merely because AI may help generate custom designs.

Use the terms **inquiry**, **inquiry cart**, and **customer inquiry**. Do not casually rename inquiries as paid orders.

---

## 5. Non-negotiable design philosophy

### 5.1 Every client showroom is deliberately designed

Client pages are not one generic layout with different colors. The current
default is a deterministic composition assembled from independently reviewed
components, an exact token system, bounded motion and decoration, declared
content bindings, and client-specific section choices. Component reuse must not
collapse distinct brand identity into one theme.

Each client composition can have its own:

- logo;
- typography;
- visual hierarchy;
- navigation;
- hero composition;
- product-card structure;
- product-detail presentation;
- backgrounds;
- animations;
- buttons;
- inquiry-cart treatment;
- section anatomy within the canonical journey;
- mobile behavior;
- favicon;
- social-sharing image;
- brand voice.

Shared behavior is acceptable. Shared visual identity is not.

Every direct client-showroom design command uses the repository workflow in
`showroom-projects/WORKFLOW.md`. The client folder is the working source for the
brief, approved assets, visual references, booth direction, and review evidence.
Design begins from that evidence and the machine-readable component bank, not
from industry stereotypes. A candidate is not complete until its 1440-pixel and
390-pixel screenshots are inspected, defects are recorded and corrected, and
the final recipe remains inside the normal private review/publication boundary.

Normal generated showrooms share one purposeful information architecture:
header, hero, about/story, process, products, inquiry call-to-action, and
footer. The AI varies the visual anatomy, media treatment, typography, density,
and component choice inside those roles; it does not add trust ledgers,
information summaries, standalone navigation, or other filler chapters, and it
does not reorder the five content sections.

All seven admitted headers and all six admitted footers expose distinct,
industry-neutral machine-readable anatomy and materially different responsive
layouts. Header and footer are selected independently by identity scale,
available content, visual weight, and mobile behavior. Headers carry identity
and at most one concise descriptor; they do not repeat catalog or inquiry
commands. Footers close with identity, the permanent showroom handle, and the
configured inquiry/contact destination; they do not repeat product-category
navigation. The one floating inquiry control owns persistent cart access and
contracts to an icon-sized, accessibly named control on phones.
Adjacent about/story and process chapters alternate heading/body placement on
wider screens, return to semantic heading-first reading order on phones, and
may use any reviewed semantic surfaces that keep their purposes distinct.
Normal showrooms do not use
repeating plaid, pinstripe, graph-paper, center-divider, or repeated-rule
background motifs; one bounded accent plane may provide direction without
turning the page into a grid.

Never turn the shared composition interpreter into a visually generic theme.
`ADR-0005` and `BE-004` define the accepted constrained-composition foundation:
external AI may propose an exact combination of approved, versioned components,
one reviewed non-color foundation, optional contrast-safe custom colors, and
bounded properties as declarative JSON, while MirtPage validates and renders it.
The current `showroom-bank@1.2.0` release contains 67 reviewed component
variants across eight section families and 18 semantic token systems.
Every component exposes bounded `quiet`, `balanced`, or `expressive` motion and
`clean`, `subtle`, or `signature` decorative depth. Those settings are CSS-only,
scoped, reduced-motion safe, and cannot carry arbitrary code or style values.
Authorized staff can inspect every component in a synthetic, read-only visual
laboratory, including a true container-based 390-pixel phone preview. `FE-006`,
`BE-007`, and `DEP-006` establish the current public/private composition
renderer, revision-schema-v2 persistence, exact client-content mapping,
publication, rollback, and four-example-client cutover. The implementation
checkpoint under `FE-007`, `BE-008`, and `DEP-007` adds a permission-scoped
staff design studio: staff import a strict complete design, fulfill its labeled
post-import image checklist with verified assets, export a sanitized brief and
exact current design with portable schemas/current content/component-bank rules,
import a strict
combined content/design recipe, inspect safe validation failures and count
differences, and open the resulting private revision preview. Imports are
idempotent, remain private, and preserve the existing client-approval and
manager-publication path. Components now declare image media-slot requirements,
and recipes may use only request-scoped opaque asset keys. Remote image URLs,
embed markup, arbitrary providers, inventory, and cross-tenant assets are
rejected. A strict six-type content-block parser, additive design-v2 validator,
and portable v2 schemas now exist. Controlled YouTube watch/share URL
normalization and privacy-enhanced embed derivation are implemented as a
network-free contract. Authorized staff may enable a separate, default-off
admission capability that stores only normalized provider IDs and exports
request-scoped opaque keys; raw URLs are never stored or exported. CSP-gated
rendering, revision-v4 persistence, typed content blocks, and focused
post-import controls are implemented locally under the promoted v4/bank-1.2
work. The current local checkpoint passes the standard check, release,
container, and ten production-browser acceptance scenarios, including
CSP/provider-video proof, the focused design workspace, current-design export,
staff offering creation, client approval, and publication. `FE-014`, `BE-013`,
`FE-015`, and `DEP-011` record the completed local blueprint, composition-
fitness, marketplace, and showroom visual-benchmark scope. Remote checks
and any production/data-preserving rollout remain separate future evidence.
The product owner has promoted that completion work and a creative expansion to
the active roadmap under `FE-009`, `BE-010`, `DEP-009`, and `ADR-0007`. The
implementation is additive: revision v4/content-schema v2/design-schema v2 and
`showroom-bank@1.2.0` coexists with retained v1-v3 revisions and the immutable
bank 1.1 release. The admitted synthetic laboratory
contains 67 reviewed components, 18 token systems, and 98,280 required-slot
combinations with stronger editorial, tactile, product-led, source-led,
spatial, precise, high-contrast, and information-dense art direction. Bounded reveals
and interactions must be CSS-first, mobile-safe, static without support, and
disabled by reduced-motion preference; arbitrary code, copied trade dress,
autoplay, parallax, and scroll-jacking remain prohibited.

### 5.2 MirtPage must have its own platform identity

The MirtPage landing page must not look like any client showroom. It is a polished,
mobile-first discovery surface designed to remain understandable inside TikTok
and other in-app browsers. `FE-021`, `FE-024`, `FE-027`, `FE-028`, and `FE-029` define the current composition, narrative, venue art direction, and platform visual system: a compact
midnight-and-teal visitor welcome introduces one integrated,
application-first discovery workspace combining industry selection, search, a
disclosed paid-sponsorship rail, exact-location Ethiopia map, and server-paginated
five-row List. A separate weekly country-wide Expo program follows the map inside
the same workspace. Monday through Saturday each have one stable assigned
industry; Sunday presents MirtPage-selected Featured Enterprises from one
deterministically rotating industry through MirtPage social livestreams.
Long platform education lives on `/about`, signup lives on `/request`, and only
a restrained merchant call-to-action follows the marketplace. There is no
duplicated all-business directory or browser-side full-catalog List fan-out.
The welcome uses short, confident, concrete language: visitors can search what
Ethiopia makes by product or place, inspect a professional showroom, and begin a
direct retail or wholesale inquiry. It avoids motivational clichés, generic SaaS
claims, and childish slogans while visually connecting directly to the
workspace. The fuller story of production risk, practical skill, livelihoods,
and local supply belongs on `/about`;
merchant education and conversion remain secondary content below the public
discovery experience. Platform copy must not claim verified tax, employment,
certification, import-substitution, sales, or other outcomes for every listed
business, and MirtPage mission copy must not be injected into client-owned
showrooms. Every public showroom and private preview is framed by one compact,
platform-owned **Powered by MirtPage** band with a concise visible **Back**
action whose accessible name identifies the MirtPage marketplace destination.
This host chrome sits outside the tenant renderer and must not replace,
obscure, or visually compete with the tenant's logo, header,
navigation, or content. Its surface, border, text, and focus colors may derive
from the approved tenant palette so the compact band belongs beside the site;
the MirtPage mark, host wording, and Marketplace action remain controlled
platform identity.

MirtPage-owned surfaces use one semantic identity system derived from midnight
navy `#0B1D3A`, deep teal `#0D6B6E`, bright teal `#27A5A1`, saffron
`#F2B01E`, and cool gray `#F3F5F7`. Navy carries identity and structure, teal
carries primary actions and selection, and saffron is reserved for bounded
warning or exceptional attention states, never the Expo Today treatment. Sponsored placement uses bright-teal accents and
an explicit paid label over a restrained midnight patterned field instead of a
warning color. Public pages, task forms, discovery, and
authenticated workspaces share the same vector mark and split-color wordmark.
Client showroom logos and approved or custom showroom palettes remain
independent and are never replaced by the platform palette.

Expo and City Showroom floors use a locally stored, optimized architectural hall
shell: a cohesive overhead interior with light walls, glass entrance, reception
architecture, integrated planting, lighting, and a quiet open floor. The artwork
contains no people, seating, businesses, booths, products, text, or fixed
business positions. If it is unavailable, the floor falls back to a neutral
surface without affecting discovery.

Business cards are placed by a deterministic rectangular-perimeter layout. They
run around all four sides of the hall while the central court remains empty. As
participation grows, the hall and its side-slot count expand systematically;
every business receives one unique non-overlapping position. Computed floor
dimensions and positions remain authoritative, and the architectural image
never determines business placement.

The discovery map uses locally stored, attributed Ethiopia region and zone
boundaries plus an offline-derived OpenStreetMap place and major-road subset.
Visitor browsers make no runtime request to a tile, geocoding, routing, or map
provider. Each eligible business appears at its reviewed WGS84 coordinates.
Nearby markers form numbered zoom-dependent clusters. Repeated activation zooms
to either an isolated exact-coordinate marker or, when two or more matching
businesses share a reviewed city and region, one close-zoom counted city
gateway. The gateway centroid is only a discovery affordance and does not change
any business address. Activating it replaces the map inside the same frame with
a virtual City Showroom:
every grouped business occupies one dynamically sized floor that visitors can
pan and zoom, with no halls, pagination, route change, or hidden overflow.
The geographic renderer is suspended while this floor is open, and **Back to
map** restores the same map state. Isolated business pins use the same teal
identity as numbered clusters while retaining their distinct pin shape.
Location controls show only places with
matching businesses, and the center control restores the country view.

The Monday-through-Saturday Expo is a virtual presentation, not a physical
location claim. It uses one dynamically sized top-view floor, restrained
architectural context, no people, and direct pan/zoom/fit controls. Every booth
remains on that floor; there are no halls, pages, or hidden overflow records.
The seven-date selector remains in fixed Monday-through-Sunday order for the
current Ethiopia-local calendar week. Its midnight-and-teal **Today** indicator
moves to the current weekday without reordering the cards or using saffron.
Selecting another date opens a six-second anonymous preview and then returns to
today; selecting a different preview restarts that timer without changing map
filters. The selected calendar date, not map filters, chooses its industry.
Monday is Electronics, Tuesday Beauty &
Care, Wednesday Food & Farming, Thursday Machinery & Tools, Friday Home &
Living, and Saturday Fashion & Textiles. Today's Expo reveals each business's
identity, approved account-owned booth image, preview, and permanent Visit Showroom
link. Selecting any other date returns only count-preserving anonymous booth
outlines; business identity, handle, media, and destination are not serialized.
Sunday uses the same coherent floor interaction for Featured Enterprises.
The active industry advances once per Ethiopia calendar week through all six
industries and then repeats. Administrators curate each industry's participants
independently from sponsorship, and public copy identifies MirtPage as the
founder interviewer and livestream host. The floor reveals its selected
businesses only on Sunday. Every booth exposes a stable
`{industry-code}-B{booth-number}` reference. A business must have an
active published showroom, one published offering, a matching reviewed industry,
valid reviewed location, an approved discovery profile and media, and no
discovery exclusion. Subscription or payment dates do not determine public
eligibility. Map, List, Sponsored, and Expo use the same server-authoritative
eligibility rules, while map search/industry selection and the date-selected
Expo remain independent projections.

Sponsored treatment is paid placement inside this one result set, not a separate
or duplicated catalog, and is always disclosed as **Paid placement**. Sponsorship
does not imply endorsement or Sunday selection. The fixture marketplace has at
least five sponsored showrooms in every industry; all other eligible showrooms
remain discoverable. List cards, map previews, and
Expo booths link to the authoritative permanent showroom. Approved booth media
belongs to its represented business; a generic named booth is only a failed-file
display fallback and cannot make an incomplete profile eligible. The useful
product explanation lives on `/about` and in the compact merchant invitation,
and a visually distinct merchant CTA closes the page. Public controls have at least
44-pixel touch targets and the complete composition is verified without
horizontal overflow at 320 and 390 CSS pixels.

The homepage CTA links to review-gated client signup. Signup creates an
authenticated private business workspace and onboarding request from bounded
contact, handle, password, and showroom-description fields. It accepts no public
file upload and creates no public marker, Expo booth, catalog, or showroom.
Existing administrator-created invitations and the attachment-free legacy lead
endpoint remain supported parallel intake paths. The homepage and request flow
use professional copy with no development-stage disclaimers. The public
composition is verified without horizontal document overflow at 320 and 390
CSS pixels.

The public login and business-signup routes use the same MirtPage header,
solid purple, white, charcoal, and cool-neutral platform language as the
homepage and About page. Each is a focused task surface with one purple context
panel and one white form panel on wider screens, stacked in semantic order on
phones. They do not return to the former promotional gradients or oversized
rounded-card treatment, and their authentication and intake contracts remain
unchanged.

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

The wider disposable seed contains 56 additional authored businesses, including
eight growing factories, distributed across six industries and reviewed
Ethiopian locations. Reset creates 66 total businesses with 264 imaged
offerings, at least five sponsored placements and five independently curated
Sunday candidates in every industry, exactly ten retained legacy benchmark flags,
approved discovery media, reviewed
production-scale metadata, exact map coordinates, and
complete dynamically sized Expo floors. Each has a durable fictional client
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

MirtPage stores business content in the database. Client renderers must consume dynamic data rather than hard-coding products.

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

MirtPage uses **Offering** as the internal umbrella for a standard product,
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
    them.
12. An offering may display one optional non-negative ETB price, one normalized
    merchant-defined offered-by unit, and up to six concise highlights. These
    fields support inquiry context only and never create checkout, payment, tax,
    inventory, or price-verification behavior.
13. Each offering and each showroom may carry one controlled YouTube reference.
    Public rendering derives a privacy-enhanced embed or normal watch link from
    the canonical provider ID; recipes and users cannot supply iframe markup.
    The showroom-level process video appears inside the canonical Process
    section and is loaded only after the visitor activates its play control. It
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

## 8. Inquiry-cart workflow

The inquiry cart is MirtPage’s central conversion feature.

Expected customer flow:

1. A customer browses a client showroom.
2. The customer selects a product or capability.
3. The customer selects required option values.
4. The customer adds the item to the inquiry cart.
5. The customer can add multiple offerings.
6. The customer may state a concise desired quantity with units or packaging
   for any offering, leave it open, and remove items.
7. The customer activates the primary **Copy inquiry** action without providing
   a name, contact value, or note.
8. The exact copied text remains visible and selectable as a reference.
9. When the business configured them, the customer may instead open WhatsApp
   or Telegram with the prepared message.
10. The customer may separately enter a phone number and activate **Send
    inquiry** to save the structured cart in that business's MirtPage inbox.
11. Direct MirtPage delivery requires a normalized phone number with 7–15 digits
    and shows an explicit success or failure state.
12. Copy and social-app preparation do not fabricate a saved dashboard inquiry
    and do not claim that copying delivered the message.

The current inquiry cart opens as a bounded floating task panel with visible
outer margins on desktop. At 320 and 390 CSS pixels it becomes a safe-area-aware,
bottom-anchored near-full-height sheet with one internal scroll region. Opening
locks background scrolling; closing restores it and returns focus to the
opener. Close, optional quantity, remove, clear, copy, and configured handoff
controls provide at least a 44-pixel mobile touch block. The panel inherits the
active showroom's semantic type and color roles while preserving contrast. One shared persistent
inquiry trigger remains fixed inside the viewport across every showroom anatomy,
shows the current selected-item count, and opens the same cart without requiring
the visitor to return to the header. At phone widths it becomes a compact
icon-sized control, and its visible badge is omitted while the cart is empty.

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

## 10. Showroom directory behavior

MirtPage’s directory must scale without dumping every tenant onto the page by default.

Default behavior:

- show no more than five active public showrooms on the current page;
- provide live search plus simple Industry controls;
- do not expose category filters or duplicate all-business/reset navigation;
- reset to page one when search or Industry changes;
- fetch no more than five List records per response page using database count,
  limit, and offset queries;
- show previous/next pagination only when more than five records match;
- do not let result panels cover filter controls;
- support business name, handle, product, industry, and relevant description search;
- keep reviewed **Workshop / producer** and **Growing factory** scale metadata
  available to authorized administrators without exposing it as a public filter;
- place live search, available-location jump, map/list mode, and zoom/center
  controls in one compact teal command area immediately above the map;
- ignore legacy public `scale` query state so no invisible filter narrows results;
- ensure mobile usability and keyboard accessibility.

---

## 11. Public client signup

The MirtPage landing page leads businesses to a simple review-gated signup. It
creates a private client account, draft business, explicit client access profile,
and tenant-bound onboarding request atomically. It does not publish anything.

Required inputs and limits are controlled by `FE-021`, `BE-020`, and `DEP-017`:

- name and email;
- phone or WhatsApp;
- business name and preferred Showroom handle;
- strong password and confirmation;
- one showroom description of 20–4,000 characters;
- processing consent;
- no public file or image inputs.

Requirements:

- use bounded JSON, exact-origin checks, privacy-preserving IP/email rate limits,
  strong password hashing, safe conflicts, and an idempotency token;
- commit the draft tenant, client identity, access profile, request, and event in
  one transaction or roll back all of them;
- authenticate the new client into the private request destination;
- reject multipart/file submissions before storage;
- ignore or reject browser-supplied publication, location, industry, featured,
  and media authority;
- keep the draft absent from public showroom, map, list, featured, and Expo
  surfaces until exact authorized publication;
- retain administrator-created invitations and the legacy attachment-free lead
  endpoint as parallel operations paths.

---

## 12. Fulfillment boundary

MirtPage does not book, quote, dispatch, or track delivery. Businesses and
customers confirm payment, collection, shipping, returns, and fulfillment
directly after an inquiry. No workspace may expose a logistics provider,
delivery request, delivery status, or simulated fulfillment capability.

The former demonstration routes remain retired and return the normal not-found
response. Dormant legacy tables may remain through the data-preserving rollback
window, but application code must not read or mutate them.

---

## 13. User roles

### MirtPage administrator

The administrator can:

- accept legacy public leads and invite clients;
- review self-created private client workspaces and onboarding requests;
- create a draft client workspace and invitation without requiring a prior
  public interest or service request;
- reset client passwords and revoke their sessions;
- provision individual operations-manager and team-member accounts;
- manage request assignment and customer operations;
- publish only an exact client-approved revision;
- suspend or restore an established showroom without editing its content;
- preview draft showrooms securely;
- inspect operational status;
- roll back to a retained publication as a new content version.

### Client

A client has a minimal workspace bound to one business. The client can create
that private workspace through public signup or receive an administrator-issued
invitation. The client can:

- submit an unstructured first-showroom or change request with private reference
  images after invitation;
- read and reply to attributable clarification messages;
- see their own request history;
- review an exact private showroom revision and approve or reject it;
- view customer inquiries without mutating them;
- after first publication, use **My offerings** to create products or
  capabilities and maintain their type, optional desired-quantity behavior, name,
  description, production facts, primary image, descriptive availability, and
  compatible existing product-category placement;
- view their showroom and manage their account password.
- view advisory monthly renewal state, history, and aggregate direct, map/list,
  and Expo visits;
- open, reply to, close, and reopen tenant-scoped MirtPage support conversations.

Clients cannot directly edit business settings, design, categories,
options, ordering, slugs, structural publication state, or complete showroom
revisions. They cannot delete/unpublish products structurally, update inquiry
status, or operate fulfillment.

Assigned team members receive that same narrow product-upkeep authority for
assigned businesses so MirtPage can provide extra customer service. Operations
managers and administrators can perform it within their explicit scope. Each
basic update publishes a retained new content version with actor attribution
and stale-version protection; full structural and visual work continues through
private revision, exact client approval, and manager publication.

### Operations manager and team member

Operations managers can create or invite clients, record requests on their
behalf, review and assign work, ask clarifying questions, manage inquiry
activity, publish approved revisions, and perform retained-version
rollback. They can also record a manual monthly renewal without a configured
price, review account health, configure support-agent limits, inspect workload, and
reassign support conversations. Team members see only assigned requests and their associated
read-only business context; they can ask clarifying questions and prepare
private revisions but cannot invite, assign, publish, or perform customer
operations. Enabled support team members additionally receive least-loaded
support assignments up to their configured limit and can reply, close, and
reopen assigned conversations. Platform administrators, operations managers,
and team members can view the internal showroom component laboratory; clients
cannot.

### Public customer

A public customer does not require an account. The customer can:

- browse an active showroom;
- filter products and capabilities;
- select options;
- build an inquiry cart;
- optionally add desired quantities;
- copy the prepared inquiry without personal-detail fields;
- continue through configured WhatsApp or Telegram;
- enter a required phone number and send the structured inquiry into the
  business's MirtPage inbox.

The access-profile layer distinguishes platform administrator, client, team
member, and operations manager. Every account has an explicit profile.

### Managed service — versioned client-approved publication

Current verified behavior:

- Businesses can self-register into a draft private workspace and submit a
  first-showroom request. A separate attachment-free expression-of-interest
  path remains available for prospects who prefer staff follow-up.
- Public interests use random references, idempotency, bounded JSON,
  privacy-preserving rate limits, events, and additive schema migrations.
  HTTP and database boundaries both prohibit attachments on public leads.
- Platform administrators have a private operations queue for reviewing the
  immutable original interest message and moving it through early review
  statuses. They cannot mark it client-approved or published from this queue.
- Authorized operators can accept a public onboarding lead, create or link its
  draft business, and generate a random single-use invitation that expires
  after 72 hours. Only the token hash persists; the raw manual-delivery link is
  shown once, and replacing it revokes older unused invitations.
- Authorized operators can also create a private draft business and invitation
  directly for a referred client without fabricating a public lead or request.
- Invitation redemption atomically creates one business-bound client account
  with the restricted client access profile and cannot be replayed.
- Invited clients have a minimal private workspace for requests, read-only
  customer inquiries, offering upkeep, support, showroom preview, and
  account security. Before first publication, product upkeep is hidden and a
  deep link returns to the first-showroom request. After publication, only the
  bounded **My offerings** fields are available; structural catalog,
  business-setting, design, and inquiry-status mutations remain
  hidden and denied on the server.
- Authenticated clients can submit a 10–10,000 character written instruction.
  Request intake is attachment-free. The intake captures business archetype,
  products/capabilities stage, and
  photography stage while asking what the business sells, makes, grows,
  supplies, or can manufacture and any known capacity, minimum-order, and
  lead-time facts. Page structure and dynamic offering/media counts remain with
  the blueprint workflow. After import, missing photography becomes labeled
  recipe destinations that accept verified private uploads, not an unexplained
  “no images” state.
  The server derives first-showroom versus change request from retained
  publication state; the browser cannot choose or forge it. Requests are
  tenant-bound, idempotent, and visible in the client’s request history.
- Platform administrators can provision individual operations-manager and team-
  member accounts with a temporary password that must be changed on first use.
  Shared staff credentials and public staff registration are not supported.
- Operations managers can review all requests, create client workspaces, accept
  and invite prospects, submit a request on behalf of a prospect or client, and
  assign or reassign work. They can also update inquiry status. On-behalf
  request type is server-derived for existing
  clients. On-behalf intake is attachment-free and records the same business,
  catalog, and photography context as client intake; images are added only to
  labeled destinations after design import.
- Team members see only assigned requests and associated business/showroom
  context. Assignment changes add or remove that scope atomically. For an
  established assigned showroom they may perform the same bounded product
  upkeep with a required customer-service note. They cannot invite clients,
  submit on behalf, assign work, restructure the catalog, or use settings,
  design, or inquiry-status forms.
- Platform administrators, operations managers, and team members can open the
  staff-only component laboratory. It uses synthetic fixture content, exposes no
  tenant/customer data, and has no revision, AI-provider, or publication action.
  Clients and anonymous visitors cannot access it.
- Assigned staff prepare bounded structured business/catalog snapshots through
  the staged recipe blueprint studio, fulfill exact labeled media destinations,
  inspect deterministic composition fitness, and edit settings, layout/style,
  page content, and offerings in four focused areas. Drafts do not mutate live rows; submitted
  numbered revisions are immutable and later changes create a newer revision.
- Invited clients can open the exact private showroom preview for their request
  and approve it or reject it with comments. Superseded previews cannot receive
  a decision, and preview inquiry/cart actions are disabled.
- Operations managers can publish only the latest client-approved revision when
  its base content version still matches live state. Publication revalidates the
  snapshot, promotes selected private references, atomically replaces canonical
  catalog data, activates the showroom, and increments its content version.
- Prior published snapshots are retained. Authorized operational rollback
  republishes a retained snapshot as a new monotonic content version rather than
  erasing publication history.
- Clients and authorized staff can exchange attributable clarification messages
  without rewriting the immutable original instruction. A staff question moves
  eligible work to needs-information; a client reply resumes review. Clients
  see staff authors as the MirtPage team while internal views retain attribution.
- Request, invitation, and new-request screens provide breadcrumbs and a Back
  action with a deterministic parent fallback.
- Authenticated workspace navigation keeps each actor in a role-oriented,
  icon-supported workspace. Platform overview, businesses, clients, staff
  access, support inbox, and support-agent capacity use stable destinations;
  server-paginated collections become compact records on narrow screens. The
  public site is a separate, explicit link, and an authenticated visit to the
  login route returns to the dashboard instead of showing a second sign-in
  form.
- High-volume dashboard collections use bounded server queries: five public
  showroom cards or 10 authorized workspace rows per page. Businesses, clients,
  staff, requests, products, inquiries, support conversations, and discovery profiles have
  linkable search/filter state, accurate counts, and focused record actions.
  Business and staff selection never loads the complete account into a dropdown;
  discovery administration edits one business-specific profile, and inquiry rows
  include item summaries without per-row follow-up queries.
- Platform administrators manage paid sponsorship state/order and
  industry-specific Sunday Featured Enterprise state/order from the same focused
  discovery profile. These programs persist independently and do not change
  showroom publication authority.
- Role-scoped dashboard attention cards summarize new accounts, actionable
  showroom requests, tenant-safe new inquiries, and support conversations that
  need a reply. Counts are live aggregates and link to bounded working queues;
  they never expose another tenant's content.
- Every business has a manually operated monthly renewal ledger. Its dates are
  advisory operations records and never automatically hide, redirect, or remove
  an active published showroom. Operations may record renewal without collecting
  an amount or requiring a configured price. Only explicit administrator
  suspension removes a published Showroom from public access and discovery. There is
  no checkout, payment gateway, automatic debit, or public pricing claim.
- Showroom visits use an opaque first-party visitor token hashed with the privacy
  salt and deduplicate per business, source, and day. Clients see aggregate
  direct, map/list discovery, Expo, and recent counts; raw IP addresses are not stored
  and traffic counts are not billing authority.
- Authenticated client support is stored inside MirtPage. Enabled agents have
  configurable concurrent limits; new conversations transactionally select the
  least-loaded available agent or remain waiting. Assignment history and
  lifecycle events are retained, open threads refresh every five seconds, and
  Telegram may send metadata-only secure dashboard links. WhatsApp is an
  optional emergency handoff, never the support source of truth.
- Platform-owned homepage, discovery, intake, login, legal, favicon, and workspace
  surfaces use one MirtPage mark and wordmark without replacing any tenant's
  showroom identity. Public intake and login also share the solid platform
  palette, compact form geometry, and responsive public header. Authenticated
  navigation groups role-permitted work in a neutral desktop sidebar and
  exposes the same destinations in a focus-contained mobile drawer rather than
  a clipped horizontal link strip.
- Clients see a revision preview action only after that exact revision is sent
  for review. A staff-only draft is described as being prepared, and client
  request history replaces internal assignment IDs, raw status-transition
  syntax, revision metadata, and unknown workflow detail with customer-safe
  progress descriptions. Authorized staff retain complete operational detail.
- The ten benchmark business accounts and every former compatibility owner are
  restricted clients. No legacy-owner role or direct live-content workflow
  remains.

Accepted behavior still to implement:

- Automated invitation delivery by email or WhatsApp remains planned, not
  claimed; the controlled pilot uses manual secure delivery.

---

## 14. Custom showroom integration contract

Custom renderers may be manually written or AI-generated, but they must preserve the MirtPage smart-feature contract.

The renderer owns:

- layout;
- typography;
- color system;
- logo presentation;
- navigation appearance;
- hero design;
- animations;
- product card design;
- product detail design;
- responsive layout;
- section order;
- visual inquiry-cart treatment.

MirtPage owns:

- business data;
- categories;
- products;
- option groups;
- availability;
- inquiry state;
- inquiry persistence;
- social routing;
- authentication;
- tenant isolation;
- media validation;
- database writes.

Custom renderers must not:

- query SQLite directly;
- hard-code tenant products;
- hard-code availability or stock;
- hard-code business contacts;
- bypass shared inquiry validation;
- write directly to protected APIs without the approved shared client logic;
- remove required add-to-inquiry behavior;
- remove the inquiry-cart trigger;
- silently translate merchant-entered values;
- weaken accessibility or mobile behavior;
- introduce another tenant’s assets.

Use the files under:

```text
showroom-sdk/
```

A custom design must include or satisfy a manifest that identifies:

- design key;
- design name;
- supported features;
- required smart-component integration;
- expected responsive behavior.

AI design workflow:

1. Copy the showroom SDK template into a separate workspace.
2. Provide the AI with sample catalog data and the integration rules.
3. Allow the AI to redesign every visual section.
4. Preserve props, callbacks, data types, and required smart-feature hooks.
5. Return the renderer and assets without a database copy or secrets.
6. Register the renderer under a unique design key.
7. Preview with the tenant’s real dynamic data.
8. Run design validation, type checking, build, and release tests.
9. Publish only after visual and functional review.
10. Keep the previous design version available for rollback when practical.

### Constrained component-bank production system and planned AI workflow

The current default is a deterministic showroom composition system, not runtime
execution of tenant-specific AI code. `BE-004` through `BE-007`, `FE-004`
through `FE-006`, and `DEP-004` through `DEP-006` establish the bank,
laboratory, schema-v2 persistence, renderer, and controlled cutover. The
remaining AI-assisted delivery sequence is recorded in
`docs/SHOWROOM-COMPOSITION-ROADMAP.md`.

- Approved component implementations, schemas, fixtures, examples,
  compatibility metadata, and tests enter immutable bank releases through the
  repository review and CI workflow.
- `showroom-bank@1.2.0` currently admits 67 variants across eight section
  families. Eighteen token systems cover quiet editorial, organic, tactile,
  spatial, precise, high-contrast, utilitarian, and expressive visual
  directions. Their legacy stable IDs are not industry suitability signals.
  Bank 1.1 remains immutable and readable for retained revisions.
- Those 18 systems are machine-readable semantic foundations, not color names
  alone. Each declares canvas/surface/text, primary and distinct secondary
  roles, neutral layer hierarchy, exact strong/onStrong and inverse/onInverse
  contrast pairs, border, typography, spacing, shape, layout rhythm,
  product-media bounds, and preferred/allowed hero-media integration. A recipe
  may retain any one of these non-color foundations while replacing the complete
  color-role set with reviewed six-digit hex values. Custom colors remain data,
  never CSS, and required text/surface pairs must remain readable.
- Required-slot choices and tokens provide 98,280 validated base combinations
  before optional navigation, content, trust, call-to-action, and bounded
  component properties are counted. Combination volume never replaces visual,
  accessibility, compatibility, factual, or client review.
- The authenticated `/dashboard/design-bank` laboratory renders every admitted
  component from local synthetic fixture data. It is a review/contact-sheet
  surface, not a tenant preview, page builder, or publication path.
- Every admitted component has required bounded motion-intensity and decorative-
  depth properties. The laboratory can compare those settings and force a
  container-based 390-pixel phone layout. Phone layouts use touch-sized
  controls, native swipe rails where appropriate, safe-area-aware spacing, and
  no hover dependency; the user agent's reduced-motion preference always
  disables nonessential movement.
- Customer content remains separate from component code. Revision schema v2
  binds canonical content to an exact validated design manifest and bank
  release for reproducible preview, publication, and rollback.
- The currently implemented external-tool contract validates bounded design JSON
  containing approved component references, an admitted non-color foundation,
  optional custom palette, semantic section surfaces, properties, bindings,
  questions, warnings, and rationale. It receives no credentials, database
  access, publication authority, or ability to register component code.
- Portable JSON schemas guide external tools but never replace authoritative
  server-side schema, compatibility, provenance, tenant, revision, client-
  approval, and publication checks.
- AI may write provisional business, product, capability, and section copy even
  when intake is incomplete. Provenance is optional review metadata and
  questions/warnings are advisory. This freedom creates only a private
  candidate; staff review, client approval, and authorized publication remain
  the authority boundary for public claims and contact information.
- The current implementation uses a full showroom recipe with a separate
  content proposal and design proposal inside a versioned envelope. Content
  currently covers dynamic product categories, products/capabilities, offering
  kind, optional desired-quantity behavior, bounded production facts, options,
  business/meta/contact values, and allowed image keys. Product availability is
  descriptive; numeric product/option inventory is prohibited. The `products`
  key is the single documented compatibility transport for offerings. Compatibility
  collection arrays/removals are fixed empty and all recipe collection
  relationships are null; the server alone may preserve hidden legacy
  relationships for matching stable entities. Dynamic catalog counts remain
  bounded, not fixed by examples. Typed hero, story,
  highlights/trust, information, call-to-action, and video-capable blocks are
  implemented in revision v4/bank 1.2.
- The studio exports a sanitized request/current-snapshot brief with a named
  contract manifest, current schemas, bank contract, source facts, allowed
  opaque asset keys, expected counts, and one fixed client-independent synthetic
  structural example. The example demonstrates nested relationships, options,
  typed blocks, exact assignments, optional empty provenance, and unresolved media planning,
  but its reserved example keys are not import authority and its content,
  counts, component choices, and token choices must not be copied. Contract
  versions are independent and named: recipe/content/content-blocks remain
  version 1 while current design and component-bank schemas are version 2 and
  the component-bank release is separately `showroom-bank@1.2.0`. The brief
  explicitly tells external AI not to normalize those numbers. Staff manually
  import returned JSON and inspect the exact private preview. Re-import
  remains available through the staged Brief, Blueprint, Media, Preview, and
  Review workflow. Authorized staff can use focused v4 controls for foundations,
  custom palette colors, section surfaces, compatible section swaps, bounded
  section properties, content blocks, media assignments, and catalog details on
  editable private drafts.
- Media remains a separately admitted source, not AI authority. A recipe may
  first declare a bounded `mediaPlan` of exact business, product, or content-
  block destinations with purpose, aspect, required state, alt text, and
  factual/illustrative classification. Staff then fulfill labeled slots with
  request-scoped verified images. The recipe and brief contain only stable
  destination identifiers, opaque admitted keys, and safe descriptors; MirtPage
  does not transmit private files to an external AI.
- Authorized staff can upload and admit a verified image directly from the
  detailed revision editor. The same private draft then exposes it to compatible
  logo, hero, story, process, icon, and offering selectors without publishing it.
- The recipe brief enumerates currently valid media destinations with exact
  owner type, opaque owner key, and slot key. Product photography destinations
  use `product_image`; import normalizes that owner key together with the
  corresponding product key. The synthetic example includes an optional labeled
  unresolved product destination to demonstrate the media-plan shape without
  implying that a client media plan must be empty or that example keys are valid.
- Every typed content block must bind to exactly one compatible design section.
  The brief includes a block-assignment checklist, and validation identifies the
  exact unassigned, duplicated, or unknown block key with a corrective action.
- Each component declares named required/optional media slots, permitted kinds,
  bounded counts, and aspect guidance. Content blocks assign admitted keys to
  those slots. Missing or incompatible required media blocks candidate/client
  review. Optional omissions use reviewed no-media treatments rather than
  broken images, unexplained initials, or false photography claims.
- Eight reviewed abstract composition templates describe section roles, pacing,
  surface rhythm, and signature budget before individual variants are chosen;
  they do not prescribe an industry, token pack, or exact component sequence.
  Every normal template preserves the same semantic order: header, hero,
  about/story, process, catalog, inquiry CTA, footer. Templates differ in
  anatomy and art direction, not information architecture.
  All seven header and all six footer variants have unique layout families and
  honest rendered-region descriptions. Header and footer are selected
  independently from objective content and interaction needs; neither profile
  contains an industry or tenant recommendation. Headers expose identity and an
  optional descriptor without catalog or inquiry commands. Footers expose
  identity, permanent handle, and contact destination without category
  navigation. The ten local benchmarks exercise every admitted header and
  footer anatomy.
  Machine-readable guidance declares rendered anatomy, true media-plane count,
  no-media support, fallback treatments, commerce modes, content needs, visual
  tones, recommended product/category counts, long-title and RTL support,
  responsive behavior, unsuitable conditions, fallback components, and
  compatible section-media integration. Selection metadata is
  industry-neutral: legacy identifiers remain stable but do not act as
  suitability signals, and guidance is never inferred from words in IDs.
  Design-v2 recipes let AI choose neutral `natural`, full-section
  `surface_blend`, `edge_fade`, `split_bleed`, `editorial_overlap`,
  `product_stage`, or `hidden`; `ambient_overlay` is retained only for existing
  designs. Every section also selects a semantic `surfaceRole` from `canvas`,
  `surface`, `soft`, `accent-soft`, `secondary-soft`, `strong`, or `inverse`.
  The semantic content order remains fixed, but no one surface-role sequence is
  mandatory; monotony and weak pacing are review feedback. Hero and story imagery is
  borderless and connects to its section only when the recipe explicitly
  selects a blend, fade, overlap, or stage; omitted treatments receive a neutral
  readable default. Product imagery remains proportionally bounded and flush
  with its catalog card rather than becoming an arbitrary loose image block.
  Catalog-owned category browsing uses compact, touch-sized, horizontally
  scrollable tabs with modest corners; it is one shared catalog control and
  does not change shape merely because the AI selects another catalog variant.
  About/story and process chapters use distinct desktop composition and semantic
  single-column phone order. Their independently selected surfaces, media,
  density, and typography provide separation without repeated rules. Repeating
  plaid, pinstripe, graph-paper,
  and center-divider motifs are rejected by bank and browser admission.
  Product detail presentation is also a design-v2 choice. Recipes select one of
  the reviewed `editorial`, `technical`, `product_stage`, or `compact` patterns;
  each inherits the showroom token system, preserves bounded image/video media,
  presents optional price, highlights, unit and capability facts, and becomes a
  mobile bottom sheet without horizontal overflow. Unknown detail patterns fail
  recipe and publication validation.
  Deterministic composition fitness blocks duplicate navigation, standalone
  navigation combined with catalog filters, incompatible sparse catalogs, and
  missing media-treatment prerequisites. It provides review guidance for
  signature-treatment density, surface monotony, adjacent anatomy repetition,
  unnecessary controls, repeated factual media, and intentional product-media
  fallbacks without imposing one universal visual rhythm.
- Initial linked-video support is a manually entered YouTube link normalized
  into a canonical provider asset and rendered by a reviewed, privacy-conscious
  component. Recipes cannot supply raw iframe/embed markup, arbitrary query
  parameters, provider scripts, remote-image hotlinks, or unapproved URLs.
- A business may mark its showroom live on TikTok, Facebook, YouTube, or Google
  Meet. Active state requires a matching allowlisted HTTPS destination and is
  rendered as one concise `Live on: {platform}` action. MirtPage does not host,
  proxy, record, or autoplay the session.
- A direct AI-provider adapter still requires a later accepted provider,
  privacy, failure, cost, and deployment contract.
- All ten local benchmark clients use distinct validated revision-v4/bank-1.2
  compositions. The four
  former renderer keys and schema-v1 parser remain read-only recovery bridges
  for pre-cutover backups; no current seed, invitation, draft, publication, or
  rollback writer creates v1 or selects a former renderer.

---

## 15. Current technical architecture

Current controlled-launch stack:

```text
Next.js 16
React 19
TypeScript
Node.js 24.18.1 LTS
SQLite via node:sqlite
Sharp for verified image processing
Server-rendered routes and server actions
```

Important directories:

```text
app/                  Next.js routes, pages, APIs, and dashboard
components/           Shared UI and showroom application logic
components/showroom/bank/  Reviewed component bank, registry, tokens, and laboratory
lib/                  Authentication, database, security, media, inquiries, support
showroom-sdk/         AI/manual custom-showroom integration package
scripts/              Setup, migration, backup, restore, preflight, release tests
data/                 Runtime database and media when configured locally
```

Important commands:

```bash
npm ci
npm run reset
npm run dev
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
- Never ship a shared known password.
- Generate unique temporary passwords.
- Force password change for temporary or reset credentials.
- Use opaque, revocable server-side sessions.
- Do not use a hard-coded fallback session secret.
- Revoke sessions after password reset or suspected compromise.
- Rate-limit login attempts.

### Tenant isolation

- Every request, revision, customer-operation read, and mutation must be scoped
  by the actor’s explicit role and authorized business/request relationship.
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
- Filesystem storage remains the local/default adapter. A private Supabase
  Storage bucket is the optional production adapter; its service credential is
  server-only and all public/private reads remain behind MirtPage routes.
- Remote object-storage operations use a bounded configurable deadline and
  bounded response reads. A database-derived manifest reconciles every retained
  public and private reference without printing object keys or provider data.
- Preserve stable `/media/<opaque-key>` and private request-attachment
  references across providers. Object-storage migration is copy-only,
  hash-verified, repeatable, and never deletes local sources or rewrites the
  database.
- Set `nosniff` and safe content types.
- Never trust file extensions or browser `accept` attributes.

### Public status

- Only active businesses may render publicly.
- Drafts require authenticated preview.
- Suspended businesses must not render publicly.

### Privacy and operations

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

The controlled MVP is intended for a small managed client cohort on one
persistent server or one persistent container.

Current SQLite requirements:

- one application instance;
- persistent database volume;
- persistent media volume when `MIRTPAGE_MEDIA_DRIVER=filesystem`, or a verified
  private object-storage configuration when the driver is `supabase`;
- WAL mode;
- busy timeout;
- foreign keys enabled;
- migrations before startup when needed;
- automated backups;
- tested restore procedure;
- database integrity checks;
- appropriate file permissions.

Do not horizontally scale the SQLite build across multiple application instances.
`docs/MANAGED-POSTGRES-READINESS.md`, `docs/DEVOPS-RUNBOOK.md`, and ADR-0013
record the required SQL-adapter, migration, job, realtime, backup, and
monitored-cutover work. The current disposable PostgreSQL rehearsal translates
the complete schema, copies rows, installs reviewed constraints, indexes, and
triggers, and reconciles counts and fingerprints while leaving SQLite
byte-identical. A boundary manifest prevents new direct SQLite coupling, but 42
approved runtime modules remain to be ported. Supabase Storage is an implemented
optional media adapter; Supabase PostgreSQL is not a current runtime mode.

The production-only Supabase PostgreSQL and Vercel cutover is planned under
BE-027 and DEP-023. Until their PostgreSQL parity, reconciliation, security,
release, and rollback gates pass, SQLite remains authoritative and no Vercel
deployment may be described as production-ready.

Before broad external rollout or multi-instance production scale, migrate to:

- managed PostgreSQL or another production multi-instance database;
- object storage for media;
- production email and notification infrastructure;
- full observability and alerting;
- stronger account recovery and staff roles;

Production environment must use absolute persistent paths and HTTPS. Follow `.env.example`, `README.md`, Docker configuration, and preflight checks.

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

Prices are optional ETB display context and are not required for every MirtPage
catalog. They are merchant- or reviewer-controlled presentation data, not a
charge, quote guarantee, or checkout amount. The platform’s main goal is
structured inquiry, not online checkout.

---

## 21. Managed client workflow expectations

### Administrator onboarding checklist

When adding a new client:

1. Accept a public expression of interest or create a client workspace directly
   for a referred client.
2. Reserve a unique handle and choose a starting reviewed composition style.
3. Deliver the displayed-once invitation securely; do not create a public
   request merely to provision access.
4. Let the client set a strong password and submit their first detailed written
   request.
5. Assign an individual team member and resolve clarifications in the request
   thread.
6. Prepare settings, contacts, catalog, options, descriptive availability,
   images, and design
   choices inside a bounded private revision.
7. Test the exact private preview, inquiry behavior, social routing, tenant
   isolation, and mobile layout.
8. Obtain the client’s approval for that exact revision.
9. Publish through the operations-manager action only; never copy draft data
   into live rows manually.
10. Retain the prior version for auditable rollback and use operations tools for
    later inquiry and support activity.

### Client workflow

The client uses requests for first-showroom, structural, option, setting, and
visual-design work. The client can follow requests, clarification, inquiries,
private previews, approvals, support, and account security. A request for a
business with no retained publication is a first-showroom request; after
publication it is a change request. The server decides this classification.

After first publication, **My offerings** lets the client create a product or
capability or maintain its offering type, optional desired-quantity behavior, name,
description, bounded capacity/minimum-order/lead-time facts, primary managed
image, availability, and assignment to an existing compatible product
category. The same bounded workflow is
available to assigned team members acting for the client with staff attribution.
It publishes a retained new content version and makes older-base staff work
stale. It does not expose structure creation, options, ordering, deletion,
design, settings, page content, recipe tools, or complete-showroom publication.
`FE-008`, `BE-009`, `DEP-008`, `FE-016`, `BE-014`, `DEP-012`, and `ADR-0006`
control this verified exception and its expanded offering contract.

### Current composition assembly and AI import

The current workflow stores an exact validated composition in each schema-v2
revision and renders it consistently in private preview and public publication.
The structured revision editor remains a bounded content-recovery surface; it
shows the immutable composition identity instead of offering old renderer keys.
The implemented workflow under `FE-007`, `FE-014`, `BE-008`, and `BE-013` is
request, sanitized AI brief, strict full-recipe blueprint import, grouped
content/design/optional-provenance validation, composition fitness, labeled media-slot
fulfillment, private preview, focused exception correction, client review, and
controlled publication.
Routine staff should not enter every category, item, hero field,
story block, or design choice manually. A change recipe is a complete desired
snapshot based on the authorized current version, not an ambiguous patch.
Staff may admit available client images and supported media links before import,
or fulfill exact labeled destinations after the blueprint chooses its dynamic
composition. The recipe assigns opaque keys to typed component media slots; it
cannot create URLs, embeds, or cross-tenant asset references. Missing required
media and incompatible slot assignments remain visible blockers. Provisional
written copy and unresolved questions remain visible review notes but do not
prevent a private candidate. If the external AI needs image understanding, staff
manually supplies only the approved files in that external conversation.
Manual recipe import and its focused staff workspace are implemented as a
private checkpoint under `ADR-0005`; `FE-007`, `BE-008`, and `DEP-007` remain
open until remaining rollout evidence is complete. The component laboratory
remains synthetic and cannot itself alter a tenant revision.
`FE-009`, `BE-010`, `DEP-009`, and `ADR-0007` define the promoted additive
revision-v4 and bank-1.2 release. The strict typed-block/design-v2 contracts,
local reset default writers, focused controls, controlled provider rendering,
and bank-1.2 runtime path are implemented. Old schema/bank readers remain
exact; production rollout still requires remote checks and a data-preserving
or explicitly reset-approved deployment plan.
The separate revision-v4 domain parser is implemented: it enforces the existing
1 MiB snapshot limit, strict catalog content, six typed content blocks, exact
design-v2 compatibility, and an explicitly supplied reviewed bank. It remains
additive to the v1-v3 reader while local reset-created seeds, drafts, imports,
publication, rollback, product-upkeep baselines, and public/private rendering
now use revision v4 and `showroom-bank@1.2.0`.
Schema migrations 13 and 14 add the immutable revision snapshot-version marker
and persisted business content-block storage used by bank-1.2 rendering.

Current development exception: on 2026-07-25 and again for the 2026-07-27
benchmark replacement, the product owner confirmed that the local database and
seeded tenant data are not real customer data
and do not need preservation. For this repository state, MirtPage may finish the
v4/bank-1.2 feature through a reset-only cutover: reset-created showrooms,
drafts, recipe imports, previews, and publications can move directly to
revision v4, content-schema v2, design-schema v2, and `showroom-bank@1.2.0`.
This exception preserves security, tenant isolation, media validation, inquiry
safety, client approval, and operations publication. It does not apply to future
production or data-important migrations; before any later major feature switch,
ask whether the existing data must be preserved and use the careful staged
migration/backup/rollback path when it does.

---

## 22. Testing and definition of done

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
- forced password change;
- session revocation;
- administrator, client, operations-manager, and assigned-team permissions;
- cross-tenant denial;
- active/draft/suspended visibility;
- revision-based settings, design, option, structure, and image changes;
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

When given a new MirtPage task:

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

This file is a living statement of MirtPage's current product reality. Every
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

Every MirtPage change should move the product toward this experience:

> A social seller receives a beautiful, unmistakably custom digital showroom
> without learning a complex site builder. The client describes the business
> and requested changes in their own words; MirtPage staff turn those instructions
> into a private, validated proposal, obtain approval for the exact preview, and
> publish it safely. A customer can quickly discover products, select exact
> options, create one complete inquiry, and reach the seller through the
> customer’s preferred messaging app. MirtPage operations retains the inquiry,
> follows up, while payment and fulfillment remain a direct agreement between
> customer and business without forcing either party into ecommerce checkout.

Protect that experience.
