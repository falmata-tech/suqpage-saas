---
id: FE-052
title: Clear launch journeys and natural interface language
status: in_progress
related: [BE-001, BE-032, FE-049, FE-030, FE-033, FE-046, DEP-030]
owners: [product, frontend, backend]
last_updated: 2026-09-24
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
3. GIVEN a seeded example WHEN it appears in search, Featured or its public page
   THEN a concise Demo label distinguishes it from a real offer; inquiry/contact
   areas explain that details are examples without deleting demonstration flows.
   Unknown real businesses are not labeled from their name alone.
4. GIVEN first publication WHEN known starter contact values, unreviewed example
   location, starter About or sample offerings remain THEN publication is denied
   with useful field-specific guidance. The owner sees a short review checklist;
   subsequent live Save and staff consent boundaries remain unchanged.
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

## Local evidence — 2026-09-24

Implementation and focused checks are recorded in
`docs/SUQPAGE-LAUNCH-CLARITY-REVIEW.md`. Relevant scripts:
`test-launch-clarity.ts`, `test-workflow-wiring-audit.ts`,
`test-self-service-publication.ts`, `test-localization.ts`,
`test-platform-narrative.mjs` and `capture-launch-clarity.mjs`.
Desktop/390/320 public, owner inquiry and first-publication checks cover all five
locales. S32 transport persistence/browser checks are retained. Native schema 52
installation and preservation pass. Visual approval and full/release/acceptance
gates remain pending; status is deliberately in_progress.
