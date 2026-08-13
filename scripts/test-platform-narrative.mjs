import assert from "node:assert/strict";
import fs from "node:fs";

function read(file) {
  return fs.readFileSync(file, "utf8");
}

const home = read("app/page.tsx");
const publicShell = read("components/PublicAppShell.tsx");
const discovery = read("components/DiscoveryWorkspace.tsx");
const about = read("app/about/page.tsx");
const signup = read("app/request/page.tsx");
const login = read("app/login/page.tsx");
const metadata = read("app/layout.tsx");
const publicNarrative = [home, publicShell, discovery, about, signup, login, metadata].join("\n");
const activeApplicationFiles = ["app", "components"]
  .flatMap((directory) => fs.readdirSync(directory, { recursive: true })
    .filter((file) => typeof file === "string" && /\.(?:tsx?|css)$/.test(file))
    .map((file) => `${directory}/${file}`));
const retiredEventTerms = [["ba", "zaar"].join(""), ["ex", "po"].join("")].join("|");
const retiredIdentityTerms = `${["s", "u", "q"].join("")}(?:page)?`;
const retiredProductLanguage = new RegExp(`\\b(?:${retiredEventTerms}|${retiredIdentityTerms})\\b`, "i");
const retiredIdentifierPrefix = new RegExp(`(?:${retiredEventTerms})(?:Day|[-_][a-z])`, "i");
const retiredGeneratedUrl = new RegExp(`(?:href|action)=?[^\\n]*(?:/(?:${retiredEventTerms})|ref=${["ex", "po"].join("")}|${["ex", "po", "Day"].join("")})`, "i");

for (const file of activeApplicationFiles) {
  assert.doesNotMatch(read(file), retiredProductLanguage, `${file} contains retired product language`);
}
for (const file of ["components/DiscoveryWorkspace.tsx", "lib/discovery.ts", "lib/featured-program.ts", "app/discovery.css"]) {
  assert.doesNotMatch(read(file), retiredIdentifierPrefix, `${file} contains a retired active identifier`);
}
assert.doesNotMatch(discovery, retiredGeneratedUrl);

assert.match(publicShell, /Online showrooms for Ethiopian production/);
assert.match(home, /Find Ethiopian makers and producers/);
assert.match(home, /online showrooms for custom work, ready products, and wholesale supply across Ethiopia/i);
assert.match(home, /<DiscoveryWorkspace discovery=\{discovery\} hideIntro \/>/);
assert.doesNotMatch(home, /Find what you need, directly from those who make it/);
assert.doesNotMatch(home, /landing-benefit|landing-producer-invitation/);
assert.match(discovery, /Online showrooms across Ethiopian production/);
assert.match(discovery, /Find businesses equipped to make or supply what you need/);
assert.match(discovery, /by product, skill, production capability, industry, or reviewed location/);

for (const commitment of ["equipment", "materials", "land", "training", "wages", "discipline"]) {
  assert.match(about, new RegExp(`\\b${commitment}\\b`), `About must acknowledge producer ${commitment}`);
}
assert.match(about, /A clearer market for the businesses that make Ethiopia&apos;s goods/);
assert.match(about, /online showrooms where households and trade buyers can discover what they make, understand their capabilities, and contact them directly/);
assert.match(about, /Good producers should not be difficult to find/);
assert.match(about, /aluminum workshop may make doors and windows to measurement/);
assert.match(about, /custom capabilities, ready products, or wholesale supply/);
assert.match(about, /commercial relationship stays with the producer/);
for (const action of ["Start with what you need", "Compare what businesses can deliver", "Understand the producer", "Start the conversation"]) {
  assert.match(about, new RegExp(action));
}

assert.match(signup, /Show buyers every way your business can make or supply/);
assert.match(signup, /custom orders, sell ready products, supply in bulk/);
assert.match(signup, /professional showroom inside the MirtPage marketplace/);
assert.match(signup, /Nothing appears publicly until you approve the design and MirtPage publishes it/);
assert.match(login, /Manage your showroom, customer inquiries, design requests/);
assert.match(login, /custom work, ready products, or wholesale supply/);
assert.match(metadata, /Explore online showrooms from Ethiopian workshops, producers, and manufacturers/);
assert.match(signup, /custom work/i);
assert.match(signup, /ready products/i);
assert.match(signup, /wholesale supply/i);

for (const weakPhrase of [
  /for the way you need to buy/i,
  /choose the right path/i,
  /according to your need/i,
]) {
  assert.doesNotMatch(publicNarrative, weakPhrase, `Public narrative contains weak or unclear copy: ${weakPhrase}`);
}

for (const overclaim of [
  /guaranteed sales/i,
  /every business pays taxes/i,
  /verified jobs/i,
  /certified by MirtPage/i,
  /shop now/i,
  /guaranteed (?:lower|better) prices/i,
  /guaranteed logistics savings/i,
]) {
  assert.doesNotMatch(publicNarrative, overclaim, `Public narrative contains prohibited overclaim: ${overclaim}`);
}

const showroomFiles = fs.readdirSync("components/showroom", { recursive: true })
  .filter((file) => typeof file === "string" && /\.(tsx?|css)$/.test(file))
  .map((file) => read(`components/showroom/${file}`))
  .join("\n");
for (const platformSlogan of [
  "Find what you need, directly from those who make it",
  "A clearer market for the businesses that make Ethiopia's goods",
  "Made in Ethiopia, for the way you need to buy",
  "From one custom order to a lasting supply relationship",
  "Different businesses make differently. Buyers still need one clear place to find them",
]) {
  assert.doesNotMatch(showroomFiles, new RegExp(platformSlogan), `Platform narrative leaked into client showrooms: ${platformSlogan}`);
}

console.log("MirtPage maker-first public narrative contract passed.");
