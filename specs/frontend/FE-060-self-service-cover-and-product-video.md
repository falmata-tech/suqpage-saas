---
id: FE-060
title: Direct cover and product video links
status: in_progress
related: [FE-061, ADR-0025, BE-048, FE-057, FE-050, FE-040, FE-019, FE-053, BE-032, BE-042, DEP-039, DEP-042, ADR-0024]
owners: [product, frontend, backend, operations]
last_updated: 2026-10-07
change_level: L3
---

# FE-060 — Direct cover and product video links

## Problem and scope

Staff approval blocks owners who already publish their own videos. The owner's
newest instruction supersedes FE-057's cover restriction and the prior review-only
entry policy. Allow direct TikTok, YouTube, public Facebook videos and Instagram Reels in cover
and product editors on web/native. Save within existing owner version/tenant rules;
no support ticket or waiting for staff. Keep historical video requests readable.
A real public Instagram Reel embed exposes an inline video player in browser
research. Admit Reel links; reject Instagram photo posts, profiles and stories.
Native playback remains a separate device check.

## Scenarios

- GIVEN an authorized owner WHEN saving a supported cover/product link THEN retain
  it after reload with the other changes, without a video review or provider login.
- GIVEN a portrait TikTok video WHEN played THEN show one centered official player
  with the cover/photo softly blurred at the sides. No duplicate players/audio or
  extraction of live TikTok frames. The image is a static decorative fill.
- GIVEN a public supported video WHEN pressing Play THEN playback stays inline;
  missing/private/blocked videos show provider unavailable or bounded retry UI,
  never an external browser/app handoff. One active player; pause on exit/background.
- GIVEN invalid/foreign/stale/unsupported video input THEN show an actionable error
  and retain entered data/photos; no partial persistence/publication.
- GIVEN existing YouTube content and photos WHEN upgraded THEN preserve them;
  optional video clearing/removal and four-video ordering still work.

## Quality and contracts

BE-048 defines exact provider URL/ref allowlists, normalization and save contracts.
No merchant embed HTML, extraction, uploads, OAuth/feed API or new SDK. Playback
depends on provider permissions/network. A document load is readiness of the
player UI, not proof of successful media playback. Accessible localized labels,
loading/retry and fit at desktop/phone sizes. Do not tint the playing video.

## Test plan

`scripts/test-product-video.ts`, `scripts/test-owner-page.ts`,
`scripts/test-video-requests.ts`, `scripts/test-product-gallery.ts`,
`scripts/test-mobile-api.ts` cover validation/persistence/tenant/version compatibility.
`scripts/capture-direct-video.mjs` proves direct four-provider save/reload and
no support ticket on web/Expo. Focused existing video captures are updated for self-service entry, cover/product
inline selection, portrait fill and error/lifecycle with explicit provider fixtures.
Real public provider smoke is separate from deterministic tests and physical-phone
playback/fullscreen remains a release check.

## Rollout

S98 browser acceptance creates the two-photo/two-video product through the actual
owner media form and verifies persisted canonical refs, ordering, publication and
inquiry flow. It no longer asserts review-only video inputs or injects videos
directly into the fixture database; legacy staff video requests remain separately
tested for retained workflow compatibility.

No schema/credentials change. Web/API before new Android binary. Earlier artifacts
do not understand additional refs, so deploy and distribute together through
DEP-039/DEP-042; no new managed build without its artifact admission. Visual review
before full/release gates. Rollback preserves stored videos and history.
Master §§8/9/13/15/18/19 affected; S77 review-only/cover-YouTube rules are superseded.

Playback defect: a displayed/playing player must not be unmounted by a stale
startup timeout or an ancillary/nonfatal provider event. Listen for actual document
readiness and playback states from the trusted frame; preserve genuine media
errors and bounded initial failures. Test delayed readiness, playback beyond the
startup guard, end/pause/retry and ignored foreign/obsolete events with controlled
fixtures. Real sample playback is checked separately.

YouTube candidate: construct the official iframe with its sandbox before loading,
retain strict host/origin bridge checks and API errors, and treat iframe document
load/cued/playing/paused/ended events as readiness. Avoid applying sandbox flags
after onReady; do not require an API callback alone to keep a visible player alive.
Only documented terminal YouTube error codes become unavailable; private/deleted/
blocked videos still fail. M7lc1UVf-VE metadata loads but media buffering can depend
on provider/browser network; do not misreport a successful playback smoke.
