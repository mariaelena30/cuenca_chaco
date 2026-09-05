/**
 * Service Worker - Portal Hidrico Chaco
 * ---------------------------------------
 * Dos objetivos, en este orden de prioridad:
 *
 * 1) Que la app ABRA aunque no haya señal o el 4G este muy lento -
 *    esto es lo mas importante: si alguien esta en medio de una
 *    crecida con mala conexion, necesita poder abrir la app y usar
 *    el boton SOS YA, no esperar a que cargue todo.
 *
 * 2) Datos siempre frescos cuando SI hay conexion - nunca mostrar
 *    numeros viejos guardados en cache como si fueran actuales. Los
 *    pedidos a la API del backend (cuencas-bot) van siempre a la red
 *    primero; el cache es solo el ultimo recurso si no hay conexion.
 *
 * CACHE_VERSION: subir este numero cada vez que se despliega una
 * version nueva importante, asi los celulares que ya instalaron la
 * app bajan la actualizacion en vez de quedarse con una vieja.
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `portal-hidrico-chaco-${CACHE_VERSION}`;

// El "cascaron" de la app: lo minimo para que abra y muestre algo,
// incluso sin conexion. No incluye datos (esos siempre van a la red).
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  // No esperar a que se cierren las pestañas viejas - activar la
  // version nueva apenas termina de instalar. Para una app de
  // emergencias, es mas importante tener el codigo mas nuevo que
  // evitar una recarga.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo GET se cachea - los POST (SOS, reportes ciudadanos) SIEMPRE
  // van directo a la red, nunca deben quedar "atendidos" por un
  // cache viejo (eso podria hacer creer que un SOS se mando cuando
  // en realidad no llego a ningun lado).
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((respuesta) => {
        // Se guarda una copia fresca en cache para la proxima vez
        // que falte conexion.
        const copia = respuesta.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copia));
        return respuesta;
      })
      .catch(() =>
        // Sin conexion: se sirve lo ultimo guardado, si existe.
        caches.match(request).then((cacheado) => {
          if (cacheado) return cacheado;
          // Ultimo recurso para navegacion (abrir la app): la pagina
          // principal, para que al menos el boton SOS este visible.
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('', { status: 504, statusText: 'Sin conexion' });
        })
      )
  );
});

/**
 * Notificaciones push (Firebase Cloud Messaging) - preparado para
 * cuando se conecte FCM (ver conversacion sobre notificaciones push
 * como tercer canal de alerta, ademas de Telegram/WhatsApp). Por ahora
 * no hay backend enviando pushes todavia, esto solo deja el manejo
 * ya escrito para no tener que volver a tocar el service worker
 * cuando se conecte.
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let datos;
  try {
    datos = event.data.json();
  } catch {
    datos = { title: 'Portal Hídrico Chaco', body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(datos.title || 'Portal Hídrico Chaco', {
      body: datos.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: datos.url ? { url: datos.url } : {},
      requireInteraction: true, // las alertas de crecida no se cierran solas
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(self.clients.openWindow(url));
});
