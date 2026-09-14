# Suqpage namespace rollout — 2026-09-14

Controlling contracts: BE-036, DEP-032, ADR-0021.

Source commit: `51109d8` (`Canonicalize Suqpage names while preserving existing platform state`).
The main change covers 318 files, including 22 renamed tracked paths. Static
CDN compatibility is completed by follow-up commit `ce2015b`. Canonical source,
configuration, browser state, assets and documentation use Suqpage. The master
brief is `SUQPAGE-MASTER-PROMPT.md`.

## Database evidence

Local and hosted PostgreSQL are on schema 45. The verified hosted project is
`sjeiiqxgscuqajpgddcc`. Migrations 44–45 changed the support-label default,
subscription default/creation trigger and 66 exact standard subscription labels.
Transactional comparison verified all 55 data tables with only that approved
standard-label normalization. Tenant records, account emails, Auth links, custom
plan names, amounts and billing dates remained intact. Reapplication was a no-op.

Before hosted application, the approved protected backup was restored into a
disposable PostgreSQL service. All 50 original table projections survived migrations
38→45 except the same expected standard labels. The hosted pre-change defaults and
trigger definition were also retained privately. No original backup member was
renamed, rewritten or deleted. Provider logins, Auth configuration and Storage
identities were not replaced.

## Verification

- Canonical/legacy environment precedence, cookies/logout coverage, tenant cart
  and navigation migration, blocked storage and exact asset targets pass.
- Migration regressions prove expected standard-label changes, custom plan/price
  preservation, trigger behavior and idempotency. Final typecheck passes.
- The core check chain passed through signup. Its final invitation query timed out
  during simultaneous builds, then passed unchanged on focused retry and in the
  clean release. No assertion or deadline was relaxed.
- Clean `npm run release` passes, including security, native PostgreSQL, scale,
  media, owner/inquiry workflows and production dependency audit: zero vulnerabilities.
- All eight isolated browser acceptance scenarios pass, including a real saved
  legacy inquiry and old bookmarked assets. Browser provider smoke covers the
  release delegation; local Mailpit handles test codes.
- PostgreSQL archive privacy, integrity, target approval, populated-target refusal
  and isolated restore pass. Container build/origins/non-root/trace/fail-closed checks pass.
- Offline Netlify build passes. All 929 runtime/asset files match the source candidate.
  The generated function archive contains no production credential or private
  runtime path. SHA-256: `d88509aba13d07528b3e1b62553d3051e8c4e99f37bb4852dfaa9a09d954fb09`.

## Publication

Published final deployment `6aa80f72843cbebe952f97df` at
`https://africmade.netlify.app`, site `26c795eb-5560-4a88-b38d-3cc922c2a5e6`.
The production CLI completed successfully. Final management readback independently
confirmed this exact published deployment in `ready` state; all live smoke assertions pass.

The first candidate exposed a Netlify-specific static-asset gap: Next rewrites
passed locally, but an old image URL returned 404 on the CDN. Commit `ce2015b`
adds 17 exact `public/_redirects` mappings, tested for equality with the Next map.
The correction reuses the identical verified server function and adds the static
routing file at the publish root. All 17 old live URLs now return 200 image content
that matches their canonical replacement byte-for-byte.

Live 1440px/390px checks of Nile Sensor Studio pass for cover/product media,
separate contact links, linked products, progressive inquiry contact, email-only
entry and anonymous dashboard denial. Four focused screenshots are retained in the
ignored operator evidence directory. No inquiry or email was sent. Browser readiness
uses visible product content; a network-idle wait and a closed transport socket
were infrastructure failures. HTTP statuses and workflow assertions were not relaxed.
Netlify's management API briefly rate-limited status reads after publication;
public-site verification proceeded independently and final management readback
succeeded after cooldown.
The previous deployment `6aa7fe5a106ca381ba08bba3` remains the application rollback;
the additive schema does not require a database downgrade.

## Retained compatibility and limits

`docs/SUQPAGE-NAMING-COMPATIBILITY.md` enumerates retained provider identifiers,
existing account addresses, immutable schema IDs/backup members, and old state/URL
readers. Their presence is deliberate continuity, not active former branding.
New hostname or Auth configuration changes still require DEP-029's exact reviewed
plan. Existing production environment names remain readable without copying or
rotating credentials. PostgreSQL remains the sole executable database engine.

Hosted email delivery and authenticated production owner/admin smoke remain
unverified from the previous rollout; no email or inquiry is sent by this naming
smoke. Local authenticated workflows pass. No Git push was performed. The unrelated
pre-existing `deno.lock` remains untracked and untouched.
