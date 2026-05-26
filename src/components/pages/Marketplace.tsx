import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';

interface Produit {
  id: number;
  nom: string;
  description: string;
  prix: number;
  unite: string;
  quantite_disponible: number;
  est_disponible: boolean;
  categorie: string;
  photo?: string;
  localisation?: string;
  agriculteur_id?: number;
  agriculteur_nom?: string;
  agriculteur_note?: number;
  agriculteur_verifie?: boolean;
  agriculteur_localisation?: string;
}

const categoryConfig = [
  { label: 'Tous', value: '', icon: '🛒' },
  { label: 'Légumes', value: 'Légumes', icon: '🥦' },
  { label: 'Fruits', value: 'Fruits', icon: '🍊' },
  { label: 'Céréales', value: 'Céréales', icon: '🌾' },
  { label: 'Légumineuses', value: 'Légumineuses', icon: '🥜' },
];

const categoryColors: Record<string, string> = {
  Légumes: 'bg-emerald-50 text-emerald-700',
  Fruits: 'bg-orange-50 text-orange-700',
  Céréales: 'bg-amber-50 text-amber-700',
  Légumineuses: 'bg-lime-50 text-lime-700',
};

function getInitials(name?: string) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-surface-container animate-pulse">
    <div className="h-44 bg-surface-container" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-surface-container rounded-lg w-3/4" />
      <div className="h-3 bg-surface-container rounded-lg w-1/2" />
      <div className="h-6 bg-surface-container rounded-lg w-2/5" />
      <div className="flex gap-2 pt-1">
        <div className="h-9 bg-surface-container rounded-xl flex-1" />
        <div className="h-9 bg-surface-container rounded-xl flex-1" />
      </div>
    </div>
  </div>
);

// ─── Product card ─────────────────────────────────────────────────────────────
const ProduitCard = ({
  produit,
  onContact,
  onView,
}: {
  produit: Produit;
  onContact: (p: Produit) => void;
  onView: (p: Produit) => void;
}) => {
  const inStock = produit.est_disponible && produit.quantite_disponible > 0;
  const catColor = categoryColors[produit.categorie] || 'bg-surface-container text-primary/60';

  return (
    <article className="bg-white rounded-2xl overflow-hidden border border-surface-container hover:border-primary/20 hover:shadow-md transition-all duration-200 flex flex-col">

      {/* Image */}
      <div
        className="relative h-44 bg-surface-container overflow-hidden cursor-pointer"
        onClick={() => onView(produit)}
      >
        {produit.photo ? (
          <img
            src={produit.photo}
            alt={produit.nom}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-container to-surface-container-high">
            <span className="text-5xl opacity-60">
              {categoryConfig.find(c => c.value === produit.categorie)?.icon || '🌾'}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span className={cn('text-[10px] font-bold px-2 py-1 rounded-full', catColor)}>
            {produit.categorie}
          </span>
          {produit.agriculteur_verifie && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary text-on-primary">
              ✓ Certifié
            </span>
          )}
        </div>

        {/* Stock */}
        <div className={cn(
          'absolute bottom-2.5 right-2.5 text-[10px] font-bold px-2 py-1 rounded-full',
          inStock ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        )}>
          {inStock ? `${produit.quantite_disponible} ${produit.unite}` : 'Épuisé'}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">

        {/* Nom + description */}
        <div className="cursor-pointer" onClick={() => onView(produit)}>
          <h3 className="font-bold text-primary text-sm leading-tight line-clamp-1">{produit.nom}</h3>
          {produit.description && (
            <p className="text-xs text-primary/50 mt-0.5 line-clamp-2">{produit.description}</p>
          )}
        </div>

        {/* Prix */}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-primary">{produit.prix.toLocaleString()}</span>
          <span className="text-xs font-semibold text-primary/50">FCFA/{produit.unite}</span>
        </div>

        {/* Vendeur */}
        <div className="flex items-center gap-2 pt-1 border-t border-surface-container">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black text-primary">{getInitials(produit.agriculteur_nom)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-primary truncate">{produit.agriculteur_nom || 'Producteur'}</p>
            <p className="text-[10px] text-primary/40 flex items-center gap-1">
              {produit.agriculteur_note && produit.agriculteur_note > 0
                ? <><span>⭐ {produit.agriculteur_note.toFixed(1)}</span><span>·</span></>
                : null
              }
              <span>{produit.localisation || produit.agriculteur_localisation || 'Sénégal'}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onView(produit)}
            className="flex-1 py-2 rounded-xl border border-surface-container-high text-primary text-xs font-semibold hover:bg-surface-container transition-colors"
          >
            Voir détails
          </button>
          {inStock && (
            <button
              onClick={() => onContact(produit)}
              className="flex-1 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Contacter
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const Marketplace = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorie, setCategorie] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api('/produits');
        if (Array.isArray(data)) setProduits(data);
      } catch {
        // pas de fallback demo — on affiche vide avec message
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = produits.filter(p => {
    const matchCat = !categorie || p.categorie === categorie;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.nom.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.localisation?.toLowerCase().includes(q) ||
      p.agriculteur_nom?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleContact = (produit: Produit) => {
    if (!user) {
      showToast('Connectez-vous pour contacter un vendeur');
      navigate('connexion');
      return;
    }
    if (!produit.agriculteur_id) return;
    navigate('chat', {
      contactId: produit.agriculteur_id,
      contactNom: produit.agriculteur_nom || 'Vendeur',
      contactRole: 'producteur',
      produitNom: produit.nom,
    });
  };

  const handleView = (produit: Produit) => {
    navigate('produit', { product: produit });
  };

  const totalDispo = produits.filter(p => p.est_disponible && p.quantite_disponible > 0).length;

  return (
    <div className="min-h-screen bg-surface pb-32">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className="bg-white sticky top-0 z-40 border-b border-surface-container shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-black text-primary text-lg leading-tight">Agrinova</h1>
            <p className="text-xs text-primary/40 font-medium">{totalDispo} produits disponibles</p>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === 'producteur' && (
              <button
                onClick={() => navigate('ajouter')}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:opacity-90 transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Publier
              </button>
            )}
            {user && (
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-black text-primary">{getInitials(user.nom)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="max-w-4xl mx-auto px-4 pb-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Chercher un produit, vendeur, région..."
              className="w-full pl-9 pr-4 py-2.5 bg-surface-container rounded-xl text-sm text-primary placeholder:text-primary/35 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/30 hover:text-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="max-w-4xl mx-auto px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {categoryConfig.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategorie(cat.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0',
                  categorie === cat.value
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-white text-primary/60 border-surface-container-high hover:border-primary/30 hover:text-primary'
                )}
              >
                <span className="text-sm leading-none">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 py-4">

        {/* Results count */}
        {!loading && (search || categorie) && (
          <p className="text-xs text-primary/50 mb-3 font-medium">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            {search && <span> pour "<strong>{search}</strong>"</span>}
            {categorie && <span> · {categorie}</span>}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(p => (
              <ProduitCard
                key={p.id}
                produit={p}
                onContact={handleContact}
                onView={handleView}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">{search ? '🔍' : '🌾'}</span>
            </div>
            <p className="font-semibold text-primary/60 mb-1">
              {search ? `Aucun résultat pour "${search}"` : 'Aucun produit disponible'}
            </p>
            <p className="text-sm text-primary/40">
              {search ? 'Essayez un autre terme ou effacez la recherche.' : 'Revenez bientôt, les producteurs publient régulièrement.'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-4 px-4 py-2 bg-surface-container text-primary rounded-xl text-sm font-semibold hover:bg-surface-container-high transition-colors">
                Effacer la recherche
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export { Marketplace };
