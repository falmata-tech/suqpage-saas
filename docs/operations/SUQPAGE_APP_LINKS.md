# Suqpage app links

FE-053 / DEP-042 / ADR-0023 / S66.

The canonical public association is
https://suqpage.com/.well-known/assetlinks.json. It registers only the existing
Expo internal Android package com.suqpage.app.preview. Its SHA-256 certificate is
verified from finished EAS APK 2018cc70 against the earlier known SHA-1. Private
signing material stays in EAS; public metadata is not a signing secret.

The mobile candidate maps /@handle and ?product=<id> to native showroom/product,
and Market/Featured/About/account links to native screens. Market parameters
restore on cold, warm and repeated intents. Admin/API/Auth callbacks stay on the
web. Server API/session/catalog authority is unchanged. Unknown inputs safely
open Market. Claims use exact HTTPS suqpage.com routes, no wildcard domains.

A new APK is required for Android intent filters. The existing finished APK does
not contain these filters. Review the exact-source native audit/build admission,
then rebuild, verify signature/manifest, install and use the adb checks documented
in MOBILE-TESTING.md. Do not claim app opening from website metadata alone.

Production Google Play signing and iOS Apple Team identifiers are not registered.
Verify their public signing identities before adding them; keep private keys out
of association files. Embedded browsers may keep links on the website. No store
publication, paid build or invitation sending is authorized by this setup.

S66 domain rollout verified: deploy 6ac576417f18a89035f75274, isolated web source
70fb961d9f11dba9465b5f6bacfe6c57b8bf7735 (current live source plus association metadata).
The exact JSON is served at https://suqpage.com/.well-known/assetlinks.json with
HTTP 200 with application/json and no redirect. Seven live association, site, health and
mobile-API checks pass. Linux handler/image and packaged production health/login
checks pass; full selected web release has zero audit findings. Code rollback is
6ac52555a812ad5c89621401; schema/Auth unchanged. Mobile source 87fa05e and its
clean 1,493-file archive are ready; the original one-artifact exception expired
with finished build 2018cc70. Owner renewal for the next exact source is pending
in .local/app-links/android-rebuild-review.md. No new APK, Android OS-link/device
verification or iOS association is claimed. Private receipts: .local/app-links/.
