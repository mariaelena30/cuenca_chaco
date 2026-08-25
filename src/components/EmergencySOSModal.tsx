import React, { useState } from 'react';
import {
  AlertTriangle,
  MapPin,
  Phone,
  User,
  Users,
  LifeBuoy,
  Truck,
  HeartPulse,
  Droplet,
  CheckCircle,
  X,
  Shield,
} from 'lucide-react';
import { TicketSOS } from '../types';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSOS: (ticket: Partial<TicketSOS>) => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  onSubmitSOS,
}) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [localidad, setLocalidad] = useState('Barranqueras');
  const [direccion, setDireccion] = useState('');
  const [lat, setLat] = useState<number>(-27.4815);
  const [lon, setLon] = useState<number>(-58.9324);
  const [gpsDetected, setGpsDetected] = useState(false);
  const [personasAfectadas, setPersonasAfectadas] = useState(2);
  const [ninos, setNinos] = useState(0);
  const [ancianos, setAncianos] = useState(0);
  const [movilidadReducida, setMovilidadReducida] = useState(0);
  const [alturaAguaCm, setAlturaAguaCm] = useState(20);
  const [nivelUrgencia, setNivelUrgencia] = useState<TicketSOS['nivelUrgencia']>('ALTO');
  const [requiere, setRequiere] = useState<TicketSOS['requiere']>(['CAMION_4X4', 'ASISTENCIA_MEDICA']);
  const [notas, setNotas] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const detectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLon(pos.coords.longitude);
          setGpsDetected(true);
        },
        (err) => {
          console.warn('GPS error, using default locality coordinates', err);
        }
      );
    }
  };

  const toggleRequiere = (item: TicketSOS['requiere'][number]) => {
    setRequiere((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) return;

    onSubmitSOS({
      nombre,
      telefono,
      localidad,
      direccion: direccion || `Coordenadas: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      lat,
      lon,
      personasAfectadas,
      personasVulnerables: {
        ninos,
        ancianos,
        movilidadReducida,
      },
      alturaAguaCm,
      nivelUrgencia,
      requiere,
      notasDespacho: notas,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
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
                Transmisión a Central de Bomberos (100) y Defensa Civil (103)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
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
            <a
              href="https://wa.me/5493624780000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors"
            >
              <LifeBuoy className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Clear destination note */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
          <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Completá este formulario si estás anegado, aislado o necesitás evacuación. El pedido entra directamente al <strong>mapa y centro de despacho de Bomberos y Defensa Civil</strong>.
          </span>
        </div>

        {submitted ? (
          <div className="py-10 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-white">¡PEDIDO DE AUXILIO REGISTRADO!</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Tu solicitud fue transmitida al Centro de Despacho de Bomberos (100) y Defensa Civil (103). Mantén tu teléfono con señal disponible y resguárdate en un punto elevado.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
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
                  <option value="Barranqueras">Barranqueras</option>
                  <option value="Resistencia">Resistencia</option>
                  <option value="Puerto Vilelas">Puerto Vilelas</option>
                  <option value="Isla del Cerrito">Isla del Cerrito</option>
                  <option value="El Sauzalito">El Sauzalito</option>
                  <option value="Puerto Bermejo">Puerto Bermejo</option>
                  <option value="Pampa del Indio">Pampa del Indio</option>
                  <option value="Villa Río Bermejito">Villa Río Bermejito</option>
                  <option value="Fuerte Esperanza">Fuerte Esperanza</option>
                  <option value="La Leonesa">La Leonesa</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 block mb-1">Dirección / Barrio / Referencia</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ej. Barrio San Pedro Pescador, Manzana 3"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-slate-500"
                  />
                  <button
                    type="button"
                    onClick={detectGPS}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                      gpsDetected
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                    title="Capturar coordenadas GPS actuales"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{gpsDetected ? 'GPS OK' : 'GPS'}</span>
                  </button>
                </div>
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
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Enviar a Bomberos (100)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
