const CACHE_NAME = "chatbot-cache-v1";
const ASSETS_TO_CACHE = [
  "/",           // your chatbot entry
  "/index.html",
  "/main.js",    // adjust for your build
  "/styles.css", // adjust for your build
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

// For your chatbot API calls we usually want fresh data, not cache
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Example: don't cache API calls to /api/chat
  if (url.pathname.startsWith("/api/chat")) {
    return; // let the network handle it
  }

  // For static files: cache-first
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request);
    })
  );
});
