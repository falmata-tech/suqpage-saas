---
id: FE-056
title: Owner Profile and focused editing
status: in_progress
related: [FE-034, FE-032, FE-040, FE-051, FE-053, BE-032, BE-041, BE-044, BE-045, DEP-042]
owners: [product, frontend, backend, security]
last_updated: 2026-10-07
change_level: L2
---

# FE-056 — Owner Profile and focused editing

## Problem and scope

Owners need one private Profile showing their business/page identity and account
details, with clear Edit actions rather than competing setup menus. Android
customers also report cover photos not saving. The current picker changes local
page state; the separate save/error controls are distant. Diagnose and verify
using disposable local accounts, never write to the reported customer's store.

Reuse existing catalog, owner-home, page/publication, handles, business/location
and account ports. Add a focused cover editor and private account name/phone
update. Do not merge public and private data authority, change staff workspaces,
rename transport service APIs, add checkout, auto-publish or relax video review.
Master §§5/11/13/15/18/19/22 affected. Earlier S71/S72 review remains pending.

## Contracts and scenarios

- GIVEN a signed-in linked owner WHEN opening account/dashboard THEN show Profile:
  saved cover/logo/name/handle/status, page preview and grouped business/page and
  private account details. Private name/email/phone stay in this authenticated
  screen and do not become public contacts. Staff cannot use native owner routes.
- GIVEN Profile WHEN selecting Edit cover/page/business/handle/account THEN open
  that focused editor. WHEN save succeeds THEN return to Profile with refreshed
  authoritative values. WHEN validation/network/version failure occurs THEN stay
  in the editor with an actionable error and retained entered values.
- GIVEN a cover selection WHEN choosing a photo THEN show the local preview and
  visible Save/unsaved state. WHEN Save is pressed THEN upload tenant-scoped media,
  persist the cover through the existing versioned page-save port, confirm success
  and return. Re-entry shows the saved cover. An upload alone is never called saved.
  A failed page save retains its selected/uploaded photo for retry; no publication
  or foreign media authorization is bypassed. Active-owner saves update the live
  publication; draft owners remain private.
- GIVEN the first essential signup THEN retain its complete private sample preview
  before editing, with Profile available as the owner home. Publication stays
  deliberate and existing cooldown/aliases and consent remain authoritative.
- GIVEN 320/390/desktop or any supported locale THEN Profile and editor actions
  fit, have 44px targets, clear labels and reachable Save/Back to profile. Merchant
  values stay literal. English and four authored native catalogs cover new labels.

## Test plan and quality

Owner Profile includes Sign out even when the client navigation hides staff
utilities. The actual browser signup/account workflow signs out from Profile,
then confirms a protected dashboard redirects to Login without retained access.
This S98 session-security correction must not be omitted from the simplified menu.

Profile aggregates bounded existing owner data, no public snapshot or submitted
owner ID becomes authority. Return destinations are fixed/allowlisted; no arbitrary
redirect. No schema/provider change or new dependency is planned. Cover upload
keeps existing image/body limits and server validation. Errors must not include
tokens/files/private account details. Save success requires confirmed persistence.

| Criterion | Level | Test plan |
|---|---|---|
| Cover roundtrip/failure/tenant/version | integration + UI | existing native API tests and focused cover capture |
| Profile/edit/save/return and signup preservation | acceptance | focused web/Expo owner-profile capture |
| Name/phone privacy/atomicity | integration | BE-045 account-profile regression |
| Labels/layout/locales | focused UI | localization/types and 1440/390/320 captures |

## Readiness and rollout

Definition of Ready met: scoped behavior, authority, failures, quality, tests and
rollback are explicit. Focused evidence and owner visual review precede full
release gates. Web/API precedes a separately admitted replacement native APK.
Application rollback retains saved profile/media and handle history; optional
name in the account API remains compatible with phone-only callers. No hosted
customer mutation is part of local verification. No independent native-speaker,
physical-phone or deployment claim without evidence.

## S75 — activity and one menu

Latest owner direction: choose four stable Market/Featured/Inquiries/Account
destinations on mobile web and native; desktop adapts the same visitor/client
information architecture. Do not replace the menu after login or render a second
owner menu. Account shows login/signup to guests and the consolidated linked-owner
Profile. Inquiries is the owner's business inbox and requires authentication;
do not invent a buyer-account inbox. About/privacy/terms are Account links.
Profile shows real own-business visits, last-30-day visits, new inquiries and
listed-item counts through existing authorization/aggregate queries. Keep raw
visitor/account data private; do not fabricate unknown counts. Essential first
setup/private sample and staff-only web management remain unchanged.

GIVEN a visitor/owner or focused editor WHEN viewing mobile navigation THEN exactly
one bar preserves Market, Featured and Account in that order; linked owners also
see Inquiries before Account. Controls lead to pages, not More popups. WHEN logged
in THEN Inquiries opens the owner inbox and Account opens Profile. WHEN editing
THEN success returns to Profile; the shared bar remains visible with proper safe
area. Profile metrics update from the server and never use another tenant's data.
Add focused menu/gating/activity checks to the Profile capture and native API
isolation tests. Implementation/screenshots/types precede owner visual approval.

## S76 — real pending feedback

GIVEN a data/auth/map/route/save operation is pending THEN show a compact orange
horizontal looping loading track in the affected area with an accessible Loading
label. Do not imply determinate progress, fabricate a percentage or replace
retained content during background refresh. WHEN complete/error THEN stop the
loop and show the real content/error. Reduced motion uses a still track. Reuse
web/native indicators at existing load boundaries, including Profile/login and
private editors; avoid competing duplicate navigation/loading overlays. Focused
`scripts/capture-loading-states.mjs` delayed-response and settled/error/reduced-motion captures plus
type/localization checks precede visual approval.

S75 latest explicit override: guests see only Market/Featured/Account, with no
Inquiries button. After sign-in show Market/Featured/Inquiries/Account. This
supersedes the earlier always-visible protected destination; keep a single bar,
correct selected state and actual server inbox authorization. Verify absence
while signed out and presence after sign-in in focused web/native captures.


Android regression finding: the actual picker selected its image but Save failed
locally with Unsupported FormDataPart implementation. SDK 57 fetch rejects the
legacy React Native URI object. Use the already-installed expo-file-system File
as real Blob-compatible multipart data, retaining filename/MIME/bounds and the
existing server byte validation. This shared fix covers covers, product photos
and business logos. `scripts/test-mobile-image-upload.ts` proves binary multipart
and input failure contracts; real Android picker→save→re-entry remains required.

Android's private-image loader also returned 401 after a successful cover save.
Private images must use the current authenticated fetch path, validate bounded
image bytes, and render from a temporary app-cache file on native. Remove temporary
files when the image/account changes or unmounts; cancel obsolete loads. Never
make private images public or put bearer tokens in URLs. Verify unauthorized,
oversized/non-image, cancellation and temporary-file cleanup paths.

Signup navigation regression: WHEN setup on either Account or /owner/setup
creates its business and navigates to the private preview THEN recheck current
linked-owner authority and show Inquiries. Do not retain a prior setupRequired
response merely because both old/new routes start with /owner/. The exact-route
case is mapped by scripts/capture-signup-city.mjs.

Blank notices/errors in native editor/account UI render null rather than a raw
empty string under View. Real notices/errors remain inside Text/Copy. Cover the
setup and private-preview path through the FE-059 browser console regression.

`npm run test:mobile:rendering` checks typed native JSX for falsy string children
outside Text, including optional notices, contacts, logos, video retries and
inquiry notes. `capture-signup-city.mjs` collects actual page/console errors
through city search failure/retry, initial setup/save and private preview.

Publish discovery defect: the private native page preview exposes Publish beside
Edit before the cover. Selecting it saves any pending page edits, reads current
server readiness and shows a review with actionable missing sections. Confirm
Publish is disabled until those checks are ready; final server publication remains
authoritative. Suspended/active pages never expose an inappropriate first-publish
action. Existing web confirmation/checklist remains. Test private sample review,
missing-item destinations, ready confirmation, stale/forbidden/failure retention,
and successful transition to live with actual local API publication.

If the server draft changed since the visible preview, refresh the preview content
and version and require another review before showing confirmation. If it changes
after confirmation, retain the sheet/error and let Cancel then Publish re-read the
latest draft; never overwrite or publish stale client content silently.

`scripts/capture-preview-publish.mjs` maps the visible action and real API workflow,
including unfinished checks, missing-section navigation, changed-draft review,
network/permission error retention and successful publication.
