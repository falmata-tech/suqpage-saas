# Suqpage release — 2026-09-21

The owner approved completing and publishing the S7–S20 work. This release covers
simple product/service posting, complete private starter pages, owner-controlled
Publish/live Save, immediate public location updates, separated approximate city
markers, demo contacts, clear single/group inquiry actions, the platform favicon,
email-only entry and Suqpage email/domain branding.

Search now handles case, spacing, Unicode, Latin accents, common separator
punctuation, basic English plural forms and natural request words. Exact Greek/Cyrillic terms
remain searchable when no Latin accents are present. All meaningful
terms must match one offering and its public business metadata. Category, location,
publication and tenant boundaries remain; five-row pages share count predicates.
Query-only links open results, delayed responses cannot overwrite newer typing,
and a valid selected place with no matches does not silently broaden geography.
Arbitrary typo correction, translation and semantic/managed search remain deferred.

## Verification

- The 21-query pure matcher matrix and five PostgreSQL integration scenarios pass,
  covering lotion, everyday products/services, Prairie Meadows name/handle, locations,
  literal punctuation, hidden/cross-category records and page traversal.
- Browser regression covers 1440/390/320, query-only links, delayed responses, rapid
  typing, category/type retention, product Back, literal no-match and overflow.
- A 500-business/10,000-product local fixture returned five rows in 450/436/492 ms initially and 443/522/802 ms after the Unicode correction.
  This is a local measurement, not a production latency guarantee.
- Full code/release/operations gates passed before the final query-link correction;
  the final release, operations and nine-scenario acceptance gates for query-link and Unicode corrections pass. Full check also passes, with the actual process exit recorded automatically. The final
  release provider smoke is delegated to the complete local browser gate, which
  includes the same API/security scenario and is mandatory before deployment. Production dependency audit
  reported zero vulnerabilities. Runtime Auth routes are dynamic.
- Initial acceptance failures were stale tests: retired review/form controls, old
  inquiry labels, a raw PostgreSQL fixture that returned string IDs, missing staff
  attribution, video fixtures writing the old business field, and reloading before the account-phone save confirmation. Updated tests
  retain private-media, staff option/visibility, inquiry-denial and legacy-cart checks.
- Netlify CLI 23.5.0 edge bundling failed; the prior deployment's cached CLI 27.1.1
  passed. Function packaging includes Linux sharp. Artifact scans exclude private
  runtime paths and production credentials; the final artifact verification passes across 949 runtime/public source files.

## Hosted state and safety

Supabase target: `sjeiiqxgscuqajpgddcc`.
Netlify site: `26c795eb-5560-4a88-b38d-3cc922c2a5e6`.
Primary: https://suqpage.com; www redirects to the apex with path/query preserved.
DNS and managed HTTPS are verified. Hosted Auth now uses the apex and its
`/auth/callback`; guarded exact-plan application and full readback passed. Branded
email templates preserve the owner's Gmail sender and credentials; Google is off.
No real external email was sent as a test.

The owner approved the protected public-schema archive. Its SHA-256 is
`97f2c310b95262f119a832bf92924cc2d3c6f92b4068b965fdd2e0b4a91f6fcd`.
Restore rehearsal verified all 56 table fingerprints; migrations 46/47 preserved
3,222 original application rows across 55 tables, and repeat migration was a no-op.
The archive is owner-readable only, ignored by Git and excluded from deployment.
It does not contain Auth identities or private Storage objects.

Production has 64 existing admitted demo businesses with 256 complete offerings;
local fixtures have 66/264. `demo-dara-art-studio` and `demo-wabi-feed-mill` are absent
from production and will not be recreated. Demo corrections are limited to the
64 verified existing handles; existing accounts, inquiries and non-demo data are
protected. Example `alhayabrand` destinations remain unverified fictional examples.

Prairie Meadows and Farm Grass with Dirt are present and searchable on the retained
local app, in Agriculture/Dodolla. The owner confirmed testing port 3102 and resolved the reported miss by choosing
Agriculture; category scoping remains unchanged. Neither
record exists in production; publishing application code does not copy local tenants.

## Rollout and rollback

Scoped source commit, migrations, canonical application environment,
Netlify publication and monitored public readback are still pending. Do not describe
this document's candidate evidence as a completed application deployment.

Migration writes require the protected backup, successful rehearsal and final gates.
Original table fingerprints must match across the additive upgrade. Demo operations
have exact handle/count checks, protected before-state, transaction rollback and
post-write preservation checks. Environment changes affect only the three canonical
URL/origin variables. The previous Netlify deployment and environment values are
retained privately before cutover. Reverting application code can retain additive
schema 47; restoring data or Auth configuration is a separate reviewed operation.
