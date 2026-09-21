/**
* Obras de Infraestructura Hídrica —
Puerto Vilelas (7 obras prioritarias)
* Fuente: Municipalidad de Puerto Vilelas
/ APA
* Fecha: 29 julio 2026
*
* Estas son intervenciones confirmadas
para reducir impacto de crecientes
* ante El Niño 2026-2027. Cada obra tiene
ubicación, estado y tipo.
*/
export interface ObraHidrica {
id: string;
numero: number; // Obra 1-7
nombre: string;
descripcion: string;
ubicacion_referencia: string;
lat: number;
lon: number;
tipo_intervencion: string;
extension_m?: number;
plazo_estimado: string;
poblacion_beneficiada_aprox?: number;
estado_actual: 'CONFIRMADA' |
'PENDIENTE_RELEV_TECNICO' | 'EN_EJECUCION'
| 'COMPLETADA';
prioridad: number; // 1 = máxima
maquinaria_requerida?: string[];
}
export const OBRAS_HIDRAULICAS_VILELAS:
ObraHidrica[] = [
{
id: 'obra_1_tacuari',
numero: 1,
nombre: 'Defensa — Paraje Tacuarí',
descripcion: 'Reparación y ampliación
de defensa (terraplén) existente',
ubicacion_referencia: 'Paraje Tacuarí,
~35 km del centro de Puerto Vilelas',
lat: -27.7667,
lon: -58.8500,
tipo_intervencion: 'Reparación y
ampliación de defensa',
extension_m: 1200,
plazo_estimado: '25 días hábiles',
poblacion_beneficiada_aprox: 92, //
Colonia Tacuarí 2018
estado_actual: 'CONFIRMADA',
prioridad: 5,
maquinaria_requerida: ['Excavadora',
'Motoniveladora', 'Camiones volqueteros'],
},
{
id: 'obra_2_barrio_60',
numero: 2,
nombre: 'Reservorio — Barrio 60
Viviendas',
descripcion: 'Profundización y limpieza
del reservorio existente',
ubicacion_referencia: 'Barrio 60
Viviendas, zona sur del eje urbano',
lat: -27.5140,
lon: -58.9380,
tipo_intervencion: 'Profundización y
limpieza de reservorio',
extension_m: 5820.4, // superficie
relevada m²
plazo_estimado: '10 días de trabajo, 8
horas diarias',
poblacion_beneficiada_aprox: undefined,
// No especificado
estado_actual: 'CONFIRMADA',
prioridad: 2,
maquinaria_requerida: ['Excavadora',
'Minicargadora', 'Camiones'],
},
{
id: 'obra_3_chacra_287',
numero: 3,
nombre: 'Defensas y Desagües — Chacra
287',
descripcion: 'Construcción de defensa
nueva + sistema de desagües integrados',
ubicacion_referencia: 'Zona Chacra 287,
desde Av. Mosconi hasta Francisco Ramírez',
lat: -27.5115,
lon: -58.9350,
tipo_intervencion: 'Construcción de
defensa nueva + desagües',
extension_m: 500,
plazo_estimado: '15 días hábiles',
poblacion_beneficiada_aprox: undefined,
estado_actual: 'CONFIRMADA',
prioridad: 3,
maquinaria_requerida: ['Excavadora',
'Topadora', 'Motoniveladora', 'Camiones
volqueteros'],
},
{
id: 'obra_4_canales_bomba',
numero: 4,
nombre: 'Canales Primarios de Desagüe —
Bomba 9 y 10',
descripcion: 'Limpieza y profundización
de canales primarios que alimentan
estaciones de bombeo',
ubicacion_referencia: 'Estaciones de
Bombeo 9 y 10, marcación exacta por
usuario',
lat: -27.5090,
lon: -58.9340,
tipo_intervencion: 'Limpieza y
profundización de canales',
extension_m: 2500,
plazo_estimado: '≈30 días hábiles',
poblacion_beneficiada_aprox: undefined,
estado_actual:
'RECIENTEMENTE_CONFIRMADA',
prioridad: 4,
maquinaria_requerida: ['Excavadora',
'Camiones tipo Batea', 'Motoniveladoras'],
},
{
id: 'obra_5_riacho_araza',
numero: 5,
nombre: 'Riacho Arazá — Limpieza y
Profundización',
descripcion: 'Dragado, limpieza y
profundización del Cauce desde
desembocadura en Río Paraná hasta Dique
Regulador Sur',
ubicacion_referencia: 'Cauce del Riacho
Arazá (14.300 m lineales)',
lat: -27.5200,
lon: -58.9200,
tipo_intervencion: 'Dragado y limpieza
del cauce',
extension_m: 14300,
plazo_estimado: '40 días de trabajo, 8
horas diarias',
poblacion_beneficiada_aprox: undefined,
estado_actual:
'RECIENTEMENTE_CONFIRMADA',
prioridad: 1,
maquinaria_requerida: ['Excavadora
sobre orugas', 'Camiones volqueteros'],
},
{
id: 'obra_6_grupo_electrogenno',
numero: 6,
nombre: 'Grupo Electrógeno para Bombas
9, 10 y 11',
descripcion: 'Provisión de 3 grupos
electrógenos Dagartech DGVS 650 ST
insonorizados',
ubicacion_referencia: 'Barrio 60
Viviendas - Palmarcito - B. Ex Plomo',
lat: -27.5095,
lon: -58.9360,
tipo_intervencion: 'Provisión de
equipamiento',
plazo_estimado: 'Implementación
inmediata',
poblacion_beneficiada_aprox: 13000,
estado_actual: 'CONFIRMADA',
prioridad: 2,
maquinaria_requerida: ['Transporte
especializado'],
},
{
id: 'obra_7_reservorio_bomba10',
numero: 7,
nombre: 'Reservorio — Estación Bombeo
10',
descripcion: 'Profundización y
desmalezado de reservorio: remoción de
camalotes, vegetación flotante y
sedimentos',
ubicacion_referencia: 'Estación de
Bombeo 10, planta urbana de Puerto
Vilelas',
lat: -27.5130,
lon: -58.9370,
tipo_intervencion: 'Limpieza
superficial y desmalezado',
extension_m: 75000, // superficie
relevada
plazo_estimado: '10 días de trabajo, 8
horas diarias',
poblacion_beneficiada_aprox: undefined,
estado_actual: 'CONFIRMADA',
prioridad: 2,
maquinaria_requerida: ['Excavadora',
'Minicargadora', 'Máquina flotante tipo
Maincero'],
},
];
/**
* Centros de Evacuación y Refugios —
Puerto Vilelas
* Para El Niño 2026-2027 ante escenario de
alerta/evacuación
*/
export interface CentroEvacuacionLocal {
id: string;
nombre: string;
tipo: 'ESCUELA' | 'POLIDEPORTIVO' |
'MUNICIPALIDAD' | 'IGLESIA' | 'COMEDOR';
localidad: string;
lat: number;
lon: number;
capacidad_personas: number;
capacidad_familias_estimadas?: number;
contacto_responsable?: string;
telefono?: string;
acceso_discapacitados: boolean;
agua_potable: boolean;
electricidad: boolean;
cocina_comedor: boolean;
sanitarios_cantidad?: number;
estado_operativo: 'OPERATIVO' |
'REQUIERE_AJUSTES' | 'NO_DISPONIBLE';
barrios_cobertura?: string[]; // Barrios
cercanos que evacuaría
}
export const CENTROS_EVACUACION_VILELAS:
CentroEvacuacionLocal[] = [
{
id: 'centro_escuela_primaria_69',
nombre: 'Escuela Primaria Nº 69',
tipo: 'ESCUELA',
localidad: 'puerto_vilelas',
lat: -27.5100,
lon: -58.9365,
capacidad_personas: 300,
capacidad_familias_estimadas: 60,
contacto_responsable: 'Director/a de la
Escuela',
acceso_discapacitados: true,
agua_potable: true,
electricidad: true,
cocina_comedor: true,
sanitarios_cantidad: 8,
estado_operativo: 'OPERATIVO',
barrios_cobertura: ['Ex-Ferrocarril',
'Ex-Ferrocarril II', 'Forestación Sur'],
},
{
id: 'centro_municipalidad_vilelas',
nombre: 'Municipalidad de Puerto
Vilelas',
tipo: 'MUNICIPALIDAD',
localidad: 'puerto_vilelas',
lat: -27.5060,
lon: -58.9400,
capacidad_personas: 150,
capacidad_familias_estimadas: 30,
contacto_responsable: 'Secretaría de
Seguridad Pública',
telefono: '(03758) 47XXXX',
acceso_discapacitados: true,
agua_potable: true,
electricidad: true,
cocina_comedor: false,
sanitarios_cantidad: 4,
estado_operativo: 'OPERATIVO',
barrios_cobertura: ['Aplomo',
'Cooperativa Costa'],
},
{
id: 'centro_cancha_municipal',
nombre: 'Cancha Deportiva Municipal
(Estructura Techada)',
tipo: 'POLIDEPORTIVO',
localidad: 'puerto_vilelas',
lat: -27.5110609,
lon: -58.9389945, // Coordenada exacta
del usuario
capacidad_personas: 500,
capacidad_familias_estimadas: 100,
acceso_discapacitados: true,
agua_potable: true,
electricidad: true,
cocina_comedor: true,
sanitarios_cantidad: 12,
estado_operativo: 'OPERATIVO',
barrios_cobertura: ['Paraje Las 3
Bocas', 'Paraje Las 5 Bocas', 'Ex-
Conventillo'],
},
];
/**
* TOTAL DE CAPACIDAD DE EVACUACIÓN
*/
export const CAPACIDAD_TOTAL_REFUGIOS =
CENTROS_EVACUACION_VILELAS.reduce(
(acc, c) => acc + c.capacidad_personas,
0
);
export const FAMILIAS_TOTAL_RENABAP_VILELAS
= 1199; // suma de familias_estimadas de
BARRIOS_VILELAS
