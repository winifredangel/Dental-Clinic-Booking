import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  adminCheckCompleted: boolean;
  authError: string | null;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  checkAdminStatus: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [adminCheckCompleted, setAdminCheckCompleted] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  /**
   * Check if authenticated user.id exists in public.admin_users
   * Exact rule: check admin_users.user_id, never check by email
   */
  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      setIsAdmin(false);
      setAdminCheckCompleted(true);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error querying admin_users table:', error.message);
        setIsAdmin(false);
        setAdminCheckCompleted(true);
        return false;
      }

      const isAuthorized = Boolean(data && data.user_id === userId);
      setIsAdmin(isAuthorized);
      setAdminCheckCompleted(true);
      return isAuthorized;
    } catch (err: any) {
      console.warn('Admin verification exception:', err);
      setIsAdmin(false);
      setAdminCheckCompleted(true);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured) {
        if (mounted) {
          setLoading(false);
          setAdminCheckCompleted(true);
        }
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user && mounted) {
          setUser(session.user);
          await checkAdminStatus(session.user.id);
        } else if (mounted) {
          setUser(null);
          setIsAdmin(false);
          setAdminCheckCompleted(true);
        }
      } catch (err: any) {
        console.error('Session retrieval error:', err);
        if (mounted) {
          setUser(null);
          setIsAdmin(false);
          setAdminCheckCompleted(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setLoading(true);
      if (session?.user) {
        setUser(session.user);
        await checkAdminStatus(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
        setAdminCheckCompleted(true);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);

    if (!isSupabaseConfigured) {
      const err = 'Supabase credentials are not yet configured in .env (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).';
      setAuthError(err);
      return { success: false, error: err };
    }

    setLoading(true);
    setAdminCheckCompleted(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        setAuthError(error.message);
        setLoading(false);
        setAdminCheckCompleted(true);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        const err = 'No user record returned from sign in.';
        setAuthError(err);
        setLoading(false);
        setAdminCheckCompleted(true);
        return { success: false, error: err };
      }

      setUser(data.user);

      // Verify admin status via admin_users.user_id
      const authorized = await checkAdminStatus(data.user.id);

      setLoading(false);
      setAdminCheckCompleted(true);

      if (!authorized) {
        const unauthMsg = 'You are signed in, but you are not authorized as an admin.';
        setAuthError(unauthMsg);
        return { success: false, error: unauthMsg };
      }

      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed. Please check credentials.';
      setAuthError(msg);
      setLoading(false);
      setAdminCheckCompleted(true);
      return { success: false, error: msg };
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setUser(null);
      setIsAdmin(false);
      setAdminCheckCompleted(true);
      setAuthError(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        adminCheckCompleted,
        authError,
        signIn,
        signOut,
        checkAdminStatus,
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
