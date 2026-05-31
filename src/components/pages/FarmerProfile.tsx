import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getProfilPublic } from '../../services/api';
import { cn } from '../../lib/utils';
import {
  MapPin, Star, ShieldCheck, Package, MessageSquare,
  ArrowLeft, Sprout, Calendar, Heart, Loader2,
  ChevronRight, X,
} from 'lucide-react';

interface FarmerData {
  utilisateur: {
    id: number;
    nom: string;
    role: string;
    localisation?: string;
    photo_profil?: string;
    bio?: string;
    note_globale: number;
    nombre_avis: number;
    est_verifie: boolean;
    date_inscription?: string;
  };
  produits: any[];
  avis: any[];
  posts: any[];
  nb_produits: number;
}

function Avatar({ nom, photo, size = 64 }: { nom: string; photo?: string; size?: number }) {
  const initials = nom?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';
  if (photo) {
    return (
      <img
        src={photo}
        alt={nom}
        className="rounded-2xl object-cover border-2 border-yellow-300"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-2xl flex items-center justify-center font-black text-primary border-2 border-yellow-300"
      style={{
        width: size, height: size,
        background: 'linear-gradient(135deg, #F6C844 0%, #E0AB26 100%)',
        fontSize: size * 0.3,
      }}
    >
      {initials}
    </div>
  );
}

function StarRating({ note }: { note: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={i < Math.round(note) ? 'text-yellow-400' : 'text-surface-container-high'}
          fill={i < Math.round(note) ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}

type Tab = 'produits' | 'posts' | 'avis';

/* ── Modal Farmer Profile ──────────────────────────────────────────────── */
export function FarmerProfileModal({
  userId,
  onClose,
}: {
  userId: number;
  onClose: () => void;
}) {
  const { navigate } = useRouter();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState<FarmerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('produits');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getProfilPublic(userId);
        setData(res);
      } catch {
        onClose();
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl p-8">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const { utilisateur: farmer, produits, avis, posts } = data;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'produits', label: 'Produits', count: produits.length },
    { id: 'posts', label: 'Publications', count: posts.length },
    { id: 'avis', label: 'Avis', count: avis.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-white/90 hover:bg-surface transition-colors shadow-sm"
        >
          <X size={18} className="text-primary" />
        </button>

        {/* Hero banner */}
        <div
          className="relative pt-8 pb-6 px-5 flex items-end gap-4 shrink-0"
          style={{ background: 'linear-gradient(150deg, #012d1d 0%, #1b4332 100%)' }}
        >
          <Avatar nom={farmer.nom} photo={farmer.photo_profil} size={72} />
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-black text-2xl text-white tracking-tight truncate">{farmer.nom}</h2>
              {farmer.est_verifie && (
                <ShieldCheck size={18} className="text-blue-400 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className="inline-flex items-center gap-1 bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
                <Sprout size={9} /> Producteur
              </span>
              {farmer.localisation && (
                <span className="inline-flex items-center gap-1 text-white/60 text-[11px] font-semibold">
                  <MapPin size={10} className="text-yellow-300" />
                  {farmer.localisation}
                </span>
              )}
            </div>
            {farmer.note_globale > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating note={farmer.note_globale} />
                <span className="text-white/70 text-xs font-bold">
                  {farmer.note_globale.toFixed(1)} ({farmer.nombre_avis} avis)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 divide-x divide-surface-container-high border-b border-surface-container-high bg-white shrink-0">
          {[
            { label: 'Produits', value: data.nb_produits, icon: Package },
            { label: 'Avis', value: farmer.nombre_avis, icon: Star },
            { label: 'Posts', value: posts.length, icon: Heart },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center py-3 px-2">
              <Icon size={14} className="text-secondary mb-1" />
              <p className="font-black text-base text-primary leading-none">{value}</p>
              <p className="text-[10px] text-primary/45 font-bold uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Bio */}
        {farmer.bio && (
          <div className="px-5 py-3 bg-surface border-b border-surface-container-high shrink-0">
            <p className="text-sm text-primary/70 font-medium leading-relaxed">{farmer.bio}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-2 border-b border-surface-container-high bg-white shrink-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all',
                activeTab === t.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-primary/50 hover:text-primary hover:bg-surface-container-low'
              )}
            >
              {t.label}
              {t.count > 0 && (
                <span className={cn(
                  'text-[9px] font-black px-1.5 py-0.5 rounded-full',
                  activeTab === t.id ? 'bg-white/25 text-white' : 'bg-surface-container text-primary/60'
                )}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">

          {/* Produits */}
          {activeTab === 'produits' && (
            <div className="p-4 space-y-3">
              {produits.length === 0 ? (
                <div className="text-center py-10 text-primary/30">
                  <Package size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-bold">Aucun produit disponible</p>
                </div>
              ) : (
                produits.map((p: any) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 bg-surface rounded-2xl border border-surface-container-high p-3 hover:shadow-sm transition-all"
                  >
                    {p.photo ? (
                      <img src={p.photo} alt={p.nom} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                        <Package size={22} className="text-primary/30" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-primary truncate">{p.nom}</p>
                      <p className="text-[11px] text-secondary font-semibold">{p.categorie}</p>
                      <p className="font-black text-primary text-sm mt-0.5">
                        {p.prix?.toLocaleString()} FCFA
                        <span className="text-xs font-semibold text-primary/50">/{p.unite}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-bold text-primary/40 uppercase">Stock</p>
                      <p className="font-bold text-sm text-primary">{p.quantite_disponible}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Posts */}
          {activeTab === 'posts' && (
            <div className="p-4 space-y-3">
              {posts.length === 0 ? (
                <div className="text-center py-10 text-primary/30">
                  <Heart size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-bold">Aucune publication</p>
                </div>
              ) : (
                posts.map((p: any) => (
                  <div key={p.id} className="bg-surface rounded-2xl border border-surface-container-high p-4">
                    <p className="text-sm text-primary leading-relaxed whitespace-pre-wrap">{p.contenu}</p>
                    {p.photo && (
                      <img src={p.photo} alt="" className="mt-3 w-full rounded-xl object-cover max-h-48 border border-surface-container-high" />
                    )}
                    <div className="flex items-center gap-3 mt-3 text-[11px] text-primary/40 font-semibold">
                      <span className="flex items-center gap-1">
                        <Heart size={11} fill={p.nb_likes > 0 ? 'currentColor' : 'none'} className={p.nb_likes > 0 ? 'text-red-400' : ''} />
                        {p.nb_likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={11} />
                        {p.nb_commentaires}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Avis */}
          {activeTab === 'avis' && (
            <div className="p-4 space-y-3">
              {avis.length === 0 ? (
                <div className="text-center py-10 text-primary/30">
                  <Star size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-bold">Aucun avis pour l'instant</p>
                </div>
              ) : (
                avis.map((a: any) => (
                  <div key={a.id} className="bg-surface rounded-2xl border border-surface-container-high p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm text-primary">{a.auteur_nom}</p>
                        <StarRating note={a.note} />
                      </div>
                      <p className="text-[11px] text-primary/35 font-semibold shrink-0">
                        {a.date_avis ? new Date(a.date_avis).toLocaleDateString('fr-FR') : ''}
                      </p>
                    </div>
                    {a.commentaire && (
                      <p className="text-sm text-primary/70 leading-relaxed mt-2">{a.commentaire}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* CTA footer */}
        {currentUser && currentUser.id !== userId && (
          <div className="px-4 pb-5 pt-3 border-t border-surface-container-high bg-white shrink-0 flex gap-2">
            <button
              onClick={() => { navigate('chat'); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-surface border border-surface-container-high text-primary font-bold text-sm hover:bg-primary/5 transition-all"
            >
              <MessageSquare size={16} />
              Contacter
            </button>
            <button
              onClick={() => { navigate('marketplace'); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-sm"
            >
              <Package size={16} />
              Voir produits
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Page complète FarmerProfile ───────────────────────────────────────── */
const FarmerProfile = () => {
  const { routeState, navigate } = useRouter();
  const userId = routeState?.userId as number | undefined;

  if (!userId) {
    navigate('marketplace');
    return null;
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Back button */}
      <button
        onClick={() => navigate('marketplace')}
        className="fixed top-4 left-4 z-10 p-2 rounded-xl bg-white shadow-sm border border-surface-container-high hover:bg-surface transition-colors"
      >
        <ArrowLeft size={18} className="text-primary" />
      </button>

      <FarmerProfileModal
        userId={userId}
        onClose={() => navigate('marketplace')}
      />
    </div>
  );
};

export { FarmerProfile };
