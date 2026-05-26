import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';
import {
  Search, X, ShoppingCart, Plus, Minus, Trash2,
  MapPin, Star, ShieldCheck, Package, ChevronRight,
  MessageSquare, CreditCard, Smartphone, Banknote,
  Info, CheckCircle, Sprout, Eye,
} from 'lucide-react';

/* ── Types ──────────────────────────────────────────────────────────────── */
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

interface CartItem {
  produit: Produit;
  quantite: number;
}

/* ── Constants ───────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { label: 'Tous',          value: '',             icon: '🛒' },
  { label: 'Légumes',       value: 'Légumes',       icon: '🥦' },
  { label: 'Fruits',        value: 'Fruits',        icon: '🍊' },
  { label: 'Céréales',      value: 'Céréales',      icon: '🌾' },
  { label: 'Légumineuses',  value: 'Légumineuses',  icon: '🥜' },
];

const CAT_COLORS: Record<string, string> = {
  Légumes:      'bg-emerald-50 text-emerald-700 border-emerald-100',
  Fruits:       'bg-orange-50 text-orange-700 border-orange-100',
  Céréales:     'bg-amber-50 text-amber-700 border-amber-100',
  Légumineuses: 'bg-lime-50 text-lime-700 border-lime-100',
};

const CAT_EMOJI: Record<string, string> = {
  Légumes: '🥦', Fruits: '🍊', Céréales: '🌾', Légumineuses: '🥜',
};

const PAYMENT_METHODS = [
  { id: 'wave',         label: 'Wave',          icon: Smartphone, color: 'text-blue-600'   },
  { id: 'orange_money', label: 'Orange Money',   icon: Smartphone, color: 'text-orange-500' },
  { id: 'cash',         label: 'Espèces',        icon: Banknote,   color: 'text-emerald-600' },
];

function initials(name?: string) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-surface-container animate-pulse">
    <div className="h-40 bg-surface-container" />
    <div className="p-3.5 space-y-2.5">
      <div className="h-4 bg-surface-container rounded w-3/4" />
      <div className="h-3 bg-surface-container rounded w-1/2" />
      <div className="h-5 bg-surface-container rounded w-2/5" />
      <div className="flex gap-2 pt-1">
        <div className="h-8 bg-surface-container rounded-xl flex-1" />
        <div className="h-8 bg-surface-container rounded-xl flex-1" />
      </div>
    </div>
  </div>
);

/* ── Product Card ────────────────────────────────────────────────────────── */
const ProduitCard = ({
  produit,
  onView,
  onContact,
  onAddToCart,
  isProducteur,
}: {
  produit: Produit;
  onView: (p: Produit) => void;
  onContact: (p: Produit) => void;
  onAddToCart?: (p: Produit) => void;
  isProducteur: boolean;
}) => {
  const inStock = produit.est_disponible && produit.quantite_disponible > 0;
  const catColor = CAT_COLORS[produit.categorie] || 'bg-surface text-primary/60 border-transparent';

  return (
    <article className="bg-white rounded-2xl overflow-hidden border border-surface-container-high hover:border-primary/20 hover:shadow-md transition-all duration-200 flex flex-col group">
      {/* Image */}
      <div
        className="relative h-40 bg-surface-container overflow-hidden cursor-pointer"
        onClick={() => onView(produit)}
      >
        {produit.photo ? (
          <img
            src={produit.photo}
            alt={produit.nom}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface to-surface-container-high">
            <span className="text-5xl opacity-50">{CAT_EMOJI[produit.categorie] || '🌾'}</span>
          </div>
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full border', catColor)}>
            {produit.categorie}
          </span>
          {produit.agriculteur_verifie && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/90 text-white">
              ✓ Certifié
            </span>
          )}
        </div>

        <div className={cn(
          'absolute bottom-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full',
          inStock ? 'bg-emerald-500 text-white' : 'bg-red-500/90 text-white'
        )}>
          {inStock ? `${produit.quantite_disponible} ${produit.unite}` : 'Épuisé'}
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 text-primary rounded-full px-3 py-1 text-[10px] font-bold flex items-center gap-1 shadow">
            <Eye size={11} /> Voir détails
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1 gap-2.5">
        <div className="cursor-pointer" onClick={() => onView(produit)}>
          <h3 className="font-bold text-primary text-sm leading-tight line-clamp-1">{produit.nom}</h3>
          {produit.description && (
            <p className="text-[10px] text-primary/45 mt-0.5 line-clamp-2 leading-relaxed">{produit.description}</p>
          )}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-primary">{produit.prix.toLocaleString()}</span>
          <span className="text-[10px] font-semibold text-primary/45">FCFA/{produit.unite}</span>
        </div>

        {/* Vendeur */}
        <div className="flex items-center gap-2 pt-2 border-t border-surface-container">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-[9px] font-black text-primary">{initials(produit.agriculteur_nom)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-primary truncate">{produit.agriculteur_nom || 'Producteur'}</p>
            <p className="text-[9px] text-primary/40 flex items-center gap-1">
              {produit.agriculteur_note && produit.agriculteur_note > 0
                ? <><span>⭐ {produit.agriculteur_note.toFixed(1)}</span><span>·</span></>
                : null}
              <span className="truncate">{produit.localisation || produit.agriculteur_localisation || 'Sénégal'}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 mt-auto">
          {isProducteur ? (
            <button
              onClick={() => onContact(produit)}
              className="flex-1 py-2 rounded-xl bg-primary text-white text-[11px] font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1"
            >
              <MessageSquare size={11} />
              Contacter
            </button>
          ) : (
            <>
              <button
                onClick={() => onView(produit)}
                className="py-2 px-2.5 rounded-xl border border-surface-container-high text-primary text-[11px] font-semibold hover:bg-surface-container transition-colors"
              >
                Détails
              </button>
              {inStock ? (
                <button
                  onClick={() => onAddToCart?.(produit)}
                  className="flex-1 py-2 rounded-xl bg-primary text-white text-[11px] font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1"
                >
                  <ShoppingCart size={11} />
                  Ajouter
                </button>
              ) : (
                <button disabled className="flex-1 py-2 rounded-xl bg-surface-container text-primary/30 text-[11px] font-bold cursor-not-allowed">
                  Épuisé
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
};

/* ── Product Detail Modal ────────────────────────────────────────────────── */
const ModalProduit = ({
  produit,
  onClose,
  onContact,
  onAddToCart,
  isProducteur,
  isLoggedIn,
}: {
  produit: Produit;
  onClose: () => void;
  onContact: (p: Produit) => void;
  onAddToCart?: (p: Produit, qty: number) => void;
  isProducteur: boolean;
  isLoggedIn: boolean;
}) => {
  const [qty, setQty] = useState(1);
  const inStock = produit.est_disponible && produit.quantite_disponible > 0;
  const maxQty = produit.quantite_disponible;
  const catColor = CAT_COLORS[produit.categorie] || 'bg-surface text-primary/60 border-transparent';

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-xl bg-white rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="relative shrink-0">
          {produit.photo ? (
            <img
              src={produit.photo}
              alt={produit.nom}
              className="w-full h-52 md:h-64 object-cover"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-52 md:h-64 flex items-center justify-center bg-gradient-to-br from-surface to-surface-container-high">
              <span className="text-8xl opacity-40">{CAT_EMOJI[produit.categorie] || '🌾'}</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <X size={16} />
          </button>

          <div className="absolute bottom-3 left-3 flex gap-1.5">
            <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded-full border', catColor)}>
              {produit.categorie}
            </span>
            {produit.agriculteur_verifie && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/90 text-white flex items-center gap-1">
                <ShieldCheck size={9} /> Certifié
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Title + price */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-headline font-black text-xl text-primary leading-tight">{produit.nom}</h2>
              {produit.description && (
                <p className="text-sm text-primary/60 mt-1 leading-relaxed">{produit.description}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="font-black text-2xl text-primary">{produit.prix.toLocaleString()}</p>
              <p className="text-[10px] text-primary/40 font-semibold">FCFA/{produit.unite}</p>
            </div>
          </div>

          {/* Stock */}
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold',
            inStock
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
              : 'bg-red-50 border-red-100 text-red-600'
          )}>
            <Package size={14} />
            {inStock
              ? `${produit.quantite_disponible} ${produit.unite} disponible${produit.quantite_disponible > 1 ? 's' : ''}`
              : 'Stock épuisé'}
          </div>

          {/* Seller */}
          <div className="bg-surface rounded-2xl p-4 border border-surface-container-high">
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-primary/40 mb-3">Producteur</p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center font-headline font-black text-primary text-sm">
                {initials(produit.agriculteur_nom)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-primary">{produit.agriculteur_nom || 'Producteur'}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {produit.agriculteur_note && produit.agriculteur_note > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">
                      <Star size={10} fill="currentColor" />
                      {produit.agriculteur_note.toFixed(1)}
                    </span>
                  )}
                  {(produit.localisation || produit.agriculteur_localisation) && (
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-primary/45">
                      <MapPin size={9} />
                      {produit.localisation || produit.agriculteur_localisation}
                    </span>
                  )}
                  {produit.agriculteur_verifie && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-primary">
                      <ShieldCheck size={9} /> Vérifié
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onContact(produit)}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary/8 hover:bg-primary/15 text-primary rounded-xl text-[10px] font-bold transition-colors"
              >
                <MessageSquare size={11} />
                Contacter
              </button>
            </div>
          </div>

          {/* Qty selector + add to cart — acheteurs only */}
          {!isProducteur && isLoggedIn && inStock && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-primary">Quantité</p>
                <div className="flex items-center gap-3 bg-surface-container-low rounded-xl p-1">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-surface-container-high flex items-center justify-center text-primary hover:bg-surface-container transition-colors shadow-sm"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-black text-primary w-10 text-center text-sm">{qty} {produit.unite}</span>
                  <button
                    onClick={() => setQty(q => Math.min(maxQty, q + 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-surface-container-high flex items-center justify-center text-primary hover:bg-surface-container transition-colors shadow-sm"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-primary/50">
                <span>Sous-total</span>
                <span className="font-black text-primary text-base">{(produit.prix * qty).toLocaleString()} FCFA</span>
              </div>
            </div>
          )}

          {!isLoggedIn && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
              <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 font-semibold">
                Connectez-vous pour ajouter ce produit à votre panier et passer commande.
              </p>
            </div>
          )}

          {isProducteur && (
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-3">
              <Info size={16} className="text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-primary/70 font-semibold">
                En tant que producteur, vous êtes en mode consultation. Vous pouvez contacter d'autres vendeurs.
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {!isProducteur && isLoggedIn && inStock && (
          <div className="shrink-0 p-4 border-t border-surface-container-high bg-white">
            <button
              onClick={() => { onAddToCart?.(produit, qty); onClose(); }}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md text-sm"
            >
              <ShoppingCart size={16} />
              Ajouter au panier · {(produit.prix * qty).toLocaleString()} FCFA
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Cart Panel ──────────────────────────────────────────────────────────── */
const CartPanel = ({
  cart,
  onClose,
  onUpdateQty,
  onRemove,
  onCheckout,
}: {
  cart: CartItem[];
  onClose: () => void;
  onUpdateQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => void;
}) => {
  const total = cart.reduce((s, i) => s + i.produit.prix * i.quantite, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white h-full flex flex-col shadow-2xl pb-24">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-container-high">
          <div>
            <h2 className="font-headline font-black text-lg text-primary">Mon panier</h2>
            <p className="text-xs text-primary/45 font-semibold">{cart.length} article{cart.length > 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-primary hover:bg-surface-container transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-primary/30">
              <ShoppingCart size={48} className="mb-3 opacity-30" />
              <p className="font-bold text-sm">Panier vide</p>
              <p className="text-xs mt-1">Ajoutez des produits depuis la boutique</p>
            </div>
          ) : cart.map(item => (
            <div key={item.produit.id} className="bg-surface rounded-2xl border border-surface-container-high p-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-surface-container shrink-0 overflow-hidden">
                  {item.produit.photo ? (
                    <img src={item.produit.photo} alt={item.produit.nom} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xl">{CAT_EMOJI[item.produit.categorie] || '🌾'}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-primary truncate">{item.produit.nom}</p>
                  <p className="text-[10px] text-primary/45 font-semibold">{item.produit.agriculteur_nom || 'Producteur'}</p>
                  <p className="text-xs font-black text-primary mt-1">{(item.produit.prix * item.quantite).toLocaleString()} FCFA</p>
                </div>
                <button onClick={() => onRemove(item.produit.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                  <Trash2 size={13} />
                </button>
              </div>
              {/* Qty control */}
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-surface-container">
                <span className="text-[10px] text-primary/45 font-semibold">{item.produit.prix.toLocaleString()} FCFA/{item.produit.unite}</span>
                <div className="flex items-center gap-2 bg-white border border-surface-container-high rounded-lg p-0.5">
                  <button
                    onClick={() => item.quantite > 1 ? onUpdateQty(item.produit.id, item.quantite - 1) : onRemove(item.produit.id)}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-primary hover:bg-surface-container transition-colors"
                  >
                    <Minus size={11} />
                  </button>
                  <span className="text-xs font-black text-primary w-8 text-center">{item.quantite}</span>
                  <button
                    onClick={() => onUpdateQty(item.produit.id, Math.min(item.produit.quantite_disponible, item.quantite + 1))}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-primary hover:bg-surface-container transition-colors"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="shrink-0 p-4 border-t border-surface-container-high space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-primary/60">Total</span>
              <span className="font-black text-xl text-primary">{total.toLocaleString()} FCFA</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md text-sm"
            >
              <CreditCard size={16} />
              Passer commande
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Checkout Modal ───────────────────────────────────────────────────────── */
const CheckoutModal = ({
  cart,
  onClose,
  onConfirm,
  loading,
}: {
  cart: CartItem[];
  onClose: () => void;
  onConfirm: (address: string, payment: string) => void;
  loading: boolean;
}) => {
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('wave');
  const total = cart.reduce((s, i) => s + i.produit.prix * i.quantite, 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-surface-container-high">
          <h2 className="font-headline font-black text-lg text-primary">Finaliser la commande</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-primary hover:bg-surface-container">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Summary */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-primary/40">Récapitulatif</p>
            {cart.map(item => (
              <div key={item.produit.id} className="flex items-center justify-between text-sm">
                <span className="text-primary/70 font-semibold flex-1 truncate">{item.produit.nom} × {item.quantite}</span>
                <span className="font-bold text-primary shrink-0 ml-3">{(item.produit.prix * item.quantite).toLocaleString()} F</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-surface-container-high">
              <span className="font-bold text-sm text-primary">Total</span>
              <span className="font-black text-lg text-primary">{total.toLocaleString()} FCFA</span>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-extrabold tracking-wider text-primary/40">
              Adresse de livraison
            </label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Quartier, rue, point de repère..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-surface-container-high bg-surface hover:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl outline-none resize-none text-sm text-primary placeholder:text-primary/30 font-medium transition-all"
            />
          </div>

          {/* Payment */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-primary/40">Mode de paiement</p>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(pm => {
                const Icon = pm.icon;
                return (
                  <label key={pm.id} className={cn(
                    'flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all',
                    payment === pm.id
                      ? 'border-primary bg-primary/5'
                      : 'border-surface-container-high hover:border-primary/30'
                  )}>
                    <input
                      type="radio"
                      name="payment"
                      value={pm.id}
                      checked={payment === pm.id}
                      onChange={() => setPayment(pm.id)}
                      className="sr-only"
                    />
                    <Icon size={18} className={pm.color} />
                    <span className="font-bold text-sm text-primary flex-1">{pm.label}</span>
                    {payment === pm.id && <CheckCircle size={16} className="text-primary" />}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="shrink-0 p-5 border-t border-surface-container-high">
          <button
            onClick={() => onConfirm(address, payment)}
            disabled={loading || !address.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <CheckCircle size={16} />
            {loading ? 'Commande en cours...' : `Confirmer · ${total.toLocaleString()} FCFA`}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────────────────────── */
const Marketplace = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const isProducteur = user?.role === 'producteur';
  const isLoggedIn = !!user;

  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [categorie, setCategorie] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [detailProduit, setDetailProduit] = useState<Produit | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api('/produits');
        if (Array.isArray(data)) setProduits(data);
      } catch {
        // silence
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

  const cartCount = cart.reduce((s, i) => s + i.quantite, 0);
  const totalDispo = produits.filter(p => p.est_disponible && p.quantite_disponible > 0).length;

  /* ── Cart handlers ── */
  const handleAddToCart = (produit: Produit, qty = 1) => {
    if (!isLoggedIn) { showToast('Connectez-vous pour ajouter au panier'); navigate('connexion'); return; }
    setCart(prev => {
      const existing = prev.find(i => i.produit.id === produit.id);
      if (existing) {
        return prev.map(i =>
          i.produit.id === produit.id
            ? { ...i, quantite: Math.min(produit.quantite_disponible, i.quantite + qty) }
            : i
        );
      }
      return [...prev, { produit, quantite: qty }];
    });
    showToast(`${produit.nom} ajouté au panier`);
  };

  const handleUpdateQty = (id: number, qty: number) => {
    setCart(prev => prev.map(i => i.produit.id === id ? { ...i, quantite: qty } : i));
  };

  const handleRemove = (id: number) => {
    setCart(prev => prev.filter(i => i.produit.id !== id));
  };

  /* ── Contact handler ── */
  const handleContact = (produit: Produit) => {
    if (!isLoggedIn) { showToast('Connectez-vous pour contacter un vendeur'); navigate('connexion'); return; }
    if (!produit.agriculteur_id) return;
    navigate('chat', {
      contactId: produit.agriculteur_id,
      contactNom: produit.agriculteur_nom || 'Vendeur',
      contactRole: 'producteur',
      produitNom: produit.nom,
    });
  };

  /* ── Checkout ── */
  const handleCheckout = async (address: string, payment: string) => {
    setCheckoutLoading(true);
    try {
      const results = await Promise.allSettled(
        cart.map(item =>
          api('/commandes', 'POST', {
            produit_id: item.produit.id,
            quantite: item.quantite,
            adresse_livraison: address,
            methode_paiement: payment,
          })
        )
      );
      const failures = results.filter(r => r.status === 'rejected').length;
      if (failures === 0) {
        showToast('Commande(s) passée(s) avec succès !');
        setCart([]);
        setCheckoutOpen(false);
        setCartOpen(false);
        // Refresh produits to get updated stock
        const data = await api('/produits');
        if (Array.isArray(data)) setProduits(data);
      } else if (failures < cart.length) {
        showToast(`${cart.length - failures} commande(s) confirmée(s), ${failures} échouée(s)`);
      } else {
        showToast('Erreur lors de la commande. Réessayez.');
      }
    } catch {
      showToast('Impossible de passer la commande pour l\'instant.');
    }
    setCheckoutLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface pb-32">

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <header className="bg-white sticky top-0 z-40 border-b border-surface-container-high shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-headline font-black text-primary text-lg leading-tight flex items-center gap-1.5">
              <Sprout size={16} className="text-secondary" />
              Boutique
            </h1>
            <p className="text-[10px] text-primary/40 font-semibold">{totalDispo} produit{totalDispo !== 1 ? 's' : ''} disponible{totalDispo !== 1 ? 's' : ''}</p>
          </div>

          <div className="flex items-center gap-2">
            {isProducteur && (
              <button
                onClick={() => navigate('ajouter')}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all"
              >
                <Plus size={13} strokeWidth={2.5} />
                Publier
              </button>
            )}

            {!isProducteur && isLoggedIn && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-1.5 px-3 py-2 bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-primary rounded-xl text-xs font-bold transition-colors"
              >
                <ShoppingCart size={14} />
                Panier
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {isLoggedIn && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-[9px] font-black text-primary">{initials(user?.nom)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="max-w-5xl mx-auto px-4 pb-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30" size={15} />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Produit, vendeur, région..."
              className="w-full pl-9 pr-9 py-2.5 bg-surface-container rounded-xl text-sm text-primary placeholder:text-primary/35 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/30 hover:text-primary">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="max-w-5xl mx-auto px-4 pb-3">
          <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategorie(cat.value)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border shrink-0',
                  categorie === cat.value
                    ? 'bg-primary text-white border-primary shadow-sm'
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

      {/* ── Producteur consultation banner ────────────────────────────────── */}
      {isProducteur && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="bg-primary/5 border border-primary/15 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Eye size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary">Mode consultation</p>
              <p className="text-[10px] text-primary/55 font-semibold">Vous consultez la boutique en tant que producteur. Contactez d'autres vendeurs si besoin.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-4">
        {!loading && (search || categorie) && (
          <p className="text-xs text-primary/45 mb-3 font-semibold">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            {search && <span> pour "<strong className="text-primary">{search}</strong>"</span>}
            {categorie && <span> · {categorie}</span>}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(p => (
              <ProduitCard
                key={p.id}
                produit={p}
                onView={setDetailProduit}
                onContact={handleContact}
                onAddToCart={p2 => handleAddToCart(p2)}
                isProducteur={isProducteur}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">{search ? '🔍' : '🌾'}</span>
            </div>
            <p className="font-bold text-primary/60 text-sm mb-1">
              {search ? `Aucun résultat pour "${search}"` : 'Aucun produit disponible'}
            </p>
            <p className="text-xs text-primary/40 font-semibold max-w-xs mx-auto leading-relaxed">
              {search ? 'Essayez un autre terme ou effacez la recherche.' : 'Revenez bientôt, les producteurs publient régulièrement.'}
            </p>
            {(search || categorie) && (
              <button
                onClick={() => { setSearch(''); setCategorie(''); }}
                className="mt-4 px-4 py-2 bg-surface-container text-primary rounded-xl text-xs font-bold hover:bg-surface-container-high transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </main>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {detailProduit && (
        <ModalProduit
          produit={detailProduit}
          onClose={() => setDetailProduit(null)}
          onContact={p => { setDetailProduit(null); handleContact(p); }}
          onAddToCart={handleAddToCart}
          isProducteur={isProducteur}
          isLoggedIn={isLoggedIn}
        />
      )}

      {cartOpen && !isProducteur && (
        <CartPanel
          cart={cart}
          onClose={() => setCartOpen(false)}
          onUpdateQty={handleUpdateQty}
          onRemove={handleRemove}
          onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
        />
      )}

      {checkoutOpen && !isProducteur && (
        <CheckoutModal
          cart={cart}
          onClose={() => setCheckoutOpen(false)}
          onConfirm={handleCheckout}
          loading={checkoutLoading}
        />
      )}
    </div>
  );
};

export { Marketplace };
