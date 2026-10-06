/**
 * Service Worker - Portal Hidrico Chaco
 * ---------------------------------------
 * Dos objetivos, en este orden de prioridad:
 *
 * 1) Que la app ABRA aunque no haya señal o el 4G este muy lento.
 *
 * 2) Datos siempre frescos cuando SI hay conexion, y NUNCA mostrar
 *    numeros viejos como si fueran actuales. Por eso:
 *      - Los pedidos a la API del backend (cuencas-bot) y a cualquier
 *        otro sitio NO pasan por el cache: van siempre a la red. Si no
 *        hay conexion, fallan, y la app avisa "SIN CONEXION" en lugar
 *        de mostrar niveles viejos como si fueran de ahora.
 *      - El cache guarda solo el "cascaron" de la app (pagina, scripts,
 *        estilos, iconos) del propio sitio, para que pueda abrir.
 *
 * CACHE_VERSION: subir este numero cada vez que se despliega una
 * version nueva importante, asi los celulares que ya instalaron la
 * app bajan la actualizacion y borran el cache anterior.
 *
 * v2 (06/10/2026): la v1 guardaba tambien las respuestas de la API y las
 * servia sin conexion, lo que podia mostrar niveles de rio viejos como
 * si fueran actuales. Al subir a v2 se borra ese cache viejo.
 */

const CACHE_VERSION = 'v2';
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

// Guarda tambien los archivos de la app (scripts y estilos con nombre
// cambiante, ej. /assets/index-AbC123.js) leyendo el index.html. Sin esto,
// la app solo podria abrir sin conexion despues de haberla visitado dos
// veces. Si algo falla, no se rompe la instalacion: esos archivos se
// guardan igual cuando se usan.
async function precargarArchivosDeLaApp(cache) {
  try {
    const respuesta = await fetch('/index.html', { cache: 'no-store' });
    const html = await respuesta.text();
    const rutas = new Set();
    const patron = /(?:src|href)="(\/[^"]+\.(?:js|css))"/g;
    let coincidencia;
    while ((coincidencia = patron.exec(html)) !== null) {
      rutas.add(coincidencia[1]);
    }
    await Promise.all([...rutas].map((ruta) => cache.add(ruta).catch(() => {})));
  } catch (error) {
    /* si falla, se guardan al usarlos */
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cada archivo por separado: si falta uno (ej. un icono), los demas
      // se guardan igual y la instalacion no falla.
      await Promise.all(APP_SHELL.map((ruta) => cache.add(ruta).catch(() => {})));
      await precargarArchivosDeLaApp(cache);
    })
  );
  // No esperar a que se cierren las pestañas viejas - activar la
  // version nueva apenas termina de instalar. Para una app de
  // emergencias, es mas importante tener el codigo mas nuevo que
  // evitar una recarga.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(
          nombres
            .filter((nombre) => nombre !== CACHE_NAME)
            .map((nombre) => caches.delete(nombre))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo GET se considera - los POST SIEMPRE van directo a la red.
  if (request.method !== 'GET') {
    return;
  }

  // Todo lo que NO es del propio sitio (la API del backend en Render,
  // mapas, etc.) va siempre a la red, sin cache. Si falla, la app lo
  // sabe y lo muestra, en vez de recibir datos viejos sin darse cuenta.
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  // Del propio sitio: red primero; el cache es solo el ultimo recurso
  // para poder abrir la app sin conexion.
  event.respondWith(
    fetch(request)
      .then((respuesta) => {
        // Solo se guardan respuestas correctas y completas del propio sitio
        if (respuesta.status === 200 && respuesta.type === 'basic') {
          const copia = respuesta.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copia));
        }
        return respuesta;
      })
      .catch(() =>
        caches.match(request).then((cacheado) => {
          if (cacheado) return cacheado;
          // Ultimo recurso para navegacion (abrir la app): la pagina
          // principal.
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
 * cuando se conecte FCM. Por ahora no hay backend enviando pushes,
 * esto solo deja el manejo ya escrito para no tener que volver a
 * tocar el service worker cuando se conecte.
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
