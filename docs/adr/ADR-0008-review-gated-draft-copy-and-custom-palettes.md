---
id: ADR-0008
title: Review-gated draft copy and custom showroom palettes
status: accepted
date: 2026-07-29
deciders: [MirtPage]
related: [FE-007, FE-009, BE-008, BE-010, DEP-007, DEP-009, ADR-0005, ADR-0007]
---

# ADR-0008 — Review-gated draft copy and custom showroom palettes

## Context

The initial recipe contract treated exported source facts and admitted token
packs as import authority. That reduced factual and color risk, but it also made
private draft creation depend on complete intake data and constrained every
showroom to a small set of preselected color combinations. MirtPage already has
an authorized private revision, staff editing, client review, approval, and
manager publication boundary.

## Decision

- Private AI recipe imports may contain bounded provisional written content
  without source-fact references. Provenance remains optional reviewer metadata,
  and malformed references still fail when supplied.
- Recipe questions and warnings are review notes, not private-import blockers.
- Client approval and authorized publication, rather than source completeness,
  are the authority boundary for written draft content.
- Provider media and tenant assets remain separately admitted. Recipes still
  cannot invent URLs, markup, files, provider IDs, or cross-tenant references.
- A design-v2 manifest may select an admitted token pack as its non-color
  foundation and optionally override its complete color-role set with a custom
  six-digit-hex palette.
- Custom palettes are declarative data, not arbitrary CSS. Exact keys, values,
  size, and readable foreground/background pairs are validated before storage.
- Each canonical section may independently select any admitted semantic surface
  role. The canonical information order remains fixed; color rhythm is reviewed
  in preview instead of enforced as one universal sequence.
- Staff can edit or remove a custom palette, change section surfaces, and edit
  all provisional copy in the private revision editor.

## Consequences

- Incomplete intake no longer prevents a useful first visual draft.
- AI and staff can explore brand-specific color directions without adding token
  packs or writing component code.
- Human review carries greater responsibility for truthfulness and visual
  judgment before publication.
- Accessibility, schema safety, tenant isolation, media authority, component
  compatibility, revision immutability, and publication authorization remain
  automated boundaries.

## Verification

`BE-010` covers parser and persistence behavior, `FE-009` covers the focused
editing experience, and `DEP-009` covers contrast, browser, and rollout gates.
