import assert from "node:assert/strict";
import { test } from "node:test";
import crypto from "node:crypto";
import fs from "node:fs";
import { productVideo, productVideoEmbedUrl, productVideoWatchUrl, normalizeProductVideoUrl } from "../lib/video/product-video";
import { approvedDemoVideo, DEMO_VIDEO_ASSETS } from "../lib/video/demo-video-catalog";
import { parseProductMedia } from "../lib/product-media";
import { parseShopPageContent } from "../lib/owner-page-domain";
import { parseDemoMediaCorrection } from "../lib/demo-media-correction";
import { demoPlayerHtml, demoPlayerNavigation, demoPlayerEvent } from "../apps/mobile/src/demo-player";

const ref = "demo:business-15";
const path = "/videos/demo/business-15.mp4";

test("a first-party demo ref constructs only a bounded local MP4 path", () => {
  assert.deepEqual(productVideo(ref), { provider: "demo", providerId: "business-15", managedRef: ref });
  assert.equal(productVideoWatchUrl(ref), path);
  assert.equal(productVideoEmbedUrl(ref), path);
  assert.equal(normalizeProductVideoUrl(path).managedRef, ref);
  for (const bad of [
    "demo:../secret", "demo:UPPER", "demo:x/y", "demo:-start", "demo:end-",
    "demo:" + "x".repeat(33), "demo:example.mp4",
  ]) assert.throws(() => productVideo(bad));
  for (const bad of [path + "?download=1", path + "#extra", "//elsewhere.example/videos/demo/x.mp4",
    "https://elsewhere.example" + path, "/videos/demo/../secret.mp4"])
    assert.throws(() => normalizeProductVideoUrl(bad));
});

test("published page and product media can read an internal demo ref", () => {
  assert.equal(parseShopPageContent({
    template: "profile-v1", coverStyle: "blended", introduction: "", about: "",
    heroImage: "", videoUrl: path,
  }).videoUrl, path);
  assert.deepEqual(parseProductMedia([{ kind: "video", ref }]), [{ kind: "video", ref }]);
});

test("approved footage is bound to one fictional business", () => {
  assert.equal(approvedDemoVideo(ref,15), true);
  assert.equal(approvedDemoVideo(ref,6), false);
  for (const slug of ["business-21", "business-21-oat", "business-21-citrus", "business-21-coffee", "business-21-guest"]) {
    assert.equal(approvedDemoVideo(`demo:${slug}`,21), true);
    assert.equal(approvedDemoVideo(`demo:${slug}`,22), false);
  }
  const request = {
    kind: "media_correction", operationKey: "s197_demo_preview_01", businessId: 15,
    handle: "demo-desta-injera-stove-works", ownerUserId: 1,
    providerUserId: "00000000-0000-0000-0000-000000000001",
    expectedHash: "a".repeat(64), expectedContentVersion: 1,
    expectedDraftVersion: 1, expectedPageRevision: 1,
    coverBefore: "https://www.youtube.com/watch?v=abcdefghijk",
    coverVideoRef: ref,
    products: [{ productId: 1, beforeMedia: [{ kind: "video", ref: "youtube:abcdefghijk" }],
      afterMedia: [{ kind: "video", ref }] }],
  };
  assert.equal(parseDemoMediaCorrection(request).coverVideoRef,ref);
  assert.throws(() => parseDemoMediaCorrection({...request,businessId:6}));
  assert.throws(() => parseDemoMediaCorrection({
    ...request, coverVideoRef: "demo:business-6",
  }));
});

test("one reviewed Liya request can bind its story and four distinct product clips", () => {
  const slugs=["oat","citrus","coffee","guest"];
  const request={kind:"media_correction",operationKey:"synthetic_liya_review_01",businessId:21,
    handle:"demo-liya-soap-kitchen",ownerUserId:1,
    providerUserId:"00000000-0000-4000-8000-000000000001",
    expectedHash:"a".repeat(64),expectedContentVersion:1,expectedDraftVersion:1,expectedPageRevision:1,
    coverBefore:"https://www.youtube.com/watch?v=abcdefghijk",coverVideoRef:"demo:business-21",
    products:slugs.map((slug,index)=>({productId:index+1,
      beforeMedia:[{kind:"image",ref:`/uploads/seed/portfolio/demo-liya-soap-kitchen/product-${index+1}.webp`},{kind:"video",ref:"youtube:abcdefghijk"}],
      afterMedia:[{kind:"image",ref:`/uploads/seed/portfolio/demo-liya-soap-kitchen/product-${index+1}.webp`},{kind:"video",ref:`demo:business-21-${slug}`}],
    })),
  };
  const parsed=parseDemoMediaCorrection(request);
  assert.equal(parsed.coverVideoRef,"demo:business-21");
  assert.deepEqual(parsed.products.map(product=>product.afterMedia[1].ref),slugs.map(slug=>`demo:business-21-${slug}`));
  assert.throws(()=>parseDemoMediaCorrection({...request,businessId:22}));
});

test("every admitted static asset matches its source and release ledger", () => {
  const ledger=JSON.parse(fs.readFileSync(new URL("../docs/operations/S197-DEMO-VIDEO-ASSETS.json",import.meta.url),"utf8"));
  assert.equal(ledger.assets.length,20);
  assert.equal(Object.keys(DEMO_VIDEO_ASSETS).length,20);
  for(const entry of ledger.assets){
    const asset=DEMO_VIDEO_ASSETS[entry.slug],file=new URL(`../public/videos/demo/${entry.slug}.mp4`,import.meta.url);
    assert.equal(asset.businessId,entry.businessId);
    assert.equal(asset.status,"approved");
    assert.equal(asset.sha256,entry.sha256);
    assert.equal(approvedDemoVideo(`demo:${entry.slug}`,entry.businessId),true);
    assert.equal(fs.statSync(file).size,entry.bytes);
    assert.equal(crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"),entry.sha256);
    assert.ok(entry.sourceBrief.startsWith("showroom-projects/"));
    assert.ok(fs.existsSync(new URL(`../${entry.sourceBrief}`,import.meta.url)));
    assert.ok(entry.sourceImages.length>0);
  }
});

test("Expo WebView accepts only its own origin and exact video", () => {
  const origin = "http://127.0.0.1:3104";
  const html = demoPlayerHtml("business-15", origin);
  assert.match(html, /<video[^>]*controls autoplay playsinline/);
  assert.ok(html.includes(origin + path));
  assert.equal(demoPlayerNavigation(origin + path, origin, "business-15"), true);
  assert.equal(demoPlayerNavigation(origin + "/", origin, "business-15"), true);
  for (const url of ["https://evil.example" + path, origin + path + "?x=1",
    origin + "/videos/demo/other.mp4", origin + "/api/private", "javascript:alert(1)"])
    assert.equal(demoPlayerNavigation(url, origin, "business-15"), false);
  assert.equal(demoPlayerEvent(JSON.stringify({ source: "africmade-demo-video", event: "ready" })), "ready");
  assert.equal(demoPlayerEvent(JSON.stringify({ source: "other", event: "ready" })), null);
});
