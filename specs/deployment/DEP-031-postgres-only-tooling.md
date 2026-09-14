---
id: DEP-031
title: Native PostgreSQL setup tests and operations
status: in_progress
related: [BE-035, DEP-030, DEP-027, ADR-0020]
owners: [operations, security]
last_updated: 2026-09-14
change_level: L3
---

# DEP-031 — Native PostgreSQL tooling

## Problem and scope

Remove the copy-through-file-database dependency from local setup, acceptance,
CI and operations. Use reviewed native PostgreSQL schema plus isolated fixtures.
Never reset or delete existing application data to accomplish code retirement.

## Scenarios

GIVEN a fresh isolated local database WHEN bootstrap runs THEN schema and explicit
demo fixtures install directly in PostgreSQL. GIVEN a populated target WHEN setup
runs THEN it refuses destructive reseeding. GIVEN backup WHEN invoked THEN it
produces a protected PostgreSQL archive without printing credentials or row data.
GIVEN restore WHEN target or explicit replacement approval is missing THEN fail
closed. GIVEN CI WHEN persistence tests run THEN an isolated PostgreSQL service is
required and every fixture is cleaned independently of developer/hosted data.

## Rollout, test plan and rollback

Native schema installation and reapplication; structural constraints, tenancy,
transactions and current workflow tests; backup archive validation and guarded
restore to an isolated target. Full release and browser evidence are required
before launch claims. Retain existing protected PostgreSQL backups. Code rollback
must stay PostgreSQL-only; historical source databases are not an executable
rollback path. Hosted mutations still follow DEP-029 and owner approval.
