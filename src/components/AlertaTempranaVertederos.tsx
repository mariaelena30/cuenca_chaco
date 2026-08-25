import React, { useEffect, useState } from 'react';
import { obtenerVertederos, obtenerNotaTecnicaENSO, EstadoVertederos, NotaTecnicaENSO } from '../services/api';

const ESTILO_ESTADO: Record<string, { texto: string; clase: string }> = {
  ABIERTO: { texto: 'Vertedero ABIERTO', clase: 'bg-rose-950/70 text-rose-200 border-rose-800/60' },
  CERRADO: { texto: 'Vertedero cerrado', clase: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' },
  SIN_DATOS_RECIENTES: { texto: 'Sin datos recientes', clase: 'bg-slate-800 text-slate-400 border-slate-700' },
  SIN_NOTICIAS_RECIENTES: { texto: 'Sin noticias recientes', clase: 'bg-slate-800 text-slate-400 border-slate-700' },
  DESCONOCIDO: { texto: 'Estado desconocido', clase: 'bg-slate-800 text-slate-400 border-slate-700' },
};

export function AlertaTempranaVertederos() {
  const [vertederos, setVertederos] = useState<EstadoVertederos | null>(null);
  const [notaTecnica, setNotaTecnica] = useState<NotaTecnicaENSO | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.allSettled([obtenerVertederos(), obtenerNotaTecnicaENSO()]).then(([resV, resN]) => {
      if (resV.status === 'fulfilled') setVertederos(resV.value);
      if (resN.status === 'fulfilled') setNotaTecnica(resN.value);
      setCargando(false);
    });
  }, []);

  if (cargando) return null; // no ocupar espacio mientras carga
  if (!vertederos && !notaTecnica) return null; // backend no respondio nada, no mostrar seccion vacia

  return (
    <section className="px-4 sm:px-8 py-4 bg-slate-900/60 border-b border-slate-800">
      <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        Alerta temprana — aguas arriba
      </h2>

      {vertederos?.alerta_temprana?.hay_alerta && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-200 text-sm">
          {vertederos.alerta_temprana.avisos.map((aviso, i) => (
            <div key={i}>⚠️ {aviso}</div>
          ))}
        </div>
      )}

      {vertederos && Object.keys(vertederos.vertederos).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {(Object.entries(vertederos.vertederos) as [string, typeof vertederos.vertederos[string]][]).map(([clave, v]) => {
            const estilo = ESTILO_ESTADO[v.estado] || ESTILO_ESTADO.DESCONOCIDO;
            return (
              <div key={clave} className={`px-3 py-2 rounded-lg border text-xs ${estilo.clase}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">{v.nombre}</span>
                  <span className="font-mono uppercase tracking-wide">{estilo.texto}</span>
                </div>
                {v.dias_desde_evento !== undefined && v.estado !== 'SIN_DATOS_RECIENTES' && (
                  <div className="text-slate-400">
                    hace {v.dias_desde_evento} día(s)
                    {v.dias_hasta_corrientes_aprox && ` · impacto estimado en Corrientes/Chaco: ${v.dias_hasta_corrientes_aprox}`}
                  </div>
                )}
                {v.detalle && <div className="text-slate-500 mt-1">{v.detalle}</div>}
              </div>
            );
          })}
        </div>
      )}

      {notaTecnica?.encontrada && (
        <a
          href={notaTecnica.url_doi || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-3 py-2 rounded-lg bg-sky-950/40 border border-sky-800/50 text-sky-200 text-xs hover:bg-sky-900/50 transition-colors"
        >
          <span className="font-bold">Nota Técnica {notaTecnica.numero || ''} (UNNE/UFSM/APA Chaco)</span>
          {' — '}
          <span className="text-sky-300 underline">ver documento oficial</span>
        </a>
      )}
    </section>
  );
}
