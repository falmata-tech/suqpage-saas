---
id: DEP-025
title: PWA cache and standalone-shell rollout
status: in_progress
related: [FE-034, FE-036, FE-037, DEP-002, DEP-020, DEP-023, DEP_BASE]
owners: [operations, security, frontend]
last_updated: 2026-08-11
change_level: L3
---

# DEP-025 - PWA cache and standalone-shell rollout

## Problem

Deploy MirtPage as an installable PWA without allowing cached private responses,
stale API authority, or an unrecoverable worker to interfere with rollout.

## Contracts

- `/sw.js` is served from the application origin with root scope and no-cache
  response headers. The manifest may use a short public cache lifetime.
- Every worker release uses an explicit MirtPage cache version. Activation
  deletes only older caches with the MirtPage cache prefix.
- Production verification proves manifest validity, icon availability, worker
  control after reload, public network-first fallback, and exclusion of
  `/api`, `/dashboard`, `/preview`, `/login`, and non-GET requests.
- The initial deployment is monitored for worker errors, stale public HTML, and
  failed navigation before installability is announced.
- Rollback deploys a replacement worker at the same path that removes MirtPage
  caches, unregisters itself after activation, and leaves application requests
  network-authoritative. Removing only the registration component is not a
  sufficient rollback because installed workers persist.
- The reviewed rollback worker is retained at
  `scripts/pwa-cleanup-worker.js`. Its release also sets
  `NEXT_PUBLIC_MIRTPAGE_PWA_ENABLED=false` so newly loaded application code does
  not register the worker again.

## Scenarios

```gherkin
Scenario: New worker replaces an earlier MirtPage cache
  GIVEN a controlled browser has an older MirtPage worker cache
  WHEN the new worker activates
  THEN only prior MirtPage-managed caches are removed
  AND unrelated origin caches remain untouched

Scenario: Protected request is made while offline
  GIVEN a worker controls the client
  WHEN a protected, API, preview, or mutation request cannot reach the network
  THEN no cached protected response is returned
  AND the request fails or a public offline navigation surface is shown

Scenario: Operator rolls back PWA behavior
  GIVEN an installed worker is active
  WHEN the cleanup worker release is deployed at `/sw.js`
  THEN MirtPage caches are deleted
  AND the cleanup worker unregisters after open clients receive network-authoritative code
```

## Test plan

- Focused source and browser policy checks precede visual approval.
- After approval, `npm run check`, production build/HTTP checks, and the
  applicable release gate must pass.
- Production rollout requires HTTPS-origin inspection in the browser
  Application panel and one offline public-navigation probe.

## Rollout

Ship the manifest, icons, metadata, registration component, cache-versioned
worker, and worker response headers in one release. Verify production HTTPS
control after one reload before presenting installation as available.

## Rollback

Keep a documented cleanup-worker artifact for at least one release after PWA
activation. Restore normal application code only after the cleanup worker has
removed controlled caches and unregistered itself.

## Readiness checklist

- [x] Cache ownership and exclusions explicit
- [x] Update and rollback behavior explicit
- [x] Production evidence defined
- [x] No data migration required
