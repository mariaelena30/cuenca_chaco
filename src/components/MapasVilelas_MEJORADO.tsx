import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Cuenca, Localidad, BarrioVulnerable, TicketSOS, ReporteCiudadano } from '../types';
import { BARRIOS_VILELAS } from '../data/barriosVulnerables';
import { OBRAS_HIDRAULICAS_VILELAS, CENTROS_EVACUACION_VILELAS, CAPACIDAD_TOTAL_REFUGIOS } from '../data/obrasVilelas';

// CORRECCIÓN CLAVE: reescrito con Leaflet puro (`leaflet`), igual que
// InteractiveMap.tsx. `react-leaflet` no está instalado en este proyecto
// (no figura en package.json) y era la causa del ReferenceError en
// producción.

interface Props {
  cuencas: Record<string, Cuenca>;
  localidades: Record<string, Localidad>;
  barrios: Record<string, BarrioVulnerable>;
  ticketsSOS: TicketSOS[];
  reportes: ReporteCiudadano[];
}

const CENTRO_VILELAS: [number, number] = [-27.5044196, -58.9385416];

function generarPoligonoBarrio(lat: number, lon: number, bufferGrados: number = 0.006): [number, number][] {
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    barrios: L.LayerGroup;
    obras: L.LayerGroup;
    refugios: L.LayerGroup;
    sos: L.LayerGroup;
  } | null>(null);

  const [filtroVisibilidad, setFiltroVisibilidad] = useState({
    barrios: true,
    obras: true,
    refugios: true,
    sos: true,
  });

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'RIESGO_ALTO':
        return '#ef4444';
      case 'RIESGO_MEDIO':
        return '#f97316';
      case 'SEGURO':
        return '#10b981';
      default:
        return '#64748b';
    }
  };

  const toggleFiltro = (key: keyof typeof filtroVisibilidad) => {
    setFiltroVisibilidad((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const layers = layersRef.current;
      const map = mapInstanceRef.current;
      if (layers && map) {
        if (next[key]) layers[key].addTo(map);
        else layers[key].remove();
      }
      return next;
    });
  };

  // Inicializa el mapa una sola vez
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: CENTRO_VILELAS,
      zoom: 14,
      minZoom: 10,
      maxZoom: 19,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const layerBarrios = L.layerGroup().addTo(map);
    const layerObras = L.layerGroup().addTo(map);
    const layerRefugios = L.layerGroup().addTo(map);
    const layerSOS = L.layerGroup().addTo(map);

    layersRef.current = { barrios: layerBarrios, obras: layerObras, refugios: layerRefugios, sos: layerSOS };
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Redibuja capas cuando cambian los datos
  useEffect(() => {
    const layers = layersRef.current;
    if (!layers) return;

    layers.barrios.clearLayers();
    layers.obras.clearLayers();
    layers.refugios.clearLayers();
    layers.sos.clearLayers();

    // CAPA 1: Barrios RENABAP (polígonos)
    Object.values(BARRIOS_VILELAS).forEach((barrio) => {
      const poligono = L.polygon(generarPoligonoBarrio(barrio.lat, barrio.lon, 0.008), {
        color: obtenerColorEstado(barrio.estado_actual),
        weight: 3,
        opacity: 0.7,
        fillOpacity: 0.3,
        dashArray: '5, 5',
      });
      poligono.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width:180px;">
          <div style="font-weight:800; font-size:13px;">${barrio.nombre}</div>
          <div style="font-size:11px;">Precisión: ${barrio.precision}</div>
          <div style="font-size:11px;">Familias: ${barrio.familias_estimadas || 'N/A'}</div>
          <div style="font-size:11px;">Estado: ${barrio.estado_actual}</div>
          <div style="font-size:10px; color:#94a3b8; margin-top:4px;">${barrio.lat.toFixed(6)}, ${barrio.lon.toFixed(6)}</div>
        </div>
      `);
      layers.barrios.addLayer(poligono);
    });

    // CAPA 2: Obras de infraestructura (marcador + círculo de alcance)
    OBRAS_HIDRAULICAS_VILELAS.forEach((obra) => {
      const marker = L.marker([obra.lat, obra.lon]);
      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width:220px;">
          <div style="font-weight:800; font-size:13px; background:#0f172a; color:#fff; padding:2px 6px; border-radius:4px; display:inline-block;">
            Obra ${obra.numero}: ${obra.nombre}
          </div>
          <div style="font-size:11px; margin-top:6px;"><b>Descripción:</b> ${obra.descripcion}</div>
          <div style="font-size:11px;"><b>Ubicación:</b> ${obra.ubicacion_referencia}</div>
          ${obra.extension_m ? `<div style="font-size:11px;"><b>Extensión:</b> ${obra.extension_m.toLocaleString()} m</div>` : ''}
          <div style="font-size:11px;"><b>Plazo:</b> ${obra.plazo_estimado}</div>
          <div style="font-size:11px; font-weight:700; color:${obra.estado_actual === 'CONFIRMADA' ? '#059669' : '#d97706'};">
            ${obra.estado_actual}
          </div>
          <div style="font-size:10px; color:#94a3b8; margin-top:4px;">${obra.lat.toFixed(6)}, ${obra.lon.toFixed(6)}</div>
        </div>
      `);
      layers.obras.addLayer(marker);

      const circulo = L.circle([obra.lat, obra.lon], {
        radius: obra.extension_m || 500,
        color: obra.prioridad <= 2 ? '#ef4444' : '#f97316',
        weight: 1,
        opacity: 0.2,
        fillOpacity: 0.05,
      });
      layers.obras.addLayer(circulo);
    });

    // CAPA 3: Centros de evacuación
    CENTROS_EVACUACION_VILELAS.forEach((centro) => {
      const circulo = L.circle([centro.lat, centro.lon], {
        radius: 300,
        color: '#10b981',
        weight: 2,
        opacity: 0.6,
        fillOpacity: 0.2,
      });
      circulo.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width:220px;">
          <div style="font-weight:800; font-size:13px; background:#065f46; color:#fff; padding:2px 6px; border-radius:4px; display:inline-block;">
            ${centro.nombre}
          </div>
          <div style="font-size:11px; margin-top:6px;"><b>Capacidad:</b> ${centro.capacidad_personas} personas</div>
          <div style="font-size:11px;"><b>Familias:</b> ${centro.capacidad_familias_estimadas || 'N/A'}</div>
          <div style="font-size:11px; margin-top:4px;">
            ${centro.agua_potable ? '✓' : '✗'} Agua potable<br/>
            ${centro.electricidad ? '✓' : '✗'} Electricidad<br/>
            ${centro.cocina_comedor ? '✓' : '✗'} Cocina/Comedor<br/>
            ${centro.acceso_discapacitados ? '✓' : '✗'} Acceso discapacitados
          </div>
          ${
            centro.barrios_cobertura && centro.barrios_cobertura.length > 0
              ? `<div style="font-size:11px; margin-top:4px;"><b>Barrios próximos:</b> ${centro.barrios_cobertura.join(', ')}</div>`
              : ''
          }
          <div style="font-size:10px; color:#94a3b8; margin-top:4px;">${centro.lat.toFixed(6)}, ${centro.lon.toFixed(6)}</div>
        </div>
      `);
      layers.refugios.addLayer(circulo);
    });

    // CAPA 4: Alertas SOS activas
    ticketsSOS
      .filter((t) => t.estado === 'PENDIENTE' || t.estado === 'DESPACHADO')
      .forEach((ticket) => {
        const circulo = L.circle([ticket.lat, ticket.lon], {
          radius: 150,
          color: ticket.nivelUrgencia === 'MÁXIMO' ? '#dc2626' : '#ea580c',
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.3,
        });
        circulo.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width:180px;">
            <div style="font-weight:800; font-size:13px; color:#dc2626;">${ticket.nombre}</div>
            <div style="font-size:11px;">📍 ${ticket.direccion}</div>
            <div style="font-size:11px;">Personas: ${ticket.personasAfectadas}</div>
            <div style="font-size:11px;">Urgencia: ${ticket.nivelUrgencia}</div>
            <div style="font-size:10px; color:#94a3b8;">Estado: ${ticket.estado}</div>
          </div>
        `);
        layers.sos.addLayer(circulo);
      });
  }, [ticketsSOS]);

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

        {/* CONTROLES DE VISIBILIDAD (reemplazan al LayersControl de react-leaflet) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition">
            <input
              type="checkbox"
              checked={filtroVisibilidad.barrios}
              onChange={() => toggleFiltro('barrios')}
              className="w-4 h-4"
            />
            <span className="text-xs font-semibold text-slate-300">🏘️ Barrios RENABAP</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition">
            <input
              type="checkbox"
              checked={filtroVisibilidad.obras}
              onChange={() => toggleFiltro('obras')}
              className="w-4 h-4"
            />
            <span className="text-xs font-semibold text-slate-300">⚙️ 7 Obras (APA)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition">
            <input
              type="checkbox"
              checked={filtroVisibilidad.refugios}
              onChange={() => toggleFiltro('refugios')}
              className="w-4 h-4"
            />
            <span className="text-xs font-semibold text-slate-300">🏠 Centros Evacuación</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition">
            <input
              type="checkbox"
              checked={filtroVisibilidad.sos}
              onChange={() => toggleFiltro('sos')}
              className="w-4 h-4"
            />
            <span className="text-xs font-semibold text-slate-300">🆘 Alertas SOS</span>
          </label>
        </div>

        {/* ESTADÍSTICAS RÁPIDAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
            <div className="text-slate-500 uppercase font-bold tracking-wider">Barrios RENABAP</div>
            <div className="text-2xl font-bold text-red-400 mt-1">{Object.values(BARRIOS_VILELAS).length}</div>
            <div className="text-[10px] text-slate-500 mt-1">1.199 familias aprox.</div>
          </div>
          <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
            <div className="text-slate-500 uppercase font-bold tracking-wider">Obras Prioritarias</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{OBRAS_HIDRAULICAS_VILELAS.length}</div>
            <div className="text-[10px] text-slate-500 mt-1">Estado: Confirmadas</div>
          </div>
          <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
            <div className="text-slate-500 uppercase font-bold tracking-wider">Refugios Operativos</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{CENTROS_EVACUACION_VILELAS.length}</div>
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
        <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
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
