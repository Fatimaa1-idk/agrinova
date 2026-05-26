import React, { useState } from 'react';
import { Button, Input } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';
import { cn } from '../../lib/utils';
import { 
  ArrowLeft, Pencil, Camera, MapPin, Phone, Save, Calendar, Wheat, 
  DollarSign, Star, Package, MessageSquare, Bell, Settings, HelpCircle, 
  LogOut, Info, ChevronRight, LayoutDashboard, User, Globe, Shield, Heart
} from 'lucide-react';

const Profil = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'edit' | 'settings'>('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    email: user?.email || '',
    localisation: user?.localisation || '',
    telephone: user?.telephone || '',
    bio: user?.bio || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Quick settings toggles (mock local states for visual feedback)
  const [notifSMS, setNotifSMS] = useState(true);
  const [notifWhatsApp, setNotifWhatsApp] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState<'fr' | 'wo'>('fr');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.localisation.trim()) newErrors.localisation = 'La localisation est requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await api('/auth/profile', 'PUT', formData);
      if (response.success) {
        showToast('Profil mis à jour avec succès');
        setIsEditing(false);
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('agrinova_user', JSON.stringify(updatedUser));
      } else {
        showToast('Erreur lors de la mise à jour');
      }
    } catch {
      showToast('Serveur indisponible. Réessayez plus tard.');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      nom: user?.nom || '',
      email: user?.email || '',
      localisation: user?.localisation || '',
      telephone: user?.telephone || '',
      bio: user?.bio || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    showToast('Déconnecté avec succès');
    navigate('onboarding');
  };

  const userStats = [
    { label: 'Membre depuis', value: '2024', icon: Calendar, colorClass: 'bg-surface-container-high text-primary border-surface-container-highest' },
    { label: 'Produits actifs', value: '12', icon: Wheat, colorClass: 'bg-primary/5 text-primary border-primary/10' },
    { label: 'Ventes totales', value: '48', icon: DollarSign, colorClass: 'bg-secondary-container/30 text-secondary border-secondary-container/50' },
    { label: 'Note moyenne', value: '4.8/5', icon: Star, colorClass: 'bg-yellow-50 text-amber-600 border-amber-200/50' },
  ];

  const sidebarTabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, description: 'Statistiques et raccourcis' },
    { id: 'edit', label: 'Mon profil & Ferme', icon: User, description: 'Présentation et coordonnées' },
    { id: 'settings', label: 'Paramètres & Compte', icon: Settings, description: 'Notifications et sécurité' },
  ] as const;

  return (
    <div className="min-h-screen bg-surface pb-24 text-primary font-sans">
      {/* Premium Stick Header using Full Width */}
      <header className="bg-white/85 backdrop-blur-md border-b border-surface-container-high px-6 md:px-12 py-5 sticky top-0 z-40 transition-all duration-300">
        <div className="flex items-center justify-between w-full mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('marketplace')}
              className="p-2.5 -ml-2 rounded-2xl hover:bg-surface-container transition-all duration-200 group border border-transparent hover:border-surface-container-high"
              aria-label="Retour au marché"
            >
              <ArrowLeft size={20} className="text-primary/70 group-hover:text-primary transition-colors" />
            </button>
            <div>
              <h1 className="font-headline font-black text-2xl tracking-tight text-primary">Mon Espace Agrinova</h1>
              <p className="text-xs font-semibold text-primary/50 hidden sm:block">Gérez votre exploitation, vos commandes et vos préférences</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'edit' && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-primary-container transition-all duration-200 shadow-md shadow-primary/10 text-sm hover:-translate-y-px"
              >
                <Pencil size={16} strokeWidth={2.5} />
                Modifier le profil
              </button>
            )}
            {activeTab === 'edit' && isEditing && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2.5 rounded-2xl font-bold text-primary/60 bg-surface-container-low hover:bg-surface-container transition-all duration-200 text-sm"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-primary-container transition-all duration-200 shadow-md text-sm disabled:opacity-50"
                >
                  <Save size={16} strokeWidth={2.5} />
                  Sauvegarder
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Full-Width Grid Content */}
      <main className="w-full px-4 md:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* LEFT SIDEBAR PANEL: Farmer Card & Nav Links */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6">
            
            {/* The Farmer Portrait Card */}
            <div className="bg-white rounded-[2rem] border border-surface-container-high p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden group">
              {/* Natural decorative background shade */}
              <div className="bg-primary/5 absolute top-0 left-0 right-0 h-28 z-0 transition-all duration-300 group-hover:bg-primary/8" />
              
              {/* Avatar Container */}
              <div className="relative shrink-0 mt-6 z-10">
                <div className="w-28 h-28 bg-primary rounded-full flex items-center justify-center text-white font-headline font-black text-4xl shadow-lg border-4 border-white transition-transform duration-300 group-hover:scale-105 select-none">
                  {formData.nom ? formData.nom.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'AG'}
                </div>
                <button className="absolute bottom-0 right-0 bg-white text-primary p-2.5 rounded-full hover:bg-primary hover:text-white transition-all duration-200 shadow-md border border-surface-container-high hover:scale-115">
                  <Camera size={16} strokeWidth={2.5} />
                </button>
              </div>

              {/* Identity & Role Badge */}
              <div className="mt-4 z-10 w-full">
                <h2 className="text-xl font-headline font-black text-primary truncate px-2">{formData.nom || "Utilisateur"}</h2>
                <div className="inline-flex items-center gap-1.5 bg-secondary-container text-primary font-bold text-[11px] px-3.5 py-1 rounded-full mt-2 border border-secondary-container/50">
                  <Wheat size={12} className="text-secondary" />
                  <span>Producteur Local</span>
                </div>
              </div>

              <div className="w-full border-t border-surface-container-low my-6 z-10" />

              {/* Quick Contacts inside sidebar */}
              <div className="w-full space-y-3 z-10 text-left text-sm">
                <div className="flex items-center gap-3 bg-surface p-3 rounded-2xl border border-surface-container-high hover:bg-surface-container-low transition-colors duration-200">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-surface-container-high text-secondary">
                    <MapPin size={16} />
                  </div>
                  <div className="truncate">
                    <p className="text-[10px] uppercase font-bold text-primary/45 tracking-wider">Localisation</p>
                    <p className="font-bold text-primary truncate">{formData.localisation || "Non renseignée"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-surface p-3 rounded-2xl border border-surface-container-high hover:bg-surface-container-low transition-colors duration-200">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-surface-container-high text-secondary">
                    <Phone size={16} />
                  </div>
                  <div className="truncate">
                    <p className="text-[10px] uppercase font-bold text-primary/45 tracking-wider">Téléphone</p>
                    <p className="font-bold text-primary truncate">{formData.telephone || "Non renseigné"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Navigation Sidebar Menu */}
            <div className="bg-white rounded-[2rem] border border-surface-container-high p-3.5 shadow-sm">
              <nav className="space-y-1">
                {sidebarTabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const isCurrent = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (tab.id !== 'edit') setIsEditing(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 p-3.5 rounded-2xl text-left transition-all duration-200 group relative",
                        isCurrent 
                          ? "bg-primary text-white shadow-md shadow-primary/10" 
                          : "text-primary/75 hover:bg-surface-container hover:text-primary"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                        isCurrent ? "bg-white/15 text-white" : "bg-surface-container-low text-primary/60 group-hover:bg-white group-hover:text-primary"
                      )}>
                        <TabIcon size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{tab.label}</p>
                        <p className={cn(
                          "text-[10px] font-medium leading-none mt-0.5",
                          isCurrent ? "text-white/60" : "text-primary/40 group-hover:text-primary/50"
                        )}>
                          {tab.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Logout panel styled as premium footer inside sidebar */}
            <div className="bg-white rounded-[2rem] border border-surface-container-high p-4 shadow-sm text-center">
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-2.5 py-3.5 text-red-600 font-bold bg-red-50/50 hover:bg-red-50 rounded-2xl border border-red-100/60 hover:border-red-200 transition-all duration-200 shadow-sm text-sm"
              >
                <LogOut size={18} strokeWidth={2.5} />
                Se déconnecter
              </button>
            </div>

          </div>

          {/* RIGHT MAIN PANEL: Active Workspace */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9 bg-white rounded-[2rem] border border-surface-container-high p-6 md:p-10 shadow-sm min-h-[500px]">
            
            {/* WORKSPACE TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h3 className="font-headline font-black text-2xl md:text-3xl text-primary tracking-tight">Mon Tableau de bord</h3>
                  <p className="text-sm font-semibold text-primary/50 mt-1">Résumé de vos indicateurs clés et activités en cours.</p>
                </div>

                {/* Customized Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {userStats.map((stat, index) => {
                    const StatIcon = stat.icon;
                    return (
                      <div 
                        key={index} 
                        className={cn(
                          "p-5 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between h-36",
                          stat.colorClass
                        )}
                      >
                        <div className="w-10 h-10 bg-white/80 rounded-2xl flex items-center justify-center shadow-sm border border-black/5">
                          <StatIcon size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-extrabold tracking-wider opacity-60">{stat.label}</p>
                          <p className="text-2xl font-headline font-black mt-1 leading-none">{stat.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subsections: Localisation Map & Shortcuts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  
                  {/* Delivery Location showcase */}
                  <div className="bg-surface rounded-3xl border border-surface-container-high p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2.5 text-primary mb-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-surface-container-high flex items-center justify-center text-primary shadow-sm">
                          <MapPin size={18} />
                        </div>
                        <h4 className="font-headline font-bold text-lg">Zone Géographique</h4>
                      </div>
                      <p className="text-sm font-medium text-primary/60 leading-relaxed">
                        Votre principale zone d'exploitation et de livraison définie. Cela aide à connecter les acheteurs à proximité.
                      </p>
                    </div>

                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4.5 mt-6">
                      <p className="font-headline font-extrabold text-primary text-xl truncate">{formData.localisation || "Non précisée"}</p>
                      <p className="text-[11px] text-primary/60 font-semibold mt-1">Zone de livraison principale • Sénégal</p>
                    </div>
                  </div>

                  {/* Quick Shortcuts Widgets */}
                  <div className="bg-surface rounded-3xl border border-surface-container-high p-6 space-y-4">
                    <h4 className="font-headline font-bold text-lg mb-2">Raccourcis rapides</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => navigate('mes-commandes')}
                        className="flex flex-col p-4 bg-white hover:bg-primary hover:text-white rounded-2xl border border-surface-container-high transition-all duration-200 group text-left shadow-sm"
                      >
                        <Package size={20} className="text-secondary group-hover:text-white transition-colors" />
                        <span className="font-bold text-sm mt-3">Mes Commandes</span>
                        <span className="text-[10px] opacity-60 mt-0.5">Suivre vos ventes</span>
                      </button>

                      <button 
                        onClick={() => navigate('chat')}
                        className="flex flex-col p-4 bg-white hover:bg-primary hover:text-white rounded-2xl border border-surface-container-high transition-all duration-200 group text-left shadow-sm"
                      >
                        <MessageSquare size={20} className="text-secondary group-hover:text-white transition-colors" />
                        <span className="font-bold text-sm mt-3">Messages</span>
                        <span className="text-[10px] opacity-60 mt-0.5">Discuter avec les clients</span>
                      </button>

                      <button 
                        onClick={() => navigate('ajouter')}
                        className="flex flex-col p-4 bg-white hover:bg-primary hover:text-white rounded-2xl border border-surface-container-high transition-all duration-200 group text-left shadow-sm"
                      >
                        <Wheat size={20} className="text-secondary group-hover:text-white transition-colors" />
                        <span className="font-bold text-sm mt-3">Ajouter Produit</span>
                        <span className="text-[10px] opacity-60 mt-0.5">Mettre en vente</span>
                      </button>

                      <button 
                        onClick={() => navigate('bot')}
                        className="flex flex-col p-4 bg-white hover:bg-primary hover:text-white rounded-2xl border border-surface-container-high transition-all duration-200 group text-left shadow-sm"
                      >
                        <HelpCircle size={20} className="text-secondary group-hover:text-white transition-colors" />
                        <span className="font-bold text-sm mt-3">Assistant IA</span>
                        <span className="text-[10px] opacity-60 mt-0.5">Aide technique</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* WORKSPACE TAB: EDIT PROFILE */}
            {activeTab === 'edit' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-headline font-black text-2xl md:text-3xl text-primary tracking-tight">Mon Profil & Ferme</h3>
                    <p className="text-sm font-semibold text-primary/50 mt-1">Gérez votre fiche publique visible par les acheteurs d'Agrinova.</p>
                  </div>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="self-start flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2.5 rounded-2xl font-bold transition-all duration-200 text-xs"
                    >
                      <Pencil size={14} strokeWidth={2.5} />
                      Modifier les informations
                    </button>
                  )}
                </div>

                {isEditing ? (
                  // Editing form state (styled perfectly with rich dual-column system)
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input 
                        label="Nom complet de l'exploitant" 
                        value={formData.nom} 
                        onChange={(e) => handleInputChange('nom', e.target.value)} 
                        error={errors.nom} 
                        className="bg-surface hover:bg-white"
                        icon="User"
                      />
                      <Input 
                        label="Adresse email" 
                        value={formData.email} 
                        onChange={(e) => handleInputChange('email', e.target.value)} 
                        type="email" 
                        error={errors.email} 
                        className="bg-surface hover:bg-white"
                        icon="✉️"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input 
                        label="Numéro de téléphone" 
                        value={formData.telephone} 
                        onChange={(e) => handleInputChange('telephone', e.target.value)} 
                        placeholder="+221 77 123 45 67" 
                        className="bg-surface hover:bg-white"
                        icon="📞"
                      />
                      <Input 
                        label="Zone géographique (Ville/Région)" 
                        value={formData.localisation} 
                        onChange={(e) => handleInputChange('localisation', e.target.value)} 
                        error={errors.localisation} 
                        className="bg-surface hover:bg-white"
                        icon="📍"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary/80">Présentation de l'exploitation agricole (Bio)</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Présentez vos types de cultures, votre histoire, et votre engagement qualité auprès des acheteurs..."
                        className="w-full px-4 py-3 border-2 border-surface-container-high bg-surface hover:bg-white hover:border-surface-container-highest focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl outline-none transition-all resize-none font-medium text-primary"
                        rows={5}
                      />
                    </div>

                    {/* Informative tips widget */}
                    <div className="bg-primary/5 border border-primary/10 rounded-3xl p-5 flex gap-4">
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 text-primary mt-0.5 border border-primary/10 shadow-sm">
                        <Info size={16} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-sm text-primary">Informations importantes</h4>
                        <p className="text-xs font-semibold text-primary/65 leading-relaxed mt-1">
                          Ces détails sont partagés avec la communauté d'acheteurs. Une biographie soignée et une localisation précise augmentent vos opportunités de ventes de 35%.
                        </p>
                      </div>
                    </div>

                    {/* Bottom actions for quick save */}
                    <div className="flex items-center gap-3 pt-4 border-t border-surface-container-low">
                      <button 
                        onClick={handleCancel} 
                        disabled={loading}
                        className="px-6 py-3.5 rounded-2xl font-bold text-primary/65 bg-surface-container-low hover:bg-surface-container transition-colors w-1/3 text-sm"
                      >
                        Annuler
                      </button>
                      <button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-container transition-colors shadow-md text-sm disabled:opacity-70"
                      >
                        <Save size={18} strokeWidth={2.5} />
                        Enregistrer les modifications
                      </button>
                    </div>

                  </div>
                ) : (
                  // View profile cards state (premium rustic design)
                  <div className="space-y-6">
                    <div className="bg-surface rounded-3xl border border-surface-container-high p-6 md:p-8 space-y-6">
                      
                      {/* Bio presentation view */}
                      <div>
                        <h4 className="text-xs uppercase font-extrabold tracking-wider text-primary/45 mb-2.5">Histoire & Cultures</h4>
                        <p className="font-headline text-lg font-bold text-primary leading-relaxed">
                          {formData.bio || "Pas de bio rédigée. Prenez quelques instants pour décrire votre exploitation, vos fruits, légumes ou céréales phares !"}
                        </p>
                      </div>

                      <div className="border-t border-surface-container-high pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div>
                          <h4 className="text-xs uppercase font-extrabold tracking-wider text-primary/45 mb-2">Détails Personnels</h4>
                          <ul className="space-y-3 font-semibold text-sm">
                            <li className="flex items-center gap-3">
                              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                              <span className="text-primary/50">Email :</span>
                              <span className="text-primary">{formData.email}</span>
                            </li>
                            <li className="flex items-center gap-3">
                              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                              <span className="text-primary/50">Téléphone :</span>
                              <span className="text-primary">{formData.telephone || "Non renseigné"}</span>
                            </li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-xs uppercase font-extrabold tracking-wider text-primary/45 mb-2">Zone d'activité</h4>
                          <ul className="space-y-3 font-semibold text-sm">
                            <li className="flex items-center gap-3">
                              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                              <span className="text-primary/50">Pays :</span>
                              <span className="text-primary">Sénégal</span>
                            </li>
                            <li className="flex items-center gap-3">
                              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                              <span className="text-primary/50">Région :</span>
                              <span className="text-primary">{formData.localisation || "Non définie"}</span>
                            </li>
                          </ul>
                        </div>

                      </div>
                    </div>

                    {/* Trust banner */}
                    <div className="bg-secondary-container/20 border border-secondary-container/40 rounded-3xl p-5 flex gap-4">
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 text-secondary border border-secondary-container/30 shadow-sm">
                        <Shield size={16} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-sm text-primary">Agrinova Confiance & Transparence</h4>
                        <p className="text-xs font-semibold text-primary/65 leading-relaxed mt-0.5">
                          Votre profil bénéficie du label de confiance Agrinova. Vos informations de contact ne sont partagées qu'avec les acheteurs certifiés lors des transactions.
                        </p>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* WORKSPACE TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h3 className="font-headline font-black text-2xl md:text-3xl text-primary tracking-tight">Paramètres & Préférences</h3>
                  <p className="text-sm font-semibold text-primary/50 mt-1">Configurez vos alertes, votre langue et accédez à notre support technique.</p>
                </div>

                <div className="space-y-6">
                  
                  {/* Notifications Card */}
                  <div className="bg-surface rounded-3xl border border-surface-container-high p-6 space-y-4">
                    <h4 className="font-headline font-bold text-lg mb-2">Canaux de notification</h4>
                    
                    <div className="space-y-4">
                      
                      {/* WhatsApp toggle */}
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

                      {/* SMS Toggle */}
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
                  </div>

                  {/* Language Card */}
                  <div className="bg-surface rounded-3xl border border-surface-container-high p-6 space-y-4">
                    <h4 className="font-headline font-bold text-lg mb-2">Langue de l'application</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      
                      <button 
                        onClick={() => setPreferredLanguage('fr')}
                        className={cn(
                          "p-4 rounded-2xl font-bold border transition-all duration-200 flex items-center justify-between text-sm",
                          preferredLanguage === 'fr' 
                            ? "bg-primary text-white border-primary" 
                            : "bg-white text-primary border-surface-container-high hover:bg-surface-container-low"
                        )}
                      >
                        <span>Français</span>
                        <Globe size={16} />
                      </button>

                      <button 
                        onClick={() => setPreferredLanguage('wo')}
                        className={cn(
                          "p-4 rounded-2xl font-bold border transition-all duration-200 flex items-center justify-between text-sm",
                          preferredLanguage === 'wo' 
                            ? "bg-primary text-white border-primary" 
                            : "bg-white text-primary border-surface-container-high hover:bg-surface-container-low"
                        )}
                      >
                        <span>Wolof (Peulh/Sérère)</span>
                        <Globe size={16} />
                      </button>

                    </div>
                  </div>

                  {/* Assistance & Support Card */}
                  <div className="bg-surface rounded-3xl border border-surface-container-high p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-surface-container-high flex items-center justify-center text-primary shadow-sm mt-0.5">
                        <HelpCircle size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-base text-primary">Besoin d'aide technique ?</h4>
                        <p className="text-xs font-semibold text-primary/45 mt-0.5">Notre équipe d'assistance Agrinova est disponible 7j/7 pour vous aider.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('bot')}
                      className="px-5 py-2.5 bg-white hover:bg-surface-container text-primary font-bold rounded-2xl border border-surface-container-high transition-colors shadow-sm text-xs self-start md:self-auto shrink-0"
                    >
                      Contacter le support
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
};

export { Profil };
