import crypto from "node:crypto";
import path from "node:path";
import { prepareUploadedImage } from "./media";
import { assertMediaObjectKey, getMediaObjectStore } from "./media-storage";

export const MAX_SUPPORT_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export class SupportAttachmentError extends Error {}

export type StagedSupportAttachment = {
  storageKey: string;
  originalName: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "application/pdf";
  byteSize: number;
  discard: () => Promise<void>;
};

function safeOriginalName(value: string) {
  const name = path.basename(value).replace(/[\u0000-\u001F\u007F]/g, "").trim();
  return name.slice(0, 180) || "attachment";
}

function verifiedPdf(buffer: Buffer, claimedType: string) {
  const startsAsPdf = buffer.length >= 10 && buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  const trailer = buffer.subarray(Math.max(0, buffer.length - 1024)).toString("latin1");
  if (!startsAsPdf || !trailer.includes("%%EOF")) {
    throw new SupportAttachmentError("Only valid JPEG, PNG, WebP, and PDF attachments are accepted.");
  }
  if (claimedType && claimedType !== "application/pdf") {
    throw new SupportAttachmentError("The uploaded file type does not match its contents.");
  }
  return { buffer, ext: "pdf" as const, mimeType: "application/pdf" as const };
}

export async function stageSupportAttachment(
  value: FormDataEntryValue | null,
): Promise<StagedSupportAttachment | null> {
  if (!(value instanceof File) || value.size === 0) return null;
  if (value.size > MAX_SUPPORT_ATTACHMENT_BYTES) {
    throw new SupportAttachmentError("Attachments must be 5 MB or smaller.");
  }
  const source = Buffer.from(await value.arrayBuffer());
  let prepared;
  try {
    prepared = value.type === "application/pdf" || source.subarray(0, 5).toString("ascii") === "%PDF-"
      ? verifiedPdf(source, value.type)
      : await prepareUploadedImage(source, value.type).then((image) => ({
        buffer: image.buffer,
        ext: image.ext,
        mimeType: image.mime,
      }));
  } catch (error) {
    if (error instanceof SupportAttachmentError) throw error;
    throw new SupportAttachmentError(error instanceof Error ? error.message : "The attachment could not be processed.");
  }
  const storageKey = `support-${crypto.randomUUID()}.${prepared.ext}`;
  await getMediaObjectStore().put("support", storageKey, prepared.buffer, prepared.mimeType);
  return {
    storageKey,
    originalName: safeOriginalName(value.name),
    mimeType: prepared.mimeType,
    byteSize: prepared.buffer.byteLength,
    discard: () => getMediaObjectStore().remove("support", [storageKey]),
  };
}

export async function readSupportAttachment(storageKey: string, mimeType: string) {
  try {
    assertMediaObjectKey(storageKey);
  } catch {
    return null;
  }
  return getMediaObjectStore().read("support", storageKey, mimeType);
}
