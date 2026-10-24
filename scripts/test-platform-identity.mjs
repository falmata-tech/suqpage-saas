import assert from "node:assert/strict";
import fs from "node:fs";
// Old package names are protocol identities. Rendered labels must use AfricMade.
const activeFiles = ["app", "components"].flatMap((root) => fs.readdirSync(root, { recursive: true })
  .filter((file) => /\.(tsx?|css)$/.test(file)).map((file) => `${root}/${file}`));
const visibleOldBrand=[];
for(const file of activeFiles){
 const source=fs.readFileSync(file,"utf8");
 if(/(?:aria-label|alt|title|description)=[{]?[^\n]*\b(?:MirtPage|Suq[Pp]age)\b/.test(source))visibleOldBrand.push(file);
}
assert.deepEqual(visibleOldBrand,[],`Old customer-facing brand remains in: ${visibleOldBrand.join(", ")}`);
assert.equal(JSON.parse(fs.readFileSync("package.json", "utf8")).name, "suqpage-saas-mvp");
assert.ok(fs.existsSync("SUQPAGE-MASTER-PROMPT.md"));
assert.ok(fs.existsSync("public/brand/africmade-afro-mark-v1.png"));
const brand=fs.readFileSync("components/AfricMadeBrand.tsx","utf8");
assert.match(brand,/aria-label=\{t\("AfricMade home"\)\}/);
assert.match(brand,/PLATFORM_BRAND\.assets\.wordmark/);
assert.match(fs.readFileSync("components/SuqpageBrand.tsx","utf8"),/export \{ default \} from "\.\/AfricMadeBrand"/);
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
for (const file of ["app/(public)/[handle]/page.tsx", "app/preview/[handle]/page.tsx"]) {
  const source = fs.readFileSync(file, "utf8");
  assert.match(source, /runtimePublishedPage\([^\n]+\|\| initialBusinessProfile\(catalog\)/);
  assert.match(source, /businessProfile=\{profile\}/);
}
console.log("AfricMade identity and shared public/preview renderer contracts passed; technical package identity retained.");
