const BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api(endpoint: string, method = 'GET', body?: object): Promise<any> {
  const token = localStorage.getItem('agrinova_token');
  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.detail || `Erreur ${res.status}`;
    if (res.status === 401) {
      localStorage.removeItem('agrinova_token');
      localStorage.removeItem('agrinova_user');
    }
    throw new ApiError(res.status, message);
  }

  return data;
}

export async function apiSafe(endpoint: string, method = 'GET', body?: object): Promise<any> {
  try {
    return await api(endpoint, method, body);
  } catch (e) {
    return null;
  }
}

// Bot endpoints
export const botChat = (message: string) => api('/bot/chat', 'POST', { message });
export const botHistorique = () => api('/bot/historique');
export const botReset = () => api('/bot/reset', 'DELETE');

// Feed endpoints
export const getFeed = (page = 1) => api(`/feed?page=${page}`);
export const creerPost = (contenu: string, photo?: string) =>
  api('/posts', 'POST', { contenu, photo });
export const supprimerPost = (id: number) => api(`/posts/${id}`, 'DELETE');
export const toggleLike = (id: number) => api(`/posts/${id}/like`, 'POST');
export const getCommentaires = (id: number) => api(`/posts/${id}/commentaires`);
export const ajouterCommentaire = (id: number, contenu: string) =>
  api(`/posts/${id}/commentaires`, 'POST', { contenu });

// Search
export const rechercheGlobale = (q: string) => api(`/recherche?q=${encodeURIComponent(q)}`);

// Farmer profiles
export const getAgriculteurs = (recherche?: string) =>
  api(`/agriculteurs${recherche ? `?recherche=${encodeURIComponent(recherche)}` : ''}`);
export const getProfilPublic = (userId: number) => api(`/profil/${userId}`);
