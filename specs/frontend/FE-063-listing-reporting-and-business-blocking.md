---
id: FE-063
title: Listing reports and business blocking
status: in_progress
related: [BE-051, DEP-044, FE-053]
owners: [product, frontend, security]
last_updated: 2026-10-09
change_level: L2
---

# FE-063 — Listing reports and business blocking

## Problem and scope

Public merchant catalogs need usable safety controls before Google Play review.
Add discreet Report and Block business actions to public web/native stores and
products, a manageable blocked-business list, and a real private web Reports
queue for support staff/admin. Reports are asynchronous; no guest help chat,
automatic suspension, pricing or carrier marketplace is introduced.

## Contracts and readiness

Report reason choices: Misleading listing, Prohibited goods, Abusive content,
Other. Details are optional, limited to 1500 characters. No email/account is
required. Preserve the request key through failure/retry; show Report received
only after persistence. Block is a public browsing preference on this browser/
installation, not an account authorization grant. Store at most 100 business
IDs with bounded display labels; allow unblock and clear. Do not translate
merchant names/handles. Existing UI style and five-language labels apply.

Map, product counts/pages, fuzzy matches, Featured businesses and business sponsor
cards respect blocking. Direct store/product links show a blocked state with
Unblock business instead of an active catalog. Private owner previews are unaffected.
No hidden generic support channel or privileged native management is added.
While stored preferences load, native Market and Featured must not briefly show
an unfiltered catalog. A preference change hides stale blocked cards until the
filtered projection arrives. All report reasons, including Other, have native
labels in the four non-English catalogs; reason values remain stable English API
values.

Blocking also clears this business's native inquiry basket and prevents direct
inquiry navigation until unblocked. It does not withdraw already submitted
inquiries or conceal public data from other visitors.

Readiness is met for this bounded capability under the owner's instruction to
finish Google Play requirements. Existing profile/discovery/inquiry flows remain.
Master §§11/13/15/16/17/22 will be updated after verified implementation; planned
behavior must remain explicit until visual and workflow evidence exist.

## Scenarios

GIVEN a public business/product WHEN a visitor reports it THEN a real private
staff report is persisted and a receipt is shown; retry does not duplicate it.
GIVEN an invalid/nonpublic/foreign product WHEN reported THEN reject safely.
GIVEN a blocked business WHEN browsing/searching/paging THEN it and its products
are excluded before count/page calculation; direct navigation offers unblock.
GIVEN blocked preferences WHEN restarted or unblocked THEN retain or remove the
preference consistently, without publishing it or changing business authority.
GIVEN a private preview WHEN opened by its owner THEN public block/report actions
cannot change the draft or prevent private editing.
GIVEN support staff/admin WHEN opening Reports THEN review, claim/assign and
resolve/dismiss work with server permissions/stale checks; transport staff and
business owners cannot read reports or reporter details.

## Test plan

scripts/test-catalog-safety.ts: real PostgreSQL report/assignment/stale/tenant/
rate/idempotency and search/pagination/fuzzy exclusions. Web/mobile typechecks,
localization and native rendering checks. Focused actual browser/mobile-preview
report/block/unblock/staff captures at desktop/390/320, then visual approval
before full check/release/acceptance gates. Physical/Play-delivered checks separate.

## Rollout

Deploy additive schema/API/web before the mobile build. Back up/rehearse migration
63 before hosted apply. Existing native versions continue without sending exclude
filters. Roll back clients/code without dropping private report records; no
automatic restore or unapproved production mutation. Track S99.1.

## Focused evidence — local only

2026-10-09: both typechecks, localization (all dynamic reason labels), native
rendering/build/app-link contracts and 187-spec validation pass. Real PostgreSQL
and HTTP evidence is mapped in BE-051. Actual browser workflows persist web/native
reports, retain blocking after reload, filter search/counts, unblock, prevent native
direct inquiry and clear its basket. Staff claim, visible-content resolution denial,
actual admin suspension and support resolution pass; transport staff are denied.

Protected .local/play-s99/safety-ui/ evidence.json, inquiry-block-evidence.json and
locale-evidence.json distinguish actual API workflows from locale-only captures.
Desktop plus 390/320 web/native-preview/staff states cover all five languages with
no browser errors or document overflow. Native evidence is a browser preview, not
an installed APK. The owner delegates visual acceptance. Full check, clean isolated web release,
11 browser acceptance workflows, operations and mobile build contracts pass.
Source commit, hosted migration/deployment and installed native rollout remain
separate gates; no new binary is claimed.

## Complete local gate evidence

2026-10-09: full repository check, isolated clean-install web release, all 11 browser
acceptance workflows, operations and mobile build contracts pass. Protected
receipts: .local/play-s99/gates/. Final privacy-only copy passes five-language
390/320 captures and localization/narrative/geography checks. No production
provisioning, actual customer erasure or Play-delivered install is inferred.
