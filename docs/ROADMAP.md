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

## Completed foundation — managed client request operations

- Outcome: clients submit onboarding/change requests and approve private
  previews while assigned SuqPage staff structure content and managers control
  onboarding and publication.
- Controlling specs: `FE-003`, `BE-003`, `DEP-003`, and `ADR-0004`.
- Delivered: attachment-free public interest, direct or lead-based invitations,
  authenticated client requests, server-derived request type, attributable
  clarifications, assigned staff, revision preview and approval, controlled
  customer operations, atomic publication/rollback, and migration 7 permission
  cutover.
- Evidence: `FE-003`, `BE-003`, and `DEP-003` are done with request, revision,
  migration/restore, release, container, and seven-scenario production browser
  coverage on 2026-07-22.

## Verified checkpoint — manual AI showroom recipes

- Outcome: assigned staff can admit verified private images, export a sanitized
  request-scoped AI brief, import a strict complete content/design recipe, and
  move its exact private preview through client approval and controlled
  publication without giving an external provider application authority.
- Controlling specs: `FE-007`, `BE-008`, and `DEP-007` remain `ready` because
  the broader initiative is not complete.
- Delivered checkpoint: portable schemas, opaque image keys, strict provenance
  and reconciliation, idempotent revision-v3 draft metadata, staff studio,
  preview workflow, recovery navigation, and an emergency disable switch.
- Evidence: commits `ef00c04` and `c67466d`; standard check, production release,
  7/7 browser acceptance, container privacy/build, and operations restore gates
  passed on 2026-07-24.
- Promoted follow-up delivered locally on 2026-07-25: typed section-content
  blocks, focused v4 correction controls, controlled YouTube rendering, and
  CSP/browser proof now live under the revision-v4/bank-1.2 reset-only
  development cutover.

## Now — make the controlled pilot trustworthy

### Complete typed recipes and creative bank 1.2

- Outcome: finish the promoted `FE-007`/`BE-008`/`DEP-007` recipe initiative
  through additive revision v4, typed section content, controlled YouTube, and
  focused corrections; release a materially richer mobile-first component bank
  without changing retained bank-1.1 showrooms.
- Controlling specs and decision: `FE-007`, `BE-008`, `DEP-007`, `FE-009`,
  `BE-010`, `DEP-009`, and `ADR-0007`.
- Current delivery mode: the present local database and four seeded tenants are
  disposable prototype data. The product owner approved a reset-only development
  cutover on 2026-07-25 so v4 and bank 1.2 can become the default through
  `npm run reset` instead of carrying every compatibility layer needed for a
  production data-preserving migration.
- Sequence: document the reset-only boundary; make new seeds, drafts, recipe
  imports, previews, and publications use v4 typed content and bank 1.2; add
  controlled provider/focused commands; keep remaining rollout evidence focused
  on pairwise/320-pixel browser coverage, restore operations, remote checks, and
  production data-preserving or reset-approved deployment.
- Non-goals: arbitrary tenant code, copied trade dress, animation dependencies,
  autoplay/parallax, checkout, pricing, stock, or weakening client approval.
- Future production/data-important feature switches must first ask whether the
  existing data must be preserved. If yes, use the staged migration and rollback
  path rather than this reset-only shortcut.

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
- Post-pilot refinements to the staff roles and operational permissions being
  introduced under the current managed-request initiative.
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
