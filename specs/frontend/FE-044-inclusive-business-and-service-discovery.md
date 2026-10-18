---
id: FE-044
title: Inclusive business and service discovery
status: done
related: [BE-037, DEP-034, FE-039, FE-040, FE-041, FE-067]
owners: [product, frontend]
last_updated: 2026-09-21
change_level: L3
---

# FE-044 — Businesses, products and services

## S112 superseding local contract

FE-067 / BE-056 / DEP-046 supersede active service-listing admission and its
product/service UI for the local candidate. The scenarios and release evidence
below describe the historical rollout; stored kinds, rows and inquiry/revision
history remain readable, but new service writes and public service discovery are
retired in the candidate. Do not apply destructive constraint/data removal.
Visual approval, full gates and a separate rollout remain pending.


## Problem and scope

The owner wants an accessible digital presence for African businesses, including
growers, makers, traders and service providers. Product-only copy and rigid selling
units exclude service offerings even though the catalog already supports custom
work. Preserve the current map, paginated results, Featured placement, permanent
business identity and direct inquiry experience. This change adds services to the
existing catalog; it does not add checkout or change page publication permissions.
Starter content and simplified Save are separately recorded in checklist S8 while
their disclosure and visibility choices are resolved.

## Scenarios

- GIVEN a product-only business WHEN its page opens THEN it retains a Products
  catalog; a service-only business shows Services and a mixed business shows
  Products & services, with the same linked detail and inquiry interactions.
- GIVEN a service WHEN displayed or edited THEN name, description, media,
  availability, optional price/unit, highlights and options remain usable without
  inventing inventory, a physical selling unit or production requirements.
- GIVEN a visitor WHEN searching or choosing a category THEN services appear in
  the same backend-paginated offering results while the map remains visible.
- GIVEN a visitor WHEN reading Market/About/Featured THEN copy explains finding
  businesses, products and services through maps, search and featured discovery;
  About describes the African mission and current Ethiopia-first catalog without
  claiming complete geographic coverage or guaranteed business outcomes.
- GIVEN existing product links and inquiry selections WHEN service support is
  enabled THEN their IDs, URLs, saved options and canonical authorization remain.

## Test plan

Focused offering presentation and inquiry tests, source-copy checks, typecheck,
then desktop/390/320 captures of product/service/mixed pages and Market/About.
Local visual approval precedes full check/release/browser gates per AGENTS.md.
Existing eight browser workflows are retained with updated copy expectations.

## Rollout

DEP-034 owns additive data compatibility and rollout. No real tenant text or
contact data is overwritten. Public mission text belongs to platform pages.

## Local evidence: 2026-09-17

`test:service-offerings`, `test:place-selection`, existing product-upkeep and
launch-wiring regressions, homepage/narrative/inquiry checks and typecheck pass.
`scripts/capture-service-place.ts` verifies owner-created services, linked service
inquiry, mixed catalogs, service search results, keyboard place selection,
save/reload, area privacy and admin anchor prefilling. Twenty-eight desktop/phone
captures and six owner/About accessibility scans pass in an isolated local schema
with test-issued local sessions. Visual approval, full release gates, scoped commit
and protected persistent/hosted migration remain pending. See
`docs/SUQPAGE-SERVICES-AND-PLACES-REVIEW.md`; no production rollout is claimed.

## Evidence: verified rollout — 2026-09-21

Source `be134a247c8ea54b18b882f9e2368058f7fbc0ee` is published as Netlify `6ab0d349f099639821fa0f9a` at https://suqpage.com.
Full check, release, operations, all nine isolated provider browser scenarios,
artifact privacy and production dependency audit pass. Production schema 47,
64 updated demo pages/256 offerings, all 64 public routes, live search at
1440/390/320, email-only entry, private-route denial, health and www redirects
are independently verified. Mapped focused tests and earlier desktop/phone
reviews remain applicable; the owner approved this release.

Earlier dated pending-approval/local-only notes are superseded by this rollout.
No real external email was sent and no authenticated hosted account was used
for testing; those admission checks remain separate from local provider evidence.
Demo contact destinations are examples, not verified delivery channels.
See docs/SUQPAGE-RELEASE-2026-09-21.md for backup, rollback and limitations.

## S24 — readable categories and app language

GIVEN category controls on Market, Featured, setup/admin or About WHEN displayed
THEN show text alongside recognizable product-object illustrations (phone, soap,
wheat, food, tools, furniture, clothing; shop for other/all). Use one shared local
illustration component with a safe fallback, no external images or new dependency.
The Market chooser expands only on request, keeps All categories available, and
uses keyboard-accessible buttons with visible selected state. Other forms retain
native selection semantics and show the chosen illustration; visible names stay
consistent. Existing keys, saved classifications and backend filters do not change.

GIVEN public/owner/admin platform copy WHEN naming actions or describing Suqpage
THEN use short, everyday English without implementation terms or repeated filler.
About explains finding African businesses (starting in Ethiopia), viewing products
or services, and contacting the business; it offers working category links.
Preserve legal meaning, privacy guidance and merchant-authored content.

Tests: shared-icon/fallback rendering and label contracts; browser category
selection and all reset, Featured/About links, product single/list separation,
keyboard/Escape and 1440/390/320 overflow/screenshots. Full release gates await
visual approval. Rollback is presentation code only; no data changes.

Local evidence: `test:narrative` (including rendered artwork/fallback checks),
`test:homepage`, typecheck and spec validation pass. Category/drawer browser checks
pass at 1440/390/320 with selection, all reset, keyboard/Escape, working About links,
accessibility and no overflow. Captures: `.local/category-language-review/`.
Visual approval, full gates and deployment remain pending.

## S22–S24 approved release evidence

The owner approved the combined visuals and deployment on 2026-09-21. Full check,
release, operations, nine isolated provider browser scenarios and Netlify artifact
privacy checks pass. Earlier S22–S24 pending-review notes are superseded.
Deployment evidence and remaining hosted-email limits:
`docs/SUQPAGE-S22-S24-RELEASE-2026-09-21.md`.
