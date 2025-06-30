
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent, SecurityEvents } from '@/utils/securityAudit';

export type AppRole = 'admin' | 'power_user' | 'regular_user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRoles: AppRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  isAdmin: () => boolean;
  isPowerUserOrAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      const roles = data?.map(r => r.role as AppRole) || [];
      setUserRoles(roles);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setUserRoles([]);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user roles after setting user
          setTimeout(() => {
            fetchUserRoles(session.user.id);
          }, 0);
          
          // Log successful authentication
          if (event === 'SIGNED_IN') {
            logSecurityEvent({
              action: SecurityEvents.LOGIN_SUCCESS,
              new_values: { user_id: session.user.id, email: session.user.email }
            });
          }
        } else {
          setUserRoles([]);
          
          // Log logout
          if (event === 'SIGNED_OUT') {
            logSecurityEvent({
              action: SecurityEvents.LOGOUT
            });
          }
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRoles(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Log failed login attempt
        logSecurityEvent({
          action: SecurityEvents.LOGIN_FAILURE,
          new_values: { email, error: error.message }
        });
      }
      
      return { error };
    } catch (error: any) {
      logSecurityEvent({
        action: SecurityEvents.LOGIN_FAILURE,
        new_values: { email, error: error.message }
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || email
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (role: AppRole): boolean => {
    return userRoles.includes(role);
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const isPowerUserOrAdmin = (): boolean => {
    return hasRole('admin') || hasRole('power_user');
  };

  const value = {
    user,
    session,
    userRoles,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin,
    isPowerUserOrAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
