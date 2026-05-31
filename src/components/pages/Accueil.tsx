import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';
import { cn } from '../../lib/utils';
import { AjoutProduit } from './AjoutProduit';
import { GestionProduits } from './GestionProduits';
import {
  Volume2, Bell, Sprout, Package, Star, DollarSign,
  ShoppingBag, MessageSquare, Plus, LayoutDashboard,
  ChevronRight, Heart, Wallet, Zap,
  Sun, ClipboardList, MapPin,
  Award, ShieldCheck, CheckCircle, Clock,
  Wheat,
  X, AlertTriangle,
} from 'lucide-react';

const LANGUAGES = [
  { code: 'FR', flag: '🇫🇷', label: 'Français' },
  { code: 'WO', flag: '🇸🇳', label: 'Wolof' },
  { code: 'PL', flag: '🇨🇮', label: 'Pulaar' },
  { code: 'EN', flag: '🇬🇧', label: 'English' },
];

type Lang = 'FR' | 'WO' | 'PL' | 'EN';
type Section = 'dashboard' | 'commandes' | 'catalogue';

const T: Record<Lang, {
  greeting: string;
  subtitle: string;
  role: { producteur: string; acheteur: string };
  statsLabels: { producteur: string[]; acheteur: string[] };
  tagline: string;
}> = {
  FR: {
    greeting: 'Bonjour',
    subtitle: '',
    role: { producteur: 'Producteur', acheteur: 'Acheteur' },
    statsLabels: {
      producteur: ['Produits', 'Commandes', 'Note', 'Revenus'],
      acheteur: ['Commandes', 'Favoris', 'Dépenses', 'Points'],
    },
    tagline: 'La technologie qui parle ta langue et veille sur ta terre',
  },
  WO: {
    greeting: 'Naka def',
    subtitle: '',
    role: { producteur: 'Baye', acheteur: 'Jëndkat' },
    statsLabels: {
      producteur: ['Mbind yi', 'Commandes', 'Note', 'Xaalis'],
      acheteur: ['Commandes', 'Favoris', 'Xaalis', 'Points'],
    },
    tagline: 'Xarala giy wax sa làmmiñ tey sàmm sa suuf',
  },
  PL: {
    greeting: 'Ngonka',
    subtitle: '',
    role: { producteur: 'Demoowo', acheteur: 'Soodoowo' },
    statsLabels: {
      producteur: ['Haaɗe', 'Commandes', 'Note', 'Wuro'],
      acheteur: ['Commandes', 'Favoris', 'Wuro', 'Points'],
    },
    tagline: 'Karallaagal kaaloowo ɗemngal maa',
  },
  EN: {
    greeting: 'Hello',
    subtitle: '',
    role: { producteur: 'Producer', acheteur: 'Buyer' },
    statsLabels: {
      producteur: ['Products', 'Orders', 'Rating', 'Revenue'],
      acheteur: ['Orders', 'Favorites', 'Spent', 'Points'],
    },
    tagline: 'Technology that speaks your language',
  },
};

const statutConfig: Record<string, { label: string; bg: string; text: string; icon: React.FC<any> }> = {
  en_attente:   { label: 'En attente',  bg: 'bg-amber-50 border-amber-100',   text: 'text-amber-600',  icon: Clock },
  confirmee:    { label: 'Confirmée',   bg: 'bg-blue-50 border-blue-100',     text: 'text-blue-600',   icon: CheckCircle },
  en_livraison: { label: 'En livraison',bg: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-600', icon: Package },
  livree:       { label: 'Livrée',      bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600', icon: CheckCircle },
  annulee:      { label: 'Annulée',     bg: 'bg-red-50 border-red-100',       text: 'text-red-500',    icon: X },
};

const Accueil = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { navigate, routeState } = useRouter();

  const isProducteur = user?.role === 'producteur';

  const NAV_SECTIONS: { id: Section; label: string; icon: React.FC<any> }[] = [
    { id: 'dashboard',  label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'commandes',  label: 'Commandes',        icon: Package },
    ...(isProducteur ? [{ id: 'catalogue' as Section, label: 'Catalogue', icon: ClipboardList }] : []),
  ];

  // UI state
  const [lang, setLang] = useState<Lang>('FR');
  const [speaking, setSpeaking] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('dashboard');

  // Producteur modals
  const [isAjoutProduitOpen, setIsAjoutProduitOpen] = useState(false);

  // Dashboard data
  const [stats, setStats] = useState({ a: 0, b: 0, c: 0.0, d: 0 });
  const [commandes, setCommandes] = useState<any[]>([]);
  const [orderFilter, setOrderFilter] = useState<'toutes' | 'en_cours' | 'terminees'>('toutes');
  const [cancelingId, setCancelingId] = useState<number | null>(null);


  const t = T[lang];
  const role = isProducteur ? 'producteur' : 'acheteur';
  const initials = user?.nom?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || '?';

  // Handle tab navigation from routeState
  useEffect(() => {
    const tab = routeState?.tab as string | undefined;
    if (tab && ['dashboard', 'commandes', 'catalogue'].includes(tab)) {
      setActiveSection(tab as Section);
    }
  }, [routeState]);

  // Load dashboard data
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        if (isProducteur) {
          const [produitsRes, commandesRes] = await Promise.all([api('/mes-produits'), api('/mes-commandes')]);
          const nProd = Array.isArray(produitsRes) ? produitsRes.length : 0;
          const nCmdList = Array.isArray(commandesRes) ? commandesRes : [];
          const rev = nCmdList.reduce((s: number, c: any) => s + (c.montant_total || 0), 0);
          setStats({ a: nProd, b: nCmdList.length, c: 4.8, d: rev });
          setCommandes(nCmdList);
        } else {
          const resCmd = await api('/mes-commandes');
          const nCmdList = Array.isArray(resCmd) ? resCmd : [];
          const spent = nCmdList.reduce((s: number, c: any) => s + (c.montant_total || 0), 0);
          setStats({ a: nCmdList.length, b: 5, c: 0, d: spent });
          setCommandes(nCmdList);
        }
      } catch {
        setStats(isProducteur ? { a: 0, b: 0, c: 4.8, d: 0 } : { a: 0, b: 0, c: 0, d: 0 });
      }
    };
    load();
  }, [user]);

  const filteredCommandes = commandes.filter(c => {
    if (orderFilter === 'toutes') return true;
    if (orderFilter === 'en_cours') return c.statut !== 'livree' && c.statut !== 'annulee';
    if (orderFilter === 'terminees') return c.statut === 'livree';
    return true;
  });

  const handleCancelOrder = async (id: number) => {
    setCancelingId(id);
    try {
      await api(`/commandes/${id}/statut`, 'PUT', { statut: 'annulee' });
      setCommandes(prev => prev.map(c => c.id === id ? { ...c, statut: 'annulee' } : c));
      showToast('Commande annulée avec succès');
    } catch (e: any) {
      showToast(e?.message || 'Impossible d\'annuler cette commande');
    }
    setCancelingId(null);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    const text = `${t.greeting}, ${user?.nom || ''} !`;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'EN' ? 'en-US' : 'fr-FR';
    window.speechSynthesis.speak(u);
    setSpeaking(true);
    u.onend = () => setSpeaking(false);
  };

  const formatStat = (index: number) => {
    const val = [stats.a, stats.b, stats.c, stats.d][index];
    if (index === 2) return isProducteur ? val.toFixed(1) : '—';
    if (index === 3) return val >= 1000 ? `${Math.round(val / 1000)}k` : val.toString();
    return val.toString();
  };

  const statsIcons = isProducteur
    ? [Package, ShoppingBag, Star, DollarSign]
    : [ClipboardList, Heart, Wallet, Zap];

  const openBot = () => window.dispatchEvent(new Event('open-agrinova-bot'));

  /* ── ORDER CARD ─────────────────────────────────────────────── */
  const OrderCard = ({ cmd, showCancel = false }: { cmd: any; showCancel?: boolean }) => {
    const cfg = statutConfig[cmd.statut] || statutConfig['en_attente'];
    const Icon = cfg.icon;
    const isEnAttente = cmd.statut === 'en_attente';
    return (
      <div className="bg-surface hover:bg-surface-container-low rounded-xl border border-surface-container-high p-3.5 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 mt-0.5', cfg.bg, cfg.text)}>
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-primary truncate">
                {cmd.produit_nom || cmd.reference || `Commande #${cmd.id}`}
              </p>
              {cmd.quantite && (
                <p className="text-[10px] text-primary/50 font-semibold">
                  {cmd.quantite} {cmd.produit_unite || 'unité(s)'} • {cmd.produit_prix ? `${cmd.produit_prix.toLocaleString()} FCFA/${cmd.produit_unite || 'u'}` : ''}
                </p>
              )}
              {isProducteur && cmd.acheteur_nom && (
                <p className="text-[10px] text-primary/50 font-semibold mt-0.5">
                  Acheteur : <span className="text-primary/70">{cmd.acheteur_nom}</span>
                </p>
              )}
              {!isProducteur && cmd.agriculteur_nom && (
                <p className="text-[10px] text-primary/50 font-semibold mt-0.5">
                  Vendeur : <span className="text-primary/70">{cmd.agriculteur_nom}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <p className="font-black text-primary text-sm">{(cmd.montant_total || 0).toLocaleString()} F</p>
            <span className={cn('inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold border', cfg.bg, cfg.text)}>
              {cfg.label}
            </span>
            <p className="text-[9px] font-semibold text-primary/35">
              {new Date(cmd.date_commande || Date.now()).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {showCancel && !isProducteur && isEnAttente && (
          <div className="mt-3 pt-3 border-t border-surface-container-high flex justify-end">
            <button
              onClick={() => handleCancelOrder(cmd.id)}
              disabled={cancelingId === cmd.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-60"
            >
              <AlertTriangle size={11} />
              {cancelingId === cmd.id ? 'Annulation...' : 'Annuler la commande'}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface pb-24 text-primary font-sans">

      {/* ── HERO BANNER ──────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden pt-4 pb-10 px-5 md:px-8 w-full shadow-sm"
        style={{ background: 'linear-gradient(150deg, #012d1d 0%, #1b4332 55%, #2d5a3d 100%)' }}
      >
        <div className="pointer-events-none absolute -top-16 -right-16 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #F6C844 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute bottom-0 left-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #cdebc4 0%, transparent 70%)' }} />

        {/* Language + Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 w-full z-10 relative">
          <div className="flex bg-white/10 backdrop-blur border border-white/10 rounded-xl p-0.5 gap-0.5 select-none w-full sm:w-auto overflow-x-auto">
            {LANGUAGES.map(({ code, flag, label }) => (
              <button
                key={code}
                onClick={() => setLang(code as Lang)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 flex items-center gap-1',
                  lang === code
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )}
              >
                <span>{flag}</span>
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{code}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleSpeak}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border border-white/10',
                speaking ? 'bg-yellow-400 text-primary scale-105' : 'bg-white/10 text-white hover:bg-white/20'
              )}
            >
              <Volume2 size={16} />
            </button>
            <button className="relative w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full border border-primary" />
            </button>
          </div>
        </div>

        {/* User Identity */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('profil')}
              className="relative shrink-0 text-left outline-none"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-headline font-black text-xl text-primary shadow-xl border-2 border-yellow-300 select-none transition-transform hover:scale-105 duration-200"
                style={{ background: 'linear-gradient(135deg, #F6C844 0%, #E0AB26 100%)' }}
              >
                {initials.toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-4 border-primary-container" />
            </button>

            <div className="min-w-0 space-y-0.5">
              <p className="text-white/60 text-[10px] font-bold tracking-wider uppercase leading-none">{t.greeting} 👋</p>
              <h1 className="text-white font-headline font-black text-2xl md:text-3xl leading-tight truncate tracking-tight">{user?.nom || 'Utilisateur'}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                  <Sprout size={10} className="text-yellow-300" />
                  {t.role[role]}
                </span>
                {user?.localisation && (
                  <span className="inline-flex items-center gap-1 text-white/65 text-[11px] font-semibold">
                    <MapPin size={10} className="text-yellow-300" />
                    {user.localisation} • Sénégal
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-white/70 text-xs md:text-sm font-semibold leading-relaxed max-w-sm">
            {t.tagline}
          </p>
        </div>
      </div>

      {/* ── SECTION TAB BAR ──────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-surface-container-high">
        <div className="flex w-full px-3 md:px-8 gap-1 py-2 overflow-x-auto">
          {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0',
                activeSection === id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-primary/55 hover:text-primary hover:bg-surface-container-low'
              )}
            >
              <Icon size={13} strokeWidth={2.5} />
              {label}
              {id === 'commandes' && commandes.filter(c => c.statut === 'en_attente').length > 0 && (
                <span className="ml-0.5 bg-amber-400 text-primary text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                  {commandes.filter(c => c.statut === 'en_attente').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <main className="w-full px-3 md:px-8 py-5">

        {/* ── DASHBOARD TAB ────────────────────────────────────── */}
        {activeSection === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">

            {/* LEFT COLUMN */}
            <div className="col-span-12 lg:col-span-4 space-y-4">

              {/* Stats strip */}
              <div className="bg-white rounded-2xl shadow-sm border border-surface-container-high p-4">
                <h3 className="font-headline font-extrabold text-sm mb-4 text-primary tracking-tight">Activité Récente</h3>
                <div className="grid grid-cols-4 gap-1 divide-x divide-surface-container-high">
                  {t.statsLabels[role].map((label, i) => {
                    const Icon = statsIcons[i];
                    const colors = [
                      'text-primary bg-primary/8',
                      'text-secondary bg-secondary/10',
                      'text-yellow-600 bg-yellow-400/10',
                      'text-primary bg-primary/8',
                    ];
                    return (
                      <div key={i} className="flex flex-col items-center text-center px-0.5 first:pl-0">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2 shadow-sm border border-black/5', colors[i])}>
                          <Icon size={14} strokeWidth={2.5} />
                        </div>
                        <p className="text-lg font-headline font-black text-primary leading-none mb-0.5">{formatStat(i)}</p>
                        <p className="text-[9px] font-extrabold text-primary/45 uppercase tracking-wider leading-tight">{label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Producteur controls */}
              {isProducteur && (
                <div className="bg-white rounded-2xl border border-surface-container-high p-4 flex flex-col items-center text-center shadow-sm relative overflow-hidden group">
                  <div className="bg-primary/5 absolute top-0 left-0 right-0 h-16 z-0 transition-all duration-300 group-hover:bg-primary/8" />
                  <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1 z-10 w-full mb-3">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[9px] font-bold border border-emerald-100/60">
                      <Award size={9} /> Top Baye
                    </span>
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[9px] font-bold border border-blue-100/60">
                      <ShieldCheck size={9} /> Certifié
                    </span>
                  </div>
                  <div className="w-full border-t border-surface-container-low my-1 z-10 mb-3" />
                  <div className="w-full space-y-2 z-10">
                    <button
                      onClick={() => setIsAjoutProduitOpen(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-3 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow-md shadow-primary/10 transition-all duration-200 text-xs hover:-translate-y-px"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                      Publier une offre
                    </button>
                    <button
                      onClick={() => setActiveSection('catalogue')}
                      className="w-full flex items-center justify-center gap-1.5 py-3 bg-surface hover:bg-surface-container-low text-primary border border-surface-container-high font-bold rounded-xl transition-all duration-200 text-xs shadow-sm"
                    >
                      <ClipboardList size={14} />
                      Gérer le catalogue
                    </button>
                  </div>
                </div>
              )}

              {/* Tagline */}
              <section
                className="rounded-2xl p-4 text-primary relative overflow-hidden shadow-sm flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #F6C844 0%, #E0AB26 100%)' }}
              >
                <div className="space-y-2 z-10">
                  <div className="flex items-center gap-1">
                    <Sprout size={12} className="text-primary" />
                    <span className="text-primary font-black text-[10px] uppercase tracking-widest leading-none">Agrinova Sénégal</span>
                  </div>
                  <p className="font-headline font-extrabold text-sm leading-relaxed max-w-[240px] text-primary/95">
                    {t.tagline}
                  </p>
                </div>
                <Sun size={48} className="text-primary/10 absolute -right-3 -bottom-3 shrink-0 rotate-12" />
              </section>
            </div>

            {/* RIGHT COLUMN: Last 4 orders */}
            <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-surface-container-high p-5 md:p-6 shadow-sm flex flex-col min-h-[340px]">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-headline font-black text-lg text-primary tracking-tight flex items-center gap-2">
                  <Package size={18} className="text-secondary" />
                  Dernières Commandes
                </h2>
                <button
                  onClick={() => setActiveSection('commandes')}
                  className="flex items-center gap-1 text-xs font-bold text-secondary hover:text-primary transition-colors"
                >
                  Voir toutes
                  <ChevronRight size={13} />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                {commandes.slice(0, 4).map(cmd => (
                  <OrderCard key={cmd.id} cmd={cmd} />
                ))}
                {commandes.length === 0 && (
                  <div className="py-10 flex flex-col items-center justify-center text-primary/30">
                    <Package size={40} className="mb-2 opacity-50" />
                    <p className="text-sm font-bold">Aucune commande pour l'instant</p>
                  </div>
                )}
                {commandes.length > 4 && (
                  <button
                    onClick={() => setActiveSection('commandes')}
                    className="w-full py-3 rounded-xl border border-dashed border-surface-container-high text-xs font-bold text-primary/45 hover:text-primary hover:border-primary/30 transition-colors"
                  >
                    + {commandes.length - 4} commande(s) supplémentaire(s) — Voir tout
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ── COMMANDES TAB ────────────────────────────────────── */}
        {activeSection === 'commandes' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="font-headline font-black text-xl text-primary tracking-tight flex items-center gap-2">
                <Package size={20} className="text-secondary" />
                Mes Commandes
                <span className="text-sm font-bold text-primary/40 ml-1">({filteredCommandes.length})</span>
              </h2>
              <div className="flex bg-surface-container-low rounded-xl p-0.5 w-full sm:w-auto overflow-x-auto border border-surface-container-high">
                {(['toutes', 'en_cours', 'terminees'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setOrderFilter(f)}
                    className={cn(
                      'px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap',
                      orderFilter === f ? 'bg-primary text-white shadow-sm' : 'text-primary/50 hover:text-primary'
                    )}
                  >
                    {f === 'en_cours' ? 'En cours' : f === 'terminees' ? 'Terminées' : 'Toutes'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {filteredCommandes.map(cmd => (
                <OrderCard key={cmd.id} cmd={cmd} showCancel />
              ))}
              {filteredCommandes.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center text-primary/30 bg-white rounded-2xl border border-surface-container-high">
                  <Package size={48} className="mb-3 opacity-30" />
                  <p className="text-base font-bold">Aucune commande trouvée</p>
                  <p className="text-xs font-semibold mt-1">
                    {orderFilter !== 'toutes' ? 'Essayez un autre filtre' : 'Vos commandes apparaîtront ici'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CATALOGUE TAB (producteur only) ──────────────────── */}
        {activeSection === 'catalogue' && isProducteur && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-black text-xl text-primary tracking-tight flex items-center gap-2">
                <ClipboardList size={20} className="text-secondary" />
                Mon Catalogue
              </h2>
              <button
                onClick={() => setIsAjoutProduitOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-container text-white font-bold rounded-xl text-xs transition-all shadow-sm"
              >
                <Plus size={13} strokeWidth={2.5} />
                Nouveau produit
              </button>
            </div>
            <GestionProduits isEmbedded />
          </div>
        )}

      </main>

      {/* MODAL AJOUT PRODUIT */}
      {isProducteur && (
        <BottomSheet
          isOpen={isAjoutProduitOpen}
          onClose={() => setIsAjoutProduitOpen(false)}
          title="Publier un produit"
        >
          <AjoutProduit isEmbedded onFinished={() => setIsAjoutProduitOpen(false)} />
        </BottomSheet>
      )}

    </div>
  );
};

export { Accueil };
