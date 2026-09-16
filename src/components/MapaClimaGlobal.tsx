import React, { useState } from 'react';
import { CloudRain, Wind } from 'lucide-react';

/**
 * Mapa climático regional en vivo, vía el embed público y gratuito de
 * Windy.com (no necesita API key ni cuenta). A diferencia de
 * actualizar_vertederos.py (que scrapea noticias y puede fallar en
 * silencio), esto es la página de Windy corriendo en vivo dentro de un
 * iframe — si Windy está online, esto funciona, sin depender de que
 * nuestro propio script detecte bien un texto de noticia.
 *
 * Zoom puesto para ver Chaco + sur de Brasil + Paraguay juntos (para
 * poder ver, por ejemplo, si se viene lluvia fuerte desde la cuenca
 * alta del Paraná antes de que llegue).
 */
export const MapaClimaGlobal: React.FC = () => {
  const [capa, setCapa] = useState<'rain' | 'wind'>('rain');

  const src = `https://embed.windy.com/embed2.html?lat=-24.5&lon=-56.5&detailLat=-27.48&detailLon=-58.93&width=650&height=450&zoom=5&level=surface&overlay=${capa}&product=ecmwf&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Lluvia y viento en tiempo real — región Chaco / Brasil / Paraguay
          </h2>
          <p className="text-xs text-slate-400">
            Vista en vivo (Windy.com) — no depende de que nuestros propios scripts detecten nada.
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setCapa('rain')}
            className={`p-2 rounded-lg border transition-colors ${
              capa === 'rain' ? 'bg-sky-600 border-sky-500 text-white' : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
            title="Lluvia"
          >
            <CloudRain className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCapa('wind')}
            className={`p-2 rounded-lg border transition-colors ${
              capa === 'wind' ? 'bg-sky-600 border-sky-500 text-white' : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
            title="Viento"
          >
            <Wind className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-800">
        <iframe
          key={capa}
          title="Mapa climático en vivo (Windy)"
          src={src}
          width="100%"
          height="420"
          frameBorder="0"
          loading="lazy"
        />
      </div>

      <p className="text-[10px] text-slate-500">
        Fuente: Windy.com (modelo ECMWF). Uso del embed gratuito para sitios de medios/información pública.
      </p>
    </div>
  );
};
