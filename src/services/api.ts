/**
 * Conexión al backend REAL (cuencas-bot, FastAPI en Render).
 *
 * Antes, App.tsx llamaba a rutas locales (/api/cuencas, /api/sos, etc.)
 * servidas por server.ts con datos en memoria de Node. Ahora se llama
 * DIRECTO al backend de Python que ya está en producción, sin pasar
 * por ningún servidor intermedio - así el despliegue en Vercel puede
 * ser un sitio estático simple, sin necesidad de correr Express ahí.
 *
 * IMPORTANTE - datos que tu backend real todavía NO tiene:
 * - Cuenca: nombre_oficial, colector_principal, afluentes, desemboca_en,
 *   tipo, departamentos, bbox_aprox, color_hex, parametros_forma
 *   (área, Gravelius, etc.) -> se completan acá con los datos estáticos
 *   de chacoData.ts (son datos de referencia, no cambian dia a dia).
 * - Localidad: emoji, fase_calculada, tasa_cambio_m_dia, horas_para_alerta
 *   -> se completan con valores por defecto o se calculan localmente.
 * - TicketSOS.personasVulnerables (niños/ancianos/movilidad reducida
 *   por separado) -> tu backend solo guarda personas_afectadas total,
 *   así que estos quedan en 0 hasta que decidas sumar esos campos
 *   al backend.
 * - ReporteCiudadano.fotoUrl -> sin subida de fotos todavía (pendiente
 *   Supabase Storage).
 *
 * Si en el futuro sumás estos campos a main.py, se pueden sacar los
 * valores por defecto de acá y usar los reales directamente.
 */

import {
  Cuenca,
  Localidad,
  BarrioVulnerable,
  TicketSOS,
  ReporteCiudadano,
} from '../types';
import { CUENCAS_DETALLE, LOCALIDADES_DETALLE, BARRIOS_VULNERABLES_DETALLE, COORDENADAS_RESPALDO } from '../data/chacoData';

// Configurar en Vercel como variable de entorno VITE_API_URL.
// En desarrollo local, usa el backend de Render por defecto.
export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_URL || 'https://cuencas-bot.onrender.com';

async function pedirJSON(ruta: string, opciones?: RequestInit): Promise<any> {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
    ...opciones,
    headers: { 'Content-Type': 'application/json', ...(opciones?.headers || {}) },
  });
  if (!respuesta.ok) {
    throw new Error(`${ruta} respondió ${respuesta.status}`);
  }
  return respuesta.json();
}

// ---------------------------------------------------------------------
// CUENCAS: metadata estática (chacoData.ts) + datos vivos (backend real)
// ---------------------------------------------------------------------
export async function obtenerCuencasReales(): Promise<Record<string, Cuenca>> {
  const data = await pedirJSON('/cuencas');
  const cuencasVivas = data.cuencas as Record<
    string,
    {
      nombre: string;
      estacion: string;
      nivel_metros: number | null;
      umbral_alerta: number | null;
      umbral_evacuacion: number | null;
      fuente: string;
      conectado: boolean;
      ultima_verificacion: string | null;
      estado: 'NORMAL' | 'MONITOREO' | 'ATENCION' | 'ALERTA' | 'EVACUACION' | 'SIN_DATO';
    }
  >;

  const resultado: Record<string, Cuenca> = {};
  for (const [clave, viva] of Object.entries(cuencasVivas)) {
    const estatica = CUENCAS_DETALLE[clave];
    resultado[clave] = {
      ...(estatica || CUENCAS_DETALLE['parana']), // fallback si aparece una cuenca sin metadata estatica
      id: clave,
      nombre: viva.nombre,
      estacion_referencia: viva.estacion,
      nivel_actual_m: viva.nivel_metros,
      umbral_alerta: viva.umbral_alerta,
      umbral_evacuacion: viva.umbral_evacuacion,
      fuente: viva.fuente,
      conectado: viva.conectado,
      ultima_verificacion: viva.ultima_verificacion,
      estado: viva.estado,
    };
  }
  return resultado;
}

// ---------------------------------------------------------------------
// LOCALIDADES
// ---------------------------------------------------------------------
export async function obtenerLocalidadesReales(): Promise<Record<string, Localidad>> {
  const data = await pedirJSON('/localidades');
  const localidadesVivas = data.localidades as Record<
    string,
    {
      nombre: string;
      cuenca_clave: string | null;
      nivel_metros: number | null;
      umbral_alerta: number | null;
      umbral_evacuacion: number | null;
      precipitacion_acumulada_mm: number | null;
      fuente: string;
      conectado: boolean;
      ultima_verificacion: string | null;
      estado: 'NORMAL' | 'MONITOREO' | 'ATENCION' | 'ALERTA' | 'EVACUACION' | 'SIN_DATO';
      emoji: string;
    }
  >;

  const resultado: Record<string, Localidad> = {};
  for (const [clave, viva] of Object.entries(localidadesVivas)) {
    const estatica = LOCALIDADES_DETALLE[clave];
    resultado[clave] = {
      ...(estatica as Localidad),
      id: clave,
      nombre: viva.nombre,
      cuenca_clave: viva.cuenca_clave,
      nivel_metros: viva.nivel_metros,
      umbral_alerta: viva.umbral_alerta,
      umbral_evacuacion: viva.umbral_evacuacion,
      precipitacion_acumulada_mm: viva.precipitacion_acumulada_mm,
      fuente: viva.fuente,
      conectado: viva.conectado,
      ultima_verificacion: viva.ultima_verificacion,
      estado: viva.estado,
      emoji: viva.emoji || estatica?.emoji || '📍',
      lat: estatica?.lat ?? COORDENADAS_RESPALDO[clave]?.lat,
      lon: estatica?.lon ?? COORDENADAS_RESPALDO[clave]?.lon,
    };
  }
  return resultado;
}

// ---------------------------------------------------------------------
// BARRIOS VULNERABLES
// ---------------------------------------------------------------------
export async function obtenerBarriosReales(): Promise<Record<string, BarrioVulnerable>> {
  const data = await pedirJSON('/barrios');
  const barriosVivos = data.barrios as Record<
    string,
    {
      nombre: string;
      localidad_padre: string;
      lat: number;
      lon: number;
      precision: string;
      motivo: string;
      estado: 'NORMAL' | 'ALERTA' | 'EVACUACION';
      emoji: string;
    }
  >;

  const resultado: Record<string, BarrioVulnerable> = {};
  for (const [clave, vivo] of Object.entries(barriosVivos)) {
    const estatico = BARRIOS_VULNERABLES_DETALLE[clave];
    resultado[clave] = {
      ...(estatico as BarrioVulnerable),
      id: clave,
      nombre: vivo.nombre,
      localidad_padre: vivo.localidad_padre,
      lat: vivo.lat,
      lon: vivo.lon,
      motivo: vivo.motivo,
      // Tu backend usa 3 niveles (NORMAL/ALERTA/EVACUACION, heredado de
      // la localidad padre); el frontend usa 4 (SEGURO/RIESGO_MEDIO/
      // RIESGO_ALTO/INUNDADO). Mapeo directo, sin granularidad extra
      // hasta que el backend distinga niveles de alerta mas finos.
      estado_actual: mapearEstadoBarrio(vivo.estado),
    };
  }
  return resultado;
}

// ---------------------------------------------------------------------
// VERTEDEROS (Itaipú/Yacyretá) - alerta temprana para el Paraná
// ---------------------------------------------------------------------
export interface EstadoVertedero {
  nombre: string;
  estado: 'ABIERTO' | 'CERRADO' | 'SIN_DATOS_RECIENTES' | 'SIN_NOTICIAS_RECIENTES' | 'DESCONOCIDO';
  fecha_evento?: string;
  dias_desde_evento?: number;
  titular_fuente?: string;
  link_fuente?: string;
  dias_hasta_corrientes_aprox?: string;
  detalle?: string;
  ultima_verificacion: string;
}

export interface EstadoVertederos {
  vertederos: Record<string, EstadoVertedero>;
  alerta_temprana: { hay_alerta: boolean; avisos: string[] };
  actualizado: string | null;
  aviso?: string;
}

export async function obtenerVertederos(): Promise<EstadoVertederos> {
  return pedirJSON('/vertederos');
}

// ---------------------------------------------------------------------
// AGREGAR a src/services/api.ts, junto a obtenerVertederos() /
// obtenerNotaTecnicaENSO() (mismo patron, mismo archivo).
// ---------------------------------------------------------------------

export interface AlertaSMN {
  id: string;
  titulo: string;
  descripcion: string;
  nivel: string;
  zona: string;
  fuente: string;
  localidades_pluviales_afectadas: string[];
}

export interface EstadoAlertasSMN {
  alertas: AlertaSMN[];
  cantidad: number;
  ultima_verificacion: string | null;
}

export async function obtenerAlertasSMN(): Promise<EstadoAlertasSMN> {
  return pedirJSON('/alertas');
}

// Atajo para usar en el componente de Santa Sylvina (o cualquier otra
// localidad pluvial): filtra solo las alertas que la mencionan por nombre.
export function alertasParaLocalidadPluvial(
  estado: EstadoAlertasSMN,
  claveLocalidad: string
): AlertaSMN[] {
  return estado.alertas.filter((a) =>
    a.localidades_pluviales_afectadas.includes(claveLocalidad)
  );
}

// ---------------------------------------------------------------------
// NOTA TECNICA ENSO (UNNE/UFSM/APA) - contexto climatico regional
// ---------------------------------------------------------------------
export interface NotaTecnicaENSO {
  encontrada: boolean;
  numero?: string;
  titulo?: string;
  descripcion?: string;
  fecha_publicacion?: string;
  doi?: string;
  url_doi?: string;
  url_pdf?: string;
  autores?: string[];
  ultima_verificacion?: string;
  aviso?: string;
}

export async function obtenerNotaTecnicaENSO(): Promise<NotaTecnicaENSO> {
  return pedirJSON('/nota-tecnica-enso');
}

function mapearEstadoBarrio(
  estadoBackend: 'NORMAL' | 'ALERTA' | 'EVACUACION'
): 'SEGURO' | 'RIESGO_MEDIO' | 'RIESGO_ALTO' | 'INUNDADO' {
  switch (estadoBackend) {
    case 'EVACUACION':
      return 'INUNDADO';
    case 'ALERTA':
      return 'RIESGO_MEDIO';
    default:
      return 'SEGURO';
  }
}

// ---------------------------------------------------------------------
// HISTORICO (para HydroTrends / Crecientes Históricas)
// ---------------------------------------------------------------------
export async function obtenerHistoricoReal(
  estacion: string,
  dias: number = 60
): Promise<{ fecha: string; altura_m: number }[]> {
  try {
    const data = await pedirJSON(`/historico/${encodeURIComponent(estacion)}?dias=${dias}`);
    return data.lecturas || [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------
// SOS: crear + listar
// ---------------------------------------------------------------------
export async function crearSOSReal(ticket: Partial<TicketSOS>): Promise<TicketSOS> {
  const payload = {
    nombre: ticket.nombre,
    telefono: ticket.telefono,
    localidad: (ticket.localidad || '').toLowerCase(),
    direccion: ticket.direccion || null,
    lat: ticket.lat,
    lon: ticket.lon,
    personas_afectadas: ticket.personasAfectadas || 1,
    altura_agua_cm: ticket.alturaAguaCm || null,
    nivel_urgencia: ticket.nivelUrgencia || 'ALTO',
    requiere: ticket.requiere || [],
    notas: ticket.notasDespacho || null,
  };
  const data = await pedirJSON('/sos', { method: 'POST', body: JSON.stringify(payload) });
  return adaptarTicketDesdeBackend(data.ticket);
}

export async function listarSOSReales(): Promise<TicketSOS[]> {
  const data = await pedirJSON('/sos');
  return (data.tickets || []).map(adaptarTicketDesdeBackend);
}

function adaptarTicketDesdeBackend(t: any): TicketSOS {
  return {
    id: t.id,
    timestamp: t.timestamp,
    nombre: t.nombre,
    telefono: t.telefono,
    localidad: t.localidad,
    direccion: t.direccion || '',
    lat: t.lat,
    lon: t.lon,
    personasAfectadas: t.personas_afectadas || 1,
    // Tu backend no distingue niños/ancianos/movilidad reducida todavia,
    // asi que queda en 0 hasta que se sume ese detalle a main.py.
    personasVulnerables: { ninos: 0, ancianos: 0, movilidadReducida: 0 },
    alturaAguaCm: t.altura_agua_cm || 0,
    nivelUrgencia: t.nivel_urgencia || 'ALTO',
    requiere: t.requiere || [],
    estado: t.estado || 'PENDIENTE',
    unidadAsignada: t.unidad_asignada || undefined,
    notasDespacho: t.notas_despacho || t.notas || undefined,
  };
}

// ---------------------------------------------------------------------
// REPORTES CIUDADANOS: crear + listar
// ---------------------------------------------------------------------
export async function crearReporteReal(reporte: Partial<ReporteCiudadano>): Promise<ReporteCiudadano> {
  const payload = {
    nombre: reporte.nombre || 'Anónimo',
    localidad: (reporte.localidad || '').toLowerCase(),
    calle: reporte.calle,
    lat: reporte.lat,
    lon: reporte.lon,
    nivel_agua_aprox: reporte.nivelAguaAprox || 'CORDON',
    descripcion: reporte.descripcion || null,
  };
  const data = await pedirJSON('/reportes', { method: 'POST', body: JSON.stringify(payload) });
  return adaptarReporteDesdeBackend(data.reporte);
}

export async function listarReportesReales(): Promise<ReporteCiudadano[]> {
  const data = await pedirJSON('/reportes');
  return (data.reportes || []).map(adaptarReporteDesdeBackend);
}

function adaptarReporteDesdeBackend(r: any): ReporteCiudadano {
  return {
    id: r.id,
    timestamp: r.timestamp,
    nombre: r.nombre,
    localidad: r.localidad,
    barrio: '',
    calle: r.calle,
    lat: r.lat,
    lon: r.lon,
    nivelAguaAprox: r.nivel_agua_aprox || 'CORDON',
    descripcion: r.descripcion || '',
    fotoUrl: undefined, // pendiente: subida de fotos con Supabase Storage
    verificado: false,
    impacto: 'MODERADO',
  };
}
