---
id: BE-049
title: Persist category-specific example videos atomically
status: in_progress
related: [BE-047, BE-041, FE-061, BE-039, BE-031, BE-042, BE-048, FE-046, FE-050, DEP-039, DEP-042]
owners: [backend, security, operations]
last_updated: 2026-10-07
change_level: L2
---

# BE-049 — Category example video selection

## Problem

Generic developer footage in every starter and new offering ignores the saved
business category and leaves examples incomplete or misleading.

## Contract

Select an admitted, deterministic example pack from the validated business category.
Store the cover/watch URL and product canonical refs in the existing signup/invitation
transaction and existing media_json/legacy fields. There is no runtime tenant-content
fallback or external request in this transaction. Reuse category validators,
registered fictional imagery and current media contracts. Optional preview About
location uses the canonical chosen city; do not claim imported footage belongs to
the shop. Newly created offerings without media video use the persisted declared
category to select the example; supplied owner media always wins.

## Scenarios

GIVEN all eight categories WHEN initializing signup/invitation THEN valid cover/
product category examples are persisted atomically. GIVEN retry, existing content,
foreign actor or failed write THEN no partial category/media/account overwrite.
GIVEN a reviewed one-time demo plan WHEN applied locally THEN only marked demos
with unchanged expected media are changed, preserving gallery images/order/IDs,
contacts/accents and existing private/live rules. No schema/permission change.

## Test plan

Category table, starter/invitation/rollback/privacy and product/gallery tests;
local one-time correction plan validation and before/after content projection.
Production backup/review/app/web gates remain separate. New accounts receive the
pack once; existing owner-edited records are never silently backfilled.

## Rollout

No schema migration; deploy compatible web/API after the focused and required
release gates, then distribute a newly admitted native binary. Hosted sample
media requires an exact reviewed plan and protected backup, with stale/edited
records skipped or rejected. Rollback retains owner records and reviewed history.

The named local Al Haya sample correction is limited to exact legacy example
video matches. Verify expected tenant/versions before write, retain a protected
media backup and preserve owner edits; stale plans abort. No hosted correction
is implied by a local sample update.

Focused persistence evidence: `test-business-starters.ts` verifies all eight packs,
new-offering fallback, persisted-category priority, no owner overwrite, private
account/location/content, foreign denial and atomic rollback. Other-category
integrity is mapped in BE-047/BE-041. Protected one-time before/after checks confirm
selected demo photos/copy/contacts/accents/IDs and private/live visibility survived.
No migration, hosted write or production completion is claimed.
