import { createContext, useContext, useState, type ReactNode } from 'react';

export interface User {
  id: number;
  nom: string;
  email: string;
  role: 'producteur' | 'acheteur';
  localisation?: string;
  telephone?: string;
  bio?: string;
  photo_profil?: string;
  note_globale?: number;
  est_verifie?: boolean;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  updateUser: (partial: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>(null!);

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem('agrinova_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('agrinova_token')
  );

  const login = (u: User, t: string) => {
    localStorage.setItem('agrinova_token', t);
    localStorage.setItem('agrinova_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const updateUser = (partial: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...partial };
    localStorage.setItem('agrinova_user', JSON.stringify(updated));
    setUser(updated);
  };

  const logout = () => {
    localStorage.removeItem('agrinova_token');
    localStorage.removeItem('agrinova_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
