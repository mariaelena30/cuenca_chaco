import React, { useEffect, useRef, useState } from 'react';
import { CloudRain, LocateFixed, Search } from 'lucide-react';

// Si ya tenés una constante con la URL de la API en services/api.ts,
// importala y reemplazá esta línea.
const API: string = (import.meta as any).env?.VITE_API_URL ?? '';

interface Lugar {
  nombre: string;
  provincia?: string | null;
  lat: number;
  lon: number;
}

interface Dia {
  fecha: string;
  lluvia_mm: number | null;
  probabilidad: number | null;
}

const LUGAR_POR_DEFECTO: Lugar = {
  nombre: 'Resistencia',
  provincia: 'Chaco',
  lat: -27.4514,
  lon: -58.9867,
};

const CLAVE_GUARDADA = 'portal_hidrico_lugar';

function colorDeLluvia(mm: number): string {
  if (mm < 1) return 'bg-slate-600';
  if (mm < 10) return 'bg-sky-500';
  if (mm < 30) return 'bg-amber-400';
  return 'bg-red-500';
}

function etiquetaDia(fecha: string, indice: number): string {
  if (indice === 0) return 'Hoy';
  if (indice === 1) return 'Mañana';
  const d = new Date(fecha + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '');
}

function fechaCorta(fecha: string): string {
  const d = new Date(fecha + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'numeric' });
}

function resumen(dias: Dia[]): { texto: string; nivel: 'calma' | 'atencion' | 'alerta' } {
  const conDatos = dias.filter((d) => d.lluvia_mm !== null);
  if (conDatos.length === 0) {
    return { texto: 'No hay datos de lluvia para este lugar.', nivel: 'calma' };
  }
  const total = conDatos.reduce((a, d) => a + (d.lluvia_mm ?? 0), 0);
  const maximo = conDatos.reduce((a, d) => ((d.lluvia_mm ?? 0) > (a.lluvia_mm ?? 0) ? d : a));
  const indiceMax = dias.indexOf(maximo);
  const mmMax = maximo.lluvia_mm ?? 0;

  if (total < 2) {
    return { texto: 'No se espera lluvia importante en los próximos 7 días.', nivel: 'calma' };
  }
  const cuando = etiquetaDia(maximo.fecha, indiceMax).toLowerCase();
  const texto = `Se esperan ${Math.round(total)} mm en la semana. El día más lluvioso sería ${cuando} (${fechaCorta(
    maximo.fecha
  )}) con ${Math.round(mmMax)} mm.`;
  if (mmMax >= 30) return { texto, nivel: 'alerta' };
  if (mmMax >= 10) return { texto, nivel: 'atencion' };
  return { texto, nivel: 'calma' };
}

const ESTILO_RESUMEN = {
  calma: 'border-emerald-800/60 bg-emerald-950/30 text-emerald-200',
  atencion: 'border-amber-700/60 bg-amber-950/40 text-amber-200',
  alerta: 'border-red-800/60 bg-red-950/40 text-red-200',
};

export function PronosticoLluvia() {
  const [lugar, setLugar] = useState<Lugar>(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_GUARDADA);
      return guardado ? (JSON.parse(guardado) as Lugar) : LUGAR_POR_DEFECTO;
    } catch {
      return LUGAR_POR_DEFECTO;
    }
  });
  const [consulta, setConsulta] = useState('');
  const [sugerencias, setSugerencias] = useState<Lugar[]>([]);
  const [dias, setDias] = useState<Dia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorUbicacion, setErrorUbicacion] = useState<string | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trae el pronóstico cada vez que cambia el lugar
  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);
    fetch(`${API}/pronostico?lat=${lugar.lat}&lon=${lugar.lon}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((datos) => {
        if (!cancelado) setDias(datos.dias ?? []);
      })
      .catch(() => {
        if (!cancelado) {
          setDias([]);
          setError('No pudimos traer el pronóstico. Probá de nuevo en unos minutos.');
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [lugar]);

  // Buscador con espera de 300 ms entre teclas
  const alEscribir = (texto: string) => {
    setConsulta(texto);
    if (temporizador.current) clearTimeout(temporizador.current);
    if (texto.trim().length < 2) {
      setSugerencias([]);
      return;
    }
    temporizador.current = setTimeout(() => {
      fetch(`${API}/pronostico/buscar?q=${encodeURIComponent(texto.trim())}`)
        .then((r) => r.json())
        .then((datos) => setSugerencias(datos.resultados ?? []))
        .catch(() => setSugerencias([]));
    }, 300);
  };

  const elegir = (l: Lugar) => {
    setLugar(l);
    setConsulta('');
    setSugerencias([]);
    setErrorUbicacion(null);
    try {
      localStorage.setItem(CLAVE_GUARDADA, JSON.stringify(l));
    } catch {
      /* si el navegador no deja guardar, seguimos igual */
    }
  };

  const usarMiUbicacion = () => {
    setErrorUbicacion(null);
    if (!navigator.geolocation) {
      setErrorUbicacion('Tu navegador no permite obtener la ubicación. Buscá tu localidad.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        elegir({
          nombre: 'Tu ubicación',
          provincia: null,
          lat: Number(pos.coords.latitude.toFixed(4)),
          lon: Number(pos.coords.longitude.toFixed(4)),
        }),
      () => setErrorUbicacion('No pudimos obtener tu ubicación. Buscá tu localidad.'),
      { timeout: 8000 }
    );
  };

  const maximoMm = Math.max(30, ...dias.map((d) => d.lluvia_mm ?? 0));
  const res = dias.length > 0 ? resumen(dias) : null;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-cyan-900/60 bg-cyan-950/40 p-2.5 text-cyan-300">
          <CloudRain className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">¿Va a llover donde vivís?</h2>
          <p className="text-sm text-slate-400">
            Buscá tu localidad y mirá la lluvia prevista para los próximos 7 días.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={consulta}
            onChange={(e) => alEscribir(e.target.value)}
            placeholder="Escribí tu ciudad o paraje"
            aria-label="Buscar localidad"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          {sugerencias.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
              {sugerencias.map((s) => (
                <li key={`${s.lat}-${s.lon}`}>
                  <button
                    type="button"
                    onClick={() => elegir(s)}
                    className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 focus:bg-slate-800 focus:outline-none"
                  >
                    {s.nombre}
                    {s.provincia ? <span className="text-slate-500">, {s.provincia}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={usarMiUbicacion}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-200 hover:border-cyan-600 hover:text-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        >
          <LocateFixed className="h-4 w-4" />
          Usar mi ubicación
        </button>
      </div>
      {errorUbicacion && <p className="mt-2 text-sm text-amber-300">{errorUbicacion}</p>}

      <p className="mt-5 text-sm text-slate-400">
        Pronóstico para{' '}
        <span className="font-semibold text-slate-100">
          {lugar.nombre}
          {lugar.provincia ? `, ${lugar.provincia}` : ''}
        </span>
      </p>

      {cargando && <p className="mt-4 text-sm text-slate-500">Buscando el pronóstico…</p>}

      {error && !cargando && (
        <div className="mt-4 rounded-lg border border-amber-700/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      )}

      {res && !cargando && (
        <>
          <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${ESTILO_RESUMEN[res.nivel]}`}>
            {res.texto}
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-3">
            {dias.map((d, i) => {
              const mm = d.lluvia_mm ?? 0;
              const alto = Math.max(4, Math.round((Math.min(mm, maximoMm) / maximoMm) * 100));
              return (
                <div key={d.fecha} className="flex flex-col items-center text-center">
                  <span className="text-xs font-semibold capitalize text-slate-200">
                    {etiquetaDia(d.fecha, i)}
                  </span>
                  <span className="text-[11px] text-slate-500">{fechaCorta(d.fecha)}</span>
                  <div className="my-2 flex h-28 w-full items-end justify-center rounded-md bg-slate-900/80 px-1.5 pb-1">
                    <div
                      className={`w-full rounded-sm ${colorDeLluvia(mm)}`}
                      style={{ height: `${alto}%` }}
                      title={`${mm} mm`}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-100">
                    {d.lluvia_mm === null ? 's/d' : `${Math.round(mm)} mm`}
                  </span>
                  <span className="text-[11px] text-sky-300">
                    {d.probabilidad === null ? '' : `${d.probabilidad}% prob.`}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" /> lluvia leve (hasta 10 mm)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> moderada (10 a 30 mm)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> fuerte (más de 30 mm)
            </span>
          </div>
        </>
      )}

      <p className="mt-5 text-xs leading-relaxed text-slate-500">
        Pronóstico de un modelo meteorológico (Open-Meteo), no un aviso oficial. Los milímetros son
        por día: una lluvia concentrada en pocas horas es más peligrosa que la misma cantidad
        repartida. Para alertas oficiales consultá el{' '}
        <a
          href="https://www.argentina.gob.ar/smn"
          target="_blank"
          rel="noreferrer"
          className="text-cyan-400 underline hover:text-cyan-300"
        >
          Servicio Meteorológico Nacional
        </a>{' '}
        o llamá a Defensa Civil (103).
      </p>
    </section>
  );
}

export default PronosticoLluvia;
