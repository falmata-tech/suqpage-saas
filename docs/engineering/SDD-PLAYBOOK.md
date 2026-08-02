# MirtPage spec-driven development playbook

This is the practical workflow behind `AGENTS.md`. It adapts the SpecDevs
FE/BE/DEP model to an existing, security-sensitive SaaS rather than treating the
repository as a greenfield code generator.

## Start with the change, not the solution

Write one sentence in this form:

> For **actor**, change **observable outcome**, while preserving **critical
> invariant**.

Then identify affected layers:

- FE: interaction, content, accessibility, browser state, renderer contract.
- BE: domain invariant, use case, API, auth, persistence, provider port.
- DEP: environment, CI/CD, migration, capacity, monitoring, rollback.

Create only the layer specs the change actually touches. Cross-link them when
more than one exists. A CSS-only accessibility correction does not need a fake
backend spec; an inquiry contract change normally touches all three.

## Agent context protocol

Load context progressively to reduce token waste and contradictory reasoning:

1. Always: `AGENTS.md`, master prompt sections relevant to the request, and
   `specs/README.md`.
2. Locate: `npm run specs:list` and `specs/TRACEABILITY.md`.
3. Read: only the controlling base/feature specs and ADRs.
4. Inspect: direct code/test paths named by traceability, then callers/adapters as
   evidence requires.
5. Summarize: outcome, invariants, open decisions, plan, and gates before editing.

Do not paste the entire repository or duplicate the master prompt into a feature
spec. Prefer stable IDs, file paths, and concise decisions.

## Feature workflow

1. Draft affected FE/BE/DEP specs from the template.
2. Write success, denial/failure, retry/idempotency, and boundary scenarios.
3. Define domain language and contracts. Avoid UI-driven database design.
4. Decide test level per criterion and rollout/rollback before `ready`.
5. Implement vertical slices when possible: domain rule → application use case →
   adapter → UI → evidence.
6. Keep commits/review units aligned to spec outcomes rather than arbitrary files.
7. Mark `done` only with traceability and reproducible evidence.

## Defect workflow

1. Reproduce and identify the violated existing spec/scenario.
2. If behavior was unspecified, amend the relevant spec before fixing.
3. Add a regression test that fails for the defect.
4. Fix the smallest responsible boundary; do not redesign neighboring systems.
5. Run gates based on the defect's impact, not the apparent line count.

## Security incident and emergency hotfix

Containment may precede full spec drafting when customer/security harm is active.
The agent must still:

1. preserve evidence without customer data disclosure;
2. add a minimal incident/hotfix spec describing invariant and rollback;
3. add a regression test before completion;
4. run all safe security/release gates;
5. complete reciprocal specs, ADR/traceability, credential/session rotation, and
   post-incident documentation immediately after containment.

An emergency is not permission to bypass tenant isolation, backups, approvals,
or destructive-action safeguards.

## Architecture decision threshold

Write an ADR when a decision changes dependency direction, persistence/provider,
deployment topology, public compatibility, security model, or long-lived
constraints. Do not write ADRs for routine code organization.

Architecture proposals compare options, consequences, migration, verification,
and the trigger to revisit. “Use hexagonal architecture” alone is not a decision;
which boundary, dependency direction, and adapter contract must be explicit.

## DDD and SOLID review questions

- Is the rule expressed in domain language rather than framework terminology?
- Does an entity protect its identity/invariants through one application path?
- Are value concepts validated once at the boundary and preserved internally?
- Can domain tests run without Next.js, SQLite, filesystem, or network?
- Does each module have one coherent reason to change?
- Does adding a provider require a new adapter rather than changing domain rules?
- Are interfaces narrow and owned by the consumer/use case?
- Is abstraction justified by a real substitution, variation, or test seam?

If the answer to the last question is no, prefer a clear function and type over a
class/interface pair.

## Test selection

| Change | Required starting tests |
|---|---|
| Pure domain rule | focused unit/integration + typecheck |
| UI behavior | browser/component + accessibility/mobile case |
| API/auth/tenant/data | security + HTTP + database integration |
| Migration/media/backup | operations + integrity + rollback |
| Release/deployment | full release + acceptance + operator checklist |

Tests must include at least one negative scenario for permissions, external
input, or failure whenever those risks exist.

## Local-to-production path

1. Develop against non-customer data with generated credentials.
2. Run focused tests during iteration and `npm run check` before review.
3. CI repeats core and browser gates from a clean install.
4. Before production, back up, validate migration compatibility, run
   `npm run release`, then production preflight.
   If a reverse proxy rewrites host headers, configure exact trusted hosts through
   `MIRTPAGE_SERVER_ACTION_ORIGINS`; never use an unrestricted wildcard.
5. Deploy one pilot instance, run health/smoke checks, verify the spec's operator
   signals, and monitor the rollout window.
6. Roll back using the spec's exact code/data compatibility plan.

## Exception policy

An exception records: rule, reason, owner, risk, compensating control, expiry, and
removal issue/spec. Permanent undocumented exceptions are drift. Tests or
security controls may not be waived merely for speed.
