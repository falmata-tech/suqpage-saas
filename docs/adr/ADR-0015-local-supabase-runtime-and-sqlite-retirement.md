---
id: ADR-0015
title: Local Supabase runtime and SQLite retirement
status: accepted
date: 2026-08-16
deciders: [MirtPage]
related: [BE-024, BE-027, BE-030, DEP-023, DEP-026, DEP-027, ADR-0013, ADR-0014]
---

# ADR-0015 - Local Supabase runtime and SQLite retirement

## Context

Running the application on SQLite in development while production uses
PostgreSQL permits dialect, transaction, pooling, and migration drift. Pointing
local development at the hosted production project would remove that drift by
creating a more serious data-isolation risk.

## Decision

Use the local Supabase CLI stack as the normal development runtime. It provides
PostgreSQL 17 plus local Auth, private Storage, and captured development email
without reaching the hosted project. Browser acceptance uses a second,
disposable Supabase CLI project with its own project ID, Docker resources,
volumes, and loopback port family. Its production-mode browser server selects
PostgreSQL, Supabase Auth, and private Storage rather than compatibility
adapters. Hosted Supabase remains the remote provider target.

Application startup requires an explicit database driver. Documented local
configuration selects PostgreSQL and loopback-only provider URLs. SQLite is no
longer an application-development authority; it remains temporarily available
only to isolated compatibility tests, read-only migration evidence, and the
bounded rollback window. No application process dual-writes either database.

Local reset and copy commands must prove that their PostgreSQL destination is a
loopback Supabase port before dropping or replacing application data. Hosted
project references, pooler hosts, service credentials, and production URLs are
rejected by those commands.

## Consequences

- Local behavior exercises the same SQL dialect and provider capabilities as
  production.
- Browser evidence exercises the same runtime adapters without mutating the
  developer stack or another repository's Supabase stack.
- Developers must start Docker and the local Supabase stack before running the
  application.
- The complete local stack uses more memory than SQLite, so optional services
  should stay disabled unless MirtPage exercises them.
- SQLite adapter deletion waits until remaining compatibility tests and the
  production rollback window are explicitly retired.

## Rollback

Stop the local Supabase stack and select SQLite only for an isolated recovery or
compatibility command. This is not an authorized production rollback; hosted
rollback remains governed by DEP-023 and DEP-026.
