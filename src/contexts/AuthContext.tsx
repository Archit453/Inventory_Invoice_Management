import { createContext, useContext, useState, useEffect, type ReactNode, type FC } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  demoUser: { id: string; email: string; fullName: string; role: UserRole } | null;
  signIn: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, pass: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInDemo: (role?: UserRole, businessName?: string) => void;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoUser, setDemoUser] = useState<{ id: string; email: string; fullName: string; role: UserRole } | null>(() => {
    const cached = localStorage.getItem('iim_demo_user_session');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    // Default to an initial Demo Owner session so the app remains instantly interactive
    return {
      id: 'demo-user-owner',
      email: 'owner@creation.studio',
      fullName: 'Alex Vance',
      role: 'owner',
    };
  });

  useEffect(() => {
    // Check initial Supabase Auth session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        setDemoUser(null);
        localStorage.removeItem('iim_demo_user_session');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    setLoading(false);
    if (!error) {
      setDemoUser(null);
      localStorage.removeItem('iim_demo_user_session');
    }
    return { error };
  };

  const signUp = async (email: string, pass: string, fullName: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    setLoading(false);
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setDemoUser(null);
    localStorage.removeItem('iim_demo_user_session');
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  const signInDemo = (role: UserRole = 'owner', businessName = 'Studio One') => {
    const demo = {
      id: `demo-user-${role}`,
      email: `${role}@${businessName.toLowerCase().replace(/\s+/g, '')}.com`,
      fullName: role === 'owner' ? 'Studio Director' : role === 'manager' ? 'Floor Manager' : role === 'cashier' ? 'Cashier Lead' : 'Technician Specialist',
      role,
    };
    setDemoUser(demo);
    localStorage.setItem('iim_demo_user_session', JSON.stringify(demo));
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        demoUser,
        signIn,
        signUp,
        signOut,
        signInDemo,
        isDemo: !user && !!demoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
