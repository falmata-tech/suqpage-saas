---
id: DEP-052
title: Git-connected Netlify delivery and verified environment readiness
status: in_progress
related: [DEP-002, DEP-026, DEP-049, DEP-029, BE-065, ADR-0032]
owners: [operations, security]
last_updated: 2026-11-12
change_level: L3
---

# DEP-052 — Automatic Netlify delivery

## Problem and outcome

The owner requests automatic Netlify builds when reviewed changes merge into
GitHub. The initial review found manual publication and no Git connection.
Admit the maintained Git/Next.js pipeline for the existing project, retaining
required checks, production isolation and a recoverable deployment. This
supersedes manual artifact-by-artifact application publication only after the
new path is verified; it does not authorize automatic database/Auth changes.

## Scope and contracts

- Link only `falmata-tech/suqpage-saas`, branch `main`, to Netlify project
  `africmade` / `26c795eb-5560-4a88-b38d-3cc922c2a5e6` in `falmatad`.
  Preserve current domains, deployment history, secrets and Supabase resources.
- Keep the five existing required GitHub jobs and protected-branch review flow.
  Normal application merges through that admitted flow are the owner's standing
  instruction to build/publish automatically through this qualified pipeline.
  Never bypass a required check or use an unreviewed branch as production.
- Build the Next.js app at repository root, not Expo or contracts. Use the
  pinned Node baseline, locked root/contracts installation, `.next`, the
  checked web-install command and Netlify's maintained Next.js adapter.
  Verify native Sharp, generated middleware, image query routing, worker and
  private runtime boundaries; prior hand-patched artifact evidence is insufficient.
- During initial qualification, retain the current production deploy and hold
  automatic publication while building the candidate. Enable automatic
  publication only after the exact pipeline/source and relevant gates pass.
  Verify the resulting deployed routes/assets/runtime, not only a green build.
- Production variables stay production-scoped. No production database, private
  Storage, service key or SMTP/push secret enters a pull-request build. Until a
  separately isolated preview target is configured, disable Deploy Previews and
  branch deploys instead of filling their empty contexts with production values.
- A normal application deploy never resets/seeds/migrates production, modifies
  Auth/SMTP/provider credentials, changes DNS, or builds/signs/uploads Android.
  Those operations retain their exact existing specs and backup/approval rules.
- Do not add a second automatic publisher (build hook, GitHub token deployment
  or CLI job) alongside native Git delivery. Retire a manual path only after
  its consumers/recovery evidence are understood; preserve existing artifacts.

## Scenarios

```gherkin
Scenario: Reviewed main change is delivered
  GIVEN the existing site is linked to the exact repository and main branch
  AND required GitHub checks protect the merge
  WHEN a reviewed application change merges
  THEN Netlify builds the root web app automatically
  AND successful publication identifies its source commit and deployment
  AND no database or managed Auth mutation runs

Scenario: Build or runtime admission fails
  GIVEN the current production deploy is retained
  WHEN installation, compilation, adapter or admission fails
  THEN the candidate is not represented as a successful release
  AND the previous production deployment remains available for recovery

Scenario: A pull request has no isolated preview backend
  GIVEN only production-scoped service configuration exists
  WHEN preview delivery is configured
  THEN branch and pull-request deploys stay disabled
  AND production credentials are not copied to preview contexts
```

## Test plan

- Existing workflow, Node-baseline, web-install, Netlify/image-routing and
  source-map/trace checks.
- Clean root/contracts web audit and actual maintained Netlify build on Linux.
- Exact repository/project/branch/settings readback, protected current CI and
  observed production publication; read-only route/media/inquiry entry checks.
- BE-065 tests for any separately applied database housekeeping.
- Authenticated writes, Expo, physical Android and notifications are qualified
  independently; untested surfaces remain explicit.

## Rollout and rollback

Record the current deploy and exact connection/build/context settings. Hold
publication, connect only the selected repository/main, qualify one native build,
then enable automatic publication and verify the current production result.
If qualification fails, retain the hold and fix the demonstrated cause; do not
restore secrets or replay an old hand-patched artifact silently. Restore the
previous compatible deployment only under the existing reviewed recovery scope.
Provider settings, database and Auth rollback remain separate operations.

## Readiness

The owner selected automatic GitHub-to-Netlify delivery on 2026-11-12.
Targets, scope, failure/preview rules and test/rollback plan are explicit.
The initial Git build and publication are now verified in traceability S189.
Automatic publication is enabled and non-production deploys are disabled. Actual
next-merge trigger observation and remote qualification of the housekeeping
source remain pending; this is not a claim that those later events occurred.

Primary references:
- https://docs.netlify.com/deploy/create-deploys/
- https://docs.netlify.com/build/configure-builds/file-based-configuration/
- https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
