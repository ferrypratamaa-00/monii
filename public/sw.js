// Service Worker for offline support
const CACHE_NAME = "Monii-v2";
const STATIC_CACHE_URLS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/login",
  "/signup",
  "/dashboard",
  "/transactions",
  "/goals",
  "/reports",
];

// API endpoints that can be cached for offline viewing
const CACHEABLE_API_ENDPOINTS = [
  "/api/dashboard",
  "/api/categories",
  "/api/accounts",
];

// Sensitive endpoints that should not be cached
const SENSITIVE_ENDPOINTS = [
  "/api/transactions",
  "/api/user",
  "/api/export",
  "/api/auth",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching static assets");
      return cache.addAll(STATIC_CACHE_URLS);
    }),
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
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
  const url = new URL(event.request.url);

  // Check if this is a sensitive endpoint
  const isSensitive = SENSITIVE_ENDPOINTS.some((endpoint) =>
    url.pathname.includes(endpoint),
  );

  // Check if this is a cacheable API endpoint
  const isCacheableApi = CACHEABLE_API_ENDPOINTS.some((endpoint) =>
    url.pathname.includes(endpoint),
  );

  // Handle API requests
  if (url.pathname.startsWith("/api/")) {
    if (event.request.method === "GET") {
      if (isSensitive) {
        // For sensitive endpoints, try network first, no caching
        event.respondWith(
          fetch(event.request).catch(() => {
            return new Response(
              JSON.stringify({
                error: "Offline - This feature requires internet connection",
              }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" },
              },
            );
          }),
        );
      } else if (isCacheableApi) {
        // For cacheable APIs, use cache-first strategy
        event.respondWith(
          caches.match(event.request).then((response) => {
            if (response) {
              console.log("Serving from cache:", url.pathname);
              return response;
            }

            return fetch(event.request).then((fetchResponse) => {
              if (fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
                  console.log("Cached API response:", url.pathname);
                });
              }
              return fetchResponse;
            });
          }),
        );
      } else {
        // For other APIs, try network first with basic offline message
        event.respondWith(
          fetch(event.request).catch(() => {
            return new Response(
              JSON.stringify({
                error: "Offline - Please check your connection",
              }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" },
              },
            );
          }),
        );
      }
    } else {
      // For non-GET requests, always try network
      event.respondWith(fetch(event.request));
    }
  } else {
    // For non-API requests (pages, assets), use cache-first strategy
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          console.log("Serving from cache:", url.pathname);
          return response;
        }

        return fetch(event.request).then((fetchResponse) => {
          // Cache successful GET requests for pages and assets
          if (
            fetchResponse.status === 200 &&
            event.request.method === "GET" &&
            (url.pathname.startsWith("/") ||
             url.pathname.includes(".") ||
             url.pathname.includes("manifest"))
          ) {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
              console.log("Cached asset:", url.pathname);
            });
          }
          return fetchResponse;
        }).catch(() => {
          // If network fails and we have no cache, show offline page
          if (url.pathname.startsWith("/dashboard") ||
              url.pathname.startsWith("/transactions") ||
              url.pathname.startsWith("/goals")) {
            return caches.match("/").then((response) => {
              return response || new Response("Offline - Please check your connection", {
                status: 503,
              });
            });
          }
          return new Response("Offline - Please check your connection", {
            status: 503,
          });
        });
      }),
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
  // Import sync service dynamically to avoid issues in service worker
  try {
    // Since service workers can't directly import ES modules,
    // we'll use a simple approach to sync data
    console.log("Background sync triggered - checking for pending data");

    // Check if we have any cached data that needs syncing
    const cacheNames = await caches.keys();
    console.log("Available caches:", cacheNames);

    // For now, just log that sync was attempted
    // In a full implementation, this would sync pending transactions
    console.log("Background sync completed");
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}
