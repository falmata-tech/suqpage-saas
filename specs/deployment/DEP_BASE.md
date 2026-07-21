---
id: DEP_BASE
title: Deployment and operations base architecture
status: done
related: [FE_BASE, BE_BASE, DEP-002, ADR-0002]
owners: [operations, security]
last_updated: 2026-07-21
---

# Deployment and operations base architecture

## Supported topology

The controlled pilot runs one Node.js application instance with one persistent
SQLite database and persistent media/backup directories. Horizontal scaling is
prohibited until a managed multi-instance database and object storage are
specified and migrated.

## Environments

- Local: `.env`, local persistent data, generated temporary credentials.
- Test: isolated temporary databases/media and deterministic cleanup.
- Production: HTTPS canonical URL, absolute persistent paths, private salt,
  reverse proxy, single instance, monitored health endpoint.

Reverse proxies must preserve a trustworthy host/origin relationship. Any Server
Action origin exception is an exact configured host; development automatically
adds only localhost and the current Codespace forwarding hosts. Broad production
wildcards are prohibited.

No secret, credential file, database, upload, backup, or customer-data log is
committed, built into an image, or attached to public CI evidence.

## Delivery pipeline

1. Clean locked dependency install.
2. Spec validation and traceability check.
3. Type, design-contract, security, HTTP, operations, and browser gates according
   to change level.
4. Production build and dependency audit.
5. Verify the release commit contains only its declared task files and no
   credentials, runtime data, generated output, or unrelated worktree changes.
6. Migration against a backup or new reset for an empty installation.
7. Production preflight.
8. Deploy one instance, health check, smoke test, then monitor.

## Rollout and rollback

- Schema migrations are additive/idempotent during the pilot unless an approved
  L4 spec and ADR define otherwise.
- Back up database and media before migration or release.
- Stop application writes before restore.
- Rollback restores the previous application version plus a verified compatible
  backup; never assume code rollback reverses data migration.

## Observability

Minimum signals: `/api/health`, process/container restarts, failed preflight,
failed login/rate-limit/audit events, inquiry notification failures, delivery
adapter failures, disk capacity, database integrity, and backup freshness.
Customer contact details must not enter general logs or monitoring labels.

## Production gates

Production startup refuses non-HTTPS configuration, missing persistent paths, or
weak privacy salt. Temporary-password accounts, mock integration status, backup
freshness, and FormSubmit/notification activation are explicit operator checks.
