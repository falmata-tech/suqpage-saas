import crypto from "node:crypto";
import path from "node:path";
import { requestAttachmentRoot } from "./config";
import { prepareUploadedImage } from "./media";
import { assertMediaObjectKey, getMediaObjectStore } from "./media-storage";
import { RequestError, type RequestImageInput } from "./request-domain";
import type { RequestAttachmentStore, StoredRequestImage } from "./request-ports";

function safeOriginalName(value: string) {
  return path.basename(value).replace(/[\u0000-\u001F\u007F]/g, "").slice(0, 180) || "image";
}

export class FileRequestAttachmentStore implements RequestAttachmentStore {
  async save(input: RequestImageInput): Promise<StoredRequestImage> {
    let prepared;
    try {
      prepared = await prepareUploadedImage(input.bytes, input.claimedType);
    } catch (error) {
      throw new RequestError(error instanceof Error ? error.message : "The image could not be processed.");
    }
    const storageKey = `${crypto.randomUUID()}.${prepared.ext}`;
    await getMediaObjectStore().put("requests", storageKey, prepared.buffer, prepared.mime);
    return { ...prepared, storageKey, originalName: safeOriginalName(input.originalName) };
  }

  async remove(storageKeys: string[]) {
    await getMediaObjectStore().remove("requests", storageKeys);
  }
}

export function resolveRequestAttachment(storageKey: string) {
  try { assertMediaObjectKey(storageKey); } catch { return null; }
  const root = requestAttachmentRoot();
  const full = path.resolve(/* turbopackIgnore: true */ root, storageKey);
  return full.startsWith(`${root}${path.sep}`) ? full : null;
}

export async function readRequestAttachment(storageKey: string, mime: string) {
  try {
    assertMediaObjectKey(storageKey);
  } catch {
    return null;
  }
  return getMediaObjectStore().read("requests", storageKey, mime);
}
