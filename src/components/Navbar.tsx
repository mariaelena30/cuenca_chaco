import React, { useState, useEffect } from 'react';
import { Waves, ShieldAlert, History, Phone, BookOpen, Languages } from 'lucide-react';
import { useIdioma } from '../i18n';

export interface NivelRapido {
  nombre: string;
  valor: number | null;
  nivelAlerta?: number;
  nivelEvacuacion?: number;
}

type Pestana = 'monitoreo' | 'vulnerabilidad' | 'recursos' | 'historico';

interface NavbarProps {
  activeTab: Pestana;
  setActiveTab: (tab: Pestana) => void;
  onOpenAyuda: () => void;
  backendOnline?: boolean;
  ultimaSync?: string;
  niveles?: NivelRapido[];
}

function claseNivel(n: NivelRapido): string {
  if (n.valor === null) return 'text-slate-500';
  if (n.nivelEvacuacion !== undefined && n.valor >= n.nivelEvacuacion) return 'text-red-400';
  if (n.nivelAlerta !== undefined && n.valor >= n.nivelAlerta) return 'text-amber-400';
  return 'text-white';
}

function claseTab(activa: boolean): string {
  return `flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
    activa
      ? 'bg-slate-200 text-slate-950 font-bold shadow-sm'
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
  }`;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAyuda,
  backendOnline = true,
  ultimaSync = '',
  niveles = [],
}) => {
  const { t, idioma, setIdioma, idiomasDisponibles } = useIdioma();
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now
          .toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
          .toUpperCase() +
          ' • ' +
          now.toLocaleTimeString('es-AR', { hour12: false }) +
          ' ART'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md text-slate-100 shadow-md">
      {/* Franja superior */}
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
                {backendOnline
                  ? ultimaSync
                    ? `EN LÍNEA (ÚLT. SYNC ${ultimaSync})`
                    : 'EN LÍNEA'
                  : 'SIN CONEXIÓN - DATOS PUEDEN ESTAR DESACTUALIZADOS'}
              </span>
            </span>
          </div>

          {niveles.length > 0 && (
            <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 border-l border-slate-800 pl-4 font-mono">
              {niveles.map((n, i) => (
                <React.Fragment key={n.nombre}>
                  {i > 0 && <span className="text-slate-600">|</span>}
                  <span>
                    {n.nombre}:{' '}
                    <b className={claseNivel(n)}>
                      {n.valor === null ? 's/d' : `${n.valor.toFixed(2)}m`}
                    </b>
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right hidden sm:block text-slate-400 text-xs font-mono">
            <span>{timeString || 'EN LÍNEA'}</span>
          </div>

          {/* Selector de idioma: aparece solo cuando hay idiomas revisados */}
          {idiomasDisponibles.length > 1 && (
            <div
              role="group"
              aria-label={t('navbar.idioma')}
              className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5"
            >
              <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              {idiomasDisponibles.map((i) => (
                <button
                  key={i.id}
                  onClick={() => setIdioma(i.id)}
                  aria-pressed={idioma === i.id}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                    idioma === i.id
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {i.nombre}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={onOpenAyuda}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs shadow transition-all cursor-pointer uppercase tracking-wider"
            title="Teléfonos de emergencia y qué decir al llamar"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t('navbar.ayuda')}</span>
          </button>
        </div>
      </div>

      {/* Navegación principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 text-slate-200">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
              Portal Hídrico Chaco
            </h1>
            <p className="text-xs text-slate-400">
              Resistencia • Barranqueras • Red Hidrológica Provincial y Alerta Temprana
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          <button onClick={() => setActiveTab('monitoreo')} className={claseTab(activeTab === 'monitoreo')}>
            <Waves className="w-3.5 h-3.5" />
            <span>Monitoreo & Cuencas</span>
          </button>

          <button onClick={() => setActiveTab('vulnerabilidad')} className={claseTab(activeTab === 'vulnerabilidad')}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Zonas Vulnerables</span>
          </button>

          <button onClick={() => setActiveTab('recursos')} className={claseTab(activeTab === 'recursos')}>
            <BookOpen className="w-3.5 h-3.5" />
            <span>Recursos</span>
          </button>

          <button onClick={() => setActiveTab('historico')} className={claseTab(activeTab === 'historico')}>
            <History className="w-3.5 h-3.5" />
            <span>Crecientes Históricas</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
