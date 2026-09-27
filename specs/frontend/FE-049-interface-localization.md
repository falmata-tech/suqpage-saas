---
id: FE-049
title: Five-language interface
status: done
related: [FE-052, FE-051, FE_BASE, BE_BASE, DEP_BASE, ADR-0022, FE-041]
owners: [product, frontend]
last_updated: 2026-09-23
change_level: L2
---

# FE-049 — Five-language interface

## Problem and scope

Visitors and owners need plain, readable interface text in English, Amharic,
Afaan Oromo, Somali and Tigrinya. Cover public discovery, Featured, About, legal,
login/signup, business/product/inquiry controls and owner/staff/admin workspaces.
User-written content, identities, place names, contact destinations, prices,
machine values and search terms are preserved. No machine translation service,
semantic search change, database migration or provider configuration change.

English is the default. A shared language selector uses each language's own name,
remembers a validated preference for one year in a same-site cookie and retains
the URL, filters, inquiry list and mounted form state. Invalid preferences fall
back to English. All five languages are left-to-right. Language is a display
preference, never an authorization or catalog filter. Keep English terms when
translation is unclear; do not invent vocabulary. Draft translations must not
be described as native-speaker reviewed.

## Scenarios

1. GIVEN no preference or an invalid cookie WHEN a page renders THEN the document
   language and interface are English; only allowlisted locales can load a catalog.
2. GIVEN any supported language WHEN it is chosen THEN the page and accessible
   labels use that language, the preference survives navigation/reload, and the
   same URL, typed form fields, filters and inquiry selections remain.
3. GIVEN merchant content matching an English interface word WHEN language changes
   THEN that content and all saved/input values stay verbatim. Public/private
   visibility and tenant permissions are unaffected.
4. GIVEN public and dashboard workflows WHEN using any locale THEN navigation,
   forms, status/errors, empty/loading states and primary actions have intentional
   translations or a documented English fallback, with no raw message IDs.
5. GIVEN long Oromo text or Ethiopic script WHEN using desktop or 390/320px screens
   THEN controls wrap/read correctly, selectors work by keyboard and no horizontal
   overflow or hydration errors occur.

## Test plan

Pure tests: locale validation, fallback, interpolation/content preservation,
catalog coverage and collision checks, selected-locale payload size. Focused
browser tests: all locale SSR language, switching/reload/navigation, inquiry/form
state preservation, public and role-scoped dashboards, accessible labels and
phone layouts. Existing security/owner/inquiry tests remain authoritative.
Evidence will be linked in TRACEABILITY; implementation is not deployment.

## Readiness and implementation order

Definition of Ready met: explicit languages/scope, stable URLs, English fallback,
no data mutation, bounded local dictionaries and unchanged domain behavior.
1. Add request/client dictionary adapters and validated preference control.
2. Wire platform-owned text, preserving all user expressions and machine values.
3. Add translations and coverage audit; inspect errors/options/dynamic labels.
4. Focused tests and desktop/phone review; request visual approval.
5. Only after approval run full/release gates and scoped commit/publication if
   authorized. Master sections 18 and 19 are affected.

## Rollout and rollback

Local visual candidate first. No data changes. Reverting the interface release
restores English; an ignored preference cookie cannot affect authentication.
Server rendering loads one language and client messages exclude server-only copy.
Keep optional human linguistic review visible in engineering evidence, not as
filler in the app. Do not claim complete coverage before inventory tests pass.


## Evidence: 2026-09-23

The owner authorized completion and publication after review. Six localization
safety tests pass, including explicit-message translation/fallback coverage and
server-only payload exclusion. 982 dictionary keys per language; retained English
terms and legacy/custom-design copy are documented in locales/english-fallbacks.json.
Unrecognized provider error details use readable English fallback rather than
raw message IDs. No native-speaker review is claimed.

85 public/owner/admin browser checks pass at 1440/390/320, including selected
language across navigation/reload, unchanged merchant content, unsaved form text,
inquiry selection, mobile menu operation and no overflow/hydration errors.
The direct-link inquiry restoration race found by this matrix is fixed under
FE-041 and covered by scripts/capture-product-ready.mjs. Full release gates and
publication evidence remain pending.

Full check, release, all nine production-mode provider/browser scenarios,
operations, final Netlify build and artifact privacy verification pass.
Deployment is separately recorded in docs/SUQPAGE-S25-RELEASE-2026-09-23.md.

Published and independently verified as 6ab399ae7a6f90b9daec07dc;
five-language live browser checks and monitored health pass. See S25 release
evidence for the resolved packaging incident and retained linguistic limits.


## S28 local extension — 2026-09-23

FE-051 / BE-043 / DEP-040 supersede S26's required signup handle field: signup
allocates an unused address and opens the populated private page preview.
Handle edits move to Business details, first change immediate then once every
30 days; a platform administrator may override with an audited support reason.
Reserved old handles redirect public product links without bypassing privacy.
New examples reuse admitted fictional ceramics imagery and include two photos
and two YouTube links per offering. Account identity/consent stays real; existing
content is untouched. The Suqpage wordmark has fixed Latin typography in every
locale. Local focused tests/captures are separate from visual/release approval.

## Contextual writing revision (FE-052, local)

`locales/README.md` records writing decisions for discovery, inquiry, publishing,
owner management and manual transport support. The local catalogs now contain
1,133 messages each, including support, callback receipts, evening schedule labels S40 showroom-value copy and S41 clearable category filters. This is a focused contextual rewrite of key journeys, not a
claim that every retained phrase has received native-speaker review. Merchant
content and canonical status values remain unchanged. Revised phone/desktop
screenshots and checks are tracked under FE-052.
