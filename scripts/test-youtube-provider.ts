import assert from "node:assert/strict";
import {
  ControlledYouTubeError,
  normalizeControlledYouTubeUrl,
  privacyEnhancedYouTubeEmbedUrl,
} from "../lib/youtube-provider";

const id = "dQw4w9WgXcQ";
assert.deepEqual(
  normalizeControlledYouTubeUrl(`https://www.youtube.com/watch?v=${id}&t=12&si=discarded`),
  { provider: "youtube", providerId: id, managedRef: `youtube:${id}` },
);
assert.deepEqual(
  normalizeControlledYouTubeUrl(`https://youtu.be/${id}?si=discarded`),
  { provider: "youtube", providerId: id, managedRef: `youtube:${id}` },
);
assert.equal(
  privacyEnhancedYouTubeEmbedUrl(`youtube:${id}`),
  `https://www.youtube-nocookie.com/embed/${id}`,
);

for (const value of [
  `http://youtube.com/watch?v=${id}`,
  `https://youtube.example/watch?v=${id}`,
  `https://youtube.com.evil.test/watch?v=${id}`,
  `https://youtube.com/embed/${id}`,
  `https://youtube.com/shorts/${id}`,
  `https://youtube.com/watch?v=${id}&list=PL123`,
  `https://youtube.com/watch?v=${id}&v=${id}`,
  `https://youtu.be/${id}/extra`,
  "https://youtu.be/not-valid",
  `<iframe src="https://youtube.com/embed/${id}"></iframe>`,
  `https://user:password@youtube.com/watch?v=${id}`,
]) {
  assert.throws(
    () => normalizeControlledYouTubeUrl(value),
    (error: unknown) => error instanceof ControlledYouTubeError,
  );
}
assert.throws(
  () => privacyEnhancedYouTubeEmbedUrl(`https://youtube.com/watch?v=${id}`),
  (error: unknown) =>
    error instanceof ControlledYouTubeError && error.code === "invalid_managed_ref",
);

console.log("Controlled YouTube URL normalization and privacy-enhanced embed derivation passed.");
