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
  './sky-pilot/manifest.webmanifest',
  './tea-party-talk/',
  './tea-party-talk/index.html',
  './tea-party-talk/styles.css',
  './tea-party-talk/cards.js',
  './tea-party-talk/app.js',
  './tea-party-talk/manifest.webmanifest',
  './tea-party-talk/assets/red-cup.svg',
  './tea-party-talk/assets/apple-choice.svg',
  './tea-party-talk/assets/hiding-cat.svg',
  './tea-party-talk/assets/tea-snack.jpg',
  './tea-party-talk/assets/rainy-walk.jpg',
  './tea-party-talk/assets/field-leaf.svg',
  './tea-party-talk/assets/spilled-tea.svg',
  './tea-party-talk/assets/crying-bear.svg',
  './tea-party-talk/assets/pink-balloon.jpg',
  './tea-party-talk/assets/broken-tower.jpg',
  './tea-party-talk/assets/new-friend.svg',
  './tea-party-talk/assets/sharing-cookies.jpg',
  './tea-party-talk/assets/magic-animal.svg',
  './tea-party-talk/assets/flying-cup.svg',
  './tea-party-talk/assets/tiny-door.svg',
  './tea-party-talk/assets/moon-picnic.svg',
  './tea-party-talk/assets/talking-teddy.svg',
  './tea-party-talk/assets/cloud-shapes.jpg'
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
