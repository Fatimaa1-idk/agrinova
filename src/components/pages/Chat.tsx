import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';

interface Message {
  id: number;
  moi: boolean;
  texte: string;
  heure: string;
  lu: boolean;
  expediteur?: string;
}

interface Contact {
  id: number;
  nom: string;
  role: string;
  lastMessage: string;
  unread: number;
  online: boolean;
}

const contacts: Contact[] = [
  { id: 1, nom: 'Moussa Diop', role: 'Producteur', lastMessage: 'Parfait ! Je peux vous livrer demain matin.', unread: 0, online: true },
  { id: 2, nom: 'Fatou Ndiaye', role: 'Acheteur', lastMessage: 'Merci pour la livraison rapide.', unread: 2, online: false },
  { id: 3, nom: 'Ibrahim Ba', role: 'Transporteur', lastMessage: 'Disponible pour demain matin.', unread: 0, online: true },
];

const initialMessages: Message[] = [
  { id: 1, moi: false, texte: 'Bonjour ! Vos tomates sont encore disponibles ?', heure: '09:12', lu: true, expediteur: 'Moussa Diop' },
  { id: 2, moi: true, texte: "Oui, j'ai encore 50 kg. Quelle quantité souhaitez-vous ?", heure: '09:15', lu: true },
  { id: 3, moi: false, texte: "Je vais en prendre 20 kg. C'est pour mon restaurant à Dakar.", heure: '09:18', lu: true, expediteur: 'Moussa Diop' },
  { id: 4, moi: true, texte: 'Parfait ! Je peux vous livrer demain matin. 350 FCFA/kg.', heure: '09:20', lu: true },
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function now() {
  return new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' });
}

const Chat = () => {
  const { user } = useAuth();
  const { navigate } = useRouter();

  // Mobile: 'contacts' | 'conversation' — Desktop: both visible
  const [view, setView] = useState<'contacts' | 'conversation'>('contacts');
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0]);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }, [inputValue]);

  const openConversation = (contact: Contact) => {
    setSelectedContact(contact);
    setView('conversation');
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMsg: Message = {
      id: Date.now(),
      moi: true,
      texte: inputValue,
      heure: now(),
      lu: false,
    };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      await api('/messages', 'POST', { destinataire_id: selectedContact.id, contenu: inputValue });
    } catch {
      // mode démo
    }

    const replies = [
      'Parfait ! Je confirme la commande.',
      'Merci pour votre confiance.',
      'Je vous prépare cela immédiatement.',
      "Entendu, je vous contacte dès que c'est prêt.",
    ];

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          moi: false,
          texte: replies[Math.floor(Math.random() * replies.length)],
          heure: now(),
          lu: true,
          expediteur: selectedContact.nom,
        },
      ]);
      setIsTyping(false);
    }, 1400);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── Contacts panel ──────────────────────────────────────────────────────────
  const ContactsPanel = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-surface-container">
        <h2 className="text-headline text-base text-primary">Messages</h2>
        <p className="text-xs text-primary/50 mt-0.5 font-medium">{contacts.length} conversations</p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-surface-container">
        {contacts.map((contact) => {
          const isSelected = selectedContact.id === contact.id;
          return (
            <button
              key={contact.id}
              onClick={() => openConversation(contact)}
              className={cn(
                'w-full px-5 py-4 flex items-center gap-3 text-left transition-natural hover:bg-surface-container',
                isSelected && 'bg-primary/5'
              )}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className={cn(
                  'w-11 h-11 rounded-full flex items-center justify-center text-sm font-black',
                  isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-primary'
                )}>
                  {getInitials(contact.nom)}
                </div>
                {contact.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-white" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={cn('text-sm font-bold truncate', isSelected ? 'text-primary' : 'text-primary/90')}>
                    {contact.nom}
                  </span>
                  <span className="text-xs text-primary/40 shrink-0">14:30</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="text-xs text-primary/50 truncate">{contact.lastMessage}</span>
                  {contact.unread > 0 && (
                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-black flex items-center justify-center">
                      {contact.unread}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium text-primary/30 uppercase tracking-wide">{contact.role}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ─── Conversation panel ───────────────────────────────────────────────────────
  const ConversationPanel = () => (
    <div className="flex flex-col h-full">
      {/* Conversation header */}
      <div className="bg-white border-b border-surface-container px-4 py-3 flex items-center gap-3 shrink-0 shadow-agricultural">
        {/* Back button — mobile only */}
        <button
          onClick={() => setView('contacts')}
          aria-label="Retour"
          className="md:hidden p-2 -ml-2 rounded-xl hover:bg-surface-container transition-natural text-primary/70"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-xs font-black text-on-primary">
            {getInitials(selectedContact.nom)}
          </div>
          {selectedContact.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-primary truncate">{selectedContact.nom}</p>
          <p className="text-xs text-primary/50">
            {selectedContact.role} · {selectedContact.online ? 'En ligne' : 'Hors ligne'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 rounded-xl hover:bg-surface-container transition-natural text-primary/60 hover:text-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.08 2.18 2 2 0 012.07 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
          </button>
          <button className="p-2 rounded-xl hover:bg-surface-container transition-natural text-primary/60 hover:text-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-surface">
        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex items-end gap-2', msg.moi ? 'justify-end' : 'justify-start')}>
            {!msg.moi && (
              <div className="w-7 h-7 rounded-full bg-surface-container-high border border-surface-container flex items-center justify-center text-[10px] font-black text-primary shrink-0">
                {getInitials(msg.expediteur || selectedContact.nom)}
              </div>
            )}
            <div className={cn(
              'max-w-[72%] px-4 py-2.5 text-sm leading-relaxed',
              msg.moi
                ? 'bg-primary text-on-primary rounded-2xl rounded-br-sm'
                : 'bg-white shadow-agricultural text-primary rounded-2xl rounded-bl-sm'
            )}>
              <p>{msg.texte}</p>
              <p className={cn(
                'text-[10px] mt-1 text-right',
                msg.moi ? 'text-on-primary/60' : 'text-primary/40'
              )}>
                {msg.heure}
                {msg.moi && (
                  <span className="ml-1">{msg.lu ? '✓✓' : '✓'}</span>
                )}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-end gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-surface-container-high border border-surface-container flex items-center justify-center text-[10px] font-black text-primary shrink-0">
              {getInitials(selectedContact.nom)}
            </div>
            <div className="bg-white shadow-agricultural px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '160ms' }} />
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '320ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="bg-white border-t border-surface-container px-4 py-3 pb-4 shrink-0">
        <div className="flex gap-2 items-end">
          <button className="p-2 rounded-xl hover:bg-surface-container transition-natural text-primary/50 hover:text-primary shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </button>

          <div className="flex-1 bg-surface border-2 border-surface-container-high rounded-2xl px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-natural">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Tapez votre message…"
              rows={1}
              className="w-full bg-transparent text-sm text-primary placeholder:text-primary/40 outline-none resize-none leading-relaxed"
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!inputValue.trim()}
            aria-label="Envoyer"
            className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-agricultural hover:bg-primary-container transition-natural disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Layout ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Global page header — visible both on mobile and desktop */}
      <header className="bg-white sticky top-0 z-40 border-b border-surface-container shadow-agricultural">
        <div className="flex items-center gap-3 px-5 py-4">
          <button
            onClick={() => navigate('marketplace')}
            aria-label="Retour"
            className="p-2 -ml-2 rounded-xl hover:bg-surface-container transition-natural text-primary/70 hover:text-primary md:hidden"
            style={{ display: view === 'conversation' ? 'none' : undefined }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="text-headline text-base text-primary">Messagerie</h1>
        </div>
      </header>

      {/* Mobile: single-column with view toggle */}
      <div className="md:hidden pb-24">
        {view === 'contacts' ? (
          <ContactsPanel />
        ) : (
          <div className="flex flex-col" style={{ minHeight: 'calc(100dvh - 130px)' }}>
            <ConversationPanel />
          </div>
        )}
      </div>

      {/* Desktop: side-by-side */}
      <div className="hidden md:flex pb-24" style={{ minHeight: 'calc(100dvh - 80px)' }}>
        {/* Contacts sidebar */}
        <div className="w-80 border-r border-surface-container bg-white shrink-0 overflow-y-auto">
          <ContactsPanel />
        </div>

        {/* Conversation */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ConversationPanel />
        </div>
      </div>
    </>
  );
};

export { Chat };
