---
id: ADR-0005
title: Constrained showroom composition instead of tenant-generated code
status: accepted
date: 2026-07-24
deciders: [SuqPage]
related: [BE-004, BE-005, BE-006, BE-007, BE-008, FE-004, FE-005, FE-006, FE-007, DEP-004, DEP-005, DEP-006, DEP-007, ADR-0001, ADR-0004]
---

# ADR-0005 — Constrained showroom composition instead of tenant-generated code

## Context

SuqPage needs to produce many visually distinct showrooms quickly and
consistently from unstructured client requests. A team-operated external AI tool
can help select designs and map supplied material, but allowing that tool to
write or execute tenant-specific React, JavaScript, CSS, database operations, or
publication actions would make combinations unpredictable and bypass the
existing revision, client-approval, tenant-isolation, and release controls.

The current application already has a strong immutable revision and controlled
publication workflow, but its four showroom renderers are monolithic and its
current SDK describes per-client code generation.

## Decision drivers

- Reduce routine staff assembly and repetitive form entry without weakening
  human review or exact client approval.
- Produce combinatorial visual variety from reusable, commercially supportable
  building blocks.
- Make component isolation and compatibility enforceable rather than assumed.
- Keep customer facts, private images, and canonical content separate from
  visual component code.
- Preserve existing showrooms throughout an incremental migration.
- Keep external AI replaceable and outside trusted application boundaries.

## Considered options

1. Continue generating a custom renderer for every client. This preserves
   maximum freedom but retains per-client code review, regression, deployment,
   and maintenance cost.
2. Let an external AI generate and execute tenant-specific code or write
   revisions directly. This is fast in a prototype but introduces executable
   untrusted input and bypasses compatibility, tenant, factual, and publication
   authority.
3. Maintain a versioned bank of reviewed components and accept only strict
   declarative composition proposals. SuqPage validates and renders proposals
   deterministically inside the existing revision workflow.

## Decision

Adopt option 3 as the default future production path.

- Approved component implementations, metadata, fixtures, visual examples, and
  tests live in the repository and enter through normal code review and CI.
- External AI returns a versioned showroom recipe containing two independently
  valid documents: a complete content proposal and a design proposal. A small
  recipe envelope pins their schema/bank versions, provenance, source
  reconciliation, questions, and warnings.
- The content proposal contains bounded business/meta/contact fields, dynamic
  collections/categories/products/options, allowed media keys, and typed
  section-content blocks for hero, story, highlights/trust, information, and
  calls to action. The number of catalog entries is dynamic within application
  limits and is never fixed by a template.
- The design proposal contains only an exact bank release, approved component
  references, allowed token choices, bounded properties, and declared canonical
  data/content-block bindings. Neither document contains executable code.
- Customer content and a design manifest remain separate versioned concerns,
  cross-validated and combined only for a revision/preview. Private or
  tenant-specific facts are never baked into component code.
- Media is admitted manually before brief export. Request attachments,
  authorized same-tenant managed images, new verified image uploads, and
  allowlisted provider links become request-scoped descriptors with opaque
  keys. Component definitions declare named typed media slots; content blocks
  may bind only admitted keys that satisfy each slot's kind, count, and aspect
  contract.
- Initial linked-video support normalizes a recognized YouTube URL into a
  canonical provider ID rendered by a reviewed controlled component. Recipes
  cannot introduce remote-image URLs, raw iframe/embed markup, provider scripts,
  arbitrary URL parameters, or another request's or tenant's media.
- External AI is advisory. It receives a sanitized, bounded package and returns
  JSON plus questions, warnings, and rationale. It receives no persistence,
  credentials, tenant-wide export, approval, or publication capability.
- The exported media manifest contains safe descriptors, not storage paths or
  file bytes. When image understanding is useful, staff manually supplies the
  same approved files to the external AI conversation; SuqPage performs no
  automatic media transfer in the manual phase.
- Server-side schema, semantic, compatibility, provenance, tenant, revision,
  and publication validation remain authoritative.
- Missing factual information becomes a question. AI-generated marketing copy
  may be proposed and labeled, but contact details, inventory, product claims,
  certifications, availability, specifications, and media require an
  attributable exported source.
- First-showroom and change imports are complete desired snapshots, not
  ambiguous patches. A change brief includes the authorized current snapshot;
  retained stable keys, explicit removals, expected/returned counts, and source
  reconciliation make omissions reviewable.
- Initial operation will use manual export/import after the composition renderer
  and staff review experience exist. A direct provider adapter requires a later
  accepted spec, provider/privacy decision, bounded failures, and operational
  evidence.
- Existing custom renderers remain readable during migration and recovery.
  One-off custom code may remain an explicitly reviewed premium exception, not
  the routine tenant production path.

The 2026-07-24 implementation completed the four-example-client cutover under
`FE-006`, `BE-007`, and `DEP-006`. All normal seeds, invitations, revision
writes, publications, and rollbacks now use schema v2 and the composition
renderer. Schema v1 and the former four renderer keys are temporary read-only
recovery inputs, not selectable product modes.

## Consequences

### Positive

- AI can generate many combinations without injecting production code.
- Immutable component and bank versions make previews, publication, rollback,
  and support reproducible.
- Teams review a complete content/design proposal and exceptions instead of
  entering every item, collection, page-copy field, and design choice through
  disconnected forms.
- Component defects can be fixed and tested centrally.
- The external AI vendor can be changed without changing core showroom
  authority.
- Real media remains reusable and securely managed while AI can still choose
  useful placement across compatible components.

### Negative / debt

- SuqPage must build portable content/recipe schemas, typed section-content
  contracts, provenance/reconciliation, recipe import, focused correction UI,
  preview/diff behavior, revision-v3 compatibility, and additional release
  evidence before the complete recipe workflow is operational.
- Curating orthogonal components and useful examples is ongoing product work;
  quantity alone does not create a reliable bank.
- Not every theoretically possible component combination can be exhaustively
  tested. Admission rules, semantic validation, pairwise/constraint tests, and
  visual review remain required.
- The existing renderer-generation SDK must remain clearly labeled as the
  current reviewed-code path until it is replaced; it cannot silently become an
  automated publication path.
- Media intake requires a request-scoped registry, provider-specific
  normalization, component slot metadata, accessibility/rights review,
  controlled rendering, narrow CSP behavior, and paired database/file backup.

## Verification

`BE-004` proves the side-effect-free bank/proposal contract. `BE-005`, `BE-006`,
`FE-004`, `FE-005`, `DEP-004`, and `DEP-005` prove repository-only component
admission, the staff laboratory, bounded visual experience settings, phone
containment, touch sizing, and reduced-motion behavior. `FE-006`, `BE-007`, and
`DEP-006` prove schema-v2 persistence, deterministic public/private rendering,
four-client migration, client-approved publication, rollback, recovery, and
role/browser behavior. Private proposal-import authorization and provider
privacy/failure boundaries remain later work. `FE-007`, `BE-008`, and `DEP-007`
define the ready manual full-recipe import/studio phase, including manual media
admission, opaque media-slot assignment, controlled YouTube rendering, and
media privacy/operations evidence. They do not describe current implemented
behavior until their mapped evidence passes.
