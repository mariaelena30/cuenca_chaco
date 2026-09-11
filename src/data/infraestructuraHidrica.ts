/**
 * Infraestructura hídrica del AMGR (Área Metropolitana del Gran Resistencia):
 * estaciones de bombeo, lagunas de oxidación y sistema de defensas.
 * Fuente: APA (Administración Provincial del Agua) — "Sistema de Defensas
 * y Estaciones de Bombeo AMGR" (mapa oficial, Ministerio de Ambiente y
 * Desarrollo Territorial Sostenible, Chaco).
 *
 * IMPORTANTE — estado de las coordenadas:
 * Este mapa oficial es una imagen raster, no un shapefile ni una capa
 * geolocalizada. Las coordenadas de abajo son POSICIONES APROXIMADAS
 * (centroide de la localidad + estimación visual de dónde cae cada punto
 * en el mapa), no geocodificación real. Están marcadas con
 * precision: 'requiere_geocodificacion' a propósito — antes de usar esto
 * para navegación real (por ejemplo, mandar una brigada), conviene pedirle
 * a APA las coordenadas exactas o marcarlas a mano en Google Maps/QGIS
 * comparando con el mapa oficial.
 *
 * Caso especial: "La Toma" aparece como estación de bombeo en Resistencia
 * (cerca de Mujeres Argentinas / El Japonés) en este mapa, pero también
 * existe un barrio RENABAP "La Toma" en Barranqueras con coordenadas reales
 * (-27.4697753, -58.9037945) en barriosVulnerables.ts. Es muy probable que
 * sean lugares distintos con el mismo nombre — no se reusó esa coordenada
 * acá para no mezclar los dos. Confirmar antes de fusionar.
 */

export interface PuntoInfraestructura {
  id: string;
  nombre: string;
  tipo: 'estacion_bombeo' | 'obra_control' | 'alcantarilla';
  localidad_padre: string;
  lat: number;
  lon: number;
  precision: 'geocodificado' | 'aproximada' | 'requiere_geocodificacion';
  fuente: string;
}

export interface CuerpoAgua {
  id: string;
  nombre: string;
  tipo: 'rio' | 'riacho' | 'laguna_oxidacion' | 'embalse';
  lat: number;
  lon: number;
  precision: 'geocodificado' | 'aproximada' | 'requiere_geocodificacion';
  nota?: string;
}

const CENTROIDE_RESISTENCIA = { lat: -27.4511, lon: -58.9866 };
const CENTROIDE_BARRANQUERAS = { lat: -27.4826564, lon: -58.9418781 };
const CENTROIDE_VILELAS = { lat: -27.5044196, lon: -58.9385416 };
const FUENTE_APA = 'APA — Sistema de Defensas y Estaciones de Bombeo AMGR';

// Estaciones de bombeo, en el orden en que aparecen en el mapa (de norte/
// noroeste de Resistencia, bajando por el borde este junto a la defensa,
// hasta Puerto Vilelas al sur).
export const ESTACIONES_BOMBEO: Record<string, PuntoInfraestructura> = {
  oro: {
    id: 'oro', nombre: 'Oro', tipo: 'estacion_bombeo',
    localidad_padre: 'resistencia',
    lat: CENTROIDE_RESISTENCIA.lat, lon: CENTROIDE_RESISTENCIA.lon,
    precision: 'requiere_geocodificacion', fuente: FUENTE_APA,
  },
  avalos: {
    id: 'avalos', nombre: 'Ávalos', tipo: 'estacion_bombeo',
    localidad_padre: 'resistencia',
    lat: CENTROIDE_RESISTENCIA.lat, lon: CENTROIDE_RESISTENCIA.lon,
    precision: 'requiere_geocodificacion', fuente: FUENTE_APA,
  },
  gonzalito: {
    id: 'gonzalito', nombre: 'Gonzalito', tipo: 'estacion_bombeo',
    localidad_padre: 'resistencia',
    lat: CENTROIDE_RESISTENCIA.lat, lon: CENTROIDE_RESISTENCIA.lon,
    precision: 'requiere_geocodificacion', fuente: FUENTE_APA,
  },
  los_teros: {
    id: 'los_teros', nombre: 'Los Teros', tipo: 'estacion_bombeo',
    localidad_padre: 'resistencia',
    lat: CENTROIDE_RESISTENCIA.lat, lon: CENTROIDE_RESISTENCIA.lon,
    precision: 'requiere_geocodificacion', fuente: FUENTE_APA,
  },
  vargas: {
    id: 'vargas', nombre: 'Vargas', tipo: 'estacion_bombeo',
    localidad_padre: 'resistencia',
    lat: CENTROIDE_RESISTENCIA.lat, lon: CENTROIDE_RESISTENCIA.lon,
    precision: 'requiere_geocodificacion', fuente: FUENTE_APA,
  },
  los_lirios_prosperidad: {
    id: 'los_lirios_prosperidad', nombre: 'Los Lirios - Prosperidad', tipo: 'estacion_bombeo',
    localidad_padre: 'resistencia',
    lat: CENTROIDE_RESISTENCIA.lat, lon: CENTROIDE_RESISTENCIA.lon,
    precision: 'requiere_geocodificacion', fuente: FUENTE_APA,
    // Coincide en nombre con "Villa los Lirios" (RENABAP Resistencia, C.F 55) — verificar si es la misma zona.
  },
  mujeres_argentinas: {
    id: 'mujeres_argentinas', nombre: 'Mujeres Argentinas', tipo: 'estacion_bombeo',
    localidad_padre: 'resistencia',
    lat: CENTROIDE_RESISTENCIA.lat, lon: CENTROIDE_RESISTENCIA.lon,
    precision: 'requiere_geocodificacion', fuente: FUENTE_APA,
    // Ya existe como barrio vulnerable en el proyecto (BARRIOS_VULNERABLES original) — cruzar coordenadas si ya están cargadas ahí.
  },
  el_japones: {
    id: 'el_japones', nombre: 'El Japonés', tipo: 'estacion_bombeo',
    localidad_padre: 'resistencia',
    lat: CENTROIDE_RESISTENCIA.lat, lon: CENTROIDE_RESISTENCIA.lon,
    precision: 'requiere_geocodificacion', fuente: FUENTE_APA,
  },
  la_toma_resistencia: {
    id: 'la_toma_resistencia', nombre: 'La Toma', tipo: 'estacion_bombeo',
    localidad_padre: 'resistencia',
    lat: CENTROIDE_RESISTENCIA.lat, lon: CENTROIDE_RESISTENCIA.lon,
    precision: 'requiere_geocodificacion', fuente: FUENTE_APA,
    // OJO: no confundir con el barrio RENABAP "La Toma" de Barranqueras (ese sí tiene coords reales, ver barriosVulnerables.ts).
  },
  ma_cristina: {
    id: 'ma_cristina', nombre: 'Ma. Cristina', tipo: 'estacion_bombeo',
    localidad_padre: 'barranqueras',
    lat: CENTROIDE_BARRANQUERAS.lat, lon: CENTROIDE_BARRANQUERAS.lon,
    precision: 'requiere_geocodificacion', fuente: FUENTE_APA,
    // Posible coincidencia con barrio RENABAP "María Cristina" (Barranqueras, C.F 550, coords reales -27.4760631,-58.919913) — muy probable que sea la misma zona, verificar.
  },
  clayton: {
    id: 'clayton', nombre: 'Clayton', tipo: 'obra_control',
    localidad_padre: 'barranqueras',
    lat: CENTROIDE_BARRANQUERAS.lat, lon: CENTROIDE_BARRANQUERAS.lon,
    precision: 'requiere_geocodificacion', fuente: FUENTE_APA,
  },
  bo_los_molinos: {
    id: 'bo_los_molinos', nombre: 'Bo. Los Molinos', tipo: 'estacion_bombeo',
    localidad_padre: 'barranqueras',
    lat: CENTROIDE_BARRANQUERAS.lat, lon: CENTROIDE_BARRANQUERAS.lon,
    precision: 'requiere_geocodificacion', fuente: FUENTE_APA,
  },
  bo_san_jose: {
    id: 'bo_san_jose', nombre: 'Bo. San José', tipo: 'estacion_bombeo',
    localidad_padre: 'barranqueras',
    lat: CENTROIDE_BARRANQUERAS.lat, lon: CENTROIDE_BARRANQUERAS.lon,
    precision: 'requiere_geocodificacion', fuente: FUENTE_APA,
  },
  colon_y_san_martin: {
    id: 'colon_y_san_martin', nombre: 'Colón y San Martín', tipo: 'estacion_bombeo',
    localidad_padre: 'barranqueras',
    lat: CENTROIDE_BARRANQUERAS.lat, lon: CENTROIDE_BARRANQUERAS.lon,
    precision: 'requiere_geocodificacion', fuente: FUENTE_APA,
  },
  vilelas: {
    id: 'vilelas', nombre: 'Vilelas', tipo: 'estacion_bombeo',
    localidad_padre: 'puerto_vilelas',
    lat: CENTROIDE_VILELAS.lat, lon: CENTROIDE_VILELAS.lon,
    precision: 'aproximada', fuente: FUENTE_APA,
  },
};

// Ríos, riacho y lagunas de oxidación visibles en el mapa oficial.
export const CUERPOS_DE_AGUA: Record<string, CuerpoAgua> = {
  rio_parana: {
    id: 'rio_parana', nombre: 'Río Paraná', tipo: 'rio',
    lat: -27.47, lon: -58.87,
    precision: 'aproximada',
    nota: 'Borde este del AMGR, límite con Corrientes',
  },
  rio_negro: {
    id: 'rio_negro', nombre: 'Río Negro', tipo: 'rio',
    lat: -27.42, lon: -59.02,
    precision: 'aproximada',
    nota: 'Atraviesa Fontana / Puerto Tirol, al norte-oeste del AMGR',
  },
  riacho_barranqueras: {
    id: 'riacho_barranqueras', nombre: 'Riacho Barranqueras', tipo: 'riacho',
    lat: CENTROIDE_BARRANQUERAS.lat, lon: CENTROIDE_BARRANQUERAS.lon,
    precision: 'aproximada',
    nota: 'Brazo del Paraná junto al cual se fundó Barranqueras',
  },
  laguna_oxidacion_san_jose_araza: {
    id: 'laguna_oxidacion_san_jose_araza', nombre: 'Lagunas de oxidación — Barrio San José / Vilelas-Araza',
    tipo: 'laguna_oxidacion',
    lat: CENTROIDE_VILELAS.lat, lon: CENTROIDE_VILELAS.lon,
    precision: 'requiere_geocodificacion',
    nota: 'Dos cuerpos marcados como "lagunas_de_oxidacion" en el mapa de APA, al sur de Barranqueras, cerca de Vilelas',
  },
};
