---
id: ADR-0025
title: Self-service public video embeds across four providers
status: accepted
date: 2026-10-07
deciders: [Suqpage]
related: [FE-060, BE-048, FE-057, BE-046, DEP-039, DEP-042, ADR-0024]
---

# ADR-0025 — Self-service public video embeds across four providers

The newest owner instruction supersedes staff review and YouTube-only covers.
Use canonical YouTube/TikTok/Facebook video IDs and Instagram Reel shortcodes
with constructed official iframe URLs. Reuse the installed isolated native
WebView, explicit play, one-active lifecycle, document-load readiness, strict
bridge/source/navigation checks and bounded unavailable/retry states. Do not load
external embeds on catalog cards. No vendor SDK, OAuth, oEmbed credentials,
download/scrape, arbitrary HTML or extracted CDN media is needed for these entered
public links. No Facebook share-token URLs, Instagram stories or arbitrary posts.

Portrait TikTok/Instagram embeds use one centered player with a softly blurred
static cover image behind it. Cross-origin video frames cannot be cloned for a
live moving fill; do not run duplicate players/audio or hide attribution. Provider
availability/privacy/embedding restrictions remain authoritative. Keep historical
support requests private; direct owner saves still obey tenant/version/image rules.

Research: TikTok Embed Player and Display API docs support iframe and in-app
WebView embeds; Facebook Help confirms public video embeds. Live public Facebook
documentation sample and a public Instagram Reel both expose actual video elements
without login in browser probes. This is narrower than a universal playback promise
or a native physical-phone test. Provider probe screenshots are private review
evidence, not bundled sample products or factual business media.

Sources checked 2026-10-07:
- https://developers.tiktok.com/docs/en/embed-player
- https://developers.tiktok.com/docs/en/display-api-overview
- https://www.facebook.com/help/search/?q=embed+a+video
- https://help.instagram.com/620154495870484 (documentation fetch blocked)
- Official public provider sample/player smoke recorded in local review evidence.

Deploy web/API parser and new native client together. No schema/secret changes.
Old applications may render unavailable for new references. Keep merchant data on
rollback. Instagram/Meta login-required/private posts are not supported. Native
release must verify playback/fullscreen separately from mocked lifecycle tests.
