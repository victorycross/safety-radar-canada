
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { logSecurityEvent, SecurityEvents, detectSuspiciousActivity } from '@/utils/securityAudit';
import { useToast } from '@/hooks/use-toast';

export const useSecurityEnhancedAuth = () => {
  const auth = useAuth();
  const { toast } = useToast();
  const [securityStatus, setSecurityStatus] = useState({
    sessionValid: true,
    suspiciousActivity: false,
    lastSecurityCheck: Date.now()
  });

  // Enhanced sign in with security logging
  const secureSignIn = async (email: string, password: string) => {
    try {
      // Check for suspicious activity before allowing login
      const isSuspicious = await detectSuspiciousActivity();
      if (isSuspicious) {
        toast({
          title: 'Security Alert',
          description: 'Suspicious activity detected. Please try again later.',
          variant: 'destructive'
        });
        return { error: new Error('Suspicious activity detected') };
      }

      const result = await auth.signIn(email, password);
      
      if (!result.error) {
        await logSecurityEvent({
          action: SecurityEvents.LOGIN_SUCCESS,
          new_values: { email, timestamp: new Date().toISOString() }
        });
      }
      
      return result;
    } catch (error) {
      await logSecurityEvent({
        action: SecurityEvents.LOGIN_FAILURE,
        new_values: { email, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  };

  // Enhanced sign out with security logging
  const secureSignOut = async () => {
    try {
      await logSecurityEvent({
        action: SecurityEvents.LOGOUT,
        new_values: { timestamp: new Date().toISOString() }
      });
      
      await auth.signOut();
    } catch (error) {
      console.error('Secure sign out error:', error);
      throw error;
    }
  };

  // Periodic security checks
  useEffect(() => {
    if (!auth.user) return;

    const performSecurityCheck = async () => {
      try {
        // Check for suspicious activity
        const isSuspicious = await detectSuspiciousActivity(auth.user?.id);
        
        setSecurityStatus(prev => ({
          ...prev,
          suspiciousActivity: isSuspicious,
          lastSecurityCheck: Date.now()
        }));

        if (isSuspicious) {
          toast({
            title: 'Security Warning',
            description: 'Unusual activity detected on your account. Please verify your identity.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Security check failed:', error);
      }
    };

    // Perform initial check
    performSecurityCheck();

    // Set up periodic checks (every 5 minutes)
    const interval = setInterval(performSecurityCheck, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [auth.user, toast]);

  // Monitor for role changes
  useEffect(() => {
    if (!auth.user) return;

    const previousRoles = auth.userRoles.slice();
    
    const checkRoleChanges = () => {
      const currentRoles = auth.userRoles;
      
      // Check if roles have changed
      if (JSON.stringify(previousRoles.sort()) !== JSON.stringify(currentRoles.sort())) {
        logSecurityEvent({
          action: SecurityEvents.USER_ROLE_CHANGE,
          new_values: { 
            previous_roles: previousRoles,
            current_roles: currentRoles,
            user_id: auth.user?.id
          }
        });
      }
    };

    checkRoleChanges();
  }, [auth.userRoles, auth.user]);

  return {
    ...auth,
    signIn: secureSignIn,
    signOut: secureSignOut,
    securityStatus
  };
};
