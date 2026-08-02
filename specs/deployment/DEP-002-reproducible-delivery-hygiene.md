---
id: DEP-002
title: Reproducible delivery and repository hygiene
status: in_progress
related: [BE-003, BE-025, DEP_BASE, ADR-0002, ADR-0003, DEP-010]
owners: [operations, security]
last_updated: 2026-07-24
change_level: L3
---

# DEP-002 — Reproducible delivery and repository hygiene

## Problem and outcome

The controlled pilot currently passes its application gates, but local Docker
contexts can include private/generated state, CI does not invoke the complete
release contract or container path, production proxy origins can be omitted at
build time, and generated Next.js declarations can dirty task-scoped work.

Operators and contributors need one reproducible path from clean checkout to a
credential-safe, proxy-aware, non-root container while preserving the existing
four-tenant application behavior and single-instance pilot boundary.

## Scope

### In scope

- Exclude secrets, credentials, databases, backups, uploads, Git metadata, local
  dependencies, framework output, and test artifacts from Docker build context.
- Make the release script the canonical CI core gate and retain independent
  operations, browser, and container evidence.
- Build, seed, start, health-check, and clean up an isolated non-root container
  without printing generated credential values.
- Require exact production Server Action origins to be available while Next.js
  configuration is built, including documented reverse-proxy deployments.
- Derive Next.js Server Action origins and custom authenticated mutation origins
  from one exact-host contract so development proxies cannot drift between
  framework and application security layers.
- Treat `next-env.d.ts` as generated output and generate framework types before
  standalone TypeScript checks without dirtying Git.
- Use Node 22.16 or newer consistently in documentation, package metadata, and
  CI evidence.
- Bound or explicitly document the media-route output-file trace without
  weakening persistent media isolation.
- Isolate each browser-acceptance production build from the normal `.next`
  directory and from concurrent acceptance runs so a build cannot replace
  chunks underneath a running test or development server.
- Reject a production dependency graph containing a known high-severity native
  image-processing vulnerability.
- Reject a production dependency graph containing a PostCSS release vulnerable
  to previous-source-map path traversal; retain the supported Next.js version.
- Define the GitHub checks a repository administrator must require before merge.

### Non-goals

- UI, tenant, authentication, catalog, inquiry, delivery, or schema behavior.
- Dependency upgrades unrelated to a demonstrated delivery defect.
- A public cloud rollout, multiple application instances, PostgreSQL, object
  storage, or a live Malikt Board integration.
- Broad trusted-origin wildcards or copying runtime media into the application
  image.

## Domain language and invariants

- **Release contract:** the named spec, type, design, security, adapter, HTTP,
  build, and dependency gates executed by `npm run release`.
- **Build context:** files sent to the container builder; ignored Git state is
  private unless explicitly allowlisted for the image.
- **Trusted origin:** an exact hostname accepted for a Server Action request;
  broad production wildcards are prohibited.
- **Generated declaration:** framework-owned type output that is reproduced by
  `next typegen`, `next dev`, or `next build` and is not source authority.
- Local and CI automation never logs credential values or persists temporary
  customer/runtime data in repository paths or public artifacts.
- The final image runs as `mirtpage`, uses one persistent volume, and refuses
  unsafe production configuration before serving traffic.

## Contracts

- `npm run release` remains the single core release contract. CI invokes it
  rather than maintaining a partial duplicate.
- CI additionally invokes operations, Chromium acceptance, and an isolated
  container smoke command in separate bounded jobs.
- The container smoke command creates unique temporary resources, suppresses
  setup credential rows, verifies the runtime user and `/api/health`, and removes
  only resources it created even after failure.
- Production image builds receive `NEXT_PUBLIC_APP_URL` and optional exact
  `MIRTPAGE_SERVER_ACTION_ORIGINS` before `next build`; the serialized Next.js
  configuration must contain the expected host and no wildcard.
- One pure trusted-origin contract supplies both Next.js configuration and
  custom mutation guards. Development adds only exact localhost origins and the
  current Codespace's HTTPS forwarding origins for supported ports; production
  adds only the canonical and explicitly configured origins. Neither path trusts
  a forwarded host header or admits a wildcard.
- Type checking generates Next.js declarations first. Running development and
  production generation leaves tracked files unchanged. Type checking discards
  only stale generated development-route declarations before regenerating its
  authoritative route types.
- Browser acceptance uses a unique ignored build-output directory per run and
  removes only that directory during failure-safe cleanup.
- The installed dependency graph contains one supported `sharp` version at or
  above the first version patched for current libvips advisories; Next.js must
  not retain a vulnerable optional nested copy.
- The Next.js PostCSS override is at or above 8.5.18, the first release patched
  for `GHSA-r28c-9q8g-f849`; remediation must not accept npm's breaking
  downgrade suggestion.
- Required GitHub merge checks are `core`, `browser`, and `container`; enforcing
  repository rules is an explicit administrator operation outside a code commit.

## Scenarios

```gherkin
Scenario: Private local state is excluded from a normal Docker build
  GIVEN a contributor has ignored credentials, databases, backups, dependencies, and generated output
  WHEN Docker builds from the repository root
  THEN those paths are absent from the build context and final image
  AND the application image still builds successfully

Scenario: CI and local release use the same core contract
  GIVEN a clean locked dependency installation
  WHEN the GitHub core job runs
  THEN it invokes the complete release contract including production HTTP smoke tests
  AND operations, browser, and container workflows retain independent evidence

Scenario: Isolated container proves the production runtime
  GIVEN a freshly built image and a temporary persistent volume
  WHEN automated setup and startup run with safe production configuration
  THEN generated credential values are absent from logs
  AND preflight succeeds as the non-root application user
  AND the health endpoint reports ok
  AND automation cleans only its temporary resources

Scenario: Exact proxy origin is compiled into production configuration
  GIVEN an HTTPS canonical URL and optional exact trusted proxy hosts
  WHEN the production artifact is built
  THEN its Server Action origin configuration contains those exact hosts
  AND contains no unrestricted wildcard

Scenario: Development origin policies cannot drift
  GIVEN the application runs through the current Codespace HTTPS forwarding host
  WHEN Next.js and a custom authenticated mutation validate the browser origin
  THEN both derive the same exact host from the shared contract
  AND a sibling port, lookalike hostname, wildcard, or forwarded-host claim cannot expand trust

Scenario: Framework type generation does not create task drift
  GIVEN a clean tracked worktree
  AND an earlier interrupted development process left partial generated route types
  WHEN type checking, development startup, and production build run
  THEN TypeScript has the required Next.js declarations
  AND stale generated development declarations cannot break the source check
  AND no generated declaration becomes a tracked modification

Scenario: Browser acceptance cannot corrupt another Next.js runtime
  GIVEN a development server, release build, or another browser run shares the repository
  WHEN browser acceptance builds and starts its production test server
  THEN it uses a unique ignored output directory for that run
  AND cleanup cannot delete or replace another runtime's compiled chunks

Scenario: Media tracing remains bounded
  GIVEN uploaded media lives outside static application output
  WHEN a production build traces the media route
  THEN the build does not trace the whole repository unintentionally
  AND configured persistent media remains available at runtime

Scenario: A new native image advisory blocks release
  GIVEN the production dependency audit reports a high-severity sharp or libvips advisory
  WHEN a patched sharp version is installed
  THEN the dependency graph contains no vulnerable nested sharp copy
  AND upload decoding and sanitization regression tests pass
  AND the production dependency audit reports no vulnerability

Scenario: A transitive CSS processor advisory blocks release
  GIVEN the locked Next.js graph resolves PostCSS at a vulnerable version
  WHEN the production dependency audit reports GHSA-r28c-9q8g-f849
  THEN the exact PostCSS override is raised to the first compatible patched release
  AND Next.js is not downgraded or replaced
  AND the complete build, CSS, browser, and dependency gates pass
```

## Quality impact

- Security and tenant isolation: no domain authorization changes; build and CI
  paths must not collect tenant/runtime data or credentials.
- Privacy and data retention: temporary Docker data is isolated and removed;
  credential values are prohibited from logs and artifacts.
- Accessibility and responsive behavior: unchanged; browser acceptance prevents
  regressions.
- Localization and merchant-entered values: unchanged.
- Performance and limits: container/build jobs have explicit timeouts; tracing
  must remain inside necessary source/runtime paths.
- Failure recovery and idempotency: cleanup is failure-safe and targets only
  uniquely named temporary resources; no production volume is reused or removed.

## Observability

CI reports named gate outcomes, container health, non-sensitive runtime user and
image metadata, and bounded failure artifacts. It never reports passwords,
credential-file contents, customer contact data, database contents, provider
tokens, or environment secrets.

## Test plan

| Criterion | Level | Test path or planned ID |
|---|---|---|
| Docker context excludes private/generated state | integration | `scripts/test-container.mjs` and `.dockerignore` assertions |
| CI invokes canonical release and separate evidence | contract | `scripts/test-workflow.mjs` |
| Image setup, non-root preflight, health, safe cleanup | operations | `scripts/test-container.mjs` |
| Exact build-time Server Action origins | integration | `scripts/test-container.mjs` and serialized config assertion |
| Shared exact development origin policy | security/contract | `scripts/test-security.ts`, `scripts/test-container.mjs` |
| Generated declarations leave Git clean and stale dev types are bounded | contract | `scripts/typecheck.mjs`, `scripts/test-workflow.mjs` |
| Acceptance build output is unique, ignored, and safely cleaned | contract/browser | `scripts/test-workflow.mjs`, `scripts/acceptance-runner.mjs` |
| Media route remains functional with bounded trace | build/HTTP | `npm run build`, `scripts/http-smoke.mjs` |
| Native image dependency is patched without a nested vulnerable copy | security/dependency | `npm ls sharp --all`, `scripts/test-security.ts`, `npm audit --omit=dev` |
| CSS processor dependency is patched without a framework downgrade | security/dependency | `npm ls postcss --all`, `npm audit --omit=dev`, `npm run build` |
| Existing application behavior remains intact | acceptance | `tests/acceptance/app.spec.ts` |

## Rollout and rollback

Land independently reviewable documentation, Docker, CI, generated-type, and
tracing commits. Enable required GitHub checks only after they pass on the target
branch. No database migration or customer-data change is involved.

Rollback reverts the affected configuration/script commit. Do not remove a
required GitHub check until the corresponding rollback commit passes the
remaining release and browser gates. Container tests use disposable volumes and
never target production resources.

## Readiness checklist

- [x] Scope and non-goals agreed
- [x] Related specs linked reciprocally
- [x] Contracts and invariants explicit
- [x] Positive and negative scenarios present
- [x] Quality impacts evaluated
- [x] Test plan maps every acceptance criterion
- [x] Rollout/rollback decided

## Completion evidence

Evidence: verified on 2026-07-21 from a clean tracked worktree:

- `npm ci` completed from the lockfile with 0 reported vulnerabilities.
- `npm run check` passed specification, workflow-contract, generated-type,
  TypeScript, design, security, and adapter validation.
- `npm run test:operations` passed migration, integrity, backup, and restore
  coverage.
- Node 22.16 ran `scripts/acceptance-runner.mjs`; all five production browser
  scenarios passed across public, mobile, administrator, owner, API,
  authorization, validation, health, and security-header behavior.
- `npm run release` passed the production build without the previous unbounded
  trace warning, validated 27 output-file traces with no private runtime paths,
  passed HTTP smoke tests and reported 0 production vulnerabilities.
- `npm run test:container` built from a 12.06 kB context, revalidated all 27
  traces inside the image, and passed exact-origin, non-root preflight, health,
  credential-log, and cleanup assertions.
- Running type generation and development startup left tracked Git state clean.

The implementation and automated evidence are complete. The `core`, `browser`,
and `container` checks must still be enabled as required merge checks by a
repository administrator after this branch is pushed and the workflows pass on
GitHub; that remote rollout does not alter this code-level completion claim.

On 2026-07-22, GitHub Actions run `29888487193` passed the browser and container
jobs but returned this spec to `in_progress` after the core release audit found
new advisory `GHSA-f88m-g3jw-g9cj` in `sharp@0.34.5`. The advisory was published
after the preceding evidence was recorded. Completion requires a patched single
version dependency graph and a replacement remote run with all three jobs
passing.

Local remediation evidence on 2026-07-22:

- A clean `npm ci` installed one deduplicated `sharp@0.35.3` runtime with
  libvips 8.18.3; Next.js resolved the same overridden version and no vulnerable
  nested Sharp copy.
- `npm audit --omit=dev` and the release production audit reported 0
  vulnerabilities.
- The image decode, validation, sanitization, and persistence regression passed
  against the patched runtime through `scripts/test-security.ts`.
- `npm run check`, `npm run release`, `npm run test:operations`, all five Node
  22.16 browser acceptance scenarios, and `npm run test:container` passed.

GitHub Actions run `29889083549` then passed the `core`, `browser`, and
`container` jobs on commit `3edb2d3`, including the release audit, operations,
five browser scenarios, and production container. This replacement remote
evidence returns the spec to `done`.

Local regression evidence on 2026-07-22 after the authenticated-navigation
defect audit:

- A seven-scenario production browser run initially reproduced compiled chunk
  replacement in the shared `.next` directory, producing login-route 500s and
  cascading authentication failures rather than authorization redirects.
- The acceptance build was moved to a unique ignored output directory with
  run-scoped failure-safe cleanup. The repeated production browser run passed
  all seven public, mobile, administrator, client, operations-manager, team-
  member, legacy-owner, API, authorization, and security-header scenarios.
- Type checking now removes only stale generated `.next/dev/types` before route
  regeneration; workflow-contract validation and standalone type checking pass
  after an interrupted dev process had left an invalid generated validator.
- `npm run release` passed the final production build, 39-trace privacy check,
  HTTP smoke, TypeScript, design, security, adapter, request, revision,
  publication/rollback, and zero-vulnerability dependency gates.

Local exact-origin and trace regression evidence on 2026-07-24:

- One pure origin policy now supplies exact hosts to Next.js and normalized
  origins to custom mutation adapters. Security regression coverage rejects
  wildcard, lookalike, unsupported-port, forwarded-host, and production
  Codespace trust expansion.
- The request-attachment filesystem path is explicitly excluded from Turbopack
  static tracing. The production build completed without the unbounded-project
  trace warning, and the trace gate rejects `next.config.ts` if it reappears in
  a route manifest.
- Interrupted `.next-acceptance` output and generated acceptance TypeScript
  configuration are excluded from Docker context. The isolated context fell
  from the observed 41.07 MB to 29.14 kB.
- `npm run check`, `npm run release`, `npm run test:operations`, all seven
  production browser scenarios, and `npm run test:container` passed. The
  container verified exact compiled origins, 41 bounded output-file traces,
  non-root preflight, health, credential-safe logs, and failure-safe cleanup.

New advisory checkpoint on 2026-07-24:

- The release audit newly reported `GHSA-r28c-9q8g-f849` against the existing
  `postcss@8.5.12` override. The advisory identifies 8.5.18 as the first patched
  release. Local remediation raises only that override and explicitly rejects
  npm's unsafe Next.js 9.3.3 downgrade suggestion.
- `npm ci` reproduced the lock, `npm ls postcss --all` resolved only overridden
  `postcss@8.5.18` beneath unchanged `next@16.2.11`, `npm audit --omit=dev`
  reported zero vulnerabilities, and the production build passed.
- The complete release passed its 42-trace privacy check, HTTP, type, domain,
  security, adapter, request, revision, and zero-vulnerability audit gates; all
  seven production-browser scenarios and the isolated non-root container gate
  passed against the patched graph.
- This spec remains `in_progress` only until replacement remote `core`,
  `browser`, and `container` checks pass.
