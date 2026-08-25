import React, { useState } from 'react';
import {
  Phone,
  PhoneCall,
  Shield,
  Flame,
  Ship,
  HeartPulse,
  Wrench,
  Search,
  X,
  ExternalLink,
  MessageSquare,
  Building,
} from 'lucide-react';
import { CONTACTOS_EMERGENCIA } from '../data/chacoData';

interface EmergencyContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyContactsModal: React.FC<EmergencyContactsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('TODOS');

  if (!isOpen) return null;

  const filteredContacts = CONTACTOS_EMERGENCIA.filter((c) => {
    const matchesSearch =
      c.entidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telefono.includes(searchTerm) ||
      (c.telefonoAlt && c.telefonoAlt.includes(searchTerm)) ||
      (c.localidad && c.localidad.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === 'TODOS') return true;
    if (selectedFilter === 'BARRANQUERAS') {
      return (
        c.localidad?.toLowerCase().includes('barranqueras') ||
        c.entidad.toLowerCase().includes('barranqueras')
      );
    }
    if (selectedFilter === 'BOMBEROS') return c.tipo === 'BOMBEROS';
    if (selectedFilter === 'DEFENSA_CIVIL') return c.tipo === 'DEFENSA_CIVIL';
    if (selectedFilter === 'PREFECTURA') return c.tipo === 'PREFECTURA';
    if (selectedFilter === 'SALUD') return c.tipo === 'SALUD';
    return true;
  });

  const getIconForType = (tipo?: string) => {
    switch (tipo) {
      case 'DEFENSA_CIVIL':
        return <Shield className="w-5 h-5 text-amber-400" />;
      case 'BOMBEROS':
        return <Flame className="w-5 h-5 text-rose-400" />;
      case 'PREFECTURA':
        return <Ship className="w-5 h-5 text-sky-400" />;
      case 'SALUD':
        return <HeartPulse className="w-5 h-5 text-emerald-400" />;
      case 'POLICIA':
        return <Shield className="w-5 h-5 text-blue-400" />;
      default:
        return <Building className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-800/80 flex items-center justify-center text-sky-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Guía Telefónica de Emergencias y Guardias 24hs
              </h2>
              <p className="text-xs text-slate-400">
                Barranqueras, Gran Resistencia y Cobertura Provincial de Emergencias
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cuartel, localidad (ej: Barranqueras, Resistencia) o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'TODOS', label: 'Todos' },
              { id: 'BARRANQUERAS', label: '⚓ Barranqueras' },
              { id: 'DEFENSA_CIVIL', label: '🛡️ Defensa Civil' },
              { id: 'BOMBEROS', label: '🚒 Bomberos' },
              { id: 'PREFECTURA', label: '🚢 Prefectura (106)' },
              { id: 'SALUD', label: '🚑 Salud / SAME' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-sky-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts Directory List */}
        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No se encontraron números con ese criterio de búsqueda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredContacts.map((c, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          {getIconForType(c.tipo)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs sm:text-sm leading-snug">
                            {c.entidad}
                          </h4>
                          {c.localidad && (
                            <span className="text-[10px] uppercase font-semibold text-sky-400 tracking-wider">
                              {c.localidad}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {c.descripcion}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-medium">Línea Directa</span>
                      <a
                        href={`tel:${c.telefono.replace(/[^0-9+]/g, '')}`}
                        className="text-sm font-black text-sky-300 font-mono hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-sky-400" />
                        {c.telefono}
                      </a>
                      {c.telefonoAlt && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          Alt: {c.telefonoAlt}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${c.telefono.replace(/[^0-9+]/g, '')}`}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Llamar</span>
                      </a>
                      {c.whatsapp && (
                        <a
                          href={`https://wa.me/549${c.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                          title="Enviar WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>🚨 Ante riesgo inminente comuníquese al <b>103</b> (Defensa Civil) o <b>100</b> (Bomberos).</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
