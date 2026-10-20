# MirtPage Project Master Prompt

Read this current product brief with [AGENTS.md](AGENTS.md) and
[specs/README.md](specs/README.md). It records product boundaries, not a release
transcript. Existing numbered headings retain their identities for spec references;
older “Suqpage” heading names are compatibility anchors, not the public brand.

MirtPage is the current brand at **https://mirtpage.com**; Android uses
**com.mirtpage.app**. Supabase PostgreSQL, managed Auth and private Storage serve
the application. Stable historical provider/protocol identifiers remain where
compatibility requires them. Their spelling does not authorize recreating services.

This brief describes the current source contracts. Implementation, focused tests,
visual approval, publication and physical/Play qualification are separate states.
For the actual deployed source, active recovery, unfinished work and exact evidence,
start with [DEP-049](specs/deployment/DEP-049-mirtpage-domain-and-app-cutover.md)
and the current section of [the transition checklist](docs/SUQPAGE-TRANSITION-CHECKLIST.md).
Do not infer that every source capability is deployed or every binary is qualified.
Historical rollouts belong in Git, their existing release documents and controlling
specs; raw logs, customer data and credentials never belong in this brief.

Use the task to choose the next detailed reading; do not load every spec:

| Work | Start here | Detailed contract |
| --- | --- | --- |
| Identity/narrative/localization | §§2–3,18 | FE-070, FE-049 |
| Showroom/products/contact | §§5,7–9,21 | FE-040/FE-041/FE-066/FE-067, BE-055/BE-056 |
| Map, product search, Featured or SEO | §10 | FE-021/FE-033/FE-065/FE-071, BE-054 |
| Account/security/onboarding | §§11,16 | BE-031/BE-053/BE-061, DEP-050 |
| Staff/workspaces/chat | §§13,19 | FE-026/FE-056/FE-072, BE-018/BE-050/BE-060 |
| Shipment tracking | §§12,16 | FE-069, BE-058, DEP-048 |
| Runtime/data/release | §§15,17,22–23 | Relevant DEP-029/DEP-044/DEP-049 section |
| Engineering/documentation workflow | §24 | AGENTS.md, DEP-002, ENGINEERING-READINESS.md |

## 1. Your role

Build and maintain MirtPage as a multi-tenant digital-showroom and discovery
platform for businesses in East Africa. Preserve each business's identity and
literal product information while improving usability, security and reliability.

MirtPage provides one consistent showroom experience. Businesses organize what
they sell, make or grow; customers browse clear product choices and ask through
that business's configured external channels. Transport arrangements and private
business-owner support are separate first-party conversations.

Follow the newest user instruction within the security, tenant, privacy and
data-integrity boundaries in AGENTS.md. Do not turn a requested improvement into
a generic website builder, checkout marketplace or unrelated architecture rewrite.

## 2. Product identity

Use **MirtPage**, the approved two-panel M artwork and the canonical values/assets
in `lib/brand.ts` consistently across web, mobile, mail and store media. The public
introduction is “A professional digital showroom for every business.” Logos and
merchant pictures are not recolored by a showroom accent or locale.

Enabled interface languages are English, Amharic and Afaan Oromo. Native means
the Expo visitor/owner application, with its own navigation and platform behavior;
it is not a web wrapper. Staff/admin workspaces are web-only. Android configuration
and admitted runtime targets come from the current mobile release policy, not an
old package name, example URL or provider slug. iOS remains outside the admitted
release path until separately specified and qualified.

### Current experience (FE-040–FE-042, BE-032/BE-033, DEP-030)

A permanent `/@handle` showroom combines the business identity/story, media,
physical products and optional product categories, then its configured public
contacts. Products have shareable detail URLs within the same page. Market,
Featured, About, legal pages and account entry use a consistent public shell.
Owners manage their private account and business through Account task screens;
authorized staff use business-centered workspaces. There is no active custom-page
request, revision-import or design-library product workflow.

Identity and narrative detail: FE-070, BE-059 and ADR-0029. SEO: FE-071.

## 3. The problem Suqpage solves

Businesses may advertise on social media while their products, variations and
story become hard to find among old posts. MirtPage gives online sellers, shops,
workshops, growers, makers and suppliers an organized digital showroom that
customers can browse before asking a specific question. It is not limited to
online-only sellers or physical retail premises.

Explain the benefit plainly: discover businesses nearby and farther away, learn
what they carry or make, browse named products and styles with their listed
availability, then contact the business directly. Social channels remain useful
for conversation and the final sale. Do not imply verified stock, a completed
purchase, automated fulfillment or an exact home address.

Web Market retains a compact visible introduction on a plain background. Mobile
prioritizes exploration space; About explains benefits to both visitors and
business owners. Write inviting, professional copy rather than hype or literal
translations of internal brainstorming. FE-070 and FE-049 control authored copy.

## 4. What Suqpage is—and is not

### Suqpage is

- A public business showroom and geographic/product discovery platform.
- A dynamic **physical-product** catalog, including ready-made and made-to-order goods.
- A per-business inquiry list and localized message preparer for external contacts.
- A self-service owner workspace with administrator-authorized staff assistance.
- Human transport-arrangement chat, private owner support and separate
  email-verified shipment tracking.

### Suqpage is not

MirtPage is not a payment processor, checkout/order system, inventory counter,
ERP, tax/accounting engine, automated carrier booking/dispatch service or
merchant-listing guarantee. A selected product, copied message, chat, tracking
record or external link is not a paid order, confirmed booking or delivery proof.
No managed AI, cross-language semantic search or external scan integration is
claimed merely because an agent helps with development.

Use **Inquiry list** for saved product selections. Do not relabel them as paid
orders. Product-only catalog rules do not remove legitimate references to support
or transport services. FE-067/BE-056 supersede active service catalogs.

## 5. Non-negotiable design philosophy

### 5.1 One profile, each business's content

Use the shared BusinessProfile experience with each business's canonical public
catalog and current published page. Preserve its name/logo, literal story, media,
products, optional categories and public contacts. Industry does not select a
custom layout or fabricate editorial content. A hero image can be the video
poster; one intentional play control loads the admitted provider player. Do not
repeat the same story/video in several sections.

The optional saved page accent belongs to that business's presentation, not its
owner's account or platform theme. It may tint permitted surfaces and controls;
canonical branding, photographs and playing video retain their original appearance.
Page settings, live Save, preview and publication retain version and tenant guards.
Live/sharing controls are authored presentation settings, not proof that a provider
broadcast started; retain only configured links and truthful status. Sound/push
preferences do not change the business's public content or permission authority.

### 5.2 Suqpage must have its own platform identity

Keep a consistent shell, typography and recognizable controls across Market,
Featured, About, legal/account pages and workspaces. Use ordinary page/task
navigation rather than dumping editable records into one long screen or hiding
primary work in accordions. Saved summaries are read first; Edit opens one focused
task with clear Save, Cancel and return context.

Businesses/map and Products are separate exploration panels with a centered
switch and reachable edge handles. Businesses is the new-session default; the
Products handle starts on the right. Each panel can expose its counterpart without
showing the inactive panel's controls. Preserve reduced motion and keyboard use.

Featured's category name is primary, with decorative art and secondary day/date.
Its scheduled day/category mapping stays intact: fixed Monday–Sunday dates use the
Ethiopia-local week, with current-day agenda/timing and up to six eligible businesses
chosen automatically or by an authorized date override. This virtual presentation
is not a physical event or an integration that starts social-media broadcasts.

Sponsors are clearly labelled promotional placements in an independent, manually ordered global
pool of up to five eligible showrooms or validated external ads. External ads never
become fabricated businesses/map records. The carousel gives equal six-second turns
with Previous/Next/Pause, pauses offscreen/background/during interaction, and starts
paused for reduced motion. Sponsor spotlights and Featured selection do not change
that cycle or search ranking. Keep their space separate from business/product cards.
Agenda, eligibility, overrides and cache invalidation belong in FE-021/FE-024/FE-033
and BE-029; do not duplicate the whole schedule or claim a sponsored endorsement.
Use plain application backgrounds, not decorative image backdrops behind text.

### 5.3 Public copy must look finished

Prefer concrete labels, clear hierarchy and concise contextual explanations.
Remove internal implementation notes, placeholder sales claims and repeated button
instructions. Keep necessary privacy, security and failure guidance. Merchant-entered
text is data, not material to rewrite or translate without authorization.
Use the same meaning across platforms while adapting wording and layout naturally.

Details: FE-029/FE-036/FE-040/FE-053/FE-054/FE-056 and the relevant current specs.

## 6. Current local benchmark tenants and visual direction

Marked fictional demo businesses exercise varied product counts, industries,
optional categories, media and supply types. They are fixtures, not real clients
or authority for merchant facts. Generated demo illustrations are illustrative,
not documentary product photographs; use honest no-photo placeholders when genuine
media is absent. Never fill a real business with unrelated demo logos or videos.

Private sign-in aliases and account contacts stay separate from public showroom
contacts. Only the exact operator-approved demo inbox destinations and provider-owned
profile/site examples may be interactive under the server-derived per-method policy.
Missing configuration or an unrelated fake destination stays inert. Do not hard-code
an owner's phone number in UI/domain code or infer contact permission from saved
client data. Demo corrections are finite reviewed operations, never broad syncs.

DEP-041/DEP-045/DEP-046 and the protected demo-account directory own fixture setup
and exact correction evidence; this brief carries no credentials or fixed row counts.

## 7. Dynamic catalog model

PostgreSQL is canonical business/product authority. Renderers consume typed
application/catalog data rather than hard-coded tenant products or database handles.
The active hierarchy is **Business → optional Product category → Product**.
Categories are optional, merchant-defined groups; retained collection/revision
structures are compatibility/recovery input, not a second active browsing taxonomy.

New goods use `standard_product` or `made_to_order`. Retained service records are
private compatibility data: no public rows/counts/metadata/detail/inquiry access,
no new service writes and no automatic conversion into physical goods. Editing a
retained service requires an explicit valid product conversion. Retained production
kinds remain neutral until the owner makes a valid supply choice.

Descriptive availability is `available`, `limited`, `unavailable` or `coming_soon`.
Ready to ship/Made to order and availability are independent merchant declarations;
unavailable/coming-soon items must not claim immediate supply or permit ordinary
inquiry selection. There is no exact stock/variant inventory, reservation or deduction.
Historical stock fields remain ignored recovery input, not current authority.

A product may carry ordered validated media, description, optional nonnegative ETB
display price, merchant-defined offered-by unit and concise highlights. Current
canonical option groups, where present, retain their validated values and defaults;
zero to four groups are supported. Desired quantity is optional free-form inquiry
intent, bounded to 80 characters, never inventory. Optional capacity/minimum-order/
lead-time facts must be authored, not calculated or verified by the platform; the
shared public product view omits those production facts.

Admitted owner video links use canonical supported provider IDs, never arbitrary
iframe markup. Preserve media ordering, ownership, visibility and the gallery limits
in BE-042/BE-048. Example starter footage is not evidence of a merchant's work.
Details: BE-009/BE-021/BE-040/BE-042/BE-048/BE-056 and FE-047/FE-050/FE-067.

## 8. Product and inquiry workflow

Public product cards show useful images/placeholders, a bounded description,
availability/supply context and source-business city/link where relevant. Keep
product and business targets distinct. Support card-level Add when a valid
selection can be formed, plus navigable `/@handle?product=<id>` details for more
information and option choices. Missing, foreign or unpublished items fail safely.

A direct **Inquire about this product only** action prepares that selection alone.
It does not merge with, clear or submit the saved list. **Add to inquiry list**
saves a canonical product/option reference for that business. The floating list
button appears only on that business's showroom/product pages when selections
exist, counts only its items and is not a global Market/Featured cart launcher.
Other businesses retain their own lists. The list is capped at 20 items and is
rehydrated against the latest eligible canonical products/options before use.

Contact prepares a short inquiry in the current interface language, with literal
merchant data, optional quantity intent and each canonical product link. Offer only
validated effective public WhatsApp, Telegram and SMS destinations, then the manual
copy/selectable-text fallback. No visitor phone capture or platform Send form is
required. Repeated taps must not create duplicate in-flight copy/open operations.

New first-party business-inbox submissions and their primary owner navigation,
metrics and alerts are retired. Stale creation APIs return 410 before body parsing,
persistence or notification work. Authorized historical records remain private;
retirement does not delete them. Transport and owner Support are unaffected.
Details: FE-041/FE-066, BE-055 and §9.

## 9. Social messaging and clipboard behavior

Activating a configured inbox action copies the draft before opening its supported
destination. Clipboard success is not delivery. Preserve selections and a complete
visible/selectable message when copying, popups or application opening fail. Never
pre-open `about:blank` and wait for asynchronous permission. Manual Copy remains
an additional option, not a replacement for automatic copy.

### WhatsApp

Use the validated business international number, normalized to digits for its
supported link, and include encoded draft text where supported. A public phone
number alone does not imply WhatsApp availability.

### Telegram

Use a validated username or explicit international phone identity, never a guessed
username/invite hash. Include supported draft text; recipient privacy/app settings
still govern whether the conversation can open.

### General fallback

SMS uses the supported message body and system handler. TikTok, Instagram and
Facebook belong in ordinary business profile links, not universal inbox choices;
opening those profiles does not copy an inquiry. Native ordinary HTTPS links use
a system in-app browser with Close/Back; recognized WhatsApp/Telegram links try
the installed app then the original HTTPS fallback. Phone/SMS/email use their
system handlers. Merchant links are tappable plain text, not injected HTML.
Returning from another app never confirms sending, a sale, payment or an order.

Details: FE-066/FE-053 and the existing contact/link adapters.

## 10. Market discovery behavior

Businesses searches public business identity/profile/location and controls map
results. Products searches eligible physical products with source-business context.
Each scope owns its query, optional category, country/city and other filters.
Made to order belongs only to product search; there is no Product/Service filter.
Search updates while typing, with debounce/cancellation and no Enter requirement.

Start with bounded default results. Products use 12-card server pages with incremental
scroll loading only while open, single-flight requests, ID deduplication, retry and
an accessible Load more fallback; native is virtualized. Map results are capped at
200 with matching counts and a narrowing prompt. Only anonymous unfiltered first
pages share the two 20-second defaults; queries, later pages, filters and exclusions
bypass them. Do not add polling to discovery.

Category/country/city choices are clearable multi-select: OR within a set, AND
across filters, with canonical geography validation. Country precedes City;
changing country removes incompatible cities. Public choices/counts derive from
eligible public businesses, not drafts, hidden or excluded records. Preserve literal
merchant names and same-named cities' country/canonical identities. Search uses
parameterized Unicode-aware matching and bounded typo candidates after all
visibility/type/geographic filters; product matches do not impersonate business
identity matches. No cross-language semantic search is claimed.

Preserve the selected scope and each scope's criteria/position through details,
Back and Market return. Memory is bounded public tab/app state scoped to API origin
and query, valid for two hours; explicit URL/history actions win. Do not store result
payloads, credentials or account data as navigation state. New query/exclusion/resource
identity fences late responses and map callbacks; stale results cannot claim the
new query or overwrite the current saved camera. Keep the map mounted, resize from
valid measured dimensions and ignore hidden zero-size/disposed work.

Outer numbered clusters zoom into smaller groups. An exposed final group opens
its exact viewport-admitted business preview at the current camera, without forcing
maximum zoom or spreading icons/connector lines. Group size adapts so all admitted
previews fit together without paging; isolated businesses may stand alone. Preserve
selection/camera and current callbacks when returning from a showroom. Worldwide
navigation remains available within FE-058 limits; initial/reset geography remains
Ethiopia and must not move an existing exact storefront pin. Current nearby-group
compactness uses the shared three-kilometer neighborhood and viewport limits
(up to six large-screen/three phone cards, reduced for short/enlarged layouts), not
a global fixed three. Only a business without an eligible nearby peer uses an
individual icon. Exact/current zoom and offset bounds remain in FE-021/FE-058.

The centralized OSM basemap supplies visual context only; server catalog/location
authority remains separate. Request visible tiles with attribution and normal cache
behavior, never proxy/prefetch/scrape/bulk-download or service-worker-cache community
tiles. A failed basemap keeps markers/camera/controls usable with honest Retry;
obsolete canceled work is not a current error. Private tracking referrer privacy
remains distinct from the public map policy. Follow ADR-0016 and §22 for tests.

Country/City comes from the server-only canonical place catalog and bounded
suggestions, not a paid geocoding call or region filter. City/home-area display is
approximate and must not imply exact home GPS. Known coverage gaps and attribution
belong in [COUNTRY-CITY-CATALOG.md](docs/operations/COUNTRY-CITY-CATALOG.md).

SEO keeps real canonical links, accurate metadata and a bounded public directory/
sitemap for eligible non-demo businesses and goods. Demo/hidden/empty pages may be
shared where otherwise authorized but remain noindex; drafts/private/support/tracking
content never becomes search data. Robots is not access control. Cookie languages
do not justify invented locale URLs/hreflang or ranking/stock/review claims. FE-071
controls missing-handle responses and current directory eligibility.

Details: FE-021/FE-033/FE-058/FE-065/FE-071, BE-019/BE-023/BE-054 and ADR-0027.

## 11. Passwordless account entry and business onboarding

Normal sign-in uses managed Supabase email codes. An immutable provider UUID must
link to one application user; application roles, tenant bindings and suspension
remain authoritative. Do not collect or expose a password in normal signup/login.
The separately authorized store-review exception binds one ordinary marked demo
owner; it grants no staff or other-tenant access and exposes no credential in UI,
source, logs or builds. Google login remains disabled until explicitly qualified.

Account/business/handle setup requires canonical Country and City and private
account details, including the account phone. Validate selected IDs before writes;
an inconsistent city/country is not silently broadened. Private phone/email never
become public contacts implicitly. Exact storefront coordinates and approximate
home-area placement remain distinct. Handle changes retain uniqueness, cooldown,
historical aliases and actor/version audit under BE-043.

Verified signup or an individual invitation atomically creates a complete private
starter business; successful setup opens the populated preview. Starter products,
media and public examples are explicitly fictional until replaced. No public page,
custom-design request or fabricated project is created merely by signing up.
Account and public page management stay together under Account but open focused
tasks. Owners can edit only their linked business and their own private profile.

An owner sign-in email change uses the owner-only dual-mailbox proofs and provider/
application identity reconciliation in FE-073/BE-061/DEP-050. Staff/admin business
access cannot bypass either proof or change an owner's security factors. Preserve
stable UUID, historical identity snapshots, recoverable pending reconciliation and
fresh-session requirements. Provider readiness/actual activation remains a rollout
fact in DEP-050, not inferred from an editable field. Account erasure likewise uses
the verified current identity, finite ownership scope and BE-053's protected process.

Details: BE-030/BE-031/BE-038/BE-039/BE-043/BE-045/BE-047/BE-052/BE-053/BE-061.

## 12. Fulfillment boundary

Customers and businesses agree purchases/payment directly. Visitors and authenticated
business owners can ask the human transport team for help with origin/destination
and transport/shipping questions. Owner transport is bound to the current business;
it does not adopt a guest browser token or merge with private owner Support.

Shipment tracking is an **independent organizer of an arranged journey**, not live
carrier tracking. Authorized transport staff may create it for a valid requested
email before that recipient verifies access. No chat ID, assignment, active case
or prior recipient verification is required. One recipient may own several shipments
across different or absent conversations.

A shipment contains 1–12 ordered stable-ID legs with provider name, From/To and
one admitted transport method: air, truck, van, car or motorcycle. Each leg may
have a validated public HTTPS tracking URL and literal provider code. Opening/copying
those external details is explicit; never fetch, embed or scrape them server-side,
append a recipient code/credential, or infer a status from clicks or leg order.
BE-058 validates public-hostname HTTPS URL syntax without credentials, explicit ports,
IP literals or local/private-host syntax; it does not resolve DNS or certify the
external site's safety. Code/text/URL bounds remain canonical.
A provider code is not the recipient email-verification code.
Staff can edit/reorder with version guards; ordinary edits do not send new email.
There are no dates/ETA, scan events, bookings, current-custody or completion claims.

The recipient verifies their email themselves in the separate tracking portal and
sees only their shipments. A locator, account JWT or chat credential grants no access.
The former company-handoff form and conversation-bound plan workflow stay retired;
new provider details belong to independent shipments. BE-058/FE-069/DEP-048 own this
contract; external scan integration remains future work.

## 13. User roles and standard page workspaces

Current persisted role, tenant, queue scope and any explicit capability decide
access on every request/transaction, never a navigation hint or stale client role.

### Administrator

Administrators manage moderation, staff, business visibility, sponsors, Featured
schedules and authorized operational tasks. Business work is contextual: select a
business, read saved facts, then open its relevant page/product/details/location/
access task. Keep originating list filters and navigation on return. Admin privilege
is explicit; it is not an accidental tenant-query bypass or an owner's Auth session.

### Owner (client)

An owner manages only their business plus their own private Account settings.
Account exposes Your page, Products, Business details, Account settings, Support
and Transport through focused summaries/tasks rather than stacked edit forms.
Public contact/profile values and private account/notification values remain separate.
Show canonical visit/offering metrics without reviving business subscriptions, plans,
renewals, payment controls or incoming-inquiry counts. Visit attribution uses bounded
privacy-salted daily deduplication, not raw IPs/contact data; analytics access remains
scoped under BE-017/FE-018 and never follows queue membership alone.
Save/Cancel, preview and publication show truthful pending/error states and preserve
unsaved inputs according to the focused editor contract. Legacy inbox history is
private compatibility access, not a primary incoming-inquiries destination.

### Operations managers and team members

A separate administrator-controlled, versioned business-management grant authorizes
eligible staff to manage business content, products/categories/media, public contacts,
location/handle, preview/publication and established business settings. Eligible
existing/new staff receive persisted enabled grants under BE-060; missing, malformed
or revoked grants deny access. Admin can revoke/restore; recheck inside reads and
commit locks so stale editors cannot write after revocation. Owner assistance consent
and old per-business assignments are retained history, not current authority.

This grant never includes another user's private account, sign-in email, password,
security factors, provider settings, staff administration or ownership transfer.
Queue eligibility is independent: Support-only cannot edit shipments; Transport-only
cannot read listing reports. Staff/admin cannot sign into the native owner app.

Support and Transport keep separate scoped queues and private histories. Automatic
routing uses eligible receiving staff, lowest current open workload and longest
since saved assignment, without a numerical per-agent capacity cap. Pausing receiving
stops new routing, not existing access; unassignment returns work to automatic pickup.
Only the current assignee's explicit **Join chat** announces joining and permits
public reply. Claim, assignment, reading or an inspecting manager does not join.

Needs staff reply/Overdue/Waiting for customer describe response work separately
from assignment. The unanswered cycle is cleared only by a public staff reply;
join/read/note events do not reset it. Assignment-scoped overdue alerts/admin mail
use BE-018's fair deadlines and privacy rules, including no blame email for an
unassigned agent. Private notes/attachments never enter participant projections.
Only visible incoming-message acknowledgement establishes Read; fetching, opening
or inspecting another assignee's case does not. Retain original author side and
assignment epoch so later role changes cannot recast history.

Customer-idle warning/end clocks start after a public staff reply: guest transport
warns/ends at 25/30 minutes, owner Support/Transport at 23/24 hours. An unanswered
customer request does not start this clock. Automatic or participant End leaves
an unresolved case with factual reason/timestamps/read-at-ending evidence; only
an authorized staff resolution resolves it. History remains available with explicit
authorized Resume. Indexed bounded maintenance, not browser heartbeat/close or an
unbounded polling loop, owns these transitions. Details and exact lifecycle rules
remain in BE-018/BE-050, FE-019/FE-062 and DEP-043.

Optional attention/sound/Web Push/Expo Push follows the saved permission/preference
and current recipient authority. Provider handoff is not human Read or guaranteed
OS display. Generic localized payloads contain no transcript/contact/carrier details;
private feeds, subscriptions and leased deliveries recheck access and suppress stale
answered/ended work. Preserve quiet/mute behavior, bounded retries and honest failure
feedback; no new business-inbox alert or silent permission grant is implied.

### Public customer

Visitors need no business account to browse, prepare external inquiries or start
guest transport. Tracking verification creates a separate recipient session, not a
business account. Public reports accept canonical targets and bounded reasons;
listing exclusions, where offered, are browser/installation browsing preferences,
not confidentiality or identity authority. Staff report handling requires scoped
roles, version fences and actual removal/unpublication before “resolved”; dismissal
records a no-violation decision. BE-051/FE-063 retain those boundaries.

## 14. Retired custom-page workflow and compatibility

Custom-page request intake, clarification, design-library/SDK dashboard, revision
import/review/publish and recipe/blueprint management are retired product surfaces
under ADR-0019. Their former read/mutation routes fail safely; retained snapshots,
media and events remain authorized recovery/history, never a re-enabled workflow.
The owner editor's operational disable switch does not restore the retired builder.

The same applies to old simulated Delivery/Malikt routes and company/conversation
transport plans. Do not automatically import or delete historical data. An exact
owner-approved finite cleanup is distinct from a general retention rule.

When asked to design or review a client showroom/booth, still follow
[showroom-projects/WORKFLOW.md](showroom-projects/WORKFLOW.md), its brief and approved
assets. This asset/design workflow does not reactivate a retired runtime product.
Preserve each merchant's identity within the current shared showroom contract.

## 15. Current technical architecture

Use the pinned Node/Next.js web/API and Expo/React Native app with shared typed
contracts. Runtime/dependency versions come from the lockfiles, package metadata
and supported baseline, not duplicated prose here. PostgreSQL access and managed
Storage credentials stay server-only. Clients receive typed, visibility-filtered
projections; Edge/background workers must not import incompatible database or
request-context modules. Existing capability boundaries separate browser, native,
Node request handlers, scheduled workers and Edge entry points.

Follow pragmatic hexagonal boundaries: domain/application contracts do not depend
on Next.js, HTTP, cookies, drivers, filesystem or mail vendors. Routes, actions,
persistence, media and mail are adapters. Use narrow typed ports and cohesive
modules; do not create classes/containers/repositories without a concrete need.
Keep critical business mutations canonical, tenant-bound, versioned, idempotent
and transactional, including audit/publication/outbox work as applicable.

Managed Supabase Auth owns session validity; the application maps immutable UUIDs
to current roles/tenants. Web uses its authorized cookie/origin adapters; native
uses the separately validated bearer/session APIs and secure storage. Cursor,
version, destination and entity IDs from clients are hints to validate, not authority.
Native supports visitor/owner tasks only; staff stays on web. API origin, Auth/data
target, Firebase public client identity, package, signer and permissions require
actual artifact/configuration admission under DEP-044/DEP-049 and BE-044/BE-059.
Private signing and provider-management credentials never belong in clients,
public build outputs or ordinary application runtimes. Explicitly authorized
delivery credentials, such as the server-only FCM sender, stay within their
approved server adapter and secret boundary.

Media uses the existing asynchronous provider-neutral port and private buckets;
local fixtures/rollback adapters do not justify a broad provider swap. The minute
worker performs bounded routing/attention/idle/mail work with independent failures
and sanitized counters. Local preview startup uses the existing guarded loopback
services/supervisor; it never adopts a hosted target or changes provider settings.
Read current Next.js guides from the installed package before changing framework
conventions. Architecture and environment details: BE-027/BE-030/BE-035/BE-044,
DEP-022/DEP-026/DEP-027 and the linked ADRs.

## 16. Security requirements

Security, tenant isolation, privacy and data integrity are product requirements.
Read [SECURITY.md](SECURITY.md) for vulnerability handling. Preserve at least these
boundaries; detailed negative cases live in their controlling specs/tests.

### Authentication and sessions

Managed authentication alone grants no application privilege. Resolve the immutable
provider identity to current application role/tenant, and recheck suspension,
capabilities and session freshness. No hard-coded fallback secret, public seeded
credential or client/provider-metadata role is authority. Rate-limit code requests,
verification, callbacks and onboarding without raw identity values in keys/logs.

Private account phone is not a sign-in factor and never belongs in session/public
catalog DTOs. Changing it affects only the authenticated account. Email/security
changes follow owner-only provider proofs; staff business access cannot bypass them.
Connected sign-out revokes relevant subscriptions; offline native logout clears
local access immediately but cannot promise synchronous server/push revocation.

### Tenant isolation

Every private read/write resolves current role and exact business or queue authority.
Validate referenced category, product, inquiry, media, support and shipment ownership.
Keep constraints/locks as defense in depth and test foreign/stale/revoked operations.
Legacy private histories preserve their original authorization. Public/draft/suspended
visibility is checked before content, metadata, cache/304 or user-visible success.

### Public inquiries

External drafts are convenience text, not a database/order authorization source.
Revalidate public products/options/status and bounded item/quantity/body limits;
never trust names or snapshots from local storage. Retired first-party creation APIs
remain 410 without creating records/alerts. Retained authenticated inquiry commands
still require matching business, current permission and audit with the successful change.

### Retired logistics routes

Former Delivery/Malikt APIs/pages remain not-found; old rows grant no current access.
A future provider/dispatch integration needs an accepted feature/architecture contract,
not a dormant adapter or an arbitrary external link.

### Media uploads

Verify actual JPEG/PNG/WebP signatures and decoded content, enforce byte/pixel bounds,
re-encode/sanitize through Sharp, strip metadata and use server-controlled filenames.
Extensions and browser accept attributes do not establish safety. Keep mutable uploads
outside build-time public source; preserve stable opaque media routes and fresh
public/private authorization, safe content types and `nosniff`. Bound remote reads
and deadlines; object migration remains hash-verified/copy-only unless separately
reviewed. Neither public image optimization nor UI bypass proves CDN-wide revocation
of bytes that were previously public.

### Public status

Only currently active public pages/products enter their public projections. Drafts
require authenticated preview; suspended businesses cannot render as ordinary public
showrooms. Direct hidden/empty active share links and indexability remain separate
from private access. Validate report targets and store reports privately; browsing
exclusion does not make an otherwise public business confidential.

### Privacy and operations

Public contacts are explicitly published business values, never private account,
onboarding or notification fallbacks. An explicitly empty published contact object
stays empty. Derive demo contact approval per method on the server; no copied client
flag, random phone or private alias may authorize an external launch.

Tracking uses distinct six-digit/ten-minute/one-use email challenges, five atomic
attempts, bounded resend/rate limits and separate seven-day opaque recipient sessions.
Staff never handle the recipient's code. Account/chat credentials cannot substitute;
fresh recipient/shipment authority precedes every detail/list/304, including revocation.
Keep codes, token proofs, message bodies and private contacts out of URLs/logs/builds.

Trusted Server Action/mutation origins come from the existing exact-origin policy,
not wildcards, forwarded-host claims or lookalikes. Local dev-resource hostnames do
not authorize additional mutation origins. Preserve HTTPS/security headers and
safe serialized merchant text. Dependency/security checks do not justify exposing
credentials or removing the current privacy/terms/deletion paths.

Prohibited imagery, adult/age-restricted goods including alcohol/tobacco/vaping,
weapons/recreational drugs/gambling and abuse are handled under the catalog policy
and scoped reports/moderation. Ordinary tools are not automatically weapons.
No keyword rule or prior publication proves universal screening of seller media.

## 17. Data, migrations, and deployment boundary

PostgreSQL and managed-provider records are durable authority. Use additive,
versioned migrations with ordered ledger checks and transaction/tenant/history
invariants. Keep linked Supabase database commands sequential. Demo-only data is
not permission for unbounded deletion, cross-tenant writes or credential changes.
Back up the exact target, qualify recovery and preserve protected before/after
fingerprints for approved migration/data operations. SQL recovery does not by itself
restore managed Auth, Storage or provider credentials.

Hosted Auth changes use DEP-029's exact plan/apply, recoverable backup, target and
current approval checks. Never use `supabase config push` or broad/raw fallback when
a guard refuses. Credential/provider/signing changes need their own existing explicit
authorization and recoverable source; do not copy local secrets into Production.
Unexpected/ambiguous hosted outcomes stop subsequent writes until the existing
incident/recovery contract is satisfied. No automatic restore, retry or guessed
credential replacement follows a timeout. Repository guards do not sandbox an
administrator shell or provider permissions.

Web and native release inputs, archives, runtime targets and artifact identity must
match their admitted evidence. DEP-044/DEP-049 control build-tool exceptions,
signing, privacy, binary inspection, physical/device and Play stages. Web audit or
Expo-preview success does not admit a new native artifact. Source-tested, published,
provider-accepted, recipient-delivered and actually enrolled are distinct outcomes.

Transactional mail uses durable saved purpose/locale/snapshot, bounded leases/retries
and fresh eligibility. Local previews stay in Mailpit. Hosted Gmail SMTP or Resend
is explicitly selected; invalid Gmail configuration defers rather than silently
falling back. No email HTTP/SMTP operation belongs inside a SQL transaction.
Provider acceptance is not inbox delivery; an ambiguous SMTP timeout may duplicate
on retry, so do not claim exactly-once delivery. Preserve old queued envelopes and
compatibility identifiers during branding changes. Read DEP-043/DEP-048/DEP-049 and
ADR-0031 for provider activation and mail-boundary evidence.

## 18. Language and localization rules

English, Amharic and Afaan Oromo are active. Somali/Tigrinya catalogs and stored
identifiers remain for compatibility but are not selectable; inactive choices
fall back safely to English. Afar/Arabic/RTL are not implemented public options.
Do not delete retained catalogs or translate existing merchant/customer data.

Author the meaning naturally for local visitors instead of following English
sentence order. Explain product choices and the digital-showroom benefit simply;
translate interface labels, statuses, errors, accessible names and system message
framing. Preserve merchant names/descriptions, product brands/specifications,
option values, quantities, place/provider names, tracking codes and message bodies.
Country labels may use locale data with an honest fallback where unavailable.

Use the authoritative interface TSV and generated catalogs, selected-language
loading and server/client catalog boundary. Preserve URL, form, inquiry and
navigation state during a language change, and do not lose a pre-hydration choice.
Allow long Oromo text and appropriate script typography; the Latin MirtPage artwork
is constant. Automated completeness/layout coverage is not independent native-speaker
endorsement, translated user data or cross-language search. FE-049/FE-070 govern
copy; rollout evidence remains separate.

## 19. UX and accessibility requirements

Use responsive standard workspaces and focused tasks on desktop, phone web and
the native app. Keep selected/current navigation unambiguous, actions discoverable,
readable text wrapping and keyboard/large-text access. Controls keep their specified
minimum hit areas; public inquiry actions are at least 44px, and larger native tile/
handle targets retain their own contracts. Panels/dialogs fit the viewport, use one
usable scroll region, safe areas, focus containment/restoration and an accessible
close/back route. Avoid document overflow, clipped buttons and unnecessary vertical
chrome that steals map/chat space. Respect reduced motion.

Keep useful same-resource content visible during refresh, focus return and safe
filter transitions with quiet local status. Initial/new-resource loading uses
layout-matched, inert skeletons inside the content region; known navigation and
headings remain usable. A new account/tenant/resource/environment/permission clears
or requalifies retained content immediately. Displayed old results cannot claim to
satisfy a newly requested filter or authorize stale actions. Stop busy state on
success/error/cancel/supersession; keep honest error/retry/empty/404 states. Save,
Send and upload feedback belongs to that action; no fake percentages or mandatory
delays. Announce one localized status and hide decorative silhouettes. FE-074 owns
this replacement for blanket page-loading bars.

Staff chat puts transcript/reply first with adjacent desktop management and an
explicit phone Details/Back view that retains the reply draft. Separate reply
priority from assignment/join/end/resolution state. Read receipts require actual
visible/focused incoming content, not a fetch or a synthetic successful response.
Public transport help is reachable in its supported shell; Account owners reach
Support and Transport through their own workspace, without duplicate launchers or
conflicting floating cart actions. Tracking has one purposeful entry, not duplicated
conversation-bound plan controls.

Product/Featured rows use actual available container width, resilient wrap and
full-width fallback for narrow/enlarged text, not stale measured percentages.
Descriptions/city/category/supply are visible as space permits; details remain
navigable. Category names and optional showroom grouping are readable selections,
not icons alone. Hidden-panel controls are inert and selection/scroll return is
preserved. Sponsor rotation, media and map interaction retain pause/accessibility
safeguards. FE-035/FE-053/FE-056/FE-065 and relevant task specs provide the details.

## 20. Product-data accuracy

Do not invent product features, availability, models, prices, capacity or merchant
history. Preserve merchant-entered data; verify current recognizable product facts
against official manufacturer sources when authoring new factual examples. Demo
illustration, external sample video and honest no-photo states are not documentary
claims. Optional ETB price/unit/highlights provide inquiry context, never platform
checkout, verified stock or a guaranteed quote. Do not silently turn a real service
business into goods or apply demo corrections to unmarked tenants.

## 21. Standard page operating workflow

1. The owner completes verified account/business setup or an individual invitation,
   receiving a private sample workspace and preview, not automatic public discovery.
2. They replace sample content, save valid identity/location/public contacts and
   add at least one eligible physical product. Optional categories organize a range;
   they are not required to create a showroom.
3. They edit one page/product/details task at a time, preview and use the current
   server readiness result. Missing requirements link to their actual task.
4. First Publish needs no staff approval. It atomically validates current content
   and an eligible listed product, activates the draft business and applies the
   pending canonical location/category with publication history. Location Save
   applies a known public area or explicit storefront directly; public discovery
   still requires active, non-excluded status and listed goods. Location edits
   retain their first-change/30-day cooldown and audited administrator exception;
   admin corrections advance the version fence so stale forms cannot revert pins.
5. Later live Save, private
   draft Save and explicit restore remain truthful, versioned commands; do not
   bypass readiness or suspension with an editor shortcut.
6. Authorized staff follow the same canonical business command boundaries under
   their current administrator grant. They never acquire private account authority.
7. Visitors browse, select and use external localized inquiry handoffs. Support,
   transport requests and independent recipient tracking retain their own access
   and history, not a reinstated business inbox.

Details: FE-040/FE-048/FE-056/FE-072 and BE-032/BE-033/BE-039/BE-041/BE-060.

## 22. Testing and definition of done

Use the task/spec/gate process in AGENTS.md, not release anecdotes in this file.
Test changed positive/negative criteria, tenant/role/privacy/race boundaries and
actual canonical outcomes; never weaken a check to get green. Follow
[the browser review guide](docs/operations/BROWSER-WORKFLOW-REVIEW.md) for affected
UI on actual Chrome desktop/phone and Expo. Install synthetic map tiles before
automated map navigation; public community tiles are not automated test traffic.
Do not fabricate successful application responses or claim screenshots/mocked
ports as end-to-end or provider evidence.

Focused UI evidence and existing visual approval precede expensive gates except
the contract's security/data-integrity/nonvisual emergency cases. Run applicable
source-bound full check, release, acceptance and required CI; preserve first failures
and classify product/data/infrastructure before a bounded retry. Reuse evidence
only while its actual relevant inputs are unchanged. Finite static scans, synthetic
provider fixtures, Expo browser tests and OS focus emulation retain their limits.
Real Android keyboard/accessibility/push and Play delivery/enrollment need actual
independent evidence and current device availability/authorization.

Status updates distinguish implemented, tested, visually approved, committed,
pushed and deployed. Store sanitized outcome summaries in specs/traceability;
protected logs/data/screenshots belong only in authorized ignored task evidence.
Exact current release limits and remaining steps belong in DEP-049/checklist.

## 23. Packaging rules

Build source-review archives from an explicit manifest containing needed source,
lockfiles, migrations/setup, `.env.example`, public documentation and required static
assets. Exclude `.env`, credential files, customer/runtime uploads, databases,
backups, private keys and sensitive logs. Source archives exclude dependency/build
caches by default. Deployment bundles retain only their explicitly admitted runtime
files/dependencies; do not strip a needed dependency just because a source ZIP
normally excludes `node_modules`. Test archive integrity and privacy before use.
No archive, successful compilation or unverified old artifact grants deployment.

## 24. How to approach future work

Start with AGENTS.md, this brief, the active checklist and only the relevant spec/
code. Record material decisions before production changes and preserve every
compatible open request; only an explicit correction/cancellation supersedes it.
Use scoped agents when authorized, with clear file ownership and evidence handoffs.
Keep the source frozen during shared browser/gate work and do not edit another
stream's files. Use existing commands/ports before adding dependencies or frameworks.

For a requested overall setup review, use
[ENGINEERING-READINESS.md](docs/operations/ENGINEERING-READINESS.md) and DEP-002.
Measure actual friction, prioritize coherent improvements and defer nonblockers;
do not turn every small edit into an audit or promise an unattended daily agent.
Project skills route browser, release and engineering work without replacing the
contract or adding provider authority. For a product change, read the nearby
specs through [the traceability map](specs/TRACEABILITY.md) rather than every spec.

### 24.1 Keep this product contract synchronized

Describe verified product reality and label planned behavior explicitly. When a
change alters a section, reconcile it after mapped evidence; keep detailed contracts
and tests in their controlling specs and exact release state in the active checklist.
Do not append raw test runs, operation hashes, old plans or chat transcripts here.
Preserve history in Git and existing release records, not a new archive copied from
this brief. Report meaningful limitations rather than stale “local candidate” prose
or an unsupported global rollout claim. This documentation consolidation changes no
product capability, authorization, data retention or approval rule.

## 25. Product north star

A business can present its identity and products without learning a site builder,
keep drafts private, and publish safely. Administrator-authorized staff can help
manage its showroom without taking over its account. Customers discover clear
choices, prepare a specific message and continue the conversation through the
business's channels. Human transport help and private shipment information remain
clear, useful and separate. Protect that experience.
