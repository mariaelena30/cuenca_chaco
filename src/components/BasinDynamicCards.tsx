import React, { useState } from 'react';
import { Cuenca } from '../types';
import {
  Layers,
  Clock,
  Gauge,
  ChevronDown,
  ChevronUp,
  Activity,
  ArrowRight,
  Shield,
  Droplets,
} from 'lucide-react';

interface BasinDynamicCardsProps {
  cuencas: Record<string, Cuenca>;
  onSelectCuenca: (cuenca: Cuenca) => void;
}

export const BasinDynamicCards: React.FC<BasinDynamicCardsProps> = ({
  cuencas,
  onSelectCuenca,
}) => {
  const [selectedCuencaTab, setSelectedCuencaTab] = useState<string>('todas');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const basinList = Object.values(cuencas) as Cuenca[];

  const filteredBasins = basinList.filter((c) => {
    if (selectedCuencaTab === 'todas') return true;
    return c.id === selectedCuencaTab;
  });

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  return (
    <div className="space-y-3.5">
      {/* Header & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">
              SISTEMA HIDROLÓGICO PROVINCIAL
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/80 text-slate-400 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">
              RED DE CUENCAS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-400">
              Telemetría en Vivo
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Las 4 Cuencas Hidrográficas del Chaco
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Monitoreo hidrométrico oficial en tiempo real, caracterización morfométrica multivariable y estado de alerta de ríos y riachos.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 text-xs self-start lg:self-center shrink-0">
          <button
            onClick={() => setSelectedCuencaTab('todas')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              selectedCuencaTab === 'todas'
                ? 'bg-slate-200 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas (4)
          </button>
          <button
            onClick={() => setSelectedCuencaTab('parana')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCuencaTab === 'parana'
                ? 'bg-sky-950/80 text-sky-200 border border-sky-700/60 font-bold shadow-sm'
                : 'text-slate-400 hover:text-sky-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Río Paraná</span>
          </button>
          <button
            onClick={() => setSelectedCuencaTab('bermejo')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCuencaTab === 'bermejo'
                ? 'bg-amber-950/80 text-amber-200 border border-amber-700/60 font-bold shadow-sm'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Río Bermejo</span>
          </button>
          <button
            onClick={() => setSelectedCuencaTab('paraguay')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCuencaTab === 'paraguay'
                ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-700/60 font-bold shadow-sm'
                : 'text-slate-400 hover:text-indigo-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Río Paraguay</span>
          </button>
          <button
            onClick={() => setSelectedCuencaTab('rio_negro')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCuencaTab === 'rio_negro'
                ? 'bg-slate-700/80 text-slate-200 border border-slate-600/60 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Río Negro</span>
          </button>
        </div>
      </div>

      {/* Dynamic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {filteredBasins.map((c) => {
          const isExpanded = expandedCardId === c.id;

          // SIN DATO: cuencas como el Rio Negro no tienen estacion de
          // medicion publica en tiempo real (a proposito - ver main.py,
          // no se inventan niveles/umbrales cuando no hay fuente).
          const sinDato = c.nivel_actual_m == null || c.umbral_alerta == null || c.umbral_evacuacion == null;

          // Sistema de 5 niveles (estilo JMA/Japon) calculado por el
          // backend en calcular_estado() - si vino de la API real se usa
          // ese estado; si no (fallback local sin conexion), se
          // recalcula igual aca para no dejar la tarjeta sin color.
          let nivelAlerta: 'NORMAL' | 'MONITOREO' | 'ATENCION' | 'ALERTA' | 'EVACUACION' | 'SIN_DATO' = 'SIN_DATO';
          if (!sinDato) {
            if (c.estado) {
              nivelAlerta = c.estado as typeof nivelAlerta;
            } else if (c.nivel_actual_m >= c.umbral_evacuacion) {
              nivelAlerta = 'EVACUACION';
            } else if (c.nivel_actual_m >= c.umbral_alerta) {
              nivelAlerta = 'ALERTA';
            } else if (c.nivel_actual_m >= c.umbral_alerta * 0.9) {
              nivelAlerta = 'ATENCION';
            } else if (c.nivel_actual_m >= c.umbral_alerta * 0.7) {
              nivelAlerta = 'MONITOREO';
            } else {
              nivelAlerta = 'NORMAL';
            }
          }
          const isEvac = nivelAlerta === 'EVACUACION';
          const isAlert = nivelAlerta === 'ALERTA';
          const isAtencion = nivelAlerta === 'ATENCION';
          const isMonitoreo = nivelAlerta === 'MONITOREO';
          const pct = sinDato ? 0 : Math.min(100, Math.round((c.nivel_actual_m / c.umbral_alerta) * 100));

          // Basin-specific thematic accents (refined, subtle, elegant colors)
          let basinTheme = {
            cardBg: 'from-sky-950/20 via-slate-900/80 to-slate-950/90',
            borderColor: 'border-sky-900/40 hover:border-sky-700/60',
            dotColor: 'bg-sky-400',
            badgeBg: 'bg-sky-950/50 text-sky-300 border-sky-800/40',
            barColor: 'from-sky-600 to-sky-400',
            textColor: 'text-sky-300',
          };

          if (c.id === 'bermejo') {
            basinTheme = {
              cardBg: 'from-amber-950/25 via-slate-900/80 to-slate-950/90',
              borderColor: 'border-amber-900/40 hover:border-amber-700/60',
              dotColor: 'bg-amber-400',
              badgeBg: 'bg-amber-950/50 text-amber-300 border-amber-800/40',
              barColor: 'from-amber-600 to-amber-400',
              textColor: 'text-amber-300',
            };
          } else if (c.id === 'paraguay') {
            basinTheme = {
              cardBg: 'from-indigo-950/25 via-slate-900/80 to-slate-950/90',
              borderColor: 'border-indigo-900/40 hover:border-indigo-700/60',
              dotColor: 'bg-indigo-400',
              badgeBg: 'bg-indigo-950/50 text-indigo-300 border-indigo-800/40',
              barColor: 'from-indigo-600 to-indigo-400',
              textColor: 'text-indigo-300',
            };
          } else if (c.id === 'rio_negro') {
            basinTheme = {
              cardBg: 'from-slate-800/25 via-slate-900/80 to-slate-950/90',
              borderColor: 'border-slate-700/40 hover:border-slate-600/60',
              dotColor: 'bg-slate-400',
              badgeBg: 'bg-slate-800/50 text-slate-300 border-slate-700/40',
              barColor: 'from-slate-600 to-slate-400',
              textColor: 'text-slate-300',
            };
          }

          let statusBadge = 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40';
          let statusText = 'NORMAL';

          if (sinDato) {
            statusBadge = 'bg-slate-800/60 text-slate-400 border-slate-700/60';
            statusText = 'SIN DATO';
          } else if (isEvac) {
            statusBadge = 'bg-rose-950/50 text-rose-300 border-rose-800/50';
            statusText = 'EVACUACIÓN';
          } else if (isAlert) {
            statusBadge = 'bg-orange-950/50 text-orange-300 border-orange-800/50';
            statusText = 'ALERTA';
          } else if (isAtencion) {
            statusBadge = 'bg-amber-950/50 text-amber-300 border-amber-800/50';
            statusText = 'ATENCIÓN';
          } else if (isMonitoreo) {
            statusBadge = 'bg-sky-950/40 text-sky-300 border-sky-800/40';
            statusText = 'MONITOREO (+15cm/d)';
          }

          return (
            <div
              key={c.id}
              className={`bg-gradient-to-b ${basinTheme.cardBg} border ${basinTheme.borderColor} rounded-2xl p-4.5 transition-all duration-200 shadow-sm flex flex-col justify-between group ${
                isExpanded ? 'lg:col-span-2 shadow-md' : ''
              }`}
            >
              <div>
                {/* Top Type Tag & Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${basinTheme.dotColor}`} />
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${basinTheme.badgeBg}`}>
                      {c.tipo}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${statusBadge}`}>
                    {statusText}
                  </span>
                </div>

                {/* Basin Title */}
                <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-slate-100 transition-colors flex items-center justify-between">
                  <span>{c.nombre}</span>
                </h4>
                <p className="text-xs text-slate-400 mb-3 line-clamp-1">
                  Colector: <span className="text-slate-300">{c.colector_principal}</span> • Ref: {c.estacion_referencia}
                </p>

                {/* Hydrometric Level Display */}
                <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 mb-3">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xs text-slate-400 font-medium">Nivel en hidrómetro</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-mono text-white">
                        {sinDato ? '—' : c.nivel_actual_m.toFixed(2)}
                      </span>
                      <span className="text-xs font-mono text-slate-400">m</span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-1.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${basinTheme.barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Alerta: {sinDato ? 'sin dato' : `${c.umbral_alerta.toFixed(2)}m`}</span>
                    <span>Evac: {sinDato ? 'sin dato' : `${c.umbral_evacuacion.toFixed(2)}m`}</span>
                  </div>
                </div>

                {/* Morphometric Highlights Bar */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block leading-tight">Tiempo Concentr.</span>
                      <span className="font-semibold text-slate-200">
                        ~{c.parametros_forma.tiempo_concentracion_horas_min || 48}h
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-2">
                    <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block leading-tight">Índice Gravelius</span>
                      <span className="font-semibold text-slate-200">
                        Kc {c.parametros_forma.coef_compacidad_gravelius.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 space-y-2.5 text-xs">
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className={`w-3.5 h-3.5 ${basinTheme.textColor}`} />
                        Comportamiento Hidrológico e Impacto
                      </div>
                      <p className="text-slate-300 leading-relaxed text-xs">
                        {c.comportamiento_hidrologico}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Área Cuenca</span>
                        <span className="font-bold font-mono text-white">{c.parametros_forma.area_km2.toLocaleString()} km²</span>
                      </div>
                      <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Perímetro</span>
                        <span className="font-bold font-mono text-white">{c.parametros_forma.perimetro_km.toLocaleString()} km</span>
                      </div>
                      <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Factor Horton</span>
                        <span className="font-bold font-mono text-white">{c.parametros_forma.factor_forma_horton}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Fuente</span>
                        <span className="font-semibold text-slate-300 text-[11px] truncate block">{c.fuente.split('/')[0]}</span>
                      </div>
                    </div>

                    {c.subcuencas_tributarias && c.subcuencas_tributarias.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider block">
                          Subcuencas y Sistemas Tributarios Interiores:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {c.subcuencas_tributarias.map((sub, idx) => (
                            <div key={idx} className="p-2 rounded bg-slate-950/80 border border-slate-800 text-[11px]">
                              <div className="font-semibold text-slate-200">{sub.nombre}</div>
                              <p className="text-slate-400 text-[10px] mt-0.5">{sub.descripcion}</p>
                              {sub.caracteristicas && (
                                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{sub.caracteristicas}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">Departamentos: </span>
                      {c.departamentos.join(', ')}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-1">
                <button
                  onClick={(e) => toggleExpand(c.id, e)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      <span>Menos detalles</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Detalles morfométricos</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <button
                  onClick={() => onSelectCuenca(c)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Ficha Técnica</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
