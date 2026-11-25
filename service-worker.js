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
  './tea-party-talk/assets/cloud-shapes.jpg',
  './tea-party-talk/extra-cards.js',
  './tea-party-talk/assets/breakfast-table.svg',
  './tea-party-talk/assets/zoo-day.svg',
  './tea-party-talk/assets/farm-friends.svg',
  './tea-party-talk/assets/pet-party.svg',
  './tea-party-talk/assets/ocean-friends.svg',
  './tea-party-talk/assets/bug-garden.svg',
  './tea-party-talk/assets/fruit-bowl.svg',
  './tea-party-talk/assets/veggie-bowl.svg',
  './tea-party-talk/assets/pancake-morning.svg',
  './tea-party-talk/assets/playground-fun.svg',
  './tea-party-talk/assets/bath-time.svg',
  './tea-party-talk/assets/bedtime-book.svg',
  './tea-party-talk/assets/getting-dressed.svg',
  './tea-party-talk/assets/shoe-choice.svg',
  './tea-party-talk/assets/sunny-day.svg',
  './tea-party-talk/assets/snow-day.svg',
  './tea-party-talk/assets/windy-day.svg',
  './tea-party-talk/assets/road-trip.svg',
  './tea-party-talk/assets/sky-travel.svg',
  './tea-party-talk/assets/construction-site.svg',
  './tea-party-talk/assets/tool-time.svg',
  './tea-party-talk/assets/cooking-together.svg',
  './tea-party-talk/assets/cleaning-day.svg',
  './tea-party-talk/assets/laundry-day.svg',
  './tea-party-talk/assets/garden-work.svg',
  './tea-party-talk/assets/park-picnic.svg',
  './tea-party-talk/assets/library-visit.svg',
  './tea-party-talk/assets/music-party.svg',
  './tea-party-talk/assets/sharing-toys.svg',
  './tea-party-talk/assets/swing-turns.svg',
  './tea-party-talk/assets/broken-toy-sorry.svg',
  './tea-party-talk/assets/dark-bedroom.svg',
  './tea-party-talk/assets/feeling-lonely.svg',
  './tea-party-talk/assets/sibling-toy.svg',
  './tea-party-talk/assets/lost-in-a-crowd.svg',
  './tea-party-talk/assets/new-school.svg',
  './tea-party-talk/assets/doctor-visit.svg',
  './tea-party-talk/assets/dentist-visit.svg',
  './tea-party-talk/assets/first-haircut.svg',
  './tea-party-talk/assets/loud-noise.svg',
  './tea-party-talk/assets/long-wait.svg',
  './tea-party-talk/assets/rained-out-game.svg',
  './tea-party-talk/assets/proud-drawing.svg',
  './tea-party-talk/assets/new-baby.svg',
  './tea-party-talk/assets/friend-moving.svg',
  './tea-party-talk/assets/helping-baby.svg',
  './tea-party-talk/assets/left-out.svg',
  './tea-party-talk/assets/drawing-mistake.svg',
  './tea-party-talk/assets/winning-losing.svg',
  './tea-party-talk/assets/stage-nerves.svg',
  './tea-party-talk/assets/night-shadow.svg',
  './tea-party-talk/assets/thank-you-gift.svg',
  './tea-party-talk/assets/pirate-treasure.svg',
  './tea-party-talk/assets/space-mission.svg',
  './tea-party-talk/assets/dinosaur-land.svg',
  './tea-party-talk/assets/underwater-castle.svg',
  './tea-party-talk/assets/robot-friend.svg',
  './tea-party-talk/assets/superhero-tea.svg',
  './tea-party-talk/assets/talking-shoes.svg',
  './tea-party-talk/assets/giant-sandwich.svg',
  './tea-party-talk/assets/mouse-house.svg',
  './tea-party-talk/assets/rainbow-slide.svg',
  './tea-party-talk/assets/cloud-train.svg',
  './tea-party-talk/assets/magic-paintbrush.svg',
  './tea-party-talk/assets/invisible-friend.svg',
  './tea-party-talk/assets/time-machine.svg',
  './tea-party-talk/assets/snow-globe.svg',
  './tea-party-talk/assets/floating-island.svg',
  './tea-party-talk/assets/mermaid-party.svg',
  './tea-party-talk/assets/dragon-tea.svg',
  './tea-party-talk/assets/wizard-library.svg',
  './tea-party-talk/assets/forest-fairy.svg',
  './tea-party-talk/assets/moon-cheese.svg',
  './tea-party-talk/assets/star-fishing.svg',
  './tea-party-talk/assets/balloon-house.svg',
  './tea-party-talk/assets/penguin-beach.svg',
  './tea-party-talk/assets/camel-snow.svg',
  './tea-party-talk/assets/lion-haircut.svg',
  './tea-party-talk/assets/elephant-trampoline.svg',
  './tea-party-talk/assets/giraffe-bed.svg',
  './tea-party-talk/assets/turtle-race.svg',
  './tea-party-talk/assets/singing-frog.svg'
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
