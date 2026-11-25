const CACHE_VERSION = '@@CACHE_STAMP@@';
const CACHE_NAME = `tea-party-talk-${CACHE_VERSION}`;
const CARD_IDS = [
  'red-cup', 'apple-choice', 'hiding-cat', 'tea-snack', 'rainy-walk', 'field-leaf',
  'spilled-tea', 'crying-bear', 'pink-balloon', 'broken-tower', 'new-friend', 'sharing-cookies',
  'magic-animal', 'flying-cup', 'tiny-door', 'moon-picnic', 'talking-teddy', 'cloud-shapes',
  'breakfast-table', 'zoo-day', 'farm-friends', 'pet-party', 'ocean-friends', 'bug-garden',
  'fruit-bowl', 'veggie-bowl', 'pancake-morning', 'playground-fun', 'bath-time', 'bedtime-book',
  'getting-dressed', 'shoe-choice', 'sunny-day', 'snow-day', 'windy-day', 'road-trip',
  'sky-travel', 'construction-site', 'tool-time', 'cooking-together', 'cleaning-day', 'laundry-day',
  'garden-work', 'park-picnic', 'library-visit', 'music-party', 'sharing-toys', 'swing-turns',
  'broken-toy-sorry', 'dark-bedroom', 'feeling-lonely', 'sibling-toy', 'lost-in-a-crowd', 'new-school',
  'doctor-visit', 'dentist-visit', 'first-haircut', 'loud-noise', 'long-wait', 'rained-out-game',
  'proud-drawing', 'new-baby', 'friend-moving', 'helping-baby', 'left-out', 'drawing-mistake',
  'winning-losing', 'stage-nerves', 'night-shadow', 'thank-you-gift', 'pirate-treasure', 'space-mission',
  'dinosaur-land', 'underwater-castle', 'robot-friend', 'superhero-tea', 'talking-shoes', 'giant-sandwich',
  'mouse-house', 'rainbow-slide', 'cloud-train', 'magic-paintbrush', 'invisible-friend', 'time-machine',
  'snow-globe', 'floating-island', 'mermaid-party', 'dragon-tea', 'wizard-library', 'forest-fairy',
  'moon-cheese', 'star-fishing', 'balloon-house', 'penguin-beach', 'camel-snow', 'lion-haircut',
  'elephant-trampoline', 'giraffe-bed', 'turtle-race', 'singing-frog'
];
const PHOTO_IDS = ['tea-snack', 'rainy-walk', 'pink-balloon', 'broken-tower', 'sharing-cookies', 'cloud-shapes'];
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './cards.js',
  './extra-cards.js',
  './app.js',
  './manifest.webmanifest',
  './ART-CREDITS.md',
  './PHOTO-CREDITS.md',
  '../animal-tap-parade/assets/icons/icon-192.png',
  '../animal-tap-parade/assets/icons/icon-512.png',
  ...CARD_IDS.map(id => `./assets/${id}.${PHOTO_IDS.includes(id) ? 'jpg' : 'svg'}`)
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(ASSETS.map(async asset => {
        const joiner = asset.includes('?') ? '&' : '?';
        const response = await fetch(`${asset}${joiner}v=${CACHE_VERSION}`, { cache: 'reload' });
        if (!response.ok) throw new Error(`Unable to cache ${asset}`);
        return cache.put(asset, response);
      })))
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
