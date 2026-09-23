---
id: FE-047
title: Five-field offering editor
status: done
related: [FE-050, FE-048, FE-041, BE-040, DEP-037]
owners: [product, backend, operations]
last_updated: 2026-09-21
change_level: L2
---

# FE-047 — Five-field offering editor

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

## Ordered media extension — 2026-09-23

FE-050 / BE-042 supersede the single-photo/single-video controls for the local
candidate. Owners add/remove/reorder up to eight photos and four YouTube links.
The linked product view uses thumbnails, arrows and horizontal scrolling; an
explicit play action starts the selected video. Save/reload retains the order
and existing records expand without backfill. DEP-039 gates hosted rollout.
