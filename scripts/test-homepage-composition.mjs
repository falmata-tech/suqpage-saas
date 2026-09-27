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
const featuredUi = read("components/FeaturedShowroomsWorkspace.tsx");
const discoveryUi = `${discoveryMapUi}\n${featuredUi}`;
const discoveryCss = read("app/discovery.css");
assert.doesNotMatch(discoveryCss, /\.featured-floor|\.featured-booth/);
const discoveryRuntime = read("lib/discovery.ts");
const publicDiscoveryCache = read("lib/public-discovery-cache.ts");
const landingCss = read("app/landing.css");
const about = read("app/(public)/about/page.tsx");
const showroomUi = read("components/showroom/ShowroomApp.tsx");
const showroomCss = read("components/showroom/showrooms.css");
const nextConfig = read("next.config.ts");

assert.match(market, /getPublicMarketplaceView/);
assert.match(publicDiscoveryCache, /getMarketplaceDiscoveryView/);
assert.match(publicLayout, /<PublicAppShell>/);
assert.match(market, /<DiscoveryWorkspace[\s\S]*discovery=\{discovery\}[\s\S]*hideIntro/);
assert.match(market, /Everything a business offers, in one place\./);
assert.match(market, /Discover businesses near you\. Explore their story, products, services and capabilities/);
assert.match(market, /get in touch directly/);
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
assert.match(mobileNavigation, /href: "\/featured", label: "Featured", icon: Star/);
assert.doesNotMatch(`${publicFrame}\n${mobileNavigation}`, /CalendarClock/);
assert.match(publicFrame, /href="\/about"/);
assert.doesNotMatch(publicFrame, /href: "\/sponsors"/);
assert.match(publicFrame, /aria-label=\{t\("Explore Suqpage"\)\}/);
assert.match(mobileNavigation, /href: "\/", label: "Market"/);
assert.match(mobileNavigation, /href: "\/about", label: "About"/);
assert.match(mobileNavigation, /aria-haspopup="dialog"/);
assert.match(mobileNavigation, /<span>\{t\("More"\)\}<\/span>/);
assert.doesNotMatch(mobileNavigation, /label: "Home"/);

assert.match(landingCss, /suqpage-public-app-canvas-v1\.webp/);
assert.match(landingCss, /\.public-mobile-tabs \{ grid-template-columns: repeat\(4/);
assert.match(landingCss, /\.public-market-experience > \.discovery/);
assert.doesNotMatch(landingCss, /\.public-lobby/);

assert.match(discoveryUi, /const action = "\/"/);
assert.match(discoveryUi, /discovery-workbench/);
assert.match(discoveryUi, /discovery-panel-filters/);
assert.match(discoveryUi, /<CategoryChooser/);
assert.doesNotMatch(discoveryMapUi, /filtersOpen|discovery-filter-toolbar/);
assert.match(discoveryMapUi, /Clear location/);
assert.match(fs.readFileSync("components/CategoryChooser.tsx", "utf8"), /aria-label=\{t\("Filter by category"\)\}/);
assert.match(discoveryRuntime, /ALL_DISCOVERY_INDUSTRIES = \{ key: "all", label: "All categories"/);
assert.match(discoveryRuntime, /DISCOVERY_INDUSTRY_OPTIONS = \[\.\.\.DISCOVERY_INDUSTRIES, ALL_DISCOVERY_INDUSTRIES\]/);
assert.match(discoveryRuntime, /normalizeIndustrySelection/);
assert.match(discoveryRuntime, /export async function getMarketplaceDiscoveryView/);
assert.match(discoveryRuntime, /export async function getFeaturedShowroomsView/);
assert.match(discoveryRuntime, /export async function getSponsoredShowrooms/);
assert.doesNotMatch(discoveryUi, /discovery-filter-sheet/);
assert.match(discoveryUi, /Search & filters/);
assert.match(discoveryUi, /discovery-floating-tools/);
assert.doesNotMatch(discoveryUi, /function IndustryStartChooser/);
assert.match(discoveryUi, /inert=\{!panelOpen\}/);
assert.doesNotMatch(discoveryUi, /discovery-mobile-view-tabs|aria-label="List view"/);
assert.match(featuredUi, /export default function FeaturedShowroomsWorkspace/);
assert.match(discoveryUi, /function SponsoredRail/);
assert.match(discoveryUi, /data-mobile-visible/);
assert.doesNotMatch(discoveryUi, /randomSponsorPair/);
assert.match(discoveryUi, /Daily Featured schedule/);
assert.match(discoveryUi, /Today’s broadcast/);
assert.match(discoveryUi, /Live on TikTok today/);
assert.doesNotMatch(discoveryUi, /"Weekly Expo schedule"|"Expo livestream status"|"Today’s Expo"|"Expo preview"|"This Expo floor/);
assert.match(discoveryRuntime, /title:\s*"Daily Featured"/);
assert.match(discoveryUi, /TikTok Live/);
assert.match(discoveryUi, /resolveFeaturedProgramSessions/);
assert.match(discoveryUi, /Livestream ended/);
assert.match(discoveryUi, /navigator\.geolocation\.getCurrentPosition/);
assert.match(discoveryUi, /Filter by region or city/);
assert.match(discoveryUi, /name="q" type="search"[\s\S]*maxLength=\{80\}/);
assert.match(discoveryUi, /role="combobox"/);
assert.match(discoveryUi, /aria-autocomplete="list"/);
assert.match(discoveryUi, /role="listbox"/);
assert.match(discoveryRuntime, /\.slice\(0, 6\)/);
assert.match(discoveryRuntime, /product\.is_published=1/);
assert.match(discoveryCss, /\.discovery-search-suggestions\s*\{[^}]*position:\s*absolute/);
assert.match(discoveryUi, /function MarketplaceSearchResults/);
assert.match(discoveryMapUi, /<legend className="sr-only">\{t\("Search result type"\)\}/);
assert.doesNotMatch(discoveryMapUi, /discovery-search-result-types/);
assert.match(discoveryMapUi, /type="checkbox"/);
assert.match(discoveryUi, /label: t\("Products & services"\)/);
assert.match(discoveryUi, /label: t\("Businesses"\)/);
assert.match(discoveryUi, /view: "search"/);
// S22/S24: the drawer hide control replaces the former separate map action.
assert.match(discoveryUi, /aria-label=\{t\("Hide search and filters"\)\}/);
assert.match(discoveryRuntime, /searchProducts:\s*DiscoveryProductResult\[\]/);
// FE-042 replaces the former fixed result cap with a bounded database page.
assert.match(discoveryRuntime, /LIMIT \? OFFSET \?/);
assert.match(discoveryUi, /Previous/);
assert.match(discoveryUi, /Next/);
assert.match(discoveryCss, /\.discovery-search-results\s*\{[^}]*overflow-y:\s*auto/);
assert.match(discoveryUi, /className="featured-gallery"/);
assert.match(discoveryCss, /\.discovery-workbench\s*\{[^}]*grid-template-columns:\s*320px minmax\(0, 1fr\)/);
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

assert.match(about, /suqpage-about-production-v1\.webp/);
assert.match(landingCss, /suqpage-workspace-context-v1\.webp/);
assert.doesNotMatch(market + about + landingCss, /https?:\/\/[^"')]+\.(?:png|jpe?g|webp)/i);

console.log("Public marketplace composition contract tests passed.");
