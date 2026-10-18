---
id: FE-070
title: MirtPage identity and inclusive digital showroom experience
status: in_progress
related: [BE-059, DEP-049, ADR-0029]
owners: [product, frontend, localization]
last_updated: 2026-10-18
change_level: L2
---

# FE-070 — MirtPage identity and digital showrooms

## Problem and outcome

The owner replaces the Suqpage brand with MirtPage, retaining the current orange,
charcoal, cream and white palette. The platform gives businesses of every size
an organized digital showroom: their brand and story, products and optional
collections, with direct customer contact instead of searching social posts.
Retailers, workshops, factories, farms and raw-material suppliers are included;
the proposition must not imply that only small or social-only sellers qualify.

## Scope and staged readiness

The independent local presentation phase is Ready: create an original code-native
symbol/wordmark, integrate the shared web/native brand and public narrative, and
preview desktop/phone/app-icon contexts. The owner chooses a new Android package;
its Firebase registration and separate Play Draft are now verified under DEP-049,
while native wiring/build/signing and release remain later gates. This local
phase does not change runtime API/canonical origins, provider IDs, traffic, signing,
email delivery semantics or production data. Full rollout follows DEP-049. Local
implementation is not an approved shipped brand.

The next independent local presentation tranche also covers nonpersisted backend
validation/consent messages, category labels and read-only renderer fallbacks.
Their error codes, status, permissions and wire schemas remain unchanged. Add
localized MirtPage wording without altering stored customer snapshots, support
requester-label INSERTs/defaults, migration history, senders or delivery jobs.
Prepare this change while the current application review is frozen; apply only
after the owned review browser closes, then verify focused error/localization and
identity contracts against a new source baseline.

Cover public/owner/staff/admin shells, authentication, legal/About/SEO/social
metadata, shared email and notification presentation, PWA/native icons/splash,
Play listing/screenshots and promotional materials. Use the existing design
system and task-based workspaces; this is not permission to replace tenant logos,
colors, names, stories or product photographs with platform branding.

Master sections affected: 1/2/3/5/10/12/13/15/16/17/18/19/22/23/24/25 and current
brand-specific appendices. Until each phase is verified, label it planned/local;
the current hosted brand and previously released artifacts remain historical facts.

## Contracts and invariants

- Latest owner copy refinement (2026-10-18): lead with a professional digital
  showroom for businesses of every size, including online sellers, retailers,
  workshops, growers/farms and manufacturers. Follow with customer-facing copy
  explaining the range, story, product choices and business-listed availability,
  then direct contact without searching old social posts. This is a meaning-first
  refinement of the shared Market/About/SEO/mobile and new-app draft materials,
  not a claim of verified inventory or a restriction to social-only sellers.
  Keep the approved design and canonical artwork. This independent copy tranche
  is Ready; it requires focused active-language/render checks and actual Chrome
  before its revised wording/layout is treated as visually reviewed. The earlier
  explicit approval remains valid for unchanged artwork and layouts.
- The final public name is exactly MirtPage everywhere. Brand words remain
  untranslated. Old names are retained only where historical evidence, required
  technical identities or a safe bounded cutover need them, not as public co-branding.
- The owner visually approved the combined local logo, wording and layouts on
  2026-10-18, requiring consistent artwork and color shades on every platform.
  All current platform marks, app/PWA/notification icons and store exports derive
  from the approved two-panel M geometry. Logo orange is exactly `#ff4b00`, white
  exactly `#ffffff`, and wordmark ink `#202428`; antialiasing, accessible dark/light
  wordmark contrast and operating-system masks do not introduce alternative marks
  or palettes. Buttons retain their deliberately accessible action color.
  Local artwork references and native icon/splash/notification presentation fields
  may be corrected for this parity without changing package/provider/signing,
  credentials or runtime origins. Verify both geometry and color, not filenames.
- Use digital showroom in English, not internet showroom/page as the proposition.
  Explain the idea naturally in active Amharic and Afaan Oromo. Inactive locales
  remain inactive; catalog generation must not accidentally enable them.
- Copy connects brand/story, product range/collections and direct questions. It
  may describe listed availability and made-to-order products; it cannot promise
  verified stock, production capacity, delivery dates, checkout or carrier scans.
- Transport/shipping help and owner support remain live-chat services. The
  showroom business model has no visitor subscription or paid browsing. Margin
  strategy and internal brokerage economics are not public interface copy.
- Preserve compact Market controls, audience-based About, per-business inquiry
  selection/social handoff, independent Tracking, role/tenant boundaries and
  current owner/staff task navigation.
- Introduce a small pure presentation identity contract where useful; runtime
  origins still come from validated environment configuration. Do not replace
  cookie/storage/header/provider identities as a side effect of visible copy.
- Reconcile existing MirtPage-to-Suqpage asset aliases explicitly. New assets
  cannot be shadowed by those aliases or produce redirect cycles.

## Scenarios

GIVEN a visitor on web, phone web or the native preview WHEN they open Market,
About or a showroom THEN the platform is MirtPage and explains business digital
showrooms clearly AND merchant identity and existing discovery actions remain.

GIVEN an owner, staff member or admin WHEN they complete their authorized tasks
THEN shells, notices, emails and notification presentation use the new identity
AND authorization, saved data, chat/Tracking behavior and return context persist.

GIVEN long Amharic/Oromo or enlarged text WHEN the same tasks render THEN names,
tabs, buttons and copy fit accessibly without shrinking or clipping necessary text.

GIVEN a retained historical/technical Suqpage identifier WHEN the brand audit runs
THEN it is classified with a compatibility/history reason rather than blindly
rewritten or misreported as newly visible MirtPage branding.

## Test plan

Focused identity/assets/alias tests, narrative and localization/catalog checks,
PWA/favicon/email-branding/mobile-link tests and affected TypeScript checks.
Registered focused regressions include `scripts/test-platform-brand.ts`,
`scripts/test-backend-brand-presentation.ts` and
`scripts/test-mirtpage-draft-materials.cjs`. Existing localization tests execute
Market/About metadata generation for all active languages, including an explicit
Open Graph site name on child routes that replace the root metadata object.
Actual Google Chrome visitor/owner/staff/admin tasks on desktop/phone web and
Expo8082, with real local API/database outcomes and synthetic automated tiles.
Include320px/enlarged text, en/am/om, fresh and existing sessions, media upload,
social product handoff, support/transport and Tracking. Capture current states
before explicit visual approval and full check/release/acceptance gates. Retake
store screenshots from the actual approved MirtPage app; concept art is not proof.

## Current evidence and limits

Shared identity/assets/copy and nonpersisted backend display messages are local
candidates with focused evidence. The public actual review completed 36
functional checks/36 states and 18 real search readbacks; owner review completed
13 checks/30 states with ordinary local email-code sign-in and unchanged catalog,
draft/publication and location fingerprints. As-run source hashes are retained.
The later backend tranche appended ten translation rows without changing any
previous TSV bytes or the captured hero/About text; it has four focused display
regressions and current identity/localization/catalog/type evidence.

These are not clean full/release receipts: public raw cancellation evidence
includes one unproven native request; owner raw console failures include two
expected unauthenticated Tracking 401 notices, with the related cancelled
startup requests individually explained in a sidecar. Preserve these raw results
and the separately classified test-readiness failures. Staff/admin role slices
record six completed checks/19 states; a documented streaming redirect denies
scoped staff admin access without exposing its heading. A later fresh-phone headed Apply completes the normal trusted click/GET and
correct API result; its raw parent subsequently fails a duplicate-brand-image
screenshot locator, retained as harness failure. The original stall cause is
unproven; no product repair is claimed. Canonical artwork parity now has four
asset/renderer tests, ten worker regressions and nine actual Chrome states.
The owner’s earlier artwork/layout approval remains valid.

Latest copy refinement: six shared strings changed; no unrelated locale values
changed. Focused narrative/catalog,20 localization/metadata cases, seven private
material checks and scoped types pass. Actual headed Chrome passes27 checks and
27 states across en/am/om desktop/phone web and Expo: Market copy/metadata, About
audiences/keyboard controls, customer return and business sign-in entry. Zero
application/console/request/lifecycle errors; synthetic automated tiles only.
AM/OM are meaning-first agent copy, not independent human certification. The owner explicitly approves this
revised copy and full checks on2026-10-18. Current-source application and release
gates now pass; all20 browser acceptance cases now pass as recorded below. Unchanged artwork
approval is preserved.

The current full workflow-UI group passes362/362 with no skipped/cancelled cases.
The earlier group passed361/362 after stale fixture repairs; its
one Chrome-launch timeout occurred before map assertions, and the unchanged
focused case passes on one controlled retry. Raw parents remain failed. The
full check now completes all76 command groups through source-bound first-
incomplete resumes; repairs change tests/planning documentation only. The complete
web release gate passes, including both clean dependency audits, production build,
artifact privacy, provider-backed HTTP/security, migration and tenant/data checks.
DEP-045's exact public-gazetteer admission has29 regressions and actual-build
evidence:93 traces/110 admitted references, absent from54 browser chunks. A
classified disposable Storage startup failure passed on one unchanged-source
release retry. Earlier browser acceptance includes a separate startup-only
failure, a17/20 run and a16/20 corrected run. Proven stale
Cancel/Preview selectors and ordinary-scroll assumptions have test-only repairs.
Actual installed Chrome proves full Send clearance/hit tests after normal PageDown
with all71 public-table fingerprints unchanged after exact cleanup. The corrected
complete16/20 run includes transport Join/reply/privacy/history. Its request/
locator contracts are repaired with strict assertions retained. A controlled
signup replay passes without proving the original Loading failure's cause. A
later interrupted run records9 passes/1 strict Sign out locator failure and10
unobserved cases; it is not a terminal suite result. The exact Sign out helper
now targets the Account main form while preserving logout/private-route checks.

The final isolated full browser gate passes20/20, zero skips/retries, exit0 on
snapshot9e8e8e04774ca23af878169c64e6704e60cca35a17df3e9c50d560abdb953f00.
Application/dependency inputs match release14956738f3d2382334d7855721bd1caf39a7eac1890838949c8c1a672d9d864e;
differences are the reviewed test repairs and status documentation. Exact owned
test containers/server/bucket/temp resources are cleaned, normal web/Expo remain
HTTP200 and all frozen inputs are verified unchanged. Evidence: private
gates/acceptance-completion.json and durable-acceptance-20261018/completion.json.
This suite uses Playwright Chromium; the actual Google Chrome reviews above
remain separate evidence. All failed/interrupted attempts and13 final raw
stream-closed errors are retained. Synchronous Playwright execution blocks the
runner's asynchronous app-log forwarding, so post-summary output does not prove
the closures happened at shutdown. Request/timing attribution remains unproven.
The owner selects the charcoal
feature-graphic direction: canonical assets, minimal localized copy and validated
1024×500 RGB exports. This is selected private artwork, not proof of an upload-ready
listing or a new-app screenshot. Provider configuration, new package/binary/
store publication, mail/sender changes and bounded defaults remain separate.

## Rollout and rollback

Local design → integrated local brand/copy → visual approval → full gates →
DEP-049 controlled hosted/domain/app rollout. Retain previous assets/artifact
for rollback and classified legacy routes. No deployment, new native build, paid service
or provider configuration change follows from this Ready local phase alone.
