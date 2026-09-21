# Suqpage agent operating contract

This file is mandatory for every human or AI change in this repository. Read it
with `SUQPAGE-MASTER-PROMPT.md`, `specs/README.md`, and the relevant base and
feature specs before editing code.

## Order of authority

1. The user's newest explicit instruction.
2. Security, tenant isolation, privacy, and data-integrity requirements.
3. `SUQPAGE-MASTER-PROMPT.md` product rules.
4. Accepted specs and architecture decision records (ADRs).
5. Existing implementation details.

If these disagree, stop and resolve the conflict in the spec or ADR. Never
silently change product behavior to match convenient code.

## Required workflow

1. Classify the request: explanation, defect, feature, security, operations, or
   architecture.
2. Find the controlling specs with `npm run specs:list` or the traceability map.
3. For a behavior change, create or update specs before production code and
   identify every section of `SUQPAGE-MASTER-PROMPT.md` whose statement of
   current product behavior will be affected.
4. Confirm Definition of Ready in `specs/README.md`.
5. Write a short implementation plan linked to spec IDs and acceptance criteria.
   Before feature work, record ordered, checkable steps in the active task
   checklist (currently `docs/SUQPAGE-TRANSITION-CHECKLIST.md`). Mark the current
   step, dependencies, verification, and approval gates. Add new user requests
   where they belong before acting; do not silently replace earlier work.
   Check items only when their stated evidence exists. Distinguish implemented,
   tested, visually approved, and deployed; resume from the first incomplete
   dependency instead of restarting or relying on conversation memory.
6. Make the smallest coherent change. Preserve tenant isolation and custom
   showroom identity.
7. Add tests that prove every changed acceptance criterion. Security and data
   integrity fixes require regression tests.
8. For visual work, run focused tests and capture the affected desktop/phone
   states first. Give the user the live local URL or focused screenshots and
   wait for explicit visual approval before running expensive full-suite,
   release, container, or remote CI gates. Security, data-integrity, and
   non-visual emergency fixes may proceed directly when delay would add risk.
9. After visual approval, run `npm run check`; use `npm run release` for
   release-affecting changes and `npm run test:acceptance` for user workflows.
10. Update spec status, traceability, ADRs, operational documentation, and every
   affected master-prompt section so they describe the verified implementation
   rather than the previous or merely planned behavior.
11. Review and commit only the files belonging to the current task, following
    the task-isolation rules below.
12. Report evidence, commit hash, limitations, mocks, and remaining rollout
    steps.
13. After a major change is pushed and every required remote check passes,
    compact the working context before starting unrelated work. Preserve durable
    decisions and evidence in the controlling spec, ADR, traceability, or
    operational document, then retain a concise handoff containing the current
    objective, commit and workflow-run IDs, verified gates, unresolved limits,
    running processes, and next authorized step. Do not preserve chat
    transcripts, raw test logs, credentials, customer data, secrets, or other
    transient noise in the repository.

No implementation begins from a vague request when a material product,
security, data, or deployment choice remains unresolved.

## Client showroom design commands

When the user asks to design, redesign, or visually review a client showroom or
booth, follow `showroom-projects/WORKFLOW.md`. Create or use the client folder
under `showroom-projects/<handle>/`, read its brief and approved assets before
choosing a recipe, and retain screenshot/review evidence there. Do not begin
from the business industry alone, skip the required desktop/phone review loop,
or treat generated illustrative media as a factual product photograph.

## Architecture and design rules

- Use pragmatic hexagonal architecture: domain rules must not depend on Next.js,
  HTTP, cookies, database drivers, email vendors, or filesystem details.
- Treat routes, server actions, database modules, media storage, and Resend as
  adapters around explicit application/domain contracts.
- Apply DDD where the domain has identity or invariants: Tenant, Product,
  Inquiry, and Session are entities; handles, availability,
  quantities, contact methods, and idempotency keys are value concepts.
- Value objects may be validated TypeScript types/functions. Do not manufacture
  classes, repositories, or dependency-injection containers without a concrete
  substitution or testability need.
- Apply SOLID to responsibilities and boundaries. Prefer small cohesive modules,
  narrow inputs, explicit return types, and dependency direction toward the
  domain.
- Define a TypeScript interface or function contract at every real port. Define
  class contracts only when runtime polymorphism or stateful lifecycle requires
  classes.
- Keep PostgreSQL access server-only. UI renderers consume typed catalog/application
  data and callbacks, never database handles.
- New external providers require an adapter, bounded failure behavior,
  idempotency where applicable, observability, and an ADR if the dependency is
  architectural.

## Specification rules

- IDs are immutable: `FE-NNN`, `BE-NNN`, `DEP-NNN`, and `ADR-NNNN`.
- Every feature spec links all affected layers. No invented related IDs.
- Use GIVEN/WHEN/THEN for observable workflows, permissions, failures, and
  invariants. Unit-level algorithms may use input/output tables instead.
- Specs describe contracts and outcomes, not speculative code structure.
- `status: done` requires passing automated tests mapped in the spec and evidence
  recorded in `specs/TRACEABILITY.md`.
- Changed behavior without a changed spec is drift. Changed specs without tests
  are incomplete.
- The master prompt is a living statement of current product reality, not a
  changelog. Planned behavior must be labeled as planned and linked to its draft
  spec or roadmap outcome; it becomes current behavior only after implementation
  and mapped evidence pass. Preserve history in Git, immutable spec IDs, and
  ADRs rather than retaining obsolete narrative in the master prompt.

## Guardrails against drift and wasted work

- Inspect before editing. Reuse existing contracts, scripts, fixtures, and
  adapters.
- Classify operational work as recurring or one-time before adding code. For a
  reviewed correction to disposable demo data, prefer the smallest direct
  operation over a permanent sync utility unless CI, repeatability, or data
  safety creates a concrete reuse requirement.
- Timebox environment and test-harness diagnosis. After one controlled retry,
  determine whether the failure is product behavior, stale test data, or test
  infrastructure before expanding implementation scope.
- Do not redesign unrelated code, add dependencies, invent integrations, or
  expand MVP scope while implementing a focused spec.
- Do not repeat the master prompt inside feature specs; link it and record only
  feature-specific decisions.
- Prefer targeted searches and targeted tests during iteration, then one complete
  gate. Do not repeatedly read or print large files without a reason.
- Keep context compact: cite paths and spec IDs, summarize discoveries, and
  preserve an explicit plan and decision log.
- Context compaction is a completion step, not a substitute for evidence. Do it
  only after requested remote publication is confirmed and required checks are
  terminal; never use a compact summary to claim an unverified result.
- Never mark work complete based only on compilation or visual appearance.
- Never weaken a check merely to make a failing gate pass. Fix the defect or
  update an incorrect contract with documented evidence.
- Never expose `.env`, databases, generated credentials, customer data, uploads,
  backups, tokens, or provider secrets.

## Hosted configuration safety (DEP-029)

- Never run `supabase config push` against a hosted project, including from a
  temporary directory, ignored one-time script, or during recovery. A push is a
  mutation, not a preview. Do not substitute a broad REST configuration write.
- Routine production Auth changes must use `npm run ops:auth-config -- plan`
  followed by the guarded apply command after the owner reviews its exact target,
  fields, and digest. Producing a digest does not grant approval to apply it.
  No raw-command fallback is permitted when the guard refuses an operation.
- DEP-029 permits an explicitly selected `--credential-source cli` to reuse the
  macOS default Supabase CLI Keychain login. This is a narrow credential-source
  exception, not permission to discover arbitrary secrets, profiles or targets.
  Keep credential bytes out of output/files; bind plans to the credential and
  retain every project, backup, approval, drift and verification check.
- Google client IDs/secrets, provider enablement, SMTP credentials, signing keys,
  and other secret changes require separate explicit owner authorization and a
  recoverable source. Make those changes in the provider dashboard; never copy
  local provider credentials to Production or "repair" them by disabling or
  replacing providers without that authorization.
- Before any hosted configuration write, verify the account/project/environment
  independently of the current directory, identify the exact fields being
  changed, and retain a protected backup. Missing or masked credentials are not
  a recoverable credential backup. Stop if backup/access/target verification is
  blocked; do not try a more powerful or broader command.
- After an unexpected remote mutation or ambiguous timeout, stop further writes,
  report the incident, and obtain direction on an exact recovery plan. A backup
  restore is another mutation, not an automatic safe fallback. Never use bulk
  configuration sync to reverse an incident.
- Keep linked Supabase database commands sequential: they may rotate the same
  temporary login role. Keep production management tokens out of application
  runtimes, builds, and routine CI; grant access only for the approved operation.
- These repository controls do not sandbox a full-access shell or provider
  administrator. Do not promise that direct commands are technically impossible.
  Preserve the separation of credentials and use provider permissions as the
  outer enforcement boundary.

## Git task isolation and commit discipline

- Record `git status --short` before editing. Treat every existing modification
  and untracked file as user-owned unless the current task clearly created it.
- A task has one coherent commit by default. Split commits only when the work has
  independently reviewable concerns with their own passing evidence.
- Never use `git add .`, `git add -A`, broad globs, or a commit-all shortcut in a
  dirty worktree. Stage explicit file paths that belong to the task.
- Do not stage, rewrite, discard, or commit a pre-existing change merely because
  it is adjacent to the task. If the task must overlap it, stop and obtain user
  direction or use carefully reviewed hunk staging when explicitly authorized.
- Before committing, inspect both `git diff -- <task-files>` and
  `git diff --cached`. Run `node scripts/check-staged-scope.mjs <task-files...>`
  to prove the staged set is non-empty, contains only declared task files, has no
  overlapping unstaged edits, passes whitespace checks, and excludes common
  secret/runtime-data paths.
- Commit only after applicable tests and gates pass. Use a concise imperative
  message that names the outcome; include controlling spec IDs in the body for
  behavior changes.
- After committing, verify `git show --stat --oneline HEAD` and
  `git status --short`. A dirty tree is acceptable only for preserved changes
  outside the completed task, and those remaining paths must be reported.
- Do not amend, rebase, force-push, push, or open a pull request unless the user
  explicitly requests that Git history or remote action.

## Change levels and required evidence

| Level | Examples | Minimum evidence |
|---|---|---|
| L0 | Copy/docs with no contract change | spec validation, relevant review |
| L1 | Local UI or pure logic | typecheck, focused tests |
| L2 | API, persistence, auth, tenant, media | focused tests, security tests, build |
| L3 | deployment, migration, external adapter | L2 plus operations and release gates |
| L4 | production rollout or destructive migration | L3 plus backup, rollback, approval, monitored rollout |

## Prohibited shortcuts

- Hard-coded tenant products, contacts, availability, or credentials.
- Direct cross-tenant queries or mutations without explicit authorization scope.
- Unvalidated client snapshots as business authority.
- Production claims for mock integrations.
- Destructive migrations without backup and rollback evidence.
- `any` at a new domain/port boundary without a documented reason.
- A broad architecture rewrite hidden inside a feature or defect change.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
