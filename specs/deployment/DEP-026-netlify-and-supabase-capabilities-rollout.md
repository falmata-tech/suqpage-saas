---
id: DEP-026
title: Netlify and bounded Supabase capabilities rollout
status: in_progress
related: [DEP-042, DEP-039, FE-019, FE-021, FE-038, BE-018, BE-023, BE-024, BE-026, BE-027, BE-030, BE-031, DEP-015, DEP-020, DEP-023, DEP-027, DEP-028, ADR-0014, ADR-0015, ADR-0016, ADR-0017]
owners: [deployment, operations, security]
last_updated: 2026-10-20
change_level: L4
---

# DEP-026 - Netlify and bounded Supabase capabilities rollout

## Current hosting boundary

MirtPage is hosted on the existing Netlify site at `https://mirtpage.com`;
Supabase remains the PostgreSQL, Auth and private Storage provider. DEP-049 and
the active delivery checklist own exact current source/artifact/rollout status.
A Git merge does not itself qualify the separately guarded complete-artifact
publication. Retain the previous compatible Netlify deploy for reviewed recovery;
Vercel DNS or deployments are not the current rollback path.

The owner-requested removal of this repository’s Vercel Git publishing connection
is verified for the exact project/repository by a fresh provider reload. The
project, deployment history and account App installation remain; Netlify,
domains/secrets and other repositories were not changed. The next authorized
source push still needs the no-trigger check in V01. DEP-002 controls this L0
documentation reconciliation; DEP-023 is historical.

## S139 blocked browser basemap (local candidate; no rollout)

FE-021 S139 and ADR-0016 control the status-aware direct tile loader and explicit
public/private referrer policies. CSP adds only the exact existing tile host to
connect-src for its one CORS request per visible tile; no wildcard, proxy, service,
credential or paid-provider change. Browser caching stays default; no automatic
fallback/retry or block evasion. Web and Expo browser share the loader; native
MapLibre identity/cache are untouched. Automated map drivers use synthetic tiles,
and provider availability is explicitly outside that evidence. Regression scope:
HTTP403PNG/CORS/decode/abort, same-camera manual retry, Tracking→Market policy
restoration, private Tracking denial of outgoing referrers, preserved business
projection and existing UI/cluster lifecycle. Full/release/build and live rollout
remain gated by visual approval and normal operations. Rollback is application
code only; no database/configuration mutation or restore is needed.

## S39 owner-only live support

No migration: local schema stays 55. Deploy the public buying-only API and UI
together. Help/Transport/missing-channel endpoints return 410; public attachment
reads return 404. Existing owner-dashboard support remains authenticated and
scoped. Preserve historical visitor records; they remain staff-visible with
private notes. Rollback must not reopen guest chat; retain the retired-entry guard.
Focused tests and local browser review precede visual approval and full release.


## S37/S38 buying-assistance rollout

FE-019 / BE-018 replaces the public transport button with Buying assistance.
Apply additive migrations 54–55 before serving the new request category: they
expand category validation and permit callback intake without email or a service
classification. Existing classified rows remain intact. Historical transport data and internal scope keys remain.
Local schema 55 is applied; production remains pending backup, visual approval
and release gates. Rollback retains schema/data and must continue recognizing
buying cases; an old binary that treats them as chat is not a safe rollback.


## Problem and outcome

MirtPage uses Netlify hosting and bounded Supabase capabilities. Keep Auth,
Storage, Realtime, PostGIS and search extensions behind their existing contracts
without turning every free service into an unconditional runtime dependency.

## Named topology

Current application hosting is the existing Netlify site `africmade`
(`26c795eb-5560-4a88-b38d-3cc922c2a5e6`) with primary `mirtpage.com`.
PostgreSQL, Auth and private media stay on their existing Supabase target.
Exact release and provider settings are admitted under DEP-049/DEP-029.

### Historical migration topology

The following dated preparation describes the earlier migration, not current
DNS instructions, ownership claims or a valid Vercel rollback target.

S18 domain preparation (2026-09-21): owner confirms ownership and completed GoDaddy
DNS for `suqpage.com`, with apex primary and `www` redirect. Alias-only association
was rejected without mutation because Netlify requires a primary domain first.
Register exactly `custom_domain: suqpage.com` and alias `www.suqpage.com` on the
independently verified existing Netlify site, preserving deploy and environment.
Retain protected before-state and verify readback. Public DNS now resolves apex
to 75.2.60.5 and www to the existing generated Netlify host. Preserve NS, email and
unrelated records. No DNS write by the agent. Provision managed TLS for these hosts.
Canonical cutover requires DNS/TLS verification and a separately reviewed DEP-029
Auth plan; missing provider access blocks that step, not a broad config fallback.
Rollback requires a reviewed restoration of the recorded primary/aliases and DNS
values. Do not present sign-in as ready until routing, HTTPS and email entry pass.

- Application candidate: Netlify Next.js/OpenNext with Node 24.
- Canonical data: existing Supabase PostgreSQL transaction pooler.
- Media: existing private Supabase Storage bucket through BE-024.
- Identity candidate: Supabase Auth through BE-030.
- Generated production origin: `https://africmade.netlify.app`. No custom
  domain is owned or configured; the current Vercel deployment remains rollback
  until Netlify workflow monitoring completes.

## Contracts

1. Production and deploy-preview environments never share service-role or
   production database credentials. Preview and Production use separate remote
   Supabase projects, while local development and browser acceptance use
   isolated local Supabase CLI projects.
2. Netlify configuration contains no secrets and does not pin the OpenNext
   adapter. Node version follows the repository baseline. Local Netlify account
   and site-link state stays ignored, and operator commands use the isolated
   Suqpage CLI home rather than an ambient account profile.
3. The free-plan credit hard limit is monitored; unnecessary production deploys
   and globally open serverless polling are prohibited.
4. Realtime subscribes only while a support thread or staff inbox is visible,
   unsubscribes on close/background, and falls back to bounded polling.
5. PostGIS is enabled only with an additive point/index migration and a
   viewport-query adapter. The launch basemap follows ADR-0016: browser-visible
   tiles go directly to the exact OpenStreetMap Standard endpoint with
   attribution and without a Netlify proxy, prefetch, bulk download, or PWA cache.
6. Public map payloads remain bounded. Before sustained tens-of-thousands of
   showrooms, the server returns viewport rows/clusters instead of the complete
   canonical point set.
7. Local development, browser acceptance, deploy previews, and Production all
   select PostgreSQL, Supabase Auth, and private Supabase Storage. They apply the
   same Suqpage schema and identity-link/tenant-authorization model; only
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
  GIVEN the centralized osm-standard provider is selected
  WHEN the visitor pans or zooms
  THEN the browser requests only visible OpenStreetMap Standard tiles
  AND Suqpage sends no catalog query, private location, or account data in a tile request
  AND a tile-provider failure does not remove Supabase-backed showroom discovery
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

Use the exact source/CI/admitted complete artifact and current target under
DEP-049. Verify the independently selected site/account/environment and retain
the prior compatible Netlify deployment before publication. Stop on an unexpected
or ambiguous outcome; any retry, restoration or setting/DNS change requires its
own reviewed direction. Code rollback does not reverse database/Auth/media state.
Do not restore historical Vercel DNS or silently dual write.

## Current evidence

Use DEP-049 and the active delivery checklist for current MirtPage qualification.
The older implementation/preparation evidence below is retained for history; its
then-pending credentials, domains and candidate status are not current instructions.

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
  dynamic destinations without those invalidations. GitHub Actions browser job
  `97312645834` in run `32686559246` then passed all 10 ordered provider-backed
  workflows.
- Realtime remains a planned visibility-scoped acceleration with polling
  fallback. PostGIS remains deferred until measured public-map scale requires
  server-side viewport queries.
- On 2026-08-24 the isolated Netlify CLI profile authenticated as the intended
  account and created only site `suqpage`
  (`26c795eb-5560-4a88-b38d-3cc922c2a5e6`). The production context contains
  the allowlisted PostgreSQL, Supabase Auth, private Storage, canonical-origin,
  PWA, and `osm-standard` settings. Netlify Free cannot apply paid hidden/scoped
  secret controls, so the owner explicitly approved ordinary site environment
  variables across Netlify's standard scopes; values remain outside Git and
  application logs. On 2026-08-27 that same site ID was renamed in place to
  `suqpage`; `https://africmade.netlify.app` returns HTTP 200 for `/` and
  `/login`, and the production canonical/trusted-origin variables were updated
  for the next deploy. Updated candidate deployment, authenticated provider
  smoke, and monitored rollback evidence remain pending.

## Readiness checklist

- [x] Scope, topology, quotas, and non-goals are explicit
- [x] Security and preview isolation are explicit
- [x] Positive and degraded-provider scenarios are written
- [x] Map, support, identity, storage, and hosting dependencies are linked
- [x] Test and exact-commit evidence are planned
- [x] Rollout and rollback are decided
- [x] No unresolved decision changes launch preparation

## Evidence: verified rollout — 2026-09-21

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

## Cross-platform native artifact readiness — 2026-09-23

GIVEN a deployment bundle built on macOS WHEN preparing a Linux/x64 Netlify
publication THEN the exact function archive must execute an image transform
with its own Sharp/libvips dependencies in an isolated Linux/glibc container.
A missing native package fails publication readiness even if Next build,
privacy scan and application browser tests pass on the build host.
The archive SHA binds this evidence to the uploaded artifact.

Evidence: scripts/test-netlify-native.mjs rejects the S25 archive missing Linux
optional dependencies; corrected-archive evidence is required before republishing.

Corrected archive passes Linux/x64 Node 24 PNG transformation and artifact
privacy/source verification. SHA-256:
`320b98d144c541ecff23d6c75cbc7b722e4697e815a88afbdf6de3c920b17047`.
The original archive fails the same test; no application code changed for recovery.

## S61 root web workspace build

The root Next app is intentionally outside the mobile/shared workspace list.
The CLI selects only child workspaces when invoked at the workspace root, and
its offline build plan omitted the Next adapter. Invoke from outside the source
root with an explicit `--cwd` and declare the existing Next adapter in
`netlify.toml` without pinning/installing it in application dependencies. Retain
provider-managed adapter versions. Verify the build plan includes its lifecycle,
then exact archive privacy, native Linux checks and route/API smoke before publish.
This fixes real deployment selection; it does not move the app or introduce a
new provider. See DEP-042 for root/shared install and audit isolation.

S61 artifact check found the current adapter stores its handler under a generated
path instead of the ZIP root. Resolve native modules from the actual packaged
handler identified by the entry point, not an invented root package.json. Build
from a canonical filesystem path on macOS to avoid `/var` versus `/private/var`
layout mismatches. A Mac install also lacks Linux optional Sharp binaries: stage
only the two Linux/x64 packages already locked by the application, verify tarball
integrity, and retain the existing output-file inclusions. No version/lock change
or host-library fallback is permitted. The exact archive must still transform an
image inside a network-disabled Linux container before deployment.

S61 rollout correction: Netlify CLI expires its function manifest after two
minutes; a delayed no-build deploy can repackage the tested function with different
bundling semantics. The first deployment returned 502 (`/run-config.json` missing)
and was restored to the preceding web artifact; schema 59 remains compatible.
Before upload, verify the exact archive SHA-256, expected handler identity, path
and runtime, then refresh only the cache manifest timestamp. Reject drift. Test
complete handler import as well as Sharp in the exact Linux archive. Upload a
draft and verify it before promotion; no implicit live retry after a failed deploy.

S61 verification note: preserve safe relative ZIP symlinks during Linux extraction.
Drafts intentionally lack production runtime values; when draft application
health is unavailable for that reason, do not copy secrets into preview. Verify
packaged health/login with existing production settings in process memory, label
any local provider context fixture explicitly, then monitor real production
responses. S61's final live deploy `6ac519154e7f2c72e452f5be` passes 28 checks;
1440/390/320 browser checks pass. See the dated release record for first-rollout
recovery and fixture limitations.
