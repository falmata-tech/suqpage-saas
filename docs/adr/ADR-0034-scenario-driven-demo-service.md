---
id: ADR-0034
title: Scenario timelines through ordinary marketplace write paths
status: accepted
related: [BE-067, FE-079, DEP-054]
owners: [backend, frontend, operations, security]
last_updated: 2026-11-13
---

# ADR-0034 — Scenario timelines through ordinary marketplace write paths

Run a dedicated bounded scheduled function on the existing Netlify application.
Use a versioned catalog of compatible realistic situations with predefined stages
and coordinated facts. Persist progress, duration and acknowledged versions; do
not choose arbitrary independent fields or reset timelines on process restart.

Explicit private enrollment plus current demo/owner/Auth-link/product checks
isolate test businesses. A stage invokes ordinary product and page application
commands in one transaction, with automation attribution and replay/overlap guards.
Real accounts/new signups and private customer workflows remain outside its scope.

Use once-per-minute execution and accelerated stages for visible early-user
activity. Limit active work and retained-data growth; pause on budget or human
edit rather than deleting immutable history or expanding paid capacity silently.
This fits short scheduled work and needs no VM or new production credential.

Current public catalog screens do not subscribe to changes. Add bounded foreground
revision/data refresh with independent public page revision, scope/race fencing,
retained discovery state and edited inquiry drafts. This tests the actual path
from a committed stage to public data and rendered UI. Do not claim WebSockets,
Supabase Realtime or physical-device delivery from polling/browser evidence.
