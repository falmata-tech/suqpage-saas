---
id: ADR-0032
title: Git-connected Netlify delivery from protected main
status: accepted
date: 2026-11-12
related: [DEP-052, DEP-002, DEP-026, DEP-049]
---

# ADR-0032 — Git-connected Netlify delivery

## Context

The owner requests automatic deployment after merging in GitHub. The existing
Netlify project is manually published; earlier adapter/runtime workarounds are
artifact-specific and cannot qualify an automatic pipeline. Supabase data/Auth/
Storage and native release operations have separate safety boundaries.

## Decision

Use Netlify's native GitHub connection for this repository's protected main
branch, the existing root Next.js application and maintained Next.js adapter.
Qualify the real pipeline with publication held before enabling it. Keep required
PR checks, source/deploy evidence, production-only secrets and prior-deploy recovery.
Disable previews/branch deploys until their backend isolation is configured.

This replaces repeated manual application publication after the qualified path
is activated. It adds no second publisher, database migration job, management
token in the application, Android build, paid service or provider recreation.
Exact activation and verification belong in DEP-052 and the active checklist.

## Consequences

Merged application work can build/publish without a new manual upload. Builds
still cost provider resources and can fail independently of application tests.
A successful native adapter build, exact source and live outcome must be observed;
Git connection alone is insufficient. Schema/Auth changes and recovery retain
their existing explicit target/backup controls.
