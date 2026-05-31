import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';
import { ZonePicker } from '../ui/ZonePicker';
import { cn } from '../../lib/utils';
import {
  MapPin, Camera, Pencil, Save, Star, Calendar, Wheat, DollarSign, Package,
  Shield, Info, User, Globe, Bell, HelpCircle, MessageSquare, LogOut, Sprout,
} from 'lucide-react';

type Tab = 'infos' | 'reglages';

const Profil = () => {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const isProducteur = user?.role === 'producteur';
  const initials = user?.nom?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || '?';

  const [activeTab, setActiveTab] = useState<Tab>('infos');
  const [stats, setStats] = useState({ produits: 0, commandes: 0, revenus: 0 });
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

  // Settings state
  const [notifSMS, setNotifSMS] = useState(true);
  const [notifWhatsApp, setNotifWhatsApp] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState<'fr' | 'wo'>('fr');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        if (isProducteur) {
          const [produits, commandes] = await Promise.all([api('/mes-produits'), api('/mes-commandes')]);
          const nProd = Array.isArray(produits) ? produits.length : 0;
          const nCmd = Array.isArray(commandes) ? commandes : [];
          setStats({ produits: nProd, commandes: nCmd.length, revenus: nCmd.reduce((s: number, c: any) => s + (c.montant_total || 0), 0) });
        } else {
          const commandes = await api('/mes-commandes');
          const nCmd = Array.isArray(commandes) ? commandes : [];
          setStats({ produits: 0, commandes: nCmd.length, revenus: nCmd.reduce((s: number, c: any) => s + (c.montant_total || 0), 0) });
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
        showToast('Profil mis à jour');
        setIsEditing(false);
      }
    } catch (e: any) {
      showToast(e?.message || 'Erreur lors de la mise à jour');
    }
    setProfileLoading(false);
  };

  const handleLogout = () => {
    logout();
    showToast('Déconnecté');
    navigate('onboarding');
  };

  const openBot = () => window.dispatchEvent(new Event('open-agrinova-bot'));

  return (
    <div className="min-h-screen bg-surface pb-32">

      {/* Header banner */}
      <div
        className="relative overflow-hidden pt-10 pb-6 px-5"
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
        </div>

        {/* Stats strip */}
        <div className="flex gap-4 mt-5 relative z-10">
          {[
            { label: 'Membre depuis', value: '2024' },
            { label: isProducteur ? 'Produits' : 'Commandes', value: isProducteur ? stats.produits : stats.commandes },
            { label: isProducteur ? 'Ventes' : 'Commandes', value: isProducteur ? stats.commandes : stats.commandes },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center bg-white/10 rounded-xl px-4 py-2 flex-1 border border-white/10">
              <p className="text-white font-black text-lg leading-none">{s.value}</p>
              <p className="text-white/50 text-[9px] font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-surface-container-high">
        <div className="flex max-w-2xl mx-auto px-4 gap-1 py-2">
          {([
            { id: 'infos' as Tab, label: 'Infos personnelles', icon: User },
            { id: 'reglages' as Tab, label: 'Réglages', icon: Globe },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all',
                activeTab === id ? 'bg-primary text-white' : 'text-primary/55 hover:text-primary hover:bg-surface-container-low'
              )}
            >
              <Icon size={13} strokeWidth={2.5} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-4 space-y-4 max-w-2xl mx-auto">

        {/* ── INFOS TAB ─────────────────────────────────────────── */}
        {activeTab === 'infos' && (
          <>
            {/* Edit / view card */}
            <div className="bg-white rounded-2xl border border-surface-container-high p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline font-bold text-base text-primary">Informations personnelles</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/8 hover:bg-primary/15 text-primary rounded-xl font-bold text-xs transition-all"
                  >
                    <Pencil size={12} />
                    Modifier
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider">Nom complet</label>
                      <input
                        value={formData.nom}
                        onChange={e => handleInputChange('nom', e.target.value)}
                        className={cn('w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium outline-none transition-all',
                          formErrors.nom ? 'border-red-400 bg-red-50' : 'border-surface-container bg-white text-primary focus:border-primary/40 focus:ring-2 focus:ring-primary/10')}
                      />
                      {formErrors.nom && <p className="text-xs text-red-500 font-bold">{formErrors.nom}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => handleInputChange('email', e.target.value)}
                        className={cn('w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium outline-none transition-all',
                          formErrors.email ? 'border-red-400 bg-red-50' : 'border-surface-container bg-white text-primary focus:border-primary/40 focus:ring-2 focus:ring-primary/10')}
                      />
                      {formErrors.email && <p className="text-xs text-red-500 font-bold">{formErrors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider">Téléphone</label>
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
                    <label className="block text-sm font-bold text-primary/80">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={e => handleInputChange('bio', e.target.value)}
                      placeholder="Présentez votre exploitation..."
                      className="w-full px-4 py-3 border-2 border-surface-container-high bg-surface focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl outline-none transition-all resize-none font-medium text-primary text-sm"
                      rows={3}
                    />
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex gap-2">
                    <Info size={14} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-primary/65">Une bio soignée augmente vos opportunités de vente de 35%.</p>
                  </div>

                  <div className="flex gap-3 pt-2 border-t border-surface-container-low">
                    <button
                      onClick={() => { setIsEditing(false); setFormErrors({}); }}
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
                      <Save size={15} />
                      {profileLoading ? 'Sauvegarde...' : 'Enregistrer'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Nom', value: user?.nom },
                      { label: 'Email', value: user?.email },
                      { label: 'Téléphone', value: user?.telephone || 'Non renseigné' },
                      { label: 'Zone', value: user?.localisation || 'Non définie' },
                    ].map(f => (
                      <div key={f.label} className="bg-surface rounded-xl p-3">
                        <p className="text-[10px] font-extrabold text-primary/40 uppercase tracking-wider mb-1">{f.label}</p>
                        <p className="text-sm font-semibold text-primary truncate">{f.value}</p>
                      </div>
                    ))}
                  </div>
                  {(user as any)?.bio && (
                    <div className="bg-surface rounded-xl p-3">
                      <p className="text-[10px] font-extrabold text-primary/40 uppercase tracking-wider mb-1">Bio</p>
                      <p className="text-sm font-medium text-primary/70 leading-relaxed">{(user as any).bio}</p>
                    </div>
                  )}
                  <div className="bg-secondary-container/20 border border-secondary-container/40 rounded-xl p-3 flex gap-2">
                    <Shield size={13} className="text-secondary shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-primary/65">Infos partagées uniquement lors de transactions certifiées.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl border border-surface-container-high p-4 shadow-sm">
              <h3 className="font-headline font-extrabold text-xs mb-3 text-primary/60 uppercase tracking-wider">Indicateurs</h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Membre', value: '2024', icon: Calendar },
                  { label: isProducteur ? 'Produits' : 'Cmdes', value: isProducteur ? stats.produits : stats.commandes, icon: isProducteur ? Wheat : Package },
                  { label: isProducteur ? 'Ventes' : 'Dépenses', value: stats.revenus >= 1000 ? `${Math.round(stats.revenus / 1000)}k` : String(Math.round(stats.revenus)), icon: DollarSign },
                  { label: 'Note', value: isProducteur ? '4.8/5' : '—', icon: Star },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="flex flex-col items-center text-center p-3 bg-surface rounded-xl border border-surface-container-high">
                      <Icon size={14} className="mb-1.5 text-secondary" />
                      <p className="font-black text-primary text-base leading-none">{String(s.value)}</p>
                      <p className="text-[9px] text-primary/45 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── RÉGLAGES TAB ──────────────────────────────────────── */}
        {activeTab === 'reglages' && (
          <>
            {/* Notifications */}
            <div className="bg-white rounded-2xl border border-surface-container-high p-5 shadow-sm space-y-4">
              <h3 className="font-headline font-bold text-base text-primary flex items-center gap-2">
                <Bell size={16} className="text-secondary" />Notifications
              </h3>
              {[
                { label: 'Alertes WhatsApp', desc: 'Message à chaque nouvelle commande', val: notifWhatsApp, set: setNotifWhatsApp },
                { label: 'Notifications SMS', desc: 'Alertes par SMS (réseau 2G/3G)', val: notifSMS, set: setNotifSMS },
              ].map((n, i) => (
                <React.Fragment key={n.label}>
                  {i > 0 && <div className="border-t border-surface-container-low" />}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{n.label}</p>
                      <p className="text-xs font-semibold text-primary/45">{n.desc}</p>
                    </div>
                    <button
                      onClick={() => n.set(v => !v)}
                      className={cn('relative w-11 h-6 rounded-full transition-colors', n.val ? 'bg-primary' : 'bg-surface-container-high')}
                    >
                      <div className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', n.val ? 'translate-x-5' : 'translate-x-0.5')} />
                    </button>
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Langue */}
            <div className="bg-white rounded-2xl border border-surface-container-high p-5 shadow-sm space-y-3">
              <h3 className="font-headline font-bold text-base text-primary flex items-center gap-2">
                <Globe size={16} className="text-secondary" />Langue
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[{ code: 'fr', flag: '🇫🇷', label: 'Français' }, { code: 'wo', flag: '🇸🇳', label: 'Wolof' }].map(l => (
                  <button
                    key={l.code}
                    onClick={() => setPreferredLanguage(l.code as 'fr' | 'wo')}
                    className={cn('p-4 rounded-2xl font-bold border transition-all text-sm flex items-center gap-2',
                      preferredLanguage === l.code ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-surface-container-high hover:bg-surface-container-low'
                    )}
                  >
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Help */}
            <div className="bg-white rounded-2xl border border-surface-container-high p-4 shadow-sm flex items-center justify-between gap-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface border border-surface-container-high flex items-center justify-center shrink-0">
                  <HelpCircle size={18} className="text-secondary" />
                </div>
                <div>
                  <p className="font-bold text-sm text-primary">Besoin d'aide ?</p>
                  <p className="text-xs font-semibold text-primary/45 mt-0.5">Support disponible 7j/7</p>
                </div>
              </div>
              <button onClick={openBot} className="flex items-center gap-1.5 px-4 py-2 bg-surface hover:bg-surface-container text-primary font-bold rounded-xl border border-surface-container-high text-xs shrink-0 transition-colors">
                <MessageSquare size={12} />Contacter
              </button>
            </div>

            {/* Logout */}
            <div className="bg-red-50 rounded-2xl border border-red-100 p-4 shadow-sm">
              <p className="text-xs text-red-600/70 font-semibold text-center mb-3">
                Vous serez redirigé vers la page d'accueil
              </p>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2.5 py-4 text-white font-black bg-red-600 hover:bg-red-700 rounded-xl transition-all text-sm shadow-md active:scale-[0.98]"
              >
                <LogOut size={18} strokeWidth={2.5} />
                Se déconnecter
              </button>
            </div>
          </>
        )}

      </main>
    </div>
  );
};

export { Profil };
