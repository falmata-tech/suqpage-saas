import assert from "node:assert/strict";
import fs from "node:fs";
// Brand contracts cover current surfaces, not historical docs or provider IDs.
const activeFiles = ["app", "components"].flatMap((root) => fs.readdirSync(root, { recursive: true })
  .filter((file) => /\.(tsx?|css)$/.test(file)).map((file) => `${root}/${file}`));
const violations = [];
for (const file of activeFiles) {
  if (/AfricMade|MirtPage/.test(fs.readFileSync(file, "utf8"))) violations.push(file);
}

assert.deepEqual(violations, [], `retired platform identity remains in: ${violations.join(", ")}`);
assert.equal(JSON.parse(fs.readFileSync("package.json", "utf8")).name, "suqpage-saas-mvp");
assert.ok(fs.existsSync("public/brand/suqpage-mark.svg"));
assert.ok(fs.existsSync("SUQPAGE-MASTER-PROMPT.md"));
const mark = fs.readFileSync("public/brand/suqpage-mark.svg", "utf8").toLowerCase();
assert.match(mark, /<title id="title">suqpage<\/title>/);
assert.ok(mark.includes("#ff4b00"));
const brand = fs.readFileSync("components/SuqpageBrand.tsx", "utf8");
assert.match(brand, /aria-label=\{t\("Suqpage home"\)\}/);
assert.match(brand, /<span>suq<\/span><span>page<\/span>/);
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
// FE-042 keeps the search surface inside the optional, labelled map drawer.
assert.match(discoveryWorkspace, /id="discovery-search-panel" className="discovery-summary discovery-search-panel"/);
assert.match(discoveryWorkspace, /aria-labelledby="discovery-panel-title" aria-hidden=\{!panelOpen\} inert=\{!panelOpen\}/);
assert.match(discoveryWorkspace, /className="discovery-search" role="search"/);
for (const publicRoute of ["app/(public)/page.tsx", "app/discover/page.tsx"]) {
  assert.doesNotMatch(fs.readFileSync(publicRoute, "utf8"), /query\.scale/);
}
for (const file of ["app/(public)/[handle]/page.tsx", "app/preview/[handle]/page.tsx"]) {
  const source = fs.readFileSync(file, "utf8");
  assert.match(source, /runtimePublishedPage\([^\n]+\|\| initialBusinessProfile\(catalog\)/);
  assert.match(source, /businessProfile=\{profile\}/);
}
console.log("Suqpage identity and shared public/preview renderer contracts passed.");
