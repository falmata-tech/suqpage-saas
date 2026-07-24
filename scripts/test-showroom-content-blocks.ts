import assert from "node:assert/strict";
import fs from "node:fs";
import { MAX_SHOWROOM_CONTENT_BLOCKS, ShowroomContentBlockError, parseShowroomContentBlocks } from "../lib/showroom-content-blocks";

const asset = "asset_0123456789abcdefabcd";
const hero = {
  key: "hero-main", type: "hero", kicker: "New collection",
  title: "Woven for daily life", body: "A supplied client story.",
  media: [{ slotKey: "hero_image", assetKeys: [asset], altText: "Folded woven fabric", caption: "" }],
} as const;
const document = {
  schemaVersion: 1,
  blocks: [
    hero,
    { key: "material-highlights", type: "highlights", kicker: "Materials", title: "The details", body: "", media: [], items: [{ title: "Texture", body: "A client-supplied factual description." }] },
    { key: "contact-next", type: "call_to_action", kicker: "", title: "Ask about the collection", body: "Build a product inquiry.", media: [], action: "inquiry", actionLabel: "Start an inquiry" },
    { key: "process-film", type: "video", kicker: "Process", title: "See how it is made", body: "", media: [{ slotKey: "video", assetKeys: [asset], altText: "Workshop process video", caption: "" }], transcript: "A reviewed transcript." },
  ],
} as const;

assert.deepEqual(parseShowroomContentBlocks(document), document);
assert.equal(parseShowroomContentBlocks({ schemaVersion: 1, blocks: [{ ...hero, media: [{ ...hero.media[0], assetKeys: ["youtube:dQw4w9WgXcQ"] }] }] }, "managed").blocks[0].media[0].assetKeys[0], "youtube:dQw4w9WgXcQ");

for (const invalid of [
  { ...document, blocks: [{ ...hero, title: "<script>alert(1)</script>" }] },
  { ...document, blocks: [{ ...hero, remoteUrl: "https://example.test/image.jpg" }] },
  { ...document, blocks: [{ ...hero, media: [{ ...hero.media[0], assetKeys: ["asset_unknown"] }] }] },
  { ...document, blocks: [hero, hero] },
  { ...document, blocks: [{ ...document.blocks[3], media: [] }] },
]) assert.throws(() => parseShowroomContentBlocks(invalid), (error: unknown) => error instanceof ShowroomContentBlockError);

assert.throws(
  () => parseShowroomContentBlocks({ schemaVersion: 1, blocks: Array.from({ length: MAX_SHOWROOM_CONTENT_BLOCKS + 1 }, (_, index) => ({ ...hero, key: `hero-${index}` })) }),
  (error: unknown) => error instanceof ShowroomContentBlockError && error.code === "invalid_list",
);

const portableSchema = JSON.parse(
  fs.readFileSync("showroom-sdk/showroom-content-blocks.schema.json", "utf8"),
) as {
  $schema?: string;
  additionalProperties?: boolean;
  properties?: { blocks?: { maxItems?: number; items?: { oneOf?: unknown[] } } };
  $defs?: { videoMedia?: { properties?: { assetKeys?: { minItems?: number; maxItems?: number } } } };
};
assert.equal(portableSchema.$schema, "https://json-schema.org/draft/2020-12/schema");
assert.equal(portableSchema.additionalProperties, false);
assert.equal(portableSchema.properties?.blocks?.maxItems, MAX_SHOWROOM_CONTENT_BLOCKS);
assert.equal(portableSchema.properties?.blocks?.items?.oneOf?.length, 6);
assert.equal(portableSchema.$defs?.videoMedia?.properties?.assetKeys?.minItems, 1);
assert.equal(portableSchema.$defs?.videoMedia?.properties?.assetKeys?.maxItems, 1);
console.log("Typed showroom content-block parsing, media modes, limits, and unsafe-input denial passed.");
