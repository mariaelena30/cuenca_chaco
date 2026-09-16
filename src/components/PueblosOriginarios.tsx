import React, { useState } from 'react';
import { Localidad } from '../types';
import { Users, Droplets, MapPin, ExternalLink, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Apartado de comunidades Qom y Wichí — versión grande y visual (14/09/2026,
 * reemplaza a NotaPueblosOriginarios.tsx, que era una linea de texto chica).
 *
 * PRINCIPIO QUE SE MANTIENE DE LA VERSION ANTERIOR: esto describe HECHOS
 * (donde viven, que rios las afectan) con fuentes reales, no habla "en
 * nombre de" nadie. Antes de publicar, lo ideal es que alguien Qom o
 * Wichi lo revise, o una organizacion como ENDEPA o FAPI.
 *
 * QUE LO HACE DINAMICO: la pestaña Wichí muestra el nivel EN VIVO del
 * río Bermejo en El Sauzalito (si se le pasa el dato de localidades),
 * en vez de un texto fijo - así la info cultural queda pegada a un dato
 * real que cambia, no a un párrafo estático.
 */

interface PueblosOriginariosProps {
  localidades?: Record<string, Localidad>;
}

type Pueblo = 'qom' | 'wichi';

export const PueblosOriginarios: React.FC<PueblosOriginariosProps> = ({ localidades }) => {
  const [activo, setActivo] = useState<Pueblo>('qom');

  const elSauzalito = localidades?.['el_sauzalito'];
  const villaRioBermejito = localidades?.['villa_rio_bermejito'];
  const fuerteEsperanza = localidades?.['fuerte_esperanza'];
  const barranqueras = localidades?.['barranqueras'];

  const tendenciaIcono = (loc?: Localidad) => {
    if (!loc || loc.tasa_cambio_m_dia === undefined) return <Minus className="w-3.5 h-3.5 text-slate-500" />;
    if (loc.tasa_cambio_m_dia > 0.02) return <TrendingUp className="w-3.5 h-3.5 text-rose-400" />;
    if (loc.tasa_cambio_m_dia < -0.02) return <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-700/90 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Pueblos Qom y Wichí del Chaco
          </h2>
          <p className="text-xs text-slate-400">
            Las cuencas que este portal monitorea son también su territorio
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActivo('qom')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${
            activo === 'qom'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50'
              : 'bg-slate-950/60 text-slate-400 border border-slate-800'
          }`}
        >
          Pueblo Qom
        </button>
        <button
          onClick={() => setActivo('wichi')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${
            activo === 'wichi'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-950/50'
              : 'bg-slate-950/60 text-slate-400 border border-slate-800'
          }`}
        >
          Pueblo Wichí
        </button>
      </div>

      {activo === 'qom' && (
        <div className="space-y-3">
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white">Barrio Toba (Nam Qom) — Resistencia</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Una de las comunidades Qom más numerosas del Chaco vive dentro de la propia ciudad de
              Resistencia, en el Barrio Toba, hoy también llamado Nam Qom. Se calcula que hay unos
              60.000 Qom viviendo en Chaco y Formosa.
            </p>
          </div>

          {barranqueras && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-400" />
                <span className="text-xs text-slate-300">Río Paraná en Barranqueras (misma zona)</span>
              </div>
              <div className="flex items-center gap-1.5">
                {tendenciaIcono(barranqueras)}
                <span className="text-sm font-bold text-white">{barranqueras.nivel_metros?.toFixed(2)} m</span>
              </div>
            </div>
          )}
        </div>
      )}

      {activo === 'wichi' && (
        <div className="space-y-3">
          <div className="bg-teal-950/30 border border-teal-800/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-bold text-white">El Impenetrable — cuenca del río Bermejo</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              El pueblo Wichí está concentrado en el oeste de la provincia, en El Impenetrable, a lo
              largo del río Bermejo — un río que puede subir hasta seis metros en pocos días durante
              la temporada de lluvias. Tres localidades que este portal monitorea son territorio Wichí.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { nombre: 'El Sauzalito', loc: elSauzalito },
              { nombre: 'Villa Río Bermejito', loc: villaRioBermejito },
              { nombre: 'Fuerte Esperanza', loc: fuerteEsperanza },
            ].map(({ nombre, loc }) => (
              <div key={nombre} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-[11px] font-semibold text-slate-300 truncate">{nombre}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {tendenciaIcono(loc)}
                  <span className="text-lg font-bold text-white">
                    {loc?.nivel_metros !== undefined && loc?.nivel_metros !== null
                      ? `${loc.nivel_metros.toFixed(2)} m`
                      : 'sin dato'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aviso de fuente y buena práctica, siempre visible abajo */}
      <div className="flex items-start gap-2 pt-2 border-t border-slate-800">
        <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Contenido descriptivo basado en hechos y fuentes públicas — no habla en nombre de estas
          comunidades. Antes de ampliarlo, lo ideal es que lo revise alguien Qom o Wichí, o una
          organización como{' '}
          <a
            href="https://endepa.org.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-400 hover:underline inline-flex items-center gap-0.5"
          >
            ENDEPA <ExternalLink className="w-2.5 h-2.5" />
          </a>{' '}
          o la Federación por la Autodeterminación de los Pueblos Indígenas (FAPI).
        </p>
      </div>
    </div>
  );
};
