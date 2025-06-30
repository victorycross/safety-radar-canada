
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent, SecurityEvents } from '@/utils/securityAudit';

export interface SecurityCheck {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class SecurityService {
  // Rate limiting storage
  private static rateLimitStore = new Map<string, number[]>();

  static async checkTableRLS(): Promise<SecurityCheck> {
    const result: SecurityCheck = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      const { data, error } = await supabase.rpc('verify_rls_coverage');
      
      if (error) {
        result.errors.push(`Failed to check RLS coverage: ${error.message}`);
        result.isValid = false;
        return result;
      }

      if (data) {
        data.forEach((table: any) => {
          if (!table.rls_enabled) {
            result.warnings.push(`Table ${table.table_name} does not have RLS enabled`);
          }
          if (table.policy_count === 0) {
            result.warnings.push(`Table ${table.table_name} has no RLS policies`);
          }
        });
      }
    } catch (error) {
      result.errors.push(`Security check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.isValid = false;
    }

    return result;
  }

  static async checkUserPermissions(userId: string): Promise<SecurityCheck> {
    const result: SecurityCheck = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Check if user exists in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        result.errors.push(`Failed to check user profile: ${profileError.message}`);
        result.isValid = false;
      }

      if (!profile) {
        result.warnings.push('User profile not found');
      }

      // Check user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        result.errors.push(`Failed to check user roles: ${rolesError.message}`);
        result.isValid = false;
      }

      if (!roles || roles.length === 0) {
        result.warnings.push('User has no assigned roles');
      }

    } catch (error) {
      result.errors.push(`Permission check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.isValid = false;
    }

    return result;
  }

  static checkRateLimit(identifier: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing attempts for this identifier
    const attempts = this.rateLimitStore.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(timestamp => timestamp > windowStart);
    
    // Check if we're within the limit
    if (validAttempts.length >= maxAttempts) {
      logSecurityEvent({
        action: SecurityEvents.RATE_LIMIT_EXCEEDED,
        new_values: { 
          identifier,
          attempts: validAttempts.length,
          max_allowed: maxAttempts
        }
      });
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.rateLimitStore.set(identifier, validAttempts);
    
    return true;
  }

  static async validateSession(): Promise<SecurityCheck> {
    const result: SecurityCheck = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        result.errors.push(`Session validation failed: ${error.message}`);
        result.isValid = false;
        return result;
      }

      if (!session) {
        result.errors.push('No active session found');
        result.isValid = false;
        return result;
      }

      // Check if session is close to expiring (within 5 minutes)
      const expiresAt = new Date(session.expires_at! * 1000);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      
      if (timeUntilExpiry < 5 * 60 * 1000) { // 5 minutes
        result.warnings.push('Session expires soon');
      }

      // Log successful session validation
      await logSecurityEvent({
        action: 'session_validated',
        new_values: {
          user_id: session.user.id,
          expires_at: session.expires_at
        }
      });

    } catch (error) {
      result.errors.push(`Session check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.isValid = false;
    }

    return result;
  }

  static sanitizeUserInput(input: string): string {
    // Remove potential XSS patterns
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  static async logSecurityAction(action: string, details: any = {}): Promise<void> {
    try {
      await logSecurityEvent({
        action,
        new_values: details
      });
    } catch (error) {
      console.error('Failed to log security action:', error);
    }
  }
}
