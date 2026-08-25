import React from 'react';
import { Localidad, BarrioVulnerable, Cuenca } from '../types';
import {
  X,
  MapPin,
  Droplets,
  CloudRain,
  Shield,
  Phone,
  AlertTriangle,
  Clock,
  Waves,
  Building,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

interface LocalidadDetailModalProps {
  localidad: Localidad | null;
  cuenca?: Cuenca;
  barrios: Record<string, BarrioVulnerable>;
  onClose: () => void;
}

export const LocalidadDetailModal: React.FC<LocalidadDetailModalProps> = ({
  localidad,
  cuenca,
  barrios,
  onClose,
}) => {
  if (!localidad) return null;

  const pct = Math.min(100, Math.round((localidad.nivel_metros / localidad.umbral_alerta) * 100));
  const isAlert = localidad.nivel_metros >= localidad.umbral_alerta;
  const isEvac = localidad.nivel_metros >= localidad.umbral_evacuacion;
  const isAtencion = localidad.fase_calculada === 'ATENCION' || localidad.id === 'el_sauzalito';

  let statusBg = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  let statusText = 'NIVEL NORMAL';
  let barBg = 'bg-emerald-500';

  if (isEvac) {
    statusBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
    statusText = 'ESTADO DE EVACUACIÓN';
    barBg = 'bg-rose-500';
  } else if (isAlert) {
    statusBg = 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    statusText = 'ESTADO DE ALERTA OFICIAL';
    barBg = 'bg-orange-500';
  } else if (isAtencion) {
    statusBg = 'bg-amber-500/20 text-amber-300 border-amber-500/35';
    statusText = 'FASE DE SEGUIMIENTO PREVENTIVO';
    barBg = 'bg-amber-500';
  }

  const associatedBarrios = (localidad.barrios_vulnerables_ids || [])
    .map((id) => barrios[id])
    .filter(Boolean);

  const hasTrendingUp = (localidad.tasa_cambio_m_dia || 0) > 0;
  const hasTrendingDown = (localidad.tasa_cambio_m_dia || 0) < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {localidad.nombre}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border tracking-wide ${statusBg}`}>
                  {statusText}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cuenca: <span className="text-slate-200 font-medium">{localidad.cuenca_clave.toUpperCase()}</span> • Fuente: {localidad.fuente}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Hydrometric Measurement Box */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Lectura Hidrométrica de Referencia
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-white">
                  {localidad.nivel_metros.toFixed(2)}
                </span>
                <span className="text-sm font-mono text-slate-400">metros</span>
                <span className="text-xs text-slate-500 font-mono">
                  (Ref: {localidad.estacion_hidrometrica_asociada || localidad.nombre})
                </span>
              </div>
            </div>

            {/* Gauge Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barBg}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>0.00 m</span>
                <span className="text-amber-400 font-semibold">Alerta: {localidad.umbral_alerta.toFixed(2)} m</span>
                <span className="text-rose-400 font-semibold">Evacuación: {localidad.umbral_evacuacion.toFixed(2)} m</span>
              </div>
            </div>
          </div>

          {/* Meteorological & Hydrological Dynamics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Precipitación 24h</span>
              <div className="flex items-center gap-1.5 font-bold font-mono text-blue-400 text-lg">
                <CloudRain className="w-4 h-4 shrink-0" />
                <span>{localidad.precipitacion_acumulada_mm} mm</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Acumulado 72h</span>
              <div className="flex items-center gap-1.5 font-bold font-mono text-blue-300 text-lg">
                <Droplets className="w-4 h-4 shrink-0" />
                <span>{localidad.precipitacion_72h_mm || 45} mm</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Variación 24h</span>
              <div className="flex items-center gap-1.5 font-bold font-mono text-lg">
                {hasTrendingUp ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +{((localidad.tasa_cambio_m_dia || 0) * 100).toFixed(0)} cm
                  </span>
                ) : hasTrendingDown ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    {((localidad.tasa_cambio_m_dia || 0) * 100).toFixed(0)} cm
                  </span>
                ) : (
                  <span className="text-slate-300 flex items-center gap-1">
                    <Minus className="w-4 h-4" />
                    Estable
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Último Reporte</span>
              <div className="flex items-center gap-1 font-semibold text-slate-300 text-xs mt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{localidad.ultima_verificacion.split(' ')[1] || '07:45 UTC'}</span>
              </div>
            </div>
          </div>

          {/* Associated Vulnerable Sectors in this Municipality */}
          {associatedBarrios.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-rose-400" />
                  <span>Sectores Críticos Identificados ({associatedBarrios.length})</span>
                </h4>
                <span className="text-xs text-slate-400">Relevamiento Territorial</span>
              </div>

              <div className="space-y-2">
                {associatedBarrios.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-200">{b.nombre}</span>
                      <span className="text-rose-400 font-mono text-[11px]">GPS: {b.lat.toFixed(3)}, {b.lon.toFixed(3)}</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      {b.motivo}
                    </p>
                    <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-900 space-y-0.5">
                      <div><b className="text-slate-400 font-medium">Ubicación:</b> {b.direccion_referencia || 'En ribera / valle'}</div>
                      <div><b className="text-rose-400 font-medium">Vía crítica:</b> {b.via_acceso_critica || 'Terrestre'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Institutional Emergency Assistance Numbers */}
          <div className="bg-blue-950/30 border border-blue-900/50 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Líneas Oficiales de Emergencia en Chaco
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Defensa Civil</span>
                <span className="font-bold text-rose-400 text-sm">103</span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Bomberos</span>
                <span className="font-bold text-amber-400 text-sm">100</span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Prefectura</span>
                <span className="font-bold text-cyan-400 text-sm">106</span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Emergencias Médicas</span>
                <span className="font-bold text-emerald-400 text-sm">107</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Cerrar Informe
          </button>
        </div>
      </div>
    </div>
  );
};
