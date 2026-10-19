---
id: FE-056
title: Owner Profile and focused editing
status: in_progress
related: [FE-026, FE-036, FE-066, FE-034, FE-032, FE-040, FE-051, FE-053, FE-019, BE-018, BE-032, BE-041, BE-044, BE-045, DEP-042, FE-067, FE-047, FE-072, BE-060, FE-073]
owners: [product, frontend, backend, security]
last_updated: 2026-10-17
change_level: L2
---

# FE-056 — Owner Profile and focused editing

## Planned S146 — retire owner Team editing

FE-072/BE-060 replace owner consent and per-business staff assignments with an
administrator-controlled, revocable all-business staff grant. Once verified and
deployed, remove Team editing from every owner page task on web and Expo; old
task links return to a valid focused owner task. This is planned, not a claim that
the currently deployed owner switch is already gone. The owner retains their
showroom tasks; account sign-in email remains owner-only under FE-073/BE-061.

## S122 — consistent editing and safe exits (implemented locally; review pending)

Actual Chrome confirms the Account hub, authoritative small statistics and
grouped Your page tasks already work. Preserve those. Product editing needs its
own clear Save/Cancel and Products parent, on web/phone/native; owner breadcrumb
labels must match Account. Keep bounded product search/page on web after Save,
Cancel and breadcrumb return. Business-details Cancel belongs with its bottom
Save action as well as any quiet parent navigation.

GIVEN entered changes WHEN Cancel or an app-owned exit would discard them THEN
offer Keep editing/Discard and do not write. Keep editing retains every value;
Discard returns to the intended existing parent. Native header/stack exits must
not bypass the same guard; leaving through persistent navigation must not silently
lose a retained editor. Use the installed navigation lifecycle and current
localized confirmation, not independent browser-history manipulation. Page and
product editors, plus other affected focused owner forms, share this safe behavior.
Successful Save exits without another unsaved warning; failed/busy saves retain
input and prevent duplicate commands. Draft state stays local to the current
editing session; no new sensitive-data persistence is introduced.

FE-047 S122 adds web availability/listed parity with the existing native owner
controls, while preserving omitted staff-only metadata. FE-026/FE-053 and BE-032
remain linked. Ready: actual browser reproduction, existing labels/guard pattern,
known parents and tests are explicit; no new account, provider or role decision.
Verify actual global Back, local Cancel, filtered returns, failure/retry and saved
readback. This does not approve earlier layouts or full/release/deployment gates.

S122 local verification: scripts/test-product-editor-workflow.ts, scripts/test-owner-editor-failures.ts, scripts/test-mobile-owner-edit-navigation.ts and actual web/Expo task Save/Cancel/readback pass. Current source, protected
readback and scoped harness failures are recorded in TRACEABILITY.md and
`.local/workspace-audit-s122/`. Both typechecks, localization and spec validation
pass. Visual approval, full/release/acceptance gates, commit and rollout remain
pending; this is not physical Android or complete-application certification.

## S115 — focused tasks inside owner management (ready)

GIVEN Account THEN preserve its six existing destinations and transport/support
separation. GIVEN Your page THEN expose grouped concrete tasks: Preview, About,
Cover photo, Business video, Page color, Public contact details, Page address and
Team editing. Opening an edit task renders only its relevant controls, with saved
values, explicit Save/Cancel and return to Your page. Legacy returnTo=profile
keeps its existing Account return; new bounded showroom origins return Your page.
Do not stack all page-edit fields or hide public contacts inside an accordion.

GIVEN public contact editing THEN retain every configured social/public value and
the existing inquiry auto-copy handoffs. GIVEN another focused page task is saved
THEN preserve all untouched profile fields using the existing full validated
versioned save; stale/foreign/consent-revoked writes remain rejected. Failed save
retains input. Switching tasks must not silently discard unsaved changes.
Publication readiness opens the actual About/contacts task rather than a hidden
accordion anchor. Preview/Publish and page accent preview remain available.

Business details owns business/category/location information; Page address owns
handle editing. Remove competing owner handle/editor controls. Private Account
settings render only the chosen edit task, with security/preferences clearly
grouped in saved view. Save/Cancel returns the originating task; no provider,
schema, account-role, public contact or publication authority is changed.
FE-026/FE-053/BE-032 apply. Focused actual React/SSR/native tests plus local
desktop/phone/five-language navigation review precede full checks and rollout.

Focused editing uses one visible task heading with accessible field names retained.
Publication/restore controls appear in actual Preview, not every individual edit.
Native Back/Preview are quiet navigation; Save/Cancel share a wrapping action row
with48px targets. Unsaved confirmation retains Keep editing/Discard behavior.

Mapped focused tests: `scripts/test-owner-focused-tasks.ts` executes actual web/
native controllers for selected tasks, eight-contact preservation, save failure/
retry, permission/content switches, cancellation and publication-readiness links;
`test-owner-account-hub.ts`, `test-mobile-account-hub.ts`,
`test-owner-editor-failures.ts` and `test-owner-settings-flow.ts` retain role/data/
menu/editor coverage. Actual local navigation/screenshots and pending visual/full
gates are indexed in S115 TRACEABILITY; mock I/O is not claimed as a hosted service.

## S110 — Account gateway and compact management hub (ready)

Newest owner instruction supersedes S104's public Dashboard label and the Profile
page dumping detailed business/private account records below its task cards.
GIVEN signed out THEN the public navigation says Login. GIVEN signed in THEN it
says Account on web, phone web and native, retaining the authorized destination;
this never grants staff native access or changes session/account data.

GIVEN a linked owner opens Account THEN show a compact saved business identity,
page status, a small existing-activity summary and six clear destinations: Your
page, Products, Business details, Account settings, Support and Transport chat. Do not
stack full contact records, every edit shortcut and legal sections below the hub.
Primary management choices appear without hunting through a long profile page.
No creation, editing or hidden accordion workflow starts automatically.

GIVEN Your page THEN open a dedicated management screen with Preview page,
Edit page, Cover photo and Page address actions. Each opens the existing focused
screen; preview/publication, owner consent and version/cooldown rules stay.
GIVEN Business details or Account settings THEN use saved summaries and deliberate
editing. Native account preferences/notifications and profile editing open separate
views rather than appearing together. Private account data never becomes public.
Back/Cancel/Save returns to the relevant account destination; sign out remains
clearly accessible inside private account settings, retaining S107 cleanup/retry.

Use existing owner-home/account/page/support APIs, native navigation and current
Suqpage identity/accent. Do not add a framework, fake analytics or new data fields.
Test all hub destinations, child menus, name/handle/status, role denial, private
information boundaries, 48px targets, 320/390/desktop and all five locales. Actual
browser/Expo navigation verifies accessibility and data wiring; Android device
verification remains separate. Cross-links FE-026, FE-036, FE-053 and BE-032 remain.
Focused visual review and existing full/release approval gates are preserved.

S110 focused web regression: `scripts/test-owner-account-hub.ts` renders the
actual Account and Your page server components with bounded data/auth ports,
asserts every destination and authoritative identity/activity/status, excludes
the private-contact/editor dump and proves staff/unlinked-owner denial before
data reads. Actual local owner navigation separately verifies the routes,
saved-summary/focused-editor boundaries and all five language layouts without
submitting customer, staff, support or publication mutations.

## Problem and scope

S110 above supersedes S104 below; the historical Profile hub/navigation label and four-destination
menu with Dashboard/Overview, direct About and grouped management navigation.
Historical sections retain their originally verified behavior/evidence.

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

S107 location-editor defect correction: GIVEN an owner edits the business city
THEN reuse the canonical city selector with visible saved selection. Changing
country or typing a replacement invalidates the old selection and blocks Save
until a result is chosen. Pending, no matches, failure and Retry remain visible;
cancel obsolete requests and never present stale-city results as current. A
successful selection supplies canonical coordinates while preserving explicit
storefront coordinates until the owner deliberately changes city. Category-load
failure also offers Retry. Existing tenant/version/persistence authority remains.
Verify city failure/retry, stale selection, save/re-entry and native parity in the
S107 owner-flow captures and existing backend location regression tests.

S107 focused web-editor recovery: GIVEN the business-details or page-address
editor WHEN its save action rejects because the connection failed THEN stay in
the editor, retain the entered fields, show the existing localized connection
error and permit an explicit retry. Pending saves announce their busy state,
show the themed loading bar and disable Save; immediate repeated submission
cannot send a second command. Returned validation/version errors remain visible.
Next.js redirect/control exceptions must still reach the framework so successful
saves return to Dashboard. Keep the existing action payload, tenant/version
authority and address cooldown unchanged. Regression evidence uses the actual
bundled editors with rejected/deferred save ports plus local browser network
failure and successful save/re-entry (`scripts/test-owner-editor-failures.ts`,
`scripts/capture-owner-profile.mjs`); no provider success is mocked.

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
  S107: each web cover upload/save request has a bounded 20-second wait, including
  response-body decoding. A timeout/malformed response produces a localized
  connection error, re-enables Save and retains the photo/upload reference. Never
  announce a save without acknowledgement or automatically replay a timed-out
  write; version checking remains authoritative on an explicit retry.
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


## S104 standard owner dashboard — in progress

The October 16 owner request supersedes Profile as the primary navigation label.
Retain the existing authorized /dashboard/profile hub and all saved data; name
it Dashboard with an Overview heading, genuine activity metrics, business/page
status, preview/edit actions and grouped management destinations. Desktop owner
navigation exposes Overview, Your page, Products & services, Inquiries, Support,
Business details and Account settings, with public Market/Featured/About links.
On phones/native keep one global navigation bar; the Dashboard contains clear
management cards and focused editors retain their Save/return behavior. Do not
replace first-setup → private preview with automatic editing or auto-publication.
GIVEN any supported locale THEN navigation, page headings, active states and
back/save destinations explain the task without translating merchant content.
GIVEN sign-in/out or a restricted staff principal THEN existing server permissions
and mobile exclusion hold; no fake metrics, customer data or default credentials.
Tests: actual owner sign-in/navigation/preview/product/inquiry/support/account
flows, active menu and single-navigation assertions; existing save/cover tests.
FE-026/FE-036/FE-053 own shell/navigation. Visual approval precedes full gates.

S104 focused local evidence passes in TRACEABILITY: actual role/navigation and
combined support/transport HTTP workflows plus desktop/phone/five-language
captures. Visual approval, full gates, scoped commit and rollout remain pending.


## S105 social-contact revision

FE-066 / BE-055 supersede new customer messages to business inboxes. Only
configured social accounts receive visitor handoffs; chosen products and the
simple message follow the active UI language. Retained private history stays
scoped. Public transport chat and authenticated owner support remain unchanged.
Local implementation and review evidence are tracked in checklist S105.


## S114 owner transport Account task — locally verified, visual/full gates pending

The Account hub gains a sixth focused destination, Transport chat, alongside
Your page, Products, Business details, Account settings and Support. Transport
opens its own authenticated request/chat/history workspace; Support continues to
handle business/account/page questions. The same transport option is available
in owner web navigation. No public launcher is added to private account pages,
no long inline form is dumped into the hub, and staff/admin native access remains
closed. FE-019/FE-053/BE-018 S114 governs the shared workflow and access.
