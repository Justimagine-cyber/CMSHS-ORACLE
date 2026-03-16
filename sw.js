/* 🏛️ CMSHS ORACLE: SERVICE WORKER - SHIELD */
const CACHE_NAME = 'oracle-cache-v4.72';
const ASSETS = [
  './',
  './index.html',
  './sdrrm-design.css',
  './sdrrm-events.js',
  './CMSHS_LOGO.png',
  './js/cv.js',    
  './js/aruco.js'
];

// 1. INSTALL: Force the new Service Worker to take over immediately
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('ORACLE: SECURING ASSETS...');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. ACTIVATE: 🛡️ THE CACHE-BUSTER 🛡️
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('ORACLE: PURGING OLD DATA CORE...', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Immediate control without reload
  );
});

// 3. FETCH: Network-First (Safe for Development)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
