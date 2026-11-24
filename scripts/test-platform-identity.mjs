import assert from "node:assert/strict";
import fs from "node:fs";
// Persisted protocol identities are separate from repository and display names.
const activeFiles = ["app", "components"].flatMap((root) => fs.readdirSync(root, { recursive: true })
  .filter((file) => /\.(tsx?|css)$/.test(file)).map((file) => `${root}/${file}`));
const sdk = "showroom-sdk";
for (const name of fs.readdirSync(sdk).filter(name => name.endsWith(".schema.json"))) {
  const schema = JSON.parse(fs.readFileSync(sdk + "/" + name, "utf8"));
  assert.equal(schema.$id, "https://africmade.com/schemas/" + name);
  assert.match(schema.title, /^AfricMade /);
  assert.doesNotMatch(schema.description ?? "", /mirtpage|suqpage/i);
}
for (const name of ["README-AI-INTEGRATION.md", "sample-catalog.json"]) {
  assert.doesNotMatch(fs.readFileSync(sdk + "/" + name, "utf8"), /mirtpage|suqpage/i);
}
const visibleOldBrand=[];
for(const file of activeFiles){
 const source=fs.readFileSync(file,"utf8");
 if(/(?:aria-label|alt|title|description)=[{]?[^\n]*\b(?:MirtPage|Suq[Pp]age)\b/.test(source))visibleOldBrand.push(file);
}
assert.deepEqual(visibleOldBrand,[],`Old customer-facing brand remains in: ${visibleOldBrand.join(", ")}`);
assert.equal(JSON.parse(fs.readFileSync("package.json", "utf8")).name, "africmade-platform");
assert.ok(fs.existsSync("AFRICMADE-MASTER-PROMPT.md"));
assert.ok(fs.existsSync("public/brand/africmade-showroom-mark-v3.png"));
const brand=fs.readFileSync("components/AfricMadeBrand.tsx","utf8");
assert.match(brand,/aria-label=\{t\("AfricMade home"\)\}/);
assert.match(brand,/PLATFORM_BRAND\.assets\.wordmark/);
assert.equal(fs.existsSync("components/SuqpageBrand.tsx"),false);
assert.match(fs.readFileSync("components/PublicAppFrame.tsx","utf8"),/components\/AfricMadeBrand/);
for (const file of ["components/HandleField.tsx", "components/HandleSettingsForm.tsx"]) {
  const source = fs.readFileSync(file, "utf8");
  assert.match(source, /africmade\.com\/@/, `${file} shows the current public page address`);
  assert.doesNotMatch(source, /mirtpage\.com\/@/);
}
assert.match(fs.readFileSync("app/layout.tsx", "utf8"), /metadataBase:new URL\(publicSiteOrigin\(\)\)/);
const platformStyles = ["app/globals.css", "app/landing.css", "app/discovery.css"]
  .map((file) => fs.readFileSync(file, "utf8").toLowerCase())
  .join("\n");
for (const color of ["#202428", "#c93600", "#ff4b00", "#f4f4f2", "#fff0e8"]) {
  assert.ok(platformStyles.includes(color), `platform styles are missing ${color}`);
}
for (const retiredColor of ["#5b3df5", "#6240ad", "#6847ba", "#4f318f", "#543398", "#57369e"]) {
  assert.equal(platformStyles.includes(retiredColor), false, `retired platform color remains: ${retiredColor}`);
}
const showroomApp = fs.readFileSync("components/showroom/ShowroomApp.tsx", "utf8");
const showroomStyles = fs.readFileSync("components/showroom/showrooms.css", "utf8").toLowerCase();
assert.match(showroomApp, /className=\{`showroom-host-bar/);
assert.match(showroomApp, /showroom-host-bar-shell/);
assert.match(showroomApp, /aria-label=\{t\("Back to Market"\)\}/);
assert.match(showroomApp, />\{t\("Back to Market"\)\}</);
assert.doesNotMatch(showroomApp, /Powered by/);
assert.match(showroomApp, /style=\{runtimeTokenVariables as CSSProperties/);
assert.ok(showroomStyles.includes(".showroom-host-bar"));
assert.ok(showroomStyles.includes("background:rgb(255 255 255 / 96%)"));
assert.ok(showroomStyles.includes("outline:3px solid #ff4b00"));
const discoveryWorkspace = fs.readFileSync("components/DiscoveryWorkspace.tsx", "utf8");
assert.doesNotMatch(discoveryWorkspace, /aria-label="Production scale"/);
// FE-065 supersedes the old FE-042 shared drawer with independent labelled scopes.
assert.match(discoveryWorkspace, /id="discovery-search-panel" className=\{independentStyles\.panel\}/);
assert.match(discoveryWorkspace, /aria-label=\{t\('Products'\)\} aria-hidden=\{!panelOpen\} inert=\{!panelOpen\}/);
assert.match(discoveryWorkspace, /<MarketSearchControls[^\n]+scope=\{panelOpen\?'products':'businesses'\}/);
for (const publicRoute of ["app/(public)/page.tsx", "app/discover/page.tsx"]) {
  assert.doesNotMatch(fs.readFileSync(publicRoute, "utf8"), /query\.scale/);
}
const publicShowroom = fs.readFileSync("app/(public)/[handle]/page.tsx", "utf8");
const snapshot = fs.readFileSync("lib/public-showroom-runtime.ts", "utf8");
const preview = fs.readFileSync("app/preview/[handle]/page.tsx", "utf8");
assert.match(publicShowroom, /await runtimePublicShowroom\(handle\)/);
assert.match(snapshot, /await runtimePublishedPageState\(catalog.business.id\)/);
assert.match(snapshot, /profile:\s*published.content\s*\|\|\s*initialBusinessProfile\(catalog\)/);
assert.match(preview, /runtimePublishedPage\([^\n]+\|\| initialBusinessProfile\(catalog\)/);
for (const source of [publicShowroom, preview]) assert.match(source, /businessProfile=\{profile\}/);
console.log("AfricMade identity and shared public/preview renderer contracts passed.");
