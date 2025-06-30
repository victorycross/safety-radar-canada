
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent, SecurityEvents } from '@/utils/securityAudit';
import { logger } from '@/utils/logger';

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

  logger.debug('AuthProvider: Component initialized');

  const fetchUserRoles = async (userId: string) => {
    try {
      logger.debug('AuthProvider: Fetching user roles for', userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        logger.warn('AuthProvider: Error fetching user roles:', error);
        setUserRoles([]);
        return;
      }
      
      const roles = data?.map(r => r.role as AppRole) || [];
      logger.debug('AuthProvider: User roles fetched:', roles);
      setUserRoles(roles);
    } catch (error) {
      logger.error('AuthProvider: Error fetching user roles:', error);
      setUserRoles([]);
    }
  };

  useEffect(() => {
    let mounted = true;
    logger.debug('AuthProvider: useEffect starting');

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        logger.debug('AuthProvider: Initializing auth state');
        
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('AuthProvider: Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        if (mounted) {
          logger.debug('AuthProvider: Setting initial session', { hasSession: !!initialSession });
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            await fetchUserRoles(initialSession.user.id);
          }
          
          logger.debug('AuthProvider: Auth initialization complete');
          setLoading(false);
        }
      } catch (error) {
        logger.error('AuthProvider: Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        logger.debug('AuthProvider: Auth state changed', { event, hasSession: !!session });

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserRoles(session.user.id);
          
          // Log successful authentication
          if (event === 'SIGNED_IN') {
            await logSecurityEvent({
              action: SecurityEvents.LOGIN_SUCCESS,
              new_values: { user_id: session.user.id, email: session.user.email }
            });
          }
        } else {
          setUserRoles([]);
          
          // Log logout
          if (event === 'SIGNED_OUT') {
            await logSecurityEvent({
              action: SecurityEvents.LOGOUT
            });
          }
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      logger.debug('AuthProvider: Cleaning up');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      logger.debug('AuthProvider: Attempting sign in');
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        logger.warn('AuthProvider: Sign in failed:', error.message);
        // Log failed login attempt
        await logSecurityEvent({
          action: SecurityEvents.LOGIN_FAILURE,
          new_values: { email, error: error.message }
        });
      }
      
      return { error };
    } catch (error: any) {
      logger.error('AuthProvider: Sign in error:', error);
      await logSecurityEvent({
        action: SecurityEvents.LOGIN_FAILURE,
        new_values: { email, error: error.message }
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    logger.debug('AuthProvider: Attempting sign up');
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
    logger.debug('AuthProvider: Signing out');
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

  logger.debug('AuthProvider: Rendering with state', { 
    hasUser: !!user, 
    loading, 
    rolesCount: userRoles.length 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
