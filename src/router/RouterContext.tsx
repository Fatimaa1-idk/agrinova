import { createContext, useContext, useState, type ReactNode } from 'react';

export type RoutePath =
  | 'onboarding'
  | 'accueil'
  | 'inscription'
  | 'connexion'
  | 'marketplace'
  | 'profil'
  | 'chat'
  | 'bot'
  | 'ajouter'
  | 'produit'
  | 'panier'
  | 'mes-commandes'
  | 'gestion-produits'
  | 'feed'
  | 'farmer-profile'
  | 'parametres';

// Arbitrary data passed alongside a navigation (e.g. selected product)
export type RouteState = Record<string, unknown>;

interface RouterContextValue {
  currentPath: RoutePath;
  routeState: RouteState;
  navigate: (path: RoutePath, state?: RouteState) => void;
}

const RouterContext = createContext<RouterContextValue>(null!);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [currentPath, setCurrentPath] = useState<RoutePath>(() => {
    const saved = localStorage.getItem('agrinova_path') as RoutePath | null;
    return saved || 'onboarding';
  });
  const [routeState, setRouteState] = useState<RouteState>({});

  const navigate = (path: RoutePath, state: RouteState = {}) => {
    localStorage.setItem('agrinova_path', path);
    setCurrentPath(path);
    setRouteState(state);
    window.scrollTo(0, 0);
  };

  return (
    <RouterContext.Provider value={{ currentPath, routeState, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export const useRouter = () => useContext(RouterContext);
