<!-- MirtPage is the current hosted web brand. DEP-049 governs the remaining Android
and Play stages; historical Suqpage release facts below are retained
only where their phase has not been superseded by the current status here. -->

Current hosted MirtPage site serves public pages and mobile catalog APIs from
Netlify deploy `6ad73e5a9df2756523e8ac95`. Its minute worker now starts
without Next.js request-only imports; monitored scheduled runs complete chat
routing, inactivity, response escalation and queued email checks. The initial
backlog routed waiting chats and the next observed run routed zero. The Gmail
provider accepted two admin alerts, but recipient inbox delivery and a new
labelled end-to-end chat have not yet been checked. Supabase Auth now uses
`https://mirtpage.com` as its primary URL; exact old and new callback URLs stay
allowed and Google login remains disabled. The approved change and an independent
read-only project/configuration check passed. A complete live login remains to be
exercised. Android APK/AAB and the new Play closed test are still separate steps
under DEP-049.

Current shared web/native source uses the approved two-panel M artwork and
English/Amharic/Oromo MirtPage copy. The hosted web introduction is “A
professional digital showroom for every business.”
Customer copy explains what businesses sell, make and grow, with identity,
story, products and optional collections together, followed by direct contact
through the business's configured channels, without searching social-post history.
Existing merchant content/design and application workflows are preserved. Both
web push workers locally accept the exact legacy and new titles; shared sender
titles and Android channel IDs remain compatible. The final public identity is
MirtPage throughout; old names remain only where historical records, stable
provider/protocol identities or a verified transition require them. This does not
authorize deleting business data or replacing credentials. The Android/Play
release remains pending under FE-070/BE-059/DEP-049. Hosted shipment and overdue
staff email uses the separately configured server-only Gmail SMTP sender; live
worker logs show two provider-accepted admin alerts. Recipient inbox delivery
still needs a labelled test. Auth sign-in mail remains a separate service.
The owner approved the combined local visuals on 2026-10-18 and requires the
same approved M geometry and exact logo colors across web, native and exported
assets. GoDaddy ownership, records, and Netlify domain beforeimages are verified.
Both new aliases and approved A/www records are saved/read back; managed HTTPS
covers all four reviewed hosts. The separately approved guarded Netlify switch
now makes mirtpage.com primary, while suqpage.com remains an HTTPS alias. The
published MirtPage deploy is unchanged and all three checked public routes pass.
The new Firebase Android
registration and separate Free MirtPage Play Draft exist for com.mirtpage.app;
its client configuration remains protected. The guarded hosted Auth transition
now makes mirtpage.com primary while retaining both exact callbacks; independent
readback confirms the intended fields and disabled Google provider. The
refined en/am/om text passes27 actual headed Chrome checks/27 states across
desktop/phone web and Expo, with no app/request/console/lifecycle errors. The owner
approves this revised copy and full checks on2026-10-18; unchanged artwork
approval remains valid. The complete 76-group application check and full web
release gate now pass on source-bound isolated candidates. Release includes a
clean dependency audit, production build, finite public-catalog artifact privacy
guard, provider-backed HTTP/security checks and migration/data-isolation checks.
Full browser acceptance now passes all20 cases with exit0 on isolated snapshot
9e8e8e04774ca23af878169c64e6704e60cca35a17df3e9c50d560abdb953f00. Its
application/dependency inputs match the passing release; later test repairs
preserve assertions. Owned test resources are removed and normal previews remain
healthy. Earlier failed/interrupted attempts and13 raw stream-closed errors are
retained. Their occurrence times are unavailable because the synchronous test
runner buffers asynchronous app-log forwarding; shutdown versus navigation is
unproven. Passing local gates do not establish application deployment, a new
native binary or store release.

# MirtPage Project Master Prompt

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
The current web/API release uses source de68832 and production deploy
6aca91cb2f49de22d3839199. Protected backup/restore rehearsal, the owner-approved
controlled retry of migration 63, original-record fingerprints and private report
permissions are verified. Reporting/blocking, updated privacy and one server-bound
ordinary demo reviewer are deployed. Live public routes and real reviewer web/native
API sessions pass; no customer chat, email or notification was sent by these checks.
Production notification configuration and the scheduled worker remain verified;
real OS display/read evidence is separate. See docs/GOOGLE-PLAY-RELEASE.md.
The current Expo-distributed Android APK remains the S98 a81c93f release: built, signature/config/
privacy inspected and checked on an
isolated emulator; physical-phone alerts and authenticated hosted flows remain
separate under DEP-042/DEP-043. Current evidence is in
`docs/SUQPAGE-S98-RELEASE-2026-10-08.md`.

## 1. Your role

You are working on **Suqpage**, a multi-tenant platform giving African businesses
an organized digital showroom for their offerings and links to their own social accounts.
People explore showrooms from businesses around them and further away, browse
products, collections and styles in one place and ask the business directly.
Owners organize their offerings and share a showroom customers can find on the
map or open from a link. People discover
businesses, products and custom-made items through geography, search results
and featured visibility. Growers, makers, traders, retailers, home businesses and
workshops retain their own identity. Suqpage is an online showroom for
makers and manufacturers who have no physical retail store or showroom, an
online extension of existing shops, and a shopfront for people selling from home.
Customers discover offerings and contact the business directly; this promise does
not imply platform checkout or require a public home address. The current catalog
begins in Ethiopia.

Act as a senior product architect, full-stack engineer, security-conscious SaaS developer, UX designer, and quality reviewer. Preserve the product vision while making the application more reliable, usable, secure, and commercially credible.

Do not treat Suqpage as a generic website builder or a conventional ecommerce platform.

The central principle is:

> **MirtPage provides one consistent business showroom and discovery experience.
> Each business owns its content, products and identity; an administrator controls
> platform staff access to business management. Product questions go through the
> business's listed contact methods, while transport and support chat remain here.**

When a user gives an explicit instruction that conflicts with an older preference in this file, follow the newest explicit instruction, but preserve security, tenant isolation, and data integrity.

---

## 2. Product identity

Local S145 native source now defaults to MirtPage/com.mirtpage.app in development,
preview and production. No future Suqpage source-build fallback remains. Existing
EAS IDs/current slug, protocol keys and unbuilt iOS fields are infrastructure;
new iOS workers are denied. This does not claim a new binary or released app.
Local native public pages, legal links and social-video WebView now share the
validated configured API origin, defaulting to `https://mirtpage.com` only when
the development override is absent. Invalid configured origins fail closed;
hosted builds still require their exact separately qualified data target. Expo
browser legal-link navigation is verified locally, while an installed Android
referrer and external-provider playback remain unverified.
The native YouTube WebView's missing-package synthetic origin is
`https://com.mirtpage.app`; actual configured app IDs still take precedence and
its provider navigation and bridge protocol are unchanged. This is local source
evidence, not an Android playback claim.

### Current experience (FE-040–FE-042, BE-032/BE-033, DEP-030)

One shared business profile uses each business's canonical catalog or current
published owner profile. The local FE-067 product-only profile serves businesses selling or making physical products
with a hero/video poster, one About, linked offerings and a separate contact section.
Public and private account contacts remain separate. The current editor is enabled
by default and supports saved drafts, private image uploads, consented staff help,
owner first Publish, subsequent live Save and retained restore. The interactive preview
cannot send inquiries or persist a visitor cart. New workspaces under
FE-046/BE-039 start with sample text, illustrations, video and public
contacts, a general-area example and ready/made-to-order sample products.
Owners replace the examples; original account identity and existing pages stay intact.

Category/search results use five-row database pages alongside a persistent map.
Custom request/design/revision features are retired under ADR-0019. Historical
records/assets and compatible catalog readers remain preserved. Historical asset
briefs and visual evidence remain under showroom-projects/WORKFLOW.md; those files
do not enable a custom-request application feature.

The following S98 Suqpage baseline is historical; the current MirtPage web and
Auth status is recorded at the top of this document and in DEP-049. At S98,
Suqpage was deployed at `https://suqpage.com`, with www redirected to the apex.
The generated Netlify origin remains an infrastructure compatibility address.
Released web source `de688325e3c061e5d5031976b5b2de62e480ae00` and Netlify deployment
`6aca91cb2f49de22d3839199` use schema 63. Complete check, web release, operations,
eleven local production-mode workflows, packaged Linux handler/image/worker and
artifact privacy gates pass. Live public routes, native catalog, protected-route
denial, www redirect and canonical plus historical Android association bytes are
verified in `docs/GOOGLE-PLAY-RELEASE.md`, with the S98 Android baseline retained
in `docs/SUQPAGE-S98-RELEASE-2026-10-08.md`. Real hosted reviewer web/native API
sessions also pass. Regular hosted email and authenticated physical-phone checks
remain separate from the local workflows and restricted reviewer verification.

The S98 product name was:

```text
Suqpage
```

Do not write `SuuqPage`, `Showroom Page`, or another variation unless quoting historical material.

Launch origin:

```text
configured HTTPS Netlify origin
```

At S98, the approved primary was `https://suqpage.com`, with `www` redirecting
to it. That stage's DNS, hosting registration, HTTPS and Auth checks were
verified. MirtPage now owns the primary web and Auth origins; the old domain
remains an alias and allowed callback during the transition under DEP-049.

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

The Suqpage page helps customers browse offerings and prepare a clear message to the business on its configured social accounts. It is not a checkout page.

---

## 3. The problem Suqpage solves

The local S132 candidate under FE-049/FE-052 explains the inclusive showroom
story: businesses that sell, make or grow products organize their range alongside
social posts; customers browse choices and listed availability before sending a
specific message. Web Market has a compact visible introduction on a plain light
background and matching localized SEO/OG/Twitter descriptions. Native keeps the
compact Market and explains the story in About. Amharic/Oromo wording explains
the idea rather than mirroring English. Focused and actual Chrome copy/intake
journeys pass; independent first-language review, visual approval, full gates and
rollout remain separate. Existing promotional graphics/listings are not silently
claimed rebuilt or published.

Suqpage gives businesses an organized digital showroom for their offerings.
Customers can browse named products, understand the models, colors,
styles or types the business has described, see photos/videos and ask about the
right item. Business owners organize their offerings and share one link alongside
their social posts. The local FE-066 candidate routes business questions only through configured
social accounts; customer inbox submission on Suqpage is retired. Transport live
chat and private owner support remain active. Existing private inquiry history
is retained with its authorization boundaries. In this candidate, checkout, automatic imports, structured variant selectors and
confirmed stock are not implied.

Following further October 15 steering, S100's local candidate heading is "Explore
a business’s digital showroom, without the social media clutter." The digital/online
setting is explicit in every locale’s lead. Supporting text invites
discovery near and far, what businesses sell/make/offer, organized collections
and custom-made products, and direct social contact. Customer and business About sections explain collections,
models/colors/styles, merchant-listed availability and creating/sharing a showroom.
Production capacity and timing are merchant-written descriptions and direct
questions, not new dedicated fields, verified facts or real-time inventory.
Each language explains the online display in everyday local wording instead of
literally translating the English invitation. Existing map/search/filter behavior
and prominence stay unchanged; no social account or physical shop is required.
Focused narrative/catalog/type checks and 142 S101 local browser states pass;
new layout review and full gates are
pending under FE-052/FE-049. Prepared listing/campaign source text is aligned;
previously generated artwork and provider receipts stay preserved. Deployed web
and closed Play version 5 retain the preceding S99.10 narrative until a verified
new rollout. Map proximity remains visual discovery, not a numeric-distance or
social-account-matching feature. No provider operation or new binary is implied
by this local text change.

S101 refines the non-English local candidate after the owner's wording review:
the heading explains a business's organized internet page; the supporting text
carries the social-post problem, nearby/distant discovery and direct questions.
Meaning may move between heading and paragraph rather than follow English word
order. Primary references and language-specific decisions are in locales/README.md
(FE-049). This remains an agent-authored local candidate pending visual approval
and full gates; it is not an independently reviewed or published translation.

Many of these businesses have products and production capabilities spread
across posts, stories, image galleries, chats, and status updates. Consumer and
wholesale buyers struggle to understand:

- what the business sells;
- which items are currently available;
- what colors, sizes, specifications, or variations exist;
- which products they want to ask about;
- how to send a complete inquiry without repeatedly taking screenshots or typing product names;
- how to keep a clear product message ready when a social-app handoff fails.

Suqpage gives each shop a consistent public page. It organizes each
participant's story, process, products, capabilities, reviewed location, and
contact options; supports separate business-map and product discovery
with category, country and city filters;
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
removes the chat from open workload and preserves contacts and history; X only hides the chat.
Staff can call and add private notes to ended cases, mark them resolved separately,
or reopen them. The dedicated transport queue retains workload, claim, assignment,
reassignment and Active/Chat history/Resolved filters. The local candidate
retires the superseded private company-handoff form in favor of Tracking.
Business-owner dashboard support remains separate. Local migration 59 extends
closed-only resolution to transport; deployed schema remains 58 until rollout.

Existing records were preserved during the verified 2026-09-27 rollout.
No hosted Realtime configuration or native app has been deployed.

## 4. What Suqpage is—and is not

### Suqpage is

- a multi-tenant market-discovery and public-page SaaS;
- a dynamic catalog and availability manager;
- an inquiry-cart system;
- a localized single-product or grouped message builder with configured WhatsApp,
  Telegram and SMS draft handoffs and visible copy fallback; TikTok, Instagram and
  Facebook are ordinary public profile links, separate from messaging;
- tenant-scoped retained inquiry history, outside primary navigation; new public
  business-inbox submissions return 410 under local FE-066/BE-055;
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
  The local FE-067/BE-056 candidate retires public service listings; retained service records stay private until explicitly converted to products. Ten are curated benchmark identities and all fixtures have durable fictional briefs,
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

Local Tracking (BE-058/FE-069/DEP-048, ADR-0028) is separate from accounts and chats. Staff create independent shipments for a valid requested email before verification; recipients verify that email only to read their shipment list. A recipient may have several plans across different or absent chats. The S141 correction has focused and actual Chrome/Expo evidence; visual/full/release gates remain open with no new deployment.


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
are edited separately from the public contact values. Owners and platform staff
authorized by an administrator use the same standard page editor; the administrator
can revoke a staff member's business-management access.

Chat assignment is internal routing. Only the assigned staff member's explicit
Join chat announces an agent to a customer; reading or claiming is not joining.
Unanswered staff work remains unresolved and visible; customer-idle endings retain
factual reply/read-at-ending evidence under BE-018/050 and FE-019.

The local management candidate opens saved summaries and named task screens.
Your page groups content, appearance and sharing/access; a focused edit exposes
only that task while preserving the complete validated page profile. Required
contacts and editing permissions are not hidden in management accordions.

### 5.2 Suqpage must have its own platform identity

The Suqpage public root must not look like any client page. It is a polished,
mobile-first marketplace application designed to remain understandable inside
TikTok and other in-app browsers. `FE-021`, `FE-024`, `FE-027`, `FE-028`,
`FE-029`, `FE-030`, and `FE-036` define the current composition, narrative,
venue art direction, and platform visual system. `/` opens directly into the
geographic Market; there is no intermediate landing lobby or duplicate search.
The web Market retains its compact visible introduction and SEO narrative.
The native Market keeps the explanation in About. Neither surface has a
duplicate information icon or introductory overlay. One localized programmatic
Market heading remains. About switches between customer browsing benefits and
the business promise: one organized, shareable showroom alongside existing
social channels. Only the selected audience panel is shown. Functional
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
branding. The S103 revision of the local S102 Market (FE-065 / BE-054) is
implemented locally with bounded initial browsing (200 map businesses / 12
cards), products appended on scroll, and a centered switch above opposing
sliding panels. Focused evidence passes; visual approval/full gates are pending. Businesses and Products have independent query/category/
country/city scopes. Text updates results after a short debounce without Enter;
products have a Made-to-order toggle; it narrows products only and resets with Clear. A labeled switch slides the
product panel over the persistent map, leaving a map strip visible. In map view,
a panel edge remains visible. Product controls cover the map search controls;
only the active scope's search controls are interactive. Map zoom remains on the
right. Each product has a short literal description and a separate localized
From business link. Filters have visible words and selection counts, support
multiple values and clearing, and reset only their own pagination. Country is
chosen before City; choices come from eligible published businesses. New UI has
no region chooser. Legacy geographic URLs/API callers remain compatible.
Map previews open above the panels and remain bounded on phones. Query/filter
state, paging and camera survive switching and return navigation. The local
candidate also remembers the selected Businesses/Products panel on ordinary
Market returns; explicit navigation takes precedence as specified in §10. Hidden panel
content is inert and Escape restores the Businesses switch focus. Reduced motion
removes sliding. Shared positioning remains the digital-showroom narrative in §3.
This local implementation is awaiting actual visual approval/full release gates;
the live web/installed Android releases retain their previous shared controls.
The local S113 candidate keeps a labeled **Transport chat** action alongside an
open narrow panel, with measured product-feed scroll clearance. No checkout or
transport booking is implied.
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
description is omitted and broadcast status is compact. The deployed weekday-first
ribbon hides category names on small web screens, while the earlier Expo source
shows only weekday/date. The local FE-021/FE-053 S151 B10 correction passes focused
and actual Chrome web/Expo checks with readable category-first choices, secondary
schedule context and horizontal scrolling when needed. It supersedes forcing all
seven tiny choices into one row. Matching initial silhouettes and selected-choice
restoration are locally verified; visual/full/release and new Android
qualification remain pending. Daily Featured uses an
ordinary responsive image-card grid that grows downward without venue scaling,
map-style zoom, or pagination. The Ready S127 map picker admits only what fits together on the current
screen: up to6 desktop/3 phone, reduced for height/font scale, without list
scrolling or pager controls over the unchanged map. Long platform education lives on `/about` and
signup lives on `/request`. There is no duplicated
all-business directory or browser-side full-catalog List fan-out. The public
Daily Featured route is a bounded application workspace rather than a scrolling
promotional document. Its gallery owns the available workspace below one compact H1,
broadcast status, collapsed schedule summary, attached sponsor surface, and fixed
weekday ribbon. Expanding the schedule scrolls its agenda internally without
hiding application navigation.
The local public application shell exposes Market, Featured, About and
Login while signed out or Account after sign-in. No customer-inquiry inbox is
exposed. Desktop navigation separates Explore, Account and Information; legal,
Login and setup routes share the same public shell. The Account destination stays
role-aware: owners enter their compact hub and staff enter their authorized web
workspace. Account creation remains available from Login.
Each screen has one communication job. Market helps visitors find businesses and products. About explains
an accessible digital presence for African businesses, the Ethiopia-first catalog,
and discovery through location, search, result lists and Daily Featured. Login explains passwordless account access. Setup
collects private account details. Business owners use Account → Support for
platform questions. There is no public Ask for help entry. Need help with transport?, with an invitation to chat live with transport agents, opens route/name/phone intake and
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
The local browser correction uses Leaflet's public asynchronous GridLayer and
one status-checked CORS fetch per visible256px tile, with default caching,
omitted credentials and an origin-only cross-origin referrer. Successful blobs
are released after decoding; obsolete work is cancelled on unload/disposal.
Private Tracking keeps no-referrer; public metadata explicitly restores the
public policy on SPA return. Failed raster is removed while business markers,
camera and controls remain available with a localized48px Retry map action.
Retry does not change provider/identity/URL or bypass caches. Internal failure
kind/status never includes request URLs, response bodies or customer data.
Cluster and marker reconciliation occurs after Leaflet movement settles and is
bounded to the committed viewport. Exact storefront/legacy businesses keep their saved WGS84 coordinates. City/area
shops use stable business-ID-based offsets within 1.5 km of the public anchor,
without changing saved coordinates or shifting when filters/pagination change.
The latest Ready S127 correction (FE-021/053/058, BE-023) requires screen-sized
nearby groups: up to six cards on large two-column screens, three on phones,
reduced further for short/enlarged-text layouts. Every separated final circle opens all its shops
at once, without a scrollable list or Next/Previous controls. Nearby connected
3-kilometer neighborhoods partition by the shared compactness/capacity policy;
extra small groups avoid remote remainders. Only businesses with no eligible peer within the3-kilometer nearby area
use individual shop icons; forced one-card groups at exceptional capacities remain
numbered circles. Normal outer clusters merge nearby final groups when zoomed out; clicking
one zooms in. A terminal group already separated from the outer hierarchy opens
its all-fit modal immediately at the current camera, without a street-detail
jump. Restored keys must still be exposed terminal groups rather than hidden
members of a current aggregate. Screen-capacity or actual data/filter changes may rebuild final groups. Plain circle spacing adds no connecting lines or centroid
markers and may not displace a badge more than800meters from its true public
anchor; broad zoom may retain overlap rather than imply a different town. Leaflet interaction maximum18 and MapLibre raw17 stay matched; source
capability19, public200-row API scope and older-client nearbyGroups remain
unchanged. Return navigation must revalidate and preserve current group, selection,
focus and camera. This latest refinement is implemented and focused/browser-tested locally;
visual/full/release/commit and coordinated rollout gates remain pending.
Expo observes actual container layout so markers appear without manually resizing
the browser. Marker actions use current handlers after zoom completion; compact
map controls occupy only their visible row and do not intercept the map behind
an invisible full-width wrapper.
The locally focused/browser-tested short-web correction reclaims the duplicate
Market strip and uses
horizontal map controls/compact transport clear of the inactive pane handle on
short phones, preserving the normal-height layout.
Isolated businesses use a compact accessible action-orange
map-pin containing a familiar upright storefront and the
actual business name in a bounded multi-line label. A generic Showroom caption
and horizontally unbounded names are prohibited.
Perspective platforms or device-like silhouettes are prohibited.
Activating an individual marker centers at local-detail zoom and opens the richer
business preview in one click. Counted groups, including city/area display points,
use the same picker policy. Display offsets apply once and never rewrite saved
coordinates. The map marker does not load booth or hero photography. Map previews
and group pickers use a modal above the search drawer and map. Individual detail
may scroll for long content; every member of the screen-admitted final group
fits together without list scrolling or a pager.
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
selections, and social-account links copy the message before opening their
destination. Suqpage never claims an external message was delivered. Let those controls explain themselves.
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

FE-058 is locally implemented: web/native maps pan worldwide, with interaction capped at normalized18
(native raw17) and source tile capability19,
while initial/reset views remain Ethiopia and filters remain selected. Approximate
city offsets wrap worldwide coordinates; exact GPS is unchanged. This does not
relocate existing businesses. S102 separately adds the server-only world city
catalog and country/city metadata described in §10 and ADR-0027; existing OSM
Ethiopian IDs and coordinates remain intact.

Suqpage stores business content in the database. Client renderers must consume dynamic data rather than hard-coding products. FE-054 stores the optional accentColor in existing versioned PostgreSQL page draft/publication JSON, with no migration or backfill.

Local S127 map navigation stores only bounded public final-group IDs, selection anchor and
a camera reference for up to two hours, scoped to API origin and business-search
identity. Oversized legacy selections are cleared while their camera can remain;
a restored selection must exactly match a current screen-admitted group. Fresh eligible rows remain authoritative; no private data or business
snapshot is saved, and no database schema changes.

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

Planned local S131 (FE-041/FE-053, BE-044) styles those optional merchant categories
as wrapping, accent-aware showroom choices and labels assigned products. A shop
without categories keeps a flat grid. Categories remain optional; no signup or
publication requirement or owner permission changes. Canonical active categories,
public-product counts, search intersection and additive native DTO parity are
specified; implementation/verification and visual/full/rollout gates are pending.

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

The local FE-067/BE-056 catalog is **Products** only. New active writes choose
`standard_product` (Ready to ship) or `made_to_order` (Made to order). Availability
is separate: unavailable/coming-soon items never claim immediate shipping, and
legacy manufacturing/production records stay neutral until an explicit owner
choice. Ready is a merchant declaration, not verified stock or a carrier promise.
**Offering** and all five historical kinds remain storage/recovery compatibility;
service records/IDs/revisions/inquiry history are retained privately but services
are excluded from public rows, counts, metadata, direct links and social selection.
The compatible `products` table and recipe array remain; no migration is needed.

The local focused owner product editor exposes descriptive Availability and
Listed/Hidden status on web as well as native. These are existing product fields,
not inventory counts. Explicit owner changes use the existing scoped/versioned
upkeep command; omitted staff metadata remains authoritative on the server.

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
10. Active product creation/reclassification accepts `standard_product` or
    `made_to_order`. Historical `service`, `manufacturing_capability` and
    `production_supply` remain readable; omitted valid legacy product kinds stay
    unchanged, while a service needs explicit conversion before a new save.
11. Capacity, minimum-order, and lead-time summaries are optional bounded
    merchant facts. The platform and AI must not calculate, verify, or invent
    them. The shared public product view omits these production facts.
12. An offering may display one optional non-negative ETB price, one normalized
    merchant-defined offered-by unit (such as pieces, kg, boxes or sets), and up to six concise highlights. These
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

The local FE-066/BE-055 candidate retires new customer messages into business
inboxes and their primary navigation/counters. Both new-inquiry APIs return 410;
no new business-inquiry row or alert is created. Retained private histories remain
authorized. External social handoffs create no platform alert or delivery claim.
Transport chat and private owner Support keep their own messages and alerts.


Product cards open a shareable `/@handle?product=<id>` view inside the business’s
product section (FE-041). The route reloads directly, supports browser back/forward,
and provides a return link to the page’s product catalog. Unknown, foreign or unpublished product references
show a safe unavailable state. Cards have no Video badge; details use an ordered photo/video gallery (FE-050/BE-042), name, description, optional
price, canonical selling unit and feature chips. Capacity, minimum order, lead time
and internal offering-kind labels stay out of this public view. Single-value option
groups need no selector; their canonical defaults remain part of the inquiry.

The local FE-053 native product-detail candidate shows a localized, bounded
“No photo yet” state when a published product has no media, while retaining the
existing gallery for products with media. Actual-component tests and an
installed-Chrome Expo phone review pass with a labelled response-only demo
fixture; owner visual approval and full release checks remain pending.

The local S151 (FE-041/FE-053; §§8/19/22) candidate corrects native showroom and Featured row allocation:
use measured width for the existing narrow/enlarged-text breakpoint, then let
Yoga share the actual row width. A pixel-rounded layout measurement must not
leave every card half-width on a separate row. Preserve canonical products,
inquiry actions, descriptions, category/search and public/private preview rules.
Featured shares the same measured narrow/enlarged-text fallback while keeping
scheduled-day selection, sponsor visibility, slot order and business navigation.
Focused component/installed-Yoga tests and actual Chrome Expo tasks pass, including
Amharic/Afaan Oromo label fitting. The geometry helper is framework-independent;
root and mobile types pass. Visual approval, full checks and a rebuilt
physical-phone APK remain separate pending gates; the old-source AAB build review
is superseded. Browser/isolated-engine evidence does not claim a fixed installed
Android binary or private-preview login.

The local S129 FE-041/FE-053 implementation gives native showroom cards short
descriptions, separate details/Add actions and a bounded required-options picker
without leaving the grid. Web phone excerpts remain visible. Canonical stock,
per-business lists, preview guards and social handoffs are preserved. Focused
source/store tests and source-bound installed-Chrome public journeys pass, with
response-only options/stock fixtures explicitly labelled. The current private
preview is also verified through ordinary local sign-in without catalog changes.
Visual approval, full gates and rollout remain separate; this is not a new build.

The local S131 candidate adds optional accent-aware category chips, visible
product membership and category/search intersection, preserving S129 Add/options
and each shop's separate saved list. Public details→Back retains only bounded
origin/business-scoped search/category criteria in app memory (32 shops, two-hour
expiry), never catalog/account/private-preview snapshots. Canonical refreshed
categories determine whether the selection remains valid. Narrow native grids
use measured container width: two150px cards plus12px gap when possible, otherwise
one full-width card; enlarged text keeps one column. Current source/store tests,
six rendered geometry cases and real320/390private-preview supplements pass.
Visual approval and full/commit/release gates remain.

Expected customer flow:

1. Open a product, review photo/video/features, and choose any available options.
2. Choose **Inquire about this product only** for that selection
   alone, or **Add to inquiry list** to save it while continuing to browse.
   Cards use the same label, then **Added to inquiry list**; the selected-item
   control is a floating **Inquiry list** action with the current business's count
   only on that business's showroom/product pages in the local candidate. Separate
   businesses retain separate lists; Market/Featured/About do not show a saved-shop
   launcher. A direct inquiry never merges
   with, clears or submits the visitor’s saved group.
3. A single selection uses a compact product summary. Multiple selections show an
   editable inquiry list; zero selections show no persistent cart button. Saved
   references are revalidated against current tenant products/options and capped
   at 20, matching server limits. Desired quantity remains optional bounded text.
4. Choose a configured WhatsApp, Telegram or SMS message destination.
   Only validated effective public contacts supply destinations; a public phone
   never implies WhatsApp availability. The owner-approved demo destinations follow
   the narrowly derived public policy below; unrelated example contacts stay inert.
5. Activating a message destination copies the simple message and selected product
   links in the current interface language before opening its supported
   destination. WhatsApp/Telegram also receive supported draft text. Other
   SMS receives its supported message body. TikTok, Instagram and Facebook open
   their ordinary profiles from showroom identity/footer links without copying an
   inquiry or claiming a universal inbox route.
6. Optional manual copy and visible/selectable text remain available when the
   visitor wants another destination or clipboard/opening fails. Preserve their
   selections. Nothing is automatically sent, and returning from another app
   does not confirm delivery, purchase or payment.
7. There is no Suqpage business-send confirmation or required visitor phone field.
   Canonical tenant/product validation remains; saved cart state contains item
   references, not private customer contact details.

The inquiry composer is a bounded floating panel with outer margins on desktop
and a safe-area-aware bottom sheet on phones. It has an anchored header, one
scroll region, keyboard focus containment, Escape/close and opener restoration.
All actions have at least a 44px touch target. It is rendered outside clipping
ancestors; the product detail itself is an ordinary navigable section, not a modal.

Historical private inquiry records retain their existing fields and authorization;
the local candidate does not create them through a public business-send action.
Their retained schema contains:

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

Retained historical inquiry statuses:

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
- duplicate in-flight copy/open operations caused by repeated social-button taps;
- oversized payloads;
- uncontrolled spam.

Use idempotency, rate limiting, canonical database validation, and tenant checks.

---

## 9. Social messaging and clipboard behavior

The native app opens ordinary HTTPS links in a system in-app browser with a
Close/Back control. Recognized WhatsApp phone and Telegram username/explicit
international-phone links try the
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
- Accept validated international phone values with an optional leading `+`;
  normalize formatting and use international digits only in the WhatsApp URL.
- Embed the structured inquiry directly into the WhatsApp link when possible.

Example stored value:

```text
251911234567
```

### Telegram

- Store a username or explicit `+` international phone value.
- Recommended stored format is the username without `@`.
- Use Telegram’s supported draft-text link behavior when available.
- Explicit phone links use the supported phone identity, never a guessed username
  or an arbitrary invitation hash. Account/privacy settings still control access.

Example stored value:

```text
AlHayaModest
```

### General fallback

When automatic copy is blocked, the customer must still see:

- the complete inquiry message;
- a copy button;
- selectable text;
- the business's configured social-account actions, without invented destinations.

Never pre-open `about:blank` and wait for asynchronous clipboard permission.

---

The local FE-067 owner editor asks how the product is supplied (Ready to ship or Made to order), name, optional ETB price and one
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
In the new release candidate, arrow, keyboard and thumbnail choices settle the
visible slide immediately so a rapid reverse cannot leave a different thumbnail
selected; direct touch scrolling still uses the horizontal snap track. This
interaction correction is local until the source-matched release gates pass.
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

The local S128 toolbar (FE-065/FE-053) removes the duplicate visual Market title
row, retaining a centered Businesses/Products switch with a non-layout localized
heading. S143 removes the redundant Info control and its reserved spacing; the
ordinary switch row is at most52px with48px targets, while enlarged labels may
wrap accessibly rather than be clipped. Search and all labeled filters share one row at sufficient
measured content width (web35rem, native760px at ordinary font scale), including
landscape; phones and enlarged text retain readable wrapping rows. Selection
counts and48px targets remain visible. Native keeps the narrative in About;
the web landing page also has S132's compact visible introduction.
Focused tests and actual Chrome local-API journeys verify independent searches,
filter clearing, reload and showroom return. Visual approval, full gates, commit
and rollout remain pending; this does not update the live site or installed APK.

## 10. Market discovery behavior

Featured's local FE-021 B10 category controls retain their existing scheduled
day-to-category mapping. They do not change the independent Market filters or
admit arbitrary categories into a day's lineup; only presentation is corrected.

The local S140 correction removes the forced maximum-zoom step from terminal
groups. Larger outer circles still zoom normally; an already-separated group
opens its exact screen-admitted businesses without moving the map. S139 keeps
failed basemap detail separate from working business discovery and protects
pending zoom/preview-return cancellation. Focused and actual Chrome evidence is
recorded under FE-021/FE-058; visual/full/release/rollout gates remain open.

The local S132 web landing-page direction supersedes S128's removal of the
visible web introduction. Compact headline/supporting text sits on a plain light
background, retaining the centered scope switch, labelled filters and native
canvas gain. Actual Chrome covers active-language web/Expo and short/landscape
pointer/filter/intake tasks; visual approval and rollout remain pending.

The local S130 candidate (FE-065/FE-053) retains product excerpts and adds canonical
business city, richer bounded final-group rows and country names formatted for
the current locale. Installed Chrome lacks Oromo country-name data and currently
falls back to English for those names; other authored Oromo UI remains localized.
S127 capacity/grouping is unchanged. No inferred location, per-card fetch or
private data is introduced. Actual public API, product/business navigation and
rich preview journeys pass. S136 corrects a separately proven fractional Leaflet
resize/return gap without weakening the half-pixel contract. A weak map-instance
intent prevents chained resize rounding; deliberate pan/zoom replaces it. Actual
SDK rendering/bounds remain independent from the persisted geographical intent.
Seven installed-SDK and two adapter regressions plus three real full-showroom
returns each on web/Expo pass the original half-pixel limit without accumulated
drift. No private SDK fields, tile resets, grouping or provider changes are used.
Visual approval/full gates/rollout remain pending.

The local S102 implementation (FE-065 / BE-054 / DEP-045 / ADR-0027) is
implemented with focused evidence, awaiting visual approval/full gates and rollout.
Published web and installed APK versions remain unchanged until a separate release.

- FE-065/FE-053 retain the selected Businesses/map or Products panel and each
  scope's independent criteria when returning from a showroom, product or another
  page through Back or Market. New sessions default to Businesses. Only bounded
  public view/search criteria are remembered (browser-tab session/native app
  memory, two-hour snapshot validity); result payloads, account data and credentials
  are not stored. Explicit view/filter/history entries win over memory. Deliberate
  Explore the map and Clear filters actions remain explicit; Featured's source
  return is separate and cannot replace the Market preference.

- Web discovery pairs each response with its canonical scope/query key. Cached
  initial results cannot stand in for another current search; canceled requests
  cannot leave permanent loading or replace newer results. Pending/error data
  cannot invalidate or overwrite a saved eligible map selection. Only after the
  current response and matching restored group/selection/camera commit may SDK
  callbacks persist the view. Both Leaflet adapters use the same center-preserving
  resize correction, ignore hidden zero-size containers and fence disposed work.
  Loading-row changes and ordinary container resizing preserve the saved camera
  within half a projected pixel. These are local return/lifecycle corrections;
  no API, database, map-provider or clustering contract changes.

- Businesses searches identity, handle, published profile and public location,
  returning map markers only. Products searches physical goods with
  source-business context. S103 uses one incremental 12-card server-paged list,
  without business cards or mixed-result tabs. Made to order is an optional product-only filter; retired Services links fail explicitly rather than broaden.
- S103 opens with bounded initial results and clears back to default browsing,
  superseding S102 empty activation. Additional products load on scroll only while
  the panel is open, with one request at a time, ID deduplication, cancellation,
  preserved position on panel switches, retry and an accessible Load more fallback.
  The native list is virtualized. A centered switch and click/drag edge handles
  select opposing panels; hidden controls are inert and motion can be reduced.
  The map returns at most 200 business rows with a matching count; a visible
  prompt offers search/filter narrowing when capped. Only unfiltered first-page
  anonymous defaults share two 20-second server cache keys. Filters, free-form
  queries, later pages and visitor exclusions bypass that cache. No polling.
  Search is debounced, aborts obsolete requests and never requires Enter or a
  search-button click. Failed requests show a retry action rather than mismatched
  previous results. The other scope's inputs, results and paging remain unchanged.
- Category choices are clearable multi-select; no choice means all categories.
  Country precedes City. Up to 16 countries/cities can be selected, with OR inside
  a set and AND across different filters. Country changes remove incompatible city
  selections; invalid explicit API geography is rejected, not silently broadened.
- Country/city menu choices and counts derive only from eligible active public
  businesses with approved discovery placement and published offerings. Draft,
  excluded and visitor-blocked businesses never enter rows, counts, metadata or
  typo fallback. Same-named cities retain country/canonical-city identity.
- Product rows retain literal merchant descriptions, line-clamped to the available
  space, and separately linked From business labels. Item and business targets
  remain distinct. Sponsored placements do not change query ranking.
- Matching remains parameterized PostgreSQL word matching across one offering
  and its business context, with Unicode/case/Latin-accent/separator handling,
  English singular/plural alternatives, literal wildcard escaping and original
  exact/prefix-title priority (including gras/grass). Bounded indexed typo probes
  produce normal matches first, then at most 100 approximate records per kind.
  Business typo matching cannot admit a business just because its product matched.
  Type, geography, category and visibility apply before approximate admission.
- New URL state stores both scopes separately. Old unscoped mobile API callers
  retain the combined map/product contract; old web/app query/category/place links
  open the indicated scope and retain legacy geographic restrictions internally.
  Region is not a new public filter. Public production-scale input stays retired.
- Web/mobile-web and native render their own compact labeled controls and sliding
  panels. The map stays mounted and visible behind/beside the product panel;
  only the active search controls are shown. Native remains a real Expo interface,
  not a web-wrapper screen. Country/city and media values remain server authority.

Signup and owner edits resolve a selected place ID to country, city and area
coordinates. New interfaces require Country and City; selecting a different
country invalidates the city, while choosing the same country preserves it.
Country labels appear in the visitor's language after hydration, avoiding CLDR
version mismatches. Legacy known Ethiopian place IDs can derive country on the
server; a supplied mismatching country is rejected atomically. Exact storefront
coordinates now accept valid worldwide ranges; home-area mode still stores no
exact proposal coordinates. Migration 64 adds country/city metadata and widens
only obsolete coordinate constraints, without moving existing pins.

ADR-0027 retains the 781 OSM Ethiopian anchors and adds an offline GeoNames
cities5000 catalog. The full city file is server-only and explicitly traced into
web deployments; clients receive bounded country-scoped suggestions. There is no
paid geocoding service or startup network dependency. Local-name aliases include
Finfinnee, Muqdisho and ኣስመራ. Smaller/unlisted towns remain a documented coverage
limit, and city selection is not proof of a street address. Data provenance and
attribution are in docs/operations/COUNTRY-CITY-CATALOG.md.

DEP-045 locally corrected 67 marked demos' public contacts and known location
metadata after a protected backup. Public examples use reserved numbers and
example.invalid; social contact destinations are absent and external demo
contact actions are inert. Private sign-in aliases, real businesses, products,
inquiries and GPS stayed intact. Two additional labeled local-only test agents
were created through the administrator service, and one unlinked local setup
review identity is retained. No hosted Auth/configuration changed or email left
the local mail service. Protected accounts/workflow instructions are in
.local/discovery-s102/TEST-ACCOUNTS.md, never in a build or public repository.

Local FE-021/FE-053 shop markers have orange bodies, thin continuous white rims and 11px bold
orange business names on cream plates. Selection changes the nameplate to orange
with white text. Cluster/nearby/badge styling remains unchanged. Counts and
live/featured authority and coordinate anchors remain unchanged. Local S127
supersedes grouping/click/zoom behavior with the bounded picker described in §5.2;
the orange/white individual-marker and counted-circle styling is preserved. Full business names stay in
accessible labels while visible names wrap within the compact marker width.

---

## 11. Passwordless account entry and business onboarding

Local Auth presentation source (BE-059/DEP-029/DEP-049/FE-070) now uses MirtPage
for the sender display, thirteen subjects and thirteen HTML-content fields.
The hosted twenty-seven-field presentation repair was applied and independently
read back on 2026-10-20, retaining214 untouched fields. One separately authorized
sign-in email was confirmed in Gmail with MirtPage sender/subject/body and the
original1320×288 logo loaded. Its transparent canvas exposed a contrast defect:
canonical ink lettering disappeared against the recipient's dark background.
The new local FE-070/BE-059 S150 candidate uses a versioned email-only PNG with
the same220×48 display/1320×288 geometry and an opaque white canvas; original
mobile/SVG colors, pixels and the prior transparent PNG remain unchanged. Its
thirteen changed HTML fields need a fresh exact DEP-029 review after the new
asset is deployed/read back. That contrast correction is not yet hosted and
no additional test email is authorized. Code/link/recovery behavior, actual
sender addresses, credentials, provider/origin settings and seven disabled
notices are unchanged. Auth remains English-only; no request locale is invented. The guarded
exact27-field allowlist rejects old-brand saved plans before provider reads;
65 injected-port tests pass. Actual Google Chrome verifies24 static desktop/
phone email states. This is source/presentation evidence, not a running Auth
reload, real email/OTP verification or hosted configuration apply. The owner
explicitly approves the combined email visuals and full checks on2026-10-18;
24 Auth and18 plain-mail actual Chrome states support that review.

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
copy. Existing edited pages are never generally backfilled. Other products keeps its declared category/city without a nonexistent public-industry
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

The local S102 setup adds required Country and City to the initial details,
using canonical server-known places. Country changes clear city selection;
owner Dashboard → Business details uses the same country-scoped catalog. No
unpublished sample starts in edit mode. The currently published setup below
remains the prior version until rollout (FE-065 / BE-054).

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

Local candidate transport tracking shows an arranged journey: ordered providers, air/truck/van/car/motorcycle methods and From/To per stage. Staff may edit independently of active or ended chats. There are no dates, ETA, scan events, completion/current-carrier claims or bookings. External scan integration remains unimplemented.


Suqpage does not provide automated carrier booking, dispatch, tracking or checkout.
Businesses and customers agree purchases and payment directly. The active human
transport-arrangement service is separate: visitors share their route in live chat,
authorized transport agents discuss options and retain private follow-up notes.
Independent Tracking records the agreed provider sequence separately. This does not claim an automated booking, carrier integration,
payment system or confirmed transport merely because a chat starts.

The local BE-018/FE-019 owner-transport candidate also lets business owners start
that same service from Account → Transport chat, for goods going to customers or
coming into the business. These requests belong to the authenticated business,
not a guest browser token, and use the same transport staff queue.

The former simulated logistics demonstration routes remain retired and return the normal not-found
response. Dormant legacy tables may remain through the data-preserving rollback
window, but application code must not read or mutate them.

---

## 13. User roles and standard page workspaces

Planned S145 follow-on (FE-069/BE-058/DEP-048; Ready proposal awaiting review):
rename active Tracking/Transport plan presentation to Shipment tracking. Staff
may optionally store each provider's HTTPS tracking link and literal code on an
independent shipment leg; verified recipients can open/copy them. This remains
an arranged-route organizer, with no automatic movement/status integration.
Missing legacy fields remain empty and old rows/history are not rewritten.
Affected architecture/data/language/UX/testing sections15/17/18/19/22 will be
reconciled only after implementation and source-bound evidence. Existing mail
approvals remain valid for their source; changed initial-mail wording requires
a new stable retry boundary, and new UI needs its own visual approval.

The locally verified Tracking workspace gives fresh transport/all-scoped staff and managers a separate list, read-first detail and explicit New/Edit/Save/Cancel tasks. Support-only staff and business owners have no editing authority. Visitors and business owners enter Tracking from transport chat, verify their email themselves and see their own multiple plans without creating or replacing a business account.

The local S142 workspace removes the obsolete per-conversation Transport plan
tab and Transport company form. Stale authenticated actions cannot save or replace
old plans/handoffs; authorized obsolete plan routes redirect to independent
Tracking. Its own New/Edit tasks are not conditional on a conversation, assigned
chat or prior email verification. Support-only staff remain denied.

The deployed FE-063/BE-051 Reports queue is web-only for support-scoped staff and
administrators/operations. Staff can claim work, managers can assign it, and
version checks prevent overwriting another decision. Mark resolved requires the
reported content to be removed/unpublished/suspended using existing authorized
catalog controls; Dismiss records a no-violation decision. Transport staff and
business owners cannot read this queue. It does not open a guest support chat.

The deployed S99.4 policy prohibits violent imagery, nudity/sexually
explicit content and age-restricted goods/services, including alcohol, tobacco,
vaping, weapons, recreational drugs, gambling and adult goods/services. Support
reviews Prohibited goods and Abusive content reports; authorized administrators
remove/unpublish violations before support marks them resolved. Ordinary tools
are not weapons merely because they have sharp edges. Public Terms are verified
in all five languages; no automatic screening is claimed.

Local S91 attention covers owner support replies, matching staff waiting
work, internal assignment/reassignment, public replies and ended/reopened cases.
Customers receive a joined event only after the current assignee explicitly
clicks Join chat, followed by unread public replies. Their API projections hide
assigned names before explicit acceptance; opening/Claim/reads never join.
Opening/refreshing a chat never establishes Read: only explicit acknowledgement of
an incoming visible message does. Managers inspecting an agent's case do not
establish that agent's read/join. Private transport notes remain private.

The local S119 receipt candidate observes every incoming footer in one batched
native transcript observer; the newest reply need not be visible to confirm an
earlier one. Async measurements recheck focus, app state, overlay generation and
conversation identity before admitting a read. Web uses the actual visual
viewport and scroll clipping bounds. A new saved assignment epoch resets the
observer's acknowledgement cache for accurate visible reads. Explicit Join has
its own current-assignment/reference fence and idempotent event; older implicit
read-generated joins are retained as history but do not establish acceptance.
New message sender sides are saved under fresh server role/tenant authority;
later role changes cannot recast them. Migration66 is additive and nullable,
with no historical backfill; ambiguous old non-opener messages retain conservative
legacy interpretation. These changes are locally tested, not a hosted rollout.


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

Staff conversations put transcript and reply first. Needs staff reply, Overdue
and Waiting for customer describe response work independently of assignment.
A compact Reply status filter preserves queue/search/return context. Public
replies require explicit Join by the current assignee; inspecting managers retain
permitted assignment/notes without pretending to join for someone else.
Management and request details sit alongside on desktop. On phones an explicit
Details view replaces the chat temporarily, preserving the reply draft; Back
returns to the conversation. The old company form/summary and conversation-plan
tab are removed. Independent Tracking retains version-fenced New/Edit tasks and
inbox returns remain scoped. Waiting, assigned,
joined, ended and resolved states are distinct: an ended unassigned case never
says it is waiting for staff. Transport has a separate Waiting view. The local
S121 server worker picks up old waiting work automatically, by current open
workload and longest since saved assignment among eligible receiving staff.
New chats and availability changes retain immediate routing, without a numerical
agent cap. Unassigning a case returns it to automatic waiting; pausing an agent's
receiving setting stops new assignments to that agent. No bulk recovery button,
inbox visit or client write is needed. Assignment remains distinct from joining.
These local refinements await visual/full/release gates and hosted publication.

Administrators manage business moderation, staff assignments, marketplace
visibility, sponsorship, Daily Featured schedules and support. They can
invite a private business and suspend or restore established visibility. Page and
location approval queues/actions are retired; historical records remain. Private
page editing and draft media access still require current owner assistance consent.
The selected business has one contextual navigation: Overview, Your page when
consented, Products, Business details, Location & visibility, and Access.
Overview shows saved status/activity without another complete menu or status form.
Its saved facts link to the matching business task. Business and Staff directories
use consistent task labels; Staff has peer Accounts and Workload & availability
destinations, and Manage opens one focused agent editor. Save/Cancel preserve the
bounded originating filters. The selected business tab reveals itself inside
its own navigation on narrow screens without scrolling the document or stealing
focus. These S118 refinements are locally verified and await visual/release gates.
Categories belong under Products; category rows are read first, and Add/Edit or
removal confirmation opens just the selected task. Business details separates
identity/notification, live presentation and sharing into focused read/edit tasks.
Access contains owner sign-in/recovery and established-page
suspension/restoration. Staff business-management access belongs in the
administrator's Staff workspace. Contextual sponsor editing keeps that business selected.
Legacy social values are preserved. Staff tables omit retired page-review
counts, and status guidance distinguishes staff drafts from owner live Save.
Location & visibility uses canonical Country/City selection without requiring
invented region or zone text. The saved public pin remains independent of a city
change; unrelated edits preserve omitted geography/media/industry/sponsorship.
Invalid explicit coordinates and mismatched city/country selections fail
atomically. Staff assistance returns to that business's Access section.
Owner Business details shows the current applied location after a reviewed admin
correction, with pending owner drafts kept distinct from reviewed history. A
name/logo-only Save preserves that applied pin and proposal. Admin location
corrections advance the owner business-version fence so an older form cannot
replay its previous location.

### Owner (client)

Verified signup or an invitation creates a complete private sample workspace.
New signup opens the filled page preview automatically. Both web and native first setup
collect account/business details and the chosen handle together, then expose
address edits in Page on the deployed version. The FE-056 local candidate opens
a compact Account hub with saved showroom identity/status, three authoritative
visit/offering metrics and six task destinations: Your page, Products,
Business details, Account settings, Support and Transport chat. Transport has its
own paired route/contact intake, live conversation and private history; Support
handles business/account/page questions separately. Your page groups Preview,
About, cover photo, business video, page color, public contacts, page address and
team editing. Each Edit opens only that task; contacts remain visible as Social
accounts and Business contacts with all saved values preserved. Page address owns
handle editing; Business details owns identity, category and location. Color edits
retain full-page preview. Cancel confirms unsaved changes; task switches preserve
the working profile. New task returns lead to Your page, while older Account-return
links remain compatible. Saved business/private settings
open readable summaries; Edit opens a focused screen with Save/Cancel and a clear
Account return. Native notifications and private profile editing are separate views.
Private account records, legal links and every edit form are not stacked on the hub. FE-066 removes the primary
customer inbox and new-inquiry metrics; retained inquiry history stays private
and scoped. Its first address change is immediate and later
changes have a 30-day interval (support exceptions require an audited administrator).
Owners replace examples, save business details/location, edit their page and
products, then Publish directly when at least one physical product is listed.
FE-056 locally exposes Publish beside Edit above the private preview's cover.
It opens current server readiness with links to missing details and blocks
confirmation until ready. A changed draft is refreshed for another review;
publication conflicts/errors preserve the preview and confirmation for recovery.
Subsequent page Save updates the live publication atomically; stale/foreign writes
and self-reactivation of suspended businesses are rejected. Private account
contacts remain separate from public page contacts. Owners can restore a retained
publication, revoke assistance, use support, manage account security
and view aggregate visits. Categories remain available to authorized staff without cluttering owner navigation. Existing catalog IDs, options, inquiry
snapshots and tenant boundaries remain compatible. The S27 local editor adds
ordered photos/video links and resets uploaded-file state to saved references
after a successful save; later description edits reuse those saved images.

The local S122 refinements keep that compact Account structure. Product Add/Edit
has paired Save/Cancel actions and returns to the same bounded Products search
and page, with Account as the owner's parent and Overview for authorized staff.
Business-details Cancel sits with Save. Expected failures retain the draft and
unknown focused product-save errors use a safe connection message. Pending saves
block duplicate submission and app-owned exits. Native header, stack and persistent
navigation use the installed router lifecycle and a shared unsaved-change guard;
Keep editing retains input, Discard restores the saved snapshot, and only the
acknowledged save can leave its current editor. No draft is promised after process
termination. Visual/full release gates and rollout remain pending.

The designated main-admin identity is verified and linked in local and production,
with no business-owner association; existing business content and Auth identity
are preserved. Local S88 staff creation offers Support agent and Transport agent,
stored as team_member plus the corresponding queue scope. New agents are enabled
without a numerical conversation limit; incompatible open cases block role changes. Scoped agents
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
products with a service note, and manage support assignments. Eligible staff with
an administrator-controlled Manage businesses grant can edit any business page,
including publication under the ordinary readiness and version checks. The
administrator can revoke or restore that grant per staff member; chat queue access
remains separate. Staff cannot access an owner's private sign-in identity.
Support-agent settings enable Business support, Transport dispatch or All requests
and choose whether staff receive new chats. The local S108 candidate automatically
assigns matching work to the enabled agent with the fewest open conversations;
equal workloads rotate by least-recent saved assignment, with never-assigned
agents first. No numerical limit blocks automatic assignment, claim, reassignment
or reopen, including workloads above 100. Pausing new chats retains existing
ownership/replies/history. Saving receiving availability or creating an agent
routes the oldest eligible waiting cases in a bounded batch of 100 and reports
routed/remaining counts. The local minute worker also recovers eligible waiting
work automatically, with at most25 transitions per tick; this is not an agent
capacity limit. Reads never reshuffle existing ownership. Legacy stored
limits remain inert. Team members see eligible waiting requests and their own
assigned history; managers see both queues. Selection, assignment/history and
notification enqueueing are transactional across concurrent workers. Staff can
claim, explicitly Join, reply, mark authorized work resolved and reopen cases; managers can reassign open cases and inspect assignment
history. Assigned transport dispatchers and managers choose Reply for a
visitor-facing message or Internal note for private work. Existing staff messages
remain private; only explicit new replies are shared. Both support queues have Active,
Chat history (ended but unresolved), and Resolved lists with server pagination and
search by requester/name, phone or reference. Intake summaries appear in the list
and full original intake/contact in the case. Ended and resolved transport and historical buying cases
accept private follow-up notes, but public replies require reopening. Mark resolved
closes any active chat, removes it from open workload, and records the staff decision; visitor
End chat never marks a request resolved. Historical transport cases
retain private notes; the obsolete company-handoff feature is retired locally. Unassigned
staff cannot reply, add notes, close or route a waiting request before
claiming it. Visitor messages contribute to the staff unread count.
No live role uses custom service-request assignments, revision projects or page
approval queues.

### S146 — staff business management staged locally; hosted rollout pending

FE-072/BE-060 and ADR-0030 replace the owner-facing Team editing switch and
administrator per-business staff assignments in the local schema77 preview.
The additive migration backfilled all 14 eligible local staff with an explicit
all-business Manage businesses grant. An administrator can revoke or restore it
per person. Authorized staff can manage business showrooms, products,
categories, public profiles, locations, handles and publication through the
existing validation and audit rules; chat assignment and availability remain
separate. Historical owner-consent and assignment records remain stored but are
not the new local authority. Local focused tests and installed-Chrome web
journeys pass. Expo Tracking and partial owner UI navigation were exercised;
the longer owner run route-fulfilled a successful OTP-send response after the
local email quota was exhausted, so a complete no-mock Expo owner journey
remains pending despite real local token verification. Owner visual approval,
full gates and hosted migration/app
rollout remain open. The **deployed site** continues to use its prior authority
until that separately reviewed cutover, so the older rules above still describe
deployed business editing.

Private account contacts, staff administration and the owner's sign-in email
remain outside the business grant. FE-073/BE-061/DEP-050 now have local source,
schema and a passing Supabase Auth/Mailpit two-code proof for an owner-only email
change; staff and administrators have no bypass. Initiation stays disabled while
the UI review, hosted Auth verification and release gates are pending. The
deployed sign-in email remains read-only.

### Public customer

The local FE-065/FE-066 experience separates business search on the map from
product cards, with bounded initial results and incremental product
loading. Visitors open shareable offerings, choose options and prepare a message
about one product or a saved group. Activating a configured social account first
copies the localized message and selected products, then opens the destination;
manual Copy is an extra option. Phone, email and website keep their normal
destinations. No visitor reply-phone form or new Suqpage business-inbox message
is created. Historical inquiries remain private; public transport chat and
authenticated owner support are unchanged.
Only active businesses, published products and approved discovery geography enter
public projections. Account phone/email never supply public contacts implicitly.

---

Publication also applies pending saved location/category setup atomically, so a
populated starter does not need an extra unchanged Business details Save before
search can find it. Already-applied admin placements/exclusions are preserved.

The released baseline business setup at `/dashboard/business` saves the name/logo, category and
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

The local BE-054/ADR-0027 candidate requires Country and a selected canonical City
for signup and location edits, uses the worldwide offline place catalog and keeps
typed-but-unselected replacements unsavable. Existing storefront privacy and
display-only offsets remain; administrator coordinates accept finite worldwide
bounds without changing the canonical country/city identity.

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

The local default Android configuration selects only the real MirtPage Firebase
registration/file, pinned project/number/package/appID and downloaded byte hash.
Worker validation rejects missing/old/private/oversized/symlink sources and does
not permit disabling notifications to bypass identity. Actual installed Expo
configuration and its Android scheme plugin resolve only the mirtpage custom
scheme across all three profiles, with the retained EAS UUID. The approved M
supplies a deterministic white-alpha96px notification glyph and canonical orange
tint; channel IDs and existing delivery protocols are unchanged. No customized
OS splash or device-delivery result is claimed.
The local native public-origin adapter validates one environment-derived value
for API requests, About legal destinations, external-link policy and social-video
WebView base/referrer. The native player still admits only its exact own root and
reviewed provider embed paths; development HTTP is limited to the existing
approved local-address rule. Internal video bridge messages and persisted session
keys remain compatibility identifiers. This source behavior is not a hosted
origin switch or proof of third-party video availability.

The local web/Expo basemap adapter uses the existing exact OSM provider through
a shared typed, bounded browser loader. The exact host is allowed by connect-src;
there is no proxy, new provider, credential, package or database change. Native
MapLibre identity/cache and signing remain unchanged. GridLayer owns geometry;
the loader owns status/decode/timeout/abort/object-URL lifetime. TileLayer's
image-only abort routine is not mixed with asynchronous fetches.

Local interactive development can start web, automatic queue pickup and idle maintenance together with
`npm run dev:with-worker -- --port 3102`. The supervisor validates the existing
local target and prepares services before starting owned children; a child
failure is visible and stops its sibling. It never discovers/kills independent
processes or automatically restarts them. Existing web-only and standalone worker
commands remain for quiet captures. No additional provider or data store is used.
Automatic routing, customer inactivity and unanswered-response escalation each
use independent failure handling and the
shared support-work try-lock, bounded candidate/transition counts and transaction
timeouts. The hosted minute adapter preserves notification-first delivery and
rechecks its maintenance-start budget before each task. These worker adapters are
locally focused-tested; no hosted deployment is claimed.
The current local database includes migrations67/68; hosted migration/API/web/native
delivery must remain coordinated under DEP-043 before this code is released.

Owner editor navigation is client UI state only. Product list origins are bounded
fixed-path hints and never tenant authority. Native removal prevention uses the
installed Expo router's React Navigation lifecycle; retained navigation controls
also consult the focused editor. There is no new provider, dependency, schema or
private draft store for these S122 refinements.

Local inquiry selection persistence stores only bounded product/option/quantity
references. Web uses the current showroom's existing localStorage key. Native
uses the existing document filesystem, with an Expo-browser localStorage adapter;
keys include the canonical API origin and business ID. Reads coalesce before any
write; writes serialize, failures preserve usable selections and expose Retry,
and fresh public catalog data revalidates IDs/options before counts or messages.
There is no new database, dependency or cross-device synchronization. A temporary
in-memory migration bridge preserves an older already-open basket only.

Demo destination approval is derived afresh on the server from current effective
public contacts. A nonsecret deployment setting admits only exact owner-approved
demo phone destinations; a fixed public example registry admits the official
TikTok, Instagram and Facebook profiles plus example.com. Unrelated fake demo
destinations remain inert. Client snapshots cannot manufacture approval, and no
private contact field is used. Current exact data/configuration operations are
local only; hosted admission requires its own reviewed target/backup plan.

S102 adds typed independent discovery/URL contracts, web and native API adapters,
country/city persistence and a server-only offline place-data adapter. No new SDK,
provider credentials or application data store is introduced. See §10 / ADR-0027.

Local owner transport uses one typed application handler behind authenticated
web `/api/owner-transport` and native `owner/transport` adapters. Existing support
tables retain the account-owned case, intake, assignment, messages and history;
there is no new schema, provider or guest-token migration. Private contact
defaults are supplied only to the authorized owner destination.

Focused privileged settings merge only the admitted section with the canonical
locked business record under the existing version fence and audit transaction.
Native owner home includes current team-editing consent; its bounded assistance
command delegates to the same versioned owner-only consent service as web.
Category mutations reload both role and chat queue scope inside their transaction;
old staff assignments and stale principal snapshots cannot grant scoped agents
catalog authority. These local changes add no schema or provider.


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
grids. The local candidate uses one Market/Featured/About/Login bottom bar,
with Login becoming Account after sign-in. Owners use a compact Account hub and
focused task screens; customer-inquiry navigation remains retired. About is
directly reachable; legal/Login/setup routes share the public shell. Role-aware
Account links open owner, admin or scoped agent workspaces without changing
permissions. Staff and administrator accounts remain web-only.
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
independent readback confirms preserved FCM and canonical/legacy signing. Existing-key
Play enrollment and the actual Google-signed APK certificate are independently
verified. One free version-3 AAB from ea1b452 passes artifact/privacy/API-36/16-KB
checks under its exact approved, now-consumed tooling exception; the tooling audit
remains failed, not clean. Google independently verifies its hash on completed internal testing,
with SuqPage/en-US and the selected support contact preserved. The latest saved
English/Amharic descriptions using the owner-accepted nearby-business narrative, eleven authentic phone screenshots,
two feature graphics and unchanged icon have independent normal Console/CDN
readback. Google's signed official test splits
pass an isolated native update, 12 public states, five languages and HTTPS links.
The protected universal APK requires Play Store, absent in that emulator; actual
protected Play-installed phone/alerts and closed rollout remain pending. All
required Console setup forms are saved and verified, including reviewer access,
owner-selected audiences 13–17/adults, data safety and completed IARC. Under the
owner's delegation, 25 answers and the actual regional rating summary are saved
and reloaded: ESRB Teen, generic/USK/Brazil/Russia/South Korea 12+, PEGI parental
guidance. Possible minor/moderate seller language is disclosed; dedicated chat
moderation and current-user-location broadcasting are not claimed. Saved shop
coordinates remain separately disclosed. Google marks IARC Completed but its
certificate ID is still unassigned. Required setup is saved, including Advertising
ID No verified against actual version-5 APK/AAB permissions, all seven compiled
DEX files and mobile source/dependencies. Sponsor display and notification tokens
do not imply advertising-ID use. The SuqPage list contains twelve verified
addresses, selected on both existing tracks, with the approved feedback contact.
Alpha targets all 177 offered countries/regions plus Rest of World, unsynced from
production. Following the owner's explicit closed-test start instruction, its
version-5 release with retained English/Amharic notes is submitted through normal
Console controls. Google's later publication is independently verified: Alpha
version 5 is Available to selected testers after reload, while internal version 5
remains available and production is inactive. The actual closed joining link is
https://play.google.com/apps/testing/com.suqpage.app. Twelve accounts are eligible;
zero closed opt-ins are recorded, so the fourteen days have not begun.
Protected-phone/OS-alert checks take place within closed
testing and gate production readiness. The historical stopped API read is not
replayed or claimed resolved; current submission has independent Console proof.
Production Play protection is unchanged. Internal testing is not public
publication or policy approval; see docs/GOOGLE-PLAY-CONNECTION.md.
S99.10 prepares five-language social posters, short silent videos, captions,
bios and a portable owner launch kit. The official social accounts and eligible
YouTube preview URL do not yet exist; no campaign or preview video is published.
Current S99.10 app copy has explicit owner layout approval, 69 browser states,
1,414-message localization coverage, full check, isolated web release, eleven
acceptance workflows, operations/mobile contracts and Hermes export evidence.
Exact packaged Linux handler/Sharp and scheduled worker checks pass. Source
3cfa577 is published as Netlify 6acd6e4203a2e50c6b9286dd after a private consistent
schema-63 backup and archive/privacy/source binding. Twelve read-only production
checks and fifteen live phone states (Market/About/account in five languages)
verify health, guards, associations, accepted copy and layout. No database/provider
configuration or customer-record write is part of this update. The owner-approved
updated production AAB from 3cfa577 is built and inspected as version 5 using
EAS locally after the account-wide Free Android limit rejects the cloud attempt.
Free combines 15 Android and 15 iOS; the aggregate count is not Android capacity.
No cloud job or payment is incurred by this local bundle. Existing signing,
legacy and FCM bindings remain identical. Actual bundle privacy/API-36/permissions,
canonical HTTPS, Firebase client resources, all five compiled headings and fifty
64-bit native libraries at 16-KB alignment pass. Its one-artifact tooling exception
is consumed; the native audit is not clean. Separately owner-approved version 5
is uploaded once via EAS Submit and available on the existing private internal
track. Google's original bundle exactly matches the approved hash; its signed
version-5 APK verifies the existing certificate and Google source stamp. Fresh
Console reload verifies internal and closed Alpha version-5 availability,
unchanged country/access decisions and existing signing/FCM/submission bindings.
The twelve-member list is verified after the owner's append-only request. This
is eligibility, not twelve actual closed-test opt-ins. No tester invitations,
public rollout, production policy approval or protected physical-phone result is
claimed.
The aligned local pack has 54 CRC-verified files and seven fully decoded silent
H.264 videos. Independent normal Console reload verifies the aligned English/Amharic drafts,
ordered graphics and accurate AI labels; six new CDN transforms match source and
previous image references remain. The listing is submitted with the closed-test
review request; no campaign is published. The available internal Play
version is 5; physical-phone installation remains unverified. Native screen crops
retain authentic UI; localized marketing captions do not imply every pictured
device screen has that language. Actual phone results, continuous closed-test
opt-ins and production access remain required.
The required 12-testers/14-day closed test and production-access application remain
external rollout steps. Regular product authentication remains email-code based.
FE-063/BE-051 implement deployed web/API reporting/blocking through pure commands,
a private PostgreSQL report port and web/native adapters; native version 5 is
available in internal testing, with actual protected-phone/closed distribution checks pending. Discovery
exclusions run before counts, fuzzy candidate
limits and pagination and vary the public cache. Native preferences use bounded
per-business device storage; no new SDK or managed provider is added. Local
focused evidence, delegated visual acceptance and complete gates pass; committed
web/schema/API and private closed Play publication are verified. Real testing,
production access and public Play rollout remain pending.

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
The internal Android release uses storefront/name markers, numbered clusters,
nearby lists and public live/featured badges matching its released web map. The
local S127 candidate adds the screen-sized fixed-group picker and matched scale caps;
its native controller is focused-tested and Expo is reviewed separately. It has
not been built into an installed Android release. Native marker selection
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

Local S151 B09 (DEP-049/FE-021) repairs public responsive-image delivery with one
exact same-origin Netlify CDN rewrite. Production original demo assets are
present; the current optimizer route fails while the existing CDN succeeds.
Native direct URLs, private authenticated media and source files are unchanged.
The final artifact must preserve the rule before its function catch-all and pass
hosted source/variant checks. This source candidate is not a live repair.

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

Local tracking uses separate six-digit, ten-minute, one-use email codes with five atomic attempts and bounded resend/rate limits. Tracking-only opaque sessions expire after seven days and use web HttpOnly cookies or separate native secure storage. Shipments are recipient-authorized before every list/detail/304; a locator alone grants nothing. Managers can revoke one shipment without affecting others. Initial-mail outbox retries preserve the submitted snapshot and locale and freshly check revocation.

Deployed BE-051 reports accept only canonical public targets and bounded details.
Concurrent/retried submission is idempotent, changed replay conflicts, and salted
IP hashes enforce a rate limit without storing raw IPs. Responses expose only a
receipt/duplicate flag. Fresh server role/assignment/version checks protect staff
decisions, and anon/authenticated roles cannot read the table or use its sequence.
Blocking is a browsing preference and does not make public content confidential.

The owner-approved catalog prohibition is enforced when violations are found or
reported. S99.4 verifies both report reasons, scoped assignment and denial of
resolution while content remains visible. Publishing does not imply prior staff
review, and neither policy text nor keyword checks establish the absence of
violations in unreviewed images, videos or future seller content.

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

Account-owned transport derives its business and opener from current authorized
owner records. Exact ID/reference guards precede chat commands; private staff
notes, note attachments and carrier handoffs stay hidden through both new and
retained owner adapters. Owners end sessions unresolved; only authorized staff
resolve the transport request. Owner history and technical Support remain separate.

### Public inquiries

In the local FE-066/BE-055 candidate, both public business-inquiry creation APIs
return 410 before body parsing, persistence or notification work. External social
drafts are convenience messages, not order or database authority. Historical
inquiry access remains authenticated and tenant-scoped. The retained domain
compatibility code preserves the following validation rules; they do not enable
new public submissions:

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

- The owner-approved local demo contact correction changes only marked demos'
  public SMS/WhatsApp/Telegram values to +19528552202 and their public profile
  examples to TikTok `tiktok`, Instagram `instagram`, Facebook `facebookapp`, and
  `https://example.com/`. Real-business/private values are preserved. A fresh
  server-derived per-method approval permits inbox methods only when effective
  public contacts match `SUQPAGE_DEMO_INQUIRY_PHONE`, and permits only the exact
  provider-owned profile/site examples independently. Missing phone configuration
  denies demo inbox launches; other fake destinations and email remain protected.
  No approval supplied by a saved snapshot/client becomes authority. Existing
  draft/publication/catalog versions are preserved and required changes appended;
  the private reviewer remains unpublished. Hosted correction/configuration is a
  separate reviewed operation, not implied by local data evidence.

- Next.js Server Actions and custom browser mutation APIs derive trusted origins
  from one exact-origin policy. Development admits only the request/canonical
  origins, explicitly configured origins, localhost, and the current
  Codespaces HTTPS forwarding hosts; production admits only request/canonical
  and explicitly configured origins. Never expand trust from a forwarded-host
  header, hostname lookalike, or wildcard. Next.js development resources use a
  separate hostname-only projection of those validated origins so the LAN-bound
  local preview can hydrate at its exact loopback hostname. Server Actions keep
  host-and-port entries and mutation APIs keep full origins; the dev-resource
  projection does not authorize a new mutation origin.
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

The local app-mail display tranche (BE-059/DEP-049) stopped only the reviewed
ordinary web/worker supervisor after exact birth/argument/source checks. All
five old processes and3102 listener were gone; two stable stopped-state snapshots
proved both app-mail outboxes had zero pending/sending rows and non-null leases.
Only then did Tracking/escalation From names/subjects and optional Telegram's
authored prefix become MirtPage. Active en/am/om Tracking subjects are localized.
Sender addresses, origins, settings, provider/Message-ID keys and retained jobs
were preserved. The identical supervisor command restarted once promptly; web
health and unchanged Expo8082 are HTTP200. The first health verifier used the
wrong IPv4 address for unchanged Expo; corrected localhost verification passes
without another start. This local boundary does not qualify hosted retry safety.

Local notification source separates compatibility from display: validated browser
subscriptions retain Suqpage as the wire token needed by old installed workers;
both new workers display literal MirtPage after the existing dual-title guard.
Expo payloads use MirtPage. All channel/tag/subscription/receipt/permission/quiet/
internal-tap contracts remain unchanged. Old installed browser workers can keep
their old display until normal update; no fleet upgrade or OS delivery is claimed.

The local native default-identity tranche pins the independently verified,
owner-accepted expected MirtPage Play signer. This is not a compiled artifact
measurement or EAS credential-slot proof. Its initial approved hosted targets
are empty: builds fail until the exact new candidate runtime is qualified.
An additive public MirtPage association is prepared with old entries unchanged;
new autoVerify claims additionally require that qualified target and contain only
the exact new apex. Verify served metadata before an Android build and actual
OS association/signature afterward. Submission requires a distinct protected
MirtPage key file; no old app-scoped credential fallback or upload is admitted.
Focused config/Firebase/link/artwork/artifact tests and strict types pass locally.
Combined full gates, provider bindings, native build and store rollout remain
separate; DEP-049 records their exact phases.

Local schema72 permits an unverified tracking recipient without fabricating a
verification timestamp. A protected native backup and migration readback preserve
all earlier data at activation; recipient reads still require verified sessions.
Submit atomically records an independent shipment, audit and initial-details email
job; existing guarded Mailpit/Resend adapters send outside transactions.
The separately authorized S144 cleanup then removes4obsolete local case plans
and9related events using a protected exact archive and isolated restore rehearsal.
All70other public-table/protected-event fingerprints remain unchanged. Live
schema63 has no old plan table and zero target events, so live cleanup is a
verified no-op. No new hosted configuration, migration or deployment occurred.
Anonymous legacy APIs/projections and local obsolete editing screens are retired;
there is no guessed recipient, backfill or automatic legacy import.

Local migration66 adds a nullable message sender-side field without rewriting
historical rows. Its protected before-image, rollback rehearsal, preservation
readback and no-op replay are recorded under S119. Release database changes before
the dependent API/web code; retain additive columns on code rollback. No hosted
migration or provider configuration was changed by the S119 audit.

Local and hosted migration 63 add the private listing-report table after protected
backups and an actual isolated restore rehearsal. The original production-table
fingerprints and private table/sequence permissions are verified. Uncertain hosted outcomes require a pause, independent
readback and exact owner-approved recovery; the migration's verified recovery is
recorded in docs/GOOGLE-PLAY-RELEASE.md. The compatible source ea1b452
web/API is published before the new native build containing report actions.
Rollback preserves reports and privacy rather than dropping records. Exact
production reviewer provisioning/binding and live web/native API sessions pass;
S99 version-3 admission, existing Play signer, active internal testing and native
public test splits are verified. Completed Console declarations and the exact
ten-address tester list and Alpha access/feedback pass saved Google readback.
Source de68832 / Netlify 6aca91cb2f49de22d3839199 publishes the S99.4 five-language
Terms and verified staff report/removal policy. Full check, clean isolated web
release, all 11 acceptance workflows, actual packaged handler/Sharp/worker and
12 live read-only checks pass. Android's existing hosted Terms link gains the
policy without a new build. Database/schema, Android artifact/signing and provider
configuration are unchanged; no customer listing/chat/email/notification is
created. IARC is saved and verified as Completed, with Google review still pending.
The previous deploy/archives are retained as a recovery source, not automatically
restored. Alpha countries and its inactive version-3 draft have saved Console evidence.
Protected-phone and closed/public rollout remain pending. Data safety retains the
full-account deletion request URL but does not claim separate partial-data deletion
or unimplemented certification. No additional artifact is admitted by the consumed exception.

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
guarded command pins the production project and finite exact HTTPS policies, rejects local and
unknown settings or credential changes, and creates a read-only review plan with
a private provider-returned backup. Apply requires the owner's reviewed digest,
a fresh unchanged remote state, and one narrow write followed by readback.
Readback predicts only existing customization flags for approved nonempty email
subjects/templates; all other metadata and provider fields must stay unchanged.
Credential selection defaults to explicit `SUPABASE_ACCESS_TOKEN`; an opt-in
`--credential-source cli` reads only the default Supabase CLI macOS Keychain
entry, with bounded private subprocess output. No credential fallback occurs.
Local S145 version-3 plans bind credential source/fingerprint and operation kind.
Origin transitions additionally bind exact source/target phases and may change
only site URL plus callbacks: legacy → dual-old-primary → dual-new-primary,
with a separately reviewed reverse primary transition. Both dual policies retain
the old callback; legacy settings patches cannot change either origin field.
Old version-2 plans are refused before provider reads and must be replanned.
The focused injected-port/credential suite passes65 tests, including exact current
MirtPage mail and legacy-plan rejection. The owner-approved hosted primary-origin
transition passed guarded apply and an independent read-only project/configuration
check; real sign-in and current-source Android gates remain under BE-059/DEP-049. Management tokens
never enter plan files.
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

Local tracking interface and email copy are authored from the intended meaning for enabled en/am/om. Provider and place names stay literal. Inactive so/ti remain disabled; newly retained compatibility entries may use English and are not presented as completed native translations. Actual active-language web/Expo layouts are captured; native human language review is not claimed.


The local S132 candidate enables English, Amharic and Afaan Oromo choices only.
Somali/Tigrinya catalogs and identifiers remain for compatibility; inactive stored
choices display English. Afar is not available. No customer data is translated or
deleted. The web selector stays disabled until its first client effect and during
language refresh, preventing a proven pre-hydration selection reset. Actual Chrome
switches all three active languages successfully. S133 uses authored vocabulary
for the transport/shipping invitation, live agents and pickup/destination intake.

S130/S131 reuse localized location, Product category, All and result/action labels.
Merchant names/descriptions remain literal. Country formatting requests the current
locale, with the installed browser's English fallback when its locale data is
absent (currently Oromo in Chrome). Active-language layouts and retained catalog
completeness/fallback have separate evidence; automated checks do not establish
independent native-speaker endorsement.

The local staff workflow uses native-authored lifecycle wording through the
authoritative interface TSV and generated catalogs. S121 removes obsolete manual
queue/hold guidance. The S125 customer states keep assignment internal and
distinguish Waiting for our team, explicit joining, Waiting for your reply and
ended/resolved. Staff reply priority, Join and factual inactivity labels use the
same authored catalogs. All four retained non-English catalogs now contain 1617 keys,
including native-authored S127 business-picker actions and count labels. User
names and request text remain literal. Automated completeness does not replace a human first-language review.
S122 editor actions, stock/visibility and Country/City reuse these same existing
localized labels; no new English-only task text is introduced.

S102 search, Country/City/Type, empty/error/retry and setup labels are authored
for all five interfaces. Region is a legacy data field, not a new visible filter.
Place and merchant names remain literal; country display names may use locale
data. Technical catalog coverage does not certify first-language fluency.

Local management task/group labels, contextual owner sign-in and removal/unsaved
confirmations use shared native-authored catalogs. Technical coverage and actual
five-language layout checks remain distinct from first-language human review.


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

S101's local language pass rewrites 138 existing shared source rows and adds the
missing owner "Last 30 days" metric. Public/owner/staff wording distinguishes
selected products from questions, an account from its public page, and a resolved
case from an ended chat. Platform-owned words inside inquiry labels are translated
before interpolation; merchant names, descriptions and quantities stay literal.
Shared owner metric labels and explicit status aliases prevent dynamic labels
from silently reverting to English. English positioning and domain contracts
remain unchanged. References inform the draft; coverage is not proof of fluency.

Rules:

- Use short, everyday English throughout public pages and dashboards. Name the
  actual action: add to an inquiry list, view it, or send an inquiry. Use products and businesses rather than platform jargon; support/transport services retain their own meaning. Do not add filler,
  repeated button explanations, internal notes or implementation terminology.
  S100 local copy describes business showrooms near and far, organized offerings
  and direct questions, using everyday phrasing rather than English invitation
  metaphors or sentence structure; brands and appropriate technical terms retain English.
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

Local S151 B10 makes the localized category name primary in Featured, keeps
weekday/date secondary, and uses readable horizontal overflow on narrow screens.
Only the row moves to expose the selected choice; page/gallery scroll is retained.
Web/native initial silhouettes match the larger tiles. Web Expo buttons expose
their pressed state explicitly; native selected state remains intact. Combined
visual/full/deployment and a rebuilt phone remain separate gates.

Local FE-074 (S151 B07) replaces the blanket loading-bar convention with
resource-scoped feedback: preserve authorized same-resource content while it
updates, use layout-matched skeletons for initial/new content, and keep stable
headers/navigation available. Web business/product collections also include
canonical visitor exclusions in their retention identity; server initial data
must prove that same boundary before use. Blocking or unblocking cannot admit
an older query, page or queued map action. Initial Market/showroom screen-reader
announcements reuse the existing translated loading message. Account/tenant/resource changes must never retain
the wrong private data or action identity. The boundary inventory, implementation
and focused privacy/race/layout checks are complete. Actual Expo checks preserve
cards while reads update. Final source-frozen web checks in English, Amharic and
Afaan Oromo retain12 cards, one scoped status and0px content movement; visible
images decode successfully. Visual/full/device qualification remains pending.
Current deployed behavior is not claimed fixed.

Local S151 B08 (FE-021/FE-024) sizes Featured columns from the gallery's actual
available width alongside sponsors. The live overlap was reproduced at1100,
1024 and768px despite no document overflow. The corrected compiled-component
matrix passes27 width/sponsor states with separate hit targets and unchanged
business order/rotation. Nine real-page geometry assertions and desktop/phone
Next→preview→showroom→Back also pass; intentionally suppressed analytics abort
observations remain an explicit receipt limit. Visual/full qualification and
deployment remain separate.

The local FE-026 B06 candidate resolves one current destination across authorized
task and Account links before projecting phone tabs. Nested Account/security
retains Account selection; More represents a selected task outside the primary
tabs. Focused source and Chrome component checks pass. Authenticated local staff
workflow evidence is limited by missing linked staff fixtures; deployment is pending.

Local map degradation keeps the existing camera, business markers and previews
usable on a neutral surface, with concise native-language status and48px Retry.
Ordinary zooming and preview→showroom→Back must not turn obsolete tile loads into
a false error. Final groups preview at their current camera; only outer aggregate
groups zoom further. No provider block notice or internal HTTP detail is UI copy.

The local transport window offers Tracking even without an active chat. One shell-owned entry leads to Email → code → shipment list → ordered detail,
separate from start/resume chat; returning preserves short-lived drafts in browser memory. Staff use focused task pages and version-fenced drafts, not accordions or permanently editable records. Conditional detail updates stop when hidden and clear revoked/expired data. Staff email status is read afresh on navigation/reload.

Local shipment stages use readable method words, origin/destination pairs and48px
editing controls with explicit Save/Cancel. Recipient views use verified Tracking
access and bounded visible refresh; no fake progress or current-custodian claim.

The local S133 transport launcher shows a clear question and smaller live-agent
line, wrapping within existing accessible targets and measured dock clearance.
S134 consolidates anonymous Report/Block/list controls into one quiet Listing
options entry and bounded modal. These account-free visitor preferences are not
merchant bans. Actual Chrome verifies report Cancel and reversible local block/
unblock; inherited report/tenant security passes. The footer reserves measured
floating-dock space, including the681–720px breakpoint gap. Keep privacy/preview/
stock/error recovery guidance; no additional proven internal-note text was found
in the affected tasks. Chat lifecycle behavior is unchanged by these copy/UI edits.

S131 category choices wrap with48px targets, counts, a clear selected state and
the showroom accent. Long merchant names fit without horizontal-only hidden
choices. S130 adds detail within existing map-row budgets, omitting the excerpt
before location when large text needs space; fonts and all-fit limits are retained.
These are local candidates awaiting visual/full/release gates.

The local Market toolbar has no separate visual title row inside its controls;
S132's web landing introduction supplies the visible page heading above it.
A centered, permanently visible48px two-choice switch
and Info lead to search and labeled filters. Inline placement uses actual content
width rather than the window width; narrow content and larger text wrap honestly.
Do not shrink targets, hide filter words/counts, or add a fixed height that clips
text. Default viewport budgets and actual measurements are mapped in FE-065.
Language choices and retained catalogs follow §18. Expo Chrome
layout/flow checks do not establish installed Android, TalkBack or OS font scaling.

The local S127 counted-business picker follows §5.2: adaptive readable cards,
48-pixel controls and all-fit shop cards without a pager or inner list scrolling.
Opening a business and returning preserves its valid group/selection and map
view. Hidden or zero-size Market layouts must not replace the active visitor
camera context. Individual detail may scroll; the picker does not force zoom.

Staff chat work follows the task order in §13: conversation and reply before
secondary record editing, accurate lifecycle labels, and explicit editing with
Cancel. Desktop context columns must collapse after the conversation on phones;
navigation/filter context and private handoff authority must survive that layout.
Waiting is a server-managed automatic queue. Web and native owner support keep
the same reference and show Waiting for our team until explicit Join; customer
views never announce internal assignment or response deadlines. No staff bulk
recovery action is needed. Retain agent receiving controls; the superseded
per-case company handoff form is removed from the local workspace.

S102/S103 require separate labeled business/product searches with immediate typing,
bounded initial browsing and filter dialogs, paired panel edges, inert
hidden content, keyboard dismissal/focus restoration and reduced-motion support.
New geography selection is country-first and clearable within discovery. See §10.
Market's Android panel-closing Back handler is active only while Market is focused.
Expo's router owns browser history events; do not independently consume its
intermediate navigation events or overwrite an outgoing page's URL. Repeated
explicit map actions remain distinct from an ordinary detail return. Both browser
map adapters cancel owned work and finish an active SDK zoom before destruction,
so delayed resize/zoom events cannot touch a removed or replacement map.

Management opens readable saved records with explicit task navigation. Do not use
accordions to hide required editors, or render every record as an editable form.
Keep selected business context stable and use one clear section parent for back
navigation. Focused owner tasks retain Save/Cancel and unsaved recovery; publication
and restore controls belong in the full Preview. Staff Assignment history has its
own read-only screen and returns to the same authorized conversation/list origin.
Staff chat has one compact route/reference header. Transcript and composer take
priority over management details; desktop shows details beside the chat. On phones
Details/Back is an explicit view that preserves the unsent reply DOM and value;
the hidden transcript cannot acknowledge messages. Join, assignment epochs,
reply authority and inactivity clocks remain server-controlled.
Business entity/task wording stays consistent across lists, headings and local
navigation. Narrow business navigation reveals its active section without page
scroll/focus theft. Overview facts link to their allowed Products, Location &
visibility and Access tasks. Staff Accounts and Workload are peer tasks; Manage
opens the selected existing focused editor, and Save/Cancel preserves the bounded
origin. Queue-role authorization, saved read-first screens and consent stay intact.

Product editors provide a visible Products parent and Save/Cancel together.
Application links and native header/stack/persistent navigation must not silently
discard an edited draft. A pending or failed save stays recoverable; a late
acknowledgement from a departed screen cannot redirect the current screen.
Admin location editing puts the form before the phone summary and separates
canonical city identity from its public map pin.


Entry-page copy must identify the offer and business context at a glance. Use
ordinary product, service, business and store words instead of making a slogan
or metaphor explain the platform. The paragraph adds the customer benefit and
next action; it does not repeat the heading or list internal features. Buttons
name their action/outcome. Preserve enough words for meaning rather than choosing
the shortest possible text. Apply this standard contextually in every language,
and check narrow-phone layout without sacrificing map access. FE-052 records the
primary homepage/app content guidance; these are writing principles, not evidence
of an unperformed customer comprehension or conversion study.

The S100 local Market headline combines the business-showroom invitation with
the benefit of browsing without social-post clutter above unchanged map/search
controls. The supporting paragraph explains near/far discovery, organized browsing,
availability checks and direct questions. About retains distinct customer and
business tabs with browsing and setup actions, showing one panel at a time. Web
tabs support arrow keys and Home/End; native controls expose their selected state. New layout approval/full
checks are pending; S99.10's prior approval does not cover this candidate (FE-052).

S101 permits a plain explanation of "digital showroom" as an internet business
page in non-English headings. Help text carries the task/benefit when a compact
button cannot. Check complete screens with actual merchant content and every
affected audience; an English source phrase or dictionary entry alone does not
prove a useful interface. Both clients retain the existing map and inquiry flow.

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

The local S113 launcher uses the short visible **Transport chat** label on all
public screen sizes. The existing transport invitation and paired route/contact
intake remain one activation away; no intermediate menu precedes the form. A saved
inquiry action sits above transport, and measured scroll clearance keeps final
product/card actions reachable. Existing palette and focus behavior are retained.

Local FE-019/FE-056 owner transport keeps that paired intake and chat styling
inside a focused Account destination with Back to account and Chat history.
The owner's editable saved contact defaults never appear on public controls;
route fields start empty. Owner transport and technical Support remain distinct
tasks, with contextual introductions authored for all five interface languages.

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
   opens Your page to edit About, cover/video, color or public contacts as focused
   tasks, and manages physical products from Products.
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
7. Owner support, security and visits remain connected to the same workspace.
   Retained business-inquiry history stays private; the local FE-066 candidate
   removes its primary inbox navigation and new-inquiry metrics. Customer contact
   uses configured external accounts, while transport chat keeps its own queue.
   In the local owner-transport candidate, Account → Transport chat lets the
   business initiate the same service and recover its own cases/history across
   authenticated sessions. Public visitor cases are never adopted by contact matching.
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

Local S151 B10 category checks cover full active-language labels, enlarged text,
real local schedule responses, selection and business/Back restoration on web
and Expo. Initial skeleton checks remain distinct from server streaming and
physical Android. Preserve raw request failures even when functional assertions
pass; matching suppressed-analytics paths do not establish a clean network run.

Map automation must use declared local synthetic tiles intercepted before any
public request, with service-worker bypass prevented and no escaped requests.
Never continue real community tiles through cache-disabled routing or run public
headless pan/zoom matrices. Real provider availability is a separate ordinary
human browser check; fixture success cannot establish an OSM unblock. Local S139
tests cover403PNG, decode/CORS/timeout, pending rapid zoom beyond10seconds,
unload and explicit retry. S140 tests distinguish aggregate expansion from
camera-preserving terminal previews and reject stale/hidden group keys.

Local S142 focused/actual evidence covers compact staff chat, explicit phone
Details/Back preserving drafts, auto-assignment/Join/public reply/read, hidden
unread protection, notes/clocks and resolution in transport and owner support.
12functional checks/19states retain original failed attempts and a separately
completed existing-case continuation. Message bubbles fit content. The strict
network receipt retains an unproven late body cancellation after HTTP200; no
clean-network/full-gate result is claimed. All labelled cases are resolved,
original records remain intact, and ordinary local previews are restored.

Local S141 adds five isolated tracking and seven migration-compatibility suites,
protected71→72 activation and9headed Chrome/Expo journeys in12states. Staff
submit two plans before recipient verification; real local Mailpit code access,
multiple plans, Save/Cancel, recipient denial and account/session/draft separation
are verified. S143 focused tests cover32cases plus10rendered contexts, including
large-text native wrapping;36functional app checks/36screens cover en/am/om on
desktop web, phone web and Expo. The initial strict browser receipt retains15
cancelled stale discovery GETs during navigation/scope changes; this is not a
claim of a clean network run. Runtime, console, HTTP API, unexpected writes and
lifecycle errors are zero. Full/release/commit/rollout gates remain separate.

Local S138 evidence covers isolated migration/security/concurrency/outbox/pagination and legacy regressions, current types/localization, plus actual installed Chrome desktop/phone and Expo tasks with real Mailpit/API/PostgreSQL. The preserved initial locale-reload assertion failure and canonical Copy correction have focused/actual continuations; no failed receipt is relabelled. Visual approval precedes full/check/acceptance/release gates. There is no new production release or Android/device/push proof.


S129–S136 focused/browser review is combined where the UI is dependent;
no unfinished card/category/preview/copy/safety task is silently dropped. Active
locale layout review is en/am/om after S132, while retained catalog completeness
and fallback are still tested. Old five-language browser receipts remain honest
historical evidence, not proof of new wording/layouts. Source-bound actual tasks,
explicit visual approval and inherited full/commit/rollout gates stay separate.

Affected UI/UX, navigation and management changes require real Chrome user
journeys, not only source review or component renders. Cover the affected visitor,
owner, support/transport staff and admin tasks on desktop/phone web and the
Expo mobile localhost app, using real local APIs and checking saved authority.
Click, type, navigate, Save/Cancel, reload and exercise relevant empty/error/
permission states. Follow `docs/operations/BROWSER-WORKFLOW-REVIEW.md`; retain
honest screenshots, request/state evidence and controlled-port limitations.
S135 distinguishes planned browser cleanup from unexpected close/crash/deadline
events, which fail the journey. Isolated headless installed-Chrome passes do not
prove the earlier unclassified visible-page closure repaired. Keep local servers
and unrelated user tabs running; retain the original failed receipts.
Physical Android-only behavior still needs emulator/device checks. This focused
review precedes explicit visual approval and expensive full gates under AGENTS.md;
browser interaction is not a replacement for persistence/security regressions.

The local S122 wider workspace audit covers38 admin/staff,38 owner-web and33
Expo initial states. Focused product/controller/navigation tests and isolated
PostgreSQL metadata, tenant/version and effective-location tests pass. Real
private-QA signup and26 web states verify product saving, recovery and admin
geography;11 final web states close the reproduced stale owner-location defect.
Actual Expo journeys verify header/footer draft protection, acknowledged About
and Product saves, Products returns, reauthentication/readback and a business-name
save that preserves the complete applied pin/profile and proposal. Original
harness failures and separate checkpoint continuations remain explicit. Both
typechecks,17localization cases/1577keys and199spec links pass. Current visuals
and private role-by-role test instructions are under `.local/workspace-audit-s122/`.
Existing shops are protected; only the new unpublished QA workspace is written.
Visual approval, full/release/acceptance gates, commit, hosted delivery and an
updated Android artifact remain outstanding. This evidence does not certify
physical Android, OS notification delivery or every app workflow.

S121 corrects the old waiting backlog dependency: three focused isolated routing
suites,12worker/controller cases, six staff UI cases and the native owner
lifecycle regression pass. The actual local worker assigns all5 existing waiting
cases once, by eligible workload/tie-break, preserving messages, prior history
and unrelated records. Its historical reference/routing proof remains; current
customer presence follows S125 explicit Join rather than early assignment captions. A controlled failed mobile read
recovers automatically in10.708seconds without Retry. Original coordination/
cold-restart observer failures remain failed and retained; separate current-state
and recovery receipts establish their own scoped outcomes. A10,000-row isolated
candidate query takes5.438ms but uses scan/sort, not index-backed FIFO; no hosted
scale guarantee follows. Both typechecks,17localization cases/1577keys and199spec
links pass. Ordinary web/worker startup is restored with saved provider settings
unchanged. `.local/queue-recovery-s121/review.html` links current local visuals
and limitations. No visual/full/release approval, commit, hosted migration/
deployment or new Android artifact is claimed by this local correction.

S119 has focused visible-read/controller evidence (20 cases), staff route/action/
mounted-editor evidence (six cases), supervised-startup/entry evidence (ten
cases), isolated PostgreSQL routing/recovery/inactivity/receipt/owner-adapter
suites and fresh native PostgreSQL installation/idempotence evidence. Final web
and mobile typechecks pass; localization17/17 covers1577 keys per non-English
catalog. Real local Chrome/Expo workflows verify new assignment, joining,
both-direction replies/read cursors, older-visible/newer-offscreen reads and
ending. The actual idle worker closes a labelled case whose deadline alone was
accelerated; a real30-minute wait is not claimed. Twelve final desktop/phone
English/Amharic admin states verify chat-first layout, explicit company Edit/
Cancel and unchanged inspected customer data. Original strict harness failures
remain preserved, with independent workflow reconciliation rather than false
pass labels. Focus/media are controlled test ports; physical Android/OS behavior
is still unverified. Migration66 backup/rehearsal/readback preserves old messages
and records. Diagnostic QA cases are removed; three ended review cases remain.
S119 traceability records exact receipts. Visual approval, full/release/acceptance,
scoped commit and hosted/new-Android rollout remain separate pending steps.

S118 has92 passing focused persistence, canonicalization, contact-policy,
handoff, navigation, React/native-controller and retained workflow cases. After
moving three deprecated pointerEvents props into styles,26 targeted cases and
both TypeScript checks pass; localization has17 passing cases and1574 keys per
non-English catalog. Actual local desktop/phone web and Expo journeys prove
independent A/B lists, reload, quantity changes, direct-item isolation, ordinary
profile links and enabled WhatsApp/Telegram/SMS choices. Twelve admin states and
three journeys verify contextual tasks and filtered returns without saves.
External openers/clipboard/media are controlled; no messages are sent. Navigation
cancellations of intercepted analytics requests are separately classified, with
original failed attempts retained. These are not installed Android, filesystem
binary, SMS delivery or external-account evidence. Two protected local operations
cover all67 marked demos with rollback rehearsals, preserved immutable history,
private/real records and verified no-op replay. S118 traceability retains receipts.
Visual approval, full gates, scoped commit and hosted/native delivery remain open.

The selected-panel return fix has 27 passing focused pure, actual React/native
controller, app-link/security and installed-Leaflet regressions, plus web/native
TypeScript checks. Local desktop/phone navigation and current Expo browser
journeys are recorded in S117 traceability. Original map/route race failures are
retained alongside clean post-fix checks, not relabeled as successful runs.
External tiles/media are controlled in captures; these are not installed Android,
MapLibre, OS-notification or third-party playback evidence. Existing visual/full
release gates, scoped commit and new web/Android delivery remain outstanding.

The local management structure has focused React/SSR/native-controller, actual
local-navigation and isolated PostgreSQL/API evidence. These checks cover saved
summaries, selected-task editors, field preservation, unsaved cancellation,
current-role/queue denial and version/audit rollback. Visual approval, expensive
full/release gates, commit, production and a new Android binary remain distinct
outstanding steps. Detailed current receipts are in S115 traceability.

S102 has focused SQL/API, signup/starter, isolation, locale, deep-link and browser
evidence. Actual visual approval, full check/release/acceptance gates, scoped
commit and any hosted/native rollout remain pending; compilation/screenshots
alone do not make it complete. Specs/TRACEABILITY.md retains exact evidence.


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

S101's researched local wording passes twelve localization regressions, narrative/
marketing/category checks, both typechecks, homepage composition and 190-spec
validation. Actual local screenshots cover 74 shared-copy, 40 web product/inquiry/
owner/staff, 12 loaded native-owner and 16 native public states (142 total).
Receipts: .local/language-research-s101/. Final runs check overflow and browser
errors; merchant identities, selected items and typed inquiry contact text remain
literal. Map tiles alone are stubbed; Expo browser is not native-device evidence.
A local framework timing error on /dashboard's redirect is recorded in FE-049;
canonical Profile captures pass without suppressing errors or changing redirects.
Explicit layout approval, full checks, scoped commit and publication remain
pending. Prepared marketing text does not replace built artwork or provider
listings. No independent first-language review or fluent-translation certification
is inferred from coverage/research. Domain actions and data contracts are unchanged.

S99.10 released copy uses shared web/native constants and all five locale catalogs. Metro
watches the shared lib directory so copy edits invalidate the local native
preview; private runtime-data directories are not included. Focused
narrative, localization/content-boundary and type checks precede viewport review;
`capture-storefront-copy.mjs --copy-only` checks customer/owner copy, account entry
and localized metadata. Browser-mobile evidence does not prove a new native APK.
The owner approves the actual layouts; full source/release/acceptance and packaged
Linux artifact gates pass. Web publication is independently verified at source 3cfa577, including all five
live-language Market/About/account phone layouts. The exact approved version-5
AAB is built and independently inspected with all five locale headings present
in actual Hermes bytecode. Its separately approved upload/internal activation
passes independent Google original-file hash, signed APK certificate/source-stamp
and fresh Console availability checks. Exact twelve-member tester eligibility is
verified after the owner's append-only request. Under the later explicit start
instruction, Alpha version 5 and saved setup/listings are submitted for review;
Google first verifies In review, then independently publishes closed version 5
Available to selected testers. Twelve-member access and internal 5 are preserved;
zero opt-ins are recorded. Protected-phone/OS alerts and fourteen continuous days
are closed-test work required before production readiness; no actual installed
phone result, production access or public release is claimed.

Web releases use a clean root/shared-contract installation guarded against Expo
and native tooling; the selected full audit includes build dependencies at the
existing severity. Normal monorepo/mobile installs retain the guarded compatibility
adapter and unchanged full native audit. The current local CI candidate makes
required web core/dependency jobs use this selected web release/audit boundary;
pure Android artifact-safety tests remain in core. The full locked-workspace
moderate audit still fails closed for each new AAB; any advisory exception needs
fresh exact owner approval for that artifact. A passing web PR does not approve
an Android build. S61 verifies the web check chain, all 11
isolated acceptance workflows, release stages, private backup/migration rehearsal
and exact Linux artifact. The owner approved S62's one-artifact Expo internal-testing exception for the two
documented tooling advisories, then renewed one additional internal APK for the
latest approved source in S67. The audit remains failed/reportable. Signing, APK
inspection and native-device gates remain required; public Google Play release is pending. Rollout evidence and
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

Maintain the current work board in `docs/SUQPAGE-TRANSITION-CHECKLIST.md` across
new requests. Each compatible request remains open until its own completion
evidence exists; only an explicit owner correction/cancellation supersedes it.
Assign independent workstreams to agents with clear file/verification ownership;
the primary agent retains integration, dependencies and final accountability.
Track implemented, tested, visually approved and deployed states separately.
Resume the first unmet dependency instead of restarting completed provider setup
or abandoning earlier work. Run expensive release gates only after the existing
AGENTS.md approval requirements are met; delegation does not waive those gates.

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
pass. About separates customer browsing from the business-owner offer. The deployed
S99.10 revision addresses nearby social-media businesses and their organized
offerings. S100's local candidate leads with digital showrooms near and far,
organized browsing and direct questions; map/search features stay unchanged.
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


### Local shell and owner management candidate

FE-036/FE-026/FE-056/FE-053 define a consistent public shell for Market, Featured,
About and legal/account-entry/setup pages, grouped Suqpage side navigation, visible
About and session-aware Login/Account labels. The compact owner Account hub has
real activity and five management destinations, with a separate showroom menu
and readable business/private settings summaries. Focused edit/save/return and
initial private preview remain. FE-019/BE-018 require
a real local audit of support and transport, including automatically observing
staff reopen in a closed owner's browser. Shell/dashboard implementation and focused role/navigation/locale evidence pass.
The final combined real local web/Expo chat audit passes, including assignment,
attachments, private notes, capacity, retry, read/history, resolution and reopen.
Visible closed owner web threads reconcile reopening every 30 seconds; active
threads refresh every five seconds and hidden tabs suspend updates.
Visual approval, full gates and
publication remain pending; no production or native binary change is implied.


Local FE-066/BE-055 behavior, corrected by S106, supersedes business-inbox submission and new-inquiry
navigation/metrics above. Visitors retain selected products and prepare a simple
message in their active interface language, with literal merchant text and a
public link for each item. All original configured public contact fields and links remain.
WhatsApp/Telegram receive encoded draft text and SMS its supported body; these
three inbox choices first attempt clipboard copy and retain a selectable fallback.
TikTok/Instagram/Facebook are ordinary profile links with no inquiry copying.
No required visitor phone form,
automatic sending or new business-inquiry rows are created. Existing SMS
external handoffs remain. Existing history
remains private and scoped. Transport chat and authenticated owner support,
including assignment/replies/read notifications, are explicitly unchanged.
This is local candidate work, pending visual approval/full gates and a separate
web/API plus Android rollout; no new deployment is implied.

### Local workflow recovery and validation

The current local audit candidate supplies localized route/root recovery with
Retry and a fixed Market destination, without exposing private errors. Missing
business context on protected management pages returns the actor to the correct
role workspace; it never selects a tenant implicitly. Compact discovery controls
retain 44-unit targets. Owner city editing invalidates a typed replacement until
a canonical city is selected, exposes lookup/category failures and Retry, and
preserves an explicit storefront until the owner changes city. Web cover upload
and save each have a 20-second response bound, retain unsaved input on failure
and require an acknowledged save before returning to Dashboard.

Business and handle editors retain fields after a rejected save, display
localized retry feedback and prevent duplicate in-flight commands. Mobile
transport recovery-storage failure stops loading and offers Retry before allowing
a new intake; an unknown saved session is never discarded implicitly. Native
Auth SDK HTTP calls use a bounded 20-second transport/body adapter with caller
cancellation and a response-size limit. Existing SDK authentication, session and
refresh policies remain authoritative (FE-053/BE-044).

Local sign-out immediately fences private UI/requests and retains a visible
provider-scoped Retry if SDK or persistent device cleanup fails. New sign-in is
blocked until that retry confirms cleanup. The existing provider now uses its
documented default coordination; the deprecated custom processLock caused a
secondary unhandled storage-error promise and is removed. No error listener,
credential, provider or package-version change is used to hide the failure.

These FE_BASE/FE-026/FE-056/FE-065 candidates have focused regression evidence.
The local role screen inventory, owner persistence, first-Publish and paired
support/transport behavior checks are complete; dedicated attention/read-receipt
browser checks also pass. Strict combined chat captures retain a Next development
performance-timing exception. Native-device interaction and full production-mode
gates remain separate pending evidence.
BE-054 also corrects admin map placement to finite worldwide GPS bounds without
changing country/city identity, proposal versions or tenant authority. A private
local test-account guide is linked from `docs/SUQPAGE-DEMO-ACCOUNT-ACCESS.md`.
Visual approval, production-mode full gates, scoped commit and rollout remain
separate. The local Android debug build is a test artifact, not a released APK.


### Local S108/S109 workflow candidate (review pending)

BE-018/FE-019 unlimited balanced assignment is implemented and focused-tested on
isolated PostgreSQL, with actual local web/Expo visitor/staff reference agreement,
assignment changes, paused-assignee form preservation and separate agent joining.
Public chat displays its reference; delayed recovery/polls cannot overwrite newer
state or another case. The reported older local case is preserved unchanged; its
original conflicting browser display has not been conclusively attributed.

FE-026 S109 reorganizes admin navigation into platform-wide work and an authorized
business context. Business details/location/showroom/products/access are reached
from that context rather than a second expanding sidebar. Lists show saved records;
staff creation has a dedicated route, and settings/location/sponsor/lineup/workload
editors open deliberately with Save/Cancel. Owner Business details and Account
settings also open saved summaries; explicit Account task/Edit links open their
focused editor. Business settings use BE-032 optimistic version/fresh-role checks;
validation/network failures retain input and unexpected errors are sanitized.
Sign-in email remains provider-managed; queue roles gain no business editing rights.

FE-065/FE-053 S109 compact exploration keeps the accepted narrative in an explicit
About dialog/sheet and on desktop. A centered mode switch and one active labeled
search/filter toolbar leave most phone content space for map/products. The other
panel retains a restrained edge, with a 48px dedicated toggle/drag target; panels
follow the handle and honor reduced motion. Products starts at the right; pull
left over the initial Businesses map, then pull the left-side map handle right to
return. Map gestures, product scroll and
independent search state remain separate. Short screens use a compact transport
control to avoid overlapping the handle. Five-language native-browser evidence is
separate from real Android device/MapLibre verification, which remains pending.
Market return-selection and explicit navigation precedence follow §10; leaving
the map also cleans up pending SDK animations/events before its view is destroyed.

These are local candidates, not deployed behavior. Focused evidence is recorded
in TRACEABILITY S108/S109; actual visual approval, full production-mode/release
checks, reviewed scoped commits and coordinated rollout remain separate gates.


### Local S110 owner Account candidate (review pending)

FE-056 keeps the public account gateway simple: Login before authentication,
Account afterward. The saved owner hub shows showroom identity/status, three real
activity measures and five task rows. Your page opens its own four-action menu;
Business details and Account settings open saved summaries with explicit Edit.
Native private profile edits and notification preferences have separate screens.
Sign out is in private settings and retains the provider-scoped failure/Retry
behavior. Existing APIs, ownership and private/public data boundaries are reused.
Focused web/native component and browser evidence precedes visual approval and
full release checks; this is not a deployed web or Android change.


### Local S111 chat session upkeep and public reachability (review pending)

BE-018/FE-019/FE-036/FE-053/DEP-043 define the focused-tested local implementation:
only a staff public reply starts waiting-for-participant inactivity. Guest transport
warns after25 minutes and ends after30; owner support warns after23 hours and ends
after24. No unanswered customer request, assignment/join/read or internal note
starts that clock. Server maintenance is indexed, small-batch, nonblocking and
reuses the notification schedule. Automatic ending is unresolved history, with
contacts/messages retained and explicit authorized same-case Resume. Clients
show server deadlines/reasons; no browser heartbeat/close timer is authority.
Transport help appears across supported public routes except account/setup/chat
flows; owners use the prominent Account → Support task. Additive local schema and
focused tests precede any hosted migration or app release. Focused database/component and actual local web/Expo evidence passes. Visual
approval, full production-mode/release gates, reviewed scoped commit and any
hosted migration/web/Android rollout remain pending; no deployed claim is made.

The minute maintenance command processes at most 25 cases from two indexed,
bounded participant candidate sets, ordered by ending deadline. Its three-second
work-start budget controls starting more cases; it is not an exact transaction
deadline. Statements are bounded and a transaction-local five-second idle timeout
releases locks if an interrupted worker stops issuing queries. Notification work
runs first and late maintenance defers. The guarded local:chat-worker command
provides recurring upkeep for the local preview; it refuses hosted/production
targets and never migrates or changes provider configuration. Old conversations
have no retroactive clocks. A worker backlog may delay ending after eligibility.

The owner-support reply-only interface rejects unsupported explicit private-note
intent before writing, avoiding accidental visible replies. Transport keeps its
existing private-note behavior; ambiguous historical messages are preserved.


### Local S112 product-only catalog candidate (focused tested; review pending)

The newest owner instruction supersedes active service listings and product/service
filtering in §§2–4,7–8,10–11,13,18,20–22,25 and prepared launch narrative. FE-067 /
BE-056 / DEP-046 define a product-only local candidate: retailers, farms, workshops
and manufacturers list physical products, with Ready to ship or Made to order
choices and a product-scope Made-to-order toggle. Availability stays independent;
unavailable products never claim immediate shipping. No stock count, checkout or
transport guarantee is introduced. Transport help and owner support remain active.

The local candidate is implemented and focused-tested, not deployed. Historical
service records/snapshots remain preserved privately; public service admission and
new service writes are retired. Legacy manufacturing/production kinds stay neutral
until an explicit owner choice. Demo sources and local marked demo content were audited and corrected for actual
repair/diagnostic listings as well as incorrectly classified physical products. Preserve real tenant text, IDs/handles, login aliases, safe fake
public contacts, GPS and chat/history. No new migration/provider/dependency is
required; local correction needs protected before-images and exact invariants.
Focused tests and actual five-language web/Expo visuals precede the still-pending
S107–S112 visual approval/full gates and any separately authorized rollout.

S112 focused evidence includes canonical product writes/history/public admission,
independent exact/fuzzy/count/metadata/custom filters and active catalog labels;
web and native editors, social selection and gallery compatibility are covered.
The reviewed one-time local correction retains66 maintained demos/264 products
(163 standard,101 made to order), and updates the private reviewer fixture's three
physical samples while leaving it unpublished. Protected hashes and readonly
replay prove identity, contacts, GPS, media, historical snapshots and other tenants
are preserved. No hosted data operation or new binary is claimed.

The S112 native-browser review reproduced and corrected two narrow defects: Space
activation of the custom checkbox and a delayed Leaflet resize callback after
map teardown. Installed-Leaflet/actual-React tests cover mounted updates and safe
unmount/remount; browser results do not establish Android MapLibre behavior.
Localization generation now scans native app/src before pruning client messages,
so native-only product labels remain available in all1546-message catalogs.
All five languages retain contextual support/transport explanations. Details,
strict original failures and bounded supplements are in S112 traceability; visual
approval and full release gates remain pending with S107–S111.


### Local public floating actions candidate (review pending)

FE-041/FE-036/FE-053 refine §§8–9,13,18–19 and public reachability. Once selections
are added, a compact floating Inquiry list shows only the current business's count
above Transport chat on its showroom/product screens on desktop/phone web/native.
There is no empty persistent list action. A direct product inquiry stays separate:
opening, changing quantity, copying or closing it never merges/clears the group.
The existing configured social auto-copy/handoffs and extra manual copy remain.

Web selections persist per showroom as references revalidated against current
canonical products/options. Native keeps independent per-business reference lists
using existing document storage (Expo browser localStorage), isolated by API
origin. Each holds at most20 canonical IDs/options/optional quantities, never
catalog snapshots, contacts or private account data. Loading cannot overwrite an
unread saved list; failed writes preserve in-memory choices and provide localized
retry feedback. A one-release in-memory bridge preserves an already-open older
basket. Lists survive local reload/restart, without cross-device sync. The global
last-shop fallback is removed: Market/Featured/About/account/setup and another
empty shop cannot expose A's list. The composer route explicitly identifies the
business and rehydrates fresh public authority before counting or copying.

Transport chat opens the existing route intake in one tap, or the recovered chat;
Start chat explicitly creates a request. Arranging the web dock keeps its single
chat instance and unsent intake draft intact. Native root and Market placements
remain separate to avoid duplicates. Short Market stages show transport only,
without a business inquiry-list icon. Readable contextual labels in all five
languages, at least 48px targets, measured footer/scroll clearance and safe areas
apply. No new message is automatically sent, and no business inbox is restored.

The earlier S113 component and local web/Expo evidence contains105 unique
states across five interface languages, with two historical centered short-web
showroom shots explicitly superseded. Normal web recovery uses a themed loading
bar while its fresh session GET is pending; only a completed failure shows Retry.
A deferred-fetch regression proves this transition and unsent-draft preservation.
S118 supersedes the global-list lifetime: its current per-business lists and
contact choices have the focused/current-source evidence in §22. Explicit visual approval together
with S107–S112, full gates, a scoped commit, deployment and a new Android binary
remain separate and pending. Installed Android is not claimed.

### Local S114 owner transport candidate (review pending)

Account → Transport chat gives business owners the visitor-equivalent paired
intake and live conversation, for customers' goods or incoming stock. The separate
authenticated web/native adapters derive tenant/opener from current authority;
contact defaults are editable and private, and routes start blank. Account history
recovers the canonical case across sessions, without adopting a visitor token.
Technical Support stays separate. Both visitor and owner transport reach the same
authorized staff queue; staff retain callback details and private follow-up notes.
Owners end sessions unresolved; staff resolution remains explicit and distinct.
Private notes, carrier details and note attachments stay hidden through retained
owner adapters as well. The owner23h/24h inactivity window remains authoritative.

Focused PostgreSQL/security/API/component tests and actual local web/Expo/staff
exchanges verify creation, assignment/join, both-way replies/read receipts, history,
reload, unresolved ending and resolution. Sixty current five-language visual
states pass; the raw test-tool failures and their classifications remain preserved
in S114 traceability. Source/catalog/type/spec checks pass. No further schema or
provider is introduced; existing pending release prerequisites still apply.
Visual approval, full gates, commit, hosted rollout and an updated Android binary
remain pending; browser preview evidence does not establish installed-device or
OS notification delivery.



Local S125 chat candidate (BE-018/050, FE-019/053/062, DEP-043) separates internal
assignment from deliberate current-assignment Join and public replies. Reads do
not join. First/next unanswered cycles keep their oldest customer anchor, use an
internal ten-minute target and one staff/manager overdue alert without resolving
the request or replaying old alerts. Guest25/30minute and owner23/24hour inactivity
windows begin only after a public staff reply. Due endings retain an immutable
staff-only record of reply/message timestamps and confirmed-read state at ending;
unknown historical proof is never fabricated. Staff explicitly resolves either
queue, while participant End and inactivity remain unresolved follow-up history.
Migrations67/68/69 are backed-up, rollback-rehearsed and applied only locally. Focused
security/persistence/component checks pass; actual Chrome web confirms Join,
replies/reads, overdue escalation, real-worker ending and retained unread proof.
Actual Expo390 verifies visitor/owner Join, both-direction replies/reads and
ended/resolved history across15functional states; its strict network receipt
remains mixed for two cancelled read requests with unproven cause. Current
visual/full/release gates and installed-device evidence remain pending.

Local S126 extension (BE-018/050, DEP-043) gives a new assignee ten-minute
response grace after the later of current assignment or oldest unanswered message,
without rewriting original customer wait. Join, reads and private notes are not
public replies. Assigned overdue work adds one admin/operations-manager email per
cycle/assignment/recipient through a private durable outbox and the existing
Resend port. Fresh authority/cycle checks suppress stale unsent jobs. Emails
contain reference, queue, assigned staff name and an authenticated link, never
customer identity/contact/message/route. Bounded retries and stable idempotency
protect against duplicate sends. Unassigned overdue queues create internal alerts
without staff-blaming email. Prior cycles receive no catch-up email flood.

Schema69 and actual local Chrome/Mailpit proof pass: six authorized managers,
one email each across three bounded worker runs; the next run sends none. Public
reply clears overdue and staff resolution retains history. Local workers only
use verified Mailpit; external email rejects loopback database/Auth endpoints and
DSN target overrides. The current catalogs contain 1606 keys across four non-English languages,
including S127 picker labels.
No provider credential/configuration, hosted database, public web or Android
release is changed by this local candidate. Current visual/full/release/commit
and coordinated hosted/device rollout gates remain pending.


Local S127 map refinement (FE-021/053/058, BE-023) implements the shared
screen-sized fixed-group policy and all-fit picker in §5.2. Prior dynamic,
global-three and leader/paging evidence is historical. Latest implementation
and verification are in progress; visual approval and full gates remain pending. New picker copy is authored for all five
interface languages; business names remain unchanged. Actual Chrome workflow and
controlled density evidence are recorded separately in TRACEABILITY. Visual
approval, full gates, commit and coordinated web/Android rollout remain pending.
No database migration, dependency, provider, coordinate or chat change is needed.


S145 local support-default and release-readiness behavior is focused-test
verified (BE-059/DEP-049; sections13,15,17 and22). Migration73 changes only future
support defaults, and the general-support writer explicitly uses MirtPage client;
old conversation labels, tenant names, delivery jobs and every existing row stay
unchanged. A non-null text column with the exact reviewed Suqpage/MirtPage default
is required. Only the same genuinely fresh empty-schema install may admit the
immutable baseline47's absent default; a versioned NULL/custom default stops for
review. Retired subscription defaults/history remain inactive and unchanged;
transport is the only revenue. Release preflight recognizes
exactly the full1..74 native ledger or the proven copied1..26+31..74 ledger.
Historical27–30 are retired data-only patches; none is replayed or backfilled.
Partial groups, other holes (including64), duplicate/noninteger and unknown/future
IDs fail, retaining Auth/account/configuration checks. Focused correction tests
and independent peer review pass. Mail readiness and fresh source approval
precede the held combined gates. Deployment must explicitly run this preflight
after migration; Netlify builds and liveness health remain database-readiness-free.
All18 applicable isolated PostgreSQL/runtime/security/migration/brand scripts
pass together at endpoint74, with scoped strict types. The stale positive
runtime fixtures were corrected to the
current made-to-order and explicit-assignee-Join contracts, preserving negative,
version and duplicate checks. Earlier failed receipts remain. Ordinary local72
and hosted63 are unchanged by this preparation; mail/runtime/provider cutover,
full combined-candidate gates and publication remain separate.


The S145 reference-data74 correction is locally verified (BE-059/DEP-049; sections5,13,15,17
and22). Current business selection has seven categories, but the copied legacy
reference table lacks farms. Migration74 inserts only missing canonical
keys and normalizes the seven known positions, preserving existing labels/icons/
active flags, unknown references and all tenant/product assignments. Inactive
known keys or unexpected metadata stop for review. Endpoint74 retains exactly
the two proven full/legacy ledger histories; no historical marker backfill.
Real isolated signup/owner/integrity/rollback/replay tests and independent peer
review pass, including a reconstructed six-key legacy63→74 upgrade. This is
fixture evidence, not a production-backup rehearsal. Ordinary local72 and
hosted63 remain unchanged; full gates and approved backup/rollout remain separate.

Planned S145 follow-on (BE-058/FE-069/DEP-048; sections5,12,13,16,17,18,19 and22)
names the active feature Shipment tracking and adds optional provider tracking
links/codes per ordered leg. These remain staff-authored details inside the
email-verified recipient portal, without carrier fetches, embedded pages, scans,
status/ETA/custody claims or automatic code insertion into URLs. Tracking-only
types normalize missing historical fields without changing old rows, keys or
idempotent Submit results. Additive75 widens only existing JSONB/audit
size checks for bounded links/codes; all prior authority/data rules remain.
Initial-email wording changes separately require a fresh stopped/zero/in-flight
mail fence; new provider links/codes stay portal-only. The exact Ready contracts
were accepted; Tracking-only parsing/equality and additive75 are implemented with
all21 focused isolated/pure scripts, final pure precision coverage and scoped
strict types passing. Old stored JSON/key replay, recipient/role/304 denials,
pending/leased snapshots and migration row/ACL/rollback/refusal outcomes are proved.
Source peer, ordinary-local backup/apply, real browser/visual evidence and a new
combined full-gate source freeze remain pending. The completed mail tranche and
schema74 evidence remain intact for their earlier source; neither is permission
to migrate or publish this follow-on.

S145 local mail/notification presentation now has focused Auth65 and renderer14
cases, both durable-delivery regressions, localization24, worker11 and actual
isolated PostgreSQL notification dispatch proof. The original shared Expo-token
owner/visitor binding remains tested alongside an added browser subscription;
old browser wire compatibility is exercised against immutable published worker
bytes. Native map User-Agent is MirtPage with the same exact HTTPS host/header
boundary; all11 map cases and mobile strict types pass. The unreachable on-behalf
compatibility adapter and retained event history remain unchanged.

Actual installed Google Chrome passes42 email presentation/navigation states:
12 Auth templates×phone/desktop and9 plain-text app messages×phone/desktop.
The owner explicitly approves the combined visuals/full checks on2026-10-18.
No real email, local Auth reload, OTP redemption, OS push or hosted activation is
claimed. The local web/worker M6 boundary and original failed IPv4 Expo verifier
are retained separately; one ordinary supervisor restart restored HTTP200 and
the correct unchanged localhost8082 check passes. Current full combined-source
gates and separately reviewed hosted/native rollout remain the next dependencies.
