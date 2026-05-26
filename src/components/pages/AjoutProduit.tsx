import React, { useState } from 'react';
import { Button, Input, Icon } from '../ui';
import { cn } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';

const AjoutProduit = () => {
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
  const [currentStep, setCurrentStep] = useState(1);

  const categories = [
    { value: 'Légumes', label: 'Légumes frais', icon: '🥦' },
    { value: 'Fruits', label: 'Fruits saisonniers', icon: '🍊' },
    { value: 'Céréales', label: 'Céréales locales', icon: '🌾' },
    { value: 'Légumineuses', label: 'Légumineuses', icon: '🥜' },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.nom.trim()) newErrors.nom = 'Le nom du produit est requis';
      if (!formData.description.trim()) newErrors.description = 'La description est requise';
      if (!formData.prix || parseFloat(formData.prix) <= 0) newErrors.prix = 'Le prix doit être supérieur à 0';
      if (!formData.quantite_disponible || parseInt(formData.quantite_disponible) <= 0) newErrors.quantite_disponible = 'La quantité doit être supérieure à 0';
    }
    if (step === 2) {
      if (!formData.localisation.trim()) newErrors.localisation = 'La localisation est requise';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('La photo ne doit pas dépasser 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, photo: file, photoPreview: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
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
        showToast('Produit publié avec succès !');
        navigate('gestion-produits');
      } else {
        showToast('Erreur lors de la publication');
      }
    } catch {
      showToast('Serveur indisponible. Réessayez plus tard.');
    }
    setLoading(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Informations du produit</h2>
              <p className="text-gray-600">Décrivez votre produit de manière claire et précise</p>
            </div>
            <div className="space-y-4">
              <Input label="Nom du produit" value={formData.nom} onChange={(e) => handleInputChange('nom', e.target.value)} placeholder="Ex: Tomates de Thiès" error={errors.nom} icon="🌾" />
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description détaillée</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez la qualité, la fraîcheur, les caractéristiques..."
                  className={cn('w-full px-4 py-3 border-2 rounded-xl transition-colors outline-none', errors.description ? 'border-red-500 bg-red-50 text-red-900' : 'border-gray-300 focus:border-green-500 bg-white')}
                  rows={4}
                />
                {errors.description && <p className="text-sm text-red-500 font-medium mt-1">{errors.description}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Prix (FCFA/kg)" value={formData.prix} onChange={(e) => handleInputChange('prix', e.target.value)} placeholder="350" type="number" error={errors.prix} icon="💰" />
                <Input label="Quantité disponible (kg)" value={formData.quantite_disponible} onChange={(e) => handleInputChange('quantite_disponible', e.target.value)} placeholder="50" type="number" error={errors.quantite_disponible} icon="📦" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Catégorie</label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button key={cat.value} onClick={() => handleInputChange('categorie', cat.value)} className={cn('p-3 rounded-xl border-2 transition-colors text-left', formData.categorie === cat.value ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400')}>
                      <div className="flex items-center gap-2">
                        <Icon name={cat.icon} size={20} />
                        <span className="font-medium">{cat.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <input type="checkbox" id="certifie" checked={formData.certifie} onChange={(e) => handleInputChange('certifie', e.target.checked)} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                <label htmlFor="certifie" className="text-sm font-medium text-gray-700">Produit certifié Agrinova</label>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Localisation et photo</h2>
              <p className="text-gray-600">Où se trouve votre produit et ajoutez une photo</p>
            </div>
            <div className="space-y-4">
              <Input label="Localisation" value={formData.localisation} onChange={(e) => handleInputChange('localisation', e.target.value)} placeholder="Ex: Thiès, Sénégal" error={errors.localisation} icon="📍" />
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Photo du produit</label>
                {formData.photoPreview ? (
                  <div className="relative">
                    <img src={formData.photoPreview} alt="Preview" className="w-full h-64 object-cover rounded-xl" />
                    <button onClick={() => handleInputChange('photoPreview', '')} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors">
                      <Icon name="❌" size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 transition-colors">
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
                    <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <Icon name="📷" size={24} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Ajouter une photo</p>
                        <p className="text-sm text-gray-500">PNG, JPG jusqu'à 5MB</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirmation</h2>
              <p className="text-gray-600">Vérifiez les informations avant de publier</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Nom du produit', value: formData.nom },
                  { label: 'Catégorie', value: formData.categorie },
                  { label: 'Prix', value: `${formData.prix} FCFA/kg` },
                  { label: 'Quantité', value: `${formData.quantite_disponible} kg` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="font-medium text-gray-800">{value}</p>
                  </div>
                ))}
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Localisation</p>
                  <p className="font-medium text-gray-800">{formData.localisation}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium text-gray-800">{formData.description}</p>
                </div>
              </div>
              {formData.certifie && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <Icon name="⭐" size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">Produit certifié Agrinova</span>
                </div>
              )}
              {formData.photoPreview && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Photo</p>
                  <img src={formData.photoPreview} alt="Product" className="w-32 h-32 object-cover rounded-lg" />
                </div>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <Icon name="ℹ️" size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Publication immédiate</p>
                  <p className="text-sm text-blue-600">Votre produit sera visible par tous les acheteurs dès la publication</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('producteur')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Icon name="←" size={20} />
          </button>
          <div>
            <h1 className="font-bold text-xl text-gray-800">Publier un produit</h1>
            <p className="text-sm text-gray-500">Étape {currentStep} sur 3</p>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors', step <= currentStep ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500')}>
                {step}
              </div>
              {step < 3 && <div className={cn('w-full h-1 mx-2 transition-colors', step < currentStep ? 'bg-green-600' : 'bg-gray-200')} />}
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {renderStepContent()}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))} disabled={currentStep === 1} className={currentStep === 1 ? 'invisible' : ''}>
            Précédent
          </Button>
          {currentStep < 3 ? (
            <Button variant="primary" onClick={() => { if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, 3)); }}>
              Suivant
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit} loading={loading} icon="✅">
              Publier le produit
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export { AjoutProduit };
