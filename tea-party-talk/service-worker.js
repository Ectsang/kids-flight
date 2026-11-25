const CACHE_NAME = 'tea-party-talk-@@CACHE_STAMP@@';
const CARD_IDS = [
  'red-cup', 'apple-choice', 'hiding-cat', 'tea-snack', 'rainy-walk', 'field-leaf',
  'spilled-tea', 'crying-bear', 'pink-balloon', 'broken-tower', 'new-friend', 'sharing-cookies',
  'magic-animal', 'flying-cup', 'tiny-door', 'moon-picnic', 'talking-teddy', 'cloud-shapes'
];
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './cards.js',
  './app.js',
  './manifest.webmanifest',
  '../animal-tap-parade/assets/icons/icon-192.png',
  '../animal-tap-parade/assets/icons/icon-512.png',
  ...CARD_IDS.map(id => `./assets/${id}.svg`)
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
      Promise.all(keys.filter(k => k.startsWith('tea-party-talk-') && k !== CACHE_NAME).map(k => caches.delete(k)))
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
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
