# Email sign-in redirect repair — DEP-033

The prior credential-free build cached `/request` as an anonymous redirect.
At runtime, a verified account without a linked shop was sent there from login,
creating a loop. Both entry routes now wait for a request before reading identity.
Server Auth URL/key settings are resolved at runtime; the proxy accepts the
supported legacy Auth-driver namespace with canonical settings taking precedence.

## Evidence

- `npm run check`: passed, including Auth/proxy, tenant/security and type checks.
- `npm run test:acceptance`: eight production-browser scenarios passed with local
  Supabase/Mailpit and Auth settings blank during build. The sign-in scenario
  covers unlinked login, setup reload, signup, linked entry and logout.
- Credential-free Netlify build: passed; `/login` and `/request` are dynamic.
- Artifact review: 931 runtime/config/asset files match the tested source,
  including the root proxy. No private runtime files or production credentials
  appear in the function archive; all retained CDN asset aliases are present.
- `npm run release`: passed, including a clean build, trace privacy, native
  PostgreSQL/scale, type/security/workflow checks and zero production dependency
  vulnerabilities. Its provider smoke was satisfied by the complete separate
  browser suite above.
- Source commit `d47f1c1`, published deployment `6aab00e841e9a4687217be7d`: CLI
  succeeded and independent Netlify readback confirmed `ready` at
  `2026-09-16T20:59:19Z`.
- Live anonymous and invalid-cookie checks: `/request` returns 307 to `/login`,
  login returns 200 with the email entry action, and both use private/no-store
  caching. No redirect cycle or static anonymous setup response remains.
- Live desktop (1440px) and phone (390px): contact links, product navigation and
  progressive inquiry controls pass. Health, all 17 legacy asset byte comparisons,
  email-only entry and anonymous dashboard denial pass. No inquiry was submitted.

## Rollout and recovery

Target: existing `africmade.netlify.app` site, ID
`26c795eb-5560-4a88-b38d-3cc922c2a5e6`. The owner already authorized deployment.
Prior application deployment `6aa80f72843cbebe952f97df` is retained for rollback.
No database migration, account rewrite or hosted Auth configuration write is part
of this fix. Schema 45 and existing provider settings remain in place.

Hosted verification confirmed the exact published deployment, anonymous entry
redirects and invalid-cookie behavior. Real OTP
and authenticated workflows were exercised against the local provider; delivery
to the owner's mailbox and their existing browser session require their retry.
No message was sent to the reported address and its spelling was not changed.
