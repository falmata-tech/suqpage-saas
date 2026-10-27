# MirtPage traceability matrix

This is the current requirements → implementation → test/evidence index, not a
release transcript. Specification IDs and their reciprocal `related` links are
immutable. A specification's declared status is preserved below; it does not
upgrade local evidence into hosted or device qualification. The linked test plan
contains the full acceptance mapping; short filenames are navigation hints.
Historical outcomes remain in the existing release records and Git, not copied
run logs. [Active delivery checklist](../docs/SUQPAGE-TRANSITION-CHECKLIST.md).

## S187 Android version3 source preparation

DEP-044 S187 advances `com.africmade.app` to Android `versionCode` 3 for the
merged S185 transport chat while preserving the existing signer, Firebase
client, package and API target. The source-matched focused config, mobile media,
native typecheck, identity, narrative and five countdown tests pass. The full
source `npm run check` passes after one controlled retry outside the sandboxed
loopback restriction; the original `EPERM` database-port failure is retained.
An isolated root/contracts `npm run release:web` passes with zero web audit
findings after one sandbox-DNS retry, and serial acceptance passes 20/20.
Protected `.local/s187-native-prep/` holds those logs, the 384-entry native
source candidate and locked audit. The fresh native audit reports four high and
zero critical build-tool findings rooted in `node-forge` and `zod`. A separate
source-bound offline Android Hermes export contains 1,712 modules and neither
advisory root; its receipt is under `.local/s187-native-build/export-attempt01/`.
This export is an inventory, not general runtime clearance. The prior version2
owner exception is consumed. A new exact one-artifact exception, integrated
main CI, signed compilation, binary inspection and installed-device proof remain
separate pending gates.

## Current S186 chat web publication

PR #50 merged as `08999f30572c21fc652b37f06069436a49bd55c6`, tree
`ef073f33fc8046a53c568497dd9e6abc086ed211`, equal to the locally checked
S185 PR-head tree. All five required jobs pass in PR run `40498112725` and main
run `40506833088`; the web-only release gate and 20/20 acceptance pass. Netlify
production deploy `6ae0a7fb4ccd545c7dd13f55` is ready and published on the
existing site, including `africmade.com`. The exact sealed artifact SHA is
`dca42239ba3f2139e4919159b2b2c92a2b4384b8936bdcc220cd84df61d09d46`;
its Linux server ZIP SHA is `68dba01579a3b0d502dbc1e9ecbe1825a2943ba6018ff941a0f040286a68cca5`.
Protected `.local/s186-web-artifact/` retains `local-gates.json`,
`main-ci-terminal.json`, `s186-linux-runtime-result.json`,
`s186-direct-prod-result.json`, `s186-provider-after.json`,
`s186-live-readback.json` and `live-phone-settled.json`. The Linux import,
29 route/asset readbacks and settled 390px/desktop installed Chrome intake views
pass; the initial phone screenshot captured loading, and the later settled view
corrects that limited visual result. No live chat submission or attention-worker
execution was performed. The previous deploy `6adfa7a046c301c50af9b164` is
still ready, and all 41 environment records retain their fingerprint. The
separate signed Android v2 APK in E13 predates S185; no S186 native build, device
test, push or Play upload occurred. Managed CargoChatter remains future work.

## Current S181–S184 delivery

PR #48 is merged as `75092ef840e84d15b44727d1466b034b487797f3`, tree
`1c0ca7813fc67c4ebab87fe5f975edef082caadd`. All five required jobs pass in PR
run `40379361447` and main push run `40381053204`. Protected receipts under
`.local/s183-github/` are `merged-source-equivalence.json`,
`local-gates-main.json`, `pr-ci-40379361447-attempt01-terminal.json` and
`main-ci-40381053204-attempt01-terminal.json`. All 2,431 tracked files, the unchanged V8 runtime
(1,386 inputs) and final V12 gate closure (1,836 inputs) match the qualified tree.
Local check qualification composes retained passing stages; failed full runs are
preserved below rather than relabelled as one successful invocation.

The exact qualified website is published as Netlify deploy
`6adfa7a046c301c50af9b164`. Protected `.local/s182-web-artifact/` owns
`s182-adapter-result.json`, `s182-linux-runtime-result.json`,
`s182-direct-prod-result.json`, `s182-provider-after.json` and
`s182-live-readback.json`. Artifact SHA `d5a1e9ab…4417c5d` and inventory SHA
`cfd8e76b…e7cec28` bind the Linux import and publication. Twenty-nine independent
route/asset/image/manifest/worker-file/App Links readbacks pass; Featured policy
is 20:15–21:45 EAT with four slots and the non-today identity fence passes.
Provider target and all 41 environment records are unchanged; deploy
`6ade42137f331c939a820177` remains ready for recovery. AfricMade's domain serves
the artifact in place while canonical metadata remains `mirtpage.com`.
This verifies worker files, not service/scheduled-worker execution.

Live Chrome qualification is `.local/s183-live-ui/qualification.json`:
22 scoped functional checks complete, including the 390px map (69.64% of viewport),
Addis group/Page/Back, translated filters, Featured and footer/transport states.
Its raw receipt remains **FAIL**: the 120-second deadline closes the final Oromo
page during footer/teardown after those checks (132.386s total). Thirty-five
failed requests include one deliberately blocked passive analytics POST; the
remaining GET/RSC cancellation causes are unproven. There are zero unexpected mutations, page errors,
observed application HTTP errors or uncontrolled map tiles. Synthetic tiles are
the only fulfilled fixture. Inquiry Open/Close passes, but that original run does
not measure contact-action reachability; lazy gallery placeholders do not
constitute complete image visual approval. The original alias-redirect harness
failure is retained. These are qualified task results, not a passing whole-run
or network-error-free verdict.

The separate settled 390px inquiry review passes in 25.986s:
`.local/s183-live-ui/inquiry-2026-10-26T20-07-44-108Z/qualification.json`
(`9ed825f0…1b82af`). It measures all four choice/copy actions as pointer-reachable,
expands quantity, opens the unsent Inbox draft with Send disabled, then closes
and reopens it. The parent visual decision is
`.local/s183-live-ui/parent-visual-decision.json` (`85778d30…18242`). This covers
only the earlier unmeasured action region; its capture cause stays unproven.
Desktop Chrome's phone viewport uses contact-copy cards, so external mobile-app
handoff, clipboard writes, form validation/Send and live inquiry/chat submissions
are not qualified. Both reviews perform zero application writes and qualify no
physical Android, push or Play behavior.

The exact owner-approved `com.africmade.app` version2 compilation succeeds once
in 3015.354s, completing at 2026-10-26T20:17:59Z. E13 owns its signed artifacts.
Protected `.local/s183-native-prep/build-draft/s183-native-v2/result.json`
(`ee2a9648…1989d3`) records creation; separate
`binary-inspection-prep/attempt02/composed-static-inspection.json` under
`.local/s183-native-prep/` (`9192789e…6a7525`) qualifies composed static admission.
All 383 source inputs, explicit canonical-v1 upgrade comparison, code2/signer/
SDK36/Firebase/Hermes bindings, 100 native libraries, 50 64-bit ELF 16-KB alignments
and ZIP alignment pass. The six-high one-artifact build exception is consumed.

The initial inspector cannot resolve its installed `tsx` tool from the clean
checkout; its bounded phase1 retry passes. Both artwork
phase2 invocations remain failed: unassociated alpha-RGB comparison, then an
unchanged notification reference's 0.97997 IoU against 0.98. Composition reuses
the completed 25 changed-variant guard prefix (all five densities, zero significant
ink outside masks), exact canonical-v1 bytes for five unchanged notifications
and decoded wordmark equality. No phase2 full rerun or tolerance relaxation is
claimed; per-row numeric prefix metrics were not retained. Agent/root visually
review all 31 actual compiled variants, sheet SHA `64eefcb1…73faa9`.
All 31 inherited permissions match v1; finite private-pattern scans are not
exploitability or no-collection proof. Physical Android, FCM/EAS binding, push,
screenshots, 16-KB device runtime, Play upload/submission and genuine closed-test
enrollment remain pending. No bundle upload occurred.

## S183 icon and splash mask qualification

FE-070 S183 retains the owner-supplied artwork and changes only export geometry
and white fields; DEP-044 selects the next Android code2 over canonical v1.
The old adaptive/monochrome and wide splash fail the new significant-ink mask
tests. The corrected sources pass seven brand cases, all five installed Expo
splash-plugin densities (zero significant ink outside the system safe circle),
PWA checks, eleven attention-worker compatibility cases and localized metadata.
Favicon, source mark, full wordmark and email bytes remain identical. The actual
configuration test resolves2 for all three profiles with a stale base1 supplied.
Protected evidence: `.local/s183-brand-review/focused-receipt.json`,
`chrome-2026-10-26T15-02-50.380Z/` in that folder, and
`.local/s182-native-prep/version2-config-focused.json`.

Parent and agent inspected orange-on-white launcher/themed/PWA/touch/splash
previews in actual Chrome. These emulate documented masks with actual generated
PNG resources; these previews are not installed Android launches. E13 separately
owns the later actual compiled resources and composed static admission.
Current runtime freeze is `.local/s181-review/production-freeze-v8.json`
(`358a3690…ccd0bd`, 1,386 inputs); source/test/tool inputs are also frozen in
`.local/s183-brand-review/gate-code-freeze-v12.json` (1,836 inputs,
`e82aa809…647513`). V9/V10 repair the obsolete web lifecycle wait and
remaining compact-filter capture assertion; V11/V12 add the S184 harness
corrections. Production V8 stays unchanged.
The restarted previews use the intended checkout/local API. Unchanged S181/S182
header/wordmark, task and data-contract evidence keeps its original identity.

The first complete gate stopped on an obsolete cosmetic header assertion. The
second passed eighteen stages then found old direct-filter/fixed-zoom test
expectations; corrected native component and lifecycle files pass7/7 and6/6.
The third complete run passed 40 main stages, then found the equivalent old web
fixed-zoom wait; its complete nine-case Chrome lifecycle file now passes. Reusing
483 unchanged UI cases plus those nine, and the passing remaining 37 main stages,
qualifies all 78 check stages. This is source-matched composition under DEP-002;
the original full run remains failed, not relabelled as one successful invocation.
Protected gate evidence is `.local/s182-gates/check-qualification.json`.

Web release passes in the independent root/contracts-only install in 428.7s,
including the production build,104 trace-privacy checks, real disposable-provider
HTTP smoke and zero-vulnerability web audits. Full acceptance passes19 cases;
the remaining stale direct Category assertion is corrected to open the actual
Filters overview, and its entire human-search case passes in a fresh disposable
stack. All20 cases are qualified, with the first run's failure retained. Actual
admin four-business Save/reload/PostgreSQL readback, automatic reset and staff
denial pass. Receipts: `.local/s182-gates/release-web-attempt01.json` and
`acceptance-qualification.json` beside it; the combined terminal summary is
`local-gates-uncommitted.json` in that directory. Direct tests use installed
Chrome; five delegated capture scripts retain their own headless Chromium.

Fresh native audit still fails with six high reports rooted in node-forge and
zod. The383-input, 1,712-module offline Hermes export passes and contains neither
root advisory package; broader reported Expo/MapLibre packages do occur, so no
general runtime clearance or exploitability finding is claimed. Protected summary:
`.local/s183-native-prep/preparation-summary.json`. Integration, web publication
and the separately admitted native artifact are qualified individually
in [current delivery](#current-s181s184-delivery); no stale artifact is renamed.

PR48's initial run40368352333 and its controlled retry fail browser at disposable
Supabase startup before application build/tests. Their exact-head receipts remain
under `.local/s183-github/`; the underlying CLI reason remains unproven and raw
captured output stays private. No required check was bypassed.
S184's fixed-shape diagnostics pass all 11 readiness cases, actual inert runner
failure/cleanup, explicit static binding and workflow tests. Bounded head/tail
sampling preserves late errors without echoing captured output. Runtime V8 and
the 383-input native closure remain identical. Protected focused receipt:
`.local/s184-ci-diagnostics/receipt.json`.

Run40375102141 on `3f75b1b` passes the complete browser job plus container,
dependency and postgres; core fails on its operations fixture's first SQL query.
DEP-002 S184 verifies the installed image's socket-only initialization phase and
reproduces that exact disconnect with a controlled two-second init fixture.
Container-loopback TCP readiness passes every archive/restore assertion without
changing waits, SQL mutation retry behavior or product inputs. Protected evidence:
`.local/s184-operations-readiness/`. The earlier Supabase-startup failures remain
unexplained; later successful required PR/main checks do not establish their root
cause. [Current delivery](#current-s181s184-delivery) owns terminal CI and integration.

## S181–S182 map, Featured and public footer qualification

FE-065/FE-021 implement the compact phone/native Market, earlier safe group
activation and a neutral Market icon; FE-054 owns business-coloured inquiry
actions. FE-021/FE-033/BE-029 implement the four-business 8:15–9:45 PM EAT program
and simpler Featured. FE-070 owns the grouped information-page footer. Runtime
inputs are frozen in protected `.local/s181-review/production-freeze-v7.json`
(`e20b1314…f052d`, 1,381 files). V6 changes only two web CSS files from V5:
the short/enlarged canvas scroll fallback and bounded 44px language selector.
The six-case en/am/om header/canvas regression reproduces both defects before
the fix and passes afterward. V7 changes only the narrow web brand size so the
full selected-language label fits; its real About→footer→Market retake passes.
These original preview freezes qualify the tasks; the unchanged product runtime
is integrated and published under [current delivery](#current-s181s184-delivery).

| Acceptance | Focused implementation evidence |
| --- | --- |
| Compact controls, scope/Back, loading and locales | `test-market-workspace-ui.ts`, `test-native-discovery-previews.ts`, `test-mobile-market-layout.ts`, `test-web-market-short-layout.ts`; 46 web and 30 native layout cases plus 24 actual installed-RNWeb intrinsic-height cases pass. The latter reproduces and fixes the filter-overview overlap found during Chrome review. |
| Safe groups and named pins | `test-map-clustering.ts`, `test-mobile-map-groups.ts`, `test-map-group-picker-web.ts`, `test-mobile-map.ts`; 35 shared, 19 native-group and two picker integrations pass, including short/enlarged two-business scrolling and conserved coordinates/IDs. |
| Business inquiry accents | `test-floating-inquiry-web.ts`, `test-mobile-public-action-dock.ts`; validated colours, contrast, defaults and A→B isolation pass. Protected focused receipt: `.local/s181-cart-accent/focused-review.json`. |
| Featured timing, capacity and privacy | `test-featured-schedule.ts`, `test-discovery.ts`, `test-clock-display.ts`, `test-featured-broadcast-header.ts`, web sponsor/loading and native Featured cases; isolated PostgreSQL fifth-selection rejection/history preservation, 18 native and 13 web cases pass. Retained-today/future-category privacy was reproduced before its guard fix. |
| Footer layout and destinations | `test-about-audiences.ts`, `test-transport-partner-interest-ui.ts`, `test-public-transport-launcher.ts`; grouped links, route allowlist and 320px en/am/om enlarged layouts pass. Protected receipt: `.local/s181-footer-review/focused-review.json`. |

Actual Expo Chrome completes 36 checks and 31 states in en/am/om, including a
21-business Addis cluster, terminal preview/Page/Back, filters, a declared one-shot
failed search followed by a real API retry, Featured, transport intake/Cancel and
footer navigation. Receipt: `.local/s181-native-layout/browser-attempt02/receipt.json`;
agent visual decision: `actual-expo-visual-decision-v5.json` in that parent folder.
It uses real local application/catalogue data and synthetic map tiles; no public
catalogue writes or real messages are sent. This does not qualify installed Android,
MapLibre events, device keyboard, push or independent native-speaker fluency.
V6 changes no native or shared-runtime inputs, so that Expo evidence is retained
with its original V5 identity rather than relabelled as another run.

Actual web qualification completes 42 functional steps across retained V5/V6
states plus the V7 header retake. Receipt:
`.local/s181-web-focused/s181-s182-web-functional-visual-qualification-v7.json`.
Four actual web/Expo cart cases prove default palette, list isolation and return;
all active marked local demos lack saved accents, so custom colours are qualified
only by installed-renderer and PostgreSQL/DTO regressions. Nine actual footer
locale/width cases exercise 57 destination/states. Their source-bound scoped
visual decisions are `visual-assessment.json` under
`.local/s181-cart-accent/actual-2026-10-26T10-42-44-941Z/` and
`.local/s181-footer-review/actual-2026-10-26T10-45-49-917Z/`.
The parent admission is `.local/s181-review/agent-visual-admission-v7.json`.
Background web GET cancellations retain unproven cause (including observed HTTP
200 RSC responses); do not call these reviews network-error-free.
The combined local check/release/disposable-provider gates above now qualify this
unchanged runtime behavior; their retained source identities are not rewritten.
The current website and E13's statically admitted version2 contain these changes.
E11's predecessor does not; installed-device qualification remains separate.

## S185 transport chat presentation and countdown qualification

FE-019 S185 changes transport chat presentation and fixes a client clock that
previously rejected fractional `performance.now()` elapsed time and reset the
countdown to 3:30. The CargoChatter footer is presentation credit only;
AfricMade remains the chat operator. Focused clock, owner workspace and native
controller tests, current web/Expo screenshots, and live local guest Start →
End → new-request API readbacks are retained under `.local/s185-review/`.
The source-matched `npm run check`, CI-equivalent clean-install
`npm run release:web` and `npm run test:acceptance` (20/20) pass; protected
local gate logs are `.local/s185-check-final.log`,
`.local/s185-release-web-clean.log` and `.local/s185-acceptance.log`.
The all-target release gate failed only at its final production audit on four
pre-existing `node-forge`/`zod` Expo build-tool reports, so it is not claimed
as passing. The earlier web-target attempt correctly rejected the combined
web/native install before the clean web install was used.
The public CargoChatter demo's referenced CSS returned 404 during review, so
this is a stylistic adaptation, not a pixel-identical recreation. Installed
Android and managed-service integration remain unverified/future work.

## S168 current local transport reply qualification

BE-018/FE-019 use the first public staff reply as the stable 3:30 live-wait
boundary. The PostgreSQL response regression, shared deadline model and 38
affected web/Expo UI cases pass. Actual Chrome web at 390/1440 and Expo at 390
retained the live composer after a timely reply followed by a later reply; the
web case also survived reload. Protected source-bound evidence is
`.local/s168-browser-review/receipt.json` and the S168 logs in the active
checklist. The test shifted only labelled local fixture timestamps. Expo web
credential memory intentionally resets on browser reload; installed Android
persistence is unverified. Three web GET aborts during browser refresh remain
unclassified, so this is not an error-free network qualification.

## S153 focused local routing verification

BE-018 N14 adds immutable managed-identity readiness to new automatic/manual
assignments, before bounded candidate selection. Nine isolated PostgreSQL criteria,
existing routing/automatic-routing regressions and strict TypeScript pass;
legacy eligibility and history remain intact. Protected source-bound evidence:
`.local/mirtpage-user-journey-audit-s153/n14-staff-signin-readiness/`.
Running-service assignment, full gates and deployment remain separate pending proof.

## S162 local transport wait-to-inbox visitor journey (superseded direction)

On 2026-10-22, isolated actual Chrome used local Expo at `localhost:8082`, web at
`127.0.0.1:3102`, and local PostgreSQL. It verified an earlier same-thread
composer design at 2:00/3:30 and one participant message. That direction was
superseded by the owner's callback-form/no-poll instruction before full
verification; it is not evidence for the current desired flow. The current
acceptance in FE-019/BE-018 requires one callback submission, a static receipt,
no visitor polling after timeout, and continued staff access to the same support
case. The old browser evidence remains diagnostic context only at
`.local/s162-transport-review/`; do not use it to qualify current acceptance.

The prior browser run also recorded three `GET /api/public-support`
`net::ERR_ABORTED` failures in web contexts; their abort reasons remain
unclassified. Its then-pending owner, staff and email checks are superseded by
the newer scoped evidence in the active checklist; the old run itself did not
qualify them.

## Current release evidence

| Ref | Verified scope | Evidence and remaining boundary |
| --- | --- | --- |
| E1 — web/API baseline | `d78dcf538927a1b403899d196f5631ebc199cd8c`, source `5129758d…6c1f5`: full check (415 workflow-UI cases), clean web release, 20/20 acceptance; five green CI jobs | Protected `s151-batch-audit/gates-approved-b01-b10-standard-continuation/result.json` and `ci-terminal.json`; GitHub run `39485239127` attempt 2. First attempts remain failed. Earlier `6ad7d7978faaa5baa6eee605` had broken optimized images; E5 records its published replacement. Runtime build lineage remains this baseline. |
| E2 — exact demo operations | B04 contact repair + one nonsecret production setting and B05 finite product/media cleanup applied and independently read back | Protected `demo-repair-preparation/b04-both-approved-operations-complete.json` (63ae5217…df0c1) and `b05-approved-operation-complete.json` (b9990370…862d7). B05 records 246 row writes, all ten after states, 65 demo contact configs and 74 outside fingerprints. Private identities/history/real businesses remain protected. These consumed approvals do not authorize new data operations. |
| E3 — Android version 2 | One authorized compilation from `d78dcf5`; exact existing signer/package/Firebase/App Links/Hermes and static native integrity/alignment pass | AAB SHA `2a116c63c017c9d06c0260c66580051cec8ff4c6ebf4f565fc382d6abec125fa`; derived APK SHA `78e8d2fe7d6ecb89b65a6a7b3500975848ef419bc5de146744ce8775995145c6`. Protected `native-admission-20261020/post-build-inspection-v2/final-inspection-receipt.json` SHA `026d843a…a294b`; permission-provenance addendum `c462a5e6…85262`. This is not phone/OS-push/Play proof; Expo Doctor 19/21 and inherited permissions/tooling limits remain. |
| E4 — Auth/mail | MirtPage primary origin/callbacks, schema 77 at that release, sender/subject branding and the thirteen-field opaque-logo HTML repair independently verified | Protected `s148-auth-primary-*`, `s149-netlify-primary-result.json`, `s150-auth-email-brand/` and source templates. Exact owner-approved HTML apply/readback verified at 2026-10-20T22:46:07.318Z: `s151-batch-audit/auth-white-logo-plan/applied-bd7546-receipt.json`. Only thirteen HTML fields changed; no email was sent, so actual inbox rendering/delivery remains separate. Owner email-change initiation stays disabled pending [DEP-050] secure hosted qualification. |
| E5 — current B09 correction | The shadowing physical image rule is removed; 17 aliases + official query captures/IPX/fallback/exclusion retained; source/CI/local admission pass | Source `c6ddc736c04b5ca52d5941479b292bca207de72dd4d3aa90e2534170d1a3d185`, 2,320 files. Protected `b09-query-routing-recovery/focused-result.json` SHA `0d257853…9ccd0`. All 77 check commands qualify through the retained 18-command prefix and complete 59-command continuation; original full-check exit 1 remains. Clean web release exits 0 with zero production vulnerabilities; acceptance exits 0 with 20/20 scenarios. Raw destination-stream-close messages remain unclassified. GitHub run `39509285979` attempt 2 passes all five jobs on `7e240145992d7bdd79b0cd02c461a96b1d18dd49`; the first core fixture-startup failure and unchanged retry remain recorded without an asserted root cause. The exact approved replacement `6ad7f59795812d9f56be42a2` is independently ready/published after a preserved operator stop. GET/image/worker and visible Chrome journeys qualify; overall browser cancellation classification remains open. |
| E6 — workflow/role review | Actual local Chrome desktop/phone/Expo and canonical API/DB checks are recorded for affected roles; B01–B10 current visuals approved | Protected `.local/s146-browser-review/`, `s151-batch-audit/` and `.local/contextual-loading-s151/`. Specific evidence is linked in controlling specs. Synthetic maps/component hosts and Expo are not native devices; unsupported roles were not fabricated to obtain a pass. Current physical-phone hold remains. |
| E7 — engineering/docs | Three focused project skills, thin agent router, setup/readiness docs and recurring workflow checker implemented; compact docs validated, reviewed, committed and pushed | [Engineering readiness](../docs/operations/ENGINEERING-READINESS.md), [DEP-002]. Fourteen workflow regressions include an actual symlink-dependency clone. Docs checks preserve 29 numbered master headings, 219 IDs/statuses/related edges, 273 open-item mappings and 915 local destinations/anchors; spec/identity/narrative checks pass. Root committed/pushed `29327d1ed88a73ab541822ae023ad4c9e0d74fcd` on `docs/consolidate-engineering-reference`; integration remains pending. Protected coverage/receipts retain detail. Static structure/reasoned cases do not prove actual skill selection or token/cost savings; this docs branch does not upgrade hosted/device qualification. |
| E8 — launch-parity candidate | Changed web/Expo journeys pass local agent-led Chrome review; `npm run check`, clean web-only `release:web` on Next.js 16.4.2 with zero audit findings, and serial acceptance 20/20 pass. Production schema 77→79 is committed and read-only verified. | Protected `.local/s166-agent-visual-review.json`, `.local/s168-browser-review/receipt.json`, `.local/s169-check-next1642.log`, `.local/s169-release-web-final.log`, `.local/s169-acceptance-next1642-serial.log`, and `.local/s169-prod-77-79/incident-readback.json`. The migration runner's post-commit read used the wrong role and returned `42501`; independent read-only verification confirms the expected ledger/RLS and unchanged 102 inquiries. No migration retry/restore. GitHub CI, new web artifact, installed Android and Play remain separate. |
| E9 — launch-parity delivery | PR #37 merged as `d4de292072b158fbe0f144ba8cee08fcbf6eef14`, tree `ebf78192d36992bb5e74870c1d728ea0e2836e5b`; all five CI jobs pass in run `39978434188` attempt 2. Netlify deploy `6adbbf85637609345d34fe47` is published; fresh public home, health, buying, tracking and partner routes return HTTP 200. One local version 3 AAB and derived APK for `com.mirtpage.app` share the approved signing certificate. | Protected `.local/s170-direct-prod-resume-result.json` and `.local/s170-native-v3/result.json` bind exact plans and hashes. AAB SHA `38c946635e8b9aa43f7d499f3e7a3eb4f12c3dad37181347052bb0f4b8fccc7d`; APK SHA `25da5cecf58049da7bf720491571f336e6b1dcbc5757a4f9e11e2bc324f6db1a`. The EAS wrapper timed out after successful Gradle compilation and artifact output; independent bundle/signature/package inspection qualified the saved AAB before deriving the APK without another compilation. Earlier Netlify and runner stops remain preserved, not rewritten as passing executions. Physical Android workflows, Play Console review/upload, actual closed-test opt-ins and browser cancellation provenance remain open. |
| E10 — S180 historical web delivery | PR #45 merged as `36e6b1fb3d4f218b8e58e996151071ed29c10c55`, tree `e3d462be1eb74a0d6c721178e91a49b09a34a7c2`; all five required jobs pass in PR run `40214996503` and main run `40215804197`. Netlify deploy `6ade42137f331c939a820177` was published and is retained for recovery; E12 supersedes its current-delivery status. Independent readback passed 15 public routes/assets and an optimized image; App Links contains all four packages, including `com.africmade.app`, with the retained signer. | Protected root `.local/africmade-firebase-s180/`: `readiness-check-qualification.json` and `local-gates-main36e6b1f.json` qualify all 78 local stages across retained executions; the literal failed check and original CI/browser failures remain failed. `config-tests/web-release-readiness/` records passing `release:web` and 20/20 actual disposable-provider acceptance. `native-prep/web-delivery-pending/` contains `s180-direct-prod-result.json` (SHA `69a7f39b…de350cc6`), `s180-provider-after.json` (`c91aa5ee…7d94d3a4`) and `s180-live-readback.json` (`16c9ea63…411d92b8`). Exact artifact SHA `152e8925cc247668693322736a06cc92b031266c68187c457020d47a58d8e83e`; inventory SHA `4316a7a2beb33cdc672d0e740564fac68768bc3f82d25b72bfa64b7dae5452de`. Actual Linux import-only proof is `s180-linux-runtime-result.json` (`940709ac…3ef2d930`); public association body SHA `8b06558444545da613972750e4c9856eca9939614b178233b950c9f16d3d363d`. Target and 41 environment objects/fingerprint are unchanged; prior deploy remains ready. No worker execution, installed-device, FCM or Play qualification is inferred. |
| E11 — S180 local Android v1; static pass, device/Play pending | One owner-approved compilation from `36e6b1fb3d4f218b8e58e996151071ed29c10c55` succeeded with exit 0 at `2026-10-25T21:22:06.989Z`, 3036.057 seconds after attempt start. `com.africmade.app` versionCode 1 / SDK 36, non-debuggable manifests, retained signer, standalone Firebase compiled resources, Hermes/runtime bindings, finite private-pattern scans and all 100 native-library ABI checks pass. The 50 64-bit libraries pass 16-KB PT_LOAD alignment; APK ZIP/AAB page alignment is verified. Artwork review covers all 31 variants/resource graphs and the complete 31-permission inventory is retained. | Protected root `.local/africmade-firebase-s180/native-prep/`: build `s180-native-v1/result.json` SHA `44fc07d2…2309aaa6`; independent static `s180-binary-inspection-attempt02/final-inspection-receipt.json` SHA `249cbc7eba71e624e1fc34db0b19a12d0e1f8d5f7cc7ae2975530af242c60747`, with `artwork-review.json` SHA `47695a57fdd040932279d2b630316b24d475160b069dba73e7019e3f935a8e5a` in that directory. AAB SHA `f4074b47b18f30a5c216812aea68f53ab34839e67948c2bf3b00315ef6411bb3` (93,793,798 bytes); derived APK SHA `f55017897af34f08de41eee6d5f4d8f258ffdec5e6895eab1cc590405e58145a` (155,002,525 bytes); APKS SHA `6c4006ca60de1aa181cef7a8f23bf26431e60078d0b8a51ee90b3b1d2fee0bd0` (155,002,827 bytes). Those 380 native inputs/tool bindings were unchanged for the S180 v1 admission; E12 owns the 383-input successor. Attempt 01 stopped on the installed manifest parser’s resource-reference format; one reviewed inspection correction passed without another compilation. The exact one-build exception is consumed. DEP-044 owns actual permission limits; physical-phone workflows, 16-KB device runtime, screenshots, FCM/EAS binding, push and Play remain unqualified. Finite static scans are not an exploitability assessment, permission-behavior test or no-data-collection proof. |
| E12 — S181–S184 current web delivery | Integrated source, terminal five-job PR/main CI, exact published artifact and 29 public readbacks are qualified. Web publication and native admission remain separate. | [Current delivery](#current-s181s184-delivery) owns exact receipts, preserved failure composition, live 22-task/deadline/network limits and the focused inquiry-choice review. E13 owns the current native artifact; no device, push or Play outcome is inferred. |
| E13 — S183 local Android v2; composed static pass | One signed build from `75092ef` creates `com.africmade.app` code2 with the retained signer and standalone Firebase client. AAB SHA `8acec75970f5a0663cd53000098f1fe92a8e82dfff7afb3a07404cd766703cf5` (93,657,797 bytes); APK SHA `47706fd552b783fb9d4d2a80ed82d4d44eb32e68a4d96163b9a5e8011e113a6a` (154,891,933 bytes); APKS SHA `03d941edfeb2c7b2e9218b60fcbc7a9c89e7e09acc60d2bacb5d4c9166f23cf7` (154,892,235 bytes). | Canonical outputs are under protected `.local/s183-native-prep/build-draft/s183-native-v2/`: `AfricMade-play-v2.aab`, `AfricMade-v2-universal.apk` and `.apks`. [Current delivery](#current-s181s184-delivery) owns the composed independent static/artwork receipt, retained failed invocations, numeric-prefix limits and consumed exception. E11 is the exact canonical predecessor. Physical Android, FCM/EAS/push, screenshots, 16-KB device runtime and Play remain pending; no upload. |
| E14 — S186 transport chat web publication | PR #50 merges as `08999f3` with five passing required PR/main CI jobs; exact Netlify deploy `6ae0a7fb4ccd545c7dd13f55` is published. Settled phone/desktop Chrome intake and 29 public route/asset checks pass. | [S186 publication](#current-s186-chat-web-publication) owns exact source, artifact, receipts and read-only/browser limits. E13 remains the latest signed APK and predates S185; native chat parity has not been rebuilt. |

E5 terminal receipts live under protected `s151-batch-audit/b09-query-routing-recovery/`:
`gates-product-only-continuation/result.json` (11e8b230…7a256),
`composite-check-receipt.json` (f38b4df3…acd68),
`release-web-receipt.json` (ef9e5e74…d2b68) and
`acceptance-receipt.json` (80c466b3…83c7), with those three receipts in the same
continuation directory. `image-recovery-artifact/local-artifact-manifest.json`
(6d33ed8a…9a160), lineage (18575526…bf34e) and assembly (340a2244…2a314)
qualify the local artifact: exactly one static digest changed, runtime primitives
match and 114/114 focused tests pass. Final successful CI and actual
`--check-local` admission are verified. Exact plan `b32d9727…99ad7c` received
owner approval and was attempted once. Its operator stopped at
`same_deploy_manifest_update`; no operator PASS is claimed. Separate GET-only
`postpublication/independent-provider-qualification.json` (caa3389e…48b4d)
finds `6ad7f59795812d9f56be42a2` ready/published with 786/786 content hashes/sizes,
zero missing files, exact two function hashes and 41 unchanged environment objects.
Five unique ASCII-case metadata mappings leave `exactPathBytesProven: false`.

`postpublication/get-only-result.json` (0453c7f8…51855) records 26 checks, zero
failures and automatic worker health; original/384/640/3840 optimized images
are decoded. Private negative fixtures are nonexistent, not existing tenant
objects. Generic HTML200 at `/.env` remains a known limit, not a 4xx pass or
universal secret-absence proof. `browser-result.json` (23a68f91…ec984) records
nine widths, zero overlap/overflow, decoded images and complete 1024/390
preview→showroom→Back journeys with zero page errors/blocked writes, but its
`passed: false` remains for eight unclassified aborted fetches.
`abort-provenance-result.json` (0f1bfbc2…aa546) completes one further journey
without page/HTTP failures; six HTTP200 RSC cancellations remain unclassified,
and only one analytics abort is proven local-harness behavior. It cannot prove
the cause of the original eight. Browser classification remains open; this is
qualified publication/image/worker evidence, not a complete release verdict.

All protected paths above are relative to
`.local/mirtpage-final-release-20261019/` unless they already start with `.local/`.
Exact private receipts remain outside Git; source, CI, artifact, target and owner
approval are bound again for each hosted operation. No automatic restore/retry.
The current runtime bundle remains built from E1; a docs/test/one-static-file
recovery must record its separate release-source lineage truthfully.

## Current interpretation of inherited contracts

DEP-002 also maps the focused GitHub workflow skill and
[branch/PR/merge procedure](../docs/operations/GITHUB-WORKFLOW.md). Its L0 evidence
is spec/workflow/identity/narrative validation, skill/reference checks and reviewed
routing/merge-denial cases. The three previously installed project skills now
appear in the host catalog; new GitHub-skill discovery and implicit selection
remain separately qualified. Current branch/provider audit and integration debt
belong in engineering readiness; no source merge or production change is claimed.

- Current hosting is Netlify under [DEP-026]/[DEP-049]. [DEP-023] retains the
  former Vercel cutover evidence as deprecated history. DEP-002/V01 records the
  exact project Git disconnect and fresh provider readback. The reviewed nine-file
  docs commit `3c1b539` is pushed; GitHub at 2026-10-20 23:34:18 UTC observes no
  status contexts, checks or deployments on that head. This is a point-in-time
  no-Vercel-trigger result, not future certainty or passing/queued CI; non-main
  pushes without a PR do not trigger the five required jobs. Protected
  `workflow-improvement-research/vercel-retirement/post-push-observation.json`
  retains the read-only result. The project, account App installation, old
  deployments, portable dependencies and privacy exclusions remain intact.
- Products are the current catalog, including ready/custom-order labels:
  [FE-067]/[BE-056] supersede older service-offering behavior.
- Business contact is configured external SMS/Telegram/WhatsApp with localized
  product copy and business-local saved lists: [FE-066]/[BE-055]. Direct platform
  business inquiry submission/inbox is retired; historical isolation remains.
- Staff business authority is administrator-controlled [FE-072]/[BE-060]; owner
  consent/assignment does not restore revoked authority. Owner account-security
  changes use [FE-073]/[BE-061]/[DEP-050] and remain independently gated.
- Shipment tracking is independent of conversation IDs, with recipient email
  verification and multiple editable shipments: [FE-069]/[BE-058]/[DEP-048].
  Provider links/codes are organized per leg; no scan integration/date promise.
- Current identity is MirtPage with en/am/om enabled. [FE-070]/[BE-059]/[DEP-049]
  override obsolete brand/domain/package/copy readings without renaming stable
  keys or tenant identity. Former `CURRENT` dates are historical.

## Cross-layer requirements and implementation

The table includes all 185 FE/BE/DEP feature IDs. Source links are existing
implementation entry points, not a promise that every historical route is still
active. The specification links retain the complete current scope, invariants,
related layers, test criteria and detailed completion evidence.

| Spec / contract | Declared status | Related layers | Implementation entry / scope | Mapped tests |
| --- | --- | --- | --- | --- |
| [FE-001] Public showroom discovery and inquiry experience | done; external contact: FE-066 | [FE-066], [FE-041], [BE-001], [DEP-001], [FE-006], [FE-008], [FE-010], [FE-012], [FE-016], [FE-020], [FE-021] | [ShowroomApp.tsx](../components/showroom/ShowroomApp.tsx), [inquiries.ts](../lib/inquiries.ts) | [Test plan][FE-001-tests]: `app.spec.ts`, `http-smoke.mjs` |
| [FE-002] Programmatic form labels and modal focus safety | done |  | [ShowroomApp.tsx](../components/showroom/ShowroomApp.tsx) | [Test plan][FE-002-tests] |
| [FE-003] Managed showroom project and review workspace | in_progress | [BE-003], [BE-007], [BE-025], [DEP-003], [FE-006], [FE-007], [FE-008], [FE-013], [FE-017], [FE-021], [FE-025], [FE-031], [FE-032], [ADR-0004], [ADR-0006] | [revision-service.ts](../lib/revision-service.ts), [postgres-migrations.ts](../lib/postgres-migrations.ts) | [Test plan][FE-003-tests]: `app.spec.ts`, `http-smoke.mjs` |
| [FE-004] Cross-industry showroom component laboratory | done | [BE-005], [DEP-004], [FE-005], [FE-009], [ADR-0005], [ADR-0007] | [showroom-bank-release.ts](../lib/showroom-bank-release.ts), [capabilities.ts](../lib/capabilities.ts) | [Test plan][FE-004-tests]: `test-security.ts`, `test-showroom-bank.ts` |
| [FE-005] Mobile-first showroom experience system | done | [BE-006], [DEP-004], [DEP-005], [FE-004], [FE-006], [FE-009], [FE-034], [FE-035], [BE-005], [ADR-0005], [ADR-0007] | [showroom-experience.ts](../lib/showroom-experience.ts), [showroom-bank-release.ts](../lib/showroom-bank-release.ts) | [Test plan][FE-005-tests]: `test-showroom-experience.ts`, `app.spec.ts` |
| [FE-006] Deterministic composed showroom rendering | in_progress | [BE-007], [DEP-004], [DEP-005], [DEP-006], [FE-001], [FE-003], [FE-005], [FE-007], [FE-009], [BE-004], [BE-005], [BE-006], [ADR-0005], [ADR-0007] | [revision-domain.ts](../lib/revision-domain.ts), [revision-service.ts](../lib/revision-service.ts) | [Test plan][FE-006-tests]: `test-showroom-renderer.ts`, `app.spec.ts` |
| [FE-007] AI showroom recipe import and focused staff studio | in_progress | [FE-003], [FE-006], [FE-008], [FE-009], [FE-014], [FE-016], [FE-031], [BE-008], [BE-009], [BE-010], [BE-013], [DEP-007], [DEP-009], [DEP-011], [ADR-0005], [ADR-0006], [ADR-0007] | portable current content/content-block/design/component-bank/recipe schemas, named independent contract manifest, fixed… | [Test plan][FE-007-tests]: `app.spec.ts`, `test-showroom-recipe.ts` |
| [FE-008] Simple client and staff product upkeep | done | [FE-001], [FE-003], [FE-007], [FE-016], [FE-017], [BE-009], [DEP-008], [ADR-0006], [FE-042], [FE-043] | [ProductForm.tsx](../components/ProductForm.tsx), [ProductUpkeepList.tsx](../components/ProductUpkeepList.tsx) | [Test plan][FE-008-tests]: `app.spec.ts`, `test-product-upkeep.ts` |
| [FE-009] Creative showroom bank and focused v4 studio | in_progress | [FE-004], [FE-005], [FE-006], [FE-007], [FE-014], [FE-025], [FE-029], [FE-031], [BE-005], [BE-006], [BE-007], [BE-008], [BE-010], [BE-013], [BE-024], [BE-028], [DEP-004], [DEP-005], [DEP-006], [DEP-007], [DEP-009], [DEP-011], [DEP-013], [DEP-021], [ADR-0005], [ADR-0007], [ADR-0008], [ADR-0012] | [revision-v4-defaults.ts](../lib/revision-v4-defaults.ts), [showroom-design-systems.ts](../lib/showroom-design-systems.ts) | [Test plan][FE-009-tests]: `test-showroom-bank.ts`, `test-showroom-recipe.ts` |
| [FE-010] Public daily Expo geographic map | deprecated | [FE-001], [FE-011], [FE-012], [FE-015], [BE-011], [BE-016], [DEP-010], [DEP-011], [DEP-013], [DEP-015] | Superseded by FE-020, BE-019, and DEP-016 | [Test plan][FE-010-tests]: `app.spec.ts`, `test-expo.ts` |
| [FE-011] Expo administration controls | deprecated | [FE-010], [FE-017], [BE-012], [DEP-010] | Superseded by paginated discovery profiles and focused editing under FE-020 and BE-019 | [Test plan][FE-011-tests]: `app.spec.ts`, `test-bazaar.ts` |
| [FE-012] Visual marketplace homepage | deprecated | [FE-001], [FE-010], [FE-013], [FE-015], [FE-017], [BE-011], [DEP-010], [DEP-011], [DEP-013] | [marketplace-home.ts](../lib/marketplace-home.ts) | [Test plan][FE-012-tests]: `app.spec.ts` |
| [FE-013] Unified platform identity and workspace shell | done | [FE-003], [FE-012], [FE-015], [FE-017], [FE-020], [FE-021], [FE-024], [FE-026], [FE-027], [FE-029], [FE-034], [FE-035], [FE-038], [FE_BASE] | [SuqpageBrand.tsx](../components/SuqpageBrand.tsx), [WorkspaceNavigation.tsx](../components/WorkspaceNavigation.tsx) | [Test plan][FE-013-tests]: `app.spec.ts`, `capture-platform-form-visuals.mjs` |
| [FE-014] Recipe blueprint media studio | done | [FE-007], [FE-009], [FE-016], [FE-023], [BE-008], [BE-010], [BE-013], [DEP-009], [DEP-011], [ADR-0005], [ADR-0007] | [showroom-blueprint.ts](../lib/showroom-blueprint.ts), [showroom-guidance.ts](../lib/showroom-guidance.ts) | [Test plan][FE-014-tests]: `test-showroom-blueprint.ts`, `test-showroom-recipe.ts` |
| [FE-015] App-like marketplace home and Expo | deprecated | [FE-010], [FE-012], [FE-013], [BE-011], [BE-013], [BE-016], [DEP-010], [DEP-011], [DEP-013] | Superseded by the permanent City Showroom composition under FE-020 | [Test plan][FE-015-tests]: `test-marketplace-home.ts`, `app.spec.ts` |
| [FE-016] Unified products and capabilities experience | done | [FE-041], [FE-001], [FE-007], [FE-008], [FE-014], [BE-014], [DEP-011], [DEP-012] | [ProductForm.tsx](../components/ProductForm.tsx), [ProductUpkeepList.tsx](../components/ProductUpkeepList.tsx) | [Test plan][FE-016-tests]: `app.spec.ts`, `test-product-upkeep.ts` |
| [FE-017] Scalable operations workspace | done | [FE-003], [FE-008], [FE-011], [FE-012], [FE-013], [FE-020], [FE-021], [FE-024], [FE-025], [FE-026], [FE-032], [FE-035], [BE-015], [BE-025], [DEP-014] | [scalable-queries.ts](../lib/scalable-queries.ts), [pagination.ts](../lib/pagination.ts) | [Test plan][FE-017-tests]: `test-pagination.ts`, `test-scalable-queries.ts` |
| [FE-018] Showroom insights and retired renewal screens | in_progress | [FE-021], [FE-032], [BE-017], [BE-015], [DEP-015], [ADR-0010], [ADR-0011] | Tenant visit analytics remain | [Test plan][FE-018-tests] |
| [FE-019] Responsive client and staff support inbox | in_progress | [FE-060], [BE-048], [FE-049], [FE-053], [FE-056], [ADR-0023], [FE-024], [FE-026], [FE-036], [BE-018], [BE-024], [DEP-015], [DEP-026], [ADR-0009], [ADR-0012], [BE-032], [BE-040], [BE-042], [DEP-039], [FE-057], [FE-062], [DEP-043], [BE-050], [FE-068] | [support.ts](../lib/support.ts), [BuyingConversation.tsx](../components/BuyingConversation.tsx), [native buying](../apps/mobile/app/buying.tsx) | S163 local PostgreSQL/API regression passes exact 3:30 close, duplicate/foreign denial, a fresh case and the retained prior callback. Actual Chrome desktop/phone web and Expo Cancel/new-request journey passes without application errors; protected receipt: `.local/s162-transport-review/callback-journey-summary.json`. Guest callback and Cancel/new-request Chrome journeys pass. Owner web/Expo Start → End → new request passes with separate retained cases and local database readback (`.local/s165-owner-transport-browser/receipt.json`); staff desktop/phone Join, private note, public reply, End, history and resolution/reopen pass (`.local/s165-staff-browser-current.log`). Scoped agent visual review passes under DEP-002 S165 (`.local/s166-agent-visual-review.json`); full gates and installed-Android checks remain pending. [Test plan][FE-019-tests]: `test-support-staff-ui.ts`, `test-mobile-owner-transport.ts` |
| [FE-020] Permanent industry and City Showroom discovery | deprecated | [FE-001], [FE-013], [FE-017], [FE-021], [BE-019], [DEP-016] | Superseded by exact-location markers and the separate daily country-wide industry Daily Featured under FE-021, BE-020, and DEP-017 | [Test plan][FE-020-tests]: `test-discovery.ts`, `app.spec.ts` |
| [FE-021] Geographic Showroom map and Daily Featured Showrooms | in_progress | [FE-074], [FE-053], [FE-058], [FE-001], [FE-003], [FE-013], [FE-017], [FE-018], [FE-020], [FE-022], [FE-024], [FE-027], [FE-028], [FE-030], [FE-033], [FE-034], [FE-036], [FE-037], [FE-048], [BE-019], [BE-020], [BE-021], [BE-023], [BE-029], [BE-041], [DEP-016], [DEP-017], [DEP-024], [DEP-026], [DEP-049], [ADR-0011], [ADR-0016], [FE-065] | [map-clustering.ts](../lib/map/map-clustering.ts), [web map](../components/MarketplaceMap.tsx), [native marker](../apps/mobile/src/MapMarker.tsx) | S181/S182 compact controls, first-safe grouping, named pins and Featured workflows pass focused tests and actual desktop/phone web/Expo review; coordinate/ID authority and short/enlarged picker behavior remain covered. [Current delivery](#current-s181s184-delivery) owns composed gates, terminal CI and publication; [local workflow evidence](#s181s182-map-featured-and-public-footer-qualification) retains synthetic-tile/platform limits. Installed Android/MapLibre event qualification remains separate. [Test plan][FE-021-tests]. |
| [FE-022] Rich offering and live showroom presentation | done | [FE-021], [FE-023], [FE-030], [BE-021], [DEP-018] | Additive schema migration 24, offering/live validation, fail-closed discovery projection, Daily Featured presentation precedence,… | [Test plan][FE-022-tests]: `test-product-upkeep.ts`, `test-showroom-recipe.ts` |
| [FE-023] Complete demo showroom portfolio | in_progress | [FE-014], [FE-022], [FE-024], [BE-013], [BE-022], [DEP-011], [DEP-019] | [scale-demo-seed.ts](../lib/scale-demo-seed.ts), [showroom-seed-briefs.ts](../lib/showroom-seed-briefs.ts) | [Test plan][FE-023-tests]: `test-demo-client-portfolio.ts`, `test-showroom-benchmarks.ts` |
| [FE-024] Suqpage marketplace and attention shell | in_progress | [FE-013], [FE-017], [FE-019], [FE-021], [FE-023], [FE-025], [FE-027], [FE-028], [FE-029], [FE-030], [FE-033], [FE-036], [BE-023], [DEP-017], [DEP-019], [DEP-020], [DEP-021] | [discovery-contract.ts](../lib/discovery-contract.ts), [discovery.ts](../lib/discovery.ts) | [Test plan][FE-024-tests]: `test-featured-sponsor-layout.ts`, `app.spec.ts` |
| [FE-025] Launch-ready marketplace and showroom workspace | done | [FE-003], [FE-009], [FE-017], [FE-024], [FE-026], [FE-027], [FE-028], [FE-031], [FE-035], [FE-036], [BE-008], [BE-010], [BE-024], [BE-025], [DEP-015], [DEP-020], [DEP-021], [ADR-0012] | Process-section controlled video, private request and support attachments, post-import labeled image checklist, exact… | [Test plan][FE-025-tests]: `app.spec.ts`, `test-discovery.ts` |
| [FE-026] Role-oriented workspace navigation | in_progress | [FE-065], [BE-032], [BE-033], [FE-013], [FE-017], [FE-019], [FE-025], [FE-029], [FE-031], [FE-032], [FE-033], [FE-034], [FE-035], [FE-053], [BE-018], [BE-026], [BE-028], [BE-044], [DEP-021], [DEP-022], [ADR-0013], [FE-062], [FE-056], [FE-047], [BE-054], [FE-072], [BE-060] | Stable administrator destinations, support-agent management, role-aware navigation, asynchronous password work, bounded… | [Test plan][FE-026-tests]: `test-workspace-current-navigation.ts`, `test-staff-navigation.ts` |
| [FE-027] Small-scale local production public narrative | done | [FE-013], [FE-021], [FE-024], [FE-025], [FE-028], [FE-030], [FE-036], [FE-038], [FE-039] | [page.tsx](../app/(public)/page.tsx), [DiscoveryWorkspace.tsx](../components/DiscoveryWorkspace.tsx) | [Test plan][FE-027-tests]: `test-platform-narrative.mjs`, `app.spec.ts` |
| [FE-028] Producer story and scalable venue art direction | in_progress | [FE-021], [FE-024], [FE-025], [FE-027], [FE-029], [FE-030] | [DiscoveryWorkspace.tsx](../components/DiscoveryWorkspace.tsx), [discovery-venue-layout.ts](../lib/discovery-venue-layout.ts) | [Test plan][FE-028-tests]: `test-platform-narrative.mjs`, `test-discovery.ts` |
| [FE-029] Suqpage platform visual system refresh | done | [FE-009], [FE-013], [FE-024], [FE-026], [FE-028], [FE-030], [FE-038] | Shared semantic platform tokens, compact Suqpage mark/wordmark, public discovery and venue presentation, public task forms,… | [Test plan][FE-029-tests]: `test-platform-identity.mjs`, `capture-discovery-visuals.mjs` |
| [FE-030] Search-led marketplace homepage | in_progress | [FE-058], [FE-052], [FE-041], [FE-021], [FE-022], [FE-024], [FE-027], [FE-028], [FE-029], [FE-031], [FE-033], [FE-034], [FE-036], [FE-037], [BE-021], [BE-023], [FE-042], [FE-065] | [page.tsx](../app/(public)/page.tsx), [DiscoveryWorkspace.tsx](../components/DiscoveryWorkspace.tsx) | [Test plan][FE-030-tests]: `test-platform-narrative.mjs`, `test-homepage-composition.mjs` |
| [FE-031] Focused client workspace and combined process story | done | [FE-003], [FE-007], [FE-009], [FE-025], [FE-026], [FE-030], [FE-032], [FE-035], [BE-008], [BE-010], [BE-024], [BE-028], [DEP-011], [DEP-023] | [revision-v4-defaults.ts](../lib/revision-v4-defaults.ts), [showroom-design-systems.ts](../lib/showroom-design-systems.ts) | [Test plan][FE-031-tests] |
| [FE-032] Unified business directory and task-oriented workspace | in_progress | [FE-056], [FE-003], [FE-017], [FE-018], [FE-026], [FE-031], [FE-035], [BE-015], [BE-017], [BE-023], [DEP-023], [FE-042] | Public/account/workspace headers and shop return row | [Test plan][FE-032-tests] |
| [FE-033] Automatic and adjustable Daily Featured scheduling | in_progress | [FE-036], [FE-052], [FE-021], [FE-024], [FE-026], [FE-030], [FE-037], [BE-023], [BE-027], [BE-029], [DEP-020], [DEP-023], [DEP-024] | S182 single 20:15–21:45 EAT agenda; at most four businesses | Shared timing/capacity/privacy tests and actual disposable-provider admin four-business Save/reload/PostgreSQL readback, automatic reset and staff denial pass. Public web/Expo category retention and presentation times pass; [current delivery](#current-s181s184-delivery) owns publication. [Test plan][FE-033-tests]: `test-featured-schedule.ts`, `test-featured-broadcast-header.ts`, `test-security.ts`. |
| [FE-034] Installable PWA and mobile application shell | done | [FE-056], [FE-005], [FE-013], [FE-021], [FE-026], [FE-030], [FE-035], [FE-036], [FE-038], [FE_BASE], [DEP-020], [DEP-023], [DEP-025] | Standards-based manifest and icon set, cache-bounded first-party worker, branded offline route, shared public phone tabs across… | [Test plan][FE-034-tests]: `test-pwa-shell.mjs`, `capture-pwa-shell.mjs` |
| [FE-035] Cross-role accessibility and interface clarity | done | [FE-074], [FE-005], [FE-013], [FE-017], [FE-025], [FE-026], [FE-031], [FE-032], [FE-034], [FE-036], [FE-038], [FE_BASE], [DEP-002] | Shared public, showroom, administrator, operations, and client interfaces | [Test plan][FE-035-tests]: `test-accessibility-audit.mjs`, `test-demo-client-portfolio.ts` |
| [FE-036] Routed public marketplace application | in_progress | [FE-074], [FE-041], [FE-019], [FE-021], [FE-024], [FE-025], [FE-027], [FE-030], [FE-034], [FE-035], [FE-037], [FE-038], [FE-039], [BE-023], [DEP-025], [FE-033], [FE-052], [FE-053], [FE-056], [DEP-043], [BE-018] | Market at / | [Test plan][FE-036-tests]: `test-public-workspace-loading.ts`, `test-public-transport-launcher.ts` |
| [FE-037] Current marketplace and Daily Featured language | deprecated | [FE-021], [FE-030], [FE-033], [FE-036], [FE-039], [BE-017], [BE-029], [DEP-023], [DEP-025] | Current public routes, query/referral contracts, active component hooks, Daily Featured program modules, Marketplace admin, exact… | [Test plan][FE-037-tests]: `test-discovery.ts`, `app.spec.ts` |
| [FE-038] Suqpage identity and passwordless account entry | in_progress | [FE-051], [FE-046], [DEP-033], [BE-036], [BE-032], [FE-040], [FE-013], [FE-027], [FE-029], [FE-034], [FE-035], [FE-036], [FE-039], [BE-031], [DEP-026], [DEP-027], [DEP-028], [ADR-0017], [FE-072], [BE-060], [FE-073], [BE-061], [DEP-050] | Request-time entry pages and compatible Auth proxy | [Test plan][FE-038-tests]: `capture-mobile-brand.mjs`, `test-platform-identity.mjs` |
| [FE-039] Plain-language Suqpage pages and task-focused copy | done | [FE-044], [FE-027], [FE-036], [FE-037], [FE-038], [BE-031], [DEP-028] | Market/About/auth/setup copy, Suqpage page actions, Google display-name hint, additive private onboarding category, and separate… | [Test plan][FE-039-tests]: `test-platform-narrative.mjs`, `test-auth-runtime.ts` |
| [FE-040] Simple owner-controlled business profiles | in_progress; staff authority: FE-072 | [FE-066], [FE-060], [BE-045], [FE-056], [FE-054], [FE-046], [FE-044], [FE-041], [BE-031], [FE-038], [BE-032], [DEP-030], [ADR-0018], [FE-042], [FE-043] | BusinessProfile, SuqpageBrand, owner editor, draft/consent and publication ports, scoped cover routes, public discovery cache,… | [Test plan][FE-040-tests]: `test-account-contacts.ts`, `test-signup.ts` |
| [FE-041] Linked product pages and simple single or grouped inquiries | in_progress | [FE-074], [FE-066], [FE-050], [FE-047], [FE-044], [FE-001], [FE-016], [FE-030], [FE-036], [FE-040], [BE-001], [DEP-030], [FE-042], [FE-049], [FE-053], [BE-044] | ProductPage, product-inquiry domain helpers, ShowroomApp composer, DiscoveryWorkspace split map/search, product metadata | [Test plan][FE-041-tests]: `test-native-showroom-cards.ts`, `test-showroom-card-excerpt.ts` |
| [FE-042] Paginated category results and standard page workspaces | in_progress | [FE-048], [FE-030], [FE-032], [FE-040], [FE-041], [BE-033], [DEP-030], [FE-008], [FE-043], [FE-065], [FE-072], [BE-060] | SQL result pagination, page-review lifecycle, standard dashboards, retired custom routes, draft product media | [Test plan][FE-042-tests]: `capture-search-drawer.mjs` |
| [FE-043] Complete seller and operations launch workflows | in_progress | [FE-045], [FE-042], [FE-040], [FE-008], [BE-034], [DEP-030] | Product options/visibility commands, owner identity/location proposal, admin exact-version geographic approval, private identity… | [Test plan][FE-043-tests] |
| [FE-044] Inclusive business and service discovery | done; product-only: FE-067 | [BE-037], [DEP-034], [FE-039], [FE-040], [FE-041], [FE-067] | Existing offering/catalog/inquiry ports with additive service kind | [Test plan][FE-044-tests]: `capture-service-place.ts` |
| [FE-045] Searchable city and town selection | done | [BE-038], [DEP-035], [FE-043] | Existing place data and owner location proposal boundary | [Test plan][FE-045-tests]: `capture-service-place.ts` |
| [FE-046] Complete new business starter pages | done | [FE-061], [BE-049], [FE-052], [FE-051], [FE-038], [BE-039], [DEP-036], [FE-040] | [Contract and implementation scope][FE-046] | [Test plan][FE-046-tests]: `test-business-starters.ts`, `capture-business-starters.ts` |
| [FE-047] Five-field offering editor | in_progress | [FE-050], [FE-048], [FE-041], [BE-040], [DEP-037], [FE-067], [FE-026], [FE-053], [FE-056], [BE-032] | [actions.ts](../app/actions.ts) | [Test plan][FE-047-tests]: `test-product-edit-action.ts`, `test-product-editor-workflow.ts` |
| [FE-048] Self-service owner workspace | in_progress | [BE-041], [DEP-038], [FE-047], [FE-042], [FE-021] | owner-page-save/publication, owner-business-runtime, ProductForm, dashboard/admin, discovery, map-display-location, setup | [Test plan][FE-048-tests]: `test-self-service-publication.ts` |
| [FE-049] Five-language interface | in_progress; active en/am/om; FE-070 | [BE-058], [DEP-048], [FE-069], [FE-066], [FE-019], [FE-055], [FE-053], [FE-052], [FE-051], [FE_BASE], [BE_BASE], [DEP_BASE], [ADR-0022], [FE-041], [FE-062], [DEP-044], [FE-065], [FE-067], [FE-063], [FE-068] | Owner inquiries, discovery, demo labels, first publication, locale catalogs | [Test plan][FE-049-tests]: `capture-product-ready.mjs`, `test-launch-materials.mjs` |
| [FE-050] Product media gallery | in_progress | [FE-061], [BE-049], [FE-060], [BE-048], [FE-041], [FE-047], [BE-042], [DEP-039], [FE-057], [BE-046] | [Contract and implementation scope][FE-050] | [Test plan][FE-050-tests]: `capture-launch-wiring.mjs` |
| [FE-051] Automatic starter and editable address | done | [FE-059], [BE-047], [FE-056], [FE-053], [FE-038], [FE-046], [FE-049], [BE-043], [DEP-040] | Public/account/workspace headers and shop return row | [Test plan][FE-051-tests] |
| [FE-052] Clear launch journeys and natural interface language | in_progress | [FE-066], [BE-001], [BE-032], [FE-049], [FE-030], [FE-033], [FE-046], [DEP-030], [FE-036], [FE-053], [DEP-044], [FE-067], [FE-065] | Owner inquiries, discovery, demo labels, first publication, locale catalogs | [Test plan][FE-052-tests]: `test-about-audiences.ts`, `test-mobile-market-layout.ts` |
| [FE-053] Native visitor and business-owner app | in_progress | [FE-074], [FE-066], [FE-026], [FE-021], [FE-061], [FE-060], [FE-059], [FE-058], [FE-056], [FE-051], [FE-055], [FE-054], [BE-044], [DEP-042], [FE_BASE], [FE-019], [FE-049], [ADR-0023], [FE-036], [FE-052], [FE-057], [FE-062], [FE-063], [FE-064], [FE-065], [DEP-043], [BE-018], [FE-067], [FE-041], [FE-047], [BE-050], [BE-023], [FE-068], [FE-069], [BE-058], [DEP-048], [FE-072], [BE-060], [FE-073] | [leaflet-resize.ts](../lib/map/leaflet-resize.ts), [reviewer-access.ts](../lib/reviewer-access.ts) | S166 Expo owner intake and new-request journey pass in actual Chrome at 320/390 in English, Amharic and Afaan Oromo; the compact utility controls and shared language header show no horizontal overflow (`.local/s165-owner-transport-browser/receipt.json`, `.local/s166-agent-visual-review.json`). Installed Android remains unverified for this source. [Test plan][FE-053-tests]: `test-mobile-owner-edit-navigation.ts`, `test-visible-chat-reads.ts` |
| [FE-054] Restrained business storefront accents | in_progress | [FE-040], [FE-053], [BE-031], [BE-041], [BE-044] | [Contract and implementation scope][FE-054] | S181 saved business-accent validation, contrast, defaults and cart A→B isolation pass installed-renderer and PostgreSQL/DTO regressions. Actual web/Expo cases qualify default palette, inquiry-list scope and return; the marked demos lack saved accents, so no actual saved-colour pair is claimed. [Local workflow evidence](#s181s182-map-featured-and-public-footer-qualification); [current delivery](#current-s181s184-delivery). [Test plan][FE-054-tests]: `test-storefront-accent.ts`, `capture-storefront-accent.mjs`, `test-floating-inquiry-web.ts`, `test-mobile-public-action-dock.ts`. |
| [FE-055] Discoverable account deletion requests | in_progress | [FE-053], [FE-049], [DEP-042], [DEP-044], [BE-053] | scripts/operations/account-erasure.ts | [Test plan][FE-055-tests]: `capture-account-deletion.mjs` |
| [FE-056] Owner Profile and focused editing | in_progress | [FE-074], [FE-026], [FE-036], [FE-066], [FE-034], [FE-032], [FE-040], [FE-051], [FE-053], [FE-059], [BE-018], [BE-032], [BE-038], [BE-041], [BE-044], [BE-045], [DEP-042], [FE-067], [FE-047], [FE-072], [BE-060], [FE-073] | Existing owner/home, account/page/business/handle ports, city-centered exact-pin selector and focused web/native editors | [Test plan][FE-056-tests]: `test-product-editor-workflow.ts`, `test-owner-editor-failures.ts`, `capture-signup-city.mjs` |
| [FE-057] Embedded TikTok product videos | in_progress | [ADR-0025], [FE-060], [BE-046], [FE-050], [FE-019], [FE-053], [DEP-039], [DEP-042], [ADR-0024] | [Contract and implementation scope][FE-057] | [Test plan][FE-057-tests]: `test-product-video.ts`, `test-video-requests.ts` |
| [FE-058] Free exploration of the world map | in_progress | [FE-021], [BE-041], [FE-030], [FE-053], [DEP-042], [ADR-0016], [ADR-0023], [BE-023] | [Contract and implementation scope][FE-058] | [Test plan][FE-058-tests]: `test-mobile-map.ts`, `capture-world-map.mjs` |
| [FE-059] Choose the business city during initial setup | in_progress | [BE-047], [FE-051], [FE-053], [FE-056], [BE-031], [BE-038], [BE-041], [DEP-042], [FE-065], [BE-054] | Canonical city selection and optional exact-public map point during signup | [Test plan][FE-059-tests]: `app.spec.ts`, `test-signup.ts`, `test-mobile-api.ts`, `capture-signup-city.mjs` |
| [FE-060] Direct cover and product video links | in_progress | [FE-061], [ADR-0025], [BE-048], [FE-057], [FE-050], [FE-040], [FE-019], [FE-053], [BE-032], [BE-042], [DEP-039], [DEP-042], [ADR-0024] | [Contract and implementation scope][FE-060] | [Test plan][FE-060-tests]: `test-product-video.ts`, `test-owner-page.ts` |
| [FE-061] Category-relevant starter and multi-provider demo videos | in_progress | [BE-049], [FE-046], [BE-039], [FE-060], [BE-048], [FE-050], [FE-053], [DEP-039], [DEP-042] | [Contract and implementation scope][FE-061] | [Test plan][FE-061-tests]: `test-business-starters.ts` |
| [FE-062] Inquiry and chat alerts with truthful read receipts | in_progress | [FE-069], [FE-066], [BE-050], [DEP-043], [ADR-0026], [FE-019], [FE-026], [FE-049], [FE-053], [FE-068] | attention contracts/PostgreSQL events/receipts, web/native controls and scoped provider outbox | [Test plan][FE-062-tests]: `test-visible-chat-reads.ts`, `capture-notification-workflows.mjs` |
| [FE-063] Listing reports and business blocking | in_progress | [BE-051], [DEP-044], [FE-049], [FE-053] | Local pure catalog-safety/listing-report contracts, private PostgreSQL port/migration 63, scoped web Reports queue, web/native… | [Test plan][FE-063-tests]: `test-catalog-safety.ts` |
| [FE-064] Restricted reusable store-review access | in_progress | [BE-052], [DEP-044], [FE-053] | [reviewer-access.ts](../lib/reviewer-access.ts) | [Test plan][FE-064-tests] |
| [FE-065] Independent business-map and product-card discovery | in_progress | [FE-074], [FE-026], [BE-054], [DEP-045], [FE-030], [FE-042], [FE-049], [FE-053], [FE-059], [BE-047], [ADR-0027], [FE-067], [BE-044], [FE-021], [FE-052] | [use-market-feed.ts](../lib/use-market-feed.ts) | S181 compact phone/native search and Filters overview, country/city prerequisites, counts/clear/loading, readiness and scope/Back pass focused tests and actual Chrome/local-API journeys at 1440/390/320px with en/am/om. The demonstrated native overview overlap and short/enlarged web geometry defects are reproduced and corrected. [Local workflow evidence](#s181s182-map-featured-and-public-footer-qualification) retains original freezes and synthetic-tile/platform limits; [current delivery](#current-s181s184-delivery) owns all 78 composed check stages, release/20 acceptance cases, terminal CI and exact publication. S180 readiness evidence remains historical under E10. [Test plan][FE-065-tests]: `test-market-workspace-ui.ts`, `test-market-feed-retention.ts`. |
| [FE-066] External business contact with localized product messages | in_progress | [FE-040], [BE-055], [DEP-045], [FE-001], [FE-041], [FE-049], [FE-052], [FE-053], [FE-056], [FE-062], [FE-067] | [Contract and implementation scope][FE-066] | [Test plan][FE-066-tests]: `test-mobile-api.ts`, `test-live-transport.ts` |
| [FE-067] Product-only showrooms and made-to-order discovery | in_progress | [BE-056], [DEP-046], [FE-044], [FE-047], [FE-049], [FE-052], [FE-053], [FE-056], [FE-065], [FE-066] | [Contract and implementation scope][FE-067] | [Test plan][FE-067-tests]: `test-product-only-web.ts`, `test-product-only-native-ui.ts` |
| [FE-068] Ordered transport plan editor and live requester view | ready | [FE-069], [BE-057], [BE-044], [FE-019], [FE-049], [FE-053], [FE-062], [DEP-047] | [Contract and implementation scope][FE-068] | [Test plan][FE-068-tests]: `test-transport-plan-ui.ts`, `test-transport-plan-live.ts` |
| [FE-069] Independent tracking portal and staff tracking workspace | in_progress | [FE-074], [BE-058], [FE-068], [FE-049], [FE-053], [FE-062], [DEP-048] | [Contract and implementation scope][FE-069] | [Test plan][FE-069-tests]: `test-tracking-staff-ui.ts`, `test-tracking-portal-ui.ts` |
| [FE-070] AfricMade identity and supplier-focused digital showrooms | in_progress; web published, native static pass | [BE-059], [DEP-029], [DEP-049], [DEP-051], [FE-041], [FE-049], [FE-071], [ADR-0029] | [Contract and implementation scope][FE-070] | S181 grouped public footer and S183 mask-safe orange-on-white launcher/splash/PWA derivatives pass focused tests, generated-resource checks and agent-owned Chrome/Expo review. Transparent favicon, approved mark, wordmark and email artwork remain unchanged. [S183 qualification](#s183-icon-and-splash-mask-qualification) owns static/preview evidence; [current delivery](#current-s181s184-delivery) owns published web and E13's composed native static admission. E11 is the earlier native predecessor; installed v2/physical/Play qualification remains pending. |
| [FE-071] Search discovery for public MirtPage showrooms and products | in_progress | [FE-070], [BE-054], [DEP-049] | [route.ts](../app/api/public/showroom-status/route.ts) | [Test plan][FE-071-tests]: `test-public-seo.ts`, `test-public-seo-http.ts` |
| [FE-072] Admin-controlled staff business management | ready | [BE-060], [BE-032], [BE-033], [FE-026], [FE-056], [FE-053], [FE-042], [BE-044], [FE-038], [BE-031], [FE-073], [BE-061], [DEP-050], [DEP-049], [ADR-0030] | [Contract and implementation scope][FE-072] | [Test plan][FE-072-tests]: `test-business-team-ui.ts`, `test-staff-handle-action.ts` |
| [FE-073] Owner-verified sign-in email change | ready; local proof, hosted disabled | [BE-061], [DEP-050], [FE-072], [BE-060], [FE-038], [FE-053], [FE-056], [BE-044], [BE-031] | [Contract and implementation scope][FE-073] | [Test plan][FE-073-tests]: `test-owner-email-change-local.ts`, `test-owner-email-change.ts` |
| [FE-074] Contextual loading and layout-matched skeletons | in_progress; current E5/E7 gates pending | [FE_BASE], [FE-021], [FE-035], [FE-036], [FE-041], [FE-053], [FE-056], [FE-065], [FE-069] | [use-resource-load.ts](../apps/mobile/src/use-resource-load.ts) | [Test plan][FE-074-tests]: `test-native-resource-loading.ts`, `test-native-loading-skeletons.ts` |
| [FE-076] Transport help and provider listing interest | local implementation; visual/release pending | FE-076/BE-063; one logistics service provider is unselected on new intake, then shown in its specific choice/shipments as SharedTrucks Logistics, freight brokerage, with its approved navy/blue wordmark; provider-owned tenant/staff routing deferred | S177 provider website link appears only after a transport request starts, opens the independent company site outside chat, and keeps the native chat layout readable in English/Amharic/Afaan Oromo; focused URL/component checks and actual RNWeb Chrome 320/390/landscape layout pass (`.local/s177-brand-review/native-chat-om-390.png`). Isolated local chat fixture rendered the waiting link but its external-click follow-through remains unverified. Earlier S160 provider/intake browser states pass; full release gates pending | `npm run test:transport-partners`; `scripts/test-transport-coordinator-ui.ts`; `scripts/test-mobile-owner-transport.ts`; S160 capture; see FE-076 |
| [FE-077] Shipment records with identified shipper and receiver | draft | FE-077/BE-064; records name both parties, default only to published business contact email, and grant per-record read access after each party independently verifies; current internal transport routing is unchanged | Owner direction recorded 2026-10-21; no implementation, migration or access change authorized by this draft | [FE-077](frontend/FE-077-shipment-record-parties.md); future browser and multi-party access evidence required |
| [FE-075] Business inquiries and focused owner Inbox | local implementation; visual/release pending | FE-075/BE-062; WhatsApp/Telegram/Inbox adjacent; phone name/message intake | Focused UI/security tests; current Chrome desktop/phone and Expo phone captures show approved contact details; full list/detail workflow and visual approval remain pending | `scripts/test-restored-inquiry.ts`; `scripts/test-restored-inquiry-postgres.ts`; 15 focused UI tests; S156 captures; see FE-075 |
| [BE-001] Tenant-scoped canonical inquiry workflow | done; retained history; BE-055 retires submission | [BE-055], [FE-052], [FE-041], [FE-001], [DEP-001], [BE-009], [BE-011], [BE-014], [BE-017], [BE-033], [BE-050] | [ShowroomApp.tsx](../components/showroom/ShowroomApp.tsx), [inquiries.ts](../lib/inquiries.ts) | [Test plan][BE-001-tests]: `test-security.ts`, `http-smoke.mjs` |
| [BE-002] Authentication and external adapter failure boundaries | in_progress | [BE-018], [BE-020], [BE-025], [BE-026], [BE-030], [BE-031], [ADR-0013], [ADR-0014] | [auth.ts](../lib/auth.ts), [actions.ts](../app/actions.ts) | [Test plan][BE-002-tests] |
| [BE-003] Managed request, permission, and publication security | done | [FE-003], [BE-007], [BE-008], [BE-009], [BE-015], [BE-020], [BE-025], [DEP-002], [DEP-003], [ADR-0004], [ADR-0006], [BE-033] | [revision-service.ts](../lib/revision-service.ts), [trusted-origins.ts](../lib/trusted-origins.ts) | [Test plan][BE-003-tests]: `test-requests.ts`, `http-smoke.mjs` |
| [BE-004] Validated showroom composition contract | done | [BE-005], [BE-006], [BE-007], [BE-008], [BE-010], [FE-006], [ADR-0005], [ADR-0007] | [showroom-composition.ts](../lib/showroom-composition.ts) | [Test plan][BE-004-tests]: `test-showroom-composition.ts` |
| [BE-005] Curated cross-industry showroom bank release | done | [FE-004], [FE-005], [FE-006], [FE-009], [DEP-004], [DEP-005], [DEP-009], [BE-004], [BE-006], [BE-007], [BE-010], [ADR-0005], [ADR-0007] | [showroom-bank-release.ts](../lib/showroom-bank-release.ts), [capabilities.ts](../lib/capabilities.ts) | [Test plan][BE-005-tests]: `test-showroom-bank.ts` |
| [BE-006] Bounded showroom experience contract | done | [FE-005], [FE-006], [FE-009], [BE-007], [BE-010], [DEP-005], [DEP-009], [BE-004], [BE-005], [ADR-0005], [ADR-0007] | [showroom-experience.ts](../lib/showroom-experience.ts), [showroom-bank-release.ts](../lib/showroom-bank-release.ts) | [Test plan][BE-006-tests]: `test-showroom-experience.ts`, `test-showroom-composition.ts` |
| [BE-007] Versioned composition revision and publication | done | [FE-003], [FE-006], [FE-009], [DEP-006], [DEP-009], [BE-003], [BE-004], [BE-005], [BE-006], [BE-008], [BE-009], [BE-010], [BE-014], [ADR-0004], [ADR-0005], [ADR-0007] | [revision-domain.ts](../lib/revision-domain.ts), [revision-service.ts](../lib/revision-service.ts) | [Test plan][BE-007-tests]: `test-showroom-migration.ts`, `test-revisions.ts` |
| [BE-008] Validated full-showroom recipe import | in_progress | [FE-007], [FE-009], [FE-014], [FE-025], [FE-031], [BE-003], [BE-004], [BE-007], [BE-009], [BE-010], [BE-013], [BE-014], [BE-028], [DEP-007], [DEP-008], [DEP-009], [DEP-011], [DEP-021], [ADR-0005], [ADR-0006], [ADR-0007] | portable current content/content-block/design/component-bank/recipe schemas, named independent contract manifest, fixed… | [Test plan][BE-008-tests]: `test-showroom-recipe.ts`, `test-security.ts` |
| [BE-009] Tenant-scoped versioned product upkeep | done | [BE-042], [BE-040], [BE-001], [BE-003], [BE-007], [BE-008], [BE-014], [BE-015], [FE-007], [FE-008], [DEP-008], [ADR-0006], [BE-033], [BE-034], [BE-056], [BE-060] | [product-upkeep-domain.ts](../lib/product-upkeep-domain.ts), [product-upkeep.ts](../lib/product-upkeep.ts) | [Test plan][BE-009-tests]: `test-product-upkeep.ts`, `test-security.ts` |
| [BE-010] Revision v4 typed content and multi-release bank contract | in_progress | [BE-042], [BE-004], [BE-005], [BE-006], [BE-007], [BE-008], [BE-013], [BE-024], [BE-028], [FE-007], [FE-009], [FE-014], [FE-025], [FE-031], [DEP-004], [DEP-005], [DEP-006], [DEP-007], [DEP-009], [DEP-011], [DEP-013], [DEP-021], [ADR-0005], [ADR-0007], [ADR-0008], [ADR-0012] | [revision-v4-defaults.ts](../lib/revision-v4-defaults.ts), [showroom-design-systems.ts](../lib/showroom-design-systems.ts) | [Test plan][BE-010-tests]: `test-showroom-content-blocks.ts`, `test-showroom-recipe.ts` |
| [BE-011] Expo occurrence, city host, and booth contract | deprecated | [FE-010], [FE-012], [FE-015], [BE-012], [BE-013], [BE-016], [BE-017], [DEP-010], [DEP-011], [DEP-013], [BE-001] | Superseded by FE-020, BE-019, and DEP-016 | [Test plan][BE-011-tests]: `test-bazaar.ts`, `test-security.ts` |
| [BE-012] Expo administration operations | deprecated | [BE-011], [BE-015], [FE-011], [DEP-010] | [staff-actions.ts](../app/staff-actions.ts) | [Test plan][BE-012-tests]: `test-bazaar.ts`, `app.spec.ts` |
| [BE-013] Showroom blueprint media plan and composition fitness | done | [FE-007], [FE-009], [FE-014], [FE-015], [FE-023], [BE-008], [BE-010], [BE-011], [BE-014], [BE-022], [DEP-009], [DEP-010], [DEP-011], [ADR-0005], [ADR-0007], [ADR-0008] | [showroom-blueprint.ts](../lib/showroom-blueprint.ts), [showroom-guidance.ts](../lib/showroom-guidance.ts) | [Test plan][BE-013-tests]: `test-showroom-blueprint.ts`, `test-showroom-bank.ts` |
| [BE-014] Tenant-scoped unified offering contract | done | [BE-037], [BE-001], [BE-007], [BE-008], [BE-009], [BE-013], [BE-015], [FE-016], [DEP-012], [BE-056] | [offerings.ts](../lib/offerings.ts), [types.ts](../lib/types.ts) | [Test plan][BE-014-tests]: `test-product-upkeep.ts`, `test-security.ts` |
| [BE-015] Server-paginated collection queries | in_progress | [FE-017], [FE-018], [FE-032], [BE-003], [BE-009], [BE-012], [BE-014], [BE-017], [BE-018], [BE-019], [BE-020], [BE-023], [DEP-014] | [pagination.ts](../lib/pagination.ts), [scalable-queries.ts](../lib/scalable-queries.ts) | [Test plan][BE-015-tests]: `test-pagination.ts`, `test-scalable-queries.ts` |
| [BE-016] Balanced regional Expo allocation | deprecated | [FE-010], [FE-015], [BE-011], [DEP-010], [DEP-015] | [scale-demo-seed.ts](../lib/scale-demo-seed.ts) | [Test plan][BE-016-tests]: `test-expo.ts`, `test-scale-fixtures.ts` |
| [BE-017] Showroom visit analytics and retired subscription records | in_progress | [FE-018], [FE-032], [FE-037], [BE-001], [BE-011], [BE-015], [BE-019], [BE-020], [DEP-015], [ADR-0010], [ADR-0011] | Current public routes, query/referral contracts, active component hooks, Daily Featured program modules, Marketplace admin, exact… | [Test plan][BE-017-tests]: `test-account-health.ts`, `test-platform-naming.ts` |
| [BE-018] First-party customer support queue | in_progress | [BE-046], [BE-044], [ADR-0023], [FE-019], [FE-026], [FE-056], [BE-002], [BE-015], [BE-023], [BE-024], [BE-026], [BE-030], [BE-031], [DEP-015], [DEP-026], [ADR-0009], [ADR-0012], [ADR-0014], [BE-032], [BE-040], [BE-042], [DEP-039], [BE-050], [DEP-043], [FE-036], [FE-053], [BE-057], [ADR-0031] | [support.ts](../lib/support.ts), [support-media.ts](../lib/support-media.ts) | S163 local PostgreSQL/API regression in `test-transport-callback.ts` passes close at the exact handoff, idempotency, foreign-token denial, no callback write and assignment release; full release gate pending. [Test plan][BE-018-tests]: `test-support-signin-readiness.ts`, `test-support-assignment-response-migration.ts`, `test-support-assignment-response.ts` |
| [BE-019] Indexed industry and nearest City Showroom discovery | deprecated | [FE-020], [FE-021], [BE-015], [BE-017], [BE-020], [DEP-015], [DEP-016] | Superseded by exact-location markers and the separate daily country-wide industry Daily Featured under FE-021, BE-020, and DEP-017 | [Test plan][BE-019-tests]: `test-discovery.ts`, `test-security.ts` |
| [BE-020] Public client bootstrap and unified discovery projection | in_progress | [BE-002], [BE-003], [BE-015], [BE-017], [BE-019], [BE-023], [BE-029], [BE-031], [FE-021], [DEP-017], [ADR-0011], [ADR-0017] | [discovery.ts](../lib/discovery.ts), [DiscoveryWorkspace.tsx](../components/DiscoveryWorkspace.tsx) | [Test plan][BE-020-tests]: `test-signup.ts`, `test-security.ts` |
| [BE-021] Rich offering and live showroom contract | in_progress | [FE-021], [FE-022], [FE-030], [BE-022], [BE-023], [DEP-018] | [discovery.ts](../lib/discovery.ts), [DiscoveryWorkspace.tsx](../components/DiscoveryWorkspace.tsx) | [Test plan][BE-021-tests]: `test-product-upkeep.ts`, `test-revisions.ts` |
| [BE-022] Demo showroom portfolio contract | in_progress | [DEP-041], [FE-023], [BE-013], [BE-021], [BE-023], [DEP-019], [DEP-045], [BE-056], [DEP-046] | [scale-demo-seed.ts](../lib/scale-demo-seed.ts), [showroom-seed-briefs.ts](../lib/showroom-seed-briefs.ts) | [Test plan][BE-022-tests]: `test-demo-client-portfolio.ts`, `test-showroom-benchmarks.ts` |
| [BE-023] Discovery scale and attention projection | in_progress | [BE-015], [BE-018], [BE-020], [BE-021], [BE-022], [BE-029], [FE-021], [FE-024], [FE-030], [FE-032], [FE-033], [FE-036], [DEP-017], [DEP-019], [DEP-020], [DEP-024], [DEP-026], [BE-054], [FE-053], [FE-058] | [page.tsx](../app/(public)/page.tsx), [DiscoveryWorkspace.tsx](../components/DiscoveryWorkspace.tsx) | [Test plan][BE-023-tests]: `test-discovery-multicategory.ts`, `test-migrations.ts` |
| [BE-024] Provider-neutral media storage | done | [BE-042], [BE-010], [BE-018], [BE-026], [BE-028], [FE-009], [FE-019], [FE-025], [FE-031], [DEP-015], [DEP-021], [DEP-022], [DEP-026], [DEP-027], [ADR-0012], [ADR-0013], [ADR-0014], [ADR-0015] | Loopback-only Supabase CLI runtime with PostgreSQL 17, local Auth/private Storage, guarded setup, and SQLite restricted to… | [Test plan][BE-024-tests]: `test-media-storage.ts`, `test-product-upkeep.ts` |
| [BE-025] Retired demonstration Delivery surface | done | [FE-003], [FE-017], [FE-025], [BE-002], [BE-003], [DEP-002], [DEP-021], [ADR-0004] | Delivery navigation, pages, APIs, actions, mock adapters, fresh setup seeds, and active query paths are removed while dormant… | [Test plan][BE-025-tests]: `app.spec.ts`, `http-smoke.mjs` |
| [BE-026] Production portability hardening | done | [BE-002], [BE-018], [BE-024], [BE-028], [BE-030], [FE-026], [DEP-021], [DEP-022], [DEP-026], [ADR-0012], [ADR-0013], [ADR-0014] | Stable administrator destinations, support-agent management, role-aware navigation, asynchronous password work, bounded… | [Test plan][BE-026-tests]: `test-security.ts`, `test-auth-runtime.ts` |
| [BE-027] PostgreSQL runtime adapters and persistence parity | in_progress | [BE-035], [BE-028], [BE-029], [BE-030], [FE-033], [DEP-023], [DEP-024], [DEP-026], [DEP-027], [ADR-0013], [ADR-0014], [ADR-0015] | Loopback-only Supabase CLI runtime with PostgreSQL 17, local Auth/private Storage, guarded setup, and SQLite restricted to… | [Test plan][BE-027-tests] |
| [BE-028] Canonical showroom chapter and administrator media parity | in_progress | [BE-008], [BE-010], [BE-024], [BE-026], [BE-027], [FE-009], [FE-026], [FE-031], [DEP-011], [DEP-023], [ADR-0007], [ADR-0012] | [revision-v4-defaults.ts](../lib/revision-v4-defaults.ts), [showroom-design-systems.ts](../lib/showroom-design-systems.ts) | [Test plan][BE-028-tests]: `test-showroom-content-blocks.ts`, `test-revision-v4.ts` |
| [BE-029] Daily Featured schedule policy and override projection | in_progress | [BE-020], [BE-023], [BE-027], [FE-021], [FE-033], [FE-037], [DEP-020], [DEP-023], [DEP-024] | Four-business 20:15–21:45 EAT schedule policy and privacy-preserving projections | S182 pure timing/status tests, isolated PostgreSQL fifth-selection rejection and historical-row preservation, future-identity fences, and actual admin Save/reload/readback/automatic restore/staff denial pass. [Local workflow evidence](#s181s182-map-featured-and-public-footer-qualification) and [current delivery](#current-s181s184-delivery) own qualification/publication. [Test plan][BE-029-tests]: `test-featured-schedule.ts`, `test-clock-display.ts`. |
| [BE-030] Supabase identity bridge and session authority | in_progress | [DEP-041], [BE-002], [BE-018], [BE-026], [BE-027], [BE-031], [DEP-015], [DEP-023], [DEP-026], [DEP-027], [DEP-028], [ADR-0013], [ADR-0014], [ADR-0015], [ADR-0017], [BE-061] | Loopback-only Supabase CLI runtime with PostgreSQL 17, local Auth/private Storage, guarded setup, and SQLite restricted to… | [Test plan][BE-030-tests]: `test-auth-runtime.ts`, `test-security.ts` |
| [BE-031] Passwordless identity and authenticated business onboarding | in_progress | [BE-049], [FE-059], [BE-047], [BE-045], [FE-054], [BE-043], [BE-039], [DEP-033], [BE-032], [FE-040], [BE-002], [BE-020], [BE-030], [FE-038], [FE-039], [DEP-026], [DEP-027], [DEP-028], [ADR-0014], [ADR-0017], [BE-060], [FE-072], [FE-073], [BE-061], [DEP-050], [BE-018] | Request-time entry pages and compatible Auth proxy | [Test plan][BE-031-tests]: `test-auth-runtime.ts`, `test-signup.ts` |
| [BE-032] Tenant-owned page drafts and revocable staff assistance | in_progress; staff authority: BE-060 | [BE-055], [BE-054], [FE-026], [BE-044], [FE-060], [BE-048], [BE-045], [FE-056], [FE-052], [BE-031], [FE-038], [FE-040], [DEP-030], [ADR-0018], [BE-033], [BE-034], [FE-019], [BE-018], [DEP-039], [FE-047], [BE-060], [FE-072], [ADR-0030] | BusinessProfile, SuqpageBrand, owner editor, draft/consent and publication ports, scoped cover routes, public discovery cache,… | [Test plan][BE-032-tests]: `test-product-edit-action.ts`, `test-product-upkeep.ts` |
| [BE-033] Standard page lifecycle and server-paginated discovery | in_progress | [BE-041], [FE-042], [FE-026], [BE-001], [BE-003], [BE-032], [DEP-030], [ADR-0019], [BE-009], [BE-034], [BE-060], [FE-072] | SQL result pagination, page-review lifecycle, standard dashboards, retired custom routes, draft product media | [Test plan][BE-033-tests]: `test-standard-page-postgres.ts` |
| [BE-034] Launch catalog and owner setup integration | in_progress | [BE-039], [BE-038], [BE-037], [BE-035], [FE-043], [BE-033], [BE-032], [BE-009], [DEP-030] | Product options/visibility commands, owner identity/location proposal, admin exact-version geographic approval, private identity… | [Test plan][BE-034-tests] |
| [BE-035] PostgreSQL-only persistence in every executable environment | done | [BE-036], [BE-027], [BE-034], [DEP-031], [ADR-0020] | Native schema 43, PostgreSQL-only runtime ports, isolated PostgreSQL fixtures, archive tools and current browser bootstrap | [Test plan][BE-035-tests] |
| [BE-036] Suqpage names with persisted-state compatibility | done | [DEP-033], [BE-035], [FE-038], [DEP-032], [ADR-0021] | Request-time entry pages and compatible Auth proxy | [Test plan][BE-036-tests] |
| [BE-037] Service offerings in the canonical catalog | done; product-only: BE-056 | [FE-044], [DEP-034], [BE-014], [BE-034], [BE-056] | Existing offering/catalog/inquiry ports with additive service kind | [Test plan][BE-037-tests]: `capture-service-place.ts` |
| [BE-038] Canonical place anchors for owner locations | done | [FE-059], [FE-056], [BE-047], [BE-041], [FE-045], [DEP-035], [BE-034], [BE-054], [ADR-0027] | Existing place data and owner location proposal boundary | [Test plan][BE-038-tests]: `capture-service-place.ts` |
| [BE-039] Atomic business starter content | done | [FE-061], [BE-049], [BE-043], [BE-031], [FE-046], [DEP-036], [BE-034], [BE-056] | [Contract and implementation scope][BE-039] | [Test plan][BE-039-tests]: `test-business-starters.ts`, `capture-business-starters.ts` |
| [BE-040] Simple offering upkeep and word search | in_progress | [BE-044], [BE-041], [BE-009], [FE-047], [DEP-037], [FE-019], [BE-018], [DEP-039], [BE-054], [BE-056] | [actions.ts](../app/actions.ts) | [Test plan][BE-040-tests]: `test-search-ranking.ts`, `test-discovery-pagination.ts` |
| [BE-041] Owner publication and immediate location | in_progress | [BE-049], [BE-048], [FE-059], [BE-047], [FE-058], [FE-056], [FE-054], [FE-048], [DEP-038], [BE-033], [BE-038], [BE-040], [BE-056], [FE-021] | owner-page-save/publication, owner-business-runtime, city-centered exact-public location picker, ProductForm, dashboard/admin, discovery, map-display-location, signup | [Test plan][BE-041-tests]: `test-self-service-publication.ts`, `test-signup.ts`, `test-mobile-api.ts` |
| [BE-042] Ordered tenant product media | in_progress | [BE-049], [FE-060], [BE-048], [FE-050], [BE-009], [BE-010], [BE-024], [DEP-039], [FE-019], [BE-018], [BE-046], [ADR-0024] | [Contract and implementation scope][BE-042] | [Test plan][BE-042-tests]: `capture-launch-wiring.mjs`, `test-video-requests.ts` |
| [BE-043] Business handle lifecycle | done | [BE-031], [BE-039], [FE-051], [DEP-040] | [Contract and implementation scope][BE-043] | [Test plan][BE-043-tests] |
| [BE-044] Native API and session boundaries | in_progress | [BE-058], [BE-055], [BE-032], [BE-048], [BE-047], [BE-045], [FE-056], [FE-054], [FE-053], [FE-026], [DEP-042], [BE_BASE], [BE-018], [BE-040], [ADR-0023], [BE-046], [BE-050], [BE-051], [BE-052], [BE-054], [BE-056], [FE-041], [FE-065], [BE-057], [FE-068], [FE-072], [BE-060], [FE-073], [BE-061] | [reviewer-access.ts](../lib/reviewer-access.ts) | [Test plan][BE-044-tests]: `test-mobile-api.ts`, `test-mobile-auth-fetch.ts` |
| [BE-045] Private account name and phone | in_progress | [FE-056], [FE-040], [BE-031], [BE-032], [BE-044] | Existing owner/home, account/page/business/handle ports and focused web/native editors | [Test plan][BE-045-tests]: `test-account-contacts.ts`, `test-mobile-api.ts` |
| [BE-046] Reviewed TikTok and YouTube product references | in_progress | [ADR-0025], [BE-048], [FE-050], [FE-057], [BE-042], [BE-018], [BE-044], [DEP-039], [DEP-042], [ADR-0024] | [Contract and implementation scope][BE-046] | [Test plan][BE-046-tests]: `test-product-video.ts`, `test-video-requests.ts` |
| [BE-047] Canonical business city in signup transaction | in_progress | [BE-049], [FE-059], [BE-031], [BE-038], [BE-041], [FE-051], [BE-044], [DEP-042], [FE-065], [BE-054] | [Contract and implementation scope][BE-047] | [Test plan][BE-047-tests]: `test-signup.ts`, `test-mobile-api.ts` |
| [BE-048] Owner-controlled canonical video references | in_progress | [FE-061], [BE-049], [ADR-0025], [FE-060], [BE-046], [BE-032], [BE-041], [BE-042], [BE-044], [FE-050], [FE-019], [DEP-039], [DEP-042], [ADR-0024] | [Contract and implementation scope][BE-048] | [Test plan][BE-048-tests]: `test-product-video.ts`, `test-owner-page.ts` |
| [BE-049] Persist category-specific example videos atomically | in_progress | [BE-047], [BE-041], [FE-061], [BE-039], [BE-031], [BE-042], [BE-048], [FE-046], [FE-050], [DEP-039], [DEP-042] | [Contract and implementation scope][BE-049] | [Test plan][BE-049-tests] |
| [BE-050] Scoped notification events and confirmed chat reads | in_progress | [BE-055], [FE-062], [DEP-043], [ADR-0026], [BE-001], [BE-018], [BE-044], [FE-019], [FE-053], [BE-057], [ADR-0031] | attention contracts/PostgreSQL events/receipts, web/native controls and scoped provider outbox | [Test plan][BE-050-tests]: `test-support-assignment-response-migration.ts`, `test-support-assignment-response.ts` |
| [BE-051] Private listing reports and discovery exclusions | in_progress | [FE-063], [DEP-044], [BE-044] | Local pure catalog-safety/listing-report contracts, private PostgreSQL port/migration 63, scoped web Reports queue, web/native… | [Test plan][BE-051-tests]: `test-catalog-safety.ts` |
| [BE-052] Server-bound reviewer authentication | in_progress | [FE-064], [DEP-044], [BE-044] | [reviewer-access.ts](../lib/reviewer-access.ts) | [Test plan][BE-052-tests] |
| [BE-053] Verified owner-account erasure operations | in_progress | [FE-055], [DEP-044] | scripts/operations/account-erasure.ts | [Test plan][BE-053-tests]: `test-account-erasure.ts` |
| [BE-054] Country-city authority and independent discovery scopes | in_progress | [BE-032], [FE-059], [FE-065], [DEP-045], [BE-023], [BE-040], [BE-044], [BE-047], [BE-038], [ADR-0027], [BE-056], [FE-026], [FE-071] | [Contract and implementation scope][BE-054] | [Test plan][BE-054-tests]: `test-admin-geography.ts`, `test-admin-geography-ui.ts` |
| [BE-055] Retired public business-inquiry submission with preserved history | in_progress | [BE-032], [FE-066], [DEP-045], [BE-001], [BE-044], [BE-050] | [Contract and implementation scope][BE-055] | [Test plan][BE-055-tests]: `test-mobile-api.ts`, `test-live-transport.ts` |
| [BE-056] Product-only catalog authority and custom-order filters | in_progress | [FE-067], [DEP-046], [BE-009], [BE-014], [BE-022], [BE-037], [BE-039], [BE-040], [BE-041], [BE-044], [BE-054] | [Contract and implementation scope][BE-056] | [Test plan][BE-056-tests]: `test-product-only-catalog.ts`, `test-service-offerings.ts` |
| [BE-057] Editable ordered transport plans with read-only sharing | ready | [BE-058], [BE-018], [BE-044], [BE-050], [FE-068], [DEP-047] | [Contract and implementation scope][BE-057] | [Test plan][BE-057-tests]: `test-transport-plan.ts`, `test-transport-plan-migration.ts` |
| [BE-058] Email-verified recipients and independent shipment plans | in_progress | [BE-057], [BE-044], [FE-049], [FE-053], [FE-069], [DEP-048], [ADR-0031] | [Contract and implementation scope][BE-058] | [Test plan][BE-058-tests]: `test-tracking.ts`, `test-tracking-provider-fields.ts` |
| [BE-059] Data-preserving MirtPage branding and compatibility | in_progress | [FE-070], [DEP-029], [DEP-049], [ADR-0029] | [Contract and implementation scope][BE-059] | [Test plan][BE-059-tests]: `test-attention-worker-brand-compat.cjs`, `test-attention-platform.cjs` |
| [BE-060] Revocable global staff business-management authority | ready | [FE-072], [FE-026], [FE-042], [FE-053], [FE-056], [BE-032], [BE-033], [BE-044], [BE-009], [BE-031], [FE-038], [FE-073], [BE-061], [DEP-050], [DEP-049], [ADR-0030] | [Contract and implementation scope][BE-060] | [Test plan][BE-060-tests]: `test-business-assistance.ts`, `test-staff-boundaries.ts` |
| [BE-061] Verified owner email and application identity reconciliation | ready; local proof, hosted disabled | [FE-073], [DEP-050], [FE-072], [BE-060], [BE-030], [BE-031], [BE-044], [FE-038] | [Contract and implementation scope][BE-061] | [Test plan][BE-061-tests]: `test-owner-email-change.ts`, `test-owner-email-change-local.ts` |
| [BE-063] Single transport coordinator and partner interest | local79 verified; hosted pending | BE-063/FE-076; private interest intake/outbox; no provider authority | Concurrent same-key, fresh-admin, stale-lease, retry/retention, local-mail and RLS fixtures pass; independent review complete | `npm run test:transport-partners`; `scripts/test-attention-worker-runtime-boundary.mjs`; protected `s154-local77-to79/verified.json` |
| [BE-064] Shipment party identity and access grants | draft | BE-064/FE-077; future additive shipment-scoped grants for independently verified shipper/receiver emails; no private account-email inference or provider tenant authority | Owner approved both parties receiving access only after each verifies the chosen email; no implementation or database change | [BE-064](backend/BE-064-shipment-party-access.md); future migration, RLS, concurrency and privacy evidence required |
| [BE-062] Canonical inquiry intake and private owner Inbox | local78 verified; hosted pending | BE-062/FE-075; canonical atomic intake, read_at, authorized manager grant | Real isolated tenant/concurrency/grant-revoke fixtures pass; local browser workflows canonical/read/status verified | `scripts/test-restored-inquiry-postgres.ts`; `scripts/test-mobile-api.ts`; FE-075 acceptance receipt |
| [DEP-001] Controlled pilot release and recovery | done | [FE-001], [BE-001], [DEP-006], [DEP-008], [DEP-012], [DEP-022], [ADR-0002] | [ShowroomApp.tsx](../components/showroom/ShowroomApp.tsx), [inquiries.ts](../lib/inquiries.ts) | [Test plan][DEP-001-tests]: `preflight.ts`, `release.sh` |
| [DEP-002] Reproducible delivery and repository hygiene | in_progress | [FE-035], [BE-003], [BE-025], [DEP_BASE], [ADR-0002], [ADR-0003], [DEP-010], [DEP-022], [DEP-025] | [platform-assets.ts](../lib/platform-assets.ts), [trusted-origins.ts](../lib/trusted-origins.ts) | S165 agent-owned visual policy remains in AGENTS/browser skill and guide. S184 reproduces the installed PostgreSQL image socket-only initialization disconnect and qualifies bounded TCP readiness without SQL retries or relaxed isolation. [S183/S184 evidence](#s183-icon-and-splash-mask-qualification) retains failed invocations, source-matched gate composition and RED/GREEN receipts; [current delivery](#current-s181s184-delivery) owns terminal required CI. [Test plan][DEP-002-tests]: `check-workflow-scripts.mjs`, `test-workflow-script-quality.mjs`, `test-operations.mjs`. |
| [DEP-003] Managed request storage and safe permission rollout | done | [FE-003], [BE-003], [DEP-006], [DEP-007], [DEP-008], [DEP-017], [ADR-0002], [ADR-0004] | [revision-service.ts](../lib/revision-service.ts), [postgres-migrations.ts](../lib/postgres-migrations.ts) | [Test plan][DEP-003-tests]: `test-operations.mjs`, `test-requests.ts` |
| [DEP-004] Showroom bank admission and release gate | done | [FE-004], [FE-005], [FE-006], [FE-009], [BE-005], [BE-010], [DEP-005], [DEP-006], [DEP-007], [DEP-009], [ADR-0005], [ADR-0007] | [showroom-bank-release.ts](../lib/showroom-bank-release.ts), [capabilities.ts](../lib/capabilities.ts) | [Test plan][DEP-004-tests]: `test-workflow.mjs`, `test-showroom-bank.ts` |
| [DEP-005] Mobile showroom experience admission gate | done | [FE-005], [FE-006], [FE-009], [BE-006], [BE-010], [DEP-004], [DEP-006], [DEP-009], [BE-005], [ADR-0007] | [showroom-experience.ts](../lib/showroom-experience.ts), [showroom-bank-release.ts](../lib/showroom-bank-release.ts) | [Test plan][DEP-005-tests]: `test-workflow.mjs`, `test-showroom-experience.ts` |
| [DEP-006] Four-client composition cutover and recovery | done | [FE-006], [FE-009], [BE-007], [BE-010], [DEP-001], [DEP-003], [DEP-004], [DEP-005], [DEP-007], [DEP-009], [ADR-0005], [ADR-0007] | [revision-domain.ts](../lib/revision-domain.ts), [revision-service.ts](../lib/revision-service.ts) | [Test plan][DEP-006-tests]: `test-showroom-migration.ts`, `test-operations.mjs` |
| [DEP-007] Showroom recipe schema and studio rollout | ready | [FE-007], [FE-009], [BE-008], [BE-010], [DEP-003], [DEP-004], [DEP-006], [DEP-008], [DEP-009], [ADR-0005], [ADR-0006], [ADR-0007] | portable current content/content-block/design/component-bank/recipe schemas, named independent contract manifest, fixed… | [Test plan][DEP-007-tests]: `test-showroom-recipe.ts`, `test-security.ts` |
| [DEP-008] Stockless product-upkeep migration and rollout | done | [DEP-001], [DEP-003], [DEP-007], [DEP-012], [FE-008], [BE-008], [BE-009], [ADR-0006] | [revision-domain.ts](../lib/revision-domain.ts), [product-upkeep-domain.ts](../lib/product-upkeep-domain.ts) | [Test plan][DEP-008-tests]: `test-stockless-catalog.ts`, `test-operations.mjs` |
| [DEP-009] Revision v4 and showroom bank 1.2 controlled rollout | in_progress | [DEP-004], [DEP-005], [DEP-006], [DEP-007], [DEP-011], [DEP-013], [FE-007], [FE-009], [FE-014], [BE-005], [BE-006], [BE-007], [BE-008], [BE-010], [BE-013], [ADR-0005], [ADR-0007], [ADR-0008] | Immutable bank 1.1 remains supported for retained manifests | [Test plan][DEP-009-tests]: `test-operations.mjs`, `test-showroom-bank.ts` |
| [DEP-010] Expo geographic map rollout and operations | deprecated | [FE-010], [FE-011], [FE-012], [FE-015], [BE-011], [BE-012], [BE-013], [BE-016], [DEP-002], [DEP-011], [DEP-013], [DEP-015] | Superseded by FE-020, BE-019, and DEP-016 | [Test plan][DEP-010-tests]: `test-bazaar.ts`, `test-operations.mjs` |
| [DEP-011] Twenty-eight-showroom benchmark and visual admission | in_progress | [FE-007], [FE-009], [FE-010], [FE-012], [FE-014], [FE-015], [FE-016], [FE-023], [FE-031], [BE-008], [BE-010], [BE-011], [BE-013], [BE-028], [DEP-009], [DEP-010], [DEP-012], [DEP-013], [DEP-016], [DEP-019] | [showroom-blueprint.ts](../lib/showroom-blueprint.ts), [showroom-guidance.ts](../lib/showroom-guidance.ts) | [Test plan][DEP-011-tests]: `test-showroom-benchmarks.ts`, `test-security.ts` |
| [DEP-012] Unified offering migration and rollout | done | [DEP-034], [DEP-001], [DEP-008], [DEP-011], [DEP-013], [FE-016], [BE-014] | [offerings.ts](../lib/offerings.ts), [inquiries.ts](../lib/inquiries.ts) | [Test plan][DEP-012-tests]: `test-offering-migration.ts`, `test-security.ts` |
| [DEP-013] Dense Expo demo fixtures | deprecated | [FE-009], [FE-010], [FE-012], [FE-015], [BE-010], [BE-011], [DEP-009], [DEP-010], [DEP-011], [DEP-012], [DEP-014] | Removed from reset and superseded by the 48 lightweight small-business discovery fixtures in DEP-016 | [Test plan][DEP-013-tests]: `test-showroom-benchmarks.ts`, `test-expo.ts` |
| [DEP-014] Scale demo workflow fixtures | deprecated | [FE-017], [BE-015], [DEP-013], [DEP-016] | [pagination.ts](../lib/pagination.ts), [scalable-queries.ts](../lib/scalable-queries.ts) | [Test plan][DEP-014-tests]: `test-scale-fixtures.ts`, `app.spec.ts` |
| [DEP-015] Free-first service and managed database readiness | in_progress | [FE-010], [FE-018], [FE-019], [FE-025], [BE-016], [BE-017], [BE-018], [BE-019], [BE-024], [BE-030], [DEP-010], [DEP-016], [DEP-017], [DEP-021], [DEP-022], [DEP-026], [DEP_BASE], [ADR-0002], [ADR-0009], [ADR-0010], [ADR-0012], [ADR-0014] | [support.ts](../lib/support.ts), [support-media.ts](../lib/support-media.ts) | [Test plan][DEP-015-tests]: `test-support.ts`, `test-account-health.ts` |
| [DEP-016] Permanent City Showroom pre-production cutover | deprecated | [FE-020], [FE-021], [BE-019], [DEP-011], [DEP-014], [DEP-015], [DEP-017] | Superseded by exact-location markers and the separate daily country-wide industry Daily Featured under FE-021, BE-020, and DEP-017 | [Test plan][DEP-016-tests] |
| [DEP-017] Local geography and public onboarding rollout | done | [FE-021], [FE-024], [BE-020], [BE-023], [DEP-003], [DEP-015], [DEP-016], [DEP-020], [ADR-0011], [ADR-0016] | [discovery.ts](../lib/discovery.ts), [DiscoveryWorkspace.tsx](../components/DiscoveryWorkspace.tsx) | [Test plan][DEP-017-tests]: `test-discovery-geography.mjs`, `app.spec.ts` |
| [DEP-018] Rich showroom presentation rollout | done | [FE-022], [BE-021], [DEP-019] | Additive schema migration 24, offering/live validation, fail-closed discovery projection, Daily Featured presentation precedence,… | [Test plan][DEP-018-tests]: `test-rich-offering-migration.ts`, `test-revisions.ts` |
| [DEP-019] Complete demo portfolio admission | in_progress | [FE-023], [FE-024], [BE-022], [BE-023], [DEP-011], [DEP-018], [DEP-020] | [scale-demo-seed.ts](../lib/scale-demo-seed.ts), [showroom-seed-briefs.ts](../lib/showroom-seed-briefs.ts) | [Test plan][DEP-019-tests]: `test-demo-client-portfolio.ts`, `capture-demo-client-portfolio.ts` |
| [DEP-020] Suqpage marketplace rollout | in_progress | [FE-024], [FE-025], [FE-033], [FE-034], [BE-023], [BE-029], [DEP-017], [DEP-019], [DEP-021], [DEP-024], [DEP-025], [DEP-026] | [discovery-contract.ts](../lib/discovery-contract.ts), [discovery.ts](../lib/discovery.ts) | [Test plan][DEP-020-tests]: `test-discovery.ts`, `test-scale-fixtures.ts` |
| [DEP-021] Data-preserving launch hardening | in_progress | [FE-009], [FE-024], [FE-025], [FE-026], [BE-008], [BE-010], [BE-024], [BE-025], [BE-026], [DEP-015], [DEP-020], [DEP-022], [ADR-0012], [ADR-0013] | Process-section controlled video, private request and support attachments, post-import labeled image checklist, exact… | [Test plan][DEP-021-tests]: `test-security.ts`, `http-smoke.mjs` |
| [DEP-022] PostgreSQL and guarded delivery readiness | done | [FE-026], [BE-024], [BE-026], [DEP-001], [DEP-002], [DEP-015], [DEP-021], [ADR-0012], [ADR-0013] | Stable administrator destinations, support-agent management, role-aware navigation, asynchronous password work, bounded… | [Test plan][DEP-022-tests]: `check-runtime-baseline.mjs` |
| [DEP-023] Supabase and Vercel production cutover | deprecated; historical topology | [BE-027], [BE-028], [BE-029], [BE-030], [FE-031], [FE-032], [FE-033], [FE-034], [FE-037], [DEP-024], [DEP-025], [DEP-026], [DEP-027], [ADR-0013], [ADR-0014], [ADR-0015] | [postgres-migrations.ts](../lib/postgres-migrations.ts), [invitations.ts](../lib/invitations.ts) | [Test plan][DEP-023-tests] |
| [DEP-024] Daily Featured schedule migration and rollout | in_progress | [FE-021], [FE-033], [BE-023], [BE-027], [BE-029], [DEP-020], [DEP-023] | S36 single 8:30 PM–midnight EAT agenda | [Test plan][DEP-024-tests]: `test-featured-schedule.ts`, `test-postgres-runtime.ts` |
| [DEP-025] PWA cache and standalone-shell rollout | in_progress | [FE-034], [FE-036], [FE-037], [DEP-002], [DEP-020], [DEP-023], [DEP_BASE] | Current public routes, query/referral contracts, active component hooks, Daily Featured program modules, Marketplace admin, exact… | [Test plan][DEP-025-tests]: `pwa-cleanup-worker.js` |
| [DEP-026] Netlify and bounded Supabase capabilities rollout | in_progress | [DEP-042], [DEP-039], [FE-019], [FE-021], [FE-038], [BE-018], [BE-023], [BE-024], [BE-026], [BE-027], [BE-030], [BE-031], [DEP-015], [DEP-020], [DEP-023], [DEP-027], [DEP-028], [ADR-0014], [ADR-0015], [ADR-0016], [ADR-0017] | Selectable identity adapter, immutable provider-to-Suqpage identity links, operator-only bcrypt migration, managed password/Google… | [Test plan][DEP-026-tests]: `test-netlify-native.mjs` |
| [DEP-027] Local Supabase development runtime | in_progress | [DEP-042], [DEP-031], [FE-038], [BE-024], [BE-027], [BE-030], [BE-031], [DEP-023], [DEP-026], [DEP-028], [ADR-0013], [ADR-0014], [ADR-0015], [DEP-050] | Loopback-only Supabase CLI runtime with PostgreSQL 17, local Auth/private Storage, guarded setup, and SQLite restricted to… | S184 fixed-shape diagnostics pass eleven readiness cases, actual inert failure/cleanup and public-script static binding without revealing captured CLI output. Earlier required PR/main browser jobs passed; original Supabase-startup failures retain unproven cause. S187's isolated GHCR-auth workflow and focused `test-workflow.mjs` guard pass local static/spec checks; changed-head remote browser acceptance is pending. [S183/S184 evidence](#s183-icon-and-splash-mask-qualification) and [current delivery](#current-s181s184-delivery) own prior receipts. [Test plan][DEP-027-tests]: `test-acceptance-supabase-readiness.mjs`, `test-local-dev-launcher.mjs`, `test-workflow.mjs`. |
| [DEP-028] Suqpage identity and passwordless production cutover | in_progress | [FE-038], [FE-039], [BE-030], [BE-031], [DEP-026], [DEP-027], [DEP-029], [ADR-0017] | Market/About/auth/setup copy, Suqpage page actions, Google display-name hint, additive private onboarding category, and separate… | [Test plan][DEP-028-tests] |
| [DEP-029] Guarded production Auth configuration changes | in_progress | [FE-070], [BE-059], [DEP-049], [DEP-048], [DEP-032], [DEP-028], [ADR-0014], [DEP-050] | scripts/production-auth-config.ts, mandatory hosted-configuration rules in AGENTS.md, and the recovery runbook | [Test plan][DEP-029-tests]: `test-production-auth-config.ts` |
| [DEP-030] Data-preserving Suqpage self-service rollout | in_progress | [FE-052], [DEP-036], [DEP-034], [DEP-032], [DEP-031], [FE-041], [FE-040], [BE-032], [ADR-0018], [FE-042], [BE-033], [FE-043], [BE-034], [DEP-045] | Product options/visibility commands, owner identity/location proposal, admin exact-version geographic approval, private identity… | [Test plan][DEP-030-tests] |
| [DEP-031] Native PostgreSQL setup tests and operations | done | [DEP-032], [BE-035], [DEP-030], [DEP-027], [ADR-0020], [DEP-047] | Native schema 43, PostgreSQL-only runtime ports, isolated PostgreSQL fixtures, archive tools and current browser bootstrap | [Test plan][DEP-031-tests]: `test-archive-validation.ts`, `test-operations.mjs` |
| [DEP-032] Nonbreaking Suqpage namespace rollout | done; compatibility retained; DEP-049 current | [DEP-033], [BE-036], [DEP-029], [DEP-030], [DEP-031], [ADR-0021] | [platform-assets.ts](../lib/platform-assets.ts) | [Test plan][DEP-032-tests] |
| [DEP-033] Request-time account entry after credential-free builds | done | [BE-031], [BE-036], [FE-038], [DEP-032] | Request-time entry pages and compatible Auth proxy | [Test plan][DEP-033-tests]: `test-auth-entry-proxy.ts`, `acceptance-runner.mjs` |
| [DEP-034] Additive service offering rollout | done; historical rollout; DEP-049 current | [DEP-035], [FE-044], [BE-037], [DEP-012], [DEP-030], [DEP-046] | Existing offering/catalog/inquiry ports with additive service kind | [Test plan][DEP-034-tests]: `capture-service-place.ts` |
| [DEP-035] Canonical place selection rollout | done | [FE-045], [BE-038], [DEP-034] | Existing place data and owner location proposal boundary | [Test plan][DEP-035-tests]: `capture-service-place.ts` |
| [DEP-036] Business starter rollout | done | [FE-046], [BE-039], [DEP-030] | [Contract and implementation scope][DEP-036] | [Test plan][DEP-036-tests]: `test-business-starters.ts`, `capture-business-starters.ts` |
| [DEP-037] Simple offering search rollout | done | [DEP-038], [FE-047], [BE-040] | [actions.ts](../app/actions.ts) | [Test plan][DEP-037-tests]: `test-discovery-pagination.ts`, `test-product-upkeep.ts` |
| [DEP-038] Self-service workflow and demo rollout | done | [FE-048], [BE-041], [DEP-037], [DEP-046] | owner-page-save/publication, owner-business-runtime, ProductForm, dashboard/admin, discovery, map-display-location, setup | [Test plan][DEP-038-tests]: `test-self-service-publication.ts` |
| [DEP-039] Product gallery compatibility rollout | in_progress | [FE-061], [BE-049], [ADR-0025], [FE-060], [BE-048], [DEP-040], [FE-050], [BE-042], [DEP-026], [FE-019], [BE-018], [BE-032], [BE-040], [FE-057], [BE-046], [ADR-0024] | [Contract and implementation scope][DEP-039] | [Test plan][DEP-039-tests]: `capture-launch-wiring.mjs`, `test-video-requests.ts` |
| [DEP-040] Handle registry rollout | done | [FE-051], [BE-043], [DEP-039] | [Contract and implementation scope][DEP-040] | [Test plan][DEP-040-tests] |
| [DEP-041] Demo account inbox aliases | done | [BE-022], [BE-030], [DEP-045] | [Contract and implementation scope][DEP-041] | [Test plan][DEP-041-tests] |
| [DEP-042] Expo workspace rollout | in_progress; device/Play gates pending | [FE-061], [BE-049], [ADR-0025], [FE-060], [BE-048], [FE-059], [BE-047], [FE-058], [FE-056], [DEP-026], [FE-055], [DEP-027], [FE-053], [BE-044], [DEP_BASE], [ADR-0023], [FE-057], [BE-046], [ADR-0024], [DEP-043], [DEP-044], [DEP-045], [DEP-046], [DEP-047] | Production AAB/internal-draft profiles | [Test plan][DEP-042-tests]: `test-release-dependency-security.cjs`, `test-mobile-build-config.cjs` |
| [DEP-043] Verified notification delivery rollout | in_progress; S180 sender/device gates pending | [DEP-048], [BE-050], [FE-062], [ADR-0026], [DEP-042], [DEP-044], [BE-018], [FE-019], [FE-036], [FE-053], [DEP-047], [ADR-0031] | Production AAB/internal-draft profiles | S180 pins the verified public Android client; new-project FCM/EAS credential binding and actual push remain unverified. Focused source evidence is recorded in the DEP-044 row. [Test plan][DEP-043-tests]: `test-attention-platform.cjs`, `test-attention-worker-runtime-boundary.mjs`, `test-support-assignment-response-migration.ts` |
| [DEP-044] Google Play testing and store rollout | draft; web/native static qualified, device/Play pending | [DEP-042], [DEP-043], [FE-055], [FE-063], [BE-051], [FE-064], [BE-052], [BE-053], [FE-052], [FE-049], [DEP-046], [DEP-049], [DEP-051] | [reviewer-access.ts](../lib/reviewer-access.ts), [Android release policy](../apps/mobile/release-policy.json) | DEP-044 owns the verified standalone Firebase/public client and MarketVision Free/App draft, its unchanged category/listing/declaration limits and unresolved FCM/EAS credential scope. E11 owns the canonical same-package v1 predecessor and its successful static inspection. S183 prepares 383 current native inputs and a 1,712-module offline export; six high build-tool findings remain, with neither root advisory package in that export and no general runtime clearance. [Current delivery](#current-s181s184-delivery) and E13 record the consumed exact one-artifact exception, successful single compilation and composed independent static admission with failed inspector invocations retained. Physical Android, 16-KB device runtime, push, screenshots, upload and Play testing remain pending. No automatic retry, credential creation or hosted change is authorized. [Test plan][DEP-044-tests]: `test-launch-materials.mjs`, `test-mobile-build-config.cjs`, `test-attention-platform.cjs`, `test-mobile-app-links.ts`, `test-android-release-safety.ts`. |
| [DEP-045] Independent discovery rollout and safe demo contacts | in_progress | [FE-065], [FE-066], [BE-055], [BE-054], [DEP-042], [DEP-030], [DEP-041], [BE-022], [ADR-0027], [DEP-046] | [Contract and implementation scope][DEP-045] | [Test plan][DEP-045-tests] |
| [DEP-046] Product-only demo correction and compatible rollout | in_progress | [FE-067], [BE-056], [DEP-034], [DEP-038], [DEP-042], [DEP-044], [DEP-045], [BE-022] | [Contract and implementation scope][DEP-046] | [Test plan][DEP-046-tests]: `test-simple-demo-seed.ts`, `test-demo-physical-fixtures.ts` |
| [DEP-047] Additive transport plan migration and coordinated rollout | ready | [DEP-048], [BE-057], [FE-068], [DEP-031], [DEP-042], [DEP-043] | [Contract and implementation scope][DEP-047] | [Test plan][DEP-047-tests] |
| [DEP-048] Safe verified-recipient tracking migration and delivery rollout | in_progress | [BE-058], [FE-049], [FE-053], [FE-069], [DEP-047], [DEP-029], [DEP-043], [ADR-0031] | [Contract and implementation scope][DEP-048] | [Test plan][DEP-048-tests]: `test-local-chat-worker.ts` |
| [DEP-049] MirtPage domain, managed services and app release cutover | draft; S186 web published, native/provider gates remain | [FE-021], [FE-070], [FE-071], [BE-059], [DEP-029], [ADR-0029], [FE-072], [BE-060], [DEP-050], [DEP-044] | [Contract and implementation scope][DEP-049] | [S186 publication](#current-s186-chat-web-publication) owns exact merged-source web publication, recovery baseline and live readback/Chrome limits. E12 is the earlier recoverable publication; native/FCM/Play qualification remains separate. [Test plan][DEP-049-tests]: `test-mobile-build-config.cjs`, `test-mobile-app-links.ts`. |
| [DEP-050] Guarded rollout of owner email change | ready; local proof, hosted disabled | [FE-073], [BE-061], [FE-072], [BE-060], [FE-038], [BE-031], [DEP-029], [DEP-027], [DEP-049] | [Contract and implementation scope][DEP-050] | [Test plan][DEP-050-tests]: `test-owner-email-change-local.ts`, `test-production-auth-config.ts` |
| [DEP-051] AfricMade presentation rollout on the current domain | in_progress; web published, signed Android local | [FE-070], [FE-049], [BE-059], [FE-041], [BE-014], [DEP-044], [DEP-049] | [AfricMade presentation contract](deployment/DEP-051-africmade-presentation-rollout.md) | S177 source/locale/Chrome desktop/phone web and Expo public visual checks pass (`.local/s177-brand-review/`). Source-matched composite check stages, clean web production build, output trace, release tail and provider HTTP smoke pass; first local smoke setup timed out, then bounded retry passed. S177's local acceptance was 18/20; a focused delayed-search rerun passed, while that release's owner/staff invocation remained incomplete after fixture/server loading timeouts. PR #41 merged as `888ca451` with identical approved tree; all five main CI jobs passed in run `40157701773`. The earlier S177 publication passed 14-route/asset readback and installed Chrome Market, About, Featured and Login on desktop/phone (`.local/s177-brand-review/web-production-result.json`, `web-live-readback.json`, `live-chrome/result.json`); E12 owns the superseding current website and qualified 20/20 acceptance composition. One local signed version 6 AAB SHA `4570fba3…b00441` and derived APK SHA `c26c1d7a…500811` pass package/version/signer, artwork, blocked-permission and 16-KB static checks (`.local/africmade-s177-native-v6/`, `.local/s177-brand-review/native-v6-inspection.json`). Physical device, Play upload/signing and managed-service renames remain pending; temporary domain/package remain unchanged. |

## Base contracts and architecture decisions

These immutable records remain linked rather than repeated as feature prose.
Accepted decisions constrain implementation; proposed/superseded states are not
silently promoted. ADR status is not a production deployment result.

| Contract / decision | Status | Related contracts |
| --- | --- | --- |
| [FE_BASE] Frontend base architecture | done | [FE-053], [BE_BASE], [DEP_BASE] |
| [BE_BASE] Backend and domain base architecture | done | [BE-044], [FE_BASE], [DEP_BASE], [ADR-0001], [ADR-0002] |
| [DEP_BASE] Deployment and operations base architecture | done | [DEP-042], [FE_BASE], [BE_BASE], [DEP-002], [ADR-0002] |
| [ADR-0001] Pragmatic hexagonal and domain boundaries | accepted | [BE_BASE], [FE_BASE], [BE-025] |
| [ADR-0002] Single-instance SQLite controlled pilot | accepted | [BE_BASE], [DEP_BASE], [DEP-002] |
| [ADR-0003] Specs precede material behavior changes | accepted | [FE_BASE], [BE_BASE], [DEP-002] |
| [ADR-0004] Managed-service requests and versioned publication | accepted | [FE-003], [BE-003], [BE-025], [DEP-003], [ADR-0001], [ADR-0002], [ADR-0006] |
| [ADR-0005] Constrained showroom composition instead of tenant-generated code | accepted | [BE-004], [BE-005], [BE-006], [BE-007], [BE-008], [BE-009], [BE-010], [FE-004], [FE-005], [FE-006], [FE-007], [FE-008], [FE-009], [DEP-004], [DEP-005], [DEP-006], [DEP-007], [DEP-008], [DEP-009], [ADR-0001], [ADR-0004], [ADR-0006], [ADR-0007] |
| [ADR-0006] Scoped product upkeep within the managed-service model | accepted | [FE-008], [BE-009], [DEP-008], [FE-003], [BE-003], [ADR-0001], [ADR-0004], [ADR-0005] |
| [ADR-0007] Additive revision v4 and immutable multi-release showroom banks | accepted | [FE-007], [FE-009], [BE-008], [BE-010], [DEP-007], [DEP-009], [ADR-0005], [ADR-0006] |
| [ADR-0008] Review-gated draft copy and custom showroom palettes | accepted | [FE-007], [FE-009], [BE-008], [BE-010], [DEP-007], [DEP-009], [ADR-0005], [ADR-0007] |
| [ADR-0009] First-party support with optional notifications | accepted | [FE-019], [BE-018], [DEP-015], [ADR-0001], [ADR-0002] |
| [ADR-0010] Manual subscription ledger and managed PostgreSQL target | superseded | [FE-018], [BE-017], [DEP-015], [ADR-0001], [ADR-0002], [ADR-0011] |
| [ADR-0011] Review-gated self-service onboarding and public visibility | accepted | [FE-003], [FE-018], [FE-021], [BE-003], [BE-017], [BE-020], [DEP-017], [ADR-0004], [ADR-0010] |
| [ADR-0012] Provider-neutral immutable media storage | accepted | [FE-025], [BE-024], [BE-026], [DEP-002], [DEP-015], [DEP-021], [DEP-022], [ADR-0013] |
| [ADR-0013] Staged PostgreSQL and identity migration | accepted | [FE-026], [BE-002], [BE-024], [BE-026], [BE-027], [BE-030], [DEP-021], [DEP-022], [DEP-023], [DEP-026], [DEP-027], [ADR-0012], [ADR-0014], [ADR-0015] |
| [ADR-0014] Managed Supabase identity and portable application hosting | accepted | [BE-002], [BE-018], [BE-023], [BE-024], [BE-026], [BE-027], [BE-030], [BE-031], [DEP-015], [DEP-023], [DEP-026], [DEP-027], [DEP-028], [ADR-0013], [ADR-0015], [ADR-0016], [ADR-0017] |
| [ADR-0015] Local Supabase runtime and SQLite retirement | accepted | [BE-024], [BE-027], [BE-030], [DEP-023], [DEP-026], [DEP-027], [ADR-0013], [ADR-0014] |
| [ADR-0016] Policy-compliant browser OpenStreetMap basemap | accepted | [FE-058], [FE-021], [BE-023], [DEP-026], [ADR-0014] |
| [ADR-0017] Auth-first passwordless onboarding | accepted | [FE-038], [BE-020], [BE-030], [BE-031], [DEP-028], [ADR-0014] |
| [ADR-0018] One business profile with optional staff assistance | accepted | [FE-040], [FE-041], [BE-032], [DEP-030], [ADR-0019] |
| [ADR-0019] Retire custom-page requests in favor of owner pages | accepted | [FE-042], [BE-033], [ADR-0018] |
| [ADR-0020] PostgreSQL-only persistence | accepted | [BE-035], [DEP-031], [ADR-0015] |
| [ADR-0021] Canonical Suqpage namespace with bounded legacy compatibility | accepted | [BE-036], [DEP-032] |
| [ADR-0022] Request-scoped local interface dictionaries | accepted | [FE-049], [FE_BASE], [BE_BASE] |
| [ADR-0023] Live buying assistance and native client boundaries | accepted | [FE-058], [FE-053], [BE-044], [DEP-042], [FE-019], [BE-018], [FE_BASE], [BE_BASE], [DEP_BASE], [ADR-0009], [ADR-0026] |
| [ADR-0024] Official TikTok embeds for reviewed product videos | accepted | [ADR-0025], [FE-060], [BE-048], [FE-057], [BE-046], [FE-050], [BE-042], [DEP-039], [DEP-042], [ADR-0023] |
| [ADR-0025] Self-service public video embeds across four providers | accepted | [FE-060], [BE-048], [FE-057], [BE-046], [DEP-039], [DEP-042], [ADR-0024] |
| [ADR-0026] Scoped attention events and bounded background push | accepted | [FE-062], [BE-050], [BE-018], [DEP-043], [ADR-0023], [ADR-0031] |
| [ADR-0027] Offline country-city catalog with canonical map anchors | accepted | [FE-065], [BE-054], [DEP-045], [BE-038], [BE-047] |
| [ADR-0028] Tracking-only verified recipients and independent shipments | accepted | [BE-058], [FE-069], [DEP-048], [BE-057], [ADR-0031] |
| [ADR-0029] MirtPage presentation migration with preserved system identities | proposed | [FE-070], [BE-059], [DEP-049] |
| [ADR-0030] Administrator-controlled global staff business management | accepted | [FE-072], [BE-060], [ADR-0018] |
| [ADR-0031] Explicit Gmail SMTP for low-volume transactional mail | accepted | [BE-018], [BE-050], [BE-058], [DEP-043], [DEP-048], [ADR-0026], [ADR-0028] |

## Existing evidence and harness navigation

The following are retained pointers, not new release requirements or claims that
an old run certifies current source. Feature test-plan links above retain the
criteria mapping. Existing release reports own historical commands, results,
backups and limitations. No transcript or embedded run log is copied here.

Tests pointers:

- [test-acceptance-supabase-readiness.mjs](../scripts/test-acceptance-supabase-readiness.mjs), [test-accessibility-audit.mjs](../scripts/test-accessibility-audit.mjs), [test-adapters.ts](../scripts/test-adapters.ts), [test-attention-platform.cjs](../scripts/test-attention-platform.cjs), [test-attention-worker-runtime-boundary.mjs](../scripts/test-attention-worker-runtime-boundary.mjs).
- [test-browser-json.ts](../scripts/test-browser-json.ts), [test-build-trace.mjs](../scripts/test-build-trace.mjs), [test-business-assistance.ts](../scripts/test-business-assistance.ts), [test-business-settings.ts](../scripts/test-business-settings.ts), [test-business-starters.ts](../scripts/test-business-starters.ts).
- [test-chat-inactivity-ui.ts](../scripts/test-chat-inactivity-ui.ts), [test-demo-client-portfolio.ts](../scripts/test-demo-client-portfolio.ts), [test-dev-resource-origins.mjs](../scripts/test-dev-resource-origins.mjs), [test-discovery.ts](../scripts/test-discovery.ts), [test-featured-sponsor-layout.ts](../scripts/test-featured-sponsor-layout.ts).
- [test-floating-inquiry-web.ts](../scripts/test-floating-inquiry-web.ts), [test-gmail-smtp-email.ts](../scripts/test-gmail-smtp-email.ts), [test-independent-discovery.ts](../scripts/test-independent-discovery.ts), [test-launch-clarity.ts](../scripts/test-launch-clarity.ts), [test-launch-materials.mjs](../scripts/test-launch-materials.mjs).
- [test-local-dev-launcher.mjs](../scripts/test-local-dev-launcher.mjs), [test-localization.ts](../scripts/test-localization.ts), [test-map-clustering.ts](../scripts/test-map-clustering.ts), [test-mirtpage-draft-materials.cjs](../scripts/test-mirtpage-draft-materials.cjs), [test-mirtpage-support-defaults.ts](../scripts/test-mirtpage-support-defaults.ts).
- [test-mobile-api.ts](../scripts/test-mobile-api.ts), [test-mobile-app-links.ts](../scripts/test-mobile-app-links.ts), [test-mobile-auth-fetch.ts](../scripts/test-mobile-auth-fetch.ts), [test-mobile-build-config.cjs](../scripts/test-mobile-build-config.cjs), [test-mobile-map-lifecycle.ts](../scripts/test-mobile-map-lifecycle.ts).
- [test-mobile-public-action-dock.ts](../scripts/test-mobile-public-action-dock.ts), [test-mobile-video.ts](../scripts/test-mobile-video.ts), [test-native-postgres.ts](../scripts/test-native-postgres.ts), [test-netlify-native.mjs](../scripts/test-netlify-native.mjs), `scripts/test-offering-migration.ts` (historical; absent).
- [test-operations.mjs](../scripts/test-operations.mjs), [test-owner-city-ui.ts](../scripts/test-owner-city-ui.ts), [test-owner-editor-failures.ts](../scripts/test-owner-editor-failures.ts), [test-owner-page-postgres.ts](../scripts/test-owner-page-postgres.ts), [test-owner-transport.ts](../scripts/test-owner-transport.ts).
- [test-platform-narrative.mjs](../scripts/test-platform-narrative.mjs), [test-postgres-readiness.mjs](../scripts/test-postgres-readiness.mjs), [test-product-inquiry.ts](../scripts/test-product-inquiry.ts), [test-product-only-catalog.ts](../scripts/test-product-only-catalog.ts), [test-product-only-web.ts](../scripts/test-product-only-web.ts).
- [test-product-upkeep.ts](../scripts/test-product-upkeep.ts), [test-public-seo-http.ts](../scripts/test-public-seo-http.ts), [test-public-seo.ts](../scripts/test-public-seo.ts), [test-release-dependency-security.cjs](../scripts/test-release-dependency-security.cjs), [test-release-preflight.ts](../scripts/test-release-preflight.ts).
- [test-retired-business-inquiry.ts](../scripts/test-retired-business-inquiry.ts), [test-revisions.ts](../scripts/test-revisions.ts), [test-route-recovery.ts](../scripts/test-route-recovery.ts), [test-scalable-queries.ts](../scripts/test-scalable-queries.ts), [test-search-ranking.ts](../scripts/test-search-ranking.ts).
- [test-security.ts](../scripts/test-security.ts), [test-showroom-bank.ts](../scripts/test-showroom-bank.ts), [test-showroom-benchmarks.ts](../scripts/test-showroom-benchmarks.ts), [test-showroom-blueprint.ts](../scripts/test-showroom-blueprint.ts), [test-showroom-composition-v2.ts](../scripts/test-showroom-composition-v2.ts).
- [test-showroom-composition.ts](../scripts/test-showroom-composition.ts), [test-showroom-experience.ts](../scripts/test-showroom-experience.ts), [test-showroom-fitness.ts](../scripts/test-showroom-fitness.ts), [test-showroom-recipe.ts](../scripts/test-showroom-recipe.ts), [test-showroom-status-origin.ts](../scripts/test-showroom-status-origin.ts).
- [test-spelling-search.ts](../scripts/test-spelling-search.ts), [test-staged-template.mjs](../scripts/test-staged-template.mjs), [test-stockless-catalog.ts](../scripts/test-stockless-catalog.ts), [test-storefront-accent.ts](../scripts/test-storefront-accent.ts), [test-support-inactivity.ts](../scripts/test-support-inactivity.ts).
- [test-support-routing.ts](../scripts/test-support-routing.ts), [test-support-thread-refresh.ts](../scripts/test-support-thread-refresh.ts), [test-taxonomy-reference-migration.ts](../scripts/test-taxonomy-reference-migration.ts), [test-transport-storage-ui.ts](../scripts/test-transport-storage-ui.ts), [test-video-requests.ts](../scripts/test-video-requests.ts).
- [test-workspace-context.ts](../scripts/test-workspace-context.ts), [app.spec.ts](../tests/acceptance/app.spec.ts), [discovery.spec.ts](../tests/acceptance/discovery.spec.ts).

Captures pointers:

- [capture-account-deletion.mjs](../scripts/capture-account-deletion.mjs), [capture-business-starters.ts](../scripts/capture-business-starters.ts), [capture-category-language.mjs](../scripts/capture-category-language.mjs), [capture-handle-setup.mjs](../scripts/capture-handle-setup.mjs), [capture-launch-clarity.mjs](../scripts/capture-launch-clarity.mjs).
- [capture-launch-wiring.mjs](../scripts/capture-launch-wiring.mjs), [capture-live-buying-staff.ts](../scripts/capture-live-buying-staff.ts), [capture-map-preview.mjs](../scripts/capture-map-preview.mjs), [capture-nearby-preview.mjs](../scripts/capture-nearby-preview.mjs), [capture-product-ready.mjs](../scripts/capture-product-ready.mjs).
- [capture-search-drawer.mjs](../scripts/capture-search-drawer.mjs), [capture-showroom-benchmarks.mjs](../scripts/capture-showroom-benchmarks.mjs), [capture-social-contact-workflows.mjs](../scripts/capture-social-contact-workflows.mjs), [capture-sponsor-rotation.mjs](../scripts/capture-sponsor-rotation.mjs), [capture-staff-chat-workflows.mjs](../scripts/capture-staff-chat-workflows.mjs).
- [capture-storefront-copy.mjs](../scripts/capture-storefront-copy.mjs), [capture-video-requests.ts](../scripts/capture-video-requests.ts).

Operations pointers:

- [auth-credentials.ts](../scripts/auth-credentials.ts), [backup.ts](../scripts/backup.ts), [migrate.ts](../scripts/migrate.ts), [preflight.ts](../scripts/preflight.ts), [release.sh](../scripts/release.sh).
- [restore.ts](../scripts/restore.ts), [setup.ts](../scripts/setup.ts).

Other pointers:

- [acceptance-db-probe.mjs](../scripts/acceptance-db-probe.mjs), [acceptance-runner.mjs](../scripts/acceptance-runner.mjs), [acceptance-supabase-readiness.mjs](../scripts/acceptance-supabase-readiness.mjs), [demo-public-contacts.ts](../scripts/demo-public-contacts.ts), [http-smoke.mjs](../scripts/http-smoke.mjs).
- [local-dev-services.mjs](../scripts/local-dev-services.mjs), [materialize-demo-client-portfolio.ts](../scripts/materialize-demo-client-portfolio.ts), [postgres-archive.ts](../scripts/postgres-archive.ts), [start-local-dev.mjs](../scripts/start-local-dev.mjs), [typecheck.mjs](../scripts/typecheck.mjs).


Existing historical/current report pointers:

- [ACCOUNT-DELETION-OPERATIONS.md](../docs/ACCOUNT-DELETION-OPERATIONS.md)
- [DEMO-ACCENT-ROLLOUT-2026-10-06.md](../docs/DEMO-ACCENT-ROLLOUT-2026-10-06.md)
- [GOOGLE-PLAY-CONNECTION.md](../docs/GOOGLE-PLAY-CONNECTION.md)
- [GOOGLE-PLAY-RELEASE.md](../docs/GOOGLE-PLAY-RELEASE.md)
- [MOBILE-DISTRIBUTION.md](../docs/MOBILE-DISTRIBUTION.md)
- [MOBILE-MAP-RESEARCH.md](../docs/MOBILE-MAP-RESEARCH.md)
- [MOBILE-MONOREPO-PREP.md](../docs/MOBILE-MONOREPO-PREP.md)
- [MOBILE-TESTING.md](../docs/MOBILE-TESTING.md)
- [MOBILE-WEB-ALIGNMENT.md](../docs/MOBILE-WEB-ALIGNMENT.md)
- [SUQPAGE-AUTH-ENTRY-FIX-2026-09-16.md](../docs/SUQPAGE-AUTH-ENTRY-FIX-2026-09-16.md)
- [SUQPAGE-DEMO-ACCOUNT-ACCESS.md](../docs/SUQPAGE-DEMO-ACCOUNT-ACCESS.md)
- [SUQPAGE-DEMO-CAPABILITY-REVIEW.md](../docs/SUQPAGE-DEMO-CAPABILITY-REVIEW.md)
- [SUQPAGE-DEMO-WORKFLOW-AUDIT-2026-09-23.md](../docs/SUQPAGE-DEMO-WORKFLOW-AUDIT-2026-09-23.md)
- [SUQPAGE-DEPLOYMENT-2026-09-14.md](../docs/SUQPAGE-DEPLOYMENT-2026-09-14.md)
- [SUQPAGE-DISCOVERY-AND-COPY-REVIEW.md](../docs/SUQPAGE-DISCOVERY-AND-COPY-REVIEW.md)
- [SUQPAGE-EMAIL-AND-DOMAIN-REVIEW.md](../docs/SUQPAGE-EMAIL-AND-DOMAIN-REVIEW.md)
- [SUQPAGE-LAUNCH-CLARITY-REVIEW.md](../docs/SUQPAGE-LAUNCH-CLARITY-REVIEW.md)
- [SUQPAGE-LOCAL-SCHEMA-47.md](../docs/SUQPAGE-LOCAL-SCHEMA-47.md)
- [SUQPAGE-NAMING-ROLLOUT-2026-09-14.md](../docs/SUQPAGE-NAMING-ROLLOUT-2026-09-14.md)
- [SUQPAGE-RELEASE-2026-09-21.md](../docs/SUQPAGE-RELEASE-2026-09-21.md)
- [SUQPAGE-RELEASE-2026-09-27.md](../docs/SUQPAGE-RELEASE-2026-09-27.md)
- [SUQPAGE-RELEASE-2026-10-06.md](../docs/SUQPAGE-RELEASE-2026-10-06.md)
- [SUQPAGE-S22-S24-RELEASE-2026-09-21.md](../docs/SUQPAGE-S22-S24-RELEASE-2026-09-21.md)
- [SUQPAGE-S25-RELEASE-2026-09-23.md](../docs/SUQPAGE-S25-RELEASE-2026-09-23.md)
- [SUQPAGE-S28-RELEASE-2026-09-23.md](../docs/SUQPAGE-S28-RELEASE-2026-09-23.md)
- [SUQPAGE-S30-RELEASE-2026-09-23.md](../docs/SUQPAGE-S30-RELEASE-2026-09-23.md)
- [SUQPAGE-S69-S70-RELEASE-2026-10-06.md](../docs/SUQPAGE-S69-S70-RELEASE-2026-10-06.md)
- [SUQPAGE-S98-RELEASE-2026-10-08.md](../docs/SUQPAGE-S98-RELEASE-2026-10-08.md)
- [SUQPAGE-SELF-SERVICE-REVIEW.md](../docs/SUQPAGE-SELF-SERVICE-REVIEW.md)
- [SUQPAGE-SERVICES-AND-PLACES-REVIEW.md](../docs/SUQPAGE-SERVICES-AND-PLACES-REVIEW.md)
- [SUQPAGE-TRANSITION-CHECKLIST.md](../docs/SUQPAGE-TRANSITION-CHECKLIST.md)
- [SUQPAGE-WORKFLOW-WIRING-AUDIT-2026-09-21.md](../docs/SUQPAGE-WORKFLOW-WIRING-AUDIT-2026-09-21.md)
- [BROWSER-WORKFLOW-REVIEW.md](../docs/operations/BROWSER-WORKFLOW-REVIEW.md)
- [ENGINEERING-READINESS.md](../docs/operations/ENGINEERING-READINESS.md)
- [FEATURED-SCHEDULE.md](../docs/operations/FEATURED-SCHEDULE.md)
- [SUPPORT-AND-TRANSPORT.md](../docs/operations/SUPPORT-AND-TRANSPORT.md)

## Maintenance

Update only rows/current evidence affected by a verified change. Keep full test
criteria in the controlling spec and detailed rollout results in the existing
release record. Preserve IDs and cross-layer links; do not append another
chronological transcript. `npm run validate:specs` validates the complete registry.

[FE-001]: frontend/FE-001-public-showroom-inquiry.md
[FE-001-tests]: frontend/FE-001-public-showroom-inquiry.md#test-plan-and-evidence
[FE-002]: frontend/FE-002-accessible-forms-and-dialogs.md
[FE-002-tests]: frontend/FE-002-accessible-forms-and-dialogs.md#test-plan-and-evidence
[FE-003]: frontend/FE-003-managed-client-request-workspace.md
[FE-003-tests]: frontend/FE-003-managed-client-request-workspace.md#test-plan
[FE-004]: frontend/FE-004-cross-industry-component-laboratory.md
[FE-004-tests]: frontend/FE-004-cross-industry-component-laboratory.md#test-plan
[FE-005]: frontend/FE-005-mobile-first-showroom-experience.md
[FE-005-tests]: frontend/FE-005-mobile-first-showroom-experience.md#test-plan
[FE-006]: frontend/FE-006-composed-showroom-rendering.md
[FE-006-tests]: frontend/FE-006-composed-showroom-rendering.md#test-plan
[FE-007]: frontend/FE-007-ai-showroom-recipe-workflow.md
[FE-007-tests]: frontend/FE-007-ai-showroom-recipe-workflow.md#test-plan
[FE-008]: frontend/FE-008-basic-product-upkeep.md
[FE-008-tests]: frontend/FE-008-basic-product-upkeep.md#test-plan
[FE-009]: frontend/FE-009-creative-showroom-bank-and-focused-studio.md
[FE-009-tests]: frontend/FE-009-creative-showroom-bank-and-focused-studio.md#test-plan
[FE-010]: frontend/FE-010-public-bazaar-map.md
[FE-010-tests]: frontend/FE-010-public-bazaar-map.md#test-plan
[FE-011]: frontend/FE-011-bazaar-admin-controls.md
[FE-011-tests]: frontend/FE-011-bazaar-admin-controls.md#test-plan
[FE-012]: frontend/FE-012-marketplace-homepage.md
[FE-012-tests]: frontend/FE-012-marketplace-homepage.md#test-plan
[FE-013]: frontend/FE-013-unified-platform-workspace-shell.md
[FE-013-tests]: frontend/FE-013-unified-platform-workspace-shell.md#test-plan
[FE-014]: frontend/FE-014-blueprint-media-studio.md
[FE-014-tests]: frontend/FE-014-blueprint-media-studio.md#test-plan
[FE-015]: frontend/FE-015-app-like-marketplace-home.md
[FE-015-tests]: frontend/FE-015-app-like-marketplace-home.md#test-plan
[FE-016]: frontend/FE-016-products-and-capabilities.md
[FE-016-tests]: frontend/FE-016-products-and-capabilities.md#test-plan
[FE-017]: frontend/FE-017-scalable-operations-workspace.md
[FE-017-tests]: frontend/FE-017-scalable-operations-workspace.md#test-plan
[FE-018]: frontend/FE-018-account-health-and-showroom-insights.md
[FE-018-tests]: frontend/FE-018-account-health-and-showroom-insights.md#test-plan-and-evidence
[FE-019]: frontend/FE-019-responsive-support-inbox.md
[FE-019-tests]: frontend/FE-019-responsive-support-inbox.md#test-plan
[FE-020]: frontend/FE-020-permanent-city-showroom-discovery.md
[FE-020-tests]: frontend/FE-020-permanent-city-showroom-discovery.md#test-plan
[FE-021]: frontend/FE-021-geographic-showroom-map-and-daily-featured.md
[FE-021-tests]: frontend/FE-021-geographic-showroom-map-and-daily-featured.md#test-plan
[FE-022]: frontend/FE-022-rich-offering-and-live-showroom-presentation.md
[FE-022-tests]: frontend/FE-022-rich-offering-and-live-showroom-presentation.md#test-plan
[FE-023]: frontend/FE-023-complete-demo-showroom-portfolio.md
[FE-023-tests]: frontend/FE-023-complete-demo-showroom-portfolio.md#test-plan
[FE-024]: frontend/FE-024-suqpage-marketplace-and-attention-shell.md
[FE-024-tests]: frontend/FE-024-suqpage-marketplace-and-attention-shell.md#test-plan
[FE-025]: frontend/FE-025-launch-ready-marketplace-and-showroom-workspace.md
[FE-025-tests]: frontend/FE-025-launch-ready-marketplace-and-showroom-workspace.md#test-plan
[FE-026]: frontend/FE-026-role-oriented-workspace-navigation.md
[FE-026-tests]: frontend/FE-026-role-oriented-workspace-navigation.md#test-plan
[FE-027]: frontend/FE-027-maker-first-public-narrative.md
[FE-027-tests]: frontend/FE-027-maker-first-public-narrative.md#test-plan
[FE-028]: frontend/FE-028-producer-story-and-scalable-venues.md
[FE-028-tests]: frontend/FE-028-producer-story-and-scalable-venues.md#test-plan
[FE-029]: frontend/FE-029-platform-visual-system-refresh.md
[FE-029-tests]: frontend/FE-029-platform-visual-system-refresh.md#test-plan
[FE-030]: frontend/FE-030-search-led-marketplace-homepage.md
[FE-030-tests]: frontend/FE-030-search-led-marketplace-homepage.md#test-plan
[FE-031]: frontend/FE-031-focused-client-workspace-and-combined-process-story.md
[FE-031-tests]: frontend/FE-031-focused-client-workspace-and-combined-process-story.md#test-plan
[FE-032]: frontend/FE-032-unified-business-workspace.md
[FE-032-tests]: frontend/FE-032-unified-business-workspace.md#test-plan
[FE-033]: frontend/FE-033-daily-featured-program-scheduling.md
[FE-033-tests]: frontend/FE-033-daily-featured-program-scheduling.md#test-plan
[FE-034]: frontend/FE-034-installable-pwa-and-mobile-app-shell.md
[FE-034-tests]: frontend/FE-034-installable-pwa-and-mobile-app-shell.md#test-plan
[FE-035]: frontend/FE-035-cross-role-accessibility-and-clarity.md
[FE-035-tests]: frontend/FE-035-cross-role-accessibility-and-clarity.md#test-plan
[FE-036]: frontend/FE-036-routed-public-marketplace-application.md
[FE-036-tests]: frontend/FE-036-routed-public-marketplace-application.md#test-plan
[FE-037]: frontend/FE-037-current-marketplace-language.md
[FE-037-tests]: frontend/FE-037-current-marketplace-language.md#test-plan
[FE-038]: frontend/FE-038-suqpage-identity-and-passwordless-entry.md
[FE-038-tests]: frontend/FE-038-suqpage-identity-and-passwordless-entry.md#test-plan
[FE-039]: frontend/FE-039-plain-language-business-pages.md
[FE-039-tests]: frontend/FE-039-plain-language-business-pages.md#test-plan
[FE-040]: frontend/FE-040-self-service-shop-page.md
[FE-040-tests]: frontend/FE-040-self-service-shop-page.md#test-plan
[FE-041]: frontend/FE-041-linked-products-and-simple-inquiries.md
[FE-041-tests]: frontend/FE-041-linked-products-and-simple-inquiries.md#test-plan-and-rollout
[FE-042]: frontend/FE-042-category-results-and-standard-page-workspaces.md
[FE-042-tests]: frontend/FE-042-category-results-and-standard-page-workspaces.md#test-plan-and-rollout
[FE-043]: frontend/FE-043-launch-workflow-wiring.md
[FE-043-tests]: frontend/FE-043-launch-workflow-wiring.md#test-plan-and-rollout
[FE-044]: frontend/FE-044-inclusive-business-and-service-discovery.md
[FE-044-tests]: frontend/FE-044-inclusive-business-and-service-discovery.md#test-plan
[FE-045]: frontend/FE-045-searchable-city-town-selection.md
[FE-045-tests]: frontend/FE-045-searchable-city-town-selection.md#test-plan
[FE-046]: frontend/FE-046-complete-new-business-starter-pages.md
[FE-046-tests]: frontend/FE-046-complete-new-business-starter-pages.md#quality-observability-and-test-plan
[FE-047]: frontend/FE-047-five-field-offering-editor.md
[FE-047-tests]: frontend/FE-047-five-field-offering-editor.md#quality-and-test-plan
[FE-048]: frontend/FE-048-self-service-owner-workspace.md
[FE-048-tests]: frontend/FE-048-self-service-owner-workspace.md#scenarios-and-test-plan
[FE-049]: frontend/FE-049-interface-localization.md
[FE-049-tests]: frontend/FE-049-interface-localization.md#test-plan
[FE-050]: frontend/FE-050-product-media-gallery.md
[FE-050-tests]: frontend/FE-050-product-media-gallery.md#test-plan
[FE-051]: frontend/FE-051-automatic-starter-and-handle-settings.md
[FE-051-tests]: frontend/FE-051-automatic-starter-and-handle-settings.md#test-plan
[FE-052]: frontend/FE-052-launch-clarity.md
[FE-052-tests]: frontend/FE-052-launch-clarity.md#test-plan
[FE-053]: frontend/FE-053-native-visitor-and-owner-app.md
[FE-053-tests]: frontend/FE-053-native-visitor-and-owner-app.md#test-plan
[FE-054]: frontend/FE-054-storefront-accent-personalization.md
[FE-054-tests]: frontend/FE-054-storefront-accent-personalization.md#test-plan-and-future-rollout
[FE-055]: frontend/FE-055-account-deletion-request-entry.md
[FE-055-tests]: frontend/FE-055-account-deletion-request-entry.md#test-plan
[FE-056]: frontend/FE-056-owner-profile-and-focused-editors.md
[FE-056-tests]: frontend/FE-056-owner-profile-and-focused-editors.md#test-plan-and-quality
[FE-057]: frontend/FE-057-tiktok-product-video.md
[FE-057-tests]: frontend/FE-057-tiktok-product-video.md#test-plan
[FE-058]: frontend/FE-058-world-map-navigation.md
[FE-058-tests]: frontend/FE-058-world-map-navigation.md#test-plan
[FE-059]: frontend/FE-059-required-signup-city.md
[FE-059-tests]: frontend/FE-059-required-signup-city.md#test-plan
[FE-060]: frontend/FE-060-self-service-cover-and-product-video.md
[FE-060-tests]: frontend/FE-060-self-service-cover-and-product-video.md#test-plan
[FE-061]: frontend/FE-061-category-starter-and-demo-videos.md
[FE-061-tests]: frontend/FE-061-category-starter-and-demo-videos.md#test-plan
[FE-062]: frontend/FE-062-inquiry-and-chat-alerts.md
[FE-062-tests]: frontend/FE-062-inquiry-and-chat-alerts.md#test-plan
[FE-063]: frontend/FE-063-listing-reporting-and-business-blocking.md
[FE-063-tests]: frontend/FE-063-listing-reporting-and-business-blocking.md#test-plan
[FE-064]: frontend/FE-064-restricted-store-review-access.md
[FE-064-tests]: frontend/FE-064-restricted-store-review-access.md#test-plan-and-rollout
[FE-065]: frontend/FE-065-independent-business-and-product-search.md
[FE-065-tests]: frontend/FE-065-independent-business-and-product-search.md#test-plan
[FE-066]: frontend/FE-066-social-only-business-inquiries.md
[FE-066-tests]: frontend/FE-066-social-only-business-inquiries.md#test-plan-evidence-and-rollout
[FE-067]: frontend/FE-067-product-only-showrooms.md
[FE-067-tests]: frontend/FE-067-product-only-showrooms.md#test-plan-and-rollout
[FE-068]: frontend/FE-068-transport-plan-workspaces.md
[FE-068-tests]: frontend/FE-068-transport-plan-workspaces.md#test-plan-and-evidence
[FE-069]: frontend/FE-069-verified-tracking-portal.md
[FE-069-tests]: frontend/FE-069-verified-tracking-portal.md#test-plan-and-rollout-gates
[FE-070]: frontend/FE-070-mirtpage-brand-and-showroom-narrative.md
[FE-070-tests]: frontend/FE-070-mirtpage-brand-and-showroom-narrative.md#test-plan
[FE-071]: frontend/FE-071-public-showroom-search-discovery.md
[FE-071-tests]: frontend/FE-071-public-showroom-search-discovery.md#test-plan
[FE-072]: frontend/FE-072-admin-controlled-staff-business-management.md
[FE-072-tests]: frontend/FE-072-admin-controlled-staff-business-management.md#test-plan
[FE-073]: frontend/FE-073-owner-sign-in-email-change.md
[FE-073-tests]: frontend/FE-073-owner-sign-in-email-change.md#observability-and-test-plan
[FE-074]: frontend/FE-074-contextual-loading-and-layout-skeletons.md
[FE-074-tests]: frontend/FE-074-contextual-loading-and-layout-skeletons.md#test-plan-and-rollout
[FE_BASE]: frontend/FE_BASE.md
[BE-001]: backend/BE-001-tenant-inquiry-security.md
[BE-001-tests]: backend/BE-001-tenant-inquiry-security.md#test-plan-and-evidence
[BE-002]: backend/BE-002-auth-and-adapter-hardening.md
[BE-002-tests]: backend/BE-002-auth-and-adapter-hardening.md#test-plan-and-evidence
[BE-003]: backend/BE-003-managed-request-publication-security.md
[BE-003-tests]: backend/BE-003-managed-request-publication-security.md#test-plan
[BE-004]: backend/BE-004-validated-showroom-composition-contract.md
[BE-004-tests]: backend/BE-004-validated-showroom-composition-contract.md#test-plan
[BE-005]: backend/BE-005-curated-showroom-bank-release.md
[BE-005-tests]: backend/BE-005-curated-showroom-bank-release.md#test-plan
[BE-006]: backend/BE-006-bounded-showroom-experience-contract.md
[BE-006-tests]: backend/BE-006-bounded-showroom-experience-contract.md#test-plan
[BE-007]: backend/BE-007-versioned-composition-publication.md
[BE-007-tests]: backend/BE-007-versioned-composition-publication.md#test-plan
[BE-008]: backend/BE-008-validated-showroom-recipe-import.md
[BE-008-tests]: backend/BE-008-validated-showroom-recipe-import.md#test-plan
[BE-009]: backend/BE-009-versioned-basic-product-upkeep.md
[BE-009-tests]: backend/BE-009-versioned-basic-product-upkeep.md#test-plan
[BE-010]: backend/BE-010-revision-v4-content-and-bank-contract.md
[BE-010-tests]: backend/BE-010-revision-v4-content-and-bank-contract.md#test-plan
[BE-011]: backend/BE-011-bazaar-occurrence-and-booth-contract.md
[BE-011-tests]: backend/BE-011-bazaar-occurrence-and-booth-contract.md#test-plan
[BE-012]: backend/BE-012-bazaar-admin-operations.md
[BE-012-tests]: backend/BE-012-bazaar-admin-operations.md#test-plan
[BE-013]: backend/BE-013-showroom-blueprint-and-fitness.md
[BE-013-tests]: backend/BE-013-showroom-blueprint-and-fitness.md#test-plan
[BE-014]: backend/BE-014-unified-offering-contract.md
[BE-014-tests]: backend/BE-014-unified-offering-contract.md#test-plan
[BE-015]: backend/BE-015-server-paginated-collection-queries.md
[BE-015-tests]: backend/BE-015-server-paginated-collection-queries.md#test-plan
[BE-016]: backend/BE-016-balanced-regional-expo-allocation.md
[BE-016-tests]: backend/BE-016-balanced-regional-expo-allocation.md#test-plan
[BE-017]: backend/BE-017-subscription-entitlement-and-visit-analytics.md
[BE-017-tests]: backend/BE-017-subscription-entitlement-and-visit-analytics.md#test-plan-and-evidence
[BE-018]: backend/BE-018-first-party-support-queue.md
[BE-018-tests]: backend/BE-018-first-party-support-queue.md#test-plan
[BE-019]: backend/BE-019-indexed-city-showroom-discovery.md
[BE-019-tests]: backend/BE-019-indexed-city-showroom-discovery.md#test-plan
[BE-020]: backend/BE-020-public-client-bootstrap-and-discovery-projection.md
[BE-020-tests]: backend/BE-020-public-client-bootstrap-and-discovery-projection.md#test-plan
[BE-021]: backend/BE-021-rich-offering-and-live-showroom-contract.md
[BE-021-tests]: backend/BE-021-rich-offering-and-live-showroom-contract.md#test-plan
[BE-022]: backend/BE-022-demo-showroom-portfolio-contract.md
[BE-022-tests]: backend/BE-022-demo-showroom-portfolio-contract.md#test-plan
[BE-023]: backend/BE-023-discovery-scale-and-attention-projection.md
[BE-023-tests]: backend/BE-023-discovery-scale-and-attention-projection.md#test-plan
[BE-024]: backend/BE-024-provider-neutral-media-storage.md
[BE-024-tests]: backend/BE-024-provider-neutral-media-storage.md#test-plan
[BE-025]: backend/BE-025-retired-delivery-surface.md
[BE-025-tests]: backend/BE-025-retired-delivery-surface.md#test-plan
[BE-026]: backend/BE-026-production-portability-hardening.md
[BE-026-tests]: backend/BE-026-production-portability-hardening.md#test-plan
[BE-027]: backend/BE-027-postgres-runtime-adapters.md
[BE-027-tests]: backend/BE-027-postgres-runtime-adapters.md#test-plan
[BE-028]: backend/BE-028-canonical-showroom-chapter-and-admin-media.md
[BE-028-tests]: backend/BE-028-canonical-showroom-chapter-and-admin-media.md#test-plan
[BE-029]: backend/BE-029-daily-featured-schedule-projection.md
[BE-029-tests]: backend/BE-029-daily-featured-schedule-projection.md#test-plan
[BE-030]: backend/BE-030-supabase-identity-bridge.md
[BE-030-tests]: backend/BE-030-supabase-identity-bridge.md#test-plan
[BE-031]: backend/BE-031-passwordless-identity-onboarding.md
[BE-031-tests]: backend/BE-031-passwordless-identity-onboarding.md#test-plan
[BE-032]: backend/BE-032-owner-page-drafts.md
[BE-032-tests]: backend/BE-032-owner-page-drafts.md#test-plan
[BE-033]: backend/BE-033-standard-page-lifecycle-and-discovery-pagination.md
[BE-033-tests]: backend/BE-033-standard-page-lifecycle-and-discovery-pagination.md#test-plan
[BE-034]: backend/BE-034-launch-catalog-and-owner-setup.md
[BE-034-tests]: backend/BE-034-launch-catalog-and-owner-setup.md#test-plan-and-rollout
[BE-035]: backend/BE-035-postgres-only-persistence.md
[BE-035-tests]: backend/BE-035-postgres-only-persistence.md#test-plan
[BE-036]: backend/BE-036-suqpage-naming-compatibility.md
[BE-036-tests]: backend/BE-036-suqpage-naming-compatibility.md#test-plan
[BE-037]: backend/BE-037-service-offering-compatibility.md
[BE-037-tests]: backend/BE-037-service-offering-compatibility.md#test-plan
[BE-038]: backend/BE-038-canonical-owner-place-anchors.md
[BE-038-tests]: backend/BE-038-canonical-owner-place-anchors.md#test-plan
[BE-039]: backend/BE-039-atomic-business-starter-content.md
[BE-039-tests]: backend/BE-039-atomic-business-starter-content.md#quality-observability-and-test-plan
[BE-040]: backend/BE-040-simple-offering-upkeep-and-word-search.md
[BE-040-tests]: backend/BE-040-simple-offering-upkeep-and-word-search.md#quality-and-test-plan
[BE-041]: backend/BE-041-owner-publication-and-immediate-location.md
[BE-041-tests]: backend/BE-041-owner-publication-and-immediate-location.md#scenarios-and-test-plan
[BE-042]: backend/BE-042-product-media-gallery.md
[BE-042-tests]: backend/BE-042-product-media-gallery.md#test-plan
[BE-043]: backend/BE-043-business-handle-lifecycle.md
[BE-043-tests]: backend/BE-043-business-handle-lifecycle.md#test-plan
[BE-044]: backend/BE-044-native-api-and-session-boundaries.md
[BE-044-tests]: backend/BE-044-native-api-and-session-boundaries.md#test-plan
[BE-045]: backend/BE-045-private-account-profile.md
[BE-045-tests]: backend/BE-045-private-account-profile.md#test-plan
[BE-046]: backend/BE-046-reviewed-product-video-providers.md
[BE-046-tests]: backend/BE-046-reviewed-product-video-providers.md#test-plan
[BE-047]: backend/BE-047-signup-city-anchor.md
[BE-047-tests]: backend/BE-047-signup-city-anchor.md#test-plan
[BE-048]: backend/BE-048-self-service-video-links.md
[BE-048-tests]: backend/BE-048-self-service-video-links.md#test-plan
[BE-049]: backend/BE-049-category-starter-video-selection.md
[BE-049-tests]: backend/BE-049-category-starter-video-selection.md#test-plan
[BE-050]: backend/BE-050-notification-events-and-chat-read-receipts.md
[BE-050-tests]: backend/BE-050-notification-events-and-chat-read-receipts.md#test-plan
[BE-051]: backend/BE-051-private-listing-reports.md
[BE-051-tests]: backend/BE-051-private-listing-reports.md#test-plan
[BE-052]: backend/BE-052-restricted-reviewer-authentication.md
[BE-052-tests]: backend/BE-052-restricted-reviewer-authentication.md#scenarios-and-test-plan
[BE-053]: backend/BE-053-verified-account-erasure.md
[BE-053-tests]: backend/BE-053-verified-account-erasure.md#test-plan-and-operations
[BE-054]: backend/BE-054-country-city-and-independent-discovery.md
[BE-054-tests]: backend/BE-054-country-city-and-independent-discovery.md#test-plan
[BE-055]: backend/BE-055-retired-business-inquiry-submission.md
[BE-055-tests]: backend/BE-055-retired-business-inquiry-submission.md#test-plan-and-rollout
[BE-056]: backend/BE-056-product-only-catalog.md
[BE-056-tests]: backend/BE-056-product-only-catalog.md#test-plan-and-readiness
[BE-057]: backend/BE-057-ordered-transport-plans.md
[BE-057-tests]: backend/BE-057-ordered-transport-plans.md#test-plan-and-observability
[BE-058]: backend/BE-058-verified-recipient-shipments.md
[BE-058-tests]: backend/BE-058-verified-recipient-shipments.md#test-plan-readiness-and-rollout
[BE-059]: backend/BE-059-mirtpage-data-and-protocol-compatibility.md
[BE-059-tests]: backend/BE-059-mirtpage-data-and-protocol-compatibility.md#test-plan
[BE-060]: backend/BE-060-admin-controlled-business-management.md
[BE-060-tests]: backend/BE-060-admin-controlled-business-management.md#test-plan
[BE-061]: backend/BE-061-owner-verified-email-identity.md
[BE-061-tests]: backend/BE-061-owner-verified-email-identity.md#test-plan
[BE_BASE]: backend/BE_BASE.md
[DEP-001]: deployment/DEP-001-controlled-pilot-release.md
[DEP-001-tests]: deployment/DEP-001-controlled-pilot-release.md#test-plan-and-evidence
[DEP-002]: deployment/DEP-002-reproducible-delivery-hygiene.md
[DEP-002-tests]: deployment/DEP-002-reproducible-delivery-hygiene.md#test-plan
[DEP-003]: deployment/DEP-003-managed-request-storage-rollout.md
[DEP-003-tests]: deployment/DEP-003-managed-request-storage-rollout.md#test-plan
[DEP-004]: deployment/DEP-004-showroom-bank-admission-gate.md
[DEP-004-tests]: deployment/DEP-004-showroom-bank-admission-gate.md#test-plan
[DEP-005]: deployment/DEP-005-mobile-experience-admission-gate.md
[DEP-005-tests]: deployment/DEP-005-mobile-experience-admission-gate.md#test-plan
[DEP-006]: deployment/DEP-006-four-client-composition-cutover.md
[DEP-006-tests]: deployment/DEP-006-four-client-composition-cutover.md#test-plan
[DEP-007]: deployment/DEP-007-showroom-recipe-rollout.md
[DEP-007-tests]: deployment/DEP-007-showroom-recipe-rollout.md#test-plan
[DEP-008]: deployment/DEP-008-stockless-product-upkeep-rollout.md
[DEP-008-tests]: deployment/DEP-008-stockless-product-upkeep-rollout.md#test-plan
[DEP-009]: deployment/DEP-009-revision-v4-bank-1-2-rollout.md
[DEP-009-tests]: deployment/DEP-009-revision-v4-bank-1-2-rollout.md#test-plan
[DEP-010]: deployment/DEP-010-bazaar-map-rollout.md
[DEP-010-tests]: deployment/DEP-010-bazaar-map-rollout.md#test-plan
[DEP-011]: deployment/DEP-011-showroom-benchmark-admission.md
[DEP-011-tests]: deployment/DEP-011-showroom-benchmark-admission.md#test-plan
[DEP-012]: deployment/DEP-012-unified-offering-rollout.md
[DEP-012-tests]: deployment/DEP-012-unified-offering-rollout.md#test-plan
[DEP-013]: deployment/DEP-013-dense-expo-demo-fixtures.md
[DEP-013-tests]: deployment/DEP-013-dense-expo-demo-fixtures.md#test-plan
[DEP-014]: deployment/DEP-014-scale-demo-workflow-fixtures.md
[DEP-014-tests]: deployment/DEP-014-scale-demo-workflow-fixtures.md#test-plan
[DEP-015]: deployment/DEP-015-free-first-service-readiness.md
[DEP-015-tests]: deployment/DEP-015-free-first-service-readiness.md#test-plan
[DEP-016]: deployment/DEP-016-city-showroom-cutover.md
[DEP-016-tests]: deployment/DEP-016-city-showroom-cutover.md#test-plan
[DEP-017]: deployment/DEP-017-local-geography-and-public-onboarding-rollout.md
[DEP-017-tests]: deployment/DEP-017-local-geography-and-public-onboarding-rollout.md#test-plan
[DEP-018]: deployment/DEP-018-rich-showroom-presentation-rollout.md
[DEP-018-tests]: deployment/DEP-018-rich-showroom-presentation-rollout.md#test-plan
[DEP-019]: deployment/DEP-019-complete-demo-portfolio-admission.md
[DEP-019-tests]: deployment/DEP-019-complete-demo-portfolio-admission.md#test-plan
[DEP-020]: deployment/DEP-020-suqpage-marketplace-rollout.md
[DEP-020-tests]: deployment/DEP-020-suqpage-marketplace-rollout.md#test-plan
[DEP-021]: deployment/DEP-021-data-preserving-launch-hardening.md
[DEP-021-tests]: deployment/DEP-021-data-preserving-launch-hardening.md#test-plan
[DEP-022]: deployment/DEP-022-postgres-and-devops-readiness.md
[DEP-022-tests]: deployment/DEP-022-postgres-and-devops-readiness.md#test-plan
[DEP-023]: deployment/DEP-023-supabase-vercel-production-cutover.md
[DEP-023-tests]: deployment/DEP-023-supabase-vercel-production-cutover.md#test-plan
[DEP-024]: deployment/DEP-024-daily-featured-schedule-rollout.md
[DEP-024-tests]: deployment/DEP-024-daily-featured-schedule-rollout.md#test-plan
[DEP-025]: deployment/DEP-025-pwa-cache-rollout.md
[DEP-025-tests]: deployment/DEP-025-pwa-cache-rollout.md#test-plan
[DEP-026]: deployment/DEP-026-netlify-and-supabase-capabilities-rollout.md
[DEP-026-tests]: deployment/DEP-026-netlify-and-supabase-capabilities-rollout.md#test-plan
[DEP-027]: deployment/DEP-027-local-supabase-development-runtime.md
[DEP-027-tests]: deployment/DEP-027-local-supabase-development-runtime.md#test-plan
[DEP-028]: deployment/DEP-028-suqpage-identity-cutover.md
[DEP-028-tests]: deployment/DEP-028-suqpage-identity-cutover.md#test-plan
[DEP-029]: deployment/DEP-029-production-auth-change-guard.md
[DEP-029-tests]: deployment/DEP-029-production-auth-change-guard.md#test-plan
[DEP-030]: deployment/DEP-030-suqpage-self-service-rollout.md
[DEP-030-tests]: deployment/DEP-030-suqpage-self-service-rollout.md#test-plan
[DEP-031]: deployment/DEP-031-postgres-only-tooling.md
[DEP-031-tests]: deployment/DEP-031-postgres-only-tooling.md#rollout-test-plan-and-rollback
[DEP-032]: deployment/DEP-032-suqpage-namespace-rollout.md
[DEP-032-tests]: deployment/DEP-032-suqpage-namespace-rollout.md#test-plan
[DEP-033]: deployment/DEP-033-runtime-auth-entry-rendering.md
[DEP-033-tests]: deployment/DEP-033-runtime-auth-entry-rendering.md#test-plan-and-rollback
[DEP-034]: deployment/DEP-034-service-offering-rollout.md
[DEP-034-tests]: deployment/DEP-034-service-offering-rollout.md#test-plan
[DEP-035]: deployment/DEP-035-canonical-place-selection-rollout.md
[DEP-035-tests]: deployment/DEP-035-canonical-place-selection-rollout.md#test-plan
[DEP-036]: deployment/DEP-036-business-starter-rollout.md
[DEP-036-tests]: deployment/DEP-036-business-starter-rollout.md#quality-observability-and-test-plan
[DEP-037]: deployment/DEP-037-simple-offering-search-rollout.md
[DEP-037-tests]: deployment/DEP-037-simple-offering-search-rollout.md#quality-and-test-plan
[DEP-038]: deployment/DEP-038-self-service-workflow-and-demo-rollout.md
[DEP-038-tests]: deployment/DEP-038-self-service-workflow-and-demo-rollout.md#scenarios-and-test-plan
[DEP-039]: deployment/DEP-039-product-media-gallery-rollout.md
[DEP-039-tests]: deployment/DEP-039-product-media-gallery-rollout.md#test-plan
[DEP-040]: deployment/DEP-040-handle-registry-rollout.md
[DEP-040-tests]: deployment/DEP-040-handle-registry-rollout.md#test-plan
[DEP-041]: deployment/DEP-041-demo-account-email-aliases.md
[DEP-041-tests]: deployment/DEP-041-demo-account-email-aliases.md#test-plan
[DEP-042]: deployment/DEP-042-expo-workspace-rollout.md
[DEP-042-tests]: deployment/DEP-042-expo-workspace-rollout.md#test-plan
[DEP-043]: deployment/DEP-043-notification-delivery-rollout.md
[DEP-043-tests]: deployment/DEP-043-notification-delivery-rollout.md#test-plan
[DEP-044]: deployment/DEP-044-google-play-testing-rollout.md
[DEP-044-tests]: deployment/DEP-044-google-play-testing-rollout.md#test-plan
[DEP-045]: deployment/DEP-045-independent-discovery-and-demo-safety.md
[DEP-045-tests]: deployment/DEP-045-independent-discovery-and-demo-safety.md#test-plan
[DEP-046]: deployment/DEP-046-product-only-demo-and-rollout.md
[DEP-046-tests]: deployment/DEP-046-product-only-demo-and-rollout.md#test-plan-and-rollout
[DEP-047]: deployment/DEP-047-transport-plan-rollout.md
[DEP-047-tests]: deployment/DEP-047-transport-plan-rollout.md#test-plan-and-evidence
[DEP-048]: deployment/DEP-048-verified-tracking-rollout.md
[DEP-048-tests]: deployment/DEP-048-verified-tracking-rollout.md#test-plan-and-rollback-checks
[DEP-049]: deployment/DEP-049-mirtpage-domain-and-app-cutover.md
[DEP-049-tests]: deployment/DEP-049-mirtpage-domain-and-app-cutover.md#test-plan
[DEP-050]: deployment/DEP-050-owner-email-change-rollout.md
[DEP-050-tests]: deployment/DEP-050-owner-email-change-rollout.md#test-plan
[DEP_BASE]: deployment/DEP_BASE.md
[ADR-0001]: ../docs/adr/ADR-0001-pragmatic-hexagonal-domain-boundaries.md
[ADR-0002]: ../docs/adr/ADR-0002-controlled-pilot-runtime.md
[ADR-0003]: ../docs/adr/ADR-0003-spec-driven-delivery.md
[ADR-0004]: ../docs/adr/ADR-0004-managed-service-request-operations.md
[ADR-0005]: ../docs/adr/ADR-0005-constrained-showroom-composition.md
[ADR-0006]: ../docs/adr/ADR-0006-scoped-product-upkeep.md
[ADR-0007]: ../docs/adr/ADR-0007-additive-revision-v4-and-bank-release-evolution.md
[ADR-0008]: ../docs/adr/ADR-0008-review-gated-draft-copy-and-custom-palettes.md
[ADR-0009]: ../docs/adr/ADR-0009-first-party-support-with-optional-notifications.md
[ADR-0010]: ../docs/adr/ADR-0010-manual-subscription-ledger-and-managed-postgres-target.md
[ADR-0011]: ../docs/adr/ADR-0011-review-gated-self-service-onboarding-and-public-visibility.md
[ADR-0012]: ../docs/adr/ADR-0012-provider-neutral-media-storage.md
[ADR-0013]: ../docs/adr/ADR-0013-staged-postgres-and-identity-migration.md
[ADR-0014]: ../docs/adr/ADR-0014-managed-supabase-identity-and-portable-hosting.md
[ADR-0015]: ../docs/adr/ADR-0015-local-supabase-runtime-and-sqlite-retirement.md
[ADR-0016]: ../docs/adr/ADR-0016-policy-compliant-osm-basemap.md
[ADR-0017]: ../docs/adr/ADR-0017-auth-first-passwordless-onboarding.md
[ADR-0018]: ../docs/adr/ADR-0018-owner-controlled-template-pages.md
[ADR-0019]: ../docs/adr/ADR-0019-standard-page-workflow-retirement.md
[ADR-0020]: ../docs/adr/ADR-0020-postgres-only-persistence.md
[ADR-0021]: ../docs/adr/ADR-0021-suqpage-namespace-compatibility.md
[ADR-0022]: ../docs/adr/ADR-0022-interface-localization.md
[ADR-0023]: ../docs/adr/ADR-0023-live-buying-and-native-client-boundaries.md
[ADR-0024]: ../docs/adr/ADR-0024-embedded-tiktok-product-videos.md
[ADR-0025]: ../docs/adr/ADR-0025-self-service-public-video-embeds.md
[ADR-0026]: ../docs/adr/ADR-0026-scoped-attention-and-background-push.md
[ADR-0027]: ../docs/adr/ADR-0027-offline-country-city-catalog.md
[ADR-0028]: ../docs/adr/ADR-0028-tracking-recipient-identity.md
[ADR-0029]: ../docs/adr/ADR-0029-mirtpage-rebrand-and-stable-identities.md
[ADR-0030]: ../docs/adr/ADR-0030-global-staff-business-management.md
[ADR-0031]: ../docs/adr/ADR-0031-transactional-gmail-smtp.md

[FE-075]: frontend/FE-075-primary-business-inquiries-and-owner-inbox.md

[FE-076]: frontend/FE-076-single-coordinator-transport-entry.md

[FE-077]: frontend/FE-077-shipment-record-parties.md

[BE-062]: backend/BE-062-canonical-inquiry-intake-and-owner-inbox.md

[BE-063]: backend/BE-063-single-coordinator-partner-interest.md

[BE-064]: backend/BE-064-shipment-party-access.md
