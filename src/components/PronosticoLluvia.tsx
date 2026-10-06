import React, { useEffect, useRef, useState } from 'react';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  LocateFixed,
  Search,
  Snowflake,
  Sun,
  Wind,
} from 'lucide-react';

import { API_BASE_URL } from '../services/api';

// Misma URL del backend que usa el resto del portal (services/api.ts)
const API: string = API_BASE_URL;

interface Lugar {
  nombre: string;
  provincia?: string | null;
  lat: number;
  lon: number;
}

interface Actual {
  temperatura: number | null;
  sensacion: number | null;
  humedad: number | null;
  viento_kmh: number | null;
  codigo: number | null;
  hora: string | null;
}

interface Dia {
  fecha: string;
  codigo: number | null;
  tmax: number | null;
  tmin: number | null;
  lluvia_mm: number | null;
  probabilidad: number | null;
}

interface Pronostico {
  actual: Actual | null;
  lluvia_24h_mm: number | null;
  dias: Dia[];
}

const LUGAR_POR_DEFECTO: Lugar = {
  nombre: 'Resistencia',
  provincia: 'Chaco',
  lat: -27.4514,
  lon: -58.9867,
};

const ATAJOS = [
  'Resistencia',
  'Barranqueras',
  'Puerto Vilelas',
  'Pampa del Indio',
  'Charata',
  'Juan José Castelli',
];

const CLAVE_GUARDADA = 'portal_hidrico_lugar';

// Códigos de tiempo estándar (WMO) que devuelve Open-Meteo
function tiempo(codigo: number | null): { texto: string; Icono: React.ComponentType<{ className?: string }> } {
  if (codigo === null || codigo === undefined) return { texto: 'Sin dato', Icono: Cloud };
  if (codigo === 0) return { texto: 'Despejado', Icono: Sun };
  if (codigo === 1) return { texto: 'Mayormente despejado', Icono: CloudSun };
  if (codigo === 2) return { texto: 'Parcialmente nublado', Icono: CloudSun };
  if (codigo === 3) return { texto: 'Nublado', Icono: Cloud };
  if (codigo === 45 || codigo === 48) return { texto: 'Niebla', Icono: CloudFog };
  if (codigo >= 51 && codigo <= 57) return { texto: 'Llovizna', Icono: CloudDrizzle };
  if (codigo === 61 || codigo === 66) return { texto: 'Lluvia débil', Icono: CloudRain };
  if (codigo === 63 || codigo === 67) return { texto: 'Lluvia moderada', Icono: CloudRain };
  if (codigo === 65) return { texto: 'Lluvia fuerte', Icono: CloudRain };
  if (codigo >= 71 && codigo <= 77) return { texto: 'Nieve', Icono: Snowflake };
  if (codigo === 80 || codigo === 81) return { texto: 'Chaparrones', Icono: CloudRain };
  if (codigo === 82) return { texto: 'Chaparrones fuertes', Icono: CloudRain };
  if (codigo === 85 || codigo === 86) return { texto: 'Nevadas', Icono: Snowflake };
  if (codigo >= 95) return { texto: 'Tormenta', Icono: CloudLightning };
  return { texto: 'Variable', Icono: Cloud };
}

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

function redondear(valor: number | null): string {
  return valor === null || valor === undefined ? 's/d' : String(Math.round(valor));
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
  const [datos, setDatos] = useState<Pronostico | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
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
      .then((d) => {
        if (!cancelado) {
          setDatos({
            actual: d.actual ?? null,
            lluvia_24h_mm: d.lluvia_24h_mm ?? null,
            dias: d.dias ?? [],
          });
        }
      })
      .catch(() => {
        if (!cancelado) {
          setDatos(null);
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

  const elegir = (l: Lugar) => {
    setLugar(l);
    setConsulta('');
    setSugerencias([]);
    setAviso(null);
    try {
      localStorage.setItem(CLAVE_GUARDADA, JSON.stringify(l));
    } catch {
      /* si el navegador no deja guardar, seguimos igual */
    }
  };

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
        .then((d) => setSugerencias(d.resultados ?? []))
        .catch(() => setSugerencias([]));
    }, 300);
  };

  // Los atajos buscan el nombre y se quedan con el resultado de Chaco
  const elegirAtajo = async (nombre: string) => {
    setAviso(null);
    try {
      const r = await fetch(`${API}/pronostico/buscar?q=${encodeURIComponent(nombre)}`);
      const d = await r.json();
      const lista: Lugar[] = d.resultados ?? [];
      const deChaco = lista.find((l) => (l.provincia ?? '').toLowerCase().includes('chaco'));
      const elegido = deChaco ?? lista[0];
      if (elegido) elegir(elegido);
      else setAviso(`No encontramos "${nombre}". Probá escribiéndolo en el buscador.`);
    } catch {
      setAviso('No pudimos buscar el lugar. Probá de nuevo en unos minutos.');
    }
  };

  const usarMiUbicacion = () => {
    setAviso(null);
    if (!navigator.geolocation) {
      setAviso('Tu navegador no permite obtener la ubicación. Buscá tu localidad.');
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
      () => setAviso('No pudimos obtener tu ubicación. Buscá tu localidad.'),
      { timeout: 8000 }
    );
  };

  const dias = datos?.dias ?? [];
  const actual = datos?.actual ?? null;
  const maximoMm = Math.max(30, ...dias.map((d) => d.lluvia_mm ?? 0));
  const res = dias.length > 0 ? resumen(dias) : null;
  const estadoActual = actual ? tiempo(actual.codigo) : null;
  const lluvia24 = datos?.lluvia_24h_mm ?? null;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-cyan-900/60 bg-cyan-950/40 p-2.5 text-cyan-300">
          <CloudRain className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">El tiempo en tu localidad</h2>
          <p className="text-sm text-slate-400">
            Buscá tu localidad y mirá cómo está el tiempo, cuánto llovió y cuánto se espera que llueva.
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

      <div className="mt-3 flex flex-wrap gap-2">
        {ATAJOS.map((nombre) => (
          <button
            key={nombre}
            type="button"
            onClick={() => elegirAtajo(nombre)}
            className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs text-slate-300 hover:border-cyan-600 hover:text-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {nombre}
          </button>
        ))}
      </div>
      {aviso && <p className="mt-2 text-sm text-amber-300">{aviso}</p>}

      {cargando && (
        <p className="mt-5 text-sm text-slate-500">
          Buscando el pronóstico… la primera consulta puede tardar hasta un minuto.
        </p>
      )}

      {error && !cargando && (
        <div className="mt-5 rounded-lg border border-amber-700/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      )}

      {datos && !cargando && (
        <>
          {/* Tiempo actual */}
          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
            <p className="text-sm text-slate-400">
              Ahora en{' '}
              <span className="font-semibold text-slate-100">
                {lugar.nombre}
                {lugar.provincia ? `, ${lugar.provincia}` : ''}
              </span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-4">
                {estadoActual && <estadoActual.Icono className="h-12 w-12 text-cyan-300" />}
                <div>
                  <p className="text-4xl font-bold text-slate-100">
                    {actual?.temperatura !== null && actual?.temperatura !== undefined
                      ? `${Math.round(actual.temperatura)}°`
                      : 's/d'}
                  </p>
                  <p className="text-sm text-slate-300">{estadoActual?.texto}</p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-slate-500">Sensación térmica</dt>
                  <dd className="font-semibold text-slate-100">
                    {actual?.sensacion !== null && actual?.sensacion !== undefined
                      ? `${Math.round(actual.sensacion)}°`
                      : 's/d'}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs text-slate-500">
                    <Droplets className="h-3 w-3" /> Humedad
                  </dt>
                  <dd className="font-semibold text-slate-100">
                    {actual?.humedad !== null && actual?.humedad !== undefined ? `${Math.round(actual.humedad)}%` : 's/d'}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs text-slate-500">
                    <Wind className="h-3 w-3" /> Viento
                  </dt>
                  <dd className="font-semibold text-slate-100">
                    {actual?.viento_kmh !== null && actual?.viento_kmh !== undefined
                      ? `${Math.round(actual.viento_kmh)} km/h`
                      : 's/d'}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs text-slate-500">
                    <CloudRain className="h-3 w-3" /> Lluvia 24 h
                  </dt>
                  <dd className="font-semibold text-slate-100">
                    {lluvia24 === null ? 's/d' : lluvia24 < 0.5 ? 'Sin lluvia' : `${lluvia24} mm`}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Resumen de la semana */}
          {res && (
            <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${ESTILO_RESUMEN[res.nivel]}`}>
              {res.texto}
            </div>
          )}

          {/* Pronóstico a 7 días */}
          <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7 sm:gap-3">
            {dias.map((d, i) => {
              const mm = d.lluvia_mm ?? 0;
              const alto = Math.max(4, Math.round((Math.min(mm, maximoMm) / maximoMm) * 100));
              const t = tiempo(d.codigo);
              return (
                <div
                  key={d.fecha}
                  className="flex flex-col items-center rounded-lg border border-slate-800/80 bg-slate-900/40 px-1 py-2 text-center"
                >
                  <span className="text-xs font-semibold capitalize text-slate-200">
                    {etiquetaDia(d.fecha, i)}
                  </span>
                  <span className="text-[11px] text-slate-500">{fechaCorta(d.fecha)}</span>
                  <t.Icono className="my-1.5 h-6 w-6 text-cyan-300" />
                  <span className="text-xs text-slate-100">
                    {redondear(d.tmax)}° <span className="text-slate-500">/ {redondear(d.tmin)}°</span>
                  </span>
                  <div className="my-2 flex h-20 w-full items-end justify-center rounded-md bg-slate-900/80 px-2 pb-1">
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
        Datos de un modelo meteorológico (Open-Meteo), no de una estación de medición ni un aviso oficial. Los
        milímetros son por día: una lluvia concentrada en pocas horas es más peligrosa que la misma cantidad
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
