# MirtPage release-readiness audit

**Controlling contracts:** FE-031, FE-032, FE-035, BE-028, DEP-023

## Public authority matrix

| Public behavior | Administrative owner | Persistence authority | Current state |
|---|---|---|---|
| Showroom identity, hero, combined story/process chapter, process video, palette, sections, and offerings | Request-scoped Design/Edit/Preview workflow with inline image replacement and controlled YouTube admission; clients may maintain published offerings within their bounded workspace | Revision service through SQLite or PostgreSQL; private images promote through the configured media adapter and video fields retain normalized provider references | Wired |
| Industry, reviewed location, map visibility, city grouping, booth image, exclusion, and sponsorship | Marketplace inside the selected Business workspace | Runtime SQL parity plus provider-neutral media storage | Wired; raw path entry replaced by upload |
| Live business status and destination | Showroom settings in the private revision/client settings boundary | Business and revision persistence adapters | Wired |
| Showroom traffic and source attribution | Business Overview inside the selected Business workspace | Privacy-conscious visit aggregates through the runtime SQL boundary | Wired |
| Service period, renewal notes, and account visibility | Renewal inside a Business workspace or the global Renewals queue | Account-health runtime SQL boundary | Wired; payment collection remains intentionally manual |
| Direct showroom inquiries | Visitor inquiry sheet; business inquiry inbox | Tenant-scoped inquiry adapters in SQLite/PostgreSQL | Wired |
| Platform support | Customer support workspace and staff Support inbox | Support adapters in SQLite/PostgreSQL | Wired |
| Daily Featured Showrooms schedule and MirtPage broadcast destinations | Fixed platform schedule; operator-owned TikTok and YouTube environment values | Server policy plus deployment secrets | Operator-only by design |
| Production URL, DNS, database credentials, Storage credential, backups, and rollback | Operator runbook, Supabase, Vercel, and registrar | Provider secret stores and retained backup artifacts | Operator-only by design |

## Corrections made

- Removed the duplicate standalone story chapter from current authoring and rendering. Retained story/process revisions canonicalize in memory and are not bulk rewritten.
- Replaced the seven-section AI contract with one six-section contract across the schema, example, component guidance, assignment checklist, fitness rules, defaults, editor, renderer, tests, and master prompt.
- Kept the internal legacy `story` parser and controlled-film component only for retained data. The portable authoring bank exposes neither.
- Replaced competing Businesses, Clients, and Discovery profile directories with one bounded Businesses directory. Client users remain separate access records and marketplace data remains a separate projection, but both are managed inside the selected Business workspace.
- Grouped each selected Business workspace by showroom work, customer activity, and business administration, with explicit actions for switching businesses or returning to the platform.
- Moved aggregate showroom visits onto Business Overview and folded the automatically created owner account into an administrator-only recovery disclosure inside Business details. The underlying access and analytics records remain separate authorities.
- Added a deferred desktop/phone preview of the current unsaved revision snapshot below the focused editor and removed duplicated visible hero-copy controls.
- Added field-local replacement uploads for logo, hero, browser icon, combined story/process, and offering images, plus controlled YouTube URL admission for the process chapter and each offering. Newly admitted media appears in the unsaved preview before draft save; selected private images promote only on publication.
- Added deterministic Request, Design, Edit, and Preview navigation and removed duplicate top-level editor links.
- Kept client instructions, revisions, and clarifications in the primary flow while moving assignment, audit history, coordinates, fallback presentation, and sponsor ordering into accessible progressive disclosures.
- Replaced browser-history-dependent dashboard Back behavior with stable route fallbacks.
- Replaced the discovery booth path field with a sanitized staged image upload. Failed profile mutations discard the new object.
- Replaced the homepage hero with the bounded v6 production composition, adding finished power, weighing, and pump equipment without removing food, beauty, workshop, farm, clothing, shelter, furniture, or household goods.
- Corrected stale operations documentation that still described SQLite as the only runtime after PostgreSQL cutover work had completed.

## Performance and architecture review

- Public chapter consolidation removes one rendered section and introduces no new query, dependency, or client effect.
- Homepage imagery stays within the existing 180 KB hero budget. Deferred geographic detail and bounded result pagination remain unchanged.
- Runtime database-boundary scanning reports no newly introduced direct database modules. New discovery persistence continues through the shared runtime SQL boundary.
- The upload uses `MediaObjectStore`; no Supabase key or filesystem path enters client code.
- The editor preview reuses the existing interaction-disabled showroom renderer, adds no request, and defers snapshot rendering so typing does not synchronously block on a full showroom update.
- Existing list screens use server pagination for scalable business, request, support, renewal, and public discovery collections. The six-row Businesses query projects access and marketplace readiness without loading separate customer directories. Venue rendering remains the known scale boundary: measure low-end phones before one continuous city or featured floor approaches 200 booths.
- No database migration or destructive seed/reset is required for this release.

## Deployment state

The linked Supabase database, private Storage bucket, least-privilege runtime,
and prior Vercel candidate are proven in DEP-023 for commit `e3f3d0a`. They are
not production evidence for the current working tree. On 2026-08-11, the current
working tree passed the complete local accessibility, acceptance, release,
operations, container, and PostgreSQL-readiness gates documented in
`docs/RELEASE-EXPERIENCE-AUDIT-2026-08-11.md`. Before deployment, this release
still needs:

1. User visual approval of the homepage, one retained showroom, one current showroom, and the focused administrator workflow at desktop, 390px, and 320px.
2. An intentional task-scoped commit and push, followed by all required GitHub Actions jobs on that exact commit.
3. A new Vercel production deployment using existing production-only Supabase secrets and generated-host smoke checks.
4. Registrar DNS configuration, canonical-domain checks, monitoring, and the rollback window described in DEP-023.

Until those steps pass, the application is a release candidate, not a newly
verified production release.

### 2026-08-13 checkpoint

The exact candidate now passes the complete local release, 10/10 acceptance,
88-state accessibility, final routed public visual, PWA contract, and disposable
PostgreSQL 17 gates. The retired Bazaar and Expo routes hard-fail with 404, and
current UI, query, referral, module, and administrative language uses Market,
City Market, Daily Featured, and Showroom. The container retry was blocked
before compilation by an npm-registry idle timeout; remote CI remains the
required independent clean-network container/build proof.
