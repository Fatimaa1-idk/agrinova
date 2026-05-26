import React, { useState, useEffect } from 'react';
import { Header, SearchBar, CategoryFilter, ProductCard } from '../business';
import { Button, Icon } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';

const Marketplace = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('Légumes');
  const [search, setSearch] = useState('');
  const [cartItems, setCartItems] = useState<any[]>(() =>
    JSON.parse(localStorage.getItem('agrinova_cart') || '[]')
  );

  const categories = [
    { label: 'Légumes frais', value: 'Légumes', icon: '🥦' },
    { label: 'Fruits saisonniers', value: 'Fruits', icon: '🍊' },
    { label: 'Céréales locales', value: 'Céréales', icon: '🌾' },
    { label: 'Légumineuses', value: 'Légumineuses', icon: '🥜' },
  ];

  const productsDemo = [
    {
      id: 1, nom: 'Tomates de Thiès',
      description: 'Récoltées ce matin, parfaitement mûres et juteuses',
      prix: 350, localisation: 'Thiès', note_globale: 4.8,
      quantite_disponible: 50, est_disponible: true, certifie: true,
      categorie: 'Légumes',
      img: 'https://images.unsplash.com/photo-1592924357228-91a4daadc2b6?q=80&w=400',
    },
    {
      id: 2, nom: 'Oignons de Gandiol',
      description: 'Gros calibre rouge, saveur douce et excellente conservation',
      prix: 600, localisation: 'Saint-Louis', note_globale: 4.5,
      quantite_disponible: 30, est_disponible: true, certifie: true,
      categorie: 'Légumes',
      img: 'https://images.unsplash.com/photo-1520788284409-a8ec417761c6?q=80&w=400',
    },
    {
      id: 3, nom: 'Mangues Kent',
      description: 'Douceur sucrée et parfumée, idéales pour jus et desserts',
      prix: 1200, localisation: 'Casamance', note_globale: 4.9,
      quantite_disponible: 0, est_disponible: false, certifie: false,
      categorie: 'Fruits',
      img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=400',
    },
    {
      id: 4, nom: 'Riz de la Vallée',
      description: 'Sac de 5kg qualité premium, grains longs et parfumés',
      prix: 500, localisation: 'Richard Toll', note_globale: 4.2,
      quantite_disponible: 100, est_disponible: true, certifie: true,
      categorie: 'Céréales',
      img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=400',
    },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api('/produits');
        if (Array.isArray(data)) setProducts(data);
      } catch {
        // mode démo
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    localStorage.setItem('agrinova_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: any) => {
    if (!user) {
      showToast('Connectez-vous pour commander');
      navigate('connexion');
      return;
    }
    const existing = cartItems.find((item: any) => item.id === product.id);
    if (existing) {
      setCartItems(prev =>
        prev.map((item: any) =>
          item.id === product.id ? { ...item, qte: item.qte + 1 } : item
        )
      );
    } else {
      setCartItems(prev => [...prev, { ...product, qte: 1 }]);
    }
    showToast(`${product.nom} ajouté au panier`);
  };

  const allProducts = products.length > 0 ? products : productsDemo;
  const filteredProducts = allProducts.filter((product: any) => {
    const matchCategory = product.categorie === category;
    const matchSearch =
      !search ||
      product.nom.toLowerCase().includes(search.toLowerCase()) ||
      product.localisation?.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const cartItemCount = cartItems.reduce((sum: number, item: any) => sum + item.qte, 0);

  return (
    <div className="min-h-screen bg-surface pb-32">
      <Header
        title="AGRINOVA"
        subtitle={user ? `Bonjour, ${user.nom}` : undefined}
        user={user}
        cartItemCount={cartItemCount}
        onNavigate={navigate}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <section className="mb-8">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Chercher un produit, une région..."
          />
        </section>

        <section className="mb-12">
          <h2 className="text-headline text-lg text-primary mb-6">Catégories</h2>
          <CategoryFilter categories={categories} active={category} onChange={setCategory} />
        </section>

        {search && (
          <div className="mb-8">
            <p className="text-body text-primary/60">
              {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} trouvé
              {filteredProducts.length !== 1 ? 's' : ''} pour "{search}"
            </p>
          </div>
        )}

        <section>
          {loading ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Icon name="⏳" size={32} className="text-primary animate-spin" />
              </div>
              <p className="text-body text-primary/60">Chargement des produits...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onView={() => navigate('produit', { product })}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/5 rounded-full mb-6">
                <Icon name="🔍" size={48} className="text-primary/30" />
              </div>

              <h3 className="text-headline text-xl text-primary mb-3">
                {search
                  ? `Aucun produit trouvé pour "${search}"`
                  : 'Aucun produit dans cette catégorie'}
              </h3>

              <p className="text-body text-primary/60 mb-8 max-w-md mx-auto">
                {search
                  ? "Essayez d'autres termes de recherche ou explorez nos catégories."
                  : 'Cette catégorie est temporairement vide. Revenez bientôt !'}
              </p>

              {user?.role === 'producteur' && !search && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('ajouter')}
                  icon="➕"
                >
                  Publier un produit
                </Button>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export { Marketplace };
