/**
 * Service worker — caches same-origin app shell & assets only.
 * Bump CACHE_VERSION when changing caching rules so old caches are dropped.
 */
const CACHE_VERSION = '2';
const CACHE_NAME = `wiki-compiler-shell-${CACHE_VERSION}`;

const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-96.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/icon-maskable-512.svg',
];

function isSameOrigin(requestUrl) {
  try {
    return new URL(requestUrl).origin === self.location.origin;
  } catch {
    return false;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch((err) => {
          console.error('Failed to cache initial resources:', err);
        });
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Never cache or intercept third-party requests — avoids poisoning SW cache with CDNs / APIs.
  if (!isSameOrigin(event.request.url)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          const isCachable =
            networkResponse &&
            networkResponse.status === 200 &&
            !event.request.url.includes('wikipedia.org');
          if (isCachable) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });

        return cachedResponse || fetchPromise;
      })
    ).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('/offline.html');
      }
    })
  );
});
