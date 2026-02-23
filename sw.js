const CACHE_NAME = 'oracle-cmshs-v1';
const assets = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './CMSHS_LOGO.png',
  './CMSHS SDRRM PLAN.png'
];

// Install Service Worker
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching tactical assets...');
      cache.addAll(assets);
    })
  );
});

// Fetch Assets
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(rec => {
      return rec || fetch(evt.request);
    })
  );
});