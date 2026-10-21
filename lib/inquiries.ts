export type InquiryInput = { businessId?: unknown; customerName?: unknown; contact?: unknown; contactMethod?: unknown; note?: unknown; items?: unknown; idempotencyKey?: unknown; website?: unknown };

export class InquiryError extends Error {
  constructor(message: string, public status = 400, public retryAfter = 0) { super(message); }
}

export async function createPublicInquiry(input: InquiryInput, ipHash: string) {
  const { postgresRuntimeServices } = await import("./postgres-runtime-services");
  const { createPostgresPublicInquiry } = await import("./inquiries-postgres");
  return createPostgresPublicInquiry(postgresRuntimeServices().runner, input, ipHash);
}
