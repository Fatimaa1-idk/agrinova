import type { RoutePath } from './RouterContext';

export type RouteGuard =
  | 'public'        // anyone
  | 'guest-only'    // redirect authenticated users away
  | 'auth'          // must be logged in (any role)
  | 'producteur'    // must be logged in as producteur
  | 'acheteur';     // must be logged in as acheteur

export type RouteLayout =
  | 'auth'   // no bottom nav (inscription, connexion)
  | 'app';   // with bottom nav (all app pages)

export interface RouteConfig {
  path: RoutePath;
  guard: RouteGuard;
  layout: RouteLayout;
}

export const routes: RouteConfig[] = [
  { path: 'onboarding',      guard: 'guest-only', layout: 'app'  },
  { path: 'accueil',         guard: 'auth',       layout: 'app'  },
  { path: 'inscription',     guard: 'guest-only', layout: 'auth' },
  { path: 'connexion',       guard: 'guest-only', layout: 'auth' },
  { path: 'marketplace',     guard: 'public',     layout: 'app'  },
  { path: 'produit',         guard: 'public',     layout: 'app'  },
  { path: 'bot',             guard: 'auth',       layout: 'app'  },
  { path: 'chat',            guard: 'auth',       layout: 'app'  },
  { path: 'profil',          guard: 'auth',       layout: 'app'  },
  { path: 'ajouter',         guard: 'producteur', layout: 'app'  },
  { path: 'mes-commandes',   guard: 'auth',       layout: 'app'  },
  { path: 'gestion-produits',guard: 'producteur', layout: 'app'  },
  { path: 'feed',            guard: 'auth',       layout: 'app'  },
  { path: 'farmer-profile',  guard: 'public',     layout: 'app'  },
];
