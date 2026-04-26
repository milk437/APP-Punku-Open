/**
 * PUNKU OPEN SERVICE WORKER - VERSIÓN DINÁMICA
 * Forzar actualización al detectar cambios en Git
 */

// 1. CADA VEZ QUE SUBAS UN CAMBIO, SUBE ESTE NÚMERO (v2, v3, v4...)
const CACHE_NAME = 'punku-open-v15'; 

const assetsToCache = [
  './',
  './index.html',
  './icon-192.png',
  './icon-512.png'
];

// INSTALACIÓN: Se ejecuta cuando cambias el CACHE_NAME
self.addEventListener('install', event => {
  self.skipWaiting(); // Fuerza al nuevo SW a activarse sin esperar
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Punku Open: Archivos cacheados con éxito');
      return cache.addAll(assetsToCache);
    })
  );
});

// ACTIVACIÓN: Borra los rastros de la versión anterior
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Punku Open: Borrando caché antiguo...', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Toma el control de la página inmediatamente
});

// ESTRATEGIA: RED PRIMERO (Network First)
// Intenta traer lo último de Git; si falla (estás offline), usa el caché.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
