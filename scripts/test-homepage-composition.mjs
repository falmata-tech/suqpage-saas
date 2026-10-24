import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const market = read("app/(public)/page.tsx");
const redirect = read("app/discover/page.tsx");
const featured = read("app/(public)/featured/page.tsx");
const publicLayout = read("app/(public)/layout.tsx");
const publicShell = read("components/PublicAppShell.tsx");
const publicFrame = read("components/PublicAppFrame.tsx");
const mobileNavigation = read("components/PublicMobileNavigation.tsx");
const discoveryMapUi = read("components/DiscoveryWorkspace.tsx");
const marketControls = read("components/MarketSearchControls.tsx");
const marketSearch = read("lib/market-search.ts");
const marketFeed = read("lib/use-market-feed.ts");
const independentCss = read("components/IndependentMarket.module.css");
const featuredUi = read("components/FeaturedShowroomsWorkspace.tsx");
const featuredBroadcastHeader = read("lib/featured-broadcast-header.ts");
const discoveryUi = `${discoveryMapUi}\n${featuredUi}`;
const discoveryCss = read("app/discovery.css");
assert.doesNotMatch(discoveryCss, /\.featured-floor|\.featured-booth/);
const discoveryRuntime = read("lib/discovery.ts");
const publicDiscoveryCache = read("lib/public-discovery-cache.ts");
const landingCss = read("app/landing.css");
const about = read("app/(public)/about/page.tsx");
const aboutAudience = read("components/AboutAudience.tsx");
const showroomUi = read("components/showroom/ShowroomApp.tsx");
const showroomCss = read("components/showroom/showrooms.css");
const nextConfig = read("next.config.ts");

// FE-065 supersedes the shared Market query. Keep both server projections and
// their initial criteria distinct; Featured retains its separate cache contract.
assert.match(market, /getIndependentPublicMarketplace\(['"]businesses['"],\s*initialBusiness\)/);
assert.match(market, /getIndependentPublicMarketplace\(['"]products['"],\s*initialProduct\)/);
assert.match(market, /initialBusiness=readMarketSearch\(params,['"]b\.['"]\);initialProduct=readMarketSearch\(params,['"]p\.['"]\)/);
assert.match(market, /productDiscovery=\{productDiscovery\}[\s\S]*initialBusiness=\{initialBusiness\}[\s\S]*initialProduct=\{initialProduct\}/);
assert.match(market, /getIndependentPublicMarketplace\('products',initialProduct\),readExcludedBusinesses\(\)/);
assert.match(market, /initialExclusions=\{initialExclusions\}/, 'Server initial membership carries its validated exclusion identity');
assert.match(publicDiscoveryCache, /getMarketplaceDiscoveryView/);
assert.match(publicDiscoveryCache, /const cachedIndependentBrowse = unstable_cache\([\s\S]*async \(scope:MarketScope\) => getMarketplaceDiscoveryView\(\{scope\}\)/);
assert.match(publicDiscoveryCache, /if\(!hasMarketCriteria\(search\)&&search\.page===1&&!options\.excludedBusinessIds\?\.length&&!options\.readPort&&!options\.now\)return cachedIndependentBrowse\(scope\)/, 'Only finite default-browse scopes enter the shared cache');
assert.match(publicDiscoveryCache, /export async function getIndependentPublicMarketplace[\s\S]*const excluded=await readExcludedBusinesses\(\);[\s\S]*excludedBusinessIds:excluded/, 'Personal exclusions are resolved before selecting a cached projection');
assert.match(publicDiscoveryCache, /revalidate:PUBLIC_DISCOVERY_REVALIDATE_SECONDS,tags:\[['"]public-marketplace['"]\]/);
assert.match(marketSearch, /MARKET_MAP_LIMIT = 200/);
assert.match(marketSearch, /MARKET_PRODUCT_BATCH_SIZE = 12/);
assert.match(publicLayout, /<PublicAppShell>/);
assert.match(market, /<DiscoveryWorkspace[\s\S]*discovery=\{discovery\}[\s\S]*hideIntro/);
assert.match(market, /t\(MARKET_STOREFRONT_COPY.title\)/);
assert.match(market, /t\(MARKET_STOREFRONT_COPY.description\)/);
assert.doesNotMatch(market, /public-lobby|landing-hero|FeaturedShowroomsWorkspace|SponsoredShowroomsWorkspace/);
assert.doesNotMatch(market, /verified|rating|rated|buyers served|#1|newsletter|checkout/i);

assert.match(redirect, /redirect\(target\.size > 0 \? `\/\?\$\{target\.toString\(\)\}` : "\/"\)/);
assert.match(nextConfig, /source: "\/discover", destination: "\/", permanent: false/);
assert.match(nextConfig, /source: "\/sponsors", destination: "\/featured", permanent: false/);
assert.match(featured, /FeaturedShowroomsWorkspace/);
assert.match(featured, /getPublicFeaturedView/);
assert.match(featured, /getPublicSponsors/);
assert.match(featured, /sponsoredShowrooms=\{sponsoredShowrooms\}/);
assert.doesNotMatch(featured, /DiscoveryWorkspace discovery/);

assert.match(publicShell, /currentUser\(\)/);
assert.match(publicFrame, /href: "\/", label: "Market"/);
assert.match(publicFrame, /href: "\/featured", label: "Featured", icon: Star/);
assert.match(mobileNavigation, /href:\s*"\/featured",\s*label:\s*"Featured",\s*icon:\s*Star/);
assert.doesNotMatch(`${publicFrame}\n${mobileNavigation}`, /CalendarClock/);
assert.match(publicFrame, /<Link href=\{dashboardHref\}/);
assert.match(publicShell, /dashboardHref=\{user\?workspaceHomeHref\(user\)/, 'The authenticated role supplies its authorized Account destination');
assert.match(read("components/DashboardShell.tsx"), /href:['"]\/about['"],label:['"]About['"]/, 'Owner navigation retains the About task');
assert.doesNotMatch(publicFrame, /href: "\/sponsors"/);
assert.match(publicFrame, /aria-label=\{t\("Explore AfricMade"\)\}/);
assert.match(mobileNavigation, /href:\s*"\/",\s*label:\s*"Market"/);
// FE-066/FE-070: four public tasks, About reachable, Login/Account follows the
// session, and the private business inbox stays under Account rather than public navigation.
assert.match(mobileNavigation, /href:\s*"\/about",\s*label:\s*"About"/);
assert.match(mobileNavigation, /href:onboarding\?"\/request":signedIn\?dashboardHref:"\/login"/);
assert.match(mobileNavigation, /label:signedIn\?"Account":"Login"/);
assert.match(mobileNavigation, /aria-label=\{t\("AfricMade application navigation"\)\}/);
assert.doesNotMatch(`${publicFrame}\n${mobileNavigation}`, /label:\s*["']Inquiries["']|\/dashboard\/inquiries|login\?next=inquiries/);
assert.doesNotMatch(mobileNavigation, /t\("More"\)|aria-haspopup="dialog"/);
assert.doesNotMatch(mobileNavigation, /label: "Home"/);

assert.match(landingCss, /\.public-app-main \{[^}]*background: var\(--mp-canvas\)/);
assert.doesNotMatch(landingCss, /suqpage-public-app-canvas-v1\.webp/, "Shared public pages keep text off decorative photography");
assert.match(landingCss, /\.public-mobile-tabs \{ grid-template-columns: repeat\(4/);
assert.match(landingCss, /\.public-market-experience > \.discovery/);
assert.doesNotMatch(landingCss, /\.public-lobby/);

// FE-065/FE-074 share request scheduling, not criteria or collection authority.
// Check both real adapters and their feed bindings rather than the old inline
// fetch's local variable name. Behavioral race/retention tests remain separate.
const productLoader = discoveryMapUi.match(/async function loadProductBatch\([\s\S]*?(?=\nfunction useIndependentSearch)/)?.[0];
const businessLoader = discoveryMapUi.match(/function useIndependentSearch\([\s\S]*?(?=\nexport default function DiscoveryWorkspace)/)?.[0];
assert.ok(productLoader && businessLoader, 'Both scoped public discovery adapters remain wired');
for (const loader of [productLoader, businessLoader]) {
  assert.match(loader, /fetch\(['"]\/api\/discovery\?['"]\+params,\{signal\}\)/, 'Discovery reads stay same-origin and carry the feed abort signal');
  assert.match(loader, /if\(!response\.ok\)throw new Error\(['"]Search is unavailable\. Try again\.['"]\)/, 'Failed discovery reads cannot become empty-success data');
}
assert.match(productLoader, /return productBatch\(await response\.json\(\) as MarketplaceDiscoveryView\)/);
assert.match(businessLoader, /const key=marketSearchParams\(scope,search\)\.toString\(\)/);
assert.match(businessLoader, /useMarketFeed\(key,async\(params,signal\)=>/);
assert.match(businessLoader, /return batch\(await response\.json\(\) as MarketplaceDiscoveryView\)/);
assert.match(businessLoader, /initialExclusionKey===exclusionKey\?batch\(initial\):undefined,\{scopeKey:['"]\/api\/discovery:public:['"]\+scope\+['"]:excluded:['"]\+exclusionKey,initialSnapshotKey:marketSearchParams\(scope,initialSearch\)\.toString\(\)/, 'Business retention and initial data require the same public collection, criteria and exclusions');
assert.match(discoveryMapUi, /exclusionKey=excludedBusinessIds\(blocked\.list\.map\(item=>item\.id\)\)\.join\(','\)/, 'Preference identity uses canonical current exclusions');
assert.match(discoveryMapUi, /const businesses=useIndependentSearch\(['"]businesses['"],businessSearch,discovery,initialBusiness,exclusionKey,initialExclusionKey\)/);
assert.match(discoveryMapUi, /const productKey=marketSearchParams\(['"]products['"],productSearch\)\.toString\(\)/);
assert.match(discoveryMapUi, /const products=useMarketFeed\(productKey,loadProductBatch,initialExclusionKey===exclusionKey\?productBatch\(productDiscovery\|\|discovery\):undefined,\{scopeKey:['"]\/api\/discovery:public:products:excluded:['"]\+exclusionKey,initialSnapshotKey:marketSearchParams\(['"]products['"],initialProduct\)\.toString\(\)\}\)/);
assert.match(marketFeed, /\},\s*250\);/, 'Criteria changes retain the bounded debounce');
assert.match(marketFeed, /return \(\) => \{clearTimeout\(timer\); controller\.abort\(\); more\.current\?\.abort\(\);\}/);
assert.match(marketFeed, /!controller\.signal\.aborted && generation\.current === version && activeKey\.current === key && activeScope\.current === scopeKey/, 'Only the latest correct-scope request may replace results');
assert.match(discoveryUi, /discovery-workbench/);
assert.match(discoveryMapUi, /aria-label=\{t\(['"]Search for['"]\)\}/);
assert.match(discoveryMapUi, /<MarketSearchControls[\s\S]*scope=\{panelOpen\?['"]products['"]:['"]businesses['"]\}[\s\S]*onChange=\{panelOpen\?setProductSearch:setBusinessSearch\}/);
assert.doesNotMatch(discoveryMapUi, /filtersOpen|discovery-filter-toolbar/);
assert.match(marketControls, /aria-label=\{t\(['"]Clear search['"]\)\}/);
assert.match(marketControls, /aria-label=\{t\(['"]Clear all['"]\)\}[\s\S]*onChange\(emptyMarketSearch\(\)\)/);
// Retained category chooser remains accessible for its compatibility callers.
assert.match(fs.readFileSync("components/CategoryChooser.tsx", "utf8"), /aria-label=\{t\("Filter by category"\)\}/);
assert.match(discoveryRuntime, /ALL_DISCOVERY_INDUSTRIES = \{ key: "all", label: "All categories"/);
assert.match(discoveryRuntime, /DISCOVERY_INDUSTRY_OPTIONS = \[\.\.\.DISCOVERY_INDUSTRIES, ALL_DISCOVERY_INDUSTRIES\]/);
assert.match(discoveryRuntime, /normalizeIndustrySelection/);
assert.match(discoveryRuntime, /export async function getMarketplaceDiscoveryView/);
assert.match(discoveryRuntime, /export async function getFeaturedShowroomsView/);
assert.match(discoveryRuntime, /export async function getSponsoredShowrooms/);
assert.doesNotMatch(discoveryUi, /discovery-filter-sheet/);
assert.match(marketControls, /key:['"]category['"],label:['"]Category['"]/);
assert.match(marketControls, /key:['"]country['"],label:['"]Country['"]/);
assert.match(marketControls, /key:['"]city['"],label:['"]City['"]/);
assert.match(discoveryUi, /discovery-floating-tools/);
assert.doesNotMatch(discoveryUi, /function IndustryStartChooser/);
assert.match(discoveryUi, /inert=\{!panelOpen\}/);
assert.doesNotMatch(discoveryUi, /discovery-mobile-view-tabs|aria-label="List view"/);
assert.match(featuredUi, /export default function FeaturedShowroomsWorkspace/);
assert.match(featuredUi, /<SponsorCarousel placements=\{sponsorPlacements\}/);
assert.doesNotMatch(discoveryUi, /randomSponsorPair/);
assert.match(discoveryUi, /Daily Featured schedule/);
assert.match(featuredUi, /featuredBroadcastHeader\(/);
assert.match(featuredBroadcastHeader, /Check TikTok Live/);
assert.doesNotMatch(featuredUi, /Live on TikTok today|Now broadcasting/);
assert.doesNotMatch(discoveryUi, /"Weekly Expo schedule"|"Expo livestream status"|"Today’s Expo"|"Expo preview"|"This Expo floor/);
assert.match(discoveryRuntime, /title:\s*"Daily Featured"/);
assert.match(featuredBroadcastHeader, /TikTok Live/);
assert.match(featuredBroadcastHeader, /resolveFeaturedProgramSessions/);
assert.match(featuredBroadcastHeader, /Today's featured program has ended/);
assert.match(discoveryUi, /navigator\.geolocation\.getCurrentPosition/);
assert.match(marketControls, /type="search" maxLength=\{80\}/);
assert.match(marketControls, /aria-label=\{t\(scope===['"]businesses['"]\?['"]Search businesses['"]:['"]Search products['"]\)\}/);
assert.match(marketControls, /disabled=\{f\.key===['"]city['"]&&!value\.countries\.length\}/, 'A country is required before selecting a city');
assert.match(marketControls, /aria-haspopup="dialog"/);
assert.match(marketControls, /<dialog[\s\S]*aria-labelledby=/);
assert.match(marketControls, /type="checkbox" checked=\{selected\.includes\(c\.key\)\}/);
assert.match(discoveryRuntime, /\.slice\(0, 6\)/);
assert.match(discoveryRuntime, /product\.is_published=1/);
assert.match(discoveryCss, /\.discovery-search-suggestions\s*\{[^}]*position:\s*absolute/);
assert.match(discoveryUi, /function MarketplaceSearchResults/);
// FE-065/FE-067: businesses stay on their independent map; cards are products.
assert.match(discoveryMapUi, /className="discovery-results-heading">\{t\("Products"\)\}/);
assert.doesNotMatch(discoveryMapUi, /discovery-search-result-types|discovery-result-filters|renderBusiness|toggleResultType/);
assert.match(marketSearch, /view:mode===['"]products['"]\?['"]search['"]:['"]map['"]/);
// S22/S24: the drawer hide control replaces the former separate map action.
assert.match(discoveryMapUi, /aria-label=\{t\(panelOpen\?['"]Map only['"]:['"]View products['"]\)\}/);
assert.match(discoveryRuntime, /searchProducts:\s*DiscoveryProductResult\[\]/);
// FE-065 AC9 keeps bounded SQL pages and replaces visible Previous/Next links
// with a single-flight append feed, explicit fallback and end announcement.
assert.match(discoveryRuntime, /LIMIT \? OFFSET \?/);
assert.match(discoveryMapUi, /new IntersectionObserver[\s\S]*root:resultList\.current/);
assert.match(discoveryMapUi, /if\(!enabled\|\|!hasMore\|\|loading\|\|loadingMore\|\|moreError/);
assert.match(discoveryMapUi, /enabled=\{panelOpen\} resetKey=\{products\.displayedSnapshotKey\} snapshotCurrent=\{products\.snapshotCurrent\}/, 'Only admitted product snapshots reset scroll or establish current result membership');
assert.match(discoveryMapUi, /t\("Load more"\)/);
assert.match(discoveryMapUi, /t\("You've seen all the results\."\)/);
assert.match(marketFeed, /old\.key !== activeKey\.current \|\| old\.displayedSnapshotKey !== activeKey\.current \|\| old\.scopeKey !== activeScope\.current \|\| !old\.batch \|\| old\.loading \|\| old\.error \|\| more\.current \|\| old\.batch\.page >= old\.batch\.pages/, 'Pagination requires current displayed criteria/scope, a settled successful batch and a single in-flight page');
assert.match(marketFeed, /controller\.signal\.aborted \|\| generation\.current !== version \|\| activeKey\.current !== expectedKey \|\| activeScope\.current !== expectedScope/);
assert.match(marketFeed, /const seen = new Set\(s\.batch\.items\.map\(item => item\.id\)\)/);
assert.match(marketFeed, /moreError: ['"]Search is unavailable\. Try again\.['"]/);
assert.match(independentCss, /:global\(\.discovery-search-results\)\{[^}]*overflow:auto/);
assert.match(discoveryCss, /\.discovery-search-results\s*\{[^}]*overflow-y:\s*auto/);
assert.match(discoveryUi, /className="featured-gallery"/);
assert.match(independentCss, /\.stage\{[^}]*display:flex!important;flex-direction:column/);
assert.match(independentCss, /\.stage \.mapPanel\[data-open=false\]\{[^}]*pointer-events:none/);
assert.match(discoveryCss, /\.public-market-experience \.discovery-marketplace,[\s\S]*height:\s*100%/);
assert.match(discoveryCss, /\.featured-gallery\s*\{[^}]*grid-template-columns/);
assert.doesNotMatch(discoveryUi, /featured-floor|featured-floor-actions|Zoom in to featured showroom floor|Fit featured showroom floor/);
assert.match(discoveryCss, /\.featured-card\.walkthrough-current/);
assert.match(discoveryCss, /\.featured-program-header\s*\{[^}]*border-bottom:\s*0/);
assert.match(discoveryCss, /\.discovery-filter-sheet::backdrop/);
assert.match(discoveryCss, /\.discovery-industry-menu\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*100%/);
assert.match(discoveryCss, /\.discovery-preview-scrim\s*\{[^}]*rgb\(11 29 58 \/ 14%\)/);
assert.match(discoveryUi, /Featured now/);
assert.match(discoveryUi, /data-presence/);
assert.doesNotMatch(discoveryUi, /rail\.scrollTo/);
assert.doesNotMatch(discoveryUi, /emphasizedFit|phoneMinimum/);

assert.match(showroomUi, /router\.back\(\)/);
assert.match(showroomUi, /suqpage:last-marketplace-url:v1/);
assert.match(showroomUi, /validPublicWorkspaceReturn/);
assert.match(showroomUi, /Back to Market/);
assert.match(showroomCss, /\.showroom-host-bar-shell\{position:sticky;top:0/);
assert.match(showroomUi, /if \(destination\) \{[\s\S]*router\.push\(destination\)/);
assert.match(nextConfig, /geolocation=\(self\)/);
assert.doesNotMatch(nextConfig, /geolocation=\(\)/);

const images = [
  ["public/landing/suqpage-public-app-canvas-v1.webp", 160_000],
  ["public/landing/suqpage-about-production-v1.webp", 180_000],
  ["public/landing/suqpage-workspace-context-v1.webp", 140_000],
];
for (const [file, maximum] of images) {
  const target = path.join(root, file);
  assert.ok(fs.existsSync(target), `${file} exists locally`);
  assert.ok(fs.statSync(target).size <= maximum, `${file} remains within its image budget`);
}

assert.match(about, /<AboutAudience\s*\/>/);
assert.match(aboutAudience, /ABOUT_STOREFRONT_SECTIONS.map/);
assert.match(aboutAudience, /role="tablist"[\s\S]*role="tab"[\s\S]*aria-selected=\{audience===section\.id\}/);
assert.match(aboutAudience, /role="tabpanel"[\s\S]*hidden=\{audience!==section\.id\}/);
assert.match(landingCss, /\.landing-market-main\s*\{\s*background:\s*var\(--mp-canvas\)/);
assert.doesNotMatch(landingCss, /suqpage-workspace-context-v1\.webp/);
assert.doesNotMatch(market + about + landingCss, /https?:\/\/[^"')]+\.(?:png|jpe?g|webp)/i);

console.log("Public marketplace composition contract tests passed.");
