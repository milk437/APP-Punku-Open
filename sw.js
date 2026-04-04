/**
 * PUNKU OPEN SERVICE WORKER V6.0
 * Optimizado para Plataforma Digital Punku Open
 */

const CACHE_NAME = 'punku-open-cache-v1';
const assetsToCache = [
  './',
  './index.html',
  './icon-192.png',
  './icon-512.png'
];

// Instalación y almacenamiento en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto: Punku Open System');
        return cache.addAll(assetsToCache);
      })
  );
});

// Estrategia de respuesta (Cache primero, luego red)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});