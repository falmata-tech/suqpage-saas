---
id: BE-048
title: Owner-controlled canonical video references
status: in_progress
related: [FE-061, BE-049, ADR-0025, FE-060, BE-046, BE-032, BE-041, BE-042, BE-044, FE-050, FE-019, DEP-039, DEP-042, ADR-0024]
owners: [backend, security, operations]
last_updated: 2026-10-07
change_level: L3
---

# BE-048 — Owner-controlled canonical video references

## Problem and contract

An authenticated owner may directly save their own cover/product video, as the
newest owner instruction replaces staff admission. Supported refs remain bounded:
YouTube 11-character IDs, TikTok 17–20 digit IDs, Facebook 5–25 digit video IDs and Instagram Reel 5–20 character shortcodes.
Accept only HTTPS exact provider hosts/canonical watch/video/reel forms; strip
tracking. Header profile stores a normalized provider watch URL; galleries store
canonical refs. Legacy fields and snapshots preserve these values. Recipe asset
admission remains separate; no new privileged composition assets are granted.
Short TikTok share links normalize via the existing bounded adapter on save, outside
DB locks, without tokens/body scraping. Unknown shares/unsupported providers fail
clearly. No arbitrary redirects/iframes; Instagram admission covers public Reels only, not arbitrary posts.

## Scenarios

- GIVEN a current tenant owner and supported video WHEN saving the page/product
  THEN persist atomically and publish according to the existing private/live page
  rules, without support review. Foreign/stale/suspended requests still fail closed.
- GIVEN a provider-lookalike, credentials, unsupported path, forged media or failed
  normalization WHEN saving THEN no partial content/media changes are committed.
- GIVEN an existing reviewed video WHEN retained/reordered THEN preserve it; old
  support tickets/history remain private and old reviews obey baseline conflicts.
- GIVEN persisted cover/gallery snapshots WHEN validated/loaded THEN compatible
  canonical refs round-trip; business identity, contacts/photos and visibility stay.

## Test plan

`scripts/test-product-video.ts` maps provider/short-link/security contracts;
`scripts/test-owner-page.ts`, `scripts/test-mobile-api.ts`,
`scripts/test-product-gallery.ts`, `scripts/test-video-requests.ts` map real saves,
privacy/version/retained history and no new staff gate. FE-060 browser/native
captures cover actual UI entry/reload/inline display. No source URL/customer data logs.

## Rollout

No migration/Auth/provider credentials. Publish canonical parser/API/web before a
new admitted native build. Old apps may show unavailable for new providers; do not
delete stored merchant video data on rollback. Visual approval/release gates remain.
