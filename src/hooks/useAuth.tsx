import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  role: 'ADMIN' | 'SCOUT' | 'REGISTRAR' | 'VIEWER' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'ADMIN' | 'SCOUT' | 'REGISTRAR' | 'VIEWER' | null>(null);

  useEffect(() => {
    // 1. Initial Session Check
    const initAuth = async () => {
      const { data: { session: initialSession } } = await authService.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        try {
          const profile = await authService.getUserProfile(initialSession.user.id);
          const roleMap: Record<string, 'ADMIN' | 'SCOUT' | 'REGISTRAR' | 'VIEWER'> = {
            'super_admin': 'ADMIN',
            'provincial_admin': 'ADMIN',
            'match_commissioner': 'REGISTRAR',
            'data_operator': 'REGISTRAR',
            'scout': 'SCOUT',
          };
          setRole(roleMap[profile.role] || 'VIEWER');
        } catch (err) {
          console.error("Failed to load user role:", err);
        }
      }
      setLoading(false);
    };

    initAuth();

    // 2. Subscribe to Auth Changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        try {
          const profile = await authService.getUserProfile(currentSession.user.id);
          const roleMap: Record<string, 'ADMIN' | 'SCOUT' | 'REGISTRAR' | 'VIEWER'> = {
            'super_admin': 'ADMIN',
            'provincial_admin': 'ADMIN',
            'match_commissioner': 'REGISTRAR',
            'data_operator': 'REGISTRAR',
            'scout': 'SCOUT',
          };
          setRole(roleMap[profile.role] || 'VIEWER');
        } catch {
          setRole('VIEWER');
        }
      } else {
        setRole(null);
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
