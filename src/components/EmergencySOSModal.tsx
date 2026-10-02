import React, { useState } from 'react';
import {
  AlertTriangle,
  MapPin,
  Phone,
  LifeBuoy,
  Truck,
  HeartPulse,
  Droplet,
  CheckCircle,
  X,
  Shield,
} from 'lucide-react';
import { TicketSOS } from '../types';
import { COORDENADAS_RESPALDO } from '../data/chacoData';

// Número de WhatsApp de emergencia: CONFIRMAR que sea real y que alguien lo atienda.
// Si no hay uno, dejalo vacío ('') y el botón no se muestra.
const WHATSAPP_NUMERO = '5493624780000';

const LOCALIDADES_SOS = [
  { clave: 'barranqueras', nombre: 'Barranqueras' },
  { clave: 'resistencia', nombre: 'Resistencia' },
  { clave: 'puerto_vilelas', nombre: 'Puerto Vilelas' },
  { clave: 'isla_del_cerrito', nombre: 'Isla del Cerrito' },
  { clave: 'el_sauzalito', nombre: 'El Sauzalito' },
  { clave: 'puerto_bermejo', nombre: 'Puerto Bermejo' },
  { clave: 'pampa_del_indio', nombre: 'Pampa del Indio' },
  { clave: 'villa_rio_bermejito', nombre: 'Villa Río Bermejito' },
  { clave: 'fuerte_esperanza', nombre: 'Fuerte Esperanza' },
  { clave: 'la_leonesa', nombre: 'La Leonesa' },
];

const acotar = (valor: number, minimo: number, maximo: number): number => {
  if (!Number.isFinite(valor)) return minimo;
  return Math.min(maximo, Math.max(minimo, Math.round(valor)));
};

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSOS: (ticket: Partial<TicketSOS>) => Promise<boolean>;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  onSubmitSOS,
}) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [localidad, setLocalidad] = useState('barranqueras');
  const [direccion, setDireccion] = useState('');
  const [coordenadas, setCoordenadas] = useState<{ lat: number; lon: number } | null>(null);
  const [gpsMensaje, setGpsMensaje] = useState('');
  const [personasAfectadas, setPersonasAfectadas] = useState(2);
  const [ninos, setNinos] = useState(0);
  const [ancianos, setAncianos] = useState(0);
  const [alturaAguaCm, setAlturaAguaCm] = useState(20);
  const [nivelUrgencia, setNivelUrgencia] = useState<TicketSOS['nivelUrgencia']>('ALTO');
  const [requiere, setRequiere] = useState<TicketSOS['requiere']>([]);
  const [notas, setNotas] = useState('');
  const [trampa, setTrampa] = useState('');
  const [estado, setEstado] = useState<'editando' | 'enviando' | 'enviado' | 'error'>('editando');

  const detectGPS = () => {
    setGpsMensaje('');
    if (!navigator.geolocation) {
      setGpsMensaje('Tu teléfono no permite el GPS. Escribí la dirección o referencia.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordenadas({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGpsMensaje('');
      },
      () => {
        setCoordenadas(null);
        setGpsMensaje('No pudimos obtener el GPS. Escribí la dirección o referencia.');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const toggleRequiere = (item: TicketSOS['requiere'][number]) => {
    setRequiere((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const reiniciar = () => {
    setNombre('');
    setTelefono('');
    setDireccion('');
    setCoordenadas(null);
    setGpsMensaje('');
    setPersonasAfectadas(2);
    setNinos(0);
    setAncianos(0);
    setAlturaAguaCm(20);
    setNivelUrgencia('ALTO');
    setRequiere([]);
    setNotas('');
    setTrampa('');
    setEstado('editando');
  };

  const cerrar = () => {
    if (estado === 'enviado') reiniciar();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (estado === 'enviando') return;
    if (!nombre.trim() || !telefono.trim()) return;

    // Campo trampa para bots: una persona real nunca lo completa.
    if (trampa.trim() !== '') {
      setEstado('enviado');
      return;
    }

    const respaldo = COORDENADAS_RESPALDO[localidad];
    const latFinal = coordenadas ? coordenadas.lat : respaldo?.lat ?? -27.4815;
    const lonFinal = coordenadas ? coordenadas.lon : respaldo?.lon ?? -58.9324;

    const ninosOk = acotar(ninos, 0, 50);
    const ancianosOk = acotar(ancianos, 0, 50);

    const partes: string[] = [];
    if (!coordenadas) {
      partes.push('SIN GPS: ubicación aproximada de la localidad, confirmar por teléfono.');
    }
    if (ninosOk > 0) partes.push(`Niños: ${ninosOk}.`);
    if (ancianosOk > 0) partes.push(`Adultos mayores: ${ancianosOk}.`);
    if (notas.trim()) partes.push(notas.trim());

    setEstado('enviando');
    const ok = await onSubmitSOS({
      nombre: nombre.trim().slice(0, 80),
      telefono: telefono.trim().slice(0, 20),
      localidad,
      direccion:
        direccion.trim().slice(0, 160) ||
        (coordenadas
          ? `Coordenadas: ${latFinal.toFixed(4)}, ${lonFinal.toFixed(4)}`
          : 'Sin dirección indicada'),
      lat: latFinal,
      lon: lonFinal,
      personasAfectadas: acotar(personasAfectadas, 1, 100),
      personasVulnerables: {
        ninos: ninosOk,
        ancianos: ancianosOk,
        movilidadReducida: 0,
      },
      alturaAguaCm: acotar(alturaAguaCm, 0, 300),
      nivelUrgencia,
      requiere,
      notasDespacho: partes.join(' ').slice(0, 500),
    });
    setEstado(ok ? 'enviado' : 'error');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-5 shadow-2xl my-6 space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Pedido de Auxilio y Rescate SOS
              </h3>
              <p className="text-xs text-slate-400">
                Pedido de ayuda a través del Portal Hídrico Chaco
              </p>
            </div>
          </div>

          <button
            onClick={cerrar}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Immediate Direct Dialing Ribbon for High Urgency */}
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-rose-300 tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-rose-400" />
              ¿Peligro inminente? LLAMÁ AHORA (24hs GRATIS)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
            <a
              href="tel:100"
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>Bomberos 100</span>
            </a>
            <a
              href="tel:103"
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>Def. Civil 103</span>
            </a>
            <a
              href="tel:106"
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>Prefectura 106</span>
            </a>
            {WHATSAPP_NUMERO !== '' && (
              <a
                href={`https://wa.me/${WHATSAPP_NUMERO}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors"
              >
                <LifeBuoy className="w-3 h-3" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Clear destination note */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
          <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Este formulario envía tu pedido al <strong>Portal Hídrico Chaco</strong>. No reemplaza la llamada: si hay peligro, llamá primero al 100 o al 103. Tus datos se usan para coordinar la asistencia.
          </span>
        </div>

        {estado === 'enviado' && (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">PEDIDO ENVIADO</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Tu pedido llegó al portal. Mantené tu teléfono con señal, andá a un lugar alto y, si podés, llamá igual al 100 o al 103.
            </p>
            <button
              onClick={cerrar}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {estado === 'error' && (
          <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-700 space-y-3 text-center">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <h4 className="text-base font-black text-white">NO SE PUDO ENVIAR EL PEDIDO</h4>
            <p className="text-xs text-rose-100">
              No hay conexión con el portal. LLAMÁ AHORA a Bomberos o Defensa Civil.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:100"
                className="py-2 rounded-lg bg-rose-600 text-white font-bold text-sm"
              >
                Llamar 100
              </a>
              <a
                href="tel:103"
                className="py-2 rounded-lg bg-amber-600 text-white font-bold text-sm"
              >
                Llamar 103
              </a>
            </div>
            <button
              onClick={() => setEstado('editando')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Volver al formulario y reintentar
            </button>
          </div>
        )}

        {(estado === 'editando' || estado === 'enviando') && (
          <form onSubmit={handleSubmit} className="space-y-3.5 relative">
            {/* Campo trampa para bots (invisible para personas) */}
            <div
              aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
            >
              <label>
                Sitio web
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={trampa}
                  onChange={(e) => setTrampa(e.target.value)}
                />
              </label>
            </div>

            {/* Urgency Level Selector */}
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">NIVEL DE URGENCIA:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CRITICO', label: 'Crítico (Atrapados)', style: 'border-rose-700 bg-rose-950/40 text-rose-300' },
                  { id: 'ALTO', label: 'Alto (Agua en casa)', style: 'border-amber-700 bg-amber-950/40 text-amber-300' },
                  { id: 'MEDIO', label: 'Medio (Aislamiento)', style: 'border-slate-600 bg-slate-800 text-slate-300' },
                ].map((urg) => (
                  <button
                    key={urg.id}
                    type="button"
                    onClick={() => setNivelUrgencia(urg.id as any)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                      nivelUrgencia === urg.id
                        ? urg.style + ' ring-1 ring-white/30 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {urg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nombre y Apellido *</label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  placeholder="ej. Familia Fernández / Juan Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Teléfono de Contacto *</label>
                <input
                  type="tel"
                  required
                  maxLength={20}
                  pattern="[0-9+()\s\-]{8,20}"
                  title="Solo números, entre 8 y 20 caracteres"
                  placeholder="ej. 3624-123456"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>

            {/* Locality & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Localidad</label>
                <select
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-slate-500 cursor-pointer"
                >
                  {LOCALIDADES_SOS.map((l) => (
                    <option key={l.clave} value={l.clave}>
                      {l.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 block mb-1">Dirección / Barrio / Referencia</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={160}
                    placeholder="ej. Barrio San Pedro Pescador, Manzana 3"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-slate-500"
                  />
                  <button
                    type="button"
                    onClick={detectGPS}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                      coordenadas
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                    title="Capturar coordenadas GPS actuales"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{coordenadas ? 'GPS OK' : 'GPS'}</span>
                  </button>
                </div>
                {gpsMensaje !== '' && (
                  <p className="text-[11px] text-amber-300 mt-1">{gpsMensaje}</p>
                )}
                {!coordenadas && gpsMensaje === '' && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Sin GPS se usa la ubicación aproximada de la localidad: escribí bien la dirección.
                  </p>
                )}
              </div>
            </div>

            {/* People & Water Level counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <div>
                <label className="text-[10px] text-slate-400 block">Pers. Atrapadas</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={personasAfectadas}
                  onChange={(e) => setPersonasAfectadas(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block">Niños</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={ninos}
                  onChange={(e) => setNinos(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block">Adultos Mayores</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={ancianos}
                  onChange={(e) => setAncianos(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block">Agua en casa (cm)</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={alturaAguaCm}
                  onChange={(e) => setAlturaAguaCm(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-rose-300 font-bold"
                />
              </div>
            </div>

            {/* Assistance needed tags */}
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">RECURSOS REQUERIDOS:</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'BOTE_ZODIAK', label: 'Bote / Lancha', icon: LifeBuoy },
                  { id: 'CAMION_4X4', label: 'Camión 4x4', icon: Truck },
                  { id: 'ASISTENCIA_MEDICA', label: 'Ambulancia / Médico', icon: HeartPulse },
                  { id: 'VIVERES_AGUA', label: 'Agua Potable y Víveres', icon: Droplet },
                ].map((item) => {
                  const isSelected = requiere.includes(item.id as any);
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleRequiere(item.id as any)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-200 text-slate-950 border-white font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional info */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Detalle o Referencia de Ingreso</label>
              <textarea
                rows={2}
                maxLength={400}
                placeholder="ej. Entrar por calle lateral, poste caído..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-slate-500"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2 border-t border-slate-800 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={cerrar}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={estado === 'enviando'}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 disabled:cursor-wait text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {estado === 'enviando'
                    ? 'Enviando... puede tardar hasta 45 s'
                    : 'Enviar pedido de ayuda'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
