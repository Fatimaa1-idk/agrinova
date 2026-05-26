import React, { useState, useEffect } from 'react';
import { BottomSheet, Input } from '../ui';
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
  User, ChevronRight, Heart, Wallet, Zap,
  Sun, ClipboardList, Globe, MapPin,
  Award, ShieldCheck, CheckCircle, Clock,
  Pencil, Camera, Save, Calendar, Wheat, Settings, HelpCircle, LogOut, Info, Shield, Phone,
} from 'lucide-react';

const LANGUAGES = [
  { code: 'FR', flag: '🇫🇷', label: 'Français' },
  { code: 'WO', flag: '🇸🇳', label: 'Wolof' },
  { code: 'PL', flag: '🇨🇮', label: 'Pulaar' },
  { code: 'EN', flag: '🇬🇧', label: 'English' },
];

type Lang = 'FR' | 'WO' | 'PL' | 'EN';
type Section = 'dashboard' | 'profil' | 'settings';

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

const NAV_SECTIONS = [
  { id: 'dashboard' as Section, label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'profil' as Section, label: 'Mon Profil', icon: User },
  { id: 'settings' as Section, label: 'Paramètres', icon: Settings },
];

const Accueil = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { navigate, routeState } = useRouter();

  // UI state
  const [lang, setLang] = useState<Lang>('FR');
  const [speaking, setSpeaking] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('dashboard');

  // Producteur modals
  const [isAjoutProduitOpen, setIsAjoutProduitOpen] = useState(false);
  const [isGestionProduitsOpen, setIsGestionProduitsOpen] = useState(false);

  // Dashboard data
  const [stats, setStats] = useState({ a: 0, b: 0, c: 0.0, d: 0 });
  const [commandes, setCommandes] = useState<any[]>([]);
  const [orderFilter, setOrderFilter] = useState<'toutes' | 'en_cours' | 'terminees'>('toutes');

  // Profile form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    email: user?.email || '',
    localisation: user?.localisation || '',
    telephone: user?.telephone || '',
    bio: (user as any)?.bio || '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [profileLoading, setProfileLoading] = useState(false);

  // Settings state
  const [notifSMS, setNotifSMS] = useState(true);
  const [notifWhatsApp, setNotifWhatsApp] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState<'fr' | 'wo'>('fr');

  const isProducteur = user?.role === 'producteur';
  const t = T[lang];
  const role = isProducteur ? 'producteur' : 'acheteur';
  const initials = user?.nom?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || '?';

  // Handle tab navigation from routeState (e.g. navigate('accueil', { tab: 'profil' }))
  useEffect(() => {
    const tab = routeState?.tab as string | undefined;
    if (tab === 'profil' || tab === 'settings' || tab === 'dashboard') {
      setActiveSection(tab as Section);
    }
  }, [routeState]);

  // Load dashboard data
  useEffect(() => {
    if (!user) return;
    const mockCmds = [
      { id: 1, reference: 'CMD-0012', date_commande: new Date().toISOString(), montant_total: 45000, statut: 'en_attente' },
      { id: 2, reference: 'CMD-0010', date_commande: new Date(Date.now() - 86400000).toISOString(), montant_total: 12500, statut: 'livree' },
      { id: 3, reference: 'CMD-0008', date_commande: new Date(Date.now() - 86400000 * 3).toISOString(), montant_total: 25000, statut: 'livree' },
    ];
    const load = async () => {
      try {
        if (isProducteur) {
          const [produitsRes, commandesRes] = await Promise.all([api('/mes-produits'), api('/mes-commandes')]);
          const nProd = Array.isArray(produitsRes) ? produitsRes.length : 12;
          const nCmdList = Array.isArray(commandesRes) ? commandesRes : [];
          const nCmd = nCmdList.length > 0 ? nCmdList.length : 48;
          const rev = nCmdList.length > 0
            ? nCmdList.reduce((s: number, c: any) => s + (c.montant_total || 0), 0)
            : 95000;
          setStats({ a: nProd, b: nCmd, c: 4.8, d: rev });
          setCommandes(nCmdList.length > 0 ? nCmdList : mockCmds);
        } else {
          const resCmd = await api('/mes-commandes');
          const nCmdList = Array.isArray(resCmd) ? resCmd : [];
          setStats({ a: nCmdList.length || 0, b: 5, c: 0, d: 42000 });
          setCommandes(nCmdList.length > 0 ? nCmdList : mockCmds);
        }
      } catch {
        setStats(isProducteur ? { a: 12, b: 48, c: 4.8, d: 95000 } : { a: 3, b: 5, c: 0, d: 42000 });
        setCommandes(mockCmds);
      }
    };
    load();
  }, [user]);

  const filteredCommandes = commandes.filter(c => {
    if (orderFilter === 'toutes') return true;
    if (orderFilter === 'en_cours') return c.statut !== 'livree' && c.statut !== 'annulée';
    if (orderFilter === 'terminees') return c.statut === 'livree';
    return true;
  });

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

  // Profile handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.nom.trim()) errs.nom = 'Le nom est requis';
    if (!formData.email.trim()) errs.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Email invalide';
    if (!formData.localisation.trim()) errs.localisation = 'La localisation est requise';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setProfileLoading(true);
    try {
      const response = await api('/auth/profile', 'PUT', formData);
      if (response.success) {
        showToast('Profil mis à jour avec succès');
        setIsEditing(false);
        localStorage.setItem('agrinova_user', JSON.stringify({ ...user, ...formData }));
      } else {
        showToast('Erreur lors de la mise à jour');
      }
    } catch {
      showToast('Serveur indisponible. Réessayez plus tard.');
    }
    setProfileLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      nom: user?.nom || '',
      email: user?.email || '',
      localisation: user?.localisation || '',
      telephone: user?.telephone || '',
      bio: (user as any)?.bio || '',
    });
    setFormErrors({});
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    showToast('Déconnecté avec succès');
    navigate('onboarding');
  };

  const openBot = () => window.dispatchEvent(new Event('open-agrinova-bot'));

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
              onClick={() => setActiveSection('profil')}
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
                      onClick={() => setIsGestionProduitsOpen(true)}
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

            {/* RIGHT COLUMN: Orders */}
            <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-surface-container-high p-5 md:p-6 shadow-sm flex flex-col min-h-[400px]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <h2 className="font-headline font-black text-lg text-primary tracking-tight flex items-center gap-2">
                  <Package size={18} className="text-secondary" />
                  Suivi des Commandes
                </h2>
                <div className="flex bg-surface-container-low rounded-lg p-0.5 w-full sm:w-auto overflow-x-auto">
                  {(['toutes', 'en_cours', 'terminees'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setOrderFilter(f)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap',
                        orderFilter === f ? 'bg-white text-primary shadow-sm' : 'text-primary/50 hover:text-primary'
                      )}
                    >
                      {f === 'en_cours' ? 'En cours' : f === 'terminees' ? 'Terminées' : 'Toutes'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {filteredCommandes.map(cmd => (
                  <button
                    key={cmd.id}
                    onClick={() => navigate('mes-commandes')}
                    className="w-full text-left bg-surface hover:bg-surface-container-low p-3.5 rounded-xl border border-surface-container-high flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center border',
                        cmd.statut === 'livree' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'
                      )}>
                        {cmd.statut === 'livree' ? <CheckCircle size={18} /> : <Clock size={18} />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-primary">{cmd.reference || `Commande #${cmd.id}`}</p>
                        <p className="text-[10px] uppercase font-bold text-primary/45 mt-0.5">
                          {cmd.statut === 'livree' ? 'Livrée' : 'En cours'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-primary text-sm">{cmd.montant_total?.toLocaleString()} FCFA</p>
                      <div className="flex items-center justify-end gap-1 text-primary/40 mt-1">
                        <span className="text-[10px] font-semibold">{new Date(cmd.date_commande || Date.now()).toLocaleDateString('fr-FR')}</span>
                        <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </button>
                ))}
                {filteredCommandes.length === 0 && (
                  <div className="py-10 flex flex-col items-center justify-center text-primary/30">
                    <Package size={40} className="mb-2 opacity-50" />
                    <p className="text-sm font-bold">Aucune commande trouvée</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ── MON PROFIL TAB ───────────────────────────────────── */}
        {activeSection === 'profil' && (
          <div className="space-y-4">

            {/* Avatar identity card */}
            <div className="bg-white rounded-2xl border border-surface-container-high p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Avatar with camera */}
                <div className="relative shrink-0">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center font-headline font-black text-3xl text-primary shadow-lg border-2 border-yellow-300"
                    style={{ background: 'linear-gradient(135deg, #F6C844 0%, #E0AB26 100%)' }}
                  >
                    {initials.toUpperCase()}
                  </div>
                  <button className="absolute -bottom-2 -right-2 bg-white text-primary p-2 rounded-full shadow-md border border-surface-container-high hover:bg-primary hover:text-white transition-all">
                    <Camera size={14} />
                  </button>
                </div>

                {/* Name, role, contacts */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="font-headline font-black text-2xl text-primary">{formData.nom || user?.nom || 'Utilisateur'}</h2>
                  <span className="inline-flex items-center gap-1 bg-yellow-400/20 text-primary border border-yellow-300/30 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mt-1">
                    <Sprout size={10} />
                    {isProducteur ? 'Producteur Local' : 'Acheteur'}
                  </span>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                    {(formData.localisation || user?.localisation) && (
                      <span className="inline-flex items-center gap-1 bg-surface text-primary/70 border border-surface-container-high px-2 py-1 rounded-lg text-xs font-semibold">
                        <MapPin size={11} className="text-secondary" />
                        {formData.localisation || user?.localisation}
                      </span>
                    )}
                    {(formData.telephone || user?.telephone) && (
                      <span className="inline-flex items-center gap-1 bg-surface text-primary/70 border border-surface-container-high px-2 py-1 rounded-lg text-xs font-semibold">
                        <Phone size={11} className="text-secondary" />
                        {formData.telephone || user?.telephone}
                      </span>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-primary/8 hover:bg-primary/15 text-primary rounded-xl font-bold text-xs transition-all self-start"
                  >
                    <Pencil size={13} />
                    Modifier
                  </button>
                )}
              </div>
            </div>

            {/* Stats (same as dashboard but smaller) */}
            <div className="bg-white rounded-2xl border border-surface-container-high p-4 shadow-sm">
              <h3 className="font-headline font-extrabold text-xs mb-3 text-primary/60 uppercase tracking-wider">Mes indicateurs</h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Membre', value: '2024', icon: Calendar },
                  { label: 'Produits', value: String(stats.a || 12), icon: Wheat },
                  { label: 'Ventes', value: String(stats.b || 48), icon: DollarSign },
                  { label: 'Note', value: isProducteur ? `${stats.c.toFixed(1)}/5` : '—', icon: Star },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="flex flex-col items-center text-center p-3 bg-surface rounded-xl border border-surface-container-high">
                      <Icon size={14} className="mb-1.5 text-secondary" />
                      <p className="font-black text-primary text-base leading-none">{s.value}</p>
                      <p className="text-[9px] text-primary/45 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Edit form or view mode */}
            <div className="bg-white rounded-2xl border border-surface-container-high p-5 shadow-sm">
              {isEditing ? (
                <div className="space-y-4">
                  <h3 className="font-headline font-bold text-base text-primary">Modifier les informations</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nom complet de l'exploitant"
                      value={formData.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      error={formErrors.nom}
                      icon="User"
                    />
                    <Input
                      label="Adresse email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      type="email"
                      error={formErrors.email}
                      icon="✉️"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Numéro de téléphone"
                      value={formData.telephone}
                      onChange={(e) => handleInputChange('telephone', e.target.value)}
                      placeholder="+221 77 123 45 67"
                      icon="📞"
                    />
                    <Input
                      label="Zone géographique (Ville/Région)"
                      value={formData.localisation}
                      onChange={(e) => handleInputChange('localisation', e.target.value)}
                      error={formErrors.localisation}
                      icon="📍"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-primary/80">Présentation de l'exploitation (Bio)</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Présentez vos types de cultures, votre histoire et votre engagement qualité..."
                      className="w-full px-4 py-3 border-2 border-surface-container-high bg-surface hover:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl outline-none transition-all resize-none font-medium text-primary text-sm"
                      rows={4}
                    />
                  </div>

                  {/* Info tip */}
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-primary/10">
                      <Info size={14} className="text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-primary/65 leading-relaxed">
                      Une biographie soignée et une localisation précise augmentent vos opportunités de ventes de 35%.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2 border-t border-surface-container-low">
                    <button
                      onClick={handleCancel}
                      disabled={profileLoading}
                      className="flex-1 py-3 rounded-2xl font-bold text-primary/65 bg-surface-container-low hover:bg-surface-container transition-colors text-sm"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={profileLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-container transition-colors shadow-md text-sm disabled:opacity-70"
                    >
                      <Save size={16} />
                      {profileLoading ? 'Sauvegarde...' : 'Enregistrer'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-headline font-bold text-base text-primary">Mon histoire & Ferme</h3>

                  <p className="text-sm font-medium text-primary/70 leading-relaxed">
                    {formData.bio || (user as any)?.bio || "Pas de bio rédigée. Cliquez sur 'Modifier' pour ajouter votre présentation."}
                  </p>

                  <div className="border-t border-surface-container-high pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-primary/45 mb-2">Détails personnels</h4>
                      <ul className="space-y-2 text-sm font-semibold">
                        <li className="flex gap-2">
                          <span className="text-primary/45 shrink-0">Email :</span>
                          <span className="text-primary truncate">{formData.email || user?.email}</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-primary/45 shrink-0">Tél. :</span>
                          <span className="text-primary">{formData.telephone || user?.telephone || 'Non renseigné'}</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-primary/45 mb-2">Zone d'activité</h4>
                      <ul className="space-y-2 text-sm font-semibold">
                        <li className="flex gap-2">
                          <span className="text-primary/45 shrink-0">Pays :</span>
                          <span className="text-primary">Sénégal</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-primary/45 shrink-0">Région :</span>
                          <span className="text-primary">{formData.localisation || user?.localisation || 'Non définie'}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Trust banner */}
                  <div className="bg-secondary-container/20 border border-secondary-container/40 rounded-2xl p-4 flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-secondary-container/30">
                      <Shield size={14} className="text-secondary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-primary">Agrinova Confiance & Transparence</p>
                      <p className="text-xs font-semibold text-primary/65 leading-relaxed mt-0.5">
                        Vos informations ne sont partagées qu'avec les acheteurs certifiés lors des transactions.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick shortcuts */}
            <div className="bg-white rounded-2xl border border-surface-container-high p-4 shadow-sm">
              <h3 className="font-headline font-bold text-sm text-primary mb-3">Raccourcis rapides</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button onClick={() => navigate('mes-commandes')} className="flex flex-col p-3 bg-surface hover:bg-primary hover:text-white rounded-xl border border-surface-container-high transition-all group text-left shadow-sm">
                  <Package size={18} className="text-secondary group-hover:text-white mb-2 transition-colors" />
                  <span className="font-bold text-xs">Mes Commandes</span>
                  <span className="text-[10px] opacity-60 mt-0.5">Suivre vos achats</span>
                </button>
                <button onClick={() => navigate('chat')} className="flex flex-col p-3 bg-surface hover:bg-primary hover:text-white rounded-xl border border-surface-container-high transition-all group text-left shadow-sm">
                  <MessageSquare size={18} className="text-secondary group-hover:text-white mb-2 transition-colors" />
                  <span className="font-bold text-xs">Messages</span>
                  <span className="text-[10px] opacity-60 mt-0.5">Vos conversations</span>
                </button>
                {isProducteur && (
                  <>
                    <button onClick={() => setIsAjoutProduitOpen(true)} className="flex flex-col p-3 bg-surface hover:bg-primary hover:text-white rounded-xl border border-surface-container-high transition-all group text-left shadow-sm">
                      <Wheat size={18} className="text-secondary group-hover:text-white mb-2 transition-colors" />
                      <span className="font-bold text-xs">Ajouter Produit</span>
                      <span className="text-[10px] opacity-60 mt-0.5">Mettre en vente</span>
                    </button>
                    <button onClick={openBot} className="flex flex-col p-3 bg-surface hover:bg-primary hover:text-white rounded-xl border border-surface-container-high transition-all group text-left shadow-sm">
                      <HelpCircle size={18} className="text-secondary group-hover:text-white mb-2 transition-colors" />
                      <span className="font-bold text-xs">Assistant IA</span>
                      <span className="text-[10px] opacity-60 mt-0.5">Aide technique</span>
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ── PARAMÈTRES TAB ───────────────────────────────────── */}
        {activeSection === 'settings' && (
          <div className="space-y-4">

            {/* Notifications */}
            <div className="bg-white rounded-2xl border border-surface-container-high p-5 shadow-sm space-y-4">
              <h3 className="font-headline font-bold text-base text-primary">Canaux de notification</h3>

              <label className="flex items-center justify-between cursor-pointer p-1">
                <div>
                  <p className="font-bold text-sm">Alertes WhatsApp</p>
                  <p className="text-xs font-semibold text-primary/45">Recevoir un message WhatsApp à chaque nouvelle commande</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifWhatsApp}
                  onChange={(e) => setNotifWhatsApp(e.target.checked)}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </label>

              <div className="border-t border-surface-container-low" />

              <label className="flex items-center justify-between cursor-pointer p-1">
                <div>
                  <p className="font-bold text-sm">Notifications SMS</p>
                  <p className="text-xs font-semibold text-primary/45">Notifications directes par SMS en cas de réseau limité (2G)</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifSMS}
                  onChange={(e) => setNotifSMS(e.target.checked)}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </label>
            </div>

            {/* Language */}
            <div className="bg-white rounded-2xl border border-surface-container-high p-5 shadow-sm space-y-3">
              <h3 className="font-headline font-bold text-base text-primary">Langue de l'application</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPreferredLanguage('fr')}
                  className={cn(
                    'p-4 rounded-2xl font-bold border transition-all text-sm flex items-center justify-between',
                    preferredLanguage === 'fr' ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-surface-container-high hover:bg-surface-container-low'
                  )}
                >
                  <span>🇫🇷 Français</span>
                  <Globe size={15} />
                </button>
                <button
                  onClick={() => setPreferredLanguage('wo')}
                  className={cn(
                    'p-4 rounded-2xl font-bold border transition-all text-sm flex items-center justify-between',
                    preferredLanguage === 'wo' ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-surface-container-high hover:bg-surface-container-low'
                  )}
                >
                  <span>🇸🇳 Wolof</span>
                  <Globe size={15} />
                </button>
              </div>
            </div>

            {/* Support */}
            <div className="bg-white rounded-2xl border border-surface-container-high p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface border border-surface-container-high flex items-center justify-center shrink-0">
                  <HelpCircle size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm text-primary">Besoin d'aide technique ?</p>
                  <p className="text-xs font-semibold text-primary/45 mt-0.5">Notre équipe Agrinova est disponible 7j/7 pour vous aider.</p>
                </div>
              </div>
              <button
                onClick={openBot}
                className="px-4 py-2 bg-surface hover:bg-surface-container text-primary font-bold rounded-xl border border-surface-container-high text-xs shrink-0 transition-colors shadow-sm self-start sm:self-auto"
              >
                Contacter le support
              </button>
            </div>

            {/* Logout */}
            <div className="bg-white rounded-2xl border border-red-100 p-4 shadow-sm">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 text-red-600 font-bold bg-red-50/50 hover:bg-red-50 rounded-xl border border-red-100/60 hover:border-red-200 transition-all text-sm"
              >
                <LogOut size={16} strokeWidth={2.5} />
                Se déconnecter
              </button>
            </div>

          </div>
        )}

      </main>

      {/* MODALS PRODUCTEUR */}
      {isProducteur && (
        <>
          <BottomSheet
            isOpen={isAjoutProduitOpen}
            onClose={() => setIsAjoutProduitOpen(false)}
            title="Publier un produit"
          >
            <AjoutProduit isEmbedded onFinished={() => setIsAjoutProduitOpen(false)} />
          </BottomSheet>
          <BottomSheet
            isOpen={isGestionProduitsOpen}
            onClose={() => setIsGestionProduitsOpen(false)}
            title="Gérer le catalogue"
          >
            <GestionProduits isEmbedded />
          </BottomSheet>
        </>
      )}

    </div>
  );
};

export { Accueil };
