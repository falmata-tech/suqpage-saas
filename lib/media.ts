import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { mediaRoot } from "./config";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 20_000_000;
export type VerifiedImage = { ext: "jpg" | "png" | "webp"; mime: "image/jpeg" | "image/png" | "image/webp"; width?: number; height?: number };
export type PreparedImage = { buffer: Buffer; ext: VerifiedImage["ext"]; mime: VerifiedImage["mime"]; width: number; height: number };
export type StagedImage = {
  imageRef: string;
  digest: string;
  discard: () => void;
};

function jpegDimensions(buffer: Buffer) {
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset++; continue; }
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    if (length < 2) break;
    offset += 2 + length;
  }
  return undefined;
}

function webpDimensions(buffer: Buffer) {
  const type = buffer.toString("ascii", 12, 16);
  if (type === "VP8X" && buffer.length >= 30) {
    const width = 1 + buffer[24] + (buffer[25] << 8) + (buffer[26] << 16);
    const height = 1 + buffer[27] + (buffer[28] << 8) + (buffer[29] << 16);
    return { width, height };
  }
  const signature = buffer.indexOf(Buffer.from([0x9d,0x01,0x2a]), 20);
  if (signature > 0 && signature + 7 < buffer.length) {
    return { width: buffer.readUInt16LE(signature + 3) & 0x3fff, height: buffer.readUInt16LE(signature + 5) & 0x3fff };
  }
  return undefined;
}

export function verifyImage(buffer: Buffer, claimedType: string): VerifiedImage {
  let verified: VerifiedImage | null = null;
  if (buffer.length >= 24 && buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
    verified = { ext: "png", mime: "image/png", width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  } else if (buffer.length >= 12 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9) {
    verified = { ext: "jpg", mime: "image/jpeg", ...jpegDimensions(buffer) };
  } else if (buffer.length >= 20 && buffer.toString("ascii",0,4) === "RIFF" && buffer.toString("ascii",8,12) === "WEBP") {
    verified = { ext: "webp", mime: "image/webp", ...webpDimensions(buffer) };
  }
  if (!verified) throw new Error("Only valid JPEG, PNG, and WebP images are accepted.");
  if (claimedType && claimedType !== verified.mime) throw new Error("The uploaded file type does not match its contents.");
  if (verified.width && verified.height && verified.width * verified.height > MAX_IMAGE_PIXELS) throw new Error("Image dimensions are too large.");
  return verified;
}

async function decodeAndSanitize(buffer: Buffer, verified: VerifiedImage) {
  const source = sharp(buffer, {
    failOn: "warning",
    limitInputPixels: MAX_IMAGE_PIXELS,
    animated: false,
  });
  const metadata = await source.metadata();
  if (!metadata.width || !metadata.height) throw new Error("The image could not be decoded.");
  if (metadata.width * metadata.height > MAX_IMAGE_PIXELS) throw new Error("Image dimensions are too large.");
  if ((metadata.pages || 1) > 1) throw new Error("Animated images are not supported.");

  const normalized = source.rotate();
  let output: Buffer;
  if (verified.ext === "jpg") output = await normalized.jpeg({ quality: 88, progressive: true }).toBuffer();
  else if (verified.ext === "png") output = await normalized.png({ compressionLevel: 9 }).toBuffer();
  else output = await normalized.webp({ quality: 88 }).toBuffer();

  if (output.length > MAX_IMAGE_BYTES) throw new Error("The processed image is larger than 5 MB.");
  return { buffer: output, width: metadata.width, height: metadata.height };
}

export async function prepareUploadedImage(buffer: Buffer, claimedType: string): Promise<PreparedImage> {
  if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) throw new Error("Images must be 5 MB or smaller.");
  const verified = verifyImage(buffer, claimedType);
  const sanitized = await decodeAndSanitize(buffer, verified);
  return { ...sanitized, ext: verified.ext, mime: verified.mime };
}

export async function saveUploadedImage(file: FormDataEntryValue | null, existing = "", prefix = "product") {
  if (!(file instanceof File) || file.size === 0) return existing;
  const staged = await stageUploadedImage(file, prefix);
  return staged!.imageRef;
}

export async function stageUploadedImage(
  file: FormDataEntryValue | null,
  prefix = "product",
): Promise<StagedImage | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  const buffer = Buffer.from(await file.arrayBuffer());
  const prepared = await prepareUploadedImage(buffer, file.type);
  fs.mkdirSync(mediaRoot(), { recursive: true });
  const filename = `${prefix}-${crypto.randomUUID()}.${prepared.ext}`;
  const fullPath = path.join(mediaRoot(), filename);
  fs.writeFileSync(fullPath, prepared.buffer, { flag: "wx", mode: 0o640 });
  return {
    imageRef: `/media/${filename}`,
    digest: crypto.createHash("sha256").update(prepared.buffer).digest("hex"),
    discard: () => fs.rmSync(fullPath, { force: true }),
  };
}

export function resolveMediaFile(filename: string) {
  if (!/^[a-z0-9-]+-[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(filename)) return null;
  const root = mediaRoot();
  const full = path.resolve(/* turbopackIgnore: true */ root, filename);
  if (!full.startsWith(`${root}${path.sep}`)) return null;
  return full;
}

export function mediaMime(filename: string) {
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}
