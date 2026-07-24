# Audit remediation summary

The launch build addresses the independent audit blockers as follows.

| Audit finding | Remediation |
|---|---|
| Credentials exposed in login UI | Removed all prefilled credentials and hints. Setup generates unique random temporary passwords outside source control. |
| Forgeable known-secret sessions | Replaced signed client-contained sessions with random opaque tokens stored and revocable in SQLite. No fallback session secret exists. |
| Public Malikt request data and writes | GET and POST now require authenticated users and enforce owner tenant scope. |
| Forged inquiries | Server loads canonical products, verifies tenant, publish status, availability, stock, quantities and every option value. Client product names are ignored. |
| Broken production uploads | Runtime files are stored in persistent media storage and served by a dynamic `/media/` route. |
| Unsafe upload validation | JPEG, PNG and WebP signatures, MIME consistency, file size and dimensions are verified; filenames are server-generated. |
| Cross-tenant foreign relationships | Server checks and SQLite triggers enforce same-business collections, categories, products, inquiries and deliveries. |
| Draft pages publicly accessible | Public lookup requires `status='active'`; authenticated preview uses `/preview/@handle`. |
| No admin onboarding | Administrator can create tenants and owners, assign renderer, publish/suspend, and reset owner passwords. |
| Catalog structure cannot be corrected | Collections and categories can be edited, reordered, activated/deactivated and deleted. |
| No migration path | Idempotent migration module and `npm run migrate` support existing databases. |
| Inconsistent DB path | Setup, runtime, backup and restore all use `SUQPAGE_DB_PATH`. |
| No rate limiting | Login and public inquiries use persistent SQLite rate limits. |
| Product writes not transactional | Product and option replacement use immediate transactions. |
| Inventory inconsistency | Zero stock automatically becomes unavailable; unavailable/coming-soon products cannot be submitted; quantities are stock-limited. |
| No notifications | Optional Resend email notification is available for business contact emails. |
| Missing headers | CSP, HSTS, frame denial, nosniff, referrer and permissions policies are configured; powered-by header is disabled. |
| Vulnerable Next.js/PostCSS patch levels | Next.js 16.2.11 and the PostCSS 8.5.12 override contain the current production-audit fixes; `npm audit --omit=dev` returns zero findings. |
| No meaningful tests | Security integration and production HTTP smoke tests are included in `npm run release`. |
| Cart lost on refresh | Per-showroom cart state persists in local storage. |
| Duplicate inquiry saves | Client and server idempotency keys deduplicate repeated social-channel actions. |
| Missing privacy/terms | Public privacy and terms pages are included. |

## Remaining controlled-pilot boundaries

- The database remains SQLite and the app must run as one server instance with persistent storage.
- The Malikt Board adapter remains simulated until the external API exists.
- Email notifications require Resend configuration.
- Full multilingual dashboard and showroom localization remains a later product increment; merchant-entered product names and option values are always preserved exactly.
