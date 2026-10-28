# AfricMade identity audit: retained compatibility identifiers

This inventory supports BE-059 S188 and DEP-049. It records old-name bytes that
must remain after current web, Expo, email, metadata, asset, package, and source
presentation uses AfricMade. It is not permission to use an old logo, label, or
Play draft for a new release.

| Retained value or path | Why it remains | Future owner and exit condition |
| --- | --- | --- |
| `SUQPAGE_*` and `MIRTPAGE_*` environment keys, plus hosted Supabase and Netlify values | The current production runtime, CI, and local operators bind to these exact keys. Renaming only source would disconnect credentials and data. | DEP-029/DEP-049 operations: staged dual-read configuration, exact hosted backup and reviewed plan, then removal after verified traffic cutover. |
| `suqpage` cookies, cart/navigation keys, `X-Suqpage-Buying-Session`, push title/tag, and `suqpage.component-bank@2` | Existing installed clients and saved browser state still send these wire and storage identifiers. New display text is AfricMade. | BE-059: dual-read/write migration, old-client coverage, expiry evidence, then versioned retirement. |
| `mirtpage.com`/`suqpage.com` incoming links, status lookup allowance, old Auth callback and invitation origin | Bookmarks, old apps, and managed Auth currently use these origins. The new app API and public canonical metadata target `africmade.com`. | DEP-029/DEP-049: add AfricMade callback, switch reviewed primary and environment, verify sign-in/invitations and old redirects before removing old origins. |
| `public/uploads/seed/suqpage/*`, old public brand/landing/PWA URLs | Persisted business media and saved shortcuts may request those exact paths. The old brand/PWA URLs now rewrite to current art; renamed landing assets are served by exact aliases. | DEP-032/BE-059: migrate stored references and measure old URL use before retiring aliases or seed paths. |
| Old migration rows/defaults and historical PostgreSQL baseline labels | Applied migrations are immutable evidence; rewriting them can cause divergent schemas. New conversations explicitly provide a requester name. | BE-059/DEP-049: separately reviewed forward migration for the support default and any generated legacy labels, with production backup and regression tests. |
| Historical specs, ADRs, dated release reports, retired Play drafts, screenshots and fixture names | They document what was actually built, published or rejected. The current Play submission uses `docs/play-store/africmade/` and a new signed artifact. | Release/documentation owner: archive or remove stale draft materials only after traceability and artifact consumers are reconciled; never upload an old draft. |

Active identity checks: `scripts/test-platform-identity.mjs`,
`scripts/test-platform-brand.ts`, `scripts/test-platform-naming.ts`,
`scripts/test-mobile-build-config.cjs`, `scripts/test-mobile-links.ts`, and
`scripts/test-public-seo.ts`. The S188 signed successor must be inspected after
compilation because old compatibility strings will still appear in its bundle;
their presence is not a public-brand claim. No current source check can prove a
hosted provider setting or an installed phone has changed.
