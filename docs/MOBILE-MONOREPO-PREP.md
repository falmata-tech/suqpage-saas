# Expo mobile and monorepo preparation

Status: architecture preparation, September 27, 2026. No native app, workspace
move, native build or app-store release has been performed. ADR-0023 applies.

Choose Expo **with React Native**, not Expo instead of React Native. Keep Next.js
for the public website, SEO and server APIs. Start with npm workspaces to preserve
the existing lockfile/tooling. Expo supports this layout and automatic Metro
monorepo configuration. Pin a compatible Expo/React/React Native set when creating
the native app; do not copy the web React version into it blindly.

## Target layout and dependency direction

```
apps/web/                 existing Next.js app and server adapters
apps/mobile/              Expo Router, native screens and device adapters
packages/contracts/       request/response types, errors and pagination
packages/domain/          pure validation, inquiry and discovery rules
packages/localization/    message catalogs and formatting contracts
```

Apps depend on shared packages. Shared packages never import an app, Next.js,
PostgreSQL, filesystem, cookies, browser DOM or privileged provider credentials.
Keep web CSS/DOM components and native UI separate initially. Do not create empty
abstractions or a shared UI package merely to make the diagram symmetrical.

## Audit of current boundaries

| Surface | Reuse | Required native/server work |
| --- | --- | --- |
| Discovery | `lib/discovery-contract.ts`, category keys/filter semantics | Discovery is loaded in server components; add bounded, public paginated HTTP query API using the same visibility and ranking projection. |
| Map | Location values, selected shop, approximate/exact meaning | Leaflet depends on DOM. Evaluate Expo Maps or react-native-maps in a development build with clustering, attribution and map-provider costs. Preserve approximate markers and preview behavior. |
| Showrooms/media | Typed product/catalog DTOs and media validation | Native galleries/image rendering; YouTube through supported embeds or external links. Custom web showroom renderers do not translate automatically. |
| Inquiries | Pure validation and grouped inquiry rules | Reuse `/api/inquiries` contract after auditing cookie/origin dependencies. Native external-link/clipboard adapters and failure fallback. |
| Email sign-in | Supabase identity and owner mapping | Current `/api/auth/email/start`, `/verify` establish browser state. Native OTP verification and server-validated bearer tokens need an explicit adapter; secure device token storage, refresh, sign-out and deleted-user handling. |
| Owner editing | Domain validation and tenant authorization | Many operations are Next server actions, not mobile APIs. Add versioned HTTP adapters for profile, products, handles, publication, media and settings; retain identical permission checks. |
| Buying assistance | `lib/buying-conversation-contract.ts`, statuses and refresh policy | HttpOnly guest cookies need a native scoped-session adapter and secure storage. No cross-device identity implied by phone entry. |
| Staff inbox | Assignment/capacity domain rules | Keep operations on web in the initial mobile milestone; native staff scope requires explicit product approval. |
| Localization | Five message catalogs | Native text provider, font coverage, formatters and accessibility labels; preserve merchant content verbatim. |
| Uploads | Existing validation/storage server ports | Expo ImagePicker/FileSystem adapters, permissions, size limits, upload retries and actual device tests. |
| Notifications | Persisted message history is authoritative | Separate opt-in push-token registry, revocation, minimal payload and delivery handling. Background live delivery is not provided by foreground polling. |

The installed web app currently uses Next 16, React 19, Leaflet, pg and Supabase JS.
No mobile project is installed. Server credentials and pg must never enter native
bundles. Shared catalogs must not contain customer data or private contacts.

## Ordered migration gates

1. Finish/review the current web changes and establish a passing release baseline.
   Preserve deployment rollback and the existing local PostgreSQL workflow.
2. Add the contracts package with one real shared consumer and import-boundary
   tests. Extract only pure modules; retain compatibility exports for the web app.
3. Add a minimal Expo app in `apps/mobile` and run actual iOS/Android development
   builds. Prove locale fonts, maps, OTP session persistence, gallery and links.
4. Expose discovery/catalog APIs first, then native authenticated owner APIs.
   Test forged/expired tokens, cross-tenant access, suspended businesses, retry
   semantics, pagination and rate limits. Do not treat CORS as authorization.
5. Move the web app to `apps/web` in a separate coherent change. Audit `@/` paths,
   TypeScript includes, generated localization, PostgreSQL migration paths,
   `.env` loading, asset paths, scripts, Playwright server cwd, Dockerfiles,
   GitHub workflows and Netlify build/base configuration. Keep root commands
   delegating to web so `npm run dev -- --port 3102` remains usable.
6. Clean install/build/test web and native independently and together; verify no
   duplicate React/native runtime, missing fonts or privileged imports. Compare
   web route/SEO behavior and baseline mobile screenshots before deployment.
7. Release the unchanged web behavior first with rollback available. Native
   beta/store publication is a separate signed-build and device-review milestone.

No Turborepo/Nx, new map provider, Realtime configuration or native dependency is
needed just to prepare this plan. Map-provider licensing/API keys and push delivery
are decisions to validate in the native spike, not pre-approved production changes.

## Technology references

- [Expo monorepos](https://docs.expo.dev/guides/monorepos/)
- [Expo Maps](https://docs.expo.dev/versions/latest/sdk/maps/)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Supabase private Realtime authorization](https://supabase.com/docs/guides/realtime/authorization)
