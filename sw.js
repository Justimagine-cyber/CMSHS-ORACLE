const CACHE_NAME = 'oracle-cmshs-v1';
const assets = [
  './',
  './index.html',
  './sdrrm-design.css',
  './sdrrm-events.js',
  './CMSHS_LOGO.png',
  './CMSHS-SDRRM-PLAN.png',
  './CMSHS_ORACLE.png'
];

// 🏛️ INSTALL: Pre-caching the system files
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('ORACLE: Caching tactical assets...');
      return cache.addAll(assets);
    })
  );
  self.skipWaiting(); // Forces the new service worker to become active immediately
});

// 🏛️ ACTIVATE: Cleaning up old caches (The "Scrub" Protocol)
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim(); // Immediately takes control of all open tabs
});

// 🏛️ FETCH: Cache-First Strategy (The "Bunker" Mode)
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      // Return cached file if found, otherwise try to fetch from network
      return cacheRes || fetch(evt.request).catch(() => {
        // Optional: If both fail (total offline and not in cache), 
        // you could return a custom offline page here.
      });
    })
  );

});

