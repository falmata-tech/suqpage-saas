---
id: DEP-046
title: Product-only demo correction and compatible rollout
status: in_progress
related: [FE-067, BE-056, DEP-034, DEP-038, DEP-042, DEP-044, DEP-045, BE-022]
owners: [operations, security]
last_updated: 2026-10-20
change_level: L3
---

# DEP-046 — Product-only demo correction

## S151 — hosted correction inventory (apply not approved)

The batch audit found the maintained product-only fixture correction was never
fully rolled out to the schema-77 MirtPage database. A fresh public DTO still
advertises Shewa's sharpening service; read-only marked-demo inventory finds 43
published canonical products retaining the retired service kind. Keyword hits
alone are not sufficient authority to rewrite a product (for example, a service
trolley is a tangible product).

Prepare exact field deltas from the previously reviewed S112 tangible-product
correction, matched to the current marked-demo handle/product identity and exact
before values. Do not blindly copy a local database or assume local/hosted IDs
and demo counts match. Preserve missing/deleted tenants, real businesses, private
reviewer publication state, media, contacts, ownership and historical versions.
Coordinate with DEP-045's contact repair so each changed current snapshot/version
is consistent. Protected before-images, drift guards, preservation/readback and
one exact hosted review are required before applying; no write is approved here.

### B05 — finite tangible-product preparation

The S151 correction must establish tangible product content, not merely replace
the retired `service` enum. Match each retained product to its marked tenant and
stable maintained offering slot after `smallScaleClient` and
`simplifyDemoOffering` have run. The two Netsa cloth/pad slots therefore resolve
to `standard_product`, not the obsolete raw factory kinds.

The owner-authorized fictional Kaffa correction replaces “Mill Shaft Rebuild”
with “Replacement Mill Shaft”, category “Mill parts”, kind `made_to_order`, and
description “A replacement shaft machined to the mill’s approved dimensions.”
Its related workshop copy describes physical parts, retaining the stable handle,
offering slot and matching shaft artwork. Categories that differ only in case
must not create duplicate names/slugs within that tenant.

The owner-authorized Orbit slot-1 replacement is “Analog Panel Ammeter”, category
“Instruments”, kind `standard_product`, with description “An analog panel meter
for compatible electrical equipment. Ask the workshop about the required range
and connections.” Its qualified illustrative analog-meter media stays intact,
and the existing tangible “Pump Hour Counter” remains unchanged. Each tenant's
proposed product names must stay unique rather than copying a duplicate from a
different maintained slot.

The proposed hosted delta clears image/media references only for the eleven
visually rejected replacement slots: Lume 1–2, Tana 1–2, Desta 1–3, Orbit 2,
and Bale 1–3. Preserve saved files and use existing honest no-image placeholders;
do not clear unrelated images or present mismatched service equipment as a
replacement product photograph. The matching Kaffa shaft image stays intact.

- GIVEN a replacement needs a category THEN reuse the exact tenant-owned name
  or unambiguous case-equivalent category first; otherwise propose a finite
  reviewed rename/split/create tied to that tenant, with no copied local IDs.
- GIVEN a product-only proposal THEN its canonical rows, existing draft and
  latest published profile/catalog must agree on the reviewed delta; preserve
  unrelated copy, contacts, media and every historical version. Never publish
  the private reviewer or leak an unsaved draft into an existing public page.
- GIVEN a changed source fixture THEN a focused pure regression must verify the
  tangible authored product, actual simplified kinds, stable slot and category
  identity. Preparation is not an apply, rollout, visual approval or full gate.

The S151 finite proposal passes17 content and8 post-B04 composition cases. Its
scratch-only candidate additionally passes87 pure operation/negative cases and
one successful, explicitly reviewed local SQL retry. The first SQL run caught
bigint strings in the driver before-image being compared against JSON numeric
values. Read-only diagnosis confirms the difference on all four update-table
types and absence of the failed scratch schema. The corrected SQL types the
complete before record through its own table composite; unrelated non-key field
changes still reject. Strict JS before qualification, versions, affected-row
counts and complete after/history/outside-row checks remain intact.

The qualified local retry allocates its category from a scratch-owned sequence,
binds it only at the approved Lume product/catalog references, and proves exact
after-state, immutable history/unpublished reviewer, no-op refusal, real foreign
key rollback, complete-record/version/B04-prerequisite/outside-table refusal,
then unconditional rollback. All74 existing local table fingerprints and public
sequence values remain unchanged; the scratch schema and sequence disappear.
The pre-mutation hash-only baseline is retained. Receipts are protected under
`s151-batch-audit/demo-repair-preparation/`; preserve the initial failed attempt
separately. This is projected-post-B04 local qualification, not an actual B04
hosted receipt, customer-data recovery, full gate or production apply. The
candidate refuses public schema and exposes no hosted apply mode. A separately
prepared hosted operation still needs actual B04 completion/readback, fresh exact
target/before-state qualification, source review and owner approval.

A separate ignored, pure hosted draft builder passes78 model cases. It rejects
missing or failed actual B04 success, a delta outside B04's reviewed timestamp
shift, and missing/stale/mismatched post-B04 target, TLS, actor, table, privilege
or typed-state evidence. Its runtime preview permits only71 explicit operation
timestamps and the three references bound to the returned category identity.
All positive cases remain labelled model-only with `applyReady:false`; the
builder has no credential, network, SQL or apply port. Pure metadata does not
establish genuine provider/file provenance. No actual hosted plan was produced;
independent runtime qualification, a reviewed guarded executor, exact owner
approval and monitored execution remain required. Evidence:
`s151-batch-audit/demo-repair-preparation/b05-hosted-draft-preparation-result.json`.

## Problem, scope and safety

S112 authorizes product-only implementation and audit/correction of marked demo
content. This is a one-time local correction plus maintained source fixtures,
not a permanent synchronization service or permission to rewrite real businesses.
No hosted write, new APK/AAB or deployment is included. Preserve all earlier
S107–S111 pending review gates and user-owned worktree changes.

## Scenarios

- GIVEN demo source fixtures/starters THEN list tangible products only, retain
  made-to-order kinds instead of flattening manufacturing work into services,
  and replace genuine diagnostics/repair visits with plausible physical products.
  Media must match the product or remain honestly illustrative; no invented real
  product photograph/certification claim. Retain stable demo IDs/handles.
- GIVEN a local correction WHEN it is applied THEN verify loopback account/database/schema target,
  save protected exact before-images, admit only reviewed is_demo IDs/names and
  published/draft catalog snapshots, and stop on drift. Preserve private login
  aliases, ownership, fake public contacts, GPS, real tenants and chat/inquiry data.
- GIVEN correction success THEN prove exact changed fields, public counts and
  product supply modes, replay/no-op behavior, and unchanged excluded rows.
  Keep a protected rollback plan; do not automatically restore on ambiguity.
- GIVEN previously released clients THEN fail retired service writes safely and
  keep historical storage readable. Code rollback does not delete retained kinds
  or restore unsafe real contact targets. Any future hosted correction requires
  its own exact target/backup/review and monitored verification.

## Test plan and rollout

Focused fixture/product-only/tenant tests, typechecks, localization/spec checks
and actual five-language desktop/phone/Expo workflows precede visual approval.
Then run applicable check/release/acceptance gates before a reviewed task commit
or separately authorized rollout. Definition of Ready is met; existing kinds
support the behavior without a migration or provider change. Prepared Play/social
copy follows product-only wording; previously published graphics/binaries are not
claimed updated by source changes alone.

Mapped tests: `scripts/test-simple-demo-seed.ts`,
`scripts/test-demo-physical-fixtures.ts`,
`scripts/test-business-starters.ts`, `scripts/test-category-starter.ts`,
`scripts/test-product-only-catalog.ts`, localization/narrative checks and protected
one-time correction receipts plus actual local desktop/phone/Expo captures.
