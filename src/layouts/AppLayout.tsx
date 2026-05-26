import { useState, useEffect, type ReactNode } from 'react';
import { Navigation, BottomSheet, BotFloatingAssistant } from '../components/ui';
import { useRouter, type RoutePath } from '../router/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Sprout, MapPin, Phone, Mail, Package,
  MessageSquare, LogOut, ChevronRight, Star,
  DollarSign, Calendar, Wheat,
} from 'lucide-react';

function ProfilContent({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth();
  const { navigate } = useRouter();
  const { showToast } = useToast();

  const handleLogout = () => {
    logout();
    showToast('Déconnecté avec succès');
    onClose();
    navigate('onboarding');
  };

  const initials = user?.nom?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || '?';

  const stats = [
    { label: 'Membre', value: '2024', icon: Calendar },
    { label: 'Produits', value: '12', icon: Wheat },
    { label: 'Ventes', value: '48', icon: DollarSign },
    { label: 'Note', value: '4.8', icon: Star },
  ];

  const links = [
    { icon: Package, label: 'Mes commandes', action: () => { navigate('mes-commandes'); onClose(); } },
    { icon: MessageSquare, label: 'Messages', action: () => { navigate('chat'); onClose(); } },
  ];

  return (
    <div className="p-5 space-y-4">
      {/* Avatar + info */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl text-primary shadow-md border-2 border-agri-gold/40 shrink-0"
          style={{ background: 'linear-gradient(135deg, #D4A017 0%, #B8860B 100%)' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-primary text-lg leading-tight truncate">{user?.nom}</h3>
          <span className="inline-flex items-center gap-1 bg-primary/8 text-primary px-2 py-0.5 rounded-full text-xs font-bold mt-1">
            <Sprout size={10} />
            {user?.role === 'producteur' ? 'Producteur' : 'Acheteur'}
          </span>
          {user?.localisation && (
            <p className="text-xs text-secondary mt-1 flex items-center gap-1 truncate">
              <MapPin size={10} className="shrink-0" />
              {user.localisation}
            </p>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-surface rounded-2xl p-3 space-y-2">
        {user?.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail size={14} className="text-secondary shrink-0" />
            <span className="text-primary font-medium truncate">{user.email}</span>
          </div>
        )}
        {user?.telephone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone size={14} className="text-secondary shrink-0" />
            <span className="text-primary font-medium">{user.telephone}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-surface rounded-xl p-3 text-center">
              <Icon size={14} className="mx-auto mb-1.5 text-agri-gold" />
              <p className="font-black text-primary text-lg leading-none">{s.value}</p>
              <p className="text-[10px] text-secondary font-semibold mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Links */}
      <div className="bg-white rounded-2xl border border-surface-container overflow-hidden divide-y divide-surface-container">
        {links.map((link, i) => {
          const Icon = link.icon;
          return (
            <button
              key={i}
              onClick={link.action}
              className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center">
                  <Icon size={16} className="text-primary" />
                </div>
                <span className="font-bold text-primary text-sm">{link.label}</span>
              </div>
              <ChevronRight size={16} className="text-secondary" />
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-4 text-red-500 font-bold bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors text-sm"
      >
        <LogOut size={16} />
        Se déconnecter
      </button>
    </div>
  );
}

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { currentPath, navigate } = useRouter();
  const { user } = useAuth();
  const [profilOpen, setProfilOpen] = useState(false);

  // Sync navigation so if the user clicks "Assistant" or goes to 'bot',
  // we open the overlay bubble and redirect them back to their home dashboard!
  useEffect(() => {
    if (currentPath === 'bot') {
      window.dispatchEvent(new Event('open-agrinova-bot'));
      navigate('accueil');
    }
  }, [currentPath, user]);

  const handleNavigation = (page: RoutePath) => {
    if (page === 'profil') {
      setProfilOpen(true);
    } else {
      navigate(page);
    }
  };

  return (
    <>
      {children}

      {user && (
        <>
          {/* Global floating AI assistant bubble overlay */}
          <BotFloatingAssistant />

          <Navigation
            active={currentPath}
            onNavigate={handleNavigation}
            userRole={user.role}
          />

          <BottomSheet
            isOpen={profilOpen}
            onClose={() => setProfilOpen(false)}
            title="Mon Profil"
          >
            <ProfilContent onClose={() => setProfilOpen(false)} />
          </BottomSheet>
        </>
      )}
    </>
  );
}
