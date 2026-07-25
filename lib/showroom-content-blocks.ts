export const SHOWROOM_CONTENT_BLOCK_SCHEMA_VERSION = 1;
export const MAX_SHOWROOM_CONTENT_BLOCKS = 24;
export const SHOWROOM_CONTENT_BLOCK_TYPES = ["hero", "story", "highlights", "information", "call_to_action", "video"] as const;

export type ShowroomContentBlockType = (typeof SHOWROOM_CONTENT_BLOCK_TYPES)[number];
export type ShowroomBlockMedia = { slotKey: string; assetKeys: string[]; altText: string; caption: string };
type BlockBase = { key: string; kicker: string; title: string; body: string; media: ShowroomBlockMedia[] };
export type ShowroomContentBlock =
  | (BlockBase & { type: "hero" })
  | (BlockBase & { type: "story"; quote: string })
  | (BlockBase & { type: "highlights"; items: Array<{ title: string; body: string }> })
  | (BlockBase & { type: "information"; items: Array<{ label: string; value: string }> })
  | (BlockBase & { type: "call_to_action"; action: "inquiry" | "contact" | "catalog"; actionLabel: string })
  | (BlockBase & { type: "video"; transcript: string });
export type ShowroomContentBlocksDocument = { schemaVersion: 1; blocks: ShowroomContentBlock[] };

export class ShowroomContentBlockError extends Error {
  constructor(message: string, public readonly path: string, public readonly code: string) {
    super(message); this.name = "ShowroomContentBlockError";
  }
}

const controlPattern = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const unsafePattern = /(?:<\/?[a-z][^>]*>|javascript:|data:|https?:\/\/)/i;
const keyPattern = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;
const opaqueAssetPattern = /^asset_[a-f0-9]{20}$/;
const managedAssetPattern = /^(?:\/uploads\/seed\/[A-Za-z0-9._/-]+|\/media\/[A-Za-z0-9.-]+|request-attachment:\d+|youtube:[A-Za-z0-9_-]{11})$/;
const fail = (message: string, path: string, code: string): never => { throw new ShowroomContentBlockError(message, path, code) };

function record(input: unknown, path: string, allowed: readonly string[]): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return fail("Expected an object.", path, "invalid_object");
  }
  const value = input as Record<string, unknown>;
  const unknown = Object.keys(value).find((entry) => !allowed.includes(entry));
  if (unknown) fail("Unsupported field.", `${path}.${unknown}`, "unknown_field");
  return value;
}
function text(input: unknown, path: string, maximum: number, required = false) {
  if (typeof input !== "string") return fail("Expected text.", path, "invalid_text");
  const value = input.trim();
  if ((required && !value) || value.length > maximum || controlPattern.test(value) || unsafePattern.test(value)) fail("Text is outside its safe limits.", path, "unsafe_text");
  return value;
}
function identifier(input: unknown, path: string) {
  const value = text(input, path, 80, true);
  if (!keyPattern.test(value)) fail("Expected a stable key.", path, "invalid_key");
  return value;
}
function list(input: unknown, path: string, maximum: number) {
  if (!Array.isArray(input) || input.length > maximum) return fail("Expected a bounded list.", path, "invalid_list");
  return input;
}
function parseMedia(input: unknown, path: string, mode: "opaque" | "managed"): ShowroomBlockMedia[] {
  const pattern = mode === "opaque" ? opaqueAssetPattern : managedAssetPattern;
  const media = list(input, path, 8).map((entry, index) => {
    const itemPath = `${path}[${index}]`;
    const item = record(entry, itemPath, ["slotKey", "assetKeys", "altText", "caption"]);
    const assetKeys = list(item.assetKeys, `${itemPath}.assetKeys`, 12).map((asset, assetIndex) => {
      if (typeof asset !== "string" || !pattern.test(asset)) fail("Media reference is not supported.", `${itemPath}.assetKeys[${assetIndex}]`, "invalid_asset");
      return asset;
    });
    if (!assetKeys.length || new Set(assetKeys).size !== assetKeys.length) fail("Media references must be unique and non-empty.", `${itemPath}.assetKeys`, "duplicate_asset");
    return { slotKey: identifier(item.slotKey, `${itemPath}.slotKey`), assetKeys, altText: text(item.altText, `${itemPath}.altText`, 240, true), caption: text(item.caption, `${itemPath}.caption`, 300) };
  });
  if (new Set(media.map((entry) => entry.slotKey)).size !== media.length) fail("Media slot keys must be unique per block.", path, "duplicate_slot");
  return media;
}
function parseBase(value: Record<string, unknown>, path: string, mode: "opaque" | "managed") {
  return { key: identifier(value.key, `${path}.key`), kicker: text(value.kicker, `${path}.kicker`, 100), title: text(value.title, `${path}.title`, 180, true), body: text(value.body, `${path}.body`, 3000), media: parseMedia(value.media, `${path}.media`, mode) };
}
function highlightItems(input: unknown, path: string) {
  const items = list(input, path, 8).map((entry, index) => { const p = `${path}[${index}]`; const value = record(entry, p, ["title", "body"]); return { title: text(value.title, `${p}.title`, 120, true), body: text(value.body, `${p}.body`, 600, true) } });
  if (!items.length) fail("Highlights need at least one item.", path, "required_items"); return items;
}
function informationItems(input: unknown, path: string) {
  const items = list(input, path, 12).map((entry, index) => { const p = `${path}[${index}]`; const value = record(entry, p, ["label", "value"]); return { label: text(value.label, `${p}.label`, 100, true), value: text(value.value, `${p}.value`, 500, true) } });
  if (!items.length) fail("Information needs at least one item.", path, "required_items"); return items;
}

export function parseShowroomContentBlocks(input: unknown, mode: "opaque" | "managed" = "opaque"): ShowroomContentBlocksDocument {
  const document = record(input, "$", ["schemaVersion", "blocks"]);
  if (document.schemaVersion !== SHOWROOM_CONTENT_BLOCK_SCHEMA_VERSION) fail("Content-block schema version is not supported.", "$.schemaVersion", "schema_version");
  const blocks = list(document.blocks, "$.blocks", MAX_SHOWROOM_CONTENT_BLOCKS).map((entry, index): ShowroomContentBlock => {
    const path = `$.blocks[${index}]`;
    const probe = record(entry, path, ["key", "type", "kicker", "title", "body", "media", "quote", "items", "action", "actionLabel", "transcript"]);
    if (typeof probe.type !== "string" || !SHOWROOM_CONTENT_BLOCK_TYPES.includes(probe.type as ShowroomContentBlockType)) fail("Content-block type is not supported.", `${path}.type`, "block_type");
    const type = probe.type as ShowroomContentBlockType;
    const allowed: Record<ShowroomContentBlockType, readonly string[]> = {
      hero: ["key", "type", "kicker", "title", "body", "media"], story: ["key", "type", "kicker", "title", "body", "media", "quote"],
      highlights: ["key", "type", "kicker", "title", "body", "media", "items"], information: ["key", "type", "kicker", "title", "body", "media", "items"],
      call_to_action: ["key", "type", "kicker", "title", "body", "media", "action", "actionLabel"], video: ["key", "type", "kicker", "title", "body", "media", "transcript"],
    };
    const value = record(entry, path, allowed[type]); const base = parseBase(value, path, mode);
    if (type === "hero") return { ...base, type };
    if (type === "story") return { ...base, type, quote: text(value.quote, `${path}.quote`, 500) };
    if (type === "highlights") return { ...base, type, items: highlightItems(value.items, `${path}.items`) };
    if (type === "information") return { ...base, type, items: informationItems(value.items, `${path}.items`) };
    if (type === "call_to_action") {
      if (!["inquiry", "contact", "catalog"].includes(String(value.action))) fail("Call-to-action behavior is not supported.", `${path}.action`, "invalid_action");
      return { ...base, type, action: value.action as "inquiry" | "contact" | "catalog", actionLabel: text(value.actionLabel, `${path}.actionLabel`, 80, true) };
    }
    if (base.media.length !== 1 || base.media[0].assetKeys.length !== 1) fail("Video blocks require exactly one media asset.", `${path}.media`, "video_media");
    return { ...base, type: "video", transcript: text(value.transcript, `${path}.transcript`, 4000) };
  });
  if (new Set(blocks.map((block) => block.key)).size !== blocks.length) fail("Content-block keys must be unique.", "$.blocks", "duplicate_key");
  return { schemaVersion: 1, blocks };
}
