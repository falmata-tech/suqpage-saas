---
id: ADR-0018
title: One business profile with optional staff assistance
status: accepted
date: 2026-09-13
deciders: [product, engineering]
related: [FE-040, FE-041, BE-032, DEP-030, ADR-0019]
---

# ADR-0018 - One business profile

## Context

The owner approved expanding Suqpage into Suqpage for product sellers beyond
local production and moving routine page creation from staff to customers.
Customers may choose staff assistance. Existing business content, identities and
publication history must remain intact throughout the renderer transition.

## Decision

Use one standard business profile, not a set of starter templates. The owner
explicitly simplified the direction on 2026-09-13: Products, About with optional
business/process video, introduction and cover, and the existing inquiry cart.
The latest refinement uses the hero image as the video poster, followed by
name/logo, one About description and products, then a distinct optional contact
section. The
editor no longer offers an introduction or cover-style choice. Existing stored
intro/style values remain compatible; About takes precedence, with intro-only
content as a fallback. Reuse catalog
and cart callbacks directly without manufacturing a design manifest. Category
describes inventory, not layout or whether the seller makes the products.
Customer drafts are tenant-owned,
not fabricated service requests. Owners retain consent and publishing authority;
staff edits require revocable permission, scoped access and actor attribution.
First-time marketplace moderation is separate from normal editing. Appearance
changes must not rebuild canonical products. The owner's subsequent instruction
standardizes every public page and regular preview on this profile, using current
canonical content when no owner snapshot is published. Managed design history is
retained for audit and release rollback, not selected by the public renderer.
Optional staff help uses the same simple
profile form, not a separate design process.

FE-041 refines the shared product section into a linkable `?product=<id>` view
using canonical tenant products. Single-product inquiry is independent of saved
group selections. Configured public messaging links prepare drafts; only the
explicit Suqpage send action invokes the existing inquiry application boundary.
This introduces no delivery provider, product snapshot or persistence migration.

The shared renderer supersedes the managed-only design philosophy; the owner
editor remains gated. This does not change existing authorizations or deployed
behavior. No provider identity/credential change follows from a public rename.

## Alternatives

Granting client accounts staff roles would leak unrelated powers. A template
for every industry would multiply visual maintenance and poorly fit mixed shops.
A general drag-and-drop/AI code builder adds unnecessary freedom and risk.

## Consequences

Reuse catalog, rendering, inquiry, storage and versioning boundaries. Add the
small owner-draft/consent contract, a focused editor, and later owner publication
and marketplace review. Existing page identities and records are preserved.

## Verification

BE-032 negative authorization/concurrency tests, FE-040 desktop/mobile review,
and DEP-030 isolated-provider and rollback evidence. Track implementation and
approval separately in the active checklist.

S2g contact boundary (FE-040/BE-032): canonical public email/phone supply baseline
page contacts; an owner-published contact object remains authoritative, including
explicitly empty values. Private account phone belongs to the authenticated user,
not the business profile or session payload. Existing account email remains
identity authority; notification email remains server-only. Migration 41 adds
empty-compatible columns without deriving public values from private data.
