import { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithRedirect, 
  getRedirectResult, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser 
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isConfigured = isFirebaseConfigured();

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Handle redirect result on page load
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          syncUserWithBackend(result.user);
        }
      })
      .catch((error) => {
        console.error("Redirect error:", error);
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
      });

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (firebaseUser) {
        await syncUserWithBackend(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isConfigured]);

  const syncUserWithBackend = async (firebaseUser: FirebaseUser) => {
    try {
      // Send user data to backend to create/update user record
      const response = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
          photoURL: firebaseUser.photoURL,
        }),
      });

      if (response.ok) {
        const user = await response.json();
        setUser(user);
      }
    } catch (error) {
      console.error("Error syncing user:", error);
    }
  };

  const signInWithGoogle = async () => {
    if (!isConfigured) {
      toast({
        title: "Firebase Not Configured",
        description: "Please configure Firebase credentials to enable authentication.",
        variant: "destructive",
      });
      return;
    }

    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign Out Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signInWithGoogle, signOut, isConfigured }}>
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
