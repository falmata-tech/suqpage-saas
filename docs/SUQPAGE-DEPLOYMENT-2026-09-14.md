# Suqpage deployment verification — 2026-09-14

Suqpage source `41e2fed154abc594534c47a8facd69d45c242c3d` is published at
https://africmade.netlify.app as Netlify deployment `6aa7fe5a106ca381ba08bba3`.
The owner approved visuals, deployment, the exact private production-data backup
and email-only sign-in. Controlling contracts: FE-035, FE-040–043, BE-032–035,
DEP-002, DEP-029–031.

## Target, data and recovery

- Independently verified Netlify account `falmatad`, site
  `26c795eb-5560-4a88-b38d-3cc922c2a5e6`; published deployment reports `ready`.
- Production Supabase `sjeiiqxgscuqajpgddcc` uses runtime role `mirtpage_runtime`.
  Additive migrations 39–43 are committed. All 66 businesses, 47 users and
  retained Auth identity links remain. Runtime CRUD grants and direct-client
  denial on new tables were verified before commit and independently afterward.
- Netlify flags are `MIRTPAGE_EMAIL_OTP_ENABLED=1` and
  `MIRTPAGE_GOOGLE_AUTH_ENABLED=0`; unrelated environment values are unchanged.
  Hosted Auth confirms email enabled/Google disabled; its configuration and
  credentials were not changed. The configured Storage bucket is private.
- Protected schema, approved public-schema data export and Netlify configuration
  backups remain under ignored `.local/deployment-20260914/` (directory 0700,
  private backups 0600). Restoring the actual data backup into disposable
  PostgreSQL 17 preserved all 50 original table fingerprints through migrations
  39–43. Reapplication was a no-op; runtime access and direct-client denial passed.
  Public-schema exports do not back up Auth credentials or Storage objects.
- The production migration checked all 50 original table fingerprints inside its
  transaction before commit. The temporary CLI login cannot read application
  tables after `SET LOCAL ROLE postgres` ends, so its final readback failed.
  Independent runtime-role reads confirmed the intended committed schema 43,
  counts, identity links and access restrictions. No migration retry or restore ran.
- Previous published deploy `6a8c791bbc9ad7b10122e4a6` remains retained as an
  incident reference. Routine source rollback must preserve PostgreSQL-only
  behavior and email-only entry; the historic artifact is not automatically
  compatible with these requirements. Any restore requires a reviewed exact plan.
- No Loadgistic resource, DNS record, Git remote, Google/SMTP credential or hosted
  Auth configuration was changed.

## Verification

- `npm run check`, `npm run release`, `npm run test:postgres-readiness`,
  `npm run test:operations` and `npm run test:container`: passed.
- `npm run test:acceptance`: 7/7 isolated local production-mode browser scenarios.
  `npm run test:accessibility`: 72/72 public, owner and administrator states.
- Current email-only configuration regressions, typecheck, 132-spec validation,
  PWA/mobile menu, 37 Auth-guard regressions and database boundaries: passed.
- Clean offline Netlify/OpenNext build: passed with public origin configuration
  only. The source copy excludes local dotenv files, backups and runtime data.
  Function archive contains Linux Sharp binaries and no private runtime paths or
  configured production secret values. SHA-256:
  `247276c5ebdcba57c48c02c9ae0a8a77276b264bcf414b7dfd9729bf085a3711`
  (25,052,307 bytes). Publication used `--prod --no-build` and explicit generated
  static/functions paths; no source archive was uploaded.
- Live health, homepage, login and reported Nile Sensor Studio page: HTTP 200.
  At 1440/390px, email-only controls, contact placement after products, linked
  product reload/back navigation, category pagination retaining the map, private
  workspace redirects, retired-route 404s and unauthorized draft/media denial pass.
  No browser application errors. Eight focused screenshots are retained under
  `/tmp/suqpage-live-20260914/`.
- Hosted demo contact operation matched 64 exact seed handles and 47 seed account
  emails. It filled only empty fields from approved local `example.com`/reserved
  drama-range fixtures. Before/after projection checks preserved all account
  emails, existing values, nonmatching records and notification destinations.
  All 64 live pages expose their expected public email/phone links and omit private
  account-phone fields; all 47 account phones are present. These contacts are
  fictional display data, not reachable channels.

## Remaining checks and limits

- Real hosted sign-in email delivery and authenticated hosted owner/admin smoke
  remain unverified. The owner has been asked to authorize one test sign-in code;
  no external email or inquiry was sent during this rollout. The full authenticated
  workflows passed against isolated local providers, not a production inbox.
- Optional inquiry email notifications lack a configured Resend API key. The
  platform inquiry inbox is connected; do not claim notification delivery.
- Hosted Auth email subject/template branding was not changed. DEP-029 requires
  an exact reviewed plan before any narrow Auth configuration apply; provider
  secrets require separately authorized dashboard work.
- Fictional contacts were not applied to nonmatching businesses. Real owners must
  provide and verify their own public and private contact information.
- No custom domain or Preview provider environment was provisioned. A future
  hosted Preview requires independent provider credentials.
- `deno.lock` remains an unrelated untracked file. No Git push or remote CI run was
  requested or performed; Netlify publication and the local release gates are verified.
