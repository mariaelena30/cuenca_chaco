import React from 'react';

interface NotaPueblosOriginariosProps {
  variante: 'cuencas' | 'zonas_afectadas';
}

/**
 * Nota breve y basada en hechos sobre las comunidades Qom y Wichí en las
 * cuencas monitoreadas por este portal. No pretende hablar "en nombre de"
 * nadie — solo señala dónde viven y qué ríos las afectan, con fuentes
 * reales. Antes de expandir este texto, lo ideal es que lo revise alguien
 * Qom o Wichí, o una organización como ENDEPA o FAPI.
 */
export const NotaPueblosOriginarios: React.FC<NotaPueblosOriginariosProps> = ({ variante }) => {
  const texto =
    variante === 'cuencas'
      ? 'La cuenca del río Bermejo, que este portal monitorea, es también el territorio del pueblo Wichí en El Impenetrable chaqueño (El Sauzalito, Villa Río Bermejito, Fuerte Esperanza).'
      : 'Resistencia incluye al Barrio Toba (Nam Qom), una de las comunidades Qom más numerosas del Chaco. Las localidades de El Impenetrable listadas arriba son territorio Wichí.';

  return (
    <p className="text-[11px] text-slate-500 italic mt-2 px-1">
      {texto}
    </p>
  );
};
