---
id: FE-052
title: Clear launch journeys and natural interface language
status: in_progress
related: [BE-001, BE-032, FE-049, FE-030, FE-033, FE-046, DEP-030, FE-036, FE-053, DEP-044]
owners: [product, frontend, backend]
last_updated: 2026-10-12
change_level: L3
---

# FE-052 — Clear launch journeys and natural interface language

## Problem and scope

Launch traffic needs an obvious search, honest examples and Featured messaging,
and owners must act on their own inquiries. Contextual interface writing across
English, Amharic, Afaan Oromo, Somali and Tigrinya replaces literal translations.
Transport remains manual staff coordination outside Suqpage, with no new roles.
Newest owner instruction: do not mention pricing.
No invented deadline, permanent free plan, paid booking or provider integration.

## Scenarios

1. GIVEN a map-only visit WHEN the guest selects the Search & results opener
   THEN the existing panel slides out with search, filters and results together.
   The opener has a search icon, visible filter label and right arrow; it never
   accepts or submits a query itself. Collapsing preserves the query/results and
   returns focus to the opener. The map and all-category default remain.
2. GIVEN an owner WHEN updating an inquiry belonging to their own business THEN
   the status is saved and audited; another tenant or team member is denied.
   Phone inquiries offer Call and SMS; external handoffs never claim delivery.
   Display translations never become machine status values.
3. GIVEN a seeded example WHEN it appears in search or Featured THEN a concise
   Demo label distinguishes it from a real offer. On its showroom, omit the
   "Demo business — products and contact details are examples." notice when the
   visible handle contains `demo` (case-insensitive); retain it for explicitly
   marked demos whose handles do not. Inquiry views omit demo-explanation text,
   including "Demo inquiry — contact details are examples."
   This display rule never assigns/removes is_demo or changes permissions, sample
   publication checks, contacts or inquiry behavior. Real businesses are never
   labeled as demos from their names or handles alone. Apply on web and native.
4. GIVEN first publication WHEN known starter contact values, unreviewed example
   location, starter About or sample offerings remain THEN publication is denied
   with useful field-specific guidance. The owner sees a short review checklist;
   subsequent live Save and staff consent boundaries remain unchanged.
   The city explicitly selected during BE-047 signup already satisfies location
   confirmation. A legacy/default location without confirmed profile/proposal
   evidence still fails that check; tests cover both cases independently.
5. GIVEN Featured without a configured broadcast WHEN rendered THEN the business
   gallery is primary; schedule details remain available but do not imply a live
   show. Demo live flags do not imply an actual live stream. Preview buttons
   activate only when their client handlers are ready; schedule session labels
   use the selected language.
6. GIVEN a guest/owner in any supported language WHEN using the key discovery,
   inquiry, setup, publishing, support or admin actions THEN wording matches the
   task and locale rather than English sentence structure. User content, URLs,
   codes, prices and role/status identifiers remain unchanged.
7. GIVEN signup/About WHEN reading the offer THEN the value is clear without
   pricing claims, launch offers or invented durations. The narrative explicitly
   covers makers/manufacturers without a physical shop or showroom, physical
   shops seeking online discovery, and people selling from home. Showroom and
   shopfront describe displaying offerings and receiving inquiries, not platform
   checkout or a required public home address. Services and growers stay included. Use concise, professional customer-facing
   copy rather than conversational questions or restating internal discussion.
8. GIVEN the Market introduction WHEN browsing THEN explain the visitor value
   of seeing a business's offerings and media together, with direct inquiries.
   About explains one organized showroom for the business story, products,
   services, photos, videos and contact details; owners share one link alongside
   their social channels, and receive inquiries on Suqpage or social channels.
   Use professional copy rather than repeating internal discussion or criticizing
   social platforms. Keep the introduction visible and compact on phones. FE-030
   S40 moves result-type selection into filters above one result list.
9. GIVEN an open search drawer WHEN a map marker or business result opens a
   preview THEN a modal above the drawer and map exposes the hero, details,
   close control and Open page action. Nearby groups use the same layer, with
   list/detail/back navigation. Closing by Escape, close or backdrop preserves
   filters, query, page and drawer state; focus returns to the initiating control
   or a visible drawer control if a map marker was redrawn. Keyboard focus stays
   inside the modal. Phone, landscape, long localized content and resizing keep
   content scrollable and actions reachable without horizontal overflow.
   In short landscape viewports the drawer itself scrolls so its fixed controls
   cannot collapse the result area and prevent opening a business preview.

## Quality impact and readiness

Definition of Ready met. Existing tenant-scoped ports and bounded database reads
are reused. Public UI never gets private contact data. No managed translation or
search vendor is added. Natural-language review is agent-authored, not claimed
as native-speaker approval. Existing S31/S32 edits belong to authorized ongoing
work; preserve them and unrelated deno.lock. Master sections 2, 4, 18/19 and
current release statements must distinguish local changes from deployment.

## Test plan

Focused inquiry authorization/persistence, first-publication checks including
negative and legacy cases, localization coverage/interpolation, demo projection,
search submit/collapse and desktop/320/390 captures across supported languages.
Map to scripts/test-launch-clarity.ts and focused existing workflow scripts.
`scripts/capture-demo-notice.mjs` covers handle-based notice suppression,
marked-demo retention and ordinary-business absence on web/Expo, with phone/
desktop captures. No database mutation is needed for this presentation change.
Map preview overlap: `scripts/capture-map-preview.mjs` exercises the local app
and real Leaflet markers; `scripts/capture-nearby-preview.mjs` exercises the real
nearby viewer/modal with six component-fixture businesses and stubbed navigation,
images, localization and map adapters (no database writes). The latter is needed
because current local demos use approximate locations and have no nearby groups.

## Rollout and rollback

Additive migration 52 records explicit seeded demo identities using retained handles;
new businesses default to real, and no prefix/name heuristic assigns the flag.
Empty-target demo setup marks only its own inserted businesses. Preserve the flag
across handle edits. PostgreSQL preflight requires 52; backup and restore gates
precede production mutation.

Local implementation and focused visual review precede full check/release and
acceptance gates. Retain prior data and existing S32 migration. No deployment
or pricing charge occurs in this task. Rollback removes UI refinements but must
preserve recorded requests/inquiries and tenant authorization.

## Evidence: focused checks and verified rollout

Implementation and focused checks are recorded in
`docs/SUQPAGE-LAUNCH-CLARITY-REVIEW.md`. Relevant scripts:
`test-launch-clarity.ts`, `test-workflow-wiring-audit.ts`,
`test-self-service-publication.ts`, `test-localization.ts`,
`test-platform-narrative.mjs` and `capture-launch-clarity.mjs`.
Desktop/390/320 public, owner inquiry and first-publication checks cover all five
locales. S32 transport persistence/browser checks are retained. Native schema 52
installation and preservation pass. The owner approved the visuals and deployment.
Full check/release/acceptance/operations coverage and live checks pass; production
schema 58 preserves existing rows. Publication evidence and operating limits are
recorded in `docs/SUQPAGE-RELEASE-2026-09-27.md`.

## S51 — professional storefronts alongside social media (ready, L1)

GIVEN Market, About or account entry on web/native WHEN read in any of the five
locales THEN Suqpage connects social-media promotion/selling to an organized,
professional business storefront: offerings/media/story, direct inquiries and map
location. Market keeps a short visitor-facing introduction; About explains the
owner benefit and sharing the page from social profiles. Shops, makers, services
and home businesses remain welcome; social accounts and a public home address
are not prerequisites. Location may be an area or exact shop location.
Do not imply verification, checkout, guaranteed sales or mandatory physical shops.
No platform pricing copy. Task labels remain concise and merchant content verbatim.

Each language is written for the UI context using ordinary local phrasing, with
English retained for brand/established technical terms when useful. No external
translation service; agent-authored copy is not native-speaker approval.

Affected master sections: 3–5, 15, 18–19, 22. Existing FE-049 catalog mechanism and
FE-053 native surface reuse, no API/data changes. Test narrative coverage across
both clients, localization completeness, five-locale phone/desktop screenshots
and compact homepage layout. UI-only rollback; visual approval before full gates.

### S51 owner correction — audience-specific storytelling

The owner rejected the first S51 narrative. Market now leads from the shopper's
friction: finding the item/variant/details behind social posts without searching
through old videos, then finding the business on the map and making a precise
inquiry. Do not promise automatic social imports, image/video recognition,
up-to-date stock guarantees or checkout. Availability stays a seller question.

About must separate **For customers** and **For businesses** into distinct visual
sections, each with its own heading, benefits and action. Customer copy leads to
browsing; owner copy leads to creating a business page, organizing offers/media,
sharing the link and map location, and receiving item-specific inquiries. The
previous About template/category wall may be replaced. Maintain guest-safe
navigation, all five contextual locales, accessible headings and mobile layout.
Verify both audiences/actions, no horizontal overflow, locale coverage and actual
web/native-browser screenshots before renewed visual approval.

The owner's further correction makes item discovery primary: find the offering
seen in social content, understand names/styles/options, then inquire about that
item. The main narrative addresses customers who already know or follow a seller and
want that seller’s organized storefront. Existing map/search discovery features
and their prominence remain unchanged; this is not a feature-priority change. Do not position this as seller
lookup, require checkout, or make claims about TikTok Shop regional availability.

S51 local evidence: web/mobile typechecks, narrative/homepage, eight localization
checks (1,228 messages), sponsor rotation browser fixtures and 69 final viewport/
language captures pass. Evidence in specs/TRACEABILITY.md and checklist S51.
Native-device checks, owner visual approval, full release gates, commit and
rollout remain pending. Earlier copy drafts are superseded.

## S63 — local discovery and uncluttered social-business stores (ready, L1)

GIVEN Market on desktop web, mobile web or the native app WHEN read in any
supported language THEN the compact introduction explicitly names the businesses
customers follow on social media, shows the value of finding their location and
browsing products/services in professional, organized stores, and explains direct
contact to order without getting lost in post clutter. Nearby discovery remains
included. Search/map behavior and placement are unchanged; no automatic social
matching, computed distance, confirmed stock or in-app checkout is implied.

GIVEN About or account entry WHEN a visitor reads it THEN customer copy explains
browsing and direct inquiries, while a separate owner section explains organizing
offerings, sharing a store link and appearing on the map. Keep useful existing
workflow labels, non-social businesses, home sellers and services included. Do not
add pricing, verification, stock guarantees or claims of automatic social imports.
Merchant content is never rewritten or translated.

English, Amharic, Afaan Oromo, Somali and Tigrinya use contextual local phrasing,
not English word order or forced literal equivalents. Retain familiar brand names.
This is agent-authored language, not a claim of human native-speaker approval.
Reuse shared copy and FE-049 catalogs on both clients. No API/database changes.
Affected master sections: 3, 18, 22 and storefront-positioning narrative.

Readiness: audiences, copy boundary and all five locales are explicit. Verify
narrative/localization coverage, typechecks and actual 1440/390/320 web plus mobile
browser views before owner visual review. Use focused `capture-storefront-copy.mjs`
evidence; do not run full release gates or replace the submitted S62 APK until
this visual change is approved. Rollback restores copy/catalogs only.

S63 local evidence: both client typechecks, narrative/localization checks and 69
copy-only browser states pass across all five languages. Details in TRACEABILITY
and checklist S63. This is local implementation and browser review; owner visual
approval and web/native rollout remain pending. No native-speaker signoff claimed.

## S99.8 — prior candidate (superseded by S99.10)

The newest owner direction supersedes S63's location-led introduction. GIVEN
Market, About or account entry on web, mobile web or Expo WHEN the platform copy
is read THEN it leads with organized offerings: customers browse a business's
collection, understand models/colors/styles or service types, and ask about the
right item instead of searching through social posts. The English lead is
superseded by S99.9 below. Each other locale expresses the benefit naturally
rather than reproducing an English idiom or sentence order.

GIVEN About WHEN read THEN separate customer and business sections explain
browsing the collection and creating/sharing an organized storefront respectively.
Keep photos/videos, direct inquiries, the inquiry list and map discovery visible.
Map behavior/prominence, merchant content, account rules, transport and all data
contracts remain unchanged. No automatic social import, structured variant picker,
confirmed-stock guarantee, social-account requirement or checkout is promised.

GIVEN the local Expo preview WHEN shared storefront copy changes THEN Metro
invalidates the imported module without requiring an unrelated app edit. Watch
the shared lib directory only, excluding runtime-data/credential directories.
This development correction changes no runtime API or package dependency.

GIVEN Play or social launch material WHEN prepared THEN the same collection-led
benefit appears in concise captions and authentic media under DEP-044. Store
locales remain English/Amharic; app and organic campaign copy cover all five.
No claim about another platform's regional availability is included.

Readiness: audiences, scope, existing shared copy/catalog ports and release
boundaries are known. Affected master sections: 1, 3, 18, 19 and 22; section 15
must retain the distinction between this local candidate and released binaries.
Verify narrative/localization/content boundaries, both typechecks and real local
web/Expo-browser 1440/390/320 views. Actual device proof remains separate. UI-only
rollback restores copy/catalogs; no database or provider change is needed.

Focused evidence, October 11: scripts/test-platform-narrative.mjs,
scripts/test-launch-materials.mjs, homepage/localization checks, both client
typechecks and scripts/test-mobile-contracts.ts pass. The latter verifies shared
copy watch coverage while excluding private runtime directories. The actual
capture-storefront-copy.mjs run passes 69 local web/Expo-browser states; receipt
and screenshots are retained in .local/play-s99/narrative/screens/. Map tiles are
stubbed to avoid automated tile traffic; catalogs and action routes are real local
reads. This is not installed-phone or independent native-speaker evidence.
App visual acceptance, full repository/release gates, scoped commit and new web/
Android delivery remain pending. Store/campaign outcomes are tracked in DEP-044.

## S99.9 — prior candidate (superseded by S99.10)

The owner-accepted S99.10 wording below supersedes this candidate.

The owner rejects the S99.8 lead because collections and posts alone do not
identify businesses selling on social media. Research informs the correction:
homepage purpose must be immediately apparent; concise means enough familiar
words to communicate the task, not the fewest possible words. Sources:
[NN/g homepage guidance](https://www.nngroup.com/articles/homepage-design-principles/),
[Apple writing guidance](https://developer.apple.com/design/human-interface-guidelines/writing)
and [Intuit product content](https://contentdesign.intuit.com/product-and-ui/product-content-design/).

GIVEN a first-time Market visitor on web or mobile WHEN reading only the heading
THEN they can identify products from businesses selling on social media.
The English candidate is "Browse products from businesses on social media."
GIVEN its supporting copy WHEN read THEN organized online stores, product/service
details and direct contact explain the benefit of avoiding scattered old posts.
The heading must not depend on a metaphor, pronoun without an antecedent or the
word collection to establish the business context.

GIVEN About WHEN read THEN customer and owner headings identify browsing a
business's offerings and providing an organized store for its social customers.
GIVEN another locale WHEN selected THEN ordinary local words establish the same
business/product context without translating English slogans literally. Merchant
text, map prominence, filters, actions, accounts and all API/data contracts stay
unchanged. No checkout, automatic social import or stock guarantee is introduced.

Readiness: this is owner feedback on the active, uncommitted candidate; audiences,
scope and existing shared copy/catalog ports are known. Update local app copy and
review it before replacing already saved Play/social assets. Earlier artifacts and
their verification remain historical evidence, not approval of this correction.
Map to narrative/localization tests, both client typechecks and focused real
web/Expo-browser viewport captures. Master sections 3/18/19/22 describe the new
candidate; section 15 preserves the previous saved materials/released binary.
Explicit visual acceptance, full gates and scoped commit precede app rollout.

October 11 focused evidence: narrative/launch-material and homepage tests pass,
ten localization tests pass with 1,406 synchronized messages, and both web/native
typechecks pass. capture-storefront-copy.mjs --copy-only passes 69 real local
web/Expo-browser language/viewport states. English and Amharic phone captures are
visually inspected; map/filter controls remain visible. Protected evidence:
.local/play-s99/copy-clarity-s999/screens/copy-verification-all.json. Tiles are
stubbed to avoid automated provider traffic; this is neither physical-device
proof nor a first-time-user comprehension study. Visual acceptance, full gates,
commit/deployment and subsequent store/social alignment are still pending.

## S99.10 — accepted proximity and organized-store narrative (implemented and visually accepted, L1)

The owner accepts the full message: "See how close the businesses selling products
you’ve loved on social media are to you. Browse their products, styles and services
in organized online stores, then contact them directly without digging through old
posts." GIVEN Market on either client WHEN read THEN the first sentence is the
heading and the remainder is the supporting paragraph. Together they retain
business/social-product context, location discovery, organized stores and direct
contact without old-post searching. Do not introduce exact distance estimates,
automatic account matching, social imports, checkout or availability guarantees.

GIVEN About WHEN read THEN customer copy reflects finding/browsing those businesses;
owner copy describes an organized store their followers can browse, map location
and direct inquiries. Adapt related account entry and map copy where necessary,
not operational/legal instructions or merchant content. GIVEN another locale
WHEN selected THEN native wording preserves the accepted meaning rather than
English syntax. Merchant identity, data, map/filter prominence and actions remain.

GIVEN store/campaign material WHEN refreshed THEN concise audience-specific text
and authentic screens communicate the same meaning under DEP-044. Preserve older
assets/readbacks and verify each new artifact instead of claiming old receipts
prove the new output. Readiness is met; no material product/provider choice is
unresolved. Master sections 1/3/15/18/19/22 are affected. Existing narrative/catalog/
type/viewport contracts prove affected acceptance criteria; phone screenshots
must show the long heading does not obscure map/search controls. Explicit visual
layout approval precedes full release gates; accepted prose does not establish
installed-device, Google review or distribution evidence.

October 12: the owner explicitly approves the actual web/Amharic-mobile layouts
and full release checks after the prose acceptance. Shared Market/About/map and
account entry, contextual catalogs and local store/campaign text are implemented.
Focused narrative/localization (1,414 messages)/both typechecks and 69 actual local
browser states pass. Phone headings and five-language poster sheets are inspected.
New artifact directories preserve previous versions; image contracts, seven full
video decodes and a 54-file ZIP CRC pass. Evidence: .local/play-s99/narrative-s9910/,
store-presentation/proximity-v1/ and launch-kit-proximity-v1/. Full gates are now
authorized and pass as recorded below; no binary or deployment is inferred from approval.

S99.10 verified source/store evidence, October 12: owner visual approval precedes
the complete passing check, clean isolated release:web, 11/11 production-mode
local acceptance workflows, operations, mobile build contracts and Android Hermes
export. Actual packaged Linux handler/Sharp and scheduled worker pass; the worker
uses an empty isolated PostgreSQL fixture and sends no provider requests. The
web audit is clean. Native audit remains failed (20 high, two tooling roots, zero
critical); both roots are absent from all 1,651 compiled runtime modules. The
previous one-AAB waiver is consumed; another build needs exact renewed admission.

Fresh independent normal Console reload verifies exact English/Amharic listing
drafts, ordered assets and seven unchanged phone-image references plus shared
icon. Only six graphics change; all six transformed Google CDN images visually
match source. Thirteen composite AI labels persist, the original icon remains
unlabelled, and Publishing overview still has a disabled Send app for review.
No Google review, closed activation, opt-in, physical-device or campaign publication
is inferred. Source/receipt evidence: .local/play-s99/narrative-s9910/source-gates.json,
console-setup/s9910-final-two-locale-console-read.json and
store-presentation/proximity-v1/provider-readback/verification.json.
