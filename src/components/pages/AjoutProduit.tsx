import React, { useState } from 'react';
import { ZonePicker } from '../ui/ZonePicker';
import { cn } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { api, BASE_URL } from '../../services/api';
import {
  Leaf, Apple, Wheat, Sprout, CheckCircle,
  Image as ImageIcon, Star, X, DollarSign, Package, Eye, EyeOff,
} from 'lucide-react';


const categories = [
  { value: 'Légumes',      label: 'Légumes',  icon: Leaf   },
  { value: 'Fruits',       label: 'Fruits',   icon: Apple  },
  { value: 'Céréales',     label: 'Céréales', icon: Wheat  },
  { value: 'Légumineuses', label: 'Légumi.',  icon: Sprout },
];

const AjoutProduit = ({ isEmbedded = true, onFinished }: { isEmbedded?: boolean; onFinished?: () => void }) => {
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    quantite_disponible: '',
    localisation: '',
    categorie: 'Légumes',
    certifie: false,
    est_disponible: true,
    photoUrl: '',
    photoPreview: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const set = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showToast('La photo ne doit pas dépasser 10 Mo'); return; }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, photoPreview: reader.result as string }));
    reader.readAsDataURL(file);

    // Upload to backend for compression + storage
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
      if (!res.ok) throw new Error('Upload échoué');
      const data = await res.json();
      setFormData(prev => ({ ...prev, photoUrl: data.url }));
      showToast('Photo uploadée et compressée');
    } catch {
      showToast('Erreur upload photo — le produit sera publié sans image');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = () => setFormData(prev => ({ ...prev, photoUrl: '', photoPreview: '' }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.nom.trim()) e.nom = 'Requis';
    if (!formData.prix || parseFloat(formData.prix) <= 0) e.prix = 'Requis';
    if (!formData.quantite_disponible || parseInt(formData.quantite_disponible) <= 0) e.quantite_disponible = 'Requis';
    if (!formData.localisation.trim()) e.localisation = 'Requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api('/produits', 'POST', {
        nom: formData.nom,
        description: formData.description,
        prix: parseFloat(formData.prix),
        unite: 'kg',
        quantite_disponible: parseInt(formData.quantite_disponible),
        localisation: formData.localisation,
        categorie: formData.categorie,
        photo: formData.photoUrl || undefined,
        est_disponible: formData.est_disponible,
      });
      showToast(formData.est_disponible ? 'Produit publié sur le marché !' : 'Produit enregistré (non visible)');
      if (onFinished) onFinished();
      else navigate('gestion-produits');
    } catch (e: any) {
      showToast(e?.message || 'Erreur lors de la publication');
    }
    setLoading(false);
  };

  /* ── Photo picker shared block ── */
  const PhotoBlock = ({ compact = false }) => (
    <div>
      {!compact && <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider mb-1.5">Photo (optionnel)</label>}
      {formData.photoPreview ? (
        <div className={cn('relative rounded-2xl overflow-hidden border border-surface-container', compact ? 'h-32' : 'h-48')}>
          <img src={formData.photoPreview} alt="Preview" className="w-full h-full object-cover" />
          {uploadingPhoto && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <button onClick={removePhoto} className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-lg shadow-sm z-10">
            <X size={14} />
          </button>
          {formData.photoUrl && !uploadingPhoto && (
            <span className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              ✓ Uploadée
            </span>
          )}
        </div>
      ) : (
        <div className="relative">
          <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          <div className={cn('border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center gap-2 text-center bg-primary/3 hover:bg-primary/5 transition-colors', compact ? 'py-4' : 'py-8')}>
            <ImageIcon size={compact ? 18 : 26} className="text-primary/40" />
            <p className={cn('font-semibold text-primary/50', compact ? 'text-xs' : 'text-sm')}>
              Toucher pour ajouter une photo
            </p>
            <p className="text-[10px] text-primary/35">JPG, PNG, WebP — compressée auto</p>
          </div>
        </div>
      )}
    </div>
  );

  /* ── Publication toggle ── */
  const PublicationToggle = () => (
    <button
      type="button"
      onClick={() => set('est_disponible', !formData.est_disponible)}
      className={cn(
        'w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all',
        formData.est_disponible
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-surface-container bg-white hover:border-primary/20'
      )}
    >
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', formData.est_disponible ? 'bg-emerald-500 text-white' : 'bg-surface-container text-secondary')}>
        {formData.est_disponible ? <Eye size={14} /> : <EyeOff size={14} />}
      </div>
      <div className="flex-1 text-left">
        <p className={cn('font-bold text-sm', formData.est_disponible ? 'text-emerald-800' : 'text-primary')}>
          {formData.est_disponible ? 'Publier immédiatement' : 'Enregistrer sans publier'}
        </p>
        <p className="text-[10px] text-primary/45 font-medium mt-0.5">
          {formData.est_disponible ? 'Visible sur le marché dès maintenant' : 'Vous pourrez activer la vente plus tard'}
        </p>
      </div>
      <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0', formData.est_disponible ? 'bg-emerald-500 border-emerald-500' : 'border-surface-container-high')}>
        {formData.est_disponible && <CheckCircle size={12} className="text-white" fill="white" />}
      </div>
    </button>
  );

  /* ── EMBEDDED ────────────────────────────────────────────────── */
  if (isEmbedded) {
    return (
      <div className="px-4 py-3 space-y-4 pb-6">

        {/* Catégorie */}
        <div>
          <p className="text-xs font-bold text-primary/60 uppercase tracking-wider mb-2">Catégorie</p>
          <div className="grid grid-cols-4 gap-2">
            {categories.map(({ value, label, icon: CatIcon }) => {
              const sel = formData.categorie === value;
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
          <input value={formData.nom} onChange={e => set('nom', e.target.value)} placeholder="Ex: Tomates des Niayes"
            className={cn('w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium outline-none transition-all',
              errors.nom ? 'border-red-400 bg-red-50 text-red-900' : 'border-surface-container bg-white text-primary focus:border-primary/40 focus:ring-2 focus:ring-primary/10')} />
          {errors.nom && <p className="text-xs text-red-500 font-bold mt-1">{errors.nom}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider mb-1.5">Description</label>
          <textarea value={formData.description} onChange={e => set('description', e.target.value)}
            placeholder="Qualité, fraîcheur, origine…" rows={2}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-surface-container bg-white text-primary text-sm font-medium outline-none resize-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all" />
        </div>

        {/* Prix + Quantité */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider mb-1.5"><DollarSign size={10} className="inline mr-1" />Prix (FCFA)</label>
            <input type="number" value={formData.prix} onChange={e => set('prix', e.target.value)} placeholder="500"
              className={cn('w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium outline-none transition-all',
                errors.prix ? 'border-red-400 bg-red-50' : 'border-surface-container bg-white text-primary focus:border-primary/40 focus:ring-2 focus:ring-primary/10')} />
            {errors.prix && <p className="text-xs text-red-500 font-bold mt-1">{errors.prix}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider mb-1.5"><Package size={10} className="inline mr-1" />Stock (kg)</label>
            <input type="number" value={formData.quantite_disponible} onChange={e => set('quantite_disponible', e.target.value)} placeholder="50"
              className={cn('w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium outline-none transition-all',
                errors.quantite_disponible ? 'border-red-400 bg-red-50' : 'border-surface-container bg-white text-primary focus:border-primary/40 focus:ring-2 focus:ring-primary/10')} />
            {errors.quantite_disponible && <p className="text-xs text-red-500 font-bold mt-1">{errors.quantite_disponible}</p>}
          </div>
        </div>

        {/* Zone */}
        <ZonePicker value={formData.localisation} onChange={val => set('localisation', val)} error={errors.localisation} required />

        {/* Photo */}
        <PhotoBlock compact />

        {/* Publication toggle */}
        <PublicationToggle />

        {/* Certification */}
        <label className={cn('flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all',
          formData.certifie ? 'border-agri-gold bg-agri-gold/5' : 'border-surface-container bg-white hover:border-primary/20')}>
          <div className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0',
            formData.certifie ? 'bg-agri-gold border-agri-gold text-white' : 'border-surface-container-high text-transparent')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div className="flex-1">
            <p className={cn('font-bold text-sm', formData.certifie ? 'text-agri-gold-hover' : 'text-primary')}>Labélisé Agrinova</p>
            <p className="text-xs text-secondary font-medium">Produit certifié qualité</p>
          </div>
          <Star size={16} className={cn(formData.certifie ? 'text-agri-gold' : 'text-surface-container-high')} fill={formData.certifie ? 'currentColor' : 'none'} />
          <input type="checkbox" className="sr-only" checked={formData.certifie} onChange={e => set('certifie', e.target.checked)} />
        </label>

        <button onClick={handleSubmit} disabled={loading || uploadingPhoto}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white text-sm shadow-md disabled:opacity-70 transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #012d1d 0%, #1b4332 100%)' }}>
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={18} strokeWidth={2.5} />{formData.est_disponible ? 'Publier le produit' : 'Enregistrer'}</>}
        </button>
      </div>
    );
  }

  return null;
};

export { AjoutProduit };
