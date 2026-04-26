// sw.js - Versión Autolimpiante
const CACHE_NAME = 'punku-open-v21'; // <--- CAMBIA ESTE NÚMERO

self.addEventListener('install', event => {
  self.skipWaiting(); // No pidas permiso, instálate ya
});

self.addEventListener('activate', event => {
  // Limpia toda la basura de versiones anteriores (v1, v6, etc)
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  return self.clients.claim();
});

// ESTRATEGIA CLAVE: Network First
// Primero intenta traer lo de Git. Si falla, usa el caché.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
