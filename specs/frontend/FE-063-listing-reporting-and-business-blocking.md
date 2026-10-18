---
id: FE-063
title: Listing reports and business blocking
status: in_progress
related: [BE-051, DEP-044, FE-049, FE-053]
owners: [product, frontend, security]
last_updated: 2026-10-10
change_level: L2
---

# FE-063 — Listing reports and business blocking

## S134 — discreet anonymous safety controls (ready)

The owner questions account-style blocking for anonymous visitors and requests
research plus removal of internal/redundant UI explanations. Google's public-UGC
policy requires in-app reporting and blocking even when the reader has no account:
https://support.google.com/googleplay/android-developer/answer/9876937 . Merchant
catalogs are contributed public content; retaining these controls is the relevant
application of that rule, not a claim of individual review approval. No login is
required and blocks remain visitor-browser/device preferences, not merchant bans.

1. GIVEN a public showroom/product THEN show one quiet, labelled48px Listing
   options action rather than separate Report/Block/Blocked list controls across
   the page footer. It opens a bounded accessible dialog/Sheet with Report and
   Block business actions and management of existing blocks. Report continues
   through the existing form; never require an account or open two modal layers.
   Actual-Chrome refinement, Ready before correction: the web safety footer sits
   outside the runtime-root that receives the floating dock's measured clearance.
   At the real maximum phone scroll its48px entry is still behind the transport
   button. Reserve that existing measured CSS clearance after the footer action
   too, so ordinary scroll exposes its whole hit target. Do not move the dock,
   alter business content or weaken click-hit verification. Regress the actual
   max-scroll entry→options→report/cancel/block/unblock workflow on phone web.
   The focused700px regression also proves the dock's720px breakpoint precedes
   the shell's680px bottom reserve. In that681–720px interval, add the same64px
   mobile reserve already used by the runtime-root (plus safe-area inset); retain
   the provider-measured height, five-point hit test and ordinary max scroll.
2. GIVEN an existing block THEN preserve content/contact/discovery suppression,
   clear Unblock and saved-list recovery. Cancel changes no preference/report.
   Persistence failures stay visible/retryable and do not falsely claim success.
   No report/blocked-list permission or backend/retention change is introduced.
3. Review affected public browsing/contact/intake and account copy for internal
   implementation comments, redundant demo notices or excessive explanation.
   Remove only proven unnecessary user-facing text; keep actionable clipboard/
   connection recovery, privacy/consent, stock honesty and private preview state.
   Code comments are not UI text. Record what was found rather than inventing
   defects or deleting useful guidance wholesale. Use FE-049 active en/am/om
   wording and preserve literal merchant data.

Ready: existing anonymous cookie/device storage, report form, bounded modal,
current localized Listing options/Report/Block labels, policy and safe rollback
are known. FE-053 controls native parity, BE-051 report security is unchanged;
Master §§18/19/22 affected. Plan: consolidate controls → focused actual-source
open/report/cancel/block/unblock/failure tests plus inherited report security →
actual Chrome web/Expo journey with isolated visitor preferences → visual approval
before full/commit/rollout. No schema/provider/dependency or hosted write.

## Problem and scope

Public merchant catalogs need usable safety controls before Google Play review.
Add discreet Report and Block business actions to public web/native stores and
products, a manageable blocked-business list, and a real private web Reports
queue for support staff/admin. Reports are asynchronous; no guest help chat,
automatic suspension, pricing or carrier marketplace is introduced.

## Contracts and readiness

Owner-approved catalog policy prohibits violent imagery, nudity and sexually
explicit content, and age-restricted goods/services including alcohol, tobacco,
nicotine/vaping products, weapons, recreational drugs, gambling and adult goods
or services. Ordinary tools and lawful everyday goods are not classified as
weapons merely because they have sharp edges. Public Terms state the rule in all
five languages; existing native Terms links open that same hosted page.

This is a prohibition enforced when violations are found, not a claim that all
uploads are automatically scanned or reviewed before publication. Existing
Prohibited goods / Abusive content reports reach support; administrators use
authorized catalog controls to unpublish/remove content. Support resolves only
after actual removal. Existing permission/assignment/version checks stay intact.
The owner confirms alcohol/tobacco are prohibited and removed when found after
noting that actual seller listings may otherwise be unknown. Do not declare their
absence from the current catalog without a bounded actual-content review.

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
GIVEN a visitor or owner in any supported language WHEN opening Terms from web
or the existing Android link THEN see the prohibited-content/goods policy and
report/removal process without a promise of automatic screening.
GIVEN a prohibited-goods or abusive-content report WHEN staff handles it THEN
preserve the existing scoped claim/assignment and actual-removal-before-resolution
rules; a policy update does not grant broader business-edit or transport access.

## Test plan

scripts/test-catalog-safety.ts: real PostgreSQL report/assignment/stale/tenant/
rate/idempotency and search/pagination/fuzzy exclusions. Web/mobile typechecks,
localization and native rendering checks. Focused actual browser/mobile-preview
report/block/unblock/staff captures at desktop/390/320, then visual approval
before full check/release/acceptance gates. Physical/Play-delivered checks separate.
S99.4 additionally verifies actual Terms rendering in five languages, Android's
existing canonical Terms link, public catalog review limitations and real
Prohibited goods / Abusive content report persistence under existing authorization.

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
Source commit and hosted migration/deployment now pass as recorded below.
Installed native rollout remains a separate gate; no new binary is claimed.

## Complete local gate evidence

2026-10-09: full repository check, isolated clean-install web release, all 11 browser
acceptance workflows, operations and mobile build contracts pass. Protected
receipts: .local/play-s99/gates/. Final privacy-only copy passes five-language
390/320 captures and localization/narrative/geography checks. This local evidence
does not infer actual customer erasure or a Play-delivered install; verified
hosted evidence is recorded separately below.

## Verified hosted web/API phase — October 9, 2026

Source ea1b452 / Netlify 6ac98a227b9a61a7dad27116 deploys web report/block controls
and the compatible native API. Private schema 63 and original-record preservation
pass protected backup/rehearsal and the owner's exact retry. Live map/product/count
exclusions and invalid report/origin denial pass; actual multilingual report/block/
reload/unblock/staff workflows retain local evidence above. No customer conversation
or report is submitted in the live smoke. See docs/GOOGLE-PLAY-RELEASE.md and
.local/play-s99/production-live-verified.json. New native binary/device checks
remain separate; older APKs do not gain these UI controls from the web release.

## S99.4 policy evidence — October 10, 2026

The owner confirms the prohibition and removal of alcohol/tobacco when found.
Public Terms and staff guidance now express the policy in the local candidate.
Typecheck and all localization checks pass. Real PostgreSQL tests for Prohibited
goods and Abusive content prove report persistence, scoped claim/readback and
denial of resolution while the reported product remains public. All 11 browser
acceptance workflows pass. Fifteen actual Terms captures cover five languages at
1440/390/320 pixels; focused phone captures show both policy paragraphs above
navigation with no overflow or page errors. Android's existing hosted Terms link
is verified. Protected receipts are under .local/play-s99/catalog-policy/.

A bounded read-only review of 53 live public API pages covers 264 offering texts
and finds no keyword candidates. It does not review all image/video content or
establish a zero-violation guarantee. No customer listing is changed. Full
repository check and clean isolated web release now pass, including the
provider-backed production HTTP smoke and clean web dependency audit. Original
local infrastructure failures and diagnosed corrections remain protected; no
test or timeout is weakened. Actual provider handler/Sharp and scheduled worker
archives pass on Linux; private/runtime/tooling exclusions and signer association
pass. Source de68832 / Netlify 6aca91cb2f49de22d3839199 is published. Five live
phone-width Terms states and 12 read-only API/compatibility checks pass. No customer
listing, chat, email or push is created; no DB/config/Android-build change occurs.
Google saves/reloads completed IARC (25 answers, Teen/12+, PEGI parental guidance).
Actual protected-phone, Google review and closed/public rollout remain separate.
