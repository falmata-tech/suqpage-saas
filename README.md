# MirtPage

A professional digital showroom for every business. Customers explore what a
business sells, makes or grows, browse products and collections, and contact it
through its listed channels. Transport arrangement and business-owner support
remain separate live-chat workflows. Product inquiries go to the business's
SMS, WhatsApp or Telegram; there is no platform checkout or business inbox.

The web application and API use Next.js, Supabase PostgreSQL, managed Auth and
private Storage. The Expo Android app consumes shared application contracts and
the API. The public domain is [mirtpage.com](https://mirtpage.com); stable internal
`suqpage` identifiers remain where changing them would break compatibility.

## Start locally

Use Node **24.18.1**, npm, Docker and Supabase CLI. For a new local installation:

```sh
npm ci
npm run local:supabase:start
npm run local:supabase:bootstrap
npm run dev -- --hostname 127.0.0.1 --port 3102
```

Bootstrap configures the ignored local runtime and installs/migrates local
fixtures. Read [the PostgreSQL runbook](docs/POSTGRES-ONLY-RUNBOOK.md) before
using setup or migration commands against an existing installation. Never copy
local credentials or fixtures to a hosted environment as an implicit setup step.

For an already configured checkout, use the last command only. The guarded
launcher loads `.local/supabase-runtime.env`, validates loopback targets, reuses
healthy local services and starts missing services within bounded timeouts.
It does not reset, migrate or seed the database. On macOS it can start Docker
Desktop; on other systems start the Docker engine first. Missing configuration
points to `npm run local:supabase:configure`.

With the web/API running, open a second terminal for the Expo browser preview:

```sh
npm run mobile:web
```

Web/API: **http://127.0.0.1:3102**. Expo preview: **http://localhost:8082**.
The Expo preview is not evidence of physical Android or OS push behavior.
For local scheduled chat processing, use `npm run dev:with-worker` in place of
the ordinary web command; do not launch two web servers on the same port.

## Develop and verify

Read [AGENTS.md](AGENTS.md), [the product brief](SUQPAGE-MASTER-PROMPT.md) and
[specification workflow](specs/README.md). Resume the first incomplete dependency
in [the active checklist](docs/SUQPAGE-TRANSITION-CHECKLIST.md). Current release
boundaries live in [DEP-049](specs/deployment/DEP-049-mirtpage-domain-and-app-cutover.md);
older release documents are historical evidence.

Use focused tests while editing. Useful entry points:

| Purpose | Command |
| --- | --- |
| Spec validation | `npm run validate:specs` |
| Web / mobile types | `npm run typecheck` / `npm run mobile:typecheck` |
| Database/server boundaries | `npm run check:database-boundaries` |
| Workflow contracts and safe script checks | `npm run test:workflow` |
| Explicit changed JS workflow scripts | `npm run check:workflow-scripts -- scripts/<file>.mjs` |
| Complete source checks | `npm run check` |
| Web release qualification | `npm run release:web` |
| Browser acceptance | `npm run test:acceptance` |
| Recovery / container qualification | `npm run test:operations` / `npm run test:container` |

Complete gates follow the applicable change level and existing visual-approval
gate. Reuse passing evidence only when its relevant inputs remain unchanged.
Browser acceptance uses disposable local Auth/Storage and synthetic accounts;
persistence suites use isolated PostgreSQL schemas. Never point tests at
Production or reset a shared local database to fix a fixture.

Actual UI review follows [the Chrome workflow](docs/operations/BROWSER-WORKFLOW-REVIEW.md),
including affected desktop/phone web and Expo tasks, authoritative readback and
synthetic map tiles. Screenshots alone do not establish workflow correctness.

## Agent skills and engineering upkeep

Project skills in `.agents/skills/` route browser review, delivery, engineering
review and GitHub integration. Codex supports normal implicit selection and
explicit `$mirtpage-browser-review`, `$mirtpage-release`,
`$mirtpage-engineering-review` and `$mirtpage-github-workflow`. Verify discovery
and selection in the actual host; the files do not grant provider permissions.

[Engineering readiness](docs/operations/ENGINEERING-READINESS.md) records the
current setup, known gaps and prioritized improvements. Prefer measured fixes
to existing commands over more frameworks, mandatory ceremonies or paid tools.

[GitHub workflow](docs/operations/GITHUB-WORKFLOW.md) covers task branches,
commit names, PR review and authorized merge/release boundaries. Use
`$mirtpage-github-workflow` for that work; installed project skills are instructions,
not additional app dependencies or merge/deployment permissions.

## Operate and release

Follow the PostgreSQL runbook for backup, migration and restore. An application
database archive does not back up managed Auth or private Storage. Hosted changes
follow [DEP-029](specs/deployment/DEP-029-production-auth-change-guard.md) and their
exact target/backup/approval contract; never run `supabase config push`.

Keep credentials, uploads, backups, generated builds and test-account directories
out of Git, application bundles and public CI artifacts. Local, disposable test
and hosted targets are distinct. Provider readiness, successful publication,
email delivery, physical Android and Play tester enrollment require their own
evidence; a passing build proves none of those.
