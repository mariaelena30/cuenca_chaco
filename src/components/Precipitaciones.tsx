import React from 'react';
import { PronosticoLluvia } from './PronosticoLluvia';

// Sección de precipitaciones del portal.
// Antes mostraba una grilla de tarjetas con "SIN DATO". Ahora muestra el
// tiempo y la lluvia de la localidad que elija la persona, y conserva el
// cuadro de estudios de la UNNE.
export const Precipitaciones: React.FC = () => {
  return (
    <div className="space-y-4">
      <PronosticoLluvia />

      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
        <div className="text-xs font-bold text-white">Qué dicen los estudios de la UNNE</div>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
          <li>
            El Gran Resistencia es casi plano (pocos centímetros de pendiente por kilómetro), por eso
            el agua de lluvia drena con dificultad. Los autores dan un ejemplo: una lluvia de 25 mm en
            media hora puede paralizar la ciudad durante horas. Además de la lluvia, influyen el
            relleno de lagunas y los desagües que quedaron chicos.
          </li>
          <li>
            En la provincia, las inundaciones por lluvia fueron más frecuentes entre enero y abril. La
            peligrosidad es mayor en el centro-este y menor en el extremo noroeste.
          </li>
          <li>
            Entre 1955 y 2009, los años con inundaciones pluviales importantes fueron 1966, 1967,
            1973, 1983, 1986, 1989, 1996, 1998 y 2002.
          </li>
        </ul>
        <p className="text-[10px] text-slate-500">
          Fuentes: Pilar, Depettris, Ruberto, Gómez y Soto (2017), «Urbanización e impacto hidrológico
          cero en la ciudad de Resistencia, Chaco», XXVI Congreso Nacional del Agua. Gómez, Pérez y
          Prause (2014), «Áreas de riesgo de inundación pluvial en la provincia del Chaco», FACENA,
          vol. 30. Son estudios históricos: no predicen lo que va a pasar hoy.
        </p>
      </div>
    </div>
  );
};
