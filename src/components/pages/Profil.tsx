import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';
import { ZonePicker } from '../ui/ZonePicker';
import { cn } from '../../lib/utils';
import {
  User, MapPin, Phone, Camera, Pencil, Save, Star,
  Calendar, Wheat, DollarSign, Package, Shield, Info,
  MessageSquare, HelpCircle, ChevronRight, Sprout,
} from 'lucide-react';

const Profil = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const isProducteur = user?.role === 'producteur';
  const initials = user?.nom?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || '?';

  const [stats, setStats] = useState({ produits: 0, commandes: 0, revenus: 0, note: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    email: user?.email || '',
    localisation: user?.localisation || '',
    telephone: user?.telephone || '',
    bio: (user as any)?.bio || '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        if (isProducteur) {
          const [produits, commandes] = await Promise.all([api('/mes-produits'), api('/mes-commandes')]);
          const nProd = Array.isArray(produits) ? produits.length : 0;
          const nCmd = Array.isArray(commandes) ? commandes : [];
          const rev = nCmd.reduce((s: number, c: any) => s + (c.montant_total || 0), 0);
          setStats({ produits: nProd, commandes: nCmd.length, revenus: rev, note: 4.8 });
        } else {
          const commandes = await api('/mes-commandes');
          const nCmd = Array.isArray(commandes) ? commandes : [];
          const spent = nCmd.reduce((s: number, c: any) => s + (c.montant_total || 0), 0);
          setStats({ produits: 0, commandes: nCmd.length, revenus: spent, note: 0 });
        }
      } catch { /* silence */ }
    };
    load();
  }, [user]);

  useEffect(() => {
    setFormData({
      nom: user?.nom || '',
      email: user?.email || '',
      localisation: user?.localisation || '',
      telephone: user?.telephone || '',
      bio: (user as any)?.bio || '',
    });
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.nom.trim()) errs.nom = 'Le nom est requis';
    if (!formData.email.trim()) errs.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Email invalide';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setProfileLoading(true);
    try {
      const response = await api('/auth/profile', 'PUT', formData);
      if (response.success) {
        updateUser(response.utilisateur ?? formData);
        showToast('Profil mis à jour avec succès');
        setIsEditing(false);
      }
    } catch (e: any) {
      showToast(e?.message || 'Erreur lors de la mise à jour');
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

  const openBot = () => window.dispatchEvent(new Event('open-agrinova-bot'));

  return (
    <div className="min-h-screen bg-surface pb-32">

      {/* Header */}
      <div
        className="relative overflow-hidden pt-10 pb-8 px-5"
        style={{ background: 'linear-gradient(150deg, #012d1d 0%, #1b4332 55%, #2d5a3d 100%)' }}
      >
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #F6C844 0%, transparent 70%)' }} />

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative shrink-0">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-headline font-black text-2xl text-primary shadow-xl border-2 border-yellow-300 select-none"
              style={{ background: 'linear-gradient(135deg, #F6C844 0%, #E0AB26 100%)' }}
            >
              {initials.toUpperCase()}
            </div>
            <button className="absolute -bottom-2 -right-2 bg-white text-primary p-1.5 rounded-full shadow-md border border-surface-container-high hover:bg-primary hover:text-white transition-all">
              <Camera size={12} />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-white font-headline font-black text-xl leading-tight truncate">
              {user?.nom || 'Utilisateur'}
            </h1>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className="inline-flex items-center gap-1 bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                <Sprout size={9} />
                {isProducteur ? 'Producteur' : 'Acheteur'}
              </span>
              {user?.localisation && (
                <span className="inline-flex items-center gap-1 text-white/65 text-[11px] font-semibold">
                  <MapPin size={9} className="text-yellow-300" />
                  {user.localisation}
                </span>
              )}
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-all border border-white/10"
            >
              <Pencil size={12} />
              Modifier
            </button>
          )}
        </div>
      </div>

      <main className="px-4 py-4 space-y-4 max-w-2xl mx-auto">

        {/* Stats */}
        <div className="bg-white rounded-2xl border border-surface-container-high p-4 shadow-sm">
          <h3 className="font-headline font-extrabold text-xs mb-3 text-primary/60 uppercase tracking-wider">Mes indicateurs</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Membre', value: '2024', icon: Calendar },
              { label: isProducteur ? 'Produits' : 'Commandes', value: isProducteur ? String(stats.produits) : String(stats.commandes), icon: isProducteur ? Wheat : Package },
              { label: isProducteur ? 'Ventes' : 'Dépenses', value: stats.revenus >= 1000 ? `${Math.round(stats.revenus / 1000)}k` : String(Math.round(stats.revenus)), icon: DollarSign },
              { label: 'Note', value: isProducteur ? `${stats.note.toFixed(1)}/5` : '—', icon: Star },
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

        {/* Edit / view */}
        <div className="bg-white rounded-2xl border border-surface-container-high p-5 shadow-sm">
          {isEditing ? (
            <div className="space-y-4">
              <h3 className="font-headline font-bold text-base text-primary">Modifier les informations</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider">
                    <User size={10} className="inline mr-1" />Nom complet
                  </label>
                  <input
                    value={formData.nom}
                    onChange={e => handleInputChange('nom', e.target.value)}
                    className={cn('w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium outline-none transition-all',
                      formErrors.nom ? 'border-red-400 bg-red-50' : 'border-surface-container bg-white text-primary focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
                    )}
                  />
                  {formErrors.nom && <p className="text-xs text-red-500 font-bold">{formErrors.nom}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider">✉️ Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    className={cn('w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium outline-none transition-all',
                      formErrors.email ? 'border-red-400 bg-red-50' : 'border-surface-container bg-white text-primary focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
                    )}
                  />
                  {formErrors.email && <p className="text-xs text-red-500 font-bold">{formErrors.email}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider">📞 Téléphone</label>
                <input
                  value={formData.telephone}
                  onChange={e => handleInputChange('telephone', e.target.value)}
                  placeholder="+221 77 123 45 67"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-surface-container bg-white text-primary text-sm font-medium outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              <ZonePicker
                value={formData.localisation}
                onChange={val => handleInputChange('localisation', val)}
                label="Zone géographique"
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-primary/80">Bio / Présentation</label>
                <textarea
                  value={formData.bio}
                  onChange={e => handleInputChange('bio', e.target.value)}
                  placeholder="Présentez votre exploitation, vos cultures, votre engagement qualité..."
                  className="w-full px-4 py-3 border-2 border-surface-container-high bg-surface hover:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl outline-none transition-all resize-none font-medium text-primary text-sm"
                  rows={4}
                />
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-3">
                <Info size={14} className="text-primary shrink-0 mt-0.5" />
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
                {(user as any)?.bio || "Pas de bio rédigée. Cliquez sur 'Modifier' pour ajouter votre présentation."}
              </p>

              <div className="border-t border-surface-container-high pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-primary/45 mb-2">Détails personnels</h4>
                  <ul className="space-y-2 text-sm font-semibold">
                    <li className="flex gap-2">
                      <span className="text-primary/45 shrink-0">Email :</span>
                      <span className="text-primary truncate">{user?.email}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary/45 shrink-0">Tél. :</span>
                      <span className="text-primary">{user?.telephone || 'Non renseigné'}</span>
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
                      <span className="text-primary/45 shrink-0">Zone :</span>
                      <span className="text-primary">{user?.localisation || 'Non définie'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-secondary-container/20 border border-secondary-container/40 rounded-2xl p-4 flex gap-3">
                <Shield size={14} className="text-secondary shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-primary/65 leading-relaxed">
                  Vos informations ne sont partagées qu'avec les acheteurs certifiés lors des transactions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-surface-container-high p-4 shadow-sm">
          <h3 className="font-headline font-bold text-sm text-primary mb-3">Raccourcis rapides</h3>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => navigate('accueil', { tab: 'commandes' })}
              className="flex items-center gap-3 p-3 bg-surface hover:bg-primary/5 rounded-xl border border-surface-container-high transition-all text-left">
              <Package size={16} className="text-secondary shrink-0" />
              <div>
                <p className="font-bold text-xs text-primary">Mes Commandes</p>
                <p className="text-[10px] text-primary/45">Suivre vos achats</p>
              </div>
              <ChevronRight size={12} className="text-primary/30 ml-auto" />
            </button>
            <button onClick={() => navigate('chat')}
              className="flex items-center gap-3 p-3 bg-surface hover:bg-primary/5 rounded-xl border border-surface-container-high transition-all text-left">
              <MessageSquare size={16} className="text-secondary shrink-0" />
              <div>
                <p className="font-bold text-xs text-primary">Messages</p>
                <p className="text-[10px] text-primary/45">Conversations</p>
              </div>
              <ChevronRight size={12} className="text-primary/30 ml-auto" />
            </button>
            {isProducteur && (
              <>
                <button onClick={() => navigate('ajouter')}
                  className="flex items-center gap-3 p-3 bg-surface hover:bg-primary/5 rounded-xl border border-surface-container-high transition-all text-left">
                  <Wheat size={16} className="text-secondary shrink-0" />
                  <div>
                    <p className="font-bold text-xs text-primary">Ajouter Produit</p>
                    <p className="text-[10px] text-primary/45">Mettre en vente</p>
                  </div>
                  <ChevronRight size={12} className="text-primary/30 ml-auto" />
                </button>
                <button onClick={() => navigate('gestion-produits')}
                  className="flex items-center gap-3 p-3 bg-surface hover:bg-primary/5 rounded-xl border border-surface-container-high transition-all text-left">
                  <HelpCircle size={16} className="text-secondary shrink-0" />
                  <div>
                    <p className="font-bold text-xs text-primary">Mon Catalogue</p>
                    <p className="text-[10px] text-primary/45">Gérer produits</p>
                  </div>
                  <ChevronRight size={12} className="text-primary/30 ml-auto" />
                </button>
              </>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export { Profil };
