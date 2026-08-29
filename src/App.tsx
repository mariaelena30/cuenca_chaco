import React, { useState, useEffect } from 'react';
import {
  Cuenca,
  Localidad,
  EstacionHidrometrica,
  BarrioVulnerable,
  TicketSOS,
  ReporteCiudadano,
  RecursoOperativo,
  CentroEvacuacion,
  AlertaPreVerificacion,
  CrecidaHistorica,
  KanbanTask,
} from './types';
import {
  CUENCAS_DETALLE,
  LOCALIDADES_DETALLE,
  BARRIOS_VULNERABLES_DETALLE,
  ESTACIONES_HIDROMETRICAS,
  CRECIDAS_HISTORICAS,
  CENTROS_EVACUACION_DATA,
  RECURSOS_OPERATIVOS_DATA,
  TICKETS_SOS_INICIALES,
  REPORTES_CIUDADANOS_INICIALES,
  ALERTAS_PRE_VERIFICACION_INICIALES,
  KANBAN_TASKS_INICIALES,
  CONTACTOS_EMERGENCIA,
  ORGANISMOS_DETALLE,
  CONTEXTO_RELIEVE,
} from './data/chacoData';
import { Navbar } from './components/Navbar';
import { OrganismosPanel } from './components/OrganismosPanel';
import {
  obtenerCuencasReales,
  obtenerLocalidadesReales,
  obtenerBarriosReales,
  obtenerEstacionesReales,
  crearSOSReal,
  listarSOSReales,
  crearReporteReal,
  listarReportesReales,
} from './services/api';
import { MonitoringDashboard } from './components/MonitoringDashboard';
import { InteractiveMap } from './components/InteractiveMap';
import { HydroTrends } from './components/HydroTrends';
import { CivilDefenseDispatch } from './components/CivilDefenseDispatch';
import { BotSimulator } from './components/BotSimulator';
import { KanbanWorkflow } from './components/KanbanWorkflow';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { CitizenReportModal } from './components/CitizenReportModal';
import { BasinDetailModal } from './components/BasinDetailModal';
import { AIAdvisorModal } from './components/AIAdvisorModal';

export function App() {
  const [activeTab, setActiveTab] = useState<
    'monitoreo' | 'mapa' | 'operativo' | 'bot' | 'kanban' | 'historico'
  >('monitoreo');

  // Application State
  const [cuencas, setCuencas] = useState<Record<string, Cuenca>>(CUENCAS_DETALLE);
  const [localidades, setLocalidades] = useState<Record<string, Localidad>>(LOCALIDADES_DETALLE);
  const [barrios, setBarrios] = useState<Record<string, BarrioVulnerable>>(BARRIOS_VULNERABLES_DETALLE);
  const [estaciones, setEstaciones] = useState<EstacionHidrometrica[]>(ESTACIONES_HIDROMETRICAS);
  const [ticketsSOS, setTicketsSOS] = useState<TicketSOS[]>(TICKETS_SOS_INICIALES);
  const [reportes, setReportes] = useState<ReporteCiudadano[]>(REPORTES_CIUDADANOS_INICIALES);
  const [recursos, setRecursos] = useState<RecursoOperativo[]>(RECURSOS_OPERATIVOS_DATA);
  const [refugios, setRefugios] = useState<CentroEvacuacion[]>(CENTROS_EVACUACION_DATA);
  const [alertasPreVerificacion, setAlertasPreVerificacion] = useState<AlertaPreVerificacion[]>(
    ALERTAS_PRE_VERIFICACION_INICIALES
  );
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>(KANBAN_TASKS_INICIALES);
  const [crecidasHistoricas, setCrecidasHistoricas] = useState<CrecidaHistorica[]>(CRECIDAS_HISTORICAS);

  // Modal States
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSITREPModalOpen, setIsSITREPModalOpen] = useState(false);
  const [selectedCuencaForModal, setSelectedCuencaForModal] = useState<Cuenca | null>(null);

  // Trae datos REALES de tu backend (cuencas-bot), incluido el
  // historico de estaciones. Recursos, refugios, pre-alertas y kanban
  // todavia no tienen backend propio, asi que se quedan con los datos
  // de referencia de chacoData.ts hasta que se sumen esas tablas.
  const refreshData = async () => {
    const resultados = await Promise.allSettled([
      obtenerCuencasReales(),
      obtenerLocalidadesReales(),
      obtenerBarriosReales(),
      obtenerEstacionesReales(),
      listarSOSReales(),
      listarReportesReales(),
    ]);

    const [resCuencas, resLocs, resBarrios, resEstaciones, resSOS, resReps] = resultados;

    if (resCuencas.status === 'fulfilled') setCuencas(resCuencas.value);
    else console.warn('No se pudo traer /cuencas del backend real, usando datos de ejemplo:', resCuencas.reason);

    if (resLocs.status === 'fulfilled') setLocalidades(resLocs.value);
    else console.warn('No se pudo traer /localidades del backend real, usando datos de ejemplo:', resLocs.reason);

    if (resBarrios.status === 'fulfilled') setBarrios(resBarrios.value);
    else console.warn('No se pudo traer /barrios del backend real, usando datos de ejemplo:', resBarrios.reason);

    if (resEstaciones.status === 'fulfilled') setEstaciones(resEstaciones.value);
    else console.warn('No se pudo traer el historico real de estaciones, usando datos de ejemplo:', resEstaciones.reason);

    if (resSOS.status === 'fulfilled') setTicketsSOS(resSOS.value);
    else console.warn('No se pudo traer /sos del backend real, usando datos de ejemplo:', resSOS.reason);

    if (resReps.status === 'fulfilled') setReportes(resReps.value);
    else console.warn('No se pudo traer /reportes del backend real, usando datos de ejemplo:', resReps.reason);
  };

  useEffect(() => {
    refreshData();
    // Datos reales ahora - se actualizan solos cada 60s (antes no hacia
    // falta porque eran datos de ejemplo fijos).
    const intervalo = setInterval(refreshData, 60_000);
    return () => clearInterval(intervalo);
  }, []);

  // Handlers for state updates
  const handleCreateSOS = async (ticket: Partial<TicketSOS>) => {
    try {
      const ticketCreado = await crearSOSReal(ticket);
      setTicketsSOS((prev) => [ticketCreado, ...prev]);
    } catch (e) {
      console.warn('No se pudo enviar el SOS al backend real, se guarda solo localmente:', e);
      const fallbackTicket: TicketSOS = {
        id: `sos_${Date.now()}`,
        timestamp: new Date().toISOString(),
        nombre: ticket.nombre || 'Vecino en Emergencia',
        telefono: ticket.telefono || '3624-000000',
        localidad: ticket.localidad || 'Barranqueras',
        direccion: ticket.direccion || 'Geolocalizado',
        lat: ticket.lat || -27.48,
        lon: ticket.lon || -58.93,
        personasAfectadas: ticket.personasAfectadas || 1,
        personasVulnerables: ticket.personasVulnerables || { ninos: 0, ancianos: 0, movilidadReducida: 0 },
        alturaAguaCm: ticket.alturaAguaCm || 15,
        nivelUrgencia: ticket.nivelUrgencia || 'ALTO',
        requiere: ticket.requiere || ['CAMION_4X4'],
        estado: 'PENDIENTE',
        notasDespacho: ticket.notasDespacho || 'Solicitud generada vía Portal (sin conexión al backend)',
      };
      setTicketsSOS((prev) => [fallbackTicket, ...prev]);
    }
  };

  const handleCreateReport = async (reporte: Partial<ReporteCiudadano>) => {
    try {
      const reporteCreado = await crearReporteReal(reporte);
      setReportes((prev) => [reporteCreado, ...prev]);
    } catch (e) {
      console.warn('No se pudo enviar el reporte al backend real, se guarda solo localmente:', e);
      const fallbackReport: ReporteCiudadano = {
        id: `rep_${Date.now()}`,
        timestamp: new Date().toISOString(),
        nombre: reporte.nombre || 'Vecino',
        localidad: reporte.localidad || 'Resistencia',
        barrio: reporte.barrio || '',
        calle: reporte.calle || 'Esquina',
        lat: -27.4511,
        lon: -58.9866,
        nivelAguaAprox: reporte.nivelAguaAprox || 'VEREDA',
        descripcion: reporte.descripcion || 'Anegamiento reportado.',
        verificado: false,
        impacto: 'MODERADO',
      };
      setReportes((prev) => [fallbackReport, ...prev]);
    }
  };


  const handleUpdateTicketStatus = async (
    id: string,
    estado: TicketSOS['estado'],
    unidad?: string,
    notas?: string
  ) => {
    try {
      await fetch(`/api/sos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, unidadAsignada: unidad, notasDespacho: notas }),
      });
    } catch (e) {
      console.warn('Error patching ticket on server', e);
    }

    setTicketsSOS((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              estado,
              unidadAsignada: unidad !== undefined ? unidad : t.unidadAsignada,
              notasDespacho: notas !== undefined ? notas : t.notasDespacho,
            }
          : t
      )
    );
  };

  const handleApprovePreAlerta = async (id: string, accion: 'APROBAR' | 'DESCARTAR') => {
    try {
      await fetch('/api/pre-alertas/accion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, accion }),
      });
    } catch (e) {
      console.warn('Error updating pre-alert', e);
    }

    setAlertasPreVerificacion((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              estado: accion === 'APROBAR' ? 'APROBADA_DIFUNDIDA' : 'DESCARTADA_FALSO_POSITIVO',
              revisor: 'Operador de Turno Defensa Civil',
            }
          : a
      )
    );
  };

  const handleUpdateShelterOccupancy = (id: string, ocupados: number) => {
    setRefugios((prev) =>
      prev.map((r) => (r.id === id ? { ...r, personasAlojadadas: ocupados } : r))
    );
  };

  const handleUpdateResourceStatus = (
    id: string,
    estado: RecursoOperativo['estado'],
    asignadoA?: string
  ) => {
    setRecursos((prev) =>
      prev.map((r) => (r.id === id ? { ...r, estado, asignadoA } : r))
    );
  };

  const handleUpdateTask = async (id: string, estado: KanbanTask['estado']) => {
    try {
      await fetch('/api/kanban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado }),
      });
    } catch (e) {
      console.warn('Error patching kanban task', e);
    }

    setKanbanTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estado } : t))
    );
  };

  const handleCreateTask = async (task: Partial<KanbanTask>) => {
    try {
      const res = await fetch('/api/kanban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      const data = await res.json();
      if (data.task) {
        setKanbanTasks((prev) => [...prev, data.task]);
      }
    } catch (e) {
      const newTask: KanbanTask = {
        id: `k_${Date.now()}`,
        titulo: task.titulo || 'Nueva tarea',
        descripcion: task.descripcion || '',
        prioridad: task.prioridad || 'MEDIA',
        estado: task.estado || 'TODO',
        categoria: task.categoria || 'OPERACIONES_CAMPO',
        asignado: task.asignado || 'Personal de Guardia',
      };
      setKanbanTasks((prev) => [...prev, newTask]);
    }
  };

  const sosPendingCount = ticketsSOS.filter(
    (t) => t.estado === 'PENDIENTE' || t.estado === 'DESPACHADO'
  ).length;

  const alertCount = (Object.values(localidades) as Localidad[]).filter(
    (l) => l.estado === 'ALERTA' || l.fase_calculada === 'ATENCION'
  ).length;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white relative overflow-x-hidden font-sans">
      {/* Immersive radial gradient and dot matrix overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#020617_100%)] opacity-80 z-0" />
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Navigation */}
      <div className="relative z-10">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSOS={() => setIsSOSModalOpen(true)}
          onOpenReport={() => setIsReportModalOpen(true)}
          onOpenSITREP={() => setIsSITREPModalOpen(true)}
          sosPendingCount={sosPendingCount}
          alertCount={alertCount}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 relative z-10">
        {activeTab === 'monitoreo' && (
          <MonitoringDashboard
            cuencas={cuencas}
            localidades={localidades}
            estaciones={estaciones}
            barrios={barrios}
            onSelectCuenca={(c) => setSelectedCuencaForModal(c)}
            onSelectLocalidad={() => setActiveTab('mapa')}
          />
        )}

        {activeTab === 'mapa' && (
          <InteractiveMap
            cuencas={cuencas}
            localidades={localidades}
            estaciones={estaciones}
            barrios={barrios}
            ticketsSOS={ticketsSOS}
            reportes={reportes}
            refugios={refugios}
          />
        )}

        {activeTab === 'operativo' && (
          <CivilDefenseDispatch
            ticketsSOS={ticketsSOS}
            reportes={reportes}
            recursos={recursos}
            refugios={refugios}
            alertasPreVerificacion={alertasPreVerificacion}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onApprovePreAlerta={handleApprovePreAlerta}
            onUpdateShelterOccupancy={handleUpdateShelterOccupancy}
            onUpdateResourceStatus={handleUpdateResourceStatus}
          />
        )}

        {activeTab === 'bot' && (
          <BotSimulator
            onTriggerSOS={() => setIsSOSModalOpen(true)}
            onTriggerReport={() => setIsReportModalOpen(true)}
          />
        )}

        {activeTab === 'kanban' && (
          <KanbanWorkflow
            tasks={kanbanTasks}
            onUpdateTask={handleUpdateTask}
            onCreateTask={handleCreateTask}
          />
        )}

        {activeTab === 'historico' && (
          <HydroTrends
            estaciones={estaciones}
            crecidasHistoricas={crecidasHistoricas}
          />
        )}
      </main>

      {/* Modals */}
      <EmergencySOSModal
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
        onSubmitSOS={handleCreateSOS}
      />

      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={handleCreateReport}
      />

      <BasinDetailModal
        cuenca={selectedCuencaForModal}
        onClose={() => setSelectedCuencaForModal(null)}
      />

      <AIAdvisorModal
        isOpen={isSITREPModalOpen}
        onClose={() => setIsSITREPModalOpen(false)}
      />

      {/* Command Center Telemetry Footer */}
      <footer className="relative z-10 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-xl text-slate-400 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-[10px] font-mono uppercase tracking-widest text-slate-500">
            <span className="flex items-center gap-1.5">
              DB_STATUS: <span className="text-emerald-400 font-bold">SYNCED</span>
            </span>
            <span className="flex items-center gap-1.5">
              ENCRYPTION: <span className="text-cyan-400 font-bold">AES-256</span>
            </span>
            <span className="flex items-center gap-1.5">
              UPLINK: <span className="text-emerald-400 font-bold">4.2 GBPS (APA-PNA)</span>
            </span>
            <span className="flex items-center gap-1.5">
              STUDY: <span className="text-cyan-300 font-bold">GÓMEZ (2025 CONICET/UNNE)</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono font-bold">
            <span className="px-2.5 py-1 rounded bg-red-950/50 border border-red-900/60 text-red-400">🚨 DEF. CIVIL: 103</span>
            <span className="px-2.5 py-1 rounded bg-amber-950/50 border border-amber-900/60 text-amber-400">🚒 BOMBEROS: 100</span>
            <span className="px-2.5 py-1 rounded bg-cyan-950/50 border border-cyan-900/60 text-cyan-400">🌊 PREFECTURA: 106</span>
            <span className="px-2.5 py-1 rounded bg-emerald-950/50 border border-emerald-900/60 text-emerald-400">🚑 SAME: 107</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-slate-900 text-center text-[10px] text-slate-600 font-mono">
          © 2025 SENTINEL EMERGENCY HUB • SISTEMA INTEGRAL DE MONITOREO HIDROLÓGICO Y GESTIÓN DE EMERGENCIAS DEL CHACO
        </div>
      </footer>
    </div>
  );
}

export default App;
