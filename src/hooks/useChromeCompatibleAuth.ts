
import { useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getBrowserInfo } from '@/utils/browserUtils';
import { logger } from '@/utils/logger';

export const useChromeCompatibleAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const { isChrome } = getBrowserInfo();

  const handleAuthState = useCallback((event: string, session: Session | null) => {
    logger.chrome('Auth state change', { event, hasSession: !!session, retryCount });
    
    setSession(session);
    setUser(session?.user ?? null);
    
    if (isChrome && session) {
      // Chrome-specific session validation
      logger.chrome('Validating Chrome session', {
        hasAccessToken: !!session.access_token,
        hasRefreshToken: !!session.refresh_token,
        expiresAt: session.expires_at
      });
    }
  }, [isChrome, retryCount]);

  const initializeAuth = useCallback(async () => {
    try {
      logger.chrome('Starting auth initialization');
      
      // Chrome-specific timeout for auth operations
      const authTimeout = isChrome ? 10000 : 5000;
      
      const authPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), authTimeout)
      );
      
      const { data: { session: initialSession }, error } = await Promise.race([
        authPromise,
        timeoutPromise
      ]) as any;
      
      if (error) {
        logger.error('Auth initialization error', error);
        
        // Chrome-specific retry logic
        if (isChrome && retryCount < 3) {
          logger.chrome('Retrying auth initialization', { attempt: retryCount + 1 });
          setRetryCount(prev => prev + 1);
          setTimeout(() => initializeAuth(), 1000 * (retryCount + 1));
          return;
        }
        
        setLoading(false);
        return;
      }
      
      logger.chrome('Auth initialization successful', { hasSession: !!initialSession });
      
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
      
    } catch (error) {
      logger.error('Auth initialization failed', error);
      
      // Chrome-specific error handling
      if (isChrome && error instanceof Error && error.message === 'Auth timeout') {
        logger.chrome('Auth timeout - implementing fallback');
        
        // Fallback: try to get session from localStorage directly
        try {
          const storedSession = localStorage.getItem('sb-hablzabjqwdusajkoevb-auth-token');
          if (storedSession) {
            const parsedSession = JSON.parse(storedSession);
            logger.chrome('Using stored session fallback', { hasSession: !!parsedSession });
            setSession(parsedSession);
            setUser(parsedSession?.user ?? null);
          }
        } catch (fallbackError) {
          logger.error('Fallback session retrieval failed', fallbackError);
        }
      }
      
      setLoading(false);
    }
  }, [isChrome, retryCount]);

  useEffect(() => {
    let mounted = true;
    
    logger.chrome('Setting up Chrome-compatible auth');
    
    // Set up auth state listener with Chrome-specific handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        // Chrome-specific delays to prevent race conditions
        if (isChrome) {
          setTimeout(() => handleAuthState(event, session), 50);
        } else {
          handleAuthState(event, session);
        }
      }
    );

    // Initialize auth with Chrome-specific logic
    if (isChrome) {
      // Add small delay for Chrome to ensure DOM is ready
      setTimeout(() => {
        if (mounted) initializeAuth();
      }, 100);
    } else {
      initializeAuth();
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthState, initializeAuth, isChrome]);

  return { user, session, loading };
};
