# MirtPage GitHub and agent workflow

DEP-002 owns this contributor workflow. AGENTS.md retains staging, security and
authorization rules; DEP-049 owns release admission. These instructions do not
enable an integration or change provider settings.

## Branches and commits

Use GitHub flow: the verified default branch is the integration branch, and a
short-lived branch holds one coherent task. Read the remote default; do not assume
`master`, rename it, or treat a release branch as the permanent default.

New branches use `<type>/<optional-spec-id>-<short-outcome>`:

| Type | Example |
| --- | --- |
| `feat` | `feat/fe-069-shipment-links` |
| `fix` | `fix/fe-021-image-routing` |
| `docs` | `docs/dep-002-contributor-guide` |
| `chore`, `ci`, `test`, `refactor` | `chore/dep-002-github-workflow` |

For new task commits and PR titles, use `<type>(optional-scope): <imperative outcome>`;
for example, `fix(images): preserve resize query parameters`. Keep controlling
spec IDs and meaningful rationale in the body. Existing commits remain valid;
do not rewrite published history to retrofit a convention. No commit-lint package
or automatic version/release tooling is required by this convention.

Normally branch from the current remote default after fetching that explicit
repository. If work depends on an unmerged task, state the dependency and use
that branch as the initial PR base. Do not present inherited changes as a small
independent PR against main. Retarget after the parent merges and inspect the
new diff/checks. Existing release branches remain until their admitted artifacts
and integration dependencies are reconciled; do not delete or repurpose them.

## Work in VS Code with agents

Record repository, branch, status and task ownership before editing. Independent
agents use separate task worktrees; dependent edits need an explicit owner.
Keep user changes, ignored evidence and credentials out of task commits. VS Code
and Codex worktree features can manage isolation, but are not required: ordinary
Git worktrees and the existing `gh` CLI are sufficient.

Use the applicable specs and focused tests while editing. Preserve the existing
Chrome/visual gate for UI and exact hosted-operation controls. Stage explicit
paths and use `check-staged-scope.mjs`; follow AGENTS rather than a downloaded
skill's bulk-stage or history-rewrite shortcut.

## Pull request and review

When PR publication is authorized, find the existing PR for the exact head first.
Create a draft only if none exists; preserve an existing PR's review state.
Confirm repository, base, head and complete net diff. Use the existing template,
state the concrete outcome, controlling specs, applicable test results and real
limitations. Keep private local paths, screenshots, accounts and logs out of a
public PR. Use a body file for multiline `gh` text.

CI runs for pull requests, main pushes and manual dispatches in the current
workflow. A pushed non-main branch without a PR needs an explicit dispatch;
push success is not CI success. Bind results to the actual PR head. Inspect and
classify a failure before a bounded retry; retain the failed attempt. Do not
repeat valid local application builds for a docs-only change. Existing required
remote checks still apply; do not weaken or skip them.

Codex's GitHub review and automated review settings are available vendor features;
their enablement for this repository must be verified. An AI finding, addressed
comment or green CI badge is not an independent approving review. Resolve actual
review feedback within the authorized task and recheck affected evidence.

## Merge and release

Before an authorized merge, reread the current head/base, mergeability, unresolved
reviews and required-check results. Our existing required jobs are `core`,
`browser`, `container`, `dependency` and `postgres`; actual provider protection
is the enforcement authority. A changed base may require fresh checks. Never
approve your own PR, impersonate a reviewer, use `--admin` or disable protection
to evade a required review. Missing authority or a required review blocks merge,
not independent preparation.

Prefer a squash merge for an independent short task once allowed by repository
settings. The currently verified main protection requires linear history, so
do not select a merge commit even though the repository advertises that mode.
For an existing release branch whose commit IDs bind artifacts, retain the source
branch and its original commits. Record the resulting main commit and compare
its tree to the qualified source; a squash commit has a new identity and must
not be falsely described as the compiled commit. Requalify changed inputs if
the merged tree differs. Do not force-push/rebase a shared branch as cleanup. Use the
installed `gh pr merge --match-head-commit <verified-sha>` option to prevent a
last-minute head change from merging unnoticed. Auto-merge is optional and needs
the same authorization/review contract; this guide does not enable it.

Check delivery wiring before merging: a Netlify production branch can deploy
automatically on merge. Source-integration approval does not implicitly approve
an unreviewed production rollout. Our current guarded artifact publication is
separate from a Git merge. Never add a second automatic publishing path without
reconciling existing release controls, environment isolation and provider settings.
Deploy Previews may be useful with isolated preview data/credentials; a preview
URL alone does not prove that isolation or admission.

After merge, verify the merge result/default head and required post-merge checks;
record what source is integrated and what artifact is actually deployed. Remove
only authorized, merged task branches/worktrees after confirming no unique work,
active artifact references or dirty edits remain. Do not manufacture a release
tag/version until the delivery workflow actually uses it.

## Adopt open-source skills selectively

A skill is an instruction directory, sometimes with executable resources. It is
not normally an application dependency. Codex supports `$skill-installer`;
reviewed files can also be versioned in `.agents/skills/`. Community installers
such as `npx skills` and Netlify's `npx @netlify/skills` exist. npm/npx distributes
the installer; installing a skill is distinct from adding a production dependency.

Before adoption, inspect the maintainer, license, pinned revision/version, entire
entrypoint and relevant scripts/hooks/MCP dependencies. Check for broad staging,
unbounded retries, unexpected network/secret access, unsafe deploy defaults and
conflicts with this repository. Review updates as changes rather than silently
following a moving `latest`. Keep upstream attribution/version when vendoring;
if adapting it, record the local differences. Skills grant no new permissions.

Use the existing GitHub CLI and the focused project GitHub skill first. Consider
OpenAI's `gh-fix-ci` or `gh-address-comments` when their narrower procedures help;
their extra approval prompts must respect the user's existing authorization.
Do not install `yeet` unchanged: its bulk staging conflicts with AGENTS. Netlify's
framework/config/functions/Image CDN references are relevant candidates; its
Database and Identity skills are not a reason to replace Supabase. Add only skills
whose benefit is demonstrated, not a whole pack by default.

The three existing project skills are visible in this session's host catalog.
That proves discovery, not measured implicit-routing accuracy. A new skill still
needs structure/reference checks, realistic positive/negative routing cases and
actual workflow evidence before claiming automatic operation.

Current branch drift, verified protection and integration debt belong in
[engineering readiness](ENGINEERING-READINESS.md), not repeated release history
in this procedure. Re-read provider settings at merge time; this guide does not
add an approving-review requirement where the actual policy requires none.

## Primary references

- [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow)
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [Codex skills](https://learn.chatgpt.com/docs/build-skills)
- [Codex GitHub review](https://learn.chatgpt.com/docs/third-party/github)
- [Maintained OpenAI skill workflows](https://developers.openai.com/blog/skills-agents-sdk)
- [VS Code skills](https://code.visualstudio.com/docs/agent-customization/agent-skills)
- [Netlify deployment contexts](https://docs.netlify.com/deploy/deploy-overview/)
- [OpenAI skill catalog](https://github.com/openai/skills/tree/main/skills/.curated)
- [Netlify maintained skills](https://github.com/netlify/context-and-tools)
- [Community skills installer](https://github.com/vercel-labs/skills)
