import { createContext, useContext, useState, useEffect } from "react";
import type { User as AppUser } from "@shared/schema";

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'hidescore_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load saved user on startup
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al iniciar sesión');
    }

    const userData = await response.json();
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
