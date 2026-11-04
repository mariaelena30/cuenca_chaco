import React from 'react';
import { GuiaAccionInundacion, NumerosUtilesEmergencia } from './GuiaAccionInundacion';
import { PrimerosAuxiliosAnimales } from './PrimerosAuxiliosAnimales';
import { Localidad } from '../types';

interface RecursosComunidadProps {
  // Se conserva la prop para no tocar App.tsx, aunque esta pestaña ya no la usa.
  localidades?: Record<string, Localidad>;
}

/**
 * Pestana "Recursos": todo lo que no es monitoreo en vivo pero es util
 * para la comunidad (guia de que hacer/no hacer ante una inundacion,
 * telefonos y primeros auxilios ante animales venenosos). Se separo de
 * "Monitoreo & Cuencas" porque hacia esa pantalla principal demasiado
 * larga para una emergencia real.
 *
 * Se quito la seccion de pueblos originarios (04/11/2026).
 */
export const RecursosComunidad: React.FC<RecursosComunidadProps> = () => {
  return (
    <div className="space-y-6 pb-10">
      <section><GuiaAccionInundacion /></section>
      <section><NumerosUtilesEmergencia /></section>
      <section><PrimerosAuxiliosAnimales /></section>
    </div>
  );
};
