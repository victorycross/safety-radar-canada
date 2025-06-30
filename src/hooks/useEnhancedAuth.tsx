
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SecurityService } from '@/services/securityService';
import { logSecurityEvent, SecurityEvents } from '@/utils/securityAudit';
import { logger } from '@/utils/logger';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  roles: string[];
  sessionExpiry: Date | null;
  securityScore: number;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  checkPermission: (permission: string) => boolean;
}

export const useEnhancedAuth = (): AuthState & AuthActions => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
    roles: [],
    sessionExpiry: null,
    securityScore: 0
  });

  const calculateSecurityScore = (user: User | null, roles: string[]): number => {
    let score = 0;
    
    if (user) {
      score += 30; // Base score for authenticated user
      
      // Email verification
      if (user.email) score += 20;
      
      // Role-based scoring
      if (roles.includes('admin')) score += 30;
      else if (roles.includes('power_user')) score += 20;
      else if (roles.includes('regular_user')) score += 10;
      
      // Additional factors could be added here
      // - 2FA enabled
      // - Recent activity
      // - Strong password (if available)
    }
    
    return Math.min(score, 100);
  };

  const loadUserRoles = async (userId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        logger.error('Failed to load user roles:', error);
        return [];
      }

      return data?.map(r => r.role) || [];
    } catch (error) {
      logger.error('Error loading user roles:', error);
      return [];
    }
  };

  const updateAuthState = async (user: User | null) => {
    if (user) {
      const roles = await loadUserRoles(user.id);
      const { data: { session } } = await supabase.auth.getSession();
      
      setAuthState({
        user,
        loading: false,
        isAuthenticated: true,
        roles,
        sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000) : null,
        securityScore: calculateSecurityScore(user, roles)
      });
    } else {
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
        roles: [],
        sessionExpiry: null,
        securityScore: 0
      });
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Rate limiting check
    const rateLimitKey = `login_${email}`;
    if (!SecurityService.checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) { // 5 attempts per 15 minutes
      await logSecurityEvent({
        action: SecurityEvents.LOGIN_FAILURE,
        new_values: { 
          email,
          reason: 'rate_limited',
          attempts: 5
        }
      });
      return { success: false, error: 'Too many login attempts. Please try again later.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: SecurityService.sanitizeUserInput(email),
        password
      });

      if (error) {
        await logSecurityEvent({
          action: SecurityEvents.LOGIN_FAILURE,
          new_values: { 
            email,
            error: error.message
          }
        });
        return { success: false, error: error.message };
      }

      if (data.user) {
        await logSecurityEvent({
          action: SecurityEvents.LOGIN_SUCCESS,
          new_values: { 
            user_id: data.user.id,
            email: data.user.email
          }
        });
        
        await updateAuthState(data.user as User);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      logger.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      if (authState.user) {
        await logSecurityEvent({
          action: SecurityEvents.LOGOUT,
          new_values: { 
            user_id: authState.user.id
          }
        });
      }

      await supabase.auth.signOut();
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
        roles: [],
        sessionExpiry: null,
        securityScore: 0
      });
    } catch (error) {
      logger.error('Sign out error:', error);
    }
  };

  const refreshSession = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        logger.error('Session refresh failed:', error);
        return;
      }

      if (data.user) {
        await updateAuthState(data.user as User);
      }
    } catch (error) {
      logger.error('Session refresh error:', error);
    }
  };

  const checkPermission = (permission: string): boolean => {
    if (!authState.isAuthenticated) return false;
    
    // Simple permission system based on roles
    const rolePermissions: Record<string, string[]> = {
      'admin': ['*'], // Admin has all permissions
      'power_user': ['read', 'write', 'manage_incidents', 'export_data'],
      'regular_user': ['read']
    };

    return authState.roles.some(role => {
      const permissions = rolePermissions[role] || [];
      return permissions.includes('*') || permissions.includes(permission);
    });
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await updateAuthState(user as User | null);
      } catch (error) {
        logger.error('Auth initialization failed:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.debug('Auth state changed:', event);
      
      if (event === 'SIGNED_OUT') {
        await updateAuthState(null);
      } else if (session?.user) {
        await updateAuthState(session.user as User);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Session monitoring
  useEffect(() => {
    if (authState.sessionExpiry && authState.isAuthenticated) {
      const checkSession = () => {
        const now = new Date();
        const timeUntilExpiry = authState.sessionExpiry!.getTime() - now.getTime();
        
        // Refresh session if it expires in the next 5 minutes
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          refreshSession();
        }
      };

      const interval = setInterval(checkSession, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [authState.sessionExpiry, authState.isAuthenticated]);

  return {
    ...authState,
    signIn,
    signOut,
    refreshSession,
    checkPermission
  };
};
