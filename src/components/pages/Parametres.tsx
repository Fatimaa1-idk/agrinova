import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { cn } from '../../lib/utils';
import { Globe, HelpCircle, Bell, MessageSquare, LogOut, Shield, ChevronRight } from 'lucide-react';

const Parametres = () => {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const [notifSMS, setNotifSMS] = useState(true);
  const [notifWhatsApp, setNotifWhatsApp] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState<'fr' | 'wo'>('fr');

  const openBot = () => window.dispatchEvent(new Event('open-agrinova-bot'));

  const handleLogout = () => {
    logout();
    showToast('Déconnecté avec succès');
    navigate('onboarding');
  };

  return (
    <div className="min-h-screen bg-surface pb-32">

      {/* Header */}
      <div
        className="relative overflow-hidden pt-10 pb-8 px-5"
        style={{ background: 'linear-gradient(150deg, #012d1d 0%, #1b4332 55%, #2d5a3d 100%)' }}
      >
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #F6C844 0%, transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="text-white font-headline font-black text-2xl">Paramètres</h1>
          <p className="text-white/50 text-xs font-semibold mt-1">Personnalisez votre expérience</p>
        </div>
      </div>

      <main className="px-4 py-4 space-y-4 max-w-2xl mx-auto">

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-surface-container-high p-5 shadow-sm space-y-4">
          <h3 className="font-headline font-bold text-base text-primary flex items-center gap-2">
            <Bell size={16} className="text-secondary" />
            Notifications
          </h3>

          <label className="flex items-center justify-between cursor-pointer p-1">
            <div>
              <p className="font-bold text-sm">Alertes WhatsApp</p>
              <p className="text-xs font-semibold text-primary/45">Message à chaque nouvelle commande</p>
            </div>
            <div
              onClick={() => setNotifWhatsApp(v => !v)}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors cursor-pointer',
                notifWhatsApp ? 'bg-primary' : 'bg-surface-container-high'
              )}
            >
              <div className={cn(
                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                notifWhatsApp ? 'translate-x-5' : 'translate-x-0.5'
              )} />
            </div>
          </label>

          <div className="border-t border-surface-container-low" />

          <label className="flex items-center justify-between cursor-pointer p-1">
            <div>
              <p className="font-bold text-sm">Notifications SMS</p>
              <p className="text-xs font-semibold text-primary/45">Alertes par SMS (réseau 2G/3G)</p>
            </div>
            <div
              onClick={() => setNotifSMS(v => !v)}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors cursor-pointer',
                notifSMS ? 'bg-primary' : 'bg-surface-container-high'
              )}
            >
              <div className={cn(
                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                notifSMS ? 'translate-x-5' : 'translate-x-0.5'
              )} />
            </div>
          </label>
        </div>

        {/* Langue */}
        <div className="bg-white rounded-2xl border border-surface-container-high p-5 shadow-sm space-y-3">
          <h3 className="font-headline font-bold text-base text-primary flex items-center gap-2">
            <Globe size={16} className="text-secondary" />
            Langue de l'application
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPreferredLanguage('fr')}
              className={cn(
                'p-4 rounded-2xl font-bold border transition-all text-sm flex items-center gap-2',
                preferredLanguage === 'fr' ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-surface-container-high hover:bg-surface-container-low'
              )}
            >
              🇫🇷 Français
            </button>
            <button
              onClick={() => setPreferredLanguage('wo')}
              className={cn(
                'p-4 rounded-2xl font-bold border transition-all text-sm flex items-center gap-2',
                preferredLanguage === 'wo' ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-surface-container-high hover:bg-surface-container-low'
              )}
            >
              🇸🇳 Wolof
            </button>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl border border-surface-container-high p-5 shadow-sm">
          <h3 className="font-headline font-bold text-base text-primary flex items-center gap-2 mb-3">
            <Shield size={16} className="text-secondary" />
            Confidentialité & Sécurité
          </h3>
          <div className="bg-secondary-container/20 border border-secondary-container/40 rounded-2xl p-4">
            <p className="text-xs font-semibold text-primary/65 leading-relaxed">
              Vos données sont stockées de manière sécurisée et ne sont partagées qu'avec les parties concernées par vos transactions. Agrinova respecte votre vie privée.
            </p>
          </div>
        </div>

        {/* Help */}
        <div className="bg-white rounded-2xl border border-surface-container-high p-5 shadow-sm flex items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface border border-surface-container-high flex items-center justify-center shrink-0">
              <HelpCircle size={18} className="text-secondary" />
            </div>
            <div>
              <p className="font-bold text-sm text-primary">Besoin d'aide ?</p>
              <p className="text-xs font-semibold text-primary/45 mt-0.5">Support disponible 7j/7</p>
            </div>
          </div>
          <button
            onClick={openBot}
            className="flex items-center gap-1.5 px-4 py-2 bg-surface hover:bg-surface-container text-primary font-bold rounded-xl border border-surface-container-high text-xs shrink-0 transition-colors shadow-sm"
          >
            <MessageSquare size={12} />
            Contacter
          </button>
        </div>

        {/* Logout — prominently displayed */}
        <div className="bg-red-50 rounded-2xl border border-red-100 p-4 shadow-sm">
          <p className="text-xs text-red-600/70 font-semibold text-center mb-3">
            La déconnexion vous redirigera vers la page d'accueil
          </p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 py-4 text-white font-black bg-red-600 hover:bg-red-700 rounded-xl transition-all text-sm shadow-md active:scale-[0.98]"
          >
            <LogOut size={18} strokeWidth={2.5} />
            Se déconnecter
          </button>
        </div>

      </main>
    </div>
  );
};

export { Parametres };
