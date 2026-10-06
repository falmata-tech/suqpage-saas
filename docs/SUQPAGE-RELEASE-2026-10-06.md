# Suqpage web and Expo release — 2026-10-06

Owner target: publish the approved web/API work and provide an Expo internal
Android APK. Google Play and AAB submission are deferred. Source includes S49–S60
visitor/owner mobile work, map/search controls and multi-location filters,
transport live chat and dispatcher workflow, storefront accents, sponsor rotation,
localized copy and account-deletion request entry. No Loadgistic changes.

## Verified web candidate

- Normal lifecycle, clean root/shared npm install; native toolchain absent.
- Web/build dependency audit: zero findings at the unchanged moderate threshold.
- Complete check command and 11/11 isolated browser acceptance workflows pass.
- Release: production build, provider HTTP smoke, database/scale, security and
  remaining release stages pass. Initial scale stage had no local test URL; the
  exact remaining commands passed with the local-only URL. Original logs retained.
- Operations backup and restore tests pass. Private production schema-58 backup
  restored 58 tables/3,890 rows; migration 59 preserves existing data, supports
  resolved transport chats and is repeat-safe. Auth/Storage are outside this
  constraint-only migration and remain unchanged.
- Final Netlify archive SHA-256:
  `9c91275b1adba57d111452241eb772e7c379db9384a1fdae64a7ad3471c596ed`.
  Exact Linux Sharp transform passes; 128 output traces exclude private paths.
  The 1,645-entry function archive excludes Expo/React Native and the affected
  native tools. Initial packaging failures are recorded, not hidden.

## Repeatable packaging

Use a clean root/shared install with `SUQPAGE_INSTALL_TARGET=web npm ci
--workspace=@suqpage/contracts --include-workspace-root`, then `npm run release:web`.
On a Mac, run `node scripts/prepare-netlify-native.mjs` before the Netlify artifact
build: it verifies and installs only Linux Sharp optional packages already pinned
in the lockfile. Use the canonical filesystem path and Netlify CLI `--cwd` from
outside the monorepo so the root Next app is selected. The explicit unversioned
Next adapter uses `.next` as its publish directory. Always test the final archive
with `scripts/test-netlify-native.mjs`; local Next compilation is insufficient.

## Android boundary and remaining gates

Expo target is `@falmatad/suqpage`, preview/internal APK, production API. The current
full native audit remains failed: braces 3.0.3 and node-forge 1.4.0 produce 20 graph
findings. No compatible upstream fix is offered. The fresh Android export maps
1,561 sources and excludes both packages; Expo's standard Metro runtime loader is
expected. This is not final APK/device evidence. A narrow one-artifact exception
is pending owner decision; it is not inferred from deployment approval. No build,
paid service, Play submission or invitation has been initiated.

## Rollout and rollback

Initial prepublication plan: source commit, migration and deployment pending. Verify
Netlify site/account/domain and Supabase project independently, apply only migration
59, run hosted preflight and deploy the verified archive. Monitor health, discovery,
transport session boundaries and the new native API before any mobile distribution.
Retain the additive schema and all chat history if reverting the web artifact.
Do not restore customer data or broad Auth configuration as an automatic rollback.
Private gate receipts, target metadata, backup and artifact manifests are under
`.local/release-s61/`, excluded from Git and deployment.

## First rollout and recovery

Source commit `71d88a1` and production migration 59 completed. The first Netlify
deploy `6ac515411ac0d651ef5449bf` returned 502: the CLI expired its two-minute
function-manifest cache, repackaged the handler and broke its run-config path.
Restored the previous web deployment `6ab98e309c70ac17fe871293`; live health is
200. Schema 59 and existing data are retained. No Auth/data restore occurred.
The original archive initializes successfully in Linux. The correction verifies
its digest/identity and refreshes the CLI cache receipt immediately before upload.
`test-netlify-function-cache.mjs` rejects digest/path/runtime/bundler drift; the
stronger native test now initializes the complete handler as well as Sharp.
Next step: upload a draft, verify it, then promote that exact deployment.

## Verified web publication

- Live URL: https://suqpage.com
- Deploy: `6ac519154e7f2c72e452f5be`
- Application source: `71d88a1`; packaging correction: `8361f13`.
- Schema 59 and production preflight pass; all existing data preserved.
- 28 read-only live checks pass: public routes, typo search, mobile market/featured/
  showroom APIs, multiple-place filtering, protected-route denial, transport
  session privacy and www redirect. Responsive browser checks pass at
  1440/390/320 with no overflow or JavaScript page errors.

The corrected unpublished draft initializes the handler but has no production
database settings, so it cannot pass application health. No production credentials
were copied into preview. A Linux check with existing production runtime settings
held only in process memory passes packaged health/login; its Netlify Blobs
context is explicitly a dummy localhost fixture (no real cache access). The first
local extraction lost ZIP symlinks; the harness now preserves safe relative links.
Original harness failures and the rollback are retained in private evidence.
Final live checks above verify the real hosted runtime.

The Expo testing APK remains blocked by the pending explicit two-advisory
exception or upstream remediation. No build/download link, native device pass,
Google Play upload or Git push is claimed. `deno.lock` is unrelated and untouched.
