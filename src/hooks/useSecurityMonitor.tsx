
import { useEffect, useState } from 'react';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { SecurityService, SecurityCheck } from '@/services/securityService';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface SecurityMonitorState {
  sessionValid: boolean;
  permissionCheck: SecurityCheck | null;
  rlsCheck: SecurityCheck | null;
  loading: boolean;
  lastChecked: Date | null;
}

export const useSecurityMonitor = () => {
  const [securityState, setSecurityState] = useState<SecurityMonitorState>({
    sessionValid: false,
    permissionCheck: null,
    rlsCheck: null,
    loading: true,
    lastChecked: null
  });

  const runSecurityChecks = async () => {
    setSecurityState(prev => ({ ...prev, loading: true }));
    
    try {
      // Check session validity
      const sessionCheck = await SecurityService.validateSession();
      const sessionValid = sessionCheck.isValid;

      // If session is valid, run additional checks
      let permissionCheck: SecurityCheck | null = null;
      let rlsCheck: SecurityCheck | null = null;

      if (sessionValid) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          permissionCheck = await SecurityService.checkUserPermissions(user.id);
        }
        
        // Check RLS coverage (admin only)
        try {
          rlsCheck = await SecurityService.checkTableRLS();
        } catch (error) {
          logger.warn('RLS check failed (may require admin privileges)', error);
        }
      }

      setSecurityState({
        sessionValid,
        permissionCheck,
        rlsCheck,
        loading: false,
        lastChecked: new Date()
      });

    } catch (error) {
      logger.error('Security monitor failed:', error);
      setSecurityState(prev => ({
        ...prev,
        loading: false,
        sessionValid: false,
        lastChecked: new Date()
      }));
    }
  };

  // Run security checks on mount and periodically
  useEffect(() => {
    runSecurityChecks();
    
    // Run checks every 5 minutes
    const interval = setInterval(runSecurityChecks, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        runSecurityChecks();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    ...securityState,
    refreshSecurityCheck: runSecurityChecks
  };
};
