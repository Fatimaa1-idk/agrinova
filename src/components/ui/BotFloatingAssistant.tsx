import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { botChat, botHistorique, botReset } from '../../services/api';
import { 
  Bot, X, Send, RefreshCw, Sprout, Volume2, 
  MessageSquare, HelpCircle, ChevronRight, Minimize2
} from 'lucide-react';

interface Message {
  bot: boolean;
  text: string;
  ts?: string;
}

const quickTopicsProducteur = [
  { icon: '💧', label: 'Irrigation', question: "Quels conseils pour l'irrigation de mes cultures ?" },
  { icon: '🌿', label: 'Maladies', question: 'Comment traiter les maladies des cultures ?' },
  { icon: '💰', label: 'Prix marché', question: 'Quels sont les prix du marché actuellement ?' },
  { icon: '📅', label: 'Calendrier', question: 'Quel est le calendrier agricole actuel ?' },
  { icon: '📦', label: 'Mes produits', question: 'Donne-moi un résumé de mes produits publiés.' },
];

const quickTopicsAcheteur = [
  { icon: '🔍', label: 'Trouver', question: 'Quels produits frais sont disponibles en ce moment ?' },
  { icon: '💰', label: 'Prix', question: 'Quels sont les meilleurs prix sur la plateforme ?' },
  { icon: '📦', label: 'Commandes', question: 'Donne-moi un résumé de mes commandes récentes.' },
  { icon: '🥦', label: 'Légumes', question: 'Quels légumes locaux sont en saison ?' },
  { icon: '🌾', label: 'Céréales', question: 'Quelles céréales locales sont disponibles ?' },
];

const WELCOME_PRODUCTEUR: Message = {
  bot: true,
  text: "Bonjour ! Je suis AgrinovaBot, votre assistant agricole.\n\nJe connais vos produits, vos commandes et peux vous conseiller sur vos cultures, les prix du marché et bien plus.\n\nComment puis-je vous aider aujourd'hui ?",
};

const WELCOME_ACHETEUR: Message = {
  bot: true,
  text: "Bonjour ! Je suis AgrinovaBot, votre assistant Agrinova.\n\nJe peux vous aider à trouver les meilleurs produits frais, comparer les prix, suivre vos commandes et vous conseiller sur les produits locaux de saison.\n\nQue souhaitez-vous savoir ?",
};

function formatTime(ts?: string) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Renders bot text with bold formatting and bullets
function BotText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1 text-xs md:text-sm">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const isBullet = /^[-•*]\s/.test(line.trim());
        const clean = isBullet ? line.trim().replace(/^[-•*]\s/, '') : line;
        const parts = clean.split(/\*\*(.+?)\*\*/g);
        const rendered = parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="font-extrabold text-primary">{part}</strong> : <span key={j}>{part}</span>
        );
        return (
          <div key={i} className={cn('leading-relaxed text-primary/95', isBullet && 'flex gap-2 items-start')}>
            {isBullet && <span className="text-primary/40 mt-1 shrink-0">•</span>}
            <span>{rendered}</span>
          </div>
        );
      })}
    </div>
  );
}

export function BotFloatingAssistant() {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isProducteur = user?.role === 'producteur';
  const quickTopics = isProducteur ? quickTopicsProducteur : quickTopicsAcheteur;
  const WELCOME = isProducteur ? WELCOME_PRODUCTEUR : WELCOME_ACHETEUR;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);

  // Custom Event Listener to open the bot floating popover externally
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-agrinova-bot', handleOpen);
    return () => window.removeEventListener('open-agrinova-bot', handleOpen);
  }, []);

  // Scroll to bottom when messages list updates or popover opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isTyping, isOpen]);

  // Load message history on mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await botHistorique();
        const list = Array.isArray(data) ? data : [];
        if (list.length > 0) {
          setMessages(
            list.map((msg: any) => ({
              bot: msg.role === 'assistant',
              text: msg.contenu,
              ts: msg.date_envoi,
            }))
          );
        } else {
          setMessages([{ ...WELCOME, ts: new Date().toISOString() }]);
        }
      } catch {
        setMessages([{ ...WELCOME, ts: new Date().toISOString() }]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const sendMessage = async (question?: string) => {
    const q = (question || input).trim();
    if (!q || isTyping) return;

    setInput('');
    const userMsg: Message = { bot: false, text: q, ts: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const data = await botChat(q);
      setMessages(prev => [
        ...prev,
        { bot: true, text: data.reponse, ts: new Date().toISOString() },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          bot: true,
          text: 'Désolé, une erreur est survenue. Veuillez réessayer.',
          ts: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = async () => {
    if (resetting) return;
    setResetting(true);
    try {
      await botReset();
      setMessages([{ ...WELCOME, ts: new Date().toISOString() }]);
    } catch {
      // fail silently
    } finally {
      setResetting(false);
    }
  };

  const handleSpeak = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) return;
    
    if (speakingMessageIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingMessageIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#]/g, ''); // strip markdown bold stars
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fr-FR';
    
    utterance.onend = () => {
      setSpeakingMessageIndex(null);
    };

    setSpeakingMessageIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) return null;

  return (
    <>
      {/* ── 1. FLOATING ACTION BUTTON (FAB) ────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 group",
          // Sits above bottom nav bar (h-16 is approx 64px, bottom-24 is 96px)
          "bottom-48 ",
          isOpen 
            ? "bg-white text-primary border border-surface-container-high rotate-90 scale-90" 
            : "bg-primary text-white border border-white/10 ring-4 ring-primary/20 animate-pulse-slow"
        )}
        aria-label="Assistant IA Agrinova"
        title="Discuter avec l'assistant IA"
      >
        {isOpen ? (
          <Minimize2 size={22} className="text-primary/70 transition-transform group-hover:scale-110" />
        ) : (
          <div className="relative">
            <Bot size={24} strokeWidth={2.2} className="group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-primary text-[8px] font-black px-1 py-0.5 rounded-full uppercase tracking-wider border border-white">IA</span>
          </div>
        )}
      </button>

      {/* ── 2. MESSENGER CHAT WINDOW OVERLAY ─────────────────────── */}
      <div
        className={cn(
          "fixed right-6 z-50 bg-white border border-surface-container-high rounded-[2rem] shadow-2xl flex flex-col overflow-hidden transition-all duration-300",
          "w-[380px] h-[520px] max-h-[75vh] bottom-40 md:bottom-26", // placement
          "sm:w-[400px]",
          // Mobile responsive placement overrides
          "max-sm:w-[92vw] max-sm:right-4 max-sm:h-[62vh] max-sm:bottom-40",
          isOpen 
            ? "opacity-100 translate-y-0 pointer-events-auto scale-100" 
            : "opacity-0 translate-y-10 pointer-events-none scale-95"
        )}
      >
        {/* Messenger Header */}
        <header className="bg-primary px-5 py-4 text-white flex items-center justify-between relative overflow-hidden select-none shrink-0">
          <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
            <Sprout size={100} />
          </div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-white/12 border border-white/15 flex items-center justify-center shadow-sm">
              <Bot size={18} strokeWidth={2.5} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="font-headline font-black text-sm tracking-tight">AgrinovaBot IA</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Assistant Actif</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 relative z-10">
            {/* Conversation reset button */}
            <button
              onClick={handleReset}
              disabled={resetting || loading}
              aria-label="Réinitialiser"
              title="Nouvelle conversation"
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} className={cn(resetting && "animate-spin")} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Fermer"
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        {/* Quick Topics horizontal list */}
        <div className="bg-surface border-b border-surface-container-high py-2.5 px-4 overflow-x-auto shrink-0 select-none flex gap-2" style={{ scrollbarWidth: 'none' }}>
          {quickTopics.map((topic, i) => (
            <button
              key={i}
              onClick={() => sendMessage(topic.question)}
              disabled={isTyping || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-primary hover:text-white text-primary text-[10px] font-extrabold whitespace-nowrap transition-all duration-200 shrink-0 border border-surface-container-high hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95"
            >
              <span>{topic.icon}</span>
              <span>{topic.label}</span>
            </button>
          ))}
        </div>

        {/* Scrollable Messages Panel */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-surface/50"
        >
          {loading ? (
            <div className="space-y-4 animate-pulse px-1">
              <div className="flex gap-2.5 items-end">
                <div className="w-7 h-7 rounded-full bg-surface-container-high shrink-0" />
                <div className="h-10 bg-surface-container-high rounded-2xl w-48 rounded-bl-none" />
              </div>
              <div className="flex justify-end">
                <div className="h-8 bg-primary/10 rounded-2xl w-32 rounded-br-none" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={cn('flex items-end gap-2', msg.bot ? 'justify-start' : 'justify-end')}>
                  
                  {msg.bot && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 mb-3 shadow-sm">
                      <Sprout size={12} className="text-primary" />
                    </div>
                  )}

                  <div className="flex flex-col gap-0.5 max-w-[82%]" style={{ alignItems: msg.bot ? 'flex-start' : 'flex-end' }}>
                    <div
                      className={cn(
                        'px-3.5 py-2.5 rounded-2xl border transition-all duration-200 relative group/msg shadow-sm',
                        msg.bot
                          ? 'bg-white border-surface-container-high text-primary rounded-bl-none'
                          : 'bg-primary text-white border-primary rounded-br-none'
                      )}
                    >
                      {msg.bot ? <BotText text={msg.text} /> : <p className="text-xs md:text-sm font-semibold">{msg.text}</p>}
                      
                      {/* Audio voice narrator for Bot bubbles */}
                      {msg.bot && (
                        <button
                          onClick={() => handleSpeak(msg.text, i)}
                          className={cn(
                            "absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-white shadow-md border border-surface-container-high flex items-center justify-center transition-all duration-200 hover:scale-110",
                            speakingMessageIndex === i ? "text-yellow-600 bg-yellow-50 border-yellow-250" : "text-primary/40 hover:text-primary opacity-0 group-hover/msg:opacity-100"
                          )}
                          title="Lire le message vocal"
                        >
                          <Volume2 size={10} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                    {msg.ts && (
                      <span className="text-[9px] text-primary/30 px-1 font-bold">{formatTime(msg.ts)}</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Bot typing bubble skeleton */}
              {isTyping && (
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                    <Sprout size={12} className="text-primary" />
                  </div>
                  <div className="bg-white shadow-sm border border-surface-container-high px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input message bar */}
        <div className="p-3 bg-white border-t border-surface-container-high shrink-0">
          <div className="flex gap-2 items-center">
            <div className="flex-1 bg-surface border border-surface-container-high rounded-2xl px-4 py-2 focus-within:border-primary transition-all shadow-sm">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={loading ? 'Chargement...' : 'Posez votre question...'}
                disabled={loading}
                className="w-full bg-transparent text-xs md:text-sm text-primary placeholder:text-primary/35 outline-none font-semibold leading-relaxed disabled:cursor-not-allowed py-1"
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping || loading}
              aria-label="Envoyer"
              className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm hover:bg-primary-container active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
