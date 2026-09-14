import React from 'react';
import { InteractiveMap } from './InteractiveMap';
import { MapaInfraestructura } from './MapaInfraestructura';
import { Cuenca, Localidad, EstacionHidrometrica, BarrioVulnerable, TicketSOS, ReporteCiudadano } from '../types';
import { BARRIOS_BARRANQUERAS, BARRIOS_VILELAS } from '../data/barriosVulnerables';

interface Props {
  cuencas: Record<string, Cuenca>;
  localidades: Record<string, Localidad>;
  estaciones: EstacionHidrometrica[];
  barrios: Record<string, BarrioVulnerable>; // todos los barrios (mapa general)
  ticketsSOS: TicketSOS[];
  reportes: ReporteCiudadano[];
}

// Centro aproximado de Barranqueras + Puerto Vilelas juntas
const CENTRO_BARRANQUERAS_VILELAS: [number, number] = [-27.495, -58.93];

// Centro aproximado de todo el AMGR (para el mapa de infraestructura)
const CENTRO_AMGR: [number, number] = [-27.475, -58.96];

export const MapasVulnerabilidad: React.FC<Props> = ({
  cuencas,
  localidades,
  estaciones,
  barrios,
  ticketsSOS,
  reportes,
}) => {
  // Solo los barrios de Barranqueras y Vilelas, para el segundo mapa
  const barriosBarranquerasYVilelas: Record<string, BarrioVulnerable> = {
    ...BARRIOS_BARRANQUERAS,
    ...BARRIOS_VILELAS,
  };

  return (
    <div className="space-y-8">
      {/* MAPA 1: General, toda la provincia junta */}
      <section>
        <h2 className="text-base font-bold text-white mb-2">Mapa general — Toda la provincia</h2>
        <InteractiveMap
          cuencas={cuencas}
          localidades={localidades}
          estaciones={estaciones}
          barrios={barrios}
          ticketsSOS={ticketsSOS}
          reportes={reportes}
        />
      </section>

      {/* MAPA 2: Zoom en Barranqueras + Vilelas, las localidades mas vulnerables */}
      <section>
        <h2 className="text-base font-bold text-white mb-2">
          Barranqueras y Puerto Vilelas — Barrios vulnerables (RENABAP)
        </h2>
        <InteractiveMap
          cuencas={cuencas}
          localidades={localidades}
          estaciones={estaciones}
          barrios={barriosBarranquerasYVilelas}
          ticketsSOS={ticketsSOS}
          reportes={reportes}
          centroInicial={CENTRO_BARRANQUERAS_VILELAS}
          zoomInicial={13}
        />
      </section>

      {/* MAPA 3: Infraestructura hídrica — bombeo, lagunas y ríos (fuente: APA) */}
      <section>
        <h2 className="text-base font-bold text-white mb-2">
          Sistema de bombeo, lagunas y ríos (AMGR — APA)
        </h2>
        <p className="text-xs text-slate-400 mb-3">
          Estaciones de bombeo, obras de control, lagunas de oxidación y cursos de agua del Área
          Metropolitana del Gran Resistencia. Algunas ubicaciones son aproximadas — ver aviso en el mapa.
        </p>
        <MapaInfraestructura
          centroInicial={CENTRO_AMGR}
          zoomInicial={12}
        />
      </section>
    </div>
  );
};
