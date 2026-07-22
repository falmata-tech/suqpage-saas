import { MAX_IMAGE_BYTES } from "./media";
import { MAX_REQUEST_IMAGES, parsePublicOnboardingInput, RequestError, type RequestImageInput } from "./request-domain";
import type { RequestAttachmentStore, RequestRateLimiter, RequestRepository, StoredRequestImage } from "./request-ports";

export async function createPublicOnboardingRequest(
  raw: Record<string, unknown>,
  images: RequestImageInput[],
  ipHash: string,
  dependencies: { repository: RequestRepository; attachments: RequestAttachmentStore; rateLimiter: RequestRateLimiter },
) {
  const input = parsePublicOnboardingInput(raw);
  if (images.length > MAX_REQUEST_IMAGES) throw new RequestError(`Attach no more than ${MAX_REQUEST_IMAGES} images.`);
  for (const image of images) {
    if (image.bytes.length === 0 || image.bytes.length > MAX_IMAGE_BYTES) throw new RequestError("Each image must be 5 MB or smaller.");
  }

  const existing = dependencies.repository.findPublicDuplicate(ipHash, input.idempotencyKey);
  if (existing) return { ...existing, duplicate: true };

  const rate = dependencies.rateLimiter.consume(ipHash);
  if (!rate.allowed) throw new RequestError("Too many requests. Try again later.", 429, rate.retryAfterSeconds);

  const stored: StoredRequestImage[] = [];
  try {
    for (const image of images) stored.push(await dependencies.attachments.save(image));
    const created = dependencies.repository.createPublicOnboarding(input, ipHash, stored);
    return { ...created, duplicate: false };
  } catch (error) {
    dependencies.attachments.remove(stored.map((image) => image.storageKey));
    const duplicate = dependencies.repository.findPublicDuplicate(ipHash, input.idempotencyKey);
    if (duplicate) return { ...duplicate, duplicate: true };
    if (error instanceof RequestError) throw error;
    throw new RequestError("The request could not be saved.", 500);
  }
}
