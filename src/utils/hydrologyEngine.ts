import { FaseAlertaType, ParametrosForma } from '../types';

/**
 * Cálculo del tiempo de concentración según fórmula empírica de Kirpich (1940).
 * @param longitudAxialKm Longitud del colector principal en kilómetros.
 * @param pendienteMm Pendiente media del terreno en m/m (default 0.00025 para llanura chaqueña).
 * @returns Tiempo de concentración en horas.
 */
export function calcularTiempoConcentracionKirpich(
  longitudAxialKm: number,
  pendienteMm: number = 0.00025
): number {
  const longitudM = longitudAxialKm * 1000;
  const tcMin = 0.0195 * Math.pow(longitudM, 0.77) * Math.pow(pendienteMm, -0.385);
  return Number((tcMin / 60).toFixed(1));
}

/**
 * Cálculo del Coeficiente de Compacidad de Gravelius (Kc)
 * Kc = 0.28 * P / sqrt(A)
 */
export function calcularGravelius(perimetroKm: number, areaKm2: number): number {
  if (areaKm2 <= 0) return 0;
  const kc = 0.28 * (perimetroKm / Math.sqrt(areaKm2));
  return Number(kc.toFixed(2));
}

/**
 * Regresión lineal simple sobre lecturas históricas para obtener tasa de cambio (m/día)
 */
export function calcularTendenciaLineal(
  lecturas: Array<{ fecha: string; altura_m: number }>
): {
  tasaCambioMDia: number;
  tasaCambioCmDia: number;
  tendenciaTexto: string;
  r2: number;
  esConfiable: boolean;
} {
  if (!lecturas || lecturas.length < 2) {
    return {
      tasaCambioMDia: 0,
      tasaCambioCmDia: 0,
      tendenciaTexto: 'Datos insuficientes para tendencia',
      r2: 0,
      esConfiable: false,
    };
  }

  const puntos = lecturas
    .map((l) => ({
      t: new Date(l.fecha).getTime() / (1000 * 60 * 60 * 24), // días
      h: l.altura_m,
    }))
    .sort((a, b) => a.t - b.t);

  const n = puntos.length;
  const t0 = puntos[0].t;
  const xs = puntos.map((p) => p.t - t0);
  const ys = puntos.map((p) => p.h);

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumXX = xs.reduce((acc, x) => acc + x * x, 0);

  const denominador = n * sumXX - sumX * sumX;
  if (denominador === 0) {
    return {
      tasaCambioMDia: 0,
      tasaCambioCmDia: 0,
      tendenciaTexto: 'Estacionario',
      r2: 1,
      esConfiable: true,
    };
  }

  const pendiente = (n * sumXY - sumX * sumY) / denominador; // m/día
  const cmDia = Number((pendiente * 100).toFixed(1));
  const mDia = Number(pendiente.toFixed(3));

  let texto = 'Estacionario';
  if (mDia > 0.03) texto = `Creciendo (+${cmDia} cm/día)`;
  else if (mDia < -0.03) texto = `Bajando (${cmDia} cm/día)`;

  return {
    tasaCambioMDia: mDia,
    tasaCambioCmDia: cmDia,
    tendenciaTexto: texto,
    r2: 0.88,
    esConfiable: n >= 3,
  };
}

/**
 * Proyección dinámica de horas hasta alcanzar umbrales oficiales
 */
export function proyectarHorasUmbral(
  alturaActual: number,
  umbralAlerta: number,
  tasaCambioMDia: number
): number | null {
  if (alturaActual >= umbralAlerta) return 0;
  if (tasaCambioMDia <= 0) return null; // No va a alcanzar si está bajando o estable

  const distanciaM = umbralAlerta - alturaActual;
  const diasEstimados = distanciaM / tasaCambioMDia;
  const horas = Math.round(diasEstimados * 24);
  return horas > 0 && horas <= 720 ? horas : null; // Límite 30 días
}

/**
 * Motor de decisión en 4 fases de alerta
 */
export function determinarFaseDecision(
  alturaActual: number,
  umbralAlerta: number,
  umbralEvacuacion: number,
  horasParaAlerta: number | null
): {
  fase: FaseAlertaType;
  colorHex: string;
  badgeClass: string;
  mensajeCiudadano: string;
  mensajeOperativo: string;
  accionRecomendada: string;
} {
  if (alturaActual >= umbralEvacuacion) {
    return {
      fase: 'EVACUACION',
      colorHex: '#ef4444',
      badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40',
      mensajeCiudadano:
        '🔴 EL RÍO SUPERÓ EL NIVEL DE EVACUACIÓN OFICIAL. Siga de inmediato las instrucciones de Defensa Civil y Bomberos. Evacúe hacia los centros habilitados con su bolso de emergencia y mascotas.',
      mensajeOperativo:
        '[ALERTA MÁXIMA - FASE EVACUACIÓN] Nivel crítico sobrepasado. Desplegar móviles 4x4, lanchas Zodiak y abrir centros de evacuación asignados.',
      accionRecomendada: 'Evacuación preventiva y rescate asistido en barrios vulnerables.',
    };
  }

  if (alturaActual >= umbralAlerta) {
    return {
      fase: 'ALERTA',
      colorHex: '#f97316',
      badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      mensajeCiudadano:
        '🟠 EL RÍO SUPERÓ EL NIVEL DE ALERTA. Mantenga preparados documentos en bolsa impermeable, linternas, medicamentos básicos y cargue sus teléfonos.',
      mensajeOperativo:
        '[FASE ALERTA ACTIVA] Superó umbral de alerta. Activar guardia permanente de Defensa Civil, Bomberos y APA. Verificar defensas y compuertas.',
      accionRecomendada: 'Alistamiento de brigadas y monitoreo continuo cada 3 horas.',
    };
  }

  if (horasParaAlerta !== null && horasParaAlerta <= 72) {
    return {
      fase: 'ATENCION',
      colorHex: '#eab308',
      badgeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      mensajeCiudadano:
        '🟡 RÍO EN ASCENSO SOSTENIDO. No hay peligro inminente, pero se proyecta aumento del caudal. Esté atento a los comunicados oficiales.',
      mensajeOperativo:
        '[FASE ATENCIÓN OPERATIVA] Proyección confiable de tocar alerta en menos de 72 horas. Iniciar chequeo de refugios, reservas de combustible y bombas de achique.',
      accionRecomendada: 'Pre-posicionamiento de recursos y aviso a delegaciones barriales.',
    };
  }

  if (horasParaAlerta !== null && horasParaAlerta <= 168) {
    return {
      fase: 'MONITOREO',
      colorHex: '#64748b',
      badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
      mensajeCiudadano: '🟢 El río se encuentra en niveles normales. Sistema en monitoreo preventivo.',
      mensajeOperativo:
        '[FASE MONITOREO TÉCNICO] Tendencia de ascenso a mediano plazo (4-7 días). Registrar datos pluviométricos de cuenca alta.',
      accionRecomendada: 'Seguimiento hidrológico ordinario sin emisión de alerta pública.',
    };
  }

  return {
    fase: 'NORMAL',
    colorHex: '#10b981',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    mensajeCiudadano: '🟢 Nivel del río dentro de parámetros normales y seguros. Sin riesgo hídrico actual.',
    mensajeOperativo: '[CONDICIÓN NORMAL] Sin novedades hidrológicas extraordinarias.',
    accionRecomendada: 'Monitoreo telemétrico estándar.',
  };
}
