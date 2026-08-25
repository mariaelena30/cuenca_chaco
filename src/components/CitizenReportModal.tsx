import React, { useState } from 'react';
import {
  Droplets,
  MapPin,
  Camera,
  CheckCircle,
  X,
  AlertCircle,
  Send,
  Info,
  Phone,
  AlertTriangle,
} from 'lucide-react';
import { ReporteCiudadano } from '../types';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (reporte: Partial<ReporteCiudadano>) => void;
  onSwitchToSOS?: () => void;
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
  onSwitchToSOS,
}) => {
  const [nombre, setNombre] = useState('');
  const [localidad, setLocalidad] = useState('Resistencia');
  const [barrio, setBarrio] = useState('');
  const [calle, setCalle] = useState('');
  const [nivelAguaAprox, setNivelAguaAprox] = useState<ReporteCiudadano['nivelAguaAprox']>('VEREDA');
  const [descripcion, setDescripcion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !calle.trim()) return;

    onSubmitReport({
      nombre,
      localidad,
      barrio: barrio || 'Casco Urbano',
      calle,
      nivelAguaAprox,
      descripcion,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-3.5 my-auto">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 font-bold">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reportar Anegamiento de Calle o Zona</h3>
              <p className="text-xs text-slate-400">Publicación en Mapa Comunitario y Centro de Emergencias</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* High Risk Redirection Banner */}
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">¿El agua ingresó a tu vivienda o hay personas atrapadas?</span>
              <span className="text-[11px] text-amber-300/90">
                Pedí auxilio de rescate prioritario o llamá a Bomberos (100) / Defensa Civil (103).
              </span>
            </div>
          </div>
          {onSwitchToSOS && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToSOS();
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs whitespace-nowrap cursor-pointer transition-colors shadow"
            >
              Pedir Auxilio SOS
            </button>
          )}
        </div>

        {/* Clear destination guidance */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Este reporte geolocaliza el anegamiento en el <strong>Mapa en Vivo</strong> para advertir a automovilistas, peatones y servicios de auxilio municipal sobre cortes y calles intransitables.
          </span>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">¡REPORTE REGISTRADO CON ÉXITO!</h4>
            <p className="text-xs text-slate-300">
              Se ha publicado en el mapa colaborativo para advertir a la comunidad.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Tu Nombre o Vecino *</label>
              <input
                type="text"
                required
                placeholder="ej. Vecino de Villa Río Negro / Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Localidad</label>
                <select
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-slate-500 cursor-pointer"
                >
                  <option value="Resistencia">Resistencia</option>
                  <option value="Barranqueras">Barranqueras</option>
                  <option value="Puerto Vilelas">Puerto Vilelas</option>
                  <option value="Fontana">Fontana</option>
                  <option value="El Sauzalito">El Sauzalito</option>
                  <option value="Puerto Bermejo">Puerto Bermejo</option>
                  <option value="Pampa del Indio">Pampa del Indio</option>
                  <option value="Isla del Cerrito">Isla del Cerrito</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Barrio o Zona</label>
                <input
                  type="text"
                  placeholder="ej. La Rubita, Villa Don Andrés, Centro"
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Calle y Altura / Intersección *</label>
              <input
                type="text"
                required
                placeholder="ej. Av. Sabin y Lavalle / Av. Castelli al 3500"
                value={calle}
                onChange={(e) => setCalle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Nivel del Agua en el Lugar</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'CORDON', label: 'Cordón cuneta' },
                  { id: 'CALLE', label: 'Calle anegada' },
                  { id: 'VEREDA', label: 'Tapa vereda' },
                  { id: 'VIVIENDA', label: 'Ingreso a casas' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setNivelAguaAprox(item.id as any)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer text-center ${
                      nivelAguaAprox === item.id
                        ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Detalle / Obstrucciones / Riesgos</label>
              <textarea
                rows={2}
                placeholder="ej. Sumidero tapado por ramas, agua estancada a 30cm, vehículos no pueden circular..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center gap-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                <span>Guardia: <b>103</b> / <b>100</b></span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar Anegamiento</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
