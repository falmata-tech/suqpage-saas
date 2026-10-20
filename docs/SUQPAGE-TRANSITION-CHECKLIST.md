# MirtPage active delivery checklist

Current product authority: [master brief](../SUQPAGE-MASTER-PROMPT.md).
Requirements and evidence: [traceability](../specs/TRACEABILITY.md),
[DEP-049](../specs/deployment/DEP-049-mirtpage-domain-and-app-cutover.md).
Updated 2026-10-20. This working board replaces dated `CURRENT` labels; it does
not authorize a provider write or rerun an already completed migration/build.

## Current position

MirtPage is live at **mirtpage.com** on schema **77**. The new Android identity
is **com.mirtpage.app**. The prior Suqpage app's enrollment does not transfer.
Source `d78dcf538927a1b403899d196f5631ebc199cd8c` passes its complete check,
clean web release, 20/20 acceptance and all five CI jobs. Its website update is
published as `6ad7d7978faaa5baa6eee605`; optimized public images still fail, so
**the combined rollout is incomplete**. B09 is the first unmet dependency.

The nonvisual B09 correction and workflow improvements are qualified at source
digest `c6ddc736…a3d185` (2,320 files): all 77 check commands pass through the
preserved 18-command prefix and the complete 59-command continuation. The original
full-check exit 1 remains recorded. Clean web release exits 0 with no production
vulnerabilities; full acceptance exits 0 with 20/20 scenarios. Raw browser
destination-stream-close messages remain retained and unclassified; this is not
a claim of an error-free browser log or a raw full-check exit zero.

Commits `a153547` (B09 routing) and `7e24014` (workflow/skills) are pushed.
GitHub run `39509285979` attempt 2 has all five jobs passing on `7e24014`.
The original core operations-fixture startup failure remains retained; the
successful unchanged retry does not establish its exact cause. R01 is complete;
the first unmet release dependency is R02's exact hosted recovery approval.

Version 2 AAB and derived APK are built and statically inspected from `d78dcf5`.
The owner's phone/ADB hold remains in force; use Expo for permitted local checks.
No version 2 device qualification, MirtPage Play upload, twelve-person opt-in count
or fourteen-day test is claimed.

## Surface status

| Surface | Implemented | Tested | Visually approved | Deployed / delivered |
| --- | --- | --- | --- | --- |
| B01–03/B06–08/B10 cards, navigation, loading, sponsors and categories | Yes | Focused + d78 full gates/CI; current recovery gates separate | Updated B01–B10 batch approved | First web update published; image-dependent rollout incomplete; Android static only |
| B09 physical image routing correction | Yes, exact alias-only file | Focused + c6dd composite check, release, 20/20 acceptance, CI and final local admission pass | Nonvisual correction; no geometry changed | Exact provider plan prepared; owner approval and monitored publication pending |
| B04/B05 demo contacts/catalog cleanup | Applied exact finite operations | Independent complete readback | Separate actual data/settings approvals | Live; no repeat data write needed |
| Opaque Auth-email logo | Source + public PNG + thirteen HTML templates | Pixel/template/Chrome/local gates and guarded hosted readback | Approved light/dark visuals and exact hosted change | Applied/read back; no email sent by this operation, actual inbox rendering remains separate |
| Owner sign-in email change | Local guarded source/schema | Local two-mailbox/provider/security proof | Prior reviewed layouts; current hosted behavior unqualified | Initiation disabled; exact Auth/settings/notices gate pending |
| Android version 2 | Compiled once from d78 | Independent static inspection | Approved shared layouts; genuine native captures pending | Local artifact exists; phone/OS/Play delivery unverified |
| New MirtPage Alpha | App/listing/tester list saved | Prior console reloads; fresh admission pending | Logo/charcoal graphics approved | No MirtPage release/12 actual opt-ins/14-day test claimed |
| Workflow/skills/docs consolidation | Skills/checker and reviewed compact docs committed/pushed | App CI passes on 7e; isolated L0 docs checks and root review pass | No UI change | Docs branch integration and actual skill selection remain separate |

## Ordered work

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
- [ ] Commit/push the reviewed docs scope; preserve unrelated work and artifact refs.
- [x] Verify the exact project/repository, retain the before-state and disconnect
  only that Git connection. Fresh provider reload confirms the removal on
  2026-10-20; project/deployments and the account App installation remain.
  Netlify, domains/secrets and other repositories were not changed. Protected
  `workflow-improvement-research/vercel-retirement/result.json` records the result.
- [ ] On the next authorized source push, verify no new Vercel preview/production
  trigger for that new head. Keep required GitHub checks and Netlify delivery
  evidence separate; this follow-up is not implied by provider readback.

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

### R02 — Publish and monitor the exact B09 recovery (CURRENT)

The local assembly is qualified. Hosted publication depends on **R01**, exact
artifact/source admission and separate scoped approval under DEP-049.

- [x] Assemble the complete deployment with only the corrected physical
  `_redirects` bytes changed. Retain byte-identical virtual config, both Linux
  function ZIPs, worker schedule, completed edge artifacts and all three deploy
  blobs. Local manifest/lineage, 114/114 focused tests and actual `--check-local`
  admission pass; successful final CI is bound (traceability E5).
- [x] Prepare/read back the exact read-only provider plan from the verified
  site/account/domain/deploy, 41 environment objects and protected previous
  deploy. This preparation makes no hosted write.
- [ ] Obtain owner approval of that exact fresh plan, then recheck its guarded
  admission. Consumed earlier approval is not reusable.
- [ ] Apply that one reviewed operation and read back the same deployment's
  files/functions/blobs/configuration. Stop on ambiguity; no automatic retry or
  restore. Database, Auth, DNS, email and signing are outside this operation.
- [ ] GET and decode originals and optimized images at 384/640/3840 pixels;
  exercise desktop/phone Chrome card → preview → showroom → Back; verify public
  APIs, private-media denial and scheduled worker health. Retain any failures.
  A generic public HTML response at `/.env` is not a 4xx privacy-test pass or a
  proof of universal secret absence; evaluate response content and exclusions.
- [ ] Record exact source/deploy/CI/receipt identities and remaining limitations;
  declare only the surfaces whose live evidence actually passes.

### R03 — Reconcile public and management workflows

Depends on **R02** for hosted verification; local independent work can continue.
FE-019/021/026/041/049/050/053/056/062/065–074,
BE-018/029/032/033/044/050/054–061. Retains S2–S146 and B01–B10 acceptance.

- [ ] Reconcile existing source-matched checks and approvals against the current
  affected visitor/owner/staff/admin journeys; run only missing or invalidated
  checks. Do not repeat historical operations because an old box was left open.
- [ ] Cover independent business-map and product searches, country/city filters,
  bounded initial results, infinite products, remembered panel/criteria and Back;
  compact toolbar, max-zoom/all-fit clusters, rich previews and optional collections.
- [ ] Cover product-only ready/custom-order cards, descriptions and location,
  card-level Add/options/stock, per-business floating inquiry lists, localized
  copied product messages and configured SMS/Telegram/WhatsApp handoffs.
  Social profile links remain separate; no direct MirtPage business inbox returns.
- [ ] Cover focused Account/business/page/product/media/location/publish tasks,
  real signup/private starters/handle rules, staff grants/revocation, admin record
  navigation, save/cancel/failure states and owner-only security boundaries.
  Team-editing owner consent and retired subscription controls stay removed.
- [ ] Cover visitor and owner Transport, separate owner Support, workload-based
  assignment, explicit staff Join, truthful reads, idle-ending reasons, overdue
  admin alerts and permissions. Preserve unresolved follow-up and private history.
- [ ] Cover independent multiple shipments per recipient email, verified portal
  access, editable ordered legs/methods and external tracking links/codes. No
  conversation-ID ownership, invented scan integration or delivery-date promise.
- [ ] Preserve Featured schedule/caps/sponsor disclosure and rotation, gallery
  selection/playback, theme identity, plain information-page backgrounds,
  loading retention/skeletons, report/moderation and anonymous safety behavior.
- [ ] Review remaining en/am/om comprehension with native speakers when available;
  semantic catalog/layout tests do not prove native fluency. Somali, Afar and
  Tigrinya remain disabled; no automatic locale restoration is planned.

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

### R05 — Qualify the existing Android version 2 artifact

DEP-042/043/044/049. Hosted device workflows use stable compatible APIs and the
owner's actual phone availability; permitted local preparation can continue.
The web-only B09 routing fix does not require a new native compilation.

- [x] One authorized compilation produced version 2 AAB and derived APK; independent
  static inspection verifies package/signing/config/resources/App Links/Hermes,
  native library equality, ELF alignment and zipalign. Exact hashes: traceability E3.
- [ ] When the owner releases the phone hold, verify installed artifact identity
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
