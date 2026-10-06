---
id: ADR-0023
title: Live buying assistance and native client boundaries
status: accepted
date: 2026-09-27
deciders: [Suqpage]
related: [FE-053, BE-044, DEP-042, FE-019, BE-018, FE_BASE, BE_BASE, DEP_BASE, ADR-0009]
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

Use npm workspaces with apps/mobile (Expo/React Native) and shared contracts.
The first implementation keeps Next.js at the repository root; moving it to
apps/web is a separate migration. Extract additional pure packages only when used. Keep web SEO and server
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
migration gates live in docs/MOBILE-MONOREPO-PREP.md. FE-053/BE-044/DEP-042 now
record a local Expo preview, isolated PostgreSQL API tests, real local OTP browser
checks and Android/iOS JavaScript exports. See docs/MOBILE-TESTING.md for native
device evidence and limits. No signed binary, store release or API rollout is claimed.

## Sources

- https://supabase.com/docs/guides/realtime/authorization
- https://docs.expo.dev/guides/monorepos/
- https://docs.expo.dev/versions/latest/sdk/securestore/
- https://docs.expo.dev/versions/latest/sdk/maps/

## Native video adapter (S49.2)

Use the Expo-compatible react-native-webview for the official YouTube iframe
player; app navigation, forms and catalogs remain native. Browser preview uses an
iframe with the same controlled HTML. Existing URL normalization and staff approval
remain authoritative. No extraction, autoplay feed or application secret/cookie
bridge. Supply app identity/referrer, bound load failures, unmount inactive players
and block outbound native navigation. The owner excludes external handoff, including
error fallback. Native playback/fullscreen remains a separate device release gate.

Sources: https://docs.expo.dev/versions/latest/sdk/webview/ and
https://developers.google.com/youtube/terms/required-minimum-functionality#embedded-player-api-client-identity

## Open-source mobile map correction (S50)

Use native MapLibre React Native 11.4.0 with OSM raster tiles on Android/iOS,
retaining Leaflet for browser preview. This supersedes the unshipped map-only
WebView candidate and the initial Google SDK adapter. Map is a core interaction;
native rendering supports gestures and layered React Native UI without a web bridge.
Keep the existing MapProps/MapControls port and share display-coordinate rules.

Owner explicitly clarified that the SQLite ban concerns application persistence,
not an SDK's internal tile cache. Permit that cache; no accounts, messages or
catalog records are stored in it. No Google key/account is needed. Expo Go no
longer supports this adapter, so rebuild native clients. Respect OSM attribution,
client identification and caching; no bulk/offline downloads. Public tile hosting
is best-effort, not an unlimited production SLA. Native compilation/device checks
remain release requirements. See docs/MOBILE-MAP-RESEARCH.md, FE-053 and DEP-042.

## S65 external navigation — 2026-10-06

Use the already-installed expo-web-browser module for external websites, through
an explicit pure link-policy/launch-port contract and a native adapter. Prefer
system browser UI (address and Close/Back controls, native website compatibility)
to a general WebView or injected bridge. This does not replace native app screens
or the isolated YouTube player. The browser receives only the validated URL, no
app credentials. Recognized WhatsApp/Telegram HTTPS contacts map to bounded app
schemes; a failed app launch falls back once to the original HTTPS URL. Caller
screens retain inquiry data and handle failure. No outside delivery/payment or
automatic-return guarantee is made. Web preview uses a noopener/noreferrer window.

Primary references checked against installed Expo 57.0.3 APIs:
- https://docs.expo.dev/versions/latest/sdk/webbrowser/
- https://core.telegram.org/api/links
- https://faq.whatsapp.com/5913398998672934

## S66 verified incoming links — 2026-10-06

Use Android App Links with an exact canonical HTTPS host and bounded public path
filters. The public Digital Asset Links file trusts only the verified existing
Expo preview certificate/package; production Play and Apple signing identities
must be verified separately. Expo Router's +native-intent maps web store/product
URLs to native routes. A pure mapper validates scheme/host/handle and canonical
Market scopes. URL input never supplies session, role or tenant authority.
Publishing association and rebuilding/installing the app are separate rollout
steps; legacy APKs and embedded browsers may continue to use the website.

References: https://docs.expo.dev/linking/android-app-links/ and
https://docs.expo.dev/router/advanced/native-intent/.
