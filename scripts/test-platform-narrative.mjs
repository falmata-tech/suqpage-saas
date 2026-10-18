import assert from "node:assert/strict";
import fs from "node:fs";
import {TRANSPORT_COPY} from "../lib/i18n/transport-copy.ts";
import {MARKET_STOREFRONT_COPY,ABOUT_STOREFRONT_SECTIONS} from "../lib/storefront-copy.ts";

function read(file) {
  return fs.readFileSync(file, "utf8");
}

const home = read("app/(public)/page.tsx");
const publicFrame = read("components/PublicAppFrame.tsx");
const discovery = read("components/DiscoveryWorkspace.tsx");
const about = read("app/(public)/about/page.tsx") + read("components/AboutAudience.tsx");
const signup = read("app/(public)/request/page.tsx");
const signupForm = read("components/SignupForm.tsx");
const login = read("app/(public)/login/page.tsx");
const metadata = read("app/layout.tsx");
const support = [read("components/PublicSupportChat.tsx"), read("components/TransportIntake.tsx")].join("\n");
const businessPage = read("components/showroom/ShowroomApp.tsx");
const privacy = read("app/(public)/privacy/page.tsx");
const terms = read("app/(public)/terms/page.tsx");
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
  // BE-053 names the notification processor, not the retired Expo product.
  const source = file === 'app/(public)/privacy/page.tsx'
    ? read(file).replaceAll('Expo and Firebase Cloud Messaging', 'notification providers') : read(file);
  assert.doesNotMatch(source, retiredProductLanguage, `${file} contains retired product language`);
}
for (const file of ["components/DiscoveryWorkspace.tsx", "lib/discovery.ts", "lib/featured-program.ts", "app/discovery.css"]) {
  assert.doesNotMatch(read(file), retiredIdentifierPrefix, `${file} contains a retired active identifier`);
}
assert.doesNotMatch(discovery, retiredGeneratedUrl);

assert.match(home, /t\(MARKET_STOREFRONT_COPY.title\)/);
assert.match(home, /t\(MARKET_STOREFRONT_COPY.description\)/);
assert.equal(MARKET_STOREFRONT_COPY.title, 'A professional digital showroom for every business.');
assert.match(MARKET_STOREFRONT_COPY.description, /businesses sell, make and grow/);
assert.match(MARKET_STOREFRONT_COPY.description, /product range, collections, options and story/);
assert.match(MARKET_STOREFRONT_COPY.description, /availability it lists/, 'Availability remains the merchant’s declaration');
assert.match(MARKET_STOREFRONT_COPY.description, /contact the business directly/);
assert.match(MARKET_STOREFRONT_COPY.description, /without digging through social posts/, 'FE-070 retains the social-post fragmentation benefit');
// Latest FE-070 Ready requires range/options/story/listed availability and the
// direct-contact benefit;35–45 words admits those meanings without a long hero.
const heroWords=MARKET_STOREFRONT_COPY.description.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)||[];
assert.ok(heroWords.length>=35&&heroWords.length<=45, 'The buyer introduction stays within the FE-070 compact35–45-word brief');
assert.ok(MARKET_STOREFRONT_COPY.title.split(/\s+/).length<=9, 'Keep sector examples out of the short inclusive headline');
assert.doesNotMatch(storefrontCopy, /Send an inquiry on Suqpage|Receive inquiries linked/);
assert.doesNotMatch(publicNarrative, /See how close the businesses selling products|See what’s in store, near and far|See the collection\. Skip the scrolling\.|collections behind the social media posts/);
assert.match(home, /<DiscoveryWorkspace[\s\S]*discovery=\{discovery\}[\s\S]*hideIntro/);
assert.match(read("components/MarketSearchControls.tsx"), /Search businesses/);
assert.match(read("components/MarketSearchControls.tsx"), /Search products/);
assert.match(discovery, /Open page/);
// FE-030/S54: the list contains offerings; businesses remain map results.
assert.match(discovery, /className="discovery-results-heading">\{t\("Products"\)\}/);
assert.match(discovery, /useIndependentSearch\('businesses',businessSearch,discovery,initialBusiness\)/, "The shared active toolbar retains an independent business search controller");
assert.match(discovery, /marketSearchParams\('products',productSearch\)/, "The shared active toolbar retains a separate product feed/query");
assert.doesNotMatch(publicNarrative, /water bottling|bottled water|diaper (?:company|factory|manufacturer)/i);

assert.match(about, /ABOUT_STOREFRONT_SECTIONS/);
assert.match(storefrontCopy, /For customers/);
assert.match(storefrontCopy, /For businesses/);
assert.match(storefrontCopy, /collections, models, colors and styles/);
assert.match(storefrontCopy, /availability the business has listed/);
assert.match(storefrontCopy, /confirm the details before ordering/);
assert.match(storefrontCopy, /Describe options and any capacity or timing you list/);
assert.doesNotMatch(storefrontCopy, /real.time stock|verified capacity|inventory counts|automatically updated/i);
assert.match(storefrontCopy, /Discover businesses near and far on the map/);
assert.match(storefrontCopy, /professional digital showroom/);
assert.match(storefrontCopy, /No physical shop required/);
assert.match(storefrontCopy, /on your social accounts/);
assert.doesNotMatch(storefrontCopy, /verified businesses|guaranteed sales|public home address|free during|launch offer/i);
assert.doesNotMatch(storefrontCopy, /\binternet\b|products (?:and|&) services/i);
assert.equal(ABOUT_STOREFRONT_SECTIONS[0].title, 'Know what a business offers before you message.');
assert.equal(ABOUT_STOREFRONT_SECTIONS[1].title, 'Give your business a showroom worth sharing.');
assert.match(ABOUT_STOREFRONT_SECTIONS[1].description, /brand, story and product range/);
assert.match(ABOUT_STOREFRONT_SECTIONS[1].description, /contact you directly/);
const businessSupport=ABOUT_STOREFRONT_SECTIONS[1].benefits.map(benefit=>benefit.description).join(' ');
for(const audience of [/online sellers/i,/local shops/i,/workshops/i,/farms/i,/manufacturers/i,/suppliers/i])assert.match(businessSupport,audience,'Supporting About copy explicitly includes each business audience');
assert.match(businessSupport,/collections when useful/, 'Collections remain optional');
for (const file of ['app/(public)/login/page.tsx', 'apps/mobile/app/(tabs)/account.tsx']) {
  assert.match(read(file), /Create a showroom for what you sell, make or grow/);
  assert.doesNotMatch(read(file), /Give your social media customers an organized store/);
}
assert.doesNotMatch(storefrontCopy, /automatically import|guaranteed stock|checkout|TikTok Shop|products (?:and|&) services|provide a service/i);
assert.match(ABOUT_STOREFRONT_SECTIONS[1].description, /sell online or from a shop, make products or grow them/);
assert.match(storefrontCopy, /ready to ship or made to order/);
assert.doesNotMatch(read('apps/mobile/app/(tabs)/index.tsx'), /MARKET_STOREFRONT_COPY|setIntro|name="info"/, 'Native narrative is available on About without a redundant Market sheet');
assert.match(read('apps/mobile/app/(tabs)/about.tsx'), /ABOUT_STOREFRONT_SECTIONS/);
assert.match(about, /section.id\s*===\s*"customers"\s*\?\s*"\/"\s*:\s*"\/login"/);
assert.match(read('apps/mobile/app/(tabs)/about.tsx'), /section.id === "customers" \? "\/" : "\/account"/);
assert.doesNotMatch(about, /transport arrangements|report a concern|commercial terms|specifications, quantities/i, "About remains a vision story instead of a support or transaction policy");

assert.match(signup, /Set up your business/);
assert.match(signup, /name, category, and contact number/);
assert.match(signup, /Next, make the example page your own/);
assert.match(signupForm, />\{t\("Category"\)\}</);
assert.match(signupForm, /Finish setup/);
assert.doesNotMatch(signupForm, /requestText/);
assert.match(login, /Continue with email/);
assert.doesNotMatch(login, /Continue with Google|Use your Google account/);
assert.match(login, /New business\? Enter your email to create your account/);
assert.match(metadata, /t\(MARKET_STOREFRONT_COPY.title\)/);
assert.match(metadata, /t\(MARKET_STOREFRONT_COPY.description\)/);
assert.doesNotMatch(support, /Ask for help/);
assert.match(support, /t\(TRANSPORT_COPY.launcherTitle\)/);
assert.equal(TRANSPORT_COPY.launcherTitle, 'Want help with transport/shipping?');
assert.equal(TRANSPORT_COPY.launcherSubtitle, 'Chat live with our agents');
assert.match(support, /t\(TRANSPORT_COPY.launcherSubtitle\)/);
assert.match(support, /t\(TRANSPORT_COPY.invitation\)/);
assert.equal(TRANSPORT_COPY.invitation, 'Transport for your purchase');
assert.match(TRANSPORT_COPY.description, /where to pick it up and where it needs to go/);
assert.match(TRANSPORT_COPY.description, /agents will help arrange the transport/);
assert.doesNotMatch(Object.values(TRANSPORT_COPY).join(' '), /delivery|commission|brokerage|40\s*km|multiple modes/i);
assert.doesNotMatch(support, /Buying assistance/);
assert.match(support, /Live Chat/);
assert.match(support, /Start chat/);
assert.doesNotMatch(support, /visit a site|observe production|check a specific order/i);
// FE-041 replaces the repeated page footer with a direct link per selected product.
assert.match(businessPage, /buildInquiryMessage/);
const inquiryMessage = read("lib/product-inquiry.ts");
assert.match(inquiryMessage, /I'd like to ask about:/);
assert.match(inquiryMessage, /Are these available, and how can I order/);
assert.match(inquiryMessage, /productHref\(business.handle, item.id\)/);
assert.doesNotMatch(businessPage, /Showroom reference|online showroom/i);
for (const file of fs.readdirSync("public/landing/showroom-booths").filter((name) => name.endsWith(".svg"))) {
  const asset = read(`public/landing/showroom-booths/${file}`);
  assert.match(asset, /SUQPAGE/, `${file} retains its historical illustration identity until replacement media is reviewed`);
  assert.doesNotMatch(asset, /MIRTPAGE SHOWROOM/, `${file} has not been falsely relabelled as new MirtPage illustration evidence`);
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

console.log("FE-070 MirtPage inclusive product showrooms, merchant declarations and social-contact narrative passed; retained illustration assets are not new brand evidence.");
