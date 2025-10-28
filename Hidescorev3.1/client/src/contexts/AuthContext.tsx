import { createContext, useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { User as AppUser } from "@shared/schema";

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Simplified auth: use server endpoints for email/password. Firebase and Google sign-in are disabled.
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Login failed');
      }

      const { user: u, token } = await response.json();
      if (token) localStorage.setItem('token', token);
      setUser(u);
    } catch (error: any) {
      toast({ title: 'Login error', description: error.message, variant: 'destructive' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Registration failed');
      }

      const { user: u, token } = await response.json();
      if (token) localStorage.setItem('token', token);
      setUser(u);
    } catch (error: any) {
      toast({ title: 'Registration error', description: error.message, variant: 'destructive' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    toast({ title: 'Unavailable', description: 'Google sign-in disabled.', variant: 'destructive' });
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setUser(null);
    toast({ title: 'Signed Out', description: 'You have been signed out.' });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
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
