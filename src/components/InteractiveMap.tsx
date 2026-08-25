import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Cuenca,
  Localidad,
  EstacionHidrometrica,
  BarrioVulnerable,
  TicketSOS,
  ReporteCiudadano,
} from '../types';
import {
  Layers,
  MapPin,
  AlertTriangle,
  Radio,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface InteractiveMapProps {
  cuencas: Record<string, Cuenca>;
  localidades: Record<string, Localidad>;
  estaciones: EstacionHidrometrica[];
  barrios: Record<string, BarrioVulnerable>;
  ticketsSOS: TicketSOS[];
  reportes: ReporteCiudadano[];
  onSelectLocalidad?: (loc: Localidad) => void;
  onSelectBarrio?: (barrio: BarrioVulnerable) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  cuencas,
  localidades,
  estaciones,
  barrios,
  ticketsSOS,
  reportes,
  onSelectLocalidad,
  onSelectBarrio,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    localidades: L.LayerGroup;
    estaciones: L.LayerGroup;
    barrios: L.LayerGroup;
    sos: L.LayerGroup;
    reportes: L.LayerGroup;
    cuencas: L.LayerGroup;
  } | null>(null);

  // Layer visibility state
  const [layerVisibility, setLayerVisibility] = useState({
    localidades: true,
    estaciones: true,
    barrios: true,
    sos: true,
    reportes: true,
    cuencas: true,
  });
  const [showMobileLegend, setShowMobileLegend] = useState<boolean>(false);

  const toggleLayer = (key: keyof typeof layerVisibility) => {
    setLayerVisibility((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (mapInstanceRef.current && layersRef.current) {
        if (next[key]) {
          layersRef.current[key].addTo(mapInstanceRef.current);
        } else {
          layersRef.current[key].remove();
        }
      }
      return next;
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet Map centered on Chaco Province (-26.5, -60.0)
      const map = L.map(mapContainerRef.current, {
        center: [-26.5, -59.8],
        zoom: 7,
        minZoom: 5,
        maxZoom: 16,
      });

      // Dark CartoDB tile layer for high-contrast GIS interface
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CartoDB</a> &copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Create Layer Groups
      const layerLocalidades = L.layerGroup().addTo(map);
      const layerEstaciones = L.layerGroup().addTo(map);
      const layerBarrios = L.layerGroup().addTo(map);
      const layerSOS = L.layerGroup().addTo(map);
      const layerReportes = L.layerGroup().addTo(map);
      const layerCuencas = L.layerGroup().addTo(map);

      layersRef.current = {
        localidades: layerLocalidades,
        estaciones: layerEstaciones,
        barrios: layerBarrios,
        sos: layerSOS,
        reportes: layerReportes,
        cuencas: layerCuencas,
      };

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layers = layersRef.current;
    if (!map || !layers) return;

    // Clear previous markers
    layers.localidades.clearLayers();
    layers.estaciones.clearLayers();
    layers.barrios.clearLayers();
    layers.sos.clearLayers();
    layers.reportes.clearLayers();
    layers.cuencas.clearLayers();

    // 1. Render Cuencas approximate boundary boxes with soft polygons
    (Object.values(cuencas) as Cuenca[]).forEach((c) => {
      if (!c.bbox_aprox) return;
      const bounds: L.LatLngBoundsExpression = [
        [c.bbox_aprox.lat_min, c.bbox_aprox.lon_min],
        [c.bbox_aprox.lat_max, c.bbox_aprox.lon_max],
      ];

      const polygon = L.rectangle(bounds, {
        color: c.color_hex || '#0284c7',
        weight: 1.5,
        fillColor: c.color_hex || '#0284c7',
        fillOpacity: 0.08,
        dashArray: '4, 8',
      });

      polygon.bindTooltip(`Cuenca ${c.nombre}`, {
        permanent: false,
        direction: 'center',
        className: 'cuenca-tooltip',
      });

      layers.cuencas.addLayer(polygon);
    });

    // 2. Render Localities
    (Object.values(localidades) as Localidad[]).forEach((loc) => {
      let iconColor = '#06b6d4'; // Normal cyan
      let pulseClass = '';

      if (loc.fase_calculada === 'ALERTA' || loc.fase_calculada === 'EVACUACION' || loc.estado === 'ALERTA' || loc.estado === 'EVACUACION') {
        iconColor = '#ef4444';
        pulseClass = 'animate-ping';
      } else if (loc.fase_calculada === 'ATENCION') {
        iconColor = '#f59e0b';
      }

      const icon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; width: 28px; height: 28px;">
            <div class="${pulseClass}" style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${iconColor}; opacity: 0.4;"></div>
            <div style="position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background-color: ${iconColor}; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
              📍
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([loc.lat, loc.lon], { icon });

      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 180px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${iconColor}; margin-bottom: 2px;">
            FASE: ${loc.fase_calculada || loc.estado}
          </div>
          <h4 style="margin: 0; font-weight: 800; font-size: 14px; color: #0f172a;">${loc.nombre}</h4>
          <p style="margin: 2px 0 6px 0; font-size: 11px; color: #64748b;">Cuenca: ${loc.cuenca_clave}</p>
          <div style="background: #f8fafc; padding: 6px; border-radius: 6px; font-size: 11px; border: 1px solid #e2e8f0;">
            <div><b>Nivel actual:</b> ${loc.nivel_metros.toFixed(2)} m</div>
            <div><b>Alerta / Evacuación:</b> ${loc.umbral_alerta}m / ${loc.umbral_evacuacion}m</div>
            <div><b>Lluvia acum:</b> ${loc.precipitacion_acumulada_mm} mm</div>
          </div>
        </div>
      `);

      if (onSelectLocalidad) {
        marker.on('click', () => onSelectLocalidad(loc));
      }

      layers.localidades.addLayer(marker);
    });

    // 3. Render Hidrometric Stations
    estaciones.forEach((est) => {
      const isAlert = est.altura_actual_m >= est.nivel_alerta_m;
      const icon = L.divIcon({
        className: 'station-marker',
        html: `
          <div style="background-color: #0f172a; width: 24px; height: 24px; border-radius: 6px; border: 2px solid ${
            isAlert ? '#ef4444' : '#06b6d4'
          }; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
            🌊
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([est.lat, est.lon], { icon });

      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="font-size: 10px; font-weight: 800; color: #0284c7; text-transform: uppercase;">
            ESTACIÓN PREFECTURA NAVAL
          </div>
          <h4 style="margin: 2px 0; font-weight: 800; font-size: 13px; color: #0f172a;">${est.nombre}</h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #475569;">Río ${est.rio}</p>
          <div style="background: #f1f5f9; padding: 6px; border-radius: 6px; font-size: 11px; border: 1px solid #cbd5e1;">
            <div><b>Altura de Escala:</b> <span style="font-size: 13px; font-weight: 800; color: #0369a1;">${est.altura_actual_m.toFixed(2)} m</span></div>
            <div><b>Tendencia:</b> ${est.tendencia_texto}</div>
            <div><b>Umbrales:</b> Alerta: ${est.nivel_alerta_m}m | Evac: ${est.nivel_evacuacion_m}m</div>
          </div>
        </div>
      `);

      layers.estaciones.addLayer(marker);
    });

    // 4. Render Critical Neighborhoods (Barrios Vulnerables)
    (Object.values(barrios) as BarrioVulnerable[]).forEach((b) => {
      const icon = L.divIcon({
        className: 'barrio-marker',
        html: `
          <div style="background-color: #f43f5e; width: 18px; height: 18px; border-radius: 50%; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; font-size: 9px; box-shadow: 0 2px 5px rgba(0,0,0,0.4);">
            ⚠️
          </div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = L.marker([b.lat, b.lon], { icon });

      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif;">
          <span style="font-size: 10px; font-weight: 800; background: #ffe4e6; color: #e11d48; padding: 2px 6px; border-radius: 4px;">
            SECTOR CRÍTICO
          </span>
          <h4 style="margin: 4px 0 2px 0; font-weight: 800; font-size: 13px; color: #0f172a;">${b.nombre}</h4>
          <p style="margin: 0 0 4px 0; font-size: 11px; color: #475569;">${b.localidad_padre}</p>
          <div style="background: #fff1f2; padding: 6px; border-radius: 6px; font-size: 11px; border: 1px solid #fecdd3;">
            <div><b>Motivo / Riesgo:</b> ${b.motivo}</div>
            ${b.direccion_referencia ? `<div><b>Referencia:</b> ${b.direccion_referencia}</div>` : ''}
            ${b.via_acceso_critica ? `<div><b>Vía de acceso:</b> ${b.via_acceso_critica}</div>` : ''}
          </div>
        </div>
      `);

      if (onSelectBarrio) {
        marker.on('click', () => onSelectBarrio(b));
      }

      layers.barrios.addLayer(marker);
    });

    // 5. Render Active SOS Tickets
    ticketsSOS
      .filter((t) => t.estado !== 'RESUELTO')
      .forEach((ticket) => {
        const icon = L.divIcon({
          className: 'sos-marker animate-bounce',
          html: `
            <div style="background-color: #dc2626; width: 30px; height: 30px; border-radius: 50%; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 12px; box-shadow: 0 0 15px rgba(220,38,38,0.8);">
              SOS
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([ticket.lat, ticket.lon], { icon });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif;">
            <div style="background: #fee2e2; color: #991b1b; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; display: inline-block;">
              EMERGENCIA ACTIVA - ${ticket.estado}
            </div>
            <h4 style="margin: 4px 0 2px 0; font-weight: 800; font-size: 14px; color: #0f172a;">${ticket.nombre}</h4>
            <p style="margin: 0 0 6px 0; font-size: 11px; color: #475569;">📍 ${ticket.direccion} (${ticket.localidad})</p>
            <div style="background: #fef2f2; padding: 6px; border-radius: 6px; font-size: 11px; border: 1px solid #fecaca;">
              <div><b>Personas:</b> ${ticket.personasAfectadas} (${ticket.personasVulnerables.ninos} niños, ${ticket.personasVulnerables.ancianos} ancianos)</div>
              <div><b>Agua en domicilio:</b> ${ticket.alturaAguaCm} cm</div>
              <div><b>Tel:</b> ${ticket.telefono}</div>
            </div>
          </div>
        `);

        layers.sos.addLayer(marker);
      });

    // 6. Render Citizen Reports
    reportes.forEach((rep) => {
      const icon = L.divIcon({
        className: 'report-marker',
        html: `
          <div style="background-color: #0284c7; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            📢
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([rep.lat, rep.lon], { icon });

      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif;">
          <span style="font-size: 10px; font-weight: 800; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px;">
            REPORTE VECINAL
          </span>
          <h4 style="margin: 4px 0 2px 0; font-weight: 800; font-size: 13px; color: #0f172a;">${rep.calle}</h4>
          <p style="margin: 0 0 4px 0; font-size: 11px; color: #475569;">${rep.localidad} ${rep.barrio ? `(${rep.barrio})` : ''}</p>
          <div style="background: #f0f9ff; padding: 6px; border-radius: 6px; font-size: 11px; border: 1px solid #bae6fd;">
            <div><b>Nivel aproximado:</b> ${rep.nivelAguaAprox}</div>
            <p style="margin: 4px 0 0 0; color: #334155; font-style: italic;">"${rep.descripcion}"</p>
          </div>
        </div>
      `);

      layers.reportes.addLayer(marker);
    });
  }, [cuencas, localidades, estaciones, barrios, ticketsSOS, reportes]);

  return (
    <div className="space-y-4">
      {/* Map Control Toolbar */}
      <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 block">
                GEOSPATIAL COMMAND CENTER
              </span>
              <span className="text-sm font-bold text-white">Capas SIG & Filtros Territoriales</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800">
            PROYECCIÓN: <span className="text-cyan-300 font-bold">EPSG:4326 (WGS84)</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => toggleLayer('estaciones')}
            className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 ${
              layerVisibility.estaciones
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                : 'bg-slate-950/60 text-slate-500 border-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${layerVisibility.estaciones ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
            <span>Estaciones PNA ({estaciones.length})</span>
          </button>

          <button
            onClick={() => toggleLayer('localidades')}
            className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 ${
              layerVisibility.localidades
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                : 'bg-slate-950/60 text-slate-500 border-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${layerVisibility.localidades ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span>Localidades ({Object.keys(localidades).length})</span>
          </button>

          <button
            onClick={() => toggleLayer('barrios')}
            className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 ${
              layerVisibility.barrios
                ? 'bg-rose-950/60 text-rose-300 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.25)]'
                : 'bg-slate-950/60 text-slate-500 border-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${layerVisibility.barrios ? 'bg-rose-500' : 'bg-slate-600'}`} />
            <span>Sectores Críticos ({Object.keys(barrios).length})</span>
          </button>

          <button
            onClick={() => toggleLayer('sos')}
            className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 ${
              layerVisibility.sos
                ? 'bg-red-950/80 text-red-300 border-red-500/60 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'bg-slate-950/60 text-slate-500 border-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${layerVisibility.sos ? 'bg-red-600' : 'bg-slate-600'}`} />
            <span>Emergencias SOS ({ticketsSOS.filter((t) => t.estado !== 'RESUELTO').length})</span>
          </button>

          <button
            onClick={() => toggleLayer('reportes')}
            className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 ${
              layerVisibility.reportes
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                : 'bg-slate-950/60 text-slate-500 border-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${layerVisibility.reportes ? 'bg-cyan-400' : 'bg-slate-600'}`} />
            <span>Reportes Vecinos ({reportes.length})</span>
          </button>

          <button
            onClick={() => toggleLayer('cuencas')}
            className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 ${
              layerVisibility.cuencas
                ? 'bg-indigo-950/60 text-indigo-300 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.25)]'
                : 'bg-slate-950/60 text-slate-500 border-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${layerVisibility.cuencas ? 'bg-indigo-400' : 'bg-slate-600'}`} />
            <span>Polígonos de Cuencas</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[420px] sm:h-[520px] md:h-[640px] rounded-2xl overflow-hidden border border-slate-800/90 shadow-2xl bg-[#020617]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Mobile Legend Toggle */}
        <div className="sm:hidden absolute top-3 right-3 z-[1000]">
          <button
            onClick={() => setShowMobileLegend(!showMobileLegend)}
            className="px-3 py-2 min-h-[40px] rounded-lg bg-slate-950/95 border border-slate-700 text-slate-200 text-xs font-bold shadow-lg"
          >
            {showMobileLegend ? 'Ocultar Leyenda' : 'Ver Leyenda'}
          </button>
        </div>

        {/* Floating Map Legend */}
        <div
          className={`${
            showMobileLegend ? 'block' : 'hidden'
          } sm:block absolute bottom-3 right-3 z-[1000] bg-slate-950/95 backdrop-blur-xl border border-cyan-900/40 p-3 sm:p-4 rounded-xl shadow-2xl text-xs max-w-[260px] sm:max-w-xs space-y-2 pointer-events-auto`}
        >
          <div className="font-mono font-bold text-white flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="uppercase text-[10px] sm:text-[11px] tracking-wider text-cyan-300">
                REFERENCIAS SIG
              </span>
            </div>
            <button
              onClick={() => setShowMobileLegend(false)}
              className="sm:hidden text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 sm:space-y-2 text-slate-300 font-mono text-[9px] sm:text-[10px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block border border-slate-900 shrink-0" />
              <span className="truncate">Estaciones Prefectura Naval</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block border border-slate-900 shrink-0" />
              <span className="truncate">Localidad Nivel Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block border border-slate-900 shrink-0" />
              <span className="truncate">Fase Atención (&lt;72h)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block border border-slate-900 shrink-0" />
              <span className="truncate">Sector Crítico / Barrio</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block border border-slate-900 animate-pulse shrink-0" />
              <span className="truncate">Ticket SOS (Auxilio Urgente)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
