import { parsePublicInterestInput, RequestError } from "./request-domain";
import type { RequestRateLimiter, RequestRepository } from "./request-ports";

export async function createPublicInterest(
  raw: Record<string, unknown>,
  ipHash: string,
  dependencies: { repository: RequestRepository; rateLimiter: RequestRateLimiter },
) {
  const input = parsePublicInterestInput(raw);
  const existing = dependencies.repository.findPublicDuplicate(ipHash, input.idempotencyKey);
  if (existing) return { ...existing, duplicate: true };

  const rate = dependencies.rateLimiter.consume(ipHash);
  if (!rate.allowed) throw new RequestError("Too many requests. Try again later.", 429, rate.retryAfterSeconds);

  try {
    const created = dependencies.repository.createPublicInterest(input, ipHash);
    return { ...created, duplicate: false };
  } catch (error) {
    const duplicate = dependencies.repository.findPublicDuplicate(ipHash, input.idempotencyKey);
    if (duplicate) return { ...duplicate, duplicate: true };
    if (error instanceof RequestError) throw error;
    throw new RequestError("The interest request could not be saved.", 500);
  }
}
