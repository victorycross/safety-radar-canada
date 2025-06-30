import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent, SecurityEvents } from '@/utils/securityAudit';
import { logger } from '@/utils/logger';
import { useChromeCompatibleAuth } from '@/hooks/useChromeCompatibleAuth';
import { getBrowserInfo, detectChromeIssues } from '@/utils/browserUtils';

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
  const { isChrome } = getBrowserInfo();
  const { user, session, loading } = useChromeCompatibleAuth();
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);

  logger.debug('AuthProvider: Component initialized', { isChrome });

  // Set up Chrome-specific issue detection
  useEffect(() => {
    if (isChrome) {
      detectChromeIssues();
      logger.chrome('Chrome-specific monitoring enabled');
    }
  }, [isChrome]);

  const fetchUserRoles = async (userId: string) => {
    try {
      logger.debug('AuthProvider: Fetching user roles for', userId);
      
      // Chrome-specific timeout for role fetching
      const roleTimeout = isChrome ? 8000 : 5000;
      
      const rolePromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Role fetch timeout')), roleTimeout)
      );
      
      const { data, error } = await Promise.race([
        rolePromise,
        timeoutPromise
      ]) as any;
      
      if (error) {
        logger.warn('AuthProvider: Error fetching user roles:', error);
        // Log potential security event for role fetch failures
        await logSecurityEvent({
          action: SecurityEvents.SUSPICIOUS_ACTIVITY,
          new_values: { 
            type: 'role_fetch_failure', 
            user_id: userId,
            error: error.message 
          }
        });
        setUserRoles([]);
        return;
      }
      
      const roles = data?.map((r: any) => r.role as AppRole) || [];
      logger.debug('AuthProvider: User roles fetched:', roles);
      setUserRoles(roles);
    } catch (error) {
      logger.error('AuthProvider: Error fetching user roles:', error);
      setUserRoles([]);
    }
  };

  useEffect(() => {
    if (user) {
      logger.chrome('User detected, fetching roles', { userId: user.id });
      fetchUserRoles(user.id);
    } else {
      setUserRoles([]);
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      logger.debug('AuthProvider: Attempting sign in');
      logger.chrome('Chrome sign in attempt', { email });
      
      // Enhanced input validation
      if (!email || !password) {
        const error = new Error('Email and password are required');
        await logSecurityEvent({
          action: SecurityEvents.LOGIN_FAILURE,
          new_values: { email, error: error.message }
        });
        return { error };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const error = new Error('Invalid email format');
        await logSecurityEvent({
          action: SecurityEvents.LOGIN_FAILURE,
          new_values: { email, error: error.message }
        });
        return { error };
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        logger.warn('AuthProvider: Sign in failed:', error.message);
        await logSecurityEvent({
          action: SecurityEvents.LOGIN_FAILURE,
          new_values: { email, error: error.message }
        });
      } else {
        logger.chrome('Chrome sign in successful');
        await logSecurityEvent({
          action: SecurityEvents.LOGIN_SUCCESS,
          new_values: { email }
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
    try {
      logger.debug('AuthProvider: Attempting sign up');
      logger.chrome('Chrome sign up attempt', { email });
      
      // Enhanced input validation
      if (!email || !password) {
        return { error: new Error('Email and password are required') };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { error: new Error('Invalid email format') };
      }

      // Password strength validation
      if (password.length < 8) {
        return { error: new Error('Password must be at least 8 characters long') };
      }
      
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
      
      if (!error) {
        logger.chrome('Chrome sign up successful');
        await logSecurityEvent({
          action: SecurityEvents.LOGIN_SUCCESS,
          new_values: { email, type: 'signup' }
        });
      }
      
      return { error };
    } catch (error: any) {
      logger.error('AuthProvider: Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    logger.debug('AuthProvider: Signing out');
    logger.chrome('Chrome sign out');
    
    await logSecurityEvent({
      action: SecurityEvents.LOGOUT,
      new_values: { user_id: user?.id }
    });
    
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
    rolesCount: userRoles.length,
    isChrome
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
