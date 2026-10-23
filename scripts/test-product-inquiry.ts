import fs from "node:fs";
import { createUiText } from "../lib/i18n/core";
import {publicationReadiness} from "../lib/publication-readiness";
import { socialContactLinks, parsePublicContacts, publicContactLinks } from "../lib/business-profile-contacts";
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildInquiryMessage, inquiryEligible, inquiryHandoffs, linkedProduct, MAX_INQUIRY_SELECTIONS, productHref, productSellingUnit, restoreInquiry, selectionKey, selectionOptions } from "../lib/product-inquiry";
import type { Business, Catalog, Product } from "../lib/types";
const business: Business = { id: 1, handle: "fixture-shop", name: "Fixture Shop", design_key: "composition", design_manifest_json: "{}", content_blocks_json: "{}", tagline: "", description: "", logo_path: "", hero_title: "", hero_subtitle: "", hero_image_path: "", contact_email: "private@example.test", public_email: "public@example.com", public_phone: "+447700900001", whatsapp: "", telegram: "", tiktok: "", process_video_ref: "", is_live: 0, live_platform: "", live_url: "", status: "active", site_title: "", site_description: "", favicon_path: "", content_version: 1 };
const product: Product = { id: 1, business_id: 1, collection_id: null, category_id: null, name: "Cup & saucer", slug: "cup", eyebrow: "", description: "A cup", image_path: "", video_ref: "", price_minor: null, currency: "ETB", quantity_unit: "piece", highlights_json: "[]", highlights: [], availability: "available", offering_kind: "standard_product", quantity_mode: "optional", capacity_summary: "retained", minimum_order_summary: "retained", lead_time_summary: "retained", is_published: 1, sort_order: 0, option_groups: [] };
const catalog: Catalog = { business, products: [product, { ...product, id: 2, business_id: 2 }, { ...product, id: 3, is_published: 0 }, { ...product, id: 4, availability: "unavailable" }], collections: [], categories: [] };
test("product URLs are tenant-bound, reloadable IDs without invented slugs", () => {
  assert.equal(productHref("fixture-shop", 1), "/@fixture-shop?product=1");
  assert.equal(linkedProduct(catalog, "1"), product);
  for (const value of [null, "", "2", "3", "99999", "1foo", "-1", "1&x=2", "01"]) assert.equal(linkedProduct(catalog, value), null);
  assert.equal(linkedProduct(catalog, "4")?.availability, "unavailable");
  assert.equal(inquiryEligible(catalog.products[3]), false);
});
test("selling units are concise without inferring bulk or production claims", () => {
  assert.equal(productSellingUnit(product), "By the piece");
  assert.equal(productSellingUnit({ quantity_unit: "bulk" }), "In bulk");
  assert.equal(productSellingUnit({ quantity_unit: "kg" }), "Sold by kg");
  assert.equal(productSellingUnit({ quantity_unit: "" }), "");
});
test("stored carts reject foreign, draft, unavailable, malformed and duplicate selections", () => {
  const raw = [null, false, { productId: 1, quantity: "2 pieces" }, { productId: 1, quantity: "forged duplicate" }, ...[2, 3, 4].map(productId => ({ productId })), { productId: 1, options: { injected: "x" } }];
  const restored = restoreInquiry(catalog, raw);
  assert.equal(restored.length, 1); assert.equal(restored[0].product, product); assert.equal(restored[0].quantity, "2 pieces");
  for (const raw of [null, {}, "bad"]) assert.deepEqual(restoreInquiry(catalog, raw), []);
  const many = Array.from({ length: 25 }, (_, i) => ({ ...product, id: i + 1 }));
  assert.equal(restoreInquiry({ ...catalog, products: many }, many.map(p => ({ productId: p.id }))).length, MAX_INQUIRY_SELECTIONS);
});
test("canonical options are complete, validated and stable across property order", () => {
  const optionProduct = { ...product, option_groups: [{ id: 1, product_id: 1, name: "Color", position: 0, values: [{ id: 1, option_group_id: 1, value: "Blue" }] }] };
  assert.equal(selectionOptions(optionProduct, {}), null);
  assert.equal(selectionOptions(optionProduct, { Color: "Red" }), null);
  assert.equal(selectionOptions(optionProduct, { Color: "Blue", forged: "x" }), null);
  assert.deepEqual(selectionOptions(optionProduct, { Color: "Blue" }), { Color: "Blue" });
  assert.equal(selectionKey(1, { B: "2", A: "1" }), selectionKey(1, { A: "1", B: "2" }));
});
test("single and grouped messages contain exact chosen products and linkable details", () => {
  const one = { product, options: {}, quantity: "2 pieces" };
  const two = { product: { ...product, id: 5, name: "Second item" }, options: {}, quantity: "" };
  const single = buildInquiryMessage(business, [one], "https://example.com");
  assert.ok(single.includes("Cup & saucer") && single.includes("Quantity: 2 pieces") && single.includes("?product=1"));
  assert.ok(!single.includes(two.product.name) && !single.includes(business.contact_email));
  assert.ok(buildInquiryMessage(business, [one, two], "https://example.com").includes("?product=5"));
});
test("only validated public contacts receive encoded app drafts; existing messaging contacts stay available", () => {
  assert.deepEqual(inquiryHandoffs({}, "Message"), []);
  const message = "Hello & café\nQuestion?";
  const links = inquiryHandoffs({ whatsapp: "+44 7700 900001", telegram: "@fixture_shop", phone: "+447700900002" }, message);
  assert.equal(links[0].href, `https://wa.me/447700900001?text=${encodeURIComponent(message)}`);
  assert.equal(links[1].href, `https://t.me/fixture_shop?text=${encodeURIComponent(message)}`);
  assert.equal(links[2].href, `sms:+447700900002?body=${encodeURIComponent(message)}`);
  assert.deepEqual(inquiryHandoffs({ phone: "+447700900002" }, message).map(l => l.label), ["SMS"]);
  assert.deepEqual(inquiryHandoffs({ telegram: "evil/?x=1", whatsapp: "1?text=x", phone: "javascript:alert(1)" }, message), []);
});

test("all five locales produce literal selections with a contextual message", () => {
  const seen = new Set<string>();
  for (const locale of ["en", "am", "om", "so", "ti"]) {
    const t = createUiText(locale === "en" ? {} : JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`, "utf8")));
    const message = buildInquiryMessage({ ...business, name: "Shop {value1}" }, [{ product: {...product, name: "Cup {value1}"}, options: { Color: "Blue & white" }, quantity: "2 kg" }], "https://suqpage.com/", t);
    assert.ok(message.startsWith(t("Hello {value1},", {value1:"Shop {value1}"})));
    assert.ok(message.includes("Cup {value1}") && message.includes("Color: Blue & white"));
    assert.ok(message.includes(`${t("Quantity")}: 2 kg`));
    assert.ok(message.includes("https://suqpage.com/@fixture-shop?product=1"));
    assert.ok(!message.includes(business.contact_email));
    seen.add(message);
  }
  assert.equal(seen.size, 5);
});
test("general inquiry gets a localized prepared message and showroom link without selected products",()=>{
  const seen=new Set<string>();
  for(const locale of ["en","am","om","so","ti"]){
    const t=createUiText(locale==="en"?{}:JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,"utf8")));
    const message=buildInquiryMessage(business,[],"https://mirtpage.com/",t);
    assert.ok(message.startsWith(t("Hello {value1},",{value1:business.name})));
    assert.ok(message.includes(t("Could you tell me what products are available and how I can order?")));
    assert.ok(message.includes("https://mirtpage.com/@fixture-shop"));
    assert.ok(!message.includes("Are these available"));
    seen.add(message);
  }
  assert.equal(seen.size,5);
});
test("only inbox providers prepare drafts; social profiles remain ordinary public links", () => {
  const contacts={phone:"+447700900002", email:"owner@example.test", website:"https://example.com", whatsapp:"+447700900001", telegram:"fixture_shop", instagram:"fixture_shop", tiktok:"fixture_shop", facebook:"fixture_shop"};
  const links=inquiryHandoffs(contacts, "Hello & ሰላም");
  assert.deepEqual(links.map(l=>l.kind),["whatsapp","telegram","phone"]);
  for(const link of links){
    const url=new URL(link.href);
    assert.equal(url.protocol,link.kind === "phone" ? "sms:" : "https:");
    if(["whatsapp","telegram"].includes(link.kind))assert.equal(url.searchParams.get("text"),"Hello & ሰላም");
    else if(link.kind!=="phone")assert.equal(url.search,"");
  }
  const profiles=publicContactLinks(contacts).filter(link=>["tiktok","instagram","facebook"].includes(link.kind));
  assert.equal(profiles.length,3);
  for(const link of profiles)assert.equal(new URL(link.href).search,"");
  assert.deepEqual(socialContactLinks({phone:contacts.phone,email:contacts.email,website:contacts.website}),[]);
});

test("explicit Telegram phone contacts preserve recipient and draft without accepting invite links",()=>{
  assert.equal(parsePublicContacts({telegram:"+44 (7700) 900-123"}).telegram,"+447700900123");
  const link=inquiryHandoffs({telegram:"+447700900123"},"Hello + ሰላም & inquiry")[0];
  assert.equal(link.href,"https://t.me/+447700900123?text="+encodeURIComponent("Hello + ሰላም & inquiry"));
  for(const invalid of ["+invite_hash","https://t.me/+447700900123","+123","+447700900123?text=forged","+447700900123\n"])
    assert.throws(()=>parsePublicContacts({telegram:invalid}),invalid);
  assert.equal(parsePublicContacts({telegram:"@fixture_shop"}).telegram,"fixture_shop");
});

test("first publication preserves the existing public contact contract", () => {
  const profile={template:"profile-v1" as const, coverStyle:"blended" as const, introduction:"", about:"Original business description", heroImage:"", videoUrl:""};
  const ready=(contacts:Record<string,string>)=>publicationReadiness({...profile,contacts},[product],true).find(c=>c.key==="contacts");
  assert.equal(ready({phone:"+251911222333"})?.ready,true);
  assert.equal(ready({instagram:"our_fixture_shop",phone:"+447700900123",email:"hello@example.invalid",website:"https://example.invalid"})?.ready,false);
  assert.equal(ready({whatsapp:"+447700900123",instagram:"our_fixture_shop"})?.ready,false);
  assert.equal(ready({whatsapp:"",instagram:"our_fixture_shop"})?.ready,true);
  assert.throws(()=>parsePublicContacts({instagram:"bad/?script"}));
  assert.equal(ready({instagram:"our_fixture_shop"})?.href,"#public-phone");
});
