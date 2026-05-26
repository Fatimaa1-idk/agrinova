import React, { useState } from 'react';
import { Button, Input, Icon } from '../ui';
import { cn } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';
import {
  Leaf, Apple, Wheat, Sprout, CheckCircle,
  Image as ImageIcon, Star, X, MapPin, DollarSign, Package,
} from 'lucide-react';

const categories = [
  { value: 'Légumes',      label: 'Légumes',  icon: Leaf   },
  { value: 'Fruits',       label: 'Fruits',   icon: Apple  },
  { value: 'Céréales',     label: 'Céréales', icon: Wheat  },
  { value: 'Légumineuses', label: 'Légumi.',  icon: Sprout },
];

const AjoutProduit = ({ isEmbedded, onFinished }: { isEmbedded?: boolean; onFinished?: () => void }) => {
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
    photo: null as File | null,
    photoPreview: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Multi-step only when NOT embedded
  const [currentStep, setCurrentStep] = useState(1);

  const set = (field: string, value: string | boolean | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('La photo ne doit pas dépasser 5 MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, photo: file, photoPreview: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.nom.trim()) e.nom = 'Requis';
    if (!formData.prix || parseFloat(formData.prix) <= 0) e.prix = 'Requis';
    if (!formData.quantite_disponible || parseInt(formData.quantite_disponible) <= 0) e.quantite_disponible = 'Requis';
    if (!formData.localisation.trim()) e.localisation = 'Requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep = (step: number): boolean => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!formData.nom.trim()) e.nom = 'Requis';
      if (!formData.prix || parseFloat(formData.prix) <= 0) e.prix = 'Requis';
      if (!formData.quantite_disponible || parseInt(formData.quantite_disponible) <= 0) e.quantite_disponible = 'Requis';
    }
    if (step === 2) {
      if (!formData.localisation.trim()) e.localisation = 'Requis';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await api('/produits', 'POST', {
        nom: formData.nom,
        description: formData.description,
        prix: parseFloat(formData.prix),
        quantite_disponible: parseInt(formData.quantite_disponible),
        localisation: formData.localisation,
        categorie: formData.categorie,
        certifie: formData.certifie,
        est_disponible: true,
      });
      if (response.id) {
        showToast('Produit publié !');
        if (onFinished) onFinished();
        else navigate('gestion-produits');
      } else {
        showToast('Erreur lors de la publication');
      }
    } catch {
      showToast('Serveur indisponible. Réessayez plus tard.');
    }
    setLoading(false);
  };

  /* ── EMBEDDED: single compact form ──────────────────────────── */
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
                <button
                  key={value}
                  onClick={() => set('categorie', value)}
                  className={cn(
                    'py-2.5 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all',
                    sel ? 'border-primary bg-primary/5 text-primary' : 'border-surface-container bg-white text-secondary hover:border-primary/30'
                  )}
                >
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
          <input
            value={formData.nom}
            onChange={e => set('nom', e.target.value)}
            placeholder="Ex: Tomates des Niayes"
            className={cn(
              'w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium outline-none transition-all',
              errors.nom
                ? 'border-red-400 bg-red-50 text-red-900'
                : 'border-surface-container bg-white text-primary focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
            )}
          />
          {errors.nom && <p className="text-xs text-red-500 font-bold mt-1">{errors.nom}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider mb-1.5">Description</label>
          <textarea
            value={formData.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Qualité, fraîcheur, origine…"
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-surface-container bg-white text-primary text-sm font-medium outline-none resize-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Prix + Quantité */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider mb-1.5">
              <DollarSign size={10} className="inline mr-1" />Prix (FCFA)
            </label>
            <input
              type="number"
              value={formData.prix}
              onChange={e => set('prix', e.target.value)}
              placeholder="500"
              className={cn(
                'w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium outline-none transition-all',
                errors.prix
                  ? 'border-red-400 bg-red-50'
                  : 'border-surface-container bg-white text-primary focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
              )}
            />
            {errors.prix && <p className="text-xs text-red-500 font-bold mt-1">{errors.prix}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider mb-1.5">
              <Package size={10} className="inline mr-1" />Stock (kg)
            </label>
            <input
              type="number"
              value={formData.quantite_disponible}
              onChange={e => set('quantite_disponible', e.target.value)}
              placeholder="50"
              className={cn(
                'w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium outline-none transition-all',
                errors.quantite_disponible
                  ? 'border-red-400 bg-red-50'
                  : 'border-surface-container bg-white text-primary focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
              )}
            />
            {errors.quantite_disponible && <p className="text-xs text-red-500 font-bold mt-1">{errors.quantite_disponible}</p>}
          </div>
        </div>

        {/* Localisation */}
        <div>
          <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider mb-1.5">
            <MapPin size={10} className="inline mr-1" />Localisation
          </label>
          <input
            value={formData.localisation}
            onChange={e => set('localisation', e.target.value)}
            placeholder="Ex: Zone des Niayes, Dakar"
            className={cn(
              'w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium outline-none transition-all',
              errors.localisation
                ? 'border-red-400 bg-red-50'
                : 'border-surface-container bg-white text-primary focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
            )}
          />
          {errors.localisation && <p className="text-xs text-red-500 font-bold mt-1">{errors.localisation}</p>}
        </div>

        {/* Photo */}
        <div>
          <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider mb-1.5">Photo (optionnel)</label>
          {formData.photoPreview ? (
            <div className="relative rounded-2xl overflow-hidden h-32 border border-surface-container">
              <img src={formData.photoPreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={() => setFormData(p => ({ ...p, photo: null, photoPreview: '' }))}
                className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-lg shadow-sm"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="border-2 border-dashed border-primary/20 rounded-2xl py-5 flex flex-col items-center gap-2 text-center bg-primary/3 hover:bg-primary/5 transition-colors">
                <ImageIcon size={22} className="text-primary/40" />
                <p className="text-xs font-semibold text-primary/50">Touchez pour ajouter</p>
              </div>
            </div>
          )}
        </div>

        {/* Certification */}
        <label className={cn(
          'flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all',
          formData.certifie ? 'border-agri-gold bg-agri-gold/5' : 'border-surface-container bg-white hover:border-primary/20'
        )}>
          <div className={cn(
            'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0',
            formData.certifie ? 'bg-agri-gold border-agri-gold text-white' : 'border-surface-container-high text-transparent'
          )}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex-1">
            <p className={cn('font-bold text-sm', formData.certifie ? 'text-agri-gold-hover' : 'text-primary')}>
              Labélisé Agrinova
            </p>
            <p className="text-xs text-secondary font-medium">Produit certifié qualité</p>
          </div>
          <Star size={16} className={cn(formData.certifie ? 'text-agri-gold' : 'text-surface-container-high')} fill={formData.certifie ? 'currentColor' : 'none'} />
        </label>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white text-sm shadow-md disabled:opacity-70 transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #012d1d 0%, #1b4332 100%)' }}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle size={18} strokeWidth={2.5} />
              Publier le produit
            </>
          )}
        </button>
      </div>
    );
  }

  /* ── FULL PAGE: 3-step ───────────────────────────────────────── */
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-primary tracking-tight">Infos principales</h2>
              <p className="text-sm font-medium text-secondary mt-1">Détails de base de votre produit.</p>
            </div>
            <Input label="Nom du produit" value={formData.nom} onChange={e => set('nom', e.target.value)} placeholder="Ex: Tomates de la zone des Niayes" error={errors.nom} />
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Qualité, fraîcheur, origine…"
                className={cn('w-full px-4 py-3 border-2 rounded-2xl outline-none resize-none font-medium text-sm transition-all',
                  errors.description ? 'border-red-400 bg-red-50' : 'border-surface-container bg-white focus:border-primary/40 focus:ring-2 focus:ring-primary/10')}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Prix (FCFA/kg)" value={formData.prix} onChange={e => set('prix', e.target.value)} placeholder="500" type="number" error={errors.prix} />
              <Input label="Stock (kg)" value={formData.quantite_disponible} onChange={e => set('quantite_disponible', e.target.value)} placeholder="50" type="number" error={errors.quantite_disponible} />
            </div>
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Catégorie</label>
              <div className="grid grid-cols-4 gap-2">
                {categories.map(({ value, label, icon: CatIcon }) => {
                  const sel = formData.categorie === value;
                  return (
                    <button key={value} onClick={() => set('categorie', value)}
                      className={cn('p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all',
                        sel ? 'border-primary bg-primary/5 text-primary' : 'border-surface-container bg-white text-secondary hover:border-primary/30')}>
                      <CatIcon size={22} strokeWidth={sel ? 2.5 : 2} />
                      <span className="text-[10px] font-bold">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <label className={cn('flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all',
              formData.certifie ? 'border-agri-gold bg-agri-gold/5' : 'border-surface-container bg-white hover:border-primary/20')}>
              <div className={cn('w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors',
                formData.certifie ? 'bg-agri-gold border-agri-gold text-white' : 'border-surface-container-high text-transparent')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div className="flex-1">
                <p className={cn('font-bold text-sm', formData.certifie ? 'text-agri-gold-hover' : 'text-primary')}>Certification Agrinova</p>
                <p className="text-xs text-secondary font-medium">Mon produit respecte les normes certifiées</p>
              </div>
              <Star size={20} className={cn(formData.certifie ? 'text-agri-gold' : 'text-surface-container-high')} fill={formData.certifie ? 'currentColor' : 'none'} />
              <input type="checkbox" className="sr-only" checked={formData.certifie} onChange={e => set('certifie', e.target.checked)} />
            </label>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-primary tracking-tight">Médias & Lieu</h2>
              <p className="text-sm font-medium text-secondary mt-1">Photo et provenance du produit.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Photo du produit</label>
              {formData.photoPreview ? (
                <div className="relative group rounded-3xl overflow-hidden h-48 border border-surface-container">
                  <img src={formData.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => setFormData(p => ({ ...p, photo: null, photoPreview: '' }))}
                      className="bg-white text-red-500 font-bold px-4 py-2 rounded-xl flex items-center gap-2">
                      <X size={16} /> Retirer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="border-2 border-dashed border-primary/25 rounded-3xl p-10 flex flex-col items-center gap-3 bg-primary/3 hover:bg-primary/5 transition-colors">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <ImageIcon size={26} className="text-primary" />
                    </div>
                    <p className="font-bold text-primary text-sm">Toucher pour ajouter une photo</p>
                    <p className="text-xs text-secondary">JPG, PNG — Max. 5 Mo</p>
                  </div>
                </div>
              )}
            </div>
            <Input label="Localisation" value={formData.localisation} onChange={e => set('localisation', e.target.value)} placeholder="Ex: Zone des Niayes, Dakar" error={errors.localisation} />
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-primary tracking-tight">Vérification</h2>
              <p className="text-sm font-medium text-secondary mt-1">Relisez avant de publier.</p>
            </div>
            <div className="bg-white border border-surface-container rounded-3xl overflow-hidden">
              {formData.photoPreview && (
                <div className="h-36 relative">
                  <img src={formData.photoPreview} alt="Product" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <h3 className="text-white font-black text-xl">{formData.nom || 'Sans nom'}</h3>
                  </div>
                </div>
              )}
              <div className="p-4 space-y-3">
                {!formData.photoPreview && <h3 className="font-black text-xl text-primary">{formData.nom || 'Sans nom'}</h3>}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-surface rounded-xl p-3">
                    <p className="text-xs font-bold text-secondary uppercase mb-1">Catégorie</p>
                    <p className="font-bold text-primary">{formData.categorie}</p>
                  </div>
                  <div className="bg-primary/5 rounded-xl p-3">
                    <p className="text-xs font-bold text-primary/60 uppercase mb-1">Prix</p>
                    <p className="font-black text-primary">{formData.prix} <span className="text-xs">FCFA</span></p>
                  </div>
                  <div className="bg-surface rounded-xl p-3">
                    <p className="text-xs font-bold text-secondary uppercase mb-1">Stock</p>
                    <p className="font-black text-primary">{formData.quantite_disponible} <span className="text-xs">kg</span></p>
                  </div>
                  <div className="bg-surface rounded-xl p-3">
                    <p className="text-xs font-bold text-secondary uppercase mb-1">Lieu</p>
                    <p className="font-bold text-primary text-xs truncate">{formData.localisation}</p>
                  </div>
                </div>
                {formData.description && (
                  <p className="text-sm text-secondary leading-relaxed">{formData.description}</p>
                )}
                {formData.certifie && (
                  <div className="flex items-center gap-2 p-3 bg-agri-gold/10 rounded-xl border border-agri-gold/20">
                    <Star size={14} className="text-agri-gold" fill="currentColor" />
                    <span className="text-sm font-black text-primary">Labélisé Qualité Agrinova</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-surface min-h-screen pb-32">
      <header className="bg-white border-b border-surface-container px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('accueil')} className="p-2 -ml-2 rounded-xl hover:bg-surface-container transition-colors">
            <Icon name="←" size={24} />
          </button>
          <div>
            <h1 className="font-black text-xl text-primary tracking-tight">Vendre un produit</h1>
            <p className="text-xs font-bold text-secondary mt-0.5 uppercase tracking-wider">Étape {currentStep} sur 3</p>
          </div>
        </div>
        <div className="mt-3 w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
          <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${(currentStep / 3) * 100}%` }} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-5">
        {renderStepContent()}
        <div className="flex items-center gap-3 mt-8 pt-5 border-t border-surface-container">
          {currentStep > 1 && (
            <button onClick={() => setCurrentStep(p => Math.max(p - 1, 1))}
              className="px-5 py-3.5 rounded-xl font-bold text-secondary bg-surface-container hover:bg-surface-container-high transition-colors">
              Retour
            </button>
          )}
          <button
            onClick={() => {
              if (currentStep < 3) {
                if (validateStep(currentStep)) setCurrentStep(p => Math.min(p + 1, 3));
              } else {
                handleSubmit();
              }
            }}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70"
          >
            {currentStep < 3 ? 'Continuer' : (
              <><CheckCircle size={18} strokeWidth={2.5} /> Publier</>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export { AjoutProduit };
