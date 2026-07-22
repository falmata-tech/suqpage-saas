# SuqPage controlled-pilot roadmap

This roadmap controls sequencing; accepted specs control behavior. It prevents a
valid-looking implementation from becoming the wrong next product investment.
The master prompt remains the product north star, and security, tenant isolation,
privacy, and data integrity may interrupt this sequence when evidence requires it.

## Promotion rules

- Only the user/product owner may promote product work between **Later**,
  **Next**, and **Now**. An AI agent may propose a move but may not assume it.
- Every feature implementation must name one **Now** outcome and its controlling
  ready/in-progress spec IDs before production code changes.
- Defects, security incidents, data-integrity failures, and release blockers may
  enter **Now** immediately, but still follow the defect or emergency spec path.
- Off-roadmap requests are captured as proposals. They are not implemented until
  their outcome, priority, and non-goals are explicitly accepted.
- Keep work in progress small: finish or deliberately stop the current coherent
  outcome before starting an unrelated feature.
- Roadmap entries link to specs rather than duplicating acceptance criteria.

## Now — make the controlled pilot trustworthy

### Managed client request operations

- Outcome: clients submit onboarding/change requests and approve private
  previews while assigned SuqPage staff structure content and managers control
  onboarding and publication.
- Controlling specs: `FE-003`, `BE-003`, `DEP-003`, and `ADR-0004`.
- Delivery order: additive intake and operations queue; revision preview and
  approval; then permission cutover after replacement workflows pass.
- Exit criteria: request/attachment privacy, tenant/staff isolation, mandatory
  client approval, atomic publication/rollback, migration/restore, and all L3
  gates pass before direct client catalog/settings/design access is removed.

### Reproducible delivery and repository hygiene

- Outcome: local, CI, container, and proxy-aware production paths enforce the
  same release contract without collecting credentials or generated state.
- Controlling spec: `DEP-002`.
- Exit criteria: `DEP-002` is done, all L3 gates pass from a clean checkout, and
  the required GitHub checks are configured by a repository administrator.

### Pilot launch operations

- Outcome: complete the operator-owned items in `docs/LAUNCH-CHECKLIST.md` for
  the four approved tenants without expanding the deployment topology.
- Controlling specs: `DEP-001`, `BE-002`, and the base specifications.
- Non-goal: broad self-service onboarding or horizontal scaling.

## Next — learn from the four-client pilot

- Validate real merchant contacts, catalog workflows, inquiry handling, and
  daily backup/monitoring routines with approved pilot users.
- Turn verified user problems into concise FE/BE/DEP proposals before changing
  behavior.
- Define measurable pilot success and operational capacity before accepting a
  broader onboarding feature.

No product feature in this section is authorized for implementation merely by
being listed here; it must first be promoted to **Now** and specified.

## Later — conditional expansion

- Managed PostgreSQL and object storage before multiple instances or broad
  self-service onboarding.
- Staff roles and finer-grained operational permissions.
- A real Malikt Board adapter and callback/reconciliation contract.
- Expanded public localization based on validated pilot demand.

Each item requires a new spec and, when it changes a long-lived boundary or
topology, an ADR. The mock delivery adapter must not be presented as live while
it remains in this lane.

## Explicitly not now

- Horizontal scaling with SQLite or local media.
- Unreviewed third-party integrations, speculative abstractions, or generic
  template redesigns.
- Replacing custom showroom identities with one universal storefront theme.
- Production rollout before backup/restore, HTTPS, credential rotation, and
  monitoring checklist items are complete.

## Review cadence

Review this file when an initiative completes, new pilot evidence materially
changes priority, or a security/operational event interrupts the sequence. A
roadmap change records the reason and links the affected spec or proposal in the
same task-scoped commit.
