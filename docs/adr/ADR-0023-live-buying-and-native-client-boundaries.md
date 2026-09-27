---
id: ADR-0023
title: Live buying assistance and native client boundaries
status: accepted
date: 2026-09-27
deciders: [Suqpage]
related: [FE-019, BE-018, FE_BASE, BE_BASE, DEP_BASE, ADR-0009]
---

# ADR-0023 — Live buying assistance and native client boundaries

## Context

Buying intake previously returned a callback receipt. The owner now requires
messages and status. Existing guest authority is an HttpOnly opaque token;
staff use server-authorized sessions. Historical buying messages are private notes.
The repository is also preparing for an Expo React Native client.

## Decision

Use persisted PostgreSQL messages and the existing authorized HTTP adapters.
Visible buying conversations refresh every five seconds with one request in
flight, hidden-view suspension and bounded failure backoff. This is near-live
polling, not WebSocket delivery or proof of agent presence. Preserve all old
staff notes; require explicit visitor-facing text reply visibility. General
public support remains closed. No attachments for visitor-facing buying messages.

Supabase private Broadcast is a future transport alternative, not enabled here.
Its channel authorization uses JWT/RLS, whereas visitors currently hold an opaque
server cookie. A proper token bridge, expiry/revocation and RLS isolation tests
must precede subscriptions. Never expose support tables through public channels.
If concurrent chat traffic warrants push, use private change notifications and
refetch authorized persisted history so disconnects never lose messages.

Prepare npm workspaces with apps/web (Next.js), apps/mobile (Expo/React Native),
and small shared contracts/domain/localization packages. Keep web SEO and server
code in Next.js. Share pure behavior and DTOs, not DOM components or database code.
Retain npm; no task-runner dependency until measurable build needs justify one.
Do not move files while the current release has unreviewed changes. The mobile
API must explicitly authenticate native tokens and enforce the same capabilities;
it cannot call cookie-bound server actions as a substitute for an API.

## Alternatives and consequences

Managed Realtime adds secure guest-token/channel setup now; long-lived SSE adds
hosting lifecycle risk. Bounded HTTP refresh is deployable with the existing
runtime but costs requests and may delay delivery by seconds. Monitor read volume
and latency before adopting push. Native screens and platform adapters must be
built; a monorepo does not convert Leaflet, HTML dialogs, CSS or Next routes to RN.
No online indicator, background notification or cross-device guest recovery is
claimed in this increment.

## Verification

FE-019/BE-018 map real PostgreSQL and browser evidence. Native preparation and
migration gates live in docs/MOBILE-MONOREPO-PREP.md. No mobile build is claimed.

## Sources

- https://supabase.com/docs/guides/realtime/authorization
- https://docs.expo.dev/guides/monorepos/
- https://docs.expo.dev/versions/latest/sdk/securestore/
- https://docs.expo.dev/versions/latest/sdk/maps/
