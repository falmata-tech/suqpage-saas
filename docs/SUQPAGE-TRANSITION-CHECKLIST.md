# Suqpage transition checklist

Controlling contracts: FE-040, BE-032, DEP-030, ADR-0018.
Last updated: 2026-09-14. Current step: D5 hosted delivery follow-up; publication is complete.
The owner explicitly approved the current visuals and authorized deployment on
2026-09-14. S2l is implemented and focused-tested (BE-035/DEP-031). Full gates,
reviewed packaging, verified hosted targets/backups, rollout and monitoring remain
unchecked until evidence exists. Real-account phones require their owners' values.
The owner has now explicitly approved the private production data backup at
`.local/deployment-20260914/data-before.sql` and an email-only launch. Google
must be hidden in the application until separately restored and verified.

Deployment sequence (operations, L3/L4; DEP-030/031):
- [x] D1. Record visual approval and authorization to deploy the Suqpage candidate.
- [x] D2. Mobile-menu, check, release, acceptance (7), accessibility (72), native
  PostgreSQL, archive/restore and container gates pass; deployment record maps evidence.
- [x] D3. Independently verify hosting account/site and isolated provider targets;
  inspect hosted Auth readiness, retain protected backups and rehearse additive
  migrations. Actual private backup restore preserved all 50 original table
  fingerprints through 39–43. Email-only app flags are verified; DEP-029 still
  governs any provider-secret recovery separately.
- [x] D4. Review and package only this transition's source; record scoped commit
  and exact deployment artifact. Source `41e2fed`, clean offline Netlify artifact
  and privacy/hash checks are recorded in the deployment report. `deno.lock` is preserved.
- [ ] D5. Apply verified additive migration, publish to the confirmed generated
  Netlify origin, smoke public/owner/admin/Auth/media/inquiries and monitor.
  Published `6aa7fe5a106ca381ba08bba3` at the verified generated origin; schema 43,
  public desktop/phone workflows and access denial pass. Authenticated hosted
  email delivery/owner/admin follow-up remains; local authenticated workflows pass.
  Retain prior deployment and compatible schema; no DNS change.

- [x] D6. Carry approved fictional demo contacts to exact hosted seed identities
  after schema 43; fill missing fields only, preserve account emails and all real
  values, verify matching page/account projections and public links. Transaction passed
  for 64 exact matched pages and 47 seed accounts; all 64 live pages expose their email/phone links and omit private phone fields.

## Namespace rename — current request (BE-036, DEP-032, ADR-0021)

- [x] N1. Record clean task baseline (only unrelated deno.lock), namespace audit,
  applicable specs and nonbreaking compatibility decisions. Definition of Ready met.
- [x] N2. Canonicalize source/config/docs/assets with bounded compatibility
  for old environment keys, cookies, carts, public asset URLs and provisioned resources.
  Evidence: `docs/SUQPAGE-NAMING-COMPATIBILITY.md`, focused namespace/config/state/
  database regressions pass; 22 tracked paths renamed with exact public rewrites.
- [x] N3. Apply additive platform-default database migrations 44–45 locally after rehearsal;
  preserve tenant data, account emails, Auth links and all protected backup files.
  Local 44–45 applied; protected-backup rehearsal preserved all 50 original table
  projections except exact standard subscription labels. Hosted schema 45 is verified
  under N6 with 55 preserved data-table projections and 66 standard labels renamed.
- [x] N4. Verify namespace, config/state migration, security and focused local
  continuity; no layout redesign is included, existing visual approval stands.
  Evidence: namespace regression, typecheck, eight browser scenarios and clean
  release pass; custom subscription labels/prices preserved. Core final invitation
  query timed out under build load and passed unchanged on focused retry and release.
- [x] N5. Verification and reviewed source commit `51109d8` complete; review
  and commit only task files, preserving deno.lock and ignored operator data.
  Container context/non-root/origins/trace/fail-closed checks pass. Netlify offline
  artifact privacy and exact runtime-source comparison pass; production audit has
  zero vulnerabilities. The pre-existing deno.lock remains untouched.
- [x] N6. Package clean source, perform approved monitored rollout and record exact
  compatibility exceptions and hosted configuration gates that remain separate.
  - [x] N6a. Live candidate 6aa80d74354566ace7fd51e8 exposed missing CDN aliases
    for old static asset URLs. Add exact Netlify rules matching the tested Next map,
    verify mapping equality, publish static correction and check every legacy URL.
    Completed in ce2015b; final deploy 6aa80f72843cbebe952f97df passes all 17
    byte-for-byte legacy asset comparisons and desktop/phone page/contact/inquiry
    checks. Hosted schema 45 preserved 55 data-table projections except 66 standard
    labels. See docs/SUQPAGE-NAMING-ROLLOUT-2026-09-14.md for exact evidence.

## Decisions

- Suqpage serves product sellers including retail shops, home sellers, growers,
  workshops and small manufacturers. The platform palette and map remain.
- One business profile for all product sellers: hero image as video poster,
  name/logo, one About description, products and inquiry cart, followed by optional
  public contacts. No starter gallery, layout builder, intro field or cover-style choice.
  Long descriptions expand on demand; the optional contact section follows products.
- Owners control their page. Staff may edit a private draft only with revocable
  owner permission and staff tenant scope. Staff cannot grant themselves access
  or publish on the owner's behalf in the self-service flow.
- First marketplace listing review is separate from ongoing page editing.
- No checkout, payments, stock accounting, arbitrary HTML/AI code, provider
  replacement, broad data reset, or rewriting of retained design records.
- Latest direction: all public pages and regular previews use the shared profile
  immediately in the reviewed release, populated from canonical content or the
  current owner publication. Restore does not switch back to a custom layout.
- Preserve saved content, product identities, permanent handles and inquiries.

## Ordered work

- [x] S0. Inspect the managed workflow, renderer, catalog and authorization.
  Evidence: source assessment and accepted direction; ADR-0018 records it.
- [x] S1. Record ready contracts and add owner-controlled draft/access services.
  Include tenant isolation, owner-only consent, immediate revocation, private
  storage, optimistic concurrency and attributable history.
- [x] S2. Replace the superseded Shop layout generator with a single clean
  business profile and content form. Retain tenant drafts and consent safeguards.
- [x] S2a. Reverify service/security, product/cart/video and desktop/390px/320px UI.
- [x] S2b. Explicit owner visual approval received on 2026-09-14, together with
  authorization to complete gates and deploy. Earlier approval-pending notes below
  are historical evidence; they do not impose a second approval request.
- [x] S2c. Add private draft image uploads using the existing media sanitizer and
  storage adapter. The cover control must open the native file picker, show the
  uploaded cover, and retain it after save/reload. Keep the old cover on cancel
  or failure; verify desktop/phone chooser behavior and private-media access.
  S2b visual approval remains pending and does not block this requested fix.
- [x] S2d. Rework the rejected basic visual treatment into a distinctive shop
  profile: clear cover/identity hierarchy, image-led products without repeated
  boxed-card framing, and compact section/filter controls. Keep one shared
  profile and the same content form. Review desktop/phone screenshots before S2b.
- [x] S2e. Complete the latest cover/description direction, superseding the
  in-hero About/video switch: hero image is the video poster with one play
  control. Name/logo and one About description sit below it; no separate intro
  field, About tab, cover-style selector or back-and-forth media controls.
  Products follow the identity/description; optional contacts form the last section.
  - [x] S2e.1 Update FE-040 before code; affected master sections 2 and 5.1.
    BE-032 keeps its compatible payload; no migration. Existing About is
    preferred, legacy intro supplies a fallback. Editing the single description
    deliberately replaces that fallback; untouched records stay intact.
  - [x] S2e.2 Implement image-as-video-poster, identity/About and simpler editor.
  - [x] S2e.3 Verify optional/long content, media geometry, description
    save/reload, cart, keyboard and desktop/390/320 public/editor states.
  - [x] S2e.4 Record evidence for explicit S2b visual approval.
    Full release/acceptance, commits and deployment remain later gates.
- [x] S2f. Add the requested standalone contact section after products.
  Depends on S2e; validate optional public details in FE-040/BE-032 before code,
  retain owner publication/privacy, and test safe URLs, absent contacts and
  desktop/phone links. Never expose private notification or onboarding details.
- [x] S2f.1 Correct contact placement to its own area after all products, per
  explicit owner correction. Update FE-040/master before code, then verify
  desktop/390/320 sibling order, absent-contact behavior and screenshots.
- [x] S2f.2 Keep the contact area visible on businesses with no direct contact
  details, including the reported `demo-nile-sensor-studio` page. Add the existing
  product-inquiry action; omit unavailable direct links. Update FE-040/master,
  then verify this exact route and empty/non-empty inquiry carts on desktop/phones.
- [ ] S3. Complete owner publication and listing review as separate operations.
  Preserve product IDs on appearance changes; staff-authored changes still need
  an owner publish decision. Cover parallel edits, rollback and private assets.
- [x] S3a. Publish the exact saved draft for an existing active page, with
  owner-only confirmation, append-only publication history and restore-previous
  action. Render its snapshot at the same handle; expose only its approved cover.
  Prove stale-edit/publication conflict handling and unchanged catalog/listing.
- [ ] S3b. Complete first-listing approval, discovery-image consistency, and
  private-asset retention before opening publication to new sellers or rollout.
- [x] S3c. Standardize every public business page and ordinary preview; propagate
  current published covers to discovery without exposing private drafts. Preserve
  product IDs and test more than one business on desktop and phones.
- [ ] S4. Complete self-service products before first publication, category and
  option management, retailer-friendly fields, onboarding and address privacy.
  Home sellers choose a general public area or an explicit storefront location.
- [x] S5. Implement the Suqpage logo/wordmark, retaining the current
  palette. Update platform copy, icons, PWA assets, metadata and email branding.
  Provider names/origins/credentials are a separate approved operations step.
  Local desktop/phone review passed; owner approval remains S2b. Hosted email
  branding and provider console names are not changed by repository assets.
- [ ] S6. Add reviewed consumer-retailer demo examples alongside makers/growers.
  Use existing demo fixtures or a reviewed local-only operation, not a permanent
  synchronization tool. Label illustrative assets and do not change real clients.
- [ ] S7. Run complete checks, acceptance, accessibility and rollout rehearsal;
  record owner approval, backups, rollback, scoped commits and remote evidence.
- [ ] S8. Restore and verify hosted Google/email entry, complete the approved
  production rollout, and monitor real deployed workflows under DEP-028/030.

## Request intake and evidence

New requests are inserted into the relevant numbered step with their dependencies.
If one changes the contract, update the spec before code. New urgent defects may
interrupt the sequence, but record what is paused and the next resumable step.
Do not use this file as a chat transcript or store personal data or secrets here.

| Step | Implemented | Focused evidence | Visual approval | Deployed |
|---|---|---|---|---|
| S1 | Private draft and consent boundary | Unit/security and local PostgreSQL passed | Not applicable | No |
| S2 | One profile, content form, cover treatment, About video, product/cart preview | 14 domain/security/media tests, local PostgreSQL, desktop/390px/320px browser checks passed | Awaiting review | No |
| S2c | Native chooser, sanitized private cover upload, preview and saved reference | Desktop/phone actual local Supabase upload/save/reload, anonymous read denial, invalid-image preservation; adapter namespace isolation passed | Awaiting review | No |
| S2d | Visible cover and logo/name identity, unframed product listings, compact controls, two-column phone catalog | Desktop/390px/320px captures inspected; product/cart/video regression passed | Awaiting review | No |
| S3a | Owner-only publish/restore, retained history, public profile and scoped cover reads | 19 domain/security/media cases; actual local PostgreSQL and desktop/390/320 public/editor browser checks passed | Awaiting review | No |
| S3c/S5 | Shared canonical/publication profile, Suqpage mark, wordmark, copy, PWA and email assets, current discovery covers | Desktop/390/320 across Market, Featured, About, login and three shops; owner upload/publish/restore and current-cover propagation passed | Latest S2e/S2f review pending | No |
| S2e/S2f | Image-as-video-poster; name/logo and single About; optional owner-published public contacts | 22 domain/security cases, local PostgreSQL, owner workflow desktop/390/320, 21 cross-page states and 9 profile accessibility scans passed | Awaiting S2b approval | No |
| Remaining S3b/S4/S6-S8 | First listing, asset retention, new-seller products, demo additions and rollout | Pending | Pending where applicable | No |

Existing production Auth restoration remains pending. Do not mistake passing
local tests, a preview, or this checklist for a production restoration.

## S2 single-profile review evidence

The earlier two-layout checkpoint is superseded, not approved. The replacement
removes `lib/shop-page-template.ts` and its generated manifest. The same fixed
`BusinessProfile` component now uses existing catalog and cart callbacks. Business
names come from canonical details. First save needs no separate start action;
conflicting concurrent first saves are rejected rather than overwriting a draft.

- `npm run test:owner-page`: 14 passing tests for bounded profile fields, all roles,
  tenant prechecks, consent, revoked writes, conflicting first saves, stale
  versions, media ownership, controlled YouTube URLs and saved local draft
  compatibility, private image reads, upload-time revocation cleanup, invalid
  image denial and bounded multipart parsing. Uses identified fake ports/stores
  for domain tests with the real image sanitizer.
- `npm run test:media-storage`: private `pages` namespace write/read/remove and
  separation from public/request objects passed for the filesystem compatibility
  adapter and fake Supabase transport. This is not hosted-provider evidence.
- `npm run test:owner-page:postgres`: actual local Supabase PostgreSQL save,
  actor events, revocation, unchanged catalog/product IDs, and denial of direct
  access by Supabase public API roles. Test mutations roll back. Additive
  migration 39 was applied to this project's local database only.
- `npm run test:owner-page:visual`: first save/reload, consent preserving unsaved
  edits, failed-save preservation, both cover controls, optional About navigation,
  product search/details/options, inquiry cart and desktop/390px/320px layouts
  passed. Preview sends no inquiry requests and writes no visitor cart storage.
  Desktop and phone native file-chooser events, same-file replacement, actual
  local Supabase Storage upload, authorized retrieval, anonymous HTTP denial,
  save/reload and invalid-upload preservation also passed. Test-created private
  objects and the test draft were removed after the run.
  An incomplete video URL retains the last valid preview. The YouTube iframe
  response and a stale-save response are intentionally stubbed; real YouTube
  playback/network availability is not asserted by this test.
  The new-profile run used `SUQPAGE_TEST_SESSION_BOOTSTRAP=1`, a real locally
  issued Supabase session. Prior local email-entry evidence is unchanged; this
  run does not reverify email entry, hosted Google, SMTP or production Auth.
- Typecheck, existing renderer checks, specification validation, database-boundary
  checks and whitespace review passed. Full `check`, `release`, acceptance,
  commit and deployment remain gated on visual approval and later rollout steps.
- Screenshots: `/tmp/suqpage-shop-review/shop-edit-1440.png`,
  `shop-edit-390.png`, `shop-edit-320.png`, `shop-preview-1440.png`,
  `shop-preview-390.png`, `shop-preview-320.png`, `profile-overlay-1440.png`, and
  `profile-about-1440.png`; upload captures are `profile-upload-1440.png` and
  `profile-upload-390.png`. Desktop/phone/cover images were visually inspected.
  These are local review artifacts, not production proof.

Review URL: `http://127.0.0.1:3101/dashboard/page-editor`. Sign in as an existing
local client. Staff use `?business=<id>` only after the owner enables assistance.
The prior local server on port 3000 was left untouched. This checkpoint's server:

```sh
PORT=3101 NEXT_PUBLIC_APP_URL=http://127.0.0.1:3101 \
SUQPAGE_SERVER_ACTION_ORIGINS=http://127.0.0.1:3101 \
SUQPAGE_OWNER_EDITOR_ENABLED=1 \
SUQPAGE_NEXT_DIST_DIR=.next-acceptance/suqpage-acceptance-owner-shop \
npm run dev:local
```

S3a now exposes confirmed owner publication for existing active pages only.
Uploads stay in private storage; the currently published cover alone is exposed
through the public page-media route. Abandoned/replaced object retention and
discovery cover propagation remain S3b rollout requirements.
Existing page projects
retain their current managed workflow; the new consent rule governs only the
private business profile. No retailer records were added or existing demo clients
rewritten in this checkpoint; those examples remain S6. Logo creation stays in S5.

## S3a publication evidence

- `test:owner-page`: 19 cases passed, including five new publication cases for
  owner authority, current saved content, staff-draft isolation, stale versions,
  missing cover, inactive businesses and restoration without draft destruction.
  Domain ports are fakes; media decoding is real.
- `test:owner-page:postgres`: actual local Supabase verifies serialized version
  checks, owner-only writes, append-only publication operations, restore to the
  retained original design, gate-off rollback, draft/suspended-business denial,
  unchanged catalog and denied public-role history access. Writes roll back.
  Additive migration 40 was applied only to this project's local port 54322.
- `test:owner-page:visual`: actual authenticated owner publication, confirmation
  cancellation/focus return, public rendering at the same handle, private-media
  HTTP denial, current-public-cover access, later-draft isolation, stale publish
  rejection, mobile restore, retained history and unchanged business records
  passed. Public controls work after hydration with no console/page errors.
  The new profile omits the legacy floating inquiry control; its section/cart
  bar stays reachable while scrolling. Existing managed pages remain unchanged.
- Screenshots: `/tmp/suqpage-shop-review/published-profile-1440.png`,
  `published-profile-390.png`, `published-profile-320.png`,
  `published-profile-scrolled-320.png`, `publish-confirmation-1440.png` and
  `restore-confirmation-390.png`. Desktop, phone and scrolled states inspected.
- Typecheck, database-boundary checks, spec validation and whitespace checks
  passed. The local browser run uses a real provider-issued test session, not
  Google/SMTP entry. Existing YouTube/stale-save stubs are unchanged. Full gates,
  commit, visual approval and remote rollout remain pending. Test-created draft,
  publication history and upload objects were removed; no real page was converted.

## 2026-09-14 shared-page and identity evidence

- All public business routes and ordinary previews render `BusinessProfile` from
  canonical content or the current owner publication. No catalog/history rewrite.
- New Suqpage shop/map SVG mark, wordmark, versioned PWA icons, visible platform
  labels and consumer-shop copy are implemented. Existing domains, credentials
  and provider connections were not changed. Local email source/subject updated;
  hosted email configuration was not deployed.
- `test:suqpage:visual`: 21 desktop/390px/320px states across seven routes passed,
  including three existing textile/electrical/ceramics businesses. Screenshots in
  `/tmp/suqpage-redesign-review/`; desktop and phone states visually inspected.
  Actual browser-to-OSM tiles loaded; no tile mocking, proxying or downloads.
- `test:owner-page:visual`: real local Supabase upload/save/publish/restore passed,
  including current section indication, immediate discovery-cover refresh after
  a warmed cache, unchanged catalog and private/superseded cover denial. Existing
  local provider-session and YouTube/stale-save test boundaries still apply.
- Typecheck, 19 owner domain/security cases, local PostgreSQL integration,
  identity, narrative, PWA, Auth runtime, specs and database-boundary checks passed.
  Full release/acceptance, owner visual approval, commit and deployment are pending.
- Cache correction: current covers are read in bounded batches outside cached
  geography/schedule data. Tag/path invalidation alone did not guarantee the
  immediately following request used the new cover in the isolated dev server.
  The passing browser regression retains that strict next-request assertion.
- Preserved unrelated user paths: `deno.lock`, `feature-request-docs-and-assets/`.

## Checkpoint lessons

- Inspect accessible roles and current local fixture handles before writing
  browser selectors. The search uses a combobox and return navigation can be a
  button or link. Assert final route identity: an obsolete handle may redirect
  to a successful Market response, which is not proof the business page loaded.
- Wait for actual tile readiness before judging a map screenshot. An early
  screenshot with markers but pending tiles is not visual completion evidence.

- Public rendering must be tested separately from editor preview: inherited
  floating controls can appear only on the public route. Exercise real public
  controls before screenshots; Playwright's temporary hidden-caret style can
  otherwise race hydration. Assert console errors as well as page exceptions,
  rather than masking the resulting mismatch or changing Auth/provider settings.
- An image selector is not an upload control. Verify a real native file-chooser
  event and successful provider-backed replacement/save/reload, not just whether
  an image can be selected from existing assets.
- Playwright request methods take URL strings; convert constructed URLs with
  `.href`. A test API argument error is not an Auth or storage outage and must
  not trigger provider changes or broader test runs.
- The rejected visual checkpoint relied on a faded banner and generic card
  framing. Review real product imagery, business identity and phone density
  before seeking approval; functional coverage does not establish design quality.
- Isolated Next.js ports also need an exact `NEXT_PUBLIC_APP_URL` and
  `SUQPAGE_SERVER_ACTION_ORIGINS` for that port. The first 3101 run omitted
  them, causing same-origin rejection reported as a login 503. Register the
  local origin before diagnosing a provider failure; do not weaken origin checks.
- User roles come from `user_access_profiles`, not a column on `users`. Reuse
  the established scoped join in integration fixtures.
- Consent changes are server-confirmed. Browser tests should click and wait for
  the confirmed state, not require a synchronous optimistic checkbox update.
- Do not assume server-rendered inputs are hydrated. Disable this editor's fields
  until hydration, and use accessible navigation labels in tests instead of
  guessing CSS class names. Both caused avoidable repeat captures in this step.
- Returning a field to its saved value disables Save by design. Assert that
  state instead of waiting for a redundant save click. Scope alert checks to the
  editor; Next.js also has a route-announcer alert. Both were test mistakes, not
  reasons to change application behavior or run larger test suites.
- Do not create a blank draft and then automatically save using whatever version
  comes back. A competing first writer may already have saved different content.
  Validate and save the intended initial content in one operation, with conflict
  protection. This also avoids an unnecessary start-then-save request sequence.

## 2026-09-14 S2e/S2f final local evidence

The owner superseded the initial hero-switch proposal during resumption. The
current implementation is a single image/video poster, name/logo and About,
the product catalog, then a standalone optional contact section. Earlier About-tab, trailing
About, two cover treatments and hero-switch screenshots are superseded.

- `test:owner-page`: 22 passing cases. New regressions cover About precedence,
  intro-only/typing compatibility, optional contact validation, unsafe URLs/email
  injection, private notification exclusion and owner-published contact snapshots.
- `test:owner-page:postgres`: actual local PostgreSQL contact JSON round-trip,
  saved/publication isolation, permissions and unchanged canonical catalog passed;
  all test writes rolled back. No migration or hosted operation was needed.
- `test:owner-page:visual`: passed with real isolated local Supabase sessions,
  upload/save/reload/publish/restore and private-media checks; one-description
  edits/clearing, public phone/email/site links, preview handoff suppression,
  3000-character Read more/keyboard scrolling, missing cover/video, and 1440/390/320
  no-overflow captures. Starting video keeps the product position unchanged.
  A second allowlisted demo (`SUQPAGE_TEST_PROFILE_HANDLE=entoto-ceramics`) was
  used for final contact captures after repeated tests reached the first demo's
  upload limit. Limits were neither cleared nor weakened. Test-created drafts,
  publications and uploads were removed; canonical records were unchanged.
- `test:suqpage:visual`: 21 route/viewport states across Market, Featured, About,
  login and three businesses passed. Additional poster/video captures and nine
  WCAG A/AA-targeted axe scans of the business profiles passed. Real OSM tiles
  loaded normally. These focused checks do not establish full WCAG conformance.
- Typecheck, specification validation (123 contracts/ADRs), identity, narrative,
  PWA, database-boundary and whitespace checks passed.
- Browser video responses are explicit fixtures, not real YouTube playback
  verification. Video requests are lazy and use the controlled provider with
  playback requested only after the visitor clicks. OTP/Google/SMTP and external
  contact destinations were not exercised; no message was sent.
- Review: `http://127.0.0.1:3101/@selam-weave` and
  `http://127.0.0.1:3101/dashboard/page-editor`.
  Canonical screenshots: `/tmp/suqpage-redesign-review/textiles-poster-390.png`,
  `electronics-poster-1440.png`, `home-poster-320.png` and corresponding video
  states. Extended contact test examples:
  `/tmp/suqpage-shop-review/published-profile-1440.png`,
  `published-profile-390.png`, `published-profile-320.png`.
  The extended contact examples use synthetic test copy/contact details, removed
  after the test; they are not factual business contact information.
  Desktop, phone, narrow-phone and video captures were visually inspected.
- No full build/check/release/acceptance, commit, remote CI or deployment. The
  mandatory S2b visual approval and remaining S3b/S4/S6-S8 dependencies still apply.
- Documentation/history audit and unresolved drift:
  `docs/SUQPAGE-RESUMPTION-REVIEW.md`. Preserve unrelated pre-existing worktree
  changes, including `deno.lock` and `feature-request-docs-and-assets/`.

### S2f placement correction — 2026-09-14

The owner clarified that contacts belong after products in their own area.
The shared renderer now places the optional contact section as a direct sibling
following the complete product section, with a separate charcoal surface,
heading and bounded links. No contacts appear in the introduction. Businesses without direct contact details retain the inquiry action; unavailable
links are omitted. FE-040, master and ADR-0018 were reconciled.
Typecheck/spec validation and the 21-state public browser matrix passed,
including nine accessibility scans and explicit sibling-order assertions.
Focused desktop/390/320 contact screenshots are
`/tmp/suqpage-redesign-review/textiles-contacts-1440.png`,
`textiles-contacts-390.png` and `textiles-contacts-320.png`.
Additional bottom spacing keeps the desktop support control clear of contact
content. No API, data, contact destination or provider behavior changed.
Prior screenshots showing contacts above products are superseded.
Visual approval, full release gates and deployment remain pending.

## S2g — Separate public business and private account contacts (2026-09-14)

Classification: L2 contact/privacy feature with additive local L3 migration rehearsal.
Ready: FE-040/BE-032 own display/storage; FE-038/BE-031 own signup. Existing verified
account emails are retained. Public contact publication remains owner-controlled.
No provider change, email delivery, phone verification or new public user directory.

- [x] S2g.1 Record contracts and readiness before code.
- [x] S2g.2 Add public business email/phone and private account phone storage;
  self-only account form; preserve sign-in email; capture signup phone privately.
- [x] S2g.3 Run validation, tenant/privacy tests and both database migration tests.
- [x] S2g.4 Back up and migrate only loopback Supabase; populate reviewed demo
  contacts only with approved fictional details or owner-provided values. Never
  invent real-user data or copy private identity into a public field.
- [x] S2g.5 Verify the exact sensor URL and account form at desktop/390/320;
  update evidence and master sections on onboarding and contact privacy.
- [ ] S2g.6 Explicit visual approval, then full checks/release gates and scoped
  commit. No push or hosted rollout is authorized.

S2f.2 complete: 24-state desktop/390/320 matrix passed, including the exact sensor
route, contact sibling order and empty/non-empty inquiry cart behavior. The first
Featured capture detached during hydration; the controlled follow-up waits for
Featured readiness. Media pages use element readiness, not network-idle waits.

### S2g verified local evidence

- Owner explicitly approved fictional details for demos, preserving account emails.
  A one-time transaction filled canonical public email/phone for all 66 reviewed
  active demo businesses, and private account phone for all 47 seed demo users.
  The other two accounts are non-demo and their pages are drafts; phone values
  remain pending owner input. Their private values were not inferred or invented.
- Allowlist: SEEDED_FEATURED_HANDLES + SCALE_DEMO_BUSINESSES; users match their
  exact seeded emails and setup.ts staff identities. No Auth identity was created,
  replaced, or relinked. Account emails, existing notification/social destinations,
  products and publication history remain unchanged. No demo publication existed.
- Fictional public emails use example.com. Public and account phones use distinct
  entries in [Ofcom's reserved drama range](https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/numbers-for-drama).
  These are display fixtures, not reachable or verified contact channels. No calls,
  email, messages, external social visits or hosted changes were performed.
- Protected local public-schema backup retained outside Git; its directory pointer
  is /tmp/suqpage-contact-backup-location (0600). Migration 41 applied on 54322;
  repeat returned no migrations. Test transactions were rolled back.
- Passed typecheck, spec validation (123), database boundaries, 22 owner-page
  domain/security tests, signup tests, SQLite account-contact tests, PostgreSQL
  migration/signup/account privacy and owner draft/publication regressions. Browser
  roles anon/authenticated cannot SELECT users.account_phone directly.
- scripts/capture-account-contacts.mjs verified anonymous HTML/RSC for all 66
  active pages: public email/phone links exist and account phone/notification
  email do not leak. Self-only save/reload/clear/invalid input, forged userId/email,
  unchanged other users/businesses and anonymous account denial passed. Local
  Supabase test-issued session used; no OTP delivery or real Google flow tested.
- Account form captures at /tmp/suqpage-contact-review/account-{1440,390,320}.png;
  exact user page contacts at sensor-{1440,390,320}.png. Three focused account
  accessibility scans and overflow checks passed. Screenshots visually inspected.
- Public matrix passed 24 states and 12 profile accessibility scans; screenshots
  in /tmp/suqpage-redesign-review. Hero playback uses a declared YouTube response
  fixture in this layout test; real third-party playback is not claimed.
- Public metadata uses the same About-first description as the visible page.
- No full check/build/release/acceptance, commit, push, remote CI or deployment.
  AGENTS.md step 8 requires explicit visual approval first; scoped commit still
  depends on required gates. Latest review URLs: port 3101 sensor page and
  /dashboard/account. Keep the current local dev server running.

## S2h — Linked products and simpler inquiries/search (FE-041)

Feature/UX L2; no data migration. New user direction precedes prior visual approval.
Readiness: canonical contracts, scoped URL behavior, contact authority, 20-selection
limit, responsive layout, failure/preview behavior and test plan defined in FE-041.
Shared application work uses current approved tenant assets, not a new client recipe.

- [x] S2h.1 Record spec/decision and baseline dirty status before code.
- [x] S2h.2 Implement pure URL/cart/message contracts; inline linked product view,
  photo/video and feature chips; canonical unit without capacity/MOQ/lead-time.
- [x] S2h.3 Implement independent single/group inquiries, clear add feedback,
  conditional list, safe app/copy handoffs and progressive Suqpage phone form.
- [x] S2h.4 Keep search results beside the map with floating filters, responsive
  phone composition and direct product links. Preserve scope/map view.
- [x] S2h.5 Focused domain/security/browser checks; desktop/390/320 screenshots,
  visual inspection and fixes; reconcile master/traceability and affected tests.
- [ ] S2h.6 Explicit visual approval, required full gates, reviewed scoped commit. Current approval gate.
  No remote publish or messaging is authorized. Prior S3b/S4/S6–S8 remain.

Affected master sections: 5.1 profile structure, public product/inquiry and discovery
journeys, frontend routing/state, security/privacy (external preparation vs inbox).

S2h check reconciliation: homepage composition still asserted the earlier producer-only
headline although the resumed Suqpage master/Market already include all shops. Its
copy assertions now match the current approved scope; map controls assertion follows
FE-041 floating controls. No eligibility/security assertion was weakened.


S2h focused evidence (2026-09-14):
- Typecheck, six product/inquiry domain regressions, existing BE-001 security tests,
  database-boundary check, homepage composition and 124-spec validation pass.
- Browser checks at 1440/390/320 verify persistent map/results, linked products,
  reload/back/focus restoration, photo/video choice, canonical options, cart restore,
  independent single/group paths, removals, delayed reply phone, focus trap,
  validation, clipboard-denial fallback and no horizontal overflow. Failed-image
  before-hydration regression is fixed and checked. Targeted Axe scans of product,
  map controls/results and composer report no violations at the reviewed widths.
- Local inbox test: simulated 503 followed by real 201, canonical two-item row,
  normalized reply phone, same retry key and 200 duplicate replay. Exact test rows
  removed transactionally. Reviewed demo has no notification email; no external
  message was sent. App destinations were inspected without launching them.
- Existing 24-state public profile matrix and entoto-ceramics owner preview/save/
  reload/restore checks pass. Browser video uses an explicit playback-layout stub;
  it does not prove third-party video availability. Real OSM tiles loaded.
- Screenshots: /tmp/suqpage-product-review/{search-map,product-photo,product-video,
  single-inquiry,group-inquiry,reply-phone,unavailable-photo}-{1440,390,320}.png.
  Successful local send: sent-inquiry-1440.png. Final narrow focus/media reruns do
  not repeat inbox submissions. Local screenshot/log artifacts are transient.
- Review: http://127.0.0.1:3101/@demo-nile-sensor-studio?product=69&ref=discovery
  and http://127.0.0.1:3101/?industry=all&q=cotton&view=search.
- Visual approval, expensive gates and scoped commit remain unclaimed. The legacy
  acceptance runner still contains pre-transition custom-renderer/modal assertions;
  reconcile those with FE-040/FE-041 during the approved S7 gate work. Focused new
  browser checks cover the current journey. Preserve the pre-existing dirty tree.


## S2i/S2j — Category pagination and standard-page integration (FE-042/BE-033)

Current user instruction adds this work; prior S2h visual approval remains pending.
Feature/defect/architecture audit, L2 pagination and L3 additive first-review lifecycle.
Ready: FE-042/BE-033 contracts and ADR-0019 resolve retirement, data retention,
first-review authority, tenant scope, pagination and rollback. Preserve baseline dirty
files; current task baseline is /tmp/suqpage-category-admin-start-status.txt.

- [x] S2i.1 Inspect discovery and dashboard entrypoints; record controlling specs.
- [x] S2i.2 Implement category results and five-row SQL pagination/counts.
- [x] S2i.3 Focused query/browser tests and desktop/phone review evidence.
- [x] S2j.1 Audit all custom request entrypoints and standard-page wiring; document
  concrete gaps, dependencies and retained historical data.
- [x] S2j.2 Remove retired routes/actions/navigation; connect owner/staff/admin
  workspaces to standard pages, products, support and direct business assignments.
- [x] S2j.3 Enable draft-owner products and implement exact-version first review,
  admin decision queue and publication, with additive storage and local backup.
- [x] S2j.4 Verify tenancy/consent/retired endpoints, owner-admin lifecycle, signup,
  desktop/phone states; reconcile master/docs/specs and traceability.
- [ ] S2j.5 Explicit visual approval, full applicable gates, reviewed scoped commit. Current approval dependency.
  No hosted mutation, deployment, external message or destructive purge authorized.

Affected master sections: 4/5 product and public entry, 7 catalog, 10 discovery,
11 signup, 13 roles/workflows, 14 retired custom integration, 15 architecture,
16 privacy/tenant/media and verification commands. Earlier managed workflow statements
are superseded by ADR-0019; planned replacements remain labelled until evidence passes.


S2i/S2j evidence (2026-09-14): `docs/SUQPAGE-APP-WIRING-AUDIT.md` maps every
criterion to focused SQL/domain/PostgreSQL/browser evidence and the retained-data
boundary. Category pagination is database-owned, five rows per page, with controls
above results and unpaid list ordering; category selection needs no search text.
Real local owner creation/product/media/submission, admin feedback, stale canonical
identity denial, resubmission/publication and public access pass. Retired endpoints
return 404. Admin staff assignment/revocation and consent/tenant failures pass.
Migration 42 is additive and locally backed up. Typecheck, 127 specs, database
boundaries, invitations, discovery and retained product-upkeep checks pass.
Screenshots and mocks are recorded in the audit. No full gate, commit or deployment.

S3b/S4 dependency reconciliation: first listing and new-owner product setup now have
local implementation/focused evidence through S2j; those portions are no longer
unimplemented. Broader asset retention, demo additions and hosted rollout remain
open. S2g's two non-demo phone values still require real input. S7 must reconcile
historical full-acceptance/custom-renderer assertions after visual approval.


## S2k — Launch frontend/backend wiring audit (FE-043/BE-034)

Newest user instruction: find and implement active frontend-only, backend-only and
partially connected features for launch. Feature/defect/operations, L2/L3. Ready:
contracts above define owner/product/location scope, privacy and test boundaries.
Baseline dirty-tree inventory: /tmp/suqpage-launch-wiring-start-status.txt; preserve
all prior transition edits. Current work extends the same authorized transition.

- [x] S2k.1 Inventory active routes/actions and cross-check canonical backend contracts.
- [x] S2k.2 Record audit and ready contracts. Affected master sections: 7 catalog,
  10 discovery, 11 onboarding, 13 roles, 15 operations, 16 media/privacy, 22 tests.
- [x] S2k.3 Connect product options/visibility and simplify legacy input fields.
- [x] S2k.4 Connect owner identity/location proposals to admin marketplace review;
  add backed-up migration, private media support and visible navigation/status.
- [x] S2k.5 Complete media reconciliation for page/private-product/history namespaces.
- [x] S2k.6 Audit remaining active inquiry/support/auth/admin connections; fix concrete
  defects, update focused and launch verification contracts, record provider limits.
- [x] S2k.7 Focused domain/PostgreSQL/browser checks, desktop/phone captures,
  update master/specs/traceability and launch audit with implemented/tested evidence.
- [ ] S2k.8 Visual/deployment approval received. Core, release, browser, accessibility,
  operations and PostgreSQL gates pass; container and scoped commit
  remain. Exact hosted blockers/evidence: docs/SUQPAGE-DEPLOYMENT-2026-09-14.md.

## S2l — PostgreSQL-only persistence (latest owner instruction)

- [x] S2l.1 Inventory runtime, tooling, fixtures and existing data paths; preserve
  source baseline under /tmp/suqpage-postgres-only-baseline and record BE-035,
  DEP-031 and ADR-0020 before production edits.
- [x] S2l.2 Remove runtime fallback adapters; preserve PostgreSQL contracts.
  Evidence: typecheck and source-boundary pass; real PostgreSQL adapter/security tests.
- [x] S2l.3 Native schema/bootstrap and guarded PostgreSQL backup/restore implemented.
  Fresh schema/66-business seed, idempotency and isolated archive/restore gate pass.
- [x] S2l.4 Convert required test/CI/browser fixtures and remove retired tooling.
  Source scan rejects retired imports/configuration. Native install and core
  adapter/workflow suites and seven production browser scenarios pass; remote CI
  and hosted publication are not claimed.
- [x] S2l.5 Focused configuration, schema, security and workflow evidence.
  Current local owner/admin/buyer browser workflow passes with desktop/390/320
  captures. See docs/SUQPAGE-LAUNCH-WIRING-AUDIT.md for the mapped matrix.
- [x] S2l.6 Reconcile current documentation and the S2k browser fixture ordering issue.
  Native runbook and audit are current; browser flow passes.
- [ ] S2l.7 CURRENT: finish container and hosted rollout gates.
  Visual approval, full check/release, seven acceptance scenarios, 72 accessibility states,
  archive operations and PostgreSQL gates passed on 2026-09-14. The production
  schema-only rehearsal passes; private data-backup approval and hosted Auth
  decision remain pending. No production migration or historical data deletion.

### S2l focused evidence and approval boundary

The former browser inquiry failure was a test ordering issue: the test observed
an old save message before the relisting request committed. Waiting for the write
and asserting persisted visibility now proves the successful inquiry and duplicate
response reach the owner inbox. No product validation was relaxed.

Current screenshots: `/tmp/suqpage-launch-review/`; local review URL:
`http://127.0.0.1:3101/@demo-nile-sensor-studio?ref=discovery`.
Explicit visual approval requested under AGENTS.md step 8. Full check/release,
production browser, archive/operations, container and remote rollout evidence
must remain unchecked until actually run and passed. No commit or deployment.


## Email-entry redirect defect (DEP-033)

- [x] R1. Inspect screenshot and production artifact: `/request` was prerendered
  without build-time Auth settings, while runtime login redirects unlinked users
  there. Identify missed legacy Auth-driver compatibility in the root proxy.
- [x] R2. Make entry/onboarding request-time and normalize proxy configuration;
  extend acceptance to build without Auth settings and revisit both entry routes.
- [x] R3. Verify manifest, proxy precedence, real local email/identity transitions,
  Auth/security/type/release gates; package without production credentials.
  Evidence: full check/release, eight browser scenarios and 931 source-file
  comparisons pass on 2026-09-16; both entry routes are dynamic.
- [x] R4. Commit scoped fix, publish under existing authorization, verify exact
  deployment and live redirects, and record limits. No account-email changes,
  provider configuration writes or messages to the user's mailbox are required.
  Evidence: source d47f1c1, Netlify 6aab00e841e9a4687217be7d confirmed ready;
  live anonymous/invalid-cookie entry has private/no-store 307-to-login and 200
  login responses. See docs/SUQPAGE-AUTH-ENTRY-FIX-2026-09-16.md for limits.


## S7 — Inclusive businesses and services (FE-044 / BE-037 / DEP-034)

- [x] S7.1 Inspect offering, inquiry, discovery, seed and publication contracts.
  Existing four kinds share products storage; diagnostic/repair demos currently
  use made_to_order. Adding service need not replace any business or item ID.
- [x] S7.2 add service kind and compatible native migration; retain
  optional quantity, canonical inquiry/security, URLs and snapshots.
- [x] S7.3 Use universal offering copy/units and Africa-focused platform narrative;
  preserve map plus paginated results, Featured eligibility and tenant identity.
- [x] S7.4 Focused data/security/type tests and desktop/390/320 review captures.
- [x] S7.5 Owner approved; full gates, scoped source commit and monitored rollout verified in S20.

## S8 — Complete starter pages and simple Save (user request 2026-09-17)

- [ ] S8.1 Resolve initial-content scope, Save visibility and meaning of orders.
  Questions are pending: demos/new private pages versus empty real pages; Save
  updates live versus private-only; custom-work inquiry versus checkout.
- [ ] S8.2 Specify filled initial examples with editable images/text/links/contact
  fields, repeat-safe application and preservation of real business/account data.
- [ ] S8.3 Specify and implement removal of edited-page review/separate publishing
  controls, with transactional save semantics and retained scope/suspension rules.
- [ ] S8.4 Verify defaults, owner/admin wiring, migrations and privacy; capture
  complete starter and editor pages for visual approval before release gates.

Master sections affected by S7/S8: opening contract; 1–5 mission/audience/UI;
6 demos; 7 catalog; 8 inquiry; 11 signup; 13 permissions; 15 architecture/security;
21 owner workflow; 22 tests. Current behavior remains until verified replacement.


## S9 — Existing city/town location selection (FE-045 / BE-038 / DEP-035)

- [x] S9.1 Inspect existing OSM place data: 54 city and 727 town features have
  English/local names and coordinates; existing area proposals intentionally keep
  storefront coordinates null. Admin approval currently requires manual map input.
- [x] S9.2 add bounded place lookup and accessible selection; save the
  selected canonical place/area anchor with owner version/tenant checks.
- [x] S9.3 Feed the saved anchor into admin map approval without treating a town
  centroid as a storefront. Preserve manual entry for missing places and exact
  storefront consent; no external geocoder/provider is introduced.
- [x] S9.4 Focused lookup, forged-ID/coordinate, persistence and privacy tests;
  capture desktop/phone keyboard selection, save/reload and admin approval.
- [x] S9.5 Owner approved; full gates, scoped source commit and monitored rollout verified in S20.


S7/S9 local evidence (2026-09-17): service and place migration/domain/security
regressions, existing product upkeep and launch wiring, homepage/narrative/inquiry
checks and typecheck pass. The isolated browser creates a service through the
owner form, verifies product/service/mixed pages and service search results,
exercises keyboard town selection/save/reload, proves null storefront fields and
admin anchor prefilling, and passes six owner/About accessibility scans. Twenty-eight
1440/390/320 screenshots are retained in `.local/service-place-review/`.
See docs/SUQPAGE-SERVICES-AND-PLACES-REVIEW.md for reproduction and limitations.
No full release gates, commit, persistent local migration or production rollout
are claimed. S8 decisions remain pending; no real content or page-publication
permissions were changed. The pre-existing untracked deno.lock is preserved.

## S8a — Automatic complete new workspaces (FE-046 / BE-039 / DEP-036)

Latest instruction resolves new-account scope: every newly created business gets
editable sample presentation content. Existing live businesses/account identities
are preserved. This does not resolve the separate Save/publication change.

- [x] S8a.1 Define scope, no-blank presentation fields, private defaults and tests.
- [x] S8a.2 Implement shared atomic defaults in signup and invitations;
  include original sample artwork and preserve repeat/tenant/data safety.
- [x] S8a.3 Focused PostgreSQL/signup/invitation tests, typecheck and desktop/phone
  captures of fully populated editors, preview, save/reload and private denial.
- [x] S8a.4 Owner approved; full gates, scoped source commit and monitored rollout verified in S20.

Master sections affected: opening checkpoint, 2 current product identity, owner
onboarding/editor descriptions. Real credentials, exact storefront, operational
inputs and retired product fields are not presentation placeholders.

S8a focused evidence (2026-09-17): `test:business-starters`, `test:signup`,
`test:standard-invitations`, `test:launch-wiring`, typecheck and 145-spec validation
pass. `scripts/capture-business-starters.ts` captures 18 desktop/390/320 states,
asserts every applicable editor field has a value, checks loaded images and
save/reload, runs three offering accessibility scans, and verifies anonymous
private-page denial plus disabled preview contact handoffs. Local test-issued
sessions are used; hosted signup and actual YouTube playback are not claimed.
Review artifacts: `.local/business-starter-review/`. No existing tenant backfill,
hosted deployment, full gates or commit has been performed.

## Local startup defect — DEP-027

- [x] Identify `dev` bypassing the existing guarded runtime loader.
- [x] Route both dev commands through the loader; honor loopback CLI
  host/port, preserve strict PostgreSQL/provider validation and set matching origin.
- [x] Verify valid/missing/invalid settings and CLI precedence with fixture child;
  verify real local startup without schema/provider mutation.

This is a nonvisual correction to the testing command, not visual approval or
permission to overwrite existing owner content.

Local runtime loader and validation tests pass. Persistent local PostgreSQL remains
on schema 45 (confirmed read-only); service/place/starter writes need 46/47. A
protected backup remains required. Installing the PostgreSQL 17 client via Homebrew
failed with `openssl@3: unknown keyword: :overwrite`; no migration or reset was
performed. This is environment/tooling, not an approval rejection. Existing Docker
archive matching was previously blocked by its non-loopback host binding; that
guard was not weakened. Restore-capable backup tooling is the remaining dependency
for persistent schema update. Isolated review schemas still support all new features.

## Authorized persistent local update — 2026-09-17 (DEP-034/035/036)

The owner explicitly asked to finish the local database update. Scope is Suqpage
loopback PostgreSQL on 54322 only; Loadgistic and hosted services are excluded.
This authorizes local backup, additive migration and verification; visual approval
and production release remain separate.

- [x] Repair/install PostgreSQL 17 backup clients without weakening archive guards.
- [x] Verify exact local target; stop Suqpage app writes; protected custom archive
  and restore rehearsal; record aggregate fingerprints before migration.
- [x] Apply reviewed migrations 46/47, prove repeat application is a no-op and
  retained business/user/product/inquiry/location data is unchanged.
- [x] Verify service writes, selected place persistence and automatic starters
  against the upgraded database in a rollback-only transaction.
- [x] Restart port 3102, verify real HTTP endpoints, update evidence and handoff.

Backup validation defect found during the local update: native pg_restore --list
returns success after the header but Node reports EPIPE while writing the rest.
DEP-031 now requires full non-executing archive parse to the null device and
valid/truncated regression coverage before retrying the protected backup.

Persistent local update completed: schema 47, 3,401 retained rows in 55 application
tables unchanged, verified restore of all 56 archived tables, rollback-only service/
place/starter writes pass, and port 3102 is healthy. Homebrew/libpq tooling and
archive validation/empty-target restore defects are resolved. Earlier local-backup
blockers above are historical. DEP-031 regression/operations tests, typecheck and
spec validation pass. See docs/SUQPAGE-LOCAL-SCHEMA-47.md for recovery evidence,
limits and the still-separate visual/production rollout gates.

## S10 — automatic local startup and simple posting (2026-09-18)

- [x] S10.1 Inspect existing state; define FE-047/BE-040/DEP-037 and DEP-027.
  Ready: preserve existing metadata, no provider/search AI dependency, no data reset.
- [x] S10.2 automatic bounded Docker Desktop/local Supabase readiness
  before Next; test ready/stopped/failure/unsafe-target cases (DEP-027).
- [x] S10.3 Five owner fields with canonical metadata preservation; backend word
  matching and unchanged eligible paginated results (FE-047/BE-040).
- [x] S10.4 Focused persistence/search/startup tests, typecheck, desktop/phone
  captures and accessibility; document implemented/tested limitations.
- [x] S10.5 Owner approved; full gates, scoped source commit and monitored rollout verified in S20.

S10 evidence (2026-09-19): focused startup/target guards, discovery and pagination,
upkeep tenant/version/idempotency/metadata preservation, typecheck pass. Nineteen
browser captures and three accessibility scans pass at 1440/390/320; create and
save use exactly five content fields. Review artifacts: `.local/business-starter-review/`.
Real launcher reused healthy services and reached Next; a separate build directory
was needed because the owner already runs 3102. Cold Docker boot is unit-tested via
injected process ports, not forced by stopping the owner's running containers.
Current next step is S10.5 visual approval; no full gates or deployment yet.

## S11 — self-service workflow, demo cleanup and map/search audit (2026-09-20)

FE-048 / BE-041 / DEP-038 supersede approval queues and five-field-only choice.
- [x] S11.1 Inspect existing routes/data contracts; classify feature, defect and
  one-time local demo correction. Newest instruction resolves first-publication
  and location review decisions. Master sections 7/10/11/13/17/18/21 affected.
- [x] S11.2 owner first Publish and live Save; immediate private/precise
  location application; retire review routes/actions with tenant/security tests.
- [x] S11.3 Simplify owner/admin screens; Product/Service input and demo descriptions.
- [x] S11.4 Measure/fix search overhead and map/phone interaction defects.
- [x] S11.5 Protected exact local-demo backup, transactional correction and verify
  IDs/media/inquiries/non-demo preservation; no hosted mutation in this step.
- [x] S11.6 Focused integration/type/spec checks and desktop/phone/axe captures;
  document evidence and give local review URL. Do not treat S10 approval as given.
- [x] S11.7 Owner approved; full gates, scoped source commit and monitored rollout verified in S20.

S11.4 includes the new city-offset request: deterministic, bounded display-only
separation for area-mode shops; exact coordinates unchanged, stable across filters,
with approximate-location labels and detailed-zoom/browser regression evidence.

Focused evidence: `docs/SUQPAGE-SELF-SERVICE-REVIEW.md`. Local demo transaction
verified 66 pages/264 offerings (39 services), protected archive, IDs/media/account/
inquiry and non-demo preservation. Fresh isolated seed proves 264 simple offerings
and 66 area locations. Map captures pass desktop/390/320 interactions and axe.

## S12 — demo capability coverage and shared example contacts (2026-09-20)

Newest request extends S11; it does not grant visual approval for S11.7.
Classify as L3 one-time demo-data operation plus recurring seed coverage.
Controlling FE-023/BE-022/DEP-019 and FE-048/BE-041/DEP-038; master sections
2/7/10/13/21 affected. Existing customer data and private account contacts stay scoped.

- [x] S12.1 audit public/Featured/search/dashboard coverage and identify
  exact Alhayarband destinations. Contact mutation depends on verified user input;
  do not infer an email/phone/social handle from a similar name.
- [x] S12.2 Record missing-feature matrix and update seed/test contracts before edits.
- [x] S12.3 Fill approved demo-only gaps with protected backup and exact before-state;
  keep identities, inquiries, account contacts, non-demo pages and starter defaults.
- [x] S12.4 Verify all admitted demos and representative public/Featured/dashboard
  browser flows, including inquiry handoff URLs without sending messages.
- [x] S12.5 Owner approved; full gates, scoped source commit and monitored rollout verified in S20.

S12 accepted input: use `@alhayabrand` even if not real; applied to four social
usernames. Demo phone/email retained, WhatsApp uses demo phone, website example.com.
Native backup verified; one-time local transaction updated 66 contact objects and
added 32 missing demo owners, 61 sample inquiries, 36 support examples. Existing
accounts/products/inquiries/support and non-demo business rows hash-identical.

S12 verification: fresh seed and all-66 retained HTTP checks pass; 14 desktop/phone
contact/inquiry/Featured/owner/admin captures pass. Seven Featured days populated,
split-word search correct, scoped axe/overflow clear. Typecheck/spec/whitespace pass.
Evidence: `docs/SUQPAGE-DEMO-CAPABILITY-REVIEW.md`. No hosted delivery/deployment claim.

## S13 — distinguish one-item inquiry from the saved list (2026-09-20)

L1 UI/copy clarification under FE-041, existing BE-001 and DEP-030; behavior stays
single-item versus independent saved selections. Ready: exact labels, product/service
language, card/detail/feedback coverage, accessibility and regression defined.
- [x] S13.1 Inspect current handlers, specs and mobile button sizing.
- [x] S13.2 clarify detail/card/review buttons and adjacent explanations.
- [x] S13.3 Verify saved-list independence and no send-on-add at desktop/390/320;
  capture product/service states and run type/focused/spec checks.
- [x] S13.4 Owner approved; full gates, scoped source commit and monitored rollout verified in S20.

S13 evidence: `scripts/capture-inquiry-clarity.mjs` passes at 1440/390/320; nine
captures in `.local/inquiry-clarity-review/`. Single inquiry contains only the third
item while two saved selections survive; Add never opens/sends an inquiry. Product
and service copy, card wrapping, count/review controls and scoped axe pass.

## S14 — one Suqpage favicon everywhere (2026-09-20)

L1 metadata/UI correction under FE-038 and existing DEP-030. Ready: inherit root
icons, retain business-specific sharing metadata/logo and stored historical assets.
- [x] S14.1 Inspect root and business metadata plus business icon upload control.
- [x] S14.2 remove tenant icon override and obsolete upload field.
- [x] S14.3 Verify browser icon inheritance across routes/navigation, PWA assets,
  type/spec checks; preserve earlier visual/release gates.

## S15 — concise UI copy and matching icons (2026-09-20)

Newest instruction supersedes S13 helper paragraphs. FE-041/FE-048, master 5.3.
- [x] S15.1 Inspect inquiry, posting, page/business editors and dashboard copy.
- [x] S15.2 remove redundant/internal explanations; keep precise labels,
  errors/status, input requirements and necessary privacy/consent information.
- [x] S15.3 Record standing product rule; focused desktop/phone/type/spec checks.

S15 final verification: 29 owner/admin/starter captures and nine inquiry captures
pass after copy cleanup; typecheck, 151-spec validation and whitespace checks pass.
No full gate, commit or deployment is claimed; S11.7/S12.5/S13.4 remain pending.

## S16 — Prairie Meadows missing from discovery (2026-09-20)

Defect L2 plus one-time local repair under BE-041/FE-048/DEP-038. Inspection:
active business and listed item, saved area proposal pending, no discovery profile
or industry row. No search match can pass those missing eligibility joins.
- [x] S16.1 Identify publication/location dependency and define atomic regression.
- [x] S16.2 apply pending saved location during guarded publication.
- [x] S16.3 Focused atomicity/tenant/privacy/search regression; protected exact
  local repair and browser search proof. Preserve all page/product/account content.
- [x] S16.4 Update evidence; earlier visual/full/release/commit gates remain pending.

S14–S16 evidence: `docs/SUQPAGE-DISCOVERY-AND-COPY-REVIEW.md`.
First publication now atomically applies saved discovery setup; protected local
repair preserves page/product/account content. Business and product searches pass
at desktop/390/320. Favicon inheritance and inquiry-list independence pass.

## S17 — email-only access and Suqpage email branding (2026-09-20)

L2 auth defect/UI plus L3 configuration preparation; FE-038/BE-031/DEP-027/DEP-029.
Ready: disable Google initiation, preserve accounts/OTP, brand all email types,
preserve verified sender address/credentials, live URLs and compatibility routes.
Master sections 5/11/17 affected. Earlier review/rollout gates remain pending.
- [x] S17.1 Inspect auth entry, account copy, local provisioning, templates and old names.
- [x] S17.2 Enforce email-only policy and remove stale account/provider copy.
- [x] S17.3 Complete branded templates/config/guard and focused regressions.
- [x] S17.4 Verify local browser/templates, mail delivery and one-time code use;
  prepare exact hosted input patches. Saved CLI support tracked in S19.
- [x] S17.5 Owner approved; full gates, scoped source commit and monitored rollout verified in S20.

## S18 — connect the owner's suqpage.com domain

Owner confirms GoDaddy DNS; primary `suqpage.com`, `www` redirects to primary.
Operations preparation under DEP-026/DEP-029; no nameserver or mail-record change.
- [x] Independently verify Netlify target, inspect DNS and preserve config.
- [x] Prepare exact GoDaddy records; owner updated DNS and public resolution verifies both targets.
- [x] Register primary Netlify domain and www alias; readback proves current deployment unchanged.
- [x] Verify issued managed certificate for apex/www, HTTPS login 200 and www→apex 301.
- [ ] Review exact Auth callback plan and canonical-domain cutover after resolving S19 readback mismatch.
- [ ] Verify email entry, public links, redirects and rollback; record rollout evidence.

S17/S18 evidence: `docs/SUQPAGE-EMAIL-AND-DOMAIN-REVIEW.md`. Netlify alias-only
association rejected (primary domain required); remote readback unchanged. Exact
GoDaddy replacements resolve correctly (2026-09-21). Subsequent primary/www registration
and managed TLS succeeded; homepage, About, health and login return 200, www redirects
301 preserving path/query. Auth/app canonical cutover remains pending.

## S19 — explicitly reuse saved Supabase CLI credentials (2026-09-21)

User accepted the credential-source extension while preserving all existing
DEP-029 protections. L3 non-visual operations adapter; master section 17 affected.
- [x] Inspect guard, CLI storage contract and current dirty scope; update spec first.
- [x] Implement opt-in bounded macOS Keychain reader and bound v2 plans.
- [x] All 50 focused source/secret-redaction/guard regressions, typecheck and 151-spec validation pass.
- [x] Produce a read-only hosted email-branding review using saved login after owner allowed macOS Keychain; private backup and review retained.
- [x] Owner approved exact email plan/digest; guarded apply attempted once.
- [x] Inspect readback: all 27 approved fields match; only 22 matching provider customization flags changed false→true. No credential/provider drift, retry or restore.
- [x] Verify guard correction: 52 focused tests, typecheck and specs pass. Independent saved readback exactly matches approved fields plus predicted flags. Original attempt remains failed; no retry/restore.
- [x] S20 owner approval resolved the separate Auth-domain plan; exact apply/readback and canonical application deployment are verified.

## S20 — finish and publish the reviewed release (2026-09-21)

Newest owner instruction confirms prior approval and explicitly requests completion
and publication. Treat the prepared S7–S19 design/workflow candidate and the exact
S18 Auth-domain review as approved for final gates and deployment. No further
visual/administrative approval pause for the same reviewed scope. Preserve all
backup, target, single-write, readback, tenant and data-integrity checks. The
owner directs retention of independently reconciled email branding.

Operations L4 under DEP-026/029/034/035/036/037/038; master section 17 affected.
- [x] Record current dirty scope; preserve unrelated deno.lock.
- [x] Applied approved exact Auth-domain plan while fresh; full readback matches.
- [x] Full check, release, operations, artifact verification and all nine provider browser scenarios pass on the final candidate.
- [x] Owner-approved private production backup completed; 56 tables restored,
  additive 46/47 rehearsed, all 3,222 application rows preserved; repeat migration no-op.
- [x] Reviewed/staged 198 declared task files; source commit be134a2. Unrelated deno.lock preserved.
- [x] Schema 47, both exact demo corrections and canonical environment verified; published 6ab0d349f099639821fa0f9a.
- [x] Verified suqpage.com public routes and anonymous owner/admin denial, search, links, email entry,
  HTTPS/redirects and health; retain rollout and rollback evidence.

### S20a — lotion category search regression

User reports lotion missing under Personal & Homecare. Reproduce local/live,
check public product/category eligibility, add a regression for the concrete
category query and verify desktop/phone navigation before release. Direct local
HTTP currently contains Aloe Body Lotion; production response does not.

Full-check first failure is stale launch-wiring test expectations: it still
requires location approval after owner Save, contrary to BE-041. Update assertions
to immediate saved canonical location and retain stale/admin/privacy coverage.

S20a human-query audit: focused matching and 10,000-product performance pass
(450/436/492 ms). Browser validation found HTML minLength blocked explicit
one-character submissions; fix and verify. Test delayed responses against newer
typing, category/type retention, product Back and 1440/390/320 layouts next.

S20a focused completion: case/plural/accent/phrase/Unicode, description/location,
Prairie Meadows name/handle, category/privacy and literal-negative tests pass.
Browser delay reproduces and verifies newer-input preservation; 1440/390/320
search/type/detail/Back/explicit punctuation pass with zero overflow. Full gates
now running. No managed search provider or translation added.

S20 release gates: full check, release (including provider security smoke), operations,
151-spec validation and production dependency audit pass. Netlify packaging first
failed under cached CLI 23.5.0/Deno support; controlled retry with the prior deployment's
CLI 27.1.1 passed. Artifact privacy, dynamic Auth, Linux sharp and source comparison
pass. Full browser gate found stale inquiry labels, outdated staff-review/form
expectations, and fixtures using raw PostgreSQL IDs or old business video storage.
Update the fixture adapter and acceptance assertions to FE-048/BE-041, retain
private media, staff options/visibility, inquiry rejection and legacy-cart coverage,
and rerun the complete browser suite. No application guard was weakened.

S20b: owner reports Prairie Meadows/grass still missing. Production contains neither;
local has published Prairie Meadows/Farm Grass with Dirt with approved Dodolla setup.
Browser reproduction also found query-only links show the category chooser. Fix that
and preserve valid selected places when their query produces no matches; add exact
negative regressions before rebuilding. Await owner's current URL clarification.

S20b resolution: owner confirmed port 3102, then found the listing after choosing
Agriculture. Local browser independently confirms Prairie Meadows and grass both
return one offering and one business. Category filtering stays intact. Query-only
link and zero-result location regressions pass. Final rebuild/gates are running.

Final nine browser scenarios pass. Additional exact non-Latin regression exposed
Latin-only fallback detection missing Greek/Cyrillic names. Broaden that detection
without changing eligibility, predicates or providers; rerun focused Unicode/performance,
check, release and the combined browser gate before publication.

Final Unicode candidate: release, operations, Netlify artifact verification and all nine
browser scenarios pass. Account-phone test waits for its save confirmation before
reload. A repeated full check records its own exit artifact after automatic review
rejected manual transcription of the earlier successful process result. No gate
is bypassed; production migration/application publication remain pending.

Final full check completed with actual process exit 0; all mandatory gate artifacts
are successful and newer than the final search code. The approval-review concern
is resolved through execution evidence. No production write has happened yet.

Production migration committed 46/47; its post-commit SELECT used the temporary
login outside SET LOCAL ROLE and failed with PostgreSQL 42501. No migration retry
or restore occurred. Independent read-only reconciliation proves schema 47, all
55 original application tables/3,222 rows unchanged against the approved archive,
and unchanged runtime/anonymous permissions. The original failed attempt remains
retained separately from successful reconciliation evidence.

## Verified rollout — 2026-09-21

Source `be134a247c8ea54b18b882f9e2368058f7fbc0ee` is published as Netlify `6ab0d349f099639821fa0f9a` at https://suqpage.com.
Full check, release, operations, all nine isolated provider browser scenarios,
artifact privacy and production dependency audit pass. Production schema 47,
64 updated demo pages/256 offerings, all 64 public routes, live search at
1440/390/320, email-only entry, private-route denial, health and www redirects
are independently verified. Mapped focused tests and earlier desktop/phone
reviews remain applicable; the owner approved this release.

Earlier dated pending-approval/local-only notes are superseded by this rollout.
No real external email was sent and no authenticated hosted account was used
for testing; those admission checks remain separate from local provider evidence.
Demo contact destinations are examples, not verified delivery channels.
See docs/SUQPAGE-RELEASE-2026-09-21.md for backup, rollback and limitations.

Current handoff: S20 publication is complete. Earlier dated S2–S19 checkpoint
notes retain history; their visual/commit/rollout dependencies are resolved by
S20 where within this release. Real external email delivery and authenticated
hosted owner/admin smoke remain admission checks, not claimed completed tests.

## S21 — efficient spelling matches and publish (2026-09-21)

Feature/operations L3/L4 under BE-040, FE-042, DEP-037. Owner explicitly approves
finishing and publishing the single ranked-list refinement. No new UI section.
Definition of Ready: scope, ordering, capped alternatives, eligibility, Unicode,
index/write consistency, backup/rollback and tests are specified above. Existing
untracked deno.lock remains outside this task. Master sections 10/17/22 affected.

- [x] Inspect current search/schema/ports and record contracts before code.
- [x] Implement additive indexes and bounded candidate/ranking queries.
- [x] Prove English/Amharic quality, exact-first ordering, privacy and paging;
  measure index plans and 10,000-offering performance.
- [x] Desktop/390/320 captures, full check, release/build/privacy/operations gates
  and nine provider-backed browser scenarios pass.
- [x] Reviewed and committed explicit task paths as 0fc10c0; protected backup
  and rehearsal preserve all existing records.
- [x] Migration 48 and runtime checks passed; deploy 6ab0dfee5b7bbcd1cb221ce6
  is ready on suqpage.com. Fifteen live route checks passed.

S21 complete: hosted desktop/390/320 typo-search checks passed. Local development
remains on 127.0.0.1:3102 with schema 48. Existing untracked deno.lock is preserved;
no Git push was performed. No further search rollout steps remain. The documented
external-email delivery limitations belong to the earlier release admission work.

## S22 — optional map-overlay search drawer

Feature L2; FE-042 / BE-040 / DEP-037. User requests sliding search/results/filters
and All categories by default. No material open choices. Master sections 5/10/22
contain affected presentation/default statements; prior deployment approval covered
S21, and the new visual states require the repository's focused review step.

- [x] Inspect existing map/search/session/CSS and define acceptance criteria.
- [x] Default all categories; replace chooser/fixed layout/filter sheet
  with a toggleable drawer, retaining map and query state.
- [x] Focused database/type/homepage/discovery tests and desktop/390/320 captures pass.
- [x] Owner approved the combined local visuals on 2026-09-21 (AGENTS.md §8).
- [x] Full/release gates, scoped commit and approved publication completed with S23/S24.

Existing untracked deno.lock is outside this task. No migration or hosted settings
change is needed. Rollback is the previous presentation/default code.

Review URL: http://127.0.0.1:3102. Focused captures: `.local/search-drawer-review/`
map/search at 1440, 390 and 320 pixels. The new dedicated browser suite passes;
full/release/deployment gates and task commit await the visual review.

## S23 — workflow wiring audit (2026-09-21)

Defect/security L2; FE-038/BE-031 and FE-048/BE-041. Audit public, owner and
admin controls against real commands, persistence, permissions and feedback.
S22 remains locally tested, awaiting visual review; it is not replaced or approved
by this audit. Master sections 11/13/16 are affected. Definition of Ready:
confirmed defects below, no new permissions/providers/schema, isolated fixtures,
negative tests, focused desktop/phone review, rollback by reverting task code.

- [x] Trace navigation, Auth, publishing, contacts, offerings, inquiries, support,
  insights, featured schedules, sponsors and retired routes.
- [x] Fix managed-password recovery, shadowed admin contact fields,
  no-op inquiry success and inaccurate staff/suspended publication guidance;
  also fix managed staff/invitation password setup and obsolete review counts.
- [x] Verify positive/negative persistence, role/privacy behavior and focused UI.
- [x] Record audit evidence and remaining provider/rollout limits in
  `docs/SUQPAGE-WORKFLOW-WIRING-AUDIT-2026-09-21.md`.
- [x] Owner visual approval and applicable full/release gates pass; commit/publication tracked below.

No real messages, hosted changes, or existing customer-data mutations are needed.
Preserve the pre-existing S22 changes and user-owned deno.lock.

## S24 — plain language and recognizable categories

UI/copy feature L1, FE-041/FE-044, existing BE-001/BE-037 contracts unchanged.
S22/S23 remain pending review; this request adds clearer language and category
presentation, not new search eligibility or inquiry behavior. Master 5/8/18/19
are affected. Ready: exact terminology, physical-object category illustrations,
accessible text labels, local assets, mobile tests and no backend changes.

- [x] Inspect current product/composer, category definitions, Featured, About,
  owner/admin language and prior task boundaries.
- [x] Apply consistent inquiry-list labels, shorten public/workspace copy,
  and share recognizable category illustrations across category surfaces.
- [x] Verify single/group actions, category filtering, keyboard use, long labels,
  desktop/390/320 layouts; record focused evidence and review URLs.
- [x] Owner visual approval and full gates pass; commit/publication with S22/S23 tracked below.

Use existing category keys and preserve tenant-authored names/descriptions, prices,
options, permissions, links and data. No image provider, new package or photo fetch.

Local evidence: typecheck, spec validation, narrative/artwork/fallback, homepage,
product-inquiry, service-offerings and discovery-pagination tests pass. Focused
category, drawer and inquiry browser checks pass at 1440/390/320, including
keyboard/Escape, category/all reset, About links, accessibility, preserved map,
single/group separation and no horizontal overflow. Captures:
`.local/category-language-review/`, `.local/inquiry-clarity-review/` and
`.local/search-drawer-review/`. Product 320, category 390, Featured 390 and About
390 images inspected locally. Native owner/admin selects preserve field names;
their category picture integration is typechecked, not a new hosted workflow test.
Review at http://127.0.0.1:3102/?view=search, /featured and /about.
No S22–S24 commit, full release gate or publication is claimed.

## S22–S24 — approved release (2026-09-21)

The owner reviewed the local candidate and explicitly said “ok looks good deploy”.
This approves the combined visual candidate and publication. Operations L4,
DEP_BASE / DEP-037; existing schema 48, Auth configuration and tenant data remain.

- [x] Record visual approval and deployment authorization for S22–S24.
- [x] Full check, release, all nine isolated provider browser scenarios and operations pass.
- [x] Scoped source commit `c565f91`; production target and protected restore verified.
- [x] Inspected artifact published as `6ab13a1acad8a70492ba56a9`; monitored routes and core flows.
- [x] Source/deploy IDs, monitored evidence and limitations recorded; deno.lock preserved.

Rollback republishes S21 deploy 6ab0dfee5b7bbcd1cb221ce6; no schema rollback.
No Git push or provider-configuration change is required.

Approved-release evidence above supersedes the earlier S22–S24 pending-review
notes. Current rollout: `docs/SUQPAGE-S22-S24-RELEASE-2026-09-21.md`.

S22–S24 published: https://suqpage.com serves `c565f91` via Netlify
`6ab13a1acad8a70492ba56a9`. Required release gates pass. Hosted category/inquiry
checks and pagination pass at 1440/390/320; desktop drawer/map state also passes.

- [ ] Complete combined live phone-map interaction verification after network/
  marker-readiness timeouts. This is an explicitly retained verification limit,
  not a failed local acceptance gate or a claim of successful live phone testing.

Real-email/hosted-session limits remain documented separately. Local development
remains at 127.0.0.1:3102. Current evidence supersedes earlier pending-publication notes.

## S25 — five-language interface (FE-049, 2026-09-22)

Feature L2, dependent on the deployed S22–S24 baseline. Latest request covers
English, Amharic, Afaan Oromo, Somali and Tigrinya across public and dashboards.
Preserve user content and use clear language with English fallback for unclear
terms. No hosted/provider/database mutation is needed.

- [x] Inventory existing hard-coded text; record FE-049 and ADR-0022; DOR met.
- [x] Language context, selected catalog and persistent accessible selector.
- [x] Explicit UI text wiring, translations and reviewed fallback inventory.
- [x] Focused type/security/content-preservation tests and desktop/phone captures.
- [x] Owner directed completion and publication on 2026-09-23.
- [ ] Full applicable gates, scoped commit and separately verified rollout.

Prior live phone-map verification limit remains open above. Existing untracked
deno.lock is user-owned and outside this task. Native-speaker review is not claimed.

### S25 priority refinement — visible mobile results (2026-09-23, FE-042)

The owner's screenshot shows controls crowding out results. Continue localization
while fixing this focused visual defect; no backend or hosted mutation.

- [x] Record compact controls/disclosure, footer pagination and visibility criteria
  in FE-042; DOR met. Master prompt §§5/10 statements affected.
- [x] Compact search row, optional Filters, remove repeated headings,
  put paging below the scrollable results; keep map and backend paging contracts.
- [x] Focused typecheck/browser checks at desktop/390/320 and all five locales;
  capture collapsed/expanded/paged states and inspect the phone result area.
- [x] Owner approval to proceed through release/publication on 2026-09-23.
  Preview: http://127.0.0.1:3102/?view=search.

Evidence: typecheck, catalog freshness, four localization safety tests and
153-spec validation pass. `capture-search-drawer.mjs` verifies visible cards,
unclipped tabs/paging, disclosure, paging scroll reset, retained map and keyboard
behavior. `capture-category-language.mjs` passes category controls, keyboard and
Axe accessibility at 1440/390/320. Phone images inspected in
`.local/search-drawer-review/`: four full cards at 390×844 and three at 320×740.
No full release gate, commit or deployment was run for this candidate.

S25 language coverage remains in progress; this refinement does not claim the
whole localization rollout complete or the draft translations native-reviewed.

### Search ranking defect — BE-040 (2026-09-23)

- [x] Reproduce `gras`: Farm Grass with Dirt is eighth locally; original-title
  matching ties with the plural alternative `gra` and alphabetical order wins.
- [x] Define original-term title/document precedence before variant-only matches;
  preserve all eligibility, counts, five-row pagination and bounded spelling rules.
- [x] Add isolated PostgreSQL regression, implement ranking in results
  and suggestions, prove first-page relevance and stable later pages.
- [x] Verify existing word/spelling/pagination, performance fixture, typecheck and
  local browser results. Record evidence without claiming publication.

Evidence: regression fails before and passes after; `test:discovery-pagination`
passes new ranking, existing spelling, 21 human-query variants and six database
cases. Typecheck/spec validation pass. Local `gras` keeps 39 results but moves Farm
Grass with Dirt from eighth to first. Browser 1440/390/320 confirms first-visible
placement and stable page navigation; captures `.local/search-ranking/`.
10,000-offering performance passes on the controlled isolated retry (normal
832–945ms, spelling 1192–1560ms); first concurrent run exceeded 2.5 seconds and is
retained as a measurement limit. No application database records were changed.
- [ ] **Current release dependency:** earlier visual candidate approval, combined
  build/release gates, scoped commit and publication remain pending. No ranking
  deployment or production performance claim.

### Launch-demo review and clock labels — 2026-09-23

The owner will present **suqpage.com**. Local findings must not be represented as
live fixes. FE-032/FE-033 govern header/clock changes; earlier FE-049 and compact
drawer rollout remain open. Demo readiness is an evidence-based review, not a
promise that every external channel or hosted email delivery works.

- [x] DOR: remove logo caption; use AM/PM for displayed times and admin controls;
  preserve machine values, EAT timezone and exact agenda boundaries.
- [x] Implement clock/header refinement and focused regressions.
- [x] Read-only live public audit: health/routes, search/map, Featured, product
  images/video controls, single/group inquiries and contact destinations, login.
- [x] Exercise local owner/admin flows using disposable fixtures; identify live
  coverage limits. Do not message customers or alter real merchant records.
- [x] Record confirmed workflow gaps, corrections and evidence in
  `docs/SUQPAGE-DEMO-WORKFLOW-AUDIT-2026-09-23.md`.
- [ ] Candidate visual approval, remaining FE-049 coverage and full applicable
  gates before authorized rollout.

Owner clarification: prioritize incomplete end-to-end workflows, including local
behavior, rather than describing local-versus-live rollout as the audit finding.
Confirmed gap: Featured announces TikTok Live with no configured watch URL.
Fix that misleading state; inspect support retries and exercise UI→persistence→
owner receipt, not only HTTP route status. Existing disposable owner workflow
passes identity/location/product options/publish/live save/inquiry receipt and
owner/admin destinations. No external messages were sent.

Earlier compact drawer visual approval and broader localization remain pending;
this focused backend defect does not approve or replace either task.

Support retry correction evidence (BE-018/FE-019): real UI + real API handlers +
isolated PostgreSQL pass failed-load recovery, lost opening response/reopen/retry,
lost reply/retry, same persisted counts, close and new chat. Only HTTP transport
is intercepted to lose responses; external notifications are disabled. Existing
support permission/attachment/assignment tests pass. Local customer Send button
also reaches the real owner inbox with its selected product option. Typecheck,
localization safety/freshness and spec validation pass; no release claim.


### S25 release authorization — 2026-09-23

The owner explicitly directed “go ahead” after the workflow audit and local
candidate evidence. This approves proceeding through remaining localization,
full verification and production publication; do not request the same approval
again. No hosted Auth/SMTP, DNS, database schema or merchant-data change is planned.

- [x] Candidate approval and deployment authorization recorded.
- [x] Close platform-text coverage and selected-client-catalog gaps;
  retain documented English terms and preserve all merchant content.
- [x] Complete five-language public/owner/admin focused browser checks.
- [x] Run check, release, acceptance and operations in a clean isolated candidate.
- [x] Verify production target, protected recovery archive and rollback deployment.
- [ ] Review/stage exact task files, commit, package and publish the tested source.
- [ ] Independently verify and monitor the live deployment and update evidence.

The existing untracked deno.lock remains excluded. No Git push is requested.

Release verification found a reproducible direct-product first-click race: the
initial inquiry-list restore could overwrite a selection. FE-041 now requires
ready-before-send/add controls; implement and retest the direct link before
resuming final gates. This is within the approved workflow completion scope.

FE-049 focused completion: 982 catalog entries per language, six locale/content/
payload/coverage tests and 85 browser checks across public/owner/admin routes at
1440/390/320 pass. English fallbacks for retained technical/legacy/design copy are
explicit in locales/english-fallbacks.json. Client context excludes server-only
copy. Native-speaker review is not claimed. Final common inquiry feedback and
support statuses retain the same tested formatting and data boundaries.

FE-041 direct-link regression failed before and passes after: twelve immediate
selections persist across reload. Product buttons wait for inquiry restoration.
Regression retained in scripts/capture-product-ready.mjs. The production backup
restores 56 tables and preserves 3,607 rows across 55 application tables; schema
48 is unchanged. Full check and provider acceptance are currently running.

Final browser verification found pre-hydration search typing could be lost.
FE-042 requires ready-before-edit search controls; preserve immediate-typing
regression and rerun affected gates before packaging.

Full check, release, operations and final Netlify packaging pass. Generated
artifact privacy scan excludes protected files and known production credentials;
application source bytes match the working candidate. Final production-mode
acceptance is the current gate. Updated search readiness passes focused browser
and typecheck checks and is included in the final build.

All nine production-mode acceptance scenarios pass. Full gate set is green;
current step is scoped source commit and publication of the verified artifact.
