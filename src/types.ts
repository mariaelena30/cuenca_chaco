export type FaseAlertaType = 'NORMAL' | 'MONITOREO' | 'ATENCION' | 'ALERTA' | 'EVACUACION' | 'SIN_DATO';

export interface ParametrosForma {
  area_km2: number;
  perimetro_km: number;
  longitud_axial_km: number;
  ancho_promedio_km: number;
  coef_compacidad_gravelius: number; // Kc > 1.75 = alargada, < 1.25 = casi circular
  factor_forma_horton: number;       // Kf
  radio_circularidad_miller: number; // Rc
  tiempo_concentracion_horas_min?: number;
  tiempo_concentracion_horas_max?: number;
}

export interface Cuenca {
  id: string;
  nombre: string;
  nombre_oficial: string;
  colector_principal: string;
  afluentes: string[];
  desemboca_en: string;
  tipo: string;
  departamentos: string[];
  estacion_referencia: string | null;
  nivel_actual_m: number | null;
  umbral_alerta: number | null;
  umbral_evacuacion: number | null;
  fuente: string;
  conectado: boolean;
  ultima_verificacion: string | null;
  bbox_aprox: {
    lat_min: number;
    lat_max: number;
    lon_min: number;
    lon_max: number;
  };
  parametros_forma?: ParametrosForma;
  clasificacion_tamano?: string;
  comportamiento_hidrologico: string;
  color_hex: string;
}

export interface Localidad {
  id: string;
  nombre: string;
  provincia?: 'Chaco' | 'Corrientes' | 'Formosa';
  cuenca_clave: string | null;
  lat: number;
  lon: number;
  nivel_metros: number | null;
  nivel_anterior_m?: number;
  umbral_alerta: number | null;
  umbral_evacuacion: number | null;
  precipitacion_acumulada_mm: number | null;
  precipitacion_72h_mm?: number;
  fuente: string;
  conectado: boolean;
  ultima_verificacion: string | null;
  estado: 'NORMAL' | 'ALERTA' | 'EVACUACION' | 'SIN_DATO';
  fase_calculada?: FaseAlertaType;
  emoji: string;
  tasa_cambio_m_dia?: number;
  horas_para_alerta?: number | null;
  horas_para_evacuacion?: number | null;
  estacion_hidrometrica_asociada?: string;
  barrios_vulnerables_ids?: string[];
  tipo_inundacion_dominante?: 'fluvial' | 'pluvial' | string;
  influencia_internacional?: string | null;
}

export interface Organismo {
  id: string;
  nombre: string;
  nivel: string;
  dependencia?: string | null;
  rol: string;
  url?: string | null;
  url_alertas?: string;
  nota?: string;
}

export interface BarrioVulnerable {
  id: string;
  nombre: string;
  localidad_padre: string;
  lat: number;
  lon: number;
  precision: string;
  motivo: string;
  cota_inundacion_m?: number;
  familias_estimadas?: number;
  via_acceso_critica?: string;
  estado_actual?: 'SEGURO' | 'RIESGO_MEDIO' | 'RIESGO_ALTO' | 'INUNDADO';
}

export interface EstacionHidrometrica {
  id: string;
  nombre: string;
  provincia?: 'Chaco' | 'Corrientes' | 'Formosa';
  rio: string;
  cuenca_relacionada: string;
  lat: number;
  lon: number;
  altura_actual_m: number;
  altura_anterior_m: number;
  tendencia_texto: string;
  nivel_alerta_m: number;
  nivel_evacuacion_m: number;
  distancia_a_alerta_m: number;
  timestamp_consulta: string;
  historico: Array<{ fecha: string; altura_m: number }>;
}

export interface TicketSOS {
  id: string;
  timestamp: string;
  nombre: string;
  telefono: string;
  localidad: string;
  direccion: string;
  lat: number;
  lon: number;
  personasAfectadas: number;
  personasVulnerables: {
    ninos: number;
    ancianos: number;
    movilidadReducida: number;
  };
  alturaAguaCm: number;
  nivelUrgencia: 'CRITICO' | 'ALTO' | 'MEDIO';
  requiere: ('BOTE_ZODIAK' | 'CAMION_4X4' | 'ASISTENCIA_MEDICA' | 'VIVERES_AGUA' | 'BOMBA_ACHIQUE')[];
  estado: 'PENDIENTE' | 'DESPACHADO' | 'EN_RESCATE' | 'RESUELTO';
  unidadAsignada?: string;
  notasDespacho?: string;
}

export interface ReporteCiudadano {
  id: string;
  timestamp: string;
  nombre: string;
  localidad: string;
  barrio?: string;
  calle: string;
  lat: number;
  lon: number;
  nivelAguaAprox: 'CORDON' | 'VEREDA' | 'ENTRO_A_CASA' | 'CALLE_CORTADA' | 'DESAGÜE_TAPADO';
  descripcion: string;
  fotoUrl?: string;
  verificado: boolean;
  impacto: 'LEVE' | 'MODERADO' | 'GRAVE';
}

export interface RecursoOperativo {
  id: string;
  nombre: string;
  tipo: 'MOVIL_4X4' | 'BOTE_ZODIAK' | 'AMBULANCIA' | 'BOMBA_ACHIQUE' | 'BRIGADA_RESCATE';
  base_localidad: string;
  estado: 'DISPONIBLE' | 'DESPLAZADO' | 'EN_MANTENIMIENTO';
  asignadoA?: string;
  tripulacion_cantidad: number;
  contacto_radio: string;
}

export interface CentroEvacuacion {
  id: string;
  nombre: string;
  localidad: string;
  direccion: string;
  lat: number;
  lon: number;
  capacidadTotal: number;
  personasAlojadadas: number;
  servicios: string[];
  responsable: string;
  telefono: string;
  abierto: boolean;
  // true solo si estos datos fueron confirmados con la institucion real.
  // Si es false, la UI debe mostrar "SIN CONFIRMAR" en vez de tratar
  // capacidadTotal/responsable/telefono como datos ciertos.
  confirmado: boolean;
}

export interface AlertaPreVerificacion {
  id: string;
  timestamp: string;
  localidad: string;
  cuenca: string;
  tipo: 'CRECIDA_SUBITA' | 'PROYECCION_UMBRAL' | 'TORMENTA_SEVERA' | 'DESBORDE_INMINENTE';
  fase: FaseAlertaType;
  nivelActual: number;
  nivelProyectado: number;
  horasEstimadas: number;
  estado: 'PENDIENTE_REVISION' | 'APROBADA_DIFUNDIDA' | 'DESCARTADA_FALSO_POSITIVO';
  textoPropuesto: string;
  revisor?: string;
  canalesDestino: ('TELEGRAM' | 'WHATSAPP' | 'SMS_RURAL' | 'SIRENA')[];
}

export interface CrecidaHistorica {
  anio: number;
  nombre: string;
  nivelMaxBarranqueras: number;
  fechaPico: string;
  faseENSO: 'El Niño Fuerte' | 'El Niño Extraordinario' | 'Neutro / Lluvias Locales';
  descripcion: string;
  impacto: string;
  lecciones: string;
}

export interface KanbanTask {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  estado: 'TODO' | 'IN_PROGRESS' | 'TESTING' | 'DONE';
  categoria: 'OPERACIONES_CAMPO' | 'SISTEMAS_BOT' | 'HIDROLOGIA' | 'DEFENSA_CIVIL' | 'COMUNICACION';
  asignado: string;
  fechaLimite?: string;
}

export interface BotMessage {
  id: string;
  remitente: 'user' | 'bot';
  canal: 'telegram' | 'whatsapp' | 'sms';
  texto: string;
  timestamp: string;
  opciones?: string[];
}
