# Storefront accent study

Design-only proposal requested by the owner, using the fictional Selam Weave
Studio portfolio. This is not a commissioned change to that demo's public page.

## Direction and boundaries

Keep the current cover → identity/About → catalog → contact structure. A chosen
accent affects a thin cover edge, an optional 8% hero wash, the avatar surround,
active tab, small section rules, selection outline and tenant inquiry action.
Keep product photographs, Suqpage header/logo/navigation, platform map markers,
status colors and body text unchanged. Derive readable button/label colors from
extreme inputs rather than accepting unreadable neon text. White/black are valid.
Typography, spacing, shape and layout do not change with the selected hue.

The sample includes teal, hot pink, acid lime, electric violet, yellow, white and
black plus a custom six-digit hex picker. Hero tint can be compared with zero
and adjusted from 0–14%. Products retain their original image pixels.

## Media authority

Read ../selam-weave/BRIEF.md before choosing media. Its recorded approved assets
are illustrative disposable-demo artwork, not factual customer photography.
Reuse hero.jpg and product-1/2/3/4.jpg from the existing benchmark directory and
the existing Suqpage mark. Do not generate or fetch additional media.

## Proposed future setup

Optional accent choice during signup with live preview, Suqpage/default as the
fallback; later editable in Page settings. Persist a validated accent on the
business profile, owned through the account, not a global account/UI theme.
Future implementation must cover PostgreSQL, draft/publication snapshots, native
DTOs, caching and tenant/version checks. None of these writes happen in this
visual prototype. No account is created and no button claims a successful save.

## Review

Capture 1440 desktop, 390 and 320 phone. Compare extreme colors, contrast,
unchanged product photos/platform identity, keyboard interaction and overflow.
Deliver an interactive local preview and screenshots before implementation.

## Current implementation direction — 2026-10-05

The original prototype remains design evidence only. Owner corrected the flow:
no signup color controls or required code entry. Page editing presents the actual
full storefront with a visual color picker; Save persists it. See FE-054 A5/A6
and S53 for current implementation evidence.
