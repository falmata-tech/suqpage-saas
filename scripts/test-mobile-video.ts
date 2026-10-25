import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createUiText } from "../lib/i18n/core";
import {
  youtubeId,
  playerEvent,
  playerHtml,
  nativePlayerNavigation,
} from "../apps/mobile/src/youtube-player";

test("FE-053 S146: empty native product gallery shows a localized no-photo state without controls", async () => {
  for (const [locale, expected] of [["am", "እስካሁን ፎቶ የለም"], ["om", "Suuraan hanga ammaatti hin jiru"]]) {
    const messages = JSON.parse(readFileSync(new URL(`../lib/i18n/messages/${locale}.json`, import.meta.url), "utf8"));
    assert.equal(createUiText(messages)("No photo yet"), expected);
  }
  const { build } = await import("esbuild");
  const vm = await import("node:vm");
  const result = await build({
    entryPoints: ["apps/mobile/src/Gallery.tsx"],
    bundle: true,
    platform: "node",
    format: "cjs",
    write: false,
    plugins: [{
      name: "native-gallery-ports",
      setup(port) {
        port.onResolve({ filter: /^(react(?:\/jsx-runtime)?|react-native|\.\/(?:YouTubeVideo|ui|runtime))$/ },
          (args) => ({ path: args.path, namespace: "gallery-port" }));
        port.onLoad({ filter: /.*/, namespace: "gallery-port" }, (args) => ({
          loader: "js",
          contents: args.path === "react"
            ? "export const useState=value=>[value,()=>{}],useRef=value=>({current:value});export default {};"
            : args.path === "react/jsx-runtime"
              ? "export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';"
              : args.path === "react-native"
                ? "export const View='View',Text='Text',ScrollView='ScrollView',Pressable='Pressable',Platform={OS:'web'},useWindowDimensions=()=>({width:390});"
                : args.path === "./runtime"
                  ? "export const useApp=()=>({t:key=>key});"
                  : args.path === "./ui"
                    ? "export const Photo='Photo',Button='Button',Copy='Copy',Icon='Icon',colors={soft:'#fff1e9',line:'#dbe2e3',muted:'#63737a',background:'#f7f9f8'},s={row:{}};"
                    : "export default 'YouTubeVideo';",
        }));
      },
    }],
  });
  type NativeNode = { type: string; props: Record<string, unknown> & { children?: unknown } };
  const module = { exports: {} as { default: (props: { media: Array<{ kind: "image" | "video"; ref: string }> }) => NativeNode } };
  vm.runInNewContext(result.outputFiles[0].text, { module, exports: module.exports });
  const nodes = (value: unknown): NativeNode[] => Array.isArray(value)
    ? value.flatMap(nodes)
    : value && typeof value === "object"
      ? [value as NativeNode, ...nodes((value as NativeNode).props.children)]
      : [];

  const empty = nodes(module.exports.default({ media: [] }));
  const fallback = empty.find((node) => node.props.testID === "offering-gallery-empty");
  assert.ok(fallback);
  assert.equal(fallback.props.accessibilityLabel, "No photo yet");
  assert.ok(empty.some((node) => node.type === "Text" && node.props.children === "No photo yet"));
  assert.ok(empty.some((node) => node.type === "Icon" && node.props.name === "package"));
  assert.ok(!empty.some((node) => ["ScrollView", "Photo", "Button"].includes(node.type)));

  const withPhoto = nodes(module.exports.default({ media: [{ kind: "image", ref: "/media/photo.png" }] }));
  assert.ok(withPhoto.some((node) => node.type === "ScrollView"));
  assert.ok(withPhoto.some((node) => node.type === "Photo" && node.props.refPath === "/media/photo.png"));
  assert.ok(!withPhoto.some((node) => node.props.testID === "offering-gallery-empty"));
});
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
  assert.throws(() => playerHtml("</script>", "https://mirtpage.com"));
  assert.throws(() => playerHtml("dQw4w9WgXcQ", "javascript:alert(1)"));
  const html = playerHtml("dQw4w9WgXcQ", "https://com.mirtpage.app");
  assert.match(html, /youtube-nocookie/);
  assert.match(html, /strict-origin-when-cross-origin/);
  assert.match(html, /playsinline:1,autoplay:0/);
  assert.doesNotMatch(html, /allow-popups|allow-top-navigation/);
  assert.match(html,/frame.onload=function\(\)\{send\('ready'\)/);
  assert.match(html,/onStateChange/);
  assert.doesNotMatch(html,/setAttribute\('sandbox'/);
  assert.match(html,/\[2,5,100,101,150,153\]/);
});
test("FE-053: WebView cannot navigate to apps, external sites or YouTube watch pages", () => {
  const origin = "https://com.mirtpage.app";
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

test("FE-070: native YouTube frame uses the AfricMade fallback and retains configured origins", async () => {
  const { build } = await import("esbuild");
  const vm = await import("node:vm");
  const result = await build({
    entryPoints: ["apps/mobile/src/YouTubeFrame.tsx"],
    bundle: true,
    platform: "node",
    format: "cjs",
    write: false,
    plugins: [{
      name: "youtube-frame-ports",
      setup(buildPort) {
        buildPort.onResolve(
          { filter: /^(react(?:\/jsx-runtime)?|react-native|react-native-webview|expo-constants)$/ },
          (args) => ({ path: args.path, namespace: "ports" }),
        );
        buildPort.onLoad({ filter: /.*/, namespace: "ports" }, (args) => ({
          loader: "js",
          contents: args.path === "react"
            ? "export const useMemo=fn=>fn();export default {};"
            : args.path === "react/jsx-runtime"
              ? "export const jsx=(type,props)=>({type,props}),jsxs=jsx;"
              : args.path === "react-native"
                ? "export const View='View',Platform={get OS(){return fixture.platform;}};"
                : args.path === "expo-constants"
                  ? "export default fixture.constants;"
                  : "export const WebView='WebView';",
        }));
      },
    }],
  });
  const fixture = {
    platform: "android",
    constants: {
      executionEnvironment: "standalone",
      expoConfig: null as null | {
        android?: { package?: string };
        ios?: { bundleIdentifier?: string };
      },
    },
  };
  const module = {
    exports: {} as {
      default: (props: { id: string; height: number; onEvent: () => void }) => {
        props: { children: { props: Record<string, unknown> } };
      };
    },
  };
  vm.runInNewContext(result.outputFiles[0].text, {
    module, exports: module.exports, fixture, URL, URLSearchParams,
  });

  for (const { environment, platform, packageId, expected } of [
    { environment: "standalone", platform: "android", packageId: undefined, expected: "https://com.africmade.app" },
    { environment: "standalone", platform: "android", packageId: "com.africmade.app", expected: "https://com.africmade.app" },
    { environment: "standalone", platform: "android", packageId: "com.suqpage.app", expected: "https://com.suqpage.app" },
    { environment: "storeClient", platform: "android", packageId: undefined, expected: "https://host.exp.exponent" },
    { environment: "standalone", platform: "ios", packageId: undefined, expected: "https://com.africmade.app" },
  ]) {
    fixture.platform = platform;
    fixture.constants.executionEnvironment = environment;
    fixture.constants.expoConfig = packageId
      ? platform === "ios"
        ? { ios: { bundleIdentifier: packageId } }
        : { android: { package: packageId } }
      : null;
    const webView = module.exports.default({
      id: "dQw4w9WgXcQ", height: 240, onEvent: () => {},
    }).props.children.props;
    const source = webView.source as { baseUrl: string; html: string };
    assert.equal(source.baseUrl, expected + "/");
    assert.ok(source.html.includes(`"origin":"${expected}"`));
    const permits = webView.onShouldStartLoadWithRequest as
      (request: { url: string }) => boolean;
    assert.equal(permits({ url: expected + "/" }), true);
    assert.equal(permits({ url: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" }), true);
    for (const url of [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://evil.test/",
      expected + "/account",
    ]) assert.equal(permits({ url }), false, url);
    assert.equal(webView.sharedCookiesEnabled, false);
    assert.equal(webView.thirdPartyCookiesEnabled, false);
  }
});
