import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import { DB_TO_UI_ROLE_MAP } from '../constants/roles';

type UIRole = 'ADMIN' | 'SCOUT' | 'REGISTRAR' | 'VIEWER';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  role: UIRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UIRole | null>(null);

  const fetchRole = async (userId: string): Promise<UIRole | null> => {
    try {
      const profile = await authService.getUserProfile(userId);
      return DB_TO_UI_ROLE_MAP[profile.role] || null;
    } catch (err) {
      console.error("Failed to load user role:", err);
      return null;
    }
  };

  useEffect(() => {
    // 1. Register listener FIRST to avoid missing events
    const { data: { subscription } } = authService.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const uiRole = await fetchRole(currentSession.user.id);
        setRole(uiRole);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    // 2. THEN fetch initial session
    authService.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        const uiRole = await fetchRole(initialSession.user.id);
        setRole(uiRole);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await authService.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, role }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
