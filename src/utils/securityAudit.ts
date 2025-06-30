
import { supabase } from '@/integrations/supabase/client';

interface AuditLogEntry {
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
}

export const logSecurityEvent = async (entry: AuditLogEntry): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const auditEntry = {
      ...entry,
      user_id: user?.id || null,
      ip_address: entry.ip_address || await getClientIP(),
      user_agent: entry.user_agent || navigator.userAgent,
      created_at: new Date().toISOString()
    };

    // Log to the security audit table
    const { error } = await supabase
      .from('security_audit_log')
      .insert([auditEntry]);

    if (error) {
      console.error('Failed to log security event:', error);
      // Fallback to console logging for critical events
      console.log('Security Event (DB Failed):', auditEntry);
    }

    // For critical security events, also create an incident for immediate attention
    if (entry.action === SecurityEvents.SUSPICIOUS_ACTIVITY || 
        entry.action === SecurityEvents.LOGIN_FAILURE) {
      await createSecurityIncident(entry, auditEntry);
    }

  } catch (error) {
    console.error('Security audit logging failed:', error);
    // Always log critical events to console as fallback
    console.log('Security Event (Exception):', entry);
  }
};

const createSecurityIncident = async (entry: AuditLogEntry, auditEntry: any) => {
  try {
    const { error } = await supabase
      .from('incidents')
      .insert([{
        title: `Security Alert: ${entry.action}`,
        description: `Automated security alert: ${entry.action}`,
        source: 'security_audit_system',
        alert_level: entry.action === SecurityEvents.SUSPICIOUS_ACTIVITY ? 'severe' : 'warning',
        province_id: '00000000-0000-0000-0000-000000000000', // Default province
        raw_payload: auditEntry,
        verification_status: 'verified'
      }]);

    if (error) {
      console.error('Failed to create security incident:', error);
    }
  } catch (error) {
    console.error('Failed to create security incident:', error);
  }
};

const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
};

// Security event types
export const SecurityEvents = {
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  LOGOUT: 'logout',
  ADMIN_ACCESS: 'admin_access',
  DATA_EXPORT: 'data_export',
  CONFIG_CHANGE: 'config_change',
  USER_ROLE_CHANGE: 'user_role_change',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  SOURCE_CONFIGURATION: 'source_configuration',
  ALERT_MANAGEMENT: 'alert_management',
  SESSION_TIMEOUT: 'session_timeout',
  CONCURRENT_SESSION: 'concurrent_session_detected',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded'
} as const;

// Enhanced suspicious activity detection
export const detectSuspiciousActivity = async (userId?: string): Promise<boolean> => {
  try {
    const timeWindow = new Date(Date.now() - 300000); // 5 minutes ago
    
    // Check for multiple failed logins
    const { data: failedLogins, error } = await supabase
      .from('security_audit_log')
      .select('*')
      .eq('action', SecurityEvents.LOGIN_FAILURE)
      .gte('created_at', timeWindow.toISOString())
      .eq('user_id', userId || 'anonymous');

    if (error) {
      console.error('Error checking suspicious activity:', error);
      return false;
    }

    if (failedLogins && failedLogins.length >= 5) {
      await logSecurityEvent({
        action: SecurityEvents.SUSPICIOUS_ACTIVITY,
        new_values: { 
          type: 'multiple_login_failures', 
          count: failedLogins.length,
          user_id: userId
        }
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error in suspicious activity detection:', error);
    return false;
  }
};

// Rate limiting with database persistence
export const checkRateLimit = async (
  userId: string, 
  action: string, 
  maxAttempts: number = 10, 
  windowMs: number = 60000
): Promise<boolean> => {
  try {
    const timeWindow = new Date(Date.now() - windowMs);
    
    const { data: attempts, error } = await supabase
      .from('security_audit_log')
      .select('*')
      .eq('user_id', userId)
      .eq('action', action)
      .gte('created_at', timeWindow.toISOString());

    if (error) {
      console.error('Error checking rate limit:', error);
      return true; // Allow on error to prevent blocking legitimate users
    }

    const currentAttempts = attempts?.length || 0;
    
    if (currentAttempts >= maxAttempts) {
      await logSecurityEvent({
        action: SecurityEvents.RATE_LIMIT_EXCEEDED,
        new_values: { 
          attempted_action: action,
          attempts: currentAttempts,
          max_allowed: maxAttempts
        }
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in rate limit check:', error);
    return true; // Allow on error
  }
};

// Session security monitoring
export const monitorSession = async (): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return;

  // Check for concurrent sessions (simplified check)
  const sessionKey = `session_${session.user.id}`;
  const currentSessionId = session.access_token.slice(-10); // Last 10 chars as identifier
  
  const existingSession = localStorage.getItem(sessionKey);
  
  if (existingSession && existingSession !== currentSessionId) {
    await logSecurityEvent({
      action: SecurityEvents.CONCURRENT_SESSION,
      new_values: {
        existing_session: existingSession,
        new_session: currentSessionId
      }
    });
  }
  
  localStorage.setItem(sessionKey, currentSessionId);
};

// Clean up old audit logs (for data retention)
export const cleanupOldAuditLogs = async (retentionDays: number = 90): Promise<void> => {
  try {
    const cutoffDate = new Date(Date.now() - (retentionDays * 24 * 60 * 60 * 1000));
    
    const { error } = await supabase
      .from('security_audit_log')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('Error cleaning up old audit logs:', error);
    }
  } catch (error) {
    console.error('Error in audit log cleanup:', error);
  }
};
