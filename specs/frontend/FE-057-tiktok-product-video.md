---
id: FE-057
title: Embedded TikTok product videos
status: in_progress
related: [ADR-0025, FE-060, BE-046, FE-050, FE-019, FE-053, DEP-039, DEP-042, ADR-0024]
owners: [product, frontend, backend, operations]
last_updated: 2026-10-07
change_level: L3
---

# FE-057 — Embedded TikTok product videos

## Problem and scope

Owners already upload product demonstrations to TikTok. Allow approved public
TikTok videos alongside YouTube in the existing product/service gallery, on web,
mobile web and native Android/iOS. Showroom cover videos remain YouTube-only.
Keep existing staff review, four-video limit, photos, inquiries and visibility.
No video uploads, downloads, TikTok account linking, feed or autoplay scrolling.

## Scenarios

- GIVEN a saved product WHEN its owner requests a public TikTok video and assigned
  staff approve it THEN the persisted gallery includes the video after reload.
- GIVEN an approved TikTok gallery entry WHEN the visitor presses Play THEN the
  official player opens inline; it never launches TikTok or an external browser.
- GIVEN an inactive gallery entry or backgrounded/native unfocused screen WHEN
  playback is active THEN its player unmounts and stops.
- GIVEN a missing, private, blocked or deleted video WHEN loading fails or exceeds
  20 seconds THEN show Video unavailable and Try again; photos/inquiries still work.
- GIVEN a product video request WHEN staff review it THEN Video link accepts
  TikTok or YouTube; header review still accepts only YouTube.
- GIVEN guest navigation WHEN rendered THEN Inquiries remains absent; this feature
  does not alter the FE-056 sign-in rule or existing Profile work.

## Quality, contracts and observability

BE-046 defines canonical references and approval boundaries. Use an isolated
iframe/WebView, constructed URLs, no merchant HTML, tokens, cookies or arbitrary
navigation. Mount only after Play; one active player. Portrait TikTok content fits
the existing stage without stretching. Localize generic Video link/Video labels;
retain TikTok as a brand. Accessible play/retry/status controls and loading bar.
Loading readiness means the player document loaded, not proof of playable media;
use its load event as well as authenticated provider events because TikTok can
render a usable paused player without emitting onPlayerReady. Provider availability
is not guaranteed. Error state is visible; no video/source
URLs or account/customer information in logs. No new SDK dependency.

## Test plan

`scripts/test-product-video.ts` covers normalization/navigation/message contracts;
`scripts/test-video-requests.ts` covers real persisted approval, isolation, bypass,
header restriction and preserved snapshots; `scripts/capture-tiktok-product.mjs`
covers desktop/phone and Expo gallery lifecycle/error/retry with a clearly marked
provider fixture. Actual third-party playback is a separate manual device check.
## Rollout

Types/localization/spec validation precede visual approval. Full/release gates and
web/native publication follow approval. DEP-039/DEP-042 control rollout; old apps
cannot render TikTok, so deploy web/API before distributing the rebuilt app.

## Readiness

Scope, contracts, failures, privacy/accessibility/localization, mapped tests,
reciprocal links and rollback are explicit; no unresolved product decision.
Master §§8/9/13/15/18/19 affected. Earlier Profile/loading steps stay active.
