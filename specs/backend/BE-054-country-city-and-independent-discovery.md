---
id: BE-054
title: Country-city authority and independent discovery scopes
status: in_progress
related: [BE-032, FE-059, FE-065, DEP-045, BE-023, BE-040, BE-044, BE-047, BE-038, ADR-0027, BE-056, FE-026, FE-071]
owners: [backend, security]
last_updated: 2026-10-17
change_level: L3
---

# BE-054 — Country/city and independent discovery

## S122 — canonical admin geography editing (implemented locally; review pending)

The admin Location & visibility editor still uses free city/zone/region text
without canonical Country/City despite signup/owner discovery using those IDs.
GIVEN an administrator deliberately selects a replacement city THEN resolve its
known place ID server-side, require the matching explicit country and atomically
save canonical country_code/city_id/city/region. Do not invent required zone or
region text. Changing country or typing clears the prior selection; invalid or
mismatched selections fail with no partial profile/industry/sponsor changes.

GIVEN an existing custom map pin THEN changing city must not snap it to the city
center. Preserve valid worldwide coordinates, owner-proposal version fencing and
general-area rounding. An omitted coordinate retains its saved value; an explicitly
supplied invalid coordinate, including undefined, is rejected rather than silently
replaced with the previous value. GIVEN unrelated visibility/media editing or a compatible
legacy caller omits a new geography selection THEN preserve canonical IDs and
legacy unknown geography rather than guessing/backfilling a city. A legacy
free-text change must not leave a known canonical city ID pointing to another
city: require canonical selection for such a change or reject it. Preserve omitted
media, industries and sponsorship from authoritative saved values under the
business transaction, not unvalidated hidden snapshots. Keep current admin access
boundary and no new schema/provider. FE-026 defines focus/return/phone order.

The actual S122 QA admin Save exposes an older owner-read defect: a reviewed
historical proposal masks the current applied city. GIVEN a reviewed proposal
and a later applied admin location WHEN an owner reads Business details on web
or mobile THEN use the applied country/city/place/pin in its effective editing
projection, retaining the original proposal and version as history/concurrency
authority. An unreviewed proposal remains the displayed pending draft. GIVEN an
owner changes only business name or logo THEN the unchanged effective location
must not overwrite the applied admin pin, consume a pending proposal or rewrite
proposal history. Deliberate
owner location/category changes retain existing immediate application, fresh
owner/version checks and area privacy. An applied admin location correction also
advances the business content version inside that transaction, so an owner form
opened before the correction cannot overwrite it with its older location snapshot.
Unrelated metadata-only edits do not advance this location-change fence.
Add real PostgreSQL read/save regression
and repeat actual owner read/Save/reopen on the private QA tenant.

Ready: exact current source/browser defect, canonical lookup, compatibility and
coordinate/omission/security cases are explicit. Extend focused isolated
PostgreSQL/action/client-selection tests and actual local Edit/Cancel validation;
do not mutate customer geography merely for screenshot evidence.

S122 local verification: scripts/test-admin-geography.ts, scripts/test-admin-geography-ui.ts, scripts/test-owner-effective-location.ts, scripts/test-independent-discovery.ts and actual admin-to-owner web/Expo Save/readback pass. Current source, protected
readback and scoped harness failures are recorded in TRACEABILITY.md and
`.local/workspace-audit-s122/`. Both typechecks, localization and spec validation
pass. Visual approval, full/release/acceptance gates, commit and rollout remain
pending; this is not physical Android or complete-application certification.

## Problem and contract readiness

S102 adds typed independent business and product scopes to existing discovery
adapters. Normalize bounded queries, category sets, country/city sets, the product
scope's made-to-order flag and page. OR within each selected set, AND across
distinct filters. S112 BE-056 supersedes product/service selection: public results
contain physical products only. Legacy product filters remain compatible; retired
service filters fail explicitly or return zero, never broaden to all products.
No meaningful criterion returns a bounded default browse batch.
Business text searches business identity/profile/location; product text searches
the offering with its source business context. Keep ranking, bounded spelling
fallback, 12-card independent pages, public visibility and blocked-business exclusions.
No raw strings become SQL. Legacy endpoints/URLs remain explicitly compatible;
new clients use separate scopes and stable geographic keys.

Signup resolves a chosen place ID server-side to a known country, city and area
anchor. A supplied country must agree. Legacy Ethiopian place IDs remain valid;
their country is derived canonically, enabling older clients to finish setup.
New interfaces require explicit country selection. Never accept browser GPS as
city authority, guess a city from a country centroid, or silently default a new
account to Addis. Owner edits preserve tenant/version checks and choose country/
city through the same catalog. Exact GPS supports valid worldwide coordinates; blank/null fields are invalid
rather than being coerced to zero. Only the known obsolete constraint names are
widened; unexpected target shapes stop/roll back and unrelated checks remain.

An additive migration adds bounded country codes/canonical city IDs to discovery
and country codes to owner proposals, widening only obsolete Ethiopia coordinate
constraints. Resolve existing known Ethiopian canonical anchors without moving
coordinates; unknown legacy places remain unknown until owner correction. No
invented country or blanket relocation. Discovery location options group only
eligible public, non-excluded, published-page locations; signup countries/cities
can include places without a listed business yet. ADR-0027 defines offline data.

### S107 administrator coordinate correction

The administrator's existing discovery editor must accept the same worldwide
coordinate bounds as owner location editing: latitude -90 through 90 and
longitude -180 through 180, inclusive. Valid finite numbers and nonempty numeric
strings are accepted; blank, null, boolean, array, nonnumeric, infinite and
out-of-range inputs fail before persistence rather than becoming zero. Keep
existing platform-admin authorization, owner-proposal version checks, approximate
area rounding and unrelated visibility/sponsorship values unchanged. A rejected
save must not alter the current profile or another business. The existing
schema-64 constraint already supports this correction; no migration is needed.
`scripts/test-independent-discovery.ts` verifies real isolated PostgreSQL
readback, rejected-input preservation and stale-proposal denial.

## S103 bounded browsing and loading contract

The October 16 owner request supersedes S102 zero-result activation. Independent
map queries use a SQL LIMIT of 200 and an aggregate count with identical public
predicates; no full business row set is hydrated then sliced. When normal matches
fill the cap, spelling expansion is unnecessary. Product pages remain server
LIMIT/OFFSET queries in deterministic title/business/ID order, now 12 per batch
for independent scopes only; legacy five-row endpoints remain compatible.
An unfiltered first-page anonymous browse shares the existing 20-second
public-marketplace tagged cache across web/native HTTP adapters. Free-form
queries, filters, later pages and visitor exclusions bypass that shared cache;
there is no per-keystroke cache-key growth or background polling. Native keeps
its local block exclusions. Responses remain private/no-store at the browser.
Product batches do not fetch the unrelated Featured program/map-presence projection.
No database migration, new provider or dependency is required.

## Scenarios

- GIVEN either empty scope WHEN queried THEN return the first bounded public
  batch (200 map businesses / 12 products), with accurate totals and metadata. Unpublished/excluded/blocked pages
  never leak through counts, country/city options, typo fallback or map groups.
- GIVEN separate scopes WHEN one query/filter changes THEN the other result set
  and pagination are unchanged. Product descriptions/source identity remain
  literal. Turning on Made to order filters only that product scope before
  paging/counting and typo admission; turning it off restores all eligible physical
  products. Apply that flag to the returned product, not an unrelated item from
  its source business. Business-map criteria remain unchanged.
- GIVEN countries/cities or a zero-match combination THEN apply all requested
  valid filters without silently broadening. Identical city names in different
  countries stay distinct. Region fields are retained for compatibility, not a
  new public filtering axis.
- GIVEN valid canonical country/city WHEN signup/save succeeds THEN persist the
  same country/city/anchor atomically with the account/profile. Invalid or forged
  mismatches roll back; another tenant remains inaccessible. Approximate marker
  separation does not alter stored coordinates; exact pins remain exact.
- GIVEN migration/replay THEN preserve accounts, products, inquiries, chat data,
  existing coordinates and permission grants. Existing demo-only correction is
  covered by DEP-045 rather than a universal production seed/reset. FE-066/BE-055
  retire new business-inbox submissions without deleting authorized private
  history or changing transport/owner-support authority.

Safer new starter defaults do not make old sample contact values publishable.
BE-032 keeps legacy placeholders and reserved destinations in first-publication
checks; real contact behavior and existing live-page save remain unchanged.

## Test plan

Definition of Ready: shared contracts, existing SQL/owner adapters, additive
migration path, offline place source/license, isolated PostgreSQL and local Auth
fixtures are known. Add regression tests for every negative/data-integrity path,
projection metadata, ranking, category/location unions, custom-product filtering,
retired service-filter compatibility and both wire clients.
Focused tests precede visual approval/full build/release gates. Local data is
backed up before migration; hosted changes require exact target/backup/rollback
and separately reviewed deployment. Rollback retains additive columns/data.

## Rollout

Local focused evidence and explicit visual approval precede full/release gates.
DEP-045 controls backup, preservation, scoped commit and any later hosted rollout;
DEP-042 controls rebuilt Android delivery. No automatic publication or reset.
