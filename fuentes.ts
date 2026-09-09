// fuentes.ts
// Portal Hidrico Chaco
//
// Lista de fuentes tecnicas usadas por el proyecto. Se muestra en un
// footer o seccion "Fuentes" del frontend para dar transparencia sobre
// de donde salen los datos (cotas, manchas de inundacion, niveles).

export interface Fuente {
  nombre: string;
  descripcion: string;
  url?: string;
}

export const FUENTES: Fuente[] = [
  {
    nombre: "Administracion Provincial del Agua (APA) - Chaco",
    descripcion:
      "Resoluciones N 1111/98 y 303/09: cotas de linea de ribera y restriccion severa de lagunas del AMGR.",
  },
  {
    nombre: "CIMA (UBA/CONICET)",
    descripcion: "Niveles hidrometricos en tiempo real de los rios Parana y Paraguay.",
    url: "https://bermejo.cima.fcen.uba.ar",
  },
  {
    nombre: "Instituto Nacional del Agua (INA)",
    descripcion: "Datos oficiales de niveles hidrometricos.",
  },
  {
    nombre: "Servicio Meteorologico Nacional (SMN)",
    descripcion: "Alertas meteorologicas oficiales.",
  },
  {
    nombre: "Carlos Roces - UNNE (Facultad de Arquitectura y Urbanismo)",
    descripcion:
      "La ciudad de Resistencia y las inundaciones. La efectividad del sistema de defensas empleado.",
  },
  {
    nombre: "Depettris, Rohrmann, Martinez, Ruberto, Gomez - UNNE",
    descripcion:
      "Aprovechamiento de un sistema lagunar regulador de excesos pluviales en areas densamente pobladas.",
  },
  {
    nombre: "Bravo, Bianucci, Pilar, Depettris - UNNE (2004)",
    descripcion:
      "Modelacion matematica del drenaje pluvial (HEC-1), subcuencas Wilde-Pueyrredon y Hernandarias.",
  },
  {
    nombre: "Meza & Ramirez - UNNE (2018)",
    descripcion:
      "Identificacion de areas con riesgo a inundaciones y anegamientos, General Jose de San Martin (Chaco).",
  },
  {
    nombre: "RENABAP - Argentina.gob.ar",
    descripcion: "Registro Nacional de Barrios Populares.",
    url: "https://www.argentina.gob.ar/obras-publicas/sisu/renabap/mapa",
  },
  {
    nombre: "Instituto Geografico Nacional (IGN) / ALOS PALSAR",
    descripcion: "Modelo digital de elevacion (DEM) usado para el analisis de cotas bajas.",
    url: "https://www.ign.gob.ar",
  },
];
