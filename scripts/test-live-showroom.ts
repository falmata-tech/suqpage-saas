import assert from "node:assert/strict";
import {
  LIVE_PLATFORM_LABELS,
  normalizeLiveUrl,
  validateLiveSettings,
} from "../lib/live-showroom";

assert.deepEqual(
  validateLiveSettings({
    isLive: true,
    platform: "tiktok",
    url: "https://www.tiktok.com/@maker/live#watch",
  }),
  {
    isLive: true,
    platform: "tiktok",
    url: "https://www.tiktok.com/@maker/live",
  },
);
assert.deepEqual(
  validateLiveSettings({
    isLive: false,
    platform: "google_meet",
    url: "https://meet.google.com/abc-defg-hij",
  }),
  {
    isLive: false,
    platform: "google_meet",
    url: "https://meet.google.com/abc-defg-hij",
  },
);
assert.equal(LIVE_PLATFORM_LABELS.youtube, "YouTube");

for (const [platform, url] of [
  ["tiktok", "http://www.tiktok.com/@maker/live"],
  ["facebook", "https://facebook.com.evil.test/live"],
  ["youtube", "https://vimeo.com/example"],
  ["google_meet", "https://user:password@meet.google.com/abc"],
] as const) {
  assert.throws(() => normalizeLiveUrl(url, platform), /valid .* HTTPS link/);
}
assert.throws(
  () => validateLiveSettings({ isLive: true, platform: "youtube", url: "" }),
  /needs both a platform and a valid link/,
);

console.log("Controlled live-showroom platform and URL validation passed.");
