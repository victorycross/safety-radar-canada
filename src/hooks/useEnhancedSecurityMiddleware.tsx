
import { useAuth } from '@/components/auth/AuthProvider';
import { logSecurityEvent, SecurityEvents, detectSuspiciousActivity, checkRateLimit, monitorSession } from '@/utils/securityAudit';
import { validateTextInput, createRateLimiter } from '@/utils/inputValidation';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

// Enhanced security middleware with database-backed rate limiting
export const useEnhancedSecurityMiddleware = () => {
  const { user, isAdmin, isPowerUserOrAdmin } = useAuth();
  const { toast } = useToast();

  // Monitor session on component mount
  useEffect(() => {
    if (user) {
      monitorSession();
      
      // Set up session monitoring interval
      const interval = setInterval(monitorSession, 30000); // Check every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const validateAndExecute = async <T,>(
    operation: () => Promise<T>,
    options: {
      requireAuth?: boolean;
      requireAdmin?: boolean;
      requirePowerUser?: boolean;
      auditAction?: string;
      auditTable?: string;
      rateLimit?: { maxAttempts: number; windowMs: number };
      validateInputs?: { [key: string]: any };
      skipSuspiciousActivityCheck?: boolean;
    } = {}
  ): Promise<T | null> => {
    const {
      requireAuth = true,
      requireAdmin = false,
      requirePowerUser = false,
      auditAction,
      auditTable,
      rateLimit,
      validateInputs = {},
      skipSuspiciousActivityCheck = false
    } = options;

    try {
      // Authentication check
      if (requireAuth && !user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to perform this action.',
          variant: 'destructive',
        });
        return null;
      }

      // Check for suspicious activity first
      if (user && !skipSuspiciousActivityCheck) {
        const isSuspicious = await detectSuspiciousActivity(user.id);
        if (isSuspicious) {
          toast({
            title: 'Security Alert',
            description: 'Suspicious activity detected. Please contact support.',
            variant: 'destructive',
          });
          return null;
        }
      }

      // Database-backed rate limiting
      if (user && rateLimit && auditAction) {
        const canProceed = await checkRateLimit(
          user.id, 
          auditAction, 
          rateLimit.maxAttempts, 
          rateLimit.windowMs
        );
        
        if (!canProceed) {
          toast({
            title: 'Rate Limit Exceeded',
            description: 'Too many requests. Please wait before trying again.',
            variant: 'destructive',
          });
          return null;
        }
      }

      // Authorization checks
      if (requireAdmin && !isAdmin()) {
        toast({
          title: 'Access Denied',
          description: 'Administrator privileges required.',
          variant: 'destructive',
        });
        
        await logSecurityEvent({
          action: SecurityEvents.SUSPICIOUS_ACTIVITY,
          new_values: { 
            type: 'unauthorized_admin_access_attempt',
            user_id: user?.id,
            attempted_action: auditAction
          }
        });
        
        return null;
      }

      if (requirePowerUser && !isPowerUserOrAdmin()) {
        toast({
          title: 'Access Denied',
          description: 'Power User or Administrator privileges required.',
          variant: 'destructive',
        });
        
        await logSecurityEvent({
          action: SecurityEvents.SUSPICIOUS_ACTIVITY,
          new_values: { 
            type: 'unauthorized_power_user_access_attempt',
            user_id: user?.id,
            attempted_action: auditAction
          }
        });
        
        return null;
      }

      // Input validation
      for (const [key, value] of Object.entries(validateInputs)) {
        if (typeof value === 'string') {
          const validation = validateTextInput(value, { required: true, maxLength: 1000 });
          if (!validation.isValid) {
            toast({
              title: 'Invalid Input',
              description: `${key}: ${validation.error}`,
              variant: 'destructive',
            });
            return null;
          }
        }
      }

      // Execute the operation
      const result = await operation();

      // Audit logging
      if (auditAction) {
        await logSecurityEvent({
          action: auditAction,
          table_name: auditTable,
          new_values: { success: true, user_id: user?.id }
        });
      }

      return result;

    } catch (error: any) {
      console.error('Enhanced security middleware error:', error);
      
      // Log the error
      if (auditAction) {
        await logSecurityEvent({
          action: auditAction,
          table_name: auditTable,
          new_values: { 
            success: false, 
            error: error.message,
            user_id: user?.id 
          }
        });
      }

      toast({
        title: 'Operation Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });

      return null;
    }
  };

  return {
    validateAndExecute,
    logAdminAccess: async () => {
      if (isAdmin()) {
        await logSecurityEvent({
          action: SecurityEvents.ADMIN_ACCESS,
          new_values: { page: window.location.pathname }
        });
      }
    },
    logConfigChange: async (configType: string, changes: any) => {
      await logSecurityEvent({
        action: SecurityEvents.CONFIG_CHANGE,
        new_values: { config_type: configType, changes }
      });
    }
  };
};
