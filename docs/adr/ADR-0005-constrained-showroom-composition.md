---
id: ADR-0005
title: Constrained showroom composition instead of tenant-generated code
status: accepted
date: 2026-07-24
deciders: [SuqPage]
related: [BE-004, ADR-0001, ADR-0004]
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
- A design proposal contains only an exact bank release, approved component
  references, allowed token choices, bounded properties, and declared canonical
  data bindings. It contains no executable code.
- Customer content and a design manifest remain separate versioned concerns.
  Combining them for preview does not bake private or tenant-specific facts into
  component code.
- External AI is advisory. It receives a sanitized, bounded package and returns
  JSON plus questions, warnings, and rationale. It receives no persistence,
  credentials, tenant-wide export, approval, or publication capability.
- Server-side schema, semantic, compatibility, provenance, tenant, revision,
  and publication validation remain authoritative.
- Missing factual information becomes a question. AI-generated marketing copy
  may be proposed, but contact details, inventory, product claims,
  certifications, availability, and specifications require an attributable
  source.
- Initial operation will use manual export/import after the composition renderer
  and staff review experience exist. A direct provider adapter requires a later
  accepted spec, provider/privacy decision, bounded failures, and operational
  evidence.
- Existing custom renderers remain supported during migration. One-off custom
  code may remain an explicitly reviewed premium exception, not the routine
  tenant production path.

## Consequences

### Positive

- AI can generate many combinations without injecting production code.
- Immutable component and bank versions make previews, publication, rollback,
  and support reproducible.
- Teams review a visual proposal and exceptions instead of starting with many
  disconnected forms.
- Component defects can be fixed and tested centrally.
- The external AI vendor can be changed without changing core showroom
  authority.

### Negative / debt

- SuqPage must build a curated component bank, compatibility model, composition
  renderer, proposal import, preview/diff UI, visual regression suite, and
  revision-schema compatibility before the model is operational.
- Curating orthogonal components and useful examples is ongoing product work;
  quantity alone does not create a reliable bank.
- Not every theoretically possible component combination can be exhaustively
  tested. Admission rules, semantic validation, pairwise/constraint tests, and
  visual review remain required.
- The existing renderer-generation SDK must remain clearly labeled as the
  current reviewed-code path until it is replaced; it cannot silently become an
  automated publication path.

## Verification

`BE-004` proves the side-effect-free bank/proposal contract. Later linked
frontend, backend, and deployment specs must prove repository-only component
admission, schema-v2 compatibility, deterministic rendering, visual and
accessibility isolation, private import authorization, client-approved
publication, rollback, and provider privacy/failure boundaries before those
capabilities are described as current.
