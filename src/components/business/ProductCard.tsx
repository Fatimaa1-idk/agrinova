import React from 'react';
import { Card, Button, Icon } from '../ui';
import { cn } from '../../lib/utils';

export interface ProductCardProps {
  product: {
    id: number;
    nom: string;
    description: string;
    prix: number;
    localisation: string;
    note_globale?: number;
    quantite_disponible: number;
    est_disponible: boolean;
    certifie: boolean;
    categorie: string;
    img?: string;
    photo?: string;
  };
  onView: (product: any) => void;
  onAddToCart: (product: any) => void;
  className?: string;
  key?: React.Key;
}

const ProductCard = ({ product, onView, onAddToCart, className }: ProductCardProps) => {
  const imageSrc = product.img || product.photo;
  const inStock = product.est_disponible && product.quantite_disponible > 0;

  return (
    <article className={cn(
      'group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all duration-200',
      className
    )}>
      {/* Product Image */}
      <div 
        className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden"
        onClick={() => onView(product)}
      >
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={product.nom} 
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = '';
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-center">
              <Icon name="🌾" size={48} className="text-green-600 mb-2" />
              <p className="text-xs text-green-600 font-medium">Photo à venir</p>
            </div>
          </div>
        )}
        
        {/* Certification Badge */}
        {product.certifie && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full border border-yellow-400 shadow-sm">
            <div className="flex items-center gap-1">
              <Icon name="⭐" size={10} className="text-yellow-500" />
              <span className="text-xs font-bold text-gray-800">Certifié</span>
            </div>
          </div>
        )}
        
        {/* Stock Status */}
        <div className="absolute bottom-3 left-3">
          <div className={cn(
            'px-3 py-1.5 rounded-full text-xs font-bold shadow-sm',
            inStock 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          )}>
            {inStock ? 'En stock' : 'Épuisé'}
          </div>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-6 space-y-4">
        {/* Product Name */}
        <div>
          <h3 
            className="font-bold text-lg text-gray-800 mb-1 transition-colors duration-200 group-hover:text-gray-600 cursor-pointer"
            onClick={() => onView(product)}
          >
            {product.nom}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
        </div>
        
        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-gray-800">
            {product.prix?.toLocaleString()}
          </span>
          <span className="text-sm font-bold text-gray-600">FCFA/kg</span>
        </div>
        
        {/* Meta Info */}
        <div className="flex items-center justify-between py-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Icon name="📍" size={14} />
            <span className="font-medium">{product.localisation}</span>
          </div>
          
          {product.note_globale && (
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
              <Icon name="⭐" size={12} className="text-yellow-500" />
              <span className="text-xs font-bold text-yellow-600">{product.note_globale}</span>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="md"
            onClick={() => onView(product)}
            className="flex-1"
          >
            Voir détails
          </Button>
          
          {inStock && (
            <Button 
              variant="primary" 
              size="md"
              onClick={() => onAddToCart(product)}
              className="flex-1"
              icon="🛒"
            >
              Ajouter
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};

export { ProductCard };
