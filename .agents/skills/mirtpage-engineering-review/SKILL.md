---
name: mirtpage-engineering-review
description: Review MirtPage’s overall engineering setup, housekeeping, development workflow or readiness to build and ship reliably. Use when a project-wide setup audit or workflow redesign is requested; not every bug fix, small feature or unchanged test run.
---

Resolve paths from this MirtPage repository root. Use `AGENTS.md`, the active
checklist and `specs/deployment/DEP-002-reproducible-delivery-hygiene.md`; read
other controlling specs only for the areas actually under review. Preserve the
current shipping task and existing working capabilities.

Establish an evidence-based baseline from repository status, package/lock inputs,
code boundaries, test commands, local startup, CI configuration and concise
current release evidence. Distinguish verified behavior, untested assumptions,
risks and preferences. A recent incident is an example to investigate, not the
boundary of a project-wide review.

Assess the requested setup across architecture and code quality; testing and
CI/CD; local reproducibility and environment separation; secrets, authorization
and dependency security; backup/recovery, observability and failure diagnosis;
documentation, lifecycle maintenance, cost and agent/tool integration. Sample
real contracts and outcomes instead of requiring a new checklist for every file.
Inspect safe metadata and sanitized evidence, never raw secrets or customer data.

Produce a short prioritized plan with evidence, impact, smallest coherent fix,
verification and clear deferred nonblockers. Improve existing commands and
boundaries before adding tools or frameworks. Implement within the user's
current authorization; broader provider/global changes need their existing
scope checks. Do not touch Loadgistic or impose today's workaround universally.

For resulting scripts use the existing static checker and actual inert main
preflight; for affected interfaces or delivery work use the relevant project
skill. Batch related findings, freeze changed inputs once and retain valid
source-matched evidence. Measure reliability, elapsed work and costs where
observable; report unknown savings honestly. This is an on-request engineering
review, not busywork on every edit or an unattended background service.
