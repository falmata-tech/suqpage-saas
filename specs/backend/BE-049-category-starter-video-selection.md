---
id: BE-049
title: Persist category-specific example videos atomically
status: in_progress
related: [BE-067, BE-047, BE-041, FE-061, BE-039, BE-031, BE-042, BE-048, FE-046, FE-050, DEP-039, DEP-042, ADR-0035]
owners: [backend, security, operations]
last_updated: 2026-11-15
change_level: L2
---

# BE-049 — Category example video selection

## S197 first-party demo admission

The finite correction path may accept an internal `demo:<slug>` reference
only for a reviewed `is_demo=1` business with a matching packaged asset and
source/license ledger. It maps to exactly `/videos/demo/<slug>.mp4` and never
to a caller-provided host or path. Generic owner product/page saves for real
businesses reject the internal ref. The ordinary correction's exact target,
version, gallery-image, page-publication, audit and simulator-fingerprint
guards still apply. The owner-entered social-provider contract is unchanged.

GIVEN an internal demo ref and a real business WHEN product or page upkeep is
attempted THEN the write is rejected with no partial catalog or page change.
GIVEN a demo ref with a missing or unapproved static asset WHEN an operator
prepares a correction THEN the request is not admitted. Source rights and
decoded web/Expo/Android playback are release gates, not DB metadata claims.

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

## S197 finite correction for two unenrolled legacy demos

Businesses 50 (`demo-dara-clay-works`, products 197–200) and 62
(`demo-wabi-bottled-water`, products 245–248) are marked public fictional
examples but have no simulator enrollment. A one-time first-party replacement
for these two may use the same disabled private request queue with a distinct
`unenrolled_media_correction` kind. It must not create an enrollment, change
scenario progress, or write directly to product/page columns.

Before queueing, inspect a selected-field before-image: exact business ID and
handle, content/draft/publication versions, cover URL, each
ordered gallery, current draft/publication coherence, and existing private-request
status. Retain that image outside the public repository. A pending request cannot
be overwritten; an existing accepted/rejected row may be rearmed only by a
separate guarded update after reviewing its status and the new input. The worker
processes the plan only while explicitly paused for operator maintenance and
keeps the normal accepted/rejected private receipt.

These two legacy showrooms have no linked client users. The private queue plan
derives one existing actor ID inside the database from the current draft updater
and latest publication publisher for both businesses: all four attributions
must name the same current `platform_admin` with legacy role `admin`. The
command declares `actorRole='platform_admin'` and binds that `actorUserId`.
Within the correction transaction, recheck zero linked users, the same page
attributions, current administrator authority, and that the actor is not the
configured private reviewer. Each ordinary product update carries a fixed
service note; page publication and audit records retain that actor's ID.

GIVEN either exact demo with no enrollment, the bound current admin authority, coherent
draft/publication, unchanged versions/before refs, and approved
first-party assets WHEN its queued plan runs THEN all four product galleries and
the page cover change in one transaction through ordinary product upkeep and
page publication. Images, order, product facts, page copy, contact fields,
discovery and category membership remain intact. Immutable catalog versions,
draft events, page revisions, product command receipts and a distinct media audit
are appended. The distinct audit includes internal before/after state digests.
An exact operation-key replay is inert.

GIVEN another business, a linked user, an enrollment, changed page actor,
revoked admin authority, private reviewer actor, stale state, pending location, changed
gallery, unapproved asset, active simulator, or a late product/page failure WHEN
the request runs THEN the correction is rejected without partial media/history
change. A rollback uses a new, reviewed inverse request with fresh versions and
before refs; it restores only the prior cover and four video
refs through the same ordinary publication path. Neither direction runs
automatically after an ambiguous hosted outcome.

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
The unenrolled legacy path maps its synthetic parser and queue-binding cases
to `scripts/test-demo-media-correction.ts`. A local synthetic disposable-
PostgreSQL test in ignored `.local/s197-unenrolled-media/` covers exact targets,
current admin/page attribution, service note, foreign/linked-user refusal,
private queue admission, stale-version refusal, late publication rollback,
replay, inverse rollback and cross-business isolation. No production payload or
database QA fixture is published with the operator source.

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
