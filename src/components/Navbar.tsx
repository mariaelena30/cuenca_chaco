import React, { useState, useEffect } from 'react';
import {
  Waves,
  ShieldAlert,
  History,
  AlertTriangle,
  Activity,
  PlusCircle,
  Compass,
  PhoneCall,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'monitoreo' | 'mapa' | 'operativo' | 'historico';
  setActiveTab: (tab: 'monitoreo' | 'mapa' | 'operativo' | 'historico') => void;
  onOpenSOS: () => void;
  onOpenReport: () => void;
  onOpenSITREP: () => void;
  onOpenTelefonos?: () => void;
  onOpenScanner?: () => void;
  sosPendingCount: number;
  alertCount: number;
  backendOnline?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSOS,
  onOpenReport,
  onOpenSITREP,
  onOpenTelefonos,
  onOpenScanner,
  sosPendingCount,
  alertCount,
  backendOnline = true,
}) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleDateString('es-AR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).toUpperCase() + ' • ' + now.toLocaleTimeString('es-AR', { hour12: false }) + ' ART'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md text-slate-100 shadow-md">
      {/* Top institutional strip */}
      <div className="bg-slate-950 px-4 sm:px-8 py-2 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-[11px] uppercase tracking-wider text-slate-300 font-medium">
              BACKEND & TELEMETRÍA:{' '}
              <span className={backendOnline ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {backendOnline ? 'EN LÍNEA (SYNC 100%)' : 'RECONECTANDO'}
              </span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 border-l border-slate-800 pl-4 font-mono">
            <span>Barranqueras: <b className="text-white">3.22m</b></span>
            <span className="text-slate-600">|</span>
            <span>Resistencia: <b className="text-sky-300">2.45m</b></span>
            <span className="text-slate-600">|</span>
            <span>El Sauzalito: <b className="text-amber-400">3.10m</b></span>
            <span className="text-slate-600">|</span>
            <span>Puerto Bermejo: <b className="text-white">2.75m</b></span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right hidden sm:block text-slate-400 text-xs font-mono">
            <span>{timeString || 'EN LÍNEA'}</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenScanner && (
              <button
                onClick={onOpenScanner}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900/90 text-rose-200 border border-rose-800/60 transition-colors text-xs font-bold cursor-pointer"
                title="Abrir Escáner y Testeo de Vulnerabilidad Hídrica"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Escáner de Riesgo</span>
                <span className="sm:hidden">Escáner</span>
              </button>
            )}

            {onOpenTelefonos && (
              <button
                onClick={onOpenTelefonos}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-950/70 hover:bg-sky-900/90 text-sky-200 border border-sky-800/60 transition-colors text-xs font-bold cursor-pointer"
                title="Ver teléfonos útiles de Defensa Civil, Bomberos de Barranqueras, Prefectura y Emergencias"
              >
                <PhoneCall className="w-3.5 h-3.5 text-sky-300" />
                <span className="hidden sm:inline">Teléfonos Útiles</span>
                <span className="sm:hidden">Teléfonos</span>
              </button>
            )}

            <button
              onClick={onOpenSITREP}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-xs font-medium cursor-pointer"
              title="Generar informe SITREP oficial con Inteligencia Artificial"
            >
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>Informe SITREP</span>
            </button>

            <button
              onClick={onOpenReport}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-xs font-medium cursor-pointer"
              title="Reportar anegamiento o problema en boca de tormenta"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Reportar Anegamiento</span>
              <span className="md:hidden">Reportar</span>
            </button>

            <button
              onClick={onOpenSOS}
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs shadow transition-all cursor-pointer uppercase tracking-wider"
              title="Línea de emergencia directa con Bomberos (100) y Defensa Civil (103)"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>PEDIR AYUDA SOS</span>
              {sosPendingCount > 0 && (
                <span className="bg-white text-rose-800 text-[10px] px-1.5 py-0.2 rounded-full font-black ml-1">
                  {sosPendingCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 text-slate-200">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Portal Hídrico Chaco
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/80 uppercase tracking-wider">
                BOMBEROS VOLUNTARIOS BARRANQUERAS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Resistencia • Barranqueras • Red Hidrológica Provincial y Alerta Temprana
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('monitoreo')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'monitoreo'
                ? 'bg-slate-200 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Monitoreo & Cuencas</span>
          </button>

          <button
            onClick={() => setActiveTab('mapa')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'mapa'
                ? 'bg-slate-200 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Mapa SIG & Riesgo</span>
          </button>

          <button
            onClick={() => setActiveTab('operativo')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'operativo'
                ? 'bg-slate-200 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Centro Operativo</span>
            {sosPendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('historico')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'historico'
                ? 'bg-slate-200 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Crecientes Históricas</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
