// Service Worker for offline support
const CACHE_NAME = "kantong-v1";
const STATIC_CACHE_URLS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE_URLS);
    }),
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        }),
      );
    }),
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  // Skip caching for sensitive API endpoints
  const sensitiveEndpoints = [
    "/api/transactions",
    "/api/accounts",
    "/api/budgets",
    "/api/user",
    "/api/export"
  ];

  const isSensitive = sensitiveEndpoints.some(endpoint =>
    event.request.url.includes(endpoint)
  );

  // Only cache non-sensitive API requests
  if (event.request.url.includes("/api/") && event.request.method === "GET" && !isSensitive) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((fetchResponse) => {
            // Cache successful responses
            if (fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return fetchResponse;
          })
        );
      }),
    );
  } else {
    // For sensitive requests or other requests, try network first
    event.respondWith(
      fetch(event.request).catch(() => {
        // Fallback to cache only for non-sensitive requests
        if (!isSensitive) {
          return caches.match(event.request);
        }
        return new Response("Offline - request requires network connection", { status: 503 });
      })
    );
  }
});

// Background sync for pending operations (if supported)
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  // Implement sync logic for pending transactions/data
  // This would typically involve IndexedDB and background sync
  console.log("Background sync triggered");
}
