---
id: BE-040
title: Simple offering upkeep and word search
status: in_progress
related: [BE-044, BE-041, BE-009, FE-047, DEP-037, FE-019, BE-018, DEP-039, BE-054, BE-056]
owners: [product, backend, operations]
last_updated: 2026-09-27
change_level: L2
---

# BE-040 — Simple offering upkeep and word search

## Problem, scope and contracts

Owners post using image, name, optional ETB price and one required description.
Video changes use the S48 support-request workflow below. Staff retain their existing detailed controls. Omitted
owner metadata is resolved server-side: updates preserve type, availability,
category, units, highlights, options and visibility; new items use the existing
standard-product storage kind, available status and optional quantity without
asking owners to classify their work. This internal default does not infer a
service type. Existing service IDs, inquiries and published/private status survive.
Image replacement and removal remain controls within the image field.

BE-044 native listing-state exception: the native form explicitly exposes
availability and visibility. Its server adapter may opt into updating those two
validated fields while preserving all advanced metadata under the existing
tenant/version lock. Web simplified content saves retain their existing metadata
preservation contract. A hidden native item must disappear from public catalogs
and remain visible/editable to its owner; API and browser regressions prove it.

Search matches case-insensitive words across title, description, business name,
handle and reviewed location. All terms must match the same offering and its
business metadata (or the business itself), in any order. Exact title and prefix
ranking remains deterministic; result counts and five-row backend pagination use
identical predicates. Unicode NFKC normalization is applied on both sides, with
literal wildcard escaping. No translation, embeddings, provider calls or media
analysis are added. Query length remains bounded at 80 characters.

S20 human-query matching: normalize Latin accents and separator punctuation on
both query and document. Treat simple English singular/plural forms as alternatives
within each required term; ignore common request words only when substantive terms
remain. Preserve all-term matching, category/place/visibility boundaries and literal
regex/wildcard punctuation. Empty or punctuation-only searches must not broaden
into every listing. Match rules are deterministic, without translation or guessed
brand corrections. Search suggestions, counts, pages and map use the same rules.
Test case/spacing, quoted/hyphenated terms, plurals, accents, mixed Amharic/English,
natural product/location phrases, exact brand names, hidden/cross-category records,
zero matches, page bounds and rapid edits. Explicit submission accepts one-character
queries; punctuation cannot expand to all listings. Delayed results must not overwrite
newer typing, and browser Back restores the query for the restored results. Measure the 10,000-offering fixture.

## Scenarios

### Original-term ranking correction — 2026-09-23

L2 defect: `gras` expands to `gras`/`gra`, and a title such as `Farm Grass with
Dirt` previously tied with grain/graphic matches because it does not start with
the whole query. Keep eligibility, plural recall, spelling candidate bounds,
product/business sequence, counts and five-row SQL pagination unchanged.
Within normal product matches, rank exact title, whole-title prefix, all original
meaningful terms anywhere in the title, exact business name, original terms in
the combined searchable text, then variant-only matches. Original terms use the
existing normalization/escaping but no plural alternatives. Suggestions use the
same title preference. No popularity, new service, schema or UI control.

- GIVEN more than five variant-only grain/graphic matches and published Farm Grass
  with Dirt WHEN searching `gras` THEN that product appears first on page one.
- GIVEN literal original-term title and description matches plus variant-only
  matches WHEN paging THEN stronger title matches precede description matches,
  which precede variant-only matches, with stable ties and no duplicates.
- GIVEN exact and prefixed titles WHEN searching THEN they retain priority;
  request words, case, punctuation and accents do not defeat original-term ranking.
- GIVEN hidden products or category/place filters THEN rank cannot bypass them;
  blank browsing, simple plural recall and spelling matching remain supported.

DOR met: no unresolved data/product choice. Focused real-PostgreSQL regression,
existing word/pagination/spelling tests, 10,000-offering performance fixture and
local browser result verification are required. Master §10 is affected. Rollback
is the previous ranking code; no database mutation or deployment is required.

Local evidence: `scripts/test-search-ranking.ts` failed before the fix and passes
afterward; it is included in `test:discovery-pagination`. Existing spelling tests,
21 human-query cases and six PostgreSQL pagination/search tests pass. Typecheck
and 153-spec validation pass. Read-only checks of the local catalog move Farm Grass
with Dirt from eighth to first for `gras`, preserving all 39 eligible results.
Browser checks at 1440/390/320 confirm its first row is visible and Next/Previous
retain the order (`.local/search-ranking/gras-*.png`). No tenant content was edited.

The 10,000-offering performance fixture initially exceeded its 2.5-second budget
while browser checks were running. One controlled isolated retry passes: normal
queries 945/886/832ms and typo queries 1192/1560/1355ms; indexed candidate retrieval
passes. These are local measurements, not production latency guarantees. Full
build/release and publication remain pending alongside the earlier visual candidate.

- GIVEN an owner WHEN opening add/edit on desktop or phone THEN only five content
  fields appear, with image actions and one Save/Add action; staff still have controls.
- GIVEN a saved service with category/options/availability/hidden status WHEN its
  five content fields are saved THEN omitted metadata and IDs remain unchanged.
- GIVEN a foreign tenant or stale version WHEN saving THEN the existing scoped
  permission/version/idempotency guards reject the write without data changes.
- GIVEN words spread across a description and reviewed city WHEN searching in
  either order/case THEN the same eligible offering appears with stable totals.
- GIVEN Unicode text, wildcard punctuation, hidden items or private businesses
  WHEN searching THEN literal matching never broadens visibility or leaks data.
- GIVEN a published Aloe Body Lotion in Personal & home care WHEN searching
  lotion, Lotion or LOTION in that category THEN the offering and its eligible
  business appear consistently; hidden offerings and other categories stay excluded.

## Quality and test plan

No schema or provider change. Reuse PostgreSQL read/upkeep ports; retain canonical
validation and versioned writes. Existing public approval and location privacy
remain. No account identity changes. Browser labels, keyboard controls, responsive
layout and image error handling retain existing accessible components.
Focused tests: scripts/test-discovery-pagination.ts, scripts/test-product-upkeep.ts,
scripts/capture-business-starters.ts and typecheck. Add regression tests for omitted
metadata and split-word queries. Visual approval precedes full check/release/build/
acceptance gates. Observe errors without catalog text or credentials in logs.

## Rollout and rollback

Local candidate only until visual approval and release gates. No backfill. Rollback
restores the form/search code without removing stored content. Existing service and
starter rollout dependencies (schema 47) remain. This does not approve pending
first-page publication changes. Master sections 7/10/13/18 describe the affected
form and search; section 17 is affected by the separate DEP-027 startup change.

## Readiness

Definition of Ready satisfied: bounded outcomes, privacy, defaults, compatibility,
fixtures and rollback are explicit. Focused implementation and verification pass; visual approval and release gates remain pending.

## Local evidence — 2026-09-19

Typecheck, discovery suite, pagination/word-search regression and product upkeep
persistence/security tests pass. Browser fixture verifies exactly five owner
content inputs, create/save/reload, preserved metadata and private page denial;
19 captures at 1440/390/320 plus three accessibility scans pass. Evidence under
`.local/business-starter-review/`; local test sessions are not hosted Auth evidence.
No schema change, provider AI integration, full release gate or deployment claimed.

Current candidate FE-048/BE-041/DEP-038 supersedes staff approval requirements and
adds a simple Product/Service input. Historical evidence above remains scoped to
its release; the new candidate awaits focused verification and visual approval.

## Superseding local candidate — 2026-09-20

FE-048/BE-041/DEP-038 add the explicitly requested Product/Service selector.
The five content fields remain; an explicit kind selection now updates the type,
while omitted metadata is still preserved. First Publish/live Save and immediate
location saves replace staff approval. Earlier five-field-only/no-backfill wording
describes the prior checkpoint, not the current candidate.

## S20 human-query evidence — 2026-09-21

The owner approved finishing/publication; prior visual-gate notes are superseded.
`test-human-search.ts` passes 21 positive variations and literal/Unicode/negative
cases. `test-discovery-pagination.ts` passes five real PostgreSQL scenarios,
including 19 lotion variations, 30 everyday product/description/location queries,
five Prairie Meadows name/handle variations and four plural queries. Category,
publication, no cross-product matching, totals and page boundaries are enforced.
`capture-human-search.mjs` passes at 1440/390/320, including a deliberately delayed
response that reproduced and now guards newer-input loss, rapid typing, type/category
retention, product Back, explicit punctuation submission and zero horizontal overflow.
`test-search-performance.ts`: 500 businesses/10,000 products; five returned rows,
450/436/492 ms initially; 443/522/802 ms after the Unicode correction on the local fixture. These are local measurements, not production
latency guarantees. Full release/deployment evidence is tracked in S20.

S20b search-link/filter correction: GIVEN a nonempty query without a category in
the URL THEN open results across all industries rather than the start chooser.
GIVEN a valid selected city/region with no matching offering THEN keep the filter
and return zero; never silently broaden to another location because its match
count is zero. Unknown place keys retain existing normalization behavior.

Unicode preservation: accent fallback must retain exact Greek and Cyrillic queries
as well as Amharic and Latin text. Tests include Αθήνα and чай in documents without
Latin accents, so the fallback cannot rely on Latin-only character detection.

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

## S21 — bounded spelling matches in the existing result list

Owner authorizes implementation and publication. Exact/normal all-term matches
precede spelling alternatives in one ranked, five-row database-paginated sequence.
Within alternatives, stronger PostgreSQL similarity sorts first; stable name/type/ID
ties prevent repeats. Existing category browsing order is unchanged for empty queries.
No new match section, badges, explanatory UI, provider, AI or translation.

Use pg_trgm indexes and PostgreSQL fuzzystrmatch edit-distance validation over existing product, business, published About and public
location text. Candidate retrieval and reranking are bounded; all meaningful terms
must match the same offering plus its business metadata, or that business. Retain
literal escaping, normalization, common plural alternatives and query length 80.
Very short or punctuation-only terms do not initiate approximate retrieval. Exact
results remain complete; approximate results are capped at 100 strongest products and 100 businesses,
with counts/pagination referring to that admitted set. Never silently broaden filters.

- GIVEN exact and misspelled eligible matches WHEN searching THEN every normal
  match precedes alternatives across product/business types and across pages.
- GIVEN English and Amharic character typos WHEN similarity is sufficient THEN
  results appear by quality; unrelated words and punctuation do not match.
- GIVEN private, hidden, excluded, suspended or foreign-category/place content
  WHEN retrieving/ranking candidates THEN it cannot appear or consume the visible
  result limit. No unpublished About text enters search.
- GIVEN edited names/descriptions/locations/publications WHEN committed THEN
  indexes and canonical read predicates immediately reflect edits without a sync job.
- GIVEN empty query, long query, rapid typing, Back or type changes THEN existing
  category, map and navigation behavior remains, with accurate bounded pages.

Evidence required: focused PostgreSQL relevance/negative/pagination tests, EXPLAIN
index-use checks, 10,000-offering English/Amharic performance comparison, existing
search regressions, desktop/390/320 browser capture, typecheck, full/release/browser
gates and monitored publication. No performance guarantee before measurement.

Typo candidates must also pass bounded word edit distance: one edit for words of
up to five characters, two for longer words. This rejects shared fragments in
unrelated words while permitting common adjacent-letter transpositions.

Candidate probes admit at most 32 records per indexed field per eligible term
(first eight terms), and expand each candidate business into at most 32 published
offerings. Approximate search is intentionally best-effort within these limits.

S22 (FE-042): omitted or invalid category selection resolves to All categories
for both map and backend-paginated results, even with no query. Explicit valid
categories and places still constrain eligibility; no search or privacy rule is
relaxed. Default-all and explicit-all projections must agree in regression tests.

## S22–S24 approved release evidence

The owner approved the combined visuals and deployment on 2026-09-21. Full check,
release, operations, nine isolated provider browser scenarios and Netlify artifact
privacy checks pass. Earlier S22–S24 pending-review notes are superseded.
Deployment evidence and remaining hosted-email limits:
`docs/SUQPAGE-S22-S24-RELEASE-2026-09-21.md`.

## S48 reviewed video entry

FE-019/BE-018 and DEP-039 govern video changes. Normal owner/staff media saves
retain existing references or the example; new links require a target-bound
support request and assigned staff review. Staff may approve a supported
YouTube URL from any channel without channel configuration. Existing photos,
other fields and previously admitted videos remain unchanged. New products use
the starter video. `scripts/test-video-requests.ts` covers tenant/agent boundaries,
forged saves, approval without channel setup, retries, stale targets and exact-field
preservation; `scripts/capture-video-requests.ts` covers the real owner/staff forms.
Local evidence passes; refreshed release and publication gates remain pending.
