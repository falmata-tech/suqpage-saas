# SuqPage traceability matrix

Update this table in the same change that completes or materially changes a spec.
Evidence must be reproducible; avoid transient chat claims.

| Capability | FE | BE | DEP | Primary code | Automated evidence | Status |
|---|---|---|---|---|---|---|
| Public discovery, showroom cart, saved inquiry | FE-001 | BE-001 | DEP-001 | `app/page.tsx`, `components/showroom/ShowroomApp.tsx`, `lib/inquiries.ts`, `app/api/inquiries/route.ts` | `tests/acceptance/app.spec.ts`, `scripts/http-smoke.mjs`, `scripts/test-security.ts` | done |
| Tenant/session enforcement | FE_BASE | BE_BASE | DEP-001 | `lib/auth.ts`, `lib/dashboard.ts`, `app/actions.ts` | `scripts/test-security.ts`, `tests/acceptance/app.spec.ts` | done |
| Versioned showroom content management | FE-003 | BE-003 | DEP-003 | `lib/revision-service.ts`, `app/dashboard/requests/**`, `app/revision-actions.ts` | `scripts/test-revisions.ts`, `tests/acceptance/app.spec.ts` | done |
| Mock delivery request workflow | FE-003 | BE-003 | DEP-001 | `lib/deliveries.ts`, `app/api/malikt/**`, `app/dashboard/deliveries/page.tsx` | `scripts/test-security.ts`, `scripts/http-smoke.mjs`, `tests/acceptance/app.spec.ts` | done |
| Backup, restore, migration, release, CI acceptance | FE_BASE | BE_BASE | DEP-001 | `scripts/migrate.ts`, `scripts/backup.ts`, `scripts/restore.ts`, `scripts/release.sh`, `scripts/acceptance-runner.mjs`, `scripts/acceptance-db-probe.mjs` | `scripts/test-operations.mjs`, `scripts/http-smoke.mjs`, `tests/acceptance/app.spec.ts` | done |
| Accessible forms and modal focus | FE-002 | — | — | `app/**`, `components/showroom/ShowroomApp.tsx` | `tests/acceptance/app.spec.ts` (production browser label/focus audit) | done |
| Login and adapter failure boundaries | — | BE-002 | — | `app/login/page.tsx`, `lib/auth.ts`, `app/actions.ts`, `app/api/malikt/requests/route.ts`, `lib/notifications.ts` | `scripts/test-adapters.ts`, `tests/acceptance/app.spec.ts` (authenticated login-route regression), `scripts/release.sh` | done |
| Reproducible delivery and repository hygiene | — | — | DEP-002 | `.dockerignore`, `Dockerfile`, `compose.yaml`, `.github/workflows/quality.yml`, `next.config.ts`, `lib/config.ts`, `lib/media.ts`, `package.json`, `scripts/typecheck.mjs`, `scripts/acceptance-runner.mjs`, `scripts/release.sh` | `scripts/test-container.mjs`, `scripts/test-workflow.mjs`, `scripts/test-build-trace.mjs`, `scripts/test-security.ts`, `scripts/test-operations.mjs`, `tests/acceptance/app.spec.ts`, `npm run release`, GitHub Actions `29889083549` | done |
| Managed client requests, staff fulfillment, clarification, preview approval, and publication | FE-003 | BE-003 | DEP-003 | `lib/request-*.ts`, `lib/invitations.ts`, `lib/staff-operations.ts`, `lib/revision-service.ts`, `lib/schema.ts`, `app/dashboard/requests/**`, `app/dashboard/clients/new/page.tsx`, `components/*RequestForm.tsx`; schema migrations 2–7 | `scripts/test-requests.ts`, `scripts/test-revisions.ts`, `scripts/test-security.ts`, `scripts/http-smoke.mjs`, `scripts/test-operations.mjs`, `tests/acceptance/app.spec.ts` | done |
| Constrained showroom component-bank and proposal contract | — | BE-004 | — | `lib/showroom-composition.ts`, `showroom-sdk/component-bank.schema.json`, `showroom-sdk/showroom-proposal.schema.json` | `scripts/test-showroom-composition.ts`, `npm run check` | done |
| Curated cross-industry component bank and staff visual laboratory | FE-004 | BE-005 | DEP-004 | `components/showroom/bank/**`, `lib/showroom-bank-release.ts`, `app/dashboard/design-bank/page.tsx`, `lib/capabilities.ts` | `scripts/test-showroom-bank.ts`, `scripts/test-security.ts`, `tests/acceptance/app.spec.ts`, `npm run check`, `npm run build` | done |

`baseline` means existing behavior is tested but should receive dedicated feature
specs before a material behavior change.
