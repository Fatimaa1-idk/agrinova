import React, { useState, useEffect } from 'react';
import { Button, Input, Icon } from '../ui';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';

const demoProduct = {
  id: 1,
  nom: 'Tomates de Thiès',
  description: 'Récoltées ce matin, parfaitement mûres et juteuses. Cultivées sans pesticides, directement du champ à votre assiette. Idéales pour salades, sauces et cuissons variées.',
  prix: 350,
  localisation: 'Thiès, Sénégal',
  note_globale: 4.8,
  quantite_disponible: 50,
  est_disponible: true,
  certifie: true,
  categorie: 'Légumes',
  img: 'https://images.unsplash.com/photo-1592924357228-91a4daadc2b6?q=80&w=400',
  producteur: { nom: 'Moussa Diop', id: 1, note: 4.8, membres_depuis: '2024', localisation: 'Thiès', certifie: true },
  avis: [
    { id: 1, nom: 'Amadou Sall', note: 5, texte: 'Excellent produit, très frais et bien emballé ! Moussa est toujours ponctuel.', date: 'Il y a 2 jours' },
    { id: 2, nom: 'Fatou Ndiaye', note: 4, texte: 'Bonne qualité, livraison rapide. Je recommande vivement !', date: 'La semaine dernière' },
    { id: 3, nom: 'Ibrahim Ba', note: 5, texte: "Des tomates comme on en trouve plus ! Parfaites pour mon restaurant.", date: 'Il y a 1 semaine' },
  ],
};

const categories = [
  { value: 'Légumes', label: 'Légumes frais', icon: '🥦' },
  { value: 'Fruits', label: 'Fruits saisonniers', icon: '🍊' },
  { value: 'Céréales', label: 'Céréales locales', icon: '🌾' },
  { value: 'Légumineuses', label: 'Légumineuses', icon: '🥜' },
];

const ProductDetail = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { navigate, routeState } = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '', description: '', prix: '', quantite_disponible: '',
    localisation: '', categorie: 'Légumes', est_disponible: true, certifie: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const passedProduct = routeState?.product as any;
        if (passedProduct?.id) {
          const data = await api(`/produits/${passedProduct.id}`);
          setProduct(data?.id ? data : passedProduct);
        } else {
          setProduct(demoProduct);
        }
      } catch {
        setProduct((routeState?.product as any) || demoProduct);
      }
      setLoading(false);
    };
    load();
  }, [routeState]);

  useEffect(() => {
    if (product) {
      setFormData({
        nom: product.nom,
        description: product.description,
        prix: product.prix.toString(),
        quantite_disponible: product.quantite_disponible.toString(),
        localisation: product.localisation,
        categorie: product.categorie,
        est_disponible: product.est_disponible,
        certifie: product.certifie,
      });
    }
  }, [product]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (!formData.prix || parseFloat(formData.prix) <= 0) newErrors.prix = 'Le prix doit être supérieur à 0';
    if (!formData.quantite_disponible || parseInt(formData.quantite_disponible) < 0) newErrors.quantite_disponible = 'La quantité doit être positive';
    if (!formData.localisation.trim()) newErrors.localisation = 'La localisation est requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await api(`/produits/${product.id}`, 'PUT', formData);
      if (response.success) {
        showToast('Produit mis à jour avec succès');
        setProduct({ ...product, ...formData });
        setIsEditing(false);
      } else {
        showToast('Erreur lors de la mise à jour');
      }
    } catch {
      showToast('Serveur indisponible. Réessayez plus tard.');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    setLoading(true);
    try {
      const response = await api(`/produits/${product.id}`, 'DELETE');
      if (response.success) {
        showToast('Produit supprimé avec succès');
        navigate('gestion-produits');
      } else {
        showToast('Erreur lors de la suppression');
      }
    } catch {
      showToast('Serveur indisponible. Réessayez plus tard.');
    }
    setLoading(false);
  };

  const addToCart = () => {
    if (!user) {
      showToast('Connectez-vous pour commander');
      navigate('connexion');
      return;
    }
    const cartItems = JSON.parse(localStorage.getItem('agrinova_cart') || '[]');
    const existing = cartItems.find((item: any) => item.id === product.id);
    if (existing) {
      localStorage.setItem('agrinova_cart', JSON.stringify(cartItems.map((item: any) => item.id === product.id ? { ...item, qte: item.qte + 1 } : item)));
    } else {
      localStorage.setItem('agrinova_cart', JSON.stringify([...cartItems, { ...product, qte: 1 }]));
    }
    showToast(`${product.nom} ajouté au panier`);
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="⏳" size={32} className="text-green-600 animate-spin" />
          </div>
          <p className="text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('marketplace')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Icon name="←" size={20} />
            </button>
            <h1 className="font-bold text-xl text-gray-800 truncate">{product.nom}</h1>
          </div>
          {user?.role === 'producteur' && !isEditing && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} icon="✏️">Modifier</Button>
              <Button variant="ghost" size="sm" onClick={handleDelete} icon="🗑️" className="text-red-500 hover:bg-red-50">Supprimer</Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
            {product.img ? (
              <img src={product.img} alt={product.nom} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="🌾" size={48} className="text-gray-400" />
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              {product.certifie && (
                <div className="bg-yellow-100 border border-yellow-400 px-3 py-1 rounded-full text-xs font-bold text-yellow-800">
                  <Icon name="⭐" size={10} className="mr-1" />Certifié
                </div>
              )}
              <div className={cn('px-3 py-1 rounded-full text-xs font-bold', product.est_disponible && product.quantite_disponible > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white')}>
                {product.est_disponible && product.quantite_disponible > 0 ? 'En stock' : 'Épuisé'}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6">
          {isEditing ? (
            <div className="space-y-4">
              <Input label="Nom du produit" value={formData.nom} onChange={(e) => handleInputChange('nom', e.target.value)} error={errors.nom} />
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} className={cn('w-full px-4 py-3 border-2 rounded-xl outline-none resize-none', errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-green-500')} rows={3} />
                {errors.description && <p className="text-sm text-red-500 font-medium mt-1">{errors.description}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Prix (FCFA/kg)" value={formData.prix} onChange={(e) => handleInputChange('prix', e.target.value)} type="number" error={errors.prix} />
                <Input label="Quantité (kg)" value={formData.quantite_disponible} onChange={(e) => handleInputChange('quantite_disponible', e.target.value)} type="number" error={errors.quantite_disponible} />
              </div>
              <Input label="Localisation" value={formData.localisation} onChange={(e) => handleInputChange('localisation', e.target.value)} error={errors.localisation} />
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Catégorie</label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button key={cat.value} onClick={() => handleInputChange('categorie', cat.value)} className={cn('p-3 rounded-xl border-2 transition-colors text-left', formData.categorie === cat.value ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400')}>
                      <div className="flex items-center gap-2">
                        <Icon name={cat.icon} size={16} />
                        <span className="text-sm font-medium">{cat.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="disponible" checked={formData.est_disponible} onChange={(e) => handleInputChange('est_disponible', e.target.checked)} className="w-4 h-4 text-green-600 border-gray-300 rounded" />
                <label htmlFor="disponible" className="text-sm font-medium text-gray-700">Produit disponible</label>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setFormData({ nom: product.nom, description: product.description, prix: product.prix.toString(), quantite_disponible: product.quantite_disponible.toString(), localisation: product.localisation, categorie: product.categorie, est_disponible: product.est_disponible, certifie: product.certifie }); setErrors({}); setIsEditing(false); }}>Annuler</Button>
                <Button variant="primary" onClick={handleSave} loading={loading} icon="💾">Sauvegarder</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{product.nom}</h2>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-green-700">{product.prix?.toLocaleString()}</span>
                <span className="text-sm font-bold text-green-600">FCFA/kg</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: '📍', value: product.localisation },
                  { icon: '📦', value: `${product.quantite_disponible} kg` },
                  { icon: '⭐', value: `${product.note_globale}/5` },
                  { icon: '🏷️', value: product.categorie },
                ].map(({ icon, value }) => (
                  <div key={icon} className="text-center p-3 bg-gray-50 rounded-lg">
                    <Icon name={icon} size={20} className="text-green-600 mx-auto mb-1" />
                    <p className="text-sm font-medium text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {!isEditing && product.producteur && (
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Producteur</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {product.producteur.nom.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{product.producteur.nom}</p>
                <p className="text-sm text-gray-600">{product.producteur.localisation}</p>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1">
                    <Icon name="⭐" size={14} className="text-yellow-500" />
                    <span className="text-sm font-medium">{product.producteur.note}/5</span>
                  </div>
                  {product.producteur.certifie && (
                    <div className="bg-yellow-100 px-2 py-1 rounded-full">
                      <span className="text-xs font-bold text-yellow-800">Certifié</span>
                    </div>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('chat')}>
                <Icon name="💬" size={14} className="mr-1" />Contacter
              </Button>
            </div>
          </section>
        )}

        {!isEditing && product.avis && (
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Avis clients</h3>
            <div className="space-y-4">
              {product.avis.map((avis: any) => (
                <div key={avis.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-800">{avis.nom}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Icon key={i} name="⭐" size={12} className={i < avis.note ? 'text-yellow-500' : 'text-gray-300'} />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{avis.date}</span>
                  </div>
                  <p className="text-gray-600 italic">"{avis.texte}"</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {!isEditing && product.est_disponible && product.quantite_disponible > 0 && (
          <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200">
            <div className="max-w-4xl mx-auto">
              <Button variant="primary" size="lg" onClick={addToCart} className="w-full" icon="🛒">
                Ajouter au panier
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export { ProductDetail };
