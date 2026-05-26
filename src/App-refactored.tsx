import { useState, useEffect } from 'react';
import { Onboarding, Marketplace } from './components/pages';
import { Toast } from './components/ui';

// const API = 'https://agrinova-backend-yt2f.onrender.com/api';
const API = 'http://127.0.0.1:8000/api';

async function api(endpoint: string, method = 'GET', body?: object) {
  const token = localStorage.getItem('agrinova_token');
  const res = await fetch(`${API}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res.json();
}

type Page = 'onboarding' | 'inscription' | 'connexion' | 'marketplace' | 'producteur' | 'profil' | 'chat' | 'bot' | 'panier' | 'livraison' | 'notation' | 'ajouter' | 'produit' | 'mes-commandes' | 'gestion-produits';

export default function App() {
  const [page, setPage] = useState<Page>('onboarding');
  const [utilisateur, setUtilisateur] = useState<any>(
    JSON.parse(localStorage.getItem('agrinova_user') || 'null')
  );
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const seDeconnecter = () => {
    localStorage.removeItem('agrinova_token');
    localStorage.removeItem('agrinova_user');
    setUtilisateur(null);
    setPage('onboarding');
    showToast('Déconnecté avec succès');
  };

  // Render current page
  if (page === 'onboarding') {
    return (
      <>
        <Onboarding
          user={utilisateur}
          onNavigate={setPage}
          onLogout={seDeconnecter}
          showToast={showToast}
        />
        {toast && <Toast message={toast} type="info" />}
      </>
    );
  }

  if (page === 'marketplace') {
    return (
      <>
        <Marketplace
          user={utilisateur}
          onNavigate={setPage}
          api={api}
          showToast={showToast}
        />
        {toast && <Toast message={toast} type="info" />}
      </>
    );
  }

  // Placeholder for other pages (to be implemented)
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">
          Page "{page}" en construction
        </h1>
        <button
          onClick={() => setPage('onboarding')}
          className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          Retour à l'accueil
        </button>
      </div>
      {toast && <Toast message={toast} type="info" />}
    </div>
  );
}
