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
  const [crecidasHistoricas] = useState<CrecidaHistorica[]>(CRECIDAS_HISTORICAS);

  // Modal States
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSITREPModalOpen, setIsSITREPModalOpen] = useState(false);
  const [selectedCuencaForModal, setSelectedCuencaForModal] = useState<Cuenca | null>(null);

  // Trae datos REALES de tu backend
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
    else console.warn('No se pudo traer /cuencas:', resCuencas.reason);

    if (resLocs.status === 'fulfilled') setLocalidades(resLocs.value);
    else console.warn('No se pudo traer /localidades:', resLocs.reason);

    if (resBarrios.status === 'fulfilled') setBarrios(resBarrios.value);
    else console.warn('No se pudo traer /barrios:', resBarrios.reason);

    if (resEstaciones.status === 'fulfilled') setEstaciones(resEstaciones.value);
    else console.warn('No se pudo traer el historico de estaciones:', resEstaciones.reason);

    if (resSOS.status === 'fulfilled') setTicketsSOS(resSOS.value);
    else console.warn('No se pudo traer /sos:', resSOS.reason);

    if (resReps.status === 'fulfilled') setReportes(resReps.value);
    else console.warn('No se pudo traer /reportes:', resReps.reason);
  };

  useEffect(() => {
    refreshData();
    const intervalo = setInterval(refreshData, 60_000);
    return () => clearInterval(intervalo);
  }, []);

  // Handlers for state updates
  const handleCreateSOS = async (ticket: Partial<TicketSOS>) => {
    try {
      const ticketCreado = await crearSOSReal(ticket);
      setTicketsSOS((prev) => [ticketCreado, ...prev]);
    } catch (e) {
      console.warn('Fallback SOS local:', e);
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
      console.warn('Fallback Reporte local:', e);
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

