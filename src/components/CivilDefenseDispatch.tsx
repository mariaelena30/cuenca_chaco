import React, { useState, useEffect } from 'react';
import {
  TicketSOS,
  ReporteCiudadano,
  AlertaPreVerificacion,
  EstacionBombeo,
  MensajeDifusion,
} from '../types';
import {
  ShieldAlert,
  Radio,
  Truck,
  CheckCircle,
  AlertOctagon,
  PhoneCall,
  Send,
  Check,
  X,
  RefreshCw,
  MessageSquare,
  Gauge,
  Signal,
  SignalZero,
  MapPin,
  Trash2,
  Phone,
  PlusCircle,
  Copy,
  FileText,
  Wifi,
  WifiOff,
  UserCheck,
  HelpCircle,
} from 'lucide-react';
import { CONTACTOS_EMERGENCIA } from '../data/chacoData';

interface CivilDefenseDispatchProps {
  ticketsSOS: TicketSOS[];
  reportes: ReporteCiudadano[];
  alertasPreVerificacion: AlertaPreVerificacion[];
  estacionesBombeo?: EstacionBombeo[];
  mensajesDifusion: MensajeDifusion[];
  onUpdateTicketStatus: (id: string, estado: TicketSOS['estado'], unidad?: string, notas?: string) => void;
  onDeleteTicket?: (id: string) => void;
  onAddLocalTicket?: (ticket: TicketSOS) => void;
  onApprovePreAlerta: (id: string, accion: 'APROBAR' | 'DESCARTAR') => void;
  onUpdatePumpingStation?: (id: string, bombasActivas: number, compuerta: EstacionBombeo['estado_compuerta']) => void;
  onSendBroadcastMessage?: (mensaje: Partial<MensajeDifusion>) => void;
}

export const CivilDefenseDispatch: React.FC<CivilDefenseDispatchProps> = ({
  ticketsSOS,
  reportes,
  alertasPreVerificacion,
  mensajesDifusion,
  onUpdateTicketStatus,
  onDeleteTicket,
  onAddLocalTicket,
  onApprovePreAlerta,
  onSendBroadcastMessage,
}) => {
  const [selectedTicket, setSelectedTicket] = useState<TicketSOS | null>(ticketsSOS[0] || null);
  const [assignedUnitText, setAssignedUnitText] = useState<string>('Dotación Móvil / Personal de Guardia');
  const [dispatchNotes, setDispatchNotes] = useState<string>('');
  
  // Offline / Local state management
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(!navigator.onLine);
  const [copiedSitrep, setCopiedSitrep] = useState<boolean>(false);
  const [showVhfManualForm, setShowVhfManualForm] = useState<boolean>(false);
  const [showOfflineHelp, setShowOfflineHelp] = useState<boolean>(false);

  // Manual VHF / Phone Ticket Form State
  const [vhfNombre, setVhfNombre] = useState<string>('');
  const [vhfTelefono, setVhfTelefono] = useState<string>('');
  const [vhfDireccion, setVhfDireccion] = useState<string>('');
  const [vhfLocalidad, setVhfLocalidad] = useState<string>('Barranqueras');
  const [vhfPersonas, setVhfPersonas] = useState<number>(3);
  const [vhfNivelAgua, setVhfNivelAgua] = useState<number>(40);
  const [vhfNotas, setVhfNotas] = useState<string>('Pedido recibido por canal VHF Guardia / Teléfono directo');
  const [vhfSuccessMsg, setVhfSuccessMsg] = useState<string>('');

  // Broadcast form state
  const [broadcastChannel, setBroadcastChannel] = useState<'SMS_RURAL' | 'TELEGRAM_DEFENSA_CIVIL' | 'WHATSAPP_COMUNIDAD' | 'SIRENA_LOCAL'>('SMS_RURAL');
  const [broadcastType, setBroadcastType] = useState<'ALERTA_TEMPRANA' | 'EVACUACION' | 'INFORMATIVO' | 'CORTES_RUTAS'>('ALERTA_TEMPRANA');
  const [broadcastTarget, setBroadcastTarget] = useState<string>('Pobladores Ribereños / Zonas Bajas');
  const [broadcastText, setBroadcastText] = useState<string>(
    'ALERTA BOMBEROS BARRANQUERAS: Río Paraná en cota de vigilancia. Mantenerse informados y despejar desagües pluviales. Emergencias 100 / 103.'
  );
  const [broadcastSuccess, setBroadcastSuccess] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOfflineMode(false);
    const handleOffline = () => setIsOfflineMode(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleDispatch = (ticketId: string) => {
    onUpdateTicketStatus(
      ticketId,
      'DESPACHADO',
      assignedUnitText || 'Dotación de Bomberos en Terreno',
      dispatchNotes || 'Personal enviado a la zona señalada.'
    );
  };

  const handleResolve = (ticketId: string) => {
    onUpdateTicketStatus(ticketId, 'RESUELTO', undefined, 'Asistencia y rescate completado por la guardia.');
  };

  const handleCreateVhfTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vhfNombre.trim() || !vhfDireccion.trim()) return;

    const newTicket: TicketSOS = {
      id: `sos_vhf_${Date.now()}`,
      timestamp: new Date().toISOString(),
      nombre: vhfNombre.trim(),
      telefono: vhfTelefono.trim() || 'Sin teléfono (Vía Radio VHF)',
      direccion: vhfDireccion.trim(),
      localidad: vhfLocalidad,
      lat: -27.485,
      lon: -58.935,
      personasAfectadas: Number(vhfPersonas) || 1,
      personasVulnerables: { ninos: 0, ancianos: 0, movilidadReducida: 0 },
      alturaAguaCm: Number(vhfNivelAgua) || 30,
      nivelUrgencia: 'CRITICO',
      requiere: ['BOTE_ZODIAK'],
      estado: 'PENDIENTE',
      notasDespacho: `[REPORTE GUARDIA / VHF]: ${vhfNotas}`,
    };

    if (onAddLocalTicket) {
      onAddLocalTicket(newTicket);
    }

    // Save also in local storage for 100% resilience
    try {
      const stored = JSON.parse(localStorage.getItem('portal_chaco_sos_local') || '[]');
      stored.unshift(newTicket);
      localStorage.setItem('portal_chaco_sos_local', JSON.stringify(stored));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    setVhfNombre('');
    setVhfTelefono('');
    setVhfDireccion('');
    setVhfNotas('');
    setShowVhfManualForm(false);
    setVhfSuccessMsg('✅ Auxilio anotado y guardado correctamente en la lista de guardia.');
    setTimeout(() => setVhfSuccessMsg(''), 4000);
    setSelectedTicket(newTicket);
  };

  const handleCopySitrep = () => {
    const pend = ticketsSOS.filter((t) => t.estado === 'PENDIENTE').length;
    const desp = ticketsSOS.filter((t) => t.estado === 'DESPACHADO' || t.estado === 'EN_RESCATE').length;
    const resu = ticketsSOS.filter((t) => t.estado === 'RESUELTO').length;
    const nowStr = new Date().toLocaleString('es-AR');

    const text = `📋 INFORME DE SITUACIÓN (SITREP GUARDIA)
FECHA/HORA: ${nowStr}
ESTADO OPERATIVO: ${isOfflineMode ? 'GUARDIA AUTÓNOMA LOCAL (RADIO VHF)' : 'CONECTADO EN LÍNEA'}
RESPONSABLE: Álvarez María Elena

RESUMEN DE AUXILIOS SOS:
• Pendientes de despacho: ${pend}
• En operación / rescate activo: ${desp}
• Resueltos / Personas a resguardo: ${resu}
• Total registrados: ${ticketsSOS.length}

DETALLE DE AUXILIOS ACTIVOS:
${ticketsSOS
  .filter((t) => t.estado !== 'RESUELTO')
  .map(
    (t, idx) =>
      `${idx + 1}. [${t.estado}] ${t.nombre} - ${t.direccion} (${t.localidad}) - ${t.personasAfectadas} pers. - ${t.alturaAguaCm}cm agua - Tel: ${t.telefono}`
  )
  .join('\n')}

Líneas de Guardia: Bomberos 100 | Defensa Civil 103`;

    navigator.clipboard.writeText(text);
    setCopiedSitrep(true);
    setTimeout(() => setCopiedSitrep(false), 3500);
  };

  const handleSendBroadcast = () => {
    if (onSendBroadcastMessage) {
      onSendBroadcastMessage({
        tipo: broadcastType,
        canal: broadcastChannel,
        destinatarios_segmento: broadcastTarget,
        destinatarios_conteo: broadcastChannel === 'SMS_RURAL' ? 1420 : 350,
        mensaje: broadcastText,
        autor: 'Guardia Bomberos Voluntarios Barranqueras',
        estado: 'ENVIADO',
      });
    }
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 4500);
  };

  const pendingSOS = ticketsSOS.filter((t) => t.estado === 'PENDIENTE');
  const activeSOS = ticketsSOS.filter((t) => t.estado === 'DESPACHADO' || t.estado === 'EN_RESCATE');
  const resolvedSOS = ticketsSOS.filter((t) => t.estado === 'RESUELTO');

  return (
    <div className="space-y-6 pb-12">
      {/* Dispatch Room Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-400 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  MESA DE COMANDO Y CONTROL
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Responsable: Álvarez María Elena
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                Centro Operativo — Bomberos Barranqueras & Defensa Civil
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Recepción directa de auxilios, gestión de recursos de rescate y coordinación de guardia las 24 horas.
              </p>
            </div>
          </div>

          {/* Mode & Action controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isOfflineMode
                  ? 'bg-amber-950/70 text-amber-300 border-amber-800/80 hover:bg-amber-900/80'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/70 hover:bg-emerald-900/60'
              }`}
              title="Alternar entre modo conectado y modo desconectado para cuando se corta internet"
            >
              {isOfflineMode ? (
                <>
                  <WifiOff className="w-4 h-4 text-amber-400" />
                  <span>Modo Desconectado (Guardia Local)</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span>Modo En Línea (Sincronizado)</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopySitrep}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              title="Copiar informe de situación formateado para leer por radio VHF o enviar por WhatsApp/SMS"
            >
              {copiedSitrep ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">¡SITREP Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copiar SITREP</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowOfflineHelp(!showOfflineHelp)}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-bold transition-colors cursor-pointer"
              title="¿Cómo operar sin conexión a internet?"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Counter badges */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-950/90 p-2.5 rounded-xl border border-rose-900/50 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">SOS PENDIENTES</span>
            <span className="text-lg sm:text-xl font-bold text-rose-400 font-mono">{pendingSOS.length}</span>
          </div>
          <div className="bg-slate-950/90 p-2.5 rounded-xl border border-amber-900/50 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">EN ATENCIÓN</span>
            <span className="text-lg sm:text-xl font-bold text-amber-300 font-mono">{activeSOS.length}</span>
          </div>
          <div className="bg-slate-950/90 p-2.5 rounded-xl border border-emerald-900/50 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">RESUELTOS</span>
            <span className="text-lg sm:text-xl font-bold text-emerald-400 font-mono">{resolvedSOS.length}</span>
          </div>
        </div>
      </div>

      {/* Offline Operation Guide Banner */}
      {showOfflineHelp && (
        <div className="bg-slate-900/95 border border-sky-800/60 rounded-2xl p-4 sm:p-5 space-y-2.5 text-xs animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sky-300 text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400" />
              <span>¿Cómo funciona el Centro Operativo cuando no hay internet o se corta la luz?</span>
            </h3>
            <button
              onClick={() => setShowOfflineHelp(false)}
              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Durante inundaciones es muy común que se caigan las antenas celulares y el servicio de internet. Este centro operativo está diseñado con arquitectura <b>Local-First (Autónoma)</b>:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1">
            <li><b>Registro en Memoria del Celular/PC:</b> Todo auxilio cargado por radio VHF o llamada se guarda de inmediato en la memoria local del dispositivo sin necesitar red.</li>
            <li><b>Operación por Handie / Radio VHF:</b> El personal puede recibir avisos por frecuencia VHF (Canal 16 / Bomberos), cargar la dirección y marcar el despacho directamente.</li>
            <li><b>Copia de SITREP en 1 toque:</b> Con el botón <b>"Copiar SITREP"</b> obtienes el resumen listo para leer por radio a la jefatura o enviarlo por SMS simple cuando haya una mínima señal 2G.</li>
            <li><b>Sincronización Automática:</b> Al restablecerse la conexión de datos o Wi-Fi, la aplicación sincroniza los registros guardados automáticamente.</li>
          </ul>
        </div>
      )}

      {/* Success notification */}
      {vhfSuccessMsg && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-800/70 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{vhfSuccessMsg}</span>
        </div>
      )}

      {/* Manual VHF / Phone Ticket Creation Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-400" />
            <span>Recepción Directa por Radio VHF / Llamada Telefónica</span>
          </h3>
          <p className="text-xs text-slate-400">
            Anota inmediatamente un pedido de ayuda recibido en la guardia del cuartel sin intermediarios.
          </p>
        </div>

        <button
          onClick={() => setShowVhfManualForm(!showVhfManualForm)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs transition-colors cursor-pointer shadow"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showVhfManualForm ? 'Cerrar Formulario' : '+ Anotar Auxilio de Guardia'}</span>
        </button>
      </div>

      {/* Manual Ticket Creation Form Dropdown */}
      {showVhfManualForm && (
        <form
          onSubmit={handleCreateVhfTicket}
          className="bg-slate-900/95 border border-rose-800/60 rounded-2xl p-4 sm:p-5 space-y-4 animate-fadeIn"
        >
          <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <FileText className="w-4 h-4 text-rose-400" />
            <span>Ficha Rápida de Auxilio de Emergencia</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                Nombre del Vecino / Afectado *
              </label>
              <input
                type="text"
                required
                value={vhfNombre}
                onChange={(e) => setVhfNombre(e.target.value)}
                placeholder="Ej: Juan Pérez / Familia Gómez"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                Dirección / Barrio / Referencia *
              </label>
              <input
                type="text"
                required
                value={vhfDireccion}
                onChange={(e) => setVhfDireccion(e.target.value)}
                placeholder="Ej: Av. San Martín 1420 / B° San Pedro"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                Localidad
              </label>
              <select
                value={vhfLocalidad}
                onChange={(e) => setVhfLocalidad(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="Barranqueras">Barranqueras</option>
                <option value="Resistencia">Resistencia</option>
                <option value="Puerto Vilelas">Puerto Vilelas</option>
                <option value="Fontana">Fontana</option>
                <option value="Isla del Cerrito">Isla del Cerrito</option>
                <option value="Puerto Bermejo">Puerto Bermejo</option>
                <option value="General Vedia">General Vedia</option>
                <option value="El Sauzalito">El Sauzalito</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                Teléfono de Contacto (si posee)
              </label>
              <input
                type="text"
                value={vhfTelefono}
                onChange={(e) => setVhfTelefono(e.target.value)}
                placeholder="Ej: 3624-123456 o 'Vía Radio VHF'"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                Personas Afectadas
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={vhfPersonas}
                onChange={(e) => setVhfPersonas(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                Nivel Estimado de Agua (cm)
              </label>
              <input
                type="number"
                min={0}
                max={250}
                value={vhfNivelAgua}
                onChange={(e) => setVhfNivelAgua(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                Notas / Situación de Emergencia
              </label>
              <input
                type="text"
                value={vhfNotas}
                onChange={(e) => setVhfNotas(e.target.value)}
                placeholder="Ej: Agua dentro de la vivienda, requieren asistencia"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowVhfManualForm(false)}
              className="px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 min-h-[44px] rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold transition-colors cursor-pointer shadow flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Guardar en Registro de Guardia</span>
            </button>
          </div>
        </form>
      )}

      {/* Pre-Alert Verification Queue (Human in the Loop) */}
      {alertasPreVerificacion.some((a) => a.estado === 'PENDIENTE_REVISION') && (
        <section className="bg-slate-900/80 border border-amber-800/40 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              Cola de Pre-Verificación de Alertas (Validación Requerida)
            </h3>
          </div>

          <div className="space-y-3">
            {alertasPreVerificacion
              .filter((a) => a.estado === 'PENDIENTE_REVISION')
              .map((alerta) => (
                <div
                  key={alerta.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1 max-w-2xl text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40 font-bold text-[11px]">
                        {alerta.fase} • {alerta.localidad}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        Nivel actual: {alerta.nivelActual.toFixed(2)}m → Proyectado: {alerta.nivelProyectado.toFixed(2)}m
                      </span>
                    </div>
                    <p className="text-slate-200 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                      "{alerta.textoPropuesto}"
                    </p>
                    <div className="text-[10px] text-slate-400">
                      Canales: {alerta.canalesDestino.join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => onApprovePreAlerta(alerta.id, 'APROBAR')}
                      className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aprobar y Enviar</span>
                    </button>

                    <button
                      onClick={() => onApprovePreAlerta(alerta.id, 'DESCARTAR')}
                      className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 text-rose-400" />
                      <span>Descartar</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* SOS Triage Section & Active Rescues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Tickets Queue */}
        <div className="lg:col-span-1 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-400" />
              <span>Cola de Auxilio SOS ({ticketsSOS.length})</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">EN GUARDIA</span>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {ticketsSOS.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;
              let badgeColor = 'bg-rose-950/40 text-rose-300 border-rose-800/40';
              if (ticket.estado === 'DESPACHADO' || ticket.estado === 'EN_RESCATE') {
                badgeColor = 'bg-amber-950/40 text-amber-300 border-amber-800/40';
              } else if (ticket.estado === 'RESUELTO') {
                badgeColor = 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40';
              }

              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-rose-700/60 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs">{ticket.nombre}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                      {ticket.estado}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-1.5">
                    📍 {ticket.direccion} ({ticket.localidad})
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                    <span>{ticket.personasAfectadas} pers.</span>
                    <span className="font-mono font-bold text-rose-400">{ticket.alturaAguaCm} cm agua</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ticket Dispatch Control Panel */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          {selectedTicket ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-slate-400 font-bold">
                    TICKET ID: {selectedTicket.id}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(selectedTicket.timestamp).toLocaleString('es-AR')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{selectedTicket.nombre}</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  📍 <b>Ubicación:</b> {selectedTicket.direccion} — <b>Localidad:</b> {selectedTicket.localidad}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-300">
                  <span>📞 <b>Teléfono:</b> <a href={`tel:${selectedTicket.telefono}`} className="text-sky-400 font-mono font-bold underline">{selectedTicket.telefono}</a></span>
                </div>
              </div>

              {/* People and requirements breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">TOTAL PERSONAS</span>
                  <span className="text-lg font-bold text-white font-mono">
                    {selectedTicket.personasAfectadas}
                  </span>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-rose-900/40">
                  <span className="text-[10px] text-rose-400 block font-medium">ALTURA DEL AGUA</span>
                  <span className="text-lg font-bold text-rose-300 font-mono">
                    {selectedTicket.alturaAguaCm} cm
                  </span>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block font-medium">ESTADO</span>
                  <span className="text-xs font-bold text-slate-200 mt-1 block">
                    {selectedTicket.estado}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold mb-0.5">
                  NOTAS DE TERRENO / GUARDIA:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedTicket.notasDespacho || 'Sin observaciones adicionales.'}
                </p>
                {selectedTicket.unidadAsignada && (
                  <div className="mt-2 text-xs text-slate-200 font-semibold bg-slate-900 p-2 rounded border border-slate-800">
                    🚒 Personal / Dotación asignada: <span className="text-white font-bold">{selectedTicket.unidadAsignada}</span>
                  </div>
                )}
              </div>

              {/* Dispatch Action Controls */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="w-full sm:w-auto">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Dotación o Personal Asignado:
                  </label>
                  <input
                    type="text"
                    value={assignedUnitText}
                    onChange={(e) => setAssignedUnitText(e.target.value)}
                    placeholder="Ej: Móvil 04 / Personal de Guardia"
                    className="w-full sm:w-64 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {onDeleteTicket && (
                    <button
                      onClick={() => {
                        if (confirm(`¿Estás seguro de que deseas eliminar el ticket ${selectedTicket.id}?`)) {
                          onDeleteTicket(selectedTicket.id);
                          setSelectedTicket(null);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl bg-slate-950 hover:bg-rose-950/80 text-rose-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 font-medium text-xs transition-colors cursor-pointer"
                      title="Eliminar este ticket"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  )}

                  {selectedTicket.estado === 'PENDIENTE' && (
                    <button
                      onClick={() => handleDispatch(selectedTicket.id)}
                      className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-200 hover:bg-white text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Despachar Dotación</span>
                    </button>
                  )}

                  {selectedTicket.estado !== 'RESUELTO' && (
                    <button
                      onClick={() => handleResolve(selectedTicket.id)}
                      className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Marcar como Resuelto</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-14 text-slate-500 text-xs">
              Seleccione un ticket de la lista para gestionar su despacho o anote uno nuevo.
            </div>
          )}
        </div>
      </div>

      {/* Emergency Telephones Quick Contact Directory */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                Directorio Operativo de Emergencias (Llamada Directa con 1 Toque)
              </h3>
              <p className="text-xs text-slate-400">
                Enlaces directos con cuarteles de bomberos, patrulla fluvial y guardias de servicios públicos
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 bg-sky-950 text-sky-300 border border-sky-800 rounded-lg">
            GUARDIA 24HS ACTIVA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CONTACTOS_EMERGENCIA.slice(0, 8).map((c, i) => (
            <div key={i} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-white line-clamp-1">{c.entidad}</h4>
                  {c.localidad && (
                    <span className="text-[9px] font-semibold text-sky-400 uppercase bg-slate-900 px-1.5 py-0.5 rounded">
                      {c.localidad}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{c.descripcion}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono font-bold text-sky-300 block">
                    {c.telefono}
                  </span>
                  {c.telefonoAlt && (
                    <span className="text-[9px] text-slate-400 font-mono block">
                      {c.telefonoAlt}
                    </span>
                  )}
                </div>
                <a
                  href={`tel:${c.telefono.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors"
                  title={`Llamar a ${c.entidad}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Llamar</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Multichannel Emergency Broadcast System */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1.5">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Sistema de Difusión y Alertas Masivas a la Población
            </h3>
            <p className="text-xs text-slate-400">
              Emisión de avisos preventivos a SMS Rural (zonas sin internet), Telegram oficial, WhatsApp y sirenas.
            </p>
          </div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Canal de Difusión</label>
              <select
                value={broadcastChannel}
                onChange={(e: any) => setBroadcastChannel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 min-h-[40px] text-xs text-slate-200 focus:outline-none"
              >
                <option value="SMS_RURAL">SMS Rural (Zonas Ribereñas / 2G)</option>
                <option value="TELEGRAM_DEFENSA_CIVIL">Telegram — Comité de Crisis</option>
                <option value="WHATSAPP_COMUNIDAD">WhatsApp — Red de Vecinos</option>
                <option value="SIRENA_LOCAL">Sirena y Altoparlantes del Cuartel</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tipo de Alerta</label>
              <select
                value={broadcastType}
                onChange={(e: any) => setBroadcastType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 min-h-[40px] text-xs text-slate-200 focus:outline-none"
              >
                <option value="ALERTA_TEMPRANA">Alerta Preventiva de Crecida</option>
                <option value="EVACUACION">Aviso Preventivo de Repliegue</option>
                <option value="CORTES_RUTAS">Aviso de Cortes de Calles / Rutas</option>
                <option value="INFORMATIVO">SITREP Informativo General</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Segmento Objetivo</label>
              <input
                type="text"
                value={broadcastTarget}
                onChange={(e) => setBroadcastTarget(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 min-h-[40px] text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Cuerpo del Mensaje</label>
            <textarea
              rows={2}
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-500 font-mono"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-1">
            <span className="text-[10px] text-slate-400">
              Longitud: {broadcastText.length} caracteres • Estimado: ~{broadcastChannel === 'SMS_RURAL' ? '1.420 receptores' : '350 contactos'}
            </span>

            <button
              onClick={handleSendBroadcast}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-200 hover:bg-white text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Emitir Alerta por {broadcastChannel.replace('_', ' ')}</span>
            </button>
          </div>

          {broadcastSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>
                Mensaje transmitido y registrado en la base de datos central.
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
