
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent, SecurityEvents } from '@/utils/securityAudit';
import { logger } from '@/utils/logger';
import { useChromeCompatibleAuth } from '@/hooks/useChromeCompatibleAuth';
import { getBrowserInfo, detectChromeIssues } from '@/utils/browserUtils';
import { SecurityService } from '@/services/securityService';
import { PasswordService } from '@/services/passwordService';

export type AppRole = 'admin' | 'power_user' | 'regular_user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRoles: AppRole[];
  loading: boolean;
  securityScore: number;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  isAdmin: () => boolean;
  isPowerUserOrAdmin: () => boolean;
  refreshSession: () => Promise<void>;
  checkPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Track failed login attempts
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

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
  const [securityScore, setSecurityScore] = useState(0);

  logger.debug('AuthProvider: Component initialized', { isChrome });

  // Set up Chrome-specific issue detection
  useEffect(() => {
    if (isChrome) {
      detectChromeIssues();
      logger.chrome('Chrome-specific monitoring enabled');
    }
  }, [isChrome]);

  const calculateSecurityScore = (user: User | null, roles: AppRole[]): number => {
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

  const isAccountLocked = (email: string): boolean => {
    const attempts = failedAttempts.get(email);
    if (!attempts) return false;
    
    const now = Date.now();
    if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
      failedAttempts.delete(email);
      return false;
    }
    
    return attempts.count >= LOCKOUT_THRESHOLD;
  };

  const recordFailedAttempt = (email: string) => {
    const now = Date.now();
    const attempts = failedAttempts.get(email) || { count: 0, lastAttempt: 0 };
    
    // Reset count if last attempt was more than lockout duration ago
    if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
      attempts.count = 0;
    }
    
    attempts.count++;
    attempts.lastAttempt = now;
    failedAttempts.set(email, attempts);
  };

  const clearFailedAttempts = (email: string) => {
    failedAttempts.delete(email);
  };

  const fetchUserRoles = async (userId: string) => {
    try {
      logger.debug('AuthProvider: Fetching user roles for', userId);
      
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
      setSecurityScore(calculateSecurityScore(user, roles));
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
      setSecurityScore(0);
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    // Check if account is locked
    if (isAccountLocked(email)) {
      const error = new Error('Account temporarily locked due to multiple failed attempts. Please try again later.');
      await logSecurityEvent({
        action: SecurityEvents.LOGIN_FAILURE,
        new_values: { 
          email,
          reason: 'account_locked',
          attempts: failedAttempts.get(email)?.count || 0
        }
      });
      return { error };
    }

    // Rate limiting check
    const rateLimitKey = `login_${email}`;
    if (!SecurityService.checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      await logSecurityEvent({
        action: SecurityEvents.LOGIN_FAILURE,
        new_values: { 
          email,
          reason: 'rate_limited',
          attempts: 5
        }
      });
      return { error: new Error('Too many login attempts. Please try again later.') };
    }

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
        email: SecurityService.sanitizeUserInput(email),
        password,
      });
      
      if (error) {
        logger.warn('AuthProvider: Sign in failed:', error.message);
        recordFailedAttempt(email);
        await logSecurityEvent({
          action: SecurityEvents.LOGIN_FAILURE,
          new_values: { 
            email, 
            error: error.message,
            failedAttempts: failedAttempts.get(email)?.count || 0
          }
        });
      } else {
        logger.chrome('Chrome sign in successful');
        clearFailedAttempts(email);
        await logSecurityEvent({
          action: SecurityEvents.LOGIN_SUCCESS,
          new_values: { email }
        });
      }
      
      return { error };
    } catch (error: any) {
      logger.error('AuthProvider: Sign in error:', error);
      recordFailedAttempt(email);
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

      // Enhanced password validation
      const passwordStrength = PasswordService.validatePassword(password);
      if (!passwordStrength.isValid) {
        return { 
          error: new Error(`Password requirements not met: ${passwordStrength.feedback.join(', ')}`) 
        };
      }
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: SecurityService.sanitizeUserInput(email),
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
          new_values: { 
            email, 
            type: 'signup',
            passwordStrength: passwordStrength.score
          }
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

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        logger.error('Session refresh failed:', error);
        return;
      }

      if (data.user) {
        await fetchUserRoles(data.user.id);
      }
    } catch (error) {
      logger.error('Session refresh error:', error);
    }
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

  const checkPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Simple permission system based on roles
    const rolePermissions: Record<string, string[]> = {
      'admin': ['*'], // Admin has all permissions
      'power_user': ['read', 'write', 'manage_incidents', 'export_data'],
      'regular_user': ['read']
    };

    return userRoles.some(role => {
      const permissions = rolePermissions[role] || [];
      return permissions.includes('*') || permissions.includes(permission);
    });
  };

  const value = {
    user,
    session,
    userRoles,
    loading,
    securityScore,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin,
    isPowerUserOrAdmin,
    refreshSession,
    checkPermission
  };

  logger.debug('AuthProvider: Rendering with state', { 
    hasUser: !!user, 
    loading, 
    rolesCount: userRoles.length,
    securityScore,
    isChrome
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
