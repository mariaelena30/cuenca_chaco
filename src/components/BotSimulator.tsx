import React, { useState, useRef, useEffect } from 'react';
import { BotMessage } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  Smartphone,
  MessageCircle,
  Radio,
  RotateCcw,
  Shield,
  LifeBuoy,
  Phone,
  Droplets,
} from 'lucide-react';

interface BotSimulatorProps {
  onTriggerSOS: () => void;
  onTriggerReport: () => void;
}

export const BotSimulator: React.FC<BotSimulatorProps> = ({ onTriggerSOS, onTriggerReport }) => {
  const [canal, setCanal] = useState<'telegram' | 'whatsapp' | 'sms'>('telegram');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<BotMessage[]>([
    {
      id: 'm_1',
      remitente: 'bot',
      canal: 'telegram',
      texto:
        '👋 <b>Bienvenido al Asistente Oficial del Portal Hídrico y Emergencias Chaco</b>.\n\nMonitoreo en tiempo real de los ríos Paraná, Bermejo, Paraguay y Río Negro.\n\nTocá los accesos rápidos o escribí tu consulta en lenguaje simple.',
      timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      opciones: ['/estado', '/cuencas', '/alertas', '/sos', '/reportar', '/refugios'],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: BotMessage = {
      id: `msg_${Date.now()}`,
      remitente: 'user',
      canal,
      texto: text,
      timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: text, canal }),
      });

      const data = await res.json();

      if (data.action === 'OPEN_SOS_MODAL') {
        onTriggerSOS();
      } else if (data.action === 'OPEN_REPORT_MODAL') {
        onTriggerReport();
      }

      const botMsg: BotMessage = {
        id: `msg_${Date.now() + 1}`,
        remitente: 'bot',
        canal,
        texto: data.respuesta || 'Mensaje recibido.',
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        opciones: data.opciones,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: BotMessage = {
        id: `msg_${Date.now() + 1}`,
        remitente: 'bot',
        canal,
        texto: '⚠️ Error de conexión temporal con la central. Reintentando...',
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'm_1',
        remitente: 'bot',
        canal: 'telegram',
        texto:
          '👋 <b>Bienvenido al Asistente Oficial del Portal Hídrico y Emergencias Chaco</b>.\n\nMonitoreo en tiempo real de los ríos Paraná, Bermejo, Paraguay y Río Negro.\n\nTocá los accesos rápidos o escribí tu consulta en lenguaje simple.',
        timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        opciones: ['/estado', '/cuencas', '/alertas', '/sos', '/reportar', '/refugios'],
      },
    ]);
  };

  return (
    <div className="space-y-4 pb-10 max-w-4xl mx-auto">
      {/* Header Info with Channel Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 border border-slate-800/80 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Asistente Ciudadano y Bomberos
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-slate-400" />
                IA Asistencial
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Canal de información en tiempo real para vecinos, guardias de APA y cuarteles de bomberos.
            </p>
          </div>
        </div>

        {/* Channel Selector */}
        <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCanal('telegram')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              canal === 'telegram'
                ? 'bg-slate-200 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Telegram</span>
          </button>

          <button
            onClick={() => setCanal('whatsapp')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              canal === 'whatsapp'
                ? 'bg-slate-200 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => setCanal('sms')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              canal === 'sms'
                ? 'bg-slate-200 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>SMS Rural</span>
          </button>
        </div>
      </div>

      {/* Clear routing explanation strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-800/40 shrink-0">
            <LifeBuoy className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-slate-200 block">Comando /sos</span>
            <span className="text-[11px] text-slate-400">Directo a Bomberos (100) y DC (103)</span>
          </div>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
            <Droplets className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-slate-200 block">Comando /reportar</span>
            <span className="text-[11px] text-slate-400">Va al mapa y a cuadrillas APA</span>
          </div>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 shrink-0">
            <Phone className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-slate-200 block">Emergencias Chaco</span>
            <span className="text-[11px] text-slate-400">Líneas 100, 103 y 911 activas</span>
          </div>
        </div>
      </div>

      {/* Messenger App Container */}
      <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[560px]">
        {/* Messenger App Top Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 text-xs font-bold">
              🤖
            </div>
            <div>
              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                <span>
                  {canal === 'telegram'
                    ? 'Bot Hídrico Chaco'
                    : canal === 'whatsapp'
                    ? 'Alerta Hidrológica WhatsApp'
                    : 'SMS Rural Directo'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              </div>
              <span className="text-[10px] text-slate-400">Atención automatizada 24 horas</span>
            </div>
          </div>

          <button
            onClick={handleResetChat}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Reiniciar conversación"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="text-[11px]">Reiniciar</span>
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/60">
          {messages.map((msg) => {
            const isBot = msg.remitente === 'bot';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    isBot
                      ? 'bg-slate-900 text-slate-200 border border-slate-800'
                      : 'bg-slate-800 text-white border border-slate-700'
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: msg.texto.replace(/\n/g, '<br/>') }}
                    className="space-y-1"
                  />

                  <div className="text-[10px] text-right mt-1.5 font-mono text-slate-400">
                    {msg.timestamp}
                  </div>
                </div>

                {/* Interactive Option Chips */}
                {isBot && msg.opciones && msg.opciones.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[88%]">
                    {msg.opciones.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(opt)}
                        className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 text-[11px] font-medium transition-all cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-xl w-fit border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping" />
              <span>Consultando telemetría oficial...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputMessage);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribí tu consulta o tocá /estado, /cuencas, /sos, /reportar..."
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500"
            />

            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2 rounded-xl bg-slate-200 hover:bg-white disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold transition-colors cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
