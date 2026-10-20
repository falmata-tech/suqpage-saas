# MirtPage engineering readiness

This review covers the overall ability to build and ship MirtPage, not only a
particular release failure. It is a sampled repository assessment as of
2026-10-20, controlled by DEP-002. Provider settings not independently inspected
are unverified. Release status belongs in DEP-049 and the active checklist.

The existing stack is suitable for the current product. Improve reproducibility,
developer guidance and feedback speed within it before replacing services or
adding frameworks. This assessment does not certify every module or endpoint.

## Verified foundations and gaps

| Area | Existing evidence | Gap or next qualification |
| --- | --- | --- |
| Architecture | Next.js web/API, Expo mobile, shared `packages/contracts`; explicit server/database boundary checks | Sample large workspace and domain modules during related work; architecture rules alone do not prove every dependency follows them |
| Runtime/install | Node 24.18.1 baseline, locked npm graph, clean web install, separate mobile type/dependency checks | Native cold builds are expensive; retain input-matched outputs and measure stages before tuning |
| Local development | Guarded `start-local-dev.mjs`, loopback admission and bounded PostgreSQL/Auth/Storage readiness | Keep one documented start path and current setup guidance |
| Tests | Domain/security/SQL fixtures, actual Chrome workflows, disposable browser Supabase and separate mobile contracts | Older helpers duplicate port assumptions; operations readiness should probe the connection path actually used |
| CI/CD | Five isolated jobs, pinned actions/runtime, npm caching, superseded-run cancellation and bounded failure artifacts in `.github/workflows/quality.yml` | Provider branch protection/required-check settings have not been independently qualified in this review |
| Workflow code | TypeScript checks plus explicit JS script admission; actual inert main preflight remains required | Static checks cannot establish provider/SQL/runtime behavior; qualify linked dependency layouts as well as ordinary installs |
| Environments/security | Separate local/disposable targets; tenant, role, origin, private-media and source-map tests; guarded hosted operations | Provider IAM, MFA, quota and credential-review cadence require an account-level assessment; no secrets are discovered here |
| Dependencies | Weekly grouped npm and monthly action updates in `.github/dependabot.yml`; production audits and separate Android tooling admission | Keep build-tool advisories distinct from runtime exposure and preserve explicit exception scope |
| Recovery | PostgreSQL archive/restore tests and target-bound operations; runbook distinguishes Auth/Storage backups | Verify provider backup retention and recovery exercise ownership; SQL restore alone is not full managed-service recovery |
| Observability | `/api/health`, sanitized scheduled-worker counters and bounded failure evidence | External uptime alert delivery, response ownership and retention/cost settings are not established by repository inspection |
| Documentation | Specs, traceability, browser guide and operations runbooks | Historical narratives and large checklists hinder navigation; maintain a concise current entry point and link history |
| Agent tooling | Scoped tasks, explicit staging, source-bound evidence and three focused repo skills | Verify host discovery/routing in a fresh session; measure retries and time instead of promising token savings |

The package files currently specify Next.js 16.3.8, Expo 57 and React Native
0.86.3. This is an observation, not a recommendation to freeze future security
updates. Stable internal names do not justify recreating provider accounts.

## Prioritized improvements

Release blockers stay in the release checklist. These engineering follow-ups
do not independently block an otherwise qualified release.

| Priority | Smallest useful outcome | Verification / decision boundary |
| --- | --- | --- |
| Now | Refresh README and add three focused project skills | Command/path review, spec and skill structure/trigger checks; actual host invocation remains separate |
| Now | Check changed public JS workflow scripts before costly release work; exercise the real operation entry offline | Missing binding/import, inert execution and path-boundary regressions; existing CI core job uses the same gate |
| Next scoped patch | Have disposable PostgreSQL operations wait on the mapped TCP connection they actually use | Bounded read-only `SELECT 1` before fixture DDL; no DDL retry or shared-data changes |
| Next scoped patch | Reuse the existing disposable browser port contract in older helpers | Default/alternate loopback families pass; mismatched and nonlocal targets still reject before writes |
| Next delivery improvement | Consolidate the qualified Netlify assembly path into a reproducible recurring command | Same complete static/server/edge/worker/blob contract, clean-install qualification and no hidden provider writes |
| Next account review | Establish external health alerts, backup freshness and a response owner using available provider capabilities | Prove alert receipt and a recovery exercise; inspect free-tier capabilities before adding services or cost |
| As code is touched | Split modules where responsibilities or test seams justify it; reduce repeated setup and stale docs | Preserve behavior/security coverage; avoid an unrelated architecture rewrite |
| After measurement | Consider VS Code task shortcuts and native development-build tuning | Wrap existing npm commands; compare elapsed time/failures; no implicit release-ABI or launcher change |

No provider migration, paid plan, monitoring vendor, credential rotation, global
editor setting, new lint framework or history rewrite is authorized by this
review alone. Existing authorization still applies to concrete improvements.

## Everyday feedback loop

Record relevant gate durations, failure category and avoidable retries in the
existing protected task receipt. Distinguish product, fixture/data, harness and
environment failures. Fix a demonstrated recurring cause at its owning boundary;
keep one-time corrections small. Batch related findings, freeze changed inputs
once and reuse evidence only when its actual inputs are unchanged.

Use skills to load the relevant procedure, not duplicate AGENTS and every
operational document in context. Descriptions guide selection; full instructions
load when applicable. Repo skills do not create an unattended agent or guarantee
host selection. Fresh-session checks must distinguish explicit use, implicit
use and prompts that should not select a skill.

Measure elapsed gate time, install/build frequency, retries and observed failure
rate where practical. Token counts, quota headroom, per-release cost and automatic
routing accuracy are unmeasured. Claim improvements only after observation;
never collect credentials or customer content as workflow telemetry.

The initial routing review uses these reasoned cases. They are expectations to
exercise in the actual host, not measured model outcomes:

| Should select | Representative request |
| --- | --- |
| Browser review | “Review the changed owner navigation on desktop and phone” |
| Browser review | “Click through the Expo product-preview flow and verify Back” |
| Release | “Qualify the approved Android bundle for submission” |
| Release | “Prepare recovery of this failed web deployment” |
| Engineering review | “Audit whether our setup is ready to build and ship” |
| Engineering review | “Improve project tooling, cost and development workflow” |

Backend-only sorting and a static code review should not select browser review.
A copy-only edit and an ordinary unit-test run should not select release.
A small product bug and an unchanged test rerun should not select engineering
review. Selection does not authorize a provider write.

## Research informing the choices

- [Codex skills](https://learn.chatgpt.com/docs/build-skills): repository-scoped
  instructions with detail loaded when needed.
- [Skill evaluation](https://developers.openai.com/blog/eval-skills): realistic
  activation and behavior matter; valid files alone are insufficient.
- [GitHub caching](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching):
  reuse installed inputs appropriately; caches and artifacts serve different
  purposes and must not carry secrets.
- [TypeScript checkJs](https://www.typescriptlang.org/tsconfig/checkJs.html): use
  installed compiler diagnostics for JavaScript without migrating the app.
- [VS Code tasks](https://code.visualstudio.com/docs/debugtest/tasks): integrate
  existing commands when useful rather than add another development system.

External examples inform choices; they do not override user scope or repository
security, data and hosted-operation requirements.
