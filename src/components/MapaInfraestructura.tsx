import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ESTACIONES_BOMBEO, CUERPOS_DE_AGUA, PuntoInfraestructura, CuerpoAgua } from '../data/infraestructuraHidrica';

// Centro aproximado del AMGR (Resistencia + Barranqueras + Vilelas juntas)
const CENTRO_AMGR: [number, number] = [-27.475, -58.96];

const COLOR_POR_TIPO: Record<PuntoInfraestructura['tipo'], string> = {
  estacion_bombeo: '#0284c7', // azul, igual que en el mapa oficial de APA
  obra_control: '#991b1b',    // bordó, igual que "Obra de Control" en APA
  alcantarilla: '#0d9488',    // verde azulado
};

const COLOR_CUERPO_AGUA: Record<CuerpoAgua['tipo'], string> = {
  rio: '#0ea5e9',
  riacho: '#38bdf8',
  laguna_oxidacion: '#a16207',
  embalse: '#65a30d',
};

interface MapaInfraestructuraProps {
  centroInicial?: [number, number];
  zoomInicial?: number;
}

export const MapaInfraestructura: React.FC<MapaInfraestructuraProps> = ({
  centroInicial,
  zoomInicial,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: centroInicial || CENTRO_AMGR,
        zoom: zoomInicial || 12,
        minZoom: 5,
        maxZoom: 17,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CartoDB</a> &copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // 1. Estaciones de bombeo y obras de control
      Object.values(ESTACIONES_BOMBEO).forEach((punto) => {
        const color = COLOR_POR_TIPO[punto.tipo];
        const bordeAdvertencia = punto.precision === 'requiere_geocodificacion' ? '4px dashed #f59e0b' : '2px solid #ffffff';

        const icon = L.divIcon({
          className: 'infra-marker',
          html: `
            <div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: ${bordeAdvertencia}; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.4);">
              💧
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([punto.lat, punto.lon], { icon });

        const avisoUbicacion = punto.precision === 'requiere_geocodificacion'
          ? `<div style="margin-top:4px; padding:4px 6px; background:#fffbeb; border:1px solid #fde68a; border-radius:4px; color:#92400e; font-size:10px;">
               ⚠️ Ubicación aproximada (centroide de la localidad) — falta confirmar la posición exacta.
             </div>`
          : '';

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 180px;">
            <span style="font-size: 10px; font-weight: 800; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${punto.tipo === 'estacion_bombeo' ? 'Estación de bombeo' : punto.tipo === 'obra_control' ? 'Obra de control' : 'Alcantarilla'}
            </span>
            <h4 style="margin: 4px 0 2px 0; font-weight: 800; font-size: 14px; color: #0f172a;">${punto.nombre}</h4>
            <p style="margin: 0; font-size: 11px; color: #64748b;">Fuente: ${punto.fuente}</p>
            ${avisoUbicacion}
          </div>
        `);

        marker.addTo(map);
      });

      // 2. Ríos, riacho y lagunas de oxidación
      Object.values(CUERPOS_DE_AGUA).forEach((cuerpo) => {
        const color = COLOR_CUERPO_AGUA[cuerpo.tipo];

        const icon = L.divIcon({
          className: 'agua-marker',
          html: `
            <div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 4px; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const marker = L.marker([cuerpo.lat, cuerpo.lon], { icon });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 180px;">
            <span style="font-size: 10px; font-weight: 800; background: #ecfeff; color: #0e7490; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${cuerpo.tipo.replace('_', ' ')}
            </span>
            <h4 style="margin: 4px 0 2px 0; font-weight: 800; font-size: 14px; color: #0f172a;">${cuerpo.nombre}</h4>
            ${cuerpo.nota ? `<p style="margin: 0; font-size: 11px; color: #475569;">${cuerpo.nota}</p>` : ''}
          </div>
        `);

        marker.addTo(map);
      });

      mapInstanceRef.current = map;
    }
  }, [centroInicial, zoomInicial]);

  return (
    <div className="space-y-3">
      {/* Aviso general de precisión de datos */}
      <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-3 text-xs text-amber-200">
        ⚠️ Varias estaciones de bombeo todavía no tienen coordenadas exactas (están marcadas con borde punteado
        en el mapa). Su posición se tomó de forma visual del mapa oficial de APA, no de una geocodificación real.
      </div>

      <div className="relative w-full h-[420px] sm:h-[520px] md:h-[640px] rounded-2xl overflow-hidden border border-slate-800/90 shadow-2xl bg-[#020617]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Leyenda */}
        <div className="absolute bottom-3 right-3 z-[1000] bg-slate-950/95 backdrop-blur-xl border border-cyan-900/40 p-3 sm:p-4 rounded-xl shadow-2xl text-xs max-w-[260px] space-y-2">
          <div className="font-mono font-bold text-white uppercase text-[10px] tracking-wider text-cyan-300 border-b border-slate-800 pb-1.5">
            Infraestructura hídrica
          </div>
          <div className="space-y-1.5 text-slate-300 font-mono text-[9px] sm:text-[10px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block border border-slate-900 shrink-0" />
              <span>Estación de bombeo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-800 inline-block border border-slate-900 shrink-0" />
              <span>Obra de control</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-sky-400 inline-block border border-slate-900 shrink-0" />
              <span>Río / riacho</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-yellow-700 inline-block border border-slate-900 shrink-0" />
              <span>Laguna de oxidación</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
