const VERSION = "v1";
const CACHE_PREFIX = "mirtpage-pwa-";
const SHELL_CACHE = `${CACHE_PREFIX}shell-${VERSION}`;
const PAGE_CACHE = `${CACHE_PREFIX}pages-${VERSION}`;
const ASSET_CACHE = `${CACHE_PREFIX}assets-${VERSION}`;
const OFFLINE_URL = "/offline";
const APP_SHELL = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/brand/mirtpage-mark-v2.svg",
  "/pwa/icon-192.png",
  "/pwa/icon-512.png",
  "/pwa/icon-maskable-512.png"
];

const PRIVATE_PATHS = ["/api", "/dashboard", "/preview", "/login", "/request"];
const PUBLIC_PATHS = new Set(["/", "/about", "/discover", OFFLINE_URL, "/privacy", "/terms"]);

function isPrivatePath(pathname) {
  return PRIVATE_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isPublicNavigation(pathname) {
  return PUBLIC_PATHS.has(pathname) || /^\/@[^/]+$/.test(pathname);
}

async function putBounded(cacheName, request, response, limit) {
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - limit)).map((key) => cache.delete(key)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys()
    .then((names) => Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX) && ![SHELL_CACHE, PAGE_CACHE, ASSET_CACHE].includes(name)).map((name) => caches.delete(name))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api")) return;

  if (request.mode === "navigate") {
    if (isPrivatePath(url.pathname) || !isPublicNavigation(url.pathname)) {
      event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
      return;
    }
    event.respondWith(fetch(request)
      .then((response) => {
        if (response.ok && response.type === "basic") event.waitUntil(putBounded(PAGE_CACHE, request, response.clone(), 20));
        return response;
      })
      .catch(async () => (await caches.match(request)) || (await caches.match(OFFLINE_URL))));
    return;
  }

  const staticAsset = url.pathname.startsWith("/_next/static/")
    || ["style", "script", "image", "font"].includes(request.destination);
  if (!staticAsset || isPrivatePath(url.pathname)) return;
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok && response.type === "basic") event.waitUntil(putBounded(ASSET_CACHE, request, response.clone(), 80));
    return response;
  })));
});
