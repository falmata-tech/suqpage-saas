---
name: mirtpage-github-workflow
description: Prepare AfricMade task branches and pull requests, address PR feedback or CI failures, and qualify an authorized merge or integration. Use for GitHub workflow work; not ordinary product coding, a local test run or production deployment alone.
---

Resolve paths from this repository root. Read `AGENTS.md` and
`docs/operations/GITHUB-WORKFLOW.md`; use DEP-002 and the active checklist for
current dependencies. This skill adds no remote-action or deployment authority.

Verify the repository, remote default branch, current branch/status, task scope
and any existing PR before editing or publishing. Inspect the complete head/base
diff and ancestry; do not infer that a pushed or deployed branch is integrated.
Use a short-lived typed task branch, isolate independent agents in worktrees,
and state any unmerged parent dependency. Preserve unrelated edits and frozen
release sources. Follow the repository's explicit staging and commit checks.

For authorized PR work, reuse the existing PR and template, preserve review state
and describe the net outcome, evidence and limitations. Bind CI and reviews to
the current head; classify failures before a bounded retry. Use installed `gh`
contracts, not guessed flags. Comments and AI findings are not approving reviews.

Before an authorized merge, recheck head/base, mergeability, unresolved feedback,
required checks, actual protection and delivery wiring. Use the verified head
with `--match-head-commit`. Follow the guide's task-versus-release merge choice;
never bypass protection, self-approve, force-push or delete unmerged work as cleanup.
Source integration, artifact admission and production publication are distinct.

Report the actual resulting heads, PR/check states and next blocker. For requested
delivery use the release skill. Evaluate upstream skills before installation;
do not adopt broad staging, credentials, plugins or automatic deploys implicitly.
