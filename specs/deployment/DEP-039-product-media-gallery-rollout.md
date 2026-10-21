---
id: DEP-039
title: Product gallery compatibility rollout
status: in_progress
related: [FE-061, BE-049, ADR-0025, FE-060, BE-048, DEP-040, FE-050, BE-042, DEP-026, FE-019, BE-018, BE-032, BE-040, FE-057, BE-046, ADR-0024]
owners: [product, frontend, backend, operations]
last_updated: 2026-09-27
change_level: L3
---

# DEP-039 — Product gallery compatibility rollout

## S48 — staff-reviewed showroom and product videos (in progress)

Owner requested this before the approved S43 publication. Normal page/product
saves may keep existing videos or the platform example, but cannot introduce an
unreviewed video. New offerings and new page headers use the current starter
example. Existing customer/demo videos are preserved, not bulk replaced.
GIVEN an owner requests a header/product video THEN accept an HTTPS source link
and optional note, bind a support ticket to the canonical business/target, and
keep current/example media public until review. The platform does not download or
upload videos; a supported YouTube video from any channel may be approved.
GIVEN the assigned support agent or manager reviews the ticket THEN approve a
normalized YouTube link by entering its URL and choosing Approve video, or
decline with a reply. Channel ownership and configuration are not prerequisites. Approval changes only that target's video, records
the reviewer and audit, and informs the owner in the existing support thread.
Product galleries keep photos/order and approved additional videos (maximum four);
the starter example is replaced on first approval. Header approval changes only
video fields in draft and current publication, preserving other saved/unpublished
content and respecting business suspension. Duplicate approval is harmless;
changed target videos, deleted targets, foreign owners, unrelated staff, wrong
targets and forged normal-save video refs fail closed. Staff make the approval decision; the platform does not claim automated
channel ownership verification.

L3 FE-019/BE-018/BE-032/BE-040/DEP-039. Add a server-only RLS-protected support
video request table at migration 58; private source URLs and reviewer details are
never public. Approval is manual, not an automated YouTube integration. URL input is validated and never fetched by the server. Reuse owner
support assignment/reply workflow and transaction boundaries. Master public media,
owner publishing, support workflow and schema statements are affected.

Ready: no new external provider, direct upload or arbitrary-video bypass; current
example stays the default. No official channel or channel configuration is
required: valid YouTube links from any channel are eligible for staff approval. Test forged writes, tenant/agent isolation,
replay/stale target, exact-field preservation and default media; then phone/desktop
workflow review and refreshed S43 release/migration/backup rehearsal gates. Retain
additive request data on rollback; never restore unrestricted owner video entry.

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

S48 local evidence: `scripts/test-video-requests.ts`,
`scripts/test-business-starters.ts`, `scripts/test-owner-page-postgres.ts`,
`scripts/capture-video-requests.ts` pass; see S48 in TRACEABILITY.md. Real forms
cover submission, invalid-link recovery, assignment, approval without channel configuration,
decline/reply and preserved default at phone/desktop widths. Schema 58 is deployed. The owner approved S48 visuals and publication on 2026-09-27.
Complete check, release, operations and all 11 browser workflows pass. Exact artifact,
live routes/mobile/map/buying entry and health checks pass. See
`docs/SUQPAGE-RELEASE-2026-09-27.md`, including the initial edge-502 incident and recovery.
