"use client";

import { useEffect } from "react";

const CACHE_PREFIX = "mirtpage-pwa-";

async function removeDevelopmentWorkers() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations
    .filter((registration) => registration.active?.scriptURL.endsWith("/sw.js") || registration.installing?.scriptURL.endsWith("/sw.js") || registration.waiting?.scriptURL.endsWith("/sw.js"))
    .map((registration) => registration.unregister()));
  if (!("caches" in window)) return;
  const names = await caches.keys();
  await Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX)).map((name) => caches.delete(name)));
}

export default function PwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_MIRTPAGE_PWA_ENABLED === "false") {
      void removeDevelopmentWorkers();
      return;
    }
    const register = async () => {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      await registration.update();
    };
    void register().catch(() => undefined);
  }, []);
  return null;
}
