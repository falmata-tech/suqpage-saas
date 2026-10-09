import assert from "node:assert/strict";
import fs from "node:fs";
import {TRANSPORT_COPY} from "../lib/i18n/transport-copy.ts";

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
const storefrontCopy = read("lib/storefront-copy.ts");
const publicNarrative = [storefrontCopy, home, publicFrame, discovery, about, signup, signupForm, login, metadata, support, businessPage].join("\n");
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

assert.match(home, /t\(MARKET_STOREFRONT_COPY.title\)/);
assert.match(home, /t\(MARKET_STOREFRONT_COPY.description\)/);
assert.match(storefrontCopy, /Find the businesses you follow on social media/);
assert.match(storefrontCopy, /without getting lost in the clutter of social media posts/);
assert.match(home, /<DiscoveryWorkspace[\s\S]*discovery=\{discovery\}[\s\S]*hideIntro/);
assert.match(discovery, /Find businesses, products and services/);
assert.match(discovery, /Open page/);
// FE-030/S54: the list contains offerings; businesses remain map results.
assert.match(discovery, /className="discovery-results-heading">\{t\("Products & services"\)\}/);
assert.doesNotMatch(discovery, /label: t\("Businesses"\)/);
assert.doesNotMatch(discovery, /role="tablist"/);
assert.doesNotMatch(publicNarrative, /water bottling|bottled water|diaper (?:company|factory|manufacturer)/i);

assert.match(about, /ABOUT_STOREFRONT_SECTIONS/);
assert.match(storefrontCopy, /For customers/);
assert.match(storefrontCopy, /For businesses/);
assert.match(storefrontCopy, /Discover businesses on the map or open a store you already follow/);
assert.match(storefrontCopy, /TikTok, Telegram or WhatsApp/);
assert.match(storefrontCopy, /No physical shop required/);
assert.match(storefrontCopy, /on Suqpage or through its social channels/);
assert.doesNotMatch(storefrontCopy, /verified businesses|guaranteed sales|public home address|free during|launch offer/i);
assert.match(storefrontCopy, /professional online store/);
for (const file of ['apps/mobile/app/(tabs)/index.tsx', 'apps/mobile/app/(tabs)/about.tsx']) {
  assert.match(read(file), file.includes('index') ? /MARKET_STOREFRONT_COPY/ : /ABOUT_STOREFRONT_SECTIONS/);
}
assert.match(about, /section.id === "customers" \? "\/" : "\/login"/);
assert.match(read('apps/mobile/app/(tabs)/about.tsx'), /section.id === "customers" \? "\/" : "\/account"/);
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
assert.match(metadata, /t\(MARKET_STOREFRONT_COPY.title\)/);
assert.match(metadata, /t\(MARKET_STOREFRONT_COPY.description\)/);
assert.doesNotMatch(support, /Ask for help/);
assert.match(support, /t\(TRANSPORT_COPY.launcherTitle\)/);
assert.match(support, /t\(TRANSPORT_COPY.launcherSubtitle\)/);
assert.equal(TRANSPORT_COPY.launcherTitle, 'Need help with transport?');
assert.equal(TRANSPORT_COPY.launcherSubtitle, 'Let us handle it. Chat with our transport agents live');
assert.match(support, /t\(TRANSPORT_COPY.invitation\)/);
assert.match(TRANSPORT_COPY.description, /business on Suqpage/);
assert.match(TRANSPORT_COPY.description, /Chat with our transport team/);
assert.match(TRANSPORT_COPY.description, /help get your purchase to you/);
assert.doesNotMatch(Object.values(TRANSPORT_COPY).join(' '), /delivery|commission|brokerage|40\s*km|multiple modes/i);
assert.doesNotMatch(support, /Buying assistance/);
assert.match(support, /Live Chat/);
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
