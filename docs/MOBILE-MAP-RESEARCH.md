# Native map decision — 2026-09-28

FE-053 / BE-044 / DEP-042 / ADR-0023. Choose MapLibre React Native 11.4.0
for the native client and preserve browser Leaflet. Installation and verification
are in progress; this document is not evidence of native device readiness.

The published package requires Expo >=54, React Native >=0.80 and React >=19.1.
Suqpage uses Expo 57 / RN 0.86.3 / React 19.2.3, within those ranges. Version 11
requires the New Architecture. Upstream wraps Android MapLibre Native 13.6.1 and
iOS 6.31.0. Range compatibility is preliminary evidence; native compilation and
actual device interaction remain necessary. Package Android minSdk is 24 (stricter
than the guide's 23); use the package/build requirement.

The Expo config plugin supports native builds, but Expo Go cannot load this SDK.
Test with a rebuilt development client or the standalone APK. Keep browser preview
available; its map is Leaflet, not proof that native MapLibre works.

Use an inline raster style with HTTPS OSM tiles, standard tile-cache semantics,
visible linked attribution and an app-specific User-Agent scoped to the tile host.
Only public IDs/display coordinates enter the GeoJSON source. Use texture rendering
on Android so React Native drawer/preview overlays can compose over the map.
No device location permission, Google Play location engine or Maps key is needed
for browsing public shop locations. No offline pack or bulk-download feature.

OSM public tile hosting is best-effort and can limit heavy use. It is viable for
ordinary interactive testing under its policy, not a guaranteed unlimited launch
service. Monitor availability/usage and select OSM-derived commercial or self-hosted
tiles if traffic warrants it; rendering is independent of the tile provider.
Automated map tests must use fixture tiles, not scrape public OSM by panning/zooming.

MapLibre Native initializes a SQLite database for its ambient tile cache. Setting
cache size to zero does not remove that dependency. The owner explicitly permits
this SDK cache; Suqpage accounts, products, inquiries and other application data
remain exclusively in PostgreSQL. No mobile application database is introduced.

Primary sources inspected:
- https://maplibre.org/maplibre-react-native/docs/setup/getting-started/
- https://maplibre.org/maplibre-react-native/docs/setup/expo/
- https://maplibre.org/maplibre-react-native/docs/components/map/
- https://maplibre.org/maplibre-react-native/docs/modules/transform-request-manager/
- https://operations.osmfoundation.org/policies/tiles/
- https://raw.githubusercontent.com/maplibre/maplibre-native/main/platform/default/src/mln/storage/offline_database.cpp
- Published npm tarball `@maplibre/maplibre-react-native@11.4.0`: package.json,
  Android gradle properties, Map/Camera/GeoJSONSource and TransformRequestManager
  source. Read-only extracted research lives under ignored .local/maplibre-research.

## Focused evidence

Mobile typecheck, public-projection map tests, mobile contract/build configuration
checks, spec validation, Android prebuild and Android JavaScript export pass.
Nine responsive/browser alignment groups pass with fixture tiles, including visible
attribution with the drawer open. Thirteen broader local browser workflows pass,
including real email-code verification and owner navigation. Native MapLibre code generation, Kotlin compilation and Java compilation pass
with this Expo/RN version set, without SDK patches. The first complete Android debug build passes for arm64-v8a and x86_64
(531 tasks; cold toolchain setup included). The final permission-removal rebuild also passes (2026-09-29). APK installation
and native first-render/drawer checks pass in the API 35 Intel emulator. OSM tiles,
public pins, controls and attribution render; the search drawer correctly layers
over the texture map. No physical-phone performance, pan/zoom stress, offline
recovery or YouTube playback pass is claimed.

Evidence: `.local/mobile-maplibre-review/android-map-visible.png` and
`android-drawer.png`; nine browser alignment groups with fixture tiles and 13
browser workflow groups pass. Native smoke only opened the map and drawer; no
automated public-tile pan/zoom crawl. App error channels contained no crash during
inspection. Packaged manifest has no fine/coarse location, microphone or broad
READ_MEDIA_IMAGES permission and no Google Maps key.

Local development APK (requires Metro; not the standalone tester release):
`apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk` (arm64-v8a/x86_64).
SHA-256: `a732d8c68d986322e20d2a532add5ab30cabeb431fc27743b43e87db5b2888d8`.
Signed with the local development key; EAS preview signing is a separate identity.
No production API rollout, EAS preview APK or public distribution occurred.
