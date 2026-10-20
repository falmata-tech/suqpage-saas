# Suqpage transition checklist

Controlling contracts: FE-040, BE-032, DEP-030, ADR-0018.

## Current work board — updated 2026-10-17

This is the current routing summary. The dated records below retain implementation,
verification and release history; an old `CURRENT` label is not a fresh instruction
to repeat that operation. See S116 for request retention and agent ownership.

- Every new request joins this board and its ordered S-section. Earlier unfinished
  requests remain open unless the owner explicitly cancels or replaces them.
- Track implementation, focused tests, visual approval, full gates and deployment
  separately. Agent completion does not establish integration, approval or release.
- Root owns integration, dependencies, shared files, final verification and release
  reporting. Agents own bounded workstreams and return evidence and unfinished items.
- Resume each item from its first unmet dependency. Independent local work may run
  in parallel; shared database/browser sessions and hosted writes stay coordinated.

| Workstream and controlling record | Assigned agent | Implementation / verification | Current remaining work |
| --- | --- | --- | --- |
| Editable multi-provider transport plans — S137; BE-057/FE-068/DEP-047 | assignment_trace backend/schema/security; chat_owner_audit staff web; native_audit participant/native/live reader; root specs/local migration/public page/i18n/integration | Ready: ordered1–12 public legs, stable IDs, five methods, separate capability, ended-chat editing,5s visible conditional refresh; no dates/scans/current-provider claims | Contracts/UI implemented; isolated rehearsal and protected local70+ACL readback pass; CURRENT final regression/paired actual Chrome → visual approval/full gates; S129–S136 and earlier gates retained |
| Fractional camera resize/return correction — S136; FE-065/021/053 | assignment_trace helper/adapters; native_audit peer/current Chrome; root integration | Locally corrected weak instance intent;7SDK+2adapter cases, types and three real web/Expo returns each pass original0.5px budget independently of persisted view | CURRENT combined visual review → full gates/commit/separate rollout; original failed captures and exact native longitude reconciliation retained |
| Chrome test-window lifecycle diagnosis — S135; S120, FE_BASE | root integration; chat_owner_audit lifecycle review | Planned assertion-cleanup and one unexpected visible page close distinguished; exact early-close cause remains unproven; current installed-Chrome headless journeys verify lifecycle guards | Final review records failed originals and current passes; no claim of repairing the visible-window cause; manual web/mobile servers remain running |
| Discreet anonymous reporting/blocking and UI note audit — S134; FE-063/049/053, BE-051 | assignment_trace web; native_audit native; root policy/integration | Locally implemented; focused/security and real web/Expo block/unblock/report-Cancel pass; footer clearance verified at10single/stacked viewport states including700px | CURRENT combined visual approval → full gates/commit/separate rollout; anonymous preferences remain, no data deletion or report submission |
| Clear native-language narrative and enabled locales — S132; FE-049/052/065 | chat_owner_audit copy/catalogs; root web intro/About/SEO | Locally implemented; activeen/am/om, retainedso/ti, researched meaning-first copy, plain compact visible web introduction, About/SEO and41current browser states pass; human language review is not implied | CURRENT combined visual review → full gates/commit/separate rollout; existing artwork/listings remain explicitly stale |
| Transport invitation and clear intake — S133; FE-052/049/053, FE-019 | chat_owner_audit shared copy; root launchers | Local two-line invitation and simple pickup/destination copy; active-language real web/Expo unsent intake and short/landscape pointer/panel/return checks pass | CURRENT combined visual approval → full gates/commit/rollout; chat lifecycle unchanged by these UI/copy edits |
| Optional styled showroom categories — S131; FE-041/053, BE-044 | assignment_trace web/projections; native_audit native; root integration | Local canonical optional categories,48px chips/counts/affiliation and AND search; focused tenant/optional cases and actual web/Expo criteria→Add→details→Back pass; bounded public criteria memory excludes private preview | CURRENT combined visual approval → full gates/commit/rollout; no schema/new editor permission |
| Mobile search/map preview detail — S130; FE-065/053/021 | native_audit UI; assignment_trace DTO; root integration | Local canonical product city, excerpts and richer all-fit map/business previews; focused/public API and active-language browser proof pass, including source-business navigation | CURRENT combined visual approval → full gates/commit/rollout; country ICU fallback explicit, S127 grouping unchanged |
| Native showroom product card actions — S129; FE-041/053/066 | native_audit source/tests; assignment_trace web; root Chrome/integration | Local excerpt/direct Add/options/stock/preview guards, current per-business lists and measured grid; real journeys plus explicitly labelled options fixture/current owner grid proof pass | CURRENT combined visual approval → full gates/commit/separate Android/web rollout; no device/OS claim |
| Compact Market top area — S128; FE-065/053/021 | chat_owner_audit web; native_audit Expo/native; assignment_trace audit; root integration/browser | Locally implemented and focused-tested: compact mode/info and measured-width search/filters; source-bound actual Chrome80layout states and web/Expo API control/showroom-return journeys pass | CURRENT explicit visual approval → full gates; earlier workspace/chat/map gates remain open |
| Normal map clusters and screen-sized final previews — S127; FE-021/053/058, BE-023 | assignment_trace shared policy/tests; chat_owner_audit web; native_audit native; root integration/browser | Locally implemented/focused-tested; source-bound actual Chrome29checks/59states pass, real6desktop/3phone/4landscape, solitary-only glyphs and three mobile interaction fixes | CURRENT visual approval → full/acceptance/release gates; S122 workspace and S125/S126 chat gates retained |
| Admin overdue emails and assignment grace — S126; BE-018/050, DEP-043 | assignment_trace deadline/schema/event; chat_owner_audit email port/dispatcher; root workers/local operations/browser | Locally implemented and verified: protected schema69, real worker/inbox6manager delivery and dedup, both typechecks and focused tests. Pending visual/full/release/commit/rollout | Additive69/tests/backup → local apply → bounded in-app+Mailpit flow → current review; no account-email edit or provider-secret change |
| Unanswered chat escalation and explicit Join — S125; BE-018/050, FE-019/053/062, DEP-043 | assignment_trace backend/schema; chat_owner_audit staff web; native_audit customer web/Expo; root workers/localization/integration | Locally implemented and focused-tested; web6checks/13screens and Expo15functional states verified (strict Expo network receipt mixed). Current source requires visual approval; automatic assignment stays internal | Schema-first focused tests → local protected apply → integrated focused/browser journeys → visual approval → full gates/commit; no hosted/new binary authorization |
| Dashboard and business workspace audit — S122; FE-026/053/056, BE-032/033 | chat_owner_audit admin/staff; assignment_trace owner web; native_audit Expo; root integration | Actual admin/owner/Expo audit and fixes focused-tested; private QA saves/Cancel/returns and canonical location readback verified in S122 | Consolidated review at .local/workspace-audit-s122/review.html awaits visual approval, full gates, scoped commit and rollout; S125 chat work does not replace this work |
| Automatic waiting queue pickup — S121; BE-018, FE-019/026/053, DEP-043 | assignment_trace domain/SQL; chat_owner_audit workers; native_audit actual browser; root integration/UI | Bounded automatic maintenance and no-hold UI correction focused-tested; actual worker assigns all5oldwaiting once by workload; Chrome/admin/staff/Expo and controlled automatic reconnect pass | Current visual approval → full/release/acceptance, scoped commit and coordinated hosted/web/native rollout; retain original failed cold-restart observer as a separate result |
| Mandatory browser user-journey workflow — S120; AGENTS.md, FE_BASE | admin_structure_audit; root integrates | Permanent AGENTS step8 and linked browser guide written; roles/platforms, real persistence and native limits explicit | Apply to every affected future interface task; S119 and earlier visual/full/release gates remain independent |
| Actual local chat reliability/admin usability — S119; BE-018/050, FE-019/026/062 | root Chrome/integration; assignment_trace routing; chat_owner_audit lifecycle; native_audit receipts; admin_structure_audit workspace | Receipt/focus/epoch/sender-side fixes, local migration66, queue recovery and chat-first layout verified; actual Chrome/Expo workflows and worker ending reconciled;12 final admin states pass | Explicit current visual approval → full/release/acceptance; installed-device proof, scoped commit and coordinated hosted migration/API/web/native rollout remain |
| Owner/admin business management, focused page/account tasks — S104/S109/S110/S115/S118; FE-026/053/056, BE-032/033 | owner_structure_audit; admin_structure_audit; root integrates | S115 focused/component/SQL/API and 156-state review pass; S118 contextual actions, visible active navigation and direct Staff editor pass 12 actual states/three journeys | Actual layout approval, full gates, current-source Android, scoped commit and rollout remain separate |
| Signup, handle, private starter preview, cover/media/color and publication — S68–S82/S107/S115 | owner_structure_audit | Earlier baseline has released evidence; current local regressions and S116 repaired journeys preserve those features | Run updated signup/save/publish acceptance after approval; installed-device proof remains |
| Business map and independent product search, filters, country/city, infinite feed and paired panels — S102/S103/S109/S117; FE-065, BE-054 | structure_patterns; owner_structure_audit for native | Local focused/server/browser evidence; S117 panel memory, explicit-intent/history and browser-map departure regressions pass | Inherited visual approval, full acceptance, current-source Android and coordinated web/native rollout |
| Social-only customer contact, automatic localized product copy and floating inquiry list — S105/S106/S113/S118; FE-066/041/053, BE-055 | structure_patterns; owner_structure_audit | S118 focused persistence/contact/security checks and actual desktop/phone/Expo A/B lists pass; only current-business counts, three inbox methods and separate profile links | Review/full gates/rollout; installed Android persistence/OS handoffs remain; preserve support/transport |
| Product-only catalog, ready/custom-order labels, safe demo contacts/data and map dispersal — S86/S102/S112/S118; FE-067, BE-056, DEP-045/046 | structure_patterns; admin_structure_audit for exact local operations | All 67 marked local demos use owner-approved SMS/WhatsApp/Telegram contacts and official platform examples/example.com; backed-up transactions, history/private/real-data preservation and no-op replay pass | Exact reviewed hosted demo-data/configuration plan and coordinated rollout; private login aliases remain; residual fake contacts stay inert |
| Narrative, native-readable languages, inclusive business positioning and public About/shell — S100/S101/S104/S112; FE-049/052 | structure_patterns | Current local copy/catalog/layout evidence recorded | Layout/wording approval and full gates; human first-language review is not implied by catalog tests |
| Daily Featured broadcast scheduling — S36; FE-033, BE-029 | structure_patterns | Recorded baseline implements 8:30 PM–midnight Ethiopia time, six-business cap, four sponsor mentions, automatic scheduling and staff adjustments | Preserve these rules in current Featured/admin acceptance and replacement native-device tests; do not silently replace them with a new schedule |
| Embedded cover/product videos, category examples, in-app links and Android App Links — S62–S82; FE-053/057/060/061 | owner_structure_audit; public device checks shared with structure_patterns | Earlier release evidence exists for supported embedded providers, starter media and link handling; S115 preserves these contracts | Current Android playback/clipboard/browser/app-link checks remain separate; demo/provider data corrections require their own exact hosted evidence |
| Individual shop markers, cluster preservation and sponsor rotation — S51/S85/S86 | structure_patterns | White-edged individual markers and six-second rotation shipped in the earlier baseline; local geography corrections are separately recorded | Preserve clusters; verify current native visibility/foreground behavior and apply only reviewed exact demo-coordinate corrections |
| Visitor and owner transport, separate owner Support, history and staff resolution — S87/S107/S114; FE-019/053/056, BE-018/044 | admin_structure_audit | Baseline transport/support released; current account transport and privacy refinements pass local paired workflows | Approve current UI, run full gates and roll out compatible API before updated native distribution |
| Unlimited balanced assignment, staff roles/permissions and efficient idle endings — S88/S108/S111/S115; BE-018/032/033 | admin_structure_audit | Current local queue/role/version/inactivity/security regressions pass | Current reviewed migration/web/native release; preserve retained history and scoped-agent denial |
| Real browser/Android notifications and truthful visible-message reads — S91–S98/S107/S114; BE-050, DEP-043 | admin_structure_audit | Firebase/FCM/production notification configuration already completed in S98; local notification/read workflows pass | Physical browser/phone permission, background/tap/mute/logout/expiry evidence; current-source native verification remains |
| Web and Expo/Play Android delivery — S98/S99.10/S100–S115; DEP-042/043/044 | admin_structure_audit; root releases | Earlier deployed web/binaries are recorded; latest local changes are not in them | Current visual approval → full/release/acceptance → scoped commit → reviewed migration/web rollout → separately admitted Android artifact |
| Google Play closed-test progression and public launch — S99.11; DEP-044 | admin_structure_audit; root coordinates owner steps | Last recorded Alpha v5 available to selected testers; twelve eligible addresses saved | Fresh tester/device status, actual required enrollment/duration/feedback, production-access application and separately authorized public rollout; eligibility is not enrollment |
| Play listing graphics and TikTok/Instagram coming-soon campaign — S99 presentation/campaign records | structure_patterns | Prior listing/media exist; latest product-only narrative/assets are not yet fully regenerated/published | Reconcile current UI/copy into promo assets, check listing/media constraints; official social handles remain owner-supplied; no unapproved posting |

Current approval dependency: S118 contacts/lists/staff tasks, S115 management and
earlier linked public/chat candidates await explicit visual approval under AGENTS.md step8.
This process request does not itself approve those layouts or authorize a new build.
Current-source installed Android and real OS notifications remain unverified;
Expo browser or an older APK must not be reported as that evidence.

Superseded instructions stay historical: Buying assistance became Transport chat;
only direct Suqpage business inquiries were removed; products replaced services;
Account replaced the older owner Dashboard/Profile label; supported video links no
longer require staff/channel approval; one canonical Android identity replaced a
separate preview-app identity. Completed Firebase/signing/setup must not be repeated
because an older checklist checkbox predates the completed S98/S99 operation.
Retained scope boundaries include free business accounts, no subscription/payment
plans or platform checkout, and transport arrangement as the revenue service.
Requests explicitly withdrawn as belonging to Loadgistic remain outside this repo.

## Historical delivery records

Historical record dated 2026-09-14: D5 was the hosted delivery follow-up; publication is complete.
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
Owner confirms personal developer account created after 2023-11-13 and has now
provided its created app dashboard. Scope is Suqpage only; preserve unrelated
untracked deno.lock. Master
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
- [x] OWNER CONSOLE: receive the created app dashboard and reported login.
  Developer 5256539403314542898, app 4972244998230912603,
  marketvision.tech@gmail.com for login and explicitly selected public store support;
  owner-provided evidence, not authenticated readback. App/admin/privacy identities
  are separate and unchanged by this store contact choice.
- [ ] CURRENT OWNER CONNECTION: independently verify developer/app/package,
  required account/device verification and selected signing policy.
  Do not enroll a new signer or upload any private key incidentally.
  Owner's current creation form also asks for Package name: com.suqpage.app.
  Google API reads title SuqPage/en-US, saved English/Amharic descriptions, selected
  contact and seven image hashes; four tracks and APK/bundle lists stay empty.
  The independent temporary read edit is deleted; Google approval is not claimed.
  Installed app label
  remains Suqpage; signing/account/device verification remain separate.
- [x] Implement and verify reusable reviewer access, UGC report/block workflow and
  the deletion runbook under ready FE/BE specs. Full local gates, source ea1b452,
  protected schema-63 migration/rehearsal and web/API deploy 6ac98a227b9a61a7dad27116
  pass. Exact reviewer provisioning/binding and real web/native API sessions pass;
  real erasure requests, Console declarations and new native delivery stay separate.
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
it does not cover this new AAB. No app upload, new build or tester invitation has occurred in S99; the exact
approved Expo submission credential association is independently verified.

S99.1 — finish Play-required application behavior and remote-upload preparation
(FE-063 / BE-051 / DEP-044). Owner asks to finish requirements and use remote
Expo upload where possible; owner supplied the Console app dashboard, but the
submission account/permission/key binding is not configured. Preserve
S98 phone evidence and S99 signing/reviewer decisions. Local reversible feature
work proceeds independently; no provider secret/signing write is inferred.

- [x] Specify bounded asynchronous reports, private staff role/version/target
  contracts and per-install/browser blocking; no general guest help chat.
- [x] Implement domain, private migration 63, report delivery/queue,
  parameterized discovery/fuzzy exclusions, public web/native controls and five
  languages; verify real local persistence, negative/security and focused UI flows.
  Real isolated PostgreSQL and web/native HTTP report/replay/rate/role/assignment/
  stale/removal tests pass. Actual local browser delivery, preference persistence,
  native inquiry blocking and admin removal/support resolution pass. Schema 63
  is local only after protected backup; original record counts and private table/
  sequence grants are verified. No provider or production mutation.
- [x] Capture actual desktop/phone report/block/unblock/staff states, including
  390/320 in all five languages; no browser errors or horizontal overflow.
- [x] Owner delegates release design choices; retain the tested report/block/staff
  visuals. Actual local five-language desktop/phone captures are reviewed in
  .local/play-s99/safety-ui/. Proceed to required gates without repeating permission.
- [x] Complete delegated restricted reusable reviewer access locally; real provider
  sessions and ordinary owner page/product edits, publish and public readback pass.
  Hosted provisioning/binding and installed Play access remain separate.
- [ ] Finish verified privacy/deletion operations and store declarations; do not
  claim actual deletion from a mail link or invent retention/privacy promises.
- [x] Receive owner confirmation that Android Publisher API is enabled in the
  existing suqpage Cloud/Firebase project under falmata.dawano@gmail.com.
  This is owner evidence; independently verify API/key/access before upload.
- [x] Receive/validate the owner's dedicated suqpage-play-submit service-account
  key for project suqpage; exact email, bounded JSON and RSA signature checks pass.
  Protected identical backup is 0600 in an ignored 0700 directory. No credential
  bytes are printed or packaged; provider permission/association remains unverified.
- [x] Verify the exact service account's
  app-only permissions under Play developer 5256539403314542898/app
  4972244998230912603, canonical package com.suqpage.app: Google API HTTP 200,
  ACCESS_GRANTED, app Admin, no global Admin/other apps/partial grant. A request-
  format 400 is resolved by one documented pageSize=-1 retry; no writes or role
  changes. Later downgrade/removal remains available. Supported listing/track/
  review operations are separate from EAS binary upload; Console-only owner tasks
  and every release/signing/approval gate remain required.
- [x] Verify official Expo login, selected project and canonical credential target:
  @falmatad/suqpage, bfc289fb-238e-44a3-9e0f-fec6a7c857d1, com.suqpage.app.
  Submission binding is empty, current FCM and signer match; protected before
  metadata and exact source key exist. No existing submit key will be overwritten.
- [x] OWNER CLI EXCEPTION: accept the exact one-operation official EAS CLI
  plan (.local/play-s99/expo-submit-review.md), or perform the dashboard addition.
  Owner explicitly approves the reviewed official-CLI connection. Digest
  353fdd27c1dc4020a5748c8f2add7f400db3d470cef16d86c59fa53522295ca2;
  protected source and unchanged plan are verified. No raw fallback/new build.
- [x] Bind selected submission key through the approved CLI,
  independently verify target/backup/key association, preserve FCM/signing.
  Official EAS CLI 24.10.0 exits 0; exact provided key ID/project/account matches
  the canonical com.suqpage.app EAS Submit binding. FCM and canonical/legacy
  signing metadata match the protected before-state. No build/submission ran.
  Private terminal operation receipt: .local/play-s99/expo-submit-complete.json.
- [x] Receive owner's delegated release decisions: proceed with the tested visual
  design, choose restricted reusable reviewer access and preserve the existing
  signing key. Continue safety/verification gates rather than asking the same
  choices again. This does not claim policy compliance or testing enrollment.
- [x] Implement/test restricted reviewer access and privacy/deletion fulfilment;
  verify committed compatible hosted schema/API/web and dedicated reviewer binding.
  Existing-key Play enrollment remains in the next release step.
- [ ] Pass complete gates and new artifact admission, then signed AAB inspection
  and exact internal-draft EAS Submit; no automatic public track promotion.

Focused S99.1 evidence: scripts/test-catalog-safety.ts, existing discovery/mobile/
staff suites, both typechecks, localization/native rendering/build/link contracts,
and protected .local/play-s99/safety-ui/ receipts. The native captures are browser
previews, not an installed Android release. docs/GOOGLE-PLAY-CONNECTION.md provides
the owner's click-by-click steps. Google developer/package/app-only access and Expo
target/signer and exact EAS Submit key association are independently verified;
actual Console title SuqPage/en-US/empty tracks now verifies. Console-only setup,
Play signing, AAB and store publication remain pending; web/API is published.
Reviewer/signing/visual decisions are delegated by the owner's newest instruction;
implementation, policy verification and all release gates remain required.

### S99.2 — finish delegated closed-test readiness

FE-064/BE-052/DEP-044. Retain existing signing identity, email codes for regular
users, web-only staff and independent real tests. Master §§11/15/16/17/22 affected.

- [x] Specify the bounded server-bound reviewer exception and record ready contracts
  before code. Store the owner's six initial tester addresses privately; do not
  claim opt-ins, invent testers or send before an admitted closed test is ready.
- [x] Implement pure reviewer policy, fresh PostgreSQL eligibility, bounded provider
  password verification and web/native adapters. test:reviewer-access passes real
  local PostgreSQL/Supabase JWT, tenant/staff/role races, origin/body/rate/no-store
  negatives. Actual managed web cookies/native-browser sessions, ordinary OTP,
  wrong password/secret clearing and 25 five-language viewport captures pass in
  .local/play-s99/reviewer-ui/. This is local only, not a Play-delivered install.
- [x] Finish verified local privacy/deletion operations and focused validation.
  Final Console declarations remain a separate rollout gate. test:account-erasure passes exact identity/shared-tenant/staff/drift/backup
  guards, FK rollback and real local Auth/media erasure with other-tenant/shared
  uploads preserved. No real customer account is erased. Public privacy copy now
  covers map caching, push, controlled embeds and the verified deletion procedure.
  BE-053 adds a narrow verified-owner erasure recipe and rehearsal/runbook;
  real customer deletion always requires a separate verified request and exact
  backup/target approval. Test app/Auth/media erasure and other-tenant preservation.
- [x] Pass full check, clean isolated web release, 11 acceptance workflows, operations
  and mobile build contracts. Final privacy-only copy passes all-language 390/320
  capture and localization/narrative/geography checks.
- [x] Verify a protected production public-schema backup and actual isolated restore;
  rehearse 62→63 preserving every original table fingerprint, idempotency and
  private report table/sequence grants. Production is unchanged by rehearsal.
- [x] Review/scoped commit ea1b452 and refresh final copy artifacts. Protected
  backup/actual restore and the exact owner-approved recovery retry prove schema 63,
  original records and private permissions. Compatible web/API deploy
  6ac98a227b9a61a7dad27116 and dedicated reviewer provisioning/binding pass with
  21 live checks; no customer chat/email/notification is sent. Protected receipts:
  .local/play-s99/production/, production-live-verified.json and artifact.json.
- [x] Save app-scoped Google store text/contact/images with protected exact empty
  before-state. Google validates then rejects the no-review parameter definitively;
  independent uncommitted readback/revalidation precede its supported standard
  metadata-review save with ERROR_IF_IN_REVIEW. Fresh readback proves English/
  Amharic text, support email/website and all seven images; tracks/binary lists remain
  empty. No app release, signer, policy declaration or invitation is changed.
  Evidence: .local/play-s99/store-metadata/verified.json; read edit deleted.
- [x] Verify the owner-supplied Google encryption public key and protected existing
  keystore against the released app certificate. Local export planning is bound
  to developer 5256539403314542898, Console app 4972244998230912603 and
  com.suqpage.app; no provider or signing-key change has occurred.
  Evidence: .local/play-s99/signing/export-plan.json.
- [x] Prepare the encrypted existing-key PEPK ZIP, verify its included
  certificate and protect it for owner upload to the selected SuqPage signing page.
  Official Google PEPK exits 0 with bounded execution and password echo disabled;
  the ZIP contains only ciphertext and the pinned public certificate. Original
  keystore hash is unchanged; no new key, provider write or plaintext private-key
  file. Evidence: .local/play-s99/signing/export-verified.json.
- [x] Owner supplies the resulting Google App signing SHA-256 after the requested
  ZIP upload; it matches the pinned certificate and verified encrypted export.
  Receipt: .local/play-s99/signing/owner-certificate-confirmation.json. This is
  owner Console evidence; independently inspect the Play-delivered signer before
  distribution rather than treating a future AAB upload signature as that proof.
- [x] Owner approves the exact one-free-AAB tooling exception, digest
  b97dc5dc89b4aa1c8a97ec04dc01d7dbb5f018e69be5269363c1f16f667d7a38.
  Fresh locked audit still fails with the same 20 high/two unpatched tooling roots;
  no new advisory or runtime exposure. Free quota remains 11/30, zero cost.
  Public API/Auth/Firebase configuration and existing signing/FCM/Submit binding
  are independently rechecked. Approval: .local/play-s99/aab-admission-approval.json.
  Official EAS archive inspection passes: all 1,621 files match ea1b452, private
  credentials/runtime files absent. Receipt: .local/play-s99/eas-archive-inspection.json.
- [x] Run one free production AAB build from immutable source ea1b452 with
  existing credentials frozen, no automatic submission and no public release.
  Build 641cb96a-3296-409b-b7ae-eabb28bc11fa is FINISHED, version 3, cost zero;
  free usage is now 12/30. Exact AAB hash 7192acc4b921a1b972a1a18608a376039694b5d27456a75a2174e7bfb524be91,
  API 36, nondebug, pinned signature, private-byte exclusion, 16-KB bundle config
  and all 50 native ELF libraries pass. The one-artifact exception is consumed.
  Existing signing/FCM/Submit metadata remain unchanged. Receipt: aab-inspection.json.
- [x] Upload only that AAB to internal draft. EAS submission
  1c29e427-ef90-4119-bca1-1756607fc9a2 is FINISHED; independent Google readback
  matches version/hash, draft status and unchanged listings/contact/other empty tracks.
  Google-generated universal APK cryptographic signature/package/version/debug and
  16-KB ZIP alignment pass. Evidence: .local/play-s99/play-upload-verification/.
- [x] Install/update and test Google's official signed test splits on a fresh
  isolated API 35 emulator: 12 public states, five languages, retained Somali
  preference, canonical HTTPS app links and absence of native crash/metrics/text
  errors pass. Google's protected universal APK requires Play Store, absent in
  this emulator; actual protected Play-installed phone testing remains separate.
  Production protection is unchanged. Only task emulator 5576 is closed afterward;
  emulator 5580 and original AVD data are preserved. Native-public-verified.json
  and android-device/ receipts retain the distinction; no account/chat/inquiry submitted.
- [ ] CURRENT: complete Console-only policy/setup forms and test the protected
  version on an actual Google Play-enabled phone before the reviewed closed rollout.
  Restricted App access instructions and six supplied tester addresses/import CSV
  are prepared privately. The owner now requests agent completion through the
  signed-in Chrome UI and enables Apple Events; only developer 5256539403314542898,
  Console app 4972244998230912603 / SuqPage / com.suqpage.app is authorized.
  The owner selects teens and adults (13–15, 16–17, 18+); no younger age group.
  Ordered DEP-044 steps, retaining protected before-state and readback per form:
  - [x] Verify browser/account/app identity and retain the current draft
    before changing its fields; never operate on Loadgistic or another app.
    Evidence: .local/play-s99/console-setup/browser-identity-verified.json and
    protected current-form before-state; marketvision.tech@gmail.com / SuqPage.
  - [x] Save reviewer access using the verified dedicated account and instructions
    within Google's actual 500-character limit; verify persisted restricted access.
    Actual provider reload and saved edit-dialog compare prove exact credentials,
    restricted access and 443-character instructions. Evidence:
    .local/play-s99/console-setup/sign-in-persisted-credential-verified.json.
  - [x] Save and verify privacy, ads, government/financial/health declarations and
    Shopping category/contact fields against actual features and current forms.
    Saved UI reloads verify Ads Yes, government No, no financial/health features,
    Shopping and unchanged contact/type/marketing settings. Protected receipts:
    .local/play-s99/console-setup/*-verified.json; privacy URL is unchanged.
  - [x] Save and verify owner-selected audiences 13–15, 16–17 and 18+;
    no younger age group or invented Google rating. Receipt: audience-verified.json.
  - [ ] Complete final IARC content rating. The later owner delegation supersedes
    this step's original manual-only workflow; the incomplete draft is prepared,
    saved and verified under S99.3. Final answers await actual catalog policy.
  - [x] Review application and SDK data against the current Data safety form/export,
    prepare exact answers, retain recoverable before-state and verify saved results.
    All 15 selected types, purposes, sharing and optionality match fresh expanded
    Google UI readback. Full-account deletion URL retained; no separate partial
    deletion or unavailable certification claimed. Receipt: data-safety-verified.json.
    Official blank export and imported CSV remain private; raw CSV readback is
    not claimed. Dashboard now verifies 10 of 11 setup tasks complete.
  - [x] Retain internal tester/release before-state and confirm the exact
    admitted version 3. Create a SuqPage-specific list from the six supplied
    addresses and select it only on this app's internal track. Fresh Google reload
    and list-dialog compare verify all six addresses. Approved store support email
    is preserved; this screen offers no separate feedback field. No invitations or
    opt-ins invented. Receipts: internal-testers-verified.json and
    internal-testers-membership-verified.json; other existing list untouched.
  - [x] Inspect the existing internal-release preview and roll out only version 3
    to that internal list; verify Google's resulting status/version/hash/link and
    unchanged other tracks. Google shows Active / Available to internal testers;
    independent API verifies completed version 3, the same bundle hash, unchanged
    listings/contact and other tracks. Owned read edits are deleted. No rebuild,
    signing change or public/closed rollout. The sole preview warning is absent
    crash-deobfuscation metadata, not a blocking error. Receipts:
    internal-api-after/verified.json and internal-distribution-link.json.
  - [x] Record completed/pending Console cards and actual internal distribution:
    console-setup-final-verified.json confirms 10/11, IARC manual, zero closed opt-ins.
  - [ ] CURRENT: test the protected Play-installed build on an actual phone;
    authenticated owner/chat/notification evidence remains separate. Internal
    join link: https://play.google.com/apps/internaltest/4701297357173307496.
    Testers must leave internal testing before later joining the closed track.
- [ ] Complete closed-track rollout, add initial approved
  tester list and provide actual opt-in link. Obtain at least 12 continuous
  opt-ins for 14 days and record genuine feedback before production access.

S99.3 — extend tester access while the owner is unavailable (one-time DEP-044 operations)

The owner supplies four additional addresses on October 10 and asks to finish
available setup. Addresses stay private; aliases do not substitute for genuine
test participation. No new binary, signer, role, other app or public rollout.
Master §§15/17 and current distribution docs will reflect only verified results.

- [x] Back up the six-address private source and exact saved SuqPage
  list; verify account/app/list/active internal version before any write.
- [x] Extend only that list to the supplied ten-address union, preserving all six
  members and track selections. Fresh provider reload and list-dialog comparison
  prove all ten exact addresses. Receipts:
  .local/play-s99/console-setup/tester-expansion-membership-verified.json and
  tester-expansion-reloaded-track-verified.json; protected six-address backups
  remain in .local/play-s99/testers-oct10/. No invitations, aliases or opt-ins created.
- [x] Inspect SuqPage's closed-track before-state. Where Google offers
  tester setup, select only this verified list and approved feedback contact,
  then verify persisted settings. Leave releases/countries/signing unchanged;
  no closed rollout until rating/setup and phone gates pass. Alpha access and
  marketvision.tech@gmail.com feedback match actual provider reload; releases
  remain empty/inactive and countries unselected. Receipt: closed-alpha-access-verified.json.
- [x] Prepare the closed-test handoff and real-phone feedback instructions; keep
  rating/catalog policy, phone evidence and closed enrollment/14-day gates explicit.
  Private files: .local/play-s99/testers-oct10/tester-instructions.txt and
  closed-test-handoff.json. No invitation sent or test result invented.
- [x] Inspect the rating setup under the owner's latest explicit delegation,
  superseding the repository's earlier manual-only workflow. Retain exact
  before-state and proposed answers against actual capabilities. Use normal
  authorized Console controls; stop at access/anti-bot blocks or missing facts.
  Submit no fabricated rating or false declaration; record provider outcome and
  any remaining required owner action. External terms remain unchanged.
  Consumer-store/contact and terms step are completed with normal Console controls;
  Google saves an incomplete draft, and reload verifies eight feature answers.
  Receipt: rating-incomplete-draft-verified.json; no rating submitted.
- [ ] CURRENT: establish the actual catalog-content rules/moderation scope before
  final rating answers. Automatic approval review rejects unsupported online-
  violence No before execution; no bypass/retry supplies it. The question remains
  unanswered and Next disabled; a single owner policy question is pending.
  Dashboard remains 10/11, closed opt-ins zero. Receipt: ten-testers-final-verified.json.
- [x] Validate scoped operational docs: all 190 spec/ADR links and whitespace
  checks pass; current master/runbooks/traceability distinguish verified preparation
  from pending rating/phone/closed rollout. Commit only the eight reviewed docs
  after staged-scope verification; preserve unrelated deno.lock and private artifacts.

S99.4 — publish catalog policy and finish truthful rating (FE-063 / BE-051 / DEP-044)

The owner confirms the ban, then clarifies alcohol/tobacco are prohibited and
removed when found. This resolves policy intent without claiming actual seller
content is automatically checked. No new dependency, migration, Android build,
signer or other application change. Master §§13/15/16/17 will be reconciled with
verified policy/publication and the final rating outcome.

- [x] Inspect the current public catalog and retain a protected bounded
  text review; distinguish candidate matches from confirmed violations and from
  unreviewed images/videos. Do not mutate customer listings based on keywords.
  Evidence: 53 public API pages / 264 offerings / zero keyword candidates;
  text-only review, not media review or a zero-violation guarantee. No listing writes.
- [x] Add concise five-language public Terms rules and staff guidance using the
  existing report reasons, authorized removal and actual-removal resolution check.
  No blanket automatic content scan or broader support/staff permissions.
- [x] Focused localization/type/report workflow checks and actual Terms captures;
  use the owner's existing delegated design acceptance for this policy-text update.
  Evidence: typecheck, localization and real local report workflow checks pass;
  15 actual five-language desktop/390/320 Terms states plus focused phone captures.
  All 11 browser acceptance workflows pass. Protected receipts under
  .local/play-s99/catalog-policy/. Android's canonical hosted Terms link verified.
- [x] Run required check/web-release/workflow gates on clean isolated source;
  inspect artifact, independently verify SuqPage target and retain current deploy
  for rollback. Publish compatible web policy only; no DB/provider-config write.
  Original check hit a local fixture query timeout; unchanged focused seed retry
  passes. Original isolated build omitted tracked mobile helper sources imported
  by tests; restore tracked sources only. Preserve both failures, use one bounded
  retry per gate, and do not weaken timeouts/checks or add native dependencies.
  Full check retry and corrected clean web release now pass; preserve the missing
  local fixture URL diagnosis. Provider packaging initially selected no workspace;
  use the previously verified temporary-CWD/explicit-web-root CLI invocation.
  Actual packaged Linux handler/Sharp/worker and private-path/key exclusion pass.
  Reviewed source commit de68832 is published as Netlify 6aca91cb2f49de22d3839199;
  exact target/account/runtime and retained old deploy/archives are verified.
- [x] Verify live policy in all languages and Android's existing hosted Terms link;
  resume rating from its saved draft with owner decision/source evidence, retain
  final answer preview and verify Google's saved rating/setup outcome.
  Five live language/phone states and 12 read-only compatibility checks pass.
  All 25 reviewed answers and regional summary are saved; reloaded IARC says
  Completed/Submitted, certificate ID unassigned. Dashboard unlocks closed setup.
  ESRB Teen, generic/USK/Brazil/Russia/South Korea 12+, PEGI parental guidance.
  Possible minor/moderate seller language is disclosed; current-user location
  broadcasts and dedicated chat moderation are not invented. Two rejected
  proposals are replaced with safer accurate choices, without a bypass.
- [x] Validate and commit the separate rollout-evidence documentation,
  preserving deno.lock and all private evidence outside Git. No new application
  source, build/signing, countries, release, invitation or enrollment changes.
  Phone check has been requested. Country/release/Google review and genuine 12/14
  closed testing remain. Send app for review is currently disabled by Google;
  no review submission or public release is claimed.

- [ ] NEXT DEPENDENCY: actual protected Play-installed Android phone workflows
  and system notifications. S99.5 may prepare countries/an unsubmitted draft while
  this evidence is pending; actual closed rollout and its real opt-in link remain
  gated. Do not claim a 12/14 clock before real
  Google enrollment. Continue the already authorized Play rollout from this gate.

S99.5 — autonomous closed-track preparation (one-time DEP-044 operations)

Owner requests continuing all independent work while recruiting further testers.
This permits preparation using the existing admitted AAB, not another build,
signing change, enrollment or public release. Definition of Ready: exact app,
artifact, tester-list boundary, country scope, protected before-state, normal UI
confirmation, independent readback and rollback-by-stopping are specified in
DEP-044. Master §15's distribution state and related runbooks will be reconciled.

- [x] Inspect fresh exact SuqPage/account/Alpha controls and current Google
  country-targeting documentation. Setup/rating complete; Alpha inactive with
  no release or countries. Country controls apply to this selected test track.
- [x] Retain protected API/UI before-state and verified exact bundle,
  signer, metadata and other tracks. Record the concrete Alpha-only country/draft
  plan; preserve user-owned deno.lock and all credentials/tester details outside Git.
  Exact 178 selectable rows and existing version-3 file hash verified. Original
  API reads/owned-edit cleanup succeeded; its local receipt formatter mishandled
  an empty production-country response. Retain that failure and its read-only
  Google confirmation of deleted edit; no provider operation was repeated.
- [x] Save all currently selectable country/region rows on Alpha only through
  normal confirmation; preserve other-track availability. Reload and independently
  compare the exact 178 names/statuses against the retained UI set. Publishing
  overview records 177 countries plus Rest of World, Alpha-only/unsynced from
  production. Final API/other-track comparison remains separately pending below.
- [x] Create/save one unsubmitted Alpha draft with existing version 3 and concise
  accurate test release notes. Inspect the final saved preview; no new upload,
  key, paid build, review submission or activation. Stop on unexpected outcomes.
  English/Amharic notes pass field comparison; Save as draft and fresh reload
  verify Inactive/Draft and 3 of 4 track steps. Preview has only the known
  nonblocking deobfuscation warning. Internal remains Active/Available; only
  SuqPage's ten-member list selected, other app lists untouched. Review disabled.
- [ ] CURRENT VERIFICATION GATE: one fresh independent API read of the saved
  Alpha draft/countries and unchanged other-track metadata/artifact. Automatic
  approval review rejects the command twice before execution due to the earlier
  recorded stop, despite Google's deleted-edit confirmation and local formatter
  proof. No workaround; request exact owner direction in the protected
  closed-preparation/readback-review.md. Console readback is verified, final
  API comparison is not. No provider retry or restore has occurred.
- [x] Reconcile runbooks, current spec/master/traceability state and concise owner
  install/feedback instructions. All 190 specs/ADR links and whitespace checks
  pass. Protected aggregate Console assertions pass and a blank private feedback
  CSV is prepared without invented results. Commit only these operations records
  after staged-scope review; unchanged application gates are reused. This records
  verified preparation, not completion of the pending API or rollout gates.
- [ ] REMAINING ROLLOUT GATE: protected Play-installed physical-phone workflows
  and system notifications, then reviewed closed rollout and actual opt-in link.
  Recruit genuine testers; no invented identities, feedback or 12/14 clock.

S99.6 — complete the professional Play listing presentation (DEP-044)

Owner requests all graphics/screenshots and modern store materials. The one-time
store presentation should be visually strong with minimal text: short headlines,
large authentic app screens and SuqPage colors. Preserve S99.5's pending API approval and physical-phone/
rollout gates. Definition of Ready: existing brand, exact app/account, native v3
source, English/Amharic Console locales, Google asset rules and real feature
claims are known. Master §15/store runbook will describe only verified outcomes.

- [x] Inspect existing listing and seven saved assets, actual v3 native captures,
  current Google image/video/copy requirements and supported listing languages.
- [x] Prepare polished layouts from retained authentic native captures: six
  English and five Amharic phone images, two feature graphics and the unchanged
  icon. Record v3 sources and the unchanged visible v2 showroom fold explicitly;
  no new native capture, fabricated UI or customer conversation is claimed.
- [x] Verify source/brand hashes, dimensions/opacity/size, copy limits and caption
  area; inspect phone-size compositions under delegated store-design review.
  Protected evidence: store-presentation/collection-v2/ under .local/play-s99/.
- [x] Prepare two portrait Google preview videos; metadata and full H.264 decode
  pass. No official YouTube channel or eligible URL exists, so video remains
  optional and unattached in Console.
- [x] Preserve existing Console media/copy and save supported images and revised
  descriptions using normal SuqPage-only controls. Independent fresh reload
  verifies both locales; all 13 new CDN thumbnails match after Google's resize/
  transcode. Record accurate AI-composition declarations. Authored alt text stays
  in presentation.json: no supported alt-entry control was exposed, so provider
  application of those descriptions is not claimed. Icon/video remain unchanged.
- [x] Record optional-media/device limits and owner steps in the release runbook.
  Final Publishing overview read verifies the SuqPage app, disabled review button
  and no review action; this is saved preparation, not Google approval.
- [ ] Commit the scoped records with the app-copy task after its approval/gates.

S99.7 — TikTok/Instagram coming-soon launch kit (DEP-044)

Owner extends the task to a complete professional organic launch program. The
official accounts do not yet exist; the owner will create them. Prepare reusable
media, native captions in the app's five languages, bios and an ordered posting
plan; do not create accounts, publish, message others or invent a scheduled post.
The web platform is live, Android is coming soon, and no fixed date, Play
pre-registration, public app availability, checkout or guaranteed transport is
advertised. No ad spend, tracking SDK, new backend/waitlist or paid campaign.

- [x] Inspect current official promotional-content and media rules; use SuqPage
  brand assets and actual app screens, with readable minimal text and no third-
  party music or made-up testimonials/metrics.
- [x] Prepare portrait videos/Reels/TikToks, feed/story posters, profile icon,
  launch captions/bios and a simple visitor/business posting sequence. Keep
  Google listing assets separate from social promotional assets.
- [x] Verify rendering/encoding/native copy and website destination; document
  posting instructions and account handoff, while actual publishing stays pending
  the owner's accounts and the appropriate platform controls.
  Five 14.3-second H.264 videos pass full decode. Twenty posters, five outros,
  profile icon, captions/bios and an ordered posting plan cover all five languages.
  Conservative portrait overlay margins, silent audio and separate own-brand/
  AI-content disclosures are documented. Final 54-file ZIP passes CRC validation;
  no credentials, tester addresses or private runtime records are included.

S99.8 — collection-led narrative across clients and launch materials (FE-052,
FE-049, DEP-044; L1 implementation with separate L3 rollout)

Newest owner direction: make an organized business collection the main benefit,
instead of leading with seller location. Preserve all discovery/transport/account
features and earlier S99 release gates. Definition of Ready is met; no data/API
change, checkout, automatic social import or stock guarantee is implied. Master
sections 1/3/18/19/22 and the release-state statement in 15 are affected.

- [x] Record scope, audiences, native-language contracts and ordered plan before
  code; inspect shared copy, localization source, tests and current Play materials.
- [x] Revise shared Market/About and aligned account entry; author all
  four contextual locale catalogs. Merchant text remains verbatim.
- [x] Align English/Amharic Play listing, minimal-text graphics and all five
  social campaign locales; preserve original captures and earlier artifact hashes.
- [x] Run focused narrative/localization/spec/type checks and capture actual web/
  Expo-browser desktop/phone states; inspect graphics/video and retain evidence.
  Narrative/launch-material, homepage, 10 localization tests (1,401 messages),
  both typechecks, mobile contracts and 190-spec validation pass. All 69 local
  browser states pass layout/action/metadata checks with no page errors. Fix Metro
  shared-lib watching and verify its regression without watching private runtime
  directories. This is browser evidence, not a new installed-phone check.
- [ ] SUPERSEDED CANDIDATE: S99.8 app-copy approval is replaced by the S99.9
  clarity correction below; preserve its implemented/tested evidence. Obtain acceptance before full
  app/release gates. Owner-delegated store presentation review stays separate.
- [x] Reconcile verified implementation and traceability; preserve deno.lock.
- [ ] Run full required app/release gates and commit reviewed task files after
  visual approval. The latest copy is local, not deployed or built into Android.
  New Android delivery requires its own artifact admission; S99.5's protected
  API-read approval, real-phone/alerts, Google review and closed activation remain
  pending and are not inferred from marketing preparation.

S99.9 — research-led first-glance copy clarity (FE-052 / FE-049, L1)

Owner feedback: the heading and "collections behind social media posts" are too
ambiguous. Identify businesses selling on social media immediately, describe
organized online stores and direct inquiries, and balance brevity with clarity.
This refines the existing authorized task; it does not replace earlier rollout
gates or approve the rejected S99.8 app candidate. Definition of Ready is met:
audiences, shared copy/localization contracts and unchanged data scope are known.
Affected master sections: 3/18/19/22; 15 retains actual saved/released state.

- [x] Research primary homepage/app writing guidance; compare against the actual
  Market header. Record findings and observable clarity requirements before code.
- [x] Revise shared Market/About copy and four contextual catalogs.
  Preserve the existing organized-store proposition, map and all user workflows.
- [x] Run focused narrative/localization/type checks and actual local desktop/
  phone captures; verify the header is readable without hiding map controls.
  Narrative/launch-material, homepage, ten localization tests (1,406 messages)
  and both typechecks pass. All 69 local five-language browser states pass; actual
  English/Amharic phone captures are inspected. Protected copy-clarity-s999/
  evidence under .local/play-s99/. Tiles are test-stubbed, no new native build or
  customer-comprehension study is claimed.
- [ ] SUPERSEDED CANDIDATE: S99.9 is replaced by the owner-accepted S99.10 narrative;
  explicit visual approval before full app/release checks.
- [ ] After acceptance, align Play/social copy and graphics; preserve previous
  saved assets and exact evidence. Verify new local/provider states separately.
- [ ] Run applicable full gates, reconcile specs/master/traceability and commit
  explicit task paths. New Android admission and all earlier external gates remain.

S99.10 — owner-accepted proximity and organized-store narrative (FE-052,
FE-049, DEP-044; L1 copy/media with separate L3/L4 rollout)

Owner explicitly accepts: "See how close the businesses selling products you’ve
loved on social media are to you. Browse their products, styles and services in
organized online stores, then contact them directly without digging through old
posts." Apply across web/mobile/About, all five languages, store and campaign
materials. Scope is presentation only: no distance algorithm, social import,
checkout or catalog/account/map-behavior change. Definition of Ready is met;
accepted meaning, existing ports, source media and exact provider targets are known.
Master sections 1/3/15/18/19/22 are affected. Earlier release gates persist.

- [x] Record accepted meaning, audience-specific adaptation and ordered plan;
  inspect shared copy, active surfaces and one-time media generators before edits.
- [x] Update shared Market/About/map/account entry and four contextual
  catalogs. Use accepted first sentence as heading and remaining sentence below;
  keep business-owner copy about their store, location and direct inquiries.
- [x] Align English/Amharic listing, five-language campaign copy and short media
  captions; rebuild into a new protected directory, preserving previous sources.
- [x] Run focused copy/localization/type checks; capture all affected desktop/
  phone states, inspect the long heading and graphics, verify video/ZIP integrity.
  Narrative/homepage contracts, ten localization tests (1,414 messages) and both
  typechecks pass. All 69 browser states pass; long English/Amharic phone headings
  and five-language audience sheets are inspected. New paths proximity-v1 and
  launch-kit-proximity-v1 preserve earlier files. Fourteen store images, twenty
  social posters, profile icon and seven H.264 full decodes pass; 54-file ZIP CRC
  passes. No new native screenshot, phone proof or published campaign is claimed.
- [x] Obtain explicit acceptance of the actual new layouts before full release
  checks. Copy meaning is approved; prior app candidates are superseded.
  Owner explicitly approves the linked web/Amharic-mobile layouts and release
  checks on October 12. This approval precedes the new full gate invocation.
- [x] Save/reload the aligned scoped Play drafts under existing store delegation;
  retain before-state, accurate declarations, independent evidence and no rollout.
- [x] Run applicable full source gates after visual approval; complete check, isolated
  release:web, eleven acceptance workflows, operations/mobile contracts, Hermes
  export and actual packaged Linux handler/worker pass. Reconcile durable evidence.
- [x] Commit the 26 explicit task files as 3cfa577; staged-scope and whitespace
  checks pass, deno.lock stays untouched. Bind the clean publish source and exact
  Linux archives, private-path/key scans, consistent schema-63 backup and immutable
  rollback deploy. One production upload completes successfully. Independent
  readback and twelve public/API/guard/link checks plus fifteen live phone states
  pass on Netlify 6acd6e4203a2e50c6b9286dd. No configuration/schema/customer writes.
- [x] Exact one-free-AAB review is approved under DEP-044, digest
  4e4b9640bb318a28f147ade33694d78b7ab1f038e3b23888fbad8167bd728383;
  native-only clean install, fresh failed audit (20 high/two roots), Hermes/runtime
  privacy, 1,622-file actual EAS archive, public target/Firebase metadata, same
  default certificate and Free 15/30 zero-cost quota pass admission checks.
  Owner explicitly approves this one free build. No new cloud build has started.
- [x] Refresh exact Expo project/public-runtime/signing/advisory admission;
  verify committed source, archive, runtime, lock and fresh advisory set against
  the approved digest and start one frozen-credential cloud AAB attempt.
  CLI exit 1 is an explicit Free Android quota rejection after upload/version 4
  reservation. Independent exact-project readback proves zero new cloud jobs and
  zero artifacts. The aggregate 15/30 metric was not Android-specific; Free is
  15 Android plus 15 iOS. No signing/configuration or paid change occurred.
- [x] Complete the same one approved artifact using the documented EAS
  local production workflow on the prepared Mac, with frozen existing credentials
  and unchanged source/lock/public runtime. Keep failed cloud evidence; no cloud
  replay, paid upgrade, remote version rollback or automatic submission.
- [x] Monitor the local process to terminal status; check actual output/signing/
  privacy/API/native alignment before admission.
- [x] Retain and inspect the actual local AAB package/version/signature/API/privacy/
  native page alignment, then record consumed exception and scoped evidence.
  One local version-5 AAB from 3cfa577 passes actual signature/API-36/privacy/Firebase/
  compiled-five-language/16-KB checks; 1,499 files and fifty 64-bit libraries are
  verified. Exception is consumed; cloud job does not exist, payment is zero and
  signing/legacy/FCM metadata is preserved.
- [x] Obtain separate owner approval for exact version-5 upload and private
  internal-test activation, digest
  9e220cff5b4c58e780c07b3c82b6dd4254137d20d8c4d446d46a60f432ec8e46.
  DEP-044; same ten testers, no closed/public rollout, new build or paid change.
- [x] Retain fresh exact-app internal/Alpha/tester before-state and
  independently reverify existing Expo submission binding and artifact hash.
- [x] Upload the exact AAB once through official EAS Submit as internal/draft;
  terminal submission 590a091f-e851-4a93-a161-68c5a24917d9 is FINISHED. Google's
  normal original-file download for artifact 4860240074172382563 exactly matches
  the approved SHA-256; version 5/API 36/16-KB support are independently verified.
- [x] Confirm only the approved private internal release through normal
  Console controls after accepted-artifact and other-track preservation checks.
- [x] Independently verify version 5 available to the same ten internal testers,
  preserved Alpha draft/other tracks and signing; record scoped rollout evidence.
  Fresh reload verifies release 2 Available; Google's signed APK is package
  com.suqpage.app/version 5 with the existing certificate and verified Google
  source stamp. Alpha remains version 3 Draft; Expo credential metadata matches.
  Physical-phone alerts, blocked API direction, genuine testers and reviewed
  closed/public gates remain separate.
- [x] After the separately approved internal update is verified, add the owner's
  two newly supplied, spelling-confirmed Google accounts to the existing SuqPage
  tester list. Retain private ten-member before-state; verify twelve-member
  membership and unchanged internal/Alpha list selection. No emails or closed
  activation are implied; actual opt-ins and fourteen continuous days remain.
  Independent reload verifies the exact twelve-member union and both existing
  internal/Alpha list selections; other lists and Alpha's version-3 inactive
  draft/178 countries remain unchanged. No emails or opt-ins are claimed.
- [ ] Actual protected Play-phone workflows and OS notification proof remain
  required before production readiness; complete them within the owner-requested
  closed test below. S99.5's stopped API read is not replayed or claimed resolved.

### S99.11 — Start the owner-authorized private closed test (DEP-044)

The owner explicitly requests the closed test after the internal/closed
distinction is explained. Classify as one-time operations; source remains
3cfa577, already admitted version 5. Master sections 15/22 are affected. The
closed test becomes the real-phone verification stage; public release stays gated.

- [x] Record authorization and phase order; retain all twelve genuine addresses
  privately. No new build, fee, public release, invitation or stopped API replay.
- [x] Fresh exact-app/account Alpha/internal/production/open/setup/
  tester/country readback and private before-state; verify admitted version-5
  artifact and unchanged signer before any provider write.
- [x] Replace only Alpha's version-3 draft bundle with admitted version 5 through
  normal Console controls; inspect enabled preview/warnings and exact release.
  Existing English/Amharic notes/name are unchanged; the sole warning is the same
  optional missing deobfuscation file. Google confirms the change has been saved.
- [x] Confirm Alpha privately and inspect Google's complete review submission.
  Google saves version 5 and exposes sixteen scoped review changes; quick checks
  identify one missing Advertising ID declaration, not a binary/build failure.
- [x] Complete the discovered required Advertising ID declaration from
  actual APK/AAB permissions, compiled SDK/API and source evidence, retain the
  form before-state and verify the saved answer after reload. Sponsor display
  and notification/device tokens are not advertising-ID use.
  Actual AAB/APK manifests lack AD_ID; all seven DEX files lack Advertising ID,
  Google Mobile Ads/Firebase Analytics APIs, and mobile source/dependencies have
  no advertising-ID code. The factual No answer persists after independent reload.
- [x] Submit only the verified saved SuqPage review scope when Google's own quick
  checks enable its normal action;
  submit only the saved SuqPage declarations/listings and that closed release.
  The blocking issue is cleared; normal enabled submission and final confirmation
  are accepted. Fresh reload verifies Changes in review; Google's quick checks
  still run and no review approval or tester availability is inferred.
- [x] Independently reload Google's review/track state, preserved internal version
  5 and twelve-member access; obtain the actual joining link when available.
  Alpha version 5 is In review; internal 5 remains Available. All 178 country
  rows and tester/feedback fields match the protected before-state. The normal
  Console exposes https://play.google.com/apps/testing/com.suqpage.app, with actual
  availability unverified. Dashboard shows In review/production inactive/zero opt-ins.
- [x] Record scoped evidence and tester instructions. Keep actual Google approval,
  phone workflows/OS alerts, opt-ins and fourteen continuous days unclaimed until
  verified; no production/public availability is inferred from review submission.
  Private instructions include leaving internal testing before closed enrollment;
  no invitations are sent. Provider/evidence and documentation checks are below.
- [x] Verify final protected evidence, validate updated specs/traceability and
  prepare only the scoped release record, preserving the pre-existing deno.lock.
  Final protected operation assertions and 190-spec/traceability validation pass;
  create the task-scoped documentation commit after staged-scope/diff review and
  retain its actual hash/status in the private handoff and final report.
- [x] Final post-submission read detects Google's completed closed publication;
  retain the earlier In review receipts rather than rewriting their history.
  Independent Alpha reload verifies version 5 Available to selected testers.
  Record this later publication as a separate provider outcome after the submission
  record commit; verify preserved access/internal/production before its scoped commit.
- [ ] CURRENT external: actual protected-phone/OS-alert results and twelve genuine
  closed opt-ins for fourteen continuous days, then evidence-based production
  access and separately authorized public rollout. Availability is not enrollment.

### S100 — showroom narrative across web/mobile (October 15, 2026)

Classify as L1 platform-copy/localization work under FE-052/FE-049. Preserve S99.11
closed enrollment/phone testing dependencies above; no provider change, new build
or public rollout is implied. Baseline has only user-owned untracked deno.lock.

- [x] Inspect shared Market/About/map/account text, local dictionaries, narrative
  tests and prior capture harness; record exact owner lead/support and readiness
  in FE-052/FE-049 before code. Master sections 1/3/18/19/22 and storefront
  positioning are affected; prior layout approval does not cover new wording.
- [x] Update shared copy, relevant account entry and metadata, prepared
  listing/campaign source copy and all four non-English catalogs contextually.
  Further October 15 steering adds the social-post browsing problem to a concise
  headline and explains collections/options, listed availability and producer
  capacity/lead times. Keep these claims tied to existing descriptive states,
  merchant-written details and direct questions; no inventory or capacity feature.
- [x] Run focused narrative/localization/marketing tests and both typechecks;
  capture actual local desktop/390/320 web and Expo-browser views in all locales.
  Ten localization tests, 1,414 messages per translated catalog, both typechecks,
  narrative/marketing/category-artwork and homepage composition pass. Final
  refined-screens/copy-verification-all.json records 74 passing views with actual
  local catalog/markers, stubbed tiles and no uncaught JS/hydration errors. An
  earlier capture hit a page-load timeout; local sign-in returns 200 with visible
  content/no script errors. Explicit content/font/image/map readiness and preserving
  input caret styles avoid coupling review to external loads/hydration injection.
- [ ] CURRENT: show concrete affected layouts and wait for explicit visual approval under
  AGENTS.md step 8 before expensive full/release gates. Preserve old graphics and
  provider receipts; no device evidence is inferred from browser captures.
  The owner's reply refines the headline to explicitly include "digital"; it is
  a wording correction, not visual approval. Update that lead and its four
  contextual versions, refresh affected Market/metadata phone/desktop evidence
  and retain the previous 74-state receipt for unchanged About/account views.
  The explicit digital/online lead is now implemented and verified: 21 refreshed
  Market/metadata desktop/390/320 web and Expo-browser states pass in all five
  locales, alongside both typechecks, narrative/marketing and ten localization
  tests. Digital-lead/screens/copy-verification-all.json is the latest receipt;
  the original 74-state About/account evidence remains retained. Visual approval
  of this corrected candidate is still pending.
- [ ] After approval, run applicable full checks, reconcile current master/spec/
  traceability evidence, review scope and commit only task files. Keep deployed
  web/Play versions distinct and report the remaining rollout separately.

### S101 — research and rewrite unclear local-language UI (October 15, 2026)

The owner rejects the current translation quality. This extends the existing
uncommitted S100 task under FE-049/FE-052; no prior visual approval is implied.
The 22 existing task files match their protected handoff; deno.lock is unrelated.

- [x] Inspect current dictionaries/aliases, shared copy and capture fixtures;
  record meaning-first acceptance/readiness before code. Preserve English intent,
  merchant content, interpolation, workflow/security and existing release state.
- [x] Research primary localization references and real language usage
  for Amharic, Afaan Oromo, Somali and Tigrinya; record sources/decisions and audit
  catalog terms for literal phrasing, task ambiguity and inconsistent register.
- [x] Rewrite unclear narrative and public/owner/staff labels/help in shared
  dictionaries, plus matching prepared marketing source text where affected.
  Prefer a plain explanatory phrase to an unfamiliar coined translation.
  Research/decisions: locales/README.md. 138 shared rows revised plus one missing metric; prepared
  four-language campaign and existing Amharic store source are aligned.
  Screen review also corrected fixed inquiry nouns/count labels, the shared
  owner metric vocabulary, and three capitalized native status aliases.
- [x] Run focused semantic/localization and type checks; capture affected public,
  product/inquiry, owner and Expo-browser states in every locale, retaining actual
  content and fixture/OS limits. Correct evidence-backed issues before review.
- [ ] CURRENT: obtain explicit approval of the researched wording/layouts under AGENTS.md
  step 8, then run applicable full gates, review/commit the task scope and report
  rollout separately. No independent native-speaker review is claimed from research.

S101 focused evidence: twelve localization tests/1,418-key catalogs, both typechecks,
narrative/category/marketing, homepage composition, whitespace and 190-spec checks
pass. Final receipts under .local/language-research-s101/ cover 74 shared-copy,
40 web journey, 12 loaded native-owner and 16 native public states (142 total).
The inquiry/platform-noun and owner-metric/status leaks found in actual screens
are fixed and tested. Review: .local/language-research-s101/review.html. Canonical
Profile captures avoid an existing Next development redirect timing error;
error assertions remain intact. Hidden retained Expo screens/loading frames are
excluded by readiness checks. No production redirect/device/first-language review
is claimed. No provider, business save, chat/inquiry submission or Loadgistic write.

S99.10 deployment preparation: actual Linux archives, Android runtime privacy,
normal two-locale Console reload/CDN/provenance and 190-spec validation pass.
Netlify identity/runtime is independently verified. Prior local deployment
archives were temporary and are no longer present; the exact previous provider
deploy 6aca91cb2f49de22d3839199 is independently retained/ready, with its source
and published files. Rollback is an owner-reviewed republish of that immutable
snapshot, never an automatic restore or database downgrade. A fresh protected
schema-63 backup precedes upload. Expo Free admission is 15/30 builds, zero cost;
public targets/Firebase metadata and existing signer remain verified unchanged.


### S102 — independent discovery, country/city and safe demos (October 15, 2026)

Extends the authorized S100/S101 local work; its 29-file handoff matches before
editing. Preserve unrelated deno.lock and all earlier pending approvals. Do not
touch Loadgistic. FE-065/BE-054/DEP-045/ADR-0027 control this L2/L3 feature and any
later L4 rollout. Prior approvals do not cover its changed behavior/layouts.

- [x] Inspect discovery, native wire contracts, signup/place authority, demos and
  migration paths; record positive/negative contracts and Definition of Ready.
  Master §§3/5/7/10/11/15/18/19/22 and current summary are affected.
- [x] Add bounded country/city catalog, additive persistence and strict
  signup/owner validation; retain existing anchors and tenant/version checks.
- [x] Add independent typed business/product query/filter contracts, public-only
  country/city options, explicit empty activation, ranking/paging and API paths.
- [x] Build labeled live-search controls and sliding map/card views separately
  for web/mobile web and native; retain source-business links and descriptions.
- [x] Author changed text for all five languages and align source/copy tests.
- [x] Back up, admit and correct only local marked demo contacts/missing geography;
  preserve private sign-in aliases and real businesses. Provide protected role/
  workflow test accounts and local login-code instructions. Hosted work is pending.
- [x] Run isolated PostgreSQL/security/data-integrity and focused UI/type/locale
  checks; capture actual empty/typed/filter/switch/clear/error/signup states at
  desktop/phone widths in all languages. Correct failures before review.
- [ ] CURRENT: obtain explicit approval of actual changed layouts under AGENTS.md step 8.
- [ ] After approval run applicable full/release/acceptance gates, review exact
  task files and create scoped commit. Report remaining hosted/native rollout
  steps separately; no deployment, account reset or provider change is implied.

S102 focused evidence: real PostgreSQL exact/fuzzy scope, canonical country/city,
offering type, strict wire parameters, signup/owner isolation and replay checks;
existing signup/handle, business starter, place selection, staff boundary, all
six discovery-paging/search suites, six app-link tests, both typechecks and
1,440-key localization catalogs pass. Browser evidence includes 24 English
search/switch/filter states, 21 initial five-language viewport states, 40 localized
product/city-picker states and 10 real signed-in setup states. Updated focused
Playwright error/retry/clearing/keyboard tests and schema-63 migration guard,
rollback/preservation/replay rehearsals pass; full checks remain gated by actual visual approval.
Protected backup, local schema 64, 67-demo correction/preservation receipts,
local-only agent identities and TEST-ACCOUNTS.md are under .local/discovery-s102/.
No production deploy, native build, new dependency or Loadgistic change. Full
release must still verify city-data file tracing and exclusion from mobile bundles.

Final S102 focused receipts: schema-63 upgrade/guard rollback/custom-constraint/
private-user/GPS/replay rehearsal passes; blank/null exact-coordinate rejection
passes; all three focused browser tests pass (including two-city clearing and
out-of-order replies). Both typechecks, 12 localization tests and 194-spec checks
pass on the final source. Four actual local OTP sessions verify admin/owner/
support/transport web access, owner mobile access and staff/admin mobile denial.
Review .local/discovery-s102/review.html; actual visual approval remains pending.


### S103 — bounded initial browse, infinite products and paired panels (October 16, 2026)

Owner explicitly supersedes S102 empty starts and page buttons. Feature L2;
FE-065 / BE-054 / DEP-045 / FE-049 / FE-053. Extend the pending local S102 task;
preserve all existing edits and unrelated deno.lock. No publication is implied.
Definition of Ready: initial 200-marker/12-card bounds, deterministic existing SQL
paging, finite default cache, independent filters, failure/cancellation and
paired-panel behavior are explicit. Master §§5/10/19 change; deployed behavior
remains the prior release until separately approved rollout.

- [x] Inspect contracts and record updated acceptance, dependencies and limits.
- [x] Implement bounded initial SQL/default cache and cancellable append
  loading shared by web/native, preserving eligibility and independent searches.
- [x] Implement centered switch and opposing overlapping panels with visible
  edge handles, click/drag, keyboard, reduced motion and localizations.
- [x] Prove bounded default/count/paging/exclusion behavior with focused tests;
  capture web/mobile-browser desktop/phone, scrolling, filters and failures.
- [ ] CURRENT: obtain explicit approval of revised visual states (supersedes pending S102
  visual request); only then run full check/release/acceptance and scoped commit.
- [ ] Report evidence and remaining native-device/hosted rollout limits.

S103 focused evidence: isolated PostgreSQL proves 200/210 map bounds and totals,
12-card batches with complete stable 210-item traversal, default browsing and
public/privacy/country-city invariants. All six legacy discovery suites pass;
seven focused web browser scenarios cover initial results, live filters, scroll
append, position retention, retries, hidden-panel suppression, stale append
cancellation, centered switch, drag handles and reduced motion. Both typechecks,
1,444-key localization and 194-spec validation pass. Twenty-nine local web/Expo
browser captures cover all five locales and English 320/390/1440 plus actual
mobile scroll loading. Receipt: .local/discovery-s103/screens/evidence.json. No
native device, hosted mutation, full gates, commit, deployment or rebuild claimed.


### S104 — consistent public shell, owner dashboards and live chat audit (October 16, 2026)

Owner extends S103 with a grouped public sidebar, About/Privacy/Terms in the
same app shell, Login/Dashboard session labels, and a standard business dashboard
with clear workflows. FE-036 / FE-026 / FE-056 / FE-053 / FE-049 / FE-019 /
BE-018 / BE-050 control this L2 feature/defect work. Preserve pending S100–S103
changes, unrelated deno.lock and custom showroom identity. No hosted or Loadgistic
changes. Master §§3/5/11/15/19 and owner/staff navigation statements are affected.
Definition of Ready: desktop grouped rail and phone single navigation, exact
owner destinations, existing session/role boundaries, local test identities,
existing live polling/read contracts and route URLs are known; no new provider.

- [x] Inspect shell routes, owner/staff menus and chat update/permission contracts.
- [x] Update controlling specs, then implement one public shell and
  grouped Suqpage navigation; retain URLs/auth behavior and native shared menus.
- [x] Standardize owner Overview/Page/Products/Inquiries/Support/Settings entry,
  saved-return flows and dashboard metrics without fabricated activity.
- [x] Audit live support and transport with isolated domain tests and real local
  web/Expo-browser visitor/owner/staff exchanges; fix actual defects and retain
  assignment, privacy, read receipts, history/resolution and mobile staff denial.
- [ ] CURRENT: obtain visual approval after capturing desktop/phone/navigation/owner/chat states in
  five locales; obtain explicit approval of the revised visual candidate.
- [ ] Only after approval run full check/release/acceptance and scoped commit.
  Record native-device and hosted rollout limits separately.

S104 focused navigation evidence: both typechecks, 1,453-message localization,
194-spec validation, workspace/PWA/OSM contracts and two real public-shell browser
scenarios pass. Thirty anonymous five-language desktop/phone and 23 authenticated
owner/admin/Expo states pass; four final Market/product states show combined S103/
S104 UI. Actual owner route/active-state/edit-return and role-home checks pass.
Support and attention/read-receipt suites pass on schema 64; no provider push is
sent. The owner web/native chat phase and isolated web/native transport audit
pass; a final combined stable-source run is in progress. Do not infer completion
from earlier development runs: one development run was interrupted during mobile session validation while
app source was changing; selectors/schema fixtures needed updating, and screenshot caret hiding caused a
harness-only hydration mismatch. Their final focused reruns pass.

Final S104 combined real-HTTP chat audit passes: staff creation/scoping and
web-only/mobile denial, owner intake/claim/web-native replies, two-way attachments,
foreign-owner file/case denial, reassignment/revocation, closed web auto-reopen,
transport on both clients, private carrier notes, lost-ack exactly-once retry,
capacity rejection, end/history/contact retention, resolution and reopen. Final
receipt: .local/navigation-s104/final-chat/verified.json (scope full, no canned
success responses, no production chats touched). The repeated-run local anti-spam
limit was correctly enforced; the final audit isolates disposable visitor address
hints rather than changing limits. All test-created records/assets are cleaned up.
Layouts: .local/navigation-s104/review.html (57 states plus final chat screens).
Actual visual approval, full gates, scoped commit and rollout remain pending.


### S105 — social-only business contact and inclusive showroom copy (October 16, 2026)

Feature/security compatibility, L2, controlled by FE-066 / BE-055 and their
reciprocal dependencies. Latest owner correction explicitly retains public
transport live chat and private owner support. Remove only Suqpage business
inbox submission, primary inbox navigation and new-inquiry metrics. Preserve
existing history privately; no data deletion. Social handoffs copy a simple
localized message with literal selected items and canonical product links.
Master current product summary and §§3/5/7/10/11/15/18/19/22 are affected.
Definition of Ready is recorded in FE-066/BE-055; all material choices resolved.
Pending S100–S104 work is extended, not discarded; unrelated deno.lock untouched.

- [x] Inspect correction, UI/API entry points, existing contact validation and
  clipboard/open adapters; confirm no transport/support removal happened.
- [x] Update specs before code and reserve FE-066 / BE-055 with reciprocal links.
- [x] Retire only business-inbox submission on web/native; keep protected
  history and transport/support; simplify dashboard navigation/metrics.
- [x] Implement localized, copy-before-open social handoffs with manual fallback,
  native/web failure handling and literal product details; align inclusive copy.
- [x] Run focused domain/HTTP/security/localization/type/browser checks and capture
  desktop/phone states; record actual remaining device/provider limitations.
- [ ] CURRENT: obtain explicit approval of this revised visual candidate under AGENTS step8.
- [ ] After approval only: full check/release/acceptance, scoped review/commit.
  Production rollout and replacement Android build require their own workflow.


S105 focused evidence passes: both typechecks; 1,474-key/five-language catalogs;
196 validated specs/ADRs; product/message/contact-readiness unit tests, retired web/
native adapter tests and denied/false/throwing browser clipboard regressions;
real PostgreSQL native API and first-publication isolation/atomicity tests;
unchanged live transport assignment/reply/capacity/private-note/history/reopen
suite; PWA/narrative/prepared-store-copy contracts. Final stable-source browser
run passes 32 contact/dashboard/empty/demo/failure states with no page errors;
74 Market/About/Login desktop/phone/native-browser language states also pass.
Receipts: .local/social-contact-s105/screens/evidence.json and copy-screens/.
No real social messages, production records or hosted configuration were touched.
The Expo browser fallback's false-positive legacy clipboard result was fixed with
one shared browser adapter; temporary copy fields are always cleaned up. Test
fixture numeric-ID/cleanup and draft/publication mismatches were corrected in the
harness. A transient edit-time client-directive error is fixed; final stable
source passes. All disposable test identities/records were cleaned up.
Visual approval/full gates/commit and web/API/native rollout remain pending.


### S106 — restore existing contacts; remove only the Suqpage business inbox

Owner explicitly rejects S105's extra contact/editor/publication restrictions.
This L2 defect correction retains FE-066/BE-055 retirement of business inbox
submission/navigation and restores the prior full public contact setup (including
WhatsApp and all existing social fields). Public contact links and first-publication
eligibility retain their previous behavior. Social-account activation must copy
current selections automatically; manual copy is an optional secondary action.
Transport chat/private owner support and all unrelated S100–S104 work remain.
Master contact/editor/publication statements and FE-040/BE-032 are affected.
Definition of Ready: correction is explicit, contact values remain stored, old
publicContactFields/publicContactLinks contracts are available, and the reported
local URL is known. No schema/data/provider change is needed.

- [x] Record dirty state, retain S105 source before-images and inspect reported
  helper error plus existing setup/handoff contracts.
- [x] Revise FE-066/BE-055 contracts before code; preserve earlier pending work.
- [x] Restore original contact fields/links and publication readiness;
  remove introduced runtime helper dependency without suppressing failures.
- [x] Verify social activation copies current products/localized message, keeps
  configured destinations primary, and keeps manual copy as a secondary choice.
- [x] Reproduce reported product URL online/offline; inspect/restart only local
  Suqpage preview as needed; report any residual environment/network limits.
- [x] Run focused domain/API/type/browser checks and desktop/phone captures.
- [ ] CURRENT: visual approval then full gates/commit follow AGENTS step8; no rollout yet.


S106 focused evidence: the exact reported product URL returns 200 and renders
without the missing-helper error in a fresh browser. A loaded page remains usable
for product-message copy during network loss and reloads after reconnection;
this is not a cold-start offline guarantee. Production renderers no longer depend
on the newly introduced socialContactLinks export. All eight original web/native
contact fields and original publication eligibility are restored. Social links
copy selections automatically on the first tap, before any manual-copy action;
the manual action is separate. Selected-cart footer copying is also verified.
Existing Call/email/website links preserve their original destinations.
32 five-language web/Expo workflow states pass; a final 18-state targeted audit
passes native owner login → Page → Edit → all contact fields, cart-footer auto-copy,
visible disabled demo choices, manual-copy and failure paths. Fake destinations
are never contacted. All disposable identities/data are cleaned up.
Both typechecks, message/retired-adapter/clipboard tests, localization and
publication/contact isolation/atomicity checks pass. Review/evidence:
.local/contact-repair-s106/review.html, screens/evidence.json,
final-screens/evidence.json, offline-evidence.json. No hosted mutation, deployment,
Android build, full gate or commit. Earlier S105 evidence is superseded wherever
it described removed contact fields or changed first-publication eligibility.

### S107 — local role/workflow audit and usable test-account guide

Owner requests a systematic UI/UX, backend and security audit of visitor,
new-business, existing owner, administrator, support-agent and transport-agent
flows on desktop web, phone web and native Android. Defect/security review, L2
unless an actual finding changes that classification. Existing FE_BASE/BE_BASE,
FE-026/036/040/049/053/056/059/062/065/066 and BE-018/032/044/047/050/054/055
control the audit; update specific acceptance criteria before each behavior fix.
Preserve pending S100–S106 work and user-owned deno.lock. No production,
Google Play, external social message or hosted account mutation is authorized.

Definition of Ready: role boundaries, local targets and account directory are
known. User authorizes starting the existing Android emulator for native checks.
Inventory supported routes/actions and record actual coverage and limits rather
than claiming all theoretical states. Master §§8–11/13/16/19/21/22 are affected
only if findings change verified current behavior.

- [x] Inventory screens/actions, controlling specs, local identities,
  server health and Android readiness; retain source baseline.
  Evidence: protected S107 source-before/verified-accounts/native receipts.
  Native readiness is a recorded infrastructure limitation, not a passed workflow.
- [x] Create a protected role-by-role guide with exact verified local emails,
  URLs, login-code instructions and ordered scenarios. Keep public documentation
  free of private account directories/passwords/codes.
  Evidence: `.local/workflow-audit-s107/verified-accounts.json` and
  `TEST-GUIDE.html`; public demo-access documentation links the current guide.
- [x] Complete the read-only route/screen walk for visitor discovery/Featured/
  showroom/social/legal/login/signup and owner preview/edit/publish/product/
  media/location/account destinations; inspect loading, empty, retry, navigation
  and accessibility states.
  Read-only route coverage: 187 actual states (168 web, 19 Expo browser); owner
  persistence and retry flows separately pass eight checks. Route coverage is not
  every mutation workflow. Broad axe excludes contrast; 22 final 320px states and
  dedicated recovery checks include it. The unchanged logotype exception is
  recorded with the raw finding; body/control contrast rules are not disabled.
- [x] Complete focused first-Publish and paired support mutation captures.
  First-Publish proves web private preview/readiness and five-language Expo
  confirmation, stale/failure retention, real publication and live projection.
  Owner/support and transport complete actual behavior assertions; strict combined
  browser gates retain only the known Next development timing exceptions.
  Current signup form submission remains part of the post-approval full acceptance
  gate; focused canonical signup API/persistence and screen checks already pass.
- [x] Exercise admin/staff creation, role/tenant denial, owner support and guest
  transport end-to-end, including assignment, read/reply, attachments, history,
  resolution/reopen and private-note isolation with disposable records.
  S107 transport/frozen-support/attention receipts record exact-once writes,
  decoded attachment bytes, forbidden tenant/file access and retained callback
  history. Dedicated attention capture passes ten peer read-cursor confirmations,
  assignment versus join, hidden/covered unread, independent alert acknowledgement,
  sound dedup/mute and five-language states with zero browser exceptions. All
  disposable records are reconciled to zero; physical OS push is not claimed.
- [ ] CURRENT: test current local source in native Android; distinguish native from Expo
  browser coverage. Clean up disposable accounts/assets. An old production APK
  cannot stand in for current local-source evidence.
  Final bounded attempt after stopping task-owned Gradle/Kotlin daemons still
  encounters Android System UI/launcher/system-service ANRs. Emulator stopped;
  no new final-attempt identity/media was created. Earlier unused native fixture
  is removed. Actual native signup/edit/picker/map/chat workflows remain
  unverified; the protected post-gradle receipt records the exact OS evidence.
- [x] Record findings, update controlling specs, fix reproduced defects and add
  focused regression/persistence/security tests.
  Final focused aggregate passes 23 tests, both typechecks, 196-spec validation,
  localization, narrative and auth-runtime. The documented Next development
  instrumentation error remains unsuppressed pending full production-mode checks.
- S107 admitted findings: native business city/category errors were not rendered;
  compact filters/search-clear were below the existing 44-unit touch contract;
  real local DB/Auth timeouts exposed missing route/root recovery boundaries.
  FE-056 / FE-065 / FE_BASE now define focused regressions before implementation.
  Earlier empty/loading captures are diagnostic evidence, not passed screen walks.
  Missing-business workspace routes also rendered blank; FE-026 now returns each
  role to its authorized home without selecting a tenant. BE-054/FE-065 correct
  the remaining admin Ethiopia-only GPS restriction to worldwide finite bounds;
  isolated PostgreSQL regression includes invalid inputs and stale proposal denial.
  Notification capture is reconciled with BE-055: retired business inquiry POST
  must return 410 without a new row/alert, while live support/transport stays active.
  FE-056 also corrects rejected business/handle save promises: localized retry,
  retained fields, pending/loading feedback and duplicate-submit guard, while
  preserving Next redirect control flow and backend version authority. Actual
  web/Expo owner cover/account/location/editor captures now pass, including real
  saved/re-entered values and disposable-fixture cleanup.
  FE-053/BE-044 correct mobile transport recovery-storage rejection and unbounded
  Auth HTTP calls. Storage failure stops loading and blocks intake until Retry
  determines the saved session. Auth transport/body calls have a 20-second bound,
  caller cancellation and a bounded response; SDK session/refresh policy remains.
  Actual component and installed SDK port tests pass; these are not native OS tests.
  Local logout failure now immediately fences private state/requests, exposes Retry
  across editor unmounts and blocks new authentication until cleanup succeeds.
  Installed-SDK regression proves the deprecated custom processLock's secondary
  unhandled promise; default SDK coordination removes that defect. Twenty actual
  storage/logout browser states across five languages pass with no runtime errors.
- October 16 owner explicitly requests multi-agent work: native agent owns ADB;
  web agent owns route/layout audit and the admin coordinate correction; chat/owner
  agent owns paired live-workflow captures. Root coordinates shared files, specs,
  focused checks and the guide. Browser workloads pause while the native emulator
  recovers from system-wide ANRs; no app pass is inferred from an APK build.
- [x] Capture affected desktop/phone states and provide guide/evidence in the
  protected S107 REVIEW.html and TEST-GUIDE.html. Native coverage remains separate.
- [ ] Obtain actual visual approval under AGENTS step8 before expensive full/release/
  container/remote gates; earlier pending approvals remain pending.
- [ ] After approval, run applicable full gates and review/scoped commit; report
  unresolved device/provider limits and rollout separately.


### S108 — balanced unlimited staff routing and assignment mismatch (active)

Classification: L2 feature plus assignment-state defect; local-only. Dependencies:
BE-018, FE-019, FE-026, existing BE-050 attention and S107 unfinished visual gate.
Newest owner instruction removes the cap even beyond 100 chats. Definition of
Ready is satisfied by S108 scenarios; no unresolved routing fields/providers.

- [x] Inspect local reported reference metadata without reading contacts/messages;
  it is waiting, never assigned in local history. Root cause of the visitor's
  different display is not yet proven. Preserve the customer's case unchanged.
- [x] Research official routing docs; record queue/receiving/workload/last-assigned
  order, paused ownership, no cap and availability-triggered FIFO recovery in specs.
- [x] Implement BE-018 routing/settings/security and mapped isolated-PG
  tests; separately fix reproduced delayed-response/picker state under FE-019.
- [x] Update staff UI and all locale text; focused web/mobile typechecks and tests.
- [x] Capture paired local visitor/staff reference agreement and responsive workload
  states using disposable fixtures; document cleanup and test accounts/guide.
- [x] Reconcile master staff/public support sections, traceability and operations.
- [ ] Obtain explicit visual approval including pending S107 before expensive full
  gates. No hosted mutations, customer-case modifications or new release authorized.
- [ ] After approval, applicable full gates and reviewed task-isolated commit.


### S109 — task-oriented dashboard and spacious mobile exploration (focused tested; review pending)

Newest owner request extends S107 audit: reorganize admin/business/staff work by
business and task, eliminate scattered business data and permanently open edit
forms and accordion workflow dumps (owner screenshot confirms staff creation);
  simplify cramped exploration headers, controls, panel reveal and gestures
on mobile/native and responsive web. This follows S108 routing verification; it
does not cancel unfinished S100–S108 or the existing visual approval gate.

- [x] Research primary design-system navigation, list/detail,
  deliberate edit surfaces, app bars, accessible touch/gesture/system-edge rules;
  identify actual screens/permissions and capture before phone/desktop states.
- [x] Write mapped acceptance criteria in FE-026/FE-065/FE-053 and affected backend
  specs if APIs change; reconcile master sections before implementation. Preserve
  role/tenant scope, exact saved data and public map/product search independence.
- [x] Implement coherent business workspace and deliberate read/edit navigation,
  preserving direct links/back/save/cancel/error/unsaved states and scoped queries.
- [x] Simplify compact exploration hierarchy, keep visible map/product alternatives
  and labeled controls; bounded peeks, 48px touch areas and accessible switch in
  addition to gestures. Native gestures must not steal map pans/list scrolls.
  Latest owner correction: Products starts on the right; drag left over Businesses,
  then map handle on left drags right to return. Apply and recapture web/native.
- [x] Test actual role workflows, keyboard/mobile/5-locale overflow and data/API
  security; capture focused states. Evidence: S109 admin36+28, workload20, owner50,
  web40 and Expo40 states, mapped component/isolated-PG tests in traceability.
- [ ] Obtain explicit visual approval before expensive full gates.
- [x] Update testing guide/traceability/operations and report native-device limits.
- [ ] Perform a separately authorized reviewed rollout only after all required gates.


### S110 — Account gateway with focused owner management screens (active)

Latest owner request: public Login becomes Account after sign-in; showroom,
business and private settings belong under that gateway, with a compact task hub
and distinct management screens instead of a long scroll/accordion page.

- [x] Read current web/native owner hub, private settings and navigation; reuse
  already researched task/list-detail patterns and existing owner APIs. Record
  FE-056 S110 acceptance before code; no auth/provider/data-model decision changes.
- [x] Implement compact five-destination Account hub (expanded to six in S114) and dedicated Your
  page menu on web/native; split native private settings/edit/notifications views.
- [x] Update public signed-in labels, Back destinations and authored locale copy;
  preserve signup/private preview/publication and existing permission boundaries.
- [x] Focused destination/failure/logout/privacy tests and actual five-language
  phone/desktop/Expo navigation captures; updated guide and traceability. Web38,
  Expo75 plus ten loaded-editor states pass; component/role/opt-in/logout tests pass.
  Guide: .local/workflow-audit-s110/TEST-GUIDE.html. No installed-device claim.
- [ ] Obtain visual approval including S107–S109 before expensive full gates,
  scoped commit or a separately authorized release. Earlier work stays active.


### S111 — durable chat inactivity and reachable public transport help (active)

Latest request adds safe, efficient automatic ending of inactive chats and public
transport help on public screens except account/setup; authenticated owners use
Account → Support. S107–S110 visual approval/full gates remain pending.

Later S114 adds the owner's separate Account → Transport chat destination while
retaining this Support destination. The S111 record is not an instruction to
remove the newer owner transport workflow.

- [x] Research official inactivity/lifecycle guidance and inspect existing
  support status/history, polling, PostgreSQL indexes and scheduled worker. Choose
  explicit eligibility, warning, end and resume rules; distinguish waiting for the
  customer from unanswered customer requests and manual resolution.
- [x] Record ready acceptance/security/infrastructure contracts in BE-018/FE-019,
  FE-036/FE-053/FE-056 and operations/deployment specs before code.
- [x] Implement bounded server-authoritative maintenance with durable history,
  concurrency/idempotency and controlled failures; no browser timer DB authority.
- [x] Add shared public launcher placement without duplicate controls or covering
  map/product controls; owner support remains prominent in Account.
- [x] Focused isolated-PostgreSQL lifecycle/security/race tests, timer/visibility
  client tests and actual local web/Expo states in all five languages. Six backend
  suites and eight chat UI/transition regressions pass; actual paired47 states,
  completed launcher50+25+4 states and protected-row reconciliation are recorded.
  Additive local migration65 preserves all counts and the original waiting case.
  Original dev-timing and harness failures remain separately classified. Final
  serial aggregate passes 58/58, both typechecks pass, localization passes 12/12,
  and 196 specs/ADRs validate. Eight settled themed web warning/ended states and
  the stale-owner-poll regression pass; original failure logs remain preserved.
- [x] Update master/traceability/test guide with actual evidence, recurring guarded
  local-worker command, timing/lock limits and deployment separation.
  After fixture cleanup, the 60-second local worker is running (first sweep ended
  zero); web3102, Expo8082 and Mailpit54324 are reachable. Final local receipt:
  .local/workflow-audit-s111/final-local-review.json.
- [ ] CURRENT obtain explicit visual approval before expensive full/release gates.
  No hosted migration, commit, remote check or rollout is authorized by this audit.

### S112 — products only, with ready and custom-order choices (active)

Latest request removes service listings/type filters from web, phone web and
native. Workshops/manufacturers still list physical products and choose ready or
made to order. Support/transport chat stays intact; S107–S111 pending gates remain.

- [x] Inspect current kinds, owner save, discovery, native projections, starter and
  demo semantics; confirm FE-067/BE-056/DEP-046 Definition of Ready before code.
- [x] Implement canonical product-only writes/reads, compatible history,
  Made-to-order toggle, typed projections/cache and regression tests (BE-056).
- [x] Update web/native product editors, cards, Account/Market and all five
  languages/public/About/prepared launch copy (FE-067); preserve social handoff.
- [x] Audit maintained demo/starter sources and make reviewed one-time local demo
  correction with protected before-images/invariants (DEP-046); no hosted write.
- [x] Focused PostgreSQL/API/component/type/localization checks and actual
  desktop/phone/Expo create/edit/search/toggle/showroom captures; update docs.
  Capture also reproduced a delayed Leaflet resize callback reading a destroyed
  map after navigation; fix the narrow FE-053 lifecycle defect and regress it
  without suppressing runtime errors, then recapture affected native routes.
  Final screenshot review found the new custom chip clipped; keep all four
  filters in one wrapping balanced-cell phone row and global Clear by Search,
  then verify full label bounds/48px targets in five languages on web/Expo.
  Evidence:69/69 focused UI aggregate; final2 web/9 native refinement tests;
  both typechecks, localization13/13 and199 specs/ADRs pass. Real web48 public
  +8 owner +10 final filter states; Expo47 completed segments +12 final filter
  states. Original failures and bounded supplements remain explicitly recorded.
  Review: .local/product-only-s112/review.html; Android device checks pending.
- [ ] CURRENT obtain explicit visual approval including earlier candidates before
  full check/release/acceptance gates. No deployment or new binary is authorized here.


### S113 — floating saved inquiry list and labeled transport chat (active)

Latest request: a counted floating list after Add, distinct direct inquiry, and
compact clear transport access on desktop/phone web and native. Earlier pending
visual/full/release gates remain pending; this request adds no deployment.

- [x] Inspect saved/direct state and existing public placement; record ready
  FE-041/FE-036/FE-053 acceptance, localization/accessibility and tenant safeguards.
  UI-only; no API/DB/provider/native durable storage change is needed. Master
  §§8–9,13,18–19 and local S111/S112 reachability are affected.
- [x] Implement one coordinated public floating stack, counted saved-list
  access, one-tap labeled transport entry and shop hydration protection.
- [x] Focused actual-component direct/group/count/restore/privacy tests; actual
  web desktop/320/390/short and Expo-browser five-language captures with no sends.
  Evidence: six web scenarios across preserved focused runs, final eight native
  dock/Market cases, root placement and existing selection/clipboard regressions;
  105 current unique layout states, localization14/14 and 1548 keys. Two historical
  English short-showroom screenshots are explicitly superseded. Normal recovery
  initially flashed Retry; FE-036 now requires real pending loading, and the
  deferred-fetch regression proves loading/failure/retry with all drafts retained.
  Both typechecks, narrative and 199 spec/ADR validation pass; installed Android
  remains unverified. No chat request, external message or production write occurred.
- [x] Update master/traceability/local review and testing guide with actual evidence.
  Review: .local/floating-actions-s113/review.html; combined receipts distinguish
  component ports, actual browser reads and earlier incomplete harness attempts.
- [ ] CURRENT obtain explicit visual approval including earlier candidates before expensive
  full check/release/acceptance gates or any separately authorized rollout.


### S114 — business owners can arrange transport from Account (active)

Newest request adds the visitor-equivalent transport form/chat for businesses.
It is account-owned and separate from technical Support; earlier S107–S113
visual/full/release gates remain pending. No deployment is newly authorized.

- [x] Inspect owner/public transport, routing/notes/receipts/attention, Account hubs
  and five-language copy. Confirm BE-018/FE-019/FE-053/FE-056 Definition of Ready;
  no schema/provider change needed. Identify master §§5,12–13,15–19,21–22 effects.
- [x] Implement tenant-owned transport creation/history and shared typed
  authenticated adapters; tighten private-note/attachment/replay/end boundaries.
  Evidence: S114 isolated PostgreSQL/web/native adapter regression passes;
  inherited routing/inactivity regressions pass in isolated fixtures.
- [x] Add distinct owner Account/nav destination and reuse the visitor's paired
  intake/conversation on web/phone/native with contextual native-language copy.
  Evidence: owner Account hub four tests; shared workspace focused React tests,
  six new native-authored keys, localization 15/15 with 1554 catalog entries.
- [x] Focused isolated PostgreSQL/API/security/component/type/localization tests;
  actual local owner/staff workflows and desktop/phone/five-language captures.
  Evidence: `owner-transport-s114/combined-verified.json` (60 current states,
  ten real navigation workflows); `paired/verified.json` (four actual web/Expo/
  staff workflow groups, eight screenshots and exact cleanup). Raw paired guard
  failure remains preserved: a blocked Next dev read-only source-map lookup,
  independently classified; no unexpected application write was discarded.
- [x] Reconcile master/spec/traceability/operations/test guide with actual evidence.
  Final typecheck, localization 15/15, 1554-key catalog and 199-spec validation
  pass. Normal local web and maintenance worker restored after the quiet test.
- [ ] CURRENT obtain visual approval including earlier candidates before full/release/
  acceptance gates, commit or a separately authorized release/new Android binary.

### S115 — finish the business management structure (active)

Newest review rejects the remaining child-screen chaos/management accordions;
S114 and earlier visual/full gates remain pending and are not approved by this
correction. Classification: L1 structural UI plus L2 focused-settings integrity.

- [x] Inspect actual routes/components and existing captures with three parallel
  audits; confirm FE-026/FE-056/FE-053/BE-032 readiness and master §§5,13,15,18–19,
  21–22 effects. Preserve dirty baseline and all business/contact/chat data.
- [x] Compact admin business overview and complete contextual navigation;
  make category management read-first with dedicated Add/Edit; remove management
  accordions without replacing them with another all-fields dump.
  Evidence: record/workspace/settings SSR/action tests, deliberate category
  confirmation and dedicated staff Assignment history; no management details/summary.
- [x] Split privileged settings into actual identity/live/sharing tasks and Access;
  retain sponsor/business context; preserve omitted canonical fields atomically.
  Evidence: isolated settings version/preservation/forgery/race/audit rollback suite;
  scoped sponsor/action return tests. BE-033 adds fresh role/queue category denial
  with retained assignments, tested in a disposable schema.
- [x] Split owner Your page into grouped focused tasks on web/native, preserve
  preview/color/publication/contact data and meaningful bounded return paths;
  simplify private account edit states and remove duplicate handle controls.
  Evidence: actual owner React/native controllers, all social fields, task switches,
  failed saves, Keep/Discard and readiness routing. BE-044 native Team editing
  delegates to existing versioned consent authority; isolated API checks pass.
- [x] Focused data-integrity/security/component/type/localization checks and actual
  role-aware desktop/phone/five-language read/edit/cancel navigation captures.
  Evidence:53 unique focused cases, isolated settings/category/mobile API tests,
  final web/native types, localization16/16(1568keys),199spec validation;
  workspace-structure-s115/combined-verified.json has156currentstates/15flows,
  zero runtime/console/API/write errors and unchanged application metadata.
- [x] Reconcile master/spec/traceability/test guide; provide concrete local review.
  Evidence: workspace-structure-s115/review.html, updated protected TEST-GUIDE,
  master §§5,13,15,18–19,21–22 and S115 TRACEABILITY. Worker restored after capture;
  first sweep ended zero cases. Preserve original failures/superseded screenshots.
- [ ] CURRENT obtain explicit visual approval before expensive full/release/acceptance
  gates, commit or separately authorized deployment/new Android binary.

### S116 — retain every request and assign parallel workstreams (tracking established)

Operations/documentation, L0. New requests extend the active backlog; root remains
accountable for every open requirement and each agent's integration. This changes
tracking and stale guidance only, not product behavior or approval gates.

- [x] Record the dirty baseline; preserve all application/data/release work and
  existing visual approval dependencies. Read AGENTS/spec workflow and S115 handoff.
- [x] Reconcile all workstreams with three independent agent audits;
  distinguish true unfinished work, completed baseline and explicit supersessions.
  Evidence: owner/admin, transport/security/release and public/locale/marketing
  audits identify current-source Android/OS proof, refreshed marketing assets,
  exact hosted demo operations and stale acceptance journeys as real remaining work.
- [x] Publish current ownership/next-dependency states; correct stale operational,
  account-test and Play-readiness guidance without repeating provider operations.
  Evidence: current work board, reconciled SUPPORT-AND-TRANSPORT/Play READINESS,
  protected test guide, current FE-065/BE-054/DEP-045 clauses and master §§8/9/24.
  Last verified provider outcomes remain dated; current enrollment is unverified.
- Retained implementation constraints include the official Ethiopia evening
  Featured schedule, automatic sponsor rotation, supported embedded videos,
  App Links/in-app link handling, logo-matched accents and preview-first setup.
  Earlier released evidence remains valid for its exact version; replacement
  native verification is still required for the current candidate.
- [x] Update stale focused/acceptance test journeys identified by the audit while
  preserving security/persistence assertions; run only appropriate focused checks.
  Running the full acceptance suite still requires the recorded visual approval.
  Evidence: workflow-retention-s116/harness-static-verified.json; four syntax
  checks, ten journey checks, 26 retained assertion checks and 32 focused tests.
  Typecheck and collection-only discovery of20 acceptance cases pass; no browser,
  database, full acceptance or release was executed by this preparation.
- [x] Validate the retained task inventory/spec links and report remaining gates
  without labeling implemented/tested work as deployed or abandoning earlier items.
  Evidence:199-spec validation, narrative/launch static checks and scoped whitespace.
  The existing Node module-type warning remains visible, not suppressed. No app
  behavior, provider, signing, schema, build or hosted data change in S116.
  Underlying review/native/OS/artwork/hosted-demo/full-release tasks remain open
  with owners above. A new request will not erase or silently close them.

### S117 — remember Businesses or Products after returning (active)

Defect, L1; FE-065/FE-053. Earlier workstreams and approval gates remain open.
Only public navigation memory changes; no data migration, provider or build.

- [x] Inspect current state/history/links and record dirty baseline. Three agents
  identified bare Market return resetting view/criteria, Featured sharing the
  source-return key and native Back running in a background tab. Confirm Ready;
  affected master §§5,10,19,22 and compact exploration statement recorded in FE-065.
- [x] Implement bounded session-only remembered Market state on web/native,
  explicit link/history precedence and focus-scoped native Back. Preserve scoped
  filters, feed/camera contracts, framework history and Featured source returns.
  Focused implementation/tests pass; actual navigation exposed an existing
  Leaflet teardown race on map→showroom departure. Fix owned timer/listener
  cleanup and prove queued old callbacks cannot touch a destroyed/new map.
  Preserve original attempt-2 failure evidence; no marker/cluster/style change.
  Actual web navigation assertions pass; post-fix departure checks also prove
  safe animated-zoom destruction. Native explicit map action exposed Expo's
  transitional popstate racing restored route parameters; removing the competing
  raw listener and protecting the outgoing URL fixes actual repeated intents and
  genuine Back/Forward. Native MapLibre, marker appearance and clusters unchanged.
- [x] Run focused pure/component/type/navigation regressions and actual anonymous
  desktop/phone/Expo return journeys; capture restored states. Classify stale
  test contracts explicitly; no broad acceptance or release gate before approval.
  Evidence:27/27 focused cases, both TypeScript checks; 26 retained web navigation
  assertions plus five clean final SDK departures, and16 final current Expo
  journeys with zero runtime/console/API failures. Earlier strict failed runs
  remain preserved; source continuity and controlled resource limits are explicit.
- [x] Reconcile current master/spec/traceability/work board with verified evidence;
  provide local URLs and exact native limitations. Full gates, scoped commit,
  provider operations and deployment remain separate and unapproved.
  Evidence: S117 TRACEABILITY, master §§5,10,19,22, focused test log and protected
  `.local/market-return-s117/` receipts/screens. No application data or credentials
  were changed; normal GET rate/cache bookkeeping is not a business mutation.
- [ ] CURRENT inherited visual approval/full/release/acceptance gates, reviewed
  scoped commit and separately authorized delivery/current Android verification.
  This navigation fix does not close or replace any earlier workstream.

### S118 — working contact choices, per-business lists and familiar staff tasks (active)

Defect/feature UX, L1 plus L2 native local selection persistence. FE-066/FE-041/
FE-053/FE-026 control; BE-055/DEP-045 demo safety and BE-032/033 roles remain.
Earlier workstreams, S117 and inherited review/full gates remain open.

- [x] Record dirty baseline, inspect controlling contracts and confirm Ready.
  Tena initially has fake WhatsApp/SMS and no Telegram. The owner subsequently
  approves +19528552202 for all marked demos' SMS/WhatsApp/Telegram only; never
  change real/private contacts or launch residual fake destinations. Research primary dashboard/link patterns.
  Affected master §§5,8–9,13,15,18–19,22 and S113 selection statement identified.
- [x] structure_patterns: approved owned demo/real automatic
  handoff regressions; owner_structure_audit: business-local floating actions,
  independent persisted native lists/fresh catalog/error handling and web fallback
  removal. Source frozen; server-derived selective approval, three inbox methods,
  seven approved example destinations and separate per-business persistence pass.
- [x] admin_structure_audit: consistent business/staff list/task labels, active
  local nav visibility, contextual record actions and direct focused staff tasks.
  Carbon/Ant primary patterns inform contextual actions and deliberate editors.
  Sixteen focused cases and twelve actual states/three journeys pass; no saves.
- [x] Apply the two separately protected, exact local demo operations: owned phone
  and four public profile/site examples. Each admits all67 marked demo identities,
  rehearses rollback, preserves private/real data and immutable history, and proves
  actual replay is a no-op. Only local nonsecret demo-phone configuration changes.
- [x] Focused persistence/security/component/type/locale tests, actual local
  desktop/phone/Expo A/B cart/contact and staff task navigation/screens. No external
  messages, hosted data or destructive fixture operation. Preserve raw failures.
  Evidence:92 focused cases,26 post-warning-fix cases, both TypeScript checks,
  localization17/17(1574keys) and199specs. Three actual public surfaces/six screens
  pass; intercepted analytics navigation cancellations have a separate exact
  classification receipt. Installed Android/SMS OS delivery is not claimed.
- [x] Reconcile master/spec/traceability/work board and provide concrete visual
  review: `.local/contact-workspace-s118/review.html` and combined verification.
- [ ] CURRENT obtain explicit approval under AGENTS.md step8 before full/release/
  acceptance, scoped commit or separately authorized rollout/new Android artifact.

S118 later contact clarification: inbox choices are only SMS, Telegram and WhatsApp;
TikTok/Instagram/Facebook remain normal header/footer profile links. Root owns the
backed-up exact local demo operation and nonsecret local startup setting; server
projection derives per-method approval without hardcoding the number. Prepare any
hosted correction/configuration for later exact review, not an implicit rollout.
Later demo-profile instruction adds official platform profile examples (TikTok
`tiktok`, Instagram `instagram`, Facebook `facebookapp`) plus `example.com` to all
marked demos. Keep these outside inbox choices and apply under a separate exact
local before-image/rehearsal/preservation plan; preserve phone and earlier receipts.

### S119 — actual Chrome chat reliability and admin usability (active)

Defect investigation, L2 application/state integrity plus local operations; no
hosted action or broad redesign is authorized by this audit. Earlier unfinished
work and visual/release gates remain open. BE-018/BE-050/FE-019/FE-026/FE-062
control. Master §§13,15,19,22 and local inactivity/current-workflow statements
must be reconciled with observed evidence. Diagnose before changing contracts.

- [x] Record current dirty baseline; assign routing, lifecycle and receipt audits.
  Read controlling ready contracts and use labelled local tests, existing scoped
  test accounts and no customer-case writes. Chrome checks remain local only.
- [x] Inspect actual Chrome/admin/visitor behavior and local process/data
  health; distinguish new versus restored waiting cases, receives-new-chat settings,
  configured inactivity policy and visible-message acknowledgements. Preserve
  original failing evidence. Fresh requests are assigned; old waiting work remains
  waiting absent a routing command. No currently due case existed before QA.
- [x] Record concrete findings and update observable regression scenarios before
  the smallest coordinated fixes. Preserve queue/tenant/current-assignee security,
  transcripts, contact privacy and all S118 changes. Five receipt gaps corrected;
  nullable sender-side migration66 preserves old history. Company editing is now
  deliberate and the conversation precedes secondary context. Queue recovery
  is manager-only/explicit and preserves holds; new requests still autoassign.
- [x] Verify actual local visitor↔staff and owner↔support workflows plus focused
  owner-support API/receipt adapters, route/assignment,
  receipt visibility/scroll/background behavior and real maintenance execution.
  Label any controlled timestamp fixture explicitly; do not claim a real elapsed
  30-minute timeout from an accelerated boundary test. Use focused automated
  regressions and affected desktop/phone/Expo captures; no full release gates yet.
  Evidence:20 receipt/component cases,6 final staff route/editor cases,10 startup
  cases; isolated routing/recovery/inactivity/receipt/owner-adapter/native-install
  suites; both final types; localization17/17(1577keys). Real Chrome317 and
  Expo320 functional receipts retain strict harness failures separately. Real
  worker closes the accelerated QA deadline;12 final admin states pass with no
  runtime/API/writes and unchanged inspected customer case. Physical Android is
  not claimed. Owner Account→Support creation/assignment/both-way read/reply/Close
  also passes in actual Chrome using the sameQA321 after a retained hidden-link
  harness failure; six continuation screens, zero runtime/API/unexpected writes.
  Only five owned diagnostic cases are removed;317/320/321 stay ended.
- [x] Reconcile master/spec/traceability/operations and explain proven fixes,
  current limitations, exact test URLs and processes. Local review and combined
  receipts are under `.local/chat-reliability-s119/`; saved notification settings
  remain intact. Web and worker run together through the verified supervisor;
  Expo remains on8082. No hosted/configuration/build/Git publication occurred.
- [ ] CURRENT visual approval under AGENTS.md step8 before full/release/acceptance,
  scoped commit and separately reviewed hosted migration/API/web/new Android.
  Earlier unfinished workstreams remain open; this audit does not approve them.

### S120 — make real browser user journeys mandatory (workflow recorded)

Newest request is an operations/workflow requirement, L0; it retains S119 and
all earlier work. Definition of Ready: affected admin/staff/owner/visitor tasks,
desktop/phone web, Expo localhost8082 and truthful native-device limits are
explicit. No application/provider change is needed. AGENTS.md, FE_BASE and
master §22/24 control; actual S119 evidence demonstrates the requested method.

- [x] Record the request, scope and agent ownership before instruction changes.
  Browser testing means interacting with the rendered app using its real local
  API; a screenshot, mocked renderer or compilation alone is not sufficient.
- [x] Update AGENTS.md and a linked operations guide with affected-role/
  platform journeys, click/type/navigation/Save/Cancel/error/reload checks,
  canonical persistence/security proof and private local fixture safeguards.
  Focus/media/network controls and unsupported device behavior remain disclosed.
- [x] Link the procedure from FE_BASE/master, validate instructions and map actual
  mobile8082/admin evidence. Preserve focused-before-visual-approval order and
  full/release gates; this is not an approval to release outstanding candidates.
  Evidence:199specs/links and scoped whitespace pass; actual S119 Chrome staff
  and Expo8082 workflows demonstrate the method with focus/harness limits retained.
  AGENTS/doc changes are local; reviewed commit remains behind current task gates.

### S121 — automatically assign all ordinary waiting work (active)

Defect/behavior correction L2 plus L3 existing worker wiring. Newest instruction
supersedes S119 manual queue recovery and implicit case holds. Preserve all other
S119/S120 work and earlier unresolved gates. BE-018/FE-019/DEP-043 ready scenarios
define eligibility, balancing, concurrency, bounds and real browser evidence.
Master §§13,15,19,22 are affected. No new dependency, schema or provider.

- [x] Record dirty baseline and Ready criteria; delegate domain, workers and
  browser checks. All ordinary Waiting cases, including manual unassignment,
  re-enter automatic routing; pause is the existing agent receiving setting.
- [x] Implement bounded internal scheduled routing, wire local/hosted
  minute workers with independent failure handling, and remove misleading bulk
  manual/hold UI. Keep immediate new/availability routing and per-case overrides.
- [x] Run focused SQL/security/fairness/concurrency/budget/worker/UI regressions;
  retain failures and do not weaken previous receipt/idle/history boundaries.
  Three isolated PostgreSQL suites,12worker/controller cases,6staff UI cases,
  the native owner lifecycle regression, both typechecks and17localization cases
  pass. Catalog manifest regenerated from current source; no new copy keys.
- [x] Protect/read the actual local waiting backlog, restart only owned local
  worker and observe automatic assignment with no button or inbox-write trigger.
  Exercise Chrome/admin/staff and affected Expo waiting→assigned against real API.
  Protected before/readback proves all5original cases automatically assigned by
  workload exactly once, with unchanged messages/prior history/other cases and
  provider settings. Initial tick routed5/ended0; subsequent ticks routed0/ended0.
  Chrome admin/assigned-staff/Expo current-state journeys pass; a deliberately
  aborted read recovers automatically in10.708s without Retry. Original failed
  cold-restart/25second observer is preserved separately, not relabelled passed.
  The10k isolated candidate plan completes5.438ms under1s but scans/sorts; no
  hosted-scale/index claim. Ordinary saved web/worker startup is restored.
- [x] Reconcile current specs/master/traceability/operations and screenshots;
  report local outcome honestly. Existing visual/full/commit/hosted/new-binary
  gates remain separate; this correction is not visual approval or deployment.
  Review: `.local/queue-recovery-s121/review.html`; source/tests/readback/browser
  receipts remain separate from raw failures and protected before-images.
- [ ] CURRENT obtain explicit visual approval of the updated current layouts;
  then run required full/release/acceptance checks and review task-isolated commit.
  No hosted setting/migration, publication or Android build is approved by this
  local correction. Preserve every earlier workstream and its remaining gates.

### S122 — complete the wider dashboard and business workspace audit (active)

The owner clarifies that S121 did not complete the earlier dashboard/business
workspace UX request. This reopens concrete coverage gaps in S115/S118 and does
not approve the chat layouts, full gates or rollout. Classify as UI/workflow
audit and defect correction, L1 with L2 evidence if save/data adapters change.
Preserve current Account gateway, business-centered admin sections, explicit
editing, product-only catalogs, social contact handoffs, owner Support/Transport
and S121 automatic routing. No unrelated visual rebrand or new feature framework.

- [x] Record the dirty baseline, read controlling specs/master and retain earlier
  workstreams. Delegate admin/staff, owner web and native owner audit; coordinate
  sequential real Chrome captures while source is frozen. Baseline is
  `.local/workspace-audit-resume-status.txt`.
- [x] Audit actual remaining desktop/phone/Expo journeys, including
  product editor Cancel/dirty-leave and return context, admin Access subtask
  returns and location management. Inspect navigation, records/actions, loading,
  accessible hierarchy and scroll burden. Report exact observed problems and
  unverified tasks; do not substitute old screenshots for current interactions.
  Admin38 and owner-web38 states pass read-only; Expo33 states/7 grouped journeys
  confirm global Back losing About input and product parent/Cancel gaps. Original
  native selector ambiguity is retained; one scoped controlled retry passes.
- [x] Record focused Ready scenarios in FE-026/FE-056/FE-053/FE-047 and affected backend
  specs before changing code. Identify affected master sections (13/19/22;
  15/18 if runtime/copy changes). Reuse current authority and components. BE-032/
  BE-054 S122 specify safe focused product action and canonical admin geography.
- [x] Fix the verified gaps across affected web, phone web and native surfaces;
  keep business/role context, saved data, draft recovery and permission checks.
  Required editing tasks open deliberately and offer coherent Save/Cancel/Back.
  Actual QA admin city Save also exposes a reviewed historical proposal masking
  the applied location in owner Business details. Add an effective read projection
  and unchanged-location Save preservation across both clients before final review;
  retain proposal history/version and the independent public pin (BE-054).
- [x] Run focused component/navigation/security tests and both applicable
  typechecks/localization/spec checks. Exercise the changed flows in actual
  Chrome with scoped test accounts and protected readback; isolate any authorized
  fixture writes and preserve original failures and native/device limitations.
  Focused action/component/controller and isolated product/geography/effective
  location tests pass; both types,17localization cases and199spec links pass.
  Real private-QA signup,26web states plus11post-fix web states and20Expo states
  across explicit checkpoints verify actual saves/re-entry, recovery and exact
  profile/proposal preservation. Settled390/320confirmation actions are visible.
  Harness/preflight failures remain failed and separately classified; no physical
  Android/OS delivery or whole-app certification is claimed. Existing records
  stay unchanged; only the new private unpublished QA tenant is written.
- [x] Consolidate the current dashboard/owner/mobile evidence and review with
  the earlier pending candidates, update specs/master/traceability/test guide.
  Distinguish implemented, tested, visually approved and deployed.
  Review and private exact-account guide: `.local/workspace-audit-s122/`.
  Ordinary local web/worker startup is restored; saved settings are unchanged.
- [ ] CURRENT obtain explicit visual approval before expensive full/release/acceptance
  gates, reviewed task-scoped commit and separately authorized rollout. A chat
  fix or read-only audit is not approval or completion of the wider workspace.


### S125 — unanswered work, explicit Join and honest customer status (active)

Feature/defect L2 with L3 migration/worker wiring. Preserve S122 workspace work
and every earlier unfinished gate. Newest owner steering requires explicit staff
Join before any customer assignment/join announcement. Master §§5/13/15/18/19/22
are affected. Ready: ten-minute internal reply target, no unanswered auto-close,
no public SLA, preserved idle windows/history, staff-only routing, explicit
assignment-fenced Join/public-reply gate, safe legacy backfill and no alert flood.
No new dependency/provider or hosted operation.

- [x] Record dirty baseline, research official Zendesk/Intercom/Microsoft patterns,
  and update BE-018/050, FE-019/053/062 and DEP-043 before source implementation.
  Reopen alone starts no staff deadline until a new participant message.
- [x] Phase1: implement/test additive migration67 and pure response contract
  in isolation. Preserve exact historical transcripts/events/contacts and implicit
  joins; an explicit assignment marker distinguishes accepted joins going forward.
- [x] Protect actual local before-images, apply schema sequentially, verify
  exact preservation/no-op replay; activate new runtime only after schema checkpoint.
  Isolated migration regression passes. Actual protected loopback66→67 archive,
  rollback rehearsal, unchanged history/contacts/old fields/attention and replay[]
  pass at `.local/chat-standard-s125/migration67/verified.json`. No hosted mutation.
- [x] Implement response/join/attention contracts, bounded worker adapters, staff
  filter/Join/resolve controls, neutral customer state and native-readable copy.
  Reads/Claim/assignment must not join; stale commands/deliveries are denied.
- [x] Directly affected security/SQL/component/worker/type/localization checks and
  actual paired desktop/phone Chrome plus Expo8082 journeys. Web6checks/13screens
  pass; Expo15functional states/8DB checks verified, with the original strict
  network receipt mixed for two cancelled reads (cause unproven). No installed
  Android/OS claim. Labelled QA only; external push suppressed in-process during
  capture, then ordinary detached launchers/settings restored. Six inherited
  compatibility suites and full gates remain separately pending.
- [x] Update master/traceability/operations and consolidate current review, including
  S122 pending dashboard work. Distinguish implementation/tests/visual approval/
  deployment, preserve original harness failures and physical-device limitations.
- [ ] Explicit visual approval → required full/release/acceptance gates → scoped
  review/commit. Hosted schema/API/web/native rollout remains separately gated.


S125 additional owner steering: customer-idle ending must retain factual proof of
last staff reply, no subsequent participant message and confirmed-read state at
ending. Add immutable versioned idle_ended evidence and compact authorized staff
presentation, with no customer DTO leakage or historical fabrication. Existing
closed event and unresolved history remain. Isolated runtime tests exposed the
old transport-only resolution CHECK;67 is already applied and remains immutable.
- [x] Schema68 isolated regression and protected local checkpoint: permit
  resolved_at only with closed status for both queues, widen event enum for audit
  evidence and add latest-evidence index; preserve every row/history and replay[].
  Isolated regression plus actual protected archive/rollback/apply/readback pass
  at `.local/chat-standard-s125/migration68/verified.json`; no hosted writes.
- [x] Verify factual evidence atomically with real local worker ending and staff
  view, including read/unread truth and persistence after resolve/resume. No claim
  that the system can determine message quality or prove OS delivery.


### S126 — alert and email admins when assigned staff do not reply (active)

Newest request extends S125 and does not abandon its browser/rollout work. Ready
is recorded in BE-018/050 and DEP-043 before source changes. Ten-minute target
uses max(oldest unanswered message time,current assignment time); original wait
is retained. Internal assignment-scoped alerts and per-admin private email outbox
are retry-safe. Reuse Resend and verified local Mailpit; no account email edit,
new credentials, external test mail, hosted mutation or new Android build.

- [x] Record ordered dependencies, privacy/authorization/budget/idempotency and
  test/local-only rollout criteria. S125 production source stays frozen during
  its already running actual Chrome journey; new work may be prepared separately.
- [x] Schema69/pure deadline/email-port contracts and isolated focused tests;
  protected local archive/rollback/apply/history preservation/no-op pass at
  `.local/chat-email-s126/migration69/verified.json`; zero historical email jobs.
  No hosted write.
- [x] Integrate current-assignment attention and private bounded email dispatcher
  into existing workers; reject stale jobs and preserve original message history.
- [x] Actual local staff/admin overdue + Mailpit delivery/dedup/readback: same
  QA322/assignment, original customer anchor/messages preserved, six canonical
  manager emails accepted once in three bounded runs, later run creates none,
  actual Join/public reply/resolution. Five new screens plus two initial grace
  states. Zero final runtime/console/API/unexpected-write errors. The initial
  85second all-recipient timeout is preserved as harness-budget failure; one
  245second same-case continuation passes with no new case/assignment/source or
  clock change. Web/mobile typechecks,17localization/1597keys,199spec validation
  and3worker tests pass. Email adapter10/dispatcher11 and backend focused suites
  pass; independent DSN parser/target safety correction verified. S125 evidence
  remains intact; no external mail/push/hosted test.
- [x] Reconcile specs/master/operations/traceability and current review at
  `.local/chat-email-s126/review.html`, linked to S122 dashboard/owner audit and
  private account guide. Pending QA deliveries322–326 checked/quarantined only;
  history preserved. Ordinary web/worker and Expo remain running; settings hash
  unchanged. Local Mailpit evidence does not establish hosted Resend/OS readiness.
- [ ] CURRENT explicit visual approval of S122/S125/S126 → inherited compatibility
  and full/release/acceptance gates → isolated scoped commit → reviewed hosted/
  device rollout. No production/new-binary deployment or current task commit yet.


### S127 — normal clusters ending in screen-sized shop previews (CURRENT)

Feature/defect L1; FE-021/053/058, BE-023 and FE-048/BE-041 control this work.
Master §§5/7/15/18/19 are affected. S122 workspace and S125/S126 chat work remains
locally verified with its visual/full/rollout gates open; no request is abandoned.

The latest owner direction is implemented locally: normal outer circles merge
on zoom-out and click to expand. ONLY at maximum normalized18/native raw17 do
final groups stop splitting and open all members together. Capacity uses actual
viewport/font/safe-area dimensions, up to6desktop/3phone and fewer when necessary.
There are no connecting lines, list scrolling or Previous/Next. Only a shop with
no eligible peer within3km gets an individual icon; forced one-card partitions
remain numbered circles. Final membership changes only for actual scope/capacity,
not zoom subdivision. Public200scope and saved coordinates are unchanged.

- [x] Record dirty baseline, controlling/base specs, Ready and ordered acceptance
  before edits. Explicitly supersede global-three/all-zoom-fixed/leader/pager
  experiments; retain their original receipts as history.
- [x] Shared3km neighborhoods, compact deterministic partitions, exactly-once IDs,
  weighted Supercluster outer hierarchy, bounded800m display spacing and current
  terminal-group admission.19contracts/330bruteforce partition oracles pass in
  `.local/map-groups-s127/neighborhood-3km/verified.json`. Actual67public rows
  unchanged:7solitary icons,25phone final groups or19desktop groups. This removes
  27unnecessary glyphs from the earlier800m policy. Dense200-shop geometry and
  complete hierarchy parity are exact across capacities1..6 and zooms1/6/14/18.
- [x] Web/native/Expo maximum-only activation, adaptive all-fit cards, localized
  singular/plural actions, current-membership/focus/camera/return protection.
  Focused map command38contracts/20node subtests passes; current native groups9,
  Market/layout15, installed Leaflet lifecycle4 and both types pass. Localization
 17cases/1606keys, specification validation199 and scoped whitespace pass.
- [x] Actual browser defects reproduced before their narrow fixes: stale marker
  callback ignoring the first maximum-level click; missing SDK invalidation when
  a flex container becomes visible; RNWeb right:undefined retaining right12 and
  stretching an invisible toolbar across landscape. Fresh callbacks, coalesced
  owned ResizeObserver/initial frame and explicitright:auto fix those causes.
  Tests retain zero-size/liveness/unmount,48px controls and current-camera bounds.
  Short web CSS also matches the real visible map and clears the dock/handle.
- [x] Actual installed Chrome real-app/API workflows completed29checks/59states:
  web1440/390(allfive languages)/320; actual six-shop desktop; Expo390(allfive
  languages)/320/844landscape. Current Expo groups3/3/3/3/3/3/4 fit together;
  real desktop6 fits. Detail/full-shop/Back, focus/camera, zoom18 cap/wheel,
  authoritative API search/clear and ordinary pointer gestures pass. Zero final
  runtime/console/API/request errors or writes. All owned browsers are closed.
  Source-bound coverage: `.local/map-groups-s127/actual/final-platform-verified.json`.
  Original mixed failed receipts remain failed; completed unaffected web prefix
  is bound to unchanged web/shared sources, every mobile defect is reverified on
  the final Expo source. No forced clicks, injected app state or fake API success.
- [x] Controlled dense supplement independently covers200coincident shops,
  capacities6/3/3/4/1,214center/edge activations and all200members on desktop/phone.
  Explicit fixture/tiles/presentation ports; not real app/API/native-device proof.
  Receipt: `hierarchy-density-fixture/2026-10-17T20-59-23.260Z/outcome.json`.
- [x] Reconcile current master/specs/traceability and concrete review at
  `.local/map-groups-s127/review.html`, linking the pending workspace/chat reviews
  and private test-account guide. Local web3102/Expo8082/Mailpit54324 remain ready.
- [ ] CURRENT explicit visual approval under AGENTS step8, including the current
  map layouts and separately linked S122/S125/S126 workspace/chat reviews.
- [ ] After approval: inherited chat compatibility and full check/release/
  acceptance gates → reviewed task-scoped commit → separately authorized,
  monitored web/native rollout. No current-task commit, hosted write or new APK.

Installed Android/MapLibre/OS accessibility/push remain separate evidence. External
media/analytics controls are recorded; no provider-playback or database write is
claimed. Protected failures, diagnostic measurements and test-harness precision/
branch/gesture classifications remain under `.local/map-groups-s127/`. They are
not retroactive passes. Review starts from the current approval gate, not a rerun
of old operations. S122/S125/S126 requirements and receipts remain preserved.

### S128 — compact Market toolbar (CURRENT)

L1 layout/UX refinement; FE-065 S128 and FE-053 control; S127 map behavior is a
preserved dependency. Master §§5/10/18/19 are affected. Existing459dirty paths
are preserved as earlier authorized/user-owned work; no broad staging or reset.

- [x] Inspect current source/specs and screenshot; record Ready before edits.
  Keep centered two-choice mode switch, visible labeled48px filters, narrative
  behind existing info, one non-layout accessible heading. Inline controls on
  measured content width35rem web/760px native including844landscape; phone/enlarged fallback wraps.
- [x] Capture BEFORE actual Chrome map/list and top-stack metrics at
  web/Expo1440×1000,390×844,320×480,844×390 before production edits. Root owns
  the exclusive actual browser slot and protected .local/market-toolbar-s128/.
  PASS16states/16metrics, zero app/API/write errors; both modes across8contexts.
  Baseline map top: web1440=414.5,390=283,320=235,844=261px;
  Expo1440/390=280,320/844=232px. Owned browsers closed.
  Receipt: `.local/market-toolbar-s128/before/outcome.json`.
- [x] Web agent owns public Market/intro/workspace/CSS and focused web tests;
  native agent owns Market screen/search controls and focused native tests.
  No shared global header/navigation, query/API, marker or provider redesign.
  After root baseline capture, implement smallest responsive row change and run
  mapped component/type/localization checks. Preserve all S127 fixes.
  Evidence: native34/34focused (including actualRNWeb empty-child regression) and mobile/strict-script types; web6group+8workspace
  cases,40layoutstates,2enlarged samples and10populated578/606px realReact
  states pass. Root application typecheck,17localization/1606keys and199specs
  pass. Actual layout review remains separate from these controlled ports.
- [x] Freeze sources and verify actual installed Google Chrome:80layout states,
  both scopes/all five languages at1440×1000/390×844/320×480/844×390 on web/Expo.
  Final receipts match current source hashes. Map starts at195px web desktop,
 169px wide Expo,227px phone web and224px phone Expo; gains220/111/56/56px.
  Labels/counts,48px targets, useful input width, centered choices, no overflow
  and unobstructed map gestures pass. Zero runtime/console/API/request errors or
  application writes. Actual enlarged-text samples are recorded separately.
- [x] Four English/Amharic control journeys (web/Expo),40real public API readbacks,
  and two English full group→preview→showroom→Back journeys pass. Independent
  search, multi-category/country/city, custom toggle, reload, clear and panel
  state remain correct. Current camera returns within0.1projected pixel on both
  axes; original half-pixel threshold retained. No invented save operation or
  real messages. Web/Expo workflow receipts combine in workflows-verified/.
- [x] Three actual Chrome150%rem Amharic-product states at1440/844/320 pass,
  with full words,48px targets and honest wrapping. Native font-scale wrapping
  has controlled component evidence, separate from OS/device verification.
- [x] Reconcile affected master/spec/traceability and source-bound concrete review
  at `.local/market-toolbar-s128/review.html`. Application typecheck, localized
  catalog checks, spec validation and scoped whitespace checks are mapped below.
- [ ] CURRENT Obtain explicit visual approval under AGENTS step8 before expensive
  full/release/acceptance gates. Earlier workspace/chat/map reviews stay open.
- [ ] Full/release/acceptance gates, scoped review/commit and separately reviewed
  rollout follow approval. No current deployment or Android build authorized here.

S122/S125/S126 workspace/chat and S127 map reviews remain pending, not cancelled.

S128 measured-layout correction: the844px web layout retains a sidebar, leaving
about606px for controls. Use a37rem measured-content inline threshold on web,
with decorative icons omitted in the narrow inline band; labels/counts,48px
targets and220px search remain. Native has no sidebar and retains760px. This
clarifies the Ready geometry before the corresponding CSS change; no shell,
query or font-size reduction. Verify all five product-filter label layouts.

S128 actual-browser correction: the real844px web shell yields602px toolbar
border-box and578px content (24pxpadding), below the prior37rem query. Preserve
the first receipt (30passed states, then real wide-row failure) and exact diagnosis
under .local/market-toolbar-s128/. Use35rem/about560px CONTENT for web inline
controls and test populated578px content in all five languages. Earlier606px
fixture described a different shell width; it did not prove the real landscape.
No target, label or state assertion is weakened. Repeat actual checks after fix.

S128 native browser defect: the new conditionalStatus expression yielded an
empty string while idle, which RNWeb View reports through Expo LogBox even when
console interception hides it from normal console listeners. BEFORE has no toast;
AFTER screenshot proves it. Stop the ownedcapture, retain failure46states and
explicitclassification, use a Boolean guard before code, regress idle/loading/
error child rendering, and assert no visible LogBox in actual snapshots. No
change to loading/error/retry semantics or any query/state/backend contract.

S128 returned-search defect, reproduced by one controlled actual retry: after
queryAddis, productfilters/reload and clearing business query, shop→browserBack
retains the eligible saved group/selectedID/camera but hangs at Loading with no
modal. No API/console errors or missing persistedselection; do not characterize
as a wiped snapshot. This unchanged pre-S128 search controller did not correlate
SSR initialprojection with its actual querykey and left aborted requests pending.
FE-065 S128criterion7 now Ready before fix: atomic keyedprojection, explicit SSR
criteria, pending/error reset on resolved-keyreturn, deferred membership validation
and deferred persistence during unsettled scope. Web agent owns narrow source
regression/fix; root repeats actual return and affected layout evidence. No API,
provider, schema, copy or native change. Original failures remain retained.

S128 instrumented return trace classifies the remaining race exactly: keyed
fetch now returns67current businesses and Loading ends, but child SDK initial
view callbacks write nullgroup/nullselection/zoom5 immediately after success,
before the parent restored selection has committed. Valid17/cluster17-40/zoom18
existed before navigation; this differs from the earlier valid-snapshot Loading
case. Passive storage/GET trace retained in return-trace/outcome.json. Ready
criterion7 now requires a projection-scoped committed-restoration write fence;
add the exact settled-response/child-callback regression before fixing. No new
API/schema/native/layout/copy changes. Component passes alone cannot close the
actual return defect; repeat the same real sequence after the fence is verified.

S128 real return after committed fence restores the preview/group; next assertion
fails camera parity by26.936pixels vertically, matching half the loading-row
height. Web adapter uses rawinvalidateSize(pan:false), while Expo already has
the tested fullprecision correction. Readycriterion7 now preserves camera on
loading/layout resize. Native agent owns moving that unchanged pure helper to
sharedlib/map (native compatibilityre-export), using it in webownedresize with
intermediatecallback suppression, and an installedSDK regression for54px resize.
No provider/dependency/coordinates/grouping/copy change; preserve camera assertion.
Original partial workflow receipt stays failed until SDK-backed return passes.


S128 final local evidence (2026-10-17): final web/Expo layout receipts each pass
40 states on current sources; combined80-state receipt is `after/outcome.json`.
Four real controls journeys and two full showroom returns use40 authoritative
public API readbacks; combined16screens and camera corrections are recorded in
`workflows-verified/outcome.json`. Both projected camera axes return within0.1px.
Three enlarged-text samples pass. Top/visible-height comparisons and focused
review are in `verified.json` / `review.html` under `.local/market-toolbar-s128/`.
The initial breakpoint and empty-text failures, keyed projection/commit race and
resize drift retain their original failed receipts. Final source includes the
narrow current-scope restoration fence and unchanged shared Leaflet correction;
10SDK/lifecycle/oracle cases and all current typechecks pass. No API, schema,
provider, coordinates, grouping policy, global navigation, signing or hosted
configuration change.

The first Expo Amharic hard-reload workflow expected persisted language, but the
existing web runtime deliberately keeps secure-adapter values in memory. It
returns to English on refresh; native uses SecureStore. The controlled retry
observes English, selects Amharic through the real picker and verifies all the
same URL/filter assertions. Original failed receipt and classification remain;
no language-storage behavior was changed and no installed-device claim is made.
All five languages have layout/label coverage; full control journeys are English
and Amharic and the two full map returns are English. Analytics/media controls
are explicit and no application writes were permitted. Owned browsers close;
local servers remain running. Commit and deployment have not been performed.

Final S128 gate receipts: `.local/market-toolbar-s128/current-application-types.log`
(application typecheck0), `final-spec-validation.log` (199specs/ADRs),
`final-localization.log` (17/17,1606keys/catalog), scoped task-file whitespace0.
The final `verified.json` binds current implementation hashes, focused receipts,
unchanged HEAD038a143 and pending visual/full/commit/rollout status. Existing
unrelated dirty changes remain untouched; no files are staged.


### S129 — native showroom product cards (CURRENT)

L1 shared native card UX feature; FE-041 S129/FE-053 control, FE-066/S118 are
preserved dependencies. Master §§8/18/19 affected. All460existing dirty paths
remain preserved; baseline recorded before edits in `.local/s129-dirty-baseline.txt`.
This is shared product-grid functionality, not a new client recipe/art direction.
Existing client assets/accents are reused; no showroom project is redesigned.

- [x] Read contracts, inspect web/native cards and persistence/options authority;
  record Ready and this ordered plan before production edits.
- [x] Root actual installed Chrome BEFORE reference captured five states: web
 1440/390 and Expo390/320/844, real four-product demo catalog, no API/runtime
  error or backend writes. Receipt `before/outcome.json`; protected source copies
  precede edits. Native and web agents used separate bounded source ownership.
- [x] Separate card details/Add, show two description lines, use existing bounded
  required-options Sheet, guard stock/preview/loading/duplicates/cap and reuse
  existing list/error ports and accents. Six new card cases plus24inherited
  basket/contact/dock/eligibility cases pass; mobile/strict-script types pass.
  Web phone two-line excerpts and native-language Add/Added accessible names pass
  two rendered-source tests at320/390/844/1440; targeted types pass. New tests
  join the existing workflow-ui gate without replacing any prior command.
- [x] Freeze source; root actual Chrome real public APIs and web baseline plus
  Expo phone/small/landscape and active en/am/om labels. Test Add/count/list/Back,
  reload, options, unavailable items and business isolation. Preserve failed
  receipts and distinguish fixtures/preview from Android/OS evidence.
- [ ] Reconcile Master/spec/traceability and focused screenshots/review; explicit
  visual approval under AGENTS step8 before expensive full/release gates.
- [ ] After approval, applicable full/release/acceptance → scoped commit → separately
  authorized rollout. No current deployment, cloud write or new Android build.

S128 compact Market approval and earlier workspace/chat/map work remain pending.

S129 baseline inspection also found web-phone CSS hides the existing excerpt.
Newest shared mobile-description intent applies: restore its existing two-line
clamp on phone web with a scoped CSS change and rendered overflow/line-bound
regression. Keep web Add/options routing unchanged. Assignment_trace owns only
BusinessProfile.module.css and an isolated responsive-card test after baseline;
root owns actual Chrome, shared specs and evidence. Ready recorded before edit.

S129 reference audit found the web card accessible Add name inserts an untranslated
English action into a translated template. Ready criterion1 now requires the
same native action name as the visible label. Assignment_trace owns the narrow
BusinessProfile aria-label inner translation and rendered regression before
root's final source-bound Chrome matrix; actual merchant names remain literal.

S129 options-sheet review: maximum20 feedback must remain visible inside an active
picker. Ready criterion3 now makes this explicit before the narrow native notice
placement correction/regression. Do not leave a new dialog silently open with its
error rendered only behind the modal. Other card/store behavior remains frozen.

Actual private-owner journey now passes, but its320px screenshot proves48% card
width plus12px grid gap wraps each half-width card onto its own row. FE-041 S129
Ready now requires measured container width, two columns only at150px per card
plus gap, otherwise one full-width card; enlarged-text fallback stays. Native agent
owns the narrow correction/regression before root's queued variant journey and a
bounded updated private320px review. Keep the first passing functional receipt
and its separately recorded visual defect; no account/catalog mutation is needed.


### S130 — richer mobile search and map previews (CURRENT implementation)

New steering extends the active work; S129 direct showroom Add and S128 Market
spacing are retained. User wants useful product/business descriptions and the
business city/location visible before opening full pages from mobile Market.
Web is the reference; do not redesign an already sufficient desktop preview.

- [x] Read-only compare web/native product cards, map group rows and
  selected-business preview; verify existing public API/DTO fields and S127
  row/capacity constraints. Canonical search rows have city/region omitted by
  the wire DTO; group compact rows omit location and all rows omit descriptions.
  No product persistence defect was found in S129's isolated complete journey.
- [x] Record FE-065/FE-053/FE-021 observable acceptance and Ready, affected master
  §§10/19 (and public API contract only if needed), localized data/stock/privacy
  invariants and ordered plan before implementation. No inferred merchant facts.
- [x] Implement smallest native card/preview correction, enrich only existing
  eligible public projection if a field is missing. No private location data,
  provider, dependency or schema change without concrete evidence/contract.
- [x] Focused component/data/capacity regressions and actual installed Chrome on
  Expo390/320/landscape plus web reference; useful readable excerpts/location,
  full-page navigation/Back and S127 all-fit bounded picker must remain correct.
  Active-language labels, literal names/descriptions and source-business link;
  retained catalogs are separately complete. Oromo country names use Chrome
  English fallback when its Intl locale data is absent, explicitly recorded.
- [ ] Reconcile master/spec/traceability, provide concrete current visual review
  and await explicit approval before full/release/acceptance gates/commit/rollout.

Earlier workspace/chat/map reviews remain open. New requests do not replace them.

### S131 — attractive optional showroom categories (CURRENT)

The user's newest request adds optional merchant-defined collection/category
selection and visible product membership. This is the existing product-category
taxonomy, not legacy collection tables or global business industries. FE-041 S131,
FE-053 and BE-044 are Ready; Master §§7/8/18/19 are affected. No category is required
for signup/publication, and existing editor permissions stay unchanged.

- [x] Read-only web/native/catalog audit and dirty-tree baseline. Native is missing
  category fields/UI; web has scoped filtering behind a plain select. Existing
  categories and product IDs supply authority, with no schema migration.
- [x] Record acceptance/Ready: accent-aware wrapping single-select48px chips,
  literal names/counts, active tenant-local product affiliation, All/search
  intersection, removed-category recovery and flat-grid optional fallback.
- [x] assignment_trace implemented web BusinessProfile/CSS, shared mobile contracts
  and projections plus isolated projection/web category tests. native_audit owns
  native ShowroomContent categories and S130 index/MapGroupPicker plus focused
  native tests. Preserve all existing S129 Add/options changes. Root owns shared
  package registration, specs/Master/checklist, integration and final browser slot.
- [x] Focused actual-source projection/filter/card/capacity/optional regressions,
  tenant/inactive/foreign/service negative cases, types and five-language catalog
  validation. No permanent seed, category, account or chat data write is needed.
- [x] Freeze combined S129–S131 source and exercise actual installed Chrome:
  web desktop/phone, Expo390/320/landscape, real category/search/Add/details/Back,
  flat showroom and richer Market previews. Label response-only variant or empty
  category fixtures separately. Complete guarded private owner preview after
  source freeze. Keep all failed prior browser receipts and classify them honestly.
  Actual web1440/390 category/search/Add/details/Back passes, but Expo390 proves
  a remount loses category/query on ordinary Back. FE-041 S131 criterion2 Ready
  now specifies bounded32-business/two-hour origin+business public criteria memory,
  no private preview/catalog/account snapshots and canonical category revalidation.
  native_audit owns narrow correction/regression before repeating only affected
  native journeys; original eight-state failed receipt remains unchanged.
- [ ] Reconcile evidence/traceability and provide a concrete combined visual review.
  Wait for explicit AGENTS step8 approval before expensive full/acceptance/release
  gates, scoped commit or separately authorized rollout. No current deployment.

S129 already passes30native and2web focused cases and three complete real-browser
Add/list/detail/reload/isolation journeys; the all-language/owner final capture is
pending and will include S130/S131 rather than repeat an obsolete layout. S128,
S127, S122 and earlier chat/workspace tasks remain open with their own evidence.

### S132 — native-readable language and the web landing narrative (CURRENT)

New owner steering explicitly supersedes S128's removal of visible web headline/
description. Keep compact native Market with About/info narrative; restore a
compact meaningful introduction on desktop/phone web. Copy includes businesses
that sell, make or grow products and use social media to reach customers, not
only online sellers. Customer benefit: organized products/options/listed
availability before a specific direct message; business benefit: clearer customer
questions and more time to agree the sale. No stock verification/import/checkout
claim. FE-049/FE-052 Ready; Master §§3/10/18/19/22 affected.

- [x] Record request, source audit and Ready before edits. Existing locales are
  en/am/om/so/ti; Afar is not available. Preserve retained catalogs/identifiers;
  new enabledLocales en/am/om governs choices and inactive saved fallback to en.
  No database/preference deletion or new translation provider.
- [x] chat_owner_audit rewrote shared English/Amharic/Oromo narrative
  and key public/owner task vocabulary in TSV, regenerates catalogs, adds active
  locale guards to web/native and alert presentation, focused semantic/retention
  tests and primary-source language notes. Root integrates compact visible web
  headline/supporting text, professional About hierarchy and matching SEO.
  Owner's later readability suggestion is included: plain light background on
  web Market replaces the inherited decorative image there; showroom identity
  and other page backgrounds remain unchanged. Verify real text contrast/layout.
- [x] Focused locale/merchant-interpolation/metadata/semantic tests and types.
  Verify Amharic selector after usable hydration; preserve earlier SSR-only
  failed snapshot without inventing a cookie or Add-label product fix.
  Later bounded diagnostic PROVES initial enabled select has no attached handler;
  its ordinary am input triggers hydration, controlled value resets en, and GET
  RSC sends the same single host-only en cookie. Ready refinement is in FE-049:
  disable until first client-effect commit, retain pending guard, regression plus
  actual first-enabled-selection verification. No speculative cookie mutation.
- [x] Freeze with S129–S131 and S133; actual Chrome web desktop/phone and Expo
  three active languages, Market/About/intake/product/filter/detail/list and
  affected owner preview; readable wrapping, no overflow or loss of user state.
  Research informs wording; automated checks are not native-speaker endorsement.
- [ ] Reconcile Master/spec/traceability and concrete review, then wait for explicit
  visual approval before full/release/acceptance/commit and separate rollout.
  Prepared promotional text may change; existing graphics/listings are not
  silently claimed rebuilt, published or current to this new narrative.

### S133 — transport invitation and pickup/destination explanation (CURRENT)

User asks for “Want help with Transport/Shipping? — Chat Live with our agents”.
FE-052/FE-049 Ready controls natural casing/native phrasing and clear intake.

- [x] Record shared-copy/launcher/intake scope and no chat/API/state change.
- [x] Shared title/subtitle and concise pickup/destination instructions,
  native-authored Amharic/Oromo and retained compatible catalogs; root integrates
  both lines and accessible label on web/native, preserving contextual dock fit.
- [x] Focused launcher/intake/i18n tests, then actual Chrome open→read/type→cancel
  in active languages without submitting chats or touching customer records.
- [ ] Concrete visual review/approval → inherited full gates/commit/rollout.

All requests on this board remain active. Source-frozen final browser review
combines dependent UI work, rather than dropping work or recapturing obsolete UI.

### S134 — anonymous safety options and unnecessary UI explanations (CURRENT)

- [x] S146 Account placement follow-on (FE-063): remove the prominent Blocked
  businesses links from native guest Login and owner Account settings, retaining
  contextual Listing options → Block/Report/blocked-list management for Google
  Play public-UGC compliance. Focused native Account/safety tests, mobile
  typecheck and actual Chrome Expo guest Login→showroom Listing options pass in
  `.local/s146-account-safety-review/`; no preference or report write.
- [ ] Capture the affected Expo owner Account settings route and obtain combined
  visual approval before full gates/commit. No web/backend change.
- [x] Read user concern and official Google Play public-UGC policy. Business
  listings are contributed content; anonymous browsing does not remove report/
  block requirements. Existing preferences are local to the visitor, not bans.
  FE-063 Ready records one contextual Listing options action, bounded Report/
  Block/list management and unchanged anonymous report security/persistence.
- [x] assignment_trace implemented web PublicBusinessSafety+CSS/tests after its
  S131 geometry slot; native_audit owns native CatalogSafety/tests after its
  S130/S131 tests. No account creation or new API/schema/provider. Keep previous
  S129 Add/category and S130 preview changes intact. Root owns shared registration,
  primary-source rationale, copy audit review, actual integration and evidence.
- [x] Audit public/owner rendered task copy for internal notes/redundancy. Record
  actual removals; keep useful privacy, preview, stock and recovery instructions.
  No additional proven internal-note text was found in the affected task copy;
  the change consolidates safety controls rather than deleting useful guidance.
- [x] Focused open/report/cancel/block/unblock/persistence-error cases and inherited
  report/tenant regressions. Actual Chrome isolated visitor web/Expo exercises
  visible actions, no stacked modal, Cancel and reversible local preference;
  never send unrelated reports/customer messages or change actual merchant data.
  Actual Chrome proves the web footer entry remains behind transport at maximum
  ordinary scroll (48px at y707.94, center hits dock SVG). FE-063 Ready refinement
  precedes root's narrow CSS fix: reserve the existing measured dock clearance
  after that footer, retaining all hit tests and transport positioning. Repeat
  only affected focused geometry and the real safety journey after source freeze.
  The added700px focused case proves a second overlap in the681–720 interval:
  Ready before correction now reuses the runtime-root's64px mobile reserve only
  in that gap; keep measured height and strict five-point/full-target assertions.
- [ ] Reconcile specs/Master/trace and concrete combined review. Explicit visual
  approval precedes full/release/acceptance/commit/rollout; all prior tasks remain.

### S135 — Chrome test windows opening and closing (CURRENT operations diagnosis)

The owner reports the test browser appears to open and shut itself. This is a
test-infrastructure observation, not evidence of an application crash or a passed
journey. S120/FE_BASE control the workflow; all earlier product tasks remain.

- [x] Inspect the original receipt before retrying: the visible private-preview
  run at00:03:28 records an unexpected page-close during ordinary local sign-in,
  zero completed states and no page-crash event. Its failure is preserved.
  Later browser/context disconnects occurred during explicit cleanup. The reason
  for the initial page closure remains unproven.
- [x] Confirm both local servers and Mailpit remain listening independently of
  test windows. Browser cleanup must not stop those servers or close user tabs.
- [x] Monitor page crash/close, context close and browser disconnect
  against explicit teardown/deadline state; classify early closure as failure.
  Completed installed-Chrome headless workflows are separate, accurately labelled
  evidence, not proof that the headed-browser issue was repaired.
- [x] Record current verified journeys and remaining browser limitations in the
  combined local review. Keep the original failed runs; no automatic full-suite,
  release, production or credential/configuration action follows from diagnosis.

### S136 — prevent compounded fractional map-resize drift (CURRENT defect)

- [x] Preserve real Expo fullshop→Back failure and one settled controlled retry:
  three identical samples establish dx0.084632px/dy0.936141px atzoom18. Installed
  Leaflet prototype proof reproduces the fractional parity case; repeated synthetic
  remounts reach2.936px, so widening the tolerance is unsupported.
- [x] Record FE-065 Ready before correction. Scope: existing public Leaflet resize
  adapter and regression, Master §§10/22. Keep the half-pixel contract, grouping,
  callbacks, API and native provider unchanged. A map-instance weak intent may
  survive size-only changes; deliberate pan/zoom resets it and zero-size does not.
  The persistence callback retains that unchanged geographical intent after a
  size-only render; test actual SDK position independently within half a pixel.
  Genuine pan/zoom publishes the actual new view; no forged SDK evidence or
  snapshots, private SDK fields or tile resets.
- [x] Bounded installed-method prototype proof → smallest shared-helper
  correction and meaningful fractional/remount/pan/zoom tests. Avoid private SDK
  fields or forced view resets that invalidate/reload tile layers.
- [x] Focused resize/lifecycle regressions, current types and only the affected
  actual Chrome web/Expo group→shop→Back journey. Preserve all earlier receipts
  and record new exact source hashes; no unrelated full-suite rerun.
- [ ] Merge the corrected evidence into the current visual review, preserving
  earlier UI/chat/workspace gates. Full/release/commit/rollout remain separate.


S129–S136 integrated local evidence (2026-10-17): protected review
`.local/ui-integration-s129-s134/review.html` and aggregate `verified.json` retain
exact source deltas, originals and explicit scope limits. S129's two response-only
options/stock journeys pass4screens with no catalog write. Current private-owner
ordinary OTP/preview/details/Back is verified; corrected320/390grid supplement
passes2screens with protected QA fingerprints unchanged. Six current RNWeb grid
geometries and36source/store regressions pass. S132/S133 copy/intake checks pass
41states plus a retained completed English prefix; no report/chat was submitted.
S134 real web/Expo preference journeys pass10screens and exact local API readback;
its final measured-dock regression passes10single/stacked states through700px.
S136 installed SDK7/adapter2 regressions and three real full-showroom returns per
web1440/Expo390 preserve the original half-pixel budget independently of saved
intent. A final native pan assertion was overstrict about1ULP longitude formatting;
read-only exact canonicalization reconciliation is separately recorded, without
changing failed receipts or the original camera tolerance. Both global typechecks
and199spec validation pass. All controlled browsers are closed; web3102, Expo8082
and Mailpit remain running. The earlier unexpected visible-page closure and one
prior5s owner-readiness failure have unproven historical causes; completed isolated
headless results do not relabel them or establish headed/device behavior.

CURRENT gate: finalize this concrete visual review and obtain explicit approval
under AGENTS step8 before expensive full/check/release/acceptance/remote gates.
No new commit, push, deployment, hosted mutation, Android build or store asset
publication is claimed. Earlier workspace/chat/map review obligations remain.


### S137 — editable multi-provider transport plans (local candidate; S138 supersedes publication)

L3 additive feature, BE-057/FE-068/DEP-047. This request joins the existing board;
S129–S136 visual review and all earlier workspace/chat/release work remain open.
Master §§5/12/13/18/19/22 have explicitly planned statements before implementation.

- [x] Dirty-tree baseline `.local/s137-dirty-baseline.txt`; read controlling base,
  support/transport/spec/Next guides and perform three parallel read-only audits.
  Existing private handoff/contact and its closed-chat rule remain unchanged.
- [x] Record Ready before code:1–12 ordered legs, server-stable UUIDs, literal
  provider/from/to120char fields, five methods, optimistic atomic save/audit,
  fresh assigned-transport/manager access even after ending, no chat lifecycle
  mutation. Save explicitly publishes safe fields and creates a separately
  purpose-bound read-only fragment capability; Copy reuses, Replace revokes.
  Counts mean transport stages, not guessed unique company identity. No automatic
  copying private intake, dates/ETA, current carrier, scans, carrier catalog,
  outbound email/message or new hosted service/secret.
- [x] assignment_trace implemented pure contracts/validation, schema70 and
  server plan ports plus isolated persistence/security/migration/HTTP tests.
  Existing chat projections were activated only after verified local70. Eight
  isolated PostgreSQL suites and three mobile HTTP cases pass, including fresh
  queue-scope revocation, restricted ACLs, actual guest/owner projections,
  rollback/replay and public70 full-content preservation. No hosted writes.
  Evidence: `.local/transport-plan-s137/backend-verified.json`.
- [x] In parallel chat_owner_audit implemented staff read-first contextual Plan
  route/editor/actions and focused UI tests. native_audit implements safe
  participant view/optional DTO compatibility, dedicated conditional live reader,
  public native screen/incoming links and focused lifecycle/routing/render tests.
  Root owns shared i18n/package/specs/master/checklist, public web page/API/header
  boundary and protected local backup/apply/readback/browser coordination.
- [x] After isolated migration/security passes, root independently verified exact
  canonical local target69, protects a native backup, applies additive70 once and
  verifies version/grants/protected fingerprints. Only then enable existing chat
  plan projections. No automatic backfill from private handoffs or real data.
  Evidence: protected native884997-byte archive/inventory, local69→70 readback and
  new-table-only ACL correction under `.local/transport-plan-s137/local-migration/`.
  Full protected-row fingerprints matched across each actual write. Preserved
  wrapper/diagnostic failures are classified in `local-migration-classification.json`;
  no hosted mutation, restore or seed/backfill occurred.
- [x] Historical S137 focused types/tests and real local API/DB readback. Exercise labelled staff
  and owner/guest cases, concurrent/stale/denied writes, ended edit without chat
  changes, share re-copy/replace,304 validation/revocation,5s visible update and
  hidden/background/stale-response fences. Active en/am/om wording; retained
  inactive catalogs separately validated.
- [x] Historical S137 source freeze and actual installed Chrome desktop/phone/Expo paired tasks:
  staff Add/reorder/rename/method/route Save/Cancel → requester and anonymous share
  updates, no private leakage/date/current-step claims. Capture all affected
  roles/layouts; protected labelled local fixtures only, no external sends.
- [x] Reconcile historical S137 focused/actual proof in traceability and protected
  `.local/transport-plan-s137/` receipts. S138 supersedes its publication/access
  contract; legacy data stays private and unchanged. The current S138 review
  includes the reused ordered editor/read view. Visual/full/commit/rollout gates
  remain open there; no historical anonymous rollout is implied.


### S138 — verified multi-shipment tracking (visual approval pending)

L3 BE-058/FE-069/DEP-048, ADR-0028; Master §§5/12/13/16/17/18/19/22.
Newest owner request supersedes S137 chat-bound/anonymous publication only; keep
all earlier work, visual gates, schema70 plans/history and owner case327.

- [x] Classify feature/architecture; record dirty baseline and read controlling
  specs/installed Next route/cookie guides. Three parallel read-only audits cover
  identity/outbox/security, staff/web structure and native lifecycle.
- [x] Ready before code: separate recipient-only email code/session; exact verified
  recipient; many independent shipments; staff team transport authority; explicit
  Submit+durable details email; legacy private preservation, no account adoption.
- [x] Implement pure contracts, additive71, atomic challenge/session and
  shipment/outbox ports. Isolated migration/security/idempotency/revocation tests
  before any shared local database write or activation of new reads. Evidence:
  `.local/tracking-s138/backend/migration-corrected.log` and runtime-initial.log;
  original fixture failure retained/classified (missing required fake phone).
- [x] In parallel build dedicated staff Tracking list/detail/Create/Edit and native
  email/code/list/detail; root owns public web/HTTP/locale/entry integration and
  protection of existing chat/account workflows.
- [x] Verify exact local70 and protect native backup/inventory/fingerprints; apply
  additive71 sequentially once, verify grants/data, then activate new endpoints
  and coherently retire legacy anonymous/participant bypasses. Evidence:
  `.local/tracking-s138/local-migration/verified.json`: all prior public table
  content unchanged, native archive/inventory/digest protected, six empty tables,
  no inferred recipients/backfill. Exact quiet worker resumed after checkpoint.
- [x] Focused types/security/HTTP/localization tests; actual installed Chrome web
  desktop/phone+Expo8082 recipient/staff/owner tasks, two shipments, real Mailpit
  code/details, Save/Cancel/reload/expiry/negative permissions and DB readback.
- [x] Reconcile local evidence/master/spec/traceability and provide concrete review:
  `.local/tracking-s138/review.html`, integrated verified.json and operations guide.
  Actual13 journey checks include desktop/phone/Expo, real Mailpit/code/two plans,
  Save/Cancel/live changes, correct canonical Copy, scoped manager revoke, role/
  recipient denial, owner draft/session coexistence/logout and en/am/om layouts.
  All original account/catalog/chat/legacy data stayed unchanged. Preserve the
  initial wrong reload assertion, pre-transition screenshot and exact correction.
- [ ] CURRENT explicit AGENTS step8 visual approval (requested) before full/check/
  release/build/acceptance/remote gates. No hosted write, new Android binary,
  commit or rollout here; earlier S129–S137/workspace/chat review gates remain.

### S139 — blocked web basemap (CURRENT defect)

L2 frontend/external-adapter correction under FE-021/FE-058/DEP-026 and ADR-0016;
Master §§5/10/15/19/22. User confirms screenshot is web localhost3102. Preserve
S138 and all previous pending reviews, grouping behavior, tenant data and runtime.

- [x] Inspect dirty baseline, controlling specs, installed Next/Leaflet contracts
  and official OSM policy. Separate proven policy gaps from the unproven cause
  of the user's specific generic403 notice; no public tile probes or automation.
- [x] Ready: explicit public origin-only cross-origin referrers; private Tracking
  keeps no-referrer. Check HTTP status before rendering each visible tile using
  one direct default-cache request, with bounded abort/object-URL cleanup. On
  failure remove only the owned raster, retain camera/markers and allow explicit
  retry without a new URL, identity, provider or automatic retry loop. Shared
  web/Expo browser adapter; native MapLibre/signing/database remain unchanged.
  Automated reviews use declared local tile fixtures and never reach public OSM.
- [x] Implement narrow loader/provider/CSP/referrer recovery and localized
  neutral background status; regression coverage for403-as-PNG, caching headers,
  private→public navigation, cancellation and manual retry.
  User follow-up: initial tiles work, then zoom/preview return later hides the
  map. Reconcile actual SDK cancellation with the loader; public async GridLayer
  avoids TileLayer overwriting custom decode callbacks. Add pending-zoom/return
  regression before claiming provider recovery.
- [x] Focused types/security/provider/lifecycle tests; actual Chrome desktop/phone
  web and Expo8082 with local tile fixtures and authoritative read-only discovery.
  Preserve raw failures, disclose provider/device limits and no real map playback.
  Evidence: loader15, actual-adapter2 (>10s zoom), fixture5, provider contract,
  root/native types; main33checks/48states plus phone-return2checks/3states, all
  actual Google Chrome155 headed and real read-only APIs. No public OSM requests.
  Separate ordinary-browser owner check confirms map/preview return work again;
  no server-address/provider change was required. Specific original block reason
  and any upstream acknowledgement remain outside this evidence.
- [x] Reconcile specs/master/traceability and present current local review at
  `.local/map-tiles-s139/review.html`; source-bound receipts preserve all failures.
- [ ] CURRENT obtain
  explicit visual approval before full/release/acceptance/build/remote gates.
  No provider switch, paid service, hosted mutation, commit or rollout is included.

### S140 — final groups open without forced street zoom (paired with S139)

FE-021/FE-058, L1; Master §§5/10/19/22. New owner correction preserves outer
click-to-zoom, membership, screen-sized all-fit previews and global zoom limits.

- [x] Inspect shared hierarchy and all UI/restore guards. Pure diagnosis proves
  already-separated terminal groups at13 were forcibly sent to18; no data write.
- [x] Ready: only outer aggregates carry expansion zoom. A current visible
  terminal group opens its exact all-fit preview at the current camera; do not
  open saved/hidden terminal keys still enclosed by an outer aggregate. No change
  to grouping distances, capacity, coordinates, search, data, max zoom or provider.
- [x] Shared hierarchy plus coherent web/Expo/native preview and restore
  guards; focused regression for immediate leaf preview, outer expansion and
  obsolete/hidden saved-group rejection. Preserve S139 and all earlier work.
- [x] Actual Chrome desktop/phone web and Expo click outer→terminal→preview→Back;
  camera readback and local API membership proof with controlled tile fixtures.
  Evidence: shared20/UI17/installedLeaflet2, real desktop4-member preview at6,
  phone/Expo3-member previews at12, zero terminal camera movement and11s returns.
- [x] Present combined S139/S140 review and reconcile master/spec/traceability.
- [ ] CURRENT explicit visual approval before further gates;
  visual/full/release/commit/rollout gates remain pending, no new Android binary.

### S141 — independent creation before recipient verification (CURRENT correction)

L3 BE-058/FE-069/DEP-048, ADR-0028; Master §§5/12/13/16/17/18/19/22.
Preserve S138 and S139/S140 evidence/pending reviews; newest owner direction
removes preverification as a creation prerequisite and duplicated chat entry UI.

- [x] Record dirty baseline and inspect all controlling specs, current schema71,
  backend/session/outbox contracts and visitor/owner/staff/native navigation.
- [x] Ready before code: staff Tracking menu → New, validated email sufficient;
  no chat FK/context gate; nullable72 pending recipient; OTP only for reading.
  Atomic creation/email/idempotency/fresh roles and all read isolation remain.
  One shell-owned Tracking entry, current-chat return hint only; legacy data
  private/read-only with stale write actions retired. No conversion or deletion.
- [x] Backend+isolated migration72/security tests; standalone
  staff UI/actions; one visitor/owner/native entry and draft/return regressions.
  Root integrates native-language copy, specs/master, exact local activation.
- [x] Rehearse and protect local backup/inventory/fingerprints, apply72 once
  sequentially after isolated evidence; old data/ACLs unchanged at activation.
  `.local/tracking-s141/local-migration/verified.json`; runtime remains quiet only
  during labelled local QA, with ordinary restoration tracked below. No hosted
  mutation or external email.
- [x] Focused types/HTTP/session/role/outbox/UI/localization tests; actual Chrome
  desktop/phone web+Expo, staff/admin independent New/Edit/Cancel/two plans before
  email verification, real Mailpit initial email+OTP, recipient list and cross-
  email denial, visitor/owner single entry and preserved chat/account/drafts.
  `.local/tracking-s141/actual-verified.json`:9journeys/12states, source-frozen,
  no page/unexpected-write/lifecycle errors; original harness failures retained.
- [x] Restore ordinary owned local runtime after S142/S143 labelled QA is terminal.
  Ordinary supervisor28513, saved settings hash unchanged; web/login,Expo8082
  and Mailpit54324 each return200. Owned Chrome sessions closed.
- [ ] Reconcile tested implementation, protected review/test guide and explicit
  visual approval before full/check/release/acceptance/build/remote/commit gates.
  No deployment, new Android binary, provider or credential change here.

### S142 — compact staff chat and remove old company form (CURRENT parallel UX)

FE-019/FE-062/BE-018, L2; Master §§13/18/19/22. Keep S141 independent Tracking.

- [x] Inspect repeated staff header rows, management stack, read observers,
  navigation/action contracts and company handoff entry/mutation paths.
- [x] Ready: compact single header; chat/composer primary; desktop side details,
  explicit phone Details/Back preserving draft; hidden chat cannot mark read.
  Retire old company add/edit and queue summary/stale write actions, and obsolete
  case-plan screens. S144 owns scoped data cleanup; no chat/account deletion here.
- [x] Implement and focused-test staff/admin/support navigation,48px
  controls, draft/receipt visibility, Join/reply/assignment/resolve and no-mutation
  retired actions; actual Chrome desktop/phone on labelled local fixtures.
  Focused16cases/types0 plus one-bubble correction;12functional app checks and
  19current states.332private note was not published;332–334 resolved. Exact
  footer visibility/read watermark and hidden-draft proof retained. Original
  failed receipts/network cancellations remain unclean, not relabelled passed.
  `.local/staff-chat-s142/combined-review.json` maps prefixes/continuation.
- [x] Reconcile evidence/spec/master and prepare `.local/review-s141-s144/review.html`.
- [ ] CURRENT explicit visual approval, then full/release/acceptance and commit
  gates; no deployment or clean-network claim is inferred from functional QA.

### S143 — compact Market switch and audience-based About (CURRENT parallel UX)

FE-065/FE-052/FE-049, L1; Master §§3/5/10/18/19/22. Keep all prior search/map fixes.

- [x] Inspect web/native mode bars, redundant info controls and stacked About.
- [x] Ready:48px targets in a compact centered row (ordinary-height budget52px),
  remove info icon/sheets on every platform; keep approved visible web intro/SEO.
  About selected customer/business tabs preserve existing native-authored copy,
  links and map navigation. No search/state/data/camera change.
- [x] Implement/focused-test mode geometry, tabs/keyboard/CTAs/enlarged
  labels and real native preview; actual Chrome web/Expo en/am/om and short views.
 32focused cases/10rendered contexts; native/script types0. Actual36functional
 checks/36screens source-frozen,50pxrows. Strict receipt retains15cancelled GETs
 without individual signal provenance; functional completion is not a clean
 network/full-gate claim. `.local/market-about-s143/verified.json`.
- [x] Reconcile tested source/master/evidence and prepare combined review.
- [ ] CURRENT explicit visual approval and full gates; strict cancellation limits
  remain recorded and must not be described as a clean browser gate.

### S144 — obsolete transport-data cleanup (local/live VERIFIED COMPLETE)

BE-018/BE-057/DEP-047; one-time L4 operations, not a permanent sync feature.

- [x] Owner clarified permanent cleanup scope: old conversation-based transport
  plans and Transport company handoff records, local AND live. Independent
  Tracking shipments, accounts, messages and active chats are outside the cleanup.
- [x] Read-only exact-target/schema/table/count/constraint inventory;
  define the smallest row scope, backup/restore/rehearsal plan and required guards.
  Do not assume a production table/version, discover arbitrary credentials or
  delete data while inventory/access/backup verification is incomplete.
- [x] Protect verified exact typed archive, rehearse rollback/foreign-key behavior,
  verify unchanged protected data and perform only the authorized scoped operation
  sequentially. Record zero-row/no-table no-op honestly. No broad cascade/reset,
  account/Auth/configuration change, tracking-plan deletion or unsolicited mail.
- [x] Verify local/live readback and report exact scope, evidence and limitations.
  `.local/legacy-transport-s144/local-apply-verified.json`:4plans+9events removed;
  70protected tables unchanged, worker resumed. Hosted schema63 plan table absent
  and all3event types zero; no hosted mutation. Exact archive/rehearsal/digest are
  protected in the same directory. Cleanup is complete, no code rollout inferred.
  UI rollout/full/visual gates for S141–S143 remain separate and are not bypassed.


### S145 — complete MirtPage rebrand (CURRENT; all earlier work preserved)

Web/native CI boundary (DEP-002/DEP-042/DEP-044/DEP-049; local source):

- [x] Preserve clean root/shared-contract `release:web` and its moderate audit;
  use those same boundaries in required web `core` and `dependency` PR jobs.
  Keep core operations and pure Android artifact-safety checks, plus separate
  browser/container/PostgreSQL jobs. Update the executable workflow contract.
- [x] Focused `scripts/test-workflow.mjs`, `scripts/test-web-install.cjs`,
  `test:mobile:release-safety` (3/3), and `validate:specs` (217 specs/ADRs)
  pass after the workflow edit. Source-bound remote PR jobs remain unverified;
  web CI success will be web admission only.
- [ ] Before each new MirtPage AAB, run the full locked-workspace moderate audit
  fail-closed and obtain a new exact per-artifact owner approval for any advisory
  exception. Recheck signing/config/archive/device and Play controls separately.

Shipment tracking/provider-reference follow-on (Ready proposal; FE-069/BE-058/
DEP-048/FE-049/FE-053; master13/15/17/18/19/22):

- [x] Inspect active staff/editor/recipient/native/terminology contracts. Preserve
  completed native/Auth/mail approval and exact51-path mail evidence as prior
  source; do not restart or replace earlier tasks.
- [x] Root reviews exact backend/UI Ready proposals and owned path
  sets before feature code. Tracking-only optional URL/code, legacy empty
  normalization, additive75 bounds and no automatic status are explicit.
- [x] Protect exact new beforeimages; implement independent optional staff
  fields, authenticated web/native read/copy/external actions and active
  Shipment tracking terminology. Keep retired form/default serialization and
  routes/IDs/credentials/session/tenant/receipt/status invariants unchanged.
- [ ] Current: finish focused UI/native/domain/security/localization/types. Reorder/drafts/
  Cancel/version/retry, old/missing fields, URL attacks/no fetch, literal copy
  failures and all existing role/recipient/session negatives remain tested.
- [ ] Coordinate root-approved local75 runtime and actual Google Chrome
  desktop/phone staff/admin plus visitor/owner/Expo8082 complete tasks with real
  local API/DB/email evidence, labelled fixtures and retained failed parents.
- [ ] Separate fresh stopped producer/two-zero/in-flight fence before changing
  only initial Tracking-email terminology. No provider URLs/codes in email;
  preserve sender/address/origin/provider/Message-ID keys and old snapshots.
- [ ] New en/am/om/320px visual review and explicit approval, then fresh combined
  full gates/source hashes; separately reviewed backup/hosted/native rollout.

Independent Auth source mail tranche (Ready, L3; BE-059/DEP-029/DEP-049/FE-070):

- [x] Root approves finite push split, now Ready in BE-059/FE-070/DEP-043:
  browser wire token stays compatible, new workers display MirtPage, validated
  Expo payload uses MirtPage; all keys/channels/permissions/quiet/tap checks stay.
- [x] Implement and focused-test the split against current new workers,
  immutable old worker source and actual isolated web/Expo dispatch ports.
  Eleven worker cases and real PostgreSQL dispatch pass, retaining original
  shared-token owner/visitor isolation and retry/privacy guards.

- [x] App-mail follow-on is Ready in BE-059/DEP-049 with exact scoped local
  stop/settle/two-zero-snapshot gate, unchanged settings and Expo8082. Root
  authorizes the brief pause, exact MirtPage display changes and prompt one-time
  restart; no app-mail edit occurs before actual stopped-state proof.
- [x] Execute that boundary, then change only authored
  Tracking/escalation display, active-locale subjects and Telegram prefix while
  preserving provider keys/addresses/origins; restore preview before isolated tests.
  Exact old processes/listener gone, two zero snapshots, unchanged Expo and one
  same-command restart are verified. Web and localhost8082 return200. Preserve
  the first verifier's wrong IPv4 Expo address as a harness failure, not outage.
  Renderer14, escalation durable11, Tracking delivery and localization24 pass.

- [x] Additional finite scope is Ready in FE-053/BE-059: update only the native
  OSM public User-Agent with executed registration/host/privacy coverage. Keep
  its protocol ID. Preserve the unreachable on-behalf compatibility adapter;
  only its definition and historical runtime test call it.

- [x] Record exact twenty-seven-field scope, protected beforeimages, native
  artwork parity and unchanged security/credential/language boundaries before
  code. App-mail queues and push wire/display remain separate dependencies.
- [x] Update twelve Auth HTML files, manifest/local subjects/sender
  display and exact guarded values; derive public email PNG without changing
  existing derivatives or restarting any service.
- [x] Run focused branding/guard/asset/type/spec checks and prepare twelve
  desktop/phone static previews. No external mail or provider writes.
  Auth guard65, canonical artwork/placeholder tests, scoped/mobile strict types
  and native-map11 pass. Actual installed Chrome passes24 Auth and18 plain-mail
  phone/desktop states. All prior canonical derivative bytes are unchanged.
- [x] Owner explicitly approves combined email visuals and full checks on
  2026-10-18 (call_f4b4e2d16ffe48698f92c4e78814ae59). Review:
  .local/mirtpage-rebrand-s145/auth-mail-source/combined-review.html.
- [ ] Coordinated local Auth reload/real Mailpit OTP verification remains separate.
- [ ] Later full gates and exact hosted plan/backup/approval/readback; verify the
  PNG is served first. App-mail source boundary above is verified locally;
  hosted empty-bootstrap/ledger/backup boundaries and exact approval remain separate.

Native default-identity tranche after base99333795 (Ready, L3; DEP-049,
DEP-042/DEP-043, FE-053/FE-070, BE-059):

S146 native public-origin correction (CURRENT, FE-070/DEP-049):

- [x] Inspect the four active native origin consumers, qualified build targets,
  validated API-origin contract and existing social-player navigation boundary.
- [x] Share the validated MirtPage/default-or-explicit origin across native API,
  About legal links, external-link adapter and social-video WebView; preserve
  local/staging overrides and reject malformed origins.
- [x] Prove default, override, invalid and exact-provider navigation outcomes
  with focused actual-adapter tests and mobile strict types. Installed Chrome
  Expo8082 opens both legal pages from About through the configured local origin
  and returns cleanly. Receipt:
  `.local/s146-mobile-origin-review/receipt.json` (4 checks,0 errors/failed local
  requests,6 synthetic tiles,0 escaped). Native WebView/provider playback is
  separately pending on an installed MirtPage Android artifact.
- [x] Reconcile FE-070/DEP-049/master/traceability with local evidence; no hosted
  change, app build, store upload or provider mutation follows from this fix.
- [x] Correct the remaining native YouTube WebView missing-package fallback to
  the MirtPage package; prove missing/configured/Expo Go and provider/hostile
  navigation using the actual adapter. Preserve bridge tokens and existing
  installed-package behavior. The compiled-adapter script passes 4/4 via
  `node --import tsx scripts/test-mobile-video.ts`; npm's `tsx` launcher hits
  sandbox IPC `EPERM` before executing tests. Mobile/root types and spec links
  pass. No new binary or provider check is implied.

- [x] Record exact final default identity, real Firebase client/hash and accepted
  expected Play signer before code. No future Suqpage default; existing EAS IDs
  remain infrastructure only. Initial hosted target set is empty, iOS denied,
  old app-scoped submission binding cannot be reused.
- [x] Implement canonical policy/config/three profiles, exact new-file validation,
  safe public-link navigation and artifact admission; no provider/build action.
- [x] Derive canonical white-alpha notification icon and run focused tests,
  strict mobile types and sanitized installed-SDK config introspection.
- [x] Reconcile master §§2/15/17, distribution docs and traceability with measured
  local results. Root reviews task diff before staging/commit; full gates and
  actual runtime/EAS/FCM/association/artifact/store qualification remain separate.
  Two config/Firebase harnesses,16 link/artifact cases and three artwork cases
  pass, with strict mobile types and scoped script types. Actual installed Expo
  config/scheme inspection covers all three profiles. Real protected Firebase
  bytes validate without mutation/output. Additive public association is ready
  for a future web deployment; new autoVerify remains off until the exact hosted
  target qualifies. No Chrome/provider/EAS/prebuild/native build/full gate ran.

FE-070/BE-059/DEP-049, proposed ADR-0029; full programme L4. Master affected
sections1/2/3/5/10/12/13/15/16/17/18/19/22/23/24/25 plus brand appendices.
S141–S144 remain implemented/verified to their recorded levels; their outstanding
visual/full gates are folded into the new final brand review, not forgotten or
claimed previously approved/deployed.

Latest copy refinement (2026-10-18) remains part of this programme: a professional
digital showroom for businesses of every size, then customer benefits (range,
story, listed choices/availability and direct contact without searching posts).
FE-070 makes this independent copy tranche Ready. Keep the approved artwork;
update shared en/am/om Market/About/SEO/mobile and new-app promotional drafts,
then focused language/render tests and actual Chrome review. Existing frozen
full-gate attempts remain evidence for their exact earlier source; preserve
failures and do not call the entire release passed from partial checks.

- [x] Implement/refine shared narrative for every business and the customer's next
  step: six changed strings,20 localization cases, narrative/catalog/types and
  seven material checks pass. Actual headed Chrome passes27 checks/27 states
  en/am/om desktop/phone web/Expo, including metadata and audience/CTA navigation;
  zero app/console/request/lifecycle errors. No human language certification.
- [x] Owner approves the revised copy and full checks on2026-10-18 after the
  actual27-state review. Earlier logo/palette/layout approval is preserved.
- [x] Run full check/release/acceptance on source-bound isolated snapshots; retain all
  previous failed/partial snapshots without relabelling them.
  Full check completes all76 command groups through reviewed first-incomplete
  resumes; no application change was needed for stale test repairs. The complete
  web release gate now passes: clean audits, production build, artifact privacy,
  provider HTTP/security and tenant/migration/data checks. DEP-045's finite
  exact-asset/hash/schema correction passes29 regression cases and the actual
  build:93 traces,110 required public-gazetteer references,54 browser chunks with
  no catalog snapshot. Preserve all other source/private path denials. One local
  disposable Storage startup failure passed on an unchanged-source controlled
  release retry. The first full browser run passes17/20; proven stale Cancel/
  Preview selectors and ordinary scrolling are corrected with assertions retained.
  Actual installed Chrome separately proves the Send control is fully reachable
  after ordinary PageDown, with strict geometry/hit tests and all71 public-table
  fingerprints unchanged after exact cleanup. The complete corrected run passes
  16/20: transport Join/reply/private-note/history succeeds, while three further
  request/locator contracts and a preview stuck on Loading fail. The native
  retirement fixture now distinguishes valid410 from foreign-Origin403, and
  active-workspace/exact-entity selectors preserve original assertions. These
  focused repairs pass syntax/types. Controlled signup replay passes without
  proving the earlier Loading failure's cause. A later interrupted run preserves
  9passes/1 strict Sign out locator failure/10unobserved cases. The exact helper
  now targets Account main while retaining logout and private-route assertions.
  The final full run passes20/20, no skips/retries, exit0 on
  9e8e8e04774ca23af878169c64e6704e60cca35a17df3e9c50d560abdb953f00;
  app/dependency inputs match the passing release. Owned resources are cleaned,
  frozen inputs unchanged, ordinary web/Expo HTTP200. Earlier failures/partial
  attempts and13 stream-closed errors remain retained. Their actual timing/cause
  is unproven: synchronous tests delay asynchronous app-log forwarding. Evidence:
  private gates/acceptance-completion.json and durable-acceptance-20261018.
  This proves local gates, not application rollout or a new Android binary.
- [x] Complete the76-group application check and complete web release gate on
  source-bound isolated candidates; original failures and source-equivalence
  evidence retained. No deployment artifact, provider write or native build.
- [x] Finish full workflow-UI checks: the current-source group passes362/362,
  with no skipped/cancelled cases. The first complete group passed343/362,
  with19 failures retained. All proven stale fixtures are corrected with assertions
  preserved. The repeated group passed361/362; one Chrome launch timeout before
  map assertions passed on a single unchanged-source focused retry. Raw failures
  are retained. This completes the UI group. Subsequent reviewed test-only
  discovery, assignment/explicit-Join, benchmark and gallery repairs preserve
  assertions and allow the entire76-group check to pass. Full browser acceptance
  remains separate.

- [x] Record dirty baseline before edits; three parallel read-only inventories:
  platform/UI/copy/assets/locales, mobile/Play/Firebase, infra/data/domain/email.
  Public/provider documentation confirms permanent application/project identity
  rules. No provider or production write made during inventory.
- [x] Owner confirms MirtPage, current colors, digital showroom for every size/type
  of product business, mirtpage.com active in GoDaddy, NEW com.mirtpage.app and
  separate Play app/closed test. Keep backend tenants/accounts/products/history.
  MirtPage is the final public identity everywhere. Preserve old names only for
  bounded cutover safety, required technical identities or historical evidence;
  do not retain public co-branding or perform blanket data deletions.
- [x] Write FE-070 Ready for independent local presentation/identity/copy; BE-059,
  DEP-049/ADR-0029 draft the exact controlled migrations. Local shared-brand and
  narrative integration is independent of DNS/package provisioning. Do not recreate services,
  rotate keys or replace stable identifiers to improve cosmetic names.
- [x] Original vector mark/wordmark and customer/business narrative study,
  orange/charcoal/cream unchanged, desktop/phone/app-icon preview. This is a
  reversible design artifact; no customer/provider/canonical-URL change. Protected
  design/review.html and verified.json: 37 static checks, 27 installed-Chrome
  states at 320/390/1440. No application workflow or visual approval inferred.
- [ ] Complete the requested direction across web/phone web/native/owner/staff/admin,
  shared brand contract, metadata/SEO/PWA/favicon/native artwork, auth/legal/About,
  notifications/mail and en/am/om meaning-first copy. Audit every old-name match
  as replaced/compatibility/history/merchant content; fix reversed asset aliases.
  Local foundation/copy/metadata are focused-tested; actual review is in progress.
  Retained failures include the unsuppressed backend old-brand error and the
  discovered child Open Graph shallow-replacement issue (now corrected locally).
  Email/notification senders, backend defaults, new native build identity and
  hosted settings remain later phases; this whole item is not complete.
- [x] Local presentation tranche: original shared MirtPage identity, PWA/native
  artwork, active en/am/om hero/About/auth/legal/task labels, child Open Graph
  site-name correction and nonpersisted backend errors/fallbacks. Focused brand,
  PWA, identity, narrative, 20 localization and 4 backend-display cases, generated
  catalogs (1,786 keys per retained catalog) and scoped types pass. Backend TSV
  changes append 10 rows; existing captured hero/About text is unchanged.
- [x] Bounded actual local review: public 36 functional checks/36 states and 18
  API search readbacks; owner 13 checks/30 states with ordinary Mailpit OTP;
  admin/transport/support role slices record 6 completed checks/19 states.
  Protected business/catalog/draft/location fingerprints are unchanged. Source
  baselines, initial failures, raw cancellations/negative-path notices and
  headed/headless limits are retained in the private S145 review. This is not
  a clean release receipt or proof that the headed fresh-phone Apply stall is fixed.
- [x] Owner explicitly approves the combined local MirtPage logo, wording and
  layouts on 2026-10-18. Preserve this approval; do not ask again for the same
  design. The owner additionally requires identical logo/icon geometry and color
  shades across mobile and every surface, with no alternative marks/palettes.
- [x] Audit/fix canonical artwork parity: reproducible canonical derivatives, four
  asset/renderer tests, ten worker cases and nine actual Chrome states pass.
  Existing approved M geometry and exact logo colors remain consistent.
- [x] Run the serialized source-bound check/release/acceptance workflow. All76
  check groups, complete web release and20 browser cases pass as recorded above;
  raw stream/network provenance limits remain explicit. Visual approval is satisfied;
  native signing/build and hosted operations retain their own exact guards.
  Preflight identified stale legacy acceptance navigation/pagination contracts
  and direct map contexts without the mandatory synthetic tiles. Align those
  tests with FE-065/FE-070, preserving real API assertions. Run gates from an
  isolated source snapshot so type generation/builds cannot disrupt previews;
  use a unique disposable local Storage bucket because isolated DB fixture IDs
  alone do not isolate erasure-prefix cleanup from canonical uploads. Preserve
  first failures and stop/classify before any controlled retry.
- [ ] Verify actual GoDaddy delegation, provider console accounts/targets and
  recoverable backups. Prepare exact DNS/Netlify/Auth/callback/CORS/email/app-link
  plans and data-label inventory, then mark the relevant phase Ready before apply.
  The owner now confirms mirtpage.com purchased and ready (2026-10-18); re-inspect
  its exact GoDaddy settings, delegation and public records independently.
  Exact GoDaddy7/7 zone records and both authoritative NS agree; Netlify site/
  account/domain beforeimages are protected. Exact alias/A/www/managed-HTTPS
  connection plan is explicitly approved. Both new aliases and the exact A/www
  records are saved/read back; both authoritative nameservers agree, all other
  zone records are preserved, and the old primary/deployment remain unchanged.
  Managed TLS and31 domain-stage checks now pass, including eight exact-host
  root/health HTTPS probes, all20 public asset paths and the unchanged deployment
  6acd6e4203a2e50c6b9286dd. Protected provider-domain-apply/verified.json records
  exact changes/readbacks. Remaining
  provider/data/Auth backup and candidate/runtime cutover gates are separate.
  On 2026-10-19, a protected read-only archive of the verified hosted schema-63
  database captured 98 table fingerprints and its actual 59 migration markers.
  Its first isolated restore stopped before `pg_restore` and imported no rows;
  the corrected partial rehearsal remains unrun pending exact owner direction.
  The separate one-object private Storage backup stopped before object download
  during target/credential binding, with no hosted write. A follow-up read-only
  diagnostic bound the canonical MirtPage bucket/key settings on the same site;
  it fetched no Storage object. The archive alone is
  not a qualified recovery point: private Storage bytes, managed settings and
  a successful isolated restore are still required. Protected receipts and
  next-step reviews are outside Git under
  `.local/mirtpage-rebrand-s145/production-cutover-readiness/`.
- [x] Ready independent provisioning for exact owner review under DEP-049/ADR-0029:
  new domain aliases/DNS/managed HTTPS on the unchanged published deploy, plus
  additive Firebase/Play draft records. Exact forms, targets and protected
  beforeimages are prepared. Peer review finds no dependency on candidate
  browser acceptance for these non-code operations. Require fresh operation-
  specific checks and explicit owner approval; retain all full gates before
  candidate/runtime/build/upload/release. No application
  readiness is inferred. The owner now explicitly approves both exact operations
  and Play declarations. Domain aliases/DNS are applied/read back as above;
  Firebase/Play additive records are now verified complete for com.mirtpage.app;
  provider-registration/verified.json records Firebase app
  1:588262779708:android:9a9f3944058b1fcc248c39 and Play Draft4975632567188114692.
  Existing apps/keys are preserved; no binary/upload/release follows. All20
  candidate browser acceptance cases subsequently pass as recorded above.
- [ ] Bounded platform-owned DB labels/defaults migration only; preserve all tenant
  data, salts/identities/keys, media paths, jobs and duplicate-prevention semantics.
  Isolated tests/replay/restore and before/after fingerprints precede live changes.
  Independent BE-059 local prerequisite: both web workers accept only exact old
  and new notification titles with existing validation/navigation intact. Keep
  shared sender titles and native channel IDs unchanged until a controlled rollout.
  This worker prerequisite passes 10 focused regressions plus the existing
  platform regression; no actual notification/provider delivery is inferred.
- [x] Create the exact approved Firebase Android registration and separate Free
  MirtPage Play Draft; retain the actual generated client config privately and
  verify original app identities/keys remain unchanged. No artifact uploaded.
- [ ] Complete MirtPage EAS/native wiring, submission grants, reviewed signing/
  recovery and coexistence/push plan. New registration is not a rebuilt binary;
  no old app deletion or invented credential config.
- [ ] Actual Chrome all roles/desktop/phone/Expo plus real API/database checks;
  synthetic automated maps, source-bound screenshots and retained failures. User
  visual approval precedes full check/release/acceptance/build/remote gates.
- [ ] Fresh Play assets/screenshots/listing/disclosures/reviewer access en/am/om;
  new binary package/certificate/privacy/device checks; new closed tester opt-in.
  Reuse the approved address list, never claim previous enrolment/time transfers.
  New separate-app text/capture-plan drafts are in docs/play-store/mirtpage and
  docs/marketing/mirtpage. Seven focused material checks pass. The owner selects
  the charcoal feature graphic, with canonical logo/palette and validated
  1024×500 RGB exports for en/am/om. These are selected private artwork, not an
  upload-ready listing; actual new-package screenshots and publication remain
  pending. Private coming-soon teasers also export en/am/om story1080×1920 and
  feed1080×1350 PNG/SVG plus six silent6-second MP4s from the same canonical
  assets/copy. Font/palette/dimension/safe-area/crop/stream checks pass; these are
  unpublished assets, not real-app screenshots or platform-overlay proof.
  Play documents English and
  Amharic listing locales; Oromo remains in-app/promo unless Console support is
  independently established. Existing old-app material contracts remain separate.
- [x] Implement the BE-059 Ready local Auth-origin guard before any hosted Auth
  transition: exact legacy/dual-old-primary/dual-new-primary policies, digest-bound
  kind/phases, explicit rejection of version2 plans before reads, and the existing
  credential/backup/drift/attempt/readback fences. Verify injected-port positive,
  negative and compatibility tests; no provider plan/apply or runtime change here.
  Implemented locally:62 injected-port/credential cases, scoped strict types and
  whitespace pass; independent peer review is closed and these cases pass in the
  current-source check prefix.
- [x] Apply the exact approved hosted Auth callback-staging operation and verify
  independently: only uri_allow_list adds the new exact callback, site_url stays
  https://suqpage.com, Google login disabled, all243 fields equal original plus
  patch and241 non-target fields unchanged. Protected independent readback is in
  auth-origin-staging/retry-2026-10-18T20-51-57-965Z. New-primary Auth is unapplied;
  replan at readiness before requesting its exact separate approval.
- [ ] Controlled mirtpage.com HTTPS/canonical/Auth/email cutover with protected
  backups/digests/readbacks and monitored rollback. Keep old API/chat compatibility
  and safe public link redirects until a separately reviewed retirement.
- [ ] Verify production/new app/public and private workflows, store availability,
  fresh 12tester/14day eligibility, current docs/traceability and scoped commits.
  Report each implemented/tested/approved/deployed surface distinctly.


### S145 local support defaults and complete-ledger preflight

- [x] Ready: BE-059/DEP-049 define future support defaults/writer only, retained
  rows/inactive billing, rollback/replay and complete reviewed-ledger negatives.
  Master sections13,15,17 and22 are affected; native Ready sections stay separate.
- [x] Append migration73 and change only the active general-support
  writer; centralize the source ledger endpoint and validate complete histories in
  release preflight. Preserve all existing guards and historical migrations.
- [x] Add meaningful isolated PostgreSQL regressions for default/writer,
  duplicate/tenant denial, rollback/replay/history/billing preservation, actual
  runtime preflight, stale63 and hole64; update legitimate current fixtures and
  register the new test in the existing PostgreSQL readiness pipeline.
- [x] Run focused local DB/security/migration/strict type/spec/whitespace checks;
  reconcile exact evidence. No ordinary local DB migration, full gates,
  containers, mail changes, provider writes, Git stage/commit or publication.
- [ ] Separate release dependency: source-bound full gates and explicit runtime/
  hosted migration/backup/approval under DEP-049. This phase does not authorize
  changing pending mail envelopes, sender/origin or inactive billing.

  Local evidence: all18 applicable focused scripts pass at endpoint74, with scoped strict
  types and independent source-bound peer review. New guards preserve custom
  defaults and pre-existing versioned NULL defaults for review; only a fresh
  empty baseline may omit the old default. Existing normal preview72 retains
  the reviewed Suqpage default. Private support-default-preflight receipts retain
  all failed parents. The current rollout dependency above stays unchecked;
  these local checks are not full combined-candidate or hosted release evidence.


### S145 historical PostgreSQL ledger correction

- [x] Ready: historical BE-035/DEP-031/ADR-0020 evidence establishes27–30 as
  data-only patches and exactly two legitimate current ledger representations.
  DEP-049/BE-059 and master sections15/17/22 are reconciled before source edits.
- [x] Replace the contiguous count with bounded ordered exact-history
  admission. Admit only full1..74 or1..26+31..74; preserve all account/Auth guards
  and reject every partial group, required hole, duplicate/noninteger or unknown
  future ID. No historical marker writes, fake backfills or old patch replay.
- [x] Prove fresh full/current legacy and observed legacy63→74 using real owned
  PostgreSQL fixtures, plus partial groups, hole64, stale63 and invalid IDs;
  retain the default73 rollback/history/security tests and scoped strict types.
- [x] Independent production peer review of source/tests passes with no material
  finding; all18 focused tests and scoped strict types pass. Reconcile evidence.
- [ ] Refresh the private gate plan. Snapshot50a9efa is historical only. No full gate starts
  until mail-bootstrap readiness, fresh final source and root greenlight.
- [ ] Separate production backup restore/rehearsal must preserve the actual legacy
  representation and apply only64–74; no claims based on a fresh full fixture.


### S145 canonical business-category references (migration74)

- [x] Ready: reviewed immutable7tuple plan and BE-059/DEP-049/master contract
  precede code. Missing farms reference is separate from valid historical gaps.
- [x] Append74 only; guard exact table shape/PK/active check and known
  key active1, insert missing references and normalize only seven positions.
  Preserve all old labels/icons/unknown rows/tenant assignments; endpoint74.
- [x] Real six-key legacy63→74, current farm signup FK-before/success-after,
  owner tenant denial, all-table fingerprints, fresh no-op, rollback/replay,
  inactive/metadata refusal; update legitimate latest/tails and existing pipeline.
- [x] All18 focused migration/security scripts, scoped strict types and independent
  source-bound peer review pass; exact evidence is mapped in TRACEABILITY.
- [ ] Current: final full freeze waits for mail tranche completion and root
  greenlight; earlier full gates cannot certify this newer source.
- [ ] Hosted backup/restore rehearsal and exact separate migration approval;
  no reference deletion or broad customer/demo reclassification.

### S145 follow-on: Shipment tracking and optional provider details

- [x] Record the latest owner request without replacing the active rebrand or
  completed mail work. BE-058/DEP-048 propose Tracking-only URL/code values,
  bounded DNS-host HTTPS, legacy-empty/idempotent equality,75 constraint-only
  migration and independent fresh email-copy boundary before code.
- [x] Root reads/accepts the exact controlling BE-058/DEP-048 and FE-069
  Ready contracts. Coordinate shared parser/property names and UI/native/catalog
  ownership; do not implement from a partial cross-agent agreement.
- [x] Implement pure Tracking-only validation/projection, persistence/equality
  and additive75 constraint bounds; preserve OTP/tenant/role/order/version/audit/
  provider keys and historical bodies. Update genuine current endpoint fixtures.
- [x] Prove legacy accepted Submit replays without new shipment/event/email,
  old queued/leased snapshots, new per-leg values/reorder/clear/no-op/conflicts,
  URL/code/byte negatives and migration rollback/replay/rows/ACL integrity.
- [x] Retired chat-plan actions now point staff to Shipment tracking rather
  than using the old plan name. The focused legacy-action/UI suite passed all
  seven cases in the unrestricted local Chrome test environment; its first
  sandboxed browser launch was denied by macOS and made no app change.
- [ ] Current: retain the source-bound independent backend peer and reviewed
  ordinary-local backup/apply before real feature browser writes. All21 focused
  scripts and final five-case pure suite/scoped types pass; evidence and initial
  bounded launch/fixture diagnostics are in
  `.local/mirtpage-rebrand-s145/shipment-provider-details/`.
- [ ] Separately fence/settle local app-mail before active initial-email
  shipment-tracking wording changes; preserve runtime/settings/history and restore
  once. New provider links/codes remain portal-only and are never fetched.
- [ ] Complete active-language web/phone/native UI and real Chrome/Expo staff/
  verified-recipient tasks after the reviewed local migration boundary; capture
  appropriate states and obtain explicit approval of new layouts/copy.
- [ ] Only after all focused/peer/visual dependencies: fresh full-source freeze,
  root-reviewed durable harness and single check/release/20-acceptance chain.
  No new gate/freeze now; earlier receipts certify their own sources only.
- [ ] Separate reviewed local/hosted backups, actual restore rehearsal and
  migration/activation/publication approvals; no automatic restore or field loss.

### S145 follow-on: Search discovery for real public showrooms (FE-071)

- [x] Correct missing/draft showroom soft-404 responses before publication:
  the exact direct-document `@handle` proxy guard reads only indexed status,
  rejects absent/draft handles with a branded, localized 404/noindex page,
  retains suspended redirect and directly shared active pages, and leaves the
  normal route loader and RSC page guard in place. Focused local HTTP, installed
  Chrome desktop/phone and type/spec checks pass; see
  `.local/showroom-404-s146/review.md`. This is local source only, not a hosted
  rollout or approval of the new 404 visual.
- [x] Audit MirtPage's actual Market, About, Featured, showroom and product
  render/metadata, current sitemap/robots absence, canonical origin staging,
  active-language URLs and Google/Next.js primary guidance. Record FE-071 Ready
  before implementation; coordinate reciprocal FE-070/BE-054/DEP-049 links.
- [x] Add bounded public-only sitemap/robots, accurate canonical and
  social metadata, inert visible-content structured data and private/demo
  exclusion. Preserve real product links and existing card interaction.
- [x] Prove sitemap pagination and tenant/publication scope, stale/foreign and
  demo noindex, query/ref canonicalization, JSON-LD injection denial and actual
  server HTML. Pure, read-only PostgreSQL and HTTP receipts are in
  `.local/seo-fe071/review.md`; global types remain a shared S145 gate.
- [x] Add a visible, server-rendered `/showrooms` directory linked from
  About so real public business/product pages have crawlable internal paths.
  Keep the same approved non-demo/public-product eligibility as the sitemap,
  bound pages with numeric keyset links, and show only safe listed city/category
  context. Pure, read-only DB and actual HTTP checks prove 24-row pagination,
  About→directory→showroom→product HTML, and invalid/exhausted cursor noindex.
- [x] Inspect affected public paths in installed Chrome at desktop/phone,
  including Market→About→directory→showroom→product, ordinary click, new-tab
  product open, Back, keyset canonical and Amharic phone copy. Captures and
  bounded request controls are in `.local/seo-fe071/chrome-receipt.json`.
- [x] Owner approved the new directory layout at desktop/phone for shared full
  checks after reviewing `.local/seo-fe071/current-review/screens/directory-1440-en.png`
  and `directory-390-en.png`. The existing local merchant test description is
  not approved as final marketing content; no deployment was authorized.
- [x] Owner confirmed Prairie Meadows is a real business that should remain
  discoverable. In the local preview only, replace its repeated test About text
  and blank search/sharing description with concise copy grounded in its listed
  Dodolla grass product. Protected before-image, versioned admin UI saves and
  authoritative readback are under `.local/prairie-copy-s146/`; actual Chrome
  desktop/phone directory and showroom evidence is in `receipt-verify.json`,
  with the settled desktop directory recapture in `receipt-directory-final.json`.
  The hosted record was not changed; full gates and deployment remain pending.
- [ ] Join the current final candidate's one full check/release/acceptance chain
  after all S145 focused and visual dependencies. Existing earlier gate receipts
  do not certify the newer SEO source.
- [ ] After the reviewed MirtPage hosted cutover, verify the active canonical
  origin and public sitemap/robots/product HTML. Search Console setup/submission
  and indexing outcomes require separate actual provider evidence.

### S146 — administrator-controlled staff business management (LOCAL; release pending)

This follows S145's currently reviewed local migration75 and release work; it
does not replace or certify any earlier S145 gate. FE-072/BE-060 and ADR-0030
supersede owner consent and per-business assignments in the local schema77
preview. The hosted site retains its prior authority until a separately reviewed
cutover. FE-073/BE-061/DEP-050 separately control owner email.

- [x] Resolve the owner Account settings navigation review: Chrome's retained
  pointer over Support must not look like a second selected destination on the
  nested email task. Keep exactly one current-page link and verify distinct
  hover/current styling in actual Chrome on desktop and the single Account tab
  on phone; FE-026. Installed Chrome showed one `aria-current`, a neutral
  Support hover, and a dark selected Account settings row at 1440px; the
  prior actual phone capture shows one selected Account bottom tab. Evidence:
  `.local/s146-browser-review/receipt-nav-hover.json`, `nav-hover-1440.png`,
  and `owner-email-change-idle-390.png`. The first browser aggregate is FAIL
  only because its phone step expected a drawer that owners do not have; a
  bounded corrected retry failed before browser navigation on a local Supabase
  Auth timeout. Neither limitation is a successful new phone E2E run.

- [x] Record the owner decision and Ready FE-072/BE-060 contract: all current and
  future platform staff start with one explicit all-business Manage businesses
  grant, administrator revokes/restores it per person, and chat roles remain
  independent. Account security and owner sign-in email are excluded.
- [x] Reconcile FE-026/FE-042/FE-053/FE-056, BE-009/BE-032/BE-033/BE-044,
  FE-038/BE-031 and master current/planned wording; validate reciprocal links
  and TRACEABILITY. Keep existing consent/assignment behavior current on the
  deployed site until its separately reviewed cutover.
- [x] After local schema75 and a protected exact beforeimage, apply the additive
  local staff-grant migration. The approved, guarded 75→77 transaction backfilled
  all 14 eligible staff as enabled; its independent readback proved ledger 77,
  three private RLS tables, preserved existing rows/schema and zero hosted writes.
  Receipt: `.local/mirtpage-rebrand-s145/local75-to77/attempt-20261019T024300Z/verified.json`.
- [ ] Complete the isolated migration replay/rollback and new-staff transactional
  tests, together with the remaining permission/ACL regression matrix. The
  successful local apply and backup do not substitute for those tests.
- [ ] Replace all business read/write/publication authority with fresh persisted
  role+grant decisions. Serialize revoke against in-flight edits; reuse existing
  business readiness, version, upload, suspension and audit rules. Prove revoked,
  missing-grant, forged-role, cross-tenant and account-security denial.
- [ ] Replace admin per-business Staff assistance with a focused per-person
  Manage businesses control; give granted staff a paginated Businesses directory
  and existing focused tasks. Remove Team editing from owner web, phone web and
  Expo; stale links/assistance commands fail safely. Keep Support/Transport
  queues and owner/private account tasks separate.
- [ ] Run focused security/integration/UI tests, then actual Chrome desktop/phone
  and Expo localhost:8082 owner/staff/admin flows with authoritative local DB/API
  readback. Capture current layout and obtain explicit owner visual approval
  before full `npm run check`, `npm run release` and acceptance gates.
  Partial local evidence: staff navigation (4/4), staff boundaries, business-team
  UI (3/3), web admin revoke/restore with DB versions 1→2→3 and authenticated
  POST, staff directory/chat separation, owner Your page/Cancel, and solid
  Tracking/Back passed. The first Chrome run caught a pre-hydration GET form bug;
  its correction was exercised by POST with no form-field query. The installed
  Chrome receipts are `.local/s146-browser-review/receipt-owner-selector-harness.json`
  and `receipt-remaining.json`; each aggregate remains FAIL because the former
  stopped on an ambiguous test selector and the latter used the wrong IPv4 Expo
  address. A subsequent focused Chrome staff-layout run passed the desktop
  badge/button non-overlap and 390px no-overflow checks; screenshots are
  `.local/s146-browser-review/admin-staff-detail-1440.png` and
  `admin-staff-detail-390.png`. Expo Tracking at `localhost:8082` passed through
  the real preview. An earlier genuine local OTP login established one owner page
  state, but not the complete navigation journey. A later run exercised owner
  Account→Your page→Page address→Cancel and absence of Team editing with real
  local Supabase token verification; it **route-fulfilled a successful OTP-send
  response** after the local email quota was exhausted. Its
  `.local/s146-browser-review/receipt-expo.json` PASS therefore describes
  partial UI coverage, not an end-to-end sign-in/workflow pass under the browser
  review contract. A subsequent source-bound installed-Chrome run at the Expo
  web preview `localhost:8082` completed a fresh real local Supabase OTP send,
  Mailpit delivery and verification with **zero application-response mocks**,
  then Account→Your page→Page address→Cancel. Its local DB readback confirmed
  the handle and version were unchanged; no application errors or uncontrolled
  map-tile requests were recorded. See
  `.local/s146-browser-review/expo-real-auth/receipt.json` and the paired
  `owner-account-real.png`/`owner-showroom-real.png` captures. This proves that
  specific Expo browser journey, not an installed Android workflow or email-
  change activation. The full check started after visual approval but was
  intentionally interrupted for newly found UI defects; its resumed run,
  release and acceptance results remain pending here.
- [x] Owner explicitly approved the combined staff, owner and Shipment Tracking
  layouts and proceeding to full checks. The visual approval is separate from
  the Expo browser workflow evidence. The later FE-073 wrapped-email and
  navigation-hover layouts received their own separate approval below. FE-071's
  showroom-directory visual approval remains a separate open item.
- [ ] Use a reviewed hosted backup, exact migration/apply authorization and
  monitored rollout for the grant; verify current role and revocation in the
  deployed app. A rollback must fence staff business editing rather than revive
  old assignment/consent authority for a revoked member. Source completion or
  local screenshots do not prove deployment.

### S146 — owner sign-in email change (LOCAL SOURCE; disabled pending rollout)

Local schema77 staged empty pending-request and session-fence tables without
rewriting owner identities. FE-073/BE-061 local Auth/Mailpit two-code proof and
focused owner/staff denial tests pass. The initiation flag remains off; this is
neither a hosted Auth configuration change nor an enabled customer workflow.

- [ ] FE-073/BE-061/DEP-050: owner-only Account settings task, code to the
  current address plus confirmation at the proposed address, secure provider
  dual confirmation, UUID-bound provider-to-`users.email` reconciliation and
  historical `email_at_link` preservation. Staff/admin business authority must
  never permit a direct Auth email mutation or bypass either mailbox proof.
- [ ] After the staff authority boundary, prove provider-backed local Mailpit/
  database success and failure paths, session denial after completion and
  account-erasure compatibility. Obtain desktop/phone/Expo visual approval,
  then full/release/acceptance evidence. Review exact hosted Auth fields,
  templates and notices under DEP-029 before any separate monitored rollout.
  No hosted Auth configuration change or email-change rollout is complete today.
- [x] Owner separately approved the focused FE-073 wrapped-email form and
  FE-026 Account navigation-hover layouts and authorized resuming full checks.
  The approval covers the reviewed desktop/phone visuals, not OTP delivery,
  account-email activation, the separate FE-071 directory, release or rollout.
  `npm run check` has resumed after the earlier interrupted attempt; no passing
  result is recorded yet.

### S146 — readable public information pages (LOCAL SOURCE; Tracking approved)

- [ ] FE-070/FE-049 legal copy: align Privacy/Terms with FE-066/BE-055 external
  product contact, retained private history, FE-072/BE-060 administrator-granted
  staff management and transport brokerage. Keep existing third-party,
  deletion and tracking disclosures. Regenerate active-language catalogs,
  run focused narrative/localization checks, capture desktop/phone Chrome legal
  pages, then obtain visual approval before full release gates. No provider,
  policy-declaration or hosted configuration write is part of this step.

- [ ] On Shipment Tracking and other public information pages, replace the
  decorative global canvas background with a solid MirtPage theme surface;
  preserve genuine showroom and product media. Verify Tracking readability and
  navigation in actual Chrome desktop/phone and Expo localhost:8082, capture
  visual states and obtain owner approval before the applicable full gates.
  Installed Chrome captures show no background image on Tracking, About,
  Privacy, Featured and Market at 1440/390px; the interactive web Tracking/Back
  journey and Expo Tracking render passed separately. Evidence:
  `.local/shipment-tracking-canvas-s146/actual/readonly-receipt.json`,
  `.local/s146-browser-review/receipt-remaining.json`, and
  `.local/s146-browser-review/receipt-expo.json`. The owner approved the
  Shipment Tracking layout in the combined S146 visual review; remaining
  information-page review and applicable full gates remain open.

### S146 — local Next.js dev-resource origin (DEP-027; local-only defect)

- [x] Reproduce with the same authenticated Chrome editor at both loopback
  hostnames. At `127.0.0.1:3102` the editor and language selector remained
  unhydrated and Next.js rejected `/_next/hmr`; at `localhost:3102` they enabled
  with one HMR connection, no console error and no application POST. Installed
  Next.js 16 documentation requires hostname-only `allowedDevOrigins` entries;
  the current config supplies host-and-port Server Action entries instead.
- [x] Keep DEP-027's exact Server Action and mutation origins, derive a separate
  hostname-only, wildcard-free dev-resource allowlist from validated origins,
  and prove the distinction with a focused regression test. The installed
  Next.js 16 guard test admits 127.0.0.1 HMR, denies an unknown host with 403,
  and confirms Server Action hosts retain exact ports. The unrelated localhost
  editor save returned 403 with no data write; this dev-resource correction did
  not broaden its mutation policy.
- [x] The parent agent restarted the local web server, then repeated the
  authenticated `127.0.0.1:3102` Chrome hydration check and ran focused type,
  spec and whitespace checks. Chrome receipt
  `.local/dev-origin-s146/receipt.json` proves the About field and language
  selector enabled, one HMR connection, and no console errors or app POSTs.
  `npm run test:local-supabase-readiness`, `npm run typecheck`,
  `npm run validate:specs` (217), and `git diff --check` pass. This fixes only
  local dev resources; no business data, application schema, production origin,
  hosted Auth or deployment change occurred. The browser checks created only
  local Auth test sessions.

### S146 — active account-copy brand parity (FE-070/FE-049; local source)

- [x] Correct the two reachable Amharic/Afaan Oromo account-deletion and Expo
  staff-sign-in notices in `locales/interface.tsv`; preserve historical catalog
  rows and runtime compatibility identifiers.
- [x] Regenerate message catalogs and prove the two active keys reach web/Expo
  client rendering with MirtPage and without the old display name.
- [ ] In actual Chrome, review account deletion at desktop/phone web and Expo
  phone in both active languages, plus the Expo staff-denial message; capture
  settled screens and request/error evidence. Obtain visual approval before
  full release gates; this source correction does not publish either app.
  Focused localization (22 frontend, 4 backend) and spec validation (217) pass.
  `.local/account-brand-s146/receipt.json` records five settled Chrome
  account-deletion states across web desktop/phone and Expo phone, with zero
  browser errors. A real local admin sign-in reached the Expo owner-session API
  and received `403 staff_web_only`; its Amharic notice rendered. The capture
  retained the language sheet, and local Auth then rate-limited further OTP
  attempts, including a second existing admin identity. A settled staff notice
  in both languages remains pending; no Auth setting, production account or
  full release gate was changed for this copy correction.

### S146 — generated demo booth brand labels (FE-070; local source)

- [x] Inventory the 58 fictional demo booth SVGs, the generator, current label
  assertion and approved shared MirtPage identity. This is a presentation-only
  correction to illustrative demo media; no tenant, client or provider media
  changes. FE-070 states the exact scope and acceptance criteria.
- [x] Replace the single old platform label in each booth and in its generator;
  retain each business name, cue, geometry and palette. Raise only the sign
  label type size to keep it readable in phone cards. The focused FE-070
  regression checks all 58 files and generator output.
- [x] Parse all 58 SVGs and inspect three palette variants in installed Chrome
  at 1440/390; all six image loads pass without page/console/request errors.
  See `.local/booth-brand-s146/receipt.json` and the paired `booths-*.png`
  captures. The initial static-capture harness incorrectly assumed SVG
  intrinsic width 1200; its retained receipt and corrected assertion are
  separate from the successful actual render. No data or provider writes.
- [x] Owner approved the new demo-booth desktop/phone visuals and full checks
  after reviewing `.local/booth-brand-s146/booths-desktop.png` and
  `booths-phone.png`. This is neither Play-screenshot approval nor deployment.

### S146 — honest native empty product gallery (FE-053; local source)

- [x] Audit the real Prairie Meadows local media and retain the exact scoped
  plan in `.local/prairie-media-s146/review.md`. The owner approved clearing its
  unrelated local cover/product mockups and example videos. A protected exact-row
  before-image and validated full local database archive precede the saves;
  both original Storage objects retain their verified hashes.
- [x] Replace the empty native horizontal gallery with a localized, themed
  no-photo state; preserve non-empty gallery interaction and product details.
  Add an actual-component regression mapped to FE-053, without API/schema or
  media-object changes. `node --import tsx --test scripts/test-mobile-video.ts`
  passes 5/5; mobile typecheck and spec validation pass.
- [x] Exercise the affected product detail in Expo localhost:8082 at phone
  width with a labelled response-only zero-media fixture; capture the screen,
  request/console evidence and source-bound readback. Installed Chrome headless
  390×844 passes showroom→product→browser Back with no API/console error or
  write; `.local/prairie-media-s146/empty-gallery-expo-390.png` and matching
  protected receipt. Fixture changes only a demo product's response `media`
  array, not the database. Installed Android remains separate.
- [x] Obtain owner visual approval of the no-photo Expo screen for full checks.
  The approved local-only Prairie cleanup then used one authorized versioned
  page-editor save and one product-editor save. Local readback proves business
  content v6, draft v4, latest publication r3, product 286 still published with
  empty media and all non-media product fields unchanged; prior publication r2
  and both original Storage objects remain. Actual Chrome 1440/390 directory →
  showroom → product → Back and Expo 390 showroom → product → Back pass against
  the real local API/database, with no response fixture, error or unexpected
  write. Evidence and eight captures: `.local/prairie-media-s146/receipt-verify-after.json`.
  This does not change the hosted site or establish installed Android behavior.

### S146 — disposable browser acceptance startup (DEP-027; release gate)

- [x] Keep browser acceptance isolated when another project's local Supabase
  owns its default ports. An explicit unprivileged API-port override moves the
  whole disposable port family and preserves project-label/endpoint checks;
  invalid values fail before startup. The default family is unchanged. Focused
  port tests must pass before the source-matched release and acceptance gates.
- [ ] Keep the disposable CLI startup and provider readiness as separate bounded
  stages: allow up to five minutes for `supabase start --ignore-health-check`,
  then require the existing six-service and two-endpoint readiness check within
  its own five-minute limit. The combined Gmail/gallery release attempt passed
  compilation and trace checks but the old 90-second CLI bound exited 130
  before any provider assertion. Focused timeout tests and new source-matched
  release/browser checks are pending; do not count that attempt as a pass.
- [x] Classify the isolated acceptance failure as infrastructure: Supabase
  Storage needed about 177 seconds to become healthy, exceeding the CLI's
  initial health deadline; no application assertion failed. Preserve the
  original failed receipt and keep the developer Supabase project untouched.
- [x] Start only the disposable browser project with CLI health bypass, then
  require its six exact project-labelled services and Auth/API plus Storage
  loopback status responses before setup, build or Playwright. Bound the
  independent wait to five minutes, fail closed and retain project-only cleanup.
  Add focused delayed-success, wrong-project, endpoint-failure and timeout tests.
  The six-service inspection and both real loopback status paths are verified;
  six isolated unit cases, the full local-readiness group and 217-spec validation
  pass. This is a harness check, not a passing browser journey.
- [ ] Re-run focused checks, then the source-matched isolated browser acceptance
  gate. Record both the old infrastructure failure and new result; do not call
  a harness fix an application workflow pass by itself.
  The first full run reached all 20 cases: 18 passed. One legacy capture found
  both visible and hidden copies of the same text; the other sign-in hit the
  disposable Auth project's two-email hourly limit on its third test account.
  Scope the former assertion to visible copy and raise the latter limit only in
  the disposable browser config, then rerun all 20 without weakening assertions.
  The next full run passed 19/20. Its sole remaining capture expected the
  retired per-business Staff assistance editor; FE-072 intentionally redirects
  that URL to the Staff directory. Assert the redirect and directory heading,
  then exercise the long owner workflow and full browser suite again.

### S146 — GitHub product-gallery navigation correction (FE-050; release gate)

- [x] Diagnose draft MirtPage PR #36 browser failure against the exact CI
  assertion and track measurements. The first slide was visible at scrollLeft 0,
  but Photo 2 remained selected after immediate keyboard navigation and return.
- [x] Keep arrow, keyboard and thumbnail selection synchronized with the visible
  slide even when the visitor reverses direction before movement completes.
  Preserve touch swiping, snap layout, video unmounting and reduced-motion
  behavior; add position/state assertions to the existing actual-Chrome workflow.
  Actual component plus repository CSS pass keyboard, rapid reverse, arrows,
  thumbnails, selected/inert state and no-error checks in Chrome at 1440/390/320;
  captures are in `.local/github-pr36-gallery-review/harness/`.
- [x] Owner approved the desktop/phone gallery interaction review and full
  release checks after the actual Chrome 1440/390/320 exercise.
- [ ] Rerun source-matched browser acceptance and release checks. Push a focused correction only after
  the relevant checks pass; confirm every GitHub job on the new head commit.
  The full local acceptance runner could not start because an unrelated
  Loadgistic Docker test occupied its port 56322. One ignored port-isolated
  retry stopped before app assertions (`supabase start` exited 130); no external
  database, provider or production setting was changed.

### S146 — Gmail shipment and staff email option (BE-018/050/058, DEP-043/048)

- [x] Keep the existing durable shipment and overdue-staff outboxes, Resend
  adapter and local Mailpit path. Add an explicitly selected Gmail SMTP adapter
  with server-only credentials, fixed TLS endpoint, sender bound to the Gmail
  account, bounded timeouts, no secret logs and deterministic Message-ID.
  ADR-0031 records that SMTP acceptance is not inbox delivery and a rare
  duplicate can follow an ambiguous send despite the existing bounded retry.
- [x] Test valid, invalid, missing-credential, provider-failure and localized
  message cases with injected SMTP; preserve the existing Resend/Mailpit cases.
  Nineteen focused mail tests, strict TypeScript, 218-spec validation and
  Netlify-readiness checks pass. The pinned Nodemailer version adds no audit
  advisory; the pre-existing twenty high build-tool advisories remain separate.
- [ ] Run source-matched full release and browser checks on the combined Gmail
  and gallery candidate; commit/push with task-scoped staging and verify PR CI.
- [x] On the exact production Netlify site, set only server-side production
  `MIRTPAGE_TRANSACTIONAL_EMAIL_PROVIDER=gmail-smtp`,
  `MIRTPAGE_SMTP_USER` and `MIRTPAGE_SMTP_APP_PASSWORD` from the owner's same
  Gmail account, without reading or copying masked Supabase Auth SMTP secrets.
  Metadata-only readback confirms all three production values are present on
  the verified `africmade` site, the app password is secret-scoped, and no
  nonproduction context has a value. No credential bytes were logged.
- [ ] Redeploy and prove a labelled tracking code, shipment detail and overdue
  staff alert reach the intended inbox before calling hosted email live.

### S147 — Netlify showroom packaging correction (FE-071, DEP-049)

- [x] Diagnose the source-bound Netlify candidate failure: Next compiled, then
  Netlify Edge packaging rejected the `pg` driver imported by `proxy.ts`.
  Preserve both failed local build receipts; neither deployed or changed the
  provider. The five approved public URL settings were independently read back.
- [x] Keep the real 404/noindex and active/suspended showroom contracts while
  moving the indexed public-status query to a bounded same-site Node endpoint.
  Remove the PostgreSQL import from the Edge proxy and keep Auth refresh there.
- [x] Prove the Edge origin guard, unknown 404, active 200, language handling,
  ordinary return navigation, and clean Netlify Edge packaging. The local Node
  route returns 204 for an active public handle and 404 for an absent handle;
  the existing FE-071 HTTP test checks a draft when its fixture exists.
  Installed Chrome passed ten checks at desktop/phone with synthetic map tiles.
  The new desktop/phone 404 PNGs are byte-identical to the previously approved
  visuals. The initial broad SEO run stopped on an empty local database; the
  second stopped because disposable demo seed has no real directory business.
  These fixture limits do not qualify the entire SEO workflow. See the private
  S147 Chrome and Netlify diagnostic receipts; no artifact was published.
- [ ] Freeze the corrected source, rerun full release/acceptance gates, commit
  and push the focused correction, verify remote CI, rebuild the exact commit,
  preflight artifacts, and deploy under the guarded one-use plan.

### S148 — repair MirtPage's published minute worker (DEP-043, DEP-049)

- [x] Diagnose the live startup failure from sanitized function logs: the
  scheduled bundle imports `next/headers` through shared security utilities,
  so routing, inactivity maintenance, notifications, and email never start.
  Public page/API health is separate evidence and does not qualify this worker.
- [x] Separate pure worker-safe security utilities from request-only Next.js
  access. The request and pure adapters produce identical hash/text results;
  the Netlify 5.16.3 packaged worker has no Next request import and loads its
  minute schedule/handler from ZIP SHA-256
  `81b1cbd6beb8e96db9871fa2f0807f8c648c27e41f8d3f4eb3a6b5b53381d62e`.
  No UI/layout or schema change was made.
- [x] Run focused security/worker tests and the applicable full release gates;
  commit/push only task paths, verify remote CI and source-bound Linux bundle.
  Focused PostgreSQL attention tests, `npm run check`, and the isolated clean
  web `npm run release:web` are green. The first release attempt lacked the
  isolated web install, the second had a transient disposable Auth identity
  failure, and the third lacked the clone's local PostgreSQL test setting;
  the final isolated run passed without weakening a check. Commit
  `c176167` was pushed to `release/mirtpage-launch`; GitHub run
  `39404830157` passed all five jobs on its one controlled rerun after a
  disposable PostgreSQL connection failure. The Linux Sharp/libvips packages
  match the lockfile integrity and server ZIP SHA-256 is
  `6b96c439261d4b9d9c178c9773f4efe0c88594ec583bb51301d214f3998fc1dc`.
- [x] Prepare an exact protected Netlify repair plan with prior deploy retained;
  obtain separate owner approval, publish, then monitor worker invocations and
  confirm due chat/email jobs advance before claiming recovery. Owner approved
  plan digest `228b411f11aac809d72b58c966bc631b3cbd644d366f315f62f0cf0b1c6e9442`.
  Netlify production deploy `6ad73e5a9df2756523e8ac95` passed six public
  route checks. Monitored minute invocations completed routing, inactivity,
  reply escalation, tracking cleanup, and configured Gmail dispatch without
  a startup error. The first live backlog routed three waiting chats and
  reported two SMTP-accepted admin alerts; the following observed invocation
  routed zero chats and had no pending or failed email jobs. Inbox receipt and
  a new labelled end-to-end chat remain separate workflow checks.
