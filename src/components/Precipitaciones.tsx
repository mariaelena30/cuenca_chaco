import React, { useEffect, useState } from 'react';
import { CloudRain } from 'lucide-react';
import { obtenerPrecipitacion, PrecipitacionLocalidad } from '../services/api';

// El actualizador corre cada 3 horas: pasadas 12 h, el dato se considera viejo.
const HORAS_MAXIMAS_VIGENTE = 12;

function aFecha(verificacion: string | null): Date | null {
  if (!verificacion) return null;
  const fecha = new Date(verificacion.replace(' UTC', 'Z').replace(' ', 'T'));
  return isNaN(fecha.getTime()) ? null : fecha;
}

function formatoHora(verificacion: string | null): string {
  const fecha = aFecha(verificacion);
  if (!fecha) return 'sin registro';
  return fecha.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const Precipitaciones: React.FC = () => {
  const [datos, setDatos] = useState<Record<string, PrecipitacionLocalidad> | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      try {
        const respuesta = await obtenerPrecipitacion();
        if (activo) {
          setDatos(respuesta);
          setError(false);
        }
      } catch {
        if (activo) setError(true);
      }
    };
    cargar();
    const intervalo = setInterval(cargar, 5 * 60 * 1000);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, []);

  const filas = datos
    ? Object.entries(datos).map(([clave, d]) => {
        const fecha = aFecha(d.verificacion);
        const horas = fecha ? (Date.now() - fecha.getTime()) / 3600000 : null;
        const vigente =
          d.precipitacion_mm_24h !== null && horas !== null && horas <= HORAS_MAXIMAS_VIGENTE;
        return { clave, ...d, vigente };
      })
    : [];

  filas.sort((a, b) => {
    if (a.vigente !== b.vigente) return a.vigente ? -1 : 1;
    if (a.vigente && b.vigente) {
      return (b.precipitacion_mm_24h ?? 0) - (a.precipitacion_mm_24h ?? 0);
    }
    return a.nombre.localeCompare(b.nombre);
  });

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-800/60 text-sky-300 shrink-0">
          <CloudRain className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Lluvia de las últimas 24 horas
          </h2>
          <p className="text-xs text-slate-400">
            Estimación de un modelo meteorológico (Open-Meteo), no una medición de pluviómetro. Por sí
            sola no indica si habrá anegamientos: depende de la intensidad, el suelo y el desagüe.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-amber-300 bg-amber-950/40 border border-amber-800/50 rounded-lg p-3">
          No pudimos obtener los datos de lluvia en este momento. Consultá los avisos oficiales del SMN
          y de Defensa Civil (103).
        </p>
      )}

      {!error && datos === null && <p className="text-xs text-slate-400">Cargando…</p>}

      {filas.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filas.map((f) => (
            <div
              key={f.clave}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1"
            >
              <div className="text-xs font-bold text-white leading-tight">{f.nombre}</div>
              {f.vigente ? (
                <div className="text-2xl font-black font-mono text-sky-300">
                  {f.precipitacion_mm_24h?.toFixed(1)} <span className="text-xs font-normal">mm</span>
                </div>
              ) : (
                <div className="text-sm font-bold text-slate-500">
                  {f.precipitacion_mm_24h === null ? 'SIN DATO' : 'DESACTUALIZADO'}
                </div>
              )}
              <div className="text-[10px] text-slate-500">
                {f.fuente ? `${f.fuente} • ` : ''}
                {formatoHora(f.verificacion)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
        <div className="text-xs font-bold text-white">Qué dicen los estudios de la UNNE</div>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
          <li>
            El Gran Resistencia es casi plano (pocos centímetros de pendiente por kilómetro), por eso
            el agua de lluvia drena con dificultad. Los autores dan un ejemplo: una lluvia de 25 mm en
            media hora puede paralizar la ciudad durante horas. Además de la lluvia, influyen el
            relleno de lagunas y los desagües que quedaron chicos.
          </li>
          <li>
            En la provincia, las inundaciones por lluvia fueron más frecuentes entre enero y abril. La
            peligrosidad es mayor en el centro-este y menor en el extremo noroeste.
          </li>
          <li>
            Entre 1955 y 2009, los años con inundaciones pluviales importantes fueron 1966, 1967,
            1973, 1983, 1986, 1989, 1996, 1998 y 2002.
          </li>
        </ul>
        <p className="text-[10px] text-slate-500">
          Fuentes: Pilar, Depettris, Ruberto, Gómez y Soto (2017), «Urbanización e impacto hidrológico
          cero en la ciudad de Resistencia, Chaco», XXVI Congreso Nacional del Agua. Gómez, Pérez y
          Prause (2014), «Áreas de riesgo de inundación pluvial en la provincia del Chaco», FACENA,
          vol. 30. Son estudios históricos: no predicen lo que va a pasar hoy.
        </p>
      </div>
    </div>
  );
};
