import React from 'react';
import {
  Cuenca,
  Localidad,
  EstacionHidrometrica,
  BarrioVulnerable,
} from '../types';
import { LocalitiesCarousel } from './LocalitiesCarousel';
import { BasinDynamicCards } from './BasinDynamicCards';
import { VulnerableAreasGrid } from './VulnerableAreasGrid';
import { MapaClimaGlobal } from './MapaClimaGlobal';
import { Precipitaciones } from './Precipitaciones';

interface MonitoringDashboardProps {
  cuencas: Record<string, Cuenca>;
  localidades: Record<string, Localidad>;
  estaciones: EstacionHidrometrica[];
  barrios: Record<string, BarrioVulnerable>;
  onSelectCuenca: (cuenca: Cuenca) => void;
  onSelectLocalidad: (loc: Localidad) => void;
  onNavigateToMap?: (lat?: number, lon?: number) => void;
  onOpenScanner?: (barrioId?: string) => void;
  // Props sin uso por ahora (la sección de ayuda se sacó de esta pantalla).
  onOpenSOS?: () => void;
  onOpenReport?: () => void;
  onOpenTelefonos?: () => void;
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  cuencas,
  localidades,
  barrios,
  onSelectCuenca,
  onSelectLocalidad,
  onNavigateToMap,
  onOpenScanner,
}) => {
  return (
    <div className="space-y-6 pb-10">
      {/* 1. Las cuencas hidrográficas del Chaco */}
      <section>
        <BasinDynamicCards
          cuencas={cuencas}
          onSelectCuenca={onSelectCuenca}
        />
      </section>

      {/* 2. Consulta rápida por localidad */}
      <section>
        <LocalitiesCarousel
          localidades={localidades}
          onSelectLocalidad={onSelectLocalidad}
          onNavigateToMap={onNavigateToMap}
        />
      </section>

      {/* 3. Zonas vulnerables y localidades críticas */}
      <section>
        <VulnerableAreasGrid
          barrios={barrios}
          localidades={localidades}
          onNavigateToMap={onNavigateToMap}
          onOpenScanner={onOpenScanner}
        />
      </section>

      {/* 4. Clima en vivo (Windy) */}
      <section>
        <MapaClimaGlobal />
      </section>

      {/* 5. Lluvia de las últimas 24 horas */}
      <section>
        <Precipitaciones />
      </section>
    </div>
  );
};
