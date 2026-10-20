---
id: DEP-002
title: Reproducible delivery and repository hygiene
status: in_progress
related: [FE-035, BE-003, BE-025, DEP_BASE, ADR-0002, ADR-0003, DEP-010, DEP-022, DEP-025]
owners: [operations, security]
last_updated: 2026-10-20
change_level: L3
---

# DEP-002 — Reproducible delivery and repository hygiene

## Overall engineering readiness and project skills

The owner's housekeeping request covers the overall ability to build and ship,
not only incidents in the current release. Assess architecture/code quality,
tests and CI/CD, local reproducibility, environment separation, secrets and
dependencies, recovery/observability, documentation, maintenance, costs and
agent tooling. Record repository evidence, unverified provider assumptions and
prioritized improvements in `docs/operations/ENGINEERING-READINESS.md`. Keep
release blockers separate from follow-up work; do not impose a new audit on
every small edit or add an unattended background job.

Plan before implementation:

1. Record the actual capabilities and gaps of the current stack; refresh the
   developer entry point rather than introduce another launcher or framework.
2. Install three short instruction-only project skills under `.agents/skills/`
   for actual browser review, requested delivery work and engineering review.
   Link them from a thin AGENTS router; preserve existing authority and approvals.
3. Validate frontmatter, names, bounded triggers, existing references and body
   length (at most 300 words each); review six positive and six negative routing
   cases. Keep implicit selection enabled by default. No credentials, helper
   scripts, dependencies, model settings or provider changes belong here.
4. Verify spec/workflow consistency and scoped changes. Qualify actual host
   discovery and explicit/implicit invocation separately in a fresh session;
   static validation and reasoned cases do not prove automatic activation.

These L0 instructions do not change product behavior, UI or runtime artifacts.
`SUQPAGE-MASTER-PROMPT.md` remains the product authority. Structural validation
may use the installed YAML parser if the bundled Python validator cannot import
its dependency; retain that limitation instead of claiming the bundled tool
passed. Token/cost savings require observation, not a size-based promise.

Primary references: [Codex skills](https://learn.chatgpt.com/docs/build-skills),
[maintained repository skills](https://developers.openai.com/blog/skills-agents-sdk)
and [skill evaluation](https://developers.openai.com/blog/eval-skills).

## S151 — recurring workflow quality improvement (focused checks passed)

Observed operational failures include missing JavaScript bindings and incorrect
main-entry arguments that syntax checks or mocked ports alone did not detect.
Improve the existing workflow while keeping release work primary: record
timing/failure class, fix one demonstrated cause, and measure time/cost saved
alongside security outcomes. This is a contributor routine, not an unattended
daily job or a new automation platform.

Ordered implementation plan, recorded before code:

1. Add a concise recurring-development section to `AGENTS.md`, requiring actual
   offline main-entry preflight, installed contract checks and batched/frozen
   gates without adding approval requirements or weakening existing controls.
2. Add `scripts/check-workflow-scripts.mjs`: inspect explicitly named canonical
   repository `scripts/` JS/MJS/CJS entry files, using the installed TypeScript
   compiler for syntax and missing-binding/import diagnostics. Read selected
   source and installed declarations only; never execute a target or its imports,
   read environment/secret/runtime files, install dependencies or contact services.
   Public `scripts/` or `lib/` source companions may be explicitly supplied with
   `--include`, including TypeScript imports; do not scan a directory or discover
   source graphs implicitly. TypeScript entries retain project typechecking.
3. Prove valid ESM/CommonJS/Node imports, undefined names/shorthands, misspelled
   imports, syntax failure, inert imports and rejected paths in focused tests.
   Include the small safe default set in the existing workflow gate only after
   it passes; keep explicit changed-file checking available for future scripts.
4. Run focused tests, actual selected-script admission, existing workflow
   contracts, spec validation and whitespace checks. Root reviews the independent
   change before commit/CI; no release/provider mutation belongs to this task.
5. Invoke the same `npm run test:workflow` gate once in GitHub's existing core
   job immediately after its clean web install and before `release:web`; assert
   that exact order in the existing workflow contract. No new job or framework.

```gherkin
Scenario: A changed operational script has an unresolved name or import
  GIVEN an explicitly selected canonical scripts JS, MJS or CJS source file
  WHEN offline workflow-script quality checking runs
  THEN syntax errors and unresolved bindings or imports fail with file, location and diagnostic code
  AND neither the selected script nor its imports execute
  AND secret, private runtime and outside-repository paths are rejected

Scenario: Static admission is not proof of an operation's runtime preflight
  GIVEN selected scripts pass the offline quality check
  WHEN an author prepares a provider operation
  THEN the author still exercises its actual main entry with the intended arguments and inert offline ports
  AND validates installed provider contracts and nullable responses before an external write
  AND preserves target, authorization, tenant, privacy and recovery checks
```

The checker is deliberately narrower than general JavaScript lint/type coverage.
Only explicitly selected public local imports can join its source set; installed type
declarations may resolve Node/package imports. It cannot establish runtime
behavior, SQL correctness, provider response semantics or safety of a computed
import. No dependency or lockfile change is planned. Test mapping:
`scripts/test-workflow-script-quality.mjs`, `npm run check:workflow-scripts --
<explicit scripts...>` and the existing `npm run test:workflow` gate. Local
`npm run check` and GitHub's core job invoke that same workflow gate; the remote
step precedes expensive release work. Wiring is not a claim of a completed CI run.

Local implementation evidence on 2026-10-20: the existing workflow contract and
13 in-memory regression cases pass. The actual changed B09 readiness script plus
its explicitly selected `lib/platform-assets.ts` companion passes without either
module executing (1,566 ms in the observed run). Three established recurring
scripts pass in 1,033 ms; the default list now also checks the new checker and
its test. Node syntax and specification validation pass. Tests prove undefined
bindings, shorthand values, imports and syntax fail, while Node/ESM/CommonJS and
inert TypeScript companions pass. No dependency, lockfile, application, provider
or secret setting changed. Future avoided-delay/cost savings are not yet
quantified; source-bound full gates, root review and remote CI remain separate.

The workflow research uses primary examples as evidence, not instructions:
[iterating development workflows](https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex/)
and [reviewable recurring operations](https://developers.openai.com/blog/automating-repetitive-work-at-openai-with-codex/)
support small durable plans and reuse; [TypeScript checkJs](https://www.typescriptlang.org/tsconfig/checkJs.html)
provides the installed compiler mechanism. Existing GitHub npm caching,
concurrency and failure artifacts already cover the relevant
[dependency-caching pattern](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching);
do not duplicate them. Future [VS Code tasks](https://code.visualstudio.com/docs/debugtest/tasks)
should invoke existing commands rather than introduce another launcher.
Apply these ideas to the observed Node 24/Next 16.3.8/Expo 57 Intel Mac setup,
five GitHub jobs and existing Netlify Free/Supabase/Gmail services. No new
purchase, account-limit assumption or authorization requirement follows.

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
  Host-generated `.netlify` and `.vercel` state is excluded from both the context
  and final image, including bundles left by a previous deployment.
  Dependency builds may reuse a BuildKit npm download cache; `npm ci` still
  verifies the lockfile and package integrity on each fresh dependency layer.
- Make the selected web release script the canonical web CI core gate and retain
  independent operations, browser, container, dependency, and PostgreSQL evidence.
- Build, seed, start, health-check, and clean up an isolated non-root container
  without printing generated credential values.
- Require exact production Server Action origins to be available while Next.js
  configuration is built, including documented reverse-proxy deployments.
- Derive Next.js Server Action origins and custom authenticated mutation origins
  from one exact-host contract so development proxies cannot drift between
  framework and application security layers.
- Treat `next-env.d.ts` as generated output and generate framework types before
  standalone TypeScript checks without dirtying Git.
- Use Node 24.18.1 consistently in documentation, package metadata, Docker, and
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
- The final image runs as `suqpage`, uses one persistent volume, and refuses
  unsafe production configuration before serving traffic.

## Contracts

- `npm run release:web` is the web CI core contract. Its clean root/shared-contract
  install rejects Expo/native tooling and audits all selected web/build dependencies
  at the existing moderate threshold. CI invokes it rather than maintaining a
  partial duplicate. `npm run release` retains the separate full-monorepo audit
  for Android admission; a passing web PR is not native artifact approval.
- CI additionally invokes operations, Chromium acceptance, an isolated
  container smoke command, dependency audit, and PostgreSQL migration rehearsal
  in separate bounded jobs.
- The container smoke command creates unique temporary resources, suppresses
  setup credential rows, verifies the runtime user and `/api/health`, and removes
  only resources it created even after failure.
- Production image builds receive `NEXT_PUBLIC_APP_URL` and optional exact
  `SUQPAGE_SERVER_ACTION_ORIGINS` before `next build`; the serialized Next.js
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
- The Next.js PostCSS override is at or above 8.5.23, the first release outside
  the affected range for the source-map path disclosure advisory reported as
  `GHSA-fxqj-rqcc-2cmp`, and remains patched for `GHSA-r28c-9q8g-f849`;
  remediation must not accept npm's breaking framework downgrade suggestion.
- Required GitHub merge checks are `core`, `browser`, `container`, `dependency`,
  and `postgres`; enforcing repository rules is an explicit administrator
  operation outside a code commit.

## Scenarios

```gherkin
Scenario: Private local state is excluded from a normal Docker build
  GIVEN a contributor has ignored credentials, databases, backups, dependencies, and generated output
  WHEN Docker builds from the repository root
  THEN those paths are absent from the build context and final image
  AND the application image still builds successfully

Scenario: CI and local web release use the same selected contract
  GIVEN a clean locked root and shared-contract dependency installation
  WHEN the GitHub core job runs
  THEN it invokes the complete web release contract including production HTTP smoke tests
  AND the dependency job independently rejects native tooling and audits the selected web/build graph
  AND operations, browser, container, and PostgreSQL workflows retain independent evidence

Scenario: Web admission cannot silently approve Android
  GIVEN a passing web CI run and a planned Android App Bundle
  WHEN Android admission is evaluated
  THEN the full monorepo audit still runs at the moderate threshold
  AND any advisory exception needs a fresh exact artifact-scoped owner decision

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
  WHEN the production dependency audit reports a known PostCSS advisory
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
| CI invokes selected web release, retains independent evidence and separate Android audit | contract | `scripts/test-workflow.mjs`, `scripts/test-web-install.cjs` |
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

Source-map advisory checkpoint on 2026-08-04:

- The release audit reported the newer PostCSS source-map path disclosure
  advisory against the exact `postcss@8.5.18` override while Next.js remained
  current and otherwise passed its production build.
- The bounded remediation raises only the exact override to `postcss@8.5.25`,
  above the advisory's affected `<=8.5.22` range. The framework version and
  application dependency surface remain unchanged.
- `npm ls postcss next` resolves one overridden `postcss@8.5.25` beneath
  unchanged `next@16.2.12`; `npm run release` passes the production build,
  HTTP smoke, scale fixtures, security suites, and zero-vulnerability audit.

Current dependency and release checkpoint on 2026-09-12:

- The lockfile resolves `next@16.3.4`, one overridden `sharp@0.35.4`, and
  `postcss@8.5.25`; `npm audit --omit=dev` reports zero vulnerabilities.
- `npm run check`, `npm run release`, and all 10 ordered production-browser
  workflows pass. The release rehearses the current 51-table, 2,746-row
  SQLite-to-Supabase PostgreSQL copy with source-byte preservation and verifies
  isolated Supabase Auth, private Storage, production HTTP security, and bounded
  66-page scale fixtures.
- Replacement remote checks remain required for the exact release commit, so
  the deployment spec remains in progress.
