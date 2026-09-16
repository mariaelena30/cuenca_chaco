import React, { useState } from 'react';
import { CONTACTOS_EMERGENCIA } from '../data/chacoData';
import { AlertTriangle, Phone, ShieldCheck, XCircle, CheckCircle2, Zap } from 'lucide-react';

/**
 * Guía de acción ante inundaciones — qué hacer / qué no hacer.
 *
 * FUENTE Y HONESTIDAD: no encontramos un documento oficial publicado
 * específico de la Provincia del Chaco con esta lista formal. El
 * contenido de abajo está tomado de recomendaciones oficiales reales
 * de Defensa Civil de Mendoza (mismo tipo de organismo, mismo país) —
 * son lineamientos bastante estandarizados entre provincias argentinas,
 * no inventados. Si en algún momento la Subsecretaría de Protección
 * Civil del Chaco publica su propio documento, reemplazar este
 * contenido por el oficial y citarlo acá.
 */

interface Recomendacion {
  texto: string;
  categoria: 'antes' | 'durante' | 'despues';
}

const HACER: Recomendacion[] = [
  { texto: 'Si vivís cerca de un cauce, canal o riacho, estate atento a los desbordes.', categoria: 'antes' },
  { texto: 'Guardá documentos importantes en bolsas selladas y ubicá los objetos de valor en lo más alto de la casa.', categoria: 'antes' },
  { texto: 'Si el agua entra a tu vivienda, cortá el suministro de agua y luz antes de revisar daños.', categoria: 'durante' },
  { texto: 'Si hay riesgo de derrumbe o de que vuele el techo, evacuá o llamá a Defensa Civil.', categoria: 'durante' },
  { texto: 'Mantenete informado por radio, WhatsApp o Telegram oficial — no dejes de seguir los avisos.', categoria: 'durante' },
  { texto: 'Priorizá a niños, personas mayores, con discapacidad o enfermas — no los dejes solos.', categoria: 'durante' },
  { texto: 'Después de la inundación, ahorrá agua: el servicio puede estar limitado.', categoria: 'despues' },
  { texto: 'Si un familiar está desaparecido, hacé la denuncia — no salgas solo a buscarlo.', categoria: 'despues' },
];

const NO_HACER: Recomendacion[] = [
  { texto: 'No te acerques a zonas ya inundadas: puede haber socavones, hundimientos o derrumbes que no se ven.', categoria: 'durante' },
  { texto: 'No cruces a pie ni en auto una corriente de agua que te tape las rodillas.', categoria: 'durante' },
  { texto: 'No toques cables eléctricos caídos ni equipos mojados.', categoria: 'durante' },
  { texto: 'Durante una tormenta eléctrica, no te quedes cerca de espejos de agua ni en espacios abiertos.', categoria: 'durante' },
  { texto: 'No vuelvas a tu casa hasta que las autoridades confirmen que ya no hay riesgo.', categoria: 'despues' },
  { texto: 'No tomes agua de la canilla hasta que avisen que es potable.', categoria: 'despues' },
  { texto: 'No seas curioso/a en zonas con daños — se pueden generar accidentes nuevos.', categoria: 'despues' },
];

const FUENTE_TEXTO =
  'Basado en recomendaciones oficiales de Defensa Civil (Mendoza, Argentina) — no se encontró un documento equivalente publicado específicamente por Chaco al momento de escribir esto.';

export const GuiaAccionInundacion: React.FC = () => {
  const [tab, setTab] = useState<'hacer' | 'no_hacer'>('hacer');
  const lista = tab === 'hacer' ? HACER : NO_HACER;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Qué hacer y qué no hacer ante una inundación
          </h2>
          <p className="text-xs text-slate-400">{FUENTE_TEXTO}</p>
        </div>
      </div>

      {/* Tabs llamativos */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('hacer')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
            tab === 'hacer'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
              : 'bg-slate-950/60 text-slate-400 border border-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Qué hacer
        </button>
        <button
          onClick={() => setTab('no_hacer')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
            tab === 'no_hacer'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
              : 'bg-slate-950/60 text-slate-400 border border-slate-800'
          }`}
        >
          <XCircle className="w-4 h-4" />
          Qué NO hacer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {lista.map((item, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              tab === 'hacer'
                ? 'bg-emerald-950/30 border-emerald-800/40'
                : 'bg-rose-950/30 border-rose-800/40'
            }`}
          >
            {tab === 'hacer' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <p className="text-sm text-slate-200 leading-snug">{item.texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const NumerosUtilesEmergencia: React.FC = () => {
  const [verTodos, setVerTodos] = useState(false);
  const lista = verTodos ? CONTACTOS_EMERGENCIA : CONTACTOS_EMERGENCIA.slice(0, 6);

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
          <Phone className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Números útiles en caso de inundación
          </h2>
          <p className="text-xs text-slate-400">Defensa Civil, Bomberos, Prefectura, Salud y servicios — llamada directa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {lista.map((c, i) => (
          <a
            key={i}
            href={`tel:${c.telefono.replace(/[^0-9]/g, '')}`}
            className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-sky-700 transition-colors flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{c.entidad}</p>
              <p className="text-[11px] text-slate-400 truncate">{c.localidad}</p>
            </div>
            <span className="text-base font-black font-mono text-sky-400 shrink-0">{c.telefono}</span>
          </a>
        ))}
      </div>

      {!verTodos && CONTACTOS_EMERGENCIA.length > 6 && (
        <button
          onClick={() => setVerTodos(true)}
          className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
        >
          Ver los {CONTACTOS_EMERGENCIA.length} contactos completos
        </button>
      )}
    </div>
  );
};
