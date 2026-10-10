const CACHE_NAME = 'seawidget-cache-v3';
const ASSETS_TO_CACHE = [
  '/seawidget-web/',
  '/seawidget-web/index.html',
  '/seawidget-web/manifest.json',
  '/seawidget-web/icons/apple-touch-icon.png',
  '/seawidget-web/icons/icon-192.png',
  '/seawidget-web/icons/icon-512.png',
  '/seawidget-web/icons/icon.svg',
  '/seawidget-web/icons/ic_calm_sea.svg',
  '/seawidget-web/icons/ic_caution_sea.svg',
  '/seawidget-web/icons/ic_unsafe_sea.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Per le API Open-Meteo, andiamo sempre prima su rete
  if (url.hostname.includes('open-meteo.com') || url.hostname.includes('bigdatacloud.net')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Se la rete fallisce, il client userà la cache in LocalStorage
        return new Response(JSON.stringify({ error: 'offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // Per gli asset statici (immagini, JS, CSS, icone), usiamo Cache First con fallback di rete
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Aggiorna la cache in background se opportuno
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
