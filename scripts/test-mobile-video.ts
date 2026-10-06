import assert from "node:assert/strict";
import { test } from "node:test";
import {
  youtubeId,
  playerEvent,
  playerHtml,
  nativePlayerNavigation,
} from "../apps/mobile/src/youtube-player";
test("FE-053: only controlled YouTube references enter player HTML", () => {
  for (const ref of [
    "youtube:dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  ])
    assert.equal(youtubeId(ref), "dQw4w9WgXcQ");
  for (const ref of [
    "javascript:alert(1)",
    "https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ",
    "youtube:</script>",
    "https://youtube.com/watch?v=dQw4w9WgXcQ&list=secret",
    "youtube:",
    "https://name:pass@youtu.be/dQw4w9WgXcQ",
  ])
    assert.equal(youtubeId(ref), null);
  assert.throws(() => playerHtml("</script>", "https://suqpage.com"));
  assert.throws(() => playerHtml("dQw4w9WgXcQ", "javascript:alert(1)"));
  const html = playerHtml("dQw4w9WgXcQ", "https://com.suqpage.app");
  assert.match(html, /youtube-nocookie/);
  assert.match(html, /strict-origin-when-cross-origin/);
  assert.match(html, /playsinline:1,autoplay:0/);
  assert.doesNotMatch(html, /allow-popups|allow-top-navigation/);
});
test("FE-053: WebView cannot navigate to apps, external sites or YouTube watch pages", () => {
  const origin = "https://com.suqpage.app";
  for (const url of [
    "about:blank",
    origin + "/",
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?playsinline=1",
  ])
    assert.equal(nativePlayerNavigation(url, origin), true);
  for (const url of [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "youtube://dQw4w9WgXcQ",
    "intent://youtube",
    "https://evil.test/",
    "https://www.youtube-nocookie.com.evil.test/embed/dQw4w9WgXcQ",
    "https://x:y@www.youtube.com/embed/dQw4w9WgXcQ",
    "file:///etc/passwd",
    "javascript:alert(1)",
  ])
    assert.equal(nativePlayerNavigation(url, origin), false);
});
test("FE-053: bounded bridge accepts only readiness and playback failure", () => {
  for (const event of ["ready", "error"])
    assert.equal(
      playerEvent(JSON.stringify({ source: "suqpage-youtube", event })),
      event,
    );
  for (const value of [
    null,
    {},
    "x".repeat(200),
    "{}",
    '{"source":"evil","event":"ready"}',
    '{"source":"suqpage-youtube","event":"navigate"}',
  ])
    assert.equal(playerEvent(value), null);
});
