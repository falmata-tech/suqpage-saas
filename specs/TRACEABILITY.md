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
| Scalable public discovery and operations workspace | FE-017 | BE-015 | DEP-014 | `lib/pagination.ts`, `lib/scalable-queries.ts`, paginated dashboard routes, indexed collection queries, and batched PostgreSQL showroom-catalog hydration | On 2026-08-15 focused scalable-query and adapter evidence proves one option-group query and one option-value query per catalog, correct ownership across multiple products, and no duplicate active-business lookup on the ordinary showroom route. Prior pagination and tenant-negative evidence remains valid; fresh complete gates remain pending visual approval. | in_progress |
| Retired balanced daily event allocation | FE-010, FE-015 | BE-016 | DEP-015 | Superseded by nearest qualifying City Showroom allocation under BE-019 | Prior completion evidence is retained in Git history; current nearest-host and sparse-location evidence is recorded under FE-020 and BE-019 | deprecated |
| Showroom analytics and retired business subscriptions | FE-018 | BE-017 | DEP-015 | Tenant visit analytics remain; payment/renewal actions, ports and navigation removed; authenticated old-route redirect; migration 60 removes only the creation trigger/function | Local non-destructive upgrade/idempotence/new-shop absence, historical preservation, publication, privacy visit attribution and tenant denial pass. Actual admin bookmark returns to its workspace without renewals; role/phone UI captures pass. Historical evidence is retained in Git; hosted migration, visual/full/release gates and commit remain pending. | in_progress |
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
