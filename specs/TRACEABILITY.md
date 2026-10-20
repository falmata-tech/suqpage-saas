# Suqpage traceability matrix

Update this table in the same change that completes or materially changes a spec.
Evidence must be reproducible; avoid transient chat claims.

S146 active-language account-copy brand parity (FE-070/FE-049, local only):
two reachable Amharic/Afaan Oromo account-deletion and Expo staff-access notices
now name MirtPage in `locales/interface.tsv` and generated client catalogs.
`scripts/test-localization.ts` checks both active keys and the no-old-brand
boundary; focused localization passes 22 frontend/four backend cases, and spec
validation passes 217. Installed Chrome passes five account-deletion web/Expo
phone/desktop states with zero browser errors; receipt/screenshots are under
`.local/account-brand-s146/`. A real local admin sign-in received
`403 staff_web_only` and rendered the Amharic notice, but the only screenshot
retained the language sheet. Local Auth rate-limited subsequent attempts,
including a second existing identity. Settled staff-denial captures in both
languages and visual approval remain open. No hosted configuration, provider,
full release gate, application deployment or native build changed.

S146 native public-origin correction (FE-070/DEP-049):
`apps/mobile/src/public-origin.ts` now supplies the validated configured origin
to native API, About legal actions, external links and social-video WebView.
`social-player.ts` admits the exact local development root while retaining
reviewed provider-only navigation and hostile-link denials. `npm run
test:mobile:links` passes8 cases including actual compiled About/WebView
adapters across default/local/staging/invalid origin; product-video passes4,
mobile strict types and `test:mobile:build` pass. Actual installed Chrome on
Expo8082 passes Market→About→Privacy/Terms→return/tab switch with4 checks,
zero app errors/failed local requests and6 controlled map tiles. Receipt and
screenshots: `.local/s146-mobile-origin-review/`. Native Android/referrer and
third-party playback remain unverified; no deployment is claimed.
The actual compiled `YouTubeFrame` adapter now passes four focused cases via
`node --import tsx scripts/test-mobile-video.ts`: missing package uses
`com.mirtpage.app`, configured new/old package and Expo Go origins remain intact,
and non-provider navigation is denied. The npm `tsx` launcher is blocked at
sandbox IPC creation (`EPERM`) before tests. Mobile/root types pass.

S145 latest checkpoint (2026-10-18): the refined “A professional digital showroom
for every business” introduction and customer-facing range/story/listed-availability
body are implemented in shared web/About/mobile/SEO and new-app drafts. Six strings
changed with zero unrelated locale-value changes; catalog/narrative/types,20
localization and seven material cases pass. Actual headed Chrome passes27 checks/
27 states across en/am/om desktop/phone web and Expo, including About keyboard/CTA
navigation and current web metadata, with zero app/console/request/lifecycle errors.
The owner explicitly approves the refined copy and full checks on2026-10-18;
unchanged artwork approval remains valid. The complete76-group application check
and full web release gate pass on source-bound isolated candidates. Full browser
acceptance now passes20/20 with exit0 on snapshot
9e8e8e04774ca23af878169c64e6704e60cca35a17df3e9c50d560abdb953f00; its
application/dependency inputs match passing release14956738f3d2382334d7855721bd1caf39a7eac1890838949c8c1a672d9d864e.
The first full run passed17/20. Proven
Cancel/Preview selector and ordinary-scroll repairs retain assertions; actual
installed Chrome independently verifies Send clearance/hit tests with all71
public table fingerprints unchanged after exact cleanup. The next complete run
passes16/20, including the repaired transport Join/reply/privacy/history journey.
Its failures are the preview remaining Loading, retired native inquiry request
Origin, duplicate product-card matching and duplicate workbench matching. The
three request/locator repairs retain410/403 boundaries and exact active entity/
workspace assertions. Controlled signup replay passes without explaining the
original Loading failure; the next interrupted run records9 passes/1 strict
Sign out locator failure/10 unobserved cases. The exact helper now selects the
Account main Sign out form and preserves auth/private-route assertions. The
final20-case run passes without skips or retries. All original failed/partial
receipts remain unchanged. Thirteen final stream-closed errors remain unclassified:
the synchronous test execution blocks asynchronous app-log forwarding, so their
post-summary output cannot establish shutdown versus navigation occurrence.
Private gates/acceptance-completion.json and durable-acceptance-20261018 contain
raw artifacts, exact cleanup, all2238 frozen hashes and unchanged normal runtime
identities; web/Expo are HTTP200 after completion. Chromium suite results and
actual Google Chrome review results are distinguished.
This is local verification, not a hosted or new-native release.
Canonical outlined/raster parity has four asset/renderer tests, ten worker cases
and nine actual Chrome states. The earlier fresh-phone headed Apply now completes
with real API readback; its parent later fails a duplicate-image screenshot helper,
retained without claiming a product repair or explaining the original stall.

The full workflow-UI group initially passed343/362; proven stale test fixtures were
fixed without dropping required assertions. Its repeat passes361/362, with one
Chrome-launch timeout before map assertions. The unchanged isolated case passes
on one controlled retry. Raw parents remain failed. Reviewed test-only discovery,
explicit-Join/assignment, benchmark and gallery corrections preserve assertions
and complete all76 command groups. DEP-045's public gazetteer artifact guard adds
29 positive/negative cases while preserving every other private/source denial;
the complete release passes93 traces/110 exact required references and54 browser
chunks with no catalog snapshot. Provider HTTP/security checks pass1/1. Both web
dependency audits report0 vulnerabilities. Protected source-bound receipts are under
`.local/mirtpage-rebrand-s145/{gates,copy-refinement,copy-materials,actual-copy,parity}/`.
BE-059/DEP-029 local finite origin guard adds version3 kind/phase-bound plans and
refuses version2 before provider reads;62 injected-port/credential cases and scoped
types pass. Independent peer review is closed and these cases pass in the
completed application check. GoDaddy7/7
records and Netlify exact site/account/domain beforeimages are verified, with an
owner-approved domain connection plan. New apex/www aliases and the two exact
DNS changes are saved/read back, with all other zone records and the current
primary/deployment retained. Managed TLS/31 domain-stage checks now pass, including
eight normal-HTTPS root/health probes and unchanged20 public asset paths. The
new Firebase Android registration and separate Free Play Draft for com.mirtpage.app
are verified in provider-domain-apply/verified.json and provider-registration/
verified.json. Final public branding is MirtPage throughout; old identities are
retained only for safe migration, compatibility or historical authority. No new build, commit, application
deployment, canonical/Auth/mail/data cutover or store rollout is claimed.
Hosted Auth separately stages only the exact new callback alongside the old:
site_url stays https://suqpage.com and Google login disabled. Independent readback
matches the approved patch across243 fields with241 non-target fields unchanged.
Evidence: private auth-origin-staging/retry-2026-10-18T20-51-57-965Z/
independent-readback-verified.json. New-primary Auth remains unapplied.

S145 (2026-10-18, local implementation/focused evidence; visually approved, not deployed): FE-070,
BE-059, DEP-049 and proposed ADR-0029 cover the complete MirtPage rebrand. Owner
confirms current palette, mirtpage.com purchased through GoDaddy and a NEW com.mirtpage.app/Play
app with fresh testing. Three read-only inventories distinguish visible branding
from provider/protocol identities. The original two-panel M, canonical shared
web/native presentation, unique unshadowed SVG/PWA/native artwork and active
English/Amharic/Oromo narrative are implemented locally. The SuqpageBrand import
shim preserves callers without exposing the old wordmark. Tenant logos, colors
and content remain unchanged. Focused evidence: original static study 37 checks/
27 states; brand asset tests 2 and renderer test 1 across six React/RNWeb contexts;
PWA and scoped native/script types pass. Copy/localization 20 tests, generated
catalog checks (1,776 keys per retained catalog), narrative and recovery pass;
About/RNWeb covers ten controlled states. These fixtures are not live workflows
or independent native-speaker certification. The identity guard's initial failure
on a backend old-brand literal is retained; the subsequent nonpersisted-display
tranche fixes it and the current guard passes. That tranche covers nine backend
display files, four regression cases, ten append-only TSV rows and catalogs now
at 1,786 keys. Existing hero/About text, codes/permissions, cookie/channel IDs,
stored requester labels, defaults/migrations and sender/job semantics are unchanged.

BE-059's independent push-worker prerequisite accepts only exact legacy/new titles
in both workers and displays the validated incoming title: ten executable worker
regressions plus the inherited platform regression pass. Shared sender titles,
Android channel IDs, subscription data and provider settings stay unchanged;
deployed old workers are not assumed updated. New tests are registered in the
existing identity/attention gates. These original focused receipts did not prove
a full gate; current source-bound results are recorded above. Protected receipts are
under `.local/mirtpage-rebrand-s145/{design,foundation}/` and
`.local/mirtpage-s145/{copy,worker-compat}/`, retaining initial failures.

Actual headed Chrome public journeys complete 36 functional checks/36 states and
18 real search readbacks. Owner completes 13 checks/30 states on desktop/phone
web and Expo with ordinary local email-code sign-in and unchanged protected
catalog/draft/location fingerprints. Admin, transport and support role slices
record six completed checks/19 states across headed prefixes and explicitly
labelled headless suffixes. The actual scoped staff denial is a documented HTTP
200 streaming redirect: the response targets Dashboard, exposes no admin heading,
and the browser lands on the staff's own queue. No guard was changed to pass it.

Raw parents remain failed: public has 13 cancellations (12 matched to observed
abort signals, one native cause unproven); owner has two expected Tracking 401
console notices and individually classified startup aborts. Staff harness
readiness/fixture failures are retained. The original fresh-phone headed Apply actionability
stall cause remains unproven; the later independent fresh headed success and
raw screenshot-helper failure are recorded above, not retroactively rewritten. Current role suffix hashes and
protected rowsets are stable. The later backend locale delta preserves the
captured public/owner wording and is recorded rather than rewriting their hashes.
The consolidated private review is
`.local/mirtpage-rebrand-s145/release-review.html`. All owned browsers/DB sessions
closed; ordinary local runtime restored with saved settings unchanged. The owner
explicitly approved this combined review on 2026-10-18, requiring identical
logo/icon geometry and shades everywhere. Canonical artwork parity and the later
source-bound application/release/browser results are recorded above. Commit,
native build and deployment remain separate.

New separate-app Play/promo JSON drafts and a seven-case pure validator are
registered separately from retained old-app sources. English/Amharic are documented
Play listing languages; Oromo is in-app/promotional, not an invented Console code.
Actual new-app captures/exports/native-language review and upload remain pending.
The owner-selected charcoal feature graphic has canonical en/am/om1024×500 RGB
exports. Private launch teasers now have story1080×1920 and feed1080×1350 PNG/SVG
derivatives plus six silent6-second MP4s. Dimensions, glyph coverage, canonical
artwork/palette, safe areas, exact crop and video streams pass local validation;
no accounts, posts, store upload or human-language certification are implied.
The approved domain alias/DNS/TLS stage and additive Firebase/Play records are
complete; data/canonical/runtime/Auth/mail and native release phases remain
incomplete with their own backup/target/approval gates.
Existing schema63 live/schema72 local and S141–S144 evidence stay separate.
No customer records, credentials or released application changed in these stages;
the exact provider alias/DNS/TLS and app-record changes are recorded above.

S142 (2026-10-18, local focused/functional actual; visual/full/commit/rollout
NOT complete): FE-019/FE-062/BE-018 map to compact staff headers, preserved bounded
navigation, explicit phone Details/Back with retained textarea/read-observer
disabling, removed company UI/queue summary, authenticated retired write actions
and legacy plan-route redirect.16focused cases/types0 plus the one-message CSS
geometry regression pass. Actual review found a stretched short bubble; scoped
grid alignment fixes it without reducing transcript height or changing chat rules.

Installed headed Chrome real local API/PG transport+owner-support/admin tasks
complete12functional checks/19current states. New332first attempt saved only a
private note while its RSC Join UI was pending; that note remains private and the
case was resolved without rewriting messages. Corrected333auto-assign→Join→
public reply→visitor Read, phone draft DOM retention/hidden-unread→Back/read,
private-note isolation/unanswered clock and Details resolution pass.334owner
support repeats these tasks; the final truthful read waited until its footer
was actually above fixed navigation. Existing-case continuation confirms watermark
and staff Read before Details resolution.332–334 are resolved; all exact transcripts
and protected account/catalog data remain intact. Source hashes frozen, no page/
console/APIHTTP/unexpected-write/lifecycle errors, owned Chrome closed.

Strict browser network results remain unclean: a read POST had HTTP200/fetch
fulfillment before a later body cancellation; its exact cause is unproven. Raw
failed receipts and request telemetry remain, not recategorized as clean based
on a hypothesis. `.local/staff-chat-s142/combined-review.json`/review.html map
9check/15state prefix and3check/4state continuation, initial failures, focus/Auth/
synthetic-map controls and current source hashes. Ordinary local runtime is
restored with saved settings unchanged; web/Expo/Mailpit each200. No full gates,
commit, new deployment or Android build.

S143 (2026-10-18, implemented/focused/functional Chrome; NOT clean-network,
visually approved, full-gated, committed or deployed): FE-065/FE-052/FE-049 map
to compact web/native mode rows, removed Info entry/sheets, AboutAudience and
native About selected panels with keyboard/selected semantics, unchanged visible
web introduction/SEO.32focused cases/10rendered contexts, native/script types0,
narrative validation pass. A real native fontScale2 label overflow was corrected
with width/minWidth wrapping, without shrinking text. Actual headed Chrome
web1440×1000/web390×844/Expo390×844 ×en/am/om completes36functional checks and
36screens:50px mode rows/48px targets, About tabs/keyboard/CTAs, independent
search and selection retained on return. Runtime/console/APIHTTP/unexpected
writes/lifecycle errors0; source hashes frozen, synthetic tile interceptions
only, browsers closed. The original strict run remains FAILED on15discovery
GET net::ERR_ABORTED; cleanup sources correlate with route/scope transitions but
per-request provenance was not recorded, so no clean-network result is claimed.
`.local/market-about-s143/verified.json` and review.html map raw failed host/test
attempts, successful functional evidence, exact correction and current limits.
New test-about-audiences and corrected inherited workspace/CSS/VM assertions are
registered; no assertion was relaxed to preserve the removed Info feature.

S141 (2026-10-18, local implemented/focused/actual; visual/full/commit/rollout
NOT complete): BE-058/FE-069/DEP-048/ADR-0028 map to nullable migration72,
tracking recipient/session creation, standalone ShipmentEditor/actions and single
visitor/owner/native Tracking entry. Five isolated tracking suites plus seven
sequential schema-compatibility suites pass; local71→72 native backup, exact DDL,
all-existing-row fingerprints and runtime-only ACLs pass. Staff8, historical7
(superseded by S142 retirement), actual-source conversation1, entry18 and focused
localization19 cases pass. Scoped types0;206specs and1730catalog entries validate.

Actual installed headed Chrome web1440/390/320 and Expo8082 prove9journeys in12
states: staff own Tracking menu creates2plans and Mailpit-accepted initial emails
while verified_at is NULL/no OTP, later direct-link code unlocks both; Cancel
preserves version1, Save produces2; other verified email denied; account logout/
draft coexistence and single visitor/owner/native entry; compact admin Details/
Back and old-route redirect; native real code/list/detail plus Amharic/Oromo and
320px editor. Original no-submission SSR-typing and early native-count failures
are retained and classified as driver readiness; continuation does not recreate
shipments. Account/catalog fingerprints and relevant source hashes unchanged,
page errors/unexpected writes/lifecycle0, synthetic tiles only, owned Chrome
closed. `.local/tracking-s141/actual-verified.json` maps successful prefixes,
continuation, raw failures and exact limits. This is local Mailpit acceptance,
not provider inbox delivery or installed Android/push proof.

S144 (2026-10-18, authorized one-time data cleanup COMPLETE; no code release):
BE-018/BE-057/DEP-047. Independent live Netlify account/site/domain and Supabase
project inventory finds schema63, no support_transport_plans table and zero
transport_handoff/transport_plan_updated/transport_plan_link_replaced events:
verified no-op, no hosted data/configuration write. Local schema72 has4old plans
and9allowlisted events. A0600exact typed archive with SHA256/target-bound digest
passed isolated restore→delete→restore, checks/outbound FKs and duplicate denial;
its schema was rolled back/absent. Reviewed one-time exact-ID/hash cleanup took
bounded deterministic NOWAIT locks and the support-work advisory lock, preserved
70other-table/protected-event fingerprints in-transaction and after commit,
changed no sequences and resumed only the owned worker. Receipts and independently
pinned targets are protected in `.local/legacy-transport-s144/`; restore is separate
and never automatic. Accounts, messages, chats, assignments and independent
Tracking remain untouched. Earlier S137/S138 unchanged-history evidence describes
those historical operations; it is superseded only for these explicitly deleted
obsolete rows. UI retirement/full/visual gates remain separate.

S139/S140 (2026-10-17, local implemented/focused/actual; visual/full/commit/
rollout NOT complete): FE-021/FE-058/DEP-026 and ADR-0016 map to the shared
`lib/map/map-tile-loader.ts`, browser web/Expo map adapters, root metadata/CSP,
shared `map-clustering.ts`/`mapExposedGroup`, web/native current-group guards,
active localized failure status and synthetic-only map automation.

Before/after installed headed Chrome proves Tracking→Market inherited no-referrer
is restored to the public origin while Tracking stays private. No OSM request
was made by that probe. Loader15 and real-adapter2 regressions cover403PNG,
cache/referrer policy, decode/network/timeout, rapid pending zoom beyond10s,
same-camera Retry and late teardown. Shared20+UI17+installed Leaflet2 cover
terminal previews without forced18 zoom and rejection of hidden/stale group keys.
Fixture guard5, provider contract, root/native types,206specs and1725catalog
messages pass. Exact focused receipts are under `.local/map-tiles-s139/` and
`.local/map-groups-s140/focused/verified.json`; stale source assertions, transient
in-flight type errors and the missing Expo fixture environment port are retained
and classified, not suppressed by weaker acceptance criteria.

Actual installed Google Chrome155 headed on real local app/API: main33checks/
48states in11desktop/phone/Expo contexts plus phone-web return2checks/3states.
English/Amharic/Afaan Oromo200→403PNG→Retry, working markers, no failed-pan
request loop, all-fit exact-public-member previews and unchanged terminal camera
pass. Real showroom→Back remains ready beyond11seconds on desktop, phone web
and Expo. Main45console errors are exactly injected403responses; page/API errors,
unexpected writes/lifecycle errors and escaped public tile requests are zero.
Source hashes stay unchanged. Review `.local/map-tiles-s139/review.html`, main
`actual/outcome.json` and `actual-phone-return/outcome.json` for exact scope.

All automated basemaps are synthetic fixtures, not real OSM availability proof.
The owner separately confirms ordinary-browser Retry and preview return now
work; no address/provider change was needed. This is human availability feedback,
not an OSM unblock acknowledgement or a guarantee for every network. The specific
original screenshot enforcement cause remains unproven. The later delayed-hide report led
to replacing image-only TileLayer cancellation with public async GridLayer;
current zoom/return regressions pass. Existing ordinary user Chrome was inspected
read-only without retries, navigation or new tile requests. No provider identity,
host, paid service, native SDK, credentials, canonical data or database change.
No physical Android/MapLibre/human language or live provider claim. Earlier S138
and S129–S137/workspace/chat visual gates remain pending; servers stay ordinary.

S138 (2026-10-17, implemented/focused/actual local evidence; NOT visually
approved, committed or deployed): BE-058/FE-069/DEP-048 and ADR-0028 provide
tracking-only verified recipients, independent multiple shipments, dedicated staff
workspace, durable initial email and separate native/web sessions. Additive71
backup/apply/readback preserves every prior public table; old plans remain private
without inferred recipients or anonymous/participant publication.

Mapped code: lib/tracking-contract.ts, tracking.ts, tracking-http.ts and runtime,
tracking-email.ts/delivery/after; additive71; app/api/tracking and mobile adapter;
app/dashboard/tracking plus Shipment components/navigation; TrackingPortal and
public tracking pages; native tracking/client/links/buying; private legacy view.
Test mappings are in the controlling specs. Eleven sequential isolated PostgreSQL
suites plus current cooldown, immutable-email, expired-lease and24-row pagination
supplements pass with public71 unchanged. Staff8/inherited7, portal6, native25,
entry11, HTTP9, locale18 and provider/worker7 focused cases pass; types0,206specs
and1724catalog entries validate. Counts describe separate test evidence, not a
claim that expensive full gates have run.

Actual installed Chrome HEADLESS web1440/390/320 and Expo8082 prove real
Mailpit email/code, empty/two shipments, staff Submit/Edit/Cancel/Copy, recipient
live update, owner-session/draft coexistence/logout, direct-link/other-recipient
denial, support-only denial and manager scoped revocation; all prior account/
business/catalog/chat/legacy-plan fingerprints stay unchanged. Protected review
`.local/tracking-s138/review.html` and integrated verified.json retain13 journey
checks, raw/settled screenshots, original failures, exact source deltas and limits.
The initial capture remains failed only at its wrong /tracking reload expectation;
successful prefix and corrected direct-locator continuation are explicitly mapped.
One pre-transition editor screenshot is superseded by four settled editor states.
Expected401s and navigation/focus request aborts are retained; there is no clean-
network, physical Android, provider-delivery or native human language-review claim.
AGENTS step8 visual approval and full/check/acceptance/release/commit/rollout remain
open. Saved runtime settings are restored after local tests. Earlier reviews stay.

S137 (BE-057/FE-068/DEP-047) historical local evidence remains in `.local/transport-plan-s137/`: protected
69→70 backup/apply/ACL readback, eight isolated suites, staff/HTTP/native/participant
and actual paired Chrome proof. S138 supersedes only its anonymous chat-bound
publication. No legacy plan/chat row was deleted or auto-imported, and the owner-
authored case327 remains unchanged. Neither historical feature is deployed here.

S129–S136 (2026-10-17, local candidate; NOT deployed/approved): FE-041/053
card Add/options/excerpts and optional category chips/affiliation; FE-065/021
richer bounded mobile previews; BE-044 additive canonical category/city DTO;
FE-049/052 en/am/om activation and meaning-first narrative/transport invitation;
FE-063 quiet anonymous listing safety. Source changes are in the active checklist
S129–S134, with explicit Ready recorded before each edit. Per-business selection,
stock, tenant authority, map capacity and chat lifecycle remain controlled by the
linked specs. No new schema, dependency, provider or editing permission.

Focused evidence: `.local/product-cards-s129/native/receipt.json` (S129 initial30),
`.local/product-cards-s129/web/verified.json` (web2),
`.local/showroom-categories-s131/verified.json` (3 canonical projection cases,
2 actual-source web workflows,1 rendered12-state case),
`.local/discovery-previews-s130/native/receipt.json` (62 current/historical native
and inherited cases,7 rendered layout states),
`.local/listing-options-s134/native/receipt.json` (5 source safety cases),
`.local/language-s132/verified.json` (active-boundary5 including proven SSR-readiness
regression, localization18 at1617keys,
email10, narrative/launch and strict types). These are controlled-port/component
checks, not app/API/device proof. Earlier failed browser/fixture/type runs remain
preserved and classified. Root's current pure integration22 cases and native
typecheck pass; global web typecheck initially identified test-only never-array
narrowing, corrected without weakening assertions; final global web check passes.
The focused web landing/floating handoff9cases and latest return/language7cases
also pass. `.local/ui-integration-s129-s134/cards-verified.json` binds3complete
English real API/storage journeys plus24post-readiness-fix active-language card
views; full error/raw failed receipts and source-delta limits are retained.
Actual Chrome also proved Expo details→Back dropped category/query; FE-041 Ready
precedes its bounded32-business/2h public-memory correction. Its35focused cases
and current mobile/strict types pass; the2affected390/320actual return journeys
now pass. No private preview/catalog/account data enters that cache. New pure
`test-showroom-return-state.ts` is registered. Final local safety/copy/intake
proof is under `.local/ui-integration-s129-s134/native-additions/`: S134 two real
web/Expo preference/report-Cancel journeys10screens, S132/S13323checks41screens
plus the preserved completed English prefix, and real loaded OSM desktop tiles.
Oromo country-name fallback follows installed Chrome's unsupported locale data,
explicitly distinguished from authored interface translation. No report/chat or
merchant data was submitted. Inherited real PostgreSQL report security passes
at unchanged protected local schema69.

The actual private-owner journey uses ordinary local OTP/Mailpit, never Auth admin
or a fake signed-in state. Its corrected320/390grid supplement proves full-width
248px cards versus two153px columns with a12px gap. QA business/products/category/
draft/publication fingerprints stay unchanged. Original visible early-close and
one5s readiness failure remain failed with historical causes unproven; the bounded
status-only retry passes. S135 now requires lifecycle events and fails unexpected
closure/crash/deadline; final isolated headless cleanup is explicit. It does not
claim the original headed-browser cause fixed.

S129 measured-grid proof: `.local/product-cards-s129/measured-grid/receipt.json`
(36focused plus six actual RNWeb geometries, native/script types0), current private
`.local/product-cards-s129/owner-grid-retry-2026-10-18T01-10-31.265Z/grid-verified.json`
and explicit response-only `variant-fixture/outcome.json` (two journeys4screens;
no catalog write). S134 footer entry had two real layout defects: phone bottom
obstruction and681–720px breakpoint gap. Ready preceded each correction;
`.local/listing-options-s134/footer-clearance/corrected-verified.json` proves ten
single/stacked dock states, true max scroll, five hit points and zero overlap.

S136 FE-065/021/053 retains geographical intent across size-only Leaflet changes
without private SDK fields or tile resets. Original actual0.936px and repeated
installed-SDK drift remain preserved. `.local/map-camera-s136/verified.json`
records7SDK/2actual-source adapter cases, separate raw SDK/persistence tests,
strict web/native types0 and peer review. Current real API proof at
`.local/ui-integration-s129-s134/native-additions/s136-current-proof.json` binds
three ordinary full-showroom returns each on web1440/Expo390, original0.5px limit,
independent raw SDK center, unchanged target/group/zoom and genuine pointer pan.
Native pan's1ULP longitude representation is reconciled against the exact existing
canonicalization function in a separate read-only sidecar; the failed harness
receipt is unchanged and no tolerance was widened.

Both final global typechecks and199spec/ADR validation pass. The combined review
`.local/ui-integration-s129-s134/review.html` and `verified.json` retain source-delta
limits and prior workspace/chat/map reviews. Actual Chrome here is installed
headless, with explicit analytics/media controls; it does not establish provider
video playback, installed Android/MapLibre, OS handoffs, TalkBack, push delivery or
independent first-language endorsement. Full/acceptance/release/commit/rollout
remain gated by explicit visual approval under AGENTS step8. No current commit,
push, cloud/config/data mutation, new build or store artwork publication.

S99.4 / FE-063 / BE-051 / DEP-044 (2026-10-10): owner-approved catalog prohibition
is published in five-language Terms and staff report guidance.
Typecheck, localization, real Prohibited goods / Abusive content report
claim/removal-before-resolution regressions, 15 desktop/phone Terms states and
all 11 browser acceptance workflows pass. Protected evidence is under
.local/play-s99/catalog-policy/. A bounded live text review covers 264 offerings
over 53 pages with zero keyword candidates; media absence is not claimed and no
customer content is mutated. Full repository check and clean isolated web release
pass, including the provider-backed HTTP smoke and zero-vulnerability web audit.
Actual packaged handler/Sharp/worker/privacy checks pass. Source de68832 / Netlify
6aca91cb2f49de22d3839199, five live Terms states and 12 read-only compatibility
checks pass, without DB/config/Android-build or customer writes. Google saves and
reloads 25 answers and IARC Completed (Teen/12+, PEGI parental guidance). Its
certificate ID is unassigned; Send app for review remains disabled pending track
steps. Dashboard unlocks closed setup but still reports zero closed opt-ins.
Protected-phone, reviewed closed/public rollout and genuine 12/14 test
remain. No other app/list, invitation, fake enrollment or automatic screening.

S99.5 / DEP-044 (2026-10-10): fresh exact app/account/track and protected API/UI
before-state pass; the existing version-3 AAB file hash matches admission. Normal
Alpha controls save all 178 offered rows (177 named countries/regions plus Rest
of World), and reload verifies every exact row is Targeted. Publishing overview
records Alpha-only availability unsynced from production. One existing version-3
draft with English/Amharic notes passes Save as draft and reload: Inactive/Draft,
3 of 4 track steps. Preview has only the known nonblocking deobfuscation warning.
Internal remains Active/Available, only the ten-member SuqPage list selected;
production access stays locked. Before-read cleanup is confirmed by Google's
read-only deleted-edit response after a reproduced local null formatter error.
Automatic approval review blocks a fresh final API edit/read twice before execution;
exact owner direction is requested, with no workaround. That final independent
comparison remains pending. Protected .local/play-s99/closed-preparation/ and
console-setup/s995-*.json; no app code/build, signer, credential, invitation,
enrollment, review submission or closed-test clock change. DEP-044 remains draft.

S99.6–S99.8 / FE-052 / FE-049 / DEP-044 (2026-10-11): shared Market/About/account
copy leads with organized business collections on web and Expo, with independently
authored Amharic, Afaan Oromo, Somali and Tigrinya catalogs. Narrative/launch-material,
homepage, ten localization tests (1,401 messages), both typechecks, mobile contracts
and 190-spec validation pass. Sixty-nine actual local browser states verify copy,
metadata, action destinations, layout and no page errors. Metro watches shared lib
without private runtime directories; regression coverage passes. Protected evidence:
.local/play-s99/narrative/. No merchant/data/map behavior change or new phone proof.

Normal SuqPage-only Console controls save revised English/Amharic descriptions,
six/five phone screenshots and two banners; original icon/video stay unchanged.
Independent reload proves exact descriptions and image names. All thirteen new
Google CDN thumbnails match after resize/transcode, not byte identity. Accurate
AI-composition labels are recorded. Alt descriptions are authored but no supported
provider field was exposed. Authentic native-source hashes/crops, dimensions,
opacity, caption occupancy and inspected phone layouts are retained under
.local/play-s99/store-presentation/collection-v2/. Final Publishing overview read
verifies SuqPage, disabled review and no review action; approval is not claimed.

The five-language organic campaign contains twenty posters, five portrait videos,
profile icon, bios/captions and ordered posting instructions. Five social plus two
Google preview H.264 videos pass metadata and full decode; a curated 54-file ZIP
passes CRC, without private data. Source: docs/marketing/, docs/play-store/
presentation.json and scripts/test-launch-materials.mjs. Evidence:
.local/play-s99/launch-kit-v3/. Official social accounts/YouTube URL do not exist;
nothing is posted. App visual approval, full gates, scoped commit and fresh web/
Android delivery remain pending. Preserve S99.5 API direction, protected-phone,
reviewed closed/public rollout and genuine 12/14 gates. Specs are not marked done.

S99.9 / FE-052 / FE-049 (2026-10-11): owner rejects the abstract collection/post
slogan. Primary NN/g homepage, Apple app-writing and Intuit content guidance
inform explicit business/product context, sufficient familiar words, a useful
supporting paragraph and descriptive actions. Shared Market and separate About
headings are corrected; four catalogs are written contextually. Narrative/launch-
material and homepage checks, ten localization tests (1,406 messages), both client
typechecks and 69 actual local browser states pass. English/Amharic phone states
are visually inspected. Evidence: .local/play-s99/copy-clarity-s999/screens/
copy-verification-all.json; tile requests are test-stubbed, no provider/data writes.
This is layout/contract evidence, not native-phone or customer-comprehension proof.
Explicit app-copy visual approval/full gates/commit/rollout remain pending. The
previous saved Play/social materials are preserved and must be aligned after
acceptance; their earlier verification does not establish current-copy approval.

| Capability | FE | BE | DEP | Primary code | Automated evidence | Status |
|---|---|---|---|---|---|---|
| Restricted reusable store-review access | FE-064, FE-053 | BE-052, BE-044 | DEP-044 | lib/reviewer-access.ts, reviewer-access-runtime/http, web/native mode/login adapters | 2026-10-09: test:reviewer-access passes pure authority-race/revocation plus real local PostgreSQL/Supabase password/JWT/owner/cross-tenant/staff/body/origin/rate/no-store checks; actual web cookies/native-browser, ordinary OTP and 25 five-language captures pass (.local/play-s99/reviewer-ui/). Ordinary reviewer page/product edits, publish and public catalog readback also pass. Full check, clean web release, 11 acceptance tests, operations and mobile contracts pass; source ea1b452, production schema 63/deploy 6ac98a227b9a61a7dad27116, exact hosted provisioning/binding and real web/native API sessions pass (docs/GOOGLE-PLAY-RELEASE.md); version-3 AAB/internal draft and official Google native public test splits now verified; saved restricted Console fields now pass fresh provider reload and credential/443-character-note comparison; authenticated protected-phone workflows remain. | in_progress |
| Verified owner account erasure | FE-055 | BE-053 | DEP-044 | scripts/operations/account-erasure.ts; docs/ACCOUNT-DELETION-OPERATIONS.md; privacy notice | 2026-10-09: test:account-erasure passes isolated PostgreSQL binding/staff/shared/drift/backup/approval/FK rollback and real local Supabase identity/session/media/orphan removal, preserving shared upload and other tenant. No customer deletion. Full check, clean web release, 11 acceptance tests and operations pass; five-language final privacy captures pass. Source ea1b452 and hosted privacy/deletion copy in deploy 6ac98a227b9a61a7dad27116 pass; full-account deletion URL is verified in saved Data safety, with no separate partial-data-deletion claim; real per-request erasure remains separate. | in_progress |
| Listing reports and business blocking | FE-063, FE-053 | BE-051, BE-044 | DEP-044 | Local pure catalog-safety/listing-report contracts, private PostgreSQL port/migration 63, scoped web Reports queue, web/native report/block preferences and discovery/fuzzy/cache exclusions | 2026-10-09: test:catalog-safety proves real PostgreSQL and web/native HTTP replay/rate/target/current-role/assignment/stale/removal/private grants and map/count/page/fuzzy/sponsor/Featured exclusions; discovery/mobile/staff suites, both typechecks and localization/native rendering/build/link contracts pass. Actual local report/block/reload/unblock/direct-inquiry and admin removal/support resolution plus five-language 390/320 captures pass (.local/play-s99/safety-ui/). Backup/actual restore, private schema 63 and original hosted table fingerprints verified after one exact owner-approved retry. Owner delegates design acceptance; full check, clean web release, 11 acceptance tests, operations and mobile contracts pass; source ea1b452 and hosted web/API deploy 6ac98a227b9a61a7dad27116 with 21 live checks pass; version-3 AAB/internal draft, actual Google signer and native public test splits verified; protected-phone moderation/authenticated workflows remain. | in_progress |
| Google Play testing and store rollout (S99) | FE-055, FE-063, FE-064 | BE-051, BE-052, BE-053 | DEP-044, DEP-042, DEP-043 | Production AAB/internal-draft profiles; docs/GOOGLE-PLAY-RELEASE.md; docs/GOOGLE-PLAY-CONNECTION.md; docs/play-store/ | 2026-10-09: Google selected developer/package/app-only Admin, Expo project/existing signer and exact EAS Submit credential verified. Local safety/reviewer/erasure, full check, clean web release, 11 browser acceptance workflows and mobile contracts pass. Protected actual production backup restores and rehearses schema 62→63 with all old-table fingerprints/private grants preserved. Fresh audit has 20 high findings from two unpatched tooling roots absent from 1651 Android runtime modules. Hosted schema 63/web/reviewer rollout is verified (ea1b452 / 6ac98a227b9a61a7dad27116). Google reads saved SuqPage/en-US, English/Amharic text, selected support contact and seven verified images while all tracks/binary lists stay empty; fresh AAB admission, existing-key Play enrollment/upload/device checks and real 12-testers/14-day closed test remain pending. 2026-10-10: official Google PEPK exits 0; protected existing-key ZIP integrity, pinned certificate, private input and unchanged recoverable keystore pass (.local/play-s99/signing/export-verified.json). Owner Console upload is followed by independent actual Google APK certificate proof. One exact owner-approved free AAB (641cb96a) from ea1b452 is FINISHED; API 36, signature/privacy and bundle/50-ELF 16-KB checks pass. EAS submission 1c29e427 is FINISHED; Google independently confirms exact version-3 hash/internal draft, unchanged metadata and other tracks empty. Its protected universal APK signature/version/update/alignment pass; official Google test splits pass isolated native update/data retention, 12 public states/five languages, HTTPS links and no native errors (.local/play-s99/play-upload-verification/, native-public-verified.json, android-device/). Production protection unchanged; test emulator closed. Exact tooling exception consumed, audit still fails; Console setup now verifies 10/11 after saved reviewer, ads/government/financial/health/category/teen-adult audience and 15-type Data safety readbacks (.local/play-s99/console-setup/). IARC terms restrict automation; rating remains owner-operated. A separate six-address SuqPage list is saved/individually verified and selected only on internal. One existing version-3 rollout shows Active/Available; independent API confirms completed internal, exact AAB hash, unchanged listing/contact/other tracks and deleted owned read edits. Actual join link verified; no other app/list, signer, protection or artifact change. No invitation, enrollment or phone proof. The owner later supplies four addresses; protected six-member backup and fresh Google edit-dialog comparison prove all ten saved members. Alpha selects only that list and approved feedback email; reload verifies settings with release/countries empty and inactive. Under later explicit delegation, an incomplete IARC draft is saved and reloaded: eight feature answers pass, dedicated chat moderation absent. Automatic review rejects unsupported online-violence No before execution; no bypass, that question remains blank, Next disabled and actual catalog-policy clarification pending. Final Dashboard 10/11, zero closed opt-ins (.local/play-s99/console-setup/ten-testers-final-verified.json). Final rating/countries, protected-phone/closed/public gates and real 12/14 test remain. | draft |
| Simple transport intake and admin referral queue (S32) | FE-019 | BE-018 | DEP-015 | PublicSupportChat, support service/actions, admin support pages, PostgreSQL migration 51 | Support/replay/transport security suites, typecheck, 160-spec validation, six localization checks; real public intake and admin save/copy flows at 1440/390/320. Local migration applied; review captures in .local/transport-support-review/. Visual/full gates, commit and rollout pending. | in_progress |
| Canonical city/town selection | FE-045 | BE-038 | DEP-035 | Existing place data and owner location proposal boundary | 2026-09-17: 781-place lookup, canonical save/privacy and migration tests, owner/admin wiring, keyboard/browser save/reload and six accessibility scans pass locally; visual/full-release gates pending. See docs/SUQPAGE-SERVICES-AND-PLACES-REVIEW.md  S20 full gates and monitored deployment 6ab0d349f099639821fa0f9a verified; current evidence: docs/SUQPAGE-RELEASE-2026-09-21.md. | done |
| Inclusive business discovery and service offerings | FE-044 | BE-037 | DEP-034 | Existing offering/catalog/inquiry ports with additive service kind | 2026-09-17: service migration/upkeep/inquiry compatibility, typecheck and actual owner service creation, product/service/mixed and search/browser flows pass locally; 28 screenshots, visual/full-release gates pending. See docs/SUQPAGE-SERVICES-AND-PLACES-REVIEW.md  S20 full gates and monitored deployment 6ab0d349f099639821fa0f9a verified; current evidence: docs/SUQPAGE-RELEASE-2026-09-21.md. | done |
| Runtime email entry without cached redirect loops | FE-038 | BE-031, BE-036 | DEP-033 | Request-time entry pages and compatible Auth proxy | 2026-09-16: dynamic entry manifest, runtime-only local Auth and eight browser scenarios pass; proxy precedence, full check, release and secret-free package checks pass. Source d47f1c1 published as 6aab00e841e9a4687217be7d (ready); live anonymous/invalid-cookie entry uses private/no-store responses without loops. See docs/SUQPAGE-AUTH-ENTRY-FIX-2026-09-16.md | done |
| Canonical Suqpage naming and persisted-state compatibility | FE-038 | BE-036 | DEP-032 | Environment/state adapters, canonical source/assets/docs, additive migrations 44–45 | 2026-09-14: namespace/config/cookie/cart/asset and custom-plan preservation regressions, final typecheck, eight browser scenarios, clean release, operations and backup rehearsal pass. Core final invitation timeout passed unchanged on focused retry and release. Local schema 45; 929 packaged runtime/asset files match, no production credentials/private paths. Hosted schema 45, 55 table projections preserved except 66 standard labels. Source 51109d8 + CDN correction ce2015b, deployment 6aa80f72843cbebe952f97df: all 17 legacy asset byte comparisons and desktop/phone product/contact/inquiry/login/access checks pass. See docs/SUQPAGE-NAMING-ROLLOUT-2026-09-14.md. | done |
| PostgreSQL-only persistence and tooling | — | BE-035 | DEP-031 | Native schema 43, PostgreSQL-only runtime ports, isolated PostgreSQL fixtures, archive tools and current browser bootstrap | 2026-09-14: full core/release, operations, disposable PostgreSQL, seven production-browser scenarios and 72 accessibility states pass. Container passes; approved actual production backup restore preserves all 50 original table fingerprints through schema 38→43. Email-only production `6aa7fe5a106ca381ba08bba3` (source `41e2fed`) and schema 43 verified; see docs/SUQPAGE-DEPLOYMENT-2026-09-14.md. | done |
| Launch seller and operations wiring | FE-043 | BE-034 | DEP-030 | Product options/visibility commands, owner identity/location proposal, admin exact-version geographic approval, private identity media and runtime media manifest | 2026-09-14: approved and published source 41e2fed / Netlify 6aa7fe5a106ca381ba08bba3, schema 43. Mapped focused regressions, full core/release, 7 isolated browser scenarios, 72 accessibility states, PostgreSQL, operations and container gates pass. Live 1440/390 product/contact/category/map and access-denial checks pass. Demo contacts verified across 64 live pages and 47 exact seed accounts; account emails preserved. Hosted email delivery/authenticated production smoke remain under DEP-030; see docs/SUQPAGE-DEPLOYMENT-2026-09-14.md. | in_progress |
| Single business profile and optional staff assistance | FE-040 | BE-032 | DEP-030 | BusinessProfile, SuqpageBrand, owner editor, draft/consent and publication ports, scoped cover routes, public discovery cache, migrations 39-40; ADR-0018 | 2026-09-14: approved and published source 41e2fed / Netlify 6aa7fe5a106ca381ba08bba3, schema 43. Mapped focused regressions, full core/release, 7 isolated browser scenarios, 72 accessibility states, PostgreSQL, operations and container gates pass. Live 1440/390 product/contact/category/map and access-denial checks pass. Demo contacts verified across 64 live pages and 47 exact seed accounts; account emails preserved. Hosted email delivery/authenticated production smoke remain under DEP-030; see docs/SUQPAGE-DEPLOYMENT-2026-09-14.md. | in_progress |
| Public business and private account contacts | FE-040, FE-038 | BE-032, BE-031 | DEP-030 | Migration 41, public contact fallback, public catalog projection, account contact port/action/form, private signup phone | 2026-09-14: approved and published source 41e2fed / Netlify 6aa7fe5a106ca381ba08bba3, schema 43. Mapped focused regressions, full core/release, 7 isolated browser scenarios, 72 accessibility states, PostgreSQL, operations and container gates pass. Live 1440/390 product/contact/category/map and access-denial checks pass. Demo contacts verified across 64 live pages and 47 exact seed accounts; account emails preserved. Hosted email delivery/authenticated production smoke remain under DEP-030; see docs/SUQPAGE-DEPLOYMENT-2026-09-14.md. | in_progress |
| Category results and standard page workspaces | FE-042 | BE-033 | DEP-030 | SQL result pagination, page-review lifecycle, standard dashboards, retired custom routes, draft product media | 2026-09-14: approved and published source 41e2fed / Netlify 6aa7fe5a106ca381ba08bba3, schema 43. Mapped focused regressions, full core/release, 7 isolated browser scenarios, 72 accessibility states, PostgreSQL, operations and container gates pass. Live 1440/390 product/contact/category/map and access-denial checks pass. Demo contacts verified across 64 live pages and 47 exact seed accounts; account emails preserved. Hosted email delivery/authenticated production smoke remain under DEP-030; see docs/SUQPAGE-DEPLOYMENT-2026-09-14.md. | in_progress |
| Linked products and simple inquiry/search journeys | FE-041, FE-040, FE-030 | BE-001 | DEP-030 | ProductPage, product-inquiry domain helpers, ShowroomApp composer, DiscoveryWorkspace split map/search, product metadata | 2026-09-14: approved and published source 41e2fed / Netlify 6aa7fe5a106ca381ba08bba3, schema 43. Mapped focused regressions, full core/release, 7 isolated browser scenarios, 72 accessibility states, PostgreSQL, operations and container gates pass. Live 1440/390 product/contact/category/map and access-denial checks pass. Demo contacts verified across 64 live pages and 47 exact seed accounts; account emails preserved. Hosted email delivery/authenticated production smoke remain under DEP-030; see docs/SUQPAGE-DEPLOYMENT-2026-09-14.md. | in_progress |
| Guarded production Auth configuration | - | - | DEP-029 | `scripts/production-auth-config.ts`, mandatory hosted-configuration rules in `AGENTS.md`, and the recovery runbook | On 2026-09-14 all 37 guard regressions pass, including current Suqpage subjects and retired-subject denial. On 2026-09-13 all 35 earlier guard regressions, `npm run check`, `npm run test:operations`, and `npm run release` passed. The guard uses fake provider transport; the release HTTP/security smoke uses isolated local Supabase. No hosted mutation or cutover verification is claimed. | done |
| Plain-language Suqpage pages and private production-category setup | FE-039 | BE-031 | DEP-028 | Market/About/auth/setup copy, Suqpage page actions, Google display-name hint, additive private onboarding category, and separate page-project creation | On 2026-09-12 `npm run check`, `npm run release`, and 10/10 ordered browser workflows prove provider-name prefill, private category persistence without public classification, focused setup, separate page-project creation, and responsive current language. | done |
| Suqpage identity and passwordless onboarding | FE-038 | BE-031 | DEP-028 | Shared Suqpage assets/tokens, six-digit email-OTP and gated Google entry adapters, authenticated tenant bootstrap, local Mailpit template, and provider-aware account UI | Approved desktop/390px/320px evidence, `npm run check`, `npm run release`, and 10/10 ordered browser workflows pass on 2026-09-12, including a real isolated Supabase email-code exchange and authenticated onboarding. Hosted Supabase advertises Google and resolves to its exact callback; exact deployed Google consent/code exchange and production delivery smoke remain under DEP-028. | in_progress |
| Local Supabase development runtime | — | BE-024, BE-027, BE-030 | DEP-027 | Loopback-only Supabase CLI runtime with PostgreSQL 17, local Auth/private Storage, guarded setup, and SQLite restricted to compatibility and migration evidence | Static isolation plus provider-backed copy, migration, Auth, private Storage, health, workspace, project-history, revision-preview, and isolated browser-runtime evidence pass. Realtime remains disabled until its optional adapter exists; hosted rollout is separate. | in_progress |
| Supabase identity bridge and managed sessions | — | BE-030 | DEP-026 | Selectable identity adapter, immutable provider-to-Suqpage identity links, operator-only bcrypt migration, managed password/Google sessions, and unchanged application-owned role and tenant authorization | On 2026-08-24 hosted migrations 33-37 and the approved identity migration linked all 47 retained users with zero conflicts; production PostgreSQL/Auth/Storage preflight passed. The ignored seed-credential file is stale against the sampled production hash, so hosted password login after deliberate rotation plus reset/logout, unlinked/suspended/cross-tenant denial, and Google evidence remain pending. | in_progress |
| Netlify and bounded Supabase capabilities | FE-019, FE-021 | BE-018, BE-023, BE-024, BE-027, BE-030 | DEP-026 | Netlify/OpenNext candidate, existing private Storage port, visibility-scoped Realtime support adapter with polling fallback, and future indexed PostGIS viewport queries | Static Netlify configuration, the complete 112-spec repository check, provider-backed production build/API smoke, scale and security gates, zero-vulnerability production audit, and all 10 remote provider-backed browser workflows pass on 2026-08-24 (`32686559246`, browser job `97312645834`). Netlify browser authorization timed out; site connection, scoped remote provider configuration, generated-domain smoke, and DNS monitoring remain pending. | in_progress |
| Current marketplace and Daily Featured language | FE-037 | BE-017, BE-029 | DEP-023, DEP-025 | Current public routes, query/referral contracts, active component hooks, Daily Featured program modules, Marketplace admin, exact retired-route 404 proxy, removed legacy pages, and the server-only historical analytics adapter | On 2026-08-13 focused type, narrative, homepage, discovery, schedule, account-health, scalable-query, PWA, and spec tests pass; 10/10 acceptance workflows and the complete release gate pass. On 2026-08-14, production deployment `dpl_EPpUwucKvJE18WCckB7RqMq3EFVT` reconfirmed `/bazaar` and `/expo` hard-fail with 404 while current public routes return 200. Historical SQL and immutable storage identifiers remain intentionally inert pending a separately approved backup-backed migration. | done |
| Routed public marketplace application | FE-036 | BE-023 | DEP-025 | Market at `/`; route-owned Daily Featured and Sponsors; distinct Market and Featured client entries; About and canonical `/@handle` showrooms inside the shared shell; adaptive desktop rail; immersive one-nav phone showroom presentation; bounded PWA public routes; unchanged authenticated workspace authority | Focused source, PWA, type, single-main-landmark, no-overflow, and desktop/390px/320px Chromium showroom-shell checks pass on 2026-08-27. The map/Featured workspace is route-unmounted and phone showrooms render no duplicate platform bottom navigation. Fresh release and production evidence waits for visual approval. | in_progress |
| Cross-role accessibility and interface clarity | FE-035 | — | DEP-002 | Shared public, showroom, administrator, operations, and client interfaces; semantic landmark and heading corrections; responsive table containment; accessible color roles; state-aware dialogs and drawers; `scripts/test-accessibility-audit.mjs`; `tests/acceptance/app.spec.ts` | 2026-09-14: all 72 current public/owner/admin states at 1440/390/320 pass, plus focused editor keyboard checks; seven production browser scenarios pass. Current evidence: docs/SUQPAGE-DEPLOYMENT-2026-09-14.md. Historical 2026-08-11: 88 desktop/390px cross-role accessibility states and 10/10 ordered browser workflows pass, including interactive public discovery, hosted-showroom, admin, manager, team-member, and client states. Structured evidence: `/tmp/suqpage-accessibility-audit.json`; reviewed captures: `/tmp/suqpage-audit-discovery-final`, `/tmp/suqpage-audit-workspaces-final-2`, `/tmp/suqpage-audit-focused-final-3`. | done |
| Installable PWA and mobile application shell | FE-034 | — | DEP-025 | Standards-based manifest and icon set, cache-bounded first-party worker, branded offline route, shared public phone tabs across public and onboarding routes, role-derived workspace phone tabs and More sheet, safe-area mobile shell, and reviewed cleanup-worker rollback artifact | On 2026-08-15, the worker contract passes with cache version v2 and `/featured` in the bounded network-first public allowlist while API, dashboard, preview, login, request, and mutation exclusions remain unchanged. Fresh production worker-control and offline-route evidence is required after visual approval and deployment. | in_progress |
| Mobile brand visibility (S30) | FE-038, FE-034, FE-032, FE-051 | — | DEP-025 | Public/account/workspace headers and shop return row; shared fixed-type wordmark | 90 responsive checks, phone result scroll/collapse, full check/release, nine provider acceptance workflows, operations, protected restore and Netlify artifact/native checks pass. Owner-approved source 87aaced deployed as 6ab3dc37aea724cbcfbcb994; 90 live responsive checks, phone results and 15 public checks pass. See docs/SUQPAGE-S30-RELEASE-2026-09-23.md. | done |
| Horizontal logo proportions (S31) | FE-038, FE-051 | — | DEP-025 | Shared brand sizing variables, 4px gap, corrected wordmark inheritance and intrinsic image ratio | 90 local responsive geometry/navigation checks across five locales, including <=1px rendered optical centering, typecheck, specs and PWA shell contract pass. Before/after review in .local/brand-spacing-review/. Visual approval and release pending. | in_progress |
| Automatic and adjustable Daily Featured scheduling | FE-033 | BE-029 | DEP-024 | S36 single 8:30 PM–midnight EAT agenda; six-business rotating automatic selection; four sponsor mentions; per-date manual selection/order/revert; immediate public cache version and invalidation; fixed official schedule replaces historical policy editing | Local typecheck, schedule/clock, discovery, localization and homepage composition pass. Real admin save/reorder/revert verified against warm public cache; seven public locale/viewport and three admin viewport states pass. Evidence `.local/evening-featured-review/verified.json`; staff guide `docs/operations/FEATURED-SCHEDULE.md`. Owner visual approval, full/release gates, commit and rollout pending. | in_progress |
| Unified business directory and task-oriented workspace | FE-032 | BE-003, BE-015, BE-017, BE-023 | DEP-023 | One Businesses directory; business-scoped Overview with visit aggregates, Details with owner recovery, one state-aware Showroom project, paginated Showroom history, direct editing or optional AI redesign, Offerings, Marketplace, Inquiries, and Renewal; legacy collection redirects; unchanged tenant and persistence boundaries | 2026-08-10 focused request, revision, type, spec, and desktop/390px browser evidence passes. Browser evidence proves update intake omits setup-only questions and direct editing plus AI redesign resume the same revision. Migration 31 reconciles legacy overlaps and enforces one active project per business; full release and PostgreSQL rehearsal remain pending visual approval. | in_progress |
| Focused client workspace and canonical story/process chapter | FE-031 | BE-028 | DEP-023 | One current recipe chapter for business context, process steps, and controlled process video; legacy reads canonicalize without destructive writes; staff remain in an explicit client/request workflow with a deferred unsaved desktop/phone preview; logo, hero, browser-icon, chapter, and offering fields admit request-scoped image replacements or normalized controlled YouTube references in place; discovery booth media uses the provider-neutral upload path | On 2026-08-14, focused domain, recipe, renderer, media, navigation, palette, type/build, and desktop/phone evidence pass. The 10/10 acceptance run proves the canonical chapter, media/video replacement, settings ownership, unsaved previews, readable palette pairing, and stable invalid-edit behavior. The complete release, GitHub Actions run `31750355870`, and production deployment `dpl_EPpUwucKvJE18WCckB7RqMq3EFVT` pass. | done |
| Search-led marketplace homepage | FE-030 | BE-023 | — | Product-led public imagery, map discovery, bounded product and business Search workspace, URL-backed result-type controls, preserved map state, bounded nearby-business viewers, sponsor pool, Daily Featured gallery, responsive business inspector, and compact public navigation in `app/(public)/page.tsx`, `components/DiscoveryWorkspace.tsx`, `components/FeaturedShowroomsWorkspace.tsx`, `lib/discovery.ts`, `lib/featured-program.ts`, `app/landing.css`, and `app/discovery.css` | Approved Chromium evidence at 1440, 390, and 320 CSS pixels under `/tmp/suqpage-search-review` proves Search replaces only the map canvas, filters work, cards open the inspector first, map state survives return, and no viewport overflows. `npm run check`, `npm run release`, and 10/10 ordered browser workflows pass on 2026-09-12. | in_progress |
| Supabase PostgreSQL runtime and Vercel production cutover | — | BE-027 | DEP-023 | Driver-selectable asynchronous persistence, PostgreSQL adapters for every authoritative workflow, Supabase private Storage, production startup validation, guarded empty-target copy/reconciliation with an optional transaction-local migration role, least-privilege runtime provisioning, production-only Vercel configuration, preview isolation, and rollback controls | On 2026-08-14, a mode-0600 PostgreSQL backup archive, 44-table disposable PostgreSQL 17 restore drill, additive migrations 31 and 32, immediate current-schema rerun, private Storage check, and least-privilege runtime preflight pass. Release commits `7fb5d04` and `5d353be` pass GitHub Actions runs `31686699133` and `31750355870`; final code deployment `dpl_EPpUwucKvJE18WCckB7RqMq3EFVT` passes generated-origin route, health, PWA, and log checks. Apex and `www` aliases are attached, but public DNS returns `NXDOMAIN`; registrar correction and monitored canonical-domain rollout remain pending. | in_progress |
| Suqpage platform visual system refresh | FE-029 | — | — | Shared semantic platform tokens, compact Suqpage mark/wordmark, public discovery and venue presentation, public task forms, authenticated workspace shell, and adaptive showroom host band; tenant showroom palettes remain independent | Completed locally on 2026-08-04: `npm run check`; 10/10 production acceptance workflows; zero-failure desktop/390px/320px discovery, inline City Showroom, Daily Featured, form, workspace, host-band, and fixed-inquiry captures under `/tmp/suqpage-final-discovery-v6` and `/tmp/suqpage-final-showroom-v3`; `npm run release` passed with zero production vulnerabilities | done |
| Editorial producer story and scalable landscaped virtual venues | FE-028 | — | — | `app/page.tsx`, `components/DiscoveryWorkspace.tsx`, `lib/discovery-venue-layout.ts`, `app/discovery.css`, and `public/landing/venue-hall-shell-v1.webp` | Prior architectural evidence passed on 2026-08-04; FE-030 now governs row-based floor geometry and final visual admission remains pending | in_progress |
| Small-scale local production public narrative | FE-027 | — | — | `app/(public)/page.tsx`, `components/DiscoveryWorkspace.tsx`, `app/about/page.tsx`, `app/request/page.tsx`, `app/login/page.tsx`, support launcher, platform metadata, master prompt, demo portfolio, and narrative guardrail | Contracts prove concise consumer-first language, optional trader and retailer opportunities only where offered, bounded support claims, and a demo portfolio without repair-only or mass-industrial participants. Approved 1440/390/320 Search captures, `npm run check`, `npm run release`, and 10/10 ordered browser workflows pass on 2026-09-12. | done |
| Role-oriented workspaces, hardened runtime boundaries, and staged PostgreSQL delivery | FE-026 | BE-026 | DEP-022 | Stable administrator destinations, support-agent management, role-aware navigation, asynchronous password work, bounded object-storage reads/writes, database-derived media reconciliation, 42-module SQLite-boundary inventory, executable PostgreSQL schema/copy rehearsal, pinned Node 24.18.1 baseline, five-job CI, and DevOps runbook | Local 2026-08-03: `npm run check`, `npm run release`, `npm run test:operations`, `npm run test:container`, 10/10 ordered browser acceptance, and PostgreSQL 17 rehearsal of 44 tables/2,849 rows with source-byte preservation passed. GitHub Actions runs `30810736356` and `30811139517` passed `core`, `browser`, `container`, `dependency`, and `postgres`. Protected `main` requires the five checks, current pull requests, resolved conversations, linear history, and administrator enforcement; force pushes and deletion are blocked. PostgreSQL runtime remains deliberately disabled under ADR-0013. | done |
| Launch-ready marketplace, focused media authoring, and provider-neutral immutable media | FE-025 | BE-024 | DEP-021 | Process-section controlled video, private request and support attachments, post-import labeled image checklist, exact current-design export, instant public search, `MediaObjectStore` filesystem/Supabase adapters across public/request/support namespaces, copy-only media migration, curated process references, and demo videos | Prior release and remote evidence remains retained. On 2026-08-15, `npm run test:media-storage` and `npm run test:media-reconciliation` prove filesystem/Supabase support-namespace parity, PDF object-key admission, database-derived support-object reconciliation, private response bounds, traversal denial, and safe provider failures. Production support-object copy verification remains pending under DEP-021. | in_progress |
| Retired demonstration Delivery surface | FE-003, FE-017, FE-025 | BE-025 | DEP-021 | Delivery navigation, pages, APIs, actions, mock adapters, fresh setup seeds, and active query paths are removed while dormant legacy tables remain | `scripts/test-security.ts`, `scripts/test-scalable-queries.ts`, `scripts/http-smoke.mjs`, `tests/acceptance/app.spec.ts`, non-destructive `npm run migrate`, `npm run test:operations`, `npm run release`, and `npm run test:container` passed on 2026-08-02 | done |
| Suqpage identity, production-scale marketplace, showroom preview, role-scoped attention, sponsored placement, and Daily Featured | FE-024 | BE-023 | DEP-020 | Migrations 25 through 30, `lib/discovery-contract.ts`, scale-aware and program-aware `lib/discovery.ts`, `lib/discovery-admin.ts`, `components/DiscoveryWorkspace.tsx`, `lib/dashboard-attention.ts`, platform identity surfaces, and authored workshop/growing-factory fixtures with complete media | Prior Suqpage and sponsorship gates passed on 2026-08-02. On 2026-08-09 the global sponsor projection, five-record fixture, and migration 30 pass focused integration tests; the floating inspector and revised city symbol await fresh browser approval before complete release gates. | in_progress |
| Rich offering facts, controlled live/video links, and token-driven product detail patterns | FE-022 | BE-021 | DEP-018 | Additive schema migration 24, offering/live validation, fail-closed discovery projection, Daily Featured presentation precedence, revision-v4 and recipe contracts, product/business authoring, showroom header and four product-detail patterns, ten brief-driven benchmarks, and 48 scale fixtures | Prior complete release evidence remains valid. Reopened BE-021 on 2026-08-09: live security and discovery regression tests prove provider validation, invalid retained URL suppression, and persistence-neutral Daily Featured precedence; full post-approval release gates remain pending. | in_progress |
| Geographic Showroom map, bounded nearby-showroom inspector, Daily Featured Showrooms, and public private-workspace bootstrap | FE-021 | BE-020, BE-021, BE-023 | DEP-017 | `lib/discovery.ts`, `components/DiscoveryWorkspace.tsx`, progressive local geography under `public/geo`, viewport-bounded Supercluster projection, canonical ID-only nearby groups, `lib/signup.ts`, publication-only visibility queries, and retained admin invitation onboarding | On 2026-08-17, focused tests prove exact geography-tier reconstruction, a 10,000-row grouping time of 102.2ms, and cache-version isolation for the canonical ID-only nearby-group projection. CPU-throttled Chromium transitioned from All industries to Machinery, completed repeated cluster zooms and a pan in 5.6s on a 390px viewport at 6x slowdown with no errors or overflow and a maximum 692ms long task; desktop completed in 3.7s at 4x with a 769ms maximum. Captures are under `/tmp/suqpage-market-performance`; the optimized production build passed. User visual approval and remote rollout evidence remain pending. | in_progress |
| Retired permanent industry and City Showroom discovery | FE-020 | BE-019 | DEP-016 | Superseded by exact-location markers and the separate daily country-wide industry Daily Featured under FE-021, BE-020, and DEP-017; historical nearest-host code may remain inert during the pre-launch transition | Prior completion evidence is retained in FE-020, BE-019, DEP-016, and Git history; replacement evidence is recorded under FE-021 | deprecated |
| Public discovery, showroom cart, and copy-first inquiry | FE-001 | BE-001 | DEP-001 | `components/showroom/ShowroomApp.tsx`, `components/showroom/showrooms.css`, `lib/inquiries.ts`, `app/api/inquiries/route.ts` | Copy/share and mobile evidence passed 2026-07-29. Phone-required `Send inquiry` passed security integration, production HTTP smoke, typecheck/build, and 10/10 browser acceptance on 2026-08-01, including invalid-contact rejection without a row, normalized persistence, mobile controls, sent state, and correct client-inbox visibility. | done |
| Tenant/session enforcement | FE_BASE | BE_BASE | DEP-001 | `lib/auth.ts`, `lib/dashboard.ts`, `app/actions.ts` | `scripts/test-security.ts`, `tests/acceptance/app.spec.ts` | done |
| Versioned showroom content management | FE-003 | BE-003 | DEP-003 | `lib/revision-service.ts`, `app/dashboard/requests/**`, `app/revision-actions.ts` | `scripts/test-revisions.ts`, `tests/acceptance/app.spec.ts` | done |
| Retired mock Delivery workflow | FE-003 | BE-025 | DEP-021 | Superseded and removed from active code; dormant legacy tables are retained for the rollback window | Prior behavior remains in Git history; removal is covered by BE-025 evidence | deprecated |
| Backup, restore, migration, release, CI acceptance | FE_BASE | BE_BASE | DEP-001 | `scripts/migrate.ts`, `scripts/backup.ts`, `scripts/restore.ts`, `scripts/release.sh`, `scripts/acceptance-runner.mjs`, `scripts/acceptance-db-probe.mjs` | `scripts/test-operations.mjs`, provider-backed API/security acceptance, and `tests/acceptance/app.spec.ts` | done |
| Accessible forms and modal focus | FE-002 | — | — | `app/**`, `components/showroom/ShowroomApp.tsx` | `tests/acceptance/app.spec.ts` (production browser label/focus audit) | done |
| Login and adapter failure boundaries | — | BE-002 | — | `app/login/page.tsx`, `lib/auth.ts`, `app/actions.ts`, `lib/notifications.ts` | `scripts/test-adapters.ts`, `tests/acceptance/app.spec.ts` (authenticated login-route regression), `scripts/release.sh` | done |
| Reproducible delivery and repository hygiene | — | BE-003 | DEP-002 | `.dockerignore`, `Dockerfile`, `compose.yaml`, `.github/workflows/quality.yml`, `next.config.ts`, `lib/trusted-origins.ts`, `lib/config.ts`, `lib/media.ts`, `lib/request-media.ts`, `package.json`, `package-lock.json`, `scripts/typecheck.mjs`, `scripts/acceptance-runner.mjs`, `scripts/test-build-trace.mjs`, `scripts/release.sh` | On 2026-09-12 the graph resolves `next@16.3.4`, one overridden `sharp@0.35.4`, and `postcss@8.5.25`; the audit reports zero vulnerabilities. `npm run check`, `npm run release`, the current 51-table PostgreSQL rehearsal, and 10/10 browser workflows pass; replacement remote checks remain pending. | in_progress |
| Managed showroom projects, staff fulfillment, clarification, preview approval, and publication | FE-003 | BE-003 | DEP-002, DEP-003, DEP-023 | Business-facing setup/update/current/history UI over internal service-request audit records; setup-only context intake; concise established-showroom update intake; peer direct-edit and AI-redesign tools over one private revision; `lib/request-*.ts`, `lib/postgres-migrations.ts`, `lib/invitations.ts`, `lib/staff-operations.ts`, `lib/revision-service.ts`, `lib/schema.ts`, `app/dashboard/requests/**`, and `components/*RequestForm.tsx`; migration 31 | 2026-08-10 `npm run test:requests`, `npm run test:revisions`, `npm run typecheck`, `npm run validate:specs`, and focused desktop/phone browser evidence pass. The focused workflow creates and cleans one fictional update and proves both authoring paths share its revision. PostgreSQL rehearsal, full release, and remote gates remain pending visual approval. | in_progress |
| Constrained showroom component-bank and proposal contract | — | BE-004 | — | `lib/showroom-composition.ts`, `showroom-sdk/component-bank.schema.json`, `showroom-sdk/showroom-proposal.schema.json` | `scripts/test-showroom-composition.ts`, `npm run check` | done |
| Curated cross-industry component bank and staff visual laboratory | FE-004 | BE-005 | DEP-004 | `components/showroom/bank/**`, `lib/showroom-bank-release.ts`, `app/dashboard/design-bank/page.tsx`, `lib/capabilities.ts` | `scripts/test-showroom-bank.ts`, `scripts/test-security.ts`, `tests/acceptance/app.spec.ts`, `npm run check`, `npm run build` | done |
| Mobile-first bounded showroom experience system | FE-005 | BE-006 | DEP-005 | `lib/showroom-experience.ts`, `lib/showroom-bank-release.ts`, `components/showroom/bank/**`, `app/dashboard/design-bank/page.tsx` | `scripts/test-showroom-experience.ts`, `scripts/test-showroom-bank.ts`, `tests/acceptance/app.spec.ts`, `npm run check`, `npm run release` | done |
| Deterministic composed showroom and four-client v2 cutover | FE-006 | BE-007 | DEP-006 | `lib/revision-domain.ts`, `lib/revision-service.ts`, `lib/showroom-manifests.ts`, `components/showroom/ShowroomApp.tsx`, `components/showroom/bank/**`, schema migration 8 | 2026-08-12 focused renderer, type, and Chromium evidence under `/tmp/suqpage-showroom-navigation` proves the platform host strip remains above tenant identity; desktop headers expose Home/Story/Offerings/Contact without the former descriptor; 390px and 320px phone bars expose those sections plus Inquiry with at least 44px targets, safe bottom placement, drawer reuse, and no horizontal overflow. Full acceptance and release gates await visual approval. | in_progress |
| Stockless client/staff basic product upkeep | FE-008 | BE-009 | DEP-008 | `lib/revision-domain.ts`, `lib/product-upkeep-domain.ts`, `lib/product-upkeep.ts`, `lib/product-upkeep-sqlite.ts`, `lib/migration-checkpoint.ts`, `lib/media.ts`, `lib/schema.ts`, `app/actions.ts`, `app/dashboard/products/**`, `components/ProductForm.tsx`, `components/ProductUpkeepList.tsx`; active product commands and UI use product categories only while compatibility collection columns remain recovery-only; schema migrations 9–10 | `scripts/test-product-upkeep.ts` proves submitted collection IDs are rejected and active writes clear collection relationships; `scripts/test-stockless-catalog.ts`, `scripts/test-security.ts`, `scripts/test-revisions.ts`, `scripts/test-operations.mjs`, `tests/acceptance/app.spec.ts`; `npm run check`, 10/10 production-browser acceptance, and `npm run release` passed on 2026-07-28 | done |
| AI-assisted showroom recipe import and first-class focused editing | FE-007 | BE-008 | DEP-007 | portable current content/content-block/design/component-bank/recipe schemas, named independent contract manifest, fixed client-independent structural example, pure recipe parser, request-scoped verified-image registry, private idempotent import service, revision-v3/v4 metadata persistence, optional AI redesign workspace, first-class direct editor, and exact private preview; both authoring tools operate on one revision | Prior recipe parser/import/publication evidence remains valid. On 2026-08-10 focused browser evidence proved direct editing and AI redesign resume the same established-showroom update revision while setup retains the complete-design path. Full release and remote gates remain pending visual approval. | in_progress |
| Additive revision-v4 typed content and creative showroom bank 1.2 | FE-009 | BE-010 | DEP-009 | Immutable bank 1.1 remains supported for retained manifests; reset-created local seed rows, new private drafts, recipe imports, publication, rollback, and retained baselines use schema-v4 snapshots with typed content blocks and bank 1.2 manifests. Design-v2 sections expose bounded `mediaIntegration`, independently chosen semantic `surfaceRole`, and an optional complete custom color palette over an admitted non-color foundation. No fixed surface sequence or signature-treatment count blocks private import; contrast, exact palette keys, safe values, component compatibility, media authority, tenant scope, and publication authority remain enforced. The focused editor changes provisional copy, palette colors, and section surfaces without re-importing JSON. Shared headers expose identity and an optional descriptor without catalog/inquiry commands; shared footers expose identity, permanent handle, and contact without category navigation; the floating inquiry control is the only persistent cart entry. | `scripts/test-showroom-composition-v2.ts`, `scripts/test-showroom-bank.ts`, `scripts/test-showroom-fitness.ts`, `scripts/test-showroom-recipe.ts`, `scripts/test-showroom-benchmarks.ts`, and `scripts/capture-showroom-benchmarks.mjs`; contract tests prove safe custom palettes, unreadable/CSS-like palette denial, flexible surface rhythms, and advisory-only signature density. Prior 56-view visual admission remains valid for component/mobile behavior; current `tests/acceptance/app.spec.ts` proves custom palette import, focused hex/surface correction, exact CSS-variable rendering, review, and publication. 10/10 browser acceptance, `npm run check`, and `npm run release` passed on 2026-07-29. Broader FE-009/BE-010/DEP-009 rollout evidence remains in progress. | in_progress |
| Retired daily event map | FE-010 | BE-011 | DEP-010 | Superseded by FE-020, BE-019, and DEP-016; compatibility routes redirect to `/discover` and current public/admin code does not use occurrence tables | Prior completion evidence is retained in Git history; permanent City Showroom replacement evidence is recorded under FE-020 | deprecated |
| Retired event-led marketplace homepage | FE-012 | BE-011 | DEP-010 | Superseded by the integrated permanent discovery homepage under FE-020 | Prior completion evidence is retained in Git history; permanent homepage evidence is recorded under FE-020 | deprecated |
| Unified platform identity and role-aware workspace shell | FE-013 | — | — | `components/SuqpageBrand.tsx`, `components/WorkspaceNavigation.tsx`, `components/DashboardShell.tsx`, `components/RequestForm.tsx`, `app/page.tsx`, `app/about/page.tsx`, `app/request/page.tsx`, `app/login/page.tsx`, legal pages, `app/landing.css`, `app/globals.css`, and `public/brand/suqpage-original-mark-v2.svg` | Original identity and navigation acceptance completed on 2026-08-01; FE-029 supersedes the original purple visual treatment and mark asset while retaining the shared task, authorization, and mobile-navigation contracts. | done |
| Retired event administration controls | FE-011 | BE-012 | DEP-010 | Superseded by paginated discovery profiles and focused editing under FE-020 and BE-019 | Prior completion evidence is retained in Git history; current admin save and public projection are covered by `scripts/test-discovery.ts` and `tests/acceptance/app.spec.ts` | deprecated |
| Recipe blueprint media studio and composition fitness | FE-014 | BE-013 | DEP-011 | `lib/showroom-blueprint.ts`, `lib/showroom-guidance.ts`, `lib/showroom-design-systems.ts`, `lib/showroom-recipe-domain.ts`, `lib/showroom-recipe-service.ts`, `lib/revision-service.ts`, `showroom-sdk/showroom-design-system.schema.json`, `components/RecipeStudio.tsx`, `components/BlueprintMediaBoard.tsx`, `components/showroom/bank/DesignBankLaboratory.tsx`, revision actions and studio/preview/recovery routes | `scripts/test-showroom-blueprint.ts`, `scripts/test-showroom-fitness.ts`, `scripts/test-showroom-bank.ts`, `scripts/test-showroom-recipe.ts`, `scripts/test-security.ts`, `scripts/test-revisions.ts`, `tests/acceptance/app.spec.ts`; exact portable media destinations, 18 archetype-free semantic systems, eight industry-neutral templates, explicit profiles for 67 components, industry-steering denial, authorized client-specific browser recipe import, `npm run check`, `npm run release`, and 10/10 browser acceptance on 2026-07-28 | done |
| Retired event-oriented app home | FE-015 | BE-011, BE-013 | DEP-010, DEP-011 | Superseded by the permanent City Showroom composition under FE-020 | Prior completion evidence is retained in Git history; current mobile and map evidence is recorded under FE-020 | deprecated |
| Ten-showroom authored visual benchmark | FE-009, FE-014, FE-031 | BE-010, BE-013, BE-028 | DEP-011 | `scripts/setup.ts`, `lib/revision-v4-defaults.ts`, `lib/showroom-design-systems.ts`, `lib/showroom-chapters.ts`, `public/uploads/seed/benchmarks/**`, and `scripts/test-showroom-benchmarks.ts` | Prior 56-view evidence remains historical. Current focused benchmark, recipe, revision, renderer, and fitness tests prove ten six-section category-only benchmarks, all seven headers, all six footers, at least eight token systems, at least six media treatments, at least seven catalog anatomies, one canonical story/process chapter, media existence, and admitted composition fitness. Updated desktop/phone visual approval and full release evidence remain pending. | in_progress |
| Unified products and capabilities catalog | FE-016 | BE-014 | DEP-012 | `lib/offerings.ts`, `lib/db.ts`, `lib/schema.ts` migrations 18-19, `lib/inquiries.ts`, `lib/product-upkeep-*`, `lib/revision-*`, `lib/showroom-recipe-*`, current SDK content schema/guidance, offering/intake/revision/dashboard UI, showroom bank/rendering, inquiry drawer, homepage copy, and mixed `scripts/setup.ts` fixtures | `scripts/test-offering-migration.ts`, `scripts/test-security.ts`, `scripts/test-product-upkeep.ts`, `scripts/test-showroom-recipe.ts`, `scripts/test-revisions.ts`, `scripts/test-showroom-benchmarks.ts`; retained required values normalize to optional behavior, migration 19 preserves numeric history while adding bounded free-form quantity intent, and browser copying retains units such as `1 ton` and `250 kg`; 56/56 visual captures, 10/10 production-browser acceptance, `npm run check`, and `npm run release` passed with zero production vulnerabilities on 2026-07-29. Production rollout remains excluded. | done |
| Retired dense event fixtures | FE-009, FE-010, FE-012, FE-015 | BE-010, BE-011 | DEP-013 | Removed from reset and superseded by the 48 lightweight small-business discovery fixtures in DEP-016 | Prior completion evidence is retained in Git history; current fixture evidence is recorded under FE-020 and FE-017 | deprecated |
| Scalable public discovery and operations workspace | FE-017 | BE-015 | DEP-014 | `lib/pagination.ts`, `lib/scalable-queries.ts`, paginated dashboard routes, indexed collection queries, and batched PostgreSQL showroom-catalog hydration | On 2026-08-15 focused scalable-query and adapter evidence proves one option-group query and one option-value query per catalog, correct ownership across multiple products, and no duplicate active-business lookup on the ordinary showroom route. Prior pagination and tenant-negative evidence remains valid; fresh complete gates remain pending visual approval. | in_progress |
| Retired balanced daily event allocation | FE-010, FE-015 | BE-016 | DEP-015 | Superseded by nearest qualifying City Showroom allocation under BE-019 | Prior completion evidence is retained in Git history; current nearest-host and sparse-location evidence is recorded under FE-020 and BE-019 | deprecated |
| Showroom analytics and retired business subscriptions | FE-018 | BE-017 | DEP-015 | Tenant visit analytics remain; payment/renewal actions, ports and navigation removed; authenticated old-route redirect; migration 60 removes only the creation trigger/function | Local non-destructive upgrade/idempotence/new-shop absence, historical preservation, publication, privacy visit attribution and tenant denial pass. Actual admin bookmark returns to its workspace without renewals; role/phone UI captures pass. Historical evidence is retained in Git; hosted migration, visual/full/release gates and commit remain pending. | in_progress |
| First-party support queue | FE-019 | BE-018 | DEP-015 | Schema migrations 22/33/34/36, `lib/support.ts`, `lib/support-media.ts`, authenticated support actions, token-scoped public API/drawer, required visitor reconnect details, private image/PDF attachments, participant-scoped download routes, client/staff queue/thread pages, five-second refresh, role-aware navigation, optional WhatsApp handoff, and responsive styles | Prior authenticated queue evidence remains valid. On 2026-08-15, type/spec checks plus `npm run test:support`, `npm run test:media-storage`, and `npm run test:media-reconciliation` pass, including image sanitization, PDF verification, duplicate cleanup, wrong-token/tenant denial, and authorization-before-storage-read. Focused Chromium at 1440/390/320 passes upload, private no-store PDF read, End chat, Start another chat, and zero overflow; captures are under `/tmp/suqpage-support-attachments-v2`. Complete release gates, PostgreSQL migration rehearsal, user visual approval, and rollout remain pending. | in_progress |
| Complete fictional demo showroom portfolio | FE-023 | BE-022 | DEP-019 | `lib/scale-demo-seed.ts`, `lib/showroom-seed-briefs.ts`, `lib/revision-v4-defaults.ts`, deterministic setup/materialization scripts, 66 durable project briefs and review records, 66 logos/heroes/booths, 264 offering images, and production-family process references | `scripts/test-demo-client-portfolio.ts` and `scripts/test-showroom-benchmarks.ts` prove all 66 admitted manifests and 264 offerings with at least ten distinct process-video references; prior 1440px/390px capture batches plus current `npm run check`, 10/10 ordered acceptance, `npm run release`, and container build passed on 2026-08-02 | done |

`baseline` means existing behavior is tested but should receive dedicated feature
specs before a material behavior change.

| FE-046 / BE-039 / DEP-036 | Complete new-business starters | lib/business-starter.ts, lib/business-starter-postgres.ts, signup/invitations, original starter PNGs | scripts/test-business-starters.ts, scripts/capture-business-starters.ts; signup/invitation/location regressions | Focused tests/typecheck pass; 18 captures and three accessibility scans; owner approval/full gates and monitored deployment verified; docs/SUQPAGE-RELEASE-2026-09-21.md |

| DEP-027 dev-command correction | `package.json`, `scripts/start-local-dev.mjs` | `scripts/test-local-dev-launcher.mjs`, `test:local-supabase-readiness` | Runtime loading/CLI precedence/origin/negative guards pass; retained local schema update awaits backup tooling |

| DEP-027 dev-resource hostname correction | `lib/trusted-origins.ts`, `next.config.ts`, `package.json` | `scripts/test-dev-resource-origins.mjs`, `test:local-supabase-readiness`, actual installed Chrome | Next.js 16 HMR guard accepts exact `127.0.0.1` and denies an unknown host with 403; Server Action hosts and mutation origins remain port/exact-origin scoped. Local `127.0.0.1:3102` editor hydrates after restart with one HMR socket, enabled About/language controls, zero console errors or app POSTs; `.local/dev-origin-s146/receipt.json`. Focused readiness, typecheck, 217-spec validation and whitespace pass; no hosted change. |
| DEP-027 disposable browser readiness correction | `scripts/acceptance-runner.mjs`, `scripts/acceptance-supabase-readiness.mjs`, `package.json` | `scripts/test-acceptance-supabase-readiness.mjs`, `test:local-supabase-readiness`, source-matched isolated browser acceptance pending | CLI initial health bypass is followed by a five-minute fail-closed wait for six exact project-labelled containers and real Auth/API plus Storage status success. Focused six-case, local-readiness and 217-spec gates pass; the previous slow-Storage infrastructure failure remains recorded. No browser-journey or hosted release claim yet. |
| DEP-027 disposable browser port isolation | `scripts/acceptance-runner.mjs`, `scripts/acceptance-supabase-readiness.mjs` | `scripts/test-acceptance-supabase-readiness.mjs`, source-matched isolated browser acceptance pending | An explicit unprivileged loopback API-port override moves all six disposable Supabase ports together; readiness still requires the exact project label and selected endpoint. One-pass remapping is tested against a destination that overlaps an original port. Focused readiness 9/9, 218-spec validation and independent actual-config review pass; full browser/release gates remain pending. |
| DEP-027 disposable email capacity and visible capture | `scripts/acceptance-runner.mjs`, `scripts/capture-launch-wiring.mjs` | `test:local-supabase-readiness`, source-matched isolated browser acceptance pending | First full run after Storage startup reached 20 cases: 18 passed; the third independent sign-in exceeded only the disposable project's two-email hourly limit and a capture matched hidden duplicate markup. The isolated browser project now allows six local test emails, while hosted/developer limits stay unchanged; the capture still requires visible published text. Full rerun pending. |
| FE-072 retired staff-assistance capture | `scripts/capture-launch-wiring.mjs` | source-matched isolated owner acceptance pending | Follow-up full browser run passed 19/20; its long capture still expected the removed per-business Staff assistance heading. The accepted flow redirects that URL to the Staff directory, which the assertion now verifies. No product route or permission changed. |

| DEP-031 archive correction; DEP-034/035/036 local update | scripts/postgres-archive.ts, scripts/restore.ts; migrations 46/47 | test-archive-validation.ts, test-operations.mjs; retained backup/restore and rollback-only feature verification | Local schema 47; 56 restored table fingerprints, 3,401 preserved application rows; docs/SUQPAGE-LOCAL-SCHEMA-47.md; hosted gates pending |

| Simple owner posting and text search | FE-047 | BE-040 | DEP-037 | ProductForm, app/actions.ts, product-upkeep domain/PostgreSQL, discovery.ts | Focused upkeep/security, discovery/pagination, typecheck; 19 browser captures, five-field create/save/metadata preservation and three accessibility scans pass. Visual approval/full gates/deployment pending.  S20 full gates and monitored deployment 6ab0d349f099639821fa0f9a verified; current evidence: docs/SUQPAGE-RELEASE-2026-09-21.md. | done |
| Automatic local startup | DEP-027 | scripts/local-dev-services.mjs, start-local-dev.mjs | test-local-dev-services.mjs, test-local-dev-launcher.mjs, test:local-supabase-readiness | Ready/stopped/resumed/bounded-failure paths pass with injected ports; real healthy services reused by launcher. No resets or hosted changes. | in_progress |

| Self-service owner workflow, simple demos and city marker separation | FE-048 | BE-041 | DEP-038 | owner-page-save/publication, owner-business-runtime, ProductForm, dashboard/admin, discovery, map-display-location, setup | test-self-service-publication, test-simple-demo-seed, test-search-performance, owner-page/place/upkeep/pagination; capture-business-starters and capture-simple-market. Evidence: docs/SUQPAGE-SELF-SERVICE-REVIEW.md. Visual approval/full gates/commit/hosted rollout pending.  S20 full gates and monitored deployment 6ab0d349f099639821fa0f9a verified; current evidence: docs/SUQPAGE-RELEASE-2026-09-21.md. | done |

| Demo capability coverage extension | FE-023 | BE-022 | DEP-019 | scripts/setup.ts, scripts/demo-public-contacts.ts; protected local one-time correction | test-simple-demo-seed.ts; capture-demo-capabilities.ts; docs/SUQPAGE-DEMO-CAPABILITY-REVIEW.md | in_progress |

| Inquiry action clarity (S13) | FE-041 | BE-001 | DEP-030 | ProductPage and BusinessProfile labels/help, responsive actions, ShowroomApp feedback | capture-inquiry-clarity.mjs: nine desktop/phone captures, single/group independence, no send-on-add, axe; test:product-inquiry and typecheck pass. Local review only; visual approval/full gates pending.  S20 full gates and monitored deployment 6ab0d349f099639821fa0f9a verified; current evidence: docs/SUQPAGE-RELEASE-2026-09-21.md. | done |

| Platform favicon and concise UI standard (S14/S15) | FE-038 / FE-041 / FE-048 | BE-001 | DEP-030 | inherited root icons; settings control; product/page/business/workspace copy and action icons; master 5.3 | test-platform-favicon.mjs, test-pwa-shell.mjs, capture-inquiry-clarity.mjs, capture-business-starters.ts, typecheck; docs/SUQPAGE-DISCOVERY-AND-COPY-REVIEW.md  S20 full gates and monitored deployment 6ab0d349f099639821fa0f9a verified; current evidence: docs/SUQPAGE-RELEASE-2026-09-21.md. | done |
| Publication completes saved discovery setup (S16) | FE-048 | BE-041 | DEP-038 | owner-business-runtime.ts, owner-page-publication-runtime.ts | test-self-service-publication.ts covers first publish, discovery-failure rollback and name/location search; test-place-selection.ts; protected local repair and desktop/phone search evidence  S20 full gates and monitored deployment 6ab0d349f099639821fa0f9a verified; current evidence: docs/SUQPAGE-RELEASE-2026-09-21.md. | done |

| Email-only entry and complete Suqpage email branding (S17) | FE-038 | BE-031 | DEP-027 / DEP-029 | config/login/account, local Auth, templates/manifest, notifications and guarded branding patch | 38 guard tests; test-email-branding, test-auth-runtime, local readiness, narrative; capture-email-entry and local OTP delivery/replay smoke. docs/SUQPAGE-EMAIL-AND-DOMAIN-REVIEW.md; hosted branding applied after exact owner approval; derived flag mismatch independently reconciled; app release pending | in_progress |
| GoDaddy custom-domain preparation (S18) | FE-038 | BE-031 | DEP-026 / DEP-029 | verified Netlify target, protected before-state and exact DNS/Auth input patches | Alias-only request rejected because primary required; unchanged readback. Owner DNS verified at two public resolvers; primary/alias registered with unchanged deploy. HTTPS issued; apex login 200, www→apex 301. Auth/canonical cutover pending; docs/SUQPAGE-EMAIL-AND-DOMAIN-REVIEW.md  S20 full gates and monitored deployment 6ab0d349f099639821fa0f9a verified; current evidence: docs/SUQPAGE-RELEASE-2026-09-21.md. | done |

| Explicit saved Supabase CLI credential source (S19) | - | - | DEP-029 | `scripts/auth-credentials.ts`, v2 production Auth plans | 52 credential/guard tests, typecheck, 151-spec validation pass; saved-login plan and owner-approved single branding PATCH. Original readback stopped on provider flags; independent read-only reconciliation proves 27 approved fields plus 22 expected flags only. Guard correction tested; full gates/scoped commit pending  S20 full gates and monitored deployment 6ab0d349f099639821fa0f9a verified; current evidence: docs/SUQPAGE-RELEASE-2026-09-21.md. | done |

| Human-query search regression (S20a) | FE-042 | BE-040 | DEP-037 | search-terms.ts, discovery.ts, DiscoveryWorkspace.tsx | test-human-search.ts, test-discovery-pagination.ts: case/plural/accent/phrase/Unicode/description/location/brand, literal and eligibility negatives; capture-human-search.mjs: delayed responses, desktop/390/320, typing/back/type; 10,000-product benchmark 450/436/492 ms; full release pending  S20 full gates and monitored deployment 6ab0d349f099639821fa0f9a verified; current evidence: docs/SUQPAGE-RELEASE-2026-09-21.md. | done |

| Verified S7–S20 release | FE-044–FE-048 | BE-037–BE-041 | DEP-034–DEP-038 | Source be134a247c8ea54b18b882f9e2368058f7fbc0ee | Full check/release/operations, nine provider browser scenarios, schema 47 preservation, 64 demo routes and live 1440/390/320 search; Netlify 6ab0d349f099639821fa0f9a; docs/SUQPAGE-RELEASE-2026-09-21.md | done |

S21 (BE-040 / FE-042 / DEP-037): `scripts/test-spelling-search.ts` proves
English/Amharic typo admission, normal-first cross-type ordering, five-row page
traversal, filters, visibility, update/unpublish consistency and migration no-op.
`test-search-performance.ts` verifies index use and normal/typo searches on 10,000
offerings. `capture-human-search.mjs` and `capture-spelling-search.mjs` pass at
1440/390/320; no separate approximate-match section. `test-operations.mjs` restores
indexed data plus both search extensions. Production backup rehearsal preserves
all 55 existing application tables / 3,596 records through migration 48.
Full gates and hosted rollout are recorded separately in the release document.

S21 rollout: migration 48 and the real production runtime connection verified;
Netlify `6ab0dfee5b7bbcd1cb221ce6` serves `0fc10c0`. All full/release/operations
and nine browser acceptance scenarios pass, along with 15 live route checks.
The initial verification-only role-switch error rolled back completely; the
corrected verifier uses permission inspection plus the real runtime connection.

Live 1440/390/320 browser checks also pass for `lotoin`, `lotiom` and
`body loton`, including visible results, type tabs, no extra match sections,
no browser errors and no horizontal overflow.

S22 local candidate (FE-042 / BE-040): `test-discovery-pagination.ts` passes six
scenarios including omitted/invalid default-all equivalence. `test-discovery.ts`,
`test-homepage-composition.mjs`, typecheck and spec validation pass.
`capture-search-drawer.mjs` passes at 1440/390/320: retained category/place/query/page,
map node and zoom preservation, default map-only state, optional overlay, keyboard
focus/Escape, business previews, deep links, reduced motion and no overflow.
Visual approval, full/release gates and publication remain pending; S21 remains live.

## S23 — workflow wiring audit, local evidence 2026-09-21

FE-038/BE-031 and FE-048/BE-041: managed account/recovery paths, canonical public
contact editing, truthful inquiry updates and staff/suspension guidance corrected.
`test:wiring-audit`, security/Auth, self-service, launch wiring, invitations,
support, featured schedule, account health, scalable queries, product inquiries,
typecheck, spec validation and database boundaries pass. Dedicated browser audit
verifies actual local provider staff/invitation entry, admin settings, owner inbox,
stale inquiry failure and nine admin routes at desktop/390/320. Evidence and mocks:
`docs/SUQPAGE-WORKFLOW-WIRING-AUDIT-2026-09-21.md`. Visual approval, full/release/build,
commit and deployment pending; S22 drawer approval remains separate and pending.

## S24 — plain language and category illustrations, local evidence 2026-09-21

FE-041/FE-044: shared Add/Added/View inquiry-list labels, shorter public/workspace
copy, object illustrations across category surfaces and linked About categories.
`test:narrative` includes actual SVG rendering, distinct artwork, unknown-category
fallback and decorative accessibility; homepage, product inquiries, service
offerings, discovery pagination, typecheck and spec validation pass.
`capture-category-language.mjs`, `capture-search-drawer.mjs` and
`capture-inquiry-clarity.mjs` pass at 1440/390/320: category/all selection, keyboard,
Escape/focus, working links, accessibility, map retention, single/group separation
and no horizontal overflow. Screenshots under `.local/category-language-review/`
and `.local/inquiry-clarity-review/`. Native form names are preserved and typechecked.
No new schema, provider or dependency. Visual approval, full gates, commit and
deployment remain pending; production remains the S21 release.

## S22–S24 approved release gates

Owner visual approval and deployment authorization received 2026-09-21.
Full check, release/build/dependency audit, operations, nine isolated provider
browser scenarios and final artifact privacy pass. The two old source-layout
assertions now verify the labelled drawer and shared category control.
S22–S24 pending-review/gate notes above are superseded; publication evidence:
`docs/SUQPAGE-S22-S24-RELEASE-2026-09-21.md`. FE-038/BE-031 and earlier admission
limits retain their separate unverified real-email/hosted-session scope.

S22–S24 production evidence: source `c565f917281238333fbebc260ed40942a92fb6de`, Netlify `6ab13a1acad8a70492ba56a9`
is ready on https://suqpage.com. Fifteen route checks, canonical redirect and
1440/390/320 category/Featured/About, pagination and single/group inquiry flows
pass. Desktop drawer/map state passes; complete combined live phone-map interaction
verification remains inconclusive after network/marker timeouts. No real inquiry
sent. Required local/full release gates pass. Recovery and remaining limits:
`docs/SUQPAGE-S22-S24-RELEASE-2026-09-21.md`.

## FE-049 — Five-language interface (in progress)

Plan: `docs/SUQPAGE-TRANSITION-CHECKLIST.md` S25; architecture ADR-0022.
Focused translation, state-preservation and responsive evidence pending. No
localization deployment or native-speaker review is claimed.

## FE-042 — compact result drawer (local candidate, 2026-09-23)

`components/DiscoveryWorkspace.tsx` and `app/discovery.css` place search and a
Filters disclosure above compact type tabs; redundant headings are removed and
paging sits below independently scrollable rows. Selected category/place values,
backend five-row paging and map state remain intact.

Evidence: typecheck, spec validation, catalog freshness and four FE-049 safety
tests pass. Updated `scripts/capture-search-drawer.mjs` passes desktop/390/320
and all five languages: first result within 230px of panel top, at least two full
cards, no clipped tabs/cards/paging, footer location, disclosure, focus/Escape,
retained map, URL paging and row scroll reset. Updated
`scripts/capture-category-language.mjs` passes keyboard/category reset/About
links and Axe accessibility. Screenshots `.local/search-drawer-review/` show
four complete cards at 390×844 and three at 320×740; inspected English phone and
Somali 320 captures. No hosted mutation, commit, release or native-language
review is claimed. Owner visual approval remains the next release gate; broader
FE-049 text coverage and authenticated browser validation remain in progress.

## BE-040 — original-term search ranking (2026-09-23, local)

`lib/discovery.ts` ranks all original terms in a product title before matches from
business/description text and plural-only alternatives, retaining exact/prefix
priority and server pagination. Suggestions use normalized original-term priority.
`scripts/test-search-ranking.ts` is wired into `test:discovery-pagination`; proved
failure before and pass after. Existing spelling, 21 human-query variations and
six PostgreSQL pagination/visibility tests pass, as do typecheck/spec validation.
The existing local catalog's `gras` result moves Farm Grass with Dirt from eighth
to first with the same 39 total results. Read-only browser verification at
1440/390/320 confirms the first-visible result and next/back paging; screenshots
are under `.local/search-ranking/`.

10,000-offering performance: isolated retry normal 945/886/832ms, typo
1192/1560/1355ms; index-use assertion passes. Initial concurrent browser/fixture
run exceeded 2.5 seconds; no production latency inference. No application-data,
schema or provider changes. Full combined build/release, commit and deployment
remain pending behind the existing visual candidate approval and FE-049 work.

## FE-032/FE-033 and BE-018/FE-019 — demo workflow corrections (2026-09-23)

Audit: `docs/SUQPAGE-DEMO-WORKFLOW-AUDIT-2026-09-23.md`.
Clock/header: `lib/clock-display.ts`, `components/ClockInput.tsx`, Featured/public
shell and dashboard formatting. `test-clock-display.ts` covers 1,440 round trips,
noon/midnight and invariant agenda timestamps; `test:featured-schedule` passes.
`capture-clock-display.mjs` checks 1440/390/320, no redundant logo caption,
AM/PM controls/machine values, and no broadcast claim without a configured URL.
Public phone screenshot inspected; private admin captures remain ignored.

Support: prepared HttpOnly session, stable UI request keys through reopening,
serialized start replay, duplicate attachment cleanup and retry-load recovery.
`test:support` passes existing permission/tenant/attachment/assignment/expiry
checks and `test-support-retries.ts` concurrency/replay/quota/isolation coverage.
`capture-support-retries.ts` passes real UI + API handlers + isolated PostgreSQL;
only transport is intercepted to lose committed responses, with notifications
disabled. `capture-launch-wiring.mjs` now proves actual buyer form → HTTP API →
owner inbox with chosen option in addition to its existing setup/publish/edit/
visibility/private-media and route/accessibility checks.

Typecheck, catalog freshness/localization safety and 153-spec validation pass.
These are focused local corrections. Full combined gates, visual approval,
commit and rollout remain pending; FE-049 coverage remains incomplete. No
hosted login delivery, real external-message receipt or full launch-readiness
claim is made.

## S25 completion verification — 2026-09-23

The owner approved finishing and publishing the reviewed candidate. This
supersedes the earlier pending-approval and incomplete-localization notes above.
FE-049: 982 keys per translated catalog, six safety/coverage/payload tests and
85 browser checks on public/owner/admin pages pass at 1440/390/320. Merchant
content, unsaved fields and inquiry selections survive language changes.
Documented English fallbacks remain; no native-speaker review is claimed.
FE-041: twelve immediate direct-product selections/reloads pass in
`scripts/capture-product-ready.mjs`; actions wait for saved-list restoration.
FE-042: search input/submit/clear wait for hydration. Immediate typing, rapid
changes, spelling variations, category/type preservation and back navigation
pass in `capture-human-search.mjs` at all three widths. Category paging
checks use actual viewport/navigation bounds and pass at all three widths.
Operations and release gates pass. Full check and nine-scenario acceptance
are still running; their final evidence and publication belong in the release
document. No schema, hosted Auth or merchant-data changes are required.

Final S25 gates: check, release, operations, all nine production-mode acceptance
scenarios and final Netlify build/artifact privacy pass. The last search-readiness
change additionally passes typecheck and immediate-typing browser regression.
See docs/SUQPAGE-S25-RELEASE-2026-09-23.md for publication and recovery evidence.

DEP-026 S25 packaging correction: first publication returned HTTP 500 due to
missing Linux Sharp/libvips; application rollback verified homepage/health 200.
`scripts/test-netlify-native.mjs` reproduces failure from the exact uploaded
archive in Linux/x64/glibc. Corrected build and passing archive evidence are
required before recovery publication; see the S25 release document.

S25 verified publication: 6ab399ae7a6f90b9daec07dc, source f16f2e3131a5739a96790bd362de767cbe1aaffc.
All gates, corrected Linux native archive transform/privacy, 15 live public
checks and five-language browser checks pass. The exact rollback/recovery,
archive hash, screenshots and limits are recorded in
docs/SUQPAGE-S25-RELEASE-2026-09-23.md. Previous pending notes are superseded.


## S26/S27 local candidates — 2026-09-23

FE-038 / BE-031: owner-selected handles have shared validation, authenticated
availability checks and authoritative conflict/race handling. `test:signup`,
`scripts/capture-handle-setup.mjs` and typecheck pass. Browser checks cover invalid,
taken, available, stale responses, retry, rate limits and 1440/390/320 widths.

FE-050 / BE-042 / DEP-039: gallery persistence, ordering, canonical cover, legacy
compatibility, tenant/privacy denial, snapshot retention and idempotent cleanup
pass `test:product-upkeep`, `test:revision-v4`, `test:media-reconciliation` and
`test:native-postgres`. Local schema 49, typecheck, localization and database
boundaries pass. Browser script: `scripts/capture-launch-wiring.mjs`.
Evidence is local in `.local/handle-review` and `.local/gallery-review`.
Visual approval, full gates, scoped commit and hosted rollout remain pending;
production stays at schema 48/S25.

S27 focused browser workflow passes (2026-09-23): mixed gallery, arrows/thumbs,
keyboard/scroll, explicit-play iframe lifecycle, saved cover/reorder/reload,
repeat edit without reupload, removal, private draft media, publication and buyer
inquiry into the owner inbox. Desktop/390/320 no-overflow and focused Axe checks
pass. Captures inspected: `product-gallery-{1440,390,320}.png` and
`simple-product-390.png` in `.local/gallery-review`. Handle available/taken checks
and screenshots pass separately. Fixture images are plain test swatches; external
YouTube delivery and physical-device gestures are not asserted by this evidence.
No commit or hosted write for S26/S27 before the pending visual/release gates.

FE-051 / BE-043 / DEP-040: S28 local candidate in progress. Scope and tests in
new specs; no verified or deployed claim yet. Supersedes required S26 signup handle.


S28 local evidence (2026-09-23), FE-051 / BE-043 / DEP-040:
- `test:signup` / `test-business-handles.ts`: automatic collision retry, canonical
  validation, private/reserved addresses, rename concurrency/cooldown, no-op,
  forged/foreign roles, audited administrator override and RLS/grant boundary.
- `test:business-starters`, `test:native-postgres`, `test:standard-invitations`,
  `test:product-upkeep`: populated galleries, rollback/no overwrite, clean schema
  50 installation/reapply and existing product/media protections pass.
- `capture-handle-setup.mjs`: actual local signup opens the filled preview;
  availability/stale/retry/rate checks, owner change/cooldown/support, administrator
  correction, old product links and privacy pass. Five-language logo pixels/font
  metrics are identical. Desktop/390/320 captures inspected.
- `capture-business-starters.ts`: 29 captures, populated fields/images, editing,
  reload, private-route and contact safety pass. Media are admitted fictional
  samples; provider sessions are test-issued. No external email/video playback claim.
- Typecheck, localization, identity, database boundaries, spec validation and
  whitespace checks pass. Local schema 50 is applied, preflight requires it.
Evidence: `.local/starter-handle-review`, `.local/business-starter-review`.
Visual approval, full/release gates, scoped commit and hosted rollout pass;
production is S28/schema 50. User-owned `deno.lock` is preserved.

## S29 — demo account email aliases (DEP-041)

Evidence: `docs/SUQPAGE-DEMO-ACCOUNT-ACCESS.md`; protected one-time plan,
rehearsal, apply journal, full reconciliation and real-app session checks under
`.local/demo-account-emails-20260923/`. All 79 local / 77 hosted demo accounts
use distinct owner-inbox aliases; 32 / 30 missing provider links created. Real
accounts, existing UUIDs/links and 13 tenant/public/role tables per target unchanged.
Admission, collision and bounded-alias negative checks pass. Existing/newly linked
owner, administrator, operations and team sessions pass actual app OTP verification,
dashboard and sign-out locally and live; owner product lists load. Health 200.
Spec validation passes (154 isolated / 160 working). No delivery test, app deployment, schema or Auth
configuration change. Source/operational evidence isolated from pending S26–S28.

S28 release evidence (FE-050/BE-042/DEP-039; FE-051/BE-043/DEP-040):
`docs/SUQPAGE-S28-RELEASE-2026-09-23.md` records commit `90094c6`, live deploy
`6ab3c4e43c9a7f1e972648ad`, full check/release/operations, all nine isolated
provider acceptance tests, archive privacy/Linux transform, production backup/
restore/migration/reapply, preserved rows/aliases and runtime preflight. Fifteen
public and nine gallery/owner/handle/wordmark checks plus settled slide alignment
and health monitoring pass. Reviewed desktop/390/320 captures remain protected
under `.local/publish-s28-20260923/screenshots`. No test email sent or merchant
content changed; actual external video playback/inbox delivery not claimed.

| Launch clarity and contextual interface writing | FE-052, FE-049 | BE-001, BE-032 | DEP-030 | Owner inquiries, discovery, demo labels, first publication, locale catalogs | scripts/test-launch-clarity.ts; scripts/capture-launch-clarity.mjs; docs/SUQPAGE-LAUNCH-CLARITY-REVIEW.md (local; visual/full/release gates pending) | in_progress |

FE-052 scenario 8 / FE-030 Market copy: narrative, seven localization tests and
161-spec validation pass; seven focused header states cover all five languages
at 320px and English at 390/1440 without overflow. Evidence and retained-label
review: `docs/SUQPAGE-LAUNCH-CLARITY-REVIEW.md`. Visual approval/deployment pending.

FE-052 scenario 9 / FE-030 map previews: typecheck, localization/spec validation
and discovery regression pass. Eight local viewport/locale states, two actual
pointer-marker states with the drawer open, and four nearby component-fixture
states pass; see `scripts/capture-map-preview.mjs`,
`scripts/capture-nearby-preview.mjs` and the launch-clarity review for scope and
fixture limitations. Local implementation only; owner visual review pending.

## FE-019 / BE-018 — separate support channels and staff queues (S34, 2026-09-24)

Implemented locally: external fixed-channel launchers, independent HttpOnly
sessions and private attachments, staff queue scope, capacity-safe assignments,
assigned-team transport handoff, assignment history and visitor unread attention.
Migration 53 applied locally; production remains schema 50. Four support suites
pass, including API isolation and concurrent capacity. Seven public browser states
(all five languages at 320px, English 390/1440), existing retry/transport browser
flows, and real local staff/admin claim/reply/handoff/close/reopen/reassign/settings
actions pass. Mobile Assign overflow reproduced, corrected and reverified.
Typecheck, seven localization tests, narrative and 161-spec validation pass.
Protected evidence: `.local/support-channels-review/`; temporary browser accounts
and cases removed. Procedure: `docs/operations/SUPPORT-AND-TRANSPORT.md`.
Visual approval/full/release/acceptance gates, commit and rollout remain pending.

## FE-019 / BE-018 — transport callback receipt (S35, 2026-09-24)

S35 supersedes visitor transport chat: four-field request → receipt and phone
follow-up, with another-route action, no polling/transcript/composer/End chat.
Existing staff routing/history/handoff remains; transport messages are private
notes. Public reads hide notes/files/agent names and reject transport replies and
close. No migration added. All four support suites, transport browser flows at
1440/390/320, seven public locale/viewport cases and Help retry browser checks
pass. Typecheck, seven localization tests, narrative and 161-spec validation pass.
Receipts inspected in `.local/transport-support-review/submitted-*.png` and
`.local/support-channels-review/receipt-*.png`. Full/release/visual approval and
rollout remain pending; implementation is local, not deployed.

Real local staff browser actions also pass private transport note, Help reply,
claim/handoff/close/reopen/reassignment and settings; temporary fixtures removed.

## FE-019 / BE-018 — Buying assistance (S37)

Public transport intake is replaced by Get buying help: Buy for me, Check a
business, or Check product quality; name, phone and details; callback receipt.
Migration 54 preserves historical transport requests and adds constrained buying
service data. Existing scoped assignment, capacity, claim, private notes,
close/reopen and reassignment apply to the Buying assistance queue.

Evidence: `npm run test:support` (five suites), `scripts/test-native-postgres.ts`,
typecheck, localization, narrative and spec validation pass. Actual handlers in
`capture-buying-assistance.ts` prove persisted intake, no polling, lost-response
recovery and another request at 320/390/1440. Real staff/admin browser actions and
15 locale/viewport form states pass; screenshots and receipts under
`.local/buying-assistance-review/`. Local schema 54 is applied, preserving existing
business data. No hosted change, email or payment was made. Visual approval,
full/release gates, commit and deployment remain pending. Staff procedure:
`docs/operations/SUPPORT-AND-TRANSPORT.md`; rollout: DEP-026.

## FE-019 / BE-018 — one Buying assistance request (S38)

Supersedes S37's service selector. Name, phone and details create a general Buying
assistance case; schema 55 preserves old classifications. Focused buying request
PG/API tests, typecheck/localization/spec validation and 320/390/1440 persisted
intake/receipt/retry browser checks pass. Evidence:
`.local/buying-assistance-review/`. Visual approval, release gates, commit and
production rollout remain pending.

## FE-019 / BE-018 — owner-only live support (S39)

Public Help is removed, with a buying-only request component and HTTP boundary.
Only `channel=buying` can start/read/reset callback requests; public legacy chat
and all public attachment routes are retired. Owner dashboard support retains
scoped conversations, replies and attachments. Historical visitor messages become
private staff notes in the workspace; records are preserved.

Evidence: five support suites, typecheck, localization, narrative and specs pass;
`test-support-channels.ts` verifies retired-route bypasses and unchanged records;
`test-support.ts` covers owner/staff behavior and tenant isolation. Browser evidence
under `.local/owner-only-support-review/` confirms all four public surfaces and
retained owner support; `.local/buying-assistance-review/` verifies receipt/recovery
and fifteen locale/viewport forms. No migration or hosted rollout. Visual/release
gates, commit and deployment remain pending.

## S40 — showroom value and result filters (2026-09-25, local)

FE-030 / FE-052 use one compact Market introduction and an owner-facing About
promise, localized in five languages. Products & services and Businesses are
checkbox filters above one result list; existing server pagination/ranking and
map state are preserved. Category/place rows do not overlap; buying assistance
uses a compact accessible icon beside an open narrow-screen drawer. Short
landscape map controls use two columns.

- `capture-market-filters.mjs`: 15 width/locale combinations (320/390/1440,
  en/am/om/so/ti) pass type selection, last-selection protection, query/type
  URLs, pagination/reset, history, label reachability and overflow checks.
  Landscape scope/result reachability passes. `.local/market-filters-review/`
  retains screenshots and verified records; desktop/phone captures inspected.
- `capture-category-pagination.mjs`: all three widths pass category results,
  retained map, server paging, type change/reload and scoped WCAG checks.
- Short-landscape map/help separation additionally checked at 844×390 after
  adjusting the map controls. An extra tile-ready screenshot run hit a 20s
  external tile timeout at 1440/om; isolated retry loaded tiles with no failed
  requests. Provider availability is not guaranteed by these UI checks.
- Typecheck, homepage composition, narrative/category artwork, localization
  (1,111 strings per translated catalog), 161-spec validation and whitespace
  checks pass. Existing human/typo/drawer capture selectors were updated for
  checkboxes; those entire historical suites were not rerun in S40.
- Prior pending changes and unrelated `deno.lock` remain. No schema/data changes,
  new dependency, full/release gate, commit or deployment. Owner visual approval
  remains the next gate; these local results do not describe production.

## S41 — visible clearable category sets (2026-09-26, local)

FE-030 / FE-042 / BE-023: `discovery-contract.ts` canonicalizes bounded single,
comma-separated and repeated category input; `discovery.ts` and
`spelling-search.ts` use parameterized membership EXISTS/ANY for exact/fuzzy
queries, suggestions, map rows, counts and paging. `public-discovery-cache.ts`
uses canonical v8 keys; the public route accepts repeated category parameters.
No schema change or data rewrite. Location is retained when a new category scope
has zero matches. CategoryChooser and DiscoveryWorkspace place visible clearable
scopes side by side; All categories is an empty-state label, not a menu item.

Passing evidence:
- `test-discovery-multicategory.ts`: real isolated PostgreSQL category union,
  duplicates, invalid/repeated input, single-key compatibility, exact/fuzzy scope,
  private/excluded/unpublished/unapproved records, complete bounded pagination,
  retained zero-result location and clearing. Included in test:discovery-pagination.
- Existing ranking, spelling, 21 human-query variations and six pagination tests
  pass. The broader test-discovery.ts completed geographic/Featured assertions
  (10,000-row grouping 1414.1ms) but failed during fixture cleanup; its complete
  process is NOT recorded as a passing gate. Timing diagnostics reproduced a
  passing ranking run without changing any timeout; CREATE/DROP fixture operations
  were slow. Release checks must resolve the local test-infrastructure limitation.
- `capture-multicategory-filters.mjs`: 14 initial viewport/locale cases passed;
  1440/ti passed its targeted retry after a navigation timeout. Three-width
  English scoped WCAG checks pass. A scoped selector correction allowed the
  separate landscape/repeated-parameter/menu-reachability check to pass.
  `.local/multicategory-review/` contains screenshots, targeted case evidence,
  `case-landscape-verified.json` and `keyboard-clear.json`; the latter also proves
  removing the last category and clearing query preserve location. Menu and
  phone/desktop/landscape screenshots inspected. No customer data changed.
- Typecheck, homepage composition, 1,114-message localization catalogs, 161-spec
  validation and whitespace checks pass. Current launch/market capture selectors
  reflect visible controls; full historical visual suites were not rerun.

No new dependencies, hosted changes, full/build/release gates, commit or deployment.
Visual approval is pending. Existing S31–S40 changes and unrelated deno.lock remain.

## S42 — live buying and mobile preparation (local, 2026-09-27)

FE-019 / BE-018 / ADR-0023: schema 56 and explicit visitor-visible staff replies;
existing notes stay private. `test-buying-assistance.ts`, all five `test:support`
suites and `test-native-postgres.ts` pass. Route guards, stale-tab binding,
idempotency/conflict, expiry, closure, assignment and channel/privacy checks map
to S42 acceptance criteria. `capture-buying-assistance.ts` verifies actual handlers
against isolated PostgreSQL at 320/390/1440; final phone retry includes lost reply
response. Screenshots in `.local/live-buying-review/`. Typecheck and localization
1,117 messages pass. Local 68 businesses preserved at schema 56. No production
writes, WebSocket claim, native build, commit or deployment. Expo preparation and
API/adapter inventory: `docs/MOBILE-MONOREPO-PREP.md`. Full/release gates await
visual approval; the earlier S41 broader-test cleanup timeout remains documented.

S42 staff browser evidence: `scripts/capture-live-buying-staff.ts` used a temporary
local Supabase Auth staff identity and case. Actual server-action Reply/Internal
note submissions pass with visitor privacy checks and 390/1440 screenshots;
fixtures were removed. `.local/live-buying-review/staff-*.png`.
Final S42 phone check also passes simulated refresh outage warning/recovery and
lost-reply-response retry. Staff Send scrolls fully above mobile navigation.
Final localization (1,117 messages), typecheck, spec validation and whitespace
checks pass. No full/build/release gates or deployment have run.

## S44 — conversational buying entry (2026-09-27)

FE-019 / FE-049: chat launcher and Live chat header, message-first intake,
Start chat, server-acknowledged Sent and Chat connected indicators. No presence,
read-receipt or response-time fabrication; no backend/schema change.
`capture-buying-chat-entry.mjs`: ten entry states/five languages, keyboard focus,
reachable controls and English scoped accessibility. `capture-buying-assistance.ts`:
three viewport workflows plus final five-language phone conversation, reconnect,
idempotent reply retry, closure/reopen and another request after reload. Typecheck,
narrative, 1,125-message localization, specs and whitespace pass. Evidence:
`.local/buying-chat-entry-review/`, `.local/live-buying-review/`.
S43 deployment remains authorized; the new visual change awaits review before its
gates. The first S43 source snapshot is stale. No production mutation or deploy.

## S45–S46 — end chat, stable name and waiting guidance (2026-09-27)

FE-019 / BE-018 / FE-049: Buying assistance keeps its service name with Live chat
beneath it. Message-first intake opens a saved conversation; a highlighted waiting
state persists through automatic assignment until a public staff reply. Return
guidance describes automatic replies without promising staff presence or speed.
Visitor End chat validates token, origin, channel and public reference; closure
is idempotent, releases assignment and preserves messages and private notes.

Evidence: all five `test:support` suites pass, including duplicate close, foreign/
missing token and mismatched reference, closed-message rejection and staff reopen.
`capture-buying-assistance.ts` passes 320/390/1440 intake, waiting, actual staff
reply, reconnect, lost-response retry, dismissal without closing, End chat, staff
reopen and new-request recovery. It uses actual handlers and an isolated local
PostgreSQL fixture; no external messages. `capture-buying-chat-entry.mjs` passes
five-language 320/1440 label ordering, accessible name, controls/focus and English
scoped accessibility. Conversation locale checks pass on phone. Typecheck, 1,127
message localization, narrative, spec validation and whitespace checks pass.
Screenshots: `.local/live-buying-review/waiting-{320,390,1440}.png` and
`.local/buying-chat-entry-review/launcher-{320,1440}-{locale}.png`.

Implemented and focused-tested locally; visual approval, full release gates,
commit and S43 deployment remain pending. No production writes. Unrelated
`deno.lock` remains untouched.

## S47 — retained buying history and explicit resolution (local, 2026-09-27)

FE-019 / BE-018 / FE-049: Active, Chat history and Resolved are paginated staff
views. Visitor closure retains name/phone, original intake, assignment and stored
messages. Staff can add private phone-follow-up notes while closed; public replies
remain disabled. Mark resolved is audited/idempotent and separate from visitor
closure; reopen clears resolution with existing assignment/capacity enforcement.
Original intake is fetched independently of the bounded recent-message transcript.

Evidence: all five support suites pass (buying suite rerun after correcting its
expected cumulative resolution-event count for an earlier close/reopen cycle).
New regression checks cover retained phone/intake, phone search, active/history/
resolved filtering, forbidden staff, private ended-case notes, duplicate resolution,
closed-message denial and constraint-protected reopen. Native PostgreSQL install
and idempotent preservation pass. Additive migration 57 applied only locally,
preserving 68 businesses; existing closed records default to unresolved.
`capture-live-buying-staff.ts` passes actual authenticated server-action note,
resolve and reopen flows, contact/summary retention, history/resolved search and
phone/desktop layout. `capture-buying-assistance.ts --phone-only` passes public
chat, retry, ended/reopened cases and session recovery with private notes excluded.
Typecheck, 1,133-message localization, specification validation and whitespace pass.
Screenshots: `.local/live-buying-review/staff-history-{390,1440}.png`,
`staff-ended-{390,1440}.png`, `staff-resolved-390.png`. All browser data is local
test fixtures; temporary staff accounts/cases removed, no external messages.

Visual approval, full build/release gates, coherent commit and authorized S43
production rollout remain pending. Preflight now requires migration 57. No hosted
writes, deploy or Git publication in this iteration; unrelated deno.lock preserved.

## S48 — reviewed owner videos (local, 2026-09-27)

FE-019 / BE-018 / BE-032 / BE-039 / BE-040 / BE-042 / FE-046 / DEP-039.
Implementation: `lib/support-video-requests.ts`, `lib/video-request-policy.ts`,
migration 58, owner/product save adapters, support actions
and owner/staff forms. Signup and invitations now use the same single starter
video as new products. Existing admitted media is preserved. Requests work without
an official channel, and staff can approve supported YouTube URLs from any
channel. No channel setting or confirmation is required; no YouTube API is claimed.

Focused evidence: `scripts/test-video-requests.ts` passes target/tenant/staff
isolation, invalid URL and forged saves, approval without channel setup,
idempotent decisions, stale-target handling, retained text and distinct draft/
public content. `scripts/test-business-starters.ts` passes exact starter video,
signup/invitation completeness and rollback. `scripts/test-owner-page-postgres.ts`
passes permission revocation, stale version handling and publication preservation.
Its prior blanket draft-publication denial was stale: incomplete drafts now reject
readiness while suspended businesses still cannot publish. Disallowed video saves
roll back atomically after permission/version checks.

`scripts/capture-video-requests.ts` passes actual owner request submission,
invalid-URL return to the same form, agent assignment, manual approval,
staff reply/decline and unchanged public example at 390/1440. Private screenshots:
`.local/video-request-review/`. Temporary identities and requests removed.
Typecheck/spec/localization, gallery, native PostgreSQL and scale checks pass.
Local schema 58 preserves all 68 businesses. Visual approval and refreshed full
release/acceptance/operations gates remain pending; nothing from S48 is deployed.

### S43/S48 pre-publication audit — 2026-09-27

The owner approved the cumulative web release and S48 visuals. Locked install,
release/build, operations restore, exact artifact privacy/source matching and Linux
native image transform pass. Complete check-chain continuation passes unchanged
after the demo fixture's initial timeout. Eleven production-mode browser workflows
pass across the original run and focused owner/video reruns. The owner fixture now
replaces sample details before Publish; video decline waits for server completion.
The real buying browser case includes anonymous intake, automatic staff reply,
private-note denial, End chat, retained history, resolution and reopening.
Production schema 50→58 rehearsal preserves all 3,821 original rows across 57
tables, verifies restricted video-request access and repeat migration no-op.
Evidence and rollout limits: `docs/SUQPAGE-RELEASE-2026-09-27.md`; protected raw
evidence: `.local/publish-s48-20260927/`. Hosted schema 58 and Netlify deployment
`6ab98e309c70ac17fe871293` are verified against source `d2ebacd`. Live 19-route,
39-layout/language, buying intake and map/drawer preview checks pass; monitored
health remains good. The initial edge-502 and successful read-only recovery checks
are recorded in the release document. No Auth/configuration recovery write occurred.

## S49 — mobile implementation in progress

FE-053 / BE-044 / DEP-042 define Expo visitor and owner screens, versioned API
authority and staged npm workspaces. ADR-0023 applies. Admin/staff management stays
on web. Focused bearer/role/tenant/body/projection contract tests and isolated local
PostgreSQL signup/page/offering/inquiry/support/video/buying tests pass through
`npm run test:mobile`. Web/mobile TypeScript and seven localization checks pass.
Android/iOS JavaScript exports and 13 browser workflow checks (including real
local Supabase OTP verification) pass. Screenshots: `.local/mobile-review/`.
These exports are not signed binaries. Android also compiled/rendered in Expo Go,
but repeated emulator System UI/Expo Go ANRs prevented a clean workflow pass;
physical device execution is unverified. Device checks, visual approval, full gates,
remaining native parity and API rollout remain pending in S49; see
`docs/MOBILE-TESTING.md` for environment commands and dependency limits.

### S49.1/S49.2 — phone-web alignment and embedded video (2026-09-28)

FE-053 remains in progress. `apps/mobile/src/chrome.tsx`, tab screens, native/web
map adapters and showroom now follow the approved phone web structure. Separate
YouTubeVideo/YouTubeFrame adapters embed approved cover/gallery videos without
external handoff; provider-reference authority reuses `lib/youtube-provider.ts`.
ADR-0023 records the isolated Expo-compatible WebView decision; DEP-042 retains
actual native playback/build gates.

Focused evidence: mobile typecheck; seven localization tests; 165-spec validation;
nine grouped `capture-mobile-alignment.mjs` checks and 13 existing
`capture-mobile.mjs` browser workflow checks pass. Three `test:mobile:video` cases
prove reference/HTML validation, outbound navigation denial and bounded bridge
messages. `capture-mobile-video.mjs` passes provider-fixture cover/gallery mounting,
error/retry, media/navigation cleanup and no external windows. The real YouTube
embed rendered in the local browser; automated playback attempts were inconclusive
(frame/button readiness timeout), so actual playback is not marked verified.

Review evidence: `.local/mobile-alignment/` and `.local/mobile-review/`; findings and
native adaptations in `docs/MOBILE-WEB-ALIGNMENT.md`. These replace the rejected
initial visuals. Visual approval, native device/fullscreen checks, full gates,
scoped commit and deployment remain pending. No hosted changes; deno.lock untouched.

S50 continuation: owner authorizes audit/build preparation. Mobile typecheck,
seven localization checks, `test:mobile` (real isolated PostgreSQL logo conflict/
removal and support attachment retry/cross-tenant tests included), and
`test:mobile:build` pass. Clean locked install and production dependency audit pass
with zero advisories; version-checked query-string import adapter preserves the
fixed ESM decoder. Full `check` passed before the native map replacement; release/acceptance/native playback/APK
and API rollout remain pending. Expo project ownership and preview signing were
independently verified under `falmatad`; native MapLibre build/device verification remains pending. See MOBILE-RELEASE-AUDIT and MOBILE-DISTRIBUTION. No production rollout.


S50 MapLibre continuation (2026-09-28): the owner clarified that SDK-internal
SQLite caching is allowed; application data remains PostgreSQL. FE-053/BE-044/
DEP-042 and ADR-0023 were updated before replacing the unshipped map WebView.
MapLibre 11.4.0 is installed with its Expo plugin and Expo-compatible development
client. `test:mobile:map` (run through Node's tsx loader), mobile typecheck,
`test:mobile:build`, spec validation, Expo Android prebuild and Android JS export
pass. Tests cover public-only GeoJSON, invalid coordinates, stable city offsets,
exact/zero coordinates, current-result selection and zoom bounds. The web map
remains Leaflet. Native compilation and installed-device review are pending;
no signed tester artifact or rollout is claimed by these checks. Research/source
links and constraints: docs/MOBILE-MAP-RESEARCH.md.

Native MapLibre Android Kotlin/Java and complete debug APK compilation passed
for arm64-v8a and x86_64 on 2026-09-28 (Gradle 9.3.1, NDK 27.1.12297006,
CMake 3.22.1). This is a local development client, not a standalone tester release.
Nine alignment groups, including unobscured attribution, and 13 local browser
workflow groups pass. Final packaged manifest and API 35 emulator install/render/drawer verification
pass on 2026-09-29. Evidence: `.local/mobile-maplibre-review/`; development APK
checksum and remaining device/release limits: MOBILE-MAP-RESEARCH.md. Actual
phone gestures/offline recovery, owner native visual approval and tester rollout
remain open.


### S50 owner workflow and marker parity (2026-10-05)

FE-053 / BE-044 / BE-040 / DEP-042 remain in progress. Fixed reserved Expo route
parameter (`owner/[section]`), separate read/write budgets, authenticated browser
photo loading and native listing-state updates with advanced metadata preserved.
Private preview reuses ShowroomContent; Featured refreshes on tab return. MapMarker,
map-markers and native/browser adapters reproduce storefront labels, clusters,
nearby lists, selected/presence states and non-zooming-out focus.

Passing evidence: strengthened `capture-mobile.mjs` (13 groups),
`capture-mobile-owner.mjs` (real local photo/save/hide/location/publication),
`capture-mobile-markers.mjs` (fixture clusters/nearby/preview), nine alignment groups,
mobile typecheck, marker/provider unit tests, `test:mobile`, existing product-upkeep
and gallery regressions, 165-spec validation. Earlier screenshot-only owner
navigation evidence was insufficient and is superseded. Android renders the new
markers and opens Prairie Meadows on tap; captures under `.local/mobile-owner-review/`.
Map visual review, physical-device flows, final release and API/APK rollout remain
open. Next patched locally to 16.3.6; Expo tooling advisories remain an unresolved
release gate (MOBILE-RELEASE-AUDIT.md). No commit, hosted mutation or distribution.

Final focused checkpoint: web/mobile typechecks, seven localization tests,
mobile build-config/dependency checks and runtime validation also pass. Native map
model no longer imports the SDK's React Native ambient globals into the web test
compilation. Current sources still await full release gates and scoped commit.

### S51 local sponsor rotation and storefront narrative — 2026-10-05

FE-036/FE-033: components/SponsorCarousel.tsx and its CSS replace the old
mobile-only rail timer; lib/use-sponsor-rotation.ts shares six-second turns with
apps/mobile/src/SponsorCarousel.tsx. Broadcast agendas retain their scheduled
sponsor mapping. FE-052/FE-049/FE-053: lib/storefront-copy.ts shares Market and
separate customer/business About sections across both clients. Customers often
already know/follow the seller and want its organized offerings; no map/search
features or tenant/API authority changed.

scripts/capture-sponsor-rotation.mjs verifies equal cycles, interaction/pause,
manual wrap, document visibility/offscreen, zero/one/pool changes and reduced
motion with controlled sponsor fixtures, plus actual Expo browser rendering.
scripts/capture-storefront-copy.mjs records 69 final local desktop/phone/language
states, touch-sized controls, audience actions/jump navigation and overflow;
OSM tiles are stubbed, local catalog images are real and no data is written.
Screenshots: .local/sponsor-storefront-review/; copy-verification-all.json is the
latest version after the owner's audience clarification, superseding 64 draft
captures. Web/mobile typecheck, narrative/homepage, eight localization tests
(1,228 messages per locale), and 165-spec validation pass. Independent human
language review is not claimed. Native device/owner visual approval/full gates,
commit and rollout remain pending; preserve S49/S50 work. Emulator closed at
owner request; web/API previews remain on ports 8082/3102.

| FE-054 | approved prototype and local implementation: showroom-projects/accent-personalization-preview/ | check-preview.mjs: seven presets, 4,096 contrast samples, 1440/390/320; reviews/REVIEW.md and verification.json; scripts/test-storefront-accent.ts + capture-storefront-accent.mjs: signup/save/publication/native and 12 captures pass; full check/build/security and two production acceptance scenarios pass; S53 Page-only visual picker: test-visual-color.ts, both typechecks, eight localization tests and 13 updated captures in .local/storefront-color-refinement/ pass; corrected visual approval pending before repeat full gates; release blocked by existing Expo dependency audit; device/commit/rollout pending |

| S54 offering-only Market results | FE-030 / FE-042 / FE-053 | BE-044 | — | public-discovery-cache.ts and mobile/router.ts select product SQL pagination before public counts; DiscoveryWorkspace and native Market remove business cards/type controls; filtered map unchanged | Both typechecks; test:discovery-pagination (category/rank/spelling/human queries and 7 pagination scenarios); capture-offering-results.mjs: real HTTP legacy-type/count/map/last-page/search, web pagination/empty states and 5 reviewed 1440/390/320 captures in .local/offering-results/. Controlled OSM tiles; actual data/markers. Visual approval/full-release/device/commit/deploy pending. | in_progress |

| S55 floating discovery controls | FE-030 / FE-053 | — | — | DiscoveryWorkspace and native Market share active controls between map-only and open product list; existing backend filters unchanged | Both typechecks, homepage composition; capture-floating-discovery-controls.mjs: closed/open search, filter clearing/retention, one control set, persistent map DOM and immediate closed-view reload; 10 stable desktop/390/320 screenshots in .local/floating-discovery-controls/. Native browser only, controlled tiles. Visual/full-release/device/commit/deploy pending. | in_progress |

| S56 compact discovery toolbar | FE-030 / FE-053 | — | — | Shared horizontal header: result toggle, search, compact category and place triggers; menus retain selection and clear; map tools and results below | Both typechecks, homepage composition; capture-compact-discovery-toolbar.mjs --web/--native: six web and four native-browser captures, alignment, panel modes, filtering/clearing and closed-view reload; .local/compact-discovery-toolbar/. Controlled tile imagery, real local catalog. Device/visual approval/full-release/commit/deploy pending. | in_progress |

| S57 multiple locations + transport dispatch | FE-030 / FE-019 / FE-053 | BE-019 / BE-018 / BE-044 | — | discovery-contract/discovery/spelling-search/cache, compact web/native pickers; transport public/mobile API, support lifecycle, migration 59, dispatcher UI and authored five-language copy | test-multiple-locations + focused discovery suites; support suites + test-live-transport; capture-multiple-locations --web/--native, capture-live-transport, capture-transport-dispatch-staff and capture-mobile-transport. Local screenshot evidence in .local/multiple-location-review/ and .local/live-transport-review/. Both typechecks/localization pass; visual/language/device/build/release/commit/deploy pending. | in_progress |

| S58 paired transport intake | FE-019 / FE-053 | — | — | Highlighted route pair, contact pair, compact optional details; Suqpage styling retained | Both typechecks; eight localization tests; capture-transport-intake-layout + --short: 15 desktop/phone/language/short-height captures in .local/transport-intake-layout/; web/native real-handler chat submission/reply/end checks pass. Visual approval/device/native-speaker/full-release/commit/deploy pending. | in_progress |

| S59 coordinated release checks | FE-019 / FE-030 / FE-053 | BE-044 | DEP-042 / DEP_BASE | Source-map security patch; corrected obsolete narrative/discovery assertions; verified Expo public runtime settings | Clean install, complete check-chain with documented continuations/one isolated fixture retry, mobile API/type/build/map/video, production build/trace/provider smoke and release steps preceding audit pass. Full workspace audit remains blocked on two upstream mobile-tool advisories; root-only audit is diagnostic and clean. Browser coverage: nine isolated workflows plus corrected category/search captures at 1440/390/320 against production build/existing local providers; isolated retry failed at temporary Storage startup. No app rollout. | in_progress |

## FE-055 / S60 — account deletion request entry (in progress)

Dedicated web/native entries and public request instructions reuse the existing
privacy contact. Both typechecks, localization and spec checks pass.
`scripts/capture-account-deletion.mjs` passes 13 web/native-browser layouts across
five languages, anonymous access, privacy navigation and incomplete-setup native
account navigation. Captures: `.local/account-deletion-review/`. Visual approval,
physical email handoff and manual fulfilment verification remain pending; no
automatic deletion or public-store readiness claim. See the S60 checklist.

## S61 — isolated web release boundary (DEP-026 / DEP-042)

Clean root/shared lifecycle installation, zero selected full-audit findings,
`test-web-install.cjs`, Netlify readiness and mobile adapter regression pass.
`npm run check` and all 11 browser acceptance scenarios pass in one isolated run.
Web release prefix through provider smoke plus its unchanged local-URL continuation
passes all stages. Operations restore tests and production-backup migration 59
rehearsal pass with existing data preserved. Final packaged Linux Sharp transform,
128 trace privacy checks and archive native-tool exclusion pass. FE-055 focused
13-state evidence is accepted for inclusion by the owner's latest release request.
Publication is pending; native audit remains failed, with no implicit exception.
See docs/SUQPAGE-RELEASE-2026-10-06.md and S61 checklist.

S61 scoped-template regression: `node scripts/test-staged-template.mjs` permits
only the exact mobile localhost/blank-key example, rejects populated keys, extra
secret fields, undeclared paths and real nested environment files.

S61 packaging correction: first deployment was rolled back after live 502 errors;
schema 59 retained and previous health verified. `test-netlify-function-cache.mjs`
checks immutable ZIP bytes and rejects digest/path/bundler/runtime drift. Enhanced
`test-netlify-native.mjs` passes complete handler initialization and Sharp transform
on the existing reviewed archive. Draft verification precedes the next promotion.

S61 web publication verified: deploy `6ac519154e7f2c72e452f5be`, source `71d88a1`
plus packaging fix `8361f13`, schema59; 28 live API/page/boundary checks and
1440/390/320 browser rendering checks pass. Full handler extraction preserves
relative ZIP symlinks. The first rollout was restored before correction; draft
configuration isolation and explicit local cache fixture limits are recorded in
docs/SUQPAGE-RELEASE-2026-10-06.md. Android distribution remains pending.


## S62 — internal APK exception and patched dependencies (DEP-042)

Owner explicitly approved one Expo internal APK with the unchanged braces /
node-forge advisories. The audit remains failed: 20 high graph findings from those
two roots, no critical findings; no broader exception or Play submission.
New sharp/shell-quote advisories were remediated with sharp 0.35.5 (librsvg
2.63.2) and shell-quote 1.12.0. Normal locked install,
`scripts/test-release-dependency-security.cjs`, security integration, mobile
type/contracts/PostgreSQL API/build/map/video checks pass. A fresh Android export
contains 1,561 sources and excludes server runtimes and the two affected tool
packages. Expo identity, free plan and preview public configuration readback pass.
The patched isolated `npm run release:web` passes end to end, including provider
smoke, scale, migration, security and zero-finding web audit.
Patched web deploy `6ac52555a812ad5c89621401` passes exact Linux artifact checks,
28 live checks and 1440/390/320 rendering checks. EAS archive inspection caught
the literal `.git` exclusion mismatch; 4550be8 corrects it with an ignore-semantics
regression. The corrected archive has 1,482 files and no checked private paths or
Git metadata. Expo accepted build `2018cc70-edef-472c-8aca-06db2699fe84`,
preview/internal, version 0.1.0 (1), existing signing credential and production API.
Private receipts: `.local/release-s62/`. APK completion and native-device evidence
remain pending; a submitted build is not a delivered APK.


## S63 — clearer storefront narrative (FE-052 / FE-049 / FE-053)

Shared customer copy explicitly names businesses followed on social media, their
map locations, organized products/services and direct contact to order without
post clutter. Owner About/account copy explains a professional store for followers.
English plus contextual Amharic/Oromo/Somali/Tigrinya use the existing catalogs;
merchant content and discovery behavior are unchanged. Root/Market/About metadata
uses the same selected-locale narrative.

Web/mobile typechecks, `test:narrative`, eight localization tests (1,255 messages),
`validate:specs` and `capture-storefront-copy.mjs --copy-only` pass. The final run
captures 69 states across 1440/390/320 web and Expo browser mobile in all locales,
checking metadata, customer/owner navigation, copy presence and no overflow or
page errors. Private evidence `.local/copy-s63/screens/` uses stubbed basemap tiles
and real local catalog reads. Initial retired-selector, stale-Metro and full-page
locale-reset capture failures are retained; the passing run uses the real mobile
CTA navigation. No native-device or human language-review claim. Owner visual
approval, full release gates and rollout remain pending; the S62 APK excludes S63.

## S64 — location badges and business attribution (FE-030 / FE-053 / FE-049)

`DiscoveryWorkspace.tsx`, `discovery.css` and mobile Market use the existing
normalized location selection count. Native category badges now also show counts.
Product cards have separate product and localized business-store links, using
existing authorized result handles with no API, persistence or ranking changes.
Five-language business attribution preserves merchant names. Older browser
selectors now distinguish product targets from store links and measure full cards.

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

## S65 — native external browsing (FE-053 / ADR-0023)

`apps/mobile/src/link-policy.ts` defines URL/text/launch contracts;
`open-link.ts` adapts existing Expo WebBrowser and React Native Linking.
`ui.tsx` supplies localized launch errors and literal description links;
showroom/product/contact/sponsor/policy/owner callers use the shared adapter.
Existing YouTube isolation, inquiry state and API authority remain unchanged.

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

## S66 — verified incoming Suqpage links (FE-053 / DEP-042 / ADR-0023)

`public/.well-known/assetlinks.json` contains the verified public preview package
and signing fingerprint. `link-config.cjs` enables HTTPS autoVerify only for
registered identities. `incoming-link.ts` and `+native-intent.tsx` validate/map
public URLs; mobile Market restores bounded link scopes without replacing normal
interactive state. Authority remains in existing catalog/session adapters.

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

## S67 — preview-first setup and contextual locales (FE-049 / FE-051 / FE-053 / DEP-042)

Native Setup passes the preview view into OwnerScreen/PageEditor; normal editor
entries remain forms. Shared catalogs clarify inquiry actions, transport, retry
and video-loading terminology while preserving merchant values. Hidden Sheet
unmounts its focus boundary. Real five-language browser tests reproduced focus
being retained on Close after locale switches; the lifecycle correction passes
actual contact deletion/save/re-entry and first publication without weakening
publication readiness. No backend initializer, schema or hosted Auth change.

Focused evidence: starter PostgreSQL completeness/privacy/rollback tests pass;
mobile API/contracts, link/map/video/build tests pass. Eight localization tests
cover all 1,257 keys in four non-English catalogs. Five-language public copy
capture passes 69 web/Expo viewport states. Updated capture-mobile-owner.mjs
passes essential setup and initial preview in all five locales, literal merchant
values, photo upload/private draft, persisted contact removal, service creation/
update/hide, city save and first publication. Screenshots and protected logs:
.local/rebuild-s67/, .local/mobile-owner-review/, .local/copy-s63/screens/.
Browser and catalog checks are not independent native-speaker/device signoff.
Final full check passes. Production build/66 trace privacy, provider-backed HTTP
smoke (after one isolated service-start retry), release behavioral/security gates
and all 11 production-mode acceptance workflows pass. The unchanged release audit
fails only on the two approved tooling roots (20 high, zero critical); final Hermes
export excludes both from 1,569 runtime sources. Acceptance server emits canceled
stream messages only after the passing suite and shutdown. Rebuilt APK/signature/
OS verification are recorded below; the finished artifact exposed the S69 SVG defect.


## S68 — saved logo-led demo accents (FE-054)

Owner-approved one-time data correction applies only to existing active marked
demos: 66 local / 64 production. All existing illustrative logos/briefs were
inventoried before choosing their lead accent. Non-demo denial, stale second-row
atomic rollback, full positive rollback and preserved unrelated table fingerprints
pass in the local rehearsal. Guarded apply appends draft versions/events and
publication/audit history without rewriting earlier records. All 132 local
1440/390px saved states pass color/overflow/browser checks; all 66 native API
values match. All 64 live HTML/native API projections match, health 200. Two
local-only handles have no current hosted business or registry rows and remain
absent. No seed/schema/config/Auth/media/account change. Per-demo reviews and
operational evidence: docs/DEMO-ACCENT-ROLLOUT-2026-10-06.md; protected plans,
before-state, rollback and verified receipts: .local/demo-accent-review/.


### S67 installed artifact evidence

Expo build 4d6df1a5-795a-4f80-999d-feaa0b679f22 finished from c1872d5. Clean archive
has 1,493 files with no private paths; 1,569 Hermes runtime sources exclude both
audit roots. APK signature matches the registered preview identity; decoded
bytecode contains only SDK secret-prefix validation markers, no secret values.
Android reports suqpage.com verified; cold filtered Market and warm product/store/
Featured HTTPS intents land in the actual preview app without forcing its package.
Gallery selection/back, saved accent, all five locale switches and native Custom
Tab return pass. Available honey video plays within the app. Aloe's existing
example video is unavailable (thumbnail 404), with a visible bounded retry state.
Native review caught owned SVG logos/illustrations blank: S69 correction and a
replacement artifact remain required. No physical-phone/email/social-handler or
independent native-speaker signoff. docs/MOBILE-DISTRIBUTION.md records build/
checksum/limits; private source/signature/screenshots: .local/rebuild-s67/.


## S69 — native owned SVG rendering (FE-053 / DEP-042)

Photo routes strict owned seed SVG paths to the installed react-native-svg adapter;
all other web/raster/private paths remain in Image. test-mobile-static-svg.ts proves
actual bundled branch behavior on Android/iOS/web, public no-Auth, preserved private
Auth, stable callback, contained size and failure fallback, plus adversarial path
isolation. Both tests/native typecheck and existing build/dependency/link/video
checks pass. Native development-client store/Featured screenshots are inspected;
owner explicitly approves the correction and one replacement internal APK.
No dependency/data/schema/provider change. Full gates/source commit/artifact pending.
Private correction review/digest: .local/rebuild-s69/; native captures:
.local/rebuild-s67/native-corrected-*.png. A focused test harness initially needed
its existing PNG loader configured; corrected harness passes. Earlier video script
hit sandbox IPC denial; node --import tsx passes without changing the product test.


## S70 — chosen signup handle and Page editing (FE-051 / FE-053)

Web SignupForm reuses HandleField; native Setup reuses HandleInput. Both debounce
availability, reject invalid/taken/failed checks and disregard stale responses;
server signup still atomically claims the name and creates its private starter.
Failed signup refreshes availability instead of treating a prior check as a
reservation. Legacy callers retain generated-name compatibility. Page editing
exposes the existing rename/version/cooldown/retained-alias contracts. Web server
action permits only its fixed Page return path; actor/tenant authority is unchanged.
Native Edit intent persists through the home reload after handle save; account
security keeps its own phone/session/deletion controls.

capture-mobile-owner.mjs passes five-language essential setup/private-preview,
invalid/taken/failure/stale checks, actual chosen signup, Page rename/cooldown,
contact removal/save/re-entry, private media/gallery, service create/update/hide,
GPS/city confirmation and first publication. capture-handle-setup.mjs passes web
chosen signup, rich private preview/Edit, actual Page return after rename, stale/
failure/retry/invalid/taken handling, cooldown, audited administrator override,
retained private address denial, request limits and 1440/390/320 captures. Merchant
content stays literal; no new catalog key/provider/schema/API contract.

A stale capture expected four gallery entries; current starters provide two
photos and one video, now asserted by media kinds. PostgreSQL fixture IDs are
normalized before comparisons. Expo retains offscreen routes; re-entry checks
assert absence of visible edit fields rather than absence of offscreen DOM. The
actual native handle-save reload defect was fixed by persisting explicit Edit
intent. Both typechecks/spec validation pass. Owner confirms the combined first-setup/detail separation shown in the review;
full gates and replacement APK remain pending. Evidence: .local/rebuild-s69/,
.local/mobile-owner-review/ and .local/starter-handle-review/.

S70 final focused passes include controlled signup-409 recovery on both clients:
previous availability is refreshed, a now-taken name disables submit, other inputs
remain intact and a new chosen name completes a real local signup. PostgreSQL
signup tests separately prove actual concurrent uniqueness and no partial starter.
Both typechecks, eight locale tests and mobile contract/API suites pass; the live
handles API returns the expected public boolean/canonical name. Final Hermes
export includes the native SVG/handle modules and excludes both tooling roots.
Owner confirms one first-setup screen, followed by separate account/Page areas.

S69/S70 source gates: final npm run check passes on the clarified flow. Android
export passes with 1,571 runtime sources and zero braces/node-forge runtime paths.
Release production build, 66 private-trace checks, isolated provider-backed HTTP
smoke, scale/pagination, typing/design/media/security/adapter/owner wiring stages
all pass. Release exits only at the unchanged two-root native audit (20 high,
zero critical); the owner-approved replacement-artifact exception remains bounded.
Full production-mode user acceptance and final clean-source artifact checks follow.

Final production-mode acceptance: ten scenarios pass in the full run; the owner
capture initially tried the hidden edit fields without clicking Edit after S70.
Updating it to assert preview and enter Edit makes the remaining workflow pass in
its focused rerun. All eleven distinct scenarios have passing evidence; the first
full invocation is retained as failed, not rewritten as green. Next's canceled
stream messages occur during passing-suite cleanup. No product readiness,
permission or fixture assertion was weakened. Protected logs:
.local/rebuild-s69/acceptance.log and acceptance-owner-retry.log.


### S69/S70 published artifact evidence

Source 6c27025db6d84cecda43c952597926955aecb71d contains the approved combined
account/business setup, chosen handle, private sample preview/Edit, Page rename
and narrow owned-SVG correction. FE-051 is complete; FE-053/DEP-042 retain their
broader physical-phone/store limits. Full check, focused security/API/local
owner workflows and eleven distinct acceptance workflows have passing evidence
(with the initial 10/11 full run and separate corrected owner rerun retained).

Netlify 6ac5c9940ee5deb5294319ef is ready with the exact source; clean isolated
web release/audit, operations, Linux handler/image, archive privacy and exact
upload-cache checks pass. One wrong-cwd/order packaging attempt is retained and
its controlled rebuild passes before upload. Seven live readbacks and 44 public
language/layout states pass. Read-only post-deploy checks verify all 64 existing
live demo accents on both HTML and native API. Protected: .local/web-s70/.

Expo 9bcabbdb-14eb-420d-a2cf-8d84e0ec8c75 is FINISHED from the same source. Clean
archive has 1,496 files, zero private paths and 19 matching code/config files.
Android export has 1,571 runtime sources excluding braces/node-forge; final APK
signature/manifest/MapLibre/runtime secret inspection pass. Installed APK reports
suqpage.com verified; cold filtered search and warm public store/product intents
reach the actual preview app. Corrected SVG logo, five locale switches, public
Market/About/email entry and gallery next/thumbnail checks pass. Available honey
video plays inside the final APK with Suqpage still foreground. The first screen
checks hit Android System UI/launcher ANR; process restart and bounded retry pass,
with failed-attempt evidence preserved. No physical-phone or real inbox/social
handler assertion. Full native audit remains failed on exactly the approved two
roots (20 high, zero critical); this single replacement exception is consumed.
Protected: .local/rebuild-s69/. Downloads/signature/checksum/rollback and remaining
limits: docs/SUQPAGE-S69-S70-RELEASE-2026-10-06.md. No schema/Auth/SMTP/DNS write,
Play/iOS submission, paid build, Git push or invitation.


## S71/S72 — clearer transport chat and product-results entry (local review)

FE-019/FE-030/FE-049/FE-053. Shared catalogs add contextual purchased-goods
transport invitation, View products/Hide products and local chat wording plus
(Live Chat) in non-English locales. PublicSupportChat/native BuyingLauncher and
intake reuse existing routes, validation, conversation/staff/history authority.
The compact result toggle keeps its icon, one toolbar and existing map/filter
state. React Native Web's missing expanded projection is corrected explicitly
while retaining native accessibilityState. No API/DB/provider/dependency change.

Focused web/native types, nine localization regressions (1,264 messages per
non-English catalog), narrative/category/homepage/composition tests and 167-spec
validation pass. capture-purchase-chat-and-products.mjs verifies visible labels,
horizontal control fit, in-bounds launcher, compact open-panel chat control,
expanded state, retained input/query scope and web focus return. Web 1440/390/320
and all four other locales at 320 have passing states; six Expo phone/locale
states pass. capture-transport-intake-layout.mjs checks contextual heading/chat
label/body, route/contact pairs, required-field gating and reachable submit in
web/Expo locales; short-height 390x480 web/native passes. Captures/protected
receipts: .local/transport-purchase-review/. OSM tiles are controlled fixtures;
local application/catalog data are actual. No chat was submitted or OTP sent.

Initial capture failures are preserved: old Expo JSON cache served English
fallback for new keys; a scoped cache-refresh restart and completed cold build
restore the authored languages. Harness assertions were corrected to permit the
existing view=map/search URL change while checking query/filter retention, and
to scope duplicate translated labels to the actual dialog/control. First cold
Expo navigations timed out before bundling completed; focused warmed runs pass.
The original composition command hit sandbox tsx IPC denial; node --import tsx
runs the same test successfully. No product/security assertion was weakened.
Owner visual approval is requested; full/release gates, task commit and rollout
remain pending. Live web and installed APK still use source 6c27025; no emulator
or new APK build is started and the prior artifact exception is consumed.

S71 owner feedback rejects the long launcher title. The locally revised title is
Delivery help; subtitle Live Chat · For your purchases. Local titles remain short;
subtitles explicitly name purchased goods and live conversation with (Live Chat),
prioritizing comprehension over English length. Nine locale regressions, both
typechecks, narrative/category and spec validation pass. The updated actual entry
capture passes 13 states / 26 screenshots across desktop/390/320 and all five
languages on web/Expo, including expanded/collapsed compact controls. Fresh Expo
catalog cache is used; no chat submitted and no new dependency/API/DB/artifact.
Private evidence: .local/transport-purchase-review/short-title/. Intake wording
and S72 results behavior are unchanged. This replaces the earlier long-title
proposal; visual approval/full gates/commit/deployment remain pending.


| Unified owner Profile and confirmed cover save (S73/S74) | FE-056 / FE-053 | BE-045 / BE-032 / BE-041 / BE-044 | DEP-042 | Existing owner/home, account/page/business/handle ports and focused web/native editors | Focused Profile/cover/account/handle captures and actual Android cover save/render/re-entry pass; full gates/visual approval pending. No customer/hosted write. | in_progress |



S73–S80 local verification, 2026-10-07 (FE-056–FE-060 / BE-045–BE-048):
Individual contracts: FE-056, FE-057, FE-058, FE-059, FE-060; BE-045,
BE-046, BE-047, BE-048; ADR-0024 and ADR-0025.
- `capture-owner-profile.mjs` passes actual private cover/account/handle persistence,
  conflict retention, Profile return and guest/owner one-menu states in five languages.
- Actual Android picker/save/re-entry renders the saved cover. SDK File multipart
  fixes the upload failure; current authenticated private-image fetch with ephemeral
  cache fixes native Image's 401. `test-mobile-image-upload.ts` covers bytes/MIME/
  bounds, unauthorized responses and obsolete-resource cleanup.
- `test-mobile-map.ts` and `capture-world-map.mjs` pass global zoom/pan/wrapping/
  reset with filters retained at six web/Expo viewport states.
- `test-signup.ts`, `test-business-starters.ts`, `test-mobile-api.ts` and
  `capture-signup-city.mjs` cover canonical required city, rollback/tenant/privacy,
  chosen anchor, query invalidation and initial setup→private sample.
- `test-product-video.ts`, `test-owner-page.ts`, `test-product-gallery.ts`,
  `test-video-requests.ts` and `capture-direct-video.mjs` cover four-provider direct
  persistence/security, historical reviews, gallery/order/inline lifecycle, no
  approval tickets and cover portrait/static fills. FE-060/BE-048 supersede S77's
  product-only/review-only limits.
- Real public Facebook/Instagram video times advance in browser and Android; actual
  Android TikTok player loads and reports media progress. Official embeds, mocked
  lifecycle fixtures and physical-phone/fullscreen release checks are distinct.
Protected evidence: .local/owner-profile-review/, .local/direct-video-review/,
.local/signup-city-review/, .local/world-map-review/, .local/tiktok-product-review/.
Visual approval, final/full/release/acceptance gates, task commit and web/new-APK
publication remain pending. No hosted/schema/customer mutation.
`capture-loading-states.mjs` passes S76 pending/error/retry/settled/reduced-motion
phone states, with intercepted failures and actual local market retry.

Native cleanup evidence: actual account sign-out removes the two temporary
private-image cache files (count zero). Only the two task-owned local review
accounts/stores and one generated cover object are deleted; demo/customer data
is unchanged. Android YouTube compatibility also reports unpaused progressing
media. Focused final direct-video capture additionally asserts the obsolete
review/wait instruction is absent from the editable cover video field.

2026-10-07 S79/S75 follow-up: `capture-signup-city.mjs` passes both native setup
routes, visible city search before handle/categories, search failure/retry and
selection invalidation, actual saved canonical anchor/private preview and refreshed
Inquiries. Actual browser console/page error collection reports renderErrors: [].
`test:mobile:rendering` guards empty-string JSX conditions outside native Text;
optional notices/errors/contacts/logos/video retries/inquiry notes use explicit
boolean conditions. Native types, localization and spec validation pass. Protected
review evidence: .local/signup-city-review/. Deployment/full gates still pending.

FE-061 / BE-049 / S81 focused local evidence, 2026-10-07:
- `test-category-starter.ts` proves complete admitted packs and sample publication
  guards for eight categories. `test-business-starters.ts` proves all eight packs
  through real signup/new-offering persistence, persisted-category precedence,
  identity/privacy, reinitialization/foreign denial and atomic rollback.
- That broader check exposed Other-category foreign-tag failures. BE-047/BE-041
  preserve declared category/city, omit nonexistent public tags and use neutral
  All-category map/result presentation. `test-self-service-publication.ts` proves
  owner location save, pending first publish, All search/map inclusion, specific
  category exclusion and unchanged suspended/excluded/foreign/stale protections.
- `test-product-video.ts` / `test-mobile-video.ts` cover admitted refs/bridges,
  strict source/origin/navigation and nonfatal autoplay/playing states. Actual
  M7 developer-demo metadata can load while buffering; its reported unavailable
  path was not reliably reproduced. The new wrapper sets sandbox before loading,
  accepts iframe document/playback readiness, and preserves terminal errors.
- `capture-category-videos.mjs` proves real local demo catalog covers/products on
  web/Expo with controlled provider frames, gallery unmount, loaded-frame survival
  beyond 22 seconds without the control API, genuine bridge error and explicit
  retry. Actual public playback is separate: all eight category videos progressed
  with readyState 4 and no error. Protected evidence: .local/category-video-review/.
- A protected, expected-version, owner-scoped local correction adds cake TikTok,
  haircare Facebook and retail Instagram examples to three marked demo covers/
  product galleries; other marked demos retain YouTube. Only unchanged M7 refs in
  named local Al Haya are replaced with its category example. Before/after checks
  confirm preserved photos, copy, contacts, accents, IDs and private/live state.
  No general customer backfill, schema change or hosted mutation.

FE-056 / S82: `capture-preview-publish.mjs` proves Publish beside Edit before the
cover in private native preview (1440/390/320), actionable unfinished checks and
actual server denial, offering-editor navigation, actual changed-draft conflict,
fresh content review without overwrite, network/forbidden error retention and
retry into actual live local publication/public offerings. No browser render
errors; test identities/businesses are removed. Protected screenshots/checks:
.local/preview-publish-review/. Physical-phone/new APK remains separate.

Final S82 capture also passes Publish/unfinished-review at 320px in all five
languages. Both typechecks, nine locale tests, native render-boundary check,
180-spec validation, product/gallery isolation and category/publication regressions
pass. Separate actual clothing-example playback remains unpaused beyond 20 seconds
(readyState 4), with no unavailable state. Evidence remains local only.

Visual approval, full gates, task commit and coordinated web/native rollout stay
pending; all earlier S71–S80 work remains included. No hosted publication claimed.

S83 / FE-052 / FE-053, 2026-10-07: web BusinessProfile and native ShowroomContent
omit the business-example notice when an explicitly marked demo handle contains
demo (case-insensitive), otherwise retain it. ShowroomApp removes demo-inquiry
disclaimer text; native inquiry already contains no such disclaimer. Unused
translations are removed/rebuilt. capture-demo-notice.mjs passes two actual web
demo catalogs and four Expo presentation fixtures (including case/flag negatives),
normal inquiry controls and 1440/390/320 views with zero inquiries sent/content
mutations. Both types, nine locale tests, spec validation and whitespace pass.
Evidence: .local/demo-notice-review/. Demo authority/publication guards unchanged;
visual/full gates/commit/deployment/new APK remain pending with the prior task.

S84 / FE-019 / FE-049 / FE-053: shared lib/i18n/transport-copy.ts supplies the
customer transport entry/intake on web/native; six catalog entries are authored
in all four non-English locales. Copy identifies purchases from Suqpage businesses
and transport to the customer, with recognizable Live Chat, without delivery,
distance or brokerage/mode details. Types, nine locale tests, narrative/category
and spec validation pass. Focused captures pass seven web entry/intake states and
six Expo states across desktop/phone and five locales, plus short-height web
intake; map/result compact modes, paired fields and Start chat remain usable.
The first mobile run exposed a shared-file watcher resolution failure, corrected
by using the existing watched UI folder; actual retry renders without page errors.
No chat is submitted. Evidence: .local/transport-service-copy-review/. Visual/full
gates/scoped commit/rollout remain pending with the earlier work.

S90 / FE-019 / FE-030 / FE-049 / FE-053, 2026-10-07: shared transport copy and
web PublicSupportChat/native BuyingLauncher present Need help with transport?
and smaller Let us handle it. Chat with our transport agents live text. All four
non-English catalogs contain contextual wording and (Live Chat); compact entries
retain their complete accessible name. The intake introduction invites team chat
about getting purchases from Suqpage businesses to the customer. Its fields,
handlers/roles/palette are preserved.
Both typechecks, nine locale tests, narrative/category/homepage and 180-spec
validation pass. capture-purchase-chat-and-products.mjs passes 13 web/Expo states
at 1440/390/320px across five languages with actual loaded OSM tiles, line order,
text hierarchy, minimum tap size, no overflow/errors, updated invitation/description,
reachable Start chat in every locale and retained routing/query/compact controls.
Paired short intake captures pass both clients at 390×480. No requests sent.
Protected evidence: .local/transport-invitation-review/final/verified.json and
final/intake/verification-short.json. Owner visual approval/full gates/scoped commit/
web rollout/replacement Android build remain pending with the authorized task.

S85 / FE-021 / FE-053, 2026-10-07: app/discovery.css and native/Expo MapMarker
use bright orange shops with continuous thin white exterior edges, white interior details
and 11px orange names on opaque cream plates; selected plates use white on orange.
The owner's correction restores all cluster/nearby/badge styles, whose complete
declarations match their original HEAD reference. Existing
glyph/camera/coordinate/count authority and selection handlers are unchanged.
capture-map-marker-contrast.mjs records current 1440/390/320 web/Expo states
using actual local public catalog and controlled cream tiles, then separate
desktop/phone views on actual OSM tiles. Normal name contrast 4.83:1, selected
5.24:1 and orange-fill-to-cream 3.09:1 exceed the specified thresholds. Both
shop/roof contours use 1.5px white; its contrast against cream is 1.12:1,
not a claim of 3:1. Real shop
selection/preview, no zoom-out, public cluster count and keyboard expansion pass.
capture-mobile-markers.mjs checks controlled two-shop featured cluster/nearby/
badge restoration, group preview and remount; fixtures do not establish actual public
presence. Native map behavior, both types, homepage composition and 180-spec
validation pass. Homepage/remount tests were reconciled with FE-056's previously
implemented Account navigation, preserving guest inquiry gating and About under
Profile. Current evidence: .local/map-marker-white-edge-review/. Original group/
badge fixture and full-declaration comparison evidence remains in
.local/map-marker-warm-review/. The earlier dark candidate was rejected and the
orange-outline trial superseded. Web reuses the established native SVG contours
in its compact 25px glyph layout slot for a continuous white rim; no new library.
Visual/full gates/scoped commit/rollout/new APK remain pending with earlier work;
physical-native evidence is separate. No writes to catalog/provider/schema.

| Local demo dispersal and shop hitboxes — S86 | FE-021, FE-053 | BE-020 | DEP-042 | One-time protected Addis demo correction; shop-only pointer geometry in MapMarker/MarketMap.web | 21 marked area shops/84 offerings retained, minimum 2.23km display separation inside OSM city boundary; atomic backup/drift/apply/readback and rollback rehearsal, actual desktop/phone map selection and original group regression pass; hosted coordinates/visual/full gates pending | in_progress |
| Main admin and web-only queue staff — S88 | FE-026, FE-053 | BE-018, BE-044 | DEP-042 | Current-principal queue projection, scoped capabilities, admin staff creation, mobile admission/API denial | Protected exact local/production admin identity operation verified, existing business/provider preserved; staff boundaries, provider failure and native tenant API tests pass; actual admin-created staff, five-language role/phone UI and real web/Expo back-and-forth chat/attachments/history/capacity/privacy/retry audit pass; new UI/API/APK rollout pending | in_progress |
| Retired business subscriptions — S89 | FE-018 | BE-017 | DEP-015 | Removed payment action/ports/navigation; authenticated old-route redirect; migration 60 and non-billing seed | Local migration preserves all historical ledger/payment rows, real trigger upgrade/idempotence/new-shop absence/rollback rehearsal, analytics tenant denial and naming compatibility pass; old-bookmark/admin navigation browser proof and readable phone role controls pass; hosted migration, visual approval and release gates pending | in_progress |


| Inquiry/chat alerts and confirmed reads — S91 | FE-062 | BE-050 | DEP-043, ADR-0026 | attention contracts/PostgreSQL events/receipts, web/native controls and scoped provider outbox | test-attention-notifications.ts, test-chat-read-receipts.ts, test-attention-platform.cjs, test-attention-http.mjs and native API pass. Local migration/hash retention verified. Actual capture-notification-workflows.mjs owner/visitor web/Expo read/hidden/covered/join/inquiry navigation and real browser sound/mute/dedup pass in 5 locales/1440/390/320. Private .local/notification-review/actual/verified.json; provider fixtures are mocked, no external push sent. Visual/full gates/scoped commit/hosted migration/rebuild/real OS delivery pending | in_progress |

S92 / BE-002: exact Next 16.3.8 patch removes Next from the fresh advisory report;
focused auth-proxy/runtime/source-map and web/native types pass. Remaining Expo/Metro
advisory roots remain separately controlled. No new release/build/production claim.

S93 / FE-062 / DEP-043: metrics dependency removed; native keyboard-event/web
visible-viewport/inset regression and mobile types pass. Fresh actual local
owner/visitor replies/read/coverage and all-language captures pass without page
errors. Protected local VAPID/runtime-backup source configured; Chrome permission
and real OS push pending owner opt-in. Independently verified Netlify production
fields absent; exact protected production review/source unapplied. Firebase Spark
project-ID step pending. No provider configuration/deploy/physical Android proof.

## FE-026 / FE-019 — predictable staff navigation (S94, 2026-10-08)

Local candidate: `lib/support-navigation.ts`, WorkspaceNavigation/DashboardShell,
support inbox/thread/actions and SupportInboxRedirect/SupportNavigationFields,
Staff/workload pages. No schema or domain access expansion. `test-staff-navigation`
proves bounded origins, current-queue matching and safe settings links; focused
type/catalog/spec checks, `test-staff-boundaries` and `test-support.ts` pass.
`capture-staff-navigation.mjs` exercises real local admin/support/transport actions
from a page-two filtered inbox through claim, failed/successful reply, assignment,
close/reopen and transport handoff; actual queue/direct/foreign links, staff-save
context and stable business-menu context pass. All five locales at 1440/390/320
produce 71 captures with singular active areas, no clipping/overflow, restored
drawer focus and zero browser exceptions. The prior development RSC profiler
redirect failure was reproduced once, classified from its dependency stack, and
fixed through server-scoped data plus safe browser replacement/fallback; the
exception assertion remains strict. Protected evidence stays in
`.local/staff-navigation-review/actual/verified.json`. Disposable fixtures are
removed, zero customer chats/production writes and no mocked success responses.
Visual approval, full/release gates, task-scoped commit and rollout remain pending;
FE-026/FE-019 remain in_progress. Master §§13/19/22 describe the local candidate.

## DEP-042 / DEP-043 — one native application identity (S96, 2026-10-08)

Local build config/app.config and EAS profiles use Suqpage / com.suqpage.app for
development, internal APK and store AAB. Preview remains a profile only; both
hosted profiles increment the shared remote version counter.
`test-mobile-build-config.cjs`, `test-attention-platform.cjs` and five
`test-mobile-app-links.ts` cases pass, including canonical Firebase acceptance
for both profiles and legacy/foreign/missing-config denial. Actual Expo metadata
resolution confirms the same name/package/project for preview/production;
protected evidence is .local/notification-review/firebase/canonical-app-identity.json.
Legacy association/certificate is retained without a fabricated canonical claim.
Canonical signing, association, provider configuration, full gates and rebuilt
device evidence remain pending; no credentials/binary/production writes. The owner
now needs only one Firebase Android registration in project suqpage. Status stays
in_progress; master §§15/17/22 and mobile-testing instructions are reconciled.

## DEP-042 / DEP-043 — single-app release safety and Firebase client (S97/S95)

2026-10-08: build policy/config and worker validation pin approved production
API/Auth/Expo target and Firebase project/number/canonical package, reject profile
conflicts/nested private client material, and exclude FCM credential files from
archives. `test-mobile-build-config.cjs`, `test-attention-platform.cjs`, three
`test-android-release-safety.ts` cases and both typechecks pass. Actual SDK inspection
of the historical APK reports its legacy package/certificate, version 1 and no
debug flag; canonical release admission rejects the unconfigured pin. SDK mocks
are separate. `mobile:verify-apk` and MOBILE-DISTRIBUTION document first/update
artifact verification and constrained tester/device/internal-draft/public gates.
Master §§15/16/17/22 reflect the local candidate; signer/full gates/commit remain open.

The owner-supplied client file is verified and retained outside Git. Independent
Expo project/owner/public-target and exact selected-variable checks show no
conflicts. Protected additive before-state/plan creates only client secret-file,
Firebase ID and build-prerequisite flag for preview/production in @falmatad/suqpage.
Creation metadata and string values read back correctly; secret content verification
is bounded to protected source/exact upload plus worker validation. Evidence is in
`.local/notification-review/firebase/`; no private bytes enter source/logs/builds.
Private sending-key upload, server rollout, canonical signing/APK and actual
Android delivery remain pending. No Google Play/signing/server capability changed.
Specs stay in progress; focused spec validation and whitespace checks pass.
Malformed Firebase JSON also rejects with a generic error and no private-fixture
excerpt in stdout/stderr. Protected source/backup/plan/create/readback/SDK evidence
files have owner-only permissions; no new full gate or commit is claimed.

S95 sending-key continuation: owner-supplied private source passes selected
project/type/token endpoint/RSA structure checks and is backed up with owner-only
permissions outside Git. Independent Expo owner/project/slot/enhanced-security
readback and protected exact before-state/FCM-only plan pass. No provider write,
IAM verification, key activation or OS delivery is inferred. Provider dashboard
step or explicitly authorized official-CLI method exception is pending.

S95 FCM provider configuration completes under the owner's explicit one-operation
CLI exception. Official interactive EAS CLI confirms source upload and assignment;
independent metadata query verifies exact project/key ID/client association for
@falmatad/suqpage / com.suqpage.app. Canonical signing remains empty; Play, legacy
FCM and enhanced-security settings are unchanged. Protected source/before-state/
plan/authorization/after-state evidence is retained outside Git with owner-only
permissions. No raw credential mutation, private output, live server flag, APK,
IAM readiness or actual OS delivery is claimed. Full release/device/rollout gates
and scoped release commit remain pending; DEP-043 stays in_progress.

S98: owner explicitly approved the tested visuals and exact protected rollout plan
c34fad9fbd191bdba0878835f10add929dc15905981ac03541963c54804f48d3.
Independent production binding remains schema 59. The consistent 58-table backup
was restored and migrations 60–62 preserve original-column hashes, private-table
RLS and idempotency; the clone is cleaned. Existing signing material is protected
and its certificate verified, with no canonical binding write yet. Expo Free quota
and both public runtime/Firebase client configurations pass read-only admission.

Focused actual browser workflows pass for owner gallery uploads/reorder/reuse/
removal, publication/live Save/inquiry and staff transport replies/private-note
privacy/end/history/resolution/reopen. Profile Sign out and protected-route denial
pass. FE-050 readiness/pending-save protection retains the normal form layout;
its final regression checks the extra photo's stored bytes as well as gallery count.
The focused type/localization/product/security gates pass. An earlier full check,
eight mobile groups, operations and clean isolated web release pass; final gates
are being rerun after the form correction and a local Docker interruption. Failed
infrastructure runs are not counted as passing evidence.

Actual packaged Linux handler/Sharp and worker cold invocation against empty
isolated PostgreSQL passed without provider requests. No hosted notification
setting/migration/deployment, canonical signing/APK or actual OS display is claimed
until its protected operation/device receipts exist. The full tooling audit retains
the approved 20-high/two-root exception for one free internal APK; web audit is zero.
DEP-042/DEP-043/FE-062 remain in progress; user-owned deno.lock is excluded.

S98 canonical signing is independently verified after the CLI failed to confirm:
exact existing key bytes/certificate, canonical default, legacy/FCM/Play/security
preservation pass. Public local pin and retained legacy + canonical association
are prepared; actual new APK/OS delivery remain pending. Further remote writes
are stopped at the explicit AGENTS timeout-direction gate.

The owner accepts the independently verified completed signing operation and
authorizes the unchanged rollout to continue, without any further signing write.
Fresh full check and 11/11 actual production-mode browser workflows pass. Canonical
public build/link/type/spec checks pass; Android runtime export succeeds. The new
APK, hosted rollout and real OS notification tests remain separate pending gates.

S98 final local source gates: complete npm run check and clean isolated release:web
pass, including real provider-backed production HTTP smoke, trace/privacy, migration/
scale and zero web-audit findings. All eleven production-mode browser workflows pass
without database injection of product videos; the distinct uploaded image's stored
bytes, gallery retention and later edits are verified. Canonical public signing/link
configuration, mobile typecheck and spec validation pass. Android runtime export
passes; source-map/tooling exclusion and exact packaged artifacts remain required
before the explicitly authorized production rollout and one APK.


S98 source a81c93f is committed after complete check, isolated release:web,
operations and all eleven production-mode local browser workflows pass. Actual
Android runtime export and EAS archive exclude private data and both approved
tooling advisory roots. Actual Linux handler/Sharp and packaged worker checks pass.
Netlify production deploy 6ac839e949737af3112e0764 uses those identical archives;
backed/rehearsed schema 62 preserves existing hashes and private permissions. Five
approved production notification fields have exact Free default-scope readback.
Live public/native health/catalog/denial/redirect/association checks pass, as do five
phone locale renders and non-submitted paired transport intake. An actual scheduled
empty-queue worker cycle succeeds. The preview's unavailable production-only runtime
is recorded as a failed/blocked draft dynamic smoke, not as passing hosted evidence.
Canonical internal build 565b9614-428d-47b4-8780-2b0f9c96d68b is complete, with
actual APK/installed evidence below. Real OS delivery/read tests remain. DEP-042/DEP-043/FE-062 stay
in_progress. Evidence: docs/SUQPAGE-S98-RELEASE-2026-10-08.md. Deno lock preserved.


S98 Android artifact/installed evidence: build 565b9614-428d-47b4-8780-2b0f9c96d68b
finishes on Free (6/30, zero cost), source a81c93f. Actual nondebug package
com.suqpage.app/version 2 and pinned existing signer pass SDK inspection. APK
SHA-256 a7acae61994fbd6ed5440dd46fa3cdf8fecb50681e91db210fb5a523a158bea7.
Actual Firebase client resources, notification permission and canonical HTTPS intents
match; artifact/export/archive exclude private data/credentials and admitted tooling.
The APK installs/launches on isolated API 35. Android verifies suqpage.com. Twelve
public/locale states, real map tiles, cluster expansion, labelled shop selection and
preview-to-store navigation pass, with no app crash/keyboard-metrics/text-node error.
No account sign-in or customer inquiry/chat is created by native smoke. Emulator is
closed. Physical-phone/browser OS alert and authenticated hosted workflow evidence
remain outstanding; DEP-042/DEP-043/FE-062 stay in_progress. See the S98 release record.

S99.10 verified source/store evidence, October 12: owner visual approval precedes
the complete passing check, clean isolated release:web, 11/11 production-mode
local acceptance workflows, operations, mobile build contracts and Android Hermes
export. Actual packaged Linux handler/Sharp and scheduled worker pass; the worker
uses an empty isolated PostgreSQL fixture and sends no provider requests. The
web audit is clean. Native audit remains failed (20 high, two tooling roots, zero
critical); both roots are absent from all 1,651 compiled runtime modules. The
previous one-AAB waiver is consumed; another build needs exact renewed admission.

Fresh independent normal Console reload verifies exact English/Amharic listing
drafts, ordered assets and seven unchanged phone-image references plus shared
icon. Only six graphics change; all six transformed Google CDN images visually
match source. Thirteen composite AI labels persist, the original icon remains
unlabelled, and Publishing overview still has a disabled Send app for review.
No Google review, closed activation, opt-in, physical-device or campaign publication
is inferred. Source/receipt evidence: .local/play-s99/narrative-s9910/source-gates.json,
console-setup/s9910-final-two-locale-console-read.json and
store-presentation/proximity-v1/provider-readback/verification.json.

S99.10 web rollout, October 12: app source 3cfa5778e6f851d6934be421d589cd8adbcf33db
is published as Netlify 6acd6e4203a2e50c6b9286dd. Before upload, a consistent
owner-only schema-63 backup parses successfully and all 63 tables are represented.
The exact previous immutable provider deploy remains ready for an owner-reviewed
republish; cleaned temporary local archives are not claimed as available.
The clean source binds to the tested handler/worker archives, public asset links
and privacy scan. The single no-build upload finishes with exit zero; independent
provider readback confirms publication. Twelve read-only health/catalog/denial/
association checks and fifteen actual live Market/About/account phone states
across five languages pass accepted-copy/no-overflow/no-page-error checks. OSM
tiles are blocked only in automated layout capture. No customer inquiry/chat,
notification, schema/config write or restoration is performed.

Fresh Android admission for the same source: isolated native-only install passes,
fresh audit remains failed (20 high, zero critical, two known tooling roots), all
1,651 runtime modules exclude those roots, and 1,622 actual EAS archive files match
the committed source and exclude private paths/credentials. Exact public runtime,
Firebase file metadata and existing default signer are independently verified.
Free quota is 15/30 builds, zero cost. The exact one-AAB review is requested and
pending; no new cloud binary is claimed. Protected phone/OS alerts, S99.5 API
direction and real tester/reviewed closed rollout gates remain. Evidence:
.local/play-s99/narrative-s9910/{production-live-verified,artifact,source-binding,
eas-archive-reviewed,aab-admission-plan}.json and its database/backup-manifest.json.

S99.10 updated Android artifact — October 12 (October 13 UTC): one owner-approved
production AAB from source 3cfa577 is completed locally with official EAS after
independent confirmation that cloud Free quota rejection created no job/artifact.
Actual file `.local/play-s99/narrative-s9910/suqpage-play-v5.aab` is 93,109,626 bytes,
SHA-256 45dea3bec99e715cd652531785524838300eef902d9461aa551a06c43c745e7c,
package com.suqpage.app/version 5, target API 36, nondebuggable. Java cryptographic
verification retains existing certificate 0630C56F88DF874FD27296D1AA0848A68FC8345F702FE6802EDD8255B7211183;
strict self-signed-chain exit 4 is allowed only after pinned certificate, validity,
verified signature and no unsigned entries pass. Bundletool validation, requested
16-KB ZIP alignment and all fifty 64-bit native ELF load alignments pass. All
1,499 archive files pass privacy/credential scans; production API/Auth bindings,
canonical HTTPS auto-verify and actual Firebase project/sender/client resources
match. The actual Hermes bundle contains the accepted heading in all five
languages and the new About/supporting copy. Public EAS signing, legacy and FCM
metadata before/after remain identical; the private working directory is cleaned
by SDK. No payment, new key, Google submission or Play-delivered phone is claimed.

The bounded exception 4e4b9640bb318a28f147ade33694d78b7ab1f038e3b23888fbad8167bd728383
is now consumed by this one artifact. The native audit remains failed, not clean;
future artifacts need renewed admission. Google internal/Alpha version 3 and the
Expo-distributed APK version 2 remain unchanged. New Play upload/activation,
protected-phone workflows/OS alerts, S99.5 API direction and genuine 12-testers/
14-day closed distribution remain separate. Evidence:
.local/play-s99/narrative-s9910/{local-build-exit,aab-inspection,verified-artifact,
aab-exception-consumed}.json. There is no managed cloud build ID for this local
artifact. Only SuqPage is managed; no other app is changed or Git history pushed.


S99.10 internal rollout and tester expansion, October 12 (October 13 UTC): separate
owner-approved digest 9e220cff5b4c58e780c07b3c82b6dd4254137d20d8c4d446d46a60f432ec8e46
precedes one exact-file EAS submission 590a091f-e851-4a93-a161-68c5a24917d9,
terminal FINISHED. Independent normal Console original-file hash matches the
admitted AAB; actual Google-signed APK verifies com.suqpage.app/version 5,
existing certificate and Google source stamp. Fresh reload verifies internal
release 2 Available, original ten members and Alpha version 3 Draft. Subsequent
owner-requested append-only expansion independently verifies the exact twelve
members after reload and unchanged internal/Alpha list selection/178 countries.
Expo submission/signing/FCM/legacy metadata before/after matches. No other app,
closed/public rollout, Google app review, emails or billing changes occur.
Operational contract/proof: docs/GOOGLE-PLAY-RELEASE.md, S99.10 internal update;
private evidence .local/play-s99/narrative-s9910/{play-v5-internal-complete,
google-v5-artifact-verified,google-v5-signed-apk-verified,twelve-testers-complete}.json
and console-setup/v5-* / twelve-* reloads. Prior source/full release gates persist
for unchanged 3cfa577; protected phone/OS alerts, outstanding S99.5 API direction,
actual twelve-testers/fourteen-day closed enrollment and reviewed rollout remain.
DEP-044 stays draft; the consumed tooling waiver does not admit another build.


S99.11 owner-authorized closed-test start, October 12 (October 13 UTC): DEP-044
records the explicit phase change; real-phone/OS-alert checks occur during closed
testing and gate production readiness. Exact Google library version 5 replaces
only Alpha's prior draft artifact through normal controls; name/two-language notes
and all 178 country rows are retained. The missing Advertising ID declaration is
No after actual APK/AAB/seven-DEX/source/dependency checks and normal saved reload.
Google accepts the enabled sixteen-change review request; independent overview,
Alpha and Dashboard readback show In review, internal 5 Available, production
Inactive and zero closed opt-ins. Tester selection/feedback fields match; no
other app, build/upload/signing/billing change, invitation or old API replay occurs.
Google's actual closed joining link is recorded without claiming availability,
Google approval, phone success or fourteen-day completion. Evidence:
.local/play-s99/closed-v5-start/{review-submission-verified,
advertising-id-declaration-verified,closed-submission-complete,
join-links-from-console}.json plus console-setup/closed-v5-* reload/comparison
receipts. docs/GOOGLE-PLAY-RELEASE.md records the current status and tester steps;
DEP-044 remains draft pending actual Google/tester/phone/public gates.


S99.11 later publication confirmation, October 12 (October 13 UTC): after the
2bc089e review-submission record, Google publishes private Alpha release 1/version
5. Independent reload verifies Available to selected testers; release overview
confirms Available to testers on Google Play and internal 5 Available. Exact
selected twelve-member access/feedback and actual joining URLs remain verified;
Dashboard shows production Inactive and zero closed opt-ins. Earlier pending
review receipts stay immutable. Publication does not establish phone/OS-alert
success, completed fourteen-day enrollment, production access or general public
policy approval. Evidence: .local/play-s99/closed-v5-start/publication-verified.json
and console-setup/closed-v5-published-* plus publication-overview-verified.json.
DEP-044 remains draft for those external testing/public gates; no build, credential,
other app, invitation or extra provider mutation occurs.

S100 / FE-052 / FE-049, October 15, local candidate: shared web/native Market and
About, map guidance, account entry, metadata and prepared listing/campaign text
lead with business showrooms without social-post clutter. Customer/owner sections
cover collections/models/colors/styles, merchant-listed availability with direct
confirmation, and producer capacity/timing in descriptions/questions. No new
inventory, variants, production fields, API/database or provider write is added.
Implementation: lib/storefront-copy.ts, app/login/page.tsx,
apps/mobile/app/(tabs)/account.tsx, locales/interface.tsv and generated catalogs,
docs/{play-store,marketing} source text. Evidence: npm run test:narrative,
test:localization (ten tests; 1,414 messages per translated catalog), both
typechecks, test-homepage-composition and 74 passing final capture-storefront-copy
states. Captures/receipt: .local/showroom-narrative-s100/refined-screens/.
Actual local catalog and markers are used; tiles alone are stubbed. A transient
navigation load-event timeout is diagnosed with a 200/visible sign-in read;
explicit content/font/image/map readiness and unchanged screenshot caret styles
prevent test-induced hydration/resource waits. New visual approval/full gates,
scoped commit, refreshed generated marketing media and web/Android rollout remain
pending; deployed 3cfa577 web and Play v5 are unchanged. User-owned deno.lock is
preserved. This is browser evidence, not physical-device or native-speaker approval.

S100 same-day digital-lead refinement: the owner asks for "a business’s digital
showroom" in the heading. Shared copy and prepared marketing sources are aligned;
four contextual leads explicitly name an online page/showroom. Ten localization
tests (including explicit online meaning), both typechecks, narrative/marketing
claims and 21 refreshed Market/metadata browser states pass. Latest evidence:
.local/showroom-narrative-s100/digital-lead/screens/copy-verification-all.json.
Unchanged About/account states retain the initial 74-view receipt. This wording
correction is not visual approval; full checks, commit and rollout remain pending.

S101 / FE-049 / FE-052, October 15, researched local language revision: primary
guides and observed language usage, limitations and writing decisions are in
locales/README.md. 138 existing source rows plus one missing owner metric are
revised; three native title-case status aliases fix English fallbacks. Generated
catalogs each contain 1,418 messages. Shared OWNER_ACTIVITY_METRICS labels reach
web/native owners; ShowroomApp/BusinessProfile translate fixed platform nouns
before interpolation while preserving merchant values. Prepared four-language
campaign and existing Amharic store text follow the same draft meaning.

Focused evidence: test:localization (12), test:narrative (including source-copy
alignment), both typechecks, test-homepage-composition, validate:specs (190) and
diff whitespace pass. Actual local views: 74 shared-copy states in
.local/language-research-s101/screens/copy-verification-all.json, 40 web states
in journeys/web-evidence.json, 12 fully loaded native-owner states in
journeys/native-owner-evidence.json, and 16 native public states in
native-public/evidence.json. Browser errors/overflow assertions pass on final
runs; typed contact text, inquiry selection/reload and literal merchant identity
are checked. Tiles alone are stubbed. Existing local demo sessions are used;
no business saves, customer requests or chat messages are submitted.

Initial harness failures were development navigation/cache timing and hidden
Expo stack selectors; premature loading-frame evidence is explicitly superseded
by loaded form/inquiry captures. /dashboard's existing development redirect
timing error matches the upstream report https://github.com/vercel/next.js/issues/86060;
canonical /dashboard/profile is captured without suppressing errors or changing
dependencies/redirects. This does not establish production redirect health.
User visual approval, full gates, coherent scoped commit, regenerated promotional
artwork and any web/Android publication remain separate and pending. No native
device, independent first-language review or complete linguistic certification
is inferred. Existing deno.lock remains untouched; Loadgistic is not modified.


S102 locally implemented / in progress: FE-065 / BE-054 / DEP-045 / ADR-0027.
Source: lib/market-search.ts, lib/discovery.ts, lib/spelling-search.ts,
lib/public-discovery-cache.ts, app/api/discovery/route.ts, mobile router/projections
and packages/contracts; components/DiscoveryWorkspace.tsx / MarketSearchControls
and Expo Market/controls; countries/place catalog/lookup adapters, migration 64,
signup/starter/owner adapters and country/city forms; safe demo seed inputs and
inert external demo contact actions on web/native. Five-language catalogs are
shared, not merchant translations. Country-label hydration and same-country
reselection fixes are captured in actual setup screens.

Focused evidence: scripts/test-independent-discovery.ts (real PostgreSQL SQL/wire,
empty activation, exact/fuzzy scopes, public metadata, strict geography/type,
source descriptions, canonical signup, world owner edits and tenant/version
negative cases); existing place/signup/handle/starter/discovery/staff suites;
scripts/test-mobile-app-links.ts (six tests); scripts/test-localization.ts
(12 tests, 1,440 keys); both typechecks and 194-spec validation.
tests/acceptance/discovery.spec.ts adds focused actual-browser typing,
independent state, descriptions/brand links, filters, reload, empty clearing,
error/retry and keyboard dismissal. Full-suite/build/acceptance release gates
remain pending visual approval; these focused runs do not substitute for them.

.local/discovery-s102/ contains the protected backup and local 67-demo
contact/geography preservation receipt, private test-access directory and local
staff/setup fixture receipts. Existing auth aliases, real businesses, products,
inquiries and GPS were preserved during demo correction; new labeled local test
identities are a separate operation. Local schema is 64; hosted schema/code and
installed Android binaries are unchanged. Screens/evidence cover 24 English
search states, 21 initial language/viewport states, 40 localized product/city
picker states and ten signed-in setup states. These are browser/Expo-browser
screens, not native-device or independent native-speaker certification.

Migration 64 rehearsal also proves schema-63 upgrade, rollback on unexpected
constraint names, retained custom checks, unchanged private users/GPS, canonical
ET backfill only and idempotent replay. Blank/null exact coordinates are rejected.
The final three focused browser tests pass, including filter Escape isolation.

Remaining: actual layout approval,
full gates, scoped review/commit and separately authorized web/Android rollout.
City-data deployment tracing and mobile-bundle exclusion require release proof.
Unrelated deno.lock and all prior pending S100/S101 work remain preserved.

Final local account session receipt: .local/discovery-s102/account-session-evidence.json
proves main admin, demo owner and two dedicated local agents can enter their web
workspaces; owner mobile API is 200 and each staff/admin mobile API is 403. No
messages, customer operations or outgoing email were part of that verification.

S102 final publication safety check: lib/publication-readiness.ts retains legacy
starter placeholders and reserved-domain/number recognition after safer new
defaults. scripts/test-independent-discovery.ts covers old/new sample rejection
and real contact admission; test:self-service still passes publication/live-save
atomicity, foreign/stale/suspended denial and location/privacy workflows.


### S103 — bounded browse, infinite products and paired discovery panels (local)

FE-065 / BE-054 / DEP-045 extend pending S102. Code: `lib/market-search.ts`,
`lib/discovery.ts`, `lib/use-market-feed.ts`, `lib/public-discovery-cache.ts`,
`lib/mobile/router.ts`, `app/api/mobile/v1/[...path]/route.ts`,
`components/DiscoveryWorkspace.tsx`, `components/IndependentMarket.module.css`,
`apps/mobile/app/(tabs)/index.tsx`, and all four generated native-language catalogs.
`test:independent-discovery` proves bounded default rows/counts, complete stable
12-card paging and visibility exclusions. `test:discovery-pagination` preserves
all six legacy query suites. Seven `tests/acceptance/discovery.spec.ts` scenarios
pass locally for typing, scrolling/position, retry/races, hidden panels and
centered click/drag switch behavior. Both typechecks, localization (1,444 keys) and 194-spec validation pass.
`.local/discovery-s103/screens/evidence.json` records 29 web/Expo-browser states
with no page errors. New states await visual approval, followed by full gates,
scoped commit and separately authorized web/native rollout. No device/load-test
or native-speaker certification is claimed; no production mutation occurred.


### S104 — consistent public shell, standard owner dashboard and live chat (local)

FE-036 / FE-026 / FE-056 / FE-053 / FE-049: public legal/Login/setup/receipt routes
now share app/(public), with stable URLs, one main/header/navigation, grouped rail,
About, authorized Inquiries and role-aware Login/Dashboard. app/navigation.css,
PublicAppFrame/PublicMobileNavigation/PublicAppShell, DashboardShell,
WorkspaceNavigation and native main-navigation/owner-profile implement matching
owner overview, task cards, metrics, focused edit/save-return and one phone bar.
lib/capabilities.ts maps existing roles to their existing homes, without grants.

FE-019 / BE-018: SupportThreadRefresh and support/[id] retain slower closed-case
updates so staff reopening reaches the owner without manual refresh. Real local
HTTP audit scripts/capture-staff-chat-workflows.mjs completes all owner/visitor/
support/transport flows, scoped roles, attachments, capacity, retry/history and
privacy checks; .local/navigation-s104/final-chat/verified.json proves full scope
and zero mocked successful replies. Only disposable local fixtures are removed.

Focused evidence passes: both typechecks, localization 1,453 messages, 194-spec
validation, PWA shell, OSM contract, staff navigation, all support suites, scoped
attention/read-receipt suites, two navigation browser scenarios, and 57 public/
authenticated web/Expo layout states. Receipts and gallery are protected under
.local/navigation-s104/. Native physical devices, independent native-speaker
review, full check/release/acceptance, scoped commit and publication remain
pending actual visual approval; no hosted configuration/data or Android build
was changed. Prior source-selector/schema fixtures and screenshot-caret mutation
were corrected as test-infrastructure issues, without weakening runtime guards.


## S105 — social-only business contact (local, review pending)

| Spec | Implementation | Focused evidence | Status |
|---|---|---|---|
| FE-066 | ShowroomApp/social composer, product-inquiry, native inquiry, public/owner navigation and shared showroom copy | scripts/test-product-inquiry.ts; scripts/test-localization.ts; scripts/capture-social-contact-workflows.mjs: 32 actual local states; capture-storefront-copy: 74 locale/layout states | in progress; visual/full gates pending |
| BE-055 | web inquiries 410 adapter and early native dispatch retirement; history/support handlers preserved | scripts/test-retired-business-inquiry.ts; scripts/test-mobile-api.ts history/security + test-launch-clarity.ts / test-self-service-publication.ts readiness/atomicity; real HTTP row/event-count regression | focused adapter/integration/browser checks pass; visual/full gates pending |


## S106 — restore contact setup and automatic handoff (visual/full gates pending)

FE-066 / BE-055 / FE-040 / BE-032: all eight original contact fields and public
links/publication eligibility are restored; only the Suqpage business inbox is
retired. The reported URL passes fresh online, connection-loss copy and reconnect
checks. Local production renderers use the established publicContactLinks export.
Auto-copy precedes account opening; manual copy is secondary. Visible demo
choices stay disabled. Evidence: .local/contact-repair-s106/screens/evidence.json
(32 five-language states), final-screens/evidence.json (18 targeted states including
actual native-owner setup and selected-footer handoff), offline-evidence.json;
product/adapter/clipboard, owner-page and first-publication tests, typechecks and
localization/spec validation. No real external message, production write, full
release gate, Android build or commit is claimed. S105 field/publication
restrictions and their approval request are superseded by the owner's correction.

## S107 — local role/workflow audit (in progress)

FE_BASE route/root recovery (`app/error.tsx`, `app/global-error.tsx`,
`components/RouteRecovery.tsx`) uses the installed Next retry contract and safe
catalog-backed messages. `scripts/test-route-recovery.ts` and 15 focused
component-browser locale/viewport states pass, including contrast. This evidence
does not inject a failure into production or prove production runtime behavior.

FE-056 uses the shared native CitySelector for saved city, invalidation and
visible lookup/category retry. The web cover editor uses `lib/browser-json.ts`
to bound transport and response-body decode without replaying a timed-out write.
`scripts/test-owner-city-ui.ts` and `scripts/test-browser-json.ts` prove stale
selection, exact-coordinate retention, response validation, abort and safe retry
state contracts. FE-026 `scripts/test-workspace-context.ts` proves fixed role-home
fallback, absent-context no-query behavior and canonical owner tenant scope.
All six `npm run test:workflow-ui` tests pass. Actual post-fix support product
routes return to the authorized support queue. FE-065 touch-target browser
measurement and full owner persistence captures remain active.

BE-054/FE-065 admin worldwide placement is corrected in the existing discovery
adapter/form. `scripts/test-independent-discovery.ts` passes real isolated
PostgreSQL tests for worldwide/inclusive/zero coordinates, malformed/range
rejection, unchanged other tenant and stale owner-proposal denial. No migration
or provider change is introduced.

The role directory is verified; the protected S107 HTML guide contains exact
local accounts, code retrieval and paired test instructions. Actual web and
Expo-browser transport assertions complete with DB-confirmed exactly-once
messages, assignment/capacity, private-note isolation, lost-ack retry, end,
retained callback/history, resolve and reopen. The combined run remains FAIL
because Next development performance instrumentation throws on redirected
Dashboard/retired-health components. No exception filter or runtime patch was
added. Owner/support, remaining screens and native audit are still in progress.

Evidence is under `.local/workflow-audit-s107/`. Android debug compilation and
installation succeed; system-wide emulator ANRs do not constitute an app pass.
Earlier infrastructure/stale-harness failures remain recorded. No full check,
release/acceptance gate, commit, production write or publication is claimed.

S107 subsequent focused owner evidence: `scripts/test-owner-editor-failures.ts`
proves rejected-save recovery, in-flight guards, sanitized errors and preservation
of the installed Next redirect control flow. Actual web/Expo owner capture
`owner-agent-final/verified.json` passes cover conflict/retention followed by real
save/re-entry, private account updates, business/handle failed network saves then
successful persistence, native-browser city failure/Retry/save and five locales.
Cleanup removes only its two uploaded assets and disposable owner identities.
Six actual compact-control layouts at 1440/390/320 and the real 20-second web
cover timeout/retained-photo/reenabled Save state also pass. Screenshot geometry
uses local renderers; OSM tiles are blocked and this does not prove native touch.

FE-053/BE-044 storage and Auth corrections use
`scripts/test-transport-storage-ui.ts` and `scripts/test-mobile-auth-fetch.ts`.
Ten focused actual-component/installed-SDK port tests pass, with no external
Auth request: five-language explicit recovery, unknown-session no-new-chat,
stale unmount, request/body deadlines, cancellation/cleanup, successful OTP and
refresh/status semantics. Actual Android OS workflows remain unverified after
system-wide emulator ANRs; the emulator is stopped and its unused fixture removed.

S107 final focused browser checkpoint: the role/context inventory completes 187
states (168 web, 19 Expo browser), with zero horizontal overflow. Twenty-two
320px states include contrast checking; the only unchanged contrast flag is the
Suqpage logotype, covered by W3C SC 1.4.3's explicit logotype exception. Raw
findings remain recorded. FE_BASE primary-heading semantics pass 15 actual
five-language states; actual product-gallery keyboard focus/ArrowRight scrolling
passes after the narrowly scoped accessibility correction. No global contrast
rule or browser-error assertion was disabled.

First-Publish current-source capture passes private web preview/readiness and
five-language Expo readiness, missing-field navigation, stale re-review,
failure-retained confirmation, actual publication and live projection. Read-only
reconciliation proves zero remaining fixture Auth/users/businesses. Frozen
owner-support completes both-way replies, exact-once staff writes, both-way
decoded image attachments, foreign-owner case/file denial, reassignment denial,
end/history and automatic reopen. Combined transport/support captures still fail
only their strict Next development performance-error gate; the exceptions remain.

Dedicated attention capture passes independently with zero browser exceptions:
ten exact incoming read cursors across owner/visitor web and Expo, assignment
versus actual join, hidden/covered unread, alert acknowledgement separate from
transcript reads, seven exactly-once staff replies, opted-in sound dedup/mute,
five-language alert layouts and retired-inquiry 410/no-row/no-alert. Its three
cases, three users, one business, three provider identities and preferences are
reconciled to zero. No hosted or physical OS notification delivery is claimed.

Logout regression uses actual Runtime/Account/Settings plus the installed SDK.
It fences stale Auth/owner requests, always clears private UI, shares concurrent
attempts and retains provider-scoped failure/Retry until local cleanup succeeds.
The deprecated custom processLock reproduced a secondary unhandled SDK promise;
default installed-SDK coordination removes that error without suppressing it.
Twenty actual five-language storage/logout states pass. Final focused aggregate
`npm run test:workflow-ui` passes 23 tests; both final typechecks, auth-runtime,
localization, narrative and 196-spec validation pass. Native device interaction,
visual approval, full production-mode gates, scoped commit and rollout remain
separate pending steps. The protected REVIEW.html and TEST-GUIDE.html are ready.


## 2026-10-16 S108–S110 local workflow candidates — review pending

BE-018/FE-019/FE-026 S108 routing is implemented and isolated-PostgreSQL tested
by `scripts/test-support-routing.ts`, including workloads over 100, concurrent
least-load/fair-tie assignment, paused ownership, queue/role admission, FIFO 100
recovery, idempotency and exact alert history. Existing support, buying, transport,
attention and staff boundaries/navigation regressions pass sequentially. Actual
web/Expo paired reference/assignee/join and paused-assignee Save checks pass with
zero errors and disposable-fixture cleanup. The reported older case is unchanged;
its original conflicting display remains causally unproven. Actual-component
stale-response/picker/workload tests cover reproduced defects independently.

FE-026/BE-032 S109 has deliberate staff-create/edit screens and one authorized
business context. `scripts/test-business-settings.ts` and
`scripts/test-business-assistance.ts` verify fresh-role/version/audit atomicity,
legacy-association revocation and rejection of scoped queue agents as new page
editors. Actual component/action tests cover focused editors, retained failures,
origin normalization, role denial and readable records. Real admin capture
completes 36 states/seven save/conflict/Cancel workflows with cleanup; final 28
read-only locale states have no overflow/accordions/runtime errors/writes. Owner
Business details/private settings read/edit/cancel capture completes 50 states.
Staff workload capture completes 20 states plus blocked failed Save, with retained
values and no submitted data writes. Protected evidence is under the corresponding
S109 directories within `.local/workflow-audit-s107/`.

FE-065/FE-053 S109 web and Expo exploration each pass 40actual layout states in
five languages. Products starts on the right and follows a leftward handle drag;
a rightward map-handle drag returns. Keyboard/reduced-motion, focus, independent
queries, loaded-list position and mounted map survive switches. Short-height
launcher/zoom/handle checks pass without overlap. A reproduced web keyboard action
was swallowed after a pointer drag; keyboard activation now bypasses only pointer
click suppression and the actual pointer-then-keyboard regression passes. Native
focused component tests pass2/2. Evidence is in
`.local/workspace-design-s109/web/verified.json` and
`.local/workflow-audit-s109/native-agent/right-origin/final-evidence.json`.

FE-056 S110 compact Account hub and Your page submenu pass 4actual RSC tests,
including correct canonical tenant reads, real metrics, exact five/four tasks,
no private payload on the hub and staff/unlinked-owner rejection before data reads.
Actual web capture completes 38states across320/390/1440 and five languages, real
API metric comparison, all task/focused routes, saved-summary/Sign-out placement,
48px targets, no errors/writes. Evidence is
`.local/workflow-audit-s107/owner-account-s110/evidence.json`. Native Account
component/privacy/logout/notification-opt-in regressions pass 11. Actual Expo
Account capture completes 75read-only states across five languages with zero
runtime/API/write failures. Ten supplemental preview/edit states wait for loaded
owner content rather than capturing a loading placeholder. Evidence is
`.local/workflow-audit-s107/native-account-s110/workflow-outcome.json` and
`readiness-outcome.json`; installed Android is a separate gate.

These are local focused passes. S100–S110 visual approval, expensive full/release
gates, reviewed task-isolated commits and hosted/web/Android rollout remain pending.
Actual Android device/MapLibre/OS notification UX remains unverified after the
previously recorded system-wide emulator ANRs. No test suppresses those limits.


## 2026-10-16 S111 local inactive-chat and public-help candidate

BE-018/FE-019/DEP-043 additive migration65 adds only two nullable fields and an
open-clock partial index. No legacy clock backfill occurs. The real isolated
`scripts/test-support-inactivity.ts` suite passes threshold/window boundaries,
waiting/notes/read/join exclusions, legacy preservation, unsupported owner-note
no-write rejection, clear/reassign/reopen, exact-once event/alert/assignment
release, token/ref/role/manual-resolution denial, resume/message/sweep races,
limit 25, try-lock, work-start budget and audit/statement rollback. Two indexed
participant branches are proved against 1500 not-yet-due owner clocks and 1500
retained closed rows; computed deadlines order the bounded merge fairly. Actual
same-session tests prove the five-second LOCAL idle-transaction protection is
restored after both commit and rollback. Six existing/new support suites pass
sequentially: inactivity, read receipts, live transport, buying, core support and
S108 routing. Protected aggregate is
`.local/workflow-audit-s107/chat-compat-s111-verified-results.json`; the later
idle-lock final pass is recorded separately in that evidence directory.

`scripts/test-chat-inactivity-ui.ts` and `scripts/test-support-thread-refresh.ts`
pass actual React/web/native-adapter deadline/warning/retained-draft/resume/error
and stale-response checks, hidden/closed cadence and single pending transition
guards. A concurrent render had incorrectly cleared the refresh guard; committed
effect synchronization and the real React/Suspense regression prove the fix.
Workers have separate success/failure/target/time-budget tests; local imports do
not start work and hosted/old/private targets are rejected before a sweep.

The exact verified local public schema64→65 operation preserves every support
table count and SUP-42EA05B3824C metadata; all new clocks stay null. The guarded
local CLI --once completes with ended 0. Protected migration evidence is under
`.local/workflow-audit-s111/migration/`. No hosted migration is performed.

Actual paired web/Expo/owner workflows complete 47 locale states, real public
staff replies, warnings, a locked exact-three-fixture maintenance run and
same-reference authorized Resume with native drafts retained. History/alerts and
cleanup are DB-confirmed. An initial final-row JSON guard failed on bigint
string/number parser types after runtime initialization; the original failure is
retained. Independent read-only reconciliation reproduces that type change and
proves original-case metadata, null idle fields and all five support-table counts
match the pre-capture migration receipt. No more sweep/restore is used to reconcile.
Verified composite evidence is `.local/workflow-audit-s111/paired/verified.json`
and `protected-verification.json`, with zero fixture rows remaining.

FE-036/FE-053 public launcher placement passes route/actual-shell component tests.
Actual completed segments verify 50 five-language web states,25 loaded Expo public
routes and 4 short product/Market states,48px targets, navigation/action clearance,
transport modal focus and unchanged social inquiry/manual-copy interaction. The
original strict web RequestPage development-timing failure remains recorded; an
isolated-context controlled web retry passes. Native locale/tablist/readiness
harness corrections are preserved/classified, not silently rewritten as passes.
Receipt: `.local/workflow-audit-s111/native-agent/final-evidence.json`.

Visual approval, full production-mode/release gates and physical Android/MapLibre/
OS verification remain outstanding. Focused browser/port evidence is not an APK
or production claim. No commit, push, provider change or public release is made.

Final S111 focused verification passes the serial workflow UI aggregate 58/58,
both web/native typechecks, localization 12/12 (1507 messages in each non-English
catalog), validation of 196 specs/ADRs, and PWA/narrative checks. The initial
aggregate's unrelated owner-city native bundling adapter failure is retained;
only the missing test adapters changed, with all city assertions preserved.
Receipt: `.local/workflow-audit-s111/workflow-ui-verified.log`.

The final owner-chat regression holds a stale closed GET across Resume and the
new refresh loop: only its own current-generation response may select the slower
closed cadence. The focused inactivity UI tests pass 3/3 after that correction.
Eight settled English/Amharic web warning/ended states at phone/desktop widths
verify themed 48px Resume/secondary actions, real Resume and protected cleanup;
earlier transient/pre-theme captures remain preserved. Receipt:
`.local/workflow-audit-s111/web-ready/workflow-outcome.json`.

After fixture cleanup, the guarded recurring local maintenance command started
successfully at a 60-second interval; its first sweep ended zero conversations.
Web3102, Expo8082 and Mailpit54324 return HTTP200. Whitespace checks pass and the
pre-existing deno.lock digest is unchanged. Final local receipt:
`.local/workflow-audit-s111/final-local-review.json`. These focused results do not
replace the still-pending visual approval and full release gates.


## 2026-10-17 S112 product-only candidate — focused tested, visual review pending

FE-067 / BE-056 / DEP-046 supersede active service-listing admission. Active
product writes use standard_product or made_to_order; omitted valid legacy
product modes survive, service conversion is explicit, and all public exact/fuzzy/
by-ID/count/metadata/social selection paths exclude services. Historical rows,
kinds, revisions and inquiry snapshots are retained. New typed projections,
strict filter validation, independent custom filtering and bumped browse cache
keys are covered by `scripts/test-product-only-catalog.ts` and compatible upkeep,
service-history, independent-discovery and mobile-API suites. Five isolated suites
pass; subsequent catalog-label and public service-only metadata regressions pass.
Receipts: `.local/workflow-audit-s112/backend/compat-results.json`,
`catalog-label-final-results.json` and `product-only-metadata-final.log`.

The web owner editor no longer flattens made-to-order records during ordinary
saves. `scripts/test-product-only-web.ts` passes actual React/browser supply
selection, explicit retired-service conversion, toggle/keyboard/reset and scope
separation tests. Native component tests cover corresponding payloads, preserved
legacy modes, truthful statuses, preview exclusion, refreshed social selection,
forged/stale options and checkbox keyboard activation. Actual installed Leaflet
resize→unmount reproduced _leaflet_pos; listener teardown/current-instance guards
pass `scripts/test-mobile-map-lifecycle.ts` without suppressing exceptions.

The reviewed one-time LOCAL correction admits66 maintained demos plus the private
review fixture only:106 product rows changed,50 normal catalog versions appended.
The maintained264 products are163 standard/101 made to order; the private review
fixture has2 standard/1 made and remains draft with no publication/catalog version.
Exact before-images/digests, row/version locks, whitelisted fields, protected
identity/contact/GPS/media/history/outside-tenant hashes and readonly replay prove
preservation. Hero overrides were checked independently. Receipt:
`.local/product-only-s112/applied.json`, `replay-final.log`, `public-api.json` and
`public-showrooms.json`. No real-tenant text or hosted data is rewritten.

All1546 messages are authored across en/am/om/so/ti; localization13/13, physical
starter3/3, isolated starter/demo PostgreSQL, category art, narrative and prepared
launch-copy limit checks pass. Native-only conditional labels had been incorrectly
pruned as server-only; generation now scans native app/src and the regression
proves client availability. Existing branding, interpolation, merchant literals,
privacy and payload bounds pass. Human native-speaker review is not claimed.

Actual public web verification has48 completed states, owner readonly8, and a
separate10-state compact-filter layout pass at320/390 across five languages.
The original web run43/45 ended with a60s Tigrinya About navigation timeout;
strict fresh-context supplements completed missing About/invalid-link states,
retaining the original failed receipt instead of claiming it passed. A readonly
owner harness initially counted the disabled placeholder as a supply option;
corrected assertions prove that placeholder plus exactly2 enabled choices.
Receipts: `.local/product-only-s112/web-supplement/combined-verified.json`,
`owner-readonly/combined-verified.json` and `filter-layout-web/outcome.json`.

Real marked-demo owner saves change supply with stable ID, public mobile readback,
return to original supply and reload. The initial raw-row equality assertion
correctly halted after existing legacy photo/video references were materialized
into media_json by normal FE-050 save behavior. Protected before-images and the
failed attempt are retained; the remaining deliberate UI save proves all other
fields and effective ordered gallery references identical. No raw-gallery restore
occurred. The two normal owner saves append their usual two catalog versions and
advance that demo business version twice; the protected correction itself appended50.
Receipt: `.local/product-only-s112/owner-roundtrip/outcome.json` and
`attempt-1/`. Gallery regression passes; its stale schema63 assertion was updated
to the verified compatible schema65, preserving every gallery/security assertion.

Native actual Expo completed public/owner/loaded-media segments and later compact
filter supplements are recorded in `.local/product-only-s112/native-agent/`.
Original keyboard, map and direct-History timeout evidence remains distinct from
corrected passes. Normal Back to account is tested; synthetic History and physical
Android MapLibre/OS behavior are not silently inferred from browser evidence.

Visual approval and full check/release/acceptance gates remain pending together
with S107–S111. No commit, push, binary, hosted configuration or deployment is made.

S112 final aggregate `npm run test:workflow-ui` passes69/69, both web/native
typechecks pass, localization13/13 and199 specs/ADRs validate. Final balanced
phone filter layout passes10 actual web states and12 Expo states across all five
languages: every complete label stays in its cell,48px targets,48px rows, and
single-word native geography remains unbroken. Global Clear sits in Search, query
clear remains separate, and a selected native checkbox retains a visible check.
Earlier equal-width/tight-padding screenshots and negative receipts are preserved.
Final refinement tests pass2 web and9 native; no criteria/backend contract changed.
Receipts: `.local/product-only-s112/workflow-ui-verified.log`,
`web-ui-layout-final.log`, `filter-layout-web/outcome.json` and
`native-agent/filter-layout/capture.json`/`focused-final.log`.

Final local review: `.local/product-only-s112/review.html`; testing accounts/steps:
`.local/workflow-audit-s110/TEST-GUIDE.html`. Web3102, Expo8082 and Mailpit54324
return200; the guarded local minute chat worker remains active. Whitespace passes,
pre-existing deno.lock is unchanged and unrelated dirty work is preserved.
No task commit exists because explicit visual approval/full gates remain pending.


## S113 — counted floating selections and compact transport (local, review pending)

FE-041/FE-036/FE-053: web PublicActionDock hosts portal-based current-showroom
list access and the single persistent PublicSupportChat instance. Its navigation-
session fallback points to the original handle; ShowroomApp waits for matching
route/catalog hydration, revalidates canonical selections and uses identity-based
quantity/removal. Direct composition never substitutes the saved group. Native
PublicActionDock reuses root/Market placements and the existing session basket,
with measured clearance and direct/group/private-route exclusions. Short Market
stages use one centered row; other public screens keep a labeled stack.

Mapped focused regressions: `scripts/test-floating-inquiry-web.ts` (six changed
scenarios pass across four initial passing cases, a targeted query-focus retest
and the deferred-fetch loading regression, with original failures retained), `scripts/test-mobile-public-action-dock.ts`,
`test-mobile-market-layout.ts`, `test-public-transport-launcher.ts`, existing
`test-product-inquiry.ts`/`test-browser-clipboard.ts`, and localization tests.
Component ports and actual local web/Expo evidence remain distinct. Web final
typecheck, narrative and 199 spec/ADR validation pass; native final typecheck passes.
No API/DB/provider/dependency/signing change, automatic send, commit, deployment
or new binary occurs. Explicit visual approval/full gates remain pending.
Final local review: `.local/floating-actions-s113/review.html`. Combined capture
receipt: `combined-verified.json` in that directory; 105 current unique states
(25 English/80 other-language) cover desktop/320/390/short web and Expo browser.
Two initial centered short-web showroom images are retained only as superseded;
all seven original incomplete harness receipts remain explicitly failed. Captures
use existing marked demos and real public API reads, intercept analytics204 and
block application writes/external sends. Protected application hashes are unchanged;
no fixture, customer inquiry or transport chat was created. Merchant content stays
literal. Readiness states captured before the loading-only correction remain
visually unchanged; its separately mapped deferred-fetch regression proves pending,
failed and retried GETs with no premature form/error and all draft fields preserved.

Web six-scenario receipt: `.local/workflow-audit-s113/focused-web-results.json`;
loading proof: `transport-refresh-loading-verified.log` there. Native final row
proof: `.local/public-actions-s113/native-agent/short-market-refinement.json`.
Localization14/14 and 1548 keys pass. Web final type/spec logs are under the S113
review directory; native typecheck and narrative pass. Task whitespace passes and
pre-existing deno.lock retains SHA256 5af7ac053eac531ecf35eb82bb8d1a8996a1e8c811af9bd74a3e4222cb226f76.
No staged change/commit/full gate/remote mutation/new binary is claimed; earlier
pending visual approvals remain outstanding.

## 2026-10-17 S114 — account-owned transport (local, review pending)

BE-018/FE-019/FE-053/FE-056 add Account → Transport chat on web/phone/native,
with the same paired visitor form/chat presentation and separate authenticated
application adapters. Transport sits after Products on the compact Account hub;
technical Support remains separate. Canonical private contact defaults are editable,
routes start blank, and account history recovers the same case across sessions.
No visitor token is adopted or read by the owner flow. Existing Transport staff
receive both kinds of request, with original route/contact summary and callback.

`scripts/test-owner-transport.ts` proves current tenant/role authorization, strict
commands/body/origin/ref guards, idempotent intake and changed/cross-kind conflict,
owner/history scope, private notes/attachments/carrier exclusion (including direct
owner domain lists), canonical reply visibility, same-business client display,
read/attention, unresolved End versus staff resolution, automatic-end Resume and
retained old-mobile adapter compatibility. Existing routing/inactivity suites also
pass. Isolated fixtures are cleaned; unknown/pre-existing test schemas are retained.
Protected receipts/logs: `.local/owner-transport-s114/backend-results.json`.

`test-owner-transport-workspace.ts`, `test-mobile-owner-transport.ts` and Account
hub tests exercise real React/SSR/native-controller code with explicitly controlled
I/O/lifecycle ports: paired fields, canonical defaults, failed-draft/key retention,
edited retries, pending/unmount/account fences, exact case recovery/history,
legacy notification redirect and staff contact summary. Shared visitor assignment,
idle, recovery storage and public placement regressions retain passing evidence.
The queued-close/open-intent regression covers rapid reopen, stale recovery and
ordinary Escape. Long Somali labels revealed a paired-input alignment defect;
shared CSS now aligns inputs without truncating native labels.

Final read-only actual app captures pass **60 states / ten navigation workflows**
across all five languages, desktop/320/390/short web and Expo browser, with zero
runtime/console/API/guest-channel/unexpected-write errors and protected application
hashes unchanged. `.local/owner-transport-s114/combined-verified.json` preserves
historical failed attempts separately. Six contextual phrases are native-authored;
localization15/15, all1554-message catalogs, final web/native typechecks and
199-spec validation have passing evidence. Review: `.local/owner-transport-s114/review.html`.

Actual paired owner/staff/Expo workflows verify automatic assignment and join,
public replies and visible reads both ways, cross-session recovery, unresolved
owner End, distinct staff resolution, histories, reload and empty new intake.
`paired/verified.json` explicitly derives verified application evidence from the
raw guarded run: its sole final failure was one blocked local Next development
source-map lookup, classified from installed Next middleware and screenshot caret
injection evidence. The raw failed exit is not relabeled as a full harness pass;
no unexpected application write/error was ignored. Eight screenshots and four
functional groups passed; each labelled attempt removed only its exact case/audit
rows, with zero remaining fixtures and unchanged unrelated support/catalog/staff.

Outgoing push/Telegram was disabled only in a temporary local server process for
these fixture exchanges; saved environment/provider files and production were
unchanged. Normal web and guarded maintenance processes were restored afterward.
Existing browser tabs briefly reported restart-time timeout diagnostics; subsequent
attention requests recovered normally. This is not a production-mode readiness
claim. Installed Android/OS delivery, visual approval (including earlier candidates),
full/release/acceptance gates, a scoped commit and deployment remain outstanding.
No new schema/provider/dependency/signing/binary or remote Git action is claimed;
pre-existing `deno.lock` retains its recorded digest and no files are staged.

## 2026-10-17 S115 — structured business management (local review pending)

FE-026/FE-056/FE-053 replace remaining omnibus management with named tasks.
Admin business context retains permission-filtered Overview/Your page/Products/
Business details/Location & visibility/Access. Overview is concise saved activity;
Categories is a Products subtask with read-first rows and selected Add/Edit or
removal confirmation. Identity/live/sharing each has its own saved/editor state.
Access owns sign-in, staff assistance and status; scoped sponsors retain business
context. FE-019 moves staff Assignment history to a protected read-only route.
Per-actor/business list return origins and active parents remain bounded.

Owner Your page groups eight concrete tasks; About/video/contacts/color/team and
cover/address open focused controls. All eight social/public contacts, complete
page content and version fences survive unrelated edits. Task switches preserve
work; Cancel offers Keep editing/Discard. Readiness opens the real missing task;
Preview retains publication/restore. Native Save/Cancel share a wrapping row with
quiet Back/Preview navigation. Duplicate headings/handle controls and private
account summary/edit overlap are corrected without changing authority.

BE-032 focused settings merge only allowed section fields from the locked
canonical row under the version/audit transaction. BE-044 adds native consent
projection/action using the existing owner-only service. BE-033 closes current
Support/Transport category access through retained assignments/stale principal
snapshots, rechecking queue scope under the existing transaction lock.

Evidence: 52 combined focused tests pass in
`.local/workspace-structure-s115/focused-post-polish.log`; the subsequent actual
component/effect return-origin regression makes53 unique cases (workspace file3/3).
Tests: `test-business-record-ui.ts`, `test-business-workspace-ui.ts`,
`test-business-settings-ui.ts`, `test-admin-editor-actions.ts`,
`test-focused-edit-form.ts`, `test-owner-focused-tasks.ts`, owner/native hub,
editor/settings failures and `test-staff-navigation.ts`. These run actual components/
actions through controlled I/O ports; they do not impersonate provider delivery.
`test-business-settings.ts`, `test-mobile-api.ts` and
`test-standard-page-postgres.ts --category-security` pass real isolated PostgreSQL
preservation/authority/version/race/audit and API checks; schemas are cleaned.
Web/native TypeScript,199-spec validation and localization16/16 pass; catalogs
contain1568 keys. A contextual Oromo identity label and Owner sign-in wording
avoid ambiguous menu meanings. Human first-language review is not claimed.

Actual local evidence is `.local/workspace-structure-s115/combined-verified.json`:
**156 current states /15 navigation groups**, admin/owner web and Expo browser in
all five languages, desktop/320/390. There are zero runtime/console/API/application-
write errors and unchanged protected application data. Saved/edit/cancel tasks,
unsaved confirmation, preview, private settings and staff history are covered.
Final Account-header and lower-menu scroll geometry are independently verified.
The combined index retains61 superseded states and original failed attempts;
an initial native pointer-events warning was fixed, while later exact-name and
Oromo-nav selector ambiguities were classified as harness failures. Completed
groups from a preserved failed raw run are supplemented explicitly, never relabeled
as a raw pass. Final health persists12-table metadata fingerprints and web/Expo/
Mailpit HTTP200; capture browsers/pools are closed. Local maintenance resumed
after the quiet read-only pass, with its first sweep ending zero cases.

Review: `.local/workspace-structure-s115/review.html`; exact test accounts/routes:
`.local/workflow-audit-s110/TEST-GUIDE.html`. Master §§5,13,15,18–19,21–22, specs,
checklist and guide describe the verified local candidate. HEAD remains038a143;
the existing dirty baseline and deno.lock digest are preserved. No schema/provider/
dependency/signing/new binary, staged commit, push or deployment is claimed.
Explicit visual approval (including earlier candidates), full/release/acceptance
gates, a scoped commit and separately authorized web/Android rollout remain pending.
Expo browser proof is not installed Android/MapLibre/OS-delivery verification.

## 2026-10-17 S116 — persistent request ownership and backlog reconciliation

Operations/documentation and test-harness preparation, not a new product feature.
Three agent audits reconcile owner/admin management, support/transport/security/
release, and public discovery/localization/marketing against existing evidence.
The transition checklist now begins with the current work board, stable agent
ownership, first remaining dependencies and separate implementation/test/approval/
deployment states. Dated old `CURRENT` entries remain historical; completed
Firebase/signing/closed publication are not repeated as new work. Existing
S107–S115 visual/full gates and current-source Android/OS limits remain explicit.

Current operator guidance, the protected test guide and Play READINESS distinguish
the S115 local candidate from released baselines. Play availability/eligibility
are last recorded outcomes, not fresh enrollment proof. FE-065/BE-054/DEP-045
current clauses reflect later product-only/social-contact decisions, with old
history retained. Master §§8/9 remove obsolete business-send/alert instructions,
preserve legacy private records/social copying and retain support/transport;
§24 records request retention and root integration responsibility. Matching promo
artwork, exact hosted demo corrections and actual installed-device workflows
remain genuinely unfinished work with explicit owners.

The four bounded acceptance/capture journeys now enter read→Edit→Save→return,
Account settings sign-out and focused page contacts/video tasks. Historical video
compatibility and role/media/privacy/persistence assertions are preserved; there
is no default management-contact accordion selector. New DB-readback assertions
protect all eight saved/cleared contacts across an unrelated About edit.
`workflow-retention-s116/harness-static-verified.json` records four syntax checks,
ten static journey checks,26 retained assertions and32 passing focused owner
tests. Root TypeScript passes; Playwright collection lists20 tests across three
files without executing them.199-spec validation and static narrative/launch
material checks pass, with the existing Node module-type warning unsuppressed.
Scoped whitespace and operator-link checks pass.

No browser/DB/provider/production/build/signing/commit/push action was performed
for S116. Static journey collection is not a passed full acceptance or live save
workflow. The dirty baseline and all earlier requests remain preserved. Current
visual approval, full/release/acceptance, reviewed rollout and Android/OS/marketing/
hosted-demo work remain open; the process request did not grant UI approval.

### 2026-10-17 — S117 selected Market panel and safe return navigation

FE-065/FE-053, L1 defect. The current local candidate remembers Businesses/map
or Products and both independent search/filter scopes on ordinary Back/Market
returns. Explicit URL/history intent wins; deliberate map/reset actions remain
explicit. A dedicated bounded browser-session/native-memory snapshot cannot be
overwritten by Featured's separate source-return key. No result/account payload,
API, database, provider, dependency or language-copy change was introduced.

Implementation: `lib/market-workspace.ts`, `components/DiscoveryWorkspace.tsx`,
native `src/market-session.ts`, `app/(tabs)/index.tsx`, About's explicit map action
and the shared monotonic intent helper in `incoming-link.ts`/`+native-intent.tsx`.
Market's Android Back handler is focus-scoped. Expo's own route/history authority
replaces the competing raw popstate listener; URL persistence cannot overwrite
an outgoing page during an asynchronous return. Existing source showroom and
Featured navigation remain separate. Web Clear filters is an explicit reset.

Actual navigation exposed two Leaflet lifecycle races rather than a panel-state
failure: retained resize/move callbacks and the SDK's untracked 250ms zoom
completion after destruction. `MarketplaceMap.tsx` and `MarketMap.web.tsx` cancel
owned work/detach listeners and finish an active owned zoom before removal. Narrow
typed compatibility with installed Leaflet 1.9.4 is covered by actual SDK/CSS
regressions; there is no global patch, swallowed exception or animation disable.
Native Android MapLibre, marker appearance, clustering and map providers are
unchanged. Mounted pan/zoom/resize/Reset/selection and replacement isolation pass.

Focused evidence: `.local/market-return-s117/focused-tests.log` records 27/27
passing cases in `test-market-workspace.ts` (3), `test-market-workspace-ui.ts` (5),
`test-mobile-market-layout.ts` (8), `test-mobile-app-links.ts` (6),
`test-web-map-lifecycle.ts` (3) and `test-mobile-map-lifecycle.ts` (2). Web/native
TypeScript checks pass. Pure/storage tests include canonical bounded criteria,
expiry, malformed/denied storage and default Businesses; actual components cover
restore-before-write, independent queries, route reuse/remount, explicit/legacy
links, metadata, queued navigation and blurred Back cleanup. New regressions are
wired into the existing workflow gate. The app-link correction preserves legacy
product-filter compatibility while asserting the product-only/custom-order
contract; security/signing assertions remain intact.

Actual local evidence: `market-return-s117/combined-verified.json` separates the
26 web navigation assertions in a retained strict failed run from five clean
post-fix map-departure checks. Source hashes prove only the map component changed
between them. The final current-source Expo run passes 16 groups, including both
panels, product/showroom browser/header Back, About/Featured→Market, Featured
source return, repeated explicit map actions and ordinary return after a manual
choice. Final receipts have zero runtime/console/API errors and no unexpected
application writes. Six selected review images include two corrected Expo states
using the installed SDK stylesheet. External tiles/media remain controlled;
normal GET rate/cache bookkeeping is permitted, not a business/catalog/chat/auth
mutation. The initial hydration/dev-overlay harness limits and all actual map/
explicit-intent failures remain recorded, not relabeled as successful runs.
Phone-web Market navigation uses keyboard focus/Enter where the Next development
indicator overlaps its pointer target; no app control is hidden or force-clicked.

The current master §§5/10/19/22 and exploration statement, controlling specs and
work board reflect these verified local outcomes. Prior dirty changes and the
unrelated `deno.lock` checksum remain preserved. No commit, push, hosted write,
production build/deployment or Android artifact was created. Full gates remain
behind the inherited visual approval; installed Android/MapLibre/hardware Back,
OS notifications, exact hosted demo operations and marketing/release work remain
separate open workstreams. Expo browser is not native device proof.

### 2026-10-17 — S118 working demo contacts, business-local lists and staff tasks

FE-066/FE-041/FE-053/FE-026 with BE-055/DEP-045. The latest contact instruction
uses the owner's number for SMS/WhatsApp/Telegram on every marked demo, with
ordinary official TikTok/Instagram/Facebook example profiles and example.com.
Only the three messaging methods appear in the inquiry composer; localized
automatic product copying remains, and profile browsing does not copy a message.
Server projections freshly derive per-method demo approval from effective public
contacts and a nonsecret operator setting; stale or forged client metadata cannot
enable an unrelated fake destination. Private contacts and real businesses remain
outside the exception. Public business inbox submission remains retired, while
transport and business-owner support remain intact.

Implementation maps to `lib/demo-inquiry-policy.ts`, business contact/profile
projection modules, `lib/product-inquiry.ts`, web ShowroomApp/BusinessProfile,
native inquiry/ShowroomContent/link-policy and typed public contracts. Six new
interface strings are authored in all four non-English catalogs and generated
manifests. Telegram explicit phone links are narrowly parsed without widening
invite/unknown-host handling. No new integration/dependency is added.

The web floating list has no last-shop fallback. Native `inquiry-baskets.ts`,
`inquiry-basket-storage.ts` and `use-business-inquiry.ts` provide independently
persisted reference lists by API origin and business ID, at most20 items and a
bounded64KiB record. Current catalog products/options rehydrate counts/messages;
foreign/stale selections are pruned. Coalesced reads cannot be overwritten by
early writes, serialized writes preserve the last durable value, and read/write
errors retain usable selections with Retry. Existing Expo document storage is
used on devices and localStorage in the Expo browser. Direct single-product
inquiries leave stored lists unchanged. Root/product/showroom/safety components
use that store; the old runtime basket is a one-release migration bridge only.

Admin refinements use Carbon shell/table and Ant navigation primary guidance
linked in FE-026. Business facts link to contextual tasks; the active business
tab reveals itself within its own nav. Staff has peer Accounts/Workload tasks,
and Manage opens one focused editor with bounded filtered-list Save/Cancel
returns. Roles, queue scope, canonical records and version fences are preserved.

Focused verification: `.local/contact-workspace-s118/focused-tests.log` records
92/92 passing cases across18 declared test files, including new
`test-business-inquiry-baskets.ts`, `test-demo-inquiry-policy.ts` and
`test-contact-handoff-native-ui.ts`, plus actual web/native component tests,
retained market/logout/private-route tests and five admin test modules. Tests
cover cross-business/environment isolation, filesystem-shaped temporary ports,
read/write/race/size failures, fresh authority, copy/open failures and no-copy
profile taps. Three deprecated React Native pointerEvents props exposed by
actual captures were moved to styles;26 targeted cases and final web/native
TypeScript checks pass. Localization17/17 covers1574 keys per non-English
catalog;199-spec validation passes. Existing Node module-type warnings are retained.

Actual local evidence: `business-inquiry-s118/actual/attempt-2/outcome.json`
records three passing surfaces (1440 web,390 web,390 Expo), six screenshots,
A=2/B=1 lists surviving navigation/reload, quantity edits, direct-item isolation,
hidden Market/Featured carts and enabled messaging/profile links. Eleven source
hashes remain stable. There are zero runtime/console/API/unexpected request
errors and no application mutations. The separate expected-network receipt
classifies31 raw navigation cancellations of intercepted analytics POSTs;32
attempts were fulfilled as no-op204 and never forwarded. External media and
clipboard/openers are controlled; SMS OS delivery is not launched. Original
attempt-1 errors are retained, not relabeled as passing evidence.

`admin-workspace-s118/verified/outcome.json` records12 desktop/phone states and
three actual navigation journeys in English/Amharic, zero runtime/console/API
errors or app writes, unchanged protected application data and12 stable source
hashes. Existing local admin sign-in uses normal authorized Auth; no fixture is
created and cookies/credentials stay in memory. The initial ambiguous-selector
failure is preserved separately. No management Save was exercised here; focused
action/security tests cover that boundary.

One-time local demo corrections are protected under `contact-workspace-s118/`:
phone plan digest `e24cec6e5f00ba7820f4094fa30c751605770ba8b2ac53dab6d85fe152d04d01`
and profile plan digest
`8e7bb7f9372636e66914cbdb5a40a24d5f6f6e357857e533e69d684565291057`.
Each verified exact127.0.0.1:54322 target admits67 marked demos, updates67 existing
drafts and appends66 current publication/catalog versions without rewriting
immutable history or first-publishing the private reviewer. Rollback rehearsals,
protected before-images, exact readback and actual no-op replay pass. The phone
operation changes only three approved public contacts; the later operation changes
the four example profile/site fields while preserving that phone correction.
All real/non-admitted/private records and login aliases remain unchanged. A
local-only nonsecret setting is added with an exact protected configuration backup;
normal web/worker restart and fresh public projection checks succeed. Hosted
outlines are prepared only and grant no mutation authority.

Current review: `.local/contact-workspace-s118/review.html`; the private local
test guide includes A/B list and messaging/profile journeys. The older
`capture-social-contact-workflows.mjs` still contains a pre-S115 owner-editor
journey and is not counted as a passed current acceptance run; its broader
fixture/Auth execution remains a separate harness follow-up before full gates.
Master/spec/checklist state matches these local outcomes. Existing dirty work,
HEAD and unrelated deno.lock are preserved. No commit/push, hosted mutation,
production deployment or new Android artifact was created. Explicit visual
approval, full/release/acceptance gates and all retained current-device/OS/marketing/
hosted/release workstreams remain open. Temporary filesystem ports and Expo
browser captures do not establish installed Android persistence or OS handoffs.

### 2026-10-17 — S119 actual chat reliability and staff task priority

BE-018/BE-050/FE-019/FE-026/FE-062/FE-053/DEP-043. Read-only diagnostics found
fresh local requests already autoassigned and old waiting work not rerouted by
GETs; there was no initially due inactivity clock. Concrete defects were native
latest-footer-only observation, async focus/overlay races, web visual viewport
coordinates, cached staff rejoin acknowledgements, and opener-only classification
of same-business colleague replies. Staff detail also put a blank company edit
form and duplicate summary before messages; closed cases could say Waiting.
Ready scenarios were recorded before each coordinated source change.

Implementation maps to web ChatReadObserver, native ChatReadSentinel transcript
provider/overlay generation/buying/owner-inbox, durable support sender-side SQL,
owner-transport projection and nullable migration66. Fresh role/tenant checks
derive every new message's side; old messages are not backfilled or reclassified
from mutable roles. Staff read identity includes the saved assignment epoch.
The new `support-staff-state.ts`, support routes/actions and bounded manager
recovery command distinguish lifecycle states, add Transport Waiting and retain
manual holds. Availability-save behavior and immediate uncapped new routing
remain compatible. Company editing is read-first with explicit Add/Edit/Cancel;
conversation/reply is first in DOM and main desktop column, context follows on
phones. Existing private authority/version/navigation boundaries remain.

Focused evidence is linked from `read-receipts-s119/native-agent/`,
`chat-routing-s119/` and `inactivity-s119/`:20 receipt/controller cases, six final
staff SSR/action/mounted-editor cases, ten supervised-startup/entry cases,
isolated PostgreSQL receipt/owner-adapter/routing/recovery/inactivity suites and
native full-install/idempotence. Final root web/mobile typechecks pass;
localization17/17 covers1577 keys per four non-English catalogs. New UI, recovery
and supervisor tests are registered in the existing workflow/support gates;
the stale native-install version assertion is updated to the verified66.
The existing Node module-type warning is not suppressed. No full check/release/
acceptance/container/remoteCI gate runs before visual approval.

Actual Google Chrome local intake, assigned staff replies, participant follow-up
and both read cursors are real UI/API/SQL, not fulfilled application responses.
The existing worker closes one labelled case after only its deadline is moved
to8seconds before the30minute threshold. Read-only reconciliation proves one
automatic-end event, released active assignment, retained historical assignee/
messages and unresolved status. `chat-reliability-s119/worker-actual-verified.json`
retains the original strict harness failure: it incorrectly expected historical
assigned_user_id=NULL. Earlier focus-emulation and commit-timing harness failures
are separately retained/classified. Chrome focus is explicitly controlled;
neither actual OS focus nor a real30-minute elapsed wait is claimed.

Actual Expo390 transport also completes assigned→joined, two real staff replies,
older-visible/newer-offscreen read, subsequent newest read, participant Sent→Read
and explicit ending. Its reconciliation records nine hashed screenshots and
durable message sides/cursors. The original strict run remains failed on one
blocked Next dev `__nextjs_original-stack-frames` diagnostic POST; no application
API failure/runtime exception occurred. Earlier429/shared test bucket and
fixture-name/CRLF/parse failures remain retained. A reserved local QA IP bucket
does not disable or reset rate limiting. Tokens/cookies are not serialized.
Installed Android, MapLibre, real keyboard/background/push remain unverified.

`chat-reliability-s119/workspace-final/outcome.json` passes12 current actual
Google Chrome desktop/phone English/Amharic states: Waiting, chat-first detail,
company Edit/Cancel and automatic-end detail. Runtime/API errors, app writes and
blocked writes are zero; the inspected customer case is unchanged. Source hashes
remain stable during this capture. Exact own diagnostic cases are backed up and
removed with unchanged-other-record checks; three ended QA cases remain for review.
No customer conversation was changed. Local migration66 protection, rehearsal,
readback and no-op replay are in `chat-reliability-s119/migration66/`.

The explicit `dev:with-worker` supervisor reuses target/schema/service guards,
reports child failure and stops only owned siblings; ordinary web-only/worker
commands remain. Root actually starts this local command successfully, with
worker count output and Next ready3102. External push is disabled only in QA
processes and the saved configuration is preserved/restored; Expo remains8082.
No provider/configuration/hosted/signing/build/Git publication occurs. Current
master/spec/checklist/operations describe local verification, not deployment.
Concrete review and combined receipts are under `.local/chat-reliability-s119/`.
Visual approval, full gates, scoped commit and coordinated hosted schema/API/web/
new Android release plus all retained earlier workstreams remain open.

Actual installed Google Chrome owner support adds Account→Support creation,
assignment and both-direction replies/read cursors, followed by ordinary owner
Close and staff closed-state readback. The initial hidden desktop-link selector
failure remains preserved; a bounded continuation reuses the same labelled case
without new fixtures. `read-receipts-s119/owner-live/continuation-321/verified.json`
passes with six screenshots and zero runtime/API/unexpected-write errors. All
three labelled review cases are closed; no actual owner24-hour elapsed wait is
claimed. The final supervisor restores ordinary local startup after process-only
push isolation, with the saved configuration checksum unchanged.

### 2026-10-17 — S120 mandatory actual browser user journeys

The owner explicitly requires actual Chrome user-style testing for future UI/UX,
layout, navigation, admin/staff/owner/visitor work, including affected Expo8082.
AGENTS.md step8 and `docs/operations/BROWSER-WORKFLOW-REVIEW.md` now make this
recurring policy explicit. FE_BASE and master §22 link the procedure. The guide
requires real entry/click/type/Back/Save/Cancel/reload/error/permission journeys,
authoritative scoped API/persistence checks, role/platform coverage and honest
source/screenshot/error/control receipts. Component mocks/screenshots alone are
not completion. Existing visual approval/full gates, private fixture/credential
boundaries and native-device verification remain; no extra provider or release
permission is introduced. S119 actual Chrome/admin and Expo evidence demonstrates
the workflow and its declared focus/strict-harness limits. Local links, whitespace
and spec validation cover this documentation-only policy update.


### 2026-10-17 — S121 automatic recovery of ordinary waiting chats

BE-018/FE-019/FE-026/FE-053/DEP-043. The owner rejects the earlier manual queue
recovery dependency and implicit case-hold interpretation. Ready scenarios and
ordered checklist precede implementation. Waiting now always re-enters automatic
routing; existing receiving settings/queue scope define eligibility. New-request
and availability commands keep their immediate uncapped behavior.

`lib/support.ts` adds the internal bounded `sweepWaitingSupportAssignments`:
shared support-work try-lock, current role/queue/availability, oldest eligible
candidates before100limit, at most25 assignments/3second work-start budget and
LOCAL statement1s/idle5s/lock50ms limits. Reuse atomic assignment/events/attention
with null system actor and automatic reason. No migration, dependency, fabricated
manager, GET/polling mutation, heartbeat, implicit hold or per-agent cap.
The local immediate/minute worker and existing Netlify minute worker invoke it
separately from inactivity, preserve independent failures and hosted20second
start-budget checks. Staff bulk recovery/hold UI is removed; per-case handoff and
availability remain. Native technical OwnerChat now shows its saved reference and
assigned-before-joined name using existing localized keys.

Focused evidence: `test-support-automatic-routing.ts`, updated recovery
compatibility and inherited uncapped routing SQL suites pass; twelve worker/
controller cases, six staff UI/action/editor cases and the actual-controller
native owner lifecycle regression pass. Both typechecks,17localization cases and
199spec/ADR links pass. The generated server message manifest is rebuilt for
removed server copy; no new translation keys. Backend/worker receipts are
`.local/automatic-routing-s121/backend-results.json` and `worker-results.json`.
Original synthetic bigint fixture failures and one local SQL read timeout are
preserved, classified and followed by bounded corrected/controlled passing runs.
An isolated10,000-row mixed backlog candidate plan executes5.438ms under1s;
it scans/sorts and does not establish production-scale/index-backed FIFO.

The actual supervisor loads the corrected worker and its initial tick routes all
five existing waiting cases, with no assignment UI action. Independent protected
before/readback at `.local/queue-recovery-s121/root/verified.json` replays eligible
workload/tie-break decisions, checks exactly one automatic assignment/event each,
null actor, unchanged transcripts/read metadata/prior history/unrelated cases and
saved provider settings. Later ticks route0/end0. No case is reopened or falsely
joined. Test-only push overrides are process-scoped; ordinary saved web/worker
startup is restored after test browsers close; Expo8082 remains separate.

Actual installed Google Chrome admin108, assigned transport staff346 queue and
Expo owner2/case1 current-state journeys pass at desktop/phone, with real local
API reads and no application writes: `native-agent/reconnect/review-receipt.json`
under `.local/queue-recovery-s121/`. Owner polling GETs complete337/504ms at a
5.334second start gap. One deliberately aborted scheduled read then recovers
through the real endpoint in10.708seconds without Retry/navigation/commands:
`native-agent/recovery/review-receipt.json`. Same case references/messages/
assignments/null join state remain. Focus and external media are controlled;
this is Expo browser evidence, not installed Android or OS notifications.

The initial observer coordination timeout and subsequent strict25second mobile
assertion across the intentional web cold restart remain failed. Their error
screen and receipts are preserved; separate reconnect/recovery checks are not
retroactive passes. The focused hook uses bounded20second requests and automatic
10/20/30second failure backoff; no source retry bug was demonstrated. These
limits are explicit in `.local/queue-recovery-s121/review.html`.

Current status is implemented and focused-tested locally, not visually approved
or deployed. Existing S119/S120 and earlier outstanding work remain preserved.
Explicit visual approval precedes full check/release/acceptance, scoped commit
and separately authorized hosted/web/native rollout. No full/container/remoteCI
gate, commit, provider mutation, hosted migration/deployment or Android build is
performed by S121.

### 2026-10-17 — S122 wider dashboard and owner workspace audit

FE-026/FE-047/FE-053/FE-056, BE-032/BE-054: implemented and focused-tested
locally; visual/full/release gates remain pending. The earlier S119/S121 chat
work does not complete or replace this workspace audit.

Actual installed Chrome audits cover38 admin/staff states,38 owner-web states
and33 Expo states. They verify saved-record task navigation, business context,
the compact Account/Your page hubs and authoritative visit metrics. They expose
missing product Cancel/return context, web availability/visibility parity, native
global Back draft loss, and legacy admin geography/Access-parent issues.

The correction keeps existing workspace structure. Product Add/Edit and
Save/Cancel preserve bounded Products origins; owner breadcrumbs lead to Account.
Web focused actions retain failed drafts, redact unknown errors and keep tenant,
version, idempotency and omitted-metadata authority. The shared web exit guard
reads actual controls, including unsubmitted media/options. Native uses installed
Expo removal prevention and an app-owned focused-editor boundary, with acknowledged
snapshot/revision and unmount fences. Product parents are Products; semantic task
headings and48px header targets reuse existing localized text.

Admin geography resolves Country/City server-side, preserves custom worldwide
pins and legacy unknown geography, validates explicitly supplied coordinates,
and merges omitted metadata within the business transaction. The form precedes
the summary on phones; Staff assistance returns to Access. A real private-QA
admin Save revealed reviewed proposal history masking applied owner geography.
The new effective read projection is used by both clients. Unrelated owner
name/logo saves preserve the exact applied pin/profile/proposal/classifications;
admin geography advances the owner content-version fence. Pending proposals and
reviewed history remain distinct. No schema, provider or dependency is added.

Mapped focused evidence:

- `test-product-workspace-navigation.ts` + `test-product-edit-action.ts`:3cases;
  `test-product-editor-workflow.ts`:5 real-React browser cases; inherited
  `test-product-only-web.ts`:2 and `test-owner-editor-failures.ts`:3cases.
- `test-product-upkeep.ts`: real isolated PostgreSQL owner listing-state writes,
  omitted staff metadata, duplicate/stale/foreign denial and media boundaries.
- `test-admin-geography-ui.ts` and existing editor/team/settings adapters:
  14cases, with a final2-case rerun proving reviewed notices are hidden and
  pending proposal context remains. `test-admin-geography.ts`: canonical
  geography/pin/privacy/omission/atomic-rejection regression.
- `test-owner-effective-location.ts`: isolated PostgreSQL admin-to-owner
  projection, exact name/logo retention, pre-admin stale-form rejection, fresh
  role/tenant/version checks, pending/legacy compatibility and deliberate changes.
  Inherited `test-independent-discovery.ts` passes against the final runtime.
- `test-mobile-owner-edit-navigation.ts`:14cases using actual React and the
  installed navigation removal hook; focused controller adapters retain42cases.
  Tests include duplicate/busy/retry, repeated draft snapshots, queued input/save
  acknowledgement races and late acknowledgement after forced unmount.
- Both typechecks,17localization cases/1577keys,199spec/ADR links and scoped
  whitespace checks pass. New focused tests are registered in existing gates.

Normal local email/signup UI creates one private unpublished QA workspace. A
26-state desktop/phone journey verifies product create/edit/list-origin,
availability/visibility, dirty Keep/Discard and an intentionally interrupted
save followed by retained-input retry; admin invalid-city rollback and real
canonical Save/reopen keep the custom pin. A final11-state web supplement proves
effective owner geography and an actual name-only Save/reopen preserve complete
profile/proposal/products, with current admin screens. Existing records remain
unchanged. Expo actual API/database journeys separately verify About/header and
footer protection, Product Cancel/Save parent and stored metadata, normal
reauthentication/readback, and Business name-only retention. Only the new private
QA tenant is written; no publication or social message is sent.

Strict harness failures are retained: initial hydration/body-encoding guards,
the old signup destination expectation, initial native push-capability preflight,
and two stale native heading/auth-landing assertions. No failed receipt is relabelled
passed; exact checkpoint continuations verify their remaining tasks without
repeating successful writes. A focused regression also caught invalid explicit
undefined coordinates during iteration; production validation was corrected.
Original VM/fixture failures are classified separately from product defects.

Protected source hashes, before-images, readback and exact per-journey limits are
under `.local/workspace-audit-s122/`; `review.html` links current visuals and
`TEST-GUIDE.html` the private role/account procedures. Saved provider settings are
not edited; temporary process-only push suppression keeps QA saves quiet. Expo
Chrome is not physical Android, OS notification or process-termination evidence.
No full check/release/acceptance/container/remoteCI, commit, hosted mutation,
deployment or new Android build is claimed. Earlier workstreams stay open.


## S125 — explicit Join, response work and customer-idle facts (2026-10-17)

BE-018/050, FE-019/053/062 and DEP-043 remain in_progress. Schema67/68 preserve
message/event/contact/read history, distinguish manual assignment acceptance,
store unanswered clocks, allow closed-only staff resolution in either queue and
add immutable idle-ending facts. Isolated migration/response/evidence suites and
protected actual local backup/rollback/apply/no-op receipts pass under
`.local/chat-standard-s125/migration67/` and `migration68/`. No hosted migration.

Current code: support-response-contract, support-idle-evidence, support-client-state,
support/support-navigation/support-staff-state, attention contract/enqueue/delivery,
web Join/action/thread/list, web/native customer/history projections and existing
local/Netlify minute workers. Public assignment names/alerts are withheld until
explicit current-assignment Join; read receipts never join. Private proof uses
persisted timestamps and read status at ending, not current or provider delivery.

Tests: test-support-response-migration, test-support-resolution-migration,
test-support-response, test-support-idle-evidence, strengthened read/idle/security
fixtures; test-client-chat-state-ui (9) plus13 inherited client cases;
test-support-join-action and expanded staff/navigation cases;3 worker-controller
cases; both typechecks and17localization checks/1595keys. Passing segments and
original infrastructure/fixture failures remain in the private agent receipts.
Baseline compatibility continuation and final full gates remain separate.

Actual installed Chrome web passes6checks/13screens at1440/390 against one new
labelled case324: real intake/assignment, visible read without Join, manager
inspection, deliberate Join/one customer event, public reply and visible read,
committed participant follow-up, actual minute-worker escalation and inactivity
ending, saved unread-at-ending proof and explicit resolution with full history.
Only that new QA case's clocks/message timestamps are accelerated together;
real30minutes/OS delivery are not claimed. External media and focus are controlled.
Original failed scope-parser and optimistic-commit harness attempts322/323 are
preserved and classified, not relabeled passed. See
`.local/chat-standard-s125/web-commit-barrier/outcome.json`.

Actual installed Chrome Expo390 verifies15states for a visitor transport request
and private QA owner Support, with8canonical read/state checks: neutral assignment,
visible read without Join, explicit Join, both reply/read directions, native
Amharic state, participant End, staff resolve and native history. The strict first
network receipt remains failed/mixed for two staff-read POST net::ERR_ABORTED
cancellations; request timing did not prove their cause. Expected cursors and
terminal states are verified, with zero runtime/console/API/unexpected-write
errors. No weakened assertion or new-case retry. See
`.local/chat-states-s125/native/live-review-receipt.json`. Browser focus/media are
controlled; no installed Android/OS delivery claim. Visual/full/release/acceptance/
commit/hosted/new-Android gates remain open.


## S126 — fair assignment grace and private admin email (2026-10-17)

BE-018/050 and DEP-043 remain in_progress. Migration69 adds an assignment-scoped
notification marker and private email outbox, with no historical email jobs.
Protected loopback backup/rollback/apply/readback/no-op and history preservation
pass at `.local/chat-email-s126/migration69/verified.json`; no hosted mutation.
Current source: support-assignment-response, shared response SQL, support overdue
sweep/current epoch events, fresh attention feed/push guards, typed escalation
email port/dispatcher and existing bounded local/Netlify workers. ADR-0026 records
the narrow existing-provider decision. No new dependency or provider credential.

Focused mapping: test-support-assignment-response-migration and
test-support-assignment-response pass assignment/message race, same-assignee
no-op, stale recipients, atomic jobs/rollback, mixed old-writer recovery and
candidate-limit fairness. Existing S125 response/idle-proof regressions also pass.
Email adapter10/10 and isolated dispatcher11/11 pass generic native-language
content, stable idempotency, leases/fencing/retry/expiry, fresh current-assignment
and manager authority, answer/end/reassign/role-change suppression, HTTP bounds,
loopback and effective-DSN-target rejection. Independent pure-parser review closes
the target-override finding. Worker tests3/3, both typechecks, localization17/17
(1597keys) and199spec/ADR validation pass. The first integrated web typecheck's
union-narrowing error is corrected; the retained final typecheck exits0. Receipts:
`.local/support-response-s126-backend-receipt.json`,
`.local/chat-escalation-s126/email/verified.json` and `.local/chat-email-s126/`.
The full support chain now includes `npm run test:support-escalation`; broad
compatibility/full/release checks remain gated rather than claimed passed.

Actual installed Chrome1440/390 plus real minute worker/Mailpit confirms six
checks over the same labelled QA322: actual admin reassignment grants a fresh
window; only its exact new assignment clock is accelerated; unchanged original
customer wait/transcript; current staff/admin in-app overdue; six canonical
manager emails accepted once over three runs (two per run); a later run sends no
duplicate; Join does not clear overdue; actual public reply does; staff resolution
retains history. Six emails contain no customer identity/phone/message/route.
The original85second all-manager completion harness failed because it was shorter
than the intentional batch budget. One bounded same-case continuation succeeds,
without another assignment, clock shift or source change. Original failure and
classification remain at `.local/chat-email-s126/browser/outcome.json` and
`browser-budget-classification.json`; final six-check/five-screen receipt is
`browser-bounded/outcome.json` (plus two initial grace screenshots). Zero final
runtime/console/API/unexpected-write errors. Local inbox acceptance is not Resend
inbox/OS/device evidence. Pending deliveries were checked/quarantined only for
labelled QA322–326; all history remains. Current review links S122 dashboard work
and S125 web/Expo evidence; visual approval/full/release/commit/hosted/new-binary
gates remain open.


## S127 — normal clusters and all-fit final previews (2026-10-17)

FE-021/053/058, BE-023 and FE-048/BE-041 remain in_progress: local implementation,
focused tests and actual browser workflows pass; visual/full/release/commit and
rollout gates are open. S122/S125/S126 work and separate review gates are retained.

Current `lib/map/map-clustering.ts` builds compact3km terminal neighborhoods and
weighted normal Supercluster hierarchy over current public IDs. Only solitary
shops use glyphs; forced one-card groups stay circles. Any counted circle below
normalized18/native raw17 zooms; only a current final group at maximum opens all
members. Screen capacity up to6desktop/3phone reduces for height/font/safe-area;
no lines, scrolling or pager.800m visual displacement and public200scope remain
independent. Current67public rows are unchanged:7glyphs,25phone or19desktop final
groups. No database/provider/dependency/coordinate/hosted mutation.

Source: MarketplaceMap, DiscoveryWorkspace/map-group-view, MapPreviewDialog,
short Market/Dock CSS; native map-markers/model, MarketMap(.web), MapGroupPicker,
Market screen, public map-return-session and Leaflet resize lifecycle. All five
catalogs carry authored singular/plural zoom/open actions (1606interface keys).

Focused evidence:19shared contracts/330partition oracles,6web admission cases,
9native group cases,3installed-SDK arithmetic cases and1short-web CSS case pass
(38contracts/20node subtests). Current native groups9/9, Market/layout15/15 and
real installed-Chrome/Leaflet lifecycle4/4 pass. Both typechecks,17localization
cases/1606keys and199spec validation pass. Permanent test paths include
scripts/test-map-clustering.ts, test-map-group-picker-web.ts,
test-mobile-map-groups.ts, test-leaflet-resize-center.ts,
test-web-market-short-layout.ts, test-mobile-market-layout.ts and
 test-mobile-map-lifecycle.ts; registered focused/workflow gates retain them.
Receipts: `.local/map-groups-s127/neighborhood-3km/verified.json`,
`hierarchy-web-verified.json`, `final-focused.log`,
`.local/map-grouping-s127/native-receipt.json`, and final container/toolbar logs.

Actual installed Google Chrome real-app/API coverage completes29checks/59states:
web1440/390(allfive languages)/320; real six-shop desktop; Expo390(allfive
languages)/320/844landscape. All current members fit:6desktop,3phone,4landscape.
Ordinary outer zoom→maximum modal→detail/full shop→Back, current membership/focus/
camera, disabled18zoom/overzoom, real search/clear IDs and pointer gestures pass.
No runtime/console/API/request errors or application writes. All owned browsers
close. Source-bound receipt: `.local/map-groups-s127/actual/final-platform-verified.json`.
The earlier mixed web receipt remains FAILED for a subsequent Expo defect; its
completed13webchecks/27states bind to unchanged web/shared/catalog hashes. Final
Expo runs every mobile journey on its final source, with an internal hash guard.
The extra verified desktop6receipt supplies3checks/5states. No injected state,
forced clicks or mocked successful application/API response is accepted.

Browser-discovered real defects have before/fix regressions: latest marker
callback after zoom commit; owned container ResizeObserver and initialcoalesced
frame after0→visible flex layout; explicitright:auto instead ofundefined which
RNWeb skipped, retaining a full-width invisible toolbar over map targets. Current
lifecycle tests prove first click, automatic valid-size recovery, current markers,
camera≤0.5px, zero-size fences, disconnect and no late unmount callbacks. Installed
RNWeb style resolution and actual landscape clicks prove toolbar clearance.
The short-web map also matches its actual visible viewport and reachable dock.
Original failures/diagnostics and the insufficient readiness-only hypothesis,
rounded-camera measurement and navigation-gesture classifications are retained;
none is relabelled as an unconditional passing run.

Controlled dense supplement:5sizes/20screens,214center/edge activations, every
200member traversed on desktop/phone, final capacities6/3/3/4/1, no lines/pager/
inner/outer scroll. Explicit test shops/tiles/Next ports; not real API/database or
physical-device evidence. Final3km source yields exact same dense identities and
geometry at capacities1..6/zooms1/6/14/18. Receipt under
`.local/map-groups-s127/hierarchy-density-fixture/2026-10-17T20-59-23.260Z/`.

Concrete current review: `.local/map-groups-s127/review.html`, linking S122 owner/
admin review, S125/S126 chat review and private test guide. Web3102, Expo8082 and
Mailpit54324 are reachable. Visual approval under AGENTS step8 is the next gate.
No current full/acceptance/release gates, commit, hosted rollout or Android build.
Expo Chrome is not installed MapLibre/Android, TalkBack or OS push evidence;
controlled external media/analytics do not establish provider playback.


## S128 — compact Market toolbar and safe showroom return (2026-10-17)

FE-065/FE-053/FE-021 and FE_BASE remain **in_progress**. The local candidate is
implemented, focused-tested and exercised in installed Google Chrome. Explicit
visual approval, expensive full/release/acceptance gates, task-scoped commit and
rollout remain pending. S122 workspace, S125/S126 chat and S127 map reviews are
retained. No hosted, database, provider, credential, signing or Android-build
operation occurred in S128.

The public Market removes its separate visible title row, retaining a localized
programmatic heading and one centered Businesses/Products row with the existing
Info action. The accepted narrative remains in Info/About. Search and labeled
Category/Country/City filters share one row at measured content width35rem on
web or760px native at ordinary text scale. Phones/enlarged text retain wrapping
rows; Products retains Made to order. Labels, selected counts,48px targets and
useful search width remain. Sources: public page/landing CSS, MarketIntroduction,
DiscoveryWorkspace/IndependentMarket CSS, native Market/MarketSearchControls.
No new interface copy or global navigation behavior is introduced.

Focused acceptance mapping: web `test-market-workspace-ui.ts`8actual-source
React cases; `test-map-group-picker-web.ts`6current-membership/focus cases;
`test-web-market-short-layout.ts`40layout states,2enlarged fixture samples and
10populated actual-React578/606px states across all five languages. Native
`test-mobile-market-layout.ts`18, `test-mobile-map-groups.ts`9 and
`test-product-only-native-ui.ts`7 pass (34total), including installed RNWeb View
idle/loading/error rendering. Shared resize/web lifecycle tests pass10cases:
7actual React/SDK lifecycle cases plus3pure installed-SDK arithmetic oracles,
including96vectors,20repeated returns and zero-size behavior. Final application,
mobile and focused-script typechecks pass. Catalog completeness is17tests /
1606keys per non-English catalog; no copy changed. Specification validation and
scoped whitespace results are retained with the local review.

Actual installed Google Chrome155.0.8059.81 covers80source-bound layout states:
web and Expo, Businesses/Products, English/Amharic/Afaan Oromo/Somali/Tigrinya,
1440×1000/390×844/320×480/844×390. Checks include the programmatic heading,
centered choices,48px targets and edge hits, visible words/counts, measured inline
rows, useful input width, no horizontal overflow, no Expo LogBox and clear map
pointer space. Three actual150%rem Amharic-product samples cover web1440/844/320;
native font-scale wrapping is controlled component evidence, not OS scaling.

Measured Businesses map top / extra visible height:

| Surface | Before → after top | Extra map |
| --- | --- | --- |
| Desktop web1440 |414.5→195px|219.5px|
| Phone web390 |283→227px|56px|
| Small web320 |235→227px|8px|
| Landscape web844 |261→195px|66px|
| Wide Expo1440 |280→169px|111px|
| Phone Expo390 |280→224px|56px|
| Small Expo320 |232→224px|8px|
| Landscape Expo844 |232→169px|63px|

Four English/Amharic real control journeys across web/Expo verify typing without
Enter, independent scopes, two categories, Country then City, counts, Made to
order, URL reload, clearing and preserved map zoom. There are40authoritative
local public API JSON readbacks. Two English full map journeys zoom normal outer
circles to maximum18, open a fitting two-shop group, preview a shop, visit its full
showroom, return through browser Back and close/return to the group. Stored SDK
camera matches the visible camera and returns within0.1projected pixel on each
axis (the original≤0.5px threshold remains). Workflow coverage is16captured
states, separate from the all-five-language layout matrix. All final runtime,
console, application-request and API errors and unexpected writes are empty.
Real public67-business APIs are used; analytics is explicitly204 and external
media is controlled. No fake successful app response, forced click or injected
application state is accepted. All owned browsers close; web3102/Expo8082 remain
running.

Browser findings retain original failed evidence, diagnoses and regressions:

- Real844px web toolbar content was578px, below the earlier37rem fixture
  assumption. The measured-width breakpoint is35rem, with a populated578px
  regression; no label/target/budget assertion was weakened.
- A newly introduced idle empty-string status child produced Expo's Unexpected
  text node warning. An exact Boolean guard fixes it; actual RNWeb rendering and
  final browser LogBox assertions verify idle/loading/error behavior.
- The combined filter/reload/clear→showroom→Back journey exposed a pre-existing
  cached-scope loading bug. The controller now tags projection data with its
  canonical key, resets obsolete pending/error state and fences aborted results.
  It preserves valid saved context until authoritative current rows settle.
- A subsequent passive SDK/storage trace identified an initial world-view callback
  before restored selection committed. A projection-scoped commit fence prevents
  stale callbacks replacing valid group/selection/camera; the exact child-effect
  regression fails before the fix and passes afterward.
- A54px loading-row resize shifted the web camera26.936projected pixels. Both
  Leaflet adapters now use the existing unchanged pure correction in
  `lib/map/leaflet-resize.ts`; the native path re-exports it. Intermediate resize
  callbacks cannot persist a drifted view; live-instance and zero-size/cleanup
  guards remain. Actual SDK and full real browser returns meet original precision.
- The first Expo Amharic hard-reload harness incorrectly expected persisted
  locale. Its existing web secure adapter stores values only in memory; native
  uses SecureStore. The controlled retry observes English, selects Amharic through
  the actual picker and verifies all original URL/filter assertions. No storage
  behavior changed. The first failed result remains failed.

Evidence root `.local/market-toolbar-s128/`: `verified.json`, `review.html`,
`before/outcome.json`, `after-web/outcome.json`, `after-expo/outcome.json`,
`after/outcome.json`, `workflows-verified/outcome.json`, `enlarged/outcome.json`,
`web/verified.json`, `web-resize-agent-receipt.json`, and
`expo-reload-classification.json`. Source hashes in final layout/workflow receipts
match the final implementation. Protected original failures and canceled capture
attempts remain there; none is relabelled as an unconditional pass.

The review links earlier workspace/chat/map reviews and the private role-testing
guide. Expo Chrome is Leaflet-preview evidence, separate from installed Android,
MapLibre, TalkBack, system keyboard/font settings, notifications and provider
video playback. No deployment or new APK is claimed. Next dependency: owner
visual approval under AGENTS step8, then the existing full/release/acceptance
workflow and reviewed task isolation.


## S145 local MirtPage native default identity

FE-053/FE-070, BE-059, DEP-042/DEP-043/DEP-049: local source after base99333795
uses MirtPage/com.mirtpage.app in the normal development/preview/production
profiles. The real new Firebase client/appID/raw hash is selected exclusively;
old static/env fallback and disabling alerts cannot bypass identity. The
owner-accepted provider-advertised signer is an expected public pin, not actual
new APK/AAB or EAS credential-slot proof. Approved hosted targets remain empty,
so no premature worker build or new-host autoVerify claim is admitted. The new
public association is additive with both historical entries unchanged, ready
for a future web deployment before Android qualification. Submission requires
a distinct protected absent MirtPage file source; old app-scoped credentials
are not a fallback. No credential or key material enters source.

Focused evidence: scripts/test-mobile-build-config.cjs and
scripts/test-attention-platform.cjs pass actual-source/injected-policy positive
and negative guards; real source policy remains unqualified. Sixteen tests in
test-mobile-app-links.ts/test-mobile-links.ts/test-android-release-safety.ts
retain public navigation, social handoff, Tracking/capability and signed-artifact
security contracts. Three focused test-platform-brand.ts cases prove canonical
M assets and96px white-alpha notification pixels; generator --check, platform
identity, strict mobile types and scoped strict script types pass. Actual
installed @expo/config and Android scheme plugin inspect all three profiles:
MirtPage/new package, retained EAS UUID, no top-level old scheme or file fallback,
only mirtpage Android scheme. The real protected downloaded two-client Firebase
file passes exact byte/client validation without mutation or key output.

Private native-default-identity-source receipts record current hashes and
limitations. No Chrome/provider/EAS/prebuild/native build, upload or full gate
was performed in this tranche. Combined full gates, actual hosted target and
EAS/file/signing/FCM/submission qualification, served links, binary/device/OS
proof and new Play closed test remain separate.


### S145 local support defaults and complete-ledger preflight

BE-059/DEP-049 now have a focused-test verified local tranche, not a completed
hosted rebrand. `lib/postgres-migrations.ts` appends73/74; its entire historical
prefix through72 and `lib/postgres-baseline.json` are unchanged. The new default and
`lib/support.ts` general-support literal become MirtPage client without row
rewrites, billing changes or sender/origin changes. Known text/NOTNULL defaults
are checked first; custom/versioned NULL defaults refuse. The baseline47 NULL
exception applies only inside a genuinely empty first install. Source version
74 is centralized in `lib/postgres-schema-version.ts`; `scripts/preflight.ts`
validates exactly the two proven full/retained histories before existing
Auth/account reads; missing64 or any nonhistorical hole still fails. Build/health remain
separate; the deployment sequence must explicitly invoke preflight.

Actual isolated PostgreSQL evidence: `scripts/test-mirtpage-support-defaults.ts`
passes rollback/replay, all-table existing-row fingerprints including a leased
tracking-mail job, exact column-default-only metadata, RLS/ACL preservation,
untouched inactive subscription default/trigger absence, default insert, actual
support writer, duplicate and forged-tenant denial. `scripts/test-release-preflight.ts`
passes complete-ledger admission, stale63 and missing64 with74 present, real
runtime and injected read-order checks, administrator/Auth/configuration and
warning preservation, and database-free Netlify configuration. These tests and
the taxonomy74 regression below are
registered in `scripts/test-postgres-readiness.mjs`.

Fifteen inherited scripts pass: native PostgreSQL install, PostgreSQL runtime,
security, platform naming, support response/resolution/assignment migrations,
transport-plan migration, tracking migration/recipient migration, product gallery,
owner transport, unverified tracking recipient, chat read receipts and backend
brand presentation. Current-version expectations and legitimate rewind tails
include74; all existing preservation/tenant/history assertions remain. The
runtime fixture now supplies an admitted made-to-order product and explicitly
checks retired-kind denial, then joins/replies as the actual assignee after
asserting join_required. No product admission or Join guard was relaxed.
Scoped strict TypeScript and spec/whitespace validation pass. Independent peer
review binds the four production files and three new regressions.

Private evidence: `.local/mirtpage-rebrand-s145/support-default-preflight/`
contains repaired/focused-tests.json (new tests/native),
remaining-after-fixture-repairs/focused-tests.json (14 passes), bounded failure
classification, task file fingerprints and exact owned paths. Initial failures
are retained: sandbox EPERM before schema creation; guard missing the legitimate
fresh-baseline NULL case; stale manufacturing-capability and missing-Join positive
runtime fixtures. The raw parents are not overwritten. No ordinary local72 or
hosted63 migration, provider action, full/container gate, mail change, Git
stage/commit or publication was performed. Earlier source-bound full76/release/
20 acceptance results do not certify this newer combined candidate.


The historical-ledger correction under BE-059/DEP-049 is focused-test verified:
`lib/postgres-schema-version.ts` validates exactly ordered1..74 or1..26+31..74.
`preflight.ts` reads at most latest+1 scalar rows using the existing PostgreSQL
adapter (no bigint-array parser and no integer cast that rounds fractional drift).
Partial27–30 groups, other holes, duplicates, nonintegers and unknown/future IDs
are rejected before Auth/admin reads. Historical research proves27–30 are
retired data-only patches; no marker writes or old data replay were added.

`scripts/test-release-preflight.ts` passes real isolated full/retained ledgers,
all14 proper nonempty partial groups, stale63, hole64 despite74, required hole1,
zero/future markers, actual fractional NUMERIC drift, and unchanged Auth/admin/
configuration/warning guards. A separate empty owned fixture constructs physical
63 using real migrations through63; only setup's future existence probes are
substituted, without future markers. Restoring the unmodified reader then proves
the exact observed59-entry legacy63 history upgrades via actual64–74 DDL,
retains its account, preserves missing27–30, passes readiness and replays as a
no-op. This is fixture evidence, not a production backup/restore rehearsal.
The unchanged support-default73 rollback/history/leased-job/tenant regression
also passes. Strict scoped types pass. Private ledger-correction receipts retain
source/test fingerprints; the previous contiguous-only snapshot50a9efa is
historical and full-gate admission remains blocked for mail-bootstrap readiness
and fresh source approval. Reference-data74 and independent peer review now pass.

The reference-data74 correction freezes the reviewed seven insertion tuples in
`lib/postgres-migrations.ts`, validates the exact table/PK/active-check metadata
and refuses inactive known references. It inserts only missing canonical keys and
changes only their seven known sort positions. Existing labels/icons/active,
unknown reference rows and tenant/product/industry/sponsor assignments remain
unchanged. `scripts/test-taxonomy-reference-migration.ts` proves the six-key
legacy row/order delta, all-other-table fingerprints and RLS/ACL preservation,
fresh no-op, transaction rollback, replay and inactive/metadata refusal. A real
farm signup fails with the underlying missing-reference FK before74, then the
same real signup and authorized owner category edit succeed after74; a foreign
owner edit remains denied. The preflight test separately reconstructs six-key
physical63 and runs the unmodified64–74 migrations without marker backfill.

Current private evidence is
`.local/mirtpage-rebrand-s145/support-default-preflight/taxonomy74-focused/`:
`focused-tests.json` records all18 applicable isolated scripts passing once
against endpoint74, finished2026-10-18T22:10:36Z. Scoped strict types pass.
`production-cutover-readiness/migration74-ledger-peer-review.json` independently
binds the seven production/test hashes and reports no material finding (digest
86c9bcaafb0c915415c89584469c3831969b6ebf4a0e78e26a5bd79292d91d96).
Earlier failures and superseded73-only/contiguous-ledger evidence remain retained.
No ordinary local72 or hosted63 migration, full/container gate, provider write,
mail-envelope change or Git action belongs to this tranche. The reconstructed
fixtures do not replace an actual protected production-backup restore/rehearsal.
The final combined source needs its own approved full gates after mail readiness.

## S145 local Auth, app-mail and compatible notification presentation

BE-059/DEP-029/DEP-049/FE-070 were Ready before source edits; the exact27 Auth
fields now use MirtPage with the canonical SiteURL-relative220×48 PNG. It equals
the existing mobile wordmark bytes and preserves all prior derivatives. Auth
guard65 cases include exact current values and legacy-plan rejection before
provider reads. Template/placeholder/disabled-notice tests preserve code/link/
recovery semantics, addresses/credentials, OTP/provider/origin and7disabled
notices. Auth remains English-only; no new request-locale claim.

The separately authorized M6 local boundary rechecked exact supervisor birth/
args/source/cwd, stopped only its owned process tree and proved3102 free plus
two stable zero pending/sending/non-null-lease snapshots in both app-mail queues.
No old jobs were deleted/reset/terminalized. Expo and runtime settings stayed
unchanged. Tracking/escalation From names/subjects and optional Telegram prefix
then changed to MirtPage, preserving real addresses, origins, stable provider/
Message-ID identities, snapshots and retry/lease/authority guards. Active en/am/om
Tracking subjects are localized. The exact ordinary supervisor command restarted
once promptly, before isolated tests. HTTP200 is verified for web health and
unchanged localhost8082. Preserve the first wrong127.0.0.1:8082 verifier failure
as a harness-address mismatch; no second start or inferred product outage.

Focused renderer/provider/target14 cases, escalation outbox11 cases and Tracking
outbox concurrency/lease/rotation/revocation regressions pass on random local
schemas with substitute sends. Localization20+backend4 pass. Notification
worker11 cases execute the actual new workers plus immutable3cfa577 historical
bytes; both new displayed titles are MirtPage while the browser wire stays
compatible. Real isolated PostgreSQL dispatch proves web/Expo-specific wire
titles and preserves original shared Expo-token owner/visitor isolation plus
privacy/revocation/retry/backlog guards. Native OSM User-Agent changes only its
public presentation; executed host/header/privacy coverage passes all11 map
cases and mobile strict types. The unreachable on-behalf adapter is unchanged.

Private evidence: `.local/mirtpage-rebrand-s145/auth-mail-source/` contains
protected beforeimages, stopped-boundary-proof.json, ordinary-restart-verified.json,
original restart-health-classification.json, final-focused.json and verified.json.
`chrome-review.json` proves24 Auth states; `chrome-app-mail-review.json` proves18
exact substitute-adapter plain-text states in actual installed headed Google
Chrome155, phone/desktop with index→message→Back, no overflow/errors and untouched
user tabs. Static previews send no email and do not prove runtime Auth/OTP or OS
delivery. Owner explicitly approves `combined-review.html` and full checks on
2026-10-18, async call_f4b4e2d16ffe48698f92c4e78814ae59.

Preserve the initial added-browser fixture failure caused by cleared VAPID config;
the corrected fixture initializes valid keys only at guarded subscription
admission and retains all production checks. Earlier Auth/asset/native evidence
remains bound to its source. Final combined check/release/acceptance and exact
hosted backup/bootstrap/template/native operations remain separate; no provider
mail, local Auth restart, hosted mutation or Git write belongs to this tranche.

## S145 public search discovery (FE-071; local verification in progress)

FE-071 maps to `lib/public-seo.ts`, `lib/public-seo-runtime.ts`, the public
showroom/Market/About/Featured metadata and product links, and the bounded
`app/robots.ts` and `app/sitemap.xml`/`app/sitemaps` routes. Focused contracts
are `scripts/test-public-seo.ts` and `scripts/test-public-seo-http.ts`. The
source serves crawlable, canonical public showroom and product URLs from the
configured origin while excluding draft, suspended, demo and private material.
The focused local database and HTTP checks have passed; combined browser,
release and deployment evidence is still pending. Cookie-only language choices
do not constitute separate indexable language URLs or `hreflang` variants.
The focused S146/S147 soft-404 correction maps to `proxy.ts`,
`lib/showroom-not-found.ts`, `lib/showroom-status-origin.ts`,
`app/api/public/showroom-status/route.ts`, `scripts/test-showroom-status-origin.ts`
and `scripts/test-public-seo-http.ts`. One indexed Node status read before a
direct showroom document streams returns a branded
English/Amharic/Afaan Oromo 404/noindex for unknown and draft handles. Direct
local HTTP and installed Chrome desktop/phone return-navigation checks pass;
`.local/showroom-404-s146/review.md` records the scope and earlier harness
failure. The S147 release correction keeps the same 404 HTML and removes the
PostgreSQL import from the Edge proxy: the Node status endpoint returns only
204/404/503 with no merchant data, and hosted lookups pin the reviewed MirtPage
origin rather than an untrusted request Host. Focused origin/proxy and actual
local active/missing/language HTTP checks pass. Installed Chrome passed ten
desktop/phone and locale checks; its new 404 PNGs match the owner-approved S146
screens byte-for-byte. A disposable Netlify build passed Edge packaging, with
no publication. The broad SEO HTTP rerun stopped on a demo-only fixture lacking
a real directory business; the earlier complete SEO proof remains bound to its
earlier source. Stale/foreign product query semantics are unchanged. Combined
S147 gates and hosted behavior remain pending.

## S146 staff business authority — FE-072 / BE-060 (local proof; release pending)

FE-072 maps the local owner/staff/admin navigation and focused editors to the
owner page, dashboard Staff/Businesses tasks and Expo owner Profile. BE-060 maps
the explicit revocable staff grant and server-side business authority to local
migration76; ADR-0030 records the decision to retire owner consent and
per-business staff assignment as authority. The guarded local 75→77 apply
backfilled 14 enabled grants and independently preserved existing rows/schema,
ledger and private ACLs; see `.local/mirtpage-rebrand-s145/local75-to77/attempt-20261019T024300Z/verified.json`.
Focused staff navigation, staff-boundary and business-team UI tests pass. Actual
installed Chrome proved an administrator's early focused Save uses POST without
URL form fields, revoke/restore changed grant versions 1→2→3, staff business
access followed the current grant while Support remained reachable, and the
owner web workspace omitted Team editing. The Chrome aggregate receipts in
`.local/s146-browser-review/` include earlier test-harness stops. A focused
installed-Chrome staff-layout pass confirms the desktop permission status and
Edit action do not overlap and the 390px view has no horizontal overflow. The
Expo Tracking view uses the real preview. An earlier genuine local OTP login
established one owner page state, not the full journey. The later
`receipt-expo.json` passed owner Account→Your page→Page address→Cancel UI checks
with no Team editing, but route-fulfilled a successful OTP-send response after
the local email quota was exhausted. Token verification used real local
Supabase. That earlier receipt remains **partial UI coverage**. A separate
source-bound installed-Chrome run at the Expo web preview `localhost:8082`
used one real local Supabase/Mailpit OTP send and verification, with zero
application-response mocks, then completed Account→Your page→Page address→Cancel.
The local DB handle/version remained unchanged; the receipt records no application
errors or escaped map tiles. Evidence:
`.local/s146-browser-review/expo-real-auth/receipt.json`,
`owner-account-real.png` and `owner-showroom-real.png` in that directory. This
proves the specific Expo browser owner journey, not an installed Android app
or email-change activation. The owner approved the combined staff, owner and
Shipment Tracking layouts and allowed full checks. The owner later separately
approved the FE-073 wrapped-email and FE-026 Account navigation-hover layouts;
the owner separately approved the FE-071 showroom directory at desktop and
phone size. The first full check
was intentionally interrupted after new UI defects and a new check is running,
so no full-gate pass is claimed. The remaining
migration/security matrix, complete check, release and acceptance gates, and
separately approved hosted rollout remain open. Source and local schema do not
certify the deployed app.

## S146 owner sign-in email — FE-073 / BE-061 / DEP-050 (local source; disabled)

FE-073 maps the owner-only Account settings task on web and Expo; BE-061 maps
old/new mailbox proofs, unchanged provider UUID, authoritative `users.email`
reconciliation and old-session denial. Local migration77 installed empty private
pending-request/session-fence tables. The local Supabase Auth/Mailpit two-code
proof and focused owner/staff denial regressions pass as recorded in FE-073,
BE-061 and DEP-050. Initiation remains feature-flagged off. Actual Chrome
desktop/phone/Expo UI review of the complete workflow remains open; the owner
approved the focused wrapped-email and navigation-hover layouts after their
Chrome captures. Full gates and separately authorized hosted Auth/template/
notice review and rollout under DEP-029 remain open; no hosted Auth/email
mutation is claimed.

## S146 illustrative demo booth labels — FE-070 (local visuals approved; release pending)

The 58 `public/landing/showroom-booths/*.svg` illustrations and their generator
`scripts/materialize-demo-client-portfolio.ts` now carry the MirtPage facade
label. `scripts/test-platform-narrative.mjs` checks every asset and generator
source; all SVGs parse with `xmllint`. An exact old/new comparison confirms that
each generated illustration changed only the label text and its font size,
preserving business names, cues, facades and tenant-specific palettes. Installed
Chrome155 loaded three palette variants at 1440/390 without page/console/request
errors; `.local/booth-brand-s146/` holds the receipt and captures. These are
retained fictional demo assets, not real merchant artwork or Play screenshots.
The owner approved the desktop and phone booth visuals for full checks. Later
full release evidence remains pending; no deployment.

## S146 native empty-product gallery — FE-053 (local focused and visual pass; release pending)

`apps/mobile/src/Gallery.tsx` renders a localized, accessible **No photo yet**
state for zero media and retains the gallery for non-empty media. The actual
component port regression in `scripts/test-mobile-video.ts` passes 5/5 via
`node --import tsx --test`; `npm run mobile:typecheck` and
`npm run validate:specs` pass. Installed Google Chrome155 headless at
`http://localhost:8082` (390×844) traversed real demo showroom→product→Back
with no API/console errors or writes; `.local/prairie-media-s146/` contains the
screen and protected receipt. This is a labelled response-only fixture that
changes one demo product's `media` array to empty. It establishes UI behavior,
not an actual empty-media catalog read or installed Android behavior. Real
Prairie media was initially audited read-only. After the owner's explicit
local-only removal decision and visual approval, protected exact rows and a
validated full local database archive were captured. The admin page/product UI
saves cleared only its unrelated cover/product media references: local business
content v6, draft v4, latest publication r3, catalog v6, product 286 still
published with unchanged non-media fields, and old publication r2 retained.
Both detached Storage objects retain their exact audited hashes. Installed
Chrome desktop/phone directory→showroom→product→Back and real Expo phone
showroom→product→Back pass against the local API, with no response fixture,
browser error, or unexpected write. See
`.local/prairie-media-s146/receipt-verify-after.json` and eight local captures.
The hosted site and installed Android were not changed. Full release gates
remain pending.

## S146 selected web CI and separate Android admission — DEP-002 / DEP-042 / DEP-044

`.github/workflows/quality.yml` now makes required `core` and `dependency`
jobs install only the root and shared contracts from the lockfile. Core invokes
the existing complete `release:web` gate, operations, and pure Android
artifact-safety tests. Dependency independently checks that Expo/native tools
are absent and audits all selected web/build dependencies at the unchanged
moderate threshold. Browser, container and PostgreSQL jobs are unchanged.
`npm run release` still contains the unsuppressed full monorepo moderate audit;
new MirtPage AAB admission and any exact per-artifact advisory exception remain
separate under DEP-042/DEP-044/DEP-049. Focused `test-workflow.mjs`,
`test-web-install.cjs`, `test:mobile:release-safety` (3/3) and `validate:specs`
(217 specs/ADRs) pass locally. No remote CI result, new AAB, Play action or
production deployment is claimed from this source change.

## S146 MirtPage PR #36 gallery navigation correction — FE-050

GitHub run `39293516050` on `bee0c444` passed core, container, dependency and
PostgreSQL but failed the browser job (19/20). Its FE-050 assertion found the
track at scrollLeft 0 with Photo 2 still active and Photo 1 inert after rapid
keyboard navigation and reverse. `components/showroom/ProductMediaGallery.tsx`
now settles programmatic control navigation immediately; touch scrolling and
snap remain. `scripts/capture-launch-wiring.mjs` checks the visible slide and
selected thumbnail together at 390/320. An ignored direct actual-component
Chrome harness with the repository CSS passes the affected keyboard, reverse,
arrow and thumbnail paths at 1440/390/320 with no page errors; captures are in
`.local/github-pr36-gallery-review/harness/`. Typecheck and 218-spec validation
pass. The full disposable acceptance runner stopped before app assertions twice:
its fixed port is occupied by an unrelated Loadgistic Docker test, then one
port-isolated retry stopped while starting Supabase. The owner approved the
reviewed gallery behavior and full checks. Source-matched full gates and a fresh
terminal remote CI run remain pending; no
deployment is claimed from the focused proof.

## S146 optional Gmail transactional sender — BE-018/050/058, DEP-043/048, ADR-0031

`lib/gmail-smtp-email.ts` supplies the fixed TLS Gmail SMTP port for the existing
tracking and overdue-staff outboxes; their adapters and dispatchers choose it
only when `MIRTPAGE_TRANSACTIONAL_EMAIL_PROVIDER=gmail-smtp` is configured.
The SMTP sender is the configured Gmail user and the password stays server-side.
Existing Resend and local Mailpit modes remain. The new
`scripts/test-gmail-smtp-email.ts` plus existing tracking/escalation adapter
tests pass 19 focused cases, including missing configuration, invalid input,
provider rejection and absence of `NOTIFICATION_FROM_EMAIL` in Gmail mode.
Typecheck, 218-spec validation and Netlify readiness pass; Nodemailer 10.1.7
adds no new audit advisory. Metadata-only readback confirms the three Gmail
settings are present in the verified Netlify site's production context, with
the app password secret-scoped and no nonproduction value. This does not verify
the password bytes, a real Gmail send, or hosted email delivery; those remain
pending deployment and a labelled delivery test.
