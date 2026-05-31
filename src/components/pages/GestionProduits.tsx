import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ZonePicker } from '../ui/ZonePicker';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { api, BASE_URL } from '../../services/api';
import {
  X, Eye, EyeOff, Trash2, CheckCircle, Image as ImageIcon,
  Leaf, Apple, Wheat, Sprout, DollarSign, Package, ChevronDown,
} from 'lucide-react';

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

const categories = [
  { value: 'Légumes',      label: 'Légumes',  icon: Leaf   },
  { value: 'Fruits',       label: 'Fruits',   icon: Apple  },
  { value: 'Céréales',     label: 'Céréales', icon: Wheat  },
  { value: 'Légumineuses', label: 'Légumi.',  icon: Sprout },
];

/* ── PRODUCT ADMIN MODAL ─────────────────────────────────────────── */
interface AdminModalProps {
  produit: Produit;
  onClose: () => void;
  onSaved: (updated: Produit) => void;
  onDeleted: (id: number) => void;
}

const ProduitAdminModal = ({ produit, onClose, onSaved, onDeleted }: AdminModalProps) => {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    nom: produit.nom,
    description: produit.description || '',
    prix: String(produit.prix),
    quantite_disponible: String(produit.quantite_disponible),
    localisation: produit.localisation || '',
    categorie: produit.categorie,
    est_disponible: produit.est_disponible,
    photoUrl: produit.photo || '',
    photoPreview: produit.photo || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  const set = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showToast('La photo ne doit pas dépasser 10 Mo'); return; }

    setPhotoError(false);
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, photoPreview: reader.result as string }));
    reader.readAsDataURL(file);

    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const token = localStorage.getItem('agrinova_token');
      const res = await fetch(`${BASE_URL}/api/upload/image`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setForm(prev => ({ ...prev, photoUrl: data.url }));
      showToast('Photo mise à jour ✓');
    } catch (err: any) {
      setPhotoError(true);
      showToast(`Échec upload : ${err?.message || 'erreur réseau'}`);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nom.trim()) e.nom = 'Requis';
    if (!form.prix || parseFloat(form.prix) <= 0) e.prix = 'Requis';
    if (!form.quantite_disponible || parseInt(form.quantite_disponible) <= 0) e.quantite_disponible = 'Requis';
    if (!form.localisation.trim()) e.localisation = 'Requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await api(`/produits/${produit.id}`, 'PUT', {
        nom: form.nom,
        description: form.description,
        prix: parseFloat(form.prix),
        unite: produit.unite,
        quantite_disponible: parseInt(form.quantite_disponible),
        categorie: form.categorie,
        photo: form.photoUrl || undefined,
        localisation: form.localisation,
        est_disponible: form.est_disponible,
      });
      onSaved({
        ...produit,
        nom: form.nom,
        description: form.description,
        prix: parseFloat(form.prix),
        quantite_disponible: parseInt(form.quantite_disponible),
        categorie: form.categorie,
        photo: form.photoUrl || produit.photo,
        localisation: form.localisation,
        est_disponible: form.est_disponible,
      });
      showToast('Produit mis à jour');
      onClose();
    } catch (e: any) {
      showToast(e?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api(`/produits/${produit.id}`, 'DELETE');
      onDeleted(produit.id);
      showToast('Produit supprimé');
      onClose();
    } catch (e: any) {
      showToast(e?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-end lg:justify-center p-0 lg:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative mt-auto lg:mt-0 bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl max-h-[90vh] lg:max-h-[88vh] flex flex-col w-full lg:max-w-3xl">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-black/10 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-surface-container shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden shrink-0">
              {form.photoPreview
                ? <img src={form.photoPreview} alt="" className="w-full h-full object-cover" />
                : <span className="text-lg">{categoryIcons[form.categorie] || '🌾'}</span>
              }
            </div>
            <div>
              <h2 className="font-black text-primary text-sm leading-tight truncate max-w-[200px]">{produit.nom}</h2>
              <p className="text-[10px] text-secondary font-semibold">{produit.categorie} · {produit.prix.toLocaleString()} FCFA</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary hover:text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-4">

          {/* Upload error banner */}
          {photoError && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-red-500 shrink-0">✕</span>
              <p className="text-xs font-bold text-red-700 flex-1">
                Upload échoué — vérifiez votre connexion. La photo précédente sera conservée.
              </p>
              <button onClick={() => setPhotoError(false)} className="text-red-400 hover:text-red-600 shrink-0">
                <X size={13} />
              </button>
            </div>
          )}

          {/* Photo */}
          <div>
            <p className="text-xs font-bold text-primary/60 uppercase tracking-wider mb-1.5">Photo</p>
            {form.photoPreview ? (
              <div className={cn('relative h-36 rounded-2xl overflow-hidden border-2 transition-colors', photoError ? 'border-red-400' : 'border-surface-container')}>
                <img src={form.photoPreview} alt="Preview" className={cn('w-full h-full object-cover', photoError && 'opacity-60')} />
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-white text-[10px] font-bold">Envoi en cours…</span>
                  </div>
                )}
                {photoError && !uploadingPhoto && (
                  <div className="absolute inset-0 bg-red-500/20 flex flex-col items-center justify-center gap-1.5">
                    <span className="text-red-700 text-xs font-black bg-white/90 px-3 py-1 rounded-full shadow-sm">
                      ✕ Échec upload — réessayer
                    </span>
                  </div>
                )}
                <label className="absolute inset-0 cursor-pointer">
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
                </label>
                {!photoError && !uploadingPhoto && (
                  <span className="absolute bottom-2 left-2 bg-black/50 text-white text-[9px] font-bold px-2 py-0.5 rounded-full pointer-events-none">
                    Toucher pour changer
                  </span>
                )}
              </div>
            ) : (
              <div className="relative">
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="border-2 border-dashed border-primary/20 rounded-2xl py-6 flex flex-col items-center gap-2 bg-primary/3">
                  <ImageIcon size={22} className="text-primary/40" />
                  <p className="text-xs font-semibold text-primary/50">Ajouter une photo</p>
                </div>
              </div>
            )}
          </div>

          {/* Catégorie */}
          <div>
            <p className="text-xs font-bold text-primary/60 uppercase tracking-wider mb-2">Catégorie</p>
            <div className="grid grid-cols-4 gap-2">
              {categories.map(({ value, label, icon: CatIcon }) => {
                const sel = form.categorie === value;
                return (
                  <button key={value} onClick={() => set('categorie', value)}
                    className={cn('py-2.5 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all',
                      sel ? 'border-primary bg-primary/5 text-primary' : 'border-surface-container bg-white text-secondary hover:border-primary/30')}>
                    <CatIcon size={18} strokeWidth={sel ? 2.5 : 2} />
                    <span className="text-[10px] font-bold leading-none">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nom */}
          <div>
            <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider mb-1.5">Nom du produit</label>
            <input value={form.nom} onChange={e => set('nom', e.target.value)}
              className={cn('w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium outline-none transition-all',
                errors.nom ? 'border-red-400 bg-red-50' : 'border-surface-container bg-white text-primary focus:border-primary/40')} />
            {errors.nom && <p className="text-xs text-red-500 font-bold mt-1">{errors.nom}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-surface-container bg-white text-primary text-sm font-medium outline-none resize-none focus:border-primary/40 transition-all" />
          </div>

          {/* Prix + Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider mb-1.5">
                <DollarSign size={10} className="inline mr-1" />Prix (FCFA)
              </label>
              <input type="number" value={form.prix} onChange={e => set('prix', e.target.value)}
                className={cn('w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium outline-none transition-all',
                  errors.prix ? 'border-red-400 bg-red-50' : 'border-surface-container bg-white text-primary focus:border-primary/40')} />
              {errors.prix && <p className="text-xs text-red-500 font-bold mt-1">{errors.prix}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider mb-1.5">
                <Package size={10} className="inline mr-1" />Stock (kg)
              </label>
              <input type="number" value={form.quantite_disponible} onChange={e => set('quantite_disponible', e.target.value)}
                className={cn('w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium outline-none transition-all',
                  errors.quantite_disponible ? 'border-red-400 bg-red-50' : 'border-surface-container bg-white text-primary focus:border-primary/40')} />
              {errors.quantite_disponible && <p className="text-xs text-red-500 font-bold mt-1">{errors.quantite_disponible}</p>}
            </div>
          </div>

          {/* Zone */}
          <ZonePicker value={form.localisation} onChange={val => set('localisation', val)} error={errors.localisation} required />

          {/* Publication toggle */}
          <button
            type="button"
            onClick={() => set('est_disponible', !form.est_disponible)}
            className={cn(
              'w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all',
              form.est_disponible ? 'border-emerald-200 bg-emerald-50' : 'border-surface-container bg-white hover:border-primary/20'
            )}
          >
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', form.est_disponible ? 'bg-emerald-500 text-white' : 'bg-surface-container text-secondary')}>
              {form.est_disponible ? <Eye size={14} /> : <EyeOff size={14} />}
            </div>
            <div className="flex-1 text-left">
              <p className={cn('font-bold text-sm', form.est_disponible ? 'text-emerald-800' : 'text-primary')}>
                {form.est_disponible ? 'Visible sur le marché' : 'Masqué du marché'}
              </p>
              <p className="text-[10px] text-primary/45 font-medium mt-0.5">
                {form.est_disponible ? 'Les acheteurs peuvent voir ce produit' : 'Activez pour remettre en vente'}
              </p>
            </div>
            <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0', form.est_disponible ? 'bg-emerald-500 border-emerald-500' : 'border-surface-container-high')}>
              {form.est_disponible && <CheckCircle size={12} className="text-white" fill="white" />}
            </div>
          </button>

          {/* Delete zone */}
          <div className="border border-red-100 rounded-2xl overflow-hidden">
            {confirmDelete ? (
              <div className="p-4 bg-red-50 space-y-3">
                <p className="text-sm font-bold text-red-700 text-center">Supprimer ce produit définitivement ?</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2.5 rounded-xl border border-surface-container-high text-sm font-bold text-secondary bg-white hover:bg-surface-container transition-colors">
                    Annuler
                  </button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-70">
                    {deleting ? 'Suppression...' : 'Confirmer'}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors">
                <Trash2 size={15} />
                Supprimer ce produit
              </button>
            )}
          </div>

        </div>

        {/* Footer save button */}
        <div className="px-4 pt-3 pb-4 border-t border-surface-container bg-white shrink-0"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <button onClick={handleSave} disabled={saving || uploadingPhoto}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white text-sm shadow-md disabled:opacity-70 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #012d1d 0%, #1b4332 100%)' }}>
            {saving
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><CheckCircle size={18} strokeWidth={2.5} />Enregistrer les modifications</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── GESTION PRODUITS ────────────────────────────────────────────── */
const GestionProduits = ({ isEmbedded }: { isEmbedded?: boolean }) => {
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [filter, setFilter] = useState<'tous' | 'disponible' | 'indisponible'>('tous');
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);

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
      <>
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
                <button
                  key={produit.id}
                  onClick={() => setSelectedProduit(produit)}
                  className={cn('w-full bg-white rounded-xl border overflow-hidden transition-all text-left hover:border-primary/30 hover:shadow-sm active:scale-[0.99]',
                    produit.est_disponible ? 'border-surface-container' : 'border-surface-container opacity-65')}
                >
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
                    {/* Badge + chevron */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full',
                        produit.est_disponible ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-container text-secondary')}>
                        {produit.est_disponible ? '● Vente' : '○ Masqué'}
                      </span>
                      <ChevronDown size={14} className="text-primary/30 -rotate-90" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Admin modal */}
        {selectedProduit && (
          <ProduitAdminModal
            produit={selectedProduit}
            onClose={() => setSelectedProduit(null)}
            onSaved={(updated) => {
              setProduits(prev => prev.map(p => p.id === updated.id ? updated : p));
              setSelectedProduit(null);
            }}
            onDeleted={(id) => {
              setProduits(prev => prev.filter(p => p.id !== id));
              setSelectedProduit(null);
            }}
          />
        )}
      </>
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
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(produit => (
              <button
                key={produit.id}
                onClick={() => setSelectedProduit(produit)}
                className={cn('w-full bg-white rounded-2xl border overflow-hidden transition-all text-left hover:border-primary/30 hover:shadow-sm active:scale-[0.99]',
                  produit.est_disponible ? 'border-surface-container' : 'border-surface-container opacity-70')}
              >
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
                  <div className="flex items-center shrink-0">
                    <ChevronDown size={16} className="text-primary/30 -rotate-90" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Admin modal */}
      {selectedProduit && (
        <ProduitAdminModal
          produit={selectedProduit}
          onClose={() => setSelectedProduit(null)}
          onSaved={(updated) => {
            setProduits(prev => prev.map(p => p.id === updated.id ? updated : p));
            setSelectedProduit(null);
          }}
          onDeleted={(id) => {
            setProduits(prev => prev.filter(p => p.id !== id));
            setSelectedProduit(null);
          }}
        />
      )}
    </div>
  );
};

export { GestionProduits };
