import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Cuenca, Localidad, BarrioVulnerable, TicketSOS, ReporteCiudadano } from '../types';
import { BARRIOS_VILELAS } from '../data/barriosVulnerables';
import { OBRAS_HIDRAULICAS_VILELAS, CENTROS_EVACUACION_VILELAS, CAPACIDAD_TOTAL_REFUGIOS } from '../data/obrasVilelas';

// CARGA DINÁMICA DE LEAFLET PARA EVITAR ERROR SSR
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then((mod) => mod.Polygon), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then((mod) => mod.Circle), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const LayersControl = dynamic(() => import('react-leaflet').then((mod) => mod.LayersControl), { ssr: false });
// NOTA: react-leaflet expone LayersControl.Overlay como propiedad estática del
// componente LayersControl real (el de 'react-leaflet', no el wrapper dynamic()).
// Al envolver LayersControl con next/dynamic() se pierde esa propiedad estática,
// así que la importamos también como su propio componente dinámico y la usamos
// directo, en vez de "LayersControl.Overlay".
const LayersControlOverlay = dynamic(() => import('react-leaflet').then((mod) => mod.LayersControl.Overlay), { ssr: false });

// Hook para controlar la cámara
const MapController = ({ centro, zoom }: { centro: [number, number]; zoom: number }) => {
  const map = require('react-leaflet').useMap();
  React.useEffect(() => {
    if (centro) map.flyTo(centro, zoom, { animate: true, duration: 1.5 });
  }, [centro, zoom, map]);
  return null;
};

interface Props {
  cuencas: Record<string, Cuenca>;
  localidades: Record<string, Localidad>;
  barrios: Record<string, BarrioVulnerable>;
  ticketsSOS: TicketSOS[];
  reportes: ReporteCiudadano[];
}

const CENTRO_VILELAS: [number, number] = [-27.5044196, -58.9385416];

/**
 * Genera polígonos aproximados para barrios basado en su ubicación
 * y un buffer pequeño (simula perímetro real)
 */
function generarPoligonoBarrio(lat: number, lon: number, bufferGrados: number = 0.006) {
  return [
    [lat - bufferGrados, lon - bufferGrados],
    [lat + bufferGrados, lon - bufferGrados],
    [lat + bufferGrados, lon + bufferGrados],
    [lat - bufferGrados, lon + bufferGrados],
  ];
}

export const MapasVilelasMejorado: React.FC<Props> = ({
  cuencas,
  localidades,
  barrios,
  ticketsSOS,
  reportes,
}) => {
  const [camara, setCamara] = useState<{ centro: [number, number]; zoom: number }>({
    centro: CENTRO_VILELAS,
    zoom: 14,
  });

  const [filtroVisibilidad, setFiltroVisibilidad] = useState<{
    barrios: boolean;
    obras: boolean;
    refugios: boolean;
    sos: boolean;
  }>({
    barrios: true,
    obras: true,
    refugios: true,
    sos: true,
  });

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'RIESGO_ALTO':
        return '#ef4444'; // rojo
      case 'RIESGO_MEDIO':
        return '#f97316'; // naranja
      case 'SEGURO':
        return '#10b981'; // verde
      default:
        return '#64748b'; // gris
    }
  };

  const obtenerIconoObra = (prioridad: number) => {
    if (prioridad === 1) return '🔴'; // máxima
    if (prioridad <= 2) return '🟠'; // alta
    if (prioridad <= 3) return '🟡'; // media
    return '🟢'; // baja
  };

  return (
    <div className="space-y-4">
      {/* PANEL DE CONTROL */}
      <section className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="mb-4">
          <h2 className="text-base font-bold text-cyan-400 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
            Centro de Comando Táctico — Puerto Vilelas (Plan El Niño 2026-2027)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitoreo de infraestructura hídrica, barrios RENABAP, centros de evacuación y solicitudes de ayuda ciudadana en tiempo real.
          </p>
        </div>

        {/* CONTROLES DE VISIBILIDAD */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition">
            <input
              type="checkbox"
              checked={filtroVisibilidad.barrios}
              onChange={(e) => setFiltroVisibilidad({ ...filtroVisibilidad, barrios: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-xs font-semibold text-slate-300">🏘️ Barrios RENABAP</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition">
            <input
              type="checkbox"
              checked={filtroVisibilidad.obras}
              onChange={(e) => setFiltroVisibilidad({ ...filtroVisibilidad, obras: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-xs font-semibold text-slate-300">⚙️ 7 Obras (APA)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition">
            <input
              type="checkbox"
              checked={filtroVisibilidad.refugios}
              onChange={(e) => setFiltroVisibilidad({ ...filtroVisibilidad, refugios: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-xs font-semibold text-slate-300">🏠 Centros Evacuación</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition">
            <input
              type="checkbox"
              checked={filtroVisibilidad.sos}
              onChange={(e) => setFiltroVisibilidad({ ...filtroVisibilidad, sos: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-xs font-semibold text-slate-300">🆘 Alertas SOS</span>
          </label>
        </div>

        {/* ESTADÍSTICAS RÁPIDAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
            <div className="text-slate-500 uppercase font-bold tracking-wider">Barrios RENABAP</div>
            <div className="text-2xl font-bold text-red-400 mt-1">
              {Object.values(BARRIOS_VILELAS).length}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">1.199 familias aprox.</div>
          </div>
          <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
            <div className="text-slate-500 uppercase font-bold tracking-wider">Obras Prioritarias</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              {OBRAS_HIDRAULICAS_VILELAS.length}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Estado: Confirmadas</div>
          </div>
          <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
            <div className="text-slate-500 uppercase font-bold tracking-wider">Refugios Operativos</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {CENTROS_EVACUACION_VILELAS.length}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">{CAPACIDAD_TOTAL_REFUGIOS} personas</div>
          </div>
          <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
            <div className="text-slate-500 uppercase font-bold tracking-wider">Alertas Ciudadanas</div>
            <div className="text-2xl font-bold text-red-500 mt-1">
              {ticketsSOS.filter((t) => t.estado === 'PENDIENTE').length}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Pendientes de despacho</div>
          </div>
        </div>
      </section>

      {/* MAPA INTERACTIVO */}
      <section className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 h-[700px]">
        <MapContainer center={CENTRO_VILELAS} zoom={14} className="h-full w-full rounded-lg">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          <MapController centro={camara.centro} zoom={camara.zoom} />

          {/* TODAS las capas deben ser hijas directas de UN ÚNICO LayersControl
              para que el conmutador funcione correctamente. */}
          <LayersControl position="topright">
            {/* CAPA 1: BARRIOS RENABAP (POLÍGONOS) */}
            {filtroVisibilidad.barrios && (
              <LayersControlOverlay checked name="🏘️ Barrios RENABAP">
                <>
                  {Object.values(BARRIOS_VILELAS).map((barrio) => (
                    <Polygon
                      key={barrio.id}
                      positions={generarPoligonoBarrio(barrio.lat, barrio.lon, 0.008)}
                      pathOptions={{
                        color: obtenerColorEstado(barrio.estado_actual),
                        weight: 3,
                        opacity: 0.7,
                        fillOpacity: 0.3,
                        dashArray: '5, 5',
                      }}
                    >
                      <Popup>
                        <div className="text-xs space-y-1">
                          <div className="font-bold text-sm">{barrio.nombre}</div>
                          <div>Precisión: {barrio.precision}</div>
                          <div>Familias: {barrio.familias_estimadas || 'N/A'}</div>
                          <div>Estado: {barrio.estado_actual}</div>
                          <div className="text-[10px] text-slate-500 mt-2">
                            {barrio.lat.toFixed(6)}, {barrio.lon.toFixed(6)}
                          </div>
                        </div>
                      </Popup>
                    </Polygon>
                  ))}
                </>
              </LayersControlOverlay>
            )}

            {/* CAPA 2: OBRAS DE INFRAESTRUCTURA */}
            {filtroVisibilidad.obras && (
              <LayersControlOverlay checked name="⚙️ Obras Prioritarias (7 APA)">
                <>
                  {OBRAS_HIDRAULICAS_VILELAS.map((obra) => (
                    <React.Fragment key={obra.id}>
                      {/* Marcador */}
                      <Marker position={[obra.lat, obra.lon]}>
                        <Popup>
                          <div className="text-xs space-y-2 max-w-[250px]">
                            <div className="font-bold text-sm bg-slate-900 px-2 py-1 rounded text-white">
                              Obra {obra.numero}: {obra.nombre}
                            </div>
                            <div>
                              <div className="text-[10px] font-semibold text-slate-500 uppercase">Descripción</div>
                              <div className="text-slate-300">{obra.descripcion}</div>
                            </div>
                            <div>
                              <div className="text-[10px] font-semibold text-slate-500 uppercase">Ubicación</div>
                              <div className="text-slate-300">{obra.ubicacion_referencia}</div>
                            </div>
                            {obra.extension_m && (
                              <div>
                                <div className="text-[10px] font-semibold text-slate-500 uppercase">Extensión</div>
                                <div className="text-slate-300">{obra.extension_m.toLocaleString()} m</div>
                              </div>
                            )}
                            <div>
                              <div className="text-[10px] font-semibold text-slate-500 uppercase">Plazo</div>
                              <div className="text-slate-300">{obra.plazo_estimado}</div>
                            </div>
                            <div>
                              <div className="text-[10px] font-semibold text-slate-500 uppercase">Estado</div>
                              <div className={`font-bold ${obra.estado_actual === 'CONFIRMADA' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {obra.estado_actual}
                              </div>
                            </div>
                            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-700">
                              {obra.lat.toFixed(6)}, {obra.lon.toFixed(6)}
                            </div>
                          </div>
                        </Popup>
                      </Marker>

                      {/* Círculo de alcance (visible context) */}
                      <Circle
                        center={[obra.lat, obra.lon]}
                        radius={(obra.extension_m || 500) / 111000} // Conversión aproximada a grados
                        pathOptions={{
                          color: obra.prioridad <= 2 ? '#ef4444' : '#f97316',
                          weight: 1,
                          opacity: 0.2,
                          fillOpacity: 0.05,
                        }}
                      />
                    </React.Fragment>
                  ))}
                </>
              </LayersControlOverlay>
            )}

            {/* CAPA 3: CENTROS DE EVACUACIÓN */}
            {filtroVisibilidad.refugios && (
              <LayersControlOverlay checked name="🏠 Centros de Evacuación">
                <>
                  {CENTROS_EVACUACION_VILELAS.map((centro) => (
                    <Circle
                      key={centro.id}
                      center={[centro.lat, centro.lon]}
                      radius={300} // 300 metros de radio visual
                      pathOptions={{
                        color: '#10b981',
                        weight: 2,
                        opacity: 0.6,
                        fillOpacity: 0.2,
                      }}
                    >
                      <Popup>
                        <div className="text-xs space-y-2 max-w-[280px]">
                          <div className="font-bold text-sm bg-emerald-900 px-2 py-1 rounded text-white">
                            {centro.nombre}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-[10px] font-semibold text-slate-500 uppercase">Capacidad</div>
                              <div className="text-lg font-bold text-emerald-400">{centro.capacidad_personas}</div>
                              <div className="text-[10px] text-slate-500">personas</div>
                            </div>
                            <div>
                              <div className="text-[10px] font-semibold text-slate-500 uppercase">Familias</div>
                              <div className="text-lg font-bold text-cyan-400">{centro.capacidad_familias_estimadas || 'N/A'}</div>
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-semibold text-slate-500 uppercase">Servicios</div>
                            <div className="text-[11px] space-y-1">
                              <div>{centro.agua_potable ? '✓' : '✗'} Agua potable</div>
                              <div>{centro.electricidad ? '✓' : '✗'} Electricidad</div>
                              <div>{centro.cocina_comedor ? '✓' : '✗'} Cocina/Comedor</div>
                              <div>{centro.acceso_discapacitados ? '✓' : '✗'} Acceso discapacitados</div>
                            </div>
                          </div>
                          {centro.barrios_cobertura && centro.barrios_cobertura.length > 0 && (
                            <div>
                              <div className="text-[10px] font-semibold text-slate-500 uppercase">Barrios próximos</div>
                              <div className="text-[11px] text-slate-300">{centro.barrios_cobertura.join(', ')}</div>
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-700">
                            {centro.lat.toFixed(6)}, {centro.lon.toFixed(6)}
                          </div>
                        </div>
                      </Popup>
                    </Circle>
                  ))}
                </>
              </LayersControlOverlay>
            )}

            {/* CAPA 4: ALERTAS SOS CIUDADANAS */}
            {filtroVisibilidad.sos && (
              <LayersControlOverlay checked name="🆘 Alertas SOS Activas">
                <>
                  {ticketsSOS
                    .filter((t) => t.estado === 'PENDIENTE' || t.estado === 'DESPACHADO')
                    .map((ticket) => (
                      <Circle
                        key={ticket.id}
                        center={[ticket.lat, ticket.lon]}
                        radius={150}
                        pathOptions={{
                          color: ticket.nivelUrgencia === 'MÁXIMO' ? '#dc2626' : '#ea580c',
                          weight: 2,
                          opacity: 0.8,
                          fillOpacity: 0.3,
                        }}
                      >
                        <Popup>
                          <div className="text-xs space-y-1 max-w-[200px]">
                            <div className="font-bold text-sm text-red-500">{ticket.nombre}</div>
                            <div>📍 {ticket.direccion}</div>
                            <div>Personas: {ticket.personasAfectadas}</div>
                            <div>Urgencia: {ticket.nivelUrgencia}</div>
                            <div className="text-[10px] text-slate-500">Estado: {ticket.estado}</div>
                          </div>
                        </Popup>
                      </Circle>
                    ))}
                </>
              </LayersControlOverlay>
            )}
          </LayersControl>
        </MapContainer>
      </section>

      {/* LEYENDA DETALLADA */}
      <section className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <h3 className="text-sm font-bold text-slate-300 mb-3">📋 Leyenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="font-semibold text-red-400 mb-2">🏘️ Barrios RENABAP</div>
            <div className="text-slate-400">Áreas de riesgo alto identificadas por el registro nacional</div>
          </div>
          <div>
            <div className="font-semibold text-amber-400 mb-2">⚙️ Obras APA</div>
            <div className="text-slate-400">7 intervenciones de infraestructura hídrica confirmadas (29 julio 2026)</div>
          </div>
          <div>
            <div className="font-semibold text-emerald-400 mb-2">🏠 Centros Evacuación</div>
            <div className="text-slate-400">Refugios operativos con capacidad total de {CAPACIDAD_TOTAL_REFUGIOS} personas</div>
          </div>
          <div>
            <div className="font-semibold text-red-500 mb-2">🆘 Alertas SOS</div>
            <div className="text-slate-400">Solicitudes de ayuda ciudadana en tiempo real (GPS + contacto)</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MapasVilelasMejorado;
