
import { useAuth } from '@/components/auth/AuthProvider';
import { logSecurityEvent, SecurityEvents } from '@/utils/securityAudit';
import { validateTextInput, createRateLimiter } from '@/utils/inputValidation';
import { useToast } from '@/hooks/use-toast';

// Create rate limiters for different operations
const adminActionLimiter = createRateLimiter(10, 60000); // 10 actions per minute
const generalActionLimiter = createRateLimiter(50, 60000); // 50 actions per minute

export const useSecurityMiddleware = () => {
  const { user, isAdmin, isPowerUserOrAdmin } = useAuth();
  const { toast } = useToast();

  const validateAndExecute = async <T,>(
    operation: () => Promise<T>,
    options: {
      requireAuth?: boolean;
      requireAdmin?: boolean;
      requirePowerUser?: boolean;
      auditAction?: string;
      auditTable?: string;
      rateLimit?: 'admin' | 'general' | 'none';
      validateInputs?: { [key: string]: any };
    } = {}
  ): Promise<T | null> => {
    const {
      requireAuth = true,
      requireAdmin = false,
      requirePowerUser = false,
      auditAction,
      auditTable,
      rateLimit = 'general',
      validateInputs = {}
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

      // Authorization checks
      if (requireAdmin && !isAdmin()) {
        toast({
          title: 'Access Denied',
          description: 'Administrator privileges required.',
          variant: 'destructive',
        });
        
        logSecurityEvent({
          action: SecurityEvents.SUSPICIOUS_ACTIVITY,
          new_values: { 
            type: 'unauthorized_admin_access_attempt',
            user_id: user?.id 
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
        
        logSecurityEvent({
          action: SecurityEvents.SUSPICIOUS_ACTIVITY,
          new_values: { 
            type: 'unauthorized_power_user_access_attempt',
            user_id: user?.id 
          }
        });
        
        return null;
      }

      // Rate limiting
      if (rateLimit === 'admin' && !adminActionLimiter()) {
        toast({
          title: 'Rate Limit Exceeded',
          description: 'Too many admin actions. Please wait before trying again.',
          variant: 'destructive',
        });
        return null;
      }

      if (rateLimit === 'general' && !generalActionLimiter()) {
        toast({
          title: 'Rate Limit Exceeded',
          description: 'Too many requests. Please wait before trying again.',
          variant: 'destructive',
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
        logSecurityEvent({
          action: auditAction,
          table_name: auditTable,
          new_values: { success: true, user_id: user?.id }
        });
      }

      return result;

    } catch (error: any) {
      console.error('Security middleware error:', error);
      
      // Log the error
      if (auditAction) {
        logSecurityEvent({
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
    logAdminAccess: () => {
      if (isAdmin()) {
        logSecurityEvent({
          action: SecurityEvents.ADMIN_ACCESS,
          new_values: { page: window.location.pathname }
        });
      }
    }
  };
};
