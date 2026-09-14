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
  projections except exact standard subscription labels. Hosted apply remains pending.
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
- [ ] N6. Package clean source, perform approved monitored rollout and record exact
  compatibility exceptions and hosted configuration gates that remain separate.
  - [ ] N6a. Live candidate 6aa80d74354566ace7fd51e8 exposed missing CDN aliases
    for old static asset URLs. Add exact Netlify rules matching the tested Next map,
    verify mapping equality, publish static correction and check every legacy URL.
    Main pages/health and schema 45 remain verified; no database retry or downgrade.

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
