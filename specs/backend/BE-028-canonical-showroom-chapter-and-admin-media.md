---
id: BE-028
title: Canonical showroom chapter and administrator media parity
status: in_progress
related: [BE-008, BE-010, BE-024, BE-026, BE-027, FE-009, FE-026, FE-031, DEP-011, DEP-023, ADR-0007, ADR-0012]
owners: [backend, security, operations]
last_updated: 2026-08-10
change_level: L3
---

# BE-028 - Canonical showroom chapter and administrator media parity

## Problem and outcome

The current recipe contract requires separate story and process assignments,
while public rendering, private revision editing, SQLite, PostgreSQL, and media
storage must agree on one launch-ready showroom structure. Discovery booth
media also lacks a provider-neutral administrator upload command.

## Contracts

- `canonicalizeShowroomChapters` is a pure domain transformation over a valid
  managed content document and design proposal. It returns one highlights block
  and section for business story, process steps, optional image, and process
  video presentation.
- When legacy story and highlights blocks coexist, unique story body text is
  placed before process framing, the first valid story image is retained only
  when the highlights block has no image, story sections and blocks are removed,
  and every remaining block is assigned exactly once.
- When legacy story exists without highlights, it becomes a bounded highlights
  chapter with explicit default steps. New recipe input must supply highlights
  directly and cannot use the compatibility conversion as an authoring shortcut.
- Fixture-derived default step descriptions preserve each supplied imperative
  step without mechanically repeating its opening verb.
- Managed reads validate the retained document before canonicalization and
  validate the canonical result afterward. Invalid retained content continues
  to fail closed.
- Public rendering canonicalizes in memory. Revision reads return canonical
  snapshots, and an authorized save or publication persists that canonical
  state atomically through the existing revision service.
- Authorized revision editors may admit a replacement JPEG, PNG, or WebP at
  each image field and a supported YouTube watch or share URL at the combined
  story/process or offering video field. Image admission creates private,
  request-scoped media; YouTube admission returns a normalized
  `youtube:<provider-id>` reference rather than an internal recipe asset key.
- Draft validation accepts only media admitted to the same request. Publication
  copies selected private image references through `MediaObjectStore` to durable
  public media while controlled provider references remain provider-neutral.
- Business name, logo, browser icon, contact routes, live-session state and
  destination, page title, and search/share description are authoritative on
  the current business record. Revision snapshots retain compatibility fields,
  but recipe import, preview, publication, and rollback overlay these settings
  from the current business and may not write stale snapshot values over them.
- Hero title, subtitle, short label, and image remain revision-owned. The
  canonical hero content block mirrors the retained business hero compatibility
  fields before draft persistence and publication.
- The portable JSON schema, complete example, assignment checklist, templates,
  instructions, and fitness rules all expose the same six-section contract.
- A discovery booth upload stages sanitized media through `MediaObjectStore`.
  The database update and audit complete only after storage succeeds; a failed
  mutation discards the newly staged object. Existing booth media is not deleted
  automatically because retained revisions or cached public references may
  still use it.
- SQLite and PostgreSQL execute the same discovery-profile mutation through the
  runtime SQL boundary. No adapter may write a filesystem path directly when
  the Supabase media driver is selected.
- New public-state fields require an administrator/client owner or an explicit
  operator-only classification in the release-readiness matrix.

## Failure scenarios

```gherkin
Scenario: New recipe includes a standalone story
  GIVEN the AI-facing schema defines one combined highlights chapter
  WHEN a recipe submits a story block
  THEN import fails with an actionable combined-chapter correction
  AND no private revision is changed

Scenario: Booth storage succeeds but profile validation fails
  GIVEN an administrator uploads a valid booth image with invalid location data
  WHEN profile validation rejects the mutation
  THEN the newly staged media object is discarded
  AND the prior discovery profile remains authoritative

Scenario: Legacy content cannot form a valid canonical design
  GIVEN a retained document is internally inconsistent
  WHEN the read boundary validates it
  THEN the showroom fails closed
  AND no partial normalized record is persisted

Scenario: Staff admits replacement media while editing
  GIVEN an authorized staff member is editing a private revision
  WHEN they upload a supported image or submit a supported YouTube URL
  THEN the admitted reference is scoped to that revision's request
  AND a draft may save the normalized image or provider reference
  AND publication promotes only selected private images to public storage

Scenario: Business settings change while a revision is open
  GIVEN a revision contains older identity or contact compatibility fields
  AND Business details now contains newer values
  WHEN the revision is previewed, published, or used for rollback
  THEN the newer Business details values remain authoritative
  AND revision-owned narrative, hero, process, catalog, and design changes still apply
```

## Test plan

| Criterion | Evidence |
|---|---|
| Pure deterministic legacy normalization | `scripts/test-showroom-content-blocks.ts`, `scripts/test-revision-v4.ts` |
| New recipe rejection and exact assignments | `scripts/test-showroom-recipe.ts`, `scripts/test-showroom-composition-v2.ts` |
| SQLite/PostgreSQL discovery parity | `scripts/test-discovery.ts`, `scripts/test-postgres-runtime.ts` |
| Storage failure cleanup and authorization | media-storage and security tests |
| Publication stores canonical state | revision and acceptance tests |
| Inline image and YouTube admission remains request-scoped | recipe, YouTube-provider, security, and focused browser tests |
| Publication and rollback preserve current Business details | revision and recipe regression tests |

## Rollout and rollback

No bulk rewrite runs during deployment. The read adapter supplies immediate
presentation compatibility, while future authorized writes converge records to
the canonical form. Rollback restores the prior read presentation without a
database reverse migration.

## Readiness checklist

- [x] Domain transformation and compatibility boundary explicit
- [x] New-write and retained-read behavior separated
- [x] Storage and database failure behavior explicit
- [x] SQLite/PostgreSQL parity required
- [x] Rollback requires no destructive migration
