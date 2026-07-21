---
id: ADR-0001
title: Pragmatic hexagonal and domain boundaries
status: accepted
date: 2026-07-20
deciders: [SuqPage]
related: [BE_BASE, FE_BASE]
---

# ADR-0001 — Pragmatic hexagonal and domain boundaries

## Context

SuqPage has real domain invariants and external adapters, but the controlled MVP
is a compact Next.js application. A mandatory enterprise class hierarchy would
add migration risk without improving behavior.

## Decision

Use dependency direction from adapters toward application/domain rules. Introduce
ports at genuine provider, persistence, clock/random, or test substitution
boundaries. Apply DDD vocabulary and explicit invariants to domain-heavy flows.
Use validated types/functions by default and classes only when lifecycle or
runtime polymorphism makes them valuable. Improve touched workflows
incrementally; do not rewrite the application solely for architectural purity.

## Consequences

- Domain logic becomes easier to test without Next.js or SQLite.
- Resend, media storage, persistence, and Malikt Board can be replaced behind
  explicit contracts.
- Some existing modules temporarily combine application and adapter concerns.
- Any broad restructuring requires its own approved spec and regression plan.

## Verification

Architecture review checks import direction and contracts. Domain/security tests
must execute without a browser; browser tests verify adapter composition.
