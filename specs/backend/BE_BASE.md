---
id: BE_BASE
title: Backend and domain base architecture
status: done
related: [FE_BASE, DEP_BASE, ADR-0001, ADR-0002]
owners: [backend, security]
last_updated: 2026-07-20
---

# Backend and domain base architecture

## Purpose

Define domain boundaries, application contracts, adapters, persistence rules,
and security invariants for the controlled SuqPage pilot.

## Domain model

Primary entities are Business/Tenant, User, Session, Collection, Category,
Product, Inquiry, and Delivery Request. Value concepts include Handle,
Availability, Stock Quantity, Contact Method, Inquiry Status, Idempotency Key,
and Delivery Status.

Invariants belong in domain/application functions and receive database constraints
or triggers as defense in depth. A value concept may be a validated type/function;
classes are not required.

## Hexagonal dependency direction

```text
Next routes/actions ─┐
SQLite adapter ──────┼─> application use cases -> domain rules
Media filesystem ───┤
Resend/Malikt ───────┘
```

Domain/application rules must not import Next.js, cookies, HTTP response types,
filesystem paths, SQLite primitives, or vendor SDKs. Existing code moves toward
this boundary incrementally when a touched workflow benefits; no wholesale
rewrite is authorized by this base spec.

## Port contracts

Create narrow TypeScript contracts for genuine substitution boundaries:

- catalog/business persistence;
- session persistence and password verification;
- inquiry notification;
- media storage/processing;
- delivery provider submission/status synchronization;
- clock/random/idempotency sources when deterministic testing requires them.

## Security invariants

- Public business resolution returns active tenants only.
- Every owner read/write is scoped to their tenant.
- Referenced collections, categories, products, inquiries, and deliveries belong
  to the same tenant.
- Public inquiry data is reloaded and validated canonically from persistence.
- Sessions are opaque, revocable, expiring server records.
- Login/inquiry abuse is rate-limited without storing raw IP addresses.
- Mutable images are verified, decoded, re-encoded, and stored outside builds.
- Delivery customer data and request APIs are authenticated and tenant-scoped.

## Transaction and error policy

Multi-record invariant changes use immediate transactions. Expected domain
rejections return safe typed errors; unexpected failures are not exposed to
public callers. Redirect control-flow must remain outside broad exception
handlers.

## Test baseline

- Domain/unit tests for validation boundaries.
- SQLite integration tests for transactions, constraints, migrations, isolation,
  idempotency, and integrity.
- HTTP tests for status, payload, auth, size, rate, and security headers.
- Browser tests prove end-to-end persistence for role workflows.
