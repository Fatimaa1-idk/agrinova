import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import {
  getFeed, creerPost, supprimerPost, toggleLike,
  getCommentaires, ajouterCommentaire, BASE_URL,
} from '../../services/api';
import { cn } from '../../lib/utils';
import {
  Heart, MessageCircle, Trash2, Send, ImageIcon,
  ShieldCheck, Sprout, X, ChevronDown,
  Loader2, Plus,
} from 'lucide-react';

interface PostData {
  id: number;
  contenu: string;
  photo?: string;
  date_publication: string;
  auteur_id: number;
  auteur_nom: string;
  auteur_photo?: string;
  auteur_role: string;
  auteur_verifie: boolean;
  nb_likes: number;
  liked: boolean;
  nb_commentaires: number;
}

interface Commentaire {
  id: number;
  contenu: string;
  date_commentaire: string;
  auteur_id: number;
  auteur_nom: string;
  auteur_photo?: string;
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} j`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

function Avatar({ nom, photo, size = 40 }: { nom: string; photo?: string; size?: number }) {
  const initials = nom?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';
  if (photo) {
    return (
      <img
        src={photo}
        alt={nom}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-black text-primary shrink-0"
      style={{
        width: size, height: size,
        background: 'linear-gradient(135deg, #F6C844 0%, #E0AB26 100%)',
        fontSize: size * 0.32,
      }}
    >
      {initials}
    </div>
  );
}

/* ── Composant PostCard ─────────────────────────────────────────────────── */
function PostCard({
  post,
  currentUserId,
  onDelete,
  onLike,
}: {
  post: PostData;
  currentUserId?: number;
  onDelete: (id: number) => void;
  onLike: (id: number) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [loadingCom, setLoadingCom] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [sendingCom, setSendingCom] = useState(false);
  const [liked, setLiked] = useState(post.liked);
  const [nbLikes, setNbLikes] = useState(post.nb_likes);

  const handleToggleComments = async () => {
    if (!showComments && commentaires.length === 0) {
      setLoadingCom(true);
      const data = await getCommentaires(post.id).catch(() => []);
      setCommentaires(Array.isArray(data) ? data : []);
      setLoadingCom(false);
    }
    setShowComments(v => !v);
  };

  const handleLike = async () => {
    setLiked(v => !v);
    setNbLikes(v => liked ? v - 1 : v + 1);
    const res = await toggleLike(post.id).catch(() => null);
    if (res) {
      setLiked(res.liked);
      setNbLikes(res.nb_likes);
    }
    onLike(post.id);
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setSendingCom(true);
    const c = await ajouterCommentaire(post.id, newComment.trim()).catch(() => null);
    if (c) {
      setCommentaires(prev => [...prev, c]);
      setNewComment('');
    }
    setSendingCom(false);
  };

  const isOwn = post.auteur_id === currentUserId;

  return (
    <article className="bg-white rounded-2xl border border-surface-container-high shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar nom={post.auteur_nom} photo={post.auteur_photo} size={44} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-primary truncate">{post.auteur_nom}</span>
              {post.auteur_verifie && (
                <ShieldCheck size={13} className="text-blue-500 shrink-0" />
              )}
              <span className={cn(
                'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border shrink-0',
                post.auteur_role === 'producteur'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-blue-50 text-blue-700 border-blue-100'
              )}>
                {post.auteur_role === 'producteur' ? <><Sprout size={8} className="inline mr-0.5" />Producteur</> : 'Acheteur'}
              </span>
            </div>
            <p className="text-[11px] text-primary/40 font-semibold mt-0.5">
              {timeAgo(post.date_publication)}
            </p>
          </div>
        </div>
        {isOwn && (
          <button
            onClick={() => onDelete(post.id)}
            className="p-1.5 rounded-lg text-primary/30 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-primary leading-relaxed whitespace-pre-wrap">{post.contenu}</p>
      </div>

      {/* Photo */}
      {post.photo && (
        <div className="mx-4 mb-3 rounded-xl overflow-hidden border border-surface-container-high">
          <img
            src={post.photo}
            alt="Publication"
            className="w-full object-cover max-h-72"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 px-4 pb-3 border-t border-surface-container-high pt-3">
        <button
          onClick={handleLike}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all',
            liked
              ? 'bg-red-50 text-red-500 border border-red-100'
              : 'bg-surface text-primary/55 hover:bg-red-50 hover:text-red-500 border border-transparent'
          )}
        >
          <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
          {nbLikes > 0 && <span>{nbLikes}</span>}
        </button>

        <button
          onClick={handleToggleComments}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-surface text-primary/55 hover:bg-primary/5 hover:text-primary border border-transparent transition-all"
        >
          <MessageCircle size={15} />
          {post.nb_commentaires > 0 && <span>{post.nb_commentaires}</span>}
          <span>Commenter</span>
          <ChevronDown size={12} className={cn('transition-transform', showComments && 'rotate-180')} />
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-surface-container-high px-4 pb-4 pt-3 space-y-3 bg-surface">
          {loadingCom ? (
            <div className="flex justify-center py-4">
              <Loader2 size={20} className="animate-spin text-primary/40" />
            </div>
          ) : (
            <>
              {commentaires.length === 0 && (
                <p className="text-xs text-primary/35 font-semibold text-center py-2">Aucun commentaire pour l'instant</p>
              )}
              {commentaires.map(c => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar nom={c.auteur_nom} photo={c.auteur_photo} size={30} />
                  <div className="flex-1 bg-white rounded-xl border border-surface-container-high px-3 py-2">
                    <p className="text-[11px] font-bold text-primary">{c.auteur_nom}</p>
                    <p className="text-xs text-primary/75 mt-0.5 leading-relaxed">{c.contenu}</p>
                    <p className="text-[10px] text-primary/30 mt-1">{timeAgo(c.date_commentaire)}</p>
                  </div>
                </div>
              ))}

              {/* Add comment */}
              <div className="flex gap-2 pt-1">
                <Avatar nom={post.auteur_nom} size={30} />
                <div className="flex-1 flex items-center gap-2 bg-white border border-surface-container-high rounded-xl px-3 py-1.5">
                  <input
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
                    placeholder="Écrire un commentaire..."
                    className="flex-1 bg-transparent outline-none text-xs font-medium text-primary placeholder:text-primary/35"
                  />
                  <button
                    onClick={handleSendComment}
                    disabled={!newComment.trim() || sendingCom}
                    className="text-primary/40 hover:text-primary transition-colors disabled:opacity-40"
                  >
                    {sendingCom ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
}

/* ── Modal Créer Post ───────────────────────────────────────────────────── */
function CreatePostModal({
  onClose,
  onCreated,
  user,
}: {
  onClose: () => void;
  onCreated: (post: PostData) => void;
  user: { nom: string; photo_profil?: string };
}) {
  const { showToast } = useToast();
  const [contenu, setContenu] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showToast('La photo ne doit pas dépasser 10 Mo'); return; }

    setPhotoError(false);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
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
      setPhotoUrl(data.url);
    } catch (err: any) {
      setPhotoError(true);
      showToast(`Échec upload : ${err?.message || 'erreur réseau'}`);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = () => {
    setPhotoPreview('');
    setPhotoUrl('');
    setPhotoError(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!contenu.trim()) return;
    setLoading(true);
    try {
      const res = await creerPost(contenu.trim(), photoUrl || undefined);
      if (res?.post) onCreated(res.post);
      onClose();
    } catch {
      showToast('Erreur lors de la publication');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl z-10">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-surface-container-high">
          <h2 className="font-black text-lg text-primary">Nouvelle publication</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface transition-colors">
            <X size={18} className="text-primary/60" />
          </button>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 px-5 pt-4">
          <Avatar nom={user.nom} photo={user.photo_profil} size={42} />
          <div>
            <p className="font-bold text-sm text-primary">{user.nom}</p>
            <p className="text-[11px] text-primary/45 font-semibold">Publication publique</p>
          </div>
        </div>

        {/* Textarea */}
        <div className="px-5 py-3">
          <textarea
            ref={textareaRef}
            value={contenu}
            onChange={e => setContenu(e.target.value)}
            placeholder="Partagez vos cultures, récoltes, conseils agricoles..."
            rows={4}
            className="w-full outline-none resize-none text-sm text-primary placeholder:text-primary/30 font-medium leading-relaxed"
          />
        </div>

        {/* Photo preview */}
        {photoPreview && (
          <div className="px-5 pb-3">
            <div className={cn(
              'relative rounded-2xl overflow-hidden border-2',
              photoError ? 'border-red-400' : 'border-surface-container-high'
            )}>
              <img
                src={photoPreview}
                alt="Preview"
                className={cn('w-full object-cover max-h-52', photoError && 'opacity-50')}
              />
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-white text-[10px] font-bold">Envoi en cours…</span>
                </div>
              )}
              {photoError && !uploadingPhoto && (
                <div className="absolute inset-0 bg-red-500/15 flex items-center justify-center">
                  <span className="bg-white/90 text-red-700 text-xs font-black px-3 py-1.5 rounded-full shadow-sm">
                    ✕ Échec — toucher "Changer" pour réessayer
                  </span>
                </div>
              )}
              {photoUrl && !uploadingPhoto && !photoError && (
                <span className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  ✓ Prête
                </span>
              )}
              <button
                onClick={removePhoto}
                className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-lg shadow-sm"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="sr-only"
        />

        {/* Footer */}
        <div className="flex items-center justify-between px-5 pb-5 pt-2 border-t border-surface-container-high">
          <button
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border',
              photoPreview
                ? 'bg-primary/5 text-primary border-primary/20'
                : 'bg-surface text-primary/50 border-surface-container-high hover:text-primary hover:bg-primary/5'
            )}
          >
            <ImageIcon size={14} />
            {photoPreview ? 'Changer' : 'Photo'}
          </button>

          <button
            onClick={handleSubmit}
            disabled={!contenu.trim() || loading || uploadingPhoto}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-50 transition-all shadow-sm"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            Publier
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page principale Feed ───────────────────────────────────────────────── */
const Feed = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadPosts = async (p = 1, replace = false) => {
    setLoading(true);
    try {
      const data = await getFeed(p);
      const list = Array.isArray(data) ? data : [];
      if (replace) {
        setPosts(list);
      } else {
        setPosts(prev => [...prev, ...list]);
      }
      setHasMore(list.length === 20);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPosts(1, true);
  }, []);

  const handlePostCreated = (post: PostData) => {
    setPosts(prev => [post, ...prev]);
    showToast('Publication créée !');
  };

  const handleDelete = async (id: number) => {
    try {
      await supprimerPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      showToast('Publication supprimée');
    } catch {
      showToast('Impossible de supprimer');
    }
  };

  const handleLike = (_id: number) => {
    // local state already updated in PostCard
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadPosts(next, false);
  };

  return (
    <div className="min-h-screen bg-surface pb-28">

      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 py-3 border-b border-white/10"
        style={{ background: 'linear-gradient(150deg, #012d1d 0%, #1b4332 100%)' }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-black text-xl text-white tracking-tight">Fil d'actualité</h1>
            <p className="text-white/50 text-[11px] font-semibold">Publications de la communauté</p>
          </div>
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/10 transition-all"
            >
              <Plus size={14} />
              Publier
            </button>
          )}
        </div>
      </div>

      {/* Create post shortcut */}
      {user && (
        <div className="max-w-lg mx-auto px-4 pt-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center gap-3 bg-white rounded-2xl border border-surface-container-high px-4 py-3 shadow-sm hover:shadow-md transition-all group"
          >
            <Avatar nom={user.nom} photo={user.photo_profil} size={38} />
            <span className="flex-1 text-left text-sm text-primary/35 font-medium group-hover:text-primary/50 transition-colors">
              Partagez vos actualités, récoltes, conseils...
            </span>
          </button>
        </div>
      )}

      {/* Posts list */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {loading && posts.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-surface-container-high p-4 space-y-3 animate-pulse">
              <div className="flex gap-3">
                <div className="w-11 h-11 rounded-full bg-surface-container" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-surface-container rounded-full w-1/3" />
                  <div className="h-2 bg-surface-container rounded-full w-1/4" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-surface-container rounded-full" />
                <div className="h-3 bg-surface-container rounded-full w-5/6" />
                <div className="h-3 bg-surface-container rounded-full w-3/4" />
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-primary/30">
            <Sprout size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold text-base">Aucune publication pour l'instant</p>
            <p className="text-sm mt-1">Soyez le premier à partager !</p>
          </div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onDelete={handleDelete}
                onLike={handleLike}
              />
            ))}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full py-3 rounded-2xl border border-dashed border-surface-container-high text-xs font-bold text-primary/40 hover:text-primary hover:border-primary/30 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : 'Voir plus de publications'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Create post modal */}
      {showCreateModal && user && (
        <CreatePostModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onCreated={handlePostCreated}
        />
      )}
    </div>
  );
};

export { Feed };
