---
id: FE-061
title: Category-relevant starter and multi-provider demo videos
status: in_progress
related: [BE-049, FE-046, BE-039, FE-060, BE-048, FE-050, FE-053, DEP-039, DEP-042]
owners: [product, frontend, backend, operations]
last_updated: 2026-10-07
change_level: L3
---

# FE-061 — Category-relevant video examples

## Problem

One developer-video default makes new business samples irrelevant and can fail
to communicate the intended cover/product media experience.

## Contract

New private starter pages and all three sample offerings use admitted example
videos selected from the business's declared category instead of a developer demo.
Reuse fictional category media/copy where needed so the sample remains coherent;
label it as an editable example, never as factual footage of that business.
No media network request occurs during signup. Preserve private preview, contact,
handle, city, accent and publication contracts. Existing edited stores are not
backfilled. Newly added offerings without a selected video receive that business's
category example. An owner-entered video is never silently replaced.

A one-time correction to explicitly marked demo stores supplies representative
TikTok/Facebook/Instagram/YouTube covers and product media, preserving photos,
gallery ordering, contacts, accents and IDs. Restrict updates to selected existing
example refs; skip conflicting/owner-edited media. Prepare target/ref review and
protected local backup before mutation. Local examples first; hosted changes need
separate exact review, backup and rollout. No permanent sync daemon or schema.

## Scenarios

GIVEN each valid category WHEN workspace initialization completes THEN cover and
sample products have coherent validated category video refs in draft/legacy/gallery
fields, remain private and survive reload. GIVEN reinitialization/foreign actor or
edited media THEN no overwrite. GIVEN selected demo correction THEN gallery and
published page references agree, non-demo content is unchanged and stale changes
abort. GIVEN portrait playback THEN one player uses existing soft static cover
fills, without duplicate audio/live-frame extraction.

## Test plan

Category table/ref/media admission tests, scripts/test-business-starters.ts,
product-upkeep/gallery and scoped one-time-plan checks. Focused desktop/phone and
Expo captures include at least one sample of each provider. Actual public playback
smoke is separate from deterministic fixtures; provider availability remains
external. Visual approval precedes full/release/acceptance/new APK publication.
Master §§7/8/9/11/13/15/18/19/22 affected.

## Rollout

Visual approval precedes full/release/workflow gates and web/API publication.
Review exact hosted demo targets and backup before any hosted data correction;
verify public catalog/published media and retained owner content afterward.
Native distribution follows the compatible web API and new artifact admission.
Rollback preserves content/history, with exact scoped media corrections only
after fresh version review. No automatic broad backfill or provider guarantee.

Owner-identified local Al Haya sample exception: its unchanged legacy developer
example ref M7lc1UVf-VE may be replaced with its declared category example while
all edited photos, copy, contacts and custom videos remain untouched. This is an
explicit named sample correction, not a general existing-customer backfill.

Local evidence: category table tests and real PostgreSQL starter/new-offering tests
cover all eight categories; `capture-category-videos.mjs` captures real local demo
catalogs with controlled provider frames on web/Expo and tests API-blocked loading
and error/retry. Separate live public embeds played all eight examples. The narrow
local backed correction updates three marked demo covers/galleries plus only the
unchanged Al Haya developer example. Protected local review folders hold actual
provider checks and before/after preservation proof. Full gates/approval/rollout
remain pending; no hosted change or new APK is claimed.
