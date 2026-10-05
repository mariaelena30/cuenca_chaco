// Avisos de organismos oficiales (APA, Defensa Civil, SMN, Prefectura...)
// cargados a mano. REGLAS:
//  - Copiá lo más fiel posible lo que dice el organismo; no agregues datos propios.
//  - Poné quién lo emitió, la fecha y, si hay, el enlace a la fuente.
//  - Un aviso con la palabra COMPLETAR en cualquier campo NO se muestra.
//  - Después de venceEl, el aviso desaparece solo.

export interface AvisoOficial {
  id: string;
  fuente: string; // quién lo emitió
  fecha: string; // cuándo lo emitió, ej. 04/10/2026
  venceEl: string; // hasta cuándo mostrarlo (ISO, con hora de Argentina)
  titulo: string;
  texto: string;
  enlace?: string; // enlace a la fuente oficial
}

export const AVISOS_OFICIALES: AvisoOficial[] = [
  {
    id: 'apa_crecida_5_50',
    fuente: 'Administración Provincial del Agua (APA)',
    fecha: 'COMPLETAR (día en que lo informó la APA)',
    venceEl: '2026-10-12T23:59:00-03:00',
    titulo: 'La APA advirtió una crecida en los próximos días',
    texto:
      'La APA advirtió que en los próximos días el río COMPLETAR (nombre del río y estación) llegaría a 5,50 m. Es un pronóstico del organismo, no el nivel medido hoy.',
  },
];
