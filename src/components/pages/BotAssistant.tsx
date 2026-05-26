import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useRouter } from '../../router/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { botChat, botHistorique, botReset } from '../../services/api';

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

const MessageSkeleton = () => (
  <div className="space-y-5 animate-pulse px-1">
    <div className="flex items-end gap-3">
      <div className="w-8 h-8 rounded-full bg-surface-container-high shrink-0" />
      <div className="space-y-2">
        <div className="h-3.5 bg-surface-container-high rounded-xl w-56" />
        <div className="h-3.5 bg-surface-container-high rounded-xl w-40" />
        <div className="h-3.5 bg-surface-container-high rounded-xl w-48" />
      </div>
    </div>
    <div className="flex justify-end">
      <div className="h-3.5 bg-primary/10 rounded-xl w-32" />
    </div>
    <div className="flex items-end gap-3">
      <div className="w-8 h-8 rounded-full bg-surface-container-high shrink-0" />
      <div className="space-y-2">
        <div className="h-3.5 bg-surface-container-high rounded-xl w-64" />
        <div className="h-3.5 bg-surface-container-high rounded-xl w-44" />
      </div>
    </div>
  </div>
);

// Renders bot text: bold (**text**), bullet lines, plain newlines
function BotText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const isBullet = /^[-•*]\s/.test(line.trim());
        const clean = isBullet ? line.trim().replace(/^[-•*]\s/, '') : line;
        const parts = clean.split(/\*\*(.+?)\*\*/g);
        const rendered = parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
        );
        return (
          <div key={i} className={cn('leading-relaxed', isBullet && 'flex gap-2 items-start')}>
            {isBullet && <span className="text-primary/40 mt-0.5 shrink-0">•</span>}
            <span>{rendered}</span>
          </div>
        );
      })}
    </div>
  );
}

function formatTime(ts?: string) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

const BotAssistant = () => {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isProducteur = user?.role === 'producteur';
  const quickTopics = isProducteur ? quickTopicsProducteur : quickTopicsAcheteur;
  const WELCOME = isProducteur ? WELCOME_PRODUCTEUR : WELCOME_ACHETEUR;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }, [input]);

  useEffect(() => {
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
  }, []);

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
      // silently fail
    } finally {
      setResetting(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="bg-white sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">

          <button
            onClick={() => navigate('accueil')}
            aria-label="Retour"
            className="p-2 -ml-1 rounded-xl hover:bg-surface-container transition-colors text-primary/50 hover:text-primary shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Bot avatar */}
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
              <path d="M9 14v1" /><path d="M15 14v1" />
              <path d="M3 14h18v2a7 7 0 0 1-7 7H10a7 7 0 0 1-7-7v-2z" />
              <path d="M8 21v1" /><path d="M16 21v1" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-sm text-primary leading-tight">AgrinovaBot</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs text-primary/40 font-medium">
                {isProducteur ? 'Assistant agricole' : 'Assistant acheteur'} · IA Agrinova
              </span>
            </div>
          </div>

          <button
            onClick={handleReset}
            disabled={resetting || loading}
            aria-label="Nouvelle conversation"
            title="Nouvelle conversation"
            className="p-2 rounded-xl hover:bg-surface-container transition-colors text-primary/40 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <svg
              width="17" height="17" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              className={resetting ? 'animate-spin' : ''}
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Quick topics ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-surface-container sticky top-[55px] z-60">
        <div className="px-4 py-2 max-w-2xl mx-auto">
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {quickTopics.map((topic, i) => (
              <button
                key={i}
                onClick={() => sendMessage(topic.question)}
                disabled={isTyping || loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-primary hover:text-on-primary text-primary text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 border border-surface-container-high hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-sm leading-none">{topic.icon}</span>
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Messages ────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 py-5 pb-40 max-w-2xl mx-auto w-full">
        {loading ? (
          <MessageSkeleton />
        ) : (
          <div className="space-y-5">
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex items-end gap-2.5', msg.bot ? 'justify-start' : 'justify-end')}>

                {msg.bot && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 mb-4">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                    </svg>
                  </div>
                )}

                <div className="flex flex-col gap-1 max-w-[80%]" style={{ alignItems: msg.bot ? 'flex-start' : 'flex-end' }}>
                  <div
                    className={cn(
                      'px-4 py-3 text-xs',
                      msg.bot
                        ? 'bg-white shadow-sm border border-surface-container text-primary rounded-2xl rounded-bl-sm'
                        : 'bg-primary text-on-primary rounded-2xl rounded-br-sm'
                    )}
                  >
                    {msg.bot ? <BotText text={msg.text} /> : msg.text}
                  </div>
                  {msg.ts && (
                    <span className="text-[10px] text-primary/30 px-1">{formatTime(msg.ts)}</span>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                  </svg>
                </div>
                <div className="bg-white shadow-sm border border-surface-container px-4 py-3.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* ── Input bar ───────────────────────────────────────────────────────── */}
      <div className="fixed bottom-14 left-0 right-0 z-30 bg-surface/98 backdrop-blur-sm ">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex gap-2 items-center pb-2">
            <div className="flex-1 bg-white border-2 border-surface-container-high rounded-2xl px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-sm">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={loading ? 'Chargement…' : 'Posez votre question…'}
                disabled={loading}
                rows={1}
                className="w-full bg-transparent text-sm text-primary placeholder:text-primary/35 outline-none resize-none leading-relaxed disabled:cursor-not-allowed"
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping || loading}
              aria-label="Envoyer"
              className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
          {/* <p className="text-[10px] text-primary/25 text-center mt-1.5">Shift+Entrée pour un saut de ligne</p> */}
        </div>
      </div>

    </div>
  );
};

export { BotAssistant };
