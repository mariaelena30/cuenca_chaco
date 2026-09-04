import React, { useState } from 'react';
import { Localidad } from '../types';
import {
  MapPin,
  CloudRain,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Phone,
  ExternalLink,
  Search,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface LocalitiesCarouselProps {
  localidades: Record<string, Localidad>;
  onSelectLocalidad: (loc: Localidad) => void;
  onNavigateToMap?: (lat?: number, lon?: number) => void;
}

export const LocalitiesCarousel: React.FC<LocalitiesCarouselProps> = ({
  localidades,
  onSelectLocalidad,
  onNavigateToMap,
}) => {
  const locList = Object.values(localidades) as Localidad[];
  const [selectedId, setSelectedId] = useState<string>(locList[0]?.id || 'barranqueras');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const selectedLoc = localidades[selectedId] || locList[0];

  const filteredList = locList.filter((loc) =>
    loc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (loc.cuenca_clave || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // SIN DATO: localidades del interior (pluviales) no tienen estacion de
  // rio propia a proposito - ver main.py, no se inventan niveles/umbrales
  // cuando no hay fuente. Hay que evitar romper el render con esos null.
  const selSinDato =
    selectedLoc.nivel_metros == null || selectedLoc.umbral_alerta == null || selectedLoc.umbral_evacuacion == null;

  // Sistema de 5 niveles (estilo JMA/Japon), igual que en BasinDynamicCards.
  // Si vino de la API real se usa selectedLoc.estado (autoritativo,
  // calculado por el backend); si no, se recalcula igual aca.
  let nivelAlerta: 'NORMAL' | 'MONITOREO' | 'ATENCION' | 'ALERTA' | 'EVACUACION' | 'SIN_DATO' = 'SIN_DATO';
  if (!selSinDato) {
    if (selectedLoc.estado) {
      nivelAlerta = selectedLoc.estado as typeof nivelAlerta;
    } else if (selectedLoc.nivel_metros >= selectedLoc.umbral_evacuacion) {
      nivelAlerta = 'EVACUACION';
    } else if (selectedLoc.nivel_metros >= selectedLoc.umbral_alerta) {
      nivelAlerta = 'ALERTA';
    } else if (selectedLoc.nivel_metros >= selectedLoc.umbral_alerta * 0.9) {
      nivelAlerta = 'ATENCION';
    } else if (selectedLoc.nivel_metros >= selectedLoc.umbral_alerta * 0.7) {
      nivelAlerta = 'MONITOREO';
    } else {
      nivelAlerta = 'NORMAL';
    }
  }
  const isEvac = nivelAlerta === 'EVACUACION';
  const isAlert = nivelAlerta === 'ALERTA';
  const isAtencion = nivelAlerta === 'ATENCION';
  const isMonitoreo = nivelAlerta === 'MONITOREO';
  const pctAlerta = selSinDato
    ? 0
    : Math.min(100, Math.max(8, Math.round((selectedLoc.nivel_metros / selectedLoc.umbral_alerta) * 100)));

  const hasTrendingUp = (selectedLoc.tasa_cambio_m_dia || 0) > 0;
  const hasTrendingDown = (selectedLoc.tasa_cambio_m_dia || 0) < 0;

  // Basin styling helper
  const getBasinColor = (cuencaKey: string | null | undefined) => {
    const key = (cuencaKey || '').toLowerCase();
    if (key.includes('bermejo')) return { badge: 'bg-amber-950/50 text-amber-300 border-amber-800/40', text: 'text-amber-300', dot: 'bg-amber-400' };
    if (key.includes('paraguay')) return { badge: 'bg-indigo-950/50 text-indigo-300 border-indigo-800/40', text: 'text-indigo-300', dot: 'bg-indigo-400' };
    if (key.includes('rio_negro') || key.includes('negro')) return { badge: 'bg-slate-800/50 text-slate-300 border-slate-700/40', text: 'text-slate-300', dot: 'bg-slate-400' };
    return { badge: 'bg-sky-950/50 text-sky-300 border-sky-800/40', text: 'text-sky-300', dot: 'bg-sky-400' };
  };

  const currentBasinStyle = getBasinColor(selectedLoc.cuenca_clave);

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-4">
      {/* Header & Locality Dropdown Selector ("Sopapa") */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/60 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Red Provincial de Monitoreo Urbano e Hidrométrico
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
            Consulta Directa por Localidad
          </h3>
          <p className="text-xs text-slate-400">
            Nivel hidrométrico en tiempo real, lluvia acumulada y alerta para vecinos y personal de emergencias.
          </p>
        </div>

        {/* Locality Dropdown + Search */}
        <div className="flex items-center gap-2 self-start md:self-auto w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full appearance-none bg-slate-950/90 border border-slate-700/80 hover:border-slate-600 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-500 cursor-pointer pr-9 shadow-inner"
              aria-label="Seleccionar localidad del Chaco"
            >
              {locList.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-slate-900 text-slate-100">
                  📍 {loc.nombre} ({(loc.cuenca_clave || 'PLUVIAL').toUpperCase()}) — {loc.nivel_metros == null ? 'sin dato' : `${loc.nivel_metros.toFixed(2)}m`}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Selected Locality Compact Card */}
      <div className="bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/90 border border-slate-800/90 rounded-2xl p-4.5 transition-all shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Left: Location & Clear Status */}
          <div className="lg:col-span-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${currentBasinStyle.badge}`}>
                Cuenca {selectedLoc.cuenca_clave || 'pluvial (sin río asociado)'}
              </span>
              <span className="text-xs text-slate-400">
                Fuente: {selectedLoc.fuente}
              </span>
            </div>

            <h4 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <MapPin className={`w-5 h-5 ${currentBasinStyle.text} shrink-0`} />
              <span>{selectedLoc.nombre}</span>
            </h4>

            {/* Plain language explanation for citizens and firefighters */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs">
              {selSinDato ? (
                <div className="flex items-start gap-2 text-slate-300">
                  <Info className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                  <span>
                    <strong>Sin estación de río:</strong> esta localidad no tiene estación hidrométrica pública en tiempo real. El riesgo acá es por lluvia local, no por crecida de río.
                  </span>
                </div>
              ) : isEvac ? (
                <div className="flex items-start gap-2 text-rose-300 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>
                    <strong>Nivel de Evacuación:</strong> El agua supera el umbral de seguridad ({selectedLoc.umbral_evacuacion}m). Bomberos y cuadrillas en alerta máxima.
                  </span>
                </div>
              ) : isAlert ? (
                <div className="flex items-start gap-2 text-orange-300 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-orange-400 mt-0.5" />
                  <span>
                    <strong>Nivel de Alerta:</strong> Río en cota crítica ({selectedLoc.umbral_alerta}m). Se recomienda preparar pertenencias y seguir avisos.
                  </span>
                </div>
              ) : isAtencion ? (
                <div className="flex items-start gap-2 text-amber-300">
                  <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    <strong>Atención:</strong> río acercándose al umbral de alerta ({hasTrendingUp ? `+${(selectedLoc.tasa_cambio_m_dia! * 100).toFixed(0)} cm/día` : 'ascenso lento'}). Empezar a prepararse.
                  </span>
                </div>
              ) : isMonitoreo ? (
                <div className="flex items-start gap-2 text-sky-300">
                  <Info className="w-4 h-4 shrink-0 text-sky-400 mt-0.5" />
                  <span>
                    <strong>En Monitoreo:</strong> río en ascenso gradual ({hasTrendingUp ? `+${(selectedLoc.tasa_cambio_m_dia! * 100).toFixed(0)} cm/día` : 'estable'}), sin riesgo inminente. Se vigila la tendencia.
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-emerald-300">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>
                    <strong>Condición Normal:</strong> El río se encuentra en niveles seguros, con margen holgado respecto a la alerta ({selectedLoc.umbral_alerta}m).
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Center: Big Level Display & Gauge */}
          <div className="lg:col-span-4 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-medium">Altura actual del río</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-white tracking-tight">
                  {selSinDato ? '—' : selectedLoc.nivel_metros.toFixed(2)}
                </span>
                <span className="text-sm font-mono text-slate-400">m</span>
              </div>
            </div>

            {/* Gauge bar */}
            <div className="space-y-1">
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    selSinDato ? 'bg-slate-600' :
                    isEvac ? 'bg-rose-500' : isAlert ? 'bg-orange-500' : isAtencion ? 'bg-amber-400' : isMonitoreo ? 'bg-sky-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${pctAlerta}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Alerta: {selSinDato ? 'sin dato' : `${selectedLoc.umbral_alerta.toFixed(2)}m`}</span>
                <span>Evacuación: {selSinDato ? 'sin dato' : `${selectedLoc.umbral_evacuacion.toFixed(2)}m`}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                <span>Lluvia 24h: <strong>{selectedLoc.precipitacion_acumulada_mm} mm</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 justify-end">
                {hasTrendingUp ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                ) : hasTrendingDown ? (
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Minus className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>
                  {hasTrendingUp
                    ? `+${(selectedLoc.tasa_cambio_m_dia! * 100).toFixed(0)} cm/d`
                    : hasTrendingDown
                    ? `${(selectedLoc.tasa_cambio_m_dia! * 100).toFixed(0)} cm/d`
                    : 'Estable'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons for Citizens and Firefighters */}
          <div className="lg:col-span-4 flex flex-col justify-center gap-2">
            <button
              onClick={() => onSelectLocalidad(selectedLoc)}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700 cursor-pointer shadow-sm"
            >
              <Info className="w-3.5 h-3.5 text-slate-300" />
              <span>Ver ficha detallada y sectores</span>
            </button>

            {onNavigateToMap && (
              <button
                onClick={() => onNavigateToMap(selectedLoc.lat, selectedLoc.lon)}
                className="w-full py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 border border-slate-800 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Ubicar en visor de mapas SIG</span>
              </button>
            )}

            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>Central de Bomberos: <strong>100</strong></span>
              </span>
              <span>Defensa Civil: <strong>103</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Ultra-compact Quick Tap Strip for All 12 Localities */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Acceso rápido a las 12 localidades del Chaco:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {locList.map((loc) => {
            const isSelected = loc.id === selectedId;
            const isLocAtencion = loc.fase_calculada === 'ATENCION' || loc.id === 'el_sauzalito';
            const basinStyle = getBasinColor(loc.cuenca_clave);

            return (
              <button
                key={loc.id}
                onClick={() => setSelectedId(loc.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-200 text-slate-950 border-white font-bold shadow-sm'
                    : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isLocAtencion ? 'bg-amber-400' : basinStyle.dot
                  }`}
                />
                <span>{loc.nombre}</span>
                <span className="text-[10px] opacity-75 font-mono">
                  {loc.nivel_metros == null ? 'sin dato' : `${loc.nivel_metros.toFixed(2)}m`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
