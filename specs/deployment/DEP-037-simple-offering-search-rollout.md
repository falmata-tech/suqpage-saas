---
id: DEP-037
title: Simple offering search rollout
status: done
related: [DEP-038, FE-047, BE-040]
owners: [product, backend, operations]
last_updated: 2026-09-21
change_level: L2
---

# DEP-037 — Simple offering search rollout

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

## S21 indexed typo-matching rollout

Add schema 48 with pg_trgm, fuzzystrmatch, and expression indexes on existing search text. No new
tenant table or data rewrite. Empty installs and upgrades must agree, preserve
all original rows/permissions, and repeat as a no-op. Archive/restore must include
the extension dependency. Existing code remains compatible with the additive indexes.
Use a protected backup and restore rehearsal, approved scoped source, passing full
gates and monitored deployment. Never relocate an existing extension silently.
Owner authorizes completing and publishing this exact search refinement.

Typo candidates must also pass bounded word edit distance: one edit for words of
up to five characters, two for longer words. This rejects shared fragments in
unrelated words while permitting common adjacent-letter transpositions.

S21 production evidence (2026-09-21): schema 48 committed, 55 existing application
tables preserved, actual runtime role and Amharic functions verified. Netlify
`6ab0dfee5b7bbcd1cb221ce6` is ready on suqpage.com from source `0fc10c0`.
Full check/release/operations/nine browser scenarios and 15 live routes pass.
See docs/SUQPAGE-RELEASE-2026-09-21.md for rollback and the fully rolled-back initial
verification-script failure. No Auth or credential changes were made.

## S22–S24 approved presentation and wiring release

The owner approved the combined visual candidate and publication on 2026-09-21.
Publish the optional map drawer, default-all category scope, plain inquiry/category
presentation and audited email-only workspace fixes together after full check,
release, isolated provider acceptance, operations and artifact privacy gates.
No schema, provider configuration or data backfill changes. Independently verify
Suqpage account/site/domain, retain a protected schema-48 archive with local restore
proof, and use S21 deploy `6ab0dfee5b7bbcd1cb221ce6` for code rollback.
Monitor public search/drawer/category/inquiry flows, health and protected entry.
Do not send real inquiries or messages during smoke checks. Evidence and remaining
provider limits: `docs/SUQPAGE-S22-S24-RELEASE-2026-09-21.md`.

## S22–S24 approved release evidence

The owner approved the combined visuals and deployment on 2026-09-21. Full check,
release, operations, nine isolated provider browser scenarios and Netlify artifact
privacy checks pass. Earlier S22–S24 pending-review notes are superseded.
Deployment evidence and remaining hosted-email limits:
`docs/SUQPAGE-S22-S24-RELEASE-2026-09-21.md`.
