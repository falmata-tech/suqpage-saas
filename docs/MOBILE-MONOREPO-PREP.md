# Expo mobile and monorepo preparation

Status: local Expo implementation, September 27, 2026. FE-053 / BE-044 / DEP-042
are in progress under ADR-0023. Browser/API tests and native JavaScript exports
pass; device/review/release gates remain open. No app-store release or production
API rollout has occurred. See [testing instructions](MOBILE-TESTING.md).

Choose Expo **with React Native**, not Expo instead of React Native. Keep Next.js
for the public website, SEO and server APIs. Start with npm workspaces to preserve
the existing lockfile/tooling. Expo supports this layout and automatic Metro
monorepo configuration. Pin a compatible Expo/React/React Native set when creating
the native app; do not copy the web React version into it blindly.

## Current layout and dependency direction

```
app/, components/, lib/   existing Next.js web/server app, unchanged root
apps/mobile/              Expo Router native screens and device adapters
packages/contracts/       typed DTOs, public links and API-origin validation
```

Apps depend on shared packages. Shared packages never import an app, Next.js,
PostgreSQL, filesystem, cookies, browser DOM or privileged provider credentials.
Keep web CSS/DOM components and native UI separate initially. Do not create empty
abstractions or a shared UI package merely to make the diagram symmetrical.

## Boundary plan and current implementation

| Surface | Current preview | Remaining release work |
| --- | --- | --- |
| Discovery | Public bounded API uses canonical search ranking, multiple categories, area, type and backend pagination. Native map and browser Leaflet share exact/approximate location rules. | Actual-device interaction coverage of the native MapLibre map. |
| Showrooms/media | Native catalog, images, thumbnails, external YouTube and web-showroom link. | Custom web layouts remain web-only; review native media on both device platforms. |
| Inquiries | Single/group lists, external contact/copy and canonical persisted Suqpage submission. | Physical-device handoff/cancellation coverage. |
| Email sign-in | Local Supabase OTP, provider-verified bearer API, current database role/tenant, SecureStore and sign-out. | Physical-device persistence/expiry checks and release Auth configuration review. |
| Owner editing | Setup, page/cover, business/location/handle, offerings/photos, video support requests, inquiries and account phone. | Native parity review, including logo editing; no staff UI. |
| Buying assistance | Separate opaque guest token and persisted foreground polling/messages/end/history. | Push/background delivery is not implemented or implied. |
| Owner support | Scoped text threads, messages, close/reopen. | Attachment upload/viewing is pending native parity work. |
| Localization | Existing five-language catalogs reused by native text provider; merchant content preserved. | Actual-device script/font review and native-speaker review. |
| Packaging | npm workspaces and explicit native React resolution preserve the web's patched React. | Expo doctor duplicate-version warning and moderate transitive dependency audit require release review. |

The web app uses Next 16, React 19, Leaflet, pg and Supabase JS. Expo SDK 57,
React Native 0.86 and Expo Router live in apps/mobile. No pg/server/credential
module belongs in native bundles. Pure helpers/catalogs are reused directly until
extracting them creates a real shared package; do not create empty packages.
Next.js remains at the root. Moving it to apps/web is deliberately separate.

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

No Turborepo/Nx or hosted Realtime change was added. Map-provider licensing/API
keys and push delivery remain explicit release decisions, not automatic production
changes. The ordered gates distinguish implemented preview work from a release.

## Technology references

- [Expo monorepos](https://docs.expo.dev/guides/monorepos/)
- [Expo Maps](https://docs.expo.dev/versions/latest/sdk/maps/)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Supabase private Realtime authorization](https://supabase.com/docs/guides/realtime/authorization)
