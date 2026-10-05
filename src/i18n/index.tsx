import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { es } from './es';
import type { ClaveTexto } from './es';
import { qom } from './qom';

export type { ClaveTexto };
export type IdiomaId = 'es' | 'qom';

export interface IdiomaInfo {
  id: IdiomaId;
  nombre: string; // se muestra en el propio idioma
  revisado: boolean;
}

// IMPORTANTE: "revisado" se pone en true SOLO cuando una persona hablante
// de la comunidad revisó y aprobó las traducciones. Mientras sea false, el
// botón de idioma no aparece. El nombre del idioma también hay que
// confirmarlo con la comunidad.
export const IDIOMAS: IdiomaInfo[] = [
  { id: 'es', nombre: 'Español', revisado: true },
  { id: 'qom', nombre: "Qom l'aqtaqa", revisado: false },
];

const CLAVE_ALMACEN = 'portal_idioma';
const DICCIONARIOS: Record<IdiomaId, Partial<Record<ClaveTexto, string>>> = { es, qom };

interface ContextoIdioma {
  idioma: IdiomaId;
  setIdioma: (id: IdiomaId) => void;
  t: (clave: ClaveTexto) => string;
  idiomasDisponibles: IdiomaInfo[];
}

const Contexto = createContext<ContextoIdioma | null>(null);

function leerIdiomaGuardado(): IdiomaId {
  try {
    const guardado = window.localStorage.getItem(CLAVE_ALMACEN);
    const info = IDIOMAS.find((i) => i.id === guardado);
    if (info && info.revisado) return info.id;
  } catch {
    // sin almacenamiento disponible: se usa español
  }
  return 'es';
}

export const IdiomaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [idioma, setIdiomaEstado] = useState<IdiomaId>(leerIdiomaGuardado);

  const setIdioma = useCallback((id: IdiomaId) => {
    setIdiomaEstado(id);
    try {
      window.localStorage.setItem(CLAVE_ALMACEN, id);
    } catch {
      // se ignora: el idioma igual cambia en esta sesión
    }
  }, []);

  const t = useCallback(
    (clave: ClaveTexto): string => {
      const propio = idioma === 'es' ? undefined : DICCIONARIOS[idioma][clave];
      return propio && propio.trim() !== '' ? propio : es[clave];
    },
    [idioma]
  );

  const valor = useMemo<ContextoIdioma>(
    () => ({
      idioma,
      setIdioma,
      t,
      idiomasDisponibles: IDIOMAS.filter((i) => i.revisado),
    }),
    [idioma, setIdioma, t]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
};

export function useIdioma(): ContextoIdioma {
  const ctx = useContext(Contexto);
  if (!ctx) {
    throw new Error('useIdioma debe usarse dentro de IdiomaProvider');
  }
  return ctx;
}
