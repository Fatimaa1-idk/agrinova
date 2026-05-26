import type { ReactNode } from 'react';
import { Navigation } from '../components/ui';
import { useRouter } from '../router/RouterContext';
import { useAuth } from '../context/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { currentPath, navigate } = useRouter();
  const { user } = useAuth();

  return (
    <>
      {children}
      {user && (
        <Navigation
          active={currentPath}
          onNavigate={navigate}
          userRole={user.role}
        />
      )}
    </>
  );
}
