---
id: BE-040
title: Simple offering upkeep and word search
status: done
related: [BE-041, BE-009, FE-047, DEP-037]
owners: [product, backend, operations]
last_updated: 2026-09-21
change_level: L2
---

# BE-040 — Simple offering upkeep and word search

## Problem, scope and contracts

Owners post using image, name, optional YouTube URL, optional ETB price and one
required description. Staff retain their existing detailed controls. Omitted
owner metadata is resolved server-side: updates preserve type, availability,
category, units, highlights, options and visibility; new items use the existing
standard-product storage kind, available status and optional quantity without
asking owners to classify their work. This internal default does not infer a
service type. Existing service IDs, inquiries and published/private status survive.
Image replacement and removal remain controls within the image field.

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
