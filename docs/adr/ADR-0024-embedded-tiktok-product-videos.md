---
id: ADR-0024
title: Official TikTok embeds for reviewed product videos
status: accepted
date: 2026-10-07
deciders: [Suqpage]
related: [ADR-0025, FE-060, BE-048, FE-057, BE-046, FE-050, BE-042, DEP-039, DEP-042, ADR-0023]
---

# ADR-0024 — Official TikTok embeds for reviewed product videos

Use the official TikTok /player/v1/ID iframe, wrapped by the existing installed
native WebView for product galleries. Keep covers on YouTube and preserve staff
approval. Store canonical provider IDs in existing media fields, not video files,
merchant iframe markup or extracted playback/CDN URLs. No new SDK or managed
service. Only active, explicitly played video mounts; 20-second bounded loading,
player-document load readiness plus strict message origin/source checks, error/retry, background cleanup and blocked
outbound navigation mirror the existing native video boundary.

Resolve TikTok short share links only in the staff approval adapter with exact
host allowlisting, bounded manual redirects and total timeout. Canonical URLs do
not require network resolution. Resolve outside database locks. Embed availability
depends on TikTok moderation/privacy/network policies; no playback guarantee or
TikTok business ownership verification. Provider fixtures are lifecycle evidence,
not real playback. Native fullscreen/playback remains a physical-device gate.

Research: https://developers.tiktok.com/docs/en/embed-player and
https://developers.tiktok.com/docs/en/embed-videos (checked 2026-10-07), plus
https://developers.tiktok.com/docs/en/display-api-overview confirms in-app WebView
embedding as a supported use case. Use Embed Player, not the Display API: no OAuth
account linkage/listing is required for a user-supplied public embed.
