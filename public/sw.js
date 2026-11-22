const VERSION = "v5";
importScripts('/attention-push.js');

const CACHE_PREFIX = "africmade-pwa-";
const SHELL_CACHE = `${CACHE_PREFIX}shell-${VERSION}`;
const ASSET_CACHE = `${CACHE_PREFIX}assets-${VERSION}`;
const OFFLINE_URL = "/offline";
const APP_SHELL = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/brand/africmade-showroom-mark-v3.png",
  "/pwa/africmade-icon-v4-192.png",
  "/pwa/africmade-icon-v4-512.png",
  "/pwa/africmade-maskable-v4-512.png"
];
const STATIC_DESTINATIONS = new Set(["style", "script", "font"]);

async function putBounded(cache, request, response, limit) {
  await cache.put(request, response);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - limit)).map((key) => cache.delete(key)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE)
    .then((cache) => cache.addAll(APP_SHELL.map((path) => new Request(new URL(path, self.location.origin), {credentials:"omit"}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys()
    .then((names) => Promise.all(names.filter((name) => [CACHE_PREFIX, "suqpage-pwa-", "mirtpage-pwa-"].some((prefix) => name.startsWith(prefix)) && ![SHELL_CACHE, ASSET_CACHE].includes(name)).map((name) => caches.delete(name))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || /^\/api(?:\/|$)/.test(url.pathname)) return;

  // Market and showroom HTML can contain session-aware navigation.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(async () => {
      const shell = await caches.open(SHELL_CACHE);
      return (await shell.match(OFFLINE_URL)) || Response.error();
    }));
    return;
  }

  if (!url.pathname.startsWith("/_next/static/") || !STATIC_DESTINATIONS.has(request.destination)) return;
  event.respondWith(caches.open(ASSET_CACHE).then(async (cache) => {
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && response.type === "basic" && !response.redirected && !/private|no-store/i.test(response.headers.get("cache-control") || "")) {
      await putBounded(cache, request, response.clone(), 80).catch(() => {});
    }
    return response;
  }));
});
