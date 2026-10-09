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
- [x] Review/stage exact task files, commit, package and publish the tested source.
- [x] Independently verify and monitor the live deployment and update evidence.

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

S25 publication incident: deployment 6ab397a6fa1799d61d40c665 returned HTTP 500
because its Mac-built archive lacked Linux Sharp/libvips optional packages.
The planned application rollback restored 6ab13a1acad8a70492ba56a9; homepage
and health return 200. No database or Auth configuration was changed.
Current recovery: DEP-026 exact-artifact Linux transform gate, restore only
lockfile-matched native packages in the isolated build, rebuild/verify, scoped
commit and republish after the new gate passes. Existing application gates remain
valid; the defect is native packaging, not localization or runtime configuration.

S25 complete: corrected deployment 6ab399ae7a6f90b9daec07dc is independently
verified and monitored healthy. Five-language live browser and public checks
pass; protected data/settings unchanged. The initial packaging incident,
rollback, added Linux archive gate, recovery source and limits are recorded in
docs/SUQPAGE-S25-RELEASE-2026-09-23.md. This supersedes earlier pending S25 notes.

## S26 — owner-selected setup handle (FE-038 / BE-031)

Classification: feature with tenant-creation integrity implications. Definition
of Ready met: explicit creation-only scope, format/availability/privacy/failure
contracts and compatibility above; no schema or hosted configuration changes.
- [x] Shared validation and authoritative case-insensitive availability.
- [x] Authenticated bounded check and final creation conflict/race handling.
- [x] Simple localized handle field, address preview and current-input feedback.
- [x] Focused PostgreSQL/security/browser tests and desktop/phone captures.
- [x] Final S28 design visually approved; full/release gates, commit and publication complete.
Existing deno.lock is user-owned and excluded.

## S27 — product photo/video gallery (FE-050 / BE-042 / DEP-039)

Added user request alongside S26; not replacing handle work. Classification:
feature + additive persistence. S26 focused signup/race/browser checks pass.
- [x] Additive media contract/schema and legacy compatibility.
- [x] Tenant-scoped save, snapshot/retention, media access and cleanup integration.
- [x] Simple photos/videos editor and horizontal thumbnail/arrow/swipe viewer.
- [x] Focused persistence/security/browser tests and desktop/phone captures.
- [x] Final combined design visually approved; release/rollout gates complete.

Focused persistence, revision, retention, native migration, typecheck and
localization pass. Browser workflow passes: four mixed media entries, arrows/thumbnails, keyboard
and horizontal scroll, explicit video play/unmount, reorder/reload, adding a
photo then saving another edit without reupload, removal, publication, private
media and inquiries. Desktop/390/320 captures inspected in `.local/gallery-review`;
handle screenshots inspected in `.local/handle-review`. Final status: visually approved and released; see the S28 release record below.


## S28 — automatic starter, handle settings and fixed logo (FE-051/BE-043/DEP-040)

Newest instruction supersedes manual handle entry in S26 signup. Preserve S27
and the prior task edits; only unrelated pre-existing `deno.lock` stays untouched.
Classification: branding defect + feature with persistence/tenant invariants.
- [x] Automatic available handle, atomic sample galleries and signup preview destination.
- [x] Registry/cooldown, owner settings, support link and audited admin override.
- [x] Fixed wordmark font in all five locales.
- [x] Focused migration/security/browser tests; desktop/phone captures.
- [x] User visual approval, full/build/release gates and scoped commit/rollout complete.
Use 30 days between changes; first change immediate; reserve old links and redirect.

S28 focused evidence: signup and lifecycle tests, starter completeness, native
schema install/reapply, invitations, product-upkeep/gallery, typecheck, identity,
localization (1,013 messages per local catalog), spec and boundary checks pass.
`capture-handle-setup.mjs` passes real local signup → populated preview, checks,
rename/cooldown/support, administrator exception, old product redirects/private
denial and 1440/390/320 captures. All five wordmark captures have identical bytes.
`capture-business-starters.ts` passes 29 captures, all active fields/images,
save/reload, tenant denial and private contact safety. Captures inspected in
`.local/starter-handle-review` and `.local/business-starter-review`.
Local and production schema 50 applied; preflight requires it. Visual approval,
full/build/release gates, scoped commit and backup/migration/publication complete.
No outgoing test emails or hosted configuration changes.
Original S26 signup selection is superseded by automatic signup + settings edits.

## S29 — usable demo sign-in aliases (DEP-041 / BE-022 / BE-030)

Classification: one-time operations/identity correction; newest explicit owner
request authorizes local and live demo accounts using the supplied plus-address
inbox. Preserve S26–S28 work and unrelated deno.lock. No app deployment involved.
- [x] Inventory and admit exact demo accounts; collision and target checks.
- [x] Protected before-images; local provider rehearsal and negative checks.
- [x] Apply locally, reconcile identities/access/public-data invariants.
- [x] Apply hosted exact account plan, verify identities/access and public health.
- [x] Private sign-in directory, spec/trace evidence and operational handoff.
Missing provider links must be created for existing demo users; existing UUIDs
remain unchanged. No outgoing messages or hosted configuration changes.

S29 complete: 79 local / 77 hosted accounts corrected, including 32 / 30 new
provider links. Private before-images and journals retained; real account emails,
all existing provider UUIDs/links and 13 public-content/role tables per target
unchanged. All account readbacks and ten representative application sign-in/
dashboard/sign-out paths pass. Health 200; spec validation passes (154 isolated / 160 working). Directory:
`.local/demo-account-emails-20260923/SIGN-IN-ACCOUNTS.md`. No test mail sent;
inbox receipt not claimed. No app deployment, schema or hosted config change.
See `docs/SUQPAGE-DEMO-ACCOUNT-ACCESS.md`. S26–S28 are released under the verified S28 record below.

## S26–S28 approved release — 2026-09-23

Owner explicitly approved the visual result and deployment. This satisfies the
visual checkpoint for the gallery, automatic starter, handle settings and logo.
- [x] Visual approval recorded; demo email directory supplied.
- [x] Full check, release, provider acceptance and operations gates.
- [x] Fresh protected production backup; restore/migrate/reapply rehearsal.
- [x] Review exact additive schema 49/50 SQL, apply and verify production.
- [x] Scope/source commit; Netlify artifact privacy and Linux native gate.
- [x] Publish, live gallery/handle/account checks, monitoring and release record.
S29 aliases must remain unchanged. Roll back the app to the current S25 deploy
if needed; retain additive columns/registry and all customer/gallery data.

S28 full gates pass, including nine provider-backed browser workflows and the
exact Netlify Linux image transform/privacy checks. Production migration and
independent readback pass; no hosted Auth/SMTP changes.

S28 complete: source `90094c6`, live Netlify deployment
`6ab3c4e43c9a7f1e972648ad`, schema 50. All required local gates, live gallery/
owner/handle/wordmark checks, 15 public checks and health monitoring pass.
`docs/SUQPAGE-S28-RELEASE-2026-09-23.md` contains exact evidence and limits.
Demo emails remain in `.local/demo-account-emails-20260923/SIGN-IN-ACCOUNTS.md`.
Only unrelated `deno.lock` remains outside the release; no Git push performed.

## S30 — visible mobile Suqpage brand (FE-038 / FE-032 / FE-051)

Classification: L1 visual defect. Existing mobile rules hide the public header
and the workspace has no visible brand outside its hidden sidebar.
- [x] Inspect shell/brand rules; define responsive acceptance in FE-038.
- [x] Restore compact public/workspace branding and use the existing
  shop return row; preserve locale typography and tenant identity.
- [x] Focused browser checks at desktop/390/320, all locales, map height and
  shop return navigation; typecheck/spec validation; capture review images.
- [x] Owner visual approval: explicit “deploy” instruction on 2026-09-23.
- [x] Applicable full gates and task-scoped commit `87aaced`.
- [x] Authorized publication and independent live verification.

Unrelated `deno.lock` remains untouched. No database or hosted Auth change.

Local evidence: 39 public + 51 authenticated responsive checks pass, including
all five locales and desktop/390/320. Private captures and JSON receipts are in
`.local/mobile-brand-review/` and its `authenticated/` directory. Both phone
search panels retain >250px of scrollable results and collapse successfully;
`results-verified.json` records dimensions. Typecheck, 160-spec validation and
`test-pwa-shell.mjs` pass. No email sent. New mobile appearance shared for
review and explicitly approved. Full check, release, nine provider acceptance
scenarios, operations and artifact/native verification now pass. Publication
and final monitoring pass; see `docs/SUQPAGE-S30-RELEASE-2026-09-23.md`.

S30 complete: live deployment `6ab3dc37aea724cbcfbcb994`, source `87aaced`.
All required gates, 90 live responsive checks, phone search-panel checks and
15 public checks pass. Fresh backup restores all 57 tables/3,781 rows; temporary
restore role removed. Schema 50 unchanged; no hosted configuration changes.

## S31 — horizontal logo proportions and spacing (FE-038 / FE-051)

Owner selected the comparison's icon-plus-wordmark design and requested vertical
centering. S-in-pin images remain mockups only. Actual glyph/pin centers are
now corrected and verified; current dependency is final visual approval and
the applicable release gates. Preserve existing S31 work and unrelated `deno.lock`.

Classification: L1 visual refinement; preserve S30 visibility and existing brand.
- [x] Inspect the shared component and responsive overrides; define FE-038 scope.
- [x] Measure/capture the existing headers; consolidate icon/text sizes
  and reduce the gap to 4px without changing artwork or locale typography.
- [x] Focused desktop/390/320 and locale checks; compare header captures;
  typecheck/spec validation and review the result with the owner.
- [ ] Current: visual approval, applicable full gates and task-scoped commit.
- [ ] Publication and live verification if approved.

Only unrelated `deno.lock` predates this task. No data, Auth or provider changes.

S31 local evidence: 39 public + 51 owner checks pass across all five locales.
Measured gap 4px; desktop text 24px, mobile 22px, shop return row 18px; 9:10
icon ratio and >=44px link height. Typecheck/spec/PWA contracts pass. Captures,
before/after measurements and comparison: `.local/brand-spacing-review/`.
No outgoing mail, full gates, commit or publication claimed for S31.

## S32 — simple transport requests and admin queue (FE-019 / BE-018 / DEP-015)

Confirmed app: Suqpage. L2 feature with additive migration (L3 rollout).
Customer enters only name, phone, origin and destination; no email, message or
attachment required for transport intake. Existing help flow remains available.
- [x] Inspect existing public support, authorization and persistence; define scope.
- [x] Implement four-field intake, category-filtered paginated admin list,
  private manual company handoff and audit, preserving existing conversations.
- [x] Verify validation, replay, tenant/role denial, concurrent handoff, migration
  and old help flow with PostgreSQL tests; capture desktop and phone workflows.
- [ ] Current: owner visual review, then full check/release/acceptance and scoped commit.
- [ ] Production backup/migration/publication only with applicable rollout gates.

S31 remains pending final visual review and release; preserve its edits and
unrelated deno.lock. No carrier booking integration or external message sending.

S32 focused evidence: local migration 51 applied. Existing support and replay
tests plus the new transport suite pass. Typecheck, 160 specs and all six
localization checks pass. Public real-handler/isolated-database browser checks
pass at 1440/390/320; admin queue, save/replay and copy feedback pass at the
same widths. Temporary admin request removed; no email or external contact
sent. Screenshots: `.local/transport-support-review/`. Release/build/production
gates and commit remain pending visual approval; production is still schema 50.

S31 optical follow-up: 39 public and 51 owner responsive checks now pass with
rendered icon/wordmark centers within 1 CSS pixel, across all five locales.
One public asset-load timeout passed on a controlled retry; no assertion was
weakened. Final centered captures are under `centered-public` and `centered-owner`.

## S33 — launch clarity and contextual language (FE-052)

L2 behavior/security/visual work with L3 additive schema 52 rollout. Preserve S31/S32; unrelated deno.lock unchanged.
- [x] Inspect public experience, owner permissions and publication; record specs.
- [x] Owner inquiry actions with tenant checks; visible search, honest
  demo/Featured labels, first-publish review and clear business value.
- [x] Review locale copy by UI purpose across public, owner and admin surfaces;
  preserve merchant content and canonical machine values.
- [x] Focused security, persistence, localization and desktop/phone browser checks.
- [ ] Current: explicit visual approval, then applicable full gates and scoped commit.
- [ ] Publication only through existing backup/release controls when requested.

Transport is manual outside the platform; no driver/provider accounts. Newest owner instruction overrides the earlier offer: no pricing copy.

S33 local evidence: first publication, owner inquiry persistence/tenant checks,
schema 52 migration/seed/preservation, support and localization checks pass.
Public, owner inquiry and first-publish browser matrices cover all five locales
at 1440/390/320; map search/result/collapse and no overflow are verified.
See `docs/SUQPAGE-LAUNCH-CLARITY-REVIEW.md` for scripts, screenshots and limitations.
No pricing copy, native-speaker certification, commit or hosted rollout claimed.

S33 visual follow-up: a cold-rendered Featured preview could accept a click before
its client handler was ready. The button now waits for hydration, and the
retained morning/evening summary is translated. All 15 fully rendered gallery
and preview combinations pass. Final typecheck, seven localization tests and
161-spec validation pass; visual approval remains the current gate.

### S33 owner correction — panel opener

The owner rejected the search input outside the panel. This supersedes S33's
map-level search form; preserve the other S31–S33 changes.
- [x] Update FE-052: one labeled opener with search icon, filters label and
  right arrow; all search/filter/results controls stay inside the drawer.
- [x] Implement the opener, update locale labels and focused capture.
- [x] Verify open/search/collapse/reopen and focus at phone/desktop widths.
- [ ] Current: review screenshots before full/release gates; no deployment in this step.

Panel correction evidence: all 15 language/viewport combinations pass at
320/390/1440; typecheck, seven localization tests, 161-spec validation and
homepage contracts pass. Screenshots and `panel-verified.json` are in
`.local/launch-clarity-review/`. No full release gate, commit or deployment.

### S33 narrative clarification — showroom and shopfront

L0 copy refinement: preserve the approved audience intent without changing roles,
location privacy or inquiry behavior. No pricing claims.
- [x] Record FE-052 scope: manufacturers/makers without retail space, physical
  shops seeking online discovery, and sellers working from home.
- [x] Update About/login copy and contextual versions in all languages.
- [x] Run copy/localization checks and inspect desktop/phone layouts.
- [ ] Current: owner visual review; full gates and deployment remain pending.

Copy direction clarified: professional customer-facing prose, without rhetorical
questions or reproducing the internal audience discussion. This supersedes the
initial conversational draft before its review.

Showroom-copy evidence: narrative/category checks, seven localization checks,
typecheck and 161-spec validation pass. Fourteen About/login browser states pass:
all five locales at 320px plus English at 390/1440; no overflow or browser errors.
Screenshots: `.local/showroom-copy-review/`. No runtime/data/role changes,
commit, full release gate or publication in this copy refinement.

### S33 Market introduction — focused copy review

L0, FE-052 scenario 8 / FE-030: align the buyer-facing intro with online showrooms.
Definition of Ready met: no new behavior, data, roles or layout; all five locales.
Master section 5.2 is affected. Existing functional labels already fit their tasks.
- [x] Review Market, public navigation, Featured, About and dashboard labels.
- [x] Refine only the Market heading, supporting sentence and metadata;
  update translations and the existing narrative contract.
- [x] Verify narrative/localization/spec checks and focused phone/desktop capture.
- [ ] Current: owner visual review before full/release gates and deployment.

Market intro evidence: narrative/category, seven localization tests and 161-spec
validation pass. Seven header states pass (five locales at 320px, English at
390/1440), with no overflow or browser errors. English screenshots inspected;
header remains compact. These captures verify copy/layout, not map tile readiness.
Evidence: `.local/showroom-copy-review/market-verified.json`. Not deployed.

### S33 map preview above the search drawer

L1 defect, FE-052 scenario 9 / FE-030. Ready: preserve discovery/query behavior,
use the browser modal layer for single and nearby previews; no backend changes.
Master section 5.2 map-preview behavior is affected. A free-map-space layout is
too narrow on phones; use one consistent overlay with scrollable content.
- [x] Inspect stacking and both single/nearby preview paths; record acceptance.
- [x] Implement modal layering, dismissal, focus and bounded scrolling;
  preserve the open drawer on selection from its results.
- [x] Focused browser checks: marker/results, nearby list/detail/back, Escape,
  backdrop, focus, long content, phone/landscape/desktop and resizing; type/spec.
- [ ] Current: owner visual review before full/release gates or deployment.

Map-preview evidence: eight live-local viewport/language states pass; actual
pointer clicks with an open drawer also pass at 390/1440. Four nearby component
fixture states cover six entries, list/detail/back, long descriptions and focus.
No exact-location groups exist in local demo data; the group fixture stubs map,
navigation, image and localization adapters, with the real modal/viewer. No data
was changed. A landscape result-height defect found during review is fixed.
Typecheck, localization, 161-spec validation and discovery regression pass;
10,000-page grouping took 92.4ms. Screenshots inspected at desktop/phone widths.
Evidence: `.local/map-preview-review/`. No full gate, commit or deployment.


### S34 — separate help/transport entry and working staff queues

L3, FE-019 / BE-018. Dependencies: retain S32 transport and S33 UI changes.
Master support behavior sections affected; no external messaging or provider roles.
- [x] Inspect visitor sessions, staff queue permissions, assignment and handoff.
- [x] Record acceptance, role/privacy boundaries and additive schema plan.
- [x] Independent channel sessions and two external launch actions; seven browser states pass.
- [x] Staff queue scope, scoped assignment/handoff and visible assignment history.
- [x] Four support suites and real local admin/team browser workflows pass; temporary fixtures removed.
- [x] Local migration 53 applied; 1440/390/320 public/staff captures in `.local/support-channels-review/`; mobile Assign overflow fixed and verified.
- [ ] Current gate: owner visual approval before full/build/release gates, commit and deployment.

### S35 — transport is a callback request, not live chat

FE-019 / BE-018. Supersedes S34 transport-chat behavior; retain staff routing.
- [x] Record four-field request, receipt, private staff notes and retry contracts.
- [x] Receipt UI, no transport chat/polling; another route retains prior request.
- [x] Receipt-only transport reads; public reply/close/attachments denied in the service.
- [x] Four support suites, transport persistence/recovery browser checks, seven locale/viewport cases and Help retries pass.
- [x] Master, traceability and staff procedure updated; receipt screenshots inspected.
- [ ] Owner visual approval, full/release gates, commit and deployment remain pending.

### S36 — official evening Featured broadcast

FE-033, existing discovery/sponsor ports; preserve S31–S35 pending work.
- [x] Inspect auto/manual schedule and record evening-window acceptance.
- [x] Single evening agenda, six-business cap, four sponsor mentions, midnight formatting.
- [x] Shared rotating automatic selection; manual ordering and public invalidation verified.
- [x] Replace obsolete timing UI with official schedule and clear manual/sponsor controls.
- [x] Focused schedule/discovery/localization/typecheck and homepage composition pass; real manual save/revert plus seven public locale/viewport and three admin viewport cases pass. Evidence: `.local/evening-featured-review/verified.json`.
- [x] Master, traceability and `docs/operations/FEATURED-SCHEDULE.md` updated.
- [ ] Visual approval, full/release gates, commit and deployment pending.

### S37 — Buying assistance replaces public transport requests

FE-019 / BE-018. Preserve S31–S36, unrelated deno.lock, and legacy requests.
- [x] Record three-choice callback intake, staff queue, compatibility and privacy contracts.
- [x] Additive migration 54 applied locally; validated intake, independent buying session and scoped routing. Existing 68 businesses preserved.
- [x] Localized form/receipt, Buying assistance staff labels and Terms updated.
- [x] Five support suites, native PostgreSQL, typecheck, localization and specs pass; three-width real intake and staff actions plus fifteen locale/viewport forms pass. Evidence: `.local/buying-assistance-review/`.
- [x] Master, traceability, rollout spec and staff procedure updated with local evidence.
- [ ] Visual approval, full/release gates, commit and deployment pending.

### S38 — simplify Buying assistance to one request

FE-019 / BE-018; supersedes S37 service selection only.
- [x] Record one three-field request and legacy-data compatibility.
- [x] Service selection removed; migration 55 allows general requests and preserves prior classifications.
- [x] Generic intake, replay, privacy and staff workflow tests pass; real-handler form/receipt checks pass at 320/390/1440. Typecheck/localization pass.
- [x] Master, specs, traceability and staff procedure updated for the three-field form.
- [ ] Visual approval, full/release gates, commit and deployment pending.

### S39 — reserve live support for business owners

FE-019 / BE-018; preserve existing records and owner support.
- [x] Define public buying-only API/UI and retained owner-dashboard chat.
- [x] Single Buying assistance launcher; retired public chat entry/actions/files denied; owner support retained.
- [x] Five support suites pass. Browser: four public surfaces, owner controls at 390/1440, buying receipts at three widths, fifteen locale/viewport forms. Evidence: `.local/owner-only-support-review/` and `.local/buying-assistance-review/`.
- [x] Master, staff procedure, rollout spec and traceability updated; no migration required.
- [ ] Visual approval, full/release gates, commit and deployment pending.

### S40 — organized-showroom value and one filtered result list

L1, FE-030 / FE-052, existing BE-023 / FE-042 contracts. Master public-home
composition and showroom narrative affected. Preserve S31–S39 and deno.lock.
- [x] Inspect current layout/URL contracts; record readiness and acceptance.
- [x] Strengthen Market/About copy and five locales; show mobile intro.
  Owner-refined headline: Everything a business offers, in one place.
- [x] Move result type into two filters, preserve server paging, fix filter spacing.
- [x] Focused type/narrative/localization/spec checks; 15 viewport/locale filter,
  paging/history cases plus landscape scope; three category/paging/accessibility
  cases pass. Final landscape control spacing verified separately.
- [x] Update master/traceability with verified behavior.
- [ ] Owner visual approval before full/release gates, commit and deployment.

S40 evidence: `.local/market-filters-review/verified.json` and screenshots,
plus `/tmp/suqpage-category-review/` accessibility captures. A subsequent
map-ready screenshot pass timed out once waiting for external tiles at 1440/om;
an isolated retry loaded tiles without failed requests. This is not a claim of
map-provider availability. No data changes, full/release gates, commit or deploy.

### S41 — visible category/location controls and multiple categories

L2 FE-030 / FE-042 / BE-023. Ready: reuse membership table and URL-backed
PostgreSQL queries; no migration. Master discovery composition, filter semantics
and rollout statements affected. Preserve S31–S40 and unrelated deno.lock.
- [x] Inspect contracts; define OR categories / AND location; record readiness.
- [x] Canonical category-set input, shared exact/fuzzy SQL and cache scope.
- [x] Always-visible compact controls, multi-selection and individual clear actions.
- [x] Real PostgreSQL scope/privacy/pagination, ranking, spelling and human-query
  checks pass; typecheck/localization/spec validation pass. Discovery behavior
  assertions passed, but its final fixture cleanup hit the local 8s timeout.
- [x] All 15 phone/desktop locale cases pass (final case verified on targeted
  retry), plus landscape/repeated parameters and keyboard clearing. Three
  English-width scoped accessibility audits pass; screenshots inspected.
- [x] Master/traceability updated; evidence in `.local/multicategory-review/`.
- [ ] Visual approval before full/build/release gates, commit and deployment.

S41 remaining gate: the broader discovery suite passed its geography/Featured
assertions but exited on temporary-schema cleanup timeout. Ranking passed an
instrumented run without timeout changes after two local read timeouts; setup
and cleanup were the slow operations. No production timeout or check was weakened.
Build/full/release checks, visual approval, commit and deployment remain pending.

### S42 — live Buying assistance and Expo monorepo preparation

L2 FE-019 / BE-018; architecture ADR-0023. Preserve S31–S41 and deno.lock.
- [x] Owner selected live messages and status; audit legacy notes and permissions.
- [x] Define private-by-default migration and transport/mobile boundaries.
- [x] Implement visible buying replies, scoped API and resilient UI refresh.
- [x] Verify real PG privacy, retries, staff workflow, typecheck and localization.
- [x] Capture desktop/phone conversation states and update current-behavior docs.
- [x] Record Expo package/API migration inventory and ordered readiness plan.
- [ ] Owner visual approval before build/full/release gates, commit or deployment.

Mobile preparation is an architecture deliverable, not an untested file move or
claim that a native app exists. No change to deployment root until migration gates.

S42 final evidence: `.local/live-buying-review/`; all five focused support suites,
final buying API negatives, PostgreSQL migration/install/preservation, typecheck,
localization and spec validation pass. Staff real server-action forms and customer
outage/retry recovery pass. No commit/deployment; CURRENT gate is visual review.

### S43 — publish the approved web release (2026-09-27)

L4 operations; DEP-030/DEP-026, FE-019/FE-030/FE-033/FE-052 and BE-018/BE-023.
The owner explicitly approved deploying all web work built so far. This grants
visual approval for the current cumulative S31–S42 web candidate and authorizes
its release, additive migrations, private backup and live verification. Earlier
pending visual-review notes are superseded for this candidate. Expo remains prep.
- [x] Record approval, dirty tree and deployment scope; preserve deno.lock.
- [ ] CURRENT: isolated source, locked install and full check/release/acceptance gates.
- [ ] Verify Netlify account/site and linked Supabase project; protected backup.
- [ ] Rehearse migrations 51–57 against the backup and verify preservation/access.
- [ ] Review task diff, scoped commit and exact deploy artifact/native validation.
- [ ] Apply guarded additive migration, verify runtime, publish and monitor.
- [ ] Record deploy/source IDs, live checks, rollback and remaining limitations.

### S44 — make Buying assistance clearly conversational before S43 publication

L1 FE-019 / FE-049, existing BE-018/S42 contract. New owner steering is a
prerequisite to S43; no deployment or production mutation has started. The first
S43 source snapshot is stale and must be regenerated after this change.
- [x] Define chat entry, conversational intake and truthful state labels.
- [x] Chat launcher/header, message-first intake, Start chat, sent feedback.
- [x] Focused privacy/workflow, five-language and responsive screenshot checks.
- [ ] Show updated visuals for approval, then resume S43 release/deployment.

No fabricated online staff, typing activity, read receipt, response-time promise
or automated assistant. Connected means a successful server refresh only.

S44 evidence: ten entry locale/width states, English scoped accessibility,
320/390/1440 real-handler chat workflows, final five-language phone conversation,
connection outage/retry, close/reopen and another-chat persistence pass. The
first translated-chat pass exposed a test fixture assumption: page reload clears
unsaved name/phone; the test now fills them for the next chat. No application
behavior was changed for that test. Typecheck, narrative, localization (1,125),
spec validation and whitespace checks pass. Screenshots inspected in
`.local/buying-chat-entry-review/` and `.local/live-buying-review/`.
CURRENT: revised design review before resuming the already-authorized S43 deploy.

### S45 — visitor End chat; retain Buying assistance name

L2 FE-019/BE-018. Supersedes S42's visitor-close denial for buying only.
- [x] Define idempotent closure, assignment release, token/reference guards.
- [x] Wire End chat UI/API and retain Buying assistance naming; five support suites and real-handler 320/390/1440 end/reopen/retry/new-request browser checks pass.
- [x] Verify privacy, duplicate closure, staff reopen and phone/desktop UI: support suites and 320/390/1440 browser runs pass.
- [x] Update S45 evidence in traceability/master/operations; S43 awaits current visual review. No hosted changes yet.

### S46 — Live chat sublabel and clear waiting state

L1 FE-019; preserves BE-018. Latest reference is visual guidance, not a transport service.
- [x] Record launcher/waiting/reply acceptance and dependencies before editing.
- [x] Add secondary launcher label, honest waiting banner and concise return guidance; retain message-first intake and End chat.
- [x] Verify translated desktop/phone entry and real-handler waiting/reply/close workflow; typecheck, 1,127-message localization, narrative/spec/whitespace checks pass. Master, operations and traceability updated; screenshots in `.local/live-buying-review/` and `.local/buying-chat-entry-review/`.
- [ ] CURRENT: await visual approval under AGENTS step 8, then resume already-authorized S43 publication.

### S47 — retained buying requests, history and resolution

L2 FE-019 / BE-018. Extends S45; S43 deployment remains authorized and pending.
- [x] Define ended versus resolved, retained contact/intake, private notes and permission boundaries.
- [x] Add migration 57 and resolution/filter contracts; wire staff history/resolved and intake summary.
- [x] Focused support/security, native PG installation/preservation, typecheck and localization/spec checks pass; local schema 57 preserves 68 businesses. Actual staff actions and public phone conversation captures pass.
- [x] Update current master, operations and traceability with verified local behavior.
- [ ] CURRENT: visual review before release gates/commit/deployment. Preview staff history and ended cases in `.local/live-buying-review/`.

### S43 resumed — final web publication approval (2026-09-27)

The owner explicitly requested following all workflows and deploying before mobile
work. This approves S44–S47 visual refinements and all cumulative S31–S47 web
changes. No further visual approval is needed for this candidate. Preserve the
unrelated deno.lock. Expo remains preparation only.
- [x] Confirm final visual/deployment approval, dirty worktree and scope.
- [ ] CURRENT: regenerate isolated source and locked install; full check/release/provider acceptance/operations gates.
- [ ] Independently verify production target; protected backup and migration 51–57 rehearsal with original-column fingerprints.
- [ ] Reviewed task-scoped commit; exact Netlify artifact and Linux native validation.
- [ ] Guarded schema update, runtime verification, publish and live monitoring.
- [ ] Final evidence, rollback/limits and concise handoff before mobile work.

### S48 — reviewed YouTube videos before publication

Owner added this to S43 before production writes. The schema-50 backup is verified;
S43 gates currently running describe the pre-S48 candidate and cannot authorize
the changed video workflow. Preserve their evidence and refresh affected gates.
- [x] Define target-scoped support intake, manual review, examples and private data.
- [x] Request persistence and normal-save safeguards; owner request links and staff approve/decline workflow.
- [x] Security/retention/default tests, local migration 58 and phone/desktop captures.
- [x] Update current master, affected specs, staff procedure and traceability.
- [ ] CURRENT: explicit visual review of new S48 screens under AGENTS step 8.
- [ ] Refresh isolated release source, full gates and 51–58 rehearsal; resume the authorized S43 publication.

S48 final channel decision: no official channel is required. Owner requests and
staff replies work; staff can approve a supported YouTube video from any channel.
The earlier channel gate was removed at the owner’s request. Private phone/desktop previews are in
`.local/video-request-review/`; visual approval was requested after real-handler
checks. Existing S43 schema-50 backup remains protected; no hosted mutation.
Pre-S48 gates found two stale assertions (gallery schema 55 and featured cap 40);
focused replacements pass against schema 58 and the approved six-business cap.
Those old gate attempts do not authorize the changed release candidate.

### S48 correction — channel-independent manual approval

The owner's latest instruction supersedes the channel setup prerequisite. Any
supported YouTube video can be displayed after assigned staff/manager approval;
normal owner saves still require a support request for new video references.
FE-019/BE-018/DEP-039; L2. No new migration or external provider.
- [x] Revise acceptance: staff URL + approval, no configured/official channel.
- [x] Remove the channel gate and redundant channel confirmation UI.
- [x] Prove owner bypass denial, approval without channel setup, public product
  embed selection, header draft/publication updates, retained media and reply/decline.
- [x] Update translations/current docs and capture revised phone/desktop controls.
- [ ] Revised visual approval, then resume S43 full gates and publication.

S48 correction evidence: PostgreSQL review tests pass with the channel variable
unset, including invalid providers, duplicate/stale approval and header field
preservation. Actual owner/staff browser submission, approval, public product
embed selection and decline pass at 390/1440. External YouTube playback is stubbed;
this verifies Suqpage rendering, not third-party availability. Typecheck, all seven
localization tests (1,149 messages), 162-spec validation and whitespace checks pass.
No commit or deployment while revised visual/release gates remain outstanding.

### S43 final approval — S48 channel-independent candidate

The owner approved deployment after reviewing the revised manual video approval
flow and requested a final real-user workflow audit. This approves all S31–S48
visual changes. No more visual approval is needed for this release candidate.
- [x] Record approval and preserve unrelated `deno.lock`.
- [ ] CURRENT: regenerate isolated source; locked install, full check/release,
  provider acceptance and operations gates; fix demonstrated defects.
- [ ] Fresh private backup and schema 50→58 preservation/access rehearsal.
- [ ] Scoped review/commit, exact artifact privacy/Linux native checks.
- [ ] Guarded migration, runtime preflight, publish and independent live checks.
- [ ] Record source/deploy/evidence and remaining operational limits.

S43/S48 final audit progress: locked install, optimized release, operations backup/restore,
Netlify artifact privacy/source scan and exact Linux native image transform pass.
The fresh schema-50 production backup restores 57 tables / 3,821 rows; rehearsal
applies 51–58 with every original-column fingerprint retained, private notes
unchanged and the new video-request table inaccessible to anonymous/Auth roles.
No hosted write has occurred. Browser tests exposed an outdated publication fixture
(sample contacts/items intentionally block Publish); the revised real owner-edit
workflow passes. Video decline verification now waits for the staff server action
to finish before refreshing the owner. The original failure logs are retained.
Full-check continuation retries a timed-out disposable demo seed without relaxing
its 180-second limit or changing application behavior.

S43/S48 final gates are verified: all 11 production-mode browser workflows pass;
full check coverage is the successful initial prefix plus the unchanged complete
continuation. Release, operations, Netlify build, exact artifact privacy/source
and Linux native image checks pass. Original failed attempts remain in private
evidence with their test-fixture/timing corrections.
- [x] Locked install and all required check/release/acceptance/operations coverage.
- [x] Fresh protected backup and 51–58 preservation/access rehearsal.
- [x] Exact deployment artifact and Linux native validation.
- [x] Reviewed scoped commit, guarded schema update and publication.
- [x] Independent live verification, monitoring and final deployment record.

### S43/S48 publication complete — 2026-09-27

- [x] Reviewed task commit `d2ebacd`; unrelated `deno.lock` preserved.
- [x] Guarded production 51–58 migration; original records/private notes retained,
  runtime privileges and repeat no-op verified; preflight passes.
- [x] Exact artifact published as Netlify `6ab98e309c70ac17fe871293`.
- [x] Independent 19-route/API/search/redirect checks; 39 phone/desktop/language states;
  buying intake/session/close and real map marker/drawer preview checks pass.
- [x] Follow-up deployment/health monitoring passes. Initial edge-502 and natural
  recovery are documented; no blind redeploy or configuration recovery was used.
- [x] Master, specs, operations and release record reflect deployed behavior.

The release record is `docs/SUQPAGE-RELEASE-2026-09-27.md`. Earlier S31–S48 pending
visual/release entries are satisfied by the explicit S43 approval and these gates.
At the S48 release, mobile was preparation only. S49 below tracks the subsequently
authorized implementation. No Git push or
remote CI was run. Staff must monitor Support; third-party playback and live inbox
mail delivery are not claimed by local-provider tests.

### S49 — Expo visitor and business-owner app

Feature/architecture, L3; FE-053 / BE-044 / DEP-042 / ADR-0023. Web baseline:
source d2ebacd, evidence 89a7a9d, Netlify 6ab98e309c70ac17fe871293, schema 58.
Preserve unrelated deno.lock. No admin/staff management in native; no hosted write.
- [x] Inspect web baseline, mobile boundary inventory and current SDK documentation.
- [x] Record scope/contracts and readiness; review master section 3 (narrative
  unchanged), update current architecture/testing in sections 15 and 22.
- [x] npm mobile/contracts workspaces and boundary tests; native SDK versions pinned.
  Expo doctor duplicate-version warning remains documented, not suppressed.
- [x] Versioned public and bearer-authenticated owner APIs; focused real PostgreSQL
  scope/security regressions pass in `npm run test:mobile`.
- [x] Native Market/Featured/catalog/inquiry/About/buying and email/owner dashboard
  preview screens implemented. Attachment/logo and device parity limits are recorded;
  this checkbox does not represent store readiness.
- [x] Focused types/API/provider tests, Android/iOS JavaScript exports, boundary scans
  and 13 browser workflow checks pass. Phone/tablet captures: `.local/mobile-review/`.
- [ ] Owner visual approval under AGENTS step 8 before full release gates.
- [ ] Actual Android/iOS device/build evidence, remaining platform setup and scoped commit.
- [ ] Separate approved web API rollout and native beta/store publication.

S49 additional owner request — local Mac testing environment (DEP-042):
- [x] Visitor/owner browser preview exercises real local API/Auth; focused mobile API tests pass.
- [x] Audit Mac tools/OS/CPU/disk; install Android Studio/SDK/API 35 image and
  emulator; configure SDK paths while preserving Java 17 and existing settings.
- [x] Install Expo Go; Android boot and development bundle/shell render observed.
- [ ] **Current:** clean native workflow verification. API 35 emulator produced
  system/Expo Go ANRs with software and hardware graphics, so it was stopped.
  Browser and LAN API/catalog/Metro checks pass; physical phone remains unverified.
  iPhone simulator requires a compatible full Xcode installation.
- [x] Browser URL works; launch commands and explicit phone LAN configuration
  documented in `docs/MOBILE-TESTING.md`. Physical phone still needs user verification.
- [ ] Preserve the pending visual-review gate before full release gates or publication.

S49 handoff: local Next API is LAN-bound on port 3102; Expo phone/browser preview
runs on 8082. Current phone URI `exp://192.168.1.20:8082`, private local QR
`.local/mobile-review/phone-qr.png`. Full gates, visual approval, native parity,
API rollout and scoped commit remain pending. No files staged/committed; unrelated
`deno.lock` is untouched. Native logout failure regression also passes. No hosted
configuration or production data changes were made.

### S49.1 — restore phone-web structure in the native preview (2026-09-28)

Owner rejected initial native visuals. FE-053 controls this L1 refinement;
BE-044 authority stays unchanged. Related web references: FE-030, FE-042, FE-032.
Master sections 5.2, 15 and 22 reviewed; web behavior unchanged, native preview
status/evidence must be updated. Continue S49; preserve unrelated deno.lock.

- [x] Inspect prior native changes and capture phone web Market/Featured/showroom.
- [x] Compare owner/dashboard and record findings/adaptations in `docs/MOBILE-WEB-ALIGNMENT.md`.
- [x] Implement shared compact header/More, full-map/sliding-drawer Market with
  retained state and reachable filters/results/preview/buying controls.
- [x] Align Featured, showroom and owner task hierarchy with phone web references.
- [x] Focused mobile type/localization/interaction regression and 320/390/tablet captures.
- [ ] CURRENT: owner review of replacement visuals, then S49 full/native/release gates.

No staging/commit of prior unfinished S49 changes yet; current work is the user's
explicit correction to that same task, not adoption of unrelated dirty files.

S49.2 — inline YouTube playback added during S49.1 (FE-053 / DEP-042):
- [x] Inspect existing approval/provider normalization and official Expo/YouTube docs.
- [x] Isolated native/browser player; cover and gallery integration.
- [x] Validated refs, outbound navigation denial, lifecycle/error/retry browser fixture tests.
- [ ] Include player in replacement visual review; actual phone playback is a device gate.
Owner explicitly excludes external browser/YouTube-app handoff. No API/schema or
video-approval changes. Finish S49.1 checks in the same preview.

### S50 — mobile workflow audit and installable tester build (2026-09-28)

Owner accepts proceeding from S49 review and explicitly requests full workflow
verification, fixes, an installable Android artifact and tester/store distribution
preparation. FE-053/BE-044/DEP-042 control this L3/L4 continuation. Existing S49
changes belong to the task; unrelated deno.lock remains untouched. Master sections
15/22 and mobile operational docs will reflect verified outcomes. No paid service,
store membership purchase or invitation messages without explicit authorization.

- [ ] CURRENT: audit screen → API → application/domain → PostgreSQL/storage flows;
  record defects and test/build/provider gaps in MOBILE-RELEASE-AUDIT.md.
- [ ] Fix identified workflow/data/privacy gaps with focused regressions; preserve
  existing UI structure and canonical domain authority. No unrelated redesign.
- [ ] Prepare explicit local/internal/store build profiles, validated runtime
  targets and tester distribution workflow; inspect Expo/account/tool availability.
- [ ] Run mobile/security/browser mutations, npm run check, release and acceptance
  gates against disposable local data/isolated build outputs. Capture failures.
- [ ] Build and inspect signed Android APK, prove embedded JS and correct backend;
  device smoke tests or explicitly unresolved device/provider requirements.
- [ ] Publish API only after required gates/backup/rollback; distribute test build
  only after verified target and working core flows. No silent partial release.
- [ ] Update evidence/spec/master, review scoped commit, deliver artifact/checksum
  and invitation instructions. Google Play submission/fees require account setup.

S50 current map dependency — researched MapLibre native adapter (FE-053/DEP-042):
- [x] Verify upstream Expo/RN requirements and OSM tile-use policy. Owner explicitly
  permits SDK-internal SQLite caching; application persistence stays PostgreSQL.
- [x] Replace unshipped Leaflet WebView draft with native MapLibre and
  preserve existing map contract, coordinates, controls and overlays.
- [x] Test projection/privacy/selection, typecheck/export/prebuild.
- [x] Native compile (arm64-v8a/x86_64), packaged permission check, emulator
  installation, rendered tiles/pins and drawer layering. Evidence and development
  APK checksum: MOBILE-MAP-RESEARCH.md. Expo Go is no longer a native test path.
- [ ] CURRENT: owner visual review of native captures; physical phone gestures,
  offline recovery and remaining S50 release workflow checks.
- [ ] Record native evidence/limits before resuming remaining S50 release gates.
Google Cloud setup is cancelled; preserve the valid Expo project/signing setup.
Full npm run check passed before this map replacement; it is not native map evidence.

S50 continuation — owner workflow verification (2026-10-05):
- [x] Inspect owner forms, preview, Featured freshness and existing API evidence.
- [x] Complete private native page preview and Featured return refresh
  (FE-053); preserve edited input, authenticated media and server publication rules.
- [x] Exercise local owner photo create/update/hide, page save/preview/publication
  through browser UI; record persistence and negative-path evidence (BE-044).
- [ ] Capture affected phone states; run focused type/API/spec checks, then resume
  native playback/device checks and S50 release/distribution gates above.

S50 additional owner request — native markers match web (2026-10-05):
- [x] Compare MarketplaceMap and discovery.css with native circle markers.
- [x] Port storefront/name/selected badges, clusters and nearby lists;
  expose only canonical public presence/group data through BE-044 DTOs.
- [x] Verify projection/privacy, clustering/selection and fixture-tile interactions;
  capture native/browser map before returning to remaining S50 release gates.

S50 dependency recheck (2026-10-05):
- [x] Install Next 16.3.6; lock, runtime and web/mobile type checks pass.
- [ ] Production build/release verification of the Next patch; deployment remains gated.
- [ ] Resolve/review unpatched Expo tooling advisories in braces/node-forge before
  release; no forced SDK downgrade or weakened audit gate.

Current handoff: requested map visual approval after focused captures/checks.
Owner browser mutation/publication checks pass; original navigation-only evidence
was corrected with form assertions. Native storefront tap/render verified. Finish
physical video/picker/offline coverage and resolve dependency gate before rollout.

### S51 — sponsor rotation and storefront narrative (2026-10-05)

L1 feature/defect refinement; FE-036, FE-033, FE-052, FE-049, FE-053.
Definition of Ready met: existing sponsor/catalog ports, no data/API changes or
new providers; merchant content, eligibility and billing remain unchanged.
Master sections 3–5, 15, 18–19 and 22 are affected. Preserve incomplete S49/S50
native/release work, existing owner/map edits and unrelated deno.lock.

- [x] Inspect current rotation, web/native copy and five-language catalogs;
  record contracts and this plan before implementation.
- [x] One sponsor per view, equal six-second automatic rotation, manual
  navigation/pause, foreground and reduced-motion safeguards on both clients.
- [x] Refine visitor/owner narrative and metadata; write contextual copy for
  Amharic, Afaan Oromo, Somali and Tigrinya without translating merchant content.
- [x] Focused carousel/browser, web/mobile type, localization, narrative and spec
  checks; capture desktop/phone browser states and record device limitations.
- [ ] Native AppState/accessibility/gesture check on device remains in S50;
  emulator stays closed to save resources at the owner’s request.
- [ ] Owner visual approval of sponsor/narrative changes (separate from pending
  S50 map approval); then full checks/release/acceptance and task-scoped commit.
- [ ] Resume remaining S50 device, security and distribution gates; no new
  deployment, standalone APK or store-readiness claim without their evidence.

S51 final evidence: web/mobile typechecks, eight localization checks (1,228
messages per locale), narrative/homepage contracts, 165-spec validation and
carousel interaction checks pass. The final audience-separated About and Market
copy passed 69 desktop/phone/web/mobile-browser states across all five languages.
Screenshots and copy-verification-all.json are in .local/sponsor-storefront-review/.
Local catalog images are real; automated OSM tiles and carousel edge-case data
are explicitly stubbed. Native AppState/gesture evidence remains pending.
No hosted mutation, new APK, commit or publication occurred.

S51 owner correction (2026-10-05): initial narrative is not visually approved.
- [x] Replace Market text with the customer’s known-seller/catalog friction and
  item-specific inquiry payoff; adapt all five languages without changing features.
- [x] Redesign About as distinct customer and business sections on web/native,
  each with relevant benefits/CTA. Preserve sponsor work and previous S50 gates.
- [x] Re-run focused narrative/localization/layout checks and capture this version;
  earlier 64 captures validate the superseded draft, not approval of new copy.

S51 final narrative scope clarification: customers often know the seller already;
Suqpage organizes that seller’s offerings. Map/search functionality and prominence
are unchanged. Market/About copy is shared through lib/storefront-copy.ts across
both clients; About has separate customer/business benefits and actions. Earlier
copy screenshots are superseded and do not constitute owner approval.

CURRENT: await visual review of this revised copy/About/sponsor presentation,
then resume the existing release gates; no further feature-priority changes.
Web/API remains on 127.0.0.1:3102 and Expo browser preview on localhost:8082.

### S52 — accent personalization visual proposal (2026-10-05)

FE-054 draft, design-only prototype first; FE-040/FE-053/BE-041 implementation
remains future work. No account writes or production theme changes. Keep S51
visual/release gates and S50 device/distribution work pending.

- [x] Inspect current storefront and approved Selam demo assets; record brief,
  scope and draft persistence implications before prototype work.
- [x] Create interactive restrained-accent samples, including extreme
  pink/lime/violet/yellow/white/black, while preserving platform and product media.
- [x] Capture/inspect desktop and phone; check contrast, controls and overflow.
- [x] User approved all sample treatments; finalize backend,
  native, signup, page editor and migration contracts before production work.

S52 evidence: showroom-projects/accent-personalization-preview/reviews/REVIEW.md
and verification.json. Seven presets, 4,096 sampled palette contrasts,
1440/390/320 viewport checks pass; 166 specs validate. Corrected hot-pink CTA
contrast before final capture. Interactive sample: http://127.0.0.1:8765.
No account persistence, native app theme, commit or publication claimed.

S52 implementation plan — FE-054 A1–A4, owner approval 2026-10-05:
- [x] Shared validated accent/palette; existing JSON persistence/signup,
  legacy omission preservation and native DTO (A1/A2/A3; no migration).
- [x] Web/native setup and Page picker, storefront cover/details/actions (A3/A4).
- [x] Localization, invalid/foreign/stale/private/public persistence regressions,
  focused browser captures and native typecheck (A1–A4).
- [ ] CURRENT: implementation captures reviewed; applicable full checks/release/acceptance;
  document verified scope/limits and isolate commit from prior S49–S51 changes.
Production deployment and native-device evidence remain separate gates.

S52 focused evidence: scripts/test-storefront-accent.ts and
.local/storefront-accent-implementation/verification.json (12 captures).
Actual web signup, save/reload, publication and native editor save reflected in
web all pass. Palette/tenant/stale/staff/rollback/legacy/reset tests pass; 22
owner-page, eight localization tests and both typechecks pass. Native evidence
is Expo browser; emulator remains closed. Full check is running.

S52 gate progress: full npm run check passed, including the new accent regression;
standalone native API suite and both typechecks pass. Production build and all 65
output trace privacy checks pass. Release provider smoke is running in the
isolated local acceptance Supabase stack. Added accent signup/save/reset assertions
to the existing passwordless acceptance scenario; its dedicated run follows the
release runner's cleanup. No hosted changes or scoped commit yet: shared native,
localization/package/docs files still overlap prior S49–S51 uncommitted work.

S52 final local evidence (2026-10-05):
- Full npm run check: PASS. Both TypeScript targets and native API suite: PASS.
- npm run release: production build, 65 trace privacy checks, isolated provider
  security smoke and all subsequent behavioral/security/data gates PASS. Final
  dependency audit FAILS with 20 high findings through existing Expo tooling
  dependencies (braces/node-forge), as already tracked in S50. No forced downgrade
  or audit exception applied; release command exits 1.
- npm run test:acceptance -- --grep 'passwordless signup|business video': 2 PASS,
  exit 0. Signup selection, saved reload, explicit Default reset, untinted playing
  video and existing auth/account/sign-out workflow are verified in production mode.
- 166 specs validate; whitespace clean. Implementation/prototype are local only.
- CURRENT remaining gates: resolve the separate dependency release blocker,
  physical-device evidence/native build and coordinated task-isolated commit with
  existing S49–S51 changes. No commit or hosted deployment in S52; unrelated
  untracked deno.lock and all prior work remain intact. Do not claim release-ready.

Testing URLs: web http://127.0.0.1:3102/dashboard/page-editor, native browser
http://localhost:8082 (owner Page), design comparison http://127.0.0.1:8765.
The emulator remains closed. Disposable browser test businesses were returned to
private draft status. No existing demo or customer colors were backfilled.

S53 — simplify accent selection (FE-054 A5/A6; owner correction)
- [x] Remove color controls from signup; place color controls in the full
  Page preview, retaining Save and defaults on web/native.
- [x] Replace code entry/Apply/mini sample with visual pickers; localize labels;
  test color conversion and actual UI selection/save at desktop/390/320.
- [ ] CURRENT: owner review of corrected visuals; only then full/release gates.
S52 persistence/security evidence remains applicable; do not repeat schema work.

S53 evidence: both typechecks, eight localization tests and 4,096 HSV round trips
pass. Thirteen focused captures pass in .local/storefront-color-refinement/,
including actual signup absence, web custom selection/save/reload, native visual
adjustment/save and publication reflected across clients. Inspected desktop,
390px and 320px screenshots. A stale Metro module map required one preview-server
restart; final capture has no browser errors. Emulator stays closed. No physical
device verification, commit or deployment claimed. S52 release dependency blocker
and preserved prior dirty work remain separate. Review on 3102 Page editor or
8082 owner Page; the 8765 prototype is historical and not the corrected flow.

S54 — offering-only Market results (FE-030, FE-042, FE-053; L2)
- [x] Force product/service pagination at public web/mobile boundaries;
  keep query/category/place filtering and business markers/nearby previews intact.
- [x] Remove result-type choices and business cards in both clients; label the
  single list Products & services, reuse localized copy and bounded pagination.
- [x] Focused API/browser checks: old type URLs, all categories, search, category/
  location, page counts/map stability; desktop/390/320 captures and typechecks.
- [ ] CURRENT: owner visual review before expensive full/release gates; no deployment yet.
S53 visual review and previous release blockers remain pending, not superseded.

S54 evidence: both typechecks pass; test:discovery-pagination passes category sets,
ranking, English/Amharic spelling, 21 human-query variants and seven pagination
scenarios, including the new public mobile API legacy-type/count/map regression.
capture-offering-results.mjs passes real public HTTP counts, last page, map parity,
business-name query, old web URL, Next page/empty state and web/native UI. Five
reviewed captures at 1440/390/320 are in .local/offering-results/. OSM tiles were
controlled blank fixtures; actual markers/data were used. Native evidence is Expo
browser, not a device. Development API retained stale compiled code until a single
server restart; the final capture passes with no browser errors. Preview3102 and
8082 stay running, emulator stays closed. No new package/schema, commit or deploy.

S54 final focused checks: homepage composition passes after replacing obsolete
result-checkbox assertions with the new offering heading/no-business-list contract.
All 166 specs validate and whitespace checks pass. Prior modifications (including
the unrelated untracked deno.lock) are preserved; no staging/commit performed.

S55 — shared floating discovery controls, web and native (FE-030/FE-053, L1)
- [x] Keep one active set of search/category/place controls, floated on
  closed map and moved into open results; shared values/style, no automatic opening.
- [x] Preserve map filtering, offering-only counts/results, clearing, URLs and focus;
  check desktop/phone/native browser controls, visibility and navigation.
- [x] Capture affected states at desktop/390/320 and inspect stable screenshots.
- [ ] CURRENT: owner visual review before full/release gates.
S53/S54 review and existing release blockers remain pending. No backend change.

S55 focused evidence: both typechecks and homepage composition contract pass.
capture-floating-discovery-controls.mjs passes one active control set, closed-view
search/map updates, open-view product results, category/location clear/retention,
map DOM persistence and immediate closed-view reload. Ten screenshots are in
.local/floating-discovery-controls/ with verification.json. An immediate reload
exposed a URL timing race; panel-only changes now use Next-supported native history
updates, avoiding server requests. Final capture waits for finite animations.
Tile imagery is controlled; native evidence is Expo browser, not a physical device.
Existing S53/S54/earlier files and deno.lock are preserved. No migration, new
dependency, commit or deployment. Web3102/native8082 running; emulator closed.

S56 — compact single-row discovery toolbar (FE-030/FE-053; owner correction)
- [x] Results toggle at far left, search flexes, category/location are
  small 44px icon buttons alongside it; one row on desktop/phone/native.
- [x] Filter choices/clear actions open on demand; active states remain visible.
  Keep map tools below the toolbar and product panel below its shared header.
- [x] Check both modes/filtering at desktop/390/320; capture affected states.
  S55 large floating filter blocks are superseded, behavior retained.
- [ ] CURRENT: owner visual review before full/release gates; no deployment.

S56 focused evidence: web and mobile typechecks, homepage composition, six web
and four native-browser captures/interaction checks pass. Evidence and separate
web/native verification reports: .local/compact-discovery-toolbar/. Tests cover
horizontal alignment, one input set, far-left toggle, open/closed panels, search,
category/location selection and clearing, plus web closed-view reload. Real local
catalog/markers; OSM tile imagery is controlled. Slow development navigation
interrupted an earlier run; isolated final web checks pass with a bounded 60s
navigation timeout. Native screenshots wait for the React Native drawer transform
to finish. Device testing and owner visual approval remain pending. No backend,
schema, dependency, commit or deployment change; prior work/deno.lock preserved.

S57 — multiple locations and transport/delivery live assistance (L2)
- [x] FE-030/FE-053/BE-019: bounded multi-location scope with OR between
  selected cities/regions and AND with category/query; preserve old single URLs,
  SQL pagination, spelling matches, cache identity and compact web/native pickers.
- [x] FE-019/BE-018/BE-044: open the existing transport channel for token-scoped
  live text chat, route intake, phone follow-up, dispatch assignment and private
  carrier handoff. Preserve existing buying histories and private staff notes.
- [x] Update visitor/native/admin/team entry points and five-language UI copy;
  retain Suqpage colors/components. No carrier/driver portal, automatic booking,
  payment or commission accounting; staff arrange providers outside Suqpage.
- [x] Focused PostgreSQL/API authorization, privacy, filtering and browser tests;
  desktop/phone captures, typechecks and locale/spec validation.
- [ ] CURRENT: Owner visual review before full/build/release gates; no rollout requested.
Existing S53–S56 changes remain local; no staging or deployment in this step.

S57 evidence: new multi-location PostgreSQL/API tests and all focused search
suites pass. Seven support suites (run in two parts after updating retired-channel
expectations) pass, including new live-transport web/native isolation, dispatch,
private handoff, resolution and retry checks. Local migration 59 expands only the
closed-state resolution constraint; hosted schema/config remain untouched.
Browser captures and checks pass in .local/multiple-location-review/ (7 web,
6 Expo-browser) and .local/live-transport-review/ (web intake/chat at 1440/390/320,
all locale chat states, authenticated dispatcher carrier save/reply/note/history/
resolve/reopen and mobile-browser chat at 390/320). Test staff/cases removed.
Fixed missing aria-checked in mobile-browser filters and bounded composed route
plus goods text before database insertion. Both typechecks and localization pass.
Style remains Suqpage orange/white and existing components. No human language
approval, physical-device claim, full gates, commit or deployment. Existing dirty
worktree changes and deno.lock preserved; previews remain on 3102 and 8082.

S58 — compact, paired transport intake (FE-019/FE-053, L1)
- [x] Group pickup/destination in a two-column route card and name/phone
  in a second two-column row on web/native, including 320px phones. Retain Suqpage
  colors and typography; shorten visual height and place optional goods after
  required fields. Preserve labels, 44px targets, keyboard and existing payload.
- [x] Verify paired geometry, overflow, required/optional validation and actual
  chat submission; capture desktop/390/320 and all locales; both typechecks.
- [x] Owner visual review approved in S59; full release/commit/deploy remain pending.

S58 evidence: both typechecks, eight localization tests and focused web/native
chat submissions pass. capture-transport-intake-layout.mjs checks paired fields,
44px inputs, required-field clearing/enabling, localized headings/placeholders,
no overflow and reachable submission in 13 desktop/phone/language states;
--short checks two additional 390x480 states. Screenshots and verification JSON:
.local/transport-intake-layout/. Fixed native wrapped-label alignment and web
launcher-before-portal timing. Browser tests now wait for the language sheet to
finish closing before focusing intake fields. Restarted Expo on 8082 to refresh
shared translation catalogs. No physical-device/keyboard or native-speaker
approval claimed. Web preview 3102, mobile-browser preview 8082; local only.

S59 — approved web/native production rollout (L4, DEP_BASE/DEP-042)
Owner approved the S58 intake and requested release of the accumulated web and
mobile work on 2026-10-05. This authorizes production deployment work and release
checks; it does not claim those checks or store onboarding are already complete.
- [x] Visual approval received; record dirty-tree baseline and release dependencies.
- [ ] CURRENT: run check/release/acceptance and mobile security/build/native gates;
  resolve concrete failures without suppressing audit or degrading SDK versions.
- [ ] Verify Netlify/Supabase/Expo targets, public native configuration and signing;
  review exact release scope, protected backup, migration 59 rehearsal and rollback.
- [ ] Commit only reviewed release paths, excluding unrelated deno.lock; deploy
  compatible web/native APIs and verify live health, discovery and auth boundaries.
- [ ] Build signed standalone Android APK and production AAB after prerequisites;
  verify install/runtime and record checksums/versions and managed download links.
- [ ] Complete supported distribution or identify exact external store requirements;
  record evidence, limits and rollout status. No invitations without recipients.

S59 verification checkpoint: clean npm ci passes with source-map-js 1.2.2.
Source-map malformed/nested offset regression and corrected narrative tests pass.
The complete check command is covered by its original successful prefix plus
continuations: stale S54/S56/S57 tab/compact-control/cache/transport source
assertions were aligned to accepted specs; one seeded blueprint fixture timed
out under concurrent build load and passed an isolated retry with the same bound.
All remaining check steps and mobile API/type/build/map/video tests pass.
The release command passes its production build, 65 trace privacy checks, isolated
provider-backed HTTP smoke, database/scale and security gates, then fails its
unchanged dependency audit. Two unpatched mobile tool dependencies produce 20
high findings; a diagnostic root-only audit is clean, but it does not replace the
required full workspace gate. Full production browser workflows are in progress.
Expo project and Netlify target are verified; three public native runtime settings
are created/read back in preview and production. No app, DB migration, signed APK,
store submission, Git commit or push has occurred.

S59 final checkpoint: browser coverage is complete across nine isolated production
workflows plus two corrected public read-only production-build captures at
1440/390/320. The focused isolated retry failed during temporary Storage startup;
using existing localhost providers avoided weakening startup checks or modifying
production. This is explicitly not claimed as eleven tests passing in one isolated
run. Source/type/spec/whitespace checks pass. Both local previews still return 200.

BLOCKED before publication: unchanged full workspace audit (20 findings from two
unpatched Expo tool packages). Public store also lacks its dedicated deletion
entry/workflow, confirmed Play account setup and signed-device evidence. No
release-policy exception was inferred from deployment approval. Next work must
resolve that gate before backup/migration/commit/artifact publication; details in
docs/SUQPAGE-S59-RELEASE-READINESS.md. Expo public settings are the only hosted
configuration change in S59 and have verified readback.

S60 — release-blocker continuation (DEP-042 / FE-055)
- [x] Recheck upstream dependency advisories; 2026-10-06 audit still has the same
  20 high findings from braces/node-forge. No patched SDK-compatible version is
  offered. No release gate is bypassed.
- [x] Add the discoverable email deletion-request entry to web/native
  accounts and a public page, using the existing privacy contact (FE-055).
- [x] Verify anonymous access, localization, narrow-screen layout and native/web
  type checks; capture the changed UI for review before expensive release gates.
- [x] Owner approved proceeding with the reviewed deletion-request screen in S61.
- [x] S61 validates an isolated web dependency/build boundary; no Android
  release-policy exception is assumed.
- [ ] Resume S59 from its unresolved release gate, then backup/migration/artifact
  checks. Play account setup, deletion fulfilment and physical-device checks remain
  explicit prerequisites; do not treat the new request link as store approval.

S60 evidence: 167 specs/ADRs, web/mobile typechecks, localization and whitespace
pass. Thirteen focused screenshots and incomplete-setup native navigation pass
in `scripts/capture-account-deletion.mjs`. A stale mobile catalog was refreshed by
restarting only Suqpage's 8082 server; unchanged assertions then passed. No real
email request was sent; the disposable local Auth identity was removed. The
web-only diagnostic install/audit is clean, but lifecycle scripts and deployment
packaging still need a proper isolated workflow if the owner chooses that split.
New deletion-screen visual approval and web/mobile release-split questions are
pending. No full-suite rerun, release-gate exception, production write or commit.

S61 — publish web and Expo Android APK (DEP-042 / DEP_BASE, L4)
Newest owner instruction approves proceeding with web and Expo Android; Google
Play can wait. Treat this as approval to include the reviewed FE-055 screen.
- [x] Record the target as Netlify web/API plus Expo preview/internal APK; defer
  Play/AAB/setup. Rechecked audit: same two unpatched mobile tool roots.
- [x] Enforce an isolated root/shared dependency installation for web,
  guarded lifecycle handling, unchanged-severity audit and native-tool exclusion.
- [x] Run clean-install/boundary tests, web check/release/browser gates and exact
  Netlify artifact privacy/native verification. Keep Android audit effective.
- [x] Targets/backup/schema 59 rehearsal verified;
  scope/review/commit eligible release files, deploy web and verify live APIs.
- [ ] CURRENT: resolve mobile dependency blockers or explicit reviewed exception; build signed Expo internal APK, verify
  install/device workflows and provide its managed download link. No Play upload.
- [ ] Record each delivered artifact and any remaining blocker accurately.

S61 prepublication evidence (2026-10-06): clean root/shared npm ci with lifecycle
scripts enabled; selected full audit including build dependencies has zero
findings. Complete npm run check passes. The web release passes its build,
provider HTTP smoke and every remaining stage; its first scale stage lacked the
isolated local test URL, so the unchanged remainder passed with that URL supplied.
All 11 browser acceptance scenarios pass in one isolated run. Operations backup/
restore tests pass. Production backup restored 58 tables/3,890 rows; migration 59
preserved existing values and passed repeat/no-op checks. Final Netlify artifact
passes Linux Sharp transform, 128 trace privacy checks and native-tool exclusion.
Original packaging failures (publish directory, canonical path and locked Linux
optional dependencies) are retained in private logs. No production write yet.

Android's unchanged audit still fails on two Expo build-tool advisories (20 graph
entries). Fresh Android export excludes both affected packages; it does not prove
a signed APK or remove build-tool risk. A one-artifact internal-testing exception
is awaiting an explicit owner decision. Google Play remains deferred.

S61 rollout checkpoint: commit 71d88a1; schema 59 and production preflight pass.
First web publish returned 502 because Netlify CLI re-bundled an expired function
cache. Previous web artifact restored and health verified; retain schema59.
Current: verify draft using the exact tested archive, then promote and monitor.

S61 web delivered: deploy `6ac519154e7f2c72e452f5be` at https://suqpage.com,
source `71d88a1` plus packaging fix `8361f13`. All 28 live checks pass, including
search, multiple places, transport sessions, protected routes and mobile API.
1440/390/320 live captures have no overflow or page errors. The draft exposed no
production credentials and therefore could not pass application health; corrected
archive health/login passed in Linux with production runtime settings in memory
and an explicitly dummy unused Blobs context. Actual production checks then pass.
Initial rollback and test-harness extraction/context limitations remain recorded.
Android: explicit two-advisory internal-testing exception still pending; no APK
build/upload or Play submission. Unrelated `deno.lock` remains untouched.

S62 — Expo internal Android APK (DEP-042 / FE-053 / BE-044, L4 operations)
- [x] Owner explicitly approved the one-artifact, two-advisory exception; keep
  native audit failed/reportable and Play deferred. Record clean baseline except
  unrelated deno.lock; recheck the exact advisory set and current API health.
- [x] Verify mobile gates, Expo account/project/public settings and signing;
  commit the scoped decision and prepare an isolated clean source tree.
  Evidence: 7a88aa8 / 4550be8, corrected archive inspection and EAS signing readback.
- [ ] CURRENT: submit one free-tier managed preview APK build, monitor to completion,
  inspect final package/signature/runtime configuration and checksum.
- [ ] Install on the Suqpage emulator and verify native visitor/owner workflows;
  use isolated fixtures for mutations, retain explicit real-device limits.
- [ ] Record build/source IDs, evidence and managed tester download instructions.
  No invitations, Play upload or misleading all-features/device claims.

S62 audit correction: newly reported sharp/shell-quote advisories are patched.
Image/quoting regressions, mobile checks and the fresh Android export pass; the
remaining full audit matches exactly the two approved roots. The patched isolated
web release passes end to end with zero web audit findings. Rebuild and publish
the affected web artifact; no schema change. Private evidence: `.local/release-s62/`.

S62 upload inspection caught EAS retaining its shallow `.git` directory before any
Android upload. Correct the exact-path ignore rule, add a regression, and inspect
a new clean archive before submitting. This changes packaging only.

S62 production web patch delivered: `6ac52555a812ad5c89621401`, 28 live checks
and three responsive checks pass. Android build
`2018cc70-edef-472c-8aca-06db2699fe84` is accepted in Expo's queue. Source 4550be8;
no completed APK/device pass yet. Do not submit a duplicate while this build exists.

S63 — clearer social-business storefront copy (FE-052 / FE-049 / FE-053, L1)
- [x] Revise shared customer/owner narrative and aligned entry/metadata
  copy; write contextual Amharic, Afaan Oromo, Somali and Tigrinya versions.
- [x] Regenerate catalogs; verify narrative, locale/content boundaries and both
  client typechecks. Keep discovery/features and merchant content unchanged.
- [x] Capture desktop, mobile-web and mobile-app browser views in all languages;
  inspect wrapping and CTA visibility, then supply local review URLs/screenshots.
- [ ] CURRENT: owner visual approval before full release gates and a new rollout. S62's
  existing Expo build remains tracked separately; it cannot contain these edits.
- [x] Record verified evidence and reconcile master/traceability; scoped commit
  only this task's files. Preserve unrelated deno.lock.

S63 final wording follows the owner's refinements: explicitly name the businesses
people follow on social media, show their location and organized offerings, and
use “contact them to order” without implying platform checkout. Keep the phrase
“without getting lost in the clutter of social media posts.” The first capture
used a retired drawer selector; the next exposed a stale Metro bundle. After a
Suqpage-only restart, account capture now follows the real in-app CTA to preserve
the selected locale. These are recorded harness/preview corrections, not hidden
product passes. No full release gate or new deployment in this copy task.

S63 evidence: web/mobile typechecks, narrative/artwork checks, eight localization
tests (1,255 messages per language), spec validation and 69 final browser states
pass. Screenshots/receipt: `.local/copy-s63/screens/`; tiles were stubbed to avoid
automated OSM traffic, with actual local catalog data and no mutations. Checked
localized metadata, audience CTAs, account entry, wrapping and no page errors.
Mobile app evidence is Expo browser rendering, not a rebuilt native APK. Copy is
agent-authored; no native-speaker approval claimed. Live deployment remains S62.


S64 — location counts and business attribution (FE-030 / FE-053 / FE-049, L1)
- [x] Ready: existing location selections and result handles suffice; no backend
  change. Preserve unrelated untracked deno.lock. Master §5.2 affected.
- [x] Add matching numeric filter badges and separate localized business
  links to web/native product results; preserve product and return navigation.
- [x] Verify focused type/localization/spec checks and browser interactions;
  capture desktop/phone states with long-name and locale coverage.
- [x] Record evidence; task-only commit follows the staged-scope check.
- [ ] Owner visual approval, full/release gates and deployment (separate stages).

S64 local evidence: web/mobile typechecks, eight localization tests (1,256
messages per non-English catalog) and validation of 167 specs/ADRs pass.
`capture-multiple-locations.mjs` passes 16 captures, including 0/1/2/clear,
reload and open/closed-panel count checks. `capture-result-business-links.mjs`
with --web, --native and --locales passes 15 captures: independent destinations,
web keyboard order, 44px store targets, long-name wrapping and all five locales
at desktop/390/320px. Web browser Back and the mobile app Back preserve search.
Private evidence: `.local/multiple-location-review/` and
`.local/result-business-links/`; basemap tiles are controlled fixtures, local
catalog reads are real, long-name captures use a DOM-only display fixture.
The initial duplicate-business locator was scoped to one card; Metro was
restarted to refresh shared catalogs. Expo browser history navigation can reset
Market state; the mobile app Back was verified instead. No physical-device or
native-speaker signoff is claimed. Visual approval and full release gates remain
pending; this change is not deployed or included in the existing S62 APK build.


S65 — in-app browser and social handoffs (FE-053 / ADR-0023, L2)
- [x] Ready: reuse installed Expo browser; HTTPS websites stay in a native browser
  sheet, supported social contacts try installed apps then the HTTPS fallback.
  Native UI cannot host WhatsApp/Telegram sessions or confirm outside purchases.
- [x] Implement validated link policy and Expo adapter; handle launch
  failures and link plain-text merchant descriptions without injecting HTML.
- [x] Verify focused security/port tests, mobile typecheck, localization and export;
  capture browser-preview contact/description interactions with controlled sites.
- [x] Reconcile master/spec/ADR/evidence; scoped commit follows verified staging.
- [ ] Native-device review and rebuilt APK/release rollout remain separate.


S66 — recognized suqpage.com links (feasibility question, not implemented)
The owner asked whether outside HTTPS links can open the installed app. Explained
Android App Links/iOS Universal Links and browser fallback. Current config only
registers suqpage://, with no Android intent filters, associated domains or hosted
association files. A future implementation needs reviewed public-route mapping,
verified Android SHA-256 signing certificate/package identities, iOS team/app
identity when available, website deployment and rebuilt/device-tested clients.
Do not claim outside suqpage.com links open the app yet. General third-party web
browsing (S65) is a separate implemented client boundary.

S65 local verification (2026-10-06): six `test:mobile:links` cases pass, including
actual adapter bundling with controlled React Native/Expo ports, malicious URLs,
Unicode inquiry text, installed/missing social apps and sanitized failures.
Both typechecks, eight localization tests (1,257 messages) and spec validation
pass. Android JavaScript/Hermes export passes at `.local/mobile-links/android-export`;
this is not an APK or device test. `capture-mobile-links.mjs` passes four 390/320px
captures plus description/story/Website navigation, isolated popup, retained screen
and simulated launch-error checks. Real catalog reads use response-only description
fixtures; example.org is intercepted, with no merchant data writes or real contact
messages. Screenshot evidence is `.local/mobile-links/`. The dialog test initially
waited for a click before dismissing its alert; the corrected concurrent handler
passes. No new dependency, database migration, hosted mutation or deployment.
Native browser sheet, installed social apps, iOS and release checks remain open.


S66 implementation — verified public links (FE-053 / DEP-042 / ADR-0023, L3)
- [x] Ready: owner said “lets do that”; Android preview first, canonical apex host.
  Existing S62 APK finished; public certificate verified against known SHA-1.
  No private signing material read/exported. Unrelated deno.lock preserved.
- [x] Add domain association, exact manifest filters and safe native route
  mapping; restore Market deep-link filters without bypassing API authority.
- [x] Focused security/config/HTTP/navigation tests and native JS build evidence.
- [ ] CURRENT: next APK admission awaits owner renewal. Release gates pass;
  native audit still has two earlier tooling roots (20 high, zero critical).
- [x] Publish association against current live web source; verify HTTPS/rollback.
- [ ] Rebuild/sign/install and test Android cold/warm links; record evidence.
- [ ] iOS: Apple Team identity and device/release setup needed before association.
Master §15 and native link portions of ADR-0023 are affected. No visual redesign.

S66 focused evidence: five app-link routing/config/security tests and six outbound
link tests pass. Existing mobile contract/PostgreSQL API/build/dependency/map/video
gates pass; mobile typecheck and spec validation pass. Expo introspection verifies
actual generated Android autoVerify manifest filters. Android JS/Hermes export
passes. Six browser checks verify public local association JSON, cold/warm Market
scope restoration, repeated-link restoration, retained interactive edits and a
real product destination.
Private evidence: .local/app-links/. Browser/port tests are not Android OS-domain
verification. Native audit still fails on exactly braces/node-forge (20 high, zero
critical), requiring review before the next artifact. Domain/native rollout pending.

S66 web artifact gates: isolated live-source checkout (7a88aa8 plus association
metadata) completes the full selected `release:web` gate with zero web audit
findings. Its provider-backed production HTTP smoke, traces, pagination/scale,
security/adapter and owner wiring checks pass. Native source is verified separately;
root UI changes are not part of this additive web artifact. Final Android JS export
passes with repeated Market intent handling. APK admission/domain upload and native
OS verification remain pending; .local/app-links retains private gate receipts.

S66 domain rollout verified: deploy 6ac576417f18a89035f75274, isolated web source
70fb961d9f11dba9465b5f6bacfe6c57b8bf7735 (current live source plus association metadata).
The exact JSON is served at https://suqpage.com/.well-known/assetlinks.json with
HTTP 200 with application/json and no redirect. Seven live association, site, health and
mobile-API checks pass. Linux handler/image and packaged production health/login
checks pass; full selected web release has zero audit findings. Code rollback is
6ac52555a812ad5c89621401; schema/Auth unchanged. Mobile source 87fa05e and its
clean 1,493-file archive are ready; the original one-artifact exception expired
with finished build 2018cc70. Owner renewal for the next exact source is pending
in .local/app-links/android-rebuild-review.md. No new APK, Android OS-link/device
verification or iOS association is claimed. Private receipts: .local/app-links/.


S67 — approved Android rebuild, contextual language review and preview-first setup
(FE-049 / FE-051 / FE-053 / DEP-042, L1 UI plus L3 build)
- [x] Owner renews one internal APK exception and approves latest mobile changes.
  Latest direction also asks for contextual copy in all five locales and immediate
  styled private sample preview after essential setup. Preserve deno.lock.
- [x] Review shared UI catalogs by usage/context; correct clear wording
  defects, keeping merchant text literal. Verify both starter flows; make mobile
  signup open its already-generated private sample preview before editing.
- [x] Captured five-language public/owner/setup states; preserved preview/privacy
  and product editing. Focused/type/spec, full check and 11 acceptance workflows
  pass. All release stages before the unchanged two-root audit pass; approved
  single-artifact exception remains bounded (20 high, zero critical).
- [x] Commit exact source, inspect clean EAS archive/public settings and rebind the
  renewed one-artifact exception to latest approved source. No advisory expansion.
- [x] Build one free Expo internal APK; verify final certificate/runtime/manifest,
  install and check native links/maps/media/locales and user workflows.
- [x] Record artifact/download/evidence/limits. Google Play and iOS remain deferred.
  Native SVG defect blocks a final corrected-artifact claim; follow S69.
Master §§11, 15, 18 and 19 affected. No hosted Auth/schema change, paid build,
invitation sending, signing-key replacement or automatic starter publication.

S67 diagnosis: multilingual owner capture found a closed language sheet retaining
focus on Close and preventing actual field edits in React Native Web. Correct the
hidden Sheet lifecycle before artifact publication; regression asserts real
contact deletion/save/re-entry and publication after all five locale switches.
No publication-readiness rule is weakened.

S68 — logo-led demo accents (FE-054, one-time demo data correction)
- [x] Inventory authorized demo logos/briefs and existing saved palette
  values. Keep one selectable accent with derived shades; preserve Suqpage chrome,
  photos, videos, content, accounts and non-demo businesses.
- [x] Prepared a per-demo color manifest and representative private desktop/390/320
  web/native previews using the existing shared palette; record asset authority
  and review evidence in the showroom project folders.
- [x] Owner explicitly approves the linked logo-matched accents for all 66 demos.
- [x] Apply approved accents through scoped/versioned saved profiles with protected
  before-state and rollback evidence, verify public/native projection and all demo
  coverage. Refresh seed defaults only if a concrete repeatability requirement is
  confirmed. No new colors-per-owner setting, schema, media or dependencies.
Dependency: the current S67 Android source freeze/rebuild continues independently;
these are server-stored accents consumed by the same app, not new APK functionality.

S68 saved verification: 66 local and 64 live demos match the approved accent in
saved profiles, publication and native API. Local 132 desktop/phone states pass;
all 64 live HTML/API values and health pass. Non-demo/stale atomic rollback and
unrelated table preservation are verified. Two local-only handles have no current
hosted business/registry row. No recreation/seed/schema/Auth/config/account/media
change. Owner approvals and rollback/before-state stay in .local/demo-accent-review;
public operation record is docs/DEMO-ACCENT-ROLLOUT-2026-10-06.md.


S69 — native static SVG media correction (FE-053 / DEP-042, L1 defect)
- [x] Ready: S67 signed-device review finds public SVG logos/sponsor images blank
  although their owned static endpoints return 200. React Native Image cannot
  render them; reuse installed react-native-svg only for trusted seed SVG paths.
  No new dependency, remote SVG parsing, account/media/data or design change.
- [x] Implement narrow SVG renderer with fallback; test path isolation,
  bundled component branch and existing JPG/private-media preservation.
- [x] Capture actual corrected native store/Featured states; owner explicitly
  approves the correction and one replacement APK.
- [x] Complete full check, both types, all release behavioral/security stages and
  all 11 acceptance workflows (10 full + corrected owner-entry focused rerun).
  Native audit remains admitted only through the explicit bounded exception.
- [x] Scoped source 6c27025 committed; exact clean archive/admission and managed
  build verified. Finished replacement APK 9bcabbdb uses that source.
- [x] Rebuild admission: owner explicitly approves one replacement free internal
  APK for the reviewed correction under the same two-advisory exception. Rebind
  the approved source digest to the final tested commit before submission.
- [x] Final signature/runtime/manifest match; installation, OS-domain routing,
  corrected logo, five locales, public entry and gallery pass. The install link
  and explicit physical-phone/store limits are in the S69/S70 release record.
Dependencies: approved existing visual assets; S67 artifacts/evidence retained.
Master §15 affected. Google Play/iOS remain deferred; no credentials/config write.

S67 artifact finished: 4d6df1a5 from c1872d5; APK/certificate/runtime/archive pass,
Android OS domain verification and cold/warm navigation pass. Native map/gallery,
all five locales, stored accent, website sheet/return and available honey video
playback pass. Owned SVG images are blank in this artifact; S69 is required.
Aloe example video is unavailable; no color-only operation changes its media.
No physical-phone/real inbox/social-app/native-speaker signoff. See
MOBILE-DISTRIBUTION.md; private evidence .local/rebuild-s67/.


S70 — chosen signup handle and simple private-preview flow (FE-051 / FE-053)
- [x] Ready: owner wants handle selection with essential signup details, visible
  handle editing in Page, and a private sample preview before any edit form.
  Existing signup/availability/rename ports and uniqueness/cooldown suffice;
  preserve generated-handle compatibility for older callers. No schema change.
- [x] Reuse web HandleField and existing rename form; add shared native
  handle input/editor with bounded debounce/availability checks, stale-response
  protection and server-authoritative save. Keep account security focused.
- [x] Ensure draft owners initially see their filled page with clear Edit; no
  initial Save/color form competing with the sample. Keep deliberate editing and
  publication checks, unchanged names/content/media and all five locales.
- [x] Verify real chosen signup, taken/invalid/stale/failure/collision paths,
  Page rename/cooldown and private sample/edit transitions on web/native-browser.
  Desktop/phone captures are reviewed. Owner confirms account/business details
  belong together on the first setup screen; later editing lives in its proper
  account/Page areas. The shown flow follows that clarified direction.
- [x] Gates and scoped source commit complete; clarified flow is deployed on web
  and included in finished replacement APK 9bcabbdb. Reconcile final receipts
  in the S69/S70 release record; the one-artifact exception is now consumed.
Master §§11/13/15/18/19/22 affected. Local fixture-only verification; no production
accounts/data/Auth/configuration changes or automatic sample publication.

S70 focused final verification passes on both clients, including simulated signup
409 recovery with retained inputs/fresh availability and real chosen signup/Page
rename/cooldown. Actual PostgreSQL concurrent-name atomicity/tenant/alias tests and
native API suites pass. Five-language combined setup/private preview and web
1440/390/320 captures pass. First native sample now displays its saved default
logo as well as cover/media/contacts/three offerings. Owner confirms this one-screen
setup and later detail separation. No DB/Auth/provider change; live API compatibility
and final native bundle boundary are verified. Full/release/source freeze next.

S69/S70 final full check passes. Android/Hermes export includes the new modules
and excludes both tooling roots (1,571 runtime sources). Every release behavioral,
production build/trace, provider smoke, scale, security and adapter stage passes;
the final native audit still fails solely on the approved two-root exception.
Full acceptance and source/archive/certificate/device gates remain current.

S70 all eleven production-mode acceptance scenarios have passing evidence: ten
full-run passes, then focused owner-entry pass after adapting the harness to click
Edit from the approved private preview. Initial failed logs remain preserved;
no product/security gate is weakened. Source/archive/build is the next dependency.

S69/S70 final rollout: exact source 6c27025 is live as Netlify
6ac5c9940ee5deb5294319ef and Expo internal APK 9bcabbdb-14eb-420d-a2cf-8d84e0ec8c75.
Clean source/archive/signature/runtime/OS-domain and live web/API checks pass;
44 live locale/layout captures and all 64 saved live demo accents verify.
Corrected signed native logo, five locales, Market/About/email entry and gallery
pass. Initial device screen checks were interrupted by an Android System UI
launcher/gesture ANR; one process restart and bounded retry passed. Preserve those
failed attempts rather than claiming an uninterrupted run. The native audit
remains failed under the consumed one-artifact exception; physical-phone/inbox/
social-app/native-speaker/iOS/Play limits remain explicit. No Git push or
invitations. See docs/SUQPAGE-S69-S70-RELEASE-2026-10-06.md.


S71 — purchased-goods transport chat invitation (FE-019 / FE-049 / FE-053, L1 UI)
- [x] Ready: clarify the existing transport service, not add booking/delivery
  guarantees. Both launchers name help transporting purchases. Intake connects
  finding/agreeing on a product to chatting with our team for transport help.
  Keep paired route/contact fields, service/API/staff/history semantics and colors.
- [x] Author concise contextual copy for all five languages; keep native
  chat wording plus literal (Live Chat) for non-English visitors. Reuse shared
  catalogs; bound long launcher text on narrow web/native screens.
- [x] Verify catalog coverage, both typechecks and focused narrative/UI tests;
  capture web desktop/390/320 and Expo phone in all locales, plus compact map
  launcher/short-height intake. No production messages or sign-ins.
- [ ] CURRENT: owner visual review of local URL/screenshots before full/release gates.
- [ ] After approval, run applicable gates, update evidence/master, scoped commit.
  No deployment/new APK inferred; the last artifact exception is consumed.
Master §§3/5/11/15 service invitation wording affected. Translation is authored
contextually; do not claim independent native-speaker review. Existing untracked
deno.lock stays untouched.


S72 — clear product-results opener (FE-030 / FE-049 / FE-053, L1 UI)
- [x] Ready: user adds this to the active UI review. Compare Product view, Results
  and View products; choose the concrete View products action. Preserve a single
  compact horizontal toolbar, icon/arrow, filters/map state and offering-only list.
- [x] Show View products beside/below its panel icon; open state says
  Hide products. Both web/native use contextual shared translations and retain
  expanded state, panel controls, focus/Escape and existing search behavior.
- [x] Focused type/locale and actual toggle/input/filter-scope captures on
  desktop/390/320, including long localized toolbar labels and unchanged map.
- [ ] CURRENT: owner visual approval before full/release/commit gates alongside S71.
Master §§5/7/11/15 current button wording affected; existing artifact/deployment
are unchanged. No backend query/API/DB change or new package.

S71/S72 focused terminal evidence: web/native types, nine localization tests,
narrative/category/homepage/composition and 167-spec validation pass. Product
entry capture passes seven web and six Expo states (26 screenshots); paired
chat intake passes seven web, six Expo and two short-height states (15 captures).
Initial cache/cold-build/ambiguous-locator failures are preserved and diagnosed
in TRACEABILITY. Native-browser expanded-state regression is corrected and
verified. Current visual-approval request links 3102/8082; full gates/commit/
rollout wait for that approval. Existing live web/APK remain on 6c27025.

S71 owner review correction — 2026-10-07: the long launcher name is rejected.
Use a short Delivery help title and one compact sublabel incorporating Live Chat
and purchased-goods context. Author local equivalents; preserve (Live Chat)
next to native chat wording. This supersedes only the initial launcher copy,
not the already-reviewed intake or S72 product-results controls.
- [x] Record corrected acceptance before code; preserve all current task edits.
- [x] Shorten both launchers and author contextual sublabels.
- [x] Capture corrected web/Expo launcher states across five languages/phone sizes;
  verify locale/types and existing compact panel behavior.
- [ ] Visual approval/full gates/commit/rollout remain pending.

S71 localization refinement: owner explicitly prioritizes clear native wording
over equal English length. Local sublabels name purchased goods, retain native
live-chat words plus (Live Chat), and may wrap cleanly. Preserve the short title.

S71 corrected short-title evidence: Delivery help plus Live Chat · For your
purchases on both launchers; authored local equivalents explicitly describe
purchased goods and live conversation, allowing extra words/clean wrapping.
Nine locale tests, both types, narrative/category and spec validation pass.
The combined entry capture passes 13 web/Expo locale/viewport states with 26
new screenshots under .local/transport-purchase-review/short-title/. Prior
intake/S72 evidence remains valid; title correction changes neither. Visual
approval/full gates/task commit/rollout remain pending.


S73/S74 — Android cover save and unified owner Profile (FE-056 / BE-045)
- [x] Inspect current owner/upload/save routes. Android @alhayabrand reported;
  public projection returns 404, so do not infer a failed private save or alter
  that customer. Current picker stages a cover with a remote Save button and
  bottom-only notice. Reproduce using disposable local accounts first.
- [x] Ready specs for a unified private Profile, focused edit/save/return
  screens, cover persistence/failure retention and private name/phone updates.
  Preserve S71/S72 pending review and unrelated deno.lock.
- [x] Fix and test actual cover upload → saved draft → re-entry/public projection;
  keep tenant isolation, version conflicts and unconfirmed uploads safe.
- [x] Build web/native Profile hub with store preview, handle, page/business/account
  edit destinations. Save returns to Profile only on success; failures stay put.
- [x] Verify local owner workflows/failure/tenant regressions, types/locales and
  desktop/phone captures; actual Android picker/cover review where feasible.
- [ ] Owner visual approval before full/release/commit; no hosted customer writes,
  provider/schema changes or new APK admission implied by this local feature.
Master §§5/11/13/15/18/19/22 affected. Essential signup still opens the saved
private sample; subsequent account/owner home becomes Profile. Staff stays web
and its workspace is unchanged.

S73/S74 environment finding: Expo watches the app/contracts/node_modules but
not root lib/i18n. Add that bounded public UI folder to Metro's watch list to
prevent repeated stale locale bundles during local editing; no runtime/provider
change. Native invalid account input now maps to 400 via existing mobileParse;
the unchanged security regression passes.

S75 — stable navigation and basic Profile activity (FE-056/FE-053/FE-034)
- [x] Owner requests research and a concrete simple visitor/business menu. Choose
  Market/Featured/Account for guests and adds Inquiries for signed-in owners; Account becomes the linked owner's Profile. Inquiries remain
  the business inbox; no new customer account/inquiry-history capability implied.
  Profile groups editor/products/support/settings and bounded real activity counts.
- [x] Add authoritative own-business visits/30-day visits/new inquiries/
  products metrics; unify native bottom menu and mobile web owner/public menus.
  Desktop adapts these destinations without adding duplicate bottom menus.
- [x] Verify exactly one menu, guest/account gates and owner edit/inquiry navigation
  across web/Expo, including copy/locales/keyboard/bottom safe areas.
Primary research: developer.android.com/develop/ui/compose/components/navigation-bar
(3–5 stable top-level destinations); Apple tab-bar guidance also favors stable
items. Profile/Inbox organization follows the user's TikTok analogy without
introducing social feeds or unrelated roles. Master §§5/7/11/13/15 affected.

S76 — themed loading feedback (FE-056/FE-053/FE-034, L1 UI)
- [x] Owner adds horizontal looping theme-matched loading bars for real data/auth/
  map/page waits. Reuse one web/native component; no fake progress or success.
- [x] Apply to existing pending boundaries and save/auth/loading states,
  with accessible text and reduced-motion/static fallback. Preserve map/results
  and form state while refreshing; don't hide errors or settled content.
- [x] Focused pending/settled/error, reduce-motion and phone captures/types;
  fold review into the active Profile/menu task before full/release gates.

S75 owner correction: Inquiries must be absent for guests and appear only after
sign-in. This explicitly supersedes the earlier always-visible/gated-inbox proposal.
Guest menu: Market/Featured/Account. Signed-in menu: Market/Featured/Inquiries/Account.
Keep one bar and Account as the final destination. No guest inbox/sign-in detour.


S77 — TikTok product video embeds (FE-057 / BE-046 / ADR-0024, L3)
- [x] Research official player and in-app WebView viability; keep covers YouTube.
  Preserve existing video review and earlier S71–S76 work; no new dependency.
- [x] Implement canonical provider contracts (extended by S80) and bounded
  short-link approval adapter, then persistence/snapshot/review regression tests.
- [x] Add official inline web/native player with explicit Play, one-active lifecycle,
  unavailable/retry/loading states and blocked outbound navigation.
- [x] Verify types/locales, real local review persistence and focused desktop/phone
  gallery captures; mark provider fixtures separately from real playback.
- [ ] Owner visual approval before full/release/commit; native binary and hosted
  publication remain separate approved rollout steps.
Master §§8/9/13/15/18/19 affected. No schema/Auth change; no customer/demo mutation.


S78 — free world-map exploration (FE-058, L1)
- [x] Owner requests removing Ethiopia viewport lock on web/mobile. Inspect maps:
  web Leaflet has national maxBounds; native/browser zoom floors differ.
- [x] Remove national pan restrictions, align zoom 1–19, preserve initial/
  reset Ethiopia viewport, filters, map marker policy and authoritative catalog.
- [x] Verify Africa/Middle East/distant view/reset and filter preservation on
  desktop/phone/Expo; focused map tests and captures before owner visual review.
- [ ] Visual approval, full gates and web/native rollout separately. No DB or
  international location-data expansion; prior S71–S77 remain active.
Master §§7/15/18/19 affected.


S79 — chosen city required in initial setup (FE-059 / BE-047, L2)
- [x] Inspect signup: web/native omit city; starter currently assumes Addis Ababa.
  Both map adapters already use deterministic area placement; fix national display
  clamps in S78 without altering exact GPS or persisted coordinates.
- [x] Require canonical city selection with name/handle/category/phone,
  validate server-side and save business/area anchor atomically at signup.
- [x] Add clear bounded city search/selection/invalidation/loading on both forms;
  keep rich private preview, no immediate publication or GPS complexity.
- [x] Test web/native parser/API/DB/tenant/rollback, missing/forged city, same-city
  offsets and real desktop/phone initial setup→saved preview captures.
- [ ] Visual approval before full/release/commit. New-account old-APK compatibility
  needs coordinated updated app/API release; existing accounts are not relocated.
Master §§5/11/15/18/19 affected. Existing city catalog remains Ethiopia; global
map pan does not invent international city coordinates. Prior work stays active.


S80 — direct cover/product videos and portrait fill (FE-060 / BE-048, L3)
- [x] Newest owner removes approval and cover restriction; accept self-service
  supported video URLs on both cover/products. Public Facebook official embed
  smoke exposes an inline video, YouTube/TikTok already have controlled adapters.
  Instagram public Reel research exposes an inline video; admit Reels, not photos/
  profiles/stories. Actual native playback remains a device check.
- [x] Broaden validated refs/cover saves, remove owner approval UI/gate,
  preserve old private tickets/tenant/version rules; no schema/secret change.
- [x] Center one TikTok player over softly blurred static cover fill; live-frame
  mirroring is unavailable from the cross-origin embed and duplicate players fail
  audio/sync quality. Keep platform colors and playing media untinted.
- [x] Focused save/tenant/version/legacy/security tests, web/Expo/Android captures,
  provider fixtures separate from real playback; review all new native copy.
- [ ] Explicit visual approval before full/release/commit; coordinated rebuilt
  app/web rollout and new artifact admission remain separate.
Master §§8/9/13/15/18/19 affected. This overrides S77's YouTube-only cover/review
requirement but keeps historical request data and the earlier active tasks.

S73 actual native defect reproduced: SDK 57 rejects legacy {uri,name,type} FormData
parts before any HTTP request (Unsupported FormDataPart implementation). Use
already-installed FileSystem File/standard Blob multipart for all shared image
uploads; add binary/MIME/size regression and retest native selected-photo save.
No customer data, dependency or storage/schema change.

S73–S80 focused evidence (2026-10-07): Profile browser captures pass five languages,
cover/account/handle save/error/re-entry and one-menu guest/owner states. Actual
Android selected cover saves at draft version 2, returns to Profile and renders
after editor re-entry; SDK binary File uploads and authenticated private-image
fetch/cache fix both reproduced failures. Bounded image tests include unauthorized/
MIME/size rejection and obsolete-resource cleanup. World-map capture passes six
web/Expo viewports with global pan/zoom/reset/filter retention. Signup capture
passes canonical city selection/invalidation and direct initial setup→private preview.
Four-provider direct video capture passes actual web/Expo saves/reloads/no tickets.
Public Facebook/Instagram media time advances in Chromium and Android; TikTok
Android player loads and reports media progress. Provider fixtures and real smoke
are separate. Types/locales/specs and focused API/gallery/video/starter regressions
pass. Evidence is private under .local/owner-profile-review/, direct-video-review/,
signup-city-review/, world-map-review/ and tiktok-product-review/.

CURRENT: focused verification/desktop-phone captures pass; obtain visual
approval before complete check/release/acceptance gates and task commit. S76 delayed/error/retry/settled/reduced-motion phone captures pass through
capture-loading-states.mjs; physical-phone/fullscreen checks remain explicit. No production write, publication, customer backfill or new APK occurred.

Final device cleanup evidence: the test owner signs out to the three-tab guest
menu; temporary Suqpage private-image cache count becomes zero. The two exact
native-review fixture stores/Auth identities and one generated cover object are
removed locally. All four provider samples render in Android; Facebook/Instagram/
YouTube report advancing unpaused media, TikTok reports 10.63 seconds of media
progress. Only the Suqpage emulator is closed; web 3102 and Expo browser 8082
remain running. Source/UI locally verified; visual approval is requested with
focused screenshots. No complete release gate, commit or deployment is claimed.

S79 follow-up — missing city picker reported on mobile /owner/setup (2026-10-07).
- [x] Inspect screenshot/source/route: the screenshot enables setup with no visible
  city while the current shared form requires placeId. Preserve entered/customer
  data; diagnose a stale browser view separately from product behavior.
- [x] Reproduce both current native entry routes with disposable accounts,
  place Business city beside Business name before categories, add a clear search
  prompt and retain canonical selection/invalidation.
- [x] Run focused route/city-save capture, types/locales/spec validation; provide
  current URL/screens and refresh guidance without changing the customer's account.
- [ ] Visual approval/full release and prior S71–S80 gates remain pending.
Master §11 affected. No schema, default city, account rewrite or hosted write.

S79 exact-route capture finds an additional S75 dependency: signup from
/owner/setup saves the city and opens preview, but the global menu retains its
unlinked setup response because it observes only the /owner/ prefix. Refresh
authority on actual route changes; assert Inquiries appears after successful
setup on both paths. This is a client refresh defect, not missing database data.

S79 reported browser refresh restores the current city picker. New confirmed
defect: Unexpected text node warning during native setup/preview. Empty string
conditional children are rejected by native View. Inspect shared status/search
renderers, use explicit booleans/null, and require a clean browser console through
setup/search/save/private preview while retaining real error/retry UI. This remains
a focused UI defect; no account/DB change and previous release gates stay pending.

S79/S75 follow-up verified: capture-signup-city passes /account and exact
/owner/setup, city placement/prompt, selection invalidation, actual search retry,
saved canonical city/private preview and refreshed Inquiries. Console/page error
collection is attached directly to both browser pages; renderErrors is empty.
Empty native text conditions are corrected across optional notices/errors/contacts/
logos/video retry/inquiry notes; test:mobile:rendering statically checks typed JSX
for this runtime boundary. Native types, nine locale tests and spec validation
pass. No customer or hosted mutation; temporary test identities are cleaned.

S81 — reliable playback and category/provider examples (FE-060/FE-061/BE-049).
- [x] Identify Al Haya's exact M7lc1UVf-VE cover; metadata/buffering alone did not
  reliably reproduce unavailable. Add focused readiness/error/timeout regression;
  do not claim the precise external failure was proven.
- [x] Admit eight category sample packs and deterministic starter/new-offering
  defaults in existing transactions; preserve edited owner content.
- [x] Eight-category persistence/privacy/retry/foreign/rollback and player tests;
  web/Expo phone/desktop captures use controlled frames. Separate actual public
  playback smoke reports all eight videos advancing at readyState 4.
- [x] Apply narrow local marked-demo/unchanged Al Haya sample correction under
  protected backup and expected versions; verify photos/copy/contacts/accents/IDs,
  gallery agreement and private/live state. No hosted writes or general backfill.
- [ ] CURRENT: visual approval before full release gates/commit/deployment/new
  APK; exact hosted data plan remains separate. Static cover fills; no Loadgistic.

S82 — visible native Publish from private preview (FE-056 / BE-041 / FE-052).
- [x] Publish beside Edit above the cover opens current server readiness and
  actionable missing sections, preserving sample checks and suspension.
- [x] capture-preview-publish passes unfinished/ready, actual stale conflict and
  refreshed review, network/forbidden retention, actual retry/publication/public
  offerings; 1440/390/320 captures and no runtime render errors.
- [ ] Visual approval/full gates/native device/new APK/commit/rollout pending.
  No schema or approval gate redesign; earlier S81 and release gates stay active.
Master §§11/13/19 affected. User reports not finding the existing editor-only action.

S81 category regression: eight-category PostgreSQL tests exposed a real foreign
key failure for Other products & services (not a public industry). Before final
evidence, preserve its declared category/city, omit nonexistent discovery tags in
signup/owner-save/publication and show neutral All-category map/search labels.
Verify actual signup, new-offering defaults, owner location save, publication and
All-category inclusion/specific-category exclusion. No taxonomy/schema expansion.

S81/S82 evidence folders: .local/category-video-review/ and
.local/preview-publish-review/. test-business-starters and test-self-service pass
the Other-category regression and preserved privacy/version guards. Earlier
S71–S80 work and untracked user-owned deno.lock remain uncommitted; no remote
rollout/new APK or full gate is claimed before the visual checkpoint.

Final focused S82 check passes the 320px private-preview/unfinished-review layouts
in English, Amharic, Afaan Oromo, Somali and Tigrinya, with actual stale/error/retry
publication and clean runtime errors. Types, nine locales, 180 specs, native JSX,
product/gallery and category/publication tests pass. Actual replacement clothing
video remains playing beyond 20 seconds. Visual review is requested and pending.

Local restart operation (user request 2026-10-07): both web/API 3102 and Expo 8082
had stopped after the interrupted session; PostgreSQL remained available. Existing
launchers now run detached with protected logs under .local/dev-runtime/; API,
mobile preview and Mailpit 54324 return HTTP 200. Mobile account preview is opened.
No new service/dependency, emulator or hosted change. Restart does not replace the
pending visual/release checkpoint or any prior task.

S83 — handle already identifies demo (FE-052 / FE-053, L1).
- [x] Classify as presentation-only: suppress the quoted business-example notice
  for a marked demo whose visible handle contains demo, ignoring case. Retain it
  on marked examples without that handle text; unmarked businesses stay unmarked.
- [x] Apply the same condition in web/native showroom renderers; preserve
  backend flags, starter publication checks and all prior work. New user steering:
  also remove demo-inquiry disclaimer text, including on demos without demo in
  their handle; preserve normal inquiry controls and safe private-preview state.
- [x] Focused 1440/390/320 web/Expo captures cover hidden/retained/ordinary cases;
  both types/spec validation and changed existing capture expectations.
- [ ] Visual/full/release/commit/rollout checkpoints remain with S71–S82; no new
  data/schema/dependency/native artifact. Master §§5/19/22 affected.

S83 focused evidence: capture-demo-notice passes six web/Expo cases, including
case-insensitive handles, retained notice on marked demos without demo in the
handle, ordinary-business absence and clean inquiry views with normal send
controls. Zero inquiries sent/content mutations. Both types, nine locale tests
and 180-spec validation pass; unused demo-inquiry translations are removed and
catalogs regenerated. Desktop/phone evidence: .local/demo-notice-review/.
Visual/full-release/commit/rollout stay pending with the earlier work.

S84 — transport from Suqpage businesses (FE-019 / FE-053 / FE-049, L1).
- [x] Ready: customer bought from a business on Suqpage; invite them to let the
  team arrange transport to them. Short button and clear chat intake, no internal
  brokerage/mode/commission language or new checkout/booking/availability claims.
- [x] Shared web/native customer copy and five authored native-context
  locale entries; retain styling, paired form and existing transport workflows.
- [x] Focused copy/locale/types and desktop/phone/compact-map/intake/short-height
  captures; record actual UI evidence and no submitted requests.
- [ ] Visual/full gates/commit/coordinated rollout remain with prior S71–S83.
  No backend/schema/dependency/role change; master §§3/5/19/22 reconciled after checks.

S84 latest terminology: use transport, not delivery, in the customer button/chat
and its optional-details label. Keep the Suqpage purchase context, without adding
  distance thresholds or mode/brokerage explanations. This supersedes the initial
delivery-copy draft; shared copy/locales/captures must reflect this before review.

S84 local evidence: both types, nine locale tests, narrative/category and 180-spec
validation pass. Seven web entry and seven paired-intake states pass at desktop/
phone widths in five languages; six mobile entry/intake states and one short web
intake pass. Native copy is in the existing watched lib/i18n folder, correcting
the initial Metro file-resolution failure; an actual browser probe renders with
no page errors. Screens are in .local/transport-service-copy-review/. Requests
are not submitted; full/visual/commit/rollout gates remain pending.

The explicit --web capture runs now also retain web-verified.json and
web-verification.json for all seven entry/intake states, alongside the six-state
Expo records; the earlier mixed-run failure remains in its original log.

S85 — solid shop markers and readable names (FE-021 / FE-053, L1).
- [x] Ready: solid colored outer edges, white interior detail only, high-contrast
  nameplates on web and mobile; preserve palette, geometry, counts and behavior.
- [x] Capture existing light-map shop states; update the two map
  renderers' styles without changing anchors, clustering or coordinates.
- [x] Focused computed contrast/label/selection/preview/cluster and native-map/type
  checks; desktop/390/320 before/after and actual-tile visual review.
- [ ] CURRENT: visual approval/full gates/commit/coordinated rollout with S71–S84.
  Physical native/new APK separate; no schema/provider/dependency/data change.

S85 local evidence: normal/selected name contrast 15.62/6.79:1; solid outline vs
cream 8.42:1. Actual public shop selection/preview/no zoom-out and counted cluster
keyboard expansion pass. Controlled nearby/featured fixtures pass their solid
edge/count/preview/remount checks. Both types, native map behavior, homepage
composition and 180-spec validation pass. Before/after 1440/390/320 and actual OSM
1440/390 web/Expo screens are in .local/map-marker-contrast-review/. Homepage and
remount tests now reflect FE-056's existing Account/guest-inquiry navigation;
no prior More/About menu was restored to satisfy a stale test.

S85 owner correction: the charcoal nameplates/dark border are rejected; numbered
clusters were not requested for change. Current candidate must use warm orange
shop edges and cream/orange labels while restoring clusters, nearby groups and
badges to their previous styling. Earlier capture evidence remains historical
and is not visual approval.
- [x] Ready: focused appearance correction, same geometry/data/callbacks;
  FE-021/FE-053 updated before code. No unrelated map or cluster redesign.
- [x] Apply warm shop/name styling and restore group/badge styles.
- [x] Verify contrast/selection on desktop/390/320 web/Expo and original group
  styles/counts/expansion; inspect actual-tile phone/desktop previews.
- [ ] CURRENT: owner visual review, full gates/commit/rollout/new APK remain separate.

Warm correction: Suqpage-orange fill/outline, orange text on cream, selected
white-on-orange. Contrast is 4.83/5.24:1 for names and 4.67:1 for shop outlines
against cream. Both types and map behavior pass. Six web/Expo viewport checks,
four actual-tile views and the group fixture pass; full web/native cluster/nearby/
badge declarations match their original HEAD reference. Evidence:
.local/map-marker-warm-review/. The earlier group redesign is fully reverted.
An early capture read unresolved colors before styles applied; the controlled
retry waits for the intended CSS colors and passes. Product styles were not
changed to accommodate that test timing issue. Visual approval remains pending.

S85 latest visual trial: thin white outline around each individual orange shop,
including its roof; keep cream/orange names and original cluster/nearby/badge
styles. This supersedes the previous orange-edge trial, without map/data changes.
- [x] Ready: FE-021/FE-053 updated; white rim is a deliberate visual choice;
  orange fill and name text retain contrast. Master §§4/10/19/22 affected.
- [x] Change individual-shop contours to thin white on web/native. Web reuses the
  established native SVG shape in its 25px layout slot; anchors remain unchanged.
- [x] Focused fill/text contrast and normal/selected desktop/phone captures;
  group styling remains original. Keep this evidence separate from earlier trials.
- [ ] CURRENT: visual approval/full gates/commit/web rollout/new APK remain pending.

White-edge evidence: six normal/selected web/Expo states at 1440/390/320 and four
actual-tile views pass, with real shop preview/no zoom-out and original cluster
white rim/keyboard expansion. Names contrast 4.83/5.24:1; orange fill against
cream 3.09:1. Both types, homepage composition and spec validation pass. The
normal orange is slightly deeper to retain fill contrast behind the white rim.
.local/map-marker-white-edge-review/ retains this trial separately; earlier
dark/orange-border trials remain historical, without implying owner approval.

### S86 — spread Addis demos across the city (BE-020 / FE-021)

One-time local operations/data correction; not a new app/seed/offset algorithm.
Ready: 21 marked Addis area demos currently share (9.0,38.8); exclude unmarked,
exact-location and other-city records. Master §§6/10/17/22 affected. Preserve all
pending S71–S85 work and original cluster behavior.
- [x] Inspect target DB independently, modes/flags and the existing public/display
  pipeline; read bounded OSM neighborhood centers and city administrative boundary.
- [x] Construct checkable neighborhood assignment and capture the current
  desktop/phone map. Validate final display points after existing offsets.
- [x] Protected affected-row backup, drift/flag/mode checks and one atomic apply;
  verify unchanged unrelated profiles/proposals/pages/products/contacts/versions.
- [x] Verify web/mobile projection/count/filter/selection parity; capture city
  before/after and record evidence/master/traceability. Visual review separate.
- [ ] Hosted application/rollout, full gates/scoped commit remain with pending work;
  no production coordinates or new APK changed by this local operation.

S86 data apply: the backed-up 21-demos-only update and DTO/integrity/restore
rehearsal pass. All 21 target display points are inside Addis at OSM neighborhood
centers, minimum pair spacing 2.23km. Before maps show one group at zoom 11.
After web views disperse correctly; native pointer capture exposes 96px invisible
shop wrappers intercepting neighbors, including an actual-glyph retry. This is a
product hitbox defect, not another coordinate/schema issue. FE-021/FE-053 updated
before a shop-only fix; preserve 44px touch, current pixels and counted markers.
- [x] Fix isolated-shop transparent hit interception, then rerun city selection
  and focused normal/selected marker checks; no group or offset-algorithm change.

### S87 — end-to-end support and transport team workflow audit

Owner requested real back-and-forth chats and every staff workflow. Retain S86's
in-progress demo correction; do not replace earlier work. The owner confirmed local previews only. FE-019/BE-018/BE-044
control conversation authority; use labelled disposable test participants and
never alter customer conversations or provider configuration.
- [x] Inspect queue/channel roles, actual lifecycle endpoints and existing QA
  fixtures; define the test matrix and confirm environment targets.
- [x] Real owner-support and guest-transport messages with team
  claims/assignment/reassignment/capacity, replies, statuses and return recovery.
- [x] End/hide/reopen/resolve/history/private notes, unauthorized/other-tenant
  denial, refresh/disconnection and retry/duplicate behavior; evidence per layer.
- [x] Fix proven issues against controlling specs, rerun focused workflows and
  report remaining hosted/native limits. Any visual/release change stays gated.

S87 target confirmed: local web and mobile previews only. The owner will request
web/mobile deployment after local completion; no hosted chat test or customer
conversation is authorized by this audit. Focused support/domain/security suites
pass; actual concurrent browser/team workflows remain to be completed.

### S88 — main admin and web-only staff roles

Owner designates falmata.dawano@gmail.com as main admin on BOTH live and local,
able to create Support agents and Transport agents. These staff and admin accounts
must not sign into mobile. Existing conflicting account association must be
inspected before removal; do not infer permission to delete unrelated businesses,
content or another application's account. Retain S86/S87 and earlier local work.
- [x] Inspect existing identity/role/association and staff/queue/mobile
  authority; resolve an existing conflicting association if found.
- [x] Update controlling specs/Ready/checkable acceptance criteria before code;
  prefer existing queue scopes and authorization contracts where sufficient.
- [x] Implement/tests for admin creation and both agent roles, queue isolation,
  mobile sign-in/session/API denial and normal owner/guest operation.
- [x] Protected, independently targeted account backup/plan/application/verification
  for local and live identity records. No broad Auth configuration push.
- [ ] Complete S87 using the resulting real staff roles; desktop/phone preview,
  full/release/scoped commit and coordinated mobile/web rollout remain distinct.

S88 Ready decision: reuse team_member + exact support/transport queue scopes as
the two agent functions; project scope into the verified principal and deny
business/product/design authority for scoped agents. No schema/role-enum change.
New staff default enabled/capacity three; active incompatible cases block role
switching. Mobile validates application authority before admitting/restoring a
session and denies all staff at every authenticated boundary. Existing local
owner identity/Metal Door draft is converted/detached, not destructively erased.
Main-account role change is local AND hosted, with separate target/backups; mobile
and web code rollout will follow the owner's deferred deployment phase. Master
§§11/13/15/16/19/22 affected; FE-026/BE-018/BE-044 updated before implementation.

### S89 — retire business plans and subscriptions

Newest instruction: transport arrangement is the only Suqpage revenue service.
Remove business subscription/plan/renewal/payment workflows from web and mobile;
preserve product prices, transport arrangements and visitor analytics. L3,
FE-018/BE-017/DEP-015; master §§13/17/19/22 affected.
- [x] Ready: specify retired routes/actions/creation trigger, retained historical
  ledger data and unaffected publication/analytics before implementation.
- [x] Remove navigation and payment/renewal UI and application ports; old URLs
  redirect to the appropriate workspace without rendering billing.
- [x] Stop automatic subscription creation with a forward PostgreSQL migration;
  preserve historical financial rows and prove new shops receive no plan.
- [ ] Focused migration/security/analytics and web/mobile UI evidence, then the
  same visual/full/release/deployment gates as S88. No destructive ledger erase.

S86 verification: shop-only 44px hit geometry and transparent outer Leaflet wrapper
fix pass on actual city maps (21 demos/84 offerings) on desktop/phone web and Expo,
with no zoom-out, missing counts, errors or overflow. Normal/selected shop and
original cluster/nearby/badge regression captures pass again after the fix.
Protected local assignment/rollback evidence is retained outside Git; production
GPS, visual approval and APK rollout are still pending.

S88 identity operation: both targets now use the designated confirmed Auth identity
as platform_admin with no owner association. Local conversion preserves Metal Door
content by hash; hosted account was unprovisioned in the application and now links
the existing confirmed provider identity. Protected exact-target permission backups,
drift checks and role/link readback pass; no provider/configuration changes or
customer-business deletion. Actual new staff UI and chat verification continues.

S89 local evidence: payment/renewal navigation, overview and actions/ports removed;
old bookmark requires auth and redirects. Migration 60 stops the creation trigger,
preserves every historical ledger/payment row and passes an atomic rollback-only
new-shop rehearsal. New seed fixtures have no plans. Retirement/naming/tenant visit
tests pass; hosted migration, browser review and full release gates remain pending.

S87 actual verification: capture-staff-chat-workflows.mjs passes real local HTTP,
Supabase email-code sessions and PostgreSQL persistence, with staff created through
the designated admin's UI. Web owner intake/support claim/replies, native owner
reply/upload/download, alternate assignment, closed/reopened chat and tenant/file
negatives pass. Both guest web/native transport flows pass waiting/claim, private
handoff/notes, explicit replies both ways, lost-ack exactly-once retry, end/history/
phone follow-up/private closed notes/resolve/reopen/recovery. Actual capacity
rejection keeps the case waiting; resolving the old case releases capacity.
Success responses are not mocked. Labelled fixture cases/accounts/uploads are
cleaned up; no production chat or external staff notification is touched. Expo
browser evidence is not an installed-Android/device claim. Protected screenshots
and sanitized verified.json are in .local/chat-workflow-review/actual/.

S87 defect fixed: reassigned agents/absent or malformed case URLs previously hit
an unhandled server error. They now return to their authorized inbox with a
localized generic notice. Assignment also shows an explicit saved confirmation;
function-action multipart forms rely on React's encoding to avoid the old warning.

S88 final focused evidence: staff-boundaries (admin/two functions/legacy operator,
actor forgery, missing-profile fail-closed, scope/old-assignment/stale page-write
fences and all private native routes), managed provider failure, native API tenant
checks, auth adapters, 22 owner-page domain cases, rolled-back local PostgreSQL
page/publication scope, adapter/runtime and scalable collections all pass. Both
web/mobile typechecks, 180-spec validation, localization and marker regressions
pass. Final staff-only capture proves role names fit phone inputs, correct legacy
Queue labels, created staff immediately visible, three staff OTP denials and old
renewal URL returning to a workspace without billing. The broad adapter fixture
needed a current location version; a retry under browser/seed CPU contention timed
out, then passed once that work finished. No check was weakened.

CURRENT: S85/S82/S88/S89 visual review before one full check/release/acceptance gate,
reviewed task-scoped commit and coordinated hosted migration/web/Expo Android
rollout. Main-admin identity itself is already applied locally and live. Production
schema is still 59; local schema 60. Latest installed APK and production UI do not
contain this local candidate. No new release, commit or native-device result claimed.

### S90 — clearer transport invitation on web and mobile

Newest approved scope, awaiting visual approval: Need help with transport? as
heading, with smaller Let us handle it. Chat with our transport agents live
supporting text. The intake invites customers who purchased from a Suqpage
business to chat with the team for help getting the goods to them. All five
languages prioritize everyday comprehension and natural wording, with (Live Chat)
in non-English labels. Preserve S82/S85/S88/S89 and earlier authorized work.
L1 FE-019/FE-030/FE-049/FE-053; master §§3/18/19/22. The owner chose Adjust visuals
first; no release approval is inferred from the copy corrections.
- [x] Ready: question/supporting sentence/intake intent, five authored locales,
  unchanged form/backend/roles/palette, accessible compact mode and rollback.
- [x] Shared copy/catalogs and web/native compact typography updated; existing
  focused assertions and chat-audit selectors match the current copy.
- [x] Both typechecks, localization/narrative/homepage/spec checks and read-only
  desktop/phone/all-language/short-height captures; current docs/trace reconciled.
- [ ] CURRENT: explicit visual approval of corrected entry and pending release
  visuals before full/release/acceptance gates, scoped commit/coordinated rollout.

Final S90 evidence: both types, nine locale tests, narrative/category/homepage
and 180-spec validation pass. Thirteen actual-map web/Expo states verify readable
heading/smaller supporting text, complete compact accessibility, 44px targets,
no overflow/page errors, updated introduction, preserved routing/query and reachable
Start chat in every language. Two 390×480 paired-intake captures pass. Screenshots
wait for map pins/tiles; no request or account/data mutation is submitted. Current
evidence: .local/transport-invitation-review/final/ and final/intake/. Earlier
wording captures remain historical. This is local candidate UI, not hosted or a
new APK. The intake-copy refinement changes no conversation or staff workflow.

Play Console readiness — owner reports the Google developer account is ready
(2026-10-07). Account type, Suqpage app entry, release permissions and submission
credentials are not independently verified. Existing production EAS configuration
targets an AAB under com.suqpage.app and an internal draft submission; the Expo
preview APK uses com.suqpage.app.preview. This update does not approve the pending
visual review, authorize public Play rollout or imply a completed store release.
- [x] Inspect existing AAB/internal-draft configuration and current official
  Expo/Play first-submission and account-testing requirements.
- [ ] Confirm account type and whether the Suqpage app entry exists; provide
  owner steps for manual upload or an explicitly chosen Expo credential setup.
- [ ] Play internal testing is a separate rollout after current release gates,
  signing/device checks and verified account/app access. No invitation sent.

Current primary guidance: https://docs.expo.dev/submit/android/ and
https://docs.expo.dev/submit/android-manual/ allow either manual first upload or
EAS Submit with a Google service-account key uploaded directly to EAS. No first
manual-upload requirement is assumed. Google personal accounts created after
2023-11-13 require a closed test with 12 continuously opted-in testers for 14 days
before applying for production access; internal testing remains a distinct track:
https://support.google.com/googleplay/android-developer/answer/14151465?hl=en.

### S91 — owner, staff and visitor alerts with real read receipts

Feature L3, FE-062/BE-050/DEP-043/ADR-0026. Preserve all pending S71–S90 release
work and the owner's Play Console setup. The optional background-scope question
is pending; after the reasonable reply opportunity, closed-app coverage is the
stated default. This is not permission to change provider credentials. Master
§§8/13/15/16/17/18/19/22 affected. Native staff remains prohibited.
- [x] Inspect inquiry/chat attention, existing read side effects and client APIs;
  define scopes, failure/visibility/privacy contracts and provider prerequisites.
- [x] Explicit confirmed-message reads/first join and additive persistence;
  regression tests prove GET/hidden/stale/foreign/private cases cannot mark Read.
- [x] Transactional owner/staff/visitor attention events, unread feed/preferences,
  dedup/revocation and bounded delivery ports/outbox; tests for retries and scope.
- [x] Wire web staff/owner/visitor and native owner/visitor alerts, permission/sound,
  receipts, join/unread badges and safe navigation in all five languages.
- [x] Actual local back-and-forth/visibility/failure and viewport captures with
  labelled fixtures; no customer conversation or real external push sent.
- [ ] CURRENT: explicit visual approval before full release/acceptance/build gates; current
  prior visual approval remains pending. Reviewed commit and coordinated rollout.
- [ ] Separately approved, exact-target Web Push/Android FCM setup and real OS
  foreground/background/closed/tap/signout tests before push-readiness claims.

Ready: ordinary-language UI, preserved paired intake and Suqpage palette; owner
inquiries and support replies; matching staff waiting/assignment/reassignment/
messages/end/reopen; visitor assignment versus actual join, public replies and
explicit visible-message read receipts. Internal notes/carrier details stay private.
Alert acknowledgement is separate from transcript read. No hosted Realtime change,
new general guest chat or provider/key mutation inferred. Additive rollback only.

### S92 — smallest current Next.js security patch

Non-visual L2 dependency fix discovered by the S91 audit; BE-002 controls it.
Preserve S91 as the active feature. Registry reports six Next advisory paths fixed
by 16.3.8; current installed version is 16.3.6. No automatic audit fix/minor upgrade.
- [x] Classify actual dependency findings and verify official publisher advisories.
- [x] Verify exact patch availability, update only Next pin/lock, then
  focused types/auth-proxy/private-response/source-map checks and fresh audit.
- [ ] Full release/deployment gates remain coupled to the pending visual work;
  no hosted change or new dependency exception inferred.

S91 focused evidence (2026-10-07): local additive 61/62 backups and full before/after
existing-record hashes pass; no hosted/schema/provider configuration was written.
Real isolated PostgreSQL receipts/events/privacy/dedup/backlog/provider retry/
revocation/exhausted lease tests pass. Mock provider/worker/Firebase project-package
checks are labelled and sent no external push. Both typechecks, 9 locale tests,
184-spec validation, local attention HTTP negatives and focused native API checks
pass. Actual web/Expo owner inquiry/support and both visitor UIs pass hidden/covered
versus visible receipts, assignment before actual join, both message directions,
exact inquiry links and nested-alert close preserving the chat. All 5 locales at
1440/390/320 fit; browser AudioContext fires once after explicit opt-in, repeated
polling stays quiet, mute persists. Labelled cases/accounts/preferences cleaned up.
Private evidence is .local/notification-review/actual/verified.json plus screenshots.
This is browser/native-preview evidence, not installed Android/background delivery.
Native notification availability waits for FCM/Expo configuration; no native sound
or OS permission/delivery result is claimed. Full visual/release/commit/deploy/APK
and actual OS tests remain pending, along with the owner's Firebase response.

S91 defects found/fixed: Expo-web keyboard metrics crash; closing a nested alert
list also closed its underlying web chat. Read visibility also excludes modal
coverage and fixed navigation/keyboard areas; unread counts use the partial unread
index instead of scanning historical read rows. All notifications retain generic
payloads; alert read and transcript Read stay separate.

S92 focused evidence: Next is pinned 16.3.8 and refreshed advisory report no longer
contains Next. Auth proxy/runtime/source-map regressions and both types pass. The
20 inherited high paths are the two Expo/Metro tooling roots (braces/node-forge),
not 20 separate runtime vulnerabilities; no clean audit or current build exception
is claimed. Full release/admission remains pending visual approval.

### S93 — real system push setup and keyboard receipt regression

Newest instruction: configure real browser permission/system notifications for
staff, guide Android Firebase setup, and fix the reported mobile-localhost
`Keyboard.metrics` crash on agent reply. Defect L1 + operations L3,
FE-062/BE-050/DEP-043/ADR-0026; preserve all earlier pending release work.
- [x] Inspect actual RN Web/native keyboard adapters, running Suqpage previews,
  existing push ports/configuration and controlled scopes; update acceptance first.
- [x] Remove the metrics dependency, preserve keyboard/visible-read
  bounds; focused browser/native-fallback tests and actual reply/read workflows.
- [ ] CURRENT: local VAPID configured; verify real browser permission/subscription,
  permission/subscription, real provider delivery and safe notification taps.
  No production key write before exact target/backup/fields are reviewable.
- [ ] Guide owner through Firebase Spark project, Android package registration,
  matching client config and private FCM V1 key directly in EAS Credentials.
- [ ] Review actual system notifications, permission denial/mute/closed-tab and
  revocation; retain honest OS evidence separate from Playwright handler fixtures.
- [ ] Prior visual/full release/scoped commit/hosted rollout/rebuild gates remain.

Android step 1 is pending: owner creates/selects the Suqpage Firebase Spark project
and supplies its public project ID. Browser setup can progress independently.
No pricing/subscription UI or changes to the map/service palette are involved.

S93 focused evidence: metrics is entirely absent from ChatReadSentinel. Browser
visual-viewport bounds and native keyboard show/hide listeners pass new pure-bound
regressions, listener cleanup/no-metrics contract and mobile typecheck. Fresh actual
web/Expo owner and visitor agent replies/hidden/covered reads, all five languages
and browser sound/mute/dedup pass again with no page errors; no installed Android
result is claimed. Suqpage-only 3102/8082 restart clears retained dev code; Loadgistic
processes are untouched. Existing report copied to keyboard-fix-verified.json.

S93 local browser push: generated distinct local VAPID pair and verified contact,
protected credential source and complete prior local-runtime backup retained;
all three fields configured only in local runtime. Chrome staff dashboard opened.
Owner must grant actual browser permission; current main-admin active web
subscription count is zero, so no real OS test has been sent. New production-only
source and exact empty-field backup/review are protected and unapplied. Read-only
Netlify target/account/domain/deploy verification passes; the three production
fields do not exist. No production credential, deploy, Supabase configuration or
Firebase project changed. The real labelled local queue-event test is prepared but
will not run until a browser subscription exists. Android Firebase Spark/project ID
step is pending owner input. Visual/full rollout gates remain distinct.

### S94 — simpler admin/staff support navigation

Newest request: admin/staff breadcrumbs, menu and back flow are confusing. Feature
and defect L2, FE-026/FE-019/FE-062/BE-018; master §§13/19/22. Preserve notification
setup waiting on browser Allow/Firebase project and all prior pending releases.
Ready: two clear queue destinations; current queue active on case; stable admin
menu with any selected-business context; Staff owns workload/availability;
validated queue/status/q/page carried through list→case→actions→list; no raw
return URLs, new permissions, native/owner menu redesign, migration or new provider.
- [x] Inspect current scopes, menu matching, inbox filters/forms/redirects and
  existing contracts; update accepted specs and plan before implementation.
- [x] Pure bounded navigation-state/matching contracts; desktop/phone staff
  menus and breadcrumbs; preserve exact origin through every case action.
- [x] Focused URL/role/security/domain/type/locale tests; actual local admin,
  Support/Transport agent actions and filtered return/alert/direct-link proof.
- [x] 71 desktop/320/390 and all-language captures; zero browser exceptions,
  no clipped tabs/overflow and drawer focus restored. Fixtures cleaned afterward.
- [ ] CURRENT: explicit visual approval before full check/release/acceptance,
  scoped commit and coordinated rollout. Production remains unchanged.

Ordered implementation: (1) URL/query contract and tests, (2) stable role menus,
(3) inbox/case/settings wayfinding and action roundtrip, (4) focused/current-role
negative checks, (5) actual viewport/role flows and review evidence. No new SQL
filter or access scope is needed for this request.

S94 evidence: `npm run test:staff-navigation`, typecheck, catalog/spec validation,
`test:staff-boundaries`, focused support tenant suite, and
`test:staff-navigation:visual` pass locally. The initial browser sweep and one
controlled retry reproduced Next development profiler errors on RSC redirects.
The stack/classification matched the upstream framework issue; safe browser
replacement now preserves server authorization and an inbox fallback. The final
real-action/locale sweep passes without suppressing browser errors. Protected
evidence: `.local/staff-navigation-review/actual/verified.json` and 71 captures;
no production writes, customer-chat changes or mocked action success responses.

### S95 — connect Firebase to Expo Android notifications

Newest owner instruction: connect Firebase, keeping notifications simple. One-time
operations L3 under FE-062/BE-050/DEP-043/ADR-0026, not a new chat/database provider.
No new notification UI, Firebase database/Auth, paid service, signing change or
Google Play submission. Preserve S93 browser-push setup and S94 visual review.
Master §§13/19/22 and deployment readiness remain unchanged until verified setup.
- [x] Inspect current Android notification adapter/build guards and controlling
  specs; confirm installed app/preview identifiers and official FCM V1 workflow.
- [x] Select the owner's Firebase project (public Project ID), verify
  account/project and Android registrations independently; no credential write
  while target/recoverable source is unknown. Firebase Console opened for owner.
- [x] Retain protected client configuration for com.suqpage.app (S96 supersedes
  the earlier Preview registration). Prepare exact EAS environment plan and backup
  existing configuration. Private FCM keys are created/uploaded in provider
  dashboards with explicit target-specific owner authorization.
- [x] Verify Expo project/account, matching package/project, existing credential
  metadata and
  enhanced-security status; do not put EAS account-management tokens in runtime.
- [x] Apply only authorized additive build-client configuration; focused package/privacy tests.
  Existing visual/full/release/build admission gates remain separate.
- [x] Obtain and bind the separately authorized private FCM sending key
  through provider dashboards; protected recoverable source and exact-target review.
- [ ] Rebuild admitted APK, test actual Android inquiry/chat foreground/background/
  closed-app notifications, taps, mute and sign-out; record truthful evidence.

Independent work: prepare local protected configuration destination, verify Expo
identity read-only, and check existing Firebase package/project guards while the
owner selects the Firebase project. No new permanent setup utility is necessary.

S95 preflight: cached EAS CLI confirms falmatad is the selected owner account.
Existing Firebase package/project/missing-file and notification privacy/navigation
guards pass; no provider requests from the tests. Firebase Console is open, and
the protected .local/notification-review/firebase directory is prepared. Owner
confirmed no Firebase project exists yet; first action is create the free Spark
project and provide its public Project ID. No EAS/Firebase/server configuration
has been changed, and no key/build/signing operation has run.

S95 owner-selected Firebase target: project ID suqpage, number 588262779708.
Expo read-only project info independently confirms @falmatad/suqpage and
bfc289fb-238e-44a3-9e0f-fec6a7c857d1. Current step: register
com.suqpage.app.preview in that Firebase project and obtain its client JSON for
ID/number/package verification; then register com.suqpage.app separately.
Registration/client download is distinct from private FCM key setup and EAS
credential/environment writes. Neither Firebase config nor runtime capability
is enabled yet; source target metadata is protected outside Git.

S95 Expo push preflight: exact app/owner and owner actor verified read-only.
Project/account enhanced push security are false; preview credentials exist for
com.suqpage.app.preview and have no FCM V1 key. No production app-credential
identifier exists yet. Protected metadata backup is expo-push-preflight.json.
The API exposes granular CUSTOM viewer permissions, not a coarse OWNER label;
ownership is checked through ownerUserActor, and read-only evidence never admits
credential writes. Initial assumption was diagnosed without a provider mutation.
Current owner step: register the preview Android package, download client JSON,
and save Downloads/suqpage-preview-google-services.json for exact project-ID,
number and package verification. Private-key setup remains a later provider step.

### S96 — one Suqpage app name/package for test and release

Newest owner correction supersedes S95's two-app/preview registration instructions:
use Suqpage and com.suqpage.app throughout; internal APK distribution stays in the
preview build profile. One-time operations/architecture L3, DEP-042/DEP-043/FE-053.
Master §§15/17/22. No additional UI, provider, backend, map or translation change.
- [x] Inspect name/package switching, build/Firebase guards, signing and public
  link metadata; record scenarios/dependencies in specs before source edits.
- [x] Remove profile-based name/package suffix; one remote version counter with
  increments for both APK/AAB profiles; focused identity/Firebase tests pass.
- [x] Actual Expo metadata in both profiles resolves Suqpage / com.suqpage.app;
  legacy association remains intact and canonical signing/link evidence is pending.
- [x] Continue S95 with only the canonical Firebase Android registration/config.
  Provider/signing/environment writes require exact-target backup/review; no new
  key, APK, store submission or production rollout is inferred from this change.

The old installed Preview package needs one canonical replacement installation;
future releases retain com.suqpage.app. Keep prior signing material and legacy
association records; do not copy a certificate to the new package without proof.

S96 evidence: all-profile build guards/name/package resolution, both hosted
Firebase config admission/rejection cases, five App Links/security tests and
actual Expo public metadata pass. Private canonical identity report records
zero remote writes/new binaries and explicitly pending canonical certificate
association. Update mobile-testing instructions to use com.suqpage.app after
verification; preserve older artifact/association history. Source changes need
full admission gates before a new signed APK; no fresh binary is claimed.

### S97 — safe single-app build and release workflow

Owner confirms one app and asks for safety controls/workflow. Security/operations
L3, DEP-042/DEP-043/BE-044/FE-053; master §§15/16/17/22. Recurring checks rather
than one-time data repair: preserve all pending Firebase/UI/release work.
- [x] Inspect current worker hook, build profiles, approved public target source,
  Firebase guards, SDK tools and artifact history; update specs before code.
- [x] Explicit target/profile/realm checks, archive credential exclusions
  and strict Firebase client validation; focused regressions.
- [x] Typed APK/signature/version/debug validation and bounded SDK adapter/CLI;
  pure/mocked-port tests plus real existing-APK rejection, no installation.
- [x] Document constrained tester → device checks → Play internal draft → public
  workflow and signing continuity/rollback limits; reconcile spec/master/evidence.
- [x] Continue Firebase client-file step. Canonical signer remains unconfigured;
  provider/signing setup, existing visual/full gates and new binary checks remain.

Existing verified EAS public target metadata is read without exposing keys. Both
profiles are production-connected; do not mistake the profile name for isolated
data. No role restriction or existing visitor/owner capability is removed.

S97 focused evidence: both typechecks, build/Firebase configuration regressions
and three artifact-domain/SDK tests pass. Actual historical-APK inspection reports
legacy package, version 1, nondebug and its public certificate; canonical admission
fails on the absent reviewed pin. No installation or signing/binary change occurred.
Protected APK-inspection evidence is separate from SDK mocks. Full visual/release/
commit/device and canonical signing gates remain pending.

S97 final security review passes: malformed client JSON returns a generic error
without quoting accidental credential fragments. Focused rejection/output-privacy
regression passes; protected release-safety-evidence.json records actual legacy
APK inspection separately from SDK mocks. Source/backup/plan/creation/readback/
evidence files are verified owner-only. Full gates/scoped commit remain pending.

S95 current client-file step (supersedes the earlier Preview registration guidance):
- [x] Owner file matches suqpage / 588262779708 / com.suqpage.app; protected copy
  and checksum retained. Exact Expo project/owner and selected-variable conflicts
  checked read-only: no selected project/account variables exist.
- [x] Retain exact additive build-client plan/before-state, apply only
  the three selected project-scoped variables in preview/production and verify.
  No existing variable, account-wide setting, signer or server capability changes.
- [x] Obtain separately authorized FCM V1 sending credential through the provider
  dashboard, bind only the canonical Android app, and verify project metadata.
- [ ] Coordinate API/schema rollout, release gates and canonical APK/device tests;
  no working Android OS alerts claimed from a client file alone.

S95 operation evidence: exact absent-state backup and client source retained;
plan 5204a0c17d43b4d092f2ed3c3ca45ab75005a3a166a7cd136f5b9d801af2ee12
adds only SUQPAGE_GOOGLE_SERVICES_FILE (secret file), SUQPAGE_FIREBASE_PROJECT_ID
(suqpage) and SUQPAGE_MOBILE_NOTIFICATIONS_ENABLED (1, build prerequisite) to
@falmatad/suqpage, both preview/production. Public target check and protected
creation/readback pass. Secret-file content is not remotely readable; retained
source hash/exact create payload and worker validation provide bounded evidence.
No existing variables/private keys/signing/runtime flags/API/binary changed.
Owner is guided to Firebase's suqpage Service accounts dashboard for the separate
sending-key step. All deployment/device and pending visual gates remain open.

S95 sending-key continuation, 2026-10-08: owner supplies the downloaded Firebase
service-account source in response to the exact sending-key setup request.
One-time credential operation; preserve all prior release/UI dependencies.
- [x] Validate only selected project/type/key structure without exposing
  contents; retain an owner-only recoverable copy outside Git/build archives.
- [x] Independently reverify Expo owner/project, canonical Android FCM slot and
  enhanced-security state; retain protected exact before-state and additive plan.
- [x] Bind the verified key through the owner-authorized official CLI exception for canonical
  com.suqpage.app; no signing, legacy package, Play submission or runtime secret.
- [x] Read back selected key/project association metadata. Keep actual phone
  delivery, compatible API/schema rollout and signed rebuild as separate evidence.

S95 source/plan evidence: supplied service-account JSON passes project/type/token
endpoint and RSA structure checks; no private source bytes were printed. An
owner-only recoverable copy and selected public metadata are retained outside Git.
Independent Expo readback confirms falmatad/@falmatad/suqpage, canonical slot
absent, legacy FCM slot empty and enhanced security disabled. Protected exact
before-state and additive FCM-only plan are ready; no provider credential mutation
has run. AGENTS.md requires dashboard secret writes, so the exact provider page
is opened and a narrow official-CLI method exception is pending owner response.
This is not proof of service-account IAM permissions, key activation or OS delivery.

S95 exact method exception approved: the owner explicitly answered yes to using
Expo's official credentials CLI for the supplied verified FCM key, bound only to
@falmatad/suqpage / com.suqpage.app. This supersedes the dashboard-only method
for this one operation; all target/backup/secret/signing safeguards remain.
CURRENT: reverify source/before-state, use only the official interactive FCM
credential workflow, then inspect selected key/project association. No raw REST/
GraphQL credential mutation fallback, signing setup or production runtime enablement.

S95 FCM connection verified: official interactive EAS CLI selects production →
Google Service Account → Push Notifications (FCM V1), uploads the protected source
and confirms assignment to com.suqpage.app. A local text-prompt control-character
entry was rejected before upload; corrected path entry succeeds without source
or provider changes. After explicit upload/assignment success the CLI exits; no
ambiguous mutation timeout or retry occurred. Independent readback verifies exact
project/key-ID/client association, canonical signing remains empty, Play credential
is empty, legacy FCM and enhanced-security state are unchanged. Protected
fcm-credential-after.json records actual provider evidence. All source/backup/
plan/authorization/readback files are owner-only and excluded from Git/archives.
CURRENT dependency: compatible API/schema and web rollout, pending UI approval/
full release gates, reviewed canonical signer, admitted APK and actual Android
foreground/background/closed-app delivery/tap/logout tests. No live server flag,
signing source, Play submission, rebuilt binary or working phone alert is claimed.

### S98 — finish coordinated notification web/Android rollout

Operations L4: DEP-042/DEP-043/FE-062/BE-050 and retained S71–S97 work.
Master §§15/16/17/22. Preserve user-owned deno.lock. Web/API precedes Android;
no mobile admin, Play submission, paid build, invitation or Git push.

- [x] Independently verify targets, protected sources and exact owner approval.
- [x] Back up schema 59, restore its actual archive, rehearse migrations 60–62,
  and prove original records, private permissions and idempotency.
- [x] Reuse the exact existing signer through the official CLI; independently
  verify key bytes/certificate and preserved legacy/FCM/Play/security settings.
  Owner accepts the verified result after the CLI confirmation timeout.
- [x] Pass complete check, isolated release:web, operations, eleven production-mode
  browser workflows, native/type/link/build gates and Android runtime export.
- [x] Commit declared source a81c93f and inspect clean web/Android archives.
  Linux handler/Sharp and actual packaged scheduled worker pass. Web audit is zero;
  Android tooling retains only the explicitly approved two-advisory exception.
- [x] Apply protected, rehearsed migrations 60–62 to the verified production target;
  original-column hashes, private-table permissions and runtime access pass.
- [x] Apply the same five approved production notification fields using Netlify
  Free default scopes; exact values/scopes/context readback passes. No upgrade.
- [x] Upload the tested web artifact, inspect its draft, verify production
  runtime settings, publish identical archives in the production context and monitor before starting the APK build.
- [x] Build one free canonical internal APK, inspect actual signature/package/
  version/bundle and verify installed public navigation/map/five-locale checks.
  Build 565b9614-428d-47b4-8780-2b0f9c96d68b, version 2; emulator closed.
- [ ] OWNER PHONE/BROWSER STEP: record real permission, foreground/background/tap/mute/logout
  and expiry evidence; provider acceptance does not mean OS display or human Read.
- [x] Reconcile master/specs/traceability and release record with actual deployment/
  build IDs, monitoring and remaining physical-device limitations.

Original approval: “go ahead”, exact digest
c34fad9fbd191bdba0878835f10add929dc15905981ac03541963c54804f48d3.
It authorizes memory-only legacy DB source verification, protected backup/rehearsal,
migrations 60–62, five additive production notification fields, exact existing-key
reuse and one free internal APK under unchanged braces/node-forge tooling findings.
No new dependency/advisory or signing-key generation. Signing timeout acceptance:
fbdaa48da6ad3ca8b350643d17a20954230d245af9a9c6257705e2f5bc5c33b9.
Owner approves Netlify Free standard scopes, digest
f62dc019baafee9bc05656e5a43a0a64107244326547f763c489011bc8d0dcf0.
Functions-only and explicit all-scope requests returned 403 with no mutation;
the supported default-scope request succeeds and independently matches the plan.
The first upload command rejected incompatible build/context flags before upload;
the supported prebuilt-upload command retains exact artifact checks. Provider
readback confirms deploy-preview context; the existing database/runtime fields are
production-only and handler logs confirm the expected missing-driver failure. Static
association bytes pass, while hosted draft dynamic smoke does not. Preserve that
configuration: full local runtime/workflow gates and selected production runtime
preflight precede an identical-archive production upload and immediate live smoke.
No ambiguous remote retry or broad configuration sync.

Protected source/backup/operation receipts remain outside Git. Local Docker/setup
interruptions are not passing evidence; fresh complete gates supersede them.
Actual uploaded-photo bytes and retained gallery edits pass, as do signup/sign-out,
private-route denial, staff transport replies, private-note exclusion, end/history,
resolve/reopen and owner publish/live Save/inquiries. Actual APK inspection and
installed public/map/five-locale checks pass. Real physical OS delivery remains a
separate gate. Earlier local-only demo-coordinate changes
are not copied to production by this hash-preserving migration.

### S99 — Google Play preparation and required closed testing

Operations L4, DEP-044 (draft) / DEP-042 / DEP-043 / FE-055. New request adds
Google Play distribution after S98, preserving its pending owner-phone evidence.
Owner confirms personal developer account created after 2023-11-13 and no app
entry. Scope is Suqpage only; preserve unrelated untracked deno.lock. Master
§§15/16/17/22 affected by later rollout/auth changes. Preparation is one-time;
reuse current build/admission contracts rather than adding a second release system.

- [x] Inspect baseline/source and research current Google/Expo requirements.
  Same com.suqpage.app; AAB required; at least 12 closed-test opt-ins continuously
  for 14 days before production-access application. Internal tests do not count.
- [x] Recheck locked audit and existing actual APK compatibility: 20 high / zero
  critical, two unpatched tooling roots; 50 native ELF libraries and ZIP pass
  16-KB static alignment checks. Future AAB/device checks remain separate.
- [x] Prepare draft listing/assets, truthful data-safety worksheet, reviewer
  access/signing proposals, tester instructions and artifact admission requirements.
  185-spec validation, both listing lengths, seven asset formats/checksums,
  mobile build/signature/upload/privacy/media and app-link contract checks pass.
  Public health/privacy/deletion resources return 200 on canonical origin;
  selected Expo identity is verified and Free build quota read back. These are
  preparation checks, not policy approval, a new artifact or phone OS proof.
- [ ] CURRENT OWNER CONSOLE: create Suqpage app (English US, App, Free), verify developer/
  app identity, required account/device verification and selected signing policy.
  Do not enroll a new signer or upload any private key incidentally.
- [ ] Resolve secure reusable reviewer access, UGC report/block workflow and
  privacy/deletion fulfilment. Create ready FE/BE specs before behavior changes;
  use real isolation/regression evidence and focused visual approval, then gates.
- [ ] Admit a reviewed AAB: unchanged audit gate or exact renewed exception;
  clean committed source, verified production target/signer, free quota and archive
  privacy. Inspect actual AAB/API/version/signature/16-KB configuration after build.
- [ ] Upload internal draft only to the verified app; keep credentials private,
  inspect actual Play-delivered APK and phone login/media/inquiry/chat/push/update/
  domain association before sharing. Owner may perform first manual Console upload.
- [ ] Complete store declarations and required setup; use the admitted version
  for closed testing, record 12 continuous opt-ins/14 days and actual feedback.
  Tester list stays protected; do not send invitations without recipient approval.
- [ ] Apply for production access with true feedback, then approved monitored
  public rollout. Record terminal Console status/artifact/evidence; no public
  publication or policy-compliance claim from preparation alone.

S99 preparation evidence is retained in .local/play-s99/. Store/readiness runbook
is docs/GOOGLE-PLAY-RELEASE.md. S98's single-APK tooling exception is consumed;
it does not cover this new AAB. No Console write, new build, invitation or provider
configuration change has occurred in S99.
