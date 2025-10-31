const CACHE_NAME = 'wiki-compiler-cache-v2'; // Increment version for updates
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  // URLs from the importmap for full offline availability
  'https://aistudiocdn.com/file-saver@^2.0.5',
  'https://aistudiocdn.com/@lexical/react@^0.35.0/',
  'https://aistudiocdn.com/docx@^9.5.1',
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1',
  'https://aistudiocdn.com/i18next@^25.5.2',
  'https://aistudiocdn.com/@google/genai@^1.17.0',
  'https://aistudiocdn.com/idb@^8.0.3',
  'https://aistudiocdn.com/react-i18next@^15.7.3',
  'https://aistudiocdn.com/i18next-browser-languagedetector@^8.2.0',
  'https://aistudiocdn.com/turndown@^7.2.1',
  'https://aistudiocdn.com/lexical@^0.35.0',
  'https://aistudiocdn.com/@lexical/rich-text@^0.35.0',
  'https://aistudiocdn.com/@lexical/list@^0.35.0',
  'https://aistudiocdn.com/@lexical/link@^0.35.0',
  'https://aistudiocdn.com/@lexical/utils@^0.35.0',
  'https://aistudiocdn.com/@lexical/selection@^0.35.0',
  'https://aistudiocdn.com/@lexical/html@^0.35.0',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Use addAll with a catch to prevent a single failed resource from breaking the entire cache
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
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response to cache
            if (!response || response.status !== 200) {
              return response;
            }

            // Don't cache Wikipedia API calls.
            if (event.request.url.includes('wikipedia.org')) {
                return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // Network request failed. 
          // If it's a navigation request, serve the offline page.
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});
