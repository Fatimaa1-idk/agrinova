// const BASE = 'http://127.0.0.1:8000/api';
const BASE = 'https://agrinova-backend-yt2f.onrender.com/api';


export async function api(endpoint: string, method = 'GET', body?: object) {
  const token = localStorage.getItem('agrinova_token');
  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res.json();
}

// Bot API endpoints
export async function botChat(message: string) {
  return api('/bot/chat', 'POST', { message });
}

export async function botHistorique() {
  return api('/bot/historique', 'GET');
}

export async function botReset() {
  return api('/bot/reset', 'DELETE');
}
