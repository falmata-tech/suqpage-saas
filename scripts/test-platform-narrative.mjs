import assert from "node:assert/strict";
import fs from "node:fs";

function read(file) {
  return fs.readFileSync(file, "utf8");
}

const home = read("app/(public)/page.tsx");
const publicFrame = read("components/PublicAppFrame.tsx");
const discovery = read("components/DiscoveryWorkspace.tsx");
const about = read("app/(public)/about/page.tsx");
const signup = read("app/request/page.tsx");
const signupForm = read("components/SignupForm.tsx");
const login = read("app/login/page.tsx");
const metadata = read("app/layout.tsx");
const support = read("components/PublicSupportChat.tsx");
const businessPage = read("components/showroom/ShowroomApp.tsx");
const publicNarrative = [home, publicFrame, discovery, about, signup, signupForm, login, metadata, support, businessPage].join("\n");
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

assert.match(home, /Find locally made and grown products/);
assert.match(home, /artisans, farms, workshops, and small manufacturers/);
assert.match(home, /contact them directly/);
assert.match(home, /<DiscoveryWorkspace[\s\S]*discovery=\{discovery\}[\s\S]*hideIntro/);
assert.match(discovery, /Search local products and skills/);
assert.match(discovery, /Open page/);
assert.match(discovery, /label: "Products"/);
assert.match(discovery, /label: "Businesses"/);
assert.doesNotMatch(publicNarrative, /water bottling|bottled water|diaper (?:company|factory|manufacturer)/i);

assert.match(about, /A stronger market starts closer to home/);
assert.match(about, /artisans, farms, workshops, and small manufacturers/);
assert.match(about, /Remarkable work should not depend on word of mouth/);
assert.match(about, /one map, one page for each business, and a direct path from discovery to conversation/);
assert.match(about, /starting in Ethiopia, with a wider African market in view/);
for (const action of ["Find what is already here", "See the work behind it", "Build direct relationships", "Put your work where buyers can find it"]) {
  assert.match(about, new RegExp(action));
}
assert.doesNotMatch(about, /transport arrangements|report a concern|commercial terms|specifications, quantities/i, "About remains a vision story instead of a support or transaction policy");

assert.match(signup, /Set up your AfricMade account/);
assert.match(signup, /Add the name, category, and contact details for your work/);
assert.match(signup, /You can create an AfricMade page after setup/);
assert.match(signupForm, />Category</);
assert.match(signupForm, /Finish setup/);
assert.doesNotMatch(signupForm, /requestText/);
assert.match(login, /Use a one-time email code or Google/);
assert.match(login, /Verify your email or Google account, then add your work and contact details/);
assert.match(metadata, /Find locally made and grown products/);
assert.match(support, /AfricMade help or report/);
assert.match(support, /Transport arrangements/);
assert.doesNotMatch(support, /visit a site|observe production|check a specific order/i);
assert.match(businessPage, /AfricMade page:/);
assert.doesNotMatch(businessPage, /Showroom reference|online showroom/i);
for (const file of fs.readdirSync("public/landing/showroom-booths").filter((name) => name.endsWith(".svg"))) {
  const asset = read(`public/landing/showroom-booths/${file}`);
  assert.match(asset, /AFRICMADE PAGE/, `${file} carries the current platform identity`);
  assert.doesNotMatch(asset, /MIRTPAGE SHOWROOM/, `${file} contains no retired platform label`);
}

for (const weakPhrase of [
  /for the way you need to buy/i,
  /choose the right path/i,
  /according to your need/i,
  /find the people and businesses that make/i,
  /for workshops, producers, and manufacturers/i,
  /tell us whether you take custom orders/i,
  /Ethiopia launch · East African market/i,
  /being connected for launch/i,
]) {
  assert.doesNotMatch(publicNarrative, weakPhrase, `Public narrative contains weak or superseded copy: ${weakPhrase}`);
}

for (const overclaim of [
  /guaranteed sales/i,
  /every business pays taxes/i,
  /verified jobs/i,
  /certified by AfricMade/i,
  /shop now/i,
  /guaranteed (?:lower|better) prices/i,
  /guaranteed logistics savings/i,
]) {
  assert.doesNotMatch(publicNarrative, overclaim, `Public narrative contains prohibited overclaim: ${overclaim}`);
}

console.log("AfricMade small-scale local production narrative contract passed.");
