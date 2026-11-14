---
id: BE-049
title: Persist category-specific example videos atomically
status: in_progress
related: [BE-067, BE-047, BE-041, FE-061, BE-039, BE-031, BE-042, BE-048, FE-046, FE-050, DEP-039, DEP-042]
owners: [backend, security, operations]
last_updated: 2026-11-14
change_level: L2
---

# BE-049 — Category example video selection

## S197 planned finite correction for enrolled demos

Use the existing private, disabled-only simulator request mechanism for a finite
reviewed media correction. No new table, public endpoint, provider credential or
permanent media sync is required. Each exact request retains the reviewed owner/
provider/product membership and expected current catalog/draft/page versions,
plus canonical before/after cover and per-product video refs and an operation key.

Under the existing transaction/advisory lock, require disabled control, active
full-catalog enrollment, matching bound identity/membership, unchanged acknowledged
fingerprint and matching before refs/versions before any ordinary write. Reject
unrelated/unknown fields, foreign products, extra videos or changed galleries.
Execute ordinary validated product/media upkeep and owner-page save/publication;
never patch immutable snapshots or only the legacy fields. Keep existing photos
and gallery positions; replace only the reviewed video entries, adding one where
none exists. Reject a request whose gallery cannot be preserved within its limits.

Only after all writes pass may the same transaction acknowledge the new fingerprint
and update the baseline page's video URL. Preserve original stories/parameters,
stage/cycle/start/due/enrollment times, current selling facts, identities, contacts,
branding and effective images. Record a distinct finite media-correction audit;
it is not a simulator stage and consumes no stage slot. A failed late member/page
write rolls the entire correction back. Exact operation-key replay must be inert;
the existing accepted request is not authority to repeat a different correction.

GIVEN a paused, unchanged reviewed enrollment WHEN its correction commits THEN
ordinary catalog/page publications and all effective media agree and the next
scheduled stage continues without content_changed. GIVEN enabled control, stale
versions/hash, owner/product/demo drift, foreign targets or late failure THEN no
partial media/baseline/progress/history change occurs. Test those boundaries on
disposable PostgreSQL, retain protected before/after baselines and qualify source
before hosted application. Do not pause the running service during curation.

## S154 proposed selection correction — ready for root review

Use explicit product/category identity and known family context ahead of weak
incidental description matches. Unknown context yields an empty video ref; it
must not fabricate a metal or ceramics example. Preserve the existing string-ref
port so an empty selection creates no video media while image/content defaults
remain atomic. Category validation remains the workspace authority, with no
network request during selection or signup. Owner-entered media always wins.

Canonical seed, page-draft/live publication and product legacy/gallery references
are separate persistence locations. Changing the pure selector does not repair
existing data. Any one-time demo correction must compare all relevant current
versions/refs, preserve unrelated images/order/contacts/private accounts and real
businesses, and append normal publication records rather than silently editing
only one projection. Do not execute the existing broad apply-demo-process-videos
script as a shortcut. Root reviews the finite source closure before production
edits; this section does not qualify any database write.

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

S197 maps exact media-plan parsing to `scripts/test-demo-media-correction.ts` and
the real disabled-request, normal-publication, late-failure rollback, replay,
unchanged-progress and subsequent scheduled-stage cases to
`scripts/test-demo-catalog-postgres.ts`. External content/inline playback remains
the separate FE-061 review; test fixture provider IDs are not curated defaults.

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
