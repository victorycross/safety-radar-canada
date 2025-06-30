
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { logSecurityEvent, SecurityEvents } from '@/utils/securityAudit';
import { supabase } from '@/integrations/supabase/client';

interface SessionSecurityManagerProps {
  sessionTimeoutMs?: number;
  inactivityTimeoutMs?: number;
}

export const SessionSecurityManager: React.FC<SessionSecurityManagerProps> = ({
  sessionTimeoutMs = 24 * 60 * 60 * 1000, // 24 hours
  inactivityTimeoutMs = 30 * 60 * 1000 // 30 minutes
}) => {
  const { user, signOut } = useAuth();

  const handleSessionTimeout = useCallback(async () => {
    await logSecurityEvent({
      action: SecurityEvents.SESSION_TIMEOUT,
      new_values: { reason: 'session_expired' }
    });
    
    await signOut();
  }, [signOut]);

  const handleInactivityTimeout = useCallback(async () => {
    await logSecurityEvent({
      action: SecurityEvents.SESSION_TIMEOUT,
      new_values: { reason: 'inactivity_timeout' }
    });
    
    await signOut();
  }, [signOut]);

  // Track user activity
  useEffect(() => {
    if (!user) return;

    let sessionTimeout: NodeJS.Timeout;
    let inactivityTimeout: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(handleInactivityTimeout, inactivityTimeoutMs);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Set up activity listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    // Set session timeout
    sessionTimeout = setTimeout(handleSessionTimeout, sessionTimeoutMs);
    
    // Initialize inactivity timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      clearTimeout(sessionTimeout);
      clearTimeout(inactivityTimeout);
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
    };
  }, [user, sessionTimeoutMs, inactivityTimeoutMs, handleSessionTimeout, handleInactivityTimeout]);

  // Monitor for concurrent sessions
  useEffect(() => {
    if (!user) return;

    const checkConcurrentSessions = async () => {
      const sessionKey = `session_monitor_${user.id}`;
      const currentSessionId = user.aud + '_' + Date.now();
      
      const existingSession = localStorage.getItem(sessionKey);
      
      if (existingSession && existingSession !== currentSessionId) {
        await logSecurityEvent({
          action: SecurityEvents.CONCURRENT_SESSION,
          new_values: {
            existing_session: existingSession,
            current_session: currentSessionId
          }
        });
      }
      
      localStorage.setItem(sessionKey, currentSessionId);
    };

    checkConcurrentSessions();
    
    // Check periodically for concurrent sessions
    const interval = setInterval(checkConcurrentSessions, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [user]);

  // Set up session refresh
  useEffect(() => {
    if (!user) return;

    const refreshSession = async () => {
      try {
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Session refresh error:', error);
          await handleSessionTimeout();
        }
      } catch (error) {
        console.error('Session refresh failed:', error);
        await handleSessionTimeout();
      }
    };

    // Refresh session every 15 minutes
    const refreshInterval = setInterval(refreshSession, 15 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [user, handleSessionTimeout]);

  return null; // This is a utility component with no UI
};
