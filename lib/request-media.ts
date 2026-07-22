import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { requestAttachmentRoot } from "./config";
import { prepareUploadedImage } from "./media";
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
    fs.mkdirSync(requestAttachmentRoot(), { recursive: true });
    fs.writeFileSync(path.join(requestAttachmentRoot(), storageKey), prepared.buffer, { flag: "wx", mode: 0o640 });
    return { ...prepared, storageKey, originalName: safeOriginalName(input.originalName) };
  }

  remove(storageKeys: string[]) {
    for (const storageKey of storageKeys) {
      const full = resolveRequestAttachment(storageKey);
      if (full) fs.rmSync(full, { force: true });
    }
  }
}

export function resolveRequestAttachment(storageKey: string) {
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(storageKey)) return null;
  const root = requestAttachmentRoot();
  const full = path.resolve(/* turbopackIgnore: true */ root, storageKey);
  return full.startsWith(`${root}${path.sep}`) ? full : null;
}
