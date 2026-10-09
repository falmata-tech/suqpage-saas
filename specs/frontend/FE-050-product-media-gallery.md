---
id: FE-050
title: Product media gallery
status: in_progress
related: [FE-061, BE-049, FE-060, BE-048, FE-041, FE-047, BE-042, DEP-039, FE-057, BE-046]
owners: [product, frontend, backend, operations]
last_updated: 2026-10-08
change_level: L3
---

# FE-050 — Product media gallery

## Problem

One cover and one video cannot show multiple product angles or demonstrations.
The change must preserve existing products, image privacy and inquiries.

## Scope and readiness

Owners can save up to eight images and four existing supported YouTube links per
product/service in one ordered gallery. No managed service or direct video upload.
The first image remains the cover used by search, cards and existing renderers;
legacy single-image/video records expand into gallery entries without backfill.
Images retain current verification/privacy/storage rules and the existing 5 MiB
combined upload budget per save (within the 6 MiB action envelope).

The editor allows adding/removing photos and video links, and moving entries.
The product viewer uses one horizontal scroll/snap strip, selectable thumbnails,
previous/next buttons and touch swiping. Video frames load only after explicit
play and unmount when no longer active. No separate hide-image/show-video mode.
Zero/one-item and broken-image states remain usable. Localize platform labels;
preserve product content. Respect reduced motion and phone widths.

## Scenarios and invariants

GIVEN a product form is starting or its save is still pending WHEN an owner tries
to choose/edit media THEN those controls remain disabled with the existing loading
feedback until the client form is ready. A pending response must not replace a new
selection made against the departing form. GIVEN an enabled picker WHEN a distinct
photo is selected and saved THEN its preview, persisted gallery and later edits
retain it; browser acceptance verifies the saved photo bytes, private object and
five-entry gallery count.

- GIVEN existing content WHEN upgraded THEN IDs, inquiries, covers and visibility
  remain; omitted legacy media commands preserve extra gallery entries.
- GIVEN mixed media WHEN saved/reloaded/published THEN order/removals survive
  catalog reads, version snapshots and revision conversion.
- GIVEN a gallery WHEN using thumbnails, arrows, keyboard or swipe THEN the
  selected media and thumbnail agree, with only the active video able to play.
- GIVEN hidden/draft/foreign products WHEN their extra image URL is requested
  THEN existing tenant/public permission rules also protect gallery images.
- GIVEN stale versions, invalid/oversized files, unowned references, invalid video
  links or failed writes WHEN saving THEN no partial product/media state commits
  and newly staged objects are discarded. Duplicate commands do not duplicate assets.
- GIVEN media reconciliation WHEN inspecting live or retained snapshots THEN all
  gallery image references remain protected from accidental cleanup.

## Test plan

Definition of Ready met: explicit bounds/format, backward compatibility, data
invariants, localization, tests and rollback; no unresolved provider decision.
Implement additive schema 49/media contract, upkeep and snapshot paths, editor
and gallery, then focused migration/security/browser checks and desktop/phone
review. After visual approval run full release/acceptance and operations gates.
Master §§7/8/9/10/13/17/19 will describe verified gallery behavior.

## Rollout

Implemented and deployed with schema 50 after owner visual approval and passing release gates.
No hosted migration before backup and reviewed additive SQL. Rollback application
keeps the new column/data (do not drop it); old code shows the retained cover/video.
Runtime native-artifact check DEP-026 remains mandatory for publication.

Focused evidence (2026-09-23): `test:product-upkeep` (including
`test-product-gallery.ts`), `test:revision-v4`, `test:media-reconciliation`,
`test:native-postgres`, typecheck and localization pass. Local migration 49 passes.
Browser coverage passes: `scripts/capture-launch-wiring.mjs`, including
1440/390/320, focused Axe, editor reload/reorder/remove, repeat save without
reupload, viewer arrows/thumbnails/keyboard/scroll/video switching, publication
and inquiry delivery to the local inbox. Captures inspected and visually approved; deployment verified below.

## Release evidence — 2026-09-23

Evidence: `docs/SUQPAGE-S28-RELEASE-2026-09-23.md` records source `90094c6`,
Netlify `6ab3c4e43c9a7f1e972648ad`, verified schema 50, protected backup and
rollback target. Full check, release, operations, nine production-mode acceptance
scenarios and exact-artifact Linux/privacy gates pass. Live public and gallery/
owner/handle/five-language wordmark checks and health monitoring pass. Existing
merchant content and demo account aliases are preserved; mail delivery and
external video playback are not asserted by the no-delivery live smoke.
