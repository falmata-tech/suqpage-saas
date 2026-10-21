# Suqpage workflow wiring audit — 2026-09-21

S23: implementation and focused verification complete. The owner approved the
combined S22–S24 visual candidate and deployment on 2026-09-21. Controlling
contracts: FE-038 / BE-031 and FE-048 / BE-041. Release evidence and current
rollout status: `docs/SUQPAGE-S22-S24-RELEASE-2026-09-21.md`.

## Confirmed defects corrected

| Finding | Correction | Evidence |
|---|---|---|
| Admin owner recovery collected a password incompatible with email-code entry; legacy actions could still call managed password APIs | Hide managed recovery forms/badges and guard password actions before side effects; retain local rollback behavior | Browser settings/account checks; action guard regression; Auth/security suites |
| Staff creation and invitation acceptance also required human passwords | Provision email-only provider identities; retain immutable role/tenant links and unusable local sentinels. Accepting an invitation proceeds to login and grants no browser session | Real local Supabase staff creation, invitation acceptance and subsequent test-issued OTP sessions; mocked provider request assertions, failure and replay regressions |
| Admin social fields saved into legacy columns shadowed by published profile contacts | Remove those inputs and direct authorized staff to the consented editor. Without consent show the owner-controlled route. Operational Save preserves public fields | Real admin form submission, database before/after contact comparison, consent toggle and editor navigation |
| Inquiry status update reported success for a missing or foreign-tenant record | Require a matching tenant-scoped row; commit status and success audit together; return a visible error for failed writes | PostgreSQL missing/foreign/invalid/unauthorized cases and audit-failure rollback; browser stale-form submission after deletion |
| Staff or suspended dashboards implied Save would update a live page | Show owner publication authority to staff and suspension guidance to affected owners | Browser assertions for staff, active owner and suspended owner |
| Staff table still showed retired pending-page-review workload | Remove obsolete column and pending-review scan; retain active assignment counts | Staff browser page, paginated-query regression |

No schema, provider configuration, real-account data, external email, or production
mutation was needed. Temporary local accounts and their fixtures were cleaned up.

## Audited paths and their backend connections

| Surface | Backend/persistence and permission boundary | Result/evidence |
|---|---|---|
| Map, category/place filters and paged search | `lib/discovery.ts`, cached public projections and PostgreSQL queries | S21 search and S22 focused drawer evidence retained; eligible/public-only results and backend pagination. see combined release evidence |
| City selection and GPS | `/api/places`, owner business action/runtime, canonical places and location profile | Self-service and launch-wiring tests pass immediate Save, stale/foreign rejection and area-coordinate privacy |
| Products/services, images and visibility | Product upkeep action/port/PostgreSQL adapter and tenant media adapter | Launch-wiring proves persistence, stable option IDs, hidden-item exclusion and inquiry validation |
| Page editing, first Publish, subsequent Save and restoration | `/api/page-drafts`, versioned draft/publication ports and tenant-bound media routes | Self-service integration proves owner live saves, staff drafts, atomic rollback, suspension and foreign-owner denial. Restoration to original content is intentional, not a dead control |
| Public business contacts and inquiry handoffs | Published contacts plus validated legacy fallback; `inquiryHandoffs` | Canonical contacts win over legacy fields; explicitly empty contacts stay empty. Product inquiry tests prove validated destinations and encoded product/group messages |
| Structured inquiry and customer inbox | `/api/inquiries`, canonical product validation, PostgreSQL inquiry/items, paginated inbox | Persisted success and tenant-scope tests pass. Owner inbox is deliberately read-only; operations manages status under current permissions |
| Email login, account phone and invitations | Supabase OTP, immutable identity links, account-contact port and invitation token transaction | Auth/security, invitation rollback tests and local provider browser checks pass; real external email delivery is not claimed |
| Owner/public support and staff queue | Server actions or token-bound `/api/public-support`, message/assignment transactions and private attachments | Support tests pass tenant/token isolation, contact validation, assignment capacity, messages, expiry, close/reopen and reassignment |
| Page-visit metrics and renewals | Analytics visit API, privacy-derived attribution, account-health queries/manual payment command | Account-health tests pass; renewals are staff administration, not online checkout or delivery |
| Daily Featured | Admin schedule actions, policy/day persistence, eligible public schedule projection | Schedule tests pass policy, generated agenda and atomic overrides; admin route loads |
| Sponsors | Admin sponsor forms/actions, sponsor repository and public rail projection | Source trace confirms create/update/placement paths; admin route loads. No new real advertiser/payment was created in this audit |
| Admin moderation, staff assignments and business lists | Capability checks, scoped actions, paginated repositories | Security/query tests pass; nine admin destination checks pass; staff creation now verified with local provider |
| Removed custom requests, review queues and logistics | Retired routes/redirects; retained history is not an active feature | Existing self-service/security/launch evidence confirms retirement; historical tables and operator backup/migration tools do not need customer UI |

No additional disconnected controls were confirmed in these inspected paths.
This is a scoped code, database and local-browser audit, not proof against every
possible production or external-provider failure.

## Verification

Passed after applicable changes:

- `npm run test:wiring-audit` (PostgreSQL fixture; managed-provider requests mocked)
- `npm test`, `npm run test:auth-runtime`, `npm run test:standard-invitations`
- `npm run test:self-service`, `npm run test:launch-wiring`
- `npm run test:support`, `npm run test:featured-schedule`, `npm run test:account-health`
- `npm run test:scalable-queries`, `npm run test:product-inquiry`
- `npm run typecheck`, `npm run validate:specs`, `npm run check:database-boundaries`
- `node --env-file=.local/supabase-runtime.env --import tsx scripts/capture-workflow-wiring-audit.mjs`
- `git diff --check`

Browser evidence: `.local/workflow-wiring-audit/` settings, account, stale inquiry,
staff/suspended dashboards, staff directory and invitation at 1440/390/320.
Fixtures use real local Supabase identities and test-issued OTP sessions; no email
is sent. Provider failures in the integration test use a mock, not hosted Auth.
Browser harness corrections: wait for the persisted assistance state rather than
immediate checkbox state; scope alert lookup to main to exclude Next's announcer.

## Remaining boundaries

- Real external sign-in email delivery and authenticated hosted owner/admin smoke
  remain unverified. Local provider success does not replace those checks.
- Inquiry email alerts need configured Resend sender/API credentials. The persisted
  dashboard inbox works independently; the Gmail Supabase Auth sender is separate.
- Demo social handles, phone and email are examples, not verified businesses or
  delivery endpoints. Retained account names/emails may still contain legacy names;
  this audit did not rename identities or alter credentials.
- Social/SMS links prepare a handoff; Suqpage cannot confirm the external app sends
  it. Clipboard fallback remains selectable text.
- Managed search, video analysis, online payment and delivery are not implemented
  product promises and were not added to conceal missing integrations.
- Hosted rollout status is recorded in the combined S22–S24 release document.

Rollback: revert S23 code; retain accounts, links, invitations and all customer data.
Reverting code does not create passwords for newly email-only accounts; those
accounts continue through the existing OTP login. No database rollback is needed.
