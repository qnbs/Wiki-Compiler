const CACHE_NAME = 'wiki-compiler-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-96.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/icon-maskable-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching essential assets');
        return cache.addAll(urlsToCache).catch(err => {
            console.error('Failed to cache initial resources:', err);
        });
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests and chrome-extension URLs
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Strategy: Stale-While-Revalidate for app shell and assets.
  // This serves from cache first for speed, then updates the cache in the background.
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Don't cache Wikipedia API calls or other external APIs
          const isCachable = !event.request.url.includes('wikipedia.org');
          if (networkResponse && networkResponse.status === 200 && isCachable) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });

        // Return cached response immediately, and update cache in background.
        // If not in cache, wait for network.
        return cachedResponse || fetchPromise;
      }).catch(() => {
        // If both cache and network fail, show offline page for navigations
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});
