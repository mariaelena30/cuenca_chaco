import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { firebaseConfig } from './firebase';

/**
 * Notificaciones push (Firebase Cloud Messaging) - avisos que llegan
 * aunque la app este cerrada y el celular en silencio.
 *
 * COMO FUNCIONA EN CRIOLLO:
 * 1. El usuario elige su localidad y toca "Activar alertas".
 * 2. El navegador pide permiso (una sola vez).
 * 3. Firebase le da un "token" unico a ese celular/navegador.
 * 4. Se manda ese token al backend junto con la localidad elegida.
 * 5. Cuando el backend detecta un cambio de fase (ALERTA/EVACUACION)
 *    en esa localidad, le manda el push a todos los tokens guardados
 *    para esa localidad - ver alertas_dispatcher.py.
 *
 * VAPID KEY: hace falta generarla UNA sola vez en Firebase Console ->
 * Configuracion del proyecto -> Cloud Messaging -> "Web configuration"
 * -> "Generate key pair". Sin esa clave, getToken() no funciona.
 * Se pega abajo en VAPID_KEY (no es secreta, es publica - va en el
 * codigo del frontend sin problema, a diferencia de las claves de
 * Supabase/WhatsApp que si son secretas).
 */
const VAPID_KEY = 'PEGAR_ACA_LA_VAPID_KEY_DE_FIREBASE_CONSOLE';

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'https://cuencas-bot.onrender.com';

export type EstadoPermisoPush = 'no-soportado' | 'denegado' | 'concedido' | 'sin-pedir';

export async function verificarSoportePush(): Promise<boolean> {
  try {
    return await isSupported();
  } catch {
    return false;
  }
}

export function estadoPermisoActual(): EstadoPermisoPush {
  if (!('Notification' in window)) return 'no-soportado';
  if (Notification.permission === 'granted') return 'concedido';
  if (Notification.permission === 'denied') return 'denegado';
  return 'sin-pedir';
}

/**
 * Pide permiso al usuario, obtiene el token FCM, y lo registra en el
 * backend asociado a la localidad elegida. Devuelve true si quedo
 * todo activado correctamente.
 */
export async function activarAlertasPush(localidadClave: string): Promise<{ ok: boolean; error?: string }> {
  const soportado = await verificarSoportePush();
  if (!soportado) {
    return { ok: false, error: 'Este navegador no soporta notificaciones push. Probá con Chrome en Android.' };
  }

  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') {
    return { ok: false, error: 'No diste el permiso de notificaciones. Sin eso no podemos avisarte.' };
  }

  try {
    const messaging = getMessaging();
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!token) {
      return { ok: false, error: 'No se pudo generar el token de notificaciones. Probá de nuevo en unos minutos.' };
    }

    const resp = await fetch(`${BACKEND_URL}/notificaciones/suscribir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, localidad: localidadClave }),
    });
    if (!resp.ok) {
      return { ok: false, error: 'El servidor no pudo guardar tu suscripción. Probá de nuevo.' };
    }

    // Guardamos localmente cual localidad eligio, para mostrar el
    // estado ("Alertas activadas para Barranqueras") sin tener que
    // volver a preguntarle al backend.
    localStorage.setItem('alertas_push_localidad', localidadClave);

    return { ok: true };
  } catch (e) {
    console.error('Error activando push:', e);
    return { ok: false, error: 'Ocurrió un error activando las alertas. Probá de nuevo.' };
  }
}

export function localidadPushActiva(): string | null {
  return localStorage.getItem('alertas_push_localidad');
}

/**
 * Escucha mensajes push que llegan CON LA APP ABIERTA (foreground).
 * Los que llegan con la app cerrada los maneja directamente
 * public/firebase-messaging-sw.js, no este archivo.
 */
export async function escucharPushEnPrimerPlano(callback: (titulo: string, cuerpo: string) => void) {
  const soportado = await verificarSoportePush();
  if (!soportado) return;
  const messaging = getMessaging();
  onMessage(messaging, (payload: any) => {
    callback(
      payload.notification?.title || 'Portal Hídrico Chaco',
      payload.notification?.body || ''
    );
  });
}
