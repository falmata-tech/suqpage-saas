import { consumeRuntimeRateLimit } from "./rate-limit-runtime";
import type { RequestRateLimiter } from "./request-ports";

export class PublicRequestRateLimiter implements RequestRateLimiter {
  consume(ipHash: string) {
    return consumeRuntimeRateLimit(`public-request:${ipHash}`, 3, 60 * 60 * 1000, 60 * 60 * 1000);
  }
}
