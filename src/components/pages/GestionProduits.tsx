import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Icon } from '../ui';
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
  categorie: string;
  photo?: string;
  localisation?: string;
  est_disponible: boolean;
  date_publication: string;
}

const categoryIcons: Record<string, string> = {
  Légumes: '🥦',
  Fruits: '🍊',
  Céréales: '🌾',
  Légumineuses: '🥜',
};

const GestionProduits = ({ isEmbedded }: { isEmbedded?: boolean }) => {
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [filter, setFilter] = useState<'tous' | 'disponible' | 'indisponible'>('tous');

  const loadProduits = async () => {
    try {
      const data = await api('/mes-produits');
      setProduits(Array.isArray(data) ? data : []);
    } catch {
      showToast('Impossible de charger vos produits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduits();
  }, []);

  const toggleDisponibilite = async (produit: Produit) => {
    setToggling(produit.id);
    try {
      await api(`/produits/${produit.id}`, 'PUT', {
        nom: produit.nom,
        description: produit.description,
        prix: produit.prix,
        unite: produit.unite,
        quantite_disponible: produit.quantite_disponible,
        categorie: produit.categorie,
        photo: produit.photo,
        localisation: produit.localisation,
        est_disponible: !produit.est_disponible,
      });
      setProduits(prev =>
        prev.map(p => p.id === produit.id ? { ...p, est_disponible: !p.est_disponible } : p)
      );
      showToast(produit.est_disponible ? 'Produit masqué du marché' : 'Produit visible sur le marché');
    } catch {
      showToast('Erreur lors de la mise à jour');
    } finally {
      setToggling(null);
    }
  };

  const supprimerProduit = async (id: number) => {
    setDeleting(id);
    try {
      await api(`/produits/${id}`, 'DELETE');
      setProduits(prev => prev.filter(p => p.id !== id));
      showToast('Produit supprimé');
    } catch {
      showToast('Erreur lors de la suppression');
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  const filtered = produits.filter(p => {
    if (filter === 'disponible') return p.est_disponible;
    if (filter === 'indisponible') return !p.est_disponible;
    return true;
  });

  const stats = {
    total: produits.length,
    disponibles: produits.filter(p => p.est_disponible).length,
    stock: produits.reduce((s, p) => s + p.quantite_disponible, 0),
  };

  /* ── EMBEDDED: compact dense list ──────────────────────────────── */
  if (isEmbedded) {
    return (
      <div className="px-3 py-3 space-y-3">
        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total', value: stats.total, bg: 'bg-primary/5 text-primary' },
            { label: 'En vente', value: stats.disponibles, bg: 'bg-emerald-50 text-emerald-700' },
            { label: 'Stock kg', value: stats.stock, bg: 'bg-surface-container text-secondary' },
          ].map(s => (
            <div key={s.label} className={cn('rounded-xl px-3 py-2 text-center', s.bg)}>
              <p className="text-base font-black leading-none">{s.value}</p>
              <p className="text-[10px] font-semibold mt-0.5 opacity-70">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5">
          {(['tous', 'disponible', 'indisponible'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-3 py-1 rounded-full text-[11px] font-bold border transition-all',
                filter === f ? 'bg-primary text-white border-primary' : 'bg-white text-secondary border-surface-container hover:border-primary/30')}>
              {f === 'tous' ? 'Tous' : f === 'disponible' ? 'En vente' : 'Masqués'}
            </button>
          ))}
        </div>

        {/* Product rows */}
        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-surface-container rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-4xl">🌾</span>
            <p className="text-sm font-semibold text-secondary mt-3">
              {filter === 'tous' ? 'Aucun produit publié' : 'Aucun dans cette catégorie'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(produit => (
              <div key={produit.id}
                className={cn('bg-white rounded-xl border overflow-hidden transition-all',
                  produit.est_disponible ? 'border-surface-container' : 'border-surface-container opacity-65')}>
                {/* Row */}
                <div className="flex items-center gap-2.5 px-3 py-2.5">
                  {/* Thumbnail */}
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 overflow-hidden">
                    {produit.photo
                      ? <img src={produit.photo} alt={produit.nom} className="w-full h-full object-cover" />
                      : <span className="text-lg">{categoryIcons[produit.categorie] || '🌾'}</span>
                    }
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-primary text-sm truncate leading-tight">{produit.nom}</p>
                    <p className="text-xs text-secondary font-medium">{produit.prix.toLocaleString()} FCFA · {produit.quantite_disponible} kg</p>
                  </div>
                  {/* Badge + actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full',
                      produit.est_disponible ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-container text-secondary')}>
                      {produit.est_disponible ? '● Vente' : '○ Masqué'}
                    </span>
                    {/* Toggle */}
                    <button onClick={() => toggleDisponibilite(produit)} disabled={toggling === produit.id}
                      className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-secondary hover:bg-primary/10 hover:text-primary transition-colors">
                      {toggling === produit.id
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><path d="M3 12a9 9 0 1 0 9-9"/></svg>
                        : produit.est_disponible
                          ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                    {/* Delete */}
                    {confirmDelete === produit.id ? (
                      <>
                        <button onClick={() => setConfirmDelete(null)}
                          className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-secondary text-xs font-bold">✕</button>
                        <button onClick={() => supprimerProduit(produit.id)} disabled={deleting === produit.id}
                          className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold">✓</button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDelete(produit.id)}
                        className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── FULL PAGE ───────────────────────────────────────────────── */
  return (
    <div className={cn("bg-surface", "min-h-screen pb-32")}>

      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-surface-container shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
          <button
            onClick={() => navigate('accueil')}
            className="p-2 -ml-1 rounded-xl hover:bg-surface-container transition-colors text-primary/50 hover:text-primary"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-primary text-base leading-tight">Mes produits</h1>
            <p className="text-xs text-primary/40">{stats.total} produit{stats.total > 1 ? 's' : ''} publiés</p>
          </div>
          <button
            onClick={() => navigate('ajouter')}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Ajouter
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'bg-primary/5 text-primary' },
            { label: 'En vente', value: stats.disponibles, color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Stock (kg)', value: stats.stock, color: 'bg-surface-container text-secondary' },
          ].map(s => (
            <div key={s.label} className={cn('rounded-2xl p-3 text-center', s.color)}>
              <p className="text-lg font-black">{s.value}</p>
              <p className="text-xs font-medium opacity-70">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {(['tous', 'disponible', 'indisponible'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-semibold transition-all border',
                filter === f ? 'bg-primary text-on-primary border-primary' : 'bg-white text-primary/60 border-surface-container-high hover:border-primary/30')}>
              {f === 'tous' ? 'Tous' : f === 'disponible' ? 'En vente' : 'Masqués'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-surface-container">
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-surface-container rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-surface-container rounded-lg w-2/3" />
                    <div className="h-3 bg-surface-container rounded-lg w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌾</span>
            </div>
            <p className="font-semibold text-primary/60 mb-1">
              {filter === 'tous' ? 'Aucun produit publié' : 'Aucun produit dans cette catégorie'}
            </p>
            {filter === 'tous' && (
              <button onClick={() => navigate('ajouter')}
                className="mt-4 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:opacity-90 transition-all">
                Publier un produit
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(produit => (
              <div key={produit.id}
                className={cn('bg-white rounded-2xl border overflow-hidden transition-all',
                  produit.est_disponible ? 'border-surface-container' : 'border-surface-container opacity-70')}>
                <div className="flex gap-3 p-4">
                  <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center shrink-0 overflow-hidden">
                    {produit.photo
                      ? <img src={produit.photo} alt={produit.nom} className="w-full h-full object-cover" />
                      : <span className="text-2xl">{categoryIcons[produit.categorie] || '🌾'}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-primary text-sm truncate">{produit.nom}</h3>
                        <p className="text-xs text-primary/50 mt-0.5">{produit.categorie}</p>
                      </div>
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0',
                        produit.est_disponible ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-container text-primary/50')}>
                        {produit.est_disponible ? 'En vente' : 'Masqué'}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-2 text-xs text-primary/60">
                      <span className="font-bold text-primary">{produit.prix.toLocaleString()} FCFA/{produit.unite}</span>
                      <span>·</span>
                      <span>Stock: {produit.quantite_disponible} {produit.unite}</span>
                    </div>
                    {produit.localisation && (
                      <p className="text-xs text-primary/40 mt-1">📍 {produit.localisation}</p>
                    )}
                  </div>
                </div>
                <div className="border-t border-surface-container flex divide-x divide-surface-container">
                  <button onClick={() => toggleDisponibilite(produit)} disabled={toggling === produit.id}
                    className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors',
                      produit.est_disponible ? 'text-primary/50 hover:bg-surface-container hover:text-primary' : 'text-emerald-600 hover:bg-emerald-50')}>
                    {toggling === produit.id
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><path d="M3 12a9 9 0 1 0 9-9"/></svg>
                      : produit.est_disponible ? 'Masquer' : 'Mettre en vente'
                    }
                  </button>
                  {confirmDelete === produit.id ? (
                    <div className="flex-1 flex divide-x divide-surface-container">
                      <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 text-xs font-semibold text-primary/50 hover:bg-surface-container">Annuler</button>
                      <button onClick={() => supprimerProduit(produit.id)} disabled={deleting === produit.id} className="flex-1 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                        {deleting === produit.id ? '...' : 'Confirmer'}
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(produit.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { GestionProduits };
