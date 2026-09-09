import { useState } from "react";
import { Droplets, Waves, ShieldAlert, Info, Flame } from "lucide-react";

const DEFENSAS = [
  { nombre: "Presa Frontal Laguna Blanca", tipo: "Dique", cota: null },
  { nombre: "Canal Derivador Río Negro – Río Salado", tipo: "Canal", cota: null },
  { nombre: "Defensa Oeste", tipo: "Terraplén", cota: 52.0 },
  { nombre: "Defensa Norte", tipo: "Terraplén", cota: 52.0 },
  { nombre: "Defensa Barranqueras–Vilelas", tipo: "Terraplén", cota: 52.0 },
  { nombre: "Defensa Sur", tipo: "Terraplén", cota: 52.0 },
  { nombre: "Compuertas y Est. de Bombeo Barranqueras", tipo: "Compuerta/Bombeo", cota: null },
  { nombre: "Estación de Bombeo Vilelas", tipo: "Bombeo", cota: null },
];

const BARRIOS = [
  { nombre: "Villa Los Lirios", motivo: "río", nivel: "alto", fuente: "Modelación HEC-1 (Bravo & Pilar, 2003)" },
  { nombre: "Zona Laguna Ávalos", motivo: "lluvia", nivel: "alto", fuente: "Eje de desagüe pluvial, UNNE" },
  { nombre: "Lagunas Argüello–Navarro–Prosperidad", motivo: "lluvia", nivel: "medio", fuente: "Res. APA 1111/98, 303/09" },
  { nombre: "Subcuenca Wilde–Pueyrredón", motivo: "lluvia", nivel: "medio", fuente: "HEC-1 (2004)" },
  { nombre: "Puerto Vilelas", motivo: "ambos", nivel: "alto", fuente: "Estudio vulnerabilidad UNNE" },
  { nombre: "General José de San Martín", motivo: "lluvia", nivel: "medio", fuente: "Meza & Ramírez, 2018" },
];

const NIVEL_COLOR = {
  alto: "border-l-4 border-l-rose-500 bg-white",
  medio: "border-l-4 border-l-amber-500 bg-white",
  bajo: "border-l-4 border-l-emerald-500 bg-white",
};

const NIVEL_TEXTO = {
  alto: "text-rose-700",
  medio: "text-amber-700",
  bajo: "text-emerald-700",
};

export default function PanelRiesgoHidrico() {
  const [filtro, setFiltro] = useState("todos");

  const barriosFiltrados = BARRIOS.filter(
    (b) => filtro === "todos" || b.motivo === filtro || b.motivo === "ambos"
  );

  return (
    <div className="min-h-screen bg-slate-50">
    <div className="max-w-2xl mx-auto p-4 space-y-6 font-sans">
      <header className="bg-gradient-to-r from-sky-900 to-sky-700 -mx-4 -mt-4 px-4 pt-6 pb-5 mb-2 rounded-b-2xl text-white">
        <h1 className="text-xl font-bold">Portal Hídrico Chaco</h1>
        <p className="text-sm text-sky-100">Zonas con riesgo hídrico documentado — AMGR</p>
        <p className="text-xs text-sky-200 flex items-center gap-1 mt-3">
          <Flame size={12} /> Operado por María Elena Álvarez, bombera voluntaria
        </p>
      </header>

      <div className="flex gap-2">
        {[
          { key: "todos", label: "Todos" },
          { key: "río", label: "Río", icon: Waves },
          { key: "lluvia", label: "Lluvia", icon: Droplets },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFiltro(t.key)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              filtro === t.key
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-600 border-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <section className="space-y-2">
        {barriosFiltrados.map((b) => (
          <div
            key={b.nombre}
            className={`rounded-r-lg rounded-l-sm p-3 shadow-sm ${NIVEL_COLOR[b.nivel]}`}
          >
            <div className="flex justify-between items-start">
              <span className="font-medium text-slate-800 flex items-center gap-1.5">
                {b.motivo === "lluvia" ? <Droplets size={14} className="text-sky-500" /> : <Waves size={14} className="text-sky-500" />}
                {b.nombre}
              </span>
              <span className={`text-xs font-semibold uppercase ${NIVEL_TEXTO[b.nivel]}`}>{b.nivel}</span>
            </div>
            <p className="text-xs mt-1 text-slate-500">{b.fuente}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-1 mb-2">
          <ShieldAlert size={16} /> Sistema de defensas (AMGR)
        </h2>
        <div className="space-y-1">
          {DEFENSAS.map((d) => (
            <div key={d.nombre} className="flex justify-between text-sm border-b border-slate-100 py-1">
              <span className="text-slate-700">{d.nombre}</span>
              <span className="text-slate-500">
                {d.cota ? `${d.cota} m MOP` : d.tipo}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
          <Info size={12} /> Límite operativo Barranqueras: 9,5 m. Fuente: Roces (UNNE).
        </p>
      </section>
    </div>
    </div>
  );
}
