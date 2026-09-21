---
id: DEP-037
title: Simple offering search rollout
status: in_progress
related: [DEP-038, FE-047, BE-040]
owners: [product, backend, operations]
last_updated: 2026-09-18
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
