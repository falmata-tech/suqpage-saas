# SuqPage specification system

Specifications are the behavioral source of truth between the master product
brief and implementation. They prevent chat history, generated code, and stale
assumptions from becoming accidental requirements.

## Structure

```text
specs/
  frontend/       FE_BASE and FE feature behavior
  backend/        BE_BASE and domain/API/data behavior
  deployment/     DEP_BASE and runtime/release behavior
  templates/      required starting formats
  TRACEABILITY.md feature-to-code-to-test evidence
docs/adr/          accepted architectural decisions
```

## Lifecycle

`draft → ready → in_progress → done → deprecated`

- **draft:** open product or technical decisions remain.
- **ready:** Definition of Ready is satisfied; implementation may begin.
- **in_progress:** implementation or verification is active.
- **done:** all acceptance criteria and gates pass, with traceability evidence.
- **deprecated:** retained for history and linked to its replacement.

## Definition of Ready

- Problem, users, scope, and non-goals are explicit.
- Observable scenarios and failure cases are written.
- Security, tenant, privacy, data, accessibility, and localization effects are
  evaluated.
- FE/BE/DEP dependencies are cross-linked.
- Contracts and domain invariants are unambiguous.
- Test levels, fixtures, observability, rollout, and rollback are planned.
- No unresolved decision can materially change the implementation.

## Definition of Done

- Acceptance criteria have automated evidence or an explicitly justified manual
  check.
- Unit/integration/browser/operations tests appropriate to change level pass.
- Tenant isolation and negative paths are covered when relevant.
- Documentation, metadata, migrations, and operator steps are current.
- Observability and safe failure behavior exist where applicable.
- Rollback is possible and documented for deployment/data changes.
- `npm run validate:specs` and the applicable repository gates pass.
- `specs/TRACEABILITY.md` maps the spec to code, tests, and evidence.
- The completed task is committed as a reviewed, task-scoped change; unrelated
  dirty-worktree files remain untouched and are reported.

## Scenario policy

Use GIVEN/WHEN/THEN for behavior visible to a user, caller, operator, or attacker:

```gherkin
Scenario: Owner cannot update another tenant's product
  GIVEN an authenticated owner for tenant A
  AND a product owned by tenant B
  WHEN the owner submits an update for that product
  THEN the request is denied
  AND tenant B's product remains unchanged
```

Do not force Gherkin onto pure formatting or an internal calculation where an
input/output table is clearer.

## Change procedure

1. Copy the appropriate file from `specs/templates/`.
2. Reserve the next sequential ID in that layer.
3. Add reciprocal `related` links to affected specs.
4. Move to `ready` only after the readiness checklist is complete.
5. Implement against acceptance criteria, not prose memory.
6. Add test identifiers or paths under `test_plan`.
7. Record completion evidence in `TRACEABILITY.md` and set `done`.
8. Stage explicit task files, run the staged-scope check, review the staged diff,
   and create the task commit after all applicable gates pass.

Run:

```bash
npm run validate:specs
npm run specs:list
```
