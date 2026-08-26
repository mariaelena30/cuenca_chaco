import React from 'react';
import {
  Cuenca,
  Localidad,
  EstacionHidrometrica,
  BarrioVulnerable,
} from '../types';
import { LocalitiesCarousel } from './LocalitiesCarousel';
import { BasinDynamicCards } from './BasinDynamicCards';
import { VulnerableAreasGrid } from './VulnerableAreasGrid';
import {
  Droplets,
  CloudRain,
  Layers,
  Shield,
  Activity,
  AlertTriangle,
  Info,
  Building2,
  PhoneCall,
  Phone,
  Flame,
  Ship,
} from 'lucide-react';

interface MonitoringDashboardProps {
  cuencas: Record<string, Cuenca>;
  localidades: Record<string, Localidad>;
  estaciones: EstacionHidrometrica[];
  barrios: Record<string, BarrioVulnerable>;
  onSelectCuenca: (cuenca: Cuenca) => void;
  onSelectLocalidad: (loc: Localidad) => void;
  onNavigateToMap?: (lat?: number, lon?: number) => void;
  onOpenScanner?: (barrioId?: string) => void;
  onOpenSOS?: () => void;
  onOpenReport?: () => void;
  onOpenTelefonos?: () => void;
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  cuencas,
  localidades,
  estaciones,
  barrios,
  onSelectCuenca,
  onSelectLocalidad,
  onNavigateToMap,
  onOpenScanner,
  onOpenSOS,
  onOpenReport,
  onOpenTelefonos,
}) => {
  return (
    <div className="space-y-6 pb-10">
      {/* 1. Dynamic Basin Cards (Las 4 Cuencas Hidrográficas del Chaco) - Vista Principal Superior */}
      <section>
        <BasinDynamicCards
          cuencas={cuencas}
          onSelectCuenca={onSelectCuenca}
        />
      </section>

      {/* 2. Quick Locality Consultation (Selector por Localidad del Chaco) - SEGUNDO */}
      <section>
        <LocalitiesCarousel
          localidades={localidades}
          onSelectLocalidad={onSelectLocalidad}
          onNavigateToMap={onNavigateToMap}
        />
      </section>

      {/* 3. Vulnerable Areas & Critical Localities - TERCERO */}
      <section>
        <VulnerableAreasGrid
          barrios={barrios}
          localidades={localidades}
          onNavigateToMap={onNavigateToMap}
          onOpenScanner={onOpenScanner}
        />
      </section>

      {/* SECCIÓN DESTACADA: ¿DÓNDE Y CÓMO PEDIR AYUDA? - LÍNEAS DE EMERGENCIA Y REPORTE DE ANEGAMIENTO */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-700/90 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                ¿Dónde y Cómo Pedir Ayuda en Chaco? • Emergencias & Anegamientos
              </h2>
              <p className="text-xs text-slate-400">
                Guardias 24hs de Bomberos Voluntarios Barranqueras, Defensa Civil Chaco y Prefectura Naval
              </p>
            </div>
          </div>

          {onOpenTelefonos && (
            <button
              onClick={onOpenTelefonos}
              className="self-start md:self-auto px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              <span>Ver Guía Telefónica Completa</span>
            </button>
          )}
        </div>

        {/* 3 Action Pillars: SOS Request, Citizen Waterlogging Report, Direct 1-Touch Phone Speed-Dial */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Pedir Auxilio SOS */}
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-900/60 text-rose-300 border border-rose-700/50">
                  Rescate y Evacuación
                </span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                1. Pedir Auxilio / Rescate SOS
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Si estás atrapado, aislado o el agua entró a tu vivienda, enviá tu alerta con ubicación GPS directa a la Mesa de Operaciones de Bomberos y Defensa Civil.
              </p>
            </div>

            {onOpenSOS && (
              <button
                onClick={onOpenSOS}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>PEDIR AYUDA SOS AHORA</span>
              </button>
            )}
          </div>

          {/* Card 2: Reportar Anegamiento */}
          <div className="bg-sky-950/40 border border-sky-800/60 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-900/60 text-sky-300 border border-sky-700/50">
                  Comunidad & Tránsito
                </span>
                <Droplets className="w-4 h-4 text-sky-400" />
              </div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                2. Reportar Anegamiento de Calle
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Avisá sobre calles anegadas, sumideros tapados o desbordes en tu barrio para alertar en el mapa en vivo y coordinar asistencia municipal.
              </p>
            </div>

            {onOpenReport && (
              <button
                onClick={onOpenReport}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-sky-950/50 flex items-center justify-center gap-2"
              >
                <Droplets className="w-4 h-4" />
                <span>REPORTAR ANEGAMIENTO</span>
              </button>
            )}
          </div>

          {/* Card 3: Discado Rápido Telefónico 1-Touch */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  Llamada Inmediata 24hs
                </span>
                <PhoneCall className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                3. Números Directos de Emergencia
              </h3>
              <p className="text-xs text-slate-400">
                Llamadas gratuitas desde cualquier celular o teléfono fijo:
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <a
                href="tel:100"
                className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-700 text-slate-200 transition-colors flex items-center justify-between"
                title="Llamar a Bomberos"
              >
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-xs font-semibold">Bomberos</span>
                </div>
                <span className="text-sm font-black font-mono text-rose-400">100</span>
              </a>

              <a
                href="tel:103"
                className="p-2 rounded-lg bg-slate-900 hover:bg-amber-950/80 border border-slate-800 hover:border-amber-700 text-slate-200 transition-colors flex items-center justify-between"
                title="Llamar a Defensa Civil"
              >
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-semibold">Def. Civil</span>
                </div>
                <span className="text-sm font-black font-mono text-amber-400">103</span>
              </a>

              <a
                href="tel:106"
                className="p-2 rounded-lg bg-slate-900 hover:bg-sky-950/80 border border-slate-800 hover:border-sky-700 text-slate-200 transition-colors flex items-center justify-between"
                title="Llamar a Prefectura Naval Barranqueras"
              >
                <div className="flex items-center gap-1.5">
                  <Ship className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-xs font-semibold">Prefectura</span>
                </div>
                <span className="text-sm font-black font-mono text-sky-400">106</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Regional Hydro-climatic Synthesis */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Variables Hidroclimáticas Regionales
            </span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
            Condiciones Ambientales y Capacidad de Retención
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Índice Oceánico El Niño (ONI)
              </span>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-2 mt-0.5">
                <span>Fase Neutra (+0.45°C)</span>
                <span className="px-1.5 py-0.2 text-[10px] rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                  Sin anomalía
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Monitoreo satelital NOAA. Régimen de aportes dentro de promedios estacionales en la alta cuenca del Plata.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                NDVI Vegetación & Retención Edáfica
              </span>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-2 mt-0.5">
                <span>0.48 (Húmedo Óptimo)</span>
                <span className="px-1.5 py-0.2 text-[10px] rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                  Capacidad normal
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Saturación moderada en cuencas de los ríos Negro, Salado y Oro. Sin riesgo de escorrentía superficial acelerada.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 shrink-0">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Pluviometría Acumulada 24h
              </span>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-2 mt-0.5">
                <span>22.4 mm Promedio Provincial</span>
                <span className="px-1.5 py-0.2 text-[10px] rounded bg-amber-950/40 text-amber-300 border border-amber-800/40 font-medium">
                  Máx: 45mm Sauzalito
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Red pluviométrica policial y APA activa. Monitoreo permanente en estaciones de bombeo de Barranqueras y Resistencia.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
