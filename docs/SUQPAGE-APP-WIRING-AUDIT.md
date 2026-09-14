# Standard-page application wiring audit

Current checkpoint: BE-035/DEP-031 retire all executable file-database tooling.
Use `docs/POSTGRES-ONLY-RUNBOOK.md` and `docs/SUQPAGE-LAUNCH-WIRING-AUDIT.md` for
current commands and evidence. Earlier dated results below are historical and do
not authorize retired commands or establish readiness of this candidate.


Controlling direction: FE-042, BE-033, ADR-0019; S2i/S2j in the transition checklist.
Local source audit 2026-09-14. Existing user work is preserved in the active tree;
no historical database records or assets are removed.

| Area | Audit finding | Required correction / evidence |
|---|---|---|
| Category results | Panel required a meaningful query; business rows sliced in browser and products capped at 40 | Five-row SQL pages, exact counts and stable All/type traversal; map remains independent. |
| Signup | Already uses business_onboarding_profiles, separate from service_requests | Preserve; verify both runtime adapters and no legacy request creation. |
| Custom request surface | Intake APIs, request pages, clarification, assignment, revision/studio/publication actions remained live | Remove routes/actions/components and hard-fail retired route prefixes; retain account signup at /request. |
| Dashboard | Owner/staff/admin navigation, counts and CTAs still led to custom projects | Standard Products, Your page, Page reviews, Marketplace and Support navigation. |
| New owner catalog | Product route and adapter authorization required an old published catalog version | Permit authorized draft-tenant product upkeep; preserve concurrency/idempotency and tenant scope. |
| Product media | Upload helper wrote to the public namespace before tenant authorization | Authorize first and store new tenant product images privately, served only to authorized staff/owner until active publication. |
| Categories | Admin-only management blocked self-service catalog setup | Owner tenant scope and assigned staff scope; audit and content-version invalidation. |
| First page | Owner publication required an already-active business | Saved owner submission, admin exact-version review, atomic first publication, attributable feedback. |
| Staff assignment | Mutation existed only through a service request | Direct business assignment/revocation; page assistance still requires owner consent. |
| Historical compatibility | Catalog snapshots and operations migration readers share older revision modules | Retain only required compatibility/data readers; no app route enables custom design. |

## Verified local candidate — 2026-09-14

Implemented locally and focused-tested; visual approval and release remain open.
The audit covered active public routes, owner/staff/admin navigation and actions,
review/catalog/media authorization, signup/invitations, schema and controlling
documentation. It is not a claim that every historical module or hosted provider
has been revalidated.

| Contract | Reproducible evidence |
|---|---|
| FE-042 D1/D2; BE-033.1 | `test:discovery-pagination`: five-row SQLite query windows, all/type counts, no duplicate traversal, filters, empty/escaped queries, page normalization and unpaid result ordering. Existing `test:discovery` passes, including its 10,000-page grouping fixture. `test:category-results:visual` checks category-without-query, Next/Previous, reload/type reset, retained map DOM, visible pagination and accessibility at 1440/390/320. |
| FE-042 W1; BE-033.5 | `test:standard-pages:visual`: nine retired path variants return 404 for authenticated GET and anonymous POST; no old nav links. Real signup leaves service_requests unchanged. `test:standard-invitations` verifies independent private accounts, hashed/expired/revoked/replayed tokens, duplicate email and custom-request rejection. Local PostgreSQL also verifies standalone invitation creation and request rejection. |
| FE-042 W2; BE-033.2/3 | `test:page-review` (three domain tests), `test:owner-page` (22 tests), `test:standard-pages:postgres`: owner/foreign permissions, draft categories/products, private sanitized product media, exact-version submission/idempotency, stale category/catalog denial, feedback/resubmission, atomic first publication and suspended-image denial. Existing `test:product-upkeep` passes. |
| FE-042 W2/A1 | Real local Auth/Storage/browser workflow: signup, category, uploaded product, private image/page denial, saved owner draft, admin queue/preview, feedback, resubmission and approval, public page/image and live owner workspace. A canonical business-name edit invalidates review and hides approval until owner resubmission. |
| FE-042 W3; BE-033.4 | Local PostgreSQL verifies direct admin staff assignment/revocation, foreign owner denial, owner-only publication, admin read-only pending preview and no admin content editing without owner consent. Staff assistance UI captures prove the independent assignment page is reachable. |
| FE-042 A1 | Seven owner/admin states captured at desktop/390/320. Focused Axe reports no violations. Narrow heading/action overlap was fixed and bounding-box assertions now cover it. |

Additional passing focused checks: typecheck, 127-spec validation, database
boundaries, six product/inquiry domain tests, signup and retained product upkeep.
Whitespace review passes. No full check/build/release/container/remote CI result
is claimed for this candidate.

## Retirement and retained history

Removed custom intake/request/revision/studio/library pages, APIs, forms and
server actions. The proxy blocks retired prefixes before authentication. Standard
account setup at `/request` remains; that URL creates an account/business rather
than a custom-page request. Invitations create independent private workspaces;
older valid invitation redemption does not mutate old request records.

Historical database rows, assets, SDK schemas and catalog snapshot readers remain
for data integrity and recovery. There is no live custom-design feature entrypoint.
The active `check` command now uses owner-page/page-review/standard-invitation
regressions in place of retired request and revision publication workflows;
retained snapshot/schema/media/security/product-upkeep checks remain. Original
historical test files are preserved, including pre-existing user edits.
The broad acceptance runner and older visual source assertions still describe
some pre-transition routes/renderers. Reconcile them against FE-040/041/042 during
the approved full-gate step; do not revive removed features to satisfy them.

## Local operations and limits

- Migration 42 applied to local PostgreSQL only after a verified, gitignored,
  mode-0600 PGDMP backup at `.local/backups/before-page-review-20260914.dump`.
  PUBLIC/anon/authenticated cannot read the review table directly. Rollback keeps
  additive schema and history. No hosted migration or provider configuration write.
- Database integration fixtures roll back. Browser fixtures and their private media
  are removed after verification. Test-issued local Supabase OTP sessions do not
  send email. The product picture is a synthetic flat fixture, not a factual photo.
- The earlier YouTube playback-layout stub does not prove video-provider availability.
  No external inquiry, email, SMS, Telegram or WhatsApp message was sent.
- Source started with a large user-owned dirty transition tree. No staging, commit,
  push, deployment or remote CI was performed. Preserve unrelated edits.
- Earlier work still has two non-demo account phones awaiting real values, broader
  asset-retention/rollout work, and hosted Auth recovery. Demo account emails remain
  unchanged; those dependencies are not evidence of a failure in this local flow.

## Review

Local server: `http://127.0.0.1:3101`.

- Category results: `http://127.0.0.1:3101/?industry=electronics`.
- Role workspace: `http://127.0.0.1:3101/dashboard`.
- Admin review queue: `http://127.0.0.1:3101/dashboard/admin/page-reviews`.
  It may be empty after fixture cleanup; use an admin session.
- Screenshots: `/tmp/suqpage-category-review/category-{1440,390,320}.png` and
  `/tmp/suqpage-standard-page-review/{new-owner-dashboard,submitted-owner-page,
  admin-overview,admin-review-queue,admin-page-review,published-owner-dashboard,
  staff-assistance}-{1440,390,320}.png`.

Explicit visual approval is the next dependency under AGENTS.md step 8. Then run
and reconcile the applicable full gates before a reviewed, properly isolated commit.
Hosted publication remains a separately authorized action.
