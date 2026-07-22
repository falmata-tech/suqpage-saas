---
id: DEP-002
title: Reproducible delivery and repository hygiene
status: done
related: [DEP_BASE, ADR-0002, ADR-0003]
owners: [operations, security]
last_updated: 2026-07-22
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
- Treat `next-env.d.ts` as generated output and generate framework types before
  standalone TypeScript checks without dirtying Git.
- Use Node 22.16 or newer consistently in documentation, package metadata, and
  CI evidence.
- Bound or explicitly document the media-route output-file trace without
  weakening persistent media isolation.
- Reject a production dependency graph containing a known high-severity native
  image-processing vulnerability.
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
- The final image runs as `suqpage`, uses one persistent volume, and refuses
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
  `SUQPAGE_SERVER_ACTION_ORIGINS` before `next build`; the serialized Next.js
  configuration must contain the expected host and no wildcard.
- Type checking generates Next.js declarations first. Running development and
  production generation leaves tracked files unchanged.
- The installed dependency graph contains one supported `sharp` version at or
  above the first version patched for current libvips advisories; Next.js must
  not retain a vulnerable optional nested copy.
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

Scenario: Framework type generation does not create task drift
  GIVEN a clean tracked worktree
  WHEN type generation, development startup, and production build run
  THEN TypeScript has the required Next.js declarations
  AND no generated declaration becomes a tracked modification

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
| Generated declarations leave Git clean | contract | `scripts/test-workflow.mjs` |
| Media route remains functional with bounded trace | build/HTTP | `npm run build`, `scripts/http-smoke.mjs` |
| Native image dependency is patched without a nested vulnerable copy | security/dependency | `npm ls sharp --all`, `scripts/test-security.ts`, `npm audit --omit=dev` |
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
