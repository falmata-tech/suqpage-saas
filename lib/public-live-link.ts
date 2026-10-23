import { normalizeLiveUrl, type LivePlatform } from "./live-showroom";

/** Public presentation-only links fail closed when configuration is absent or invalid. */
export function publicLiveLink(value: unknown, platform: LivePlatform): string {
  try {
    return normalizeLiveUrl(value, platform);
  } catch {
    return "";
  }
}
