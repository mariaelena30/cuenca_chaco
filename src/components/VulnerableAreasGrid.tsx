import React, { useState, useRef } from 'react';
import { BarrioVulnerable, Localidad } from '../types';
import {
  MapPin,
  Route,
  ShieldAlert,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Activity,
  Compass,
  Play,
} from 'lucide-react';

interface VulnerableAreasGridProps {
  barrios: Record<string, BarrioVulnerable>;
  localidades: Record<string, Localidad>;
  onNavigateToMap?: (lat?: number, lon?: number) => void;
  onOpenScanner?: (barrioId?: string) => void;
}

export const VulnerableAreasGrid: React.FC<VulnerableAreasGridProps> = ({
  barrios,
  localidades,
  onNavigateToMap,
  onOpenScanner,
}) => {
  const [filterRegion, setFilterRegion] = useState<'todos' | 'amgr' | 'costera' | 'impenetrable'>('todos');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const barriosList = Object.values(barrios) as BarrioVulnerable[];

  const filteredBarrios = barriosList.filter((b) => {
    if (filterRegion === 'todos') return true;
    if (filterRegion === 'amgr') {
      return ['resistencia', 'barranqueras', 'puerto_vilelas'].includes(b.localidad_padre);
    }
    if (filterRegion === 'costera') {
      return (
        ['barranqueras', 'puerto_vilelas', 'puerto_bermejo', 'isla_del_cerrito', 'formosa'].includes(b.localidad_padre) ||
        b.id === 'san_pedro_pescador' ||
        b.id === 'antequeras' ||
        b.id === 'tres_bocas' ||
        b.id === 'paraje_isla_soto'
      );
    }
    if (filterRegion === 'impenetrable') {
      return (
        ['el_sauzalito', 'villa_rio_bermejito', 'mision_nueva_pompeya', 'fuerte_esperanza', 'rio_muerto'].includes(
          b.localidad_padre
        ) ||
        b.id === 'parajes_sauzalito'
      );
    }
    return true;
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header with Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
              Gestión Territorial del Riesgo Hídrico
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
            Sectores y Localidades Críticas de Vulnerabilidad
          </h3>
          <p className="text-xs text-slate-400">
            Monitoreo focalizado de áreas vulnerables fuera de defensas y parajes aislables.
          </p>
        </div>

        {/* Filters, Scanner Trigger & Scroll Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          {onOpenScanner && (
            <button
              onClick={() => onOpenScanner()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/80 text-rose-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Abrir Escáner y Testeo de Vulnerabilidad Hídrica"
            >
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>Escáner de Vulnerabilidad</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterRegion('todos')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filterRegion === 'todos'
                  ? 'bg-slate-200 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({barriosList.length})
            </button>
            <button
              onClick={() => setFilterRegion('amgr')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterRegion === 'amgr'
                  ? 'bg-blue-950/80 text-blue-200 border border-blue-700/60 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-blue-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Gran Resistencia</span>
            </button>
            <button
              onClick={() => setFilterRegion('costera')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterRegion === 'costera'
                  ? 'bg-sky-950/80 text-sky-200 border border-sky-700/60 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-sky-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Ribera Paraná</span>
            </button>
            <button
              onClick={() => setFilterRegion('impenetrable')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterRegion === 'impenetrable'
                  ? 'bg-amber-950/80 text-amber-200 border border-amber-700/60 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Impenetrable</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Desplazar hacia la izquierda"
              aria-label="Desplazar izquierda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Desplazar hacia la derecha"
              aria-label="Desplazar derecha"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 snap-x"
      >
        {filteredBarrios.map((b) => {
          const locPadre = localidades[b.localidad_padre];
          const isRiskMedium = b.estado_actual === 'RIESGO_MEDIO';

          let statusBadge = (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/40 text-rose-300 border border-rose-800/40 flex items-center gap-1 flex-shrink-0">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              VULNERABLE
            </span>
          );

          if (isRiskMedium) {
            statusBadge = (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/50 text-amber-300 border border-amber-800/50 flex items-center gap-1 flex-shrink-0">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                RIESGO MEDIO
              </span>
            );
          }

          return (
            <div
              key={b.id}
              className="w-[280px] sm:w-[320px] max-w-[320px] bg-gradient-to-b from-rose-950/20 via-slate-900/85 to-slate-950/95 border border-rose-900/40 hover:border-rose-700/60 rounded-2xl p-4 transition-all duration-200 shadow-sm flex flex-col justify-between group flex-shrink-0 snap-start"
            >
              <div className="space-y-2.5">
                {/* Header with Location and Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-rose-300 uppercase tracking-wide flex items-center gap-1 truncate min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span className="truncate">{locPadre ? locPadre.nombre : b.localidad_padre}</span>
                  </span>
                  {statusBadge}
                </div>

                {/* Barrio Title */}
                <h4 className="text-sm font-bold text-white group-hover:text-rose-100 transition-colors leading-snug line-clamp-2">
                  {b.nombre}
                </h4>

                {/* Vulnerability Cause */}
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-rose-950/50">
                  <span className="text-[10px] uppercase font-bold text-rose-400/90 tracking-wider block mb-0.5">
                    Causa de Vulnerabilidad
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                    {b.motivo}
                  </p>
                </div>

                {/* Location / Address Reference */}
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/70 text-xs space-y-1">
                  <div className="flex items-center gap-1 text-slate-400 font-medium text-[10px]">
                    <MapPin className="w-3 h-3 text-rose-400/80 flex-shrink-0" />
                    <span>Ubicación / Dirección:</span>
                  </div>
                  <p className="text-slate-200 text-[11px] font-medium leading-tight line-clamp-2">
                    {b.direccion_referencia || 'Ribera o valle bajo identificado'}
                  </p>
                </div>

                {/* Critical Route */}
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/70 text-xs space-y-1">
                  <div className="flex items-center gap-1 text-slate-400 font-medium text-[10px]">
                    <Route className="w-3 h-3 text-rose-400/70 flex-shrink-0" />
                    <span>Vía de Acceso Crítica:</span>
                  </div>
                  <p className="text-rose-300/90 text-[11px] leading-tight line-clamp-2">
                    {b.via_acceso_critica || 'Terrestre'}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 mt-2.5 gap-2">
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  GPS: {b.lat.toFixed(3)}, {b.lon.toFixed(3)}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {onOpenScanner && (
                    <button
                      onClick={() => onOpenScanner(b.id)}
                      className="flex items-center gap-1 text-[11px] text-rose-300 hover:text-white font-bold bg-rose-950/70 hover:bg-rose-900/90 px-2 py-0.5 rounded border border-rose-800/60 transition-colors cursor-pointer"
                      title="Testear y escanear riesgo de este sector"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>Testear</span>
                    </button>
                  )}

                  {onNavigateToMap && (
                    <button
                      onClick={() => onNavigateToMap(b.lat, b.lon)}
                      className="flex items-center gap-1 text-xs text-slate-300 hover:text-white font-medium cursor-pointer transition-colors"
                      title="Ver en mapa SIG"
                    >
                      <span>Mapa</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
