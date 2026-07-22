import { consumeRateLimit } from "./rate-limit";
import type { RequestRateLimiter } from "./request-ports";

export class PublicRequestRateLimiter implements RequestRateLimiter {
  consume(ipHash: string) {
    return consumeRateLimit(`public-request:${ipHash}`, 3, 60 * 60 * 1000, 60 * 60 * 1000);
  }
}
