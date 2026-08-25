import React from 'react';
import { Cuenca } from '../types';
import {
  Waves,
  X,
  Gauge,
  Clock,
  Layers,
  MapPin,
  Info,
  Shield,
  Compass,
} from 'lucide-react';

interface BasinDetailModalProps {
  cuenca: Cuenca | null;
  onClose: () => void;
}

export const BasinDetailModal: React.FC<BasinDetailModalProps> = ({ cuenca, onClose }) => {
  if (!cuenca) return null;

  const { parametros_forma: pf } = cuenca;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg"
              style={{ backgroundColor: cuenca.color_hex }}
            >
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">
                ESTUDIO HIDROLÓGICO PROVINCIAL • APA CHACO
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">{cuenca.nombre_oficial}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level and Threshold Gauge */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Estación de Referencia</span>
              <span className="text-sm font-bold text-white">{cuenca.estacion_referencia}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Nivel Actual</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">
                {cuenca.nivel_actual_m.toFixed(2)} m
              </span>
            </div>
          </div>

          <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-900 font-mono">
            <span>Umbral Alerta Oficial: <b className="text-amber-400">{cuenca.umbral_alerta.toFixed(2)} m</b></span>
            <span>Umbral Evacuación: <b className="text-red-400">{cuenca.umbral_evacuacion.toFixed(2)} m</b></span>
          </div>
        </div>

        {/* Morphometric Parameters Grid */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span>Parámetros Morfométricos de Forma</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">ÁREA CUENCA</span>
              <span className="text-base font-bold text-white font-mono">
                {pf.area_km2.toLocaleString()} <span className="text-xs font-normal">km²</span>
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">PERÍMETRO</span>
              <span className="text-base font-bold text-white font-mono">
                {pf.perimetro_km.toLocaleString()} <span className="text-xs font-normal">km</span>
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">LONG. AXIAL</span>
              <span className="text-base font-bold text-white font-mono">
                {pf.longitud_axial_km} <span className="text-xs font-normal">km</span>
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">ANCHO PROMEDIO</span>
              <span className="text-base font-bold text-white font-mono">
                {pf.ancho_promedio_km} <span className="text-xs font-normal">km</span>
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">GRAVELIUS (Kc)</span>
              <span className="text-base font-bold text-cyan-300 font-mono">
                {pf.coef_compacidad_gravelius}
              </span>
              <span className="text-[9px] text-slate-500 block">&gt;1.75 = muy alargada</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">FACTOR HORTON (Kf)</span>
              <span className="text-base font-bold text-indigo-300 font-mono">
                {pf.factor_forma_horton}
              </span>
              <span className="text-[9px] text-slate-500 block">&lt;0.20 = baja torrencialidad</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">CIRC. MILLER (Rc)</span>
              <span className="text-base font-bold text-purple-300 font-mono">
                {pf.radio_circularidad_miller}
              </span>
              <span className="text-[9px] text-slate-500 block">&lt;0.5 = asimétrica</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">TIEMPO CONC. (Tc)</span>
              <span className="text-base font-bold text-amber-300 font-mono">
                ~{pf.tiempo_concentracion_horas_min || 48}h
              </span>
              <span className="text-[9px] text-slate-500 block">según Kirpich</span>
            </div>
          </div>
        </div>

        {/* Hydrological Behavior Analysis */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Comportamiento Hidrológico e Impacto en Inundaciones</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {cuenca.comportamiento_hidrologico}
          </p>
        </div>

        {/* Subcuencas y Sistemas Tributarios Interiores */}
        {cuenca.subcuencas_tributarias && cuenca.subcuencas_tributarias.length > 0 && (
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Subcuencas y Sistemas Fluviales Tributarios</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {cuenca.subcuencas_tributarias.map((sub, idx) => (
                <div key={idx} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-cyan-300">{sub.nombre}</span>
                    {sub.area_km2 && (
                      <span className="text-[10px] font-mono text-slate-400 font-medium">
                        {sub.area_km2.toLocaleString()} km²
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed mb-1">{sub.descripcion}</p>
                  {sub.caracteristicas && (
                    <span className="text-[10px] text-slate-400 font-mono block bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
                      {sub.caracteristicas}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tributaries and Departments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block font-bold mb-1">Afluentes Principales:</span>
            <div className="flex flex-wrap gap-1.5">
              {cuenca.afluentes.map((a, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[11px]">
                  {a}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block font-bold mb-1">Departamentos Atravesados:</span>
            <div className="flex flex-wrap gap-1.5">
              {cuenca.departamentos.map((d, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[11px]">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
