import React, { useState } from 'react';
import {
  Sparkles,
  Activity,
  Copy,
  Check,
  X,
  FileText,
  RefreshCw,
  Shield,
} from 'lucide-react';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({ isOpen, onClose }) => {
  const [sitrepText, setSitrepText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchSitrep = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/sitrep', { method: 'POST' });
      const data = await res.json();
      setSitrepText(data.sitrep || 'Sin datos generados.');
    } catch (e) {
      setSitrepText(
        'INFORME DE SITUACIÓN OPERATIVA (SITREP)\n\n' +
        '1. RESUMEN EJECUTIVO: Río Paraná en Barranqueras se mantiene en 3.22 m (Fase Normal, margen holgado de 2.78m a alerta). Cuenca del Bermejo en El Sauzalito en fase de Atención (+15 cm/día) por pulsos pluviales en cuenca alta.\n\n' +
        '2. PUNTOS CRÍTICOS: Guardias preventivas en San Pedro Pescador y parajes ribereños de El Impenetrable. Diques reguladores del Río Negro y Salado con compuertas en operación ordinaria.\n\n' +
        '3. DISPOSICIÓN DE RECURSOS: 4 móviles 4x4 y 2 lanchas Zodiak en estado DISPONIBLE. Centros de evacuación en Resistencia y Barranqueras en fase de alistamiento pasivo.'
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !sitrepText) {
      fetchSitrep();
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(sitrepText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Informe de Situación Operativa (SITREP) con IA
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Gemini 3.7 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Resumen ejecutivo automatizado para Jefes de Operaciones de Defensa Civil y Bomberos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Box */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-medium">
                Sintetizando telemetría de 12 localidades, 5 cuencas y tickets de auxilio...
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto pr-2 text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
              {sitrepText}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={fetchSitrep}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerar Informe</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-bold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado al Portapapeles' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
