// src/components/MapasVulnerabilidad.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { Cuenca, Localidad, EstacionHidrometrica, BarrioVulnerable, TicketSOS, ReporteCiudadano } from '../types';

// Importaciones estándar del mapa de Claude
import { InteractiveMap } from './InteractiveMap';
import { MapaInfraestructura } from './MapaInfraestructura';

// Este proyecto usa Leaflet puro (`leaflet`), no el wrapper `react-leaflet`
// (nunca estuvo instalado). Se usa el mismo patrón imperativo que ya
// funciona en InteractiveMap.tsx y MapaInfraestructura.tsx.
//
// CAMBIOS (04/11/2026):
// 1. Los barrios ya NO se dibujan todos con el mismo triángulo fijo: se
//    ubican en su lat/lon real, y se muestran los del Gran Resistencia
//    (Resistencia, Barranqueras, Fontana, Puerto Vilelas) que lleguen en `barrios`.
// 2. El panel hidrométrico usaba campos que no existen (lecturaActual,
//    cotaAlerta, cotaEvacuacion): mostraba "undefinedm". Ahora usa
//    altura_actual_m / nivel_alerta_m / nivel_evacuacion_m.
// 3. Ya no hay una lectura inventada (5.45 m) ni la etiqueta "CRECIENTE"
//    fija: si no hay dato reciente se muestra "s/d", y la tendencia sale de
//    la estación.
// 4. Los textos de los popups se escapan (nombre/dirección los escribe la
//    gente al reportar): antes se podía inyectar HTML en el mapa.

interface Props {
  cuencas: Record<string, Cuenca>;
  localidades: Record<string, Localidad>;
  estaciones: EstacionHidrometrica[];
  barrios: Record<string, BarrioVulnerable>;
  ticketsSOS: TicketSOS[];
  reportes: ReporteCiudadano[];
}

type Vista = { centro: [number, number]; zoom: number };

const VISTA_GRAN_RESISTENCIA: Vista = { centro: [-27.465, -58.965], zoom: 12 };
const VISTA_BARRANQUERAS_VILELAS: Vista = { centro: [-27.495, -58.93], zoom: 13 };
const VISTA_COLONIA_TACUARI: Vista = { centro: [-27.7667, -58.85], zoom: 13 };

// Recuadro aproximado del Gran Resistencia (solo para elegir qué barrios mostrar).
const LAT_MIN = -27.58;
const LAT_MAX = -27.36;
const LON_MIN = -59.12;
const LON_MAX = -58.84;

// Si la última lectura tiene más de 48 h, no se muestra como "actual".
const HORAS_MAX_LECTURA = 48;

const escaparHtml = (valor: unknown): string =>
  String(valor ?? '').replace(/[&<>"']/g, (c) =>
    (({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c])
  );

const esNumero = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

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

  const [camara, setCamara] = useState<Vista>(VISTA_GRAN_RESISTENCIA);
  const [filtroRiesgo, setFiltroRiesgo] = useState<string>('TODOS');

  // ---- Estación de referencia (Barranqueras) ----
  const estacion =
    estaciones.find((e) => e.nombre.includes('Barranqueras') || e.nombre.includes('Vilelas')) ?? null;

  const cotaAlerta = estacion?.nivel_alerta_m ?? 6.0;
  const cotaEvacuacion = estacion?.nivel_evacuacion_m ?? 6.5;

  const ultimaFecha =
    estacion && estacion.historico && estacion.historico.length > 0
      ? estacion.historico[estacion.historico.length - 1].fecha
      : null;
  const horasDesdeLectura = ultimaFecha
    ? (Date.now() - new Date(ultimaFecha).getTime()) / 3600000
    : Infinity;
  const lecturaVigente = estacion !== null && esNumero(estacion.altura_actual_m) && horasDesdeLectura <= HORAS_MAX_LECTURA;
  const lectura: number | null = lecturaVigente && estacion ? estacion.altura_actual_m : null;

  const colorEstado =
    lectura === null
      ? '#64748b'
      : lectura >= cotaEvacuacion
      ? '#ef4444'
      : lectura >= cotaAlerta
      ? '#f97316'
      : '#10b981';

  const textoTendencia = lectura === null ? 'sin dato reciente' : estacion?.tendencia_texto ?? 'sin tendencia';
  const claseTendencia = textoTendencia.startsWith('creciendo')
    ? 'text-amber-400 animate-pulse'
    : textoTendencia.startsWith('bajando')
    ? 'text-emerald-400'
    : 'text-slate-400';

  // ---- Barrios del Gran Resistencia (por coordenadas) ----
  const barriosGran = useMemo(
    () =>
      Object.values(barrios).filter(
        (b) =>
          esNumero(b.lat) &&
          esNumero(b.lon) &&
          b.lat >= LAT_MIN &&
          b.lat <= LAT_MAX &&
          b.lon >= LON_MIN &&
          b.lon <= LON_MAX
      ),
    [barrios]
  );

  const esCriticoBarrio = (b: BarrioVulnerable): boolean =>
    Boolean(b.esCritico) || b.estado_actual === 'INUNDADO' || b.estado_actual === 'RIESGO_ALTO';

  const barriosFiltrados = useMemo(
    () => barriosGran.filter((b) => filtroRiesgo === 'TODOS' || esCriticoBarrio(b)),
    [barriosGran, filtroRiesgo]
  );

  const ticketsFiltrados = useMemo(
    () =>
      ticketsSOS.filter((t) => {
        if (filtroRiesgo === 'TODOS') return true;
        return t.nivelUrgencia === 'MÁXIMO' || t.nivelUrgencia === 'ALTO';
      }),
    [ticketsSOS, filtroRiesgo]
  );

  // Inicializa el mapa táctico una sola vez
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: VISTA_GRAN_RESISTENCIA.centro,
      zoom: VISTA_GRAN_RESISTENCIA.zoom,
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

    L.control
      .layers(
        undefined,
        {
          '⚠️ Barrios en zona de riesgo': layerBarrios,
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
      layersRef.current = null;
    };
  }, []);

  // Redibuja las capas cuando cambian los datos o el filtro
  useEffect(() => {
    const layers = layersRef.current;
    if (!layers) return;

    layers.barrios.clearLayers();
    layers.sos.clearLayers();
    layers.reportes.clearLayers();

    // Capa 1: barrios, cada uno en su ubicación real
    barriosFiltrados.forEach((barrio) => {
      const critico = esCriticoBarrio(barrio);
      const marcador = L.circleMarker([barrio.lat, barrio.lon], {
        radius: critico ? 11 : 8,
        color: critico ? '#ef4444' : '#f97316',
        weight: 2,
        opacity: 0.85,
        fillOpacity: 0.35,
      });
      marcador.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width:160px;">
          <div style="font-weight:800; font-size:13px;">${escaparHtml(barrio.nombre)}</div>
          <div style="font-size:11px; color:#94a3b8;">Familias: ${escaparHtml(barrio.familias_estimadas ?? 'N/A')}</div>
          <div style="font-size:11px; color:#94a3b8;">Crítico: ${critico ? 'Sí' : 'No'}</div>
        </div>
      `);
      layers.barrios.addLayer(marcador);
    });

    // Capa 2: solicitudes SOS activas
    ticketsFiltrados
      .filter((t) => (t.estado === 'PENDIENTE' || t.estado === 'DESPACHADO') && esNumero(t.lat) && esNumero(t.lon))
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
            <div style="font-weight:800; font-size:13px; color:#f87171;">${escaparHtml(ticket.nombre)}</div>
            <div style="font-size:11px;">📍 ${escaparHtml(ticket.direccion)}</div>
            <div style="font-size:11px;">Personas afectadas: ${escaparHtml(ticket.personasAfectadas)}</div>
            <div style="font-size:11px;">Urgencia: ${escaparHtml(ticket.nivelUrgencia)}</div>
            <div style="font-size:10px; color:#94a3b8;">Estado: ${escaparHtml(ticket.estado)}</div>
          </div>
        `);
        layers.sos.addLayer(marker);
      });

    // Capa 3: reportes ciudadanos de anegamiento
    reportes
      .filter((r) => esNumero(r.lat) && esNumero(r.lon))
      .forEach((reporte) => {
        const icon = L.divIcon({
          className: 'reporte-marker',
          html: `<div style="background:#0284c7; width:20px; height:20px; border-radius:50%; border:2px solid #fff; display:flex; align-items:center; justify-content:center; color:#fff; font-size:10px;">📢</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        const marker = L.marker([reporte.lat, reporte.lon], { icon });
        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width:180px;">
            <div style="font-weight:800; font-size:13px; color:#38bdf8;">${escaparHtml(reporte.nombre)}</div>
            <div style="font-size:11px;">📍 ${escaparHtml(reporte.calle)} (${escaparHtml(reporte.localidad)})</div>
            <div style="font-size:11px;">Nivel de agua: ${escaparHtml(reporte.nivelAguaAprox)}</div>
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

  const pendientes = ticketsSOS.filter((t) => t.estado === 'PENDIENTE');

  return (
    <div className="space-y-10">
      {/* 🗺️ MAPA 1: GENERAL (PROVINCIA COMPLETA) */}
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

      {/* ⚠️ MAPA 2: GRAN RESISTENCIA (Resistencia, Barranqueras, Fontana, Puerto Vilelas) */}
      <section className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
        <div className="mb-4">
          <h2 className="text-base font-bold text-red-400 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Gran Resistencia — Barrios en riesgo y pedidos de ayuda
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Barrios vulnerables (RENABAP y otros relevados), solicitudes SOS de vecinos y reportes de
            anegamiento. Los barrios sin ubicación cargada no aparecen en el mapa.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row h-[600px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-sans">
          {/* PANEL LATERAL */}
          <div className="w-full lg:w-[340px] p-5 overflow-y-auto border-r border-slate-800 bg-slate-900/50 flex flex-col gap-5">
            <div
              className="p-4 rounded-lg bg-slate-900 border-l-[6px]"
              style={{ borderLeftColor: colorEstado }}
            >
              <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">ESTADO HIDROMÉTRICO</div>
              <h4 className="text-sm font-bold text-slate-200 mt-1 truncate">
                {estacion ? estacion.nombre : 'Barranqueras'}
              </h4>
              <div className="flex items-baseline gap-3 mt-2 flex-wrap">
                <span className="text-3xl font-extrabold tracking-tight" style={{ color: colorEstado }}>
                  {lectura === null ? 's/d' : `${lectura.toFixed(2)} m`}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 ${claseTendencia}`}>
                  {textoTendencia}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                Alerta: {cotaAlerta.toFixed(2)} m | Evacuación: {cotaEvacuacion.toFixed(2)} m
              </div>
              {lectura === null && (
                <div className="text-[11px] text-amber-300 mt-2">
                  No hay una lectura de las últimas {HORAS_MAX_LECTURA} h. No tomar este panel como
                  situación actual.
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Filtrar Gravedad</label>
              <select
                value={filtroRiesgo}
                onChange={(e) => setFiltroRiesgo(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="TODOS">📍 Todo el Gran Resistencia</option>
                <option value="CRÍTICO">🔴 Solo riesgo crítico</option>
              </select>
              <div className="text-[11px] text-slate-500 mt-1.5">
                Barrios en el mapa: {barriosFiltrados.length}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2 mb-2 uppercase tracking-wide">
                🏠 Alertas Ciudadanas Activas ({pendientes.length})
              </h4>
              <div className="space-y-2 max-h-[180px] overflow-y-auto">
                {pendientes.slice(0, 3).map((ticket) => (
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
                onClick={() => setCamara(VISTA_GRAN_RESISTENCIA)}
                className="w-full p-2.5 bg-slate-800 text-slate-200 text-xs font-bold rounded-lg hover:bg-slate-700 transition duration-200"
              >
                🗺️ Gran Resistencia (vista general)
              </button>
              <button
                onClick={() => setCamara(VISTA_BARRANQUERAS_VILELAS)}
                className="w-full p-2 bg-slate-800 text-slate-400 text-xs rounded-lg hover:text-slate-200 transition duration-200"
              >
                Barranqueras y Puerto Vilelas
              </button>
              <button
                onClick={() => setCamara(VISTA_COLONIA_TACUARI)}
                className="w-full p-3 bg-red-950/40 border border-red-900/60 text-red-200 text-xs font-bold rounded-lg hover:bg-red-900/30 transition duration-200"
              >
                🛰️ Desplazar a Paraje Tacuarí (35 km)
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
