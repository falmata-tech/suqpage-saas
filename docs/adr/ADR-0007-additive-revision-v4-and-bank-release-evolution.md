---
id: ADR-0007
title: Additive revision v4 and immutable multi-release showroom banks
status: accepted
date: 2026-07-24
deciders: [SuqPage]
related: [FE-007, FE-009, BE-008, BE-010, DEP-007, DEP-009, ADR-0005, ADR-0006]
---

# ADR-0007 — Additive revision v4 and immutable multi-release showroom banks

## Context

The verified recipe checkpoint writes stockless revision v3 and renders the
immutable `showroom-bank@1.1.0`. Completing typed section content, controlled
video, focused corrections, and a larger creative bank changes durable content,
design, media, CSP, and renderer contracts. Replacing v3 or mutating bank 1.1 in
place would make retained previews and rollback non-reproducible.

## Decision

- Keep revision v1/v2/v3 recovery readers and `showroom-bank@1.1.0` immutable.
- Add revision v4 with content-schema v2 and design-schema v2. New recipe writes
  use v4 only after DEP-009 admission; older revisions are never rewritten just
  to adopt the new shape.
- Resolve component banks by exact allowlisted release. Bank 1.1 remains
  available for pinned retained revisions; bank 1.2 becomes the default only for
  newly admitted v4 work.
- Content-schema v2 adds strict discriminated section blocks for hero, story,
  highlights, information/trust, call to action, and controlled video. Design
  sections bind compatible blocks and named media slots by stable opaque keys.
- Bank 1.2 reuses old component IDs only with identical contracts and behavior.
  Changed behavior receives a new component ID/version. New motion and
  interaction choices are bounded enums implemented in reviewed CSS.
- Initial YouTube support accepts only server-normalized provider IDs and uses a
  reviewed privacy-enhanced renderer. No recipe URL, markup, script, autoplay,
  remote image, or arbitrary provider becomes render authority.
- Focused corrections are typed application commands over mutable private v4
  drafts. Every command reauthorizes, revalidates the complete content/design
  pair, records attribution, and cannot submit, approve, or publish.
- Creative expansion favors art direction, editorial pacing, tactile surfaces,
  progressive disclosure, and short transform/opacity effects. It adds no
  animation dependency or scroll listener; static fallback and
  `prefers-reduced-motion` are mandatory.

## Consequences

- Retained previews, publication, and rollback stay reproducible.
- Migration and rendering code must support multiple schema/bank releases.
- Bank 1.2 and v4 require explicit compatibility, operations, browser, mobile,
  accessibility, CSP, and rollback gates before default enablement.
- More combinations do not weaken review: registry parity, content/media
  compatibility, pairwise fixtures, and visual laboratory review remain gates.

## Verification

FE-007/BE-008/DEP-007 complete the recipe behavior. FE-009/BE-010/DEP-009
control creative bank 1.2 and the additive v4 rollout. Completion requires all
mapped automated evidence and living-product documentation to match reality.
