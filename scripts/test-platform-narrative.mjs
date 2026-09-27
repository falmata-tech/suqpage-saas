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
const privacy = read("app/privacy/page.tsx");
const terms = read("app/terms/page.tsx");
assert.doesNotMatch(privacy + terms, /page project|private project|design is imported/i);
assert.match(privacy, /account email and phone remain private/);
assert.match(privacy, /grant or revoke staff assistance/);
assert.match(terms, /publish it when ready/);
assert.match(terms, /owner saves update the live page without staff approval/);
const publicNarrative = [home, publicFrame, discovery, about, signup, signupForm, login, metadata, support, businessPage].join("\n");
const activeApplicationFiles = ["app", "components"]
  .flatMap((directory) => fs.readdirSync(directory, { recursive: true })
    .filter((file) => typeof file === "string" && /\.(?:tsx?|css)$/.test(file))
    .map((file) => `${directory}/${file}`));
const retiredEventTerms = [["ba", "zaar"].join(""), ["ex", "po"].join("")].join("|");
const retiredProductLanguage = new RegExp(`\\b(?:${retiredEventTerms})\\b`, "i");
const retiredIdentifierPrefix = new RegExp(`(?:${retiredEventTerms})(?:Day|[-_][a-z])`, "i");
const retiredGeneratedUrl = new RegExp(`(?:href|action)=?[^\\n]*(?:/(?:${retiredEventTerms})|ref=${["ex", "po"].join("")}|${["ex", "po", "Day"].join("")})`, "i");

for (const file of activeApplicationFiles) {
  assert.doesNotMatch(read(file), retiredProductLanguage, `${file} contains retired product language`);
}
for (const file of ["components/DiscoveryWorkspace.tsx", "lib/discovery.ts", "lib/featured-program.ts", "app/discovery.css"]) {
  assert.doesNotMatch(read(file), retiredIdentifierPrefix, `${file} contains a retired active identifier`);
}
assert.doesNotMatch(discovery, retiredGeneratedUrl);

assert.match(home, /Everything a business offers, in one place/);
assert.match(home, /Discover businesses near you\. Explore their story, products, services and capabilities/);
assert.match(home, /<DiscoveryWorkspace[\s\S]*discovery=\{discovery\}[\s\S]*hideIntro/);
assert.match(discovery, /Find businesses, products and services/);
assert.match(discovery, /Open page/);
assert.match(discovery, /label: t\("Products & services"\)/);
assert.match(discovery, /label: t\("Businesses"\)/);
assert.doesNotMatch(publicNarrative, /water bottling|bottled water|diaper (?:company|factory|manufacturer)/i);

assert.match(about, /Local businesses\. Easier to find/);
assert.match(about, /manufacturers, makers, retailers and home businesses/);
assert.match(about, /online showroom for their products and services/);
assert.match(about, /shopfront without a physical store/);
assert.match(about, /extend your existing shop online/);
assert.doesNotMatch(about, /Already have a shop\?|Selling from home\?/);
assert.match(about, /Find businesses in Ethiopia, see what they offer, and contact them directly\./);
assert.doesNotMatch(about, /free during|pricing|launch offer/i, 'FE-052: no platform pricing claims');
assert.match(about, /African businesses|businesses across Africa/);
assert.match(about, /Give customers one place to explore your business and what you offer/);
assert.match(about, /Receive inquiries on Suqpage or through your social channels/);
assert.match(about, /Daily Featured/);
for (const action of ["Find a business", "See what they offer", "Ask the business", "Make your business easier to find"]) {
  assert.match(about, new RegExp(action));
}
assert.doesNotMatch(about, /transport arrangements|report a concern|commercial terms|specifications, quantities/i, "About remains a vision story instead of a support or transaction policy");

assert.match(signup, /Set up your business/);
assert.match(signup, /name, category, and contact number/);
assert.match(signup, /Next, make the example page your own/);
assert.match(signupForm, />\{t\("Category"\)\}</);
assert.match(signupForm, /Finish setup/);
assert.doesNotMatch(signupForm, /requestText/);
assert.match(login, /Use a one-time email code\./);
assert.doesNotMatch(login, /Continue with Google|Use your Google account/);
assert.match(login, /New business\? Enter your email to create your account/);
assert.match(metadata, /Discover businesses, products and services/);
assert.doesNotMatch(support, /Ask for help/);
assert.match(support, /Buying assistance/);
assert.match(support, /Live chat/);
assert.match(support, /Start chat/);
assert.doesNotMatch(support, /visit a site|observe production|check a specific order/i);
// FE-041 replaces the repeated page footer with a direct link per selected product.
assert.match(businessPage, /buildInquiryMessage/);
const inquiryMessage = read("lib/product-inquiry.ts");
assert.match(inquiryMessage, /I'd like to ask about:/);
assert.match(inquiryMessage, /Please confirm availability and the next steps/);
assert.match(inquiryMessage, /productHref\(business.handle, line.product.id\)/);
assert.doesNotMatch(businessPage, /Showroom reference|online showroom/i);
for (const file of fs.readdirSync("public/landing/showroom-booths").filter((name) => name.endsWith(".svg"))) {
  const asset = read(`public/landing/showroom-booths/${file}`);
  assert.match(asset, /SUQPAGE/, `${file} carries the current platform identity`);
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
  /certified by (?:AfricMade|Suqpage)/i,
  /shop now/i,
  /guaranteed (?:lower|better) prices/i,
  /guaranteed logistics savings/i,
]) {
  assert.doesNotMatch(publicNarrative, overclaim, `Public narrative contains prohibited overclaim: ${overclaim}`);
}

console.log("Suqpage African business, product/service and direct-inquiry narrative contract passed.");
