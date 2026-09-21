# Services and city/town selection — local review

## Implemented

FE-044 / BE-037 / DEP-034 add services to the existing offering model. Existing
business/product IDs, product links, options, saved inquiry selections and historical
inquiries retain their contracts. Product-only pages keep Products; service-only
and mixed pages use Services / Products & services. Shared media, highlights,
availability, optional price, sessions/hours/project units and inquiry controls
serve both. Product/service types remain compatible with the `products` API/table.
Current real and demo business records have not been reset or reclassified.

Market/About now describe an accessible digital presence for African businesses,
including growers, makers, traders and service providers. The map, paginated
results and Featured behavior remain. The public story distinguishes the current
Ethiopia-first catalog from the wider African mission.

FE-045 / BE-038 / DEP-035 reuse 54 city and 727 town points from the committed
OpenStreetMap data. `lib/place-catalog.json` derives names, local names and point
coordinates from `public/geo/ethiopia-places-{cities,towns}-osm.geojson`; regions
come from containing polygons in `public/geo/ethiopia-admin1-2023.geojson`. IDs hash
name/coordinate identity; all 781 are unique, bounded and assigned a region.
This index is a versioned snapshot, not a live geocoder or claim of exhaustive
coverage. Existing source attribution is retained and surfaced beside the search.

The owner sends a selected place ID; the server resolves its canonical coordinates.
Public town anchors are stored separately from exact storefront coordinates.
General-area mode still keeps storefront coordinates null. Admin map inputs use
the saved anchor and preserve existing coarse-area approval, suspension, tenant
scope and stale-version checks. Manual location entry remains available.

## Evidence and limitations

- `test:service-offerings`: native fresh/46 upgrade, preserved rows, service upkeep,
  canonical optional inquiry snapshots, foreign/hidden/unavailable denial pass.
- `test:place-selection`: 781-point bounds, local-name lookup, canonical anchor,
  native 47 upgrade preservation, save/reload and stale/foreign/forged denial pass.
- Existing `test:product-upkeep`, `test:launch-wiring`, `test:narrative` and
  `test:product-inquiry` pass, along with homepage checks and typecheck.
- Focused capture creates a service through the owner editor and exercises
  product/service/mixed profiles, a service inquiry and a real search result,
  keyboard place selection/save/reload, null storefront coordinates, admin anchor
  prefilling and About at 1440/390/320. Six owner/About accessibility scans pass.
  Twenty-eight screenshots are in `.local/service-place-review/` and recreated by
  `node --import tsx scripts/capture-service-place.ts`.
- Browser data and sessions are disposable local fixtures. No actual account email,
  inquiry or external message is sent. Existing local and hosted databases remain
  on their prior schema; no production write or release is claimed.

## Remaining decisions and rollout

S8 starter-content scope and Save behavior are pending: whether Save immediately
updates the public page, whether generic content is limited to demos/new private
pages or also empty real pages, and whether orders means custom-work inquiries or
checkout. Neither page-review controls nor real tenant content have been changed.

The repository requires explicit visual approval before full check/release and
provider-browser gates. After that, rehearse migrations 46/47 with protected
backup, retain rollout/rollback evidence, commit exact task scope and publish only
the approved candidate. The production Auth redirect fix remains the live version.

## Complete new-workspace starters (S8a)

FE-046/BE-039/DEP-036 implement the subsequent no-empty-presentation-fields request
for all new self-signup and staff-invited businesses. Original geometric sample
illustrations, a sample YouTube URL, all eight public contact/social inputs,
private general-area example and three complete product/service/custom-work
examples are persisted atomically. No existing tenant or real account field is
backfilled. File upload selectors remain empty while stored artwork is shown.

Run `npm run test:business-starters` and
`node --import tsx scripts/capture-business-starters.ts`. The browser runner uses
a disposable PostgreSQL schema, test-only local session and port 3104; it cleans
up afterwards. `--serve` retains its isolated workspace and review browser until
SIGTERM/SIGINT. Production identity/email and external YouTube playback are not
verified by this test. Eighteen images live in `.local/business-starter-review/`.

Signup, invitation, atomic rollback, existing-content protection, launch wiring,
typecheck and browser field/media/save/reload checks pass. The existing standard
page lifecycle test fixture now hides default offerings to retain its no-listed-
product negative test; that protected persistent-runtime rehearsal is deferred
to the full gate after visual approval. No full release/build, commit or deploy
is claimed. User review is the next gate under AGENTS.md workflow step 8.

## Persistent local database now updated

The owner-authorized local update completed on 2026-09-17. The retained database
is schema 47; backup/restore, preserved records and rollback-only feature writes
are verified. Port 3102 uses the real local provider runtime. Earlier local
migration blockers are resolved. See docs/SUQPAGE-LOCAL-SCHEMA-47.md.
