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
assert.match(privacy, /staff authorized by an administrator can manage business pages/);
assert.match(privacy, /Staff cannot change an owner's private sign-in email/);
assert.match(privacy, /stores your name, phone number, message and selected products privately/);
assert.match(privacy, /that business and its authorized managers to follow up/);
assert.match(privacy, /This is not live chat/);
assert.match(privacy, /external contact option instead, the message is sent through that service/);
assert.match(privacy, /company name, contact name, email, optional phone number and message privately/);
assert.match(privacy, /current platform administrators/);
assert.match(privacy, /up to 90 days/);
assert.match(privacy, /does not create a provider account/);
assert.doesNotMatch(privacy, /MirtPage does not receive that message|new messages are no longer accepted there/);
assert.match(terms, /send an inquiry for the business to follow up/);
assert.match(terms, /Business inquiries are not live chat/);
assert.match(terms, /Business owners can add products, prepare and publish their showroom/);
assert.match(terms, /Platform staff authorized by an administrator may help manage business pages/);
assert.match(terms, /MirtPage helps connect you with independent logistics providers/);
assert.match(terms, /Use transport chat to discuss options with the provider you select/);
assert.doesNotMatch(privacy + terms, /grant or revoke staff assistance|owner saves update the live page without staff approval|product inquiries, and support conversations|Transport and delivery assistance/i);
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
assert.equal(MARKET_STOREFRONT_COPY.title, 'Find local makers and suppliers for your next order.');
assert.match(MARKET_STOREFRONT_COPY.description, /products in digital showrooms from farms, workshops, factories and shops/);
assert.match(MARKET_STOREFRONT_COPY.description, /styles and listed availability/);
assert.match(MARKET_STOREFRONT_COPY.description, /large orders or made-to-order items/);
assert.match(MARKET_STOREFRONT_COPY.description, /without digging through social posts/);
// Keep the hero readable while explicitly inviting questions about larger orders.
const heroWords=MARKET_STOREFRONT_COPY.description.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)||[];
assert.ok(heroWords.length<=30, 'The landing introduction stays short enough to preserve discovery room');
assert.ok(MARKET_STOREFRONT_COPY.title.split(/\s+/).length<=10, 'Keep the local maker-and-supplier headline concise');
assert.doesNotMatch(publicNarrative, /See how close the businesses selling products|See what’s in store, near and far|See the collection\. Skip the scrolling\.|collections behind the social media posts/);
assert.match(home, /<DiscoveryWorkspace[\s\S]*discovery=\{discovery\}[\s\S]*hideIntro/);
assert.match(read("components/MarketSearchControls.tsx"), /Search businesses/);
assert.match(read("components/MarketSearchControls.tsx"), /Search products/);
assert.match(discovery, /Open page/);
// FE-030/S54: the list contains offerings; businesses remain map results.
assert.match(discovery, /className="discovery-results-heading">\{t\("Products"\)\}/);
assert.match(discovery, /useIndependentSearch\('businesses',businessSearch,discovery,initialBusiness,exclusionKey,initialExclusionKey\)/, "The shared active toolbar retains an independent business search controller");
assert.match(discovery, /marketSearchParams\('products',productSearch\)/, "The shared active toolbar retains a separate product feed/query");
assert.doesNotMatch(publicNarrative, /water bottling|bottled water|diaper (?:company|factory|manufacturer)/i);

assert.match(about, /ABOUT_STOREFRONT_SECTIONS/);
assert.match(storefrontCopy, /For customers/);
assert.match(storefrontCopy, /For businesses/);
const customerCopy=ABOUT_STOREFRONT_SECTIONS[0],businessCopy=ABOUT_STOREFRONT_SECTIONS[1];
const customerSupport=customerCopy.benefits.map(benefit=>benefit.description).join(' ');
const businessSupport=[businessCopy.description,...businessCopy.benefits.map(benefit=>benefit.description)].join(' ');
assert.match(customerCopy.description,/nearby farms grow and workshops or factories make/);
assert.match(customerCopy.description,/shops and importers carry/);
assert.match(customerSupport,/business’s story.*products, photos and videos/);
assert.match(customerSupport,/products, colors, sizes and optional collections/);
assert.match(customerSupport,/listed availability/,'Availability remains the business declaration');
assert.match(customerSupport,/larger quantities/,'Customers can ask about larger orders');
assert.match(customerSupport,/made-to-order items/);
assert.match(customerCopy.benefits[2].description,/selected products.*MirtPage Inbox or use its social links/);
assert.match(customerCopy.benefits[2].description,/business can follow up with you/,'Inquiry acceptance does not promise a reply');
assert.match(businessCopy.benefits[2].description,/send selected products to your MirtPage Inbox/);
assert.match(businessCopy.benefits[2].description,/You handle the conversation and final sale/);
assert.match(businessCopy.description,/farms, workshops and factories to local shops and importers/);
assert.match(businessCopy.description,/digital showroom for their story and products/);
assert.doesNotMatch(storefrontCopy,/live business chat|instant reply|real.time stock|verified capacity|inventory counts|automatically updated/i);
assert.match(storefrontCopy,/Find businesses near and far/);
assert.match(storefrontCopy,/digital showroom/);
assert.doesNotMatch(storefrontCopy,/verified businesses|guaranteed sales|public home address|free during|launch offer/i);
assert.doesNotMatch(storefrontCopy,/\binternet\b|products (?:and|&) services/i);
assert.equal(customerCopy.title,'Browse the products before you reach out.');
assert.equal(businessCopy.title,'Give customers one place to see what you offer.');
assert.match(businessCopy.description,/grow, make, source, import or sell/);
for(const audience of [/shops|retailers|sellers/i,/workshops/i,/farms|growers/i,/factories|manufacturers/i,/suppliers/i])assert.match(businessSupport,audience,'About includes business breadth outside the hero');
assert.match(businessSupport,/Use collections if they help/,'Collections remain optional');
for (const file of ['app/(public)/login/page.tsx','apps/mobile/app/(tabs)/account.tsx']) {
  assert.match(read(file),/Sign in to MirtPage\./);
  assert.match(read(file),/Use your email to sign in or create an account\./);
  assert.doesNotMatch(read(file),/Your business\. Your digital showroom\.|Create a showroom for your business story|New business\? Enter your email/);
  assert.doesNotMatch(read(file),/Give your social media customers an organized store/);
}
assert.doesNotMatch(storefrontCopy,/automatically import|guaranteed stock|checkout|TikTok Shop|products (?:and|&) services|provide a service/i);
assert.ok(!MARKET_STOREFRONT_COPY.description.includes('name and phone'),'Form instructions belong to the inquiry task, not the hero');
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
assert.match(login, /Enter your email to get started\./);
assert.match(metadata, /t\(MARKET_STOREFRONT_COPY.title\)/);
assert.match(metadata, /t\(MARKET_STOREFRONT_COPY.description\)/);
assert.doesNotMatch(support, /Ask for help/);
assert.match(support, /t\(TRANSPORT_COPY.launcherTitle\)/);
assert.equal(TRANSPORT_COPY.launcherTitle, 'Need Transport?');
assert.equal(TRANSPORT_COPY.launcherSubtitle, 'Talk to a live transport agent');
assert.match(support, /t\(TRANSPORT_COPY.launcherSubtitle\)/);
assert.match(support, /t\(TRANSPORT_COPY.invitation\)/);
assert.equal(TRANSPORT_COPY.invitation, 'Need to move goods?');
assert.match(TRANSPORT_COPY.description, /pickup and destination/);
assert.match(TRANSPORT_COPY.description, /A live transport agent can discuss options with the provider you choose/);
assert.doesNotMatch(Object.values(TRANSPORT_COPY).join(' '), /SharedTrucks Logistics|MirtPage.?s transport team/);
assert.equal(TRANSPORT_COPY.title, 'Transport chat');
assert.doesNotMatch(Object.values(TRANSPORT_COPY).join(' '), /delivery|commission|brokerage|40\s*km|multiple modes/i);
assert.doesNotMatch(support, /Buying assistance/);
assert.match(support, /t\(TRANSPORT_COPY\.title\)/);
assert.match(support, /Start chat/);
assert.doesNotMatch(support, /visit a site|observe production|check a specific order/i);
const directory=read('app/(public)/showrooms/page.tsx');
assert.match(directory,/No public business showrooms are listed yet\./);
assert.match(directory,/Browse product listings/);
assert.match(directory,/href="\/\?view=search"/);
assert.doesNotMatch(directory,/Explore example showrooms in the Market/);
assert.match(discovery,/Example product/);
assert.match(discovery,/Example showroom/);
assert.match(read('components/FeaturedShowroomsWorkspace.tsx'),/Example showroom/);
assert.match(read('apps/mobile/app/(tabs)/featured.tsx'),/Example showroom/);
assert.match(read('components/showroom/ShowroomApp.tsx'),/Example showroom\. This business and its products are fictional\./);
assert.match(read('components/showroom/BusinessProfile.tsx'),/Example product/);
assert.match(read('apps/mobile/src/ShowroomContent.tsx'),/Example product/);
assert.match(read('apps/mobile/src/ShowroomContent.tsx'),/This business and its products are fictional/);
assert.doesNotMatch(read('scripts/setup.ts'),/Custom inquiry|Standard/,'Demo setup does not seed generic database-like product choices');
// FE-041 replaces the repeated page footer with a direct link per selected product.
assert.match(businessPage, /buildInquiryMessage/);
const inquiryMessage = read("lib/product-inquiry.ts");
assert.match(inquiryMessage, /I'd like to ask about:/);
assert.match(inquiryMessage, /Are these available, and how can I order/);
assert.match(inquiryMessage, /productHref\(business.handle, item.id\)/);
assert.doesNotMatch(businessPage, /Showroom reference|online showroom/i);
const demoBoothFiles = fs.readdirSync("public/landing/showroom-booths").filter((name) => name.endsWith(".svg"));
assert.equal(demoBoothFiles.length, 58, 'all generated demo booths remain present');
for (const file of demoBoothFiles) {
  const asset = read(`public/landing/showroom-booths/${file}`);
  assert.match(asset, /font-size="40"[^>]*>MirtPage<\/text>/, `${file} shows a card-readable MirtPage facade label`);
  assert.doesNotMatch(asset, /SUQPAGE/i, `${file} does not display the previous platform name`);
}
const boothGenerator = read('scripts/materialize-demo-client-portfolio.ts');
assert.match(boothGenerator, />MirtPage<\/text>/, 'demo regeneration emits the current facade label');
assert.doesNotMatch(boothGenerator, />SUQPAGE(?: PAGE)?<\/text>/, 'demo regeneration cannot restore the old facade label');

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

console.log("FE-070 MirtPage showroom narrative and all 58 illustrative demo booth labels passed.");
