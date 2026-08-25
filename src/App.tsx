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
  EstacionBombeo,
  MensajeDifusion,
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
  ESTACIONES_BOMBEO_DATA,
  MENSAJES_DIFUSION_INICIALES,
} from './data/chacoData';
import {
  initializeDatabaseSeed,
  subscribeToTicketsSOS,
  subscribeToReportes,
  subscribeToRecursos,
  subscribeToRefugios,
  subscribeToAlertas,
  subscribeToKanban,
  subscribeToEstaciones,
  subscribeToLocalidades,
  saveTicketSOS,
  deleteTicketInDB,
  updateTicketStatusInDB,
  saveReporteCiudadano,
  updateShelterOccupancyInDB,
  updateResourceStatusInDB,
  updatePreAlertaStatusInDB,
  saveKanbanTaskInDB,
  updateKanbanTaskStatusInDB,
} from './lib/realtimeService';
import { Navbar } from './components/Navbar';
import { AlertaTempranaVertederos } from './components/AlertaTempranaVertederos';
import {
  obtenerCuencasReales,
  obtenerLocalidadesReales,
  obtenerBarriosReales,
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
import { LocalidadDetailModal } from './components/LocalidadDetailModal';
import { AIAdvisorModal } from './components/AIAdvisorModal';
import { EmergencyContactsModal } from './components/EmergencyContactsModal';
import { VulnerabilityScannerModal } from './components/VulnerabilityScannerModal';

export function App() {
  const [activeTab, setActiveTab] = useState<
    'monitoreo' | 'mapa' | 'operativo' | 'historico'
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
  const [estacionesBombeo, setEstacionesBombeo] = useState<EstacionBombeo[]>(ESTACIONES_BOMBEO_DATA);
  const [mensajesDifusion, setMensajesDifusion] = useState<MensajeDifusion[]>(MENSAJES_DIFUSION_INICIALES);

  // Modal States
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSITREPModalOpen, setIsSITREPModalOpen] = useState(false);
  const [isTelefonosModalOpen, setIsTelefonosModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedCuencaForModal, setSelectedCuencaForModal] = useState<Cuenca | null>(null);
  const [selectedLocalidadForModal, setSelectedLocalidadForModal] = useState<Localidad | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);

  // Hydrate all data from Backend REST API and set up real-time Firebase subscriptions
  useEffect(() => {
    // 1. Initial REST Hydration from Backend
    const hydrateFromBackend = async () => {
      try {
        const [
          resResumen,
          resCuencasReal,
          resLocsReal,
          resBarriosReal,
          resEsts,
          resSos,
          resReps,
          resRecs,
          resRefs,
          resAlerts,
          resTasks,
        ] = await Promise.allSettled([
          fetch('/api/resumen').then((r) => r.json()),
          obtenerCuencasReales(),
          obtenerLocalidadesReales(),
          obtenerBarriosReales(),
          fetch('/api/estaciones').then((r) => r.json()),
          fetch('/api/sos').then((r) => r.json()),
          fetch('/api/reportes').then((r) => r.json()),
          fetch('/api/recursos').then((r) => r.json()),
          fetch('/api/refugios').then((r) => r.json()),
          fetch('/api/pre-alertas').then((r) => r.json()),
          fetch('/api/kanban').then((r) => r.json()),
        ]);

        // obtenerCuencasReales/obtenerLocalidadesReales/obtenerBarriosReales
        // ya devuelven un Record<string, T> armado (no un array para mapear
        // como las rutas /api/* viejas), asi que se usan directo.
        if (resCuencasReal.status === 'fulfilled') {
          setCuencas(resCuencasReal.value);
        } else {
          console.warn('No se pudo traer /cuencas del backend real, usando datos de ejemplo:', resCuencasReal.reason);
        }

        if (resLocsReal.status === 'fulfilled') {
          setLocalidades(resLocsReal.value);
        } else {
          console.warn('No se pudo traer /localidades del backend real, usando datos de ejemplo:', resLocsReal.reason);
        }

        if (resBarriosReal.status === 'fulfilled') {
          setBarrios(resBarriosReal.value);
        } else {
          console.warn('No se pudo traer /barrios del backend real, usando datos de ejemplo:', resBarriosReal.reason);
        }

        if (resEsts.status === 'fulfilled' && resEsts.value?.estaciones) {
          setEstaciones(resEsts.value.estaciones);
        }

        if (resSos.status === 'fulfilled' && resSos.value?.tickets) {
          setTicketsSOS(resSos.value.tickets);
        }

        if (resReps.status === 'fulfilled' && resReps.value?.reportes) {
          setReportes(resReps.value.reportes);
        }

        if (resRecs.status === 'fulfilled' && resRecs.value?.recursos) {
          setRecursos(resRecs.value.recursos);
        }

        if (resRefs.status === 'fulfilled' && resRefs.value?.refugios) {
          setRefugios(resRefs.value.refugios);
        }

        if (resAlerts.status === 'fulfilled' && resAlerts.value?.alertas) {
          setAlertasPreVerificacion(resAlerts.value.alertas);
        }

        if (resTasks.status === 'fulfilled' && resTasks.value?.tasks) {
          setKanbanTasks(resTasks.value.tasks);
        }

        setBackendOnline(true);
      } catch (err) {
        console.warn('Backend hydration notice:', err);
      }
    };

    hydrateFromBackend();

    // Periodic health check with backend
    const healthInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) setBackendOnline(true);
        else setBackendOnline(false);
      } catch {
        setBackendOnline(false);
      }
    }, 15000);

    // 2. Real-time Firebase Database Synchronization
    initializeDatabaseSeed();

    const unsubSOS = subscribeToTicketsSOS((tickets) => {
      if (tickets.length > 0) setTicketsSOS(tickets);
    });

    const unsubReps = subscribeToReportes((reps) => {
      if (reps.length > 0) setReportes(reps);
    });

    const unsubRecs = subscribeToRecursos((recs) => {
      if (recs.length > 0) setRecursos(recs);
    });

    const unsubRefs = subscribeToRefugios((refs) => {
      if (refs.length > 0) setRefugios(refs);
    });

    const unsubAlerts = subscribeToAlertas((alerts) => {
      if (alerts.length > 0) setAlertasPreVerificacion(alerts);
    });

    const unsubTasks = subscribeToKanban((tasks) => {
      if (tasks.length > 0) setKanbanTasks(tasks);
    });

    const unsubEsts = subscribeToEstaciones((ests) => {
      if (ests.length > 0) setEstaciones(ests);
    });

    const unsubLocs = subscribeToLocalidades((locMap) => {
      if (Object.keys(locMap).length > 0) setLocalidades(locMap);
    });

    return () => {
      clearInterval(healthInterval);
      unsubSOS();
      unsubReps();
      unsubRecs();
      unsubRefs();
      unsubAlerts();
      unsubTasks();
      unsubEsts();
      unsubLocs();
    };
  }, []);

  // Handlers for state updates with real-time sync
  const handleCreateSOS = async (ticket: Partial<TicketSOS>) => {
    const newTicket: TicketSOS = {
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
      notasDespacho: ticket.notasDespacho || 'Solicitud generada vía Portal',
    };

    setTicketsSOS((prev) => [newTicket, ...prev]);

    try {
      await saveTicketSOS(newTicket);
      await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      });
    } catch (e) {
      console.warn('Sync notice:', e);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    setTicketsSOS((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTicketInDB(id);
      await fetch(`/api/sos/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Sync delete notice:', e);
    }
  };

  const handleCreateReport = async (reporte: Partial<ReporteCiudadano>) => {
    const newReport: ReporteCiudadano = {
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

    setReportes((prev) => [newReport, ...prev]);

    try {
      await saveReporteCiudadano(newReport);
      await fetch('/api/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport),
      });
    } catch (e) {
      console.warn('Sync notice:', e);
    }
  };

  const handleUpdateTicketStatus = async (
    id: string,
    estado: TicketSOS['estado'],
    unidad?: string,
    notas?: string
  ) => {
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

    try {
      await updateTicketStatusInDB(id, estado, unidad, notas);
      await fetch(`/api/sos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, unidadAsignada: unidad, notasDespacho: notas }),
      });
    } catch (e) {
      console.warn('Sync notice:', e);
    }
  };

  const handleApprovePreAlerta = async (id: string, accion: 'APROBAR' | 'DESCARTAR') => {
    const nuevoEstado = accion === 'APROBAR' ? 'APROBADA_DIFUNDIDA' : 'DESCARTADA_FALSO_POSITIVO';
    const revisor = 'Operador de Turno Defensa Civil 103';

    setAlertasPreVerificacion((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              estado: nuevoEstado,
              revisor,
            }
          : a
      )
    );

    try {
      await updatePreAlertaStatusInDB(id, nuevoEstado, revisor);
      await fetch('/api/pre-alertas/accion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, accion }),
      });
    } catch (e) {
      console.warn('Sync notice:', e);
    }
  };

  const handleUpdateShelterOccupancy = async (id: string, ocupados: number) => {
    setRefugios((prev) =>
      prev.map((r) => (r.id === id ? { ...r, personasAlojadadas: ocupados } : r))
    );
    try {
      await updateShelterOccupancyInDB(id, ocupados);
    } catch (e) {
      console.warn('Sync notice:', e);
    }
  };

  const handleUpdateResourceStatus = async (
    id: string,
    estado: RecursoOperativo['estado'],
    asignadoA?: string
  ) => {
    setRecursos((prev) =>
      prev.map((r) => (r.id === id ? { ...r, estado, asignadoA } : r))
    );
    try {
      await updateResourceStatusInDB(id, estado, asignadoA);
    } catch (e) {
      console.warn('Sync notice:', e);
    }
  };

  const handleUpdateTask = async (id: string, estado: KanbanTask['estado']) => {
    setKanbanTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estado } : t))
    );
    try {
      await updateKanbanTaskStatusInDB(id, estado);
      await fetch('/api/kanban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado }),
      });
    } catch (e) {
      console.warn('Sync notice:', e);
    }
  };

  const handleCreateTask = async (task: Partial<KanbanTask>) => {
    const newTask: KanbanTask = {
      id: `k_${Date.now()}`,
      titulo: task.titulo || 'Nueva tarea operativa',
      descripcion: task.descripcion || '',
      prioridad: task.prioridad || 'MEDIA',
      estado: task.estado || 'TODO',
      categoria: task.categoria || 'OPERACIONES_CAMPO',
      asignado: task.asignado || 'Personal de Guardia',
      fechaLimite: task.fechaLimite || '2026-08-23',
    };

    setKanbanTasks((prev) => [...prev, newTask]);
    try {
      await saveKanbanTaskInDB(newTask);
      await fetch('/api/kanban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
    } catch (e) {
      console.warn('Sync notice:', e);
    }
  };

  const handleUpdatePumpingStation = (id: string, bombasActivas: number, compuerta: EstacionBombeo['estado_compuerta']) => {
    setEstacionesBombeo((prev) =>
      prev.map((eb) =>
        eb.id === id
          ? { ...eb, bombas_activas: bombasActivas, estado_compuerta: compuerta, ultima_inspeccion: 'Ahora (Operador)' }
          : eb
      )
    );
  };

  const handleSendBroadcastMessage = (mensaje: Partial<MensajeDifusion>) => {
    const newMsg: MensajeDifusion = {
      id: `msg_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' ART',
      tipo: mensaje.tipo || 'ALERTA_TEMPRANA',
      canal: mensaje.canal || 'SMS_RURAL',
      destinatarios_segmento: mensaje.destinatarios_segmento || 'Población General',
      destinatarios_conteo: mensaje.destinatarios_conteo || 1000,
      mensaje: mensaje.mensaje || '',
      autor: mensaje.autor || 'Defensa Civil Chaco',
      estado: 'ENVIADO',
    };
    setMensajesDifusion((prev) => [newMsg, ...prev]);
  };

  const sosPendingCount = ticketsSOS.filter(
    (t) => t.estado === 'PENDIENTE' || t.estado === 'DESPACHADO'
  ).length;

  const alertCount = (Object.values(localidades) as Localidad[]).filter(
    (l) => l.estado === 'ALERTA' || l.fase_calculada === 'ATENCION'
  ).length;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white relative overflow-x-hidden font-sans">
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
          onOpenTelefonos={() => setIsTelefonosModalOpen(true)}
          onOpenScanner={() => setIsScannerOpen(true)}
          sosPendingCount={sosPendingCount}
          alertCount={alertCount}
          backendOnline={backendOnline}
        />
      </div>

      {/* Alerta temprana: vertederos Itaipú/Yacyretá + Nota Técnica ENSO */}
      <div className="relative z-10">
        <AlertaTempranaVertederos />
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
            onSelectLocalidad={(loc) => setSelectedLocalidadForModal(loc)}
            onNavigateToMap={() => setActiveTab('mapa')}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenSOS={() => setIsSOSModalOpen(true)}
            onOpenReport={() => setIsReportModalOpen(true)}
            onOpenTelefonos={() => setIsTelefonosModalOpen(true)}
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
          />
        )}

        {activeTab === 'operativo' && (
          <CivilDefenseDispatch
            ticketsSOS={ticketsSOS}
            reportes={reportes}
            alertasPreVerificacion={alertasPreVerificacion}
            mensajesDifusion={mensajesDifusion}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onDeleteTicket={handleDeleteTicket}
            onAddLocalTicket={handleCreateSOS}
            onApprovePreAlerta={handleApprovePreAlerta}
            onSendBroadcastMessage={handleSendBroadcastMessage}
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
        onSwitchToSOS={() => setIsSOSModalOpen(true)}
      />

      <BasinDetailModal
        cuenca={selectedCuencaForModal}
        onClose={() => setSelectedCuencaForModal(null)}
      />

      <LocalidadDetailModal
        localidad={selectedLocalidadForModal}
        cuenca={selectedLocalidadForModal ? cuencas[selectedLocalidadForModal.cuenca_clave] : undefined}
        barrios={barrios}
        onClose={() => setSelectedLocalidadForModal(null)}
      />

      <AIAdvisorModal
        isOpen={isSITREPModalOpen}
        onClose={() => setIsSITREPModalOpen(false)}
      />

      <EmergencyContactsModal
        isOpen={isTelefonosModalOpen}
        onClose={() => setIsTelefonosModalOpen(false)}
      />

      <VulnerabilityScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        barrios={barrios}
        localidades={localidades}
        estaciones={estaciones}
        onNavigateToMap={() => {
          setIsScannerOpen(false);
          setActiveTab('mapa');
        }}
      />

      {/* Institutional Footer */}
      <footer className="relative z-10 bg-slate-950 border-t border-slate-800 text-slate-400 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h4 className="text-sm font-bold text-white tracking-wide">
                Portal Hídrico Chaco • Resistencia & Barranqueras
              </h4>
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/80 text-[10px] font-bold">
                Bomberos Voluntarios Barranqueras
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Desarrollado y coordinado por <strong className="text-slate-200 font-semibold">Bombera María Elena Álvarez</strong> • Red de alerta temprana y monitoreo hidrológico en tiempo real
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setIsTelefonosModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-rose-400 cursor-pointer transition-colors"
            >
              Defensa Civil: 103
            </button>
            <button
              onClick={() => setIsTelefonosModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 cursor-pointer transition-colors"
            >
              Bomberos Barranqueras: 100 / 4485555
            </button>
            <button
              onClick={() => setIsTelefonosModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-400 cursor-pointer transition-colors"
            >
              Prefectura Barranqueras: 106
            </button>
            <button
              onClick={() => setIsTelefonosModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 cursor-pointer transition-colors"
            >
              Emergencias Médicas: 107
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>© 2025 Portal Hídrico Chaco • Bombera María Elena Álvarez.</span>
          <span>Resistencia • Barranqueras • Provincia del Chaco, Argentina.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
