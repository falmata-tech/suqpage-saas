# Suqpage launch wiring audit — 2026-09-14

Scope: FE-040–043, BE-032–035, DEP-030–031. Local core, release, operations,
PostgreSQL, browser and accessibility gates pass; commit and hosted
rollout are not complete.

Deployment approval was received on 2026-09-14. Current gate results and the exact
remaining hosted blockers are tracked in `docs/SUQPAGE-DEPLOYMENT-2026-09-14.md`.
Core, operations, PostgreSQL and all seven production browser scenarios now pass.

## Frontend/backend gaps addressed

| Workflow | Frontend | Backend and verification |
|---|---|---|
| Public page | One cover with image/video poster, one About section, linked products, contacts after products | Canonical catalog/current publication; prior responsive page/contact checks and current public route walkthrough |
| Discovery | Category and search results beside a retained map, type tabs, Previous/Next | SQL counts and five-row backend windows; complete traversal and filter tests pass |
| Product choices | Owner can edit up to four named option groups | Versioned, authorized, idempotent PostgreSQL command; stable option IDs and canonical buyer validation pass |
| Product visibility | Listed/hidden control in owner product editor | Catalog filtering and hidden-product inquiry rejection; UI save/reload and persistence tests pass |
| Product simplicity | Units/features/photos/video; capacity/MOQ/lead-time inputs removed | Existing retained values preserved on unrelated saves; product regression passes |
| Single/group inquiry | Linked product choices, direct contact handoffs, platform phone input shown on request | Real platform submission reaches owner inbox; duplicate request resolves to the same inquiry; invalid and hidden items rejected |
| Owner identity | Business name/logo editor reachable from dashboard | Current ownership/version checks, private image staging and public visibility checks pass |
| Owner location | General area or explicit storefront proposal | Private versioned proposal, immediate withdrawal of previous map approval, stale-review rejection, coarse general-area approval |
| Admin location review | Pending count, directory filter and Review location action | Backend-paginated pending queue and exact-version approval; owner/admin browser workflow passes |
| First publication | Owner submits, admin reviews/returns feedback/approves | Exact draft/catalog versions, owner resubmission after changes, atomic first publication; real local workflow passes |
| Staff assistance | Admin assignment and owner consent destinations | Tenant scope, grant/revocation and owner-only publication; focused PostgreSQL/browser evidence |
| Public/account contacts | Public email/phone/socials separate from private account contacts | Existing verified account emails preserved; phone update/privacy checks pass. Fresh demo seed fills public contacts and fictional private demo phones |
| Support, subscriptions and staff operations | Existing role-scoped destinations retained and reachable | PostgreSQL support, entitlement, staff, invitation and role regressions; no invented payment or delivery provider |
| Private media | Product, identity and page uploads/read paths connected | PostgreSQL manifest includes current and retained page media in the correct namespace; reconciliation and privacy tests pass |

Custom-page request/studio routes, actions, forms and navigation are retired. Old
content snapshots remain compatible data; they cannot reopen retired public APIs.
The browser walkthrough checks retired destinations return 404. `/request` remains
normal passwordless account setup, not a custom-page request feature.

## Database and verification gaps addressed

PostgreSQL is now the only executable engine. Removed embedded database adapters,
file-database configuration, schema translation/copy tools and fallback branches.
The native installer creates schema 43 directly, including taxonomy, schedule
policy, constraints, indexes, sequences and tenant triggers. It refuses an
unversioned populated schema and preserves existing versioned data.

Required tests were converted to real isolated PostgreSQL fixtures. Retired
file-table reconstruction tests are replaced by native fresh-install, constraint,
relationship and data-preservation tests; retained snapshot upgrade tests remain.
Browser setup and CI use native PostgreSQL. The archive tools now use PostgreSQL
custom archives, hash verification, target approval and empty-target restore.
Current operational instructions are in `docs/POSTGRES-ONLY-RUNBOOK.md`.

Focused evidence collected for this candidate:

- Typecheck; 132 spec/ADR validation; PostgreSQL-only source-boundary check.
- Native schema installation, 66 demo businesses, isolated trigger references,
  repeat migration preservation and stockless schema.
- Full PostgreSQL persistence adapter regression: catalog, sessions, inquiries,
  signup, transactions, rate limiting, discovery, support, staff and invitations.
- Product upkeep, canonical options/visibility, private/public contact separation,
  security, support, media reconciliation, category pagination, scalable queries,
  featured scheduling and current owner/admin workflow tests.
- Real local browser: owner identity/logo/location/products; admin queues and
  publication; linked buyer choices; hidden-item denial; successful inquiry and
  duplicate submission reaching the owner inbox; owner/admin route sweep.
- Desktop, 390px and 320px screenshots plus focused accessibility checks under
  `/tmp/suqpage-launch-review/`. Product choice and location forms were inspected.

Tests use synthetic accounts and illustrative image fixtures, test-issued local
Auth sessions, and explicit controlled provider stubs where documented. The launch
inquiry fixture clears its notification email before sending; no external message
is sent. Browser records and private fixture media are cleaned afterward. Historical
backups and existing developer data are preserved.

## Remaining launch requirements

- Container gate passes. Visual approval, full `check`, `release`,
  production browser acceptance, accessibility and archive restore/operations have passed;
  see the deployment record for evidence and the verified backup and email-only launch decision.
- Review and task-scoped commit after required gates. Nothing has been pushed or
  deployed by this audit.
- Independently verify the exact hosted Preview/Production targets, migration/runtime
  permissions, Google/email sign-in, inquiry notification delivery, private Storage,
  health, backups and monitored rollback. DEP-029 governs hosted Auth recovery;
  local provider credentials must never replace hosted configuration.
- Two retained non-demo account phone values still need their owners' real numbers.
  The account form exists; fictional values must not be supplied for real accounts.

Database migrations, archive/restore, media reconciliation and provider maintenance
are operator commands by design. They do not need public frontend controls.
Payment checkout, inventory accounting, automatic delivery integrations and optional
Realtime are outside the accepted launch scope; they are not presented as working
integrations in this candidate.
