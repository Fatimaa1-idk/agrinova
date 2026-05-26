import { useEffect, type ReactNode } from 'react';
import { Navigation, BotFloatingAssistant } from '../components/ui';
import { useRouter, type RoutePath, type RouteState } from '../router/RouterContext';
import { useAuth } from '../context/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { currentPath, navigate } = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (currentPath === 'bot') {
      window.dispatchEvent(new Event('open-agrinova-bot'));
      navigate('accueil');
    }
    if (currentPath === 'profil') {
      navigate('accueil', { tab: 'profil' });
    }
  }, [currentPath, user]);

  const handleNavigation = (page: RoutePath, state?: RouteState) => {
    navigate(page, state);
  };

  return (
    <>
      {children}

      {user && (
        <>
          <BotFloatingAssistant />
          <Navigation
            active={currentPath}
            onNavigate={handleNavigation}
            userRole={user.role}
          />
        </>
      )}
    </>
  );
}
