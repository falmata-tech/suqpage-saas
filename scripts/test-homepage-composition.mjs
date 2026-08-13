import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const market = read("app/page.tsx");
const redirect = read("app/discover/page.tsx");
const featured = read("app/featured/page.tsx");
const publicShell = read("components/PublicAppShell.tsx");
const mobileNavigation = read("components/PublicMobileNavigation.tsx");
const discoveryUi = read("components/DiscoveryWorkspace.tsx");
const discoveryCss = read("app/discovery.css");
const discoveryRuntime = read("lib/discovery.ts");
const landingCss = read("app/landing.css");
const about = read("app/about/page.tsx");
const showroomUi = read("components/showroom/ShowroomApp.tsx");
const nextConfig = read("next.config.ts");

assert.match(market, /getMarketplaceDiscoveryView/);
assert.match(market, /<PublicAppShell>/);
assert.match(market, /<DiscoveryWorkspace discovery=\{discovery\} hideIntro/);
assert.match(market, /Find Ethiopian makers and producers\./);
assert.match(market, /custom work, ready products, and wholesale supply/);
assert.doesNotMatch(market, /public-lobby|landing-hero|FeaturedShowroomsWorkspace|SponsoredShowroomsWorkspace/);
assert.doesNotMatch(market, /verified|rating|rated|buyers served|#1|newsletter|checkout/i);

assert.match(redirect, /redirect\(target\.size > 0 \? `\/\?\$\{target\.toString\(\)\}` : "\/"\)/);
assert.match(nextConfig, /source: "\/discover", destination: "\/", permanent: false/);
assert.match(nextConfig, /source: "\/sponsors", destination: "\/featured", permanent: false/);
assert.match(featured, /FeaturedShowroomsWorkspace/);
assert.match(featured, /getFeaturedShowroomsView/);
assert.match(featured, /getSponsoredShowrooms/);
assert.match(featured, /sponsoredShowrooms=\{sponsoredShowrooms\}/);
assert.doesNotMatch(featured, /DiscoveryWorkspace discovery/);

assert.match(publicShell, /href: "\/", label: "Market"/);
assert.match(publicShell, /href: "\/featured", label: "Daily featured"/);
assert.match(publicShell, /href: "\/about", label: "About"/);
assert.doesNotMatch(publicShell, /href: "\/sponsors"/);
assert.match(publicShell, /aria-label="MirtPage public application"/);
assert.match(mobileNavigation, /href: "\/", label: "Market"/);
assert.match(mobileNavigation, /href: "\/about", label: "About"/);
assert.match(mobileNavigation, /aria-haspopup="dialog"/);
assert.match(mobileNavigation, /<span>More<\/span>/);
assert.doesNotMatch(mobileNavigation, /label: "Home"/);

assert.match(landingCss, /mirtpage-public-app-canvas-v1\.webp/);
assert.match(landingCss, /\.public-mobile-tabs \{ grid-template-columns: repeat\(4/);
assert.match(landingCss, /\.public-market-experience > \.discovery/);
assert.doesNotMatch(landingCss, /\.public-lobby/);

assert.match(discoveryUi, /const action = "\/"/);
assert.match(discoveryUi, /discovery-workbench/);
assert.match(discoveryUi, /discovery-industry-menu/);
assert.match(discoveryUi, /aria-label="Filter showrooms by industry"/);
assert.match(discoveryRuntime, /key: "all", label: "All industries"/);
assert.match(discoveryRuntime, /normalizeIndustryFilter/);
assert.match(discoveryRuntime, /export async function getMarketplaceDiscoveryView/);
assert.match(discoveryRuntime, /export async function getFeaturedShowroomsView/);
assert.match(discoveryRuntime, /export async function getSponsoredShowrooms/);
assert.match(discoveryUi, /discovery-filter-sheet/);
assert.match(discoveryUi, /Open industry and location filters/);
assert.match(discoveryUi, /discovery-mobile-map-toolbar/);
assert.match(discoveryUi, /discovery-mobile-view-tabs/);
assert.match(discoveryUi, /aria-label="Map view"/);
assert.match(discoveryUi, /aria-label="List view"/);
assert.match(discoveryUi, /export function FeaturedShowroomsWorkspace/);
assert.match(discoveryUi, /function SponsoredRail/);
assert.match(discoveryUi, /data-mobile-visible/);
assert.doesNotMatch(discoveryUi, /randomSponsorPair/);
assert.match(discoveryUi, /Daily featured showroom schedule/);
assert.match(discoveryUi, /Today’s featured showrooms/);
assert.doesNotMatch(discoveryUi, /"Weekly Expo schedule"|"Expo livestream status"|"Today’s Expo"|"Expo preview"|"This Expo floor/);
assert.match(discoveryRuntime, /title:\s*"Daily Featured Showrooms"/);
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
assert.match(discoveryUi, /buildExhibitionGridVenueLayout/);
assert.match(discoveryCss, /\.discovery-workbench\s*\{[^}]*grid-template-columns:\s*320px minmax\(0, 1fr\)/);
assert.match(discoveryCss, /\.public-market-experience \.discovery-marketplace,[\s\S]*height:\s*100%/);
assert.match(discoveryCss, /\.venue-zoom-toolbar\s*\{/);
assert.match(discoveryCss, /\.featured-booth-platform\s*\{/);
assert.match(discoveryCss, /\.featured-booth\.walkthrough-current/);
assert.match(discoveryCss, /\.featured-program-header\s*\{[^}]*border-bottom:\s*0/);
assert.match(discoveryCss, /\.discovery-filter-sheet::backdrop/);
assert.match(discoveryCss, /\.discovery-industry-menu\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*100%/);
assert.match(discoveryCss, /\.discovery-preview-scrim\s*\{[^}]*rgb\(11 29 58 \/ 14%\)/);
assert.match(discoveryUi, /Featured now/);
assert.match(discoveryUi, /data-presence/);
assert.doesNotMatch(discoveryUi, /rail\.scrollTo/);
assert.doesNotMatch(discoveryUi, /emphasizedFit|phoneMinimum/);

assert.match(showroomUi, /router\.back\(\)/);
assert.match(showroomUi, /mirtpage:last-marketplace-url:v1/);
assert.match(nextConfig, /geolocation=\(self\)/);
assert.doesNotMatch(nextConfig, /geolocation=\(\)/);

const images = [
  ["public/landing/mirtpage-public-app-canvas-v1.webp", 160_000],
  ["public/landing/mirtpage-about-production-v2.webp", 180_000],
  ["public/landing/mirtpage-workspace-context-v2.webp", 140_000],
];
for (const [file, maximum] of images) {
  const target = path.join(root, file);
  assert.ok(fs.existsSync(target), `${file} exists locally`);
  assert.ok(fs.statSync(target).size <= maximum, `${file} remains within its image budget`);
}

assert.match(about, /mirtpage-about-production-v2\.webp/);
assert.match(landingCss, /mirtpage-workspace-context-v2\.webp/);
assert.doesNotMatch(market + about + landingCss, /https?:\/\/[^"')]+\.(?:png|jpe?g|webp)/i);

console.log("Public marketplace composition contract tests passed.");
