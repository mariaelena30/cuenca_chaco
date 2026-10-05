// Teléfonos de emergencia por localidad.
// REGLA: el portal solo muestra los contactos con confirmado: true.
// Para sumar otra localidad, copiá un bloque, cambiá los datos y dejá
// confirmado en false hasta haber llamado una vez para comprobar el número.

export interface ContactoMunicipal {
  id: string;
  localidad: string; // clave de la localidad, igual que en el backend
  nombre: string;
  telefono: string;
  descripcion: string;
  confirmado: boolean;
  fuente: string;
  fecha: string; // cuándo se recibió o se verificó el dato
}

export const LOCALIDADES_AYUDA: { clave: string; nombre: string }[] = [
  { clave: 'barranqueras', nombre: 'Barranqueras' },
  { clave: 'resistencia', nombre: 'Resistencia' },
  { clave: 'puerto_vilelas', nombre: 'Puerto Vilelas' },
  { clave: 'isla_del_cerrito', nombre: 'Isla del Cerrito' },
  { clave: 'el_sauzalito', nombre: 'El Sauzalito' },
  { clave: 'puerto_bermejo', nombre: 'Puerto Bermejo' },
  { clave: 'pampa_del_indio', nombre: 'Pampa del Indio' },
  { clave: 'villa_rio_bermejito', nombre: 'Villa Río Bermejito' },
  { clave: 'fuerte_esperanza', nombre: 'Fuerte Esperanza' },
  { clave: 'la_leonesa', nombre: 'La Leonesa' },
];

export const CONTACTOS_MUNICIPALES: ContactoMunicipal[] = [
  {
    id: 'barranqueras_centro_monitoreo',
    localidad: 'barranqueras',
    nombre: 'Centro de Monitoreo (guardia 24 hs)',
    telefono: '3624-5676100',
    descripcion: 'Emergencias por lluvias o anegamientos',
    // PENDIENTE: el número tiene 11 cifras (los demás tienen 10). Llamar,
    // corregirlo y recién ahí poner confirmado: true.
    confirmado: false,
    fuente: 'Municipalidad de Barranqueras',
    fecha: '03/10/2026',
  },
  {
    id: 'barranqueras_servicios_publicos',
    localidad: 'barranqueras',
    nombre: 'Servicios Públicos',
    telefono: '362-4814532',
    descripcion: 'Emergencias por lluvias o anegamientos',
    confirmado: true,
    fuente: 'Municipalidad de Barranqueras',
    fecha: '03/10/2026',
  },
  {
    id: 'barranqueras_proteccion_civil',
    localidad: 'barranqueras',
    nombre: 'Protección Civil Municipal',
    telefono: '362-5730601',
    descripcion: 'Emergencias por lluvias o anegamientos',
    confirmado: true,
    fuente: 'Municipalidad de Barranqueras',
    fecha: '03/10/2026',
  },
  {
    id: 'barranqueras_atencion_vecino',
    localidad: 'barranqueras',
    nombre: 'Atención al Vecino',
    telefono: '362-5730602',
    descripcion: 'Consultas y reclamos por lluvias o anegamientos',
    confirmado: true,
    fuente: 'Municipalidad de Barranqueras',
    fecha: '03/10/2026',
  },
];
