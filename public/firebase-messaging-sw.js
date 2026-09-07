/**
 * firebase-messaging-sw.js
 * -------------------------
 * Service worker DEDICADO a Firebase Cloud Messaging. Va separado del
 * sw.js general (que maneja el cache offline) porque Firebase requiere
 * que este archivo tenga este nombre exacto y estas versiones de SDK
 * cargadas por <script>, no por import - es una limitación de Firebase,
 * no una eleccion nuestra.
 *
 * Este es el que hace que una alerta de EVACUACION suene fuerte y
 * aparezca aunque el celular este en el bolsillo con la app cerrada.
 */

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  projectId: 'gen-lang-client-0384014843',
  appId: '1:177495368784:web:1aa7d27fd5f91f7e221d55',
  apiKey: 'AIzaSyAbkHUBKPAnRZc10r-wIF8WzwVzdPFrvOk',
  authDomain: 'gen-lang-client-0384014843.firebaseapp.com',
  storageBucket: 'gen-lang-client-0384014843.firebasestorage.app',
  messagingSenderId: '177495368784',
});

const messaging = firebase.messaging();

// Mensaje recibido con la app CERRADA o en segundo plano.
messaging.onBackgroundMessage((payload) => {
  const esUrgente = payload.data?.urgente === 'true';

  const titulo = payload.notification?.title || 'Portal Hídrico Chaco';
  const opciones = {
    body: payload.notification?.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    // requireInteraction: la notificacion NO se cierra sola - se
    // queda ahi hasta que la persona la toca. Para un aviso de
    // evacuacion, no queremos que desaparezca sin que la vea.
    requireInteraction: esUrgente,
    // vibrate: patron de vibracion largo y distinto al de un mensaje
    // comun, para que se sienta "esto es distinto" sin mirar la
    // pantalla. Patron: vibra 500ms, pausa 200ms, x3.
    vibrate: esUrgente ? [500, 200, 500, 200, 500] : [200],
    // silent: false + requireInteraction fuerza que use el sonido de
    // notificacion del sistema en vez de uno silencioso.
    silent: false,
    data: payload.data || {},
    tag: payload.data?.localidad || 'alerta-general',
    // renotify: si llega OTRA alerta de la MISMA localidad mientras la
    // anterior sigue sin verse, vuelve a sonar en vez de quedar muda.
    renotify: true,
  };

  self.registration.showNotification(titulo, opciones);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
