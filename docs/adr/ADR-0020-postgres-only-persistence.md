---
id: ADR-0020
title: PostgreSQL-only persistence
status: accepted
date: 2026-09-14
deciders: [product, engineering]
related: [BE-035, DEP-031, ADR-0015]
---

# ADR-0020: PostgreSQL-only persistence

Status: accepted. Date: 2026-09-14. Contracts: BE-035, DEP-031.

The owner explicitly retired SQLite everywhere, including local tooling and tests.
PostgreSQL is the only executable persistence engine. Remove retained adapters and
copy-based bootstrap; install reviewed native PostgreSQL schema and run isolated
PostgreSQL fixtures. Preserve existing application records and protected backups.
This supersedes ADR-0015's compatibility-fixture and file-database rollback exception.
Historical ADRs remain evidence, not permission to execute retired tooling.

Domain contracts and provider authorization remain unchanged. Operations use
PostgreSQL-native backup/restore. No deployment or hosted mutation is authorized
by this decision. Launch evidence must be regenerated after adapter removal.
