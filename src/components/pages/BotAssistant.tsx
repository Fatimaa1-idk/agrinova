import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useRouter } from '../../router/RouterContext';
import { botChat, botHistorique, botReset } from '../../services/api';

interface Message {
  bot: boolean;
  text: string;
}

const quickTopics = [
  { icon: '💧', label: 'Irrigation', question: "Quels conseils pour l'irrigation de mes cultures ?" },
  { icon: '🌤', label: 'Météo', question: 'Quelle est la météo agricole aujourd\'hui ?' },
  { icon: '💰', label: 'Prix marché', question: 'Quels sont les prix du marché aujourd\'hui ?' },
  { icon: '🌿', label: 'Maladies', question: 'Comment traiter les maladies des cultures ?' },
  { icon: '📅', label: 'Calendrier', question: 'Quel est le calendrier agricole actuel ?' },
];

const WELCOME: Message = {
  bot: true,
  text: "Bonjour ! Je suis l'assistant agricole Agrinova.\n\nJe peux vous conseiller sur vos cultures, les prix du marché, la météo et bien plus.\n\nChoisissez un sujet ou posez directement votre question.",
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const MessageSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-surface-container-high shrink-0" />
      <div className="space-y-2">
        <div className="h-4 bg-surface-container-high rounded-xl w-56" />
        <div className="h-4 bg-surface-container-high rounded-xl w-40" />
        <div className="h-4 bg-surface-container-high rounded-xl w-48" />
      </div>
    </div>
    <div className="flex items-end gap-2 justify-end">
      <div className="h-4 bg-primary/10 rounded-xl w-32" />
    </div>
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-surface-container-high shrink-0" />
      <div className="space-y-2">
        <div className="h-4 bg-surface-container-high rounded-xl w-64" />
        <div className="h-4 bg-surface-container-high rounded-xl w-44" />
      </div>
    </div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
const BotAssistant = () => {
  const { navigate } = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Textarea auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }, [input]);

  // Load conversation history on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await botHistorique();
        if (data.historique?.length > 0) {
          setMessages(
            data.historique.map((msg: any) => ({
              bot: msg.role === 'assistant',
              text: msg.contenu,
            }))
          );
        } else {
          setMessages([WELCOME]);
        }
      } catch {
        setMessages([WELCOME]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sendMessage = async (question?: string) => {
    const q = (question || input).trim();
    if (!q || isTyping) return;

    setInput('');
    setMessages(prev => [...prev, { bot: false, text: q }]);
    setIsTyping(true);

    try {
      const data = await botChat(q);
      setMessages(prev => [...prev, { bot: true, text: data.reponse }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { bot: true, text: 'Désolé, une erreur est survenue. Veuillez réessayer.' },
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
      setMessages([WELCOME]);
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
      <header className="bg-white sticky top-0 z-40 border-b border-surface-container shadow-agricultural">
        <div className="flex items-center gap-3 px-5 py-4 max-w-2xl mx-auto">

          {/* Back */}
          <button
            onClick={() => navigate('marketplace')}
            aria-label="Retour"
            className="p-2 -ml-2 rounded-xl hover:bg-surface-container transition-natural text-primary/60 hover:text-primary shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Bot avatar */}
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-agricultural shrink-0">
            <span className="text-xs font-black text-on-primary">AG</span>
          </div>

          {/* Title + status */}
          <div className="flex-1 min-w-0">
            <h1 className="text-headline text-sm text-primary leading-tight">Assistant Agricole</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
              <span className="text-xs text-primary/50 font-medium">En ligne · IA Agrinova</span>
            </div>
          </div>

          {/* Reset button — far right */}
          <button
            onClick={handleReset}
            disabled={resetting || loading}
            aria-label="Nouvelle conversation"
            title="Nouvelle conversation"
            className="p-2 rounded-xl hover:bg-surface-container transition-natural text-primary/50 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
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
      <div className="bg-surface border-b border-surface-container/60 sticky top-[73px] z-30">
        <div className="px-5 py-2.5 max-w-2xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
            {quickTopics.map((topic, i) => (
              <button
                key={i}
                onClick={() => sendMessage(topic.question)}
                disabled={isTyping || loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-primary hover:text-on-primary text-primary text-xs font-semibold whitespace-nowrap transition-natural shrink-0 border border-surface-container-high hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm leading-none">{topic.icon}</span>
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Messages ────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-5 py-5 pb-36 max-w-2xl mx-auto w-full">
        {loading ? (
          <MessageSkeleton />
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex items-end gap-2', msg.bot ? 'justify-start' : 'justify-end')}>
                {msg.bot && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mb-0.5">
                    <span className="text-[10px] font-black text-primary">AG</span>
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[78%] px-4 py-3 text-sm leading-relaxed whitespace-pre-line',
                    msg.bot
                      ? 'bg-white shadow-agricultural text-primary rounded-2xl rounded-bl-sm'
                      : 'bg-primary text-on-primary rounded-2xl rounded-br-sm'
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-primary">AG</span>
                </div>
                <div className="bg-white shadow-agricultural px-4 py-3.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '160ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '320ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* ── Input — fixed above nav ──────────────────────────────────────────── */}
      <div className="fixed bottom-20 left-0 right-0 z-30 bg-surface/95 backdrop-blur-sm border-t border-surface-container/70">
        <div className="max-w-2xl mx-auto px-5 py-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1 bg-white border-2 border-surface-container-high rounded-2xl px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-natural shadow-agricultural">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={loading ? 'Chargement…' : 'Posez votre question agricole…'}
                disabled={loading}
                rows={1}
                className="w-full bg-transparent text-sm text-primary placeholder:text-primary/40 outline-none resize-none leading-relaxed disabled:cursor-not-allowed"
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping || loading}
              aria-label="Envoyer"
              className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-agricultural hover:bg-primary-container transition-natural disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-primary/30 text-center mt-1.5">Shift+Entrée pour un saut de ligne</p>
        </div>
      </div>

    </div>
  );
};

export { BotAssistant };
