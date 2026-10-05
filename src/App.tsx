import React, { useState, useEffect } from 'react';
import {
  Cuenca,
  Localidad,
  EstacionHidrometrica,
  BarrioVulnerable,
  CrecidaHistorica,
} from './types';
import {
  CUENCAS_DETALLE,
  LOCALIDADES_DETALLE,
  BARRIOS_VULNERABLES_DETALLE,
  ESTACIONES_HIDROMETRICAS,
  CRECIDAS_HISTORICAS,
} from './data/chacoData';
import { BARRIOS_BARRANQUERAS, BARRIOS_VILELAS } from './data/barriosVulnerables';
import { Navbar, NivelRapido } from './components/Navbar';
import {
  obtenerCuencasReales,
  obtenerLocalidadesReales,
  obtenerBarriosReales,
  obtenerAlertasSMN,
  EstadoAlertasSMN,
} from './services/api';
import { construirEstacionesVivas, estacionesIniciales } from './services/estaciones';
import { MonitoringDashboard } from './components/MonitoringDashboard';
import { RecursosComunidad } from './components/RecursosComunidad';
import { HydroTrends } from './components/HydroTrends';
import { BasinDetailModal } from './components/BasinDetailModal';
import { AyudaEmergencia } from './components/AyudaEmergencia';
import MapasVulnerabilidad from './components/MapasVulnerabilidad';
import { IdiomaProvider, useIdioma } from './i18n';

// Barrios RENABAP (Barranqueras + Vilelas) fusionados con los que ya
// tenias en chacoData.ts. Esto es lo que se ve apenas carga la app.
const BARRIOS_INICIALES: Record<string, BarrioVulnerable> = {
  ...BARRIOS_VULNERABLES_DETALLE,
  ...BARRIOS_BARRANQUERAS,
  ...BARRIOS_VILELAS,
};

function nombreLocalidadPluvial(clave: string): string {
  return clave.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function AppContenido() {
  const { t } = useIdioma();

  const [activeTab, setActiveTab] = useState<
    'monitoreo' | 'vulnerabilidad' | 'recursos' | 'historico'
  >('monitoreo');

  // Estado de la aplicación
  const [cuencas, setCuencas] = useState<Record<string, Cuenca>>(CUENCAS_DETALLE);
  const [localidades, setLocalidades] = useState<Record<string, Localidad>>(LOCALIDADES_DETALLE);
  const [barrios, setBarrios] = useState<Record<string, BarrioVulnerable>>(BARRIOS_INICIALES);
  const [estaciones, setEstaciones] = useState<EstacionHidrometrica[]>(() => estacionesIniciales());
  const [crecidasHistoricas] = useState<CrecidaHistorica[]>(CRECIDAS_HISTORICAS);
  const [alertasSMN, setAlertasSMN] = useState<EstadoAlertasSMN>({
    alertas: [],
    cantidad: 0,
    ultima_verificacion: null,
  });

  // Estado real de la conexión con el backend
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [ultimaSync, setUltimaSync] = useState<string>('');

  // Ventanas
  const [ayudaAbierta, setAyudaAbierta] = useState(false);
  const [selectedCuencaForModal, setSelectedCuencaForModal] = useState<Cuenca | null>(null);

  const refreshData = async () => {
    const resultados = await Promise.allSettled([
      obtenerCuencasReales(),
      obtenerLocalidadesReales(),
      obtenerBarriosReales(),
      obtenerAlertasSMN(),
      construirEstacionesVivas(ESTACIONES_HIDROMETRICAS),
    ]);

    const [resCuencas, resLocs, resBarrios, resAlertas, resEstaciones] = resultados;

    const hayBackend = resCuencas.status === 'fulfilled' || resLocs.status === 'fulfilled';
    setBackendOnline(hayBackend);
    if (hayBackend) {
      setUltimaSync(
        new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      );
    }

    if (resCuencas.status === 'fulfilled') setCuencas(resCuencas.value);
    else console.warn('No se pudo traer /cuencas:', resCuencas.reason);

    if (resLocs.status === 'fulfilled') setLocalidades(resLocs.value);
    else console.warn('No se pudo traer /localidades:', resLocs.reason);

    if (resBarrios.status === 'fulfilled') {
      setBarrios({ ...resBarrios.value, ...BARRIOS_BARRANQUERAS, ...BARRIOS_VILELAS });
    } else {
      console.warn('No se pudo traer /barrios:', resBarrios.reason);
    }

    if (resAlertas.status === 'fulfilled') setAlertasSMN(resAlertas.value);
    else console.warn('No se pudo traer /alertas:', resAlertas.reason);

    if (resEstaciones.status === 'fulfilled') setEstaciones(resEstaciones.value);
    else console.warn('No se pudieron armar las estaciones:', resEstaciones.reason);
  };

  useEffect(() => {
    refreshData();
    const intervalo = setInterval(refreshData, 60_000);
    return () => clearInterval(intervalo);
  }, []);

  // Niveles de la barra superior: salen de las estaciones. Si la última
  // lectura tiene más de 48 h, se muestra "s/d" en lugar de un dato viejo.
  const nivelesRapidos: NivelRapido[] = estaciones.map((est) => {
    const ultima = est.historico.length > 0 ? est.historico[est.historico.length - 1].fecha : null;
    const horas = ultima ? (Date.now() - new Date(ultima).getTime()) / 3600000 : Infinity;
    return {
      nombre: est.nombre.split('(')[0].trim(),
      valor: horas <= 48 ? est.altura_actual_m : null,
      nivelAlerta: est.nivel_alerta_m,
      nivelEvacuacion: est.nivel_evacuacion_m,
    };
  });

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white relative overflow-x-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#020617_100%)] opacity-80 z-0" />
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAyuda={() => setAyudaAbierta(true)}
          backendOnline={backendOnline}
          ultimaSync={ultimaSync}
          niveles={nivelesRapidos}
        />
      </div>

      {alertasSMN.alertas.length > 0 && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          {alertasSMN.alertas.map((alerta) => {
            const afectadas = alerta.localidades_pluviales_afectadas;
            const sufijo =
              afectadas.length > 0 ? ' — ' + afectadas.map(nombreLocalidadPluvial).join(', ') : '';
            return (
              <div
                key={alerta.id}
                className="mb-2 rounded-lg border border-amber-700/60 bg-amber-950/40 px-4 py-3 text-amber-200 text-sm"
              >
                <span className="font-bold uppercase tracking-wide mr-2">
                  ⚠ Aviso SMN{sufijo}:
                </span>
                {alerta.titulo || alerta.descripcion}
              </div>
            );
          })}
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 relative z-10">
        {activeTab === 'monitoreo' && (
          <MonitoringDashboard
            cuencas={cuencas}
            localidades={localidades}
            estaciones={estaciones}
            barrios={barrios}
            onSelectCuenca={(c) => setSelectedCuencaForModal(c)}
            onSelectLocalidad={() => setActiveTab('vulnerabilidad')}
          />
        )}

        {activeTab === 'vulnerabilidad' && (
          <MapasVulnerabilidad
            cuencas={cuencas}
            localidades={localidades}
            estaciones={estaciones}
            barrios={barrios}
            ticketsSOS={[]}
            reportes={[]}
          />
        )}

        {activeTab === 'recursos' && <RecursosComunidad localidades={localidades} />}

        {activeTab === 'historico' && (
          <HydroTrends estaciones={estaciones} crecidasHistoricas={crecidasHistoricas} />
        )}
      </main>

      <AyudaEmergencia isOpen={ayudaAbierta} onClose={() => setAyudaAbierta(false)} />
      <BasinDetailModal
        cuenca={selectedCuencaForModal}
        onClose={() => setSelectedCuencaForModal(null)}
      />

      <footer className="relative z-10 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-xl text-slate-400 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-[10px] font-mono uppercase tracking-widest text-slate-500">
            <span className="flex items-center gap-1.5">
              BACKEND:{' '}
              <span
                className={
                  backendOnline ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'
                }
              >
                {backendOnline ? 'CONECTADO' : 'SIN CONEXIÓN'}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              ÚLTIMA SYNC: <span className="text-cyan-400 font-bold">{ultimaSync || '--:--'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              STUDY: <span className="text-cyan-300 font-bold">GÓMEZ (2025 CONICET/UNNE)</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono font-bold">
            <span className="px-2.5 py-1 rounded bg-red-950/50 border border-red-900/60 text-red-400">DEF. CIVIL: 103</span>
            <span className="px-2.5 py-1 rounded bg-amber-950/50 border border-amber-900/60 text-amber-400">BOMBEROS: 100</span>
            <span className="px-2.5 py-1 rounded bg-cyan-950/50 border border-cyan-900/60 text-cyan-400">PREFECTURA: 106</span>
            <span className="px-2.5 py-1 rounded bg-emerald-950/50 border border-emerald-900/60 text-emerald-400">SAME: 107</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-slate-900 text-center text-[11px] text-slate-400">
          {t('pie.info')}
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <IdiomaProvider>
      <AppContenido />
    </IdiomaProvider>
  );
}

export default App;
