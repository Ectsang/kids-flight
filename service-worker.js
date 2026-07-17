const CACHE_NAME = 'kids-flight-@@CACHE_STAMP@@';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './animal-tap-parade/',
  './animal-tap-parade/index.html',
  './animal-tap-parade/styles.css',
  './animal-tap-parade/app.js',
  './animal-tap-parade/manifest.webmanifest',
  './animal-tap-parade/assets/icons/icon-192.png',
  './animal-tap-parade/assets/icons/icon-512.png',
  './bubble-pop-tower/',
  './bubble-pop-tower/index.html',
  './bubble-pop-tower/styles.css',
  './bubble-pop-tower/app.js',
  './bubble-pop-tower/matter.min.js',
  './bubble-pop-tower/manifest.webmanifest',
  './little-learners/',
  './little-learners/index.html',
  './little-learners/styles.css',
  './little-learners/app.js',
  './little-learners/manifest.webmanifest',
  './mind-grid/',
  './mind-grid/index.html',
  './mind-grid/styles.css',
  './mind-grid/app.js',
  './mind-grid/manifest.webmanifest',
  './number-cruncher/',
  './number-cruncher/index.html',
  './number-cruncher/styles.css',
  './number-cruncher/app.js',
  './number-cruncher/manifest.webmanifest',
  './sky-pilot/',
  './sky-pilot/index.html',
  './sky-pilot/styles.css',
  './sky-pilot/app.js',
  './sky-pilot/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.startsWith('kids-flight-') && k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request.clone()).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      }).catch(() => {
        const accept = event.request.headers.get('accept') || '';
        if (accept.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
