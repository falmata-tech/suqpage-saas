# Phone web → native preview alignment

FE-053, S49.1/S49.2. Local review, September 28, 2026. Not visually approved or deployed.

## What changed and why

The first preview changed too much of the approved information architecture: a
small map above a scrolling list, wrapped Featured days and full-width cards,
stacked showroom rows, and an Account tab in place of More. That made the same
businesses and tasks feel like a different product.

The replacement follows the phone web structure:

| Area | Native preview |
| --- | --- |
| Navigation | Compact Suqpage/locale header; Market, Featured, About, More |
| Market | Remaining screen belongs to the map; left search/results drawer; category and area visible side by side; independent product/business choices; one paginated list |
| Map interaction | Preserve mounted map and viewport; business preview opens above the drawer; separate map controls and buying launcher |
| Featured | Compact broadcast heading, sponsor rail, horizontal illustrated days, two-column business cards |
| Showroom | Cover/video, handle/name/story, searchable two-column product grid, distinct contact section |
| Owner | Business identity, page status/item count, grouped tasks; Overview, Items, Page, Inquiries, More |
| About | Existing web hero, approved value proposition and three-step discovery/inquiry explanation |

Native adaptations: touch targets, safe areas, platform back behavior, scrollable
sheets, keyboard dismissal, reduced-motion drawer and one-column grids at larger
accessibility text sizes. Gallery and single/group inquiry flows remain intact.
The map stays mounted while the drawer closes; it is not recreated on every query.
The native owner DTO has no visitor metrics, so no invented dashboard numbers were
added. Custom web rendering remains accessible from the showroom's website link.

## Embedded video

Cover and gallery posters load the official YouTube player **inside the app**.
No automatic external browser/YouTube-app handoff, including failure fallback.
The player unmounts on media change, navigation away and app backgrounding. Invalid
references, provider errors and a 20-second loading timeout show retry feedback.
Native WebView navigation is restricted; only readiness/error messages cross the
bridge. Existing video approval and publication rules are unchanged.

The WebView is limited to this player. It does not replace native app screens.
Referer/application identity follows the official YouTube embed requirements.

## Evidence and remaining checks

Phone web references and replacement screenshots: `.local/mobile-alignment/`.
The reference web Market capture showed a local HMR/hydration problem; interactive
expectations were checked against its controlling source and specs. This was not
used as proof that the web map had passed an interaction test.

- `capture-mobile-alignment.mjs`: nine grouped checks (320px, 390px, landscape,
  tablet, multi-category/location clearing, result types, pagination, retained
  search/back state, map preview layering, Amharic, Featured/showroom/About).
- `capture-mobile.mjs`: 13 existing visitor/owner browser workflow checks, including
  real local OTP, inquiry actions, owner task navigation and logout.
- `test-mobile-video.ts`: validated refs/HTML, denied outbound navigation and
  bounded bridge events. `capture-mobile-video.mjs` uses an explicitly mocked
  provider to verify cover/gallery mounting, error/retry and cleanup. It does not
  prove real media playback or native WebView behavior.
- Actual YouTube embed rendered in the local browser; automated media-start attempts were inconclusive (frame/button readiness timeout). Device playback/fullscreen
  still requires a physical Android/iPhone check. No native playback pass claimed.
- Focused mobile/web typechecks, localization and specification validation apply.

Prior visual captures are superseded. Owner review, native device evidence, full
release gates, scoped commit and API rollout remain pending. No production changes.
