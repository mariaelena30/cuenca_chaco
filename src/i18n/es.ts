// Textos en español: son la referencia y el respaldo de todos los idiomas.
// Si agregás un texto nuevo, agregalo acá primero.
export const es = {
  'navbar.ayuda': 'CÓMO PEDIR AYUDA',
  'navbar.idioma': 'Idioma',
  'ayuda.titulo': 'Cómo pedir ayuda',
  'ayuda.aviso': 'Este portal es solo informativo: no recibe pedidos de ayuda.',
  'ayuda.llamaAhora': 'Si hay peligro, llamá ahora (gratis, las 24 hs)',
  'ayuda.defensaCivil': 'Defensa Civil',
  'ayuda.bomberos': 'Bomberos',
  'ayuda.prefectura': 'Prefectura Naval',
  'ayuda.emergenciasMedicas': 'Emergencias médicas',
  'ayuda.policia': 'Emergencias (Policía)',
  'ayuda.queDecirTitulo': 'Qué decir cuando llamás',
  'ayuda.queDecir1': 'Tu dirección o una referencia cerca (esquina, escuela, comercio).',
  'ayuda.queDecir2': 'Cuántas personas son, y si hay niños, adultos mayores o personas que no pueden caminar.',
  'ayuda.queDecir3': 'Cuánta agua hay y si sigue subiendo.',
  'ayuda.queDecir4': 'Un teléfono para que puedan volver a llamarte.',
  'ayuda.localidad': 'Tu localidad',
  'ayuda.municipalesTitulo': 'Teléfonos de tu municipio',
  'ayuda.sinMunicipales': 'Todavía no tenemos teléfonos municipales confirmados para esta localidad. Llamá al 103.',
  'ayuda.fuente': 'Fuente',
  'ayuda.copiarUbicacion': 'Copiar mi ubicación',
  'ayuda.ubicacionAviso': 'Tu ubicación no se envía a nadie: solo se copia en tu teléfono para que se la leas a quien te atienda.',
  'ayuda.ubicacionCopiada': 'Ubicación copiada. Leésela a quien te atienda.',
  'ayuda.ubicacionNoCopiada': 'No se pudo copiar. Leé estos números a quien te atienda:',
  'ayuda.errorUbicacion': 'No pudimos obtener tu ubicación. Decí tu dirección o una referencia.',
  'ayuda.cerrar': 'Cerrar',
  'pie.info': 'Información de referencia. Alertas oficiales: Defensa Civil 103, Servicio Meteorológico Nacional y Prefectura.',
} as const;

export type ClaveTexto = keyof typeof es;
