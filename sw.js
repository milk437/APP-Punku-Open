// sw.js - Versión Autolimpiante v41
const CACHE_NAME = 'punku-open-v41';
const BASE_PATH = '/APP-Punku-Open';

// Instalación inmediata con cacheo de recursos clave
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        BASE_PATH + '/',
        BASE_PATH + '/index.html',
        BASE_PATH + '/manifest.json',
        BASE_PATH + '/icon-192.png',
        BASE_PATH + '/icon-512.png'
      ]);
    })
  );
});

// Limpia cachés antiguas al activar
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  return self.clients.claim();
});

// Estrategia: Network First (red primero, caché como respaldo)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
