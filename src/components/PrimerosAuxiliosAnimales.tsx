import React from 'react';
import { Phone, ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

/**
 * Primeros auxilios ante mordeduras y picaduras de animales venenosos.
 *
 * Contenido basado en guías oficiales (ver FUENTES al pie de la sección).
 * Es información orientativa: NO reemplaza la atención médica. Conviene que
 * un profesional de salud la revise antes de publicarla.
 *
 * Criterio: solo se incluye lo que figura en esas guías. Lo que no figura
 * (por ejemplo, si poner hielo) NO se afirma ni en un sentido ni en otro.
 */

interface Ficha {
  id: string;
  titulo: string;
  emoji: string;
  intro: string;
  hacer: string[];
  noHacer: string[];
  alarma: string[];
  abierta?: boolean;
}

const FICHAS: Ficha[] = [
  {
    id: 'serpientes',
    titulo: 'Mordedura de serpiente',
    emoji: '🐍',
    intro:
      'En Argentina las serpientes venenosas de importancia son la yarará, la cascabel y la coral. Toda mordedura de serpiente que se sospeche venenosa se trata como una emergencia, aunque la persona se sienta bien al principio.',
    hacer: [
      'Mantener la calma y que la persona esté en reposo absoluto.',
      'Inmovilizar el miembro mordido.',
      'Sacar anillos, pulseras, cadenas, tobilleras y calzado antes de que se hinche.',
      'Limpiar la zona de la mordedura con agua y jabón.',
      'Trasladar YA a la persona al hospital o centro de salud más cercano, y avisar por teléfono que va en camino.',
      'Si se puede hacerlo sin riesgo, recordar o fotografiar el animal. Ayuda, pero no es imprescindible: no hay que perder tiempo ni acercarse a buscarlo.',
    ],
    noHacer: [
      'NO hacer torniquete ni ligaduras: agravan el daño en el miembro.',
      'NO cortar ni hacer incisiones en la mordedura.',
      'NO chupar el veneno ni cauterizar.',
      'NO poner alcohol, vinagre, querosene ni otros remedios caseros.',
      'NO dar bebidas alcohólicas.',
      'NO dar medicamentos por cuenta propia: los indica el médico.',
      'NO intentar capturar ni matar a la serpiente.',
    ],
    alarma: [
      'Hinchazón que avanza por el miembro, dolor intenso o sangrados (yarará).',
      'Visión borrosa o doble, párpados caídos, dificultad para hablar u orina oscura (cascabel).',
      'La coral se considera siempre grave: puede paralizar los músculos de la respiración. Llevar al hospital sin demora aunque no haya síntomas.',
    ],
    abierta: true,
  },
  {
    id: 'aranas',
    titulo: 'Picadura de araña',
    emoji: '🕷️',
    intro:
      'Las arañas de importancia médica son la viuda negra (Latrodectus) y la araña de los rincones (Loxosceles). Existe antiveneno específico para ambas, que se aplica solo en el hospital.',
    hacer: [
      'Mantener la calma y limpiar la zona con agua y jabón.',
      'Ir al hospital o centro de salud para que evalúen a la persona, sobre todo si es un niño.',
      'Si se puede, llevar o fotografiar la araña sin tocarla con las manos.',
      'En la araña de los rincones el antiveneno es eficaz dentro de las primeras 36 horas: no esperar a que aparezca la herida.',
    ],
    noHacer: [
      'NO hacer cortes ni succión en la picadura.',
      'NO poner alcohol, vinagre, querosene ni remedios caseros.',
      'NO dar medicamentos por cuenta propia.',
    ],
    alarma: [
      'Viuda negra: espasmos, confusión, dificultad para respirar.',
      'Araña de los rincones: placa o mancha oscura en la piel (lesión que se vuelve necrótica).',
    ],
  },
  {
    id: 'escorpiones',
    titulo: 'Picadura de escorpión (alacrán)',
    emoji: '🦂',
    intro:
      'Los niños tienen mayor riesgo de gravedad. Existe antiveneno específico, que se aplica solo en el hospital.',
    hacer: [
      'Mantener la calma, limpiar la zona con agua y jabón.',
      'Llevar a la persona al hospital o centro de salud, aunque solo tenga dolor local: los casos leves se controlan igual durante unas horas.',
      'Con un niño, ir sin demora.',
    ],
    noHacer: [
      'NO hacer cortes ni succión en la picadura.',
      'NO poner alcohol, vinagre, querosene ni remedios caseros.',
      'NO dar medicamentos por cuenta propia.',
    ],
    alarma: [
      'Sudor, náuseas o vómitos repetidos (los vómitos que no paran son signo de mal pronóstico).',
      'Confusión, mucha excitación, babeo, palidez, latidos muy rápidos o muy lentos, o dificultad para respirar.',
    ],
  },
];

const LLAMADAS: { numero: string; texto: string; href: string; estilo: string }[] = [
  { numero: '911', texto: 'Emergencias', href: 'tel:911', estilo: 'bg-rose-700 hover:bg-rose-600' },
  { numero: '105', texto: 'Animales', href: 'tel:105', estilo: 'bg-sky-700 hover:bg-sky-600' },
];

export const PrimerosAuxiliosAnimales: React.FC = () => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
      <div>
        <span className="text-xs uppercase tracking-wider text-rose-400 font-bold">
          PRIMEROS AUXILIOS
        </span>
        <h3 className="text-xl font-bold text-white tracking-tight">
          🐍 Animales venenosos: qué hacer y qué NO hacer
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Durante las inundaciones, las serpientes, arañas y escorpiones buscan zonas secas y pueden
          aparecer dentro de las casas, entre los muebles y en los escombros.
        </p>
      </div>

      <div className="rounded-xl bg-rose-950/60 border border-rose-800/80 p-4 space-y-3">
        <div className="flex items-start gap-2 text-rose-100 text-sm font-bold">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <span>
            Ante una mordedura o picadura de un animal que pueda ser venenoso: llevar a la persona al
            hospital más cercano YA. El antiveneno solo se da en el hospital.
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {LLAMADAS.map((l) => (
            <a
              key={l.numero}
              href={l.href}
              className={`flex items-center gap-2 py-2.5 px-3 rounded-lg text-white transition-colors ${l.estilo}`}
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span className="leading-tight">
                <span className="block font-mono font-bold text-sm">{l.numero}</span>
                <span className="block text-[11px] font-semibold">{l.texto}</span>
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {FICHAS.map((f) => (
          <details
            key={f.id}
            open={f.abierta}
            className="group bg-slate-950/70 border border-slate-800 rounded-xl"
          >
            <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3 text-sm font-bold text-white">
              <span>
                <span className="mr-2" aria-hidden="true">
                  {f.emoji}
                </span>
                {f.titulo}
              </span>
              <span className="text-xs font-normal text-slate-400 group-open:hidden">Ver</span>
              <span className="text-xs font-normal text-slate-400 hidden group-open:inline">Ocultar</span>
            </summary>

            <div className="px-4 pb-4 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">{f.intro}</p>

              <div>
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Qué hacer
                </div>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-200">
                  {f.hacer.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-1.5">
                  <XCircle className="w-4 h-4" /> Qué NO hacer
                </div>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-200">
                  {f.noHacer.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="w-4 h-4" /> Señales de alarma
                </div>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-200">
                  {f.alarma.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        ))}
      </div>

      <p className="text-[11px] text-amber-300/90">
        Información orientativa: no reemplaza la atención médica. Ante cualquier duda, llamar al 107 o ir
        al hospital.
      </p>
      <p className="text-[10px] text-slate-500 leading-relaxed">
        Fuentes: Ministerio de Salud de la Nación, «Guía de prevención, diagnóstico, tratamiento y
        vigilancia epidemiológica del ofidismo» (2014). Ministerio de Salud de Córdoba, «Accidentes por
        ofidios, arácnidos y alacranes» (2023), basado en guías del Ministerio de Salud de la Nación.
      </p>
    </div>
  );
};

export default PrimerosAuxiliosAnimales;
