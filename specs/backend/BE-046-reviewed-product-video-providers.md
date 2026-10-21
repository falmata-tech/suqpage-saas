---
id: BE-046
title: Reviewed TikTok and YouTube product references
status: in_progress
related: [ADR-0025, BE-048, FE-050, FE-057, BE-042, BE-018, BE-044, DEP-039, DEP-042, ADR-0024]
owners: [backend, security, operations]
last_updated: 2026-10-07
change_level: L3
---

# BE-046 — Reviewed TikTok and YouTube product references

## Problem

Product demonstrations already on TikTok should be reusable without a second
upload or weakening the existing tenant/staff approval boundary.

## Contract and scope

Product media admit `youtube:<11-character ID>` or `tiktok:<17–20 digit ID>`.
TikTok normalization accepts HTTPS exact www.tiktok.com/tiktok.com canonical
/@handle/video/ID or /player/v1/ID URLs, strips tracking parameters and rejects
credentials, ports, profile/photo URLs, malformed IDs and lookalike hosts.
Existing `youtubeUrl` review input remains compatible; a new `videoUrl` alias
supports either provider for product targets only. Canonical IDs remain under
the existing 40-character bound and existing PostgreSQL text/JSON columns.
No migration. Header fields, composition video assets and processVideoRef stay
YouTube-only. Normal owner saves cannot bypass staff approval.

## Short-link adapter

TikTok /t/ and vm/vt.tiktok.com share URLs resolve only during explicit staff
approval. The adapter receives a bounded HTTPS TikTok URL, follows at most four
manual redirects across exact TikTok hosts with one five-second total timeout,
and normalizes a full video URL before storing it. Reject all other destinations;
never fetch merchant-selected arbitrary hosts, response bodies or metadata.
Inject a narrow redirect-fetch contract for deterministic security tests.
Resolve before opening the database transaction/locks. Failures leave the
pending request and public video unchanged. No credentials, provider login or
application identity is forwarded. No client-time resolution or catalog fetches.

## Scenarios

- GIVEN a pending own-product request WHEN assigned staff approve a supported
  URL THEN one canonical reference is saved atomically with unchanged product
  fields/photos/listing and history; duplicate review remains idempotent.
- GIVEN a foreign owner, unassigned agent, changed baseline or unsupported URL
  WHEN submitting/approving THEN deny safely without updating any public media.
- GIVEN a header request WHEN a TikTok URL is approved THEN reject; the header
  and draft/public content remain unchanged.
- GIVEN approved TikTok media WHEN an owner edits unrelated fields or snapshots
  round-trip THEN retain it; new forged refs are rejected by existing review policy.
- GIVEN short redirects to local/external/lookalike hosts, a loop or timeout
  WHEN resolving THEN no unsafe fetch or write occurs.

## Test plan

Unit input/output and adapter tests: `scripts/test-product-video.ts`.
Real PostgreSQL review/security/snapshot tests: `scripts/test-video-requests.ts`.
FE-057 browser fixtures verify public players. Full gates require visual approval.
Safe logs contain only operation/status, never source URLs or provider responses.
## Rollout

No schema/Auth/storage write is needed. Keep TikTok records on rollback; old apps
cannot play them. Roll back approval intake first and serve a safe unavailable
state where possible rather than deleting merchant data. New native binary rollout
is separate from web/API rollout and follows DEP-042 artifact admission.
