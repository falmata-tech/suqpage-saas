---
id: DEP-026
title: Netlify and bounded Supabase capabilities rollout
status: in_progress
related: [FE-019, FE-021, BE-018, BE-023, BE-024, BE-026, BE-027, BE-030, DEP-015, DEP-020, DEP-023, DEP-027, ADR-0014, ADR-0015]
owners: [deployment, operations, security]
last_updated: 2026-08-24
change_level: L4
---

# DEP-026 - Netlify and bounded Supabase capabilities rollout

## Problem and outcome

MirtPage needs a reversible Netlify production option and a disciplined way to
use Supabase Auth, Storage, Realtime, PostGIS, and search extensions without
turning every free service into an unconditional runtime dependency.

## Named topology

- Application candidate: Netlify Next.js/OpenNext with Node 24.
- Canonical data: existing Supabase PostgreSQL transaction pooler.
- Media: existing private Supabase Storage bucket through BE-024.
- Identity candidate: Supabase Auth through BE-030.
- Domain: `mirtpage.com`; the current Vercel deployment remains rollback until
  Netlify DNS and workflow monitoring complete.

## Contracts

1. Production and deploy-preview environments never share service-role or
   production database credentials. Preview and Production use separate remote
   Supabase projects, while local development and browser acceptance use
   isolated local Supabase CLI projects.
2. Netlify configuration contains no secrets and does not pin the OpenNext
   adapter. Node version follows the repository baseline.
3. The free-plan credit hard limit is monitored; unnecessary production deploys
   and globally open serverless polling are prohibited.
4. Realtime subscribes only while a support thread or staff inbox is visible,
   unsubscribes on close/background, and falls back to bounded polling.
5. PostGIS is enabled only with an additive point/index migration and a
   viewport-query adapter. Static local road/place geography remains versioned
   first-party map data.
6. Public map payloads remain bounded. Before sustained tens-of-thousands of
   showrooms, the server returns viewport rows/clusters instead of the complete
   canonical point set.
7. Local development, browser acceptance, deploy previews, and Production all
   select PostgreSQL, Supabase Auth, and private Supabase Storage. They apply the
   same MirtPage schema and identity-link/tenant-authorization model; only
   endpoints, credentials, data, and lifecycle differ.

## Scenarios

```gherkin
Scenario: Netlify candidate lacks a production secret
  GIVEN a deploy preview or incomplete production candidate
  WHEN an authoritative workflow starts
  THEN preflight fails closed without reaching production data

Scenario: Deploy Preview is created
  GIVEN Preview-only Supabase credentials are configured in Netlify
  WHEN the preview starts
  THEN it cannot connect to the Production database, Auth project, or Storage bucket
  AND the same migrations and tenant authorization tests apply

Scenario: Realtime reaches its plan or provider limit
  GIVEN an open support conversation
  WHEN its realtime subscription disconnects or is refused
  THEN bounded visibility-aware polling resumes
  AND PostgreSQL remains message authority

Scenario: Visitor zooms the map
  GIVEN locally hosted road and place tiers
  WHEN the visitor pans or zooms
  THEN static geography remains available without a third-party tile request
  AND temporary label reduction may occur during the gesture to protect input responsiveness
```

## Test plan

| Gate | Evidence |
|---|---|
| Netlify configuration and secret isolation | static config test, local Netlify build |
| Auth and private Storage | BE-030 tests, media reconciliation, upload/read smoke |
| Support fallback | support adapter tests and visible/open browser workflow |
| Map scale | `npm run test:discovery`, `npm run test:market-performance` |
| Exact release | `npm run release`, required GitHub checks, candidate smoke and logs |

## Rollout and rollback

Create a Netlify candidate on the exact approved commit, configure scoped
environment variables, and test its generated domain. DNS changes only after
all public/authenticated workflows pass. Restore the current Vercel DNS target
for rollback; freeze the failed candidate and reconcile provider state rather
than dual writing.

## Current evidence

- `netlify.toml` and the static readiness gate define the Node 24/OpenNext
  candidate without storing credentials or pinning a legacy adapter.
- Supabase Auth, private Storage, PostgreSQL, and local-runtime adapters are
  required by production and deploy-preview configuration. Remote provider
  credentials and the monitored Netlify cutover remain pending.
- Focused Auth, hosting-readiness, database-boundary, signup, and adapter tests
  pass locally. The lean local Supabase stack now proves PostgreSQL copy and
  migration, retained password identities, private Storage copy/readback, app
  health, client workspace access, administrator business context, project
  history, and revision preview.
- On 2026-08-17 `npm run check` passed the complete 112-spec repository gate and
  the optimized Next.js production build completed against the local
  Supabase-backed PostgreSQL, Auth, and private Storage profile. The
  CPU-throttled marketplace browser regression also passed after an
  All-industries-to-machinery route transition with no page errors or
  horizontal overflow on phone and desktop.
- On 2026-08-24 the complete repository gate passed again. The provider-backed
  release build, API/security smoke, scale fixtures, tenant/security tests, and
  dependency audit passed with zero production vulnerabilities. The ordered
  browser suite passed nine workflows; its remaining request-workflow failure
  exposed redundant route invalidation delaying redirect responses. Status,
  clarification, assignment, and invitation redirects now reload authoritative
  dynamic destinations without those invalidations. Remote CI is the pending
  browser confirmation.
- Realtime remains a planned visibility-scoped acceleration with polling
  fallback. PostGIS remains deferred until measured public-map scale requires
  server-side viewport queries.
- Netlify authentication timed out while waiting for browser approval; site connection, candidate deployment,
  generated-domain smoke, production environment configuration, DNS cutover,
  and monitored rollback evidence remain pending.

## Readiness checklist

- [x] Scope, topology, quotas, and non-goals are explicit
- [x] Security and preview isolation are explicit
- [x] Positive and degraded-provider scenarios are written
- [x] Map, support, identity, storage, and hosting dependencies are linked
- [x] Test and exact-commit evidence are planned
- [x] Rollout and rollback are decided
- [x] No unresolved decision changes launch preparation
