# SuqPage agent operating contract

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
6. Make the smallest coherent change. Preserve tenant isolation and custom
   showroom identity.
7. Add tests that prove every changed acceptance criterion. Security and data
   integrity fixes require regression tests.
8. Run `npm run check`; use `npm run release` for release-affecting changes and
   `npm run test:acceptance` for user workflows.
9. Update spec status, traceability, ADRs, operational documentation, and every
   affected master-prompt section so they describe the verified implementation
   rather than the previous or merely planned behavior.
10. Review and commit only the files belonging to the current task, following
    the task-isolation rules below.
11. Report evidence, commit hash, limitations, mocks, and remaining rollout
    steps.
12. After a major change is pushed and every required remote check passes,
    compact the working context before starting unrelated work. Preserve durable
    decisions and evidence in the controlling spec, ADR, traceability, or
    operational document, then retain a concise handoff containing the current
    objective, commit and workflow-run IDs, verified gates, unresolved limits,
    running processes, and next authorized step. Do not preserve chat
    transcripts, raw test logs, credentials, customer data, secrets, or other
    transient noise in the repository.

No implementation begins from a vague request when a material product,
security, data, or deployment choice remains unresolved.

## Architecture and design rules

- Use pragmatic hexagonal architecture: domain rules must not depend on Next.js,
  HTTP, cookies, SQLite, email vendors, or filesystem details.
- Treat routes, server actions, database modules, media storage, Resend, and the
  Malikt Board simulation as adapters around explicit application/domain
  contracts.
- Apply DDD where the domain has identity or invariants: Tenant, Product,
  Inquiry, Session, and Delivery Request are entities; handles, availability,
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
- Keep SQLite access server-only. UI renderers consume typed catalog/application
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
