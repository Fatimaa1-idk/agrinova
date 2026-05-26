import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from './RouterContext';
import { routes } from './routes';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import {
  Onboarding,
  Accueil,
  Marketplace,
  Inscription,
  Connexion,
  Producteur,
  BotAssistant,
  Chat,
  AjoutProduit,
  Profil,
  ProductDetail,
  GestionProduits,
} from '../components/pages';

const pageMap: Record<string, React.ComponentType> = {
  onboarding:       Onboarding,
  accueil:          Accueil,
  marketplace:      Marketplace,
  inscription:      Inscription,
  connexion:        Connexion,
  producteur:       Producteur,
  bot:              BotAssistant,
  chat:             Chat,
  ajouter:          AjoutProduit,
  profil:           Profil,
  produit:          ProductDetail,
  'gestion-produits': GestionProduits,
};

export function Router() {
  const { currentPath, navigate } = useRouter();
  const { user } = useAuth();

  const route = routes.find(r => r.path === currentPath);

  useEffect(() => {
    if (!route) {
      navigate('onboarding');
      return;
    }

    // guest-only: redirect authenticated users to their home
    if (route.guard === 'guest-only' && user) {
      navigate('accueil');
      return;
    }

    // auth: must be logged in
    if (route.guard === 'auth' && !user) {
      navigate('connexion');
      return;
    }

    // producteur: must have producteur role
    if (route.guard === 'producteur') {
      if (!user) { navigate('connexion'); return; }
      if (user.role !== 'producteur') { navigate('marketplace'); return; }
    }

    // acheteur: must have acheteur role
    if (route.guard === 'acheteur') {
      if (!user) { navigate('connexion'); return; }
      if (user.role !== 'acheteur') { navigate('producteur'); return; }
    }
  }, [currentPath, user]);

  if (!route) return null;

  const PageComponent = pageMap[currentPath];
  if (!PageComponent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Page "{currentPath}" en construction
          </h1>
          <button
            onClick={() => navigate('onboarding')}
            className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (route.layout === 'auth') {
    return (
      <AuthLayout>
        <PageComponent />
      </AuthLayout>
    );
  }

  return (
    <AppLayout>
      <PageComponent />
    </AppLayout>
  );
}
