# Country and city data

BE-054 / ADR-0027 use an offline GeoNames cities5000 snapshot downloaded October
15, 2026. GeoNames publishes this data under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Source and field documentation: [GeoNames dump readme](https://download.geonames.org/export/dump/readme.txt)
and [about GeoNames](https://www.geonames.org/about.html).

- Original cities5000.zip SHA-256: `c1da82518ad0af441033c3019ae853a3f1d25fa8553e767c4fed4e64f8ad95f0`.
- Committed world-place-catalog.json SHA-256: `6f1e53448f713084dbabb9b49a7e471e09be680add56d0cec212aaa082d0cee9`.
- 69,571 non-Ethiopian city records; 8,350,262 JSON bytes.
- 250 country/territory choices from countryInfo.txt;
  country labels use the device's locale display names where supported.
- Keep all 781 existing OSM Ethiopian IDs/anchors. Their original attribution
  remains; no existing coordinate is replaced by a GeoNames coordinate.

The server reads the committed JSON once. Next's file trace explicitly includes
it. Only bounded country-scoped suggestions reach browsers/native clients; the
whole city file must never enter a visitor or Expo bundle. No provider request,
secret, database or scheduled data refresh is needed to search these places.

Alternate-name lists are bounded to six normally and 64 in East African and
nearby Arabic-speaking countries, preserving local forms such as Muqdisho and
ኣስመራ. Addis Ababa's Finfinnee spelling is also attested in [Ethio telecom's Oromo
service information](https://www.ethiotelecom.et/kuufama-moobaayilaa-5g/?lang=om).
Hosaena/Hossana and Gondar/Gonder aliases retain the original canonical IDs.

This source covers cities above 5,000 people and administrative seats. Some
smaller towns are absent; GeoNames gives no completeness or accuracy warranty.
Choosing a city creates an approximate city-area location, not a verified street
address. Exact storefront coordinates remain an explicit owner choice.
Discovery filter choices come only from eligible public Suqpage pages, not this
entire catalog. Identical names in different countries retain distinct keys.

Demo phones use the [Ofcom-reserved drama range](https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/numbers-for-drama)
+44 7700 900000–900999. Public demo email/websites use example.invalid and external
contact actions remain inert; private sign-in emails are separate.
