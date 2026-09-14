import crypto from "node:crypto";
import { MAX_IMAGE_BYTES, mediaMime, prepareUploadedImage } from "./media";
import type { MediaObjectStore } from "./media-storage";
import { OwnerPageError, ownerPageImageKey } from "./owner-page-domain";
import { readOwnerPage, type OwnerPagePort } from "./owner-page-service";
import type { SessionUser } from "./types";

export { ownerPageImageKey } from "./owner-page-domain";

export async function uploadOwnerPageImage(
  port: OwnerPagePort, store: MediaObjectStore, actor: SessionUser, businessId: number,
  input: { bytes: Buffer; claimedType: string },
): Promise<string> {
  await readOwnerPage(port, actor, businessId);
  let image;
  try { image = await prepareUploadedImage(input.bytes, input.claimedType); }
  catch { throw new OwnerPageError("Choose a valid JPEG, PNG or WebP image, up to 5 MB and 20 megapixels."); }
  await readOwnerPage(port, actor, businessId);
  const key = `page-${businessId}-${crypto.randomUUID()}.${image.ext}`;
  await store.put("pages", key, image.buffer, image.mime);
  try { await readOwnerPage(port, actor, businessId); }
  catch (error) { await store.remove("pages", [key]); throw error; }
  return `/api/page-drafts/${businessId}/media/${key}`;
}

export async function readOwnerPageImage(
  port: OwnerPagePort, store: MediaObjectStore, actor: SessionUser, businessId: number, ref: string,
) {
  await readOwnerPage(port, actor, businessId);
  const key = ownerPageImageKey(businessId, ref);
  if (!key) throw new OwnerPageError("Image not found.", 404);
  const image = await store.read("pages", key, mediaMime(key));
  await readOwnerPage(port, actor, businessId);
  if (!image) throw new OwnerPageError("Image not found.", 404);
  return image;
}

export async function readCoverUpload(request: Request): Promise<File> {
  const contentType = request.headers.get("content-type") || "";
  if (!/^multipart\/form-data;/i.test(contentType)) throw new OwnerPageError("Choose an image file.", 415);
  const maximum = MAX_IMAGE_BYTES + 32_000;
  const length = Number(request.headers.get("content-length") || 0);
  if (!Number.isSafeInteger(length) || length < 0 || length > maximum) throw new OwnerPageError("Images must be 5 MB or smaller.", 413);
  if (!request.body) throw new OwnerPageError("Choose an image file.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) { await reader.cancel(); throw new OwnerPageError("Images must be 5 MB or smaller.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  let form;
  try { form = await new Response(Buffer.concat(chunks), { headers: { "Content-Type": contentType } }).formData(); }
  catch { throw new OwnerPageError("The image upload could not be read. Choose the file again."); }
  const file = form.get("file");
  if ([...form.keys()].length !== 1 || !(file instanceof File) || !file.size) throw new OwnerPageError("Choose one image file.");
  if (file.size > MAX_IMAGE_BYTES) throw new OwnerPageError("Images must be 5 MB or smaller.", 413);
  return file;
}
