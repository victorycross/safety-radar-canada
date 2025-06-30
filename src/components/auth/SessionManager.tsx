
import React, { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { logSecurityEvent, SecurityEvents } from '@/utils/securityAudit';
import { useToast } from '@/hooks/use-toast';

interface SessionManagerProps {
  children: React.ReactNode;
  sessionTimeoutMinutes?: number;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ 
  children, 
  sessionTimeoutMinutes = 30 
}) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    let timeoutId: NodeJS.Timeout;
    let warningId: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      
      // Warning 5 minutes before timeout
      warningId = setTimeout(() => {
        toast({
          title: 'Session Expiring Soon',
          description: 'Your session will expire in 5 minutes. Please save your work.',
          variant: 'destructive',
        });
      }, (sessionTimeoutMinutes - 5) * 60 * 1000);
      
      // Actual timeout
      timeoutId = setTimeout(async () => {
        await logSecurityEvent({
          action: SecurityEvents.SESSION_TIMEOUT,
          new_values: { timeout_minutes: sessionTimeoutMinutes }
        });
        
        toast({
          title: 'Session Expired',
          description: 'Your session has expired. Please sign in again.',
          variant: 'destructive',
        });
        
        await signOut();
      }, sessionTimeoutMinutes * 60 * 1000);
    };

    // Activity event listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetTimeout();
    };

    // Set initial timeout
    resetTimeout();

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, sessionTimeoutMinutes, signOut, toast]);

  return <>{children}</>;
};
