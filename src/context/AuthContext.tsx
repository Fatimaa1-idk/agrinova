import { createContext, useContext, useState, type ReactNode } from 'react';

export interface User {
  id: number;
  nom: string;
  email: string;
  role: 'producteur' | 'acheteur';
  localisation?: string;
  telephone?: string;
  bio?: string;
  note_globale?: number;
}

interface AuthContextValue {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    JSON.parse(localStorage.getItem('agrinova_user') || 'null')
  );

  const login = (u: User) => {
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('agrinova_token');
    localStorage.removeItem('agrinova_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
