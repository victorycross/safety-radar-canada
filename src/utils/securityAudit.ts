
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
      timestamp: new Date().toISOString()
    };

    // Log to console for now since security_audit_log table doesn't exist yet
    console.log('Security Event:', auditEntry);
    
    // TODO: Implement proper audit logging when security_audit_log table is available
    // For now, we'll use the incidents table as a temporary workaround for critical events
    if (entry.action === SecurityEvents.SUSPICIOUS_ACTIVITY) {
      const { error } = await supabase
        .from('incidents')
        .insert([{
          title: 'Security Alert',
          description: `Security event: ${entry.action}`,
          source: 'security_audit',
          alert_level: 'warning',
          province_id: '00000000-0000-0000-0000-000000000000', // Default province
          raw_payload: auditEntry
        }]);

      if (error) {
        console.error('Failed to log security event to incidents:', error);
      }
    }
  } catch (error) {
    console.error('Security audit logging failed:', error);
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
  ALERT_MANAGEMENT: 'alert_management'
} as const;

// Monitor for suspicious activity patterns
export const detectSuspiciousActivity = (events: any[]): boolean => {
  // Multiple failed login attempts
  const recentFailures = events.filter(e => 
    e.action === SecurityEvents.LOGIN_FAILURE && 
    Date.now() - new Date(e.created_at).getTime() < 300000 // 5 minutes
  );
  
  if (recentFailures.length >= 5) {
    logSecurityEvent({
      action: SecurityEvents.SUSPICIOUS_ACTIVITY,
      new_values: { 
        type: 'multiple_login_failures', 
        count: recentFailures.length 
      }
    });
    return true;
  }
  
  return false;
};
