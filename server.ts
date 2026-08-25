import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  CUENCAS_DETALLE,
  LOCALIDADES_DETALLE,
  BARRIOS_VULNERABLES_DETALLE,
  ESTACIONES_HIDROMETRICAS,
  CRECIDAS_HISTORICAS,
  CENTROS_EVACUACION_DATA,
  RECURSOS_OPERATIVOS_DATA,
  TICKETS_SOS_INICIALES,
  REPORTES_CIUDADANOS_INICIALES,
  ALERTAS_PRE_VERIFICACION_INICIALES,
  KANBAN_TASKS_INICIALES,
  INDICADORES_GLOBALES,
  CONTACTOS_EMERGENCIA,
} from './src/data/chacoData';
import {
  calcularTendenciaLineal,
  proyectarHorasUmbral,
  determinarFaseDecision,
  calcularTiempoConcentracionKirpich,
} from './src/utils/hydrologyEngine';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory state with persistence during runtime
let ticketsSOS = [...TICKETS_SOS_INICIALES];
let reportesCiudadanos = [...REPORTES_CIUDADANOS_INICIALES];
let recursosOperativos = [...RECURSOS_OPERATIVOS_DATA];
let centrosEvacuacion = [...CENTROS_EVACUACION_DATA];
let alertasPreVerificacion = [...ALERTAS_PRE_VERIFICACION_INICIALES];
let kanbanTasks = [...KANBAN_TASKS_INICIALES];
let localidadesData = { ...LOCALIDADES_DETALLE };
let cuencasData = { ...CUENCAS_DETALLE };

// Lazy initialization of Gemini AI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ---------------------------------------------------------------------
// API ENDPOINTS
// ---------------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    servicio: 'Portal Hídrico Chaco - Sistema de Emergencias API',
  });
});

// Resumen general & estadísticas
app.get('/api/resumen', (req, res) => {
  const totalLocalidades = Object.keys(localidadesData).length;
  const alertasActivas = Object.values(localidadesData).filter(
    (l) => l.estado === 'ALERTA' || l.estado === 'EVACUACION'
  ).length;
  const sosPendientes = ticketsSOS.filter((t) => t.estado === 'PENDIENTE' || t.estado === 'DESPACHADO').length;
  const reportesRecientes = reportesCiudadanos.length;
  const refugiosHabilitados = centrosEvacuacion.filter((c) => c.abierto).length;

  res.json({
    totalLocalidades,
    alertasActivas,
    sosPendientes,
    reportesRecientes,
    refugiosHabilitados,
    indicadores: INDICADORES_GLOBALES,
    contactos: CONTACTOS_EMERGENCIA,
    timestamp: new Date().toISOString(),
  });
});

// Cuencas y Morfometría Provincial
app.get('/api/cuencas', (req, res) => {
  const cuencasConCalculos = Object.entries(cuencasData).map(([key, cuenca]) => {
    const horasAlerta = proyectarHorasUmbral(
      cuenca.nivel_actual_m,
      cuenca.umbral_alerta,
      0.05
    );
    const fase = determinarFaseDecision(
      cuenca.nivel_actual_m,
      cuenca.umbral_alerta,
      cuenca.umbral_evacuacion,
      horasAlerta
    );
    const tc = calcularTiempoConcentracionKirpich(cuenca.parametros_forma.longitud_axial_km);

    return {
      ...cuenca,
      tiempo_concentracion_calculado_tc: tc,
      fase_actual: fase.fase,
      fase_info: fase,
    };
  });

  res.json({ cuencas: cuencasConCalculos });
});

// Localidades
app.get('/api/localidades', (req, res) => {
  const locs = Object.entries(localidadesData).map(([key, loc]) => {
    const horas = proyectarHorasUmbral(loc.nivel_metros, loc.umbral_alerta, loc.tasa_cambio_m_dia || 0.02);
    const fase = determinarFaseDecision(loc.nivel_metros, loc.umbral_alerta, loc.umbral_evacuacion, horas);

    return {
      ...loc,
      fase_calculada: fase.fase,
      fase_info: fase,
      horas_para_alerta: horas,
    };
  });

  res.json({ localidades: locs });
});

// Barrios Vulnerables
app.get('/api/barrios', (req, res) => {
  res.json({ barrios: Object.values(BARRIOS_VULNERABLES_DETALLE) });
});

// Estaciones Hidrométricas & Series Temporales
app.get('/api/estaciones', (req, res) => {
  const estacionesConAnalisis = ESTACIONES_HIDROMETRICAS.map((est) => {
    const tendencia = calcularTendenciaLineal(est.historico);
    const horasAlerta = proyectarHorasUmbral(est.altura_actual_m, est.nivel_alerta_m, tendencia.tasaCambioMDia);
    const fase = determinarFaseDecision(est.altura_actual_m, est.nivel_alerta_m, est.nivel_evacuacion_m, horasAlerta);

    return {
      ...est,
      analisis_tendencia: tendencia,
      horas_para_alerta: horasAlerta,
      fase_actual: fase.fase,
      fase_info: fase,
    };
  });

  res.json({ estaciones: estacionesConAnalisis });
});

// Tickets SOS (Emergencias Ciudadanas)
app.get('/api/sos', (req, res) => {
  res.json({ tickets: ticketsSOS });
});

app.post('/api/sos', (req, res) => {
  const {
    nombre,
    telefono,
    localidad,
    direccion,
    lat,
    lon,
    personasAfectadas,
    personasVulnerables,
    alturaAguaCm,
    nivelUrgencia,
    requiere,
    notasDespacho,
  } = req.body;

  if (!nombre || !telefono || !localidad) {
    return res.status(400).json({ error: 'Nombre, teléfono y localidad son obligatorios' });
  }

  const nuevoTicket = {
    id: `sos_${Date.now()}`,
    timestamp: new Date().toISOString(),
    nombre,
    telefono,
    localidad,
    direccion: direccion || 'Ubicación geolocalizada por GPS',
    lat: lat || -27.45,
    lon: lon || -58.98,
    personasAfectadas: Number(personasAfectadas) || 1,
    personasVulnerables: personasVulnerables || { ninos: 0, ancianos: 0, movilidadReducida: 0 },
    alturaAguaCm: Number(alturaAguaCm) || 10,
    nivelUrgencia: nivelUrgencia || 'ALTO',
    requiere: requiere || ['CAMION_4X4', 'ASISTENCIA_MEDICA'],
    estado: 'PENDIENTE' as const,
    notasDespacho: notasDespacho || 'Solicitud generada vía Botón SOS del Portal',
  };

  ticketsSOS.unshift(nuevoTicket);
  res.status(201).json({ ok: true, ticket: nuevoTicket });
});

app.patch('/api/sos/:id', (req, res) => {
  const { id } = req.params;
  const { estado, unidadAsignada, notasDespacho } = req.body;

  const ticketIndex = ticketsSOS.findIndex((t) => t.id === id);
  if (ticketIndex === -1) {
    return res.status(404).json({ error: 'Ticket no encontrado' });
  }

  if (estado) ticketsSOS[ticketIndex].estado = estado;
  if (unidadAsignada !== undefined) ticketsSOS[ticketIndex].unidadAsignada = unidadAsignada;
  if (notasDespacho !== undefined) ticketsSOS[ticketIndex].notasDespacho = notasDespacho;

  res.json({ ok: true, ticket: ticketsSOS[ticketIndex] });
});

app.delete('/api/sos/:id', (req, res) => {
  const { id } = req.params;
  const idx = ticketsSOS.findIndex((t) => t.id === id);
  if (idx !== -1) {
    ticketsSOS.splice(idx, 1);
  }
  res.json({ ok: true, message: 'Ticket eliminado correctamente' });
});

// Reportes Ciudadanos (/reportar)
app.get('/api/reportes', (req, res) => {
  res.json({ reportes: reportesCiudadanos });
});

app.post('/api/reportes', (req, res) => {
  const { nombre, localidad, barrio, calle, lat, lon, nivelAguaAprox, descripcion, fotoUrl } = req.body;

  if (!nombre || !localidad || !calle) {
    return res.status(400).json({ error: 'Nombre, localidad y calle son obligatorios' });
  }

  const nuevoReporte = {
    id: `rep_${Date.now()}`,
    timestamp: new Date().toISOString(),
    nombre,
    localidad,
    barrio: barrio || '',
    calle,
    lat: lat || -27.4511,
    lon: lon || -58.9866,
    nivelAguaAprox: nivelAguaAprox || 'CORDON',
    descripcion: descripcion || 'Reporte de anegamiento ingresado por vecino.',
    fotoUrl: fotoUrl || '',
    verificado: false,
    impacto: (nivelAguaAprox === 'ENTRO_A_CASA' || nivelAguaAprox === 'CALLE_CORTADA' ? 'GRAVE' : 'MODERADO') as 'GRAVE' | 'MODERADO',
  };

  reportesCiudadanos.unshift(nuevoReporte);
  res.status(201).json({ ok: true, reporte: nuevoReporte });
});

app.delete('/api/reportes/:id', (req, res) => {
  const { id } = req.params;
  const idx = reportesCiudadanos.findIndex((r) => r.id === id);
  if (idx !== -1) {
    reportesCiudadanos.splice(idx, 1);
  }
  res.json({ ok: true, message: 'Reporte eliminado correctamente' });
});

// Recursos Operativos (Bomberos / Defensa Civil)
app.get('/api/recursos', (req, res) => {
  res.json({ recursos: recursosOperativos });
});

app.patch('/api/recursos/:id', (req, res) => {
  const { id } = req.params;
  const { estado, asignadoA } = req.body;

  const idx = recursosOperativos.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Recurso no encontrado' });

  if (estado) recursosOperativos[idx].estado = estado;
  if (asignadoA !== undefined) recursosOperativos[idx].asignadoA = asignadoA;

  res.json({ ok: true, recurso: recursosOperativos[idx] });
});

// Centros de Evacuación / Refugios
app.get('/api/refugios', (req, res) => {
  res.json({ refugios: centrosEvacuacion });
});

app.patch('/api/refugios/:id', (req, res) => {
  const { id } = req.params;
  const { personasAlojadadas, abierto } = req.body;

  const idx = centrosEvacuacion.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Refugio no encontrado' });

  if (personasAlojadadas !== undefined) centrosEvacuacion[idx].personasAlojadadas = Number(personasAlojadadas);
  if (abierto !== undefined) centrosEvacuacion[idx].abierto = Boolean(abierto);

  res.json({ ok: true, refugio: centrosEvacuacion[idx] });
});

// Pre-Alertas (Verificación Humana)
app.get('/api/pre-alertas', (req, res) => {
  res.json({ alertas: alertasPreVerificacion });
});

app.post('/api/pre-alertas/accion', (req, res) => {
  const { id, accion, revisor } = req.body;
  const idx = alertasPreVerificacion.findIndex((a) => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Alerta no encontrada' });

  if (accion === 'APROBAR') {
    alertasPreVerificacion[idx].estado = 'APROBADA_DIFUNDIDA';
    alertasPreVerificacion[idx].revisor = revisor || 'Comandante de Turno';
  } else if (accion === 'DESCARTAR') {
    alertasPreVerificacion[idx].estado = 'DESCARTADA_FALSO_POSITIVO';
    alertasPreVerificacion[idx].revisor = revisor || 'Comandante de Turno';
  }

  res.json({ ok: true, alerta: alertasPreVerificacion[idx] });
});

// Crecidas Históricas
app.get('/api/historico', (req, res) => {
  res.json({ crecidas: CRECIDAS_HISTORICAS });
});

// Kanban Board
app.get('/api/kanban', (req, res) => {
  res.json({ tasks: kanbanTasks });
});

app.post('/api/kanban', (req, res) => {
  const { id, estado, titulo, descripcion, prioridad, categoria, asignado } = req.body;
  if (id) {
    const idx = kanbanTasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      if (estado) kanbanTasks[idx].estado = estado;
      if (titulo) kanbanTasks[idx].titulo = titulo;
      if (descripcion) kanbanTasks[idx].descripcion = descripcion;
      if (prioridad) kanbanTasks[idx].prioridad = prioridad;
      if (categoria) kanbanTasks[idx].categoria = categoria;
      if (asignado) kanbanTasks[idx].asignado = asignado;
      return res.json({ ok: true, task: kanbanTasks[idx] });
    }
  }

  const newTask = {
    id: `k_${Date.now()}`,
    titulo: titulo || 'Nueva tarea operativa',
    descripcion: descripcion || '',
    prioridad: prioridad || 'MEDIA',
    estado: estado || 'TODO',
    categoria: categoria || 'OPERACIONES_CAMPO',
    asignado: asignado || 'Personal de Guardia',
  };
  kanbanTasks.push(newTask);
  res.status(201).json({ ok: true, task: newTask });
});

// Indicadores Globales y Ambientales
app.get('/api/indicadores', (req, res) => {
  res.json({
    indicadores: INDICADORES_GLOBALES,
    contactos: CONTACTOS_EMERGENCIA,
    timestamp: new Date().toISOString(),
  });
});

// Actualización de Localidad (Telemetría / Alertas)
app.patch('/api/localidades/:id', (req, res) => {
  const { id } = req.params;
  const { nivel_metros, precipitacion_acumulada_mm, estado } = req.body;

  if (localidadesData[id]) {
    if (nivel_metros !== undefined) localidadesData[id].nivel_metros = Number(nivel_metros);
    if (precipitacion_acumulada_mm !== undefined)
      localidadesData[id].precipitacion_acumulada_mm = Number(precipitacion_acumulada_mm);
    if (estado !== undefined) localidadesData[id].estado = estado;
    localidadesData[id].ultima_verificacion = new Date().toISOString();

    return res.json({ ok: true, localidad: localidadesData[id] });
  }

  res.status(404).json({ error: `Localidad ${id} no encontrada` });
});

// Actualización de Estación Hidrométrica
app.patch('/api/estaciones/:id', (req, res) => {
  const { id } = req.params;
  const { altura_actual_m } = req.body;

  const idx = ESTACIONES_HIDROMETRICAS.findIndex((e) => e.id === id);
  if (idx !== -1 && altura_actual_m !== undefined) {
    ESTACIONES_HIDROMETRICAS[idx].altura_actual_m = Number(altura_actual_m);
    ESTACIONES_HIDROMETRICAS[idx].timestamp_consulta = new Date().toISOString();
    return res.json({ ok: true, estacion: ESTACIONES_HIDROMETRICAS[idx] });
  }

  res.status(404).json({ error: `Estación ${id} no encontrada` });
});

// Sincronización Masiva de Telemetría (Compatible con Cuencas-Bot / APA / Scrapers)
app.post('/api/telemetria/sync', (req, res) => {
  const { estaciones: nuevasEstaciones, localidades: nuevasLocalidades, fuente = 'Cuencas-Bot' } = req.body;

  if (nuevasEstaciones && Array.isArray(nuevasEstaciones)) {
    for (const nEst of nuevasEstaciones) {
      const idx = ESTACIONES_HIDROMETRICAS.findIndex((e) => e.id === nEst.id);
      if (idx !== -1 && nEst.altura_actual_m !== undefined) {
        ESTACIONES_HIDROMETRICAS[idx].altura_actual_m = Number(nEst.altura_actual_m);
        ESTACIONES_HIDROMETRICAS[idx].timestamp_consulta = new Date().toISOString();
      }
    }
  }

  if (nuevasLocalidades && typeof nuevasLocalidades === 'object') {
    for (const [key, val] of Object.entries(nuevasLocalidades as Record<string, any>)) {
      if (localidadesData[key]) {
        if (val.nivel_metros !== undefined) localidadesData[key].nivel_metros = Number(val.nivel_metros);
        if (val.precipitacion_acumulada_mm !== undefined)
          localidadesData[key].precipitacion_acumulada_mm = Number(val.precipitacion_acumulada_mm);
        if (val.estado !== undefined) localidadesData[key].estado = val.estado;
        localidadesData[key].ultima_verificacion = new Date().toISOString();
      }
    }
  }

  res.json({
    ok: true,
    fuente,
    timestamp: new Date().toISOString(),
    mensaje: 'Telemetría sincronizada correctamente en el backend',
  });
});

// Estado de Integración de Cuencas-Bot
app.get('/api/cuencas-bot/status', (req, res) => {
  res.json({
    bot: '@cuencas_chaco_bot',
    estado: 'ACTIVO_EN_LINEA',
    version: '2.4.0',
    canales: ['telegram', 'web_portal', 'api_rest', 'defensa_civil_eoc'],
    estacionesConectadas: ESTACIONES_HIDROMETRICAS.length,
    localidadesMonitoreadas: Object.keys(localidadesData).length,
    cuencasActivas: Object.keys(cuencasData).length,
    timestamp: new Date().toISOString(),
  });
});

// Endpoint de Diagnóstico y Test de Vulnerabilidad
app.post('/api/vulnerabilidad/test', (req, res) => {
  const { barrioId, lluviaMm = 45, nivelOffsetM = 0.3, saturacionSuelo = 'MODERADA' } = req.body;

  const barrio = BARRIOS_VULNERABLES_DETALLE[barrioId] || Object.values(BARRIOS_VULNERABLES_DETALLE)[0];
  const locPadre = barrio ? localidadesData[barrio.localidad_padre] : null;
  const baseNivel = locPadre ? locPadre.nivel_metros : 3.22;
  const riverNivel = baseNivel + Number(nivelOffsetM);

  const rainFactor = Math.min(45, (Number(lluviaMm) / 150) * 45);
  const riverFactor = Math.min(40, (riverNivel / 6.5) * 40);
  const soilFactor = saturacionSuelo === 'SECO' ? 0 : saturacionSuelo === 'MODERADA' ? 12 : 25;
  const terrainFactor =
    barrio.id === 'san_pedro_pescador' || barrio.id === 'antequeras' || barrio.id === 'paraje_isla_soto' ? 15 : 8;

  const score = Math.min(100, Math.max(10, Math.round(rainFactor + riverFactor + soilFactor + terrainFactor)));

  let estadoRiesgo = 'BAJO';
  if (score >= 75) estadoRiesgo = 'CRITICO';
  else if (score >= 50) estadoRiesgo = 'ALTO';
  else if (score >= 30) estadoRiesgo = 'MODERADO';

  res.json({
    ok: true,
    barrio,
    parametros: { lluviaMm, nivelOffsetM, saturacionSuelo, riverNivelEstimado: riverNivel },
    score,
    estadoRiesgo,
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------
// BOT CONVERSACIONAL & ASISTENTE IA GEMINI
// ---------------------------------------------------------------------

app.post('/api/bot/chat', async (req, res) => {
  const { mensaje, canal = 'telegram' } = req.body;

  if (!mensaje) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  const cmd = mensaje.trim().toLowerCase();

  // 1. Manejo de comandos estándar del bot de Cuencas Chaco
  if (cmd === '/start' || cmd === 'inicio' || cmd === 'menu') {
    return res.json({
      respuesta:
        `👋 <b>Bienvenido al Portal Hídrico y Emergencias Chaco</b> (@cuencas_chaco_bot)\n\n` +
        `Monitoreo hidrológico en tiempo real de los ríos Paraná, Bermejo, Paraguay y Pilcomayo, más gestión de emergencias hídricas.\n\n` +
        `📋 <b>Comandos disponibles:</b>\n` +
        `• <code>/estado</code> - Resumen del río en Barranqueras y niveles principales\n` +
        `• <code>/cuencas</code> - Lista y morfometría de las 4 cuencas oficiales\n` +
        `• <code>/localidad [nombre]</code> - Consulta de tu localidad (ej. /localidad barranqueras)\n` +
        `• <code>/alertas</code> - Fases activas y umbrales dinámicos\n` +
        `• <code>/sos</code> - Botón de rescate y auxilio geolocalizado\n` +
        `• <code>/reportar</code> - Reportar anegamiento o calle cortada\n` +
        `• <code>/refugios</code> - Centros de evacuación habilitados\n` +
        `• <code>/barrios</code> - Barrios vulnerables y cotas críticas\n` +
        `• <code>/clima</code> - Estado ENSO/ONI y lluvias acumuladas\n` +
        `• <code>/emergencia</code> - Teléfonos de Bomberos, Defensa Civil y SAME\n\n` +
        `O simplemente escribime tu consulta (ej. <i>¿Cómo está el río Bermejo en El Sauzalito?</i>).`,
      opciones: ['/estado', '/cuencas', '/alertas', '/sos', '/reportar', '/refugios'],
    });
  }

  if (cmd === '/estado' || cmd.includes('estado general')) {
    const b = localidadesData['barranqueras'];
    const sauz = localidadesData['el_sauzalito'];
    const ptoBermejo = localidadesData['puerto_bermejo'];

    return res.json({
      respuesta:
        `🌊 <b>ESTADO HIDROLÓGICO ACTUAL DEL CHACO</b>\n\n` +
        `📍 <b>Barranqueras (Río Paraná):</b> ${b.nivel_metros.toFixed(2)} m (Alerta: ${b.umbral_alerta}m | Evac: ${b.umbral_evacuacion}m) — 🟢 <b>NORMAL</b>\n` +
        `📍 <b>Puerto Bermejo (Río Paraguay):</b> ${ptoBermejo.nivel_metros.toFixed(2)} m — 🟢 <b>NORMAL</b>\n` +
        `📍 <b>El Sauzalito (Río Bermejo):</b> ${sauz.nivel_metros.toFixed(2)} m — 🟡 <b>ATENCIÓN</b> (+15 cm/día)\n\n` +
        `📊 <i>Fuente oficial: Prefectura Naval Argentina y APA Chaco.</i>\n` +
        `Escribí <code>/alertas</code> para ver el semáforo completo o <code>/sos</code> si requerís auxilio.`,
      opciones: ['/alertas', '/cuencas', '/refugios', '/sos'],
    });
  }

  if (cmd === '/cuencas' || cmd.includes('cuencas')) {
    return res.json({
      respuesta:
        `🗺️ <b>CUENCAS MONITOREADAS (IIGHI - CONICET / UNNE / APA Chaco):</b>\n\n` +
        `1️⃣ <b>Río Bermejo:</b> Coef. Gravelius 2.98 (Muy alargada, modera crecida). Nivel: 2.80m.\n` +
        `2️⃣ <b>Río Paraná:</b> Macrocuenca internacional. Estación Barranqueras: 3.22m.\n` +
        `3️⃣ <b>Río Paraguay:</b> Influenciado por el Pantanal. Estación Bermejo: 4.10m.\n` +
        `4️⃣ <b>Río Pilcomayo:</b> Transporte de sedimentos y crecidas estivales. Nivel: 1.95m.\n\n` +
        `Consultá una cuenca escribiendo su nombre (ej: <i>cuenca bermejo</i>).`,
      opciones: ['/localidad resistencia', '/localidad barranqueras', '/localidad el_sauzalito', '/alertas'],
    });
  }

  if (cmd.startsWith('/localidad') || cmd.startsWith('localidad')) {
    const partes = cmd.split(' ');
    const query = partes.slice(1).join('_').trim() || 'barranqueras';
    const foundKey = Object.keys(localidadesData).find((k) => k.includes(query) || query.includes(k));
    const loc = foundKey ? localidadesData[foundKey] : localidadesData['barranqueras'];

    return res.json({
      respuesta:
        `📍 <b>${loc.nombre}</b> (Cuenca: ${loc.cuenca_clave.toUpperCase()})\n` +
        `• Nivel actual: <b>${loc.nivel_metros.toFixed(2)} m</b>\n` +
        `• Umbral de Alerta: ${loc.umbral_alerta.toFixed(2)} m\n` +
        `• Umbral de Evacuación: ${loc.umbral_evacuacion.toFixed(2)} m\n` +
        `• Lluvia acumulada 24h: ${loc.precipitacion_acumulada_mm} mm\n` +
        `• Estado: <b>${loc.emoji} ${loc.estado}</b>\n` +
        `• Fuente: ${loc.fuente}\n` +
        `• Última verificación: ${loc.ultima_verificacion}`,
      opciones: ['/estado', '/barrios', '/refugios', '/sos'],
    });
  }

  if (cmd === '/refugios' || cmd.includes('refugio') || cmd.includes('centro')) {
    const lista = centrosEvacuacion
      .map(
        (c) =>
          `🏠 <b>${c.nombre}</b> (${c.localidad})\n📍 ${c.direccion} | Capacidad: ${c.capacidadTotal} personas (Ocupados: ${c.personasAlojadadas})\n📞 Resp: ${c.responsable} (${c.telefono})`
      )
      .join('\n\n');

    return res.json({
      respuesta: `🛡️ <b>CENTROS DE EVACUACIÓN Y ALBERGUES HABILITADOS:</b>\n\n${lista}`,
      opciones: ['/sos', '/emergencia', '/alertas'],
    });
  }

  if (cmd === '/emergencia' || cmd === '/telefonos') {
    const tels = CONTACTOS_EMERGENCIA.map((c) => `📞 <b>${c.entidad}:</b> ${c.telefono} (${c.descripcion})`).join('\n');
    return res.json({
      respuesta: `🚨 <b>NÚMEROS DE EMERGENCIA DEL CHACO:</b>\n\n${tels}\n\nEn caso de anegamiento con riesgo de vida, presioná el botón <b>SOS</b> o escribí <code>/sos</code>.`,
      opciones: ['/sos', '/reportar', '/refugios'],
    });
  }

  if (cmd === '/sos') {
    return res.json({
      respuesta:
        `🚨 <b>CENTRO DE PEDIDO DE AUXILIO SOS</b>\n\n` +
        `Podés registrar un pedido de rescate inmediato directamente para Defensa Civil y Bomberos.\n` +
        `Completá el formulario en pantalla con tu ubicación GPS, cantidad de personas atrapadas y altura del agua en tu vivienda.`,
      action: 'OPEN_SOS_MODAL',
      opciones: ['/refugios', '/emergencia', '/estado'],
    });
  }

  if (cmd === '/reportar') {
    return res.json({
      respuesta:
        `📸 <b>REPORTE CIUDADANO EN TIEMPO REAL</b>\n\n` +
        `Tu reporte ayuda a alertar a los vecinos y guiar a las cuadrillas de bombeo.\n` +
        `Ingresá la calle, foto o descripción del anegamiento puntual.`,
      action: 'OPEN_REPORT_MODAL',
      opciones: ['/estado', '/barrios', '/refugios'],
    });
  }

  // 2. Respuesta con IA Gemini si no coincide con un comando rígido
  const ai = getGeminiClient();
  if (ai) {
    const prompt = `Sos el Asistente Virtual Oficial del Portal Hídrico Chaco y Gestión de Emergencias (@cuencas_chaco_bot).
Respondé en español argentino, de manera clara, humana, concisa y tranquilizadora o precisa según la gravedad.
Contexto hidrológico del Chaco:
- Río Paraná en Barranqueras: ${localidadesData['barranqueras']?.nivel_metros || 3.22} m (Normal, umbral alerta 6.00m, evacuación 6.50m).
- Río Bermejo en El Sauzalito: ${localidadesData['el_sauzalito']?.nivel_metros || 3.10} m (Atención por crecimiento de +15cm/día, umbral alerta 4.50m).
- Río Paraguay en Puerto Bermejo: ${localidadesData['puerto_bermejo']?.nivel_metros || 2.75} m (Normal, umbral alerta 6.50m).
- Barrios vulnerables monitoreados: San Pedro Pescador, Paraje Las Tres Bocas (Puerto Vilelas), Villa Río Negro, Parajes Wichí Sauzalito.
- Centros de evacuación habilitados: Polideportivo Jaime Zapata (Resistencia), Escuela 422 (Barranqueras), SUM El Sauzalito.
- Números de auxilio: Defensa Civil 103, Bomberos 100, Policía 911, SAME 107.

Pregunta del ciudadano/operador: "${mensaje}"
Respondé en 2 a 4 párrafos cortos y destacá recomendaciones de seguridad si corresponde.`;

    const modelsToTry = ['gemini-3.7-flash', 'gemini-3.1-flash-lite'];
    for (const modelName of modelsToTry) {
      try {
        const geminiRes = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });

        if (geminiRes.text) {
          return res.json({
            respuesta: geminiRes.text,
            opciones: ['/estado', '/cuencas', '/refugios', '/sos'],
          });
        }
      } catch (error: any) {
        console.warn(`Aviso: Chat con ${modelName} (${error?.message || '503'}), probando alternativa...`);
      }
    }
  }

  // Fallback sin Gemini o con error temporal
  return res.json({
    respuesta:
      `ℹ️ <b>Información Oficial Chaco:</b> Los ríos Paraná y Paraguay se encuentran en niveles normales (Barranqueras: 3.22m). Cuenca del Bermejo en fase de atención preventiva en El Sauzalito.\n\nPara consultar datos específicos utilizá <code>/estado</code>, para centros de asistencia <code>/refugios</code> o para rescate <code>/sos</code>.`,
    opciones: ['/estado', '/cuencas', '/alertas', '/sos'],
  });
});

// Generación de SITREP (Informe de Situación Operativa)
function generarSITREPDinamico(): string {
  const b = localidadesData['barranqueras'] || { nivel_metros: 3.22, umbral_alerta: 6.0, umbral_evacuacion: 6.5 };
  const sauz = localidadesData['el_sauzalito'] || { nivel_metros: 3.10, umbral_alerta: 4.5, umbral_evacuacion: 5.2 };
  const ptoBerm = localidadesData['puerto_bermejo'] || { nivel_metros: 2.75, umbral_alerta: 6.5, umbral_evacuacion: 7.2 };
  const sosPendientes = ticketsSOS.filter((t) => t.estado === 'PENDIENTE').length;
  const refugiosAbiertos = centrosEvacuacion.filter((c) => c.abierto).length;
  const fechaHoy = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba' });

  return `================================================================================
GOBIERNO DEL CHACO • ADMINISTRACIÓN PROVINCIAL DEL AGUA • DEFENSA CIVIL
INFORME DE SITUACIÓN OPERATIVA E HIDROLÓGICA (SITREP)
EMITIDO: ${fechaHoy}
================================================================================

1. RESUMEN EJECUTIVO DE AMENAZA HIDROMETEOROLÓGICA:
• Río Paraná (Barranqueras): ${b.nivel_metros.toFixed(2)} m (Alerta: ${b.umbral_alerta} m | Evacuación: ${b.umbral_evacuacion} m) -> ESTADO NORMAL (Margen de seguridad: ${(b.umbral_alerta - b.nivel_metros).toFixed(2)} m).
• Río Bermejo (El Sauzalito): ${sauz.nivel_metros.toFixed(2)} m (Alerta: ${sauz.umbral_alerta} m) -> FASE ATENCIÓN (+15 cm/día por pulsos de cuenca alta).
• Río Paraguay (Puerto Bermejo): ${ptoBerm.nivel_metros.toFixed(2)} m -> ESTADO NORMAL.
• Monitoreo ENSO / ONI: Neutral (+0.45), cobertura NDVI estable (0.48).

2. PUNTOS CRÍTICOS Y BARRIOS VULNERABLES:
• San Pedro Pescador y Paraje Antequeras: Monitoreo costero activo sin afectación de calzada.
• Paraje Las Tres Bocas e Isla del Soto (Puerto Vilelas): Valle aluvial bajo vigilancia por drenaje del Paranacito.
• Cuenca Río Negro y Salado: Compuertas y diques reguladores de APA funcionando con normalidad.
• Comunidades del Impenetrable: Vigilancia en accesos por Ruta Provincial 3 y parajes de ribera.

3. DISPOSICIÓN DE RECURSOS Y OPERACIONES DE CAMPO:
• Tickets de Auxilio SOS: ${ticketsSOS.length} registrados (${sosPendientes} pendientes de despacho).
• Centros de Evacuación / Albergues: ${refugiosAbiertos} habilitados con capacidad disponible.
• Recursos Operativos: 4 móviles 4x4, 2 lanchas Zodiak y dotaciones de rescate en estado DISPONIBLE.
• Guardias Activas: Bomberos Voluntarios Barranqueras y Defensa Civil Chaco en alerta 24hs.

4. DIRECTIVAS OPERATIVAS (PRÓXIMAS 24 HORAS):
• Mantener guardia activa en la Mesa de Operaciones de Bomberos y Defensa Civil (Líneas 100 / 103).
• Continuar lecturas hidrométricas cada 3 horas en estaciones costeras.
• Alistamiento de brigadas de rescate acuático ante variaciones repentinas del Bermejo.
• Informar a intendencias ribereñas el estado de transitabilidad de caminos vecinales.`;
}

app.post('/api/ai/sitrep', async (req, res) => {
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({ sitrep: generarSITREPDinamico() });
  }

  const prompt = `Generá un Informe de Situación Operativa (SITREP) técnico y conciso para la Mesa de Enlace de Defensa Civil y Bomberos del Chaco.
Datos actuales:
- Paraná en Barranqueras: ${localidadesData['barranqueras']?.nivel_metros || 3.22} m (Normal, Alerta 6.00m).
- Bermejo en El Sauzalito: ${localidadesData['el_sauzalito']?.nivel_metros || 3.10} m (Subiendo 15 cm/día, alerta 4.50m).
- Paraguay en Puerto Bermejo: ${localidadesData['puerto_bermejo']?.nivel_metros || 2.75} m (Normal).
- Precipitaciones 24h promedio: 22.4 mm (Chaco oriental) y 45 mm (El Impenetrable).
- Índice ONI: Neutro (+0.45), NDVI vegetación 0.48 (Estable).
- Tickets SOS registrados: ${ticketsSOS.length} (${ticketsSOS.filter((t) => t.estado === 'PENDIENTE').length} pendientes).
- Refugios activos: ${centrosEvacuacion.filter((c) => c.abierto).length} habilitados.

Estructurá el informe con:
1. Resumen Ejecutivo de Amenaza Hidrometeorológica
2. Puntos Críticos y Barrios Vulnerables Bajo Observación
3. Disposición de Recursos (Móviles 4x4, Lanchas Zodiak, Dotaciones de Guardia, Refugios)
4. Directivas Operativas para las Próximas 24 Horas.`;

  // Intentar con modelos disponibles con fallback
  const modelsToTry = ['gemini-3.7-flash', 'gemini-3.1-flash-lite'];
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      if (response.text) {
        return res.json({ sitrep: response.text });
      }
    } catch (err: any) {
      console.warn(`Aviso: Intento con ${modelName} no completado (${err?.message || '503/timeout'}), probando fallback...`);
    }
  }

  // Si los modelos están saturados con 503, entregar el SITREP dinámico calculado en tiempo real
  return res.json({ sitrep: generarSITREPDinamico() });
});

// ---------------------------------------------------------------------
// VITE INTEGRATION & SERVER START
// ---------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Portal Hídrico Chaco Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
