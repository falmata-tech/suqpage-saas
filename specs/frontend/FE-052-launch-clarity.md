---
id: FE-052
title: Clear launch journeys and natural interface language
status: in_progress
related: [BE-001, BE-032, FE-049, FE-030, FE-033, FE-046, DEP-030, FE-036, FE-053]
owners: [product, frontend, backend]
last_updated: 2026-10-07
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
