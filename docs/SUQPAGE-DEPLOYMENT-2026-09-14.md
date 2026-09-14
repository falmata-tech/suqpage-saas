# Suqpage deployment verification — 2026-09-14

Controlling contracts: FE-035, FE-040–043, BE-032–035, DEP-002, DEP-029–031.
The owner approved the current visuals and authorized deployment. This record
separates passing local evidence from hosted publication; nothing is deployed yet.

## Verified target and rollback

- Netlify account `falmatad`, site `26c795eb-5560-4a88-b38d-3cc922c2a5e6`,
  generated origin `https://africmade.netlify.app` independently verified by API.
- Published rollback deployment remains `6a8c791bbc9ad7b10122e4a6`.
- Production Supabase `sjeiiqxgscuqajpgddcc` is active; the existing Netlify runtime
  configuration points to it, with role `mirtpage_runtime` and schema 38.
- No Loadgistic resource, DNS record, Supabase Auth setting, database record,
  Git remote or published deployment was changed. Only the approved Netlify
  production application flags changed: email OTP `1`, Google entry `0`; all
  other environment values were verified unchanged.
- Netlify configuration, schema export and explicitly approved public-schema
  data backup are retained under ignored `.local/deployment-20260914/`, with
  directory mode 0700 and file mode 0600. The data backup was restored into a
  disposable local PostgreSQL 17 instance: all 50 original table fingerprints
  survived migrations 39–43, a repeat migration was a no-op, runtime CRUD worked
  and direct anonymous/authenticated reads stayed denied. This does not back up
  Auth/Storage objects or establish recoverable OAuth credentials.

## Passing evidence

- `npm run check`: complete PostgreSQL-based core gate passed.
- `npm run test:operations`: private custom archive, hash validation, missing
  approval and populated-target refusal, isolated restore passed.
- `npm run test:postgres-readiness`: disposable PostgreSQL 17 native install,
  runtime adapters, security, product/owner workflows, pagination, contacts and
  media reconciliation passed.
- `npm run test:acceptance`: all seven production-mode browser scenarios passed.
  Fixtures use isolated local Auth/PostgreSQL/Storage and local email capture.
- PWA/mobile-menu check passed after waiting for client hydration.
- Production schema-only rehearsal with synthetic rows: migrations 39–43 apply,
  retained synthetic business data survives, repeat migration is a no-op, and
  direct anonymous/authenticated table reads remain denied.
- `npm run release`: complete final gate passed, including production build,
  62 private-file trace checks, isolated production HTTP smoke, scale/compatibility,
  security and workflow regressions, and zero production dependency vulnerabilities.
- `npm run test:accessibility`: all 72 public/owner/admin states now pass after
  the corrections. The owner gallery also passes focused keyboard/Axe checks at 1440/390/320.
  Updated editor screenshots are under `/tmp/suqpage-deploy-review/`.
- Production Auth guard: all 37 tests pass, including exact Suqpage email subjects
  and rejection of old/arbitrary subjects. The hosted email subject/template was
  not changed; DEP-029 still requires an exact reviewed private plan before apply.

## Corrections from release verification

Current tests now verify five-row backend pagination, per-product inquiry links,
the POST-only draft endpoint, and the page's own error alert rather than Next.js's
route announcer. Native demo password hashing yields to pending PostgreSQL I/O.
Privacy/terms describe the standard owner-page workflow. The embedded preview
uses a subordinate heading; cover selection stays keyboard-scrollable while its
mutations are disabled. Featured, schedule and small legal-page branding contrast
are corrected. Docker excludes previous `.netlify`/`.vercel` build state.

## Outstanding admission

1. Review and commit the transition source, preserving unrelated `deno.lock`.
2. Publish the clean, offline Netlify artifact after the scoped commit. Its build
   passed with public origin configuration only. The 25,052,307-byte function
   archive includes Linux Sharp binaries, excludes private runtime paths, and
   contains zero matches for the configured production secrets. SHA-256:
   `247276c5ebdcba57c48c02c9ae0a8a77276b264bcf414b7dfd9729bf085a3711`.
3. Apply rehearsed additive migrations 39–43, publish the reviewed artifact to
   the verified site, and monitor public, Auth, private-media and permission paths.
4. Real hosted email delivery remains unverified; owner authorization for one
   test code is requested separately. Optional inquiry email notification has no
   configured Resend API key; the platform inquiry inbox is the launch channel.
   Hosted email branding was not changed through the Auth guard.

## Additional final-gate evidence

- Container gate passed after a registry idle timeout: reproducible clean install,
  production build, non-root runtime, 62 private-path traces and fail-closed startup.
  A BuildKit package cache retains downloads; `npm ci` still verifies the lockfile.
- Email-only production configuration regression tests pass. Email OTP is required;
  disabling Google is accepted, disabling email OTP is rejected. Typecheck and
  132-spec validation pass after this change.
- Netlify initially rejected a scoped nonsecret flag creation with HTTP 403.
  Readback proved no values changed; using its standard all-feature scope for
  this nonsecret production flag succeeded, with unrelated values preserved.
- Automatic approval review rejected a secret-bearing local build. The deployable
  candidate uses the safer offline build from a clean source copy instead.

Visual approval, deployment authorization and the exact private-backup approval
are satisfied. Provider credential restoration remains outside this email-only
launch; do not use hosted configuration push or broad Auth recovery.
