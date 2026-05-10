// Grammar Hero · minimal Service Worker
// Hand-rolled (Serwist Turbopack ile uyumsuz olduğu için).
//
// Stratejiler:
// - Statik next/_next/static assetler → cache-first (immutable, hash'li)
// - Sayfalar (HTML) → network-first, ağ yoksa cache veya /offline fallback
// - API/auth/quiz → her zaman network (cache yok)

const VERSION = "v1";
const STATIC_CACHE = `gh-static-${VERSION}`;
const PAGES_CACHE = `gh-pages-${VERSION}`;
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PAGES_CACHE).then((cache) => cache.add(OFFLINE_URL).catch(() => undefined)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== PAGES_CACHE)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Skip auth, API and Next data routes — always network
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/") ||
    url.pathname.startsWith("/lesson/") // dinamik quiz state, cache'leme
  ) {
    return;
  }

  // Static immutable assets (cache-first)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const fresh = await fetch(req);
          if (fresh.ok) cache.put(req, fresh.clone()).catch(() => undefined);
          return fresh;
        } catch {
          return cached || Response.error();
        }
      })(),
    );
    return;
  }

  // Page navigations → network-first with offline fallback
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          if (fresh.ok) {
            const cache = await caches.open(PAGES_CACHE);
            cache.put(req, fresh.clone()).catch(() => undefined);
          }
          return fresh;
        } catch {
          const cache = await caches.open(PAGES_CACHE);
          const cached = await cache.match(req);
          return cached || cache.match(OFFLINE_URL) || Response.error();
        }
      })(),
    );
  }
});
