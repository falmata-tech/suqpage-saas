# Suqpage resumption review — 2026-09-14

Current checkpoint: BE-035/DEP-031 retire all executable file-database tooling.
Use `docs/POSTGRES-ONLY-RUNBOOK.md` and `docs/SUQPAGE-LAUNCH-WIRING-AUDIT.md` for
current commands and evidence. Earlier dated results below are historical and do
not authorize retired commands or establish readiness of this candidate.


Classification: continuation of FE-040 visual feature work, plus documentation
and workflow review. The active sequence remains
[the transition checklist](SUQPAGE-TRANSITION-CHECKLIST.md); this report does not
replace it or authorize production changes.

## Recovered state

The supplied history contains 34,233 lines. Its final actionable exchange asks
for About and the business video to blend into the introduction/hero, with no
business section below products and no taller default introduction. The next
“continue” was interrupted by a context/connection failure before implementation. In the resumed task the owner refined this to the image
as video poster, one description beneath name/logo and an optional standalone
contact section after products.
That latest direction supersedes the in-hero About/video switch.
Earlier design directions (category templates and custom public renderers) were
superseded by one shared business profile. The later audience explicitly includes
retailers and home sellers as well as businesses that make or grow products.

Git HEAD at resumption is `5675a21` (production Auth configuration guard), preceded
by `9e7c3f4` (recovery record), `7ace89c` (PostgreSQL regression), and `b2806c1`
(Suqpage launch work). The Suqpage transition is a large pre-existing uncommitted
worktree. Its profile, owner draft/publication services, public renderer, cover
projection, logo and platform branding must be preserved. `deno.lock` and
`feature-request-docs-and-assets/` remain outside this task. No staging, commit,
remote check, deployment or provider configuration write is implied by resumption.

## Review scope and sources

- Read the operating contract, specification readiness/done rules, master prompt,
  active transition checklist, roadmap and engineering playbook.
- Read controlling FE-040, BE-032, DEP-030 and ADR-0018, the base specs and FE-002
  accessibility rules; inspect their implementation and focused test paths.
- Review Git history, traceability, README setup, local development launcher,
  release/launch recovery records, operations runbook and `.github/workflows/quality.yml`.
- Inventory the documentation corpus: 32 Markdown documents under `docs` before
  this report, 109 under `specs`, 142 client-project documents, and one SDK README.
  Inventory/status scanning is not a line-by-line correctness audit of every old
  client brief or historical feature. No client-specific recipe redesign is part
  of this shared component change.
- Read the final transition exchanges closely and index the longer supplied
  history. Older setup and deployment claims remain historical evidence, not
  proof about current tools or hosted state.

## Findings and disposition

| Finding | Disposition |
|---|---|
| S2e was still awaiting a choice despite the final continue instruction | Resume the requested visual work, incorporating the subsequent poster/description/contact direction; retain visual approval as a separate gate. |
| Products/About navigation and trailing About conflicted with the newest request | FE-040 now specifies a video poster and one description; S2e/S2f track implementation and contact privacy evidence. |
| DEP-030 said disabling the gate restores a custom design | Corrected to canonical content in the shared profile, matching public routes and BE-032. Release rollback is required to restore the prior renderer. |
| README leads with SQLite runtime/reset instructions and separate custom pages | Stale relative to master sections 15/17, ADR-0015 and FE-040. Use the guarded `dev:local` path; reconcile README before release. Never use reset to recover retained local data. |
| FE/BE/DEP base specs retain old renderer, session and single-instance SQLite descriptions | Reconcile with later accepted Supabase and shared-profile contracts before S7; do not reinterpret these historical descriptions as runtime authorization. |
| Master/roadmap contain legacy current-sounding statements | S2j reconciles the master with retired custom tools and standard page review; historical records remain. Older roadmap and full-gate assertions require S7 reconciliation. |
| Engineering playbook says full check before review, while AGENTS requires visual review first | Follow the higher-priority explicit visual gate in AGENTS step 8; align wording before release. |
| S3b combines already-tested discovery covers with still-missing work | Current cover propagation has prior focused evidence; first listing moderation and private-asset retention remain incomplete. |
| The previous Auth incident still has unresolved hosted recovery | DEP-029 remains mandatory. Local provider tests do not prove Google/SMTP recovery or authorize a hosted config push. |

## Next sequence

1. S2e/S2f implementation and focused verification now pass; review the recorded
   desktop/phone poster, description and contact screenshots.
2. Obtain explicit S2b visual approval before expensive full check, release,
   acceptance, container or remote gates.
3. Continue S3b first-listing moderation and private-asset retention, then S4
   new-seller product/category/options and address privacy, and S6 retailer demos.
   Define readiness for each before its implementation; preserve completed S3a/S3c/S5.
4. Reconcile remaining documentation drift and run S7 gates on the reviewed
   candidate. Review/stage only declared task files after gates pass.
5. Perform S8 hosted Auth recovery and rollout only through the separately
   authorized target/backup/review procedure. Earlier deployment permission does
   not authorize new provider credentials or broad configuration replacement.

Current review server: `http://127.0.0.1:3101`, started with the checklist's isolated
local PostgreSQL/Auth/Storage command. Node is `v24.18.1`. Existing local Supabase
containers were already running; no reset or migration was needed for S2e.
Verification results and screenshot paths belong to S2e in the active checklist.

## Latest resumed checkpoint

The owner's later request separates public page email/phone from private account
email/phone. S2g in the transition checklist records the implemented migration,
self-only account form, signup privacy correction, public notification-data
projection, approved fictional demo fill, focused tests and browser evidence.
All 66 active demo pages now show email/phone after products, including the exact
reported sensor URL. All 47 demo users retain account email and have private phones.
Two non-demo phone values and explicit visual approval remain pending; no full
release gate, commit, remote mutation or deployment is claimed.


## Product/inquiry/search checkpoint — 2026-09-14

S2h (FE-041) now implements the owner's next correction: shareable inline product
pages, photo-first media, feature chips and concise selling units, independent
single-product and grouped inquiries, configured app/copy handoffs, progressive
Suqpage reply-phone form, and search results alongside the retained map. Focused
browser/security/domain checks and public/owner preview regressions pass; evidence,
stubs and exact review URLs are in S2h. No migration was required for this step.

Next authorized dependency is explicit visual review of this candidate before
expensive full gates. Reconcile legacy acceptance assertions during approved S7
work. S2g's two real account phone values, S3b/S4/S6–S8 and hosted Auth recovery
remain separate outstanding dependencies. Server remains on port 3101; no commit,
push, hosted configuration change, deployment or external message occurred.


## Category/admin audit checkpoint — 2026-09-14

The newest instruction adds S2i/S2j (FE-042/BE-033, ADR-0019): category-without-query
results, SQL pagination, complete live custom-request retirement and standard page
connections across owner/staff/admin. Implemented and focused-tested locally;
`SUQPAGE-APP-WIRING-AUDIT.md` records scope, fixed gaps, criterion-mapped checks,
1440/390/320 screenshots, migration 42 backup, fixture cleanup and retained history.
Canonical business-details edits now invalidate outstanding reviews as catalog edits
do. New product images stay private until publication and after suspension. Direct
staff assignment preserves separate owner consent. Local standard editing is enabled
unless explicitly disabled with SUQPAGE_OWNER_EDITOR_ENABLED=0.

Next dependency: user visual approval at port 3101 before full check/release and
acceptance reconciliation. First-listing and new-owner products are locally verified;
broader retention, demos, real non-demo phones and hosted Auth/rollout remain open.
No full-gate, commit, remote mutation or deployment claim. Keep the active dirty
worktree and continue from S2j.5 instead of restarting previous steps.
