---
id: ADR-0002
title: Single-instance SQLite controlled pilot
status: accepted
date: 2026-07-20
deciders: [SuqPage]
related: [BE_BASE, DEP_BASE]
---

# ADR-0002 — Single-instance SQLite controlled pilot

## Context

The initial four-client pilot needs low operational complexity, persistent
catalog/inquiry data, media, backup, and restore, but not horizontal scale.

## Decision

Run one Node.js instance with SQLite WAL and persistent local media/backups.
Production preflight enforces HTTPS, absolute persistence paths, privacy salt,
and database integrity. Broad onboarding or multiple instances requires a new
spec/ADR for managed PostgreSQL and object storage.

## Consequences

- Deployment remains simple and inexpensive for the pilot.
- A second application writer, ephemeral disk, or horizontal autoscaling is an
  unsupported and unsafe topology.
- Backup freshness, disk capacity, and restore drills are operational gates.

## Verification

`npm run test:operations`, `npm run release`, production preflight, Docker volume
configuration, and launch checklist.
