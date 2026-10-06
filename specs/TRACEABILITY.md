# Suqpage traceability matrix

Update this table in the same change that completes or materially changes a spec.
Evidence must be reproducible; avoid transient chat claims.

| Capability | FE | BE | DEP | Primary code | Automated evidence | Status |
|---|---|---|---|---|---|---|
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
| Scalable public discovery and operations workspace | FE-017 | BE-015 | DEP-014 | `lib/pagination.ts`, `lib/scalable-queries.ts`, paginated dashboard routes, indexed collection queries, and batched SQLite/PostgreSQL showroom-catalog hydration | On 2026-08-15 focused scalable-query and adapter evidence proves one option-group query and one option-value query per catalog, correct ownership across multiple products, and no duplicate active-business lookup on the ordinary showroom route. Prior pagination and tenant-negative evidence remains valid; fresh complete gates remain pending visual approval. | in_progress |
| Retired balanced daily event allocation | FE-010, FE-015 | BE-016 | DEP-015 | Superseded by nearest qualifying City Showroom allocation under BE-019 | Prior completion evidence is retained in Git history; current nearest-host and sparse-location evidence is recorded under FE-020 and BE-019 | deprecated |
| Subscription entitlement and showroom insights | FE-018 | BE-017 | DEP-015 | Schema migration 21, `lib/account-health.ts`, `app/api/analytics/visit/route.ts`, `components/ShowroomVisitBeacon.tsx`, public entitlement filters, account-health page/actions, dashboard navigation, and inactive notice | `scripts/test-account-health.ts` proves lifecycle boundaries, amount-free manual renewal idempotency, privacy visit deduplication/attribution, and tenant denial; scale fixtures prove 66 ledgers, at least 464 visit records, and four intentionally non-entitled lifecycle fixtures omitted from public discovery; browser acceptance proves client/operations UI and inactive handling; `npm run check`, `npm run test:operations`, and `npm run release` passed on 2026-08-01 | done |
| First-party support queue | FE-019 | BE-018 | DEP-015 | Schema migrations 22/33/34/36, `lib/support.ts`, `lib/support-media.ts`, authenticated support actions, token-scoped public API/drawer, required visitor reconnect details, private image/PDF attachments, participant-scoped download routes, client/staff queue/thread pages, five-second refresh, role-aware navigation, optional WhatsApp handoff, and responsive styles | Prior authenticated queue evidence remains valid. On 2026-08-15, type/spec checks plus `npm run test:support`, `npm run test:media-storage`, and `npm run test:media-reconciliation` pass, including image sanitization, PDF verification, duplicate cleanup, wrong-token/tenant denial, and authorization-before-storage-read. Focused Chromium at 1440/390/320 passes upload, private no-store PDF read, End chat, Start another chat, and zero overflow; captures are under `/tmp/suqpage-support-attachments-v2`. Complete release gates, PostgreSQL migration rehearsal, user visual approval, and rollout remain pending. | in_progress |
| Complete fictional demo showroom portfolio | FE-023 | BE-022 | DEP-019 | `lib/scale-demo-seed.ts`, `lib/showroom-seed-briefs.ts`, `lib/revision-v4-defaults.ts`, deterministic setup/materialization scripts, 66 durable project briefs and review records, 66 logos/heroes/booths, 264 offering images, and production-family process references | `scripts/test-demo-client-portfolio.ts` and `scripts/test-showroom-benchmarks.ts` prove all 66 admitted manifests and 264 offerings with at least ten distinct process-video references; prior 1440px/390px capture batches plus current `npm run check`, 10/10 ordered acceptance, `npm run release`, and container build passed on 2026-08-02 | done |

`baseline` means existing behavior is tested but should receive dedicated feature
specs before a material behavior change.

| FE-046 / BE-039 / DEP-036 | Complete new-business starters | lib/business-starter.ts, lib/business-starter-postgres.ts, signup/invitations, original starter PNGs | scripts/test-business-starters.ts, scripts/capture-business-starters.ts; signup/invitation/location regressions | Focused tests/typecheck pass; 18 captures and three accessibility scans; owner approval/full gates and monitored deployment verified; docs/SUQPAGE-RELEASE-2026-09-21.md |

| DEP-027 dev-command correction | `package.json`, `scripts/start-local-dev.mjs` | `scripts/test-local-dev-launcher.mjs`, `test:local-supabase-readiness` | Runtime loading/CLI precedence/origin/negative guards pass; retained local schema update awaits backup tooling |

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
