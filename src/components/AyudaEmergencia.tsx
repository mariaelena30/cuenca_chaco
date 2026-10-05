import React, { useState } from 'react';
import { X, Phone, MapPin, Shield, ListChecks } from 'lucide-react';
import { CONTACTOS_MUNICIPALES, LOCALIDADES_AYUDA } from '../data/contactosEmergencia';
import { useIdioma } from '../i18n';
import type { ClaveTexto } from '../i18n';

interface AyudaEmergenciaProps {
  isOpen: boolean;
  onClose: () => void;
}

const NUMEROS_NACIONALES: { numero: string; clave: ClaveTexto; estilo: string }[] = [
  { numero: '103', clave: 'ayuda.defensaCivil', estilo: 'bg-amber-700 hover:bg-amber-600' },
  { numero: '100', clave: 'ayuda.bomberos', estilo: 'bg-rose-700 hover:bg-rose-600' },
  { numero: '106', clave: 'ayuda.prefectura', estilo: 'bg-sky-700 hover:bg-sky-600' },
  { numero: '107', clave: 'ayuda.emergenciasMedicas', estilo: 'bg-emerald-700 hover:bg-emerald-600' },
  { numero: '911', clave: 'ayuda.policia', estilo: 'bg-slate-700 hover:bg-slate-600' },
];

const PASOS_QUE_DECIR: ClaveTexto[] = [
  'ayuda.queDecir1',
  'ayuda.queDecir2',
  'ayuda.queDecir3',
  'ayuda.queDecir4',
];

const soloDigitos = (texto: string): string => texto.replace(/\D/g, '');

export const AyudaEmergencia: React.FC<AyudaEmergenciaProps> = ({ isOpen, onClose }) => {
  const { t } = useIdioma();
  const [localidad, setLocalidad] = useState<string>('barranqueras');
  const [mensajeUbicacion, setMensajeUbicacion] = useState<string>('');
  const [ubicacionTexto, setUbicacionTexto] = useState<string>('');

  const contactos = CONTACTOS_MUNICIPALES.filter(
    (c) => c.localidad === localidad && c.confirmado
  );

  // La ubicación solo se copia en el teléfono: no se envía ni se guarda.
  const copiarUbicacion = () => {
    setMensajeUbicacion('');
    setUbicacionTexto('');
    if (!navigator.geolocation) {
      setMensajeUbicacion(t('ayuda.errorUbicacion'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const texto = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        setUbicacionTexto(texto);
        try {
          await navigator.clipboard.writeText(texto);
          setMensajeUbicacion(t('ayuda.ubicacionCopiada'));
        } catch {
          setMensajeUbicacion(t('ayuda.ubicacionNoCopiada'));
        }
      },
      () => setMensajeUbicacion(t('ayuda.errorUbicacion')),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-5 shadow-2xl my-6 space-y-4">
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white tracking-tight">{t('ayuda.titulo')}</h3>
          <button
            onClick={onClose}
            aria-label={t('ayuda.cerrar')}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aviso: el portal no recibe pedidos */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 flex items-start gap-2">
          <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span className="font-semibold">{t('ayuda.aviso')}</span>
        </div>

        {/* Llamadas */}
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 space-y-2">
          <span className="text-[11px] font-black uppercase text-rose-300 tracking-wider flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-rose-400" />
            {t('ayuda.llamaAhora')}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {NUMEROS_NACIONALES.map((n) => (
              <a
                key={n.numero}
                href={`tel:${n.numero}`}
                className={`flex items-center gap-2 py-2.5 px-3 rounded-lg text-white font-bold text-sm transition-colors ${n.estilo}`}
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span className="font-mono text-base">{n.numero}</span>
                <span className="text-xs font-semibold leading-tight">{t(n.clave)}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Teléfonos del municipio */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-medium block">{t('ayuda.localidad')}</label>
          <select
            value={localidad}
            onChange={(e) => setLocalidad(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-slate-500 cursor-pointer"
          >
            {LOCALIDADES_AYUDA.map((l) => (
              <option key={l.clave} value={l.clave}>
                {l.nombre}
              </option>
            ))}
          </select>

          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pt-1">
            {t('ayuda.municipalesTitulo')}
          </div>

          {contactos.length === 0 ? (
            <p className="text-xs text-slate-400 bg-slate-950/70 border border-slate-800 rounded-xl p-3">
              {t('ayuda.sinMunicipales')}
            </p>
          ) : (
            <div className="space-y-2">
              {contactos.map((c) => (
                <a
                  key={c.id}
                  href={`tel:${soloDigitos(c.telefono)}`}
                  className="block bg-slate-950/70 border border-slate-800 hover:border-slate-600 rounded-xl p-3 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-white">{c.nombre}</div>
                      <div className="text-[11px] text-slate-400">{c.descripcion}</div>
                    </div>
                    <div className="text-sm font-black font-mono text-cyan-300 whitespace-nowrap">
                      {c.telefono}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {t('ayuda.fuente')}: {c.fuente} ({c.fecha})
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Qué decir al llamar */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1.5">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <ListChecks className="w-4 h-4 text-slate-400" />
            {t('ayuda.queDecirTitulo')}
          </div>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
            {PASOS_QUE_DECIR.map((clave) => (
              <li key={clave}>{t(clave)}</li>
            ))}
          </ul>
        </div>

        {/* Copiar ubicación */}
        <div className="space-y-2">
          <button
            onClick={copiarUbicacion}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-slate-300" />
            {t('ayuda.copiarUbicacion')}
          </button>
          <p className="text-[11px] text-slate-500">{t('ayuda.ubicacionAviso')}</p>
          {mensajeUbicacion !== '' && (
            <p className="text-xs text-amber-300">{mensajeUbicacion}</p>
          )}
          {ubicacionTexto !== '' && (
            <p className="text-sm font-mono font-bold text-cyan-300">{ubicacionTexto}</p>
          )}
        </div>
      </div>
    </div>
  );
};
