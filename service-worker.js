/* نور القلوب — service-worker.js (OFFLINE READY) */
const CACHE_NAME = "noor-al-qulub-v2";

const ASSETS = [
  "/",
  "/index.html",
  "/404.html",
  "/offline.html",
  "/styles.css",
  "/manifest.json",
  "/robots.txt",
  "/sitemap.xml",

  "/js/main.js",
  "/js/accessibility.js",
  "/js/form.js",
  "/js/archive.js",

  "/pages/archive.html",

  "/legal/privacy.html",
  "/legal/terms.html",
  "/legal/disclaimer.html",

  "/assets/images/icon-192.png",
  "/assets/images/icon-512.png",
  "/assets/images/og-1200x630.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for HTML, cache-first for assets
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  const accept = req.headers.get("accept") || "";
  const isHTML =
    accept.includes("text/html") ||
    url.pathname.endsWith(".html") ||
    url.pathname === "/";

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match("/offline.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});