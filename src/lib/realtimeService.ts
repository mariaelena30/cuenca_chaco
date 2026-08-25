import {
  db,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDocs,
  deleteDoc,
} from './firebase';
import {
  TicketSOS,
  ReporteCiudadano,
  RecursoOperativo,
  CentroEvacuacion,
  AlertaPreVerificacion,
  KanbanTask,
  EstacionHidrometrica,
  Localidad,
} from '../types';
import {
  TICKETS_SOS_INICIALES,
  REPORTES_CIUDADANOS_INICIALES,
  RECURSOS_OPERATIVOS_DATA,
  CENTROS_EVACUACION_DATA,
  ALERTAS_PRE_VERIFICACION_INICIALES,
  KANBAN_TASKS_INICIALES,
  ESTACIONES_HIDROMETRICAS,
  LOCALIDADES_DETALLE,
} from '../data/chacoData';

// Helper to seed initial collections if empty
export async function initializeDatabaseSeed() {
  try {
    const sosSnap = await getDocs(collection(db, 'tickets_sos'));
    if (sosSnap.empty) {
      for (const t of TICKETS_SOS_INICIALES) {
        await setDoc(doc(db, 'tickets_sos', t.id), t);
      }
    }

    const repSnap = await getDocs(collection(db, 'reportes_ciudadanos'));
    if (repSnap.empty) {
      for (const r of REPORTES_CIUDADANOS_INICIALES) {
        await setDoc(doc(db, 'reportes_ciudadanos', r.id), r);
      }
    }

    const recSnap = await getDocs(collection(db, 'recursos_operativos'));
    if (recSnap.empty) {
      for (const rec of RECURSOS_OPERATIVOS_DATA) {
        await setDoc(doc(db, 'recursos_operativos', rec.id), rec);
      }
    }

    const refSnap = await getDocs(collection(db, 'centros_evacuacion'));
    if (refSnap.empty) {
      for (const ref of CENTROS_EVACUACION_DATA) {
        await setDoc(doc(db, 'centros_evacuacion', ref.id), ref);
      }
    }

    const alertSnap = await getDocs(collection(db, 'alertas_preverificacion'));
    if (alertSnap.empty) {
      for (const a of ALERTAS_PRE_VERIFICACION_INICIALES) {
        await setDoc(doc(db, 'alertas_preverificacion', a.id), a);
      }
    }

    const taskSnap = await getDocs(collection(db, 'kanban_tasks'));
    if (taskSnap.empty) {
      for (const k of KANBAN_TASKS_INICIALES) {
        await setDoc(doc(db, 'kanban_tasks', k.id), k);
      }
    }

    const estSnap = await getDocs(collection(db, 'estaciones_hidrometricas'));
    if (estSnap.empty) {
      for (const e of ESTACIONES_HIDROMETRICAS) {
        await setDoc(doc(db, 'estaciones_hidrometricas', e.id), e);
      }
    }

    const locSnap = await getDocs(collection(db, 'localidades_monitoreo'));
    if (locSnap.empty) {
      for (const loc of Object.values(LOCALIDADES_DETALLE)) {
        await setDoc(doc(db, 'localidades_monitoreo', loc.id), loc);
      }
    }
  } catch (err) {
    console.warn('Error inicializando seed de base de datos:', err);
  }
}

// Subscriptions
export function subscribeToTicketsSOS(callback: (tickets: TicketSOS[]) => void) {
  return onSnapshot(
    collection(db, 'tickets_sos'),
    (snapshot) => {
      const tickets: TicketSOS[] = [];
      snapshot.forEach((doc) => {
        tickets.push({ ...doc.data(), id: doc.id } as TicketSOS);
      });
      // Sort newest first
      tickets.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(tickets);
    },
    (err) => console.warn('Error en subscripción tickets_sos:', err)
  );
}

export function subscribeToReportes(callback: (reportes: ReporteCiudadano[]) => void) {
  return onSnapshot(
    collection(db, 'reportes_ciudadanos'),
    (snapshot) => {
      const reps: ReporteCiudadano[] = [];
      snapshot.forEach((doc) => {
        reps.push({ ...doc.data(), id: doc.id } as ReporteCiudadano);
      });
      reps.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(reps);
    },
    (err) => console.warn('Error en subscripción reportes_ciudadanos:', err)
  );
}

export function subscribeToRecursos(callback: (recursos: RecursoOperativo[]) => void) {
  return onSnapshot(
    collection(db, 'recursos_operativos'),
    (snapshot) => {
      const recs: RecursoOperativo[] = [];
      snapshot.forEach((doc) => {
        recs.push({ ...doc.data(), id: doc.id } as RecursoOperativo);
      });
      callback(recs);
    },
    (err) => console.warn('Error en subscripción recursos_operativos:', err)
  );
}

export function subscribeToRefugios(callback: (refugios: CentroEvacuacion[]) => void) {
  return onSnapshot(
    collection(db, 'centros_evacuacion'),
    (snapshot) => {
      const refs: CentroEvacuacion[] = [];
      snapshot.forEach((doc) => {
        refs.push({ ...doc.data(), id: doc.id } as CentroEvacuacion);
      });
      callback(refs);
    },
    (err) => console.warn('Error en subscripción centros_evacuacion:', err)
  );
}

export function subscribeToAlertas(callback: (alertas: AlertaPreVerificacion[]) => void) {
  return onSnapshot(
    collection(db, 'alertas_preverificacion'),
    (snapshot) => {
      const alertas: AlertaPreVerificacion[] = [];
      snapshot.forEach((doc) => {
        alertas.push({ ...doc.data(), id: doc.id } as AlertaPreVerificacion);
      });
      alertas.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(alertas);
    },
    (err) => console.warn('Error en subscripción alertas_preverificacion:', err)
  );
}

export function subscribeToKanban(callback: (tasks: KanbanTask[]) => void) {
  return onSnapshot(
    collection(db, 'kanban_tasks'),
    (snapshot) => {
      const tasks: KanbanTask[] = [];
      snapshot.forEach((doc) => {
        tasks.push({ ...doc.data(), id: doc.id } as KanbanTask);
      });
      callback(tasks);
    },
    (err) => console.warn('Error en subscripción kanban_tasks:', err)
  );
}

export function subscribeToEstaciones(callback: (estaciones: EstacionHidrometrica[]) => void) {
  return onSnapshot(
    collection(db, 'estaciones_hidrometricas'),
    (snapshot) => {
      const ests: EstacionHidrometrica[] = [];
      snapshot.forEach((doc) => {
        ests.push({ ...doc.data(), id: doc.id } as EstacionHidrometrica);
      });
      callback(ests);
    },
    (err) => console.warn('Error en subscripción estaciones_hidrometricas:', err)
  );
}

export function subscribeToLocalidades(callback: (locs: Record<string, Localidad>) => void) {
  return onSnapshot(
    collection(db, 'localidades_monitoreo'),
    (snapshot) => {
      const lMap: Record<string, Localidad> = {};
      snapshot.forEach((doc) => {
        const l = { ...doc.data(), id: doc.id } as Localidad;
        lMap[l.id] = l;
      });
      callback(lMap);
    },
    (err) => console.warn('Error en subscripción localidades_monitoreo:', err)
  );
}

// Database Mutations
export async function saveTicketSOS(ticket: TicketSOS) {
  await setDoc(doc(db, 'tickets_sos', ticket.id), ticket);
}

export async function deleteTicketInDB(id: string) {
  try {
    await deleteDoc(doc(db, 'tickets_sos', id));
  } catch (err) {
    console.warn('Error eliminando ticket en DB:', err);
  }
}

export async function deleteReporteInDB(id: string) {
  try {
    await deleteDoc(doc(db, 'reportes_ciudadanos', id));
  } catch (err) {
    console.warn('Error eliminando reporte en DB:', err);
  }
}

export async function updateTicketStatusInDB(
  id: string,
  estado: TicketSOS['estado'],
  unidadAsignada?: string,
  notasDespacho?: string
) {
  const dataToUpdate: Partial<TicketSOS> = { estado };
  if (unidadAsignada !== undefined) dataToUpdate.unidadAsignada = unidadAsignada;
  if (notasDespacho !== undefined) dataToUpdate.notasDespacho = notasDespacho;
  await updateDoc(doc(db, 'tickets_sos', id), dataToUpdate);
}

export async function saveReporteCiudadano(reporte: ReporteCiudadano) {
  await setDoc(doc(db, 'reportes_ciudadanos', reporte.id), reporte);
}

export async function updateShelterOccupancyInDB(id: string, personasAlojadadas: number) {
  await updateDoc(doc(db, 'centros_evacuacion', id), { personasAlojadadas });
}

export async function updateResourceStatusInDB(
  id: string,
  estado: RecursoOperativo['estado'],
  asignadoA?: string
) {
  const updateData: Partial<RecursoOperativo> = { estado };
  if (asignadoA !== undefined) updateData.asignadoA = asignadoA;
  await updateDoc(doc(db, 'recursos_operativos', id), updateData);
}

export async function updatePreAlertaStatusInDB(
  id: string,
  estado: AlertaPreVerificacion['estado'],
  revisor?: string
) {
  await updateDoc(doc(db, 'alertas_preverificacion', id), { estado, revisor });
}

export async function saveKanbanTaskInDB(task: KanbanTask) {
  await setDoc(doc(db, 'kanban_tasks', task.id), task);
}

export async function updateKanbanTaskStatusInDB(id: string, estado: KanbanTask['estado']) {
  await updateDoc(doc(db, 'kanban_tasks', id), { estado });
}

export async function updateEstacionAlturaInDB(id: string, nuevaAltura: number) {
  await updateDoc(doc(db, 'estaciones_hidrometricas', id), {
    altura_actual_m: nuevaAltura,
    timestamp_consulta: new Date().toISOString(),
  });
}
