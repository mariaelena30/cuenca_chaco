import { BarrioVulnerable } from '../types';

/**
 * Barrios populares (RENABAP) de Barranqueras y Puerto Vilelas.
 * Fuente: Registro Nacional de Barrios Populares
 * (argentina.gob.ar/obras-publicas/sisu/renabap/mapa)
 *
 * familias_estimadas = cantidad de familias censadas por RENABAP en cada
 * barrio (campo "C.F" del registro). Esto es lo que humaniza el mapa:
 * no son polígonos, son grupos familiares reales que pueden perderlo todo.
 *
 * precision:
 *   "geocodificado"  -> coordenada real del barrio, verificada
 *   "aproximada"     -> centroide de la localidad (Barranqueras o Puerto
 *                       Vilelas), falta afinar la ubicación exacta del barrio
 *
 * Prioridad de carga: Barranqueras y Puerto Vilelas primero (las dos
 * localidades más vulnerables), el resto de RENABAP (Resistencia, Fontana,
 * Puerto Tirol, Margarita Belén, Las Palmas, Puerto Bermejo, San Martín,
 * Nueva Pompeya, Presidencia Roca, Isla del Cerrito) queda pendiente de
 * cargar en un segundo paso.
 */

const CENTROIDE_BARRANQUERAS = { lat: -27.4826564, lon: -58.9418781 };
const CENTROIDE_VILELAS = { lat: -27.5044196, lon: -58.9385416 };

export const BARRIOS_BARRANQUERAS: Record<string, BarrioVulnerable> = {
  la_toma: {
    id: 'la_toma', nombre: 'La Toma', localidad_padre: 'barranqueras',
    lat: -27.4697753, lon: -58.9037945, precision: 'geocodificado',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 50,
    estado_actual: 'RIESGO_ALTO',
  },
  san_pedro_pescador: {
    id: 'san_pedro_pescador', nombre: 'San Pedro Pescador', localidad_padre: 'barranqueras',
    lat: -27.4617343, lon: -58.8691147, precision: 'geocodificado',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 308,
    estado_actual: 'RIESGO_ALTO',
  },
  la_hormiga: {
    id: 'la_hormiga', nombre: 'La Hormiga', localidad_padre: 'barranqueras',
    lat: -27.4653295, lon: -58.9118535, precision: 'geocodificado',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 110,
    estado_actual: 'RIESGO_ALTO',
  },
  avenida_gabito_y_rio: {
    id: 'avenida_gabito_y_rio', nombre: 'Avenida Gabito y Río', localidad_padre: 'barranqueras',
    lat: CENTROIDE_BARRANQUERAS.lat, lon: CENTROIDE_BARRANQUERAS.lon, precision: 'aproximada',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 55,
    estado_actual: 'RIESGO_ALTO',
  },
  maria_cristina: {
    id: 'maria_cristina', nombre: 'María Cristina', localidad_padre: 'barranqueras',
    lat: -27.4760631, lon: -58.919913, precision: 'geocodificado',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 550,
    estado_actual: 'RIESGO_ALTO',
  },
  villa_paraguay: {
    id: 'villa_paraguay', nombre: 'Villa Paraguay', localidad_padre: 'barranqueras',
    lat: -27.4803118, lon: -58.9224206, precision: 'geocodificado',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 275,
    estado_actual: 'RIESGO_ALTO',
  },
  la_limita: {
    id: 'la_limita', nombre: 'La Limita', localidad_padre: 'barranqueras',
    lat: CENTROIDE_BARRANQUERAS.lat, lon: CENTROIDE_BARRANQUERAS.lon, precision: 'aproximada',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 220,
    estado_actual: 'RIESGO_ALTO',
  },
  el_arenal: {
    id: 'el_arenal', nombre: 'El Arenal', localidad_padre: 'barranqueras',
    lat: -27.4670825, lon: -58.9156145, precision: 'geocodificado',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 380,
    estado_actual: 'RIESGO_ALTO',
  },
  general_san_martin_i: {
    id: 'general_san_martin_i', nombre: 'General San Martín I', localidad_padre: 'barranqueras',
    lat: CENTROIDE_BARRANQUERAS.lat, lon: CENTROIDE_BARRANQUERAS.lon, precision: 'aproximada',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 77,
    estado_actual: 'RIESGO_ALTO',
  },
  villa_san_isidro_ii: {
    id: 'villa_san_isidro_ii', nombre: 'Villa San Isidro II', localidad_padre: 'barranqueras',
    lat: CENTROIDE_BARRANQUERAS.lat, lon: CENTROIDE_BARRANQUERAS.lon, precision: 'aproximada',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 37,
    estado_actual: 'RIESGO_ALTO',
  },
  villa_san_isidro_i: {
    id: 'villa_san_isidro_i', nombre: 'Villa San Isidro I', localidad_padre: 'barranqueras',
    lat: CENTROIDE_BARRANQUERAS.lat, lon: CENTROIDE_BARRANQUERAS.lon, precision: 'aproximada',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 110,
    estado_actual: 'RIESGO_ALTO',
  },
  nueva_esperanza_brr: {
    id: 'nueva_esperanza_brr', nombre: 'Nueva Esperanza', localidad_padre: 'barranqueras',
    lat: -27.4760281, lon: -58.9405121, precision: 'geocodificado',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 94,
    estado_actual: 'RIESGO_ALTO',
  },
  nuevo_amanecer: {
    id: 'nuevo_amanecer', nombre: 'Nuevo Amanecer', localidad_padre: 'barranqueras',
    lat: CENTROIDE_BARRANQUERAS.lat, lon: CENTROIDE_BARRANQUERAS.lon, precision: 'aproximada',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 23,
    estado_actual: 'RIESGO_ALTO',
  },
  ampliacion_2_de_abril: {
    id: 'ampliacion_2_de_abril', nombre: 'Ampliación 2 de Abril', localidad_padre: 'barranqueras',
    lat: CENTROIDE_BARRANQUERAS.lat, lon: CENTROIDE_BARRANQUERAS.lon, precision: 'aproximada',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 44,
    estado_actual: 'RIESGO_ALTO',
  },
  florida_norte: {
    id: 'florida_norte', nombre: 'Florida Norte', localidad_padre: 'barranqueras',
    lat: -27.4843913, lon: -58.9416102, precision: 'aproximada', // nombre similar, no exacto
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 88,
    estado_actual: 'RIESGO_ALTO',
  },
  villa_forestacion: {
    id: 'villa_forestacion', nombre: 'Villa Forestación', localidad_padre: 'barranqueras',
    lat: CENTROIDE_BARRANQUERAS.lat, lon: CENTROIDE_BARRANQUERAS.lon, precision: 'aproximada',
    motivo: 'RENABAP — barrio popular censado',
    familias_estimadas: undefined, // TODO: el dato original decía "1100" sin unidad clara, confirmar antes de usar
    estado_actual: 'RIESGO_ALTO',
  },
};

export const BARRIOS_VILELAS: Record<string, BarrioVulnerable> = {
  forestacion_sur: {
    id: 'forestacion_sur', nombre: 'Forestación Sur', localidad_padre: 'puerto_vilelas',
    lat: -27.5044196, lon: -58.9385416, precision: 'geocodificado',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 275,
    estado_actual: 'RIESGO_ALTO',
  },
  ex_ferrocarril: {
    id: 'ex_ferrocarril', nombre: 'Ex-Ferrocarril', localidad_padre: 'puerto_vilelas',
    lat: CENTROIDE_VILELAS.lat, lon: CENTROIDE_VILELAS.lon, precision: 'aproximada',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 88,
    estado_actual: 'RIESGO_ALTO',
  },
  ex_ferrocarril_ii: {
    id: 'ex_ferrocarril_ii', nombre: 'Ex-Ferrocarril II', localidad_padre: 'puerto_vilelas',
    lat: -27.5110283, lon: -58.9365712, precision: 'geocodificado',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 54,
    estado_actual: 'RIESGO_ALTO',
  },
  ex_conventillo: {
    id: 'ex_conventillo', nombre: 'Ex-Conventillo', localidad_padre: 'puerto_vilelas',
    lat: CENTROIDE_VILELAS.lat, lon: CENTROIDE_VILELAS.lon, precision: 'aproximada',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 66,
    estado_actual: 'RIESGO_ALTO',
  },
  aplomo: {
    id: 'aplomo', nombre: 'Aplomo', localidad_padre: 'puerto_vilelas',
    lat: -27.527311, lon: -58.9310182, precision: 'geocodificado',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 105,
    estado_actual: 'RIESGO_ALTO',
  },
  cooperativa_costa: {
    id: 'cooperativa_costa', nombre: 'Cooperativa Costa', localidad_padre: 'puerto_vilelas',
    lat: -27.5275369, lon: -58.9272567, precision: 'geocodificado',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 33,
    estado_actual: 'RIESGO_ALTO',
  },
  paraje_tres_bocas: {
    id: 'paraje_tres_bocas', nombre: 'Paraje Las 3 Bocas', localidad_padre: 'puerto_vilelas',
    lat: -27.5345341, lon: -58.8970287, precision: 'geocodificado',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 231,
    estado_actual: 'RIESGO_ALTO',
  },
  paraje_cinco_bocas: {
    id: 'paraje_cinco_bocas', nombre: 'Paraje Las 5 Bocas', localidad_padre: 'puerto_vilelas',
    lat: -27.540476, lon: -58.9095253, precision: 'geocodificado',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 39,
    estado_actual: 'RIESGO_ALTO',
  },
  cooperativa: {
    id: 'cooperativa', nombre: 'Cooperativa', localidad_padre: 'puerto_vilelas',
    lat: CENTROIDE_VILELAS.lat, lon: CENTROIDE_VILELAS.lon, precision: 'aproximada',
    motivo: 'RENABAP — barrio popular censado (revisar: posible duplicado de Cooperativa Costa)',
    familias_estimadas: 33,
    estado_actual: 'RIESGO_ALTO',
  },
  la_carboncillo: {
    id: 'la_carboncillo', nombre: 'La Carboncillo', localidad_padre: 'puerto_vilelas',
    lat: CENTROIDE_VILELAS.lat, lon: CENTROIDE_VILELAS.lon, precision: 'aproximada',
    motivo: 'RENABAP — barrio popular censado', familias_estimadas: 28,
    estado_actual: 'RIESGO_ALTO',
  },
};

// Total de familias RENABAP cargadas hasta ahora (Barranqueras + Vilelas),
// util para mostrar un numero de personas afectadas, no solo de barrios.
export const TOTAL_FAMILIAS_CARGADAS =
  Object.values(BARRIOS_BARRANQUERAS).reduce((acc, b) => acc + (b.familias_estimadas || 0), 0) +
  Object.values(BARRIOS_VILELAS).reduce((acc, b) => acc + (b.familias_estimadas || 0), 0);
