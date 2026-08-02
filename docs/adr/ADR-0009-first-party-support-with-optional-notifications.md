---
id: ADR-0009
title: First-party support with optional notifications
status: accepted
date: 2026-07-30
deciders: [MirtPage]
related: [FE-019, BE-018, DEP-015, ADR-0001, ADR-0002]
---

# ADR-0009 - First-party support with optional notifications

## Context

MirtPage clients and staff are already authenticated in one tenant-aware
application. Commercial support SaaS pricing is not viable for the pilot, while
self-hosting a separate Chatwoot stack adds PostgreSQL, Redis, workers, storage,
email, upgrades, backups, and materially more memory than the application
itself.

## Decision drivers

- No required per-agent USD subscription.
- Existing MirtPage roles and tenant boundaries remain authoritative.
- A queue must work even when external messaging providers fail.
- The current single-instance SQLite pilot cannot honestly promise distributed
  websocket presence.

## Considered options

1. Chatwoot cloud: mature, but the free tier is capped and paid agents add a
   recurring USD cost.
2. Self-hosted Chatwoot: no license fee, but disproportionate infrastructure and
   operating burden for the pilot.
3. Telegram or WhatsApp as the support database: cheap to start, but weak tenant
   workflow, assignment, ownership, retention, and audit boundaries.
4. A bounded first-party inbox with optional messaging alerts.

## Decision

Build the authenticated customer-to-team support queue inside MirtPage. Use
bounded polling in the SQLite pilot. Telegram may notify staff that a queue item
exists, but receives no message body and is never authoritative. WhatsApp may be
offered as an explicit handoff link only; unofficial automation is prohibited.
A future PostgreSQL adapter may use Supabase Realtime Broadcast without changing
the support domain contract.

## Consequences

### Positive

- The useful support workflow remains free and works without provider accounts.
- Tenant scope, assignment, audit, and history share existing authentication.
- External providers can fail without losing conversations.

### Negative / debt

- MirtPage owns moderation, retention, spam controls, backups, and inbox UX.
- Polling is appropriate only for the single-instance pilot and should be
  replaced when concurrent usage justifies managed realtime.

## Verification

BE-018 security tests enforce tenant scope, staff capacity, assignment, bounded
history, and notification failure isolation. DEP-015 retains the single-instance
runtime restriction.
