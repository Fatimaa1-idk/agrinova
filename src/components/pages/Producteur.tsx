import React, { useState, useEffect } from 'react';
import { Button, BottomSheet } from '../ui';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';
import { 
  Bell, Plus, ClipboardList, MapPin, CheckCircle, 
  TrendingUp, Users, Star, DollarSign, Package, 
  MessageSquare, Sprout, LogOut, ChevronRight,
  ShieldCheck, Award, Zap, ArrowUpRight
} from 'lucide-react';
import { AjoutProduit } from './AjoutProduit';
import { GestionProduits } from './GestionProduits';

const Producteur = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const [stats, setStats] = useState({
    produits: 0,
    commandes: 0,
    note: 0.0,
    clients: 0,
    revenus: 0,
  });

  // State pour nos modals (Bottom Sheets)
  const [isAjoutProduitOpen, setIsAjoutProduitOpen] = useState(false);
  const [isGestionProduitsOpen, setIsGestionProduitsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const loadStats = async () => {
      try {
        const [mesProduits, mesCommandes, profil] = await Promise.all([
          api('/mes-produits'),
          api('/mes-commandes'),
          api('/auth/moi'),
        ]);
        const nbProduits = Array.isArray(mesProduits) ? mesProduits.length : 0;
        const nbCommandes = Array.isArray(mesCommandes) ? mesCommandes.length : 0;
        const revenus = Array.isArray(mesCommandes)
          ? mesCommandes.reduce((sum: number, cmd: any) => sum + (cmd.montant_total || 0), 0)
          : 0;
        const clients = Array.isArray(mesCommandes)
          ? new Set(mesCommandes.map((cmd: any) => cmd.acheteur_id)).size
          : 0;
        setStats({ produits: nbProduits, commandes: nbCommandes, note: profil.note_globale || 0.0, clients, revenus });
      } catch {
        // mode démo
      }
    };
    loadStats();
  }, [user]);

  // Recolor quick actions using unified green, sand/beige and harvest gold shades of Accueil page
  const quickActions = [
    {
      icon: TrendingUp, title: 'Marché Local', subtitle: 'Vos offres en ligne',
      action: () => navigate('marketplace'),
      color: 'text-primary bg-primary/8 hover:bg-primary/12 border-primary/10'
    },
    {
      icon: Package, title: 'Mes Commandes', subtitle: 'À préparer',
      action: () => navigate('mes-commandes'),
      color: 'text-secondary bg-secondary-container/20 hover:bg-secondary-container/30 border-secondary-container/20'
    },
    {
      icon: MessageSquare, title: 'Chat Client', subtitle: 'Discussions actives',
      action: () => navigate('chat'),
      color: 'text-primary bg-surface border-surface-container-high hover:bg-surface-container-low'
    },
    {
      icon: Sprout, title: 'Conseils Experts', subtitle: 'Assistant IA',
      action: () => navigate('bot'),
      color: 'text-amber-800 bg-yellow-500/10 hover:bg-yellow-500/15 border-yellow-500/20'
    },
  ];

  // Recolor stats indicators to match the primary deep green, secondary amber/gold, and sand-beige of Accueil
  const dashboardStats = [
    {
      value: stats.revenus > 0 ? stats.revenus.toLocaleString() : '125 000',
      unit: 'FCFA', label: 'Revenus générés', icon: DollarSign,
      color: 'text-primary border-primary/10 bg-primary/5 hover:bg-primary/8'
    },
    {
      value: stats.commandes > 0 ? stats.commandes.toString() : '48',
      unit: 'Cmds', label: 'Livrées', icon: Package,
      color: 'text-secondary border-secondary-container/30 bg-secondary-container/15 hover:bg-secondary-container/20'
    },
    {
      value: stats.produits > 0
        ? `${Math.min(Math.round((stats.commandes / Math.max(stats.produits, 1)) * 10), 100)}`
        : '86',
      unit: '%', label: 'Conversion', icon: TrendingUp,
      color: 'text-amber-800 border-yellow-500/25 bg-yellow-500/10 hover:bg-yellow-500/15'
    },
    {
      value: stats.note > 0 ? stats.note.toFixed(1) : '4.8',
      unit: '/5', label: 'Avis clients', icon: Star,
      color: 'text-amber-700 border-amber-200/50 bg-yellow-50 hover:bg-yellow-50/70'
    },
  ];

  // Simulated activity feed
  const recentActivities = [
    { type: 'order', label: 'Commande reçue', desc: '50kg de Pommes de terre - Dakar', time: 'Il y a 10 min', status: 'À préparer' },
    { type: 'payment', label: 'Paiement reçu', desc: '45 000 FCFA via Wave', time: 'Il y a 1 h', status: 'Validé' },
    { type: 'review', label: 'Nouvel avis', desc: 'Note de 5/5 par Restaurant Noflaye', time: 'Il y a 3 h', status: 'Excellent' }
  ];

  const handleLogout = () => {
    logout();
    showToast('Déconnecté avec succès');
    navigate('onboarding');
  };

  const initials = user?.nom ? user.nom.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'P';

  return (
    <div className="min-h-screen bg-surface pb-24 text-primary font-sans">
      
      {/* Header - Compact */}
      <header className="bg-white/85 backdrop-blur-md sticky top-0 z-40 border-b border-surface-container-high px-5 md:px-8 py-3.5 shadow-sm">
        <div className="flex justify-between items-center w-full mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Sprout size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-headline font-black text-xl tracking-tight text-primary leading-none">Agrinova Producteur</h1>
              <p className="text-[10px] font-semibold text-primary/50 hidden sm:block mt-0.5">Votre espace professionnel d'exploitation</p>
            </div>
          </div>
          <button className="relative p-2 rounded-xl hover:bg-surface-container border border-transparent hover:border-surface-container-high text-primary/70 transition-all duration-200">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      {/* Main Content Area in Full Width - Compact */}
      <main className="w-full px-3 md:px-8 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
          
          {/* LEFT SIDEBAR: Producer details & catalog operations (Col span 4) */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            
            {/* The Producer Portrait Card - Compact */}
            <div className="bg-white rounded-2xl border border-surface-container-high p-5 flex flex-col items-center text-center shadow-sm relative overflow-hidden group">
              <div className="bg-primary/5 absolute top-0 left-0 right-0 h-24 z-0 transition-all duration-300 group-hover:bg-primary/8" />
              
              {/* Avatar block */}
              <div className="relative mt-4 shrink-0 z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary text-white rounded-full flex items-center justify-center font-headline font-black text-2xl shadow-lg border-4 border-white select-none">
                  {initials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-green-500 border-4 border-white shadow-sm" />
              </div>

              {/* Title & location */}
              <div className="mt-3.5 z-10 w-full">
                <h2 className="text-lg font-headline font-black text-primary truncate px-2 leading-tight">{user?.nom || "Producteur Agricole"}</h2>
                <div className="flex items-center justify-center gap-1 text-primary/50 text-[11px] font-semibold mt-1">
                  <MapPin size={11} className="text-secondary" />
                  <span>{user?.localisation || "Zone agricole, Sénégal"}</span>
                </div>
              </div>

              {/* Trust checklist badges (Lighter Yellow badges) */}
              <div className="flex flex-wrap items-center justify-center gap-1 mt-4 z-10">
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[9px] font-bold border border-emerald-100/60 shadow-sm">
                  <Award size={9} /> Top Baye
                </span>
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[9px] font-bold border border-blue-100/60 shadow-sm">
                  <ShieldCheck size={9} /> Certifié
                </span>
                <span className="inline-flex items-center gap-1 bg-yellow-50 text-amber-800 px-2 py-0.5 rounded-md text-[9px] font-bold border border-amber-200/50 shadow-sm">
                  <Zap size={9} /> Rapide
                </span>
              </div>

              <div className="w-full border-t border-surface-container-low my-4 z-10" />

              {/* Catalog & Publish buttons - Compact */}
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
                  className="w-full flex items-center justify-center gap-1.5 py-3 bg-surface hover:bg-surface-container-low text-primary border border-surface-container-high hover:border-surface-container-highest font-bold rounded-xl transition-all duration-200 text-xs shadow-sm"
                >
                  <ClipboardList size={14} />
                  Gérer le catalogue
                </button>
              </div>
            </div>

            {/* Logout section */}
            <div className="bg-white rounded-2xl border border-surface-container-high p-3.5 shadow-sm text-center">
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-2 py-3 text-red-600 font-bold bg-red-50/50 hover:bg-red-50 rounded-xl border border-red-100/60 hover:border-red-200 transition-all duration-200 shadow-sm text-xs"
              >
                <LogOut size={16} strokeWidth={2.5} />
                Se déconnecter
              </button>
            </div>

          </div>

          {/* RIGHT MAIN PANEL: Producer stats & quick actions (Col span 8) */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-surface-container-high p-5 md:p-6 shadow-sm space-y-6">
            
            {/* Welcome Organic Banner - Compact */}
            <div 
              className="rounded-2xl p-5 md:p-6 text-white relative overflow-hidden shadow-sm border border-black/5"
              style={{ background: 'linear-gradient(135deg, #012d1d 0%, #1b4332 100%)' }}
            >
              {/* Decorative design curves */}
              <div className="pointer-events-none absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-10 bg-white" />
              <div className="pointer-events-none absolute top-4 left-1/3 w-28 h-28 rounded-full opacity-5 bg-white" />

              <div className="relative z-10 space-y-1.5">
                <span className="text-yellow-350 text-yellow-300 text-[10px] font-bold uppercase tracking-widest">Tableau de Bord</span>
                <h3 className="font-headline font-black text-xl md:text-2xl tracking-tight leading-tight">Espace Exploitation Agricole</h3>
                <p className="text-white/60 text-xs font-semibold max-w-2xl leading-relaxed">
                  Suivez en temps réel la santé de vos ventes, modifiez votre catalogue de récoltes et répondez directement aux acheteurs.
                </p>
              </div>
            </div>

            {/* Dashboard Activity Stats - Highly Compact */}
            <section className="space-y-3">
              <div className="flex justify-between items-end">
                <h3 className="font-headline font-black text-base text-primary tracking-tight">Activité Globale</h3>
                <span className="text-[10px] font-bold text-primary/40 uppercase tracking-wider">30 derniers jours</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {dashboardStats.map((stat, i) => {
                  const StatIcon = stat.icon;
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        'p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm flex flex-col justify-between h-28', 
                        stat.color
                      )}
                    >
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-black/5">
                        <StatIcon size={16} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-extrabold tracking-wider opacity-60 leading-none">{stat.label}</p>
                        <p className="text-xl font-headline font-black mt-1 leading-none">
                          {stat.value} <span className="text-[10px] font-bold opacity-75 ml-0.5">{stat.unit}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Grid Split: Quick Actions & Live Activity Log - Compact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              
              {/* Quick Actions Grid - Denser */}
              <section className="space-y-3">
                <h3 className="font-headline font-bold text-base text-primary">Accès Rapides</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, i) => {
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={i}
                        onClick={action.action}
                        className={cn(
                          'p-3 rounded-2xl border text-left transition-all duration-200 group hover:shadow-sm flex flex-col justify-between h-28', 
                          action.color
                        )}
                      >
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-black/5 group-hover:scale-105 transition-transform">
                          <ActionIcon size={16} strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="font-extrabold text-xs leading-tight">{action.title}</p>
                          <p className="text-[9px] font-medium mt-0.5 leading-tight opacity-75">{action.subtitle}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Simulated Live Activity Log - Denser */}
              <section className="space-y-3">
                <h3 className="font-headline font-bold text-base text-primary">Activité Récente</h3>
                
                <div className="bg-surface rounded-2xl border border-surface-container-high p-4 space-y-3">
                  {recentActivities.map((act, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 text-[11px] font-semibold">
                      <div className="flex gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1.5 shrink-0",
                          act.type === 'order' ? 'bg-primary' : act.type === 'payment' ? 'bg-secondary' : 'bg-yellow-500'
                        )} />
                        <div>
                          <p className="font-bold text-primary leading-tight">{act.label}</p>
                          <p className="text-[10px] text-primary/50 font-medium mt-0.5 leading-none">{act.desc}</p>
                          <p className="text-[9px] text-primary/40 font-medium mt-1 leading-none">{act.time}</p>
                        </div>
                      </div>
                      <span className="inline-flex px-1.5 py-0.5 rounded bg-white border border-surface-container-high text-[8px] font-extrabold text-primary/75 uppercase tracking-wider leading-none">
                        {act.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

            </div>

          </div>

        </div>
      </main>

      {/* -- BOTTOM SHEETS -- */}
      <BottomSheet 
        isOpen={isAjoutProduitOpen} 
        onClose={() => setIsAjoutProduitOpen(false)}
        title="Nouveau Produit"
        fullHeight
      >
        <div className="p-4 bg-surface rounded-t-3xl min-h-[400px]">
          <AjoutProduit onFinished={() => {
            setIsAjoutProduitOpen(false);
            showToast('Produit publié avec succès !');
          }} isEmbedded />
        </div>
      </BottomSheet>

      <BottomSheet 
        isOpen={isGestionProduitsOpen} 
        onClose={() => setIsGestionProduitsOpen(false)}
        title="Mon Catalogue"
        fullHeight
      >
        <div className="p-4 bg-surface rounded-t-3xl min-h-[400px]">
          <GestionProduits isEmbedded />
        </div>
      </BottomSheet>
    </div>
  );
};

export { Producteur };
