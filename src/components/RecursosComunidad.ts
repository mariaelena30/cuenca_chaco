import React from 'react';
import { GuiaAccionInundacion, NumerosUtilesEmergencia } from './GuiaAccionInundacion';
import { PueblosOriginarios } from './PueblosOriginarios';
import { Localidad } from '../types';

interface RecursosComunidadProps {
  localidades: Record<string, Localidad>;
}

/**
 * Pestana "Recursos": todo lo que no es monitoreo en vivo pero es util
 * para la comunidad (clima, guia de que hacer/no hacer, telefonos,
 * informacion de pueblos originarios). Se separo de "Monitoreo & Cuencas"
 * porque hacia esa pantalla principal demasiado larga para una emergencia
 * real -- la gente no deberia tener que scrollear mucho para ver el
 * estado de los rios o reportar algo.
 */
export const RecursosComunidad: React.FC<RecursosComunidadProps> = ({ localidades }) => {
  return (
    <div className="space-y-6 pb-10">
      <section><MapaClimaGlobal /></section>
      <section><GuiaAccionInundacion /></section>
      <section><NumerosUtilesEmergencia /></section>
      <section><PueblosOriginarios localidades={localidades} /></section>
    </div>
  );
};
