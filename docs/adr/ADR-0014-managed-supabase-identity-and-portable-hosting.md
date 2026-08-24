---
id: ADR-0014
title: Managed Supabase identity and portable application hosting
status: accepted
date: 2026-08-16
deciders: [MirtPage]
related: [BE-002, BE-018, BE-023, BE-024, BE-026, BE-027, BE-030, DEP-015, DEP-023, DEP-026, DEP-027, ADR-0013, ADR-0015, ADR-0016]
---

# ADR-0014 - Managed Supabase identity and portable application hosting

## Context

MirtPage production already uses Supabase PostgreSQL and private Storage while
credentials and sessions remain application-owned. The public map and support
queue also need a scale path, and the application must be deployable on a free
commercial host without making authorization depend on that host.

## Decision

Adopt Supabase Auth behind a selectable identity adapter. Supabase owns password,
OAuth, refresh-token, and session validity. MirtPage continues to own user roles,
business bindings, staff assignments, capabilities, suspension, and every tenant
authorization decision in application tables. A one-to-one identity-link table
maps an immutable Supabase user UUID to the existing MirtPage user ID. Roles are
never trusted from editable user metadata.

Existing bcrypt credentials are imported through an operator-only, idempotent
migration. Application-owned sessions remain available only as a rollback mode
during the bounded migration window. No request accepts both authorities at the
same time.

Keep deployment provider-neutral. Netlify is admitted as a second Next.js host
and may receive production traffic only after an exact-commit build, PostgreSQL,
private-media, auth, upload, support, PWA, and custom-domain smoke pass. The
working Vercel deployment remains the rollback target until monitored DNS
cutover completes.

Netlify Deploy Previews and Production use separate remote Supabase projects.
They share reviewed MirtPage migrations and authorization behavior, but never
database URLs, Auth users/sessions, Storage objects, service-role credentials,
or lifecycle operations. A preview cannot be promoted by silently pointing it
at Production; production promotion uses the exact approved commit and the
production-scoped environment.

Enable Supabase capabilities only where they solve a measured problem:

- private Storage remains behind the existing server-side media port;
- Realtime may refresh only an open support conversation and staff inbox, with
  bounded polling as fallback;
- PostGIS may back viewport and nearby-showroom queries once the canonical
  discovery response is too large, but is not a map-tile or road-label service;
- `pg_trgm` may back measured high-volume free-text discovery later.

ADR-0016 supersedes only this decision's first-party static-basemap assumption;
the Supabase catalog, future PostGIS threshold, and provider-neutral hosting
boundaries remain unchanged.

## Consequences

- Google sign-in can be added without moving tenant authorization into OAuth
  claims.
- Identity migration, host migration, spatial-query migration, and realtime
  adoption remain independently reversible.
- Cross-provider account creation needs compensating cleanup because Auth and
  PostgreSQL cannot share one transaction.
- The free Netlify and Supabase quotas are launch budgets, not unlimited
  production capacity. Operations must monitor credits, connections, egress,
  database size, and storage.

## Rollback

Before DNS cutover, restore the prior host and select the application-owned auth
driver. Additive identity links and provider users remain frozen for
reconciliation; there is no automatic dual-write merge. After the migration
window closes, retiring local credential authority requires a separate approved
cleanup.
