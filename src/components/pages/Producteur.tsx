import React, { useState, useEffect } from 'react';
import { Button, Card, Icon } from '../ui';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';

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

  const quickActions = [
    {
      icon: '🌾', title: 'Marketplace', subtitle: 'Voir tous les produits',
      action: () => navigate('marketplace'),
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
    },
    {
      icon: '📦', title: 'Commandes', subtitle: 'Gérer les livraisons',
      action: () => navigate('mes-commandes'),
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    },
    {
      icon: '💬', title: 'Messages', subtitle: 'Parler aux acheteurs',
      action: () => navigate('chat'),
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    },
    {
      icon: '🌱', title: 'Assistant', subtitle: 'Conseils agricoles',
      action: () => navigate('bot'),
      color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    },
  ];

  const dashboardStats = [
    {
      value: stats.revenus > 0 ? stats.revenus.toLocaleString() : '0',
      unit: 'FCFA', label: 'Revenus totaux',
      bg: 'bg-green-50', color: 'text-green-700',
    },
    {
      value: stats.commandes.toString(),
      unit: 'cmd', label: 'Commandes reçues',
      bg: 'bg-blue-50', color: 'text-blue-700',
    },
    {
      value: stats.produits > 0
        ? `${Math.min(Math.round((stats.commandes / Math.max(stats.produits, 1)) * 10), 100)}%`
        : '0%',
      unit: '', label: 'Taux de conversion',
      bg: 'bg-yellow-50', color: 'text-yellow-700',
    },
    {
      value: stats.note.toFixed(1),
      unit: '⭐', label: 'Note clients',
      bg: 'bg-purple-50', color: 'text-purple-700',
    },
  ];

  const handleLogout = () => {
    logout();
    showToast('Déconnecté avec succès');
    navigate('onboarding');
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      <div className="bg-white sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center px-6 py-3 max-w-4xl mx-auto">
          <h1 className="font-black text-primary text-xl tracking-tight flex items-center gap-2">
            <Icon name="🌾" size={20} />
            AGRINOVA
          </h1>
          <button className="p-2 rounded-lg hover:bg-surface-container transition-colors">
            <Icon name="🔔" size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-4">
        <Card className="mb-4 overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-primary to-primary-container relative">
            <div
              className="absolute inset-0 opacity-15 bg-cover bg-center"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000)' }}
            />
          </div>

          <div className="px-6 pb-6">
            <div className="flex justify-between items-end -mt-12 mb-4">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-black text-3xl shadow-lg">
                {user?.nom?.[0]?.toUpperCase() || 'P'}
              </div>
              <div className="flex gap-2 pb-1">
                <Button variant="primary" size="sm" onClick={() => navigate('ajouter')}>
                  <Icon name="➕" size={14} className="mr-1" />
                  Publier
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('gestion-produits')}>
                  <Icon name="📋" size={14} className="mr-1" />
                  Mes produits
                </Button>
              </div>
            </div>

            <h2 className="font-black text-primary text-2xl mb-1">{user?.nom || 'Mon Profil'}</h2>
            <p className="text-primary/60 font-semibold text-sm mb-1">
              <Icon name="🚜" size={14} className="mr-1" />
              Producteur Agricole • Agrinova
            </p>
            <p className="text-primary/40 text-sm mb-4">
              <Icon name="📍" size={12} className="mr-1" />
              {user?.localisation || 'Sénégal'} • Membre depuis 2024
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {['🏅 Top Producteur', '✅ Certifié Agrinova', '🚀 Livraison Rapide'].map((badge) => (
                <span key={badge} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                  {badge}
                </span>
              ))}
            </div>

            <div className="border-t border-surface-container pt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: stats.produits.toString(), label: 'Produits publiés' },
                { value: stats.commandes.toString(), label: 'Ventes réalisées' },
                { value: `⭐ ${stats.note.toFixed(1)}`, label: 'Note moyenne' },
                { value: stats.clients.toString(), label: 'Clients satisfaits' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="font-black text-primary text-lg">{stat.value}</p>
                  <p className="text-xs text-primary/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="mb-4">
          <h3 className="font-black text-primary text-base mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={action.action}
                className={cn('p-4 rounded-xl border-2 text-left transition-all duration-200', action.color)}
              >
                <div className="flex items-center gap-3">
                  <Icon name={action.icon} size={28} />
                  <div>
                    <p className="font-black text-primary text-sm">{action.title}</p>
                    <p className="text-primary/60 text-xs">{action.subtitle}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-primary text-base">Tableau de bord</h3>
            <span className="text-xs text-primary/40">Données réelles</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {dashboardStats.map((stat, i) => (
              <div key={i} className={cn('p-4 rounded-xl', stat.bg)}>
                <p className={cn('text-xl font-black', stat.color)}>
                  {stat.value} <span className="text-sm font-bold">{stat.unit}</span>
                </p>
                <p className="text-xs text-primary/60 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full text-red-500 border-red-100 hover:bg-red-50"
        >
          <Icon name="🚪" size={16} className="mr-2" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
};

export { Producteur };
