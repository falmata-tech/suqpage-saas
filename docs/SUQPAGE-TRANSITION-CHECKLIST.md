# MirtPage active delivery checklist

Current product authority: [master brief](../SUQPAGE-MASTER-PROMPT.md).
Requirements and evidence: [traceability](../specs/TRACEABILITY.md),
[DEP-049](../specs/deployment/DEP-049-mirtpage-domain-and-app-cutover.md).
Updated 2026-10-23. This working board replaces dated `CURRENT` labels; it does
not authorize a provider write or rerun an already completed migration/build.

## Current position

MirtPage is live at **mirtpage.com**. The approved additive production migration
to schema **79** committed on 2026-10-23: read-only incident follow-up confirms
the exact ledger, row-level security and unchanged 102 existing inquiries. Its
one-use runner returned permission error `42501` only on a post-commit read without
the migration role; do not retry or restore it. The protected backup and plan
remain local. The current launch-parity branch passes `npm run check`, a clean
web-only `npm run release:web` with zero dependency findings, and a serial
`npm run test:acceptance` with 20/20 scenarios on patched Next.js 16.4.2.
The first concurrent acceptance attempt retained its one transient private-media
connection reset; the isolated journey and subsequent complete serial suite pass.

**Next delivery dependency:** review/stage this branch, commit and run the five
required GitHub checks; then qualify the exact Netlify artifact and one locally
signed Android bundle/APK. The new UI and API source is not yet on the live site
or in a newly built Android release. The Android package remains
**com.mirtpage.app**; the old Suqpage enrollment does not transfer. Prior B09
image-routing publication is verified. Raw browser request-cancellation causes
and installed-device/Play delivery remain separate qualifications; do not infer
them from web/Expo acceptance. No new Play upload, twelve-person opt-in count or
fourteen-day test is claimed.

## Surface status

| Surface | Implemented | Tested | Visually approved | Deployed / delivered |
| --- | --- | --- | --- | --- |
| B01–03/B06–08/B10 cards, navigation, loading, sponsors and categories | Yes | Focused + d78 full gates/CI; current recovery gates separate | Updated B01–B10 batch approved | Web images/layout/navigation verified on replacement deploy; browser cancellations unresolved; Android static only |
| B09 physical image routing correction | Yes, exact alias-only file | Focused + c6dd composite check, release, 20/20 acceptance, CI and final local admission pass | Nonvisual correction; no geometry changed | Published/ready; independent inventory + GET/worker pass; Chrome journeys pass but overall receipt false for retained aborts |
| B04/B05 demo contacts/catalog cleanup | Applied exact finite operations | Independent complete readback | Separate actual data/settings approvals | Live; no repeat data write needed |
| Opaque Auth-email logo | Source + public PNG + thirteen HTML templates | Pixel/template/Chrome/local gates and guarded hosted readback | Approved light/dark visuals and exact hosted change | Applied/read back; no email sent by this operation, actual inbox rendering remains separate |
| Owner sign-in email change | Local guarded source/schema | Local two-mailbox/provider/security proof | Prior reviewed layouts; current hosted behavior unqualified | Initiation disabled; exact Auth/settings/notices gate pending |
| Android version 2 | Compiled once from d78 | Independent static inspection | Approved shared layouts; genuine native captures pending | Local artifact exists; phone/OS/Play delivery unverified |
| New MirtPage Alpha | App/listing/tester list saved | Prior console reloads; fresh admission pending | Logo/charcoal graphics approved | No MirtPage release/12 actual opt-ins/14-day test claimed |
| Workflow/skills/docs consolidation | Skills/checker and reviewed compact docs committed/pushed | App CI passes on 7e; isolated L0 docs checks and root review pass | No UI change | Docs branch integration and actual skill selection remain separate |

## Ordered work

### S161 — Shipment record terminology and future party access

Owner direction: use **Shipment records** for the recipient's list and
**Shipment record** for one arranged journey. Show the selected logistics
company's identity. Future records identify shipper and receiver as a published
MirtPage business or custom party; each selected email verifies separately for
read-only access to that one record. Use a business's published contact email as
the default, never its private sign-in/notification email. No discount is
automatic; any offer belongs to the logistics provider. Current transport chats
continue to MirtPage's internal staff.

- [x] Record the product direction and security boundary in draft FE-077/BE-064.
- [x] Update current web, mobile web and Expo labels/copy to Shipment record(s),
  keeping technical `/tracking` routes and API names stable. The supplied
  SharedTrucks Logistics wordmark, including its name, renders on list and detail.
- [ ] Run focused localization/UI tests and actual Chrome/Expo review of the
  recipient list, record detail and staff workspace. Capture desktop/phone states
  and record an agent visual pass/fail decision before complete release checks.
- [ ] Keep FE-077/BE-064 draft-only until an explicitly scheduled multi-party
  shipment milestone. Before implementation, qualify additive grant storage,
  per-party verification/revocation, contact snapshots and rollback. Do not alter
  live data or add provider-owned routing under this task.

Root owns integration, source freeze, shared files, Git/CI and hosted operations.
Use bounded agents for independent work; do not replace earlier open requests.
A checked task requires its named evidence. Keep **implemented**, **tested**,
**visually approved** and **deployed** separate; an older approval only covers its
reviewed scope. Resume at the first unmet dependency.

### V01 — Retire this repository’s Vercel publishing connection

Owner request: remove Vercel from MirtPage. DEP-002/DEP-023/DEP-026 control this
one-time retirement; Netlify remains the production host. This docs-only task is
isolated from R02 and does not change application or native artifacts.

- [x] Inventory the exact repository connection and active instructions. The
  Vercel GitHub App publishes previews for `falmata-tech/suqpage-saas`; its status
  points to project `falmata-ds-projects/mirtpage`. No tracked Vercel hosting
  configuration, direct package dependency or npm deployment command was found.
- [x] Correct current hosting instructions, mark the old DEP-023 topology
  historical/superseded, and retain immutable IDs, prior evidence, portable
  framework dependencies and `.vercel` privacy exclusions.
- [x] Focused L0 checks pass: 219 specs/ADRs, existing workflow plus 14 static
  checker regressions, five selected script checks, 688 local destinations/anchors
  and whitespace. The two template placeholders were excluded after a retained
  first coverage-harness failure; no application or managed failure was hidden.
- [x] Root reviewed the exact nine-file docs-only diff and managed-result update.
  Visual approval is inapplicable; no build or CI rerun belongs to this L0 patch.
- [x] Commit/push the reviewed nine-file scope as `3c1b5391ce12deb8565bde4a44e8aca31710f783`
  on `docs/dep-002-retire-vercel`; unrelated work and artifact refs are preserved.
- [x] Verify the exact project/repository, retain the before-state and disconnect
  only that Git connection. Fresh provider reload confirms the removal on
  2026-10-20; project/deployments and the account App installation remain.
  Netlify, domains/secrets and other repositories were not changed. Protected
  `workflow-improvement-research/vercel-retirement/result.json` records the result.
- [x] After that normal push, GitHub reads at 2026-10-20 23:34:18 UTC observe
  zero status contexts, check runs or deployments for `3c1b539`. Protected
  `vercel-retirement/post-push-observation.json` records this point-in-time
  no-trigger observation, not a permanent guarantee. No required CI jobs were
  triggered by this non-main/no-PR push; the empty aggregate’s `pending` label
  is neither queued CI nor green checks.

### R01 — Finish B09 source and CI qualification

[DEP-049](../specs/deployment/DEP-049-mirtpage-domain-and-app-cutover.md),
FE-021, FE-053, FE-074; depends on the frozen source above.

- [x] Implement the bounded routing fix: remove only the manual physical image
  rule, preserve all seventeen aliases, official url/w/q captures, IPX
  compatibility, fallback order and the exact function image exclusion.
- [x] Focused routing/private-media regressions pass; this correction changes no
  UI geometry or native/runtime-function source. Preserve original failed proof.
- [x] Admit terminal composite check (all 77 commands), clean web release and
  20/20 full acceptance on c6dd. Preserve the failed full check and isolated S140
  pass; no skipped commands, increased timeout or fabricated raw exit-zero claim.
- [x] Review/stage exact task files and push `a153547` and `7e24014`. Preserve
  unrelated `deno.lock`; no history rewrite or force push is implied.
- [x] Verify all five remote jobs green on `7e24014` in run `39509285979`
  attempt 2. Preserve the original core fixture failure and its unchanged retry.

### R02 — Published B09 recovery; classify browser cancellations (CURRENT)

Depends on **R01** and the consumed exact DEP-049 recovery approval. Published
`6ad7f59795812d9f56be42a2` is independently verified ready; the original operator
stop remains a stop, not a fabricated successful apply result.

- [x] Assemble the complete deployment with only the corrected physical
  `_redirects` bytes changed. Retain byte-identical virtual config, both Linux
  function ZIPs, worker schedule, completed edge artifacts and all three deploy
  blobs. Local manifest/lineage, 114/114 focused tests and actual `--check-local`
  admission pass; successful final CI is bound (traceability E5).
- [x] Prepare/read back the exact site/account/domain/deploy plan and obtain the
  owner’s exact recovery approval. Source is `7e24014`/c6dd; compiled runtime
  remains `d78dcf5`. Consumed authority does not approve another operation.
- [x] Run the single approved operation. It stopped at
  `same_deploy_manifest_update`; preserve that receipt and its unproven cause.
  Subsequent read-only qualification independently finds this deployment ready
  and published, with 786/786 content hashes/sizes, no missing files, both exact
  function hashes and all 41 environment fingerprints unchanged. Five metadata
  paths require unique ASCII-case mapping; exact path bytes are not proven.
- [x] GET monitor records 26 checks, zero failed checks, decodable original and
  384/640/3840 optimized images, public API/private nonexistent-fixture checks and
  the automatic scheduled worker passing. `/.env` remains generic public HTML
  with HTTP200: a known limit, not a 4xx privacy pass or universal secret proof.
- [x] Actual Chrome records nine widths with no overlap/overflow and decoded
  images; 1024/390 card → preview → showroom → Back journeys complete with zero
  page errors/blocked writes. Its overall `passed: false` is preserved for eight
  unclassified aborted fetches; task success does not erase network evidence.
- [ ] Classify the retained request cancellations. A separate instrumented journey
  completes without page/HTTP failures but retains six HTTP200 RSC cancellations;
  only one analytics abort is proven to be the local test harness. It cannot
  retroactively classify the original eight. Do not claim an all-green browser
  result or complete web qualification from the successful visible journeys.
- [x] Record exact source/deploy/CI/receipt identities and limits in traceability
  E5/DEP-049. Database, Auth, DNS, email and signing were outside this deployment;
  no automatic retry/restore or new production operation follows these receipts.

### R03 — Reconcile public and management workflows

#### S168 — timely staff reply must keep Transport live (release-blocking defect)

The full support gate found that a later staff reply replaced the earlier
timely one in the deadline query, making a valid live case look overdue.
BE-018 and FE-019 own this correction.

1. [x] Record the first-public-reply rule in BE-018 and FE-019 before code.
2. [x] Use that same server-authoritative timestamp in guest and owner receipts,
   deadline enforcement, web and Expo. Preserve a late-first-reply handoff.
3. [x] Prove timely-then-late reply and reassignment with focused PostgreSQL/model
   tests, web/Expo Chrome and 38 affected UI cases; the first timestamp is queried
   outside the bounded transcript. All 20 remaining check stages pass. Protected
   evidence: `.local/s168-support-response.log`, `.local/s168-focused-ui.log`,
   `.local/s168-check-tail.log`, `.local/s168-browser-review/receipt.json`.
   Raw web GET abort provenance stays open; installed Android is separate.
4. [ ] Carry the passing correction into the S162 GitHub, web and Android gates.

#### S162 — professional SharedTrucks live wait and callback handoff (CURRENT)

Owner direction: state plainly that a live agent from the selected logistics
service provider will join to arrange the shipment. Do not use “coordinator.”
Until provider-owned staff accounts are implemented, MirtPage support staff
operate the internal queue on the provider's behalf; provider-owned routing is
still future work. The assigned staff response cycle becomes overdue after two
minutes; retain the bounded staff alert/admin email path and privacy rules. At
2:00 show that the provider's team is busy and an elapsed wait counter. At 3:30,
without Join/reply, stop the live chat and replace it with a callback form.
Prefill the already captured phone, allow correction and optional email, require
at least one valid contact, then submit one follow-up into the existing staff
case. After success show a static receipt only. Stop both conversation and
unread-alert polling at timeout; do not keep a public message portal open. The
internal case stays available for staff to call/email and is not resolved or
reclassified as a new shipment. No draft is auto-sent. Unassigned work keeps its
separate ten-minute manager alert and is never blamed on an absent agent.
Existing visitor/owner idle clocks remain unchanged outside this no-agent handoff.

1. [x] Record the corrected 2:00 staff-overdue and 3:30 callback limits in this
   checklist and FE/BE/notification specs before changing production code.
2. [x] Change assigned response projection, queue filtering, bounded escalation
   sweep and precise tests to 2:00; retain ten-minute unassigned escalation,
   assignment epochs, deduplication, privacy, no-catch-up handling and worker
   bounds. No schema change is expected. Pure assigned/unassigned boundary
   checks and local API/PostgreSQL workflow readback pass.
3. [x] Keep server-created wait timestamps and server-clock samples authoritative.
   At 3:30 the active no-agent conversation must present the same deadline in
   web/Expo and enforce it on the server; stale DTOs, sleep, reconnect or late
   replies cannot reopen the live portal. The earlier same-thread composer test
   found a transient Expo clock race; retest monotonic phase changes against the
   callback form.
4. [x] Add an idempotent offline-follow-up action that saves corrected phone,
   optional validated email and the request to the existing staff case, without
   creating a new shipment or resolving/removing the case. Reject live public
   reply/read actions after the no-agent deadline. Use the existing bounded
   support queue and preserve rate limits, participant authorization and privacy.
5. [x] Replace the live UI at 3:30 with a concise callback form; prefill phone,
   offer optional email and require at least one valid channel. On success show a
   static receipt naming the contact channel(s). Stop transcript and unread-alert
   polling. Author English, Amharic and Afaan Oromo by meaning; test 320/390/
   desktop layouts and validation/error/retry states.
6. [x] Run focused wait-boundary, response-deadline, callback idempotency,
   privacy, localization and type checks. Actual Chrome starts a labelled journey
   in Expo 390, then completes callback flow on web 1440/390; local PostgreSQL
   confirms one same-case callback, contact values, staff visibility and no public
   reads/polls after timeout. Cover guest and owner scopes, lost-response retry,
   and staff phone/email follow-up. A fifth prior shared-preview start was rate-
   limited before chat creation; do not bypass it. The old shared journey proved
   only the superseded composer path; do not cite it as new-flow evidence. Raw web
   `GET /api/public-support` cancellations remain unclassified. The passing
   `.local/s162-transport-review/callback-journey-summary.json` records Expo,
   desktop/phone web, same-case database readback, zero settled polling, and
   Amharic/Afaan Oromo; focused callback/API tests and the complete local checks
   pass. Installed Android and hosted email delivery are separate.
7. [x] Verify owner transport, staff inbox/Join/reply/read, and assigned
   two-minute overdue/admin-email delivery against the local API/database.
   Unassigned ten-minute handling and existing alert privacy must remain intact.
   This is local adapter/sink evidence, not proof of hosted email delivery.
8. [x] Complete the remaining affected owner/staff journeys, then record a
   source-bound agent visual pass/fail decision under DEP-002 S165 before full
   `npm run check`, acceptance/release gates or remote CI. The owner and staff
   receipts and `.local/s166-agent-visual-review.json` record the passing local
   decision; installed Android remains a separate gate.
9. [ ] After a passing agent review, qualify current source/repo/PR with the GitHub workflow;
   then use DEP-049 to qualify and deploy web and build one Android artifact.
   Record each approval, CI, deploy and artifact separately; no secrets or
   customer data in repository evidence.

Future direction recorded, not in current scope: if staff call and invite the
visitor back to live chat, use a one-time case-bound code (expiring,
attempt-limited and single-use). Activate polling only after code redemption.
Do not implement this until a separate spec defines code delivery, verification
and session behavior.

#### S163 — end a timed-out request and start another (CURRENT defect)

The reported transport chat displayed End chat but the server refused it after
the 3:30 handoff; its submitted-callback receipt offered no new intake. BE-018
and FE-019 own the corrected authority and web/Expo behavior.

1. [x] Record timeout-close and callback-receipt contracts before code.
2. [x] Permit one authorized explicit close after handoff, with regression for
   the exact deadline, duplicate close, foreign token and no callback creation.
3. [x] Add Cancel request to the callback form and Send another request to its
   static receipt on web and Expo; verify old-case retention and fresh-intake
   identity without background polling.
4. [x] Run focused API/PostgreSQL and Chrome workflows, capture phone web/Expo
   screens and record a passing agent visual review for this scoped defect.
5. [ ] Requalify revised source, GitHub PR/main, web deploy and one locally
   signed Android artifact under the S162 and DEP-049 release gates.

#### S164 — name businesses without exposing location-mode jargon (CURRENT defect)

The first S164 visual review was rejected: the internal **City only** label
appeared on visitor-facing web and Expo pins/previews. FE-021 now requires the
business name and actual city only, including accessible names and group cards.
Owner location choice uses plain action language. No coordinate or clustering
change is needed.

1. [x] Record the corrected web/Expo marker, preview and owner-choice wording in FE-021.
2. [x] Remove internal location-mode text from visitor UI on web and Expo;
   keep the business name, city and current touch/accessibility behavior.
3. [x] Add focused marker regressions and inspect actual Chrome desktop, phone
   web and Expo screens using synthetic tiles. Source-matched walkthrough:
   `.local/s164-marker-review/clean-public-copy/receipt.json`. The local
   web/Expo owner setup and saved-location journey also passed via
   `capture-signup-city.mjs` after the label change.
4. [x] Record a passing agent visual review of the source-matched pin,
   preview and owner-choice screens under DEP-002 S165. Include this fix in
   the pending GitHub/web/native delivery batch.

#### S166 — owner transport new-request route stays in sync (CURRENT defect)

The local owner walkthrough reproduced a route mismatch: after Start and End,
Send another request changed the URL to `?new=1` while the ended chat stayed
mounted. FE-019 S162 owns this same-account new-request contract.

1. [x] Record Start → End → Send another request, case retention and router/URL
   consistency in FE-019 before production code.
2. [x] Replace the address-bar-only case selection with a Next router transition;
   keep the validated case ID and owner draft behavior. Focused React owner
   workspace tests pass; real Chrome reached the fresh web intake.
3. [x] Prove the transition in focused React and actual Chrome owner web/Expo
   journeys. Confirm the ended database case remains, the fresh intake appears,
   and Chat history still reaches the original reference. Compact the Expo owner
   intake utilities and keep the shared Afaan Oromo language control within
   320px; inspect 320/390 in English, Amharic and Afaan Oromo under FE-053.
   Record an agent visual decision under DEP-002 S165. Local Chrome web/Expo
   owner cases, database readback and English/Amharic/Afaan Oromo 320/390 captures
   pass; `.local/s165-owner-transport-browser/receipt.json` and
   `.local/s166-agent-visual-review.json` record the evidence and limits.
4. [ ] Include the fix in the S162 full gates, GitHub integration, web rollout
   and locally signed Android artifact.

#### S167 — align unpublished Android listing and campaign draft (CURRENT)

1. [x] Record current Inbox, selected logistics provider and Shipment records
   claims in FE-070 before changing launch drafts. Keep live movement and
   provider-owned tenant accounts out of current claims.
2. [x] Update English, Amharic and Afaan Oromo Play/campaign drafts using active
   interface terminology; preserve draft and native-speaker-review status.
3. [ ] Run the focused draft/copy assertions and include this source in the
   release gates. Do not describe draft copy as published Play content.

### S153 N16 — localized login showroom headline

- [ ] Confirm the two authored Amharic/Afaan Oromo headline values and controlling
  copy contract; English and login behavior remain unchanged.
- [ ] Replace only those values with natural digital-showroom wording, then run
  focused localization/narrative/spec validation.
- [ ] Retouch both languages on the existing physical development client and
  include the text in the existing batch visual review; no new native build.

### S153 N15 — restore foreground transport polling after Send

- [x] Retain the actual foreground stale UI/backend difference and normal
  Back→dock same-case recovery; pause the lower-priority N12 compact layout work.
- [x] Record FE-053 cancellation/renewal/focus/closed acceptance before code.
- [x] Reproduce with actual Buying React source, signal-aware settling/held
  cancelled reads and paused virtual time. Normally rejecting aborts pass; a held
  cancelled read starves the old loop. Preserve the initial clock-fixture failure.
- [x] Root authorized generation-owned read leases, current-only rescheduling and
  existing-cadence mutation wake. All26 race/idle/owner/storage tests, mobile/test
  types and219 specs pass; no layout, API or credential behavior changed.
- [ ] Current physical step: verify the same case updates messages/read state
  after Send without leaving. Native abort settlement, DEV Fast Refresh effects
  and release-build reproduction remain unproven; combine the verified fix with
  existing visual/full/release qualification.

### S153 N14 — linked staff assignment eligibility

- [ ] Define BE-018 Supabase-mode assignment eligibility using the existing
  immutable Auth link, while retaining the established legacy-runtime behavior.
- [ ] Reproduce legacy/unlinked immediate selection and worker/recovery cases
  with isolated managed-mode fixtures; preserve workload fairness beyond100,
  explicit new assignment, and no identity creation as regression invariants.
- [ ] Dependency: finish source-pinned paired case70 and obtain root GO before
  touching the combined production support adapter; do not reshuffle old cases.
- [ ] Apply only the reviewed eligibility correction and pass the focused RED/
  GREEN and existing queue/security tests.
- [ ] Separately verify actual local autoassignment to a usable staff identity;
  retain ordinary login and Join/reply evidence. No provider/link/role mutation.

### S153 — native conversation density and inactive-pane accessibility

- [x] Retain physical waiting-chat geometry as N12 and the installed RNWeb
  inactive-pane gap as N13 in the existing S153 issue inventory. Modal screenshot/
  XML timing and verbose Android hierarchy limits remain classified separately.
- [x] Record FE-019/FE-053 acceptance before production edits; master §§13/19
  already govern task-first chat and inert hidden controls.
- [x] Preserve native flags and add only explicit browser hidden/inert state to
  the existing Market panes. Old source fails the new regression;23 focused
  actual-source/installed-web cases, mobile/test types and219 spec links pass.
- [x] Actual Expo Chrome390/1440 passes272 Tab/Shift+Tab steps, real accessibility
  exclusion, mode/handle switches and About→Market return with Products/camera/
  zoom restored. The corrected map-remount harness assumptions and prior stops
  remain retained; no page errors, failed requests, writes or public tiles.
- [ ] Include N13 states in the existing batch visual review before full gates.
- [x] N12 dependency: paired audit and N15 diagnosis are complete; root authorized
  the layout-only correction after its26 focused polling/state tests passed.
- [x] Compact active utilities/status and place the single End action near the
  status. Intake and N15 polling bytes are unchanged. Installed RNWeb passes18
  locale/role/viewport states plus enlarged-text stress;38 state/race/idle/owner/
  storage tests qualify in composite after the retained raw-div style-port failure
  is corrected. Mobile/test types and219 specs pass; no shared copy changed.
- [ ] Current N12 step: review actual Expo and physical Fast Refresh on phone/
  landscape/keyboard; include affected states in the existing combined review.

### S153 — main navigation selected state

- [x] Preserve the ordinary local-code owner Account success and classify its
  missing DOM selected state as the installed React Native Web mapping gap.
- [x] Apply FE-053's explicit tab-selected attribute while preserving native state
  and route behavior. Prove old-source RED and focused native/installed-web checks,
  then freeze: nine tests and mobile/scoped types pass; actual extra owner task,
  Support and sign-out review remains coordinated separately.

### S153 N07 — owner history empty-state correction

- [x] Classify existing phone XML: both empty Support pager buttons are disabled;
  the defect is missing empty guidance and unnecessary controls, not paging access.
- [x] Apply FE-019's ready empty/single/multiple-page presentation contract to
  native Support and Transport history, preserving composer and retained state.
  Existing actual-source/React regressions pass 24 tests; mobile/scoped types and
  219-spec validation pass. Source is frozen; these are controlled component tests.
- [ ] At the coordinated local readiness checkpoint, review actual Expo and the
  admitted development client; include N07 in the existing combined visual review.
  No backend, email, navigation redesign or additional full gate is implied.

### S153 — PostgreSQL idle-disconnect containment

- [x] Inspect the actual pool factory and installed driver, then retain a
  controlled old-source RED: idle disconnect escapes without a pool listener.
  The lost local web/worker process cause remains unproven; no database was used.
- [x] Implement BE-027's factory-only sanitized handler and prove idle eviction,
  fresh-client recovery and unchanged query/transaction rejection with the actual
  installed driver and non-network Client port. Three focused cases pass; the old
  adapter fails the real idle-event case. Existing gate registration, scoped types,
  static script and 219-spec checks pass; no supervisor or running-stack changes.
- [ ] Include the reviewed backend patch in the existing combined qualification;
  preserve full-gate and runtime monitoring limits rather than claiming an outage
  rehearsal or a proven explanation of the previous server exit.

### R04 — Finish email and owner-security release boundaries

FE-070/073, BE-059/061, DEP-029/043/048/050. Depends on served assets and explicit
hosted configuration review; this is separate from the B09 deployment approval.

- [x] Existing MirtPage domain/Auth origin/callbacks and schema 77 are applied and
  independently read back; Google login remains disabled. Preserve stable keys,
  identities and existing aliases rather than recreating managed projects.
- [x] Opaque-white logo source, light/dark review and its local release checks
  pass; the new PNG is publicly served. Prior MirtPage sender/subject changes
  and an actual owner email are separate verified evidence.
- [x] With asset readback and exact DEP-029 owner approval, apply/read back only
  the thirteen Auth HTML fields. Sender/subjects/settings stay unchanged; this
  operation sends no email. Actual inbox/dark-mode rendering remains separate.
- [ ] Verify separately authorized labelled tracking-code, shipment-detail and
  overdue-staff emails reach the intended inbox; provider acceptance/worker logs
  alone are not delivery proof. Keep server-only Gmail credentials private.
- [ ] Keep owner email-change initiation disabled until the exact secure Auth
  settings/templates/notices, both mailbox proofs, UUID reconciliation/session
  fence and monitored owner workflow pass. Local Mailpit tests do not activate it.
- [ ] Any request to restore Google sign-in requires renewed scope, recoverable
  credential authority and actual login proof; do not silently reenable it to
  close a historical launch checkbox.

### S153 parallel web preview-context correction — FE-065

- [x] Record the live desktop/phone finding and ready contract before production
  code: discovery cards must visibly expose available business city and optional
  merchant grouping; repeated case-equivalent location parts display once.
- [ ] In the separate FE-065 worktree, reuse the existing discovery contract and
  three web consumers; preserve native, API, canonical product actions and tenant
  boundaries. Run focused regressions and actual desktop/phone Chrome tasks.
- [ ] Combine the reviewed native and web fixes on clean frozen source, record
  a source-bound agent visual pass, then qualify applicable gates and artifact/build
  admission. Do not treat separate worktree proofs as combined release evidence.

### R05 — Qualify the existing Android version 2 artifact

DEP-042/043/044/049. Hosted device workflows use stable compatible APIs and the
owner's actual phone availability; permitted local preparation can continue.
The web-only B09 routing fix does not require a new native compilation.

- [ ] Owner-requested physical development loop (current): prepare one local
  arm64 MirtPage development client using the existing package and signer, with
  no data reset or Play upload. Verify exact build-tool admission and local
  API/Auth/Metro identity before building/installing; use Fast Refresh for later
  JavaScript fixes rather than repeating release builds. Keep final standalone
  release and push/App Links evidence separate from development-client results.
  Exercise actual touches and visuals across discovery/map/filter/Back,
  showroom/media/collections, product/options/inquiry/contact, visitor and owner
  transport/tracking, Account/setup/edit/save/cancel, locales/keyboard/safe areas
  and permission/background/error paths. Use controlled local fixtures for writes,
  keep one issue list, and verify fixes on the phone before closing their IDs.
  - [x] Owner approved the exact one-development-APK tooling exception
    `668d3dca…0651`. Native source/lock/package/signer are bound independently of
    evolving Metro JavaScript; no Play upload or paid build is included.
  - [x] Root reviewed development credential isolation: 16 security and 41
    affected tests pass, with unchanged production keys and no legacy fallback.
    Floating-action scroll clearance passes focused tests and 13 actual Expo
    states; neither result is physical Android proof.
  - [x] Preserve both failed attempts and qualify the same-source installed-JDK17
    correction. Final development APK `0d579aed…ab47d8` independently verifies
    MirtPage/com.mirtpage.app/version2, registered signer, arm64, debug launcher
    and 16KiB ZIP alignment. No app JavaScript is embedded; this consumes only
    the approved development-client exception, not a Play/release admission.
  - [x] Actual Android Metro compilation verifies development mode, local API/
    Auth, scoped credentials and the synthetic native map binding. Expo57 uses
    generated environment bindings rather than the verifier's old literal-inline
    assumption; the classified verifier correction preserves the same invariant.
  - [x] Data-preserving installation verifies exact development APK
    `0d579aed…ab47d8`. Real Fast Refresh visual probe and restoration retain the
    same Tracking state (`physical-development/fast-refresh-receipt.json`).
  - [x] Actual native map31→22/9→terminal3 preview→Afia detail→Explore showroom
    passes. Product Add/inquiry count1 and all3 enabled contact options expose
    the complete message above the floating dock. Empty Tracking email entry
    opens; verified-session restoration is not yet tested.
  - [ ] Current physical step: continue the broader role, keyboard, lifecycle,
    conversation and accessibility audit, retaining one issue list. These DEV
    results do not qualify standalone release, push/App Links or Play delivery.
- [x] One authorized compilation produced version 2 AAB and derived APK; independent
  static inspection verifies package/signing/config/resources/App Links/Hermes,
  native library equality, ELF alignment and zipalign. Exact hashes: traceability E3.
- [ ] Current step — FE-069/BE-058 Android tracking storage correction:
  1. [x] Verify version 2 installed APK identity and retain bounded public-flow
     captures plus the failed tracking entry/retry. No chat or email was sent.
  2. [x] Define a collision-free full-origin hex key accepted by installed
     SecureStore; strengthen storage/component fixtures and retain old-source
     red proof before the minimal production fix.
  3. [x] Pass focused storage (9), controlled Tracking component (6), mobile and
     strict test typechecks, and spec validation. Preserve the sandbox launch
     stop separately from actual red/green component results; device is unproven.
  4. [ ] Integrate the selected audit-fix batch and run its applicable full gates
     on frozen source; these focused passes do not qualify a new binary.
  5. [ ] Obtain the separate DEP-044 exact new-build admission, then physically
     confirm email entry, secure save/restore/logout and final screenshot set.
     Version 2 and current captures do not prove the corrected binary.
- [ ] Confirmed native owner UX batch — FE-053/FE-056/FE-064:
  1. [x] Record the three physical/source findings and acceptance before code;
     preserve the independently focused tracking storage correction.
  2. [x] Retain interactive Account entry across the actor-keyed navigation reset;
     keep cold restoration, refresh, denial and logout isolation unchanged.
     Intent is transient and bound to the validated actor.
  3. [x] Use compact private product rows and one persistent product Save/Cancel
     bar with a single scrolling form; retain exact commands and dirty/busy guards.
  4. [x] Focused tests pass: root/resource 8, Account hub 8, editor/removal 15 and
     logout/SDK 5; native and scoped types and validation of all 219 specs pass. Real
     en/am/om labels fit controlled phone/landscape geometry. The old root-layout
     control fails both interactive login cases; no actual Expo/device pass is inferred.
  5. [x] Review actual source-bound Chrome/Expo tasks: visitor Tracking email
     entry; local SDK fixture owner Account, compact Products/Edit, dirty
     Keep/Discard, en/am/om at 390/844 landscape actions, blocked Save→retry→exact UI
     restore. API readback confirms outcomes; ordinary email-code entry remains
     Auth 429 and corrected physical Android is unverified. Protected receipt:
     `tracking-storage-fix/expo-owner-actual-review-result.json` in the S153 audit.
  6. [ ] Record a combined source-bound agent visual pass, then run applicable full gates,
     admit the exact new build and physically retest the corrected binary.
- [ ] With the owner's phone available, verify installed artifact identity
  and actual visitor/owner/chat/tracking/signup/save/cancel flows, gestures,
  foreground/background/resume, playback, clipboard/social OS handoffs and cold/
  warm App Links. Expo localhost:8082 is separate evidence; do not use an emulator
  contrary to the owner's instruction.
- [ ] Verify permission denial, notifications/background/tap/mute/logout/expiry,
  truthful reads and device runtime. Manifest declaration is not an overlay grant.
  Retain Expo Doctor 19/21 and inherited permission/tooling limitations explicitly.
- [ ] Capture genuine current Android phone screenshots for the new listing.
  Authorize another build separately only if artifact/source changes require it.

### R06 — Start the new MirtPage closed test

DEP-044/049. Console/listing/credential and draft preparation can proceed while
R02/R05 are unfinished. Upload and track activation require the exact admitted
artifact, compatible live API, required setup and normal scoped approval.
Physical-phone/OS evidence may be completed within closed testing and is required
before production readiness; it is not an invented prerequisite to every Play
preparation step. A first upload may use normal Console controls or a separately
authorized app-scoped submission credential; neither method starts the test clock.

- [x] Separate MirtPage app `4975632567188114692`, package `com.mirtpage.app`,
  existing signer, new Firebase client, icon and charcoal listing graphics are
  provisioned. Twelve owner-confirmed addresses are selected privately for Alpha;
  listing/policy/reviewer saves are recorded, not represented as final approval.
- [ ] Freshly inspect the correct app, all listing/localization/assets/screenshots,
  policy/Data safety/privacy/deletion/reviewer/target-audience/content-rating
  states and app-scoped submission authority. Resolve incomplete IARC/Play steps
  through permitted owner/provider controls; never invent questionnaire answers.
- [ ] Obtain exact upload/release approval for the inspected artifact, upload to
  the verified new app and publish the closed track; confirm actual availability
  and the correct opt-in link. Do not modify another app or send invitations
  without the existing explicit messaging authority.
- [ ] Confirm at least **12 genuine testers actually opt in continuously for at
  least 14 days**, use the app and provide feedback. Addresses, internal testing,
  an APK download, old Suqpage enrollment or an inactive track do not start this clock.
- [ ] Apply for production access with truthful test results, then obtain the
  separately required approval for public rollout and monitor it.

### R07 — Public discovery, marketing and test-account handoff

FE-049/052/055/063/064/070/071; DEP-041/044/049.

- [ ] Verify canonical/sitemap/robots/structured/public product HTML and that private,
  draft and demo records have the intended indexing exclusions. Search Console
  submission and actual indexing require separate provider evidence.
- [ ] Reconcile professional current-brand Play and coming-soon media/copy in
  en/am/om with actual UI; retain the approved charcoal layout and single logo
  palette. Business narrative covers what businesses sell, make or grow without
  social-post clutter; no services marketplace or checkout claim returns.
- [ ] Obtain official TikTok/Instagram handles, prepare the campaign schedule and
  remaining exports, then use separate authorization for actual posts/messages.
  No official handles or campaign publication is assumed.
- [ ] Deliver a private up-to-date role/account and screen-by-screen testing guide
  for visitors, owners, granted/revoked staff, admin and reviewer workflows.
  Preserve private login aliases; never commit passwords or expose them publicly.
- [ ] Keep real merchant identity/media truthful, public demo contacts intentional
  and alcohol/tobacco prohibited with removal/moderation when found. Do not alter
  real accounts or recreate old demo operations to satisfy stale checklist prose.

### R08 — Finish documentation and workflow housekeeping

GitHub workflow follow-up (DEP-002, L0):

- [x] Inspect actual default branch/divergence, PRs, protection and reported
  deployment wiring, retaining uninspected-hook limitations.
- [x] Add one focused GitHub skill and concise branch/commit/PR/merge guidance;
  retain the existing PR template with change-level-appropriate evidence.
- [x] Review selected upstream skill candidates and installation/provenance rules;
  validate the documentation/skill and representative workflow cases.
- [ ] Integrate the reviewed task after its parent documentation/release dependencies;
  verify current-head checks and delivery wiring. No remote merge, settings
  change or deployment is implied by the instruction-only skill.

DEP-002; additive to shipping. Work only in the isolated documentation worktree
from `7e24014`; keep the exact release checkout unchanged.

Ordered L0 plan, recorded before replacing documents:

- [x] Three focused project skills and thin routing, updated setup/readiness docs,
  and recurring static workflow checks are implemented and focused-tested.
- [x] Inspect governing instructions and the clean base; apply the reviewed
  compact master/checklist/traceability candidates and reconcile actual outcomes.
  Preserve all numbered master anchors, immutable spec/ADR links and unfinished
  requests. Keep history in Git/existing records; create no new archive.
- [x] Validate structures, specifications, identity/narrative and local references;
  inspect the docs-only diff. No application rebuild, full gate, provider write or
  additional approval requirement belongs to this L0 maintenance task.
- [x] Obtain root review and commit/push the six documentation paths on the
  isolated docs branch. Preserve failed receipts and the composite/raw-exit distinction.
- [ ] Integrate that docs branch and verify applicable checks on the resulting
  head; its isolated publication does not change the exact release checkout.
- [x] Verify the three original project skills appear in the current host catalog.
- [ ] Verify new GitHub-skill discovery and actual selection/routing; reviewed
  cases and Node YAML checks alone do not prove selection. Missing PyYAML is a
  recorded optional-validator limitation, not permission to install globally.
- [ ] Prioritize demonstrated engineering follow-ups from
  [engineering readiness](operations/ENGINEERING-READINESS.md), measure observed
  reliability/time/cost, and keep nonblockers separate. No broad architecture
  rewrite, paid provider, global setup or unattended schedule is implied.

### R09 — Retained nonblocking decisions

- [ ] Keep iOS identity/device/release setup deferred until its Apple team and
  actual delivery scope are available; an Android artifact does not establish iOS.
- [ ] Preserve inactive historical Google-login, old-app/API retirement and tooling/
  least-permission cleanup requests as explicit follow-ups. Do not rotate stable
  keys, delete old resources or remove compatibility without a scoped decision.
- [ ] Reconcile any inherited checkbox whose feature-specific acceptance is not
  proven by current evidence before closing it. Unknowns remain open under the
  relevant R01–R09 task; no age-based automatic completion is allowed.

## Evidence and retention

[Traceability](../specs/TRACEABILITY.md#current-release-evidence) owns the compact
source/artifact/approval evidence registry and cross-layer matrix. Existing
release records hold detailed historical results; do not duplicate their logs.
The protected consolidation coverage map accounts for all **273** formerly open
checkboxes with original line/section/content hashes and a current task. It does
not mark unknown items complete. Historical S-section identifiers remain usable
through Git at `d78dcf5` plus the c6dd source checkpoint; they are not current
instructions to restore superseded product behavior.

Before implementation: add a short ordered task and link its controlling spec;
identify dependencies, focused evidence, visual gate and rollout boundary. Update
only changed current state and evidence pointers. Security, tenant isolation,
privacy and data integrity remain mandatory; a digest is not hosted approval.
