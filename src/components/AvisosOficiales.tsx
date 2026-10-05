import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { AVISOS_OFICIALES } from '../data/avisosOficiales';

export const AvisosOficiales: React.FC = () => {
  const ahora = Date.now();
  const vigentes = AVISOS_OFICIALES.filter((a) => {
    const borrador = JSON.stringify(a).includes('COMPLETAR');
    return !borrador && new Date(a.venceEl).getTime() >= ahora;
  });

  if (vigentes.length === 0) return null;

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-2">
      {vigentes.map((a) => (
        <div
          key={a.id}
          className="rounded-lg border border-amber-600/70 bg-amber-950/50 px-4 py-3 text-amber-100"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-sm font-bold">{a.titulo}</div>
              <p className="text-sm">{a.texto}</p>
              <div className="text-[11px] text-amber-300/80">
                Fuente: {a.fuente} • {a.fecha}
                {a.enlace && (
                  <>
                    {' • '}
                    <a
                      href={a.enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Ver aviso oficial
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
