const CACHE_NAME = 'dnd-5e-binder-v2';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './data-classes-races.js',
  './data-spells.js',
  './data-rules.js',
  './data-items.js',
  './data-equipment.js',
  './data-libraries.js',
  './data-backgrounds.js',
  './wizard.js',
  './map.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/glyphs/class-barbarian.svg',
  './icons/glyphs/class-bloodhunter.svg',
  './icons/glyphs/class-bard.svg',
  './icons/glyphs/class-cleric.svg',
  './icons/glyphs/class-druid.svg',
  './icons/glyphs/class-fighter.svg',
  './icons/glyphs/class-monk.svg',
  './icons/glyphs/class-paladin.svg',
  './icons/glyphs/class-ranger.svg',
  './icons/glyphs/class-rogue.svg',
  './icons/glyphs/class-sorcerer.svg',
  './icons/glyphs/class-warlock.svg',
  './icons/glyphs/class-wizard.svg',
  './icons/glyphs/ab-str.svg',
  './icons/glyphs/ab-dex.svg',
  './icons/glyphs/ab-con.svg',
  './icons/glyphs/ab-int.svg',
  './icons/glyphs/ab-wis.svg',
  './icons/glyphs/ab-cha.svg',
  './icons/glyphs/dmg-acid.svg',
  './icons/glyphs/dmg-bludgeoning.svg',
  './icons/glyphs/dmg-cold.svg',
  './icons/glyphs/dmg-fire.svg',
  './icons/glyphs/dmg-force.svg',
  './icons/glyphs/dmg-heal.svg',
  './icons/glyphs/dmg-lightning.svg',
  './icons/glyphs/dmg-necrotic.svg',
  './icons/glyphs/dmg-piercing.svg',
  './icons/glyphs/dmg-poison.svg',
  './icons/glyphs/dmg-psychic.svg',
  './icons/glyphs/dmg-radiant.svg',
  './icons/glyphs/dmg-slashing.svg',
  './icons/glyphs/dmg-thunder.svg',
  './icons/glyphs/sp-save.svg',
  './icons/glyphs/sp-attack.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
