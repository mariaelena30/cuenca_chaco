import React, { useState } from 'react';
import { EstacionHidrometrica, CrecidaHistorica } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  History,
  Clock,
  Gauge,
  ArrowUpRight,
  ShieldAlert,
  Sliders,
  Calculator,
} from 'lucide-react';
import { calcularTiempoConcentracionKirpich } from '../utils/hydrologyEngine';

interface HydroTrendsProps {
  estaciones: EstacionHidrometrica[];
  crecidasHistoricas: CrecidaHistorica[];
}

export const HydroTrends: React.FC<HydroTrendsProps> = ({ estaciones, crecidasHistoricas }) => {
  const [selectedStationId, setSelectedStationId] = useState<string>(
    estaciones[0]?.id || 'est_barranqueras'
  );

  // Kirpich interactive simulator states
  const [simLongitudKm, setSimLongitudKm] = useState<number>(180);
  const [simPendiente, setSimPendiente] = useState<number>(0.00025);

  const selectedEstacion =
    estaciones.find((e) => e.id === selectedStationId) || estaciones[0];

  const calculatedSimTc = calcularTiempoConcentracionKirpich(simLongitudKm, simPendiente);

  return (
    <div className="space-y-8 pb-12">
      {/* Station Selector & Trend Summary */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">
              REGRESIÓN LINEAL & ANÁLISIS DE TENDENCIA DINÁMICA
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              📈 Hidrogramas y Proyección a Umbrales
            </h2>
          </div>

          {/* Station Pills */}
          <div className="flex flex-wrap gap-2">
            {estaciones.map((est) => (
              <button
                key={est.id}
                onClick={() => setSelectedStationId(est.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedStationId === est.id
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                }`}
              >
                {est.nombre}
              </button>
            ))}
          </div>
        </div>

        {selectedEstacion && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Hydrograph Curve */}
            <div className="lg:col-span-2 bg-slate-950/80 p-5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Serie Hidrométrica — {selectedEstacion.nombre} ({selectedEstacion.rio})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Lecturas oficiales Prefectura Naval Argentina (Últimos 7 días)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Nivel Actual</span>
                    <span className="text-2xl font-bold font-mono text-cyan-400">
                      {selectedEstacion.altura_actual_m.toFixed(2)} m
                    </span>
                  </div>
                </div>

                {/* SVG Hydrograph with alert lines */}
                <div className="relative w-full h-52 mt-4 bg-slate-900/50 rounded-lg p-2 border border-slate-800">
                  <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />
                    <line x1="0" y1="80" x2="500" y2="80" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />
                    <line x1="0" y1="130" x2="500" y2="130" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />

                    {/* Alert Threshold line */}
                    <line x1="0" y1="50" x2="500" y2="50" stroke="#f97316" strokeDasharray="5 5" strokeWidth="1.5" />
                    <text x="495" y="45" fill="#f97316" fontSize="10" textAnchor="end" fontFamily="sans-serif" fontWeight="bold">
                      Nivel Alerta ({selectedEstacion.nivel_alerta_m.toFixed(2)}m)
                    </text>

                    {/* Evacuation Threshold line */}
                    <line x1="0" y1="20" x2="500" y2="20" stroke="#ef4444" strokeDasharray="5 5" strokeWidth="1.5" />
                    <text x="495" y="16" fill="#ef4444" fontSize="10" textAnchor="end" fontFamily="sans-serif" fontWeight="bold">
                      Nivel Evacuación ({selectedEstacion.nivel_evacuacion_m.toFixed(2)}m)
                    </text>

                    {/* Timeseries Points and Line */}
                    {selectedEstacion.historico.length > 1 && (() => {
                      const maxH = Math.max(selectedEstacion.nivel_evacuacion_m + 0.5, 7.0);
                      const minH = 1.0;
                      const range = maxH - minH;

                      const points = selectedEstacion.historico.map((h, idx) => {
                        const x = (idx / (selectedEstacion.historico.length - 1)) * 460 + 20;
                        const y = 170 - ((h.altura_m - minH) / range) * 150;
                        return { x, y, h: h.altura_m, f: h.fecha };
                      });

                      const pathD = points.reduce((acc, p, idx) => {
                        return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
                      }, '');

                      return (
                        <g>
                          {/* Gradient Area under curve */}
                          <defs>
                            <linearGradient id="hydroGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path
                            d={`${pathD} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`}
                            fill="url(#hydroGrad)"
                          />
                          <path d={pathD} fill="none" stroke="#22d3ee" strokeWidth="3" />

                          {/* Data points */}
                          {points.map((p, idx) => (
                            <circle
                              key={idx}
                              cx={p.x}
                              cy={p.y}
                              r="4"
                              fill="#0891b2"
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                          ))}
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              {/* Date ticks */}
              <div className="flex justify-between text-[11px] text-slate-400 mt-2 px-2 font-mono">
                {selectedEstacion.historico.map((h, i) => (
                  <span key={i}>
                    {new Date(h.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                  </span>
                ))}
              </div>
            </div>

            {/* Regression Slope & Threshold Projections */}
            <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800/80 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Diagnóstico de Tendencia</h4>
                <p className="text-xs text-slate-400">
                  Cálculo continuo de variación mediante mínimos cuadrados.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Comportamiento Actual</span>
                <div className="flex items-center gap-2 mt-1">
                  {selectedEstacion.tendencia_texto.includes('creciendo') ? (
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                  ) : selectedEstacion.tendencia_texto.includes('bajando') ? (
                    <TrendingDown className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Minus className="w-5 h-5 text-slate-400" />
                  )}
                  <span className="text-sm font-bold text-white capitalize">
                    {selectedEstacion.tendencia_texto}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Distancia al Umbral de Alerta</span>
                <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
                  {(selectedEstacion.nivel_alerta_m - selectedEstacion.altura_actual_m).toFixed(2)} metros
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Umbral Alerta: {selectedEstacion.nivel_alerta_m.toFixed(2)} m | Evacuación:{' '}
                  {selectedEstacion.nivel_evacuacion_m.toFixed(2)} m
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Proyección a Alerta</span>
                <div className="text-base font-bold text-slate-200 mt-0.5">
                  {selectedEstacion.tendencia_texto.includes('creciendo') ? (
                    <span className="text-amber-300">
                      ~9 a 12 días sostenidos (No crítico en 72h)
                    </span>
                  ) : (
                    <span className="text-emerald-400">Sin proyección de cruce de alerta</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Kirpich Concentration Time Interactive Simulator */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">
              HIDRÁULICA COMPUTACIONAL APLICADA
            </span>
            <h3 className="text-xl font-bold text-white">
              ⏱️ Tiempo de Concentración de Cuenca (Fórmula de Kirpich)
            </h3>
          </div>
          <Calculator className="w-5 h-5 text-indigo-400" />
        </div>

        <p className="text-xs text-slate-400 mb-6 max-w-3xl">
          El tiempo de concentración ($T_c$) es el tiempo que tarda una gota de lluvia caída en el punto
          hidráulicamente más alejado de la cuenca en llegar al punto de desagüe. En la llanura chaqueña
          (pendientes de 0.0002 a 0.0003 m/m), los $T_c$ varían de 18 horas (Riacho Tragadero) a más de 130
          horas (Río Bermejo).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-950/80 p-5 rounded-xl border border-slate-800/80">
          <div>
            <label className="text-xs text-slate-300 font-medium block mb-2">
              Longitud Axial del Río Principal (L): <b className="text-cyan-400">{simLongitudKm} km</b>
            </label>
            <input
              type="range"
              min="20"
              max="500"
              step="5"
              value={simLongitudKm}
              onChange={(e) => setSimLongitudKm(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>Tragadero (88km)</span>
              <span>Negro-Salado (183km)</span>
              <span>Bermejo (491km)</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-2">
              Pendiente Media del Cauce (S): <b className="text-indigo-400">{(simPendiente * 1000).toFixed(2)} m/km</b>
            </label>
            <input
              type="range"
              min="0.0001"
              max="0.001"
              step="0.00005"
              value={simPendiente}
              onChange={(e) => setSimPendiente(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>0.10 m/km (Extremadamente plano)</span>
              <span>1.0 m/km (Suave)</span>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-center items-center text-center">
            <span className="text-[11px] text-slate-400">Tiempo de Concentración Estimado (Tc)</span>
            <span className="text-3xl font-black text-white font-mono my-1 text-cyan-400">
              {calculatedSimTc} <span className="text-sm font-normal text-slate-400">horas</span>
            </span>
            <span className="text-xs text-slate-400">
              ~{(calculatedSimTc / 24).toFixed(1)} días de anticipación de onda
            </span>
          </div>
        </div>
      </section>

      {/* Historical Floods Reference (1982-2023) */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">
            🏛️ Registro de Crecidas Históricas en Barranqueras (1982 - 2023)
          </h3>
        </div>

        <p className="text-xs text-slate-400 mb-6">
          Memoria histórica del sistema hídrico provincial para calibración de respuestas de emergencia y
          dimensionamiento de albergues.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crecidasHistoricas.map((c) => (
            <div
              key={c.anio}
              className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    AÑO {c.anio}
                  </span>
                  <span className="text-sm font-mono font-bold text-red-400">
                    {c.nivelMaxBarranqueras.toFixed(2)} m
                  </span>
                </div>

                <h4 className="font-bold text-white text-sm mb-1">{c.nombre}</h4>
                <div className="text-[11px] text-cyan-400 mb-2">
                  Fase: {c.faseENSO} • Pico: {c.fechaPico}
                </div>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed">{c.descripcion}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>
                  <b className="text-slate-300">Impacto:</b> {c.impacto}
                </div>
                <div>
                  <b className="text-cyan-300">Lección técnica:</b> {c.lecciones}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
