# SuqPage traceability matrix

Update this table in the same change that completes or materially changes a spec.
Evidence must be reproducible; avoid transient chat claims.

| Capability | FE | BE | DEP | Primary code | Automated evidence | Status |
|---|---|---|---|---|---|---|
| Public discovery, showroom cart, saved inquiry | FE-001 | BE-001 | DEP-001 | `app/page.tsx`, `components/showroom/ShowroomApp.tsx`, `lib/inquiries.ts`, `app/api/inquiries/route.ts` | `tests/acceptance/app.spec.ts`, `scripts/http-smoke.mjs`, `scripts/test-security.ts` | done |
| Tenant/session enforcement | FE_BASE | BE_BASE | DEP-001 | `lib/auth.ts`, `lib/dashboard.ts`, `app/actions.ts` | `scripts/test-security.ts`, `tests/acceptance/app.spec.ts` | done |
| Catalog/product management | FE_BASE | BE_BASE | DEP-001 | `components/ProductForm.tsx`, `app/actions.ts`, `lib/db.ts` | `tests/acceptance/app.spec.ts`, `scripts/validate-designs.ts` | baseline |
| Mock delivery request workflow | FE_BASE | BE_BASE | DEP-001 | `lib/deliveries.ts`, `app/api/malikt/**`, `app/dashboard/deliveries/page.tsx` | `scripts/test-security.ts`, `scripts/http-smoke.mjs`, `tests/acceptance/app.spec.ts` | baseline |
| Backup, restore, migration, release, CI acceptance | FE_BASE | BE_BASE | DEP-001 | `scripts/migrate.ts`, `scripts/backup.ts`, `scripts/restore.ts`, `scripts/release.sh`, `scripts/acceptance-runner.mjs`, `scripts/acceptance-db-probe.mjs` | `scripts/test-operations.mjs`, `scripts/http-smoke.mjs`, `tests/acceptance/app.spec.ts` | done |
| Accessible forms and modal focus | FE-002 | — | — | `app/**`, `components/showroom/ShowroomApp.tsx` | `tests/acceptance/app.spec.ts` (production browser label/focus audit) | done |
| Login and adapter failure boundaries | — | BE-002 | — | `app/actions.ts`, `app/api/malikt/requests/route.ts`, `lib/notifications.ts` | `scripts/test-adapters.ts`, `tests/acceptance/app.spec.ts`, `scripts/release.sh` | done |
| Reproducible delivery and repository hygiene | — | — | DEP-002 | Planned: Docker context, release/CI, generated types, proxy origins, media tracing | Planned: `scripts/test-container.mjs`, `scripts/test-workflow.mjs`, release and acceptance gates | ready |

`baseline` means existing behavior is tested but should receive dedicated feature
specs before a material behavior change.
