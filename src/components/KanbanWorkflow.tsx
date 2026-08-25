import React, { useState } from 'react';
import { KanbanTask } from '../types';
import {
  Kanban,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Filter,
} from 'lucide-react';

interface KanbanWorkflowProps {
  tasks: KanbanTask[];
  onUpdateTask: (id: string, estado: KanbanTask['estado']) => void;
  onCreateTask: (task: Partial<KanbanTask>) => void;
}

export const KanbanWorkflow: React.FC<KanbanWorkflowProps> = ({
  tasks,
  onUpdateTask,
  onCreateTask,
}) => {
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('TODAS');

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<KanbanTask['prioridad']>('MEDIA');
  const [newCategory, setNewCategory] = useState<KanbanTask['categoria']>('OPERACIONES_CAMPO');
  const [newAssignee, setNewAssignee] = useState('Personal de Guardia');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateTask({
      titulo: newTitle,
      descripcion: newDescription,
      prioridad: newPriority,
      categoria: newCategory,
      asignado: newAssignee,
      estado: 'TODO',
    });

    setNewTitle('');
    setNewDescription('');
    setShowNewTaskModal(false);
  };

  const columns: { id: KanbanTask['estado']; title: string; color: string; badge: string }[] = [
    { id: 'TODO', title: 'POR HACER (BACKLOG)', color: 'border-slate-700', badge: 'bg-slate-800 text-slate-300' },
    { id: 'IN_PROGRESS', title: 'EN EJECUCIÓN', color: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-300' },
    { id: 'TESTING', title: 'EN PRUEBA / VALIDACIÓN', color: 'border-indigo-500/40', badge: 'bg-indigo-500/20 text-indigo-300' },
    { id: 'DONE', title: 'COMPLETADO', color: 'border-emerald-500/40', badge: 'bg-emerald-500/20 text-emerald-300' },
  ];

  const filteredTasks = tasks.filter(
    (t) => filterCategory === 'TODAS' || t.categoria === filterCategory
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">
            GESTIÓN DE FLUJO OPERATIVO & ROADMAP TÉCNICO
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Tablero Kanban de Operaciones y Mejoras
          </h2>
          <p className="text-xs text-slate-400">
            Seguimiento de tareas de terreno de Defensa Civil / APA y mejoras técnicas de integración
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="TODAS">Todas las categorías</option>
            <option value="OPERACIONES_CAMPO">Operaciones de Campo</option>
            <option value="SISTEMAS_BOT">Sistemas & Bot</option>
            <option value="HIDROLOGIA">Hidrología & SIG</option>
            <option value="DEFENSA_CIVIL">Defensa Civil</option>
            <option value="COMUNICACION">Comunicación</option>
          </select>

          <button
            onClick={() => setShowNewTaskModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-cyan-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Tarea</span>
          </button>
        </div>
      </div>

      {/* 4 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.estado === col.id);

          return (
            <div
              key={col.id}
              className={`bg-slate-900/70 border ${col.color} rounded-2xl p-4 flex flex-col min-h-[500px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200">{col.title}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${col.badge}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colTasks.map((task) => {
                  let priorityBadge = 'bg-slate-800 text-slate-400';
                  if (task.prioridad === 'ALTA') priorityBadge = 'bg-red-500/20 text-red-400 border border-red-500/30';
                  else if (task.prioridad === 'MEDIA') priorityBadge = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';

                  return (
                    <div
                      key={task.id}
                      className="bg-slate-950/90 border border-slate-800/90 hover:border-slate-700 p-3.5 rounded-xl shadow space-y-2.5 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                          {task.categoria.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${priorityBadge}`}>
                          {task.prioridad}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white leading-snug">{task.titulo}</h4>

                      {task.descripcion && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {task.descripcion}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-900">
                        <div className="flex items-center gap-1 text-slate-300">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>{task.asignado}</span>
                        </div>

                        {/* Move state triggers */}
                        <div className="flex items-center gap-1">
                          {col.id !== 'TODO' && (
                            <button
                              onClick={() => {
                                const prevCol: Record<KanbanTask['estado'], KanbanTask['estado']> = {
                                  TODO: 'TODO',
                                  IN_PROGRESS: 'TODO',
                                  TESTING: 'IN_PROGRESS',
                                  DONE: 'TESTING',
                                };
                                onUpdateTask(task.id, prevCol[col.id]);
                              }}
                              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Mover a columna anterior"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}

                          {col.id !== 'DONE' && (
                            <button
                              onClick={() => {
                                const nextCol: Record<KanbanTask['estado'], KanbanTask['estado']> = {
                                  TODO: 'IN_PROGRESS',
                                  IN_PROGRESS: 'TESTING',
                                  TESTING: 'DONE',
                                  DONE: 'DONE',
                                };
                                onUpdateTask(task.id, nextCol[col.id]);
                              }}
                              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Mover a siguiente columna"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Dialog Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Nueva Tarea Operativa / Roadmap</h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Título de la Tarea</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Calibración de sensor en Dique Río Negro"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Descripción / Alcance</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre insumos, responsables y resultado esperado..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Prioridad</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ALTA">Alta (Crítica)</option>
                    <option value="MEDIA">Media</option>
                    <option value="BAJA">Baja</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="OPERACIONES_CAMPO">Operaciones Campo</option>
                    <option value="SISTEMAS_BOT">Sistemas & Bot</option>
                    <option value="HIDROLOGIA">Hidrología & SIG</option>
                    <option value="DEFENSA_CIVIL">Defensa Civil</option>
                    <option value="COMUNICACION">Comunicación</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Responsable Asignado</label>
                <input
                  type="text"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-750 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
