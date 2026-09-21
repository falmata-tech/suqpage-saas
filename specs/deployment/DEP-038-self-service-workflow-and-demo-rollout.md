---
id: DEP-038
title: Self-service workflow and demo rollout
status: done
related: [FE-048, BE-041, DEP-037]
owners: [product, backend, operations]
last_updated: 2026-09-21
change_level: L3
---

# DEP-038 — Self-service workflow and demo rollout

## Problem and outcome

Owners need an independent setup-to-publication workflow; first-page and location
review queues are obsolete. Demos should demonstrate the simplified catalog,
while public map/search stay responsive and predictable on phones.

## Contracts and scope

- Owner saves a private page before first publication. Publish makes an eligible
  draft business active immediately, with at least one listed offering. There is
  no administrator approval. Suspended businesses cannot reactivate themselves.
- After publication, an owner's Save atomically updates the live page and retained
  publication history. Staff assistance remains consented and draft-only; owners
  retain publication authority. Stale versions, tenant/role checks, media guards,
  same-origin validation and atomic failure behavior remain.
- Location Save applies a valid selected city centroid or explicitly public GPS
  storefront directly to the marketplace profile and business category. Area mode
  never publishes exact/home coordinates. Unknown manual areas may save text but
  have no map pin until a known place is selected; no review is required. Admin
  exclusions/suspensions are preserved and cannot be bypassed by saving.
- Owner navigation centers on setup/overview, business details, page, products &
  services, inquiries, support and account security. Remove redundant categories,
  review and renewal navigation from the owner flow; retain staff operations and
  existing financial/history records. Retire review mutations/routes and queues,
  not their historical records. Admin retains business moderation, marketplace,
  staff, support, featured/sponsor and renewal operations.
- Posting adds one simple Product/Service selector to the prior five fields,
  explicitly requested by the latest user. Legacy manufacturing/custom-order
  records remain readable, with description expressing any custom work. No new
  catalog table, stock controls, AI inference, provider or payment integration.
- Update only exact admitted demo handles/products using deterministic simplified
  seed content and a protected before-state. Keep identities, media, IDs, handles,
  inquiries, and non-demo/customer data. Useful old facts/options become readable
  descriptions before retiring demo-only option/highlight/production clutter.
  Prices remain optional. Recurring fresh seed output matches this presentation;
  existing-demo correction is a one-time transaction, not a new sync service.
- Search keeps all-word matching, Unicode/literal correctness, accurate backend
  paging and private-content exclusion. Remove unnecessary count-query sorting/
  hydration and measure representative data before expanding infrastructure.
- Map cluster clicks zoom forward; individual selection centers without zooming
  back out and opens the selected business. Pagination keeps map position. Test
  same-location groups, result/map navigation, keyboard use, mobile overflow and
  filter controls. Keep attribution and bounded map fallback.

## Scenarios and test plan

1. GIVEN a private owner with saved content and listed offering WHEN Publish is
   clicked THEN page is public without any review row or staff action; no offerings,
   suspension, foreign owner or stale version fails without partial publication.
2. GIVEN a live page WHEN owner Save succeeds THEN draft/publication match atomically;
   staff Save only changes the draft, and publication errors roll back owner edits.
3. GIVEN selected area or public storefront WHEN location is saved THEN map coordinates
   reflect that choice immediately after publication; switching to area removes exact
   coordinates, and admin exclusion remains. Forged place anchors are ignored.
4. GIVEN owner/admin on desktop and 390/320 WHEN navigating THEN retired review tasks
   are absent, live support/security/inquiries remain accessible and scoped.
5. GIVEN admitted demos WHEN corrected THEN simpler fields and descriptions are
   complete, IDs/media/inquiries/non-demo data remain, and fresh seeds agree.
6. GIVEN paginated mixed-language search/map interactions WHEN typing, filtering,
   paging and selecting markers THEN results stay scoped/bounded, clusters expand,
   selected pages match and no map reset/overflow occurs.

Focused integration: scripts/test-self-service-publication.ts, existing owner-page,
place, product upkeep and discovery/pagination regressions. Browser captures cover
owner/admin/public map at desktop/phone sizes and accessibility. Demo operation
records aggregate before/after counts and protected restore data. No raw customer
content, credentials or transcript is retained in repository documentation.

## Readiness, rollout and rollback

Definition of Ready met by the newest explicit owner instruction: no staff review,
Product/Service control, demo-only cleanup, and managed search deferred. This is
L2 feature/data-integrity plus L3 local demo operations. No schema change planned.
Master sections 7,10,11,13,17,18,21 and prior review-based specs are superseded in
these aspects. Implement and focused-test locally, capture affected states, obtain
visual approval, then full/release gates, scoped commit and verified rollout.
Rollback code restores prior workflow while preserving publication/history; demo
rollback uses the protected exact before-state. No hosted Auth/config changes.

## City marker separation — accepted 2026-09-20

City/general-area shops use stable business-ID-based display offsets within 1.5 km
of their public city anchor, so identical default coordinates do not share one
point. Exact storefront and unclassified legacy positions are unchanged. Offsets
never replace saved city/GPS coordinates or imply street addresses. Search/filter/
pagination do not change an individual shop's offset. General-area shops use zoom
clustering rather than the exact-location Nearby group at detailed zoom, revealing
separate shop markers. Mark these positions as approximate. Tests cover distinct
same-city points, bounded distance, stable filtered subsets and untouched GPS.

## Focused local evidence — 2026-09-20

`docs/SUQPAGE-SELF-SERVICE-REVIEW.md` maps the six scenarios to integration,
seed, benchmark and owner/admin/map browser evidence. Typecheck and 151-spec
validation pass. Protected local correction preserved account/inquiry/non-demo
data. Private media routes no longer use historical pending-review grants.
Visual approval, full/release/acceptance gates, scoped commit and hosted rollout
remain pending; status intentionally remains in_progress.

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
