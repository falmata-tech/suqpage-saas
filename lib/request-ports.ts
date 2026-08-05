import type { PublicInterestInput, RequestImageInput } from "./request-domain";

export type StoredRequestImage = {
  buffer: Buffer;
  ext: "jpg" | "png" | "webp";
  mime: "image/jpeg" | "image/png" | "image/webp";
  width: number;
  height: number;
  storageKey: string;
  originalName: string;
};

export type PublicRequestRecord = {
  id: number;
  publicRef: string;
};

export interface RequestRepository {
  findPublicDuplicate(ipHash: string, idempotencyKey: string): PublicRequestRecord | undefined | Promise<PublicRequestRecord | undefined>;
  createPublicInterest(input: PublicInterestInput, ipHash: string): PublicRequestRecord | Promise<PublicRequestRecord>;
}

export interface RequestAttachmentStore {
  save(input: RequestImageInput): Promise<StoredRequestImage>;
  remove(storageKeys: string[]): Promise<void>;
}

export interface RequestRateLimiter {
  consume(ipHash: string): { allowed: boolean; retryAfterSeconds: number } | Promise<{ allowed: boolean; retryAfterSeconds: number }>;
}
