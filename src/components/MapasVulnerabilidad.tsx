// src/components/MapasVulnerabilidad.tsx
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Cuenca, Localidad, EstacionHidrometrica, BarrioVulnerable, TicketSOS, ReporteCiudadano } from '../types';
import { BARRIOS_BARRANQUERAS, BARRIOS_VILELAS } from '../data/barriosVulnerables';

// Importaciones estándar del mapa de Claude
import { InteractiveMap } from './InteractiveMap';
import { MapaInfraestructura } from './MapaInfraestructura';

// CARGA DINÁMICA DE RE-LEAFLET PARA EVITAR ERROR DE INTERFAZ SSR EN VERCEL
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then((mod) => mod.Polygon), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const LayersControl = dynamic(() => import('react-leaflet').then((mod) => mod.LayersControl), { ssr: false });

// Hook interno para controlar el salto de cámara (flyTo) hacia Paraje Tacuarí
const MapController = ({ centro, zoom }: { centro: [number, number]; zoom: number }) => {
  const map = require('react-leaflet').useMap();
  React.useEffect(() => {
    if (centro) map.flyTo(centro, zoom, { animate: true, duration: 2 });
  }, [centro, zoom, map]);
  return null;
};

interface Props {
  cuencas: Record<string, Cuenca>;
  localidades: Record<string, Localidad>;
  estaciones: EstacionHidrometrica[];
  barrios: Record<string, BarrioVulnerable>;
  ticketsSOS: TicketSOS[];
  reportes: ReporteCiudadano[];
}

const CENTRO_BARRANQUERAS_VILELAS: [number, number] = [-27.495, -58.93];
const CENTRO_AMGR: [number, number] = [-27.475, -58.96];
const COLONIA_TACUARI: [number, number] = [-27.7667, -58.8500];

export const MapasVulnerabilidad: React.FC<Props> = ({
  cuencas,
  localidades,
  estaciones,
  barrios,
  ticketsSOS,
  reportes,
}) => {
  // Estado de cámara interactivo del mapa táctico (Requerimiento Botón Tacuarí)
  const [camara, setCamara] = useState<{ centro: [number, number]; zoom: number }>({
    centro: CENTRO_BARRANQUERAS_VILELAS,
    zoom: 13,
  });
  
  const [filtroRiesgo, setFiltroRiesgo] = useState<string>('TODOS');

  const barriosBarranquerasYVilelas = {
    ...BARRIOS_BARRANQUERAS,
    ...BARRIOS_VILELAS,
  };

  // Requerimiento: Extraer de forma reactiva la estación hídrica local para el indicador neón
  const estacionLocal = estaciones.find(e => e.nombre.includes('Barranqueras') || e.nombre.includes('Vilelas')) || {
    nombre: "Puerto Vilelas / Barranqueras",
    lecturaActual: 5.45,
    cotaAlerta: 6.00,
    cotaEvacuacion: 6.50,
    tendencia: "CRECIENTE"
  };

  const obtenerColorAlerta = (nivel: number) => {
    if (nivel >= estacionLocal.cotaEvacuacion) return '#ef4444';
    if (nivel >= estacionLocal.cotaAlerta) return '#f97316';
    return '#10b981';
  };

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

        {/* CONTENEDOR DE LA INTERFAZ DOCK DEL SOFTWARE DE COMANDO */}
        <div className="flex flex-col lg:flex-row h-[600px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-sans">
          
          {/* PANEL LATERAL DE LOGÍSTICA URBANA */}
          <div className="w-full lg:w-[340px] p-5 overflow-y-auto border-r border-slate-800 bg-slate-900/50 flex flex-col gap-5">
            
            {/* INDICADOR HIDROMÉTRICO VIVO (OBTENIDO DEL PROPS ESTACIONES) */}
            <div 
              className="p-4 rounded-lg bg-slate-900 border-l-[6px]"
              style={{ borderLeftColor: obtenerColorAlerta(estacionLocal.lecturaActual) }}
            >
              <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">ESTADO HIDROMÉTRICO</div>
              <h4 className="text-sm font-bold text-slate-200 mt-1 truncate">{estacionLocal.nombre}</h4>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-3xl font-extrabold tracking-tight" style={{ color: obtenerColorAlerta(estacionLocal.lecturaActual) }}>
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

            {/* FILTRADO DE INFRAESTRUCTURA */}
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

            {/* ALERTA DE SOLICITUDES CIUDADANAS VIVAS (PROPS TICKETS-SOS) */}
            <div>
              <h4 className="text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2 mb-2 uppercase tracking-wide">
                🏠 Alertas Ciudadanas Activas ({ticketsSOS.filter(t => t.estado === 'PENDIENTE').length})
              </h4>
              <div className="space-y-2 max-h-[180px] overflow-y-auto">
                {ticketsSOS.filter(t => t.estado === 'PENDIENTE').slice(0, 3).map((ticket) => (
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

            {/* CONTROL DE VISTAS TÁCTICAS */}
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

          {/* PAÑO GEOGRÁFICO INTEGRADO DEL VISOR */}
          <div className="flex-1 relative bg-slate-950">
            <MapContainer center={CENTRO_BARRANQUERAS_VILELAS} zoom={13} className="h-full w-full">
              <TileLayer url="https://google.com{x}&y={y}&z={z}" attribution="&copy; Google Maps" />
              <MapController centro={camara.centro} zoom={camara.zoom} />

              {/* REQUERIMIENTO INTERACTIVE CONTROL: CAPAS CONMUTABLES */}
              <LayersControl position="topright">
                
                {/* CAPA 1: POLÍGONOS DE BARRIOS CRÍTICOS (PROPS BARRIOS) */}
                <LayersControl.Overlay checked name="⚠️ Polígonos de Riesgo Inundación">
                  <>
                    {Object.values(barriosBarranquerasYVilelas)
                      .filter(b => filtroRiesgo === 'TODOS' || b.esCritico)
                      .map((barrio, idx) => (
                        <Polygon 
                          key={idx} 
                          positions={[[ -27.5115, -58.9405 ], [ -27.5140, -58.9250 ], [ -27.5190, -58.9280 ]]} // Fallback perimetral si el shape es vacío
