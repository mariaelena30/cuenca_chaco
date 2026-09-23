// src/components/MapasVulnerabilidad.tsx
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Cuenca, Localidad, EstacionHidrometrica, BarrioVulnerable, TicketSOS, ReporteCiudadano } from '../types';
import { BARRIOS_BARRANQUERAS, BARRIOS_VILELAS } from '../data/barriosVulnerables';

// Importaciones estándar del mapa de Claude
import { InteractiveMap } from './InteractiveMap';
import { MapaInfraestructura } from './MapaInfraestructura';

// CORRECCIÓN CLAVE: este proyecto usa Leaflet puro (`leaflet`), no el
// wrapper `react-leaflet` — ese paquete nunca estuvo instalado (no figura
// en package.json), y por eso el bundle de producción quedaba con
// referencias rotas (el ReferenceError: "MapasVulnerabilidad is not
// defined"). Se reescribe este componente con el mismo patrón imperativo
// que ya funciona en InteractiveMap.tsx y MapaInfraestructura.tsx.

interface Props {
  cuencas: Record<string, Cuenca>;
  localidades: Record<string, Localidad>;
  estaciones: EstacionHidrometrica[];
  barrios: Record<string, BarrioVulnerable>;
  ticketsSOS: TicketSOS[];
  reportes: ReporteCiudadano[];
}

const CENTRO_BARRANQUERAS_VILELAS: [number, number] = [-27.495, -58.93];
const COLONIA_TACUARI: [number, number] = [-27.7667, -58.85];

export const MapasVulnerabilidad: React.FC<Props> = ({
  cuencas,
  localidades,
  estaciones,
  barrios,
  ticketsSOS,
  reportes,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    barrios: L.LayerGroup;
    sos: L.LayerGroup;
    reportes: L.LayerGroup;
  } | null>(null);

  const [camara, setCamara] = useState<{ centro: [number, number]; zoom: number }>({
    centro: CENTRO_BARRANQUERAS_VILELAS,
    zoom: 13,
  });
  const [filtroRiesgo, setFiltroRiesgo] = useState<string>('TODOS');

  const barriosBarranquerasYVilelas = {
    ...BARRIOS_BARRANQUERAS,
    ...BARRIOS_VILELAS,
  };

  const estacionLocal = estaciones.find(
    (e) => e.nombre.includes('Barranqueras') || e.nombre.includes('Vilelas')
  ) || {
    nombre: 'Puerto Vilelas / Barranqueras',
    lecturaActual: 5.45,
    cotaAlerta: 6.0,
    cotaEvacuacion: 6.5,
    tendencia: 'CRECIENTE',
  };

  const obtenerColorAlerta = (nivel: number) => {
    if (nivel >= estacionLocal.cotaEvacuacion) return '#ef4444';
    if (nivel >= estacionLocal.cotaAlerta) return '#f97316';
    return '#10b981';
  };

  const ticketsFiltrados = ticketsSOS.filter((t) => {
    if (filtroRiesgo === 'TODOS') return true;
    return t.nivelUrgencia === 'MÁXIMO' || t.nivelUrgencia === 'ALTO';
  });

  const barriosFiltrados = Object.values(barriosBarranquerasYVilelas).filter(
    (b) => filtroRiesgo === 'TODOS' || b.esCritico
  );

  // Inicializa el mapa táctico una sola vez
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: CENTRO_BARRANQUERAS_VILELAS,
      zoom: 13,
      minZoom: 8,
      maxZoom: 18,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const layerBarrios = L.layerGroup().addTo(map);
    const layerSOS = L.layerGroup().addTo(map);
    const layerReportes = L.layerGroup().addTo(map);

    // Control de capas (equivalente al LayersControl de react-leaflet)
    L.control
      .layers(
        undefined,
        {
          '⚠️ Polígonos de Riesgo Inundación': layerBarrios,
          '🆘 Solicitudes SOS Activas': layerSOS,
          '💧 Reportes Ciudadanos de Anegamiento': layerReportes,
        },
        { position: 'topright' }
      )
      .addTo(map);

    layersRef.current = { barrios: layerBarrios, sos: layerSOS, reportes: layerReportes };
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Redibuja las capas cuando cambian los datos o el filtro
  useEffect(() => {
    const layers = layersRef.current;
    if (!layers) return;

    layers.barrios.clearLayers();
    layers.sos.clearLayers();
    layers.reportes.clearLayers();

    // Capa 1: polígonos de barrios críticos
    barriosFiltrados.forEach((barrio) => {
      const poligono = L.polygon(
        [
          [-27.5115, -58.9405],
          [-27.514, -58.925],
          [-27.519, -58.928],
        ],
        {
          color: barrio.esCritico ? '#ef4444' : '#f97316',
          weight: 2,
          opacity: 0.7,
          fillOpacity: 0.25,
        }
      );
      poligono.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width:160px;">
          <div style="font-weight:800; font-size:13px;">${barrio.nombre}</div>
          <div style="font-size:11px; color:#475569;">Familias: ${barrio.familias_estimadas ?? 'N/A'}</div>
          <div style="font-size:11px; color:#475569;">Crítico: ${barrio.esCritico ? 'Sí' : 'No'}</div>
        </div>
      `);
      layers.barrios.addLayer(poligono);
    });

    // Capa 2: solicitudes SOS activas
    ticketsFiltrados
      .filter((t) => t.estado === 'PENDIENTE' || t.estado === 'DESPACHADO')
      .forEach((ticket) => {
        const icon = L.divIcon({
          className: 'sos-marker',
          html: `<div style="background:#dc2626; width:26px; height:26px; border-radius:50%; border:3px solid #fff; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:9px; box-shadow:0 0 12px rgba(220,38,38,0.7);">SOS</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        const marker = L.marker([ticket.lat, ticket.lon], { icon });
        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width:180px;">
            <div style="font-weight:800; font-size:13px; color:#dc2626;">${ticket.nombre}</div>
            <div style="font-size:11px;">📍 ${ticket.direccion}</div>
            <div style="font-size:11px;">Personas afectadas: ${ticket.personasAfectadas}</div>
            <div style="font-size:11px;">Urgencia: ${ticket.nivelUrgencia}</div>
            <div style="font-size:10px; color:#94a3b8;">Estado: ${ticket.estado}</div>
          </div>
        `);
        layers.sos.addLayer(marker);
      });

    // Capa 3: reportes ciudadanos de anegamiento
    reportes.forEach((reporte) => {
      const icon = L.divIcon({
        className: 'reporte-marker',
        html: `<div style="background:#0284c7; width:20px; height:20px; border-radius:50%; border:2px solid #fff; display:flex; align-items:center; justify-content:center; color:#fff; font-size:10px;">📢</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      const marker = L.marker([reporte.lat, reporte.lon], { icon });
      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width:180px;">
          <div style="font-weight:800; font-size:13px; color:#0284c7;">${reporte.nombre}</div>
          <div style="font-size:11px;">📍 ${reporte.calle} (${reporte.localidad})</div>
          <div style="font-size:11px;">Nivel de agua: ${reporte.nivelAguaAprox}</div>
          <div style="font-size:10px; color:#94a3b8;">${reporte.verificado ? '✓ Verificado' : '⏳ Sin verificar'}</div>
        </div>
      `);
      layers.reportes.addLayer(marker);
    });
  }, [barriosFiltrados, ticketsFiltrados, reportes]);

  // Mueve la cámara cuando cambia el estado `camara`
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(camara.centro, camara.zoom, { animate: true, duration: 2 });
    }
  }, [camara]);

  return (
    <div className="space-y-10">
      {/* 🗺️ MAPA 1: GENERAL (PROVINCIA COMPLETA - ORIGINAL CLAUDE) */}
      <section className="bg-slate-900/40 p-4 rounded-xl border border-slate-900">
        <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          Mapa general — Toda la provincia
        </h2>
        <InteractiveMap
          cuencas={cuencas}
          localidades={localidades}
          estaciones={estaciones}
          barrios={barrios}
          ticketsSOS={ticketsSOS}
          reportes={reportes}
        />
      </section>

      {/* ⚠️ MAPA 2: DASHBOARD TÁCTICO INTEGRADO (PUERTO VILELAS + BARRANQUERAS AVANZADO) */}
      <section className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
        <div className="mb-4">
          <h2 className="text-base font-bold text-red-400 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Centro de Misión Crítica — Logística Urbana y Rutas de Escape
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Priorización de zonas vulnerables activas del RENABAP, solicitudes SOS de vecinos y corredores seguros de evacuación.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row h-[600px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-sans">
          {/* PANEL LATERAL */}
          <div className="w-full lg:w-[340px] p-5 overflow-y-auto border-r border-slate-800 bg-slate-900/50 flex flex-col gap-5">
            <div
              className="p-4 rounded-lg bg-slate-900 border-l-[6px]"
              style={{ borderLeftColor: obtenerColorAlerta(estacionLocal.lecturaActual) }}
            >
              <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">ESTADO HIDROMÉTRICO</div>
              <h4 className="text-sm font-bold text-slate-200 mt-1 truncate">{estacionLocal.nombre}</h4>
              <div className="flex items-baseline gap-3 mt-2">
                <span
                  className="text-3xl font-extrabold tracking-tight"
                  style={{ color: obtenerColorAlerta(estacionLocal.lecturaActual) }}
                >
                  {estacionLocal.lecturaActual}m
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-amber-400 animate-pulse">
                  ⚠️ CRECIENTE
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                Alerta: {estacionLocal.cotaAlerta}m | Evac: {estacionLocal.cotaEvacuacion}m
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Filtrar Gravedad</label>
              <select
                value={filtroRiesgo}
                onChange={(e) => setFiltroRiesgo(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="TODOS">📍 Todo el Ejido Costero</option>
                <option value="CRÍTICO">🔴 Riesgo Crítico (RENABAP)</option>
              </select>
            </div>

            <div>
              <h4 className="text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2 mb-2 uppercase tracking-wide">
                🏠 Alertas Ciudadanas Activas ({ticketsSOS.filter((t) => t.estado === 'PENDIENTE').length})
              </h4>
              <div className="space-y-2 max-h-[180px] overflow-y-auto">
                {ticketsSOS
                  .filter((t) => t.estado === 'PENDIENTE')
                  .slice(0, 3)
                  .map((ticket) => (
                    <div key={ticket.id} className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px]">
                      <div className="flex justify-between font-bold text-slate-300">
                        <span className="truncate">{ticket.nombre}</span>
                        <span className="text-red-400 text-[10px]">{ticket.nivelUrgencia}</span>
                      </div>
                      <div className="text-slate-500 mt-1 truncate">📍 {ticket.direccion} ({ticket.localidad})</div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="mt-auto space-y-2">
              <button
                onClick={() => setCamara({ centro: COLONIA_TACUARI, zoom: 13 })}
                className="w-full p-3 bg-red-950/40 border border-red-900/60 text-red-200 text-xs font-bold rounded-lg hover:bg-red-900/30 transition duration-200"
              >
                🛰️ Desplazar a Paraje Tacuarí (35 km)
              </button>
              <button
                onClick={() => setCamara({ centro: CENTRO_BARRANQUERAS_VILELAS, zoom: 13 })}
                className="w-full p-2 bg-slate-800 text-slate-400 text-xs rounded-lg hover:text-slate-200 transition duration-200"
              >
                Restablecer Vista Central
              </button>
            </div>
          </div>

          {/* PAÑO GEOGRÁFICO */}
          <div className="flex-1 relative bg-slate-950">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default MapasVulnerabilidad;
