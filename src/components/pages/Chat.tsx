import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';

interface Contact {
  user_id: number;
  nom: string;
  role: string;
  photo_profil?: string;
  last_message: string;
  last_message_moi: boolean;
  last_message_time?: string;
  non_lus: number;
}

interface Message {
  id: number;
  contenu: string;
  est_lu: boolean;
  date_envoi: string;
  expediteur_id: number;
  destinataire_id: number;
  moi: boolean;
}

function getInitials(name?: string) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatTime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function formatTimeFull(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

const POLL_INTERVAL = 4000;

// ─── Contacts panel ───────────────────────────────────────────────────────────
const ContactsPanel = ({
  contacts,
  loading,
  selected,
  onSelect,
  onBack,
  isMobile,
}: {
  contacts: Contact[];
  loading: boolean;
  selected: Contact | null;
  onSelect: (c: Contact) => void;
  onBack: () => void;
  isMobile: boolean;
}) => (
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="px-4 py-3 border-b border-surface-container bg-white shrink-0">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button onClick={onBack} className="p-1.5 -ml-1 rounded-xl hover:bg-surface-container text-primary/50 hover:text-primary transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <div>
          <h2 className="font-bold text-primary text-base">Messages</h2>
          <p className="text-xs text-primary/40 font-medium">
            {loading ? '…' : `${contacts.length} conversation${contacts.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>
    </div>

    {/* List */}
    <div className="flex-1 overflow-y-auto divide-y divide-surface-container bg-white">
      {loading ? (
        <div className="space-y-0 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 px-4 py-4">
              <div className="w-11 h-11 rounded-full bg-surface-container shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-surface-container rounded-lg w-2/3" />
                <div className="h-3 bg-surface-container rounded-lg w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-14 h-14 bg-surface-container rounded-full flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/30">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-primary/50 mb-1">Aucune conversation</p>
          <p className="text-xs text-primary/35">Contactez un vendeur depuis le marketplace pour démarrer.</p>
        </div>
      ) : (
        contacts.map(contact => {
          const isSelected = selected?.user_id === contact.user_id;
          return (
            <button
              key={contact.user_id}
              onClick={() => onSelect(contact)}
              className={cn(
                'w-full px-4 py-3.5 flex items-center gap-3 text-left transition-colors hover:bg-surface-container',
                isSelected && 'bg-primary/5'
              )}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className={cn(
                  'w-11 h-11 rounded-full flex items-center justify-center text-sm font-black',
                  isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-primary'
                )}>
                  {getInitials(contact.nom)}
                </div>
                {contact.non_lus > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-on-primary text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                    {contact.non_lus > 9 ? '9+' : contact.non_lus}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-bold text-primary truncate">{contact.nom}</span>
                  {contact.last_message_time && (
                    <span className="text-[10px] text-primary/35 shrink-0">{formatTime(contact.last_message_time)}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {contact.last_message_moi && (
                    <span className="text-primary/35 text-xs shrink-0">Vous:</span>
                  )}
                  <span className={cn(
                    'text-xs truncate',
                    contact.non_lus > 0 ? 'font-semibold text-primary' : 'text-primary/50'
                  )}>
                    {contact.last_message}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-primary/30 uppercase tracking-wide capitalize">{contact.role}</span>
              </div>
            </button>
          );
        })
      )}
    </div>
  </div>
);

// ─── Conversation panel ───────────────────────────────────────────────────────
const ConversationPanel = ({
  contact,
  messages,
  loadingMsgs,
  onSend,
  onBack,
  currentUserId,
  hideHeader = false,
}: {
  contact: Contact;
  messages: Message[];
  loadingMsgs: boolean;
  onSend: (text: string) => Promise<void>;
  onBack: () => void;
  currentUserId: number;
  hideHeader?: boolean;
}) => {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }, [input]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);
    await onSend(text);
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header — only shown on desktop (hideHeader=true on mobile) */}
      {!hideHeader && (
        <div className="bg-white border-b border-surface-container px-4 py-3 flex items-center gap-3 shrink-0 shadow-sm">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-xl hover:bg-surface-container text-primary/50 hover:text-primary transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-black text-primary">{getInitials(contact.nom)}</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-primary truncate">{contact.nom}</p>
            <p className="text-xs text-primary/40 capitalize">{contact.role}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-surface">
        {loadingMsgs ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className={cn('flex gap-2', i % 2 === 0 ? 'justify-end' : 'justify-start')}>
                {i % 2 !== 0 && <div className="w-7 h-7 rounded-full bg-surface-container shrink-0" />}
                <div className={cn('h-9 rounded-2xl bg-surface-container', i % 2 === 0 ? 'w-44' : 'w-56')} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/30">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-primary/50">Démarrez la conversation</p>
            <p className="text-xs text-primary/35 mt-1">Envoyez votre premier message à {contact.nom}.</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMoi = msg.moi;
            const showAvatar = !isMoi && (i === 0 || messages[i - 1].moi);
            return (
              <div key={msg.id} className={cn('flex items-end gap-2', isMoi ? 'justify-end' : 'justify-start')}>
                {!isMoi && (
                  <div className={cn(
                    'w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-[10px] font-black text-primary shrink-0',
                    !showAvatar && 'invisible'
                  )}>
                    {getInitials(contact.nom)}
                  </div>
                )}
                <div className="flex flex-col gap-0.5" style={{ alignItems: isMoi ? 'flex-end' : 'flex-start' }}>
                  <div className={cn(
                    'max-w-[72vw] md:max-w-xs px-4 py-2.5 text-sm leading-relaxed',
                    isMoi
                      ? 'bg-primary text-on-primary rounded-2xl rounded-br-sm'
                      : 'bg-white shadow-sm border border-surface-container text-primary rounded-2xl rounded-bl-sm'
                  )}>
                    {msg.contenu}
                  </div>
                  <span className="text-[10px] text-primary/30 px-1">
                    {formatTimeFull(msg.date_envoi)}
                    {isMoi && <span className="ml-1">{msg.est_lu ? ' ✓✓' : ' ✓'}</span>}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-surface-container px-4 py-3 shrink-0">
        <div className="flex gap-2 items-end">
          <div className="flex-1 bg-surface border-2 border-surface-container-high rounded-2xl px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Message à ${contact.nom}…`}
              rows={1}
              className="w-full bg-transparent text-sm text-primary placeholder:text-primary/35 outline-none resize-none leading-relaxed"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            {sending ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                <path d="M3 12a9 9 0 1 0 9-9" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Chat component ──────────────────────────────────────────────────────
const Chat = () => {
  const { user } = useAuth();
  const { navigate, routeState } = useRouter();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [view, setView] = useState<'contacts' | 'conversation'>('contacts');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load contacts
  const loadContacts = useCallback(async () => {
    try {
      const data = await api('/conversations');
      if (Array.isArray(data)) setContacts(data);
    } catch {
      // ignore
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Handle incoming routeState (contact from marketplace)
  useEffect(() => {
    if (!routeState?.contactId) return;
    const cid = routeState.contactId as number;
    const cnom = (routeState.contactNom as string) || 'Contact';
    const crole = (routeState.contactRole as string) || 'producteur';

    // Check if contact already exists in list
    const existing = contacts.find(c => c.user_id === cid);
    if (existing) {
      openConversation(existing);
    } else {
      // Create a temporary contact entry and open it
      const temp: Contact = {
        user_id: cid,
        nom: cnom,
        role: crole,
        last_message: '',
        last_message_moi: false,
        non_lus: 0,
      };
      setContacts(prev => {
        if (prev.find(c => c.user_id === cid)) return prev;
        return [temp, ...prev];
      });
      openConversation(temp);
    }
  }, [routeState?.contactId, loadingContacts]);

  // Load messages for selected contact + poll
  const loadMessages = useCallback(async (contactId: number) => {
    try {
      const data = await api(`/messages/${contactId}`);
      if (Array.isArray(data)) setMessages(data);
    } catch {
      // ignore
    }
  }, []);

  const openConversation = (contact: Contact) => {
    setSelected(contact);
    setMessages([]);
    setLoadingMsgs(true);
    setView('conversation');

    api(`/messages/${contact.user_id}`)
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));
  };

  // Polling for new messages
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!selected) return;

    pollRef.current = setInterval(() => {
      loadMessages(selected.user_id);
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selected, loadMessages]);

  const handleSend = async (text: string) => {
    if (!selected || !user) return;

    // Optimistic update
    const optimistic: Message = {
      id: Date.now(),
      contenu: text,
      est_lu: false,
      date_envoi: new Date().toISOString(),
      expediteur_id: user.id,
      destinataire_id: selected.user_id,
      moi: true,
    };
    setMessages(prev => [...prev, optimistic]);

    // Update contact's last message
    setContacts(prev =>
      prev.map(c =>
        c.user_id === selected.user_id
          ? { ...c, last_message: text, last_message_moi: true, last_message_time: new Date().toISOString() }
          : c
      )
    );

    try {
      await api('/messages', 'POST', {
        destinataire_id: selected.user_id,
        contenu: text,
      });
      // Refresh messages to get server ID
      await loadMessages(selected.user_id);
    } catch {
      // Keep optimistic message
    }
  };

  const handleBack = () => {
    if (view === 'conversation') {
      setView('contacts');
      if (pollRef.current) clearInterval(pollRef.current);
      loadContacts();
    } else {
      navigate('marketplace');
    }
  };

  const isMobile = true; // always use mobile layout (nav at bottom)

  return (
    <>
      {/* Global header */}
      <header className="bg-white sticky top-0 z-40 border-b border-surface-container shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={handleBack}
            className="p-1.5 -ml-1 rounded-xl hover:bg-surface-container text-primary/50 hover:text-primary transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="font-bold text-primary text-base">
            {view === 'conversation' && selected ? selected.nom : 'Messagerie'}
          </h1>
        </div>
      </header>

      {/* Mobile: toggle between contacts and conversation */}
      <div className="md:hidden pb-24" style={{ minHeight: 'calc(100dvh - 65px)' }}>
        {view === 'contacts' ? (
          <ContactsPanel
            contacts={contacts}
            loading={loadingContacts}
            selected={selected}
            onSelect={openConversation}
            onBack={() => navigate('marketplace')}
            isMobile={false}
          />
        ) : selected ? (
          <div className="flex flex-col" style={{ height: 'calc(100dvh - 65px)' }}>
            <ConversationPanel
              contact={selected}
              messages={messages}
              loadingMsgs={loadingMsgs}
              onSend={handleSend}
              onBack={() => setView('contacts')}
              currentUserId={user?.id || 0}
              hideHeader={true}
            />
          </div>
        ) : null}
      </div>

      {/* Desktop: side-by-side */}
      <div className="hidden md:flex pb-24" style={{ height: 'calc(100dvh - 65px)' }}>
        <div className="w-80 border-r border-surface-container bg-white shrink-0 overflow-hidden flex flex-col">
          <ContactsPanel
            contacts={contacts}
            loading={loadingContacts}
            selected={selected}
            onSelect={openConversation}
            onBack={() => navigate('marketplace')}
            isMobile={false}
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {selected ? (
            <ConversationPanel
              contact={selected}
              messages={messages}
              loadingMsgs={loadingMsgs}
              onSend={handleSend}
              onBack={() => setSelected(null)}
              currentUserId={user?.id || 0}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center bg-surface px-6">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/25">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="font-semibold text-primary/50">Sélectionnez une conversation</p>
              <p className="text-sm text-primary/35 mt-1">ou contactez un vendeur depuis le marketplace.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export { Chat };
