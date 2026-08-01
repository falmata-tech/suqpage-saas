export const LIVE_PLATFORMS = ["tiktok", "facebook", "youtube", "google_meet"] as const;
export type LivePlatform = (typeof LIVE_PLATFORMS)[number];

export const LIVE_PLATFORM_LABELS: Record<LivePlatform, string> = {
  tiktok: "TikTok",
  facebook: "Facebook",
  youtube: "YouTube",
  google_meet: "Google Meet",
};

const platformHosts: Record<LivePlatform, readonly string[]> = {
  tiktok: ["tiktok.com", "www.tiktok.com"],
  facebook: ["facebook.com", "www.facebook.com", "fb.watch"],
  youtube: ["youtube.com", "www.youtube.com", "youtu.be"],
  google_meet: ["meet.google.com"],
};

export function normalizeLivePlatform(value: unknown): LivePlatform | "" {
  return LIVE_PLATFORMS.includes(value as LivePlatform) ? (value as LivePlatform) : "";
}

export function normalizeLiveUrl(value: unknown, platform: LivePlatform | ""): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (!platform) throw new Error("Choose a live platform before adding its link.");
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Enter a valid live-session link.");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !platformHosts[platform].includes(url.hostname.toLowerCase())
  ) {
    throw new Error(`Enter a valid ${LIVE_PLATFORM_LABELS[platform]} HTTPS link.`);
  }
  url.hash = "";
  return url.toString();
}

export function validateLiveSettings(input: {
  isLive: unknown;
  platform: unknown;
  url: unknown;
}) {
  const isLive = Boolean(input.isLive);
  const platform = normalizeLivePlatform(input.platform);
  const url = normalizeLiveUrl(input.url, platform);
  if (isLive && (!platform || !url)) {
    throw new Error("A live showroom needs both a platform and a valid link.");
  }
  return { isLive, platform, url };
}
