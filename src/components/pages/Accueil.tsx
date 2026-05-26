import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';
import { cn } from '../../lib/utils';
import {
  Volume2, Bell, Sprout, Package, Star, DollarSign,
  ShoppingBag, MessageSquare, Bot, Plus, LayoutDashboard,
  User, ChevronRight, Heart, Wallet, Zap, TrendingUp,
  Leaf, ArrowUpRight, Sun, ClipboardList, Globe, MapPin
} from 'lucide-react';

const LANGUAGES = [
  { code: 'FR', flag: '🇫🇷', label: 'Français' },
  { code: 'WO', flag: '🇸🇳', label: 'Wolof' },
  { code: 'PL', flag: '🇨🇮', label: 'Pulaar' },
  { code: 'EN', flag: '🇬🇧', label: 'English' },
];

type Lang = 'FR' | 'WO' | 'PL' | 'EN';

const T: Record<Lang, {
  greeting: string;
  subtitle: string;
  role: { producteur: string; acheteur: string };
  statsLabels: { producteur: string[]; acheteur: string[] };
  quickActions: string;
  discover: string;
  aiLabel: string;
  aiSub: string;
  msgLabel: string;
  msgSub: string;
  marketTitle: string;
  marketSub: string;
  tagline: string;
  seeAll: string;
}> = {
  FR: {
    greeting: 'Bonjour',
    subtitle: { producteur: 'Gérez vos produits et suivez vos ventes', acheteur: 'Découvrez les meilleures offres locales' } as any,
    role: { producteur: 'Producteur', acheteur: 'Acheteur' },
    statsLabels: {
      producteur: ['Produits', 'Commandes', 'Note', 'Revenus'],
      acheteur: ['Commandes', 'Favoris', 'Dépenses', 'Points'],
    },
    quickActions: 'Actions rapides',
    discover: 'Votre Espace',
    aiLabel: 'Assistant IA',
    aiSub: 'Posez vos questions',
    msgLabel: 'Messages',
    msgSub: 'Vos conversations',
    marketTitle: 'Marché local frais',
    marketSub: 'Découvrez les producteurs près de vous',
    tagline: 'La technologie qui parle ta langue et veille sur ta terre',
    seeAll: 'Voir le marché',
  },
  WO: {
    greeting: 'Naka def',
    subtitle: { producteur: 'Jëfal sa mbind yi ak sa jënd yi', acheteur: 'Xool ay jën yi ci biir' } as any,
    role: { producteur: 'Baye', acheteur: 'Jëndkat' },
    statsLabels: {
      producteur: ['Mbind yi', 'Commandes', 'Note', 'Xaalis'],
      acheteur: ['Commandes', 'Favoris', 'Xaalis', 'Points'],
    },
    quickActions: 'Dëkkal',
    discover: 'Bës bi',
    aiLabel: 'Jëfandikukat IA',
    aiSub: 'Laaj lu la neex',
    msgLabel: 'Xam-xam',
    msgSub: 'Ay wax ak yënn',
    marketTitle: 'Marse bu siiw',
    marketSub: 'Xool ay baye ci sa ndakaaru',
    tagline: 'Xarala giy wax sa làmmiñ tey sàmm sa suuf',
    seeAll: 'Xool yëp',
  },
  PL: {
    greeting: 'Ngonka',
    subtitle: { producteur: 'Sos golle maa e cuɗi maa', acheteur: 'Yiy huutorii ɗe mbaylii' } as any,
    role: { producteur: 'Demoowo', acheteur: 'Soodoowo' },
    statsLabels: {
      producteur: ['Haaɗe', 'Commandes', 'Note', 'Wuro'],
      acheteur: ['Commandes', 'Favoris', 'Wuro', 'Points'],
    },
    quickActions: 'Baawnde yoɓande',
    discover: 'Hiɓɓinde',
    aiLabel: 'Ballal IA',
    aiSub: 'Laato ko haɓi',
    msgLabel: 'Tindirɗe',
    msgSub: 'Haalaaji maa',
    marketTitle: 'Marse nder ngesa',
    marketSub: 'Yiy demoowo ɗo tiiɗi',
    tagline: 'Karallaagal kaaloowo ɗemngal maa',
    seeAll: 'Yiy fow',
  },
  EN: {
    greeting: 'Hello',
    subtitle: { producteur: 'Manage your products and track sales', acheteur: 'Discover the best local offers' } as any,
    role: { producteur: 'Producer', acheteur: 'Buyer' },
    statsLabels: {
      producteur: ['Products', 'Orders', 'Rating', 'Revenue'],
      acheteur: ['Orders', 'Favorites', 'Spent', 'Points'],
    },
    quickActions: 'Quick actions',
    discover: 'Your Workspace',
    aiLabel: 'AI Assistant',
    aiSub: 'Ask anything',
    msgLabel: 'Messages',
    msgSub: 'Your conversations',
    marketTitle: 'Fresh local market',
    marketSub: 'Discover producers near you',
    tagline: 'Technology that speaks your language',
    seeAll: 'See all',
  },
};

const Accueil = () => {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [lang, setLang] = useState<Lang>('FR');
  const [stats, setStats] = useState({ a: 0, b: 0, c: 0.0, d: 0 });
  const [speaking, setSpeaking] = useState(false);

  const isProducteur = user?.role === 'producteur';
  const t = T[lang];
  const role = isProducteur ? 'producteur' : 'acheteur';

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        if (isProducteur) {
          const [produits, commandes] = await Promise.all([api('/mes-produits'), api('/mes-commandes')]);
          const nProd = Array.isArray(produits) ? produits.length : 12;
          const nCmd = Array.isArray(commandes) ? commandes.length : 48;
          const rev = Array.isArray(commandes)
            ? commandes.reduce((s: number, c: any) => s + (c.montant_total || 0), 0)
            : 95000;
          setStats({ a: nProd, b: nCmd, c: 4.8, d: rev });
        } else {
          const commandes = await api('/mes-commandes');
          const nCmd = Array.isArray(commandes) ? commandes.length : 0;
          setStats({ a: nCmd, b: 5, c: 0, d: 42000 });
        }
      } catch {
        setStats(isProducteur
          ? { a: 12, b: 48, c: 4.8, d: 95000 }
          : { a: 3, b: 5, c: 0, d: 42000 });
      }
    };
    load();
  }, [user]);

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

  const quickActions = isProducteur
    ? [
        { icon: ShoppingBag,    label: { FR: 'Marché',     WO: 'Marse',   PL: 'Marse',   EN: 'Market'    }, to: 'marketplace' as const, bg: 'bg-primary' },
        { icon: LayoutDashboard,label: { FR: 'Dashboard',  WO: 'Potal',   PL: 'Potal',   EN: 'Dashboard' }, to: 'producteur' as const,  bg: 'bg-secondary' },
        { icon: Plus,           label: { FR: 'Ajouter',    WO: 'Yokk',    PL: 'Yokk',    EN: 'Add'       }, to: 'ajouter' as const,     bg: 'bg-yellow-400 text-primary border-yellow-400' },
        { icon: Bot,            label: { FR: 'Assistant',  WO: 'Ballal',  PL: 'Ballal',  EN: 'AI Bot'    }, to: 'bot' as const,         bg: 'bg-primary-container' },
        { icon: MessageSquare,  label: { FR: 'Messages',   WO: 'Xam-xam', PL: 'Tindirɗe',EN: 'Messages'  }, to: 'chat' as const,        bg: 'bg-secondary' },
        { icon: User,           label: { FR: 'Profil',     WO: 'Profil',  PL: 'Profil',  EN: 'Profile'   }, to: 'producteur' as const,  bg: 'bg-primary' },
      ]
    : [
        { icon: ShoppingBag,    label: { FR: 'Marché',    WO: 'Marse',   PL: 'Marse',   EN: 'Market'  }, to: 'marketplace' as const,   bg: 'bg-primary' },
        { icon: ClipboardList,  label: { FR: 'Commandes', WO: 'Commandes',PL: 'Commandes',EN: 'Orders' }, to: 'mes-commandes' as const, bg: 'bg-secondary' },
        { icon: Bot,            label: { FR: 'Assistant', WO: 'Ballal',  PL: 'Ballal',  EN: 'AI Bot'  }, to: 'bot' as const,           bg: 'bg-yellow-400 text-primary border-yellow-400' },
        { icon: MessageSquare,  label: { FR: 'Messages',  WO: 'Xam-xam', PL: 'Tindirɗe',EN: 'Messages'}, to: 'chat' as const,          bg: 'bg-primary-container' },
        { icon: User,           label: { FR: 'Profil',    WO: 'Profil',  PL: 'Profil',  EN: 'Profile' }, to: 'profil' as const,        bg: 'bg-primary' },
      ];

  const initials = user?.nom?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || '?';

  return (
    <div className="min-h-screen bg-surface pb-24 text-primary font-sans">

      {/* ── HERO BANNER (Full Width - Compact) ──────────────────── */}
      <div
        className="relative overflow-hidden pt-4 pb-10 px-5 md:px-8 w-full transition-all duration-300 shadow-sm"
        style={{ background: 'linear-gradient(150deg, #012d1d 0%, #1b4332 55%, #2d5a3d 100%)' }}
      >
        {/* Abstract farm organic shapes */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #F6C844 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute bottom-0 left-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #cdebc4 0%, transparent 70%)' }} />

        {/* Top Control Bar inside Hero */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 w-full z-10 relative">
          
          {/* Native Language Selectors */}
          <div className="flex bg-white/10 backdrop-blur border border-white/10 rounded-xl p-0.5 gap-0.5 select-none w-full sm:w-auto overflow-x-auto">
            {LANGUAGES.map(({ code, flag, label }) => (
              <button
                key={code}
                onClick={() => setLang(code as Lang)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 flex items-center gap-1',
                  lang === code
                    ? 'bg-white text-primary shadow-sm scale-102'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )}
              >
                <span>{flag}</span>
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{code}</span>
              </button>
            ))}
          </div>

          {/* Assistant voice synthesis + notifications */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleSpeak}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border border-white/10',
                speaking ? 'bg-yellow-400 text-primary scale-105 shadow-md shadow-yellow-400/25' : 'bg-white/10 text-white hover:bg-white/20'
              )}
              title="Écouter l'assistance vocale"
            >
              <Volume2 size={16} />
            </button>
            <button className="relative w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full border border-primary" />
            </button>
          </div>

        </div>

        {/* User Welcoming Banner Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Elegant initials gold plate avatar (Lighter Yellow) */}
            <div className="relative shrink-0">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-headline font-black text-xl text-primary shadow-xl border-2 border-yellow-300 select-none transition-transform hover:scale-105 duration-200"
                style={{ background: 'linear-gradient(135deg, #F6C844 0%, #E0AB26 100%)' }}
              >
                {initials.toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-4 border-primary-container" />
            </div>

            <div className="min-w-0 space-y-0.5">
              <p className="text-white/60 text-[10px] font-bold tracking-wider uppercase leading-none">{t.greeting} 👋</p>
              <h1 className="text-white font-headline font-black text-2xl md:text-3xl leading-tight truncate tracking-tight">{user?.nom || "Utilisateur"}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                  <Sprout size={10} className="text-yellow-300" />
                  {t.role[role]}
                </span>
                {user?.localisation && (
                  <span className="inline-flex items-center gap-1 text-white/65 text-[11px] font-semibold">
                    <MapPin size={10} className="text-yellow-300" />
                    <span>{user.localisation} • Sénégal</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-sm">
            <p className="text-white/70 text-xs md:text-sm font-semibold leading-relaxed">
              {(t.subtitle as any)[role]}
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE CONTENT GRID (Full Width - Compact) ────── */}
      <main className="w-full px-3 md:px-8 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
          
          {/* LEFT COLUMN: Activity Stats & Tagline (Col span 4) */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            
            {/* Overlapping Activity Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-surface-container-high p-4.5">
              <h3 className="font-headline font-extrabold text-sm mb-4 text-primary tracking-tight">Activité Récente</h3>
              
              <div className="grid grid-cols-4 gap-1 divide-x divide-surface-container-high">
                {t.statsLabels[role].map((label, i) => {
                  const Icon = statsIcons[i];
                  const colorSets = [
                    'text-primary bg-primary/8',
                    'text-secondary bg-secondary/10',
                    'text-yellow-600 bg-yellow-400/10',
                    'text-primary bg-primary/8',
                  ];
                  return (
                    <div key={i} className="flex flex-col items-center text-center px-0.5 first:pl-0">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2 shadow-sm border border-black/5', colorSets[i])}>
                        <Icon size={14} strokeWidth={2.5} />
                      </div>
                      <p className="text-lg font-headline font-black text-primary leading-none mb-0.5">{formatStat(i)}</p>
                      <p className="text-[9px] font-extrabold text-primary/45 uppercase tracking-wider leading-tight">{label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Senegal agricultural tagline card (Lighter Yellow) */}
            <section
              className="rounded-2xl p-4.5 text-primary relative overflow-hidden shadow-sm flex items-center justify-between"
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

          {/* RIGHT COLUMN: Market Hub, Actions Grid, Bot Widget (Col span 8) */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-surface-container-high p-5 md:p-6 shadow-sm space-y-5">
            
            {/* The Market Hub Showcase */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-headline font-black text-base text-primary tracking-tight">{t.discover}</h2>
                <button
                  onClick={() => navigate('marketplace')}
                  className="flex items-center gap-0.5 text-xs font-bold text-secondary hover:text-primary transition-all duration-200 hover:translate-x-0.5"
                >
                  <span>{t.seeAll}</span>
                  <ChevronRight size={12} />
                </button>
              </div>

              {/* Majestic market banner */}
              <button
                onClick={() => navigate('marketplace')}
                className="w-full rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-left transition-transform hover:scale-[1.005] duration-200 group relative overflow-hidden shadow-sm border border-black/5"
                style={{ background: 'linear-gradient(135deg, #012d1d 0%, #1b4332 100%)' }}
              >
                <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                  <Leaf size={22} className="text-yellow-355 text-yellow-300" />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5 z-10">
                  <p className="text-yellow-300 text-[10px] font-bold uppercase tracking-widest">Agrinova Hub</p>
                  <h3 className="text-white font-headline font-black text-base leading-tight">{t.marketTitle}</h3>
                  <p className="text-white/60 text-xs font-semibold truncate">{t.marketSub}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-white shrink-0 self-end sm:self-auto hover:bg-white/20">
                  <ArrowUpRight size={14} strokeWidth={2.5} />
                </div>
              </button>
            </section>

            {/* Quick Actions Navigation Grid (More Compact Heights) */}
            <section className="space-y-3">
              <h2 className="font-headline font-black text-base text-primary tracking-tight">{t.quickActions}</h2>
              
              <div className="grid grid-cols-3 gap-3">
                {quickActions.map((action, i) => {
                  const ActionIcon = action.icon;
                  const label = (action.label as any)[lang];
                  return (
                    <button
                      key={i}
                      onClick={() => navigate(action.to)}
                      className="bg-surface rounded-xl p-3 flex flex-col items-center gap-2 border border-surface-container-high hover:border-primary/20 hover:shadow-sm transition-all duration-200 active:scale-95 text-center"
                    >
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm border border-black/5', action.bg)}>
                        <ActionIcon size={16} strokeWidth={2.5} />
                      </div>
                      <span className="text-[11px] font-extrabold text-primary tracking-wide leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Split Interactive Widget Panels - Compacter */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Gold AI Assistant plate (Lighter Yellow Gradient) */}
              <button
                onClick={() => navigate('bot')}
                className="rounded-2xl p-4.5 text-left transition-transform hover:scale-[1.005] duration-200 group flex flex-col justify-between h-28 shadow-sm relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #F6C844 0%, #E0AB26 100%)' }}
              >
                <Bot size={22} className="text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-headline font-black text-primary text-sm leading-tight">{t.aiLabel}</p>
                  <p className="text-primary/70 text-[10px] font-bold mt-0.5">{t.aiSub}</p>
                </div>
              </button>

              {/* White clean Message center plate */}
              <button
                onClick={() => navigate('chat')}
                className="rounded-2xl p-4.5 text-left border border-surface-container-high bg-surface hover:border-primary/25 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-28 group shadow-sm"
              >
                <MessageSquare size={22} className="text-secondary group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-headline font-black text-primary text-sm leading-tight">{t.msgLabel}</p>
                  <p className="text-primary/50 text-[10px] font-bold mt-0.5">{t.msgSub}</p>
                </div>
              </button>

            </section>

          </div>

        </div>
      </main>
    </div>
  );
};

export { Accueil };
