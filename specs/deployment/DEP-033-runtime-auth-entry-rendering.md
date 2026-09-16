---
id: DEP-033
title: Request-time account entry after credential-free builds
status: in_progress
related: [BE-031, BE-036, FE-038, DEP-032]
owners: [backend, security, operations]
last_updated: 2026-09-16
change_level: L3
---

# DEP-033 — Request-time account entry

## Problem and scope

A clean build without runtime Auth configuration prerendered `/request` as a
redirect to `/login`. An authenticated unlinked identity then looped between the
runtime login page and cached onboarding redirect. The proxy also read only the
new Auth-driver key although Production retained the supported old namespace.
The account's email spelling does not determine this routing defect.

## Scenarios

- GIVEN a build without provider settings WHEN inspecting generated routes THEN
  `/login` and `/request` are not prerendered; identity decisions wait for a request.
- GIVEN empty build-time provider values and valid runtime values WHEN resolving
  server Auth configuration THEN runtime values are used; public-named server
  settings must not be frozen into the build.
- GIVEN an anonymous visitor WHEN opening `/request` THEN login renders normally.
- GIVEN a verified unlinked identity WHEN opening login or reloading onboarding
  THEN the setup form renders without a redirect loop or application privileges.
- GIVEN a linked identity WHEN opening login/onboarding THEN its authorized
  dashboard loads, and logout returns to normal unauthenticated entry.
- GIVEN a retained legacy Auth-driver key WHEN a request carries Supabase cookies
  THEN the proxy refreshes through the same adapter as canonical configuration;
  an explicit canonical disabled/local value wins.

## Readiness and plan

Defect/L3; no layout redesign, identity migration, email rewrite, provider/Auth
configuration write or schema change. Existing deployment authorization applies.
Master sections 11, 15, 22 are affected. Record ordered R1–R4 in the active checklist.

## Test plan and rollback

Use a real production build with Auth settings absent at build and present only
at runtime. Assert route-manifest exclusions and browser anonymous/unlinked/linked
transitions with local Supabase/Mailpit. Test proxy legacy/current precedence,
focused security/Auth, typecheck, release and full acceptance. Reuse broader
unchanged-provider/data gate evidence from DEP-032; no migration/container change.
Package without private files or secrets, verify dynamic artifact routes, publish
and inspect live anonymous redirects. The preceding application deployment is the
rollback; no database downgrade or provider configuration changes are needed.

## Rollout

R1–R4 in the active checklist control packaging and the approved monitored rollout.

## Verified implementation (2026-09-16)

`connection()` precedes identity/configuration decisions on both entry pages.
The root proxy and server Auth configuration use the runtime environment adapter.
`scripts/test-auth-entry-proxy.ts` covers canonical/legacy precedence and safe
invalid-cookie handling. `scripts/acceptance-runner.mjs` asserts dynamic routes
after a build with blank Auth settings; all eight browser scenarios pass with
local Supabase, including unlinked reload and linked-account entry redirects in
`tests/acceptance/app.spec.ts`. Full `npm run check` and `npm run release` pass. Production package
privacy and exact source alignment pass. Final release/publication evidence is
recorded in `docs/SUQPAGE-AUTH-ENTRY-FIX-2026-09-16.md`.
